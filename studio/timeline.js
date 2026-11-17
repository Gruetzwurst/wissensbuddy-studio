(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StudioTimeline=api;})(globalThis,()=>{
 'use strict';
 function validateTimeline(scenes,duration){
  if(!Number.isFinite(duration)||duration<=0||!Array.isArray(scenes)||!scenes.length||scenes.length>200)throw Error('Ungültige Videolänge oder Szenenanzahl.');
  let previous=-1;
  for(const scene of scenes){
   if(!scene||!Number.isFinite(scene.start)||scene.start<0||scene.start>=duration||scene.start<=previous)throw Error('Bildwechsel müssen aufsteigend innerhalb der Tonspur liegen.');
   previous=scene.start;
  }
  if(scenes[0].start!==0)throw Error('Das erste Bild muss bei 0 Sekunden beginnen.');
  return true;
 }
 function sceneAtTime(scenes,seconds){let scene=scenes[0];for(const item of scenes){if(item.start>seconds)break;scene=item;}return scene;}
 function retimeScenes(scenes,oldDuration,newDuration){
  validateTimeline(scenes,oldDuration);
  const result=scenes.map(scene=>({...scene,start:scene.start/oldDuration*newDuration}));validateTimeline(result,newDuration);return result;
 }
 return {validateTimeline,sceneAtTime,retimeScenes};
});
