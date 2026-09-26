import { chromium } from 'playwright';
import fs from 'fs';

const SC = "/private/tmp/claude-501/-Users-stachoman-AI-DOGYPT/cf39f21d-16f8-4b7b-8207-9457cc71aa11/scratchpad/smoke";
const photoUrl = fs.readFileSync('.smoke-photo-b64.txt', 'utf8');
const MODE = process.argv[2] || 'mobil';
const EXTRA_DOGS = parseInt(process.argv[3] || '0', 10);
const TAG = MODE;

const viewport = MODE === 'mobil' ? { width: 390, height: 844 } : { width: 1477, height: 724 };
const isMobile = MODE === 'mobil';

const allErrors = [];
const allNetFail = [];
const allAssets = [];
const timings = [];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport, isMobile, hasTouch: isMobile, deviceScaleFactor: isMobile ? 2 : 1 });
const page = await ctx.newPage();
const t0 = Date.now();
page.on('console', m => { if (m.type()==='error') allErrors.push(`[${TAG}] ${m.text().slice(0,220)}`); });
page.on('response', async (r) => {
  const st = r.status();
  if (st >= 400) allNetFail.push(`[${TAG}] ${st} ${r.url()}`);
  try {
    const headers = r.headers();
    const len = parseInt(headers['content-length'] || '0', 10);
    const ct = headers['content-type'] || '';
    if (len > 0) allAssets.push({ url: r.url().replace('http://localhost:8080',''), size: len, type: ct.split(';')[0], t: Date.now()-t0 });
  } catch {}
});

async function shot(name) { await page.screenshot({ path: `${SC}/${name}-${TAG}.png` }).catch(()=>{}); }
function log(...a) { console.log(`[${TAG}]`, ...a); }
async function killChrome() {
  await page.evaluate(() => {
    document.querySelectorAll('[aria-label="Dev navigation"]').forEach(el => el.closest('.fixed')?.remove());
    const b = Array.from(document.querySelectorAll('button')).find(x=>x.textContent?.trim()==='Allow all');
    b?.click();
  });
}
async function clickForce(sel, nth) {
  const els = await page.$$(sel);
  const el = nth != null ? els[nth] : els[els.length-1];
  if (!el) throw new Error('missing ' + sel + (nth!=null?` [${nth}]`:''));
  await el.click({ force: true, timeout: 5000 });
}
async function clickChip(label) {
  await page.evaluate((label) => {
    const chips = Array.from(document.querySelectorAll('.fdh-chip, .hf-chip, [class*=chip]'));
    // fallback: any clickable element whose text matches
  }, label);
}
async function goChip(text) {
  const btn = await page.$(`button:has-text("${text}")`);
  if (btn) await btn.click({ force: true });
}
async function clickBigContinue() {
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.reverse().find(x => !x.disabled && /continue/i.test(x.textContent||''));
    b?.click();
  });
}

// ── SEED + go to name ──────────────────────────────────────────────────
await page.goto('http://localhost:8080/heroglyph/name', { waitUntil: 'domcontentloaded' });
await page.evaluate((photoUrl) => {
  localStorage.setItem('dogypt-dev-seed', JSON.stringify({
    dogName: '', email: '', packNumber: 73, lifeStatus:'alive', extraDogs: 0,
    photoUrl, photoLabel: 'test', popup: null, ts: Date.now()
  }));
}, photoUrl);
await page.reload({ waitUntil: 'networkidle' });
await killChrome();
await page.waitForTimeout(300);
await shot('01-name-start');

// ── NAME substep ──────────────────────────────────────────────────────
if (isMobile) {
  await page.click('button.name-preview-btn').catch(e=>allErrors.push(`[${TAG}] open name modal fail ${e.message}`));
  await page.waitForTimeout(300);
  await page.fill('input.name-modal-input', 'SMOKETESTIK').catch(e=>allErrors.push(`[${TAG}] name modal input fill fail ${e.message}`));
  await page.waitForTimeout(150);
  await clickForce('button.name-modal-done').catch(e=>allErrors.push(`[${TAG}] name modal done fail ${e.message}`));
} else {
  await page.fill('input[name="dogName"]', 'SMOKETESTIK').catch(e=>allErrors.push(`[${TAG}] desktop name fill fail ${e.message}`));
}
await page.waitForTimeout(300);
await shot('01b-name-namedone');

