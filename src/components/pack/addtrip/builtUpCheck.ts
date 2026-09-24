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
 * ⚠️ NEZNÁMY VÝSLEDOK PUSTÍ ĎALEJ (fail-open). Dlaždice sú cudzia, bezplatná služba; keď
 *    neodpovie, človek nesmie ostať zaseknutý na mape s trasou, ktorú prešiel. Podiel `null`
 *    znamená „nevieme", nie „mesto".
 * ⚠️ Diery plôch sa neodlišujú — park uprostred sídliska sa ráta ako zástavba. Pre prah
 *    30 % je to zanedbateľné.
 */

export type LL = readonly number[];

export const HIKE_MIN_KM = 5;
export const BUILT_UP_MAX = 0.3;
const SAMPLE_M = 50;

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

/**
 * ── ZDROJ = STATICKÉ VEKTOROVÉ DLAŽDICE OSM, NIE ŽIVÝ OVERPASS ───────────────────────────
 * Overpass za behu appky je zakázaný od 27. 8. 2026 (`geo/usePoiTiles.ts`: „The server is
 * probably too busy" ako HTML, mirror Internal Server Error). 24. 9. pri stavbe tejto kontroly
 * `overpass-api.de` odmietal spojenie a oba mirrory neodpovedali — tretí dôkaz.
 * OpenFreeMap (`tiles.openfreemap.org`) servíruje planetu OSM v schéme OpenMapTiles cez
 * Cloudflare CDN, `access-control-allow-origin: *`, bez kľúča; dlaždica z14 má ~20 KB.
 * Vrstva `landuse`, triedy residential / commercial / industrial / retail.
 * ⚠️ Adresa dlaždíc nesie dátum buildu planéty (`/planet/20260913_…/`) — preto sa číta
 *    z TileJSONu, nie natvrdo.
 */
const TILEJSON = 'https://tiles.openfreemap.org/planet';
const Z = 14;
const URBAN = new Set(['residential', 'commercial', 'industrial', 'retail']);
const TIMEOUT_MS = 8000;
const NEAR_BUILDING_M = 60;

let tileUrlP: Promise<string | null> | null = null;
function tileUrl(signal?: AbortSignal): Promise<string | null> {
  tileUrlP ||= fetch(TILEJSON, { signal })
    .then((r) => (r.ok ? r.json() : null))
    .then((j: { tiles?: string[] } | null) => j?.tiles?.[0] ?? null)
    .catch(() => { tileUrlP = null; return null; });
  return tileUrlP;
}

/**
 * Zastavané plochy jednej dlaždice v jej vlastných súradniciach (0..extent): prstence
 * `landuse` a obdĺžniky budov.
 * ⚠️ BUDOVY SÚ NUTNÉ, NIE NAVYŠE. Sídlisko v Petržalke nemá v OSM súvislú plochu
 *    `residential` (bloky sú zmapované po kúskoch alebo vôbec), takže samotný `landuse`
 *    nameral na okruhu medzi panelákmi 0 %. Budova do `NEAR_BUILDING_M` od bodu trasy =
 *    zástavba — presne to je „venčenie okolo bytovky".
 * ⚠️ Trieda `suburb` sa NEBERIE: je to hranica celej mestskej časti, a tá v sebe nesie aj
 *    lesy (Nové Mesto má celý Kamzík).
 */
type TileRings = { extent: number; rings: [number, number][][]; bldg: [number, number, number, number][] };
const tileCache = new Map<string, Promise<TileRings | null>>();

function loadTile(tpl: string, x: number, y: number, signal?: AbortSignal): Promise<TileRings | null> {
  const key = `${x}/${y}`;
  let p = tileCache.get(key);
  if (!p) {
    p = fetch(tpl.replace('{z}', String(Z)).replace('{x}', String(x)).replace('{y}', String(y)), { signal })
      .then(async (r) => {
        if (!r.ok) return null;
        const [{ VectorTile }, { default: Pbf }] = await Promise.all([import('@mapbox/vector-tile'), import('pbf')]);
        const vt = new VectorTile(new Pbf(await r.arrayBuffer()));
        const layer = vt.layers.landuse;
        const out: TileRings = { extent: layer?.extent ?? 4096, rings: [], bldg: [] };
        if (layer) {
          for (let i = 0; i < layer.length; i++) {
            const f = layer.feature(i);
            if (f.type !== 3 || !URBAN.has(String(f.properties.class))) continue;
            // Diery (opačne točené prstence) sa neodlišujú — viď hlavičku súboru.
            for (const ring of f.loadGeometry()) out.rings.push(ring.map((pt) => [pt.x, pt.y]));
          }
        }
        const b = vt.layers.building;
        if (b) {
          const k = out.extent / b.extent;
          for (let i = 0; i < b.length; i++) {
            for (const ring of b.feature(i).loadGeometry()) {
              let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
              for (const pt of ring) {
                if (pt.x < x0) x0 = pt.x; if (pt.x > x1) x1 = pt.x;
                if (pt.y < y0) y0 = pt.y; if (pt.y > y1) y1 = pt.y;
              }
              out.bldg.push([x0 * k, y0 * k, x1 * k, y1 * k]);
            }
          }
        }
        return out;
      })
      .catch(() => { tileCache.delete(key); return null; });
    tileCache.set(key, p);
  }
  return p;
}

/** Bod → dlaždica z14 a poloha v nej (0..1). */
function toTile(p: LL): { x: number; y: number; fx: number; fy: number } {
  const n = 2 ** Z;
  const tx = ((p[1] + 180) / 360) * n;
  const la = (p[0] * Math.PI) / 180;
  const ty = ((1 - Math.log(Math.tan(la) + 1 / Math.cos(la)) / Math.PI) / 2) * n;
  const x = Math.floor(tx);
  const y = Math.floor(ty);
  return { x, y, fx: tx - x, fy: ty - y };
}

function inRing(px: number, py: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Podiel dĺžky trasy (0–1) v zastavanej oblasti; `null` = nepodarilo sa zmerať
 * (výpadok, časový limit) — volajúci vtedy človeka PUSTÍ.
 */
export async function builtUpShare(line: readonly LL[]): Promise<number | null> {
  if (line.length < 2) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const tpl = await tileUrl(ctrl.signal);
    if (!tpl) return null;
    const pts = sample(line, SAMPLE_M).map(toTile);
    const keys = [...new Set(pts.map((p) => `${p.x}/${p.y}`))];
    const tiles = new Map<string, TileRings | null>();
    await Promise.all(keys.map(async (k) => {
      const [x, y] = k.split('/').map(Number);
      tiles.set(k, await loadTile(tpl, x, y, ctrl.signal));
    }));
    // Chýbajúca dlaždica = nevieme; radšej žiadny verdikt než verdikt z polovice trasy.
    if ([...tiles.values()].some((t) => !t)) return null;
    // Metrov na jednotku dlaždice (Mercator — závisí od zemepisnej šírky).
    const lat0 = line[0][0] * Math.PI / 180;
    let inside = 0;
    for (const p of pts) {
      const t = tiles.get(`${p.x}/${p.y}`)!;
      const px = p.fx * t.extent;
      const py = p.fy * t.extent;
      const near = NEAR_BUILDING_M / ((40075016 * Math.cos(lat0)) / 2 ** Z / t.extent);
      const hit = t.rings.some((r) => inRing(px, py, r))
        || t.bldg.some(([x0, y0, x1, y1]) => px > x0 - near && px < x1 + near && py > y0 - near && py < y1 + near);
      if (hit) inside++;
    }
    return pts.length ? inside / pts.length : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
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
