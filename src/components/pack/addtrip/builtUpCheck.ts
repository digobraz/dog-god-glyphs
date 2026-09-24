/**
 * ── TÚRA JE V PRÍRODE, NIE OKOLO BYTOVKY (Matej 24. 9. 2026) ────────────────────────────
 *
 * „nechcem aby ludia zapisovali vencenia okolo bytovky a nazvali to turistikou (čiže
 *  podmienkou by mala byť lokalita — nie zastavaná oblasť resp. určité % a viac ako 5 km
 *  trasa… ak to nie je splnené, malo by sa to v tomto momente dať prepnúť na VISIT)."
 * Odpovede na tri otázky v ten istý deň: 5 km sa ráta DOKOPY (aj zdvojená cesta späť) ·
 * prah 30 % · platí aj pre PLÁN.
 *
 * Zastavaná oblasť = plochy OSM `landuse` residential / commercial / industrial / retail.
 * Trasa sa navzorkuje každých `SAMPLE_M` a ráta sa podiel vzoriek vnútri týchto plôch.
 *
 * ⚠️ NEZNÁMY VÝSLEDOK PUSTÍ ĎALEJ (fail-open). Overpass je cudzia, bezplatná služba; keď
 *    neodpovie, človek nesmie ostať zaseknutý na mape s trasou, ktorú prešiel. Podiel `null`
 *    znamená „nevieme", nie „mesto".
 * ⚠️ Diery multipolygónu (`inner`) sa ignorujú — park uprostred sídliska sa ráta ako
 *    zástavba. Pre prah 30 % je to zanedbateľné a ušetrí to skladanie prstencov.
 */

export type LL = readonly [number, number];

export const HIKE_MIN_KM = 5;
export const BUILT_UP_MAX = 0.3;
const SAMPLE_M = 50;
const LANDUSE = '^(residential|commercial|industrial|retail)$';
const OVERPASS = 'https://overpass-api.de/api/interpreter';

export function distM(a: LL, b: LL): number {
  const R = 6371000;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLon = (b[1] - a[1]) * Math.PI / 180;
  const la = a[0] * Math.PI / 180;
  const lb = b[0] * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function lineLengthM(line: readonly LL[]): number {
  let m = 0;
  for (let i = 1; i < line.length; i++) m += distM(line[i - 1], line[i]);
  return m;
}

/** Body každých `step` metrov po čiare (vrátane prvého). */
function sample(line: readonly LL[], step: number): LL[] {
  if (line.length === 0) return [];
  const out: LL[] = [line[0]];
  let carry = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const b = line[i];
    const d = distM(a, b);
    let pos = step - carry;
    while (pos <= d) {
      const f = pos / d;
      out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
      pos += step;
    }
    carry = d - (pos - step);
  }
  return out;
}

type Ring = { ring: LL[]; s: number; w: number; n: number; e: number };

function toRing(pts: LL[]): Ring | null {
  if (pts.length < 4) return null;
  let s = 90, w = 180, n = -90, e = -180;
  for (const [la, lo] of pts) {
    if (la < s) s = la; if (la > n) n = la;
    if (lo < w) w = lo; if (lo > e) e = lo;
  }
  return { ring: pts, s, w, n, e };
}

