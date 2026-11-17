"""Local Firefox integration test. Uses only Python stdlib and installed geckodriver/Firefox."""
import base64,functools,http.server,json,pathlib,subprocess,tempfile,threading,time,urllib.request,urllib.error,os
ROOT=pathlib.Path(__file__).resolve().parents[1]
ARTIFACTS=pathlib.Path(os.environ.get('WB_ARTIFACTS','/tmp/wissensbuddy-browser-results'));ARTIFACTS.mkdir(exist_ok=True)
class QuietHandler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',8765),functools.partial(QuietHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
log=open(ARTIFACTS/'geckodriver.log','w')
driver=subprocess.Popen(['geckodriver','--host','127.0.0.1','--port','4444'],stdout=log,stderr=log)
base='http://127.0.0.1:4444'
def req(path,data=None,method=None):
 r=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,headers={'Content-Type':'application/json'},method=method)
 try:return json.load(urllib.request.urlopen(r,timeout=60))['value']
 except urllib.error.HTTPError as e:raise AssertionError(e.read().decode())
def wait(fn,seconds=15):
 deadline=time.monotonic()+seconds
 while time.monotonic()<deadline:
  try:
   result=fn()
   if result:return result
  except (OSError,AssertionError):pass
  time.sleep(.2)
 raise AssertionError('Timed out waiting for browser state')
