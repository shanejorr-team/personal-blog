"""Command-line interface for face blurring."""

import argparse
import logging
import sys
from pathlib import Path

from .config import DEFAULT_INPUT_DIR, DEFAULT_OUTPUT_DIR, DEFAULT_BLUR_STRENGTH
from .detector import RekognitionDetector, RekognitionError
from .blur import process_directory


def setup_logging(verbose: bool = False) -> None:
    """Configure logging with appropriate format and level."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        force=True,
    )


def main() -> int:
    """Main entry point for CLI."""
    parser = argparse.ArgumentParser(
        description="Blur faces in images using AWS Rekognition for privacy/anonymization."
    )
    parser.add_argument(
        "--input",
        "-i",
        type=Path,
        default=DEFAULT_INPUT_DIR,
        help=f"Input directory containing images (default: {DEFAULT_INPUT_DIR})",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help=f"Output directory for processed images (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--blur-strength",
        "-b",
        type=int,
        default=DEFAULT_BLUR_STRENGTH,
        help=f"Blur strength/radius (higher = more blur, default: {DEFAULT_BLUR_STRENGTH})",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose debug logging",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List files that would be processed without actually processing",
    )

    args = parser.parse_args()
    setup_logging(args.verbose)
    logger = logging.getLogger(__name__)

    # Validate input directory
    if not args.input.exists():
        logger.error(f"Input directory does not exist: {args.input}")
        return 1

    if not args.input.is_dir():
        logger.error(f"Input path is not a directory: {args.input}")
        return 1

    # Initialize detector and process
    try:
        detector = RekognitionDetector()
        stats = process_directory(
            input_dir=args.input,
            output_dir=args.output,
            detector=detector,
            blur_strength=args.blur_strength,
            dry_run=args.dry_run,
        )
    except RekognitionError as e:
        logger.error(f"AWS Rekognition initialization failed: {e}")
        return 1
    except Exception as e:
        logger.error(f"Processing failed: {e}")
        return 1

    # Print summary
    photos_with_faces = stats["processed"] - stats["no_faces"]
    logger.info("=" * 50)
    logger.info("Processing complete!")
    logger.info(f"  Photos processed: {stats['processed']}")
    logger.info(f"  Photos with faces blurred: {photos_with_faces}")
    logger.info(f"  Photos without faces: {stats['no_faces']}")
    logger.info(f"  Total faces blurred: {stats['total_faces']}")
    if stats["failed"] > 0:
        logger.warning(f"  Failed to process: {stats['failed']}")

    return 1 if stats["failed"] > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