// BORN substep
log('STAGE: name/born');
await goChip('BORN');
await page.waitForTimeout(400);
const selects = await page.$$('.nm-plate select');
log('born selects found:', selects.length);
if (selects.length >= 3) {
  await selects[0].selectOption({ index: 10 });
  await selects[1].selectOption({ index: 4 });
  await selects[2].selectOption({ index: 5 });
} else allErrors.push(`[${TAG}] birthday selects not found (count ${selects.length})`);
await page.waitForTimeout(400);
await shot('01c-name-born');

// STATUS substep
log('STAGE: name/status');
await goChip('STATUS');
await page.waitForTimeout(300);
const statusPick = await page.$('.nm-plate .hf-pick');
if (statusPick) await statusPick.click({force:true}); else allErrors.push(`[${TAG}] status pick not found`);
await page.waitForTimeout(700);
await shot('01d-name-status');

const nameChipState = await page.evaluate(() => Array.from(document.querySelectorAll('.nm-plate button')).map(b=>({t:b.textContent?.trim().slice(0,20), cls:b.className.slice(0,30)})));
log('name chips state:', JSON.stringify(nameChipState));

let tA = Date.now();
await clickBigContinue();
const navRes = await page.waitForURL('**/heroglyph/dogs', { timeout: 8000 }).then(()=>'ok').catch(e => 'fail: '+e.message);
if (navRes !== 'ok') allErrors.push(`[${TAG}] name->dogs nav fail: ${navRes}`);
log('name->dogs nav:', navRes, 'url now:', page.url());
timings.push(`name(all substeps)->dogs: ${Date.now()-tA}ms`);
await page.waitForTimeout(500);
await shot('02-dogs');

// ── DOGS: add extra dogs ────────────────────────────────────────────────
for (let i = 0; i < EXTRA_DOGS; i++) {
  await page.click('button.hf-addrow').catch(e=>allErrors.push(`[${TAG}] addrow fail ${e.message}`));
  await page.waitForTimeout(500);
  const fileInput = await page.$('input[type=file]');
  if (fileInput) {
    await fileInput.setInputFiles('/Users/stachoman/AI/DOGYPT/vystupy/web/public/images/brana.jpg');
    await page.waitForTimeout(900);
    await clickForce('.pfc-go').catch(e=>allErrors.push(`[${TAG}] pfc-go fail ${e.message}`));
    await page.waitForTimeout(400);
  } else allErrors.push(`[${TAG}] extra dog photo input not found`);
  const nameInput = await page.$('.hf-legpanel input.hf-field');
  if (nameInput) await nameInput.fill(`DRUHYPES${i+1}`);
  const lifePick = await page.$('.hf-legpanel .hf-pick');
  if (lifePick) await lifePick.click({force:true});
  const psel = await page.$$('.hf-legpanel select');
  if (psel.length >= 3) {
    await psel[0].selectOption({ index: 5 }).catch(()=>{});
    await psel[1].selectOption({ index: 3 }).catch(()=>{});
    await psel[2].selectOption({ index: 3 }).catch(()=>{});
  }
  await page.waitForTimeout(200);
  await shot(`02b-dogs-panel-extra${i+1}`);
  await clickForce('.hf-legpanel button.hf-cta').catch(e=>allErrors.push(`[${TAG}] panel done fail ${e.message}`));
  await page.waitForTimeout(300);
}
await shot('02c-dogs-filled');
const dogsCtaState = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button.hf-cta'));
  const b = btns[btns.length-1];
  return b ? { text: b.textContent, disabled: b.disabled } : null;
});
log('dogs main CTA state:', JSON.stringify(dogsCtaState));
tA = Date.now();
await clickForce('button.hf-cta').catch(e=>allErrors.push(`[${TAG}] dogs continue click fail ${e.message}`));
await page.waitForURL('**/heroglyph/email', { timeout: 8000 }).catch(e => allErrors.push(`[${TAG}] dogs->email nav fail: ${e.message}`));
timings.push(`dogs->email: ${Date.now()-tA}ms`);
await page.waitForTimeout(400);
await shot('03-email');

