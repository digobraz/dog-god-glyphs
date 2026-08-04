// Vrstva „hmla" (fog of war) — DOGYPT mapová vrstva. Zdroj pravdy vzhľadu aj render pipeline
// je prototyp `plany/prototyp-hmla/index.html` (spustenie: cd plany/prototyp-hmla &&
// python3 -m http.server 8082) — pipeline je odtiaľto prenesená 1:1 (mask → goo → fog → rim),
// parametre podľa `plany/spec-hmla.md` §3/§4.
//
// Kreslí sa priamo do <canvas> v `overlayPane` (POD markermi, `pointer-events:none`) —
// žiadny React re-render na pixel, celý redraw je imperatívny (canvas 2D).
//
// ⚠️ TENTO SÚBOR JE IZOLOVANÝ (paralelná vlna): nevie o prepínači vrstiev ani o `PackMap.tsx`.
// Integračná vlna ho mountuje podmienene, len keď je zvolená vrstva DOGYPT — vypnutie „bez
// zvyšku" tak rieši samotné unmount (canvas sa strhne v cleanup efekte nižšie), nie appka.
import { useCallback, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import { PACK_THEME } from '@/components/pack/packTheme';
import { metersPerPixel } from '@/components/geo/geoMath';

/** Jedna trasa na vykreslenie do hmly (výhradne s potvrdeným prejdením — viď useFogSource). */
export interface FogTrail {
  id: string;
  path: LatLngTuple[];
  /**
   * true = trasu nahral člen sám (GPX import / `localTrails`) → aplikuj súkromný odrez koncov
   * (spec-hmla.md §7). Katalógové trasy (`HERO_TRAILS`/`HERO_JOURNEYS`) štart nemajú niečiu
   * adresu — parkovisko/rázcestie z datasetu — nechaj `false`/`undefined`.
   */
  trim?: boolean;
}

/** Voliteľné override default parametrov — hodnoty a názvy 1:1 podľa spec-hmla.md §3. */
export interface FogLayerParams {
  opacity?: number;
  radiusM?: number;
  minPx?: number;
  maxPx?: number;
  blurPx?: number;
  contrast?: number;
  rim?: boolean;
  rimPx?: number;
  rimColor?: string;
  fadeStart?: number;
  fadeEnd?: number;
  /** Kreslí sa na `res` × CSS rozlíšenie a roztiahne — hmla je aj tak rozmazaná (výkon). */
  res?: number;
  /** Súkromný odrez koncov v metroch — platí LEN na trasy s `trim: true`. */
  trimM?: number;
}

const DEFAULTS: Required<FogLayerParams> = {
  opacity: 0.75,
  radiusM: 300,
  minPx: 10,
  maxPx: 60,
  blurPx: 14,
  contrast: 8,
  rim: true,
  rimPx: 6,
  rimColor: PACK_THEME.accentGold, // #C99A3F brand gold — token, nie hardcoded hex
  fadeStart: 13,
  fadeEnd: 15,
  res: 0.5,
  trimM: 500,
};

export interface FogLayerProps {
  /** Geometria na vykreslenie — komponent sám nič nefetchuje (viď useFogSource.ts). */
  trails: FogTrail[];
  params?: FogLayerParams;
}

// Odrezanie prvých/posledných N metrov trasy (súkromie štartu) — 1:1 port z prototypu.
// Planárna projekcia (rovinná aproximácia lat/lon) je na stovky metrov dosť presná, netreba
// tu haversine.
function trimEnds(path: LatLngTuple[], trimM: number): LatLngTuple[] {
  if (!trimM || path.length < 2) return path;
  const segLen: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const [la1, lo1] = path[i - 1];
    const [la2, lo2] = path[i];
    const dx = (lo2 - lo1) * 111320 * Math.cos((la1 * Math.PI) / 180);
    const dy = (la2 - la1) * 110540;
    const seg = Math.hypot(dx, dy);
    segLen.push(seg);
    total += seg;
  }
  if (total <= trimM * 2.2) return []; // krátka trasa by po odrezaní nezostala žiadna
  const out: LatLngTuple[] = [];
  let run = 0;
  for (let i = 1; i < path.length; i++) {
    run += segLen[i - 1];
    if (run >= trimM && run <= total - trimM) out.push(path[i]);
  }
  return out;
}

