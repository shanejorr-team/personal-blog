import { getImage } from 'astro:assets';
import type { Photo } from './db';
import { getPhotoPath, getPhotoAlt } from './db';
import { getImageByPath } from './imageLoader';

// Processed image with all metadata needed for display
export interface ProcessedImage {
  src: string;
  alt: string;
  caption: string;
  location: string;
  country: string;
  category: string;
  aspectRatio: number;
  lightboxSrc: string;
  originalSrc: string;
  importedImage: ImageMetadata | undefined;
}

// Options for image processing
export interface ProcessOptions {
  includeLightbox?: boolean;
  lightboxWidth?: number;
  lightboxQuality?: number;
}

const DEFAULT_OPTIONS: ProcessOptions = {
  includeLightbox: true,
  lightboxWidth: 1920,
  lightboxQuality: 85,
};

/**
 * Process a single photo for display with optimized lightbox image
 */
export async function processPhoto(
  photo: Photo,
  options: ProcessOptions = {}
): Promise<ProcessedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const imagePath = getPhotoPath(photo);
  const importedImage = await getImageByPath(imagePath);

  // Fallback for missing images
  if (!importedImage) {
    console.warn(`Could not find imported image for ${imagePath}`);
    return {
      src: imagePath,
      alt: getPhotoAlt(photo),
      caption: photo.caption,
      location: photo.location,
      country: photo.country,
      category: photo.category,
      aspectRatio: 1.5,
      lightboxSrc: imagePath,
      originalSrc: imagePath,
      importedImage: undefined,
    };
  }

  const aspectRatio = importedImage.width / importedImage.height;
  let lightboxSrc = imagePath;

  // Generate optimized lightbox version (skip for SVG files)
  if (opts.includeLightbox) {
    const isSvg = imagePath.toLowerCase().endsWith('.svg');
    if (!isSvg) {
      try {
        const targetHeight = Math.round(opts.lightboxWidth! / aspectRatio);
        const lightboxImage = await getImage({
          src: importedImage,
          width: opts.lightboxWidth!,
          height: targetHeight,
          format: 'webp',
          quality: opts.lightboxQuality!,
        });
        lightboxSrc = lightboxImage.src;
      } catch (error: any) {
        console.warn(`Could not optimize lightbox image for ${imagePath}:`, error.message);
      }
    }
  }

  return {
    src: imagePath,
    alt: getPhotoAlt(photo),
    caption: photo.caption,
    location: photo.location,
    country: photo.country,
    category: photo.category,
    aspectRatio,
    lightboxSrc,
    originalSrc: imagePath,
    importedImage,
  };
}

/**
 * Process multiple photos for display
 * Uses batch processing to limit memory usage during builds
 */
export async function processPhotos(
  photos: Photo[],
  options: ProcessOptions = {}
): Promise<ProcessedImage[]> {
  const BATCH_SIZE = 10;
  const results: ProcessedImage[] = [];

  for (let i = 0; i < photos.length; i += BATCH_SIZE) {
    const batch = photos.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(photo => processPhoto(photo, options))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Process photos for navigation cards (no lightbox needed)
 */
export async function processNavPhotos(photos: Photo[]): Promise<ProcessedImage[]> {
  return processPhotos(photos, { includeLightbox: false });
}
