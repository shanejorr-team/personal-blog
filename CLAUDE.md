# Photography Blog & Portfolio

A modern, fast, and beautiful photography blog built with Astro, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The site will be available at `http://localhost:4321`

## 📁 Project Structure

```
/
├── public/
│   ├── images/              # Image assets
│   │   ├── journal/         # Photography journal images
│   │   ├── writings/        # Blog post images
│   │   ├── portfolio/       # Portfolio images by category
│   │   └── featured/        # Featured photos for home page
│   └── favicon.svg
├── src/
│   ├── components/          # Reusable Astro components
│   │   ├── Header.astro     # Main navigation
│   │   ├── Footer.astro     # Site footer
│   │   ├── Breadcrumbs.astro # Navigation breadcrumbs
│   │   └── DarkModeToggle.astro # Theme switcher
│   ├── content/             # Content collections
│   │   ├── config.ts        # Collection schemas
│   │   ├── photography-journal/ # Photo stories (Markdown)
│   │   ├── writings/        # Blog posts (Markdown)
│   │   ├── portfolio/       # Portfolio galleries (JSON)
│   │   │   ├── nature/
│   │   │   ├── street/
│   │   │   ├── concert/
│   │   │   └── other/
│   │   └── featured/        # Featured photos (JSON)
│   ├── layouts/             # Page layouts
│   │   └── BaseLayout.astro # Main layout with header/footer
│   ├── pages/               # Route pages
│   │   ├── index.astro      # Home page
│   │   ├── about.astro      # About page
│   │   ├── journal/         # Photography journal
│   │   │   ├── index.astro  # Journal listing
│   │   │   └── [slug].astro # Individual posts
│   │   ├── writings/        # Other writings
│   │   │   ├── index.astro  # Writings listing
│   │   │   └── [slug].astro # Individual posts
│   │   ├── portfolio/       # Portfolio galleries
│   │   │   └── index.astro
│   │   ├── rss-journal.xml.ts # RSS feed for journal
│   │   └── rss-writings.xml.ts # RSS feed for writings
│   ├── styles/
│   │   └── global.css       # Global styles and Tailwind
│   └── utils/
│       └── helpers.ts       # Utility functions
├── astro.config.mjs         # Astro configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## 📝 Content Management

### Adding Photography Journal Posts

Create a new Markdown file in `src/content/photography-journal/`:

```markdown
---
title: "Your Post Title"
description: "A brief description for SEO and preview"
date: 2024-03-15
location: "Tokyo, Japan"
country: "Japan"
featuredImage: "/images/journal/your-image.jpg"
tags: ["travel", "japan", "street"]
draft: false
---

Your content here. You can include images:

![Image caption](/images/journal/inline-image.jpg)
*Optional caption text*

## Subheadings work great

Regular markdown formatting is supported.
```

### Adding Other Writings Posts

Create a new Markdown file in `src/content/writings/`:

```markdown
---
title: "Your Article Title"
description: "Article description"
date: 2024-03-15
featuredImage: "/images/writings/your-image.jpg"  # Optional
tags: ["photography", "tutorial"]
draft: false
---

Your content here...
```

### Adding Portfolio Galleries

Create a JSON file in the appropriate category folder under `src/content/portfolio/`:

```json
{
  "title": "Gallery Name",
  "category": "nature",
  "images": [
    {
      "src": "/images/portfolio/nature/image1.jpg",
      "alt": "Descriptive alt text",
      "caption": "Optional caption",
      "location": "Optional location",
      "date": "2024-01-15"
    }
  ],
  "order": 0
}
```

### Managing Featured Photos

Edit or add JSON files in `src/content/featured/`:

```json
{
  "title": "Photo Title",
  "image": "/images/featured/your-photo.jpg",
  "alt": "Descriptive alt text",
  "location": "Optional location",
  "order": 0,
  "link": "/portfolio?category=nature"
}
```

The `order` field controls the display order (lower numbers first).

## 🎨 Customization

### Site Metadata

Edit `src/layouts/BaseLayout.astro` to update:
- Site title and description
- Social media meta tags
- Site domain (also in `astro.config.mjs`)

### Branding

Update these locations:
- Site name: `src/components/Header.astro`
- About page content: `src/pages/about.astro`
- Footer content: `src/components/Footer.astro`

### Colors and Styling

The site uses Tailwind CSS. Customize colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      // Add custom colors
    },
  },
}
```

Global styles are in `src/styles/global.css`.

### Dark Mode

Dark mode is implemented with Tailwind's `dark:` classes and is toggle-able via the header button. The preference is saved to localStorage.

## 🖼️ Image Optimization

Astro automatically optimizes images:

- Converts to WebP format
- Generates responsive sizes
- Lazy loads images
- Maintains aspect ratios

For best results:
- Use high-quality source images (1200px+ width)
- Use JPG for photos
- Name files descriptively

## 📱 Responsive Design

The site is fully responsive with breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

All layouts adapt automatically.

## 🔍 SEO Features

- Semantic HTML structure
- Meta tags for social sharing
- Sitemap generation (via @astrojs/sitemap)
- RSS feeds for journal and writings
- Proper heading hierarchy
- Image alt text support

## 🚢 Deployment

### Vercel

1. Import your GitHub repository in Vercel
2. Vercel will auto-detect Astro
3. Deploy with default settings

Or use CLI:
```bash
npm i -g vercel
vercel
```

### Netlify

1. Connect your GitHub repository in Netlify
2. Use these settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

Or use CLI:
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### GitHub Pages

```bash
# Update astro.config.mjs with your repo name
site: 'https://yourusername.github.io/your-repo-name/'

# Deploy
npm run build
# Push dist/ folder to gh-pages branch
```

## 🔧 Development

### Adding New Pages

Create `.astro` files in `src/pages/`. Routes are file-based:
- `src/pages/contact.astro` → `/contact`
- `src/pages/blog/index.astro` → `/blog`

### Creating Components

Components go in `src/components/`:

```astro
---
// Component logic
export interface Props {
  title: string;
}

const { title } = Astro.props;
---

<div class="my-component">
  <h2>{title}</h2>
  <slot />
</div>
```

### TypeScript

The project uses TypeScript with strict mode. Types are defined:
- In component frontmatter
- In `src/content/config.ts` for content collections
- In utility files

## 📦 Dependencies

- **Astro** - Static site generator
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety
- **@astrojs/sitemap** - Sitemap generation
- **@astrojs/rss** - RSS feed generation

## 🐛 Troubleshooting

### Images not showing

- Check image paths start with `/`
- Verify images exist in `public/` directory
- Check browser console for 404 errors

### Build fails

- Run `npm install` to ensure dependencies are installed
- Check for TypeScript errors: `npm run build`
- Verify all content files have required frontmatter fields

### Dark mode not working

- Check localStorage in browser dev tools
- Clear cache and reload
- Verify `darkMode: 'class'` in `tailwind.config.js`

## 📚 Resources

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Content Collections Guide](https://docs.astro.build/en/guides/content-collections/)

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your own use!

## ⚠️ Important Notes

1. **Replace placeholder images**: The site includes placeholder SVG images. Replace them with your actual photos.
2. **Update personal information**: Edit the About page and footer with your details.
3. **Configure site domain**: Update `site` in `astro.config.mjs` with your actual domain.
4. **Social media links**: Update links in `src/components/Footer.astro`.
5. **Node.js version**: Recommended Node.js 18.20.8 or higher.

## 📄 License

This project structure is open source. Your content and images remain yours.

---

Built with [Astro](https://astro.build) 🚀
