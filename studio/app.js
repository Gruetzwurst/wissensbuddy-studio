

'use strict';
window.addEventListener('error', function(evt){const el=document.getElementById('status');if(el)el.textContent='Ein Fehler hat die interaktive Vorschau blockiert. Das Startbild bleibt sichtbar. Zum Testen bitte eine veröffentlichte HTTPS-Version in Safari öffnen.';});
const $=id=>document.getElementById(id);
const cv=$('video'),g=cv.getContext('2d');
let running=false,raf=0,started=0,elapsed=0,images=[],voiceUrl=null,audio=null,analyser=null,sourceNode=null,audioContext=null,destination=null,recording=false;
let stopPreview=()=>{};
const W=1080,H=1920;
const DEMO_AUDIO='demo/wissensbuddy-sprechtest.wav';
let demoActive=false,demoAudio=null,mouthCues=[],cueMode='level',audioAsset=null,projectLipSync=null,mediaBusy=false,manualDuration=50;
const SAMPLE_CUES=[
[0,.23,'X'],[.23,.48,'C'],[.48,.67,'B'],[.67,.83,'A'],[.83,1.02,'D'],[1.02,1.30,'B'],[1.30,1.48,'A'],[1.48,1.73,'C'],
[1.73,2.02,'D'],[2.02,2.30,'B'],[2.30,2.52,'C'],[2.52,2.70,'A'],[2.70,2.98,'D'],[2.98,3.20,'B'],
[3.20,3.43,'C'],[3.43,3.68,'E'],[3.68,3.95,'D'],[3.95,4.20,'B'],[4.20,4.49,'F'],[4.49,4.70,'C'],
[4.70,5.00,'D'],[5.00,5.22,'B'],[5.22,5.43,'X'],[5.43,5.70,'C'],[5.70,5.92,'A'],[5.92,6.18,'D'],[6.18,6.50,'B'],[6.50,6.85,'X']
].map(([start,end,value])=>({start,end,value}));
function cueAt(t){return StudioLipSync.mouthAtTime(demoActive?SAMPLE_CUES:mouthCues,t);}
// Sprite coordinates from the original 136 × 256 front pose.
// Only these pixels may change; glasses and the rest of the face stay intact.
const mouthArea={x:66,y:77,width:26,height:21,anchorX:79,anchorY:87.5};
function buildOriginalMouthLayers(original){
 const base=document.createElement('canvas');base.width=original.width;base.height=original.height;
 const bg=base.getContext('2d');bg.drawImage(original,0,0);
 const face=bg.getImageData(0,0,base.width,base.height);
 const sample=(x,y)=>Array.from(face.data.slice((y*base.width+x)*4,(y*base.width+x)*4+3));
 const corners=[sample(76,77),sample(91,77),sample(66,97),sample(91,97)];
 const mouth=document.createElement('canvas');mouth.width=mouthArea.width;mouth.height=mouthArea.height;
 const mg=mouth.getContext('2d');
 for(let y=mouthArea.y;y<mouthArea.y+mouthArea.height;y++){
  // The upper-left corner belongs to the glasses, not the mouth.
  const x=y===77?86:y===78?83:y===79?79:y===80?67:66;
  const width=mouthArea.x+mouthArea.width-x;
  for(let column=x;column<mouthArea.x+mouthArea.width;column++){
   const fx=(column-mouthArea.x)/(mouthArea.width-1),fy=(y-mouthArea.y)/(mouthArea.height-1);
   const index=(y*base.width+column)*4;
   for(let channel=0;channel<3;channel++){
    const top=corners[0][channel]*(1-fx)+corners[1][channel]*fx;
    const bottom=corners[2][channel]*(1-fx)+corners[3][channel]*fx;
    face.data[index+channel]=Math.round(top*(1-fy)+bottom*fy);
   }
  }
  mg.drawImage(original,x,y,width,1,x-mouthArea.x,y-mouthArea.y,width,1);
 }
 bg.putImageData(face,0,0);
 return {base,mouth};
}
function drawMouth(g,shape,mx=11,my=-40.5){
 const mouth=spriteImgs.original_mouth;if(!mouth)return;
 g.save();g.translate(mx,my);
 // All positions reshape the same original mouth, never add a second mouth.
 if(shape==='X'||shape==='A'){
  g.strokeStyle='#171917';g.lineWidth=1.8;g.lineCap='round';
  g.beginPath();g.moveTo(-10,-5);g.quadraticCurveTo(0,1,9,-7);g.stroke();
 }else{
  const sizes={B:[1,.28],C:[1,.72],D:[1,1],E:[.75,.65],F:[.5,.5],G:[.9,.3],H:[1,.75]};
  const [sx,sy]=sizes[shape]||sizes.B;
  g.scale(sx,sy);
  g.drawImage(mouth,-mouth.width/2,-mouth.height/2);
 }
 g.restore();
}
const DURATIONS={40:'00:40',50:'00:50',60:'01:00'};
const buddyAssets={
  front:'assets/front.png',
  front_nomouth:'assets/front_nomouth.png',
  front_excited:'assets/front_excited.png',
  front_question:'assets/front_question.png',
  front_surprised:'assets/front_surprised.png',
  front_laugh:'assets/front_laugh.png',
  gesture_explain:'assets/gesture_explain.png',
  gesture_point:'assets/gesture_point.png',
  gesture_present:'assets/gesture_present.png',
  gesture_thumbs:'assets/gesture_thumbs.png',
  gesture_laptop:'assets/gesture_laptop.png',
  gesture_idea:'assets/gesture_idea.png',
  gesture_think:'assets/gesture_think.png',
  gesture_whoa:'assets/gesture_whoa.png',
};
const spriteImgs={};
let spritesReady=false;

