/**
 * Format a date to a readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Sort posts by date (newest first)
 */
export function sortByDate<T extends { data: { date: Date } }>(posts: T[]): T[] {
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/**
 * Filter out draft posts in production
 */
export function filterDrafts<T extends { data: { draft?: boolean } }>(posts: T[]): T[] {
  if (import.meta.env.PROD) {
    return posts.filter(post => !post.data.draft);
  }
  return posts;
}

/**
 * Get unique tags from a list of posts
 */
export function getUniqueTags<T extends { data: { tags?: string[] } }>(posts: T[]): string[] {
  const tags = new Set<string>();
  posts.forEach(post => {
    post.data.tags?.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}
