# Photography Blog & Portfolio

An Astro-based photography blog with TypeScript and Tailwind CSS.

## Technical Stack

- **Astro** - Static site generator with file-based routing
- **Tailwind CSS** - Utility-first CSS framework with dark mode support
- **TypeScript** - Strict mode enabled
- **Content Collections** - Type-safe content management for blog posts
- **SQLite** - Database for portfolio photo metadata (via better-sqlite3)
- **Git LFS** - Large File Storage for managing high-resolution photography

## Git Large File Storage (LFS)

This repository uses **Git LFS** to efficiently manage large photo files. All photography images (JPG, PNG, WebP, AVIF, etc.) are stored in Git LFS rather than directly in the Git repository.

### Why Git LFS?

With 100+ high-resolution photos (15-22MB each), storing images directly in Git would:
- Create a multi-gigabyte repository
- Slow down git operations (clone, pull, status)
- Bloat the `.git` folder with every photo version in history

Git LFS solves this by:
- Storing only small pointer files (~150 bytes) in the Git repository
- Keeping actual photos in LFS storage
- Downloading photos on-demand when needed
- Maintaining fast git operations regardless of photo collection size

### Files Tracked by LFS

The following file types are automatically tracked by LFS (configured in [.gitattributes](.gitattributes)):

**Photography formats:**
- `*.jpg`, `*.jpeg` - JPEG images (primary format)
- `*.png` - PNG images
- `*.webp`, `*.avif` - Modern web formats
- `*.tif`, `*.tiff` - High-quality formats

**Video formats** (for future use):
- `*.mp4`, `*.mov`, `*.avi`, `*.webm`

**Design files** (for future use):
- `*.psd`, `*.ai`, `*.sketch`, `*.fig`

**Note:** SVG files are NOT in LFS as they are text-based and Git handles them efficiently.

### Setup for New Contributors

If you're cloning this repository:

1. **Install Git LFS** (one-time setup):
   ```bash
   # macOS
   brew install git-lfs

   # Linux
   apt-get install git-lfs  # Debian/Ubuntu
   yum install git-lfs      # RedHat/CentOS

   # Windows
   # Download from https://git-lfs.github.com/
   ```

2. **Initialize Git LFS**:
   ```bash
   git lfs install
   ```

3. **Clone the repository**:
   ```bash
   git clone https://github.com/shanejorr/personal-blog.git
   cd personal-blog
   ```

   Git LFS will automatically download the photo files during clone.

4. **Verify LFS files**:
   ```bash
   git lfs ls-files
   # Should show all tracked photos
   ```

### Working with LFS Files

**Normal git commands work as expected:**
```bash
git add src/images/photography/nature/new-photo.jpg
git commit -m "Add new photo"
git push
```

Git LFS handles the large file transfer automatically.

**Checking LFS status:**
```bash
git lfs ls-files              # List all LFS-tracked files
git lfs status                # Show LFS file status
```

### Deployment Considerations

**Vercel/Netlify:** Both platforms support Git LFS automatically. They will:
1. Download LFS pointer files from GitHub
2. Fetch actual photos from LFS storage during build
3. Process images through Astro's optimization pipeline

**GitHub LFS Costs:**
- **Free Plan**: 1GB storage + 1GB/month bandwidth
- **Team Plan ($4/month)**: 250GB storage + 250GB/month bandwidth (recommended)
- Each Vercel deployment downloads all photos, consuming bandwidth

With 100+ photos (~15GB) and regular deployments, the **GitHub Team plan is required** to avoid bandwidth overage charges.

### Important Notes

- Build outputs in `dist/` are **not** in LFS (already in `.gitignore`)
- LFS files appear as normal files in your working directory
- First clone may take several minutes to download all photos
- Your local `.git` folder includes LFS cache but stays relatively small
- History rewrites (like the initial LFS migration) require force push

## Project Structure

