# Images Directory

This directory contains non-portfolio images for the photography blog.

## Directory Structure

```
public/images/
└── assets/          # Non-portfolio images (screenshots, diagrams, etc.)
```

**Note:** Portfolio photography images are stored in `src/images/photography/` for automatic optimization by Astro.

## Single Source of Truth Approach

**All portfolio-worthy photography** is stored once in `src/images/photography/{category}/` and referenced using `/images/photography/{category}/` paths:

- Photography journal posts (via `featuredImage` field)
- Portfolio galleries (via `src` field in JSON)
- Featured photos on homepage (via portfolio JSON with `featured: true`)
- Writings posts (when featuring photography)

**Benefits:**

- Automatic image optimization (WebP conversion, resizing, quality adjustment)
- No image duplication
- Update once, changes everywhere
- Clear organization by photo type
- Lightbox images optimized to ~500-800KB (down from 2-3MB)

## Image Guidelines

### Recommended Sizes & Aspect Ratios

**Homepage:**
- **Hero Image** (first featured photo): 3840×2560px (3:2 ratio) - quality=85
- **Featured Work Grid**: Native aspect ratio, 280px row height - uses justified grid

**Portfolio Pages:**
- **Main Portfolio Page**: Native aspect ratio, 280px row height - uses justified grid
- **Category/Country Pages**: Native aspect ratio, 280px row height - uses justified grid
- Images maintain their native aspect ratios without forced cropping
- Dimensions read automatically at build time via Sharp

**Journal Pages:**
- **Listing Thumbnails**: 800×450px (16:9 ratio)
- **Detail Page Hero**: 3072×1728px (16:9 ratio)
- **Inline Images**: 2400px+ width recommended for full-width images

**Writings Pages:**
- **Listing Thumbnails**: 800×450px (16:9 ratio)
- **Detail Page Hero**: 1792×1008px (16:9 ratio)

**All dimensions provide 2x retina display coverage for sharp images on modern devices.**

### Format & Quality

- **Upload Format**: JPEG or PNG
- **Storage Location**: `src/images/photography/{category}/` for portfolio images
- **Astro Automatically Converts**: WebP format at build time
- **Output Formats**: WebP and AVIF for optimal compression
- **Quality Settings**:
  - Homepage hero: 85%
  - Thumbnails: 80%
  - Lightbox: 85% quality, resized to 1920px max width (~500-800KB)
- **PNG**: Only for images requiring transparency
- **Performance**: Astro handles automatic resizing, format conversion, and lazy loading

### Naming Convention

Use descriptive, kebab-case names:
- ✅ `tokyo-street-sunset.jpg`
- ✅ `mountain-landscape-norway.jpg`
- ❌ `IMG_1234.jpg`
- ❌ `photo 1.jpg`

## Using Images in Content

### In Photography Journal Posts

```markdown
---
title: "Your Story"
description: "Story description"
date: 2024-03-15
location: "Tokyo, Japan"
featuredImage: "/images/photography/street/tokyo-street.jpg"
tags: ["travel", "japan"]
---

Your content with ![inline images](/images/photography/street/image.jpg)
```

### In Writings Posts

```markdown
---
title: "Your Post"
description: "Post description"
date: 2024-03-15
featuredImage: "/images/assets/featured.jpg"
tags: ["tutorial"]
---

Use /images/assets/ for non-portfolio images or reference /images/photography/ for photography
```

### In Portfolio Collections

Images are defined in JSON files in `/src/content/portfolio/{category}/`:

```json
{
  "category": "nature",
  "images": [
    {
      "src": "/images/photography/nature/photo.jpg",
      "alt": "Description",
      "caption": "Photo caption",
      "location": "Banff National Park",
      "country": "Canada",
      "date": "2024-03-15",
      "sub_category": "Mountains",
      "featured": true
    }
  ],
  "order": 0
}
```

**Key Fields:**
- `featured: true` - Displays on main portfolio page
- `sub_category` - Groups photos on category pages
- `country` - Enables country-based browsing
