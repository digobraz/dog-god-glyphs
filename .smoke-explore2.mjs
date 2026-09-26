import { chromium } from 'playwright';
import fs from 'fs';
const SC = "/private/tmp/claude-501/-Users-stachoman-AI-DOGYPT/cf39f21d-16f8-4b7b-8207-9457cc71aa11/scratchpad/smoke";
const photoUrl = fs.readFileSync('.smoke-photo-b64.txt', 'utf8');

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:8080/heroglyph/name', { waitUntil: 'domcontentloaded' });
await page.evaluate((photoUrl) => {
  localStorage.setItem('dogypt-dev-seed', JSON.stringify({
    dogName: '', email: '', packNumber: 73, lifeStatus:'alive', extraDogs: 0,
    photoUrl, photoLabel: 'test', popup: null, ts: Date.now()
  }));
}, photoUrl);
await page.reload({ waitUntil: 'networkidle' });
await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find(x=>x.textContent?.trim()==='Allow all'); b?.click(); document.querySelectorAll('[aria-label="Dev navigation"]').forEach(el=>el.closest('.fixed')?.remove()); });
await page.waitForTimeout(300);
await page.fill('input[name="dogName"]', 'SMOKETESTIK');
await page.waitForTimeout(300);
await page.screenshot({ path: `${SC}/02a-name-filled-mobil.png` });

const rects = await page.evaluate(() => {
  const btn = document.querySelector('button.name-modal-done');
  const img = document.querySelector('img.fm-img');
  const r1 = btn?.getBoundingClientRect();
  const r2 = img?.getBoundingClientRect();
  const cs = img ? getComputedStyle(img) : null;
  return {
    btn: r1 && {x:r1.x,y:r1.y,w:r1.width,h:r1.height},
    img: r2 && {x:r2.x,y:r2.y,w:r2.width,h:r2.height},
    imgPointerEvents: cs?.pointerEvents, imgZ: cs?.zIndex, imgParentCls: img?.parentElement?.className,
  };
});
console.log(JSON.stringify(rects, null, 2));
await browser.close();
