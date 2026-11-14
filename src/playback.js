(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.EarthBeatPlayback = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  function resolveBoundary({step,steps,frame,frameCount,auto}) {
    if (!Number.isInteger(steps) || steps < 1 || !Number.isInteger(frameCount) || frameCount < 1) throw Error('Invalid playback dimensions');
    if (!Number.isInteger(step) || step < 0 || !Number.isInteger(frame) || frame < 0 || frame >= frameCount) throw Error('Invalid playback position');
    if (step < steps) return {step,frame,changed:false};
    if (auto && frameCount > 1) return {step:0,frame:(frame+1)%frameCount,changed:true};
    return {step:0,frame,changed:false};
  }
  return {resolveBoundary};
});
