import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { sortByDate, filterDrafts } from '../utils/helpers';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('adoption');
  const publishedPosts = sortByDate(filterDrafts(posts));

  return rss({
    title: 'Adoption - Shane Orr',
    description: 'Stories and reflections from our adoption journey',
    site: context.site || 'https://yourdomain.com',
    items: publishedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/adoption/${post.slug}`,
      pubDate: post.data.date,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
