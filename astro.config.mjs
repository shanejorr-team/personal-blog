// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://yourdomain.com', // Update with your domain
  output: 'static',
  adapter: vercel({
    imageService: true,
  }),
  integrations: [tailwind(), sitemap(), mdx()],
  image: {
    remotePatterns: [{ protocol: "https" }],
  },
});
