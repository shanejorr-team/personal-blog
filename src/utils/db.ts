import Database from 'better-sqlite3';
import { join } from 'path';

// Database path from project root
// In build, this resolves from dist/
// In dev, this resolves from project root
const DB_PATH = join(process.cwd(), 'src', 'db', 'photos.db');

// Initialize database connection (readonly for queries)
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return db;
}

// Photo interface matching database schema
export interface Photo {
  id: number;
  filename: string;
  category: 'nature' | 'street' | 'concert' | 'other';
  alt: string;
  caption?: string | null;
  location?: string | null;
  country?: string | null;
  date?: string | null;
  sub_category?: string | null;
  homepage_featured?: number | null;
  category_featured?: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get the 7 featured photos for the homepage.
 * Photos are ordered by homepage_featured priority (1-7).
 */
export function getHomepageFeatured(): Photo[] {
  const query = `
    SELECT * FROM photos
    WHERE homepage_featured IS NOT NULL
    ORDER BY homepage_featured ASC
    LIMIT 7
  `;
  return getDb().prepare(query).all() as Photo[];
}

/**
 * Get all featured photos for a specific category.
 * These appear on the main portfolio page and category detail page.
 * Photos are ordered by category_featured priority.
 */
export function getCategoryFeatured(category: string): Photo[] {
  const query = `
    SELECT * FROM photos
    WHERE category = ? AND category_featured IS NOT NULL
    ORDER BY category_featured ASC
  `;
  return getDb().prepare(query).all(category) as Photo[];
}

/**
 * Get all photos in a specific category, regardless of featured status.
 * Used for category detail pages showing all photos.
 */
export function getAllCategoryPhotos(category: string): Photo[] {
  const query = `
    SELECT * FROM photos
    WHERE category = ?
    ORDER BY
      CASE WHEN sub_category IS NULL THEN 1 ELSE 0 END,
      sub_category ASC,
      date DESC
  `;
  return getDb().prepare(query).all(category) as Photo[];
}

/**
 * Get all photos from a specific country.
 * Used for country-specific portfolio pages.
 */
export function getCountryPhotos(country: string): Photo[] {
  const query = `
    SELECT * FROM photos
    WHERE country = ?
    ORDER BY
      CASE WHEN location IS NULL THEN 1 ELSE 0 END,
      location ASC,
      date DESC
  `;
  return getDb().prepare(query).all(country) as Photo[];
}

/**
 * Get all unique countries that have photos.
 * Used for generating static country pages.
 */
export function getAllCountries(): string[] {
  const query = `
    SELECT DISTINCT country FROM photos
    WHERE country IS NOT NULL
    ORDER BY country ASC
  `;
  const results = getDb().prepare(query).all() as { country: string }[];
  return results.map(row => row.country);
}

/**
 * Get all unique categories.
 * Used for generating static category pages.
 */
export function getAllCategories(): string[] {
  return ['nature', 'street', 'concert', 'other'];
}

/**
 * Convert a Photo object to its full image path.
 * Path format: /images/photography/{category}/{filename}
 */
export function getPhotoPath(photo: Photo): string {
  return `/images/photography/${photo.category}/${photo.filename}`;
}

/**
 * Get a single photo by ID.
 */
export function getPhotoById(id: number): Photo | null {
  const query = `SELECT * FROM photos WHERE id = ?`;
  const result = getDb().prepare(query).get(id) as Photo | undefined;
  return result || null;
}

/**
 * Get a single photo by filename.
 */
export function getPhotoByFilename(filename: string): Photo | null {
  const query = `SELECT * FROM photos WHERE filename = ?`;
  const result = getDb().prepare(query).get(filename) as Photo | undefined;
  return result || null;
}

/**
 * Close the database connection.
 * Useful for cleanup in scripts.
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
