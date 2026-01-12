"""AWS Rekognition face detection."""

import logging
from dataclasses import dataclass
from typing import List

import boto3
from botocore.exceptions import ClientError, NoCredentialsError, BotoCoreError

from .config import AWS_REGION, AWS_PROFILE

logger = logging.getLogger(__name__)


@dataclass
class BoundingBox:
    """Face bounding box in pixel coordinates."""

    left: int
    top: int
    width: int
    height: int

    @property
    def right(self) -> int:
        return self.left + self.width

    @property
    def bottom(self) -> int:
        return self.top + self.height


class RekognitionError(Exception):
    """Custom exception for Rekognition-related errors."""

    pass


class RekognitionDetector:
    """Face detector using AWS Rekognition."""

    def __init__(self) -> None:
        """Initialize Rekognition client with boto3 default credential chain."""
        session_kwargs: dict = {"region_name": AWS_REGION}
        if AWS_PROFILE:
            session_kwargs["profile_name"] = AWS_PROFILE
            logger.info(f"Using AWS profile: {AWS_PROFILE}")

        self.session = boto3.Session(**session_kwargs)
        self.client = self.session.client("rekognition")
        logger.info(f"Initialized Rekognition client in region: {AWS_REGION}")

    def detect_faces(
        self, image_bytes: bytes, image_width: int, image_height: int
    ) -> List[BoundingBox]:
        """
        Detect faces in an image using AWS Rekognition.

        Args:
            image_bytes: Raw image bytes (JPEG or PNG).
            image_width: Image width in pixels (for coordinate conversion).
            image_height: Image height in pixels (for coordinate conversion).

        Returns:
            List of BoundingBox objects with pixel coordinates.

        Raises:
            RekognitionError: If API call fails.
        """
        try:
            response = self.client.detect_faces(
                Image={"Bytes": image_bytes},
                Attributes=["DEFAULT"],  # Minimal attributes for speed
            )
        except NoCredentialsError:
            raise RekognitionError(
                "AWS credentials not found. Configure via environment variables, "
                "~/.aws/credentials, or AWS_PROFILE environment variable."
            )
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "Unknown")
            error_msg = e.response.get("Error", {}).get("Message", str(e))

            if error_code == "InvalidImageFormatException":
                raise RekognitionError(f"Invalid image format: {error_msg}")
            elif error_code == "ImageTooLargeException":
                raise RekognitionError(
                    "Image too large. Maximum size is 5MB for detect_faces API."
                )
            elif error_code == "ProvisionedThroughputExceededException":
                raise RekognitionError(
                    "AWS Rekognition rate limit exceeded. Try again later."
                )
            elif error_code == "ThrottlingException":
                raise RekognitionError(
                    "Request throttled by AWS. Reduce request rate."
                )
            elif error_code == "AccessDeniedException":
                raise RekognitionError(
                    "Access denied. Check IAM permissions for rekognition:DetectFaces."
                )
            else:
                raise RekognitionError(
                    f"Rekognition API error ({error_code}): {error_msg}"
                )
        except BotoCoreError as e:
            raise RekognitionError(f"AWS connection error: {e}")

        # Convert bounding boxes from ratios (0-1) to pixel coordinates
        faces = []
        for face_detail in response.get("FaceDetails", []):
            box = face_detail.get("BoundingBox", {})

            # Rekognition returns ratios: Left, Top, Width, Height (all 0.0-1.0)
            left_ratio = box.get("Left", 0)
            top_ratio = box.get("Top", 0)
            width_ratio = box.get("Width", 0)
            height_ratio = box.get("Height", 0)

            # Convert to pixel coordinates
            left = int(left_ratio * image_width)
            top = int(top_ratio * image_height)
            width = int(width_ratio * image_width)
            height = int(height_ratio * image_height)

            faces.append(BoundingBox(left=left, top=top, width=width, height=height))
            logger.debug(
                f"Face detected: left={left}, top={top}, width={width}, height={height}"
            )

        logger.debug(f"Rekognition detected {len(faces)} face(s)")
        return faces
