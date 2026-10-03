#!/bin/bash
# Check every seam in a chain and build a preview video of it.
# Usage: bash scripts/seamcheck.sh raw/dive_1_gate.mp4 raw/conn_1_gate_to_hall.mp4 raw/dive_2_hall.mp4
# Prints PSNR between the last frame of clip i and the first frame of clip i+1
# (>= ~25 dB with the same composition = good seam; compare by eye too),
# saves side-by-side seam images, and writes raw/preview.mp4 (the clips joined).
set -euo pipefail
clips=("$@")
mkdir -p raw/seams
for ((i=0; i<${#clips[@]}-1; i++)); do
  a="${clips[$i]}"; b="${clips[$((i+1))]}"
  ffmpeg -v error -y -i "$a" -vf reverse -frames:v 1 raw/seams/a.png
  ffmpeg -v error -y -i "$b" -frames:v 1 raw/seams/b.png
  # scale b to a's size in case resolutions differ
  psnr=$(ffmpeg -i raw/seams/a.png -i raw/seams/b.png \
    -filter_complex "[1][0]scale2ref[b][a];[a][b]psnr" -f null - 2>&1 | grep -o 'average:[0-9.inf]*' || true)
  name="seam_$((i+1))"
  ffmpeg -v error -y -i raw/seams/a.png -i raw/seams/b.png \
    -filter_complex "[1][0]scale2ref[b][a];[a][b]hstack" raw/seams/$name.png
  echo "$name: $(basename "$a") -> $(basename "$b")  PSNR $psnr  (raw/seams/$name.png)"
done
# Join the clips, dropping the duplicated first frame of each following clip.
list=raw/seams/list.txt; : > $list
for ((i=0; i<${#clips[@]}; i++)); do
  out="raw/seams/part_$i.mp4"
  if [ $i -eq 0 ]; then vf="scale=1280:720,fps=24"; else vf="scale=1280:720,fps=24,trim=start_frame=1,setpts=PTS-STARTPTS"; fi
  ffmpeg -v error -y -i "${clips[$i]}" -an -vf "$vf" -c:v libx264 -crf 18 -pix_fmt yuv420p "$out"
  echo "file 'part_$i.mp4'" >> $list
done
ffmpeg -v error -y -f concat -safe 0 -i $list -c copy raw/preview.mp4
echo "preview -> raw/preview.mp4"
