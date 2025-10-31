#!/bin/bash

# Script to convert images to 1920x1080 (16:9 aspect ratio) with cropping
# This version crops the image to completely fill 1920x1080
# Usage: ./convert_to_1080p_16_9_crop.sh input_image.jpg [output_image.jpg]

# Check if input file is provided
if [ -z "$1" ]; then
    echo "Error: No input file specified"
    echo "Usage: $0 input_image.jpg [output_image.jpg]"
    exit 1
fi

# Check if input file exists
if [ ! -f "$1" ]; then
    echo "Error: Input file '$1' not found"
    exit 1
fi

INPUT="$1"

# Set output filename (use second argument or create default)
if [ -z "$2" ]; then
    # Extract filename without extension and add suffix
    FILENAME=$(basename "$INPUT")
    EXTENSION="${FILENAME##*.}"
    BASENAME="${FILENAME%.*}"
    OUTPUT="${BASENAME}_1080p_cropped.${EXTENSION}"
else
    OUTPUT="$2"
fi

# Convert image to 1920x1080 with cropping
# This will:
# 1. Resize image so shortest dimension fits 1920x1080
# 2. Crop the excess to create exact 1920x1080 dimensions
# 3. Center the crop
magick "$INPUT" \
    -resize '1920x1080^' \
    -gravity center \
    -crop 1920x1080+0+0 \
    +repage \
    "$OUTPUT"

# Check if conversion was successful
if [ $? -eq 0 ]; then
    echo "Successfully converted '$INPUT' to '$OUTPUT' (1920x1080, cropped)"
else
    echo "Error: Conversion failed"
    exit 1
fi
