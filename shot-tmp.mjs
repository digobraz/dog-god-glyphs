import { chromium } from 'playwright';
const [,, url, out, act] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto(url, { waitUntil: 'networkidle' }).catch(()=>{});
await p.waitForTimeout(2500);
if (act === 'drawer') { await p.locator('.me-arc').first().click().catch(e=>console.log('noarc')); await p.waitForTimeout(800); }
await p.screenshot({ path: out, fullPage: true });
await b.close();