```
/
├── backups/                 # JSON exports from database (gitignored)
├── public/
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Breadcrumbs.astro
│   │   ├── DarkModeToggle.astro
│   │   ├── Lightbox.astro   # Photo lightbox with auto-initialization
│   │   └── PhotoGridItem.astro  # Reusable photo grid button component
│   ├── content/
│   │   ├── config.ts        # Content collection schemas
│   │   ├── pages/           # Standalone pages (e.g., about.md)
│   │   ├── photography-journal/  # Markdown posts
│   │   └── writings/        # Markdown posts
│   ├── db/
│   │   ├── photos.db        # SQLite database with photo metadata
│   │   └── schema.sql       # Database schema definition
│   ├── images/
│   │   ├── photography/     # Portfolio-worthy photos
│   │   │   ├── _staging/    # Staging directory for bulk imports
│   │   │   ├── nature/
│   │   │   ├── street/
│   │   │   └── concert/
│   │   └── assets/          # Non-portfolio images for blog posts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/               # File-based routing
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── journal/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── writings/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── portfolio/
│   │   │   ├── index.astro
│   │   │   ├── [category].astro
│   │   │   └── [country].astro
│   │   ├── rss-journal.xml.ts
│   │   └── rss-writings.xml.ts
│   ├── scripts/             # CLI tools for database management
│   │   ├── shared/
│   │   │   └── validation.ts  # Shared validation utilities
│   │   ├── migrate-json-to-db.ts  # One-time migration from JSON
│   │   ├── add-photo.ts     # Interactive CLI for adding photos
│   │   ├── generate-template.ts # Generate CSV template from staging
│   │   ├── import-photos-csv.ts # Bulk import from CSV
│   │   ├── update-photos-csv.ts # Bulk update from CSV
│   │   └── export-backup.ts # Export database to JSON
│   ├── styles/
│   │   └── global.css
│   └── utils/
│       ├── db.ts            # Database query functions
│       ├── helpers.ts
│       ├── imageLoader.ts   # Dynamic image imports using Vite glob
│       ├── categories.ts    # Category configuration (titles, nav info)
│       └── processPhotos.ts # Shared image processing for portfolio pages
```

## Content Schemas

### Photography Journal Posts
Location: `src/content/photography-journal/*.md`

```markdown
---
title: string
description: string
date: Date
location?: string
country?: string
featuredImage?: relative path to image (e.g., ../../images/photography/nature/photo.jpg)
tags: string[]
draft: boolean
---

Content in standard Markdown format.
```

**Note:** `featuredImage` uses Astro's `image()` helper for type-safe, optimized image handling. Reference images using relative paths from the markdown file.

### Writings Posts
Location: `src/content/writings/*.md`

```markdown
---
title: string
description: string
date: Date
featuredImage?: relative path to image (e.g., ../../images/assets/image.png)
tags: string[]
draft: boolean
---

Content in standard Markdown format.
```

**Note:** `featuredImage` uses Astro's `image()` helper for type-safe, optimized image handling. Reference images using relative paths from the markdown file.

### Pages
Location: `src/content/pages/*.md`

```markdown
---
title: string
description: string
---

Content in standard Markdown format.
```

**Note:** Used for standalone pages like About. Simple schema with just title and description for SEO metadata.

### Portfolio Database
Location: `src/db/photos.db` (SQLite database)

