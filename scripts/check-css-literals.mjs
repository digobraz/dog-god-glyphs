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
// Púšťa sa automaticky pred `npm run build`. Samostatne: `npm run check:css`.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../src', import.meta.url).pathname;
const EXT = /\.(tsx?|jsx?)$/;

/**
 * Nájde CSS literál a vráti jeho telo. DVE formy, nie jedna:
 *   `const NIECO_CSS = \``  ·  `<style>{\``
 * ⚠️ Druhá tu 25. 8. 2026 CHÝBALA, hoci ju hlavička súboru sľubovala. Stena aj
 * planéta (`GodsGridLab`, `DogPlanetLab`) píšu CSS práve inline v `<style>`,
 * takže stráž nad nimi hlásila „čisté" a build padol o sekundu neskôr presne
 * na tom apostrofe, kvôli ktorému stráž vznikla.
 */
const DECL = /(?:const\s+([A-Za-z0-9_]*(?:CSS|css))\s*(?::\s*string\s*)?=|<(style)>\s*\{)\s*`/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXT.test(name)) out.push(p);
  }
  return out;
}

// Kaskádové nálezy sa zbierajú ZVLÁŠŤ a NEZHADZUJÚ build. Dôvod: v repe ich je
// deväť a všetky sú staršie než stráž — okrem iného v psom bloku (`.dogblk`), ktorý
// je LOCKED a Matej ho odsúhlasil TAK, AKO DNES VYZERÁ, teda vrátane toho, že sa
// mobilný prepis neuplatňuje. Hromadná „oprava" by naraz zmenila schválený vzhľad
// na piatich obrazovkách; to je rozhodnutie pre Mateja, nie pre skript.
// Fatálne ostávajú len apostrof a ${ — tie build reálne rozbijú.
const bad = [];
const cascade = [];
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
    for (const mq of cssOnly.matchAll(/@media[^{]*\{([\s\S]*?)\n\}/g)) {
      const mqStart = mq.index;
      const mqEnd = mqStart + mq[0].length;
      for (const rule of mq[1].matchAll(/(^|[\n;}])\s*(\.[A-Za-z0-9_-]+)\s*\{([^}]*)\}/g)) {
        const sel = rule[2];
        const mqProps = props(rule[3]);
        if (!mqProps.size) continue;
        const baseRe = new RegExp('(^|[\\n}])\\s*' + sel.replace('.', '\\.') + '\\s*\\{([^}]*)\\}', 'g');
        for (const base of cssOnly.matchAll(baseRe)) {
          if (base.index <= mqStart) continue;         // base je VYŠŠIE → prepis vyhrá
          if (base.index < mqEnd) continue;            // to je pravidlo vnútri tej istej @media
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

    const after = src.slice(i + 1, i + 3);
    // Zdravý literál končí na `;` (konštanta) alebo `}` (`<style>{...}`).
    // Čokoľvek iné = ukončil ho apostrof v komentári a zvyšok CSS sa teraz
    // tvári ako JavaScript.
    if (!/^\s*[;}]/.test(after)) {
      const line = src.slice(0, i).split('\n').length;
      bad.push(`${file}:${line}  — literál ${label} sa končí spätným apostrofom v tele (pravdepodobne v CSS komentári)`);
    }
  }
}

if (bad.length) {
  console.error('\n✖ CSS-v-JS literál by zhodil build (tsc to nechytí):\n');
  for (const b of bad) console.error('  ' + b);
  console.error('\n  Oprava: v komentári vnútri CSS literálu píš názvy BEZ spätných apostrofov; ak naozaj potrebuješ ${, daj doň úvodzovky.\n');
  process.exit(1);
}
if (cascade.length) {
  console.warn(`\n⚠️  ${cascade.length}× jednotriedny prepis v @media, ktorý nižšie prebíja to isté pravidlo`);
  console.warn('   (media query nepridáva špecificitu — prepis sa TICHO neuplatní; oprava = dvojtriedny selektor)\n');
  for (const c of cascade) console.warn('  ' + c);
  console.warn('\n   Build to nezhadzuje. Pri práci na danom súbore to oprav; hromadne nie —');
  console.warn('   zmenil by sa vzhľad obrazoviek, ktoré Matej odsúhlasil v dnešnej podobe.\n');
}
console.log('✓ CSS-v-JS literály sú čisté (0 spätných apostrofov, 0 ${ v komentároch)');
