// Image loader utility using Vite's import.meta.glob
// This allows us to dynamically import images from src/photography for optimization

// Import all images from src/photography
const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/photography/**/*.{jpg,jpeg,png,svg}',
  { eager: true }
);

// Create a lookup map that converts public paths to imported images
// Example: '/photography/nature/ship.jpg' -> imported image object
const imageMap = new Map<string, ImageMetadata>();

for (const [path, module] of Object.entries(images)) {
  // Convert: '/src/photography/nature/ship.jpg' -> '/photography/nature/ship.jpg'
  const publicPath = path.replace('/src', '');
  imageMap.set(publicPath, module.default);
}

/**
 * Get an imported image by its public path
 * @param path - Public path like '/photography/nature/ship.jpg'
 * @returns Imported ImageMetadata object or undefined if not found
 */
export function getImageByPath(path: string): ImageMetadata | undefined {
  return imageMap.get(path);
}
