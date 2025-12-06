#!/usr/bin/env node

/**
 * CSV update tool for bulk photo metadata updates.
 *
 * This script updates existing photo metadata from a CSV file with comprehensive validation:
 * - Validates CSV structure and data types
 * - Verifies photos exist in database
 * - Only updates columns present in CSV (flexible updates)
 * - Atomic transactions (all or nothing)
 *
 * Usage:
 *   npm run photo:update photos.csv
 *   npm run photo:update photos.csv --dry-run
 */

import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import prompts from 'prompts';
import {
  DB_PATH,
  IMAGES_BASE,
  VALID_CATEGORIES,
  type Category,
  type ValidationError,
  validateFilename,
  validateCategory,
  validateHomepageFeatured,
  validateCategoryFeatured,
  validateCountryFeatured,
  parseCSVFile,
  formatErrors,
} from './shared/validation';
import { join } from 'path';

// CSV row interface - all fields optional except identifier
interface CSVRow {
  id?: string;
  filename?: string;
  category?: string;
  caption?: string;
  location?: string;
  country?: string;
  homepage_featured?: string;
  category_featured?: string;
  country_featured?: string;
}

// Update operation tracking
interface UpdateOperation {
  filename: string;
  fields: string[];
  values: Map<string, any>;
}

/**
 * Validate a single CSV row
 */
function validateRow(
  row: CSVRow,
  rowIndex: number,
  availableColumns: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];
  const rowNum = rowIndex + 2; // +2 for header row and 1-based indexing

  // Must have either id or filename to identify record
  if (!row.id?.trim() && !row.filename?.trim()) {
    errors.push({
      row: rowNum,
      field: 'id/filename',
      message: 'Either id or filename is required to identify the photo'
    });
    return errors; // Can't validate further without identifier
  }

  // Validate filename extension if provided
  if (row.filename?.trim()) {
    const filenameError = validateFilename(row.filename, rowNum);
    if (filenameError) errors.push(filenameError);
  }

  // Validate category if provided
  if (row.category?.trim()) {
    const categoryError = validateCategory(row.category, rowNum, false);
    if (categoryError) errors.push(categoryError);
  }

  // Validate caption if column exists and value is empty (cannot be empty)
  if (availableColumns.has('caption') && row.caption !== undefined && !row.caption?.trim()) {
    errors.push({
      row: rowNum,
      field: 'caption',
      message: 'Caption cannot be empty (required for alt text)'
    });
  }

  // Validate location if column exists and value is empty (cannot be empty)
  if (availableColumns.has('location') && row.location !== undefined && !row.location?.trim()) {
    errors.push({
      row: rowNum,
      field: 'location',
      message: 'Location cannot be empty (required for alt text)'
    });
  }

  // Validate country if column exists and value is empty (cannot be empty)
  if (availableColumns.has('country') && row.country !== undefined && !row.country?.trim()) {
    errors.push({
      row: rowNum,
      field: 'country',
      message: 'Country cannot be empty (required for alt text)'
    });
  }

  // Validate featured fields
  const homepageError = validateHomepageFeatured(row.homepage_featured, rowNum);
  if (homepageError) errors.push(homepageError);

  const categoryFeaturedError = validateCategoryFeatured(row.category_featured, rowNum);
  if (categoryFeaturedError) errors.push(categoryFeaturedError);

  const countryFeaturedError = validateCountryFeatured(row.country_featured, rowNum);
  if (countryFeaturedError) errors.push(countryFeaturedError);

  // Check if photo file exists if category is provided
  if (row.filename?.trim() && row.category?.trim() && VALID_CATEGORIES.includes(row.category as Category)) {
    const photoPath = join(IMAGES_BASE, row.category, row.filename.trim());
    if (!existsSync(photoPath)) {
      errors.push({
        row: rowNum,
        field: 'filename',
        message: `Photo file not found at src/photography/${row.category}/${row.filename.trim()}`
      });
    }
  }

  return errors;
}

/**
 * Parse and validate CSV file
 */
