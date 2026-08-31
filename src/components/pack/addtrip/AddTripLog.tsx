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
import { createPortal } from 'react-dom';
import type { MutableRefObject } from 'react';
import L from 'leaflet';
import type { LatLngTuple, Map as LeafletMap } from 'leaflet';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { MAP_SKIN, PALE, PALE_PC_MIN, LAPIS, LAPIS_BTN_SHADOW, PLATE_TILE_R, pickTintCSS, PICK_INK } from '@/components/pack/navGoldSkin';
import { useIsPaleChrome } from '@/components/pack/usePaleChrome';
import { CompanionPicker, type Companion } from '@/components/pack/packCommunityUI';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS, type Journey } from '@/data/heroJourneys';
import { trailCountry, flagEmoji } from '@/lib/countryGeo';
import { countryLabel } from '@/lib/countryOptions';
import { trailWCE } from '@/components/pack/triplist/triplist';
import { pluralKey } from '@/components/pack/tripShared';
import { DiffMark, DIFF_MARK_CSS } from '@/components/pack/tripShared';
import { dockFitPadding, dockPadX } from '@/components/pack/mapDockShape';
import { notePanelH } from '@/components/pack/mapnotes/AddMapNote';
import { GeometryPicker, allowedKindsFor, defaultKindFor, findDuplicate, TRIP_HOLD_MIN_ZOOM } from './GeometryPicker';
import { MAX_PHOTOS, optimizePhoto } from './photoOptimize';
import { SPACING, interp, calibratedAscent } from './addTripGeo';
import { buildPlanDate, parsePlanDate, type PlanPrecision } from './planDate';
import { ensureElevations, elevAt, missingElevationCount } from './mapProxyClient';
import { PawRating } from './PawRating';
import { CROWDS, CROWD_EMOJI, type Crowd } from '@/components/pack/packCommunity';
import { MARK_EMOJI, FONT_EMOJI } from '@/components/pack/mapnotes/markEmoji';
import { POINTS, NOTE_POINTS_TRIP_CAP } from '@/lib/tripPoints';
import { GROUP_KINDS, groupOf, type NoteGroup, type NoteKind } from '@/components/pack/mapnotes/mapNotesData';
import ainubisFace from '@/assets/ainubis-head.png';
import { GROUP_TINT, HAZARD_RED } from '@/components/pack/mapnotes/NotePalette';
import { KindGrid } from '@/components/pack/mapnotes/KindGrid';
import {
  missingFields, needsDifficulty,
  type AddTripDraft, type TripGeometry, type ApprovalStatus, type TripNoteRef, type TripState,
  type TravelMode, TRAVEL_MODES,
  readAddDraft, writeAddDraft, clearAddDraft, clearTripNotes,
} from './addTripModel';
import { TRIP_CATEGORIES, chipsForCategory, otherChips } from '@/components/pack/tripCategories';

const GOLD = '#C99A3F';

/**
 * ── JEDNA FARBA OZNAČENIA V CELOM TOKU (Matej 2026-08-26) ─────────────────────────────────
 *
 * „výbery možností musia byť vizuálnejšie, teraz je to fádne… treba zvoliť jednotnú farbu
 *  označenia — napr zelenú nech je to na prvý pohľad viditeľné."
 *
 * Do teraz bolo „vybraté" zlaté pri 14–22 % krytia — teda tá istá farba, akú má rám panela,
 * doska aj aktívny krok. Na papyruse sa zlatá voľba od zlatého nábytku nedala odlíšiť.
 *
 * ⚠️ JE TO TÁ ISTÁ ZELENÁ, AKÁ ZNAMENÁ „SPLNENÉ" (GROUP_TINT.comment = T.growGreen): splnená
 * možnosť v kroku 2, zelený krok v číselníku aj vybratý chip tu. Jeden význam, jedna farba —
 * dve zelené vedľa seba by boli horšie než jedna.
 *
 * 🟠 FLAG PRE MATEJA: v bežiacom redizajne `/map` nesie „moja voľba a moja akcia" LAPIS
 * (`navGoldSkin.ts`). Zelená sa tým rozširuje zo „splnené" aj na „vybraté", takže v jednom
 * paneli stoja vedľa seba lapisové CTA a zelené chipy. Postavené podľa Matejovho výslovného
 * zadania; ak sa to bude biť, mení sa TENTO token, nie pravidlá po súboroch.
 */
const PICK = T.growGreen;

// JOURNEY = VÝBER, NIE KRESLENIE (Matej 2026-07-29, plany/zadanie-journey-pick-2026-07-29.md).
// `existingTripId` je lokálne rozšírenie AddTripDraft (addTripModel.ts sa needituje) — nesie
// odkaz na magistrálu z HERO_JOURNEYS, aby konvertor v PackMap.tsx vedel, že nemá vytvárať
// nový HeroTrail (viď submitAddTripDraft tam), len označiť existujúci trip ako prejdený.
// `finishTripId` = dopĺňa sa UŽ ULOŽENÝ výlet. Volajúci podľa neho záznam PREPÍŠE namiesto
// toho, aby založil druhý — bez toho by dopísanie náročnosti vyrobilo dvojča tej istej trasy.
type LogDraft = AddTripDraft & { existingTripId?: string; finishTripId?: string; finishFromPlan?: boolean };

export type AddTripLogProps = {
  /** Pre GeometryPicker — duchovia existujúcich trás + kontrola duplicity (§5.3) a submit-time
   *  poistku (findDuplicate, kontrakt §2.3). */
  allTrails: HeroTrail[];
  /** firstName z usePackIdentity — zapisuje sa do draftu (`authorName`). */
  authorName: string;
  myDogs: { id: string; name: string; photo?: string | null }[];
  /** false = zlyhal zápis (napr. plná kvóta) — formulár zostane otvorený, ukáže chybu. */
  onSubmit: (draft: AddTripDraft) => boolean;
  /**
   * ── PREJDENÝ PLÁN (Matej 2026-08-25) ──────────────────────────────────────────────────
   * „po prejdení tejto trasy sa tento trip musí otvoriť v tripflowe ako pre zápis, ale už
   *  bude mať predvyplnenú trasu (možnosť opraviť, ainubis sa opýta či to sedelo s plánom)."
   *
   * Ide o ten istý `finishTrail`, len s INÝMI pravidlami než dopĺňanie konceptu:
   * kroky 1–2 sa NEZAMYKAJÚ (trasa sa smie opraviť, značky sa pichajú teraz, keď tam človek
   * naozaj bol), štartuje sa na kroku 1 a dátum sa prepisuje na DNEŠOK — plán mohol byť na
   * sobotu a šlo sa v nedeľu.
   */
  fromPlan?: boolean;
  onClose: () => void;
  /**
   * NÁVRAT ZO ŠÍPKY NA PRVEJ OBRAZOVKE = O KROK SPÄŤ, NIE VON (Matej 2026-08-28:
   * „ked dam z aktivity šípku dozadu da ma na mapu a nie na ADD! oprav").
   *
   * Výber aktivity je DRUHÁ obrazovka toku — pred ňou stojí popup „čo pridávam" (AddTripEntry).
   * Šípka tu volala `onClose`, takže jediné, čo človek na prvej obrazovke rozhodol (VÝLET vs.
   * PODUJATIE vs. ODKAZ), sa nedalo zmeniť inak než zavretím celého pridávania a novým klikom
   * na PRIDAŤ. Odkedy je šípka na oboch obrazovkách na tom istom mieste, vyzerá to navyše ako
   * pokazený návrat, nie ako východ.
   * ⚠️ Nepovinné zámerne: keď sa sprievodca otvorí bez popupu (doplnenie konceptu, prejdený
   * plán, deep link), nie je kam sa vracať a šípka ostáva východom.
   */
  onBackToEntry?: () => void;
  /** PackMap.tsx:246 `placeholderFor()` — rovnaký prop ako AddTripPlan, len tu slúži ako
   *  fallback pokým autor nenahrá vlastnú fotku (row 10) — akonáhle je aspoň jedna, nahrádza ju. */
  placeholderFor: (actIds: string[] | undefined, seed: string) => string;
  /** Mapa žije v PackMap.tsx — GeometryPicker ju nevytvára, len dostane ref (kontrakt §2). */
  mapRef: MutableRefObject<LeafletMap | null>;
  /**
   * Panel stojí VEDĽA mapy (PC), nie cez celú obrazovku. Púšťa sa ďalej do lišty kreslenia,
   * ktorá sa podľa toho odsadí — inak by na PC ležala na tomto formulári.
   */
  /**
   * VÝCHODISKO Z PRSTA (rez C) — bod z dlhého stlačenia. Stane sa PRVOU KOTVOU trasy
   * hneď po výbere aktivity, takže krok „nájdi miesto" odpadá. Bez neho sa formulár
   * správa presne ako doteraz.
   */
  seedPoint?: { lat: number; lon: number } | null;
  /**
   * KTORÝ KROK PRÁVE VLASTNÍ MAPU.
   *
   * `draw`  — krok 1, kreslí sa trasa. Existujúce trasy sa na mape stlmia, nech je vidno tú,
   *           ktorá práve vzniká (Matej 2026-08-23: „keď kreslím, musia zmiznúť už vytvorené
   *           trasy, resp. musia ešte viac vyblednúť").
   * `notes` — krok 2, na hotovú trasu sa pichajú odkazy. Mapa ostáva obrazovkou (Matej: „ten
   *           bude opäť na mape, nie prostredie krokov"), ale okolité trasy sa vrátia — sú
   *           to orientačné body pre to, kde parkoval.
   * `off`   — formulár je obrazovkou.
   *
   * Na mobile podľa toho PackMap formulár schová; na PC panel stojí vedľa mapy a schovávať
   * netreba, stlmenie trás však platí rovnako.
   */
  onMapPhase?: (phase: 'off' | 'draw' | 'notes') => void;
  /**
   * ── NAKRESLENÁ TRASA SA HLÁSI HORE (Matej 2026-08-25) ─────────────────────────────────
   *
   * „musí tu platiť zásada: akonáhle je trasa nakreslená, celý tripflow musí byť ona
   *  stredobod a nie krajina ako na začiatku."
   *
   * Bez tohto rámovali mapu DVAJA: `FitBounds` v PackMap (hranica SR) a sprievodca (trasa).
   * Pri každom prechode na mapu sa `addMapPhase` prepol, `FitBounds` sa tým prebudil a bežal
   * PO sprievodcovi — takže krajina zakaždým prepísala trasu. Vyzeralo to ako náhodné
   * odzoomovanie; bolo to poradie efektov.
   * Riešenie nie je tretie rámovanie, ale JEDEN VLASTNÍK: kým existuje trasa, `FitBounds`
   * mlčí a výrez patrí sprievodcovi.
   */
  onHasRoute?: (has: boolean) => void;
  /**
   * KROK 2 — ODKAZY NA TRASU. Nič nové sa nevymýšľa: volá sa existujúci vstup zápisov do
   * mapy (`mapnotes/`, tabuľka `map_notes`), len ho vyvolá sprievodca namiesto dlhého
   * stlačenia. Väzba na výlet sa NEUKLADÁ — odvodzuje sa zo súradnice (mapNotesGeo.ts),
   * takže to neprežíva ani nerozbíja premenovanie slugu.
   */
  /**
   * ── DOPĹŇANIE KONCEPTU (2026-08-25) ───────────────────────────────────────────────────
   *
   * Uložený výlet, ktorému chýbajú povinné polia. Sprievodca sa otvorí rovno v kroku 3
   * s vyplneným tým, čo už vieme, a kroky 1–2 sú zamknuté.
   *
   * ⚠️ TRASA SA V TOMTO REŽIME NEUPRAVUJE ZÁMERNE. `HeroTrail.path` je ODVODENÁ stopa
   * (snapPath), nie kotvy — tie sa pri zápise nezachovávajú. Pustiť do nej editor by
   * znamenalo mazať bod po bode zo stoviek snapnutých bodov namiesto z kotiev, teda pravý
   * opak toho, čo dvojvrstvový model chráni (viď `TripGeometry` v addTripModel.ts).
   */
  finishTrail?: HeroTrail | null;
  /** `kind` = druh vybraný ešte pred ťuknutím do mapy (mriežka v kroku 2); bez neho sa
   *  použije prvý druh skupiny, teda pôvodné správanie. */
  onPlaceNote?: (group: NoteGroup, kind?: NoteKind) => void;
  /**
   * Značky zapichnuté počas TOHTO pridávania. Krok 4 ich len ZHRNIE, needituje —
   * nebezpečenstvo má odteraz jediné miesto, a je ním mapa.
   */
  placedNotes?: TripNoteRef[];
  /**
   * Zmazanie značky z chipu v zhrnutí kroku 2 (Matej 2026-08-24). Ide tou istou cestou ako
   * mazanie z mapy — bez toho by chip mohol zmiznúť zo zoznamu, ale značka by na mape ostala.
   */
  onRemoveNote?: (id: string) => void;
  /**
   * ČLOVEK PRÁVE UKAZUJE MIESTO ZNAČKY. Panel kroku 2 vtedy ustúpi — mapa musí byť voľná
   * a lišta „ukáž miesto" (`.mnp-bar`) stojí presne tam, kde inak sedí dolný panel.
   */
  notePlacing?: boolean;
};

// Aktivita taxonómia — lokálna kópia, rovnaká zavedená duplikačná konvencia ako AddTripPlan.tsx
// (komentár tam vysvetľuje prečo: PackMap.tsx má rovnaký zoznam, needituje sa, nič z neho nie
// je exportované).
// ⚠️ VYSVETLIVKU MÁ KAŽDÁ DLAŽDICA, NIE LEN POSLEDNÁ (Matej 2026-08-23: „k výberom aktivity
// musí byť vysvetlivka"). Nie je to ozdoba: voľba aktivity rozhoduje o tom, ČO sa bude na mape
// kresliť — trasa, jeden bod alebo vodná plocha (tabuľka ACTIVITY_GEOMETRY v GeometryPicker) —
// a to sa človek dovtedy dozvedel až v kroku 1, keď mu mapa sama ponúkla iné nástroje, než
// čakal. Kľúč je odvodený od `id`, takže nová aktivita bez vety spadne na prázdno, nie na
// cudzí text.
// ── TRI KATEGÓRIE, JEDEN ZDROJ (2026-08-31) ─────────────────────────────────────────────
// Sedem dlaždíc zaniklo — zoznam žije v `components/pack/tripCategories.ts` spolu s tým,
// ktoré staré aktivity do ktorej kategórie patria a akú má kategória geometriu. Tu ostal
// len tvar, ktorý čaká mriežka dlaždíc.
// ⚠️ Emoji ani poradie sa TU nemenia — meň ich v `tripCategories.ts`, inak sa filter,
// plán a článok znova rozídu (do 27. 8. mal plán pri nocľahu ⛺ tam, kde filter 💤).
const ACTIVITIES: Array<{ id: string; label: string; emoji: string; dataId: string }> =
  TRIP_CATEGORIES.map((c) => ({ id: c.id, label: c.label, emoji: c.emoji, dataId: c.dataId }));
const ACT_BY_ID: Record<string, (typeof ACTIVITIES)[number]> = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));

// Dve možnosti v rozbalenej dlaždici. `mode` je hodnota do `pickActivity`, `key` predpona
// i18n kľúčov (`mode.walked` + `mode.walkedSub`) — kľúče sa NEPREMENÚVAJÚ, tabuľka ich len
// prestáva mať opísané dvakrát v JSX.
const MODE_CHOICES: Array<{ mode: 'walked' | 'planned'; key: 'walked' | 'planned'; emoji: string }> = [
  { mode: 'walked', key: 'walked', emoji: '✅' },
  { mode: 'planned', key: 'planned', emoji: '🗓️' },
];

// §4.3 riadok 4: Náročnosť a povrch má LEN HIKE (Matej 2026-08-31; do vtedy aj SPORT). Lokálna kópia
// množiny `HIKE_LIKE` tu stála do 27. 8. 2026 — dnes to hovorí `needsDifficulty()`
// z addTripModel.ts nad príznakom pri kategórii, teda tá istá veta na jednom mieste.
const DIFF_OPTIONS = ['Easy', 'Moderate', 'Hard', 'Odyssey'] as const;
// terrain — lokálna kópia SURFACE_VOCAB (PackMap.tsx, needituje sa/needituje sa exportovať).
const TERRAIN_OPTIONS = [
  // 🌲 → 👣 (matrica 24. 8. 2026): strom nesie SCENÉRIU `Forest` o pár riadkov nižšie,
  // tu ide o povrch pod labkami. Zhoda s `TAG_EMOJI['Forest path']` je zámer.
  { id: 'forest', emoji: '👣', label: 'Forest path' },
  { id: 'asphalt', emoji: '🛣️', label: 'Asphalt' },
  { id: 'rocky', emoji: '🪨', label: 'Rocky' },
] as const;
// tags — scenéria, ODDELENÁ od terrain (surface má vlastné pole `surface`, viď addTripModel.ts
// komentár „PRAVIDLO PRE VŠETKY VRSTVY"). PackMap.tsx TAG_VOCAB miešal scenériu + surface do
// jedného radu (bolo to pre FILTER chipy, kde to malo zmysel); tu majú tags a terrain oddelené
// polia, tak dávame do tag-chipov len scenériu, nie duplicitu terrain dropdownu.
// ⚠️ `label` je HODNOTA UKLADANÁ DO DB (chip na mape sa podľa nej filtruje) — neprekladá sa.
// Zobrazený text ide cez `id` a slovník; kľúč nesmie byť odvodený z labelu, lebo „Lake/Reservoir"
// má v sebe lomku a medzery.
const TAG_OPTIONS: Array<{ id: string; label: string; emoji: string }> = [
  { id: 'mountains', label: 'Mountains', emoji: '🏔️' }, { id: 'forest', label: 'Forest', emoji: '🌲' },
  { id: 'lake', label: 'Lake/Reservoir', emoji: '🔵' }, { id: 'river', label: 'River', emoji: '🌀' },
  { id: 'view', label: 'View', emoji: '👁️' }, { id: 'meadow', label: 'Meadow', emoji: '🌼' },
  { id: 'sunset', label: 'Sunset', emoji: '🌅' },
  // TIEŇ (Matej 2026-08-24) — dve hodnoty, nie škála. Musí sedieť s `TAG_VOCAB`/`TAG_EMOJI`
  // v `PackMap.tsx`, inak sa tag zapíše a filter ho neponúkne.
  { id: 'shade', label: 'Shade', emoji: '⛱️' }, { id: 'noshade', label: 'No shade', emoji: '🌡️' },
];

// State (krajina) — lokálna kópia ADD_COUNTRY_OPTIONS/ISO2_LABEL (PackMap.tsx:117-121),
// needituje sa a nič z neho nie je exportované, rovnaká duplikačná konvencia ako vyššie.
const COUNTRY_OPTIONS = ['sk', 'cz', 'at', 'hu', 'pl', 'de', 'ch', 'it', 'si', 'fr'] as const;
// ⚠️ NÁZVY KRAJÍN SA NEPÍŠU RUČNE. Tu stál zoznam natvrdo po anglicky, takže pod slovenským
// nadpisom KRAJINA svietilo „Slovakia" — tá istá chyba ako pri názvoch aktivít 23. 8. ráno.
// `countryLabel(iso, lang)` ide cez `Intl.DisplayNames`, teda pokrýva všetkých 18 jazykov
// bez jediného kľúča v slovníku.


// Počiatočná prázdna geometria — `defaultKindFor(activity,'log')` je vždy TABUĽKOVÝ default
// z ACTIVITY_GEOMETRY (nie najvoľnejší ako pri pláne — §5: log = „čo si skutočne prešiel").
function emptyGeometryFor(activity: string, multiDay = false): TripGeometry {
  const kind = defaultKindFor(activity, 'log', multiDay);
  if (kind === 'point') return { kind: 'point', center: undefined as unknown as LatLngTuple };
  if (kind === 'area') return { kind: 'area', center: undefined as unknown as LatLngTuple, radiusM: 0 };
  return { kind: 'route', path: [], snapped: false };
}

// Fotky — base64, lokálna kópia optimizePhoto/handleAddPhotos (PackMap.tsx ~1621-1663).
// Vlna 2 preklopí na Cloudinary upload (§9 zadania „Fotky ... ako dnes, base64").
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

