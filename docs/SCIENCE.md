# EarthBeat Observatory — methodology and limitations

## Research goal

EarthBeat converts **NASA scientific visualization frames** into deterministic sonic events. It does not reconstruct raw scientific variables from imagery; neither does it claim that the resulting notes are sound emitted by Earth. The goal is accessible, educational exploration of visual patterns in NASA Earth Information Center resources.

## Original input sources

| Module | NASA SVS source | Period | Science and interpretation |
|---|---|---|---|
| Night lights | [5276](https://svs.gsfc.nasa.gov/5276/) | Annual 2012–2023 | Black Marble VIIRS visualization, twelve annual frames; not calibrated radiance from PNG colors |
| Living oceans | [3912](https://svs.gsfc.nasa.gov/3912/) | Simulation March 2007–March 2008 | ECCO2 sea-surface currents colored by sea-surface temperature; video sample frames, not numerical temperature |
| Atmospheric aerosols | [5669](https://svs.gsfc.nasa.gov/5669/) | 19 August 2025 20:00 UTC | GEOS model visualization; blue sea salt, magenta dust, orange/red smoke, green sulfates; color/chroma index, not aerosol concentration |
| Carbon pulse | [5196](https://svs.gsfc.nasa.gov/5196/) | Jan–Mar 2020 | DYAMOND GEOS CO₂ visualization, with moving camera and changing data. Differences between video frames cannot be interpreted as a direct atmospheric concentration trend. |
| Forest voices | [4950](https://svs.gsfc.nasa.gov/4950/) | April 2019–April 2020 | GEDI canopy-height visualization, camera moves; visual colors represent height qualitatively, not a measurement in meters. |
| Lightning beats | [5011](https://svs.gsfc.nasa.gov/5011/) | Observations Jan 2017–July 2023 | Single NASA image of ISS LIS detections. Percussion derives from yellow-highlighted pixels, NOT actual number/timing of lightning events. |

The build scripts download the source media directly from NASA's SVS domain, convert into compact WebP frames using FFmpeg, and stop the deployment if original data is not available. They never replace missing imagery with synthetic output.

## Audio mapping

1. Render the NASA frame to a fixed 252×142 RGBA buffer in the browser. Preserve original pixel colors and aspect ratio.
2. Compute approximate image luminance `L = (0.2126R + 0.7152G + 0.0722B)/255`, where channels are byte values (screen encoded RGB). This is a descriptive on-screen brightness proxy, not radiometric luminance.
3. Different visual sources use different transparent, documented feature extractors:
   - Night lights/CO₂/forest: image luminance proxy.
   - Oceans: luminosity with a small saturation correction.
   - Aerosols: luminosity weighted by image saturation, to emphasize rendered colored aerosol patterns.
   - Lightning: bright yellow/gold rendered highlights. Gray map background is excluded; any gold text/markers in NASA's still may influence the result.
4. Divide image into 84 horizontal steps and 6 vertical bands. Each rectangle's thresholded brightness and density determine whether a note occurs, its loudness and stereo pan. The vertical band determines pitch in a documented scale. Different modules have different waveforms for timbral contrast.
5. Browser-generated Web Audio oscillators perform the notes without a paid service or generative music model. Inputs and parameters are deterministic, and empty/dark regions cannot produce fictitious data-derived notes.

The `mean` and `active pixels` cards are **indices of processed images**, not scientific measurements. Brightness can depend on video encoding, color transfer, camera position, artistic contrast and map annotations. They are not compared numerically across different NASA datasets. In A/B night-lights view, images use an identical processing algorithm, but imagery alone cannot prove an environmental cause.

## Accessibility

Natively labeled controls, keyboard playback (Space), selection (Left/Right arrows), stable source link, reading descriptions, reduced-motion support, standard HTML ranges and focus indicators. Sounds are not the sole access route: numeric visual summaries and text descriptions accompany them. The moving 3D globe is optional and only used for equirectangular or flat projected images (night lights, ocean currents and aerosols). NASA's pre-rendered globe videos are displayed as videos' extracted frames rather than mapped onto a second globe.

## Source credit

**NASA Scientific Visualization Studio**; creators and dataset providers vary by resource. See the linked SVS resource pages for original credits. The website, sound engine, and user interface are EarthBeat team's independent presentation. NASA does not endorse this app.
