# Photography Blog & Portfolio

An Astro-based photography blog with TypeScript and Tailwind CSS.

## Technical Stack

- **Astro** - Static site generator with file-based routing
- **Tailwind CSS** - Utility-first CSS framework with dark mode support
- **TypeScript** - Strict mode enabled
- **Content Collections** - Type-safe content management
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
├── public/
│   └── images/
│       └── assets/          # Non-portfolio images for blog posts
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Breadcrumbs.astro
│   │   └── DarkModeToggle.astro
│   ├── content/
│   │   ├── config.ts        # Content collection schemas
│   │   ├── photography-journal/  # Markdown posts
│   │   ├── writings/        # Markdown posts
│   │   ├── portfolio/       # JSON files, one per category
│   │   │   ├── nature.json
│   │   │   ├── street.json
│   │   │   ├── concert.json
│   │   │   └── other.json
│   ├── images/
│   │   └── photography/     # Single source of truth for all portfolio-worthy photos
│   │       ├── nature/
│   │       ├── street/
│   │       ├── concert/
│   │       └── other/
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
│   ├── styles/
│   │   └── global.css
│   └── utils/
│       ├── helpers.ts
│       └── imageLoader.ts   # Dynamic image imports using Vite glob
```

## Content Schemas

### Photography Journal Posts
Location: `src/content/photography-journal/*.md`

```markdown
---
title: string
description: string
date: Date
location: string
country: string
featuredImage: string
tags: string[]
draft: boolean
---

Content in standard Markdown format.
```

### Writings Posts
Location: `src/content/writings/*.md`

```markdown
---
title: string
description: string
date: Date
featuredImage?: string
tags: string[]
draft: boolean
---

Content in standard Markdown format.
```

### Portfolio Galleries
Location: `src/content/portfolio/{category}.json`

```json
{
  "category": "nature" | "street" | "concert" | "other",
  "images": [
    {
      "src": string,
      "alt": string,
      "caption"?: string,
      "location"?: string,
      "country"?: string,
      "date"?: string,
      "sub_category"?: string,
      "featured"?: number
    }
  ],
  "order": number
}
```

Portfolio displays images from a category in a unified grid with interactive lightbox navigation.

**Portfolio Organization:**
- **Homepage Featured Work**: Shows the top featured photos (lowest featured numbers) across all categories
  - Hero image: Photo with `featured: 1`
  - Featured work grid: Photos with `featured: 2-7` (or next 6 lowest numbers)
  - Photos sorted by featured number (lower numbers appear first)
- **Main portfolio page** (`/portfolio`): Shows all featured photos from each category, with links to browse by photo type or by country
  - Only displays photos with a `featured` number (any value)
  - Photos sorted by featured number within each category
  - Each category section includes a "View All" link to the full category page
- **Category pages** (`/portfolio/[category]`): Dedicated pages showing all photos of a specific type, organized by sub-category sections
  - Category pages group photos by their `sub_category` field
  - Photos without a sub_category are grouped under "Other"
  - Sub-categories are sorted alphabetically, with "Other" appearing last
  - Displays all photos in the category, regardless of featured status
- **Country pages** (`/portfolio/[country]`): Dedicated pages showing photos from each country, organized by location sub-headings
  - Country pages feature location-based sections, grouping photos by their specific location within the country
  - Country names are URL-friendly (lowercase, spaces replaced with hyphens)
  - Displays all photos from the country, regardless of featured status

**Data Efficiency:**
- Photos are stored once in category-organized JSON files
- Homepage, main portfolio page, category pages, and country pages all filter from the same data source at build time
- No photo duplication required - the same JSON files serve multiple views with different filters
- Featured photos are identified by the `featured` number field (lower numbers = higher priority)

## Key Patterns

### Image Organization
**Single Source of Truth:** All portfolio-worthy photography is stored once in `src/images/photography/{category}/` and referenced by multiple content types:
- **Photography journal posts**: Reference images via `featuredImage` field
- **Portfolio galleries**: Reference images via `src` field in JSON
- **Writings posts**: Can reference photography images when appropriate, or use `public/images/assets/` for non-portfolio images

**Technical Implementation:**
- Images stored in `src/images/photography/` for Astro optimization
- Loaded dynamically using Vite's `import.meta.glob()` in `src/utils/imageLoader.ts`
- Content files reference images using paths like `/images/photography/{category}/filename.jpg`
- The image loader maps these public paths to imported image objects at build time

**Benefits:**
- Automatic image optimization (WebP conversion, resizing, quality adjustment)
- No image duplication
- Easy maintenance - update once, changes everywhere
- Clear organization by photo type (nature, street, concert, other)
- Lightbox images optimized to ~500-800KB (down from 2-3MB originals)
- Writings posts can use both photography images and non-portfolio assets from `public/images/assets/`

### Routing
- File-based routing in `src/pages/`
- Dynamic routes use `[slug].astro` format
- Content fetched via Astro Content Collections API

### Image Paths
- **Photography images (portfolio-worthy):**
  - Physical location: `src/images/photography/{category}/filename.jpg`
  - Reference path in content: `/images/photography/{category}/filename.jpg`
  - Automatically optimized at build time (WebP conversion, responsive sizes, lazy loading)
  - Lightbox optimization: Resized to max 1920px width, WebP format, 85% quality
- **Non-portfolio assets:**
  - Physical location: `public/images/assets/filename.jpg`
  - Reference path: `/images/assets/filename.jpg`
  - Served as-is from public folder

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

**Key Principle:** All portfolio pages preserve native aspect ratios using justified grid layout. Journal and writings listing pages use fixed aspect ratios with `object-fit: cover` for clean thumbnails. Full images always visible in lightbox with proper aspect ratios.

### Dark Mode
- Implemented with Tailwind's `dark:` classes
- Toggle in header, preference saved to localStorage
- Configure with `darkMode: 'class'` in `tailwind.config.js`

### Content Collections
- All schemas defined in `src/content/config.ts`
- Type-safe content querying with `getCollection()` and `getEntry()`
- Collections: `photography-journal`, `writings`, `portfolio`, `featured`

### Customization Locations
- Site metadata: `src/layouts/BaseLayout.astro`
- Site domain: `astro.config.mjs`
- Branding: `src/components/Header.astro`, `src/components/Footer.astro`
- Styles: `tailwind.config.js`, `src/styles/global.css`

## Important

When updating code, also update `README.md` and `CLAUDE.md` documentation.
