# Photography Blog & Portfolio

A modern, fast, and beautiful photography blog built with Astro, TypeScript, and Tailwind CSS. Features a dual-section layout for photo stories and general writings, plus a curated portfolio with category galleries.

## ✨ Features

- **Photography Journal**: Travel photo stories with embedded images
- **Other Writings**: General blog posts and articles
- **Portfolio Galleries**: Organized by category (Nature, Street, Concert, Other) and by country/location
- **Dark Mode**: Automatic theme switching with localStorage persistence
- **Image Optimization**: Automatic WebP conversion and responsive images
- **RSS Feeds**: Separate feeds for journal and writings
- **Responsive Design**: Mobile-first, works beautifully on all devices
- **SEO Optimized**: Meta tags, sitemap, and semantic HTML
- **Fast Performance**: Static site generation with Astro
- **Type-Safe**: Built with TypeScript

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:4321
```

## 📝 Adding Content

### Image Organization
This site uses a **single source of truth** approach for images:
- **Photography**: Store all portfolio-worthy photos in `/images/photography/{category}/` (nature, street, concert, other)
  - These images can be referenced by journal posts, portfolio galleries, and featured photos
  - No duplication needed - one image, multiple uses
- **Assets**: Store non-portfolio images in `/images/assets/` (screenshots, diagrams, etc.)
  - Used primarily for writings posts that don't feature photography

### Photography Journal Posts
Create Markdown files in `src/content/photography-journal/`:
```markdown
---
title: "Your Story"
description: "Story description"
date: 2024-03-15
location: "Tokyo, Japan"
featuredImage: "/images/photography/street/tokyo-street.jpg"
tags: ["travel", "japan"]
---

Your content here with ![images](/images/photography/street/image.jpg)
```

**Note:** Photography images are stored in `/images/photography/{category}/` and can be referenced by both journal posts and portfolio galleries.

### Other Writings
Create Markdown files in `src/content/writings/`:
```markdown
---
title: "Your Post"
description: "Post description"
date: 2024-03-15
featuredImage: "/images/assets/featured.jpg"
tags: ["tutorial", "tips"]
---

