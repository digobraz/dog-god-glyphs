#!/usr/bin/env node
// CSP bez 'unsafe-inline' pre skripty — NÁVRH v režime hlásenia (bezpečnosť kolo 4, 21. 11. 2026, nález #35).
//
// Dnešná Report-Only CSP má v `script-src` 'unsafe-inline' (inline opona v index.html), takže vložený skript
// (XSS typu #9) nezastaví. Skutočná ochrana = zoznam hashov presne tých inline skriptov, ktoré stránka naozaj má.
// Hash sa ráta z OBSAHU, preto sa zoznam musí vyrobiť z `dist/index.html` PO builde (Vite inline skripty mení).
//
//   node scripts/csp-hashes.mjs                 # vypíše hashe a navrhnutú hlavičku z dist/index.html
//   node scripts/csp-hashes.mjs --src           # to isté z index.html (pred buildom — len orientačne)
//   node scripts/csp-hashes.mjs --write         # nahradí Report-Only hlavičku v dist/_headers prísnou verziou (bez 'unsafe-inline')
//
// 🔴 NEVYNUCUJE NIČ. Je to druhá `Content-Security-Policy-Report-Only` popri existujúcej — hlási do PostHogu
// ako `$csp_violation`. Keď týždeň neprídu hlásenia o inline skriptoch (okrem rozšírení prehliadača), prepíše sa
// z nej ostrá `Content-Security-Policy` (spolu s `public/_headers`).
// Od kola 5 (21. 11. 2026) je zapojený do `npm run build` (`--write` na konci) — hashe sa zbierajú zo VŠETKÝCH
// hotových HTML v `dist/` (index + podstránky z prerenderu + stránky psov), nie len z index.html.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARG = process.argv.slice(2);
// HTML, z ktorých sa hashe zbierajú: s --src len index.html, inak každé .html pod dist/ (prerender: /terms, /login, pre/dog/<n>…)
function htmlSubory(dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (n === 'node_modules') continue;
    const p = join(dir, n);
    const st = statSync(p);
    if (st.isDirectory()) htmlSubory(p, out);
    else if (n.endsWith('.html')) out.push(p);
  }
  return out;
}
const subory = ARG.includes('--src') ? [join(WEB, 'index.html')] : htmlSubory(join(WEB, 'dist'));
if (!subory.length) { console.error('dist/ je prázdny — najprv npm run build'); process.exit(1); }

