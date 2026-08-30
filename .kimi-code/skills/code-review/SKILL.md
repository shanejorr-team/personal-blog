---
name: code-review
description: Comprehensive code review of the Astro photography blog focused on unused code elimination, DRY principles, photo serving optimization, Core Web Vitals, TypeScript safety, Astro best practices, and CLI script consistency. Use when the user asks for a code review of this repo.
---

# Code Review: Astro Photography Blog - Clean Up, DRY Principles & Photo Optimization

## Your Mission

Perform a comprehensive code review focusing on **code quality, maintainability, and photo serving optimization** while preserving all current functionality. Breaking changes are acceptable - there's no need for backwards compatibility.

## Review Priorities

### 1. Unused & Redundant Code Elimination (PRIORITY)

**Your first task: Systematically identify and remove ALL unused/unneeded code.**

#### Unused Code to Remove

- **Astro components** never imported/rendered anywhere
- **TypeScript functions/methods** never called in the codebase
- **Imports never used** in `.astro` and `.ts` files
- **Constants/variables** defined but never referenced
- **Database query functions** in `db.ts` that are never called
- **CLI script helper functions** that have no callers
- **Utility functions** in `helpers.ts` that are unused
- **Dead CSS** in `global.css` that targets nothing

#### Redundant Code to Consolidate

- **Duplicate logic** across Astro pages (especially portfolio pages)
- **Similar page layouts** that could share a component
- **Copy-pasted Tailwind class patterns** that appear multiple times
- **Repeated database query patterns** that could be abstracted
- **Similar image loading patterns** that could be unified
- **Duplicate validation logic** across CLI scripts

#### How to Identify Unused Code

**TypeScript/Astro Files:**

```bash
# Check for unused exports
npx tsc --noEmit

# Search for function definitions and check if they're called
# Example: Search for "export function" and verify each is imported elsewhere
```

**Manual Verification:**

- Search the entire codebase for each function/component name
- If only found in its definition file → likely unused
- Trace from entry points (pages, CLI scripts) to see what's actually called

#### Be Aggressive

- **When in doubt, remove it** - git history preserves everything
- **Don't keep code "just in case"** - you can always restore from git
- **Delete commented-out code** - git is your backup, not code comments
- **Remove "future-proofing"** - only build what you need now

### 2. Photo Serving Optimization

**Verify these photo optimization patterns are consistently applied:**

#### Image Format & Quality Checklist

- [ ] All portfolio images use `<Picture>` component with `formats={['avif', 'webp']}`
- [ ] Quality settings: 80% for grid display, 85% for lightbox
- [ ] 2x dimensions passed for retina display support
- [ ] Images in `src/images/photography/` are served through Astro's image optimization

#### Lazy Loading Checklist

