// ADD TRIP — log ("WE'VE BEEN THERE"), vlna 1, plany/zadanie-addtrip-flow-2026-07-27.md §4.3.
// Renderuje sa ako panel content (kontajner + jeho pozíciu rieši volajúci, rovnaký vzor ako
// AddTripPlan.tsx — sesterský súbor, drž sa jeho štýlu/CSS konvencií, ktoré tento súbor kopíruje
// 1:1 tam, kde sedia). Mapa žije v Portale — `GeometryPicker` (kontrakt:
// plany/kontrakt-geometrypicker-2026-07-29.md) dostane `mapRef` a kreslí do nej, tento formulár
// len drží riadený `TripGeometry` state.
//
// KROK 1 → KROK 2 je RIEŠENÝ CEZ PODMIENENÝ RENDER, NIE early return — všetky hooky bežia
// nepodmienene na každom rendri (Rules of Hooks, viď zadanie „pozor" sekcia).
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import type { LatLngTuple, Map as LeafletMap } from 'leaflet';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { CompanionPicker, type Companion } from '@/components/pack/packCommunityUI';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS, type Journey } from '@/data/heroJourneys';
import { trailCountry, flagEmoji } from '@/lib/countryGeo';
import { trailWCE } from '@/components/pack/triplist/triplist';
import { GeometryPicker, allowedKindsFor, defaultKindFor, findDuplicate } from './GeometryPicker';
import { PawRating } from './PawRating';
import { HAZARDS, HAZARD_EMOJI, CROWDS, CROWD_EMOJI, type Crowd } from '@/components/pack/packCommunity';
import {
  missingFields,
  type AddTripDraft, type TripGeometry, type ApprovalStatus,
  readAddDraft, writeAddDraft, clearAddDraft,
} from './addTripModel';

const GOLD = '#C99A3F';

// JOURNEY = VÝBER, NIE KRESLENIE (Matej 2026-07-29, plany/zadanie-journey-pick-2026-07-29.md).
// `existingTripId` je lokálne rozšírenie AddTripDraft (addTripModel.ts sa needituje) — nesie
// odkaz na magistrálu z HERO_JOURNEYS, aby konvertor v PackMap.tsx vedel, že nemá vytvárať
// nový HeroTrail (viď submitAddTripDraft tam), len označiť existujúci trip ako prejdený.
type LogDraft = AddTripDraft & { existingTripId?: string };

export type AddTripLogProps = {
  /** Pre GeometryPicker — duchovia existujúcich trás + kontrola duplicity (§5.3) a submit-time
   *  poistku (findDuplicate, kontrakt §2.3). */
  allTrails: HeroTrail[];
  /** firstName z usePackIdentity — zapisuje sa do draftu (`authorName`). */
  authorName: string;
  myDogs: { id: string; name: string; photo?: string | null }[];
  /** false = zlyhal zápis (napr. plná kvóta) — formulár zostane otvorený, ukáže chybu. */
  onSubmit: (draft: AddTripDraft) => boolean;
  onClose: () => void;
  /** PackMap.tsx:246 `placeholderFor()` — rovnaký prop ako AddTripPlan, len tu slúži ako
   *  fallback pokým autor nenahrá vlastnú fotku (row 10) — akonáhle je aspoň jedna, nahrádza ju. */
  placeholderFor: (actIds: string[] | undefined, seed: string) => string;
  /** Mapa žije v PackMap.tsx — GeometryPicker ju nevytvára, len dostane ref (kontrakt §2). */
  mapRef: MutableRefObject<LeafletMap | null>;
  /** Lišta kreslenia (rez B) — prechádza rovno do GeometryPickera, viď jeho `drawBar`. */
  drawBar?: { active: boolean; onDone: () => void };
  /**
   * VÝCHODISKO Z PRSTA (rez C) — bod z dlhého stlačenia. Stane sa PRVOU KOTVOU trasy
   * hneď po výbere aktivity, takže krok „nájdi miesto" odpadá. Bez neho sa formulár
   * správa presne ako doteraz.
   */
  seedPoint?: { lat: number; lon: number } | null;
  /**
   * „Miesto aj aktivita sú známe, choď kresliť." Volá sa RAZ, po výbere aktivity na
   * zasiatom výlete — PackMap podľa toho odkryje mapu. Poradie zo zadania:
   * 0 vstup → 1 miesto → 2 aktivita → 3 kreslenie → 4 byrokracia.
   */
  onReadyToDraw?: () => void;
  /**
   * Vlastní táto kópia formulára zálohu rozpracovaného výletu?
   *
   * Desktop aj mobil mountujú tento komponent NARAZ (skrýva ich CSS, nie podmienka).
   * Bez tohto príznaku obe píšu do jedného kľúča a neviditeľná kópia — prázdna —
   * prepíše prácu tej viditeľnej. `false` = formulár funguje normálne, len sa neukladá
   * a neponúka obnovu. Viď `isNarrow` v PackMap.tsx.
   */
  owns?: boolean;
};

// Aktivita taxonómia — lokálna kópia, rovnaká zavedená duplikačná konvencia ako AddTripPlan.tsx
// (komentár tam vysvetľuje prečo: PackMap.tsx má rovnaký zoznam, needituje sa, nič z neho nie
// je exportované).
const ACTIVITIES: Array<{ id: string; label: string; emoji: string; dataId: string }> = [
  { id: 'hiking', label: 'Hiking', emoji: '🥾', dataId: 'hike' },
  { id: 'journey', label: 'Journey', emoji: '🎒', dataId: 'journey' },
  { id: 'picnic', label: 'Picnic', emoji: '🧺', dataId: 'picnic' },
  { id: 'overnight', label: 'Overnight', emoji: '⛺', dataId: 'overnight' },
  { id: 'skating', label: 'Skate', emoji: '🛼', dataId: 'skating' },
  { id: 'paddleboard', label: 'SUP/swim', emoji: '🏄', dataId: 'paddleboard' },
  { id: 'explore', label: 'Explore', emoji: '🧭', dataId: 'explore' },
];
const ACT_BY_ID: Record<string, (typeof ACTIVITIES)[number]> = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));

// §4.3 riadok 4: Difficulty/Terrain len pre hiking/journey — rovnaká množina ako HIKE_LIKE
// v addTripModel.ts (needituje sa, nie je exportovaná — lokálna kópia tej istej myšlienky).
const HIKE_LIKE = new Set(['hiking', 'journey']);
const DIFF_OPTIONS = ['Easy', 'Moderate', 'Hard', 'Odyssey'] as const;
// terrain — lokálna kópia SURFACE_VOCAB (PackMap.tsx, needituje sa/needituje sa exportovať).
const TERRAIN_OPTIONS = [
  { id: 'forest', emoji: '🌲', label: 'Forest path' },
  { id: 'asphalt', emoji: '🛣️', label: 'Asphalt' },
  { id: 'rocky', emoji: '🪨', label: 'Rocky' },
] as const;
// tags — scenéria, ODDELENÁ od terrain (surface má vlastné pole `surface`, viď addTripModel.ts
// komentár „PRAVIDLO PRE VŠETKY VRSTVY"). PackMap.tsx TAG_VOCAB miešal scenériu + surface do
// jedného radu (bolo to pre FILTER chipy, kde to malo zmysel); tu majú tags a terrain oddelené
// polia, tak dávame do tag-chipov len scenériu, nie duplicitu terrain dropdownu.
const TAG_OPTIONS: Array<{ label: string; emoji: string }> = [
  { label: 'Mountains', emoji: '🏔️' }, { label: 'Forest', emoji: '🌲' }, { label: 'Lake/Reservoir', emoji: '🏞️' },
  { label: 'River', emoji: '💧' }, { label: 'View', emoji: '🌄' }, { label: 'Meadow', emoji: '🌼' }, { label: 'Sunset', emoji: '🌅' },
];

