import { chromium } from 'playwright';
const out = '/private/tmp/claude-501/-Users-stachoman-AI-DOGYPT/fe92cafd-3aeb-4690-a4de-f818216d1096/scratchpad';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:8099/pack/map', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
// click on the level badge (trp-level-num--notch)
await page.click('.trp-level-num--notch');
await page.waitForTimeout(600);
await page.screenshot({ path: `${out}/map-levelpanel.png` });
const url1 = page.url();
console.log('after badge click, url:', url1);
await browser.close();
