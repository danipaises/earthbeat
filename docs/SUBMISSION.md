# EarthBeat Observatory — NASA Space Apps Challenge 2026 submission material

Use this file as copy-ready guidance for the team Project form. The team must review all facts and verify the public demo before submitting.

## Project Name

EarthBeat Observatory — Hear the Earth. Understand Its Changes.

## Summary (137 words; 1,018 characters)

EarthBeat Observatory is an interactive web-based jukebox that turns original NASA Earth Information Center visualizations into music generated in real time. Visitors explore six Earth phenomena—nighttime lights, ocean currents, aerosols, carbon dioxide, forest height, and lightning—through distinct sonic instruments. Our deployment pipeline downloads NASA Scientific Visualization Studio media and prepares 38 image frames, including 12 annual Black Marble views from 2012 to 2023. A deterministic algorithm analyzes each image’s brightness, color, and spatial patterns, then maps them to musical notes, rhythm, stereo placement, and volume using the browser’s Web Audio API. Users can explore a 3D globe where appropriate, compare years, mix two sources, and export audio. EarthBeat makes complex Earth science more engaging and supports multisensory exploration through keyboard controls and text descriptions. We clearly distinguish sonification of rendered imagery from direct measurement of physical variables.

## Project Demonstration (seven-slide presentation; includes title and introduction)

https://danipaises.github.io/earthbeat/demo/

Alternative: download the project's seven-slide PowerPoint presentation at:
https://danipaises.github.io/earthbeat/docs/EarthBeat-Observatory-Pitch-2026.pptx

## Project

https://danipaises.github.io/earthbeat/

Source code: https://github.com/danipaises/earthbeat

## Project Details

### The challenge and our idea

NASA's Earth Information Center and Scientific Visualization Studio make complex Earth observations understandable through remarkable imagery. However, many experiences emphasize looking at a screen. EarthBeat Observatory adds a complementary musical dimension: visitors can hear patterns in real NASA visualizations while viewing the original imagery and reading explanations.

### What we built

We created six interactive sound experiences: Night Lights (Black Marble), Living Oceans (ECCO2), Atmospheric Aerosols (GEOS), Carbon Pulse (DYAMOND CO₂), Forest Voices (GEDI), and Lightning Beats (ISS Lightning Imaging Sensor). The interface includes a mission-control dashboard, optional 3D globe for compatible flat imagery, a 2D viewer for other material, frame navigation, night-light year comparison, region controls, a two-source sound mixer, adjustable audio settings, and WAV export. The site includes Portuguese and English text.

### How it works

Our automated deployment downloads source media directly from NASA SVS and converts them with FFmpeg into 38 optimized images. Twelve show annual nighttime lights from 2012 to 2023; the remaining frames are sampled from NASA science videos or retained as single NASA stills. A deterministic JavaScript engine samples a fixed image grid and extracts on-screen brightness, color and spatial features. It converts them into an 84-step sequence across six pitch bands. Browser Web Audio synthesis turns those events into notes with different waveforms, loudness, and stereo position. Changing the frame or selected phenomenon changes the sound.

### What makes it different

EarthBeat is not a pre-recorded soundtrack playing over a space video. It is an interactive, explainable instrument: visitors can choose the phenomenon and hear a reproducible response to the visual data. The different sound identities and paired-source mixing invite curiosity, comparison, and classroom discussion.

### Impact, development, and scientific integrity

The project is designed for students, educators, science museums, and anyone who benefits from multisensory ways to explore scientific imagery. We used HTML, CSS, JavaScript, Canvas, Web Audio API, FFmpeg, GitHub Actions, and GitHub Pages. There is no paid API or user account requirement. Automated tests check the sonification logic and the deployment verifies that official NASA frames exist.

Importantly, the music represents *visual features of rendered NASA images*, **not the sounds of Earth or calibrated physical measurements**. Visual brightness is not a direct measurement of CO₂ concentration, ocean temperature, tree height, or lightning frequency. Different camera viewpoints may also change the musical output. Our methodology and original sources are documented in the public repository.

OpenAI ChatGPT was used to assist the code, design, tests, source-processing scripts, deployment and documentation. The images originate from NASA; the audio is produced algorithmically from image pixels rather than by an AI music model.

## Use of Super Intelligence (SI)

**Select the options showing SI was used.** ChatGPT assisted with code, interface design, written descriptions, documentation, testing and deployment. Do *not* select "I did not use SI."

AI-generated code and writing are disclosed in the project repository. NASA scientific imagery is not AI-generated and does not require an SI-generated-image watermark. The procedural audio is not produced by a generative AI audio model. If you make any additional SI-generated demo image or video, visibly watermark it as SI-generated; if you use generative AI to produce audio, disclose it in audio descriptions and metadata.

## NASA Data (one form row per source)

| Link Text | Link URL |
|---|---|
| NASA SVS — Black Marble Night Lights, 2012–2023 | https://svs.gsfc.nasa.gov/5276/ |
| NASA SVS — Global Sea Surface Currents and Temperature (ECCO2) | https://svs.gsfc.nasa.gov/3912/ |
| NASA SVS — GEOS Aerosols (2025) | https://svs.gsfc.nasa.gov/5669/ |
| NASA SVS — DYAMOND Global Carbon Dioxide | https://svs.gsfc.nasa.gov/5196/ |
| NASA SVS — GEDI Forest Height | https://svs.gsfc.nasa.gov/4950/ |
| NASA SVS — ISS Lightning Events, 2017–2023 | https://svs.gsfc.nasa.gov/5011/ |

Optional reference: NASA SVS Earth Information Center gallery: https://svs.gsfc.nasa.gov/gallery/earth-information-center/

## Space Agency Partner & Other Data

No non-NASA scientific datasets were used. Third-party technical platforms and resources include:

| Link Text | Link URL |
|---|---|
| FFmpeg — Open-Source Multimedia Framework | https://ffmpeg.org/ |
| GitHub — Source Repository & GitHub Pages Deployment | https://github.com/danipaises/earthbeat |
| W3C — Web Audio API Standard | https://www.w3.org/TR/webaudio/ |

## Final checklist

- [ ] Open both the public project and the seven-slide demo in a private/incognito browser.
- [ ] Test audio and source media on a phone and a desktop.
- [ ] Verify that the demo displays exactly 7 slides, including its title slide.
- [ ] Confirm the selected SI categories match what was actually used.
- [ ] List sources in the correct NASA and other-data fields.
- [ ] Review all human-team contributions and scientific statements.
- [ ] Save Progress regularly. **Saving is not submission.**
- [ ] Click **Submit for Judging** once the team is ready.
- [ ] Confirm the submission-success notice before Nov 15, 2026, 11:59 PM **local event time**. The submission is final.

