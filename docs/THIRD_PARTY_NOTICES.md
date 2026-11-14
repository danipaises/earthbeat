# Third-party notices and project credits

This file documents software, tools and media used by **EarthBeat Observatory**. Original EarthBeat source code and documentation are licensed under MIT; third-party materials retain their own licenses.

## NASA Scientific Visualization Studio imagery

NASA's [Scientific Visualization Studio (SVS)](https://svs.gsfc.nasa.gov/) supplies the source frames, figures and visualizations; scientific input is credited to the relevant NASA/NOAA missions and teams on each original SVS entry.

- Night Lights / Black Marble VIIRS: https://svs.gsfc.nasa.gov/5276/
- Global Sea Surface Currents and Temperature / ECCO2: https://svs.gsfc.nasa.gov/3912/
- GEOS Aerosols: https://svs.gsfc.nasa.gov/5669/
- DYAMOND Carbon Dioxide: https://svs.gsfc.nasa.gov/5196/
- GEDI Forest Height: https://svs.gsfc.nasa.gov/4950/
- ISS Lightning Imaging Sensor: https://svs.gsfc.nasa.gov/5011/

NASA provides scientific media under the rights notices applicable to the source pages. The team's MIT license does **not** relicense NASA data or imply endorsement.

## Fonts (loaded via Google Fonts CSS API)

- **DM Sans** — SIL Open Font License 1.1; DM Sans project authors, Google LLC / Indian Type Foundry credits as identified in the source: https://github.com/googlefonts/dm-fonts/blob/main/Sans/LICENSE.txt
- **Space Grotesk** — SIL Open Font License 1.1; Space Grotesk project authors (2020): https://github.com/floriankarsten/space-grotesk/blob/master/OFL.txt
- Google Fonts CSS delivery: https://developers.google.com/fonts/docs/getting_started

Fonts are retrieved by visitors' browsers through Google Fonts. This repository does not distribute font binary files. Font copyright and OFL licensing remain with the font authors; no font files are relicensed under MIT.

## Build and deployment tools

- **FFmpeg** — used during the GitHub Actions build for extracting NASA image frames; FFmpeg is licensed under LGPL/GPL depending on build configuration: https://ffmpeg.org/legal.html . FFmpeg binaries are not distributed within this static web app.
- **Node.js** — used for test automation (built-in `node:test`): https://nodejs.org/ ; see https://github.com/nodejs/node/blob/main/LICENSE .
- **GitHub Actions** — actions/checkout@v4, actions/configure-pages@v5, actions/upload-pages-artifact@v4 and actions/deploy-pages@v4; refer to individual action repositories and their licenses: https://github.com/actions , https://github.com/actions/deploy-pages .
- **GitHub Pages** — static web hosting: https://pages.github.com/
- **Web Audio API** — standard browser platform, documentation: https://www.w3.org/TR/webaudio/ .

## Generative AI disclosure

ChatGPT (OpenAI, GPT-6) assisted with coding, reviewing, correcting, writing and deployment. No generated scientific images or fictitious NASA dataset values are substituted for missing assets. The live audio is generated algorithmically from available NASA visualization pixels and is not AI-generated music. See [AI_DISCLOSURE.md](AI_DISCLOSURE.md).

## Scientific caveat

Descriptions such as 'index', 'lit-pixel percentage' and 'note count' refer to EarthBeat's processing of display imagery. They are not calibrated temperature, greenhouse gas concentration, forest canopy height or measured lightning rates. Movie camera motion, legends, text and compression may influence the computed visuals and music.
