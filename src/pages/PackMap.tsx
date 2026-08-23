// /pack/map — TRIPS surface (Portal). Full-bleed Mapy.cz map + the 28
// real done trips from the photo nahadzovač (HERO_TRAILS). Detail = inline panel
// state (bod 5, iterácia 12); the full-page article lives at the SAME URL
// (/pack/map/:slug) but is now a SEPARATE route component
// (PackTripArticle.tsx, see App.tsx) — this file only ever mounts at the
// slug-less route from iterácia 12 onward.
//
// Ported from the DEV prototype `__TrailsPreview.tsx` — REAL core only (map,
// trip list, filters, detail modal). MOCK launcher/finder, Rebríčky/Eventy,
// Add-trip draw flow and the OSM/Overpass POI layer were left behind (see
// plany/zadanie-pack-portal-trips.md §Čo je REÁLNE vs MOCK).
//
// Iterácia 5 (2026-07-22): top header ZRUŠENÝ. Ľavý blok = FLOATING dark
// panel (margined off top/left/bottom, rounded, gold-pale border) nad
// full-bleed mapou — status riadok (avatar + km/trips/wishlist staty z
// lokálneho walked/fav stavu, BEZ loga) → greeting "Hi X, what are you
// exploring?" → category pills (Trips active, rest dashed/muted, hover
// tooltip) → country select (SVK default) → inline 2-row filters (dropdowny,
// FILTERS popover ZRUŠENÝ) → trip cards (peek scroll). Place-search sa
// presunul z headera na mapu (kompaktný floating box). Bottom nav späť do
// stredu, jeho spodná hrana zarovnaná s panelom (obe bottom:20px). Mobile:
// bottom sheet nezmenené (peek/expand cez handle).
//
// Iterácia 11 (2026-07-22, AllTrails ladenie) — 6 zmien: (1) karty 4:3 foto +
// autor; (2) kruhový ✓ walked-map-filter toggle + ADD TRIP CTA v status
// riadku; (3) top filter riadok zjednotený na borderless, totožné políčka
// (.trp-topfilters wrapper zrušený); (4) klik na kartu/pin → .trp-sidebar má
// teraz 3 mutually-exclusive stavy (LIST/DETAIL/ADD) namiesto priamej
// navigácie — inline DETAIL centrovaný s offsetom (FitBounds paddingTopLeft);
// (5) mobile prerobené na map-first + LIST/MAP toggle + full-width
// liquid-glass header; (6) ADD TRIP flow recyklovaný z AddTrailFlow.tsx
// (haversine, click-to-draw, undo/clear) — pridáva do LOKÁLNEHO session
// state (useState), NIE do Supabase (DB zápis mimo rozsahu, flag nižšie).
//
// Iterácia 12 (2026-07-22, AllTrails ladenie #2) — 7 zmien: (1) FitBounds
// offset padding na VŠETKY strany + maxZoom, nech trasa nelezie za
// header/nav; (2) mapový štýl stack → JEDNO kruhové terrain↔satellite
// tlačidlo, Winter preč; (3) trasy/markery ČIERNE bez čísel (marker = pill s
// DiffMark + km), hover/selected gold; (4) inline detail prestavaný — foto
// galéria, ♡ na titulke, rating packy (paw.svg×5), tagy vpravo, Comments +
// „Walked by N" placeholder sekcie; (5) ⤢ expand teraz navigate na SAMOSTATNÚ
// route/stránku (PackTripArticle.tsx), starý `.trp-detoverlay` modal aj
// slug-deep-link kód v TOMTO súbore ZRUŠENÉ (App.tsx routuje `:slug` inam);
// (6) `<DiffMark>` (CSS tvar namiesto emoji) zdieľaný cez
// components/pack/tripShared.tsx; (7) mobile header kompaktnejší, filter
// ikonka = sliders (nie graph).
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Polygon, Marker, ScaleControl, useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapyTiles, MAPY_API_KEY, MAPY_BASE } from '@/lib/env';
import { track } from '@/lib/analytics';
import { HERO_TRAILS, type HeroTrail } from '@/data/heroTrails.generated';
import { metersPerPixel } from '@/components/geo/geoMath';
import { FogLayer } from '@/components/geo/FogLayer';
import { useFogSource } from '@/components/geo/useFogSource';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { SVK_BORDER } from '@/data/svkBorder';
import { COUNTRY_BORDERS } from '@/data/countryBorders';
import { trailCountry, flagUrl, flagEmoji } from '@/lib/countryGeo';
import { PackBottomNav, HieroglyphBg, MessagingOverlayHost } from '@/components/pack/PackLayout';
import { PackNotifications } from '@/components/pack/PackNotifications';
import { TripComments } from '@/components/pack/trip/TripComments';
import { TripCreatorPopup } from '@/components/pack/trip/TripCreatorPopup';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { usePackStoreEpoch } from '@/hooks/usePackStoreEpoch';
import { levelProgress } from '@/lib/tripPoints';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { ViperAreasLayer } from '@/components/geo/ViperAreasLayer';
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import {
  ICON, authorOf, REGION_OF, diffMarkShape, DIFF_MARK_CSS, WATER_COLOR, ElevationProfile,
  TRAIL_LINE_CSS, TRAIL_SABER_LAYERS, SABER_REST_OPACITY, trailSaberScale, isWaterTrail, tripShareText, pluralKey,
  readLocalTrails, writeLocalTrails, readFavIds, writeFavIds, readWalkedIds, writeWalkedIds,
  ensureWalkedSeeded, FOUNDER_WALKED_JOURNEY_IDS,
  tripPath, tripPathById, tripText } from '@/components/pack/tripShared';
import {
  crowdAggregate, FOUNDER_WALKERS, seedCrowd, HAZARDS, HAZARD_EMOJI,
  readVotes, writeVotes, readPlans, writePlans, readEvents, writeEvents,
  profileLevelFor, addedByMeIds, isFounderEmail,
  approvedAddedIds, ratedCountFor, walkPointsFor, walkRewardBase,
  RATE_PROMPT_POINTS, discoveryBonusFor, bonusToastText, walkedCountries,
  type TripVote, type TripPlan, type PartnerEvent, type Hazard,
} from '@/components/pack/packCommunity';
import { packStorage } from '@/lib/packStore';
import {
  COMMUNITY_CSS, BigRating, PhotoMetaPills, HazardTags, WalkedPopup,
  EventsView,
  type WalkedInput, type WalkReward,
} from '@/components/pack/packCommunityUI';
import { PointsPill, POINTS_PILL_CSS } from '@/components/pack/PointsPill';
import { deletePackTrip } from '@/lib/packStore';
import { upsertMyTrip, removeMyTrip } from '@/components/pack/triplist/triplist'; // TRIPLIST (Slice A) — star popup upserts alongside the existing wishlist plan
// #41 — kto tento výlet vypísal. `useOpenTrips` dá cudzie inzeráty (user_trips),
// `useTripParties` k nim mená (get_trip_party), karta ich vykreslí.
import { useOpenTrips } from '@/components/pack/triplist/useOpenTrips';
import { useTripParties, partyKey, type PartyMember } from '@/components/pack/triplist/useTripParty';
import { PartyMemberCard, PARTY_CARD_CSS } from '@/components/pack/triplist/PartyMemberCard';
// #41 — klik na ikonku tvorcu/účastníka výletu otvorí TÚTO kartu (nestavia sa druhá).
import { TripProfileCard, partyMemberToProfileCardProps } from '@/components/pack/profile/TripProfileCard';
// ADD TRIP flow (krok 9, plany/zadanie-addtrip-flow-2026-07-27.md §15 bod 8) — vytiahnuté z
// tohto súboru do vlastného adresára (§2 zadania). Portal len zapája vstupný popup + oba
// formuláre a konvertuje AddTripDraft → HeroTrail zápis (§3 tam), formuláre samotné sa needitujú.
import { AddTripEntry, type AddChoice } from '@/components/pack/addtrip/AddTripEntry';
// ZÁPISY DO MAPY (2026-08-20) — parkovisko/výstraha/poznámka od členov + datasetové
// body (`customPoi`), ktoré appka doteraz nikde nekreslila.
// Zadanie: plany/zadanie-zapisy-do-mapy-2026-08-20.md
import { MapNotesLayer, MAP_NOTES_CSS } from '@/components/pack/mapnotes/MapNotesLayer';
import { AddMapNotePin, NoteSpotPin, AddMapNotePanel, MapNotePlacing, NoteQuickPalette, MapNoteHint, MapNoteTooFar, ADD_NOTE_CSS, NOTE_PANEL_H, hintSeen, markHintSeen } from '@/components/pack/mapnotes/AddMapNote';
import { NOTE_PALETTE_CSS } from '@/components/pack/mapnotes/NotePalette';
import { DeleteButton, DELETE_BUTTON_CSS } from '@/components/pack/DeleteButton';
// Kruhová značka — TÁ ISTÁ geometria ako hrozba/tip vo vrstve zápisov (hlavička circleMark.ts).
import { circleMarkHtml, CIRCLE_MARK_CSS } from '@/components/pack/mapnotes/circleMark';
import { EVENT_RIM, TRIP_TARGET_EMOJI, eventEmoji } from '@/components/pack/mapnotes/markEmoji';
import { useMapNotes } from '@/components/pack/mapnotes/useMapNotes';
import { useLongPressPoint, useMapClickPoint, MIN_ZOOM_FOR_NOTE, LONG_PRESS_CSS } from '@/components/pack/mapnotes/useLongPressPoint';
import { MapNoteCursor, MAP_NOTE_CURSOR_CSS } from '@/components/pack/mapnotes/MapNoteCursor';
import { nearestTrailId } from '@/components/pack/mapnotes/mapNotesGeo';
import { GROUP_KINDS, defaultRadius, type NoteGroup, type NoteKind, type TickDisease } from '@/components/pack/mapnotes/mapNotesData';
import { AddTripLog } from '@/components/pack/addtrip/AddTripLog';
import { TRIP_HOLD_MIN_ZOOM } from '@/components/pack/addtrip/GeometryPicker';
import type { AddTripDraft, TripState } from '@/components/pack/addtrip/addTripModel';
import { clearTripNotes, readTripNotes, writeTripNotes } from '@/components/pack/addtrip/addTripModel';
import { devSyncLocalTrips } from '@/lib/devTripSync';
// EVENT formulár (krok 3, plany/zadanie-eventy-2026-08-06.md §4) — vedľa ADD TRIP, vlastný
// adresár. Storage je zatiaľ len localStorage (migrácia z kroku 2 nie je nasadená, §9 zadania).
import { AddEvent } from '@/components/pack/events/AddEvent';
import {
  readLocalEvents, writeLocalEvents, upcomingEvents, archivedEvents,
  type AddEventDraft, type EventKind,
} from '@/components/pack/events/eventModel';
// zoznam eventov v ľavom paneli + piny na mape (krok 5, plany/zadanie-eventy-2026-08-06.md §9
// krok 5) — dovtedy sa event po uložení nikde nezobrazoval (formulár aj store boli hotové,
// panel ostal viazaný len na TRIP vetvu).
import { EventsPanel } from '@/components/pack/events/EventsPanel';

const GOLD = '#C99A3F';
const INK = '#1F1A0E';
const T = PACK_THEME;

// Typografický poriadok (FONT_TITLE = identita, FONT_UI = dáta/eyebrow/chipy) žije
// v packTheme.ts vedľa farebných tokenov — pravidlá a dôvody sú tam.
// Papyrus lock (2026-07-26): žiadny hardcoded bledý hex — plná bledá farba ide cez token.
const CARD = PACK_THEME.card;
const PANEL_W = 440; // .trp-sidebar width — used to offset the inline-detail fitBounds
// Matej 2026-07-27 („pozri ako sa pri zúžení obrazovky správa mapa"): desktop layout
// (floating panel 440px + topbar NA mape) potrebuje reálne ~1024px+. Pod tým ostával
// topbaru pás cca 100–340px, takže sa status riadok aj filtre lámali do stĺpca a liezli
// na mapu. Mobilný map-first layout preto beží až po 1023px (tablet naportrét ho dostane
// tiež) a medzi 1024–1400px je kompaktný desktop (užší panel, skrátené labely).
// MUSÍ sedieť s `@media (max-width:1023px)` v CSS nižšie.
const MOBILE_BP = 1023;
// (bod 4) so the selected trail centers in the map area actually visible next to the panel.

// journeys (multi-day) + hikes zdieľajú ten istý zoznam/mapu — journey je len HeroTrail
// s navyše `journey` blokom, takže sa spracúva rovnako (path, region, acts, filter).
const ALL_TRIPS_STATIC: HeroTrail[] = [...HERO_JOURNEYS, ...HERO_TRAILS];
// Founder walked default (Matej 2026-07-24): všetky nahodené (čierne, non-journey) trasy sú prejdené
// + z červených journeys len SNP a Poloniny. Zoznam sa raz seedne do walked setu (ensureWalkedSeeded).
const DEFAULT_WALKED_IDS: string[] = [
  ...HERO_TRAILS.map((t) => t.id),
  ...FOUNDER_WALKED_JOURNEY_IDS.filter((id) => ALL_TRIPS_STATIC.some((t) => t.id === id)),
];
const ALL_BOUNDS: LatLngTuple[] = ALL_TRIPS_STATIC.flatMap((t) => t.path);
const CENTER: LatLngTuple = ALL_BOUNDS[Math.floor(ALL_BOUNDS.length / 2)] ?? [48.7, 19.5];
// TRIPSTATS Slice A (bod 3, Matej 2026-07-23) — add-trip z pohoria: stred pohoria = stred path
// prvého tripu v ňom čo má nakreslenú trasu (guard proti path=[] tripom, viď bod 6 vyššie).
// Fallback = stred SR, keď región nemá žiadny trip s trasou (nemalo by nastať, ale ?add= je
// URL vstup — nedôverovať mu naslepo).
function regionCenter(region: string): LatLngTuple {
  const trail = ALL_TRIPS_STATIC.find((tr) => tr.region === region && tr.path.length > 0);
  if (trail) return trail.path[Math.floor(trail.path.length / 2)];
  return [48.7, 19.5];
}

// ── Jednorazová migrácia: zmaže 3 fiktívne seed eventy (Matej 2026-08-03: „začíname so
// všetkým do nuly"). `mockEventsSeed()` (packCommunity.ts, commit 45dc14b) generovala presne
// tri eventy s pevným id `seed-event-0`/`seed-event-1`/`seed-event-2` a vymyslenými hostmi
// („Zuzka & Bady" / „Martin & Cézar" / „Lucia & Lola") — tie sa pri prvom otvorení appky
// natrvalo zapísali do localStorage `trp-events-v2` (writeEvents efekt nižšie v komponente).
// Odstránenie seedu z packCommunity.ts uložený stav samo nevyčistí.
// Rozlíšenie od reálnych eventov je spoľahlivé: partner-ad aj plan-open flow (nižšie v tomto
// súbore) generujú id `ad-${nowMs}-${tripId}` resp. `plan-event-${now}` — nikdy `seed-event-N`.
// Filter teda maže PRESNE tie tri id, nič iné sa nezmestí do zoznamu → žiadny reálny event sa
// nezmaže. Guard flag (rovnaký vzor ako `migrateRenamedTripIds` v tripShared.tsx) zaisťuje, že
// beží raz — ak by si niekto v budúcnosti eventy s takým id vytvoril ručne (nemal by), migrácia
// ich už znova nespustí.
const SEED_EVENT_IDS = new Set(['seed-event-0', 'seed-event-1', 'seed-event-2']);
const EVENTS_SEED_MIGRATED_KEY = 'trp-events-seed-migrated-v1';
function migrateSeedEvents(): void {
  try {
    if (packStorage.getItem(EVENTS_SEED_MIGRATED_KEY)) return;
    const stored = readEvents();
    const cleaned = stored.filter((ev) => !SEED_EVENT_IDS.has(ev.id));
    if (cleaned.length !== stored.length) writeEvents(cleaned);
    packStorage.setItem(EVENTS_SEED_MIGRATED_KEY, '1');
  } catch { /* private mode / quota — non-fatal, appka beží aj bez migrácie */ }
}
// Beží pri načítaní modulu, teda PRED prvým `readEvents()` v useState inicializátore nižšie —
// inak by prvý render ešte videl staré fiktívne eventy.
migrateSeedEvents();

// bod 6 (iterácia 16): dva malé kruhové avatary (majiteľ + pes) pri "by {author}" riadku, karta
// aj inline detail. Seed dáta nemajú per-trip owner/dog foto — pes používa reálny Hekthor asset
// (public/images/about-hekthor.png, tá istá fotka čo /about stránka), majiteľ je initial-letter
// placeholder kruh (rovnaký vzor ako .trp-status-avatar fallback). FLAG: toto je vizuálny slot,
// reálne per-trip owner/dog fotky sú mimo rozsahu — potrebujú dátové polia, ktoré HeroTrail
// typ nemá (viď report).
const AUTHOR_DOG_AVATAR = '/images/about-hekthor.png';
function AuthorAvatars({ author, size }: { author: string; size: number }) {
  const t = useT();
  const pairStyle = { '--trp-av-size': `${size}px` } as React.CSSProperties;
  return (
    <span className="trp-avatarpair" style={pairStyle}>
      <span className="trp-avatarcircle" style={{ backgroundImage: `url('${AUTHOR_DOG_AVATAR}')` }} title={t('pack.map.authorDogPlaceholder')} />
      <span className="trp-avatarcircle trp-avatarcircle--placeholder" title={t('pack.map.authorOwnerPlaceholder')}>
        {author.charAt(0).toUpperCase()}
      </span>
    </span>
  );
}

// bez náročnosti (vodná plocha, viď isWaterTrail) → radí sa na koniec bez ohľadu na smer
// (Easiest aj Hardest), nie na 'Hard' pozíciu ako predtým fabrikovaný fallback 'Moderate' robil.
const diffRank = (d?: string) => (d === 'Easy' ? 0 : d === 'Moderate' ? 1 : d === 'Hard' ? 2 : d === 'Odyssey' ? 3 : 4);
// Ruch (crowd) → poradie pre zoradenie „od najkľudnejšieho" (Matej 2026-08-22). Hodnota bez
// ruchu ide NASPODOK (4), nie na začiatok — neznáme nie je to isté ako ľudoprázdne.
const crowdRank = (c?: string | null) => (c === 'Empty' ? 0 : c === 'Calm' ? 1 : c === 'Busy' ? 2 : 4);

