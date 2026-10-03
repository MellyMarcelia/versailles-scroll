#!/bin/bash
# Build the website media from the joined film + soundtrack.
#
# Usage: bash scripts/build-media.sh path/to/film.mp4 path/to/music.mp3
#
# Produces:
#   assets/video/journey.mp4   H.264 1080p, no audio, GOP 4 (smooth scroll-scrubbing), faststart
#   assets/video/journey.webm  VP9 fallback for browsers without H.264
#   assets/stills/scene-N-*.webp  first frame of each scene (poster + reduced-motion stills)
#   assets/audio/music.mp3     soundtrack, loudness-normalised with soft fade in/out
set -euo pipefail
film="$1"; music="${2:-}"
cd "$(dirname "$0")/.."
mkdir -p assets/video assets/stills assets/audio

echo "Source:"; ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate -show_entries format=duration -of compact=p=0 "$film"

# 1. Video for scrubbing: audio stripped (the clips' own sound restarted at every seam)
ffmpeg -v error -y -i "$film" -an -vf "scale=1920:1080:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 24 -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart assets/video/journey.mp4
ffmpeg -v error -y -i assets/video/journey.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 40 -g 4 -row-mt 1 -deadline good -cpu-used 4 assets/video/journey.webm
# Lighter 720p version for phones (downscaled from the sharper 1080p source, short GOP for cheap seeks)
ffmpeg -v error -y -i "$film" -an -vf "scale=1280:720:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 25 -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart assets/video/journey-720.mp4

# 2. Scene posters at the start of each scene (segment lengths match app.js: 5,4,4,4,4,4,4,4,5)
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 assets/video/journey.mp4)
scale=$(awk "BEGIN{print $dur/38}")
names=(scene-1-gate scene-2-hall scene-3-bedchamber scene-4-gardens scene-5-hamlet)
starts=(0 9 17 25 33)
for i in 0 1 2 3 4; do
  t=$(awk "BEGIN{print ${starts[$i]}*$scale + 0.05}")
  ffmpeg -v error -y -ss "$t" -i assets/video/journey.mp4 -frames:v 1 -c:v libwebp -quality 85 "assets/stills/${names[$i]}.webp"
done

# 3. Soundtrack: normalise loudness, gentle fades so the loop point is soft
if [ -n "$music" ]; then
  mdur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$music")
  fo=$(awk "BEGIN{f=$mdur-3; print (f>0?f:0)}")
  ffmpeg -v error -y -i "$music" -af "loudnorm=I=-20:TP=-2,afade=t=in:d=2,afade=t=out:st=$fo:d=3" \
    -c:a libmp3lame -b:a 160k assets/audio/music.mp3
fi

ls -la assets/video assets/stills assets/audio
