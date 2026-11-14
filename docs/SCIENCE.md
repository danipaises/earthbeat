# EarthBeat — Scientific method and caveats

## Scientific input

NASA Scientific Visualization Studio (SVS) item 5276, *Change in Night Lights between 2012 and 2023*, contains a 12-frame visualization of annual Black Marble nighttime-lights imagery for 2012–2023. The visualization is produced from observations by Suomi NPP / VIIRS with NASA/NOAA data.

The site uses the **only-lights** flat-map series on a black background and decodes one unique frame per year. The same crop, image dimensions, and processing settings are used for each frame. The released NASA visualization is a **rendered image**, not a calibrated grid of raw radiance.

## Image processing

The GIF/video is not treated as an audio source. For each frame:

1. Convert the image to an RGBA pixel buffer of a fixed 320×180 analysis resolution.
2. Calculate approximate sRGB relative luminance per pixel:
   `L = (0.2126 R + 0.7152 G + 0.0722 B) / 255`.
3. Pixels with alpha less than 16 (if any) are excluded.
4. Use the same numerical thresholds and transformations for every year. Example metric: the fraction of pixels with `L > 0.075`.
5. Scan horizontal positions and seven vertical bands for music events. Brighter sampled areas receive louder notes; the band selects the pitch and scanning position selects stereo pan.

The web application converts luminance patterns into sine-wave notes using the Web Audio API. Regions without enough light must not generate fake data-driven notes. Repeated inputs result in repeated sequences.

## How to interpret the result

The display presents **visual indices**, not measured physical radiance, energy use, population, climate forcing, or direct environmental impact. Differences in NASA's rendering, color mapping, compression and Earth-observation conditions may influence those indices. Sonification is a communication and accessibility tool, not an independent scientific measurement.

Because this is the only-lights rendering, changes in visually illuminated areas should not be equated automatically with changes in human activity without corroborating evidence. See the full metadata and credits on NASA SVS item 5276.

## Test status

The project's unit tests exercise deterministic mapping using explicitly synthetic input buffers, not NASA pixels. The actual NASA download and browser audio must also be verified on the deployed site.
