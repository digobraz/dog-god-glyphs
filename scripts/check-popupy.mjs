#!/usr/bin/env node
/**
 * STRÁŽ PRESAHU TEXTU V POPUPOCH (16. 10. 2026) — `npm run check:popupy`
 *
 * Matej 16. 10. 2026: *„kamoš mi poslal že na onepage v popupe pri membershipe mi vybehuje
 * sk text pri ‚sila komunity'"* → *„pozri celý web pretekanie pri popupoch a ustanov stráž,
 * aby sa to nedialo do budúcna! je to technikália, čo musí byť vždy ok"*.
 * Príčina vtedy: nadpis popupu mal `white-space: nowrap` a 40 px, stĺpec 342 px — text
 * vyšiel cez okraj karty v 13 z 18 jazykov. SK a EN to ukázali, ostatné nikto nepozrel.
 *
 * AKO TO MERIA (nič sa tu nepíše ručne pre konkrétny popup)
 *   1. OBJAV — na každej routine v SK klikne postupne na každé tlačidlo. Keď sa objaví nová
 *      vrstva (role=dialog / aria-modal / fixed prvok cez ≥ 25 % okna), zapíše si spúšťač.
 *      Vo vnútri popupu klikne aj na jeho tlačidlá (šípky ďalší/predošlý, záložky), ak popup
 *      po kliku ostane otvorený — tak sa prejde napr. všetkých 5 kariet členstva.
 *   2. PREHRAJ — tie isté spúšťače vo všetkých 18 jazykoch, PC (1477×724 = Matejovo okno,
 *      1920×1080) aj mobil (390×844, 360×640).
 *   3. ZMERAJ každý viditeľný text vo vrstve:
 *        · PREČNIEVA — text vyšiel z najbližšieho viditeľného boxu (pozadie/rám/tieň), teda z karty,
 *          pilulky alebo tlačidla
 *        · OREZANÝ   — text je čiastočne odrezaný rodičom s overflow:hidden/clip
 *        · MIMO OKNA — text siaha za ľavý/pravý okraj okna
 *      Text celý mimo orezu (skrytý slajd karuselu) sa nemeria — to je zámer, nie chyba.
 *      Zámerne orezané pásy (bežiaci marquee) nesú `data-presah-ok` alebo sú v VYNIMKY.
 *
 * Bezpečnosť: beží proti DEV Supabase (vlastný vite s VITE_PACK_FULL+NOAUTH). Edge funkcie,
 * Stripe, Resend, Cloudinary, PostHog sú zablokované; odhlásenie, mazanie a platba sa
 * nestláčajú; navigácia preč sa vráti; window.open/alert sú stlmené.
 *
 * Beh:  npm run check:popupy               plný beh (18 jazykov × 4 okná)
 *       npm run check:popupy -- --rychle   SK, EN, DE, FR, NL, ES × PC + mobil (pred deployom)
 *       --len /pack/map                    len jedna routa
 *       --base http://127.0.0.1:8080       použiť už bežiaci server (inak si spustí vlastný na 8093)
 *       STRAZ_SKUSKA=1                     do popupu členstva vráti nowrap — stráž MUSÍ zasvietiť
 * Výstup: 0 = čisté · 1 = nález (vypíše routu, jazyk, okno, popup, text) · 2 = stráž nebežala
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ARGS = process.argv.slice(2);
const arg = (k) => { const i = ARGS.indexOf(k); return i >= 0 ? ARGS[i + 1] : undefined; };
const RYCHLE = ARGS.includes('--rychle');
const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ALL_LANGS = ['sk', 'en', 'cs', 'pol', 'ukr', 'deu', 'esp', 'fra', 'prt', 'rus', 'ita', 'chn', 'jpn', 'ind', 'kor', 'ara', 'tur', 'nld'];
// Rýchly beh berie jazyky s NAJDLHŠÍMI slovami (DE, NL, FR, ES) + tie, ktoré vidí Matej.
const LANGS = RYCHLE ? ['sk', 'en', 'deu', 'fra', 'nld', 'esp'] : ALL_LANGS;
const SIZES = RYCHLE ? [[1477, 724], [390, 844]] : [[1477, 724], [1920, 1080], [390, 844], [360, 640]];

// Povrchy, kde žijú popupy. Heroflow kroky bez stavu môžu presmerovať — vtedy sa zmeria, kam dopadli.
const ROUTES = arg('--len') ? [arg('--len')] : [
  '/', '/wall', '/magnet', '/terms',
  '/heroglyph/name', '/heroglyph/photo', '/heroglyph/dogs', '/heroglyph/essence', '/heroglyph/breed',
  '/heroglyph/owner-info', '/heroglyph/dog-character', '/heroglyph/message', '/checkout',
  '/pack', '/pack/dogs', '/pack/dogs/dogid', '/pack/profile', '/pack/map', '/pack/map/triplist',
  '/pack/ainubis', '/pack/sniffer', '/pack/nature',
];

// Spúšťače, ktoré sa nestláčajú (nevratné alebo odchod z webu).
const NEKLIKAJ = /sign ?out|log ?out|odhl|delete|zmaž|vymaž|smaž|remove account|zruš účet|pay\b|zaplat|stripe|checkout|install|nainštal/i;
// Vedomé výnimky: zámerne orezané pásy. Pridávaj LEN s dôvodom.
const VYNIMKY = [
  '[data-presah-ok]',
  '.op-apps-marq', // bežiaci pás appiek (marquee) — orezávanie na krajoch je jeho podstata
];

// ─── server ────────────────────────────────────────────────────────────────
let server = null;
async function ensureServer() {
  const given = arg('--base') || process.env.POPUPY_BASE;
  if (given) return given.replace(/\/$/, '');
  const port = 8093;
  const base = `http://127.0.0.1:${port}`;
  if (await up(base)) return base;
  server = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: WEB, env: { ...process.env, VITE_PACK_FULL: 'true', VITE_PACK_NOAUTH: '1' }, stdio: 'ignore', detached: true,
  });
  for (let i = 0; i < 90; i++) { if (await up(base)) return base; await new Promise(r => setTimeout(r, 1000)); }
  throw new Error('vite na 8093 nenaštartoval do 90 s');
}
async function up(base) { try { const r = await fetch(base + '/', { signal: AbortSignal.timeout(2000) }); return r.ok; } catch { return false; } }
function stopServer() { if (server) try { process.kill(-server.pid); } catch {} }
process.on('exit', stopServer);
process.on('SIGINT', () => { stopServer(); process.exit(2); });

// ─── v stránke ─────────────────────────────────────────────────────────────
// Všetko, čo beží v prehliadači, je v jednom init skripte, aby to videl každý evaluate.
const IN_PAGE = (vynimky) => {
  window.open = () => null; window.alert = () => {}; window.confirm = () => false; window.prompt = () => null;
  const vis = (e) => {
    for (let n = e; n && n.nodeType === 1; n = n.parentElement) {
      const c = getComputedStyle(n);
      if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.05) return false;
    }
    const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1;
  };
  const alpha = (col) => { const m = col.match(/rgba?\(([^)]+)\)/); if (!m) return col === 'transparent' ? 0 : 1; const p = m[1].split(/[ ,/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };
  const isBox = (c) => alpha(c.backgroundColor) > 0.05 || (c.backgroundImage !== 'none' && c.webkitBackgroundClip !== 'text' && c.backgroundClip !== 'text')
    || ['Top', 'Right', 'Bottom', 'Left'].some(s => parseFloat(c['border' + s + 'Width']) > 0 && alpha(c['border' + s + 'Color']) > 0.05)
    || c.boxShadow !== 'none';
  const label = (e) => (e.getAttribute('aria-label') || e.innerText || e.title || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const cssPath = (e) => {
    const parts = [];
    for (let n = e; n && n !== document.body && n.nodeType === 1; n = n.parentElement) {
      let i = 1; for (let s = n.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === n.tagName) i++;
      parts.unshift(`${n.tagName.toLowerCase()}:nth-of-type(${i})`);
    }
    return 'body > ' + parts.join(' > ');
  };
  const cls = (e) => (typeof e.className === 'string' && e.className.trim().split(/\s+/)[0]) || e.tagName.toLowerCase();

  window.__popupy = {
    // Vrstvy = dialógy + veľké fixné prvky. Značka pred klikom odlíši NOVÉ od existujúcich (nav, lišta).
    vrstvy() {
      const out = new Set();
      document.querySelectorAll('[role="dialog"],[role="alertdialog"],[aria-modal="true"]').forEach(e => vis(e) && out.add(e));
      const A = innerWidth * innerHeight;
      document.querySelectorAll('body *').forEach(e => {
        const c = getComputedStyle(e); if (c.position !== 'fixed') return;
        const r = e.getBoundingClientRect(); if (r.width * r.height < A * 0.25 || !vis(e)) return;
        if (![...out].some(o => o.contains(e))) out.add(e);
      });
      // vnorené vyhoď — meria sa najvyšší rodič
      return [...out].filter(e => ![...out].some(o => o !== e && o.contains(e)));
    },
    oznac() { this.vrstvy().forEach(e => e.setAttribute('data-popupy-pred', '1')); },
    nove() { return this.vrstvy().filter(e => !e.hasAttribute('data-popupy-pred') && !e.closest('[data-popupy-pred]')); },
    spustace(root) {
      const sel = 'button, [role="button"], [role="tab"], summary, [tabindex="0"]';
      const els = [...(root || document).querySelectorAll(sel)];
      if (!root) document.querySelectorAll('div, span, li, img, a:not([href]), a[href^="#"]').forEach(e => { if (getComputedStyle(e).cursor === 'pointer' && !e.closest(sel)) els.push(e); });
      return els.filter(e => !e.closest('[data-popupy-pred]') || root)
        .filter(e => !e.disabled && !/^(true)$/.test(e.getAttribute('aria-disabled') || ''))
        .map(e => ({ path: cssPath(e), label: label(e), vis: vis(e) }));
    },
    klik(p) { const e = document.querySelector(p); if (!e) return false; e.click(); return true; },
    podpis(e) { return (e.innerText || '').replace(/\s+/g, ' ').slice(0, 200); },
    meraj(root) {
      const vw = innerWidth, out = [];
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const seen = new Set();
      while (tw.nextNode()) {
        const t = tw.currentNode, e = t.parentElement;
        if (!e || !t.textContent.trim() || seen.has(e)) continue;
        if (e.closest('[aria-hidden="true"]') || vynimky.some(s => e.closest(s))) continue;
        if (!vis(e)) continue;
        const rg = document.createRange(); rg.selectNodeContents(t);
        const rs = [...rg.getClientRects()].filter(x => x.width > 1 && x.height > 1);
        if (!rs.length) continue;
        const L = Math.min(...rs.map(x => x.left)), R = Math.max(...rs.map(x => x.right));
        let cl = 0, cr = vw, box = null, scrollable = false;
        for (let n = e; n && n !== document.documentElement; n = n.parentElement) {
          const c = getComputedStyle(n), rc = n.getBoundingClientRect();
          if (c.overflowX !== 'visible') {
            if (c.overflowX === 'auto' || c.overflowX === 'scroll') scrollable = true;
            cl = Math.max(cl, rc.left); cr = Math.min(cr, rc.right);
          }
          if (!box && isBox(c) && rc.width < vw - 1 && rc.width > 4) box = { l: rc.left, r: rc.right, cls: cls(n) };
        }
        if (R <= cl + 1 || L >= cr - 1) continue; // celé mimo orezu = skrytý slajd, zámer
        const txt = t.textContent.trim().replace(/\s+/g, ' ').slice(0, 50);
        const where = `.${cls(e)}`;
        const T = 2;
        if (!scrollable && (L < cl - T || R > cr + T)) { seen.add(e); out.push({ druh: 'OREZANÝ', txt, where, o: Math.round(Math.max(cl - L, R - cr)) }); }
        else if (L < -T || R > vw + T) { seen.add(e); out.push({ druh: 'MIMO OKNA', txt, where, o: Math.round(Math.max(-L, R - vw)) }); }
        else if (box && (L < box.l - T || R > box.r + T)) { seen.add(e); out.push({ druh: 'PREČNIEVA', txt, where: `${where} z .${box.cls}`, o: Math.round(Math.max(box.l - L, R - box.r)) }); }
      }
      return out;
    },
  };
};

// ─── beh ───────────────────────────────────────────────────────────────────
const wait = (ms) => new Promise(r => setTimeout(r, ms));
async function newCtx(browser, lang, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await ctx.addInitScript(l => { try { localStorage.setItem('dogypt_lang', l); localStorage.setItem('dogypt_consent', 'denied'); } catch {} }, lang);
  await ctx.addInitScript(IN_PAGE, VYNIMKY);
  await ctx.route('**/*', (route) => {
    const u = route.request().url(), m = route.request().method();
    if (/posthog|stripe\.com|resend\.com|api\.cloudinary\.com|\/functions\/v1\//.test(u)) return route.abort();
    if (m !== 'GET' && !/127\.0\.0\.1|localhost|supabase\.co\/(rest|auth)\//.test(u)) return route.abort();
    return route.continue();
  });
  const p = await ctx.newPage();
  p.on('dialog', d => d.dismiss().catch(() => {}));
  p.on('popup', pp => pp.close().catch(() => {}));
  return { ctx, p };
}
async function load(p, url) {
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await wait(900);
  if (process.env.STRAZ_SKUSKA) await p.addStyleTag({ content: '.op-apps-pop .op-apps-name{white-space:nowrap!important}' });
}
async function zavri(p, url) {
  await p.keyboard.press('Escape').catch(() => {}); await wait(350);
  if ((await p.evaluate(() => window.__popupy.nove().length).catch(() => 1)) > 0 || p.url() !== url) await load(p, url);
}

