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
│       ├── journal/         # Photography journal images
│       ├── writings/        # Blog post images
│       ├── portfolio/       # Portfolio images organized by category
│       └── featured/        # Featured photos for home page
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
      "date"?: string
    }
  ],
  "order": number
}
```

Portfolio displays all images from a category in a unified grid with interactive lightbox navigation.

**Portfolio Organization:**
- **Main page** (`/portfolio`): Browse by photo type (Nature, Street Photography, Concert Photography, Other) or by country
- **Category view**: Filter photos by clicking category buttons (query param: `?category=nature`)
- **Country pages** (`/portfolio/[country]`): Dedicated pages showing photos from each country, organized by location sub-headings
- Country pages feature location-based sections, grouping photos by their specific location within the country
- Country names are URL-friendly (lowercase, spaces replaced with hyphens)

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

### Routing
- File-based routing in `src/pages/`
- Dynamic routes use `[slug].astro` format
- Content fetched via Astro Content Collections API

### Image Paths
- All image paths start with `/` and are relative to `public/`
- Images automatically optimized (WebP conversion, responsive sizes, lazy loading)

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
