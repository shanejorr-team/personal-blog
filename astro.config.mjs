// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import remarkGfm from 'remark-gfm';

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
    }),
    mdx(),
  ],
  image: {
    remotePatterns: [{ protocol: "https" }],
  },
});
