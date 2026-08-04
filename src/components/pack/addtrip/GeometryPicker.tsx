// ADD TRIP — GeometryPicker (vlna 1, krok 3). Trasa / bod / územie + živé km a prevýšenie.
// Kontrakt: plany/kontrakt-geometrypicker-2026-07-29.md §2 · Zadanie: §5
//
// ARCHITEKTÚRA: mapa žije v PackMap.tsx (`<MapContainer>`), tento komponent ju NEVYTVÁRA —
// dostane `mapRef` a kreslí do nej IMPERATÍVNE cez Leaflet API. Preto tu nie sú react-leaflet
// komponenty: panel s readoutom sa renderuje mimo mapy, vrstvy (čiara, kotvy, duchovia, kruh)
// patria dovnútra — jeden React strom to naraz neurobí, imperatívna vrstva áno.
//
// DVOJVRSTVOVÝ MODEL (kontrakt §0): `path` = KOTVY (klikáš, undo ich maže), `snapPath` =
// odvodená stopa (kotvy poprepájané snapnutou geometriou). Kreslí sa a počíta zo `snapPath ?? path`,
// edituje sa `path`. Zdroj pravdy datasetu to má rovnako (trails-nahadzovac-state.json: 28 kotiev
// / 465 bodov stopy) — keby sa zliali, Matej by trasy pred launchom nevedel opraviť.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import type { LatLngTuple, Map as LeafletMap } from 'leaflet';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import {
  ACTIVITY_GEOMETRY,
  type GeometryKind,
  type TripGeometry,
} from './addTripModel';
import { SPACING, calibratedAscent, hav, interp, totalDistanceM } from './addTripGeo';
import { TRAIL_LINE, TRAIL_SABER_LAYERS, trailSaberScale, ensureTrailLineCss } from '@/components/pack/tripShared';
import {
  ensureElevations,
  elevAt,
  missingElevationCount,
  snapSegment,
  type SnapReason,
} from './mapProxyClient';

const GOLD = '#C99A3F';
const GOLD_BRIGHT = '#F5C73D';

// Územie: rozsah polomeru zo zadania §5.
const AREA_MIN_M = 200;
const AREA_MAX_M = 20000;
const AREA_DEFAULT_M = 1500;

// Kontrola duplicity (§5.3): štart do 300 m od existujúcej trasy s dĺžkou ±20 %.
const DUPLICATE_RADIUS_M = 300;
const DUPLICATE_KM_TOLERANCE = 0.2;

export type GeometryPickerProps = {
  value: TripGeometry;
  onChange: (g: TripGeometry) => void;
  activity: string;
  mode: 'plan' | 'log';
  allTrails: HeroTrail[];
  onPickExisting?: (trail: HeroTrail) => void;
  onMetrics?: (m: { km: number; ascentM: number | null; points: number }) => void;
  mapRef: React.MutableRefObject<LeafletMap | null>;
};

// ── pomocné ─────────────────────────────────────────────────────────────────────────────

/** Povolené režimy pre aktivitu; pri PLÁNE je default najvoľnejší (§5 — nikto nekreslí
 *  presnú trasu na výlet o mesiac). */
export function defaultKindFor(activity: string, mode: 'plan' | 'log'): GeometryKind {
  const cfg = ACTIVITY_GEOMETRY[activity];
  if (!cfg) return 'route';
  if (mode === 'log') return cfg.default;
  const looseFirst: GeometryKind[] = ['area', 'point', 'route'];
  return looseFirst.find((k) => cfg.allowed.includes(k)) ?? cfg.default;
}

export function allowedKindsFor(activity: string): GeometryKind[] {
  return ACTIVITY_GEOMETRY[activity]?.allowed ?? ['route'];
}

/**
 * Kandidát na duplicitu (§5.3): existujúca trasa, ktorej štart je do 300 m od nášho a dĺžka
 * sedí ±20 %. Volá sa PRI SUBMITE — výsledok je otázka, NIE blokovanie.
 */
