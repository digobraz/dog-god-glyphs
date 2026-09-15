#!/usr/bin/env node
/* Kolo 0 prevodu `/pack`: doslovná farba, ktorá sa PRESNE rovná tokenu, → token.
 *
 * Nepohne ani jedným pixelom — a je to dokázané, nie tvrdené: po prepise sa
 * tokeny expandujú späť na hodnoty a výsledok sa porovná s pôvodným súborom
 * znak po znaku. Keď sa nezhoduje, súbor sa NEZAPÍŠE.
 *
 *   node tokenizuj.mjs            → suchý beh (nič nezapíše)
 *   node tokenizuj.mjs --write    → zapíše
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = new URL('../src/', import.meta.url).pathname;
const WRITE = process.argv.includes('--write');

/* Hodnoty OPÍSANÉ z packTheme.ts — musia sedieť znak po znaku. */
const TOK = {
  hairline: 'rgba(201, 154, 63, 0.30)', border: 'rgba(201, 154, 63, 0.45)',
  onDarkBorder: 'rgba(245, 240, 228, 0.18)', onDarkHair: 'rgba(245, 240, 228, 0.10)',
  onDark: 'rgba(245, 240, 228, 0.86)', onDarkDim: 'rgba(245, 240, 228, 0.46)',
  glass: 'rgba(5, 5, 5, 0.72)', glassSoft: 'rgba(5, 5, 5, 0.55)',
  inkDim: 'rgba(31, 26, 14, 0.62)', inkFaint: 'rgba(31, 26, 14, 0.42)',
  cardEdge: '#C99A3F', card: '#FBF5E6', cardSoft: '#FCF4DF', ink: '#1F1A0E',
  inkStrong: '#2a1608', inkWarm: '#7a5a2a', pageBg: '#050505', bg: '#EDDCBD',
  bgTop: '#F2E5C7', bgBottom: '#E5D5B3', brandBlue: '#1034A6',
  brandBlueLite: '#2E5FD0', growGreen: '#3D7A4E', alertRed: '#B25640',
  tripPurple: '#7A2FBF',
};
/* accentGold má rovnakú hodnotu ako cardEdge — cardEdge je ten, ktorý nesie
 * význam „okraj karty", takže vyhráva. Nie je to voľba vkusu: dve mená pre
 * jednu hodnotu sú presne to, čo tento prevod odstraňuje. */

const norm = (s) => s.toLowerCase().replace(/\s+/g, '');
const BY_VAL = {};
for (const [k, v] of Object.entries(TOK)) if (!BY_VAL[norm(v)]) BY_VAL[norm(v)] = k;

/* ── PAPYRUSOVÉ BIELE: SEDEM ODTIEŇOV → DVA (kolo 2, 15. 9. 2026) ────────────
 * Na rozdiel od `TOK` vyššie toto NIE SÚ presné zhody — hodnota sa reálne
 * zmení, len o 1–2 jednotky na kanál. Preto sa na ne spätná expanzia NEVZŤAHUJE
 * (dokazovala by nulovú zmenu, ktorá tu nenastáva) a vypisujú sa zvlášť.
 *
 * Prečo práve takto: `#FFFDF6` je naprieč `/pack` výplň prvku pri NABEHNUTÍ MYŠOU
 * (`.tl-back:hover`, `.comm-chip:hover`, …), ktorého pokojný stav je priesvitný
 * `PALE.soft`. `T.card` (#FBF5E6) je tá istá papyrusová biela pod menom
 * `PALE.field`, takže rozdiel pokoj/hover ostáva čitateľný — mení sa odtieň,
 * nie kontrast.
 *
 * ⚠️ `#FFFDF7` tu NIE JE. Je to vrch gradientu v `PILL_CSS` a `PF_FIELD_CSS`,
 *    teda RECEPT — jeho dve ručné kópie v `PackNatureQuiz.tsx` treba nahradiť
 *    triedou `.pk-pill`, čo je zmena komponentu, nie hodnoty.
 * ⚠️ `#F5F0E4` a `#FAF4EC` sú väčšinou INKOUST na tmavom (meno psa na fotke),
 *    nie výplň. `T.card` je na to určená — je to PLNÁ farba a `packTheme.ts`
 *    ju výslovne pripúšťa aj ako `color:`. */
const BLIZKE = {
  '#FFFDF6': 'card', '#F5F0E4': 'card', '#FAF4EC': 'card', '#FFF6E2': 'cardSoft',
};

