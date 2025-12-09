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
  category: 'nature' | 'street' | 'concert';
  caption: string;
  location: string;
  country: string;
  homepage_featured: 0 | 1;
  category_featured: 0 | 1 | 2 | 3 | 4;
  country_featured: 0 | 1;
  created_at: string;
  updated_at: string;
}

/**
 * Get the single hero photo for the homepage.
 * Returns the photo where homepage_featured = 1.
 */
export function getHomepageFeatured(): Photo | null {
  const query = `
    SELECT * FROM photos
    WHERE homepage_featured = 1
    LIMIT 1
  `;
  const result = getDb().prepare(query).get() as Photo | undefined;
  return result || null;
}

/**
 * Get the navigation photos for all categories (one per category).
 * Returns photos where category_featured = 1 for each category.
 * Used for homepage Photography section.
 */
export function getCategoryNavigationPhotos(): Photo[] {
  const query = `
    SELECT * FROM photos
    WHERE category_featured = 1
    ORDER BY
      CASE category
        WHEN 'nature' THEN 1
        WHEN 'street' THEN 2
        WHEN 'concert' THEN 3
      END
  `;
  return getDb().prepare(query).all() as Photo[];
}

/**
 * Get all featured photos in a specific category (category_featured > 0).
 * Used for both portfolio overview and category detail pages.
 * Photos are ordered by category_featured priority.
 */
export function getAllCategoryPhotos(category: string): Photo[] {
  const query = `
    SELECT * FROM photos
    WHERE category = ? AND category_featured > 0
    ORDER BY category_featured ASC
  `;
  return getDb().prepare(query).all(category) as Photo[];
}

/**
 * Get all photos from a specific country.
 * Used for country-specific portfolio pages.
 * Excludes concert photos.
 */
export function getCountryPhotos(country: string): Photo[] {
  const query = `
    SELECT * FROM photos
    WHERE country = ? AND category != 'concert'
    ORDER BY
      CASE WHEN location IS NULL THEN 1 ELSE 0 END,
      location ASC
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
 * Get the navigation photos for all countries (one per country).
 * Returns photos where country_featured = 1 for each country.
 * Used for /portfolio/all-countries page.
 * Sorted alphabetically by country name.
 */
export function getCountryFeaturedPhotos(): Photo[] {
  const query = `
    SELECT * FROM photos
    WHERE country_featured = 1
    ORDER BY country ASC
  `;
  return getDb().prepare(query).all() as Photo[];
}

/**
 * Get all unique categories.
 * Used for generating static category pages.
 */
export function getAllCategories(): string[] {
  return ['nature', 'street', 'concert'];
}

/**
 * Convert a Photo object to its full image path.
 * Path format: /photography/{category}/{filename}
 */
export function getPhotoPath(photo: Photo): string {
  return `/photography/${photo.category}/${photo.filename}`;
}

/**
 * Generate alt text for a photo from its metadata.
 * Format: {country}, {location} - {caption}
 * All fields are required and guaranteed to be non-empty.
 */
export function getPhotoAlt(photo: Photo): string {
  return `${photo.country}, ${photo.location} - ${photo.caption}`;
}

