import { chromium } from 'playwright';
const SC = "/private/tmp/claude-501/-Users-stachoman-AI-DOGYPT/cf39f21d-16f8-4b7b-8207-9457cc71aa11/scratchpad/smoke";
const PHOTO = "/Users/stachoman/AI/DOGYPT/vystupy/web/public/images/brana.jpg";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.evaluate(() => { document.querySelectorAll('[aria-label="Dev navigation"]').forEach(el => el.closest('.fixed')?.remove()); });
await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find(x=>x.textContent?.trim()==='Allow all'); b?.click(); });
await page.waitForTimeout(500);

const info = await page.evaluate(() => {
  const el = document.querySelector('.enroll-card');
  if (!el) return { found: false };
  const r = el.getBoundingClientRect();
  return { found: true, rect: r, html: el.outerHTML.slice(0, 1500) };
});
console.log(JSON.stringify(info, null, 2));

// scroll it into view if found off-screen
if (info.found) {
  await page.evaluate(() => document.querySelector('.enroll-card')?.scrollIntoView({ block: 'center', inline: 'center' }));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SC}/00b-enroll-scrolled-mobil.png` });
  const input = await page.$('.enroll-card input[type=file]');
  console.log('file input in enroll card:', !!input);
  if (input) {
    await input.setInputFiles(PHOTO);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SC}/01-photo-popup-mobil.png` });
  }
}
await browser.close();
