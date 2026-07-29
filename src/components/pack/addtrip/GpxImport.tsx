// GPX IMPORT — vlna 1 (plany/zadanie-addtrip-flow-2026-07-27.md §9, kontrakt-geometrypicker
// §0/§2). Výber súboru zo Stravy/Garminu/Mapy.cz/ľubovoľnej appky, funguje na Androide, iOS
// aj desktope. Kreslenie na mape rieši `GeometryPicker.tsx` — tento súbor sa ho NEDOTÝKA,
// len produkuje rovnaký `TripGeometry` tvar cez `onImport`.
//
// 🔴 iOS PASCA (§9): Safari zošedí súbory vo file pickeri, keď má <input> `accept=".gpx"`.
// Preto input NEMÁ `accept` — prijímame všetky súbory a validujeme až OBSAH (hľadáme `<gpx`
// v prvom kilobajte). Bez tohto si používateľ na iPhone nevie vybrať vlastný súbor.
//
// DVOJVRSTVOVÁ GEOMETRIA (kontrakt §0): GPX trackpointy sú UŽ reálna hustá stopa → idú 1:1 do
// `snapPath`. `path` (kotvy) = Douglas-Peucker zjednodušenie na ~20–40 bodov, aby Matej mohol
// trasu pred launchom preťahovať (feedback_kotvy_vs_odvodena_geometria — zlúčenie oboch polí
// do jedného už raz znemožnilo editovanie). `snapped: false` — routing/snap sa tu NIKDY
// nespúšťa (§9: "Trasa z GPX je už reálna"), pole len hovorí, či bežal routing, nie či sú dáta
// dôveryhodné.
//
// PREVÝŠENIE (§5.2a/b cez addTripGeo.ts): NIKDY vlastný súčet — vždy `calibratedAscent()`,
// ktorá si sama prevzorkuje trasu na 100 m (`interp()`, rovnaká kalibrácia ako batch skript
// `plany/compute-ascent.py`). Ak GPX nemá `<ele>`, necháva sa `ascentM: null` — volajúci
// (GeometryPicker/AddTripLog) to musí dopočítať cez `map-proxy` elevation endpoint.
//
// NÁVODY PER APLIKÁCIA — zdroje (2026-07-29, over pred zmenou textu):
//   Strava   — OVERENÉ naživo, oficiálny support článok (support.strava.com, "Exporting Your
//              Data and Bulk Export" → sekcia "GPX Export"): "Navigate to one of your Activity
//              pages and from the more (ellipses) menu, select 'Export GPX'."
//   Mapy.cz  — OVERENÉ naživo, help.mapy.com/tracker/ (sekcia "Tools for Working with the
//              Activity"): "Export: Exports the activity to GPX format for further use or
//              sharing with other users."
//   Garmin   — ⚠️ NEOVERENÉ naživo — support.garmin.com je JS-only SPA (Cloudflare), Google/
//              Bing/DuckDuckGo/Mojeek vrátili prázdne/blokované výsledky pri pokuse cez curl.
//              Text nižšie je najlepšia známa zhoda (Garmin Connect web, aktivita → ⚙ ikona
//              vpravo hore → "Export to GPX"), NEPOTVRDENÉ z primárneho zdroja. Flag v reporte.
import React, { useMemo, useRef, useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import type { TripGeometry } from '@/components/pack/addtrip/addTripModel';
import { calibratedAscent, totalDistanceM } from '@/components/pack/addtrip/addTripGeo';
import { ICON } from '@/components/pack/tripShared';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';

const GOLD = T.accentGold; // #C99A3F

export type GpxImportResult = {
  geometry: TripGeometry;      // kind:'route', path=kotvy, snapPath=trackpointy
  km: number;
  ascentM: number | null;      // null = treba dopočítať cez proxy (chýbajúce <ele>)
  date?: string;                // 'YYYY-MM-DD' z prvého trackpointu, ak má <time>
  sourceGpx: { app: string; originalName: string };
};

export type GpxImportProps = {
  onImport: (r: GpxImportResult) => void;
  onCancel: () => void;
};

// ── zdroje/aplikácie ─────────────────────────────────────────────────────────────────────
type AppKey = 'strava' | 'garmin' | 'mapy' | 'other';
const APP_LABEL: Record<AppKey, string> = { strava: 'Strava', garmin: 'Garmin', mapy: 'Mapy.cz', other: 'GPX file' };
// tri kroky, doslovné názvy tlačidiel v danej appke (zdroje viď hlavičkový komentár).
const APP_STEPS: Record<Exclude<AppKey, 'other'>, [string, string, string]> = {
  strava: ['Open the activity', '⋯ (top right)', 'Export GPX'],
  garmin: ['Open the activity', '⚙ (top right)', 'Export to GPX'],
  mapy: ['My Mapy → Activities', 'Open the activity', 'Export'],
};

// ── GPX parser (vlastný, žiadna npm závislosť) ──────────────────────────────────────────
type TrkPt = { lat: number; lon: number; ele: number | null; time: string | null };

// Prijímame VŠETKY súbory (§9 iOS pasca) — obsah overíme až tu, `<gpx` musí byť v prvom KB.
async function readAndValidate(file: File): Promise<string> {
  const head = await file.slice(0, 1024).text();
  if (!/<gpx[\s>]/i.test(head)) {
    throw new Error(`"${file.name}" doesn't look like a GPX file.`);
  }
  return file.text();
}

// Poškodený súbor → zrozumiteľná hláška, nikdy neošetrená výnimka (§9).
// export = testovateľnosť (node/vite-node + jsdom harness), runtime správanie nemení.
export function parseGpx(xmlText: string): { points: TrkPt[]; creator: string | null } {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('This file could not be read — it looks corrupted.');
  const root = doc.documentElement;
  if (!root || root.tagName.toLowerCase() !== 'gpx') throw new Error('This file is not a GPX track.');
  const creator = root.getAttribute('creator');

  // getElementsByTagName vracia uzly vo document-order naprieč VŠETKÝMI <trkseg> aj <trk> —
  // viacero segmentov/tracks sa tak prirodzene spoja do jednej stopy bez extra kódu.
  const trkpts = Array.from(doc.getElementsByTagName('trkpt'));
  const nodes = trkpts.length > 0 ? trkpts : Array.from(doc.getElementsByTagName('rtept'));

  const points: TrkPt[] = [];
  for (const node of nodes) {
    const lat = parseFloat(node.getAttribute('lat') || '');
    const lon = parseFloat(node.getAttribute('lon') || '');
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const eleTxt = node.getElementsByTagName('ele')[0]?.textContent;
    const ele = eleTxt ? parseFloat(eleTxt) : NaN;
    const time = node.getElementsByTagName('time')[0]?.textContent || null;
    points.push({ lat, lon, ele: Number.isFinite(ele) ? ele : null, time });
  }
  if (points.length < 2) throw new Error('This GPX file has no usable track points.');
  return { points, creator };
}

function detectAppFromCreator(creator: string | null): string {
  const c = (creator || '').toLowerCase();
  if (c.includes('strava')) return 'Strava';
  if (c.includes('garmin')) return 'Garmin';
  if (c.includes('mapy')) return 'Mapy.cz';
  return creator || 'GPX file';
}

// ── Douglas-Peucker — preriedi hustú GPX stopu na ~20–40 editovateľných kotiev (kontrakt §0).
// Perpendikulárna vzdialenosť v lokálnej rovinnej projekcii (equirectangular okolo strednej
// šírky) — presné na kilometre, akurátne dosť na decimáciu turistickej trasy.
function toXY(p: LatLngTuple, lat0: number): [number, number] {
  const mPerDegLat = 110540;
  const mPerDegLon = 111320 * Math.cos((lat0 * Math.PI) / 180);
  return [p[1] * mPerDegLon, p[0] * mPerDegLat];
}
function perpDistM(p: [number, number], a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
  const c: [number, number] = [a[0] + t * dx, a[1] + t * dy];
  return Math.hypot(p[0] - c[0], p[1] - c[1]);
}
function rdp(points: LatLngTuple[], epsilonM: number, lat0: number): LatLngTuple[] {
  if (points.length < 3) return points.slice();
  const xy = points.map((p) => toXY(p, lat0));
  const keep = new Array(points.length).fill(false);
  keep[0] = true; keep[points.length - 1] = true;
  const stack: Array<[number, number]> = [[0, points.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop()!;
    if (end <= start + 1) continue;
    let maxD = -1, idx = -1;
    for (let i = start + 1; i < end; i++) {
      const d = perpDistM(xy[i], xy[start], xy[end]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > epsilonM) {
      keep[idx] = true;
      stack.push([start, idx], [idx, end]);
    }
  }
  return points.filter((_, i) => keep[i]);
}
const ANCHOR_MIN = 20;
const ANCHOR_MAX = 40;
// binárne hľadanie epsilonu (m), kým počet kotiev nepadne do [20,40]. 24 iterácií stačí na
// presnosť pod pol metra; pri veľmi krátkych/priamych trasách sa nemusí dosiahnuť ANCHOR_MIN
// (RDP jednoducho nemá kde pridať zmysluplný bod) — vtedy sa vráti čo najbližšie k oknu.
export function decimateAnchors(points: LatLngTuple[]): LatLngTuple[] {
  if (points.length <= ANCHOR_MAX) return points.slice();
  const lat0 = points[Math.floor(points.length / 2)][0];
  let lo = 0, hi = 5000;
  let result = rdp(points, hi, lat0);
  for (let iter = 0; iter < 24 && hi - lo > 0.5; iter++) {
    const mid = (lo + hi) / 2;
    const simplified = rdp(points, mid, lat0);
    result = simplified;
    if (simplified.length > ANCHOR_MAX) lo = mid;
    else if (simplified.length < ANCHOR_MIN) hi = mid;
    else return simplified;
  }
  return result;
}

// ── elevAt lookup pre calibratedAscent() — nearest-neighbour na pôvodné <ele> hodnoty ──────
// (§9: "namapuj na najbližší bod"). Vzorka sa capuje na ~4000 bodov (rovnomerný výber) — pri
// hodinkovom GPX (desaťtisíce bodov) drží drag po Trim slideri plynulý, presnosť pre 100 m
// resampling je aj tak zbytočne vysoká.
const ELEV_LOOKUP_CAP = 4000;
function buildElevLookup(points: TrkPt[]): (p: LatLngTuple) => number | null | undefined {
  const withEle = points.filter((p): p is TrkPt & { ele: number } => p.ele !== null);
  if (withEle.length === 0) return () => undefined;
  const step = Math.max(1, Math.floor(withEle.length / ELEV_LOOKUP_CAP));
  const sample = step === 1 ? withEle : withEle.filter((_, i) => i % step === 0);
  return (q: LatLngTuple) => {
    let bestD = Infinity, bestEle: number | null = null;
    for (const p of sample) {
      const dLat = p.lat - q[0], dLon = p.lon - q[1];
      const d = dLat * dLat + dLon * dLon; // štvorec vzdialenosti v stupňoch — stačí na nearest
      if (d < bestD) { bestD = d; bestEle = p.ele; }
    }
    return bestEle;
  };
}

function toDateStr(iso: string | null): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtDateShort(dateStr?: string): string | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}
function fmtKm(km: number): string {
  return km.toFixed(1).replace('.', ',');
}

export type Summary = { km: number; ascentM: number | null; date?: string; pointCount: number };
export function summarize(trimmed: TrkPt[]): Summary {
  const snapPath: LatLngTuple[] = trimmed.map((p) => [p.lat, p.lon]);
  const km = totalDistanceM(snapPath) / 1000;
  const hasEle = trimmed.some((p) => p.ele !== null);
  const ascentM = hasEle ? calibratedAscent(snapPath, buildElevLookup(trimmed)) : null;
  const date = toDateStr(trimmed.find((p) => p.time)?.time ?? null);
  return { km: Math.round(km * 10) / 10, ascentM, date, pointCount: trimmed.length };
}

// ── UI ───────────────────────────────────────────────────────────────────────────────────
type Screen = 'sources' | 'app' | 'preview';

export function GpxImport({ onImport, onCancel }: GpxImportProps) {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>('sources');
  const [selectedApp, setSelectedApp] = useState<AppKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const [points, setPoints] = useState<TrkPt[] | null>(null);
  const [creator, setCreator] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const reset = () => {
    setScreen('sources'); setSelectedApp(null); setError(null); setPoints(null);
    setCreator(null); setFileName(''); setTrimStart(0); setTrimEnd(0); setDragOver(false); setLoading(false);
  };
  const close = () => { setOpen(false); reset(); onCancel(); };
  const drawOnMap = () => { setOpen(false); reset(); onCancel(); };

  const pickApp = (app: AppKey) => { setSelectedApp(app); setError(null); setScreen('app'); };
  const backToSources = () => { setSelectedApp(null); setError(null); setPoints(null); setScreen('sources'); };

  const handleFile = async (file: File) => {
    setError(null); setLoading(true);
    try {
      const text = await readAndValidate(file);
      const { points: pts, creator: cr } = parseGpx(text);
      setPoints(pts); setCreator(cr); setFileName(file.name);
      setTrimStart(0); setTrimEnd(pts.length - 1);
      setScreen('preview');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read this file.');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const trimmed = useMemo(() => (points ? points.slice(trimStart, trimEnd + 1) : []), [points, trimStart, trimEnd]);
  const summary = useMemo(() => (trimmed.length >= 2 ? summarize(trimmed) : null), [trimmed]);

  const appLabel = selectedApp === 'other' || !selectedApp ? detectAppFromCreator(creator) : APP_LABEL[selectedApp];

  const confirm = () => {
    if (!summary || trimmed.length < 2) return;
    const snapPath: LatLngTuple[] = trimmed.map((p) => [p.lat, p.lon]);
    const geometry: TripGeometry = { kind: 'route', path: decimateAnchors(snapPath), snapPath, snapped: false };
    onImport({
      geometry, km: summary.km, ascentM: summary.ascentM, date: summary.date,
      sourceGpx: { app: appLabel, originalName: fileName },
    });
    setOpen(false); reset();
  };

  return (
    <>
      <style>{GPXI_CSS}</style>

      <button type="button" className="gpxi-trigger" onClick={() => { reset(); setOpen(true); }}>
        <img src={ICON('walk')} alt="" style={{ width: 15, height: 15, filter: 'brightness(0) invert(1)' }} />
        Load from your watch
      </button>

      {open && (
        <div className="gpxi-overlay" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="gpxi-modal">
            <div className="gpxi-head">
              <div>
                <div className="gpxi-title">Load from your watch</div>
                {screen === 'app' && selectedApp && selectedApp !== 'other' && (
                  <div className="gpxi-sub">{APP_LABEL[selectedApp]}</div>
                )}
              </div>
              <button type="button" className="gpxi-x" onClick={close} aria-label="Close">×</button>
            </div>

            {screen === 'sources' && (
              <>
                <div className="gpxi-cards">
                  {(['strava', 'garmin', 'mapy'] as const).map((a) => (
                    <button key={a} type="button" className="gpxi-card" onClick={() => pickApp(a)}>
                      <span className="gpxi-card-name">{APP_LABEL[a]}</span>
                      <span className="gpxi-card-hint">3 steps</span>
                    </button>
                  ))}
                  <button type="button" className="gpxi-card gpxi-card-wide" onClick={() => pickApp('other')}>
                    <img src={ICON('document')} alt="" style={{ width: 16, height: 16, filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
                    <span className="gpxi-card-name">I have a GPX file</span>
                  </button>
                </div>
                <button type="button" className="gpxi-drawlink" onClick={drawOnMap}>Or draw it on the map</button>
              </>
            )}

            {screen === 'app' && selectedApp && (
              <>
                {selectedApp !== 'other' && (
                  <ol className="gpxi-steps">
                    {APP_STEPS[selectedApp].map((s, i) => (
                      <li key={i}><span className="gpxi-step-num">{i + 1}</span>{s}</li>
                    ))}
                  </ol>
                )}
                <div
                  className={`gpxi-drop${dragOver ? ' is-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                >
                  {loading ? 'Reading file…' : selectedApp === 'other'
                    ? 'Choose your GPX file, or drop it here'
                    : 'Save it, then pick it here (or drop it here)'}
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  className="gpxi-hidden-input"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
                />
                {error && <div className="gpxi-error">{error}</div>}
                <div className="gpxi-rowlinks">
                  <button type="button" className="gpxi-backlink" onClick={backToSources}>‹ Back</button>
                  <button type="button" className="gpxi-drawlink" onClick={drawOnMap}>Or draw it on the map</button>
                </div>
              </>
            )}

            {screen === 'preview' && summary && (
              <>
                <div className="gpxi-summary">
                  Loaded from {appLabel} · {fmtKm(summary.km)} km ·
                  {' '}{summary.ascentM === null ? '↑ …' : `↑ ${summary.ascentM} m`} ·
                  {' '}{fmtDateShort(summary.date) ?? 'no date'}
                </div>

                <div className="gpxi-trim-label">Trim
                  <span className="gpxi-trim-hint">GPX from a watch often starts at the parking lot</span>
                </div>
                <div className="gpxi-trim-row">
                  <span className="gpxi-trim-tag">Start</span>
                  <input
                    type="range" min={0} max={(points?.length ?? 1) - 2} value={trimStart}
                    onChange={(e) => setTrimStart(Math.min(Number(e.target.value), trimEnd - 1))}
                    style={{ accentColor: GOLD }}
                  />
                </div>
                <div className="gpxi-trim-row">
                  <span className="gpxi-trim-tag">End</span>
                  <input
                    type="range" min={1} max={(points?.length ?? 1) - 1} value={trimEnd}
                    onChange={(e) => setTrimEnd(Math.max(Number(e.target.value), trimStart + 1))}
                    style={{ accentColor: GOLD }}
                  />
                </div>

                <div className="gpxi-rowlinks">
                  <button type="button" className="gpxi-backlink" onClick={() => setScreen('app')}>‹ Choose a different file</button>
                </div>
                <button type="button" className="gpxi-btn-gold" onClick={confirm}>Use this route</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const GPXI_CSS = `
.gpxi-trigger{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:8px;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-family:${FONT_UI};font-weight:600;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:border-color .15s,color .15s;}
.gpxi-trigger:hover{border-color:${GOLD};color:${GOLD};}
.gpxi-overlay{position:fixed;inset:0;z-index:1200;background:rgba(3,2,1,0.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;}
.gpxi-modal{width:100%;max-width:420px;max-height:calc(100dvh - 40px);overflow-y:auto;background:${T.glass};backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid ${T.onDarkBorder};border-radius:20px;box-shadow:0 30px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(245,240,228,0.06);padding:22px;}
.gpxi-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px;}
.gpxi-title{font-family:${FONT_TITLE};font-weight:700;font-size:15px;color:${GOLD};}
.gpxi-sub{font-family:${FONT_UI};font-size:11.5px;color:${T.onDarkDim};margin-top:2px;}
.gpxi-x{flex-shrink:0;width:28px;height:28px;border-radius:50%;background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:15px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.gpxi-x:hover{border-color:${GOLD};color:${GOLD};}

.gpxi-cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
.gpxi-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:16px 10px;border-radius:12px;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};cursor:pointer;transition:border-color .15s,background .15s;}
.gpxi-card:hover{border-color:${GOLD};background:rgba(201,154,63,0.08);}
.gpxi-card-wide{grid-column:1 / -1;flex-direction:row;}
.gpxi-card-name{font-family:${FONT_TITLE};font-weight:700;font-size:12.5px;color:${T.onDark};}
.gpxi-card-hint{font-family:${FONT_UI};font-size:10px;color:${T.onDarkDim};text-transform:uppercase;letter-spacing:.08em;}

.gpxi-steps{list-style:none;margin:0 0 14px;padding:0;display:flex;flex-direction:column;gap:8px;}
.gpxi-steps li{display:flex;align-items:center;gap:10px;font-family:${FONT_UI};font-size:12.5px;color:${T.onDark};}
.gpxi-step-num{flex-shrink:0;width:20px;height:20px;border-radius:50%;background:rgba(201,154,63,0.16);color:${GOLD};font-weight:600;font-size:11px;display:flex;align-items:center;justify-content:center;}

.gpxi-drop{border:1.5px dashed ${T.onDarkBorder};border-radius:12px;padding:22px 14px;text-align:center;font-family:${FONT_UI};font-size:12.5px;color:${T.onDarkDim};cursor:pointer;transition:border-color .15s,color .15s,background .15s;}
.gpxi-drop:hover,.gpxi-drop.is-over{border-color:${GOLD};color:${T.onDark};background:rgba(201,154,63,0.06);}
.gpxi-hidden-input{position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;}
.gpxi-error{margin-top:10px;font-family:${FONT_UI};font-size:12px;color:#E0796D;}

.gpxi-rowlinks{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;}
.gpxi-backlink,.gpxi-drawlink{background:none;border:none;padding:0;font-family:${FONT_UI};font-weight:500;font-size:11.5px;color:${T.onDarkDim};cursor:pointer;text-decoration:underline;text-underline-offset:2px;}
.gpxi-backlink:hover,.gpxi-drawlink:hover{color:${GOLD};}
.gpxi-drawlink{margin-left:auto;}

.gpxi-summary{font-family:${FONT_UI};font-weight:600;font-size:13px;color:${T.onDark};margin-bottom:16px;}
.gpxi-trim-label{font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${T.onDark};display:flex;flex-direction:column;gap:3px;margin-bottom:8px;}
.gpxi-trim-hint{font-family:${FONT_UI};font-weight:500;font-size:10.5px;letter-spacing:0;text-transform:none;color:${T.onDarkDim};}
.gpxi-trim-row{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
.gpxi-trim-row input[type="range"]{flex:1;}
.gpxi-trim-tag{flex-shrink:0;width:38px;font-family:${FONT_UI};font-weight:600;font-size:10.5px;text-transform:uppercase;color:${T.onDarkDim};}

.gpxi-btn-gold{width:100%;margin-top:14px;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:8px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);color:#000;border:1px solid rgba(250,244,236,0.30);cursor:pointer;box-shadow:0 0 22px rgba(230,158,26,0.32),inset 0 1px 0 rgba(255,255,255,0.3);}
.gpxi-btn-gold:hover{filter:brightness(1.04);}
`;
