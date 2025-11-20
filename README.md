# Photography Blog & Portfolio

A modern, fast, and beautiful photography blog built with Astro, TypeScript, and Tailwind CSS. Features a dual-section layout for photo stories and general writings, plus a curated portfolio with category galleries.

## ✨ Features

- **Photography Journal**: Travel photo stories with embedded images
- **Other Writings**: General blog posts and articles
- **Portfolio Galleries**: Organized by category (Nature, Street, Concert) and by country/location
- **SQLite Database**: Scalable photo metadata management with CLI tools
- **Dark Mode**: Automatic theme switching with localStorage persistence
- **Image Optimization**: Automatic WebP conversion and responsive images
- **RSS Feeds**: Separate feeds for journal and writings
- **Responsive Design**: Mobile-first, works beautifully on all devices
- **SEO Optimized**: Meta tags, sitemap, and semantic HTML
- **Fast Performance**: Static site generation with Astro
- **Type-Safe**: Built with TypeScript

## 🚀 Quick Start

### Prerequisites

This repository uses **Git LFS** for managing large photo files. Install it first:

```bash
# macOS
brew install git-lfs

# Linux
apt-get install git-lfs  # Debian/Ubuntu
yum install git-lfs      # RedHat/CentOS

# Initialize Git LFS
git lfs install
```

### Setup

```bash
# Clone the repository (LFS files download automatically)
git clone https://github.com/shanejorr/personal-blog.git
cd personal-blog

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:4321
```

## 📝 Adding Content

### Image Organization

This site uses a **single source of truth** approach with all images stored in `src/images/` for automatic optimization:

- **Photography**: Store all portfolio-worthy photos in `src/images/photography/{category}/` (nature, street, concert)
  - These images can be referenced by journal posts, portfolio galleries, and featured photos
  - No duplication needed - one image, multiple uses
- **Assets**: Store non-portfolio images in `src/images/assets/` (screenshots, diagrams, etc.)
  - Used primarily for writings posts that don't feature photography
  - All images automatically optimized at build time (WebP conversion, responsive sizing)

### Photography Journal Posts
Create Markdown files in `src/content/photography-journal/`:
```markdown
---
title: "Your Story"
description: "Story description"
date: 2024-03-15
location: "Tokyo, Japan"
featuredImage: ../../images/photography/street/tokyo-street.jpg
tags: ["travel", "japan"]
---

Your content here with ![images](/images/photography/street/image.jpg)
```

**Note:** Featured images use relative paths from the markdown file (e.g., `../../images/photography/{category}/filename.jpg`) and are loaded via Astro's `image()` helper for type-safe, optimized image handling with automatic WebP conversion. Inline images in content still use absolute paths like `/images/photography/{category}/filename.jpg` and are processed through the `imageLoader.ts` utility.

### Other Writings
Create Markdown files in `src/content/writings/`:
```markdown
---
title: "Your Post"
description: "Post description"
date: 2024-03-15
featuredImage: ../../images/assets/featured.jpg
tags: ["tutorial", "tips"]
---

Your content...
```

**Note:** Featured images use relative paths from the markdown file. Writings can use `../../images/assets/` for non-portfolio images (screenshots, diagrams, etc.) stored in `src/images/assets/`, or reference portfolio photography from `src/images/photography/` using `../../images/photography/{category}/` paths. All images are automatically optimized at build time with type-safe validation.

### Pages

Create Markdown files in `src/content/pages/`:

```markdown
---
title: "About - Shane Orr"
description: "Learn more about me"
---

# Your page content in markdown

Your markdown content here...
```

**Note:** Used for standalone pages like About (`about.md`). Simple schema with just title and description for SEO metadata. Page content is rendered using Astro's Content Collections for type-safe, maintainable pages.

### Portfolio Galleries

Portfolio photo metadata is stored in a SQLite database (`src/db/photos.db`) for scalability and ease of management.

**Add single photos using the interactive CLI:**

```bash
npm run photo:add
```

