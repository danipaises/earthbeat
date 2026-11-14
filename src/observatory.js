/* EarthBeat Observatory — public NASA visualization frames into live procedural audio.
 * No synthetic scientific datasets, no cloud synthesis, no API key, no build tooling.
 */
(()=>{'use strict';
const S=window.EarthBeatScience,$=id=>document.getElementById(id);
if(!S)throw new Error('Science engine did not load');
const MODULES={
 lights:{name:'Luzes noturnas',en:'Night lights',subtitle:'Black Marble / VIIRS',icon:'✧',tag:'NASA / BLACK MARBLE',source:'https://svs.gsfc.nasa.gov/5276/',note:'2012–2023: médias anuais de luzes noturnas visualizadas pela NASA. O índice sonoro mede brilho de imagem, não radiância calibrada.',enNote:'2012–2023: annual nighttime-lights visualizations. The sound index is image brightness, not calibrated radiance.',year:true,globe:true,frames:12,color:'#6ce9d9',timbre:'sine',detail:'12 anos · VIIRS'},
 ocean:{name:'Oceanos vivos',en:'Living oceans',subtitle:'ECCO2 / Temperatura + correntes',icon:'≋',tag:'NASA / ECCO2 OCEAN',source:'https://svs.gsfc.nasa.gov/3912/',note:'Correntes superficiais coloridas segundo temperatura no modelo ECCO2. Cada quadro vem de uma animação; cores não são graus Celsius.',enNote:'ECCO2 surface currents colored by temperature. Frames sample an animation; colors are not Celsius readings.',year:false,globe:true,frames:8,color:'#52bafd',timbre:'sine',detail:'8 quadros · ECCO2'},
 aerosols:{name:'Respiração da Terra',en:'Atmospheric aerosols',subtitle:'GEOS / Fumaça · poeira · sais',icon:'◌',tag:'NASA / GEOS AEROSOLS',source:'https://svs.gsfc.nasa.gov/5669/',note:'Imagem do modelo GEOS de 19/08/2025. Cores ilustram diferentes tipos de aerossóis; nosso índice mede contraste cromático, não concentração.',enNote:'GEOS model visualization from Aug 19, 2025. Colors indicate aerosol types; our index measures color contrast, not concentration.',year:false,globe:true,frames:1,color:'#b690ff',timbre:'triangle',detail:'1 imagem · GEOS'},
 carbon:{name:'Pulso do carbono',en:'Carbon pulse',subtitle:'DYAMOND / CO₂ 2020',icon:'◍',tag:'NASA / DYAMOND CO₂',source:'https://svs.gsfc.nasa.gov/5196/',note:'Quadros de uma visualização modelada de CO₂ de janeiro a março de 2020. A câmera se move; diferenças entre quadros não devem ser interpretadas como séries temporais calibradas.',enNote:'Frames from a Jan–Mar 2020 modeled CO₂ visualization. The camera moves, so frame differences are not calibrated time-series trends.',year:false,globe:false,frames:8,color:'#eea775',timbre:'sawtooth',detail:'8 quadros · DYAMOND'},
 forest:{name:'Vozes da floresta',en:'Forest voices',subtitle:'GEDI / Altura da vegetação',icon:'♧',tag:'NASA / GEDI FORESTS',source:'https://svs.gsfc.nasa.gov/4950/',note:'Visualização GEDI de altura de vegetação (2019–2020). Verde claro/branco indica vegetação mais alta. O tom musical não representa metros de altura.',enNote:'GEDI vegetation-height visualization (2019–2020). Pale green/white indicates taller vegetation. Pitch does not represent canopy height in meters.',year:false,globe:false,frames:8,color:'#9fdb7f',timbre:'triangle',detail:'8 quadros · GEDI'},
 lightning:{name:'Batidas do céu',en:'Lightning beats',subtitle:'ISS / Lightning Imaging Sensor',icon:'ϟ',tag:'NASA / ISS LIS',source:'https://svs.gsfc.nasa.gov/5011/',note:'Um quadro de apresentação NASA sobre detecções LIS na ISS (2017–2023). As batidas derivam de pixels amarelos da imagem e não representam a frequência real de raios.',enNote:'An illustrative NASA image of ISS LIS detections (2017–2023). Beats follow yellow pixels, not actual lightning-event frequencies.',year:false,globe:false,frames:1,color:'#f1d078',timbre:'square',detail:'1 quadro · LIS'}
};
const IDS=Object.keys(MODULES);
const state={id:'lights',frame:11,cache:new Map(),image:null,grid:null,metrics:null,sequence:[],region:'all',view:'globe',playing:false,step:0,timer:0,audio:null,master:null,limiter:null,speed:1,volume:.62,load:0,compare:false,compareData:null,mix:false,mixGrid:null,mixSequence:[],mixId:'ocean',lang:'pt',frameLoading:false,globe:null};
const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
const nameOf=id=>state.lang==='pt'?MODULES[id].name:MODULES[id].en;
const frameName=(id,frame)=>id==='lights'?String(2012+frame):String(frame+1).padStart(2,'0');
const frameURL=(id,index)=>id==='lights'?`assets/nightlights/${2012+index}.webp`:`assets/observatory/${id}/${String(index+1).padStart(2,'0')}.webp`;
const clamp=S.clamp;
const time=(secs)=>{const m=Math.floor(secs/60),s=Math.floor(secs%60);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')};
const noteToSR=text=>{$('srStatus').textContent=text;};

function buildCatalog(){
 $('phenomena').innerHTML=IDS.map(id=>{const m=MODULES[id];return `<button type="button" class="phenomenon" data-module="${id}" aria-pressed="false"><span class="p-icon" aria-hidden="true">${m.icon}</span><span class="p-label"><strong>${nameOf(id)}</strong><small>${m.subtitle}</small></span><span class="p-arrow" aria-hidden="true">↗</span></button>`;}).join('');
 for(const btn of document.querySelectorAll('[data-module]'))btn.addEventListener('click',()=>selectModule(btn.dataset.module));
 $('sourceCloud').innerHTML=IDS.map(id=>`<a href="${MODULES[id].source}" target="_blank" rel="noopener">${MODULES[id].icon} ${nameOf(id)} <span>↗</span></a>`).join('');
 $('mixSource').innerHTML=IDS.map(id=>`<option value="${id}">${nameOf(id)}</option>`).join('');
 $('mixSource').value=state.mixId;
}
function updateCatalog(){for(const btn of document.querySelectorAll('[data-module]'))btn.setAttribute('aria-pressed',String(btn.dataset.module===state.id));}
function populateTime(){const m=MODULES[state.id];$('timeType').textContent=m.year?(state.lang==='pt'?'12 ANOS':'12 YEARS'):m.frames===1?(state.lang==='pt'?'1 QUADRO':'1 FRAME'):`${m.frames} ${state.lang==='pt'?'QUADROS':'FRAMES'}`;
 $('seriesTitle').textContent=m.year?(state.lang==='pt'?'Luzes noturnas · 2012—2023':'Night lights · 2012—2023'):`${nameOf(state.id)} · NASA SVS`;
 $('timeExplanation').textContent=m.year?(state.lang==='pt'?'Cada imagem representa um ano, com o mesmo processamento.':'Each image represents one year with consistent processing.'):m.frames===1?(state.lang==='pt'?'Um quadro científico publicado pela NASA.':'One scientific frame published by NASA.'):(state.lang==='pt'?'Amostras visuais ordenadas da animação NASA (incluem movimentos de câmera).':'Sequential samples of NASA animation frames (may include camera movement).');
 $('timeButtons').innerHTML=Array.from({length:m.frames},(_,i)=>`<button type="button" aria-pressed="${state.frame===i}" data-frame="${i}">${m.year?2012+i:String(i+1).padStart(2,'0')}</button>`).join('');
 for(const btn of $('timeButtons').querySelectorAll('button'))btn.addEventListener('click',()=>setFrame(Number(btn.dataset.frame)));
}
function timeButtonState(){for(const btn of $('timeButtons').querySelectorAll('button'))btn.setAttribute('aria-pressed',String(Number(btn.dataset.frame)===state.frame));}
function setLoading(head,sub,failed=false){$('emptyState').hidden=false;$('emptyTitle').textContent=head;$('emptyText').textContent=sub;$('emptyState').classList.toggle('failed',failed);}
function hideLoading(){$('emptyState').hidden=true;}
function imgFromURL(url){return new Promise((resolve,reject)=>{const img=new Image();img.decoding='async';img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Asset not available: '+url));img.src=url;});}
async function getImage(id,frame){const key=id+':'+frame;if(state.cache.has(key))return state.cache.get(key);const promise=imgFromURL(frameURL(id,frame));state.cache.set(key,promise);try{return await promise;}catch(e){state.cache.delete(key);throw e;}}
function makeData(image,mode){const c=document.createElement('canvas');c.width=252;c.height=142;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,252,142);return S.toGrid(ctx.getImageData(0,0,252,142).data,252,142,mode);}
function updateStats(){const a=state.metrics;const mean=a?.mean||0,dens=a?.density||0;
 $('statMean').textContent=a?(mean*100).toFixed(1)+'/100':'—';
 $('statDensity').textContent=a?(dens*100).toFixed(1)+'%':'—';
 const count=state.sequence.reduce((acc,list)=>acc+list.length,0);
 $('statNotes').textContent=a?count:'—';
 $('meanMeter').style.width=(mean*100)+'%';$('densityMeter').style.width=(dens*100)+'%';$('notesMeter').style.width=(Math.min(100,count/300*100))+'%';
 $('statMeanHelp').textContent=state.lang==='pt'?'Índice da imagem (não calibrado)':'Image index (not calibrated)';
 $('scienceInsight').textContent=state.lang==='pt'?MODULES[state.id].note:MODULES[state.id].enNote;
 $('sourceLink').href=MODULES[state.id].source;
}
async function loadFrame(id,frame,{keepPlay=false}={}){
 const token=++state.load;state.frameLoading=true;const m=MODULES[id];
 setLoading(state.lang==='pt'?'Carregando NASA SVS…':'Loading NASA SVS…',`${nameOf(id)} · ${frameName(id,frame)}`);
 try{
  const im=await getImage(id,frame);if(token!==state.load||id!==state.id)return;
  const grid=makeData(im,id),metrics=S.metrics(grid,state.region),sequence=S.notes(grid,state.region);
  state.image=im;state.grid=grid;state.metrics=metrics;state.sequence=sequence;
  $('frameCounter').textContent=`FRAME ${String(frame+1).padStart(2,'0')} / ${String(m.frames).padStart(2,'0')}`;
  $('frameLabel').textContent=frameName(id,frame);$('screenSeries').textContent=m.tag;
  $('sessionState').textContent=state.lang==='pt'?'NASA VISUAL CARREGADO':'NASA VISUAL LOADED';$('stageTag').textContent=m.tag;
  updateStats();updateFrameMeta();updateScreen();timeButtonState();updateSignal();hideLoading();updatePlayLabel();
  if(state.view==='globe')state.globe?.setTexture(im);
  noteToSR(`NASA SVS: ${nameOf(id)}, ${frameName(id,frame)} loaded`);
 }catch(err){if(token!==state.load)return;console.error(err);state.image=null;state.grid=null;state.sequence=[];state.metrics=null;state.playing=false;stopTick();updatePlayLabel();
  $('sessionState').textContent='ARQUIVOS NASA AUSENTES';updateStats();updateScreen();
  setLoading(state.lang==='pt'?'Não foi possível carregar os dados da NASA':'NASA data unavailable',`${state.lang==='pt'?'Consulte a fonte NASA e o script':'See NASA source and build script'} scripts/prepare_observatory.sh. ${err.message}`,true);
  noteToSR('NASA data could not be loaded. No synthetic image will be substituted.');
 }finally{if(token===state.load)state.frameLoading=false;}
}
function updateFrameMeta(){$('nowTitle').textContent=nameOf(state.id);$('nowSubtitle').textContent=`${frameName(state.id,state.frame)} · ${MODULES[state.id].subtitle}`;$('moduleGlyph').textContent=MODULES[state.id].icon;}
function selectModule(id){if(!MODULES[id])return;stopPlayback();state.id=id;state.frame=id==='lights'?11:0;state.compare=false;state.compareData=null;state.view=MODULES[id].globe?'globe':'map';state.step=0;state.image=null;state.grid=null;state.sequence=[];state.metrics=null;
 document.documentElement.style.setProperty('--accent',MODULES[id].color);document.documentElement.style.setProperty('--glow',MODULES[id].color+'33');
 if(!state.globe)state.view='map';$('screen').classList.toggle('globe',state.view==='globe');$('screen').classList.remove('fullscreen');document.body.classList.remove('screen-expanded');$('viewBtn').textContent=state.view==='globe'?'◉ GLOBO':'▣ MAPA';$('viewBtn').disabled=!MODULES[id].globe;
 $('autoFrames').checked=!MODULES[id].year&&MODULES[id].frames>1;
 $('comparisonBlock').hidden=id!=='lights';
 $('mixSource').querySelectorAll('option').forEach(el=>el.disabled=el.value===id);
 if(state.mixId===id)state.mixId=IDS.find(x=>x!==id);
 $('mixSource').value=state.mixId;
 updateCatalog();populateTime();updateFrameMeta();updatePlayLabel();loadFrame(id,state.frame);
}
function setFrame(index,{keepPlay=false}={}){const m=MODULES[state.id];if(index<0||index>=m.frames)return;
 if(!keepPlay)stopPlayback();state.frame=index;state.step=0;state.compare=false;state.compareData=null;
 loadFrame(state.id,index,{keepPlay});
}
function updateScreen(){
 const canvas=$('spaceCanvas'),ctx=canvas.getContext('2d');ctx.fillStyle='#061320';ctx.fillRect(0,0,canvas.width,canvas.height);
 if(!state.image)return;
 if(state.compare&&state.compareData){const a=state.image,b=state.compareData.image,w=canvas.width,h=canvas.height;
  ctx.save();ctx.beginPath();ctx.rect(0,0,w/2,h);ctx.clip();ctx.drawImage(a,0,0,w,h);ctx.restore();
  ctx.save();ctx.beginPath();ctx.rect(w/2,0,w/2,h);ctx.clip();ctx.drawImage(b,0,0,w,h);ctx.restore();
  ctx.fillStyle='#90fff0';ctx.fillRect(w/2-2,0,4,h);
  ctx.font='bold 28px monospace';ctx.fillStyle='#f4ffff';ctx.fillText(String(2012+state.frame),42,h-35);ctx.fillText(String(2012+state.compareData.frame),w/2+42,h-35);
 }else ctx.drawImage(state.image,0,0,canvas.width,canvas.height);
}
function globeToggle(){if(!MODULES[state.id].globe)return;state.view=state.view==='globe'?'map':'globe';$('screen').classList.toggle('globe',state.view==='globe');$('viewBtn').textContent=state.view==='globe'?'◉ GLOBO':'▣ MAPA';if(state.view==='globe'&&state.image)state.globe?.setTexture(state.image);}
function fullToggle(){const expanded=$('screen').classList.toggle('fullscreen');document.body.classList.toggle('screen-expanded',expanded);$('fullBtn').textContent=expanded?'⤡':'⤢';}
const interval=()=>230/state.speed;
function updatePlayLabel(){$('playBtn').textContent=state.playing?'Ⅱ':'▶';$('playBtn').setAttribute('aria-label',state.playing?'Pausar':'Reproduzir');$('playBtn').disabled=!state.grid;$('stopBtn').disabled=!state.grid;$('exportBtn').disabled=!state.grid;$('vinyl').classList.toggle('spinning',state.playing);
 const dur=S.STEPS*interval()/1000;
 $('elapsed').textContent=time(state.step*interval()/1000);$('duration').textContent=time(dur);
 $('progressFill').style.width=clamp(state.step/S.STEPS)*100+'%';
 $('scanBeam').style.opacity=state.playing&&state.view==='map'?'1':'0';$('scanBeam').style.left=(state.step/S.STEPS*100)+'%';
}
function stopTick(){if(state.timer){clearInterval(state.timer);state.timer=0;}}
function ensureAudio(){if(!state.audio){const C=window.AudioContext||window.webkitAudioContext;if(!C)throw new Error('Web Audio is unavailable');const a=new C();const limiter=a.createDynamicsCompressor();limiter.threshold.value=-22;limiter.knee.value=20;limiter.ratio.value=8;const master=a.createGain();master.gain.value=state.volume;limiter.connect(master);master.connect(a.destination);state.audio=a;state.master=master;state.limiter=limiter;}return state.audio;}
function emit(context,bus,note,when,duration,level=1,kind='sine'){
 const osc=context.createOscillator(),gain=context.createGain();osc.type=kind;osc.frequency.setValueAtTime(note.hz,when);
 const amp=clamp(note.amplitude*level,.001,.18);
 gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(amp,when+.026);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
 osc.connect(gain);if(context.createStereoPanner){const p=context.createStereoPanner();p.pan.value=clamp(note.pan,-1,1);gain.connect(p);p.connect(bus);}else gain.connect(bus);
 osc.start(when);osc.stop(when+duration+.01);
}
function waveformType(id){const mode=$('timbre').value;if(mode==='pulse')return 'square';if(mode==='harmonic')return 'triangle';return MODULES[id].timbre;}
async function loadMix(){state.mixGrid=null;state.mixSequence=[];if(!state.mix)return;
 const id=state.mixId;try{const frame=id==='lights'?11:0,im=await getImage(id,frame);const g=makeData(im,id);state.mixGrid=g;state.mixSequence=S.notes(g,state.region);}
 catch(e){state.mix=false;$('mixToggle').checked=false;$('mixOptions').hidden=true;console.warn('Mix image unavailable',e);noteToSR('Secondary NASA visualization unavailable; the mix was disabled.');}}
async function togglePlay(){if(state.playing){pausePlayback();return;}if(!state.grid)return;
 try{const a=ensureAudio();await a.resume();if(state.mix&&!state.mixGrid)await loadMix();if(state.step>=S.STEPS)state.step=0;
  state.master.gain.cancelScheduledValues(a.currentTime);state.master.gain.setTargetAtTime(state.volume,a.currentTime,.015);
  state.playing=true;stopTick();stepPlayback();state.timer=setInterval(stepPlayback,interval());updatePlayLabel();}
 catch(e){console.error(e);alert('Não foi possível iniciar o áudio: '+e.message);}
}
function stepPlayback(){if(!state.playing||!state.grid)return;const a=state.audio;if(!a)return;
 if(state.step>=S.STEPS)state.step=0;
 const notes=state.sequence[state.step]||[],dur=Math.min(.32,interval()/1000*.88);
 for(const n of notes)emit(a,state.limiter,n,a.currentTime+.008,dur,.85,waveformType(state.id));
 if(state.mix&&state.mixSequence.length){const t=state.mixSequence[state.step]||[];for(const n of t)emit(a,state.limiter,n,a.currentTime+.008,dur,.34,waveformType(state.mixId));}
 $('voiceLabel').textContent=`${state.id.toUpperCase()} · ${notes.length?Math.round(notes[0].hz)+' Hz':'SILENCE / 0 Hz'}`;
 state.step++;updatePlayLabel();updateSignal();
 if(MODULES[state.id].frames>1&&$('autoFrames').checked&&state.step%14===0){const next=(state.frame+1)%MODULES[state.id].frames;setFrame(next,{keepPlay:true});}
}
function pausePlayback(){state.playing=false;stopTick();if(state.audio&&state.master){const t=state.audio.currentTime;state.master.gain.cancelScheduledValues(t);state.master.gain.setTargetAtTime(.0001,t,.018);}updatePlayLabel();}
function stopPlayback(){pausePlayback();state.step=0;updatePlayLabel();updateSignal();}
function drawSignal(){const canvas=$('signalCanvas'),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
 ctx.fillStyle='#071724';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#193f50';ctx.lineWidth=1;
 for(let x=0;x<w;x+=w/24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}ctx.beginPath();ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.stroke();
 const m=state.sequence.map(t=>t.reduce((sum,n)=>sum+n.amplitude,0));if(!m.length)return;
 const grad=ctx.createLinearGradient(0,0,w,0);grad.addColorStop(0,'#4b80ef');grad.addColorStop(.55,MODULES[state.id].color);grad.addColorStop(1,'#a6d7ff');ctx.strokeStyle=grad;ctx.lineWidth=2;ctx.shadowColor=MODULES[state.id].color;ctx.shadowBlur=12;ctx.beginPath();
 for(let x=0;x<w;x+=2){const idx=Math.min(S.STEPS-1,Math.floor(x/w*S.STEPS)),v=clamp(m[idx]*2);const y=h/2+Math.sin(x*.095)*v*43+Math.sin(x*.022)*v*17;if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();ctx.shadowBlur=0;
 ctx.fillStyle='#b2fff7';ctx.fillRect(state.step/S.STEPS*w,0,2,h);
}
function updateSignal(){drawSignal();}
function wavBlob(buffer){const len=buffer.length,nc=2,size=44+len*nc*2;const out=new ArrayBuffer(size),v=new DataView(out);let p=0;const text=t=>{for(const c of t)v.setUint8(p++,c.charCodeAt(0));};const u16=n=>{v.setUint16(p,n,true);p+=2;};const u32=n=>{v.setUint32(p,n,true);p+=4;};
 text('RIFF');u32(size-8);text('WAVEfmt ');u32(16);u16(1);u16(nc);u32(buffer.sampleRate);u32(buffer.sampleRate*nc*2);u16(nc*2);u16(16);text('data');u32(len*nc*2);
 const L=buffer.getChannelData(0),R=buffer.getChannelData(1);for(let i=0;i<len;i++)for(const s of [L[i],R[i]]){const x=clamp(s,-1,1);v.setInt16(p,x<0?x*32768:x*32767,true);p+=2;}return new Blob([out],{type:'audio/wav'});
}
async function exportWAV(){if(!state.grid)return;const C=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!C){alert('Offline audio export is unavailable');return;}
 const btn=$('exportBtn');btn.disabled=true;btn.textContent='Preparando WAV…';
 try{if(state.mix&&!state.mixSequence.length)await loadMix();const dt=interval()/1000,seconds=S.STEPS*dt+.25,sr=22050,offline=new C(2,Math.ceil(sr*seconds),sr);const limiter=offline.createDynamicsCompressor();limiter.threshold.value=-22;limiter.ratio.value=8;const master=offline.createGain();master.gain.value=state.volume;limiter.connect(master);master.connect(offline.destination);
 const duration=Math.min(.32,dt*.88);for(let t=0;t<state.sequence.length;t++){for(const n of state.sequence[t])emit(offline,limiter,n,t*dt,duration,.85,waveformType(state.id));if(state.mix&&state.mixSequence.length)for(const n of (state.mixSequence[t]||[]))emit(offline,limiter,n,t*dt,duration,.34,waveformType(state.mixId));}
 const buf=await offline.startRendering();const obj=URL.createObjectURL(wavBlob(buf));const a=document.createElement('a');a.href=obj;a.download=`EarthBeat_${state.id}_${frameName(state.id,state.frame)}.wav`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(obj),3000);
 }catch(err){console.error(err);alert('Export failed: '+err.message);}finally{btn.disabled=false;btn.textContent=state.lang==='pt'?'↓   Exportar composição WAV':'↓   Export WAV composition';}
}
async function compare(){const a=Number($('compareA').value)-2012,b=Number($('compareB').value)-2012;if(a===b){$('compareReadout').textContent='Selecione anos diferentes.';return;}
 stopPlayback();state.id='lights';state.frame=a;state.view='map';$('screen').classList.remove('globe');$('viewBtn').textContent='▣ MAPA';
 try{const [ia,ib]=await Promise.all([getImage('lights',a),getImage('lights',b)]);const ga=makeData(ia,'lights'),gb=makeData(ib,'lights'),ma=S.metrics(ga,state.region),mb=S.metrics(gb,state.region);
  state.image=ia;state.grid=ga;state.metrics=ma;state.sequence=S.notes(ga,state.region);state.compare=true;state.compareData={image:ib,frame:b};
  updateStats();updateCatalog();populateTime();updateFrameMeta();updatePlayLabel();updateScreen();hideLoading();
  const delta=S.compare(ma,mb);$('compareReadout').textContent=`${2012+a} → ${2012+b}: índice visual médio ${delta.meanDelta>=0?'+':''}${(delta.meanDelta*100).toFixed(2)} pontos · diferença descritiva de imagem, não radiância.`;
  $('frameLabel').textContent=`${2012+a} × ${2012+b}`;noteToSR('NASA Black Marble A/B comparison ready');
 }catch(err){console.error(err);$('compareReadout').textContent='Imagens originais ausentes. Execute o workflow NASA no GitHub.';}
}
function setupGlobe(){const canvas=$('globeCanvas');let gl;try{gl=canvas.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:false});}catch(e){}if(!gl){$('viewBtn').disabled=true;return null;}
 const vertex=`#version 300 es\nin vec2 pos;out vec2 uv;void main(){uv=(pos+1.0)*.5;gl_Position=vec4(pos,0.0,1.0);}`;
 const fragment=`#version 300 es\nprecision highp float;uniform sampler2D tex;uniform float rotation;in vec2 uv;out vec4 outColor;const float PI=3.14159265;void main(){vec2 p=(uv-.5)*2.0;float r2=dot(p,p);if(r2>.89){discard;}float nz=sqrt(max(.001,1.0-r2/.89));vec3 n=normalize(vec3(p.x,-p.y,nz));float lon=atan(n.x,n.z)+rotation;float lat=asin(n.y);vec2 coord=vec2(fract(lon/(2.0*PI)+.5),clamp(.5-lat/PI,0.005,.995));vec3 color=texture(tex,coord).rgb;float day=.3+.7*max(dot(n,normalize(vec3(-.30,.58,1.0))),0.0);float limb=pow(1.0-nz,3.0);color=color*day+vec3(.045,.28,.39)*limb;outColor=vec4(color,1.0);}`;
 function compile(src,type){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
 let program;try{program=gl.createProgram();gl.attachShader(program,compile(vertex,gl.VERTEX_SHADER));gl.attachShader(program,compile(fragment,gl.FRAGMENT_SHADER));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('GLSL link failed');}catch(e){console.warn('Globe unavailable',e);$('viewBtn').disabled=true;return null;}
 gl.useProgram(program);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'pos');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 gl.clearColor(0,0,0,0);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 const uniform=gl.getUniformLocation(program,'rotation');let angle=0,ready=false,last=0;
 function loop(timeNow){window.requestAnimationFrame(loop);if(!ready||state.view!=='globe'||!MODULES[state.id].globe)return;
  if(!reducedMotion&&last)angle+=(timeNow-last)*.00010;last=timeNow;
  gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(uniform,angle);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 }
 window.requestAnimationFrame(loop);
 return{setTexture(im){gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);ready=true;angle=0;last=0;}};
}
// Human-readable English interface for international Space Apps jurors.
// We preserve the original Portuguese DOM text so the language switch is reversible.
const originalText=new Map();
const englishText={
 '.topnav a:nth-child(1)':'Explore',
 '.topnav a:nth-child(2)':'How it works',
 '.topnav a:nth-child(3)':'Data sources',
 '.intro-copy h1':'Hear the <span>invisible.</span><br>Feel the <i>planet.</i>',
 '.intro-description':'Six sonic worlds. Real NASA scientific imagery. One interactive instrument turning Earth patterns into music — synthesized live in your browser.',
 '.intro-actions .button-primary':'Enter the Observatory <b>↗</b>',
 '.intro-actions .button-ghost':'<span>◎</span> Discover the science',
 '.trustline span:nth-child(1)':'<b>06</b> phenomena',
 '.trustline span:nth-child(2)':'<b>12</b> years of nighttime lights',
 '.trustline span:nth-child(3)':'<b>0</b> invented data',
 '#labTitle':'Your sonic <em>observatory.</em>',
 '.lab-section .section-head p:not(.section-kicker)':'Choose a phenomenon, explore authentic NASA frames and listen as visual patterns become a unique composition.',
 '.panel-minihead span:first-child':'PHENOMENA / 06',
 '.catalog-foot p':'Main source: <strong>NASA Scientific Visualization Studio</strong>. Every sound is driven by image pixels.',
 '.signal-header .panel-eyebrow':'SONIFICATION / LIVE SIGNAL',
 '.time-panel .panel-eyebrow':'SCIENTIFIC NAVIGATION',
 '.timeline-legend .switchline span':'Auto advance',
 '.mixer-top h3':'Data-to-Sound <span>Studio</span>',
 '.mixer-panel .control-label[for="volume"] span':'VOLUME',
 '.mixer-panel .control-label[for="tempo"] span':'SPEED',
 '.mixer-panel .control-label[for="timbre"] span':'MUSICAL STYLE',
 '.mixer-panel .control-label[for="zone"] span':'SCAN REGION',
 '.mix-switch span':'MIX WITH ANOTHER NASA SOURCE',
 '#mixOptions .tiny-note':'Each image generates independent musical voices; sources do not represent equivalent physical quantities.',
 '#exportBtn':'↓ &nbsp; Export WAV composition',
 '.keyboard-tip':'SPACE: play/pause · ← →: change frame',
 '.stat-box:nth-child(1)>span':'◉ &nbsp; VISUAL MEAN INDEX',
 '.stat-box:nth-child(2)>span':'◇ &nbsp; ACTIVE PIXELS',
 '.stat-box:nth-child(3)>span':'♫ &nbsp; MUSICAL EVENTS',
 '.stat-box:nth-child(4)>span':'✳ &nbsp; SCIENCE NOTE',
 '.stat-box:nth-child(2)>p':'Fraction of pixels above the visual threshold',
 '.stat-box:nth-child(3)>p':'Notes calculated from source frames',
 '#sourceLink':'View NASA source ↗',
 '.comparison-block h3':'Compare the same planet at <em>two moments.</em>',
 '.comparison-block p':'An A/B visual comparison with identical image mapping. This is not quantitative calibrated radiance.',
 '#compareBtn':'Compare A/B ↗',
 '.method-section .section-head h2':'Not a soundtrack.<br><em>It is the data making music.</em>',
 '.method-section .section-head p:not(.section-kicker)':'A deterministic algorithm scans each NASA science image and maps visual features to notes. The sound is not AI-generated.',
 '.method-grid article:nth-child(1) h3':'NASA visualizations',
 '.method-grid article:nth-child(1) p':'Original images and animation frames from NASA SVS, optimized for the website during publication.',
 '.method-grid article:nth-child(2) h3':'Pixels → parameters',
 '.method-grid article:nth-child(2) p':'Spatial patterns, luminance and colors control notes, dynamics and stereo position through reproducible rules.',
 '.method-grid article:nth-child(3) h3':'Real-time instruments',
 '.method-grid article:nth-child(3) p':'Web Audio synthesizes every event on your device. No prerecording and no music-generation model.',
 '.method-grid article:nth-child(4) h3':'Responsible science',
 '.method-grid article:nth-child(4) p':'Indices derived from display colors are not calibrated concentrations or measurements. We always show provenance and limitations.',
 '.sources-section h2':'Powered by curiosity.<br><em>Grounded in NASA.</em>',
 '.sources-section>div:first-child>p:not(.section-kicker)':'EarthBeat is an independent NASA Space Apps Challenge 2026 project. Scientific inputs come from NASA Scientific Visualization Studio; the sonification and interface were made by the team with documented AI assistance.',
 '.sources-section .button-ghost':'Read full methodology ↗',
 '.footer p:nth-of-type(2)':'NASA SPACE APPS 2026 <span>·</span> <a href="classic.html">Classic version</a>'
};
const englishOptions={
  '#timbre option[value="ambient"]':'Ambient / Atmospheric',
  '#timbre option[value="pulse"]':'Pulse / Rhythmic',
  '#timbre option[value="harmonic"]':'Harmonic / Melodic',
  '#zone option[value="all"]':'Entire image',
  '#zone option[value="west"]':'Left half',
  '#zone option[value="east"]':'Right half',
  '#zone option[value="center"]':'Center region'
};
function applyInterfaceLanguage(){
 document.documentElement.lang=state.lang==='pt'?'pt-BR':'en';
 for(const [selector,content] of Object.entries({...englishText,...englishOptions})){
  const el=document.querySelector(selector);if(!el)continue;
  if(!originalText.has(selector))originalText.set(selector,el.innerHTML);
  el.innerHTML=state.lang==='en'?content:originalText.get(selector);
 }
 for(const [selector,en] of [['.compare-actions label:nth-child(1)','YEAR A'],['.compare-actions label:nth-child(2)','YEAR B']]){
  const el=document.querySelector(selector);if(!el)continue;
  const key=selector+'::text',node=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);
  if(!node)continue;if(!originalText.has(key))originalText.set(key,node.nodeValue);
  node.nodeValue=state.lang==='en'?en:originalText.get(key);
 }
 $('langBtn').textContent=state.lang==='en'?'PT':'EN';
}
function setup(){
 state.globe=setupGlobe();if(!state.globe)state.view='map';
 buildCatalog();$('compareA').innerHTML=S.modeConfig.lights&&Array.from({length:12},(_,i)=>`<option value="${2012+i}">${2012+i}</option>`).join('');$('compareB').innerHTML=$('compareA').innerHTML;$('compareA').value='2012';$('compareB').value='2023';
 $('langBtn').addEventListener('click',()=>{state.lang=state.lang==='pt'?'en':'pt';applyInterfaceLanguage();buildCatalog();updateCatalog();populateTime();updateFrameMeta();updateStats();noteToSR(state.lang==='pt'?'Português':'English');});
 $('playBtn').addEventListener('click',togglePlay);$('stopBtn').addEventListener('click',stopPlayback);$('backBtn').addEventListener('click',()=>{stopPlayback();updatePlayLabel();});
 $('viewBtn').addEventListener('click',globeToggle);$('fullBtn').addEventListener('click',fullToggle);
 $('volume').addEventListener('input',e=>{state.volume=Number(e.target.value)/100;$('volumeValue').textContent=e.target.value+'%';if(state.audio&&state.master)state.master.gain.setTargetAtTime(state.volume,state.audio.currentTime,.015);});
 $('tempo').addEventListener('input',e=>{state.speed=Number(e.target.value)/100;$('tempoValue').textContent=state.speed.toFixed(1)+'×';if(state.playing){stopTick();state.timer=setInterval(stepPlayback,interval());}updatePlayLabel();});
 $('zone').addEventListener('change',e=>{state.region=e.target.value;stopPlayback();if(state.grid){state.metrics=S.metrics(state.grid,state.region);state.sequence=S.notes(state.grid,state.region);updateStats();updateSignal();}if(state.mixGrid)state.mixSequence=S.notes(state.mixGrid,state.region);});
 $('timbre').addEventListener('change',()=>{if(state.playing)noteToSR('Synthesizer timbre changed');});
 $('mixToggle').addEventListener('change',async e=>{state.mix=e.target.checked;$('mixOptions').hidden=!state.mix;if(state.mix){await loadMix();}});
 $('mixSource').addEventListener('change',async e=>{state.mixId=e.target.value;if(state.mix)await loadMix();});
 $('exportBtn').addEventListener('click',exportWAV);$('compareBtn').addEventListener('click',compare);
 $('screen').addEventListener('dblclick',fullToggle);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('screen').classList.contains('fullscreen')){fullToggle();return;}
  if(e.target instanceof HTMLElement&&e.target.closest('button,select,input,textarea,a,[contenteditable]'))return;
  if(e.code==='Space'){e.preventDefault();togglePlay();}else if(e.code==='ArrowLeft'||e.code==='ArrowRight'){e.preventDefault();const delta=e.code==='ArrowRight'?1:-1;setFrame((state.frame+MODULES[state.id].frames+delta)%MODULES[state.id].frames);}
 });
 selectModule('lights');
}
setup();
})();
