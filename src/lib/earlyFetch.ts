// RANÝ FETCH PSOV PRE /onepage (6. 10. 2026, perf).
// Úvodná opona sa zdvíha, až keď dorazí `get-grid-dogs` a nakreslí sa 24 fotiek gule — a ten
// fetch sa predtým spúšťal až v efekte GodsGridLab, teda po stiahnutí a vyhodnotení celého
// chunku OnePage (~1,2 s na dobrej sieti, ~3 s na mobile). main.tsx ho spúšťa hneď po štarte
// hlavného balíka; komponenty si hotový sľub JEDNORAZOVO prevezmú (`takeEarly`). Kto ho nenájde,
// fetchuje sám ako doteraz.
import { LIVE_EDGE_BASE } from './env';

export const GRID_URL_ALL = `${LIVE_EDGE_BASE}/get-grid-dogs?tiers=all`;
export const GRID_URL_MEMBERS = `${LIVE_EDGE_BASE}/get-grid-dogs`;

const early = new Map<string, Promise<unknown[]>>();

export function startEarlyGridDogs(): void {
  for (const url of [GRID_URL_ALL, GRID_URL_MEMBERS]) {
    if (early.has(url)) continue;
    early.set(url, fetch(url).then((r) => (r.ok ? r.json() : [])).catch(() => []));
  }
}

/** Hotový (alebo rozbehnutý) sľub pre URL, jednorazovo; `null` = nebeží, fetchuj sám. */
export function takeEarly<T>(url: string): Promise<T[]> | null {
  const p = early.get(url);
  if (!p) return null;
  early.delete(url);
  return p as Promise<T[]>;
}
