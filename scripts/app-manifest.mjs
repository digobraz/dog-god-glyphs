#!/usr/bin/env node
/**
 * ZOZNAM SÚBOROV PRE AKTUALIZÁCIU APPKY (20. 10. 2026).
 * Matej: *„aby sme mali appka a live web 1:1 a následne keď budeme stavať a vyvíjať /pack
 * v app bude sa to prenášať aj na web verziu"*.
 *
 * Beží na konci `npm run build`, teda v každom `go-live` aj `app:sync`. Zapíše do dist/:
 *   app-version.json  {version}             — balík appky si podľa neho pozná vlastnú verziu
 *   app-update.json   {version, minNative, files:[{file_name, file_hash, download_url}]}
 *
 * Appka (`src/lib/appUpdate.ts`) si po štarte stiahne app-update.json z dogypt.com a keď
 * je verzia iná, plugin Capgo stiahne LEN súbory, ktorých SHA-256 nemá vo svojom balíku
 * (hashované chunky sa menia, fotky nie) — priamo z dogypt.com, kde ich go-live práve nahral.
 * Web a appka tak bežia z toho istého dist/.
 *
 * ⚠️ `version` je odtlačok obsahu všetkých súborov (nie hash hlavného bundlu) — zmena
 *    obrázka bez zmeny JS je tiež nová verzia.
 * ⚠️ `minNative` je v `app-native.json`. Zvýš ho, keď web začne volať NATÍVNU vec, ktorú
 *    staršia appka z obchodu nemá (nový plugin, povolenie) — staršie appky potom novú
 *    verziu nestiahnu a počkajú na obchod. Rovnaké číslo daj appke (iOS MARKETING_VERSION,
 *    Android versionName).
 * ⚠️ `?v=` v adrese je proti cache: názov obrázka sa pri zmene obsahu nemení.
 *
 * Použitie: node scripts/app-manifest.mjs [dist-priečinok] [základ-url]
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = fileURLToPath(new URL('..', import.meta.url));
const DIST = process.argv[2] || join(WEB, 'dist');
const BASE = (process.argv[3] || 'https://dogypt.com').replace(/\/$/, '');
const { minNative } = JSON.parse(readFileSync(join(WEB, 'app-native.json'), 'utf8'));

// Mimo appky: hlavičky Cloudflare, predvykreslené stránky pre vyhľadávače a náhľady
// certifikátu. Appka štartuje z index.html; ostatné .html sú web pre Google.
const SKIP = (p) =>
  p === 'app-update.json' || p === 'app-version.json' || p.startsWith('_') ||
  p.startsWith('pre/') || (p.endsWith('.html') && p !== 'index.html') || p.endsWith('.DS_Store');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const url = (p, h) => `${BASE}/${p.split('/').map(encodeURIComponent).join('/')}?v=${h.slice(0, 12)}`;

const files = [];
let bytes = 0;
for (const full of walk(DIST)) {
  const p = relative(DIST, full).split(sep).join('/');
  if (SKIP(p)) continue;
  const buf = readFileSync(full);
  bytes += buf.length;
  files.push({ file_name: p, file_hash: sha(buf) });
}
files.sort((a, b) => a.file_name.localeCompare(b.file_name));

const version = sha(files.map((f) => `${f.file_name}\0${f.file_hash}`).join('\n')).slice(0, 16);
const versionJson = JSON.stringify({ version }) + '\n';
writeFileSync(join(DIST, 'app-version.json'), versionJson);
files.push({ file_name: 'app-version.json', file_hash: sha(Buffer.from(versionJson)) });

const manifest = {
  version,
  minNative,
  files: files.map((f) => ({ ...f, download_url: url(f.file_name, f.file_hash) })),
};
writeFileSync(join(DIST, 'app-update.json'), JSON.stringify(manifest));
console.log(`app-manifest: verzia ${version} · ${files.length} súborov · ${(bytes / 1048576).toFixed(1)} MB · minNative ${minNative}`);
