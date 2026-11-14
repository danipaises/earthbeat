const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../src/core.js');
function grid(w,h,fn) {
  let px = new Uint8ClampedArray(w*h*4);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
    let i=(y*w+x)*4, v=fn(x,y); px[i]=px[i+1]=px[i+2]=v; px[i+3]=255;
  }
  return core.fromRGBA(px,w,h);
}
test('12 official years',()=>assert.deepEqual(core.years,[2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023]));
test('black pixels produce zero light, zero voices',()=>{
  let g=grid(24,12,()=>0), f=core.features(g);
  assert.equal(f.mean,0); assert.equal(f.density,0);
  assert.equal(core.sequence(g).flat().length,0);
});
test('lit pixels affect features and sonification',()=>{
  let g=grid(24,12,(x)=>x>11?240:0), f=core.features(g);
  assert.ok(f.mean>.45&&f.mean<.5);
  assert.ok(f.density>.4 && f.density<.6);
  assert.ok(core.sequence(g).flat().length>0);
});
test('same input has deterministic audio sequence',()=>{
  let g=grid(24,12,(x,y)=>x*8+y*2);
  assert.deepEqual(core.sequence(g),core.sequence(g));
});
test('east west region masks are independent',()=>{
  let g=grid(24,12,(x)=>x<12?0:255);
  assert.equal(core.features(g,'west').density,0);
  assert.equal(core.features(g,'east').density,1);
});
test('transparent pixels are not mistaken for lights',()=>{
  let p=new Uint8ClampedArray([255,255,255,0,0,0,0,255]);
  let g=core.fromRGBA(p,2,1);
  assert.equal(g.values[0],0);
});
test('comparison returns signed delta',()=>{
  const d=core.compare({mean:0.1,density:0.1,peak:0.4},{mean:0.2,density:0.25,peak:0.6});
  assert.ok(Math.abs(d.meanDelta-0.1)<1e-6);
  assert.ok(Math.abs(d.densityDelta-0.15)<1e-6);
});
