# Photography Blog & Portfolio

A modern photography blog built with Astro, TypeScript, and Tailwind CSS. Features photo stories, writings, and curated portfolio galleries.

## Tech Stack

- **[Astro](https://astro.build)** - Static site generator
- **[Tailwind CSS](https://tailwindcss.com)** - Styling
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[SQLite](https://www.sqlite.org/)** - Portfolio photo metadata
- **[Git LFS](https://git-lfs.github.com/)** - Large file storage for photos

## Quick Start

```bash
# Install Git LFS (one-time setup)
brew install git-lfs
git lfs install

# Clone and setup
git clone https://github.com/shanejorr/personal-blog.git
cd personal-blog
npm install

# Start development
npm run dev
```

Open browser to `http://localhost:4321`

## Adding Content

### Blog Posts

**Photography Journal** - Create folder in `src/content/photography-journal/{slug}/index.mdx`:
```markdown
---
title: "Your Story"
description: "Brief description"
date: 2024-03-15
location: "Tokyo, Japan"
featuredImage: ../../../photography/street/photo.jpg
tags: ["travel", "japan"]
---
Your content here...
```
Non-portfolio images can be co-located in the post folder and referenced as `./image.jpg`.

**Writings** - Create folder in `src/content/writings/{slug}/index.mdx`:
```markdown
---
title: "Your Post"
description: "Brief description"
date: 2024-03-15
featuredImage: ./featured.png
tags: ["tutorial"]
---
Your content here...
```
Images are co-located in the post folder.

### Embedding Images in Posts

To embed optimized images within post content (not just as featured image), use MDX:

1. **Rename file to `.mdx`** (e.g., `my-post.mdx`)

2. **Import and use the Picture component**:

```mdx
---
title: "My Photo Story"
description: "Description"
date: 2024-03-15
tags: ["travel"]
draft: false
---

import { Picture } from 'astro:assets';
import photo1 from '../../photography/nature/us-georgia-nature-1.jpg';
import photo2 from '../../photography/nature/us-georgia-nature-2.jpg';

Here's some introductory text.

<Picture src={photo1} alt="Mountain vista at sunrise" formats={['avif', 'webp']} />

More narrative text here.

<Picture src={photo2} alt="Wildflowers in meadow" formats={['avif', 'webp']} width={800} />
```

**Why `Picture` over `Image`?**

- `Picture` generates multiple formats (AVIF → WebP → fallback)
- AVIF is ~20-30% smaller than WebP for browsers that support it
- `Image` outputs only one format (WebP by default)

**Optional styling with caption**:

```mdx
<figure class="my-8">
  <Picture src={photo} alt="Description" formats={['avif', 'webp']} class="rounded-lg" />
  <figcaption class="text-center text-sm text-gray-600 mt-2">Caption here</figcaption>
</figure>
```

### Images

- **Portfolio photos**: `src/photography/{category}/` (nature, street, concert)
- **Journal/Writings images**: Co-located in post folders
- All images auto-optimized to WebP at build time

### Portfolio Photos

**Quick Add (single photo)**:

```bash
npm run photo:add
```

**Bulk Import (recommended)**:

```bash
# 1. Copy photos to staging (use naming: [country]-[location]-[category]-[number].jpg)
cp /path/to/photos/* src/photography/_staging/

# 2. Generate CSV template with auto-populated metadata
npm run photo:template

# 3. Edit _staging/photo-template.csv (add captions, review metadata)

# 4. Move photos to src/photography/{category}/

# 5. Import
npm run photo:import src/photography/_staging/photo-template.csv --dry-run
npm run photo:import src/photography/_staging/photo-template.csv
```

**Bulk Update**:

```bash
npm run db:export-csv                           # Export to CSV
# Edit backups/photos-export.csv in Excel
npm run photo:update backups/photos-export.csv  # Import changes
```

**Featured System**:

- `homepage_featured: 1` - Hero photo on homepage
- `category_featured: 1-N` - Sort order in portfolio
  - 1 = highest priority, shown on category nav on homepage
  - 2 = shown on main portfolio page
- `country_featured: 1` - Country navigation photo

See [CLAUDE.md](./CLAUDE.md) for detailed workflows and SQL queries.

## Image Guidelines

All images auto-optimized at build time (WebP conversion, responsive sizing, lazy loading).

**Recommended Dimensions (2x retina coverage)**:

| Context | Aspect Ratio | Dimensions |
|---------|--------------|------------|
| Homepage Hero | 16:9 | 3840×2160px |
| Portfolio Grids | Native | Any (280px row height) |
| Journal/Writings Thumbnails | 16:9 | 800×450px |
| Journal Hero | 16:9 | 3072×1728px |

- **Portfolio**: Native aspect ratios preserved in justified grid layout
- **Thumbnails**: 16:9 with `object-fit: cover`
- **Upload**: JPG/PNG at 85-95% quality
- **Naming**: `[country]-[location]-[category]-[number].jpg`

See [CLAUDE.md](./CLAUDE.md) for detailed image specifications.

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site |
| `npm run preview` | Preview production build |
| **Photo Management** | |
| `npm run photo:add` | Interactive CLI to add single photo |
| `npm run photo:template` | Generate CSV template from staging |
| `npm run photo:import <csv>` | Bulk import photos |
| `npm run photo:update <csv>` | Bulk update existing photos |
| **Database** | |
| `npm run db:export` | Export to JSON |
| `npm run db:export-csv` | Export to CSV |

## Deployment

**Vercel/Netlify**: Auto-deploy from GitHub with Git LFS support

**Git LFS Bandwidth**: With 100+ photos (~15GB), consider GitHub Team plan ($4/mo: 250GB bandwidth)

## Customization

- **Site metadata**: `src/layouts/BaseLayout.astro`
- **Navigation**: `src/components/Header.astro`
- **Styling**: `tailwind.config.js`
- **Domain**: `astro.config.mjs`

## Project Structure

```
src/
├── components/
│   ├── Lightbox.astro         # Photo lightbox with auto-initialization
│   └── PhotoGridItem.astro    # Reusable photo grid button
├── content/
│   ├── photography-journal/   # Travel photo stories (folder-per-post)
│   ├── writings/              # Blog posts (folder-per-post)
│   └── pages/                 # Standalone pages (about.md)
├── db/
│   ├── photos.db              # Portfolio metadata (SQLite)
│   └── schema.sql
├── photography/               # Portfolio photos
│   ├── _staging/              # Bulk import staging
│   ├── nature/
│   ├── street/
│   └── concert/
├── scripts/
│   ├── shared/validation.ts   # Shared CLI validation utilities
│   └── ...                    # CLI tools (photo management)
├── pages/                     # File-based routing
└── utils/
    ├── db.ts                  # Database queries
    ├── imageLoader.ts         # Dynamic image imports
    ├── categories.ts          # Category configuration
    └── processPhotos.ts       # Shared image processing
```

---

**Documentation**: See [CLAUDE.md](./CLAUDE.md) for detailed technical documentation

**License**: MIT