// Zmeria otvorenú vrstvu + prejde jej vnútorné tlačidlá (1 úroveň, kým vrstva ostáva otvorená).
async function merajVrstvu(p, ctxInfo, nalezy) {
  const podpisy = new Set();
  const zmeraj = async () => {
    const r = await p.evaluate(() => { const v = window.__popupy.nove(); return v.map(e => ({ pod: window.__popupy.podpis(e), n: window.__popupy.meraj(e) })); });
    for (const x of r) {
      if (podpisy.has(x.pod)) continue; podpisy.add(x.pod);
      for (const n of x.n) nalezy.push({ ...ctxInfo, ...n, popup: x.pod.slice(0, 40) });
    }
  };
  await zmeraj();
  const vnutorne = await p.evaluate(() => { const v = window.__popupy.nove()[0]; return v ? window.__popupy.spustace(v).filter(s => s.vis) : []; });
  let n = 0;
  for (const s of vnutorne) {
    if (n >= 12 || NEKLIKAJ.test(s.label)) continue;
    const ok = await p.evaluate(pth => window.__popupy.klik(pth), s.path).catch(() => false);
    if (!ok) continue; n++;
    await wait(550);
    const open = await p.evaluate(() => window.__popupy.nove().length).catch(() => 0);
    if (!open) return; // tlačidlo popup zavrelo — ďalšie vnútorné už nie sú
    await zmeraj();
  }
}

