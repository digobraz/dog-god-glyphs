#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════════════
// STRÁŽ „V APPKE SA NEKUPUJE" — `npm run check:appka` (z `vystupy/web/`)
// ────────────────────────────────────────────────────────────────────────────
// Apple 3.1.1: v natívnej appke (IS_APP) sa nesmie dať dostať na cenu, pokladňu ani /heroglyph.
// Hľadanie v minifikovanom bundli je hrubé (názvy zmiznú), preto sa kontroluje ZDROJ:
//
//   1. Routy: každá routa z App.tsx, ktorá patrí k nákupu, musí byť zachytená regexom PURCHASE
//      v AppRouteGuard (a nesmie sa dať dostať do systémového prehliadača).
//   2. CSS: pravidlo `html.is-app a[href^="/heroglyph"]` v index.css.
//   3. Dosiahnuteľné súbory: z rout, ktoré appka smie otvoriť (/pack, /login, /privacy, /terms),
//      sa prejde importný graf. V každom takom súbore sa hľadá:
//        · odkaz/navigácia na /heroglyph, /checkout, /payment, /entry, /welcome
//        · create-checkout, action:'checkout', Stripe
//        · sumy (€11, 5 €, BONES_PER_EUR, currency EUR)
//      Zásah je STRÁŽENÝ, ak v okne 14 riadkov nad ním (alebo v riadku) stojí `IS_APP`, alebo je to
//      <a href|Link to="/heroglyph…"> (skrýva ho CSS pravidlo z bodu 2).
//      Ostatné = NESTRÁŽENÉ = reálny nález (exit 1), pokiaľ nie je vo VEDOME (nižšie) aj s dôvodom.
//
//   npm run check:appka            kontrola (vydaj.sh)
//   npm run check:appka -- --list  vypíše aj strážené a vedomé miesta
// ════════════════════════════════════════════════════════════════════════════
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const KOREN = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(KOREN, 'src');
const LIST = process.argv.includes('--list');
const rel = (f) => f.slice(KOREN.length + 1);

// ── Vedomé výnimky: súbor + úryvok riadku → dôvod, prečo to v appke nie je nákup ─────────────
// Pridávaj len s dôvodom. Nález, ktorý je v appke naozaj dosiahnuteľný, sem NEPATRÍ — oprav ho.
const VEDOME = [
  { subor: 'src/lib/vetEmergency.ts', obsahuje: '"fee":', dovod: 'príplatok cudzej veterinárnej kliniky, v appke sa nič nekupuje' },
  { subor: 'src/components/PageTopBar.tsx', obsahuje: '/heroglyph/', dovod: 'len porovnanie cesty na vzhľad lišty, nič neotvára' },
  { subor: 'src/components/PageTopBar.tsx', obsahuje: "'/checkout'", dovod: 'len porovnanie cesty na vzhľad lišty, nič neotvára' },
  { subor: 'src/components/ainubis/AinubisWidget.tsx', obsahuje: '/heroglyph/', dovod: 'skrýva widget na nákupných cestách, nič neotvára' },
  { subor: 'src/lib/flowMode.ts', obsahuje: 'FLOW_FIRST_STEP', dovod: 'konštanta; používajú ju len obrazovky nákupného toku' },
  { subor: 'src/components/gods/PhotoInvite.tsx', obsahuje: "navigate('/heroglyph/name')", dovod: 'výzvu otvára len openPhotoInvite z /magnet a dielní (overuje kontrola nižšie)' },
  { subor: 'src/components/pack/magnetPreview.tsx', obsahuje: '', dovod: 'beží len na /magnet/* (nie je app cesta; overuje kontrola nižšie)' },
  { subor: 'src/components/pack/PackNetwork.tsx', obsahuje: 'const BONES_PER_EUR', dovod: 'konštanta; všetky výpisy v eurách sú pod IS_APP' },
  { subor: 'src/components/pack/PackNetwork.tsx', obsahuje: 'const eur =', dovod: 'konštanta; všetky výpisy v eurách sú pod IS_APP' },
  { subor: 'src/components/pack/PackNetwork.tsx', obsahuje: '{n} BONES = €1.</b>', dovod: 'text pre web; v appke ide INFO_BONES_APP (ternár v InfoPanel)' },
  { subor: 'src/components/pack/profile/MisiaGroup.tsx', obsahuje: "'0 €'", dovod: 'suma v pokladnici (prijaté/minuté), nie cena' },
  { subor: 'src/components/pack/profile/MisiaGroup.tsx', obsahuje: "action: 'checkout'", dovod: 'formulár daru otvárajú len miesta pod !IS_APP (overuje kontrola nižšie)' },
  { subor: 'src/components/pack/profile/MisiaGroup.tsx', obsahuje: 'goes to Stripe, the rest to DOGYPT', dovod: 'formulár daru otvárajú len miesta pod !IS_APP (overuje kontrola nižšie)' },
];

