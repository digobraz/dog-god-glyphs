#!/usr/bin/env node
// 🗺️ DLAŽDICE OSM BODOV SA DO APPKY NEBALIA (Matej 21. 11. 2026, R3 v `plany/zadanie-osm-susedia-2026-11-21.md`).
// Spúšťa ho Capacitor sám po každom `cap copy` / `cap sync` (hook `capacitor:copy:after` v package.json),
// takže platí pre app:sync, test.sh aj vydaj.sh naraz. Appka si dlaždice ťahá z dogypt.com
// (`usePoiTiles.ts`, BASE pri IS_APP) — so susednými krajinami by balík narástol o desiatky MB
// a mapa bez siete aj tak nemá podklad.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = fileURLToPath(new URL('..', import.meta.url));
const plat = process.env.CAPACITOR_PLATFORM_NAME;
const dirs = {
  ios: path.join(WEB, 'ios', 'App', 'App', 'public', 'poi'),
  android: path.join(WEB, 'android', 'app', 'src', 'main', 'assets', 'public', 'poi'),
};
for (const [p, d] of Object.entries(dirs)) {
  if (plat && plat !== p) continue;
  if (fs.existsSync(d)) {
    fs.rmSync(d, { recursive: true, force: true });
    console.log(`🗺️  ${p}: public/poi odstránené z balíka appky (ťahá sa z dogypt.com)`);
  }
}
