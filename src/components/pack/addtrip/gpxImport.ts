// GPX IMPORT DO KROKU KRESLENIA (Matej 27. 9. 2026: „pri pridať výlet by sa nedala vložiť GPX
// trasa… z mapy cz, strava a podobne? pre ľudí by to bolo ešte rýchlejšie než klikať").
//
// Parser je prevzatý zo zmazaného `GpxImport.tsx` (vlna 1, 29. 7. 2026; zmazaný 16. 9. v commite
// 75fd314 ako mŕtvy ostrov — nikto ho nikdy nezapojil). Z neho ostali len čisté funkcie; UI
// nesie `GeometryPicker` sám, lebo import je len iný spôsob, ako naplniť TEN ISTÝ `TripGeometry`.
//
// 🔴 iOS PASCA: Safari zošedí súbory vo file pickeri, keď má <input> `accept=".gpx"`. Preto input
//    NEMÁ `accept` a platnosť sa overuje až podľa OBSAHU (`<gpx` v prvom kilobajte).
//
// DVOJVRSTVOVÝ MODEL (kontrakt §0): trackpointy = hotová hustá stopa → `snapPath` (zriedená),
// `path` (kotvy) = Douglas–Peucker na 20–40 bodov, aby sa dala trasa ďalej upravovať a „späť
// o bod" robil rozumné kroky. Routing sa na GPX NIKDY nespúšťa — trasa už je reálna.
// PREVÝŠENIE sa tu NEPOČÍTA: picker ho prepočíta zo stopy tou istou cestou ako pri kreslení
// (`recomputeAscent`), aby sa GPX výlety nerozišli s kreslenými.
import type { LatLngTuple } from 'leaflet';

export type GpxErrorCode = 'notGpx' | 'broken' | 'empty';
export class GpxError extends Error {
  code: GpxErrorCode;
  constructor(code: GpxErrorCode) { super(code); this.code = code; }
}

export type GpxTrack = {
  anchors: LatLngTuple[];
  track: LatLngTuple[];
  /** 'YYYY-MM-DD' z prvého trackpointu s <time>, lokálny dátum. */
  date?: string;
  app: string;
  originalName: string;
};

type TrkPt = { lat: number; lon: number; time: string | null };

async function readAndValidate(file: File): Promise<string> {
  const head = await file.slice(0, 1024).text();
  if (!/<gpx[\s>]/i.test(head)) throw new GpxError('notGpx');
  return file.text();
}

export function parseGpx(xmlText: string): { points: TrkPt[]; creator: string | null } {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) throw new GpxError('broken');
  const root = doc.documentElement;
  if (!root || root.tagName.toLowerCase() !== 'gpx') throw new GpxError('notGpx');
  // getElementsByTagName ide v poradí dokumentu cez všetky <trk>/<trkseg> — viac segmentov
  // sa tak spojí do jednej stopy. Plánovaná trasa (napr. Mapy.com „trasa", nie „aktivita")
  // nesie <rtept>, preto záloha.
  const trkpts = Array.from(doc.getElementsByTagName('trkpt'));
  const nodes = trkpts.length > 0 ? trkpts : Array.from(doc.getElementsByTagName('rtept'));
  const points: TrkPt[] = [];
  for (const node of nodes) {
    const lat = parseFloat(node.getAttribute('lat') || '');
    const lon = parseFloat(node.getAttribute('lon') || '');
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    points.push({ lat, lon, time: node.getElementsByTagName('time')[0]?.textContent || null });
  }
  if (points.length < 2) throw new GpxError('empty');
  return { points, creator: root.getAttribute('creator') };
}

function appFromCreator(creator: string | null): string {
  const c = (creator || '').toLowerCase();
  if (c.includes('strava')) return 'Strava';
  if (c.includes('garmin')) return 'Garmin';
  if (c.includes('mapy')) return 'Mapy.com';
  if (c.includes('komoot')) return 'Komoot';
  return creator || 'GPX';
}

// ── Douglas–Peucker v lokálnej rovinnej projekcii (presné na kilometre, na turistiku stačí) ──
function toXY(p: LatLngTuple, lat0: number): [number, number] {
  return [p[1] * 111320 * Math.cos((lat0 * Math.PI) / 180), p[0] * 110540];
}
function perpDistM(p: [number, number], a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
function rdp(points: LatLngTuple[], epsilonM: number): LatLngTuple[] {
  if (points.length < 3) return points.slice();
  const lat0 = points[Math.floor(points.length / 2)][0];
  const xy = points.map((p) => toXY(p, lat0));
  const keep = new Array(points.length).fill(false);
  keep[0] = true; keep[points.length - 1] = true;
  const stack: Array<[number, number]> = [[0, points.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    if (e <= s + 1) continue;
    let maxD = -1, idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = perpDistM(xy[i], xy[s], xy[e]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > epsilonM) { keep[idx] = true; stack.push([s, idx], [idx, e]); }
  }
  return points.filter((_, i) => keep[i]);
}

const ANCHOR_MIN = 20;
const ANCHOR_MAX = 40;
/** Binárne hľadanie epsilonu, kým počet kotiev nepadne do [20, 40]. */
export function decimateAnchors(points: LatLngTuple[]): LatLngTuple[] {
  if (points.length <= ANCHOR_MAX) return points.slice();
  let lo = 0, hi = 5000;
  let result = rdp(points, hi);
  for (let i = 0; i < 24 && hi - lo > 0.5; i++) {
    const mid = (lo + hi) / 2;
    result = rdp(points, mid);
    if (result.length > ANCHOR_MAX) lo = mid;
    else if (result.length < ANCHOR_MIN) hi = mid;
    else return result;
  }
  return result;
}

/**
 * Stopa z hodiniek má desaťtisíce bodov (záznam á 1 s). Do výletu ide zriedená na 3 m odchýlku
 * tým istým Douglas–Peuckerom, akým sa riedia hero výlety (88802fd, tam 10 m). Kotvy sú
 * podmnožinou pôvodných bodov a vracajú sa späť, aby ich `ensureLegs` našiel presne na stope.
 */
function thinTrack(points: LatLngTuple[], anchors: LatLngTuple[]): LatLngTuple[] {
  const keep = new Set([...rdp(points, 3), ...anchors]);
  return points.filter((p) => keep.has(p));
}

function toDateStr(iso: string | null): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function readGpxFile(file: File): Promise<GpxTrack> {
  const text = await readAndValidate(file);
  const { points, creator } = parseGpx(text);
  const all: LatLngTuple[] = points.map((p) => [p.lat, p.lon]);
  const anchors = decimateAnchors(all);
  return {
    anchors,
    track: thinTrack(all, anchors),
    date: toDateStr(points.find((p) => p.time)?.time ?? null),
    app: appFromCreator(creator),
    originalName: file.name,
  };
}
