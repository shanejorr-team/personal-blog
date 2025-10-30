import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { sortByDate, filterDrafts } from '../utils/helpers';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('writings');
  const publishedPosts = sortByDate(filterDrafts(posts));

  return rss({
    title: 'Other Writings - Your Name',
    description: 'Thoughts, tutorials, and musings on photography, technology, and life',
    site: context.site || 'https://yourdomain.com',
    items: publishedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/writings/${post.slug}`,
      pubDate: post.data.date,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
