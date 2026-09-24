// Koľko z javiska kroku zaberá obsah — pre KAŽDÚ obrazovku nového vstupu.
// Výplň = výška obsahu / (javisko − 2× PAGE_AIR). 100 % = obsah sedí presne na hranici.
import { chromium } from 'playwright';

const BASE = 'http://localhost:8080';
const SEED = {
  dogName: 'HEKTHOR', email: 'matej@dogypt.com', packNumber: 73,
  lifeStatus: 'alive', extraDogs: 2, photoUrl: '', photoLabel: 'bez fotky',
  popup: null, ts: Date.now(),
};

const STEPS = [
  ['2 meno', '/heroglyph/name', '.hf-block'],
  ['3 svorka', '/heroglyph/dogs', '.hf-block'],
  ['4 e-mail', '/heroglyph/email', '.hf-block'],
  ['5 podstata', '/heroglyph/essence', '.es-picks'],
  ['6 patrón', '/heroglyph/breed', '.pt-sil'],
  ['7 povaha', '/heroglyph/dog-character', '.ch-trait'],
];

const VIEWS = [
  { name: 'PC 1477×724', w: 1477, h: 724, mobile: false },
  { name: 'mobil 390×844', w: 390, h: 844, mobile: true },
  { name: 'SE 375×667', w: 375, h: 667, mobile: true },
];

const browser = await chromium.launch();
const rows = [];
for (const v of VIEWS) {
  const ctx = await browser.newContext({
    viewport: { width: v.w, height: v.h }, deviceScaleFactor: 1,
    isMobile: v.mobile, hasTouch: v.mobile,
  });
  await ctx.addInitScript(([k, s]) => {
    localStorage.setItem(k, s);
    localStorage.setItem('dogypt-flow-skin', 'pale');
    localStorage.setItem('dogypt-consent', 'all'); // lišta cookies zakrýva spodok
  }, ['dogypt-dev-seed', JSON.stringify(SEED)]);
  const page = await ctx.newPage();
  for (const [name, path, sel] of STEPS) {
    try {
      await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector(sel, { timeout: 15000 });
      await page.waitForTimeout(500);
      const m = await page.evaluate(() => {
        const st = document.querySelector('.hf-stage');
        if (!st) return null;
        const cs = getComputedStyle(st);
        const padT = parseFloat(cs.paddingTop), padB = parseFloat(cs.paddingBottom);
        const usable = st.clientHeight - padT - padB;
        const kids = [...st.children];
        const obsah = kids.reduce((a, el) => a + el.getBoundingClientRect().height, 0);
        return {
          javisko: st.clientHeight, vzduch: padT, miesto: Math.round(usable),
          obsah: Math.round(obsah), pretecie: st.scrollHeight - st.clientHeight,
        };
      });
      rows.push({ view: v.name, step: name, ...m, fill: Math.round((m.obsah / m.miesto) * 100) });
    } catch (e) {
      rows.push({ view: v.name, step: name, chyba: String(e).split('\n')[0].slice(0, 60) });
    }
  }
  await ctx.close();
}
await browser.close();

for (const v of VIEWS) {
  console.log(`\n══ ${v.name}`);
  for (const r of rows.filter((x) => x.view === v.name)) {
    if (r.chyba) { console.log(`  ${r.step.padEnd(12)} ✖ ${r.chyba}`); continue; }
    const bar = '█'.repeat(Math.round(r.fill / 5)).padEnd(20, '·');
    console.log(`  ${r.step.padEnd(12)} ${bar} ${String(r.fill).padStart(3)} %  obsah ${String(r.obsah).padStart(4)} / miesto ${r.miesto}${r.pretecie > 0 ? `  ⚠️ preteká o ${r.pretecie}` : ''}`);
  }
}
