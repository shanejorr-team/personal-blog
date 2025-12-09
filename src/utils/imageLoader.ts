// Image loader utility using Vite's import.meta.glob
// This allows us to dynamically import images from src/photography for optimization

// Import all images from src/photography lazily (on-demand)
// Using eager: false to avoid loading all 500+ images into memory at build start
const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/photography/**/*.{jpg,jpeg,png,svg}',
  { eager: false }
);

/**
 * Get an imported image by its public path
 * @param path - Public path like '/photography/nature/ship.jpg'
 * @returns Promise resolving to ImageMetadata object or undefined if not found
 */
export async function getImageByPath(path: string): Promise<ImageMetadata | undefined> {
  // Convert public path to source path
  // Example: '/photography/nature/ship.jpg' -> '/src/photography/nature/ship.jpg'
  const srcPath = path.replace('/photography/', '/src/photography/');
  const loader = images[srcPath];
  if (!loader) return undefined;
  const module = await loader();
  return module.default;
}