// State (krajina) — lokálna kópia ADD_COUNTRY_OPTIONS/ISO2_LABEL (PackMap.tsx:117-121),
// needituje sa a nič z neho nie je exportované, rovnaká duplikačná konvencia ako vyššie.
const COUNTRY_OPTIONS = ['sk', 'cz', 'at', 'hu', 'pl', 'de', 'ch', 'it', 'si', 'fr'] as const;
const COUNTRY_LABEL: Record<string, string> = {
  sk: 'Slovakia', cz: 'Czechia', at: 'Austria', hu: 'Hungary', pl: 'Poland',
  de: 'Germany', ch: 'Switzerland', it: 'Italy', si: 'Slovenia', fr: 'France',
};

// Počiatočná prázdna geometria — `defaultKindFor(activity,'log')` je vždy TABUĽKOVÝ default
// z ACTIVITY_GEOMETRY (nie najvoľnejší ako pri pláne — §5: log = „čo si skutočne prešiel").
function emptyGeometryFor(activity: string): TripGeometry {
  const kind = defaultKindFor(activity, 'log');
  if (kind === 'point') return { kind: 'point', center: undefined as unknown as LatLngTuple };
  if (kind === 'area') return { kind: 'area', center: undefined as unknown as LatLngTuple, radiusM: 0 };
  return { kind: 'route', path: [], snapped: false };
}

