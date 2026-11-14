/* EarthBeat — deterministic image-derived sonification, no synthetic science. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.EarthBeatCore = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const W = 320, H = 180;
  const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]; // pentatonic C
  const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
  const years = Array.from({ length: 12 }, (_, i) => i + 2012);
  const luminance = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  function fromRGBA(pixels, w, h) {
    if (!pixels || pixels.length !== w * h * 4) throw Error('Invalid RGBA dimensions');
    const out = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      let j = i * 4;
      out[i] = pixels[j + 3] < 16 ? 0 : luminance(pixels[j], pixels[j + 1], pixels[j + 2]);
    }
    return { width: w, height: h, values: out };
  }
  function bounds(region) {
    // fractions of the shown image, not claimed latitude/longitude coordinates
    if (region === 'west') return [0, 0.5];
    if (region === 'east') return [0.5, 1];
    if (region === 'center') return [0.25, 0.75];
    return [0, 1];
  }
  function features(grid, region = 'all') {
    if (!grid || !grid.values) return null;
    const [start, end] = bounds(region);
    let a = Math.floor(start * grid.width), b = Math.ceil(end * grid.width);
    let sum = 0, lit = 0, peak = 0, count = 0;
    for (let x = a; x < b; x++) for (let y = 0; y < grid.height; y++) {
      const v = grid.values[y * grid.width + x] || 0;
      sum += v; peak = Math.max(peak, v); if (v > 0.075) lit++; count++;
    }
    return { mean: count ? sum / count : 0, density: count ? lit / count : 0, peak, count, sampleWidth: b - a };
  }
  function sequence(grid, region = 'all', steps = 88, bands = 7) {
    if (!grid || !grid.values) return [];
    const [start, end] = bounds(region);
    const x0 = Math.floor(start * grid.width), x1 = Math.ceil(end * grid.width);
    const out = [];
    for (let tick = 0; tick < steps; tick++) {
      const xa = x0 + Math.floor((tick / steps) * (x1 - x0));
      const xb = x0 + Math.max(1, Math.ceil(((tick + 1) / steps) * (x1 - x0)));
      const voices = [];
      for (let band = 0; band < bands; band++) {
        const ya = Math.floor((band / bands) * grid.height);
        const yb = Math.ceil(((band + 1) / bands) * grid.height);
        let sum = 0, litSum = 0, max = 0, count = 0, lit = 0;
        for (let x = xa; x < Math.min(xb, grid.width); x++) for (let y = ya; y < yb; y++) {
          const v = grid.values[y * grid.width + x] || 0;
          sum += v; max = Math.max(max, v);
          if (v > .075) { lit++; litSum += v; }
          count++;
        }
        const density = count ? lit / count : 0;
        const intensity = count ? sum / count : 0;
        if (max > .065 && (density > .001 || max > .09)) {
          // Note from upper/lower bands; loudness from measured image intensity.
          const midi = 48 + SCALE[Math.min(SCALE.length - 1, Math.floor((bands - band - 1) / bands * 10))];
          const hz = 440 * Math.pow(2, (midi - 69) / 12);
          const amplitude = clamp(Math.sqrt(intensity * .92 + density * .24) * .46, .018, .26);
          voices.push({ hz, amplitude, pan: clamp(((xa + xb) / 2 / grid.width) * 2 - 1, -1, 1), intensity, density, band });
        }
      }
      out.push(voices);
    }
    return out;
  }
  function compare(a, b) {
    if (!a || !b) return null;
    return { meanDelta: b.mean - a.mean, densityDelta: b.density - a.density, peakDelta: b.peak - a.peak };
  }
  return { W, H, years, clamp, luminance, fromRGBA, features, sequence, compare, bounds };
});
