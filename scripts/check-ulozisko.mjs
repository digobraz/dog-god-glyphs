#!/usr/bin/env node
// STRÁŽ ÚLOŽISKA (21. 11. 2026, Matej: „toto sa nesmie už nikdy nikomu stať“).
// Fotky ako data URL v localStorage zaplnili iPhonu ~5 MB a padol zápis výletu aj s fotkami.
// Veľké dáta patria do `src/lib/bigStore.ts` (IndexedDB). Stráž hlási:
//  1. súbor, ktorý VYRÁBA data URL a zároveň PÍŠE do localStorage — mimo základne (vedome
//     preverené súbory nižšie, každý s dôvodom). Nový taký súbor zhodí build.
//  2. že stráž zápisov (`storageGuardInstall`) je PRVÝ import v `main.tsx`.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');

// Preverené 21. 11. 2026 — data URL v týchto súboroch do localStorage NEJDE:
const ZAKLADNA = {
  'src/components/ainubis/AinubisWidget.tsx': 'fotka do chatu ide na server; localStorage drží len id rozhovoru a stav panela',
  'src/components/pack/sos/sosLocal.ts': 'fotka kartičky ide do bigStore (IndexedDB); localStorage drží len malé údaje',
  'src/components/pack/vault/vaultScrolls.ts': 'obrázok pre zdieľanie sa nikam neukladá',
  'src/lib/devSeed.ts': 'len DEV dielňa heroflowu',
  'src/components/pack/dogCard/PackDogCard.tsx': 'vlastná fotka kartičky ide do bigStore (saveDraft); v koncepte ostane len `big: true`',
};

const VYROBA = /toDataURL\(|readAsDataURL\(|toDataUrl\(|blobToDataUrl\(/;
const ZAPIS = /localStorage\.setItem\(|localSet\(|writeJson\(|packStorage\.setItem\(|trpStore\.setItem\(/;

function* walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(f) && !/\.test\.tsx?$/.test(f)) yield p;
  }
}

const nalezy = [];
for (const p of walk(SRC)) {
  const rel = relative(ROOT, p);
  const s = readFileSync(p, 'utf8');
  if (VYROBA.test(s) && ZAPIS.test(s) && !ZAKLADNA[rel]) nalezy.push(rel);
}
for (const rel of Object.keys(ZAKLADNA)) {
  try { const s = readFileSync(join(ROOT, rel), 'utf8'); if (!(VYROBA.test(s) && ZAPIS.test(s))) console.log(`🟢 ${rel} už v základni byť nemusí — zmaž ho z nej`); }
  catch { console.log(`🟢 ${rel} neexistuje — zmaž ho zo základne`); }
}

const main = readFileSync(join(SRC, 'main.tsx'), 'utf8');
const prvyImport = main.split('\n').find((l) => /^import\s/.test(l)) ?? '';
const strazPrva = prvyImport.includes('storageGuardInstall');

if (nalezy.length || !strazPrva) {
  console.error('✗ check:ulozisko');
  for (const n of nalezy) console.error(`  🔴 ${n} vyrába data URL a píše do localStorage — fotku ulož cez bigSet() z @/lib/bigStore (IndexedDB). Keď je to preverené a do localStorage nejde, dopíš súbor do ZAKLADNA s dôvodom.`);
  if (!strazPrva) console.error(`  🔴 main.tsx: prvý import musí byť './lib/storageGuardInstall' (teraz: ${prvyImport || 'žiadny'})`);
  process.exit(1);
}
console.log('✓ check:ulozisko — veľké dáta mimo localStorage, stráž zápisov stojí prvá');
