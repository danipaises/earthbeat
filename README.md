# EarthBeat Observatory — NASA Space Apps Challenge 2026

**Hear the Earth. Understand its changes.**

Live site: https://danipaises.github.io/earthbeat/  
Challenge: [The Earth Information Jukebox](https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/)

EarthBeat Observatory turns frames from **six NASA Scientific Visualization Studio visualizations** into music generated in real time in your browser. It is a free static site with no accounts, paid APIs, container or backend. It uses actual visual data from NASA and explicitly distinguishes a visual sonification index from calibrated physical measurements.

## Six experiences

- Night Lights: 12 annual NASA Black Marble frames, 2012–2023; visual A/B comparison.
- Living Oceans: eight source-video frames from ECCO2 ocean currents and temperature visualization.
- Atmospheric Aerosols: GEOS colored model snapshot, August 2025.
- Carbon Pulse: eight visual sample frames from the DYAMOND modeled CO₂ visualization of January–March 2020.
- Forest Voices: eight visual sample frames from the GEDI forest-height visualization.
- Lightning Beats: one illustrative NASA frame of LIS detections on the ISS, 2017–2023.

**Important:** video sample frames may contain **camera motion**; they must not be used to claim quantitative trends. No physical concentrations, radiation values or precise strike counts are computed from screen colors. See [Scientific Method](docs/SCIENCE.md).

## New mission experience for public demonstrations

- **Six-chapter NASA guided tour**: a one-click scientific journey across all six EIC visualization sources. Each chapter explains what is being heard and what conclusions must **not** be inferred from the visualization.
- **Live sound-band telemetry**: six data-derived intensity bars display which of the image's vertical bands are creating notes in the current scanner step. No additional audio is invented.
- **Twelve-year NASA Night Lights analysis**: an interactive graph and accessible table calculated **on demand from all twelve original NASA frames**, 2012–2023, with a zero-baseline y-axis. The displayed numbers are brightness indices of rendered image pixels, not physically calibrated luminosity, electricity use or city development.
- **CSV export** of those descriptive NASA rendered-image metrics. Values are calculated using the same consistent image processing for every year.
- **Bilingual story mode** with keyboard-accessible mission controls. Actual device/screen-reader testing is still recommended.

## Features

Immersive mission control, selective 3D globe (only flat/equirectangular imagery), 2D image viewer, six data-to-audio instruments, mix two independent data sources, 84-step sonification, audio style / speed / volume / region, NASA original frame navigation, responsive layout, 2012-vs-2023 side-by-side comparison, offline WAV export, source registry, transparent science explanations, keyboard controls and a classic version at [classic.html](classic.html).

## GitHub Pages deployment

This repository has a [GitHub Actions workflow](.github/workflows/pages.yml) that downloads original NASA video/image resources, extracts 12 + 8 + 8 + 8 + 1 + 1 = **38 WebP frames**, executes tests and deploys the static website. 

1. Repo **Settings → Pages → Source = GitHub Actions**.
2. Push to `main` or manually run **EarthBeat Observatory — NASA data and GitHub Pages** from the Actions tab.
3. Check the workflow is green. Then open https://danipaises.github.io/earthbeat/ .

All 38 images must exist. The pipeline fails if required NASA originals are not accessible. The site reports absent images rather than inventing substitutes.

## Local usage (Ubuntu)

```bash
git clone https://github.com/danipaises/earthbeat.git
cd earthbeat
sudo apt-get update && sudo apt-get install -y ffmpeg curl python3
bash scripts/prepare_nasa.sh
bash scripts/prepare_observatory.sh
python3 -m http.server 8765
```

Visit `http://localhost:8765`. This is not a React app; no npm install is needed.

## Tests

```bash
node --test tests/core.test.js tests/sonification.test.js tests/playback.test.js
node --check src/observatory.js
node --check src/playback.js
```

Synthetic RGBA fixtures are used exclusively in tests, never published as NASA science.

## Credits and disclosures

- [Scientific methodology and limits](docs/SCIENCE.md)
- [OSI-approved MIT project license](LICENSE)
- [Third-party licenses and attributions](docs/THIRD_PARTY_NOTICES.md)
- [Original NASA source registry](docs/SOURCES.md)
- [AI use disclosure](docs/AI_DISCLOSURE.md)
- [Submission checklist](docs/SUBMISSION.md)

Visualizations and original science: **NASA Scientific Visualization Studio** and the specific credited scientific teams listed on each SVS resource page. EarthBeat is an independent NASA Space Apps 2026 team project, **not an official NASA product or endorsement**.
