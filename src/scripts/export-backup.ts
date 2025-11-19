#!/usr/bin/env node

/**
 * Export database to JSON backup files.
 *
 * This script exports the SQLite database back to JSON format,
 * useful for:
 * - Creating human-readable backups
 * - Reviewing changes in version control
 * - Migrating to another system
 *
 * The exported files match the original portfolio JSON structure.
 *
 * Usage: npm run db:export
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
  date?: string | null;
  sub_category?: string | null;
  homepage_featured?: number | null;
  category_featured?: number | null;
}

interface PortfolioImage {
  src: string;
  caption: string;
  location: string;
  country: string;
  date?: string;
  sub_category?: string;
  featured?: number;
}

interface PortfolioJSON {
  category: string;
  images: PortfolioImage[];
  order: number;
}

/**
 * Convert database photo to portfolio JSON format
 */
function photoToPortfolioImage(photo: Photo): PortfolioImage {
  const image: PortfolioImage = {
    src: `/images/photography/${photo.category}/${photo.filename}`,
    caption: photo.caption,
    location: photo.location,
    country: photo.country,
  };

  if (photo.date) image.date = photo.date;
  if (photo.sub_category) image.sub_category = photo.sub_category;

  // Combine homepage_featured and category_featured back to single featured field
  // Priority: homepage_featured (1-7) takes precedence
  if (photo.homepage_featured) {
    image.featured = photo.homepage_featured;
  } else if (photo.category_featured) {
    image.featured = photo.category_featured;
  }

  return image;
}

async function exportBackup() {
  console.log('\n📦 Exporting database to JSON backup...\n');

  // Open database (readonly)
  const db = new Database(DB_PATH, { readonly: true });

  // Create backup directory
  mkdirSync(BACKUP_DIR, { recursive: true });

  const categories = ['nature', 'street', 'concert'];
  const categoryOrder: Record<string, number> = {
    nature: 1,
    street: 2,
    concert: 3,
  };

  let totalPhotos = 0;

  for (const category of categories) {
    console.log(`📸 Exporting ${category}...`);

    // Get all photos for this category
    const photos = db
      .prepare('SELECT * FROM photos WHERE category = ? ORDER BY id')
      .all(category) as Photo[];

    // Convert to portfolio format
    const images = photos.map(photoToPortfolioImage);

    // Create portfolio JSON
    const portfolio: PortfolioJSON = {
      category,
      images,
      order: categoryOrder[category] || 0,
    };

    // Write to file
    const filename = join(BACKUP_DIR, `${category}.json`);
    writeFileSync(filename, JSON.stringify(portfolio, null, 2) + '\n');

    console.log(`  ✓ ${images.length} photos exported to backups/${category}.json`);
    totalPhotos += images.length;
  }

  // Export complete database as single file
  console.log('\n📋 Exporting complete database...');
  const allPhotos = db.prepare('SELECT * FROM photos ORDER BY category, id').all() as Photo[];
  const completeBackup = {
    exported_at: new Date().toISOString(),
    total_photos: allPhotos.length,
    photos: allPhotos,
  };

  const completeFilename = join(BACKUP_DIR, 'complete-backup.json');
  writeFileSync(completeFilename, JSON.stringify(completeBackup, null, 2) + '\n');

  db.close();

  console.log('\n✨ Export complete!\n');
  console.log('📊 Summary:');
  console.log(`  Total photos exported: ${totalPhotos}`);
  console.log(`  Backup location: ${BACKUP_DIR}`);
  console.log('\n📁 Files created:');
  console.log('  - backups/nature.json');
  console.log('  - backups/street.json');
  console.log('  - backups/concert.json');
  console.log('  - backups/complete-backup.json (all photos with metadata)');
}

// Run export
exportBackup().catch((error) => {
  console.error('❌ Export failed:', error);
  process.exit(1);
});
