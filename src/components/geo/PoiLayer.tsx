// POI vrstva mapy (issue #40) — pramene/pitná voda, výhľady, prístrešky, lavičky.
//
// ── DVA REŽIMY, JEDNO TELO ──────────────────────────────────────────────────
// `<PoiLayer />`            — body z `TRAIL_POI` (250 m koridor okolo trás). Článok výletu.
// `<PoiLayer tiles … />`    — body z dlaždíc `public/poi/v1/` (celé SK). Hlavná mapa a
//                             kreslenie trasy. Dnes nesú spacie miesta, neskôr pramene.
//
// ⚠️ LOCK Z 21. 8. („emoji POI len v blogu") SA 27. 8. ZÚŽIL, NEZRUŠIL. Matej: „ak by som
// chcel pramene, útulne… vidieť hneď — nie viditeľne pri odzoomovaní, ale pri veľkom
// priblížení by sa zobrazili, samozrejme aj pri tvorbe." Pod prahom priblíženia ostáva mapa
// krajiny príbehom o TRASÁCH — presne tak, ako to lock chcel. Nad prahom je to odpoveď na
// otázku „čo je tu v okolí", ktorú hľadanie podľa mena zodpovedať nevie.
//
// ⚠️ PRAH NA HLAVNEJ MAPE JE VYŠŠÍ NEŽ V ČLÁNKU a je to zámer: 13 bolo kalibrované na detail
// JEDNÉHO výletu. Preto je prah PARAMETER, nie druhá konštanta vedľa prvej.
//
// ⚠️ Kdekoľvek sa táto vrstva vykreslí, musí byť aj `<PoiAttribution />` — licencia ODbL.
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
import { POI_EMOJI, sleepEmoji, WORLD_RIM } from '@/components/pack/mapnotes/markEmoji';
import { circleMarkHtml, CIRCLE_MARK_CSS } from '@/components/pack/mapnotes/circleMark';
import { usePoiTiles, type PoiTilePoint } from './usePoiTiles';
import { PlaceCard, PLACE_CARD_CSS } from './PlaceCard';
import { useSleepSpots, spotAt } from './sleepSpotsData';
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
// SPACIE MIESTA IDÚ PRED VŠETKÝM. Sú to položky nášho zoznamu, nie OSM tapeta — a útulňa,
// ktorá pri kolízii ustúpi lavičke, je presne to, kvôli čomu vrstva vzniká. Pramene hneď
// za nimi: voda je pre psa na trase najdôležitejšia informácia, lavička najmenej.
//
// ⚠️ MEDZI SPACÍMI MIESTAMI VYHRÁVA STRECHA NAD LÚKOU, a nie je to vkus — je to zistené.
// Pri Ďurkovej stojí útulňa a hneď vedľa nej (4 m!) táborisko „v prípade naplnenia kapacity
// útulne". S kempom pred chatou mapa v tom mieste ukázala DVA STANY a útulňu vôbec, hoci
// práve ona je to, čo tam človek hľadá. Táborisko pri chate je jej príveskom, nie súperom.
const POI_PRIORITY: Record<string, number> = {
  sleep_hut: -5, sleep_bivak: -3, sleep_camp: -2, sleep_wild: -1,
  spring: 0, shelter: 1, saddle: 2, waterfall: 3, tower: 4,
  cave: 5, viewpoint: 6, firepit: 7, cliff: 8, bench: 9,
};
const prio = (t: string) => POI_PRIORITY[t] ?? 99;

/** Bod ktoréhokoľvek z oboch zdrojov. `TrailPoi` má zúžený `t`, dlaždice nesú aj `sleep_*`. */
type AnyPoi = { t: string; lat: number; lon: number; name?: string; elev?: number };

/** Emoji podľa zdroja typu. Sady sú DVE (`POI_EMOJI` pre OSM body, `SLEEP_EMOJI` pre spacie
 *  miesta) zámerne — spacie miesta si Matej vyberá zvlášť a majú na mape iné postavenie. */
const markEmojiFor = (t: string): string =>
  t.startsWith('sleep_') ? sleepEmoji(t) : (POI_EMOJI as Record<string, string>)[t] ?? '📍';
