# Images Directory

This directory contains all images for the photography blog.

## Directory Structure

- `journal/` - Images for Photography Journal posts
- `writings/` - Images for Other Writings posts
- `portfolio/` - Portfolio images organized by category
  - `nature/` - Nature photography
  - `street/` - Street photography
  - `concert/` - Concert photography
  - `other/` - Other photography
- `featured/` - Featured photos for the home page hero

## Image Guidelines

### Recommended Sizes

- **Featured Images (Hero):** 1920x1080px or larger (16:9 ratio)
- **Journal/Writing Featured Images:** 1200x800px (3:2 ratio)
- **Portfolio Images:** 1200x800px minimum (various ratios)
- **In-content Images:** 800-1200px width

### Format Recommendations

- Use JPEG for photos (quality 80-90%)
- Use WebP for better compression (Astro will handle conversion)
- Use PNG only for images requiring transparency

### Naming Convention

Use descriptive, kebab-case names:
- ✅ `tokyo-street-sunset.jpg`
- ✅ `mountain-landscape-norway.jpg`
- ❌ `IMG_1234.jpg`
- ❌ `photo 1.jpg`

## Using Images in Content

### In Markdown (Journal/Writings)

```markdown
![Alt text](/images/journal/your-image.jpg)

Or with caption:
![Sunset in Tokyo](/images/journal/tokyo-sunset.jpg)
*Caption: The vibrant colors of Tokyo at dusk*
```

### In Portfolio Collections

Images are referenced in the JSON/data files in `/src/content/portfolio/`

### For Featured Photos

Add images to `/public/images/featured/` and reference them in `/src/content/featured/`
