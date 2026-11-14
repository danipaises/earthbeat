#!/usr/bin/env bash
# Download and decode twelve real annual NASA SVS 5276 Black Marble frames.
set -euo pipefail
cd "$(dirname "$0")/.."
for tool in curl ffmpeg ffprobe; do command -v "$tool" >/dev/null || { echo "Missing: $tool" >&2; exit 1; }; done
mkdir -p assets/nightlights
work="$(mktemp -d)";trap 'rm -rf "$work"' EXIT
URL='https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_only_lights_2160p3_h265.mp4'
curl -fLSs --retry 5 --retry-delay 2 --connect-timeout 30 --max-time 200 "$URL" -o "$work/original.mp4"
count="$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of default=noprint_wrappers=1:nokey=1 "$work/original.mp4" | head -n 1)"
[[ "$count" == 12 ]] || { echo "Expected 12 NASA frames, got $count" >&2; exit 2; }
ffmpeg -hide_banner -loglevel error -i "$work/original.mp4" -vf 'scale=1440:-2:flags=lanczos' -fps_mode passthrough -c:v libwebp -compression_level 5 -quality 85 -start_number 1 -y "$work/frame_%02d.webp"
for n in {1..12}; do year=$((2011+n));f="$(printf '%s/frame_%02d.webp' "$work" "$n")";test -s "$f" || exit 3; cp "$f" "assets/nightlights/$year.webp";done
echo 'NASA Black Marble: 12 annual frames validated.'
