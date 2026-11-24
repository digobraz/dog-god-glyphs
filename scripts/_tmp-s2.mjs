import { chromium } from 'playwright';
const [out, name] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addInitScript(() => localStorage.setItem('dogypt_consent', JSON.stringify({analytics:false,marketing:false,v:1,ts:Date.now()})));
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8082/pack', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
const btns = await p.$$('[aria-label="Notifications"], [aria-label*="otific"], [aria-label*="pozorn"]');
console.log('btns', btns.length);
for (const x of btns) { if (await x.isVisible()) { await x.click(); break; } }
await p.waitForTimeout(1500);
const hd = await p.$('.ntf-logo-clip');
if (hd) { const par = await hd.evaluateHandle(e => e.parentElement); await par.asElement().screenshot({ path: `${out}/${name}.png` }); }
else await p.screenshot({ path: `${out}/${name}.png` });
await b.close();
