#!/usr/bin/env node
// STRÁŽ NA SPÄTNÝ APOSTROF V CSS-V-JS LITERÁLE.
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
// Púšťa sa automaticky pred `npm run build`. Samostatne: `npm run check:css`.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../src', import.meta.url).pathname;
const EXT = /\.(tsx?|jsx?)$/;

/** Nájde deklarácie typu `const NIECO_CSS = \`` a vráti telo literálu. */
const DECL = /const\s+([A-Za-z0-9_]*(?:CSS|css))\s*(?::\s*string\s*)?=\s*`/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXT.test(name)) out.push(p);
  }
  return out;
}

const bad = [];
for (const file of walk(ROOT)) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(DECL)) {
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
    const after = src.slice(i + 1, i + 3);
    // Zdravý literál končí na `;` (prípadne `\n;`). Čokoľvek iné = ukončil ho
    // apostrof v komentári a zvyšok CSS sa teraz tvári ako JavaScript.
    if (!/^\s*;/.test(after)) {
      const line = src.slice(0, i).split('\n').length;
      bad.push(`${file}:${line}  — literál ${m[1]} sa končí spätným apostrofom v tele (pravdepodobne v CSS komentári)`);
    }
  }
}

if (bad.length) {
  console.error('\n✖ Spätný apostrof v CSS-v-JS literáli — build by padol, tsc to nechytí:\n');
  for (const b of bad) console.error('  ' + b);
  console.error('\n  Oprava: v komentári vnútri CSS literálu píš názvy BEZ spätných apostrofov.\n');
  process.exit(1);
}
console.log('✓ CSS-v-JS literály sú čisté (0 spätných apostrofov v telách)');
