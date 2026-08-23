// ADD TRIP — log ("WE'VE BEEN THERE"), vlna 1, plany/zadanie-addtrip-flow-2026-07-27.md §4.3.
// Renderuje sa ako panel content (kontajner + jeho pozíciu rieši volajúci, rovnaký vzor ako
// AddTripPlan.tsx — sesterský súbor, drž sa jeho štýlu/CSS konvencií, ktoré tento súbor kopíruje
// 1:1 tam, kde sedia). Mapa žije v Portale — `GeometryPicker` (kontrakt:
// plany/kontrakt-geometrypicker-2026-07-29.md) dostane `mapRef` a kreslí do nej, tento formulár
// len drží riadený `TripGeometry` state.
//
// KROKY SÚ RIEŠENÉ PODMIENENÝM RENDEROM, NIE early returnom — všetky hooky bežia
// nepodmienene na každom rendri (Rules of Hooks, viď zadanie „pozor" sekcia).
//
// ── NAJPRV KRESLI, POTOM VYPLŇ (Matej 2026-08-23) ────────────────────────────────────────
// Formulár bol jeden dlhý zvitok, v ktorom bolo kreslenie len jedno pole medzi ostatnými —
// takže nástroje kreslenia (km, späť, zmazať) ležali mimo obrazovky práve vtedy, keď človek
// kreslil. Matej: „rozdeľme pridávanie výletu na kroky… prekopeme to na najprv kresli,
// zaznač, až potom vyplň." Poradie krokov je jeho, doslova:
//   1 TRASA · 2 ODKAZY NA TRASU · 3 ZÁKLAD · 4 O TRASE · 5 OSTATNÉ
// Zadanie: `plany/zadanie-mapa-kroky-2026-08-23.md`
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
import { CROWDS, CROWD_EMOJI, type Crowd } from '@/components/pack/packCommunity';
import { MARK_EMOJI, FONT_EMOJI } from '@/components/pack/mapnotes/markEmoji';
import type { NoteGroup, NoteKind } from '@/components/pack/mapnotes/mapNotesData';
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
  /**
   * Panel stojí VEDĽA mapy (PC), nie cez celú obrazovku. Púšťa sa ďalej do lišty kreslenia,
   * ktorá sa podľa toho odsadí — inak by na PC ležala na tomto formulári.
   */
  besidePanel?: boolean;
  /**
   * VÝCHODISKO Z PRSTA (rez C) — bod z dlhého stlačenia. Stane sa PRVOU KOTVOU trasy
   * hneď po výbere aktivity, takže krok „nájdi miesto" odpadá. Bez neho sa formulár
   * správa presne ako doteraz.
   */
  seedPoint?: { lat: number; lon: number } | null;
  /**
   * „Som na kroku, kde je obrazovkou MAPA" (krok 1 = kreslenie trasy). Na mobile podľa toho
   * PackMap formulár schová — mapa je vtedy celá obrazovka a formulár by ju prekryl.
   * Na PC sa nedeje nič: tam panel stojí vedľa mapy a schovávať netreba.
   */
  onMapPhase?: (on: boolean) => void;
  /**
   * KROK 2 — ODKAZY NA TRASU. Nič nové sa nevymýšľa: volá sa existujúci vstup zápisov do
   * mapy (`mapnotes/`, tabuľka `map_notes`), len ho vyvolá sprievodca namiesto dlhého
   * stlačenia. Väzba na výlet sa NEUKLADÁ — odvodzuje sa zo súradnice (mapNotesGeo.ts),
   * takže to neprežíva ani nerozbíja premenovanie slugu.
   */
  onPlaceNote?: (group: NoteGroup) => void;
  /**
   * Značky zapichnuté počas TOHTO pridávania. Krok 4 ich len ZHRNIE, needituje —
   * nebezpečenstvo má odteraz jediné miesto, a je ním mapa.
   */
  placedNotes?: NoteKind[];
};

