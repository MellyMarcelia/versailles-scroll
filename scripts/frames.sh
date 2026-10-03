#!/bin/bash
# Extract the seam frames used as connector keyframes.
# Usage: bash scripts/frames.sh raw/dive_1_gate.mp4 raw/dive_2_hall.mp4
# Writes <name>_first.png and <name>_last.png next to each clip.
set -euo pipefail
for clip in "$@"; do
  base="${clip%.mp4}"
  ffprobe -v error -select_streams v:0 \
    -show_entries stream=width,height,r_frame_rate,nb_frames -show_entries format=duration \
    -of compact=p=0 "$clip"
  ffmpeg -v error -y -i "$clip" -frames:v 1 "${base}_first.png"
  # exact last decoded frame (more reliable than -sseof)
  ffmpeg -v error -y -i "$clip" -vf "reverse" -frames:v 1 "${base}_last.png"
  echo "-> ${base}_first.png  ${base}_last.png"
done