const layouts=[
  {at:0.00,headline:'Warum kacken Wombats Würfel?',caption:'Warum kacken Wombats Würfel?',bg:'meadow',pose:'front'},
  {at:0.10,headline:'JA, WIRKLICH!',caption:'Wombats produzieren tatsächlich würfelförmigen Kot.',bg:'wombat',pose:'front_excited'},
  {at:0.20,headline:'UND NEIN …',caption:'Sie haben keinen quadratischen Hintern.',bg:'wombat',pose:'front_laugh'},
  {at:0.30,headline:'IM LETZTEN DARMABSCHNITT',caption:'Die Würfel entstehen bereits im Darm.',bg:'colon',pose:'gesture_explain'},
  {at:0.40,headline:'MAL FEST, MAL FLEXIBEL',caption:'Unterschiedlich steife Bereiche formen Kanten.',bg:'colon',pose:'gesture_point'},
  {at:0.50,headline:'MUSKELN + WASSERENTZUG',caption:'Das Zusammenspiel prägt die Form.',bg:'colon',pose:'gesture_idea'},
  {at:0.60,headline:'UND WOZU?',caption:'Wombats markieren ihr Revier.',bg:'rock',pose:'front_surprised'},
  {at:0.70,headline:'KOMMUNIKATION',caption:'Der Kot liegt oft auf Steinen oder Stämmen.',bg:'rock',pose:'gesture_present'},
  {at:0.80,headline:'ROLLT NICHT SO LEICHT',caption:'Ein möglicher Vorteil der Würfelform.',bg:'rock',pose:'gesture_point'},
  {at:0.90,headline:'NATUR-BAUKLÖTZE!',caption:'Absurd? Ja. Wissenschaftlich? Auch ja.',bg:'meadow',pose:'gesture_whoa'}
];

layouts.forEach(s=>{s.start=s.at*50;delete s.at;});
function loadSprites(){
  const entries=Object.entries(buddyAssets);
  return Promise.all(entries.map(([key,src])=>new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{spriteImgs[key]=img; resolve();};
    img.onerror=()=>{resolve();};
    img.src=src;
  }))).then(()=>{spritesReady=!!spriteImgs.front;
    if(spritesReady){const layers=buildOriginalMouthLayers(spriteImgs.front);spriteImgs.front_nomouth=layers.base;spriteImgs.original_mouth=layers.mouth;}
    paint(elapsed||0); $('status').textContent=spritesReady?'Wissensbuddy-Design geladen. Tonspur und Fotos hinzufügen.':'Die Ganzkörpergrafiken konnten nicht geladen werden.';});
}
loadSprites();

