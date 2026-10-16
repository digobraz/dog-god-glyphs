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
 *        · VYŠIEL ZO STĹPCA — text vyšiel z obsahovej plochy rodiča (do paddingu karty, pod šípku)
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
const LANGS = process.env.POPUPY_LANGS ? process.env.POPUPY_LANGS.split(',') : RYCHLE ? ['sk', 'en', 'deu', 'fra', 'nld', 'esp'] : ALL_LANGS;
const SIZES = process.env.POPUPY_SIZE ? [process.env.POPUPY_SIZE.split('x').map(Number)] : RYCHLE ? [[1477, 724], [390, 844]] : [[1477, 724], [1920, 1080], [390, 844], [360, 640]];

// Povrchy, kde žijú popupy. Heroflow kroky bez stavu môžu presmerovať — vtedy sa zmeria, kam dopadli.
const ROUTES = arg('--len') ? [arg('--len')] : [
  '/', '/magnet', '/terms', // /wall = ten istý OnePage ako /
  // heroflow (NEW_HEROFLOW): poradie vstupu; stav dodá dev seed nižšie
  '/heroglyph/name', '/heroglyph/photo', '/heroglyph/dogs', '/heroglyph/email', '/heroglyph/essence',
  '/heroglyph/breed', '/heroglyph/owner-info', '/heroglyph/dog-character', '/heroglyph/crop',
  '/heroglyph/reveal', '/heroglyph/message', '/checkout', '/heroglyph/stay',
  '/pack', '/pack/dogs', '/pack/dogs/dogid', '/pack/profile', '/pack/map', '/pack/map/triplist',
  '/pack/ainubis', '/pack/sniffer', '/pack/nature',
];

// Spúšťače, ktoré sa nestláčajú (nevratné alebo odchod z webu).
const NEKLIKAJ = /sign ?out|log ?out|odhl|delete|zmaž|vymaž|smaž|remove account|zruš účet|pay\b|zaplat|stripe|checkout|install|nainštal/i;
// Vedomé výnimky: zámerne orezané pásy. Pridávaj LEN s dôvodom.
const VYNIMKY = [
  '[data-presah-ok]',
  '.op-apps-marq', // bežiaci pás appiek (marquee) — orezávanie na krajoch je jeho podstata
  '.leaflet-marker-pane', // značka pri okraji mapy je orezaná výrezom mapy (posunie sa ťahom); značky majú vlastný lock
];