// ── EMAIL ────────────────────────────────────────────────────────────────
await page.fill('input[type=email]', `smoketest+${TAG}@dogypt.com`).catch(e=>allErrors.push(`[${TAG}] email fill fail ${e.message}`));
await page.waitForTimeout(200);
await shot('03b-email-filled');
tA = Date.now();
await clickForce('button.hf-cta').catch(e=>allErrors.push(`[${TAG}] email cta fail ${e.message}`));
await page.waitForURL('**/heroglyph/essence', { timeout: 8000 }).catch(e => allErrors.push(`[${TAG}] email->essence nav fail: ${e.message}`));
timings.push(`email->essence: ${Date.now()-tA}ms`);
await page.waitForTimeout(500);
await shot('04-essence');

// ── ESSENCE (loop through all sub-questions for all dogs) ────────────────
tA = Date.now();
for (let i = 0; i < 20; i++) {
  const state = await page.evaluate(() => {
    const cta = document.querySelector('button.es-cta');
    return cta ? cta.getAttribute('aria-disabled') : 'none';
  });
  if (state === 'false') { await clickForce('button.es-cta'); break; }
  const pick = await page.$('.es-picks button.hf-pick:not(.on)');
  if (pick) { await pick.click({force:true}); await page.waitForTimeout(250); }
  else { const cta = await page.$('button.es-cta'); if (cta) { await cta.click({force:true}); await page.waitForTimeout(250);} else break; }
}
await page.waitForURL('**/heroglyph/breed', { timeout: 10000 }).catch(e => allErrors.push(`[${TAG}] essence->breed nav fail: ${e.message}`));
timings.push(`essence(all q, all dogs)->breed: ${Date.now()-tA}ms`);
await page.waitForTimeout(500);
await shot('05-breed');

// ── BREED / PATRON ────────────────────────────────────────────────────────
tA = Date.now();
await page.click('.pt-fieldwrap input').catch(()=>{});
await page.type('.pt-fieldwrap input', 'Labrador', { delay: 40 }).catch(e=>allErrors.push(`[${TAG}] breed type fail ${e.message}`));
await page.waitForTimeout(500);
await shot('05b-breed-search');
const opt = await page.$('.pt-menu button');
if (opt) await opt.click({force:true}); else allErrors.push(`[${TAG}] no breed match found`);
await page.waitForTimeout(400);
await shot('05c-breed-picked');
await clickForce('button.hf-cta').catch(e=>allErrors.push(`[${TAG}] breed cta fail ${e.message}`));
await page.waitForURL('**/heroglyph/dog-character', { timeout: 8000 }).catch(e => allErrors.push(`[${TAG}] breed->character nav fail: ${e.message}`));
timings.push(`breed->character: ${Date.now()-tA}ms`);
await page.waitForTimeout(500);
await shot('06-character');

// ── DOG-CHARACTER (known bug: skips owner-info) ──────────────────────────
tA = Date.now();
const traits = await page.$$('button.ch-trait');
log('character trait buttons:', traits.length);
if (traits.length >= 2) {
  await traits[0].click({force:true}); await page.waitForTimeout(250);
  await traits[1].click({force:true}); await page.waitForTimeout(250);
  await clickForce('button.hf-cta').catch(e=>allErrors.push(`[${TAG}] character cta click fail ${e.message}`));
} else allErrors.push(`[${TAG}] character trait buttons not found (count=${traits.length})`);
const urlAfterChar = await page.waitForURL('**/heroglyph/owner-info', { timeout: 8000 }).then(()=>page.url()).catch(e => { allErrors.push(`[${TAG}] character->owner-info nav fail: ${e.message}`); return page.url(); });
timings.push(`character(2 picks)->${urlAfterChar.split('/').pop()}: ${Date.now()-tA}ms`);
log('URL AFTER CHARACTER:', urlAfterChar);
await page.waitForTimeout(600);
await shot('07-owner-info');

