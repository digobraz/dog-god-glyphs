#!/usr/bin/env node
// STRÁŽ PREHLIADKY — každá routa `/pack` v `App.tsx` musí mať v registri `wizSteps.ts`
// rozhodnutie (kroky · čaká · nehodí sa). Nová funkcia bez rozhodnutia = červená.
// Matej 6. 10. 2026: „pipeline wizarda … aby sme vždy vedeli doplniť nového pri novej funkcii".
//
//   npm run check:wizard          → kontrola (exit 1 pri chybe)
//   npm run check:wizard -- --mapa → vypíše mapu obrazovka × kôš × stav × kroky
//
// Kontroluje aj opačný smer: vzor v registri, ktorý v App.tsx už nie je (mŕtvy riadok),
// kotvu kroku, ktorá vo `wizAnchors.ts` nie je, a duplicitné ID krokov.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { build } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mapa = process.argv.includes('--mapa');

const out = await build({
  entryPoints: [join(root, 'src/components/pack/wizSteps.ts')],
  bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
});
const mod = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
const { WIZ_SCREENS } = mod;

const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const routes = [...new Set([...app.matchAll(/<Route\s+path="(\/pack[^"]*)"/g)].map((m) => m[1]))];
const inReg = new Map();
for (const s of WIZ_SCREENS) for (const r of s.routes) inReg.set(r, s);

const zle = [];
for (const r of routes) if (!inReg.has(r)) zle.push(`🔴 routa bez rozhodnutia: ${r}  → pridaj riadok do wizSteps.ts (kroky / caka / nie + why)`);
for (const [r] of inReg) if (!routes.includes(r)) zle.push(`🔴 mŕtvy riadok v registri: ${r} (v App.tsx už nie je)`);
const ids = new Set();
for (const s of WIZ_SCREENS) {
  if (s.status === 'nie' && !s.why) zle.push(`🔴 ${s.key}: „nie" bez dôvodu (why)`);
  if (s.status === 'kroky' && !s.steps.length) zle.push(`🔴 ${s.key}: status „kroky" bez krokov`);
  for (const st of s.steps) {
    if (ids.has(st.id)) zle.push(`🔴 duplicitné id kroku: ${st.id}`);
    ids.add(st.id);
    if (!st.anchor) zle.push(`🔴 ${st.id}: kotva neexistuje vo wizAnchors.ts`);
  }
}

const caka = WIZ_SCREENS.filter((s) => s.status === 'caka');
if (mapa) {
  console.log('obrazovka'.padEnd(14), 'kôš', 'stav'.padEnd(6), 'kroky');
  for (const s of WIZ_SCREENS) {
    const on = s.steps.filter((x) => x.on !== false).length;
    console.log(s.key.padEnd(14), String(s.basket).padEnd(3), s.status.padEnd(6), s.status === 'nie' ? `— ${s.why}` : `${on}/${s.steps.length} zapnutých`);
  }
}
if (zle.length) { console.log(zle.join('\n')); process.exit(1); }
console.log(`✓ prehliadka: ${routes.length} rout /pack, každá má rozhodnutie · ${ids.size} krokov`
  + (caka.length ? ` · 🟠 čaká na text: ${caka.map((s) => s.key).join(', ')}` : ''));
