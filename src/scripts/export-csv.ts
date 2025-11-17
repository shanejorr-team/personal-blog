#!/usr/bin/env node

/**
 * Export database to CSV format for editing.
 *
 * This script exports all photos from the SQLite database to a CSV file,
 * making it easy to bulk edit metadata in spreadsheet applications.
 *
 * The exported CSV includes all columns and can be re-imported using
 * the update-photos-csv.ts script.
 *
 * Usage: npm run db:export-csv
 */

import Database from 'better-sqlite3';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '..', 'db', 'photos.db');
const BACKUP_DIR = join(__dirname, '..', '..', 'backups');

interface Photo {
  id: number;
  filename: string;
  category: string;
  caption: string;
  location: string;
  country: string;
  date: string | null;
  sub_category: string | null;
  homepage_featured: number | null;
  category_featured: number | null;
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSVField(value: string | number | null): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Convert array of photos to CSV string
 */
function photosToCSV(photos: Photo[]): string {
  // CSV header
  const headers = [
    'id',
    'filename',
    'category',
    'caption',
    'location',
    'country',
    'date',
    'sub_category',
    'homepage_featured',
    'category_featured'
  ];

  const lines: string[] = [headers.join(',')];

  // Add each photo as a row
  photos.forEach(photo => {
    const row = [
      photo.id,
      photo.filename,
      photo.category,
      photo.caption,
      photo.location,
      photo.country,
      photo.date,
      photo.sub_category,
      photo.homepage_featured,
      photo.category_featured
    ].map(escapeCSVField);

    lines.push(row.join(','));
  });

  return lines.join('\n') + '\n';
}

async function exportCSV() {
  console.log('\n📦 Exporting database to CSV...\n');

  // Open database (readonly)
  const db = new Database(DB_PATH, { readonly: true });

  // Create backup directory
  mkdirSync(BACKUP_DIR, { recursive: true });

  // Get all photos
  console.log('📸 Fetching all photos from database...');
  const photos = db.prepare('SELECT * FROM photos ORDER BY category, id').all() as Photo[];

  console.log(`  ✓ Found ${photos.length} photos`);

  // Convert to CSV
  console.log('\n📝 Converting to CSV format...');
  const csv = photosToCSV(photos);

  // Write to file
  const filename = join(BACKUP_DIR, 'photos-export.csv');
  writeFileSync(filename, csv);

  db.close();

  console.log(`  ✓ CSV written to backups/photos-export.csv`);

  console.log('\n✨ Export complete!\n');
  console.log('📊 Summary:');
  console.log(`  Total photos exported: ${photos.length}`);
  console.log(`  File location: ${filename}`);
  console.log('\n💡 Next steps:');
  console.log('  1. Open backups/photos-export.csv in Excel/Google Sheets');
  console.log('  2. Edit the metadata columns as needed');
  console.log('  3. Save as CSV');
  console.log('  4. Import using: npm run photo:update backups/photos-export.csv');
}

// Run export
exportCSV().catch((error) => {
  console.error('❌ Export failed:', error);
  process.exit(1);
});
