#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────────────────
 * STRÁŽ DIZAJNOVÉHO SYSTÉMU `/pack` — LOCKED 2026-09-13
 *
 * Matejov výber v nákrese: `guard: gd-hard` — build PADNE, keď nový kód zavedie
 * polomer alebo veľkosť písma mimo schválenej sady. Existujúci dlh je zapísaný
 * v základni (`check-pack-scale.baseline.json`), ktorá sa smie LEN ZMENŠOVAŤ.
 *
 *   npm run check:pack            → kontrola (beží aj pred `npm run build`)
 *   npm run check:pack -- --write → prepíše základňu podľa dnešného stavu
 *   npm run check:pack -- --list  → vypíše, čo presne v ktorom súbore chýba
 *
 * ⚠️ Meria ZDROJ — `style={{…}}` aj CSS v template literáloch. Jedno bez druhého
 *    dá polovičné číslo (overené pri inventúre 13. 9.).
 * ───────────────────────────────────────────────────────────────────────────── */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = new URL('../src/', import.meta.url).pathname;
const BASE = new URL('./check-pack-scale.baseline.json', import.meta.url).pathname;

/* ── SADA (zdroj pravdy = components/pack/packTheme.ts) ───────────────────── */
const R_OK = new Set([0, 1, 2, 8, 12, 14, 16, 50, 999]); //  1/2 = hairline triky, 50 = kruh
const T_OK = new Set([10, 12, 14, 16, 20, 24]);

/* ── ČO STRÁŽ NEKONTROLUJE (a prečo) ─────────────────────────────────────────
 * Nie je to amnestia na nepodarky — sú to povrchy s VLASTNÝM, zapísaným systémom. */
const SKIP = [
  'components/pack/ainubisSkin.ts',         // AINUBIS = vlastný brand (lock 1. 9. 2026)
  'components/pack/ainubis/',               //   …a jeho widget
  'components/pack/PackShareCard.tsx',      // share karta sa renderuje do OBRÁZKA —
  'components/pack/level/revealCss.ts',     //   z papyrusového locku vyňatá v CLAUDE.md
  'components/pack/mapnotes/circleMark.ts', // geometria značky na mape (28/2.5 px lock)
  'components/pack/mapDockShape.ts',        // tvar doku nad mapou (lock 24. 8. 2026)
  'components/pack/navGoldSkin.ts',         // D-BLOK — čísla sú NAV_R zo spodného navu
];

/* Súbory, KTORÉ NESÚ RECEPT — v nich primitív patrí, inde je to ručná kópia. */
const RECEPT = [
  'components/pack/packTheme.ts',   // VEIL_CSS, PROGRESS_CSS, MEDALLION_CSS, PHOTO_CSS
  'components/pack/navGoldSkin.ts', // D-BLOK
];

const inScope = (rel) =>
  (rel.startsWith('pages/Pack') || rel.startsWith('components/pack/')) &&
  /\.(tsx?|css)$/.test(rel) && !SKIP.some((s) => rel.startsWith(s));

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { out.push(...walk(p)); continue; }
    out.push(p);
  }
  return out;
}

