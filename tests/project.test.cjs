const {test}=require('node:test');const assert=require('node:assert/strict');
const {validateProject}=require('../studio/project.js');
const audio={id:'test-voice',name:'voice.wav',mime:'audio/wav',dataUrl:'data:audio/wav;base64,UklGRg=='};
function project(){return {version:5,topic:'Meine Frage',script:'Hallo',duration:12.4,audio:{...audio},scenes:[{start:0,headline:'Hallo',caption:'',bg:'photo',pose:'front',image:{name:'photo.png',source:'data:image/png;base64,aGVsbG8='}},{start:3,headline:'Weiter',caption:'',bg:'plain',pose:'front',image:null}],lipSync:{audioId:audio.id,method:'rhubarb-import',mouthCues:[{start:.2,end:1,value:'B'}]},options:{subtitles:false,intro:false}};}
test('a saved project retains its track, photos, timing and attached mouth data',()=>{
 const result=validateProject(JSON.parse(JSON.stringify(project())));
 assert.equal(result.audio.dataUrl,'data:audio/wav;base64,UklGRg==');assert.equal(result.scenes[1].start,3);assert.equal(result.scenes[0].image.source,'data:image/png;base64,aGVsbG8=');assert.equal(result.lipSync.mouthCues[0].value,'B');assert.equal(result.options.subtitles,false);
});
test('legacy projects migrate fractional scene positions into seconds',()=>{
 const result=validateProject({version:4,topic:'Alt',duration:50,scenes:[{at:0,headline:'A'},{at:.2,headline:'B'}]});
 assert.equal(result.version,5);assert.deepEqual(result.scenes.map(s=>s.start),[0,10]);assert.equal(result.audio,null);
});
test('bad projects cannot replace working state',()=>{
 for(const mutate of [p=>p.scenes[1].start=0,p=>p.audio.dataUrl='https://example.com/voice.wav',p=>p.scenes[0].image.source='data:image/svg+xml;base64,abc',p=>p.lipSync.audioId='other',p=>p.duration=0,p=>p.version=6,p=>p.scenes=[]]){
  const p=project();mutate(p);assert.throws(()=>validateProject(p));
 }
});
test('validation produces independent normalized data without retaining arbitrary properties',()=>{
 const p=project();p.scenes[0].extra='ignore';const result=validateProject(p);p.scenes[0].headline='Changed';assert.equal(result.scenes[0].headline,'Hallo');assert.equal(result.scenes[0].extra,undefined);
});
