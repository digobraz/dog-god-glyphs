import { chromium } from 'playwright';
const D = process.argv[2];
const b = await chromium.launch();
const errs = [];
for (const [name, w, h] of [['m', 390, 844], ['pc', 1477, 724]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error') errs.push(name + ' ' + m.text().slice(0, 200)); });
  p.on('pageerror', e => errs.push(name + ' PAGEERR ' + e.message.slice(0, 200)));
  p.on('request', r => { if (r.method() !== 'GET' && !r.url().includes('posthog')) errs.push(name + ' REQ ' + r.method() + ' ' + r.url().slice(0, 120)); });
  await p.goto('http://localhost:5192/magnet/ainubis', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  console.log(name, 'url', p.url());
  if (name === 'm') { await p.click('.akv-mtoggle').catch(() => {}); await p.waitForTimeout(800); }
  await p.screenshot({ path: `${D}/${name}-1-list.png` });
  const cards = await p.$$eval('.akv-zv', els => els.map(e => [e.dataset.zid, e.classList.contains('akv-zv--locked')]));
  console.log(name, 'cards', cards.length, JSON.stringify(cards.slice(0, 3)), JSON.stringify(cards.filter(c => c[1]).slice(0, 2)));
  // scroll list down to see a locked card
  await p.evaluate(() => { const l = document.querySelector('.akv-list'); l.scrollTop = 1400; });
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${D}/${name}-2-locked-scroll.png` });
  // tap locked
  const lk = await p.$('.akv-zv--locked .zv-read');
  if (lk) { await lk.scrollIntoViewIfNeeded(); await lk.click(); await p.waitForTimeout(500); await p.screenshot({ path: `${D}/${name}-3-popup-locked.png` }); await p.click('.mgp-ghost'); }
  // open free
  await p.evaluate(() => { const l = document.querySelector('.akv-list'); l.scrollTop = 0; });
  const fr = await p.$('.akv-zv:not(.akv-zv--locked) .zv-read');
  if (fr) { await fr.click(); await p.waitForTimeout(1500); console.log(name, 'url after free', p.url()); await p.screenshot({ path: `${D}/${name}-4-free-open.png` });
    await p.click('.zv-act[data-k="like"]').catch(()=>{}); await p.waitForTimeout(400); await p.screenshot({ path: `${D}/${name}-5-like-popup.png` }); }
  await ctx.close();
}
console.log(errs.join('\n'));
await b.close();
