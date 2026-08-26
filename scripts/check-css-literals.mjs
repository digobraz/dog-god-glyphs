#!/usr/bin/env node
// STRÁŽ NA CUDZIE ZNAKY V CSS-V-JS LITERÁLE — SPÄTNÝ APOSTROF A ${.
//
// PREČO EXISTUJE: v projekte držíme CSS v JS template literáloch
// (`const HUB_CSS = ...`, `NQ_CSS`, `GLASS_CSS`, `<style>{...}</style>`). Spätný
// apostrof kdekoľvek vnútri — typicky v komentári, keď sa v ňom cituje názov triedy
// alebo tokenu — reťazec PREDČASNE UKONČÍ. Následok: dev server vráti 500,
// stránka spadne na „Something went wrong." a `npx tsc --noEmit` prejde bez slova,
// takže typová kontrola dá falošné zelené. Chytí to až `vite build`.
//
// Stalo sa to opakovane (GodsGrid 9.7., Heroglyph 13.7., HUB_CSS v PackDogs,
// NQ_CSS v PackNatureQuiz 14.8. dvakrát v jednej session) — vždy pri písaní
// komentára, teda vždy pri práci, ktorá s CSS nesúvisí. Preto stráž, nie ďalšia
// poznámka v hlavičke súboru: poznámku má súbor už teraz a nepomohla.
//
// DRUHÁ PASCA, TEN ISTÝ TVAR (doplnené 21. 8. 2026): `${` v komentári. Nie je to
// text, je to INTERPOLÁCIA — esbuild sa pokúsi vyhodnotiť, čo je vnútri, a build
// padne na syntaktickej chybe („z packTheme.ts nižšie cez ${...}" v MapNotesLayer).
// Chytá sa to rovnako neskoro ako apostrof, tak nech to chytá tá istá stráž.
//
// TRETIA PASCA, INÝ TVAR (doplnené 22. 8. 2026): JEDNOTRIEDNY PREPIS V @media.
// `@media` NEPRIDÁVA špecificitu, takže `.trieda{...}` vnútri nej má presne takú
// váhu ako `.trieda{...}` mimo nej — a rozhoduje PORADIE v literále. Keďže CSS
// tu žije v jednom template literale a media queries bývajú hore, mobilný prepis
// ticho prehrá s base pravidlom napísaným o desiatky riadkov nižšie. Vyzerá to
// ako „media query nefunguje" (matchMedia pritom hlási zhodu) a padlo to už
// TRIKRÁT: PackTripArticle 5. 8., PackDogs 7. 8., AddMapNote 22. 8.
// Oprava je vždy tá istá: prepis v @media píš DVOJTRIEDNE (`.rodic .dieta`),
// nie presúvaním bloku naspodok — to vydrží len po najbližší dopísaný riadok.
//
// ── 26. 8. 2026 — ZMENA PRÍSTUPU: NAJPRV SKUTOČNÝ PARSER, POTOM VZORY ─────────
// Stráž prepustila spätný apostrof TRETÍKRÁT (`PackMap.tsx`, `PALE_CSS`). Zakaždým
// z toho istého dôvodu: `DECL` hľadal TVAR DEKLARÁCIE literálu a zakaždým sa našiel
// štvrtý tvar, ktorý v ňom nebol —
//     9.–14. 8.  `const NIECO_CSS = \``            ✓ pokryté
//     25. 8.     `<style>{\``                       ✗ dopísané až po páde
//     26. 8.     `const PALE_CSS = X ? '' : \``     ✗ ternár medzi `=` a apostrofom
// Doplniť piatu alternáciu by znamenalo čakať na šiesty tvar. Preto sa fatálna
// kontrola prestala robiť vzorom a robí ju **esbuild — ten istý parser, ktorý
// zhadzuje build**. 328 súborov za ~0,5 s, teda lacnejšie než jeden `vite build`,
// a chytí to bez ohľadu na to, ako je literál zapísaný. Vzory zostali len tam, kde
// parser NEPOMÔŽE: `${` v komentári a kaskáda v `@media` sú platný JavaScript aj
// platné CSS — sú to chyby VÝZNAMU, nie syntaxe.
//
// ⚠️ HRANICA NÁSTROJA: parser beží nad KAŽDÝM SÚBOROM ZVLÁŠŤ, takže nevidí, či sa
// importy dajú nájsť. Chýbajúci modul (`@/components/Footer` namiesto
// `@/components/landing/Footer`) tu prejde a padne až vo `vite build`, ktorý skladá graf.
// Nie je to diera, je to deliaca čiara: syntax za pol sekundy tu, rozlíšenie importov tam.
// Zelená hláška teda NEZNAMENÁ „build prejde".
//
// Púšťa sa automaticky pred `npm run build`. Samostatne: `npm run check:css`.
// Na inom priečinku (test stráže): `node scripts/check-css-literals.mjs <cesta>`.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { transformSync } from 'esbuild';