function parseCSV(filepath: string): {
  rows: CSVRow[];
  errors: ValidationError[];
  availableColumns: Set<string>;
} {
  const errors: ValidationError[] = [];
  const records = parseCSVFile<CSVRow>(filepath);

  if (records.length === 0) {
    console.error('❌ CSV file is empty');
    process.exit(1);
  }

  // Get available columns
  const firstRow = records[0];
  const availableColumns = new Set(Object.keys(firstRow));

  // Must have either id or filename column
  if (!availableColumns.has('id') && !availableColumns.has('filename')) {
    console.error('❌ CSV must contain either "id" or "filename" column to identify photos');
    console.error('\nRequired: id OR filename');
    console.error('Optional: category, caption, location, country, homepage_featured, category_featured, country_featured');
    process.exit(1);
  }

  // Validate each row
  records.forEach((row, index) => {
    const rowErrors = validateRow(row, index, availableColumns);
    errors.push(...rowErrors);
  });

  return { rows: records, errors, availableColumns };
}

/**
 * Check that all photos exist in database
 */
function checkPhotosExist(rows: CSVRow[], db: Database.Database): ValidationError[] {
  const errors: ValidationError[] = [];

  rows.forEach((row, index) => {
    // Use id if provided, otherwise filename
    if (row.id?.trim()) {
      const id = parseInt(row.id.trim());
      if (isNaN(id)) {
        errors.push({
          row: index + 2,
          field: 'id',
          message: 'ID must be a number'
        });
        return;
      }

      const existing = db.prepare('SELECT id FROM photos WHERE id = ?').get(id);
      if (!existing) {
        errors.push({
          row: index + 2,
          field: 'id',
          message: `Photo with ID ${id} not found in database`
        });
      }
    } else if (row.filename?.trim()) {
      const filename = row.filename.trim();
      const existing = db.prepare('SELECT id FROM photos WHERE filename = ?').get(filename);
      if (!existing) {
        errors.push({
          row: index + 2,
          field: 'filename',
          message: `Photo "${filename}" not found in database`
        });
      }
    }
  });

  return errors;
}

/**
 * Build update operations from CSV rows
 */
function buildUpdateOperations(rows: CSVRow[], availableColumns: Set<string>): UpdateOperation[] {
  const operations: UpdateOperation[] = [];

  // Updateable columns (exclude id, filename, created_at)
  const updateableColumns = [
    'category',
    'caption',
    'location',
    'country',
    'homepage_featured',
    'category_featured',
    'country_featured'
  ].filter(col => availableColumns.has(col));

  rows.forEach(row => {
    const values = new Map<string, any>();
    const fields: string[] = [];

    // Collect values for updateable columns
    updateableColumns.forEach(col => {
      const value = row[col as keyof CSVRow];

      // Only update if column has a value (even empty string counts as explicit update)
      if (value !== undefined) {
        fields.push(col);

        // Handle special cases
        if (col === 'homepage_featured' || col === 'category_featured' || col === 'country_featured') {
          values.set(col, value.trim() ? parseInt(value.trim()) : null);
        } else {
          values.set(col, value.trim());
        }
      }
    });

    // Use filename as identifier (or id if filename not available)
    const identifier = row.filename?.trim() || `ID:${row.id?.trim()}`;

    operations.push({
      filename: identifier,
      fields,
      values
    });
  });

  return operations;
}

/**
 * Update photos in database
 */