// ── OWNER-INFO (Majitel): gender, name, western+chinese zodiac ───────────
if (page.url().includes('/heroglyph/owner-info')) {
  tA = Date.now();
  const dbgOwner1 = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b=>({t:(b.textContent||'').trim().slice(0,25),cls:b.className.slice(0,40)})));
  log('OWNER SCREEN (who) BUTTONS:', JSON.stringify(dbgOwner1));
  const genderBtn = await page.$('.ow-genders button, button.ow-gender');
  if (genderBtn) await genderBtn.click({force:true}); else allErrors.push(`[${TAG}] owner gender pick not found`);
  await page.waitForTimeout(300);
  await page.locator('.ftc-chip', { hasText: /^NAME$/ }).click({force:true}).catch(e=>allErrors.push(`[${TAG}] owner NAME chip click fail ${e.message}`));
  await page.waitForTimeout(300);
  if (isMobile) {
    const nameBtn = await page.$('button.ow-name');
    if (nameBtn) { await nameBtn.click({force:true}); await page.waitForTimeout(300);
      const modalIn = await page.$('input.name-modal-input');
      if (modalIn) { await modalIn.fill('MAJITELTESTOVACI'); await clickForce('button.name-modal-done'); }
      else allErrors.push(`[${TAG}] owner name modal input not found`);
    } else allErrors.push(`[${TAG}] owner name button (mobile) not found`);
  } else {
    await page.fill('input[name="ownerName"]', 'MAJITELTESTOVACI').catch(e=>allErrors.push(`[${TAG}] owner name desktop fill fail ${e.message}`));
  }
  await page.waitForTimeout(300);
  await shot('07b-owner-name');
  await page.locator('.ftc-chip', { hasText: /^STARS$/ }).click({force:true}).catch(e=>allErrors.push(`[${TAG}] owner STARS chip click fail ${e.message}`));
  await page.waitForTimeout(300);
  const starSelects = await page.$$('.ow-born select');
  log('owner stars selects found:', starSelects.length);
  if (starSelects.length >= 3) {
    await starSelects[0].selectOption({ index: 12 });
    await starSelects[1].selectOption({ index: 6 });
    await starSelects[2].selectOption({ index: 20 });
  } else allErrors.push(`[${TAG}] owner stars date selects not found`);
  await page.waitForTimeout(400);
  await shot('07c-owner-stars');
  await clickForce('button.ow-cta').catch(e=>allErrors.push(`[${TAG}] owner cta click fail ${e.message}`));
  const ownerNav = await page.waitForURL('**/heroglyph/reveal', { timeout: 8000 }).then(()=>'ok').catch(e=>'fail: '+e.message);
  if (ownerNav !== 'ok') allErrors.push(`[${TAG}] owner-info->reveal nav fail: ${ownerNav}`);
  timings.push(`owner-info(all)->reveal: ${Date.now()-tA}ms`);
  await page.waitForTimeout(500);
  await shot('08-reveal-arrived');
} else {
  allErrors.push(`[${TAG}] never reached /heroglyph/owner-info (stuck at ${page.url()})`);
}

