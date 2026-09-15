#!/usr/bin/env node
/* Kolo 1 prevodu `/pack`: odsadenia a letterSpacing na rebrík.
 *
 * NA ROZDIEL OD KOLA 0 TOTO PIXEL POHNE. Preto vypisuje každý posun väčší než
 * 4 px zvlášť — to sú miesta, ktoré treba pozrieť v prehliadači.
 *
 *   node prilep.mjs           → suchý beh
 *   node prilep.mjs --write   → zapíše
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = new URL('../src/', import.meta.url).pathname;
const WRITE = process.argv.includes('--write');

const S_OK = [0, 4, 8, 12, 16, 24, 32, 48];      // PACK_SPACE (32/48 od 15. 9.)
const LS_OK = [0, 0.02, 0.14, 0.22, 0.26];       // PACK_HEAD + pilulka dní

/** Odsadenie na najbližší stupeň. Pod 4 px sa NEPADÁ na 0 — nula je „žiadne
 *  odsadenie", teda iný zámer než „malé odsadenie". 2 px preto ide na 4. */
function snapPad(v) {
  if (v === 0) return 0;
  if (v < 4) return 4;
  if (v > 48) return v;                          // veľké rozostupy neriešime
  let best = S_OK[0];
  for (const s of S_OK) if (Math.abs(s - v) < Math.abs(best - v) || (Math.abs(s - v) === Math.abs(best - v) && s > best)) best = s;
  return best;                                   // pri zhodnej vzdialenosti VYŠŠÍ (14 → 16)
}

/** letterSpacing podľa pásiem. Matejov náhľad mal „.01–.13 → .14", ALE dáta to
 *  vyvrátili: `.03–.08em` nesedí na nadpisoch, sedí na PILULKÁCH a hustých
 *  popiskoch (`.cal-dogpill` 12px Cinzel, `.dogblk-pill` 10px, `.cal-mlbl i`
 *  s `white-space:nowrap; overflow:hidden`). Roztiahnutie takého popisku na
 *  .14em ho odreže — presne porucha, pred ktorou lock varuje pri hustej mriežke.
 *  Preto má tesné pásmo vlastný cieľ `.02em`, čo JE hodnota locknutej pilulky
 *  dní (PackTree.tsx). Najväčší posun tým klesol z .13em na .06em. */
function snapLs(v) {
  if (v <= 0) return 0;
  if (v <= 0.08) return 0.02;                    // .01–.08  → tesné: pilulka, meno
  if (v < 0.16) return 0.14;                     // .10–.13  → nadpis karty
  if (v <= 0.24) return 0.22;                    // .16–.24  → nadpis sekcie
  return 0.26;                                   // .26–.34  → štítok
}

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

const velke = [];
let zmien = 0, suborov = 0;

for (const rel of FILES) {
  const abs = SRC + rel;
  const orig = readFileSync(abs, 'utf8');
  let out = orig, hits = 0;

  /* ── ODSADENIA ──────────────────────────────────────────────────────────
   * Hodnota sa mení LEN vnútri `padding…:` deklarácie, nie kdekoľvek v súbore —
   * inak by sa prepísali šírky, pozície a `gap`, ktorý je mimo rebríka zámerne. */
  const padDecl = /(padding(?:Top|Right|Bottom|Left|Block|Inline)?\s*:\s*['"])([^'"]*)(['"])|(padding(?:-(?:top|right|bottom|left))?\s*:\s*)([^;'"`{}]+)(;)/g;
  out = out.replace(padDecl, (m, p1, v1, p3, p4, v2, p6) => {
    const pre = p1 ?? p4, val = v1 ?? v2, post = p3 ?? p6;
    if (/\$\{|var\(|calc\(|%|auto/.test(val)) return m;
    const nv = val.replace(/(-?[\d.]+)px/g, (mm, n) => {
      const v = +n, s = snapPad(v);
      if (s === v) return mm;
      hits++;
      if (Math.abs(s - v) > 4) velke.push(`${rel}  ${v}px → ${s}px  (${val.trim()})`);
      return s + 'px';
    });
    return pre + nv + post;
  });

  /* ── letterSpacing ──────────────────────────────────────────────────────── */
  out = out.replace(/(letter-?[Ss]pacing\s*:\s*['"`]?)(-?[\d.]*\d)(\s*em)/g, (m, pre, n, post) => {
    const v = Math.round(parseFloat(n) * 1000) / 1000;
    if (LS_OK.includes(v)) return m;
    const s = snapLs(v);
    hits++;
    if (Math.abs(s - v) > 0.08) velke.push(`${rel}  ${v}em → ${s}em  (letterSpacing)`);
    return pre + s + post;
  });

  if (!hits) continue;
  zmien += hits; suborov++;
  console.log(`  ${String(hits).padStart(3)}  ${rel}`);
  if (WRITE) writeFileSync(abs, out);
}

console.log(`\n${WRITE ? 'ZAPÍSANÉ' : 'SUCHÝ BEH'} — ${zmien} hodnôt v ${suborov} súboroch`);
if (velke.length) {
  console.log(`\n⚠️ POSUNY NAD 4 px / .08em — ${velke.length}×, toto pozri v prehliadači:`);
  velke.forEach((v) => console.log('   ' + v));
}