// Aktivita taxonómia — lokálna kópia, rovnaká zavedená duplikačná konvencia ako AddTripPlan.tsx
// (komentár tam vysvetľuje prečo: PackMap.tsx má rovnaký zoznam, needituje sa, nič z neho nie
// je exportované).
const ACTIVITIES: Array<{ id: string; label: string; emoji: string; dataId: string; wide?: boolean; noteKey?: string }> = [
  { id: 'hiking', label: 'Hiking', emoji: '🥾', dataId: 'hike' },
  { id: 'journey', label: 'Journey', emoji: '🎒', dataId: 'journey' },
  { id: 'picnic', label: 'Picnic', emoji: '🧺', dataId: 'picnic' },
  { id: 'overnight', label: 'Overnight', emoji: '⛺', dataId: 'overnight' },
  { id: 'skating', label: 'Skate', emoji: '🛼', dataId: 'skating' },
  { id: 'paddleboard', label: 'SUP/swim', emoji: '🏄', dataId: 'paddleboard' },
  // ⚠️ POSLEDNÁ DLAŽDICA JE „VŠETKO OSTATNÉ" a musí to povedať (Matej 2026-08-23: „posledné
  // explore môže mať krátku vetu na vysvetlenie — iná aktivita, návšteva hradu, oblasti…").
  // Kompas 🧭 sľuboval objavovanie divočiny, hoci sem patrí aj hrad či mestský park; hrad 🏰
  // je konkrétnejší príklad toho, čo sa inam nezmestilo. Nepárny počet (7) jej v mriežke
  // aj tak necháva celý riadok, tak ho nesie text.
  { id: 'explore', label: 'Explore', emoji: '🏰', dataId: 'explore', wide: true, noteKey: 'pack.addTrip.log.activityExploreNote' },
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

export function AddTripLog({ allTrails, authorName, myDogs, onSubmit, onClose, placeholderFor, mapRef, besidePanel, seedPoint, onMapPhase, onPlaceNote, placedNotes }: AddTripLogProps) {
  // ⚠️ Tento súbor NEBOL preložený vôbec — `t` v ňom doteraz znamenalo lokálnu premennú
  // (text hrozby, položka tagu). Obe sú premenované, inak by prekladač zmizol pod nimi
  // a `t('...')` by volalo string.
  const t = useT();
  // ── krok 0: aktivita ('' = ešte nevybraná, sprievodca sa nezačal) ─────────────────────────
  const [activity, setActivity] = useState('');
  const [geometry, setGeometry] = useState<TripGeometry>({ kind: 'route', path: [], snapped: false });

  /**
   * KROK SPRIEVODCU (1–5). Ukladá sa aj do zálohy — bez toho obnovený výlet spadne späť na
   * krok 1 a človek kreslí trasu, ktorú už má.
   */
  const [step, setStep] = useState(1);
  /**
   * Krok 2 sa pýta TRI otázky za sebou (parkovisko → nebezpečenstvo → tip), každá
   * preskočiteľná. `noteAsk` je index do `NOTE_ASKS`; keď prejde za koniec, krok je hotový.
   */
  const [noteAsk, setNoteAsk] = useState(0);

  // ── polia formulára (kroky 3–5) ───────────────────────────────────────────────────────────
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

  // NAJPRV MAPA, POTOM FORMULÁR (Matej 2026-08-22, rozvinuté 23. 8. do krokov): po výbere
  // aktivity sa ide rovno na KROK 1 = trasa. Formulár prichádza až od kroku 3.
  const pickActivity = (id: string) => {
    setActivity(id);
    setStep(1);
    setNoteAsk(0);
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
      return;
    }
    setGeometry(empty);
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
    if (restored.crew) setCrew(restored.crew);
    if (restored.paws) setPaws(restored.paws);
    if (restored.note) setNote(restored.note);
    if (restored.visibility) setVisibility(restored.visibility);
    // ⚠️ AJ ČÍSLO KROKU. Bez neho by sa obnovený výlet vrátil na krok 1 a človek by kreslil
    // trasu, ktorú v zálohe už má — teda presne to, čo autosave mal ušetriť.
    if (restored.step && restored.step >= 1 && restored.step <= 5) setStep(restored.step);
    setRestored(null);
  };
  const discardRestore = () => { clearAddDraft(); setRestored(null); };

  // Trasa je hotová = dá sa z nej nakresliť čiara (2 kotvy), resp. bod/oblasť má stred.
  const geoDone = geometry.kind === 'route' ? geometry.path.length >= 2 : !!geometry.center;
  // NAJMENŠÍ ZÁPIS — náhľad musí hovoriť to isté, čo mapa. Plná čiara v rámiku by tvrdila
  // trasu, ktorú človek práve odmietol nakresliť.
  const isMinimalGeo = geometry.kind === 'route' && !!geometry.minimal;
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
      // ⚠️ `hazards` sa z formulára UŽ NEPLNÍ (Matej 23. 8.). Nebezpečenstvo sa od kroku 2
      // zapichuje na mapu — tam, kde naozaj je. Chip bez polohy je horší údaj (svorke
      // nepovie kde) a tá istá informácia na dvoch miestach sa rozíde pri prvej úprave.
      // Historické hlasy v `trip_votes.hazards` sa tým nemažú, len prestal pribúdať nový zdroj.
      paws: !isPlan && paws > 0 ? paws : undefined,
      photos: !isPlan && photos.length > 0 ? photos : undefined,
      coverIndex: !isPlan && photos.length > 0 ? effCoverIndex : undefined,
      coverY,
      note: note.trim() || undefined,
      authorName,
      createdAt: now,
      updatedAt: now,
      step,
    };
  }, [name, activity, geometry, effCountry, effRegion, dontRemember, date, isMultiDay, dateEnd, crew, isHikeLike, diff, terrain, crowd, tags, paws, photos, effCoverIndex, coverY, note, authorName, existingTripId, isPlan, visibility, step]);

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
    if (restored) return; // ponuka na obnovu je na obrazovke — nezmaž, čo ponúkame
    const hasSomething = !!draft.name || (draft.geometry?.kind === 'route' && draft.geometry.path.length > 0);
    if (!hasSomething) return;
    const { photos: _photos, ...withoutPhotos } = draft;
    writeAddDraft(withoutPhotos as AddTripDraft);
  }, [draft, restored]);

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

  // ── SPRIEVODCA ────────────────────────────────────────────────────────────────────────
  // Poradie krokov je Matejovo (23. 8.), doslova. Kľúč nesie nadpis aj vetu „čo tu mám robiť";
  // tá veta stojí v KAŽDOM kroku a vždy na tom istom mieste — v kroku 1 nad mapou (fialová
  // pilulka lišty kreslenia), inde v hlavičke panela. Dva systémy pokynov sme nechceli.
  const STEP_KEYS = ['route', 'notes', 'basics', 'about', 'rest'] as const;
  const stepKey = STEP_KEYS[step - 1] ?? 'route';

  // MAGISTRÁLA sa nekreslí, VYBERÁ sa zo zoznamu (§1/§2 zadania journey-pick) — v tom prípade
  // krok 1 nie je mapa, ale výber, takže lišta kreslenia by nemala čo obsluhovať.
  const journeyPicking = activity === 'journey' && !drawManually;
  const drawingStep = !!activity && step === 1 && !journeyPicking && !restored;

  // Na mobile je v kroku 1 obrazovkou MAPA a formulár sa schová (PackMap). Na PC sa nedeje nič.
  useEffect(() => { onMapPhase?.(drawingStep); }, [drawingStep, onMapPhase]);
  useEffect(() => () => { onMapPhase?.(false); }, [onMapPhase]);

  // Krok 1 sa neopúšťa bez geometrie — aj keby to bol len najmenší zápis (štart a cieľ).
  // Inak by človek prešiel celý sprievodca a spadol až na uložení.
  const nextBlocked = step === 1 && !geoDone;

  const goNext = () => { if (!nextBlocked) setStep((n) => Math.min(5, n + 1)); };
  const goPrev = () => {
    if (step > 1) { setStep((n) => n - 1); return; }
    setActivity('');
  };

  const drawBar = useMemo(
    () => ({
      active: drawingStep,
      onDone: () => setStep(2),
      onBack: () => setActivity(''),
      doneLabel: t('pack.addTrip.step.doneRoute'),
      doneDisabled: nextBlocked,
      besidePanel,
      // Mimo kroku 1 picker ostáva MOUNTNUTÝ (aby trasa na mape nezmizla, veď sa na ňu
      // v kroku 2 pichajú značky), ale nesmie brať kliky — inak by pri zapichovaní
      // parkoviska pribudla kotva trasy.
      paused: !drawingStep,
    }),
    [drawingStep, besidePanel, nextBlocked, t],
  );

  // ── KROK 2: ODKAZY NA TRASU ───────────────────────────────────────────────────────────
  // Matej: „pridaj na trasu ODKAZY (pri logu): parkovisko? — na každé bude vyzvaný, kde si
  // parkoval; bolo na trase nebezpečenstvo? tajné miesto, tip?" Tri otázky, každá
  // preskočiteľná. Existujúci systém zápisov sa len VYVOLÁ — nič nové sa nestavia.
  const NOTE_ASKS: Array<{ group: NoteGroup; qKey: string; ctaKey: string }> = [
    { group: 'parking', qKey: 'pack.addTrip.step.askParking', ctaKey: 'pack.addTrip.step.markParking' },
    { group: 'warning', qKey: 'pack.addTrip.step.askWarning', ctaKey: 'pack.addTrip.step.markWarning' },
    { group: 'comment', qKey: 'pack.addTrip.step.askTip', ctaKey: 'pack.addTrip.step.markTip' },
  ];
  // Keď značka pribudne, otázka sa posunie sama — inak by človek po uložení parkoviska
  // videl tú istú otázku znova a nevedel by, či sa zápis podaril.
  const placedCount = placedNotes?.length ?? 0;
  const prevPlacedRef = useRef(placedCount);
  useEffect(() => {
    if (placedCount > prevPlacedRef.current) setNoteAsk((i) => Math.min(NOTE_ASKS.length, i + 1));
    prevPlacedRef.current = placedCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- NOTE_ASKS je konštanta v tele
  }, [placedCount]);

  const stepHint = t(`pack.addTrip.step.hint.${stepKey}`);

  return (
    <div className="atl-log">
      <style>{LOG_CSS}</style>
      <style>{ROUTE_HERO_CSS}</style>
      <style>{RESTORE_CSS}</style>
      <style>{STEP_CSS}</style>
      {/* VÝBER AKTIVITY MÁ VLASTNÚ HLAVIČKU (Matej 2026-08-23: „šípku dozadu do stredu hore
          a pod to väčší nápis — nie čo ste robili, ale vyber aktivitu"). Je to prvá obrazovka
          celého pridávania, takže sa správa ako titulná strana: návrat v strede, veľký nadpis
          a JEDNA veta o tom, čo bude nasledovať. Ďalšie kroky ostávajú na úzkej hlavičke
          s návratom vľavo — tam už človek vie, kde je, a miesto patrí formuláru. */}
      {!activity ? (
        <div className="atl-log-head atl-log-head--intro">
          <button
            type="button"
            className="atl-log-back"
            onClick={onClose}
            aria-label={t('pack.addTrip.geo.stepBack')}
          >
            ←
          </button>
          <div className="atl-log-title atl-log-title--big">{t('pack.addTrip.log.titleActivity')}</div>
          <div className="atl-log-sub">{t('pack.addTrip.log.titleActivitySub')}</div>
        </div>
      ) : (
        <div className="atl-log-head">
          <button
            type="button"
            className="atl-log-back"
            onClick={goPrev}
            aria-label={t('pack.addTrip.geo.stepBack')}
          >
            ←
          </button>
          {/* Nadpis sleduje dátum — kým je v budúcnosti, formulár je PLÁN a „Log a trip"
              by hovoril o niečom, čo sa ešte nestalo. */}
          <div className="atl-log-title">
            {t(isPlan ? 'pack.addTrip.log.titlePlan' : 'pack.addTrip.log.title')}
          </div>
        </div>
      )}

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
            <button
              key={a.id}
              type="button"
              className={`atl-tile${a.wide ? ' atl-tile--wide' : ''}`}
              onClick={() => pickActivity(a.id)}
            >
              <span className="atl-tile-emoji">{a.emoji}</span>
              {/* ⚠️ NÁZOV CEZ SLOVNÍK, NIE `a.label` — dataset nesie anglický názov ako kľúč a na
                  slovenskej obrazovke potom stálo „Hiking" pod nadpisom „Vyber aktivitu".
                  `pack.map.activityLabel.*` už existuje (používa ho filter na mape). */}
              <span className="atl-tile-label">{t(`pack.map.activityLabel.${a.id}`)}</span>
              {a.noteKey && <span className="atl-tile-note">{t(a.noteKey)}</span>}
            </button>
          ))}
        </div>
      )}

      {!!activity && !restored && (
        <>
          {/* KDE SOM — päť bodiek a názov kroku. Bez toho je krokový sprievodca len formulár,
              ktorý sa nečakane skrátil. Späť sa dá kliknúť na už prejdený krok. */}
          <div className="atl-steps" role="tablist" aria-label={t('pack.addTrip.step.progress')}>
            {STEP_KEYS.map((k, i) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={step === i + 1}
                className={`atl-step${step === i + 1 ? ' on' : ''}${step > i + 1 ? ' done' : ''}`}
                onClick={() => { if (i + 1 < step) setStep(i + 1); }}
                disabled={i + 1 > step}
              >
                <b>{i + 1}</b>
                <span>{t(`pack.addTrip.step.name.${k}`)}</span>
              </button>
            ))}
          </div>

          <div className="atl-log-body">
            {/* JEDNA VETA, VŽDY NA TOM ISTOM MIESTE (Matej 23. 8.). V kroku 1 ju nesie fialová
                pilulka nad mapou (tam, kde sa gesto robí) — tu by stála druhýkrát. */}
            {!drawingStep && stepHint && (
              <div className="atl-stephint">{stepHint}</div>
            )}

            {/* ══ KROK 1 — TRASA ══════════════════════════════════════════════════════
                ⚠️ V ďalších krokoch sa tento blok SCHOVÁ, NEODMOUNTUJE. GeometryPicker kreslí
                vrstvy do mapy imperatívne a pri odmountovaní ich po sebe upratuje — trasa by
                teda z mapy zmizla presne vtedy, keď sa na ňu v kroku 2 pichajú značky. */}
            <div style={step === 1 ? undefined : { display: 'none' }}>
              {/* NÁHĽAD TRASY OSTÁVA V PANELI. Matej 23. 8.: „Na ľavom boku je rámik kde sa
                  zobrazuje route — náhľad, čo je fajn ALE! pod tým je kopa ďalších informácií
                  a nie je vôbec vidno UNDO, DELETE." Nástroje sa presťahovali do lišty nad
                  mapu; náhľad, ktorý pochválil, ostáva presne tam, kde bol. */}
              {routeShape && (
                <div className={`atl-photo atl-photo--route${isMinimalGeo ? ' is-minimal' : ''}`} style={{ marginBottom: 12 }}>
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <polyline points={routeShape} />
                  </svg>
                  <span className="atl-photo-badge">{t('pack.addTrip.log.routeSoFar')}</span>
                </div>
              )}
              <div className="atl-field">
                <label>
                  {t('pack.addTrip.log.where')}
                  {geoDone && (
                    <span className="atl-donepill">✓ {t('pack.addTrip.geo.routeDone')}</span>
                  )}
                </label>
                {journeyPicking ? (
                  <div className="atl-journeys">
                    <input
                      className="atl-input"
                      value={journeyFilter}
                      onChange={(e) => setJourneyFilter(e.target.value)}
                      placeholder={t('pack.addTrip.step.searchTrails')}
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
                      {journeyList.length === 0 && <p className="atl-field-hint" style={{ padding: '6px 4px' }}>{t('pack.addTrip.step.noTrails')}</p>}
                    </div>
                    <button type="button" className="atl-journey-link" onClick={drawInstead}>
                      {t('pack.addTrip.step.drawInstead')}
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

            {/* ══ KROK 2 — ODKAZY NA TRASU ════════════════════════════════════════════ */}
            {step === 2 && (
              <div className="atl-field">
                <label>{t('pack.addTrip.step.name.notes')}</label>
                {noteAsk < NOTE_ASKS.length ? (
                  <div className="atl-noteask">
                    <p>{t(NOTE_ASKS[noteAsk].qKey)}</p>
                    <div className="atl-noteask-btns">
                      <button
                        type="button"
                        className="atl-toggle-btn"
                        onClick={() => setNoteAsk((i) => i + 1)}
                      >
                        {t('pack.addTrip.step.skip')}
                      </button>
                      <button
                        type="button"
                        className="atl-toggle-btn on"
                        onClick={() => onPlaceNote?.(NOTE_ASKS[noteAsk].group)}
                        disabled={!onPlaceNote}
                      >
                        {t(NOTE_ASKS[noteAsk].ctaKey)}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="atl-field-hint">{t('pack.addTrip.step.notesDone')}</p>
                )}
                <PlacedNotes notes={placedNotes} t={t} emptyKey="pack.addTrip.step.noNotesYet" />
                {noteAsk >= NOTE_ASKS.length && (
                  <button type="button" className="atl-journey-link" onClick={() => setNoteAsk(0)}>
                    {t('pack.addTrip.step.markMore')}
                  </button>
                )}
              </div>
            )}

            {/* ══ KROK 3 — ZÁKLAD ═════════════════════════════════════════════════════ */}
            {step === 3 && (
              <>
                {/* HORE PATRÍ TO, ČO ČLOVEK PRÁVE ROBÍ — nie stock les.
                    Kým nie je nahraná fotka, ukazuje sa ŽIVÝ VÝREZ NAKRESLENEJ TRASY: je to
                    jediný obrázok, ktorý o tomto konkrétnom výlete niečo hovorí. */}
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

                <div className="atl-field">
                  <label>{t('pack.addTrip.log.name')}</label>
                  <input className="atl-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('pack.addTrip.step.namePlaceholder')} />
                </div>

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
                      <label>{t('pack.addTrip.step.dateEnd')}</label>
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
                      {t('pack.addTrip.step.dontRemember')}
                    </button>
                  </div>
                </div>
                {activity !== 'journey' && (
                  <p className="atl-daterange-hint">
                    {t('pack.addTrip.step.multiDayHint')}{' '}
                    <button type="button" className="atl-journey-link" onClick={() => setActivity('')}>{t('pack.addTrip.plan.activities.journey')}</button>.
                  </p>
                )}

                <div className="atl-row3">
                  <div className="atl-field">
                    <label>{t('pack.addTrip.step.state')}</label>
                    <select className="atl-input" value={effCountry} onChange={(e) => setCountryOverride(e.target.value)}>
                      {countryOpts.map((c) => <option key={c} value={c}>{flagEmoji(c)} {COUNTRY_LABEL[c] ?? c.toUpperCase()}</option>)}
                    </select>
                  </div>
                  {effCountry === 'sk' && (
                    <div className="atl-field">
                      <label>{t('pack.addTrip.step.region')}</label>
                      <select className="atl-input" value={effRegion} onChange={(e) => setRegionOverride(e.target.value as '' | 'W' | 'C' | 'E')}>
                        <option value="">{t('pack.addTrip.log.selectPlaceholder')}</option>
                        <option value="W">{t('pack.addTrip.step.regionW')}</option>
                        <option value="C">{t('pack.addTrip.step.regionC')}</option>
                        <option value="E">{t('pack.addTrip.step.regionE')}</option>
                      </select>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ══ KROK 4 — O TRASE ════════════════════════════════════════════════════ */}
            {step === 4 && (
              <>
                {/* Ruch, náročnosť, povrch, hodnotenie a fotky sú SPRÁVY Z CESTY — na výlete,
                    ktorý sa ešte nekonal, sa nedajú vyplniť pravdivo. Preto sa na pláne
                    nezobrazujú (a do draftu sa nedostanú, viď `isPlan` pri jeho stavbe). */}
                {isHikeLike && !isPlan && (
                  <div className="atl-row2">
                    <div className="atl-field">
                      <label>{t('pack.addTrip.step.difficulty')}</label>
                      <select className="atl-input" value={diff} onChange={(e) => setDiff(e.target.value as typeof diff)}>
                        <option value="">{t('pack.addTrip.log.selectPlaceholder')}</option>
                        {DIFF_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="atl-field">
                      <label>{t('pack.addTrip.step.terrain')}</label>
                      <select className="atl-input" value={terrain} onChange={(e) => setTerrain(e.target.value)}>
                        <option value="">{t('pack.addTrip.log.selectPlaceholder')}</option>
                        {TERRAIN_OPTIONS.map((sf) => <option key={sf.id} value={sf.id}>{sf.emoji} {sf.label}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                {!isPlan && (
                  <div className="atl-field">
                    <label>{t('pack.addTrip.log.crowd')}</label>
                    <select className="atl-input" value={crowd} onChange={(e) => setCrowd(e.target.value as '' | Crowd)}>
                      <option value="">{t('pack.addTrip.log.selectPlaceholder')}</option>
                      {CROWDS.map((c) => <option key={c} value={c}>{CROWD_EMOJI[c]} {c}</option>)}
                    </select>
                  </div>
                )}

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

                <div className="atl-field">
                  <label>{t(isPlan ? 'pack.addTrip.plan.details' : 'pack.addTrip.log.story')}</label>
                  <textarea className="atl-input atl-textarea" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('pack.addTrip.step.storyPlaceholder')} />
                </div>

                {/* NEBEZPEČENSTVO SA TU UŽ NEVYPĹŇA, LEN ZHŔŇA (Matej 23. 8.).
                    Chipy hazardov zanikli: tá istá informácia žila na dvoch miestach
                    (`trip_votes.hazards` + značky v mape) a prvá úprava jedného ich rozišla.
                    Chip bez polohy je navyše horší údaj — svorke nepovie kde. */}
                <div className="atl-field">
                  <label>{t('pack.addTrip.step.markedOnRoute')}</label>
                  <PlacedNotes notes={placedNotes} t={t} emptyKey="pack.addTrip.step.noNotesSummary" />
                  <button type="button" className="atl-journey-link" onClick={() => { setNoteAsk(0); setStep(2); }}>
                    {t('pack.addTrip.step.backToNotes')}
                  </button>
                </div>

                {/* PLÁN — viditeľnosť. Ukazuje sa len keď dátum leží v budúcnosti. */}
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
              </>
            )}

            {/* ══ KROK 5 — OSTATNÉ ════════════════════════════════════════════════════ */}
            {step === 5 && (
              <>
                <div className="atl-field">
                  <label>{t('pack.addTrip.log.pack')}</label>
                  <CompanionAvatarsOnly myDogs={myDogs} selected={crew} onChange={setCrew} />
                </div>

                {!isPlan && (
                  <div className="atl-field">
                    <label>{t('pack.addTrip.step.rate')}</label>
                    <PawRating value={paws} onChange={setPaws} onDark size={26} />
                  </div>
                )}

                {!isPlan && (
                  <div className="atl-field">
                    <label>{t('pack.addTrip.step.photos')} <span className="atl-field-hint">· {photos.length}/{MAX_PHOTOS}</span></label>
                    <button
                      type="button"
                      className="atl-file-btn"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={photos.length >= MAX_PHOTOS}
                    >
                      📷 {t('pack.addTrip.step.choosePhotos')}
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
                    <p className="atl-field-hint" style={{ marginTop: 4 }}>{t('pack.addTrip.step.photoHint', { n: MAX_PHOTOS })}</p>
                    {photoNote && <p className="atl-field-hint" style={{ marginTop: 4 }}>{photoNote}</p>}
                    {photos.length > 0 && (
                      <>
                        <div className="atl-photo-grid">
                          {photos.map((ph, i) => (
                            <div
                              key={i}
                              className={`atl-photo-thumb${i === effCoverIndex ? ' cover' : ''}`}
                              style={{ backgroundImage: `url('${ph}')` }}
                              onClick={() => setCoverIndex(i)}
                              role="button"
                              tabIndex={0}
                              aria-label={t('pack.addTrip.step.coverPhoto')}
                            >
                              {i === effCoverIndex && <span className="atl-photo-cover-badge">{t('pack.addTrip.step.cover')}</span>}
                              <button type="button" onClick={(e) => { e.stopPropagation(); removePhoto(i); }} aria-label={t('pack.addTrip.step.removePhoto')}>×</button>
                            </div>
                          ))}
                        </div>
                        <div className="atl-cover-crop">
                          <label>{t('pack.addTrip.step.coverCrop')}</label>
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
              </>
            )}
          </div>

          <div className="atl-log-foot">
            {/* V KROKU 1 NAVIGÁCIU VLASTNÍ LIŠTA (HOTOVO nad mapou) — dve tlačidlá s tým istým
                účinkom na jednej obrazovke je presne ten zmätok, kvôli ktorému kroky vznikli. */}
            {step < 5 && !drawingStep && (
              <div className="atl-nav">
                <button type="button" className="atl-toggle-btn" onClick={goPrev}>{t('pack.addTrip.step.back')}</button>
                <button type="button" className="btn-gold" onClick={goNext} disabled={nextBlocked}>
                  {t('pack.addTrip.step.next')}
                </button>
              </div>
            )}
            {step === 1 && !drawingStep && nextBlocked && (
              <p className="atl-log-hint">{t('pack.addTrip.step.needRoute')}</p>
            )}

            {step === 5 && (
              <>
                {showDupWarning && dup && (
                  <div className="atl-dupwarn">
                    <p>{t('pack.addTrip.step.dupWarn', { name: dup.name })}</p>
                    <div className="atl-dupwarn-btns">
                      <button type="button" className="atl-toggle-btn" onClick={() => setShowDupWarning(false)}>{t('pack.addTrip.step.cancel')}</button>
                      <button type="button" className="atl-toggle-btn on" onClick={confirmDuplicate}>{t('pack.addTrip.step.logAnyway')}</button>
                    </div>
                  </div>
                )}
                <div className="atl-nav">
                  <button type="button" className="atl-toggle-btn" onClick={goPrev}>{t('pack.addTrip.step.back')}</button>
                  <button type="button" className="btn-gold" disabled={!canSubmit} onClick={handleSubmit}>
                    {t(isPlan ? 'pack.addTrip.log.submitPlan' : 'pack.addTrip.log.submit')}
                  </button>
                </div>
                {!canSubmit && missing.toSubmit.length > 0 && <p className="atl-log-hint">{t('pack.addTrip.log.missing', { fields: missing.toSubmit.join(', ') })}</p>}
                {!canSubmit && journeyIssue && (
                  <p className="atl-log-hint">{t('pack.addTrip.step.journeyNeedsEnd')}</p>
                )}
                {canSubmit && missing.toApprove.length > 0 && (
                  <p className="atl-log-hint">{t('pack.addTrip.step.willBeDraft', { fields: missing.toApprove.join(', ') })}</p>
                )}
                {submitError && <p className="atl-log-error">{submitError}</p>}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * ZHRNUTIE ZNAČIEK ZAPICHNUTÝCH NA TRASU — čítanie, nie editovanie.
 * Emoji aj názov si berie z tých istých zdrojov ako mapa (`MARK_EMOJI`, `pack.mapNotes.kind.*`),
 * takže sa značka v zozname a značka na mape nikdy nerozídu.
 */
function PlacedNotes({ notes, t, emptyKey }: { notes?: NoteKind[]; t: (k: string, v?: Record<string, string | number>) => string; emptyKey: string }) {
  if (!notes || notes.length === 0) {
    return <p className="atl-field-hint">{t(emptyKey)}</p>;
  }
  return (
    <div className="atl-chips">
      {notes.map((k, i) => (
        <span key={`${k}-${i}`} className="atl-chip on">
          <span className="atl-chip-emoji" style={{ fontFamily: FONT_EMOJI }}>{MARK_EMOJI[k]}</span>
          <span className="atl-chip-label">{t(`pack.mapNotes.kind.${k}`)}</span>
        </span>
      ))}
    </div>
  );
}

/** CSS krokového sprievodcu. ⚠️ JS template literal — spätný apostrof v komentári zhodí build. */
const STEP_CSS = `
.atl-steps{display:flex;gap:6px;padding:2px 20px 10px;flex-shrink:0;}
.atl-step{flex:1 1 0;display:flex;flex-direction:column;align-items:center;gap:4px;padding:7px 4px;border-radius:9px;background:transparent;border:1px solid transparent;color:${T.onDarkDim};cursor:default;}
.atl-step b{display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:rgba(245,240,228,0.06);border:1px solid ${T.onDarkBorder};font-family:${FONT_UI};font-weight:600;font-size:10.5px;line-height:1;}
.atl-step span{font-family:${FONT_UI};font-weight:500;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;text-align:center;line-height:1.2;}
.atl-step.done{cursor:pointer;color:${T.onDark};}
.atl-step.done b{background:rgba(201,154,63,0.20);border-color:rgba(201,154,63,0.55);color:${GOLD};}
.atl-step.on{background:rgba(201,154,63,0.10);border-color:rgba(201,154,63,0.40);color:${T.onDark};}
.atl-step.on b{background:linear-gradient(135deg,#F5C73D,#E69E1A);border-color:rgba(250,244,236,0.30);color:#1c160c;}
/* Veta „čo tu mám robiť" — tá istá myšlienka ako fialová pilulka nad mapou, len na povrchu
   panela: fialový rám z rodiny trasy, plný tmavý podklad, aby bola čitateľná aj cez fotku. */
.atl-stephint{padding:10px 13px;border-radius:10px;background:rgba(18,13,7,0.85);border:1px solid rgba(179,107,255,0.45);box-shadow:0 0 0 3px rgba(122,47,191,0.14);font-family:${FONT_UI};font-size:12.5px;font-weight:500;line-height:1.45;color:#F3E9FF;}
.atl-donepill{margin-left:8px;padding:2px 9px;border-radius:999px;background:rgba(122,47,191,0.22);border:1px solid rgba(179,107,255,0.55);color:#E9D8FF;font-size:10.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;}
.atl-noteask{padding:12px 14px;border-radius:12px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};}
.atl-noteask p{margin:0 0 10px;font-family:${FONT_UI};font-size:13px;line-height:1.45;color:${T.onDark};}
.atl-noteask-btns{display:flex;gap:8px;}
.atl-noteask-btns .atl-toggle-btn{flex:1 1 0;}
.atl-nav{display:flex;gap:8px;align-items:stretch;}
.atl-nav .atl-toggle-btn{flex:0 0 34%;}
.atl-nav .btn-gold{flex:1 1 0;}
`;

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
/* Najmenší zápis: čiarkovane aj tu — rámik nesmie tvrdiť trasu, ktorú appka nepozná. */
.atl-photo--route.is-minimal polyline{stroke-dasharray:2 9;}
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
/* Titulná obrazovka pridávania — návrat v strede, pod ním nadpis a jedna veta. */
.atl-log-head--intro{flex-direction:column;align-items:center;gap:12px;padding:18px 20px 14px;text-align:center;}
.atl-log-title--big{font-size:22px;letter-spacing:.06em;}
.atl-log-sub{font-family:${FONT_UI};font-weight:500;font-size:12.5px;line-height:1.45;color:${T.onDarkDim};max-width:34ch;}
/* JEDEN STĹPEC NA MOBILE (Matej 2026-08-23: „políčka na mobile zväčši tak aby boli cez celý
   displej"). Dlaždica sa tým narovná do riadku — emoji vľavo, názov vedľa — takže výška
   obrazovky vystačí aj na sedem položiek. Nad 560 px ostávajú dva stĺpce. */
.atl-tiles{display:grid;grid-template-columns:1fr;gap:10px;padding:4px 20px 20px;}
.atl-tile{display:flex;flex-direction:row;align-items:center;gap:14px;padding:15px 16px;border-radius:12px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};cursor:pointer;text-align:left;transition:border-color .15s ease,background .15s ease;}
.atl-tile:hover{border-color:${GOLD};background:rgba(201,154,63,0.10);}
.atl-tile-emoji{font-size:26px;line-height:1;flex:0 0 auto;}
.atl-tile-label{font-family:${FONT_UI};font-weight:500;font-size:14px;letter-spacing:.03em;color:${T.onDark};}
.atl-tile--wide{flex-wrap:wrap;}
.atl-tile-note{flex:1 1 100%;font-family:${FONT_UI};font-weight:400;font-size:11.5px;line-height:1.4;color:${T.onDarkDim};}
@media (min-width:560px){
  .atl-tiles{grid-template-columns:repeat(2,1fr);}
  .atl-tile--wide{grid-column:1 / -1;}
}
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
