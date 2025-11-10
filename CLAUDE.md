# Photography Blog & Portfolio

An Astro-based photography blog with TypeScript and Tailwind CSS.

## Technical Stack

- **Astro** - Static site generator with file-based routing
- **Tailwind CSS** - Utility-first CSS framework with dark mode support
- **TypeScript** - Strict mode enabled
- **Content Collections** - Type-safe content management

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
│   │   ├── portfolio/       # JSON galleries by category
│   │   │   ├── nature/
│   │   │   ├── street/
│   │   │   ├── concert/
│   │   │   └── other/
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
Location: `src/content/portfolio/{category}/*.json`

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
