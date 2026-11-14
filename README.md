# EarthBeat — Hear the Earth. Understand its changes.

**NASA Space Apps Challenge 2026** · The Earth Information Jukebox

[Open the site on GitHub Pages](https://danipaises.github.io/earthbeat/) · [NASA source: SVS 5276](https://svs.gsfc.nasa.gov/5276/) · [NASA EIC version: SVS 5313](https://svs.gsfc.nasa.gov/5313/)

EarthBeat is an independent interactive sonification experience. It maps **real pixels** of annual NASA Black Marble nighttime-lights visualizations from **2012–2023** to notes synthesized in your browser. It does **not** claim that Earth generates those sounds or that pixel intensity is calibrated physical radiance.

## What works

- Timeline selecting years 2012–2023
- Audio controls: Play, Pause, Stop, volume, tempo, WAV export
- Dynamic note synthesis driven by image brightness and spatial distribution
- Scanline animation and waveform
- Compare two years and show their relative visual metrics
- Choose full, left, right or center of the map
- Portuguese and English interface
- Keyboard-friendly controls and mobile layout
- Explicit NASA source credits and scientific limitations

## Deploy on GitHub Pages

This repository uses a GitHub Actions workflow: [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

1. In this repository, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source = GitHub Actions**.
3. Open **Actions → Deploy EarthBeat (NASA data) to GitHub Pages** and select **Run workflow**, or push an update to `main`.
4. Wait for the workflow to finish successfully and open **https://danipaises.github.io/earthbeat/**.

The workflow downloads the official **12-frame H.265 MP4** from [NASA Scientific Visualization Studio, item 5276](https://svs.gsfc.nasa.gov/5276/), checks there are 12 frames, and uses FFmpeg to convert each year into `assets/nightlights/YYYY.webp` **inside the deployment artifact**. The images may not appear as files in the GitHub repository because they are generated only for the published site.

If downloading NASA assets fails, the workflow **fails rather than silently publishing synthetic measurements**. The page also offers manual import of the original NASA video or annual images.

**Important:** Merely adding a workflow does not prove the Pages site is live. Check the workflow's green success status and open the public URL before submitting.

## Run locally on Ubuntu

```bash
git clone https://github.com/danipaises/earthbeat.git
cd earthbeat
sudo apt update && sudo apt install -y curl ffmpeg python3
bash scripts/prepare_nasa.sh
python3 -m http.server 8765
```

Visit http://localhost:8765 . To run the website without downloading files, it may try a third-party image proxy or you can import the official NASA MP4 manually; that proxy is not guaranteed to work. The GitHub Pages workflow avoids that dependency by packaging all twelve local WebP images.

## Tests

```bash
node --test tests/core.test.js
```

The seven tests check basic sonification invariants against **synthetic test fixtures** and do not pretend to validate NASA's scientific measurements.

## Data provenance and limitations

- [NASA SVS — Change in Night Lights between 2012 and 2023](https://svs.gsfc.nasa.gov/5276/)
- [NASA SVS — Earth Information Center variant](https://svs.gsfc.nasa.gov/5313/)
- [Space Apps challenge description](https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/)

Scientific methodology: [docs/SCIENCE.md](docs/SCIENCE.md). Data and credits: [docs/SOURCES.md](docs/SOURCES.md). AI disclosure: [docs/AI_DISCLOSURE.md](docs/AI_DISCLOSURE.md).

The visual indices are **not calibrated NASA radiance values**. They are features extracted from rendered NASA imagery, using a fixed conversion for all years. Please do not infer a causal environmental or economic change from sound differences alone.

Built independently for NASA Space Apps Challenge 2026; **not a NASA-endorsed application**.
