// VÝSKYT VRETENICE — VRSTVA HRUBÝCH OBLASTÍ.
// Dáta a dôvod, prečo sú to oblasti a nie body: `src/data/viperAreas.ts`.
//
// Matej 2026-08-21: „po kliknutí na poznámku sa zobrazí info že info pochádzajú
// od… a na uvedených územiach bolo xy nálezov."
//
// ── ZNAČKA, NIE PLOCHA (Matej 2026-08-21) ──────────────────────────────────
// „tá červená machuľa by nemala byť cez celé SVK, urobme len body resp. väčšie
// emoji v náhľade." Vykreslené polygóny zanikli — dôvod je rozpísaný v datasete.
//
// ── PREČO SA TO SKRÝVA PRI PRIBLÍŽENÍ ──────────────────────────────────────
// Značka zastupuje CELÝ KÚT KRAJINY a sedí v ťažisku zhluku. Z odstupu sa tak
// aj číta. Pri zoome na dolinu by z nej bol obyčajný špendlík nad náhodnou
// lúkou — teda tvrdenie „vretenica je TU", ktoré dáta nedávajú. Nad
// `VIPER_MAX_ZOOM` sa preto nekreslí.
// (Opačná logika než `MapNotesLayer`, ktorá sa naopak pri ODDIALENÍ skrýva:
// konkrétny bod bez priblíženia nič nehovorí, krajová značka bez odstupu klame.)
import { useCallback, useMemo, useState } from 'react';
import { Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { FONT_EMOJI } from '@/components/pack/mapnotes/markEmoji';
import { useT } from '@/i18n/LanguageContext';
import { VIPER_POINTS, VIPER_SOURCE, VIPER_FINDS_TOTAL } from '@/data/viperAreas';
import { clusterByPixels, clusterPx, clusterRadiusForZoom } from '@/components/pack/mapnotes/clusterPoints';

/** Nad týmto priblížením vrstva mizne — krajová značka bez odstupu začína klamať. */
export const VIPER_MAX_ZOOM = 11;

const HAZARD_RED = '#CE4B3C';

// ── BIELY KRÚŽOK S ČERVENÝM LEMOM (Matej 2026-08-22) ───────────────────────
// „tie vretenice rozšírme a používajme len tie v bielom krúžku."
//
// Holé 🐍 s tieňom tu bolo od 21. 8. a na svetlej mape sa strácalo — presne
// preto, prečo krúžok vznikol pri hrozbách. Teraz je celá mapa jednotná:
// biely kruh + červený lem = výstraha, nech ju napísal člen alebo prišla
// z cudzieho datasetu.
//
// Kruh je ZÁMERNE väčší než pri zápise svorky (28 px): toto nie je jeden nález,
// ale celý kút krajiny, a pri oddialení konkuruje širokým tmavým pilulkám výletov.
const VIPER_DOT_PX = 34;
const VIPER_EMOJI_PX = 19;

// Odstup zhlukovania berie `clusterRadiusForZoom()` — rovnaký zdroj ako zápisy
// svorky, aby sa dve vrstvy nad jedným výrezom nerozpadali každá inokedy.
// Pevných 28 px tu stálo do 22. 8. a pri z10 nechávalo zo 107 bodov 103 bubliniek.

const VIPER_MARK = `position:relative;left:-50%;top:-50%;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:${VIPER_DOT_PX}px;height:${VIPER_DOT_PX}px;border-radius:999px;background:#FFFFFF;border:2.5px solid ${HAZARD_RED};box-shadow:0 1px 3px rgba(0,0,0,0.45),0 0 0 1px rgba(0,0,0,0.10);font-family:${FONT_EMOJI};font-size:${VIPER_EMOJI_PX}px;line-height:1;cursor:pointer;`;
const viperIcon = () => L.divIcon({ className: 'vp-wrap', html: `<div style="${VIPER_MARK}">🐍</div>` });

// Zhluk — ten istý biely kruh s červeným lemom, len s POČTOM namiesto 🐍
// (Matej 2026-08-22: „z diaľky to budú len biele kruhy z červeným lemom a číslom
// vo vnútri a pri vačšom zoome sa rozpadnú na jednotlivé ikonky").
const clusterMark = (px: number) =>
  `position:relative;left:-50%;top:-50%;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:${px}px;height:${px}px;border-radius:999px;background:#FFFFFF;border:2.5px solid ${HAZARD_RED};box-shadow:0 1px 3px rgba(0,0,0,0.45),0 0 0 1px rgba(0,0,0,0.10);font-family:${FONT_TITLE};font-weight:700;font-size:${px < 36 ? 12 : px < 48 ? 13 : 15}px;color:${HAZARD_RED};`;
const viperClusterIcon = (n: number) =>
  L.divIcon({ className: 'vp-wrap', html: `<div style="${clusterMark(clusterPx(n))}">${n}</div>` });

export function ViperAreasLayer({ lang }: { lang: string }) {
  const t = useT();
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [moveTick, setMoveTick] = useState(0);
  // Stabilná referencia — inak useMapEvent pri každom renderi listener prehodí
  // (tá istá pasca ako v TripMarkers a MapNotesLayer).
  const onZoomEnd = useCallback(() => setZoom(map.getZoom()), [map]);
  useMapEvent('zoomend', onZoomEnd);
  const onMoveEnd = useCallback(() => setMoveTick((n) => n + 1), []);
  useMapEvent('moveend', onMoveEnd);

  // Zhlukuje sa LEN v rámci tejto vrstvy — cudzí dataset sa nesmie zliať
  // s upozorneniami svorky do jedného čísla (dôvod v `clusterPoints.ts`).
  const items = useMemo(() => {
    if (zoom > VIPER_MAX_ZOOM) return [];
    const bounds = map.getBounds().pad(0.35);
    const vis = VIPER_POINTS.filter((p) => bounds.contains(p.at));
    const proj = vis.map((p) => {
      const pt = map.latLngToContainerPoint(p.at);
      return { p, x: pt.x, y: pt.y };
    });
    return clusterByPixels(proj, clusterRadiusForZoom(zoom)).map((c) => {
      if (c.items.length === 1) return { kind: 'single' as const, p: c.items[0].p };
      const ll = map.containerPointToLatLng([c.x, c.y]);
      return { kind: 'cluster' as const, lat: ll.lat, lon: ll.lng, count: c.items.length };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, zoom, moveTick]);

  if (zoom > VIPER_MAX_ZOOM) return null;
  const sk = lang === 'sk' || lang === 'cs';

  return (
    <>
      <style>{VIPER_CSS}</style>
      {items.map((it) =>
        it.kind === 'cluster' ? (
          <Marker
            key={`vcl:${it.lat.toFixed(4)}:${it.lon.toFixed(4)}:${it.count}`}
            position={[it.lat, it.lon]}
            icon={viperClusterIcon(it.count)}
            interactive={false}
            zIndexOffset={-200}
          />
        ) : (
        <Marker
          key={it.p.id}
          position={it.p.at}
          icon={viperIcon()}
          // Nad pilulkami výletov, ale pod rozpracovaným zápisom: je to kontext
          // k celému kraju, takže sa nemá stratiť, a zároveň nesmie prekryť to,
          // čo človek práve robí.
          zIndexOffset={-200}
        >
          {/* ⚠️ Odsadenie musí pokryť plávajúce panely, nie okraj kontajnera — mapa
              je full-bleed POD nimi, takže „24 px zhora" znamená schovaný pod lištou
              (Matej 2026-08-22: „popupy pri vreteniciach sa zobrazujú zle cez okraj
              obrazovky"). Rovnaké čísla ako v MapNotesLayer — dve bubliny nad jednou
              mapou nesmú mať dva rôzne okraje. */}
          <Popup
            className="vp-popup"
            closeButton={false}
            autoPanPaddingTopLeft={[24, 170]}
            autoPanPaddingBottomRight={[24, 110]}
            keepInView
          >
            <div className="vp-bubble">
              <div className="vp-head">
                {/* Krúžok aj v bubline — tá istá zmena ako pri zápisoch svorky
                    (Matej 2026-08-22). Bublina je to, na čo človek klikol; holé
                    emoji by v nej čítalo ako iná vec než značka pod prstom. */}
                <span className="vp-mark" aria-hidden="true"><i className="vp-em">🐍</i></span>
                <span className="vp-kind">{t('pack.viper.title')}</span>
              </div>
              <p className="vp-area">{sk ? it.p.name : it.p.nameEN}</p>
              <p className="vp-body">{t('pack.viper.one')}</p>
              {/* ZDROJ NIE JE DROBNÉ PÍSMO NAKONIEC — sú to cudzie dáta a bez mena
                  by bublina tvrdila, že ich máme od seba. */}
              <p className="vp-src">
                {t('pack.viper.source')}<br />
                <b>{VIPER_SOURCE.name}</b> · {VIPER_SOURCE.org}
              </p>
              <p className="vp-note">
                {t('pack.viper.rough').replace('{total}', String(VIPER_FINDS_TOTAL))}
              </p>
            </div>
          </Popup>
        </Marker>
        ),
      )}
    </>
  );
}

// Papyrus, rovnako ako bublina zápisu (mn-popup) — dve bubliny nad tou istou
// mapou nesmú byť z dvoch svetov. Leaflet si aj tu nesie vlastný biely chrome.
const VIPER_CSS = `
.vp-popup .leaflet-popup-content-wrapper{background:${T.panelGrad};border:1.5px solid ${T.cardEdge};border-radius:14px;box-shadow:${T.panelShadow};padding:0;}
.vp-popup .leaflet-popup-content{margin:0;padding:12px 14px;width:auto!important;min-width:200px;max-width:270px;}
.vp-popup .leaflet-popup-tip{background:${T.card};border:1.5px solid ${T.cardEdge};box-shadow:none;}
.vp-popup a.leaflet-popup-close-button{display:none;}
.vp-wrap{background:none;border:0;}
.vp-head{display:flex;align-items:center;gap:7px;margin-bottom:6px;}
.vp-mark{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;background:#FFFFFF;border:2px solid ${HAZARD_RED};box-sizing:border-box;}
.vp-em{font-style:normal;font-family:${FONT_EMOJI};font-size:15px;line-height:1;}
.vp-kind{font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${HAZARD_RED};}
.vp-area{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:13px;line-height:1.3;color:${T.inkStrong};}
.vp-body{margin:4px 0 0;font-family:${FONT_UI};font-size:12.5px;line-height:1.5;color:${T.inkStrong};}
/* Deliaca čiara je pseudo-prvok, nie border — T.rule je gradient (viď MapNotesLayer). */
.vp-src{position:relative;margin:9px 0 0;padding-top:9px;font-family:${FONT_UI};font-size:10.5px;line-height:1.5;color:${T.inkWarm};}
.vp-src::before{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:${T.rule};}
.vp-src b{font-family:${FONT_TITLE};font-weight:700;color:${T.inkStrong};}
.vp-note{margin:6px 0 0;font-family:${FONT_UI};font-size:10px;line-height:1.45;font-style:italic;color:${T.inkWarm};}
`;
