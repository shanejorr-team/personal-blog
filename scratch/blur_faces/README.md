# Face Blurring Script

Batch-processes images to blur all detected faces for privacy and anonymization purposes. Uses the `face_recognition` library (HOG-based detection) as the primary method, with OpenCV Haar cascades as a fallback.

## Features

- Detects zero, one, or multiple faces per image
- Applies strong Gaussian blur to make faces unidentifiable
- Preserves original images (outputs to separate directory)
- Supports `.jpg` and `.jpeg` files only (other formats return errors)
- Configurable blur strength
- Detailed logging of processing results

## Setup

### Prerequisites

The `face_recognition` library requires `dlib`, which needs CMake installed:

```bash
# macOS
brew install cmake

# Linux (Debian/Ubuntu)
sudo apt-get install cmake

# Linux (RedHat/CentOS)
sudo yum install cmake
```

### Installation

1. Create and activate a virtual environment (recommended):

```bash
cd scratch/blur_faces
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

Note: Installing `face_recognition` may take several minutes as it compiles `dlib`.

## Usage

### Basic Usage

1. Place your images in the `original_photos/` directory
2. Run the script:

```bash
python blur_faces.py
```

3. Find blurred images in `blurred_photos/` with `-blurred` suffix

### Command Line Options

```bash
python blur_faces.py [OPTIONS]

Options:
  -i, --input PATH        Input directory (default: ./original_photos/)
  -o, --output PATH       Output directory (default: ./blurred_photos/)
  -b, --blur-strength N   Blur kernel size, must be odd (default: 99)
  -v, --verbose           Enable debug logging
  -h, --help              Show help message
```

### Examples

```bash
# Process with default settings
python blur_faces.py

# Custom input/output directories
python blur_faces.py --input ~/photos/vacation --output ~/photos/anonymized

# Stronger blur (higher = more blur)
python blur_faces.py --blur-strength 151

# Verbose output for debugging
python blur_faces.py --verbose
```

## Output

- Output filenames: `{original_name}-blurred.jpg`
- Example: `vacation_photo.jpg` becomes `vacation_photo-blurred.jpg`
- Original images are never modified

## How It Works

1. **Face Detection**: Uses `face_recognition` library (HOG model) for accurate face detection. Falls back to OpenCV Haar cascades if `face_recognition` is unavailable or fails.

2. **Region Expansion**: Detected face regions are expanded by 20% to cover hair and ears.

3. **Blur Application**: Strong Gaussian blur (99x99 kernel by default) is applied to each face region.

## Troubleshooting

### "face_recognition library not available"

This is a warning, not an error. The script will use OpenCV's Haar cascades, which are less accurate but still functional. To enable `face_recognition`:

1. Ensure CMake is installed
2. Run `pip install face_recognition` (may take 5-10 minutes)

### No faces detected

- Ensure images are clear and faces are visible
- Try different images to verify the script works
- Haar cascades work best with front-facing faces

### Installation fails on M1/M2 Mac

If `dlib` fails to compile, try:

```bash
pip install cmake
pip install dlib --no-cache-dir
pip install face_recognition
```
