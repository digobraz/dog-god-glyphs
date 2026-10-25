import { chromium } from 'playwright';
const OUT = process.argv[2]; const B = 'http://127.0.0.1:8095';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addInitScript(() => { try { localStorage.setItem('dogypt_lang', 'sk'); } catch {} });
const J = (r, x) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) });
await ctx.route('**/rest/v1/rpc/post_social*', (r) => J(r, [{ likes: 12, comments: 2, liked: true, saved: false }]));
await ctx.route('**/rest/v1/rpc/list_post_likers*', (r) => J(r, [
  { first_name: 'Daniela', photo: '/images/about-matej.png', owner_n: 7, mine: false }, { first_name: 'Rudolf', photo: null, owner_n: 23, mine: false }, { first_name: 'Matej', photo: '/images/about-matej.png', owner_n: 1, mine: true }]));
await ctx.route('**/rest/v1/rpc/list_post_comments*', (r) => J(r, [
  { id: 'c1', mine: false, can_delete: true, first_name: 'Daniela', photo: '/images/about-matej.png', owner_n: 7, body: 'Hektor je hviezda 🐾', created_at: '2026-10-23T18:00:00Z' },
  { id: 'c2', mine: false, can_delete: true, first_name: 'Rudolf', photo: null, owner_n: 23, body: 'Tam sme boli minulý týždeň, krásne!', created_at: '2026-10-24T08:00:00Z' }]));
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
const shot = async (n) => { await p.waitForTimeout(900); await p.screenshot({ path: `${OUT}/${n}.png` }); console.log('ok', n); };
await p.goto(B + '/nk-test.html?v=compose', { waitUntil: 'networkidle' });
await p.locator('input[type=file][multiple]').first().setInputFiles(['public/images/about-matej.png', 'public/images/about-matej.png', 'public/images/about-matej.png']);
await p.getByRole('button', { name: /Ďalej/ }).click(); await p.waitForTimeout(600);
// DOKRESLENÉ: označiť člena DOGYPTu pod psami (len nákres)
await p.evaluate(() => {
  const dogs = [...document.querySelectorAll('.mc-lbl')].find((e) => /S KÝM/i.test(e.textContent || ''))?.parentElement;
  if (!dogs) return;
  const w = document.createElement('div'); w.style.cssText = 'margin-top:12px;position:relative';
  w.innerHTML = '<input class="pf-field" value="Dan" style="width:100%;padding:12px 16px;font:400 14px Space Grotesk,sans-serif;box-sizing:border-box">' +
    '<div class="pk-card" style="margin-top:4px;padding:4px 0;border-radius:12px;background:#FBF5E6;border:1px solid #E3CFA0">' +
    ['Daniela · #7','Danka · #48'].map((n) => '<div style="display:flex;align-items:center;gap:12px;padding:8px 16px;font:600 14px Space Grotesk,sans-serif;color:#2a1608"><span style="width:32px;height:32px;border-radius:999px;background:#E9D9B0 url(/images/about-matej.png) center/cover"></span>' + n + '</div>').join('') + '</div>' +
    '<div style="margin-top:8px;font:400 12px Space Grotesk,sans-serif;color:#7A5A2A">Označený to musí schváliť.</div>';
  dogs.appendChild(w);
});
await shot('04-detail');
await p.goto(B + '/nk-test.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500); await shot('06-prispevok');
await p.evaluate(() => { const m = document.querySelector('.pv-media'); m.scrollTo({ left: m.scrollWidth }); }); await p.waitForTimeout(1500);
// DOKRESLENÉ: uložiť do triplistu na mape
await p.evaluate(() => { const go = document.querySelector('.pv-map .go'); if (!go) return; go.style.bottom = '72px';
  const t = go.cloneNode(); t.textContent = 'ULOŽIŤ DO TRIPLISTU'; t.style.bottom = '16px'; t.style.background = '#FBF5E6'; t.style.color = '#2a1608'; t.style.border = '1.5px solid #C99A3F'; t.style.boxShadow = 'none'; go.parentElement.appendChild(t); });
await shot('07-mapa-snimka');
await p.evaluate(() => document.querySelector('.pv-root').scrollTo(0, 2000)); await shot('08-komentare');
await p.locator('.pv-likers').click(); await shot('09-lajky');
await p.goto(B + '/nk-test.html?v=settings', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200); await shot('11-nastavenia');
await b.close();
