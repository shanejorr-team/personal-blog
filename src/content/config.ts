import { defineCollection, z } from 'astro:content';

// Photography Journal collection - travel photo stories
const photographyJournal = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    location: z.string().optional(),
    country: z.string().optional(),
    featuredImage: image().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// Other Writings collection - general blog posts
const writings = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    featuredImage: image().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// Pages collection - standalone pages like About
const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

// Portfolio collection removed - now using SQLite database (src/db/photos.db)
// See src/utils/db.ts for database query functions

export const collections = {
  'photography-journal': photographyJournal,
  'writings': writings,
  'pages': pages,
};
