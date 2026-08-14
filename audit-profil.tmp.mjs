// Audit /pack/profile — screenshoty + merania cez Playwright (skutočná mobilná
// emulácia vrátane media queries a DPR, čo zúženie kontajnera v prehliadači nevie).
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = '/private/tmp/claude-501/-Users-stachoman-AI-DOGYPT/9e67505f-99b3-4cdf-ab78-607643596abd/scratchpad/audit';
fs.mkdirSync(OUT, { recursive: true });

const URL = 'http://localhost:5199/pack/profile?netdemo=62';
const SIZES = [
  { name: '360', w: 360, h: 800, mobile: true },
  { name: '390', w: 390, h: 844, mobile: true },
  { name: '430', w: 430, h: 932, mobile: true },
  { name: '500', w: 500, h: 900, mobile: false },
  { name: '768', w: 768, h: 1024, mobile: false },
  { name: '1280', w: 1280, h: 900, mobile: false },
];

const browser = await chromium.launch();
const report = {};

for (const s of SIZES) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: s.mobile ? 3 : 2,
    isMobile: s.mobile,
    hasTouch: s.mobile,
    userAgent: s.mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : undefined,
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1200);

  const m = await page.evaluate(() => {
    const doc = document.documentElement;
    const out = {};
    out.horizontalOverflow = doc.scrollWidth > doc.clientWidth
      ? { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth } : null;

    // Ktoré prvky pretekajú za pravý okraj
    out.overflowing = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > doc.clientWidth + 1) {
        out.overflowing.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && String(el.className).slice(0, 60)) || '',
          right: Math.round(r.right), w: Math.round(r.width),
          txt: (el.textContent || '').trim().slice(0, 40),
        });
      }
    });
    out.overflowing = out.overflowing.slice(0, 12);

    // Príliš malé klikacie ciele (Apple/Google odporúčajú 44 px)
    out.smallTargets = [];
    document.querySelectorAll('button, a, [role="button"], input, select').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (r.height < 36 || r.width < 36) {
        out.smallTargets.push({
          tag: el.tagName.toLowerCase(),
          h: Math.round(r.height), w: Math.round(r.width),
          txt: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 34),
        });
      }
    });
    out.smallTargets = out.smallTargets.slice(0, 24);

    // Veľmi malé písmo
    const sizes = {};
    document.querySelectorAll('body *').forEach((el) => {
      if (!el.textContent || !el.textContent.trim()) return;
      if (el.children.length) return;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs && fs < 11) {
        const k = fs.toFixed(1);
        sizes[k] = (sizes[k] || 0) + 1;
      }
    });
    out.tinyText = sizes;

    // Sieťový blok
    const split = document.querySelector('.pknet-split');
    if (split) {
      const side = split.querySelector('.pknet-side').getBoundingClientRect();
      const main = split.querySelector('.pknet-main').getBoundingClientRect();
      out.network = {
        cols: getComputedStyle(split).gridTemplateColumns,
        dvaStlpce: Math.abs(side.x - main.x) > 5,
        sideW: Math.round(side.width), mainW: Math.round(main.width),
        sideH: Math.round(side.height), mainH: Math.round(main.height),
        vyskovyRozdiel: Math.round(Math.abs(side.height - main.height)),
      };
    }

    // Hlavné karty a ich šírky
    out.cards = Array.from(document.querySelectorAll('section, [class*="max-w"]')).slice(0, 3)
      .map((el) => ({ w: Math.round(el.getBoundingClientRect().width) }));

    out.pageHeight = doc.scrollHeight;
    return out;
  });

  m.consoleErrors = consoleErrors.slice(0, 6);
  report[s.name] = m;

  await page.screenshot({ path: `${OUT}/profil-${s.name}.png`, fullPage: true });
  // výrez sieťového bloku
  const el = await page.$('#network');
  if (el) await el.screenshot({ path: `${OUT}/network-${s.name}.png` });
  await ctx.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
