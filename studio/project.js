(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./timeline.js'),require('./lipsync.js'));else root.StudioProject=factory(root.StudioTimeline,root.StudioLipSync);})(globalThis,(timeline,lip)=>{
 'use strict';
 const raster=/^data:image\/(png|jpeg|webp|avif);base64,[A-Za-z0-9+/]+={0,2}$/;
 const sound=/^data:(audio\/[\w.+-]+|video\/(mp4|webm)|application\/octet-stream)(;codecs=[\w.,-]+)?;base64,[A-Za-z0-9+/]+={0,2}$/;
 const text=(s,max)=>typeof s==='string'?s.slice(0,max):'';
 function validateProject(data){
  if(!data||![4,5].includes(data.version))throw Error('Dieses Projektformat wird nicht unterstützt.');
  const legacy=data.version===4;
  const duration=data.duration;
  if(!Array.isArray(data.scenes))throw Error('Die Szenen fehlen.');
  const scenes=data.scenes.map(s=>{
   if(!s||typeof s!=='object')throw Error('Ungültige Szene.');
   let image=null;
   if(s.image!=null){if(typeof s.image.source!=='string'||!raster.test(s.image.source))throw Error('Ungültiges Szenenbild.');image={name:text(s.image.name,255),source:s.image.source};}
   return {start:legacy?s.at*duration:s.start,headline:text(s.headline,85),caption:text(s.caption,240),bg:['photo','colon','plain','meadow','wombat','rock'].includes(s.bg)?s.bg:'plain',pose:text(s.pose,40)||'front',image};
  });
  timeline.validateTimeline(scenes,duration);
  let audio=null;
  if(!legacy&&data.audio!=null){
   const a=data.audio;
   if(typeof a.id!=='string'||!a.id||typeof a.dataUrl!=='string'||!sound.test(a.dataUrl))throw Error('Ungültige Tonspur.');
   audio={id:text(a.id,100),name:text(a.name,255),mime:text(a.mime,100),dataUrl:a.dataUrl};
  }
  let lipSync=null;
  if(!legacy&&data.lipSync!=null){
   const l=data.lipSync;
   if(!audio||l.audioId!==audio.id||!['rhubarb-import','phonetic'].includes(l.method))throw Error('Die Munddaten gehören nicht zu dieser Tonspur.');
   lipSync={audioId:audio.id,method:l.method,mouthCues:lip.validateCues(l.mouthCues,duration)};
  }
  return {version:5,topic:text(data.topic,500),script:text(data.script,100000),duration,audio,scenes,lipSync,options:{subtitles:data.options?.subtitles!==false,intro:data.options?.intro!==false}};
 }
 return {validateProject};
});