Your content...
```

**Note:** Writings can use `/images/assets/` for non-portfolio images (screenshots, diagrams, etc.) or reference `/images/photography/` when featuring photography.

### Portfolio Galleries
Add JSON files in `src/content/portfolio/{category}/`:
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

**Portfolio Organization:**
- **Main page** (`/portfolio`): Shows featured photos from each category with links to browse by photo type or by country
  - Only displays photos marked with `"featured": true`
  - Recommended: Select up to 6 featured photos per category for the main page
- **Category pages** (`/portfolio/nature`, `/portfolio/street`, etc.): View all photos of a specific type, organized by sub-category
- **Country pages** (`/portfolio/[country]`): View all photos from a specific country, organized by location

**Optional Fields:**
- `sub_category`: Recommended for better organization on category pages. Photos without a sub_category will be grouped under "Other".
- `featured`: Set to `true` to display the photo on the main portfolio page. If not set or `false`, the photo will only appear on category and country pages.

For detailed documentation, see [CLAUDE.md](./CLAUDE.md).

## 📐 Image Size & Aspect Ratio Guidelines

All images are automatically optimized by Astro with WebP conversion and responsive sizing. Recommended dimensions below provide **2x retina display coverage** for crisp images on modern devices (MacBooks, high-DPI displays, 4K monitors).

### Optimized Image Dimensions by Context

| Page/Context | Aspect Ratio | Optimized Dimensions | Retina Coverage | Notes |
|-------------|--------------|---------------------|-----------------|-------|
| **Homepage Hero** | 3:2 | 3840×2560px | 2x @ 1920px, 1.5x @ 4K | Full-screen background |
| **Featured Work Grid** | 1:1 | 800×800px | 2x @ 400px | Square thumbnails |
| **Portfolio Grids** | Native (flexible) | Variable | 2x @ 280px height | Justified grid layout |
| **Journal Thumbnails** | 16:9 | 800×450px | 2x @ 400px | Listing page cards |
| **Journal Hero** | 16:9 | 3072×1728px | 2x @ 1536px | Detail page featured image |
| **Writings Thumbnails** | 16:9 | 800×450px | 2x @ 400px | Listing page cards |
| **Writings Hero** | 16:9 | 1792×1008px | 2x @ 896px | Detail page featured image |

### Home Page
- **Hero/Main Featured Photo** (first featured image)
  - Aspect Ratio: 3:2 (flexible landscape)
  - Optimized Size: **3840×2560px**
  - Retina Coverage: 2x @ 1920px viewport, 1.5x @ 4K displays
  - Location: `public/images/photography/{category}/`
  - Notes: Full viewport width, displayed at 80vh height

- **Featured Work Grid** (additional featured photos)
  - Aspect Ratio: **1:1 (Square)**
  - Recommended Size: 800×800px
  - Retina Coverage: 2x @ 400px
  - Location: `public/images/photography/{category}/`
  - Notes: Displayed in 1-3 column grid

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
  - Location: `public/images/photography/{category}/`

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
  - Location: `public/images/assets/` or `public/images/photography/{category}/`

- **Detail Page Hero**
  - Aspect Ratio: **16:9**
  - Optimized Size: **1792×1008px**
  - Retina Coverage: 2x @ 896px container
  - Notes: max-w-4xl container

### Portfolio
- **Main Portfolio Page** (featured photos grid)
  - Aspect Ratio: **4:3**
  - Recommended Size: 800×600px
  - Retina Coverage: 2x @ 400px
  - Uses `object-fit: cover` for clean thumbnails

- **Category & Country Pages** (justified grid)
  - Aspect Ratio: **Native (any aspect ratio)**
  - Row Height: 280px (flexible widths calculated automatically)
  - Retina Coverage: 2x @ 280px height
  - Location: `public/images/photography/{category}/`
  - **No aspect ratio restrictions** - images preserve their native ratios
  - Widths calculated automatically: `width = 280px × aspect_ratio`
  - Examples:
    - 3:2 image → 420px wide
    - 4:3 image → 373px wide
    - 16:9 image → 498px wide
  - Notes: Full images displayed in lightbox at full resolution

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

**Homepage & Listing Pages (Fixed Grids):**
- **Featured Work Grid**: 1:1 square thumbnails with `object-fit: cover`
- **Journal/Writings Thumbnails**: 16:9 aspect ratio with `object-fit: cover`
- **Main Portfolio Page**: 4:3 aspect ratio with `object-fit: cover`
- Thumbnails crop to fill containers cleanly (no letterboxing)
- Full images shown in lightbox or detail pages

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

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import repository in Vercel
3. Deploy automatically

### Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`

## 🎨 Customization

- **Site info**: Edit `src/layouts/BaseLayout.astro`
- **Navigation**: Update `src/components/Header.astro`
- **About page**: Edit `src/pages/about.astro`
- **Colors**: Customize `tailwind.config.js`
- **Domain**: Update `astro.config.mjs`

## 📂 Project Structure

```
/
├── public/images/        # Image assets
├── src/
│   ├── components/       # Reusable components
│   ├── content/          # Content collections
│   │   ├── photography-journal/
│   │   ├── writings/
│   │   ├── portfolio/
│   │   └── featured/
│   ├── layouts/          # Page layouts
│   ├── pages/            # Routes
│   └── styles/           # Global CSS
└── CLAUDE.md            # Detailed documentation
```

## ⚠️ Before Deploying

1. Replace placeholder images in `public/images/`
2. Update personal info in About page
3. Configure domain in `astro.config.mjs`
4. Update social media links in footer
5. Add your actual content!

## 📚 Tech Stack

- **[Astro](https://astro.build)** - Static site generator
- **[Tailwind CSS](https://tailwindcss.com)** - Styling
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **Content Collections** - Type-safe content management

## 📄 License

MIT License - Feel free to use for your own photography site!

---

Built with ❤️ using Astro
