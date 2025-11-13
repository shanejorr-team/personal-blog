#!/usr/bin/env node

/**
 * CSV template generator for staging photos.
 *
 * This script scans the _staging directory and generates a CSV template
 * with filenames pre-populated. The user can then fill in metadata and
 * move photos to their category folders before importing.
 *
 * Usage:
 *   npm run photo:template
 */

import { readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Paths
const STAGING_DIR = join(process.cwd(), 'src', 'images', 'photography', '_staging');
const OUTPUT_CSV = join(STAGING_DIR, 'photo-template.csv');

// Valid image extensions
const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

// System files to exclude
const EXCLUDE_FILES = ['.DS_Store', 'Thumbs.db', 'desktop.ini', 'photo-template.csv'];

/**
 * Check if filename has a valid image extension
 */
function isValidImage(filename: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return VALID_EXTENSIONS.includes(ext);
}

/**
 * Generate CSV template from staging directory
 */
function generateTemplate() {
  console.log('📋 Scanning staging directory...\n');

  // Check if staging directory exists
  if (!existsSync(STAGING_DIR)) {
    console.log('Creating staging directory: src/images/photography/_staging/');
    mkdirSync(STAGING_DIR, { recursive: true });
  }

  // Read files from staging directory
  let files: string[];
  try {
    files = readdirSync(STAGING_DIR);
  } catch (error) {
    console.error(`❌ Error reading staging directory: ${STAGING_DIR}`);
    console.error(error);
    process.exit(1);
  }

  // Filter to valid image files
  const imageFiles = files.filter(file => {
    // Exclude system files and existing template
    if (EXCLUDE_FILES.includes(file)) return false;

    // Only include valid image extensions
    return isValidImage(file);
  });

  if (imageFiles.length === 0) {
    console.log('⚠️  No photos found in staging directory');
    console.log(`\nPlace photos in: ${STAGING_DIR}`);
    console.log(`Supported formats: ${VALID_EXTENSIONS.join(', ')}`);
    process.exit(0);
  }

  console.log(`✓ Found ${imageFiles.length} ${imageFiles.length === 1 ? 'photo' : 'photos'} in staging directory\n`);

  // Generate CSV header
  const header = 'filename,category,alt,caption,location,country,date,sub_category,homepage_featured,category_featured';

  // Generate CSV rows (filename populated, rest blank)
  const rows = imageFiles.map(filename => {
    // Filename + 9 empty columns
    return `${filename},,,,,,,,,`;
  });

  // Combine header and rows
  const csvContent = [header, ...rows].join('\n');

  // Write CSV file
  try {
    writeFileSync(OUTPUT_CSV, csvContent, 'utf-8');
    console.log(`✓ Template generated: ${OUTPUT_CSV}\n`);
  } catch (error) {
    console.error('❌ Error writing CSV file:');
    console.error(error);
    process.exit(1);
  }

  // Display next steps
  console.log('📝 Next steps:');
  console.log('  1. Open the CSV template and fill in:');
  console.log('     - category (required): nature, street, concert, or other');
  console.log('     - alt (required): descriptive alt text for accessibility');
  console.log('     - Other fields (optional): caption, location, country, etc.');
  console.log('  2. Move photos from _staging/ to src/images/photography/{category}/');
  console.log('  3. Run: npm run photo:import src/images/photography/_staging/photo-template.csv');
  console.log('  4. Review validation and confirm import\n');
}

// Main execution
generateTemplate();
