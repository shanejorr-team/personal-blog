/**
 * Shared validation utilities for CLI scripts.
 * Consolidates common validation logic used across import and update scripts.
 */

import { parse } from 'csv-parse/sync';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Database and image paths
export const DB_PATH = join(process.cwd(), 'src', 'db', 'photos.db');
export const IMAGES_BASE = join(process.cwd(), 'src', 'images', 'photography');

// Valid categories matching database schema
export const VALID_CATEGORIES = ['nature', 'street', 'concert'] as const;
export type Category = typeof VALID_CATEGORIES[number];

// Valid image extensions
export const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

// Validation error interface
export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

/**
 * Validate a filename has a valid image extension
 */
export function validateFilename(filename: string | undefined, rowNum: number): ValidationError | null {
  if (!filename?.trim()) {
    return { row: rowNum, field: 'filename', message: 'Filename is required' };
  }

  const hasValidExt = VALID_EXTENSIONS.some(ext =>
    filename.toLowerCase().endsWith(ext)
  );

  if (!hasValidExt) {
    return {
      row: rowNum,
      field: 'filename',
      message: `Must end with ${VALID_EXTENSIONS.join(', ')}`
    };
  }

  return null;
}

/**
 * Validate category is one of the allowed values
 */
export function validateCategory(category: string | undefined, rowNum: number, required: boolean = true): ValidationError | null {
  if (!category?.trim()) {
    return required
      ? { row: rowNum, field: 'category', message: 'Category is required' }
      : null;
  }

  if (!VALID_CATEGORIES.includes(category as Category)) {
    return {
      row: rowNum,
      field: 'category',
      message: `Must be one of: ${VALID_CATEGORIES.join(', ')}`
    };
  }

  return null;
}

/**
 * Validate a required text field is not empty
 */
export function validateRequiredField(
  value: string | undefined,
  fieldName: string,
  rowNum: number
): ValidationError | null {
  if (!value?.trim()) {
    return { row: rowNum, field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required` };
  }
  return null;
}

/**
 * Validate homepage_featured field (must be 0 or 1)
 */
export function validateHomepageFeatured(value: string | undefined, rowNum: number): ValidationError | null {
  if (!value?.trim()) return null;

  const parsed = parseInt(value.trim());
  if (isNaN(parsed) || ![0, 1].includes(parsed)) {
    return {
      row: rowNum,
      field: 'homepage_featured',
      message: 'Must be 0 or 1 (0=not hero, 1=hero photo)'
    };
  }

  return null;
}

/**
 * Validate category_featured field (must be 0-4)
 */
export function validateCategoryFeatured(value: string | undefined, rowNum: number): ValidationError | null {
  if (!value?.trim()) return null;

  const parsed = parseInt(value.trim());
  if (isNaN(parsed) || ![0, 1, 2, 3, 4].includes(parsed)) {
    return {
      row: rowNum,
      field: 'category_featured',
      message: 'Must be 0, 1, 2, 3, or 4 (1=navigation, 2-4=portfolio order, 0=not featured)'
    };
  }

  return null;
}

/**
 * Validate country_featured field (must be 0 or 1)
 */
export function validateCountryFeatured(value: string | undefined, rowNum: number): ValidationError | null {
  if (!value?.trim()) return null;

  const parsed = parseInt(value.trim());
  if (isNaN(parsed) || ![0, 1].includes(parsed)) {
    return {
      row: rowNum,
      field: 'country_featured',
      message: 'Must be 0 or 1 (0=not country nav photo, 1=country nav photo)'
    };
  }

  return null;
}

/**
 * Check if a photo file exists at the expected path
 */
export function validatePhotoExists(
  filename: string | undefined,
  category: string | undefined,
  rowNum: number
): ValidationError | null {
  if (!filename?.trim() || !category?.trim()) return null;
  if (!VALID_CATEGORIES.includes(category as Category)) return null;

  const photoPath = join(IMAGES_BASE, category, filename.trim());
  if (!existsSync(photoPath)) {
    return {
      row: rowNum,
      field: 'filename',
      message: `Photo file not found at src/images/photography/${category}/${filename.trim()}`
    };
  }

  return null;
}

/**
 * Parse a CSV file and return records
 */
export function parseCSVFile<T>(filepath: string): T[] {
  let csvContent: string;
  try {
    csvContent = readFileSync(filepath, 'utf-8');
  } catch (error) {
    console.error(`❌ Error reading file: ${filepath}`);
    console.error(error);
    process.exit(1);
  }

  try {
    return parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as T[];
  } catch (error) {
    console.error('❌ Error parsing CSV file:');
    console.error(error);
    process.exit(1);
  }
}

/**
 * Check for required columns in CSV
 */
export function validateRequiredColumns(
  firstRow: object,
  requiredColumns: string[]
): string[] {
  return requiredColumns.filter(col => !(col in firstRow));
}

/**
 * Parse optional integer field, returning null for empty values
 */
export function parseOptionalInt(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = parseInt(value.trim());
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse featured field with default of 0 for empty values
 */
export function parseFeaturedField(value: string | undefined): number {
  if (!value?.trim()) return 0;
  const parsed = parseInt(value.trim());
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format validation errors for display
 */
export function formatErrors(errors: ValidationError[]): void {
  errors.forEach(error => {
    console.error(`  Row ${error.row}, ${error.field}: ${error.message}`);
  });
}
