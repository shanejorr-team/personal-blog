-- Photo metadata database schema
-- This database stores metadata for all portfolio photos

CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT UNIQUE NOT NULL,         -- e.g., us-georgia-nature-1.jpg
  category TEXT NOT NULL CHECK(category IN ('nature', 'street', 'concert')),
  caption TEXT NOT NULL CHECK(length(caption) > 0),
  location TEXT NOT NULL CHECK(length(location) > 0),  -- Specific location within country
  country TEXT NOT NULL CHECK(length(country) > 0),
  date TEXT,                             -- ISO 8601 date string
  sub_category TEXT,                     -- Grouping within category
  homepage_featured INTEGER,             -- 1-7 for homepage featured, NULL if not featured
  category_featured INTEGER,             -- Priority for category page, NULL if not featured
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_category ON photos(category);
CREATE INDEX IF NOT EXISTS idx_country ON photos(country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_homepage_featured ON photos(homepage_featured) WHERE homepage_featured IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_category_featured ON photos(category, category_featured) WHERE category_featured IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_filename ON photos(filename);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_photos_timestamp
AFTER UPDATE ON photos
BEGIN
  UPDATE photos SET updated_at = datetime('now') WHERE id = NEW.id;
END;
