import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../db/photos.db');

interface Photo {
  id: number;
  filename: string;
  category: string;
  country: string;
  homepage_featured: number | null;
  category_featured: number | null;
  country_featured: number | null;
}

function validateConstraints() {
  const db = new Database(dbPath, { readonly: true });

  console.log('🔍 Validating database constraints...\n');

  let hasErrors = false;

  // Check 1: homepage_featured must have exactly one 1 in entire table
  console.log('1️⃣  Checking homepage_featured constraint...');
  const homepageFeaturedCount = db.prepare(`
    SELECT COUNT(*) as count
    FROM photos
    WHERE homepage_featured = 1
  `).get() as { count: number };

  if (homepageFeaturedCount.count === 0) {
    console.log('   ❌ ERROR: No photo has homepage_featured = 1');
    hasErrors = true;
  } else if (homepageFeaturedCount.count > 1) {
    console.log(`   ❌ ERROR: ${homepageFeaturedCount.count} photos have homepage_featured = 1 (should be exactly 1)`);
    const photos = db.prepare(`
      SELECT id, filename
      FROM photos
      WHERE homepage_featured = 1
    `).all() as Photo[];
    console.log('   Photos with homepage_featured = 1:');
    photos.forEach(p => console.log(`      - ID ${p.id}: ${p.filename}`));
    hasErrors = true;
  } else {
    const photo = db.prepare(`
      SELECT id, filename
      FROM photos
      WHERE homepage_featured = 1
    `).get() as Photo;
    console.log(`   ✅ PASS: Exactly 1 photo has homepage_featured = 1 (ID ${photo.id}: ${photo.filename})`);
  }

  // Check 2: category_featured must have exactly one 1 per category
  console.log('\n2️⃣  Checking category_featured constraint...');
  const categories = ['nature', 'street', 'concert'];
  let categoryPass = true;

  for (const category of categories) {
    const count = db.prepare(`
      SELECT COUNT(*) as count
      FROM photos
      WHERE category = ? AND category_featured = 1
    `).get(category) as { count: number };

    if (count.count === 0) {
      console.log(`   ❌ ERROR: Category '${category}' has no photo with category_featured = 1`);
      hasErrors = true;
      categoryPass = false;
    } else if (count.count > 1) {
      console.log(`   ❌ ERROR: Category '${category}' has ${count.count} photos with category_featured = 1 (should be exactly 1)`);
      const photos = db.prepare(`
        SELECT id, filename
        FROM photos
        WHERE category = ? AND category_featured = 1
      `).all(category) as Photo[];
      console.log(`   Photos in ${category} with category_featured = 1:`);
      photos.forEach(p => console.log(`      - ID ${p.id}: ${p.filename}`));
      hasErrors = true;
      categoryPass = false;
    } else {
      const photo = db.prepare(`
        SELECT id, filename
        FROM photos
        WHERE category = ? AND category_featured = 1
      `).get(category) as Photo;
      console.log(`   ✅ ${category}: Exactly 1 photo has category_featured = 1 (ID ${photo.id}: ${photo.filename})`);
    }
  }

  // Check 3: country_featured must have exactly one 1 per country
  console.log('\n3️⃣  Checking country_featured constraint...');

  // First check if column exists
  const columns = db.prepare(`PRAGMA table_info(photos)`).all() as any[];
  const hasCountryFeatured = columns.some(col => col.name === 'country_featured');

  if (!hasCountryFeatured) {
    console.log('   ⚠️  WARNING: country_featured column does not exist yet (expected before migration)');
  } else {
    const countries = db.prepare(`
      SELECT DISTINCT country
      FROM photos
      ORDER BY country
    `).all() as { country: string }[];

    let countryPass = true;

    for (const { country } of countries) {
      const count = db.prepare(`
        SELECT COUNT(*) as count
        FROM photos
        WHERE country = ? AND country_featured = 1
      `).get(country) as { count: number };

      if (count.count === 0) {
        console.log(`   ❌ ERROR: Country '${country}' has no photo with country_featured = 1`);
        hasErrors = true;
        countryPass = false;
      } else if (count.count > 1) {
        console.log(`   ❌ ERROR: Country '${country}' has ${count.count} photos with country_featured = 1 (should be exactly 1)`);
        const photos = db.prepare(`
          SELECT id, filename
          FROM photos
          WHERE country = ? AND country_featured = 1
        `).all(country) as Photo[];
        console.log(`   Photos in ${country} with country_featured = 1:`);
        photos.forEach(p => console.log(`      - ID ${p.id}: ${p.filename}`));
        hasErrors = true;
        countryPass = false;
      } else {
        const photo = db.prepare(`
          SELECT id, filename
          FROM photos
          WHERE country = ? AND country_featured = 1
        `).get(country) as Photo;
        console.log(`   ✅ ${country}: Exactly 1 photo has country_featured = 1 (ID ${photo.id}: ${photo.filename})`);
      }
    }
  }

  // Check 4: Verify no NULL values in required columns
  console.log('\n4️⃣  Checking for NULL values...');
  const columnsToCheck = ['homepage_featured', 'category_featured'];
  if (hasCountryFeatured) {
    columnsToCheck.push('country_featured');
  }

  let nullPass = true;
  for (const column of columnsToCheck) {
    const nullCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM photos
      WHERE ${column} IS NULL
    `).get() as { count: number };

    if (nullCount.count > 0) {
      console.log(`   ❌ ERROR: ${nullCount.count} photos have NULL in ${column}`);
      hasErrors = true;
      nullPass = false;
    } else {
      console.log(`   ✅ ${column}: No NULL values`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.log('❌ VALIDATION FAILED: Constraint violations found');
    console.log('Please run the migration script to fix these issues.');
    process.exit(1);
  } else {
    console.log('✅ VALIDATION PASSED: All constraints satisfied');
    process.exit(0);
  }

  db.close();
}

// Run validation
try {
  validateConstraints();
} catch (error) {
  console.error('Error during validation:', error);
  process.exit(1);
}
