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
import { createPortal } from 'react-dom';
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
import { useLongPressPoint } from '@/components/pack/mapnotes/useLongPressPoint';
import { PlaceSearch } from './PlaceSearch';
import { HandPencil } from '@/components/pack/HandIcons';
import {
  ensureElevations,
  elevAt,
  missingElevationCount,
  snapSegment,
  type SnapReason,
} from './mapProxyClient';

const GOLD = '#C99A3F';
const GOLD_BRIGHT = '#F5C73D';

/**
 * Výška lišty kreslenia. Používa sa DVAKRÁT — na jej vlastný layout a na odpanovanie mapy,
 * aby posledný položený bod neskončil pod ňou. Preto je to konštanta, nie dve čísla.
 * Vzor odpanovania je zhodný s `placeNote()` v PackMap.tsx (NOTE_PANEL_H + 40).
 */
export const DRAW_BAR_H = 120;

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
  /**
   * LIŠTA KRESLENIA (beh 2, rez B — Matej 22. 8.: „musí to zvládnuť človek po ceste v aute").
   *
   * Kým bol formulár na mobile schovaný (`mobileDrawing`), zmizol s ním AJ readout a Undo,
   * lebo sú jeho súčasťou. Človek teda kreslil naslepo — nevidel km ani prevýšenie a zlý bod
   * nemal ako vrátiť. Tu sa tie isté čísla a tie isté handlery vykreslia ešte raz, pri spodnej
   * hrane nad mapou.
   *
   * Prečo to renderuje picker a nie PackMap: km, prevýšenie, `notice` o nesnapnutí aj `undo`
   * (ktorý skladá stopu z `legsRef` bez volania siete) žijú TU. Dvíhať ich cez AddTripPlan
   * a AddTripLog do PackMap by z jedného zdroja pravdy urobilo tri.
   */
  drawBar?: { active: boolean; onDone: () => void };
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

// Priblíženie, od ktorého zaberie dlhé stlačenie pri ZAČIATKU TRASY. Zámerne nižšie než
// `MIN_ZOOM_FOR_NOTE` (16), ktorý platí pre zápisy do mapy: značka musí sadnúť na konkrétnu
// odbočku, kdežto prvá kotva trasy sa aj tak prichytí na najbližší chodník. Pri z12 vidno
// pás ~19 km, čo je mierka, v ktorej sa hrebeňovka kreslí na jednu obrazovku.
const TRIP_HOLD_MIN_ZOOM = 12;

// ── komponent ───────────────────────────────────────────────────────────────────────────

// Pulzujúci prstenec pod kotvou. Vlastná vrstva (nie border kotvy) preto, že animácia mení
// polomer — na samotnej kotve by sa hýbal aj bod, ktorý má stáť presne na súradnici.
// `r` v @keyframes nemusí zabrať všade; opacita pulzuje aj tak, takže degraduje ticho.
const anchorHalo = (p: LatLngTuple) =>
  L.circleMarker(p, {
    radius: 9, stroke: false, fillColor: TRAIL_LINE.mid, fillOpacity: 0.55,
    className: 'trp-anchor-halo', interactive: false,
  });

