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
import { EVENT_RIM, FONT_EMOJI, TRIP_TARGET_EMOJI } from '@/components/pack/mapnotes/markEmoji';
import { circleMarkHtml, CIRCLE_MARK_CSS } from '@/components/pack/mapnotes/circleMark';
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
  drawBar?: {
    active: boolean;
    onDone: () => void;
    /** Únik z kroku (späť). Zámok obrazovky bez východu je pasca, nie sústredenie. */
    onBack?: () => void;
    doneLabel?: string;
    /** Krok sa nedá opustiť (napr. trasa ešte neexistuje) — HOTOVO je vypnuté, nie mŕtve. */
    doneDisabled?: boolean;
    /**
     * Veta „čo mám teraz robiť". Keď je podaná, prebíja tú, ktorú si picker odvodí sám —
     * sprievodca tak má JEDEN systém pokynov (fialová pilulka nad mapou) pre všetky kroky,
     * nie druhý vedľa neho.
     */
    hint?: string | null;
    /**
     * Panel stojí VEDĽA mapy (PC). Lišta aj pilulka sa odsadia o jeho šírku — inak by na PC
     * ležali na formulári a to bola presne tá sťažnosť, kvôli ktorej lišta na PC vzniká.
     */
    besidePanel?: boolean;
    /**
     * Mapa práve patrí niekomu inému (krok 2 = zapichovanie značiek). Picker prestane brať
     * kliky aj dlhé stlačenia, ale vrstvy kreslí ďalej — trasa musí byť vidno, veď sa značky
     * pichajú NA ŇU.
     */
    paused?: boolean;
  };
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
/** Priblíženie, na akom sa mapa otvára (prehľad krajiny) = 0 % ukazovateľa priblíženia. */
const ZOOM_BAR_FROM = 7;

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
  // Prosba „skús trasu nakresliť" — RAZ za človeka, nie pri každom uložení (viď `pleaSeen`).
  const [showPlea, setShowPlea] = useState(() => !pleaSeen());
  const dismissPlea = useCallback(() => { markPleaSeen(); setShowPlea(false); }, []);
  const [notice, setNotice] = useState<string | null>(null);
  const [ascent, setAscent] = useState<number | null>(null);
  const [elevPending, setElevPending] = useState(false);

  const allowed = useMemo(() => allowedKindsFor(activity), [activity]);
  const line = useMemo(
    () => (value.kind === 'route' ? value.snapPath ?? value.path : []),
    [value],
  );
  const km = useMemo(() => (line.length > 1 ? totalDistanceM(line) / 1000 : 0), [line]);

  // ── JEDEN ZÁPIS TRASY ────────────────────────────────────────────────────────────────
  // Kotvy dnes nesú aj cieľ, spôsob návratu a príznak najmenšieho zápisu. Keby si každé
  // volanie `onChange` skladalo objekt od nuly (ako pred 23. 8.), prvé, ktoré na nové pole
  // zabudne, ho ticho zmaže — a človek by videl zmiznutý cieľ bez toho, aby naň siahol.
  const setRoute = useCallback(
    (patch: Partial<Extract<TripGeometry, { kind: 'route' }>>) => {
      const base: Extract<TripGeometry, { kind: 'route' }> =
        value.kind === 'route' ? value : { kind: 'route', path: [], snapped: false };
      onChange({ ...base, ...patch, kind: 'route' });
    },
    [value, onChange],
  );

  const routePath = value.kind === 'route' ? value.path : [];
  const isMinimal = value.kind === 'route' && !!value.minimal;
  const targetIdx = value.kind === 'route' ? value.targetIdx : undefined;
  const returnMode = value.kind === 'route' ? value.returnMode : undefined;
  // Cieľ sa dá označiť OD DRUHEJ KOTVY (Matej 23. 8. — 2 km nie sú podmienka, len chvíľa,
  // kedy sa appka ozve). Prechádzka po 900 m by inak cieľ označiť nevedela vôbec.
  const canMarkTarget = value.kind === 'route' && !isMinimal && routePath.length >= 2 && targetIdx === undefined;
  const targetUrged = canMarkTarget && km >= 2;

  // ── KROKY SA ODOMYKAJU POSTUPNE (Matej 2026-08-23: „vzdy sa otvoria len nasledujuce
  //    moznosti") ────────────────────────────────────────────────────────────────────────
  // Do 23. 8. stala cela lista od prvej sekundy: readout, Spat o bod, Vymazat, HOTOVO aj
  // ponuka najmensieho zapisu — teda sest ovladacov nad prazdnou mapou, z ktorych ani jeden
  // nemal na com pracovat. Teraz su TRI stavy a kazdy ukazuje len to, co ma v tej chvili zmysel:
  //   0  este niet kotvy   → ziadna lista, hore pole na hladanie, dole pilulka o dlhom stlaceni
  //   1  prva kotva lezi   → lista s DVOMA moznostami: kreslit trasu / oznacit ciel
  //   2  sposob je zvoleny → plne ovladanie (Spat o bod, Vymazat, HOTOVO, ciel, navrat)
  // Sposob sa da zvolit aj MLCKY: druhe tuknutie do mapy JE kreslenie (Matej: „ukazat by sa
  // malo ak zacne clovek klikat"), takze krok 1 nie je brana, len ponuka.
  const started = value.kind === 'route' ? routePath.length > 0 : !!value.center;
  const [modeChosen, setModeChosen] = useState(false);
  useEffect(() => { if (!started) setModeChosen(false); }, [started]);
  const stage: 0 | 1 | 2 = !started
    ? 0
    : (value.kind === 'route' && !isMinimal && !modeChosen && routePath.length < 2 ? 1 : 2);

  // ── hlásenie metrík hore ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // NAJMENŠÍ ZÁPIS NEHLÁSI KILOMETRE. Vzdušná čiara medzi štartom a cieľom nie je dĺžka
    // výletu; keby sa poslala hore, sadla by do `draft.km` a odtiaľ do rebríčka kilometrov.
    onMetrics?.({
      km: isMinimal ? 0 : km,
      ascentM: isMinimal ? null : ascent,
      points: value.kind === 'route' ? value.path.length : 0,
    });
  }, [km, ascent, value, onMetrics, isMinimal]);

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

    // ── NAJMENŠÍ MOŽNÝ ZÁPIS: ŠTART A CIEĽ, NIČ MEDZI TÝM ────────────────────────────────
    // Matej 23. 8.: medzi tie dva body sa NEPRICHYTÁVA (snap by vymyslel cestu, kadiaľ človek
    // nešiel) ani NEKRESLÍ plná čiara (klame rovnako, len inak). Preto tu nie je `snapSegment`
    // a `snapPath` ostáva neurčená — kreslí sa čiarkovaná spojnica priamo z kotiev.
    if (value.minimal) {
      const two: LatLngTuple[] = value.path.length >= 2 ? [value.path[0], p] : [...value.path, p];
      legsRef.current = [];
      setRoute({
        path: two,
        snapPath: undefined,
        snapped: false,
        // druhá kotva JE cieľ — nie je čo označovať, keď sú body len dva
        targetIdx: two.length === 2 ? 1 : undefined,
        returnMode: undefined,
        mirroredFrom: undefined,
      });
      return;
    }

    const anchors = [...value.path, p];

    // prvá kotva — nič sa nesnapuje
    if (anchors.length === 1) {
      setRoute({ path: anchors, snapPath: undefined, snapped: false });
      return;
    }

    // optimistický zápis: rovná čiara hneď, snapnutá geometria doplní odpoveď
    legsRef.current[anchors.length - 2] = [anchors[anchors.length - 2], p];
    setRoute({ path: anchors, snapPath: buildSnapPath(anchors) });

    setBusy(true);
    const res = await snapSegment(anchors[anchors.length - 2], p);
    setBusy(false);
    setNotice(noticeFor(res.reason));

    legsRef.current[anchors.length - 2] = res.geometry;
    const snapPath = buildSnapPath(anchors);
    setRoute({ path: anchors, snapPath, snapped: value.snapped || res.snapped });
    void recomputeAscent(snapPath);
  }, [value, onChange, setRoute, buildSnapPath, recomputeAscent, drawBar?.active, mapRef]);

  /**
   * OZNAČENIE CIEĽA 🎯 (Matej 2026-08-23: „po 2 km by sa pri kurzore mohla objaviť hláška:
   * dlho podrž pre označenie cieľa trasy").
   *
   * Cieľom je POSLEDNÁ POLOŽENÁ KOTVA, nie bod pod prstom. Kto drží prst, drží ho nad mapou
   * kdesi vedľa trasy — cieľ zapichnutý tam by ležal mimo cesty, po ktorej človek šiel.
   * Posledná kotva je zároveň to, čo práve nakreslil, teda vrchol/chata/miesto, kam smeroval.
   */
  const markTarget = useCallback(() => {
    if (value.kind !== 'route' || value.path.length < 2) return;
    setRoute({ targetIdx: value.path.length - 1 });
  }, [value, setRoute]);

  /**
   * TÁ ISTÁ TRASA NASPÄŤ (Matej: „klikom sa 2× aktuálna trasa").
   *
   * Zrkadlia sa KOTVY aj ÚSEKY — keby sa zrkadlili len kotvy, spiatočná polovica by šla po
   * rovných čiarach, hoci cesta tam je prichytená na chodník. Prevýšenie sa počíta z CELEJ
   * stopy odznova (nie 2× predošlý súčet) — dôvod je v `recomputeAscent` vyššie.
   */
  /**
   * ÚSEKY SA DAJÚ ODVODIŤ SPÄŤ ZO STOPY (2026-08-23).
   *
   * `legsRef` je REF — prežije re-render, ale nie obnovu rozpracovaného výletu zo zálohy
   * a nie remount komponentu. Trasa pritom prežije (je v `value.snapPath`), takže na mape
   * ďalej vidno prichytenú stopu, hoci appka o jej úsekoch už nevie. Čokoľvek, čo potom
   * skladá stopu z úsekov — zrkadlenie aj undo — vyrobí namiesto nej VZDUŠNÉ ČIARY medzi
   * kotvami. Presne to Matej videl: *„keď som dal tam a späť, tak ma odsniplo a nakreslilo
   * mi cestu vzdušnou čiarou, nie prilepenú na route."*
   *
   * Preto sa úseky pred takou operáciou doplnia: stopa sa rozseká na kotvách (hľadá sa
   * najbližší bod stopy ku každej kotve, poradie sa zachováva).
   */
  const ensureLegs = useCallback((anchors: LatLngTuple[], snapPath?: LatLngTuple[]): void => {
    const need = anchors.length - 1;
    if (need < 1) return;
    const have = legsRef.current.slice(0, need).filter((l) => l && l.length >= 2).length;
    if (have === need) return;
    const track = snapPath ?? [];
    if (track.length < 2) return;
    // index najbližšieho bodu stopy ku každej kotve; monotónne, aby sa úseky neprekrývali
    const cuts: number[] = [0];
    let from = 0;
    for (let a = 1; a < anchors.length; a++) {
      let best = from;
      let bestD = Infinity;
      for (let i = from; i < track.length; i++) {
        const d = hav(track[i], anchors[a]);
        if (d < bestD) { bestD = d; best = i; }
      }
      cuts.push(best);
      from = best;
    }
    const rebuilt: Array<LatLngTuple[]> = [];
    for (let i = 0; i < need; i++) {
      const seg = track.slice(cuts[i], cuts[i + 1] + 1);
      rebuilt.push(seg.length >= 2 ? seg : [anchors[i], anchors[i + 1]]);
    }
    legsRef.current = rebuilt;
  }, []);

  const mirrorBack = useCallback(() => {
    if (value.kind !== 'route' || value.path.length < 2) return;
    const anchors = value.path;
    const n = anchors.length;
    ensureLegs(anchors, value.snapPath);
    const legs = legsRef.current.slice(0, n - 1);
    const mirroredAnchors = [...anchors, ...anchors.slice(0, -1).reverse()];
    legsRef.current = [...legs, ...legs.slice().reverse().map((leg) => leg.slice().reverse())];
    const snapPath = buildSnapPath(mirroredAnchors);
    setRoute({
      path: mirroredAnchors,
      snapPath,
      returnMode: 'mirror',
      mirroredFrom: n,
      // cieľ ostáva tam, kde bol — je to stále ten istý vrchol, len sa z neho ide domov
      targetIdx: value.targetIdx,
    });
    void recomputeAscent(snapPath);
  }, [value, setRoute, buildSnapPath, recomputeAscent, ensureLegs]);

  /** OKRUH: posledná kotva sa vráti na štart. Klasické „vraciam sa inou cestou, ale domov". */
  const closeLoop = useCallback(() => {
    if (value.kind !== 'route' || value.path.length < 2) return;
    void placePoint(value.path[0][0], value.path[0][1]);
  }, [value, placePoint]);

  /**
   * Prepnutie na najmenší zápis a späť. Zahodí sa všetko, čo pre druhý režim nedáva zmysel.
   * ŠTART PREŽÍVA OBA SMERY: je to ten istý bod, z ktorého sa ide — kto sa rozhodne trasu
   * predsa len nakresliť, nemá dôvod hľadať svoje parkovisko druhýkrát.
   */
  const setMinimal = useCallback((on: boolean) => {
    legsRef.current = [];
    setAscent(null);
    setNotice(null);
    setModeChosen(true);
    const keepStart = value.kind === 'route' && value.path.length > 0 ? [value.path[0]] : [];
    setRoute({
      minimal: on || undefined,
      path: keepStart,
      snapPath: undefined,
      snapped: false,
      targetIdx: undefined,
      returnMode: undefined,
      mirroredFrom: undefined,
    });
  }, [value, setRoute]);

  // ── PRVÁ KOTVA CHCE DLHÉ STLAČENIE (Matej 2026-08-22) ─────────────────────────────────
  // „vysvetlenie — dlhým stlačením zaháj trasu na mape."
  // Platí LEN v mobilnom kreslení (`drawBar.active`) a LEN kým je geometria prázdna: mapa je
  // vtedy jediná obrazovka a človek po nej ešte hľadá, posúva a približuje — obyčajný ťuk by
  // mu pri každom takom pohybe hodil kotvu do lesa. Po prvej kotve už je zrejmé, že kreslí,
  // takže ďalšie body pribúdajú ťuknutím (rýchlejšie a je to pôvodné správanie).
  // Desktop sa NEMENÍ: tam je formulár vedľa mapy, klik je jednoznačný a držanie by len zdržalo.
  const paused = !!drawBar?.paused;
  const needsHold = !!drawBar?.active && !paused
    && (value.kind === 'route' ? value.path.length === 0 : !value.center);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (paused || needsHold) return;
    void placePoint(lat, lng);
  }, [paused, needsHold, placePoint]);

  // Dlhé stlačenie má DVE úlohy a nikdy nie obe naraz: kým trasa nemá ani kotvu, zakladá ju;
  // od druhej kotvy označuje CIEĽ. Preto jeden hook a rozhodnutie vnútri — dva hooky nad tou
  // istou mapou by si o ten istý dotyk konkurovali.
  // ⚠️ V KROKU 1 PRESÚVA ŠTART. Kým si človek nevybral spôsob, nemá v lište Undo (sú tam len
  // dve možnosti) — a keby sa prvá kotva netrafila, ostal by v slepej uličke s jediným
  // východiskom „späť z celého kroku". Podržanie ju teda jednoducho položí inam.
  const holdActive = !!drawBar?.active && !paused && (needsHold || stage === 1 || canMarkTarget);
  const placeRef = useRef(placePoint);
  useEffect(() => { placeRef.current = placePoint; }, [placePoint]);
  const holdRef = useRef<(lat: number, lng: number) => void>(() => {});
  useEffect(() => {
    holdRef.current = (lat, lng) => {
      if (needsHold) { void placeRef.current(lat, lng); return; }
      if (stage === 1) { setRoute({ path: [[lat, lng]], snapPath: undefined, snapped: false }); return; }
      markTarget();
    };
  }, [needsHold, stage, setRoute, markTarget]);
  useLongPressPoint(
    mapRef.current,
    holdActive,
    { onPoint: (lat, lng) => holdRef.current(lat, lng) },
    TRIP_HOLD_MIN_ZOOM,
  );

  // ── undo / clear ──────────────────────────────────────────────────────────────────────
  // Undo NESMIE volať sieť — legs sú v ref, stopa sa poskladá z nich (§2.2 kontraktu).
  const undo = useCallback(() => {
    if (value.kind !== 'route' || value.path.length === 0) return;
    setNotice(null);
    // undo skladá stopu z úsekov — bez nich by vrátenie bodu premenilo prichytenú trasu
    // na vzdušné čiary (viď `ensureLegs`).
    ensureLegs(value.path, value.snapPath);

    // ⚠️ PO ZDVOJENÍ SA VRACIA CELÉ ZDVOJENIE, nie jedna kotva — inak ostane pol trasy tam
    // a pol späť a človek to nemá ako opraviť ničím okrem VYMAZAŤ.
    if (value.mirroredFrom && value.path.length === value.mirroredFrom * 2 - 1) {
      const anchors = value.path.slice(0, value.mirroredFrom);
      legsRef.current = legsRef.current.slice(0, Math.max(0, anchors.length - 1));
      const snapPath = anchors.length > 1 ? buildSnapPath(anchors) : undefined;
      setRoute({ path: anchors, snapPath, mirroredFrom: undefined, returnMode: undefined });
      if (snapPath) void recomputeAscent(snapPath); else setAscent(null);
      return;
    }

    const anchors = value.path.slice(0, -1);
    legsRef.current = legsRef.current.slice(0, Math.max(0, anchors.length - 1));
    const snapPath = anchors.length > 1 ? buildSnapPath(anchors) : undefined;
    // Cieľ je INDEX do kotiev — keď kotva pod ním zmizne, musí zmiznúť aj on. Inak by 🎯
    // ukazoval na bod, ktorý na trase už nie je (alebo by index ukázal mimo poľa).
    const nextTarget = value.targetIdx !== undefined && value.targetIdx < anchors.length ? value.targetIdx : undefined;
    setRoute({
      path: anchors,
      snapPath,
      targetIdx: nextTarget,
      returnMode: nextTarget === undefined ? undefined : value.returnMode,
    });
    if (snapPath) void recomputeAscent(snapPath); else setAscent(null);
  }, [value, setRoute, buildSnapPath, recomputeAscent, ensureLegs]);

  const clear = useCallback(() => {
    legsRef.current = [];
    setAscent(null);
    setNotice(null);
    // Cieľ, spôsob návratu ani zrkadlenie neprežijú vymazanie trasy — sú to vlastnosti tej
    // trasy, nie nastavenie formulára. Príznak najmenšieho zápisu ÁNO: človek si režim
    // vybral a mazanie bodov nie je jeho odvolanie.
    if (value.kind === 'route') {
      onChange({ kind: 'route', path: [], snapPath: undefined, snapped: false, minimal: value.minimal });
    } else if (value.kind === 'point') onChange({ kind: 'point', center: undefined as unknown as LatLngTuple });
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

    if (value.kind === 'route' && value.minimal && line.length > 1) {
      // ČIARKOVANÁ SPOJNICA, NIE MEČ. Plná čiara by tvrdila, že takto človek šiel — a on
      // povedal len to, kde začal a kde skončil. Čiarka je vizuálne priznanie, že medzi
      // tými dvoma bodmi appka nič nevie.
      add(L.polyline(line, {
        color: TRAIL_LINE.light, weight: 3, opacity: 0.85,
        dashArray: '2 9', lineCap: 'round', interactive: false,
      }));
    } else if (value.kind === 'route' && line.length > 1) {
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
      // ŠTART SA POMENUJE (Matej 2026-08-23: „nedal by som len bodku ale aj nápis v pils
      // štart"). Holá gulička nepovie, ktorý koniec je ktorý — a keď sa človek vracia tou
      // istou trasou alebo uzavrie okruh, je to naraz aj cieľ, takže to pilulka povie tiež.
      if (value.path.length > 0) {
        const first = value.path[0];
        const last = value.path[value.path.length - 1];
        const backToStart = value.returnMode === 'mirror'
          || (value.path.length > 2 && Math.abs(first[0] - last[0]) < 1e-6 && Math.abs(first[1] - last[1]) < 1e-6);
        add(L.marker(first, {
          icon: L.divIcon({
            className: '',
            html: `<span class="trp-anchor-tag">${t(backToStart ? 'pack.addTrip.geo.labelStartEnd' : 'pack.addTrip.geo.labelStart')}</span>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
          interactive: false,
          keyboard: false,
        }));
      }
    }
    // CIEĽ VÝLETU 🎯 — emoji v bielom krúžku s modrým lemom, presne ako udalosti (CLAUDE.md,
    // Matej 22. 8.). Nie vlastný tvar: „tu je cieľ" a „tu sa niekto s niekým stretne" sú
    // z toho istého rodu a dva rôzne tvary pre jednu myšlienku sme už raz zrušili.
    // Geometriu kruhu nesie `circleMark.ts` — štvrtá kópia tých istých rozmerov by sa
    // rozišla pri prvej zmene.
    if (value.kind === 'route' && value.targetIdx !== undefined && value.path[value.targetIdx]) {
      add(L.marker(value.path[value.targetIdx], {
        icon: L.divIcon({ className: 'mk-wrap', html: circleMarkHtml(TRIP_TARGET_EMOJI, EVENT_RIM) }),
        interactive: false,
        keyboard: false,
        zIndexOffset: 500,
      }));
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
  }, [value, line, allTrails, onPickExisting, mapRef, zoomTick, t]);

  // ── panel ─────────────────────────────────────────────────────────────────────────────
  const pointCount = value.kind === 'route' ? value.path.length : 0;
  const hint =
    value.kind === 'route' ? t('pack.addTrip.geo.hintRoute')
      : value.kind === 'point' ? t('pack.addTrip.geo.hintSpot')
      : t('pack.addTrip.geo.hintArea');

  // Červená bublina `.trp-drawhint` v PackMap.tsx, ktorú táto lišta prebíjala triedou
  // `trp-drawbar-on`, zanikla 23. 8. spolu s prepínaním „choď na mapu / hotovo" — pokyn aj
  // návrat nesie odteraz lišta sama, takže netreba schovávať nič.
  const barOn = !!drawBar?.active;

  // AKO ZAČAŤ — text sa mení podľa toho, čo už na mape je. Po druhej kotve mlčí: vtedy je
  // z tvaru na mape zrejmé, čo sa deje, a lišta dole už hlási km a body.
  // ⚠️ NAD CELÝM SLOVENSKOM GESTO NEZABERIE — a mlčať o tom je horšie než prah nemať.
  // Mapa sa otvára na prehľade celej krajiny (z~7), kde je prvá kotva na kilometre nepresná,
  // takže dlhé stlačenie pod `TRIP_HOLD_MIN_ZOOM` nič nepoloží. Bez tejto vetvy človek drží
  // prst, nedeje sa nič a vyzerá to ako pokazená appka. Prekresľuje to `zoomTick` (efekt
  // s vrstvami počúva `zoomend`), takže sa veta prepne sama, len čo si mapu priblíži.
  const zoomNow = mapRef.current?.getZoom() ?? 0;
  const holdTooFar = barOn && zoomNow < TRIP_HOLD_MIN_ZOOM;
  // 0 % pri pohľade na celú krajinu (z7, s akým sa mapa otvára) → 100 % na prahu gesta.
  const zoomPct = Math.max(0, Math.min(100, ((zoomNow - ZOOM_BAR_FROM) / (TRIP_HOLD_MIN_ZOOM - ZOOM_BAR_FROM)) * 100));
  // HOTOVO je zlaté až vtedy, keď je trasa naozaj uzavretá: pri najmenšom zápise stačia dva
  // body (druhý JE cieľ), pri kreslenej trase musí byť označený cieľ — inak človek uloží
  // výlet, ktorý sa nikdy nevrátil, a nevšimne si to.
  const doneReady = value.kind !== 'route'
    ? !!value.center
    : (isMinimal ? routePath.length >= 2 : targetIdx !== undefined);
  const showReadout = value.kind === 'route' && routePath.length >= 2;
  // Volajúci (sprievodca) má prednosť: v kroku 2 sa na mape pichajú značky, nie kreslí trasa,
  // takže veta o dlhom stlačení by radila niečo, čo v tej chvíli nie je úloha.
  // ⚠️ PO ~2 KM SA APPKA OZVE O CIELI (Matej 23. 8.: „po 2 km by sa pri kurzore mohla objaviť
  // hláška: dlho podrž pre označenie cieľa trasy"). Dva kilometre NIE SÚ podmienka — tlačidlo
  // v lište stojí od druhej kotvy; toto je len chvíľa, kedy sa gesto oplatí pripomenúť, lebo
  // dovtedy človek kreslí a nemá dôvod hľadať, ako sa cieľ označuje.
  // Jedna veta na jedno miesto, obsah podľa KROKU (viď `stage` vyššie) — nikdy nie dve
  // naraz a nikdy nie veta o niečom, čo sa v tej chvíli nedá spraviť.
  const ownHint = stage === 0
    ? (holdTooFar
        ? t('pack.addTrip.geo.zoomInFirst')
        : t(value.kind === 'route' ? 'pack.addTrip.geo.startHold' : 'pack.addTrip.geo.startHoldSpot'))
    : stage === 1
      ? t('pack.addTrip.geo.modeAsk')
      : value.kind === 'route'
        ? (isMinimal
            ? (routePath.length < 2 ? t('pack.addTrip.geo.minimalTapTarget') : null)
            : routePath.length < 2 ? t('pack.addTrip.geo.continueTap')
              // ⚠️ MOMENT NÁVRATU TREBA VYSVETLIŤ (Matej 2026-08-23). Do teraz sa appka ozvala
              // až po 2 km a len vetou „dlho podrž pre označenie cieľa" — kto kreslil kratšiu
              // trasu, sa o cieli nedozvedel vôbec a klikol HOTOVO. Teraz to povie od druhej
              // kotvy a povie aj PREČO: po cieli príde otázka, ako sa vracal.
              : canMarkTarget ? t('pack.addTrip.geo.targetGuide')
              : (targetIdx !== undefined && !returnMode) ? t('pack.addTrip.geo.returnGuide')
              : null)
        : null;
  const drawHint = drawBar?.hint !== undefined ? drawBar.hint : ownHint;

  // ── ČÍTANIE: JEDEN ZDROJ PRE PANEL AJ LIŠTU ───────────────────────────────────────────
  // Kým bol readout napísaný priamo v JSX panela, lišta by si ho musela opísať — a po prvej
  // zmene formátu (napr. `1 bod` vs `5 bodov`) by dve miesta hovorili dve rôzne veci.
  // ⚠️ NÁVOD HOVORÍ LEN JEDNO MIESTO. Pokyn nesie fialová pilulka hore (nad mapou, kde sa
  // gesto robí) — keby ho lišta opakovala, na obrazovke stoja dve vety o tom istom, a kým
  // prvá kotva chce DRŽANIE, tá druhá by tvrdila „klikaj po mape".
  //
  // ⚠️ NAJMENŠÍ ZÁPIS NEHLÁSI KILOMETRE. Namiesto čísla stojí „trasa neznáma" — vzdušná čiara
  // medzi štartom a cieľom nie je dĺžka výletu a tvrdiť ju by pokazilo aj rebríček kilometrov.
  const readout = value.kind === 'route' ? (
    isMinimal
      ? (pointCount >= 2
          ? <span style={{ color: T.onDarkDim }}>{t('pack.addTrip.geo.unknownDistance')}</span>
          : <span style={{ color: T.onDarkDim }}>{barOn ? '' : hint}</span>)
      : pointCount < 2
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

  // Undo/Vymazať majú zmysel len keď je čo vracať — inak sú to dve tlačidlá, ktoré nič nerobia.
  const hasSomething = value.kind === 'route' ? pointCount > 0 : !!value.center;

  // NÁVRAT JE TEXT V PÄTE PANELA (Matej 2026-08-23: „šípku späť daj pod text areu do stredu,
  // nie hore… resp. aby sme šetrili priestor daj tam podčiarknuté späť na výber aktivity").
  // V rohu hore bral mape výšku a palec naň nedosiahol; POD panelom by ležal na mape a stratil
  // by sa v nej, tak stojí vnútri — v kroku 0 pod poľom, pri kreslení pod tlačidlami.
  // Na PC sa nevykresľuje: tam má svoju šípku hlavička formulára a dva návraty na jednej
  // obrazovke sú otázka „ktorý z nich ma vráti kam".
  const backLink = drawBar?.onBack && !drawBar.besidePanel ? (
    <button type="button" className="trp-dback" onClick={drawBar.onBack}>
      ← {t('pack.addTrip.geo.backToActivity')}
    </button>
  ) : null;

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

      {/* ČÍSLA A NÁSTROJE SÚ V LIŠTE, KEĎ LIŠTA STOJÍ.
          Kým bežala len na mobile, panel si readout aj Undo držal aj tak — na PC ich totiž
          nikto iný neukazoval. Odkedy je lišta aj na PC (Matej 23. 8.: „nie je vôbec vidno
          UNDO, DELETE, to je až dole = nelogické"), by tu stáli druhýkrát a dve miesta
          s tým istým číslom sa rozídu pri prvej zmene formátu. */}
      {!barOn && (
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
      )}

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

      {/* zlyhanie snapu sa NIKDY nezamlčí (§5.2c) — keď stojí lišta, hlási ho ona */}
      {!barOn && notice && (
        <div style={{ fontFamily: FONT_UI, fontSize: 12, fontWeight: 500, color: GOLD }}>
          {notice}
        </div>
      )}
      {!barOn && busy && (
        <div style={{ fontFamily: FONT_UI, fontSize: 12, color: T.onDarkDim }}>{t('pack.addTrip.geo.snappingBusy')}</div>
      )}
      {value.kind === 'route' && onPickExisting && pointCount === 0 && (
        <div style={{ fontFamily: FONT_TITLE, fontSize: 11, letterSpacing: '.1em', color: T.onDarkDim, textTransform: 'uppercase' }}>
          {t('pack.addTrip.geo.ghostHint')}
        </div>
      )}

      {/* ── LIŠTA KRESLENIA ────────────────────────────────────────────────────────────
          Portál na <body>: panel, v ktorom picker žije, býva na mobile schovaný cez
          `display:none` (mapa je vtedy celá obrazovka), takže čokoľvek vnútri neho by
          zmizlo s ním. Na PC je lišta odsadená o šírku panela (`--beside`), aby ho
          neprekrývala — to je celý rozdiel medzi platformami. */}
      {barOn && drawBar && createPortal(
        <>
        <style>{DRAW_BAR_CSS}</style>
        <style>{CIRCLE_MARK_CSS}</style>
        {/* ── HORNÝ PÁS: HĽADANIE MIESTA + ČO MÁM ROBIŤ ──────────────────────────────────
            Matej 2026-08-22: „otvorí sa mapa s vysvetlením ako začať… textarea s lokalitou."
            Veta je JEDNA a stojí VŽDY na tom istom mieste (Matej 23. 8., krokový sprievodca) —
            čo v ktorom kroku hovorí, rozhoduje volajúci cez `drawBar.hint`; keď nepodá nič,
            picker si ju odvodí sám z toho, čo na mape je.
            pointerEvents:none na páse a auto na jeho obsahu: gradient nesmie žrať ťuky do mapy
            pod ním (inak by hore vznikol pruh, kde sa nedá kresliť). */}
        {/* HORE STOJÍ ČÍSLO, DOLE OVLÁDANIE (Matej 2026-08-23: „pri kreslení vidím hore km
            dĺžku a prevýšenie, potom bod späť, vymazať a označ cieľ"). Návrat sa presťahoval
            NADOL pod panel — hore bol mimo dosahu palca a bral mape výšku. */}
        {stage === 2 && showReadout && (
          <div className={`trp-dtop${drawBar.besidePanel ? ' trp-dtop--beside' : ''}`}>
            <div className="trp-dread">{readout}</div>
          </div>
        )}

        {/* ⚠️ PILULKA MUSÍ BYŤ VIDNO NA SVETLEJ MAPE (Matej 23. 8.: „tá fialová pilulka je
            takmer neviditeľná — treba ju zvýrazniť, dať tam ikonku (i) alebo nejakú radu
            z brandu"). Priesvitná fialová na papierovej turistickej mape zmizne — preto
            PLNÝ tmavý podklad (ten istý, aký nesie lišta dole), fialový rám s dosvitom
            zo svetelného meča a ceruzka z hand-drawn setu. `HandIcons` je práve ten kanál,
            ktorý dedí farbu textu (CLAUDE.md) — ikonka teda drží krok s pilulkou sama. */}

        {/* ── DOK ────────────────────────────────────────────────────────────────────────
            Jeden stĺpec pri spodnej hrane: POKYN (pilulka, leží NAD panelom priamo v mape —
            Matej 23. 8.: „pils daj nad panel do mapy"), pod ním PANEL a úplne dole NÁVRAT.
            Dok sám nemá výplň ani nechytá ťuky; má ich len to, čo v ňom stojí, takže mapa
            medzi pilulkou a panelom ostáva ovládateľná. */}
        <div className={`trp-dock${drawBar.besidePanel ? ' trp-dock--beside' : ''}`}>
        {drawHint && (
          <div className="trp-dhint">
            <HandPencil size={17} style={{ color: TRAIL_LINE.light, flexShrink: 0 }} />
            <span>{drawHint}</span>
          </div>
        )}

        {stage === 0 && (
          <div className="trp-dstart">
            {/* KOĽKO EŠTE PRIBLÍŽIŤ (Matej 23. 8.: „nejaký štýl progres baru koľko treba ešte
                priblížiť"). Samotná veta „priblíž si mapu" nepovie, či je človek o krok alebo
                o štyri od toho, aby gesto zabralo — a bez tej odpovede to vyzerá, že sa nedeje
                nič. Prúžok zmizne, len čo je priblíženie dosť veľké. */}
            {holdTooFar && (
              <div className="trp-zoombar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(zoomPct)}>
                <i style={{ width: `${zoomPct}%` }} />
              </div>
            )}
            {/* NA DOSAH PALCA. Hore bolo pole „takmer neviditeľné" a na telefóne aj mimo dosahu;
                po prvej kotve zmizne úplne — svoju úlohu (dostať človeka do jeho oblasti) má
                vtedy za sebou a nad rozkreslenou trasou by lákalo mapu odletieť inam. */}
            <PlaceSearch mapRef={mapRef} />
            {backLink}
          </div>
        )}

        {stage > 0 && (
        <div className="trp-dbar">
          {/* ── KROK 1: DVE MOŽNOSTI, NIČ INÉ ────────────────────────────────────────────
              Kotva leží, o zvyšku ešte nepadlo rozhodnutie. Undo tu chýba zámerne — prvú
              kotvu presunie dlhé stlačenie (viď `holdRef`), takže niet do čoho zabŕdnuť. */}
          {stage === 1 && (
            <div className="trp-dbar-row">
              <button type="button" className="trp-dbar-btn" onClick={() => setModeChosen(true)}>
                {t('pack.addTrip.geo.modeDraw')}
              </button>
              <button type="button" className="trp-dbar-btn" onClick={() => setMinimal(true)}>
                {t('pack.addTrip.geo.modeMinimal')}
              </button>
            </div>
          )}

          {stage === 2 && (
          <>
          {busy && (
            <div style={{ fontFamily: FONT_UI, fontSize: 11.5, color: T.onDarkDim, textAlign: 'center' }}>
              {t('pack.addTrip.geo.snappingBusy')}
            </div>
          )}

          {/* zlyhanie snapu sa NIKDY nezamlčí (§5.2c) — aj keď je panel schovaný */}
          {notice && (
            <div style={{ fontFamily: FONT_UI, fontSize: 12, fontWeight: 500, color: GOLD }}>{notice}</div>
          )}

          {/* ── CIEĽ VÝLETU 🎯 ────────────────────────────────────────────────────────────
              Dá sa označiť OD DRUHEJ KOTVY. Dva kilometre nie sú podmienka (prechádzka po
              900 m by inak cieľ nemala ako označiť) — po nich sa ponuka len zvýrazní. */}
          {canMarkTarget && !paused && (
            <button type="button" className={`trp-dbar-target${targetUrged ? ' is-urged' : ''}`} onClick={markTarget}>
              <span className="trp-dbar-emoji">{TRIP_TARGET_EMOJI}</span>
              {t('pack.addTrip.geo.markTarget')}
            </button>
          )}

          {/* ── AKO SI SA VRACAL ─────────────────────────────────────────────────────────
              Tri Matejove možnosti. „Tá istá trasa naspäť" kotvy zrkadlí hneď; okruh len
              odomkne tlačidlo, ktoré trasu uzavrie pri štarte, keď bude človek chcieť. */}
          {targetIdx !== undefined && !returnMode && !isMinimal && !paused && (
            <div className="trp-dbar-ret">
              <p>{t('pack.addTrip.geo.returnAsk')}</p>
              <div className="trp-dbar-row">
                <button type="button" className="trp-dbar-btn" onClick={() => setRoute({ returnMode: 'continue' })}>
                  {t('pack.addTrip.geo.returnContinue')}
                </button>
                <button type="button" className="trp-dbar-btn" onClick={() => setRoute({ returnMode: 'loop' })}>
                  {t('pack.addTrip.geo.returnLoop')}
                </button>
                <button type="button" className="trp-dbar-btn" onClick={mirrorBack} disabled={busy}>
                  {t('pack.addTrip.geo.returnMirror')}
                </button>
              </div>
            </div>
          )}
          {returnMode === 'loop' && !paused && (
            <button type="button" className="trp-dbar-btn trp-dbar-wide" onClick={closeLoop} disabled={busy}>
              {t('pack.addTrip.geo.closeLoop')}
            </button>
          )}

          {/* Rad tlačidiel drží CELÚ šírku, rovnaké diely (feedback_rad_prvkov_plna_sirka_kontajnera).
              HOTOVO je jediná zlatá — zlatá je farba výzvy, nie farba tlačidla. */}
          <div className="trp-dbar-row">
            {!paused && (
              <>
                <button
                  type="button"
                  className="trp-dbar-btn"
                  onClick={undo}
                  disabled={busy || !hasSomething}
                  style={{ opacity: hasSomething ? 1 : 0.4 }}
                >
                  {t('pack.addTrip.geo.undoPoint')}
                </button>
                <button
                  type="button"
                  className="trp-dbar-btn"
                  onClick={clear}
                  disabled={busy || !hasSomething}
                  style={{ opacity: hasSomething ? 1 : 0.4 }}
                >
                  {t('pack.addTrip.geo.clear')}
                </button>
              </>
            )}
            {/* ⚠️ ZLATÁ AŽ KEĎ JE TRASA NAOZAJ HOTOVÁ (Matej 2026-08-23: „pri klikaní nesmie
                svietiť TRASA HOTOVÁ keď nie je vybratý cieľ — mýli sa to, človek klikne
                a neuvedomí si, že nedal trasu späť"). Zlatá je farba VÝZVY, takže kým chýba
                cieľ, tlačidlo výzvou nie je: má vzhľad ostatných a ustúpi 🎯. Zakázané NIE je —
                kto vie, čo robí, uloží aj tak; len ho to už neťahá za rukáv. */}
            <button
              type="button"
              className={doneReady ? 'trp-dbar-done' : 'trp-dbar-btn'}
              onClick={drawBar.onDone}
              disabled={!!drawBar.doneDisabled}
              style={drawBar.doneDisabled ? { opacity: 0.42, boxShadow: 'none', cursor: 'default' } : undefined}
            >
              {drawBar.doneLabel ?? t('pack.addTrip.geo.done')}
            </button>
          </div>

          {/* ── NAJMENŠÍ MOŽNÝ ZÁPIS ─────────────────────────────────────────────────────
              Matej 23. 8.: „štart–cieľ bude minimum, aby sme nikoho neodradili, ale bude
              vyzvaný, že skús nakresliť, aby si pomohol ostatným." Preto je ponuka VIDNO
              (nie schovaná), nič neblokuje a prosba príde RAZ — opakovaná pri každom
              uložení je nátlak a ten je proti tónu projektu. */}
          {/* ⚠️ PONUKA MIZNE, LEN ČO JE OZNAČENÝ CIEĽ (Matej 2026-08-23: „tá info o kreslení
              trasy dolu, že to neviem, je zbytočná — zmažme ju v momente ak človek označí
              cieľ cesty"). Kto už trasu ku cieľu nakreslil, nepotrebuje ponuku, že ju kresliť
              nemusí — v tej chvíli je to len šum a lákadlo zahodiť hotovú prácu. */}
          {value.kind === 'route' && !paused && targetIdx === undefined && (
            <button type="button" className="trp-dbar-link" onClick={() => setMinimal(!isMinimal)}>
              {t(isMinimal ? 'pack.addTrip.geo.minimalOff' : 'pack.addTrip.geo.minimalOn')}
            </button>
          )}
          {isMinimal && showPlea && !paused && (
            <div className="trp-dbar-plea">
              <span>{t('pack.addTrip.geo.minimalPlea')}</span>
              <button type="button" onClick={dismissPlea}>{t('pack.addTrip.geo.minimalPleaOk')}</button>
            </div>
          )}
          </>
          )}
          {backLink}
        </div>
        )}

        </div>
        </>,
        document.body,
      )}
    </div>
  );
}

/**
 * PROSBA O NAKRESLENIE TRASY — RAZ ZA ČLOVEKA, NIE ZA VÝLET.
 * Opakovaná výzva pri každom uložení je nátlak, nie pomoc, preto sa pamätá v `localStorage`.
 * Zlyhanie úložiska (privátny režim) berieme ako „ešte nevidel" — radšej ju ukázať zbytočne
 * než ju stratiť tým, že sa nedá zapísať.
 */
const PLEA_KEY = 'trp-draw-plea-seen';
function pleaSeen(): boolean {
  try { return localStorage.getItem(PLEA_KEY) === '1'; } catch { return false; }
}
function markPleaSeen(): void {
  try { localStorage.setItem(PLEA_KEY, '1'); } catch { /* non-fatal */ }
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

/**
 * CSS LIŠTY A HORNÉHO PÁSU.
 *
 * Prečo trieda a nie inline štýl ako doteraz: odsadenie na PC je MEDIA QUERY (panel má
 * 360 px medzi 1024–1400 px a 440 px nad tým, viď .trp-sidebar v PackMap.tsx) a inline
 * štýl media query nevie. Tie dve čísla tu MUSIA sedieť s tými v PackMap — keď sa panel
 * zúži a lišta nie, prekryje presne to, čo malo byť vidno.
 *
 * ⚠️ Toto je JS template literal — spätný apostrof v komentári ho ukončí a stránka spadne
 * na bielu. TypeScript to nechytí, `npm run build` (check:css) áno.
 */
const DRAW_BAR_CSS = `
.trp-dtop{position:fixed;left:0;right:0;top:0;z-index:1200;padding:calc(10px + env(safe-area-inset-top,0px)) 16px 14px;display:flex;justify-content:center;pointer-events:none;background:linear-gradient(180deg,rgba(10,7,4,0.92) 40%,rgba(10,7,4,0));}
/* ČÍTANIE HORE — km · prevýšenie · body. Nie je to ovládač, tak nechytá ťuky do mapy. */
.trp-dread{pointer-events:none;padding:8px 16px;border-radius:999px;background:rgba(18,13,7,0.94);border:1px solid ${T.onDarkBorder};font-family:${FONT_UI};font-size:14px;font-weight:500;color:${T.onDark};white-space:nowrap;}
.trp-dhint{justify-self:center;align-self:center;pointer-events:none;display:flex;align-items:center;gap:9px;padding:10px 16px 10px 13px;border-radius:999px;background:rgba(18,13,7,0.94);backdrop-filter:blur(10px);border:1.5px solid ${TRAIL_LINE.light};box-shadow:0 0 0 4px rgba(122,47,191,0.20),0 6px 20px rgba(0,0,0,0.55);font-family:${FONT_UI};font-size:13.5px;font-weight:600;color:#F3E9FF;text-align:left;max-width:min(92vw,460px);}
/* KROK 0 — pilulka stojí sama tam, kde neskôr narastie lišta, aby to vyzeralo, že jej
   okolie len dorástlo, nie že sa presunula. */
/* DOK — stĺpec pri spodnej hrane: pokyn (v mape), panel, návrat. Sám je priehľadný a ťuky
   prepúšťa; výplň aj ovládanie nesú jeho deti. */
.trp-dock{position:fixed;left:0;right:0;bottom:0;z-index:1200;display:flex;flex-direction:column;align-items:stretch;gap:12px;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px));pointer-events:none;}
.trp-dock > *{pointer-events:auto;}
/* KROK 0 — panel s hľadaním miesta. VZDUŠNEJŠÍ (Matej 23. 8.: „panel urob vyšší vzdušnejší,
   text area je moc nízko") — pole potrebuje vzduch nad aj pod sebou, inak sedí na hrane
   displeja a na telefóne ho prekrýva systémová lišta. */
.trp-dstart{box-sizing:border-box;display:flex;flex-direction:column;gap:14px;padding:20px 16px 22px;background:rgba(18,13,7,0.94);backdrop-filter:blur(12px);border-top:1px solid ${T.onDarkBorder};box-shadow:0 -14px 40px rgba(0,0,0,0.45);}
/* NÁVRAT — podčiarknutý text v strede pod panelom. Šípka v rohu brala mape výšku a palec
   na ňu nedosiahol; text zaberie riadok a povie aj KAM sa vracia. */
.trp-dback{align-self:center;background:none;border:0;padding:4px 10px;color:${T.onDarkDim};font-family:${FONT_UI};font-size:12.5px;font-weight:500;text-decoration:underline;text-underline-offset:3px;cursor:pointer;}
.trp-dback:hover{color:${GOLD};}
.trp-zoombar{height:5px;border-radius:999px;background:rgba(245,240,228,0.10);overflow:hidden;}
.trp-zoombar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#7A2FBF,${TRAIL_LINE.light});transition:width .25s ease;}
/* Menovka štartu — visí nad kotvou, ťuky prepúšťa do mapy (inak by z nej bola diera,
   do ktorej sa nedá klikať práve tam, kde človek kreslí). */
.trp-anchor-tag{position:absolute;left:0;top:0;transform:translate(-50%,-26px);pointer-events:none;white-space:nowrap;padding:3px 9px;border-radius:999px;background:rgba(18,13,7,0.94);border:1px solid ${TRAIL_LINE.light};box-shadow:0 2px 10px rgba(0,0,0,0.5);font-family:${FONT_UI};font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#F3E9FF;}
/* Pilulka leží NAD panelom priamo v mape, takže si drží vlastné bočné odsadenie. */
.trp-dhint{margin:0 16px;}

.trp-dbar{box-sizing:border-box;min-height:${DRAW_BAR_H}px;display:flex;flex-direction:column;gap:12px;padding:18px 16px 20px;background:rgba(18,13,7,0.94);backdrop-filter:blur(12px);border-top:1px solid ${T.onDarkBorder};box-shadow:0 -14px 40px rgba(0,0,0,0.45);}
.trp-dbar-read{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:20px;}
.trp-dbar-row{display:flex;gap:8px;}
.trp-dbar-btn{flex:1 1 0;padding:12px 10px;border-radius:8px;background:${T.glass};border:1px solid ${T.onDarkBorder};color:${T.onDark};font-family:${FONT_UI};font-size:12px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;}
.trp-dbar-btn:hover:not(:disabled){border-color:${GOLD};color:${GOLD};}
.trp-dbar-btn:disabled{cursor:default;}
.trp-dbar-wide{flex:1 1 100%;}
/* HOTOVO — brand CTA podľa .btn-gold locku: gradient 135°, radius 8, papyrusový rám. */
.trp-dbar-done{flex:1 1 0;padding:12px 10px;border-radius:8px;background:linear-gradient(135deg,#F5C73D,#E69E1A);border:1px solid rgba(250,244,236,0.3);color:#1c160c;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;box-shadow:0 0 40px rgba(230,158,26,0.4),inset 0 1px 0 rgba(255,255,255,0.3);cursor:pointer;}
/* CIEĽ — fialový, teda z rodiny trasy, nie zlatý: zlatá je v tomto rade vyhradená HOTOVU. */
/* CIEĽ — PILULKA, nie tlačidlo v rade (Matej 23. 8.: „to tlačítko mark the destination by
   malo byť v pils ako pri začiatku"). Tvar aj rám sú zhodné s pokynovou pilulkou vyššie:
   obe hovoria o tom istom geste nad mapou, len jedna z nich sa dá aj stlačiť. */
.trp-dbar-target{align-self:center;display:flex;align-items:center;justify-content:center;gap:8px;width:max-content;max-width:min(92vw,460px);padding:10px 18px 10px 15px;border-radius:999px;background:rgba(122,47,191,0.22);border:1.5px solid ${TRAIL_LINE.light};color:#F3E9FF;font-family:${FONT_UI};font-size:12.5px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;}
.trp-dbar-target:hover{background:rgba(122,47,191,0.34);}
.trp-dbar-target.is-urged{box-shadow:0 0 0 4px rgba(122,47,191,0.24),0 6px 20px rgba(0,0,0,0.45);background:rgba(122,47,191,0.34);}
.trp-dbar-emoji{font-family:${FONT_EMOJI};font-size:15px;line-height:1;}
.trp-dbar-ret p{margin:0 0 7px;font-family:${FONT_UI};font-size:12px;font-weight:500;color:${T.onDarkDim};}
.trp-dbar-link{align-self:center;background:none;border:0;padding:2px 4px;color:${GOLD};font-family:${FONT_UI};font-size:11.5px;font-weight:600;cursor:pointer;text-decoration:underline;}
.trp-dbar-plea{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;background:rgba(201,154,63,0.10);border:1px solid rgba(201,154,63,0.45);font-family:${FONT_UI};font-size:12px;line-height:1.4;color:${T.onDark};}
.trp-dbar-plea button{flex:0 0 auto;background:none;border:0;color:${GOLD};font-family:${FONT_UI};font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;}

/* PC: lišta aj pás sa odsadia o šírku panela. Čísla sú tie isté ako .trp-sidebar v PackMap. */
@media (min-width:1024px) and (max-width:1400px){
  .trp-dock--beside,.trp-dtop--beside{left:400px;}
}
@media (min-width:1401px){
  .trp-dock--beside,.trp-dtop--beside{left:480px;}
}
@media (min-width:1024px){
  .trp-dock--beside{bottom:20px;right:20px;padding-bottom:0;}
  .trp-dock--beside .trp-dbar,.trp-dock--beside .trp-dstart{border-radius:16px;border:1px solid ${T.onDarkBorder};}
  /* 74 px vpravo = miesto pre ovládanie mapy (zoom, poloha, vrstvy). To isté číslo drží
     .trp-topbar v PackMap.tsx — bez neho leží pole na hľadanie pod tlačidlami zoomu. */
  .trp-dtop--beside{right:74px;}
}
`;

export default GeometryPicker;
