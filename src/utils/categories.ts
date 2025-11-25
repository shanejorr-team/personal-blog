// Shared category configuration

export const CATEGORY_INFO: Record<string, { title: string; description: string }> = {
  nature: {
    title: 'Nature',
    description: 'Landscapes, wildlife, and natural wonders',
  },
  street: {
    title: 'Street Photography',
    description: 'Candid moments and urban life',
  },
  concert: {
    title: 'Concert Photography',
    description: 'Live music and performance',
  },
};

export const CATEGORY_NAV_INFO: Record<string, { name: string; url: string }> = {
  nature: { name: 'Nature', url: '/portfolio/nature' },
  street: { name: 'Cities & Streets', url: '/portfolio/street' },
  concert: { name: 'Music', url: '/portfolio/concert' },
};

export function getCategoryTitle(category: string): string {
  return CATEGORY_INFO[category]?.title || category;
}

export function getCategoryDescription(category: string): string {
  return CATEGORY_INFO[category]?.description || '';
}
