// DOČASNÝ TEST — draw-route → auto km/pohorie/náročnosť. ZMAZAŤ pred commitom.
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapyTiles, MAPY_API_KEY } from '@/lib/env';

const GOLD = '#C99A3F';
const INK = '#1F1A0E';
const CARD = '#FFFBF2';

const CENTER: LatLngTuple = [48.9, 19.5];

// ── Pohorie centroid table (TEST-ONLY approximation) ──────────────────────
// Ostrá verzia bude point-in-polygon proti regions.ts (PostGIS). Toto je len
// nearest-centroid hrubý odhad pre rýchly proof-of-concept.
type Zone = 'W' | 'C' | 'E';
type PohorieCentroid = { slug: string; name: string; zone: Zone; lat: number; lon: number };

const POHORIE_CENTROIDS: PohorieCentroid[] = [
  { slug: 'vysoke-tatry',        name: 'Vysoké Tatry',        zone: 'C', lat: 49.17, lon: 20.14 },
  { slug: 'zapadne-tatry',       name: 'Západné Tatry',       zone: 'C', lat: 49.20, lon: 19.75 },
  { slug: 'belianske-tatry',     name: 'Belianske Tatry',     zone: 'C', lat: 49.23, lon: 20.30 },
  { slug: 'nizke-tatry',         name: 'Nízke Tatry',         zone: 'C', lat: 48.95, lon: 19.75 },
  { slug: 'mala-fatra',          name: 'Malá Fatra',          zone: 'C', lat: 49.20, lon: 19.05 },
  { slug: 'chocske-vrchy',       name: 'Chočské vrchy',       zone: 'C', lat: 49.20, lon: 19.30 },
  { slug: 'velka-fatra',         name: 'Veľká Fatra',         zone: 'C', lat: 48.90, lon: 19.10 },
  { slug: 'slovenske-rudohorie', name: 'Slovenské rudohorie', zone: 'E', lat: 48.75, lon: 20.20 },
  { slug: 'polana',              name: 'Poľana',               zone: 'C', lat: 48.65, lon: 19.50 },
  { slug: 'vtacnik',             name: 'Vtáčnik',              zone: 'C', lat: 48.65, lon: 18.65 },
  { slug: 'oravska-magura',      name: 'Oravská Magura',      zone: 'C', lat: 49.30, lon: 19.30 },
  { slug: 'kremnicke-vrchy',     name: 'Kremnické vrchy',     zone: 'C', lat: 48.70, lon: 19.00 },
  { slug: 'volovske-vrchy',      name: 'Volovské vrchy',      zone: 'E', lat: 48.80, lon: 20.70 },
  { slug: 'levocske-vrchy',      name: 'Levočské vrchy',      zone: 'E', lat: 49.05, lon: 20.65 },
  { slug: 'kysucke-beskydy',     name: 'Kysucké Beskydy',     zone: 'C', lat: 49.40, lon: 19.05 },
  { slug: 'bukovske-vrchy',      name: 'Bukovské vrchy',      zone: 'E', lat: 49.10, lon: 22.50 },
  { slug: 'strazovske-vrchy',    name: 'Strážovské vrchy',    zone: 'W', lat: 48.95, lon: 18.45 },
  { slug: 'branisko',            name: 'Branisko',             zone: 'E', lat: 49.00, lon: 20.90 },
  { slug: 'slanske-vrchy',       name: 'Slanské vrchy',       zone: 'E', lat: 48.80, lon: 21.55 },
  { slug: 'vihorlat',            name: 'Vihorlat',             zone: 'E', lat: 48.90, lon: 22.15 },
  { slug: 'javorniky',           name: 'Javorníky',            zone: 'W', lat: 49.30, lon: 18.40 },
  { slug: 'povazsky-inovec',     name: 'Považský Inovec',     zone: 'W', lat: 48.70, lon: 18.10 },
  { slug: 'stiavnicke-vrchy',    name: 'Štiavnické vrchy',    zone: 'C', lat: 48.40, lon: 18.90 },
  { slug: 'biele-karpaty',       name: 'Biele Karpaty',       zone: 'W', lat: 48.90, lon: 17.90 },
  { slug: 'tribec',              name: 'Tribeč',                zone: 'W', lat: 48.50, lon: 18.30 },
  { slug: 'male-karpaty',        name: 'Malé Karpaty',        zone: 'W', lat: 48.35, lon: 17.30 },
];