function inRing(p: LL, r: Ring): boolean {
  if (p[0] < r.s || p[0] > r.n || p[1] < r.w || p[1] > r.e) return false;
  let inside = false;
  const pts = r.ring;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [yi, xi] = pts[i];
    const [yj, xj] = pts[j];
    if ((yi > p[0]) !== (yj > p[0]) && p[1] < ((xj - xi) * (p[0] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

type OsmGeom = { lat: number; lon: number }[];
type OsmEl =
  | { type: 'way'; geometry?: OsmGeom }
  | { type: 'relation'; members?: { type: string; role: string; geometry?: OsmGeom }[] };

/**
 * Vonkajšie hranice relácie poskladá z kúskov: uzavretý člen je prstenec sám, otvorené sa
 * lepia za sebou (aj otočené), kým sa kruh neuzavrie.
 */
function relationRings(members: NonNullable<Extract<OsmEl, { type: 'relation' }>['members']>): LL[][] {
  const open: LL[][] = [];
  const rings: LL[][] = [];
  for (const m of members) {
    if (m.type !== 'way' || m.role === 'inner' || !m.geometry?.length) continue;
    const pts = m.geometry.map((g) => [g.lat, g.lon] as LL);
    const a = pts[0], b = pts[pts.length - 1];
    if (a[0] === b[0] && a[1] === b[1]) rings.push(pts);
    else open.push(pts);
  }
  while (open.length) {
    let cur = open.shift()!;
    let grew = true;
    while (grew) {
      grew = false;
      const end = cur[cur.length - 1];
      if (cur[0][0] === end[0] && cur[0][1] === end[1]) break;
      for (let i = 0; i < open.length; i++) {
        const o = open[i];
        const oa = o[0], ob = o[o.length - 1];
        if (oa[0] === end[0] && oa[1] === end[1]) { cur = cur.concat(o.slice(1)); }
        else if (ob[0] === end[0] && ob[1] === end[1]) { cur = cur.concat(o.slice(0, -1).reverse()); }
        else continue;
        open.splice(i, 1);
        grew = true;
        break;
      }
    }
    rings.push(cur);
  }
  return rings;
}

const cache = new Map<string, number | null>();

/**
 * Podiel dĺžky trasy (0–1) v zastavanej oblasti; `null` = nepodarilo sa zmerať.
 */
export async function builtUpShare(line: readonly LL[], signal?: AbortSignal): Promise<number | null> {
  if (line.length < 2) return null;
  const pts = sample(line, SAMPLE_M);
  let s = 90, w = 180, n = -90, e = -180;
  for (const [la, lo] of line) {
    if (la < s) s = la; if (la > n) n = la;
    if (lo < w) w = lo; if (lo > e) e = lo;
  }
  const bbox = [s, w, n, e].map((v) => v.toFixed(5)).join(',');
  const key = `${bbox}|${pts.length}`;
  if (cache.has(key)) return cache.get(key)!;
  const q = `[out:json][timeout:20];(way["landuse"~"${LANDUSE}"](${bbox});relation["landuse"~"${LANDUSE}"](${bbox}););out geom;`;
  try {
    const res = await fetch(OVERPASS, {
      method: 'POST',
      body: 'data=' + encodeURIComponent(q),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { elements?: OsmEl[] };
    const rings: Ring[] = [];
    for (const el of data.elements ?? []) {
      if (el.type === 'way' && el.geometry) {
        const r = toRing(el.geometry.map((g) => [g.lat, g.lon] as LL));
        if (r) rings.push(r);
      } else if (el.type === 'relation' && el.members) {
        for (const pts of relationRings(el.members)) {
          const r = toRing(pts);
          if (r) rings.push(r);
        }
      }
    }
    let inside = 0;
    for (const p of pts) if (rings.some((r) => inRing(p, r))) inside++;
    const share = pts.length ? inside / pts.length : null;
    cache.set(key, share);
    return share;
  } catch {
    return null;
  }
}

/** Stred a polomer okruhu, ktorý obsiahne celú trasu — na prepnutie túry na NÁVŠTEVU. */
export function areaAround(line: readonly LL[], minM: number, maxM: number): { center: [number, number]; radiusM: number } {
  let la = 0, lo = 0;
  for (const p of line) { la += p[0]; lo += p[1]; }
  const center: [number, number] = [la / line.length, lo / line.length];
  let r = 0;
  for (const p of line) r = Math.max(r, distM(center, p));
  return { center, radiusM: Math.round(Math.min(maxM, Math.max(minM, r)) / 10) * 10 };
}