const SEED_PHOTO = '/dogs/' + (await import('node:fs')).readdirSync(path.join(WEB, 'public/dogs')).find(f => /\.(jpe?g|png|webp)$/i.test(f));

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
    // Kľúč spúšťača = značka + triedy + poradie medzi rovnakými. Nezávisí od jazyka ani od
    // toho, či film medzitým dorenderoval ďalšie sekcie (cesta nth-of-type sa rozpadla po 8 klikoch).
    _cands(root) {
      const sel = 'button, [role="button"], [role="tab"], summary, [tabindex="0"]';
      const els = [...(root || document).querySelectorAll(sel)];
      if (!root) document.querySelectorAll('div, span, li, img, a:not([href]), a[href^="#"]').forEach(e => { if (getComputedStyle(e).cursor === 'pointer' && !e.closest(sel)) els.push(e); });
      const cnt = {};
      return els.filter(e => root || !e.closest('[data-popupy-pred]'))
        .filter(e => !e.disabled && e.getAttribute('aria-disabled') !== 'true')
        .map(e => { const b = e.tagName.toLowerCase() + '.' + [...e.classList].sort().join('.'); cnt[b] = (cnt[b] || 0) + 1; return { e, key: b + '#' + cnt[b] }; });
    },
    spustace(root) { return this._cands(root).map(({ e, key }) => ({ path: key, label: label(e), vis: vis(e), inner: !!root })); },
    klik(key, inner) {
      const root = inner ? this.nove()[0] : null;
      const hit = this._cands(root).find(c => c.key === key);
      if (!hit) return false; hit.e.click(); return true;
    },
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
        let cl = 0, cr = vw, box = null, col = null, scrollable = false;
        for (let n = e; n && n !== document.documentElement; n = n.parentElement) {
          const c = getComputedStyle(n), rc = n.getBoundingClientRect();
          if (c.overflowX !== 'visible') {
            if (c.overflowX === 'auto' || c.overflowX === 'scroll') scrollable = true;
            cl = Math.max(cl, rc.left); cr = Math.min(cr, rc.right);
          }
          if (!box && isBox(c) && rc.width < vw - 1 && rc.width > 4) box = { l: rc.left, r: rc.right, cls: cls(n) };
          // Obsahová plocha rodiča (bez rámu a paddingu) — text, čo vyjde do paddingu karty, už
          // vylieza zo stĺpca (16. 10.: „SILA KOMUNITY" 30 px cez stĺpec, pod šípkou, rám karty ešte nie).
          if (!col && n !== e.ownerDocument.body && !['inline', 'contents'].includes(c.display) && rc.width > 4 && rc.width < vw - 1) {
            // Padding je v lokálnych px, rect v px obrazovky — pod transform: scale (kniha Ústavy) ich treba zladiť.
            const k = n.offsetWidth ? rc.width / n.offsetWidth : 1;
            const l = rc.left + k * (parseFloat(c.borderLeftWidth) + parseFloat(c.paddingLeft)), r = rc.right - k * (parseFloat(c.borderRightWidth) + parseFloat(c.paddingRight));
            if (L < l - 2 || R > r + 2) col = { l, r, cls: cls(n) };
          }
          if (box) break;
        }
        if (R <= cl + 1 || L >= cr - 1) continue; // celé mimo orezu = skrytý slajd, zámer
        const txt = t.textContent.trim().replace(/\s+/g, ' ').slice(0, 50);
        const where = `.${cls(e)}`;
        const T = 2;
        if (!scrollable && (L < cl - T || R > cr + T)) { seen.add(e); const chain = []; for (let n = e; n && chain.length < 4; n = n.parentElement) chain.push(cls(n)); out.push({ druh: 'OREZANÝ', txt, where: chain.join(' < '), o: Math.round(Math.max(cl - L, R - cr)) }); }
        else if (L < -T || R > vw + T) { seen.add(e); out.push({ druh: 'MIMO OKNA', txt, where, o: Math.round(Math.max(-L, R - vw)) }); }
        else if (box && (L < box.l - T || R > box.r + T)) { seen.add(e); out.push({ druh: 'PREČNIEVA', txt, where: `${where} z .${box.cls}`, o: Math.round(Math.max(box.l - L, R - box.r)) }); }
        else if (col) { seen.add(e); out.push({ druh: 'VYŠIEL ZO STĹPCA', txt, where: `${where} z .${col.cls}`, o: Math.round(Math.max(col.l - L, R - col.r)) }); }
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
  // Heroflow bez stavu presmeruje na prvý krok — dev seed z /lab/heroflow (lib/devSeed.ts, len v DEV)
  // ho postaví do polohy „pes HEKTHOR s fotkou", takže každý krok sa otvorí aj so svojimi popupmi.
  await ctx.addInitScript((photo) => { try { localStorage.setItem('dogypt-dev-seed', JSON.stringify({ dogName: 'HEKTHOR', email: 'straz@dogypt.com', packNumber: 73, lifeStatus: 'alive', extraDogs: 1, photoUrl: photo, photoLabel: 'stráž', popup: null, ts: Date.now() })); } catch {} }, SEED_PHOTO);
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

// Zmeria otvorenú vrstvu a prejde jej vnútorné tlačidlá (1 úroveň, kým vrstva ostáva otvorená).
// inner = null → OBJAV (skúsi všetky, vráti tie, čo ukázali nový obsah) · pole → PREHRAJ len tie.
async function merajVrstvu(p, info, nalezy, inner) {
  const podpisy = new Set();
  const zmeraj = async () => {
    const r = await p.evaluate(() => window.__popupy.nove().map(e => ({ pod: window.__popupy.podpis(e), n: window.__popupy.meraj(e) }))).catch(() => []);
    let nove = false;
    for (const x of r) {
      if (podpisy.has(x.pod)) continue; podpisy.add(x.pod); nove = true;
      if (process.env.POPUPY_DEBUG) console.log(`    meriam „${x.pod.slice(0, 50)}" (${x.n.length})`);
      for (const n of x.n) nalezy.push({ ...info, ...n, popup: x.pod.slice(0, 40) });
    }
    return { nove, pod: r.map(x => x.pod).join('|') };
  };
  const prvy = await zmeraj();
  // Vnútorné tlačidlo, ktoré ukáže nový obsah, sa kliká ZNOVA, kým nový obsah prináša (šípka
  // „ďalší" v popupe členstva prejde všetkých 5 kariet; jeden klik videl len druhú).
  const list = inner ?? (await p.evaluate(() => { const v = window.__popupy.nove()[0]; return v ? window.__popupy.spustace(v).filter(s => s.vis) : []; }).catch(() => []))
    .filter(s => !NEKLIKAJ.test(s.label)).slice(0, 14).map(s => ({ key: s.path, n: 12 }));
  const uzitocne = [];
  for (const { key, n } of list) {
    let k = 0;
    for (let i = 0; i < n; i++) {
      const ok = await p.evaluate(kk => window.__popupy.klik(kk, true), key).catch(() => false);
      if (!ok) break;
      await wait(420);
      if (!(await p.evaluate(() => window.__popupy.nove().length).catch(() => 0))) return { pod: prvy.pod, inner: uzitocne }; // popup zavrelo
      if (!(await zmeraj()).nove) break;
      k = i + 1;
    }
    if (k) uzitocne.push({ key, n: k });
  }
  return { pod: prvy.pod, inner: uzitocne };
}

