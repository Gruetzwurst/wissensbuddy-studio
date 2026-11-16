// 1:1 aus index.html v8 extrahiert; bereits bestehende Funktion.
function drawMouth(g,shape,mx,my){
 const dark='#171917',tongue='#f37872';g.lineCap='round';g.lineJoin='round';
 if(shape==='X'||shape==='A'){
   g.strokeStyle=dark;g.lineWidth=2.6;g.beginPath();g.moveTo(mx-9,my);g.quadraticCurveTo(mx,my+7,mx+9,my);g.stroke();return;
 }
 if(shape==='B'){g.fillStyle=dark;g.beginPath();g.ellipse(mx,my+1,10,5,0,0,Math.PI*2);g.fill();return;}
 if(shape==='C'){g.fillStyle=dark;g.beginPath();g.ellipse(mx,my+2,11,9,0,0,Math.PI*2);g.fill();g.fillStyle=tongue;g.beginPath();g.ellipse(mx,my+7,6,2.5,0,0,Math.PI*2);g.fill();return;}
 if(shape==='D'){g.fillStyle=dark;g.beginPath();g.ellipse(mx,my+2,10,14,0,0,Math.PI*2);g.fill();g.fillStyle=tongue;g.beginPath();g.ellipse(mx,my+11,5,2,0,0,Math.PI*2);g.fill();return;}
 if(shape==='E'){g.fillStyle=dark;g.beginPath();g.ellipse(mx,my+2,7,13,0,0,Math.PI*2);g.fill();return;}
 if(shape==='F'){g.fillStyle=dark;g.beginPath();g.ellipse(mx,my+3,13,9,0,0,Math.PI*2);g.fill();g.fillStyle='#fff';g.fillRect(mx-11,my-1,22,5);return;}
 if(shape==='G'){g.fillStyle=dark;g.beginPath();g.ellipse(mx,my+1,12,5,0,0,Math.PI*2);g.fill();g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(mx-10,my-1);g.lineTo(mx+10,my-1);g.stroke();return;}
 drawMouth(g,'X',mx,my);
}