async function objav(browser, base, route, w, h) {
  const { ctx, p } = await newCtx(browser, 'sk', w, h);
  const url = base + route;
  const found = [];
  try {
    await load(p, url);
    const finalUrl = p.url();
    await p.evaluate(() => window.__popupy.oznac());
    const cands = (await p.evaluate(() => window.__popupy.spustace())).slice(0, 140);
    for (const c of cands) {
      if (NEKLIKAJ.test(c.label)) continue;
      const ok = await p.evaluate(pth => window.__popupy.klik(pth), c.path).catch(() => false);
      if (!ok) continue;
      await wait(600);
      if (p.url().split('#')[0] !== finalUrl.split('#')[0]) { await load(p, url); await p.evaluate(() => window.__popupy.oznac()); continue; }
      const nove = await p.evaluate(() => window.__popupy.nove().length).catch(() => 0);
      if (nove) { found.push(c); await zavri(p, finalUrl); await p.evaluate(() => window.__popupy.oznac()).catch(() => {}); }
    }
  } catch (e) { console.log(`  ⚠️ objav ${route} ${w}px: ${e.message.split('\n')[0]}`); }
  await ctx.close();
  return found;
}

async function prehraj(browser, base, route, triggers, lang, w, h, nalezy) {
  if (!triggers.length) return;
  const { ctx, p } = await newCtx(browser, lang, w, h);
  const url = base + route;
  try {
    await load(p, url);
    const finalUrl = p.url();
    await p.evaluate(() => window.__popupy.oznac());
    for (const t of triggers) {
      const ok = await p.evaluate(pth => window.__popupy.klik(pth), t.path).catch(() => false);
      if (!ok) continue;
      await wait(650);
      if (!(await p.evaluate(() => window.__popupy.nove().length).catch(() => 0))) continue;
      await merajVrstvu(p, { route, lang, okno: `${w}×${h}`, spustac: t.label }, nalezy);
      await zavri(p, finalUrl);
      await p.evaluate(() => window.__popupy.oznac()).catch(() => {});
    }
  } catch (e) { console.log(`  ⚠️ ${route} ${lang} ${w}px: ${e.message.split('\n')[0]}`); }
  await ctx.close();
}