const ZONE_LABEL: Record<Zone, string> = { W: 'West', C: 'Central', E: 'East' };

type Difficulty = 'Easy' | 'Moderate' | 'Hard';

// ── geometry helpers ────────────────────────────────────────────────────
function haversineKm(a: LatLngTuple, b: LatLngTuple): number {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLon = (b[1] - a[1]) * Math.PI / 180;
  const la1 = a[0] * Math.PI / 180, la2 = b[0] * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function pathKm(pts: LatLngTuple[]): number {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += haversineKm(pts[i - 1], pts[i]);
  return s;
}

// nearest-centroid detekcia z priemeru bodov trasy (jednoduchá aproximácia
// midpointu — pri veľmi asymetrických trasách to vie ťahať mimo skutočný stred,
// ale pre test-only účel to stačí).
function nearestPohorie(points: LatLngTuple[]): PohorieCentroid | null {
  if (points.length === 0) return null;
  const avgLat = points.reduce((s, p) => s + p[0], 0) / points.length;
  const avgLon = points.reduce((s, p) => s + p[1], 0) / points.length;
  let best: PohorieCentroid | null = null;
  let bestDist = Infinity;
  for (const c of POHORIE_CENTROIDS) {
    const d = haversineKm([avgLat, avgLon], [c.lat, c.lon]);
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return best;
}

// Resampluje trasu na max N rovnomerne (podľa vzdialenosti) rozložených bodov,
// pre Open-Meteo Elevation API (menej bodov = menej dát na prenos).
function resamplePath(points: LatLngTuple[], maxPoints = 64): LatLngTuple[] {
  if (points.length <= maxPoints) return points;
  const cum: number[] = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + haversineKm(points[i - 1], points[i]));
  const total = cum[cum.length - 1];
  if (total === 0) return points;
  const step = total / (maxPoints - 1);
  const result: LatLngTuple[] = [];
  let segIdx = 0;
  for (let i = 0; i < maxPoints; i++) {
    const targetDist = i * step;
    while (segIdx < cum.length - 2 && cum[segIdx + 1] < targetDist) segIdx++;
    const segStart = cum[segIdx], segEnd = cum[segIdx + 1];
    const segLen = segEnd - segStart;
    const t = segLen > 0 ? (targetDist - segStart) / segLen : 0;
    const a = points[segIdx], b = points[segIdx + 1];
    result.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return result;
}

function computeDifficulty(km: number, gainM: number): Difficulty {
  if (gainM < 350 && km < 8) return 'Easy';
  if (gainM > 900 || km > 15) return 'Hard';
  return 'Moderate';
}

const dotIcon = L.divIcon({ className: 'tdt-dotwrap', html: `<div class="tdt-dot"></div>`, iconSize: [11, 11], iconAnchor: [5.5, 5.5] });

function DrawLayer({ points, onAdd }: { points: LatLngTuple[]; onAdd: (p: LatLngTuple) => void }) {
  useMapEvents({ click(e) { onAdd([e.latlng.lat, e.latlng.lng]); } });
  return (
    <>
      {points.length > 1 && <Polyline positions={points} pathOptions={{ color: GOLD, weight: 4, opacity: 0.95 }} />}
      {points.map((p, i) => <Marker key={i} position={p} icon={dotIcon} />)}
    </>
  );
}

const CSS = `
.tdt-root{position:fixed;inset:0;overflow-y:auto;background:#050505;color:rgba(245,240,228,0.9);font-family:'DM Sans',system-ui,sans-serif;}
.tdt-wrap{position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:48px 26px 80px;}
.tdt-title{font-family:'Cinzel',serif;font-weight:700;font-size:22px;letter-spacing:.04em;color:${GOLD};margin-bottom:6px;}
.tdt-sub{font-size:12.5px;color:rgba(245,240,228,0.55);margin-bottom:26px;}
.tdt-layout{display:grid;grid-template-columns:1.6fr 1fr;gap:22px;align-items:start;}
.tdt-mapwrap{position:relative;border-radius:16px;overflow:hidden;border:1px solid rgba(201,154,63,0.4);height:460px;box-shadow:0 12px 40px rgba(0,0,0,0.45);}
.tdt-mapwrap .leaflet-container{width:100%;height:100%;background:#0a0a0a;}
.tdt-attr{position:absolute;right:10px;bottom:10px;z-index:1000;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.85);border-radius:4px;padding:2px 7px;font-size:9px;color:#333;}
.tdt-mapbtns{display:flex;gap:10px;margin-top:12px;}
.tdt-btn{font-family:'Cinzel',serif;font-weight:700;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;padding:9px 16px;border-radius:9px;cursor:pointer;border:1px solid rgba(201,154,63,0.5);background:transparent;color:rgba(245,240,228,0.85);transition:all .15s;}
.tdt-btn:hover{border-color:${GOLD};background:rgba(201,154,63,0.1);}
.tdt-btn:disabled{opacity:0.35;cursor:default;}
.tdt-btn--gold{background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border-color:rgba(250,244,236,0.3);}
.tdt-btn--gold:hover{opacity:0.92;}
.tdt-card{background:${CARD};border-radius:16px;padding:22px 22px 24px;color:${INK};box-shadow:0 12px 40px rgba(0,0,0,0.45);}
.tdt-field{margin-bottom:16px;}
.tdt-field input{width:100%;background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.16);border-radius:9px;padding:10px 12px;font-size:13px;color:${INK};font-family:inherit;outline:0;}
.tdt-field input:focus{border-color:${GOLD};}
.tdt-rows{display:flex;flex-direction:column;gap:0;border-top:1px solid rgba(31,26,14,0.1);}
.tdt-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:11px 0;border-bottom:1px solid rgba(31,26,14,0.1);}
.tdt-rowl{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:rgba(31,26,14,0.5);}
.tdt-rowv{font-family:'Cinzel',serif;font-weight:700;font-size:15px;color:${INK};text-align:right;}
.tdt-rowv--gold{color:${GOLD};}
.tdt-note{font-size:11px;line-height:1.5;color:rgba(31,26,14,0.5);margin-top:14px;}
.tdt-pointcount{font-size:11px;color:rgba(245,240,228,0.5);margin-top:8px;}
.tdt-dotwrap{background:none;border:0;}
.tdt-dot{width:8px;height:8px;border-radius:50%;background:${GOLD};border:1.5px solid ${CARD};box-shadow:0 1px 3px rgba(0,0,0,0.5);}
@media (max-width:820px){
  .tdt-layout{grid-template-columns:1fr;}
  .tdt-mapwrap{height:380px;}
}
`;

export default function TrailsDrawTest() {
  const [points, setPoints] = useState<LatLngTuple[]>([]);
  const [routeName, setRouteName] = useState('');
  const [elevGain, setElevGain] = useState<number | null>(null);
  const [elevLoading, setElevLoading] = useState(false);
  const [elevError, setElevError] = useState(false);

  const km = useMemo(() => pathKm(points), [points]);
  const pohorie = useMemo(() => nearestPohorie(points), [points]);

  async function computeElevation(pts: LatLngTuple[]) {
    setElevLoading(true);
    setElevError(false);
    try {
      const sampled = resamplePath(pts, 64);
      const lats = sampled.map((p) => p[0].toFixed(5)).join(',');
      const lons = sampled.map((p) => p[1].toFixed(5)).join(',');
      const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lons}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('elevation api bad response');
      const data: { elevation?: number[] } = await res.json();
      const elevations = data.elevation || [];
      let gain = 0;
      for (let i = 1; i < elevations.length; i++) {
        const d = elevations[i] - elevations[i - 1];
        if (d > 0) gain += d;
      }
      setElevGain(Math.round(gain));
    } catch {
      setElevGain(null);
      setElevError(true);
    } finally {
      setElevLoading(false);
    }
  }

  // auto-dopočet prevýšenia (debounce 700ms) po každej zmene trasy s ≥2 bodmi
  useEffect(() => {
    if (points.length < 2) { setElevGain(null); setElevError(false); return; }
    const t = setTimeout(() => { computeElevation(points); }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  const difficulty = elevGain != null ? computeDifficulty(km, elevGain) : null;

  const onAdd = (p: LatLngTuple) => setPoints((prev) => [...prev, p]);
  const onUndo = () => setPoints((prev) => prev.slice(0, -1));
  const onClear = () => { setPoints([]); setElevGain(null); setElevError(false); };

  return (
    <div className="tdt-root">
      <style>{CSS}</style>
      <div className="tdt-wrap">
        <div className="tdt-title">Trails draw test</div>
        <div className="tdt-sub">Click the map to place points along a route. Everything else is auto-computed from the map.</div>

        <div className="tdt-layout">
          <div>
            <div className="tdt-mapwrap">
              <MapContainer center={CENTER} zoom={8} zoomControl={false} attributionControl={false} style={{ width: '100%', height: '100%' }}>
                <TileLayer url={mapyTiles('outdoor')} />
                <DrawLayer points={points} onAdd={onAdd} />
              </MapContainer>
              <div className="tdt-attr">
                <a href="https://mapy.com" target="_blank" rel="noopener noreferrer"><img src="https://api.mapy.com/img/api/logo.svg" alt="Mapy.com" style={{ height: 13, display: 'block' }} /></a>
                <span>© Seznam.cz a.s.</span>
              </div>
            </div>
            <div className="tdt-mapbtns">
              <button className="tdt-btn" onClick={onUndo} disabled={points.length === 0}>Undo point</button>
              <button className="tdt-btn" onClick={onClear} disabled={points.length === 0}>Clear</button>
              <button className="tdt-btn tdt-btn--gold" onClick={() => computeElevation(points)} disabled={points.length < 2 || elevLoading}>
                {elevLoading ? 'Computing…' : 'Recompute difficulty'}
              </button>
            </div>
            <div className="tdt-pointcount">{points.length} point{points.length === 1 ? '' : 's'} · key {MAPY_API_KEY.slice(0, 6)}…</div>
          </div>

          <div className="tdt-card">
            <div className="tdt-field">
              <input placeholder="Route name (optional)…" value={routeName} onChange={(e) => setRouteName(e.target.value)} />
            </div>
            <div className="tdt-rows">
              <div className="tdt-row">
                <span className="tdt-rowl">Distance</span>
                <span className="tdt-rowv">{km > 0 ? `${km.toFixed(1)} km` : '—'}</span>
              </div>
              <div className="tdt-row">
                <span className="tdt-rowl">Detected range</span>
                <span className="tdt-rowv">{pohorie ? pohorie.name : '—'}</span>
              </div>
              <div className="tdt-row">
                <span className="tdt-rowl">Zone</span>
                <span className="tdt-rowv">{pohorie ? ZONE_LABEL[pohorie.zone] : '—'}</span>
              </div>
              <div className="tdt-row">
                <span className="tdt-rowl">Elevation gain</span>
                <span className="tdt-rowv">
                  {elevLoading ? 'computing…' : elevError ? 'n/a' : elevGain != null ? `↑ ${elevGain} m` : '—'}
                </span>
              </div>
              <div className="tdt-row">
                <span className="tdt-rowl">Estimated difficulty</span>
                <span className="tdt-rowv tdt-rowv--gold">
                  {elevLoading ? '…' : difficulty ? difficulty : (points.length >= 2 ? 'n/a' : '—')}
                </span>
              </div>
            </div>
            <div className="tdt-note">Everything else is auto-computed from the map. Pohorie/zone detection is a nearest-centroid test approximation — the production version will use point-in-polygon (PostGIS) against regions.ts.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