/* ⚠️ CELÝ `/pack`, nie zoznam povrchov (kolo 2, Matej 15. 9.: „urobime to dnes
 * pre celý pack"). Ručný zoznam bol pri štyroch povrchoch prehľadný, pri 87
 * súboroch by bol len ďalším miestom, kde niečo vypadne. Rozsah je TEN ISTÝ,
 * ktorý meria stráž `check-pack-scale.mjs` — vrátane jej SKIP (locknuté povrchy)
 * a RECEPT (súbory, kde hodnoty BÝVAJÚ). */
const SKIP = [
  'components/pack/ainubisSkin.ts', 'components/pack/ainubis/',
  'components/pack/PackShareCard.tsx', 'components/pack/level/revealCss.ts',
  'components/pack/mapnotes/circleMark.ts', 'components/pack/mapDockShape.ts',
  'components/pack/navGoldSkin.ts',
];
const RECEPT = ['components/pack/packTheme.ts', 'components/pack/navGoldSkin.ts'];

function zbierajSubory(dir, base = '') {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e), rel = base ? `${base}/${e}` : e;
    if (statSync(p).isDirectory()) { out.push(...zbierajSubory(p, rel)); continue; }
    out.push(rel);
  }
  return out;
}
const FILES = zbierajSubory(SRC).filter(
  (rel) =>
    (rel.startsWith('pages/Pack') || rel.startsWith('components/pack/')) &&
    /\.(tsx?|css)$/.test(rel) &&
    !SKIP.some((s) => rel.startsWith(s)) &&
    !RECEPT.some((r) => rel.startsWith(r)),
);

/* Meno, pod ktorým má súbor tému v ruke — A OD KTORÉHO MIESTA.
 *
 * Tri poruchy, ktoré sa sem zmestili pri rozšírení na celý `/pack` (15. 9. 2026);
 * pri štyroch povrchoch kola 0 sa ani jedna nevyskytla:
 *   1. `import { PACK_THEME as T }` — stará vetva „obsahuje slovo PACK_THEME"
 *      zapísala `PACK_THEME.card` do súboru, kde je naviazané iba `T`. 16 súborov.
 *   2. Slovo `PACK_THEME` LEN V KOMENTÁRI (`calendarModel.ts`, `packProfile.ts`)
 *      — codemod z toho usúdil, že téma je po ruke, a vyrobil `Cannot find name`.
 *      Preto sa väzba hľadá iba v KÓDE, nie v komentári.
 *   3. `const T = PACK_THEME` STOJÍ AŽ POD prvou farbou (`PackTriplist`, `PackMap`,
 *      `PackTripArticle` majú CSS literál nad deklaráciou) — `T` sa použilo pred
 *      deklaráciou. Preto sa vracia aj `odKde` a všetko nad ním sa preskočí. */
function alias(src, ST) {
  const vKode = (m) => m && ST[m.index] === KOD;
  const kandidati = [
    [/import\s*\{[^}]*\bPACK_THEME\s+as\s+T\b[^}]*\}[^;\n]*;/, 'T'],
    [/\bconst\s+T\s*=\s*PACK_THEME\b[^;\n]*;/, 'T'],
    [/import\s*\{[^}]*\bPACK_THEME\b[^}]*\}[^;\n]*;/, 'PACK_THEME'],
  ];
  for (const [re, meno] of kandidati) {
    const m = src.match(re);
    if (vKode(m)) return { meno, odKde: m.index + m[0].length };
  }
  return null;
}

/* ── KDE V SÚBORE TÁ FARBA LEŽÍ ──────────────────────────────────────────────
 * Do 15. 9. 2026 to rozhodoval počet spätných apostrofov pred pozíciou. Ten
 * odhad na štyroch povrchoch kola 0 vydržal, na celom `/pack` spravil DVE
 * poruchy, ktoré spätná expanzia NECHYTÍ (obe expandujú naspäť na tú istú
 * hodnotu, takže dôkaz o nich nevie):
 *
 *   1. KOMENTÁR so spätným apostrofom. `// predtým bola zlatá \`#C99A3F\``
 *      sa prepísal na `\${T.cardEdge}` — kód beží rovnako, ale veta prestala
 *      dávať zmysel a doklad o histórii je preč.
 *   2. REŤAZEC VNÚTRI template literálu. V
 *      `` `1.5px solid ${xs ? 'rgba(…,0.28)' : 'rgba(…,0.45)'}` ``
 *      je tá druhá farba v obyčajných úvodzovkách, hoci naokolo beží template.
 *      Odhad povedal „si v template", vložil `\${T.border}` do apostrofov —
 *      a z rámu sa stal doslovný text `1.5px solid \${T.border}`, teda NEPLATNÉ
 *      CSS. Prvok prišiel o okraj a nikto by si toho v dôkaze nevšimol.
 *
 * Preto sa súbor jednoducho prejde znak po znaku a každá pozícia dostane stav.
 * Porucha tohto skenera sa prejaví ako „preskočené", nie ako „prepísané zle":
 * mimo template sa nahrádza iba vtedy, keď je farba CELÝM reťazcom. */