// Haversine — rovnaký algoritmus ako AddTrailFlow.tsx (recyklované, nie importované:
// Portal ADD flow stavia lokálny-session HeroTrail, nie `trails` DB riadok, tak si
// nesie vlastnú kópiu namiesto zdieľania so submit-to-Supabase komponentom).
function haversineM(a: LatLngTuple, b: LatLngTuple): number {
  const R = 6371000;
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
function totalDistanceM(points: LatLngTuple[]): number {
  let sum = 0;
  for (let i = 1; i < points.length; i++) sum += haversineM(points[i - 1], points[i]);
  return Math.round(sum);
}

// geo kaskáda (Matejov feedback bod 4, iterácia 7): Country(SVK) → Región(West/Center/East) →
// Pohorie (tr.region, napr. "Malé Karpaty"). REGION_OF (import z tripShared, iterácia 12 bod 6 —
// zdieľané s PackTripArticle) mapuje pohorie na macro-región — zatiaľ len Malé/Biele Karpaty =
// West (jediné pohoria v dátach), Center/East čakajú na budúce tripy.
const MACRO_REGIONS: Array<'West' | 'Center' | 'East'> = ['West', 'Center', 'East'];

// crowd (navštevovanosť) je reálne pole z nahadzovača — SK hodnoty na disku, EN label na UI.
// Iterácia 6: "na prvý pohľad" labely (Matej) — Ľudoprázdne=Remote (najmenej preplnené) →
// Pokojné=Calm → Rušné=Popular (najviac preplnené).
// D2 (LOCKED 2026-07-24): Vibe → Crowd/Ruch, hodnoty Empty · Calm · Busy. Kľúč = SK dáta
// z nahadzovača (`trail.crowd`), takže žiadna migrácia; poradie = od najkľudnejšieho.
const CROWD_LABELS: Record<string, string> = { 'Ľudoprázdne': '🏔️ Empty', 'Pokojné': '🌿 Calm', 'Rušné': '👣 Busy' };

// Aktivita taxonómia — lokálna kópia z __TrailsPreview.tsx (id/label/emoji), Portal je
// izolovaný od toho dev-only prototypu. Iterácia 7 (Matejov feedback bod 2): tag vocabulary
// je teraz JEDEN univerzálny rad, nezávislý od vybranej aktivity — TRIP_ACTIVITIES preto už
// nenesie vlastné tagy (predtým per-activity scoping, zrušené).
const TRIP_ACTIVITIES: { id: string; label: string }[] = [
  { id: 'hiking', label: 'Hiking' },
  { id: 'journey', label: 'Journey' },
  { id: 'picnic', label: 'Picnic' },
  { id: 'overnight', label: 'Overnight' },
  { id: 'skating', label: 'Skate' },
  { id: 'paddleboard', label: 'SUP/swim' },
  { id: 'explore', label: 'Explore' },
];
// 'journey' = viacdňová turistika (multi-day thru-hike), napr. Cesta hrdinov SNP.
// 'explore' 🧭 = siedmy pill (Matej 2026-07-27/29, addTripModel.ts ACTIVITY_GEOMETRY komentár) —
// point/area miesta bez trasy (hrady, kaštiele, parky).
const ACT_EMOJI: Record<string, string> = { hiking: '🥾', journey: '🎒', picnic: '🧺', overnight: '⛺', skating: '🛼', paddleboard: '🏄', explore: '🧭' };
// dátové pole tr.acts[] používa 'hike' (nie 'hiking') — mapovanie UI aktivita-id → dáta.
const ACT_DATA_ID: Record<string, string> = { hiking: 'hike', journey: 'journey', picnic: 'picnic', overnight: 'overnight', skating: 'skating', paddleboard: 'paddleboard', explore: 'explore' };

// Tag vocabulary UPRATANÝ na presne 8 univerzálnych tagov (Matejov feedback bod 2, iterácia 7).
// TAG_VOCAB = poradie zobrazenia v UI. DATA_TAG_TO_UI mapuje reálne tr.tags[] hodnoty na tento
// vocabulary (stream/river → River, lake/reservoir → Lake/Reservoir, ostatné 1:1); hodnoty bez
// mapovania (napr. "Embankment", "In the middle of nature") sa nezobrazujú ako chip a nefiltrujú
// — nefabrikuje sa nový dátový tag, len sa neponúka chip preň.
// F1 (Matej 2026-07-24): „Doplniť povrchy (surfaces) do tagov — chýbajú." Doteraz bol z troch
// povrchov v chipoch len Asphalt, takže trip označený v nahadzovači ako Forest path / Rocky sa
// podľa povrchu nedal vyfiltrovať. Poradie: najprv scenéria, potom POVRCH (posledné tri).
// Pozn.: `Forest` (scenéria z tr.tags) ≠ `Forest path` (povrch z tr.surface) — sú to dve polia.
// PROSTREDIE (Matej 2026-07-25): „je to pre paddleboard aby ľudia vedeli že budú na vode
// v prírode alebo niekde na priehrade bez lesov okolo… ak človek filtruje sup/swim a potom sa
// zobrazí že či je to lesná voda alebo nejaké vodné dielo na rovine". S Crowd to nesúvisí —
// Crowd = koľko ľudí, prostredie = v čom to je. Tieto tri hodnoty v dátach nesie presne 9
// tripov a všetky sú paddleboard; boli to ich JEDINÉ tagy, takže bez chipu boli neviditeľné
// aj nefiltrovateľné (a vodné plochy kvôli prázdnemu tagSetu obchádzali tag filter).
// 🔴 Labely = doslova hodnoty z dát, nič som nepremenoval — kratšie názvy sú na Matejovi.
// Matej 2026-07-26: „In the middle of nature" AJ „In the middle of nowhere" preč — obe boli
// PROSTREDIE catch-all chipy (2026-07-25), zbytočné vedľa Forest/Lake/River scenérie.
// Matej 2026-07-27: 'Embankment' preč.
const TAG_VOCAB = [
  'Mountains', 'Forest', 'Lake/Reservoir', 'River', 'View', 'Meadow', 'Sunset',
  'Forest path', 'Asphalt', 'Rocky',
] as const;
const TAG_EMOJI: Record<string, string> = {
  Mountains: '🏔️', Forest: '🌲', 'Lake/Reservoir': '🏞️', River: '💧', View: '🌄', Meadow: '🌼', Sunset: '🌅',
  'Forest path': '🥾', Asphalt: '🛣️', Rocky: '🪨',
};
// ⚠️ HODNOTA ≠ TEXT NA OBRAZOVKE (2026-08-23). `TAG_VOCAB` sú dátové hodnoty z `tr.tags`
// a `tr.surface` — filtruje sa podľa nich, takže sa NEPREKLADAJÚ. Chip však človek číta,
// a v slovenskom paneli FILTRE stálo „Mountains / Forest / Lake/Reservoir". Slovník je
// spoločný s formulárom výletu (`pack.map.tagLabel.*`, `surfaceLabel.*`), aby tá istá vec
// nemala na dvoch obrazovkách dva názvy. Chýbajúci kľúč padá na pôvodnú hodnotu.
const TAG_I18N: Record<string, string> = {
  Mountains: 'pack.map.tagLabel.mountains', Forest: 'pack.map.tagLabel.forest',
  'Lake/Reservoir': 'pack.map.tagLabel.lake', River: 'pack.map.tagLabel.river',
  View: 'pack.map.tagLabel.view', Meadow: 'pack.map.tagLabel.meadow', Sunset: 'pack.map.tagLabel.sunset',
  'Forest path': 'pack.map.surfaceLabel.forest', Asphalt: 'pack.map.surfaceLabel.asphalt',
  Rocky: 'pack.map.surfaceLabel.rocky',
};

// Per-aktivita placeholder fotky (Cloudinary pack/placeholders, webp). Kľúč = ACT_DATA_ID
// (hike/journey/picnic/overnight/skating/paddleboard). Použité pre tripy bez vlastnej fotky
// + planning preview — placeholder lesa na paddleboarde by bol divný, preto per-aktivita.
const CLD = 'https://res.cloudinary.com/dz8lolmod/image/upload/f_auto,q_auto,c_fill,w_800,h_450/pack/placeholders';
const ACTIVITY_PLACEHOLDERS: Record<string, string[]> = {
  hike: [`${CLD}/hiking-1.webp`, `${CLD}/hiking-2.webp`, `${CLD}/hiking-3.webp`],
  journey: [`${CLD}/journey-1.webp`, `${CLD}/journey-2.webp`, `${CLD}/journey-3.webp`],
  picnic: [`${CLD}/picnic-1.webp`, `${CLD}/picnic-2.webp`, `${CLD}/picnic-3.webp`],
  overnight: [`${CLD}/overnight-1.webp`, `${CLD}/overnight-2.webp`, `${CLD}/overnight-3.webp`],
  skating: [`${CLD}/skating-1.webp`, `${CLD}/skating-2.webp`, `${CLD}/skating-3.webp`],
  paddleboard: [`${CLD}/paddleboard-1.webp`, `${CLD}/paddleboard-2.webp`, `${CLD}/paddleboard-3.webp`],
  // ✅ 2026-08-03 (#39): vlastné explore fotky nahraté do Cloudinary `pack/placeholders`,
  // požičané `picnic-*` zrušené. Motívy: 1 hrad-zrúcanina · 2 historické námestie ·
  // 3 kaštieľ s parkom — presne tri povrchy, kvôli ktorým explore kategória vznikla.
  // Štýl držaný na existujúcich placeholderoch (fotoreal 35 mm, zlatá hodina, bez ľudí
  // a bez psov, 1600×893) — pri dopĺňaní ďalších sa naň pozri, nehádaj ho.
  explore: [`${CLD}/explore-1.webp`, `${CLD}/explore-2.webp`, `${CLD}/explore-3.webp`],
};
// vyber 1 z 3 stabilne podľa seedu (id tripu / názov) → variety naprieč kartami, ale nemení sa pri re-renderi
function placeholderFor(actIds: string[] | undefined, seed: string): string {
  const act = (actIds && actIds.find((a) => ACTIVITY_PLACEHOLDERS[a])) || 'hike';
  const arr = ACTIVITY_PLACEHOLDERS[act] || ACTIVITY_PLACEHOLDERS.hike;
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

// ── DVE KVAPKY ZANIKLI, OSTAL JEDEN KRUH (Matej 2026-08-22) ────────────────────────────────
// Do 22. 8. tu stáli vedľa seba RUŽOVÁ kvapka (cieľ plánovaného výletu, 24. 7.) a ZLATÁ kvapka
// (podujatie, 6. 8.) — dva tvary pre to isté „tu sa niekto s niekým stretne", a od zrušenia
// legendy (3. 8.) bez čohokoľvek, z čoho by sa dal rozdiel odvodiť.
//
// Teraz obe hovoria rečou zvyšku mapy: biely kruh + MODRÝ lem = skupina „stretnutie",
// emoji vnútri = podtyp. Presne to isté delenie ako pri hrozbách (červený lem) a tipoch
// (zelený). Geometria kruhu má JEDEN zdroj — `circleMark.ts`, nie kópiu v tomto súbore.
//
// ⚠️ `iconSize`/`iconAnchor` sa zámerne NEUVÁDZAJÚ: kruh je súmerný a centruje sa CSS
// transformom, takže jeho stred sedí na súradnici bez dopočtu posunu. Kvapka to potrebovala
// (hrot je dole), kruh nie — a pridaný anchor by značku posunul o polovicu jej výšky.

/** Cieľ PLÁNOVANÉHO výletu — 🎯 (Matej: „terč = event cieľ výletu"). */
const TARGET_PIN = L.divIcon({
  className: 'mk-wrap',
  html: circleMarkHtml(TRIP_TARGET_EMOJI, EVENT_RIM),
});
/** PODUJATIE — emoji podľa typu (`EVENT_EMOJI` v markEmoji.ts).
 *  `hot` = zodpovedajúca karta v paneli je vybraná (pin ↔ karta sync). */
const EVENT_PIN = (kind: EventKind, hot: boolean) => L.divIcon({
  className: 'mk-wrap',
  html: circleMarkHtml(eventEmoji(kind), EVENT_RIM, hot ? ' mk-circle--hot' : ''),
});
const DATA_TAG_TO_UI: Record<string, string> = {
  Mountains: 'Mountains', Forest: 'Forest', View: 'View', Meadow: 'Meadow', Sunset: 'Sunset',
  Lake: 'Lake/Reservoir', Reservoir: 'Lake/Reservoir',
  Stream: 'River', River: 'River',
  // prostredie vodných tripov — 1:1, hodnoty z nahadzovača sa nepremenúvajú
  // ('In the middle of nature'/'In the middle of nowhere' zámerne bez mapovania —
  // Matej 2026-07-26 oba chipy zrušil; 'Embankment' zrušil 2026-07-27)
};
// tr.surface[] → chip. Všetky tri hodnoty z SURFACE_VOCAB (nahadzovač) majú teraz svoj chip,
// aby sa dalo filtrovať podľa toho, čo sa dá zadať (F1 2026-07-24). `forest` už NEsplýva so
// scenérickým tagom `Forest` — sú to dve rôzne veci (les okolo vs. lesná cesta pod nohami).
const SURFACE_TAG_MAP: Record<string, string> = { forest: 'Forest path', asphalt: 'Asphalt', rocky: 'Rocky' };

type PlaceSug = { name: string; sub: string; lat: number; lon: number };

// prvé meno z user_metadata (full_name/name), fallback e-mail local-part — rovnaký
// vzor ako firstNameFrom() v Pack.tsx, len lokálna kópia (usePackIdentity meno neexponuje).
function firstNameFrom(email: string, fullName?: string): string {
  if (fullName && fullName.trim()) return fullName.trim().split(' ')[0];
  if (!email) return 'Dogyptian';
  const local = email.split('@')[0] || '';
  const base = local.split('+')[0].replace(/[._-]/g, ' ').replace(/\d+/g, '').trim();
  if (!base) return 'Dogyptian';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

// ── zoomovo-vrstvené markery + pixelové zhlukovanie (2026-07-27, port z odladeného prototypu
// scratchpad/pins-proto.html — Matej: "z diaľky len piktogramy, postupne pilulky s km, zapratané
// rieš zhlukmi"). Nahrádza pôvodné oddelené pillIcon/waterIcon + dva samostatné <Marker> loopy
// jedným systémom (viď <TripMarkers> nižšie pri mape), lebo zhlukovanie musí vidieť VŠETKY typy
// bodov naraz (trip aj vodná plocha môžu spadnúť do tej istej pixelovej bunky). ──
type MapPoint = { id: string; tr: HeroTrail; lat: number; lon: number; water: boolean; journey: boolean };

// tri vrstvy podľa zoomu (zadanie 2.3): z<=9 len bodka · z10–11 bodka (diaľkové už pilulka) ·
// z>=12 všetko pilulka.
const mapTier = (z: number): 0 | 1 | 2 => (z <= 9 ? 0 : z <= 11 ? 1 : 2);
// Matej 2026-07-27: diaľkové (journey) nesú km len v STREDNOM pásme priblíženia (z8–z11) —
// „ako jediné z diaľky aj kilometre, nech človek vie že je to dlhé". Na oboch koncoch sa sťahujú
// na holý piktogram:
//   · z ≤ 7 (celá Európa) — na Slovensko pripadá pár cm a 10 pilulek sa nakopilo na seba
//   · z ≥ 12 (zblízka) — trasa je aj tak nakreslená, „770 km" by len zavadzalo
// Bežné body a voda idú opačne: pilulka až pri najväčšom priblížení.
const JOURNEY_KM_ZOOM = { min: 8, max: 11 };
const pointIsPill = (p: MapPoint, zoom: number) =>
  p.journey ? zoom >= JOURNEY_KM_ZOOM.min && zoom <= JOURNEY_KM_ZOOM.max : mapTier(zoom) === 2;

// vlnky vodnej plochy — rovnaká krivka ako pôvodný waterIcon() (Matej 2026-07-24: počet = veľkosť
// plochy z OSM), teraz zdieľaná bodkou aj pilulkou namiesto vlastnej .trp-waterdot veľkosti.
const waterWaves = (waves?: number): string => {
  const n = Math.min(3, Math.max(1, waves || 1));
  const wave = (y: number) => `<path d="M1 ${y} Q3.25 ${y - 2} 5.5 ${y} T10 ${y} T14.5 ${y}" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>`;
  const ys = n === 1 ? [7.5] : n === 2 ? [5, 10] : [3.5, 7.5, 11.5];
  return `<svg viewBox="0 0 15.5 15" width="11" height="11" aria-hidden="true">${ys.map(wave).join('')}</svg>`;
};
// p.tr.diff chýba len pri vode (isWaterTrail vylúčené vyššie v points.push), ale typ je voliteľný
// aj tu — bez diff sa piktogram jednoducho nevykreslí, žiadny fabrikovaný tvar.
const pointPicto = (p: MapPoint): string =>
  p.water ? waterWaves((p.tr as { waves?: number }).waves)
    : p.tr.diff ? `<span class="trp-diffmark trp-diffmark--${diffMarkShape(p.tr.diff)}"></span>` : '';
const pointTypeClass = (p: MapPoint): string => (p.journey ? '--journey' : p.water ? '--water' : '');

// bod = pilulka (km, vodná plocha bez km nesie NÁZOV — zadanie 2.3) alebo bodka (17px, len
// piktogram) podľa vrstvy. iconSize/iconAnchor zámerne neuvedené — centrovanie robí CSS
// `transform: translate(...)`.
// ⚠️ 2026-08-14: predtým tu bolo `left:-50%; top:-100%|-50%` a ZVISLÁ zložka NIKDY NEFUNGOVALA.
// Percentuálny `top` sa počíta z výšky rodiča, ale `.trp-pinwrap` má `height:auto!important`
// → hodnota je neurčitá a ticho padne na 0. Vodorovný `left:-50%` fungoval (šírka je
// shrink-to-fit), takže to vyzeralo zapojené. Dôsledok: každá značka sedela o polovicu svojej
// výšky NIŽŠIE, než kam patrí (bodka ~8 px, bublina až 21 px ≈ 2 km pri z9), a pilulka visela
// pod bodom namiesto nad ním. Odhalilo sa to až pri zhlukovaní, keď kolízna matematika
// počítala s vycentrovaním, ktoré sa nedialo. `transform` percentá berie z VLASTNEJ veľkosti
// prvku, takže na rodičovi nezávisí. Pri pridávaní :hover so `scale` nezabudni translate
// zopakovať — `transform` sa neskladá, prepisuje sa.
const pointIcon = (p: MapPoint, hot: boolean, zoom: number) => {
  const type = pointTypeClass(p);
  if (pointIsPill(p, zoom)) {
    const label = p.water ? p.tr.name : `${p.tr.km} km`;
    return L.divIcon({
      className: 'trp-pinwrap',
      html: `<div class="trp-pill${type ? ` trp-pill${type}` : ''}${hot ? ' hot' : ''}">${pointPicto(p)}<span>${label}</span></div>`,
    });
  }
  return L.divIcon({
    className: 'trp-pinwrap',
    html: `<div class="trp-dot${type ? ` trp-dot${type}` : ''}${hot ? ' hot' : ''}">${pointPicto(p)}</div>`,
  });
};
// zhluk (zadanie 2.4) — veľkosť bubliny rastie s počtom bodov v nej.
const clusterSize = (n: number) => (n < 5 ? 30 : n < 12 ? 36 : 42);
const clusterIcon = (n: number) => {
  const s = clusterSize(n);
  return L.divIcon({ className: 'trp-pinwrap', html: `<div class="trp-cluster" style="width:${s}px;height:${s}px;font-size:${n < 12 ? 12 : 13}px">${n}</div>` });
};

// ── geometria značiek v PIXELOCH (2026-08-14) ────────────────────────────────
// Prečo to tu vôbec je: zhlukovanie pôvodne sypalo body do mriežky s pevnou bunkou
// (48/58 px) a bublinu kládlo do ŤAŽISKA bunky. Ťažisko ale nie je stred bunky —
// dve susedné bunky vedia mať ťažiská pár pixelov od seba, takže „3 / 8 / 6 / 6"
// okolo Bratislavy ležali na sebe. Bunka navyše o priemere bubliny (30–42 px)
// nevedela nič, takže veľkosť sa do rozostupu nikdy nepremietla.
// Riešenie: zhlukuj podľa VZDIALENOSTI a rozostup odvoď z veľkosti oboch bublín.
//
// ⚠️ Rozmery sa počítajú ROVNICOU z fontu a paddingu, nemerajú sa po vykreslení —
// meranie po nastavení je kruh (poloha → veľkosť → poloha), tá istá pasca ako
// pri psom bloku na /pack/dogs.
const MARK_GAP = 6;        // vzduch medzi dvoma bublinami
const PILL_GAP = 5;        // vzduch medzi bublinou a km pilulkou
const NUDGE_MAX = 30;      // koľko px smie bublina ustúpiť pilulke (viac = už klame o polohe)
// .trp-pill--journey: Space Grotesk 600 @11.5px ≈ 6.6 px/znak + piktogram 11 + gap 6
// + padding 18 + rám 3. Výška: riadok ~14 + padding 10 + rám 3.
// (overené na 9 pilulkách v deve: rovnica dá 71,0–77,6 px, realita 70,4–77,9 px)
const PILL_CHAR_PX = 6.6;
const PILL_PAD_PX = 38;
const PILL_H = 30;
// bodka (.trp-dot) je 17 px + rám; bublina rastie s počtom
const markSize = (n: number) => (n === 1 ? 19 : clusterSize(n));

// reprezentatívny bod vodnej plochy = ťažisko nakreslených bodov (pri 1 bode = ten bod).
const waterPoint = (path: LatLngTuple[]): LatLngTuple => {
  const lat = path.reduce((s, p) => s + p[0], 0) / path.length;
  const lng = path.reduce((s, p) => s + p[1], 0) / path.length;
  return [lat, lng];
};

function FlyTo({ target }: { target: LatLngTuple | null }) {
  const map = useMap();
  useEffect(() => { if (target) map.flyTo(target, 13, { duration: 1.2 }); }, [target, map]);
  return null;
}

function FitBounds({ path, offset }: { path: LatLngTuple[] | null; offset?: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!path || !path.length) return;
    const bounds = L.latLngBounds(path);
    // Matej 2026-07-22 (bod 1): každé zameranie — úvodné „celé Slovensko" (offset=false) aj
    // výber tripu (offset=true) — sa rámuje s REZERVOU v priestore, ktorý NIE JE prekrytý
    // panelom (ľavý blok), horným barom ani dolnou navigáciou. Padding je responzívny: desktop
    // necháva miesto na ~440px panel vľavo + topbar hore + nav dole; mobile (panel skrytý)
    // len na header hore + nav/toggle dole. maxZoom len pri výbere jedného tripu (offset),
    // nech sa krátka trasa neodzoomuje zbytočne blízko; celé Slovensko sa zmestí bez capu.
    const mobile = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BP;
    // Mobilný padding drží HORNÝ blok (avatar+search+pilulky ≈ 180px) a dolnú navigáciu (≈ 96px)
    // — nie symetrických 150/150. Symetria brala 300px z 844px výšky a zároveň hore nezakryla
    // dosť, takže SR skončilo pod panelom a nad ním svietilo Poľsko.
    const pad = mobile
      ? { paddingTopLeft: [24, 186] as [number, number], paddingBottomRight: [24, 96] as [number, number] }
      : { paddingTopLeft: [PANEL_W + 60, 130] as [number, number], paddingBottomRight: [90, 140] as [number, number] };
    // Na portréte fitBounds bez desatinného zoomu nestačí: Leaflet snapuje na celé stupne, takže
    // buď je SR vpol obrazovky (stupeň nadol), alebo orezané zboku (stupeň nahor) — medzi tým nie
    // je nič. `zoomSnap = 0` dovolí presnú medzihodnotu, ktorá dostupnú plochu vyplní.
    //
    // ⚠️ NASTAVUJE SA LEN NA ČAS RÁMOVANIA A HNEĎ SA VRACIA SPÄŤ (Matej 2026-08-21:
    // „ked približujem prstami od seba ide to veľmi pomaly po milimetri… extrémne dlho
    // trvá zoom"). `zoomSnap` nie je nastavenie rámovania, je to nastavenie CELEJ mapy:
    // Leaflet ním v `ScrollWheelZoom._performZoom` zaokrúhľuje krok kolieska
    // (`Math.ceil(d2 / snap) * snap`). Pri `snap = 0` zaokrúhlenie vypadne a jedno
    // šuchnutie po trackpade posunie priblíženie o zlomok stupňa — presne to „po milimetri".
    // Rámovanie ho potrebuje na jednu synchrónnu snímku (`animate: false`), interakcia nikdy.
    const snapBefore = map.options.zoomSnap;
    map.options.zoomSnap = mobile ? 0 : 1;
    map.fitBounds(bounds, { ...pad, animate: false, ...(offset ? { maxZoom: 14 } : {}) });
    // Matej 2026-07-23: celokrajinný pohľad bol „moc malý" → o JEDEN stupeň bližšie. DÔLEŽITÉ:
    // zoomovať okolo stredu VIDITEĽNEJ plochy (vpravo od panela, medzi topbarom a navom), nie
    // okolo stredu celého kontajnera — inak sa krajina posunie doľava ZA panel. setZoomAround
    // drží ten pixel fixný, takže po priblížení ostane centrovaná v okne. Len „celé SR".
    // ⚠️ LEN DESKTOP (2026-08-14): oboje doladenie vzniklo nad širokým oknom s panelom vľavo.
    // Na portréte je limitujúci rozmer ŠÍRKA — `+1` stupeň tam SR oreže zľava aj sprava a `panBy`
    // ho ešte stlačí pod dolnú hranu, takže vrchné dve tretiny obrazovky vyplní Poľsko.
    // Mobilu stačí čistý fitBounds; rezervu na chrome už drží padding vyššie.
    if (!offset && !mobile) {
      const size = map.getSize();
      const [pl, pt] = pad.paddingTopLeft;
      const [pr, pb] = pad.paddingBottomRight;
      const vcx = (pl + (size.x - pr)) / 2;
      const vcy = (pt + (size.y - pb)) / 2;
      map.setZoomAround(L.point(vcx, vcy), map.getZoom() + 1, { animate: false });
      // Matej 2026-07-23: „ešte o kúsoček doprava a dolu" — obsah posunúť vpravo+dole = pan mapy
      // vľavo+hore (negatívne). panBy raz po fit (nekumuluje sa, fit beží nanovo pri každej zmene).
      map.panBy([-70, -55], { animate: false });
    }
    // Rámovanie skončilo — mapa sa vracia k celým stupňom, aby koliesko aj štipnutie
    // posúvali priblíženie po CELOM kroku, nie po zlomkoch. Obnovuje sa až tu, za
    // `setZoomAround`/`panBy`, ktoré ešte s medzihodnotou pracujú.
    map.options.zoomSnap = snapBefore ?? 1;
  }, [path, offset, map]);
  return null;
}

// captures map clicks while the ADD TRIP draw flow is active (bod 6) — same
// click-to-draw pattern as AddTrailFlow.tsx's handleMapClick, ported to a
// react-leaflet hook here because this map lives inside the Portal's own
// <MapContainer>, not <TrailsMap>.
function DrawClickCatcher({ active, onPoint }: { active: boolean; onPoint: (lat: number, lng: number) => void }) {
  useMapEvent('click', (e) => { if (active) onPoint(e.latlng.lat, e.latlng.lng); });
  return null;
}

// zachytí Leaflet map inštanciu pre pravý ovládací stack (zoom +/−, moja poloha) —
// tie tlačidlá žijú mimo <MapContainer>, tak istý vzor ako FlyTo/FitBounds vyššie.
function MapRefBridge({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => { onReady(map); }, [map, onReady]);
  return null;
}

// ── ľavý zoznam sa riadi VÝREZOM mapy (Matej 2026-07-27: „potrebujem aby sa trasy zobrazovali
// na základe viewportu a nastavaní filtra") ─────────────────────────────────────────────────
// Mostík hlási aktuálny výrez hore do PackMap (useMap* smie žiť len vnútri <MapContainer>,
// rovnaký vzor ako MapRefBridge/FitBounds). Hlási sa LEN na moveend/zoomend (nie počas ťahania)
// + raz po mounte; handler musí mať stabilnú referenciu (useCallback), inak sa listener pri
// každom renderi odhlasuje/prihlasuje a vie prepásť udalosť z FitBounds — presne tá pasca, čo
// je popísaná pri TripMarkers nižšie.
type ViewBox = { n: number; s: number; e: number; w: number };
function ViewportWatcher({ onChange }: { onChange: (b: ViewBox) => void }) {
  const map = useMap();
  const emit = useCallback(() => {
    const b = map.getBounds();
    onChange({ n: b.getNorth(), s: b.getSouth(), e: b.getEast(), w: b.getWest() });
  }, [map, onChange]);
  useEffect(() => { emit(); }, [emit]);
  useMapEvent('moveend', emit);
  useMapEvent('zoomend', emit);
  return null;
}

// Hlási hore ŠKÁLU hrúbky trasy (issue #49) — nie surový zoom. Bucket z trailSaberScale sa mení
// len na pár stupňoch, takže sa 77 polyline neprekresľuje pri každom kroku zoomu. Rovnaký vzor
// (stabilný useCallback) ako ViewportWatcher vyššie — inak sa listener pri každom renderi
// odhlasuje/prihlasuje a vie prepásť udalosť z FitBounds.
function SaberScaleWatcher({ onChange }: { onChange: (k: number) => void }) {
  const map = useMap();
  const emit = useCallback(() => { onChange(trailSaberScale(map.getZoom())); }, [map, onChange]);
  useEffect(() => { emit(); }, [emit]);
  useMapEvent('zoomend', emit);
  return null;
}

// bbox trasy × výrez mapy. Stačí PRIENIK obálok — dlhá journey, ktorá cez výrez len prechádza,
// tak ostane v zozname (bod na trase vnútri výrezu by ju pri hrubom samplovaní vedel stratiť).
const boxIntersects = (a: ViewBox, b: ViewBox) => a.s <= b.n && a.n >= b.s && a.w <= b.e && a.e >= b.w;

// Matej 2026-07-27 (druhé kolo): dashArray pattern nesadol ("nemáči sa mi to"). Náhrada — pod
// pevnou čierno-zlatou čiarou (nedotknutá, LOCKED "rastúce územie" vzhľad) pridaná JEDNA extra
// vrstva so šírkou v REÁLNYCH METROCH (Matejov rozsah 200-500m, stred 350m) pri 50% opacity.
// Real-world šírka prirodzene škáluje s metersPerPixel(zoom): pri bežnom prezeraní (z9-11) je
// sub-pixel tenká → neviditeľná, súčasný bold vzhľad nezmenený. Pri priblížení na hraničný
// úsek narastie na desiatky px → mäkký priehľadný pás, cez ktorý presvitá trasa. Vlastný
// zoom-state žije TU (rovnaký vzor ako TripMarkers vyššie), nie zdvíhaný do PackMap.
const TERRITORY_ZONE_WIDTH_M = 350;
const TERRITORY_ZONE_MIN_PX = 3;
const TERRITORY_ZONE_MAX_PX = 160;
// Matej 2026-07-27 (tretie kolo, na živom priblížení ~z15): "pri takomto zoome už vylúč tú
// zlatú s čiernym lemom a nechaj len tú širokú priesvitnú" — pevná čiara pri hraničnom
// priblížení prekáža rovnako ako predtým dashArray. Fade namiesto tvrdého cutoffu (žiadny
// skok pri prekročení hranice zoomu): plná od z<=CASING_FADE_START, preč od z>=CASING_FADE_END.
const CASING_FADE_START = 12;
const CASING_FADE_END = 14;
// metersPerPixel žije teraz v `src/components/geo/geoMath.ts` — zdieľané s <FogLayer/>
// (predtým dve kópie, viď spec-hmla.md bod 6 zadania).
function TerritoryBorders({ countries }: { countries: string[] }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const onZoomEnd = useCallback(() => setZoom(map.getZoom()), [map]);
  useMapEvent('zoomend', onZoomEnd);
  const zoneWeight = Math.min(TERRITORY_ZONE_MAX_PX, Math.max(TERRITORY_ZONE_MIN_PX, TERRITORY_ZONE_WIDTH_M / metersPerPixel(CENTER[0], zoom)));
  const casingFade = 1 - Math.min(1, Math.max(0, (zoom - CASING_FADE_START) / (CASING_FADE_END - CASING_FADE_START)));

  return (
    <>
      {countries.flatMap((iso) => {
        const rings = COUNTRY_BORDERS[iso];
        if (!rings) {
          if (import.meta.env.DEV) console.warn(`[territory] chýba hraničný polygón pre '${iso}' — dogeneruj cez scripts/gen_borders.py a doplň do countryBorders.ts`);
          return [];
        }
        return rings.flatMap((ring, i) => [
          <Polygon key={`border-${iso}-${i}-zone`} positions={ring} pathOptions={{ color: '#C99A3F', weight: zoneWeight, opacity: 0.5, fill: false, interactive: false, lineJoin: 'round' }} />,
          <Polygon key={`border-${iso}-${i}-casing`} positions={ring} pathOptions={{ color: '#0A0A0A', weight: 11, opacity: 0.9 * casingFade, fill: false, interactive: false, lineJoin: 'round' }} />,
          <Polygon key={`border-${iso}-${i}-gold`} positions={ring} pathOptions={{ color: '#C99A3F', weight: 2.5, opacity: 0.9 * casingFade, fillColor: '#C99A3F', fillOpacity: 0.03 * casingFade, interactive: false, lineJoin: 'round' }} />,
        ]);
      })}
    </>
  );
}

type MapMarkerItem =
  | { kind: 'single'; p: MapPoint }
  | { kind: 'cluster'; lat: number; lon: number; count: number };

// vykresľuje VŠETKY body (trip pily + vodné plochy) v jednej vrstve podľa aktuálneho zoomu
// (zadanie 2.3) a pri z<12 ich pixelovo zhlukuje (zadanie 2.4, port z pins-proto.html render()).
// Vlastný stav zoomu/prepočtu žije TU (nie v PackMap), rovnaký vzor ako FitBounds/MapRefBridge
// vyššie — mapa naň reaguje cez zoomend/moveend, prepočet len pre body vo viditeľných bounds.
function TripMarkers({ points, hoverId, inlineDetailId, onHover, onSelect }: {
  points: MapPoint[]; hoverId: string | null; inlineDetailId: string | null;
  onHover: (id: string | null) => void; onSelect: (tr: HeroTrail) => void;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [moveTick, setMoveTick] = useState(0);
  // 2026-07-27: handler MUSÍ mať stabilnú referenciu (useCallback), inak useMapEvent pri KAŽDOM
  // renderi odhlási starý a prihlási nový listener — a keď FitBounds (sused v <MapContainer>,
  // skôr v strome) vo SVOJOM effecte v tom istom commite synchrónne zavolá map.fitBounds(...),
  // vie sa trafiť presne do okna medzi odhlásením a prihlásením → zoomend/moveend sa stratí
  // a mapa ostane trvalo v starej vrstve (zistené na výbere vodného tripu: fitBounds({maxZoom:14,
  // animate:false}) skočí na z14, ale markery ostali bodky zo z9).
  const onZoomEnd = useCallback(() => setZoom(map.getZoom()), [map]);
  const onMoveEnd = useCallback(() => setMoveTick((n) => n + 1), []);
  useMapEvent('zoomend', onZoomEnd);
  useMapEvent('moveend', onMoveEnd);
  const tier = mapTier(zoom);

  const items = useMemo<MapMarkerItem[]>(() => {
    // bounds filter platí pre VŠETKY vrstvy (zadanie 2.4: "len pre markery vo getBounds().pad(.35)"),
    // nielen pre zhlukované — port z prototypu, kde `vis` počíta raz na vrchu render() a používa sa
    // aj vo vetve T===2 (viď pins-proto.html).
    const bounds = map.getBounds().pad(0.35);
    const vis = points.filter((p) => bounds.contains([p.lat, p.lon]));
    if (tier === 2) return vis.map((p) => ({ kind: 'single', p }));

    // Diaľkové sa NEZHLUKUJÚ, kým nesú km (Matej 2026-07-27) — majú vyzerať dôležito a vzácne,
    // a pohltenie do bubliny s počtom by ich z mapy zmazalo. Mimo toho pásma (celá Európa) sú to
    // už len bodky a zhlukujú sa ako všetko ostatné — inak sa na seba nakopia.
    const pillPts = vis.filter((p) => pointIsPill(p, zoom));
    const rest = vis.filter((p) => !pointIsPill(p, zoom));

    // 1) hrubé zhluky — greedy podľa vzdialenosti v pixeloch (stabilné poradie zľava dole,
    //    nech ten istý výrez dá vždy ten istý výsledok a bubliny pri pane neposkakujú).
    type Cl = { x: number; y: number; pts: MapPoint[] };
    const seedR = tier === 0 ? 34 : 28;
    const proj = rest
      .map((p) => { const pt = map.latLngToContainerPoint([p.lat, p.lon]); return { p, x: pt.x, y: pt.y }; })
      .sort((a, b) => a.x - b.x || a.y - b.y);
    const taken = new Array<boolean>(proj.length).fill(false);
    const cls: Cl[] = [];
    for (let i = 0; i < proj.length; i++) {
      if (taken[i]) continue;
      taken[i] = true;
      const group = [proj[i]];
      for (let j = i + 1; j < proj.length; j++) {
        if (taken[j]) continue;
        if (Math.hypot(proj[j].x - proj[i].x, proj[j].y - proj[i].y) <= seedR) { taken[j] = true; group.push(proj[j]); }
      }
      cls.push({
        x: group.reduce((s, g) => s + g.x, 0) / group.length,
        y: group.reduce((s, g) => s + g.y, 0) / group.length,
        pts: group.map((g) => g.p),
      });
    }

    // pilulky sú prekážky so známym obdĺžnikom — ustúpenie sa počíta voči nim
    // (.trp-pill má top:-100% → sedí NAD bodom, preto je stred obdĺžnika o PILL_H/2 vyššie)
    const pillBoxes = pillPts.map((p) => {
      const pt = map.latLngToContainerPoint([p.lat, p.lon]);
      const w = `${p.tr.km} km`.length * PILL_CHAR_PX + PILL_PAD_PX;
      return { cx: pt.x, cy: pt.y - PILL_H / 2, hw: w / 2 + PILL_GAP, hh: PILL_H / 2 + PILL_GAP };
    });
    // Bublina je súhrn, nie konkrétna trasa — posunúť ju o pár pixelov je prijateľné.
    // Pilulka je konkrétny výlet a NEHÝBE SA. Bodka (zhluk s 1 bodom) tiež nie — je to reálna
    // poloha jedného výletu, radšej prekryv než lož o tom, kde ten výlet je.
    const dodgeOne = (c: { x: number; y: number; pts: MapPoint[] }) => {
      if (c.pts.length === 1) return;
      const r = markSize(c.pts.length) / 2;
      pillBoxes.forEach((b) => {
        const dx = c.x - b.cx, dy = c.y - b.cy;
        const ox = b.hw + r - Math.abs(dx), oy = b.hh + r - Math.abs(dy);
        if (ox <= 0 || oy <= 0) return;
        // ustúp po kratšej osi — najmenší pohyb, ktorý prekryv rozviaže
        if (oy <= ox) c.y += (dy >= 0 ? 1 : -1) * Math.min(oy, NUDGE_MAX);
        else c.x += (dx >= 0 ? 1 : -1) * Math.min(ox, NUDGE_MAX);
      });
    };

    // 2) usadenie — kým sa dve bubliny dotýkajú, zlúč ich. Rozostup vychádza z PRIEMEROV
    //    oboch, takže veľká bublina si urobí viac miesta než malá. Guard je poistka proti
    //    cyklu, nie očakávaný stav (n je rádovo desiatky).
    //    ⚠️ Zlúčená bublina hneď ustúpi pilulkám — inak posledné zlúčenie posunie ťažisko
    //    späť pod pilulku a už to nikto neprepočíta (merané: takto prežil jeden prekryv
    //    `pill"113 km" × cluster"3" = 10px` aj po troch kolách ustupovania).
    //    Cyklus nehrozí: každé zlúčenie zmenší počet bublín o jednu.
    const settle = () => {
      for (let guard = 0; guard < 40; guard++) {
        let hit = false;
        for (let i = 0; i < cls.length && !hit; i++) {
          for (let j = i + 1; j < cls.length; j++) {
            const need = markSize(cls[i].pts.length) / 2 + markSize(cls[j].pts.length) / 2 + MARK_GAP;
            if (Math.hypot(cls[i].x - cls[j].x, cls[i].y - cls[j].y) < need) {
              const ni = cls[i].pts.length, nj = cls[j].pts.length;
              cls[i] = {
                x: (cls[i].x * ni + cls[j].x * nj) / (ni + nj),
                y: (cls[i].y * ni + cls[j].y * nj) / (ni + nj),
                pts: cls[i].pts.concat(cls[j].pts),
              };
              cls.splice(j, 1);
              dodgeOne(cls[i]);
              hit = true;
              break;
            }
          }
        }
        if (!hit) return;
      }
    };
    settle();

    // 3) ustúpiť km pilulkám aj bublinám, ktoré zlučovanie nespojilo (ležia ďalej než MARK_GAP,
    //    ale pilulka medzi nimi zavadzia). Ustúpenie vie dve bubliny priblížiť → settle() to
    //    dorieši zlúčením a to si samo znova ustúpi (viď dodgeOne v settle vyššie).
    cls.forEach(dodgeOne);
    settle();

    // 4) bublinu, ktorej stred je na obrazovke, vtiahni celú dovnútra — inak ju okraj preseká
    //    a z „13" ostane „3" (na mobile najviditeľnejšie). Bublinu so stredom MIMO obrazovky
    //    neťaháme: bola by to lož o polohe a na okraji by vznikla kopa.
    const size = map.getSize();
    cls.forEach((c) => {
      if (c.pts.length === 1) return;
      if (c.x < 0 || c.x > size.x || c.y < 0 || c.y > size.y) return;
      const r = markSize(c.pts.length) / 2 + 3;
      c.x = Math.min(Math.max(c.x, r), size.x - r);
      c.y = Math.min(Math.max(c.y, r), size.y - r);
    });
    cls.forEach(dodgeOne);
    settle();

    const solo: MapMarkerItem[] = pillPts.map((p) => ({ kind: 'single', p }));
    return solo.concat(cls.map((c): MapMarkerItem => {
      if (c.pts.length === 1) return { kind: 'single', p: c.pts[0] };
      const ll = map.containerPointToLatLng([c.x, c.y]);
      return { kind: 'cluster', lat: ll.lat, lon: ll.lng, count: c.pts.length };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- moveTick je zámerný trigger prepočtu (pan), nie dáta sama
  }, [points, tier, zoom, map, moveTick]);

  return (
    <>
      {items.map((it, i) => it.kind === 'cluster' ? (
        <Marker
          key={`cluster:${i}:${it.lat.toFixed(4)}:${it.lon.toFixed(4)}`}
          position={[it.lat, it.lon]}
          icon={clusterIcon(it.count)}
          eventHandlers={{ click: () => map.flyTo([it.lat, it.lon], Math.min(zoom + 2, 14), { duration: 0.6 }) }}
        />
      ) : (
        <Marker
          key={it.p.id}
          position={[it.p.lat, it.p.lon]}
          icon={pointIcon(it.p, hoverId === it.p.id || inlineDetailId === it.p.id, zoom)}
          // pilulka nesie konkrétny údaj (km / názov plochy) a nehýbe sa, tak nech je aspoň
          // navrchu — prekryv s bublinou sa síce rieši ustúpením v bode 3, ale keď sa ustúpiť
          // nedá (NUDGE_MAX), nesmie skončiť tak, že číslo prekrojí polovica pilulky.
          // ⚠️ 2026-08-20 — VYBRANÁ/PODMYŠOU IDE NAD VŠETKO OSTATNÉ (Matej: „vždy musí byť
          // navrchu číslo s pils trasy ktorú označím"). Bez toho ju prekryl ktorýkoľvek sused,
          // ktorý má väčšiu zemepisnú šírku — Leaflet radí markery podľa Y súradnice, takže
          // poradie určuje NÁHODA polohy, nie dôležitosť. Zhoda s čiarou: tá ide dopredu cez
          // `bringToFront()` v tej istej situácii.
          zIndexOffset={
            (hoverId === it.p.id || inlineDetailId === it.p.id) ? 100000
              : pointIsPill(it.p, zoom) ? 1000 : 0
          }
          eventHandlers={{
            mouseover: () => onHover(it.p.id),
            mouseout: () => onHover(null),
            click: () => onSelect(it.p.tr),
          }}
        />
      ))}
    </>
  );
}

const CSS = `
/* Základný font: bolo 'DM Sans', ktorý sa NIKDE nenačítava (index.html ťahá Cinzel, Inter,
   Space Grotesk, JetBrains Mono) → celý neCinzelový text padal na system-ui. Teraz Space
   Grotesk, presne ako pravidlo pre body v index.css. */
.trp-root{position:fixed;inset:0;overflow:hidden;background:#000;color:rgba(245,240,228,0.9);font-family:${FONT_UI};display:flex;flex-direction:column;}

/* ── top bar — lives ON the map, AllTrails "Search map" vzor. Sits between
   the floating panel's right edge and the right-side map control stack.
   Iterácia 10 (Matejov feedback — i9 full-width edge-to-edge header
   ODMIETNUTÝ): status riadok je späť FLOATING nad mapou, ako prvý riadok
   priamo v tomto topbare (nie samostatný full-width sibling nad celou
   stránkou) — rovnaká pozícia ako v iterácii 8. Jediná zmena oproti i8 je
   šírka .trp-status-row (viď nižšie) — teraz 100% tohto topbaru, nech
   zodpovedá search-a-place/top-filter riadku pod ňou. ── */
.trp-topbar{position:absolute;top:20px;left:480px;right:180px;z-index:700;display:flex;flex-direction:column;gap:10px;}
.trp-topsearchrow{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.trp-floatsearch{position:relative;flex:1 1 260px;min-width:220px;}
.trp-floatsearch .trp-mapsug{position:absolute;top:calc(100% + 8px);left:0;right:0;margin-top:0;}
/* bod 3 (iterácia 11): Activity/Difficulty/Popularity už NIE SÚ zabalené v samostatnom
   glass boxe (.trp-topfilters zrušený) — sú to teraz totožné, borderless polia priamo
   v .trp-topsearchrow, rovnaká výška/radius/glass ako search-a-place vedľa nich. */
.trp-toprow-select,.trp-tagdd-btn{flex:1 1 140px;min-width:120px;background:${T.glass};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid ${T.onDarkBorder};border-radius:12px;padding:10px 15px;box-shadow:0 6px 22px rgba(0,0,0,0.4);color:${T.onDark};font-family:inherit;font-size:16px;cursor:pointer;outline:0;}
.trp-toprow-select:focus{border-color:${GOLD};}
/* Tags multi-select trigger (Matej 2026-07-27) — presne rovnaký look ako susedné
   .trp-toprow-select, len navyše button-špecifiká (text-align, chevron, aktívny stav). */
.trp-tagdd-btn{position:relative;display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;box-sizing:border-box;text-align:left;}
.trp-tagdd-btn.on{border-color:${GOLD};color:${GOLD};}
.trp-tagdd-chevron{flex-shrink:0;opacity:.7;font-size:10px;}
.trp-tagdd-panel{position:absolute;top:calc(100% + 8px);right:0;z-index:41;min-width:210px;max-height:420px;overflow-y:auto;background:rgba(6,5,3,0.94);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid ${T.onDarkBorder};border-radius:12px;box-shadow:0 12px 34px rgba(0,0,0,0.55);padding:10px;}
.trp-tagdd-eyebrow{display:block;font-family:${FONT_UI};font-weight:500;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};margin-bottom:8px;}
.trp-tagdd-row{display:flex;align-items:center;gap:8px;width:100%;padding:7px 4px;background:none;border:0;cursor:pointer;font-family:${FONT_UI};font-size:12.5px;color:${T.onDark};opacity:.75;text-align:left;}
.trp-tagdd-row.on{color:${GOLD};font-weight:600;opacity:1;}
.trp-tagdd-row:hover{background:rgba(201,154,63,0.14);border-radius:7px;}
.trp-tagdd-row span:first-child{flex:1;}
.trp-tagdd-clear{display:block;width:100%;text-align:center;margin-top:6px;padding-top:8px;border-top:1px solid ${T.onDarkHair};background:none;border-left:0;border-right:0;border-bottom:0;font-family:${FONT_UI};font-weight:600;font-size:11px;letter-spacing:.04em;color:${T.onDarkDim};cursor:pointer;}
.trp-tagdd-clear:hover{color:${GOLD};}

/* place-search box — iterácia 9 (Matejov feedback bod 2): tmavá/glass karta
   (bola svetlý papyrus), ladí s ostatnými tmavými prvkami nad mapou. */
.trp-mapsearch{display:flex;align-items:center;gap:9px;width:100%;background:${T.glass};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid ${T.onDarkBorder};border-radius:12px;padding:10px 15px;box-shadow:0 6px 22px rgba(0,0,0,0.4);}
.trp-mapsearch img{width:15px;height:15px;filter:brightness(0) invert(1);opacity:0.6;flex-shrink:0;}
/* ⚠️ 16 px — iOS Safari inak pri kliknutí do poľa priblíži celý dokument a ovládanie
   ukotvené k okrajom mapy vypadne mimo obrazovky (feedback_dogypt_form_input_recurring_bugs;
   presne toto zhodilo hľadanie miesta v kreslení 23. 8.). Platí na každý input nad mapou. */
.trp-mapsearch input{background:transparent;border:0;outline:0;color:${T.onDark};font-size:16px;width:100%;font-family:inherit;}
.trp-mapsearch input::placeholder{color:${T.onDarkDim};}
.trp-mapsug{background:rgba(6,5,3,0.94);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid ${T.onDarkBorder};border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);max-height:260px;overflow-y:auto;}
.trp-mapsug-item{padding:10px 15px;cursor:pointer;border-bottom:1px solid ${T.onDarkHair};transition:background .12s;}
.trp-mapsug-item:last-child{border-bottom:0;}
.trp-mapsug-item:hover{background:rgba(201,154,63,0.18);}
.trp-mapsug-name{font-size:13px;color:${T.onDark};font-weight:600;}
.trp-mapsug-sub{font-size:11px;color:${T.onDarkDim};margin-top:1px;}

/* ── floating dark "Explore" panel — margined off top/left/bottom, rounded,
   gold-pale border + shadow. Map is full-bleed behind it (position:relative). ── */
.trp-sidebar{position:absolute;top:20px;left:20px;bottom:20px;width:440px;max-width:calc(100vw - 40px);background:${T.glass};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid ${T.onDarkBorder};border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,0.55),inset 0 1px 0 rgba(245,240,228,0.06);display:flex;flex-direction:column;min-height:0;overflow:hidden;z-index:20;}

/* top block (status/greeting/search/pills/country/filters) — fixed, does NOT
   scroll; only .trp-cards-scroll below it does (= "sticky" behavior via layout). */
.trp-sidebar-top{flex:0 0 auto;display:flex;flex-direction:column;gap:13px;padding:20px 20px 12px;}

/* status riadok — floating (iterácia 8), nad search-a-place;
   km/trips/wishlist staty z lokálneho stavu. Vlastná glass karta, lebo stojí
   priamo nad mapou (nie v už-glass paneli). Iterácia 10: width fit-content →
   100% (rozšírené na celú šírku topbaru, zarovnané so search-a-place/
   top-filter riadkom pod ňou; pozícia/floating charakter nezmenené).
   D4 nav rework (2026-07-24): avatar (.trp-status-avatar, i15 bod 1) ODSTRÁNENÝ —
   žije v zdieľanom bottom nave (PackBottomNav), duplicita zrušená.
   Matej 2026-07-26: obsah rozdelený na tri bloky (.trp-status-left / -center / .trp-headright). */
.trp-status-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap;width:100%;background:${T.glass};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid ${T.onDarkBorder};border-radius:14px;padding:13px 20px;box-shadow:0 10px 30px rgba(0,0,0,0.35);}

/* TROJDIELNY header (Matej 2026-07-26): [LEVEL] — [TRIPSTATS/TRIPLIST/ADD TRIP] — [messages+bell].
   Krajné bloky nesú flex:1 1 0 (rovnaký podiel voľného miesta), stredný len svoj obsah → stredný
   klaster sedí v skutočnej osi riadku, nezávisle od toho aká dlhá je ľavá/pravá strana. */
.trp-status-left{flex:1 1 0;min-width:0;display:flex;align-items:center;}
.trp-status-center{flex:0 1 auto;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;}
.trp-stat-pill{display:flex;align-items:center;gap:6px;background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};border-radius:999px;padding:9px 15px;}
.trp-stat-pill img{width:14px;height:14px;filter:brightness(0) invert(1);opacity:.75;flex-shrink:0;}
/* Obsah pilulky = dáta (počet výletov, km, názov zoznamu) → FONT_UI. Číslice v Space Grotesku
   sú tabular-ish a pri 13px čitateľnejšie než Cinzel serifka. */
.trp-stat-pill span{font-family:${FONT_UI};font-weight:600;font-size:12.5px;color:${GOLD};line-height:1;}
.trp-stat-pill b{font-family:${FONT_UI};font-weight:600;font-size:12.5px;letter-spacing:.01em;color:rgba(245,240,228,0.92);white-space:nowrap;}
button.trp-stat-pill{cursor:pointer;transition:all .15s;}
button.trp-stat-pill:hover{border-color:${GOLD};}
button.trp-stat-pill.on{background:${GOLD};border-color:${GOLD};}
button.trp-stat-pill.on span,button.trp-stat-pill.on b{color:${INK};}
/* LEVEL — rang + číslo. Dve role, dve roly písma (Matej 2026-07-26 „ten level si odflákol" —
   pôvodne bolo všetko Cinzel, takže tam nebol žiadny kontrast, len rozdiel veľkostí):
     PÚTNIK = rang  → FONT_TITLE (identita)
     1      = číslo → FONT_UI 600, veľké
   Základ tu je gradientový TEXT (background-clip:text, glyf priehľadný → glow musí byť
   filter:drop-shadow, nie text-shadow). V hlavičke mapy ho .trp-midentity .trp-level-num
   nižšie prebíja na PLNÚ zlatú pilulku — na oboch šírkach (Matej 2026-08-05). Popisok „Lvl"
   sa už nerenderuje nikde (Matej 2026-08-03: „to LVL ma ruší"). */
.trp-level{display:inline-flex;align-items:baseline;gap:9px;flex-shrink:0;padding-right:2px;white-space:nowrap;}
/* ── IDENTITA V HLAVIČKE MAPY — JEDEN BLOK PRE OBE ŠÍRKY (2026-08-05) ──────────
   Matej: „pri PILGRIM nie je profilová foto ako sme si povedali je to len na mobile… aj ten
   level (urob to tak aj na PC)". Desktop mal do 5. 8. vlastný kus kódu (rang + „Lvl N" ako
   holý gradientový text, bez avatara, bez podriadku, neklikateľný) a rozišiel sa s mobilom.
   Teraz je to jeden renderIdentity() a JEDNA sada tried — preto tieto pravidlá žijú TU,
   v globálnom CSS, a nie v @media (max-width:760px).
   Klik vedie na /pack/map/triplist?tab=stats (tam žije ⓘ s legendou bodov) — z PC sa tam
   predtým nedalo dostať vôbec. Blok je klikací, ale nevyzerá ako tlačidlo: je to identita,
   nie akcia. */
.trp-midentity{display:flex;align-items:center;gap:9px;min-width:0;background:none;border:none;padding:0;cursor:pointer;text-align:left;}
.trp-mavatar{width:34px;height:34px;border-radius:50%;flex:0 0 auto;object-fit:cover;border:1.5px solid ${GOLD};box-shadow:0 0 0 1px rgba(0,0,0,0.5);}
.trp-mavatar--initial{display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#2a2317,#14110b);color:${GOLD};font-family:${FONT_TITLE};font-weight:700;font-size:14px;line-height:1;}
.trp-midentity-txt{display:flex;flex-direction:column;gap:2px;min-width:0;}
.trp-midentity .trp-level{gap:7px;}
.trp-midentity .trp-level-name{font-size:11px;letter-spacing:.14em;}
/* Matej 2026-08-03: „LVL daj do oranžovej pill alebo inak vizuálne zvýrazni" — level je PLNÁ
   zlatá pilulka (nie gradientový text), a od 5. 8. aj na PC („daj tiež lvl do pils ako na
   mobile"). Preto sa musí zhasnúť aj background-clip aj -webkit-text-fill-color — samotné
   color: by pri background-clip:text neprebilo priehľadnú výplň písma.
   Popisok „Lvl" je preč na OBOCH šírkach (Matej 3. 8.: „to LVL ma ruší") — v pilulke je holé
   číslo a rang vedľa (PILGRIM) povie, čo to je. */
.trp-midentity .trp-level-num{align-items:center;padding:3px 10px 4px;border-radius:999px;background:linear-gradient(135deg,#F5C73D,#E69E1A);-webkit-background-clip:border-box;background-clip:border-box;color:${INK};-webkit-text-fill-color:${INK};filter:none;box-shadow:0 2px 8px rgba(245,199,61,0.28);}
.trp-midentity .trp-level-num em{font-size:14px;}
/* Podriadok „N trips · X km" nahradil trophy pilulku (Matej 2026-08-03): číslo ostáva viditeľné
   bez ťuknutia, ale prestalo byť ďalším prvkom v rade. Space Grotesk — sú to dáta, nie identita. */
.trp-mstats{font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:${T.onDarkDim};white-space:nowrap;}
.trp-midentity:hover .trp-level-name{color:#fff;}
.trp-level-name{font-family:${FONT_TITLE};font-weight:700;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:rgba(245,240,228,0.92);}
.trp-level-num{display:inline-flex;align-items:baseline;gap:5px;font-family:${FONT_UI};line-height:1;background:linear-gradient(135deg,#F5C73D,#E69E1A);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 7px rgba(245,199,61,0.35));}
.trp-level-num em{font-style:normal;font-weight:600;font-size:21px;letter-spacing:0;}
/* CTA tlačidlo → Cinzel ostáva: .btn-gold (SpiralLanding.css) je LOCKED brand CTA a ten je
   Cinzel 700 uppercase. Grotesk sem nepatrí. */
/* DOSVIT Z LOCKU (2026-08-22) — .btn-gold (SpiralLanding.css:241) má
   box-shadow: 0 0 40px rgba(230,158,26,.4) + inset 0 1px 0 rgba(255,255,255,.3). Tunajšie CTA
   ho nemalo, takže na tmavej mape splývalo s pozadím a s ostatnými zlatými prvkami. Gradient,
   radius 8 aj papyrusový rám sedeli, chýbal len halo — dopĺňa sa, nevymýšľa sa vlastný. */
.trp-addtrip-btn{flex-shrink:0;display:inline-flex;align-items:center;gap:5px;font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:9px 16px;border-radius:8px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border:1px solid rgba(250,244,236,0.3);box-shadow:0 0 40px rgba(230,158,26,0.4), inset 0 1px 0 rgba(255,255,255,0.3);transition:transform .2s, box-shadow .22s, filter .22s;cursor:pointer;white-space:nowrap;}
.trp-addtrip-btn:hover{filter:brightness(1.05);box-shadow:0 0 56px rgba(230,158,26,0.55), inset 0 1px 0 rgba(255,255,255,0.3);}
.trp-addtrip-btn:active{transform:scale(0.98);}
/* Dva labely CTA (Matej 2026-07-27): plný „Add trip" na širokom desktope, skrátený „Add"
   v kompaktnom desktope a na mobile — tam sa musí celý status riadok zmestiť do JEDNÉHO
   riadku. Prepínajú sa v media queries nižšie; default = plný. */
.trp-addtrip-short{display:none;}
/* Modálny filter sheet skrýva plávajúci AINUBIS launcher — viď komentár pri useEffect vyššie. */
body.trp-sheet-open .ainubis-launcher{display:none;}

/* ══ ZÁMOK OBRAZOVKY POČAS PRIDÁVANIA (Matej 2026-08-22, LOCK §2.2b) ══════════════════════
   „ihneď po prvom dlhom stlačení sa musí obrazovka locknúť do stavu vpisovania výletov = bez
   ruchu navigácie menu či hlavičky = bude vidno len panel nástrojov na pridanie konkretnej veci"

   JEDNA TRIEDA, JEDNO MIESTO. Vešia ju effect pri premennej drawLock (hľadaj trp-draw-lock v tomto
   súbore), tu je celý jej účinok — nie osem podmienok rozsypaných po komponentoch. Vzor je
   ten istý, akým už filter sheet skrýva AINUBIS (riadok vyššie).

   Zmizne CHROME (prehliadanie): spodná navigácia /pack, mobilná hlavička s hľadaním a filtrami,
   dvojica ZOZNAM+PRIDAŤ, zoznam kariet, desktopový panel v stave prehliadania (vrátane
   prepínača kategórií Trips/Events) a plávajúci AINUBIS.
   Ostane NÁSTROJ: mapa, panel práve pridávanej veci a jeho vlastný únik (× / Zrušiť).

   ⚠️ NÁSTROJOM JE .trp-addhost, NIE PANEL. Do 23. 8. mal panel v stave ADD triedu is-tool a
   zámok ho preto obchádzal; odkedy formulár pridávania býva vo vlastnom hostiteľovi (jedna
   kópia namiesto dvoch), je .trp-sidebar vždy len prehliadanie a zámok ho schová celý.
   .trp-addhost žiadne pravidlo zámku netrafí — a to je zámer, je to ten chránený nástroj.

   ⚠️ Mapa sa v zámku vracia aj z LIST pohľadu (posledné dva riadky). Bez toho platí
   .trp-root.mlist-active .trp-mapregion{display:none} a človek, ktorý dal PRIDAŤ zo zoznamu,
   po ťuku na „ukáž mapu" pozerá na nepriehľadný zoznam (z-index 60) namiesto mapy — kresliť
   sa nedá. ⚠️ Selektor musí niesť aj .trp-root.mlist-active — pôvodné pravidlo má špecificitu
   0-3-0 (dve triedy na jednom prvku) a kratší zápis "body.trp-draw-lock .trp-mapregion" (0-2-1)
   ho NEPREBIJE. Overené v prehliadači: mapa ostávala display:none. */
body.trp-draw-lock .ainubis-launcher{display:none;}
body.trp-draw-lock .trp-root > nav.fixed{display:none;}
body.trp-draw-lock .trp-mheader{display:none;}
/* Desktopová dvojička .trp-mheader — tá istá hlavička s hľadaním, filtrami a druhým CTA
   PRIDAŤ. Bez tohto riadku zámok na PC ničí len navigáciu a hlavičku nechá stáť. */
body.trp-draw-lock .trp-topbar{display:none;}
body.trp-draw-lock .trp-mactions{display:none;}
body.trp-draw-lock .trp-sidebar{display:none;}
body.trp-draw-lock .trp-root .trp-mlist{display:none;}
body.trp-draw-lock .trp-root.mlist-active .trp-mapregion{display:block;}
/* Matej 2026-07-24: "+" brand ikonka pred textom — plus.svg je natívne čierne (fill hardcoded,
   nie currentColor), čo na zlatom gradiente číta ako tmavá/INK farba presne ako treba — žiadny
   invert filter (to by ju zmenilo na bielu). */
.trp-addtrip-icon{width:13px;height:13px;flex-shrink:0;display:block;}

/* „Hi Guest," = sub riadok nad otázkou → FONT_UI; samotná otázka = nadpis → FONT_TITLE. */
.trp-greet-hi{font-family:${FONT_UI};font-weight:500;font-size:12.5px;color:rgba(245,240,228,0.65);}
.trp-greet-sub{font-family:${FONT_TITLE};font-weight:700;font-size:19px;color:${GOLD};letter-spacing:.01em;margin-top:2px;line-height:1.25;}

/* bod 2 (Matej 2026-07-22): pozdrav vľavo + filter (sliders) ikonka vpravo hore, medzi nimi space. */
.trp-greet-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
.trp-greet-filterwrap{position:relative;flex-shrink:0;}
.trp-greet-filter{width:38px;height:38px;border-radius:11px;background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;}
.trp-greet-filter:hover{border-color:${GOLD};}
.trp-greet-filter.on{background:${GOLD};border-color:${GOLD};}
.trp-greet-filter img{width:17px;height:17px;filter:brightness(0) invert(1);opacity:.85;}
.trp-greet-filter.on img{filter:brightness(0);opacity:.85;}
.trp-sortpop--desk{position:absolute;top:calc(100% + 8px);right:0;background:rgba(6,5,3,0.96);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid ${T.onDarkBorder};border-radius:11px;overflow:hidden;box-shadow:0 12px 34px rgba(0,0,0,0.55);z-index:40;min-width:150px;}
.trp-sortpop--desk button{display:block;width:100%;text-align:left;padding:11px 15px;font-family:inherit;font-size:12.5px;color:${T.onDark};background:none;border:0;border-bottom:1px solid ${T.onDarkHair};cursor:pointer;}
.trp-sortpop--desk button:last-child{border-bottom:0;}
.trp-sortpop--desk button.on{color:${GOLD};font-weight:600;}
.trp-sortpop--desk button:hover{background:rgba(201,154,63,0.14);}

/* category pills — Trips active (solid gold), rest dashed + muted, CSS
   tooltip on hover ("Coming soon"), no inline "Soon" label anymore. Iterácia 7
   (Matejov feedback bod 1): FULL-WIDTH grid, 4 rovnaké stĺpce, edge-to-edge —
   rovnako široké ako dropdowny pod nimi. */
/* flex + flex:1 1 0 na pilloch (NIE grid s pevným počtom stĺpcov) — rad sa sám rozdelí
   rovnakým dielom na celú šírku pri ľubovoľnom počte. Pôvodné repeat(4,1fr) tu nechalo
   po odobraní MIESTA prázdny štvrtý stĺpec (Matej 2026-08-06: „daj tak aby boli na celu
   šírku nech to je pekne zrovnané"). Platí ako pravidlo pre každý rad rovnocenných prvkov. */
.trp-cat-pills{display:flex;gap:9px;}
/* Kategórie (Trips/Events/Places/Services) sú nadpisy sekcií, nie dáta → FONT_TITLE. */
.trp-catpill{flex:1 1 0;min-width:0;padding:12px 8px;border-radius:10px;border:1px solid rgba(245,240,228,0.22);background:rgba(245,240,228,0.07);font-family:${FONT_TITLE};font-weight:700;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:rgba(245,240,228,0.78);cursor:pointer;white-space:nowrap;transition:all .15s;text-align:center;}
.trp-catpill.on{background:linear-gradient(135deg,#F5C73D,#E69E1A);border-color:rgba(250,244,236,0.3);color:#1c160c;box-shadow:0 4px 14px rgba(201,154,63,0.3);}
.trp-catpill.soon{border-style:dashed;opacity:.5;cursor:default;position:relative;}
.trp-catpill.soon:hover{opacity:.8;}
.trp-catpill.soon::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:${T.panelGrad};border:1.5px solid ${T.cardEdge};color:${INK};font-family:${FONT_UI};font-size:10px;font-weight:600;padding:5px 10px;border-radius:10px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s;box-shadow:${T.panelShadow};z-index:5;}
.trp-catpill.soon:hover::after{opacity:1;}

/* country select — flag + 3-letter code; native <select> so the dropdown escapes
   the panel's overflow:hidden cleanly (no popover-clip risk). Only SK enabled. */
.trp-country-select,.trp-filter-select{width:100%;min-width:0;background:rgba(245,240,228,0.05);border:1px solid rgba(245,240,228,0.16);border-radius:9px;padding:8px 9px;color:rgba(245,240,228,0.85);font-family:inherit;font-size:16px;cursor:pointer;outline:0;}
.trp-country-select:focus,.trp-filter-select:focus{border-color:${GOLD};}
/* geo kaskáda (Matejov feedback bod 4, iterácia 7; Pohorie vrátené iterácia 9; Activity
   presunutá sem 2026-07-27): country (malinký, flag+kód) → región (West/Center/East) →
   activity. Flexbox namiesto grid-u 3 pevných stĺpcov, lebo activity musí ostať v riadku
   aj keď je región skrytý (mimo SK) — grid s 3 stĺpcami by vtedy nechal prázdnu medzeru. */
.trp-georow{display:flex;gap:7px;}
/* Matej 2026-08-06: „pri prvom dropdowne kde je všetko = je krátky a šípka splýva s písmom".
   72px nestačilo na vlajku + text + natívnu šípku selectu, takže sa prekrývali. Širší základ
   + pravý padding, ktorý drží text mimo šípky (tú kreslí OS, posunúť sa nedá — dá sa len
   uvoľniť miesto). Ostatné dva selecty sú flex 1 1 0, takže sa o zvyšok podelia samy. */
.trp-georow .trp-country-select{flex:0 0 104px;padding:8px 22px 8px 8px;}
.trp-georow .trp-filter-select{flex:1 1 0;min-width:0;}

/* tag chips — iterácia 8: Activity/Difficulty/Popularity presunuté hore do top filter
   baru (viď komentár pri .trp-topfilters), panel teraz nesie len 8 univerzálnych tagov. */
.trp-filters-row2{display:flex;flex-wrap:wrap;gap:5px;}
.trp-chip-sm{padding:5px 10px;border-radius:999px;border:1px solid rgba(245,240,228,0.16);background:transparent;color:rgba(245,240,228,0.55);font-family:inherit;font-size:10px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s;}
.trp-chip-sm:hover{border-color:${GOLD};}
.trp-chip-sm.on{background:${GOLD};border-color:${GOLD};color:${INK};}
.trp-chip-sm.locked{opacity:.38;cursor:not-allowed;}

/* trips list — scrolls independently below the fixed top block; card height
   doesn't divide the panel evenly on purpose (peek = scroll affordance). */
.trp-cards-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;padding:0 20px 20px;}
.trp-cards{display:flex;flex-direction:column;gap:14px;}
/* oddeľovač „Elsewhere on the map · N" (Matej 2026-07-27) — zoznam je delený výrezom mapy:
   nad čiarou to, čo je práve vidno, pod ňou zvyšok. Typografia = dark-panel UI (Space Grotesk,
   nie Cinzel — nie je to nadpis ani identita), vlasová linka rovnaká ako .trp-tagdd-clear. */
.trp-cards-sep{display:flex;align-items:center;gap:9px;margin:8px 0 0;font-family:${FONT_UI};font-size:10px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:rgba(245,240,228,0.40);}
.trp-cards-sep::before,.trp-cards-sep::after{content:'';flex:1;height:1px;background:rgba(245,240,228,0.12);}
.trp-cards-sep b{font-weight:600;color:rgba(245,240,228,0.28);letter-spacing:.06em;}
.trp-bigcard{border-radius:14px;overflow:hidden;background:rgba(245,240,228,0.03);border:1px solid rgba(245,240,228,0.10);border-left:3px solid transparent;cursor:pointer;transition:all .15s;flex-shrink:0;}
.trp-bigcard:hover,.trp-bigcard.hot{border-color:${GOLD};background:rgba(201,154,63,0.07);}
.trp-bigcard-photo{position:relative;width:100%;aspect-ratio:4/3;height:auto;background-size:cover;background-position:center;background-color:#111;flex-shrink:0;}
.trp-cardflag{position:absolute;top:8px;left:8px;width:24px;height:24px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(255,255,255,0.85);box-shadow:0 2px 6px rgba(0,0,0,0.4);z-index:2;pointer-events:none;}
/* bod 3 (Matej 2026-07-22): šípky VŽDY viditeľné (opacity .9, nie hover-only) — člen musí
   vidieť, že fotky sa dajú prepínať. Plnšie na hover. */
.trp-bigcard-photonav{position:absolute;inset:0;display:flex;align-items:center;justify-content:space-between;padding:0 6px;opacity:.9;transition:opacity .15s;}
.trp-bigcard-photo:hover .trp-bigcard-photonav{opacity:1;}
.trp-bigcard-photobtn{width:26px;height:26px;border-radius:50%;background:rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.28);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;line-height:1;box-shadow:0 2px 8px rgba(0,0,0,0.5);}
.trp-bigcard-photobtn:hover{background:rgba(0,0,0,0.85);border-color:${GOLD};}
/* dots → dolný ĽAVÝ roh (dolný pravý zabrali náročnosť/popularita pilulky, Matej 2026-07-22) */
.trp-bigcard-dots{position:absolute;bottom:9px;left:10px;display:flex;justify-content:flex-start;gap:4px;z-index:2;}
.trp-bigcard-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.5);box-shadow:0 1px 3px rgba(0,0,0,0.6);}
.trp-bigcard-dot.on{background:#fff;}
/* bod 3 (Matej 2026-07-22): ✓/★ v HORNOM pravom rohu fotky. */
.trp-bigcard-photoacts{position:absolute;right:9px;top:9px;z-index:3;display:flex;flex-direction:column;align-items:flex-end;gap:6px;}
/* Trasa · náročnosť · popularita — DOLNÝ PRUH fotky po celej šírke (Matej 2026-07-27; predtým
   dve stacknuté pilulky v pravom rohu). left+right, nie len right — pilulky idú vedľa seba. */
.trp-bigcard-photometa{position:absolute;left:9px;right:9px;bottom:9px;z-index:2;}
/* Chipy na fotke (Walked / Triplist) = drobné ovládanie, nie CTA → FONT_UI. */
.trp-bigcard-photoactbtn{display:flex;align-items:center;gap:5px;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.22);color:#fff;font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.04em;padding:6px 10px;border-radius:999px;cursor:pointer;white-space:nowrap;}
.trp-bigcard-photoactbtn:hover{border-color:${GOLD};}
.trp-bigcard-photoactbtn.on{background:${GOLD};border-color:${GOLD};color:${INK};}
/* Walked chip je ZELENÝ, nie zlatý (Matej 2026-07-27) — rovnaká farba ako WALKED ✓ v detaile
   výletu, kotvená na T.growGreen #3D7A4E. Zlatá ostáva Triplistu = dve akcie, dve farby. */
.trp-bigcard-photoactbtn--walked.on{background:linear-gradient(135deg,#4A8F5D,#2F6440);border-color:rgba(255,255,255,0.28);color:#fff;}
.trp-bigcard-photoactbtn--walked.on:hover{border-color:rgba(255,255,255,0.5);}
/* Body za prejdenie na chipe = <PointsPill> (components/pack/PointsPill.tsx). Zlatý <span>
   .trp-photoact-pts ZMAZANÝ 2026-08-05 — Matej: „je to nevýrazné… tie body musia byť výrazné".
   Zlaté číslo na tmavom chipe splývalo s okolím; béžová pilulka je najsvetlejšia plocha na fotke.
   Chip má white-space:nowrap, takže pilulka musí ostať flex-shrink:0 (rieši .pts-pill). */
/* bod 3: telo karty = 2 stĺpce — vľavo 3 riadky (loc/název/autor), vpravo rating·difficulty·Crowd */
/* align-items:center (Matej 2026-07-22) — rating (pravý stĺpec) vertikálne na STRED karty,
   nie pri hornom okraji. */
.trp-bigcard-body{padding:11px 13px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;}
.trp-bigcard-info{min-width:0;}
/* pohorie · región label, pod fotkou (Matejov feedback bod 3, iterácia 7) */
/* Región nad názvom = eyebrow (Entry.tsx .religion-eyebrow vzor) → FONT_UI 500 + .22em. */
.trp-bigcard-loc{font-family:${FONT_UI};font-weight:500;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(245,240,228,0.45);margin-bottom:3px;}
/* bod 4 (iterácia 16): line-clamp 2 riadky, nech dlhé názvy nerozbíjajú layout */
.trp-bigcard-name{font-family:${FONT_TITLE};font-weight:700;font-size:13.5px;color:rgba(245,240,228,0.92);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
/* bod 6: "by {author}" riadok + avatarpair (majiteľ+pes) — .trp-bigcard-author je teraz
   inline text vedľa avatarov, nie vlastný blok (margin presunutý na wrapper riadok). */
.trp-bigcard-authorrow{display:flex;align-items:center;gap:6px;margin-top:4px;}
.trp-bigcard-author{font-size:10px;color:rgba(245,240,228,0.45);}
/* #41 / A4 — autor je odteraz tlačidlo (otvára popup tvorcu). Reset UA štýlov, nech
   riadok vyzerá presne ako predtým; zlatý podčiarkovník napovie, že sa dá kliknúť. */
button.trp-authorbtn{background:none;border:none;padding:0;margin:0;text-align:left;cursor:pointer;font:inherit;color:inherit;letter-spacing:inherit;text-decoration:underline;text-decoration-color:rgba(201,154,63,0.45);text-underline-offset:3px;}
button.trp-authorbtn:hover{text-decoration-color:#C99A3F;}
.trp-bigcard-meta2{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;}
.trp-bigcard-meta2 span{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;white-space:nowrap;}
.trp-bigcard-meta2-row{color:rgba(245,240,228,0.55);}
.trp-bigcard-star{color:${GOLD};font-weight:600;}

/* bod 6 (iterácia 16): dva prekrývajúce sa kruhové avatary (majiteľ + pes) pri "by {author}"
   riadku — zdieľané medzi kartou a inline detailom (AuthorAvatars komponent), veľkosť cez
   --trp-av-size CSS var (size prop, rôzna pre kompaktnú kartu vs. priestrannejší detail). */
.trp-avatarpair{display:inline-flex;align-items:center;flex-shrink:0;}
.trp-avatarcircle{width:var(--trp-av-size,16px);height:var(--trp-av-size,16px);border-radius:50%;border:1.5px solid ${T.pageBg};background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;font-family:${FONT_UI};font-weight:600;font-size:calc(var(--trp-av-size,16px) * 0.44);color:#1c160c;}
.trp-avatarcircle+.trp-avatarcircle{margin-left:calc(var(--trp-av-size,16px) * -0.3);}
.trp-avatarcircle--placeholder{background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);}

/* ── bod 4 (iterácia 11): .trp-sidebar má teraz 3 mutually-exclusive JS-swapped
   stavy — LIST (default, vyššie), inline DETAIL, ADD setup. Mobile skrýva celý
   .trp-sidebar (viď mobile media query) — DETAIL/ADD sú desktop-only, mobile
   detail ide cez existujúci .trp-detoverlay full-page modal. ── */
.trp-panelnav-btn{width:32px;height:32px;border-radius:50%;background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}
.trp-panelnav-btn:hover{border-color:${GOLD};color:${GOLD};}

.trp-inldet{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:hidden;}
.trp-inldet-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 10px;flex-shrink:0;}
.trp-inldet-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:0 20px 16px;}
/* bod 4 (iterácia 15): fotka nesie 3 overlaye — avatar autora (roh, initial fallback ako
   .trp-status-avatar), bočné šípky (reused .trp-bigcard-photonav — position:absolute inset:0
   = presne bočné, vertikálne centrované) a ★ "Add to wishlist" textové tlačidlo (dolný pravý
   roh, nahrádza starý ♡ kruhový). */
.trp-inldet-photowrap{position:relative;}
.trp-inldet-photo{width:100%;aspect-ratio:4/3;border-radius:12px;background-size:cover;background-position:center;background-color:#111;}
.trp-inldet-authoravatar{position:absolute;top:10px;left:10px;z-index:3;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);border:2px solid rgba(255,255,255,0.5);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.4);}
.trp-inldet-authoravatar span{font-family:${FONT_UI};font-weight:600;font-size:12px;color:#1c160c;}
.trp-inldet-savebtn{position:absolute;bottom:10px;right:10px;z-index:3;display:flex;align-items:center;gap:5px;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);border:1.5px solid rgba(255,255,255,0.28);color:#fff;font-family:${FONT_UI};font-weight:600;font-size:10.5px;padding:7px 12px;border-radius:999px;cursor:pointer;white-space:nowrap;}
.trp-inldet-savebtn.on{background:${GOLD};border-color:${GOLD};color:${INK};}
/* bod 4 (i15) + bod 1/2/6 (i16): 2 stĺpce (ako karta) — vľavo 3 riadky (loc/název/autor+
   avatarpair), vpravo rating(packy+číslo)+difficulty+km+Crowd. Tagy a text idú POD tento blok
   (mimo gridu, vlastný riadok). */
.trp-inldet-main{display:grid;grid-template-columns:1fr auto;gap:14px;margin-top:12px;align-items:center;}
.trp-inldet-loc{font-family:${FONT_UI};font-weight:500;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};}
/* bod 4 (iterácia 16): line-clamp 2 riadky */
.trp-inldet-name{font-family:${FONT_TITLE};font-weight:700;font-size:17px;color:${T.onDark};margin-top:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
/* bod 6: "by {author}" riadok + avatarpair (majiteľ+pes), rovnaký vzor ako karta */
.trp-inldet-authorrow{display:flex;align-items:center;gap:7px;margin-top:5px;}
.trp-inldet-author{font-size:10.5px;color:${T.onDarkDim};}
.trp-inldet-meta2{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;}
.trp-inldet-meta2-row{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:${T.onDarkDim};white-space:nowrap;}
/* bod 2 (iterácia 16): rating = 5-pack (RatingPaws, tripShared) + stars.toFixed(1) */
.trp-inldet-rating{display:inline-flex;align-items:center;gap:6px;}
.trp-inldet-rating b{font-family:${FONT_UI};font-weight:600;font-size:12px;color:${GOLD};}
/* bod 4: tagy JEDEN riadok vedľa seba (nie stĺpec/pravá strana ako v i12) */
.trp-inldet-tagrow{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px;}
.trp-inldet-tag{background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:10.5px;font-weight:600;padding:5px 10px;border-radius:999px;white-space:nowrap;}
.trp-inldet-desc{font-size:12.5px;line-height:1.6;color:${T.onDarkDim};margin-top:10px;}
/* bod 4: Comments + "Walked by N Dogyptians" — placeholder empty-state sekcie */
.trp-inldet-section{margin-top:16px;}
/* Sekčné popisky v detaile ("Elevation profile", "Walked by N Dogyptians") sú pri 10.5px
   uppercase eyebrow, nie nadpis → FONT_UI 500. Titulnú rolu v detaile nesie .trp-inldet-name. */
.trp-inldet-section h4{font-family:${FONT_UI};font-weight:500;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:${T.onDark};margin-bottom:6px;}
.trp-inldet-empty{font-size:11.5px;color:${T.onDarkDim};font-style:italic;}
/* #41 — blok jednej partie (organizátor + kto s ním ide) v inline detaile */
.trp-inldet-host + .trp-inldet-host{margin-top:10px;}
.trp-inldet-actions{display:flex;gap:9px;padding:14px 20px 20px;border-top:1px solid ${T.onDarkHair};flex-shrink:0;}
.trp-inldet-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-family:${FONT_TITLE};font-weight:700;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;padding:10px 8px;border-radius:10px;cursor:pointer;border:1px solid transparent;transition:all .15s;}
.trp-inldet-btn--ghost{background:rgba(245,240,228,0.06);color:${T.onDark};border-color:${T.onDarkBorder};}
.trp-inldet-btn--ghost.on{background:rgba(201,154,63,0.16);color:${GOLD};border-color:${GOLD};}

/* ── bod 6 (iterácia 11): ADD TRIP setup — draw-on-map recyklovaný z
   AddTrailFlow.tsx (handleMapClick/undo/clear/haversine), preštýlovaný do
   tmavého portal panela. Submit ide len do lokálneho session state (viď
   submitAdd) — DB zápis je mimo rozsahu tejto iterácie. ── */
.trp-addsetup{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:hidden;}
.trp-addsetup-head{display:flex;align-items:center;gap:10px;padding:16px 20px 10px;flex-shrink:0;}
.trp-addsetup-title{font-family:${FONT_TITLE};font-weight:700;font-size:14px;color:${T.onDark};}
.trp-addsetup-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:4px 20px 16px;display:flex;flex-direction:column;gap:13px;}
.trp-addsetup-field label{display:block;font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};margin-bottom:6px;}
.trp-addsetup-input{width:100%;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:9px;padding:9px 11px;color:${T.onDark};font-family:inherit;font-size:12.5px;outline:0;}
.trp-addsetup-input:focus{border-color:${GOLD};}
.trp-addsetup-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.trp-multitoggle{margin-top:6px;background:none;border:0;padding:2px 0;color:${GOLD};font-family:inherit;font-size:11.5px;font-weight:600;cursor:pointer;opacity:.85;}
.trp-multitoggle:hover{opacity:1;text-decoration:underline;}
.trp-plannedpill{display:inline-block;font-family:${FONT_UI};font-weight:600;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#F5C73D;background:rgba(0,0,0,0.5);padding:4px 9px;border-radius:7px;border:1px solid rgba(201,154,63,0.5);}
.trp-norating{font-size:22px;font-weight:600;color:rgba(245,240,228,0.35);letter-spacing:.05em;}
/* Ružová kvapka planu (.trp-planmarker-dot) aj zlatá kvapka podujatia
   (.trp-eventmarker-dot) tu stáli do 22. 8. 2026. Obe nahradil biely kruh s modrým
   lemom — dôvod je hore pri TARGET_PIN. Triedy sú zmazané, nie zakomentované: mŕtve
   CSS by pri najbližšom hľadaní vyzeralo ako živý štýl.
   ⚠️ NIKDY sem nepíš spätný apostrof — sme VNÚTRI template literalu const CSS
   a ten znak v komentári ho predčasne ukončí. Zvyšok CSS sa potom vyhodnotí ako JS
   a stránka spadne na "... is not a function". TypeScript ani build to nechytia. */
/* plánovanie (Matej 2026-07-23): 3 date dropdowny (deň/mesiac/rok) + profil note. */
.trp-addsetup-daterow{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
.trp-addsetup-profilenote{font-size:11.5px;line-height:1.5;color:${GOLD};background:rgba(201,154,63,0.1);border:1px solid rgba(201,154,63,0.3);border-radius:10px;padding:11px 13px;}
/* TODO: forest placeholder foto (Cloudinary) doplniť keď Matej vyberie z 10 návrhov → background-image na .trp-planph */
.trp-planph{position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;margin-bottom:12px;overflow:hidden;background:linear-gradient(135deg,#1c2b1a,#0e1a0d);display:flex;align-items:center;justify-content:center;border:1px solid rgba(245,240,228,0.12);}
.trp-planph-badge{font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#F5C73D;background:rgba(0,0,0,0.45);padding:8px 14px;border-radius:8px;border:1px solid rgba(201,154,63,0.5);}
.trp-planpin{padding:9px 11px;border-radius:9px;border:1px dashed rgba(201,154,63,0.5);background:rgba(201,154,63,0.06);color:rgba(245,240,228,0.75);font-size:12px;}
.trp-planpin.set{border-style:solid;color:${GOLD};}
.trp-addsetup-file{font-size:11px;color:${T.onDarkDim};}
.trp-addsetup-photos{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px;}
.trp-addsetup-photo{position:relative;width:64px;height:64px;border-radius:8px;background-size:cover;background-position:center;}
.trp-addsetup-photo button{position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,0.75);color:#fff;border:none;font-size:11px;line-height:1;cursor:pointer;}
.trp-addsetup-stars{display:flex;gap:4px;}
.trp-addsetup-stars button{background:none;border:none;font-size:20px;color:rgba(245,240,228,0.22);cursor:pointer;line-height:1;}
.trp-addsetup-stars button.on{color:${GOLD};}
.trp-addsetup-livekm{font-family:${FONT_UI};font-weight:600;font-size:11.5px;color:${GOLD};background:rgba(201,154,63,0.1);border:1px solid rgba(201,154,63,0.3);border-radius:9px;padding:9px 11px;}
.trp-addsetup-submit{flex-shrink:0;margin:0 20px 20px;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:10px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border:1px solid rgba(250,244,236,0.3);cursor:pointer;}
.trp-addsetup-submit:disabled{opacity:.45;cursor:default;}

/* draw hint bubble — shown on the map while ADD TRIP is open (bod 6) */
/* Matej 2026-07-23: hint bol hore v headri (zle) → POD search-a-place riadkom (top:120px),
   ČERVENÝ a väčší, nech je jasne vidno. Mobile override nižšie ho drží pod mobilným headerom. */
/* Lišta kreslenia (rez B) hovorí to isté čo táto bublina, a navyše nesie km, prevýšenie
   a Späť o bod. Kým je na obrazovke, bublina je zbytočná druhá hláska o tom istom.
   Triedu vešia GeometryPicker — len ON vie, či je lišta reálne mountnutá. */
/* ── HOSTITEĽ FORMULÁRA PRIDÁVANIA ─────────────────────────────────────────────────
   Jedna kópia formulára, dva tvary. Na PC je to ten istý plávajúci panel ako .trp-sidebar
   (rovnaké okraje, šírka aj sklo — keby sa rozišli, človek by videl, že sa mu panel pri
   prechode do pridávania „preskočil"); na mobile celá obrazovka (media query nižšie).
   ⚠️ Šírka MUSÍ sedieť s .trp-sidebar aj s odsadením lišty kreslenia (DRAW_BAR_CSS
   v GeometryPicker.tsx) — tri miesta, jedno číslo. */
.trp-addhost{position:absolute;top:20px;left:20px;bottom:20px;width:440px;max-width:calc(100vw - 40px);background:${T.glass};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid ${T.onDarkBorder};border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,0.55),inset 0 1px 0 rgba(245,240,228,0.06);display:flex;flex-direction:column;min-height:0;overflow:hidden;z-index:30;}
.trp-addhost.is-hidden{display:none;}

/* ── mobile-only surfaces (header/list/toggle/ADD overlay), hidden on desktop — see the
   ≤760px media query below for their real layout (bod 5 i11, bod 4 i14). ── */
.trp-mheader,.trp-mtoggle,.trp-mactions,.trp-mlist{display:none;}

/* ── map region — full-bleed, the floating panel sits on top of it ── */
.trp-mapregion{position:absolute;inset:0;z-index:0;}
.trp-mapfull{position:absolute;inset:0;z-index:0;}
.trp-mapfull .leaflet-container{width:100%;height:100%;background:#0a0a0a;}
.trp-attr{position:absolute;right:10px;bottom:10px;z-index:800;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.85);border-radius:4px;padding:2px 7px;font-size:9px;color:#333;}
/* D4 nav rework (2026-07-24, Matej): notif+messages žijú VNÚTRI status headra, odtlačené do
   jeho pravého rohu. width:auto zruší inline-layout w-full, nech je to kompaktný klaster.
   Matej 2026-07-26: margin-left:auto ZRUŠENÉ — pravý blok je teraz tretina trojdielneho headra
   (flex:1 + justify-content:flex-end), obsah = messages + bell. Auto-margin by rozbil centrovanie
   stredného klastra (zožral by celý voľný priestor a stred by ušiel doľava). */
.trp-header-notif{width:auto!important;}
.trp-headright{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:flex-end;gap:10px;}
/* pravý vertikálny ovládací stack (AllTrails vzor): štýl / zoom / poloha —
   z-index 800 musí prebiť Leaflet vlastné panes (idú až po 700). */
.trp-ctlstack{position:absolute;top:16px;right:16px;z-index:800;display:flex;flex-direction:column;align-items:flex-end;gap:10px;}
/* bod 2 (iterácia 12): Terrain/Satellite/Winter stack → JEDNO kruhové tlačidlo. Integračná vlna
   (spec-hmla.md) ho prerobila na rozbaľovací panel vrstiev (.trp-layersdd nižšie) — trigger
   ostáva vizuálne .trp-stylebtn, len teraz otvára panel namiesto priameho cyklovania. */
/* Matej 2026-08-03: „bočné tlačítka na mape +- center a vrstvy... chcelo by to dať asi tmavé
   ako aj všetko ostatné" — papyrusový stack bol na tmavej appke JEDINÝ svetlý prvok a preto
   optický ťažisko obrazovky, hoci je najmenej dôležitý. Teraz rovnaké tmavé sklo ako
   .trp-mheader a PackBottomNav (T.glass + T.onDarkBorder), ikony biele cez invert filter. */
.trp-stylebtn{width:38px;height:38px;border-radius:50%;background:${T.glass};backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid ${T.onDarkBorder};box-shadow:0 3px 10px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.trp-stylebtn:hover,.trp-stylebtn.on{border-color:${GOLD};}
.trp-stylebtn img{width:18px;height:18px;filter:brightness(0) invert(1);opacity:.82;}
/* Rozbaľovací panel vrstiev (spec-hmla.md, zdroj vzhľadu = plany/prototyp-hmla/index.html
   #layers) — nahrádza staré jedno kruhové tlačidlo Outdoor↔Satelit. Trigger si necháva vzhľad
   .trp-stylebtn, panel je tmavé sklo v rovnakom odtieni ako jediný established „dark dropdown"
   v tomto súbore (.trp-tagdd-panel) — konzistencia namiesto nového hex kódu. */
.trp-layersdd{position:relative;}
.trp-layersdd-panel{position:absolute;top:0;right:calc(100% + 10px);z-index:41;width:238px;background:rgba(6,5,3,0.94);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid ${T.onDarkBorder};border-radius:14px;box-shadow:0 16px 40px rgba(0,0,0,0.55);padding:12px;}
.trp-layersdd-group + .trp-layersdd-group{margin-top:12px;padding-top:12px;border-top:1px solid ${T.onDarkHair};}
.trp-layersdd-row{display:flex;align-items:center;gap:9px;width:100%;padding:6px 4px;font-family:${FONT_UI};font-size:12.5px;color:${T.onDark};cursor:pointer;}
.trp-layersdd-row input{accent-color:${GOLD};width:14px;height:14px;flex-shrink:0;}
.trp-layersdd-row span{flex:1;}
.trp-layersdd-row.disabled{opacity:.4;cursor:default;}
.trp-layersdd-hint{margin:0 0 6px 23px;font-family:${FONT_UI};font-size:10.5px;line-height:1.4;color:${T.onDarkDim};}
.trp-zoomgroup{display:flex;flex-direction:column;background:${T.glass};backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid ${T.onDarkBorder};border-radius:9px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,0.45);}
.trp-zoomgroup button{background:none;border:none;cursor:pointer;width:38px;height:36px;font-size:17px;font-weight:600;line-height:1;color:${T.onDark};display:flex;align-items:center;justify-content:center;}
.trp-zoomgroup button:first-child{border-bottom:1px solid ${T.onDarkHair};}
.trp-zoomgroup button:hover{background:rgba(201,154,63,0.18);}
.trp-locatebtn{width:38px;height:38px;border-radius:9px;background:${T.glass};backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid ${T.onDarkBorder};box-shadow:0 3px 10px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.trp-locatebtn:hover{border-color:${GOLD};}
.trp-locatebtn img{width:18px;height:18px;filter:brightness(0) invert(1);opacity:.78;}
.trp-locatebtn.loading img{opacity:.35;}
.trp-mapfull .leaflet-control-scale{margin-left:12px;margin-bottom:12px;}
.trp-mapfull .leaflet-control-scale-line{background:rgba(255,255,255,0.8);border-color:rgba(31,26,14,0.55);color:#2a2a2a;font-size:10px;}

/* bod 3 (iterácia 12): marker = pill (diffmark + km) alebo bodka (piktogram), ŽIADNE poradové
   číslo. Pozícia centrovaná cez left:-50%/top:-100%|-50% (dynamická šírka podľa km textu — viď
   pointIcon komentár). 2026-07-27 BUG FIX: Leaflet bez explicitného iconSize dáva divIcon-u
   default [12,12] a nastaví to ako INLINE style width/height priamo na .trp-pinwrap — preto sa
   "8.9 km" lámalo na dva riadky (pilulka mala vnútri len 12px na text). width/height auto
   !important je jediný spôsob, ako CSS trieda prebije inline style; wrapper sa tak zmrští na
   skutočný obsah, presne na čo left:-50%/top:-100% centrovanie dole spolieha. */
.trp-pinwrap{background:none;border:0;width:auto!important;height:auto!important;}
/* 2026-07-27 BUG FIX pokračovanie: aj po (1) sa "8.9 km" stále lámalo, lebo
   p,li,label,span{text-wrap:pretty} v index.css (globálny "pekné zalamovanie" reset pre bežný
   text) sedí aj na holé <span> vnútri divIcon HTML stringu a PREBÍJA zdedené white-space:nowrap
   z .trp-pill (priama deklarácia na elemente vždy vyhráva nad zdedenou, bez ohľadu na
   špecifickosť/@layer). Fix = vyššia špecifickosť ".trp-pill span" nižšie. */
.trp-pill span,.trp-dot span{white-space:nowrap;}
/* Markery na mape nesú ČÍSLA (km) v 10.5px — Cinzel serifka sa tu zlievala, Grotesk 600 má
   pri tejto veľkosti výrazne lepšiu čitateľnosť. 2026-07-27: štýl A z prototypu (tmavá glass +
   zlatý lem) — plná zlatá sa šetrí len na hot/vybraté (a len pre bežný, nie journey/water typ). */
.trp-pill{position:relative;transform:translate(-50%,-100%);display:inline-flex;align-items:center;gap:5px;background:linear-gradient(180deg,rgba(23,20,14,.94),rgba(11,9,6,.94));color:#F6F1E4;font-family:${FONT_UI};font-weight:600;font-size:10.5px;padding:5px 9px 5px 7px;border-radius:999px;border:1px solid rgba(201,154,63,0.55);box-shadow:0 2px 7px rgba(0,0,0,0.34);white-space:nowrap;transition:all .15s;}
/* ⚠️ 2026-08-20 — POD MYŠOU JE PILULKA BIELA, nie zlatá (Matej: „pri prejdení myšou na
   náročnosť/alebo trasu sa pill s km zmení na bielu nie žltú"). Zlatá na mape ostáva
   len tam, kde nesie brand (lem), nie ako signál stavu — ten dnes nesie rozsvietený meč.
   Prsteň je fialový, nech je pilulka viditeľne spojená s trasou, ktorá sa zároveň rozsvieti. */
.trp-pill.hot{background:linear-gradient(180deg,#FFFFFF,#F2ECE0);color:#1c160c;border-color:rgba(122,47,191,0.55);box-shadow:0 0 0 3px rgba(179,107,255,0.35),0 4px 12px rgba(0,0,0,0.5);}
/* diaľkové (journey) — 2026-07-27: #E01B22 → stlmená bordová (Matej "stlmiť odtiene"); voda
   ostáva jasne modrá (.trp-pill--water nižšie), lebo stlmenie by oslabilo novú asociáciu. */
/* Matej 2026-07-27: „ten piktogram by sme mohli zväčšiť — nech vyzerá dôležito, vzácne, teraz je
   nenápadný". Diaľkové sú na mape rarita (10 z 67) a jediné nesú km aj z diaľky → väčšie písmo,
   viac priestoru, plný zlatý prsteň (bežné pilulky majú lem na 55 % — zlatý RING je vyhradený
   práve im) a väčší trojuholník náročnosti. */
.trp-pill--journey{background:linear-gradient(135deg,#8C1C22,#4a0f13);color:#fff;font-size:11.5px;padding:5px 10px 5px 8px;gap:6px;border-width:1.5px;border-color:${GOLD};box-shadow:0 0 0 2px rgba(201,154,63,0.20),0 3px 10px rgba(0,0,0,0.42);}
/* ⚠️ FARBU PÍSMA MUSIA OBE VÝNIMKY VRÁTIŤ SPÄŤ NA BIELU. Trieda .trp-pill.hot nastavuje tmavý
   inkoust (patrí k bielej výplni), ale magistrála a vodná plocha si pod myšou necháva
   SVOJU tmavú výplň — a keďže color v ich .hot vetve nebol, zdedil sa tmavý a text
   na bordovej/modrej zmizol (Matej 2026-08-20: „pri prejdení myšou na magistrálu sa text
   začierni a nie je dobre vidno"). Rovnaká pasca čaká každú ďalšiu farebnú výnimku:
   keď preberáš background, prevezmi aj color. */
.trp-pill--journey.hot{background:linear-gradient(135deg,#8C1C22,#4a0f13);color:#fff;border-color:#fff;box-shadow:0 0 0 4px rgba(179,107,255,0.45),0 4px 14px rgba(0,0,0,0.6);}
.trp-pill--journey .trp-diffmark--triangle{border-bottom-color:#fff;border-left-width:5.5px;border-right-width:5.5px;border-bottom-width:10px;}
.trp-pill--journey .trp-diffmark--circle,.trp-pill--journey .trp-diffmark--square{background:#fff;}
/* vodná plocha — bez stlmenia (zadanie 2.5). Väčšina plôch nemá km → pilulka nesie NÁZOV
   (viď pointIcon), vlnky vo vnútri = rovnaká krivka ako pôvodný .trp-waterdot. */
.trp-pill--water{background:${WATER_COLOR};color:#fff;border-color:rgba(255,255,255,0.55);}
.trp-pill--water.hot{background:${WATER_COLOR};color:#fff;border-color:#fff;box-shadow:0 0 0 3px rgba(46,111,214,0.35),0 4px 12px rgba(0,0,0,0.6);}
/* bodka (z<=9, zadanie 2.3) — 17px kruh, rovnaký glass+zlatý lem ako pilulka, len piktogram. */
.trp-dot{position:relative;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;width:17px;height:17px;border-radius:50%;background:linear-gradient(180deg,rgba(23,20,14,.94),rgba(11,9,6,.94));border:1px solid rgba(201,154,63,0.55);box-shadow:0 2px 6px rgba(0,0,0,0.32);transition:transform .12s;}
.trp-dot.hot{background:linear-gradient(180deg,#FFFFFF,#F2ECE0);border-color:rgba(122,47,191,0.6);box-shadow:0 0 0 2px rgba(179,107,255,0.3),0 2px 6px rgba(0,0,0,0.4);}
.trp-dot--journey{background:linear-gradient(135deg,#8C1C22,#4a0f13);border-color:rgba(201,154,63,0.5);}
.trp-dot--journey.hot{background:linear-gradient(135deg,#8C1C22,#4a0f13);border-color:#fff;}
.trp-dot--journey .trp-diffmark--triangle{border-bottom-color:#fff;}
.trp-dot--journey .trp-diffmark--circle,.trp-dot--journey .trp-diffmark--square{background:#fff;}
/* vodná bodka — zachováva pôvodný .trp-waterdot hover-pop (jediný CSS :hover efekt v pôvodnom
   kóde), teraz na zdieľanej .trp-dot základni. */
.trp-dot--water{background:${WATER_COLOR};border-color:rgba(255,255,255,0.55);}
.trp-dot--water:hover{transform:translate(-50%,-50%) scale(1.12);}
.trp-dot--water.hot{background:${WATER_COLOR};border-color:#fff;}
/* zhluk (zadanie 2.4) — rovnaký glass+zlatý lem, veľkosť rastie s počtom bodov (clusterIcon). */
.trp-cluster{position:relative;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;border-radius:999px;font-family:${FONT_UI};font-weight:600;color:#F6F1E4;background:linear-gradient(180deg,rgba(23,20,14,.95),rgba(11,9,6,.95));border:1px solid rgba(201,154,63,0.6);box-shadow:0 3px 12px rgba(0,0,0,0.45);cursor:pointer;transition:transform .12s;}
.trp-cluster:hover{transform:translate(-50%,-50%) scale(1.09);}
/* Farebná legenda mapy (.trp-legend / .trp-legrow / .trp-legdot) ZRUŠENÁ 2026-08-03 —
   Matej: „a folný blok s legendami daj preč celkom". Zaberala 126×93 px vpravo dole a na
   mobile kolidovala s atribúciou aj spodnou navigáciou. Ak by farby niekedy bolo treba
   vysvetliť, patrí to do Filters sheetu (.trp-msheet), nie ako trvalý blok na mapu. */
/* bod 2 (iterácia 17): live "{km} km" label pri konci kreslenej trasy (ADD flow draw) —
   rovnaká centrovacia technika ako .trp-pill (left:-50%/top:-100%), o kúsok vyššie (-10px
   extra gap), nech nesedí priamo na poslednom bode trasy. */
.trp-drawlabel{position:relative;transform:translate(-50%,calc(-100% - 10px));background:rgba(6,5,3,0.92);color:${GOLD};font-family:${FONT_UI};font-weight:600;font-size:10.5px;padding:4px 10px;border-radius:999px;border:1.5px solid ${GOLD};box-shadow:0 3px 10px rgba(0,0,0,0.5);white-space:nowrap;}
${DIFF_MARK_CSS}
${TRAIL_LINE_CSS}

/* ── desktop: floating bottom nav stays CENTERED (PackBottomNav default —
   left:50%/translateX untouched); only its bottom offset is pinned so it
   lines up with the floating panel's bottom edge (both 20px). Scoped under
   .trp-root so it never touches other /pack pages. ── */
@media (min-width:1024px){
  .trp-root .fixed.z-40{ bottom:20px !important; }
}

/* ── KOMPAKTNÝ DESKTOP 1024–1400px (Matej 2026-07-27) ───────────────────────
   Príčina pôvodného rozbitia: .trp-topbar mal natvrdo left:480px (= 440px panel
   + marginy) a right:180px. Pri okne 1000px ostalo topbaru 340px, pri 800px len
   140px → status riadok (LEVEL + pilulky + ADD TRIP + ikonky) sa zalomil do
   stĺpca a natiekol na mapu. Tu sa panel zúži na 360px, topbar sa odvodí od
   NEHO (žiadne pevné 480), a labely, ktoré nesú info aj bez textu (Triplist =
   clipboard ikonka, „Add trip" → „Add"), sa skrátia. Nad 1400px = plný layout. */
@media (min-width:1024px) and (max-width:1400px){
  .trp-sidebar{width:360px;}
  .trp-addhost{width:360px;}
  .trp-topbar{left:400px;right:74px;}
  .trp-status-row{gap:10px;padding:11px 14px;}
  .trp-status-center{gap:7px;flex-wrap:nowrap;}
  .trp-status-row .trp-stat-pill{padding:8px 12px;}
  .trp-status-row .trp-stat-pill span,.trp-status-row .trp-stat-pill b{font-size:11.5px;}
  /* Triplist = len clipboard ikonka (route je rovnaká, title/aria label ostáva). */
  .trp-status-row .trp-triplist-label{display:none;}
  .trp-status-row .trp-stat-pill--icon{padding:8px 10px;}
  .trp-status-row .trp-addtrip-btn{padding:8px 12px;font-size:10px;}
  .trp-status-row .trp-addtrip-full{display:none;}
  .trp-status-row .trp-addtrip-short{display:inline;}
  .trp-headright{gap:6px;}
  .trp-topsearchrow{gap:8px;}
  .trp-floatsearch{flex:1 1 160px;min-width:140px;}
  .trp-toprow-select,.trp-tagdd-btn{flex:1 1 100px;min-width:92px;padding:9px 11px;font-size:12px;}
}

/* ── mobile (≤760px) — bod 5, iterácia 11: map-first + LIST/MAP toggle +
   full-width liquid-glass header. Nahradzuje starý floating .trp-topbar
   (skrytý) a starý bottom-sheet .trp-sidebar (skrytý — inline DETAIL/ADD sú
   desktop-only, mobile detail ide priamo na full-page článok — PackTripArticle,
   iterácia 12 bod 5). Nav stays centered + fixed, untouched (PackBottomNav
   default). ── */
@media (max-width:1023px){
  .trp-topbar{display:none;}
  .trp-sidebar{display:none;}

  /* bod 1 (iterácia 13): 78px → 122px — header je 2-riadkový (status + search row), ctlstack/
     drawhint musia začínať POD ním. Matej 2026-07-27: header sa zúžením statusu na jeden riadok
     a náhradou 3 selectov jednou „Filters" pilulkou zmenšil na ~95px → 122 → 106 (95 + medzera). */
  /* 106 → 118 px spolu s padding-bottom hlavičky (10 → 22). Tieto dve čísla idú vždy
     spolu: ovládanie mapy visí PRÁVE POD hlavičkou a keby ostalo na 106, vliezlo by do
     hľadacieho riadku, ktorý sme práve odlepili od hrany. */
  .trp-ctlstack{top:calc(env(safe-area-inset-top,0px) + 118px);right:12px;gap:7px;}

  .trp-stylebtn{width:34px;height:34px;}
  .trp-stylebtn img{width:16px;height:16px;}
  .trp-layersdd-panel{width:206px;padding:10px;}
  .trp-zoomgroup button{width:34px;height:32px;font-size:15px;}
  .trp-locatebtn{width:34px;height:34px;}
  .trp-locatebtn img{width:16px;height:16px;}

  /* 2026-08-22: text mal white-space:nowrap a kontajner sa nezalamoval, takže na 430 px
     vytlačil tlačidlo HOTOVO za pravý okraj bubliny AJ za okraj obrazovky (merané: bublina
     končila na 410 px, tlačidlo bežalo 391→436). Do zámku obrazovky je táto bublina jediný
     viditeľný únik z režimu kreslenia — únik za okrajom je pasca. Zalomenie namiesto nowrap.
     (Bublina ako celok zaniká v reze B, kde ju nahradí spodná lišta s HOTOVO.) */

  /* bod 1 (iterácia 13, prestavané i15): mobilný header = 2 riadky — (1) status (avatar +
     renderStatusRight() pilulky, ako desktop .trp-status-row) + (2) search+dropdowny+filter
     (i12 bod 7). .trp-mheader je teraz column namiesto jedného riadku. */
  /* issue #51 (Matej: efekt z Instagramu) — mapa/obsah pod headrom sa má strácať plynulo,
     bez ostrej hrany. border-bottom (1px hard line presne na okraji blur vrstvy) nahradený
     mask-image na TOMTO ISTOM existujúcom blur elemente: posledných ~12% výšky plynulo stmavne
     do priehľadna. Žiadny nový blur layer navyše (drahé na starších telefónoch).

     ⚠️ OPRAVENÉ 2026-08-22 (Matej: „hlavička je divná, pod textovým poľom nie je takmer vôbec
     okraj, je na hrane hlavičky"). Komentár tu tvrdil, že v blednúcej zóne „žiadny reálny UI
     prvok nesedí" — bola to nemeraná domnienka. Odmerané na 430 px: hlavička 99,3 px, spodok
     hľadacieho riadku 89,3 px, maska začína blednúť na **87,3 px** ⇒ posledné 2 px poľa boli
     priehľadné a pole vyzeralo prilepené na hranu.
     padding-bottom 10 → 22 px: hlavička 111 px, maska začína na ~98 px, teda 9 px POD poľom
     a v zóne naozaj nič nie je. Keď do hlavičky pribudne riadok, ČÍSLA PREMERAJ ZNOVA —
     percento masky sa počíta z výšky, takže sa posunie samo. */
  .trp-mheader{display:flex;flex-direction:column;gap:8px;position:absolute;top:0;left:0;right:0;z-index:900;background:${T.glass};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);padding:calc(env(safe-area-inset-top,0px) + 10px) 10px 22px;mask-image:linear-gradient(to bottom, black 0%, black 88%, transparent 100%);-webkit-mask-image:linear-gradient(to bottom, black 0%, black 88%, transparent 100%);}
  /* Matej 2026-08-03 („na mobil je toho veľa"): riadok 1 UŽ NIE JE rad piatich pilulek
     v horizontálnom scrolli, ale IDENTITA vľavo ↔ notifikácie vpravo. Preto space-between
     a žiadny overflow-x — už niet čo scrollovať, obsah sa vždy zmestí. */
  .trp-mheader-status{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:nowrap;}
  .trp-mheader-status .trp-headright{gap:5px;flex:0 0 auto;justify-content:flex-end;}
  /* PackNotifications má rozmery v inline style (38px) → prebiť sa dá len !important. */
  .trp-mheader-status .trp-header-notif button{width:32px!important;height:32px!important;}
  /* Identita samotná je v GLOBÁLNOM CSS vyššie (.trp-midentity a spol.) — jeden blok na oboch
     šírkach. Tu ostáva len to, čo je naozaj mobilné: na mobile ide identita cez celú voľnú šírku. */
  .trp-mheader-status .trp-midentity{flex:1 1 auto;}
  /* Riadok 2 (Matej 2026-07-27, prestavané): predtým tu boli 3 natívne selecty
     (Activities/Difficulty/Crowd) v horizontálnom scrolli — a country, región a Tagy sa na
     mobile NEZOBRAZOVALI VÔBEC (žijú v .trp-sidebar / .trp-topbar, oboje display:none).
     Teraz: search + jedna „Filters · N" pilulka, ktorá otvára .trp-msheet so VŠETKÝMI
     filtrami (country, región, activity, difficulty, crowd, tagy, sort). */
  .trp-mheader-row2{display:flex;align-items:center;gap:8px;}
  .trp-mheader .trp-mapsearch{flex:1 1 auto;min-width:0;padding:7px 12px;border-radius:999px;}
  .trp-mheader .trp-mapsearch img{width:12px;height:12px;}
  /* NEZNIŽOVAŤ POD 16 px — viď pravidlo pri .trp-mapsearch input vyššie. */
  .trp-mfilterwrap{position:relative;flex:0 0 auto;}
  .trp-mfilterbtn{display:flex;align-items:center;gap:7px;padding:7px 13px;border-radius:999px;background:${T.glassSoft};border:1px solid ${T.onDarkBorder};color:${T.onDark};font-family:${FONT_UI};font-weight:500;font-size:11.5px;white-space:nowrap;cursor:pointer;}
  .trp-mfilterbtn img{width:14px;height:14px;filter:brightness(0) invert(1);opacity:.8;}
  .trp-mfilterbtn.on{border-color:${GOLD};color:${GOLD};}
  .trp-mfilterbtn.on img{filter:none;opacity:1;}

  /* ── FILTER SHEET (bottom sheet) — AllTrails vzor. Tmavý glass povrch, lebo stojí nad
     mapou (rovnaká vrstva ako .trp-mheader), nie papyrus. z-index nad .trp-mheader (900). */
  .trp-msheet-back{position:fixed;inset:0;z-index:960;background:rgba(0,0,0,0.55);backdrop-filter:blur(2px);}
  .trp-msheet{position:fixed;left:0;right:0;bottom:0;z-index:961;display:flex;flex-direction:column;max-height:86vh;background:rgba(10,9,6,0.97);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-top:1px solid ${T.onDarkBorder};border-radius:20px 20px 0 0;box-shadow:0 -18px 50px rgba(0,0,0,0.6);padding-bottom:env(safe-area-inset-bottom,0px);}
  .trp-msheet-grab{width:38px;height:4px;border-radius:999px;background:rgba(245,240,228,0.22);margin:9px auto 2px;flex:0 0 auto;}
  .trp-msheet-head{display:flex;align-items:center;justify-content:space-between;padding:8px 18px 12px;flex:0 0 auto;}
  .trp-msheet-title{font-family:${FONT_TITLE};font-weight:700;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:${GOLD};}
  .trp-msheet-x{width:30px;height:30px;border-radius:50%;background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:15px;line-height:1;cursor:pointer;}
  .trp-msheet-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:0 18px 16px;display:flex;flex-direction:column;gap:15px;}
  .trp-msheet-field{display:flex;flex-direction:column;gap:6px;}
  .trp-msheet-pair{display:flex;gap:10px;}
  .trp-msheet-pair .trp-msheet-field{flex:1 1 0;min-width:0;}
  .trp-msheet-label{font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};}
  .trp-msheet-select{width:100%;min-width:0;background:rgba(245,240,228,0.06);border:1px solid ${T.onDarkBorder};border-radius:10px;padding:11px 12px;color:${T.onDark};font-family:${FONT_UI};font-size:13px;cursor:pointer;outline:0;}
  .trp-msheet-select:focus{border-color:${GOLD};}
  .trp-msheet-chips{display:flex;flex-wrap:wrap;gap:7px;}
  .trp-msheet-chip{display:inline-flex;align-items:center;gap:5px;padding:8px 12px;border-radius:999px;background:rgba(245,240,228,0.06);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-family:${FONT_UI};font-size:12px;cursor:pointer;}
  .trp-msheet-chip.on{border-color:${GOLD};color:${GOLD};background:rgba(201,154,63,0.16);font-weight:600;}
  /* Sticky pätka — Clear (ghost) + SHOW N (brand gold CTA, radius 8, .btn-gold lock). */
  .trp-msheet-foot{flex:0 0 auto;display:flex;align-items:center;gap:10px;padding:12px 18px 16px;border-top:1px solid ${T.onDarkHair};background:rgba(10,9,6,0.97);}
  .trp-msheet-clear{flex:0 0 auto;padding:12px 18px;border-radius:8px;background:none;border:1px solid ${T.onDarkBorder};color:${T.onDarkDim};font-family:${FONT_UI};font-weight:600;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;}
  .trp-msheet-clear:disabled{opacity:.4;cursor:default;}
  .trp-msheet-show{flex:1 1 auto;padding:12px 18px;border-radius:8px;background:linear-gradient(135deg,#F5C73D,#E69E1A);border:1px solid rgba(250,244,236,0.30);color:${INK};font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;}

  /* LIST/MAP toggle pill, bottom-center — default view = map (žiadny
     bottom-sheet defaultne), klik prepína celú stránku na zoznam.
     2026-08-03: (1) posunuté vyššie — 78px nechávalo nad spodnou navigáciou 8 px, čo čítalo
     ako preklep, nie ako medzera (Matej: „Posuň vyššie"); (2) pribudla ikonka pred text
     (Matej: „pri tlačítkach LIST a MAP dolu treba pridať ikonky MAP = map location interface
     a LIST: menu lines (z brand manuálu)") — obe SVG sú z vstupy/vizualna-identita/
     "Icons hand drawn", skopírované do public/icons/pack/ ako map.svg + menu.svg.
     Ikonka je ČIERNA na zlatom (nie invert) — pilulka je .btn-gold vzor, tmavý ink na zlate. */
  /* Matej 2026-08-03 (druhé kolo): „LIST/MAP posuň dolu o polovicu a urob to tak že hned vedla
     pridaj tlačítko ADD aby boli vedľa seba a obidve centruj aby boli nad NAV panelom".
     ADD teda UŽ NIE JE roh-FAB — obe tlačidlá sedia v jednom centrovanom páre. Posun dole
     o polovicu = 96 → 87px (predtým 78, čo nechávalo nad navom 8px). */
  .trp-mactions{display:flex;align-items:center;justify-content:center;gap:10px;position:absolute;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 87px);z-index:900;}
  /* 2026-08-22: dve tlačidlá vedľa seba robili DVE RÔZNE veci a vyzerali IDENTICKY — obe zlatá
     pilulka 999px, rovnaká výplň, rovnaká veľkosť. Rozdelené podľa toho, čo sú zač:
       · .trp-mfab = CTA „pridaj výlet" → vzor .btn-gold (LOCK): radius 8 + zlatý dosvit.
       · .trp-mtoggle = prepínač pohľadu (LIST/MAP) → ostáva pilulka BEZ dosvitu; nie je to
         výzva k akcii, je to prepínač, a tvar aj halo ho teraz odlišujú na prvý pohľad.
     Farbu prepínača zámerne NEMENÍM — to by bolo ďalšie rozhodnutie nad rámec zadania. */
  .trp-mtoggle,.trp-mfab{display:flex;align-items:center;justify-content:center;gap:8px;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:11px 24px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border:1px solid rgba(250,244,236,0.3);cursor:pointer;white-space:nowrap;}
  .trp-mtoggle{border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,0.4);}
  /* PRIDAŤ JE FIALOVÉ (Matej 2026-08-23: „tlačítko pridať by sme mohli dať fialovým výrazným").
     Fialová je v mape farba TRASY (svetelný meč) — tlačidlo, ktorým sa do mapy zapisuje, tak
     hovorí tým istým jazykom ako to, čo z neho vznikne. Zároveň to rozviazalo starý spor
     „ZOZNAM aj PRIDAŤ sú obe zlaté": prepínač pohľadu ostáva zlatá pilulka, akcia je fialová,
     a rozdiel je vidno na prvý pohľad bez toho, aby sa musel meniť aj prepínač. */
  /* ⚠️ TMAVÁ, NIE SVIETIVÁ (Matej 2026-08-23: „tú fialovú treba zmeniť za viac tmavé, lebo
     to vyzerá hrozne"). Svetlá fialová #B36BFF je farba ČIARY na mape — na ploche tlačidla
     z nej bola neónová škvrna vedľa zlatého prepínača. Tmavý koniec tej istej rodiny
     drží príbuznosť s trasou, ale správa sa ako povrch. */
  .trp-mfab{border-radius:8px;background:linear-gradient(135deg,#4A1580,#2A0B4D);color:#EADCFF;border:1px solid rgba(179,107,255,0.45);box-shadow:0 10px 30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.10);}
  .trp-mfab:hover{border-color:rgba(179,107,255,0.75);}
  .trp-mfab:active{transform:scale(0.98);}
  .trp-mtoggle img{width:15px;height:15px;flex:0 0 auto;filter:brightness(0);opacity:.82;}
  .trp-mfab img{width:15px;height:15px;flex:0 0 auto;filter:brightness(0) invert(1);opacity:.85;}

  /* hlavička LIST pohľadu — sem sa presťahoval TRIPLIST z mapového headera. V zozname dáva
     zmysel (je to zoznamový povrch), v headeri mapy bol len ďalšia ikonka v rade. */
  .trp-mlist-head{display:flex;align-items:center;justify-content:flex-end;margin-bottom:12px;}
  .trp-mlist-triplist{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;background:${T.glass};border:1px solid ${T.onDarkBorder};color:${T.onDark};font-family:${FONT_UI};font-weight:600;font-size:11px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;}
  .trp-mlist-triplist img{width:13px;height:13px;filter:brightness(0) invert(1);opacity:.8;}

  /* full-page card list — replaces the map (not an overlay) when mobileView==='list'.
     top padding sedí s výškou .trp-mheader (viď .trp-ctlstack vyššie). */
  .trp-mlist{position:absolute;inset:0;z-index:60;overflow-y:auto;background:#050505;padding:calc(env(safe-area-inset-top,0px) + 106px) 14px 150px;}
  .trp-root.mlist-active .trp-mapregion{display:none;}
  .trp-root.mlist-active .trp-mlist{display:block;}
  /* BUG FIX 2026-08-03 (Matej: „pri otvorenom liste zmizne spodný NAV! skontroluj to"):
     PackBottomNav je fixed z-40 a je SÚRODENEC .trp-mlist vnútri .trp-root — čiže v tom istom
     stacking kontexte. .trp-mlist má z-index:60 a NEPRIEHĽADNÉ pozadie (#050505) cez celý inset:0,
     takže navigáciu jednoducho prekryl. position:fixed proti tomu nechráni, o poradí rozhoduje
     len z-index v spoločnom kontexte. Dvíham nav na 100: nad zoznam (60), ale pod pár tlačidiel
     (.trp-mactions 900) aj pod modaly (.trp-addhost 950, .trp-msheet), nech sa poradie inde nemení.
     Padding-bottom zoznamu zároveň 100 → 150px, aby posledná karta neskončila pod navom. */
  .trp-root > nav.fixed{z-index:100;}

  /* PRIDÁVANIE NA MOBILE = CELÁ OBRAZOVKA. Ten istý prvok ako na PC, len iný tvar —
     dve kópie formulára tu stáli do 23. 8. a rozišli sa hneď, ako pribudol autosave. */
  .trp-addhost{position:fixed;inset:0;top:0;left:0;width:auto;max-width:none;border:0;border-radius:0;box-shadow:none;background:#0a0a0a;backdrop-filter:none;-webkit-backdrop-filter:none;z-index:950;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);}
  .trp-addhost .trp-addsetup{background:transparent;}
}

`;

// ── VRSTVY MAPY (spec-hmla.md §1/§9) — deklaratívne pole, NIE natvrdo naklikané JSX ──────────
// Panel sa vygeneruje z MAP_LAYERS (filter podľa `type`), takže pridanie ďalšej vrstvy (veteriny,
// fotky komunity — spomenuté v zadaní ako budúci prípad) je jeden nový objekt v poli, nie prepis
// JSX. PODKLAD (base) je vždy PRÁVE JEDEN aktívny (radio); OVERLAY (overlay) sa dá zapnúť viac
// naraz (checkbox).
type MapBaseId = 'outdoor' | 'aerial' | 'dogypt';
type MapOverlayId = 'names' | 'vipers' | 'threats';

/** Kontext, ktorý layer potrebuje na vyhodnotenie `disabledReason` — fog stav (prázdny/loading,
 *  spec §4 bod 4) + `isCleanMode` (Matej 2026-08-04: „pri DOGYPT zobrazení bude vidno iba hmla
 *  a svetelné meče... žiadne písmo ani vysvetlivky" — v DOGYPT podklade sa overlaye NEDAJÚ
 *  zapnúť, sú to práve tie „legendy a ikonky"). Pri ďalšej vrstve sa pole rozšíri, nie prepíše. */
interface MapLayerCtx {
  fogTrailsCount: number;
  fogLoading: boolean;
  isCleanMode: boolean;
}
interface MapLayerDef {
  id: MapBaseId | MapOverlayId;
  type: 'base' | 'overlay';
  /** i18n kľúč labelu — žiadny natvrdo napísaný SK/EN reťazec v JSX. */
  labelKey: string;
  /** i18n kľúč dôvodu nedostupnosti (runtime vyhodnotené), vráti null keď je layer dostupný.
   *  Nie je to statická vlastnosť poľa — hmla je prázdna/plná podľa DB stavu, nie podľa configu. */
  disabledReason?: (ctx: MapLayerCtx) => string | null;
}
const MAP_LAYERS: MapLayerDef[] = [
  { id: 'outdoor', type: 'base', labelKey: 'pack.map.layerOutdoor' },
  { id: 'aerial', type: 'base', labelKey: 'pack.map.layerAerial' },
  {
    id: 'dogypt',
    type: 'base',
    labelKey: 'pack.map.layerDogypt',
    // 🔴 spec-hmla.md bod 4 zadania: na produkcii je `trip_walked` dnes 0 riadkov — bez tohto
    // guardu by DOGYPT vrstva bola čierna plachta cez celú SR hneď pri prvom kliku. Loading aj
    // prázdny stav sa NESMÚ dať zapnúť (žiadny blikajúci prechod do čiernej).
    disabledReason: (ctx) => {
      if (ctx.fogLoading) return 'pack.map.layerDogyptLoading';
      if (ctx.fogTrailsCount === 0) return 'pack.map.layerDogyptEmpty';
      return null;
    },
  },
  {
    id: 'names',
    type: 'overlay',
    labelKey: 'pack.map.layerNames',
    // DOGYPT čistý vizuál (zadanie vyššie) — overlay ostáva VIDITEĽNÝ v paneli, len nedostupný,
    // nech si užívateľ nemyslí, že mu zmizol. Skutočný stav (zapnuté/vypnuté) sa NEMENÍ, len sa
    // ignoruje pri kreslení (viď `isCleanMode` pri <TileLayer names-overlay>) —
    // po návrate na Outdoor/Satelit je teda presne taký, aký bol pred vstupom do DOGYPT.
    disabledReason: (ctx) => (ctx.isCleanMode ? 'pack.map.overlayDogyptDisabled' : null),
  },
  {
    // HROZBY OD SVORKY — upozornenia, ktoré napísali členovia.
    // Matej 2026-08-22: „ano vrstva mapy - hrozby clekovo neskôr môžme dať
    // dropdown na jednotlivé hrozby."
    //
    // JEDEN vypínač na všetkých deväť druhov, nie deväť zaškrtávadiel. Deväť
    // položiek na telefóne je vlastná zapratná plocha a pri dnešnom objeme dát
    // by sa nepoužili; rozpad na druhy má zmysel až keď niektorý (typicky
    // kliešte) narastie natoľko, že ho treba izolovať. Dovtedy by to bol výber
    // bez obsahu.
    //
    // Vretenice majú vlastný vypínač zámerne — je to CUDZÍ dataset a človek,
    // ktorý si vypína výstrahy svorky, nemusí chcieť prísť aj o ne (a naopak).
    id: 'threats',
    type: 'overlay',
    labelKey: 'pack.map.layerThreats',
    disabledReason: (ctx) => (ctx.isCleanMode ? 'pack.map.overlayDogyptDisabled' : null),
  },
  {
    // VÝSKYT VRETENICE — cudzí dataset, hrubé oblasti (viď `data/viperAreas.ts`).
    // Je to overlay, nie natvrdo kreslená vrstva: červená plocha cez pol krajiny
    // je silné tvrdenie a človek ju musí vedieť vypnúť. V DOGYPT čistom vizuáli
    // sa nekreslí z toho istého dôvodu ako názvy — tam nesmie byť nič okrem hmly
    // a svetelných mečov.
    id: 'vipers',
    type: 'overlay',
    labelKey: 'pack.map.layerVipers',
    disabledReason: (ctx) => (ctx.isCleanMode ? 'pack.map.overlayDogyptDisabled' : null),
  },
];
// Overlaye majú default stav mimo poľa (pole je o TOM ČO existuje, nie o tom čo je dnes zapnuté).
// ⚠️ `poi` odtiaľto ZMIZOL 2026-08-21 spolu s vrstvou (viď render <MapContainer>): prepínač na
// vrstvu, ktorá sa nekreslí, je mŕtve tlačidlo — klik prejde bez chyby a neurobí nič.
// `vipers: true` — Matej si vrstvu vypýtal NA mapu, nie do ponuky. Zapnutá je
// bezpečná preto, že sa kreslí len pri oddialení (VIPER_MAX_ZOOM); pri práci
// s konkrétnou trasou zmizne sama.
// `threats: true` — upozornenia svorky sú dôvod, prečo vrstva zápisov existuje;
// vypínač je tu na to, aby si ich človek vedel odpratať, nie aby si ich musel
// hľadať.
const OVERLAY_DEFAULTS: Record<MapOverlayId, boolean> = { names: false, vipers: true, threats: true };

// Satelit (aerial) má dlaždice len do z19 na SK / z13 vo svete (overené v Mapy.com API
// dokumentácii, spec-hmla.md bod 5 zadania) — nad tým dlaždica NEEXISTUJE a mapa sa vysype na
// prázdno. `maxNativeZoom` je štandardný Leaflet fix: nad hranicou sa nežiadajú nové dlaždice,
// posledná dostupná sa len roztiahne — vybrané NAMIESTO tvrdého zoom-clampu, lebo by inak
// používateľovi zamrzlo tlačidlo +/gesto priblíženia presne na hranici. Mapa dnes efektívne
// necháva max zoom na Leaflet defaulte z <TileLayer> (18), takže ide o poistku do budúcna
// (keby sa raz zvýšil), nie o opravu okamžite viditeľnej chyby.
const AERIAL_MAX_NATIVE_ZOOM = 19;

// Telemetria výpadku dlaždíc. Leaflet strieľa `tileerror` PER DLAŽDICU, takže pri vyčerpanej
// kvóte Mapy.com alebo referrer-locku by jedno otvorenie mapy poslalo desiatky až stovky
// eventov — z merania by sa stal spam a z PostHogu účet navyše. Zaujíma nás, ŽE vrstva padá,
// nie koľko štvorčekov: prvý pád danej vrstvy sa hlási hneď, ďalšie sa tichnú na minútu.
// ⚠️ `style` je NÁZOV štýlu (`outdoor`), NIE URL dlaždice — `mapyTiles()` má v query
// `apikey=`, takže poslať sem URL by vynieslo kľúč Mapy.com do PostHogu a cez
// `window.dataLayer` aj do GTM/GA4/Pixelu. Kľúč je síce v bundli tak či tak, ale
// rozposielať ho tretím stranám nemá dôvod.
const TILE_ERR_MUTE_MS = 60_000;
const tileErrLast = new Map<string, number>();
function trackTileError(style: string, layer: string) {
  const key = `${layer}:${style}`;
  const now = Date.now();
  const last = tileErrLast.get(key) ?? 0;
  if (now - last < TILE_ERR_MUTE_MS) return;
  tileErrLast.set(key, now);
  track('map_tile_error', { style, layer });
}

// Fade prahy zdieľané s <FogLayer/> DEFAULTS (fadeStart/fadeEnd) — spec §1 bod 4: podklad AJ
// hmla sa majú rozplývať SPOLU. FogLayer.tsx je mimo rozsahu tejto úlohy (viď zadanie, dotýkať sa
// smie len bod so zdieľaným metersPerPixel), takže hodnoty tu NIE sú importované, len ručne
// zosynchronizované — ak sa raz zmenia default v FogLayer.tsx, treba zmeniť aj tieto dve čísla.
const DOGYPT_FADE_START = 13;
const DOGYPT_FADE_END = 15;

// DOGYPT podklad = invert (spec-hmla.md §5) — DRUHÁ kópia tých istých dlaždíc vo vlastnom pane
// `fx` (zIndex 250: nad tilePane 200, pod overlayPane 400, teda pod markermi/trasami aj pod
// hmlou samotnou). CSS filter je NA PLNO stále, prelína sa VÝHRADNE opacitou vrstvy — priamo
// interpolovať invert() sa nedá (invert(0.5) je šedá kaša, overené v prototype). Rovnaké URL ako
// spodná (neupravená) vrstva — POZOR, toto NIE JE zadarmo cez browser cache (overené 22.8.2026:
// api.mapy.com neposiela Cache-Control/ETag/Expires na tile endpointe), takže bez `sw-maptiles.js`
// (viď public/, registrovaný v main.tsx) by táto vrstva sťahovala každú dlaždicu ešte raz z platenej
// API kvóty. Cache-vrstva je service-worker, nie tu — nemeň URL schému bez overenia dopadu na ňu.
function DogyptBaseLayer({ url, style }: { url: string; style: string }) {
  const map = useMap();

  useEffect(() => {
    if (!map.getPane('fx')) map.createPane('fx');
    const pane = map.getPane('fx')!;
    pane.style.zIndex = '250';
    pane.style.pointerEvents = 'none';
    pane.style.filter = 'invert(1) hue-rotate(180deg) saturate(0.15) brightness(0.69) contrast(.95)';

    const layer = L.tileLayer(url, { pane: 'fx', opacity: 0 }).addTo(map);
    layer.on('tileerror', () => trackTileError(style, 'fx'));
    const applyFade = () => {
      const z = map.getZoom();
      const fade = DOGYPT_FADE_END <= DOGYPT_FADE_START
        ? (z >= DOGYPT_FADE_END ? 0 : 1)
        : 1 - Math.min(1, Math.max(0, (z - DOGYPT_FADE_START) / (DOGYPT_FADE_END - DOGYPT_FADE_START)));
      layer.setOpacity(fade);
    };
    applyFade();
    map.on('zoomend', applyFade);

    return () => {
      map.off('zoomend', applyFade);
      map.removeLayer(layer);
      // akceptačné kritérium (spec §10): prepnutie preč nesmie nechať zvyšok na mape. Leaflet
      // nemá verejné removePane, tak pane ostáva v DOM, ale prázdny a bez filtra — vizuálne aj
      // funkčne nulový, presne ako v prototype (`applyTreatment()`: `pane.style.filter = ''`).
      pane.style.filter = '';
    };
  }, [map, url]);

  return null;
}

// Rozbaľovací panel vrstiev — vygenerovaný z MAP_LAYERS (žiadne natvrdo napísané riadky).
// Vzor (trigger → backdrop → absolútny panel) je rovnaký ako TripTagsDropdown nižšie a
// IdentityVisibilityEye (PackProfile.tsx). Escape handler navyše — rovnaký vzor ako placeSug
// efekt v PackMap() (klik-mimo tam backdrop nemá, lebo prekrýva mapu; tu backdrop MÔŽE byť,
// panel je mimo mapy v ctlstacku).
function LayersPanel({
  mapBase,
  onBaseChange,
  overlayOn,
  onOverlayToggle,
  fogCtx,
}: {
  mapBase: MapBaseId;
  onBaseChange: (id: MapBaseId) => void;
  overlayOn: Record<MapOverlayId, boolean>;
  onOverlayToggle: (id: MapOverlayId) => void;
  fogCtx: MapLayerCtx;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const baseLayers = MAP_LAYERS.filter((l) => l.type === 'base');
  const overlayLayers = MAP_LAYERS.filter((l) => l.type === 'overlay');

  return (
    <div className="trp-layersdd">
      <button
        type="button"
        className={`trp-stylebtn${open ? ' on' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t('pack.map.layersAriaLabel')}
        title={t('pack.map.layersAriaLabel')}
      >
        <img src={ICON('layers')} alt="" />
      </button>
      {open && (
        <>
          <span className="fixed inset-0" style={{ zIndex: 40 }} onClick={() => setOpen(false)} aria-hidden />
          <div className="trp-layersdd-panel">
            <div className="trp-layersdd-group">
              <span className="trp-tagdd-eyebrow">{t('pack.map.layersBaseGroup')}</span>
              {baseLayers.map((layer) => {
                const reasonKey = layer.disabledReason?.(fogCtx) ?? null;
                const disabled = !!reasonKey;
                return (
                  <div key={layer.id}>
                    <label className={`trp-layersdd-row${disabled ? ' disabled' : ''}`}>
                      <input
                        type="radio"
                        name="trp-mapbase"
                        checked={mapBase === layer.id}
                        disabled={disabled}
                        onChange={() => onBaseChange(layer.id as MapBaseId)}
                      />
                      <span>{t(layer.labelKey)}</span>
                    </label>
                    {reasonKey && <p className="trp-layersdd-hint">{t(reasonKey)}</p>}
                  </div>
                );
              })}
            </div>
            <div className="trp-layersdd-group">
              <span className="trp-tagdd-eyebrow">{t('pack.map.layersOverlayGroup')}</span>
              {overlayLayers.map((layer) => {
                const reasonKey = layer.disabledReason?.(fogCtx) ?? null;
                const disabled = !!reasonKey;
                return (
                  <div key={layer.id}>
                    <label className={`trp-layersdd-row${disabled ? ' disabled' : ''}`}>
                      <input
                        type="checkbox"
                        checked={overlayOn[layer.id as MapOverlayId]}
                        disabled={disabled}
                        onChange={() => onOverlayToggle(layer.id as MapOverlayId)}
                      />
                      <span>{t(layer.labelKey)}</span>
                    </label>
                    {reasonKey && <p className="trp-layersdd-hint">{t(reasonKey)}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Tags multi-select dropdown pre top filter bar — presunuté z chip-riadku v ľavom paneli
// (Matej 2026-07-27). Vzor = IdentityVisibilityEye (PackProfile.tsx): trigger → backdrop →
// absolútne pozicovaný panel, klik na položku IBA toggle-ne (multi-select, panel sa
// nezatvára). Stav (heroTags/toggleTag) ostáva v PackMap, komponent je bezstavový wrapper.
function TripTagsDropdown({
  tags,
  onToggle,
  onClear,
}: {
  tags: Set<string>;
  onToggle: (tag: string) => void;
  onClear: () => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const count = tags.size;

  return (
    <span className="relative inline-flex" style={{ flex: '1 1 140px', minWidth: 120 }}>
      <button
        type="button"
        className={`trp-tagdd-btn${count > 0 ? ' on' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t('pack.map.tagsAriaLabel')}
      >
        <span>{count > 0 ? t('pack.map.tagsCount', { n: count }) : t('pack.map.tags')}</span>
        <span className="trp-tagdd-chevron" aria-hidden>▾</span>
      </button>

      {open && (
        <>
          {/* Backdrop — klik mimo zatvára, aj natívne <select>-y pod panelom ostanú nedostupné. */}
          <span className="fixed inset-0" style={{ zIndex: 40 }} onClick={() => setOpen(false)} aria-hidden />
          <div className="trp-tagdd-panel">
            <span className="trp-tagdd-eyebrow">{t('pack.map.filterByTag')}</span>
            {TAG_VOCAB.map((tag) => {
              const on = tags.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`trp-tagdd-row${on ? ' on' : ''}`}
                  onClick={() => onToggle(tag)}
                >
                  <span>{TAG_EMOJI[tag] ? `${TAG_EMOJI[tag]} ` : ''}{TAG_I18N[tag] ? t(TAG_I18N[tag]) : tag}</span>
                  {on && <span aria-hidden>✓</span>}
                </button>
              );
            })}
            {count > 0 && (
              <button type="button" className="trp-tagdd-clear" onClick={onClear}>{t('pack.map.clear')}</button>
            )}
          </div>
        </>
      )}
    </span>
  );
}

export default function PackMap() {
  const t = useT();
  const { lang } = useLang();   // popisy výletov nesú DÁTA, nie i18n kľúče (viď tripText)
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // issue #35: `/pack/add/trip` mountuje TÚ ISTÚ stránku ako `/pack/map` — ADD flow je overlay nad
  // živou mapou, nie samostatná obrazovka. Pathname rozhoduje, či sa formulár otvorí pri mounte.
  const onAddRoute = useLocation().pathname.startsWith('/pack/add');
  const id = usePackIdentity();
  const { toast } = useToast();

  const [hoverId, setHoverId] = useState<string | null>(null);
  // Matej 2026-07-31: „pri dotyku myšou trasa vybledne aby bolo vidno turistické značenie farby".
  // Vlastný stav vedľa hoverId zámerne — hoverId plní aj ĽAVÝ ZOZNAM a markery, kde je hover
  // pomôcka na NÁJDENIE trasy (tam musí ostať zlatá). Vybledne len to, na čom reálne stojí myš.
  const [lineHoverId, setLineHoverId] = useState<string | null>(null);
  const [heroDiff, setHeroDiff] = useState<'' | 'Easy' | 'Moderate' | 'Hard' | 'Odyssey'>('');
  const [heroCrowd, setHeroCrowd] = useState<'' | 'Pokojné' | 'Rušné' | 'Ľudoprázdne'>('');
  const [heroAct, setHeroAct] = useState<'' | 'hiking' | 'picnic' | 'overnight' | 'skating' | 'paddleboard'>('');
  const [heroMacroRegion, setHeroMacroRegion] = useState<'' | 'West' | 'Center' | 'East'>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');  // '' = všetky krajiny
  const [heroTags, setHeroTags] = useState<Set<string>>(new Set());
  // Matej 2026-07-23: mapa sa má pri načítaní ukázať tak, aby bolo vidno CELÉ Slovensko (nie len
  // nahustené výlety na západe) → východiskový fit = SVK_BORDER. Výber tripu prepne na jeho trasu.
  const [heroBounds, setHeroBounds] = useState<LatLngTuple[]>(SVK_BORDER);
  const [photoIdx, setPhotoIdx] = useState<Record<string, number>>({});
  const heroCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // bod 5 side-effect: sessionStorage mirror (tripShared) — expand teraz unmountne tento
  // komponent (navigate na PackTripArticle), tak fav/walked musí prežiť mount/unmount v
  // rámci tej istej browser session (žiadna Supabase perzistencia, viď tripShared komentár).
  const [favIds, setFavIds] = useState<Set<string>>(() => readFavIds());
  const [walkedIds, setWalkedIds] = useState<Set<string>>(() => { ensureWalkedSeeded(DEFAULT_WALKED_IDS); return readWalkedIds(); });
  useEffect(() => { writeFavIds(favIds); }, [favIds]);
  useEffect(() => { writeWalkedIds(walkedIds); }, [walkedIds]);

  const [placeQuery, setPlaceQuery] = useState('');
  const [placeSug, setPlaceSug] = useState<PlaceSug[]>([]);
  // naposledy vybraný návrh (viď guard v suggest efekte) + wrapper na klik-mimo
  const pickedPlaceRef = useRef('');
  const placeBoxRef = useRef<HTMLDivElement | null>(null);
  const [mapTarget, setMapTarget] = useState<LatLngTuple | null>(null);
  // Vrstvy mapy (integračná vlna, spec-hmla.md) — PODKLAD je vždy práve jeden (`mapBase`),
  // OVERLAYE sa dajú kombinovať (`overlayOn`). Panel, ktorý toto ovláda, sa generuje z
  // MAP_LAYERS (viď definícia vyššie), nie z tohto stavu.
  const [mapBase, setMapBase] = useState<MapBaseId>('outdoor');
  // Matej 2026-08-04 (doslova): „pri DOGYPT zobrazení bude vidno iba hmla a svetelné meče bez
  // legiend, ikoniek, čísel... iba vizuál, žiadne písmo ani vysvetlivky". JEDNA odvodená
  // podmienka namiesto desiatich roztrúsených ternárnych operátorov — všetko, čo v DOGYPT
  // podklade skrýva text/číslo/piktogram (trip markery, POI, popisky, mierka), sa gatuje TOUTO
  // premennou, nie porovnaním `mapBase === 'dogypt'` na každom mieste zvlášť.
  const isCleanMode = mapBase === 'dogypt';
  const [overlayOn, setOverlayOn] = useState<Record<MapOverlayId, boolean>>(OVERLAY_DEFAULTS);
  const toggleOverlay = useCallback((id: MapOverlayId) => {
    setOverlayOn((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);
  // Hmla (spec-hmla.md) — geometria je VÝHRADNE z potvrdeného prejdenia (viď useFogSource
  // komentár), nikdy z allTrails. `source` sa tu nepoužíva (dev-fallback beží ticho na pozadí),
  // je v hooku hlavne na debug/console warny.
  const fog = useFogSource();
  // Matej 2026-08-04 (spresnenie): „nie všetky magistrály v svetelnom meči, iba SNP a poloniny —
  // ostatné až keď prejdú Dogypťania!" — DOGYPT čistý vizuál kreslí VÝHRADNE trasy s potvrdeným
  // prejdením, presne tú istú množinu, z ktorej sa skladá hmla (fog.trails). Platí to pre
  // magistrály AJ bežné trasy rovnako — jedna množina pre hmlu aj pre čiary, žiadne dve pravidlá.
  const walkedTrailIds = useMemo(() => new Set(fog.trails.map((t) => t.id)), [fog.trails]);
  const [locating, setLocating] = useState(false);
  const leafletMapRef = useRef<L.Map | null>(null);
  // TRIPSTATS Slice A (bod 3) — fallback flyTo target keď ?add= príde skôr, než leafletMapRef
  // stihne mount (MapRefBridge onReady ho skonzumuje pri domountovaní mapy).
  const pendingFlyRef = useRef<LatLngTuple | null>(null);

  // bod 4 — .trp-sidebar má teraz 3 stavy: LIST (default) / inline DETAIL (inlineDetailId) /
  // ADD setup (addOpen). Desktop-only — mobile skrýva .trp-sidebar celý (bod 5).
  const [inlineDetailId, setInlineDetailId] = useState<string | null>(null);

  // ADD TRIP flow (krok 9, plany/zadanie-addtrip-flow-2026-07-27.md §15 bod 8) — vstupný popup
  // (AddTripEntry) → AddTripPlan/AddTripLog. Tie dva formuláre si držia vlastný interný state
  // (name/geometry/photos/…), Portal drží len KTORÝ je otvorený + chybu zápisu + mobile
  // map-reveal toggle.
  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [addFlow, setAddFlow] = useState<TripState | null>(null);
  // EVENT flow (krok 3 zadania-eventy) — rovnaký vzor ako addFlow, drží len origin ('own'/'tip');
  // formulár samotný (AddEvent) si drží vlastný interný state.
  const [addEventFlow, setAddEventFlow] = useState<'own' | 'tip' | null>(null);
  const [addError, setAddError] = useState('');           // chyba pri ukladaní (napr. plný localStorage)

  // ── ZÁPISY DO MAPY (2026-08-20) ────────────────────────────────────────────
  // `mapInstance` je STATE, nie ref: `useLongPressPoint` musí prihlásiť listenery
  // až keď mapa reálne existuje, a ref zmenu nevyrenderuje. `leafletMapRef` ostáva
  // nedotknutý — používajú ho GeometryPicker/AddEvent imperatívne.
  const dateLocale = intlLocale(lang);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const mapNotes = useMapNotes(true);
  // `kind` aj `radiusM` sú v drafte (nie vnútri panela) zámerne: obe sa kreslia
  // na MAPE — emoji v trojuholníku a kruh polomeru — a mapa žije v inom strome
  // než formulár. Kým bola skupina upozornení jednou kresbou bez kruhu, stačilo
  // to držať v paneli.
  const [noteDraft, setNoteDraft] = useState<{ lat: number; lon: number; group: NoteGroup; kind: NoteKind; disease: TickDisease | null; radiusM: number | null; pinnedSlug: string | null } | null>(null);
  // Výzva „priblíž si mapu" nesie POLOHU KLIKU, nie len príznak — kreslí sa na
  // tom pixeli, kam človek klikol (Matej 2026-08-21). `null` = nekreslí sa.
  const [noteTooFar, setNoteTooFar] = useState<{ x: number; y: number } | null>(null);
  const tooFarTimer = useRef<number | null>(null);
  /** Jedno miesto na zobrazenie výzvy — volajú ho všetky tri vstupy (klik, podržanie, pravý klik). */
  const showTooFar = useCallback((x: number, y: number) => {
    setNoteTooFar({ x, y });
    if (tooFarTimer.current !== null) window.clearTimeout(tooFarTimer.current);
    tooFarTimer.current = window.setTimeout(() => { setNoteTooFar(null); tooFarTimer.current = null; }, 2600);
  }, []);
  // Bez tohto by po odchode zo stránky bežal `setState` nad odmountovaným stromom.
  useEffect(() => () => { if (tooFarTimer.current !== null) window.clearTimeout(tooFarTimer.current); }, []);
  const [noteHint, setNoteHint] = useState(false);
  // POMALÁ CESTA: typ je vybraný z palety a čaká sa, kde človek klikne na mape.
  const [notePlacing, setNotePlacing] = useState<NoteGroup | null>(null);
  /**
   * DRUH VYBRANÝ EŠTE PRED ŤUKNUTÍM DO MAPY (Matej 2026-08-23: „človek nevie čo môže označiť,
   * nevidí možnosti… musia byť ihneď viditeľné nie schované že najprv vyber bod a potom tam
   * daj niečo čo ani nevieš čo je").
   *
   * Krok 2 sprievodcu sa pýtal „bolo tam nebezpečenstvo?" a ponúkal jediné tlačidlo OZNAČ NA
   * MAPE. Deväť druhov hrozby sa ukázalo až v paneli PO umiestnení bodu, takže človek
   * potvrdzoval miesto pre niečo, čo ešte nevidel. Odteraz si vyberie druh a až potom ťuká.
   *
   * ⚠️ Samostatný stav, nie rozšírenie `notePlacing` na objekt: `notePlacing` sa číta na
   * šiestich miestach ako „prebieha umiestňovanie" (zámok obrazovky, kurzor, lišta) a tie
   * o druh nestoja. `null` = ber prvý druh skupiny, teda pôvodné správanie.
   */
  const [placingKind, setPlacingKind] = useState<NoteKind | null>(null);
  // RÝCHLA CESTA: dlhé podržanie dalo bod a paleta sa pýta, čo to je.
  const [noteSpot, setNoteSpot] = useState<{ lat: number; lon: number } | null>(null);
  const [noteZoom, setNoteZoom] = useState(0);

  // Priblíženie ako STATE, nech lišta „ukáž miesto" vie prepnúť text na „priblíž
  // si mapu" v tej chvíli, keď človek odzoomuje — nie až po kliknutí naprázdno.
  useEffect(() => {
    if (!mapInstance) return;
    const sync = () => setNoteZoom(mapInstance.getZoom());
    sync();
    mapInstance.on('zoomend', sync);
    return () => { mapInstance.off('zoomend', sync); };
  }, [mapInstance]);

  /**
   * Položí značku a odpanuje mapu tak, aby ostala NAD panelom.
   *
   * Toto je jadro opravy zamietnutého UX: bez posunu by značka pri kliknutí do
   * dolnej tretiny obrazovky skončila pod formulárom a človek by potvrdzoval
   * miesto, ktoré nevidí.
   */
  const placeNote = (group: NoteGroup, lat: number, lon: number, kindOverride?: NoteKind | null) => {
    const kind = kindOverride ?? GROUP_KINDS[group][0];
    setNoteTooFar(null);
    setNoteHint(false);
    setNotePlacing(null);
    setPlacingKind(null);
    setNoteSpot(null);
    markHintSeen();
    // Pripnutie je VÝNIMKA, nie väzba (viď mapNotesGeo.ts): väčšinu práce spraví
    // geometria pri čítaní, toto len podchytí prípad, keď zápis vznikol
    // s konkrétnym výletom na mysli.
    setNoteDraft({ lat, lon, group, kind, disease: null, radiusM: defaultRadius(kind), pinnedSlug: nearestTrailId(lat, lon, kind, allTrails) });
    const map = mapInstance;
    if (!map) return;
    const pt = map.latLngToContainerPoint([lat, lon]);
    const safeY = map.getSize().y - NOTE_PANEL_H - 40;
    if (pt.y > safeY) map.panBy([0, pt.y - safeY], { animate: true, duration: 0.35 });
  };

  // Nápoveda sa ukáže RAZ, a až keď je mapa dosť priblížená na to, aby gesto
  // vôbec fungovalo — inak by radila niečo, čo v tej chvíli nejde spustiť.
  // ⚠️ Wizard je parkovaný na po launchi, takže toto je jediné miesto, kde sa
  // človek o písaní po mape dozvie.
  useEffect(() => {
    if (!mapInstance || hintSeen()) return;
    const check = () => { if (mapInstance.getZoom() >= MIN_ZOOM_FOR_NOTE) setNoteHint(true); };
    check();
    mapInstance.on('zoomend', check);
    return () => { mapInstance.off('zoomend', check); };
  }, [mapInstance]);

  const addBusy = addEntryOpen || addFlow !== null || addEventFlow !== null;
  const noteBusy = !!noteDraft || !!noteSpot || addBusy;

  // ── ZÁMOK OBRAZOVKY (Matej 2026-08-22, LOCK §2.2b zadania-mapa-composer) ──
  // „ihneď po PRVOM dlhom stlačení sa musí obrazovka locknúť do stavu vpisovania výletov."
  // Preto tu nie je len addBusy: zámok zapína už `noteSpot` (paleta pri prste hneď po
  // podržaní) a `notePlacing` (typ vybraný, čaká sa na klik do mapy) — teda naozaj prvý krok
  // pridávania čohokoľvek, nie až otvorený formulár.
  // Celý účinok je v CSS pri `body.trp-draw-lock` (jedna trieda, jedno miesto). Únik nesie
  // každý panel sám (× / Zrušiť) — režim bez východu je pasca, nie sústredenie.
  const drawLock = noteBusy || notePlacing !== null;
  useEffect(() => {
    if (!drawLock) return;
    document.body.classList.add('trp-draw-lock');
    // Upratané aj pri odchode zo stránky uprostred pridávania — trieda žije na <body>, teda
    // mimo tohto stromu, a bez cleanupu by ostala visieť na celom /packu.
    return () => document.body.classList.remove('trp-draw-lock');
  }, [drawLock]);

  // RÝCHLA CESTA — podržanie dá miesto, paleta sa spýta na typ. Beží len keď
  // NEPREBIEHA pomalá cesta: v režime „ukáž miesto" by dlhé podržanie a klik
  // súperili o ten istý dotyk.
  useLongPressPoint(mapInstance, !noteBusy && !notePlacing, {
    onPoint: (lat, lng) => {
      setNoteTooFar(null);
      setNoteHint(false);
      markHintSeen();
      setNoteSpot({ lat, lon: lng });
    },
    onTooFar: showTooFar,
  });

  // POMALÁ CESTA — typ už je vybraný, stačí jeden klik do mapy.
  // ⚠️ ZÁMERNE NIE `!noteBusy`: `noteBusy` obsahuje aj `addBusy`, a krok 2 sprievodcu výletu
  // („bolo na trase parkovisko / nebezpečenstvo / tip?") zapichuje značky práve POČAS
  // pridávania výletu. S pôvodnou podmienkou by tam klik do mapy nikdy nezabral a tlačidlo
  // OZNAČ NA MAPE by bolo mŕtve.
  const notePlaceReady = !!notePlacing && !noteDraft && !noteSpot && !addEntryOpen;
  /**
   * PRAH PRIBLÍŽENIA JE INÝ VNÚTRI SPRIEVODCU VÝLETU.
   *
   * Samostatný odkaz (pavúk, prameň) je bod, ktorý má sedieť na meter — preto z16. V kroku 2
   * pridávania výletu sa však mapa práve VYCENTROVALA NA CELÚ TRASU (viď fitBounds
   * v AddTripLog), teda na z13–15, a odkaz sa vzťahuje na trasu, ktorú človek pred chvíľou
   * nakreslil. So z16 tam ťuk do mapy ticho nezabral a pridanie parkoviska vyzeralo ako
   * pokazené (Matej 2026-08-23). Berieme prah kreslenia trasy — čo stačí na kotvu, stačí
   * aj na jej parkovisko.
   */
  const noteMinZoom = addFlow ? TRIP_HOLD_MIN_ZOOM : MIN_ZOOM_FOR_NOTE;
  useMapClickPoint(mapInstance, notePlaceReady, {
    onPoint: (lat, lng) => { if (notePlacing) placeNote(notePlacing, lat, lng, placingKind); },
    onTooFar: showTooFar,
  }, noteMinZoom);

  /**
   * SPRIEVODCA STOJÍ NA KROKU, KDE JE OBRAZOVKOU MAPA (krok 1 = kreslenie trasy).
   *
   * Na mobile sa vtedy formulár SCHOVÁ (CSS display, NIE unmount — inak by stratil interný
   * state pri každom prechode na mapu). GeometryPicker počúva `map.on('click')` priamo cez
   * mapRef, nezávisle od viditeľnosti panela, takže zápis geometrie beží ďalej.
   * Na PC sa neschováva nič: panel stojí vedľa mapy a lišta kreslenia sa oňho odsadí.
   */
  const [addMapPhase, setAddMapPhase] = useState<'off' | 'draw' | 'notes'>('off');
  /**
   * PRI KRESLENÍ SA MAPA UPRACE (Matej 2026-08-23: „keď kreslím, musia zmiznúť už vytvorené
   * trasy, resp. musia ešte viac vyblednúť"). Sedemdesiat fialových mečov cez seba a čerstvo
   * kliknutá kotva vyzerali rovnako dôležito. Trasy sa nemažú — GeometryPicker ich v tej
   * chvíli kreslí ako tenkých DUCHOV (§5.3), na ktorých sa dá kliknúť a zapísať si ich —
   * takže toto je výmena plnej vrstvy za stlmenú, nie strata. V kroku 2 sa vracajú: vtedy
   * človek hľadá, kde parkoval, a okolie je orientačný bod.
   */
  const mapDrawing = addMapPhase === 'draw';
  /**
   * ZNAČKY ZAPICHNUTÉ POČAS TOHTO PRIDÁVANIA (krok 2 sprievodcu). Slúžia len na zobrazenie —
   * krok 4 ich ZHRNIE, needituje. Väzba značky na výlet sa NEUKLADÁ (odvodzuje sa zo
   * súradnice, viď mapNotesGeo.ts), takže toto je naozaj len pamäť jednej obrazovky.
   */
  const [tripNotes, setTripNotesState] = useState<NoteKind[]>(() => readTripNotes() as NoteKind[]);
  /**
   * ⚠️ PREŽÍVA RELOAD. Zoznam sa musí obnoviť spolu s formulárom (`readAddDraft` vracia aj
   * číslo kroku), inak človek pokračuje v kroku 4 a zhrnutie tvrdí, že neoznačil nič —
   * hoci značky sú uložené. Na telefóne stačí, že iOS zahodí stránku na pozadí.
   * Zápis ide cez túto obálku, nie cez `setTripNotesState` priamo, nech sa nedá pridať
   * značka, ktorá sa neuloží.
   */
  const setTripNotes = useCallback((up: (prev: NoteKind[]) => NoteKind[]) => {
    setTripNotesState((prev) => {
      const next = up(prev);
      writeTripNotes(next);
      return next;
    });
  }, []);
  /**
   * VÝCHODISKO Z PRSTA (rez C) — bod, na ktorom človek podržal prst a z palety zvolil
   * VÝLET alebo UDALOSŤ. Formulár ho dostane ako prvú kotvu trasy (resp. miesto udalosti),
   * takže krok „nájdi miesto" úplne odpadá.
   *
   * ⚠️ NIE JE to koniec trasy. Dlhý stlač kladie ZAČIATOK; keby zároveň trasu uzavieral,
   * pri chvíli váhania by sa výlet „sám" odoslal ako jednobodový.
   */
  const [seedPoint, setSeedPoint] = useState<{ lat: number; lon: number } | null>(null);

  /**
   * ÚZKA OBRAZOVKA? Rozhoduje o tom, či formulár stojí VEDĽA mapy (PC) alebo cez ňu (mobil),
   * a či sa má v kroku 1 schovať, aby bolo na mapu vidno.
   *
   * ⚠️ HISTÓRIA, KTORÁ SA NESMIE VRÁTIŤ: do 23. 8. mountovali `AddTripLog` DVE miesta naraz
   * (`.trp-sidebar` + `.trp-madd`) a skrývalo ich CSS, nie podmienka. Obe kópie písali do
   * jedného kľúča zálohy, takže tá neviditeľná — prázdna — prepísala prácu tej viditeľnej.
   * S krokovým sprievodcom by z toho boli dvaja sprievodcovia s vlastným číslom kroku, preto
   * kópia zanikla: formulár žije v JEDNOM hostiteľovi (`.trp-addhost`), ktorému len CSS mení
   * tvar z plávajúceho panela na celú obrazovku.
   *
   * Hranica je `MOBILE_BP`, to isté číslo, aké rozhoduje o layoute — dve rôzne hranice by
   * vyrobili pásmo šírok bez pravidiel.
   */
  const [isNarrow, setIsNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BP);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${MOBILE_BP}px)`);
    const on = () => setIsNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  // tripy pridané v tejto session (ADD flow submit) — lokálny state, NIE Supabase (mimo
  // rozsahu tejto iterácie); zobrazujú sa hneď na mape + v zozname pred statickými HERO_TRAILS.
  // sessionStorage mirror (viď vyššie) nech expand na čerstvo pridaný trip nájde aj po navigate.
  const [localTrails, setLocalTrails] = useState<HeroTrail[]>(() => readLocalTrails());
  useEffect(() => { writeLocalTrails(localTrails); }, [localTrails]);
  // DEV: výlety nakreslené na telefóne odošli na disk vývojára (`plany/prijate-vylety/`),
  // inak ostanú uväznené v localStorage toho zariadenia. V prod builde neexistuje.
  useEffect(() => { devSyncLocalTrips(localTrails); }, [localTrails]);

  // EVENTY pridané v tejto session (krok 3 zadania-eventy) — rovnaký lokálny mirror vzor ako
  // localTrails vyššie; DB zápis príde až po nasadení migrácie (§9 zadania krok 2→ďalšie).
  const [localEvents, setLocalEvents] = useState<AddEventDraft[]>(() => readLocalEvents());
  useEffect(() => { writeLocalEvents(localEvents); }, [localEvents]);

  // TRIPSTATS Slice A (bod 3, Matej 2026-07-23) — add-trip z pohoria: TripStatsPanel „+ Add a
  // trip here" navigate-uje sem s ?add=<region>. Raz na mount: otvor ADD flow (log formulár —
  // krok 9: región už nie je samostatné pole, AddTripLog si ho odvodí z nakreslenej geometrie)
  // + odleť mapou na jeho stred. leafletMapRef môže byť ešte null (id.loading gate odloží mount
  // <MapContainer>) — pendingFlyRef drží cieľ, MapRefBridge onReady ho skonzumuje keď mapa domountuje.
  // issue #35: kanonický vstup je routa `/pack/add/trip?region=<region>`; `?add=<region>` na
  // `/pack/map` je STARÝ odkaz a musí ostať funkčný (žije v uložených linkoch a v starých
  // TripStats tlačidlách). Oba tvary robia to isté — otvor log formulár + odleť na región.
  useEffect(() => {
    const region = searchParams.get('region') ?? searchParams.get('add');
    if (!onAddRoute && !region) return;
    // s regiónom prichádza konkrétny pokyn („pridaj výlet TU", z TripStats) → rovno log formulár.
    // bez regiónu je to len „chcem pridať výlet" → vstupný picker walked/planned, ako klik na
    // tlačidlo + Add trip. Inak by routa ticho zjedla voľbu „planujem" z AddTripEntry.
    if (region) setAddFlow('walked');
    else setAddEntryOpen(true);
    if (region) {
      const target = regionCenter(region);
      if (leafletMapRef.current) leafletMapRef.current.flyTo(target, 11, { duration: 1.2 });
      else pendingFlyRef.current = target;
    }
    // query sa odstráni (bol to len jednorazový pokyn), pathname `/pack/add/trip` ostáva —
    // nesie informáciu „som v ADD flow" a je to URL, ktorú má užívateľ vidieť.
    if (region) setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // bod 5 — mobile map-first + LIST/MAP toggle + FILTER (sort) popover.
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [sortOpen, setSortOpen] = useState(false);
  // Matej 2026-07-27: default poradie = „klasicky na najlepšie hodnotené" → 'top' je VÝCHODZÍ
  // stav, nie voliteľný filter (preto sa ani neráta do activeFilterCount a prázdna hodnota ''
  // z únie zmizla — vypnúť sort sa nedá, len prepnúť). Platí pre desktop popover aj mobile sheet.
  const [mobileSort, setMobileSort] = useState<'top' | 'easiest' | 'hardest' | 'calmest'>('top');
  // aktuálny výrez mapy (hlási <ViewportWatcher>) — riadi rozdelenie ľavého zoznamu na
  // „v tomto výreze" / „inde na mape". null = mapa ešte nedomountovala → zoznam bez delenia.
  const [viewBox, setViewBox] = useState<ViewBox | null>(null);
  // hrúbka „svetelného meča" podľa zoomu (issue #49) — plní SaberScaleWatcher vnútri mapy
  const [saberScale, setSaberScale] = useState(1);
  const handleViewport = useCallback((b: ViewBox) => {
    // ignoruj sub-pixelové drobčenie (fitBounds vie doraziť o zlomok stupňa) — inak by každý
    // dotyk mapy re-renderoval celú stránku vrátane všetkých polyline.
    setViewBox((cur) => (cur && Math.abs(cur.n - b.n) < 1e-5 && Math.abs(cur.s - b.s) < 1e-5
      && Math.abs(cur.e - b.e) < 1e-5 && Math.abs(cur.w - b.w) < 1e-5) ? cur : b);
  }, []);
  // Mobilný filter sheet (Matej 2026-07-27) — nesie country/region/activity/difficulty/crowd/
  // tagy/sort. Vlastný stav (NIE zdieľaný sortOpen), aby sa desktopový sort popover a mobilný
  // sheet nikdy neotvorili naraz pri zmene šírky okna.
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  // AINUBIS launcher (.ainubis-launcher, z-index 60) žije MIMO tejto stránky a PackLayout mu
  // dáva vlastný stacking context (`<div className="relative" style={{zIndex:1}}>`), takže ho
  // žiadny z-index vnútri .trp-root neprebije — sadal si na "SHOW N" v pätke sheetu. Sheet je
  // modál, tak ho na jeho čas skryjeme (body class, upratané pri zatvorení aj unmounte).
  useEffect(() => {
    if (!filterSheetOpen) return;
    document.body.classList.add('trp-sheet-open');
    return () => document.body.classList.remove('trp-sheet-open');
  }, [filterSheetOpen]);

  // ── KOMUNITNÁ vrstva (design: plany/pack-community-features-design.md) — hodnotenia/plány/
  // inzeráty idú cez packStore (localStorage + Supabase, issue #32); MOCK ostávajú len cudzí
  // ľudia. `now` fixné pri mounte kvôli deterministickým mock dátumom (planners/events). ──
  const nowMs = useMemo(() => Date.now(), []);
  const [votes, setVotes] = useState<Record<string, TripVote>>(() => readVotes());
  const [plans, setPlans] = useState<TripPlan[]>(() => readPlans());
  const [events, setEvents] = useState<PartnerEvent[]>(() => readEvents());
  useEffect(() => { writeVotes(votes); }, [votes]);
  useEffect(() => { writePlans(plans); }, [plans]);
  useEffect(() => { writeEvents(events); }, [events]);
  // Po dobehnutí hydratácie z DB (issue #32) prečítať znova — inicializátory vyššie bežali
  // pred ňou. `epoch` 0 = ešte nebola, preto guard (bez neho by sa pri mounte prepísal
  // rozrobený stav tým istým obsahom a zbytočne to preblikne).
  const storeEpoch = usePackStoreEpoch();
  useEffect(() => {
    if (!storeEpoch) return;
    setFavIds(readFavIds());
    setWalkedIds(readWalkedIds());
    setVotes(readVotes());
    setPlans(readPlans());
    setEvents((prev) => { const stored = readEvents(); return stored.length ? stored : prev; });
  }, [storeEpoch]);

  // flow modal (design §A): ponuka hodnotenia po ✓. Zámer wishlistu a inzerát na parťáka
  // sú preč (2026-08-05, viď chooseSolo nižšie) — ★ ukladá jedným klikom.
  const [walkedPopupId, setWalkedPopupId] = useState<string | null>(null);
  // Odmena za PRÁVE zapísané prejdenie (§3b) — nie je odvoditeľná spätne (bonus závisí od
  // toho, čo bolo prejdené PRED klikom), takže sa musí zapamätať v momente kliku.
  const [walkedReward, setWalkedReward] = useState<WalkReward | null>(null);
  // #41 — klik na ikonku tvorcu/účastníka v „Open trip from the pack" rozbalí TripProfileCard
  // pod jeho riadkom. Kľúč = `${h.key}:org` alebo `${h.key}:joiner:${i}`, nie len id člena —
  // tá istá trasa môže byť naraz otvorená viacerými organizátormi.
  const [expandedPartyKey, setExpandedPartyKey] = useState<string | null>(null);
  // #41 / A4 — klik na „by <autor>" otvorí popup tvorcu (Message + reálni účastníci).
  const [creatorTrail, setCreatorTrail] = useState<HeroTrail | null>(null);
  // Portal kategória (design §D): Trips ↔ Events (Events pill sa aktivoval).
  const [activeCat, setActiveCat] = useState<'trips' | 'events'>('trips');
  // EVENT zoznam v paneli (krok 5, zadanie-eventy §9 krok 5) — rovnaký trojicový vzor ako trip
  // hoverId/inlineDetailId + heroCardRefs nižšie, len na vlastnom lokálnom localEvents stave.
  // `eventsView`: default = nadchádzajúce, 'archive' = filter na ends_at < now (§4.5, NIKDY delete).
  const [eventsView, setEventsView] = useState<'upcoming' | 'archive'>('upcoming');
  // pin na mape kliknutý → zodpovedajúca karta v paneli sa zvýrazní + scrollne (rovnaký vzor ako
  // hoverId/heroCardRefs pri trip pinoch, viď efekt nižšie pri handleLocate).
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  // origin:'own' karta rozbalená (ukazuje popis) — origin:'tip' klik namiesto toho otvára sourceUrl.
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const eventCardRefs = useRef<Record<string, HTMLElement | null>>({});
  const visibleEvents = useMemo(
    () => (eventsView === 'upcoming' ? upcomingEvents(localEvents, nowMs) : archivedEvents(localEvents, nowMs)),
    [localEvents, eventsView, nowMs],
  );
  const handleEventCardClick = (draft: AddEventDraft) => {
    setSelectedEventId(draft.id);
    if (draft.origin === 'own') setExpandedEventId((cur) => (cur === draft.id ? null : draft.id));
  };
  const allTrails = useMemo(() => [...localTrails, ...HERO_JOURNEYS, ...HERO_TRAILS], [localTrails]);
  // vstup pre <TripMarkers> (zoomové vrstvy + zhlukovanie, zadanie 2.3/2.4) — jeden bod na trip:
  // hike = štart trasy, journey = stred (rovnaká logika ako pôvodný pillIcon Marker), vodná
  // plocha = ťažisko (waterPoint). Plánované tripy ('plan-') majú vlastný ružový pin, sem nepatria.
  const mapPoints = useMemo<MapPoint[]>(() => {
    const pts: MapPoint[] = [];
    allTrails.forEach((tr) => {
      if (tr.id.startsWith('plan-') || tr.path.length === 0) return;
      if (isWaterTrail(tr)) {
        const [lat, lon] = waterPoint(tr.path);
        pts.push({ id: tr.id, tr, lat, lon, water: true, journey: false });
      } else {
        const journey = !!tr.acts?.includes('journey');
        const [lat, lon] = journey ? tr.path[Math.floor(tr.path.length / 2)] : tr.path[0];
        pts.push({ id: tr.id, tr, lat, lon, water: false, journey });
      }
    });
    return pts;
  }, [allTrails]);
  // bbox každej trasy — predpočítané raz, porovnáva sa s výrezom mapy pri každom paneli (r. nižšie,
  // inViewTrails/elsewhereTrails). Trasa bez bodov (napr. plán bez pinu) sem nepatrí a berie sa
  // ako „nedá sa umiestniť" → ostáva v hornej skupine, nech ju viewport nikdy nezhodí dolu.
  const trailBox = useMemo(() => {
    const m = new Map<string, ViewBox>();
    allTrails.forEach((tr) => {
      if (!tr.path.length) return;
      let n = -90, s = 90, e = -180, w = 180;
      tr.path.forEach(([la, lo]) => {
        if (la > n) n = la; if (la < s) s = la;
        if (lo > e) e = lo; if (lo < w) w = lo;
      });
      m.set(tr.id, { n, s, e, w });
    });
    return m;
  }, [allTrails]);
  const availableCountries = useMemo(() => {
    const seen = new Set<string>();
    for (const tr of allTrails) seen.add(trailCountry(tr));
    return [...seen].sort((a, b) => (a === 'sk' ? -1 : b === 'sk' ? 1 : a.localeCompare(b)));
  }, [allTrails]);
  // DOGYPT podklad používa outdoor dlaždice (viď DogyptBaseLayer komentár) — spodná vrstva teda
  // pozná len dva reálne mapsety, tretí (dogypt) je vizuálna nadstavba nad "outdoor".
  const tileStyle: 'outdoor' | 'aerial' = mapBase === 'aerial' ? 'aerial' : 'outdoor';
  const fogCtx: MapLayerCtx = { fogTrailsCount: fog.trails.length, fogLoading: fog.loading, isCleanMode };
  const trailsById = useMemo(() => {
    const m = new Map<string, HeroTrail>();
    allTrails.forEach((t) => m.set(t.id, t));
    return (id: string) => m.get(id);
  }, [allTrails]);

  // #41 — CUDZIE OTVORENÉ VÝLETY na tejto trase. Kľúčované slugom do zoznamu, nie na
  // jednu položku: tú istú trasu môže mať vypísanú viac ľudí a každý je iná partia.
  // Bez organizátora z RPC (zavretý medzičasom, nezaplatený) sa karta nekreslí — nie je koho.
  const { trips: openTrips } = useOpenTrips();
  const openTripParties = useTripParties(openTrips.map((o) => ({ slug: o.slug, organizerId: o.organizerId })));
  const openHostsBySlug = useMemo(() => {
    // `organizerId` sa nesie ďalej zámerne: bez neho sa členovi partie nedá napísať
    // (`startTripDM` adresuje `trip_requests.organizer_id`) a karty by tu ostali bez
    // tlačidla Message — na článku výletu (PackTripArticle.tsx) pritom funguje.
    const m = new Map<string, { key: string; organizerId: string; date: string | null; organizer: PartyMember; joiners: PartyMember[] }[]>();
    for (const o of openTrips) {
      const party = openTripParties[partyKey(o.slug, o.organizerId)];
      if (!party?.organizer) continue;
      const arr = m.get(o.slug) ?? [];
      arr.push({ key: partyKey(o.slug, o.organizerId), organizerId: o.organizerId, date: o.date, organizer: party.organizer, joiners: party.joiners });
      m.set(o.slug, arr);
    }
    return m;
  }, [openTrips, openTripParties]);

  const trailColor = (tid: string) => walkedIds.has(tid) ? '#7BB07A' : favIds.has(tid) ? GOLD : '#D47D6D';

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        leafletMapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 14, { duration: 1.2 });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  // hover na pin/kartu → doscrolluje zodpovedajúcu kartu do viewportu
  useEffect(() => {
    if (hoverId) heroCardRefs.current[hoverId]?.scrollIntoView({ block: 'nearest' });
  }, [hoverId]);

  // EVENT pin kliknutý (nie hover — eventy nemajú km-pilulku ani hover-scroll trip vzor, len
  // klik) → zvýrazní a doscrolluje zodpovedajúcu kartu (krok 5, § „Piny na mape").
  useEffect(() => {
    if (selectedEventId) eventCardRefs.current[selectedEventId]?.scrollIntoView({ block: 'nearest' });
  }, [selectedEventId]);

  // vyhľadávanie miesta na mape (Mapy.com Suggest) — real API, no mock
  useEffect(() => {
    const q = placeQuery.trim();
    if (q.length < 2) { setPlaceSug([]); return; }
    // BUG FIX (Matej 2026-07-27: „mapka ho pekne nacentruje ale dropdown zostáva a nejde
    // zavrieť"): klik na návrh zapisuje jeho meno do placeQuery → tento efekt sa spustil
    // znova, dofetchol tie isté návrhy a 250 ms po zatvorení ich vrátil späť. Donekonečna,
    // lebo každé ďalšie zatvorenie query nemení. Guard = pamätáme si naposledy VYBRANÝ
    // reťazec; kým sa nezmení (= kým používateľ nezačne písať niečo iné), neponúkame nič.
    if (pickedPlaceRef.current === q) { setPlaceSug([]); return; }
    const timer = setTimeout(async () => {
      try {
        const url = `${MAPY_BASE}/v1/suggest?query=${encodeURIComponent(q)}&lang=en&limit=6&apikey=${MAPY_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        const items: PlaceSug[] = (data.items || [])
          .map((it: { name?: string; label?: string; location?: string; position?: { lat?: number; lon?: number } }) => ({
            name: it.name || '',
            sub: [it.label, it.location].filter(Boolean).join(' · '),
            lat: it.position?.lat as number,
            lon: it.position?.lon as number,
          }))
          .filter((x: PlaceSug) => Number.isFinite(x.lat) && Number.isFinite(x.lon));
        setPlaceSug(items);
      } catch { setPlaceSug([]); }
    }, 250);
    return () => clearTimeout(timer);
  }, [placeQuery]);

  // Zatvorenie ponuky miest bez výberu (Matej 2026-07-27) — klik kamkoľvek mimo search boxu
  // alebo Escape. Backdrop element sa tu použiť NEDÁ (na rozdiel od Tags dropdownu): prekryl
  // by mapu, takže by sa nedalo pretiahnuť/zoomnúť, kým je ponuka otvorená.
  useEffect(() => {
    if (placeSug.length === 0) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!placeBoxRef.current?.contains(e.target as Node)) setPlaceSug([]);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPlaceSug([]); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [placeSug.length]);

  // BODY + LEVEL (issue #33) — z prejdených trás, ich km/stúpania, pevných cien magistrál,
  // odškrtnutých geo jednotiek a daných hodnotení. Z `localTrails` sa +20 pripíše len za MOJE
  // a SCHVÁLENÉ výlety (`approvedAddedIds`, 2026-08-05) — predtým tu stálo slepé
  // `localTrails.forEach(addedIds.add)`, ktoré platilo aj za cudzie výlety a za vlastné návrhy,
  // ktoré Matej v /admin ešte len uvidí (alebo zamietol).
  // ⚠️ MUSÍ ostať NAD `if (!id.session) return null` — useMemo je hook a beží počas renderu:
  // pod podmieneným returnom by menil počet hookov medzi rendermi (Rules of Hooks) a zároveň
  // by siahal na `firstName` v TDZ. Meno člena si preto skladá sám z session (bezpečné cez ?.).
  // 2026-08-09: samotný výpočet sa presťahoval do `profileLevelFor` (packCommunity), lebo to
  // isté číslo ukazuje aj `TripSpotlight` na homepage. Druhá kópia týchto riadkov = dva rôzne
  // levely na dvoch povrchoch, presne ten rozchod, ktorý tu už raz bol.
  const profile = useMemo(() => {
    const email = id.session?.user?.email ?? '';
    const meta = (id.session?.user?.user_metadata ?? {}) as Record<string, unknown>;
    return profileLevelFor({
      walkedTrails: allTrails.filter((tr) => walkedIds.has(tr.id)),
      localTrailIds: localTrails.map((tr) => tr.id),
      votes,
      email,
      ownerName: firstNameFrom(email, (meta.full_name || meta.name) as string | undefined),
    });
    // `storeEpoch` je v deps zámerne: `approvedAddedIds` číta statusy priamo z úložiska, takže
    // sa musí prepočítať v momente, keď hydratácia z DB dobehne.
  }, [allTrails, walkedIds, localTrails, votes, storeEpoch, id.session]);
  const profilePoints = profile.points;
  const levelInfo = profile.level;

  if (id.loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center relative" style={{ backgroundColor: T.pageBg }}>
        <HieroglyphBg />
        <div className="relative" style={{ zIndex: 1 }}>
          <div style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.3em', fontSize: 12, color: T.onDarkDim }}>
            {t('pack.layout.loading')}
          </div>
        </div>
      </div>
    );
  }
  if (!id.session) return null;

  // greeting meno — z Supabase user_metadata (full_name/name), fallback e-mail local-part,
  // rovnaký vzor ako firstNameFrom() v Pack.tsx (header greeting). Presunuté sem (pred
  // ostatné handlery) — submitAdd (bod 6) potrebuje firstName ako author novej ADD-flow karty.
  const authMeta = (id.session?.user?.user_metadata ?? {}) as Record<string, unknown>;
  const authFullName = (authMeta.full_name || authMeta.name) as string | undefined;
  const firstName = firstNameFrom(id.session?.user?.email ?? '', authFullName);


  // bod 4: klik na kartu/pin → inline DETAIL v paneli (desktop) namiesto priamej navigácie;
  // ⤢ expand (expandDetail nižšie) navigates to the SEPARATE full-page article route
  // (PackTripArticle.tsx, bod 5 iterácia 12) — this component itself never mounts with a
  // slug anymore. Mobile nemá inline-detail panel (bod 5 i11 ho skrýva celý), tak tam ostáva
  // priama navigácia rovno na článok (jediné miesto, kde sa klik na kartu líši podľa šírky).
  const selectTrail = (tr: HeroTrail) => {
    if (typeof window !== 'undefined' && window.innerWidth <= MOBILE_BP) {
      navigate(tripPath(tr));
      return;
    }
    setAddFlow(null);
    setInlineDetailId(tr.id);
    setHeroBounds(tr.path);
  };
  const expandDetail = (tid: string) => navigate(tripPathById(tid, allTrails));
  // #55 — prázdna partia pod vlastným inzerátom potrebuje akciu. Odkaz na výlet je jediná vec,
  // ktorú s tým člen môže spraviť sám (rovnaký postup ako zdieľanie v článku výletu).
  const shareTripLink = async (tid: string) => {
    const tr = trailsById(tid);
    if (!tr) return;
    const url = `${window.location.origin}${tripPath(tr)}`;
    const shareData = { title: tr.name, text: tripShareText(tr), url };
    if (typeof navigator.share === 'function') {
      try { await navigator.share(shareData); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ description: t('pack.map.toastLinkCopied') });
    } catch {
      toast({ description: url });
    }
  };
  // ── ★ = JEDEN KLIK (2026-08-05). Predtým otvorila „zámer" popup Solo/Buddy — lenže uloženie
  // a rozhodnutie „hľadám partiu" sú dve rôzne veci a popup ich zlepil do jednej otázky, ktorú
  // musíš zodpovedať skôr, než si výlet vôbec odložíš. Hviezdička teraz len uloží (solo/closed);
  // zverejnenie a dátum rieši Triplist, kde na to modal „Kto vidí tento výlet" už existuje
  // (`PackTriplist.setVisibility`). Toast na to miesto rovno ukáže cestu, ale nevynucuje ju. ──
  const toggleFav = (tid: string) => {
    if (favIds.has(tid)) {
      setFavIds((prev) => { const n = new Set(prev); n.delete(tid); return n; });
      setPlans((prev) => prev.filter((p) => p.tripId !== tid));
      return;
    }
    chooseSolo(tid);
    toast({
      description: t('pack.map.toastSavedToTriplist'),
      action: (
        <ToastAction altText={t('pack.map.toastOpenTriplist')} onClick={() => navigate('/pack/map/triplist')}>
          {t('pack.map.toastOpenTriplist')}
        </ToastAction>
      ),
    });
  };
  // ── ✓ = JEDEN KLIK (2026-08-05, Matej: „jedným klikom by sa mal dať označiť ako prejdený").
  // Popup bol doteraz POVINNÝ — kto len chcel odškrtnúť prejdenú trasu, musel najprv vyplniť
  // hodnotenie, náročnosť a ruch. Prejdenie sa teraz zapíše HNEĎ a hodnotenie sa PONÚKNE
  // (Matej: „nebolo by povinné ale vyskočilo by povinne") — popup vyskočí sám, zavretie
  // nezruší nič, prejdenie je už zapísané. Od 2026-08-06 sa ponúka pri KAŽDOM prejdení, bez
  // tichého obdobia — dôvod a čo robiť namiesto neho pri dávke: packCommunity.ts. ──
  const toggleWalked = (tid: string) => {
    if (walkedIds.has(tid)) {
      setWalkedIds((prev) => { const n = new Set(prev); n.delete(tid); return n; });
      setVotes((prev) => { const n = { ...prev }; delete n[tid]; return n; });
      setWalkedReward(null);
      return;
    }
    // ODMENA (2026-08-05, zadanie §3b): základ = to isté číslo, aké sľubovalo tlačidlo (padne
    // vždy) · bonus = objavenia, ktoré sa dopočítajú TERAZ, voči tomu, čo bolo prejdené PREDTÝM.
    // `walkedIds` je v tomto momente ešte stará množina — presne to potrebujeme.
    const tr = trailsById(tid);
    const reward: WalkReward | null = tr
      ? { tid, ...walkRewardBase(tr), bonuses: discoveryBonusFor(tr, allTrails.filter((x) => walkedIds.has(x.id))) }
      : null;
    setWalkedReward(reward);
    setWalkedIds((prev) => { const n = new Set(prev); n.add(tid); return n; });
    // Ponuka hodnotenia ide VŽDY (tiché obdobie zrušené 2026-08-06, viď packCommunity.ts) —
    // hodnotenie je platené bodmi, takže je to príležitosť, nie otrava. Toast s odmenou tu
    // preto už netreba: to isté číslo aj prípadné objavenie ukáže popup, ktorý sa práve otvára.
    setWalkedPopupId(tid);
  };
  // Zavretie ponuky bez vyplnenia. Od 2026-08-06 sa NIČ neutišuje — ponuka príde pri každom
  // ďalšom prejdení znova (Matej: „pri každom prejdenom daj popup s hodnotením nie random").
  const closeWalkedPopup = () => {
    setWalkedPopupId(null);
    setWalkedReward(null);
  };
  // additive-only walked setter (never toggles off) — used by TripComments (§15 zadania
  // 2026-07-23): posting a review implies the trip is walked, so submit calls this instead of
  // toggleWalked (which would UN-mark an already-walked trip on a second call).
  const markWalked = (tid: string) => {
    setWalkedIds((prev) => (prev.has(tid) ? prev : new Set(prev).add(tid)));
  };
  // ── komunitné submit handlery ──
  const submitWalked = (v: WalkedInput) => {
    if (!walkedPopupId) return;
    const tid = walkedPopupId;
    setVotes((prev) => ({ ...prev, [tid]: { tripId: tid, ...v, at: nowMs } }));
    setWalkedIds((prev) => { const n = new Set(prev); n.add(tid); return n; });
    setWalkedPopupId(null);
    setWalkedReward(null);
  };
  const addPlan = (tid: string, intent: 'solo' | 'partner', date = '') =>
    setPlans((prev) => [{ tripId: tid, intent, date, at: nowMs }, ...prev.filter((p) => p.tripId !== tid)]);
  // ★ ukladá VŽDY solo/closed. `choosePartner` + `submitPartnerAd` (druhá cesta k inzerátu:
  // 2–3 návrhy termínov + socializácia) sú ZMAZANÉ 2026-08-05 — po zlúčení vstupov ich nemal
  // kto zavolať (jediným volajúcim bol WishlistIntentPopup, ktorý ★ už neotvára). Verejný
  // inzerát dnes vzniká v AddTripPlan („Looking for pack" → user_trips + trip_events) a
  // zverejniť uložený výlet sa dá v Triplistе („Who can see this trip").
  const chooseSolo = (tid: string) => {
    setFavIds((prev) => { const n = new Set(prev); n.add(tid); return n; });
    addPlan(tid, 'solo');
    // TRIPLIST (Slice A): rename wishlist → triplist, star popup navyše upsertne triplist entry.
    upsertMyTrip(tid, { status: 'solo', openness: 'closed', date: '' });
  };
  const joinEvent = (eid: string) =>
    setEvents((prev) => prev.map((e) => (e.id === eid ? { ...e, joinedByMe: !e.joinedByMe } : e)));
  // Zavrieť/otvoriť skupinu — inzerát ostáva pre pack viditeľný, len sa nedá pridať
  // (Matej 2026-07-25). Prepína ho ktokoľvek zo skupiny, gating je v EventsView.
  const toggleEventClosed = (eid: string) =>
    setEvents((prev) => prev.map((e) => (e.id === eid ? { ...e, closed: !e.closed } : e)));
  // ── MAZANIE (2026-08-22) ────────────────────────────────────────────────────────────────
  // Do tejto chvíle sa v celom /pack nedala zmazať ANI JEDNA z troch vecí, ktoré človek na
  // mape vytvorí. `removePlan()` tu síce od 24. 7. stálo, ale NIKTO ho nevolal (mŕtvy kód)
  // a aj keby, plán by z mapy nezmizol — pin nekreslí `TripPlan`, ale `plan-` záznam
  // v `localTrails`, o ktorom tá funkcia nevedela. Matej to našiel ako podujatie na
  // Oravskej priehrade, ktoré sa nedalo odstrániť.

  /** PODUJATIE (AddEventDraft). Nikto sa naň nemôže „prihlásiť", takže niet komu to oznámiť. */
  const deleteLocalEvent = (eid: string) => {
    setLocalEvents((prev) => prev.filter((e) => e.id !== eid));
    setSelectedEventId((cur) => (cur === eid ? null : cur));
    setExpandedEventId((cur) => (cur === eid ? null : cur));
  };

  /** INZERÁT „hľadám partiu" (PartnerEvent). Výlet v triplistе OSTÁVA — ruší sa pozvánka,
   *  nie plán. Riadok v `trip_events` zmaže sám sync: `packStore.ts` porovnáva predošlý
   *  a nový zoznam a na chýbajúce id vyrobí delete op. */
  const deleteListing = (eid: string) => setEvents((prev) => prev.filter((e) => e.id !== eid));

  /** PLÁNOVANÝ VÝLET — to, čo na mape kreslí 🎯. Zaniká celý, so všetkým, čo na ňom visí.
   *
   *  Poradie nie je náhodné a ŽIADNY krok sa nesmie vynechať — každý z nich drží plán
   *  nažive na inom povrchu, a keby ostal jediný, vyzeralo by to ako „zmazalo sa to len
   *  na oko":
   *    1. `localTrails`  → pin na mape + `allTrails` (bez toho 🎯 ostane visieť)
   *    2. `plans`/`favIds` → hviezdička a zoznam plánov
   *    3. `triplist`     → MY TRIPS ... a `user_trips` v DB cez sync
   *    4. `events`       → inzerát na tento výlet by inak osirel: karta v paneli by
   *                        odkazovala na výlet, ktorý už neexistuje (`trailsById` → undefined
   *                        ⇒ „Planned walk" bez miesta a bez fotky)
   *  ⚠️ `removeMyTrip` MUSÍ ísť spolu s krokom 2, inak `seedTriplistFromPlans()` položku
   *  pri ďalšom mounte z prežívajúceho plánu založí naspäť. */
  const deletePlannedTrip = (tid: string) => {
    setLocalTrails((prev) => prev.filter((tr) => tr.id !== tid));
    // ⚠️ 5. krok, bez ktorého sú ostatné štyri zbytočné: hydratácia PREPISUJE `trp-local-trails`
    // celým obsahom `pack_trips` (packStore.ts, `writeJson(PACK_KEYS.localTrails, fromDb)`).
    // Bez zmazania riadku na serveri by sa výlet aj s pinom vrátil pri najbližšom prihlásení.
    deletePackTrip(tid);
    setPlans((prev) => prev.filter((p) => p.tripId !== tid));
    setFavIds((prev) => { const n = new Set(prev); n.delete(tid); return n; });
    removeMyTrip(tid);
    setEvents((prev) => prev.filter((e) => e.tripId !== tid));
    setInlineDetailId((cur) => (cur === tid ? null : cur));
  };
  const toggleTag = (tag: string) => setHeroTags((prev) => {
    const n = new Set(prev); if (n.has(tag)) n.delete(tag); else n.add(tag); return n;
  });

  // ── mobilný filter sheet (Matej 2026-07-27) ────────────────────────────
  // Zmena krajiny nesie aj prefokus mapy — vytiahnuté z inline onChange ľavého panelu, aby
  // sheet a panel používali TÚ ISTÚ logiku (inak by sa časom rozišli).
  const applyCountry = (c: string) => {
    setSelectedCountry(c);
    // SK-špecifický región filter (West/Center/East) platí len pre SK
    if (c !== '' && c !== 'sk') setHeroMacroRegion('');
    // prefokus mapy na trasy vybranej krajiny (union ich path bodov); '' → celé SR
    if (c === '') { setHeroBounds(SVK_BORDER); }
    else {
      const pts = allTrails.filter((t) => trailCountry(t) === c).flatMap((t) => t.path);
      if (pts.length) setHeroBounds(pts as typeof heroBounds);
    }
  };
  // Počet aktívnych filtrov na pilulke „Filters · N" — sort sa počíta tiež, lebo v sheete je.
  // 'top' je VÝCHODZÍ sort (Matej 2026-07-27), takže sa neráta — inak by badge svietil stále.
  const activeFilterCount =
    (selectedCountry ? 1 : 0) + (heroMacroRegion ? 1 : 0) + (heroAct ? 1 : 0) +
    (heroDiff ? 1 : 0) + (heroCrowd ? 1 : 0) + heroTags.size + (mobileSort !== 'top' ? 1 : 0);
  const clearAllFilters = () => {
    applyCountry('');
    setHeroMacroRegion(''); setHeroAct(''); setHeroDiff(''); setHeroCrowd('');
    setHeroTags(new Set()); setMobileSort('top');
  };
  // carousel na veľkej foto-karte — cyklí photoIdx pre daný trip, dir = -1/+1
  const cyclePhoto = (tid: string, dir: -1 | 1, total: number) => setPhotoIdx((prev) => {
    const cur = prev[tid] ?? 0;
    return { ...prev, [tid]: (cur + dir + total) % total };
  });

  // ── ADD TRIP flow (krok 9, zadanie §3 + kontrakt §0) ────────────────────
  // myDogs pre CompanionPicker vnútri AddTripPlan/AddTripLog — rovnaký tvar/mapping ako pôvodné
  // CompanionPicker volanie v starom renderAddSetup. Plain expression, NIE useMemo — tento riadok
  // je ZA `if (id.loading)` / `if (!id.session) return null` vyššie (early return), takže hook by
  // tu porušil Rules of Hooks (biela stránka, tsc to nechytí — viď CLAUDE.md).
  const myDogsForAdd = id.dogs.map((d) => ({ id: d.id, name: d.dog_name ?? t('pack.map.myDogFallback'), photo: d.cloudinary_main_url }));
  // Tlačidlo „+ Add trip" na mape NEnaviguje na `/pack/add/trip` zámerne — obe adresy sú iné
  // <Route>, takže navigácia by PackMap odmountovala a zhodila zoom/filtre/výrez mapy. Routa je
  // vstupný bod (deep link z Triplistu, TripStats, uložený odkaz), nie interný toggle.
  const openAddEntry = () => setAddEntryOpen(true);
  const closeAddEntry = () => {
    setAddEntryOpen(false);
    if (onAddRoute) navigate('/pack/map', { replace: true });
  };
  // §2/§9 zadania-eventy-2026-08-06: AddTripEntry teraz vracia AddChoice (kind: 'trip' | 'event').
  // `kind: 'event'` otvára AddEvent formulár (krok 3) namiesto TRIP flow.
  const pickAddFlow = (choice: AddChoice) => {
    setAddEntryOpen(false);
    setInlineDetailId(null);
    setAddMapPhase('off');
    if (choice.kind === 'event') {
      setAddEventFlow(choice.origin);
      return;
    }
    // ODKAZ: popup sa zavrie a mapa ostane CELÁ VIDITEĽNÁ — typ je vybraný,
    // teraz človek ukazuje miesto. Na mobile sa navyše prepne z listu na mapu,
    // inak by po výbere typu čakal klik do zoznamu výletov.
    if (choice.kind === 'note') {
      setMobileView('map');
      setNotePlacing(choice.group);
      return;
    }
    setAddFlow(choice.state);
  };
  /**
   * VÝLET / UDALOSŤ Z DLHÉHO STLAČENIA (rez C).
   *
   * Miesto je známe skôr než formulár — presne opačne než doteraz, keď sa najprv vypĺňali
   * textové polia a mapa sa hľadala až potom. Bod si odloží `seedPoint` a formulár ho
   * prevezme ako prvú kotvu; kreslenie sa otvorí samo, len čo si človek vyberie aktivitu
   * (krok 1 sprievodcu si o mapu povie sám cez `onMapPhase`).
   */
  const startFromPoint = (what: 'trip' | 'event', lat: number, lon: number) => {
    setNoteSpot(null);
    setNoteHint(false);
    setInlineDetailId(null);
    setMobileView('map');
    setSeedPoint({ lat, lon });
    setAddMapPhase('off');
    if (what === 'event') { setAddEventFlow('own'); return; }
    setAddFlow('walked');
  };

  const closeAdd = () => {
    setAddFlow(null);
    setAddMapPhase('off');
    setNotePlacing(null);
    setTripNotesState([]);
    clearTripNotes();
    setSeedPoint(null);
    setAddError('');
    // issue #35: keď sme prišli na `/pack/add/trip`, zatvorenie formulára musí vrátiť aj URL —
    // inak by na mape visela adresa ADD flow a reload/back by formulár otvoril znova.
    if (onAddRoute) navigate('/pack/map', { replace: true });
  };
  const closeAddEvent = () => {
    setAddEventFlow(null);
    setAddMapPhase('off');
    setSeedPoint(null);
    setAddError('');
    if (onAddRoute) navigate('/pack/map', { replace: true });
  };
  // AddEventDraft → zápis. Rovnaký vzor ako submitAddTripDraft (walked vetva): over zápis PRED
  // pridaním do state, nech sa neobjaví trip/event ktorý po reloade zmizne (plná localStorage).
  const submitAddEventDraft = (draft: AddEventDraft): boolean => {
    const next = [draft, ...localEvents];
    if (!writeLocalEvents(next)) {
      setAddError(t('pack.map.errorPhotosStorage'));
      return false;
    }
    setAddError('');
    setLocalEvents(next);
    closeAddEvent();
    return true;
  };

  // AddTripDraft → zápis. `walked` drží PRESNE to isté poradie ako pôvodný submitAdd (#1: over
  // zápis PRED pridaním do state, inak sa trip zobrazí a po reloade zmizne). `planned` nejde
  // cez schvaľovaciu frontu (AddTripPlan draft.approval je vždy 'approved'), rovno do My trips
  // + Events.
  const submitAddTripDraft = (draft: AddTripDraft): boolean => {
    if (draft.state === 'walked') {
      // JOURNEY = výber existujúcej magistrály (AddTripLog.tsx `existingTripId`, lokálne
      // rozšírenie AddTripDraft — addTripModel.ts sa needituje). Keď je nastavené, NEVZNIKÁ
      // nový HeroTrail/localTrails záznam (inak by 20 prechodov SNP dalo 20× 770 km čiaru) —
      // len sa označí ako prejdený a zapíše hlas na existujúce id.
      const existingTripId = (draft as AddTripDraft & { existingTripId?: string }).existingTripId;
      if (existingTripId) {
        const tid = existingTripId;
        setWalkedIds((prev) => { const n = new Set(prev); n.add(tid); return n; });
        if ((draft.paws ?? 0) > 0) {
          setVotes((prev) => ({ ...prev, [tid]: {
            tripId: tid, rating: draft.paws ?? 0,
            difficulty: (draft.diff ?? 'Moderate') as TripVote['difficulty'],
            crowd: seedCrowd({ crowd: draft.crowd } as HeroTrail) ?? 'Calm',
            comment: '', when: draft.date?.slice(0, 7) ?? '',
            hazards: (draft.hazards ?? []) as Hazard[], at: Date.now(),
          } }));
        }
        closeAdd();
        return true;
      }
      const line = draft.geometry.kind === 'route' ? (draft.geometry.snapPath ?? draft.geometry.path) : [];
      const km = (totalDistanceM(line) / 1000).toFixed(1);
      const tid = `local-${Date.now()}-${Math.round(totalDistanceM(line))}`;
      const newTrail: HeroTrail = {
        id: tid,
        name: draft.name.trim(),
        region: draft.region ?? '',
        country: draft.country,
        // paddleboard/water tripy nemajú diff selector vôbec (HIKE_LIKE guard v addTripModel.ts) →
        // draft.diff je undefined, nefabrikuje sa 'Moderate' (rovnaký bug ako v generátore).
        ...(draft.diff ? { diff: draft.diff } : {}),
        km,
        stars: draft.paws ?? 0,
        path: line,
        photos: draft.photos ?? [],
        seasons: [],
        desc: draft.note ?? '',
        dogNote: '',
        acts: [ACT_DATA_ID[draft.activity] ?? draft.activity],
        surface: draft.surface ?? [],
        crowd: draft.crowd ?? '',
        tags: draft.tags ?? [],
        author: firstName,
      };
      /**
       * VÝLET SA NESMIE STRATIŤ KVÔLI FOTKÁM (Matej 2026-08-23: „ono to musi niečo zvladnuť").
       *
       * Doteraz sa pri plnej kvóte vrátilo `false` a človek prišiel o CELÚ prácu — nakreslenú
       * trasu, značky, popis — pretože sa nezmestili obrázky. Fotky sú doplnok, trasa je práca.
       * Preto druhý pokus bez nich: keď prejde, výlet je uložený a človek sa dozvie, čo presne
       * odpadlo. Až keď zlyhá aj to, je úložisko naozaj plné a hlásime pôvodnú chybu.
       *
       * (Prvá obrana je pri VÝBERE fotky — `optimizePhoto` v AddTripLog kóduje do WebP pod
       * rozpočet ~73 kB, takže sem by sa to nemalo dostať. Toto je poistka, nie plán A.)
       */
      let next = [newTrail, ...localTrails];
      let saved = writeLocalTrails(next);
      let photosDropped = false;
      if (!saved && newTrail.photos.length > 0) {
        next = [{ ...newTrail, photos: [] }, ...localTrails];
        saved = writeLocalTrails(next);
        photosDropped = saved;
      }
      if (!saved) {
        setAddError(t('pack.map.errorPhotosStorage'));
        return false;
      }
      setAddError(photosDropped ? t('pack.map.errorPhotosDropped') : '');
      setLocalTrails(next);
      setWalkedIds((prev) => { const n = new Set(prev); n.add(tid); return n; });
      if ((draft.paws ?? 0) > 0) {
        // seedCrowd() prekladá SK hodnotu z nahadzovača (newTrail.crowd) na EN Crowd.
        setVotes((prev) => ({ ...prev, [tid]: {
          tripId: tid, rating: draft.paws ?? 0,
          difficulty: (draft.diff ?? 'Moderate') as TripVote['difficulty'],
          crowd: seedCrowd(newTrail) ?? 'Calm',
          comment: '', when: draft.date?.slice(0, 7) ?? '',
          // vlastná hrozba (§7 zadania) je voľný text kým ju Matej neschváli — cast, nie nový typ.
          hazards: (draft.hazards ?? []) as Hazard[], at: Date.now(),
        } }));
      }
      closeAdd();
      return true;
    }

    // ── PLÁNOVANIE ──
    const now = Date.now();
    const anchor: LatLngTuple[] = draft.geometry.kind === 'route'
      ? (draft.geometry.snapPath ?? draft.geometry.path)
      : (draft.geometry.center ? [draft.geometry.center] : []);
    const tid = `plan-${now}`;
    const planTrail: HeroTrail = {
      id: tid, name: draft.name.trim(), region: draft.region ?? '', country: draft.country,
      diff: 'Moderate', km: '0', stars: 0, path: anchor,
      photos: [], seasons: [], desc: '', dogNote: '',
      acts: [ACT_DATA_ID[draft.activity] ?? draft.activity], surface: [], crowd: '', tags: [],
      author: firstName,
    };
    setLocalTrails((prev) => [planTrail, ...prev]);
    const dateStr = draft.dateKind === 'flexible' ? '' : (draft.date ?? '');
    // #42 — konzervatívny default: draft.visibility chýba len na starých draftoch (autosave
    // z čias pred týmto poľom), fallback je preto 'private', NIE 'open'. Len výslovné 'open'
    // zakladá "partner" plán + verejný inzerát (trip_events) — predtým sa toto vôbec nepýtalo.
    const isOpen = draft.visibility === 'open';
    addPlan(tid, isOpen ? 'partner' : 'solo', dateStr);
    if (isOpen) {
      const ev: PartnerEvent = {
        id: `plan-event-${now}`, tripId: tid,
        dates: dateStr.length >= 7 ? [dateStr] : [],
        month: dateStr.length >= 7 ? dateStr.slice(0, 7) : dateStr,
        socialization: '', host: t('pack.map.hostAndYourDog', { name: firstName }), hostIsMe: true,
        at: now, joinedByMe: true,
      };
      setEvents((prev) => [ev, ...prev]);
    }
    closeAdd();
    return true;
  };

  // bod 1 (iterácia 15): ľavá skupina status riadku — zdieľaná medzi desktop .trp-status-row
  // (v .trp-topbar) a mobile .trp-mheader-status (i13 bod 1), presne tá istá "ako desktop"
  // logika ako predtým, len teraz pilulky namiesto holých ikoniek.
  // Matej 2026-07-22: km + ✓ SPOJENÉ do jednej pilulky (✓ N · Y km) → Walked tab; ★ → Wishlist tab.
  // Matej 2026-07-23: header konsolidovaný 4→2 pilulky. TRIPSTATS (✓ N · km) a TRIPLIST (🐾) sú dva
  // povrchy tej istej route /pack/map/triplist (?tab=stats vs list). ✓/★ dashboard modal ZRUŠENÝ,
  // wishlist splynul do triplistu.
  // Matej 2026-07-26 (tretie kolo): header rozdelený na TRI časti — ĽAVÁ = LEVEL, STRED =
  // TRIPSTATS + TRIPLIST + ADD TRIP (centrované v riadku), PRAVÁ = messages + zvonček.
  // Krajné bloky majú flex:1, stredný len svoju šírku → stred je naozaj v osi riadku, nie
  // „niekde medzi". ĽAVÁ časť = identita (avatar + PILGRIM + level v pilulke + N trips · X km),
  // klikacia na /pack/map/triplist?tab=stats — od 2026-08-05 rovnaká ako na mobile.
  // 2026-07-30 (issue #33): rang + level UŽ NIE JE hardcoded „Pútnik Lvl 1" — počíta sa z bodov
  // (`profilePointsFor` → `@/lib/tripPoints`, ceny a krivka = dashboard tab Mapa). Rovnaké číslo
  // ako vo vysvedčení, jedna funkcia pre oba povrchy. Tooltip nesie rozpad „za čo".
  //
  // 2026-08-05: IDENTITA JE JEDEN BLOK PRE PC AJ MOBIL. Matej: „pri PILGRIM nie je profilová foto
  // ako sme si povedali je to len na mobile… aj ten level (urob to tak aj na PC)" + „zosúlaď to
  // aby bolo aj na PC a daj tiež lvl do pills ako na mobile".
  // Predtým to boli DVA kusy kódu (desktop `renderStatusLeft` bez avatara, bez podriadku,
  // neklikateľný, s popiskom „Lvl"; mobil `.trp-midentity` s avatarom a pilulkou) — a presne
  // preto sa rozišli. Teraz jedna funkcia, jedna sada tried; nedá sa to rozísť po treťom redizajne.
  const renderIdentity = () => (
    <button
      type="button"
      className="trp-midentity"
      onClick={() => navigate('/pack/map/triplist?tab=stats')}
      title={t('pack.map.levelTooltip', { points: levelInfo.points, toNext: levelInfo.toNext, nextLevel: levelInfo.level + 1, rows: profilePoints.rows.map((r) => `${t(r.labelKey, r.labelParams)} ${r.points}`).join(' · ') })}
    >
      {id.avatarUrl
        ? <img className="trp-mavatar" src={id.avatarUrl} alt="" />
        : <span className="trp-mavatar trp-mavatar--initial">{id.avatarInitial}</span>}
      <span className="trp-midentity-txt">
        <span className="trp-level">
          {/* 2026-08-09: rang ide cez i18n (`pack.map.rankPilgrim`), nie cez natvrdo anglické
              `levelInfo.rank` — to isté slovo ukazuje aj karta na `/pack` a v SK to má byť
              „Pútnik", nie „Pilgrim". */}
          <span className="trp-level-name">{t('pack.map.rankPilgrim')}</span>
          {/* Matej 2026-08-03: „to LVL ma ruší" → popisok preč, ostáva holé číslo v zlatej
              pilulke. Po zjednotení (5. 8.) to platí aj na PC. */}
          <span className="trp-level-num" aria-label={t('pack.map.levelAriaLabel', { level: levelInfo.level })}><em>{levelInfo.level}</em></span>
        </span>
        <span className="trp-mstats">{t('pack.map.mstats' + pluralKey(walkedIds.size), { n: walkedIds.size, km: fmtKm(walkedKm) })}</span>
      </span>
    </button>
  );

  const renderStatusLeft = () => (
    <div className="trp-status-left">{renderIdentity()}</div>
  );

  const renderStatusCenter = () => (
    <div className="trp-status-center">
      <button type="button" className="trp-stat-pill" onClick={() => navigate('/pack/map/triplist?tab=stats')} title={t('pack.map.tripStatsTitle')}>
        <img src={ICON('trophy')} alt="" />
        <b>{walkedIds.size} · {fmtKm(walkedKm)} km</b>
      </button>
      {/* Matej 2026-07-27: na mobile (a v kompaktnom desktope) je Triplist LEN ikonka — text
          by rozbil jednoriadkový status. Klikacia plocha, route aj title/aria zostávajú. */}
      <button type="button" className="trp-stat-pill trp-stat-pill--icon" onClick={() => navigate('/pack/map/triplist')} title={t('pack.map.openTriplist')} aria-label={t('pack.map.openTriplist')}>
        <img src={ICON('clipboard')} alt="" />
        <b className="trp-triplist-label">{t('pack.map.triplist')}</b>
      </button>
      {/* ADD TRIP patrí do stredného klastra (Matej 2026-07-26) — vedľa správ nemá čo robiť,
          a je to jediný vstup do ADD flow, takže sa nesmie stratiť. */}
      <button type="button" className="trp-addtrip-btn" onClick={openAddEntry}>
        <img src={ICON('plus')} alt="" className="trp-addtrip-icon" />
        <span className="trp-addtrip-full">{t('pack.map.addTrip')}</span>
        <span className="trp-addtrip-short" aria-hidden>{t('pack.map.add')}</span>
      </button>
    </div>
  );

  // D4 nav rework (2026-07-24, Matej: "nechaj to vnútri headru a len to posun na pravý roh
  // toho vnútorného bloku") — messages sú PRIDANÉ ako sibling tohto klastra v .trp-status-row /
  // .trp-mheader-status. Matej 2026-07-26 (druhé kolo): tu ostávajú LEN dve ikonky — správy a
  // napravo od nich zvonček upozornení. NEXT TRIP (chodec + počet dní) zrušený úplne (Matej,
  // tretie kolo: „to vymaz nie je to aktualna polozka v menu na ziadnej stranke na webe" —
  // D5 badge z PackNotifications.tsx odstránený, `hideNextTrip` prop už neexistuje).
  // ADD TRIP je späť v pilulkovom rade vľavo.
  const renderHeaderRight = () => (
    <div className="trp-headright">
      <PackNotifications dark layout="inline" className="trp-header-notif" last24h={id.packToday} total={id.packTotal} />
    </div>
  );

  const visibleHeroTrails = allTrails
    .map((tr, i) => ({ tr, num: i + 1 }))
    .filter(({ tr }) => {
      // tag chip filter beží na reálnych tr.tags + tr.surface, mapované cez DATA_TAG_TO_UI/
      // SURFACE_TAG_MAP na 8-položkový vocabulary — nefabrikuje dáta, len zjednocuje polia.
      const tripTagSet = new Set([
        ...(tr.tags ?? []).map((tg) => DATA_TAG_TO_UI[tg]).filter(Boolean),
        ...(tr.surface ?? []).map((s) => SURFACE_TAG_MAP[s]).filter(Boolean),
      ]);
      return (
        // plánované výlety (neprešli sa) NEpatria do ľavého bloku „všetky výlety" — len na mapu (pin),
        // do Events a Triplistu. Po označení walked (autor) sa z plánu stane bežný trip a objaví sa tu.
        !(tr.id.startsWith('plan-') && !walkedIds.has(tr.id)) &&
        (heroDiff === '' || tr.diff === heroDiff) &&
        (heroCrowd === '' || tr.crowd === heroCrowd) &&
        (selectedCountry === '' || trailCountry(tr) === selectedCountry) &&
        // macro región (West/Center/East) filtruje cez REGION_OF[pohorie]; pohorie filtruje
        // priamo tr.region — kaskáda, oba nezávisle aplikovateľné.
        (heroMacroRegion === '' || REGION_OF[tr.region] === heroMacroRegion) &&
        // acts/tagy vedia na budúcich tripoch chýbať (typ acts?/tags? je optional) — bez poľa
        // filter NEvylučuje agresívne, radšej ukáže trip ako by ho stratil.
        (heroAct === '' || !tr.acts || tr.acts.length === 0 || tr.acts.includes(ACT_DATA_ID[heroAct] ?? heroAct)) &&
        (heroTags.size === 0 || tripTagSet.size === 0 || Array.from(heroTags).some((tg) => tripTagSet.has(tg)))
      );
    });

  // status riadok staty — reálne z lokálneho walked/fav stavu (žiadny mock); allTrails, nech
  // aj prípadný walked toggle na ADD-flow tripe počíta do celkového km (bod 2 + bod 6).
  const walkedKm = allTrails
    .filter((tr) => walkedIds.has(tr.id))
    .reduce((sum, tr) => sum + (parseFloat(tr.km) || 0), 0);
  const fmtKm = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

  // FILTER (sort) — Top rated (default) / Easiest / Hardest, ovládané z desktop popoveru aj
  // mobilného sheetu; zdieľané pole nech sa karta nerenderuje dvakrát rôzne (desktop vs mobile).
  // Matej 2026-07-27: „journey posledné nie prve" → viacdňové cesty (Cesta hrdinov SNP a spol.)
  // idú VŽDY naspodok svojej skupiny, bez ohľadu na hodnotenie. Predtým boli prvé len preto, že
  // HERO_JOURNEYS stoja na začiatku allTrails — statické poradie dát, nie rozhodnutie.
  // Ruch berieme z AGREGÁTU (seed z nahadzovača + hlasy chodcov), nie z holého `tr.crowd` —
  // to je hodnota, ktorú karta reálne ukazuje. Počíta sa RAZ do mapy, nie v komparátore:
  // sortTrips beží 2–3× za render a komparátor by crowdAggregate() volal ~n·log n krát.
  // ⚠️ ŽIADNY useMemo — sme POD early returnom `if (!id.session) return null` (~r. 2314),
  // takže hook by sa pri neprihlásenom nezavolal a React by spadol na zmene počtu hookov.
  // Mapa sa preto stavia len keď je zoradenie reálne podľa ruchu.
  const crowdRankById = new Map<string, number>();
  if (mobileSort === 'calmest') {
    for (const { tr } of visibleHeroTrails) crowdRankById.set(tr.id, crowdRank(crowdAggregate(tr, votes[tr.id]).crowd));
  }

  const sortTrips = (arr: typeof visibleHeroTrails) => [...arr].sort((a, b) => {
    const ja = a.tr.acts?.includes('journey') ? 1 : 0;
    const jb = b.tr.acts?.includes('journey') ? 1 : 0;
    if (ja !== jb) return ja - jb;
    if (mobileSort === 'easiest') return diffRank(a.tr.diff) - diffRank(b.tr.diff);
    if (mobileSort === 'hardest') return diffRank(b.tr.diff) - diffRank(a.tr.diff);
    // „Od najkľudnejšieho" (Matej 2026-08-22) — filter ruchu tu bol od 24. 7., zoradenie nie.
    // Pri rovnakom ruchu rozhoduje hodnotenie, nech poradie v skupine nie je náhodné.
    if (mobileSort === 'calmest') {
      const ca = crowdRankById.get(a.tr.id) ?? 4;
      const cb = crowdRankById.get(b.tr.id) ?? 4;
      if (ca !== cb) return ca - cb;
      return b.tr.stars - a.tr.stars;
    }
    return b.tr.stars - a.tr.stars; // 'top'
  });

  // Viewport-driven zoznam (Matej 2026-07-27) — MÄKKO, nie orezanie ako Google Maps: čo je vo
  // výreze ide hore, zvyšok ostáva pod oddeľovačom. Zoznam tak nikdy nezostane prázdny (výber
  // trasy priblíži mapu na ňu → tvrdý filter by panel takmer vyprázdnil), ale poradie sa reálne
  // premiešava podľa toho, kam sa člen na mape pozerá. Dropdown filtre (krajina/región/aktivita/
  // tagy) bežia PRED tým, vo visibleHeroTrails — viewport ich nenahrádza, len dopĺňa.
  const inViewTrails = viewBox
    ? sortTrips(visibleHeroTrails.filter(({ tr }) => {
        const box = trailBox.get(tr.id);
        return !box || boxIntersects(box, viewBox);
      }))
    : sortTrips(visibleHeroTrails);
  const elsewhereTrails = viewBox
    ? sortTrips(visibleHeroTrails.filter(({ tr }) => {
        const box = trailBox.get(tr.id);
        return !!box && !boxIntersects(box, viewBox);
      }))
    : [];
  // spoločné pole pre počty (mobilný sheet „Show N", prázdny stav) — poradie = ako sa renderuje.
  const sortedVisibleHeroTrails = [...inViewTrails, ...elsewhereTrails];

  // zoznam kariet vrátane oddeľovača — zdieľaný desktopom (.trp-cards-scroll, withRef kvôli
  // hover→scrollIntoView) a mobilom (.trp-mlist, bez ref).
  const renderTripList = (withRef: boolean) => (
    <>
      {inViewTrails.map(({ tr }) => renderTripCard(tr, withRef))}
      {elsewhereTrails.length > 0 && (
        <div className="trp-cards-sep">
          <span>{inViewTrails.length === 0 ? t('pack.map.nothingInThisView') : t('pack.map.elsewhereOnMap')}</span>
          <b>{elsewhereTrails.length}</b>
        </div>
      )}
      {elsewhereTrails.map(({ tr }) => renderTripCard(tr, withRef))}
    </>
  );

  // karta zdieľaná medzi desktop .trp-cards-scroll a mobile .trp-mlist (bod 5) — withRef len
  // pre desktop (hover→scrollIntoView), mobile ju nepotrebuje (touch, žiadny hover-scroll).
  const renderTripCard = (tr: HeroTrail, withRef: boolean) => {
    const idx = photoIdx[tr.id] ?? 0;
    // trip bez vlastnej fotky → per-aktivita placeholder (paddleboard nedostane les), stabilný podľa id
    const photo = tr.photos[idx] ?? tr.photos[0] ?? placeholderFor(tr.acts, tr.id);
    const agg = crowdAggregate(tr, votes[tr.id]);
    const others = Math.max(0, agg.walkedCount - FOUNDER_WALKERS); // Dogyptians nad zakladateľov
    // PLÁN (nepрešiel sa) = ponuka: žiadna náročnosť/popularita/hazard/rating (výlet sa neodohral).
    // Walked vie dať LEN autor → tým sa prepne na odohraný trip (walked-popup vyžiada náročnosť+popularitu).
    const isUnwalkedPlan = tr.id.startsWith('plan-') && !walkedIds.has(tr.id);
    const isMine = authorOf(tr) === firstName;
    return (
      <div
        key={tr.id}
        ref={withRef ? (el: HTMLDivElement | null) => { heroCardRefs.current[tr.id] = el; } : undefined}
        className={`trp-bigcard${hoverId === tr.id || inlineDetailId === tr.id ? ' hot' : ''}`}
        style={{ borderLeftColor: trailColor(tr.id) }}
        onMouseEnter={() => setHoverId(tr.id)}
        onMouseLeave={() => setHoverId(null)}
        onClick={() => selectTrail(tr)}
      >
        <div className="trp-bigcard-photo" style={photo ? { backgroundImage: `url('${photo}')` } : undefined}>
          <img className="trp-cardflag" src={flagUrl(trailCountry(tr))} alt="" loading="lazy" draggable={false} />
          {tr.photos.length > 1 && (
            <div className="trp-bigcard-photonav">
              <button
                type="button"
                className="trp-bigcard-photobtn"
                onClick={(e) => { e.stopPropagation(); cyclePhoto(tr.id, -1, tr.photos.length); }}
                aria-label={t('pack.map.previousPhoto')}
              >‹</button>
              <button
                type="button"
                className="trp-bigcard-photobtn"
                onClick={(e) => { e.stopPropagation(); cyclePhoto(tr.id, 1, tr.photos.length); }}
                aria-label={t('pack.map.nextPhoto')}
              >›</button>
            </div>
          )}
          {tr.photos.length > 1 && (
            <div className="trp-bigcard-dots">
              {tr.photos.map((_, i) => (
                <span key={i} className={`trp-bigcard-dot${idx === i ? ' on' : ''}`} />
              ))}
            </div>
          )}
          {/* ✓/★ v HORNOM pravom rohu fotky (bod 3, Matej 2026-07-22).
              Matej 2026-07-27: keď je trip PREJDENÝ, ostáva len zelený ✓ Walked — Triplist
              zmizne (načo plánovať, čo už máš za sebou). Rovnaká logika ako detail výletu,
              tam je navyše dropdown „Add to triplist" pre opakovanie. */}
          <div className="trp-bigcard-photoacts">
            {/* Walked: pri pláne LEN pre autora (ostatní ho nemôžu označiť ako prejdený — nebol) */}
            {(!isUnwalkedPlan || isMine) && (
              <button
                type="button"
                className={`trp-bigcard-photoactbtn trp-bigcard-photoactbtn--walked${walkedIds.has(tr.id) ? ' on' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleWalked(tr.id); }}
              >
                ✓ {t('pack.map.walked')}
                {/* Koľko bodov ten klik naozaj dá — SKUTOČNÉ číslo tejto trasy (5 + km +
                    stúpanie / pevná cena magistrály), nie paušál. Po odškrtnutí zmizne: body
                    už padli. */}
                {!walkedIds.has(tr.id) && <PointsPill value={walkPointsFor(tr)} />}
              </button>
            )}
            {!walkedIds.has(tr.id) && (
              <button
                type="button"
                className={`trp-bigcard-photoactbtn${favIds.has(tr.id) ? ' on' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleFav(tr.id); }}
              >★ {t('pack.map.triplist')}</button>
            )}
          </div>
          {/* bod 3: náročnosť · km + popularita + hazard(červený) — dolný ľavý roh fotky.
              Plán = žiadne meta (výlet sa neodohral), len „Planned" pilulka. */}
          <div className="trp-bigcard-photometa">
            {/* vodná plocha (isWaterTrail) nikdy nemá náročnosť/km — PhotoMetaPills (packCommunityUI)
                by ich vykreslilo naostro („↔  km", fake difficulty), preto sa tu pre vodu vôbec
                nevolá namiesto snahy dotlačiť do neho prázdne hodnoty. */}
            {isUnwalkedPlan
              ? <span className="trp-plannedpill">🗓️ {t('pack.map.planned')}</span>
              : isWaterTrail(tr) ? null
              : <PhotoMetaPills agg={agg} km={tr.km} ascentM={(tr as { ascentM?: number }).ascentM} />}
          </div>
        </div>
        {/* bod 3: telo karty = 2 stĺpce — vľavo 3 riadky (loc/název/autor), vpravo
            rating(packy)·difficulty·Crowd (CROWD_LABELS už nesie emoji, napr. "🌿 Calm"). */}
        <div className="trp-bigcard-body">
          <div className="trp-bigcard-info">
            {/* pohorie · región label pod fotkou (Matejov feedback bod 3) — región
                len keď je pohorie namapované cez REGION_OF (guard, nič sa nefabrikuje) */}
            {/* Pohorie je vlastné meno (neprekladá sa), macro región áno — inak stálo pod
                slovenským zoznamom „MALÉ KARPATY · WEST". Kľúče `pack.map.macroRegion.*`. */}
            <div className="trp-bigcard-loc">{tr.region}{REGION_OF[tr.region] ? ` · ${t(`pack.map.macroRegion.${REGION_OF[tr.region]}`)}` : ''}</div>
            <div className="trp-bigcard-name">{tr.name}</div>
            {/* autor = svorka čo prešla trip; „+N Dogyptians" = walkeri nad zakladateľov
                (Matej 2026-07-22 — walked count sa presunul sem z crowd stĺpca). */}
            <div className="trp-bigcard-authorrow">
              <AuthorAvatars author={authorOf(tr)} size={16} />
              <button
                type="button"
                className="trp-bigcard-author trp-authorbtn"
                onClick={(e) => { e.stopPropagation(); setCreatorTrail(tr); }}
              >{t('pack.map.byAuthor', { author: authorOf(tr) })}{others > 0 ? ` · ${t('pack.map.plusDogyptians' + pluralKey(others), { n: others })}` : ''}</button>
            </div>
          </div>
          {/* bod 3 (Matej 2026-07-22): pravý stĺpec = LEN veľký rating (1 packa + X.Y). Náročnosť/
              popularita/hazard sa presunuli na fotku (PhotoMetaPills vyššie).
              Plán = žiadne hodnotenie (výlet sa neodohral).
              rating = 0 znamená ŽIADNY hlas (Matej 2026-08-03: „neprešli = žiadny rating"). */}
          {!isUnwalkedPlan && agg.rating > 0 && <BigRating rating={agg.rating} compact />}
        </div>
      </div>
    );
  };

  return (
    <div className={`trp-root${mobileView === 'list' ? ' mlist-active' : ''}`}>
      <style>{CSS}</style>
      <style>{MAP_NOTES_CSS}</style>
      {/* Vlastný <style>, hoci ten istý blok nesie aj MAP_NOTES_CSS vyššie: značka udalosti
          nesmie visieť na tom, že je práve pripojená vrstva zápisov. Dvakrát vložené
          zhodné CSS je bez následku. */}
      <style>{CIRCLE_MARK_CSS}</style>
      <style>{DELETE_BUTTON_CSS}</style>
      <style>{LONG_PRESS_CSS}</style>
      <style>{ADD_NOTE_CSS}</style>
      <style>{MAP_NOTE_CURSOR_CSS}</style>
      <style>{NOTE_PALETTE_CSS}</style>
      <style>{COMMUNITY_CSS}</style>
      <style>{POINTS_PILL_CSS}</style>
      <style>{PARTY_CARD_CSS}</style>

      {/* floating dark "Explore" panel — no header, margined off top/left/bottom. Bod 4/6:
          3 mutually-exclusive stavy (LIST default / inline DETAIL / ADD setup), desktop-only
          (mobile ho celý skrýva — bod 5, viď .trp-sidebar{display:none} v mobile media query). */}
      {/* `is-tool` = panel je práve v stave ADD, teda JE tým „panelom nástrojov" zo zámku §2.2b
          a ako jediný kus chrome pod `trp-draw-lock` ostáva. V stave LIST/DETAIL je to
          prehliadanie a zámok ho schová (viď body.trp-draw-lock v CSS vyššie). */}
      <aside className="trp-sidebar">
        {inlineDetailId ? (() => {
          const dt = allTrails.find((x) => x.id === inlineDetailId);
          if (!dt) return null;
          const idx = photoIdx[dt.id] ?? 0;
          const photo = dt.photos[idx] ?? dt.photos[0] ?? placeholderFor(dt.acts, dt.id);
          // bod 4 (i12): tagy/aktivity s emoji (rovnaký vocabulary ako filter chipy nižšie).
          const dtChips = [
            ...(dt.acts ?? []).map((a) => ({ key: `a:${a}`, label: a, emoji: ACT_EMOJI[a] ?? '' })),
            // 'In the middle of nature'/'nowhere' zrušené (Matej 2026-07-26) — filter aj tu, nielen
            // v TAG_VOCAB, lebo dtChips číta dt.tags priamo (surová dátová hodnota, nie cez TAG_VOCAB).
            ...(dt.tags ?? []).filter((tg) => tg !== 'In the middle of nature' && tg !== 'In the middle of nowhere').map((tg) => ({ key: `t:${tg}`, label: tg, emoji: TAG_EMOJI[tg] ?? '' })),
          ];
          const dtAgg = crowdAggregate(dt, votes[dt.id]);
          const isUnwalkedPlan = dt.id.startsWith('plan-') && !walkedIds.has(dt.id);
          const isMine = authorOf(dt) === firstName;
          return (
            <div className="trp-inldet">
              <div className="trp-inldet-head">
                <button type="button" className="trp-panelnav-btn" onClick={() => { setInlineDetailId(null); setHeroBounds(SVK_BORDER); }} aria-label={t('pack.map.backToList')}>←</button>
                <button type="button" className="trp-panelnav-btn" onClick={() => expandDetail(dt.id)} aria-label={t('pack.map.expandToFullPage')}>⤢</button>
              </div>
              <div className="trp-inldet-body">
                {/* bod 4 (iterácia 15): fotka — avatar autora (initial, ľavý horný roh) + bočné
                    šípky (reused .trp-bigcard-photonav) + ♡ zmenené na ★ "Add to wishlist"
                    textové tlačidlo (dolný pravý roh, ako karta bod 3). */}
                <div className="trp-inldet-photowrap">
                  {photo && <div className="trp-inldet-photo" style={{ backgroundImage: `url('${photo}')` }} />}
                  <div className="trp-inldet-authoravatar" title={t('pack.map.byAuthor', { author: authorOf(dt) })}>
                    <span>{authorOf(dt).charAt(0).toUpperCase()}</span>
                  </div>
                  {/* Matej 2026-07-22: ✓ walked + ★ wishlist v hornom pravom rohu fotky (rovnaký
                      princíp ako karta; „mark as walked" zmizlo zo spodu detailu → je tu). */}
                  <div className="trp-bigcard-photoacts">
                    {/* Walked: pri pláne LEN autor (ostatní nemôžu — výlet sa neodohral).
                        Prejdený → Triplist zmizne (Matej 2026-07-27, ako karta aj detail). */}
                    {(!isUnwalkedPlan || isMine) && (
                      <button
                        type="button"
                        className={`trp-bigcard-photoactbtn trp-bigcard-photoactbtn--walked${walkedIds.has(dt.id) ? ' on' : ''}`}
                        onClick={() => toggleWalked(dt.id)}
                      >
                        ✓ {walkedIds.has(dt.id) ? t('pack.map.walked') : t('pack.map.markWalked')}
                        {!walkedIds.has(dt.id) && <PointsPill value={walkPointsFor(dt)} />}
                      </button>
                    )}
                    {!walkedIds.has(dt.id) && (
                      <button
                        type="button"
                        className={`trp-bigcard-photoactbtn${favIds.has(dt.id) ? ' on' : ''}`}
                        onClick={() => toggleFav(dt.id)}
                      >★ {favIds.has(dt.id) ? t('pack.map.inTriplist') : t('pack.map.triplist')}</button>
                    )}
                  </div>
                  {/* náročnosť · km + popularita + hazard(červený) — dolný ľavý roh fotky.
                      Plán = žiadne meta, len „Planned" pilulka. */}
                  <div className="trp-bigcard-photometa">
                    {/* vodná plocha nikdy nemá náročnosť/km, viď komentár pri karte vyššie. */}
                    {isUnwalkedPlan
                      ? <span className="trp-plannedpill">🗓️ {t('pack.map.planned')}</span>
                      : isWaterTrail(dt) ? null
                      : <PhotoMetaPills agg={dtAgg} km={dt.km} ascentM={(dt as { ascentM?: number }).ascentM} />}
                  </div>
                  {dt.photos.length > 1 && (
                    <div className="trp-bigcard-photonav">
                      <button type="button" className="trp-bigcard-photobtn" onClick={() => cyclePhoto(dt.id, -1, dt.photos.length)} aria-label={t('pack.map.previousPhoto')}>‹</button>
                      <button type="button" className="trp-bigcard-photobtn" onClick={() => cyclePhoto(dt.id, 1, dt.photos.length)} aria-label={t('pack.map.nextPhoto')}>›</button>
                    </div>
                  )}
                  {dt.photos.length > 1 && (
                    <div className="trp-bigcard-dots">
                      {dt.photos.map((_, i) => <span key={i} className={`trp-bigcard-dot${idx === i ? ' on' : ''}`} />)}
                    </div>
                  )}
                </div>

                {/* bod 4 (i15) + bod 1/2/6 (i16): 2 stĺpce ako karta — vľavo 3 riadky (loc/
                    název/autor+avatarpair), vpravo rating(packy+číslo)+difficulty+km+Crowd */}
                <div className="trp-inldet-main">
                  <div className="trp-inldet-info">
                    <div className="trp-inldet-loc">{dt.region}{REGION_OF[dt.region] ? ` · ${t(`pack.map.macroRegion.${REGION_OF[dt.region]}`)}` : ''}</div>
                    <div className="trp-inldet-name">{dt.name}</div>
                    {/* bod 6 (iterácia 16): dva avatary (majiteľ+pes) vedľa "by {author}" */}
                    <div className="trp-inldet-authorrow">
                      <AuthorAvatars author={authorOf(dt)} size={22} />
                      <button
                        type="button"
                        className="trp-inldet-author trp-authorbtn"
                        onClick={(e) => { e.stopPropagation(); setCreatorTrail(dt); }}
                      >{t('pack.map.byAuthor', { author: authorOf(dt) })}{dtAgg.walkedCount - FOUNDER_WALKERS > 0 ? ` · ${t('pack.map.plusDogyptians' + pluralKey(dtAgg.walkedCount - FOUNDER_WALKERS), { n: dtAgg.walkedCount - FOUNDER_WALKERS })}` : ''}</button>
                    </div>
                  </div>
                  {/* Matej 2026-07-22: pravý stĺpec = LEN veľký rating (1 packa + X.Y). Náročnosť/
                      popularita/hazard sú na fotke (PhotoMetaPills). */}
                  {/* rating = 0 znamená ŽIADNY hlas (Matej 2026-08-03: „neprešli = žiadny rating")
                      — rovnaká pomlčka ako pri nekonanom pláne, nie „0.0". */}
                  {isUnwalkedPlan || dtAgg.rating <= 0
                    ? <span className="trp-norating" title={isUnwalkedPlan ? t('pack.map.notRatedPlanned') : t('pack.map.notRatedUnwalked')}>— —</span>
                    : <BigRating rating={dtAgg.rating} />}
                </div>

                {/* bod 4: tagy JEDEN riadok vedľa seba + hazard chipy (Matej 2026-07-22: hazard je
                    LEN tu, vedľa tagov — nie na fotke), POTOM text popisu pod nimi. */}
                {(dtChips.length > 0 || (!isUnwalkedPlan && dtAgg.hazardBreakdown.length > 0)) && (
                  <div className="trp-inldet-tagrow">
                    {dtChips.map((c) => <span key={c.key} className="trp-inldet-tag">{c.emoji ? `${c.emoji} ` : ''}{c.label}</span>)}
                    {!isUnwalkedPlan && <HazardTags agg={dtAgg} />}
                  </div>
                )}

                {/* #41 — KTO TENTO VÝLET VYPÍSAL. Nie autor trasy (`authorOf` je textové pole
                    datasetu), ale reálny člen, ktorý má trasu ako otvorený výlet v DB.
                    Karta je zámerne chudobná — o cudzom človeku appka vie len meno, psa,
                    fotku a poradové číslo (viď PartyMemberCard.tsx). Klik na ikonku rozbalí
                    TripProfileCard toho istého člena (majiteľ + pes, žiadna druhá karta). */}
                {(openHostsBySlug.get(dt.id) ?? []).length > 0 && (
                  <div className="trp-inldet-section">
                    <h4>{t('pack.map.openTripFromPack')}</h4>
                    {(openHostsBySlug.get(dt.id) ?? []).map((h) => {
                      const orgKey = `${h.key}:org`;
                      return (
                        <div key={h.key} className="trp-inldet-host">
                          <PartyMemberCard
                            member={h.organizer}
                            roleLabel={h.date ? t('pack.map.tripHostDate', { date: h.date }) : t('pack.map.tripHost')}
                            dm={{ tripSlug: dt.id, organizerId: h.organizerId, isMe: h.organizerId === id.session?.user?.id }}
                            onOpenProfile={() => setExpandedPartyKey((cur) => (cur === orgKey ? null : orgKey))}
                          />
                          {expandedPartyKey === orgKey && (
                            <div style={{ marginTop: 8 }}>
                              <TripProfileCard {...partyMemberToProfileCardProps(h.organizer)} />
                            </div>
                          )}
                          {h.joiners.map((j, i) => {
                            const jKey = `${h.key}:joiner:${i}`;
                            return (
                              <Fragment key={jKey}>
                                <PartyMemberCard
                                  member={j}
                                  dm={{ tripSlug: dt.id, organizerId: h.organizerId }}
                                  onOpenProfile={() => setExpandedPartyKey((cur) => (cur === jKey ? null : jKey))}
                                />
                                {expandedPartyKey === jKey && (
                                  <div style={{ marginTop: 8 }}>
                                    <TripProfileCard {...partyMemberToProfileCardProps(j)} />
                                  </div>
                                )}
                              </Fragment>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}

                {tripText(dt, 'desc', lang) && <p className="trp-inldet-desc">{tripText(dt, 'desc', lang)}</p>}
                {tripText(dt, 'dogNote', lang) && <p className="trp-inldet-desc">🐾 {tripText(dt, 'dogNote', lang)}</p>}

                {(dt as { elev?: number[] }).elev && (
                  <div className="trp-inldet-section">
                    <h4>{t('pack.map.elevationProfile')}</h4>
                    <ElevationProfile elev={(dt as { elev?: number[] }).elev} km={parseFloat(dt.km) || 0} />
                  </div>
                )}

                <div className="trp-inldet-section">
                  {/* Matej 2026-08-03: pri nule chodcov JEDEN riadok a nech je to výzva, nie
                      konštatovanie — drží sa v zhode s PackTripArticle.tsx. */}
                  {dtAgg.walkedCount === 0
                    ? <h4>{t('pack.map.beFirstToWalk')}</h4>
                    : <h4>{t('pack.map.walkedBy' + pluralKey(dtAgg.walkedCount), { n: dtAgg.walkedCount })}</h4>}
                </div>
                {/* §14 zadania (2026-07-23): komentová sekcia nahrádza staré "Message owner" /
                    "Open trip group" placeholdery — reviews (paw rating + voliteľný text) + advice.
                    §15 (2026-07-23): walked/onMarkWalked napojené na existujúci walkedIds stav —
                    "Add review" je gated na walked, submit markuje walked (markWalked, additive). */}
                <TripComments tripId={dt.id} tripName={dt.name} walked={walkedIds.has(dt.id)} onMarkWalked={() => markWalked(dt.id)} onRequestWalk={() => setWalkedPopupId(dt.id)} />
                {/* ZMAZAŤ PLÁNOVANÝ VÝLET (2026-08-22) — jediné miesto v appke, odkiaľ 🎯 z mapy
                    zmizne. A je to zároveň jediné miesto, KDE SA TAKÝ VÝLET DÁ NÁJSŤ: neprejdený
                    plán je zo zoznamu „všetky výlety" zámerne vylúčený (viď filter vyššie), takže
                    človek sa sem dostane len klikom na jeho pin. Preto tlačidlo nesmie žiť
                    v zozname — muselo by čakať na výlet, ktorý sa v ňom nikdy neukáže.
                    ⚠️ Vlastníctvo sa NETESTUJE cez `isMine` (autor === moje krstné meno), hoci
                    to robí zvyšok tejto karty. Na plánoch to nefunguje: Matejova Oravská priehrada
                    má v `author` uložené „Guest" (plán vznikol, kým sa profil ešte nedotiahol),
                    takže by si vlastný výlet zmazať NEMOHOL. Meno je aj inak zlý kľúč — zmení sa
                    v profile a stratíš prístup ku všetkému staršiemu, a dvaja Mateji v svorke by
                    si videli do plánov navzájom.
                    Správny test: plán žije v MOJOM `localTrails` (prehliadač) a nikde inde — kto
                    ho tam má, ten ho vytvoril. Keď plány dostanú DB, nahradí to `user_id`. */}
                {isUnwalkedPlan && localTrails.some((lt) => lt.id === dt.id) && (
                  <div className="trp-inldet-section">
                    <DeleteButton
                      variant="ghost"
                      label={t('pack.map.deletePlan')}
                      hint={t('pack.map.deletePlanAsk')}
                      onConfirm={() => deletePlannedTrip(dt.id)}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })() : (
        <>
        <div className="trp-sidebar-top">
          {/* bod 2 (Matej 2026-07-22): pozdrav + filter ikonka (sliders) v pravom rohu — otvára
              sort popover (Top rated/Easiest/Hardest/Calmest), rovnaká ikonka ako mobilný filter. */}
          <div className="trp-greet-row">
            <div>
              <div className="trp-greet-hi">{t('pack.map.greetHi', { name: firstName })}</div>
              <div className="trp-greet-sub">{t('pack.map.greetSub')}</div>
            </div>
            <div className="trp-greet-filterwrap">
              <button type="button" className={`trp-greet-filter${mobileSort !== 'top' ? ' on' : ''}`} onClick={() => setSortOpen((v) => !v)} aria-label={t('pack.map.sortAndFilter')}>
                <img src={ICON('sliders')} alt="" />
              </button>
              {sortOpen && (
                <div className="trp-sortpop trp-sortpop--desk">
                  {([['top', t('pack.map.sortTopRated')], ['easiest', t('pack.map.sortEasiest')], ['hardest', t('pack.map.sortHardest')], ['calmest', t('pack.map.sortCalmest')]] as const).map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      className={mobileSort === v ? 'on' : ''}
                      onClick={() => { setMobileSort((cur) => (cur === v ? 'top' : v)); setSortOpen(false); }}
                    >{l}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="trp-cat-pills">
            <button type="button" className={`trp-catpill${activeCat === 'trips' ? ' on' : ''}`} onClick={() => setActiveCat('trips')}>{t('pack.map.catTrips')}</button>
            {/* design §D: Events sa aktivoval — zoznam plánovaných spoločných výletov + join.
                Matej 2026-07-26: presunuté hneď vedľa Trips (pred Places/Services placeholdery). */}
            <button type="button" className={`trp-catpill${activeCat === 'events' ? ' on' : ''}`} onClick={() => setActiveCat('events')}>{t('pack.map.catEvents')}</button>
            {/* Matej 2026-08-06: MIESTA (Places) pill preč — PLACE ako filter kategória bola
                zrušená (pláže/lúky/parky sú TRIP cez aktivitu `explore`, viď zadanie-eventy §A).
                i18n kľúč `pack.map.catPlaces` ostáva v locale súboroch pre prípadné budúce použitie. */}
            <button type="button" className="trp-catpill soon" disabled data-tip={t('pack.map.comingSoon')}>{t('pack.map.catServices')}</button>
          </div>

          {/* geo/tag filtre sú trip-specifické — pri Events kategórii sa skryjú. */}
          {activeCat === 'trips' && (<>
          {/* geo kaskáda (Matejov feedback bod 4; Tagy presunuté do top baru a Activity sem
              2026-07-27, viď zadanie „kozmetická úprava filtrov"): country (malinký, flag+kód)
              → región (West/Center/East) → activity. Activity je MIMO SK-podmienky nižšie —
              musí byť v riadku vždy, aj keď je krajina iná ako SK a Region sa skryje. */}
          <div className="trp-georow">
            <select
              className="trp-country-select"
              value={selectedCountry}
              aria-label={t('pack.map.country')}
              onChange={(e) => applyCountry(e.target.value)}
            >
              {availableCountries.length > 1 && <option value="">🌍 {t('pack.map.all')}</option>}
              {availableCountries.map((c) => (
                <option key={c} value={c}>{flagEmoji(c)} {c.toUpperCase()}</option>
              ))}
            </select>
            {/* F1 (Matej 2026-07-24): „Preč »all ranges« — zbytočne komplikované." → druhostupňový
                dropdown POHORÍ zrušený, filtruje sa len makro-regiónom West/Center/East. Pohorie
                ostáva viditeľné na karte tripu (trp-bigcard-loc), len sa podľa neho nefiltruje. */}
            {(selectedCountry === '' || selectedCountry === 'sk') && (
            <select
              className="trp-filter-select"
              value={heroMacroRegion}
              onChange={(e) => setHeroMacroRegion(e.target.value as typeof heroMacroRegion)}
              aria-label={t('pack.map.region')}
            >
              <option value="">{t('pack.map.allRegions')}</option>
              {MACRO_REGIONS.map((r) => (
                <option key={r} value={r}>{t(`pack.map.macroRegion.${r}`)}</option>
              ))}
            </select>
            )}
            <select
              className="trp-filter-select"
              value={heroAct}
              onChange={(e) => setHeroAct(e.target.value as typeof heroAct)}
              aria-label={t('pack.map.activity')}
            >
              <option value="">{t('pack.map.activities')}</option>
              {TRIP_ACTIVITIES.map((a) => (
                <option key={a.id} value={a.id}>{ACT_EMOJI[a.id]} {t(`pack.map.activityLabel.${a.id}`)}</option>
              ))}
            </select>
          </div>
          </>)}
        </div>

        <div className="trp-cards-scroll">
          <div className="trp-cards">
            {activeCat === 'trips'
              ? renderTripList(true)
              : (<>
                  {/* EVENT zoznam (krok 5, zadanie-eventy §9 krok 5) — pridané NAD existujúci
                      „looking for pack" EventsView nižšie (iná entita, § zadania §1: EVENT nemá
                      väzbu na trip). withRef=true = registruje card-refy pre pin→scroll (desktop). */}
                  <EventsPanel
                    events={visibleEvents}
                    view={eventsView}
                    onViewChange={setEventsView}
                    selectedId={selectedEventId}
                    expandedId={expandedEventId}
                    onCardClick={handleEventCardClick}
                    onAddEvent={openAddEntry}
                    withRef
                    cardRefs={eventCardRefs}
                    onDelete={deleteLocalEvent}
                  />
                  {/* 🔴 EVENTRIPY (looking-for-pack) LEN v „upcoming" (Matej 2026-08-06:
                      „v archive nebudu predsa tripy tie sa loguju len do tripov"). Naplánovaný
                      výlet po termíne NEIDE do archívu podujatí — vsiakne sa do tripu ako log
                      v jeho histórii. Archív patrí VÝHRADNE podujatiam. */}
                  {eventsView === 'upcoming' && (
                    <EventsView events={events} trailsById={trailsById} onJoin={joinEvent} onToggleClosed={toggleEventClosed} onOpenProfile={(mid) => navigate('/pack/u/' + mid)} photoFor={(tr) => tr.photos[0] ?? placeholderFor(tr.acts, tr.id)} onOpenTrip={(tid) => { setActiveCat('trips'); selectTrail(trailsById(tid) ?? HERO_TRAILS[0]); }} onBrowseTrips={() => setActiveCat('trips')} myId={id.session?.user?.id ?? null} onShareTrip={shareTripLink} onDelete={deleteListing} />
                  )}
                </>)}
          </div>
        </div>
        </>
        )}
      </aside>

      {/* mobile-only liquid-glass header (bod 5 i11, bod 7 i12, bod 1 i13/i15) — 2 riadky:
          (1) status = avatar + renderStatusRight() pilulky (rovnaká "ako desktop
          .trp-status-row" logika, i15 bod 1 — km/✓/★/ADD TRIP), (2) search +
          Activity/Difficulty/Crowd + FILTER (sort) icon. Replaces the floating .trp-topbar on
          ≤760px. Visible in BOTH mobile map/list views. */}
      <div className="trp-mheader">
        {/* 2026-08-03 (Matej: „na mobil je toho veľa... potrebujem to vylepšiť tak aby to viac
            dýchalo"): mobilný status riadok UŽ NIE JE zdieľaný trojdielny split z desktopu.
            Desktop (.trp-topbar) ostáva 1:1 ako bol („na PC je to v skutku fajn"), mobil dostal
            vlastnú štruktúru — riadok 1 = ČISTÁ IDENTITA, nič iné:
              [avatar] PILGRIM Lvl 15            [✉ 🔔]
                       64 trips · 1550 km
            Trophy pilulka (TRIPSTATS) zanikla — číslo žije ako podriadok pod menom, takže
            ubudol celý prvok a údaj ostal viditeľný bez ťuknutia. Klik na celý blok vedie tam,
            kam viedla pilulka (/pack/map/triplist?tab=stats).
            TRIPLIST sa presunul do LIST pohľadu (.trp-mlist-head), ADD TRIP na plávajúci FAB
            nad mapou (.trp-mfab) — v hornom rohu bol horšie dosiahnuteľný palcom.
            Avatar sa sem VRACIA (Matej: „Hor pri PILGRIM z lavej strane musí byť FOTO/avatar
            užívateľa") — v D4 nav reworku 2026-07-24 bol odsťahovaný do PackBottomNav; tam
            zostáva ako navigácia, tu je identita, nie duplicita ovládania. */}
        <div className="trp-mheader-status">
          {/* tá istá identita ako na PC — `renderIdentity()` vyššie */}
          {renderIdentity()}
          {renderHeaderRight()}
        </div>
        <div className="trp-mheader-row2">
          <div className="trp-mapsearch">
            <img src={ICON('globe')} alt="" />
            <input
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              placeholder={t('pack.map.searchAPlace')}
            />
          </div>
          {/* Matej 2026-07-27: jedna „Filters · N" pilulka namiesto troch selectov — všetky
              filtre (včetane country/region/tagov, ktoré na mobile chýbali ÚPLNE) žijú v sheete. */}
          <div className="trp-mfilterwrap">
            <button
              type="button"
              className={`trp-mfilterbtn${activeFilterCount > 0 ? ' on' : ''}`}
              onClick={() => setFilterSheetOpen(true)}
              aria-label={t('pack.map.filters')}
              aria-expanded={filterSheetOpen}
            >
              <img src={ICON('sliders')} alt="" />
              <span>{activeFilterCount > 0 ? t('pack.map.filtersCount', { n: activeFilterCount }) : t('pack.map.filters')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILNÝ FILTER SHEET (Matej 2026-07-27: „na mobile nevidím country, tagy, ani
          region... kde to je?") — country/region/Activity žili len v .trp-sidebar a Tags len
          v .trp-topbar, oboje display:none pod 1024px, takže na mobile neexistovali. Tu sú
          všetky filtre pohromade + sort. Stav je zdieľaný s desktopom (rovnaké setre), takže
          filter nastavený na mobile platí aj po rozšírení okna. ── */}
      {filterSheetOpen && (
        <>
          <div className="trp-msheet-back" onClick={() => setFilterSheetOpen(false)} aria-hidden />
          <div className="trp-msheet" role="dialog" aria-label={t('pack.map.filters')}>
            <div className="trp-msheet-grab" aria-hidden />
            <div className="trp-msheet-head">
              <span className="trp-msheet-title">{t('pack.map.filters')}</span>
              <button type="button" className="trp-msheet-x" onClick={() => setFilterSheetOpen(false)} aria-label={t('pack.map.closeFilters')}>✕</button>
            </div>

            <div className="trp-msheet-body">
              <div className="trp-msheet-pair">
                <div className="trp-msheet-field">
                  <span className="trp-msheet-label">{t('pack.map.country')}</span>
                  <select className="trp-msheet-select" value={selectedCountry} aria-label={t('pack.map.country')} onChange={(e) => applyCountry(e.target.value)}>
                    {availableCountries.length > 1 && <option value="">🌍 {t('pack.map.all')}</option>}
                    {availableCountries.map((c) => (
                      <option key={c} value={c}>{flagEmoji(c)} {c.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                {/* Región (West/Center/East) je SK-špecifický — rovnaká podmienka ako v paneli. */}
                {(selectedCountry === '' || selectedCountry === 'sk') && (
                  <div className="trp-msheet-field">
                    <span className="trp-msheet-label">{t('pack.map.region')}</span>
                    <select
                      className="trp-msheet-select"
                      value={heroMacroRegion}
                      aria-label={t('pack.map.region')}
                      onChange={(e) => setHeroMacroRegion(e.target.value as typeof heroMacroRegion)}
                    >
                      <option value="">{t('pack.map.allRegions')}</option>
                      {MACRO_REGIONS.map((r) => <option key={r} value={r}>{t(`pack.map.macroRegion.${r}`)}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="trp-msheet-field">
                <span className="trp-msheet-label">{t('pack.map.activity')}</span>
                <select className="trp-msheet-select" value={heroAct} aria-label={t('pack.map.activity')} onChange={(e) => setHeroAct(e.target.value as typeof heroAct)}>
                  <option value="">{t('pack.map.activities')}</option>
                  {TRIP_ACTIVITIES.map((a) => (
                    <option key={a.id} value={a.id}>{ACT_EMOJI[a.id]} {t(`pack.map.activityLabel.${a.id}`)}</option>
                  ))}
                </select>
              </div>

              <div className="trp-msheet-pair">
                <div className="trp-msheet-field">
                  <span className="trp-msheet-label">{t('pack.map.difficulty')}</span>
                  <select className="trp-msheet-select" value={heroDiff} aria-label={t('pack.map.difficulty')} onChange={(e) => setHeroDiff(e.target.value as typeof heroDiff)}>
                    <option value="">{t('pack.map.any')}</option>
                    <option value="Easy">{t('pack.map.diff.Easy')}</option>
                    <option value="Moderate">{t('pack.map.diff.Moderate')}</option>
                    <option value="Hard">{t('pack.map.diff.Hard')}</option>
                    <option value="Odyssey">{t('pack.map.diff.Odyssey')}</option>
                  </select>
                </div>
                <div className="trp-msheet-field">
                  {/* D2 (LOCKED 2026-07-24): Crowd = Empty · Calm · Busy */}
                  <span className="trp-msheet-label">{t('pack.map.crowd')}</span>
                  <select className="trp-msheet-select" value={heroCrowd} aria-label={t('pack.map.crowd')} onChange={(e) => setHeroCrowd(e.target.value as typeof heroCrowd)}>
                    <option value="">{t('pack.map.any')}</option>
                    {Object.entries(CROWD_LABELS).map(([sk]) => (
                      <option key={sk} value={sk}>{t(`pack.map.crowdLabel.${sk}`)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="trp-msheet-field">
                <span className="trp-msheet-label">{t('pack.map.tags')}</span>
                <div className="trp-msheet-chips">
                  {TAG_VOCAB.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`trp-msheet-chip${heroTags.has(tag) ? ' on' : ''}`}
                      aria-pressed={heroTags.has(tag)}
                      onClick={() => toggleTag(tag)}
                    >{TAG_EMOJI[tag] ? `${TAG_EMOJI[tag]} ` : ''}{TAG_I18N[tag] ? t(TAG_I18N[tag]) : tag}</button>
                  ))}
                </div>
              </div>

              <div className="trp-msheet-field">
                <span className="trp-msheet-label">{t('pack.map.sort')}</span>
                <div className="trp-msheet-chips">
                  {([['top', t('pack.map.sortTopRated')], ['easiest', t('pack.map.sortEasiest')], ['hardest', t('pack.map.sortHardest')], ['calmest', t('pack.map.sortCalmest')]] as const).map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      className={`trp-msheet-chip${mobileSort === v ? ' on' : ''}`}
                      aria-pressed={mobileSort === v}
                      onClick={() => setMobileSort((cur) => (cur === v ? 'top' : v))}
                    >{l}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="trp-msheet-foot">
              <button type="button" className="trp-msheet-clear" disabled={activeFilterCount === 0} onClick={clearAllFilters}>{t('pack.map.clear')}</button>
              <button type="button" className="trp-msheet-show" onClick={() => setFilterSheetOpen(false)}>
                {t('pack.map.show', { n: sortedVisibleHeroTrails.length })}
              </button>
            </div>
          </div>
        </>
      )}

      {/* LIST/MAP toggle (mobile only) — default view = map, bod 5.
          Ikonka ukazuje CIEĽ prepnutia, rovnako ako text (v mape ponúka „List", v zozname
          „Map") — nie aktuálny stav. */}
      <div className="trp-mactions">
        <button
          type="button"
          className="trp-mtoggle"
          onClick={() => setMobileView((v) => (v === 'map' ? 'list' : 'map'))}
        >
          <img src={ICON(mobileView === 'map' ? 'menu' : 'map')} alt="" />
          {mobileView === 'map' ? t('pack.map.list') : t('pack.map.mapLabel')}
        </button>
        {/* ADD TRIP (mobile) — presunuté z .trp-mheader-status 2026-08-03. Zostáva viditeľné aj
            v LIST pohľade: dvojica je centrovaná ako celok, takže skrytie ADD by LIST vystrelilo
            z osi. */}
        <button type="button" className="trp-mfab" onClick={openAddEntry}>
          <img src={ICON('plus')} alt="" />
          {t('pack.map.add')}
        </button>
      </div>

      {/* full-page card list (mobile 'list' view — replaces the map, not an overlay) */}
      <div className="trp-mlist">
        <div className="trp-mlist-head">
          <button
            type="button"
            className="trp-mlist-triplist"
            onClick={() => navigate('/pack/map/triplist')}
            title={t('pack.map.openTriplist')}
          >
            <img src={ICON('clipboard')} alt="" />
            {t('pack.map.triplist')}
          </button>
        </div>
        <div className="trp-cards">
          {activeCat === 'trips'
            ? renderTripList(false)
            : (<>
                {/* mobile — rovnaký zoznam, bez card-refov (withRef=false, žiadny hover-scroll na touch). */}
                <EventsPanel
                  events={visibleEvents}
                  view={eventsView}
                  onViewChange={setEventsView}
                  selectedId={selectedEventId}
                  expandedId={expandedEventId}
                  onCardClick={handleEventCardClick}
                  onAddEvent={openAddEntry}
                  onDelete={deleteLocalEvent}
                />
                {/* 🔴 to isté gatovanie ako na desktope (~2882): eventripy do archívu NEPATRIA. */}
                {eventsView === 'upcoming' && (
                  <EventsView events={events} trailsById={trailsById} onJoin={joinEvent} onToggleClosed={toggleEventClosed} onOpenProfile={(mid) => navigate('/pack/u/' + mid)} photoFor={(tr) => tr.photos[0] ?? placeholderFor(tr.acts, tr.id)} onOpenTrip={(tid) => navigate(tripPathById(tid, allTrails))} onBrowseTrips={() => setActiveCat('trips')} myId={id.session?.user?.id ?? null} onShareTrip={shareTripLink} onDelete={deleteListing} />
                )}
              </>)}
        </div>
      </div>

      {/* ── FORMULÁR PRIDÁVANIA — JEDEN HOSTITEĽ, JEDNA KÓPIA ───────────────────────────
          Do 23. 8. tu stála DRUHÁ kópia toho istého formulára a prvá bola v `.trp-sidebar`;
          o tom, ktorá je vidno, rozhodovalo CSS. S krokovým sprievodcom by z toho boli dvaja
          sprievodcovia s vlastným číslom kroku, preto kópia zanikla. Tvar mení CSS:
          na PC plávajúci panel vedľa mapy, na mobile celá obrazovka.

          `is-hidden` = krok 1 na mobile (obrazovkou je MAPA) alebo práve prebiehajúce
          zapichovanie značky. Je to `display:none`, NIE unmount — formulár by inak stratil
          celý svoj interný stav vrátane nakreslenej trasy. */}
      {(!!addFlow || !!addEventFlow) && (
        <div className={`trp-addhost${isNarrow && (addMapPhase !== 'off' || notePlaceReady) ? ' is-hidden' : ''}`}>
          {addFlow ? (
            <AddTripLog
              allTrails={allTrails}
              authorName={firstName}
              myDogs={myDogsForAdd}
              onSubmit={submitAddTripDraft}
              onClose={closeAdd}
              placeholderFor={placeholderFor}
              mapRef={leafletMapRef}
              besidePanel={!isNarrow}
              seedPoint={seedPoint}
              onMapPhase={setAddMapPhase}
              onPlaceNote={(g, k) => { setNotePlacing(g); setPlacingKind(k ?? null); }}
              placedNotes={tripNotes}
              /* Kým človek ukazuje miesto ALEBO vypĺňa kartičku značky, panel kroku 2 ustúpi —
                 inak stoja dva panely na sebe a spodný hovorí o niečom inom než vrchný. */
              notePlacing={notePlaceReady || !!noteDraft}
            />
          ) : addEventFlow ? (
            <AddEvent origin={addEventFlow} authorName={firstName} onSubmit={submitAddEventDraft} onClose={closeAddEvent} mapRef={leafletMapRef} />
          ) : null}
        </div>
      )}

      {/* mapa — full-bleed, panel je nad ňou (position:absolute) */}
      <div className="trp-mapregion">
          <div className="trp-mapfull">
            <MapContainer center={CENTER} zoom={9} zoomControl={false} attributionControl={false} style={{ width: '100%', height: '100%' }}>
              {/* PODKLAD — DOGYPT vrstva používa TIE ISTÉ outdoor dlaždice ako spodnú (neupravenú)
                  vrstvu, presne ako v prototype (`setLayer`: „aerial"→aerial, inak vždy outdoor).
                  Invert sa nesie na DRUHEJ kópii (<DogyptBaseLayer/> nižšie), táto zostáva čistá. */}
              <TileLayer
                key={tileStyle}
                url={mapyTiles(tileStyle)}
                {...(tileStyle === 'aerial' ? { maxNativeZoom: AERIAL_MAX_NATIVE_ZOOM } : {})}
                eventHandlers={{ tileerror: () => trackTileError(tileStyle, 'base') }}
              />
              {/* Overlay „Popisky a hranice" — Mapy.com mapset names-overlay, transparentná
                  vrstva NAD podkladom (default vypnutý — bod 1 zadania, viď MAP_LAYERS).
                  `!isCleanMode` (2026-08-04): v DOGYPT podklade je to presne to písmo/legenda,
                  ktoré tam nemá byť — zapnutý stav sa NEMAŽE (overlayOn sa nemení), len sa
                  ignoruje pri kreslení, nech sa po návrate na Outdoor/Satelit vráti sám. */}
              {!isCleanMode && overlayOn.names && (
                <TileLayer
                  url={mapyTiles('names-overlay')}
                  eventHandlers={{ tileerror: () => trackTileError('names-overlay', 'overlay') }}
                />
              )}
              {!isCleanMode && overlayOn.vipers && <ViperAreasLayer lang={lang} />}
              {isCleanMode && <DogyptBaseLayer url={mapyTiles(tileStyle)} style={tileStyle} />}
              {/* Hmla — vnútri <MapContainer> (potrebuje useMap()), pod trasami/markermi (viď
                  poradie nižšie), nechytá klik (viď FogLayer.tsx). Panel dovolí prepnúť na DOGYPT
                  len keď fog.trails.length>0 (viď MAP_LAYERS `disabledReason`), takže tu netreba
                  duplicitne kontrolovať prázdny stav — keď je vrstva aktívna, dáta už sú. */}
              {isCleanMode && <FogLayer trails={fog.trails} />}
              {/* bod 1 (Matej 2026-07-22): SK je vybraná krajina → zvýraznená čierno-zlatým
                  obrysom. Dvojvrstvový casing (čierny podklad + zlatá čiara) + whisper zlatého
                  fillu. interactive=false — nesmie chytať klik (trip pod ním musí ísť vybrať). */}
              {/* ÚZEMIE DOGYPTU (Matej 2026-07-24): každá krajina čo má aspoň 1 trasu dostane
                  rovnaký čierno-zlatý obrys ako SK — všetky naraz, mapa ukazuje rastúce územie.
                  Kreslí sa PRED trasami, takže červené journey línie po hranici ležia NAD ňou.
                  Dvojvrstvový casing (hrubý čierny podklad + tenká zlatá brand stopa) per prstenec
                  (kvôli enklávam/ostrovom). interactive=false — klik musí prejsť na trip pod ňou.
                  Krajina s trasou ale bez polygónu tu → dogeneruj cez scripts/gen_borders.py.
                  Cross-border legibility (Matej 2026-07-27, druhé kolo) → viď TerritoryBorders
                  vyššie (real-metrová priehľadná zóna namiesto dashArray, ktorý „nesadol"). */}
              <TerritoryBorders countries={availableCountries} />
              {/* mierka nesie čísla ("5 km") — v DOGYPT čistom vizuáli patrí medzi vysvetlivky. */}
              {!isCleanMode && <ScaleControl position="bottomleft" imperial={false} />}
              <FlyTo target={mapTarget} />
              <FitBounds path={heroBounds} offset={!!inlineDetailId} />
              {/* ľavý zoznam podľa výrezu mapy (Matej 2026-07-27) — hlási bounds na moveend/zoomend */}
              <ViewportWatcher onChange={handleViewport} />
              <SaberScaleWatcher onChange={setSaberScale} />
              <MapRefBridge onReady={(map) => {
                leafletMapRef.current = map;
                setMapInstance(map);
                if (pendingFlyRef.current) { map.flyTo(pendingFlyRef.current, 11, { duration: 1.2 }); pendingFlyRef.current = null; }
              }} />
              {/* krok 9 (zadanie §2 kontraktu GeometryPicker): DrawClickCatcher tu už netreba pre
                  ADD flow — GeometryPicker si berie map.on('click') sám cez mapRef a kreslí si
                  vlastné vrstvy imperatívne (kotvy, snapnutá stopa, duchovia), nezávisle od tejto
                  <MapContainer> React stromu. Komponent samotný ostáva (viď jeho definícia) —
                  nepoužíva ho už nikto iný v tomto súbore. */}
              {/* guard: pár done tripov v nahadzovači ešte nemá nakreslenú trasu (path=[]) —
                  bez guardu Leaflet spadne na undefined position (Marker/Polyline). Bod 3 (iterácia
                  12): default trasa ČIERNA, weight 3. Bod 1 (iterácia 17): hover/inline-selected
                  = AllTrails-style dvojvrstvový casing (čierny okraj + zlaté jadro), nie len
                  hrubšia zlatá čiara — dve <Polyline> na tých istých pozíciách (casing prvá =
                  pod, jadro druhá = nad). Nevybrané trasy ostávajú tenké čierne, bez casingu. */}
              {/* DOGYPT čistý vizuál (2026-08-04, Matej: „nie všetky magistrály v svetelnom meči,
                  iba SNP a poloniny — ostatné až keď prejdú Dogypťania") — v `isCleanMode` sa
                  kreslí LEN to, čo je aj v hmle (`walkedTrailIds`), platí pre magistrály aj bežné
                  trasy rovnako. Mimo DOGYPT (Outdoor/Satelit) je to nedotknuté — vidno všetko. */}
              {allTrails.filter((tr) => tr.path.length > 1 && !isWaterTrail(tr) && (!isCleanMode || walkedTrailIds.has(tr.id))).map((tr) => {
                // myš NA ČIARE → trasa vybledne, nech je pod ňou vidno turistické značenie
                // (Matej 2026-07-31). Hover zo zoznamu/markera ostáva zlaté zvýraznenie —
                // tam trasu hľadáš, tu sa na ňu pozeráš. Rovnaký princíp ako `routeDimmed`
                // v PackTripArticle (tam sa stlmí vybraná trasa pri dotyku mapy).
                const selected = inlineDetailId === tr.id;
                const lineHover = lineHoverId === tr.id;
                // ⚠️ 2026-08-20 OBRÁTENÉ. Predtým: hover NA ČIARE trasu STLMIL (`dim = 0.3`),
                // aby bolo pod ňou vidno turistické značenie (Matej 31. 7.). Odvtedy je pokojná
                // trasa priehľadná stále, takže značenie vidno aj bez toho — a stlmenie pod myšou
                // pôsobilo ako chyba: ideš na trasu a ona zmizne. Teraz je hover na čiare
                // rovnocenný s hoverom zo zoznamu aj s výberom: všetky tri ju ROZSVIETIA.
                const hot = selected || hoverId === tr.id || lineHover;
                // Pri kreslení ustúpia VŠETKY hotové trasy — aj tá pod myšou. Rozsvietiť
                // cudziu trasu v okamihu, keď človek kreslí vlastnú, je presne ten zmätok,
                // kvôli ktorému sa stlmenie zavádza.
                const dim = mapDrawing ? 0.16 : 1;
                /**
                 * KRESLENIE JE IZOLOVANÝ PROCES (Matej 2026-08-23: „pri kreslení sa nemôže stať,
                 * aby sa otvorilo niečo iné").
                 *
                 * Trasy pri kreslení síce ustúpia na `dim = 0.16`, ale STLMENÁ ČIARA JE STÁLE
                 * ČIARA — klik na ňu volal `selectTrail` a namiesto kotvy sa otvoril cudzí výlet.
                 * Stalo sa to pri kreslení Striebornica → Gajdošova, kde nová trasa vedie po
                 * úseku, ktorý už v datasete je; čím lepšie kreslíš, tým istejšie do niečoho
                 * trafíš.
                 *
                 * `undefined` (nie prázdny objekt): react-leaflet vtedy na vrstvu nezaregistruje
                 * NIČ, takže Leaflet klik prepustí ďalej na mapu a kotva pribudne tam, kam si
                 * klikol. Vypnúť len `click` by zožralo ťuknutie bez náhrady.
                 */
                const handlers = mapDrawing ? undefined : {
                  mouseover: () => { setHoverId(tr.id); setLineHoverId(tr.id); },
                  mouseout: () => { setHoverId(null); setLineHoverId(null); },
                  click: () => selectTrail(tr),
                };
                // journey (viacdňová, napr. Cesta hrdinov SNP) = plná červená čiara v bielom
                // ráme: biely spojitý casing (pod) + červené spojité jadro (nad).
                // Matej 2026-07-27: „pri diaľkových cestách sú vidno len piktogramy, po prejdení
                // myšou sa zobrazí route a po kliku sa otvorí, ale inak nebude v základe vidno tie
                // dlhé routes" — desať 100–770 km čiar cez pol Slovenska naraz robilo mapu surovou.
                // V pokoji sa teda NEKRESLÍ nič, trasu drží len jej piktogram; hover naň (alebo
                // výber) ju vykreslí. Handlery ostávajú aj na čiare, nech neblikne, keď z markera
                // prejdeš myšou priamo na ňu.
                // `!isCleanMode` (2026-08-04, Matej: „chýba svetelný meč na SNP a poloniny"): táto
                // vetva (piktogram drží trasu, čiara len na hover) je Outdoor/Satelit špecifikum —
                // piktogramy tam vôbec nekreslíme (DOGYPT čistý vizuál), takže v DOGYPT nemá čo
                // trasu „držať" a magistrála by bola vidno len na hover. V DOGYPT sú prejdené
                // journey navyše LEN dve (SNP, Poloniny, nie 10 magistrál) — surovosť viacerých
                // naraz odpadá. Journey preto spadne do rovnakej vetvy nižšie ako ostatné trasy:
                // vždy vykreslená, rovnaký fialový „svetelný meč" (TRAIL_SABER_LAYERS), nie
                // vlastná červená farba — v čistom vizuáli nemá zmysel farbou rozlišovať „toto je
                // diaľková cesta", to bol orientačný signál pre pracovnú mapu.
                if (!isCleanMode && tr.acts?.includes('journey')) {
                  // pozor: `hot` je pri hoveri NA ČIARE zámerne false (trasa vybledá), takže
                  // magistrála musí ostať vykreslená aj v tomto stave — inak by zmizla presne
                  // v okamihu, keď na ňu ideš myšou.
                  if (!hot && !lineHover) return null;
                  const w = 5;
                  return (
                    <Fragment key={tr.id}>
                      <Polyline
                        positions={tr.path}
                        pathOptions={{ color: '#FFFFFF', weight: w + 4, opacity: dim, lineCap: 'round', lineJoin: 'round' }}
                        eventHandlers={handlers}
                      />
                      <Polyline
                        positions={tr.path}
                        pathOptions={{ color: '#E01B22', weight: w, opacity: dim, lineCap: 'round', lineJoin: 'round' }}
                        eventHandlers={handlers}
                      />
                    </Fragment>
                  );
                }
                // issue #49 (Matej 2026-07-31, vybral z porovnania `plany/farba-trasy.html`):
                // trasa = FIALOVÝ „svetelný meč" — štyri vrstvy na tých istých bodoch (tmavý
                // okraj → sýta s dosvitom → svetlá → biele jadro), tokeny v tripShared.
                // Farba čiary je VLASTNÁ os; náročnosť nesú markery/pilulky (DIFF_COLOR).
                //
                // ⚠️ 2026-08-20 — MEČ MÁ DVA STAVY, nie dve rôzne čiary (Matej: „trasy nebudú tak
                // žiariť, svetelný meč bude žiariť len pri kliknutí alebo prejdení myšou").
                // V POKOJI: tie isté štyri vrstvy, len priehľadnejšie (`SABER_REST_OPACITY`)
                //           a BEZ dosvitu. Mapa so 77 trasami tak prestala svietiť celá naraz.
                // POD MYŠOU / VYBRANÁ: plná sýtosť + dosvit — teda presne dnešný vzhľad.
                // Zlatá z ČIARY tým odišla: keď svieti len tá, na ktorú sa pozeráš, druhá farba
                // na rozlíšenie netreba. Zlatú nesie ďalej pilulka (a tá je pod myšou BIELA).
                const alpha = hot ? 1 : SABER_REST_OPACITY;
                return (
                  <Fragment key={tr.id}>
                    {TRAIL_SABER_LAYERS.map((ly) => (
                      <Polyline
                        key={ly.key}
                        positions={tr.path}
                        // POZOR (overené v prehliadači): react-leaflet vlieva `pathOptions` cez
                        // `setStyle`, a ten `className` IGNORUJE — cez pathOptions sa trieda do
                        // DOM nikdy nedostane (v čistom Leaflete áno, preto to v audite aj
                        // v GeometryPickeri funguje). Dosvit preto nasadzujeme priamo na SVG
                        // element. Inline ref beží pri každom renderi, takže prepnutie podľa
                        // zoomu ani podľa stavu netreba riešiť remountom vrstvy.
                        // `bringToFront` pri rozsvietení: SVG nepozná z-index a kreslí v poradí
                        // datasetu, takže trasa, ktorá je v dátach neskôr, by rozsvietenú
                        // prekreslila zhora (Záruby 1/2/3 zdieľajú záverečný úsek).
                        ref={(layer) => {
                          const el = (layer as unknown as { _path?: SVGElement } | null)?._path;
                          if (el) el.classList.toggle('trp-saber-glow', ('glow' in ly && ly.glow) && hot && !mapDrawing && saberScale >= 0.7);
                          if (hot) (layer as unknown as { bringToFront?: () => void } | null)?.bringToFront?.();
                        }}
                        pathOptions={{
                          color: ly.color,
                          weight: Math.max(0.8, ly.weight * saberScale),
                          opacity: ly.opacity * alpha * dim,
                          lineCap: 'round',
                          lineJoin: 'round',
                          // dosvit (trieda vyššie cez ref) beží až od z12 — nižšie je čiara aj
                          // tak stenčená a 77 paths s SVG filtrom je na mobile zbytočná záťaž.
                        }}
                        eventHandlers={handlers}
                      />
                    ))}
                  </Fragment>
                );
              })}
              {/* trip pily (start/stred trasy) + vodné plochy (ťažisko) — jedna vrstva, zoomovo
                  vrstvená + pixelovo zhlukovaná (zadanie 2.3/2.4, <TripMarkers> vyššie pri mape).
                  Bez súradnice (0 bodov, napr. Buková priehrada) sa vodná plocha nezobrazí — čaká
                  na nahadzovač 📍 bod-miesto (mapPoints guard, viď komentár pri jeho definícii). */}
              {/* POI Z OSM TU UŽ NIE JE (Matej 2026-08-21): „na mape musíme zobrazovať len
                  emoji naše pridania v mape aj v blogu a emoji POI len v blogu". Celková mapa
                  nesie TRASY a to, čo do nej napísala svorka — pramene a lavičky žijú v článku
                  výletu (`PackTripArticle`), kde je otázka „kde je voda na TEJTO trase" na mieste.
                  S vrstvou odišiel aj jej prepínač v paneli vrstiev a `<PoiAttribution />` —
                  atribúcia je podmienka licencie ODbL a patrí tam, kde sa dáta kreslia. */}
              {/* trip markery (pilulky s km, bodky-piktogramy, zhlukové bubliny s počtom) —
                  DOGYPT čistý vizuál (2026-08-04, Matej: „iba hmla a svetelné meče... žiadne
                  písmo ani vysvetlivky") ich celé skrýva, nesú číslo/piktogram na každom bode. */}
              {!isCleanMode && !mapDrawing && (
                <TripMarkers
                  points={mapPoints}
                  hoverId={hoverId}
                  inlineDetailId={inlineDetailId}
                  onHover={setHoverId}
                  onSelect={selectTrail}
                />
              )}
              {/* krok 9: draft polyline/km-label/pin, ktoré tu predtým kreslil starý drawPoints
                  ADD flow, sú preč — GeometryPicker (vnútri AddTripPlan/AddTripLog) kreslí kotvy,
                  snapnutú stopu aj bod/územie imperatívne priamo na túto mapu cez mapRef, takže
                  duplicitné React vrstvy tu už nie sú potrebné (viď kontrakt §2.1 „vrstvy na mape"). */}
              {/* uložené PLÁNY (nie vodné plochy!) = jeden RUŽOVÝ bod na mape → Marker, klik vyberie
                  trip. Gate na id 'plan-' — vodné plochy s 1 bodom nesmú dostať pin. Skryté v
                  DOGYPT rovnako ako ostatné trip markery — je to pin, ktorý potrebuje legendu. */}
              {!isCleanMode && !mapDrawing && allTrails.filter((tr) => tr.id.startsWith('plan-') && tr.path.length === 1).map((tr) => (
                <Marker key={tr.id} position={tr.path[0]} icon={TARGET_PIN} eventHandlers={{ click: () => selectTrail(tr) }} />
              ))}
              {/* EVENT piny (krok 5, zadanie-eventy §9 krok 5) — LEN kým je aktívna kategória
                  Events (§ „Piny na mape... pri prepnutí na trips sa musia odstrániť"); podmienené
                  renderovanie stačí, react-leaflet <Marker> odstráni sa z mapy sám pri unmounte
                  (rovnaký vzor ako ostatné podmienené vrstvy vyššie, žiadny manuálny cleanup).
                  Zdieľa presne ten istý filtrovaný/zoradený zoznam ako panel (visibleEvents) —
                  pin existuje len pre event, ktorý je práve vidieť v zozname (nadchádzajúce/archív). */}
              {/* `!mapDrawing` z rovnakého dôvodu ako pri trip markeroch vyššie: kým sa kreslí
                  trasa, žiadny pin nesmie zjesť ťuknutie a otvoriť namiesto kotvy udalosť. */}
              {!isCleanMode && !mapDrawing && activeCat === 'events' && visibleEvents.filter((ev) => ev.center).map((ev) => (
                <Marker
                  key={ev.id}
                  position={ev.center as LatLngTuple}
                  icon={EVENT_PIN(ev.kind, selectedEventId === ev.id)}
                  eventHandlers={{ click: () => setSelectedEventId(ev.id) }}
                />
              ))}
              {/* ZÁPISY DO MAPY — nad trip markermi (sú to konkrétne miesta, nie súhrn).
                  DOGYPT čistý vizuál ich skrýva rovnako ako ostatné značky s textom. */}
              {!isCleanMode && (
                <MapNotesLayer
                  notes={mapNotes.notes}
                  onVote={(id, v) => { void mapNotes.vote(id, v); }}
                  onDelete={(id) => { void mapNotes.remove(id); }}
                  locale={dateLocale}
                  /* V DOGYPT čistom vizuáli sa overlaye ignorujú (nie mažú) —
                     rovnaké pravidlo ako pri názvoch a vreteniciach, nech je
                     stav po návrate na Outdoor presne taký, aký bol. */
                  showThreats={!isCleanMode && overlayOn.threats}
                  /* Značky svorky ostávajú VIDNO aj počas kreslenia (kreslíš okolo nich —
                     pavúk pri ceste je dôvod, prečo trasu vedieš inak), ale prestanú brať
                     kliky: bublina zápisu je „niečo iné, čo sa otvorilo" rovnako ako cudzí
                     výlet. V kroku 2 (`addMapPhase === 'notes'`) sa klikateľnosť vracia. */
                  interactive={!mapDrawing}
                />
              )}
              {/* bod z dlhého podržania, kým sa vyberá typ */}
              {noteSpot && !noteDraft && <NoteSpotPin lat={noteSpot.lat} lon={noteSpot.lon} />}
              {noteDraft && (
                <AddMapNotePin
                  lat={noteDraft.lat}
                  lon={noteDraft.lon}
                  kind={noteDraft.kind}
                  disease={noteDraft.disease}
                  radiusM={noteDraft.radiusM}
                  onMove={(lat, lon) => setNoteDraft((d) => (d ? { ...d, lat, lon } : d))}
                />
              )}
            </MapContainer>

            {/* Plusko s prstencom PRI KURZORE (Matej 2026-08-20) — nahradilo pevné
                tlačidlo v rohu, ktoré bolo slabo viditeľné a súperilo s tlačidlom
                PRIDAŤ o tú istú úlohu. Na dotyku sa nekreslí (kurzor neexistuje). */}
            {!isCleanMode && <MapNoteCursor map={mapInstance} hidden={noteBusy || !!notePlacing} />}

            {/* Výzva „priblíž si mapu" — v mieste kliku, preto je TU (vnútri
                pozicovaného obalu mapy), nie dole medzi panelmi. */}
            {noteTooFar && mapInstance && (
              <MapNoteTooFar
                x={noteTooFar.x}
                y={noteTooFar.y}
                width={mapInstance.getSize().x}
                height={mapInstance.getSize().y}
              />
            )}

            {/* Legenda (hike/long-distance/water/planned) ZRUŠENÁ 2026-08-03 na Matejov pokyn —
                viď komentár pri .trp-legend v CSS. */}

            {/* top bar — floating status riadok + search-a-place + Activity/Difficulty/Crowd
                filter, žije NA mape (AllTrails "Search map" vzor). Iterácia 10: status riadok
                späť sem (i9 full-width edge-to-edge header ODMIETNUTÝ), rovnaká floating
                pozícia ako v iterácii 8, len teraz na 100% šírky topbaru. Iterácia 15 bod 1:
                trojdielny (Matej 2026-07-26): ĽAVÁ = LEVEL, STRED = tripstats/triplist/add trip,
                PRAVÁ = messages + zvonček. */}
            <div className="trp-topbar">
              {/* Avatar REMOVED from this status pill (D4 nav rework 2026-07-24) — it now lives
                  in the shared bottom nav (PackBottomNav), so having it here too was a duplicate.
                  See PackLayout.tsx AvatarNavButton. */}
              <div className="trp-status-row">
                {renderStatusLeft()}
                {renderStatusCenter()}
                {/* messages + zvonček → pravý roh TOHTO bloku (Matej 2026-07-24/26).
                    Inline layout = v toku, nie fixed. */}
                {renderHeaderRight()}
              </div>
              <div className="trp-topsearchrow">
                <div className="trp-floatsearch" ref={placeBoxRef}>
                  <div className="trp-mapsearch">
                    <img src={ICON('globe')} alt="" />
                    <input
                      value={placeQuery}
                      onChange={(e) => setPlaceQuery(e.target.value)}
                      placeholder={t('pack.map.searchAPlace')}
                    />
                  </div>
                  {placeSug.length > 0 && (
                    <div className="trp-mapsug">
                      {placeSug.map((s, i) => (
                        <div
                          key={i}
                          className="trp-mapsug-item"
                          onClick={() => {
                            pickedPlaceRef.current = s.name.trim();
                            setMapTarget([s.lat, s.lon]);
                            setPlaceQuery(s.name);
                            setPlaceSug([]);
                          }}
                        >
                          <div className="trp-mapsug-name">{s.name}</div>
                          {s.sub && <div className="trp-mapsug-sub">{s.sub}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* bod 3 (iterácia 11): Difficulty/Popularity — samostatné, totožné borderless
                    polia priamo v riadku (.trp-topfilters wrapper box zrušený). Activity
                    presunutá 2026-07-27 do .trp-georow (ľavý panel, vedľa "All regions"). */}
                <select
                  className="trp-toprow-select"
                  value={heroDiff}
                  onChange={(e) => setHeroDiff(e.target.value as typeof heroDiff)}
                  aria-label={t('pack.map.difficulty')}
                >
                  <option value="">{t('pack.map.difficulty')}</option>
                  <option value="Easy">{t('pack.map.diff.Easy')}</option>
                  <option value="Moderate">{t('pack.map.diff.Moderate')}</option>
                  <option value="Hard">{t('pack.map.diff.Hard')}</option>
                  <option value="Odyssey">{t('pack.map.diff.Odyssey')}</option>
                </select>
                {/* bod 2 (iterácia 15) → D2 2026-07-24: "Popularity" → "Vibe" → "Crowd" (Empty/Calm/Busy) */}
                <select
                  className="trp-toprow-select"
                  value={heroCrowd}
                  onChange={(e) => setHeroCrowd(e.target.value as typeof heroCrowd)}
                  aria-label={t('pack.map.crowd')}
                >
                  <option value="">{t('pack.map.crowd')}</option>
                  {Object.entries(CROWD_LABELS).map(([sk]) => (
                    <option key={sk} value={sk}>{t(`pack.map.crowdLabel.${sk}`)}</option>
                  ))}
                </select>
                {/* Tags presunuté z ľavého panelu sem ako multi-select dropdown (Matej 2026-07-27),
                    vzor IdentityVisibilityEye v PackProfile.tsx. Len pri Trips (rovnaká logika
                    ako mala pôvodná chip sekcia — pri Events sa geo/tag filtre skrývajú). */}
                {activeCat === 'trips' && (
                  <TripTagsDropdown tags={heroTags} onToggle={toggleTag} onClear={() => setHeroTags(new Set())} />
                )}
              </div>
            </div>

            {/* pravý vertikálny ovládací stack — vrstvy mapy, zoom, moja poloha (AllTrails vzor) */}
            <div className="trp-ctlstack">
              {/* Rozbaľovací panel vrstiev (integračná vlna, spec-hmla.md) — nahrádza staré jedno
                  kruhové tlačidlo Outdoor↔Satelit. Tretia položka DOGYPT (hmla) + dva overlaye,
                  vygenerované z deklaratívneho MAP_LAYERS poľa (viď definícia vyššie). */}
              <LayersPanel
                mapBase={mapBase}
                onBaseChange={setMapBase}
                overlayOn={overlayOn}
                onOverlayToggle={toggleOverlay}
                fogCtx={fogCtx}
              />
              <div className="trp-zoomgroup">
                <button type="button" onClick={() => leafletMapRef.current?.zoomIn()} aria-label={t('pack.map.zoomIn')}>+</button>
                <button type="button" onClick={() => leafletMapRef.current?.zoomOut()} aria-label={t('pack.map.zoomOut')}>−</button>
              </div>
              <button
                type="button"
                className={`trp-locatebtn${locating ? ' loading' : ''}`}
                onClick={handleLocate}
                aria-label={t('pack.map.myLocation')}
                title={t('pack.map.myLocation')}
              >
                <img src={ICON('locate')} alt="" />
              </button>
            </div>

            <div className="trp-attr">
              <a href="https://mapy.com" target="_blank" rel="noopener noreferrer"><img src="https://api.mapy.com/img/api/logo.svg" alt="Mapy.com" style={{ height: 13, display: 'block' }} /></a>
              <span>© Seznam.cz a.s.</span>
            </div>

            {/* Červená bublina „ťukni do mapy" tu stála do 23. 8. Zanikla spolu s prepínaním
                „choď na mapu / hotovo": v krokovom sprievodcovi je krok 1 SÁM tou mapou a
                návrat aj pokyn nesie lišta kreslenia (GeometryPicker) — dve hlásenia o tom
                istom na jednej obrazovke boli presne to, čo Matej hlásil ako neprehľadné. */}
          </div>
      </div>

      {/* bod 5 (iterácia 12): starý full-page modal (.trp-detoverlay) tu žil predtým —
          ⤢ expand teraz navigate('/pack/map/:slug') na SAMOSTATNÚ route
          (PackTripArticle.tsx cez App.tsx), tak tento súbor už nikdy nemountuje so slugom. */}

      {/* ── KOMUNITNÉ modaly / dashboard (design plany/pack-community-features-design.md) ── */}
      {addEntryOpen && (
        <AddTripEntry onPick={pickAddFlow} onClose={closeAddEntry} />
      )}

      {/* ZÁPISY DO MAPY — panel žije MIMO <MapContainer> (formulár nie je vrstva mapy),
          ťahateľná značka je vnútri. Viď hlavičku AddMapNote.tsx. */}
      {noteDraft && (
        <AddMapNotePanel
          group={noteDraft.group}
          lat={noteDraft.lat}
          lon={noteDraft.lon}
          kind={noteDraft.kind}
          disease={noteDraft.disease}
          onDisease={(d) => setNoteDraft((x) => (x ? { ...x, disease: d } : x))}
          onKind={(k) => setNoteDraft((d) => (d ? { ...d, kind: k } : d))}
          radiusM={noteDraft.radiusM}
          onRadius={(m) => setNoteDraft((d) => (d ? { ...d, radiusM: m } : d))}
          pinnedSlug={noteDraft.pinnedSlug}
          pinnedName={allTrails.find((tr) => tr.id === noteDraft.pinnedSlug)?.name ?? null}
          onSubmit={async (n) => {
            await mapNotes.add(n);
            // Krok 2 sprievodcu: druh si odloží formulár, aby ho krok 4 vedel ZHRNÚŤ.
            // Väzba na výlet sa neukladá — odvodzuje sa zo súradnice (mapNotesGeo.ts).
            // `n.kind` (čo sa naozaj uložilo), nie `noteDraft.kind` z uzáveru — panel vie druh
            // zmeniť vlastným výberom a zhrnutie musí hovoriť o zapísanej značke.
            if (addFlow) setTripNotes((prev) => [...prev, n.kind]);
            setNoteDraft(null);
          }}
          onCancel={() => setNoteDraft(null)}
        />
      )}
      {/* Medzikrok pomalej cesty: typ vybraný, mapa voľná, čaká sa na klik. */}
      {notePlacing && !noteDraft && (
        <MapNotePlacing
          group={notePlacing}
          kind={placingKind}
          ready={noteZoom >= noteMinZoom}
          onCancel={() => { setNotePlacing(null); setPlacingKind(null); }}
        />
      )}
      {/* Rýchla cesta: bod je z dlhého podržania, pýta sa typ. */}
      {noteSpot && !noteDraft && (
        <NoteQuickPalette
          onPick={(g) => placeNote(g, noteSpot.lat, noteSpot.lon)}
          onPickExtra={(x) => startFromPoint(x, noteSpot.lat, noteSpot.lon)}
          onCancel={() => setNoteSpot(null)}
        />
      )}
      {noteHint && !noteDraft && !notePlacing && !noteSpot && (
        <MapNoteHint onDismiss={() => { setNoteHint(false); markHintSeen(); }} />
      )}
      {/* `reward` sa pustí dnu len keď patrí PRÁVE otvorenému výletu (WalkReward.tid) — inak by
          odmena za trasu A vyskočila v popupe trasy B. */}
      {walkedPopupId && (
        <WalkedPopup
          trailName={trailsById(walkedPopupId)?.name ?? t('pack.map.thisTrip')}
          initial={votes[walkedPopupId] ? { rating: votes[walkedPopupId].rating, difficulty: votes[walkedPopupId].difficulty, crowd: votes[walkedPopupId].crowd, comment: votes[walkedPopupId].comment, when: votes[walkedPopupId].when, hazards: votes[walkedPopupId].hazards } : null}
          onSubmit={submitWalked}
          onClose={closeWalkedPopup}
          rewardPoints={votes[walkedPopupId] ? undefined : RATE_PROMPT_POINTS}
          reward={walkedReward?.tid === walkedPopupId ? walkedReward : null}
        />
      )}
      {creatorTrail && (
        <TripCreatorPopup
          tripSlug={creatorTrail.id}
          authorName={authorOf(creatorTrail)}
          organizerId={(openHostsBySlug.get(creatorTrail.id) ?? [])[0]?.organizerId ?? null}
          joiners={(openHostsBySlug.get(creatorTrail.id) ?? [])[0]?.joiners ?? []}
          onClose={() => setCreatorTrail(null)}
        />
      )}

      <PackBottomNav avatarUrl={id.avatarUrl} avatarInitial={id.avatarInitial} dogs={id.dogs} />
      {/* PackMap je full-bleed a nemountuje <PackLayout> (vlastný header/nav vyššie), takže
          overlay host (Inbox/Thread) sa mountuje aj tu priamo — inak by „Message owner"/„Open
          trip group" vyššie a Messages v zdieľanom PackBottomNav nemali kam otvoriť (viď
          komentár pri MessagingOverlayHost v PackLayout.tsx). */}
      <MessagingOverlayHost />
    </div>
  );
}
