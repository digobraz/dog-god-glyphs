// RANÝ FETCH PSOV PRE /onepage (6. 10. 2026, perf).
// Úvodná opona sa zdvíha, až keď dorazí `get-grid-dogs` a nakreslí sa 24 fotiek gule — a ten
// fetch sa predtým spúšťal až v efekte GodsGridLab, teda po stiahnutí a vyhodnotení celého
// chunku OnePage (~1,2 s na dobrej sieti, ~3 s na mobile). main.tsx ho spúšťa hneď po štarte
// hlavného balíka; komponenty si hotový sľub JEDNORAZOVO prevezmú (`takeEarly`). Kto ho nenájde,
// fetchuje sám ako doteraz.
//
// 🔴 OD 7. 10. 2026 (plán s Fable 5) ide zoznam cez Cloudflare `/api/dogs` (scripts/cloudflare/
// worker.js): ~50 ms z cache, záloha pri výpadku Supabase, ku každému psovi rozmazaný náhľad
// `lqip`. Fetch štartuje už index.html (`window.__gridEarly`), nie až main.tsx. A stiahne sa
// RAZ — zoznam členov je podmnožina `?tiers=all` (`wall_tier === 'member'`).
// Obchádzka priamo na Supabase: mimo dogypt.com/workers.dev (dev, `vite preview`), pri
// `?focus=` / `?dog=` (práve zaplatený pes musí byť na stene hneď, nie o minútu) a keď
// /api/dogs zlyhá.
import { LIVE_EDGE_BASE } from './env';

export const GRID_URL_ALL = `${LIVE_EDGE_BASE}/get-grid-dogs?tiers=all`;
export const GRID_URL_MEMBERS = `${LIVE_EDGE_BASE}/get-grid-dogs`;

type Row = { wall_tier?: string };
const early = new Map<string, Promise<unknown[]>>();

function viaEdge(): boolean {
  if (typeof window === 'undefined') return false;
  const h = location.hostname;
  if (h !== 'dogypt.com' && h !== 'www.dogypt.com' && !h.endsWith('.workers.dev')) return false;
  const q = new URLSearchParams(location.search);
  return !q.get('focus') && !q.get('dog');
}

const direct = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : [])).catch(() => []);

/** Zoznam psov: cez Cloudflare, keď sa dá, inak (alebo pri chybe) priamo zo Supabase. */
export function gridFetch(url: string): Promise<unknown[]> {
  const isAll = url === GRID_URL_ALL;
  if (!viaEdge() || (!isAll && url !== GRID_URL_MEMBERS)) return direct(url);
  return fetch(isAll ? '/api/dogs?tiers=all' : '/api/dogs')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((j) => (Array.isArray(j) && j.length ? j : Promise.reject('empty')))
    .catch(() => direct(url));
}

export function startEarlyGridDogs(): void {
  if (early.has(GRID_URL_ALL)) return;
  const w = window as Window & { __gridEarly?: Promise<unknown[]> };
  // index.html už pýta `/api/dogs?tiers=all` (len na dogypt.com, bez focus/dog); chyba ⇒ priamo.
  const all = w.__gridEarly && viaEdge()
    ? w.__gridEarly.then((j) => (Array.isArray(j) && j.length ? j : direct(GRID_URL_ALL)), () => direct(GRID_URL_ALL))
    : gridFetch(GRID_URL_ALL);
  w.__gridEarly = undefined;
  early.set(GRID_URL_ALL, all);
  early.set(GRID_URL_MEMBERS, all.then((rows) => (rows as Row[]).filter((d) => !d.wall_tier || d.wall_tier === 'member')));
}

/** Hotový (alebo rozbehnutý) sľub pre URL, jednorazovo; `null` = nebeží, fetchuj sám. */
export function takeEarly<T>(url: string): Promise<T[]> | null {
  const p = early.get(url);
  if (!p) return null;
  early.delete(url);
  return p as Promise<T[]>;
}