const KOD = 0, RIADKOVY = 1, BLOKOVY = 2, APOSTROF = 3, UVODZOVKY = 4, TEMPLATE = 5;
function stavy(src) {
  const st = new Uint8Array(src.length);
  let mode = KOD, hlbka = 0, i = 0;
  const ramy = [];                                   // zanorenie `${ … }` v template
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (mode === KOD) {
      if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') st[i++] = RIADKOVY; continue; }
      if (c === '/' && d === '*') {
        st[i++] = BLOKOVY; st[i++] = BLOKOVY;
        while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) st[i++] = BLOKOVY;
        if (i < src.length) { st[i++] = BLOKOVY; st[i++] = BLOKOVY; }
        continue;
      }
      st[i] = KOD;
      if (c === "'") { mode = APOSTROF; i++; continue; }
      if (c === '"') { mode = UVODZOVKY; i++; continue; }
      if (c === '`') { mode = TEMPLATE; i++; continue; }
      if (c === '{') hlbka++;
      else if (c === '}') {
        if (hlbka === 0 && ramy.length) { hlbka = ramy.pop(); mode = TEMPLATE; i++; continue; }
        hlbka--;
      }
      i++; continue;
    }
    if (mode === APOSTROF || mode === UVODZOVKY) {
      st[i] = mode;
      if (c === '\\') { if (i + 1 < src.length) st[i + 1] = mode; i += 2; continue; }
      if ((mode === APOSTROF && c === "'") || (mode === UVODZOVKY && c === '"')) { mode = KOD; i++; continue; }
      i++; continue;
    }
    /* TEMPLATE */
    st[i] = TEMPLATE;
    if (c === '\\') { if (i + 1 < src.length) st[i + 1] = TEMPLATE; i += 2; continue; }
    if (c === '`') { mode = KOD; i++; continue; }
    if (c === '$' && d === '{') { st[i + 1] = KOD; ramy.push(hlbka); hlbka = 0; mode = KOD; i += 2; continue; }
    i++;
  }
  return st;
}

let totalHits = 0, totalFiles = 0, blocked = [], blizkeHits = 0, blizkeKde = [];

