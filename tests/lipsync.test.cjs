const {test}=require('node:test');const assert=require('node:assert/strict');
const lip=require('../studio/lipsync.js');
test('mouth cues follow the audio clock and close in gaps and at the end',()=>{
 const cues=lip.validateCues([{start:.2,end:.4,value:'B'},{start:.6,end:.9,value:'D'}],1);
 assert.equal(lip.mouthAtTime(cues,0),'X');assert.equal(lip.mouthAtTime(cues,.2),'B');assert.equal(lip.mouthAtTime(cues,.4),'X');assert.equal(lip.mouthAtTime(cues,.6),'D');assert.equal(lip.mouthAtTime(cues,1),'X');
});
test('overlap, out-of-track, unknown shapes and malformed cues are rejected',()=>{
 for(const cues of [[{start:0,end:2,value:'A'}],[{start:0,end:0,value:'X'}],[{start:0,end:1,value:'Z'}],[{start:0,end:.7,value:'A'},{start:.6,end:.9,value:'B'}],null])assert.throws(()=>lip.validateCues(cues,1));
});
test('imported H keeps its identity instead of silently becoming a different sound',()=>{
 assert.deepEqual(lip.validateCues([{start:0,end:1,value:'H'}],1),[{start:0,end:1,value:'H'}]);
});