// Rozostup v px ~ veľkosť značky, nech sa dve nikdy neprekryjú. Značka je od 27. 8. kruh
// `WORLD_CIRCLE_PX` (24 px) — teda stále tretina pôvodnej pilulky (78 px), takže sa na tú
// istú mapu zmestí podstatne viac bodov. 26 nechávam zámerne o 2 px väčšie než kruh:
// biele kruhy, ktoré sa dotýkajú, splynú do jednej škvrny skôr než dve holé emoji.
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
// ── BIELY KRUH S HNEDÝM LEMOM (Matej 2026-08-27) ────────────────────────────
// „všimol som si že útulňa jozefa maka je na mape čo je super ale dajme ich to bielych
// kružkov nech sú lepšie vidno... s tmavozeleným okrajom (to by sme mohli aplikovať na
// všetky emoji na mape týkajúce sa prírody -pramene lavičky skaly)."
//
// Čím to nahradilo TIEŇ BEZ PODLOŽKY: `drop-shadow` obkresľoval tvar emoji a na lese aj
// na snehu sa čítal — ale útulňa medzi trasami a značkami svorky ostávala najslabším
// prvkom mapy práve v okamihu, keď ju človek hľadá. Kruh jej dá rovnakú váhu ako majú
// hrozby a tipy, len o kúsok menšiu (`--world`, 24 px oproti 28).
//
// 🔴 ZELENÁ NEPREŠLA a je to zapísané v `markEmoji.ts` pri `WORLD_RIM`: `#3D7A4E` už na
// mape znamená TIP OD SVORKY a prírodných bodov budú desaťtisíce, takže by tú farbu
// prevahou počtu prepísali. Hnedá teda nie je vkus, je to hranica medzi SVETOM a SVORKOU.
//
// ⚠️ Kruh sa NESTAVIA tu — `circleMarkHtml()` je jediný staviteľ pre všetky kruhové
// značky mapy. Vlastný `<div>` s tými istými rozmermi by bol štvrtá kópia geometrie.
const poiIcon = (t: string) => L.divIcon({
  className: 'mk-wrap',
  html: circleMarkHtml(markEmojiFor(t), WORLD_RIM, ' mk-circle--world'),
});

/** i18n kľúč popisku typu. Do 21. 8. tu bola natvrdo anglická mapa — v slovenskej
 *  appke teda svietilo „Viewpoint". Kľúče žijú v `sk.ts` aj `en.ts`. */
const poiLabelKey = (t: string): string =>
  t.startsWith('sleep_') ? `pack.sleep.${t.slice(6)}` : `pack.poi.${t}`;

/**
 * @param minZoom  prah priblíženia. Článok výletu berie `POI_MIN_ZOOM` (13), hlavná mapa
 *                 a kreslenie trasy 15 — inde by z mapy krajiny bola emoji tapeta.
 * @param tiles    body sa berú z dlaždíc `public/poi/v1/` (celé SK) namiesto `TRAIL_POI`
 *                 (250 m koridor okolo našich trás).
 */