- [ ] All non-hero images have `loading="lazy"` attribute
- [ ] Hero image does NOT have lazy loading (it's above the fold)
- [ ] Lightbox images load on-demand when modal opens

#### Preloading Checklist

- [ ] Hero image is preloaded via `<link rel="preload" as="image" type="image/webp">`
- [ ] Preload link is in `<head>` via BaseLayout's `preloadImage` prop
- [ ] No unnecessary preloading of below-fold images

#### Lightbox Optimization Checklist

- [ ] Lightbox images are pre-optimized at build time (WebP, 1920px max width)
- [ ] Lightbox uses `getImage()` for build-time optimization
- [ ] Quality set to 85% for lightbox (higher than grid for detail viewing)

#### Aspect Ratio & Layout Checklist

- [ ] Aspect ratios calculated at build time using Sharp metadata
- [ ] Explicit width/height passed to prevent CLS (Cumulative Layout Shift)
- [ ] Fallback aspect ratio (1.5 / 3:2) used when dimensions unavailable
- [ ] Justified grid uses `flex-basis` calculated from aspect ratio

### 3. Core Web Vitals Performance

#### LCP (Largest Contentful Paint)

- [ ] Hero image is preloaded in `<head>`
- [ ] Critical fonts have `preconnect` links
- [ ] No render-blocking resources delay hero image

#### CLS (Cumulative Layout Shift)

- [ ] All images have explicit width and height attributes
- [ ] Aspect ratios are defined before images load
- [ ] Font loading doesn't cause layout shifts (`font-display: swap`)
- [ ] Grid items have fixed heights (280px target height)

#### INP (Interaction to Next Paint)

- [ ] Lightbox opens/closes without jank
- [ ] Navigation interactions are responsive
- [ ] No long-running JavaScript blocking main thread

### 4. DRY Principles & Code Organization

#### Look for these DRY violations

- **Portfolio pages** (`[category].astro`, `[country].astro`, `index.astro`): Check for duplicate image grid rendering logic
- **Journal and Writings pages**: Check for duplicate post listing/rendering patterns
- **Image loading patterns**: Check if same `getImage()` calls are repeated
- **Database queries**: Check if similar queries could share a function

#### Consolidation Opportunities

- Extract repeated Tailwind class combinations into `global.css` using `@apply`
- Create shared components for common patterns
- Centralize image optimization settings (quality, formats, dimensions)
- Share validation logic between CLI scripts

### 5. TypeScript Type Safety

#### Zod Schemas (`src/content/config.ts`)

- Verify schemas match actual content frontmatter
- Check for missing optional fields that should be required
- Ensure `image()` helper is used for all image references

#### Photo Interface (`src/utils/db.ts`)

- Verify nullable fields are typed correctly (`number | null` vs `number`)
- Check that `category` union type matches database CHECK constraint
- Ensure all database columns are represented in interface

#### Type Assertions

- Look for `as Photo` without prior validation
- Consider adding runtime validation for database results
- Check for `any` types that could be more specific

### 6. Astro Best Practices

#### Component vs Page Boundaries

- Logic that's reused should be in components, not pages
- Pages should primarily compose components
- Heavy data processing should happen in page frontmatter, not components

#### Image Component Usage

- Use `<Picture>` for responsive images with format fallbacks
- Use `<Image>` for simple optimized images
- Use raw `<img>` only for lightbox (where optimization is pre-done)
- Never use raw `<img>` for portfolio grids

#### Content Collections

- Verify `getCollection()` calls filter drafts in production
- Check that slugs are generated consistently
- Ensure featured images use relative paths with `image()` helper

### 7. Tailwind CSS Consistency

#### Dark Mode Coverage

- Every color class should have a `dark:` variant
- Check hover states have dark mode equivalents
- Verify borders, backgrounds, and text all support dark mode

#### Responsive Design

- Verify mobile-first approach (base styles for mobile, `md:` for larger)
- Check that touch targets are at least 44px on mobile
- Ensure hover effects are disabled on touch devices (`@media (hover: none)`)

#### CSS Organization

- Look for duplicate utility combinations that could be `@apply` classes
- Check `global.css` for unused custom styles
- Verify Tailwind classes aren't fighting custom CSS

### 8. Database & Query Patterns

#### Performance

- Verify indexes exist for commonly queried columns
- Check that queries use indexes (category, country, featured fields)
- Ensure no N+1 patterns (though less relevant for static builds)

#### Data Integrity

- Parameterized queries throughout (no string concatenation)
- CHECK constraints match TypeScript types
- Required fields (caption, location, country) are validated

#### Connection Management

- Singleton pattern for database connection
- Read-only mode for build-time queries
- `closeDb()` called when appropriate

### 9. CLI Scripts Review (`src/scripts/`)

Review all 9 CLI tools for code quality:

#### Code Duplication

- Shared validation logic should be extracted
- Similar database insert/update patterns should be unified
- Error formatting should be consistent

#### Error Handling

- All scripts should have try/catch with meaningful messages
- Validation errors should specify row and field
- Database errors should be caught and reported cleanly

#### Type Safety

- CSV parsing should validate against expected types
- Database results should be properly typed
- Optional fields should use optional chaining

#### Transaction Patterns

- Bulk operations should use transactions
- Failed transactions should roll back completely
- Success/failure should be clearly communicated

## Files to Review

### Core Utilities (Review First)

- `src/utils/db.ts` - Database queries and Photo type
- `src/utils/imageLoader.ts` - Vite glob image loading
- `src/utils/helpers.ts` - Generic post utilities

### Components

- `src/components/Lightbox.astro` - Image modal with navigation
- `src/components/Header.astro` - Site navigation
- `src/components/Footer.astro` - Site footer
- `src/components/DarkModeToggle.astro` - Theme switcher
- `src/components/Breadcrumbs.astro` - Navigation breadcrumbs

### Pages (Check for DRY Violations)

- `src/pages/index.astro` - Homepage with hero
- `src/pages/portfolio/index.astro` - Main portfolio
- `src/pages/portfolio/[category].astro` - Category galleries
- `src/pages/portfolio/[country].astro` - Country galleries
- `src/pages/journal/index.astro` - Journal listing
- `src/pages/journal/[slug].astro` - Journal posts
- `src/pages/writings/index.astro` - Writings listing
- `src/pages/writings/[slug].astro` - Writing posts

### Configuration

- `src/content/config.ts` - Zod schemas
- `astro.config.mjs` - Build configuration
- `tailwind.config.js` - Tailwind setup
- `src/styles/global.css` - Custom styles

### CLI Scripts

- `src/scripts/add-photo.ts` - Interactive photo addition
- `src/scripts/import-photos-csv.ts` - Bulk CSV import
- `src/scripts/update-photos-csv.ts` - Bulk CSV updates
- `src/scripts/generate-template.ts` - CSV template generator
- `src/scripts/export-backup.ts` - JSON backup export
- `src/scripts/export-csv.ts` - CSV export
- `src/scripts/validate-constraints.ts` - Data validation
- `src/scripts/migrate-json-to-db.ts` - Historical migration
- `src/scripts/migrate-database.ts` - Schema updates

## What NOT to Change

- Core architecture (Astro static site + SQLite database)
- Git LFS configuration for images
- Database schema structure (unless truly problematic)
- Content collection organization
- File naming conventions for photos

## Questions to Consider

- Are there components that are almost identical and could be merged?
- Could this image loading pattern be simplified?
- Is this the right component boundary?
- Would a new developer understand why this code exists?
- Is this Tailwind pattern repeated enough to warrant `@apply`?
- Could these CLI scripts share more validation code?

## Begin Review

Start with a high-level pass through utilities (`db.ts`, `imageLoader.ts`, `helpers.ts`) to identify unused exports, then examine pages for DRY violations, and finally review CLI scripts for consistency. Prioritize changes that improve both code quality and photo serving performance.
