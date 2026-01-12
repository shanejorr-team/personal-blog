# Face Blurring Script (AWS Rekognition)

Batch-processes images to blur detected faces for privacy and anonymization using AWS Rekognition.

## Features

- Uses AWS Rekognition for accurate face detection
- Handles zero, one, or multiple faces per image
- Applies strong Gaussian blur for complete anonymization
- Preserves original images (outputs to separate directory)
- Supports JPG, JPEG, and PNG formats
- Installable CLI tool (`blur-faces`)

## Prerequisites

### AWS Setup

1. **AWS Account** with Rekognition access

2. **IAM Permissions**: Your AWS user/role needs the `rekognition:DetectFaces` permission

   Example IAM policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": "rekognition:DetectFaces",
         "Resource": "*"
       }
     ]
   }
   ```

3. **Credentials** configured via one of:
   - Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
   - AWS credentials file (`~/.aws/credentials`)
   - IAM role (if running on EC2/Lambda)

### Python

- Python 3.9+
- uv or pip

## Installation

```bash
cd scratch/blur_faces
uv pip install -e .
```

Or with pip:
```bash
cd scratch/blur_faces
pip install -e .
```

## Usage

### Basic Usage

```bash
# Place images in original_photos/
cp /path/to/your/photos/*.jpg scratch/blur_faces/original_photos/

# Run the tool (from project root)
blur-faces

# Find results in blurred_photos/
ls scratch/blur_faces/blurred_photos/
```

### Command Line Options

```
blur-faces [OPTIONS]

Options:
  -i, --input PATH        Input directory (default: scratch/blur_faces/original_photos)
  -o, --output PATH       Output directory (default: scratch/blur_faces/blurred_photos)
  -b, --blur-strength N   Blur radius (default: 99, higher = more blur)
  -v, --verbose           Enable debug logging
  --dry-run               List files without processing
  -h, --help              Show help
```

### Custom Directories

```bash
# Process images from a different location
blur-faces -i /path/to/input -o /path/to/output
```

### Preview Mode

```bash
# See which files would be processed without actually processing
blur-faces --dry-run
```

### AWS Configuration

```bash
# Use a specific AWS profile
export AWS_PROFILE=my-profile
blur-faces

# Use a specific region (default: us-east-1)
export AWS_REGION=eu-west-1
blur-faces
```

## Output

- Output files are named: `{original_name}-blurred.{ext}`
  - Example: `vacation_photo.jpg` → `vacation_photo-blurred.jpg`
- Original images are never modified
- Images without detected faces are still copied to output (unmodified)

## Cost Considerations

AWS Rekognition pricing (as of 2024):
- First 1 million images/month: $1.00 per 1,000 images
- Over 1 million: $0.80 per 1,000 images

Example: 100 photos ≈ $0.10

## Troubleshooting

### "AWS credentials not found"
Configure credentials via `aws configure` or set environment variables:
```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

### "Access denied"
Ensure your IAM policy includes `rekognition:DetectFaces` permission.

### "Image too large"
Rekognition has a 5MB limit. Resize images before processing:
```bash
# Using ImageMagick
mogrify -resize '2000x2000>' *.jpg
```

### No faces detected
- Ensure faces are clearly visible and not too small
- Rekognition works best with frontal or slight angle faces
- Very low resolution images may not detect faces

## License

MIT
