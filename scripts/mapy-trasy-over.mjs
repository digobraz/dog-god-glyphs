#!/usr/bin/env node
// MERANIE: nakreslia Mapy.com našu trasu? — zapisuje src/components/pack/mapyTrasy.meranie.json
//
// Odkaz „Trasa v Mapy.com" v článku výletu posiela 8 bodov našej stopy do plánovača Mapy.com
// (tripNav.ts → mapyRouteUrl). Plánovač ide len po chodníkoch, ktoré pozná; kde naša stopa
// ide terénom mimo nich, obchádza body po cestách a trasa narastie aj na dvojnásobok.
// Skript otvorí KAŽDÝ výlet v Mapy.com (headless), prečíta ich celkové km a porovná s našimi.
// Výlet mimo pásma sa zapíše do `mimo` — tomu appka odkaz neponúkne a ostane mu GPX.
//
//   node scripts/mapy-trasy-over.mjs            zmeria všetko a zapíše JSON
//   node scripts/mapy-trasy-over.mjs --suchy    len vypíše, nič nezapíše
//
// ⚠️ Beží proti ŽIVÉMU mapy.com (~63 stránok, 4 naraz, ~3 min). Po pridaní výletov spusti znova —
// nezmeraný výlet odkaz dostane.
// ⚠️ Km sa čítajú z textu ich stránky; Mapy.com píšu medzi číslo a jednotku NEZALOMITEĽNÚ
// medzeru (U+00A0). Bez jej nahradenia regex nenájde nič a všetko vyzerá ako chyba.

import { build } from 'esbuild';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/components/pack/mapyTrasy.meranie.json');
const DRY = process.argv.includes('--suchy');
// Pásmo: dlhšia trasa je nebezpečnejšia (obchádzka po ceste), kratšia len skracuje zákruty.
const MAX = 1.25, MIN = 0.8;

const tmp = mkdtempSync(join(tmpdir(), 'mapy-over-'));
const bundle = join(tmp, 'urls.mjs');
await build({
  stdin: {
    contents: `import { HERO_TRAILS } from '@/data/heroTrails.generated';
      import { mapyRouteUrl } from '@/components/pack/tripNav';
      export default HERO_TRAILS.map(t => ({ id: t.id, km: t.km, url: mapyRouteUrl(t) })).filter(x => x.url);`,
    resolveDir: ROOT, loader: 'ts',
  },
  bundle: true, platform: 'node', format: 'esm', outfile: bundle, logLevel: 'error',
  alias: { '@': join(ROOT, 'src') },
});
const trails = (await import(pathToFileURL(bundle).href)).default;

const browser = await chromium.launch();
const res = [];
async function measure(t) {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, locale: 'sk-SK' });
  const page = await ctx.newPage();
  let mapy = null;
  try {
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    for (let i = 0; i < 20 && mapy == null; i++) {
      await page.waitForTimeout(1000);
      const txt = (await page.evaluate(() => document.body.innerText)).replace(/ | /g, ' ');
      const m = txt.match(/(?:\d+:\d+ h|\d+ min)\s+([\d,]+) km/);
      if (m) mapy = parseFloat(m[1].replace(',', '.'));
    }
  } catch { /* mapy ostane null = nezmerané */ }
  await ctx.close();
  const ours = parseFloat(String(t.km).replace(',', '.'));
  const ratio = mapy == null ? null : +(mapy / ours).toFixed(2);
  res.push({ id: t.id, ours, mapy, ratio });
  process.stdout.write(ratio == null ? '?' : ratio > MAX || ratio < MIN ? '✗' : '·');
}
const queue = [...trails];
await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await measure(queue.shift()); }));
await browser.close();
console.log();

res.sort((a, b) => a.id.localeCompare(b.id));
const unmeasured = res.filter((r) => r.ratio == null);
const mimo = res.filter((r) => r.ratio != null && (r.ratio > MAX || r.ratio < MIN));
console.log(`zmerané ${res.length - unmeasured.length}/${res.length} · mimo pásma ${MIN}–${MAX}: ${mimo.length}`);
for (const r of mimo) console.log(`  ✗ ${r.ratio}×  naše ${r.ours} km · Mapy ${r.mapy} km  ${r.id}`);
for (const r of unmeasured) console.log(`  ? nezmerané  ${r.id}`);

// Nezmeraný výlet sa NEZAPÍŠE ako mimo: výpadok Mapy.com by inak zhasol odkaz všetkým.
if (unmeasured.length > res.length / 4) {
  console.error('🔴 viac ako štvrtina nezmeraná — Mapy.com asi nedostupné, nezapisujem.');
  process.exit(1);
}
if (!DRY) {
  writeFileSync(OUT, JSON.stringify({
    zmerane: new Date().toISOString().slice(0, 10),
    pasmo: [MIN, MAX],
    mimo: mimo.map(({ id, ours, mapy }) => ({ id, nase: ours, mapy })),
  }, null, 2) + '\n');
  console.log(`→ ${OUT}`);
}
