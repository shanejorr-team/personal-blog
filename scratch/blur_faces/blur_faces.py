#!/usr/bin/env python3
"""
Face Blurring Script

Batch-processes images to blur all detected faces for privacy/anonymization.
Uses face_recognition library as primary detector with OpenCV Haar cascades as fallback.

Usage:
    python blur_faces.py [--input INPUT_DIR] [--output OUTPUT_DIR] [--blur-strength STRENGTH]
"""

import argparse
import logging
import os
import sys
from pathlib import Path
from typing import List, Tuple, Optional

import cv2
import numpy as np

# Try to import face_recognition (requires dlib)
try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    logging.warning(
        "face_recognition library not available. Using OpenCV fallback only."
    )


# Default directories (relative to script location)
SCRIPT_DIR = Path(__file__).parent
DEFAULT_INPUT_DIR = SCRIPT_DIR / "original_photos"
DEFAULT_OUTPUT_DIR = SCRIPT_DIR / "blurred_photos"

# Blur settings
DEFAULT_BLUR_STRENGTH = 99  # Gaussian kernel size (must be odd)
FACE_PADDING_PERCENT = 0.2  # Expand face region by 20% to cover hair/ears


def setup_logging(verbose: bool = False) -> None:
    """Configure logging with appropriate format and level."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        force=True  # Override any existing handlers from import-time logging
    )


def detect_faces_recognition(image: np.ndarray) -> List[Tuple[int, int, int, int]]:
    """
    Detect faces using the face_recognition library (HOG-based).

    Args:
        image: Image as numpy array (BGR format from OpenCV).

    Returns:
        List of face locations as (top, right, bottom, left) tuples.
    """
    if not FACE_RECOGNITION_AVAILABLE:
        return []

    try:
        # Convert BGR to RGB for face_recognition
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_image, model="hog")
        logging.debug(f"face_recognition found {len(face_locations)} face(s)")
        return face_locations
    except Exception as e:
        logging.warning(f"face_recognition failed: {e}")
        return []


def download_dnn_model() -> Tuple[str, str]:
    """
    Download OpenCV DNN face detection model files if not present.

    Returns:
        Tuple of (prototxt_path, caffemodel_path).
    """
    import urllib.request

    model_dir = SCRIPT_DIR / "models"
    model_dir.mkdir(exist_ok=True)

    prototxt_path = model_dir / "deploy.prototxt"
    model_path = model_dir / "res10_300x300_ssd_iter_140000.caffemodel"

    base_url = "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/"

    if not prototxt_path.exists():
        logging.info("Downloading face detection model (prototxt)...")
        prototxt_url = (
            "https://raw.githubusercontent.com/opencv/opencv/4.x/samples/dnn/"
            "face_detector/deploy.prototxt"
        )
        urllib.request.urlretrieve(prototxt_url, prototxt_path)

    if not model_path.exists():
        logging.info("Downloading face detection model (caffemodel, ~10MB)...")
        model_url = (
            "https://raw.githubusercontent.com/opencv/opencv_3rdparty/"
            "dnn_samples_face_detector_20170830/"
            "res10_300x300_ssd_iter_140000.caffemodel"
        )
        urllib.request.urlretrieve(model_url, model_path)

    return str(prototxt_path), str(model_path)


# Global DNN face detector (loaded once)
_dnn_net = None


def get_dnn_detector():
    """Get or initialize the DNN face detector."""
    global _dnn_net
    if _dnn_net is None:
        prototxt, model = download_dnn_model()
        _dnn_net = cv2.dnn.readNetFromCaffe(prototxt, model)
    return _dnn_net


def detect_faces_dnn(
    image: np.ndarray,
    confidence_threshold: float = 0.5
) -> List[Tuple[int, int, int, int]]:
    """
    Detect faces using OpenCV's DNN module with a pre-trained Caffe model.

    This is more accurate than Haar cascades and works well with various
    face angles and lighting conditions.

    Args:
        image: Image as numpy array (BGR format from OpenCV).
        confidence_threshold: Minimum confidence score for detection.

    Returns:
        List of face locations as (top, right, bottom, left) tuples.
    """
    try:
        net = get_dnn_detector()
        h, w = image.shape[:2]

        # Create blob from image (resize to 300x300 for the model)
        blob = cv2.dnn.blobFromImage(
            cv2.resize(image, (300, 300)),
            1.0,
            (300, 300),
            (104.0, 177.0, 123.0)
        )

        net.setInput(blob)
        detections = net.forward()

        face_locations = []
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence > confidence_threshold:
                # Get bounding box coordinates
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                (left, top, right, bottom) = box.astype("int")

                # Ensure coordinates are within image bounds
                left = max(0, left)
                top = max(0, top)
                right = min(w, right)
                bottom = min(h, bottom)

                face_locations.append((top, right, bottom, left))

        logging.debug(f"DNN detector found {len(face_locations)} face(s)")
        return face_locations
    except Exception as e:
        logging.warning(f"DNN detection failed: {e}")
        return []


def detect_faces_opencv(image: np.ndarray) -> List[Tuple[int, int, int, int]]:
    """
    Detect faces using OpenCV's Haar cascade classifier (fallback method).

    Args:
        image: Image as numpy array (BGR format from OpenCV).

    Returns:
        List of face locations as (top, right, bottom, left) tuples.
    """
    try:
        # Load the pre-trained Haar cascade for face detection
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        face_cascade = cv2.CascadeClassifier(cascade_path)

        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Detect faces with tuned parameters for better detection
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )

        # Convert OpenCV format (x, y, w, h) to face_recognition format
        face_locations = []
        for (x, y, w, h) in faces:
            top = y
            right = x + w
            bottom = y + h
            left = x
            face_locations.append((top, right, bottom, left))

        logging.debug(f"Haar cascade found {len(face_locations)} face(s)")
        return face_locations
    except Exception as e:
        logging.warning(f"Haar cascade detection failed: {e}")
        return []


def detect_faces(image: np.ndarray) -> List[Tuple[int, int, int, int]]:
    """
    Detect faces in an image using available methods.

    Priority:
    1. face_recognition library (most accurate, requires dlib)
    2. OpenCV DNN detector (accurate, no extra dependencies)
    3. OpenCV Haar cascade (fast but less accurate, fallback)

    Args:
        image: Image as numpy array (BGR format from OpenCV).

    Returns:
        List of face locations as (top, right, bottom, left) tuples.
    """
    # Try face_recognition first if available
    if FACE_RECOGNITION_AVAILABLE:
        faces = detect_faces_recognition(image)
        if faces:
            return faces
        logging.debug("face_recognition found no faces, trying DNN")

    # Try DNN detector (more accurate than Haar cascades)
    faces = detect_faces_dnn(image)
    if faces:
        return faces
    logging.debug("DNN detector found no faces, trying Haar cascade fallback")

    # Final fallback to Haar cascades
    return detect_faces_opencv(image)


def expand_face_region(
    top: int, right: int, bottom: int, left: int,
    image_width: int, image_height: int,
    padding_percent: float = FACE_PADDING_PERCENT
) -> Tuple[int, int, int, int]:
    """
    Expand face bounding box to include hair and ears.

    Args:
        top, right, bottom, left: Original face coordinates.
        image_width, image_height: Image dimensions for bounds checking.
        padding_percent: How much to expand (0.2 = 20%).

    Returns:
        Expanded coordinates as (top, right, bottom, left).
    """
    face_width = right - left
    face_height = bottom - top

    # Calculate padding amounts
    pad_x = int(face_width * padding_percent)
    pad_y = int(face_height * padding_percent)

    # Expand while staying within image bounds
    new_top = max(0, top - pad_y)
    new_bottom = min(image_height, bottom + pad_y)
    new_left = max(0, left - pad_x)
    new_right = min(image_width, right + pad_x)

    return (new_top, new_right, new_bottom, new_left)


def apply_blur(
    image: np.ndarray,
    face_locations: List[Tuple[int, int, int, int]],
    blur_strength: int = DEFAULT_BLUR_STRENGTH
) -> np.ndarray:
    """
    Apply Gaussian blur to all detected face regions.

    Args:
        image: Image as numpy array (BGR format from OpenCV).
        face_locations: List of (top, right, bottom, left) tuples.
        blur_strength: Gaussian kernel size (larger = more blur).

    Returns:
        Image with blurred faces.
    """
    # Ensure blur_strength is odd (required for Gaussian blur)
    if blur_strength % 2 == 0:
        blur_strength += 1

    # Create a copy to avoid modifying the original
    result = image.copy()
    height, width = image.shape[:2]

    for (top, right, bottom, left) in face_locations:
        # Expand face region to cover hair/ears
        top, right, bottom, left = expand_face_region(
            top, right, bottom, left, width, height
        )

        # Extract face region
        face_region = result[top:bottom, left:right]

        # Apply strong Gaussian blur
        blurred_face = cv2.GaussianBlur(face_region, (blur_strength, blur_strength), 0)

        # Replace original face region with blurred version
        result[top:bottom, left:right] = blurred_face

    return result


def load_image(image_path: Path) -> Optional[np.ndarray]:
    """
    Load a JPEG image file.

    Args:
        image_path: Path to the image file.

    Returns:
        Image as numpy array (BGR format) or None if loading failed.
    """
    image = cv2.imread(str(image_path))
    if image is None:
        logging.error(f"Could not load image: {image_path}")
    return image


def process_single_image(
    input_path: Path,
    output_path: Path,
    blur_strength: int = DEFAULT_BLUR_STRENGTH
) -> Tuple[bool, int]:
    """
    Process a single image: detect faces and apply blur.

    Args:
        input_path: Path to input image.
        output_path: Path for output image.
        blur_strength: Gaussian kernel size.

    Returns:
        Tuple of (success: bool, num_faces: int).
    """
    try:
        # Load image (handles both standard and RAW formats)
        image = load_image(input_path)
        if image is None:
            return (False, 0)

        # Detect faces (pass loaded image, not path)
        face_locations = detect_faces(image)
        num_faces = len(face_locations)

        # Apply blur if faces were found
        if num_faces > 0:
            image = apply_blur(image, face_locations, blur_strength)
            logging.info(f"Processed {input_path.name}: found {num_faces} face(s)")
        else:
            logging.info(f"Processed {input_path.name}: no faces detected")

        # Save result
        cv2.imwrite(str(output_path), image)

        return (True, num_faces)

    except Exception as e:
        logging.error(f"Failed to process {input_path}: {e}")
        return (False, 0)


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


def process_directory(
    input_dir: Path,
    output_dir: Path,
    blur_strength: int = DEFAULT_BLUR_STRENGTH
) -> dict:
    """
    Batch process all JPEG images in a directory.

    Args:
        input_dir: Directory containing input images.
        output_dir: Directory for output images.
        blur_strength: Gaussian kernel size.

    Returns:
        Statistics dictionary with processing results.
    """
    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)

    # Find all JPEG files (only supported format)
    supported_extensions = {".jpg", ".jpeg"}

    # Get all files in directory
    all_files = [f for f in input_dir.iterdir() if f.is_file()]

    # Separate supported and unsupported files
    image_files = [f for f in all_files if f.suffix.lower() in supported_extensions]
    unsupported_files = [
        f for f in all_files
        if f.suffix.lower() not in supported_extensions
        and not f.name.startswith(".")  # Ignore hidden files
    ]

    # Log errors for unsupported files
    for unsupported in unsupported_files:
        logging.error(
            f"Unsupported format: {unsupported.name} "
            f"(only .jpg/.jpeg supported)"
        )

    if not image_files:
        logging.warning(f"No JPEG images found in {input_dir}")
        return {"processed": 0, "failed": 0, "total_faces": 0, "no_faces": 0}

    logging.info(f"Found {len(image_files)} JPEG image(s) to process")

    # Process statistics
    stats = {
        "processed": 0,
        "failed": 0,
        "total_faces": 0,
        "no_faces": 0
    }

    # Process each image
    for input_path in sorted(image_files):
        output_filename = get_output_filename(input_path.name)
        output_path = output_dir / output_filename

        success, num_faces = process_single_image(input_path, output_path, blur_strength)

        if success:
            stats["processed"] += 1
            stats["total_faces"] += num_faces
            if num_faces == 0:
                stats["no_faces"] += 1
        else:
            stats["failed"] += 1

    return stats


def main():
    """Main entry point with CLI argument parsing."""
    parser = argparse.ArgumentParser(
        description="Batch blur faces in images for privacy/anonymization."
    )
    parser.add_argument(
        "--input", "-i",
        type=Path,
        default=DEFAULT_INPUT_DIR,
        help=f"Input directory containing images (default: {DEFAULT_INPUT_DIR})"
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help=f"Output directory for processed images (default: {DEFAULT_OUTPUT_DIR})"
    )
    parser.add_argument(
        "--blur-strength", "-b",
        type=int,
        default=DEFAULT_BLUR_STRENGTH,
        help=f"Blur strength (kernel size, must be odd, default: {DEFAULT_BLUR_STRENGTH})"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose debug logging"
    )

    args = parser.parse_args()

    # Setup logging
    setup_logging(args.verbose)

    # Validate input directory
    if not args.input.exists():
        logging.error(f"Input directory does not exist: {args.input}")
        sys.exit(1)

    if not args.input.is_dir():
        logging.error(f"Input path is not a directory: {args.input}")
        sys.exit(1)

    # Log configuration
    logging.info(f"Input directory: {args.input}")
    logging.info(f"Output directory: {args.output}")
    logging.info(f"Blur strength: {args.blur_strength}")
    if FACE_RECOGNITION_AVAILABLE:
        detection_method = "face_recognition + DNN + Haar cascade"
    else:
        detection_method = "DNN + Haar cascade"
    logging.info(f"Face detection: {detection_method}")

    # Process images
    stats = process_directory(args.input, args.output, args.blur_strength)

    # Print summary
    photos_with_faces = stats['processed'] - stats['no_faces']
    logging.info("=" * 50)
    logging.info("Processing complete!")
    logging.info(f"  Photos added to output folder: {stats['processed']}")
    logging.info(f"  Photos with faces blurred: {photos_with_faces}")
    logging.info(f"  Photos without faces: {stats['no_faces']}")
    logging.info(f"  Total faces blurred: {stats['total_faces']}")
    if stats['failed'] > 0:
        logging.info(f"  Failed to process: {stats['failed']}")

    if stats["failed"] > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
