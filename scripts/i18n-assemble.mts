// Assemble translated JSON (from agents) into locale .ts files.
// Delta langs (existing .ts): insert new keys before closing `};` (preserves file + comments).
// Full langs (new .ts): generate fresh Partial<Dict> in master key order.
// Run: npx tsx scripts/i18n-assemble.mts [code...]   (no args = all translated-*.json found)
import { en } from '../src/i18n/locales/en';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';

const enMap = en as Record<string, string>;
const masterKeys = Object.keys(enMap);
const LOCALES_DIR = 'src/i18n/locales';
const OUT = 'scripts/i18n-out';

function tsLine(k: string, v: string): string {
  return `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`;
}

let codes = process.argv.slice(2);
if (codes.length === 0) {
  codes = readdirSync(OUT)
    .filter((f) => /^translated-.+\.json$/.test(f))
    .map((f) => f.replace(/^translated-(.+)\.json$/, '$1'));
}

for (const code of codes) {
  const jsonPath = `${OUT}/translated-${code}.json`;
  if (!existsSync(jsonPath)) { console.log(`⚠ ${code}: no ${jsonPath}, skip`); continue; }
  const tr = JSON.parse(readFileSync(jsonPath, 'utf8')) as Record<string, string>;
  const tsPath = `${LOCALES_DIR}/${code}.ts`;

  if (existsSync(tsPath)) {
    // DELTA: insert before last `};`
    const text = readFileSync(tsPath, 'utf8');
    const idx = text.lastIndexOf('};');
    if (idx < 0) { console.log(`✗ ${code}: no closing }; in ${tsPath}`); continue; }
    const block = ['', '  // ── added 2026-06-17 (launch translation delta) ──',
      ...Object.keys(tr).map((k) => tsLine(k, tr[k])), ''].join('\n');
    const next = text.slice(0, idx) + block + text.slice(idx);
    writeFileSync(tsPath, next);
    console.log(`✓ ${code}: +${Object.keys(tr).length} keys → ${tsPath} (delta insert)`);
  } else {
    // FULL: new file, master order
    const lines: string[] = [];
    let have = 0, miss = 0;
    for (const k of masterKeys) {
      if (k in tr) { lines.push(tsLine(k, tr[k])); have++; }
      else { miss++; }
    }
    const header =
      `import type { Dict } from '../LanguageContext';\n` +
      `/** DOGYPT i18n — ${code.toUpperCase()} dictionary (machine translation 2026-06-17, pending human review). Partial<Dict>: missing key falls back to EN. */\n` +
      `export const ${code}: Partial<Dict> = {\n`;
    writeFileSync(tsPath, header + lines.join('\n') + '\n};\n');
    console.log(`✓ ${code}: ${have}/${masterKeys.length} keys → ${tsPath} (new file)${miss ? `  [⚠ ${miss} missing→EN fallback]` : ''}`);
  }
}