// Fotky — base64, lokálna kópia optimizePhoto/handleAddPhotos (PackMap.tsx ~1621-1663).
// Vlna 2 preklopí na Cloudinary upload (§9 zadania „Fotky ... ako dnes, base64").
const MAX_PHOTOS = 10;
function optimizePhoto(file: File, maxDim = 1280, quality = 0.72): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }
      ctx.drawImage(img, 0, 0, w, h);
      try { resolve(canvas.toDataURL('image/jpeg', quality)); } catch { resolve(null); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// TRIP PACK — rovnaký lokálny wrapper ako AddTripPlan.tsx `CompanionAvatarsOnly` (§4.3 riadok 8
// „rovnaký ako v pláne"). CompanionPicker sa needituje (§4.2/§14), takže je to znova len scoped
// CSS obal nad tou istou komponentou — CompanionAvatarsOnly z AddTripPlan.tsx nie je exportovaná,
// preto lokálna kópia (`.atl-` prefix, aby sa CSS nebilo s `.att-` variantom, ak by obe niekedy
// žili v DOM naraz).
function CompanionAvatarsOnly(props: {
  myDogs: { id: string; name: string; photo?: string | null }[];
  selected: Companion[];
  onChange: (next: Companion[]) => void;
}) {
  return (
    <div className="atl-companions">
      <style>{COMPANION_CSS}</style>
      <CompanionPicker {...props} />
    </div>
  );
}

export function AddTripLog({ allTrails, authorName, myDogs, onSubmit, onClose, placeholderFor, mapRef, drawBar, seedPoint, onReadyToDraw, owns = true }: AddTripLogProps) {
  // ⚠️ Tento súbor NEBOL preložený vôbec — `t` v ňom doteraz znamenalo lokálnu premennú
  // (text hrozby, položka tagu). Obe sú premenované, inak by prekladač zmizol pod nimi
  // a `t('...')` by volalo string.
  const t = useT();
  // ── krok 1: aktivita ('' = ešte nevybraná, formulár skrytý) ───────────────────────────────
  const [activity, setActivity] = useState('');
  const [geometry, setGeometry] = useState<TripGeometry>({ kind: 'route', path: [], snapped: false });

  // ── formulár (krok 2) ─────────────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [dontRemember, setDontRemember] = useState(false);
  // MULTIDAY (Matej 2026-07-29, živý test) — journey je VŽDY viacdňová (End date rovno viditeľné,
  // žiadny toggle); ostatné aktivity multi-day vôbec nemajú, len odkaz naspäť na Journey (§1 popis
  // pri `atl-row2`/hint nižšie).
  const [dateEnd, setDateEnd] = useState('');
  const [countryOverride, setCountryOverride] = useState('');
  const [regionOverride, setRegionOverride] = useState<'' | 'W' | 'C' | 'E'>('');
  const [crowd, setCrowd] = useState<'' | Crowd>('');
  const [diff, setDiff] = useState<'' | 'Easy' | 'Moderate' | 'Hard' | 'Odyssey'>('');
  const [terrain, setTerrain] = useState('');
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [note, setNote] = useState('');
  const [hazards, setHazards] = useState<Set<string>>(new Set());
  const [customHazardOpen, setCustomHazardOpen] = useState(false);
  const [customHazardText, setCustomHazardText] = useState('');
  const [crew, setCrew] = useState<Companion[]>([]);
  /**
   * VIDITEĽNOSŤ PLÁNU — pole z bývalého `AddTripPlan`. Konzervatívny default: kým člen
   * výslovne nezvolí „hľadám svorku", plán je súkromný.
   */
  const [visibility, setVisibility] = useState<'private' | 'open'>('private');
  const [paws, setPaws] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoNote, setPhotoNote] = useState('');
  // TITULNÁ FOTKA (Matej 2026-07-29) — index do `photos` + zvislé ťažisko výrezu (0-100%),
  // viď addTripModel.ts komentár pri `coverIndex`/`coverY`. Default = prvá fotka, stred.
  const [coverIndex, setCoverIndex] = useState(0);
  const [coverY, setCoverY] = useState(50);
  const [submitError, setSubmitError] = useState('');
  const [dupConfirmed, setDupConfirmed] = useState(false);
  const [showDupWarning, setShowDupWarning] = useState(false);
  // JOURNEY = výber z magistrál (nie kreslenie) — existingTripId nastaví pickJourney() nižšie;
  // drawManually = únik pre magistrálu, ktorá v HERO_JOURNEYS nie je evidovaná.
  const [existingTripId, setExistingTripId] = useState<string | undefined>(undefined);
  const [journeyFilter, setJourneyFilter] = useState('');
  const [drawManually, setDrawManually] = useState(false);

  // živé km/prevýšenie zapisujeme do draftu LEN PRI SUBMITE (kontrakt §2 „nie priebežne" — inak
  // by autosave/re-render bežal na každý klik pri kreslení).
  const metricsRef = useRef<{ km: number; ascentM: number | null; points: number }>({ km: 0, ascentM: null, points: 0 });
  const photoInputRef = useRef<HTMLInputElement>(null);

  // aktivita mení povolené druhy geometrie — ak aktuálny kind už nesedí, resetni na nový default.
  useEffect(() => {
    if (!activity) return;
    const allowed = allowedKindsFor(activity);
    setGeometry((prev) => (allowed.includes(prev.kind) ? prev : emptyGeometryFor(activity)));
  }, [activity]);

  const pickActivity = (id: string) => {
    setActivity(id);
    setExistingTripId(undefined);
    setDrawManually(false);
    setJourneyFilter('');
    // ZASIATY VÝLET (rez C): bod spod prsta je prvá kotva a ide sa rovno kresliť.
    // `emptyGeometryFor` by ho zahodilo, preto je táto vetva PRED ním, nie za.
    const empty = emptyGeometryFor(id);
    if (seedPoint) {
      const p: LatLngTuple = [seedPoint.lat, seedPoint.lon];
      setGeometry(
        empty.kind === 'route'
          ? { kind: 'route', path: [p], snapped: false }
          : empty.kind === 'point'
            ? { kind: 'point', center: p }
            : { kind: 'area', center: p, radiusM: 1500 },
      );
      onReadyToDraw?.();
      return;
    }
    setGeometry(empty);
    // NAJPRV MAPA, POTOM FORMULÁR (Matej 2026-08-22: „po kliknutí na hike je na mobile vidno
    // textové polia a hore tlačítko ísť na mapu… potrebujeme to prehodiť").
    // `onReadyToDraw` dostáva LEN mobilná kópia formulára (PackMap.tsx `.trp-madd`), takže
    // podmienka na šírku sem nepatrí — desktop má mapu vedľa panela a prehadzovať nemá čo.
    // MAGISTRÁLA je výnimka: tam sa najprv vyberá existujúca trasa zo zoznamu (kreslí sa až
    // po „nakreslím ručne"), takže odkrytá mapa by ukazovala prázdno a schovala by voľbu.
    if (id !== 'journey') onReadyToDraw?.();
  };

  // Výber magistrály — zdedí geometriu 1:1 (§2 zadania), km/ascent idú rovno do metricsRef
  // (GeometryPicker sa v tomto kroku nerenderuje, takže onMetrics nepribehne).
  const journeyList = useMemo(() => {
    const q = journeyFilter.trim().toLowerCase();
    if (!q) return HERO_JOURNEYS;
    return HERO_JOURNEYS.filter((j) => j.name.toLowerCase().includes(q));
  }, [journeyFilter]);
  const pickJourney = (j: Journey) => {
    setExistingTripId(j.id);
    setName(j.name);
    setGeometry({ kind: 'route', path: j.path, snapped: true });
    metricsRef.current = { km: parseFloat(j.km) || 0, ascentM: j.ascentM ?? j.journey.ascentM ?? null, points: j.path.length };
  };
  const drawInstead = () => {
    setDrawManually(true);
    setExistingTripId(undefined);
    setGeometry(emptyGeometryFor(activity));
  };

  const isHikeLike = HIKE_LIKE.has(activity);
  const act = ACT_BY_ID[activity];
  // titulná fotka = vybraná (coverIndex), fallback na placeholder kým nie je nahraná žiadna.
  const effCoverIndex = photos.length > 0 ? Math.min(coverIndex, photos.length - 1) : 0;
  const heroPhoto = photos[effCoverIndex] ?? placeholderFor([act?.dataId ?? 'hike'], name.trim() || activity || 'trip');

  // MULTIDAY → journey gate (Matej 2026-07-29 živý test): journey je pri definícii vždy viacdňová
  // (End date je súčasť kroku, nie voliteľná nadstavba) — platná (submitovateľná) je, keď End date
  // je vyplnený a je neskôr než Date. Km limit padol (Matej: viacdňový výlet so psom môže mať aj
  // 30 km, km nerobí trip viacdňovým).
  /**
   * ⏳ O TYPE VÝLETU ROZHODUJE DÁTUM (Matej 22. 8., rez C).
   *
   * Voľba „prešli sme / chystáme sa" ZANIKLA — bola to otázka, na ktorú odpoveď už ležala
   * o tri polia nižšie. Minulý dátum = zápis prejdeného, budúci = plán. `dontRemember`
   * („neviem kedy") ostáva minulosťou; nepamätať si dátum výletu, ktorý sa ešte nekonal,
   * nedáva zmysel.
   *
   * Porovnáva sa DEŇ, nie okamih: výlet naplánovaný na dnes večer je ešte plán a `new Date()`
   * s časom by ho o polnoci ticho preklopil na zápis.
   */
  const todayISO = new Date().toISOString().slice(0, 10);
  const isPlan = !dontRemember && !!date && date > todayISO;

  /**
   * TVAR NAKRESLENEJ TRASY do `<polyline>` — normalizovaný do štvorca 100×100.
   *
   * Zámerne sa NEZACHOVÁVA pomer strán (`preserveAspectRatio="none"`): pás je široký
   * a nízky, takže vernou projekciou by sa zvislá trasa scvrkla na čiaru cez tri pixely.
   * Toto nie je mapa, je to podpis výletu — ide o to, že tam niečo je a rastie.
   *
   * Zvislá os sa preklápa (`maxLat` hore): v zemepisných súradniciach rastie šírka nahor,
   * v SVG rastie `y` nadol. Bez toho by bol každý výrez zrkadlovo prevrátený.
   */
  const routeShape = useMemo(() => {
    const line = geometry.kind === 'route' ? (geometry.snapPath ?? geometry.path) : [];
    if (line.length < 2) return null;
    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
    for (const [la, lo] of line) {
      if (la < minLat) minLat = la; if (la > maxLat) maxLat = la;
      if (lo < minLon) minLon = lo; if (lo > maxLon) maxLon = lo;
    }
    // Trasa dlhá na jednu os (rovná čiara) by delila nulou — vtedy ju položíme do stredu.
    const spanLat = maxLat - minLat || 1e-9;
    const spanLon = maxLon - minLon || 1e-9;
    const pad = 8;
    const span = 100 - pad * 2;
    return line
      .map(([la, lo]) => {
        const x = maxLon === minLon ? 50 : pad + ((lo - minLon) / spanLon) * span;
        const y = maxLat === minLat ? 50 : pad + ((maxLat - la) / spanLat) * span;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [geometry]);

  // ── AUTOSAVE ROZPRACOVANÉHO VÝLETU (rez D) ──────────────────────────────────────────
  // `readAddDraft`/`writeAddDraft` boli napísané už vo vlne 1 a NIKTO ich nevolal, takže
  // zatvorenie formulára v polovici znamenalo stratu všetkého vrátane nakreslenej trasy —
  // teda toho, čo stálo najviac práce. Ukladá sa TVAR DRAFTU, nie jednotlivé polia:
  // obnova je potom jedno priradenie a nie dvadsať setterov, ktoré sa rozídu s prvým
  // pribudnutým poľom.
  //
  // ⚠️ Fotky sa do zálohy NEUKLADAJÚ. Sú to base64 dataURL a niekoľko fotiek prekročí
  // kvótu localStorage — zápis by padol a s ním by sa stratila aj trasa, teda presne to,
  // čo má autosave chrániť. Radšej vrátiť výlet bez fotiek než nevrátiť nič.
  const restoredRef = useRef(false);
  const [restored, setRestored] = useState<AddTripDraft | null>(() => {
    if (!owns) return null;
    const d = readAddDraft();
    // Prázdny náčrt nemá čo obnovovať — ponuka „pokračovať" by bola falošný sľub.
    return d && (d.name || (d.geometry?.kind === 'route' && d.geometry.path?.length)) ? d : null;
  });
  const restore = () => {
    if (!restored) return;
    restoredRef.current = true;
    setActivity(restored.activity || '');
    setName(restored.name || '');
    setDate(restored.date || '');
    setDateEnd(restored.dateEnd || '');
    setDontRemember(restored.dateKind === 'flexible');
    if (restored.geometry) setGeometry(restored.geometry);
    if (restored.country) setCountryOverride(restored.country);
    if (restored.region) setRegionOverride(restored.region);
    // Draft nesie `crowd`/`diff` ako voľnejší typ (ide cez JSON) — zúžime ich pri obnove,
    // inak by sa do stavu dostala hodnota, ktorú `<select>` nepozná, a pole by ostalo prázdne.
    if (restored.crowd && (CROWDS as readonly string[]).includes(restored.crowd)) setCrowd(restored.crowd as Crowd);
    if (restored.diff && (DIFF_OPTIONS as readonly string[]).includes(restored.diff)) setDiff(restored.diff as typeof diff);
    if (restored.surface?.[0]) setTerrain(restored.surface[0]);
    if (restored.tags) setTags(new Set(restored.tags));
    if (restored.hazards) setHazards(new Set(restored.hazards));
    if (restored.crew) setCrew(restored.crew);
    if (restored.paws) setPaws(restored.paws);
    if (restored.note) setNote(restored.note);
    if (restored.visibility) setVisibility(restored.visibility);
    setRestored(null);
  };
  const discardRestore = () => { clearAddDraft(); setRestored(null); };

  // Trasa je hotová = dá sa z nej nakresliť čiara (2 kotvy), resp. bod/oblasť má stred.
  const geoDone = geometry.kind === 'route' ? geometry.path.length >= 2 : !!geometry.center;
  const isMultiDay = activity === 'journey' && !!dateEnd && dateEnd > date;
  const journeyIssue = activity === 'journey' && !isMultiDay;

  // §6: krajina/región auto z geometrie (trailCountry/trailWCE), manuálny override možný.
  const anchor: LatLngTuple[] = geometry.kind === 'route'
    ? (geometry.snapPath ?? geometry.path)
    : (geometry.center ? [geometry.center] : []);
  const detectedCountry = anchor.length > 0 ? trailCountry({ path: anchor }) : 'sk';
  const effCountry = countryOverride || detectedCountry;
  const countryOpts = (COUNTRY_OPTIONS as readonly string[]).includes(effCountry)
    ? COUNTRY_OPTIONS
    : [effCountry, ...COUNTRY_OPTIONS];
  // trailWCE() chce HeroTrail — dávame mu len `path`, rovnaký vzor ako trailCountry() vyššie
  // (loosely typed) používa AddTripPlan.tsx; trailWCE je prísnejšie typovaná, preto cast.
  const detectedRegion = anchor.length > 0 ? trailWCE({ path: anchor } as unknown as HeroTrail) : null;
  const effRegion = regionOverride || detectedRegion || '';

  const toggleSet = (set: Set<string>, setSet: (n: Set<string>) => void, v: string) => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v); else n.add(v);
    setSet(n);
  };
  const addCustomHazard = () => {
    const txt = customHazardText.trim();
    if (!txt) return;
    setHazards((prev) => new Set(prev).add(txt));
    setCustomHazardText('');
    setCustomHazardOpen(false);
  };

  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    const imgs = picked.filter((f) => f.type.startsWith('image/'));
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) { setPhotoNote(`Max ${MAX_PHOTOS} photos reached.`); return; }
    const take = imgs.slice(0, room);
    const results = await Promise.all(take.map((f) => optimizePhoto(f)));
    const ok = results.filter(Boolean) as string[];
    if (ok.length) setPhotos((prev) => [...prev, ...ok].slice(0, MAX_PHOTOS));
    const notes: string[] = [];
    if (imgs.length > room) notes.push(`only ${room} added (max ${MAX_PHOTOS})`);
    const failed = results.length - ok.length;
    if (failed > 0) notes.push(`${failed} couldn't be read — use JPG/PNG (HEIC not supported)`);
    if (picked.length > imgs.length) notes.push(`${picked.length - imgs.length} skipped (not an image)`);
    setPhotoNote(notes.join(' · '));
  };
  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setCoverIndex((prev) => (i === prev ? 0 : i < prev ? prev - 1 : prev));
  };

  const draft = useMemo<LogDraft>(() => {
    const now = Date.now();
    return {
      id: `${isPlan ? 'plan' : 'log'}-${now}`,
      existingTripId,
      state: isPlan ? 'planned' : 'walked',
      // Plán nejde cez schvaľovaciu frontu (§4.3 platí len pre walked) — objaví sa hneď.
      // Pri zápise je to placeholder, finálna hodnota sa dorátava pri submite (missingFields).
      approval: isPlan ? 'approved' : 'draft',
      visibility: isPlan ? visibility : undefined,
      name: name.trim(),
      activity,
      geometry,
      country: effCountry,
      region: effCountry === 'sk' && effRegion ? (effRegion as 'W' | 'C' | 'E') : undefined,
      dateKind: dontRemember ? 'flexible' : 'exact',
      date: dontRemember ? undefined : (date || undefined),
      dateEnd: !dontRemember && isMultiDay ? dateEnd : undefined,
      crew,
      diff: !isPlan && isHikeLike && diff ? diff : undefined,
      surface: !isPlan && isHikeLike && terrain ? [terrain] : undefined,
      crowd: !isPlan && crowd ? crowd : undefined,
      tags: tags.size > 0 ? Array.from(tags) : undefined,
      hazards: !isPlan && hazards.size > 0 ? Array.from(hazards) : undefined,
      paws: !isPlan && paws > 0 ? paws : undefined,
      photos: !isPlan && photos.length > 0 ? photos : undefined,
      coverIndex: !isPlan && photos.length > 0 ? effCoverIndex : undefined,
      coverY,
      note: note.trim() || undefined,
      authorName,
      createdAt: now,
      updatedAt: now,
    };
  }, [name, activity, geometry, effCountry, effRegion, dontRemember, date, isMultiDay, dateEnd, crew, isHikeLike, diff, terrain, crowd, tags, hazards, paws, photos, effCoverIndex, coverY, note, authorName, existingTripId, isPlan, visibility]);

  // §4.3: toSubmit blokuje odoslanie úplne; toApprove (len walked) rozhoduje draft vs pending.
  const missing = missingFields(draft);
  const canSubmit = missing.toSubmit.length === 0 && !journeyIssue;
  const finalApproval: ApprovalStatus = missing.toApprove.length === 0 ? 'pending' : 'draft';

  // §5.3 poistka — pýta sa, nezablokuje. `onPickExisting` (živí duchovia počas kreslenia) tu nie
  // je zapojený (nie je v props kontrakte tohto komponentu) — len submit-time kontrola.
  // existujúca magistrála je zámerný presný repeat, nie kandidát na duplicitu — nepýtať sa.
  const dup = useMemo(() => (existingTripId ? null : findDuplicate(geometry, allTrails)), [existingTripId, geometry, allTrails]);

  // Priebežné ukladanie. `draft` je `useMemo`, takže effect beží len keď sa naozaj niečo
  // zmenilo — nie na každý render. Prázdny formulár sa neukladá, inak by otvorenie a
  // zatvorenie ADD flow bez jediného písmena prepísalo zálohu skutočnej rozrobenej práce.
  useEffect(() => {
    if (!owns) return;    // druhá, neviditeľná kópia formulára do zálohy nesiaha
    if (restored) return; // ponuka na obnovu je na obrazovke — nezmaž, čo ponúkame
    const hasSomething = !!draft.name || (draft.geometry?.kind === 'route' && draft.geometry.path.length > 0);
    if (!hasSomething) return;
    const { photos: _photos, ...withoutPhotos } = draft;
    writeAddDraft(withoutPhotos as AddTripDraft);
  }, [draft, restored, owns]);

  const doSubmit = () => {
    setSubmitError('');
    const finalDraft: AddTripDraft = {
      ...draft,
      approval: finalApproval,
      km: metricsRef.current.km > 0 ? Number(metricsRef.current.km.toFixed(1)) : undefined,
      ascentM: metricsRef.current.ascentM ?? undefined,
    };
    const ok = onSubmit(finalDraft);
    if (!ok) { setSubmitError("Couldn't save — storage might be full. Remove something and try again."); return; }
    // Odoslané = už to nie je rozpracované. Bez tohto by sa pri ďalšom otvorení ponúkalo
    // obnoviť výlet, ktorý je dávno v zozname.
    clearAddDraft();
    setShowDupWarning(false);
  };
  const handleSubmit = () => {
    if (!canSubmit) return;
    if (dup && !dupConfirmed) { setShowDupWarning(true); return; }
    doSubmit();
  };
  const confirmDuplicate = () => { setDupConfirmed(true); doSubmit(); };

  return (
    <div className="atl-log">
      <style>{LOG_CSS}</style>
      <style>{ROUTE_HERO_CSS}</style>
      <style>{RESTORE_CSS}</style>
      <div className="atl-log-head">
        <button
          type="button"
          className="atl-log-back"
          onClick={() => (activity ? setActivity('') : onClose())}
          aria-label="Back"
        >
          ←
        </button>
        {/* Nadpis sleduje dátum — kým je v budúcnosti, formulár je PLÁN a „Log a trip"
            by hovoril o niečom, čo sa ešte nestalo. */}
        <div className="atl-log-title">
          {!activity ? t('pack.addTrip.log.titleActivity') : t(isPlan ? 'pack.addTrip.log.titlePlan' : 'pack.addTrip.log.title')}
        </div>
      </div>

      {/* PONUKA NA OBNOVU — záloha, o ktorej sa človek nedozvie, je len zabraté miesto.
          Stojí PRED výberom aktivity, lebo obnova ju nastaví sama. Zahodenie je vedomé:
          automaticky sa nemaže nič, čo človek nakreslil. */}
      {restored && (
        <div className="atl-restore">
          <p className="atl-restore-txt">
            {t('pack.addTrip.log.restoreLead', { name: restored.name || t('pack.addTrip.log.restoreUnnamed') })}
          </p>
          <div className="atl-restore-btns">
            <button type="button" className="atl-toggle-btn" onClick={discardRestore}>{t('pack.addTrip.log.restoreDiscard')}</button>
            <button type="button" className="atl-toggle-btn on" onClick={restore}>{t('pack.addTrip.log.restoreResume')}</button>
          </div>
        </div>
      )}

      {!activity && !restored && (
        <div className="atl-tiles">
          {ACTIVITIES.map((a) => (
            <button key={a.id} type="button" className="atl-tile" onClick={() => pickActivity(a.id)}>
              <span className="atl-tile-emoji">{a.emoji}</span>
              <span className="atl-tile-label">{a.label}</span>
            </button>
          ))}
        </div>
      )}

      {!!activity && !restored && (
        <>
          <div className="atl-log-body">
            {/* HORE PATRÍ TO, ČO ČLOVEK PRÁVE ROBÍ — nie stock les.
                Kým nie je nahraná fotka, ukazuje sa ŽIVÝ VÝREZ NAKRESLENEJ TRASY: rastie
                s každým bodom a je to jediný obrázok, ktorý o tomto konkrétnom výlete
                niečo hovorí. Zástupná fotografia sa vracia až vtedy, keď ešte nie je
                nakreslené nič — vtedy je to len výplň, nie tvrdenie. */}
            {photos.length === 0 && routeShape ? (
              <div className="atl-photo atl-photo--route">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <polyline points={routeShape} />
                </svg>
                <span className="atl-photo-badge">{t('pack.addTrip.log.routeSoFar')}</span>
              </div>
            ) : (
              <div
                className="atl-photo"
                style={{
                  backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.45)), url('${heroPhoto}')`,
                  backgroundPosition: photos.length > 0 ? `center ${coverY}%` : undefined,
                }}
              >
                {photos.length === 0 && <span className="atl-photo-badge">{t('pack.addTrip.log.addPhotoBelow')}</span>}
              </div>
            )}

            {/* 1. Name */}
            <div className="atl-field">
              <label>{t('pack.addTrip.log.name')}</label>
              <input className="atl-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunset ridge walk" />
            </div>

            {/* 2. Date · End date (journey only, always visible) · Don't remember */}
            <div className={activity === 'journey' && !dontRemember ? 'atl-row3' : 'atl-row2'}>
              <div className="atl-field">
                <label>{t('pack.addTrip.log.date')}</label>
                <input
                  type="date"
                  className="atl-input"
                  value={date}
                  disabled={dontRemember}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              {activity === 'journey' && !dontRemember && (
                <div className="atl-field">
                  <label>End date</label>
                  <input
                    type="date"
                    className="atl-input"
                    value={dateEnd}
                    min={date || undefined}
                    onChange={(e) => setDateEnd(e.target.value)}
                  />
                </div>
              )}
              <div className="atl-field">
                <label>&nbsp;</label>
                <button
                  type="button"
                  className={`atl-toggle-btn${dontRemember ? ' on' : ''}`}
                  onClick={() => {
                    setDontRemember((v) => {
                      const next = !v;
                      if (next) setDateEnd('');
                      return next;
                    });
                    setDate('');
                  }}
                >
                  Don't remember
                </button>
              </div>
            </div>
            {activity !== 'journey' && (
              <p className="atl-daterange-hint">
                Were you out for more than one day? Go back and pick{' '}
                <button type="button" className="atl-journey-link" onClick={() => setActivity('')}>Journey</button>.
              </p>
            )}

            {/* 3. State · Region (SK only) · Crowd */}
            <div className="atl-row3">
              <div className="atl-field">
                <label>State</label>
                <select className="atl-input" value={effCountry} onChange={(e) => setCountryOverride(e.target.value)}>
                  {countryOpts.map((c) => <option key={c} value={c}>{flagEmoji(c)} {COUNTRY_LABEL[c] ?? c.toUpperCase()}</option>)}
                </select>
              </div>
              {effCountry === 'sk' && (
                <div className="atl-field">
                  <label>Region</label>
                  <select className="atl-input" value={effRegion} onChange={(e) => setRegionOverride(e.target.value as '' | 'W' | 'C' | 'E')}>
                    <option value="">— select —</option>
                    <option value="W">West</option>
                    <option value="C">Center</option>
                    <option value="E">East</option>
                  </select>
                </div>
              )}
              {/* Ruch, náročnosť, povrch, hodnotenie a fotky sú SPRÁVY Z CESTY — na výlete,
                  ktorý sa ešte nekonal, sa nedajú vyplniť pravdivo. Preto sa na pláne
                  nezobrazujú (a do draftu sa nedostanú, viď `isPlan` pri jeho stavbe). */}
              {!isPlan && (
                <div className="atl-field">
                  <label>{t('pack.addTrip.log.crowd')}</label>
                  <select className="atl-input" value={crowd} onChange={(e) => setCrowd(e.target.value as '' | Crowd)}>
                    <option value="">{t('pack.addTrip.log.selectPlaceholder')}</option>
                    {CROWDS.map((c) => <option key={c} value={c}>{CROWD_EMOJI[c]} {c}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* 4. (hiking/journey only) Difficulty · Terrain */}
            {isHikeLike && !isPlan && (
              <div className="atl-row2">
                <div className="atl-field">
                  <label>Difficulty</label>
                  <select className="atl-input" value={diff} onChange={(e) => setDiff(e.target.value as typeof diff)}>
                    <option value="">Select…</option>
                    {DIFF_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="atl-field">
                  <label>Terrain</label>
                  <select className="atl-input" value={terrain} onChange={(e) => setTerrain(e.target.value)}>
                    <option value="">Select…</option>
                    {TERRAIN_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* 5. Tags */}
            <div className="atl-field">
              <label>{t('pack.addTrip.log.tags')}</label>
              <div className="atl-chips">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    className={`atl-chip${tags.has(tag.label) ? ' on' : ''}`}
                    onClick={() => toggleSet(tags, setTags, tag.label)}
                  >
                    <span className="atl-chip-emoji">{tag.emoji}</span><span className="atl-chip-label">{tag.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Short note */}
            <div className="atl-field">
              <label>{t(isPlan ? 'pack.addTrip.plan.details' : 'pack.addTrip.log.story')}</label>
              <textarea className="atl-input atl-textarea" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any tips, highlights, warnings…" />
            </div>

            {/* 7. Hazards + custom — len pri zápise (viď komentár pri Crowd) */}
            {!isPlan && (
            <div className="atl-field">
              <label>Any hazards? <span className="atl-field-hint">(optional — helps the pack)</span></label>
              <div className="atl-chips">
                {HAZARDS.map((h) => (
                  <button key={h} type="button" className={`atl-chip${hazards.has(h) ? ' on' : ''}`} onClick={() => toggleSet(hazards, setHazards, h)}>
                    <span className="atl-chip-emoji">{HAZARD_EMOJI[h]}</span><span className="atl-chip-label">{h}</span>
                  </button>
                ))}
                {Array.from(hazards).filter((h) => !(HAZARDS as string[]).includes(h)).map((h) => (
                  <button key={h} type="button" className="atl-chip on" onClick={() => toggleSet(hazards, setHazards, h)}>
                    <span className="atl-chip-emoji">⚠️</span><span className="atl-chip-label">{h}</span>
                  </button>
                ))}
                {!customHazardOpen && (
                  <button type="button" className="atl-chip atl-chip-add" onClick={() => setCustomHazardOpen(true)}>+ Add</button>
                )}
              </div>
              {customHazardOpen && (
                <div className="atl-custom-hazard">
                  <input
                    className="atl-input"
                    value={customHazardText}
                    onChange={(e) => setCustomHazardText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomHazard(); } }}
                    placeholder="Describe the hazard…"
                    autoFocus
                  />
                  <button type="button" className="atl-toggle-btn" onClick={addCustomHazard}>Add</button>
                </div>
              )}
            </div>
            )}

            {/* PLÁN — dve polia z bývalého `AddTripPlan`. Ukazujú sa len keď dátum leží
                v budúcnosti; vtedy naopak nedávajú zmysel hodnotenie a fotky vyššie. */}
            {isPlan && (
              <div className="atl-field">
                <label>{t('pack.addTrip.plan.visibility')}</label>
                <div className="atl-toggle-row" role="tablist" aria-label={t('pack.addTrip.plan.visibility')}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={visibility === 'private'}
                    className={`atl-toggle-btn${visibility === 'private' ? ' on' : ''}`}
                    onClick={() => setVisibility('private')}
                  >{t('pack.addTrip.plan.visibilityPrivate')}</button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={visibility === 'open'}
                    className={`atl-toggle-btn${visibility === 'open' ? ' on' : ''}`}
                    onClick={() => setVisibility('open')}
                  >{t('pack.addTrip.plan.visibilityOpen')}</button>
                </div>
                <p className="atl-field-hint" style={{ marginTop: 6 }}>
                  {t(visibility === 'private' ? 'pack.addTrip.plan.visibilityPrivateNote' : 'pack.addTrip.plan.visibilityOpenNote')}
                </p>
              </div>
            )}

            {/* 8. Trip pack */}
            <div className="atl-field">
              <label>{t('pack.addTrip.log.pack')}</label>
              <CompanionAvatarsOnly myDogs={myDogs} selected={crew} onChange={setCrew} />
            </div>

            {/* 9. Packs rating — len pri zápise (viď komentár pri Crowd) */}
            {!isPlan && (
            <div className="atl-field">
              <label>Rate this trip</label>
              <PawRating value={paws} onChange={setPaws} onDark size={26} />
            </div>
            )}

            {/* 10. Photos — len pri zápise */}
            {!isPlan && (
            <div className="atl-field">
              <label>Photos <span className="atl-field-hint">· {photos.length}/{MAX_PHOTOS} · auto-resized</span></label>
              <button
                type="button"
                className="atl-file-btn"
                onClick={() => photoInputRef.current?.click()}
                disabled={photos.length >= MAX_PHOTOS}
              >
                📷 Choose photos
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotos}
                disabled={photos.length >= MAX_PHOTOS}
                className="atl-file-input-hidden"
              />
              <p className="atl-field-hint" style={{ marginTop: 4 }}>JPG or PNG, up to {MAX_PHOTOS} photos.</p>
              {photoNote && <p className="atl-field-hint" style={{ marginTop: 4 }}>{photoNote}</p>}
              {photos.length > 0 && (
                <>
                  <div className="atl-photo-grid">
                    {photos.map((p, i) => (
                      <div
                        key={i}
                        className={`atl-photo-thumb${i === effCoverIndex ? ' cover' : ''}`}
                        style={{ backgroundImage: `url('${p}')` }}
                        onClick={() => setCoverIndex(i)}
                        role="button"
                        tabIndex={0}
                        aria-label={i === effCoverIndex ? 'Cover photo' : 'Set as cover photo'}
                      >
                        {i === effCoverIndex && <span className="atl-photo-cover-badge">COVER</span>}
                        <button type="button" onClick={(e) => { e.stopPropagation(); removePhoto(i); }} aria-label="Remove photo">×</button>
                      </div>
                    ))}
                  </div>
                  <div className="atl-cover-crop">
                    <label>Cover photo vertical position</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={coverY}
                      onChange={(e) => setCoverY(Number(e.target.value))}
                      className="atl-cover-slider"
                    />
                  </div>
                </>
              )}
            </div>
            )}

            {/* 11. Where — journey = výber z magistrál, nie kreslenie (§1/§2 zadania); ostatné
                aktivity a "Not here?" únik z journey kreslia ako doteraz. */}
            <div className="atl-field">
              {/* ODŠKRTNUTÁ TRASA (Matej 2026-08-22: „po kliknutí hotovo sa odcheckne TRASA
                  a už len vyplniť formulár"). Na mobile sa kreslí PRED formulárom, takže sem
                  sa človek vracia s hotovou trasou — bez potvrdenia by nevedel, či sa to, čo
                  nakreslil, vôbec zapísalo. Fialová je farba trasy (svetelný meč), nie nová
                  farba stavu. */}
              <label>
                {t('pack.addTrip.log.where')}
                {geoDone && (
                  <span
                    style={{
                      marginLeft: 8, padding: '2px 9px', borderRadius: 999,
                      background: 'rgba(122,47,191,0.22)',
                      border: '1px solid rgba(179,107,255,0.55)',
                      color: '#E9D8FF', fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em',
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}
                  >
                    ✓ {t('pack.addTrip.geo.routeDone')}
                  </span>
                )}
              </label>
              {activity === 'journey' && !drawManually ? (
                <div className="atl-journeys">
                  <input
                    className="atl-input"
                    value={journeyFilter}
                    onChange={(e) => setJourneyFilter(e.target.value)}
                    placeholder="Search trails…"
                  />
                  <div className="atl-journey-list">
                    {journeyList.map((j) => (
                      <button
                        key={j.id}
                        type="button"
                        className={`atl-journey-item${existingTripId === j.id ? ' on' : ''}`}
                        onClick={() => pickJourney(j)}
                      >
                        <span className="atl-journey-name">{j.name}</span>
                        <span className="atl-journey-meta">{j.km} km · {j.journey.days}d · {j.journey.start} → {j.journey.end}</span>
                      </button>
                    ))}
                    {journeyList.length === 0 && <p className="atl-field-hint" style={{ padding: '6px 4px' }}>No trails match.</p>}
                  </div>
                  <button type="button" className="atl-journey-link" onClick={drawInstead}>
                    Not here? Draw it on the map
                  </button>
                </div>
              ) : (
                <GeometryPicker
                  value={geometry}
                  onChange={setGeometry}
                  activity={activity}
                  mode="log"
                  allTrails={allTrails}
                  onMetrics={(m) => { metricsRef.current = m; }}
                  mapRef={mapRef}
                  drawBar={drawBar}
                />
              )}
            </div>
          </div>

          <div className="atl-log-foot">
            {showDupWarning && dup && (
              <div className="atl-dupwarn">
                <p>This route looks similar to an existing trip — <b>{dup.name}</b>. Log it anyway?</p>
                <div className="atl-dupwarn-btns">
                  <button type="button" className="atl-toggle-btn" onClick={() => setShowDupWarning(false)}>Cancel</button>
                  <button type="button" className="atl-toggle-btn on" onClick={confirmDuplicate}>Log it anyway</button>
                </div>
              </div>
            )}
            <button type="button" className="btn-gold" disabled={!canSubmit} onClick={handleSubmit}>
              {t(isPlan ? 'pack.addTrip.log.submitPlan' : 'pack.addTrip.log.submit')}
            </button>
            {!canSubmit && missing.toSubmit.length > 0 && <p className="atl-log-hint">{t('pack.addTrip.log.missing', { fields: missing.toSubmit.join(', ') })}</p>}
            {!canSubmit && journeyIssue && (
              <p className="atl-log-hint">Journey needs a multi-day trip — add an end date after the start date.</p>
            )}
            {canSubmit && missing.toApprove.length > 0 && (
              <p className="atl-log-hint">Will be saved as draft — finish later: {missing.toApprove.join(', ')}</p>
            )}
            {submitError && <p className="atl-log-error">{submitError}</p>}
          </div>
        </>
      )}
    </div>
  );
}

const RESTORE_CSS = `
.atl-restore{margin:16px 20px;padding:14px 16px;border:1px solid ${T.onDarkBorder};border-radius:12px;background:rgba(245,240,228,0.04);}
.atl-restore-txt{margin:0 0 12px;font-family:${FONT_UI};font-size:13px;line-height:1.5;color:${T.onDark};}
.atl-restore-btns{display:flex;gap:8px;}
.atl-restore-btns .atl-toggle-btn{flex:1 1 0;}
`;

const ROUTE_HERO_CSS = `
/* Výrez trasy namiesto zástupnej fotky. Papyrus sem NEPATRÍ — formulár je tmavý povrch
   Portalu, takže podklad je ten istý sklenený tón ako zvyšok panela. */
.atl-photo--route{position:relative;display:block;background:linear-gradient(160deg,#1b1409,#0d0a06);border:1px solid ${T.onDarkBorder};}
.atl-photo--route svg{position:absolute;inset:0;width:100%;height:100%;}
/* Popisok dole, nie hore: trasa začína v ľavom hornom rohu výrezu, takže tam,
   kde badge sedí pri fotke, prekrýva prvý bod. */
.atl-photo--route .atl-photo-badge{top:auto;bottom:10px;}
.atl-photo--route polyline{fill:none;stroke:#F5C73D;stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;filter:drop-shadow(0 0 6px rgba(245,199,61,0.45));}
`;

const COMPANION_CSS = `
.atl-companions .comm-comp-selected{gap:8px;}
.atl-companions .comm-comp-chip{padding:3px;gap:4px;position:relative;}
.atl-companions .comm-comp-chip b{
  position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);
  white-space:nowrap;background:rgba(6,5,3,0.95);border:1px solid ${T.onDarkBorder};
  padding:4px 9px;border-radius:6px;font-family:${FONT_UI};font-size:11px;font-weight:500;
  color:${T.onDark};opacity:0;pointer-events:none;transition:opacity .15s ease;z-index:6;
}
.atl-companions .comm-comp-chip:hover b{opacity:1;}
.atl-companions .comm-comp-pack{gap:8px;}
.atl-companions .comm-comp-dog{padding:3px;gap:0;position:relative;}
.atl-companions .comm-comp-dog span:not(.plus){
  position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);
  white-space:nowrap;background:rgba(6,5,3,0.95);border:1px solid ${T.onDarkBorder};
  padding:4px 9px;border-radius:6px;font-family:${FONT_UI};font-size:11px;font-weight:500;
  color:${T.onDark};opacity:0;pointer-events:none;transition:opacity .15s ease;z-index:6;
}
.atl-companions .comm-comp-dog:hover span:not(.plus),
.atl-companions .comm-comp-dog:focus span:not(.plus){opacity:1;}
.atl-companions .comm-comp-dog .plus{
  position:absolute;right:-3px;bottom:-3px;margin:0;background:${GOLD};color:${T.ink};
  width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:11px;line-height:1;
}
`;

// CTA (§14 LOCKED): .btn-gold — lokálna kópia (rovnaký vzor ako AddTripPlan.tsx, NotFound.tsx,
// DogShare.tsx, About.tsx — „canonical, scoped locally"). Gradient/border/shadow 1:1 zo
// SpiralLanding.css, tmavý povrch varianta.
const LOG_CSS = `
.atl-log{display:flex;flex-direction:column;height:100%;min-height:0;}
.atl-log-head{display:flex;align-items:center;gap:10px;padding:16px 20px 10px;flex-shrink:0;}
.atl-log-back{background:rgba(245,240,228,0.06);border:1px solid ${T.onDarkBorder};color:${T.onDark};width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:15px;line-height:1;}
.atl-log-back:hover{border-color:${GOLD};color:${GOLD};}
.atl-log-title{font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:${T.onDark};}
.atl-tiles{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:4px 20px 20px;}
.atl-tile{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 8px;border-radius:12px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};cursor:pointer;transition:border-color .15s ease,background .15s ease;}
.atl-tile:hover{border-color:${GOLD};background:rgba(201,154,63,0.10);}
.atl-tile-emoji{font-size:26px;line-height:1;}
.atl-tile-label{font-family:${FONT_UI};font-weight:500;font-size:11.5px;letter-spacing:.03em;color:${T.onDark};}
.atl-log-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:4px 20px 16px;display:flex;flex-direction:column;gap:14px;}
.atl-photo{flex:0 0 auto;position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,#1c2b1a,#0e1a0d);background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;border:1px solid ${T.onDarkBorder};}
.atl-photo-badge{font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#F5C73D;background:rgba(0,0,0,0.45);padding:8px 14px;border-radius:8px;border:1px solid rgba(201,154,63,0.5);}
.atl-field label{display:block;font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};margin-bottom:6px;}
.atl-field-hint{font-weight:400;text-transform:none;letter-spacing:0;opacity:.72;font-size:10.5px;font-family:${FONT_UI};color:${T.onDarkDim};}
.atl-input{width:100%;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:9px;padding:9px 11px;color:${T.onDark};font-family:${FONT_UI};font-size:12.5px;outline:0;}
.atl-input:focus{border-color:${GOLD};}
.atl-input::placeholder{color:${T.onDarkDim};}
.atl-input:disabled{opacity:.45;}
.atl-textarea{resize:vertical;font-family:${FONT_UI};}
.atl-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.atl-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}
.atl-toggle-btn{width:100%;font-family:${FONT_UI};font-weight:500;font-size:11px;letter-spacing:.03em;padding:8px 10px;border-radius:9px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};color:${T.onDarkDim};cursor:pointer;white-space:nowrap;}
.atl-toggle-btn.on{background:rgba(201,154,63,0.14);border-color:${GOLD};color:${T.onDark};}
.atl-daterange-hint{margin:-4px 0 0;font-family:${FONT_UI};font-weight:400;font-size:11px;line-height:1.4;color:${T.onDarkDim};}
.atl-journey-link{background:none;border:0;padding:0;margin:0;color:${GOLD};font-family:${FONT_UI};font-size:11px;font-weight:600;cursor:pointer;align-self:flex-start;}
.atl-journey-link:hover{text-decoration:underline;}
.atl-journeys{display:flex;flex-direction:column;gap:8px;}
.atl-journey-list{max-height:230px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;border:1px solid ${T.onDarkBorder};border-radius:10px;padding:6px;}
.atl-journey-item{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;text-align:left;padding:9px 11px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};cursor:pointer;}
.atl-journey-item:hover{border-color:${GOLD};}
.atl-journey-item.on{background:rgba(201,154,63,0.14);border-color:${GOLD};}
.atl-journey-name{font-family:${FONT_TITLE};font-weight:700;font-size:12.5px;letter-spacing:.02em;color:${T.onDark};}
.atl-journey-meta{font-family:${FONT_UI};font-weight:500;font-size:10.5px;letter-spacing:.02em;color:${T.onDarkDim};}
.atl-chips{display:flex;flex-wrap:wrap;gap:6px;}
.atl-chip{display:inline-flex;align-items:center;height:28px;font-family:${FONT_UI};font-weight:500;font-size:11px;letter-spacing:.02em;padding:0 10px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};color:${T.onDarkDim};cursor:pointer;}
.atl-chip.on{background:rgba(201,154,63,0.16);border-color:${GOLD};color:${T.onDark};}
.atl-chip-emoji{display:inline-flex;align-items:center;justify-content:center;width:15px;flex:0 0 15px;line-height:1;font-size:13px;margin-right:5px;}
.atl-chip-label{line-height:1;}
.atl-chip-add{border-style:dashed;}
.atl-custom-hazard{display:flex;gap:6px;margin-top:8px;}
.atl-custom-hazard .atl-toggle-btn{flex:0 0 auto;padding:9px 14px;}
.atl-file-btn{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.03em;padding:10px 12px;border-radius:11px;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};color:${T.onDark};cursor:pointer;}
.atl-file-btn:hover:not(:disabled){border-color:${GOLD};color:${GOLD};}
.atl-file-btn:disabled{opacity:.45;cursor:default;}
.atl-file-input-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
.atl-photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px;margin-top:8px;}
.atl-photo-thumb{position:relative;aspect-ratio:1;border-radius:8px;background-size:cover;background-position:center;border:1px solid ${T.onDarkBorder};cursor:pointer;}
.atl-photo-thumb.cover{border:2px solid ${GOLD};box-shadow:0 0 0 1px rgba(201,154,63,0.35);}
.atl-photo-thumb button{position:absolute;top:3px;right:3px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,0.7);border:0;color:${T.onDark};cursor:pointer;font-size:12px;line-height:1;}
.atl-photo-cover-badge{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${FONT_UI};font-weight:600;font-size:7.5px;letter-spacing:.12em;color:#000;background:${GOLD};padding:2px 0;border-radius:0 0 6px 6px;}
.atl-cover-crop{margin-top:10px;display:flex;flex-direction:column;gap:5px;}
.atl-cover-crop label{font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:${T.onDarkDim};}
.atl-cover-slider{width:100%;accent-color:${GOLD};}
.atl-log-foot{flex-shrink:0;margin:0 20px 20px;display:flex;flex-direction:column;gap:8px;}
.atl-log-foot .btn-gold{
  width:100%;padding:13px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border:1px solid rgba(250,244,236,0.30);border-radius:8px;color:#000;font-family:${FONT_TITLE};
  font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;
  box-shadow:0 0 40px rgba(230,158,26,0.4),inset 0 1px 0 rgba(255,255,255,0.3);
  transition:transform .2s,box-shadow .22s,opacity .22s;
}
.atl-log-foot .btn-gold:hover:not(:disabled){transform:scale(1.02);box-shadow:0 0 56px rgba(230,158,26,0.55),inset 0 1px 0 rgba(255,255,255,0.3);}
.atl-log-foot .btn-gold:disabled{opacity:.45;cursor:default;box-shadow:none;}
.atl-log-hint{margin:0;font-family:${FONT_UI};font-size:11px;color:${T.onDarkDim};text-align:center;}
.atl-log-error{margin:0;font-family:${FONT_UI};font-size:11.5px;color:#E08A6E;text-align:center;}
.atl-dupwarn{padding:10px 12px;border-radius:10px;background:rgba(201,154,63,0.10);border:1px solid ${GOLD};}
.atl-dupwarn p{margin:0 0 8px;font-family:${FONT_UI};font-size:11.5px;color:${T.onDark};line-height:1.4;}
.atl-dupwarn-btns{display:flex;gap:8px;}
.atl-dupwarn-btns .atl-toggle-btn{padding:7px 10px;font-size:10.5px;}
@media (max-width:640px){
  .atl-row2,.atl-row3{grid-template-columns:1fr;}
}
`;

export default AddTripLog;
