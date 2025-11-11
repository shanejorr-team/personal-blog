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

// Portfolio collection - organized by category
const portfolio = defineCollection({
  type: 'data',
  schema: () => z.object({
    category: z.enum(['nature', 'street', 'concert', 'other']),
    images: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
      location: z.string().optional(),
      country: z.string().optional(),
      date: z.coerce.date().optional(),
      sub_category: z.string().optional(),
      featured: z.number().optional(),
    })),
    order: z.number().default(0),
  }),
});

export const collections = {
  'photography-journal': photographyJournal,
  'writings': writings,
  'portfolio': portfolio,
};
