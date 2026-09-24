// Snímky obrazovky POVAHA (/heroglyph/dog-character) v novom vstupe.
// Seed ide cez localStorage (`dogypt-dev-seed`), inak guard odhodí na prvý krok.
import { chromium } from 'playwright';

const BASE = 'http://localhost:8080';
const OUT = process.argv[2] || '/tmp';
const SEED = {
  dogName: 'HEKTHOR', email: 'matej@dogypt.com', packNumber: 73,
  lifeStatus: 'alive', extraDogs: 0, photoUrl: '', photoLabel: 'bez fotky',
  popup: null, ts: Date.now(),
};

const VIEWS = [
  { name: 'pc-1477x724', w: 1477, h: 724, mobile: false },
  { name: 'mobil-390x844', w: 390, h: 844, mobile: true },
  { name: 'se-375x667', w: 375, h: 667, mobile: true },
];

const browser = await chromium.launch();
for (const v of VIEWS) {
  const ctx = await browser.newContext({
    viewport: { width: v.w, height: v.h },
    deviceScaleFactor: 2,
    isMobile: v.mobile,
    hasTouch: v.mobile,
  });
  await ctx.addInitScript(([key, seed, skin]) => {
    localStorage.setItem(key, seed);
    localStorage.setItem('dogypt-flow-skin', skin);
  }, ['dogypt-dev-seed', JSON.stringify(SEED), 'pale']);

  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(`${BASE}/heroglyph/dog-character`, { waitUntil: 'domcontentloaded' });
  // Čakáme na SELEKTOR, nie na networkidle — lazy chunk inak hlási prázdno.
  await page.waitForSelector('.ch-trait', { timeout: 15000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/povaha-${v.name}-prazdna.png` });

  // Dve voľby = plný rám a odomknuté CTA.
  await page.click('.ch-trait:nth-child(1)');
  await page.waitForTimeout(250);
  await page.click('.ch-trait:nth-child(6)');
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/povaha-${v.name}-vybrane.png` });

  const m = await page.evaluate(() => {
    const st = document.querySelector('.hf-stage');
    const col = st?.firstElementChild;
    const q = (s) => document.querySelector(s)?.getBoundingClientRect();
    return {
      stage: st ? { h: st.clientHeight, scroll: st.scrollHeight } : null,
      obsah: col ? Math.round(col.getBoundingClientRect().height) : null,
      glyf: q('.ch-glyph') ? { w: Math.round(q('.ch-glyph').width), h: Math.round(q('.ch-glyph').height) } : null,
      dlazdica: q('.ch-trait') ? { w: Math.round(q('.ch-trait').width), h: Math.round(q('.ch-trait').height) } : null,
      vZabere: [...document.querySelectorAll('.ch-trait')].filter((el) => {
        const r = el.getBoundingClientRect();
        const row = el.parentElement.getBoundingClientRect();
        return r.left >= row.left - 1 && r.right <= row.right + 1;
      }).length,
      cta: (() => { const b = document.querySelector('.hf-cta'); return b ? { disabled: b.disabled, h: Math.round(b.getBoundingClientRect().height) } : null; })(),
      popis: q('.ch-say') ? Math.round(q('.ch-say').height) : null,
    };
  });
  console.log(v.name, JSON.stringify(m), errs.length ? `CHYBY: ${errs.slice(0, 3).join(' | ')}` : 'konzola čistá');
  await ctx.close();
}
await browser.close();
