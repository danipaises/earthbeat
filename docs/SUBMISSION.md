# EarthBeat — NASA Space Apps 2026 submission draft

## Project title
**EarthBeat — Hear the Earth. Understand its Changes.**

## One-line pitch
An accessible digital instrument that transforms NASA's Earth Information Center nighttime-lights visualizations into live, explainable sound.

## Challenge
**The Earth Information Jukebox** — NASA Space Apps Challenge 2026

## Project summary (English)
EarthBeat turns NASA Scientific Visualization Studio nighttime-lights imagery into an interactive sonic experience. Using the Black Marble VIIRS annual visualization series for 2012–2023, EarthBeat analyzes the brightness and spatial distribution of rendered image pixels and converts the resulting visual characteristics into synthesized musical notes. A consistent sonification rule allows visitors to compare years and visual regions, listen to live audio, and inspect the image-derived features that control each sound. Designed for public engagement, EarthBeat includes Portuguese and English interfaces, keyboard navigation, descriptive metrics and transparent scientific explanations. The musical mapping is an interpretation of processed images rather than a calibrated measurement of radiance. EarthBeat aims to make scientific imagery engaging and more accessible across multiple senses.

## Problem
Complex Earth observation visuals can be difficult to explore without specialized background and are not always accessible to audiences who find visual information challenging. We need a bridge between imagery, intuition and public engagement.

## Solution
A browser-only sonification studio that listens to visual patterns in official NASA yearly imagery. The user selects a year, chooses a visual region, starts a left-to-right scanner, hears synthesized notes, and can compare years using the same algorithm.

## Why NASA data are essential
The app calculates every sonified signal from genuine yearly image pixels from NASA SVS 5276 — not from an invented soundtrack. If no NASA frame loads, the app shows an honest error rather than substituting fake data.

## Technical implementation
Vanilla JavaScript, browser Canvas 2D, Web Audio API, optional FFmpeg preprocessing, HTML/CSS, zero commercial dependencies. The algorithm samples 320×180 pixels, calculates displayed-image luminance, divides the image into slices and seven sound bands, and maps the brightness/density/position to deterministic pentatonic notes, amplitude and stereo pan.

## Validation and limitations
Unit tests cover all-dark images, nonzero signal from lit images, image-dependent features, deterministic sonification and image-region comparison. Real NASA image import, browser/device sound tests, and accessibility review remain necessary before the team can assert end-to-end validation. Display metrics are indices of NASA *rendered imagery*, not physically calibrated NASA measurements.

## Impact
Enables museum visitors, students and amateur researchers to engage with environmental imagery through sight and sound. Shows how data-driven audio can supplement traditional scientific visualization.

## Resources and credits
- https://svs.gsfc.nasa.gov/5276/
- https://svs.gsfc.nasa.gov/5313/
- https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/

NASA's Scientific Visualization Studio — visualization Kel Elkins; Black Marble / VIIRS; source credits in `docs/SOURCES.md`.

## AI use
OpenAI ChatGPT GPT-6 was used for source code, design, research and draft documentation. See `docs/AI_DISCLOSURE.md` for details. Team members must review, correct and update this disclosure before submission.

## 30-second demo storyboard
**0–6s:** Show EarthBeat opening and a real NASA year loaded. Voice: "Can you hear the planet's patterns?"

**6–16s:** Press Play; scanner moves; tones are generated from data. Voice: "EarthBeat transforms real NASA nighttime lights images into music in your browser."

**16–25s:** Switch between 2012 and 2023 in comparison mode. Voice: "Explore a decade of Earth imagery and hear visual differences."

**25–30s:** Show methodology and logo. Voice: "EarthBeat. Hear the Earth. Understand its changes."

**Important:** Record this video from the *real running project with NASA files*. Do not fake a successful image load, numerical result or working application.

## Submission checklist
- [ ] Verify that all 12 NASA years load locally or on public deployment.
- [ ] Confirm source and data credit links in the live app.
- [ ] Test Play/Pause/Stop/WAV export in Chrome and Android.
- [ ] Test both language modes and basic keyboard navigation.
- [ ] Publish public website and repository (team approval).
- [ ] Record a real demo and ensure it fits current event rules.
- [ ] Update disclosure and list all team contributions.
- [ ] Open team Project page and submit before official deadline.
