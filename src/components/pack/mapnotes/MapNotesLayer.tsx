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
import { PACK_THEME as T, PACK_BOX, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import { groupOf, type MapNote, type NoteKind, type TickDisease } from './mapNotesData';
import { isDatasetNote } from './mapNotesGeo';
import { clusterByPixels, clusterPx } from './clusterPoints';
import { GROUP_TINT, HAZARD_RED, noteTint } from './NotePalette';
import { FONT_EMOJI, MARK_EMOJI, threatEmoji } from './markEmoji';

// Pod týmto priblížením sa vrstva NEKRESLÍ. Zápis je bod na konkrétnom mieste;
// na prehľade krajiny z neho ostane len bodka bez významu, ktorá sa navyše bije
// s trip markermi (overené na 390 px pri z6 — 11 značiek roztrúsených po
// Slovensku vyzeralo ako chyba). Prah je NIŽŠÍ než ten na písanie (z14), aby
// človek najprv videl, že tam niekto niečo napísal, a až potom mohol pridať svoje.
const MIN_ZOOM_VISIBLE = 12;

// Odsadenie pre auto-pan bubliny. Mapa je full-bleed pod plávajúcimi panelmi,
// takže hodnoty NIE SÚ „pekné okraje", ale výška toho, čo je nad ňou a pod ňou:
// hore lišta identity + rad filtrov, dole navigácia a lišta akcií.
const POPUP_PAD_TOP = 170;
const POPUP_PAD_BOTTOM = 110;

// Polomer zhluku v pixeloch. Rovnaké číslo ako spodná vrstva výletov (28 px) —
// dve vrstvy nad tou istou mapou nesmú zhlukovať s rôznym odstupom, inak sa
// pri rovnakom výreze rozpadne jedna skôr než druhá a vyzerá to ako chyba.
const CLUSTER_R_PX = 28;

/** Egyptská modrá — existujúci token, nie nová farba (viď noteIcons.ts). */
/** Komentár. Modrý, nie zlatý — dôvod je pri `GROUP_TINT` v NotePalette.tsx. */

/**
 * Farba značky podľa významu. Zlatá je STAV (výber/hover), nie farba veci.
 * Červenú dostáva CELÁ skupina upozornení (kliešte · zver · vretenica · medveď ·
 * iné) — pre oko na mape je to jedna vec, podtyp nesie druhé emoji pri ⚠️.
 * Tú istú červenú dostáva aj kruh polomeru (Matej 2026-08-21: „kruh bude červený").
 *
 * ⚠️ Komentár je od 21. 8. MODRÝ, nie zlatý — `#C99A3F` na svetlej mape zmizne
 * (Matej: „tá nie je takmer vobec vidno"). Zlatá v tomto súbore po prechode bubliny
 * na papyrus (21. 8.) už nežije ako konštanta — nesie ju `T.cardEdge` z matrice.
 */

// ── ZNAČKA = HOLÉ EMOJI, BEZ VÝNIMKY (Matej 2026-08-21, 3. kolo) ────────────
// „Holé emoji na mape = emoji nie ikona! upozornenie tiež!". Modrý štvorec s P,
// zlatý kruh so psom aj clip-path trojuholník zanikli — 🅿️ nesie ten istý modrý
// štvorec natívne, ⚠️ ten istý výstražný trojuholník, a komentár žiadnu podložku
// nikdy nepotreboval. Na mape neostala ani jedna nakreslená podložka.
//
// UPOZORNENIE má od 22. 8. jedinú výnimku z holého emoji: hrozba stojí v BIELOM
// KRUHU S ČERVENÝM LEMOM (Matej, predloha = mapka výskytu vretenice). Význam sa
// delí rovnako ako predtým — kruh a lem = SKUPINA, emoji vnútri = PODTYP — len
// namiesto malého ⚠️ vedľa hrozby ho nesie tvar. Dôvod je pri `threatEmoji()`.
//
// ⚠️ Červená tak už NIE JE len na kruhu polomeru: nesie ju aj lem značky.
// `noteTint()` je jej jediný zdroj, takže sa nemá kde rozísť.
//
// Prečo emoji a nie hand-drawn kresba, je rozpísané v `markEmoji.ts`.
// `noteIcons.ts` ostáva knižnicou kresieb pre iné povrchy, len ho už nevolá mapa.

/** Značka pre daný druh ako HTML string — zdieľa ju vrstva aj ťahateľná značka v AddMapNote. */
export function noteMarkHtml(kind: NoteKind, extra = '', dataset = false, disease: TickDisease | null = null): string {
  // ── KRÚŽOK PATRÍ ĽUĎOM, NIE OSM (Matej 2026-08-22) ───────────────────────
  // „datasetové body ktore su načítané z OSM budu bez krúžku a s krúžkom budú
  // len tie od užívateľov."
  //
  // Krúžok hovorí „toto niekto zo svorky videl a napísal" — má autora, dátum,
  // hlasovanie a dá sa zmazať. Prameň z OSM nič z toho nemá. Keby vyzeral rovnako,
  // mapa by tvrdila, že za ním stojí člen.
  if (dataset) {
    return `<div class="mn-mark mn-mark--emoji${extra}"><i>${MARK_EMOJI[kind] ?? ''}</i></div>`;
  }
  if (groupOf(kind) === 'warning') {
    // Kruh je súmerný, takže na súradnici sedí jeho stred — žiadny dopočet posunu
    // ako pri zaniknutej dvojici ⚠️ + hrozba.
    // Lem sa píše inline, lebo pri kliešti závisí od TOHO ZÁPISU (oranžový výskyt
    // vs. červená potvrdená choroba), nie od druhu. CSS by vedelo len druh.
    return `<div class="mn-mark mn-mark--threat${extra}" style="border-color:${noteTint(kind, disease)}"><i>${threatEmoji(kind)}</i></div>`;
  }
  // TIP má ten istý kruh ako hrozba, len ZELENÝ lem (Matej 2026-08-22, oprava modrej
  // z toho istého dňa: „tip je ešte lepšie ako rada = bude to niečo v pozitívnom duchu,
  // rada niečo čo druhí psíčkar ocení"). Tvar hovorí „toto napísal člen svorky", farba
  // lemu hovorí, či ťa to má varovať, alebo potešiť — a to modrá nevedela povedať ani
  // jedno, lebo tou istou modrou appka značí „ideš s niekým".
  // 🅿️ ostáva jediná HOLÁ značka — modrý štvorec nesie natívne a druhá podložka
  // okolo neho by bola podložka v podložke.
  if (groupOf(kind) === 'comment') {
    return `<div class="mn-mark mn-mark--tip${extra}"><i>${MARK_EMOJI[kind] ?? ''}</i></div>`;
  }
  return `<div class="mn-mark mn-mark--emoji${extra}"><i>${MARK_EMOJI[kind] ?? ''}</i></div>`;
}

function noteIcon(n: MapNote, stale: boolean): L.DivIcon {
  return L.divIcon({
    className: 'mn-wrap',
    html: noteMarkHtml(n.kind, stale ? ' mn-mark--stale' : '', isDatasetNote(n), n.disease),
  });
}

/** Bublina zhluku — biely kruh, červený lem, počet vnútri. */
function clusterIcon(n: number): L.DivIcon {
  const s = clusterPx(n);
  return L.divIcon({
    className: 'mn-wrap',
    html: `<div class="mn-mark mn-cluster" style="width:${s}px;height:${s}px;font-size:${n < 12 ? 12 : 13}px">${n}</div>`,
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
  const [moveTick, setMoveTick] = useState(0);
  // Stabilná referencia — inak useMapEvent pri každom renderi odhlási a znova
  // prihlási listener (tá istá pasca ako v TripMarkers).
  const onZoomEnd = useCallback(() => setZoom(map.getZoom()), [map]);
  useMapEvent('zoomend', onZoomEnd);

  const onMoveEnd = useCallback(() => setMoveTick((n) => n + 1), []);
  useMapEvent('moveend', onMoveEnd);

  // Oblasti sa kreslia POD značkami — kruh je kontext, značka je to, na čo sa klikne.
  const areas = useMemo(() => notes.filter((n) => n.radiusM != null), [notes]);

  // ── HROZBY SA ZHLUKUJÚ, ZVYŠOK SA SKRÝVA (Matej 2026-08-22) ──────────────
  // „tie hrozby musíme upraviť tak ako sú výlety… z diaľky to budú len biele
  // kruhy z červeným lemom a číslom vo vnútri a pri vačšom zoome sa rozpadnú
  // na jednotlivé ikonky."
  //
  // Nahradilo to červené bodky z toho istého dňa. Bodka povedala „tu niečo je",
  // ale nie KOĽKO — a pri desiatkach zápisov by sa z nej stala súvislá červená
  // šmuha po severe. Číslo v bublinke je ten istý jazyk, akým hovoria výlety,
  // takže sa mapa nemusí učiť dvakrát.
  //
  // Upozornenia sú preto viditeľné VŽDY. Parkovisko, tip a datasetové body
  // ostávajú pod prahom skryté: nie sú dôvod meniť trasu a z odstupu by z nich
  // bola len šedina nad pilulkami výletov.
  const warnings = useMemo(() => notes.filter((n) => groupOf(n.kind) === 'warning'), [notes]);
  const rest = useMemo(() => notes.filter((n) => groupOf(n.kind) !== 'warning'), [notes]);

  // `moveTick` v závislostiach NIE JE zbytočný — projekcia do pixelov závisí od
  // výrezu, takže po pane treba prepočítať, aj keď sa zoznam zápisov nezmenil.
  const warnItems = useMemo(() => {
    const bounds = map.getBounds().pad(0.35);
    const vis = warnings.filter((n) => bounds.contains([n.lat, n.lon]));
    const proj = vis.map((n) => {
      const pt = map.latLngToContainerPoint([n.lat, n.lon]);
      return { n, x: pt.x, y: pt.y };
    });
    return clusterByPixels(proj, CLUSTER_R_PX).map((c) => {
      if (c.items.length === 1) return { kind: 'single' as const, n: c.items[0].n };
      const ll = map.containerPointToLatLng([c.x, c.y]);
      return { kind: 'cluster' as const, lat: ll.lat, lon: ll.lng, count: c.items.length };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warnings, map, zoom, moveTick]);

  const showRest = zoom >= MIN_ZOOM_VISIBLE;

  const renderNote = (n: MapNote) => {
    const dataset = isDatasetNote(n);
    const canVote = !!onVote && !dataset && !n.isMine;
    const canDelete = !!onDelete && !dataset && n.isMine;
    return (
    <Marker key={n.id} position={[n.lat, n.lon]} icon={noteIcon(n, n.isStale)}>
      <Popup
        className="mn-popup"
        closeButton={false}
        /* ⚠️ NIE `autoPanPadding={[24,24]}` — mapa je full-bleed POD plávajúcimi
           panelmi, takže „24 px od okraja kontajnera" znamená schovaný pod
           hornou lištou. Odsadenie hore musí pokryť lištu + filtre (Matej
           2026-08-22: „popupy sa zobrazujú zle cez okraj obrazovky"), dole
           spodnú navigáciu. `keepInView` drží bublinu vnútri aj pri posune mapy. */
        autoPanPaddingTopLeft={[24, POPUP_PAD_TOP]}
        autoPanPaddingBottomRight={[24, POPUP_PAD_BOTTOM]}
        keepInView
      >
        <div className="mn-bubble">
          <div className="mn-bubble-head">
            {/* KRÚŽOK AJ TU (Matej 2026-08-22: „aj tam bude emoji v krúžku nie
                len tak"). Bublina je to isté, na čo človek klikol — keby v nej
                emoji stálo holé, čítalo by sa ako iná vec než značka pod prstom.
                Farba lemu ide z `noteTint`, teda z toho istého zdroja ako značka.

                V bubline je LEN konkrétna hrozba, bez ⚠️ (Matej 2026-08-21:
                „stačí už len vretenica"): na mape ⚠️ nesie skupinu, lebo tam je
                emoji jediný nosič významu — tu ju nesie vypísaný názov hneď vedľa. */}
            <span className="mn-bubble-mark" style={{ borderColor: noteTint(n.kind, n.disease) }} aria-hidden="true">
              <i className="mn-bubble-em">{MARK_EMOJI[n.kind] ?? ''}</i>
            </span>
            <span className="mn-bubble-kind" style={{ color: noteTint(n.kind, n.disease) }}>
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
              {/* Fotka autora = FOTKA PSA. Portrét človeka appka nemá a pes je
                  tvárou člena aj v PackTree, GodsGrid a na share karte. */}
              {n.authorPhoto
                ? <img className="mn-bubble-face" src={n.authorPhoto} alt="" loading="lazy" />
                : <span className="mn-bubble-face mn-bubble-face--empty" aria-hidden="true">
                    {(n.authorFirst || '?').slice(0, 1).toUpperCase()}
                  </span>}
              <span className="mn-bubble-who">
                {n.authorFirst && <b className="mn-bubble-author">{n.authorFirst}</b>}
                <span className="mn-bubble-date">{formatDate(n.createdAt, locale)}</span>
              </span>
            </div>
          )}

          {/* Tlačidlo „Pomohlo" tu bolo od 21. 8. a 22. 8. ho Matej zrušil
              („to tlačítko pomohlo dajme preč"). Tabuľka `map_note_likes`,
              RPC `like_map_note` ani `useMapNotes().like` NEZANIKLI — sú to
              dáta, nie ozdoba, a zmazať ich kvôli jednej obrazovke by bola
              nevratná strata za vratný problém. Vrátiť tlačidlo = tento blok.

              Prečo tu prekážalo: hlas „platí / už neplatí" a lajk „pomohlo mi
              to" sú dve otázky na jednu vec a v bubline širokej 270 px sa
              čítali ako dve verzie toho istého tlačidla. */}

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
  };

  return (
    <>
      {/* Kruhy oblastí len nad prahom — pri oddialení ich zastupuje číslo v zhluku. */}
      {showRest && areas.map((n) => (
        <Circle
          key={`area:${n.id}`}
          center={[n.lat, n.lon]}
          radius={n.radiusM as number}
          pathOptions={{
            color: noteTint(n.kind, n.disease),
            weight: 1.5,
            opacity: n.isStale ? 0.25 : 0.55,
            fillColor: noteTint(n.kind, n.disease),
            fillOpacity: n.isStale ? 0.05 : 0.12,
          }}
          interactive={false}
        />
      ))}

      {/* HROZBY: zhluk s číslom, alebo konkrétna značka. Zhluk je neklikateľný
          zámerne — otvoriť bublinu k šiestim zápisom naraz sa nedá a „priblíž sa"
          povie tvar sám. */}
      {warnItems.map((it) =>
        it.kind === 'cluster' ? (
          <Marker
            key={`cl:${it.lat.toFixed(4)}:${it.lon.toFixed(4)}:${it.count}`}
            position={[it.lat, it.lon]}
            icon={clusterIcon(it.count)}
            interactive={false}
          />
        ) : (
          renderNote(it.n)
        ),
      )}

      {/* Parkovisko, tip a datasetové body — len nad prahom. */}
      {showRest && rest.map(renderNote)}
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
/* HOLÉ EMOJI — bez podložky. Tieň nahrádza kolieskо: na svetlej mape (les, sneh)
   by emoji bez obrysu splynulo, a podložka je presne to, čo Matej zamietol.
   Rovnaký recept nesie PoiLayer, takže obe vrstvy hovoria jedným jazykom. */
.mn-mark--emoji{width:26px;height:26px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.85)) drop-shadow(0 0 4px rgba(0,0,0,0.5));}
.mn-mark--emoji i{font-size:20px;}
/* ── EMOJI VNÚTRI ZNAČKY ───────────────────────────────────────────────────
   <i> je len nosič, nie kurzíva — font-style:normal to vracia späť. Emoji
   MUSÍ mať vlastný font stack: zdedený Cinzel by na Windows sadol na čiernobiely
   textový variant a z 🦌 by ostal obdĺžnik. */
.mn-mark i{font-style:normal;font-family:${FONT_EMOJI};line-height:1;-webkit-user-select:none;user-select:none;}

/* ── UPOZORNENIE = EMOJI V BIELOM KRUHU S ČERVENÝM LEMOM ──────────────────
   Jediná podložka, ktorá na mape ostala (Matej 2026-08-22). Nie je to ozdoba:
   biele pole drží emoji čitateľné nad lesom aj snehom lepšie než drop-shadow,
   ktorý nesú holé značky, a červený lem povie „výstraha" skôr, než oko stihne
   prečítať, čo je vnútri.

   Kruh je súmerný ⇒ stred sedí na súradnici bez dopočtu posunu. Práve preto
   zanikla trieda mn-mark--pair aj rovnica 23+1+16 pod ňou. */
.mn-mark--threat{width:28px;height:28px;border-radius:999px;background:#FFFFFF;border:2.5px solid ${HAZARD_RED};box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,0.45),0 0 0 1px rgba(0,0,0,0.10);}
/* Emoji je menšie než pri holej značke — kruh mu zobral lem aj vnútorný okraj. */
.mn-mark--threat i{font-size:16px;}
/* TIP — ten istý kruh, zelený lem. Rozmery sa NEROZCHÁDZAJÚ zámerne: dve veľkosti
   kruhu by na mape čítali ako dve dôležitosti, a tip nie je menej dôležitý než
   výstraha, len je iný. */
.mn-mark--tip{width:28px;height:28px;border-radius:999px;background:#FFFFFF;border:2.5px solid ${GROUP_TINT.comment};box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,0.45),0 0 0 1px rgba(0,0,0,0.10);}
.mn-mark--tip i{font-size:16px;}
/* Zošednutý zápis NEMIZNE — Matej: „poznámka neumiera". Len prestáva byť to prvé,
   čo oko na mape chytí. */
.mn-mark--stale{opacity:.42;filter:grayscale(1);}
.mn-mark--stale:hover{opacity:.8;}

/* ── OTVORENÁ POZNÁMKA JE PAPYRUS (Matej 2026-08-21) ───────────────────────
   „treba zmeniť otvorenú poznámku, dajme ju na bledý papyrus".

   Do tejto chvíle to bol tmavý sklenený panel — a nad SVETLOU mapou to bola
   jediná tmavá plocha v celom výreze, teda cudzí prvok. Papyrus je naopak presne
   to, čím /pack hovorí „toto je obsah, čítaj to".

   Geometria ide z MATRICE (PACK_BOX.panel): panelGrad · 1.5px cardEdge · radius
   · panelShadow. Hodnoty sa sem NEOPISUJÚ ručne — sú vlievané
   z packTheme.ts nižšie interpoláciou.

   ⚠️ Leaflet si nesie vlastný biely chrome (-content-wrapper, -tip). Papyrus
   sa naň nedá len „položiť": tip je otočený štvorec, ktorý dedí background,
   takže bez explicitného prebitia by pod bublinou visel biely zub. */
.mn-popup .leaflet-popup-content-wrapper{background:${T.panelGrad};border:1.5px solid ${T.cardEdge};border-radius:${PACK_BOX.panel.borderRadius}px;box-shadow:${T.panelShadow};padding:0;}
.mn-popup .leaflet-popup-content{margin:0;padding:12px 14px;width:auto!important;min-width:190px;max-width:260px;}
/* Zub dedí len plnú farbu — gradient by v ňom vyzeral ako iný odtieň než telo.
   T.card je PLNÁ papyrusová farba (nie gradient), presne na toto. */
.mn-popup .leaflet-popup-tip{background:${T.card};border:1.5px solid ${T.cardEdge};box-shadow:none;}
.mn-popup a.leaflet-popup-close-button{display:none;}

.mn-bubble-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:6px;}
/* ── ZNAČKA V BUBLINE = ZMENŠENINA TEJ NA MAPE ────────────────────────────
   Ten istý biely krúžok, ten istý lem, len 26 px namiesto 28. Farbu lemu píše
   komponent inline z noteTint(), preto tu border-color nie je — bola by to druhá
   pravda vedľa tej z JS. */
.mn-bubble-mark{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;background:#FFFFFF;border:2px solid ${T.border};box-sizing:border-box;}
.mn-bubble-em{font-style:normal;font-family:${FONT_EMOJI};font-size:15px;line-height:1;-webkit-user-select:none;user-select:none;}
.mn-bubble-kind{font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.12em;text-transform:uppercase;}
.mn-bubble-tag{font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:${T.inkWarm};border:1px solid ${T.border};border-radius:999px;padding:2px 7px;}
.mn-bubble-stale{font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:${T.inkWarm};}
.mn-bubble-body{margin:0;font-family:${FONT_UI};font-size:12.5px;line-height:1.5;color:${T.inkStrong};white-space:pre-wrap;word-break:break-word;}

/* ── AUTOR: FOTKA + MENO ───────────────────────────────────────────────────
   align-items:center, nie baseline — s fotkou v riadku by baseline zarovnal
   text podľa spodnej hrany obrázka a meno by vyskočilo nad kruh. */
/* ⚠️ T.rule je GRADIENT (zlatá vyblednutá do strán), NIE border-shorthand —
   ako border-top by to bolo neplatné CSS a ticho by nenakreslilo nič.
   Preto pseudo-prvok s background. */
.mn-bubble-meta{position:relative;display:flex;align-items:center;gap:8px;margin-top:9px;padding-top:9px;}
.mn-bubble-meta::before{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:${T.rule};}
.mn-bubble-face{flex:0 0 auto;width:26px;height:26px;border-radius:50%;object-fit:cover;background:${T.tileBg};border:1px solid ${T.cardEdge};}
.mn-bubble-face--empty{display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:11px;color:${T.inkWarm};}
.mn-bubble-who{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;min-width:0;font-family:${FONT_UI};font-size:10.5px;color:${T.inkWarm};}
.mn-bubble-author{font-family:${FONT_TITLE};font-weight:700;font-size:11px;color:${T.inkStrong};}

.mn-bubble-votes{display:flex;gap:6px;margin-top:9px;}
.mn-vote{flex:1 1 0;display:inline-flex;align-items:center;justify-content:center;gap:5px;font-family:${FONT_UI};font-weight:600;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:${T.inkWarm};background:transparent;border:1px solid ${T.border};border-radius:999px;padding:5px 8px;cursor:pointer;transition:color .15s,border-color .15s,background .15s;}
.mn-vote:hover{color:${T.inkStrong};border-color:${T.cardEdge};}
.mn-vote.on{color:#7a5410;border-color:${T.cardEdge};background:rgba(201,154,63,0.20);}
.mn-vote--no.on{color:${HAZARD_RED};border-color:${HAZARD_RED};background:rgba(206,75,60,0.14);}
.mn-vote b{font-weight:600;}
.mn-bubble-del{margin-top:8px;width:100%;font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:${T.inkWarm};background:transparent;border:0;padding:4px;cursor:pointer;}
.mn-bubble-del:hover{color:${HAZARD_RED};}
`;
