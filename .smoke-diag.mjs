import { chromium } from 'playwright';
import fs from 'fs';
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
await page.evaluate(() => { document.querySelectorAll('[aria-label="Dev navigation"]').forEach(el => el.closest('.fixed')?.remove()); const b = Array.from(document.querySelectorAll('button')).find(x=>x.textContent?.trim()==='Allow all'); b?.click(); });
await page.waitForTimeout(300);
await page.fill('input[name="dogName"]', 'SMOKETESTIK');
await page.click('button.name-modal-done', { force: true });
await page.waitForURL('**/heroglyph/dogs', { timeout: 8000 });
await page.waitForTimeout(600);
const dump = await page.evaluate(() => ({
  html: document.querySelector('.hf-stage')?.outerHTML?.slice(0, 3000),
  buttons: Array.from(document.querySelectorAll('button')).map(b=>({t:b.textContent?.trim().slice(0,30), cls:b.className.slice(0,40), disabled:b.disabled})),
}));
console.log(JSON.stringify(dump, null, 2));
await browser.close();
