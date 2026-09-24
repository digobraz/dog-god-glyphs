import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
const p = await ctx.newPage();
p.on('console', (m) => console.log('[console]', m.type(), m.text().slice(0, 160)));
await p.goto('http://localhost:8080/lab/heroflow', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('.hfl-fills');
await p.evaluate(() => {
  window.__msgs = [];
  window.addEventListener('message', (e) => { if (e.data?.type) window.__msgs.push(e.data.type); });
});
await p.click('text=Zmerať výplň');
await p.waitForTimeout(9000);
console.log('správy:', await p.evaluate(() => window.__msgs));
console.log('rám vo fronte:', await p.evaluate(() => document.querySelector('.hfl-probe')?.getAttribute('src') ?? 'žiadny'));
await b.close();
