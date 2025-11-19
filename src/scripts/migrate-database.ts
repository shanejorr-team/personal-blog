import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../db/photos.db');

console.log('🔄 Starting database migration...\n');

// Create backup first
const backupPath = join(__dirname, '../db/photos-backup-' + Date.now() + '.db');
console.log(`📦 Creating backup at: ${backupPath}`);
fs.copyFileSync(dbPath, backupPath);
console.log('✅ Backup created\n');

const db = new Database(dbPath);

try {
  db.exec('BEGIN TRANSACTION');

  // Step 1: Create temporary new table with updated schema
  console.log('1️⃣  Creating new table with updated schema...');
  db.exec(`
    CREATE TABLE photos_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('nature', 'street', 'concert')),
      caption TEXT NOT NULL CHECK(length(caption) > 0),
      location TEXT NOT NULL CHECK(length(location) > 0),
      country TEXT NOT NULL CHECK(length(country) > 0),
      homepage_featured INTEGER DEFAULT 0 NOT NULL CHECK(homepage_featured IN (0, 1)),
      category_featured INTEGER DEFAULT 0 NOT NULL CHECK(category_featured IN (0, 1, 2, 3, 4)),
      country_featured INTEGER DEFAULT 0 NOT NULL CHECK(country_featured IN (0, 1)),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log('✅ New table created\n');

  // Step 2: Copy data from old table to new, with transformations
  console.log('2️⃣  Migrating data...');

  // First, determine which photo should be homepage featured (keep current hero)
  const currentHero = db.prepare(`
    SELECT id FROM photos WHERE homepage_featured = 1 LIMIT 1
  `).get() as { id: number } | undefined;

  // Copy data with transformed values
  db.exec(`
    INSERT INTO photos_new (
      id, filename, category, caption, location, country,
      homepage_featured, category_featured, country_featured,
      created_at, updated_at
    )
    SELECT
      id,
      filename,
      category,
      caption,
      location,
      country,
      CASE WHEN id = ${currentHero?.id || 0} THEN 1 ELSE 0 END as homepage_featured,
      COALESCE(category_featured, 0) as category_featured,
      0 as country_featured,  -- Will be set in next step
      created_at,
      updated_at
    FROM photos
  `);

  const rowCount = db.prepare('SELECT COUNT(*) as count FROM photos_new').get() as { count: number };
  console.log(`✅ Migrated ${rowCount.count} photos\n`);

  // Step 3: Ensure each category has exactly one photo with category_featured = 1
  console.log('3️⃣  Setting category_featured constraints...');
  const categories = ['nature', 'street', 'concert'];

  for (const category of categories) {
    // Check if category already has a featured photo
    const hasFeatured = db.prepare(`
      SELECT COUNT(*) as count
      FROM photos_new
      WHERE category = ? AND category_featured = 1
    `).get(category) as { count: number };

    if (hasFeatured.count === 0) {
      // Set the first photo in this category as featured
      db.prepare(`
        UPDATE photos_new
        SET category_featured = 1
        WHERE id = (
          SELECT id FROM photos_new
          WHERE category = ?
          ORDER BY id ASC
          LIMIT 1
        )
      `).run(category);
      console.log(`   ✅ Set featured photo for ${category} category`);
    } else if (hasFeatured.count > 1) {
      // Keep only the first one as featured, set others to 2, 3, 4 based on order
      const featuredPhotos = db.prepare(`
        SELECT id FROM photos_new
        WHERE category = ? AND category_featured = 1
        ORDER BY id ASC
      `).all(category) as { id: number }[];

      // Keep first as 1, set others to 0
      for (let i = 1; i < featuredPhotos.length; i++) {
        db.prepare(`UPDATE photos_new SET category_featured = 0 WHERE id = ?`).run(featuredPhotos[i].id);
      }
      console.log(`   ✅ Fixed multiple featured photos for ${category} category`);
    } else {
      console.log(`   ✅ ${category} category already has exactly one featured photo`);
    }
  }
  console.log('');

  // Step 4: Set country_featured = 1 for one photo per country
  console.log('4️⃣  Setting country_featured constraints...');
  const countries = db.prepare(`
    SELECT DISTINCT country FROM photos_new ORDER BY country
  `).all() as { country: string }[];

  for (const { country } of countries) {
    // Set the first photo from this country as featured
    db.prepare(`
      UPDATE photos_new
      SET country_featured = 1
      WHERE id = (
        SELECT id FROM photos_new
        WHERE country = ?
        ORDER BY id ASC
        LIMIT 1
      )
    `).run(country);
  }
  console.log(`✅ Set country_featured for ${countries.length} countries\n`);

  // Step 5: Drop old table and rename new table
  console.log('5️⃣  Replacing old table...');
  db.exec('DROP TABLE photos');
  db.exec('ALTER TABLE photos_new RENAME TO photos');
  console.log('✅ Table replaced\n');

  // Step 6: Recreate indexes
  console.log('6️⃣  Creating indexes...');
  db.exec(`
    CREATE INDEX idx_category ON photos(category);
    CREATE INDEX idx_country ON photos(country);
    CREATE INDEX idx_homepage_featured ON photos(homepage_featured);
    CREATE INDEX idx_category_featured ON photos(category, category_featured);
    CREATE INDEX idx_country_featured ON photos(country, country_featured);
    CREATE INDEX idx_filename ON photos(filename);
  `);
  console.log('✅ Indexes created\n');

  // Step 7: Recreate trigger
  console.log('7️⃣  Creating trigger...');
  db.exec(`
    CREATE TRIGGER update_photos_timestamp
    AFTER UPDATE ON photos
    BEGIN
      UPDATE photos SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `);
  console.log('✅ Trigger created\n');

  // Commit transaction
  db.exec('COMMIT');

  console.log('='.repeat(50));
  console.log('✅ Migration completed successfully!');
  console.log(`📦 Backup saved at: ${backupPath}`);
  console.log('\n🔍 Run validation script to verify:');
  console.log('   npm run db:validate');

} catch (error) {
  console.error('\n❌ Migration failed:', error);
  console.log('Rolling back transaction...');
  db.exec('ROLLBACK');
  console.log('✅ Rollback complete. Database unchanged.');
  console.log(`📦 Backup available at: ${backupPath}`);
  process.exit(1);
} finally {
  db.close();
}