/* ── MERANIE ──────────────────────────────────────────────────────────────── */
const found = {};   // súbor → { radius: [hodnoty], font: [hodnoty] }
for (const abs of walk(SRC)) {
  const rel = relative(SRC, abs);
  if (!inScope(rel)) continue;
  const src = readFileSync(abs, 'utf8');
  const bad = { radius: [], font: [], zavoj: [], progres: [] };

  for (const m of src.matchAll(/borderRadius\s*:\s*['"]?(-?[\d.]+)(?:px)?['"]?/g))
    if (!R_OK.has(+m[1])) bad.radius.push(+m[1]);
  for (const m of src.matchAll(/border-radius\s*:\s*(-?[\d.]+)px/g))
    if (!R_OK.has(+m[1])) bad.radius.push(+m[1]);
  for (const m of src.matchAll(/fontSize\s*:\s*['"]?(-?[\d.]+)(?:px)?['"]?/g))
    if (!T_OK.has(+m[1])) bad.font.push(+m[1]);
  for (const m of src.matchAll(/font-size\s*:\s*(-?[\d.]+)px/g))
    if (!T_OK.has(+m[1])) bad.font.push(+m[1]);

  /* ── RUČNÉ KÓPIE POMENOVANÝCH PRIMITÍVOV (14. 9. 2026) ──────────────────────
   * Od 14. 9. má ZÁVOJ meno (`.pk-veil`, VEIL_CSS) a PROGRES meno
   * (`.pk-progress`, PROGRESS_CSS). Kto si ich napíše znova vlastnou rukou,
   * zakladá ďalšiu verziu tej istej veci — presne to, čo Matej zamietol:
   *   „aby boli text area, bloky, pils, fotky nadpisy progresbary atď vždy
   *    rovnaké bez toho aby bolo milion verzii."
   * Meria sa POČET ručných výskytov na súbor a smie LEN KLESAŤ, rovnako ako
   * polomery a písma. Súbory s receptom sa nemerajú — tam primitív BÝVA. */
  if (!RECEPT.some((r) => rel.startsWith(r))) {
    for (const m of src.matchAll(/backdrop-filter\s*:|backdropFilter\s*:/g)) bad.zavoj.push(m[0]);
    for (const m of src.matchAll(/width\s*:\s*`\$\{[^}]*\}%`|width\s*:\s*[\w.()\[\]]+\s*\+\s*['"]%['"]/g))
      bad.progres.push(m[0]);
  }

  if (bad.radius.length || bad.font.length || bad.zavoj.length || bad.progres.length) found[rel] = bad;
}

const counts = Object.fromEntries(
  Object.entries(found).map(([f, b]) => [f, {
    radius: b.radius.length, font: b.font.length,
    zavoj: b.zavoj.length, progres: b.progres.length,
  }]),
);

/* ── ZÁPIS ZÁKLADNE ───────────────────────────────────────────────────────── */
if (process.argv.includes('--write')) {
  writeFileSync(BASE, JSON.stringify(counts, null, 2) + '\n');
  const tot = Object.values(counts).reduce((a, b) => a + b.radius + b.font + b.zavoj + b.progres, 0);
  console.log(`✓ základňa zapísaná — ${Object.keys(counts).length} súborov, ${tot} odchýlok`);
  process.exit(0);
}

if (!existsSync(BASE)) {
  console.error('✗ chýba check-pack-scale.baseline.json — spusti `npm run check:pack -- --write`');
  process.exit(1);
}
const base = JSON.parse(readFileSync(BASE, 'utf8'));

/* ── POROVNANIE — základňa sa smie LEN ZMENŠOVAŤ ──────────────────────────── */
const KEYS = ['radius', 'font', 'zavoj', 'progres'];
const NAZOV = {
  radius: 'polomer', font: 'veľkosť písma',
  zavoj: 'ručný ZÁVOJ (backdrop-filter) — recept je .pk-veil / VEIL_CSS',
  progres: 'ručný PROGRES (pruh na percentá) — recept je .pk-progress / PROGRESS_CSS',
};
const grew = [], shrank = [];
for (const [f, b] of Object.entries(counts)) {
  const was = { radius: 0, font: 0, zavoj: 0, progres: 0, ...(base[f] || {}) };
  for (const k of KEYS) {
    if (b[k] > was[k]) grew.push({ f, k, was: was[k], now: b[k],
      hodnoty: k === 'radius' || k === 'font' ? [...new Set(found[f][k])] : [] });
    else if (b[k] < was[k]) shrank.push(`${f} · ${k} ${was[k]}→${b[k]}`);
  }
}
for (const [f, was] of Object.entries(base))
  if (!counts[f]) for (const k of KEYS)
    if (was[k]) shrank.push(`${f} · ${k} ${was[k]}→0`);

if (process.argv.includes('--list')) {
  for (const [f, b] of Object.entries(found))
    console.log(`  ${f}\n    polomery: ${[...new Set(b.radius)].sort((x, y) => x - y).join(' ') || '—'}\n    písma:    ${[...new Set(b.font)].sort((x, y) => x - y).join(' ') || '—'}`);
}

if (grew.length) {
  console.error('\n✗ DIZAJNOVÝ SYSTÉM /pack — pribudli čísla mimo sady:\n');
  for (const g of grew)
    console.error(`  ${g.f}\n    ${NAZOV[g.k]}: ${g.was} → ${g.now}${g.hodnoty.length ? `   nepovolené: ${g.hodnoty.join(', ')}` : ''}`);
  if (grew.some((g) => g.k === 'radius' || g.k === 'font')) {
    console.error(`\n  Povolené polomery: ${[...R_OK].sort((a, b) => a - b).join(' · ')}   (PACK_R)`);
    console.error(`  Povolené písma:    ${[...T_OK].sort((a, b) => a - b).join(' · ')}   (PACK_TEXT)`);
    console.error('\n  Ber hodnotu z matrice (`PACK_BOX`, `PACK_R`, `PACK_TEXT` v packTheme.ts),');
    console.error('  nepíš číslo ručne.');
  }
  if (grew.some((g) => g.k === 'zavoj' || g.k === 'progres')) {
    console.error('\n  ZÁVOJ a PROGRES majú od 14. 9. 2026 recept v `packTheme.ts` a meno');
    console.error('  v katalógu `PACK_BLOCKS`. Použi `.pk-veil--modal/--photo/--plate`,');
    console.error('  resp. `.pk-progress` — nepíš si vlastnú verziu tej istej veci.');
  }
  console.error('\n  Nový tvar patrí do katalógu `PACK_BLOCKS`, nie do komponentu.\n');
  process.exit(1);
}

const soucet = (o) => KEYS.reduce((a, k) => a + (o[k] || 0), 0);
const tot = Object.values(counts).reduce((a, b) => a + soucet(b), 0);
const baseTot = Object.values(base).reduce((a, b) => a + soucet(b), 0);
console.log(`✓ dizajnový systém /pack — ${tot} odchýlok zo základne ${baseTot}, nič nepribudlo`);
if (shrank.length) {
  console.log(`  ↓ ubudlo ${shrank.length}× — uprac základňu: npm run check:pack -- --write`);
  for (const s of shrank.slice(0, 8)) console.log(`    ${s}`);
}
