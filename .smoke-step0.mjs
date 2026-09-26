import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const info = await page.evaluate(() => ({
  enrollKey: localStorage.getItem('wall-lab-enroll-v2'),
  joinBtn: !!document.querySelector('.join-btn'),
  centerHero: !!document.querySelector('.center-hero'),
  centerHeroHtml: document.querySelector('.center-hero')?.outerHTML?.slice(0,600),
}));
console.log(JSON.stringify(info, null, 2));
await browser.close();