export function findDuplicate(geometry: TripGeometry, allTrails: HeroTrail[]): HeroTrail | null {
  if (geometry.kind !== 'route') return null;
  const line = geometry.snapPath ?? geometry.path;
  if (line.length < 2) return null;
  const km = totalDistanceM(line) / 1000;
  for (const tr of allTrails) {
    if (!tr.path || tr.path.length < 2) continue;
    if (hav(line[0], tr.path[0]) > DUPLICATE_RADIUS_M) continue;
    const theirKm = parseFloat(tr.km);
    if (!Number.isFinite(theirKm) || theirKm <= 0) continue;
    if (Math.abs(theirKm - km) / theirKm <= DUPLICATE_KM_TOLERANCE) return tr;
  }
  return null;
}

// ── komponent ───────────────────────────────────────────────────────────────────────────

export function GeometryPicker({
  value,
  onChange,
  activity,
  mode,
  allTrails,
  onPickExisting,
  onMetrics,
  mapRef,
}: GeometryPickerProps) {
  const t = useT();
  // legs[i] = geometria medzi kotvou i a i+1. Držané v ref, nie v state: undo musí prepočítať
  // stopu BEZ sieťového volania (§10.2 bod 2) a nesmie spustiť re-render uprostred kreslenia.
  const legsRef = useRef<Array<LatLngTuple[]>>([]);
  const runRef = useRef(0); // sekvencia — rýchle kliky nesmú prepísať novší výsledok starším

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [ascent, setAscent] = useState<number | null>(null);
  const [elevPending, setElevPending] = useState(false);

  const allowed = useMemo(() => allowedKindsFor(activity), [activity]);
  const line = useMemo(
    () => (value.kind === 'route' ? value.snapPath ?? value.path : []),
    [value],
  );
  const km = useMemo(() => (line.length > 1 ? totalDistanceM(line) / 1000 : 0), [line]);

  // ── hlásenie metrík hore ──────────────────────────────────────────────────────────────
  useEffect(() => {
    onMetrics?.({ km, ascentM: ascent, points: value.kind === 'route' ? value.path.length : 0 });
  }, [km, ascent, value, onMetrics]);

  // ── prepočet prevýšenia — CELÁ trasa odznova (§5.2a) ──────────────────────────────────
  // KRITICKÉ: prevýšenie sa NESMIE sčítavať po segmentoch. Batch skript (compute-ascent.py)
  // prevzorkuje celú stopu na 100 m a až potom počíta stúpanie; ak by sme pripočítavali každý
  // nový úsek k predošlému súčtu, dostaneme iné číslo než dataset a tripy sa rozídu.
  const recomputeAscent = useCallback(async (path: LatLngTuple[]) => {
    if (path.length < 2) { setAscent(null); setElevPending(false); return; }
    const run = ++runRef.current;
    const sampled = interp(path, SPACING);

    // najprv z toho, čo už je v cache — číslo naskočí okamžite a dopresní sa po dotiahnutí
    const missing = missingElevationCount(sampled);
    setElevPending(missing > 0);
    if (missing < sampled.length) setAscent(calibratedAscent(path, elevAt));

    if (missing > 0) {
      await ensureElevations(sampled);
      if (run !== runRef.current) return; // medzitým prišiel novší klik
      setAscent(calibratedAscent(path, elevAt));
      setElevPending(missingElevationCount(sampled) > 0);
    }
  }, []);

  // ── zloženie stopy z kotiev + legs ────────────────────────────────────────────────────
  const buildSnapPath = useCallback((anchors: LatLngTuple[]): LatLngTuple[] => {
    if (anchors.length < 2) return anchors.slice();
    const out: LatLngTuple[] = [anchors[0]];
    for (let i = 0; i < anchors.length - 1; i++) {
      const leg = legsRef.current[i];
      const seg = leg && leg.length >= 2 ? leg.slice(1) : [anchors[i + 1]];
      out.push(...seg);
    }
    return out;
  }, []);

  const noticeFor = (reason: SnapReason): string | null => {
    if (reason === 'paused') return t('pack.addTrip.geo.noticePaused');
    if (reason === 'ratelimited') return t('pack.addTrip.geo.noticeRatelimited');
    if (reason === 'straight' || reason === 'error') return t('pack.addTrip.geo.noticeStraight');
    return null;
  };

  // ── klik na mapu ──────────────────────────────────────────────────────────────────────
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    const p: LatLngTuple = [lat, lng];

    if (value.kind === 'point') { onChange({ kind: 'point', center: p }); return; }
    if (value.kind === 'area') {
      onChange({ kind: 'area', center: p, radiusM: value.radiusM || AREA_DEFAULT_M });
      return;
    }

    const anchors = [...value.path, p];

    // prvá kotva — nič sa nesnapuje
    if (anchors.length === 1) {
      onChange({ kind: 'route', path: anchors, snapPath: undefined, snapped: false });
      return;
    }

    // optimistický zápis: rovná čiara hneď, snapnutá geometria doplní odpoveď
    legsRef.current[anchors.length - 2] = [anchors[anchors.length - 2], p];
    onChange({
      kind: 'route',
      path: anchors,
      snapPath: buildSnapPath(anchors),
      snapped: value.snapped,
      hideStartM: value.hideStartM,
    });

    setBusy(true);
    const res = await snapSegment(anchors[anchors.length - 2], p);
    setBusy(false);
    setNotice(noticeFor(res.reason));

    legsRef.current[anchors.length - 2] = res.geometry;
    const snapPath = buildSnapPath(anchors);
    onChange({
      kind: 'route',
      path: anchors,
      snapPath,
      snapped: value.snapped || res.snapped,
      hideStartM: value.hideStartM,
    });
    void recomputeAscent(snapPath);
  }, [value, onChange, buildSnapPath, recomputeAscent]);

  // ── undo / clear ──────────────────────────────────────────────────────────────────────
  // Undo NESMIE volať sieť — legs sú v ref, stopa sa poskladá z nich (§2.2 kontraktu).
  const undo = useCallback(() => {
    if (value.kind !== 'route' || value.path.length === 0) return;
    const anchors = value.path.slice(0, -1);
    legsRef.current = legsRef.current.slice(0, Math.max(0, anchors.length - 1));
    const snapPath = anchors.length > 1 ? buildSnapPath(anchors) : undefined;
    setNotice(null);
    onChange({ kind: 'route', path: anchors, snapPath, snapped: value.snapped, hideStartM: value.hideStartM });
    if (snapPath) void recomputeAscent(snapPath); else setAscent(null);
  }, [value, onChange, buildSnapPath, recomputeAscent]);

  const clear = useCallback(() => {
    legsRef.current = [];
    setAscent(null);
    setNotice(null);
    if (value.kind === 'route') onChange({ kind: 'route', path: [], snapPath: undefined, snapped: false });
    else if (value.kind === 'point') onChange({ kind: 'point', center: undefined as unknown as LatLngTuple });
    else onChange({ kind: 'area', center: undefined as unknown as LatLngTuple, radiusM: AREA_DEFAULT_M });
  }, [value, onChange]);

  // ── prepínač režimu ───────────────────────────────────────────────────────────────────
  const switchKind = useCallback((k: GeometryKind) => {
    if (k === value.kind) return;
    legsRef.current = [];
    setAscent(null);
    setNotice(null);
    if (k === 'route') onChange({ kind: 'route', path: [], snapPath: undefined, snapped: false });
    else if (k === 'point') onChange({ kind: 'point', center: undefined as unknown as LatLngTuple });
    else onChange({ kind: 'area', center: undefined as unknown as LatLngTuple, radiusM: AREA_DEFAULT_M });
  }, [value.kind, onChange]);

  // ── legs sanity: geometria prišla zvonku (GPX import, obnovený draft) ─────────────────
  // Vtedy legsRef nesedí s path — postav ho ako rovné čiary, nech undo funguje ďalej.
  useEffect(() => {
    if (value.kind !== 'route') return;
    const need = Math.max(0, value.path.length - 1);
    if (legsRef.current.length === need) return;
    legsRef.current = Array.from({ length: need }, (_, i) => [value.path[i], value.path[i + 1]]);
  }, [value]);

  // ── klik na mapu: listener priamo na Leaflet mape ─────────────────────────────────────
  // handleMapClick sa mení pri každom kliku (závisí od `value`), preto ho držíme v ref a
  // listener registrujeme RAZ — inak by sa pri každom kliku odhlasoval a prihlasoval znova.
  const clickRef = useRef(handleMapClick);
  useEffect(() => { clickRef.current = handleMapClick; }, [handleMapClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onClick = (e: L.LeafletMouseEvent) => { void clickRef.current(e.latlng.lat, e.latlng.lng); };
    map.on('click', onClick);
    return () => { map.off('click', onClick); };
  }, [mapRef]);

  // ── vrstvy na mape (imperatívne) ──────────────────────────────────────────────────────
  const layersRef = useRef<L.Layer[]>([]);
  const [zoomTick, setZoomTick] = useState(0); // prekreslenie meča po zmene zoomu (viď nižšie)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    layersRef.current.forEach((l) => map.removeLayer(l));
    layersRef.current = [];
    const add = (l: L.Layer) => { l.addTo(map); layersRef.current.push(l); };
    // issue #49 — čo tu nakreslíš, tak to bude vyzerať na mape (fialový „svetelný meč"), preto
    // rovnaké tokeny ako PackMap. CSS s dosvitom si musí ADD flow zabezpečiť sám (vlastná routa).
    ensureTrailLineCss();
    const saberK = trailSaberScale(map.getZoom());

    // duchovia existujúcich trás (§5.3) — tenké polopriehľadné čiary, klik ponúkne log
    if (value.kind === 'route' && onPickExisting) {
      const bounds = map.getBounds();
      allTrails
        .filter((tr) => tr.path?.length > 1 && bounds.intersects(L.latLngBounds(tr.path)))
        .slice(0, 120)
        .forEach((tr) => {
          // duch = tá istá fialová rodina ako hotové trasy, len stlmená na jednu vrstvu —
          // 120 duchov × 4 vrstvy s SVG filtrom by mapu položilo a prekričalo by to trasu,
          // ktorú práve kreslíš.
          const ghost = L.polyline(tr.path, {
            color: TRAIL_LINE.light, weight: 2.5, opacity: 0.4, interactive: true,
          });
          ghost.on('click', (e) => { L.DomEvent.stopPropagation(e); onPickExisting(tr); });
          ghost.bindTooltip(tr.name, { direction: 'top', opacity: 0.9 });
          add(ghost);
        });
    }

    if (value.kind === 'route' && line.length > 1) {
      // kreslená trasa = ten istý „svetelný meč" ako na mape (issue #49) — WYSIWYG, nie zlatá
      TRAIL_SABER_LAYERS.forEach((ly) => {
        add(L.polyline(line, {
          color: ly.color,
          weight: Math.max(0.8, ly.weight * saberK),
          opacity: ly.opacity,
          lineCap: 'round',
          lineJoin: 'round',
          className: ('glow' in ly && ly.glow && saberK >= 0.7) ? 'trp-saber-glow' : undefined,
          interactive: false,
        }));
      });
    }
    // KOTVY, nie body stopy — človek musí vidieť, čo undo zmaže
    if (value.kind === 'route') {
      value.path.forEach((p, i) => {
        add(L.circleMarker(p, {
          radius: i === 0 ? 6 : 4,
          color: '#000', weight: 2,
          fillColor: i === 0 ? GOLD_BRIGHT : '#FFF', fillOpacity: 1,
          interactive: false,
        }));
      });
    }
    if (value.kind === 'point' && value.center) {
      add(L.circleMarker(value.center, {
        radius: 7, color: '#000', weight: 2, fillColor: GOLD_BRIGHT, fillOpacity: 1, interactive: false,
      }));
    }
    if (value.kind === 'area' && value.center) {
      add(L.circle(value.center, {
        radius: value.radiusM, color: GOLD, weight: 2, fillColor: GOLD, fillOpacity: 0.12, interactive: false,
      }));
      add(L.circleMarker(value.center, {
        radius: 6, color: '#000', weight: 2, fillColor: GOLD_BRIGHT, fillOpacity: 1, interactive: false,
      }));
    }

    // hrúbka meča závisí od zoomu → po zoomovaní treba vrstvy prekresliť, inak ostanú v starej
    // mierke až do ďalšej zmeny kotiev (efekt inak beží len na zmenu geometrie)
    const onZoom = () => setZoomTick((n) => n + 1);
    map.on('zoomend', onZoom);

    return () => {
      map.off('zoomend', onZoom);
      layersRef.current.forEach((l) => { if (map.hasLayer(l)) map.removeLayer(l); });
      layersRef.current = [];
    };
  }, [value, line, allTrails, onPickExisting, mapRef, zoomTick]);

  // ── panel ─────────────────────────────────────────────────────────────────────────────
  const pointCount = value.kind === 'route' ? value.path.length : 0;
  const hint =
    value.kind === 'route' ? t('pack.addTrip.geo.hintRoute')
      : value.kind === 'point' ? t('pack.addTrip.geo.hintSpot')
      : t('pack.addTrip.geo.hintArea');

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {/* prepínač režimu — len ak aktivita povoľuje viac než jeden */}
      {allowed.length > 1 && (
        <div style={{ display: 'flex', gap: 6 }}>
          {allowed.map((k) => {
            const on = k === value.kind;
            return (
              <button
                key={k}
                type="button"
                onClick={() => switchKind(k)}
                style={{
                  flex: 1, padding: '7px 10px', borderRadius: 10, cursor: 'pointer',
                  fontFamily: FONT_UI, fontSize: 12, fontWeight: 500,
                  letterSpacing: '.08em', textTransform: 'uppercase',
                  background: on ? 'rgba(201,154,63,0.18)' : 'transparent',
                  border: `1px solid ${on ? GOLD : T.onDarkBorder}`,
                  color: on ? GOLD_BRIGHT : T.onDarkDim,
                }}
              >
                {k === 'route' ? t('pack.addTrip.geo.kindRoute') : k === 'point' ? t('pack.addTrip.geo.kindSpot') : t('pack.addTrip.geo.kindArea')}
              </button>
            );
          })}
        </div>
      )}

      {/* readout — km hneď, prevýšenie do ~1,5 s. Kým výšky bežia, `↑ …`, NIKDY `↑ 0 m`. */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          padding: '9px 12px', borderRadius: 12,
          background: T.glass, border: `1px solid ${T.onDarkBorder}`,
        }}
      >
        <span style={{ fontFamily: FONT_UI, fontSize: 13, fontWeight: 500, color: T.onDark }}>
          {value.kind === 'route' ? (
            pointCount < 2
              ? <span style={{ color: T.onDarkDim }}>{hint}</span>
              : <>
                  {km.toFixed(1)} km
                  <span style={{ color: T.onDarkDim }}> · </span>
                  ↑ {elevPending || ascent === null ? '…' : `${ascent} m`}
                  <span style={{ color: T.onDarkDim }}> · {t('pack.addTrip.geo.pointsSuffix', { n: pointCount })}</span>
                </>
          ) : value.center ? (
            value.kind === 'area'
              ? t('pack.addTrip.geo.areaRadius', { km: (value.radiusM / 1000).toFixed(1) })
              : t('pack.addTrip.geo.spotSet')
          ) : (
            <span style={{ color: T.onDarkDim }}>{hint}</span>
          )}
        </span>

        {value.kind === 'route' && pointCount > 0 && (
          <span style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={undo} disabled={busy} style={miniBtn}>{t('pack.addTrip.geo.undo')}</button>
            <button type="button" onClick={clear} disabled={busy} style={miniBtn}>{t('pack.addTrip.geo.clear')}</button>
          </span>
        )}
      </div>

      {/* územie — polomer 200 m – 20 km (§5) */}
      {value.kind === 'area' && value.center && (
        <input
          type="range"
          min={AREA_MIN_M}
          max={AREA_MAX_M}
          step={100}
          value={value.radiusM}
          onChange={(e) => onChange({ kind: 'area', center: value.center, radiusM: Number(e.target.value) })}
          style={{ width: '100%', accentColor: GOLD }}
        />
      )}

      {/* zlyhanie snapu sa NIKDY nezamlčí (§5.2c) */}
      {notice && (
        <div style={{ fontFamily: FONT_UI, fontSize: 12, fontWeight: 500, color: GOLD }}>
          {notice}
        </div>
      )}
      {busy && (
        <div style={{ fontFamily: FONT_UI, fontSize: 12, color: T.onDarkDim }}>{t('pack.addTrip.geo.snappingBusy')}</div>
      )}
      {value.kind === 'route' && onPickExisting && pointCount === 0 && (
        <div style={{ fontFamily: FONT_TITLE, fontSize: 11, letterSpacing: '.1em', color: T.onDarkDim, textTransform: 'uppercase' }}>
          {t('pack.addTrip.geo.ghostHint')}
        </div>
      )}
    </div>
  );
}

const miniBtn: React.CSSProperties = {
  padding: '5px 10px',
  borderRadius: 8,
  background: 'transparent',
  border: `1px solid ${T.onDarkBorder}`,
  color: T.onDark,
  fontFamily: FONT_UI,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

export default GeometryPicker;
