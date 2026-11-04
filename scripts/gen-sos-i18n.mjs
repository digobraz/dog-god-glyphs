#!/usr/bin/env node
// Generátor textov SOS (stratený pes): `src/components/pack/sos/sosTexts.ts` → blok `⟦pack.sos⟧` v en/sk/cs.ts.
//   node scripts/gen-sos-i18n.mjs          zapíše
//   node scripts/gen-sos-i18n.mjs --check  padne, keď je blok neaktuálny
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { build } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const out = await build({ entryPoints: [join(root, 'src/components/pack/sos/sosTexts.ts')], bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent' });
const { SOS_TEXTS } = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));

const OPEN = '  // ⟦pack.sos⟧ generované (scripts/gen-sos-i18n.mjs) z components/pack/sos/sosTexts.ts, needituj ručne';
const CLOSE = '  // ⟦/pack.sos⟧';
let bad = 0;
for (const lang of ['en', 'sk', 'cs']) {
  const f = join(root, `src/i18n/locales/${lang}.ts`);
  const src = readFileSync(f, 'utf8');
  const lines = Object.entries(SOS_TEXTS).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v[lang])},`);
  const block = `${OPEN}\n${lines.join('\n')}\n${CLOSE}\n`;
  let next;
  const a = src.indexOf('  // ⟦pack.sos⟧'), b = src.indexOf(CLOSE);
  if (a >= 0 && b > a) next = src.slice(0, a) + block + src.slice(b + CLOSE.length + 1);
  else {
    const m = [...src.matchAll(/^\}( as const)?;\s*$/gm)].pop();
    if (!m) throw new Error(`${lang}.ts: nenašiel som koniec objektu`);
    next = src.slice(0, m.index) + block + src.slice(m.index);
  }
  if (next !== src) { if (check) { console.error(`🔴 ${lang}.ts: blok pack.sos je neaktuálny`); bad++; } else writeFileSync(f, next); }
}
if (bad) process.exit(1);
console.log(check ? '✓ pack.sos aktuálny' : '✓ pack.sos zapísaný (en · sk · cs)');
