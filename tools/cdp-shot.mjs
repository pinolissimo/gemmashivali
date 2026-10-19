import { writeFile } from 'node:fs/promises';

const [url, out, widthArg = '1440', heightArg = '900', mobileArg = 'false', fullArg = 'true'] = process.argv.slice(2);
const width = Number(widthArg), height = Number(heightArg), mobile = mobileArg === 'true', full = fullArg !== 'false';

const targets = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const target = targets.find(t => t.type === 'page');
if (!target) throw new Error('No page target');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let seq = 0; const pending = new Map(); const events = new Map();
ws.onmessage = event => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) { const { resolve, reject } = pending.get(msg.id); pending.delete(msg.id); msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result); }
  else if (msg.method && events.has(msg.method)) { const list = events.get(msg.method); events.delete(msg.method); for (const r of list) r(msg.params); }
};
function send(method, params = {}) { return new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); }); }
function once(method) { return new Promise(resolve => { if (!events.has(method)) events.set(method, []); events.get(method).push(resolve); }); }
await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height });
if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
const loaded = once('Page.loadEventFired');
await send('Page.navigate', { url });
await Promise.race([loaded, new Promise(r => setTimeout(r, 10000))]);
await new Promise(r => setTimeout(r, 1200));
const metrics = await send('Page.getLayoutMetrics');
const cs = metrics.cssContentSize || metrics.contentSize;
const clip = full ? { x: 0, y: 0, width: Math.ceil(cs.width), height: Math.ceil(cs.height), scale: 1 } : undefined;
const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: full, fromSurface: true, ...(clip ? { clip } : {}) });
await writeFile(out, Buffer.from(shot.data, 'base64'));
console.log(JSON.stringify({ out, width: clip?.width ?? width, height: clip?.height ?? height }));
ws.close();
