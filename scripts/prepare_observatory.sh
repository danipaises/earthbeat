#!/usr/bin/env bash
# Build six sonification experiences using only original NASA SVS media.
# 12 annual Night Lights frames are produced separately by prepare_nasa.sh.
set -euo pipefail
cd "$(dirname "$0")/.."
for tool in curl ffmpeg ffprobe awk; do command -v "$tool" >/dev/null || { echo "Missing: $tool" >&2; exit 1; }; done
TMP="$(mktemp -d)";trap 'rm -rf "$TMP"' EXIT
mkdir -p assets/observatory/{ocean,aerosols,carbon,forest,lightning}
BASE=https://svs.gsfc.nasa.gov/vis/a000000
fetch(){
  local name="$1" url="$2"
  echo "Downloading ORIGINAL NASA SVS $name..."
  curl -fLSs --retry 5 --retry-delay 2 --connect-timeout 30 --max-time 280 "$url" -o "$TMP/$name"
  test -s "$TMP/$name" || { echo "Original NASA $name absent" >&2; exit 2; }
}
# All urls correspond to specific listed media on these official resource pages:
# Ocean: https://svs.gsfc.nasa.gov/3912/
# GEOS aerosols: https://svs.gsfc.nasa.gov/5669/
# DYAMOND CO2: https://svs.gsfc.nasa.gov/5196/
# GEDI forest: https://svs.gsfc.nasa.gov/4950/
# ISS lightning: https://svs.gsfc.nasa.gov/5011/
fetch ocean.webm "$BASE/a003900/a003912/ecco2_sst_flow.webmhd.webm"
fetch aerosols.png "$BASE/a005600/a005669/Aerosols_2025-08-19T20_00_00_1920x1080.png"
fetch carbon.mp4 "$BASE/a005100/a005196/dyamondPointCloud_12-1-2023b_dyamond_co2_anim_globe_orbit_1080p30_h265.mp4"
fetch forest.webm "$BASE/a004900/a004950/GEDI_global_w_colorbar_1080p60.webm"
fetch lightning.jpg "$BASE/a005000/a005011/iss_lightning_preview.jpg"

# Extract eight real chronological sample frames at fixed fractions of movie duration.
# Some NASA movies change CAMERA viewpoint; do not interpret sampled frames as calibrated temporal trends.
extract(){
  local id="$1" file="$2" duration at out
  duration="$(ffprobe -v error -show_entries format=duration -of default=nokey=1:noprint_wrappers=1 "$TMP/$file" | head -n 1)"
  if [[ -z "$duration" || "$duration" == N/A ]]; then echo "Invalid NASA source duration: $file" >&2; exit 4; fi
  for n in {1..8}; do
    at="$(awk -v d="$duration" -v n="$n" 'BEGIN{printf "%.3f", d*(0.07+(n-1)*0.118)}')"
    out="$(printf 'assets/observatory/%s/%02d.webp' "$id" "$n")"
    ffmpeg -hide_banner -loglevel error -ss "$at" -i "$TMP/$file" -frames:v 1 -vf 'scale=1280:-2:flags=lanczos' -c:v libwebp -compression_level 4 -quality 78 -y "$out"
    test -s "$out" || { echo "Failed to decode genuine NASA frame $id/$n" >&2; exit 5; }
  done
  echo "Prepared eight NASA frames: $id"
}
extract ocean ocean.webm
extract carbon carbon.mp4
extract forest forest.webm
# GEOS and ISS sources are single images, deliberately NOT represented as temporal animation.
ffmpeg -hide_banner -loglevel error -i "$TMP/aerosols.png" -frames:v 1 -vf 'scale=1440:-2:flags=lanczos' -c:v libwebp -compression_level 5 -quality 83 -y assets/observatory/aerosols/01.webp
ffmpeg -hide_banner -loglevel error -i "$TMP/lightning.jpg" -frames:v 1 -vf 'scale=1280:-2:flags=lanczos' -c:v libwebp -compression_level 5 -quality 83 -y assets/observatory/lightning/01.webp
for id in ocean carbon forest; do
  for n in {1..8}; do test -s "$(printf 'assets/observatory/%s/%02d.webp' "$id" "$n")" || exit 6; done
done
for id in aerosols lightning; do test -s "assets/observatory/$id/01.webp" || exit 6; done
printf 'NASA observatory finished: %s individual real NASA frames.\n' "$(find assets/observatory -name '*.webp' | wc -l)"
