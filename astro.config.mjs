// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import remarkGfm from 'remark-gfm';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// --- Sitemap lastmod ---------------------------------------------------------
// Google uses <lastmod> as a recrawl hint (and ignores changefreq/priority), so
// we attach an accurate per-page date. Source of truth is the last git-commit
// date of each post's source file, with the frontmatter `date` and then the
// file mtime as fallbacks for environments without full git history.

/** Last git-commit date (ISO 8601) for a file, or null if unavailable. */
function gitLastmod(filePath) {
  try {
    const out = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

/** `date:` frontmatter value (YYYY-MM-DD) for a file, or null. */
function frontmatterDate(filePath) {
  try {
    const m = fs.readFileSync(filePath, 'utf8').match(/^date:\s*(\d{4}-\d{2}-\d{2})/m);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** Filesystem mtime (ISO 8601) for a file, or null. */
function fileMtime(filePath) {
  try {
    return fs.statSync(filePath).mtime.toISOString();
  } catch {
    return null;
  }
}

function resolveLastmod(filePath) {
  return gitLastmod(filePath) || frontmatterDate(filePath) || fileMtime(filePath);
}

function maxIso(a, b) {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(a) >= Date.parse(b) ? a : b;
}

/** Map of URL pathname -> lastmod string for pages we can date accurately. */
function buildLastmodMap() {
  const map = new Map();
  const sectionMax = {};

  // Folder-per-post collections -> /{base}/{folder}/
  const collections = [
    { dir: 'src/content/photography-journal', base: '/journal' },
    { dir: 'src/content/writings', base: '/writings' },
    { dir: 'src/content/adoption', base: '/adoption' },
  ];

  for (const { dir, base } of collections) {
    const abs = path.join(rootDir, dir);
    let entries = [];
    try {
      entries = fs.readdirSync(abs, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const index = ['index.mdx', 'index.md']
        .map((name) => path.join(abs, entry.name, name))
        .find((p) => fs.existsSync(p));
      if (!index) continue;
      const lastmod = resolveLastmod(index);
      if (!lastmod) continue;
      map.set(`${base}/${entry.name}/`, lastmod);
      sectionMax[base] = maxIso(sectionMax[base], lastmod);
    }
  }

  // Listing pages reflect the most recently changed post in their section.
  for (const base of Object.keys(sectionMax)) {
    map.set(`${base}/`, sectionMax[base]);
  }

  // About page (standalone content file).
  const aboutFile = path.join(rootDir, 'src/content/pages/about.md');
  const aboutDate = gitLastmod(aboutFile) || fileMtime(aboutFile);
  if (aboutDate) map.set('/about/', aboutDate);

  // Homepage reflects the newest content anywhere on the site.
  let overall = null;
  for (const value of map.values()) overall = maxIso(overall, value);
  if (overall) map.set('/', overall);

  return map;
}

const lastmodMap = buildLastmodMap();

// https://astro.build/config
export default defineConfig({
  site: 'https://www.shaneorr.me',
  output: 'static',
  adapter: vercel({
    imageService: true,
  }),
  markdown: {
    remarkPlugins: [remarkGfm],
  },
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => !page.includes('/encuentro'),
      serialize(item) {
        const lastmod = lastmodMap.get(new URL(item.url).pathname);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
    mdx(),
  ],
  image: {
    remotePatterns: [{ protocol: "https" }],
  },
});
