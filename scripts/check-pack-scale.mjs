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
const S_OK = new Set([0, 4, 8, 12, 16, 24]);             // PACK_SPACE
/* PACK_HEAD má DVA tvary: karta .14em · sekcia .22em. `.02em` je pilulka dní
 * (lock 12. 9., zdroj PackTree.tsx). Iná hodnota = tretí tvar nadpisu. */
const LS_OK = new Set([0, 0.02, 0.14, 0.22]);

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
const KEYS = ['radius', 'font', 'zavoj', 'progres', 'ram', 'tien', 'pismenka', 'odsadenie'];
const found = {};   // súbor → { radius: [hodnoty], font: [hodnoty], … }
for (const abs of walk(SRC)) {
  const rel = relative(SRC, abs);
  if (!inScope(rel)) continue;
  const src = readFileSync(abs, 'utf8');
  const bad = Object.fromEntries(KEYS.map((k) => [k, []]));

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

    /* ── ŠTYRI VLASTNOSTI, KTORÉ STRÁŽ DOVTEDY NEMERALA (15. 9. 2026) ─────────
     * Audit 15. 9.: stráž hlásila ZELENÚ (1235 zo základne 1235) a appka mala
     * pritom 305 receptov rámu, 52+241 tieňov proti trom výškam a 7 takmer
     * zhodných papyrusových bielych. Dôvod: merali sa 4 vlastnosti zo šiestich,
     * a farba, rám, tieň, odsadenie a letterSpacing nie sú v tej štvorici —
     * teda práve to, čo Matej vidí očami ako „každý blok vyzerá inak".
     *
     * Meria sa RUČNÁ KÓPIA, nie samotná vlastnosť: rám či tieň zapísaný cez
     * token (`${T.border}`, `PACK_SHADOW.card`, `var(--…)`) neprejde ani jednou
     * z regexov nižšie, lebo tie chcú DOSLOVNÚ farbu (`#…` alebo `rgba(`).
     * Súbory s receptom (RECEPT) sa nemerajú — tam tie hodnoty BÝVAJÚ. */

    // RÁM — `1px solid #hex` / `rgba(…)` napísané rukou namiesto PACK_BOX / T.border
    /* ⚠️ Úvodzovka MUSÍ byť v regexe voliteľne pripustená (`['"\`]?`) — bez nej
     * prejde len CSS v template literáloch a `border: '1px solid #DDCCAA'`
     * v `style={{…}}` sa nezmeria vôbec (chytené pri teste stráže 15. 9.). */
    for (const m of src.matchAll(
      /border(?:-(?:top|right|bottom|left))?\s*:\s*['"`]?[^;'"`,)]*?\d[\d.]*px\s+(?:solid|dashed|dotted)\s+(?:#[0-9A-Fa-f]{3,8}|rgba?\()/g,
    )) bad.ram.push(m[0]);

    // TIEŇ — doslovný tieň namiesto troch výšok PACK_SHADOW (card · panel · lift)
    for (const m of src.matchAll(
      /box-?[Ss]hadow\s*:\s*['"`]?[^;'"`]*?(?:#[0-9A-Fa-f]{3,8}|rgba?\()/g,
    )) bad.tien.push(m[0]);

    // PÍSMENKÁ — letterSpacing mimo dvoch tvarov PACK_HEAD (+ pilulka dní)
    for (const m of src.matchAll(/letter-?[Ss]pacing\s*:\s*['"`]?(-?[\d.]*\d)\s*em/g)) {
      const v = Math.round(parseFloat(m[1]) * 1000) / 1000;
      if (!LS_OK.has(v)) bad.pismenka.push(v);
    }

    // ODSADENIE — každé px v `padding` proti PACK_SPACE (4 · 8 · 12 · 16 · 24)
    const padVal = [
      ...src.matchAll(/padding(?:Top|Right|Bottom|Left|Block|Inline)?\s*:\s*['"]([^'"]*)['"]/g),
      ...src.matchAll(/padding(?:-(?:top|right|bottom|left))?\s*:\s*([^;'"`{}]+)[;'"`]/g),
    ];
    for (const m of padVal) {
      if (/\$\{|var\(|calc\(|%|auto/.test(m[1])) continue; // dopočítané = nemeriame
      for (const n of m[1].matchAll(/(-?[\d.]+)px/g))
        if (!S_OK.has(+n[1])) bad.odsadenie.push(+n[1]);
    }
    for (const m of src.matchAll(/padding(?:Top|Right|Bottom|Left|Block|Inline)?\s*:\s*(\d[\d.]*)\s*[,}\n]/g))
      if (!S_OK.has(+m[1])) bad.odsadenie.push(+m[1]);
  }

  if (KEYS.some((k) => bad[k].length)) found[rel] = bad;
}

const counts = Object.fromEntries(
  Object.entries(found).map(([f, b]) => [f, Object.fromEntries(KEYS.map((k) => [k, b[k].length]))]),
);

/* ── ZÁPIS ZÁKLADNE ───────────────────────────────────────────────────────── */
if (process.argv.includes('--write')) {
  writeFileSync(BASE, JSON.stringify(counts, null, 2) + '\n');
  const tot = Object.values(counts).reduce((a, b) => a + KEYS.reduce((s, k) => s + (b[k] || 0), 0), 0);
  console.log(`✓ základňa zapísaná — ${Object.keys(counts).length} súborov, ${tot} odchýlok`);
  for (const k of KEYS)
    console.log(`    ${k.padEnd(10)} ${Object.values(counts).reduce((a, b) => a + (b[k] || 0), 0)}`);
  process.exit(0);
}

if (!existsSync(BASE)) {
  console.error('✗ chýba check-pack-scale.baseline.json — spusti `npm run check:pack -- --write`');
  process.exit(1);
}
const base = JSON.parse(readFileSync(BASE, 'utf8'));

/* ── POROVNANIE — základňa sa smie LEN ZMENŠOVAŤ ──────────────────────────── */
const NAZOV = {
  radius: 'polomer', font: 'veľkosť písma',
  zavoj: 'ručný ZÁVOJ (backdrop-filter) — recept je .pk-veil / VEIL_CSS',
  progres: 'ručný PROGRES (pruh na percentá) — recept je .pk-progress / PROGRESS_CSS',
  ram: 'ručný RÁM s doslovnou farbou — recept je PACK_BOX / T.border / T.hairline',
  tien: 'ručný TIEŇ — sú TRI výšky: PACK_SHADOW.card · .panel · .lift',
  pismenka: 'letterSpacing mimo dvoch tvarov PACK_HEAD (.14em karta · .22em sekcia)',
  odsadenie: 'odsadenie mimo PACK_SPACE',
};
const CISELNE = new Set(['radius', 'font', 'pismenka', 'odsadenie']);
const grew = [], shrank = [];
for (const [f, b] of Object.entries(counts)) {
  const was = { ...Object.fromEntries(KEYS.map((k) => [k, 0])), ...(base[f] || {}) };
  for (const k of KEYS) {
    if (b[k] > was[k]) grew.push({ f, k, was: was[k], now: b[k],
      hodnoty: CISELNE.has(k) ? [...new Set(found[f][k])] : [] });
    else if (b[k] < was[k]) shrank.push(`${f} · ${k} ${was[k]}→${b[k]}`);
  }
}
for (const [f, was] of Object.entries(base))
  if (!counts[f]) for (const k of KEYS)
    if (was[k]) shrank.push(`${f} · ${k} ${was[k]}→0`);

if (process.argv.includes('--list')) {
  const uniq = (a) => [...new Set(a)].sort((x, y) => x - y).join(' ') || '—';
  for (const [f, b] of Object.entries(found))
    console.log(
      `  ${f}\n` +
      `    polomery:  ${uniq(b.radius)}\n` +
      `    písma:     ${uniq(b.font)}\n` +
      `    odsadenia: ${uniq(b.odsadenie)}\n` +
      `    písmenká:  ${uniq(b.pismenka)}\n` +
      `    rámy ${String(b.ram.length).padStart(3)} · tiene ${String(b.tien.length).padStart(3)} · ` +
      `závoje ${b.zavoj.length} · progresy ${b.progres.length}`,
    );
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
  if (grew.some((g) => g.k === 'ram' || g.k === 'tien')) {
    console.error('\n  RÁM a TIEŇ ber z matrice, nie doslovnou farbou:');
    console.error('    rám   → `style={{ ...PACK_BOX.card }}` · `1px solid ${T.border}` · `${T.hairline}`');
    console.error('    tieň  → PACK_SHADOW.card (leží) · .panel (pláva) · .lift (dotyk)');
    console.error('  ⚠️ D-BLOK sa dvíha IBA `transform` — `box-shadow` by prepísal celý odliatok.');
  }
  if (grew.some((g) => g.k === 'pismenka')) {
    console.error('\n  NADPIS má DVA tvary (PACK_HEAD): karta = Cinzel 700/24/.14em,');
    console.error('  sekcia = Space Grotesk 500/10/.22em. Tretí tvar je zle zaradený blok,');
    console.error('  nie nový nadpis. (`.02em` je pilulka dní, zdroj PackTree.tsx.)');
  }
  if (grew.some((g) => g.k === 'odsadenie')) {
    console.error(`\n  Povolené odsadenia: ${[...S_OK].sort((a, b) => a - b).join(' · ')}   (PACK_SPACE)`);
    console.error('  ⚠️ Medzery MRIEŽKY (gap 1–3 px) sú mimo rebríka zámerne a nemerajú sa.');
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
