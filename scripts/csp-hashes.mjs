#!/usr/bin/env node
// CSP bez 'unsafe-inline' pre skripty — NÁVRH v režime hlásenia (bezpečnosť kolo 4, 21. 11. 2026, nález #35).
//
// Dnešná Report-Only CSP má v `script-src` 'unsafe-inline' (inline opona v index.html), takže vložený skript
// (XSS typu #9) nezastaví. Skutočná ochrana = zoznam hashov presne tých inline skriptov, ktoré stránka naozaj má.
// Hash sa ráta z OBSAHU, preto sa zoznam musí vyrobiť z `dist/index.html` PO builde (Vite inline skripty mení).
//
//   node scripts/csp-hashes.mjs                 # vypíše hashe a navrhnutú hlavičku z dist/index.html
//   node scripts/csp-hashes.mjs --src           # to isté z index.html (pred buildom — len orientačne)
//   node scripts/csp-hashes.mjs --write         # pridá DRUHÚ Report-Only hlavičku do dist/_headers
//
// 🔴 NEVYNUCUJE NIČ. Je to druhá `Content-Security-Policy-Report-Only` popri existujúcej — hlási do PostHogu
// ako `$csp_violation`. Keď týždeň neprídu hlásenia o inline skriptoch (okrem rozšírení prehliadača), prepíše sa
// z nej ostrá `Content-Security-Policy` (spolu s `public/_headers`). Do `npm run build` ani `go-live` nie je zapojený.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARG = process.argv.slice(2);
const html = readFileSync(join(WEB, ARG.includes('--src') ? 'index.html' : 'dist/index.html'), 'utf8');

// inline <script> bez src a bez dátového typu (JSON-LD sa nespúšťa, hash nepotrebuje)
const hashe = [];
for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
  const atr = m[1] || '';
  if (/\bsrc\s*=/.test(atr)) continue;
  if (/type\s*=\s*["'](?!module|text\/javascript)/i.test(atr)) continue;
  if (!m[2].trim()) continue;
  hashe.push("'sha256-" + createHash('sha256').update(m[2]).digest('base64') + "'");
}
// inline obsluhy udalostí (onload=… na <link>) hash nepokryje — treba ich vypísať, inak ich ostrá CSP zabije
const obsluhy = [...html.matchAll(/<[a-z][^>]*\s(on[a-z]+)\s*=\s*"[^"]*"/gi)].map((m) => m[1]);

const hdr = readFileSync(join(WEB, 'public/_headers'), 'utf8');
const riadok = hdr.split('\n').find((l) => /^\s*Content-Security-Policy-Report-Only:/.test(l));
if (!riadok) { console.error('v public/_headers chýba Report-Only CSP'); process.exit(1); }
const politika = riadok.replace(/^\s*Content-Security-Policy-Report-Only:\s*/, '');
const prisna = politika.replace(/script-src([^;]*)/, (_, zdroje) => 'script-src' + zdroje.replace(/\s*'unsafe-inline'/, '') + ' ' + hashe.join(' '));

console.log(`inline skriptov: ${hashe.length}`);
hashe.forEach((h) => console.log('  ' + h));
if (obsluhy.length) console.log(`⚠️ inline obsluhy udalostí v HTML (hash ich nekryje, ostrá CSP ich zablokuje): ${obsluhy.join(', ')}`);
console.log('\nNavrhnutá druhá hlavička:\nContent-Security-Policy-Report-Only: ' + prisna);

if (ARG.includes('--write')) {
  const ciel = join(WEB, 'dist/_headers');
  if (!existsSync(ciel)) { console.error('dist/_headers neexistuje — najprv npm run build'); process.exit(1); }
  const t = readFileSync(ciel, 'utf8');
  if (t.includes('# CSP-STRICT-PROBE')) { console.log('už zapísané'); process.exit(0); }
  // hlavička patrí do bloku `/*` hneď za existujúcu Report-Only
  const u = t.replace(/^(\s*Content-Security-Policy-Report-Only:.*)$/m, `$1\n  # CSP-STRICT-PROBE (len hlási, bez 'unsafe-inline' v script-src)\n  Content-Security-Policy-Report-Only: ${prisna}`);
  writeFileSync(ciel, u);
  console.log('zapísané do dist/_headers');
}
