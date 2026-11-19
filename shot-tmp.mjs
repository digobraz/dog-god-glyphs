import { chromium } from 'playwright';
const [,, url, out, act] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
p.on('pageerror', e => console.log('ERR', e.message));
await p.addInitScript(() => { try { localStorage.setItem('cookie-consent','{"necessary":true}'); } catch {} });
await p.goto(url, { waitUntil: 'networkidle' }).catch(()=>{});
await p.waitForTimeout(2500);
await p.getByText('Only necessary').click({timeout:1500}).catch(()=>{});
await p.addStyleTag({ content: '[class*="DevNav"],.dev-nav{display:none!important}' });
for (const a of (act||'').split(',')) {
  if (a==='drawer') { await p.locator('.me-arc .ad').first().click({force:true}).catch(e=>console.log('noarc')); }
  if (a==='learner') { await p.locator('.me-lv .rk').nth(2).click().catch(e=>console.log('nolearn')); }
  await p.waitForTimeout(900);
}
await p.screenshot({ path: out, fullPage: true });
await b.close();