export function AddTripLog({ allTrails, authorName, myDogs, onSubmit, onClose, onBackToEntry, placeholderFor, mapRef, seedPoint, onMapPhase, onHasRoute, onPlaceNote, onRemoveNote, placedNotes, notePlacing, finishTrail, fromPlan }: AddTripLogProps) {
  const paleChrome = useIsPaleChrome();
  // ⚠️ Tento súbor NEBOL preložený vôbec — `t` v ňom doteraz znamenalo lokálnu premennú
  // (text hrozby, položka tagu). Obe sú premenované, inak by prekladač zmizol pod nimi
  // a `t('...')` by volalo string.
  const t = useT();
  /**
   * ⚠️ „3 BODOV" JE ZLE (Matej 2026-08-25: „získavaš 3 body nie 3 bodov! oprav!").
   * Slovenčina má tri tvary (1 bod · 2–4 body · 5+ bodov) a natvrdo napísané „bodov" bolo
   * správne len pri šestke a deviatke. Skloňovanie rieši `pluralKey()` z `tripShared` —
   * ten istý mechanizmus, aký už drží kotvy trasy (`geo.pointsSuffix`). Nezavádza sa druhý.
   */
  const ptsWord = (n: number) => t('pack.addTrip.step.pts' + pluralKey(n), { n });
  const { lang } = useLang();
  // ── krok 0: aktivita ('' = ešte nevybraná, sprievodca sa nezačal) ─────────────────────────
  const [activity, setActivity] = useState('');
  /**
   * ── KROK 0b: PLÁNUJEM / PREŠLI SME TO ───────────────────────────────────────────────────
   *
   * Matej 24. 8. 2026: „pri výbere aktivity chýba ten medzikrok — plánovanie/zapísanie…
   * po kliku na aktivitu sa vysunie dropdown s touto možnosťou a človek musí označiť jednu
   * z možností."
   *
   * ⚠️ VRACIA TO VOĽBU, KTORÁ 22. 8. ZANIKLA — ale na inom mieste a v inom tvare. Vtedy to
   * bola celá obrazovka PRED aktivitou (`TRIP_BLOCKS` v AddTripEntry.tsx) a padla preto, že
   * odpoveď už ležala v dátume o tri polia nižšie. Dátum ju nahradiť nedokázal: dátum je
   * v kroku 4, takže do tej chvíle sprievodca nevie, čo stavia, a texty (aj otázka „ako bola
   * cesta") sa musia rozhodovať naslepo. Tu je to jedno ťuknutie navyše v tom istom geste,
   * ktorým sa aktivita aj tak vyberá.
   *
   * ⚠️ ODTERAZ JE TOTO ZDROJ PRAVDY, NIE DÁTUM. `isPlan` sa počíta z `tripMode`; dátumové
   * pole len dostane `min`/`max` podľa neho, aby si obe strany neodporovali.
   */
  const [tripMode, setTripMode] = useState<TripState | null>(null);
  /**
   * ── ČÍSLA HORE MUSIA VEDIEŤ AJ SPÄŤ HORE (Matej 2026-08-25) ────────────────────────────
   *
   * „ked som bol na kroku 5 a vrátil som sa na krok jedna… nešlo mi kliknúť na číselník hore,
   *  ktorý by ma vrátil na krok 5. Ak z 3–5 kroku kliknem na 1 alebo 2, musí byť možný návrat
   *  cez horné čísla."
   *
   * Číselník bol jednosmerka: `disabled={i + 1 > step}` znamenalo, že po skoku z 5 na 1 sa
   * kroky 2–5 vypli a jediná cesta späť viedla znovu cez celý sprievodca. Pritom človek,
   * ktorý sa na krok 5 UŽ raz dostal, má všetky podmienky splnené — vypínať mu ich je trest
   * za to, že si šiel niečo opraviť.
   *
   * Preto sa pamätá NAJĎALEJ DOSIAHNUTÝ krok, nie aktuálny. Dopredu sa dá len po tento
   * strop — nová obrazovka sa ním preskočiť nedá.
   * ⚠️ Berie do úvahy aj obnovu z autosave: `readAddDraft()` vráti človeka napr. na krok 4,
   * takže strop musí ísť s ním, inak by po obnove nemohol dopredu vôbec.
   */
  const [maxStep, setMaxStep] = useState(1);
  /** aktivita, ktorá má práve otvorený rozbaľovač s voľbou — nie je to ešte výber */
  const [pendingActivity, setPendingActivity] = useState<string | null>(null);
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
  /**
   * ⚠️ POVRCHOV MÔŽE BYŤ VIAC (Matej 2026-08-25: „ešte by som rád, aby povrch bol
   * multivyberateľný, lebo môže byť viacero povrchov, nie len jeden = chipy").
   * Má pravdu a dáta to čakali: `AddTripDraft.surface` je **pole** od začiatku a generovaný
   * dataset drží `surface?: string[]` — jednoprvkové pole bolo len obmedzenie ovládania,
   * nie modelu. Preto sa mení `<select>` na chipy a nič pod tým.
   */
  const [terrain, setTerrain] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<Set<string>>(new Set());
  /**
   * ── CHIPY KROKU 4 — „ČO SME TAM ROBILI" (2026-08-31) ──────────────────────────────────
   *
   * Jedna množina pre OBA rady. Rady sú dva len na obrazovke (vlastná kategória viditeľne,
   * ostatné zbalené) — v dátach je to jeden zoznam a pri ukladaní jedno pole `acts`. Dve
   * množiny by si vyžadovali pravidlo, čo sa stane pri prepnutí kategórie, a to pravidlo
   * by po prvej zmene klamalo.
   */
  const [chips, setChips] = useState<Set<string>>(new Set());
  /**
   * Ktorý chip z DRUHÉHO radu človek práve zapol — pod ním stojí tichá ponuka „vieš, kde to
   * bolo?". Nie je to výber, je to POSLEDNÝ DOTYK: ponuka sa nesmie zjaviť pri každom
   * zapnutom chipe naraz (bol by z nej zoznam otázok), ani ostať visieť po vypnutí.
   * `null` = neponúka sa nič a nič sa tým neblokuje.
   */
  const [chipAsk, setChipAsk] = useState<string | null>(null);
  /** Druhý rad je ZBALENÝ. Preto ti na Kriváni nikto neponúka pádlovanie — musíš oň požiadať. */
  const [moreChipsOpen, setMoreChipsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [crew, setCrew] = useState<Companion[]>([]);
  /** §4.5 — príbeh výletu na celú obrazovku. Stav je LEN o tom, kde sa text píše; hodnota
      je stále `note`, takže sa nedá rozísť s poľom v paneli. */
  const [storyFull, setStoryFull] = useState(false);
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
  /**
   * ── VIACDŇOVOSŤ SA PÝTA V 1. KROKU (Matej 2026-08-27) ──────────────────────────────────
   *
   * „nad tlačidlo HOTOVO pribudne otázka jednodňová túra / túra na viac dní."
   *
   * 🔴 TOTO JE JEDINÝ ZDROJ. Do 27. 8. sa viacdňovosť odvodzovala z `dateEnd > date`, teda
   * z poľa o dva kroky ďalej — nocľahy zapichnuté v kroku 2 tak viseli na príznaku, ktorý
   * sa v kroku 3 vedel sám vypnúť (stačil rovnaký dátum) a zmizli by bez slova. Dátum ho
   * odteraz už len PLNÍ.
   */
  const [multiDay, setMultiDay] = useState(false);
  /**
   * Výber z magistrál (`HERO_JOURNEYS`) — do 27. 8. sa zapínal sám tým, že si človek vybral
   * aktivitu „Putovanie". Tá zanikla, a viazať to na odpoveď „na viac dní" sa nedá: otázka
   * stojí v kroku 1 NAD mapou, takže by človeku pri odpovedi zmizla rozkreslená trasa pod
   * zoznamom. Preto je to vlastná, vedomá voľba — odkaz pod otázkou.
   */
  const [journeyPick, setJourneyPick] = useState(false);

  // živé km/prevýšenie zapisujeme do draftu LEN PRI SUBMITE (kontrakt §2 „nie priebežne" — inak
  // by autosave/re-render bežal na každý klik pri kreslení).
  const metricsRef = useRef<{ km: number; ascentM: number | null; minutes: number | null; points: number }>({ km: 0, ascentM: null, minutes: null, points: 0 });
  const photoInputRef = useRef<HTMLInputElement>(null);

  // aktivita mení povolené druhy geometrie — ak aktuálny kind už nesedí, resetni na nový default.
  useEffect(() => {
    if (!activity) return;
    // ⚠️ ZÁVISÍ AJ NA VIACDŇOVOSTI: odpoveď „na viac dní" zúži povolené druhy na samotnú
    // trasu, takže rozkreslený kruh treba zahodiť v tej istej chvíli, keď prestal byť legálny.
    const allowed = allowedKindsFor(activity, multiDay);
    setGeometry((prev) => (allowed.includes(prev.kind) ? prev : emptyGeometryFor(activity, multiDay)));
  }, [activity, multiDay]);

  // NAJPRV MAPA, POTOM FORMULÁR (Matej 2026-08-22, rozvinuté 23. 8. do krokov): po výbere
  // aktivity sa ide rovno na KROK 1 = trasa. Formulár prichádza až od kroku 3.
  const pickActivity = (id: string, mode: TripState) => {
    setActivity(id);
    setTripMode(mode);
    setPendingActivity(null);
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
    metricsRef.current = { km: parseFloat(j.km) || 0, ascentM: j.ascentM ?? j.journey.ascentM ?? null, minutes: null, points: j.path.length };
  };
  const drawInstead = () => {
    setDrawManually(true);
    setExistingTripId(undefined);
    setGeometry(emptyGeometryFor(activity, multiDay));
  };

  const isHikeLike = needsDifficulty(activity);
  /**
   * ── DVA RADY CHIPOV (§2.1 zadania, Matej 2026-08-31) ─────────────────────────────────
   *
   * `ownChips`  = chipy VLASTNEJ kategórie, viditeľné („Čo sme tam robili").
   * `moreChips` = ZJEDNOTENIE chipov OSTATNÝCH kategórií, zbalené („Dalo sa tam ešte niečo?").
   *
   * 🔑 Druhý rad NIE JE vlastný zoznam — počíta sa z `TRIP_CATEGORIES`, takže sa nemôže
   *    rozísť a nevzniknú v ňom duplicity. HIKE nemá vlastné chipy (nesie ho náročnosť
   *    a odysea), takže mu ostane len ten zbalený rad — a práve preto sa mu pádlovanie
   *    samo neponúka.
   */
  const ownChips = useMemo(() => chipsForCategory(activity), [activity]);
  const moreChips = useMemo(() => otherChips(activity), [activity]);
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

  /**
   * ── PRESNOSŤ PLÁNU ────────────────────────────────────────────────────────────────────
   * Tri ovládače, jeden výstup: `date` ostáva JEDEN reťazec ('2026-09-15' | '2026-09-W2' |
   * '2026-09'), takže všetko za formulárom — draft, `planTrail`, `TripPlan`, kontrola
   * povinných polí — pracuje s tým, s čím pracovalo doteraz. Prepínanie presnosti si drží
   * rozpísané hodnoty (deň aj mesiac), aby klik na „len mesiac" a späť nezmazal dátum,
   * ktorý už bol vybraný.
   */
  const [planPrecision, setPlanPrecision] = useState<PlanPrecision>('exact');
  const [planDay, setPlanDay] = useState('');
  const [planMonth, setPlanMonth] = useState('');
  const [planWeek, setPlanWeek] = useState(1);
  /**
   * ── DOPRAVA NA VÝLET (Matej 2026-08-26) — TRETÍ KROK PLÁNU ───────────────────────────
   * Prázdny reťazec = nepovedané, nie „autom". Doprava je NEPOVINNÁ: plán sa dá založiť aj
   * bez nej (človek to ešte nevie) a `stepMissing[6]` si ju nepýta. Predvyplniť auto by
   * znamenalo, že tri štvrtiny plánov budú tvrdiť „idem autom" bez toho, aby to niekto
   * povedal — a práve tá informácia má svorke pomôcť rozhodnúť sa.
   */
  const [travelMode, setTravelMode] = useState<TravelMode | ''>('');
  const [travelFrom, setTravelFrom] = useState('');
  const [pickup, setPickup] = useState(false);
  const [pickupSeats, setPickupSeats] = useState(1);
  /**
   * ⚠️ ROZHODUJE VOĽBA Z KROKU 0b, NIE DÁTUM (Matej 24. 8. 2026 — viď `tripMode` hore).
   * Dátum ostáva len údajom o výlete; keby rozhodoval on, človek by si typ výletu prepol
   * omylom pri oprave preklepu v dátume a formulár pod ním by sa prestaval.
   * Fallback na dátum drží OBNOVENÉ náčrty z čias pred touto zmenou — tie mód neniesli.
   */
  const isPlan = tripMode ? tripMode === 'planned' : (!dontRemember && !!date && date > todayISO);

  /**
   * IDEM SÁM (Matej 2026-08-26) — odvodené z `visibility`, nie ďalší stav. Pri sólo výlete
   * sa nevypĺňajú detaily plánu ani doprava: nie je komu ich adresovať. Jedna premenná preto,
   * aby sa pri pridaní ďalšieho takého poľa neopakovala podmienka na štyroch miestach.
   * ⚠️ Platí LEN v pláne — zápis prejdeného výletu žiadnu viditeľnosť nemá a `visibility`
   * v ňom ostáva na predvolenom 'private', čo by inak zašedlo polia aj tam.
   */
  const solo = isPlan && visibility === 'private';

  /**
   * ── MESIAC SA VYBERÁ, NEPÍŠE (Matej 2026-08-26) ────────────────────────────────────────
   * „ten výber dátumu je hrozný, mesiac daj dropdown… nech človek nemusí písať."
   * Predtým tu stál `input type="month"`, ktorý na počítači ukazuje prázdne „mm.rrrr" a chce
   * ho vyklepať na klávesnici — pri pláne „niekedy v septembri" je to tri údery za jednu
   * informáciu, ktorú vie človek ukázať prstom.
   *
   * Zoznam ide OD AKTUÁLNEHO MESIACA dopredu: plán do minulosti neexistuje, takže minulé
   * mesiace by boli len položky, ktoré sa nesmú vybrať. Osemnásť dopredu pokrýva aj „na budúce
   * leto", čo je najvzdialenejšia vec, ktorú si niekto reálne plánuje so psom.
   *
   * ⚠️ NÁZVY MESIACOV BERIE `Intl`, NIE VLASTNÁ TABUĽKA. Komentár v `planDate.ts` hovorí, že
   * mesiac sa píše číslom, lebo názov „by si vypýtal vlastnú tabuľku v 18 jazykoch" — to platí
   * pre ručný zoznam. Prehliadač ich má a `intlLocale()` (jeden zdroj, `i18n/bcp47.ts`) mu
   * povie, v ktorom jazyku. Žiadna tabuľka nevzniká.
   */
  const monthOpts = useMemo(() => {
    const [y0, m0] = todayISO.split('-').map(Number);
    const fmt = new Intl.DateTimeFormat(intlLocale(lang), { month: 'long', year: 'numeric' });
    return Array.from({ length: 18 }, (_, i) => {
      const d = new Date(y0, m0 - 1 + i, 1);
      return {
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: fmt.format(d),
      };
    });
  }, [todayISO, lang]);

  /**
   * KLIK KAMKOĽVEK DO POĽA OTVORÍ KALENDÁR. Natívny `input type="date"` otvára kalendár len
   * z malej ikonky vpravo — klik do zvyšku poľa nerobí nič a človek začne písať bodky.
   * `showPicker()` je presne na toto; kde ho prehliadač nemá, ostáva pôvodné správanie,
   * takže sa nič nerozbije.
   */
  const openNativePicker = (el: HTMLInputElement | null) => {
    try { (el as HTMLInputElement & { showPicker?: () => void })?.showPicker?.(); } catch { /* mimo gesta / nepodporované */ }
  };

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
    // Dopĺňanie konceptu je návrat k ULOŽENÉMU výletu — ponuka „pokračovať v rozrobenom"
    // by nad ním ponúkala niečo úplne iné a jedno kliknutie by prepísalo druhé.
    if (finishTrail) return null;
    const d = readAddDraft();
    // Prázdny náčrt nemá čo obnovovať — ponuka „pokračovať" by bola falošný sľub.
    return d && (d.name || (d.geometry?.kind === 'route' && d.geometry.path?.length)) ? d : null;
  });

  /**
   * ── VLASTNÝ PES JE PREDVYPLNENÝ, NIE PRÁZDNE MIESTO NA DOKLIKANIE (Matej 2026-08-26) ──
   *
   * „kto bol s tebou na výlete tam musí byť už foto psa nie to plus — pes bude automaticky
   *  pridaný."
   *
   * Väčšina výletov je „ja a môj pes"; pýtať sa naň znamená pýtať sa na zrejmé. Kto ho tam
   * nechce, odklikne ho — ale to je výnimka, a tá má stáť prácu, nie pravidlo.
   *
   * ⚠️ BEŽÍ RAZ A LEN NA PRÁZDNU SVORKU. Bez `doneRef` by sa pes vrátil aj potom, čo ho
   * človek zámerne odobral (odobratie vyrobí prázdne pole ⇒ efekt by ho hneď doplnil späť).
   * Obnovený draft (`restored.crew`) sa nedotýka z toho istého dôvodu: prázdna svorka v ňom
   * je ROZHODNUTIE, nie chýbajúci údaj.
   * ⚠️ Kľúč `dog-<id>` musí sedieť s `toggleDog` v `CompanionPicker` — inak by sa pes zobrazil
   * ako vybratý a zároveň by jeho pilulka ponúkala „+".
   */
  const crewSeededRef = useRef(false);
  useEffect(() => {
    if (crewSeededRef.current) return;
    if (restored) return;
    const first = myDogs?.[0];
    if (!first) return;
    crewSeededRef.current = true;
    setCrew((prev) => (prev.length ? prev : [{
      key: `dog-${first.id}`,
      name: first.name || 'My dog',
      sub: 'your pack',
      photo: first.photo ?? undefined,
    }]));
  }, [myDogs, restored]);
  /**
   * ⚠️ PO OBNOVE SA MAPA MUSÍ SAMA VRÁTIŤ NA TRASU (Matej 24. 8. 2026: „ak kliknem na
   * pokračovať vo výlete, potrebujem aby ma hneď vrátilo aj zoomom na výlet, bez potreby
   * aby som musel zoomovať a hľadať to po mape — musí to byť automatika").
   *
   * Mapa si po reloade drží svoj vlastný pohľad (naposledy prehľad krajiny), takže obnovený
   * náčrt sa vykreslil kdesi mimo obrazovky. Vyzeralo to, že sa neobnovilo nič.
   * Príznak je JEDNORAZOVÝ (`useRef` + nulovanie v efekte): keby sa mapa rovnala pri každom
   * prekreslení, odletela by človeku späť zakaždým, keď si ju sám posunie.
   */
  const refitRef = useRef(false);

  const restore = () => {
    if (!restored) return;
    restoredRef.current = true;
    refitRef.current = true;
    setActivity(restored.activity || '');
    // Náčrt nesie `state`, takže obnovený výlet sa nemusí pýtať na to isté druhýkrát.
    if (restored.state === 'planned' || restored.state === 'walked') setTripMode(restored.state);
    // Plán drží presnosť v samotnom reťazci — pri obnove ju treba rozobrať späť na tri
    // ovládače, inak by sa formulár otvoril na „presný dátum" s prázdnym kalendárom
    // a efekt vyššie by uložený „niekedy v septembri" prepísal na nič.
    const rp = restored.state === 'planned' ? parsePlanDate(restored.date) : null;
    if (rp) {
      setPlanPrecision(rp.precision);
      setPlanMonth(rp.month);
      if (rp.day) setPlanDay(rp.day);
      if (rp.week) setPlanWeek(rp.week);
    }
    setName(restored.name || '');
    setDate(restored.date || '');
    setDateEnd(restored.dateEnd || '');
    setMultiDay(!!restored.multiDay);
    setDontRemember(restored.dateKind === 'flexible');
    if (restored.geometry) setGeometry(restored.geometry);
    if (restored.country) setCountryOverride(restored.country);
    if (restored.region) setRegionOverride(restored.region);
    // Draft nesie `crowd`/`diff` ako voľnejší typ (ide cez JSON) — zúžime ich pri obnove,
    // inak by sa do stavu dostala hodnota, ktorú `<select>` nepozná, a pole by ostalo prázdne.
    if (restored.crowd && (CROWDS as readonly string[]).includes(restored.crowd)) setCrowd(restored.crowd as Crowd);
    if (restored.diff && (DIFF_OPTIONS as readonly string[]).includes(restored.diff)) setDiff(restored.diff as typeof diff);
    // ⚠️ CELÉ POLE, NIE PRVÝ PRVOK. Kým bol povrch jeden, obnova brala `[0]` — po prechode
    // na viacnásobný výber by rozrobený výlet s tromi povrchmi prišiel po reloade o dva.
    if (restored.surface?.length) setTerrain(new Set(restored.surface));
    if (restored.tags) setTags(new Set(restored.tags));
    // Chipy prežijú reload rovnako ako tagy. Druhý rad sa pritom NEROZBALÍ sám: obnovený
    // výlet už tú voľbu má a rozbalený zoznam by pri návrate vyzeral ako nová otázka.
    if (restored.chips?.length) setChips(new Set(restored.chips));
    if (restored.crew) setCrew(restored.crew);
    if (restored.paws) setPaws(restored.paws);
    if (restored.note) setNote(restored.note);
    if (restored.visibility) setVisibility(restored.visibility);
    // Doprava — tri polia, každé zvlášť: náčrt uložený pred 26. 8. ich nemá vôbec
    // a `undefined` nesmie prepísať predvolený stav na prázdno.
    if (restored.travelMode) setTravelMode(restored.travelMode);
    if (restored.travelFrom) setTravelFrom(restored.travelFrom);
    if (restored.pickup) setPickup(true);
    if (restored.pickupSeats) setPickupSeats(restored.pickupSeats);
    // ⚠️ AJ ČÍSLO KROKU. Bez neho by sa obnovený výlet vrátil na krok 1 a človek by kreslil
    // trasu, ktorú v zálohe už má — teda presne to, čo autosave mal ušetriť.
    // ⚠️ HORNÁ MEDZA JE 6, NIE 5 (26. 8.) — plán má vlastný šiesty krok (odchod). So starou
    // päťkou by sa rozrobený plán obnovil o krok skôr, než kde človek skončil.
    if (restored.step && restored.step >= 1 && restored.step <= 6) setStep(restored.step);
    setRestored(null);
  };
  // ⚠️ AJ ZNAČKY, NIE LEN DRAFT. „Neobnovovať" znamená začínam odznova — a značky
  // zapichnuté v minulom pokuse sú súčasťou toho, čo sa zahadzuje. Bez tohto riadku
  // prežili v úložisku a nový výlet začal s cudzím parkoviskom a upozornením.
  const discardRestore = () => { clearAddDraft(); clearTripNotes(); setRestored(null); };

  // ── DOPĹŇANIE KONCEPTU ────────────────────────────────────────────────────────────────
  // Beží RAZ, pri otvorení. Napĺňa tie isté settery ako `restore()` — dva rôzne spôsoby
  // prefillu by sa rozišli pri prvom pribudnutom poli.
  //
  // `minStep` zamyká kroky 1–2: trasa je hotová a upravovať sa v tomto režime nedá
  // (viď `finishTrail` v props), odkazy sa pichajú do mapy pri zápise a ich väzba na výlet
  // sa neukladá, takže „späť na odkazy" by po čase ukazoval cudzie okolie.
  const finishing = !!finishTrail;
  /**
   * ⚠️ DVA REŽIMY NAD JEDNÝM `finishTrail`, NEZAMIEŇAŤ:
   *  · DOPĹŇANIE KONCEPTU (`finishingDraft`) — výlet je prejdený od prvého uloženia, dopisujú
   *    sa chýbajúce polia. Kroky 1–2 sú zamknuté a tlačidlo hovorí „Uložiť", nie „Zapísať".
   *  · PREJDENÝ PLÁN (`fromPlan`) — výlet sa práve odohral. Trasa sa smie opraviť, značky sa
   *    pichajú teraz, tlačidlo zapisuje. Zamknúť tu kroky 1–2 by odobralo presne to, kvôli
   *    čomu sa formulár otvára.
   */
  const finishingDraft = finishing && !fromPlan;
  const minStep = finishingDraft ? 3 : 1;
  const filledRef = useRef(false);
  useEffect(() => {
    if (!finishTrail || filledRef.current) return;
    filledRef.current = true;
    // Mapa má ukázať TEN výlet, ktorý sa dopĺňa. Nakreslená trasa umlčí `FitBounds` v PackMap
    // (jeden vlastník výrezu), takže bez tohto by za formulárom ostal ležať výrez, na ktorom
    // človek práve stál — spravidla celá krajina.
    refitRef.current = true;
    setTripMode('walked');
    setName(finishTrail.name ?? '');
    // acts nesú DATA id (hike/journey/…), formulár pracuje s id aktivity (hiking/journey/…).
    const act = ACTIVITIES.find((a) => (finishTrail.acts ?? []).includes(a.dataId));
    if (act) setActivity(act.id);
    setGeometry({
      kind: 'route',
      // `path` v zázname je odvodená stopa. Do oboch vrstiev ide to isté, nech sa z nej
      // počíta rovnako ako predtým; editovať sa v tomto režime nedá (minStep).
      // ⚠️ PRI PLÁNE IDÚ DO `path` KOTVY, nie stopa. `finishTrail.path` je prichytená čiara
      // (stovky bodov po chodníkoch) — ako kotvy by dala stovky uzlov a trasa by sa nedala
      // rozumne opraviť. `planPath` drží kliky, ktoré ju vyrobili (viď `planTrail` v PackMap).
      path: (fromPlan ? finishTrail.planPath : undefined) ?? finishTrail.path ?? [],
      snapPath: finishTrail.path ?? [],
      snapped: true,
    });
    if (finishTrail.country) setCountryOverride(finishTrail.country);
    // ⚠️ PLÁN NESIE DÁTUM, KEDY SA MALO ÍSŤ — nie kedy sa išlo. Plánovalo sa na sobotu,
    // šlo sa v nedeľu, a zápis má hovoriť pravdu o tom, čo sa stalo. Preto DNEŠOK; človek
    // ho v kroku 3 prepíše, ak sa vracia k výletu spred pár dní.
    if (fromPlan) setDate(todayISO);
    else if (finishTrail.date) setDate(finishTrail.date);
    else setDontRemember(true);
    if (finishTrail.dateEnd) setDateEnd(finishTrail.dateEnd);
    if (finishTrail.crowd && (CROWDS as readonly string[]).includes(finishTrail.crowd)) setCrowd(finishTrail.crowd as Crowd);
    if (finishTrail.diff && (DIFF_OPTIONS as readonly string[]).includes(finishTrail.diff)) setDiff(finishTrail.diff as typeof diff);
    if (finishTrail.surface?.length) setTerrain(new Set(finishTrail.surface));
    if (finishTrail.tags?.length) setTags(new Set(finishTrail.tags));
    if (finishTrail.stars) setPaws(finishTrail.stars);
    if (finishTrail.desc) setNote(finishTrail.desc);
    if (finishTrail.photos?.length) setPhotos(finishTrail.photos);
    if (fromPlan) {
      // Prejdený plán ide sprievodcom OD ZAČIATKU: trasu smie opraviť, značky pichá teraz.
      // Číselník sa preto NEotvára celý — človek tie kroky naozaj prechádza, nedopisuje ich.
      setStep(1);
      setMaxStep(1);
      setPlanAsk(true);
    } else {
      setStep(3);
      // Číselník sa otvára celý: kto dopĺňa, má kroky 3–5 splnené alebo rozpracované a musí
      // medzi nimi skákať bez toho, aby ich „prechádzal" znova. Zároveň tým hneď svieti
      // červená pri tom, čo chýba — v tomto režime je to celý zmysel obrazovky, nie výčitka.
      setMaxStep(5);
    }
  }, [finishTrail, fromPlan]);

  // Trasa je hotová = dá sa z nej nakresliť čiara (2 kotvy), resp. bod/oblasť má stred.
  const geoDone = geometry.kind === 'route' ? geometry.path.length >= 2 : !!geometry.center;
  // NAJMENŠÍ ZÁPIS — náhľad musí hovoriť to isté, čo mapa. Plná čiara v rámiku by tvrdila
  // trasu, ktorú človek práve odmietol nakresliť.
  const isMinimalGeo = geometry.kind === 'route' && !!geometry.minimal;
  // ⚠️ Viacdňovosť je ODPOVEĎ z kroku 1, nie dôsledok dátumu (viď `multiDay` vyššie).
  const isMultiDay = activity === 'hike' && multiDay;
  /**
   * Viacdňový ZÁPIS bez konca nemá z čoho spočítať dni ani noci — a človek si ich už
   * v kroku 2 zapichol ako nocľahy. Do 27. 8. tá istá podmienka strážila `journey`.
   *
   * 🔴 PLÁNU SA NETÝKA (Matej 28. 8. 2026: „chce to odomňa dátum návratu — ale ja ho ešte
   * neviem, je to iba PLAN"). Bol to tvrdý blocker, nie výčitka: celý blok s dátumami
   * vrátane poľa KONIEC stojí za `!isPlan` (nižšie v tomto súbore), takže v pláne sa
   * `dateEnd` nedalo zadať NIKDE — viacdňový plán mal tlačidlo navždy sivé a pod ním
   * hlášku, ktorá pýtala údaj bez políčka.
   *
   * Nie je to len obídenie: plán sa v tom istom kroku sám pýta „presný deň / týždeň /
   * mesiac", teda vedome pripúšťa, že termín ešte nie je istý. Žiadať pri tom presný
   * dátum návratu si protirečí. Koniec sa doplní až pri zápise, keď sa plán prejde
   * (`fromPlan` vedie človeka sprievodcom od začiatku) — a tam sa naďalej vyžaduje.
   */
  const multiDayIssue = !isPlan && isMultiDay && !dontRemember && !(!!dateEnd && dateEnd > date);
  /**
   * Dĺžka výletu v dňoch — vrátane oboch krajných dní (od pondelka do stredy = 3 dni, 2 noci).
   * ⚠️ Ráta sa z reťazcov `YYYY-MM-DD` cez `Date.UTC`, nie z lokálnych dátumov: pri prechode
   * letného času má jeden z dní 23 alebo 25 hodín a delenie 86 400 000 by vrátilo 2,96 dňa.
   */
  const tripDays = (() => {
    if (!isMultiDay || !date || !dateEnd || dateEnd <= date) return 0;
    const [ay, am, ad] = date.split('-').map(Number);
    const [by, bm, bd] = dateEnd.split('-').map(Number);
    const a = Date.UTC(ay, am - 1, ad);
    const b = Date.UTC(by, bm - 1, bd);
    return Math.round((b - a) / 86400000) + 1;
  })();

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
  /**
   * Zapnutie/vypnutie chipu. `fromMore` = chip z DRUHÉHO radu — len ten vyvolá tichú ponuku
   * miesta, a len pri zapnutí. Pri vypnutí ponuka mizne s ním; keby ostala visieť, pýtala by
   * sa na výlet, ktorý sa práve odvolal.
   */
  const toggleChip = (id: string, fromMore: boolean) => {
    const on = !chips.has(id);
    toggleSet(chips, setChips, id);
    setChipAsk(fromMore && on ? id : (chipAsk === id ? null : chipAsk));
  };
  /**
   * Názov chipu — slovník, s anglickým textom z `tripCategories.ts` ako záchranou. Chip bez
   * prekladu tak ukáže „Campsite", nie holé `camp`.
   */
  const chipTx = (id: string, fallback: string) => {
    const k = `pack.map.chipLabel.${id}`;
    const v = t(k);
    return v === k ? fallback : v;
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
      id: finishTrail ? finishTrail.id : `${isPlan ? 'plan' : 'log'}-${now}`,
      existingTripId,
      finishTripId: finishTrail?.id,
      // Rozlišuje DOPĹŇANIE (prepíš polia) od PREJDENÉHO PLÁNU (prepíš polia AJ trasu, označ
      // za prejdený, zruš plán). Volajúci sa nemá ako spýtať formulára — nesie sa to draftom,
      // rovnakou cestou ako `finishTripId`.
      finishFromPlan: fromPlan || undefined,
      state: isPlan ? 'planned' : 'walked',
      // Plán nejde cez schvaľovaciu frontu (§4.3 platí len pre walked) — objaví sa hneď.
      // Pri zápise je to placeholder, finálna hodnota sa dorátava pri submite (missingFields).
      approval: isPlan ? 'approved' : 'draft',
      visibility: isPlan ? visibility : undefined,
      // DOPRAVA — len plán a len keď je čo povedať. Prázdne pole sa neukladá ako prázdny
      // reťazec: karta výletu sa pýta `travel?`, nie `travel !== ''`.
      travelMode: isPlan && travelMode ? travelMode : undefined,
      travelFrom: isPlan && travelFrom.trim() ? travelFrom.trim() : undefined,
      // Vyzdvihnutie je sľub CUDZÍM ľuďom — na súkromnom výlete ho nemá kto prijať, takže
      // ani neodchádza. Bez toho by stačilo prepnúť plán na súkromný a v dátach by ostalo
      // „mám dve voľné miesta" pre nikoho.
      pickup: isPlan && visibility === 'open' && pickup ? true : undefined,
      pickupSeats: isPlan && visibility === 'open' && pickup ? pickupSeats : undefined,
      name: name.trim(),
      activity,
      geometry,
      country: effCountry,
      region: effCountry === 'sk' && effRegion ? (effRegion as 'W' | 'C' | 'E') : undefined,
      dateKind: dontRemember ? 'flexible' : 'exact',
      date: dontRemember ? undefined : (date || undefined),
      dateEnd: !dontRemember && isMultiDay ? dateEnd : undefined,
      // Ukladá sa ODPOVEĎ, nie odvodenina: bez nej by sa obnovený koncept vrátil ako
      // jednodňový vždy, keď mu ešte chýba koniec — a s ním by zmizli aj nocľahy.
      multiDay: isMultiDay || undefined,
      crew,
      diff: !isPlan && isHikeLike && diff ? diff : undefined,
      surface: !isPlan && isHikeLike && terrain.size > 0 ? Array.from(terrain) : undefined,
      crowd: !isPlan && crowd ? crowd : undefined,
      tags: tags.size > 0 ? Array.from(tags) : undefined,
      // CHIPY — na pláne rovnako ako na zápise. „Ideme piknikovať" je legitímny plán a chip
      // je jediné miesto, kde sa to dá povedať; náročnosť a ruch sú správy Z CESTY, chip nie.
      chips: chips.size > 0 ? Array.from(chips) : undefined,
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
  }, [name, activity, geometry, effCountry, effRegion, dontRemember, date, isMultiDay, dateEnd, crew, isHikeLike, diff, terrain, crowd, tags, chips, paws, photos, effCoverIndex, coverY, note, authorName, existingTripId, isPlan, visibility, step, finishTrail, fromPlan, travelMode, travelFrom, pickup, pickupSeats]);

  // §4.3: toSubmit blokuje odoslanie úplne; toApprove (len walked) rozhoduje draft vs pending.
  const missing = missingFields(draft);
  // `missingFields` vracia i18n KĽÚČE (model nemá jazyk) — text vzniká až tu.
  const missingTx = (keys: string[]) => keys.map((k) => t(k)).join(', ');
  const canSubmit = missing.toSubmit.length === 0 && !multiDayIssue;
  const finalApproval: ApprovalStatus = missing.toApprove.length === 0 ? 'pending' : 'draft';

  // §5.3 poistka — pýta sa, nezablokuje. `onPickExisting` (živí duchovia počas kreslenia) tu nie
  // je zapojený (nie je v props kontrakte tohto komponentu) — len submit-time kontrola.
  // existujúca magistrála je zámerný presný repeat, nie kandidát na duplicitu — nepýtať sa.
  // ⚠️ Pri dopĺňaní sa duplicita NEHĽADÁ: dopĺňaný výlet je v `allTrails` sám, takže by
  // našiel seba a pýtal sa „naozaj chceš zapísať to isté ešte raz?" pri každom uložení.
  const dup = useMemo(() => (existingTripId || finishTrail ? null : findDuplicate(geometry, allTrails)), [existingTripId, finishTrail, geometry, allTrails]);

  // Priebežné ukladanie. `draft` je `useMemo`, takže effect beží len keď sa naozaj niečo
  // zmenilo — nie na každý render. Prázdny formulár sa neukladá, inak by otvorenie a
  // zatvorenie ADD flow bez jediného písmena prepísalo zálohu skutočnej rozrobenej práce.
  useEffect(() => {
    if (restored) return; // ponuka na obnovu je na obrazovke — nezmaž, čo ponúkame
    // Dopĺňanie existujúceho výletu NIE JE rozrobený náčrt. Bez tejto brzdy by prepísalo
    // zálohu skutočne rozrobeného výletu a ten by sa už nemal ako vrátiť.
    if (finishing) return;
    const hasSomething = !!draft.name || (draft.geometry?.kind === 'route' && draft.geometry.path.length > 0);
    if (!hasSomething) return;
    const { photos: _photos, ...withoutPhotos } = draft;
    writeAddDraft(withoutPhotos as AddTripDraft);
  }, [draft, restored]);

  /**
   * ── PREVÝŠENIE SA DOPOČÍTA EŠTE PRED ZÁPISOM (Matej 2026-08-25, Rokoš: „prevýšenie
   *    pri rokoši chýba — skontroluj prečo sa nezapísalo") ────────────────────────────────
   *
   * Výšky ťahá `GeometryPicker` z proxy po každej kotve a kým nie sú, readout ukazuje `↑ …`.
   * HOTOVO na to ale NIKDY nečakalo: kto dokreslil trasu a hneď pokračoval — a to je normálny
   * postup, nie zhon — uložil výlet s `ascentM: null`. Číslo sa už nemalo kde dopočítať
   * (prepočet spúšťa jedine ďalší klik do mapy, a ten po dokreslení nepríde), takže výlet
   * ostal bez prevýšenia natrvalo. Navonok to nevyzerá ako chyba, len ako trasa po rovine.
   *
   * Druhá, rovnako tichá príčina: proxy odmietne (rate limit 150/h na člena) — vtedy je pole
   * prázdne tak či tak a čakať nemá zmysel.
   *
   * Preto: dopočítaj TU, ale s krátkym stropom. Zápis je jediný moment, keď človek aj tak
   * čaká, takže sekunda navyše nikoho nezdrží; a keď sieť mlčí, po `ASCENT_WAIT_MS` sa uloží
   * bez prevýšenia — presne ako doteraz. Nikdy sa neuloží NIŽŠIE číslo než sa dá získať:
   * `calibratedAscent` beží nad celou stopou odznova (§5.2a), nie po častiach.
   */
  const [saving, setSaving] = useState(false);
  const ASCENT_WAIT_MS = 4000;

  const resolveAscent = async (): Promise<number | null> => {
    if (metricsRef.current.ascentM != null) return metricsRef.current.ascentM;
    const g = draft.geometry;
    if (!g || g.kind !== 'route') return null;
    const path = g.snapPath?.length ? g.snapPath : g.path;
    if (path.length < 2) return null;
    const sampled = interp(path, SPACING);
    if (missingElevationCount(sampled) === 0) return calibratedAscent(path, elevAt);
    try {
      await Promise.race([
        ensureElevations(sampled),
        new Promise((res) => setTimeout(res, ASCENT_WAIT_MS)),
      ]);
    } catch { /* sieť mlčí — uloží sa bez prevýšenia, rovnako ako doteraz */ }
    // Aj čiastočná cache dá lepšie číslo než nič: `calibratedAscent` chýbajúce body preskočí.
    return missingElevationCount(sampled) < sampled.length ? calibratedAscent(path, elevAt) : null;
  };

  const doSubmit = async () => {
    setSubmitError('');
    setSaving(true);
    const ascentM = await resolveAscent();
    setSaving(false);
    const finalDraft: AddTripDraft = {
      ...draft,
      approval: finalApproval,
      km: metricsRef.current.km > 0 ? Number(metricsRef.current.km.toFixed(1)) : undefined,
      ascentM: ascentM ?? undefined,
      minutes: metricsRef.current.minutes ?? undefined,
    };
    const ok = onSubmit(finalDraft);
    if (!ok) { setSubmitError("Couldn't save — storage might be full. Remove something and try again."); return; }
    // Odoslané = už to nie je rozpracované. Bez tohto by sa pri ďalšom otvorení ponúkalo
    // obnoviť výlet, ktorý je dávno v zozname.
    // ⚠️ Pri dopĺňaní sa záloha NEMAŽE — patrí inému, naozaj rozrobenému výletu.
    if (!finishing) clearAddDraft();
    setShowDupWarning(false);
  };
  const handleSubmit = () => {
    if (!canSubmit || saving) return;
    if (dup && !dupConfirmed) { setShowDupWarning(true); return; }
    void doSubmit();
  };
  const confirmDuplicate = () => { setDupConfirmed(true); void doSubmit(); };

  // ── SPRIEVODCA ────────────────────────────────────────────────────────────────────────
  // Poradie krokov je Matejovo (23. 8.), doslova. Kľúč nesie nadpis aj vetu „čo tu mám robiť";
  // ⚠️ Veta „čo tu mám robiť" už NEEXISTUJE v krokoch 3–5 (Matej 2026-08-24) — kľúče
  // `pack.addTrip.step.hint.basics/about/rest` ostávajú v slovníku ako doklad, ale nikto
  // ich nečíta. `STEP_KEYS` slúži naďalej názvom krokov v bodkách 1–5.
  // ⚠️ ŠIESTY KĽÚČ PATRÍ LEN PLÁNU (26. 8.) — zápis sa na krok 6 nikdy nedostane
  // (`STEP_SEQ` ho pre `walked` nemá). Pole je indexované ČÍSLOM KROKU, nie poradím, takže
  // nová položka musí ísť na koniec; vsunúť ju medzi ostatné by prečíslovalo kroky
  // v uložených náčrtoch.
  const STEP_KEYS = ['route', 'notes', 'basics', 'about', 'rest', 'departure'] as const;
  const stepKey = STEP_KEYS[step - 1] ?? 'route';

  // MAGISTRÁLA sa nekreslí, VYBERÁ sa zo zoznamu (§1/§2 zadania journey-pick) — v tom prípade
  // krok 1 nie je mapa, ale výber, takže lišta kreslenia by nemala čo obsluhovať.
  const journeyPicking = journeyPick && !drawManually;
  const drawingStep = !!activity && step === 1 && !journeyPicking && !restored;

  // KROK 2 JE TIEŽ NA MAPE (Matej 2026-08-23). Formulárové prostredie sa vracia až krokom 3 —
  // odkazy sa pichajú do mapy, takže obrazovkou musí byť mapa, nie zoznam otázok o nej.
  const notesStep = !!activity && step === 2 && !restored;
  const mapPhase: 'off' | 'draw' | 'notes' = drawingStep ? 'draw' : notesStep ? 'notes' : 'off';
  useEffect(() => { onMapPhase?.(mapPhase); }, [mapPhase, onMapPhase]);
  /**
   * ⚠️ HLÁSI SA PRÍZNAK, NIE POLE SÚRADNÍC. Hore z toho treba len „existuje trasa?", a pole
   * by bola nová referencia pri každom vykreslení ⇒ `setState` v PackMap ⇒ ďalšie vykreslenie
   * ⇒ nekonečná slučka. Boolean sa mení len vtedy, keď sa naozaj zmení odpoveď.
   */
  const hasDrawnLine = geometry.kind === 'route'
    && ((geometry.snapPath?.length ? geometry.snapPath.length : geometry.path.length) >= 2);
  useEffect(() => { onHasRoute?.(hasDrawnLine); }, [hasDrawnLine, onHasRoute]);
  useEffect(() => () => { onHasRoute?.(false); }, [onHasRoute]);
  useEffect(() => () => { onMapPhase?.('off'); }, [onMapPhase]);


  // DOROVNANIE PO OBNOVE. Beží až keď je geometria naozaj v stave (obnova ju nastavuje
  // v tom istom kliku) a mapa existuje; padding zhora nechá miesto AInubisovi, zdola panelu.
  useEffect(() => {
    if (!refitRef.current) return;
    const map = mapRef.current;
    if (!map) return;
    const pts: LatLngTuple[] = geometry.kind === 'route'
      ? (geometry.snapPath?.length ? geometry.snapPath : geometry.path)
      : geometry.center ? [geometry.center] : [];
    if (!pts.length) return;
    refitRef.current = false;
    // ⚠️ VODOROVNÚ REZERVU DRŽÍ `dockPadX()`, NIE ČÍSLO 24 (Matej 2026-08-26: „mapu treba
    // vycentrovať… na stred medzi ľavým panelom a pravým okrajom"). S 24 px na oboch stranách
    // sa trasa vycentrovala do CELÉHO okna a jej ľavá časť skončila pod ľavým stĺpcom.
    const [padL, padR] = dockPadX();
    map.fitBounds(L.latLngBounds(pts), {
      paddingTopLeft: [padL, 110],
      paddingBottomRight: [padR, 260],
      maxZoom: 15,
      animate: true,
    });
  }, [geometry, mapRef]);

  // Krok 1 sa neopúšťa bez geometrie — aj keby to bol len najmenší zápis (štart a cieľ).
  // Inak by človek prešiel celý sprievodca a spadol až na uložení.
  const nextBlocked = step === 1 && !geoDone;

  /**
   * ── PLÁN MÁ TRI KROKY, ZÁPIS PÄŤ (Matej 2026-08-25, rozšírené 26. 8.) ─────────────────
   *
   * „pri plánovaní výletu bude kreslenie trasy a druhý krok bude názov, dátum, fotka sa
   *  priidá z našej databázy" — kroky 2 (odkazy), 4 (o trase) a 5 (hodnotenie, fotky) sú
   * o mieste, na ktorom človek ešte nebol. Do teraz nimi plán PRECHÁDZAL, len boli z väčšiny
   * prázdne, takže sa tváril ako nedokončený zápis.
   *
   * ⚠️ ČÍSLA KROKOV SA NEPREČÍSLOVALI — mení sa PORADIE, ktorým sa nimi chodí. Krok „základ"
   * ostáva trojkou v celom súbore (`step === 3`, `stepMissing[3]`, autosave `restored.step`);
   * plán ho len ukáže ako druhý v číselníku. Prečíslovanie by znamenalo, že rozrobený draft
   * uložený pred touto zmenou by sa obnovil na inom kroku, než na ktorom človek skončil.
   *
   * ── TRETÍ KROK PLÁNU = ODCHOD (Matej 2026-08-26) ──────────────────────────────────────
   * „2. krok by som dal meno, miesto a detaily a 3. krok by som pridal kedy + doprava na
   *  miesto… ako idem na výlet (autom, vlakom…) a odkiaľ idem, ľudia sa môžu vyzdvihnúť
   *  po ceste."
   * Preto DÁTUM a VIDITEĽNOSŤ odišli z trojky do šestky: trojka odpovedá „čo to je a kde",
   * šestka „kedy a ako sa tam dostaneme". Vyzdvihnutie a viditeľnosť stoja vedľa seba
   * zámerne — na súkromnom výlete nie je koho vyzdvihnúť, takže sa políčko ani neukáže.
   * Šestka je NOVÉ číslo, nie posunutá štvorka: štvorka a päťka patria zápisu a plán cez ne
   * neprechádza. Nižšie voľné číslo neexistuje.
   */
  const STEP_SEQ = useMemo<readonly number[]>(() => (isPlan ? [1, 3, 6] : [1, 2, 3, 4, 5]), [isPlan]);
  const seqPos = Math.max(0, STEP_SEQ.indexOf(step));
  const isLastStep = step === STEP_SEQ[STEP_SEQ.length - 1];
  /** Nasledujúci krok V PORADÍ (nie `step + 1`) — pri pláne je za jednotkou trojka. */
  const stepAfter = (n: number) => STEP_SEQ.find((v) => v > n) ?? STEP_SEQ[STEP_SEQ.length - 1];

  /**
   * ⚠️ OBNOVA MÔŽE PRISTÁŤ NA KROKU, KTORÝ V PORADÍ NIE JE. Autosave (`readAddDraft`) drží
   * číslo kroku, a rozrobený zápis prepnutý na plán — alebo draft uložený pred touto zmenou —
   * tak vie skončiť na dvojke či štvorke, ktoré plán nemá. Bez tohto dorovnania by päta
   * nevykreslila ani „Ďalej", ani „Uložiť" (`isLastStep` je false a `stepAfter` by vrátil
   * najbližší vyšší krok až po kliku, ktorý sa nedá spraviť) — obrazovka bez východu.
   * Skáče sa DOZADU na najbližší platný krok, nie dopredu: dopredu by to preskočilo pole,
   * ktoré človek ešte nevyplnil.
   */
  useEffect(() => {
    if (STEP_SEQ.includes(step)) return;
    const back = [...STEP_SEQ].reverse().find((v) => v < step);
    setStep(back ?? STEP_SEQ[0]);
  }, [STEP_SEQ, step]);

  const goNext = () => { if (!nextBlocked) setStep(stepAfter(step)); };
  const goPrev = () => {
    const prev = seqPos > 0 ? STEP_SEQ[seqPos - 1] : null;
    if (prev != null && prev >= minStep) { setStep(prev); return; }
    if (finishing) { onClose(); return; }
    setActivity('');
    setTripMode(null);
    setPendingActivity(null);
  };

  // ── KROK 2: ODKAZY NA TRASU ───────────────────────────────────────────────────────────
  // Matej: „pridaj na trasu ODKAZY (pri logu): parkovisko? — na každé bude vyzvaný, kde si
  // parkoval; bolo na trase nebezpečenstvo? tajné miesto, tip?" Tri otázky, každá
  // preskočiteľná. Existujúci systém zápisov sa len VYVOLÁ — nič nové sa nestavia.
  const NOTE_ASKS: Array<{ group: NoteGroup; qKey: string; ctaKey: string }> = [
    { group: 'parking', qKey: 'pack.addTrip.step.askParking', ctaKey: 'pack.addTrip.step.markParking' },
    { group: 'warning', qKey: 'pack.addTrip.step.askWarning', ctaKey: 'pack.addTrip.step.markWarning' },
    { group: 'comment', qKey: 'pack.addTrip.step.askTip', ctaKey: 'pack.addTrip.step.markTip' },
  ];
  /**
   * ── VIACERO ZNAČIEK ZA SEBOU (Matej 2026-08-27) ──────────────────────────────────────────
   *
   * „po vybratí smie človek klikať viacero miest za sebou bez prepínania."
   *
   * Do 27. 8. sa otázka po KAŽDEJ položenej značke sama posunula ďalej — takže dve parkoviská
   * (a na viacdňovke aj dva nocľahy) sa nedali označiť bez toho, aby sa človek vrátil
   * o otázku späť. Zadanie to menuje pri nocľahu, ale je to tá istá chyba pri všetkých
   * skupinách, preto sa opravuje raz a pre všetky.
   *
   * ⚠️ ČO POSUN NAHRADILO: potvrdenie, že zápis prebehol, nesie zoznam položených značiek
   * (`PlacedNotes` pod otázkou) a počítadlo v pilulke skupiny. Bez jedného z nich by človek
   * naozaj nevedel, či sa značka uložila — a práve to bol pôvodný dôvod auto-posunu.
   * ⚠️ Vedľajší dôsledok, s ktorým treba rátať: krok 2 sa odteraz NEDÁ prejsť bez ťuknutia
   * na ĎALEJ. To je zámer — preskočenie má byť vedomé (rovnaký dôvod, prečo tu nie je jedno
   * tlačidlo „pokračovať" cez celý krok).
   */
  const placedCount = placedNotes?.length ?? 0;
  /** koľko značiek už leží v PRÁVE otvorenej otázke — z toho sa mení text vedľajšieho tlačidla */
  const placedInGroup = (g: NoteGroup): number =>
    (placedNotes ?? []).filter((n) => groupOf(n.kind as NoteKind) === g).length;

  /**
   * ── KROK SA OTVÁRAL V STAVE, KTORÝ SI SÁM ZAKAZOVAL (Matej 2026-08-27, oprava 28. 8.) ──
   *
   * Po HOTOVO sa mapa vycentruje na CELÚ trasu (`fitBounds` nižšie, strop z15). Devätnásť
   * kilometrov sa zmestí až okolo z13 — lenže zapichnutie odkazu vyžaduje
   * `TRIP_HOLD_MIN_ZOOM`. Prvé, čo appka po vstupe do kroku 2 povedala, bolo teda
   * „Parkovisko — priblíž si mapu": sama si nastavila výrez, v ktorom sa nedá nič urobiť.
   *
   * Rieši sa to priblížením, NIE znížením prahu — parkovisko sa má trafiť na meter
   * (feedback_prah_z_ineho_kontextu_zabije_vnoreny_tok).
   *
   * ⚠️ LEN KEĎ JE MAPA ĎALEJ, NEŽ TREBA. Kto si už priblížil svoje parkovisko, nesmie mu
   * výrez odskočiť pod rukou. A po zrušení označovania sa NEVRACIA nič: človek si medzitým
   * mohol mapu posunúť tam, kam naozaj chcel.
   * Stred berieme z TRASY, nie z okna: na telefóne je trasa vrámovaná nad dok (dolná tretina
   * obrazovky), takže geometrický stred mapy leží pod ňou a priblíženie doňho by trasu
   * vytlačilo z výrezu.
   */
  const zoomForPlacing = () => {
    const map = mapRef.current;
    if (!map || map.getZoom() >= TRIP_HOLD_MIN_ZOOM) return;
    const pts: LatLngTuple[] = geometry.kind === 'route'
      ? ((geometry.snapPath?.length ? geometry.snapPath : geometry.path) as LatLngTuple[])
      : geometry.center ? [geometry.center] : [];
    const center = pts.length ? L.latLngBounds(pts).getCenter() : map.getCenter();
    map.flyTo(center, TRIP_HOLD_MIN_ZOOM, { duration: 0.6 });
  };

  /**
   * ── CHIP ZAPÍNA OZNAČOVANIE, NIE JE TO FILTER (Matej 2026-08-27) ──────────────────────
   *
   * „chip → OZNAČ" boli dva kliky na jednu vec a chip s bodovým štítkom pri sebe vyzeral
   * ako filter, nie ako voľba. Odteraz je ťuk na chip celá akcia: skupina s jediným druhom
   * (parkovisko, tip) spustí označovanie rovno, skupina s deviatimi (upozornenie) najprv
   * vysunie rad hrozieb a označovanie spustí ťuk do neho — poradie „najprv viem ČO
   * označujem, potom ukazujem KDE" ostáva (Matej 28. 8., rozhodnutie o úlohe 5).
   * Vedľajší zisk: parkovisko prestalo byť predvybraté, lebo predvoľba už neexistuje —
   * nič sa nezapichne bez ťuku do chipu.
   */
  const startPlacing = (g: NoteGroup, k?: NoteKind) => {
    zoomForPlacing();
    onPlaceNote?.(g, k);
  };

  // ── OVLÁDANIE NA MAPE ─────────────────────────────────────────────────────────────────
  // Jedna lišta, dva kroky. V kroku 1 nesie nástroje kreslenia (kreslí si ich picker sám),
  // v kroku 2 dostane cez `panel` otázky o odkazoch — tvar ani miesto ovládania sa pod prstom
  // nemenia, mení sa len to, na čo sa pýta.
  // NA PC OSTÁVA KROK 2 V PANELI. Matejova výhrada bola mobilná („nie prostredie krokov,
  // ale dolný panel") a na PC panel STOJÍ VEDĽA mapy — mapa je tam vidno aj tak, takže
  // presúvať otázky do doku by len znamenalo, že vedľa seba svietia dve škatule a jedna
  // z nich je prázdna.
  // ⚠️ KROK 2 JE V LIŠTE VŽDY (Matej 2026-08-24). Do 24. 8. tu stálo `&& !besidePanel`, takže
  // na PC sa tie isté tri otázky kreslili do panela vedľa mapy. Bol to jediný krok s dvoma
  // podobami — a práve on hovorí „ukáž na mape, kde si parkoval".
  const notesInBar = notesStep;
  // MOŽNOSTI SÚ VIDNO HNEĎ (Matej 2026-08-23: „človek nevie čo može označiť, nevidí možnosti…
  // musia byť ihned viditelne nie schované že najprv vyber bod a potom tam daj niečo čo ani
  // nevieš čo je"). Otázka „bolo tam nebezpečenstvo?" mala jediné tlačidlo OZNAČ NA MAPE a
  // deväť druhov hrozby sa vynorilo až v paneli PO umiestnení bodu.
  // Platí len pre skupiny, kde je naozaj z čoho vyberať — parkovisko a tip majú jeden druh,
  // takže mriežka s jednou dlaždicou by bola ozdoba a nie voľba.
  const askGroup = NOTE_ASKS[Math.min(noteAsk, NOTE_ASKS.length - 1)].group;
  const askKinds = GROUP_KINDS[askGroup];
  /** posledná z troch otázok — jej tlačidlo nevedie na ďalšiu otázku, ale rovno do kroku 3 */
  const lastAsk = noteAsk >= NOTE_ASKS.length - 1;

  /**
   * ── RÁMOVANIE OBOCH MAPOVÝCH KROKOV MÁ JEDNÉHO VLASTNÍKA ──────────────────────────────
   *
   * Stál tu druhý `fitBounds` (strážca `fittedRef`) s dvoma výrezmi: celá trasa po dokreslení
   * (Matej 23. 8.: „po dokončení trasy nech človek vidí celú trasu") a pri otázke o parkovisku
   * štvorec ~400 m okolo štartu (Matej 25. 8.: „daj zoom na štart, tam bude parkovisko").
   *
   * ⚠️ ZOOM NA ŠTART ZANIKOL 26. 8. — je to ZMENA MATEJOVHO VLASTNÉHO ZADANIA Z 25. 8., nie
   * jeho opomenutie: „v 2. kroku mi pozícia uteká ďaleko a musím vždy zoomovať — pozícia musí
   * byť celá čo najviac zoomnutá, aby sa zmestila do časti, kde je viditeľná mapa."
   * Vlani to malo logiku pri JEDNEJ z troch otázok; v praxi to znamenalo, že hneď po dokreslení
   * trasy mapa odskočila na jej začiatok a zvyšok ostal mimo okna. Kto parkoval inde než na
   * štarte, musel aj tak oddialiť — a kto chcel pichnúť tip, videl najprv cudzí výrez.
   *
   * Rámovanie robí odteraz JEDEN effect nižšie (spúšťač `mapPhase`). Dva fity na tú istú
   * obrazovku sa aj tak prebíjali: druhý prepísal prvý, len s oneskorením a animáciou —
   * a práve to vyzeralo, že mapa „ujde" sama od seba.
   */
  /**
   * ⚠️ DLAŽDICA HROZBY UŽ NIE JE VÝBER, JE TO AKCIA — a preto sa ani nezvýrazňuje
   * (2026-08-28). Odkedy ťuk do nej rovno spúšťa označovanie (`startPlacing`), nemá čo držať
   * „vybratý druh": stav toho, čo sa práve zapichuje, žije počas označovania v `placingKind`
   * v PackMap a panel je v tej chvíli skrytý. Zvýraznenie z panela sa s ním rozchádzalo —
   * kto si druh prepol v lište nad mapou, našiel po návrate podsvietený ten predošlý.
   * Rad hrozieb sa tak číta rovnako ako chipy nad ním: ponuka úkonov, nie prepínač.
   */
  // ── KOĽKO ICH JE A KDE STOJÍM (Matej 2026-08-24) ──────────────────────────────────────
  // „v 2. kroku je to chaoticky, musí tam byť jasný postup P-N-T (parkovisko, nebezpečenstvo,
  //  tip), aby človek mal prehľad čo pridáva, lebo som sa tam zamotal."
  //
  // Otázky sa striedali jedna po druhej a nikde nebolo vidno, že sú TRI ani ktorá je na rade.
  // Krok tak vyzeral ako nekonečná rada otázok — človek nevedel, či odpovedaním niečo končí,
  // alebo len otvára ďalšiu.
  // ⚠️ Nie sú to bodky 1–5 zhora. Tie hovoria, v ktorom kroku sprievodcu človek stojí; toto
  // hovorí, kde stojí VNÚTRI kroku 2. Preto iný tvar (písmeno + názov, nie číslo v krúžku) —
  // dva rovnaké prúžky nad sebou by si konkurovali.
  /**
   * ── ZELENÁ = HOTOVO A ZAPLATENÉ, ČERVENÁ = PREJDENÉ NAPRÁZDNO (Matej 2026-08-24) ──────
   *
   * „po označení parkoviska, upozornenia a tipu si predstavujem, že tie označené a hotovo,
   *  tak treba tie pils vyfarbiť na zeleno, aby bolo jasné, že to je OK hotovo, a možno dať
   *  do malého chipu aj +3 body; a ak nebude vyplnené, tak na červeno a 0 bodov."
   *
   * Do teraz sa pilulka zlatila podľa toho, či otázka UŽ BOLA na rade — teda podľa postupu,
   * nie podľa výsledku. Preskočené parkovisko vyzeralo presne ako označené a človek sa
   * o rozdiele dozvedel až v kroku 4.
   *
   * ⚠️ STAV SA ČÍTA ZO ZNAČIEK, NIE Z `noteAsk`. Kto sa vráti na už zodpovedanú otázku a
   * značku pridá (alebo ju zmaže z chipu nižšie), musí vidieť zmenu okamžite.
   *
   * ── TRI FARBY, ŽIADNA NEUTRÁLNA (Matej 2026-08-26, druhé kolo) ─────────────────────────
   * „2. krok všetky nevyplnené chipy budú modré alebo červené alebo zelené — výber modré,
   *  červené neoznačené a zelené hotové."
   *
   * ⚠️ TOTO RUŠÍ PRAVIDLO Z 24. 8., KTORÉ TU STÁLO: „nedotknutá (ešte pred ňou) je neutrálna
   * — červená by človeku vyčítala, že neurobil niečo, k čomu sa ešte nedostal." Matej to
   * prebil výslovne a dôvod sedí: neutrálna a splnená sa na papyruse od seba nedali odlíšiť
   * na prvý pohľad, takže tri chipy vyzerali ako jeden stav. Odteraz je červená stav „ešte
   * nie", nie výčitka — a keďže je JEDINÝ ďalší stav modrý (práve na rade) alebo zelený
   * (hotové), rad chipov je čitateľný periférne.
   *
   * Body sú `POINTS.note` z bodovej ekonomiky (lib/tripPoints.ts), nie číslo napísané sem —
   * cena odkazu žije na jednom mieste a chip ju len ukazuje.
   */
  const noteHave = useMemo(() => {
    const set = new Set<NoteGroup>();
    for (const n of placedNotes ?? []) set.add(groupOf(n.kind as NoteKind));
    return set;
  }, [placedNotes]);

  const noteTrack = (
    <div className="atl-ntrack" role="list" aria-label={t('pack.addTrip.step.name.notes')}>
      {NOTE_ASKS.map((a, i) => {
        const has = noteHave.has(a.group);
        // Červená je KAŽDÁ neoznačená okrem tej, na ktorej človek práve stojí — tá je modrá.
        // (Do 26. 8. tu bolo `i < noteAsk`, teda len otázky nechané za sebou.)
        const empty = !has && i !== noteAsk;
        return (
          <button
            key={a.group}
            type="button"
            role="listitem"
            className={`atl-ntrack-i${i === noteAsk ? ' on' : ''}${has ? ' ok' : ''}${empty ? ' miss' : ''}`}
            /* ⚠️ ŤUK NA CHIP JE CELÁ AKCIA (viď `startPlacing`). Pri upozornení len otvorí
               rad hrozieb — označovanie tam spustí až vybraná hrozba, aby kurzor niesol
               medveďa a nie rozcestník ⚠️ (dôvod v `MapNoteCursor.tsx`). */
            onClick={() => {
              setNoteAsk(i);
              if (GROUP_KINDS[a.group].length === 1) startPlacing(a.group);
            }}
            aria-current={i === noteAsk ? 'step' : undefined}
            /* ── FARBA HOVORÍ STAV, NIE SKUPINU (Matej 2026-08-26, druhé kolo) ───────────
               Ráno tu ešte stálo, že aktívnu možnosť farbí jej skupina (`--ntk` z
               `GROUP_TINT`: parkovisko modré, upozornenie červené, tip zelený). Na rade
               troch chipov to nefungovalo: „upozornenie, na ktorom práve stojím" bolo
               červené a „tip, na ktorom práve stojím" zelený — teda presne tie dve farby,
               ktoré v tom istom rade znamenajú NEOZNAČENÉ a HOTOVÉ. Skupinová farba tak
               tvrdila stav, ktorý neplatil.
               Farbu skupiny nesie ďalej MAPA a dlaždice druhov (`KindGrid tint`) — tam
               žiadny iný význam nekonkuruje. */
          >
            <b>{has ? '✓' : t(`pack.mapNotes.group.${a.group}`).slice(0, 1)}</b>
            <span>{t(`pack.mapNotes.group.${a.group}`)}</span>
            {(has || empty) && (
              <em className="atl-ntrack-pts">{has ? `+${POINTS.note}` : '0'}</em>
            )}
          </button>
        );
      })}
    </div>
  );

  /* ⚠️ FÁZA „VŠETKY TRI OTÁZKY SÚ ZA MNOU" ZANIKLA (Matej 2026-08-28) ────────────────────
     Bola to obrazovka s vetou „hotovo", odkazom „označiť ešte" a zlatým POKRAČOVAŤ — teda
     tretí klik navyše za tým, čo už človek povedal treťou odpoveďou. Tlačidlo poslednej
     otázky vedie odteraz rovno do kroku 3 (`lastAsk`).
     ⚠️ ČO S ŇOU PADLO: AInubisova reakcia na výsledok z 25. 8. („škoda, že si nič neoznačil"
     / pochvala za označené). Vety `step.notesNone` a `step.notesPraise` ostávajú v slovníku,
     ale nemá ich kto povedať — v krokoch 3–5 sprievodca nestojí (`drawBar.active`).
     Spätná väzba o značkách tým nezmizla úplne: rozpis odmeny na konci výletu ich menuje
     samostatnou položkou („3 značky na mape +9"). 🚩 Ak má vetu povedať aj AInubis, potrebuje
     nosič v kroku 3 — to je samostatné rozhodnutie, nie vedľajší účinok tejto úpravy. */
  const notesBody = (
    <>
      {noteTrack}
      <>
          {/* ⚠️ OTÁZKA TU UŽ NESTOJÍ — hovorí ju AInubis hore (Matej 24. 8. 2026: „tá otázka
              kde si parkoval je dole zbytočná, dajme ju ainubisovi"). V paneli ostáva len to,
              čím sa odpovedá. Ušetrený riadok je presne ten, kvôli ktorému sa muselo skrolovať
              na „Späť na trasu". */}
          {askKinds.length > 1 && (
            <KindGrid
              row
              kinds={askKinds}
              selected={null}
              tint={GROUP_TINT[askGroup]}
              /* Ťuk do dlaždice ZAPICHUJE — obrátenie pravidla z 24. 8. („ťuk len vyberá,
                 potom OZNAČIŤ"). Dôvod, pre ktorý vtedy vzniklo, bol, že skupina s jedným
                 druhom mala CTA a skupina s deviatimi nie — teda dva spôsoby tej istej veci.
                 Dnes ho nemá ANI JEDNA: všade je to jeden ťuk do toho, čo označujem. */
              onPick={(k) => startPlacing(askGroup, k)}
            />
          )}
          <div className="atl-noteask-btns">
            {/* PRESKOČIŤ vs. ĎALEJ — to isté tlačidlo, iné slovo (2026-08-27). Kým človek
                v tejto otázke nič neoznačil, naozaj ju PRESKAKUJE; keď už značku položil,
                „preskočiť" by tvrdilo, že o ňu príde. Odkedy sa otázka po značke sama
                neposúva, je to jediná cesta ďalej — a musí povedať, že ňou nič nestráca.

                ⚠️ PRI TRETEJ OTÁZKE JE TO ROVNO POKRAČOVAŤ (Matej 2026-08-28: „po kliknutí
                sa otvorilo CTA Pokračovať, ale pripadá mi to zbytočné — namiesto Ďalej mohlo
                byť hneď Pokračovať, nie?"). Medziobrazovka „hotovo, chceš označiť ešte?"
                zanikla: bola to otázka, na ktorú je odpoveďou chip v rade nad ňou, teda
                jeden ťuk, ktorý je vidno po celý krok. Preskočenie ostáva vedomé — tretia
                otázka sa ním neprejde tichom, len sa neopýta dvakrát.

                ⚠️ A JE TO LAPIS, NIE BLEDÉ TLAČIDLO (Matej 2026-08-28: „tu to Ďalej nie je
                vôbec vidno! CTA musí byť lapisové a dobre viditeľné"). Je to JEDINÉ CTA
                panela, takže plná farebná plocha mu patrí — zvyšok kroku sú chipy v tinte.
                Trieda je tá istá, akú nesie HOTOVO v kroku 1 (`.trp-dbar-done`), nie druhý
                recept na to isté. */}
            <button
              type="button"
              className="trp-dbar-done trp-dbar-done--hero"
              onClick={() => { if (lastAsk) setStep(3); else setNoteAsk((i) => i + 1); }}
            >
              {t(lastAsk
                ? 'pack.addTrip.step.doneNotes'
                : placedInGroup(askGroup) > 0 ? 'pack.addTrip.step.nextAsk' : 'pack.addTrip.step.skip')}
            </button>
            {/* ⚠️ TLAČIDLO OZNAČ TU UŽ NIE JE (Matej 2026-08-27: „chip → OZNAČ sú dva kliky
                na jednu vec"). Označovanie zapína ťuk do chipu skupiny, resp. do dlaždice
                hrozby — viď `startPlacing`. Zostáva jediné tlačidlo, a to je cesta ĎALEJ:
                zlatá `.trp-dbar-done` sa tak v kroku 2 objaví až pod treťou otázkou, kde
                naozaj patrí. Kľúč `step.markShort` ostáva v slovníku (zhrnutie kroku 4).
                Cesta VON z označovania je × v AInubisovej bubline, tá sa nemení. */}
          </div>
      </>
      <PlacedNotes notes={placedNotes} t={t} emptyKey="pack.addTrip.step.noNotesYet" onRemove={onRemoveNote} />
    </>
  );
  const notesPanel = (
    <div className="atl-noteask atl-noteask--bar">
      {notesBody}
    </div>
  );

  // KDE SOM — päť bodiek a názov kroku. Bez toho je krokový sprievodca len formulár, ktorý sa
  // nečakane skrátil. Späť sa dá kliknúť na už prejdený krok.
  // Renderuje sa buď v paneli (kroky 3–5), alebo v hornom páse nad mapou (kroky 1–2) — vždy
  // ten istý uzol, len na inom mieste. `--onmap` zúži popisky, aby sa päť krokov zmestilo
  // vedľa krížika aj na 360 px.
  /**
   * ── ČO KTORÉMU KROKU CHÝBA (Matej 2026-08-25) ──────────────────────────────────────────
   *
   * „kroky 1–5 sú teraz oranžové, ale v 5. kroku by mohli byť farebne odlíšené = oranžové sú
   *  len ak sú nedokončené a ak sú dokončené na 100 % sú zelené… ak sa človek vráti na
   *  nedokončené, tak ainubis na to upozorní: doplň toto, chýba toto (1–2 krok), a 3–5 bude
   *  na červeno svietiť pole neoznačené."
   *
   * ⚠️ „DOKONČENÝ" ZNAMENÁ PRE KAŽDÝ KROK NIEČO INÉ a nedá sa to zovšeobecniť:
   *  · 1 TRASA — nakreslená geometria. Tvrdá podmienka, bez nej sa ďalej nedá.
   *  · 2 ODKAZY — **zodpovedané všetky tri otázky**, NIE „zapichnuté tri značky". Vyžadovať
   *    hrozbu na trase, kde žiadna nebola, by nútilo klamať. Hotovo je, keď človek na P–N–T
   *    odpovedal, aj keď trikrát „nič".
   *  · 3 ZÁKLAD — názov a dátum (to isté, čo `SUBMIT_REQUIRED` blokuje pri odoslaní).
   *  · 4 O TRASE — `APPROVAL_REQUIRED`: náročnosť, povrch, tagy, labky, fotky. Sú to polia,
   *    ktoré rozhodujú, či výlet pôjde von alebo ostane konceptom.
   *  · 5 OSTATNÉ — nič povinné. Svorka aj príbeh sú dobrovoľné, takže krok je zelený hneď,
   *    ako naň človek príde. To nie je diera, to je pravda o tom kroku.
   */
  const stepMissing = useMemo<Record<number, string[]>>(() => ({
    1: geoDone ? [] : ['pack.addTrip.field.geometry'],
    // ⚠️ ZELENÁ AŽ PO PRVEJ ZNAČKE, NIE PO ZODPOVEDANÍ OTÁZOK (Matej 2026-08-25: „keď človek
    // neoznačil v 2. kroku nič, tak nemôže svietiť na zeleno 2 v krúžku, nechajme ju oranžovú
    // — nie je to povinné, ale človek na konci uvidí oranžovú 2 a keď sa vráti, niečo možno
    // doplní. Ak len jednu, tak bude zelená a pochvala.").
    // ⚠️ PREBÍJA TO MOJE PÔVODNÉ PRAVIDLO („hotovo = odpovedal na tri otázky, aj trikrát nič").
    // Matej má pravdu v tom, že oranžová dvojka je POZVÁNKA, nie výčitka: krok ostáva
    // nepovinný (dá sa ísť ďalej aj cez Preskočiť), len sa neoznačí za splnený, keď z neho
    // svorka nič nedostala. Jedna značka stačí — nevyžaduje sa komplet.
    2: placedCount > 0 ? [] : ['pack.addTrip.field.notes'],
    // ⚠️ DÁTUM SI PÝTA TROJKA LEN PRI ZÁPISE (26. 8.). V pláne sa vypĺňa až v šestke —
    // hlásiť ho tu by znamenalo oranžovú dvojku v číselníku za pole, ktoré na tej obrazovke
    // nie je (presne ten omyl, ktorý 26. 8. spravilo hodnotenie medzi krokmi 4 a 5).
    3: [
      ...(name.trim() ? [] : ['pack.addTrip.field.name']),
      ...(isPlan || dontRemember || date ? [] : ['pack.addTrip.field.date']),
    ],
    4: isPlan ? [] : [
      ...(!isHikeLike || diff ? [] : ['pack.addTrip.field.diff']),
      ...(!isHikeLike || terrain.size > 0 ? [] : ['pack.addTrip.field.surface']),
      ...(crowd ? [] : ['pack.addTrip.field.crowd']),
      ...(tags.size ? [] : ['pack.addTrip.field.tags']),
      // fotka tu ZÁMERNE nie je — viď APPROVAL_REQUIRED v addTripModel.ts
    ],
    /**
     * 🔴 HODNOTENIE PATRÍ KROKU 5, LEBO SA VYPĹŇA V KROKU 5 (Matej 2026-08-26).
     *
     * „najprv som nezapísal všetko v 4 kroku, keď som sa vďaka tomu že to nesvietilo na
     *  zeleno vrátil - a opravil, 4 je stále nevýrazná = nezobralo zmenu."
     *
     * Nebola to chyba prekreslenia. `paws` sedelo v zozname chýbajúcich pre KROK 4, ale
     * ovládač (`PawRating`) stojí v KROKU 5 — takže štvorka sa nemala ako stať zelenou,
     * nech človek v nej doplní čokoľvek. Vracal sa opravovať pole, ktoré tam nie je.
     *
     * ⚠️ MENÍ TO PRAVIDLO „KROK 5 NEMÁ NIČ POVINNÉ" z 25. 8. — a je to oprava, nie odchýlka:
     * labky sú v `APPROVAL_REQUIRED` (addTripModel.ts), teda bez nich výlet neprejde
     * schválením. Krok 5 teda povinné pole MÁ, len sa o ňom hlásilo na susednom kroku.
     * Svorka a príbeh ostávajú dobrovoľné.
     */
    5: isPlan ? [] : [
      ...(paws > 0 ? [] : ['pack.addTrip.field.paws']),
    ],
    /**
     * 6 ODCHOD (len plán) — povinný je JEDINE dátum. Doprava, odkiaľ a vyzdvihnutie sú
     * ponuka pre svorku, nie podmienka: kto ešte nevie, ako sa tam dostane, musí vedieť
     * plán založiť tak či tak — inak si ho nezaloží vôbec a svorka sa nedozvie ani to,
     * že sa niekam chystá.
     */
    6: !isPlan || date ? [] : ['pack.addTrip.field.date'],
  }), [geoDone, placedCount, name, dontRemember, date, isPlan, isHikeLike, diff, terrain, crowd, tags, paws]);

  /**
   * ČERVENÁ SA ZAPÍNA AŽ PO NÁVRATE, NIE PRI PRVOM PRÍCHODE.
   * Matej hovorí „ak sa človek VRÁTI na nedokončené" — svietiť na prázdny formulár skôr, než
   * doň niekto stihol napísať prvé písmeno, by bola výčitka za nič.
   */
  const revisited = (n: number) => maxStep > n;
  const missClass = (n: number, filled: boolean) => (!filled && revisited(n) ? ' atl-miss' : '');

  /**
   * ⚠️ Beží LEN pri pláne. V zápise vlastní `date` obyčajný kalendár a tento efekt by ho
   * prepísal prázdnym reťazcom hneď, ako by človek prepol formulár na prejdený výlet.
   */
  useEffect(() => {
    if (!isPlan) return;
    setDate(buildPlanDate(planPrecision, planMonth, planPrecision === 'week' ? planWeek : planDay));
  }, [isPlan, planPrecision, planMonth, planWeek, planDay]);

  useEffect(() => { setMaxStep((m) => Math.max(m, step)); }, [step]);

  const stepDots = (
    <div
      className={`atl-steps${drawingStep || notesInBar ? ' atl-steps--onmap' : ''}`}
      role="tablist"
      aria-label={t('pack.addTrip.step.progress')}
    >
      {/* ⚠️ ČÍSLO NA BODKE JE POZÍCIA V PORADÍ, NÁZOV IDE Z ČÍSLA KROKU. Pri pláne je
          poradie [1, 3] — druhá bodka nesie dvojku, ale otvára krok „základ" (3) a berie si
          jeho meno aj jeho `stepMissing`. Číslovať bodky číslom kroku by dalo „1 3". */}
      {STEP_SEQ.map((n, i) => (
        <button
          key={n}
          type="button"
          role="tab"
          aria-selected={step === n}
          className={`atl-step${step === n ? ' on' : ''}${step !== n && maxStep > n - 1 ? ' done' : ''}${maxStep > n - 1 && stepMissing[n]?.length === 0 ? ' ok' : ''}`}
          onClick={() => { if (n !== step && n <= maxStep && n >= minStep) setStep(n); }}
          disabled={n > maxStep || n < minStep}
          /* ⚠️ ZAMKNUTÝ KROK MUSÍ POVEDAŤ PREČO (Matej 2026-08-26: „tak som sa vrátil a označil
             hodnotenie, no už som sa nevedel vrátiť na 1-2, neflagujem len sa pýtam či je to ok").
             Zámok je ZÁMER a platí LEN pri dopĺňaní konceptu (minStep, viď jeho komentár):
             trasa je vtedy uložená a väzba značiek na výlet sa neukladá. Lenže na obrazovke to
             nebolo napísané nikde — tlačidlo len nereagovalo, čo sa nedá odlíšiť od poruchy.
             V BEŽNOM ZÁPISE ZAMKNUTÉ NIE JE a nikdy nebolo (overené naživo 26. 8.: z kroku 5
             sa dá kliknúť späť na 1 aj 2). */
          title={n < minStep ? t('pack.addTrip.step.lockedInDraft') : undefined}
        >
          <b>{i + 1}</b>
          <span>{t(`pack.addTrip.step.name.${STEP_KEYS[n - 1]}`)}</span>
        </button>
      ))}
    </div>
  );

  /**
   * ── NÁVRAT NA MAPU RÁMUJE HOTOVÚ TRASU (Matej 2026-08-25) ──────────────────────────────
   *
   * „zobrazilo sa mi to odzoomované až na celé Slovensko… musí sa zobraziť konkrétna
   *  nakreslená trasa, aby človek nemusel toľko zoomovať."
   *
   * Rámovanie celej krajiny je správne pre PRÁZDNU mapu v kroku 1 — vtedy človek ešte hľadá,
   * kde bol. Keď sa však na krok 1 alebo 2 VRACIA z kroku 3–5, trasa už existuje a ukázať mu
   * namiesto nej pohľad na štát znamená, že si ju musí znovu nájsť a priblížiť.
   *
   * ⚠️ Beží LEN pri vstupe na mapu (`mapPhase`), nie pri každej zmene trasy — inak by mapa
   * odskakovala po každej kotve, ktorú človek položí.
   * ⚠️ Rezerva je tá istá, akú drží `FitBounds` pre krajinu (`dockFitPadding`) — dole dok,
   * hore bublina. Dva rôzne obsahy, jedno okno.
   * Prednosť má prichytená stopa: kotvy sú len vrcholy, obálka po chodníkoch je širšia.
   */
  /**
   * ⚠️ SPÚŠŤAČ JE `mapPhase`, NIE `onMap` (Matej 2026-08-26: „v 2. kroku treba vylepšiť
   * pozíciu, lebo mi uteká ďaleko a musím vždy zoomovať — pozícia musí byť celá čo najviac
   * zoomnutá, aby sa zmestila do časti, kde je viditeľná mapa").
   *
   * `onMap` je boolean a v krokoch 1 aj 2 je `true`, takže prechod KRESLENIE → ZNAČKY ním
   * neprejde a mapa ostala presne tam, kde ju človek nechal pri poslednej kotve — teda
   * priblížená na koniec trasy. Do kroku 2 pritom vstupuje s hotovou trasou a jeho úloha je
   * pichať značky POZDĹŽ NEJ; musí ju vidieť celú.
   * `mapPhase` rozlišuje 'draw' a 'notes', takže sa rámuje pri každom vstupe na mapu aj pri
   * prepnutí medzi tými dvoma. Rezerva je spoločná (`dockFitPadding`) — na PC odčíta ľavý
   * stĺpec, na telefóne dok dole a bublinu hore.
   */
  useEffect(() => {
    if (mapPhase === 'off') return;
    const map = mapRef.current;
    if (!map) return;
    const pts: LatLngTuple[] = geometry.kind === 'route'
      ? ((geometry.snapPath?.length ? geometry.snapPath : geometry.path) as LatLngTuple[])
      : geometry.center ? [geometry.center] : [];
    if (!pts.length) return;
    // ⚠️ STROP PRIBLÍŽENIA: bez neho by sa krátky výlet (alebo jediný bod) priblížil na
    // maximum vrstvy a človek by videl dva domy namiesto okolia, do ktorého značku pichá.
    map.fitBounds(L.latLngBounds(pts), { ...dockFitPadding(notePanelH()), maxZoom: 15, animate: false });
    // zámerne bez `geometry` v závislostiach — viď ⚠️ vyššie
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapPhase, mapRef]);

  // ── ÚNIK Z KRESLENIA (Matej 2026-08-24) ────────────────────────────────────────────────
  // Krížik hore ZAHADZUJE výlet a odchádza na mapu; text dole vracia O KROK. Dve rôzne veci,
  // preto sú obe.
  // ⚠️ `clearAddDraft()` je tu POVINNÉ, nie upratovanie. Rozrobený výlet leží v autosave
  // (`readAddDraft`), takže bez neho by sa pri ďalšom vstupe ponúkol na obnovu — a otázka
  // „naozaj zahodiť?" by bola klamstvo.
  // ⚠️ NIE `window.confirm` — natívny dialóg zablokuje celú stránku a vyzerá ako systémová
  // chyba, nie ako súčasť appky. Ten istý dôvod je rozpísaný pri `LeaveConfirm`
  // v `PackNatureQuiz.tsx`; toto je jeho dvojička na tmavom povrchu nad mapou.
  /**
   * ── AINUBIS SA OZVE, KEĎ TRASA NEKONČÍ TAM, KDE ZAČALA (Matej 24. 8. 2026) ─────────────
   *
   * „ainubis musí zasiahnuť v prípade ak človek nakliká výlet z bodu A do bodu B a dá hotovo,
   *  tak musí ho upozorniť že nešiel si naspäť? Musí ten človek skončiť tam kde začal
   *  vo väčšine prípadov."
   *
   * ⚠️ JE TO OTÁZKA, NIE ZÁMOK. Výlet z A do B je legitímny (prejazd, vlak späť, jednosmerná
   * hrebeňovka) — appka ho nesmie odmietnuť. Len sa raz spýta, lebo oveľa častejšia príčina
   * otvorenej trasy je, že človek zabudol doklikať cestu domov, a zistil by to až na mape
   * medzi hotovými výletmi.
   *
   * Prah 300 m je ten istý, aký `DUPLICATE_RADIUS_M` používa na „to je ten istý štart" —
   * pod ním sa dva body na mape aj tak čítajú ako jedno miesto, takže by to bola otázka
   * o rozdiele, ktorý nikto nevidí.
   */
  const OPEN_ROUTE_M = 300;
  const routeIsOpen = useMemo(() => {
    if (geometry.kind !== 'route' || geometry.path.length < 2) return false;
    const a = geometry.path[0];
    const b = geometry.path[geometry.path.length - 1];
    // Rovnaká haversine ako v addTripGeo — tu stačí jediné meranie, tak sa neimportuje celý modul.
    const R = 6371000;
    const dLat = (b[0] - a[0]) * Math.PI / 180;
    const dLon = (b[1] - a[1]) * Math.PI / 180;
    const la = a[0] * Math.PI / 180;
    const lb = b[0] * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h))) > OPEN_ROUTE_M;
  }, [geometry]);
  /**
   * ── „IŠLO TO PODĽA PLÁNU?" (Matej 2026-08-25) ─────────────────────────────────────────
   * „už bude mať predvyplnenú trasu (možnosť opraviť, ainubis sa opýta či to sedelo s plánom)"
   *
   * ⚠️ Trasa sa NEODOMYKÁ SAMA. Väčšina ľudí ide tak, ako si naplánovala, a živá lišta
   * kreslenia nad hotovou čiarou zvádza k prvému kliku, ktorý do nej pridá kotvu navyše.
   * Otázka je preto vidlica: „sedí" preskočí rovno na značky, „šiel som inak" nechá človeka
   * v kroku 1 s nakreslenou trasou a odomknutými nástrojmi.
   */
  const [planAsk, setPlanAsk] = useState(false);

  /** Veta o čase → dvojička `.plan` pri pláne. Neutrálne vety ju nemajú (viď GeometryPicker). */
  const tq = (key: string) => t(isPlan ? `${key}.plan` : key);

  const [openRouteAsk, setOpenRouteAsk] = useState(false);
  // Zrkadlenie vie spraviť len picker (legs + snapPath + prevýšenie sú jeho vnútro),
  // tak si sem podá spúšťač. Viď `mirrorRef` v GeometryPicker.
  const mirrorRef = useRef<(() => void) | null>(null);
  // Spýta sa RAZ za výlet. Kto povie „áno, končím tu", nemá počuť to isté pri každom HOTOVO.
  const openRouteAskedRef = useRef(false);

  const [abortAsk, setAbortAsk] = useState(false);
  const abortDraw = () => {
    clearAddDraft();
    setAbortAsk(false);
    onClose();
  };

  /**
   * ── OTÁZKA NAD HOTOVOM: JEDEN DEŇ, ALEBO VIAC? (Matej 2026-08-27) ────────────────────────
   *
   * „Krok 1 ostáva, nad tlačidlo HOTOVO pribudne otázka jednodňová túra / túra na viac dní."
   *
   * ⚠️ LEN PRI HIKE. Pri CHILL, SPORT a EXPLORE by to bola otázka bez následku — nocľah,
   * dátum od–do ani odysea sa na nich neponúkajú.
   * ⚠️ PREPNUTIE SPÄŤ ZAHADZUJE, ČO Z VIACDŇOVOSTI VZNIKLO. Dátum DO a nocľahy sú JEJ deti;
   * nechať ich visieť na výlete, ktorý už viacdňový nie je, znamená uložiť výlet s koncom
   * skôr, než sa človek dozvie, že tam ešte je. Preto to nie je holé `setMultiDay`.
   */
  const setDayMode = (next: boolean) => {
    setMultiDay(next);
    if (!next) {
      setDateEnd('');
      setJourneyPick(false);
      setDrawManually(false);
    }
  };
  const dayAskKey = isPlan ? 'pack.addTrip.step.dayModeAsk.plan' : 'pack.addTrip.step.dayModeAsk';
  const multiDayAsk = activity === 'hike' && drawingStep ? (
    <div className="atl-daymode">
      {/* ⚠️ ČAS PODĽA TOHO, ČI SA ZAPISUJE ALEBO PLÁNUJE (Matej 2026-08-28: „ako dlho ste boli
          na ceste, nie ste — minulý čas, log"). Otázka bola písaná pre plán a zápis ju zdedil,
          takže sa človeka, ktorý práve prišiel z výletu, pýtala v prítomnom čase. Tá istá
          dvojica kľúčov, akú používa sprievodca (`tp()` v GeometryPicker.tsx). */}
      <span className="atl-daymode-ask">{t(dayAskKey)}</span>
      <div className="atl-toggle-row" role="tablist" aria-label={t(dayAskKey)}>
        <button
          type="button"
          role="tab"
          aria-selected={!multiDay}
          className={`atl-toggle-btn${!multiDay ? ' on' : ''}`}
          onClick={() => setDayMode(false)}
        >{t('pack.addTrip.step.oneDay')}</button>
        <button
          type="button"
          role="tab"
          aria-selected={multiDay}
          className={`atl-toggle-btn${multiDay ? ' on' : ''}`}
          onClick={() => setDayMode(true)}
        >{t('pack.addTrip.step.moreDays')}</button>
      </div>
      {/* Magistrálu si nikto nekreslí po bodoch — 750 km Cesty hrdinov SNP leží hotových
          v `HERO_JOURNEYS`. Do 27. 8. sa zoznam otváral SÁM (aktivita „Putovanie"); dnes je
          to odkaz, aby človeku, ktorý má trasu rozkreslenú, nezmizla pod zoznamom. */}
      {multiDay && !journeyPick && (
        <button type="button" className="atl-daymode-link" onClick={() => setJourneyPick(true)}>
          {t('pack.addTrip.step.pickJourney')}
        </button>
      )}
    </div>
  ) : null;

  const drawBar = {
    active: drawingStep || (notesInBar && !notePlacing),
    onDone: () => {
      if (routeIsOpen && !openRouteAskedRef.current) { setOpenRouteAsk(true); return; }
      setStep(stepAfter(1));
    },
    // ⚠️ V KROKU 1 JE TO ODCHOD, NIE NÁVRAT O KROK (Matej 24. 8. 2026: „dole späť na aktivitu
    // môžme dať skôr späť na mapy - odísť"). Pod bublinou AInubisa je len × na zahodenie;
    // človek, ktorý si to rozmyslel, hľadá cestu VON, nie späť do výberu aktivity — ten sa
    // dá zopakovať tlačidlom Pridať. V kroku 2 (značky) odkaz naďalej vracia O KROK na trasu.
    onBack: () => {
      if (notesInBar) { setStep(1); return; }
      // Rozkreslenú trasu nezahodíme bez otázky — tá istá brzda, akú má ×.
      if (geoDone) { setAbortAsk(true); return; }
      clearAddDraft();
      onClose();
    },
    backLabel: notesInBar ? 'pack.addTrip.step.backToRoute' : 'pack.addTrip.geo.leaveToMap',
    doneLabel: t('pack.addTrip.step.doneRoute'),
    doneDisabled: nextBlocked,
    // Mimo kroku 1 picker ostáva MOUNTNUTÝ (aby trasa na mape nezmizla, veď sa na ňu
    // v kroku 2 pichajú značky), ale nesmie brať kliky — inak by pri zapichovaní
    // parkoviska pribudla kotva trasy.
    paused: !drawingStep,
    panel: notesInBar ? notesPanel : undefined,
    above: multiDayAsk,
    // V kroku 2 pokyn hovorí o značkách, nie o kreslení — inak by fialová pilulka radila
    // dlho podržať prst práve vtedy, keď to nič nespraví.
    // ⚠️ OTÁZKA KROKU 2 ŽIJE V BUBLINE AINUBISA (Matej 24. 8. 2026). Úvod hovorí, PREČO sa
    // pýtame, a za pomlčkou stojí otázka, na ktorej je človek práve teraz — takže sprievodca
    // sa mení s postupom a panel dole ostáva len na odpoveď.
    // ⚠️ ÚVOD ZAZNIE RAZ, POTOM UŽ LEN OTÁZKA (Matej 24. 8. 2026: „druhý krok — už sa
    // neopakuje ainubis, ale ide otázka: Bolo na trase niečo nebezpečné?"). Veta „Poskytni
    // cenné rady komunite…" vysvetľuje, PREČO sa pýtame — to sa vysvetľuje raz. Pri druhej
    // a tretej otázke by to bola tá istá dlhá predohra pred krátkou otázkou a bublina by
    // zbytočne narástla o dva riadky nad mapu.
    // ⚠️ UPOZORNENIE NA CHÝBAJÚCE PREBÍJA BEŽNÝ POKYN (Matej 2026-08-25: „ak sa človek vráti
    // na nedokončené, tak ainubis na to upozorní — doplň toto, chýba toto"). Platí len po
    // NÁVRATE (revisited): pri prvom príchode ešte nie je čo vyčítať, tam má znieť pokyn.
    hint: (revisited(step) && stepMissing[step]?.length)
      ? `${t('pack.addTrip.step.stillMissing')} ${missingTx(stepMissing[step])}`
      : notesInBar
      /**
       * ⚠️ VETVA „PO TROCH OTÁZKACH" TU BOLA DO 28. 8. — AInubisova reakcia na výsledok
       * z 25. 8. („škoda, že si nič neoznačil" / pochvala). Zanikla spolu s obrazovkou,
       * ktorá ju držala (dôvod pri `notesBody`); kľúče `step.notesNone` a `step.notesPraise`
       * ostávajú v slovníku pre prípad, že reakcia dostane nový nosič.
       */
      /**
       * ── PO ZAPÍSANEJ ZNAČKE SA SPRIEVODCA SPÝTA, ČI POKRAČOVAŤ (Matej 2026-08-28) ────────
       * „V momente, keď som dal tip (ako posledný a označil som ho na mape), tak by mal
       *  AInubis napísať — chceš pridať ešte niečo, alebo ideme ďalej?"
       * Otázka skupiny („bolo tam nebezpečenstvo?") je v tej chvíli zodpovedaná — opakovať ju
       * znamená pýtať sa na to, čo človek práve urobil. Vetva stojí PRED ňou zámerne a platí
       * pre KAŽDÚ z troch otázok: je to ten istý okamih, len s iným obsahom.
       * ⚠️ Toto je zároveň náhradný nosič za reakciu na výsledok, ktorá zanikla s medzi-
       * obrazovkou (`step.notesNone` / `notesPraise`) — hovorí sa v paneli, kde človek stojí.
       */
      ? (placedInGroup(askGroup) > 0
          ? t('pack.addTrip.step.askMoreOrNext')
          : noteAsk === 0
            // ⚠️ ČÍSLA IDÚ Z EKONOMIKY, NEPÍŠU SA DO VETY (Matej 2026-08-25: „musí ainubis
            //    hore povedať že tvoj postreh bude odmenený 3 bodmi, dokopy môžeš získať až
            //    9 bodov"). Odmena aj strop už v `tripPoints.ts` existujú a sedia — chýbalo
            //    len to povedať. Napísané v texte by sa pri prvej zmene cenníka rozišli
            //    a AInubis by sľuboval body, ktoré appka nepripíše.
            /**
             * ⚠️ ÚVOD BOL NA PÄŤ RIADKOV (Matej 2026-08-25, screenshot z telefónu: „musíme
             * rozdeliť tú úvodnú vetu o bodoch, lebo je to veľmi dlhé… nemôže to byť na
             * 5 riadkov"). Bublina visí NAD mapou — každý jej riadok berie mapu, na ktorú
             * sa v tom kroku pichajú značky, takže dĺžka tu nie je vec vkusu.
             *
             * Rez podľa toho, čo je POVEDANÉ RAZ a čo pri každej otázke:
             *  · úvod = PREČO („buď odmenený") — raz
             *  · návod „Ťukni na OZNAČ" = AKO — tiež raz, pri prvej otázke; pri druhej to
             *    človek už vie a bola by to tá istá veta trikrát
             *  · cena `(+3 body)` = pri KAŽDEJ otázke, lebo sa vzťahuje na ňu
             * Celkový strop (9) z vety vypadol — vyplýva z troch otázok po troch bodoch
             * a nestojí za dva riadky nad mapou.
             */
            ? `${t('pack.addTrip.step.notesLead')} ${t(NOTE_ASKS[0].qKey)} ${t('pack.addTrip.step.askHowTo')} ${t('pack.addTrip.step.askPts', { pts: ptsWord(POINTS.note) })}`
            : `${t(NOTE_ASKS[noteAsk].qKey)} ${t('pack.addTrip.step.askPts', { pts: ptsWord(POINTS.note) })}`)
      : undefined,
    onAbort: () => setAbortAsk(true),
    steps: stepDots,
  };

  return (
    /* `--intro` = obrazovka výberu aktivity. Bez príznaku by mobilné pravidlá (šípka mimo toku,
       centrovaná dvojica nadpis + zoznam) platili aj na kroky formulára, kde je hlavička úzka
       a miesto patrí poliam. */
    <div className={`atl-log${!activity ? ' atl-log--intro' : ''}`}>
      <style>{LOG_CSS}</style>
      {/* PORTÁL NA <body> — panel, v ktorom sprievodca žije, je počas kreslenia skrytý
          (mapa je celá obrazovka), takže dialóg vnútri neho by sa nikdy neukázal. */}
      {abortAsk && createPortal(
        <div className="atl-abort-scrim" role="dialog" aria-modal="true" onClick={() => setAbortAsk(false)}>
          <div className="atl-abort" onClick={(e) => e.stopPropagation()}>
            <h2>{t('pack.addTrip.geo.abortTitle')}</h2>
            <p>{t('pack.addTrip.geo.abortBody')}</p>
            <div className="atl-abort-btns">
              <button type="button" className="atl-toggle-btn on" onClick={() => setAbortAsk(false)}>
                {t('pack.addTrip.geo.abortStay')}
              </button>
              <button type="button" className="atl-abort-quit" onClick={abortDraw}>
                {t('pack.addTrip.geo.abortQuit')}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
      {planAsk && createPortal(
        <div className="atl-abort-scrim" role="dialog" aria-modal="true">
          {/* Hovorí to AInubis (tmavomodrý variant), rovnako ako otázka o otvorenej trase.
              ⚠️ Scrim tu ZÁMERNE nezatvára klikom vedľa: pod ním leží mapa v režime kreslenia,
              takže „kliknem vedľa" by na nej rovno pridalo kotvu — teda presne tú zmenu trasy,
              na ktorú sa otázka pýta. Odpovede sú dve a obe sú tlačidlo. */}
          <div className="atl-abort atl-abort--ainubis" onClick={(e) => e.stopPropagation()}>
            <img className="atl-abort-face" src={ainubisFace} alt="" aria-hidden="true" />
            <h2>{t('pack.addTrip.plan.walkedAskTitle')}</h2>
            <p>{t('pack.addTrip.plan.walkedAskBody')}</p>
            <div className="atl-abort-btns">
              <button
                type="button"
                className="atl-abort-cta"
                onClick={() => { setPlanAsk(false); setStep(stepAfter(1)); }}
              >
                {t('pack.addTrip.plan.walkedAskYes')}
              </button>
              <button type="button" className="atl-abort-ghost" onClick={() => setPlanAsk(false)}>
                {t('pack.addTrip.plan.walkedAskEdit')}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
      {openRouteAsk && createPortal(
        <div className="atl-abort-scrim" role="dialog" aria-modal="true" onClick={() => setOpenRouteAsk(false)}>
          {/* ⚠️ AINUBISOV VARIANT, NIE OBYČAJNÝ DIALÓG (Matej 25. 8. 2026: „daj všetky
              interakcie v jeho dizajne (tmavomodrá)"). Modifikátor je tu zámerne miesto
              prepísania `.atl-abort` — tú istú škatuľu nesie aj otázka „Zahodiť výlet?",
              a tá NIE JE AInubis (nemá tvár, je to výstraha systému s červeným Zahodiť).
              Zmodrieť ju plošne by znamenalo, že sprievodca hovorí aj to, čo nehovorí. */}
          <div className="atl-abort atl-abort--ainubis" onClick={(e) => e.stopPropagation()}>
            {/* Hovorí to AInubis, tak tu stojí aj jeho tvár — inak je to bezmenná výstraha
                systému a tá na tejto obrazovke už nežije. */}
            <img className="atl-abort-face" src={ainubisFace} alt="" aria-hidden="true" />
            {/* ⚠️ TÁ ISTÁ OTÁZKA, INÝ ČAS (Matej 25. 8. 2026). „Nešiel si naspäť?" je na
                pláne nezmysel — človek sa nikam nevybral. `tq()` prepína na dvojičku `.plan`
                tam, kde veta hovorí o čase; tlačidlo „Doplniť tú istú cestu späť" ju nemá,
                lebo znie rovnako v oboch smeroch. */}
            <h2>{tq('pack.addTrip.geo.openRouteTitle')}</h2>
            <p>{tq('pack.addTrip.geo.openRouteBody')}</p>
            <div className="atl-abort-btns">
              {/* ⚠️ ZLATÉ JE LEN JEDNO (CTA lock). Zrkadlenie je jediná vec, ktorú vie appka
                  doplniť POCTIVO sama, takže nesie brandový gradient; zvyšné dve sú
                  rovnocenné odpovede, nie ďalšie CTA — dve zlaté vedľa seba nemajú prvé. */}
              <button
                type="button"
                className="atl-abort-cta"
                onClick={() => { mirrorRef.current?.(); openRouteAskedRef.current = true; setOpenRouteAsk(false); }}
              >
                {t('pack.addTrip.geo.openRouteMirror')}
              </button>
              {/* ⚠️ „Vrátil som sa inak" LEN ZAVRIE OTÁZKU a nechá človeka kresliť ďalej.
                  Automatické uzavretie okruhu tu zámerne NIE JE: router by cestu domov našiel
                  najkratšiu, teda skoro vždy tú istú — a appka by tvrdila, že to bola iná.
                  Kadiaľ sa vracal, vie len on. (Matej 25. 8. 2026 si vybral túto vetvu.) */}
              <button type="button" className="atl-abort-ghost" onClick={() => setOpenRouteAsk(false)}>
                {tq('pack.addTrip.geo.openRouteFinish')}
              </button>
              <button
                type="button"
                className="atl-abort-ghost"
                onClick={() => { openRouteAskedRef.current = true; setOpenRouteAsk(false); setStep(stepAfter(1)); }}
              >
                {tq('pack.addTrip.geo.openRouteKeep')}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
      {/* ── EDITOR PRÍBEHU NA CELÚ OBRAZOVKU ─────────────────────────────────────────────
          Portál na <body> z toho istého dôvodu ako pri dialógoch vyššie: panel, v ktorom
          formulár žije, je na PC 440 px široký stĺpec a v krokoch 1–2 dokonca skrytý.
          Escape zatvára — je to plocha na písanie, nie rozhodnutie, takže z nej musí viesť
          von aj klávesnica. */}
      {storyFull && createPortal(
        <div
          className="atl-editor-scrim"
          role="dialog"
          aria-modal="true"
          aria-label={t('pack.addTrip.log.story')}
          onKeyDown={(e) => { if (e.key === 'Escape') setStoryFull(false); }}
        >
          <div className="atl-editor">
            <div className="atl-editor-head">
              <span>{t('pack.addTrip.log.story')}</span>
              <button type="button" className="atl-editor-x" onClick={() => setStoryFull(false)} aria-label={t('pack.mapNotes.add.close')}>×</button>
            </div>
            <textarea
              className="atl-editor-area"
              value={note}
              autoFocus
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('pack.addTrip.step.storyPlaceholder')}
            />
            <button type="button" className="btn-gold atl-editor-done" onClick={() => setStoryFull(false)}>
              {t('pack.addTrip.step.editorDone')}
            </button>
          </div>
        </div>,
        document.body,
      )}
      <style>{ROUTE_HERO_CSS}</style>
      <style>{RESTORE_CSS}</style>
      <style>{STEP_CSS}</style>
      {/* MUSÍ BYŤ POSLEDNÝ — prebíja všetky bloky vyššie pri rovnakej špecificite. */}
      <style>{PALE_LOG_CSS}</style>
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
            onClick={onBackToEntry ?? onClose}
            aria-label={t('pack.addTrip.geo.stepBack')}
          >
            ←
          </button>
          <div className="atl-log-title atl-log-title--big">{t('pack.addTrip.log.titleActivity')}</div>
          {/* ⚠️ VETA POD NADPISOM ZANIKLA (Matej 2026-08-28: „odstráň text pod (tie tri
              riadky) a posuň nadpis dolu"). Na telefóne to boli tri riadky, ktoré hovorili,
              čo sa dá zapísať — lenže presne to hovorí aj zoznam pod nimi, len konkrétnejšie.
              Kľúč `pack.addTrip.log.titleActivitySub` ostáva v slovníkoch: nerenderuje sa,
              ale je preložený do všetkých jazykov a vrátiť ho je jeden riadok. */}
        </div>
      ) : (
        /* ŠÍPKA V STREDE, BEZ NADPISU (Matej 2026-08-23: „šípka dozadu bude v strede hore…
           bez toho «zapíš výlet»"). Kroky 1 a 2 sú na mape a návrat nesie lišta; sem sa
           človek dostane až s vyplneným formulárom, kde mu nadpis „Zapíš výlet" hovorí
           niečo, čo o sebe vie už tri obrazovky. Riadok tak ostáva pre jedinú vec, ktorú
           tam naozaj hľadá. */
        <div className="atl-log-head atl-log-head--plain">
          <button
            type="button"
            className="atl-log-back"
            onClick={goPrev}
            aria-label={t('pack.addTrip.geo.stepBack')}
          >
            ←
          </button>
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
        /* ⚠️ `has-open` VYPÍNA ROZŤAHOVANIE. Zatvorené dlaždice si delia výšku rovným dielom
           (Matej 2026-08-27: „treba vyplniť cely priestor opticky musí byť ten blok plný"),
           ale rozbalená dlaždica nesie o dve tlačidlá viac — pri rovnakých riadkoch by na jej
           výšku narástli aj tri susedné a zoznam by pretiekol. */
        <div className={`atl-tiles${pendingActivity ? ' has-open' : ''}`}>
          {ACTIVITIES.map((a) => {
            const open = pendingActivity === a.id;
            return (
              /* ⚠️ OBAL, NIE HOLÉ TLAČIDLO. Rozbaľovač nesie dve ďalšie tlačidlá a tlačidlo
                 vnorené v tlačidle je neplatné HTML — prehliadač ho vytrhne von z rodiča a
                 dlaždica sa rozpadne. */
              <div key={a.id} className={`atl-tile-wrap${open ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className={`atl-tile${open ? ' is-open' : ''}`}
                  aria-expanded={open}
                  onClick={() => setPendingActivity(open ? null : a.id)}
                >
                  <span className="atl-tile-emoji">{a.emoji}</span>
                  {/* ⚠️ NÁZOV CEZ SLOVNÍK, NIE `a.label` — dataset nesie anglický názov ako kľúč a na
                      slovenskej obrazovke potom stálo „Hiking" pod nadpisom „Vyber aktivitu".
                      `pack.map.activityLabel.*` už existuje (používa ho filter na mape). */}
                  {/* ⚠️ VETA JE SPÄŤ NA DLAŽDICI (Matej 2026-08-27: „stále je tam veľa priestoru
                      nevyzerá to dobre… opticky musí byť ten blok plný"). RUŠÍ TO ROZHODNUTIE
                      z 26. 8. („bude to len jednoslovné TURISTIKA — až v dropdowne bude text"),
                      a to vedome: dôvod, prečo veta vtedy odišla, bolo SEDEM aktivít v jednom
                      stĺpci bez skrolovania. Kategórie sú štyri, takže ten dôvod zanikol a ostal
                      opačný problém — štyri jednoriadkové dlaždice v 700 px stĺpci.
                      Z rozbaľovača veta ZMIZLA, inak by tá istá stála 8 px pod sebou dvakrát. */}
                  <span className="atl-tile-txt">
                    <span className="atl-tile-label">{t(`pack.map.activityLabel.${a.id}`)}</span>
                    <span className="atl-tile-note">{t(`pack.addTrip.log.activityNote.${a.id}`)}</span>
                  </span>
                  <span className="atl-tile-caret" aria-hidden="true">{open ? '⌃' : '⌄'}</span>
                </button>
                {open && (
                  /* ⚠️ VYSVETLIVKA JE POD TLAČIDLOM, NIE V ŇOM (Matej 2026-08-27: „v tlačítku
                     bude emoji a nadpis a pod tlačítkom na jeho šírku bude malinkým
                     vysvetlenie"). Dovtedy v ňom stáli nadpis aj veta v zátvorkách vedľa
                     emoji — tri prvky rôznej váhy v jednom riadku, ktoré sa lámali každý inde
                     („vyzerajú rozbito"). Klikacia plocha sa tým zmenšila zámerne: klikáš na
                     ROZHODNUTIE, popis k nemu je len text. */
                  <div className="atl-mode">
                    <div className="atl-mode-btns">
                      {/* Poradie je zámerné: PREŠLI SME TO je častejší prípad (mapa žije zo
                          zapísaných výletov), tak stojí prvé. */}
                      {MODE_CHOICES.map((m) => (
                        <div key={m.mode} className="atl-mode-col">
                          <button type="button" className="atl-mode-btn" onClick={() => pickActivity(a.id, m.mode)}>
                            <span className="atl-mode-emoji" aria-hidden="true">{m.emoji}</span>
                            <b>{t(`pack.addTrip.log.mode.${m.key}`)}</b>
                          </button>
                          <span className="atl-mode-cap">{t(`pack.addTrip.log.mode.${m.key}Sub`)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!!activity && !restored && (
        <>
          {/* ⚠️ V KROKOCH 1–2 STOJA BODKY V DOKU, NIE TU (Matej 2026-08-24: „pri 1 a 2 kroku
              dajme predsa len vedľa seba 1-5, aby sme sa mohli vracať a pohybovať po celom
              flow pri zmenách"). Panel je vtedy skrytý — mapa je celá obrazovka — takže tá
              istá značka sa posiela do `drawBar.steps` a vykreslí sa v hornom páse nad mapou.
              Je to JEDEN uzol (`stepDots`), nie dve kópie: dve by sa rozišli pri prvej zmene. */}
          {!drawingStep && !notesInBar && stepDots}
          {/* Veta stojí LEN pri dopĺňaní konceptu — tam sú kroky 1–2 naozaj mŕtve. V bežnom
              zápise by vysvetľovala zámok, ktorý neexistuje. */}
          {minStep > 1 && !drawingStep && !notesInBar && (
            <p className="atl-steps-lock">{t('pack.addTrip.step.lockedInDraft')}</p>
          )}

          <div className="atl-log-body">
            {/* ── VETA ŽIJE UŽ LEN TAM, KDE JE MAPA (Matej 2026-08-24) ────────────────────
                „inak tie fialové vysvetlivky (aká bola cesta…) vymažme to z 3-4-5 kroku."

                ⚠️ MENÍ TO LOCK Z 23. 8. („veta stojí v KAŽDOM kroku a vždy na tom istom
                mieste… jeden systém pokynov, nie dva"). Je to zmena locku, nie oprava:
                kroky 1–2 sú mapa, kde človek potrebuje počuť, aké GESTO má spraviť; kroky
                3–5 sú formulár, kde má každé pole vlastný popis. Veta tam hovorila to isté
                druhýkrát a brala práve to miesto, kvôli ktorému sa muselo skrolovať.
                Pilulku v krokoch 1–2 kreslí GeometryPicker (`drawBar.hint`), nie tento blok —
                preto tu neostáva nič, len sa prestala renderovať. */}

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
                    multiDay={isMultiDay}
                    // ⚠️ `mode` NIE JE natvrdo 'log'. Vnútri pickera ho číta JEDINÉ miesto —
                    // výber času sprievodcových viet (`planning`) — takže sa tým nemení nič
                    // v geometrii; `defaultKindFor(activity, 'plan')` je samostatná funkcia
                    // volaná mimo. Bez tohto by AInubis pri pláne hovoril o výlete v minulom
                    // čase (Matej 25. 8. 2026).
                    mode={isPlan ? 'plan' : 'log'}
                    allTrails={allTrails}
                    onMetrics={(m) => { metricsRef.current = m; }}
                    mapRef={mapRef}
                    mirrorRef={mirrorRef}
                    drawBar={drawBar}
                  />
                )}
              </div>
            </div>

            {/* ══ KROK 2 — ODKAZY NA TRASU ════════════════════════════════════════════
                TU NIE JE NIČ, A TO NA ŽIADNEJ ŠÍRKE (Matej 2026-08-23: „ten bude opäť na mape,
                nie prostredie krokov — v dolnom paneli sa zobrazia možnosti pridania odkazov").
                Ovládanie nesie `notesPanel` v lište nad mapou. Do 24. 8. tu stála PC vetva
                s tými istými otázkami v paneli; zanikla spolu s panelom, ktorý v krokoch 1–2
                už nestojí nikde. */}

            {/* ══ KROK 3 — ZÁKLAD ═════════════════════════════════════════════════════ */}
            {step === 3 && (
              <>
                {/* ⚠️ NÁKRES TRASY TU UŽ NIE JE (Matej 2026-08-23: „v 3. kroku nemusí byť nákres
                    trasy"). Trasu človek pred chvíľou nakreslil a v kroku 2 ju videl celú na
                    mape — tretíkrát ju ukázať znamená len to, že sa krok nezmestí na obrazovku
                    a formulár začne skrolovať. Fotka ostáva: tá o výlete hovorí niečo nové. */}
                {photos.length > 0 && (
                  <div
                    className="atl-photo"
                    style={{
                      backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.45)), url('${heroPhoto}')`,
                      backgroundPosition: `center ${coverY}%`,
                    }}
                  />
                )}

                {/* ⚠️ LEN PLÁN. Pri ZÁPISE prejdeného výletu otázka „ideš sám / hľadáš
                    niekoho" nedáva zmysel — výlet už bol (Matej 2026-08-27: „pri LOGU to
                    nemá zmysel!"). Dáta boli v poriadku (`visibility` sa pri zápise
                    neukladá), chýbala len vetvová brána, preto to `tsc` nechytilo.
                    → pamäť `feedback_presunute_pole_strati_vetvovu_branu` */}
                {/* ── PRVÁ OTÁZKA PLÁNU: SÁM, ALEBO S NIEKÝM? (Matej 2026-08-26) ────────
                    „podľa mňa by malo byť v 2. kroku ako prvá otázka, či sám alebo hľadá
                     niekoho… ak sám — nemusel by vypisovať plán, resp. by bol zašednutý."
                    ⚠️ JE TO TÁ ISTÁ VOĽBA AKO DOTERAJŠIA VIDITEĽNOSŤ (`visibility`), len
                    položená na začiatku a inými slovami. Nie je to nové pole: „idem sám"
                    je súkromný výlet, „hľadám niekoho" je inzerát pre svorku. Preto ostáva
                    stav aj kľúče — mení sa poradie a text, nie dáta.
                    ⚠️ PREČO PRVÁ: odpoveď rozhoduje o polovici zvyšku sprievodcu (detaily
                    plánu, celá doprava). Položená na konci by človek vyplnil polia, ktoré
                    mu o obrazovku ďalej stmavnú. */}
                {isPlan && (
                  <div className="atl-field">
                    <label>{t('pack.addTrip.plan.who')}</label>
                    <div className="atl-toggle-row" role="tablist" aria-label={t('pack.addTrip.plan.who')}>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={visibility === 'private'}
                        className={`atl-toggle-btn${visibility === 'private' ? ' on' : ''}`}
                        onClick={() => setVisibility('private')}
                      >{t('pack.addTrip.plan.whoSolo')}</button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={visibility === 'open'}
                        className={`atl-toggle-btn${visibility === 'open' ? ' on' : ''}`}
                        onClick={() => setVisibility('open')}
                      >{t('pack.addTrip.plan.whoOpen')}</button>
                    </div>
                    <p className="atl-field-hint" style={{ marginTop: 6 }}>
                      {t(visibility === 'private' ? 'pack.addTrip.plan.visibilityPrivateNote' : 'pack.addTrip.plan.visibilityOpenNote')}
                    </p>
                  </div>
                )}

                <div className={`atl-field${missClass(3, !!name.trim())}`}>
                  <label>{t('pack.addTrip.log.name')}</label>
                  <input className="atl-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('pack.addTrip.step.namePlaceholder')} />
                </div>

                {!isPlan && (
                  <>
                <div className={isMultiDay && !dontRemember ? 'atl-row3' : 'atl-row2'}>
                  <div className="atl-field">
                    <label>{t('pack.addTrip.log.date')}</label>
                    {/* ⚠️ MEDZE PODĽA VOĽBY Z KROKU 0b. Typ výletu rozhoduje `tripMode`, takže
                        dátum mu nesmie protirečiť — plán vo včerajšku a zápis o výlete, ktorý
                        sa ešte nekonal, sú obe nezmysly, ktoré by prešli až do datasetu.
                        Prehliadač ich zablokuje v samotnom kalendári, teda skôr, než vzniknú. */}
                    <input
                      type="date"
                      className="atl-input"
                      value={date}
                      disabled={dontRemember}
                      min={isPlan ? todayISO : undefined}
                      max={isPlan ? undefined : todayISO}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  {/* KONIEC SA PÝTA PODĽA ODPOVEDE Z 1. KROKU, nie podľa aktivity (2026-08-27).
                      Do 27. 8. tu stálo `activity === 'journey'` — teda pole sa ukázalo len
                      tomu, kto si vybral „Putovanie". Dnes ho vidí každý, kto povedal, že ide
                      na viac dní, a je to jediné miesto, kde sa koniec zadáva. */}
                  {isMultiDay && !dontRemember && (
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
                  {/* Prázdny label je DISTANČNÍK, ktorý zarovná tlačidlo s poľom vedľa —
                      v jednom stĺpci (mobil) z neho ostane len diera, tak sa tam schová. */}
                  <div className="atl-field">
                    <label className="atl-label-spacer">&nbsp;</label>
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
                {/* ── DNI A NOCI SA POČÍTAJÚ, NEVYPISUJÚ (Matej 2026-08-27, krok 3) ────────
                    „dátum od–do + automatický výpočet dní a nocí."
                    ⚠️ Je to ODVODENÝ údaj a preto sa NEUKLADÁ — dva dátumy ho nesú celý.
                    Uložené číslo by po prvej oprave dátumu ticho klamalo.
                    ⚠️ Noci = dni − 1 a je to zároveň počet nocľahov, ktorý má výlet mať;
                    kontrolu proti zapichnutým nocľahom robí zhrnutie v 4. kroku. */}
                {isMultiDay && !dontRemember && tripDays > 0 && (
                  <p className="atl-daycount">
                    {t('pack.addTrip.step.days' + pluralKey(tripDays), { n: tripDays })}
                    {' · '}
                    {t('pack.addTrip.step.nights' + pluralKey(tripDays - 1), { n: tripDays - 1 })}
                  </p>
                )}
                {/* ⚠️ VETA „Bol si vonku viac dní? Vráť sa a vyber Putovanie" ZANIKLA
                    (Matej 2026-08-26: „tam daj preč vetu: bol si vonku viac dní…").
                    Kľúč `pack.addTrip.step.multiDayHint` OSTÁVA v slovníku — nerenderované
                    kľúče sa v tomto repe nemažú, aby sa dali vrátiť jedným riadkom. */}

                  </>
                )}                {/* ── KRAJINA + REGIÓN NA CELÚ ŠÍRKU, JEDEN RIADOK (Matej 2026-08-26) ────
                    „dolu je krajina a región roztiahni ich na celú šírku do jedného riadku,
                     teraz sú zbytočne na jednej strane, môžeš ich roztiahnuť."
                    ⚠️ PRÍČINA: mriežka mala TRI stĺpce (`atl-row3`), ale polia sú dve — tretí
                    diel ostával prázdny vpravo, takže dvojica sedela na ľavej polovici a
                    vyzeralo to ako nedokončený riadok. Rad prvkov = celá šírka kontajnera,
                    rovnaké diely; keď je pole jediné (zahraničie nemá región), zaberie
                    celý riadok samo — a to je to isté pravidlo, nie výnimka z neho. */}
                <div className="atl-rowfull">
                  <div className="atl-field">
                    <label>{t('pack.addTrip.step.state')}</label>
                    <select className="atl-input" value={effCountry} onChange={(e) => setCountryOverride(e.target.value)}>
                      {countryOpts.map((c) => <option key={c} value={c}>{flagEmoji(c)} {countryLabel(c, lang) || c.toUpperCase()}</option>)}
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

                {/* ── PRÍBEH VÝLETU STOJÍ TU, NIE V KROKU 4 (Matej 2026-08-26) ──────────
                    „4 je preplnená, textové pole je moc malé… toto musíme lepšie vymyslieť —
                     prehodiť text area do 3 je hlúposť?" Nie je: v kroku 4 sa pole prekrývalo
                    s popiskom OZNAČENÉ NA TRASE (nie tesné — rozbité) a malo dva riadky, kým
                    tu ostávalo ~300 px prázdna plochy pod krajinou.
                    ⚠️ Tri dôvody, prečo práve sem, nie inam:
                    1. PRI PLÁNE TU UŽ JE — vetva `isPlan` o kus nižšie kreslí ten istý `note`
                       ako `plan.details`. Takto má jedno pole jedno miesto pre obe vetvy.
                    2. Krok 3 = píšeš (meno, dátum, príbeh), krok 4 = klikáš (chipy). Do teraz
                       bol krok 4 jediný, kde sa medzi chipmi zjavila klávesnica.
                    3. Miesto je tu, tam nie.
                    ⚠️ `atl-field--grow` znamená, že pole zaberie zvyšok stĺpca — preto stojí
                    ako POSLEDNÉ v kroku; nad ním by tlačilo polia pod sebou.
                    Editor na celú obrazovku (Matej 26. 8.: „aby sa človek netlačil v malom
                    poli") ide s ním — je to ten istý `note`, len väčšia plocha. */}
                {!isPlan && (
                  <div className="atl-field atl-field--grow">
                    <div className="atl-fieldhead">
                      <label>{t('pack.addTrip.log.story')}</label>
                      <button type="button" className="atl-expand" onClick={() => setStoryFull(true)}>
                        {t('pack.addTrip.step.expandEditor')}
                      </button>
                    </div>
                    <textarea className="atl-input atl-textarea" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('pack.addTrip.step.storyPlaceholder')} />
                  </div>
                )}

                {/* ── ČO JE V PLÁNE (Matej 2026-08-25, presunuté 26. 8.) ────────────────
                    Detaily plánu sú DRUHÝ krok („meno, miesto a detaily"), preto ostali tu.
                    ⚠️ DÁTUM A VIDITEĽNOSŤ ODIŠLI DO KROKU 3 (odchod) — stáli tu od 25. 8.,
                    keď mal plán kroky dva. Sú to tie isté stavy (`date`, `visibility`), len
                    o obrazovku ďalej, vedľa dopravy, ku ktorej patria významom.
                    ⚠️ VÝBER PSA TU NIE JE (Matej 2026-08-26, na priamu otázku: „vyhodiť").
                    Bol tu jeden deň a bola to moja iniciatíva nad rámec zadania. Dôvod, prečo
                    odišiel: pri jednom psovi je to pole, ktoré sa pýta na zrejmé. Psa vyberá
                    až zápis po prejdení (krok 5, `crew`) — tam sa naň pýtame tak či tak.
                    Dôsledok: plán nemá `dogs`, takže karta plánu neukazuje počet psov;
                    naplní sa pri zápise.
                    ⚠️ Fotka tu ZÁMERNE nie je — plán dostane obrázok z našej databázy podľa
                    aktivity (`placeholderFor` u volajúceho) a vlastná fotka pribudne až po
                    prejdení, keď sa ten istý záznam otvorí ako zápis. */}
                {isPlan && (
                  <div className={`atl-field atl-field--grow${solo ? ' atl-field--off' : ''}`}>
                    <label>{t('pack.addTrip.plan.details')}</label>
                    <textarea
                      className="atl-input atl-textarea"
                      rows={3}
                      value={note}
                      disabled={solo}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t('pack.addTrip.step.storyPlaceholder')}
                    />
                    {/* Zašednuté pole musí povedať PREČO — inak sa nedá odlíšiť od poruchy
                        (tá istá lekcia ako pri zamknutých krokoch v číselníku 26. 8.). */}
                    {solo && <p className="atl-field-hint" style={{ marginTop: 6 }}>{t('pack.addTrip.plan.soloNoNeed')}</p>}
                  </div>
                )}
              </>
            )}

            {/* ══ KROK 4 — O TRASE ════════════════════════════════════════════════════ */}
            {step === 4 && (
              <>
                {/* Ruch, náročnosť, povrch, hodnotenie a fotky sú SPRÁVY Z CESTY — na výlete,
                    ktorý sa ešte nekonal, sa nedajú vyplniť pravdivo. Preto sa na pláne
                    nezobrazujú (a do draftu sa nedostanú, viď `isPlan` pri jeho stavbe). */}
                {/* ── TRI POLIA V JEDNOM RADE (Matej 2026-08-24) ──────────────────────
                    „skúsme dať do jedného riadku, aby sme ušetrili miesto, lebo je potrebný
                     scroll." Náročnosť · Povrch · Ruch patria k sebe aj významom — všetky tri
                    hovoria, AKÁ tá cesta bola, na rozdiel od dátumu a mena.
                    ⚠️ Ruch stál doteraz vo VLASTNOM riadku pod nimi, a to aj vtedy, keď výlet
                    nebol turistický (`isHikeLike`) — preto ho tu nesie ten istý blok, ale
                    dvojica nad ním sa naďalej vie nezobraziť. Rad má potom dva diely namiesto
                    troch a nezostane po nich diera vpravo. */}
                {/* ── NÁROČNOSŤ NESIE NAŠE ZNAČKY, NIE TEXT (Matej 2026-08-25) ─────────────
                    „pri náročnosti daj naše značky — zelený kruh easy, žltý štvorec, červený
                     trojuholník… chýba tam ikonka."
                    ⚠️ PRETO PRESTALA BYŤ `<select>`om a vystúpila z trojice do vlastného radu.
                    Natívny rozbaľovač tvar neunesie — `<option>` smie niesť len text, čo je
                    presne dôvod, prečo susedné polia (povrch, ruch) hovoria EMOJI. Tu emoji
                    nestačí: Odyssey je BIELY trojuholník a taký emoji neexistuje, takže by sa
                    štvrtý stupeň nedal odlíšiť od Hard.
                    ⚠️ TVAR ANI FARBU TU NEOPISUJEM — `DiffMark` + `DIFF_MARK_CSS` z
                    `tripShared.tsx` sú JEDINÝ zdroj (tie isté značky nesú pilulky na mape).
                    Vedľajší zisk: výber je jedno ťuknutie, nie otvorenie systémového valca.
                    Cena: trojica z 24. 8. je odteraz dvojica (povrch · ruch) a pribudol jeden
                    rad — ale ušetril sa jeden krok interakcie. */}
                {/* ── ODYSEA: APPKA JU OZNAMUJE, ČLOVEK JU NEVYBERÁ (Matej 2026-08-27) ─────
                    „tam pribudne zaškrtnutá odysea, ale nie ako výber na zeleno — skôr inou
                     farbou, modrou?"
                    ⚠️ MODRÁ MÁ VÝZNAM, NIE JE TO DRUHÁ ZELENÁ. Zelená v celom toku znamená
                    „vybral som si", modrá (`PICK_INK.lapis`) „appka to o tebe vie" — a človek
                    tu naozaj nemá čo vyberať: odysea vyplýva z odpovede v 1. kroku.
                    ⚠️ PRETO TO NIE JE TLAČIDLO. `<div>` bez `onClick` a bez `role` — chip,
                    ktorý vyzerá klikateľne a nič nerobí, je pokazená appka. Kto ju chce
                    zrušiť, vráti sa do 1. kroku a povie, že ide na jeden deň. */}
                {!isPlan && isMultiDay && (
                  <div className="atl-field">
                    <div className="atl-odyssey">
                      <span className="atl-odyssey-mark" aria-hidden="true">✓</span>
                      <span className="atl-odyssey-txt">
                        <b>{t('pack.map.diff.Odyssey')}</b>
                        <i>{t('pack.addTrip.step.odysseyNote')}</i>
                      </span>
                    </div>
                  </div>
                )}

                {!isPlan && isHikeLike && (
                  <div className={`atl-field${missClass(4, !!diff)}`}>
                    <label>{t('pack.addTrip.step.difficulty')}</label>
                    <div className="atl-diffrow">
                      <style>{DIFF_MARK_CSS}</style>
                      {/* ⚠️ ODYSEA UŽ NIE JE STUPEŇ NÁROČNOSTI (Matej 2026-08-27) ────────────
                          „tam pribudne zaškrtnutá odysea, ale nie ako výber… človek ešte
                           vyberie náročnosť." Odysea je odteraz PRÍZNAK viacdňovosti a stojí
                          vedľa náročnosti, nie namiesto nej — dvojdňová túra teda môže byť
                          stredne ťažká a zároveň odysea. Zo zoznamu stupňov preto vypadla
                          úplne, na každej aktivite.
                          ⚠️ `'Odyssey'` v `DIFF_OPTIONS` OSTÁVA: 11 magistrál ho má v datasete
                          zapísané ako náročnosť a obnova konceptu (`restored.diff`) aj
                          dopĺňanie (`finishTrail.diff`) cezeň prechádzajú. Zanikla len
                          možnosť ho VYBRAŤ. */}
                      {DIFF_OPTIONS.filter((d) => d !== 'Odyssey').map((d) => (
                        <button
                          key={d}
                          type="button"
                          className={`atl-diffbtn${diff === d ? ' on' : ''}`}
                          aria-pressed={diff === d}
                          onClick={() => setDiff(diff === d ? '' : d)}
                        >
                          <DiffMark diff={d} />
                          <span>{t(`pack.map.diff.${d}`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* ── PORADIE RIADKOV: NÁROČNOSŤ → RUCH → POVRCH → TAGY (Matej 2026-08-26) ──
                    „= náročnosť ďalší riadok RUCH a ďalší povrch - potom tagy."
                    Ruch stál do teraz VEDĽA povrchu v dvojici (`atl-row2--tight`), a to ho
                    ako jediné pole kroku držalo v rozbaľovači — dvojica sa musela zmestiť
                    na polovicu šírky. Vo vlastnom riadku ho unesú chipy. */}
                {!isPlan && (
                  <div className={`atl-field${missClass(4, !!crowd)}`}>
                    <label>{t('pack.addTrip.log.crowd')}</label>
                    {/* ── RUCH JE CHIP, NIE ROZBAĽOVAČ (Matej 2026-08-26) ──────────────────
                        „ruch by som dal tiež radšej na chipy lebo ako jediné to je na dropdown
                         a nevyzerá to dobre… chip sa bude dať vybrať len jeden."
                        ⚠️ VÝBER JE PRÁVE JEDEN — preto `role="radiogroup"` a nie tie isté
                        pravidlá ako pri povrchu/tagoch, kde sa dá vybrať viac. Druhý klik na
                        vybraný chip voľbu ZRUŠÍ: rozbaľovač mal prázdnu položku, chipy by inak
                        boli jediné pole kroku, ktoré sa nedá vrátiť do „nevybraté".
                        ⚠️ `CROWD_LABELS` sa tu nepoužívajú — sú to SK kľúče do datasetu, nie
                        copy; text ide cez `pack.map.crowdKind.*`. */}
                    <div className="atl-chips" role="radiogroup" aria-label={t('pack.addTrip.log.crowd')}>
                      {CROWDS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          role="radio"
                          aria-checked={crowd === c}
                          className={`atl-chip${crowd === c ? ' on' : ''}`}
                          onClick={() => setCrowd(crowd === c ? '' : c)}
                        >
                          <span className="atl-chip-emoji" style={{ fontFamily: FONT_EMOJI }}>{CROWD_EMOJI[c]}</span>
                          <span className="atl-chip-label">{t(`pack.map.crowdKind.${c}`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!isPlan && isHikeLike && (
                  <div className={`atl-field${missClass(4, terrain.size > 0)}`}>
                    <label>{t('pack.addTrip.step.terrain')}</label>
                    {/* Chipy, nie rozbaľovač — viacnásobný výber sa natívnym `<select multiple>`
                        na telefóne ovláda mizerne. Vzor je zhodný s tagmi o kus nižšie, aby
                        sa dve susedné viacnásobné voľby neovládali dvoma rôznymi spôsobmi. */}
                    <div className="atl-chips">
                      {TERRAIN_OPTIONS.map((sf) => (
                        <button
                          key={sf.id}
                          type="button"
                          className={`atl-chip${terrain.has(sf.id) ? ' on' : ''}`}
                          onClick={() => toggleSet(terrain, setTerrain, sf.id)}
                        >
                          <span className="atl-chip-emoji" style={{ fontFamily: FONT_EMOJI }}>{sf.emoji}</span>
                          <span className="atl-chip-label">{t(`pack.map.surfaceLabel.${sf.id}`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`atl-field${missClass(4, tags.size > 0)}`}>
                  <label>{t('pack.addTrip.log.tags')}</label>
                  <div className="atl-chips">
                    {TAG_OPTIONS.map((tag) => (
                      <button
                        key={tag.label}
                        type="button"
                        className={`atl-chip${tags.has(tag.label) ? ' on' : ''}`}
                        onClick={() => toggleSet(tags, setTags, tag.label)}
                      >
                        <span className="atl-chip-emoji">{tag.emoji}</span><span className="atl-chip-label">{t(`pack.map.tagLabel.${tag.id}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ══ DVA RADY CHIPOV — „ČO SME TAM ROBILI" (Matej 2026-08-31) ═══════════
                    Chip hovorí, ČO SME ROBILI (moja spomienka). Značka na mape hovorí, ČO TAM
                    JE (tip pre ostatných, presný bod, krok 2) — iná vrstva, nemieša sa.

                    ⚠️ DRUHÝ RAD JE ZBALENÝ ZÁMERNE. „Idem na Kriváň a v chipe bude pádlovanie?"
                    bola Matejova výhrada proti jednému spoločnému radu; zbalený rad sa sám
                    neponúka, ale „hike nemá ako mať piknik či?" ostáva vyriešené — je na jeden
                    ťuk. Zoznam sa počíta z `TRIP_CATEGORIES`, nepíše sa tu druhýkrát.

                    ⚠️ CHIPY IDÚ DO `acts`, SPOLU S KATEGÓRIOU (§2.3). Jedno pole, jeden
                    mechanizmus — filter aj karta ich čítajú tou istou cestou ako kategóriu. */}
                {(ownChips.length > 0 || moreChips.length > 0) && (
                  <div className="atl-field">
                    {ownChips.length > 0 && (
                      <>
                        <label>{t('pack.addTrip.log.chipsOwn')}</label>
                        <div className="atl-chips">
                          {ownChips.map((ch) => (
                            <button
                              key={ch.id}
                              type="button"
                              aria-pressed={chips.has(ch.id)}
                              className={`atl-chip${chips.has(ch.id) ? ' on' : ''}`}
                              onClick={() => toggleChip(ch.id, false)}
                            >
                              <span className="atl-chip-emoji" style={{ fontFamily: FONT_EMOJI }}>{ch.emoji}</span>
                              <span className="atl-chip-label">{chipTx(ch.id, ch.label)}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {moreChips.length > 0 && (
                      <div className={ownChips.length > 0 ? 'atl-more' : undefined}>
                        <button
                          type="button"
                          className="atl-morebtn"
                          aria-expanded={moreChipsOpen}
                          onClick={() => setMoreChipsOpen((o) => !o)}
                        >
                          <span>{t('pack.addTrip.log.chipsMore')}</span>
                          <span className="atl-morebtn-arw" aria-hidden="true">{moreChipsOpen ? '⌃' : '⌄'}</span>
                        </button>
                        {moreChipsOpen && (
                          <div className="atl-more-body">
                            <div className="atl-chips">
                              {moreChips.map((ch) => (
                                <button
                                  key={ch.id}
                                  type="button"
                                  aria-pressed={chips.has(ch.id)}
                                  className={`atl-chip${chips.has(ch.id) ? ' on' : ''}`}
                                  onClick={() => toggleChip(ch.id, true)}
                                >
                                  <span className="atl-chip-emoji" style={{ fontFamily: FONT_EMOJI }}>{ch.emoji}</span>
                                  <span className="atl-chip-label">{chipTx(ch.id, ch.label)}</span>
                                </button>
                              ))}
                            </div>
                            {/* ── TICHÁ PONUKA MIESTA (§3 zadania, Matej 2026-08-31) ──────────
                                „lenže človek to nie vždy chce a vie priznať, nevie kde na mape
                                 to bolo… keby to mal klikať, neurobí to lebo je náročné nájsť"

                                🔴 APPKA SA NIKDY NEPÝTA „KDE", ABY DOSTALA „ČO". Chip je už
                                zapísaný — táto ponuka nič neblokuje, nemá potvrdenie a slovo
                                „nemusíš" je vidieť bez rozklikávania. Kto ju ignoruje, ide
                                ďalej a nič nestratí.
                                ⚠️ Ukazuje sa LEN pri chipe z DRUHÉHO radu a len pri poslednom
                                zapnutom — pri každom naraz by z tichej ponuky bol zoznam otázok.
                                ⚠️ Tlačidlo vedie do EXISTUJÚCEHO označovania na mape (skupina
                                „tip"), nezakladá druhý spôsob zápisu bodu. Krok 2 sa nemení. */}
                            {chipAsk && chips.has(chipAsk) && (
                              <div className="atl-where">
                                <span className="atl-where-txt">
                                  <b>{t('pack.addTrip.log.whereAsk')}</b>
                                  <i>{t('pack.addTrip.log.whereSkip')}</i>
                                </span>
                                <button
                                  type="button"
                                  className="atl-where-btn"
                                  onClick={() => { setChipAsk(null); startPlacing('comment'); }}
                                >{t('pack.addTrip.log.whereBtn')}</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ⚠️ PRÍBEH SA PÍŠE V KROKU 3, NIE TU (Matej 2026-08-26) — viď jeho blok tam.
                    Krok 4 je odteraz len klikanie: náročnosť · ruch · povrch · značky. */}

                {/* NEBEZPEČENSTVO SA TU UŽ NEVYPĹŇA, LEN ZHŔŇA (Matej 23. 8.).
                    Chipy hazardov zanikli: tá istá informácia žila na dvoch miestach
                    (`trip_votes.hazards` + značky v mape) a prvá úprava jedného ich rozišla.
                    Chip bez polohy je navyše horší údaj — svorke nepovie kde. */}
                <div className="atl-field">
                  <label>{t('pack.addTrip.step.markedOnRoute')}</label>
                  <PlacedNotes notes={placedNotes} t={t} emptyKey="pack.addTrip.step.noNotesSummary" />
                  {/* Pri dopĺňaní konceptu odkaz nesvieti: krok 2 je zamknutý, lebo väzba
                      značky na výlet sa neukladá (odvodzuje sa zo súradnice) — po čase by
                      zhrnutie ukazovalo cudzie okolie namiesto toho, čo si vtedy zapichol. */}
                  {!finishingDraft && (
                    <button type="button" className="atl-journey-link" onClick={() => { setNoteAsk(0); setStep(2); }}>
                      {t('pack.addTrip.step.backToNotes')}
                    </button>
                  )}
                </div>

              </>
            )}

            {/* ══ KROK 5 — OSTATNÉ ════════════════════════════════════════════════════ */}
            {step === 5 && (
              <>
                <div className="atl-field">
                  {/* Nadpis sa pýta, nepomenúva (Matej 2026-08-25: „namiesto svorka na
                      výlete tam musí byť Kto bol s tebou na výlete?"). „Svorka na výlete" je
                      názov údaja; človek v tej chvíli potrebuje otázku, na ktorú odpovie. */}
                  <label>{t('pack.addTrip.step.whoWasWithYou')}</label>
                  <CompanionAvatarsOnly myDogs={myDogs} selected={crew} onChange={setCrew} />
                </div>

                {!isPlan && (
                  <div className="atl-field">
                    <label>{t('pack.addTrip.step.rate')}</label>
                    {/* `onDark` NIE JE natvrdo (2026-08-26): packy si farbu aj priehľadnosť
                        nesú v INLINE štýle, takže bledý skin PC ich z CSS prebiť nevie —
                        prepínač komponentu je jediná cesta. Na tmavom mobile ostáva pôvodný
                        stav. Hranicu drží `useIsPaleChrome()`, ten istý `PALE_PC_MIN`, akým
                        sa riadia všetky CSS bloky skinu. */}
                    <div className="atl-rate">
                      <PawRating value={paws} onChange={setPaws} onDark={!paleChrome} size={paleChrome ? 34 : 30} />
                      <span className={`atl-rate-val${paws > 0 ? ' on' : ''}`}>{paws > 0 ? `${paws}/5` : '—'}</span>
                    </div>
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
                        {/* ⚠️ POSUVNÍK MUSÍ MAŤ ČO POSÚVAŤ (Matej 2026-08-25, po reálnom zápise:
                            „v závere je úprava zvislej foto posuvník, ale neviem či to fungovalo,
                            zmiatlo ma to — tam by to chcelo viac vysvetliť, otvoriť náhľad").
                            Náhľad s `coverY` DOTERAZ EXISTOVAL, ale stál v KROKU 3 — teda na inej
                            obrazovke než posuvník. Človek ťahal a nič sa pred ním nehýbalo, takže
                            ovládač vyzeral pokazený. Je to ten istý výrez a tie isté hodnoty ako
                            hore, len konečne vedľa ruky, ktorá ho ovláda. */}
                        {/* Výber titulnej nebol NIKDE napísaný — badge „TITULNÁ" ukazuje VÝSLEDOK,
                            nie to, že sa dá zmeniť (Matej: „fotku titulnú som chcel inú"). */}
                        {photos.length > 1 && (
                          <p className="atl-field-hint" style={{ marginTop: 6 }}>{t('pack.addTrip.step.coverPick')}</p>
                        )}
                        <div className="atl-cover-crop">
                          <label>{t('pack.addTrip.step.coverCrop')}</label>
                          <div
                            className="atl-cover-preview"
                            style={{
                              backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.45)), url('${heroPhoto}')`,
                              backgroundPosition: `center ${coverY}%`,
                            }}
                          />
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

            {/* ══ KROK 6 — ODCHOD (LEN PLÁN) ═══════════════════════════════════════════
                Matej 2026-08-26: „3. krok by som pridal kedy + doprava na miesto."
                Krok 3 hovorí ČO a KDE, tento KEDY a AKO SA TAM DOSTANEME. Číslo 6 nie je
                preklep — kroky 4 a 5 patria zápisu a plán cez ne neprechádza (STEP_SEQ). */}
            {step === 6 && (
              <>
                {/* ── KEDY: PLÁN MÁ VLASTNÉ POLE (Matej 2026-08-25) ────────────────────
                    „dátum nepamatam si a bol som vonku viac dní... to je hluposť - absurdné
                     skor tam by mala byť možnosť bud pevný dátum alebo len okruhly mesiac
                     a týždeň v ňom alebo len mesiac"
                    Obe pôvodné voľby hovorili o minulosti: deň, na ktorý sa človek CHYSTÁ, nikto
                    nezabudol, a nikde ešte nebol. Neurčitosť plánu je iná — nie „neviem, kedy to
                    bolo", ale „viem to zatiaľ len zhruba". Tri presnosti, jedno pole.
                    ⚠️ Koniec viacdňového putovania sa tu NEPÝTA. Pri „niekedy v septembri" nemá
                    čo znamenať, a pri magistrále to hovorí už sama aktivita (trek cez viac dní);
                    presný koniec sa dopĺňa po prejdení, keď je známy. */}
                <div className={`atl-field${missClass(6, !!date)}`}>
                  <label>{t('pack.addTrip.plan.when')}</label>
                  <div className="atl-toggle-row" role="tablist" aria-label={t('pack.addTrip.plan.when')}>
                    {(['exact', 'week', 'month'] as const).map((pr) => (
                      <button
                        key={pr}
                        type="button"
                        role="tab"
                        aria-selected={planPrecision === pr}
                        className={`atl-toggle-btn${planPrecision === pr ? ' on' : ''}`}
                        onClick={() => setPlanPrecision(pr)}
                      >{t(`pack.addTrip.plan.when.${pr}`)}</button>
                    ))}
                  </div>
                  {planPrecision === 'exact' ? (
                    <input
                      type="date"
                      className="atl-input atl-input--pick"
                      style={{ marginTop: 8 }}
                      value={planDay}
                      min={todayISO}
                      onClick={(e) => openNativePicker(e.currentTarget)}
                      onChange={(e) => setPlanDay(e.target.value)}
                    />
                  ) : (
                    <>
                      <select
                        className="atl-input"
                        style={{ marginTop: 8 }}
                        value={planMonth}
                        onChange={(e) => setPlanMonth(e.target.value)}
                      >
                        <option value="">{t('pack.addTrip.log.selectPlaceholder')}</option>
                        {monthOpts.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                      {planPrecision === 'week' && (
                        <div className="atl-toggle-row" style={{ marginTop: 8 }} role="tablist" aria-label={t('pack.addTrip.plan.whenWeek')}>
                          {[1, 2, 3, 4].map((w) => (
                            <button
                              key={w}
                              type="button"
                              role="tab"
                              aria-selected={planWeek === w}
                              className={`atl-toggle-btn${planWeek === w ? ' on' : ''}`}
                              onClick={() => setPlanWeek(w)}
                            >{t('pack.addTrip.plan.whenWeekN', { n: String(w) })}</button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  <p className="atl-field-hint" style={{ marginTop: 6 }}>{t('pack.addTrip.plan.whenHint')}</p>
                </div>

                {/* ── DOPRAVA NA MIESTO (Matej 2026-08-26) ──────────────────────────────
                    „ako idem na výlet (autom, vlakom…) a odkiaľ idem, ľudia sa možu
                     vyzdvihnúť po ceste."
                    JEDNA voľba, nie množina (Matejovo rozhodnutie z dvoch ponúknutých
                    tvarov) — kombinácia „vlakom a odtiaľ pešo" patrí do detailov plánu.
                    ⚠️ Druhý klik na tú istú dlaždicu ju ODZNAČÍ. Pole je nepovinné, takže
                    bez toho by sa raz zvolená doprava nedala vziať späť — človek, ktorý si
                    to rozmyslel, by musel plán zahodiť a založiť odznova.
                    ⚠️ Emoji, nie hand-drawn ikonka: je to tá istá výnimka ako pri chipoch
                    aktivít (CLAUDE.md) — kit nemá vlak, autobus ani dodávku, a pol radu
                    v jednom jazyku a pol v druhom je horšie než celý rad v emoji.
                    FONT_EMOJI je povinný, inak Windows vykreslí čiernobiely textový tvar. */}
                <div className={`atl-field${solo ? ' atl-field--off' : ''}`}>
                  <label>{t('pack.addTrip.plan.travel')}</label>
                  <div className="atl-travel">
                    {TRAVEL_MODES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        aria-pressed={travelMode === m.id}
                        disabled={solo}
                        className={`atl-travel-btn${travelMode === m.id ? ' on' : ''}`}
                        onClick={() => setTravelMode((v) => (v === m.id ? '' : m.id))}
                      >
                        <b style={{ fontFamily: FONT_EMOJI }}>{m.emoji}</b>
                        <span>{t(`pack.addTrip.plan.travel.${m.id}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ODKIAĽ = VOĽNÝ TEXT (Matejova voľba 26. 8.). Vedomý dôsledok: appka z toho
                    nikdy nespočíta, komu kto leží po ceste — je to veta pre človeka, ktorý sa
                    rozhoduje, či sa pridá, nie údaj na výpočet. */}
                <div className={`atl-field${solo ? ' atl-field--off' : ''}`}>
                  <label>{t('pack.addTrip.plan.travelFrom')}</label>
                  <input
                    className="atl-input"
                    value={travelFrom}
                    disabled={solo}
                    onChange={(e) => setTravelFrom(e.target.value)}
                    placeholder={t('pack.addTrip.plan.travelFromPlaceholder')}
                  />
                  {/* Jediná veta o tom, prečo je celý krok stmavnutý — stojí pod POSLEDNÝM
                      zašednutým poľom pred vyzdvihnutím, nie pri každom z nich. */}
                  {solo && <p className="atl-field-hint" style={{ marginTop: 6 }}>{t('pack.addTrip.plan.soloNoNeed')}</p>}
                </div>

                {/* ── VYZDVIHNUTIE PO CESTE ────────────────────────────────────────────
                    ⚠️ LEN PRI „HĽADÁM SVORKU". Na súkromnom výlete niet koho vyzdvihnúť —
                    inzerát nikto nevidí a nikto nemôže požiadať o pridanie. Ponúknuť tam
                    miesta v aute znamená vypýtať si sľub, ktorý sa nemá ako naplniť.
                    Preto sa pole neukáže a do draftu nejde (viď jeho stavbu vyššie). */}
                {visibility === 'open' && (
                  <div className="atl-field">
                    <button
                      type="button"
                      className={`atl-check${pickup ? ' on' : ''}`}
                      aria-pressed={pickup}
                      onClick={() => setPickup((v) => !v)}
                    >
                      <b>{pickup ? '✓' : ''}</b>
                      <span>{t('pack.addTrip.plan.pickup')}</span>
                    </button>
                    {pickup && (
                      <div className="atl-seats">
                        <span>{t('pack.addTrip.plan.pickupSeats')}</span>
                        {/* Krokovadlo, nie číselník: na mobile otvára `type="number"` inú
                            klávesnicu a kvôli jednej číslici od 1 do 4 to nestojí za to. */}
                        <button type="button" onClick={() => setPickupSeats((n) => Math.max(1, n - 1))} aria-label="−">−</button>
                        <b>{pickupSeats}</b>
                        <button type="button" onClick={() => setPickupSeats((n) => Math.min(8, n + 1))} aria-label="+">+</button>
                      </div>
                    )}
                    <p className="atl-field-hint" style={{ marginTop: 6 }}>{t('pack.addTrip.plan.pickupHint')}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="atl-log-foot">
            {/* V KROKU 1 NAVIGÁCIU VLASTNÍ LIŠTA (HOTOVO nad mapou) — dve tlačidlá s tým istým
                účinkom na jednej obrazovke je presne ten zmätok, kvôli ktorému kroky vznikli. */}
            {/* KROK 2 MÁ SVOJE POKRAČOVANIE V LIŠTE NAD MAPOU — dva „ďalej" na jednej
                obrazovke (jeden v päte panela, druhý v doku) je otázka, ktorý z nich platí. */}
            {!isLastStep && !drawingStep && !notesInBar && (
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

            {isLastStep && (
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
                {/* ── VAROVANIE O KONCEPTE STOJÍ PRED TLAČIDLOM, NIE PO ŇOM (Matej 2026-08-26) ──
                    „tá informácia o koncepte NEMOŽE byť v reveale… ale v 5 kroku nad CTA
                     uložiť výlet tam musí byť červená bublinka."

                    ⚠️ JE TO PRESUN, NIE PRIDANIE. Do teraz to hlásil až REVEAL — teda PO
                    odoslaní, keď s tým už človek nič nespraví. Zmizlo aj z reveale
                    (`level/TripReveal.tsx`), inak by tá istá veta zaznela dvakrát a druhý raz
                    zbytočne.
                    ⚠️ ČERVENÁ JE TU VÝNIMKA. V tomto toku je červená vyhradená nevratným
                    akciám (zahodiť výlet, zmazať značku) — tu ju Matej vypýtal výslovne a
                    dôvod sedí: je to jediné miesto, kde sa dá ešte niečo zachrániť.
                    Vypisuje sa aj vtedy, keď sa `canSubmit` ešte nedosiahlo — chýbajúce polia
                    na SCHVÁLENIE sú iná množina než chýbajúce na ODOSLANIE a človek má vidieť
                    obe naraz, nie postupne. */}
                {!isPlan && missing.toApprove.length > 0 && (
                  <div className="atl-draftwarn" role="status">
                    <b>{t('pack.reveal.draftTitle')}</b>
                    <p>{t('pack.addTrip.step.willBeDraft', { fields: missingTx(missing.toApprove) })}</p>
                  </div>
                )}
                <div className="atl-nav">
                  <button type="button" className="atl-toggle-btn" onClick={goPrev}>{t('pack.addTrip.step.back')}</button>
                  <button type="button" className="btn-gold" disabled={!canSubmit || saving} onClick={handleSubmit}>
                    {/* „Zapísať výlet" na výlete, ktorý je zapísaný od minulého týždňa, znie
                        ako založenie druhého — pri dopĺňaní sa preto ukladá, nezapisuje.
                        ⚠️ Počas dopočtu prevýšenia (`resolveAscent`) tlačidlo POVIE, že pracuje,
                        a je vypnuté: bez toho vyzerá tá sekunda ako nefunkčný klik a človek
                        stlačí druhýkrát. */}
                    {saving
                      ? t('pack.mapNotes.add.saving')
                      : t(finishingDraft ? 'pack.addTrip.log.submitFinish' : isPlan ? 'pack.addTrip.log.submitPlan' : 'pack.addTrip.log.submit')}
                  </button>
                </div>
                {!canSubmit && missing.toSubmit.length > 0 && <p className="atl-log-hint">{t('pack.addTrip.log.missing', { fields: missingTx(missing.toSubmit) })}</p>}
                {!canSubmit && multiDayIssue && (
                  <p className="atl-log-hint">{t('pack.addTrip.step.journeyNeedsEnd')}</p>
                )}
                {/* ⚠️ Ten istý text POD tlačidlom zanikol — hovorí ho červená bublinka NAD ním
                    (Matej 2026-08-26). Dvakrát na jednej obrazovke by druhý raz nikto nečítal. */}
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
function PlacedNotes({ notes, t, emptyKey, onRemove }: {
  notes?: TripNoteRef[];
  t: (k: string, v?: Record<string, string | number>) => string;
  emptyKey: string;
  /**
   * DVA ŤUKY, NIE JEDEN (Matej 2026-08-24: „po kliknutí by sa mal zobraziť krížik
   * a opätovným by sa mali dať vymazať").
   *
   * Chipy stoja tesne nad zlatým CTA, takže jednoťukové mazanie by pri palci na úzkom
   * telefóne zmazalo značku, ktorú človek chcel len prečítať — a zmazanie ide rovno do DB,
   * teda sa nedá vrátiť. Prvý ťuk značku „odistí" (zjaví sa ×), druhý ju zmaže.
   *
   * Bez `onRemove` je zoznam len čítanie — presne tak stojí v zhrnutí kroku 4, kde sa
   * značky nemenia.
   */
  onRemove?: (id: string) => void;
}) {
  const [armed, setArmed] = useState<string | null>(null);
  // Odistenie sa nesmie prežiť zmenu zoznamu: po zmazaní by ostalo viset na indexe,
  // ktorý medzitým patrí inej značke.
  useEffect(() => { setArmed(null); }, [notes]);

  if (!notes || notes.length === 0) {
    return <p className="atl-field-hint">{t(emptyKey)}</p>;
  }
  return (
    <div className="atl-chips">
      {notes.map((n, i) => {
        // Staré rozrobené pridávanie nemá `id` (viď `readTripNotes`) — taký chip sa nedá
        // adresovať, takže ostáva čítaním. Radšej chýbajúce tlačidlo než zmazanie naslepo.
        const can = !!onRemove && !!n.id;
        const key = n.id || `${n.kind}-${i}`;
        const on = armed === key;
        return (
          <span
            key={key}
            className={`atl-chip on${can ? ' atl-chip--del' : ''}${on ? ' armed' : ''}`}
            role={can ? 'button' : undefined}
            tabIndex={can ? 0 : undefined}
            onClick={can ? () => { if (on) onRemove?.(n.id); else setArmed(key); } : undefined}
            onKeyDown={can ? (e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.preventDefault();
              if (on) onRemove?.(n.id); else setArmed(key);
            } : undefined}
            aria-label={can
              ? `${t(`pack.mapNotes.kind.${n.kind}`)} — ${t(on ? 'pack.addTrip.step.noteRemove' : 'pack.addTrip.step.noteArm')}`
              : undefined}
          >
            <span className="atl-chip-emoji" style={{ fontFamily: FONT_EMOJI }}>{MARK_EMOJI[n.kind as NoteKind]}</span>
            <span className="atl-chip-label">{t(`pack.mapNotes.kind.${n.kind}`)}</span>
            {on && <i className="atl-chip-x" aria-hidden="true">×</i>}
          </span>
        );
      })}
    </div>
  );
}

/** CSS krokového sprievodcu. ⚠️ JS template literal — spätný apostrof v komentári zhodí build. */
const STEP_CSS = `
/* ── HORNÝ PANEL S KROKMI JE ODDELENÝ ČIAROU (Matej 2026-08-26) ────────────────────────
   „celkovo treba zvizuálniť ten vrchný panel s krokmi, oddeliť čiarou alebo nejak inak."
   V krokoch 3–5 stál krokovník bez akéhokoľvek predelu tesne nad prvým poľom formulára,
   takže „kde som" a „čo vypĺňam" splývali do jedného zoznamu.
   ⚠️ ČIARA JE T.rule — zlatá, vyblednutá do strán, 2 px (CLAUDE.md). NIE šedý 1px
   hairline a NIE T.hairline ako rám: ten je iba na deliace čiary vnútri karty a ako
   predel medzi dvoma vrstvami obrazovky pôsobí ako nedokončený návrh. */
.atl-steps{display:flex;gap:6px;padding:2px 20px 12px;flex-shrink:0;position:relative;}
/* ⚠️ PODKLAD KROKOVNÍKA ZANIKOL (Matej 2026-08-26, druhé kolo): „nepáči sa mi ani okolie,
   kde je 5 krokov — hore a dole taký divný pás. Daj len dole takú čiaru do stratena."
   Ráno tu pribudlo jemné stmavnutie dosky s odôvodnením „Matej pýtal zvizuálniť, nie
   nakresliť linku". Bola to nadpráca: pás cez celú šírku sa na pieskovci prečítal ako
   PRÚŽOK INÉHO MATERIÁLU nalepený na doske, nie ako predel — a keďže hore aj dole končil
   rovnou hranou, mal dva okraje namiesto jedného.
   Ostáva jediný predel: T.rule — zlatá linka vyblednutá do strán (presne „do stratena"),
   teda bez hrán, o ktoré by sa dalo zakopnúť. */
.atl-steps:not(.atl-steps--onmap){padding:6px 20px 11px;}
.atl-steps:not(.atl-steps--onmap)::after{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:${T.rule};}
/* Veta o zámku stojí POD krokovníkom, teda mimo neho — v ňom by si delila riadok
   s piatimi bodkami a rozhodila by ich rovnaké diely. */
.atl-steps-lock{margin:-2px 20px 8px;font-family:${FONT_UI};font-size:10.5px;line-height:1.45;color:${T.onDarkDim};}
/* BODKY NAD MAPOU (kroky 1–2). Musia zniesť pestrý podklad, tak dostanú vlastný tmavý
   podklad a rám — nad turistickou mapou by holé číslice zanikli rovnako ako kedysi
   fialová pilulka. Popisky sa skryjú: päť názvov krokov sa vedľa krížika na 360 px
   nezmestí a číslo v krúžku aj tak nesie celú informáciu. */
.atl-steps--onmap{width:max-content;gap:5px;border-radius:999px;background:rgba(18,13,7,0.94);backdrop-filter:blur(10px);border:1px solid rgba(245,240,228,0.16);box-shadow:0 6px 20px rgba(0,0,0,0.55);padding:5px 7px;}
/* ⚠️ flex:0 0 auto, NIE zdedené 1 1 0. V paneli sa päť krokov delí o celú šírku, tu by
   sa tým rozťahovali cez pol obrazovky a medzi číslami by ostali prázdne polia — pilulka
   má obopnúť bodky, nie mapu pod nimi. */
.atl-steps--onmap .atl-step{flex:0 0 auto;padding:0;gap:0;border:0;background:none;}
.atl-steps--onmap .atl-step span{display:none;}
/* Prstenec ide s výplňou čísla — zlatý dosvit okolo lapisového kruhu je druhá farba na
   tom istom prvku. */
.atl-steps--onmap .atl-step.on b{box-shadow:0 0 0 3px ${LAPIS.halo};}
/* ÚNIK — otázka pred zahodením rozrobeného výletu. Tmavý povrch, lebo stojí nad mapou. */
.atl-abort-scrim{position:fixed;inset:0;z-index:1400;background:rgba(0,0,0,0.72);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;}
.atl-abort{width:100%;max-width:380px;padding:20px;border-radius:14px;background:rgba(18,13,7,0.97);border:1px solid ${T.onDarkBorder};box-shadow:0 18px 50px rgba(0,0,0,0.6);}
.atl-abort-face{display:block;width:46px;height:46px;object-fit:contain;margin:0 auto 10px;border-radius:12px;background:rgba(201,154,63,0.14);box-shadow:0 0 0 1.5px rgba(201,154,63,0.55);}
.atl-abort h2{margin:0;font-family:${FONT_TITLE};font-weight:700;text-transform:uppercase;font-size:15px;letter-spacing:.06em;color:${T.onDark};}
.atl-abort p{margin:10px 0 0;font-family:${FONT_UI};font-size:12.5px;line-height:1.55;color:${T.onDarkDim};}
.atl-abort-btns{display:flex;gap:8px;margin-top:16px;}
.atl-abort-btns > *{flex:1 1 0;}
/* Zahodenie je červené a je to jediná červená v celom toku — je to jediná nevratná akcia. */
.atl-abort-quit{padding:11px 10px;border-radius:8px;background:rgba(160,42,42,0.18);border:1px solid rgba(214,77,77,0.65);color:#F0A0A0;font-family:${FONT_UI};font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;}
.atl-abort-quit:hover{background:rgba(160,42,42,0.34);color:#fff;}
/* ── AINUBISOV DIALÓG (Matej 25. 8. 2026) ──────────────────────────────────────────────
   „daj všetky interakcie v jeho dizajne (tmavomodrá) tento nadpis centruj, CTA tlačítka
    daj tiež v brande a ikonka ainubisa musí byť v krúžku nie štvorci!"
   Farby sú tie isté, aké nesie bublina nad mapou ('AINUBIS_GUIDE_CSS') a tie sú zdvihnuté
   z jeho živého widgetu — jeden hlas má mať jeden povrch, nech sa objaví kdekoľvek.
   Centrovanie je celé, nie len nadpis: tvár už stojí v strede, takže nadpis vľavo pod ňou
   vyzeral ako odlomený. */
.atl-abort--ainubis{background:radial-gradient(120% 90% at 50% -20%,rgba(59,158,255,0.18) 0%,rgba(59,158,255,0) 62%),linear-gradient(180deg,#071019 0%,#03070C 100%);border:1px solid rgba(91,224,240,0.35);box-shadow:0 20px 60px rgba(0,0,0,0.7),0 0 40px rgba(59,158,255,0.16);text-align:center;}
.atl-abort--ainubis h2{color:#E6FAFF;text-shadow:0 0 18px rgba(91,224,240,0.35);}
.atl-abort--ainubis p{color:rgba(207,243,250,0.78);}
/* Kruh, nie štvorec — tá istá silueta, akú má vo widgete aj v bubline nad mapou. */
.atl-abort--ainubis .atl-abort-face{width:64px;height:64px;border-radius:50%;background:radial-gradient(circle at 35% 28%,#12233a 0%,#01050A 74%);box-shadow:0 0 0 1.5px rgba(91,224,240,0.40),0 0 26px rgba(59,158,255,0.34);margin-bottom:12px;}
/* CTA = brandový zlatý gradient ('.btn-gold' lock: #F5C73D→#E69E1A, papyrusový rám, r8).
   NIE pilulka a NIE vlastný gradient. */
.atl-abort-cta{width:100%;padding:12px 12px;border-radius:8px;background:linear-gradient(135deg,#F5C73D,#E69E1A);border:1px solid rgba(250,244,236,0.30);color:#1c160c;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;box-shadow:0 6px 18px rgba(230,158,26,0.28);}
.atl-abort-cta:hover{filter:brightness(1.06);}
/* Druhá voľba hovorí AInubisovým hlasom (cyan obrys), aby bolo vidieť, že ju ponúka ON —
   nie je to odmietnutie dialógu, je to rovnocenná odpoveď. */
.atl-abort-ghost{width:100%;padding:12px 12px;border-radius:8px;background:rgba(59,158,255,0.08);border:1px solid rgba(91,224,240,0.35);color:rgba(207,243,250,0.88);font-family:${FONT_UI};font-weight:600;font-size:11.5px;letter-spacing:.04em;cursor:pointer;}
.atl-abort-ghost:hover{background:rgba(59,158,255,0.16);color:#E6FAFF;}
/* ── JEDNO TLAČIDLO = JEDEN RIADOK (Matej 2026-08-26) ─────────────────────────────────
   „tento popup zväčši a možnosti daj pod seba nie vedľa (sú dlhé textovo a lámu sa —
    jedno tlačítko jeden riadok!)"

   ⚠️ PLATÍ NA KAŽDEJ ŠÍRKE, nie len pod 420 px. Pôvodné pravidlo vychádzalo z toho, že sa
   dve tlačidlá vedľa seba zmestia, kým je okno široké — lenže odpovede AInubisa sú VETY
   („Doplniť tú istú cestu späť", „Vrátil som sa inak"), takže sa lámali aj na PC, každá
   na iný počet riadkov, a rad z toho vyzeral ako rozbitý.
   Škatuľa je zároveň širšia: v 380 px sa tri vety lámali aj pod sebou. */
.atl-abort--ainubis{max-width:520px;padding:26px 24px;}
.atl-abort--ainubis .atl-abort-btns{flex-direction:column;gap:9px;}
.atl-step{flex:1 1 0;display:flex;flex-direction:column;align-items:center;gap:4px;padding:7px 4px;border-radius:9px;background:transparent;border:1px solid transparent;color:${T.onDarkDim};cursor:default;}
/* ── ČÍSLA KROKOV: VÄČŠIE, PLNOU FARBOU, BIELE (Matej 2026-08-26) ──────────────────────
   „tieto chipy s číslami si predstavujem o čosi väčšie a skôr plnou farbou a čísla bielou."
   Do teraz mali 20 px a priesvitnú výplň pri 6 % — na papyruse PC z toho ostal svetlý
   krúžok bez obsahu, teda presne to, čo sa má na prvý pohľad prečítať, sa prečítať nedalo.
   Biely inkoust drží vo VŠETKÝCH stavoch (aktívny, hotový, splnený), aby číslo nemenilo
   čitateľnosť podľa toho, kde človek stojí. */
.atl-step b{display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:rgba(122,90,42,0.55);border:1px solid ${T.onDarkBorder};color:#FFF;font-family:${FONT_UI};font-weight:700;font-size:12.5px;line-height:1;}
.atl-step span{font-family:${FONT_UI};font-weight:500;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;text-align:center;line-height:1.2;}
.atl-step.done{cursor:pointer;color:${T.onDark};}
.atl-step.done b{background:#8A5F1E;border-color:#8A5F1E;color:#FFF;}
/* ── AKTÍVNY KROK JE LAPIS, NIE ZLATÝ (Matej 2026-08-28) ───────────────────────────────
   „hore kde sú kroky 1-5 svieti krok na oranžovo - zmen na brand - lapis"
   🚩 MENÍ TO PRAVIDLO Z navGoldSkin.ts, kde je „aktívny krok" vymenovaný pod ZLATOM
   („kde som"). Dôvod, prečo padlo: zlatý gradient #D2A02A→#A96F17 je na papyrusovej doske
   jediná sýta teplá plocha na obrazovke a číta sa ako ORANŽOVÁ výstraha, nie ako poloha —
   a od 28. 8. je celý tok papyrusový, takže zlato na zlate polohu aj tak nepovie.
   Rám pilulky ostáva zlatý: konštrukciu (kde stojí prvok) drží ďalej zlato, mení sa výplň
   toho, čo je práve aktívne.
   ⚠️ Biely inkoust drží vo VŠETKÝCH stavoch — to sa nemení, lapis ho nesie rovnako. */
.atl-step.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.14)}}
.atl-step.on b{background:${LAPIS.grad};border-color:${LAPIS.deep};color:#FFF;}
/* ⚠️ ZELENÁ PREBÍJA ZLATÚ, ALE NIE NA AKTUÁLNOM KROKU. Zlatá hovorí „tu si", zelená „toto je
   hotové" — a keď platí oboje, dôležitejšie je, kde človek stojí. Preto '.ok' nie '.on'.
   Je to tá istá zelená, akou svieti splnená značka na trase (GROUP_TINT.comment) a vybratý
   pes v kroku 5 — jeden význam, jedna farba. */
/* ⚠️ ZELENÁ PLATÍ AJ NA KROK, NA KTOROM PRÁVE STOJÍŠ (Matej 25. 8. 2026: „ak v 4 neoznačím
   všetko a potom sa vrátim a označím, bod 4 zostane oranžový a nie zelený"). Pôvodné
   :not(.on) vychádzalo z predpokladu, že sa krok dokončí až tým, že z neho odídeš — lenže
   človek ho dopĺňa a pozerá sa, či to zabralo. Odpoveď „splnené" nesmie čakať na odchod.
   „Tu si" prežije: v paneli to hovorí zlatý rám dlaždice, na mape zlatý prstenec okolo
   čísla (.atl-steps--onmap .atl-step.on b) — obe iné vlastnosti než výplň, takže sa nebijú. */
.atl-step.ok b{background:${PICK};border-color:#1F5C33;color:#FFF;}
/* Nevyplnené pole po NÁVRATE do kroku. Rám aj popisok, nie len rám — samotný červený obrys
   sa na tmavom povrchu prehliadne. */
.atl-miss > label{color:#E08A7A;}
.atl-miss .atl-input,.atl-miss .atl-diffrow,.atl-miss .atl-chips,.atl-miss .atl-photos{border-radius:9px;box-shadow:0 0 0 1px #B25640;}
.atl-donepill{margin-left:8px;padding:2px 9px;border-radius:999px;background:rgba(122,47,191,0.22);border:1px solid rgba(179,107,255,0.55);color:#E9D8FF;font-size:10.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;}
/* ── STOPA P · N · T ───────────────────────────────────────────────────────────
   Tri diely na celú šírku (rad prvkov = celá šírka kontajnera, rovnaké diely).
   Prejdené sa dajú kliknúť späť — človek, ktorý parkovisko preskočil a spomenul si,
   nemá inú cestu, ako celý krok zopakovať odznova. */
.atl-ntrack{display:flex;gap:6px;}
.atl-ntrack-i{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:5px;padding:7px 5px;border-radius:999px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};color:${T.onDarkDim};font-family:${FONT_UI};cursor:pointer;}
.atl-ntrack-i b{display:flex;align-items:center;justify-content:center;flex:0 0 auto;width:17px;height:17px;border-radius:50%;background:rgba(245,240,228,0.07);font-size:9.5px;font-weight:700;line-height:1;}
/* ⚠️ TESNEJŠIE PREKLADANIE PÍSMEN NEŽ INDE (Matej 2026-08-26, druhé kolo). Odkedy je
   neoznačená možnosť ČERVENÁ, nesie chip s bodmi KAŽDÁ z troch (predtým len tie, ktoré človek
   nechal za sebou) — a na kompaktnom PC (stĺpec 360 px) sa z „PARKOVISKO" stalo „PARK…".
   Rieši sa to preložením a výplňou pilulky s bodmi, nie skrytím tej pilulky: „0 bodov" pri
   neoznačenej si Matej vypýtal 24. 8. výslovne. */
/* ⚠️ FOCUS RING IDE DOVNÚTRA (Matej 2026-08-28: „horný okraj chipu sa stráca a zreže sa
   outline"). Prehliadačov outline sa kreslí MIMO hranice tlačidla, takže ho ľavý stĺpec
   (.trp-dock--pc s overflow-y:auto) po kliknutí zhora oreže rovnou čiarou — presne tá istá
   pasca, na akej sa 26. 8. rezala žiara AInubisovej bubliny. Záporný offset ho posadí na
   vnútornú hranu, kde ho nemá čo orezať; viditeľnosť pre klávesnicu ostáva. */
.atl-ntrack-i:focus-visible{outline:2px solid ${LAPIS.edge};outline-offset:-2px;}
.atl-ntrack-i span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9.5px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;}
/* ── VÝBER = MODRÁ, ALE PRIESVITNÁ (Matej 2026-08-26, tretie kolo) ─────────────────────
   „výber PWT som chcel modré/zelené/červené, ale priesvitné — nie modrá plná, to sa bije
    s CTA."
   Farba ostáva: lapis je v redizajne /map „moja voľba a moja akcia" (navGoldSkin.ts), nie
   mapová modrá — tá drží značky. Mení sa VÁHA. Plná lapisová výplň je rezervovaná pre
   jediný prvok na doske — hlavné CTA; keď ju nesie aj chip, obrazovka má dve hlavné veci.
   ⚠️ Recept je pickTintCSS, nie tri rgba čísla tu: rovnaký tint nesú aj chipy, náročnosť
   a tagy o dva kroky ďalej a rozišli by sa pri prvej úprave. */
.atl-ntrack-i.on{${pickTintCSS(LAPIS.edge, LAPIS.ink, 0.30)}}
.atl-ntrack-i.on b{background:rgba(239,215,154,0.92);color:${LAPIS.deep};}
/* ── VÝSLEDOK PREBÍJA POSTUP ──────────────────────────────────────────────────────────
   Zlatá hovorí „tu si", zelená a červená hovoria „takto to dopadlo" — a to je dôležitejšie,
   preto stoja NIŽŠIE v poradí a prebíjajú .on. Zelená je tá istá, akú na mape nesie TIP
   (GROUP_TINT.comment), červená tá istá, akú nesie UPOZORNENIE — nezavádzajú sa nové farby.
   Body v chipe sú POINTS.note, nie napísané číslo. */
/* SPLNENÉ = ZELENÝ TINT. ⚠️ PREBÍJA aktívny stav ZÁMERNE: „hotové" je dôležitejšia
   správa než „tu si".
   ⚠️ NIE JE TO NÁVRAT PRED 26. 8. Vtedy tu bola zelená pri 14 % so SVETLÝM inkoustom a na
   papyruse z toho ostal svetlý text na takmer bielom — to bol dôvod plnej výplne. Tint
   sám nestačí: čitateľnosť nesie tmavý inkoust a plný farebný rám (viď pickTintCSS),
   nie krytie výplne. Tmavý mobil dostáva svetlý inkoust v LOG_CSS o riadok nižšie. */
.atl-ntrack-i.ok{${pickTintCSS(GROUP_TINT.comment, '#D8F2E0', 0.28)}}
.atl-ntrack-i.ok b{background:rgba(216,242,224,0.22);border:1px solid ${GROUP_TINT.comment};color:#D8F2E0;}
/* NEOZNAČENÉ = ČERVENÝ TINT, rovnaká váha ako zelený a modrý vedľa neho. */
.atl-ntrack-i.miss{${pickTintCSS(HAZARD_RED, '#FFD9D2', 0.26)}}
.atl-ntrack-i.miss b{background:rgba(255,217,210,0.22);border:1px solid ${HAZARD_RED};color:#FFD9D2;}
/* Chip s bodmi. Malý a bez rámu — je to poznámka k pilulke, nie druhá pilulka v nej.
   tabular-nums, aby sa „+3" a „0" nehojdali v rade vedľa seba. */
.atl-ntrack-pts{flex:0 0 auto;font-style:normal;font-size:9px;font-weight:700;line-height:1;letter-spacing:.02em;font-variant-numeric:tabular-nums;padding:3px 4px;border-radius:999px;}
.atl-ntrack-i.ok .atl-ntrack-pts{background:rgba(61,122,78,0.30);color:#D8F2E0;}
.atl-ntrack-i.miss .atl-ntrack-pts{background:rgba(206,75,60,0.30);color:#FFD9D2;}
.atl-noteask{padding:12px 14px;border-radius:12px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};}
.atl-noteask p{margin:0 0 10px;font-family:${FONT_UI};font-size:13px;line-height:1.45;color:${T.onDark};}
.atl-noteask-btns{display:flex;gap:8px;}
.atl-noteask-btns .atl-toggle-btn{flex:1 1 0;}
/* KROK 2 V LIŠTE NAD MAPOU — lišta už rám aj podklad má, druhý dovnútra by vyrobil
   škatuľu v škatuli. Ostáva len rozostup medzi otázkou, zoznamom značiek a pokračovaním. */
.atl-noteask--bar{padding:0;border:0;background:none;display:flex;flex-direction:column;gap:10px;}
.atl-noteask--bar p{margin:0;}
/* ── HLAVIČKA POĽA: POPISOK VĽAVO, ODKAZ VPRAVO ────────────────────────────────────────
   Odkaz „otvoriť na celú obrazovku" patrí k poľu, nie nad formulár — preto stojí v jeho
   riadku a nie vo vlastnom, ktorý by krok natiahol. */
.atl-fieldhead{display:flex;align-items:baseline;justify-content:space-between;gap:10px;}
.atl-fieldhead > label{margin:0;}
.atl-expand{flex:0 0 auto;background:none;border:0;padding:0;color:${GOLD};font-family:${FONT_UI};font-size:11px;font-weight:500;text-decoration:underline;text-underline-offset:3px;cursor:pointer;}
.atl-expand:hover{color:#F5C73D;}
/* ── EDITOR PRÍBEHU NA CELÚ OBRAZOVKU (§4.5) ───────────────────────────────────────────
   Papyrusová plocha, do ktorej sa píše — teda úroveň 5 matrice (plochý papyrus), nie
   sklenený panel. Výška je daná oknom, nie obsahom: text má rásť do plochy, ktorá už stojí,
   inak by sa pri písaní hýbalo tlačidlo pod ním. */
.atl-editor-scrim{position:fixed;inset:0;z-index:1500;background:rgba(24,14,4,0.72);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:24px;}
.atl-editor{display:flex;flex-direction:column;gap:12px;width:min(860px,100%);height:min(80vh,760px);padding:20px;border-radius:18px;background:linear-gradient(135deg,#FBF5E6 0%,#F2E2BD 100%);border:1.5px solid ${T.cardEdge};box-shadow:0 24px 64px rgba(0,0,0,0.55),0 0 0 3px rgba(201,154,63,0.15);}
.atl-editor-head{display:flex;align-items:center;justify-content:space-between;gap:10px;font-family:${FONT_TITLE};font-weight:700;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#2a1608;}
.atl-editor-x{border:0;background:transparent;color:#7a5a2a;font-size:22px;line-height:1;cursor:pointer;padding:0 4px;}
.atl-editor-x:hover{color:#2a1608;}
.atl-editor-area{flex:1 1 auto;min-height:0;resize:none;width:100%;box-sizing:border-box;padding:14px 16px;border-radius:8px;background:#FBF5E6;border:1px solid rgba(179,130,45,0.55);color:#2a1608;font-family:${FONT_UI};font-size:15px;line-height:1.6;}
.atl-editor-area:focus{outline:none;border-color:${T.cardEdge};}
.atl-editor-area::placeholder{color:#7a5a2a;opacity:.7;}
.atl-editor-done{flex:0 0 auto;align-self:flex-end;min-width:180px;}
/* ── HODNOTENIE JE VÝRAZNEJŠIE (§5.3) ──────────────────────────────────────────────────
   Matej 2026-08-26: „hodnotenie musí byť tiež výraznejšie."
   Päť malých obrysových labiek v rade bez akéhokoľvek rámu vyzeralo ako popisok, nie ako
   pole, ktoré sa vypĺňa. Dostáva vlastnú plochu (úroveň 2 matrice), väčšie labky a číslo
   vedľa — číslo je jediné, čo z hodnotenia človek prečíta na diaľku. */
.atl-rate{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;border-radius:12px;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};}
.atl-rate-val{flex:0 0 auto;font-family:${FONT_TITLE};font-weight:700;font-size:18px;line-height:1;color:${T.onDarkDim};font-variant-numeric:tabular-nums;}
.atl-rate-val.on{color:#F5C73D;}
/* ── ČERVENÁ BUBLINKA NAD CTA (§5.4) ───────────────────────────────────────────────────
   Plná výplň a plný rám, nie priesvitný tint: stojí nad zlatým tlačidlom a musí sa dať
   prečítať skôr, než sa naň klikne. Inkoust je tmavočervený na svetlom, aby fungovala aj
   na papyruse PC — druhá verzia pre bledý skin tým odpadá. */
.atl-draftwarn{margin-bottom:10px;padding:10px 13px;border-radius:10px;background:rgba(206,75,60,0.14);border:1.5px solid rgba(206,75,60,0.75);}
.atl-draftwarn b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:11.5px;letter-spacing:.07em;text-transform:uppercase;color:#E9A093;}
.atl-draftwarn p{margin:5px 0 0;font-family:${FONT_UI};font-size:11.5px;line-height:1.5;color:${T.onDarkDim};}
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
/* ⚠️ TOOLTIP JE MENO, NIE AVATAR (opravené 2026-08-26). Selektor span:not(.plus) bral
   z toku AJ .comm-comp-dog-av, lebo aj ten je <span>. Kým bola pilulka nevybraná, držal
   jej šírku aspoň plusko; odkedy je vlastný pes predvyplnený (§5.1 zadania), plusko tam nie je
   a celá pilulka spadla na 8×8 px — teda na bod, v ktorom sa fotka psa vôbec nezobrazí.
   Vyzeralo to ako chyba dát („pes bez fotky"), pritom fotka bola načítaná a mala 28 px. */
.atl-companions .comm-comp-dog span:not(.plus):not(.comm-comp-dog-av){
  position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);
  white-space:nowrap;background:rgba(6,5,3,0.95);border:1px solid ${T.onDarkBorder};
  padding:4px 9px;border-radius:6px;font-family:${FONT_UI};font-size:11px;font-weight:500;
  color:${T.onDark};opacity:0;pointer-events:none;transition:opacity .15s ease;z-index:6;
}
.atl-companions .comm-comp-dog:hover span:not(.plus):not(.comm-comp-dog-av),
.atl-companions .comm-comp-dog:focus span:not(.plus):not(.comm-comp-dog-av){opacity:1;}
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
.atl-log-head{display:flex;align-items:center;gap:10px;padding:11px 20px 7px;flex-shrink:0;}
.atl-log-back{background:rgba(245,240,228,0.06);border:1px solid ${T.onDarkBorder};color:${T.onDark};width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:15px;line-height:1;}
.atl-log-back:hover{border-color:${GOLD};color:${GOLD};}
.atl-log-title{font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:${T.onDark};}
/* Titulná obrazovka pridávania — návrat v strede, pod ním nadpis a jedna veta. */
.atl-log-head--plain{justify-content:center;padding:14px 20px 8px;}
/* ⚠️ SEDEM DLAŽDÍC SA MUSÍ ZMESTIŤ NA TELEFÓN (Matej 2026-08-23: „výber aktivity sa nezmestí
   na viewport mobilu"). Je to prvá obrazovka pridávania a zoznam, z ktorého sa vyberá — keď
   spodné dve položky ležia pod hranou, vyzerá to, že aktivít je päť. Preto je tu rytmus
   utiahnutý (výplne, medzery, nadpis) a veta pod nadpisom je DVOJRIADKOVÁ; keď ju budeš
   predlžovať, premeraj to znova pri innerHeight ~700. */
.atl-log-head--intro{flex-direction:column;align-items:center;gap:18px;padding:30px 20px 14px;text-align:center;}
/* Matej 2026-08-27: „vyzerá to prázdne… centruj nadpis, zväčši nadpis Pick an activity."
   Je to titulná strana celého pridávania a od zúženia sedmičky aktivít na ŠTYRI kategórie
   je pod ňou o tri dlaždice menej — nadpis teda nekonkuruje zoznamu, ale drží prázdnu
   plochu. Centrovanie nesie .atl-log-head--intro vyššie (flex column + text-align). */
/* ── ZLATÁ ČIARKA POD NADPISOM (Matej 2026-08-28: „pri vyber aktivitu pridaj pod nadpis
      tú čiarku čo si teraz pridal v ADD") ───────────────────────────────────────────────
   Ten istý prvok, aký nesú dlaždice vstupného popupu — deliaca linka T.rule z locku bledého
   bloku. Drží dve obrazovky za sebou v jednom jazyku: názov je hlavička, nie prvý riadok
   odseku. Odkedy pod ňou nestojí veta, je to jediné, čo nadpis oddeľuje od zoznamu.
   ⚠️ Kreslí sa na ::after, teda nezaberá vlastný riadok — výškový rozpočet obrazovky
   (dlaždice sa musia zmestiť bez skrolu) sa nemení. */
.atl-log-title--big{font-size:26px;letter-spacing:.07em;line-height:1.2;position:relative;padding-bottom:12px;}
.atl-log-title--big::after{content:'';position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:52px;height:2px;border-radius:2px;background:${T.rule};}
/* JEDEN STĹPEC NA MOBILE (Matej 2026-08-23: „políčka na mobile zväčši tak aby boli cez celý
   displej"). Dlaždica sa tým narovná do riadku — emoji vľavo, názov vedľa — takže výška
   obrazovky vystačí aj na sedem položiek. Nad 560 px ostávajú dva stĺpce. */
/* Zoznam je JEDINÉ, čo sa smie posúvať — nadpis a návrat ostávajú na mieste aj na
   najnižších displejoch, kde sa sedem položiek naozaj nezmestí. */
/* Centrovanie namiesto zarovnania na vrch (Matej 2026-08-24: „obsah centrovať — dnes sedí pri vrchnom
   okraji a pod ním ostáva prázdno").
   ⚠️ MUSÍ TO BYŤ "safe center", NIE holé "center". Holé center v skrolovacom kontajneri
   pretlačí prvú dlaždicu NAD začiatok skrolu, keď sa obsah nezmestí — a tam sa už nedá
   doskrolovať. Na nízkom telefóne na šírku by tak zmizla turistika, teda prvá voľba.
   Slovo safe prepne späť na start presne v tej chvíli, keď by k tomu došlo. */
/* ROZŤAHOVANIE, NIE CENTROVANIE (Matej 2026-08-27). Štyri jednoriadkové dlaždice nechávali
   v 700 px stĺpci ~120 px hore aj dole; 1fr riadky si voľnú výšku rozdelia rovným dielom,
   takže blok je plný bez toho, aby sa čokoľvek dopĺňalo len na výplň. min-content v spodnej
   hranici drží mobil — tam voľná výška nie je a riadok nesmie klesnúť pod obsah. */
.atl-tiles{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;display:grid;grid-template-columns:1fr;grid-auto-rows:minmax(min-content,1fr);align-content:stretch;gap:12px;padding:2px 20px calc(14px + env(safe-area-inset-bottom,0px));}
.atl-tiles.has-open{grid-auto-rows:min-content;align-content:safe center;}
/* Emoji vľavo cez oba riadky, vpravo názov NAD vetou. Bol to flex rad, v ktorom sa veta
   zalamovala pod emoji (flex:1 1 100%) — s vetou na KAŽDEJ dlaždici by tak sedem položiek
   začínalo siedmimi rôznymi odsadeniami. */
/* JEDEN RIADOK, JEDNO SLOVO (Matej 2026-08-26). Mriežka dvoch riadkov tu stála kvôli vete
   pod názvom; tá je odteraz v rozbaľovači, takže z dlaždice ostal rad: emoji · názov · šípka.
   Flex namiesto grid-u zámerne — pri jednom riadku je grid-row:1/3 na emoji aj šípke len
   opis toho, čo align-items:center spraví samo. */
/* ⚠️ VÄČŠIE OD 27. 8. (Matej: „urob tie tlačítka väčšie"). Vojde sa to preto, že tu už
   nestojí sedem aktivít, ale ŠTYRI kategórie — pri sedmičke bol jednoriadkový tvar jediný
   spôsob, ako sa zmestiť bez skrolovania, a to bol celý dôvod, prečo veta z dlaždice
   odišla do rozbaľovača. Zoznam ostáva skrolovateľný, takže pribudnutie piatej to nezhodí. */
.atl-tile{display:flex;align-items:center;gap:16px;padding:18px 20px;border-radius:${PLATE_TILE_R}px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};cursor:pointer;text-align:left;transition:border-color .15s ease,background .15s ease;}
.atl-tile:hover{border-color:${GOLD};background:rgba(201,154,63,0.10);}
.atl-tile-emoji{flex:0 0 auto;font-size:34px;line-height:1;}
/* Názov je JEDNO SLOVO a nesie identitu voľby ⇒ Cinzel, nie Space Grotesk (brand: nadpisy
   a názvy sú Cinzel). Ako veta pod ním by to bolo zlé, ako štítok je to správne. */
.atl-tile-label{min-width:0;font-family:${FONT_TITLE};font-weight:700;font-size:16px;letter-spacing:.05em;text-transform:uppercase;color:${T.onDark};}
/* ── KROK 0b: PLÁNUJEM / PREŠLI SME TO ────────────────────────────────────────────────────
   Rozbaľovač je SÚČASŤ dlaždice, nie samostatný blok pod zoznamom: keby stál mimo, pri
   siedmich položkách by človek nevidel, ku ktorej sa voľba vzťahuje. Otvorená dlaždica preto
   stráca spodný rádius a rozbaľovač ho preberá — spolu tvoria jeden predmet. */
.atl-tile-wrap{display:flex;flex-direction:column;min-width:0;min-height:0;}
.atl-tiles:not(.has-open) .atl-tile{flex:1 1 auto;}
/* Dvojriadkový text vedľa emoji — názov nesie Cinzel, veta ide bežným písmom a nededí
   uppercase ani letter-spacing z nadpisu. */
.atl-tile-txt{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:5px;}
.atl-tile-note{font-family:${FONT_UI};font-weight:400;font-size:12.5px;line-height:1.4;letter-spacing:0;text-transform:none;color:${T.onDarkDim};}
.atl-tile-caret{flex:0 0 auto;font-family:${FONT_UI};font-size:15px;line-height:1;color:${T.onDarkDim};}
/* ── OTVORENÁ DLAŽDICA = JEDEN TMAVÝ BLOK (Matej 2026-08-27) ─────────────────────────────
   „treba skúsiť iné otváranie — blok stmavne a priamo v tom istom bloku budú 2 možnosti."
   Predtým to boli DVA prvky pod sebou (svetlá dlaždica + prilepený pásik s vlastným rámom),
   spojené len tým, že sa medzi nimi zrušil okraj — a práve ten šev bolo vidno.
   ⚠️ POVRCH JE LAPIS, NIE ČIERNA (Matej 2026-08-27: „tmavú zmeň na lapis nech držíme brand").
   Sadá to presne do pravidla lapisu z navGoldSkin.ts — ZLATO = konštrukcia a poloha,
   LAPIS = moja voľba a moja akcia, menovite „vybraná dlaždica". Neutrálna čierna hovorila
   len „toto je iné"; lapis povie „toto som vybral ja", a so zlatým písmom drží pôvodnú
   egyptskú dvojicu. NIE je to T.brandBlue — tou appka značí body NA MAPE.
   ⚠️ Rám a polomer ostávajú zhodné so zatvorenými — musia vyzerať ako súrodenci, inak sa
   pri otvorení „prepne" celý zoznam. Mení sa výplň a inkoust, nič iné.
   ⚠️ Predpona .atl-tile-wrap.is-open nie je ozdoba: bledý PC prepis (PALE_LOG_CSS) stojí
   v DOM POSLEDNÝ, takže pri rovnakej špecificite vyhrá on a dlaždica by ostala papyrusová. */
.atl-tile-wrap.is-open{background:${LAPIS.grad};border:1px solid ${LAPIS.edge};border-radius:${PLATE_TILE_R}px;overflow:hidden;box-shadow:${LAPIS_BTN_SHADOW};}
.atl-tile-wrap.is-open .atl-tile{background:transparent;border-color:transparent;border-radius:0;box-shadow:none;}
.atl-tile-wrap.is-open .atl-tile-label{color:${LAPIS.ink};}
.atl-tile-wrap.is-open .atl-tile-note,.atl-tile-wrap.is-open .atl-tile-caret{color:rgba(239,215,154,0.72);}
.atl-mode{border:0;background:transparent;padding:0 16px 16px;}
/* VETA, NIE EYEBROW. Kým tu stálo „Zapisuješ, alebo plánuješ?", bol to štítok — rozhádzané
   veľké písmená s veľkým prestrkom sa čítajú po slovách. Teraz nesie riadok skutočnú vetu
   o aktivite, tak je sadzaná ako veta. */
.atl-mode-btns{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start;}
/* Stĺpec = tlačidlo + vysvetlivka POD ním, obe na tú istú šírku. */
.atl-mode-col{display:flex;flex-direction:column;gap:7px;min-width:0;}
/* Rad tlačidiel berie celú šírku rovnakými dielmi (feedback_rad_prvkov_plna_sirka_kontajnera). */
/* Tlačidlá stoja NA lapise, tak nesú zlatý inkoust — plná svetlá výplň by z nich urobila
   dve hlavné CTA vnútri prvku, ktorý sám je len vybraná dlaždica. */
.atl-mode-btn{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:46px;padding:10px 12px;border-radius:10px;background:rgba(239,215,154,0.10);border:1.5px solid rgba(239,215,154,0.32);color:${LAPIS.ink};cursor:pointer;transition:border-color .15s ease,background .15s ease;}
.atl-mode-btn b{font-family:${FONT_TITLE};font-weight:700;font-size:13.5px;letter-spacing:.05em;text-transform:uppercase;line-height:1.15;}
/* Vysvetlivka nie je tlačidlo — nemá rám ani plochu, len tichý text na šírku stĺpca. */
.atl-mode-cap{font-family:${FONT_UI};font-weight:400;font-size:10.5px;line-height:1.35;text-align:center;color:rgba(239,215,154,0.68);}
/* Popisok v zátvorke na druhom riadku — je to spresnenie, nie druhá voľba, tak nesmie mať
   rovnakú váhu ako label. Strop 600 platí aj tu: Space Grotesk nad 600 je fake bold. */
.atl-mode-btn:hover,.atl-mode-btn:focus-visible{border-color:${LAPIS.ink};background:rgba(239,215,154,0.20);outline:none;}
.atl-mode-emoji{font-family:${FONT_EMOJI};font-size:17px;line-height:1;}
@media (max-width:359px){
  .atl-mode-btns{grid-template-columns:1fr;}
}
/* ══ VÝBER AKTIVITY NA TELEFÓNE = TLAČIDLÁ, NIE PÁSY (Matej 2026-08-28) ══════════════════
   „výber aktivity je moc ťažkopádny a roztiahnutý veľký, skonsoliduj to nech to vyzerá ako
    tlačidlá — viac vzduchu po bokoch aj celkovo po krajoch… väčšie rozostupy"

   ⚠️ RUŠÍ TO ROZŤAHOVANIE Z 27. 8. („opticky musí byť ten blok plný" — riadky 1fr si delili
   voľnú výšku). Ten lock riešil PC panel vysoký ~700 px so štyrmi nízkymi dlaždicami; odkedy
   je formulár na telefóne CELÁ OBRAZOVKA, tá istá deklarácia nafúkne každú dlaždicu na ~150 px
   a zo zoznamu je stĺpec plôch bez tvaru. Prázdno sa preto rieši VZDUCHOM MEDZI tlačidlami
   a okolo nich, nie ich naťahovaním — dlaždica ostáva veľká akurát na to, čo v nej je.
   PC vetva sa NEMENÍ, tam lock platí ďalej.
   ⚠️ Hranica je PALE_PC_MIN — to isté číslo, na ktorom .trp-addhost prechádza z plávajúceho
   panela na celú obrazovku. Vlastné číslo by vyrobilo pásmo šírok, kde je formulár už
   celoobrazovkový, ale zoznam sa ešte správa ako v paneli. */
@media (max-width:${PALE_PC_MIN - 1}px){
  /* ⚠️ ROVNAKO VYSOKÉ, ALE NIE ROZŤAHOVANÉ. Holé min-content dá každej dlaždici inú výšku
     (CHILL má popis na dva riadky) a štyri rôzne vysoké obdĺžniky sa nečítajú ako rad
     tlačidiel. Strop 96 px ich zrovná; keby v niektorom jazyku popis narástol, minmax()
     strop IGNORUJE (max menší než min sa zahadzuje), takže sa nikdy nič neoreže — a
     rozdiel oproti 1fr je práve to, že rásť do prázdna už nemôžu.
     Voľná výška teda ide do ROZOSTUPOV a okrajov, presne ako si Matej vypýtal. */
  .atl-tiles{grid-auto-rows:minmax(min-content,96px);align-content:safe center;gap:18px;padding:2px 22px calc(18px + env(safe-area-inset-bottom,0px));}
  .atl-tile{gap:14px;padding:14px 16px;}
  .atl-tile-emoji{font-size:28px;}
  .atl-tile-label{font-size:15px;}
  .atl-tile-note{font-size:12px;}
  .atl-log-head--intro{padding-left:22px;padding-right:22px;}

  /* ── NADPIS PATRÍ K DLAŽDICIAM, NIE K HORNEJ HRANE (Matej 2026-08-28) ──────────────────
     „ten nadpis posuň nižšie — patrí to k tým 4 blokom"
     Nadpis stál hore a zoznam sa centroval vo zvyšku obrazovky, takže medzi nimi zívalo
     ~85 px a nadpis pôsobil ako hlavička stránky, nie ako uvedenie zoznamu. Posunúť ho
     samotný nižšie by nepomohlo: každý pixel, o ktorý klesne, uberie zoznamu polovicu
     jeho hornej medzery, takže diera sa zmenšuje o polovicu toho, čo sa nadpis vzdiali
     od šípky. Preto sa nadpis a zoznam centrujú AKO JEDEN CELOK a medzi nimi ostáva len
     výplň hlavičky.
     ⚠️ Šípka ide MIMO TOKU (a hore ostáva rezerva jej výšky), inak by ju centrovanie
     stiahlo dole s celou dvojicou — a návrat by medzi ADD a výberom aktivity poskočil
     o 70 px, teda presne to, čomu sa presunom šípky do stredu predchádzalo.
     ⚠️ flex:0 1 auto na zozname (namiesto 1 1 auto): zoznam sa smie ZMRAŠTIŤ a rolovať
     na nízkom displeji, ale nesmie sa naťahovať — inak vyplní zvyšok a centrovať nie je čo.
     Slovo safe drží vrch dosiahnuteľný, keď sa dvojica nezmestí. */
  .atl-log--intro{position:relative;justify-content:safe center;padding-top:52px;}
  .atl-log--intro .atl-log-head--intro{padding-top:0;gap:0;}
  .atl-log--intro .atl-log-back{position:absolute;top:14px;left:50%;transform:translateX(-50%);}
  .atl-log--intro .atl-tiles{flex:0 1 auto;}
}
/* ⚠️ DVOJSTĹPCOVÁ MRIEŽKA ZANIKLA (Matej 2026-08-26: „musíme aktivity dať do jedného riadku,
   pretože v dropdowne je výber a ten je stlačený ak je blok s aktivitou na polovičnej
   veľkosti"). Rozbaľovač je súčasťou dlaždice, takže v dvoch stĺpcoch dostal polovičnú šírku
   a dve tlačidlá v ňom sa lámali. Jeden stĺpec je preto podmienka toho, aby rozbaľovač vôbec
   mohol niesť vetu a dve tlačidlá vedľa seba — nie estetická voľba.
   Miesto, ktoré tým dlaždice stratili na šírku, získali späť na výšku: bez vety je riadok
   nízky, takže sedem aktivít sa aj tak zmestí bez skrolovania. */
/* PEVNÝ VIEWPORT (Matej 23. 8.: „na mobile musí byť pevný viewport, nie pohyblivý mimo").
   Vodorovne sa neskroluje nikdy — čo pretečie, je chyba prvku, nie dôvod na posúvanie
   stránky. Vlastnosť overscroll-behavior drží ťah prsta vnútri formulára, aby sa pod ním nehýbala
   mapa ani celý dokument. */
.atl-log-body{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:4px 20px 16px;display:flex;flex-direction:column;gap:11px;}
/* ── KROK SA MÁ ZMESTIŤ, NIE SKROLOVAŤ (Matej 2026-08-26) ──────────────────────────────
   „niektoré kroky vo flow sa musia scrolovať… skúsme to spraviť tak, aby sa nemuselo."
   Krok 4 potreboval 544 px do 450 px vysokého tela. Šesť polí nad sebou, z toho päť má
   pevnú výšku danú obsahom (tri voľby, chipy) — pružné je jediné: pole na príbeh.
   Dostáva preto zvyšok miesta namiesto pevných troch riadkov: na vysokom okne je z neho
   veľká písacia plocha, na nízkom sa stiahne na dva riadky a krok sa zmestí celý.
   ⚠️ Zvyšné úspory sú v geometrii (rozostup 14→11, popisky, hlavička, krokovník) — samotné
   pružné pole by pri veľmi nízkom okne kleslo pod čitateľnú výšku a min-height by potom
   skrol vrátil. overflow-y:auto vyššie ostáva ako poistka, nie ako spôsob použitia.
   ⚠️ resize sa vypína ZÁMERNE: ručne nastavená výška je inline štýl, ktorý pružnosť
   prebije, a pole by sa po prvom potiahnutí prestalo prispôsobovať. Kto chce veľkú plochu,
   má nad poľom „otvoriť na celú obrazovku" — to je tá istá hodnota, len bez okienka. */
.atl-field--grow{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;}
/* ⚠️ DNO 120 px, nie 58 (2026-08-26): rastúce pole je v celom súbore JEDINÉ — príbeh
   výletu v kroku 3 — a 58 px je výška, pri ktorej vidno riadok a pol. Rastie do zvyšku
   stĺpca; toto číslo platí len vtedy, keď stĺpec žiadny zvyšok nemá (nízke okno). */
.atl-field--grow .atl-textarea{flex:1 1 auto;min-height:120px;resize:none;}
.atl-photo{flex:0 0 auto;position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,#1c2b1a,#0e1a0d);background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;border:1px solid ${T.onDarkBorder};}
.atl-photo-badge{font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#F5C73D;background:rgba(0,0,0,0.45);padding:8px 14px;border-radius:8px;border:1px solid rgba(201,154,63,0.5);}
.atl-field label{display:block;font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};margin-bottom:4px;}
.atl-field-hint{font-weight:400;text-transform:none;letter-spacing:0;opacity:.72;font-size:10.5px;font-family:${FONT_UI};color:${T.onDarkDim};}
/* ⚠️ 16 px JE MINIMUM, NIE VKUS (feedback_dogypt_form_input_recurring_bugs, tretí výskyt
   23. 8.). Pod ním iOS Safari pri kliknutí do poľa priblíži CELÝ dokument a ovládanie
   ukotvené k okrajom vypadne mimo obrazovky — vyzerá to, že sa appka rozbila, nie že je
   priblížená. Platí to na KAŽDÉ pole, aj na dátum a rozbaľovačky.
   min-width:0 + max-width:100%: pole s type=date má na iOS vlastnú vnútornú šírku
   a v grid bunke (min-width:auto) ju presadí — riadok tak pretiekol cez okraj stránky
   a dal sa vodorovne posúvať (Matej 23. 8.: „dátum preteká cez okraj"). */
.atl-input{width:100%;min-width:0;max-width:100%;box-sizing:border-box;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:9px;padding:9px 11px;color:${T.onDark};font-family:${FONT_UI};font-size:16px;outline:0;}
.atl-input:focus{border-color:${GOLD};}
.atl-input::placeholder{color:${T.onDarkDim};}
.atl-input:disabled{opacity:.45;}
/* ── DÁTUM NA iOS (Matej 2026-08-23: „veľké políčko preteká cez okraj, centrovaný na stred") ──
   input[type=date] si na WebKite/iOS drží VLASTNÚ vnútornú šírku podľa formátu dátumu a
   width:100% ju neprebije — pole vyrastie nad svoj stĺpec a pretečie cez okraj panela.
   K tomu má vnútorná hodnota (::-webkit-date-and-time-value) na iOS default text-align:center,
   takže dátum stojí v strede, kým všetky ostatné polia píšu zľava.
   ⚠️ Bez spätných apostrofov zámerne — toto je JS template literal a ukončili by ho.
   Tri pravidlá, tri príčiny — vypnúť natívny vzhľad NESTAČÍ, šírku aj zarovnanie treba povedať
   zvlášť. Platí na oba dátumy (od/do) aj na akýkoľvek ďalší type=date v sprievodcovi. */
/* ⚠️ PRÁZDNY DÁTUM NA iOS SKOLABUJE NA POLOVIČNÚ VÝŠKU (Matej 2026-08-25, opakovane:
   „už po niekoľký krát sa sťažujem na zlý text area pri dátume — aký je úzky… po pridaní
   už je to ok"). Nie je to dizajn, je to WebKit: '::-webkit-date-and-time-value' je bez
   hodnoty prázdny inline box s výškou 0, takže pole vysoké ~39 px (16 px písmo + 2×9 px
   výplň + rám) spadne na ~20 px. Po vypísaní dátumu box dostane obsah a výška sa vráti —
   preto to vyzeralo náhodne.
   Riešenie je z DVOCH strán, samotné 'min-height' na poli nestačí: bez druhého riadku
   ostane text prilepený hore, lebo prázdny vnútorný box sa nemá o čo oprieť.
   Počíta sa z 'em', nie z pevných pixelov — pole vedľa má 'font-size:16px', a keby sa
   niekedy zmenilo, dvojica sa nesmie rozísť. */
.atl-input[type="date"]{-webkit-appearance:none;appearance:none;position:relative;display:block;width:100%;min-width:0;max-width:100%;padding-right:46px;text-align:left;min-height:calc(1.2em + 20px);}
.atl-input[type="date"]::-webkit-date-and-time-value{text-align:left;margin:0;min-height:1.2em;line-height:1.2;}
/* ── IKONKA KALENDÁRA NA PLNÚ VÝŠKU POĽA (Matej 2026-08-24) ──────────────────────────
   „dátum na mobile má úzky text area — dajme tam ikonku kalendára v normálnej výške
    textarey."
   Pole bolo rovnako vysoké ako ostatné; úzko pôsobila IKONKA — Chrome ju kreslí ~14 px
   a nalepenú hneď za dátum, takže vyzerala ako drobný odznak uprostred poľa a nie ako
   niečo, čoho sa dá dotknúť. Teraz je to pás pri pravom okraji cez CELÚ výšku poľa,
   teda cieľ pre palec.
   ⚠️ POZICOVANÉ ABSOLÚTNE, NIE FLEXOM. Flex na hostiteľovi ani na webkit-datetime-edit
   Chrome pri appearance:none NEPOUŽIJE — obe cesty boli vyskúšané a ikonka ostala visieť
   za textom (pravidlá boli v dokumente, len bez účinku). Absolútne pozicovanie na vnútorný
   layout dátumového vstupu nespolieha vôbec.
   ⚠️ NATÍVNY GLYF JE SKRYTÝ, NEPREFARBENÝ. Chrome ho kreslí tmavý a prilepený k HORNEJ
   hrane, keď sa element roztiahne na plnú výšku; filter:invert ani background-position naň
   spoľahlivo neplatia (obe vyskúšané naživo — ikonka ostala tmavá a hore). Element preto
   ostáva ako priehľadná KLIKACIA PLOCHA cez celú výšku a kalendár kreslí sám vstup ako
   pozadie — tam sa dá vycentrovať aj zafarbiť na zlatú.
   ⏳ Kresba je geometrická, nie z hand-drawn setu: kit kalendár NEMÁ. Je to ovládanie
   vstupu (rovnaká trieda vecí ako šípka rozbaľovacieho zoznamu), nie ikonka obsahu, takže
   lucide sem neťaháme — ak má byť kreslená, treba si ju vypýtať od Mateja. */
.atl-input[type="date"]{background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C99A3F' stroke-width='1.8' stroke-linecap='round'%3E%3Crect x='3' y='5' width='18' height='16' rx='2.5'/%3E%3Cpath d='M3 10h18M8 3v4M16 3v4'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 13px center;background-size:20px 20px;}
.atl-input[type="date"]:disabled{background-image:none;}
.atl-input[type="date"]::-webkit-calendar-picker-indicator{position:absolute;right:0;top:0;width:46px;height:100%;margin:0;padding:0;opacity:0;cursor:pointer;}
.atl-textarea{resize:vertical;font-family:${FONT_UI};}
.atl-row2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;}
/* Rad na CELÚ šírku, rovnaké diely — počet dielov sa riadi počtom polí, nie mriežkou.
   Preto flex a nie grid: pri jedinom poli (krajina bez regiónu) sa diel roztiahne sám. */
.atl-rowfull{display:flex;gap:10px;}
.atl-rowfull > *{flex:1 1 0;min-width:0;}
.atl-row3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;}
/* ── RAD, KTORÝ SA NA MOBILE NEROZPADNE (Matej 2026-08-24) ─────────────────────────
   „skúsme dať do jedného riadku, aby sme ušetrili miesto, lebo je potrebný scroll."
   ⚠️ Je to VÝNIMKA z pravidla z 23. 8. („políčka na mobile zväčši tak aby boli cez celý
   displej"), nie jeho zrušenie — preto vlastná trieda a nie zásah do .atl-row3. Obe
   požiadavky sú platné a protirečia si len pri týchto troch poliach: sú to rozbaľovacie
   zoznamy s krátkou hodnotou, kde plná šírka nič nepridá, ale tri riadky navyše stoja
   presne ten skrol, ktorý Matej reklamuje. Meno, dátum ani popis sa nedotkli.
   Popisky sa na úzkom displeji skracujú ORezaním s tromi bodkami, nie zmenšením písma —
   pod 9,5 px by prestali byť čitateľné. */
.atl-row3--tight{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;}
.atl-row3--tight .atl-field label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.atl-row3--tight .atl-input{padding-left:8px;padding-right:6px;}
/* ⚠️ DVOJICA, KTORÁ SA NA TELEFÓNE NEROZPADNE (Matej 2026-08-25: „povrch a ruch daj do
   jedného riadku vedla saba nie pod seba"). '.atl-row2' sa pod 640 px zlomí do stĺpca —
   správne pre dlhé polia (názov, dátum), ale toto sú dva krátke rozbaľovače a pod sebou
   zbytočne naťahujú krok o celý riadok. Rovnaký dôvod, pre aký '.atl-row3--tight' v tej
   media query zámerne nie je. */
.atl-row2--tight{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
.atl-row2--tight .atl-field label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.atl-row2--tight .atl-input{padding-left:8px;padding-right:6px;}
/* Rad náročností: celá šírka, rovnaké diely (rad prvkov = celý kontajner). Štyri stupne sa
   na najužší telefón zmestia len s malým písmom a bez uppercase — značka nesie význam,
   text ju už len pomenúva. */
.atl-diffrow{display:flex;gap:6px;}
/* ⚠️ BODKA VEDĽA SLOVA, NIE NAD NÍM. Náročnosť robí presne to isté, čo ruch a povrch pod
   ňou — vyberá sa jedna z troch — ale ako jediná stála na dvoch riadkoch, takže vyzerala
   ako iný druh ovládania a stála o 20 px viac. Rad emoji + slovo je vzor, ktorý už drží
   zvyšok kroku. */
.atl-diffbtn{flex:1 1 0;min-width:0;display:flex;flex-direction:row;align-items:center;justify-content:center;gap:6px;padding:9px 4px;border-radius:9px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};color:${T.onDarkDim};font-family:${FONT_UI};font-size:10.5px;font-weight:500;line-height:1.1;cursor:pointer;}
.atl-diffbtn span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;}
.atl-diffbtn.on{background:rgba(61,122,78,0.26);border-color:${PICK};color:${T.onDark};box-shadow:inset 0 0 0 1px ${PICK};}
.atl-toggle-row{display:flex;gap:8px;}
/* ── OTÁZKA V DOKU NAD HOTOVOM (2026-08-27) ────────────────────────────────────────────
   Stojí NAD MAPOU, takže platí pravidlo doku: plná tmavá výplň nesie panel, tu ostáva len
   rozostup a popiska. Žiadny vlastný podklad — druhá plocha vnútri panela by z jedného
   ovládania spravila dve. */
.atl-daymode{display:flex;flex-direction:column;gap:7px;}
.atl-daymode-ask{font-family:${FONT_UI};font-size:11px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${T.onDarkDim};}
/* Odkaz, nie tretie tlačidlo: výber z magistrál je vedľajšia cesta k tej istej trase a
   v rade s dvoma prepínačmi by vyzeral ako tretia odpoveď na otázku o dĺžke výletu. */
/* ── ODYSEA (2026-08-27) — OZNÁMENIE, NIE VOĽBA ────────────────────────────────────────
   Priesvitný modrý tint podľa locku z 26. 8. (recept pickTintCSS), nie plná farba: plná modrá je
   rezervovaná pre hlavné CTA a dva rovnako sýte modré prvky na jednej obrazovke si
   konkurujú. cursor:default je zámerný — nič sa tu neklikne. */
/* ⚠️ border MUSÍ BYŤ DEKLAROVANÝ — pickTintCSS dáva len border-COLOR — bez šírky a štýlu
   sa rám nevykreslí a z modrého tintu ostane na piesku šedá plocha. Práve plný farebný
   rám (nie krytie výplne) nesie podľa locku z 26. 8. čitateľnosť. */
.atl-odyssey{display:flex;align-items:center;gap:10px;padding:11px 13px;border:1px solid transparent;border-radius:10px;cursor:default;${pickTintCSS(LAPIS.edge, LAPIS.ink, 0.26)}}
.atl-odyssey-mark{font-size:14px;line-height:1;opacity:.9;}
.atl-odyssey-txt{display:flex;flex-direction:column;gap:2px;min-width:0;}
.atl-odyssey-txt b{font-family:${FONT_TITLE};font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;}
.atl-odyssey-txt i{font-family:${FONT_UI};font-style:normal;font-size:11.5px;font-weight:400;opacity:.85;}
.atl-daycount{margin:2px 0 0;font-family:${FONT_UI};font-size:12px;font-weight:500;letter-spacing:.06em;color:${T.onDarkDim};}
.atl-daymode-link{align-self:flex-start;background:none;border:none;padding:2px 0;color:${T.onDarkDim};font-family:${FONT_UI};font-size:12px;text-decoration:underline;text-underline-offset:3px;cursor:pointer;}
/* ⚠️ RAD PREPÍNAČOV = CELÁ ŠÍRKA, ROVNAKÉ DIELY. Trieda atl-toggle-row doteraz nemala ŽIADNE
   pravidlo — bol to holý div, takže tlačidlá so šírkou 100% sa poukladali POD SEBA a jedno
   pole („kedy idete" má tri presnosti a štyri týždne) zabralo sedem riadkov. Rovnako stála
   aj viditeľnosť plánu. Deľba flex 1 1 0 je tá istá, akú drží atl-restore-btns. */
.atl-toggle-row > .atl-toggle-btn{flex:1 1 0;min-width:0;}
/* ⚠️ ZELENÁ LEN V RADE VOLIEB. Samostatný .atl-toggle-btn.on je AKCIA (Zostať,
   Pokračovať, Zapísať aj tak), nie označená možnosť — tam zlatá ostáva. */
.atl-toggle-row > .atl-toggle-btn.on{background:rgba(61,122,78,0.26);border-color:${PICK};color:${T.onDark};box-shadow:inset 0 0 0 1px ${PICK};}
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
/* ── DOPRAVA (2026-08-26) ───────────────────────────────────────────────────────────────
   Mriežka, nie zalamovaný rad: šesť dlaždíc s emoji a slovom sa pri wrape láme na 4+2
   a posledný riadok potom visí. Tri stĺpce dajú vždy 3+3.
   Výber je PRIESVITNÝ TINT (lock 26. 8.) — plná farba je vyhradená hlavnému CTA. */
/* ZAŠEDNUTÉ POLE (2026-08-26) — pole, ktoré pri sólo výlete nemá koho zaujímať. Ostáva
   VIDITEĽNÉ zámerne: keby zmizlo, krok 3 by sa pri prepnutí voľby scvrkol na dátum a človek
   by netušil, že o niečo prišiel. Tlmí sa celý blok naraz, nie každý ovládač zvlášť. */
/* Pole s natívnym kalendárom sa OTVÁRA KLIKOM (viď openNativePicker) — musí to teda aj
   vyzerať klikateľne. S textovým kurzorom to vyzerá ako políčko na písanie a človek začne
   ťukať bodky, čo bola presne tá výhrada („nech človek nemusí písať"). */
.atl-input--pick{cursor:pointer;}
.atl-field--off{opacity:.42;}
.atl-field--off .atl-input,.atl-field--off .atl-travel-btn{cursor:not-allowed;}
.atl-travel{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
.atl-travel-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:9px 4px;border-radius:9px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};color:${T.onDarkDim};cursor:pointer;min-width:0;}
.atl-travel-btn b{font-size:17px;line-height:1;font-weight:400;}
.atl-travel-btn span{font-family:${FONT_UI};font-weight:500;font-size:10.5px;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
.atl-travel-btn:hover{border-color:${GOLD};}
.atl-travel-btn.on{background:rgba(61,122,78,0.26);border-color:${PICK};color:${T.onDark};box-shadow:inset 0 0 0 1px ${PICK};}
/* ZAŠKRTNUTIE — vlastný prvok, nie natívny checkbox: ten sa nedá zladiť s tmavým povrchom
   bez appearance hackov a na mobile má cudziu veľkosť. Je to <button aria-pressed>. */
.atl-check{display:flex;align-items:center;gap:9px;width:100%;text-align:left;padding:9px 11px;border-radius:9px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};color:${T.onDarkDim};cursor:pointer;}
.atl-check b{flex:0 0 auto;width:16px;height:16px;border-radius:4px;border:1px solid ${T.onDarkBorder};display:flex;align-items:center;justify-content:center;font-size:11px;line-height:1;}
.atl-check span{font-family:${FONT_UI};font-weight:500;font-size:11.5px;letter-spacing:.02em;}
.atl-check.on{background:rgba(61,122,78,0.26);border-color:${PICK};color:${T.onDark};box-shadow:inset 0 0 0 1px ${PICK};}
.atl-check.on b{border-color:${PICK};color:${T.onDark};}
.atl-seats{display:flex;align-items:center;gap:8px;margin-top:8px;}
.atl-seats span{font-family:${FONT_UI};font-weight:500;font-size:11px;letter-spacing:.02em;color:${T.onDarkDim};}
.atl-seats b{font-family:${FONT_TITLE};font-weight:700;font-size:14px;color:${T.onDark};min-width:16px;text-align:center;}
.atl-seats button{width:26px;height:26px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:14px;line-height:1;cursor:pointer;}
.atl-seats button:hover{border-color:${GOLD};}
.atl-chip{display:inline-flex;align-items:center;height:28px;font-family:${FONT_UI};font-weight:500;font-size:11px;letter-spacing:.02em;padding:0 10px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};color:${T.onDarkDim};cursor:pointer;}
.atl-chip.on{background:rgba(61,122,78,0.28);border-color:${PICK};color:${T.onDark};box-shadow:inset 0 0 0 1px ${PICK};}
.atl-chip-emoji{display:inline-flex;align-items:center;justify-content:center;width:15px;flex:0 0 15px;line-height:1;font-size:13px;margin-right:5px;}
.atl-chip-label{line-height:1;}
.atl-chip-add{border-style:dashed;}
/* ── DRUHÝ, ZBALENÝ RAD CHIPOV (2026-08-31) ────────────────────────────────────────────
   Prerušovaný rám je zámer: hovorí „toto je ponuka, nie pole na vyplnenie". Plný rám by
   z rozbaľovača spravil rovnocenný ovládač s chipmi nad ním, a práve to sa nemá stať —
   druhý rad si musí človek vypýtať. */
.atl-more{margin-top:9px;}
.atl-morebtn{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;text-align:left;font-family:${FONT_UI};font-weight:500;font-size:11.5px;letter-spacing:.02em;padding:9px 12px;border-radius:10px;background:transparent;border:1px dashed ${T.onDarkBorder};color:${T.onDarkDim};cursor:pointer;}
.atl-morebtn:hover{border-color:${GOLD};color:${T.onDark};}
.atl-morebtn-arw{flex:0 0 auto;font-size:11px;line-height:1;opacity:.7;}
.atl-more-body{margin-top:9px;padding-top:10px;border-top:1px solid ${T.onDarkBorder};display:flex;flex-direction:column;gap:9px;}
/* ── TICHÁ PONUKA MIESTA ───────────────────────────────────────────────────────────────
   LAPIS, nie zelená: zelená v tomto toku znamená „vybral som si", lapis „appka niečo
   ponúka / vie". Rovnaká dvojica ako pri odysei o kus vyššie. */
.atl-where{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 11px;border:1px solid transparent;border-radius:10px;${pickTintCSS(LAPIS.edge, LAPIS.ink, 0.20)}}
.atl-where-txt{display:flex;flex-direction:column;gap:2px;min-width:0;}
.atl-where-txt b{font-family:${FONT_UI};font-weight:500;font-size:11.5px;letter-spacing:.02em;}
/* „nemusíš" musí byť vidno bez rozklikávania — je to celý zmysel tejto ponuky. */
.atl-where-txt i{font-style:normal;font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;opacity:.72;}
.atl-where-btn{flex:0 0 auto;font-family:${FONT_UI};font-weight:600;font-size:11px;letter-spacing:.03em;white-space:nowrap;padding:7px 11px;border-radius:8px;background:${LAPIS.grad};border:1px solid ${LAPIS.deep};color:${LAPIS.ink};cursor:pointer;box-shadow:${LAPIS_BTN_SHADOW};}
/* ── ODISTENÝ CHIP ZNAČKY (mazanie dvoma ťukmi) ───────────────────────────────────────
   Odistený chip zčervenie a pribudne mu × — druhý ťuk už značku zmaže, a to nevratne,
   takže to musí vyzerať inak než „vybraté". Červená je tá istá, akú nesie upozornenie
   na mape aj zahodenie výletu: v tomto toku je farbou nevratnej akcie. */
.atl-chip--del{cursor:pointer;}
.atl-chip--del.armed{background:rgba(206,75,60,0.18);border-color:rgba(206,75,60,0.65);color:#F0A0A0;}
.atl-chip-x{font-style:normal;margin-left:6px;font-size:14px;line-height:1;opacity:.9;}
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
/* Náhľad titulnej fotky priamo nad posuvníkom. Pomer 16:9 = ten istý tvar, v akom fotka
   nakoniec sedí na karte výletu, takže sa neposúva výrez, ktorý človek nikdy neuvidí. */
.atl-cover-preview{width:100%;aspect-ratio:16/9;border-radius:10px;background-size:cover;
  background-repeat:no-repeat;border:1px solid rgba(179,130,45,0.55);}
.atl-cover-crop label{font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:${T.onDarkDim};}
.atl-cover-slider{width:100%;accent-color:${GOLD};}
.atl-log-foot{flex-shrink:0;margin:0 20px 20px;display:flex;flex-direction:column;gap:8px;}
/* ⚠️ CTA EDITORA JE V PORTÁLI NA <body>, teda MIMO .atl-log-foot — bez druhého selektora
   by z neho ostalo holé systémové tlačidlo (odskúšané). Pravidlo je jedno, nie kópia:
   .btn-gold lock (CLAUDE.md) hovorí, že gradient existuje na jednom mieste na súbor. */
.atl-log-foot .btn-gold,
.atl-editor .btn-gold{
  width:100%;padding:13px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border:1px solid rgba(250,244,236,0.30);border-radius:8px;color:#000;font-family:${FONT_TITLE};
  font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;
  box-shadow:0 0 40px rgba(230,158,26,0.4),inset 0 1px 0 rgba(255,255,255,0.3);
  transition:transform .2s,box-shadow .22s,opacity .22s;
}
.atl-log-foot .btn-gold:hover:not(:disabled),
.atl-editor .btn-gold:hover:not(:disabled){transform:scale(1.02);box-shadow:0 0 56px rgba(230,158,26,0.55),inset 0 1px 0 rgba(255,255,255,0.3);}
.atl-log-foot .btn-gold:disabled,
.atl-editor .btn-gold:disabled{opacity:.45;cursor:default;box-shadow:none;}
.atl-log-hint{margin:0;font-family:${FONT_UI};font-size:11px;color:${T.onDarkDim};text-align:center;}
.atl-log-error{margin:0;font-family:${FONT_UI};font-size:11.5px;color:#E08A6E;text-align:center;}
.atl-dupwarn{padding:10px 12px;border-radius:10px;background:rgba(201,154,63,0.10);border:1px solid ${GOLD};}
.atl-dupwarn p{margin:0 0 8px;font-family:${FONT_UI};font-size:11.5px;color:${T.onDark};line-height:1.4;}
.atl-dupwarn-btns{display:flex;gap:8px;}
.atl-dupwarn-btns .atl-toggle-btn{padding:7px 10px;font-size:10.5px;}
@media (max-width:640px){
  .atl-row2,.atl-row3{grid-template-columns:minmax(0,1fr);}
  /* .atl-row3--tight sem ZÁMERNE nepatrí — viď jeho komentár vyššie. */
  /* Dvojtriedne zámerne: .atl-field label je 0-1-1 a jednotriedny prepis by prehral,
     media query špecificitu nepridáva (to je presne to, na čo upozorňuje check:css). */
  .atl-field .atl-label-spacer{display:none;}
}
`;

export default AddTripLog;

// ══ BLEDÝ SKIN FORMULÁRA PRIDÁVANIA (2026-08-26, mobil doplnený 2026-08-28) ══════════════
// Redizajn chrome mapy do bledého štýlu (Matej: „ideme robiť redizajn do bledého štýlu…
// teraz ideme riešiť PC /map - add trip a flow"). Formulár žije v .trp-addhost, ktorý je
// odteraz papyrusový panel so zlatým rámom — obsah v onDark tokenoch by v ňom bol biely
// text na piesku.
//
// PREČO PRÍDAVOK A NIE PREPIS PRAVIDIEL VYŠŠIE: zamietnutie sa musí dať vrátiť jedným
// slovom — "MAP_SKIN = glass" v navGoldSkin.ts a je späť tmavé sklo, bez hľadania pôvodných
// hodnôt v gite. To je jediný dôvod, prečo je to prídavok.
//
// ⚠️ MEDIA QUERY ZANIKLA 28. 8. 2026 (Matej: „po kliknutí na pridať sa teraz zobrazí tmavá
// verzia — potrebujeme to prerobiť na novú verziu = natiahni dizajn aký je na PC iba ho
// prispôsob viewportu"). Do vtedy bol blok zamknutý na min-width PALE_PC_MIN a mobil ostával
// tmavý. Farby sú na oboch šírkach TIE ISTÉ, takže druhá kópia pre mobil by sa rozišla pri
// prvej úprave; rozmery a tvar rieši .trp-addhost v PALE_ADD_CSS (PackMap.tsx), nie tento blok.
//
// PREČO POSLEDNÝ <style>: STEP_CSS sa vkladá ZA LOG_CSS, takže pravidlá o krokoch by pri
// rovnakej špecificite prehrali. Tento blok musí ísť do DOM ako posledný — viď poradie
// <style> značiek v renderi.
//
// Plochy podľa matrice PACK_BOX (packTheme.ts): panel = úroveň 4, sekcia = úroveň 2,
// pole = úroveň 5 (plochý papyrus, do svetla sa píše). Vlastné odtiene sa tu nevymýšľajú.
const { ink: P_INK, dim: P_DIM, edge: P_EDGE, deep: P_DEEP, border: P_BORDER, field: P_FIELD, soft: P_SOFT } = PALE;

const PALE_LOG_CSS = MAP_SKIN !== 'pale' ? '' : `
  /* ── hlavička kroku ─────────────────────────────────────────────────────────────────── */
  .atl-log-back{background:${P_SOFT};border-color:${P_BORDER};color:${P_INK};}
  .atl-log-back:hover{border-color:${P_EDGE};color:${P_DEEP};background:#FFFDF6;}
  .atl-log-title{color:${P_INK};}

  /* ── krokovník ──────────────────────────────────────────────────────────────────────── */
  .atl-step{color:${P_DIM};}
  .atl-step b{background:rgba(122,90,42,0.45);border-color:${P_BORDER};color:#FFF;}
  .atl-step.done{color:${P_INK};}
  .atl-step.done b{background:#8A5F1E;border-color:#6E4E18;color:#FFF;}
  /* ⚠️ Zlatý tint aktívneho kroku zanikol 28. 8. spolu so zlatým číslom — tento blok je
     v DOM POSLEDNÝ, takže by lapisový tint zo STEP_CSS ticho prebil a krok by ostal
     oranžový presne tam, kde ho Matej videl. Inkoust nesie lapis, nie papyrus. */
  .atl-step.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.14)}}
  .atl-step.ok b{background:${PICK};border-color:#1F5C33;color:#FFF;}
  /* Krokovník NAD MAPOU: plná papyrusová výplň, nie priesvitná — nad mapou sa priesvitnosť
     nepoužíva nikdy, čo pod ňou prebliká, robí z lišty neprečítateľný prvok. */
  .atl-steps--onmap{background:linear-gradient(180deg,#F6EAD0,#E9D9AE);border:1.5px solid ${P_EDGE};box-shadow:0 8px 24px rgba(70,45,10,0.35);backdrop-filter:none;-webkit-backdrop-filter:none;}

  /* ── dlaždice výberu aktivity (krok 1) ──────────────────────────────────────────────── */
  .atl-tile{background:linear-gradient(160deg,#FBF5E6 0%,#F3E4C4 55%,#EAD6A6 100%);border:1px solid ${P_EDGE};box-shadow:0 1px 3px rgba(122,90,42,0.10),inset 0 1px 0 rgba(255,255,255,0.40);}
  .atl-tile:hover{background:linear-gradient(160deg,#FFFBF0 0%,#F6E9CF 55%,#EEDCB0 100%);border-color:${P_DEEP};box-shadow:0 0 0 3px rgba(201,154,63,0.26);}
  .atl-tile-label{color:${P_INK};}
  .atl-tile-note{color:${P_DIM};}
  .atl-tile-caret{color:${P_DIM};}
  /* ⚠️ OTVORENÁ DLAŽDICA SA V BLEDOM SKINE NEPREFARBUJE — je LAPISOVÁ zámerne (viď STEP_CSS).
     Do 27. 8. tu stáli tri svetlé prepisy (dlaždica, pásik, tlačidlá); po zmene by z lapisového
     bloku spravili papyrusový a stav by prestal byť vidieť. */
  /* Veta o aktivite je odteraz VETA, nie eyebrow — na papyruse ju číta človek, tak dostane
     plný inkoust. Stlmená (P_DIM) bola správna, kým to bol štítok „Zapisuješ, alebo plánuješ?". */
  /* ⚠️ Popisok v zátvorke si nesie vlastnú farbu (onDarkDim), takže sa NEDEDÍ z tlačidla —
     bez tohto riadku je na papyruse biely na svetlom, teda neviditeľný. Presne tá diera,
     kvôli ktorej sa každý nový prvok s vlastnou farbou musí doplniť aj sem. */

  /* ── polia a ovládanie formulára ────────────────────────────────────────────────────── */
  .atl-field label{color:${P_DIM};}
  .atl-field-hint{color:${P_DIM};}
  .atl-input,.atl-textarea{background:${P_FIELD};border-color:${P_BORDER};color:${P_INK};}
  .atl-input:focus{border-color:${P_EDGE};}
  .atl-input::placeholder{color:${P_DIM};opacity:.7;}
  .atl-diffbtn{background:${P_SOFT};border-color:${P_BORDER};color:${P_DIM};}
  /* ── VÝBER JE TINT, INKOUST TMAVÝ (Matej 2026-08-26, tretie kolo) ────────────────────
     „výbery chipov budú priesvitné, nie plné farby, aj ďalej pri označovaní náročnosti,
      tagov a podobne."
     Plná zelená sa sem dostala 26. 8. ráno preto, že tint mal SVETLÝ inkoust a na piesku
     zanikol. Chyba nebola v krytí, ale vo farbe písma — pickTintCSS dáva tmavý inkoust
     tej istej farby a plný farebný rám, takže chip drží váhu aj bez plnej výplne. */
  .atl-diffbtn.on{${pickTintCSS(PICK, PICK_INK.green, 0.20)}}
  .atl-toggle-btn{background:${P_SOFT};border-color:${P_BORDER};color:${P_DIM};}
  .atl-toggle-btn.on{background:rgba(201,154,63,0.20);border-color:${P_DEEP};color:${P_INK};}
  .atl-toggle-row > .atl-toggle-btn.on{${pickTintCSS(PICK, PICK_INK.green, 0.20)}}
  .atl-daymode-ask{color:${T.inkWarm};}
  .atl-daymode-link{color:${T.inkWarm};}
  .atl-daycount{color:${T.inkWarm};}
  /* Na papyruse nesie čitateľnosť TMAVÝ inkoust, nie vyššie krytie výplne — to je celý
     dôvod, prečo sa 26. 8. ráno siahlo po plnej farbe a večer sa to vrátilo späť. */
  /* ⚠️ MODRÁ TU DRŽÍ RÁM A INKOUST, NIE VÝPLŇ — a je to zámer locku, nie nedoladenosť.
     Nad piesok (#E8DCBB) sa akákoľvek TMAVÁ farba pri 20 % krytia zmieša na teplú šedú:
     lapis #16307A dá (188,185,178), mapová modrá #2E5FD0 dá (191,193,192) — obe šedé.
     Vyskúšané 27. 8., preto to netreba skúšať znova: hue sa nedá zachrániť odtieňom,
     len vysokým krytím, a plná farba je vyhradená hlavnému CTA (lock 26. 8.). */
  .atl-odyssey{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.20)}}
  .atl-daterange-hint{color:${P_DIM};}
  .atl-journey-link{color:${P_DEEP};}
  .atl-journey-list{border-color:${P_BORDER};}
  .atl-journey-item{background:${P_SOFT};border-color:${P_BORDER};}
  .atl-journey-item:hover{border-color:${P_DEEP};}
  .atl-journey-item.on{background:rgba(201,154,63,0.20);border-color:${P_DEEP};}
  .atl-journey-name{color:${P_INK};}
  .atl-journey-meta{color:${P_DIM};}
  .atl-chip{background:${P_SOFT};border-color:${P_BORDER};color:${P_DIM};}
  .atl-chip.on{${pickTintCSS(PICK, PICK_INK.green, 0.20)}}
  .atl-travel-btn{background:${P_SOFT};border-color:${P_BORDER};color:${P_DIM};}
  .atl-travel-btn:hover{border-color:${P_DEEP};}
  .atl-travel-btn.on{${pickTintCSS(PICK, PICK_INK.green, 0.20)}}
  .atl-check{background:${P_SOFT};border-color:${P_BORDER};color:${P_DIM};}
  .atl-check b{border-color:${P_BORDER};}
  .atl-check.on{${pickTintCSS(PICK, PICK_INK.green, 0.20)}}
  .atl-seats span{color:${P_DIM};}
  .atl-seats b{color:${P_INK};}
  .atl-seats button{background:${P_FIELD};border-color:${P_BORDER};color:${P_INK};}
  .atl-seats button:hover{border-color:${P_DEEP};}
  /* Odistený chip mazania ostáva ČERVENÝ — je to jediná nevratná akcia v toku a farba
     nesie význam, nie štýl. Mení sa len inkoust, aby bol na svetlom čitateľný. */
  .atl-chip--del.armed{background:rgba(206,75,60,0.16);border-color:rgba(176,52,40,0.7);color:#8E2A20;}
  /* Dva rady chipov na papyruse — inkoust musí stmavnúť, inak zbalený rad na piesku zanikne
     (tá istá chyba, ktorá 26. 8. dotlačila výbery k plnej farbe). */
  .atl-morebtn{border-color:${P_BORDER};color:${P_DIM};}
  .atl-morebtn:hover{border-color:${P_EDGE};color:${P_DEEP};}
  .atl-more-body{border-top-color:${P_BORDER};}
  .atl-where{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.14)}}
  .atl-where-btn{color:${LAPIS.ink};}
  .atl-file-btn{background:${P_FIELD};border-color:${P_BORDER};color:${P_INK};}
  .atl-file-btn:hover:not(:disabled){border-color:${P_DEEP};color:${P_DEEP};}
  .atl-photo-thumb{border-color:${P_BORDER};}
  .atl-cover-crop label{color:${P_DIM};}
  .atl-log-hint{color:${P_DIM};}
  .atl-log-error{color:#9E3A22;}
  .atl-dupwarn{background:rgba(201,154,63,0.14);border-color:${P_DEEP};}
  .atl-dupwarn p{color:${P_INK};}
  /* ── V DOKU ŽIADNA DRUHÁ VRSTVA (Matej 2026-08-26) ─────────────────────────────────
     „na prvý pohľad vidno že je to otvorené, aktuálne je pod chipmi a tlačítkami akási
      spodná vrstva čo má inú farbu ako blok…. zmaž to nech má blok jedno pozadie."
     .atl-noteask--bar si podklad ruší už v STEP_CSS (v lište nad mapou by bola škatuľa
     v škatuli), lenže TENTO blok sa vkladá do DOM ako POSLEDNÝ a plošným selektorom
     mu ho vracal (plošný selektor). Preto výnimka — nie nový odtieň, ale žiadny. */
  .atl-noteask:not(.atl-noteask--bar){background:rgba(255,251,240,0.6);border-color:${P_BORDER};}
  .atl-noteask p{color:${P_INK};}
  .atl-restore{background:rgba(255,251,240,0.6);border-color:${P_BORDER};}
  .atl-restore-txt{color:${P_INK};}
  .atl-miss > label{color:#9E3A22;}
  .atl-draftwarn{background:rgba(206,75,60,0.12);border-color:rgba(176,52,40,0.8);}
  .atl-draftwarn b{color:#8E2A20;}
  .atl-draftwarn p{color:#6E2419;}
  .atl-rate{background:${P_FIELD};border-color:${P_BORDER};}
  .atl-rate-val{color:${P_DIM};}
  .atl-rate-val.on{color:#8A5F1E;}
  .atl-steps-lock{color:${P_DIM};}
  .atl-expand{color:#8A5F1E;}
  .atl-expand:hover{color:${P_INK};}

  /* ── sledovanie značiek (krok 2) ────────────────────────────────────────────────────── */
  /* ⚠️ VÝPLŇ A RÁM TROCH STAVOV SEM NEPATRIA — sú v STEP_CSS a sú na oboch povrchoch tie
     isté. Tu sa mení LEN inkoust (viď nižšie): tento blok sa vkladá do DOM POSLEDNÝ, takže
     čokoľvek, čo tu zdvojíš, ticho prebije opravu urobenú tam. */
  .atl-ntrack-i{background:${P_SOFT};border-color:${P_BORDER};color:${P_DIM};}
  .atl-ntrack-i b{background:rgba(201,154,63,0.18);color:${P_DEEP};}
  /* ⚠️ INKOUST TINTU SA NA PAPYRUSE OBRACIA. Tri stavy nesú v STEP_CSS priesvitnú výplň so
     SVETLÝM písmom (tmavý mobil); na piesku by svetlé písmo zaniklo, tak sa mení na tmavý
     odtieň tej istej farby. Výplň ani rám sa netýka — tie sú na oboch povrchoch tie isté,
     a to je celý zmysel tintu. */
  .atl-ntrack-i.on{color:${PICK_INK.lapis};}
  .atl-ntrack-i.on b{background:rgba(22,48,122,0.16);color:${PICK_INK.lapis};}
  .atl-ntrack-i.ok{color:${PICK_INK.green};}
  .atl-ntrack-i.ok b{background:rgba(61,122,78,0.16);color:${PICK_INK.green};}
  .atl-ntrack-i.ok .atl-ntrack-pts{background:rgba(61,122,78,0.22);color:${PICK_INK.green};}
  .atl-ntrack-i.miss{color:${PICK_INK.red};}
  .atl-ntrack-i.miss b{background:rgba(206,75,60,0.16);color:${PICK_INK.red};}
  .atl-ntrack-i.miss .atl-ntrack-pts{background:rgba(206,75,60,0.22);color:${PICK_INK.red};}

  /* ── potvrdenie odchodu z toku ──────────────────────────────────────────────────────── */
  /* Rozlúčka s AINUBISOM (.atl-abort--ainubis) sa ZÁMERNE nemení: je to jeho vlastný modrý
     povrch, rovnaký ako v konzole, a pale skin mapy naň nesiaha. */
  .atl-abort-scrim{background:rgba(24,14,4,0.55);}
  .atl-abort:not(.atl-abort--ainubis){background:linear-gradient(135deg,#FBF5E6 0%,#F2E2BD 100%);border:1.5px solid ${P_EDGE};box-shadow:0 8px 28px rgba(0,0,0,0.45),0 0 0 3px rgba(201,154,63,0.15);}
  .atl-abort:not(.atl-abort--ainubis) h2{color:${P_INK};}
  .atl-abort:not(.atl-abort--ainubis) p{color:${P_DIM};}
  .atl-abort:not(.atl-abort--ainubis) .atl-abort-quit{background:rgba(176,52,40,0.14);border-color:rgba(176,52,40,0.65);color:#8E2A20;}
  .atl-abort:not(.atl-abort--ainubis) .atl-abort-quit:hover{background:rgba(176,52,40,0.26);color:#5E170F;}

  /* ── HLAVNÉ CTA JE LAPIS, NIE ZLATÉ (Matej 2026-08-26: „CTA oprav máme predsa modrú") ───
     ZAPÍSAŤ VÝLET, POKRAČOVAŤ aj HOTOVO v editore príbehu — všetky tri nesú .btn-gold.
     Na papyruse bola zlatá naraz rámom, doskou aj tlačidlom, takže hlavná akcia bola
     najsvetlejší prvok panela a splývala s tým, čo ju drží; to je dôvod, prečo LAPIS
     v redizajne /map vznikol (navGoldSkin.ts: „hlavné CTA"). Zlato ostáva na písme.
     ⚠️ NIE JE TO PORUŠENIE .btn-gold LOCKU — tvar (radius 8, šírka, Cinzel, papyrusový
     rám) sa nemení, mení sa výplň, a to len na bledom PC chrome mapy. Tmavý mobil aj zvyšok
     appky ostávajú zlaté; MAP_SKIN = 'glass' vráti zlatú aj sem. */
  .atl-log-foot .btn-gold,
  .atl-editor .btn-gold{background:${LAPIS.grad};border-color:${LAPIS.deep};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};}
  .atl-log-foot .btn-gold:hover:not(:disabled),
  .atl-editor .btn-gold:hover:not(:disabled){background:${LAPIS.gradHover};box-shadow:${LAPIS_BTN_SHADOW};}

  /* ── lišta posúvania ────────────────────────────────────────────────────────────────── */
  .atl-log-body::-webkit-scrollbar,.atl-tiles::-webkit-scrollbar{width:8px;}
  .atl-log-body::-webkit-scrollbar-thumb,.atl-tiles::-webkit-scrollbar-thumb{background:rgba(179,130,45,0.42);border-radius:999px;}
  .atl-log-body::-webkit-scrollbar-track,.atl-tiles::-webkit-scrollbar-track{background:transparent;}
`;
