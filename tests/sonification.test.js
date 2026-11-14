const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../src/sonification.js');
function fixture(fn,w=24,h=12,mode='lights'){const p=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=fn(x,y),i=4*(y*w+x);p[i]=v[0];p[i+1]=v[1];p[i+2]=v[2];p[i+3]=v[3]??255;}return S.toGrid(p,w,h,mode)}
test('pitch mapping is deterministic',()=>{const g=fixture((x,y)=>[x*9,y*18,120]);assert.deepEqual(S.notes(g),S.notes(g));});
test('black image produces zero visual notes',()=>{const g=fixture(()=>[0,0,0]);assert.equal(S.metrics(g).mean,0);assert.equal(S.notes(g).flat().length,0);});
test('changing visual pixels changes notes',()=>{const a=fixture(()=>[0,0,0]);const b=fixture(()=>[245,245,245]);assert.notDeepEqual(S.notes(a),S.notes(b));});
test('region selection uses matching pixels',()=>{const g=fixture(x=>x<12?[0,0,0]:[255,255,255]);assert.equal(S.metrics(g,'west').density,0);assert.equal(S.metrics(g,'east').density,1);});
test('aerosols requires coloured pixels, not grayscale background',()=>{const gray=fixture(()=>[200,200,200],24,12,'aerosols');assert.equal(S.notes(gray).flat().length,0);const color=fixture(()=>[250,30,20],24,12,'aerosols');assert.ok(S.notes(color).flat().length>0);});
test('lightning detects gold highlights but excludes grayscale Earth',()=>{const gray=fixture(()=>[180,180,180],24,12,'lightning');assert.equal(S.notes(gray).flat().length,0);const gold=fixture(()=>[255,210,10],24,12,'lightning');assert.ok(S.notes(gold).flat().length>0);});
test('alpha transparent is ignored',()=>{const g=fixture(()=>[255,255,255,0]);assert.equal(S.metrics(g).mean,0);});
test('invalid dimensions rejected',()=>assert.throws(()=>S.toGrid(new Uint8ClampedArray(5),10,10),/Invalid image buffer/));
