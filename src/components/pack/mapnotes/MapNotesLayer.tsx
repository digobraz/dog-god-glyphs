// ZÁPISY DO MAPY — VRSTVA ZNAČIEK.
// Zadanie: `plany/zadanie-zapisy-do-mapy-2026-08-20.md` §3
//
// Matejovo pravidlo, ktoré tento súbor drží: **MAPA NESIE ZNAČKY, ČLÁNOK NESIE TEXT.**
// V mape je komentár schovaný pod ikonkou a otvorí ho až klik; rozbalený je až
// v článku výletu (`MapNotesSection.tsx`). Mapa s tromi rozbalenými bublinami je
// nečitateľná a to je presne stav, do ktorého sa takáto vrstva zvykne zvrhnúť.
//
// ── PREČO SA TO NEZHLUKUJE ──────────────────────────────────────────────────
// `TripMarkers` v PackMap.tsx zhlukuje, lebo výletov sú stovky a bez toho sa
// Bratislava zmení na kašu. Zápisy sú iné: je ich rádovo menej a každý je viazaný
// na konkrétne miesto, kde niečo JE (parkovisko, spadnutý most). Zhluk „5" na
// mieste, kde človek hľadá parkovisko, mu nepovie nič — radšej prekryv než
// súhrn. Keby ich raz boli tisíce, zhlukovanie sa dá doplniť tu a nikde inde.
//
// ── DATASETOVÉ BODY ─────────────────────────────────────────────────────────
// Vrstva kreslí aj `customPoi` z `heroTrails.generated.ts` (výhľady, divá zver),
// ktoré appka doteraz NIKDE nekreslila — pozri `datasetNotes()` v mapNotesGeo.ts.
// Sú to dáta z datasetu, nie od členov: nemajú autora, nehlasuje sa o nich
// a nedajú sa mazať.
import { useCallback, useMemo, useState } from 'react';
import L from 'leaflet';
import { Marker, Circle, Popup, useMap, useMapEvent } from 'react-leaflet';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import type { MapNote, NoteKind } from './mapNotesData';
import { isDatasetNote } from './mapNotesGeo';
import { noteGlyphSvg } from './noteIcons';

// Pod týmto priblížením sa vrstva NEKRESLÍ. Zápis je bod na konkrétnom mieste;
// na prehľade krajiny z neho ostane len bodka bez významu, ktorá sa navyše bije
// s trip markermi (overené na 390 px pri z6 — 11 značiek roztrúsených po
// Slovensku vyzeralo ako chyba). Prah je NIŽŠÍ než ten na písanie (z14), aby
// človek najprv videl, že tam niekto niečo napísal, a až potom mohol pridať svoje.
const MIN_ZOOM_VISIBLE = 12;

const GOLD = '#C99A3F';
/** Egyptská modrá — existujúci token, nie nová farba (viď noteIcons.ts). */
const PARK_BLUE = T.brandBlueLite;
const HAZARD_RED = '#CE4B3C';

/** Farba značky podľa významu. Zlatá je STAV (výber/hover), nie farba veci. */
function tintFor(kind: NoteKind): string {
  if (kind === 'parking') return PARK_BLUE;
  if (kind === 'hazard') return HAZARD_RED;
  return GOLD;
}

// ── IKONA ────────────────────────────────────────────────────────────────────
// Parkovisko je ŠTVOREC s písmenom P, všetko ostatné KRUH s hand-drawn kresbou.
// Rozdiel v tvare je zámerný: parkovisko je dopravná konvencia a človek ho má
// prečítať bez toho, aby sa čokoľvek učil (Matej 2026-08-20: „biele P v modrom
// štvorci"). Ostatné značky sú brandové a držia kruh ako zvyšok mapy.
function noteIcon(n: MapNote, stale: boolean): L.DivIcon {
  const tint = tintFor(n.kind);
  const dim = stale ? ' mn-mark--stale' : '';
  if (n.kind === 'parking') {
    return L.divIcon({
      className: 'mn-wrap',
      html: `<div class="mn-mark mn-mark--park${dim}"><span>P</span></div>`,
    });
  }
  return L.divIcon({
    className: 'mn-wrap',
    html: `<div class="mn-mark mn-mark--round${dim}" style="--mn-tint:${tint}">${noteGlyphSvg(n.kind, 15)}</div>`,
  });
}

