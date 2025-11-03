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

To ensure images display correctly across the site, follow these aspect ratio and size recommendations:

### Home Page
- **Hero/Main Featured Photo** (first featured image)
  - Aspect Ratio: Flexible (landscape recommended, e.g., 16:9 or 3:2)
  - Recommended Size: 2400×1350px or larger
  - Notes: Displayed at 80vh height, full width with cover

- **Featured Work Grid** (additional featured photos)
  - Aspect Ratio: **1:1 (Square)**
  - Recommended Size: 1200×1200px or larger
  - Location: `public/images/photography/{category}/`

- **Journal/Writings Thumbnails** (recent posts preview)
  - Aspect Ratio: **16:9 (Widescreen)**
  - Recommended Size: 1920×1080px
  - Notes: Displayed with consistent aspect ratio across all devices

### Photography Journal
- **Featured Images** (post thumbnails on listing page)
  - Aspect Ratio: **16:9 (Widescreen)**
  - Recommended Size: 1920×1080px
  - Location: `public/images/photography/{category}/`

- **Inline Images** (within post content)
  - Aspect Ratio: Flexible (optimized by Astro)
  - Recommended Width: 1200px or larger
  - Notes: Maintain original aspect ratio

### Other Writings
- **Featured Images** (post thumbnails)
  - Aspect Ratio: **16:9 (Widescreen)**
  - Recommended Size: 1920×1080px
  - Location: `public/images/assets/` or `public/images/photography/{category}/`

### Portfolio
- **Gallery Images**
  - Aspect Ratio: **4:3 (Landscape)**
  - Recommended Size: 1600×1200px or larger
  - Location: `public/images/photography/{category}/`
  - Notes: Higher resolution recommended for lightbox view

### General Image Best Practices
- Use JPG format for photographs
- Maintain high quality (85-90% quality for JPG)
- Source images should be at least 1200px on the longest edge
- Astro automatically optimizes and converts to WebP
- Use descriptive filenames (e.g., `sunset-grand-canyon.jpg`)
- Always provide descriptive alt text for accessibility

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
