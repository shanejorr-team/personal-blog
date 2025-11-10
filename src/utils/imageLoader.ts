// Image loader utility using Vite's import.meta.glob
// This allows us to dynamically import images from src/images for optimization

// Import all images from src/images/photography
const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/images/photography/**/*.{jpg,jpeg,png,svg}',
  { eager: true }
);

// Create a lookup map that converts public paths to imported images
// Example: '/images/photography/nature/ship.jpg' -> imported image object
const imageMap = new Map<string, ImageMetadata>();

for (const [path, module] of Object.entries(images)) {
  // Convert: '/src/images/photography/nature/ship.jpg' -> '/images/photography/nature/ship.jpg'
  const publicPath = path.replace('/src/images', '/images');
  imageMap.set(publicPath, module.default);
}

/**
 * Get an imported image by its public path
 * @param path - Public path like '/images/photography/nature/ship.jpg'
 * @returns Imported ImageMetadata object or undefined if not found
 */
export function getImageByPath(path: string): ImageMetadata | undefined {
  return imageMap.get(path);
}

/**
 * Check if an image exists in the map
 * @param path - Public path like '/images/photography/nature/ship.jpg'
 * @returns boolean indicating if image exists
 */
export function hasImage(path: string): boolean {
  return imageMap.has(path);
}

/**
 * Get all available image paths
 * @returns Array of public paths
 */
export function getAllImagePaths(): string[] {
  return Array.from(imageMap.keys());
}
