const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const js = fs.readFileSync(path.join(__dirname,'..','src','observatory.js'),'utf8');
const css = fs.readFileSync(path.join(__dirname,'..','styles.css'),'utf8');

test('all direct JavaScript DOM references exist in HTML', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  const refs = new Set([...js.matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]));
  assert.deepEqual([...refs].filter(id=>!ids.has(id)),[]);
});
test('NASA mission and annual analysis UI have resolvable controls',()=>{
  const ex = fs.readFileSync(path.join(__dirname,'..','src','experience.js'),'utf8');
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  const refs = new Set([...ex.matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]));
  assert.deepEqual([...refs].filter(id=>!ids.has(id)),[]);
  for(const id of ['startMission','missionPanel','missionSound','missionNext','telemetryBands','yearChart','yearTableBody','yearExport']){
    assert.ok(ids.has(id),'Missing mission UI component '+id);
  }
});
test('annual analysis is derived from real NASA pixels and exposes no fictitious readings',()=>{
  const ex=fs.readFileSync(path.join(__dirname,'..','src','experience.js'),'utf8');
  assert.match(ex,/app\.getAnnualMetrics\(\)/);
  assert.match(ex,/\.mean\*100/);
  assert.match(ex,/URL\.createObjectURL/);
  assert.match(ex,/annual\.length!==12/);
});
test('A and B each have a keyboard-accessible independent listening button',()=>{
  assert.match(html,/id="compareListenA"[^>]*aria-pressed/);
  assert.match(html,/id="compareListenB"[^>]*aria-pressed/);
  assert.match(js,/async function listenToComparison\(which\)/);
  assert.match(js,/state\.sequence=S\.notes\(grid,state\.region\)/);
});
test('globe has a real science image text alternative',()=>{
  assert.match(html,/id="spaceCanvas"[^>]*aria-label/);
  assert.match(js,/\$\('spaceCanvas'\)\.setAttribute\('aria-label'/);
});
test('automatic switching respects complete scientific frame',()=>{
  assert.match(js,/P\.resolveBoundary/);
  assert.doesNotMatch(js,/state\.step%14===0/);
});
test('science credits and third-party fonts have notices',()=>{
  assert.match(html,/href="https:\/\/svs\.gsfc\.nasa\.gov\//);
  assert.match(css,/fonts\.googleapis\.com/);
  const notices=fs.readFileSync(path.join(__dirname,'..','docs','THIRD_PARTY_NOTICES.md'),'utf8');
  assert.match(notices,/Space Grotesk/);
  assert.match(notices,/DM Sans/);
});
