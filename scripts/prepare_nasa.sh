#!/usr/bin/env bash
# Download NASA SVS 5276's twelve 2012–2023 frames from the official H.265 video.
# This is run during the GitHub Pages build; no synthetic data is substituted.
set -euo pipefail
cd "$(dirname "$0")/.."

for tool in curl ffmpeg ffprobe; do
  command -v "$tool" >/dev/null 2>&1 || { echo "Missing dependency: $tool" >&2; exit 1; }
done

SOURCE='https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_only_lights_2160p3_h265.mp4'
mkdir -p assets/nightlights
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

echo "Downloading official NASA Black Marble video, SVS 5276..."
curl --fail --location --retry 4 --connect-timeout 25 --max-time 180 --silent --show-error "$SOURCE" --output "$work/frames.mp4"
test -s "$work/frames.mp4" || { echo 'NASA video is missing or empty' >&2; exit 2; }

count="$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of default=noprint_wrappers=1:nokey=1 "$work/frames.mp4" | head -n 1)"
if [[ "$count" != "12" ]]; then
  echo "Unexpected NASA video frame count: $count (expected 12). Refusing to invent data." >&2
  exit 3
fi

echo 'Decoding the 12 genuine 2012–2023 annual frames...'
ffmpeg -hide_banner -loglevel error -i "$work/frames.mp4" \
  -vf 'scale=1440:-2:flags=lanczos' -fps_mode passthrough \
  -c:v libwebp -compression_level 5 -quality 86 \
  -start_number 1 "$work/frame_%02d.webp" -y

for n in {1..12}; do
  year=$((2011 + n))
  file="$(printf '%s/frame_%02d.webp' "$work" "$n")"
  [[ -s "$file" ]] || { echo "Missing decoded frame $n" >&2; exit 4; }
  cp "$file" "assets/nightlights/$year.webp"
done

echo 'SUCCESS: all 12 real NASA images generated for GitHub Pages.'
