import { chromium, devices } from 'playwright';
const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 13'] });
const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await p.addInitScript(() => { window.__lt=[]; window.__ls=[]; new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push([Math.round(e.startTime),Math.round(e.duration)]))).observe({type:'longtask',buffered:true}); new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__ls.push([Math.round(e.startTime), +e.value.toFixed(3), (e.sources||[]).map(s=>s.node?.className?.toString?.().slice(0,40)).join(',')]))).observe({type:'layout-shift',buffered:true}); });
await p.goto(process.argv[2]); await p.waitForTimeout(9000);
console.log(JSON.stringify(await p.evaluate(() => ({ lt: window.__lt, ls: window.__ls, fonts: [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family).join(',') }))));
await b.close();
