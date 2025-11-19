-- Photo metadata database schema
-- This database stores metadata for all portfolio photos

CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT UNIQUE NOT NULL,         -- e.g., us-georgia-nature-1.jpg
  category TEXT NOT NULL CHECK(category IN ('nature', 'street', 'concert')),
  caption TEXT NOT NULL CHECK(length(caption) > 0),
  location TEXT NOT NULL CHECK(length(location) > 0),  -- Specific location within country
  country TEXT NOT NULL CHECK(length(country) > 0),
  homepage_featured INTEGER DEFAULT 0 NOT NULL CHECK(homepage_featured IN (0, 1)),  -- Boolean: 1 for hero photo, 0 otherwise
  category_featured INTEGER DEFAULT 0 NOT NULL CHECK(category_featured IN (0, 1, 2, 3, 4)),  -- Priority: 1=featured nav, 2-4=portfolio order, 0=not featured
  country_featured INTEGER DEFAULT 0 NOT NULL CHECK(country_featured IN (0, 1)),  -- Boolean: 1 for country nav photo, 0 otherwise
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_category ON photos(category);
CREATE INDEX IF NOT EXISTS idx_country ON photos(country);
CREATE INDEX IF NOT EXISTS idx_homepage_featured ON photos(homepage_featured);
CREATE INDEX IF NOT EXISTS idx_category_featured ON photos(category, category_featured);
CREATE INDEX IF NOT EXISTS idx_country_featured ON photos(country, country_featured);
CREATE INDEX IF NOT EXISTS idx_filename ON photos(filename);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_photos_timestamp
AFTER UPDATE ON photos
BEGIN
  UPDATE photos SET updated_at = datetime('now') WHERE id = NEW.id;
END;