const APP_ROUTE = /^\/(pack|login|privacy|terms)(\/|$|:)/;
const failures = [];
const fail = (m) => failures.push(m);

const read = (f) => readFileSync(f, 'utf8');
/** Odstráni komentáre, zachová riadkovanie. */
function bezKomentarov(s) {
  s = s.replace(/(^|[\s{(;,])\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  return s.split('\n').map((l) => (/^\s*\/\//.test(l) ? '' : l.replace(/(^|\s)\/\/\s.*$/, '$1'))).join('\n');
}
function resolveImport(from, spec) {
  let base;
  if (spec.startsWith('@/')) base = join(SRC, spec.slice(2));
  else if (spec.startsWith('.')) base = resolve(dirname(from), spec);
  else return null;
  for (const c of [base, base + '.ts', base + '.tsx', base + '.js', base + '.jsx', join(base, 'index.ts'), join(base, 'index.tsx')]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}
function importy(f, kod) {
  const out = [];
  const re = /(?:from\s*|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(kod))) { const r = resolveImport(f, m[1]); if (r) out.push(r); }
  return out;
}

// ── 1. Routy ─────────────────────────────────────────────────────────────────────────────────
const appTsx = join(SRC, 'App.tsx');
const appKod = bezKomentarov(read(appTsx)).replace(/\{\s*\}/g, '');
const guardKod = read(join(SRC, 'components/AppRouteGuard.tsx'));
const pm = guardKod.match(/const PURCHASE = \/(.*)\/;/);
const appm = guardKod.match(/const APP_PATHS = \/(.*)\/;/);
if (!pm || !appm) { console.error('❌ AppRouteGuard: nenašiel som PURCHASE / APP_PATHS — zmenil sa tvar, uprav stráž.'); process.exit(1); }
const PURCHASE = new RegExp(pm[1]);
const APP_PATHS = new RegExp(appm[1]);

const trasy = [];
for (const chunk of appKod.split(/<Route\b/).slice(1)) {
  const path = (chunk.match(/path\s*=\s*["']([^"']+)["']/) || [])[1];
  if (!path) continue;
  const el = (chunk.match(/element\s*=\s*\{([\s\S]*?)\}\s*\/?>/) || [])[1] || '';
  trasy.push({ path, idents: [...el.matchAll(/<([A-Z]\w+)/g)].map((m) => m[1]) });
}
const NAKUP_CESTA = /(heroglyph|checkout|payment|entry|welcome)/;
const trasyNakup = [];
for (const t of trasy) {
  if (!NAKUP_CESTA.test(t.path)) continue;
  trasyNakup.push(t.path);
  const konkretna = t.path.replace(/:[^/]+/g, 'x');
  if (!PURCHASE.test(konkretna) && !APP_PATHS.test(konkretna)) {
    fail(`ROUTA ${t.path} — nákupná cesta, ale AppRouteGuard ju nepozná ako nákup: v appke by sa otvorila v systémovom prehliadači (dogypt.com${konkretna}) namiesto zablokovania.`);
  }
}
const cssKod = read(join(SRC, 'index.css'));
const CSS_OK = /html\.is-app\s+a\[href\^="\/heroglyph"\]\s*\{\s*display:\s*none\s*!important/.test(cssKod);
if (!CSS_OK) fail('CSS: chýba pravidlo `html.is-app a[href^="/heroglyph"] { display: none !important }` v index.css.');

// ── 2. Dosiahnuteľné súbory z app rout ───────────────────────────────────────────────────────
const idMapa = {};
for (const m of appKod.matchAll(/const\s+(\w+)\s*=\s*\w+\(\s*\(\)\s*=>\s*import\(\s*["']([^"']+)["']/g)) {
  const r = resolveImport(appTsx, m[2]); if (r) idMapa[m[1]] = r;
}
for (const m of appKod.matchAll(/import\s+(?:(\w+)|\{([^}]+)\})\s+from\s+["']([^"']+)["']/g)) {
  const r = resolveImport(appTsx, m[3]); if (!r) continue;
  if (m[1]) idMapa[m[1]] = r;
  if (m[2]) for (const n of m[2].split(',')) { const nm = n.trim().split(/\s+as\s+/).pop(); if (nm) idMapa[nm] = r; }
}
const naAppRoute = new Set(), naWebRoute = new Set();
for (const t of trasy) {
  const app = APP_ROUTE.test(t.path);
  for (const i of t.idents) (app ? naAppRoute : naWebRoute).add(i);
}
const seeds = new Set();
for (const i of naAppRoute) if (idMapa[i]) seeds.add(idMapa[i]);
// Globálne komponenty z App.tsx mimo <Routes> (AINUBIS, PhotoInvite, lišta, stráž…). Obsah <OnFlowPaths> sa
// vykreslí len na nákupných cestách, ktoré appka nepustí (AppRouteGuard), takže sa nepočíta.
{
  const z = appKod.indexOf('<Routes'), k = appKod.lastIndexOf('</Routes>');
  let mimo = z >= 0 && k > z ? appKod.slice(0, z) + appKod.slice(k) : appKod;
  mimo = mimo.replace(/<OnFlowPaths>[\s\S]*?<\/OnFlowPaths>/g, '');
  for (const m of mimo.matchAll(/<([A-Z]\w+)/g)) if (idMapa[m[1]]) seeds.add(idMapa[m[1]]);
}
// Hranica: nákupný tok (obrazovky /heroglyph, /checkout, /payment), dielne a DevNav sa vykreslia len na webových
// cestách, ktoré appka nepustí (AppRouteGuard) — BFS do nich nevstupuje a nekontroluje ich. Do tejto hranice sa
// z /pack dá dostať JEDINE odkazom/navigáciou na /heroglyph, /checkout… — a tie zachytí kontrola zásahov nižšie.
const HRANICA = /\/src\/(components\/screens|components\/lab)\/|\/components\/DevNav\.tsx$/;
const dosiahnute = new Set();
const fronta = [...seeds];
while (fronta.length) {
  const f = fronta.pop();
  if (dosiahnute.has(f) || HRANICA.test(f)) continue;
  dosiahnute.add(f);
  for (const r of importy(f, bezKomentarov(read(f)))) if (!dosiahnute.has(r)) fronta.push(r);
}
const IGNORUJ = /(\/integrations\/supabase\/types\.ts$|\/i18n\/|\/data\/|\.d\.ts$)/;

// ── 3. Zásahy ────────────────────────────────────────────────────────────────────────────────
const NAV = /["'`](?:https?:\/\/(?:www\.)?dogypt\.com)?\/(heroglyph|checkout|payment|entry|welcome)(?![^"'`]*\.(?:svg|png|jpe?g|webp)["'`])[^"'`]*["'`]/;
const VZORY = [
  { typ: 'odkaz', re: NAV },
  { typ: 'create-checkout', re: /create-checkout/ },
  { typ: 'checkout-akcia', re: /action\s*:\s*['"]checkout['"]/ },
  { typ: 'Stripe', re: /Stripe\b|stripe\.com|loadStripe/ },
  { typ: 'suma', re: /€\s?\d|\d\s?€|€\$\{|€\{|BONES_PER_EUR/ },
];
const zasahy = [];
for (const f of [...dosiahnute].sort()) {
  if (IGNORUJ.test(f)) continue;
  const riadky = bezKomentarov(read(f)).split('\n');
  riadky.forEach((l, i) => {
    if (!l.trim()) return;
    for (const v of VZORY) {
      if (!v.re.test(l)) continue;
      const okno = riadky.slice(Math.max(0, i - 14), i + 1).join('\n');
      let stav = 'NESTRÁŽENÉ', dovod = '';
      if (/\bIS_APP\b/.test(okno)) { stav = 'strážené'; dovod = 'IS_APP'; }
      else if (v.typ === 'odkaz' && CSS_OK && /(href|to)\s*=\s*\{?["'`]\/heroglyph/.test(l)) { stav = 'strážené'; dovod = 'CSS pravidlo'; }
      const ved = VEDOME.find((x) => rel(f) === x.subor && l.includes(x.obsahuje));
      if (ved) { stav = 'vedomé'; dovod = ved.dovod; }
      zasahy.push({ subor: rel(f), riadok: i + 1, typ: v.typ, stav, dovod, text: l.trim().slice(0, 130) });
      break;
    }
  });
}

// ── Doplnkové kontroly, na ktorých stoja vedomé výnimky ───────────────────────────────────────
// a) /magnet/* nie je app cesta a MagnetPreview sa v appke nevykreslí inde než na týchto cestách
if (APP_PATHS.test('/magnet/vylety') || naAppRoute.has('MagnetPreview')) fail('MagnetPreview je dosiahnuteľný z app cesty — jeho CTA „Become Dogyptian · €11“ by sa ukázala v appke.');
// b) openPhotoInvite() smie volať len /magnet, dielne a knižnica
for (const f of dosiahnute) {
  if (/\/(lib\/photoInvite\.ts|App\.tsx|pack\/magnetPreview\.tsx|pages\/Magnet\.tsx|gods\/PhotoInvite\.tsx)$/.test(f)) continue;
  if (/openPhotoInvite\s*\(|OPEN_PHOTO_INVITE/.test(bezKomentarov(read(f)))) fail(`${rel(f)} volá openPhotoInvite() — výzva smeruje na /heroglyph/name (nákup), v appke nesmie ísť.`);
}
// c) darčekový formulár (Stripe) v MisiaGroup: každé otvorenie `kind: 'gift'` musí byť pod IS_APP
{
  const f = join(SRC, 'components/pack/profile/MisiaGroup.tsx');
  const r = bezKomentarov(read(f)).split('\n');
  r.forEach((l, i) => {
    if (/setSheet\(\{\s*kind:\s*'gift'/.test(l) && !/\bIS_APP\b/.test(r.slice(Math.max(0, i - 14), i + 1).join('\n'))) fail(`MisiaGroup.tsx:${i + 1} otvára formulár daru (Stripe) bez IS_APP.`);
  });
}

// ── 4. TEST_BUILD je len testovací kanál (6. 11. 2026) ─────────────────────────────────────
// Nová obrazovka patrí pod `APP_NEW` (obchod), nie pod `TEST_BUILD` — inak ju release build neukáže.
// Import `TEST_BUILD` je povolený len tu (každé miesto zapína ladiacu/testovaciu vec alebo ho definuje).
const TEST_BUILD_POVOLENE = {
  'src/lib/env.ts': 'definícia + VET_ER_ON',
  'src/lib/packFlags.ts': 'definícia APP_NEW',
  'src/pages/Pack.tsx': 'štítok TEST vo verzii',
  'src/components/pack/profile/MisiaGroup.tsx': 'MISIA_ON — blok len v teste',
};
(function strazTestBuild(dir) {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) { strazTestBuild(f); continue; }
    if (!/\.(tsx?|jsx?)$/.test(n)) continue;
    const kod = bezKomentarov(read(f));
    if (/import\s*\{[^}]*\bTEST_BUILD\b[^}]*\}\s*from/.test(kod) && !TEST_BUILD_POVOLENE[rel(f)]) {
      fail(`TEST_BUILD v ${rel(f)} — import len pre ${Object.keys(TEST_BUILD_POVOLENE).join(', ')}. Nová obrazovka patrí pod APP_NEW (packFlags.ts), TEST_BUILD je len test (ladenie, MISIA, štítok).`);
    }
  }
})(SRC);

// ── Výpis ────────────────────────────────────────────────────────────────────────────────────
// Vedomé výnimky s prázdnym `obsahuje` platia pre celý súbor
const nestrazene = zasahy.filter((z) => z.stav === 'NESTRÁŽENÉ');
console.log(`check:appka — ${trasyNakup.length} nákupných rout, ${dosiahnute.size} súborov dosiahnuteľných z appky, ${zasahy.length} miest (${nestrazene.length} nestrážených).`);
if (LIST) for (const z of zasahy.filter((z) => z.stav !== 'NESTRÁŽENÉ')) console.log(`  ${z.stav.padEnd(10)} ${z.subor}:${z.riadok} [${z.typ}] ${z.dovod}  ${z.text}`);
for (const z of nestrazene) console.log(`  ✗ ${z.subor}:${z.riadok} [${z.typ}]  ${z.text}`);
for (const f of failures) console.log('  ✗ ' + f);
if (nestrazene.length || failures.length) {
  console.log(`❌ v appke sa dá dostať na nákup/cenu (Apple 3.1.1): ${nestrazene.length + failures.length} nálezov. Oprav, alebo (len s dôvodom) pridaj do VEDOME.`);
  process.exit(1);
}
console.log('✅ v appke sa nekupuje');
