#!/usr/bin/env node

/**
 * Migration script to convert existing JSON portfolio files to SQLite database.
 *
 * This script:
 * 1. Creates the SQLite database and schema
 * 2. Reads all portfolio JSON files from src/content/portfolio
 * 3. Extracts photo metadata and inserts into database
 * 4. Splits 'featured' field into homepage_featured (1-7) and category_featured
 *
 * Usage: node --loader tsx src/scripts/migrate-json-to-db.ts
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const DB_PATH = join(__dirname, '..', 'db', 'photos.db');
const SCHEMA_PATH = join(__dirname, '..', 'db', 'schema.sql');
const PORTFOLIO_DIR = join(__dirname, '..', 'content', 'portfolio');

// Portfolio JSON structure
interface PortfolioImage {
  src: string;
  alt: string;
  caption?: string;
  location?: string;
  country?: string;
  date?: string;
  sub_category?: string;
  featured?: number;
}

interface PortfolioJSON {
  category: 'nature' | 'street' | 'concert' | 'other';
  images: PortfolioImage[];
  order: number;
}

/**
 * Extract filename from image src path
 * Example: /images/photography/nature/us-georgia-nature-1.jpg -> us-georgia-nature-1.jpg
 */
function extractFilename(src: string): string {
  return src.split('/').pop() || src;
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🔄 Starting migration from JSON to SQLite...\n');

  // Initialize database
  console.log('📁 Creating database...');
  const db = new Database(DB_PATH);

  // Load and execute schema
  console.log('📋 Loading schema...');
  const schema = readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);
  console.log('✅ Schema created\n');

  // Prepare insert statement
  const insert = db.prepare(`
    INSERT INTO photos (
      filename, category, alt, caption, location, country,
      date, sub_category, homepage_featured, category_featured
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Portfolio categories to process
  const categories = ['nature', 'street', 'concert', 'other'];
  let totalPhotos = 0;
  let homepageFeatured = 0;
  let categoryFeatured = 0;

  // Process each category
  const transaction = db.transaction(() => {
    for (const category of categories) {
      const jsonPath = join(PORTFOLIO_DIR, `${category}.json`);

      try {
        console.log(`📸 Processing ${category}...`);
        const jsonContent = readFileSync(jsonPath, 'utf-8');
        const portfolio: PortfolioJSON = JSON.parse(jsonContent);

        for (const image of portfolio.images) {
          const filename = extractFilename(image.src);

          // Determine featured status
          // homepage_featured: 1-7 for homepage hero + grid
          // category_featured: All featured photos appear on category portfolio page
          const homepage_featured = image.featured && image.featured <= 7 ? image.featured : null;
          const category_featured = image.featured ? image.featured : null;

          if (homepage_featured) homepageFeatured++;
          if (category_featured) categoryFeatured++;

          insert.run(
            filename,
            category,
            image.alt,
            image.caption || null,
            image.location || null,
            image.country || null,
            image.date || null,
            image.sub_category || null,
            homepage_featured,
            category_featured
          );

          totalPhotos++;
        }

        console.log(`  ✓ ${portfolio.images.length} photos from ${category}`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          console.log(`  ⚠ No ${category}.json file found, skipping`);
        } else {
          throw error;
        }
      }
    }
  });

  // Execute transaction
  transaction();

  // Print summary
  console.log('\n✨ Migration complete!\n');
  console.log('📊 Summary:');
  console.log(`  Total photos: ${totalPhotos}`);
  console.log(`  Homepage featured: ${homepageFeatured}`);
  console.log(`  Category featured: ${categoryFeatured}`);

  // Verify data
  console.log('\n🔍 Verification:');
  const counts = db.prepare(`
    SELECT
      category,
      COUNT(*) as total,
      COUNT(homepage_featured) as homepage_count,
      COUNT(category_featured) as category_count
    FROM photos
    GROUP BY category
  `).all();

  console.table(counts);

  // Close database
  db.close();
  console.log('\n✅ Database closed successfully');
}

// Run migration
migrate().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