const t0 = Date.now();
let base;
try { base = await ensureServer(); } catch (e) { console.log('✗ stráž nebežala: ' + e.message); process.exit(2); }
const browser = await chromium.launch();
const nalezy = [];
let popupov = 0;
for (const [w, h] of SIZES) {
  for (const route of ROUTES) {
    const trig = await objav(browser, base, route, w, h);
    popupov += trig.length;
    console.log(`· ${route} ${w}px — ${trig.length} spúšťačov popupu${trig.length ? ': ' + trig.map(t => t.label || '?').slice(0, 6).join(' | ') : ''}`);
    for (const lang of LANGS) await prehraj(browser, base, route, trig, lang, w, h, nalezy);
  }
}
await browser.close();
stopServer();

const min = ((Date.now() - t0) / 60000).toFixed(1);
if (!popupov) { console.log('✗ stráž nenašla ANI JEDEN popup — meranie je slepé, nie čisté'); process.exit(2); }
// Zlúč rovnaký nález naprieč oknami/jazykmi do jedného riadku.
const g = new Map();
for (const n of nalezy) {
  const k = `${n.route}|${n.druh}|${n.where}|${n.popup}`;
  const x = g.get(k) || { ...n, langs: new Set(), okna: new Set(), max: 0, txts: new Set() };
  x.langs.add(n.lang); x.okna.add(n.okno); x.max = Math.max(x.max, n.o); x.txts.add(n.txt); g.set(k, x);
}
if (g.size) {
  console.log(`\n✗ ${g.size} presah(ov) textu v popupoch (${popupov} popupov, ${LANGS.length} jazykov, ${min} min):`);
  for (const x of g.values()) console.log(`  · ${x.druh} ${x.max}px · ${x.route} · popup „${x.popup}" · ${x.where} · „${[...x.txts].slice(0, 2).join('" / „')}" · ${[...x.langs].join(',')} · ${[...x.okna].join(',')}`);
  process.exit(1);
}
console.log(`\n✓ žiadny text nevylieza z popupu — ${popupov} popupov, ${ROUTES.length} rout, ${LANGS.length} jazykov, ${SIZES.length} okná (${min} min)`);
