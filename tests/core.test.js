const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../src/core.js');

function makeGrid(w,h,fn) {
  const pixels = new Uint8ClampedArray(w*h*4);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const i=(y*w+x)*4,v=fn(x,y);
    pixels[i]=pixels[i+1]=pixels[i+2]=v;
    pixels[i+3]=255;
  }
  return core.fromRGBA(pixels,w,h);
}

test('years are 2012 through 2023', () => assert.deepEqual(core.years, Array.from({length:12},(_,i)=>i+2012)));
test('black NASA-style pixels do not create invented tones',()=>{
  const g=makeGrid(24,12,()=>0);
  assert.equal(core.features(g).mean,0);
  assert.equal(core.sequence(g).flat().length,0);
});
test('image brightness changes image-derived sonification',()=>{
  const g=makeGrid(24,12,x=>x>=12?240:0);
  assert.ok(core.features(g).mean>0.4);
  assert.ok(core.sequence(g).flat().length>0);
});
test('identical input yields identical notes',()=>{
  const g=makeGrid(24,12,(x,y)=>x*8+y*2);
  assert.deepEqual(core.sequence(g),core.sequence(g));
});
test('western and eastern pixel regions differ',()=>{
  const g=makeGrid(24,12,x=>x<12?0:255);
  assert.equal(core.features(g,'west').density,0);
  assert.equal(core.features(g,'east').density,1);
});
test('transparent pixels are ignored',()=>{
  const g=core.fromRGBA(new Uint8ClampedArray([255,255,255,0,0,0,0,255]),2,1);
  assert.equal(g.values[0],0);
});
test('comparison produces a signed difference',()=>{
  const d=core.compare({mean:.1,density:.1,peak:.4},{mean:.2,density:.25,peak:.6});
  assert.ok(Math.abs(d.meanDelta-.1)<1e-6);
  assert.ok(Math.abs(d.densityDelta-.15)<1e-6);
});