function fill(c){g.fillStyle=c;g.fillRect(0,0,W,H)}
function path(points,stroke='#000',width=8){g.beginPath();g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.strokeStyle=stroke;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.stroke()}
function round(x,y,w,h,r,f){g.fillStyle=f;g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();g.fill()}
function ellipse(x,y,rx,ry,f){g.fillStyle=f;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill()}
function text(t,x,y,size=40,color='#fff',weight=800,align='center'){g.fillStyle=color;g.font=`${weight} ${size}px Inter,Segoe UI,sans-serif`;g.textAlign=align;g.textBaseline='middle';g.fillText(t,x,y)}
function wrap(t,x,y,maxW,lineH=42,color='#fff',weight=800,size=52,align='center'){g.fillStyle=color;g.font=`${weight} ${size}px Inter,Segoe UI,sans-serif`;g.textAlign=align;g.textBaseline='middle';const words=t.split(' ');let line='';let lines=[];for(const w of words){const test=(line?line+' ':'')+w; if(g.measureText(test).width>maxW && line){lines.push(line); line=w;} else line=test;} if(line)lines.push(line); const start=y-(lines.length-1)*lineH/2; lines.forEach((ln,i)=>g.fillText(ln,x,start+i*lineH));}
function wombat(x,y,s=1){g.save();g.translate(x,y);g.scale(s,s);ellipse(0,0,175,110,'#6f5d56');ellipse(-85,-20,75,55,'#6a5852');ellipse(-107,-56,28,32,'#54433d');ellipse(-55,-73,24,24,'#54433d');ellipse(-31,-28,18,15,'#2e2521');ellipse(-46,-4,26,16,'#907f76');ellipse(22,53,42,23,'#5d4c45');ellipse(104,45,35,19,'#5d4c45');ellipse(72,-41,33,23,'#6a5852');ellipse(84,-35,13,13,'#231d1a');ellipse(63,-9,10,10,'#231d1a');g.restore()}
function cube(x,y,s=1){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle='#77533d';g.beginPath();g.moveTo(-50,-30);g.lineTo(15,-55);g.lineTo(60,-22);g.lineTo(-2,4);g.closePath();g.fill();g.fillStyle='#573d2d';g.beginPath();g.moveTo(-50,-30);g.lineTo(-2,4);g.lineTo(0,65);g.lineTo(-50,34);g.closePath();g.fill();g.fillStyle='#926a4c';g.beginPath();g.moveTo(-2,4);g.lineTo(60,-22);g.lineTo(59,35);g.lineTo(0,65);g.closePath();g.fill();g.restore()}
function drawBackgroundArt(t,scene){
  const c=scene.bg;
  const grad=g.createLinearGradient(0,0,0,H);
  if(c==='colon'){grad.addColorStop(0,'#fff7ec');grad.addColorStop(1,'#dfecdc')}
  else {grad.addColorStop(0,'#d9edca');grad.addColorStop(1,'#84b88e')}
  fill(grad);
  // Echte Fotos ersetzen die frühere KI-artige Wombat- und Kotzeichnung.
  // Für diese Szene wird nur ein Bild angezeigt, das der Nutzer ausdrücklich auswählt.
  const img=scenePhotos.get(layouts.indexOf(scene));
  if(img && img.complete && img.naturalWidth){
    const target={x:0,y:330,w:W,h:1120}, scale=Math.max(target.w/img.naturalWidth,target.h/img.naturalHeight);
    const dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;
    g.save();g.beginPath();g.rect(target.x,target.y,target.w,target.h);g.clip();g.drawImage(img,target.x+(target.w-dw)/2,target.y+(target.h-dh)/2,dw,dh);g.restore();
    const shade=g.createLinearGradient(0,270,0,1500);
    shade.addColorStop(0,'rgba(14,42,25,.15)');shade.addColorStop(1,'rgba(12,52,25,.2)');
    g.fillStyle=shade;g.fillRect(0,330,W,1120);
  } else if(c==='colon'){
    round(85,530,650,650,80,'#fff5ee');
    g.strokeStyle='#cb8e82';g.lineWidth=90;g.beginPath();g.moveTo(220,1080);g.bezierCurveTo(140,855,465,850,390,675);g.bezierCurveTo(320,570,600,580,565,740);g.bezierCurveTo(530,890,715,905,605,1080);g.stroke();
    g.strokeStyle='#f5b9a6';g.lineWidth=44;g.stroke();
    text('VEREINFACHTES DARMSCHEMA',400,1240,24,'#79584f',700);
  } else {
    ellipse(850,560,215,215,'#ffffff44');ellipse(600,1070,360,170,'#bde6bc66');
    text('FOTO HINZUFÜGEN',610,990,48,'#315a3da8',800);
    text('Szene rechts auswählen und Bild hochladen',610,1062,25,'#315a3d8f',650);
  }
}
const scenePhotos=new Map();const sceneFiles=new Map();
function getAudioAmp(){
  if(!(analyser&&audio&&!audio.paused)) return 0;
  const data=new Uint8Array(analyser.fftSize); analyser.getByteTimeDomainData(data);
  let v=0; for(let i=0;i<data.length;i++) v+=(data[i]-128)**2;
  return Math.sqrt(v/data.length)/48;
}
function drawBuddy(scene,t,amp=0){
  // EIN Ganzkörper-Sprite in sämtlichen Szenen.
  // Die Posenwahl verändert Gestenindikatoren, nie die Körperform oder den Ausschnitt.
  // Die Originalfigur erscheint unverändert, solange kein Audio spricht.
  const speaking=running&&Boolean(demoActive||audio&&!audio.paused&&!audio.ended);
  // Ganzkörper immer gleich, bei Ton nur der Mundbereich ausgetauscht.
  const img=spriteImgs.front_nomouth; // One mouthless base, including closed-mouth pauses.
  if(!img)return;
  const eyeBlink=Math.sin(t*1.43)>0.996 || Math.sin(t*1.93)>.999;
  const sc=3.15,baseX=303,baseY=1250;
  g.save();g.translate(baseX,baseY);g.scale(sc,sc);
  g.drawImage(img,-img.width/2,-img.height/2);
  let shape='X';
  if(speaking){
    if(cueMode==='rhubarb'||demoActive)shape=cueAt(demoActive?demoAudio.currentTime:audio.currentTime);
    else {const v=Math.min(1,Math.max(0,amp*2.4));shape=v<.09?'X':v<.30?'B':v<.6?'C':'D';}
  }
  drawMouth(g,shape);
  // gelegentliches Blinzeln; die Brille bleibt identisch.
  if(eyeBlink){
    for(const [ex,ey] of [[-25,-61],[25,-62]]){
      g.fillStyle='#fff';g.beginPath();g.ellipse(ex,ey,10,12,0,0,Math.PI*2);g.fill();
      g.strokeStyle='#141a16';g.lineWidth=2.4;g.beginPath();g.moveTo(ex-8,ey);g.lineTo(ex+8,ey);g.stroke();
    }
  }
  g.restore();
  const key=window.selectedPose||scene.pose;
  if(key==='gesture_point'||key==='gesture_idea'){
    text('!',565,810,92,'#22a91d',1000);
  }else if(key==='front_question'||key==='gesture_think'){
    text('?',570,830,90,'#13522b',1000);
  }else if(key==='gesture_whoa'||key==='front_laugh'){
    text('✦',555,835,74,'#2cb526',900);
  }
}
function sceneByProgress(p){return StudioTimeline.sceneAtTime(layouts,p*totalDuration());}
function paint(time){
  const dur=totalDuration();
  const p=Math.min(1,Math.max(0,time/dur));
  const scene=StudioTimeline.sceneAtTime(layouts,time);
  drawBackgroundArt(time,scene);

  if(layouts.indexOf(scene)===0 && scene.headline.trim() && $('subtitles').checked){
    // The opening scene follows the user's reference mockup: sky, speech bubble, and mascot beside wombat.
    round(410,115,620,465,110,'#fffde9');
    g.strokeStyle='#13221a';g.lineWidth=15;g.beginPath();g.moveTo(500,128);g.lineTo(935,128);g.arcTo(1017,128,1017,210,82);g.lineTo(1017,486);g.arcTo(1017,568,935,568,82);g.lineTo(500,568);g.arcTo(423,568,423,491,77);g.lineTo(423,208);g.arcTo(423,128,500,128,80);g.closePath();g.stroke();
    g.beginPath();g.moveTo(625,564);g.lineTo(570,660);g.lineTo(715,564);g.fillStyle='#fffde9';g.fill();
    if($('subtitles').checked){
      const raw=scene.headline.trim();
      if(raw==='Warum kacken Wombats Würfel?'){
        text('Warum kacken',720,240,61,'#09150d',1000);
        text('Wombats',720,355,95,'#0c561a',1000);
        text('Würfel?',720,464,95,'#0c561a',1000);
      }else wrap(raw||'Warum Wombats?',720,335,570,76,'#114923',950,61);
    }
  }else{
    const overlay=g.createLinearGradient(0,0,0,470);overlay.addColorStop(0,'#093e2ddf');overlay.addColorStop(1,'#093e2d00');if($('subtitles').checked && (scene.headline.trim()||scene.caption.trim())){g.fillStyle=overlay;g.fillRect(0,0,W,470);}
    if($('subtitles').checked){if(scene.headline.trim())wrap(scene.headline,540,190,920,68,'#fff',900,62);if(scene.caption.trim()){round(70,278,940,102,23,'rgba(18,76,52,.78)');wrap(scene.caption,540,329,860,38,'#f2fff3',650,39);}}
  }
  drawBuddy(scene,time,getAudioAmp());
  if($('intro').checked){round(65,1750,950,95,22,'#153e2ce8'); text('WISSENSBUDDY  •  NATUR & WISSEN',540,1808,40,'#eefef1',800);}
  round(0,1903,W*p,17,0,'#43da6e');
}
function clock(s){s=Math.floor(s);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function totalDuration(){return demoActive?6.85:Number($('duration').value);}
function updateHud(t){const dur=totalDuration();$('currentTime').textContent=clock(t);$('totalTime').textContent=clock(dur);$('progress').style.width=(100*Math.min(t,dur)/dur)+'%';$('seek').max=dur;$('seek').value=t;}
function resetAudio(){
 if(audio){audio.pause();audio.onended=null;audio=null;}
 if(audioContext){audioContext.close().catch(()=>{});audioContext=null;}
 analyser=null;sourceNode=null;destination=null;
}
function setBusy(value){
 mediaBusy=value;
 document.querySelectorAll('main button,main input,main select,main textarea,.pose,.scene-item').forEach(el=>{if(el.id!=='stop')el.disabled=value;});
 if(!value){$('duration').disabled=!!audioAsset;$('removeAudio').disabled=!audioAsset;$('sceneStart').disabled=selectedSceneIndex===0;$('deleteScene').disabled=layouts.length===1;}
}
function fileDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Datei konnte nicht gelesen werden.'));reader.readAsDataURL(file);});}
function loadImage(source){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Bild konnte nicht geladen werden.'));image.src=source;});}
async function prepareAudio(asset){
 const bytes=await (await fetch(asset.dataUrl)).arrayBuffer();
 const Context=window.AudioContext||window.webkitAudioContext;
 if(!Context)throw Error('Dieser Browser kann die Tonspur nicht prüfen.');
 const context=new Context();
 let decoded;
 try{decoded=await context.decodeAudioData(bytes);}finally{await context.close();}
 if(!Number.isFinite(decoded.duration)||decoded.duration<=0||decoded.duration>600)throw Error('Bitte eine Aufnahme mit höchstens 10 Minuten verwenden.');
 const candidate=new Audio();candidate.preload='auto';
 await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{candidate.removeAttribute('src');candidate.load();reject(Error('Tonspur konnte nicht rechtzeitig geladen werden.'));},15000);
  candidate.onloadedmetadata=()=>{clearTimeout(timer);candidate.onloadedmetadata=null;candidate.onerror=null;resolve();};
  candidate.onerror=()=>{clearTimeout(timer);reject(Error('Dieses Audioformat wird hier nicht unterstützt.'));};
  candidate.src=asset.dataUrl;
 });
 const duration=Number.isFinite(candidate.duration)?candidate.duration:decoded.duration;
 if(Math.abs(duration-decoded.duration)>.25)throw Error('Die Länge dieser Audiodatei konnte nicht zuverlässig bestimmt werden.');
 return {element:candidate,duration};
}
function clearMouthData(){mouthCues=[];cueMode='level';projectLipSync=null;}
function refreshAudioStatus(){
 $('audioStatus').textContent=audioAsset?audioAsset.name+' · '+totalDuration().toFixed(2)+' Sekunden · bleibt im Browser.':'Keine Tonspur geladen. Deine Dateien bleiben in diesem Browser.';
 $('duration').disabled=!!audioAsset;$('removeAudio').disabled=!audioAsset;
 $('lipStatus').textContent=projectLipSync?mouthCues.length+' importierte Mundstellungen für diese Tonspur.':'Vereinfachte Mundbewegung nach Lautstärke. Automatische Lauterkennung ist noch nicht eingebaut.';
}
function attachAudio(prepared,asset){
 resetAudio();audio=prepared.element;audioAsset=asset;
 audio.onended=()=>{if(running&&!demoActive)finishPlayback();};
}
$('voice').addEventListener('change',async()=>{
 const file=$('voice').files[0];if(!file||mediaBusy||recording)return;
 stop();setBusy(true);
 try{
  if(file.size>40*1024*1024)throw Error('Die Tonspur darf höchstens 40 MB groß sein.');
  const asset={id:'audio-'+crypto.randomUUID(),name:file.name,mime:file.type||'application/octet-stream',dataUrl:await fileDataUrl(file)};
  const prepared=await prepareAudio(asset);
  const next=StudioTimeline.retimeScenes(layouts,Number($('duration').value),prepared.duration);
  attachAudio(prepared,asset);layouts.splice(0,layouts.length,...next);$('duration').value=String(prepared.duration);manualDuration=prepared.duration;clearMouthData();
  selectedSceneIndex=0;elapsed=0;syncSceneEditor();buildScenes();refreshAudioStatus();paint(0);updateHud(0);
  $('status').textContent='Tonspur geladen. Bildwechsel wurden proportional an die neue Länge angepasst.';
 }catch(err){$('status').textContent='Tonspur nicht geändert: '+err.message;}
 finally{setBusy(false);$('voice').value='';}
});
$('removeAudio').onclick=()=>{if(mediaBusy||recording)return;stop();resetAudio();audioAsset=null;clearMouthData();refreshAudioStatus();paint(elapsed);};
function stop(){
 running=false;cancelAnimationFrame(raf);
 if(audio)audio.pause();if(demoAudio){demoAudio.pause();demoAudio=null;}demoActive=false;
 if('speechSynthesis' in window)speechSynthesis.cancel();
 $('preview').textContent='▶';
 if(recording&&window.stopRecord)window.stopRecord();
 paint(elapsed);updateHud(elapsed);
 if(!recording)$('status').textContent='Vorschau gestoppt.';
}
stopPreview=stop;
async function setupAudio(){
 if(!audio)return;
 const Context=window.AudioContext||window.webkitAudioContext;
 if(!Context)throw Error('Audioverarbeitung ist in diesem Browser nicht verfügbar.');
 if(!audioContext)audioContext=new Context();
 if(!sourceNode){
  sourceNode=audioContext.createMediaElementSource(audio);analyser=audioContext.createAnalyser();analyser.fftSize=512;destination=audioContext.createMediaStreamDestination();
  sourceNode.connect(analyser);analyser.connect(audioContext.destination);analyser.connect(destination);
 }
 if(audioContext.state==='suspended')await audioContext.resume();
}
function finishPlayback(){
 const dur=totalDuration();
 running=false;cancelAnimationFrame(raf);if(audio)audio.pause();if(demoAudio)demoAudio.pause();
 const wasDemo=demoActive;demoActive=false;demoAudio=null;elapsed=wasDemo?0:dur;
 $('preview').textContent='▶';paint(elapsed);updateHud(elapsed);
 if(recording&&window.stopRecord)window.stopRecord();
 if(wasDemo)refreshAudioStatus();
 if(!recording)$('status').textContent=wasDemo?'Sprechtest beendet. Deine Tonspur und Munddaten bleiben erhalten.':'Vorschau beendet.';
}
function animate(now){
 if(!running)return;
 const current=demoActive?demoAudio:audio;
 elapsed=Math.min(totalDuration(),current?current.currentTime:(now-started)/1000);
 paint(elapsed);updateHud(elapsed);
 if(elapsed>=totalDuration()||current?.ended){finishPlayback();return;}
 raf=requestAnimationFrame(animate);
}
async function preview(){
 if(mediaBusy||recording)return;
 stop();elapsed=0;paint(0);updateHud(0);
 const current=audio;
 try{
  if(current){current.currentTime=0;const ready=setupAudio();const played=current.play();await Promise.all([ready,played]);}
  running=true;started=performance.now();$('preview').textContent='↻';$('status').textContent='Vorschau läuft.';raf=requestAnimationFrame(animate);
 }catch(err){stop();$('status').textContent='Wiedergabe nicht gestartet: '+err.message;}
}
async function playLipDemo(){
 if(mediaBusy||recording)return;
 stop();demoAudio=new Audio(DEMO_AUDIO);demoActive=true;elapsed=0;
 const current=demoAudio;
 current.onended=()=>{if(demoActive)finishPlayback();};
 try{await current.play();if(demoAudio!==current)return;running=true;started=performance.now();$('lipStatus').textContent='Sprechtest mit vorgegebenen Demo-Munddaten; keine automatische Analyse.';raf=requestAnimationFrame(animate);}
 catch(err){stop();$('lipStatus').textContent='Sprechtest konnte nicht gestartet werden: '+err.message;}
}
$('demoLip').onclick=playLipDemo;
$('resetLip').onclick=()=>{if(mediaBusy||recording)return;stop();clearMouthData();refreshAudioStatus();paint(elapsed);};
$('cuesFile').onchange=async()=>{
 const file=$('cuesFile').files[0];if(!file||mediaBusy||recording)return;
 stop();setBusy(true);
 try{
  if(!audioAsset)throw Error('Bitte zuerst die zugehörige Tonspur laden.');
  if(file.size>8*1024*1024)throw Error('Munddaten-Datei ist zu groß.');
  const raw=JSON.parse(await file.text());const parsed=StudioLipSync.validateCues(raw.mouthCues,totalDuration());
  mouthCues=parsed;cueMode='rhubarb';projectLipSync={audioId:audioAsset.id,method:'rhubarb-import',mouthCues:parsed};refreshAudioStatus();
 }catch(err){$('lipStatus').textContent='Munddaten nicht geändert: '+err.message;}
 finally{setBusy(false);$('cuesFile').value='';}
};
$('preview').onclick=preview;$('stop').onclick=stop;
$('seek').oninput=()=>{if(mediaBusy||recording)return;const target=Number($('seek').value);stop();elapsed=Math.min(totalDuration(),Math.max(0,target));if(audio)audio.currentTime=elapsed;paint(elapsed);updateHud(elapsed);};
$('duration').onchange=()=>{
 if(audioAsset)return;
 stop();try{const next=StudioTimeline.retimeScenes(layouts,manualDuration,Number($('duration').value));layouts.splice(0,layouts.length,...next);manualDuration=Number($('duration').value);}
 catch(err){$('duration').value=String(manualDuration);$('status').textContent=err.message;}
 elapsed=0;syncSceneEditor();buildScenes();paint(0);updateHud(0);
};
$('browserVoice').onclick=()=>{stop();if(!('speechSynthesis' in window)){alert('Dieser Browser unterstützt keine Vorlesefunktion.');return;}const u=new SpeechSynthesisUtterance($('script').value);u.lang='de-DE';speechSynthesis.speak(u);$('status').textContent='Textprobe mit Browserstimme. Für Mundbewegungen und Export bitte eine Aufnahme hochladen.';};
$('export').onclick=async()=>{
 if(recording||mediaBusy)return;
 if(!cv.captureStream||typeof MediaRecorder==='undefined'){alert('Direkter Videoexport wird in diesem Browser nicht unterstützt.');return;}
 const types=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp8,opus','video/webm'];
 const mime=types.find(t=>MediaRecorder.isTypeSupported(t));if(!mime){alert('Kein unterstütztes Aufnahmeformat verfügbar.');return;}
 stop();elapsed=0;paint(0);updateHud(0);setBusy(true);
 let stream,rec,failed=false;const chunks=[];
 const cleanup=()=>{if(stream)stream.getTracks().forEach(t=>t.stop());recording=false;setBusy(false);};
 try{
  if(audio){audio.currentTime=0;await setupAudio();}
  stream=cv.captureStream(30);
  if(audio){const tracks=destination?.stream.getAudioTracks();if(!tracks?.length)throw Error('Die Tonspur konnte nicht für den Export verbunden werden.');tracks.forEach(track=>stream.addTrack(track.clone()));}
  rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5000000});
  rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  rec.onerror=e=>{failed=true;$('status').textContent='Export fehlgeschlagen: '+(e.error?.message||'Aufnahmefehler');if(rec.state!=='inactive')rec.stop();else cleanup();};
  rec.onstop=()=>{
   cleanup();if(failed)return;
   const type=rec.mimeType||mime,ext=type.includes('mp4')?'mp4':'webm';
   if(!chunks.length){$('status').textContent='Export fehlgeschlagen: keine Videodaten.';return;}
   downloadBlob(new Blob(chunks,{type}),'wissensbuddy-'+Date.now()+'.'+ext);
   $('status').textContent='Export gespeichert: '+ext.toUpperCase()+(audio?' mit Ton.':' ohne Ton.');
  };
  window.stopRecord=()=>{if(rec.state!=='inactive')rec.stop();};
  if(audio)await audio.play();
  rec.start(250);recording=true;running=true;started=performance.now();
  $('status').textContent='Export läuft in Echtzeit ('+totalDuration().toFixed(2)+' Sekunden). Tab geöffnet lassen; Stop beendet die Aufnahme vorzeitig.';
  raf=requestAnimationFrame(animate);
 }catch(err){failed=true;if(audio)audio.pause();if(rec&&rec.state!=='inactive')rec.stop();else cleanup();$('status').textContent='Export nicht gestartet: '+err.message;}
};
paint(0);updateHud(0);

