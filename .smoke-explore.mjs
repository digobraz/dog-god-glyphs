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
await page.waitForTimeout(1200);
await page.screenshot({ path: `${SC}/EXPLORE-name.png` });
const dump = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button')).map(b => ({ text: b.textContent?.trim().slice(0,60), disabled: b.disabled, cls: b.className.slice(0,80) }));
  const inputs = Array.from(document.querySelectorAll('input,textarea')).map(i => ({ type: i.type, placeholder: i.placeholder, name: i.name }));
  return { btns, inputs, title: document.title, bodyLen: document.body.innerText.length };
});
console.log('== NAME ==', JSON.stringify(dump, null, 2));
await browser.close();