**Database Schema:**
```sql
CREATE TABLE photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT UNIQUE NOT NULL,         -- e.g., us-georgia-nature-1.jpg
  category TEXT NOT NULL CHECK(category IN ('nature', 'street', 'concert')),
  caption TEXT NOT NULL CHECK(length(caption) > 0),
  location TEXT NOT NULL CHECK(length(location) > 0),  -- Specific location within country
  country TEXT NOT NULL CHECK(length(country) > 0),
  date TEXT,                             -- ISO 8601 date string
  sub_category TEXT,                     -- Grouping within category
  homepage_featured INTEGER,             -- 1-7 for homepage, NULL if not featured
  category_featured INTEGER,             -- Priority for category page, NULL if not featured
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**Alt Text Generation:**
Alt text is automatically generated from photo metadata using the formula:
```
{country}, {location} - {caption}
```
Example: "United States, Northern Georgia - Fall colors at sunset atop Blood Mountain."

All three fields (country, location, caption) are required and cannot be empty, ensuring every photo has a descriptive, accessible alt attribute.

**Featured System:**
- `homepage_featured`: Fixed 7 photos (1-7) for homepage hero + grid
- `category_featured`: Separate priority system for category portfolio pages
- Photos can be featured on homepage, category page, both, or neither
- Lower numbers = higher priority (featured: 1 appears before featured: 2)

**Portfolio Organization:**
- **Homepage Featured Work**: Queries `homepage_featured IS NOT NULL` and limits to 7
  - Hero image: `homepage_featured: 1`
  - Featured grid: `homepage_featured: 2-7`
- **Main portfolio page** (`/portfolio`): Shows all category featured photos
  - Queries `category_featured IS NOT NULL` per category
  - Photos sorted by `category_featured` priority within each category
- **Category pages** (`/portfolio/[category]`): Shows all photos in category
  - Groups by `sub_category` field (alphabetically)
  - Displays all photos regardless of featured status
- **Country pages** (`/portfolio/[country]`): Shows all photos from country
  - Groups by `location` field within country
  - Displays all photos regardless of featured status

**Data Efficiency:**
- Single source of truth: One database for all portfolio metadata
- Indexed queries load only needed data per page
- Scales to thousands of photos without performance degradation
- Build-time queries ensure fast runtime performance

## Key Patterns

### Image Organization
**Single Source of Truth:** All images are stored in `src/images/` with automatic optimization:
- **Portfolio photos**: `src/images/photography/{category}/` - organized by photo type
- **Non-portfolio assets**: `src/images/assets/` - for writings and other content

**Content Type Image Usage:**
- **Photography journal posts**: Reference portfolio images via relative paths using Astro's `image()` helper
- **Portfolio galleries**: Metadata stored in SQLite database, images loaded through `imageLoader.ts`
- **Writings posts**: Reference assets via relative paths using Astro's `image()` helper

**Technical Implementation:**
- **Portfolio images**: Loaded dynamically using Vite's `import.meta.glob()` in `src/utils/imageLoader.ts`
  - Database stores filename only (e.g., `us-georgia-nature-1.jpg`)
  - Full path constructed as `/images/photography/{category}/{filename}`
  - The image loader maps these paths to imported image objects at build time
  - Database queries in `src/utils/db.ts` provide type-safe metadata access
- **Journal & writings images**: Use Astro's `image()` schema helper for direct imports
  - Content files use relative paths like `../../images/assets/filename.jpg`
  - Astro automatically imports and optimizes images at build time
  - Type-safe with build-time validation

**Benefits:**
- Automatic image optimization (WebP conversion, resizing, quality adjustment)
- Dramatic file size reductions (1.1MB → ~200-400KB for assets, 2-3MB → ~500-800KB for portfolio)
- No image duplication
- Type-safe image references with build failures on missing images
- Easy maintenance - update once, changes everywhere
- Clear organization by content type and photo category
- Better Core Web Vitals and performance scores

### Routing
- File-based routing in `src/pages/`
- Dynamic routes use `[slug].astro` format
- Content fetched via Astro Content Collections API

### Image Paths
- **Portfolio images (metadata in SQLite database):**
  - Physical location: `src/images/photography/{category}/filename.jpg`
  - Database stores: `filename` (e.g., `us-georgia-nature-1.jpg`) and `category`
  - Full path constructed by `getPhotoPath()`: `/images/photography/{category}/{filename}`
  - Loaded via `imageLoader.ts` utility
  - Automatically optimized at build time (WebP conversion, responsive sizes, lazy loading)
  - Lightbox optimization: Resized to max 1920px width, WebP format, 85% quality

- **Journal & Writings featured images:**
  - Physical location: `src/images/photography/{category}/` or `src/images/assets/`
  - Reference path in frontmatter: Relative path (e.g., `../../images/assets/filename.jpg`)
  - Loaded via Astro's `image()` schema helper
  - Automatically optimized at build time (WebP/AVIF conversion, responsive sizes, lazy loading)
  - Type-safe with build-time validation

### Image Display Behavior

**All Portfolio Pages (Justified Grid):**

- **Homepage Featured Work Grid**: Uses justified grid layout
- **Main Portfolio Page**: Uses justified grid layout for featured photos
- **Category Pages**: Uses justified grid layout for all category photos
- **Country Pages**: Uses justified grid layout for all country photos

**Justified Grid Implementation:**
- Layout similar to Flickr/Google Photos
- Images maintain their **native aspect ratios** without forced cropping
- Flexbox-based layout with calculated dimensions
- Row height: 280px (fixed), widths vary based on actual image aspect ratio
- Formula: `width = 280px × image_aspect_ratio`
- Aspect ratios calculated at build time using Sharp
- Uses `object-fit: cover` to ensure clean fills
- Retina display support: 2x dimensions passed to Astro Image component
- Hover effects include `scale-110` transform on compatible devices
- Clean, professional rows preserving original compositions

**Technical Details:**
- Image dimensions read automatically at build time using Sharp library
- No manual dimension entry required in JSON files
- Fallback to 3:2 aspect ratio if image cannot be read
- Images optimized to WebP format at 80% quality
- Lazy loading applied (except hero image)

**Journal & Writings Listing Pages:**

- 16:9 aspect ratio thumbnails with `object-fit: cover`
- Clean fills without letterboxing
- Hover effects on journal thumbnails

**Lightbox:**

- Uses raw `<img>` tag (not Astro Image component)
- Displays full-resolution original images with `object-fit: contain`
- No image optimization applied (shows original JPG/PNG files)
- Letterboxing/pillarboxing preserves aspect ratios
- Max constraints: 100% width, 70vh height (60vh on mobile)
- **Auto-initialization**: Automatically detects `.photo-grid-item` buttons and groups photos by `data-group` attribute
- Supports keyboard navigation (arrow keys, Escape)
- Works with Astro view transitions (re-initializes on `astro:page-load`)

**PhotoGridItem Component:**

Use `PhotoGridItem.astro` for consistent photo grid buttons across all portfolio pages:

```astro
<PhotoGridItem
  photo={processedPhoto}
  group="category-name"  <!-- Groups photos for lightbox navigation -->
  index={0}              <!-- Position in group for lightbox -->
