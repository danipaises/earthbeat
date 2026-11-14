/* EarthBeat Discovery Experience: guided NASA mission, live band telemetry and genuine annual visual analysis.
 * No fabricated scientific values; charts derive only from original NASA images.
 */
(function(){
  'use strict';
  const app=window.EarthBeatApp;
  if(!app)throw new Error('EarthBeat core app must load before experience.js');
  const $=id=>document.getElementById(id);
  const chapters=[
    {id:'lights',frame:0,pt:['As cidades aparecem à noite','O que a luz revela quando a Terra escurece?','Usamos o brilho dos pixels da visualização Black Marble (2012–2023). A altura da nota depende da faixa horizontal da imagem; o volume acompanha os pixels iluminados.','Não conclua que mais brilho significa automaticamente mais atividade econômica.'],en:['Cities at night','What does nighttime light reveal?','We use the displayed pixels of NASA Black Marble (2012–2023). Vertical image bands set pitch; brighter pixels influence volume.','Brightness alone is not proof of economic growth.']},
    {id:'ocean',frame:0,pt:['As correntes contam histórias','Como representar o movimento dos oceanos em música?','A visualização ECCO2 combina correntes oceânicas e temperatura em cores. O scanner lê padrões visuais e sintetiza notas.','A câmera e as cores não fornecem temperaturas calibradas.'],en:['Ocean currents tell stories','How can ocean motion become sound?','NASA ECCO2 combines ocean currents and color-coded sea-surface temperature. The scanner maps image patterns to musical events.','Frame pixels cannot be treated as calibrated sea temperatures.']},
    {id:'aerosols',frame:0,pt:['A atmosfera tem camadas','Como ouvir partículas invisíveis no ar?','A visualização GEOS usa cores para mostrar diferentes tipos de aerossóis. Nosso instrumento enfatiza as cores mais saturadas.','A música não mede concentrações de poluentes.'],en:['An atmosphere of layers','How do we hear airborne particles?','The NASA GEOS model shows various aerosols in distinct colors. Our instrument emphasizes saturated pixels.','Music does not measure pollutant concentrations.']},
    {id:'carbon',frame:0,pt:['O carbono se desloca','Como visualizar a circulação do CO₂?','A NASA apresenta o modelo DYAMOND com mapas e animação. Cada quadro visualizado inspira uma composição.','O movimento de câmera não é uma variação quantitativa de CO₂.'],en:['Carbon on the move','How can we visualize carbon dioxide circulation?','NASA visualizes the DYAMOND CO₂ model with animated frames. A selected image becomes a composition.','Moving camera frames are not a quantitative CO₂ time series.']},
    {id:'forest',frame:0,pt:['Florestas também têm voz','O que os dados da vegetação podem nos ensinar?','As imagens GEDI ilustram a distribuição da altura da vegetação. A densidade visual influencia a produção das notas.','Notas altas não significam uma altura específica em metros.'],en:['Forests have a voice','What can canopy observations teach us?','GEDI imagery shows vegetation-height patterns. Visual pixel density influences note events.','Higher notes do not indicate specific canopy heights in meters.']},
    {id:'lightning',frame:0,pt:['O planeta pulsa','E se os raios virassem percussão?','A imagem de detecções do instrumento LIS a bordo da ISS é interpretada com padrões rítmicos a partir de regiões destacadas.','O ritmo não equivale ao número real de descargas por segundo.'],en:['A planet with a pulse','What if lightning became percussion?','An ISS Lightning Imaging Sensor visualization produces rhythmic patterns based on highlighted image areas.','The beat does not represent an actual lightning strike rate.']}
  ];
  let tourIndex=0,loading=false,annual=null,chartSelected=null;
  const lang=()=>app.getState().lang;
  const pt=()=>lang()==='pt';
  const copy=(a,b)=>pt()?a:b;
  const elText=(id,value)=>{$(id).textContent=value};
  const say=(message)=>{const live=$('srStatus');if(live)live.textContent=message};

  const slots=$('telemetryBands').querySelector('.telemetry-slots');
  for(let i=0;i<6;i++){const bar=document.createElement('i');bar.setAttribute('aria-hidden','true');slots.appendChild(bar);}
  function updateTelemetry(payload){
    const bands=new Array(6).fill(0);
    for(const voice of (payload.voices||[])){
      const n=Number(voice.band);
      if(Number.isInteger(n)&&n>=0&&n<6)bands[n]=Math.max(bands[n],Number(voice.amplitude)||0);
    }
    for(let i=0;i<6;i++)slots.children[i].style.height=(4+Math.min(51,bands[i]*210))+'px';
    const active=bands.filter(x=>x>0).length;
    elText('telemetryNow',copy(
      'Etapa '+payload.step+'/84 · '+active+' faixas sonoras ativas',
      'Step '+payload.step+'/84 · '+active+' active sound bands'));
    $('telemetryBands').setAttribute('aria-label',copy(
      'Etapa '+payload.step+': '+active+' das 6 faixas da imagem produziram notas.',
      'Step '+payload.step+': '+active+' of 6 image bands generated notes.'));
  }
  window.addEventListener('earthbeat:tick',event=>updateTelemetry(event.detail));
  window.addEventListener('earthbeat:frame',event=>{
    const info=event.detail;
    if(info.id!=='lights')$('yearInsights').hidden=true;
    else $('yearInsights').hidden=false;
    if(!app.getState().playing){
      const empty=new Array(6).fill(0).map((_,band)=>({band,amplitude:0}));
      updateTelemetry({step:0,voices:empty});
    }
  });

  function tourRender(){
    const chapter=chapters[tourIndex],t=chapter[lang()];
    elText('missionCount',String(tourIndex+1).padStart(2,'0')+' / 06');
    elText('missionTitle',t[0]);elText('missionQuestion',t[1]);
    elText('missionDescription',t[2]);elText('missionMethod',t[3]);
    elText('missionSound',copy('▶ Ouvir este fenômeno','▶ Listen to this phenomenon'));
    elText('missionPrev',copy('← Anterior','← Previous'));
    elText('missionNext',tourIndex===chapters.length-1?copy('Concluir ✓','Finish ✓'):copy('Próxima →','Next →'));
    $('missionPrev').disabled=tourIndex===0;
    const progress=$('missionProgress');progress.replaceChildren();
    for(let i=0;i<chapters.length;i++){
      const bar=document.createElement('i');
      if(i<=tourIndex)bar.className='done';
      progress.appendChild(bar);
    }
    $('missionProgress').setAttribute('aria-label',copy(
      'Capítulo '+(tourIndex+1)+' de '+chapters.length,
      'Chapter '+(tourIndex+1)+' of '+chapters.length));
  }
  async function navigateTour(i){
    if(loading||i<0||i>=chapters.length)return;
    loading=true;const c=chapters[i];tourIndex=i;tourRender();
    $('missionNext').disabled=true;$('missionSound').disabled=true;
    try{
      const ok=await app.show(c.id,c.frame);
      if(!ok)say(copy('Não foi possível carregar a imagem NASA desta etapa.','Could not load the NASA frame for this chapter.'));
      $('missionSound').disabled=!ok;
    }catch(err){console.error('Tour navigation failed',err);say(copy('A imagem da NASA está indisponível.','NASA image unavailable.'));}
    finally{loading=false;$('missionNext').disabled=false;}
  }
  function closeTour(){
    $('missionPanel').hidden=true;
    $('startMission').setAttribute('aria-expanded','false');
    app.stop();
  }
  $('startMission').setAttribute('aria-controls','missionPanel');
  $('startMission').setAttribute('aria-expanded','false');
  $('startMission').addEventListener('click',async()=>{
    $('missionPanel').hidden=false;
    $('startMission').setAttribute('aria-expanded','true');
    $('missionPanel').scrollIntoView({behavior:'smooth',block:'start'});
    await navigateTour(0);
  });
  $('missionClose').addEventListener('click',()=>{closeTour();$('startMission').focus();});
  $('missionPrev').addEventListener('click',()=>navigateTour(tourIndex-1));
  $('missionNext').addEventListener('click',()=>{
    if(tourIndex===chapters.length-1){closeTour();$('startMission').focus();}
    else navigateTour(tourIndex+1);
  });
  $('missionSound').addEventListener('click',async()=>{
    if(!app.getState().ready)return;
    try{app.stop();await app.play();}catch(err){console.error('Tour audio failed',err);}
  });

  const cvs=$('yearChart'),ctx=cvs.getContext('2d');
  function renderChart(rows){
    const W=cvs.width,H=cvs.height,left=63,right=28,top=34,bottom=58;
    const ix=i=>left+i*(W-left-right)/(rows.length-1);
    const values=rows.map(row=>row.mean*100);
    const ymax=Math.max(.5,Math.ceil((Math.max(...values)*1.15)*2)/2);
    const iy=v=>H-bottom-(v/ymax)*(H-top-bottom);
    ctx.clearRect(0,0,W,H);ctx.fillStyle='#081a2a';ctx.fillRect(0,0,W,H);
    ctx.font='14px system-ui';ctx.textBaseline='middle';ctx.textAlign='right';
    for(let i=0;i<=4;i++){
      const v=ymax*i/4,y=iy(v);
      ctx.strokeStyle='#284659';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(W-right,y);ctx.stroke();
      ctx.fillStyle='#93bbca';ctx.fillText(v.toFixed(1),left-12,y);
    }
    const grad=ctx.createLinearGradient(0,top,0,H-bottom);grad.addColorStop(0,'rgba(89,233,218,.32)');grad.addColorStop(1,'rgba(89,233,218,0)');
    ctx.beginPath();ctx.moveTo(ix(0),H-bottom);
    rows.forEach((row,i)=>ctx.lineTo(ix(i),iy(values[i])));
    ctx.lineTo(ix(rows.length-1),H-bottom);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
    ctx.beginPath();rows.forEach((row,i)=>i?ctx.lineTo(ix(i),iy(values[i])):ctx.moveTo(ix(0),iy(values[0])));
    ctx.strokeStyle='#73eedd';ctx.lineWidth=3;ctx.stroke();
    rows.forEach((row,i)=>{
      ctx.beginPath();ctx.arc(ix(i),iy(values[i]),chartSelected===row.year?9:5,0,Math.PI*2);
      ctx.fillStyle=chartSelected===row.year?'#ffffff':'#5cead8';ctx.fill();
      ctx.strokeStyle='#0d293a';ctx.lineWidth=2;ctx.stroke();
      ctx.font='12px system-ui';ctx.textAlign='center';ctx.fillStyle='#a3c4d0';
      ctx.fillText(String(row.year),ix(i),H-bottom+23);
    });
    ctx.font='13px system-ui';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle='#bfe4ed';
    ctx.fillText(copy('Índice de brilho visual (0 = imagem preta)','Visual brightness index (0 = black image)'),left,20);
    if(chartSelected!==null){
      const i=rows.findIndex(r=>r.year===chartSelected);
      if(i>=0){const x=ix(i),y=iy(values[i]);ctx.fillStyle='#e5fffd';ctx.textAlign='center';ctx.font='bold 14px system-ui';ctx.fillText(values[i].toFixed(2),x,y-16);}
    }
    const summary=rows.map(r=>r.year+' '+(r.mean*100).toFixed(2)).join('; ');
    cvs.setAttribute('aria-label',copy('Índice visual anual com origem zero: ','Yearly brightness index with zero baseline: ')+summary+'. '+copy('Não é radiância calibrada.','Not calibrated radiance.'));
  }
  function renderTable(rows){
    const body=$('yearTableBody');body.replaceChildren();
    rows.forEach(row=>{
      const tr=document.createElement('tr'),tdYear=document.createElement('td');
      const button=document.createElement('button');button.type='button';button.textContent=String(row.year);
      button.className='table-year';button.setAttribute('aria-label',copy('Abrir imagem NASA de ','Open NASA image for ')+row.year);
      button.addEventListener('click',()=>selectYear(row.year));
      tdYear.appendChild(button);tr.appendChild(tdYear);
      for(const value of [row.mean*100,row.density*100]){
        const td=document.createElement('td');td.textContent=value.toFixed(2);tr.appendChild(td);
      }
      body.appendChild(tr);
    });
  }
  async function selectYear(year){
    chartSelected=year;
    if(annual)renderChart(annual);
    await app.show('lights',year-2012);
    $('laboratorio').scrollIntoView({behavior:'smooth',block:'start'});
    say(copy('Imagem da NASA do ano ','NASA image for year ')+year);
  }
  async function analyze(){
    const btn=$('analyzeYears');btn.disabled=true;$('yearResults').hidden=false;
    elText('yearChartStatus',copy('Analisando 12 imagens originais da NASA…','Analyzing 12 original NASA frames…'));
    try{
      annual=await app.getAnnualMetrics();
      if(annual.length!==12||annual.some(row=>!Number.isFinite(row.mean)||!Number.isFinite(row.density)))throw Error('Invalid scientific frame metrics');
      renderChart(annual);renderTable(annual);
      elText('yearChartStatus',copy('12 imagens NASA processadas. Selecione um ano no gráfico ou na tabela.','12 NASA images processed. Select a year in the chart or table.'));
      $('yearExport').disabled=false;
    }catch(err){
      console.error('NASA annual analysis failed:',err);
      elText('yearChartStatus',copy('Não foi possível analisar os dados NASA. Nenhum valor foi inventado.','Unable to analyze NASA data. No values were invented.'));
      $('yearChart').hidden=true;$('yearTableWrap').hidden=true;
      btn.disabled=false;return;
    }
    btn.disabled=false;btn.textContent=copy('↻ Recalcular dados NASA','↻ Recalculate NASA data');
  }
  $('analyzeYears').addEventListener('click',analyze);
  cvs.addEventListener('click',event=>{
    if(!annual)return;
    const box=cvs.getBoundingClientRect(),x=(event.clientX-box.left)*cvs.width/box.width;
    const i=Math.max(0,Math.min(11,Math.round((x-63)/(cvs.width-63-28)*11)));
    selectYear(annual[i].year);
  });
  $('yearTableToggle').addEventListener('click',()=>{
    const open=$('yearTableWrap').hidden;
    $('yearTableWrap').hidden=!open;
    $('yearTableToggle').setAttribute('aria-expanded',String(open));
    $('yearTableToggle').textContent=open?copy('▦ Ocultar tabela','▦ Hide table'):copy('▦ Mostrar tabela acessível','▦ Show accessible table');
  });
  $('yearExport').addEventListener('click',()=>{
    if(!annual)return;
    const csv='year,image_brightness_index_0_to_100,lit_pixels_percent\n'+annual.map(row=>[row.year,(row.mean*100).toFixed(4),(row.density*100).toFixed(4)].join(',')).join('\n')+'\n';
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='EarthBeat_NASA_SVS5276_2012_2023_visual_indices.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  $('yearExport').disabled=true;

  window.addEventListener('earthbeat:language',()=>{
    if(!$('missionPanel').hidden)tourRender();
    if(annual)renderChart(annual);
    $('startMission').innerHTML=copy('✦ Tour guiado NASA <span aria-hidden="true">→</span>','✦ Guided NASA tour <span aria-hidden="true">→</span>');
    $('analyzeYears').textContent=copy('◈ Analisar os 12 anos','◈ Analyze 12 years');
    $('telemetryHelp').textContent=copy(
      'Seis bandas horizontais da imagem geram notas. Quanto mais intensa a região iluminada, maior o volume relativo.',
      'Six horizontal image bands generate notes. Brighter regions contribute more to relative loudness.');
    if(annual)elText('yearChartStatus',copy('12 imagens NASA analisadas. Selecione um ano.','12 NASA images analyzed. Select a year.'));
  });
})();