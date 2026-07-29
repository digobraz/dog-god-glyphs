// Snap-to-trail — prilepí naklikaný úsek na skutočný chodník (Mapy.com routing `foot_hiking`).
//
// PREČO: bez snapu je trasa rad rovných čiar medzi klikmi. Z takej stopy sa nedajú
// spoľahlivo odvodiť turistické značky (KČT) ani prevýšenie — čiara seká lesom mimo cesty.
// Batch verzia pre existujúci dataset žije v plany/snap-trails.py; toto je jej živý
// náprotivok pre ADD TRIP flow, s rovnakými prahmi, aby obe vrstvy dávali rovnaký výsledok.
//
// MODEL: naklikané body ostávajú KOTVY (to, čo používateľ vidí ako body a vie undo-núť),
// snapnutá geometria je len tvar čiary medzi nimi. Keď routing zlyhá alebo chce absurdnú
// obchádzku (klik mimo chodníka), úsek ticho zostane rovnou čiarou — kreslenie sa nikdy
// nezasekne na sieti.
import { MAPY_API_KEY } from './env';

export type LL = [number, number];

const ROUTE_URL = 'https://api.mapy.com/v1/routing/route';
const DETOUR_MAX = 1.9;   // úsek dlhší než X× priama vzdialenosť = obchádzka
const DETOUR_ABS = 250;   // …a zároveň absolútne dlhší o X m (krátke úseky majú vysoký pomer bežne)
const SNAP_MAX_M = 260;   // klik ďalej než X m od chodníka = kreslené mimo cesty
const TIMEOUT_MS = 7000;  // v editore radšej rovná čiara než čakajúci používateľ

function hav(a: LL, b: LL) {
  const R = 6371000;
  const p1 = (a[0] * Math.PI) / 180, p2 = (b[0] * Math.PI) / 180;
  const dp = ((b[0] - a[0]) * Math.PI) / 180, dl = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function pathMeters(p: LL[]) {
  let s = 0;
  for (let i = 1; i < p.length; i++) s += hav(p[i - 1], p[i]);
  return s;
}

/** Prilepí JEDEN úsek (from → to) na chodník. Vracia geometriu vrátane oboch koncov,
 *  alebo null keď snap nedáva zmysel (obchádzka / klik mimo cesty / API mlčí). */
export async function snapSegment(from: LL, to: LL, signal?: AbortSignal): Promise<LL[] | null> {
  const q = new URLSearchParams({
    start: `${from[1]},${from[0]}`,   // Mapy.com chce lon,lat
    end: `${to[1]},${to[0]}`,
    routeType: 'foot_hiking',
    format: 'geojson',
    lang: 'sk',
    apikey: MAPY_API_KEY,
  });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true });
  try {
    const res = await fetch(`${ROUTE_URL}?${q}`, { signal: ctrl.signal });
    if (!res.ok) return null;
    const d = await res.json();
    const geom = d?.geometry?.geometry ?? d?.geometry;
    const coords: [number, number][] | undefined = geom?.coordinates;
    if (!coords || coords.length < 2) return null;

    const line: LL[] = coords.map((c) => [c[1], c[0]]);
    const straight = hav(from, to);
    const len = pathMeters(line);
    // routing obišiel — klik zjavne nesedel na chodníku
    if (len > straight * DETOUR_MAX && len - straight > DETOUR_ABS) return null;
    // klik ležal ďaleko od najbližšej cesty
    const snapd = (d?.routePoints ?? []).map((p: { snapDistance?: string }) => Number(p.snapDistance || 0));
    if (snapd.length && Math.max(...snapd) > SNAP_MAX_M) return null;
    return line;
  } catch {
    return null;   // timeout / offline / CORS → rovná čiara, kreslenie ide ďalej
  } finally {
    clearTimeout(timer);
  }
}

/** Poskladá vykresliteľnú čiaru z kotiev + už zosnapovaných úsekov.
 *  `legs[i]` = geometria medzi anchors[i] a anchors[i+1]; chýbajúca = rovná čiara. */
export function buildLine(anchors: LL[], legs: (LL[] | null)[]): LL[] {
  if (anchors.length < 2) return anchors.slice();
  const out: LL[] = [anchors[0]];
  for (let i = 0; i < anchors.length - 1; i++) {
    const leg = legs[i];
    if (leg && leg.length > 1) out.push(...leg.slice(1));
    else out.push(anchors[i + 1]);
  }
  return out;
}
