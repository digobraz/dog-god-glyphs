import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 500, height: 1100 } });
await p.goto('http://localhost:5178/pack/add/trip', { waitUntil: 'networkidle' }).catch(()=>{});
await p.getByText('ONLY NECESSARY').click({ timeout: 3000 }).catch(()=>{});
await p.waitForTimeout(1500);
const r = await p.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('button, .pk-pill, [class*="chip"], [class*="pill"]')) {
    const c = getComputedStyle(el); const b2 = el.getBoundingClientRect();
    if (b2.width < 10 || b2.width > 300) continue;
    out.push({ t: (el.textContent||'').trim().slice(0,14), w: +b2.width.toFixed(2),
      bw: c.borderTopWidth, bc: c.borderTopColor, pad: c.padding, fs: c.fontSize });
    if (out.length > 8) break;
  }
  return out;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