// Jeden priechod routy v jednom jazyku a okne. triggers = null → objav (len SK), inak prehraj.
async function priechod(browser, base, route, lang, w, h, nalezy, triggers) {
  const { ctx, p } = await newCtx(browser, lang, w, h);
  const url = base + route, okno = `${w}×${h}`;
  const found = [], videne = new Set();
  try {
    await load(p, url);
    const finalUrl = p.url();
    await p.evaluate(() => window.__popupy.oznac());
    const list = triggers ?? (await p.evaluate(() => window.__popupy.spustace())).filter(c => !NEKLIKAJ.test(c.label)).slice(0, 160);
    for (const t of list) {
      const ok = await p.evaluate(k => window.__popupy.klik(k), t.path).catch(() => false);
      if (!ok) continue;
      await wait(550);
      if (p.url().split('#')[0] !== finalUrl.split('#')[0]) { await load(p, url); await p.evaluate(() => window.__popupy.oznac()).catch(() => {}); continue; }
      if (!(await p.evaluate(() => window.__popupy.nove().length).catch(() => 0))) continue;
      const r = await merajVrstvu(p, { route, lang, okno, spustac: t.label }, nalezy, triggers ? t.inner : null);
      if (!triggers && !videne.has(r.pod)) { videne.add(r.pod); found.push({ ...t, inner: r.inner }); }
      await zavri(p, finalUrl);
      await p.evaluate(() => window.__popupy.oznac()).catch(() => {});
    }
  } catch (e) { console.log(`  ⚠️ ${route} ${lang} ${w}px: ${e.message.split('\n')[0]}`); }
  await ctx.close().catch(() => {});
  return found;
}

// Jazyky paralelne — 4 kontexty naraz (viac dusí vite a film nestihne naskočiť).
async function pool(items, n, fn) { const q = [...items]; await Promise.all(Array.from({ length: n }, async () => { while (q.length) await fn(q.shift()); })); }
const PARALEL = +(process.env.POPUPY_PARALEL || 4);

const t0 = Date.now();
let base;
try { base = await ensureServer(); } catch (e) { console.log('✗ stráž nebežala: ' + e.message); process.exit(2); }
const browser = await chromium.launch();
const nalezy = [];
let popupov = 0;
for (const [w, h] of SIZES) {
  for (const route of ROUTES) {
    const trig = await priechod(browser, base, route, LANGS[0], w, h, nalezy, null);
    popupov += trig.length;
    console.log(`· ${route} ${w}px — ${trig.length} popupov${trig.length ? ': ' + trig.map(t => t.label || '?').slice(0, 6).join(' | ') : ''}`);
    if (trig.length) await pool(LANGS.slice(1), PARALEL, lang => priechod(browser, base, route, lang, w, h, nalezy, trig));
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
  for (const x of g.values()) console.log(`  · ${x.druh} ${x.max}px · ${x.route} · popup „${x.popup}" · spúšťač „${x.spustac}" · ${x.where} · „${[...x.txts].slice(0, 2).join('" / „')}" · ${[...x.langs].join(',')} · ${[...x.okna].join(',')}`);
  process.exit(1);
}
console.log(`\n✓ žiadny text nevylieza z popupu — ${popupov} popupov, ${ROUTES.length} rout, ${LANGS.length} jazykov, ${SIZES.length} okná (${min} min)`);