export function PoiLayer({ minZoom = POI_MIN_ZOOM, tiles = false }: { minZoom?: number; tiles?: boolean } = {}) {
  const tx = useT();
  const map = useMap();
  // Prevzaté miesta — načítajú sa raz za život stránky a karta si z nich vyberá podľa
  // vzdialenosti. Bez session (alebo bez platby) je zoznam prázdny a karta ukáže stav
  // „bod zo sveta", čo je pravda, nie chyba.
  const spots = useSleepSpots();
  // DEV: rukoväť na mapu pre vizuálnu kontrolu z konzoly (`__MAP.setView([lat,lon], z)`).
  // react-leaflet inštanciu nikam nevystavuje a cez React fiber sa k nej dostať nedá, takže
  // bez tohto sa vrstva nedá odskúšať inak než ručným ťahaním mapy k správnemu kopcu.
  // `import.meta.env.DEV` je vo `vite build` false ⇒ do produkčného bundlu to nejde.
  if (import.meta.env.DEV) (window as unknown as { __MAP?: unknown }).__MAP = map;
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [moveTick, setMoveTick] = useState(0);
  // handlery MUSIA mať stabilnú referenciu (useCallback) — inak useMapEvent pri každom renderi
  // odhlási starý a prihlási nový listener a udalosť sa vie stratiť v okne medzi tým
  // (rovnaký dôvod je rozpísaný pri TripMarkers v PackMap.tsx).
  const onZoomEnd = useCallback(() => setZoom(map.getZoom()), [map]);
  const onMoveEnd = useCallback(() => setMoveTick((n) => n + 1), []);
  useMapEvent('zoomend', onZoomEnd);
  useMapEvent('moveend', onMoveEnd);

  // Hook sa volá VŽDY, aj keď `tiles` nie je zapnuté — podmienené volanie hooku React
  // nedovolí. Vypnutý vráti prázdno a nesiahne na sieť.
  const tilePoints: PoiTilePoint[] = usePoiTiles(map, tiles && zoom >= minZoom, zoom, moveTick);

  const items = useMemo(() => {
    if (zoom < minZoom) return [];
    const bounds = map.getBounds().pad(0.2);
    const src: AnyPoi[] = tiles ? tilePoints : (TRAIL_POI as AnyPoi[]);
    const vis = src.filter((p) => (p.t !== 'bench' || zoom >= POI_BENCH_MIN_ZOOM) && bounds.contains([p.lat, p.lon]));
    // ROZOSTUP (Matej 2026-07-30, prvé kolo naživo): značky sa na seba kopili — päť výhľadov
    // v jednom chumáči sa nedalo prečítať. Greedy filter v PIXELOCH: bod sa vykreslí len ak sa
    // jeho značka netrafí do už umiestnenej. Pri priblížení sa rozostup roztiahne a vynechané
    // body sa objavia samy — takže sa nič nestráca, len sa to nekopí.
    const placed: { x: number; y: number }[] = [];
    const out: AnyPoi[] = [];
    for (const p of [...vis].sort((a, b) => prio(a.t) - prio(b.t) || (b.name ? 1 : 0) - (a.name ? 1 : 0))) {
      const pt = map.latLngToContainerPoint([p.lat, p.lon]);
      if (placed.some((q) => Math.abs(q.x - pt.x) < MARK_W && Math.abs(q.y - pt.y) < MARK_H)) continue;
      placed.push({ x: pt.x, y: pt.y });
      out.push(p);
      if (out.length >= POI_MAX_RENDER) break;
    }
    return out;
    // moveTick je zámerná závislosť: posun mapy nemení `map`, ale mení viditeľný výrez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, zoom, moveTick, minZoom, tiles, tilePoints]);

  return (
    <>
      <style>{CIRCLE_MARK_CSS}</style>
      <style>{PLACE_CARD_CSS}</style>
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
          {/* ⚠️ AUTOPAN MUSÍ POČÍTAŤ S CHROMOM NAD MAPOU, nie s hranou okna. Karta je vysoká
              (fotka 132 px + text) a otvára sa NAD značkou — s rovnomerným odsadením 20 px
              jej Leaflet nechal miesto až po okraj okna a fotka skončila SCHOVANÁ za horným
              barom a radom filtrov. Vyzeralo to, že fotka chýba, pritom bola načítaná.
              Vľavo/hore preto odsadenie do výšky lišty, vpravo/dole nad spodný nav. */}
          <Popup
            className="poi-popup"
            closeButton={false}
            autoPanPaddingTopLeft={[20, 180]}
            autoPanPaddingBottomRight={[20, 110]}
          >
            <PlaceCard
              poiType={p.t}
              kindLabel={tx(poiLabelKey(p.t))}
              name={p.name}
              elevM={p.elev}
              spot={p.t.startsWith('sleep_') ? spotAt(spots, p.lat, p.lon) : null}
              tx={tx}
            />
          </Popup>
        </Marker>
      ))}
    </>
  );
}

/** Bublina s názvom. Leaflet si nesie vlastný biely chrome (`-content-wrapper`, `-tip`) —
 *  bez prebitia by nad mapou svietil biely obdĺžnik. Rovnaký recept ako `.mn-popup`. */
const POI_CSS = `
.poi-popup .leaflet-popup-content-wrapper{background:rgba(5,5,5,0.94);border:1px solid rgba(201,154,63,0.45);border-radius:10px;box-shadow:0 8px 22px rgba(0,0,0,0.5);padding:0;overflow:hidden;}
/* ⚠️ ŽIADNE "width:auto" + "min-width:0". Práve tá dvojica (spolu s "word-break" v texte)
   zmrštila bublinu na šírku JEDNÉHO PÍSMENA a meno útulne sa vysypalo pod seba — Matej
   2026-08-27: „aha ako to hádže". Šírku nesie karta (".pcard", 260 px), bublina je len rám. */
.poi-popup .leaflet-popup-content{margin:0;padding:0;width:auto!important;min-width:260px;}
.poi-popup .leaflet-popup-tip{background:rgba(5,5,5,0.94);border:1px solid rgba(201,154,63,0.45);}
.poi-popup a.leaflet-popup-close-button{display:none;}
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
