import { chromium, devices } from 'playwright';
const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 13'] });
const p = await ctx.newPage(); await p.goto(process.argv[2]); await p.waitForTimeout(6000);
console.log(p.url(), await p.evaluate(() => [...document.querySelectorAll('input,textarea,button')].slice(0,15).map(e=>e.tagName+'.'+(e.className||'').toString().slice(0,40)+':'+(e.innerText||e.placeholder||'').slice(0,30))));
await p.screenshot({ path: process.argv[3] }); await b.close();
