#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// Sitemap generator — static pages + one /dog/<name>-<pack> URL per live dog.
// Run manually (or before Republish) from the web repo root:
//   node scripts/generate-sitemap.mjs
// Overwrites public/sitemap.xml. Dog list comes from the public get-grid-dogs
// edge function (same feed the WALL uses).
// ─────────────────────────────────────────────────────────────────────────

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const EDGE_BASE = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1'; // LIVE (mirrors src/lib/env.ts hard-pin)
const SITE = 'https://dogypt.com';

// Keep in sync with src/lib/dogSlug.ts (dogSlug) — plain-JS copy for node.
function dogSlug(name, pack) {
  const s = (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
  return s ? `${s}-${pack}` : String(pack);
}

const STATIC_PAGES = [
  { loc: `${SITE}/`, priority: '1.0' },
  { loc: `${SITE}/heroglyph`, priority: '0.9' },
  { loc: `${SITE}/religion`, priority: '0.8' },
  { loc: `${SITE}/vision`, priority: '0.7' },
  { loc: `${SITE}/about`, priority: '0.7' },
];

const today = new Date().toISOString().slice(0, 10);

const res = await fetch(`${EDGE_BASE}/get-grid-dogs`);
if (!res.ok) {
  console.error(`get-grid-dogs failed: ${res.status}`);
  process.exit(1);
}
const dogs = await res.json();
const dogUrls = dogs
  .filter((d) => Number.isFinite(d?.pack_number) && d.pack_number > 0)
  .sort((a, b) => a.pack_number - b.pack_number)
  .map((d) => ({ loc: `${SITE}/dog/${dogSlug(d.dog_name, d.pack_number)}`, priority: '0.6' }));

const entry = ({ loc, priority }) =>
  `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n    <lastmod>${today}</lastmod>\n  </url>`;

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...STATIC_PAGES, ...dogUrls].map(entry).join('\n')}\n</urlset>\n`;

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml');
writeFileSync(out, xml);
console.log(`sitemap.xml written: ${STATIC_PAGES.length} static + ${dogUrls.length} dog pages`);
