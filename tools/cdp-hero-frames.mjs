import { writeFile } from 'node:fs/promises';
const width=1440,height=900;
const targets=await (await fetch('http://127.0.0.1:9222/json/list')).json();
const target=targets.find(t=>t.type==='page');
const ws=new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
let seq=0; const pending=new Map(); const events=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data); if(m.id&&pending.has(m.id)){const {r,j}=pending.get(m.id);pending.delete(m.id);m.error?j(new Error(JSON.stringify(m.error))):r(m.result);} else if(m.method&&events.has(m.method)){const l=events.get(m.method);events.delete(m.method);l.forEach(f=>f(m.params));}};
const send=(method,params={})=>new Promise((r,j)=>{const id=++seq;pending.set(id,{r,j});ws.send(JSON.stringify({id,method,params}));});
const once=method=>new Promise(r=>{if(!events.has(method))events.set(method,[]);events.get(method).push(r);});
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
const loaded=once('Page.loadEventFired'); await send('Page.navigate',{url:'http://127.0.0.1:8123/'}); await Promise.race([loaded,new Promise(r=>setTimeout(r,10000))]);
await new Promise(r=>setTimeout(r,2500));
const info=await send('Runtime.evaluate',{expression:`(()=>{const imgs=[...document.querySelectorAll('.hero-slide img')];return {slides:document.querySelectorAll('.hero-slide').length,imgs:imgs.map(i=>({src:i.currentSrc||i.src,nw:i.naturalWidth,complete:i.complete})),anims:document.getAnimations().length,docW:document.documentElement.scrollWidth,viewW:innerWidth};})()`,returnByValue:true});
console.log(JSON.stringify(info.result.value,null,2));
const times=[0,5.7,11.4,17.1,22.8,28.5,34.2,40,43.5];
for(const t of times){
  await send('Runtime.evaluate',{expression:`(()=>{document.getAnimations().forEach(a=>{a.pause();a.currentTime=${t*1000};});window.scrollTo(0,0);})()`});
  await new Promise(r=>setTimeout(r,250));
  const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true});
  await writeFile(`site\\screenshots\\hero-frame-${String(t).replace('.','_')}.png`,Buffer.from(shot.data,'base64'));
  console.log('frame',t);
}
ws.close();
