#!/bin/bash
# Encode final clips for scroll scrubbing + make WebP posters.
# Usage: bash scripts/encode.sh raw/*.mp4   -> assets/video/<name>.mp4, assets/stills/<name>.webp
set -euo pipefail
mkdir -p assets/video assets/stills
for src in "$@"; do
  name=$(basename "${src%.mp4}")
  ffmpeg -v error -y -i "$src" -an -vf "unsharp=5:5:0.6:5:5:0.0" \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
    -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "assets/video/$name.mp4"
  ffmpeg -v error -y -i "$src" -frames:v 1 -c:v libwebp -quality 85 "assets/stills/$name.webp"
  printf '%-32s %s\n' "$name" "$(du -h "assets/video/$name.mp4" | cut -f1)"
done
