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

// Valid categories
const VALID_CATEGORIES = ['nature', 'street', 'concert', 'other'];

/**
 * Check if filename has a valid image extension
 */
function isValidImage(filename: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return VALID_EXTENSIONS.includes(ext);
}

/**
 * Convert text to title case and replace underscores with spaces
 */
function toTitleCase(text: string): string {
  return text
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Parse filename to extract country, location, and category
 * Expected format: [country]-[location]-[category]-[number].jpg
 */
function parseFilename(filename: string): { country: string; location: string; category: string; warning?: string } {
  // Remove extension
  const nameWithoutExt = filename.slice(0, filename.lastIndexOf('.'));

  // Split by hyphens
  const parts = nameWithoutExt.split('-');

  // Need at least 4 parts: country-location-category-number
  if (parts.length < 4) {
    return { country: '', location: '', category: '', warning: `Filename "${filename}" doesn't match expected format [country]-[location]-[category]-[number].jpg` };
  }

  // Extract parts (everything except the last part which is the sequence number)
  const countryRaw = parts[0];
  const categoryRaw = parts[parts.length - 2]; // Second to last
  const locationParts = parts.slice(1, parts.length - 2); // Everything between country and category
  const locationRaw = locationParts.join('-');

  // Process country - convert 'us' to 'United States'
  let country = countryRaw.toLowerCase() === 'us' ? 'United States' : toTitleCase(countryRaw);

  // Process location - title case and replace underscores
  let location = toTitleCase(locationRaw);

  // Process category - keep lowercase
  let category = categoryRaw.toLowerCase();
  let warning: string | undefined;

  // Validate category
  if (!VALID_CATEGORIES.includes(category)) {
    warning = `Invalid category "${category}" in filename "${filename}" - must be one of: ${VALID_CATEGORIES.join(', ')}`;
    category = ''; // Leave blank in CSV
  }

  return { country, location, category, warning };
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

  // Track warnings
  const warnings: string[] = [];

  // Generate CSV rows with parsed metadata
  const rows = imageFiles.map(filename => {
    const parsed = parseFilename(filename);

    // Collect warnings
    if (parsed.warning) {
      warnings.push(parsed.warning);
    }

    // Build CSV row: filename,category,alt,caption,location,country,date,sub_category,homepage_featured,category_featured
    // Pre-populate: filename, category, location, country
    // Leave blank: alt (required but user must provide), caption, date, sub_category, homepage_featured, category_featured
    return `${filename},${parsed.category},,,${parsed.location},${parsed.country},,,,`;
  });

  // Display warnings before writing file
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:\n');
    warnings.forEach(warning => console.log(`   ${warning}`));
    console.log('');
  }

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
  console.log('  1. Open the CSV template and review pre-populated fields:');
  console.log('     - category, location, country (auto-filled from filename)');
  console.log('  2. Fill in required field:');
  console.log('     - alt (required): descriptive alt text for accessibility');
  console.log('  3. Optionally fill in: caption, date, sub_category, homepage_featured, category_featured');
  console.log('  4. Move photos from _staging/ to src/images/photography/{category}/');
  console.log('  5. Run: npm run photo:import src/images/photography/_staging/photo-template.csv --dry-run');
  console.log('  6. Run: npm run photo:import src/images/photography/_staging/photo-template.csv');
  console.log('  7. Review validation and confirm import\n');
}

// Main execution
generateTemplate();
