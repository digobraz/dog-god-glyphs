// POI vrstva mapy (issue #40) — pramene/pitná voda, výhľady, prístrešky, lavičky.
//
// ⚠️ ŽIJE UŽ LEN V ČLÁNKU VÝLETU (Matej 2026-08-21: „na mape musíme zobrazovať len
// emoji naše pridania… a emoji POI len v blogu"). Z celkovej mapy `/pack/map` bola
// vrstva ODOBRATÁ aj s prepínačom v paneli vrstiev — mapa krajiny je o TRASÁCH
// a o tom, čo do nej napísala svorka; lavička pri Piešťanoch tam nemá čo hľadať.
// Ak ju sem raz niekto vráti, musí sa vrátiť aj `<PoiAttribution />` — licencia.
//
// ⚠️ ZDROJ = OPENSTREETMAP (ODbL). POI z Mapy.cz sú dáta Seznamu a kopírovať sa NESMÚ —
// Mapy.com ostáva len ako podkladová dlaždicová vrstva. Licencia OSM vyžaduje viditeľnú
// atribúciu → `<PoiAttribution />` musí byť na každej mape, kde je táto vrstva.
//
// Dáta nie sú ťahané naživo: Overpass je nespoľahlivý (zažitý celoplošný výpadok), takže sú
// predpočítané do koridoru okolo našich trás skriptom `plany/compute-trail-poi.py` a zapečené
// generátorom do `src/data/trailPoi.generated.ts`.
import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import { Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import { TRAIL_POI, POI_ATTRIBUTION, type TrailPoi } from '@/data/trailPoi.generated';
import { FONT_UI } from '@/components/pack/packTheme';
import { FONT_EMOJI, POI_EMOJI } from '@/components/pack/mapnotes/markEmoji';
import { useT } from '@/i18n/LanguageContext';

// Pod týmto priblížením je mapa príbeh o TRASÁCH — lavičky a pramene by z nej urobili šum.
// 13 = štartovací zoom mapy v detaile výletu, kde je vrstva najužitočnejšia („kde je prameň
// na TEJTO trase") → prah je nižšie zámerne, aby si to tam človek nemusel doklikať.
export const POI_MIN_ZOOM = 13;
const POI_BENCH_MIN_ZOOM = 15;   // lavičiek je najviac a nesú najmenej informácie
const POI_MAX_RENDER = 200;      // strop na výrez — nad ním sa mapa mení na emoji tapetu
// Kto pri kolízii vyhráva. VODA je pre psa najdôležitejšia informácia na trase, lavička najmenej.
// Rozšírené 21. 8. o šesť nových typov: orientačné body (sedlo, rozhľadňa) a ciele
// (vodopád, jaskyňa) idú pred vybavenosťou (ohnisko), skalný bod je zaujímavosť
// a lavička ostáva posledná — je jej najviac a nesie najmenej.
const POI_PRIORITY: Record<TrailPoi['t'], number> = {
  spring: 0, shelter: 1, saddle: 2, waterfall: 3, tower: 4,
  cave: 5, viewpoint: 6, firepit: 7, cliff: 8, bench: 9,
};
// Rozostup v px ~ veľkosť značky, nech sa dve nikdy neprekryjú. S holým emoji
// (bez popisku) je značka ŠTVRTINOVÁ oproti pôvodnej pilulke (78 px), takže sa na tú
// istú mapu zmestí podstatne viac bodov — to je vedľajší zisk zmeny, nie nedopatrenie.
const MARK_W = 26;
const MARK_H = 26;

// ── EMOJI BEZ NÁZVU (Matej 2026-08-21) ──────────────────────────────────────
// „POI z OMS by som celkom zmenil — nahradil tiež za emoji bez názvu — názov sa
// ukáže po prejdení myšou alebo kliku."
//
// Čo tým padlo: papyrusová pilulka s popiskom typu, farebný krúžok s hand-drawn
// glyfom a `POI_ICON_SRC`. Popisok na mape bol odpoveď na Matejovo „človek nevie
// čo to je" (30. 7.) — tá otázka nezmizla, len sa presunula z mapy na hover a klik.
// Emoji nesie význam samo a nezaberá 78 px šírky.
//
// Sada emoji je v `markEmoji.ts` (spoločná s mapovými značkami), nie tu — jeden
// zdroj, jedna zmena.
//
// TIEŇ, NIE PODLOŽKA: emoji leží priamo na dlaždici, takže na svetlej mape by sa
// stratilo. Namiesto koliesa pod ním (späť k pilulke) mu tvar obkresľuje mäkký
// tmavý `drop-shadow` — číta sa na lese aj na snehu a nezaberá miesto navyše.
const POI_MARK = `position:relative;left:-50%;top:-50%;display:flex;align-items:center;justify-content:center;width:22px;height:22px;font-family:${FONT_EMOJI};font-size:17px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.85)) drop-shadow(0 0 4px rgba(0,0,0,0.5));cursor:pointer;`;
const poiIcon = (t: TrailPoi['t']) => L.divIcon({
  className: 'trp-pinwrap',
  html: `<div style="${POI_MARK}">${POI_EMOJI[t]}</div>`,
});

/** i18n kľúč popisku typu. Do 21. 8. tu bola natvrdo anglická mapa — v slovenskej
 *  appke teda svietilo „Viewpoint". Kľúče žijú v `sk.ts` aj `en.ts`. */
const poiLabelKey = (t: TrailPoi['t']): string => `pack.poi.${t}`;

export function PoiLayer() {
  const tx = useT();
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
    // ROZOSTUP (Matej 2026-07-30, prvé kolo naživo): značky sa na seba kopili — päť výhľadov
    // v jednom chumáči sa nedalo prečítať. Greedy filter v PIXELOCH: bod sa vykreslí len ak sa
    // jeho značka netrafí do už umiestnenej. Pri priblížení sa rozostup roztiahne a vynechané
    // body sa objavia samy — takže sa nič nestráca, len sa to nekopí.
    const placed: { x: number; y: number }[] = [];
    const out: TrailPoi[] = [];
    for (const p of [...vis].sort((a, b) => POI_PRIORITY[a.t] - POI_PRIORITY[b.t] || (b.name ? 1 : 0) - (a.name ? 1 : 0))) {
      const pt = map.latLngToContainerPoint([p.lat, p.lon]);
      if (placed.some((q) => Math.abs(q.x - pt.x) < MARK_W && Math.abs(q.y - pt.y) < MARK_H)) continue;
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
      <style>{POI_CSS}</style>
      {items.map((p) => (
        <Marker
          key={`poi-${p.t}-${p.lat}-${p.lon}`}
          position={[p.lat, p.lon]}
          icon={poiIcon(p.t)}
          zIndexOffset={-600}   // POI nesmie prebiť trip pin ani vizuálne, ani klikom
          // `title` = natívny tooltip na prejdení myšou. Na dotyku sa neukáže, preto
          // je názov aj v popupe nižšie — Matej chcel „po prejdení myšou ALEBO kliku".
          title={p.name ? `${tx(poiLabelKey(p.t))} · ${p.name}` : tx(poiLabelKey(p.t))}
        >
          <Popup className="poi-popup" closeButton={false} autoPanPadding={[20, 20]}>
            <span className="poi-name">{tx(poiLabelKey(p.t))}</span>
            {p.name && <span className="poi-sub">{p.name}</span>}
          </Popup>
        </Marker>
      ))}
    </>
  );
}

/** Bublina s názvom. Leaflet si nesie vlastný biely chrome (`-content-wrapper`, `-tip`) —
 *  bez prebitia by nad mapou svietil biely obdĺžnik. Rovnaký recept ako `.mn-popup`. */
const POI_CSS = `
.poi-popup .leaflet-popup-content-wrapper{background:rgba(5,5,5,0.94);border:1px solid rgba(201,154,63,0.45);border-radius:10px;box-shadow:0 8px 22px rgba(0,0,0,0.5);padding:0;}
.poi-popup .leaflet-popup-content{margin:0;padding:8px 12px;width:auto!important;min-width:0;max-width:220px;display:flex;flex-direction:column;gap:2px;}
.poi-popup .leaflet-popup-tip{background:rgba(5,5,5,0.94);border:1px solid rgba(201,154,63,0.45);}
.poi-popup a.leaflet-popup-close-button{display:none;}
.poi-name{font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#C99A3F;}
.poi-sub{font-family:${FONT_UI};font-size:12px;line-height:1.4;color:rgba(245,240,228,0.92);word-break:break-word;}
`;

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
