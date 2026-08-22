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
import { useCallback, useState } from 'react';
import { Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { FONT_EMOJI } from '@/components/pack/mapnotes/markEmoji';
import { useT } from '@/i18n/LanguageContext';
import { VIPER_AREAS, VIPER_SOURCE, VIPER_FINDS_TOTAL } from '@/data/viperAreas';

/** Nad týmto priblížením vrstva mizne — krajová značka bez odstupu začína klamať. */
export const VIPER_MAX_ZOOM = 11;

const HAZARD_RED = '#CE4B3C';

// ZÁMERNE VÄČŠIE než značky zápisov (tie majú 20 px, resp. 13 px pri hrozbe
// v dvojici). Matej: „väčšie emoji v náhľade" — a je to aj správne, lebo toto
// nie je jeden nález, ale celý kút krajiny. Pri oddialení navyše konkuruje
// pilulkám výletov, ktoré sú široké a tmavé.
const VIPER_EMOJI_PX = 30;

// Tieň, nie podložka — ten istý recept ako PoiLayer a MapNotesLayer, takže
// všetky tri vrstvy na mape hovoria jedným jazykom.
const VIPER_MARK = `position:relative;left:-50%;top:-50%;display:flex;align-items:center;justify-content:center;width:${VIPER_EMOJI_PX + 4}px;height:${VIPER_EMOJI_PX + 4}px;font-family:${FONT_EMOJI};font-size:${VIPER_EMOJI_PX}px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.85)) drop-shadow(0 0 5px rgba(0,0,0,0.5));cursor:pointer;`;
const viperIcon = () => L.divIcon({ className: 'vp-wrap', html: `<div style="${VIPER_MARK}">🐍</div>` });

export function ViperAreasLayer({ lang }: { lang: string }) {
  const t = useT();
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  // Stabilná referencia — inak useMapEvent pri každom renderi listener prehodí
  // (tá istá pasca ako v TripMarkers a MapNotesLayer).
  const onZoomEnd = useCallback(() => setZoom(map.getZoom()), [map]);
  useMapEvent('zoomend', onZoomEnd);

  if (zoom > VIPER_MAX_ZOOM) return null;
  const sk = lang === 'sk' || lang === 'cs';

  return (
    <>
      <style>{VIPER_CSS}</style>
      {VIPER_AREAS.map((a) => (
        <Marker
          key={a.id}
          position={a.at}
          icon={viperIcon()}
          // Nad pilulkami výletov, ale pod rozpracovaným zápisom: je to kontext
          // k celému kraju, takže sa nemá stratiť, a zároveň nesmie prekryť to,
          // čo človek práve robí.
          zIndexOffset={-200}
        >
          <Popup className="vp-popup" closeButton={false} autoPanPadding={[24, 24]}>
            <div className="vp-bubble">
              <div className="vp-head">
                <i className="vp-em" aria-hidden="true">🐍</i>
                <span className="vp-kind">{t('pack.viper.title')}</span>
              </div>
              <p className="vp-area">{sk ? a.name : a.nameEN}</p>
              <p className="vp-body">{t('pack.viper.finds').replace('{n}', String(a.finds))}</p>
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
      ))}
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
.vp-em{font-style:normal;font-family:${FONT_EMOJI};font-size:17px;line-height:1;}
.vp-kind{font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${HAZARD_RED};}
.vp-area{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:13px;line-height:1.3;color:${T.inkStrong};}
.vp-body{margin:4px 0 0;font-family:${FONT_UI};font-size:12.5px;line-height:1.5;color:${T.inkStrong};}
/* Deliaca čiara je pseudo-prvok, nie border — T.rule je gradient (viď MapNotesLayer). */
.vp-src{position:relative;margin:9px 0 0;padding-top:9px;font-family:${FONT_UI};font-size:10.5px;line-height:1.5;color:${T.inkWarm};}
.vp-src::before{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:${T.rule};}
.vp-src b{font-family:${FONT_TITLE};font-weight:700;color:${T.inkStrong};}
.vp-note{margin:6px 0 0;font-family:${FONT_UI};font-size:10px;line-height:1.45;font-style:italic;color:${T.inkWarm};}
`;
