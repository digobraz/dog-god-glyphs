// Generate delta spec files for translation agents.
// Run: npx tsx scripts/i18n-gen-spec.mts
import { en } from '../src/i18n/locales/en';
import { writeFileSync, mkdirSync } from 'node:fs';

const enMap = en as Record<string, string>;
const masterKeys = Object.keys(enMap);
const EXISTING = ['sk', 'cs', 'pol', 'ukr', 'deu', 'esp', 'fra', 'prt', 'rus', 'ita'];

mkdirSync('scripts/i18n-out', { recursive: true });

// Per-locale missing key→EN-value map
const summary: Record<string, number> = {};
for (const code of EXISTING) {
  const mod = await import(`../src/i18n/locales/${code}`);
  const dict = (mod[code] ?? mod.default) as Record<string, string>;
  const have = new Set(Object.keys(dict));
  const missing = masterKeys.filter((k) => !have.has(k));
  const out: Record<string, string> = {};
  for (const k of missing) out[k] = enMap[k];
  writeFileSync(`scripts/i18n-out/missing-${code}.json`, JSON.stringify(out, null, 2));
  summary[code] = missing.length;
}

// Full master dump (for the 7 new languages) as plain key→EN map
writeFileSync('scripts/i18n-out/master-en.json', JSON.stringify(enMap, null, 2));

console.log('Wrote spec files to scripts/i18n-out/');
console.log('missing counts:', summary);
console.log('master keys:', masterKeys.length);