sid=None
try:
 wait(lambda:req('/status'))
 result=req('/session',{'capabilities':{'alwaysMatch':{'browserName':'firefox','moz:firefoxOptions':{'args':['-headless']}}}})
 sid=result['sessionId'];base+='/session/'+sid
 print('Firefox',result['capabilities']['browserVersion'],flush=True)
 def js(s):return req('/execute/sync',{'script':'return window.eval(arguments[0])','args':['(function(){'+s+'})()']})
 def element(id):return req('/element',{'using':'css selector','value':'#'+id})['element-6066-11e4-a52e-4f735466cecf']
 def click(id):req('/element/'+element(id)+'/click',{})
 def upload(id,path):req('/element/'+element(id)+'/value',{'text':str(path)})
 req('/url',{'url':'http://127.0.0.1:8765/'})
 wait(lambda:js("return document.querySelectorAll('.scene-item').length>0"))
 assert js("return !!document.getElementById('sceneStart')"),'Missing scene timing control'
 print('Timing control exists',flush=True)
 js("window.testErrors=[];addEventListener('error',e=>testErrors.push(e.message));addEventListener('unhandledrejection',e=>testErrors.push(String(e.reason)))")
 def upload_url(id,url,name,mime):
  js("return fetch("+json.dumps(url)+").then(r=>r.blob()).then(b=>{const dt=new DataTransfer();dt.items.add(new File([b],"+json.dumps(name)+",{type:"+json.dumps(mime)+"}));const el=document.getElementById("+json.dumps(id)+");el.files=dt.files;el.dispatchEvent(new Event('change',{bubbles:true}));return true;})")
 def input_value(id,value):
  js("document.getElementById("+json.dumps(id)+").value="+json.dumps(str(value))+";document.getElementById("+json.dumps(id)+").dispatchEvent(new Event('change',{bubbles:true}));")
 click('newProject')
 assert js("return layouts.length===1 && !audioAsset")
 upload_url('voice','demo/wissensbuddy-sprechtest.wav','meine-aufnahme.wav','audio/wav')
 wait(lambda:js("return !mediaBusy"))
 state=js("return {duration:totalDuration(),hasAudio:!!audioAsset,status:document.getElementById('status').textContent}")
 assert state['hasAudio'] and abs(state['duration']-6.85)<.05,state
 print('Audio import and duration:',state,flush=True)
 upload_url('sceneFile','assets/front.png','mein-foto.png','image/png');wait(lambda:js("return !mediaBusy"))
 assert js("return scenePhotos.size===1"),'Photo not loaded'
 click('addScene');input_value('sceneStart',1.5)
 assert js("return layouts.length===2 && layouts[1].start===1.5")
 input_value('sceneStart',0)
 assert js("return layouts[1].start===1.5"),'Invalid timing changed scene'
 print('Photo import, add scene, timing and invalid-time rollback: PASS',flush=True)
 js("const el=document.getElementById('seek');el.value=1.5;el.dispatchEvent(new Event('input',{bubbles:true}));")
 assert js("return elapsed===1.5 && StudioTimeline.sceneAtTime(layouts,elapsed)===layouts[1]")
 # Import known supplied demo data, explicitly not an automatic analysis.
 js("document.getElementById('advanced').open=true")
 upload_url('cuesFile','demo/beispiel-mouth-cues-NICHT-RHUBARB.json','munddaten.json','application/json');wait(lambda:js("return !mediaBusy"))
 assert js("return mouthCues.length===28 && projectLipSync.audioId===audioAsset.id")
 js("window.testAudioId=audioAsset.id")
 click('demoLip');wait(lambda:js("return demoActive && demoAudio.currentTime>.3"))
 click('stop')
 assert js("return audioAsset.id===testAudioId && mouthCues.length===28"),'Demo destroyed user media'
 print('Imported cues and non-destructive demo: PASS',flush=True)
 # Intercept downloads in the test only, avoiding desktop prompts.
 js("window.testBlobs=new Map();window.testDownloads=[];const original=URL.createObjectURL.bind(URL);URL.createObjectURL=b=>{const u=original(b);testBlobs.set(u,b);return u;};HTMLAnchorElement.prototype.click=function(){testDownloads.push({name:this.download,blob:testBlobs.get(this.href)});};")
 click('saveProject')
 assert js("return testDownloads.length===1")
 js("return testDownloads[0].blob.text().then(t=>{window.testSaved=JSON.parse(t);return true})")
 assert js("return testSaved.audio.dataUrl.length>1000 && testSaved.scenes[0].image && testSaved.scenes[1].start===1.5")
 click('newProject')
 js("const dt=new DataTransfer();dt.items.add(new File([JSON.stringify(testSaved)],'projekt.json',{type:'application/json'}));document.getElementById('loadProject').files=dt.files;document.getElementById('loadProject').dispatchEvent(new Event('change'));")
 wait(lambda:js("return !mediaBusy"))
 assert js("return audioAsset?.id===testAudioId && scenePhotos.size===1 && layouts[1].start===1.5 && mouthCues.length===28"),'Project roundtrip failed'
 js("const bad=structuredClone(testSaved);bad.topic='MUST NOT REPLACE';bad.scenes[0].image.source='data:image/png;base64,YmFk';const dt=new DataTransfer();dt.items.add(new File([JSON.stringify(bad)],'bad.json',{type:'application/json'}));document.getElementById('loadProject').files=dt.files;document.getElementById('loadProject').dispatchEvent(new Event('change'));")
 wait(lambda:js("return !mediaBusy"))
 assert js("return document.getElementById('topic').value!=='MUST NOT REPLACE' && audioAsset.id===testAudioId && scenePhotos.size===1"),'Bad media destroyed project'
 print('Project save/reopen with audio and photos, corrupt-media rollback: PASS',flush=True)
 click('preview');wait(lambda:js("return running && audio.currentTime>.3"))
 assert js("return cueAt(.3)==='C' && cueAt(.5)==='B' && cueAt(0)==='X'")
 click('stop')
 js("window.scrollTo(0,0)")
 (ARTIFACTS/'preview.png').write_bytes(base64.b64decode(req('/screenshot')))
 # A replacement recording must invalidate previous imported mouth data.
 upload_url('voice','demo/wissensbuddy-sprechtest.wav','neue-aufnahme.wav','audio/wav');wait(lambda:js("return !mediaBusy"))
 assert js("return audioAsset.id!==testAudioId && mouthCues.length===0 && projectLipSync===null")
 upload_url('voice','README.md','ungueltig.wav','audio/wav');wait(lambda:js("return !mediaBusy"))
 assert js("return audioAsset.name==='neue-aufnahme.wav' && !!audio"),'Invalid audio replaced good recording'
 print('Playback, cue boundaries, track replacement and invalid-audio rollback: PASS',flush=True)
 js("document.getElementById('advanced').open=true")
 click('export')
 wait(lambda:js("return !mediaBusy && testDownloads.length===2"),30)
 export=js("return {name:testDownloads[1].name,bytes:testDownloads[1].blob.size,status:document.getElementById('status').textContent}")
 assert export['bytes']>1000,export
 # Decode the exported file in Firefox, then play its video.
 decoded=js("return (async()=>{const blob=testDownloads[1].blob;const ctx=new AudioContext();try{const buffer=await ctx.decodeAudioData(await blob.arrayBuffer());let energy=0;const samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)energy+=samples[i]*samples[i];return {duration:buffer.duration,rms:Math.sqrt(energy/samples.length)};}finally{await ctx.close();}})()")
 assert abs(decoded['duration']-6.85)<.6 and decoded['rms']>.001,decoded
 video=js("return (async()=>{const video=document.createElement('video');video.muted=true;video.src=URL.createObjectURL(testDownloads[1].blob);await video.play();await new Promise(r=>setTimeout(r,500));const result={time:video.currentTime,width:video.videoWidth,height:video.videoHeight};video.pause();return result;})()")
 assert video['time']>0 and video['width']==1080 and video['height']==1920,video
 print('Export and playback:',export,decoded,video,flush=True)
 req('/window/rect',{'width':500,'height':844});js("window.scrollTo(0,0)")
 (ARTIFACTS/'narrow.png').write_bytes(base64.b64decode(req('/screenshot')))
 assert js("return testErrors.length===0"),js("return testErrors")
 print('PASS: no unhandled page errors. Narrow window screenshot is not an iPhone test.',flush=True)

finally:
 if sid:
  try:req('',method='DELETE')
  except Exception:pass
 server.shutdown();driver.terminate();driver.wait(timeout=10);log.close()