const ROOT = process.argv[2] ? resolve(process.argv[2]) : new URL('../src', import.meta.url).pathname;
const EXT = /\.(tsx?|jsx?)$/;

/**
 * Nájde CSS literál a vráti jeho telo. DVE formy, nie jedna:
 *   `const NIECO_CSS = \``  ·  `<style>{\``
 * ⚠️ Druhá tu 25. 8. 2026 CHÝBALA, hoci ju hlavička súboru sľubovala. Stena aj
 * planéta (`GodsGridLab`, `DogPlanetLab`) píšu CSS práve inline v `<style>`,
 * takže stráž nad nimi hlásila „čisté" a build padol o sekundu neskôr presne
 * na tom apostrofe, kvôli ktorému stráž vznikla.
 */
// ⚠️ TRETIA forma pribudla 26. 8.: medzi `=` a apostrofom smie stáť VÝRAZ na tom istom
// riadku — `const PALE_CSS = MAP_SKIN !== 'pale' ? '' : \``. Preto `[^;`\n]*` namiesto
// samotného `\s*`. Aj tak je to len pomôcka pre kontroly VÝZNAMU nižšie; syntax stráži
// parser, ktorému je tvar deklarácie ukradnutý.
const DECL = /(?:const\s+([A-Za-z0-9_]*(?:CSS|css))\s*(?::\s*string\s*)?=|<(style)>\s*\{)[^;`\n]*`/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXT.test(name)) out.push(p);
  }
  return out;
}

