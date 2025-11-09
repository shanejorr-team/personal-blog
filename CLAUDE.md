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
│       ├── photography/     # Single source of truth for all portfolio-worthy photos
│       │   ├── nature/
│       │   ├── street/
│       │   ├── concert/
│       │   └── other/
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
│   │   └── featured/        # JSON featured photos
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
│       └── helpers.ts
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
      "featured"?: boolean
    }
  ],
  "order": number
}
```

Portfolio displays images from a category in a unified grid with interactive lightbox navigation.

**Portfolio Organization:**
- **Main page** (`/portfolio`): Shows curated featured photos from each category, with links to browse by photo type or by country
  - Only displays photos marked with `featured: true`
  - Recommended: Select up to 6 featured photos per category for the main page
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
- Main page, category pages, and country pages all filter from the same data source at build time
- No photo duplication required - the same JSON files serve multiple views with different filters

### Featured Photos
Location: `src/content/featured/*.json`

```json
{
  "title": string,
  "image": string,
  "alt": string,
  "location"?: string,
  "order": number,
  "link": string
}
```

Display order determined by `order` field (lower numbers first).

## Key Patterns

### Image Organization
**Single Source of Truth:** All portfolio-worthy photography is stored once in `/images/photography/{category}/` and referenced by multiple content types:
- **Photography journal posts**: Reference images via `featuredImage` field
- **Portfolio galleries**: Reference images via `src` field in JSON
- **Featured photos**: Reference images via `image` field in JSON
- **Writings posts**: Can reference photography images when appropriate, or use `/images/assets/` for non-portfolio images

**Benefits:**
- No image duplication
- Easy maintenance - update once, changes everywhere
- Clear organization by photo type (nature, street, concert, other)
- Writings posts can use both photography images and non-portfolio assets

### Routing
- File-based routing in `src/pages/`
- Dynamic routes use `[slug].astro` format
- Content fetched via Astro Content Collections API

### Image Paths
- All image paths start with `/` and are relative to `public/`
- Photography: `/images/photography/{category}/filename.jpg`
- Assets: `/images/assets/filename.jpg`
- Images automatically optimized (WebP conversion, responsive sizes, lazy loading)

### Image Display Behavior

**Thumbnail Grids:**

- All thumbnail grids use `object-fit: contain` to preserve complete image compositions
- Image containers have `bg-white dark:bg-gray-900` backgrounds
- Images maintain their original aspect ratio without cropping
- Letterboxing/pillarboxing (white or dark gray bars) appear when image aspect ratios don't match container aspect ratios
- Hover effects include `scale-110` transform on compatible devices

**Lightbox:**

- Uses raw `<img>` tag (not Astro Image component)
- Displays full-resolution original images with `object-fit: contain`
- No image optimization applied (shows original JPG/PNG files)
- Letterboxing/pillarboxing preserves aspect ratios
- Max constraints: 100% width, 70vh height (60vh on mobile)

**Key Principle:** Images are never cropped or stretched - full compositions are always visible in both thumbnail and lightbox views.

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