// Studio controls – jede Videosequenz ist einzeln editierbar.
let selectedSceneIndex=0;
window.selectedPose=null;
function clearPose(){window.selectedPose=null;document.querySelectorAll('.pose').forEach(x=>x.classList.remove('selected'));}
function syncSceneEditor(){
  const scene=layouts[selectedSceneIndex];
  $('sceneCounter').textContent='Szene '+(selectedSceneIndex+1)+' von '+layouts.length;
  $('sceneStart').value=String(Number(scene.start.toFixed(3)));$('sceneStart').disabled=selectedSceneIndex===0;
  $('sceneTimingHint').textContent='Bis '+(layouts[selectedSceneIndex+1]?.start??totalDuration()).toFixed(2)+' Sekunden. Das erste Bild beginnt bei 0.';
  $('deleteScene').disabled=layouts.length===1;
  $('sceneHeadline').value=scene.headline;
  $('sceneCaption').value=scene.caption;
  $('sceneBg').value=scene.bg==='colon'?'colon':scene.bg==='plain'?'plain':'photo';
  const img=scenePhotos.get(selectedSceneIndex);
  const prev=$('sceneMediaPreview');
  if(img){prev.src=img.src;prev.classList.add('visible');} else {prev.removeAttribute('src');prev.classList.remove('visible');}
  $('sceneFile').value='';
}
function selectScene(i){
  if(recording)return;stop();selectedSceneIndex=Math.min(layouts.length-1,Math.max(0,i));
  clearPose();elapsed=layouts[selectedSceneIndex].start;
  syncSceneEditor();paint(elapsed);updateHud(elapsed);buildScenes();
  $('editStatus').textContent='Szene '+(selectedSceneIndex+1)+' wird bearbeitet.';
}
function buildScenes(){
  const root=$('scenes');root.innerHTML='';
  layouts.forEach((scene,i)=>{
    const b=document.createElement('button');b.className='scene-item'+(selectedSceneIndex===i?' active':'');b.type='button';
    const image=document.createElement('img');
    const custom=scenePhotos.get(i);image.src=custom?.src||buddyAssets.front;
    image.alt=custom?'Szenenfoto':'Wissensbuddy';
    const txt=document.createElement('span');
    const bold=document.createElement('b');bold.textContent=(i+1)+'. '+(scene.headline||'Bild '+(i+1));
    const small=document.createElement('small');small.textContent=scene.start.toFixed(2)+' s · '+(scene.caption||sceneFiles.get(i)?.name||'Foto auswählen');
    txt.append(bold,small);b.append(image,txt);b.onclick=()=>selectScene(i);root.appendChild(b);
  });
}
function buildPoses(){
  const poses=[['Erklären','gesture_explain'],['Hinweis','gesture_point'],['Präsentieren','gesture_present'],['Daumen hoch','gesture_thumbs'],['Am Laptop','gesture_laptop'],['Idee!','gesture_idea'],['Grübelnd','gesture_think'],['Whoaa!','gesture_whoa']];
  const root=$('poses');root.innerHTML='';
  poses.forEach(([label,key],i)=>{
    const b=document.createElement('button');b.type='button';b.className='pose';
    const image=document.createElement('img');image.src=buddyAssets[key];image.alt='Pose: '+label;
    const span=document.createElement('span');span.textContent=label;
    b.append(image,span);
    b.onclick=()=>{layouts[selectedSceneIndex].pose=key;window.selectedPose=key;document.querySelectorAll('.pose').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');paint(elapsed);$('editStatus').textContent='Geste gespeichert. Wissensbuddy bleibt als Ganzkörperfigur sichtbar.';};root.appendChild(b);
  });
}
$('sceneHeadline').addEventListener('input',()=>{layouts[selectedSceneIndex].headline=$('sceneHeadline').value;paint(elapsed);buildScenes();});
$('sceneCaption').addEventListener('input',()=>{layouts[selectedSceneIndex].caption=$('sceneCaption').value;paint(elapsed);buildScenes();});
$('sceneBg').addEventListener('change',()=>{layouts[selectedSceneIndex].bg=$('sceneBg').value;paint(elapsed);});
async function openScenePhoto(file,i){
 if(!file||mediaBusy||recording)return;
 stop();setBusy(true);
 try{
  if(file.size>20*1024*1024)throw Error('Bitte ein Bild unter 20 MB verwenden.');
  const raw=await fileDataUrl(file);const image=await loadImage(raw);
  // Bound project size for phone photos. The original file stays untouched.
  const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  const source=canvas.toDataURL(file.type==='image/png'?'image/png':'image/jpeg',.9);
  const ready=await loadImage(source);
  scenePhotos.set(i,ready);sceneFiles.set(i,{name:file.name,source});
  syncSceneEditor();buildScenes();paint(elapsed);$('editStatus').textContent='Bild für Szene '+(i+1)+' geladen: '+file.name;
 }catch(err){$('editStatus').textContent='Bild nicht geändert: '+err.message;}
 finally{setBusy(false);$('sceneFile').value='';}
}
$('sceneFile').onchange=()=>openScenePhoto($('sceneFile').files[0],selectedSceneIndex);
$('removeSceneImage').onclick=()=>{scenePhotos.delete(selectedSceneIndex);sceneFiles.delete(selectedSceneIndex);syncSceneEditor();buildScenes();paint(elapsed);};
$('prevScene').onclick=()=>selectScene(selectedSceneIndex-1);$('nextScene').onclick=()=>selectScene(selectedSceneIndex+1);
$('sceneStart').onchange=()=>{
 const scene=layouts[selectedSceneIndex],before=scene.start;
 try{
  stop();scene.start=Number($('sceneStart').value);StudioTimeline.validateTimeline(layouts,totalDuration());selectScene(selectedSceneIndex);
  $('editStatus').textContent='Bildwechsel gespeichert: '+scene.start.toFixed(2)+' Sekunden.';
 }catch(err){scene.start=before;syncSceneEditor();$('editStatus').textContent=err.message;}
};
$('addScene').onclick=()=>{
 if(layouts.length>=200){$('editStatus').textContent='Maximal 200 Szenen pro Projekt.';return;}
 const i=selectedSceneIndex,end=layouts[i+1]?.start??totalDuration(),start=(layouts[i].start+end)/2;
 if(end-layouts[i].start<.02){$('editStatus').textContent='Dieser Abschnitt ist zu kurz für eine weitere Szene.';return;}
 stop();
 for(let j=layouts.length-1;j>i;j--){if(scenePhotos.has(j)){scenePhotos.set(j+1,scenePhotos.get(j));scenePhotos.delete(j);}if(sceneFiles.has(j)){sceneFiles.set(j+1,sceneFiles.get(j));sceneFiles.delete(j);}}
 layouts.splice(i+1,0,{start,headline:'',caption:'',bg:'photo',pose:'front'});selectScene(i+1);
};
$('deleteScene').onclick=()=>{
 if(layouts.length===1)return;stop();const i=selectedSceneIndex;
 layouts.splice(i,1);scenePhotos.delete(i);sceneFiles.delete(i);
 for(let j=i+1;j<=layouts.length;j++){if(scenePhotos.has(j)){scenePhotos.set(j-1,scenePhotos.get(j));scenePhotos.delete(j);}if(sceneFiles.has(j)){sceneFiles.set(j-1,sceneFiles.get(j));sceneFiles.delete(j);}}
 layouts[0].start=0;selectScene(Math.min(i,layouts.length-1));
};
function snapshotProject(){
 return StudioProject.validateProject({version:5,topic:$('topic').value,script:$('script').value,duration:Number($('duration').value),audio:audioAsset,scenes:layouts.map((s,i)=>({...s,image:sceneFiles.get(i)||null})),lipSync:projectLipSync,options:{subtitles:$('subtitles').checked,intro:$('intro').checked}});
}
function downloadBlob(blob,name){
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
$('saveProject').onclick=()=>{
 if(mediaBusy||recording)return;
 try{downloadBlob(new Blob([JSON.stringify(snapshotProject())],{type:'application/json'}),'wissensbuddy-projekt.json');$('editStatus').textContent='Projekt gespeichert – inklusive Tonspur, Fotos, Bildwechseln und importierten Munddaten.';}
 catch(err){$('editStatus').textContent='Speichern fehlgeschlagen: '+err.message;}
};
$('loadProjectBtn').onclick=()=>$('loadProject').click();
async function restoreProject(raw){
 const project=StudioProject.validateProject(raw);
 const photos=new Map();
 for(let i=0;i<project.scenes.length;i++){const file=project.scenes[i].image;if(file)photos.set(i,await loadImage(file.source));}
 const prepared=project.audio?await prepareAudio(project.audio):null;
 if(prepared&&Math.abs(prepared.duration-project.duration)>.25)throw Error('Tonspur und gespeicherte Videolänge passen nicht zusammen.');
 // Commit only after all media and timings have passed validation.
 stop();resetAudio();audioAsset=null;clearMouthData();
 if(prepared)attachAudio(prepared,project.audio);
 $('topic').value=project.topic;$('script').value=project.script;$('duration').value=String(project.duration);manualDuration=project.duration;
 $('subtitles').checked=project.options.subtitles;$('intro').checked=project.options.intro;
 scenePhotos.clear();sceneFiles.clear();
 project.scenes.forEach((s,i)=>{if(s.image){scenePhotos.set(i,photos.get(i));sceneFiles.set(i,s.image);}});
 layouts.splice(0,layouts.length,...project.scenes.map(({image,...s})=>s));
 if(project.lipSync){projectLipSync=project.lipSync;mouthCues=project.lipSync.mouthCues;cueMode='rhubarb';}
 selectedSceneIndex=0;selectScene(0);refreshAudioStatus();
}
$('loadProject').onchange=async()=>{
 const file=$('loadProject').files[0];if(!file||mediaBusy||recording)return;
 stop();setBusy(true);
 try{if(file.size>100*1024*1024)throw Error('Projektdatei ist größer als 100 MB.');await restoreProject(JSON.parse(await file.text()));$('editStatus').textContent='Projekt mit Tonspur und Fotos geladen.';}
 catch(err){$('editStatus').textContent='Projekt nicht geändert: '+err.message;}
 finally{setBusy(false);$('loadProject').value='';}
};
$('newProject').onclick=()=>{
 if(mediaBusy||recording)return;
 stop();resetAudio();audioAsset=null;clearMouthData();$('voice').value='';$('cuesFile').value='';
 $('topic').value='Neues Wissensvideo';$('script').value='';scenePhotos.clear();sceneFiles.clear();
 $('duration').value='50';manualDuration=50;
 layouts.splice(0,layouts.length,{start:0,headline:'',caption:'',bg:'photo',pose:'front'});
 selectScene(0);refreshAudioStatus();$('editStatus').textContent='Leere Vorlage bereit. Tonspur laden, Foto einsetzen und weitere Szenen hinzufügen.';
};

buildScenes();buildPoses();syncSceneEditor();

$('subtitles').onchange=()=>paint(elapsed);
$('intro').onchange=()=>paint(elapsed);

$('topic').onchange=()=>{$('status').textContent='Thema geändert. Du kannst jetzt die einzelnen Szenentexte anpassen.';};

$('create').onclick=()=>preview();
$('poseLeft').onclick=()=>{$('poses').scrollBy({left:-320,behavior:'smooth'});};
$('poseRight').onclick=()=>{$('poses').scrollBy({left:320,behavior:'smooth'});};
$('navVideo').onclick=()=>document.querySelector('#mainStudio').scrollIntoView({behavior:'smooth'});
$('navStart').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
$('navMyVideos').onclick=()=>{$('status').textContent='Deine Videos findest du im Downloadordner. Projektstände über „Projekt speichern“ sichern.';};
$('navTemplates').onclick=()=>document.querySelector('#sceneEditor').scrollIntoView({behavior:'smooth'});
$('navSettings').onclick=()=>{$('advanced').open=true;$('advanced').scrollIntoView({behavior:'smooth'});};
$('help').onclick=()=>alert('Szene rechts auswählen, unten ihre Texte und ein lizenzgeprüftes Bild festlegen. Die Figur bleibt ganz. Eine durchgehende Tonspur oben laden und Bildwechsel in Sekunden festlegen. Projekt als JSON speichern und später wieder öffnen.');

refreshAudioStatus();