async function updatePhotos(filepath: string, dryRun: boolean = false) {
  console.log('📋 Validating CSV file...\n');

  // Parse and validate CSV
  const { rows, errors: validationErrors, availableColumns } = parseCSV(filepath);

  console.log(`✓ Found ${rows.length} ${rows.length === 1 ? 'photo' : 'photos'} in CSV`);

  if (validationErrors.length > 0) {
    console.error(`\n❌ Found ${validationErrors.length} validation ${validationErrors.length === 1 ? 'error' : 'errors'}:\n`);
    formatErrors(validationErrors);
    process.exit(1);
  }

  // Open database
  const db = new Database(DB_PATH);

  // Check that all photos exist
  const existenceErrors = checkPhotosExist(rows, db);
  if (existenceErrors.length > 0) {
    console.error(`\n❌ Found ${existenceErrors.length} ${existenceErrors.length === 1 ? 'error' : 'errors'}:\n`);
    formatErrors(existenceErrors);
    db.close();
    process.exit(1);
  }

  console.log('✓ All photos exist in database');

  // Build update operations
  const operations = buildUpdateOperations(rows, availableColumns);

  // Generate summary
  const updateableColumns = [
    'category',
    'caption',
    'location',
    'country',
    'homepage_featured',
    'category_featured',
    'country_featured'
  ].filter(col => availableColumns.has(col));

  console.log('✓ All validations passed');
  console.log('\n📊 Update Summary:');
  console.log(`  Photos to update: ${rows.length}`);
  console.log(`  Columns to update: ${updateableColumns.join(', ')}`);

  if (dryRun) {
    console.log('\n🔍 Dry run mode - showing first 5 updates:\n');
    operations.slice(0, 5).forEach(op => {
      console.log(`  📸 ${op.filename}`);
      op.fields.forEach(field => {
        const value = op.values.get(field);
        const displayValue = value === null ? '(null)' : value;
        console.log(`     ${field}: ${displayValue}`);
      });
      console.log('');
    });

    if (operations.length > 5) {
      console.log(`  ... and ${operations.length - 5} more\n`);
    }

    console.log('🔍 Dry run complete - no changes made to database');
    db.close();
    return;
  }

  // Confirmation prompt
  console.log('');
  const response = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: `Update ${rows.length} ${rows.length === 1 ? 'photo' : 'photos'} in database?`,
    initial: true,
  });

  if (!response.proceed) {
    console.log('\n❌ Update cancelled');
    db.close();
    return;
  }

  // Perform updates with transaction
  console.log('\n📝 Updating...');

  const transaction = db.transaction(() => {
    rows.forEach((row, index) => {
      const op = operations[index];

      if (op.fields.length === 0) {
        return; // Nothing to update for this row
      }

      // Build UPDATE statement dynamically based on which fields are being updated
      const setClause = op.fields.map(field => `${field} = ?`).join(', ');
      const sql = `UPDATE photos SET ${setClause}, updated_at = datetime('now') WHERE ${row.id?.trim() ? 'id' : 'filename'} = ?`;

      // Collect values in correct order
      const values = op.fields.map(field => op.values.get(field));
      const identifier = row.id?.trim() ? parseInt(row.id.trim()) : row.filename?.trim();
      values.push(identifier);

      // Execute update
      db.prepare(sql).run(...values);
    });
  });

  try {
    transaction();
    console.log(`✓ ${rows.length} ${rows.length === 1 ? 'photo' : 'photos'} updated successfully!`);

    // Get total count
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM photos').get() as { count: number };
    console.log(`\n📊 Database contains ${totalCount.count} total ${totalCount.count === 1 ? 'photo' : 'photos'}`);
  } catch (error) {
    console.error('\n❌ Error during update:');
    console.error(error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: npm run photo:update <file.csv> [--dry-run]');
  console.error('\nOptions:');
  console.error('  --dry-run    Validate CSV and preview updates without modifying database');
  console.error('\nExample:');
  console.error('  npm run photo:update photos-updated.csv');
  console.error('  npm run photo:update photos-updated.csv --dry-run');
  console.error('\nCSV Format:');
  console.error('  Required: id OR filename (to identify photo)');
  console.error('  Optional: category, caption, location, country,');
  console.error('            homepage_featured, category_featured, country_featured');
  console.error('\n  Only columns present in CSV will be updated.');
  process.exit(1);
}

const filepath = args[0];
const dryRun = args.includes('--dry-run');

if (!existsSync(filepath)) {
  console.error(`❌ File not found: ${filepath}`);
  process.exit(1);
}

updatePhotos(filepath, dryRun);