This will prompt you for:
- Filename (photo must already exist in `src/images/photography/{category}/`)
- Category (nature, street, concert)
- Caption (required - used for alt text generation)
- Location (required - used for alt text generation)
- Country (required - used for alt text generation)
- Homepage featured (0 or 1 - set as hero photo)
- Category featured (0-4 - priority for category portfolio pages)
- Country featured (0 or 1 - set as country navigation photo)

**Generate CSV template from staging directory:**

For bulk imports, use the staging directory workflow to generate a pre-populated CSV template:

```bash
# 1. Copy photos to staging directory
cp /path/to/photos/* src/images/photography/_staging/

# 2. Generate CSV template with filenames
npm run photo:template
```

This creates `src/images/photography/_staging/photo-template.csv` with filenames pre-populated and all other fields blank. You can then:
1. Open the CSV and fill in category, alt text, and optional metadata
2. Move photos from `_staging/` to their category folders
3. Import using the CSV (see below)

**Bulk import photos via CSV:**

For adding multiple photos at once, use CSV import:

```bash
npm run photo:import src/images/photography/_staging/photo-template.csv
```

**CSV Format:**
Use the provided template ([photo-import-template.csv](photo-import-template.csv)) or create your own with these columns:

```csv
filename,category,caption,location,country,homepage_featured,category_featured,country_featured
us-example-nature-1.jpg,nature,Mountain sunset at golden hour,Rocky Mountains,United States,0,1,0
```

**Required columns:** `filename`, `category`, `caption`, `location`, `country`
**Optional columns:** `homepage_featured`, `category_featured`, `country_featured`

**Note:** Alt text is automatically generated as `{country}, {location} - {caption}`, so all three metadata fields are required to ensure accessibility.

The import tool will:
- ✅ Validate all data before importing
- ✅ Check that photo files exist
- ✅ Prevent duplicate filenames
- ✅ Show detailed error messages with row numbers
- ✅ Support dry-run mode: `npm run photo:import photos.csv --dry-run`

**Staging Directory Workflow** (recommended for bulk imports):
1. Copy photos to `src/images/photography/_staging/` (use naming: `[country]-[location]-[category]-[number].jpg`)
2. Run `npm run photo:template` to generate CSV with **auto-populated** category, location, country
3. Open `_staging/photo-template.csv` and:
   - Review pre-populated fields (parsed from filename)
   - Fill in required field: `caption` (photo caption/description - used for alt text generation)
   - Optionally add: homepage_featured (0 or 1), category_featured (0-4), country_featured (0 or 1)
4. Move photos from `_staging/` to `src/images/photography/{category}/`
5. Run `npm run photo:import src/images/photography/_staging/photo-template.csv --dry-run`
6. Run `npm run photo:import src/images/photography/_staging/photo-template.csv` and confirm

**Filename Parsing Rules** (for auto-population):
- Format: `[country]-[location]-[category]-[number].jpg`
- Example: `us-north_georgia-nature-1.jpg` becomes:
  - Country: `United States` (title case, `us` → `United States`)
  - Location: `North Georgia` (underscores → spaces, title case)
  - Category: `nature` (lowercase, validated against: nature, street, concert)
- Invalid categories trigger warnings and are left blank

**Manual CSV Workflow:**
1. Copy photos to `src/images/photography/{category}/`
2. Prepare CSV in Excel/Google Sheets using template
3. Export as CSV
4. Run `npm run photo:import photos.csv`
5. Review validation results and confirm import

**Update existing photos:**

For bulk updates to existing photos (e.g., rewriting captions, updating locations):

```bash
# 1. Export all photos to CSV
npm run db:export-csv

# 2. Edit metadata in Excel/Google Sheets
# (Open backups/photos-export.csv, edit columns, keep filename unchanged)

# 3. Preview changes
npm run photo:update backups/photos-export.csv --dry-run

# 4. Apply updates
npm run photo:update backups/photos-export.csv
```

**Update Features:**
- Only columns present in CSV are updated (flexible updates)
- Uses `filename` to identify existing photos
- Same validation as import (caption/location/country cannot be empty)
- Transaction-based (all or nothing)
- Dry-run mode to preview changes
- Updateable columns: `category`, `caption`, `location`, `country`, `homepage_featured`, `category_featured`, `country_featured`

