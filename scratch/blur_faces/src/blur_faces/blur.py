"""Image manipulation and blur application."""

import logging
import os
from pathlib import Path
from typing import Dict, List, Tuple

from PIL import Image, ImageFilter

from .config import (
    FACE_PADDING_PERCENT,
    SUPPORTED_EXTENSIONS,
    MAX_IMAGE_SIZE_BYTES,
    DEFAULT_BLUR_STRENGTH,
)
from .detector import BoundingBox, RekognitionDetector, RekognitionError

logger = logging.getLogger(__name__)


def expand_bounding_box(
    box: BoundingBox,
    image_width: int,
    image_height: int,
    padding_percent: float = FACE_PADDING_PERCENT,
) -> Tuple[int, int, int, int]:
    """
    Expand bounding box to include hair and ears.

    Args:
        box: Original bounding box from face detection.
        image_width: Image width for bounds checking.
        image_height: Image height for bounds checking.
        padding_percent: How much to expand (0.25 = 25%).

    Returns:
        Tuple of (left, top, right, bottom) in pixel coordinates.
    """
    pad_x = int(box.width * padding_percent)
    pad_y = int(box.height * padding_percent)

    # Expand while staying within image bounds
    left = max(0, box.left - pad_x)
    top = max(0, box.top - pad_y)
    right = min(image_width, box.right + pad_x)
    bottom = min(image_height, box.bottom + pad_y)

    return (left, top, right, bottom)


def apply_gaussian_blur(
    image: Image.Image,
    faces: List[BoundingBox],
    blur_strength: int = DEFAULT_BLUR_STRENGTH,
) -> Image.Image:
    """
    Apply Gaussian blur to all detected face regions.

    Args:
        image: PIL Image object.
        faces: List of BoundingBox objects from face detection.
        blur_strength: Blur radius (higher = more blur).

    Returns:
        New Image with blurred faces (original is not modified).
    """
    # Ensure blur_strength is reasonable
    blur_radius = max(1, blur_strength // 2)

    result = image.copy()
    width, height = image.size

    for box in faces:
        # Expand region to cover hair/ears
        left, top, right, bottom = expand_bounding_box(box, width, height)

        # Crop face region
        face_region = result.crop((left, top, right, bottom))

        # Apply strong Gaussian blur
        blurred = face_region.filter(ImageFilter.GaussianBlur(radius=blur_radius))

        # Paste back
        result.paste(blurred, (left, top))

        logger.debug(f"Blurred region: ({left}, {top}) to ({right}, {bottom})")

    return result


def load_image(image_path: Path) -> Tuple[Image.Image, bytes]:
    """
    Load an image file and return both PIL Image and raw bytes.

    Args:
        image_path: Path to the image file.

    Returns:
        Tuple of (PIL Image, raw bytes for Rekognition).

    Raises:
        ValueError: If image format is unsupported or file is too large.
    """
    if image_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported format: {image_path.suffix}. "
            f"Supported: {', '.join(SUPPORTED_EXTENSIONS)}"
        )

    # Check file size before loading
    file_size = image_path.stat().st_size
    if file_size > MAX_IMAGE_SIZE_BYTES:
        raise ValueError(
            f"Image too large: {file_size / 1024 / 1024:.1f}MB. "
            f"Maximum: {MAX_IMAGE_SIZE_BYTES / 1024 / 1024:.0f}MB"
        )

    # Load image
    image = Image.open(image_path)

    # Convert to RGB if necessary (e.g., RGBA PNGs, palette images)
    if image.mode in ("RGBA", "P", "LA"):
        image = image.convert("RGB")

    # Read raw bytes for Rekognition
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    return image, image_bytes


def get_output_filename(input_filename: str) -> str:
    """
    Generate output filename with '-blurred' suffix.

    Args:
        input_filename: Original filename (e.g., 'vacation_photo.jpg').

    Returns:
        New filename (e.g., 'vacation_photo-blurred.jpg').
    """
    name, ext = os.path.splitext(input_filename)
    return f"{name}-blurred{ext}"


def process_single_image(
    input_path: Path,
    output_path: Path,
    detector: RekognitionDetector,
    blur_strength: int = DEFAULT_BLUR_STRENGTH,
) -> Tuple[bool, int]:
    """
    Process a single image: detect faces and apply blur.

    Args:
        input_path: Path to input image.
        output_path: Path for output image.
        detector: RekognitionDetector instance.
        blur_strength: Gaussian blur strength.

    Returns:
        Tuple of (success: bool, num_faces: int).
    """
    try:
        # Load image
        image, image_bytes = load_image(input_path)
        width, height = image.size

        # Detect faces using AWS Rekognition
        faces = detector.detect_faces(image_bytes, width, height)
        num_faces = len(faces)

        # Apply blur if faces found
        if num_faces > 0:
            image = apply_gaussian_blur(image, faces, blur_strength)
            logger.info(f"Processed {input_path.name}: blurred {num_faces} face(s)")
        else:
            logger.info(f"Processed {input_path.name}: no faces detected")

        # Save result with high quality
        image.save(output_path, quality=95, optimize=True)

        return (True, num_faces)

    except ValueError as e:
        logger.error(f"Invalid image {input_path.name}: {e}")
        return (False, 0)
    except RekognitionError as e:
        logger.error(f"Rekognition error for {input_path.name}: {e}")
        return (False, 0)
    except Exception as e:
        logger.error(f"Failed to process {input_path.name}: {e}")
        return (False, 0)


def process_directory(
    input_dir: Path,
    output_dir: Path,
    detector: RekognitionDetector,
    blur_strength: int = DEFAULT_BLUR_STRENGTH,
    dry_run: bool = False,
) -> Dict[str, int]:
    """
    Batch process all images in a directory.

    Args:
        input_dir: Directory containing input images.
        output_dir: Directory for output images.
        detector: RekognitionDetector instance.
        blur_strength: Gaussian blur strength.
        dry_run: If True, only list files without processing.

    Returns:
        Statistics dictionary with keys: processed, failed, total_faces, no_faces.
    """
    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)

    # Find supported image files
    image_files = [
        f
        for f in input_dir.iterdir()
        if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    # Log skipped files (unsupported formats, excluding hidden files)
    all_files = [f for f in input_dir.iterdir() if f.is_file()]
    unsupported = [
        f
        for f in all_files
        if f.suffix.lower() not in SUPPORTED_EXTENSIONS
        and not f.name.startswith(".")
    ]
    for f in unsupported:
        logger.warning(f"Skipping unsupported format: {f.name}")

    if not image_files:
        logger.warning(f"No supported images found in {input_dir}")
        return {"processed": 0, "failed": 0, "total_faces": 0, "no_faces": 0}

    logger.info(f"Found {len(image_files)} image(s) to process")

    if dry_run:
        for f in sorted(image_files):
            logger.info(f"  Would process: {f.name}")
        return {"processed": 0, "failed": 0, "total_faces": 0, "no_faces": 0}

    # Process statistics
    stats = {"processed": 0, "failed": 0, "total_faces": 0, "no_faces": 0}

    for input_path in sorted(image_files):
        output_filename = get_output_filename(input_path.name)
        output_path = output_dir / output_filename

        success, num_faces = process_single_image(
            input_path, output_path, detector, blur_strength
        )

        if success:
            stats["processed"] += 1
            stats["total_faces"] += num_faces
            if num_faces == 0:
                stats["no_faces"] += 1
        else:
            stats["failed"] += 1

    return stats
