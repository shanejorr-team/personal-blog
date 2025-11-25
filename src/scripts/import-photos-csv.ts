#!/usr/bin/env node

/**
 * CSV import tool for bulk photo uploads.
 *
 * This script imports photo metadata from a CSV file with comprehensive validation:
 * - Validates CSV structure and required columns
 * - Checks data types and constraints
 * - Verifies photo files exist
 * - Prevents duplicate filenames
 * - Atomic transactions (all or nothing)
 *
 * Usage:
 *   npm run photo:import photos.csv
 *   npm run photo:import photos.csv --dry-run
 */

import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import prompts from 'prompts';
import {
  DB_PATH,
  VALID_CATEGORIES,
  type ValidationError,
  validateFilename,
  validateCategory,
  validateRequiredField,
  validateHomepageFeatured,
  validateCategoryFeatured,
  validateCountryFeatured,
  validatePhotoExists,
  parseCSVFile,
  validateRequiredColumns,
  parseFeaturedField,
  formatErrors,
} from './shared/validation';

// CSV row interface
interface CSVRow {
  filename: string;
  category: string;
  caption: string;
  location: string;
  country: string;
  homepage_featured?: string;
  category_featured?: string;
  country_featured?: string;
}

/**
 * Validate a single CSV row
 */
function validateRow(row: CSVRow, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const rowNum = rowIndex + 2; // +2 for header row and 1-based indexing

  // Validate all fields
  const filenameError = validateFilename(row.filename, rowNum);
  if (filenameError) errors.push(filenameError);

  const categoryError = validateCategory(row.category, rowNum);
  if (categoryError) errors.push(categoryError);

  const captionError = validateRequiredField(row.caption, 'caption', rowNum);
  if (captionError) errors.push(captionError);

  const locationError = validateRequiredField(row.location, 'location', rowNum);
  if (locationError) errors.push(locationError);

  const countryError = validateRequiredField(row.country, 'country', rowNum);
  if (countryError) errors.push(countryError);

  const homepageError = validateHomepageFeatured(row.homepage_featured, rowNum);
  if (homepageError) errors.push(homepageError);

  const categoryFeaturedError = validateCategoryFeatured(row.category_featured, rowNum);
  if (categoryFeaturedError) errors.push(categoryFeaturedError);

  const countryFeaturedError = validateCountryFeatured(row.country_featured, rowNum);
  if (countryFeaturedError) errors.push(countryFeaturedError);

  const photoExistsError = validatePhotoExists(row.filename, row.category, rowNum);
  if (photoExistsError) errors.push(photoExistsError);

  return errors;
}

/**
 * Parse and validate CSV file
 */
function parseCSV(filepath: string): { rows: CSVRow[], errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const records = parseCSVFile<CSVRow>(filepath);

  if (records.length === 0) {
    console.error('❌ CSV file is empty');
    process.exit(1);
  }

  // Check for required columns
  const requiredColumns = ['filename', 'category', 'caption', 'location', 'country'];
  const missingColumns = validateRequiredColumns(records[0], requiredColumns);

  if (missingColumns.length > 0) {
    console.error('❌ Missing required columns:', missingColumns.join(', '));
    console.error('\nRequired columns: filename, category, caption, location, country');
    console.error('Optional columns: homepage_featured, category_featured, country_featured');
    process.exit(1);
  }

  // Validate each row
  records.forEach((row, index) => {
    const rowErrors = validateRow(row, index);
    errors.push(...rowErrors);
  });

  return { rows: records, errors };
}

/**
 * Check for duplicate filenames in CSV and database
 */
function checkDuplicates(rows: CSVRow[], db: Database.Database): ValidationError[] {
  const errors: ValidationError[] = [];
  const seen = new Set<string>();

  // Check for duplicates within CSV
  rows.forEach((row, index) => {
    const filename = row.filename?.trim();
    if (filename) {
      if (seen.has(filename)) {
        errors.push({
          row: index + 2,
          field: 'filename',
          message: `Duplicate filename in CSV: "${filename}"`
        });
      }
      seen.add(filename);
    }
  });

  // Check for duplicates in database
  rows.forEach((row, index) => {
    const filename = row.filename?.trim();
    if (filename) {
      const existing = db.prepare('SELECT id FROM photos WHERE filename = ?').get(filename);
      if (existing) {
        errors.push({
          row: index + 2,
          field: 'filename',
          message: `Photo already exists in database: "${filename}"`
        });
      }
    }
  });

  return errors;
}

