/* EarthBeat Observatory — deterministic visual-feature-to-note mapping.
   This module intentionally does NOT claim to recover geophysical values from RGB imagery. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.EarthBeatScience = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const STEPS = 84, BANDS = 6;
  const clamp = (n,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
  const modeConfig = {
    lights:   {base:43,scale:[0,2,4,7,9,12,14,16,19,21],threshold:.073},
    ocean:    {base:46,scale:[0,2,5,7,9,12,14,17,19,21],threshold:.1},
    aerosols: {base:40,scale:[0,3,5,7,10,12,15,17,19,22],threshold:.11},
    carbon:   {base:42,scale:[0,2,4,7,9,12,14,16,19,21],threshold:.10},
    forest:   {base:45,scale:[0,2,5,7,9,12,14,17,19,21],threshold:.11},
    lightning:{base:36,scale:[0,3,5,7,10,12,15,17,19,22],threshold:.12}
  };
  function toGrid(pixels, width, height, mode='lights') {
    if (!pixels || !Number.isInteger(width) || !Number.isInteger(height) || pixels.length !== width*height*4) throw new Error('Invalid image buffer');
    if (!modeConfig[mode]) throw new Error('Unknown science mode');
    const vals = new Float32Array(width*height), colors = new Float32Array(width*height);
    for(let i=0,j=0;i<vals.length;i++,j+=4){
      if(pixels[j+3]<16)continue;
      const r=pixels[j]/255,g=pixels[j+1]/255,b=pixels[j+2]/255;
      const lum=.2126*r+.7152*g+.0722*b;
      const max=Math.max(r,g,b),min=Math.min(r,g,b);
      const saturation = max>0?(max-min)/max:0;
      let value;
      if(mode==='aerosols')value=lum*saturation;
      else if(mode==='lightning')value=(r>.32 && g>.27 && b<g*.77 && r>b*1.4)?lum:0;
      else if(mode==='ocean')value=lum*(.75+.25*saturation);
      else value=lum;
      vals[i]=clamp(value);
      colors[i]=saturation;
    }
    return {width,height,values:vals,saturation:colors,mode};
  }
  function bounds(region){
    if(region==='west') return [0,.5];
    if(region==='east') return [.5,1];
    if(region==='center') return [.25,.75];
    return [0,1];
  }
  function metrics(grid,region='all'){
    if(!grid)return null;
    const [lo,hi]=bounds(region);const x0=Math.floor(lo*grid.width),x1=Math.ceil(hi*grid.width),threshold=modeConfig[grid.mode].threshold;
    let sum=0,active=0,peak=0,n=0;
    for(let y=0;y<grid.height;y++)for(let x=x0;x<x1;x++){
      const v=grid.values[y*grid.width+x];sum+=v;active+=v>threshold?1:0;peak=Math.max(peak,v);n++;
    }
    return {mean:n?sum/n:0,density:n?active/n:0,peak,count:n};
  }
  function notes(grid,region='all',steps=STEPS,bands=BANDS){
    if(!grid)return [];
    const [lo,hi]=bounds(region),cx0=Math.floor(lo*grid.width),cx1=Math.ceil(hi*grid.width),cfg=modeConfig[grid.mode];
    const out=[];
    for(let t=0;t<steps;t++){
      const x0=cx0+Math.floor(t/steps*(cx1-cx0));const x1=Math.max(x0+1,cx0+Math.ceil((t+1)/steps*(cx1-cx0)));
      const tick=[];
      for(let band=0;band<bands;band++){
        const y0=Math.floor(band/bands*grid.height),y1=Math.ceil((band+1)/bands*grid.height);
        let max=0,sum=0,active=0,count=0;
        for(let y=y0;y<y1;y++)for(let x=x0;x<Math.min(grid.width,x1);x++){
          const v=grid.values[y*grid.width+x];
          sum+=v;max=Math.max(v,max);active+=v>cfg.threshold?1:0;count++;
        }
        const density=count?active/count:0,mean=count?sum/count:0;
        if(max>cfg.threshold && (density>.004 || max>cfg.threshold*1.8)){
          const idx=Math.min(cfg.scale.length-1,Math.floor((bands-1-band)/bands*cfg.scale.length));
          const midi=cfg.base+cfg.scale[idx];
          tick.push({hz:440*Math.pow(2,(midi-69)/12),amplitude:clamp((Math.sqrt(mean)*.40+density*.12),.018,.22),pan:clamp((x0+x1)/grid.width-1,-1,1),intensity:mean,density,band});
        }
      }
      out.push(tick);
    }
    return out;
  }
  function compare(a,b){ if(!a||!b)return null;return {meanDelta:b.mean-a.mean,densityDelta:b.density-a.density}; }
  return {STEPS,BANDS,clamp,modeConfig,toGrid,bounds,metrics,notes,compare};
});
