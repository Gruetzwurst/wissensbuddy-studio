const {test}=require('node:test');
const assert=require('node:assert/strict');
const timeline=require('../studio/timeline.js');
test('an exact photo boundary selects the new photo and the last frame stays in the last scene',()=>{
 const scenes=[{start:0,id:'one'},{start:3,id:'two'}];
 assert.equal(timeline.validateTimeline(scenes,12.4),true);
 assert.equal(timeline.sceneAtTime(scenes,2.99).id,'one');
 assert.equal(timeline.sceneAtTime(scenes,3).id,'two');
 assert.equal(timeline.sceneAtTime(scenes,12.4).id,'two');
});
test('invalid times cannot create ambiguous or unreachable scenes',()=>{
 for(const starts of [[1],[0,0],[0,-1],[0,12.4],[0,NaN],[0,5,3]])
  assert.throws(()=>timeline.validateTimeline(starts.map(start=>({start})),12.4));
 for(const duration of [0,-1,Infinity,NaN]) assert.throws(()=>timeline.validateTimeline([{start:0}],duration));
 assert.throws(()=>timeline.validateTimeline([],10));
});
test('replacing a track scales existing photo starts without changing their order',()=>{
 const scenes=[{start:0},{start:5},{start:20}];
 assert.deepEqual(timeline.retimeScenes(scenes,40,12).map(s=>s.start),[0,1.5,6]);
 assert.equal(scenes[1].start,5);
});
test('scene lookup holds a photo across short gaps and clamps before the first scene',()=>{
 const scenes=[{start:0,id:1},{start:.025,id:2},{start:.05,id:3}];
 assert.equal(timeline.sceneAtTime(scenes,-1).id,1);
 assert.equal(timeline.sceneAtTime(scenes,.049).id,2);
});