/**
 * Import photos to database
 */
async function importPhotos(filepath: string, dryRun: boolean = false) {
  console.log('📋 Validating CSV file...\n');

  // Parse and validate CSV
  const { rows, errors: validationErrors } = parseCSV(filepath);

  console.log(`✓ Found ${rows.length} ${rows.length === 1 ? 'photo' : 'photos'} in CSV`);

  if (validationErrors.length > 0) {
    console.error(`\n❌ Found ${validationErrors.length} validation ${validationErrors.length === 1 ? 'error' : 'errors'}:\n`);
    formatErrors(validationErrors);
    process.exit(1);
  }

  // Open database
  const db = new Database(DB_PATH);

  // Check for duplicates
  const duplicateErrors = checkDuplicates(rows, db);
  if (duplicateErrors.length > 0) {
    console.error(`\n❌ Found ${duplicateErrors.length} duplicate ${duplicateErrors.length === 1 ? 'error' : 'errors'}:\n`);
    formatErrors(duplicateErrors);
    db.close();
    process.exit(1);
  }

  console.log('✓ All validations passed');

  // Generate summary
  const summary = {
    total: rows.length,
    byCategory: {} as Record<string, { total: number; homepage: number; category: number }>,
  };

  rows.forEach(row => {
    const category = row.category.trim();
    if (!summary.byCategory[category]) {
      summary.byCategory[category] = { total: 0, homepage: 0, category: 0 };
    }
    summary.byCategory[category].total++;
    if (row.homepage_featured && row.homepage_featured.trim()) {
      summary.byCategory[category].homepage++;
    }
    if (row.category_featured && row.category_featured.trim()) {
      summary.byCategory[category].category++;
    }
  });

  console.log('\n📊 Summary:');
  Object.entries(summary.byCategory).forEach(([category, stats]) => {
    console.log(`  ${category}: ${stats.total} ${stats.total === 1 ? 'photo' : 'photos'}${stats.homepage > 0 ? ` (${stats.homepage} homepage featured` : ''}${stats.category > 0 ? `${stats.homepage > 0 ? ', ' : ' ('}${stats.category} category featured` : ''}${stats.homepage > 0 || stats.category > 0 ? ')' : ''}`);
  });


  if (dryRun) {
    console.log('\n🔍 Dry run mode - no changes made to database');
    db.close();
    return;
  }

  // Confirmation prompt
  console.log('');
  const response = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: `Import ${rows.length} ${rows.length === 1 ? 'photo' : 'photos'} to database?`,
    initial: true,
  });

  if (!response.proceed) {
    console.log('\n❌ Import cancelled');
    db.close();
    return;
  }

  // Prepare insert statement
  const insert = db.prepare(`
    INSERT INTO photos (
      filename, category, caption, location, country,
      homepage_featured, category_featured, country_featured
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Import with transaction
  console.log('\n📥 Importing...');
  const transaction = db.transaction(() => {
    rows.forEach(row => {
      insert.run(
        row.filename.trim(),
        row.category.trim(),
        row.caption.trim(),
        row.location.trim(),
        row.country.trim(),
        parseFeaturedField(row.homepage_featured),
        parseFeaturedField(row.category_featured),
        parseFeaturedField(row.country_featured)
      );
    });
  });

  try {
    transaction();
    console.log(`✓ ${rows.length} ${rows.length === 1 ? 'photo' : 'photos'} imported successfully!`);

    // Get new total
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM photos').get() as { count: number };
    console.log(`\n📊 Database now contains ${totalCount.count} total ${totalCount.count === 1 ? 'photo' : 'photos'}`);
  } catch (error) {
    console.error('\n❌ Error during import:');
    console.error(error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: npm run photo:import <file.csv> [--dry-run]');
  console.error('\nOptions:');
  console.error('  --dry-run    Validate CSV without importing to database');
  console.error('\nExample:');
  console.error('  npm run photo:import photos-2024.csv');
  console.error('  npm run photo:import photos-2024.csv --dry-run');
  process.exit(1);
}

const filepath = args[0];
const dryRun = args.includes('--dry-run');

if (!existsSync(filepath)) {
  console.error(`❌ File not found: ${filepath}`);
  process.exit(1);
}

importPhotos(filepath, dryRun);
