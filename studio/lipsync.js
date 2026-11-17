(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StudioLipSync=api;})(globalThis,()=>{
 'use strict';
 function validateCues(cues,duration){
  if(!Number.isFinite(duration)||duration<=0||!Array.isArray(cues)||cues.length>100000)throw Error('Ungültige Munddaten.');
  let previous=0;
  return cues.map(c=>{
   if(!c||!Number.isFinite(c.start)||!Number.isFinite(c.end)||c.start<previous||c.end<=c.start||c.end>duration+.001||!['A','B','C','D','E','F','G','H','X'].includes(c.value))throw Error('Munddaten passen nicht zur Tonspur oder enthalten ungültige Zeiten.');
   previous=c.end;return {start:c.start,end:c.end,value:c.value};
  });
 }
 function mouthAtTime(cues,time){
  let lo=0,hi=cues.length-1;
  while(lo<=hi){const mid=(lo+hi)>>1,c=cues[mid];if(time<c.start)hi=mid-1;else if(time>=c.end)lo=mid+1;else return c.value;}
  return 'X';
 }
 return {validateCues,mouthAtTime};
});
