import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { sortByDate, filterDrafts } from '../utils/helpers';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('photography-journal');
  const publishedPosts = sortByDate(filterDrafts(posts));

  return rss({
    title: 'Photography Journal - Your Name',
    description: 'Travel photo stories and essays from around the world',
    site: context.site || 'https://yourdomain.com',
    items: publishedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/journal/${post.slug}`,
      pubDate: post.data.date,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