// inline <script> bez src a bez dátového typu (JSON-LD sa nespúšťa, hash nepotrebuje)
const hasheInfo = new Map();   // hash → { n: počet súborov, dlzka: dĺžka skriptu, subor: prvý súbor }
const obslSet = new Set();
for (const f of subory) {
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
    const atr = m[1] || '';
    if (/\bsrc\s*=/.test(atr)) continue;
    if (/type\s*=\s*["'](?!module|text\/javascript)/i.test(atr)) continue;
    if (!m[2].trim()) continue;
    const h = "'sha256-" + createHash('sha256').update(m[2]).digest('base64') + "'";
    const x = hasheInfo.get(h) || { n: 0, dlzka: m[2].length, subor: f.replace(WEB + '/', '') };
    x.n++;
    if (f === join(WEB, 'dist/index.html')) x.home = true;
    hasheInfo.set(h, x);
  }
  // inline obsluhy udalostí (onload=… na <link>) hash nepokryje — treba ich vypísať, inak ich ostrá CSP zabije
  for (const m of html.matchAll(/<[a-z][^>]*\s(on[a-z]+)\s*=\s*"[^"]*"/gi)) obslSet.add(m[1]);
}
// Cloudflare `_headers`: riadok dlhší ako 2 000 znakov sa TICHO zahodí (wrangler dev ho nedoručí) — zmerané 21. 11. 2026,
// 14 hashov dalo 2 025 znakov a hlavička zmizla celá. Preto rozpočet: najčastejšie a najkratšie skripty prvé, zvyšok sa vypíše.
const LIMIT = 1990;
// Skripty homepage (dist/index.html) majú prednosť — je to najnavštevovanejšia stránka a PageSpeed ju meria
// (FLIP 23. 11. 2026: výberový skript prerenderu `/` vypadol z rozpočtu ⇒ Best practices 100 → 93).
const naHome = (x) => (x.home ? 1 : 0);
const poradie = [...hasheInfo.entries()].sort((a, b) => naHome(b[1]) - naHome(a[1]) || b[1].n - a[1].n || a[1].dlzka - b[1].dlzka);
const vsetkyHashe = poradie.map(([h]) => h);
const obsluhy = [...obslSet];

const hdr = readFileSync(join(WEB, 'public/_headers'), 'utf8');
const riadok = hdr.split('\n').find((l) => /^\s*Content-Security-Policy-Report-Only:/.test(l));
if (!riadok) { console.error('v public/_headers chýba Report-Only CSP'); process.exit(1); }
const politika = riadok.replace(/^\s*Content-Security-Policy-Report-Only:\s*/, '');
// `worker-src 'self' blob:` sa v prísnej verzii vynecháva: bez neho sa riadi `script-src`, ktorý `'self' blob:` má (ušetrí 25 znakov).
const zaklad = politika.replace(/\s*worker-src [^;]*;/, '');
const zostav = (hs) => zaklad.replace(/script-src([^;]*)/, (_, zdroje) => 'script-src' + zdroje.replace(/\s*'unsafe-inline'/, '') + ' ' + hs.join(' '));
const hashe = [...vsetkyHashe];
let prisna = zostav(hashe);
const dlzkaRiadku = () => ('  Content-Security-Policy-Report-Only: ' + prisna).length;
const vynechane = [];
while (dlzkaRiadku() > LIMIT && hashe.length) { vynechane.push(hashe.pop()); prisna = zostav(hashe); }

console.log(`HTML súborov: ${subory.length}, rôznych inline skriptov: ${vsetkyHashe.length}, v hlavičke: ${hashe.length}, riadok ${dlzkaRiadku()} znakov (limit Cloudflare 2000)`);
for (const h of vynechane) { const x = hasheInfo.get(h); console.log(`⚠️ VYNECHANÝ hash (nevošiel sa do 2000 znakov): ${h} — ${x.n}× súborov, ${x.dlzka} znakov, napr. ${x.subor}`); }
hashe.forEach((h) => console.log('  ' + h));
if (obsluhy.length) console.log(`⚠️ inline obsluhy udalostí v HTML (hash ich nekryje, ostrá CSP ich zablokuje): ${obsluhy.join(', ')}`);
console.log('\nNavrhnutá druhá hlavička:\nContent-Security-Policy-Report-Only: ' + prisna);

if (ARG.includes('--write')) {
  const ciel = join(WEB, 'dist/_headers');
  if (!existsSync(ciel)) { console.error('dist/_headers neexistuje — najprv npm run build'); process.exit(1); }
  const t = readFileSync(ciel, 'utf8');
  if (t.includes('# CSP-STRICT-PROBE')) { console.log('už zapísané'); process.exit(0); }
  // Strict politika NAHRADÍ riadok Report-Only v dist/_headers (nie druhý riadok popri ňom): lokálny Worker (`wrangler dev`)
  // pri dvoch riadkoch s rovnakým menom doručil len prvý (21. 11. 2026, kolo 5), a strict politika hlási aj všetko, čo
  // hlásila stará (je od nej prísnejšia), takže o nič neprichádzame. `public/_headers` v repe ostáva so starou verziou.
  const u = t.replace(/^(\s*)Content-Security-Policy-Report-Only:.*$/m, `$1# CSP-STRICT-PROBE (len hlási, bez 'unsafe-inline' v script-src; vyrobil scripts/csp-hashes.mjs)\n$1Content-Security-Policy-Report-Only: ${prisna}`);
  writeFileSync(ciel, u);
  console.log('zapísané do dist/_headers');
}
