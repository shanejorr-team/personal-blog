"""Configuration constants and defaults."""

import os
from pathlib import Path

# AWS Configuration
DEFAULT_AWS_REGION = "us-east-1"
AWS_REGION = os.environ.get("AWS_REGION", DEFAULT_AWS_REGION)
AWS_PROFILE = os.environ.get("AWS_PROFILE", "georgia-data-admin")

# Directory defaults (relative to current working directory)
DEFAULT_INPUT_DIR = Path("scratch/blur_faces/original_photos")
DEFAULT_OUTPUT_DIR = Path("scratch/blur_faces/blurred_photos")

# Blur settings
DEFAULT_BLUR_STRENGTH = 99  # Gaussian blur radius (higher = more blur)
FACE_PADDING_PERCENT = 0.25  # Expand face region by 25% for hair/ears

# Supported image formats
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB Rekognition limit