**Portfolio Organization:**

- **Homepage**: Single hero photo + 3 category navigation photos
  - Hero image: Photo with `homepage_featured: 1`
  - Category navigation: Photos with `category_featured: 1` for each category (Nature, Cities & Streets, Music)
  - Country browse link to `/portfolio/all-countries`
- **Main portfolio page** (`/portfolio`): Shows up to 6 featured photos per category
  - Only displays photos with `category_featured > 0`
  - Photos sorted by priority within each category
- **Category pages** (`/portfolio/nature`, `/portfolio/street`, etc.): Shows all featured photos of that category
  - Only displays photos with `category_featured > 0`
  - Photos sorted by `category_featured` priority
- **Country pages** (`/portfolio/[country]`): Shows all photos from a specific country, organized by location
- **All Countries page** (`/portfolio/all-countries`): Country navigation with one photo per country
  - Photos with `country_featured: 1`

**Featured System:**

- `homepage_featured`: Boolean (0 or 1) - designates single hero photo
- `category_featured`: Priority (0-4) - 1 for category navigation, 2-4 for portfolio order, 0 for not featured
- `country_featured`: Boolean (0 or 1) - designates country navigation photo
- Photos can be featured on homepage, category page, country page, or any combination

**Bulk Operations:**

For advanced users, use [DB Browser for SQLite](https://sqlitebrowser.org/) to:

- Edit photo metadata in a GUI
- Perform bulk updates with SQL queries
- Example: `UPDATE photos SET country_featured = 1 WHERE country = 'Turkey' AND id = (SELECT MIN(id) FROM photos WHERE country = 'Turkey')`

For detailed documentation, see [CLAUDE.md](./CLAUDE.md).

## 📐 Image Size & Aspect Ratio Guidelines

All images are automatically optimized by Astro with WebP conversion and responsive sizing. Recommended dimensions below provide **2x retina display coverage** for crisp images on modern devices (MacBooks, high-DPI displays, 4K monitors).

### Optimized Image Dimensions by Context

| Page/Context | Aspect Ratio | Optimized Dimensions | Retina Coverage | Notes |
|-------------|--------------|---------------------|-----------------|-------|
| **Homepage Hero** | 16:9 | 3840×2160px | 2x @ 1920px, 1.78x @ 4K | Full-screen background, quality=85 |
| **Category Navigation Grid** | 3:2 | 800×533px | 2x @ 400px | Homepage category navigation |
| **Portfolio Grids** | Native (flexible) | Variable | 2x @ 280px height | Justified grid layout, quality=80 |
| **Journal Thumbnails** | 16:9 | 800×450px | 2x @ 400px | Listing page cards |
| **Journal Hero** | 16:9 | 3072×1728px | 2x @ 1536px | Detail page featured image |
| **Writings Thumbnails** | 16:9 | 800×450px | 2x @ 400px | Listing page cards |
| **Writings Hero** | 16:9 | 1792×1008px | 2x @ 896px | Detail page featured image |

### Home Page

- **Hero Photo**
  - Aspect Ratio: 16:9
  - Optimized Size: **3840×2160px**
  - Retina Coverage: 2x @ 1920px viewport, 1.78x @ 4K displays
  - Location: `src/images/photography/{category}/`
  - Notes: Full viewport width, displayed at 80vh height, automatically optimized to WebP

- **Category Navigation Grid** (3 photos: Nature, Cities & Streets, Music)
  - Aspect Ratio: **3:2**
  - Optimized Size: **800×533px**
  - Retina Coverage: 2x @ 400px
  - Location: `src/images/photography/{category}/`
  - Notes: 3-column grid with photo names centered below, automatically optimized to WebP

- **Journal/Writings Thumbnails** (recent posts preview)
  - Aspect Ratio: **16:9**
  - Recommended Size: 800×450px
  - Retina Coverage: 2x @ 400px
  - Notes: Two-column layout on desktop

### Photography Journal
- **Listing Page Thumbnails**
  - Aspect Ratio: **16:9**
  - Recommended Size: 800×450px
  - Retina Coverage: 2x @ 400px across 1-3 column grid
  - Location: `src/images/photography/{category}/`

- **Detail Page Hero**
  - Aspect Ratio: **16:9**
  - Optimized Size: **3072×1728px**
  - Retina Coverage: 2x @ 1536px container
  - Notes: Large showcase image, max-w-6xl container

- **Inline Images** (within post content)
  - Aspect Ratio: Flexible (maintains original)
  - Recommended Width: 2400px+ for full-width images
  - Notes: Astro automatically optimizes based on context

### Other Writings
- **Listing Page Thumbnails**
  - Aspect Ratio: **16:9**
  - Recommended Size: 800×450px
  - Retina Coverage: 2x @ 400px
  - Location: `src/images/assets/` or `src/images/photography/{category}/`

- **Detail Page Hero**
  - Aspect Ratio: **16:9**
  - Optimized Size: **1792×1008px**
  - Retina Coverage: 2x @ 896px container
  - Notes: max-w-4xl container

### Portfolio
- **Main Portfolio Page** (featured photos grid)
  - Aspect Ratio: **Native (flexible)**
  - Row Height: 280px (widths calculated automatically based on aspect ratio)
  - Retina Coverage: 2x @ 280px height (560px passed to Image component)
  - Uses `object-fit: cover` for clean fills
  - Notes: Uses justified grid layout - dimensions read at build time via Sharp

- **Category & Country Pages** (justified grid)
  - Aspect Ratio: **Native (any aspect ratio)**
  - Row Height: 280px (flexible widths calculated automatically)
  - Retina Coverage: 2x @ 280px height
  - Location: `src/images/photography/{category}/`
  - **No aspect ratio restrictions** - images preserve their native ratios
  - Widths calculated automatically: `width = 280px × aspect_ratio`
  - Examples:
    - 3:2 image → 420px wide
    - 4:3 image → 373px wide
    - 16:9 image → 498px wide
  - Notes: Lightbox displays optimized images (~500-800KB) resized to 1920px max width, WebP format at 85% quality

### General Image Best Practices
- **Format**: Upload JPG or PNG - Astro automatically converts to WebP/AVIF
- **Quality**: Keep source images at 85-95% quality
- **Resolution**: Upload high-resolution source images (see dimensions above)
- **Retina Support**: The site automatically handles 2x retina displays
- **Performance**: Astro optimizes all images at build time
  - Automatic resizing to optimal dimensions
  - WebP/AVIF conversion for 50-70% file size reduction
  - Lazy loading for below-the-fold images
  - Responsive images for different screen sizes
- **Naming**: Use descriptive filenames (e.g., `sunset-grand-canyon.jpg`)
- **Accessibility**: Always provide descriptive alt text

### Image Display Behavior

**Portfolio Category & Country Pages (Justified Grid):**
- Uses **justified grid layout** (similar to Flickr/Google Photos)
- Images maintain their **native aspect ratios** without cropping or letterboxing
- Rows are perfectly aligned horizontally with varying image widths
- Clean, professional appearance while preserving full compositions
- Target row height: 280px, widths adjust based on each image's aspect ratio
- Uses `object-fit: cover` to ensure images fill their calculated dimensions

**Homepage Category Navigation & Main Portfolio Page:**

- **Homepage Category Navigation**: 3:2 aspect ratio, 3-column grid with centered text below
- **Main Portfolio Page**: Native aspect ratio with justified grid layout, up to 6 photos per category
- Uses `object-fit: cover` to fill calculated dimensions cleanly
- Row height: 280px, widths calculated based on each image's aspect ratio
- Dimensions read at build time via Sharp library
- Full images shown in lightbox at full resolution

**Listing Pages (Fixed Aspect Ratio Grids):**
- **Journal/Writings Thumbnails**: 16:9 aspect ratio with `object-fit: cover`
- Thumbnails crop to fill containers cleanly (no letterboxing)
- Full images shown on detail pages

**Lightbox:**
- Full-resolution images displayed with `object-fit: contain`
- Letterboxing/pillarboxing for aspect ratio preservation
- No image optimization - shows original files at full quality

### Why These Dimensions?
Modern displays (MacBooks, high-DPI monitors, mobile devices) typically have 2x or 3x pixel density. The optimized dimensions ensure:
- **Sharp images** on all retina displays
- **Efficient delivery** through WebP compression and responsive sizing
- **Future-proof** quality for 4K/5K displays
- **No manual optimization needed** - Astro handles it automatically at build time

## 🧞 Commands

| Command | Action |
| :------ | :----- |
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run photo:add` | Interactive CLI to add new photos to database |
| `npm run photo:template` | Generate CSV template from staging directory |
| `npm run photo:import <file.csv>` | Bulk import photos from CSV file |
| `npm run photo:update <file.csv>` | Bulk update existing photos from CSV file |
| `npm run db:export` | Export database to JSON backup files |
| `npm run db:export-csv` | Export database to CSV file |
| `npm run db:validate` | Validate database constraints |

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import repository in Vercel
3. Deploy automatically

**Note:** Vercel automatically supports Git LFS. Photo files will be downloaded during build.

### Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`

**Note:** Netlify automatically supports Git LFS. Photo files will be downloaded during build.

### Git LFS Bandwidth

With 100+ photos (~15GB), each deployment downloads all LFS files. Consider:
- **GitHub Team plan** ($4/month): 250GB storage + 250GB/month bandwidth
- **Free plan**: 1GB storage + 1GB/month bandwidth (insufficient for regular deployments)

See [CLAUDE.md](./CLAUDE.md#git-large-file-storage-lfs) for detailed LFS documentation.

## 🎨 Customization

- **Site info**: Edit `src/layouts/BaseLayout.astro`
- **Navigation**: Update `src/components/Header.astro`
- **About page**: Edit `src/pages/about.astro`
- **Colors**: Customize `tailwind.config.js`
- **Domain**: Update `astro.config.mjs`

## 📂 Project Structure

```
/
├── backups/              # Database exports (gitignored)
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable components
│   ├── content/          # Content collections
│   │   ├── pages/        # Standalone pages (about.md)
│   │   ├── photography-journal/
│   │   └── writings/
│   ├── db/               # SQLite database
│   │   ├── photos.db     # Photo metadata
│   │   └── schema.sql    # Database schema
│   ├── images/           # Optimized images
│   │   ├── photography/  # Portfolio photos by category
│   │   │   ├── _staging/ # Staging directory for bulk imports
│   │   │   ├── nature/
│   │   │   ├── street/
│   │   │   └── concert/
│   │   └── assets/       # Non-portfolio images
│   ├── layouts/          # Page layouts
│   ├── pages/            # Routes
│   ├── scripts/          # CLI tools
│   │   ├── add-photo.ts
│   │   ├── export-backup.ts
│   │   ├── generate-template.ts
│   │   ├── import-photos-csv.ts
│   │   └── migrate-json-to-db.ts
│   ├── styles/           # Global CSS
│   └── utils/            # Helper functions
│       ├── db.ts         # Database queries
│       └── imageLoader.ts
└── CLAUDE.md            # Detailed documentation
```

## ⚠️ Before Deploying

1. Add your photography to `src/images/photography/{category}/`
2. Update personal info in About page
3. Configure domain in `astro.config.mjs`
4. Update social media links in footer
5. Add your actual content!

## 📚 Tech Stack

- **[Astro](https://astro.build)** - Static site generator
- **[Tailwind CSS](https://tailwindcss.com)** - Styling
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **Content Collections** - Type-safe content management for blog posts
- **[SQLite](https://www.sqlite.org/)** - Database for portfolio photo metadata (via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3))
- **[Git LFS](https://git-lfs.github.com/)** - Large file storage for high-resolution photos

## 📄 License

MIT License - Feel free to use for your own photography site!

---

Built with ❤️ using Astro
