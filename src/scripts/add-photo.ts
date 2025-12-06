#!/usr/bin/env node

/**
 * Interactive CLI tool for adding new photos to the database.
 *
 * This script provides a user-friendly interface to add photo metadata
 * without manually editing the database.
 *
 * Usage: npm run photo:add
 */

import Database from 'better-sqlite3';
import prompts from 'prompts';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '..', 'db', 'photos.db');

async function addPhoto() {
  console.log('\n📸 Add New Photo to Database\n');

  const answers = await prompts(
    [
      {
        type: 'text',
        name: 'filename',
        message: 'Filename (e.g., us-georgia-nature-1.jpg):',
        validate: (val: string) => {
          if (!val) return 'Filename is required';
          if (!val.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
            return 'Filename must end with .jpg, .jpeg, .png, .webp, or .avif';
          }
          return true;
        },
      },
      {
        type: 'select',
        name: 'category',
        message: 'Category:',
        choices: [
          { title: 'Nature', value: 'nature' },
          { title: 'Street', value: 'street' },
          { title: 'Concert', value: 'concert' },
        ],
      },
      {
        type: 'text',
        name: 'caption',
        message: 'Caption (required):',
        validate: (val: string) => (val?.trim() ? true : 'Caption is required'),
      },
      {
        type: 'text',
        name: 'location',
        message: 'Location (required):',
        validate: (val: string) => (val?.trim() ? true : 'Location is required'),
      },
      {
        type: 'text',
        name: 'country',
        message: 'Country (required):',
        validate: (val: string) => (val?.trim() ? true : 'Country is required'),
      },
      {
        type: 'confirm',
        name: 'homepage_featured',
        message: 'Set as homepage hero photo?',
        initial: false,
      },
      {
        type: 'confirm',
        name: 'add_category_featured',
        message: 'Add to category featured?',
        initial: false,
      },
      {
        type: (prev: boolean) => (prev ? 'number' : null),
        name: 'category_featured',
        message: 'Category featured priority (1=navigation, 2-4=portfolio order, 0=not featured):',
        validate: (val: number) => {
          if (![0, 1, 2, 3, 4].includes(val)) {
            return 'Priority must be 0, 1, 2, 3, or 4';
          }
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'country_featured',
        message: 'Set as country navigation photo?',
        initial: false,
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Add this photo to the database?',
        initial: true,
      },
    ],
    {
      onCancel: () => {
        console.log('\n❌ Cancelled');
        process.exit(0);
      },
    }
  );

  if (!answers.confirm) {
    console.log('\n❌ Cancelled');
    return;
  }

  // Open database (not readonly)
  const db = new Database(DB_PATH);

  try {
    // Check if filename already exists
    const existing = db
      .prepare('SELECT id FROM photos WHERE filename = ?')
      .get(answers.filename);

    if (existing) {
      console.error(`\n❌ Error: Photo with filename "${answers.filename}" already exists`);
      db.close();
      process.exit(1);
    }

    // Insert photo
    const insert = db.prepare(`
      INSERT INTO photos (
        filename, category, caption, location, country,
        homepage_featured, category_featured, country_featured
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      answers.filename,
      answers.category,
      answers.caption,
      answers.location,
      answers.country,
      answers.homepage_featured ? 1 : 0,
      answers.add_category_featured ? answers.category_featured : 0,
      answers.country_featured ? 1 : 0
    );

    console.log(`\n✅ Photo added successfully! (ID: ${result.lastInsertRowid})`);
    console.log(`\n📁 Make sure the photo exists at:`);
    console.log(`   src/photography/${answers.category}/${answers.filename}`);
  } catch (error) {
    console.error('\n❌ Error adding photo:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run the CLI
addPhoto();