function formatDate(iso: string, locale: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

export type MapNotesLayerProps = {
  notes: MapNote[];
  /** null = hlas stiahnuť. Vlastný zápis hlasovať nejde — tlačidlá sa vtedy nekreslia. */
  onVote?: (noteId: string, valid: boolean | null) => void;
  onDelete?: (noteId: string) => void;
  /** aktuálny jazyk pre formát dátumu (`sk-SK` / `en-US`) */
  locale?: string;
};

export function MapNotesLayer({ notes, onVote, onDelete, locale = 'en-US' }: MapNotesLayerProps) {
  const t = useT();
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  // Stabilná referencia — inak useMapEvent pri každom renderi odhlási a znova
  // prihlási listener (tá istá pasca ako v TripMarkers).
  const onZoomEnd = useCallback(() => setZoom(map.getZoom()), [map]);
  useMapEvent('zoomend', onZoomEnd);

  // Oblasti sa kreslia POD značkami — kruh je kontext, značka je to, na čo sa klikne.
  const areas = useMemo(() => notes.filter((n) => n.radiusM != null), [notes]);

  if (zoom < MIN_ZOOM_VISIBLE) return null;

  return (
    <>
      {areas.map((n) => (
        <Circle
          key={`area:${n.id}`}
          center={[n.lat, n.lon]}
          radius={n.radiusM as number}
          pathOptions={{
            color: tintFor(n.kind),
            weight: 1.5,
            opacity: n.isStale ? 0.25 : 0.55,
            fillColor: tintFor(n.kind),
            fillOpacity: n.isStale ? 0.05 : 0.12,
          }}
          interactive={false}
        />
      ))}

      {notes.map((n) => {
        const dataset = isDatasetNote(n);
        const canVote = !!onVote && !dataset && !n.isMine;
        const canDelete = !!onDelete && !dataset && n.isMine;
        return (
          <Marker key={n.id} position={[n.lat, n.lon]} icon={noteIcon(n, n.isStale)}>
            <Popup className="mn-popup" closeButton={false} autoPanPadding={[24, 24]}>
              <div className="mn-bubble">
                <div className="mn-bubble-head">
                  <span className="mn-bubble-kind" style={{ color: tintFor(n.kind) }}>
                    {t(`pack.mapNotes.kind.${n.kind}`)}
                  </span>
                  {n.kind === 'parking' && n.paid != null && (
                    <span className="mn-bubble-tag">
                      {t(n.paid ? 'pack.mapNotes.parking.paid' : 'pack.mapNotes.parking.free')}
                    </span>
                  )}
                  {n.isStale && <span className="mn-bubble-stale">{t('pack.mapNotes.unconfirmed')}</span>}
                </div>

                {!!n.body && <p className="mn-bubble-body">{n.body}</p>}

                {/* Dátum svieti vždy — Matej 2026-08-20: „poznámka neumiera svieti tam dátum". */}
                {!dataset && (
                  <div className="mn-bubble-meta">
                    {n.authorFirst && <span className="mn-bubble-author">{n.authorFirst}</span>}
                    {n.packNumber != null && <span className="mn-bubble-num">#{n.packNumber}</span>}
                    <span className="mn-bubble-date">{formatDate(n.createdAt, locale)}</span>
                  </div>
                )}

                {canVote && (
                  <div className="mn-bubble-votes">
                    <button
                      type="button"
                      className={`mn-vote${n.myVote === true ? ' on' : ''}`}
                      onClick={() => onVote?.(n.id, n.myVote === true ? null : true)}
                    >
                      {t('pack.mapNotes.vote.valid')}
                      {n.validVotes > 0 && <b>{n.validVotes}</b>}
                    </button>
                    <button
                      type="button"
                      className={`mn-vote mn-vote--no${n.myVote === false ? ' on' : ''}`}
                      onClick={() => onVote?.(n.id, n.myVote === false ? null : false)}
                    >
                      {t('pack.mapNotes.vote.stale')}
                      {n.staleVotes > 0 && <b>{n.staleVotes}</b>}
                    </button>
                  </div>
                )}

                {canDelete && (
                  <button type="button" className="mn-bubble-del" onClick={() => onDelete?.(n.id)}>
                    {t('pack.mapNotes.delete')}
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

// ⚠️ Leaflet Popup si nesie vlastný biely chrome (`.leaflet-popup-content-wrapper`,
// `-tip`) — bez explicitného prebitia by na tmavej mape svietil biely obdĺžnik.
// Preto sa prepisujú aj tie triedy, nielen vlastné `.mn-*`.
export const MAP_NOTES_CSS = `
.mn-wrap{background:none;border:0;}
.mn-mark{position:relative;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .12s ease,box-shadow .12s ease;}
.mn-mark:hover{transform:translate(-50%,-50%) scale(1.12);}
.mn-mark--park{width:22px;height:22px;border-radius:5px;background:${PARK_BLUE};border:1.5px solid rgba(255,255,255,0.85);box-shadow:0 2px 6px rgba(0,0,0,0.45);}
.mn-mark--park span{font-family:${FONT_UI};font-weight:600;font-size:13px;line-height:1;color:#fff;}
.mn-mark--round{width:24px;height:24px;border-radius:50%;background:${T.pageBg};border:1.5px solid var(--mn-tint,${GOLD});color:var(--mn-tint,${GOLD});box-shadow:0 2px 6px rgba(0,0,0,0.45);}
/* Zošednutý zápis NEMIZNE — Matej: „poznámka neumiera". Len prestáva byť to prvé,
   čo oko na mape chytí. */
.mn-mark--stale{opacity:.42;filter:grayscale(1);}
.mn-mark--stale:hover{opacity:.8;}

.mn-popup .leaflet-popup-content-wrapper{background:${T.glass};border:1px solid ${T.onDarkBorder};border-radius:12px;box-shadow:0 12px 28px rgba(0,0,0,0.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:0;}
.mn-popup .leaflet-popup-content{margin:0;padding:12px 14px;width:auto!important;min-width:180px;max-width:250px;}
.mn-popup .leaflet-popup-tip{background:${T.glass};border:1px solid ${T.onDarkBorder};}
.mn-popup a.leaflet-popup-close-button{display:none;}

.mn-bubble-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:6px;}
.mn-bubble-kind{font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.12em;text-transform:uppercase;}
.mn-bubble-tag{font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:${T.onDarkDim};border:1px solid ${T.onDarkBorder};border-radius:999px;padding:2px 7px;}
.mn-bubble-stale{font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:${T.onDarkDim};}
.mn-bubble-body{margin:0;font-family:${FONT_UI};font-size:12.5px;line-height:1.5;color:${T.onDark};white-space:pre-wrap;word-break:break-word;}
.mn-bubble-meta{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;margin-top:8px;font-family:${FONT_UI};font-size:10.5px;color:${T.onDarkDim};}
.mn-bubble-author{font-family:${FONT_TITLE};font-weight:700;font-size:11px;color:${T.onDark};}
.mn-bubble-votes{display:flex;gap:6px;margin-top:10px;}
.mn-vote{flex:1 1 0;display:inline-flex;align-items:center;justify-content:center;gap:5px;font-family:${FONT_UI};font-weight:600;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:${T.onDarkDim};background:transparent;border:1px solid ${T.onDarkBorder};border-radius:999px;padding:5px 8px;cursor:pointer;transition:color .15s,border-color .15s,background .15s;}
.mn-vote:hover{color:${T.onDark};border-color:${GOLD};}
.mn-vote.on{color:${GOLD};border-color:${GOLD};background:rgba(201,154,63,0.12);}
.mn-vote--no.on{color:${HAZARD_RED};border-color:${HAZARD_RED};background:rgba(206,75,60,0.12);}
.mn-vote b{font-weight:600;}
.mn-bubble-del{margin-top:8px;width:100%;font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:${T.onDarkDim};background:transparent;border:0;padding:4px;cursor:pointer;}
.mn-bubble-del:hover{color:${HAZARD_RED};}
`;
