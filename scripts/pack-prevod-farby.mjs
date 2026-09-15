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
import { readFileSync, writeFileSync } from 'node:fs';

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

/* ⚠️ ZOZNAM SA ROZŠIRUJE. Dnes pokrýva štyri povrchy z Matejovho výberu 15. 9.
 * (homepage · profil · psy · kvízy) a nad nimi hlási 0 — sú prevedené.
 * Pre ďalšie kolo doplň súbory podľa dlhu: `npm run check:pack -- --list`. */
const FILES = [
  'pages/Pack.tsx', 'components/pack/PackLayout.tsx', 'components/pack/HeroCard.tsx',
  'components/pack/PackSettings.tsx', 'components/pack/GlobePulse.tsx',
  'components/pack/FounderInvite.tsx', 'components/pack/VerseOfTheDay.tsx',
  'components/pack/PackWizard.tsx', 'components/pack/TripSpotlight.tsx',
  'components/pack/PlanAskCard.tsx', 'components/pack/Gateways.tsx',
  'pages/PackProfile.tsx', 'components/pack/profile/DogCardFields.tsx',
  'components/pack/profile/DogGallery.tsx', 'components/pack/profile/TripProfileCard.tsx',
  'pages/PackDogs.tsx', 'pages/PackDogDetail.tsx', 'components/pack/calendar/PackCalendar.tsx',
  'components/pack/DogPassport.tsx', 'components/pack/DogStats.tsx',
  'pages/PackNatureQuiz.tsx', 'pages/PackDogQuiz.tsx',
];

/* Meno, pod ktorým má súbor tému v ruke: `const T = PACK_THEME` alebo priamo. */
function alias(src) {
  if (/\bconst\s+T\s*=\s*PACK_THEME\b/.test(src)) return 'T';
  if (/\bPACK_THEME\b/.test(src)) return 'PACK_THEME';
  return null;
}

/* V template literáli sa píše `${T.x}`, v obyčajnom výraze `T.x`.
 * Rozlíšenie: počet apostrofovaných úvodzoviek pred pozíciou — nepresné pri
 * backticku v komentári, preto to na konci overuje spätná expanzia. */
const inTemplate = (src, i) => (src.slice(0, i).match(/`/g) || []).length % 2 === 1;

let totalHits = 0, totalFiles = 0, blocked = [];

for (const rel of FILES) {
  const abs = SRC + rel;
  const orig = readFileSync(abs, 'utf8');
  const A = alias(orig);
  if (!A) continue;

  let out = '', last = 0, hits = 0;
  /* Dvojité úvodzovky sa NECHYTAJÚ zámerne — v JSX je to atribút
   * (`stopColor="#1034A6"`) a ten by potreboval zložené zátvorky, nie holý
   * výraz. Jedna trieda zápisu navyše za jednu farbu nestojí. */
  const re = /'(#[0-9A-Fa-f]{6})'|#[0-9A-Fa-f]{6}\b|rgba?\([^)]*\)/g;
  for (const m of orig.matchAll(re)) {
    const whole = m[0];
    const quoted = m[1];                   // celý reťazec je farba → `T.x`
    const val = quoted || whole;
    const tok = BY_VAL[norm(val)];
    if (!tok) continue;

    const i = m.index;
    let repl;
    if (quoted) repl = `${A}.${tok}`;                       // 'x' → T.x
    else if (inTemplate(orig, i)) repl = `\${${A}.${tok}}`; // v `…` → ${T.x}
    else continue;                                          // vnútri '…' s textom — necháme

    out += orig.slice(last, i) + repl;
    last = i + whole.length;
    hits++;
  }
  out += orig.slice(last);
  if (!hits) continue;

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
  /* Porovnáva sa cez `norm` (malé písmená, bez medzier): `#2A1608` vs `#2a1608`
   * a `rgba(201,154,63,.3)` vs `rgba(201, 154, 63, 0.30)` sú pre prehliadač tá
   * istá farba. Codemod nerobí nič okrem výmeny farieb, takže uvoľnenie na
   * veľkosť písmen a medzery nezakrýva žiadnu inú zmenu. */
  if (norm(expand(out)) !== norm(expand(orig))) {
    blocked.push(rel);
    if (process.argv.includes('--preco')) {
      const a = norm(expand(out)), b = norm(expand(orig));
      let i = 0; while (a[i] === b[i] && i < a.length) i++;
      console.log(`   ↳ ${rel} — rozchod na ${i}`);
      console.log(`     nový : …${a.slice(Math.max(0, i - 50), i + 50)}`);
      console.log(`     starý: …${b.slice(Math.max(0, i - 50), i + 50)}`);
    }
    continue;
  }

  totalHits += hits; totalFiles++;
  console.log(`  ${String(hits).padStart(3)}  ${rel}   (${A})`);
  if (WRITE) writeFileSync(abs, out);
}

console.log(`\n${WRITE ? 'ZAPÍSANÉ' : 'SUCHÝ BEH'} — ${totalHits} farieb v ${totalFiles} súboroch`);
if (blocked.length) {
  console.log(`\n⚠️ NEZAPÍSANÉ (spätná expanzia nesedela, teda by sa čosi zmenilo):`);
  blocked.forEach((b) => console.log('   ' + b));
}
