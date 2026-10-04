#!/usr/bin/env node
/**
 * STRÁŽ FARBY NADPISOV FILMU /onepage (4. 10. 2026).
 * Matej: *„a tu je zas iná farba! urob to poriadne, aby som ťa nemusel stále
 * opravovať"*. Prvé kolo meralo len h1/h2 — kráva a pes (span .cl-figure) ním
 * prekĺzli. Táto stráž preto berie KAŽDÝ text ≥ 30 px vo filme (SK aj EN,
 * PC aj mobil), po krokoch 12 % výšky okna, a pýta sa: je to FILM_GOLD?
 *
 * Výnimky = vedomé rozhodnutia, nie únava:
 *   ph-l          atrament v úvode (zlaté nesie len DOG/GOD — vzor motta)
 *   line          atramentová polovica motta (lock motta: zlato na psovi)
 *   sw-*          Star Wars paródia, žltá na tmavom
 *   *-cta         text tlačidla, nie nadpis
 *
 * Beh: dev server na 127.0.0.1:8080 · `npm run check:nadpisy`
 */
import { chromium } from 'playwright';
const URL = process.env.ONEPAGE_URL || 'http://127.0.0.1:8080/onepage';
const GOLD = 'rgb(110, 74, 18) 0%, rgb(163, 120, 43) 30%, rgb(216, 169, 63) 50%';
const SKIP = /^(ph-l|line|sw-|op-nxt-cta|cb-|ph-no)/;
const runs = [['sk', 1477, 724], ['en', 1477, 724], ['sk', 390, 844]];
const b = await chromium.launch();
const bad = new Map();
for (const [lang, w, h] of runs) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(l => { try { localStorage.setItem('dogypt_lang', l); } catch {} }, lang);
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
  // Skúška, že stráž vie zasvietiť: STRAZ_SKUSKA=1 prefarbí jeden nadpis.
  if (process.env.STRAZ_SKUSKA) await p.addStyleTag({ content: '.op-root .cl-figure-void{background-image:none!important;color:#0A1A4A!important;-webkit-text-fill-color:#0A1A4A!important}' });
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += Math.round(h * 0.12)) {
    await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(220);
    const r = await p.evaluate(({ GOLD }) => {
      const out = []; const seen = new Set();
      const tw = document.createTreeWalker(document.querySelector('.op-root') || document.body, NodeFilter.SHOW_TEXT);
      while (tw.nextNode()) {
        const t = tw.currentNode, e = t.parentElement;
        if (!e || seen.has(e) || !t.textContent.trim()) continue; seen.add(e);
        const cs = getComputedStyle(e); if (parseFloat(cs.fontSize) < 30) continue;
        const rc = e.getBoundingClientRect(); if (rc.width < 2 || rc.bottom < 0 || rc.top > innerHeight) continue;
        let o = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const c = getComputedStyle(n); o *= +c.opacity; if (c.display === 'none' || c.visibility === 'hidden') o = 0; }
        if (o < 0.5) continue;
        let gold = false;
        for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const c = getComputedStyle(n); if (c.webkitBackgroundClip === 'text' && c.backgroundImage !== 'none') { gold = c.backgroundImage.includes(GOLD); break; } }
        const cls = (typeof e.className === 'string' && e.className.trim().split(/\s+/)[0]) || e.parentElement?.className?.toString().split(/\s+/)[0] || e.tagName;
        out.push({ cls, txt: t.textContent.trim().slice(0, 30), gold, fs: Math.round(parseFloat(cs.fontSize)), col: cs.color });
      }
      return out;
    }, { GOLD });
    for (const x of r) if (!x.gold && !/^sw-/.test(x.cls) && !SKIP.test(x.cls)) bad.set(x.cls + '|' + x.txt, `${lang} ${w}px · ${x.fs}px · ${x.col} · .${x.cls} · „${x.txt}"`);
  }
  await ctx.close();
}
await b.close();
if (bad.size) { console.log(`✗ ${bad.size} nadpis(ov) filmu mimo FILM_GOLD:`); for (const v of bad.values()) console.log('  · ' + v); process.exit(1); }
console.log('✓ všetky nadpisy filmu (≥ 30 px, SK+EN, PC+mobil) sú v jednom zlate FILM_GOLD');
