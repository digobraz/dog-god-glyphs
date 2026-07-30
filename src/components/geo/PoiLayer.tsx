// POI vrstva mapy (issue #40) — pramene/pitná voda, výhľady, prístrešky, lavičky.
//
// ⚠️ ZDROJ = OPENSTREETMAP (ODbL). POI z Mapy.cz sú dáta Seznamu a kopírovať sa NESMÚ —
// Mapy.com ostáva len ako podkladová dlaždicová vrstva. Licencia OSM vyžaduje viditeľnú
// atribúciu → `<PoiAttribution />` musí byť na každej mape, kde je táto vrstva.
//
// Dáta nie sú ťahané naživo: Overpass je nespoľahlivý (zažitý celoplošný výpadok), takže sú
// predpočítané do koridoru okolo našich trás skriptom `plany/compute-trail-poi.py` a zapečené
// generátorom do `src/data/trailPoi.generated.ts`.
import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import { Marker, useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import { TRAIL_POI, POI_ATTRIBUTION, type TrailPoi } from '@/data/trailPoi.generated';
import { FONT_UI } from '@/components/pack/packTheme';

// Pod týmto priblížením je mapa príbeh o TRASÁCH — lavičky a pramene by z nej urobili šum.
// 13 = štartovací zoom mapy v detaile výletu, kde je vrstva najužitočnejšia („kde je prameň
// na TEJTO trase") → prah je nižšie zámerne, aby si to tam človek nemusel doklikať.
export const POI_MIN_ZOOM = 13;
const POI_BENCH_MIN_ZOOM = 15;   // lavičiek je najviac a nesú najmenej informácie
const POI_MAX_RENDER = 200;      // strop na výrez — s popiskami sú body širšie, 350 už bol chaos
// Kto pri kolízii vyhráva. VODA je pre psa najdôležitejšia informácia na trase, lavička najmenej.
const POI_PRIORITY: Record<TrailPoi['t'], number> = { spring: 0, shelter: 1, viewpoint: 2, bench: 3 };
// rozostup v px ~ veľkosť pilulky (šírka popisku + glyf), nech sa dve nikdy neprekryjú
const PILL_W = 78;
const PILL_H = 22;

// brand hand-drawn ikonky (NIE lucide) — rovnaký tmavý „ink" filter ako v trailIcons.ts
const INK_FILTER = 'brightness(0) saturate(100%) invert(20%) sepia(30%) saturate(800%) hue-rotate(2deg) brightness(75%) contrast(90%)';
// Matej 2026-07-30: „človek nevie čo to je" → každý bod nesie POPIS TYPU priamo na mape.
// Meno z OSM sa ako label nedá použiť — má ho len 11 % bodov (lavička 6/317, prameň 41/209),
// takže meno ide do tooltipu a na mape je vždy čitateľné, ČO to je.
const POI_ICON_SRC: Record<Exclude<TrailPoi['t'], 'bench'>, string> = {
  spring: '/icons/pack/water.svg',
  viewpoint: '/icons/pack/eye.svg',   // oko číta ako „výhľad"; hora sa pliedla s pohorím
  shelter: '/icons/pack/hut.svg',     // holá chatka; house-heart je psí domov, nie prístrešok
};
const POI_LABEL: Record<TrailPoi['t'], string> = {
  spring: 'Water', viewpoint: 'Viewpoint', shelter: 'Shelter', bench: 'Bench',
};

// Štýly sú inline v divIcon HTML (nie CSS trieda) zámerne — rovnaký vzor ako badgeIcon
// v trailIcons.ts. Vrstva takto funguje na KTOREJKOĽVEK mape bez ťahania CSS za sebou.
// Papyrusová pilulka = rovnaký jazyk ako .trp-pill pri tripoch, len menšia a bez zlatého CTA.
// `left` NIE JE -50 % ako pri trip pilulkách: tam je kotvou stred, tu musí na súradnici sedieť
// GLYF (≈11 px od ľavého okraja), inak by bod ležal niekde uprostred popisku a prameň by na
// mape ukazoval o 35 px vedľa. Lavička glyf nemá → tá sa centruje (viď poiIcon nižšie).
const PILL = `position:relative;left:-11px;top:-50%;display:flex;align-items:center;gap:4px;padding:2px 7px 2px 4px;border-radius:999px;background:linear-gradient(180deg,#F7EFDF,#E8D9BC);border:1.5px solid rgba(201,154,63,0.85);box-shadow:0 2px 7px rgba(0,0,0,0.4);font-family:${FONT_UI};font-size:9.5px;font-weight:500;line-height:1.4;color:#2a1608;white-space:nowrap;letter-spacing:.02em;`;
const GLYPH = `width:13px;height:13px;object-fit:contain;flex:0 0 auto;filter:${INK_FILTER};`;
// lavička nemá v brand hand-drawn sade ikonu → pilulka bez glyfu (čestné), nie cudzí piktogram
const poiIcon = (t: TrailPoi['t']) => L.divIcon({
  className: 'trp-pinwrap',
  html: `<div style="${PILL}${t === 'bench' ? 'padding-left:7px;left:-50%;' : ''}">`
    + (t === 'bench' ? '' : `<img src="${POI_ICON_SRC[t]}" alt="" style="${GLYPH}" />`)
    + `<span>${POI_LABEL[t]}</span></div>`,
});

export function PoiLayer() {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [moveTick, setMoveTick] = useState(0);
  // handlery MUSIA mať stabilnú referenciu (useCallback) — inak useMapEvent pri každom renderi
  // odhlási starý a prihlási nový listener a udalosť sa vie stratiť v okne medzi tým
  // (rovnaký dôvod je rozpísaný pri TripMarkers v PackMap.tsx).
  const onZoomEnd = useCallback(() => setZoom(map.getZoom()), [map]);
  const onMoveEnd = useCallback(() => setMoveTick((n) => n + 1), []);
  useMapEvent('zoomend', onZoomEnd);
  useMapEvent('moveend', onMoveEnd);

  const items = useMemo(() => {
    if (zoom < POI_MIN_ZOOM) return [];
    const bounds = map.getBounds().pad(0.2);
    const vis = TRAIL_POI.filter((p) => (p.t !== 'bench' || zoom >= POI_BENCH_MIN_ZOOM) && bounds.contains([p.lat, p.lon]));
    // ROZOSTUP (Matej 2026-07-30, prvé kolo naživo): popisky sa na seba kopili — päť „Viewpoint"
    // v jednom chumáči sa nedalo prečítať. Greedy filter v PIXELOCH: bod sa vykreslí len ak sa
    // jeho pilulka netrafí do už umiestnenej. Pri priblížení sa rozostup roztiahne a vynechané
    // body sa objavia samy — takže sa nič nestráca, len sa to nekopí.
    const placed: { x: number; y: number }[] = [];
    const out: TrailPoi[] = [];
    for (const p of [...vis].sort((a, b) => POI_PRIORITY[a.t] - POI_PRIORITY[b.t] || (b.name ? 1 : 0) - (a.name ? 1 : 0))) {
      const pt = map.latLngToContainerPoint([p.lat, p.lon]);
      if (placed.some((q) => Math.abs(q.x - pt.x) < PILL_W && Math.abs(q.y - pt.y) < PILL_H)) continue;
      placed.push({ x: pt.x, y: pt.y });
      out.push(p);
      if (out.length >= POI_MAX_RENDER) break;
    }
    return out;
    // moveTick je zámerná závislosť: posun mapy nemení `map`, ale mení viditeľný výrez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, zoom, moveTick]);

  return (
    <>
      {items.map((p) => (
        <Marker
          key={`poi-${p.t}-${p.lat}-${p.lon}`}
          position={[p.lat, p.lon]}
          icon={poiIcon(p.t)}
          zIndexOffset={-600}   // POI nesmie prebiť trip pin ani vizuálne, ani klikom
          title={p.name ? `${POI_LABEL[p.t]} · ${p.name}` : POI_LABEL[p.t]}
        />
      ))}
    </>
  );
}

// Atribúcia je PODMIENKA licencie ODbL, nie dekorácia — preto je v DOM natvrdo a nedá sa
// vypnúť spolu s vrstvou. Patrí na každú mapu, ktorá vykresľuje <PoiLayer />.
export function PoiAttribution({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute', right: 12, bottom: 12, zIndex: 600,
        fontFamily: FONT_UI, fontWeight: 400, fontSize: 9.5, letterSpacing: '.04em',
        color: 'rgba(255,255,255,0.72)', background: 'rgba(20,20,20,0.72)',
        backdropFilter: 'blur(6px)', padding: '3px 8px', borderRadius: 8, pointerEvents: 'none',
        ...style,
      }}
    >
      POI {POI_ATTRIBUTION}
    </div>
  );
}