export function FogLayer({ trails, params }: FogLayerProps) {
  const map = useMap();

  // „Latest ref" vzor: redraw() je stabilná (useCallback), ale číta AKTUÁLNE trails/params
  // cez ref, nie cez closure — inak by po zmene props kreslila starý stav až do ďalšieho
  // moveend/zoomend. Priradenie počas renderu je bezpečné (rovnaký vzor ako TripMarkers
  // v PackMap.tsx pri handleroch).
  const trailsRef = useRef(trails);
  trailsRef.current = trails;
  const mergedParams: Required<FogLayerParams> = { ...DEFAULTS, ...params };
  const paramsRef = useRef(mergedParams);
  paramsRef.current = mergedParams;

  // hlavný (viditeľný) canvas + 3 offscreen pracovné vrstvy — vytvorené raz v mount efekte,
  // redraw ich len prekresľuje a prípadne mení rozmer.
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const gooRef = useRef<HTMLCanvasElement | null>(null);
  const rimRef = useRef<HTMLCanvasElement | null>(null);

  const fadeFactor = useCallback((): number => {
    const { fadeStart, fadeEnd } = paramsRef.current;
    const z = map.getZoom();
    if (fadeEnd <= fadeStart) return z >= fadeEnd ? 0 : 1;
    return 1 - Math.min(1, Math.max(0, (z - fadeStart) / (fadeEnd - fadeStart)));
  }, [map]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const maskC = maskRef.current;
    const gooC = gooRef.current;
    const rimC = rimRef.current;
    if (!canvas || !maskC || !gooC || !rimC) return;
    const { opacity, radiusM, minPx, maxPx, blurPx, contrast, rim, rimPx, rimColor, res, trimM } =
      paramsRef.current;

    const size = map.getSize();
    const w = Math.round(size.x * res);
    const h = Math.round(size.y * res);
    maskC.width = w; maskC.height = h;
    gooC.width = w; gooC.height = h;
    rimC.width = w; rimC.height = h;
    canvas.width = size.x;
    canvas.height = size.y;
    canvas.style.width = `${size.x}px`;
    canvas.style.height = `${size.y}px`;
    L.DomUtil.setPosition(canvas, map.containerPointToLayerPoint([0, 0]));

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const fade = fadeFactor();
    if (fade <= 0.01) return; // nad fadeEnd je mapa čistá — hľadanie výletu nesmie hmla brzdiť

    const mpp = metersPerPixel(map.getCenter().lat, map.getZoom());
    const radiusPx = Math.min(maxPx, Math.max(minPx, radiusM / mpp));

    // 1) mask — ostré biele ťahy trás
    const mc = maskC.getContext('2d');
    if (!mc) return;
    mc.clearRect(0, 0, w, h);
    mc.strokeStyle = '#fff';
    mc.lineCap = 'round';
    mc.lineJoin = 'round';
    mc.lineWidth = Math.max(1, radiusPx * 2 * res);
    const pad = radiusPx + 40;
    for (const t of trailsRef.current) {
      const pts = t.trim ? trimEnds(t.path, trimM) : t.path;
      if (pts.length < 2) continue;
      mc.beginPath();
      let started = false;
      let visible = false;
      for (const [la, lo] of pts) {
        const cp = map.latLngToContainerPoint([la, lo]);
        const x = cp.x * res;
        const y = cp.y * res;
        if (x > -pad && y > -pad && x < w + pad && y < h + pad) visible = true;
        if (!started) { mc.moveTo(x, y); started = true; } else mc.lineTo(x, y);
      }
      if (visible) mc.stroke();
    }

    // 2) goo — JEDEN prechod blur+contrast nad CELOU maskou. Per-ťah by bloby nespojil, mračná
    // by nevznikli (viď spec-hmla.md §4).
    const gc = gooC.getContext('2d', { willReadFrequently: true });
    if (!gc) return;
    gc.clearRect(0, 0, w, h);
    gc.filter = `blur(${blurPx * res}px) contrast(${contrast})`;
    gc.drawImage(maskC, 0, 0);
    gc.filter = 'none';

    // 3) fog — tmavá plocha mínus diery (goo)
    ctx.fillStyle = `rgba(6,5,4,${opacity * fade})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(gooC, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';

    // 4) rim — zlatý prstenec = (rozmazaná goo) mínus goo, dokreslený nad fog
    if (rim) {
      const rc = rimC.getContext('2d');
      if (!rc) return;
      rc.clearRect(0, 0, w, h);
      rc.filter = `blur(${rimPx * res}px)`;
      rc.drawImage(gooC, 0, 0);
      rc.filter = 'none';
      rc.globalCompositeOperation = 'destination-out';
      rc.drawImage(gooC, 0, 0);
      rc.globalCompositeOperation = 'source-in';
      rc.fillStyle = rimColor;
      rc.fillRect(0, 0, w, h);
      rc.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.9 * fade;
      ctx.drawImage(rimC, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }
  }, [map, fadeFactor]);

  // Vytvorenie canvasov — raz pri mounte. Prekres na moveend/zoomend/resize; počas zoomanim sa
  // canvas skryje (diery by inak počas animácie „plávali"), po zoomend sa vráti a prekreslí.
  useEffect(() => {
    const canvas = L.DomUtil.create('canvas', 'dogypt-fog-canvas') as HTMLCanvasElement;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    map.getPanes().overlayPane.appendChild(canvas);
    canvasRef.current = canvas;
    maskRef.current = document.createElement('canvas');
    gooRef.current = document.createElement('canvas');
    rimRef.current = document.createElement('canvas');

    redraw();

    const onZoomAnim = () => { canvas.style.opacity = '0'; };
    const onZoomEnd = () => { canvas.style.opacity = '1'; redraw(); };
    const onMoveEnd = () => redraw();
    const onResize = () => redraw();
    map.on('zoomanim', onZoomAnim);
    map.on('zoomend', onZoomEnd);
    map.on('moveend', onMoveEnd);
    map.on('resize', onResize);

    return () => {
      map.off('zoomanim', onZoomAnim);
      map.off('zoomend', onZoomEnd);
      map.off('moveend', onMoveEnd);
      map.off('resize', onResize);
      canvas.remove();
      canvasRef.current = null;
      maskRef.current = null;
      gooRef.current = null;
      rimRef.current = null;
    };
    // map je stabilná referencia počas života <MapContainer> — redraw sa nemení, nech sa
    // canvas nevytvára/nemaže pri každej zmene props (to rieši efekt nižšie).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Prekres pri zmene vstupných trás/parametrov (napr. RPC v useFogSource dotiahne dáta až po
  // prvom mounte) — canvasy vzniknú v efekte vyššie, tento len prekreslí nad nimi. Závislosť je
  // na `params` (prop), NIE na `mergedParams` — ten je nový objekt pri KAŽDOM renderi (spread s
  // DEFAULTS), čo by spúšťalo redraw aj bez skutočnej zmeny.
  useEffect(() => {
    redraw();
  }, [trails, params, redraw]);

  return null;
}
