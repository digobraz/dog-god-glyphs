// i18n audit — import locale modules, compute parity vs en master.
// Run: npx tsx scripts/i18n-audit.mts
import { en } from '../src/i18n/locales/en';

const EXISTING = ['sk', 'cs', 'pol', 'ukr', 'deu', 'esp', 'fra', 'prt', 'rus', 'ita'];
const MISSING = ['chn', 'jpn', 'ind', 'ara', 'kor', 'nld', 'tur'];

const masterKeys = Object.keys(en as Record<string, string>);
console.log(`MASTER (en): ${masterKeys.length} keys\n`);

async function load(code: string): Promise<Record<string, string> | null> {
  try {
    const mod = await import(`../src/i18n/locales/${code}`);
    return (mod[code] ?? mod.default) as Record<string, string>;
  } catch {
    return null;
  }
}

const enMap = en as Record<string, string>;
const report: Record<string, { missing: string[]; identical: string[]; extra: string[] }> = {};

for (const code of EXISTING) {
  const dict = await load(code);
  if (!dict) { console.log(`${code}: LOAD FAILED`); continue; }
  const keys = new Set(Object.keys(dict));
  const missing = masterKeys.filter((k) => !keys.has(k));
  const identical = masterKeys.filter((k) => keys.has(k) && dict[k] === enMap[k]);
  const extra = Object.keys(dict).filter((k) => !(k in enMap));
  report[code] = { missing, identical, extra };
  console.log(
    `${code.padEnd(5)} | have ${Object.keys(dict).length.toString().padStart(3)} | ` +
    `MISSING ${missing.length.toString().padStart(3)} | identical-to-EN ${identical.length.toString().padStart(3)} | extra ${extra.length}`
  );
}

console.log(`\n--- MISSING entirely (need full ${masterKeys.length}): ${MISSING.join(', ')} ---`);

// Union of all keys missing across existing locales (= the "new since 19:38" delta)
const deltaUnion = new Set<string>();
for (const code of EXISTING) report[code]?.missing.forEach((k) => deltaUnion.add(k));
console.log(`\nDELTA UNION (keys missing in >=1 existing locale): ${deltaUnion.size}`);
[...deltaUnion].sort().forEach((k) => console.log(`  ${k}`));

// Motto occurrences
console.log(`\n--- "In Dog We Trust" / motto occurrences in en ---`);
for (const [k, v] of Object.entries(enMap)) {
  if (/dog we trust|in dog/i.test(String(v))) console.log(`  ${k} = ${JSON.stringify(v)}`);
}