// ── REVEAL: message required, then continue to checkout ─────────────────
if (page.url().includes('/heroglyph/reveal')) {
  tA = Date.now();
  await page.click('.rv-msg').catch(e=>allErrors.push(`[${TAG}] rv-msg open fail ${e.message}`));
  await page.waitForTimeout(400);
  await shot('08-reveal-msgmodal');
  const ta = await page.$('textarea');
  if (ta) await ta.fill('Best boy in the whole wide world. Thank you Hektor!');
  else allErrors.push(`[${TAG}] reveal message textarea not found`);
  await page.waitForTimeout(200);
  // save/close button — try common patterns
  const saveBtn = await page.$('button:has-text("Save"), button:has-text("Done"), button:has-text("SAVE"), button:has-text("DONE")');
  if (saveBtn) await saveBtn.click({force:true}); else allErrors.push(`[${TAG}] reveal message save button not found`);
  await page.waitForTimeout(400);
  await shot('08b-reveal-msgsaved');
  await clickForce('button.hf-cta').catch(e=>allErrors.push(`[${TAG}] reveal cta fail ${e.message}`));
  const revealNav = await page.waitForURL('**/checkout', { timeout: 8000 }).then(()=>'ok').catch(e=>'fail: '+e.message);
  if (revealNav !== 'ok') allErrors.push(`[${TAG}] reveal->checkout nav fail: ${revealNav}`);
  timings.push(`reveal(msg)->checkout: ${Date.now()-tA}ms`);
  await page.waitForTimeout(600);
  await shot('09-checkout');
} else {
  allErrors.push(`[${TAG}] never reached /heroglyph/reveal (stuck at ${page.url()})`);
}

// ── CHECKOUT: inspect pay + decline (stay) WITHOUT completing real payment ──
if (page.url().includes('/checkout')) {
  // "Nechcem platit" -> stay popup
  const declineBtn = await page.$('button.co-decline');
  if (declineBtn) {
    await declineBtn.click({force:true});
    await page.waitForTimeout(500);
    await shot('10-checkout-stay-popup');
    // close it again (choose member / back)
    const backToMember = await page.$('button:has-text("member"), button:has-text("MEMBER"), button:has-text("Member")');
    if (backToMember) { await backToMember.click({force:true}); await page.waitForTimeout(300); }
  } else allErrors.push(`[${TAG}] co-decline (Nechcem platit) button not found`);
  await shot('10b-checkout-after-stay');

  // Inspect the real "ZAPLATIT" call: capture create-checkout response + resulting popup URL, WITHOUT submitting card data.
  let popupUrl = null;
  const popupPromise = ctx.waitForEvent('page', { timeout: 12000 }).catch(()=>null);
  const createCheckoutRespPromise = page.waitForResponse(r => r.url().includes('/create-checkout'), { timeout: 12000 }).catch(()=>null);
  const payBtn = await page.$('button.hf-cta:not(.co-decline)');
  tA = Date.now();
  if (payBtn) await payBtn.click({force:true}).catch(e=>allErrors.push(`[${TAG}] pay click fail ${e.message}`));
  else allErrors.push(`[${TAG}] pay button (hf-cta) not found on checkout`);
  const [popup, ccResp] = await Promise.all([popupPromise, createCheckoutRespPromise]);
  timings.push(`checkout PAY click -> stripe popup/response: ${Date.now()-tA}ms`);
  if (ccResp) {
    let body = null;
    try { body = await ccResp.json(); } catch {}
    log('create-checkout status:', ccResp.status(), 'url field:', body?.url);
    if (body?.url) popupUrl = body.url;
  } else allErrors.push(`[${TAG}] create-checkout response never observed`);
  if (popup) {
    await popup.waitForLoadState('domcontentloaded').catch(()=>{});
    popupUrl = popupUrl || popup.url();
    log('stripe popup url:', popup.url());
    await popup.screenshot({ path: `${SC}/11-stripe-page-${TAG}.png` }).catch(()=>{});
    await popup.close().catch(()=>{});
  } else allErrors.push(`[${TAG}] stripe popup/tab never opened (window.open may be blocked in automation)`);
  fs.writeFileSync(`${SC}/_${TAG}_stripe_url.txt`, String(popupUrl || 'NONE'));
} else {
  allErrors.push(`[${TAG}] never reached /checkout (stuck at ${page.url()})`);
}

fs.writeFileSync(`${SC}/_${TAG}_log.json`, JSON.stringify({ errors: allErrors, netFail: allNetFail, timings, assets: allAssets, finalUrl: page.url() }, null, 2));
console.log(`[${TAG}] STAGE1 DONE. Final URL: ${page.url()}`);
await ctx.storageState({ path: `${SC}/_${TAG}_state.json` });
await browser.close();
