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
import type React from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import { dockFitPadding } from '@/components/pack/mapDockShape';
import { notePanelH } from '@/components/pack/mapnotes/AddMapNote';
import type { LatLngTuple, Map as LeafletMap } from 'leaflet';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import {
  ACTIVITY_GEOMETRY,
  type GeometryKind,
  type TripGeometry,
} from './addTripModel';
import { SPACING, calibratedAscent, calibratedDescent, hav, interp, totalDistanceM } from './addTripGeo';
import { estimateTripMinutes, formatTripTime } from '@/lib/tripTime';
import { TRAIL_LINE, TRAIL_SABER_LAYERS, trailSaberScale, ensureTrailLineCss } from '@/components/pack/tripShared';
import { useLongPressPoint } from '@/components/pack/mapnotes/useLongPressPoint';
import { PlaceSearch } from './PlaceSearch';
import { AinubisGuide, AINUBIS_GUIDE_CSS } from './AinubisGuide';
import { MAP_DOCK_CSS, DOCK_COL_W, DOCK_MOBILE_MAX } from '@/components/pack/mapDockShape';
import { HandTrash, HandArrowLeft } from '@/components/pack/HandIcons';
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
  onMetrics?: (m: { km: number; ascentM: number | null; minutes: number | null; points: number }) => void;
  mapRef: React.MutableRefObject<LeafletMap | null>;
  /**
   * ZRKADLENIE TRASY NA POŽIADANIE ZVONKA (Matej 2026-08-25).
   *
   * Tlačidlo „DOPLNIŤ TÚ ISTÚ CESTU SPÄŤ" stojí v AInubisovom dialógu, ktorý žije
   * v `AddTripLog` — ale zdvojiť trasu vie len picker: potrebuje `legsRef` (stopa po úsekoch),
   * `buildSnapPath` aj prepočet prevýšenia, a všetko troje je jeho vnútro. Prenášať ich hore
   * by z jedného zdroja pravdy spravilo dva, takže hore ide LEN spúšťač.
   * ⚠️ Ref, nie callback v `drawBar`: dialóg sa pýta v inom kroku, než v akom lišta žije.
   */
  mirrorRef?: React.MutableRefObject<(() => void) | null>;
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
     * Mapa práve patrí niekomu inému (krok 2 = zapichovanie značiek). Picker prestane brať
     * kliky aj dlhé stlačenia, ale vrstvy kreslí ďalej — trasa musí byť vidno, veď sa značky
     * pichajú NA ŇU.
     */
    paused?: boolean;
    /**
     * OBSAH LIŠTY, KEĎ MAPU RIADI INÝ KROK (krok 2 = odkazy na trasu).
     *
     * Matej 2026-08-23: „po kliku na trasa hotová ideme na 2. krok, ale ten bude opäť na
     * mape, nie prostredie krokov — v dolnom paneli sa zobrazia možnosti pridania odkazov."
     * Krok 2 teda nemá vlastný panel: požičia si TENTO, aby sa pod prstom nemenil tvar ani
     * miesto ovládania. Keď je podaný, nástroje kreslenia sa nekreslia vôbec.
     */
    panel?: React.ReactNode;
    /** i18n kľúč pre návrat — mení sa s tým, kto lištu práve vlastní (viď `backLink`). */
    backLabel?: string;
    /**
     * ÚNIK Z KRESLENIA — červený krížik vpravo hore (Matej 2026-08-24: „mala by existovať
     * šanca na únik… červený krížik").
     *
     * ⚠️ NIE JE TO DRUHÉ `onBack`. Návrat dole vracia O KROK a rozrobené necháva žiť; krížik
     * ZAHADZUJE celý výlet a odchádza na mapu. Sú to dve rôzne veci a preto sú obe — jedna
     * bez druhej by buď nemala cestu von (dnes), alebo by cestu späť o krok pretavila na
     * zrušenie výletu bez toho, aby to niekto čakal.
     * Volajúci je povinný sa OPÝTAŤ a zmazať autosave — inak sa rozrobené pri ďalšom vstupe
     * ponúkne na obnovu a otázka „naozaj zahodiť?" bola klamstvo.
     */
    onAbort?: () => void;
    /**
     * BODKY 1–5 (Matej 2026-08-24: „pri 1 a 2 kroku dajme predsa len vedľa seba 1-5, aby sme
     * sa mohli vracať a pohybovať po celom flow pri zmenách").
     *
     * ⚠️ Prichádzajú HOTOVÉ od volajúceho, picker o krokoch sprievodcu nevie. Musia ísť sem,
     * a nie sa len odkryť v paneli: panel je v krokoch 1–2 skrytý (mapa je celá obrazovka),
     * takže bodky v ňom by sa objavili presne vtedy, keď ich netreba, a chýbali by vtedy,
     * keď áno.
     */
    steps?: React.ReactNode;
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
// odbočku, kdežto prvá kotva trasy sa aj tak prichytí na najbližší chodník.
// ⚠️ JEDNO ČÍSLO PRE CELÝ SPRIEVODCU. Rovnaký prah platí aj pre odkazy pichané v kroku 2
// (PackMap ho odtiaľto importuje): keď sa kotva trasy dá položiť pri tomto priblížení,
// nemá zmysel žiadať pre jej parkovisko štyri stupne navyše — po vycentrovaní na celú
// trasu je človek pod ním a ťuk do mapy vtedy ticho nezaberie.
//
// 12 → 14 (Matej 24. 8. 2026: „kreslenie trasy sa musí dať pri bližšom zoome, teraz je to
// moc z diaľky"). Pri z12 vidno pás ~19 km — vtedy jeden pixel nesie ~40 m, takže kotva sadne
// o pol ulice vedľa a prichytávanie na chodník si vyberie cudzí chodník.
//
// 14 → 15 (Matej 25. 8. 2026, na telefóne: „prah odkedy sa može začať kresliť musíš ešte
// posunúť, lebo začína moc vysoko — musí to byť ešte nižšie = viac z blízka").
// ⚠️ VEDOMÁ VÝMENA, ktorú tu 24. 8. stálo napísané ako „vyššie sa ísť nedá": pri z15 je
// viditeľný pás ~2,5 km, takže celodenná trasa sa na obrazovku UŽ NEZMESTÍ a človek medzi
// kotvami posúva mapu. Matej to videl na reálnom telefóne a rozhodol, že rozoznateľnosť
// chodníka je dôležitejšia než nakreslenie na jeden záber — a má to oporu: kotva, ktorá
// sadne na cudzí chodník, sa opravuje ťažšie než posunutie mapy.
// Ďalší (a posledný) stupeň by bolo 16, čo je presne `MIN_ZOOM_FOR_NOTE` — vtedy by prah
// kreslenia a prah značiek splynuli do jedného čísla.
export const TRIP_HOLD_MIN_ZOOM = 15;
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
  mirrorRef,
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
  // Klesanie sa počíta z tej istej stopy a tých istých výšok ako stúpanie — je to len druhé
  // znamienko, takže nemá vlastné načítavanie ani vlastný `pending`.
  const [descent, setDescent] = useState<number | null>(null);
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
  /**
   * ⚠️ MEDZIKROK 1 ZANIKOL (Matej 24. 8. 2026: „po dlhom prvom stlačení bude hneď kreslenie,
   * nie otázka ako to zapíšeš"). Bola to ponuka „kresliť trasu / označiť len cieľ" — druhá
   * možnosť je zrušená (viď najmenší zápis nižšie), takže z otázky ostala jedna odpoveď.
   * Otázka s jedinou odpoveďou nie je voľba, je to klik navyše medzi človekom a kreslením.
   * Stupne ostávajú DVA: 0 = mapa je prázdna, 2 = kreslí sa.
   */
  const stage: 0 | 2 = started ? 2 : 0;

  // ── hlásenie metrík hore ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // NAJMENŠÍ ZÁPIS NEHLÁSI KILOMETRE. Vzdušná čiara medzi štartom a cieľom nie je dĺžka
    // výletu; keby sa poslala hore, sadla by do `draft.km` a odtiaľ do rebríčka kilometrov.
    onMetrics?.({
      km: isMinimal ? 0 : km,
      ascentM: isMinimal ? null : ascent,
      // ⚠️ ČAS IDE DO VÝLETU, NEPOČÍTA SA ZNOVA PRI ZOBRAZENÍ (Matej 2026-08-25: „tempo musíme
      // pridať do tripu"). Prepočet na karte by potreboval prevýšenie, ktoré tam nie je —
      // a keby sa raz zmenilo tempo, staré výlety by ticho zmenili čas.
      minutes: isMinimal ? null : estimateTripMinutes(km, ascent, descent),
      points: value.kind === 'route' ? value.path.length : 0,
    });
  }, [km, ascent, descent, value, onMetrics, isMinimal]);

  // ── prepočet prevýšenia — CELÁ trasa odznova (§5.2a) ──────────────────────────────────
  // KRITICKÉ: prevýšenie sa NESMIE sčítavať po segmentoch. Batch skript (compute-ascent.py)
  // prevzorkuje celú stopu na 100 m a až potom počíta stúpanie; ak by sme pripočítavali každý
  // nový úsek k predošlému súčtu, dostaneme iné číslo než dataset a tripy sa rozídu.
  const recomputeAscent = useCallback(async (path: LatLngTuple[]) => {
    if (path.length < 2) { setAscent(null); setDescent(null); setElevPending(false); return; }
    const run = ++runRef.current;
    const sampled = interp(path, SPACING);

    // najprv z toho, čo už je v cache — číslo naskočí okamžite a dopresní sa po dotiahnutí
    const missing = missingElevationCount(sampled);
    setElevPending(missing > 0);
    if (missing < sampled.length) { setAscent(calibratedAscent(path, elevAt)); setDescent(calibratedDescent(path, elevAt)); }

    if (missing > 0) {
      await ensureElevations(sampled);
      if (run !== runRef.current) return; // medzitým prišiel novší klik
      setAscent(calibratedAscent(path, elevAt));
      setDescent(calibratedDescent(path, elevAt));
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
  /* markTarget ZMAZANY 24. 8. 2026 - ciel sa neoznacuje (Matej). Citanie targetIdx
     ostava kvoli vyletom ulozenym predtym. */

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

  /**
   * ⚠️ ÚSEKY SA OBNOVUJÚ HNEĎ, NIE AŽ PRI UNDO (Matej 24. 8. 2026: „keď som kreslil trasu,
   * odišiel som a potom sa vrátil a dal krok späť, trasa sa zmenila tak, že predchádzajúce
   * snipety sa odstránili = sú nakreslené surovo, ale keď dám ďalší bod, ten snipne normálne").
   *
   * `legsRef` je PAMÄŤ KOMPONENTU, nie súčasť uloženého výletu. Po obnove náčrtu (`readAddDraft`)
   * má komponent kotvy aj hotovú stopu, ale legs prázdne — a `buildSnapPath` z prázdnych legs
   * poskladá vzdušné čiary. Preto to vyzeralo, že undo trasu „narovnal": nič nepokazil, len
   * postavil stopu z ničoho. Ďalší bod snapoval správne, lebo ten si sieť vypýtal nanovo.
   *
   * `ensureLegs` to vie rozrezať späť zo `snapPath` — dovtedy sa volal až vnútri `undo`, teda
   * v okamihu, keď už bolo treba stavať. Tu beží po každom príchode novej geometrie, takže
   * pamäť je pripravená skôr, než sa o ňu ktokoľvek oprie (undo, ďalší bod aj HOTOVO).
   */
  useEffect(() => {
    if (value.kind !== 'route' || value.path.length < 2) return;
    ensureLegs(value.path, value.snapPath);
  }, [value, ensureLegs]);


  /**
   * ── ZDVOJENIE TRASY: TOU ISTOU CESTOU SPÄŤ ─────────────────────────────────────────────
   *
   * Zmazané 24. 8. spolu s povinnou otázkou „ako si sa vracal", obnovené 25. 8. — Matej:
   * „pri popupe doplním návrat by sa možno hodilo tlačítko — doplním návrat iná cesta
   *  naspať (okruh) alebo doplniť automaticky tá istá cesta spať."
   *
   * ⚠️ NIE JE TO NÁVRAT ZMAZANÉHO KROKU, a preto to nie je otočka o 180°. Zaniklo POVINNÉ
   * rozcestie, ktoré appka kládla KAŽDÉMU po dokreslení trasy; toto je ponuka, ktorú dostane
   * len ten, komu trasa nekončí tam, kde začala — a len ako odpoveď na AInubisovu otázku.
   * Rozdiel je v tom, koho sa to pýta: predtým všetkých, teraz jedného.
   *
   * ⚠️ ZRKADLÍ SA AJ STOPA, NIE LEN KOTVY. Bez otočených úsekov by sa cesta domov nakreslila
   * vzdušnou čiarou cez kopec, kým tam sa vinie po chodníku.
   * `mirroredFrom` drží počet pôvodných kotiev — číta ho undo, ktoré zdvojenie vracia CELÉ
   * (inak by ostala pol trasy tam a pol späť, bez možnosti to opraviť inak než VYMAZAŤ).
   */
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
    /**
     * ⚠️ PO ZDVOJENÍ MUSÍ BYŤ VIDNO CELÚ TRASU (Matej 2026-08-25) ─────────────────────────
     *
     * „klikol som doplniť naspäť a obrazovku mi oddialilo na celú krajinu… nie na výber
     *  trasy — opäť musím zoomovať, aby som skontroloval, či je dobre, predtým než kliknem
     *  trasa hotová."
     *
     * Rámovanie je tu POVINNÉ, nie pohodlie: appka práve pridala polovicu trasy, ktorú
     * človek nenakreslil. Musí ju vidieť skôr, než potvrdí — inak potvrdzuje naslepo.
     * A keďže zdvojená trasa je dvakrát dlhšia než pôvodná, výrez by aj tak nesedel.
     * Rezerva je spoločná (`dockFitPadding`): dole dok, hore bublina AInubisa.
     */
    const map = mapRef.current;
    if (map && snapPath.length >= 2) {
      map.fitBounds(L.latLngBounds(snapPath), { ...dockFitPadding(notePanelH()), animate: true, duration: 0.4 });
    }
  }, [value, setRoute, buildSnapPath, recomputeAscent, ensureLegs, mapRef]);

  // Spúšťač hore. Registruje sa až keď je čo zrkadliť, takže dialóg vie tlačidlo skryť
  // podľa toho, či je ref naplnený — nie podľa vlastného odhadu o stave trasy.
  useEffect(() => {
    if (!mirrorRef) return;
    mirrorRef.current = mirrorBack;
    return () => { mirrorRef.current = null; };
  }, [mirrorRef, mirrorBack]);

  /* closeLoop ZMAZANY 24. 8. 2026 a NEVRACIA SA (rozhodnutie Mateja 25. 8.): uzavrel okruh
     tak, ze poslednu kotvu spojil so startom cez router — a ten voli NAJKRATSIU cestu, teda
     skoro vzdy tu istu, po ktorej clovek prisiel. Tlacidlo "vratil som sa inou cestou" by
     teda kreslilo cestu, ktorou nesiel, a este ju oznacilo za okruh. Kadial sa vracal vie
     len on, tak si to dokresli sam. */

  /* ⚠️ `setMinimal` ZMAZANÝ 24. 8. 2026 spolu s ponukou „neviem to nakresliť" (Matej: „to
     nebudeme tolerovať"). Prepínal geometriu na najmenší zápis; keď sa ten stav nedá vyvolať,
     je to funkcia bez volajúceho. Čítanie ostáva: `isMinimal` berie príznak z `value.minimal`,
     takže výlety, ktoré takto vznikli medzi 23. a 24. 8., sa zobrazia ďalej. */

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
  // Dlhé stlačenie má odteraz JEDINÚ úlohu: položiť prvú kotvu. Cieľ sa neoznačuje
  // (Matej 24. 8.) a ďalšie body pribúdajú obyčajným ťuknutím.
  const holdActive = !!drawBar?.active && !paused && needsHold;
  const placeRef = useRef(placePoint);
  useEffect(() => { placeRef.current = placePoint; }, [placePoint]);
  const holdRef = useRef<(lat: number, lng: number) => void>(() => {});
  useEffect(() => {
    holdRef.current = (lat, lng) => {
      if (needsHold) { void placeRef.current(lat, lng); return; }
    };
  }, [needsHold]);
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
      if (snapPath) void recomputeAscent(snapPath); else { setAscent(null); setDescent(null); }
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
    if (snapPath) void recomputeAscent(snapPath); else { setAscent(null); setDescent(null); }
  }, [value, setRoute, buildSnapPath, recomputeAscent, ensureLegs]);

  const clear = useCallback(() => {
    legsRef.current = [];
    setAscent(null);
    setDescent(null);
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
    setDescent(null);
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
    ensureAnchorTagCss();
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
      directionArrows(map, line).forEach(add);
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
        const tag = (at: LatLngTuple, label: string, extra = '') => add(L.marker(at, {
          icon: L.divIcon({
            className: '',
            html: `<span class="trp-anchor-tag${extra}">${label}</span>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
          interactive: false,
          keyboard: false,
          zIndexOffset: 400,
        }));
        tag(first, t(backToStart ? 'pack.addTrip.geo.labelStartEnd' : 'pack.addTrip.geo.labelStart'));
        // KONIEC SA POMENUJE TIEŽ (Matej 2026-08-23: „zobrazí sa mapa s pilsami štart koniec
        // a cieľ"). Pomenovaný bol len štart, takže druhý koniec trasy ostával holou guličkou
        // — na oddialenej mape po dokreslení sa z dvoch rovnakých bodiek nedá prečítať smer.
        // Pri okruhu sa NEKRESLÍ: štart aj koniec sú tá istá súradnica a niesla by ich jedna
        // pilulka „ŠTART · KONIEC", nie dve na sebe.
        if (!backToStart && value.path.length > 1) {
          tag(last, t('pack.addTrip.geo.labelEnd'));
        }
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
      // Terč povie „tu je cieľ" len tomu, kto pozná sadu emoji z mapy. Menovka to povie
      // rovnako ako pri koncoch trasy, aby boli všetky tri významné body čitateľné naraz.
      add(L.marker(value.path[value.targetIdx], {
        icon: L.divIcon({
          className: '',
          html: `<span class="trp-anchor-tag trp-anchor-tag--target">${t('pack.addTrip.geo.labelTarget')}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        }),
        interactive: false,
        keyboard: false,
        zIndexOffset: 501,
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
    // ⚠️ CIEĽ UŽ NIE JE PODMIENKA (Matej 24. 8.: „nebudeme dávať cieľ trasy, človek sa
    // jednoducho preklikká, či už okruh alebo aj späť — sám si to určí"). Trasa je hotová,
    // keď je z čoho nakresliť čiaru. Kam sa ňou došlo a či sa vracal, hovorí sám tvar.
    : routePath.length >= 2;
  const showReadout = value.kind === 'route' && routePath.length >= 2;
  // Volajúci (sprievodca) má prednosť: v kroku 2 sa na mape pichajú značky, nie kreslí trasa,
  // takže veta o dlhom stlačení by radila niečo, čo v tej chvíli nie je úloha.
  // ⚠️ PO ~2 KM SA APPKA OZVE O CIELI (Matej 23. 8.: „po 2 km by sa pri kurzore mohla objaviť
  // hláška: dlho podrž pre označenie cieľa trasy"). Dva kilometre NIE SÚ podmienka — tlačidlo
  // v lište stojí od druhej kotvy; toto je len chvíľa, kedy sa gesto oplatí pripomenúť, lebo
  // dovtedy človek kreslí a nemá dôvod hľadať, ako sa cieľ označuje.
  // Jedna veta na jedno miesto, obsah podľa KROKU (viď `stage` vyššie) — nikdy nie dve
  // naraz a nikdy nie veta o niečom, čo sa v tej chvíli nedá spraviť.
  /**
   * ── PRIBLIŽOVANIE HOVORÍ V STUPŇOCH, NIE JEDNOU VETOU (Matej 24. 8. 2026) ──────────────
   *
   * „Vyhľadaj miesto kde ste boli a priblíž sa, ešte, ešte super - teraz zvoľ štartovací
   *  bod." Sú to štyri rôzne vety podľa toho, ako ďaleko je človek od prahu — a práve tým
   * to prestáva byť hláška a začína to byť niekto, kto sa pozerá. Nahrádza to zlatý
   * prúžok priblíženia (`.trp-zoombar`), ktorý to isté hovoril bez slov.
   *
   * Prekresľuje sa cez `zoomTick` (efekt s vrstvami počúva `zoomend`), takže sa veta
   * prepne sama pri každom priblížení — bez ťuknutia do čohokoľvek.
   */
  const ownHint = stage === 0
    ? (holdTooFar
        ? (zoomPct < 34 ? t('pack.addTrip.ainubis.findPlace')
          : zoomPct < 70 ? t('pack.addTrip.ainubis.closer')
          : t('pack.addTrip.ainubis.closerMore'))
        : t(value.kind === 'route' ? 'pack.addTrip.ainubis.zoomOk' : 'pack.addTrip.geo.startHoldSpot'))
      // ⚠️ VETY O CIELI A O NÁVRATE ZANIKLI (Matej 24. 8. 2026). Sprievodca hovorí už len
      // dve veci: „klikaj ďalej" a — od druhej kotvy — že sa dá skončiť. Tvar trasy (okruh,
      // tam a späť, z A do B) si človek určuje sám tým, kam klikne, takže sa naň appka
      // nemá čo pýtať.
      : value.kind === 'route'
        ? (routePath.length < 2
            ? t('pack.addTrip.geo.continueTap')
            : t('pack.addTrip.ainubis.drawDone'))
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
            {/* ⚠️ ČAS JE ODHAD, NIE MERANIE (Matej 2026-08-25: „pridaj tam aj čas").
                Vlnovka je súčasťou hodnoty — bez nej to vyzerá ako údaj z hodiniek.
                Nečaká sa na výšky: rovinná zložka je známa hneď a je to väčšina času,
                po dotiahnutí prevýšenia sa číslo samo posunie nahor. Prázdny stĺpec
                s tromi bodkami by tu bol horší než hrubší odhad. */}
            {formatTripTime(estimateTripMinutes(km, ascent, descent)) && (
              <>
                <span style={{ color: T.onDarkDim }}> · </span>
                <span title={t('pack.addTrip.geo.timeNote')}>{formatTripTime(estimateTripMinutes(km, ascent, descent))}</span>
              </>
            )}
            <span style={{ color: T.onDarkDim }}> · {t(`pack.addTrip.geo.pointsSuffix.${pointCount === 1 ? 'one' : pointCount < 5 ? 'few' : 'many'}`, { n: pointCount })}</span>
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
  // ⚠️ VYKRESĽUJE SA AJ NA PC (24. 8.). Kým tam v krokoch 1–2 stál formulár, mal návrat
  // vlastnú šípku v hlavičke a dva návraty na jednej obrazovke sú otázka „ktorý z nich ma
  // vráti kam". Odkedy je obrazovkou mapa, je tento jediný — bez neho by sa z PC kreslenia
  // nedalo vycúvať inak než zrušením celého výletu.
  // NÁVRAT VEDIE O JEDEN KROK SPÄŤ, NIE NA ZAČIATOK. Kým lištu vlastní kreslenie, je tým
  // krokom výber aktivity; keď si ju požičal krok 2, je ním kreslenie — inak by človek
  // z otázky o parkovisku spadol na dlaždice a stratil nakreslenú trasu z dohľadu.
  /**
   * ── HLAVIČKA PANELA: BODKY 1–5 A ČÍTANIE KM (Matej 24. 8. 2026) ──────────────────────
   * „kroky presuň do dolného panela." Hore ostal AInubis; bodky a číslo sa presťahovali
   * sem. Je to JEDEN uzol pre obe podoby panela (`.trp-dstart` v kroku 0 aj `.trp-dbar`
   * ďalej) — dve kópie by sa rozišli pri prvej zmene, ako sa to už raz stalo pri `stepDots`.
   */
  /* ⚠️ `panelHead` ZANIKOL 24. 8. 2026 — bodky 1–5 sa presťahovali POD bublinu AInubisa
     (`AinubisGuide below`). V paneli si delili riadok s chipmi značiek a tlačili CTA nahor. */

  /**
   * ⚠️ ČÍTANIE KM NEPATRÍ DO HLAVIČKY (Matej 24. 8. 2026: „tu je to celé zle!").
   * V kroku 2 nesie `drawBar.steps` okrem bodiek 1–5 aj chipy značiek, takže pilulka
   * s kilometrami sa im v jednom riadku prekryla a text sa orezal. Stojí preto vo VLASTNOM
   * riadku a LEN počas kreslenia — keď je trasa hotová, číslo už nič nemení a v kroku 2
   * je úlohou zapichovať značky, nie sledovať dĺžku.
   */
  // ⚠️ V OBOCH KROKOCH, KDE JE MAPA (Matej 24. 8. 2026: „v 1-2 kroku"). Kým pilulka stála
  // v hlavičke panela, musela sa v kroku 2 skrývať — bila sa tam s chipmi značiek. Nad mapou
  // má miesta dosť, tak sa nemá prečo strácať práve vtedy, keď človek značky rozmiestňuje
  // po trase, ktorej dĺžku sleduje.
  const readoutRow = (stage === 2 && showReadout)
    ? <div className="trp-dreadrow"><div className="trp-dread">{readout}</div></div>
    : null;
  // Ten istý uzol, len umiestnený v mape nad panelom (Matej 24. 8. 2026).
  // ⚠️ Renderuje sa VNÚTRI doku, ktorý je pripútaný k spodnej hrane — pilulka tak „pláva"
  // tesne nad panelom a pri zmene jeho výšky ide s ním. Vlastný `position:fixed` by sa musel
  // dopočítavať z výšky panela a rozišiel by sa s ňou pri prvej zmene.

  const backLink = drawBar?.onBack ? (
    <button type="button" className="trp-dback" onClick={drawBar.onBack}>
      ← {t(drawBar.backLabel ?? 'pack.addTrip.geo.backToActivity')}
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
          zmizlo s ním. Od 24. 8. to platí na KAŽDEJ šírke — v krokoch 1–2 ustúpi formulár
          aj na PC, takže lišta nemá čo obchádzať a rozdiel medzi platformami je už len
          v tvare doku (dole cez celú šírku vs. plávajúca karta na strede). */}
      {barOn && drawBar && createPortal(
        <>
        <style>{MAP_DOCK_CSS}</style>
        <style>{DRAW_BAR_CSS}</style>
        <style>{AINUBIS_GUIDE_CSS}</style>
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
        {/* ── HORNÝ PÁS = AINUBIS + ÚNIK (Matej 24. 8. 2026) ─────────────────────────────
            „ainubis bude hore a X a kroky presuň do dolného panela."
            Bodky 1–5 aj čítanie km sa presťahovali DO PANELA — hore ostáva jediný hlas
            a jediné východisko. */}
        {(drawHint || drawBar.onAbort) && (
          <AinubisGuide
            text={drawHint ?? ''}
            onAbort={drawBar.onAbort}
            abortLabel={t('pack.addTrip.geo.abortAria')}
            below={drawBar.steps}
          />
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
        {/* ⚠️ LEN VETA KROKU 0 IDE HORE (Matej 2026-08-24: „tá správa o priblížení mapy daj ju
            hore pod header"). Netýka sa to celého systému pokynov: ostatné vety ostávajú dole
            pri ovládaní, lebo hovoria o geste, ktoré sa robí práve tam. V kroku 0 je gesto
            „priblíž si mapu", teda celá plocha — a pilulka dole vtedy len tienila panel
            s hľadaním miesta. */}
        {/* ⚠️ FIALOVÁ PILULKA ZANIKLA (Matej 24. 8. 2026: „namiesto fialových pils dáme ikonku
            ainubisa"). Pokyn nesie `AinubisGuide` hore — je to VÝMENA NOSIČA, nie druhý
            systém: lock z 23. 8. („jedna veta na jedno miesto") platí ďalej, len to miesto
            je odteraz hlavička. `drawHint` sa počíta rovnako ako predtým. */}

        <div className="trp-dock">
        {/* ⚠️ ČÍTANIE KM STOJÍ V MAPE, NIE V PANELI (Matej 24. 8. 2026: „pils s počítaním km
            v 1-2 kroku daj nad panel — ako keby do mapy"). Je to údaj O TRASE, teda o tom, čo
            je na mape — v paneli patrí ovládanie. Rovnaké miesto, aké mala kedysi pokynová
            pilulka, kým ju nevystriedal AInubis hore. */}
        {readoutRow}

        {stage === 0 && !drawBar.panel && (
          <div className="trp-dstart trp-dockpanel">
            {/* ⚠️ ZLATÝ PRÚŽOK PRIBLÍŽENIA ZANIKOL (Matej 24. 8. 2026: „nebudeme potrebovať
                progresbar pri priblížení ale ainubis napíše"). Otázku „koľko ešte?", kvôli
                ktorej 23. 8. vznikol, odpovedá teraz AInubis stupňovanými vetami
                (`ainubis.findPlace` → `closer` → `closerMore` → `zoomOk`). Prúžok vedľa nich
                bol to isté oznámenie dvakrát, len raz bez slov. `zoomPct` ostáva — vety sa
                delia práve podľa neho. */}
            {/* NA DOSAH PALCA. Hore bolo pole „takmer neviditeľné" a na telefóne aj mimo dosahu;
                po prvej kotve zmizne úplne — svoju úlohu (dostať človeka do jeho oblasti) má
                vtedy za sebou a nad rozkreslenou trasou by lákalo mapu odletieť inam. */}
            <PlaceSearch mapRef={mapRef} />
            {backLink}
          </div>
        )}

        {/* MAPU RIADI INÝ KROK — lišta požičia svoje miesto jeho ovládaniu (viď drawBar.panel).
            Stojí NAD podmienkou `stage`: v kroku 2 je trasa hotová, takže by sa `stage`
            aj tak rovnalo 2, ale panel nesmie závisieť od toho, čo je nakreslené. */}
        {drawBar.panel ? (
          <div className="trp-dbar trp-dockpanel">
            {drawBar.panel}
            {backLink}
          </div>
        ) : stage > 0 ? (
        <div className="trp-dbar trp-dockpanel">
          {/* MEDZIKROK "AKO TO ZAPISES" ZANIKOL 24. 8. 2026 (vid stage hore). Stala tu
              dvojica "kreslit trasu / oznacit len ciel"; druha moznost je zrusena a otazka
              s jedinou odpovedou je len klik navyse medzi clovekom a kreslenim. */}
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

          {/* ── CIEĽ A OTÁZKA O NÁVRATE — ZRUŠENÉ 24. 8. 2026 ────────────────────────────
              Matej: „nebudeme dávať cieľ trasy, človek sa jednoducho preklikká, či už okruh
              alebo aj späť… sám si to určí… tým pádom padá aj otázka ako výlet skončil, či
              návrat domov. Bude to len kreslenie a TRASA HOTOVÁ."

              Boli to dve otázky o jednej veci: 🎯 „označ cieľ" a po ňom „ako si sa vracal?"
              (pokračoval / okruh / tá istá cesta späť). Odpoveď na obe pritom už ležala
              na mape — kto sa vrátil, doklikal sa späť; kto spravil okruh, zavrel ho.
              Appka sa pýtala na tvar, ktorý má pred sebou nakreslený.

              ⚠️ ČÍTANIE `targetIdx` A `returnMode` OSTÁVA (značka 🎯 na mape, pilulka
              ŠTART · KONIEC) — výlety uložené do 24. 8. tie polia nesú a musia sa zobraziť
              ďalej. Zanikol len spôsob, ako ich NASTAVIŤ. */}

          {/* ── DVE FÁZY, DVA TVARY (Matej 2026-08-23) ───────────────────────────────────
              „Pri fáze kreslenia bude len krok späť, vymazať a neviem to nakresliť… pri
              zvolení cieľa musí byť dominantné tlačidlo TRASA HOTOVÁ cez celú šírku mobilu
              a pod ňou menšími späť o bod a vymazať."

              KÝM CIEĽ NIE JE OZNAČENÝ, HOTOVO SA VÔBEC NEKRESLÍ. Do teraz tam stálo (len
              nezlaté) a človek ho stlačil skôr, než trasu dokončil — sivé tlačidlo v rade
              troch nie je „ešte nie", je to tretia možnosť. Kto chce uložiť neúplnú trasu,
              má na to poctivú cestu: „neviem to nakresliť" nižšie.

              Ikonky sú z hand-drawn setu (CLAUDE.md) a dedia farbu textu — `HandIcons` je
              práve ten kanál, ktorý to vie. */}
          {(() => {
            const tools = !paused && (
              <div className={`trp-dbar-row${doneReady ? ' trp-dbar-row--minor' : ''}`}>
                <button
                  type="button"
                  className="trp-dbar-btn"
                  onClick={undo}
                  disabled={busy || !hasSomething}
                  style={{ opacity: hasSomething ? 1 : 0.4 }}
                >
                  <HandArrowLeft size={14} />
                  {t('pack.addTrip.geo.undoPoint')}
                </button>
                <button
                  type="button"
                  className="trp-dbar-btn"
                  onClick={clear}
                  disabled={busy || !hasSomething}
                  style={{ opacity: hasSomething ? 1 : 0.4 }}
                >
                  <HandTrash size={14} />
                  {t('pack.addTrip.geo.clear')}
                </button>
              </div>
            );
            const done = (
              <button
                type="button"
                className="trp-dbar-done trp-dbar-done--hero"
                onClick={drawBar.onDone}
                disabled={!!drawBar.doneDisabled}
                style={drawBar.doneDisabled ? { opacity: 0.42, boxShadow: 'none', cursor: 'default' } : undefined}
              >
                {drawBar.doneLabel ?? t('pack.addTrip.geo.done')}
              </button>
            );
            // V PAUZE (krok 2 sprievodcu) ostáva len HOTOVO — nástroje kreslenia by tam
            // pridávali kotvy do hotovej trasy.
            if (paused) return done;
            return doneReady ? <>{done}{tools}</> : tools;
          })()}

          {/* ── NAJMENŠÍ MOŽNÝ ZÁPIS — PONUKA ZRUŠENÁ 24. 8. 2026 ────────────────────────
              Matej: „zruš možnosť neviem to nakresliť… to nebudeme tolerovať, musíme to
              spraviť aby to vedel nakresliť každý."

              ⚠️ RUŠÍ SA PONUKA, NIE SCHOPNOSŤ ČÍTAŤ. Príznak `geometry.minimal` nesú výlety,
              ktoré takto vznikli medzi 23. a 24. 8., a `isMinimal` vetvy (km sa nehlásia,
              cieľ sa neoznačuje, HOTOVO stačia dve kotvy) ich musia vedieť zobraziť ďalej —
              inak by sa im rozsypal článok. Zaniklo len to, čím sa dal ten stav ZAPNÚŤ:
              druhé tlačidlo v kroku 1 a tento odkaz v lište. Prepínač `setMinimal` odišiel
              s nimi (nemal by volajúceho).

              Predtým tu stálo (23. 8.): „štart–cieľ bude minimum, aby sme nikoho neodradili,
              ale bude vyzvaný, že skús nakresliť." Prosba (`minimalPlea`) padá s ponukou —
              nemá koho prosiť, keď sa ten stav nedá vyvolať. */}
          </>
          )}
          {backLink}
        </div>
        ) : null}

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

/**
 * MENOVKY KONCOV TRASY — visia nad kotvou, ťuky prepúšťajú do mapy (inak by z nich bola
 * diera, do ktorej sa nedá klikať práve tam, kde človek kreslí).
 *
 * ⚠️ VLASTNÝ INJEKTOR, NIE `DRAW_BAR_CSS` (Matej 2026-08-23: „pil štart cieľ zmizli a biele
 * písmo štart zaniká na mape"). Štýl lišty žije v `<style>` vnútri portálu, ktorý sa
 * odmountuje vždy, keď lišta zhasne — a tá zhasína pri každom umiestňovaní značky
 * (`active: drawingStep || (notesInBar && !notePlacing)`) aj na PC v kroku 2. Pilulka
 * pritom ostáva v mape ďalej, takže z nej v tej chvíli bol HOLÝ `<span>`: bez pozadia,
 * bez rámu, len text splývajúci s mapou. Vyzeralo to, že pilulka zmizla — v skutočnosti
 * jej odišiel štýl. Menovka je vrstva MAPY, tak jej štýl visí na kreslení vrstiev
 * (rovnaký vzor ako `ensureTrailLineCss`), nie na paneli.
 */
// ── ŠÍPKY SMERU V JADRE MEČA ────────────────────────────────────────────────────────────
// Matej 2026-08-23: „pri písaní trasy by bolo ok každých 100m mať v strede svetelnáho meča
// malinkú šípku ktorá by naznačovala smer".
//
// Nakreslená čiara nepovie, ktorým smerom sa išlo — a pri trase tam-a-späť alebo pri okruhu
// je to jediná informácia, ktorá chýba. Šípka sedí NA bielom jadre meča, preto je tmavá
// (`TRAIL_LINE.edge`): svetlá by na ňom zanikla.
const ARROW_STEP_M = 100;
/** Najmenší odstup šípok na obrazovke. Pri 100 m a z13 by boli od seba 21 px a zliali by sa
 *  do bodkovanej čiary — krok sa preto pri oddialení predlžuje, aby vzdialenosť v PIXELOCH
 *  ostala čitateľná. Sto metrov je zadanie pre priblíženú mapu, nie pre každý zoom. */
const ARROW_MIN_PX = 58;
/** Strop na trasu. Cesta hrdinov SNP má 770 km ⇒ pri 100 m by to bolo 7 700 markerov. */
const ARROW_MAX = 150;

function directionArrows(map: LeafletMap, line: LatLngTuple[]): L.Layer[] {
  if (line.length < 2) return [];
  // Koľko metrov je jeden pixel v aktuálnom zobrazení. Meria sa NA MAPE, nie zo vzorca —
  // hodnota závisí od zemepisnej šírky a `map.distance` ju už pozná.
  const c = map.getCenter();
  const p = map.latLngToContainerPoint(c);
  const mPerPx = map.distance(c, map.containerPointToLatLng([p.x + 100, p.y])) / 100;
  const step = Math.max(ARROW_STEP_M, ARROW_MIN_PX * mPerPx);

  const out: L.Layer[] = [];
  let carry = step / 2; // prvá šípka do polovice prvého úseku, nie na kotvu
  for (let i = 1; i < line.length && out.length < ARROW_MAX; i++) {
    const a = line[i - 1];
    const b = line[i];
    const segM = hav(a, b);
    if (segM <= 0) continue;
    // Uhol sa počíta z PIXELOV, nie zo zemepisných súradníc — v Mercatorovej projekcii sa
    // stupne šírky a dĺžky nekrátia rovnako, takže z lat/lon by šípka pri okrajoch mapy
    // ukazovala vedľa čiary, na ktorej leží.
    const pa = map.latLngToLayerPoint(a);
    const pb = map.latLngToLayerPoint(b);
    const deg = Math.atan2(pb.y - pa.y, pb.x - pa.x) * 180 / Math.PI;
    let d = carry;
    while (d <= segM && out.length < ARROW_MAX) {
      const t = d / segM;
      // Lineárne medzi dvoma susednými bodmi stopy. `interp()` z addTripGeo vzorkuje CELÚ
      // cestu a vracia pole — tu treba jeden bod a k nemu uhol, takže vlastný výpočet.
      // Na úseku dlhom desiatky metrov je rovná interpolácia presná dosť.
      const at: LatLngTuple = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      out.push(L.marker(at, {
        icon: L.divIcon({
          className: '',
          html: `<span class="trp-dir-arrow" style="transform:translate(-50%,-50%) rotate(${deg.toFixed(1)}deg)"></span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        }),
        interactive: false,
        keyboard: false,
      }));
      d += step;
    }
    carry = d - segM;
  }
  return out;
}

const ANCHOR_TAG_CSS = `
.trp-anchor-tag{position:absolute;left:0;top:0;transform:translate(-50%,-26px);pointer-events:none;white-space:nowrap;padding:3px 9px;border-radius:999px;background:rgba(18,13,7,0.94);border:1px solid ${TRAIL_LINE.light};box-shadow:0 2px 10px rgba(0,0,0,0.5);font-family:${FONT_UI};font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#F3E9FF;}
/* Menovka cieľa výletu sedí NAD krúžkom s terčom, nie na kotve — preto vyššie odsadenie
   (krúžok má 28 px, viď circleMark.ts) a zlatý rám, aby sa nečítala ako koniec trasy. */
.trp-anchor-tag--target{transform:translate(-50%,-40px);border-color:${GOLD};color:#FFF3D6;}
/* Šípka smeru — trojuholník z okrajov, aby nepotreboval vlastný SVG súbor ani obrázok.
   position:absolute + posun o polovicu: divIcon má nulovú veľkosť, takže sa polohuje sám.
   (Bez spätných apostrofov — toto je JS template literal a ukončili by ho.) */
.trp-dir-arrow{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;border-left:6px solid ${TRAIL_LINE.edge};border-top:3.5px solid transparent;border-bottom:3.5px solid transparent;transform-origin:50% 50%;}
`;

function ensureAnchorTagCss() {
  if (typeof document === 'undefined' || document.getElementById('trp-anchor-tag-css')) return;
  const el = document.createElement('style');
  el.id = 'trp-anchor-tag-css';
  el.textContent = ANCHOR_TAG_CSS;
  document.head.appendChild(el);
}

const DRAW_BAR_CSS = `
/* TRI DIELY: bodky vľavo · čítanie v strede · únik vpravo. Stredný diel je centrovaný voči
   CELEJ šírke, nie voči zvyšku po bodkách — preto krajné diely nesú rovnakú základňu
   (flex:1 1 0) a číslo km neposkakuje podľa toho, či práve svietia bodky. */
/* ÚNIK — červený krížik. Jediný prvok na tejto obrazovke, ktorý je červený, a je to zámer:
   je to jediná akcia, ktorá niečo NENÁVRATNE zahodí. Klikacia plocha 36 px (dotyk), viditeľný
   je len znak — rovnaká úvaha ako pri krížiku v AddTripEntry. */
/* ČÍTANIE HORE — km · prevýšenie · body. Nie je to ovládač, tak nechytá ťuky do mapy.
   ⚠️ FIALOVÉ, NIE ŠEDÉ (Matej 2026-08-23: „pri móde kreslenia treba zvýrazniť horné info
   o KM, je to ako neviditeľné — daj to fialovým ako je teraz označ cieľ"). Je to jediné
   číslo, ktoré počas kreslenia rastie, a v šedom ráme nad pestrou mapou ho oko minulo.
   Rám a dosvit sú tie isté ako na pokynovej pilulke a na 🎯 — počas kreslenia hovorí
   fialová, a hovorí ju celá obrazovka rovnako. */
.trp-dread{pointer-events:none;padding:9px 18px;border-radius:999px;background:rgba(18,13,7,0.94);border:1.5px solid ${TRAIL_LINE.light};box-shadow:0 0 0 4px rgba(122,47,191,0.20),0 6px 20px rgba(0,0,0,0.55);font-family:${FONT_UI};font-size:15px;font-weight:600;color:#F3E9FF;white-space:nowrap;}
/* KROK 0 — pilulka stojí sama tam, kde neskôr narastie lišta, aby to vyzeralo, že jej
   okolie len dorástlo, nie že sa presunula. */
/* DOK — stĺpec pri spodnej hrane: pokyn (v mape), panel, návrat. Sám je priehľadný a ťuky
   prepúšťa; výplň aj ovládanie nesú jeho deti. */
/* ⚠️ DOK NEMÁ SPODNÉ ODSADENIE (Matej 2026-08-23: „dolný panel na mobile nie je až úplne dolu
   a presvitá na dolnom okraji mapa — neúplný panel"). Bezpečnú zónu telefónu nesie PANEL vo
   svojej výplni, nie dok nad ním: odsadenie tu odlepilo tmavú plochu od hrany displeja a pod
   ňou ostal prúžok mapy, ktorý vyzeral ako nedokreslený panel. */
.trp-dock{position:fixed;left:0;right:0;bottom:0;z-index:1200;display:flex;flex-direction:column;align-items:stretch;gap:12px;pointer-events:none;}
.trp-dock > *{pointer-events:auto;}
/* KROK 0 — panel s hľadaním miesta. VZDUŠNEJŠÍ (Matej 23. 8.: „panel urob vyšší vzdušnejší,
   text area je moc nízko") — pole potrebuje vzduch nad aj pod sebou, inak sedí na hrane
   displeja a na telefóne ho prekrýva systémová lišta. */
.trp-dstart{display:flex;flex-direction:column;gap:14px;}
/* NÁVRAT — podčiarknutý text v strede pod panelom. Šípka v rohu brala mape výšku a palec
   na ňu nedosiahol; text zaberie riadok a povie aj KAM sa vracia. */
.trp-dback{align-self:center;background:none;border:0;padding:4px 10px;color:${T.onDarkDim};font-family:${FONT_UI};font-size:12.5px;font-weight:500;text-decoration:underline;text-underline-offset:3px;cursor:pointer;}
.trp-dback:hover{color:${GOLD};}
/* ZLATÝ, NIE FIALOVÝ (Matej 2026-08-24). Fialová je na tejto obrazovke jazyk POKYNOV
   („toto máš spraviť"), zlatá je jazyk POSTUPU a odmeny — a toto je jediný prúžok, ktorý
   ukazuje, ako ďaleko je človek od cieľa. Gradient je ten istý ako na .btn-gold. */
/* Pilulka leží NAD panelom priamo v mape, takže si drží vlastné bočné odsadenie. */
/* KROK 0 — tá istá pilulka, ale POD hlavičkou namiesto nad panelom (Matej 2026-08-24).
   Je fixed, lebo dok, v ktorom pôvodne visela, je pripútaný k spodnej hrane. Odsadenie
   zhora ju posadí pod horný pás s krížikom, nie pod neho. */

/* Čítanie km má vlastný riadok a je vycentrované — v hlavičke sa bilo s chipmi značiek. */
/* Pás sám ťuky NEBERIE — pod ním je mapa a musí sa na nej dať kresliť. */
.trp-dreadrow{display:flex;justify-content:center;pointer-events:none;margin:0 16px;}
.trp-dreadrow .trp-dread{font-size:13.5px;padding:7px 14px;}

/* ── PEVNÁ VÝŠKA V KROKOCH 1–2 (Matej 24. 8. 2026) ─────────────────────────────────────
   „ten by bolo možno dobré v prvých 2 krokoch fixnut na konkretnu výšku aby sa pri týchto
    2 krokoch neustále nemenila tá výška a bola max 33%."

   ⚠️ PRÍČINA NIE JE ESTETIKA. Panel rástol a klesal podľa toho, čo v ňom práve stálo
   (hľadanie miesta → dve možnosti → nástroje → otázka o návrate → HOTOVO), a s ním skákala
   aj mapa nad ním — človek si priblížil miesto, panel narástol a to miesto mu ušlo pod
   okraj. Pevná výška znamená, že mapa má počas celého kreslenia rovnaký výrez.

   Výška aj strop naraz: samotná height by pri dlhšom obsahu panel pretiahla, samotný
   max-height by ho nechal skákať zdola. Čo sa nezmestí, skroluje SA VNÚTRI —
   overscroll-behavior drží ťah prsta v paneli, aby sa pod ním nehýbala mapa.
   Platí len na telefónnu vetvu; na PC je dok plávajúci ľavý stĺpec s vlastnou výškou. */
/* Výšku 33vh nesie .trp-dockpanel (mapDockShape.ts) — spoločne s panelom značky. Tu ostáva
   len to, čo je vlastné DOKU: čo sa doň nezmestí, skroluje sa celé (formulár značky proti tomu
   skroluje len svoj stred). overscroll-behavior drží ťah prsta v paneli, aby sa pod ním
   nehýbala mapa. */
@media (max-width:${DOCK_MOBILE_MAX}px){
  .trp-dstart,.trp-dbar{overflow-y:auto;overscroll-behavior:contain;}
}
/* ⚠️ MUSÍ TO BYŤ "safe center", NIE holé "center" (CLAUDE.md, tá istá pasca ako pri .atl-tiles).
   Holé center v skrolovacom kontajneri pretlačí prvý prvok NAD začiatok skrolu, keď sa obsah
   nezmestí — a tam sa už nedá doskrolovať. Slovo safe prepne späť na start presne vtedy,
   keď by k tomu došlo. Horná výplň 56 px = 18 (odsadenie hlavičky) + 26 (bodky) + 12 (medzera). */
/* ⚠️ DVA ZÁPISY ZA SEBOU, ZÁMERNE. Prehliadač, ktorý slovo "safe" nepozná, zahodí CELÉ
   pravidlo — a panel potom sedí hore s dierou pod sebou, presne ako to Matej videl na
   telefóne 24. 8. („CTA je v dotyku čísel a dolu je veľký priestor"). Prvý riadok je teda
   funkčná záloha, druhý je jeho bezpečná verzia pre tých, čo ju vedia.
   Horná výplň 74 px = 18 (odsadenie hlavičky) + 30 (výška bodiek) + 26 (odstup od CTA);
   pri 56 px sa tlačidlo bodiek DOTÝKALO. */
.trp-dstart,.trp-dbar{position:relative;justify-content:center;}
.trp-dstart,.trp-dbar{justify-content:safe center;}
.trp-dbar{min-height:${DRAW_BAR_H}px;display:flex;flex-direction:column;gap:12px;}
.trp-dbar-read{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:20px;}
.trp-dbar-row{display:flex;gap:8px;}
.trp-dbar-btn{flex:1 1 0;display:flex;align-items:center;justify-content:center;gap:7px;padding:12px 10px;border-radius:8px;background:${T.glass};border:1px solid ${T.onDarkBorder};color:${T.onDark};font-family:${FONT_UI};font-size:12px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;}
/* NÁSTROJE POD HOTOVOM SÚ VEDĽAJŠIE (Matej 23. 8.: „pod ňou menšími späť o bod a vymazať").
   Keď je trasa hotová, tieto dve už nie sú úloha — sú oprava. */
.trp-dbar-row--minor .trp-dbar-btn{padding:9px 10px;font-size:11px;background:none;color:${T.onDarkDim};}
.trp-dbar-row--minor .trp-dbar-btn:hover:not(:disabled){color:${GOLD};}
.trp-dbar-btn:hover:not(:disabled){border-color:${GOLD};color:${GOLD};}
.trp-dbar-btn:disabled{cursor:default;}
.trp-dbar-wide{flex:1 1 100%;}
/* HOTOVO — brand CTA podľa .btn-gold locku: gradient 135°, radius 8, papyrusový rám. */
.trp-dbar-done{flex:1 1 0;padding:12px 10px;border-radius:8px;background:linear-gradient(135deg,#F5C73D,#E69E1A);border:1px solid rgba(250,244,236,0.3);color:#1c160c;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;box-shadow:0 0 40px rgba(230,158,26,0.4),inset 0 1px 0 rgba(255,255,255,0.3);cursor:pointer;}
/* CELÁ ŠÍRKA, KEĎ JE TO JEDINÁ ÚLOHA NA OBRAZOVKE (Matej 23. 8.: „dominantné tlačidlo
   TRASA HOTOVÁ cez celú šírku mobilu"). */
.trp-dbar-done--hero{width:100%;flex:none;padding:15px 12px;font-size:13.5px;}
/* CIEĽ — fialový, teda z rodiny trasy, nie zlatý: zlatá je v tomto rade vyhradená HOTOVU. */
/* CIEĽ — PILULKA, nie tlačidlo v rade (Matej 23. 8.: „to tlačítko mark the destination by
   malo byť v pils ako pri začiatku"). Tvar aj rám sú zhodné s pokynovou pilulkou vyššie:
   obe hovoria o tom istom geste nad mapou, len jedna z nich sa dá aj stlačiť. */
/* ── OZNAČ CIEĽ — BRANDOVÁ ZLATÁ (Matej 2026-08-24) ──────────────────────────────────
   ⚠️ V TEJTO LIŠTE UŽ ZLATÁ JEDNO TLAČIDLO MÁ: HOTOVO. Zámena by bola drahá — jedno
   ukladá výlet, druhé pridáva bod do trasy. Preto sa NEROZLIŠUJÚ farbou, ale TVAROM
   a váhou, a rozdiel je čitateľný aj periférne:
     · HOTOVO = plná šírka, plný gradient, Cinzel, radius 8 (lock .btn-gold)
     · CIEĽ   = pilulka na šírku obsahu, priehľadná zlatá výplň so zlatým rámom, Space Grotesk
   Cieľ je teda zlatý „obrys" toho istého jazyka — patrí do zlatej rodiny, ale nikdy
   nevyzerá ako záverečné tlačidlo. */
.trp-dbar-emoji{font-family:${FONT_EMOJI};font-size:15px;line-height:1;}

/* ── PC: OVLÁDANIE JE V ĽAVOM BLOKU, STRED PATRÍ MAPE ─────────────────────────────────
   Matej 2026-08-24 (po prvom teste): „vieš čo bude lepší nápad dať to do ľavého bloku ako
   je všetko na PC lebo takto si zakryjeme strednú časť kde pracujeme."

   Prvé kolo malo dok ako kartu na strede — a tá si sadla presne doprostred plochy, do ktorej
   sa kreslí. Na PC platí pre všetky povrchy mapy to isté: ovládanie vľavo, mapa vpravo.
   Dok teda nie je výnimka, len ďalší obyvateľ toho istého stĺpca.

   ⚠️ ŠÍRKA JE ZHODNÁ S FORMULÁROM (.trp-sidebar / .trp-addhost), vrátane zúženia na 360 px
   medzi 1024–1400. Dok a formulár sú DVA STAVY JEDNÉHO STĹPCA (kroky 1–2 vs. 3–5); keby mali
   vlastné šírky, blok by pri prechode z kroku 2 do 3 skočil na inú šírku a vyzeralo by to
   ako dva rôzne panely. Preto tu nie je vlastná konštanta — je to tá istá miera.

   ⚠️ ZAROVNANÉ HORE, NIE DOLE. Blok rastie zhora nadol tak, ako doňho pribúda obsah —
   pri zavesení na spodnú hranu by pri každom prepnutí kroku odskočil jeho vrchol.
   (Do 24. 8. tu stál druhý dôvod: ponuka miest v hľadaní vytekala pod okno. Ten padol —
   ponuka sa odvtedy renderuje na <body> a smer si volí podľa miesta, viď PlaceSearch.tsx.) */
@media (min-width:1024px){
  .trp-dock{top:20px;bottom:20px;left:20px;right:auto;width:${DOCK_COL_W}px;max-width:calc(100vw - 40px);justify-content:flex-start;align-items:stretch;}
  /* Rám, zaoblenie aj spodná výplň prišli do .trp-dockpanel (mapDockShape.ts) — panel
     značky ich musí mať rovnaké, inak sa na PC pri zapichovaní zmení tvar rovnako ako
     na telefóne. */
  /* Pokyn stojí v bloku nad panelom, nie v mape: na PC je mapa pracovná plocha a pilulka
     v jej strede by prekážala tomu istému, čomu prekážal dok. */
  /* ČÍTANIE OSTÁVA NAD MAPOU, odsadené o blok — je to jediné číslo, ktoré počas kreslenia
     rastie, a patrí k trase, nie k ovládaniu. 74 px vpravo = miesto pre ovládanie mapy
     (zoom, poloha, vrstvy); to isté číslo drží .trp-topbar v PackMap.tsx. */
  /* KURZOR HOVORÍ, ŽE SA KRESLÍ (Matej 2026-08-24: „nevidím pri kurzore +"). Na mobile to
     povie prst a pilulka, na PC nie je z ničoho vidieť, že klik do mapy niečo spraví. */
  body.trp-drawing .leaflet-container,body.trp-drawing .leaflet-container .leaflet-interactive{cursor:crosshair;}
}
/* Kompaktný desktop — tá istá hranica a to isté číslo, aké má .trp-sidebar v PackMap.tsx. */
@media (min-width:1024px) and (max-width:1400px){
  .trp-dock{width:360px;}
}
`;

export default GeometryPicker;