// Kaskádové nálezy sa zbierajú ZVLÁŠŤ a NEZHADZUJÚ build.
//
// 🔴 OPRAVA 26. 8. 2026 — VŠETKÝCH DOVTEDAJŠÍCH 9 (po rozšírení 17) NÁLEZOV BOLO
// FALOŠNÝCH. Detektor porovnával `base.index`, lenže ten ukazuje na ODDEĽOVAČ pred
// selektorom (`(^|[\n}])`) — a keď tým oddeľovačom bola zatváracia zátvorka @media
// bloku, index padol DOVNÚTRA neho. Pravidlo hneď ZA media query sa tak tvárilo, že
// je v nej, a hlásilo sa ako kolízia s ďalším pravidlom nižšie. Rieši to `baseAt`.
//
// Tu stávalo, že nálezy sú reálne a že psí blok (`.dogblk`) má mobilný prepis, ktorý
// sa NEUPLATŇUJE, a Matej ho tak odsúhlasil. **Nie je to pravda a nikdy nebola:**
// `.dogblk` má base na r. 180 a VŠETKY prepisy (r. 241, 337, 358) sú POD ním, takže
// media queries vyhrávajú normálne. Nechať tam ten výmysel by znamenalo, že si podľa
// neho niekto raz „opraví" LOCKED komponent.
//
// Nahlásila to paralelná session na `.trp-addhost` v `PackMap.tsx`; overené v zdroji
// aj protipríkladom (pravidlo v @media vs. v INEJ @media = dve podmienené vetvy, nie
// kolízia). Po oprave je repo na NULE nálezov a detektor je odskúšaný oboma smermi.
// Fatálne ostávajú len apostrof a ${ — tie build reálne rozbijú.
const bad = [];
const cascade = [];
/** Pomocné nálezy per súbor — vypíšu sa LEN k súboru, ktorý parser odmietol. */
const hints = {};
for (const file of walk(ROOT)) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(DECL)) {
    const label = m[1] || '<style>';
    const start = m.index + m[0].length;
    // Koniec literálu = prvý spätný apostrof, ktorý nie je escapovaný.
    // Ak je v tele apostrof navyše, literál skončí PRED koncom CSS bloku —
    // a presne to hľadáme: nájdeme prvý koniec a pozrieme, či za ním pokračuje CSS.
    let i = start;
    while (i < src.length) {
      if (src[i] === '\\') { i += 2; continue; }
      if (src[i] === '`') break;
      i += 1;
    }
    const bodyText = src.slice(start, i);
    // ${ v KOMENTÁRI. Platné interpolácie sú v CSS pravidlách (`color:${T.x}`), takže
    // sa pozeráme len dovnútra /* ... */ blokov — inak by stráž hlásila každý token.
    // VÝNIMKA: `${'text'}` je ZÁMERNÝ únik — interpolácia reťazcovej konštanty,
    // ktorá do komentára vypíše presne to, čo je v úvodzovkách, a nič nevyhodnocuje.
    // Používa ho napr. COMMUNITY_CSS. Hlásime len `${` bez úvodzovky za ním.
    for (const c of bodyText.matchAll(/\/\*[\s\S]*?\*\//g)) {
      if (!/\$\{\s*[^'"\s]/.test(c[0])) continue;
      const line = src.slice(0, start + c.index).split('\n').length;
      bad.push(`${file}:${line}  — literál ${label} má \${ v CSS komentári (esbuild to vyhodnotí ako interpoláciu, nie text)`);
    }

    // ── JEDNOTRIEDNY PREPIS V @media, KTORÝ NIŽŠIE PREBÍJA ROVNAKÁ TRIEDA ───
    // Hlási sa len SKUTOČNÁ kolízia: tá istá trieda, tá istá VLASTNOSŤ, base
    // pravidlo NIŽŠIE v literále. Porovnávať len selektory nestačí — mobilný
    // prepis `padding` a base `flex` na tej istej triede si neprekážajú a stráž,
    // ktorá ich hlási, sa po tretej falošnej hláške vypne.
    const cssOnly = bodyText.replace(/\/\*[\s\S]*?\*\//g, ' ');
    const props = (block) => new Set(
      [...block.matchAll(/(^|[;{])\s*([a-z-]+)\s*:/g)].map((x) => x[2]),
    );
    // Rozsahy VŠETKÝCH @media blokov — potrebné nižšie. Pravidlo, ktoré leží v inej
    // @media, NIE JE „base pravidlo"; obe sú podmienené a nikdy neplatia naraz.
    // ⚠️ Bez tejto kontroly stráž hlásila `.trp-addhost` v `PackMap.tsx` ako kolíziu
    // s pravidlom o 170 riadkov nižšie, ktoré je ale mobilná vetva vo vlastnej
    // `@media (max-width:1023px)` (nahlásila to paralelná session 26. 8., overené).
    // Falošná hláška je pri VAROVANÍ horšia než chýbajúca — po tretej ju nikto nečíta.
    const mediaRanges = [...cssOnly.matchAll(/@media[^{]*\{([\s\S]*?)\n\}/g)]
      .map((m) => [m.index, m.index + m[0].length]);
    const insideMedia = (idx) => mediaRanges.some(([a, b]) => idx >= a && idx < b);

    for (const mq of cssOnly.matchAll(/@media[^{]*\{([\s\S]*?)\n\}/g)) {
      const mqStart = mq.index;
      const mqEnd = mqStart + mq[0].length;
      for (const rule of mq[1].matchAll(/(^|[\n;}])\s*(\.[A-Za-z0-9_-]+)\s*\{([^}]*)\}/g)) {
        const sel = rule[2];
        const mqProps = props(rule[3]);
        if (!mqProps.size) continue;
        const baseRe = new RegExp('(^|[\\n}])\\s*' + sel.replace('.', '\\.') + '\\s*\\{([^}]*)\\}', 'g');
        for (const base of cssOnly.matchAll(baseRe)) {
          // ⚠️ `base.index` ukazuje na ODDEĽOVAČ pred selektorom (`(^|[\n}])`), nie na
          // selektor. Keď je tým oddeľovačom zatváracia zátvorka @media bloku, index
          // padne DOVNÚTRA toho bloku a všetky tri kontroly nižšie rozhodnú opačne —
          // pravidlo hneď za @media by sa tvárilo, že je v nej. Preto `baseAt`.
          const baseAt = base.index + (base[1]?.length ?? 0);
          if (baseAt <= mqStart) continue;             // base je VYŠŠIE → prepis vyhrá
          if (baseAt < mqEnd) continue;                // to je pravidlo vnútri tej istej @media
          if (insideMedia(baseAt)) continue;           // iná @media → dve podmienené vetvy, nie kolízia
          const kolizia = [...props(base[2])].filter((x) => mqProps.has(x));
          if (!kolizia.length) continue;               // iné vlastnosti → nekolidujú
          const line = src.slice(0, start + mqStart).split('\n').length;
          cascade.push(
            `${file}:${line}  — literál ${label}: prepis ${sel} v @media nastavuje ${kolizia.join(', ')}, ` +
            `ale to isté nastavuje aj ${sel} NIŽŠIE mimo @media → prehrá (media query nepridáva špecificitu). ` +
            `Napíš ho dvojtriedne, napr. .rodic ${sel}`,
          );
          break;
        }
      }
    }

    // Zdravý literál končí na `;` (konštanta) alebo `}` (`<style>{...}`). Čokoľvek iné
    // znamená, že ho ukončil apostrof v komentári a zvyšok CSS sa teraz tvári ako JS.
    //
    // ⚠️ Toto UŽ NIE JE fatálna kontrola, len POMÔCKA. Odkedy `DECL` pripúšťa výraz medzi
    // `=` a apostrofom, vie sa trafiť aj do literálu, ktorý CSS vôbec nie je, a hlásiť
    // zdravý kód. Rozhoduje parser nižšie; odtiaľto ide len presné miesto, ktoré sa
    // vypíše k jeho chybe — esbuild totiž ohlási až miesto, kde sa zvyšok CSS začal
    // parsovať ako JavaScript, nie ten apostrof, čo to spôsobil.
    if (!/^\s*[;}]/.test(src.slice(i + 1, i + 3))) {
      const line = src.slice(0, i).split('\n').length;
      (hints[file] ??= []).push(`literál ${label} sa končí spätným apostrofom v tele (r. ${line}) — pravdepodobne v CSS komentári`);
    }

    // ── SPÄTNÝ APOSTROF V CSS KOMENTÁRI, KTORÝ SA NÁHODOU DÁ ROZPARSOVAŤ ──────────
    // ⚠️ PARSER SÁM NESTAČÍ (zistené 26. 8. 2026, druhý pád v jednej session).
    // `⚠️ PREBÍJA \`.on\` ZÁMERNE: „hotové"…` ukončilo STEP_CSS na prvom apostrofe,
    // ale zvyšok — `.on\`ZÁMERNE…\`` — je PLATNÝ JavaScript: prístup k vlastnosti
    // reťazca a za ním tagovaný template. esbuild teda prešiel bez slova, `tsc` tiež,
    // a appka spadla až v prehliadači na „<celé CSS>.on is not a function".
    // Preto sa okrem syntaxe kontroluje aj TOTO: či prvý apostrof, ktorý literál
    // ukončil, neleží vnútri /* … */ komentára. Ak áno, je to vždy chyba — v CSS
    // komentári nemá spätný apostrof čo robiť a v tele literálu ho ukončiť nechceme.
    let open = -1;
    for (let k = 0; k < bodyText.length - 1; k += 1) {
      if (open < 0 && bodyText[k] === '/' && bodyText[k + 1] === '*') { open = k; k += 1; continue; }
      if (open >= 0 && bodyText[k] === '*' && bodyText[k + 1] === '/') { open = -1; k += 1; }
    }
    if (open >= 0 && i < src.length) {
      const line = src.slice(0, i).split('\n').length;
      bad.push(`${file}:${line}  — literál ${label} má spätný apostrof v CSS komentári (ukončí reťazec; zvyšok CSS sa stane JavaScriptom)`);
    }
  }

  // ── FATÁLNA KONTROLA: TEN ISTÝ PARSER, KTORÝ ZHADZUJE BUILD ──────────────
  // Nezáleží na tom, ako je literál zapísaný, ani či je to vôbec CSS. Ak sa súbor
  // nedá rozparsovať, `vite build` padne — len o minútu neskôr a po zbytočnej práci.
  // Chytí to aj hocijakú inú syntaktickú chybu, čo je bonus zadarmo (~0,5 s / 328 súborov).
  try {
    transformSync(src, { loader: file.endsWith('x') ? 'tsx' : 'ts', sourcefile: file });
  } catch (err) {
    const e = err?.errors?.[0];
    const at = e?.location ? `${file}:${e.location.line}:${e.location.column}` : file;
    bad.push(`${at}  — ${e?.text ?? err.message}`);
    for (const h of hints[file] ?? []) bad.push(`${' '.repeat(4)}↳ ${h}`);
  }
}

if (bad.length) {
  console.error('\n✖ CSS-v-JS literál by zhodil build (tsc to nechytí):\n');
  for (const b of bad) console.error('  ' + b);
  console.error('\n  Najčastejšia príčina: spätný apostrof v CSS komentári vnútri template literálu —');
  console.error('  píš názvy tried BEZ apostrofov. Ak naozaj potrebuješ ${, daj doň úvodzovky.\n');
  process.exit(1);
}
if (cascade.length) {
  console.warn(`\n⚠️  ${cascade.length}× jednotriedny prepis v @media, ktorý nižšie prebíja to isté pravidlo`);
  console.warn('   (media query nepridáva špecificitu — prepis sa TICHO neuplatní; oprava = dvojtriedny selektor)\n');
  for (const c of cascade) console.warn('  ' + c);
  console.warn('\n   Build to nezhadzuje. Pri práci na danom súbore to oprav; hromadne nie —');
  console.warn('   zmenil by sa vzhľad obrazoviek, ktoré Matej odsúhlasil v dnešnej podobe.\n');
}
console.log(`✓ ${walk(ROOT).length} súborov prešlo parserom · 0 spätných apostrofov v literáli, 0 \${ v komentároch`);