/>
```

The component renders a button with all required data attributes for lightbox auto-initialization.

**Key Principle:** All portfolio pages preserve native aspect ratios using justified grid layout. Journal and writings listing pages use fixed aspect ratios with `object-fit: cover` for clean thumbnails. Full images always visible in lightbox with proper aspect ratios.

### Dark Mode
- Implemented with Tailwind's `dark:` classes
- Toggle in header, preference saved to localStorage
- Configure with `darkMode: 'class'` in `tailwind.config.js`

### Content Collections & Database
- **Content Collections**: Blog posts and pages use Astro Content Collections
  - Schemas defined in `src/content/config.ts`
  - Type-safe querying with `getCollection()` and `getEntry()`
  - Collections: `photography-journal`, `writings`, `pages`
- **Portfolio Database**: Photos use SQLite database
  - Schema defined in `src/db/schema.sql`
  - Type-safe queries in `src/utils/db.ts`
  - Indexed for fast querying at scale

### Customization Locations
- Site metadata: `src/layouts/BaseLayout.astro`
- Site domain: `astro.config.mjs`
- Branding: `src/components/Header.astro`, `src/components/Footer.astro`
- Styles: `tailwind.config.js`, `src/styles/global.css`

## Photo Management Tools

### Adding New Photos

**Interactive CLI Tool** (for single photos):
```bash
npm run photo:add
```

Prompts for all photo metadata:
- Filename (must be in `src/images/photography/{category}/`)
- Category (nature, street, concert)
- Caption (required - used for alt text generation)
- Location (required - used for alt text generation)
- Country (required - used for alt text generation)
- Date, sub-category (optional)
- Homepage featured (1-7 for homepage)
- Category featured (any number for category portfolio)

**Staging Directory Workflow** (recommended for bulk imports):

For bulk imports, use the staging directory to generate a pre-populated CSV template:

```bash
# 1. Copy photos to staging directory (use consistent naming: [country]-[location]-[category]-[number].jpg)
cp /path/to/photos/* src/images/photography/_staging/

# 2. Generate CSV template with metadata pre-populated from filenames
npm run photo:template
```

This creates `src/images/photography/_staging/photo-template.csv` with:
- `filename`, `category`, `location`, `country` columns **auto-populated from filename**
- Filename format: `[country]-[location]-[category]-[number].jpg`
  - Example: `us-north_georgia-nature-1.jpg`
  - Country: `us` → `United States` (title case, special conversion for 'us')
  - Location: `north_georgia` → `North Georgia` (underscores → spaces, title case)
  - Category: `nature` → `nature` (lowercase, must be valid: nature, street, concert)
- Invalid categories trigger warnings and are left blank in CSV
- Only valid image files included (.jpg, .jpeg, .png, .webp, .avif)
- System files (.DS_Store, etc.) excluded

**Complete Staging Workflow:**
1. Copy photos to `src/images/photography/_staging/` (use naming format: `[country]-[location]-[category]-[number].jpg`)
2. Run `npm run photo:template` to generate CSV with pre-populated metadata
3. Open `_staging/photo-template.csv` and review/edit:
   - **Review pre-populated fields**: category, location, country (auto-filled from filename)
   - **Fill in required field**: caption (used for alt text generation)
   - **Optionally fill in**: date, sub_category, homepage_featured, category_featured
4. Move photos from `_staging/` to `src/images/photography/{category}/`
5. Run `npm run photo:import src/images/photography/_staging/photo-template.csv --dry-run`
6. Run `npm run photo:import src/images/photography/_staging/photo-template.csv` to import

**CSV Bulk Import** (alternative manual workflow):
```bash
npm run photo:import photos.csv
npm run photo:import photos.csv --dry-run  # Preview without importing
```

**CSV Format:**
```csv
filename,category,caption,location,country,date,sub_category,homepage_featured,category_featured
us-example-nature-1.jpg,nature,Mountain sunset at golden hour,Rocky Mountains,United States,2024-03-15,Colorado,,1
turkey-istanbul-street-1.jpg,street,Busy market street scene,Istanbul,Turkey,2024-06-10,City Life,4,2
```

**Required columns:** `filename`, `category`, `caption`, `location`, `country`
**Optional columns:** `date`, `sub_category`, `homepage_featured`, `category_featured`

**Note:** Alt text is automatically generated as `{country}, {location} - {caption}`, so all three metadata fields are required to ensure accessibility.

**Validation:**
The import tool validates:
- ✅ All required columns present
- ✅ Category is valid (`nature`, `street`, `concert`)
- ✅ Date format is `YYYY-MM-DD`
- ✅ `homepage_featured` is 1-7 or empty
- ✅ `category_featured` is a positive number or empty
- ✅ Photo files exist in correct directories
- ✅ No duplicate filenames (in CSV or database)

**Import Features:**
- Transaction-based (all succeed or all fail - atomic operation)
- Detailed error messages with row and column numbers
- Summary statistics by category
- Dry-run mode to preview changes
- Confirmation prompt before importing

**Template:**
Use `photo-import-template.csv` in the project root as a starting point.

**Workflow:**
1. Copy photos to `src/images/photography/{category}/`
2. Prepare CSV in Excel/Google Sheets using template
3. Export as CSV
4. Run `npm run photo:import photos.csv --dry-run` to validate
5. Run `npm run photo:import photos.csv` to import
6. Confirm and import completes

**Direct Database Access** (advanced):
Use [DB Browser for SQLite](https://sqlitebrowser.org/) to open `src/db/photos.db`:
- GUI interface for viewing and editing photos
- Bulk operations with SQL queries
- Example: `UPDATE photos SET sub_category = 'Appalachian Trail' WHERE location LIKE '%Blood Mountain%'`

### Updating Existing Photos

**CSV Update Workflow** (recommended for bulk metadata updates):

For bulk updates to existing photos (e.g., rewriting all captions in a new style):

```bash
# 1. Export all photos to CSV
npm run db:export-csv
# Creates: backups/photos-export.csv with all 186 photos

# 2. Edit metadata in Excel/Google Sheets
# - Open backups/photos-export.csv
# - Edit caption, location, country, or other columns
# - Keep filename column unchanged (used to identify photos)
# - Save as CSV

# 3. Preview changes
npm run photo:update backups/photos-export.csv --dry-run
# Shows: which photos will be updated and what fields will change

# 4. Apply updates
npm run photo:update backups/photos-export.csv
# Confirms, updates database, shows success summary
```

**CSV Format for Updates:**
```csv
filename,caption,location,country
us-example-nature-1.jpg,New caption text,Updated location,United States
turkey-istanbul-street-1.jpg,Another new caption,Istanbul,Turkey
```

**Update Features:**
- **Flexible updates:** Only columns present in CSV are updated (can update just captions, or multiple fields)
- **Identifier:** Uses `filename` to match existing photos (or `id` column)
- **Validation:** Same strict validation as import (caption/location/country cannot be empty, etc.)
- **Transaction-based:** All updates succeed or all fail (atomic operation)
- **Dry-run mode:** Preview changes before committing
- **Auto-timestamp:** `updated_at` field automatically set to current time

**Updateable Columns:**
- `caption` - Photo caption (required, used for alt text)
- `location` - Specific location (required, used for alt text)
- `country` - Country name (required, used for alt text)
- `date` - ISO 8601 date (YYYY-MM-DD)
- `sub_category` - Grouping within category
- `homepage_featured` - Homepage priority (1-7 or empty)
- `category_featured` - Category page priority (positive number or empty)
- `category` - Photo category (note: changing category requires moving image files)

**Not updateable:**
- `id` - Auto-increment primary key
- `filename` - Used as identifier (would break image references)
- `created_at` - Original creation timestamp

**Example Use Cases:**
- Rewrite all 186 captions in a new style
- Update locations to be more specific
- Add dates to photos that are missing them
- Change featured status for multiple photos
- Bulk update sub-categories for organization

### Bulk Updates

**Common SQL Operations:**
```sql
-- Set sub-category for all photos from a location
UPDATE photos SET sub_category = 'Istanbul' WHERE location LIKE '%Istanbul%';

-- Make photo homepage featured
UPDATE photos SET homepage_featured = 7 WHERE filename = 'photo.jpg';

-- Remove homepage featured status
UPDATE photos SET homepage_featured = NULL WHERE id = 123;

-- Set category featured for all photos in a country
UPDATE photos
SET category_featured = id
WHERE country = 'Turkey' AND category_featured IS NULL;
```

### Backup & Export

**Export to JSON** (for version control review):
```bash
npm run db:export
```

Creates JSON files in `backups/`:
- `nature.json`, `street.json`, `concert.json` - By category
- `complete-backup.json` - Full database with all metadata

**Note:** Backup files are gitignored but useful for:
- Reviewing changes in human-readable format
- Migrating to another system
- Disaster recovery

### Database Queries in Code

**Available Query Functions** (in `src/utils/db.ts`):

```typescript
// Homepage
getHomepageFeatured(): Photo  // Single hero photo (homepage_featured = 1)

// Category pages
getCategoryFeatured(category: string): Photo[]  // Featured photos for portfolio
getCategoryNavigationPhotos(): Photo[]  // One photo per category (category_featured = 1)
getAllCategoryPhotos(category: string): Photo[]  // All photos in category

// Country pages
getCountryPhotos(country: string): Photo[]
getCountryFeaturedPhotos(): Photo[]  // One photo per country (country_featured = 1)
getAllCountries(): string[]

// Utility
getPhotoPath(photo: Photo): string  // Constructs full image path
getPhotoAlt(photo: Photo): string   // Generates alt text from metadata
```

**Shared Image Processing** (in `src/utils/processPhotos.ts`):

```typescript
// Process single photo with dimensions and imported image
processPhoto(photo: Photo): Promise<ProcessedPhoto>

// Process array of photos for portfolio grids
processPhotos(photos: Photo[]): Promise<ProcessedPhoto[]>

// Process navigation photos (category/country nav)
processNavPhotos(photos: Photo[]): Promise<ProcessedNavPhoto[]>
```

**Category Configuration** (in `src/utils/categories.ts`):

```typescript
// Category display info (title, description)
CATEGORY_INFO: Record<string, { title: string; description: string }>

// Category navigation info (name, url)
CATEGORY_NAV_INFO: Record<string, { name: string; url: string }>
```

### Workflow for Adding Photos

1. **Add photo file** to `src/images/photography/{category}/`
   - Use descriptive filename: `{country}-{location}-{category}-{number}.jpg`
   - Example: `us-georgia-nature-1.jpg`, `turkey-istanbul-street-12.jpg`

2. **Add metadata** using CLI:
   ```bash
   npm run photo:add
   ```

3. **Verify** the photo appears on the site:
   - Run `npm run dev` to start development server
   - Check category page: `/portfolio/{category}`
   - If featured, check homepage and main portfolio page

4. **Commit changes**:
   ```bash
   git add src/images/photography/{category}/new-photo.jpg
   git add src/db/photos.db
   git commit -m "Add new photo: {description}"
   ```

### Scaling Considerations

The database architecture is designed to scale to thousands of photos:

- **Performance**: Indexed queries remain fast with 10,000+ photos
- **Maintainability**: No more giant JSON files to edit
- **Flexibility**: SQL queries support complex filtering and sorting
- **Type Safety**: TypeScript interfaces ensure data consistency
- **Build Time**: Only needed photos loaded per page (not all 2000+)

**Current Stats** (as example):
- 61 total photos
- 6 homepage featured
- 6 category featured
- Sub-second build times

**At Scale** (projected for 2000+ photos):
- ~2MB database file
- Same sub-second query times (thanks to indexes)
- 5-15 minute build times (due to image optimization)
- Easy bulk operations via SQL

## Important

When updating code, also update `README.md` and `CLAUDE.md` documentation.