for (const rel of FILES) {
  const abs = SRC + rel;
  const orig = readFileSync(abs, 'utf8');
  const ST = stavy(orig);
  const vazba = alias(orig, ST);
  if (!vazba) continue;
  const { meno: A, odKde } = vazba;
  let out = '', last = 0, hits = 0, bhits = 0;
  /* Dvojité úvodzovky sa NECHYTAJÚ zámerne — v JSX je to atribút
   * (`stopColor="#1034A6"`) a ten by potreboval zložené zátvorky, nie holý
   * výraz. Jedna trieda zápisu navyše za jednu farbu nestojí. */
  const re = /'(#[0-9A-Fa-f]{6})'|'(rgba?\([^)']*\))'|#[0-9A-Fa-f]{6}\b|rgba?\([^)]*\)/g;
  for (const m of orig.matchAll(re)) {
    const whole = m[0];
    const quoted = m[1] || m[2];           // celý reťazec je farba → `T.x`
    const val = quoted || whole;
    const i = m.index;

    /* Presná zhoda s tokenom (nulová zmena) má prednosť pred zjednotením
     * papyrusových bielych — `#FBF5E6` JE `T.card`, netreba ho „približovať". */
    const tok = BY_VAL[norm(val)];
    const blizky = tok ? null : BLIZKE[val.toUpperCase()];
    if (!tok && !blizky) continue;
    const meno = tok || blizky;

    /* Komentár sa neprepisuje NIKDY — kód by bežal rovnako, ale veta o tom,
     * prečo tá farba kedysi bola taká, by prestala dávať zmysel.
     * Nad väzbou tiež nie — tam to meno ešte neexistuje. */
    const kde = ST[i];
    if (kde === RIADKOVY || kde === BLOKOVY || i < odKde) continue;

    let repl;
    if (quoted && kde === KOD) repl = `${A}.${meno}`;        // 'x' → T.x
    else if (!quoted && kde === TEMPLATE) repl = `\${${A}.${meno}}`; // v `…` → ${T.x}
    else continue;   // farba je kus dlhšieho reťazca — bez prepisu na template sa nedá

    out += orig.slice(last, i) + repl;
    last = i + whole.length;
    if (tok) hits++; else bhits++;
  }
  out += orig.slice(last);

  /* ── DÔKAZ: expanduj tokeny v OBOCH a porovnaj ───────────────────────────
   * Expandovať len nový súbor nestačí — pôvodný má vlastné `T.x` odkazy, ktoré
   * by sa rozišli. Porovnávajú sa preto dva rovnako rozvinuté tvary. */
  const expand = (s) => {
    /* ⚠️ DLHŠIE MENO PRVÉ. `ink` je predponou `inkStrong` aj `inkWarm`, takže
     * pri abecednom poradí sa z `T.inkStrong` stane `'#1F1A0E'strong`. */
    const poradie = Object.entries(TOK).sort((a, b) => b[0].length - a[0].length);
    for (const [k, v] of poradie) {
      s = s.split(`\${${A}.${k}}`).join(v);
      s = s.split(`${A}.${k}`).join(`'${v}'`);
    }
    return s;
  };
  /* Papyrusové biele sa na OBOCH stranách zrovnajú na cieľový token. Tá zmena je
   * zámer a je vypísaná zvlášť; dôkaz má strážiť to DRUHÉ — že codemod okrem nej
   * nesiahol na nič iné. Bez tohto kroku by každý súbor s bielou skončil
   * v „NEZAPÍSANÉ" a spolu s ním aj presné zhody, ktoré dokázané SÚ. */
  const zrovnaj = (s) => {
    for (const [lit, meno] of Object.entries(BLIZKE))
      s = s.split(lit.toLowerCase()).join(norm(TOK[meno]));
    return s;
  };
  /* Porovnáva sa cez `norm` (malé písmená, bez medzier): `#2A1608` vs `#2a1608`
   * a `rgba(201,154,63,.3)` vs `rgba(201, 154, 63, 0.30)` sú pre prehliadač tá
   * istá farba. Codemod nerobí nič okrem výmeny farieb, takže uvoľnenie na
   * veľkosť písmen a medzery nezakrýva žiadnu inú zmenu. */
  if ((hits || bhits) && zrovnaj(norm(expand(out))) !== zrovnaj(norm(expand(orig)))) {
    blocked.push(rel);
    if (process.argv.includes('--preco')) {
      const a = zrovnaj(norm(expand(out))), b = zrovnaj(norm(expand(orig)));
      let i = 0; while (a[i] === b[i] && i < a.length) i++;
      console.log(`   ↳ ${rel} — rozchod na ${i}`);
      console.log(`     nový : …${a.slice(Math.max(0, i - 50), i + 50)}`);
      console.log(`     starý: …${b.slice(Math.max(0, i - 50), i + 50)}`);
    }
    continue;
  }

  if (bhits) blizkeKde.push(`${String(bhits).padStart(3)}  ${rel}`);
  blizkeHits += bhits;

  if (!hits && !bhits) continue;
  totalHits += hits; totalFiles++;
  console.log(`  ${String(hits).padStart(3)} + ${String(bhits).padStart(3)}  ${rel}   (${A})`);
  if (WRITE) writeFileSync(abs, out);
}

console.log(`\n${WRITE ? 'ZAPÍSANÉ' : 'SUCHÝ BEH'} — ${totalHits} presných zhôd + ${blizkeHits} papyrusových bielych v ${totalFiles} súboroch`);
if (blizkeKde.length) {
  console.log(`\nPAPYRUSOVÉ BIELE (hodnota sa MENÍ o 1–2 jednotky na kanál — pozri v prehliadači):`);
  blizkeKde.forEach((b) => console.log('   ' + b));
}
if (blocked.length) {
  console.log(`\n⚠️ NEZAPÍSANÉ (spätná expanzia nesedela, teda by sa čosi zmenilo):`);
  blocked.forEach((b) => console.log('   ' + b));
}
