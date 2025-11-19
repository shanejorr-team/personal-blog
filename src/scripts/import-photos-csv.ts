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
import { parse } from 'csv-parse/sync';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import prompts from 'prompts';

// Database path
const DB_PATH = join(process.cwd(), 'src', 'db', 'photos.db');
const IMAGES_BASE = join(process.cwd(), 'src', 'images', 'photography');

// Valid categories
const VALID_CATEGORIES = ['nature', 'street', 'concert'] as const;
type Category = typeof VALID_CATEGORIES[number];

// CSV row interface
interface CSVRow {
  filename: string;
  category: string;
  caption: string;
  location: string;
  country: string;
  date?: string;
  sub_category?: string;
  homepage_featured?: string;
  category_featured?: string;
}

// Validation error interface
interface ValidationError {
  row: number;
  field: string;
  message: string;
}

/**
 * Validate a single CSV row
 */
function validateRow(row: CSVRow, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const rowNum = rowIndex + 2; // +2 for header row and 1-based indexing

  // Required fields
  if (!row.filename?.trim()) {
    errors.push({ row: rowNum, field: 'filename', message: 'Filename is required' });
  } else {
    // Validate filename extension
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
    const hasValidExt = validExtensions.some(ext =>
      row.filename.toLowerCase().endsWith(ext)
    );
    if (!hasValidExt) {
      errors.push({
        row: rowNum,
        field: 'filename',
        message: `Must end with ${validExtensions.join(', ')}`
      });
    }
  }

  if (!row.category?.trim()) {
    errors.push({ row: rowNum, field: 'category', message: 'Category is required' });
  } else if (!VALID_CATEGORIES.includes(row.category as Category)) {
    errors.push({
      row: rowNum,
      field: 'category',
      message: `Must be one of: ${VALID_CATEGORIES.join(', ')}`
    });
  }

  if (!row.caption?.trim()) {
    errors.push({ row: rowNum, field: 'caption', message: 'Caption is required' });
  }

  if (!row.location?.trim()) {
    errors.push({ row: rowNum, field: 'location', message: 'Location is required' });
  }

  if (!row.country?.trim()) {
    errors.push({ row: rowNum, field: 'country', message: 'Country is required' });
  }

  // Optional field validation
  if (row.date && row.date.trim()) {
    // Validate ISO 8601 date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date.trim())) {
      errors.push({
        row: rowNum,
        field: 'date',
        message: 'Must be in YYYY-MM-DD format (e.g., 2024-03-15)'
      });
    }
  }

  if (row.homepage_featured && row.homepage_featured.trim()) {
    const value = parseInt(row.homepage_featured.trim());
    if (isNaN(value) || value < 1 || value > 7) {
      errors.push({
        row: rowNum,
        field: 'homepage_featured',
        message: 'Must be a number between 1 and 7'
      });
    }
  }

  if (row.category_featured && row.category_featured.trim()) {
    const value = parseInt(row.category_featured.trim());
    if (isNaN(value) || value < 1) {
      errors.push({
        row: rowNum,
        field: 'category_featured',
        message: 'Must be a positive number'
      });
    }
  }

  // Check if photo file exists
  if (row.filename?.trim() && row.category?.trim() && VALID_CATEGORIES.includes(row.category as Category)) {
    const photoPath = join(IMAGES_BASE, row.category, row.filename.trim());
    if (!existsSync(photoPath)) {
      errors.push({
        row: rowNum,
        field: 'filename',
        message: `Photo file not found at src/images/photography/${row.category}/${row.filename.trim()}`
      });
    }
  }

  return errors;
}

/**
 * Parse and validate CSV file
 */
function parseCSV(filepath: string): { rows: CSVRow[], errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Read CSV file
  let csvContent: string;
  try {
    csvContent = readFileSync(filepath, 'utf-8');
  } catch (error) {
    console.error(`❌ Error reading file: ${filepath}`);
    console.error(error);
    process.exit(1);
  }

  // Parse CSV
  let records: CSVRow[];
  try {
    records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true, // Allow varying column counts
    }) as CSVRow[];
  } catch (error) {
    console.error('❌ Error parsing CSV file:');
    console.error(error);
    process.exit(1);
  }

  // Check for required columns
  if (records.length === 0) {
    console.error('❌ CSV file is empty');
    process.exit(1);
  }

  const firstRow = records[0];
  const requiredColumns = ['filename', 'category', 'caption', 'location', 'country'];
  const missingColumns = requiredColumns.filter(col => !(col in firstRow));

  if (missingColumns.length > 0) {
    console.error('❌ Missing required columns:', missingColumns.join(', '));
    console.error('\nRequired columns: filename, category, caption, location, country');
    console.error('Optional columns: date, sub_category, homepage_featured, category_featured');
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
    validationErrors.forEach(error => {
      console.error(`  Row ${error.row}, ${error.field}: ${error.message}`);
    });
    process.exit(1);
  }

  // Open database
  const db = new Database(DB_PATH);

  // Check for duplicates
  const duplicateErrors = checkDuplicates(rows, db);
  if (duplicateErrors.length > 0) {
    console.error(`\n❌ Found ${duplicateErrors.length} duplicate ${duplicateErrors.length === 1 ? 'error' : 'errors'}:\n`);
    duplicateErrors.forEach(error => {
      console.error(`  Row ${error.row}, ${error.field}: ${error.message}`);
    });
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
      date, sub_category, homepage_featured, category_featured
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        row.date?.trim() || null,
        row.sub_category?.trim() || null,
        row.homepage_featured?.trim() ? parseInt(row.homepage_featured.trim()) : null,
        row.category_featured?.trim() ? parseInt(row.category_featured.trim()) : null
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