export function GeometryPicker({
  value,
  onChange,
  activity,
  mode,
  allTrails,
  onPickExisting,
  onMetrics,
  mapRef,
  drawBar,
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

  // ── položenie bodu ────────────────────────────────────────────────────────────────────
  const placePoint = useCallback(async (lat: number, lng: number) => {
    const p: LatLngTuple = [lat, lng];

    // Bod položený pod lištou by ostal neviditeľný — mapa sa odpanuje, nie lišta zmenší.
    // Rovnaký vzor ako `placeNote()` v PackMap.tsx.
    if (drawBar?.active) {
      const map = mapRef.current;
      if (map) {
        const pt = map.latLngToContainerPoint(p);
        const safeY = map.getSize().y - DRAW_BAR_H - 40;
        if (pt.y > safeY) map.panBy([0, pt.y - safeY], { animate: true, duration: 0.35 });
      }
    }

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
  }, [value, onChange, buildSnapPath, recomputeAscent, drawBar?.active, mapRef]);

  // ── PRVÁ KOTVA CHCE DLHÉ STLAČENIE (Matej 2026-08-22) ─────────────────────────────────
  // „vysvetlenie — dlhým stlačením zaháj trasu na mape."
  // Platí LEN v mobilnom kreslení (`drawBar.active`) a LEN kým je geometria prázdna: mapa je
  // vtedy jediná obrazovka a človek po nej ešte hľadá, posúva a približuje — obyčajný ťuk by
  // mu pri každom takom pohybe hodil kotvu do lesa. Po prvej kotve už je zrejmé, že kreslí,
  // takže ďalšie body pribúdajú ťuknutím (rýchlejšie a je to pôvodné správanie).
  // Desktop sa NEMENÍ: tam je formulár vedľa mapy, klik je jednoznačný a držanie by len zdržalo.
  const needsHold = !!drawBar?.active
    && (value.kind === 'route' ? value.path.length === 0 : !value.center);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (needsHold) return;
    void placePoint(lat, lng);
  }, [needsHold, placePoint]);

  const placeRef = useRef(placePoint);
  useEffect(() => { placeRef.current = placePoint; }, [placePoint]);
  useLongPressPoint(
    mapRef.current,
    needsHold,
    { onPoint: (lat, lng) => { void placeRef.current(lat, lng); } },
    TRIP_HOLD_MIN_ZOOM,
  );

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
    // KOTVY, nie body stopy — človek musí vidieť, čo undo zmaže.
    // FIALOVÉ, NIE ZLATÉ (Matej 2026-08-22: „tá gulička bude fialová ako svetelný meč a bude
    // pulzovať po vytvorení"). Zlatá tu bola odchýlka: čiara, ktorá z tých bodov vzniká, je
    // fialový meč — kotva inej farby tvrdí, že je to iný predmet. Berie sa z TRAIL_LINE, teda
    // z toho istého zdroja ako vrstvy meča.
    // PULZUJE LEN POSLEDNÁ — je to špička, kde trasa pokračuje. Keby pulzovali všetky, mapa
    // sa hýbe celá a bod, na ktorý sa človek díva, sa v tom stratí.
    if (value.kind === 'route') {
      value.path.forEach((p, i) => {
        const isLast = i === value.path.length - 1;
        if (isLast) add(anchorHalo(p));
        add(L.circleMarker(p, {
          radius: i === 0 ? 6 : 4.5,
          color: TRAIL_LINE.edge, weight: 2,
          fillColor: isLast ? TRAIL_LINE.light : TRAIL_LINE.mid, fillOpacity: 1,
          className: isLast ? 'trp-anchor-live' : undefined,
          interactive: false,
        }));
      });
    }
    if (value.kind === 'point' && value.center) {
      // CIEĽ výletu (plán): jediný bod, teda pulzuje vždy — je to celá geometria.
      add(anchorHalo(value.center));
      add(L.circleMarker(value.center, {
        radius: 7, color: TRAIL_LINE.edge, weight: 2, fillColor: TRAIL_LINE.light, fillOpacity: 1,
        className: 'trp-anchor-live', interactive: false,
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

  // Lišta hovorí to isté, čo červená bublina hore (`.trp-drawhint` v PackMap.tsx) — a lepšie,
  // lebo nesie aj čísla a Undo. Aby na obrazovke nestáli dve hlásenia o tom istom, vešia sa na
  // <body> trieda a bublinu schová CSS. Rovnaký vzor ako `trp-draw-lock` z rezu A: jedna trieda,
  // jedno miesto. Podmienka je tu a nie v PackMap preto, že PackMap nevie, či je picker mountnutý
  // (v niektorých krokoch AddTripLog nie je) — a bublina musí ostať jedinou cestou späť.
  const barOn = !!drawBar?.active;
  useEffect(() => {
    if (!barOn) return;
    document.body.classList.add('trp-drawbar-on');
    return () => { document.body.classList.remove('trp-drawbar-on'); };
  }, [barOn]);

  // AKO ZAČAŤ — text sa mení podľa toho, čo už na mape je. Po druhej kotve mlčí: vtedy je
  // z tvaru na mape zrejmé, čo sa deje, a lišta dole už hlási km a body.
  // ⚠️ NAD CELÝM SLOVENSKOM GESTO NEZABERIE — a mlčať o tom je horšie než prah nemať.
  // Mapa sa otvára na prehľade celej krajiny (z~7), kde je prvá kotva na kilometre nepresná,
  // takže dlhé stlačenie pod `TRIP_HOLD_MIN_ZOOM` nič nepoloží. Bez tejto vetvy človek drží
  // prst, nedeje sa nič a vyzerá to ako pokazená appka. Prekresľuje to `zoomTick` (efekt
  // s vrstvami počúva `zoomend`), takže sa veta prepne sama, len čo si mapu priblíži.
  const zoomNow = mapRef.current?.getZoom() ?? 0;
  const holdTooFar = barOn && zoomNow < TRIP_HOLD_MIN_ZOOM;
  const drawHint = value.kind === 'route'
    ? (value.path.length === 0
        ? t(holdTooFar ? 'pack.addTrip.geo.zoomInFirst' : 'pack.addTrip.geo.startHold')
        : value.path.length < 2 ? t('pack.addTrip.geo.continueTap') : null)
    : (!value.center
        ? t(holdTooFar ? 'pack.addTrip.geo.zoomInFirst' : 'pack.addTrip.geo.startHoldSpot')
        : null);

  // ── ČÍTANIE: JEDEN ZDROJ PRE PANEL AJ LIŠTU ───────────────────────────────────────────
  // Kým bol readout napísaný priamo v JSX panela, lišta by si ho musela opísať — a po prvej
  // zmene formátu (napr. `1 bod` vs `5 bodov`) by dve miesta hovorili dve rôzne veci.
  // ⚠️ NÁVOD HOVORÍ LEN JEDNO MIESTO. V mobilnom kreslení nesie pokyn fialová pilulka hore
  // (nad mapou, kde sa gesto robí) — keby ho lišta opakovala, na obrazovke stoja dve vety
  // o tom istom, a kým prvá kotva chce DRŽANIE, tá druhá by tvrdila „klikaj po mape".
  const readout = value.kind === 'route' ? (
    pointCount < 2
      ? <span style={{ color: T.onDarkDim }}>{barOn ? '' : hint}</span>
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
    <span style={{ color: T.onDarkDim }}>{barOn ? '' : hint}</span>
  );

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
          {readout}
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

      {/* ── LIŠTA KRESLENIA ────────────────────────────────────────────────────────────
          Portál na <body>: panel, v ktorom picker žije, je na mobile schovaný cez
          `display:none` (mobileDrawing), takže čokoľvek vnútri neho by zmizlo s ním.
          `notice` (nesadlo to na chodník) sa hlási TU — panel, ktorý ho hlásil doteraz,
          je počas kreslenia neviditeľný. */}
      {barOn && drawBar && createPortal(
        <>
        {/* ── HORNÝ PÁS: HĽADANIE MIESTA + AKO ZAČAŤ ──────────────────────────────────────
            Matej 2026-08-22: „otvorí sa mapa s vysvetlením ako začať… textarea s lokalitou."
            Mapa je na mobile PRVÁ obrazovka, takže sa človek pozerá na celé Slovensko a nemá
            odkiaľ vedieť, že sa kreslí držaním. Vysvetlivka mizne, len čo prvá kotva sadne —
            návod, ktorý ostane visieť po tom, čo ho človek splnil, je už len prekážka.
            pointerEvents:none na páse a auto na jeho obsahu: gradient nesmie žrať ťuky do mapy
            pod ním (inak by hore vznikol pruh, kde sa nedá kresliť). */}
        <div
          style={{
            position: 'fixed', left: 0, right: 0, top: 0, zIndex: 1200,
            padding: 'calc(10px + env(safe-area-inset-top, 0px)) 16px 14px',
            display: 'grid', gap: 10, pointerEvents: 'none',
            background: 'linear-gradient(180deg, rgba(10,7,4,0.92) 40%, rgba(10,7,4,0))',
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <PlaceSearch mapRef={mapRef} />
          </div>
          {/* ⚠️ PILULKA MUSÍ BYŤ VIDNO NA SVETLEJ MAPE (Matej 23. 8.: „tá fialová pilulka je
              takmer neviditeľná — treba ju zvýrazniť, dať tam ikonku (i) alebo nejakú radu
              z brandu"). Priesvitná fialová na papierovej turistickej mape zmizne — preto
              PLNÝ tmavý podklad (ten istý, aký nesie lišta dole), fialový rám s dosvitom
              zo svetelného meča a ceruzka z hand-drawn setu. `HandIcons` je práve ten kanál,
              ktorý dedí farbu textu (CLAUDE.md) — ikonka teda drží krok s pilulkou sama. */}
          {drawHint && (
            <div
              style={{
                justifySelf: 'center', pointerEvents: 'none',
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '10px 16px 10px 13px', borderRadius: 999,
                background: 'rgba(18,13,7,0.94)',
                backdropFilter: 'blur(10px)',
                border: `1.5px solid ${TRAIL_LINE.light}`,
                boxShadow: '0 0 0 4px rgba(122,47,191,0.20), 0 6px 20px rgba(0,0,0,0.55)',
                fontFamily: FONT_UI, fontSize: 13.5, fontWeight: 600,
                color: '#F3E9FF', textAlign: 'left', maxWidth: 'min(92vw, 460px)',
              }}
            >
              <HandPencil size={17} style={{ color: TRAIL_LINE.light, flexShrink: 0 }} />
              <span>{drawHint}</span>
            </div>
          )}
        </div>
        <div
          style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1200,
            minHeight: DRAW_BAR_H, boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', gap: 10,
            padding: '14px 16px calc(14px + env(safe-area-inset-bottom, 0px))',
            background: 'rgba(18,13,7,0.94)', backdropFilter: 'blur(12px)',
            borderTop: `1px solid ${T.onDarkBorder}`,
            boxShadow: '0 -14px 40px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 20 }}>
            <span style={{ fontFamily: FONT_UI, fontSize: 14, fontWeight: 500, color: T.onDark }}>
              {readout}
            </span>
            {busy && (
              <span style={{ fontFamily: FONT_UI, fontSize: 11, color: T.onDarkDim, whiteSpace: 'nowrap' }}>
                {t('pack.addTrip.geo.snappingBusy')}
              </span>
            )}
          </div>

          {/* zlyhanie snapu sa NIKDY nezamlčí (§5.2c) — aj keď je panel schovaný */}
          {notice && (
            <div style={{ fontFamily: FONT_UI, fontSize: 12, fontWeight: 500, color: GOLD }}>{notice}</div>
          )}

          {/* Rad tlačidiel drží CELÚ šírku, rovnaké diely (feedback_rad_prvkov_plna_sirka_kontajnera).
              HOTOVO je jediná zlatá — zlatá je farba výzvy, nie farba tlačidla. */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={undo}
              disabled={busy || pointCount === 0}
              style={{ ...barBtn, opacity: pointCount === 0 ? 0.4 : 1 }}
            >
              {t('pack.addTrip.geo.undoPoint')}
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={busy || pointCount === 0}
              style={{ ...barBtn, opacity: pointCount === 0 ? 0.4 : 1 }}
            >
              {t('pack.addTrip.geo.clear')}
            </button>
            <button type="button" onClick={drawBar.onDone} style={barDoneBtn}>
              {t('pack.addTrip.geo.done')}
            </button>
          </div>
        </div>
        </>,
        document.body,
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

/** Tlačidlo lišty — sklenené, na tmavom. Nie zlaté: v rade smie byť zlatá len výzva. */
const barBtn: React.CSSProperties = {
  flex: '1 1 0',
  padding: '12px 10px',
  borderRadius: 8,
  background: T.glass,
  border: `1px solid ${T.onDarkBorder}`,
  color: T.onDark,
  fontFamily: FONT_UI,
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

/** HOTOVO — brand CTA podľa `.btn-gold` locku: gradient 135°, radius 8, papyrusový rám. */
const barDoneBtn: React.CSSProperties = {
  flex: '1 1 0',
  padding: '12px 10px',
  borderRadius: 8,
  background: 'linear-gradient(135deg,#F5C73D,#E69E1A)',
  border: '1px solid rgba(250,244,236,0.3)',
  color: '#1c160c',
  fontFamily: FONT_TITLE,
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  boxShadow: '0 0 40px rgba(230,158,26,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
  cursor: 'pointer',
};

export default GeometryPicker;
