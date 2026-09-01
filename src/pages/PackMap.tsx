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
import { levelProgress, calculateTripPoints, levelThreshold } from '@/lib/tripPoints';
import type { LevelProgress, TripPointsResult } from '@/lib/tripPoints';
import { tierVars } from '@/lib/packTiers';
import { LevelPanel } from '@/components/pack/level/LevelPanel';
import { TripReveal } from '@/components/pack/level/TripReveal';
import type { TripStat } from '@/components/pack/level/TripReveal';
import { MapCoach, coachMuted } from '@/components/pack/MapCoach';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { ViperAreasLayer } from '@/components/geo/ViperAreasLayer';
import { PoiLayer, PoiAttribution } from '@/components/geo/PoiLayer';
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { goldFrameCSS, goldPlateCSS, pickTintCSS, PICK_INK, SLAB, LAPIS, LAPIS_BTN_SHADOW, MAP_SKIN, NAV_GOLD, NAV_PILL_SHADOW, NAV_R, PALE_PC_MIN } from '@/components/pack/navGoldSkin';
import { estimateTripMinutes, formatTripTime } from '@/lib/tripTime';
import ainubisFace from '@/assets/ainubis-head.png';
import { useMyNotePoints } from '@/components/pack/mapnotes/useMyNotePoints';
import {
  ICON, authorOf, REGION_OF, diffMarkShape, DiffMark, DIFF_MARK_CSS, WATER_COLOR, ElevationProfile,
  DIFF_COLOR, TRAIL_LINE, TRAIL_LINE_CSS, TRAIL_SABER_LAYERS, SABER_REST_OPACITY, trailSaberScale, isWaterTrail, tripShareText, pluralKey,
  readLocalTrails, writeLocalTrails, updateLocalTrail, readFavIds, writeFavIds, readWalkedIds, writeWalkedIds,
  ensureWalkedSeeded, FOUNDER_WALKED_JOURNEY_IDS,
  tripPath, tripPathById, tripText, visibleLocalTrails, tripDraftMissing, memberTrailIds, isOdyssey } from '@/components/pack/tripShared';
import {
  crowdAggregate, FOUNDER_WALKERS, seedCrowd, HAZARDS, HAZARD_EMOJI, CROWD_EMOJI, CROWD_KEY_TO_CROWD,
  readVotes, writeVotes, readPlans, writePlans, readEvents, writeEvents,
  profileLevelFor, addedByMeIds, isFounderEmail, computeCompletion,
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
import { placeholderFor } from '@/lib/tripPlaceholder';
import { upsertMyTrip, removeMyTrip } from '@/components/pack/triplist/triplist';
import { supabase } from '@/integrations/supabase/client';
import { planDateLabel, parsePlanDate, planStart } from '@/components/pack/addtrip/planDate'; // TRIPLIST (Slice A) — star popup upserts alongside the existing wishlist plan
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
import { dockFitPadding } from '@/components/pack/mapDockShape';
import { AddMapNotePin, NoteSpotPin, AddMapNotePanel, MapNotePlacing, NoteQuickPalette, MapNoteHint, MapNoteTooFar, ADD_NOTE_CSS, notePanelH, hintSeen, markHintSeen } from '@/components/pack/mapnotes/AddMapNote';
import { NOTE_PALETTE_CSS } from '@/components/pack/mapnotes/NotePalette';
import { DeleteButton, DELETE_BUTTON_CSS } from '@/components/pack/DeleteButton';
// Kruhová značka — TÁ ISTÁ geometria ako hrozba/tip vo vrstve zápisov (hlavička circleMark.ts).
import { circleMarkHtml, CIRCLE_MARK_CSS } from '@/components/pack/mapnotes/circleMark';
import { EVENT_RIM, TRIP_TARGET_EMOJI, eventEmoji, FONT_EMOJI } from '@/components/pack/mapnotes/markEmoji';
import { useMapNotes } from '@/components/pack/mapnotes/useMapNotes';
import { useLongPressPoint, useMapClickPoint, MIN_ZOOM_FOR_NOTE, LONG_PRESS_CSS } from '@/components/pack/mapnotes/useLongPressPoint';
import { MapNoteCursor, MapPlaceCursor, MAP_NOTE_CURSOR_CSS } from '@/components/pack/mapnotes/MapNoteCursor';
import { nearestTrailId } from '@/components/pack/mapnotes/mapNotesGeo';
import { GROUP_KINDS, defaultRadius, type NoteGroup, type NoteKind, type TickDisease } from '@/components/pack/mapnotes/mapNotesData';
import { AddTripLog } from '@/components/pack/addtrip/AddTripLog';
import { TRAVEL_EMOJI } from '@/components/pack/addtrip/addTripModel';
import { TRIP_HOLD_MIN_ZOOM } from '@/components/pack/addtrip/GeometryPicker';
import type { AddTripDraft, TripState } from '@/components/pack/addtrip/addTripModel';
import { clearTripNotes, readTripNotesForSession, writeTripNotes, missingOnTrail, type TripNoteRef } from '@/components/pack/addtrip/addTripModel';
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
import { TRIP_CATEGORIES, ACT_TAG_EMOJI, ACT_TO_CATEGORY, CHIP_BY_ID, categoriesOf, chipsOf, isInCategory, primaryCategoryOf, type TripCategoryId } from '@/components/pack/tripCategories';

const GOLD = '#C99A3F';
const INK = '#1F1A0E';

// ── PRSTENEC POSTUPU OKOLO AVATARA (Matej 2026-08-28, výber z nákresu ────────
// `plany/nakres-map-putnik-2026-08-28.html`, variant `frame:'prog'` + `lvl:'notch'`)
//
// Geometria má JEDEN zdroj — tieto tri čísla. Priemer 44 = fotka 34 + 2×lem 3 + 2×medzera 2,
// takže SAMOTNÁ FOTKA ostáva 34 px ako doteraz a nič okolo sa neprepočítava.
// ⚠️ `stroke-width` a polomer sú v jednotkách viewBoxu (0–100), nie v px: prevod je
// `px / AV_D * 100`. Zapísať sem px by dalo prstenec, ktorý sa pri zmene priemeru rozíde.
const AV_D = 44;         // priemer celého bloku avatara
const AV_RING = 3;       // hrúbka prstenca
const AV_GAP = 2;        // medzera prstenec ↔ fotka
const RING_SW = (AV_RING / AV_D) * 100;
const RING_R = 50 - RING_SW / 2;
const RING_C = 2 * Math.PI * RING_R;
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

/**
 * Podpis pod názvom výletu.
 *
 * ⚠️ BEZ PSA (Matej 2026-08-26: „nahodený výlet bude menším a len meno majiteľa, ako aj
 * fotka… bez psa"). Do teraz tu stáli DVA prekryté kruhy — zástupná silueta psa a iniciála
 * majiteľa. Silueta bola pri každom výlete tá istá kresba, teda nehovorila, ktorý pes tam bol;
 * niesla len to, že pes existuje, čo v appke o psoch nie je informácia. Zostáva jeden kruh:
 * ten, ktorý naozaj identifikuje konkrétneho človeka.
 * FLAG (nezmenené): majiteľ je stále iniciála v kruhu, nie jeho fotka. Reálne per-trip fotky
 * potrebujú dátové polia, ktoré `HeroTrail` nemá.
 */
function AuthorAvatars({ author, size }: { author: string; size: number }) {
  const t = useT();
  const pairStyle = { '--trp-av-size': `${size}px` } as React.CSSProperties;
  return (
    <span className="trp-avatarpair" style={pairStyle}>
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
// ⚠️ 24. 8. 2026 z toho vypadli EMOJI a stal sa z toho holý zoznam. Bola to DRUHÁ kópia
// `CROWD_EMOJI` (`packCommunity.ts`) — a mŕtva: obe miesta, ktoré ju čítajú, berú len KĽÚČ
// (`([sk]) =>`) a text si ťahajú z `pack.map.crowdLabel.*`. Kým tu tie emoji ležali, matrica
// značiek ich nevidela (číta `packCommunity.ts`) a po prvej zmene by filter ukazoval iné
// emoji než tá istá hodnota vo formulári.
const CROWD_DATA_KEYS = ['Ľudoprázdne', 'Pokojné', 'Rušné'] as const;

// Stupne náročnosti v poradí. Doteraz boli rozpísané ako štyri <option> v JSX; filtru stačí
// zoznam, značku ku každému dokreslí DiffMark.
const DIFF_KEYS = ['Easy', 'Moderate', 'Hard', 'Odyssey'] as const;

// Aktivita taxonómia — lokálna kópia z __TrailsPreview.tsx (id/label/emoji), Portal je
// izolovaný od toho dev-only prototypu. Iterácia 7 (Matejov feedback bod 2): tag vocabulary
// je teraz JEDEN univerzálny rad, nezávislý od vybranej aktivity — TRIP_ACTIVITIES preto už
// nenesie vlastné tagy (predtým per-activity scoping, zrušené).
const TRIP_ACTIVITIES: { id: string; label: string }[] =
  TRIP_CATEGORIES.map((c) => ({ id: c.id, label: c.label }));
// ── TRI KATEGÓRIE, JEDEN ZDROJ (2026-08-31) ─────────────────────────────────────────────
// Sedem aktivít sa zlúčilo do troch kategórií (HIKE · VISIT · SPORT — CHILL a EXPLORE
// splynuli do VISIT) a zoznam sa presťahoval do `components/pack/tripCategories.ts` — spolu
// s tým, ktoré staré hodnoty `acts` do ktorej kategórie patria a ktoré chipy k nej patria.
// Tu už nesmie stáť druhá kópia: do 27. 8. boli štyri a stihli sa rozísť v emoji.
//
// 🔴 FILTER ČÍTA VŠETKY KATEGÓRIE VÝLETU, NIE LEN JEHO IDENTITU (Matej 2026-08-27).
//    „ak dá človek vo filtri nocľah, vyhľadá mu aj HIKE, kde je tag aj CHILL aktivity."
//    Preto sa nižšie porovnáva cez `isInCategory(tr.acts, …)` a NIE cez jednu hodnotu:
//    túra s piknikom je na karte HIKE, ale pod filtrom VISIT sa MUSÍ nájsť. Bez toho by
//    na 81 seed výletoch ostal VISIT chudobný — 19 piknikov a 7 z 8 nocľahov leží na výlete,
//    ktorý je zároveň túra. Prečo tam tá karta je, povie dvojica odznakov v `renderTripCard`.
const ACT_EMOJI: Record<string, string> = { ...ACT_TAG_EMOJI, ...Object.fromEntries(TRIP_CATEGORIES.map((c) => [c.id, c.emoji])) };
// Čo sa zapíše novému výletu do `tr.acts` — staré hodnoty ('picnic', 'skating'…) v datasete
// ostávajú a kategórie ich čítajú ďalej (`TripCategory.acts`), nemigruje sa nič.
const ACT_DATA_ID: Record<string, string> = Object.fromEntries(TRIP_CATEGORIES.map((c) => [c.id, c.dataId]));

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
// TIEŇ (Matej 2026-08-24): „do TAGOV pridajme Tieň… je to pre psíčkara podstatné." Dve hodnoty,
// nie škála — pes buď má kam uhnúť pred slnkom, alebo nemá.
// ⚠️ 78 existujúcich výletov tento tag NEMÁ a nedostane ho. Prázdno tu znamená „nikto to
// nezapísal", nie „bez tieňa" — dopísať ho odhadom by z datasetu spravilo klamára.
const TAG_VOCAB = [
  'Mountains', 'Forest', 'Lake/Reservoir', 'River', 'View', 'Meadow', 'Sunset', 'Shade', 'No shade',
  'Forest path', 'Asphalt', 'Rocky',
] as const;
// POVRCH je podmnožina TAG_VOCAB, nie samostatné pole hodnôt (Matej 2026-08-28: „tagy povrchu
// dať do riadku vedla aktivity na dropdown = skonsolidujeme o jeden riadok"). Filtruje sa
// ďalej cez `heroTags`, takže sa nemení ani logika filtra, ani dáta — mení sa len OVLÁDAČ:
// tri chipy zo spodnej mriežky sa presťahovali do rozbaľovačky vedľa aktivity.
// ⚠️ Zdroj je `SURFACE_TAG_MAP` (dátové kľúče → UI názvy), nie druhý ručný zoznam; keby pribudol
// štvrtý povrch, objaví sa v rozbaľovačke sám.
const SURFACE_TAGS = ['Forest path', 'Asphalt', 'Rocky'] as const;
const IS_SURFACE = new Set<string>(SURFACE_TAGS);
// Matrica značiek 24. 8. 2026: 🏞️→🔵, 💧→🌀, 🌄→👁️, 🥾→👣. Dôvod je kolízny, nie estetický —
// 💧 nesie prameň v POI, 🥾 preskočilo na turistiku v `ACT_EMOJI` a 👣 sa uvoľnilo tým, že
// návštevnosť „Rušno" prešla na 🚨.
const TAG_EMOJI: Record<string, string> = {
  Mountains: '🏔️', Forest: '🌲', 'Lake/Reservoir': '🔵', River: '🌀', View: '👁️', Meadow: '🌼', Sunset: '🌅',
  Shade: '⛱️', 'No shade': '🌡️',
  'Forest path': '👣', Asphalt: '🛣️', Rocky: '🪨',
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
  Shade: 'pack.map.tagLabel.shade', 'No shade': 'pack.map.tagLabel.noshade',
  'Forest path': 'pack.map.surfaceLabel.forest', Asphalt: 'pack.map.surfaceLabel.asphalt',
  Rocky: 'pack.map.surfaceLabel.rocky',
};

// Per-aktivita placeholder fotky (Cloudinary pack/placeholders, webp). Kľúč = ACT_DATA_ID
// (hike/journey/picnic/overnight/skating/paddleboard). Použité pre tripy bez vlastnej fotky

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
  Shade: 'Shade', 'No shade': 'No shade',
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

/** `type` = druh miesta z Mapy.com suggest (`poi` · `regional.address` · `regional.municipality`
 *  · `regional.region` · `regional.country`). Nesie sa až k príletu, lebo podľa neho sa určuje
 *  priblíženie — viď `placeZoom()`. */
type PlaceSug = { name: string; sub: string; lat: number; lon: number; type?: string };
/** Kam mapa letí po výbere z hľadania: bod + priblíženie odvodené z druhu miesta. */
type FlyTarget = { ll: LatLngTuple; zoom: number };

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
// Matej 2026-07-27: diaľkové (journey) nesú km len v STREDNOM pásme priblíženia —
// „ako jediné z diaľky aj kilometre, nech človek vie že je to dlhé". Na oboch koncoch sa sťahujú
// na holý piktogram (kruh s bielym trojuholníkom, `.trp-dot--journey`):
//   · zďaleka — na Slovensko pripadá pár cm a 11 pilulek sa nakopilo na seba
//   · z ≥ 12 (zblízka) — trasa je aj tak nakreslená, „770 km" by len zavadzalo
// Bežné body a voda idú opačne: pilulka až pri najväčšom priblížení.
// ⚠️ 2026-08-26: spodná hranica 8 → 9 (Matej, pri pohľade na CELÉ Slovensko v úzkom okne:
// „označ magistrály bez km stačí kruh s bielym trojuholníkom... aby toho nebolo tak vela a
// preplnené"). Prečo práve 9 a nie iné číslo: pri z9 je SK široké ~2130 px, takže celá krajina
// sa do okna zmestí LEN pod z9 ⇒ „vidím celú krajinu" a „magistrály bez km" odteraz splývajú
// na každej šírke okna. Pri z8 ich bolo v zábere jedenásť a prekrývali sa navzájom.
const JOURNEY_KM_ZOOM = { min: 9, max: 11 };
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
// ── EXISTUJÚCE TRASY POČAS KRESLENIA (2026-08-25) ────────────────────────────
// Matej pri teste: „viac zvýrazni prejdené výlety v prvom kroku, lebo sú viditeľné len
// veľmi slabo a musí tam byť pilulka s názvom tej trasy."
//
// Prečo boli takmer neviditeľné: stlmenie sa NÁSOBÍ s pokojnou priehľadnosťou meča
// (`SABER_REST_OPACITY` 0,42), takže 0,16 dalo výslednú viditeľnosť ~7 % — na papierovej
// turistickej mape prakticky nič. 0,8 dá ~34 %, teda o čosi menej než pokojná trasa mimo
// kreslenia (42 %): jasne vidno, kadiaľ sa už chodilo, a zároveň to neprekričí čerstvo
// kreslenú trasu, ktorá ide v plnej sýtosti.
//
// ⚠️ Stlmenie sa NERUŠÍ. Dôvod z 23. 8. platí ďalej — cudzia trasa sa počas kreslenia nesmie
// rozsvietiť pod myšou ani sa dať kliknúť (`handlers = undefined`). Mení sa len to, ako je
// vidno, nie to, čo robí.
const DRAW_TRAIL_DIM = 0.8;
/** Koľko názvov naraz. Kresliť sa smie až od z15, takže v zábere býva pár trás — strop je poistka. */
const DRAW_NAME_MAX = 24;
/** Bodiek sa zmestí viac než názvov — sú 9 px a neprekrývajú sa textom. */
const DRAW_PIN_MAX = 90;

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

/**
 * ── REZERVA NA CHROME HLAVNEJ MAPY — JEDNY ČÍSLA PRE RÁMOVANIE AJ PRÍLET ─────────────────
 *
 * Vľavo stojí panel (`.trp-sidebar`, `PANEL_W`), vpravo ovládanie mapy (zoom, poloha,
 * vrstvy). `FitBounds` (rámovanie trasy) a `FlyTo` (prílet na nájdené miesto) MUSIA počítať
 * s tou istou rezervou — inak hľadanie posadí miesto do stredu okna, teda jeho ľavé
 * okolie pod panel, kým rámovanie trasy mieri inam. Rovnaký dôvod, pre aký `dockPadX()` existuje pri
 * kreslení trasy; toto je jeho dvojička pre bežnú mapu (iná hranica aj iná šírka panela).
 */
const mapPadX = (): [number, number] =>
  (typeof window !== 'undefined' && window.innerWidth <= MOBILE_BP) ? [24, 24] : [PANEL_W + 60, 90];

/**
 * Prílet na miesto vybraté v hľadaní.
 *
 * ⚠️ STRED JE MEDZI PANELOM A PRAVÝM OKRAJOM, NIE V STREDE OKNA (Matej 2026-08-28, tá istá
 * vec ako 26. 8. pri kreslení trasy): `flyTo` posadí bod do stredu KONTAJNERA, lenže ľavých
 * ~500 px prekrýva panel. Posun stredu = polovica rozdielu rezerv, prepočítaná
 * `project/unproject` v CIEĽOVOM priblížení — cez aktuálne by po prílete minula, lebo
 * pixel v inej mierke znamená inú vzdialenosť.
 *
 * ⚠️ PRIBLÍŽENIE SA NEBERIE NATVRDO (bolo 13). Nájdená útulňa je bod zo SVETA a tie sa
 * kreslia až od `SLEEP_MIN_ZOOM` — po prílete na 13 teda mapa miesto zamerala, ale značku
 * neukázala a človek si ju musel doklikať dvoma zoomami. Odvodzuje ho `placeZoom()`.
 */
function FlyTo({ target }: { target: FlyTarget | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    const { ll, zoom } = target;
    const [padL, padR] = mapPadX();
    const shift = (padL - padR) / 2;
    const to = shift
      ? map.unproject(map.project(ll, zoom).subtract([shift, 0]), zoom)
      : L.latLng(ll[0], ll[1]);
    map.flyTo(to, zoom, { duration: 1.2 });
  }, [target, map]);
  return null;
}

function FitBounds({ path, offset, dock, hold }: { path: LatLngTuple[] | null; offset?: boolean; dock?: boolean; hold?: boolean }) {
  const map = useMap();
  useEffect(() => {
    // ⚠️ KÝM EXISTUJE NAKRESLENÁ TRASA, VÝREZ PATRÍ JEJ (Matej 2026-08-25). Rámovanie krajiny
    // je správne len na PRÁZDNEJ mape; kto už trasu nakreslil, ju pri každom prechode medzi
    // krokmi znovu hľadal. Nie je to vypnutie funkcie — je to určenie vlastníka.
    if (hold) return;
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
    /**
     * ⚠️ V KROKOCH 1–2 JE DOLE INÝ CHROME (Matej 2026-08-25: „pri slovensku je polovica
     * skryta za dolnym panelom — vycentruj to aby bolo vidno cele, je tam na to dostatok
     * miesta"). Mobilná rezerva 96 px platí pre BEŽNÚ mapu, kde dole stojí len navigácia.
     * Počas pridávania výletu tam stojí dok — `DOCK_VH` z výšky okna, teda na bežnom
     * telefóne ~290 px, trikrát viac. Rámovanie o ňom nevedelo, takže krajinu vpasovalo do
     * celého okna a spodná tretina skončila pod panelom.
     * Hore je v tom kroku bublina AInubisa s bodkami 1–5 namiesto hľadania a pilulek — je
     * nižšia než bežný horný blok, preto sa rezerva zmenšuje, nie zväčšuje.
     * ⚠️ Číslo sa NEOPISUJE — berie sa z `notePanelH()`, ktorý ho počíta z toho istého
     * `DOCK_VH` ako CSS. Dve nezávislé čísla by sa rozišli pri prvej zmene výšky panela.
     * PC sa nemení: dok je tam ľavý stĺpec širokým `DOCK_COL_W` = to isté ako `PANEL_W`,
     * takže existujúca rezerva sedí.
     */
    // Vodorovná rezerva ide z `mapPadX()` — to isté číslo, s akým letí hľadanie (viď FlyTo).
    const [padL, padR] = mapPadX();
    const pad = dock
      ? dockFitPadding(notePanelH())
      : (mobile
          ? { paddingTopLeft: [padL, 186] as [number, number], paddingBottomRight: [padR, 96] as [number, number] }
          : { paddingTopLeft: [padL, 130] as [number, number], paddingBottomRight: [padR, 140] as [number, number] });
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
  }, [path, offset, dock, hold, map]);
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
/** Názov výletu ide do `divIcon` ako HTML reťazec — apostrof v „Havrania skala" je neškodný,
 *  ale meno z členského výletu píše človek, takže sa nesmie vlievať surové. */
function escapeHtml(v: string): string {
  return v.replace(/[&<>"']/g, (c) => (
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;'
  ));
}

/**
 * NÁZVY EXISTUJÚCICH TRÁS POČAS KRESLENIA (2026-08-25, Matej: „musí tam byť pilulka
 * s názvom tej trasy").
 *
 * Prečo vlastná vrstva a nie <TripMarkers>: tá nesie kilometre, piktogramy náročnosti
 * a zhlukové bubliny s počtom — počas kreslenia je to hluk, ktorý prekričí kreslenú
 * trasu. Tu ide o jedinú otázku: „ako sa volá to, čo tu už je". Preto holý názov.
 *
 * ⚠️ KLIKÁ SA PILULKA, NIE ČIARA. Lock z 23. 8. („pri kreslení sa nemôže stať, aby sa
 * otvorilo niečo iné") vznikol preto, že klik na stlmenú čiaru otváral cudzí výlet
 * namiesto položenia kotvy — trafiť čiaru pri kreslení je totiž ľahké a nechcené.
 * Pilulka je malý zámerný terč nad trasou, takže tá zámena nehrozí: čiara ostáva hluchá
 * (`handlers = undefined` nižšie) a kotva sa naďalej položí, kamkoľvek klikneš do mapy.
 */
function DrawTrailNames({ points, onPick }: { points: MapPoint[]; onPick: (tr: HeroTrail) => void }) {
  const map = useMap();
  const [tick, setTick] = useState(0);
  // stabilná referencia — inak sa listener pri každom renderi odhlasuje a prihlasuje
  // (tá istá pasca, ktorá je popísaná v TripMarkers nižšie).
  const bump = useCallback(() => setTick((n) => n + 1), []);
  useMapEvent('moveend', bump);
  useMapEvent('zoomend', bump);

  /**
   * ⚠️ NÁZOV AŽ VTEDY, KEĎ SA DÁ KRESLIŤ (Matej 2026-08-25, na telefóne: „v prvom kroku aj
   * v náhľade kde je mapka vidno pilulky s názvami tripov, vyzerá to hrozne — tu treba dať len
   * malinké piny a zobraziť názov až pri úplnom zoome, kedy sa dá kresliť").
   *
   * Pri pohľade na celé Slovensko sa desať názvov preloží cez seba do jednej kaše (screenshot
   * 25. 8.) — meno je dlhé a mapa je vtedy malá. Prah je preto `TRIP_HOLD_MIN_ZOOM`, teda
   * TO ISTÉ číslo, od ktorého sa smie položiť prvá kotva: kým sa kresliť nedá, otázka „ako sa
   * to volá" ešte nie je na rade, stačí vedieť ŽE tam niečo je. Zámerne sa neladí vlastným
   * číslom — dva prahy o jednej veci sa rozídu.
   */
  const named = map.getZoom() >= TRIP_HOLD_MIN_ZOOM;

  const visible = useMemo(() => {
    const bounds = map.getBounds();
    return points
      .filter((p) => bounds.contains([p.lat, p.lon]))
      .slice(0, named ? DRAW_NAME_MAX : DRAW_PIN_MAX);
    // `tick` je zámerná závislosť: prekreslenie po posune mapy, nie po zmene dát.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, map, tick, named]);

  return (
    <>
      {visible.map((p) => {
        // NÁROČNOSŤ NESIE FARBA (Matej 2026-08-25: „treba ukázať aj náročnosť"). Je to tá istá
        // os aj tie isté tokeny ako na markeroch mapy (`DIFF_COLOR`) — nie nová farebná reč.
        // Vodné plochy a výlety bez zapísanej náročnosti dostanú neutrálnu, nie náhodnú:
        // vymyslieť im stupeň by bolo tvrdenie, ktoré v dátach nie je.
        const color = (p.tr.diff && DIFF_COLOR[p.tr.diff]) || 'rgba(243,233,255,0.55)';
        const html = named
          ? `<span class="trp-dname"><i class="trp-dname-d" style="background:${color}"></i>${escapeHtml(p.tr.name)}</span>`
          : `<span class="trp-dpin" style="background:${color}"></span>`;
        return (
          <Marker
            key={`dn-${p.id}`}
            position={[p.lat, p.lon]}
            icon={L.divIcon({ className: '', html, iconSize: [0, 0] })}
            eventHandlers={{ click: (e) => { L.DomEvent.stopPropagation(e as unknown as Event); onPick(p.tr); } }}
          />
        );
      })}
    </>
  );
}

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
  // ⚠️ 2026-08-26: počiatočný `useState(() => map.getZoom())` zachytí zoom PRED tým, než mapu
  // dorámuje `FitBounds` (sused v strome, beží vo svojom effecte s `animate:false`). Jeho
  // `zoomend` sa trafí do okna, kým tento listener ešte nie je pripojený, takže sa stratí a stav
  // ostane natrvalo na `zoom={9}` z `<MapContainer>` — hoci mapa reálne stojí na z8 (celé
  // Slovensko). Markery potom kreslia vrstvu pre CUDZÍ zoom a nie je to na nich vidieť: pri
  // starom pásme km (z8–z11) padli obe čísla do toho istého pásma, takže sa chyba prejavila až
  // keď sa spodná hranica zdvihla na 9 a diaľkové mali stratiť km — po tvrdom načítaní stránky
  // ich ďalej ukazovali. Sync na macrotask beží AŽ po effectoch súrodencov, teda po dorámovaní.
  useEffect(() => {
    const sync = () => setZoom(map.getZoom());
    const id = window.setTimeout(sync, 0);
    map.whenReady(sync);
    return () => window.clearTimeout(id);
  }, [map]);
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
.trp-tagdd-btn{flex:1 1 140px;min-width:120px;background:${T.glass};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid ${T.onDarkBorder};border-radius:12px;padding:10px 15px;box-shadow:0 6px 22px rgba(0,0,0,0.4);color:${T.onDark};font-family:inherit;font-size:16px;cursor:pointer;outline:0;}
/* ⚠️ .trp-toprow-select ZANIKOL 2026-08-26. Náročnosť aj Návštevnosť sú vlastné rozbaľovačky
   (TripPickDropdown) — natívny select nevie vykresliť značku náročnosti a jeho zoznam kreslí
   prehliadač, takže sa otváral čierny. Trieda tu nesmie ostať ako sirota: prvý, kto by ju
   niekde uvidel, by predpokladal, že filtre hlavičky sú stále systémové polia. */
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
/* ⚠️ PRIAMY POTOMOK (znak >), nie ktorýkoľvek span. Bez neho pravidlo trafí AJ značku vnútri
   položky (tá je prvým dieťaťom svojho obalu), dá jej flex:1 a z 9px kruhu sa stane pruh cez
   pol panela — presne to sa stalo pri prvom nasadení TripPickDropdown. */
.trp-tagdd-row > span:first-child{flex:1;}
.trp-tagdd-clear{display:block;width:100%;text-align:center;margin-top:6px;padding-top:8px;border-top:1px solid ${T.onDarkHair};background:none;border-left:0;border-right:0;border-bottom:0;font-family:${FONT_UI};font-weight:600;font-size:11px;letter-spacing:.04em;color:${T.onDarkDim};cursor:pointer;}
.trp-tagdd-clear:hover{color:${GOLD};}

/* ── Jednovoľbová rozbaľovačka (TripPickDropdown) — Náročnosť, Návštevnosť, Región, Aktivity.
   Nesie tie isté .trp-tagdd-* triedy ako filter tagov; tu sú len tri veci navyše, ktoré
   viacvoľbový filter nepotrebuje: obal (podiel šírky), zvolená hodnota v tlačidle a značka
   pred položkou. */
.trp-pickdd-wrap{flex:1 1 140px;min-width:120px;}
/* Zvolená hodnota sa REŽE, nezalamuje: tlačidlo stojí v rade s ďalšími dvomi a musí držať
   jednu výšku. Šípka vpravo si drží miesto (flex-shrink:0 na .trp-tagdd-chevron). */
.trp-pickdd-cur{display:inline-flex;align-items:center;gap:7px;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
.trp-pickdd-item{display:inline-flex;align-items:center;gap:8px;flex:1;min-width:0;}
/* Emoji vždy s FONT_EMOJI — bez neho sadne na Windows čiernobiely textový variant
   (to isté pravidlo ako značky na mape, markEmoji.ts). */
.trp-pickdd-emoji{font-family:${FONT_EMOJI};font-size:13px;line-height:1;flex-shrink:0;}

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
/* Obal dosky vo výreze hlavičky. Mimo bledého PC skinu NEEXISTUJE (display:contents) — jeho
   deti sa správajú, akoby stáli priamo v .trp-status-row. Tvar dostane až v PALE_CSS. */
.trp-status-plate{display:contents;}
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
/* FARBA PÁSMA (2026-08-24): pilulka už nie je vždy zlatá — gradient aj inkoust berie
   z premenných --tier-a / --tier-b / --tier-ink, ktoré na element vešia tierVars(level)
   z @/lib/packTiers. Fallback v každom var() drží pôvodnú zlatú, takže povrch bez
   premenných vyzerá presne ako predtým.
   Pásmo = tri levely; deväť pásiem za celú cestu, sadu vybral Matej 23. 8.
   LEVEL — rang + číslo. Dve role, dve roly písma (Matej 2026-07-26 „ten level si odflákol" —
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
/* ── AVATAR NESIE RANG (Matej 2026-08-28) ───────────────────────────────────────
   Prstenec = POSTUP V LEVELI (levelInfo.pct z levelProgress, ten istý údaj ako
   progressbar vo vysvedčení), číslo levelu sedí NA JEHO OKRAJI. Je to jediný variant
   z nákresu, ktorý pridáva informáciu, čo na obrazovke nebola vôbec — koľko chýba do
   ďalšieho levelu. Tým sa rang presťahoval k avatarovi a slovo PÚTNIK prestalo byť
   jediným nositeľom „kde som", čo je dôvod, prečo ho mobil nižšie môže vypustiť.
   ⚠️ Fotka je naďalej 34 px — obal je väčší o lem a medzeru, nie fotka menšia. */
.trp-avwrap{position:relative;flex:0 0 auto;width:${AV_D}px;height:${AV_D}px;display:grid;place-items:center;}
.trp-avwrap svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;}
.trp-mavatar{width:34px;height:34px;border-radius:50%;flex:0 0 auto;object-fit:cover;border:1.5px solid ${GOLD};box-shadow:0 0 0 1px rgba(0,0,0,0.5);}
.trp-avwrap .trp-mavatar{border:none;position:relative;z-index:1;}
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
.trp-midentity .trp-level-num{align-items:center;padding:3px 10px 4px;border-radius:999px;background:linear-gradient(135deg,var(--tier-a,#F5C73D),var(--tier-b,#E69E1A));-webkit-background-clip:border-box;background-clip:border-box;color:var(--tier-ink,${INK});-webkit-text-fill-color:var(--tier-ink,${INK});filter:none;box-shadow:0 2px 8px var(--tier-glow,rgba(245,199,61,0.28));transition:background .5s,color .5s,box-shadow .5s;}
.trp-midentity .trp-level-num em{font-size:14px;}
/* Číslo NA OKRAJI avatara. Lem --notch-rim je farba podkladu POD ním — na tmavej mobilnej
   hlavičke sklo, na papyrusovom PC doska; bez neho číslo splýva s prstencom. Trieda ostáva
   .trp-level-num, takže klik naň naďalej otvára panel pásiem (closest v renderIdentity). */
.trp-avwrap .trp-level-num--notch{position:absolute;z-index:3;right:-2px;bottom:-2px;width:20px;height:20px;padding:0;border-radius:50%;justify-content:center;align-items:center;box-shadow:0 2px 7px var(--tier-glow,rgba(245,199,61,0.28)),0 0 0 2px var(--notch-rim,#171009);}
.trp-avwrap .trp-level-num--notch em{font-size:11px;}
/* ⚠️ KLIK NA ČÍSLO OTVÁRA PANEL PÁSIEM, a 20 px bublina je pod dotykovým prahom — predtým to
   bola pilulka v riadku (~34×22). Kresba ostáva malá, klikacia plocha sa zväčšuje neviditeľným
   štvorcom: bez neho sa na telefóne trafíš do identity a odletíš na triplist. */
.trp-avwrap .trp-level-num--notch::after{content:'';position:absolute;left:50%;top:50%;width:34px;height:34px;transform:translate(-50%,-50%);border-radius:50%;}
/* ── MOBIL: DVA RIADKY S ČÍSLAMI NAMIESTO SLOVA PÚTNIK (Matej 2026-08-28) ──────
   „na mobile to nebude vychádzať a preto tam nebude slovo putnik ale namiesto neho tam bude
   v dvoch riadkoch - km a počet tripov."
   Nahradilo jednoriadkový .trp-mstats („12 výletov · 148 km"), ktorý zanikol — ten istý
   údaj, len rozložený tak, aby bol čitateľný bez slova, ktoré sa na 390 px nezmestí.
   Zapnuté LEN v mobilnej vetve; na PC ostáva rang, lebo tam je naň miesto. */
.trp-mstats2{display:none;flex-direction:column;gap:1px;min-width:0;}
.trp-mstats2 span{display:flex;align-items:baseline;gap:5px;white-space:nowrap;line-height:1.05;}
.trp-mstats2 b{font-family:${FONT_UI};font-weight:600;font-size:17px;letter-spacing:0;color:rgba(245,240,228,0.94);font-variant-numeric:tabular-nums;}
.trp-mstats2 i{font-family:${FONT_UI};font-style:normal;font-weight:500;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:${T.onDarkDim};}
.trp-midentity:hover .trp-level-name{color:#fff;}
.trp-level-name{font-family:${FONT_TITLE};font-weight:700;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:rgba(245,240,228,0.92);}
.trp-level-num{display:inline-flex;align-items:baseline;gap:5px;font-family:${FONT_UI};line-height:1;background:linear-gradient(135deg,var(--tier-a,#F5C73D),var(--tier-b,#E69E1A));-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 7px var(--tier-glow,rgba(245,199,61,0.35)));}
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
/* Dva prvky v rohu: vlajka (krajina) a posuvníky (zoradenie). Rovnaká veľkosť aj tvar —
   sú to dve rovnocenné ovládania toho istého zoznamu, nie hlavné a vedľajšie. */
.trp-greet-tools{display:flex;align-items:center;gap:7px;flex-shrink:0;}
.trp-greet-filterwrap{position:relative;flex-shrink:0;}
.trp-flagdd{position:relative;display:inline-flex;flex-shrink:0;}
/* Vlajka je emoji ⇒ vlastný font, inak na Windows sadne čiernobiely textový variant. */
.trp-flagdd-face{font-family:${FONT_EMOJI};font-size:19px;line-height:1;}
/* Panel sa otvára pod vlajkou, ale zarovnaný VPRAVO — vľavo je pozdrav a zoznam by z panela
   vytiekol. Rovnaké pravidlo ako pri zoraďovaní vedľa neho. */
.trp-flagdd-panel{right:0;min-width:150px;}
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
/* ⚠️ .trp-country-select a .trp-filter-select ZANIKLI 2026-08-26 spolu s .trp-toprow-select —
   Región aj Aktivity sú odteraz TripPickDropdown. Dôvod je ten istý (systémový zoznam sa
   otváral čierny) a rovnako platí, že sirota po nich by klamala o tom, ako filtre fungujú. */
/* geo kaskáda (Matejov feedback bod 4, iterácia 7; Pohorie vrátené iterácia 9; Activity
   presunutá sem 2026-07-27): country (malinký, flag+kód) → región (West/Center/East) →
   activity. Flexbox namiesto grid-u 3 pevných stĺpcov, lebo activity musí ostať v riadku
   aj keď je región skrytý (mimo SK) — grid s 3 stĺpcami by vtedy nechal prázdnu medzeru. */
.trp-georow{display:flex;gap:7px;}
/* Matej 2026-08-06: „pri prvom dropdowne kde je všetko = je krátky a šípka splýva s písmom".
   72px nestačilo na vlajku + text + natívnu šípku selectu, takže sa prekrývali. Širší základ
   + pravý padding, ktorý drží text mimo šípky (tú kreslí OS, posunúť sa nedá — dá sa len
   uvoľniť miesto). Ostatné dva selecty sú flex 1 1 0, takže sa o zvyšok podelia samy. */
/* Rad filtrov delí šírku rovnakým dielom. Rozbaľovačky sú <span> obal + <button>, takže
   podiel drží OBAL (.trp-pickdd-wrap / .trp-tagdd-wrap), nie samotné tlačidlo. */
.trp-georow .trp-pickdd-wrap{flex:1 1 0;min-width:0;}
/* Tagy sú tretí diel toho istého radu (2026-08-26) — rovnaký diel ako región a aktivita.
   Šírku preto berie kontajner, nie inline štýl komponentu: ten istý komponent stál do teraz
   v hornom paneli, kde bol rad iný, a pevné 1 1 140px by tu prebilo rovnaké diely. */
.trp-tagdd-wrap{flex:1 1 0;min-width:0;}
.trp-georow .trp-tagdd-btn{padding:8px 9px;border-radius:9px;font-size:13px;}

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
.trp-bigcard{border-radius:14px;overflow:hidden;background:rgba(245,240,228,0.03);border:1px solid rgba(245,240,228,0.10);cursor:pointer;transition:all .15s;flex-shrink:0;}
/* ⚠️ ŽIADNY FAREBNÝ ĽAVÝ PRUH (Matej 2026-08-28: „tripy majú na ľavom boku farebný rámik
   zelený… prečo? daj to preč“). Bol to 3px lem vo farbe stavu (zelená = prejdený, zlatá =
   v triplistoch, červená = ani jedno) — posledný zvyšok legendy, ktorá zanikla 3. 8., takže
   farbu už nemal z čoho odvodiť nikto okrem kódu. Stav už nesie čip WALKED aj hviezda
   TRIPLIST priamo na fotke — to je to isté dvakrát, raz pomenované a raz nie. */
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
/* TELO KARTY = DVA RIADKY (Matej 2026-08-26). Prvý nesie názov (a nad ním eyebrow s pohorím),
   druhý podpis: avatary + autor vľavo, hodnotenie vpravo.
   ⚠️ ZANIKLI TU DVA STĹPCE (loc/názov/autor vľavo, rating vpravo). Kým bol rating stĺpcom,
   ukrajoval názvu ~90 px šírky, takže sa dlhé mená lámali do dvoch riadkov pri 13,5 px písme —
   presne to, kvôli čomu názov nevedel vážiť viac. */
.trp-bigcard-body{padding:11px 13px 12px;display:flex;flex-direction:column;}
.trp-bigcard-info{min-width:0;}
/* justify-content:space-between — hodnotenie drží PRAVÝ okraj karty, nie koniec mena autora:
   inak by pri každom výlete stálo inde a riadok by pri skrolovaní poskakoval. */
.trp-bigcard-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:6px;}
/* pohorie · región label, pod fotkou (Matejov feedback bod 3, iterácia 7) */
/* Región nad názvom = eyebrow (Entry.tsx .religion-eyebrow vzor) → FONT_UI 500 + .22em. */
.trp-bigcard-loc{font-family:${FONT_UI};font-weight:500;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(245,240,228,0.45);margin-bottom:3px;}
/* ── PREČO JE KARTA V TOMTO FILTRI (2026-08-31) ────────────────────────────────────────
   Dvojica pilulek: identita výletu + hodnota, cez ktorú sa do filtra dostal. Zelená je tá
   istá, akou celý tok značí „vybral som si" — tu hovorí „toto si hľadal". Zobrazuje sa len
   počas filtrovania, takže bežná karta ostáva bez nich. */
.trp-bigcard-why{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:5px;}
.trp-cbadge{display:inline-flex;align-items:center;gap:4px;font-family:${FONT_UI};font-weight:500;font-size:9px;letter-spacing:.08em;text-transform:uppercase;padding:2px 7px;border-radius:999px;border:1px solid rgba(245,240,228,0.22);color:rgba(245,240,228,0.62);}
.trp-cbadge-e{font-size:10px;line-height:1;}
.trp-cbadge--via{border-color:${T.growGreen};color:#9FD3AC;background:rgba(61,122,78,0.16);}
/* bod 4 (iterácia 16): line-clamp 2 riadky, nech dlhé názvy nerozbíjajú layout */
.trp-bigcard-name{font-family:${FONT_TITLE};font-weight:700;font-size:16px;line-height:1.2;color:rgba(245,240,228,0.92);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
/* AKO SA TAM IDE — riadok pod názvom plánu vo VNORENOM DETAILE (.trp-inldet), nie na karte
   v ľavom zozname: neprejdený plán do toho zoznamu zámerne nepatrí. Meno triedy drží predponu
   bigcard, lebo detail si požičiava aj .trp-bigcard-photonav — zavedená konvencia tohto súboru.
   Bodkový oddeľovač je PSEUDOPRVOK medzi súrodencami, nie znak v texte: ktorékoľvek z políčok
   môže chýbať a bodka by ostala visieť na kraji. Emoji sedí v jednom span so svojím slovom,
   inak by ich oddeľovač rozrazil na „🚆 · Vlakom". */
.trp-bigcard-travel{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:5px;font-family:${FONT_UI};font-weight:500;font-size:11px;letter-spacing:.02em;color:rgba(245,240,228,0.62);}
.trp-bigcard-travel > span + span::before{content:'·';margin-right:6px;opacity:.5;}
.trp-bigcard-travel .trp-bigcard-seats{color:${GOLD};}
/* bod 6: "by {author}" riadok + avatarpair (majiteľ+pes) — .trp-bigcard-author je teraz
   inline text vedľa avatarov, nie vlastný blok (margin presunutý na wrapper riadok). */
/* Podpis je najmenší text karty (Matej 2026-08-26: „nahodený výlet bude menším"). Nesie, KTO
   výlet nahodil — to je poznámka pod čiarou, nie tretí názov. Nad ním je meno výletu, ktoré
   má viesť. */
.trp-bigcard-authorrow{display:flex;align-items:center;gap:5px;min-width:0;}
/* Matej 2026-08-26: „to by matej je stále veľmi veľké — zmenši to na veľkosť ako je to
   hodnotenie vedľa." Podpis a hodnotenie majú byť jeden pár, nie dva rôzne hlasy. */
.trp-bigcard-author{font-size:12px;color:rgba(245,240,228,0.45);}
/* #41 / A4 — autor je odteraz tlačidlo (otvára popup tvorcu). Reset UA štýlov, nech
   riadok vyzerá presne ako predtým; zlatý podčiarkovník napovie, že sa dá kliknúť. */
/* ⚠️ SKRATKA font:inherit TU BOLA A ZHADZOVALA VEĽKOSŤ PODPISU (opravené 2026-08-26). Nastavuje
   aj font-size, a keďže button.trp-authorbtn (0,1,1) prebíja .trp-bigcard-author (0,1,0) NA TOM
   ISTOM elemente, podpis mal 16 px zdedených z body — nie 9 px, ktoré predpisuje jeho vlastné
   pravidlo. To isté ticho platilo pre .trp-inldet-author v detaile. Preto sa rozpisuje po
   vlastnostiach: veľkosť si drží povrch, na ktorom tlačidlo stojí. */
button.trp-authorbtn{background:none;border:none;padding:0;margin:0;text-align:left;cursor:pointer;font-family:inherit;font-weight:inherit;font-style:inherit;line-height:inherit;color:inherit;letter-spacing:inherit;text-decoration:underline;text-decoration-color:rgba(201,154,63,0.45);text-underline-offset:3px;}
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
/* KONCEPT — nedokončený výlet. Pilulka zámerne NIE JE zlatá: zlatá na mape znamená STAV
   „hotové/tvoje", a koncept je opak. Papierová šeď hovorí „ešte to nie je vonku". */
.trp-draftpill{display:inline-block;font-family:${FONT_UI};font-weight:600;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#E8DCC3;background:rgba(0,0,0,0.55);padding:4px 9px;border-radius:7px;border:1px dashed rgba(232,220,195,0.55);}
.trp-draftrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:9px 12px 0;}
.trp-draftmiss{font-family:${FONT_UI};font-size:11px;line-height:1.35;color:rgba(232,220,195,0.72);flex:1 1 120px;min-width:0;}
.trp-draftbtn{flex-shrink:0;font-family:${FONT_TITLE};font-weight:700;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;padding:7px 12px;border-radius:8px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:#3d1f00;border:1px solid rgba(250,244,236,0.30);cursor:pointer;}
.trp-draftbtn:active{transform:scale(0.98);}
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
/* ── NÁZOV EXISTUJÚCEJ TRASY POČAS KRESLENIA (2026-08-25) ─────────────────────
   Rovnaký recept, aký si vyžiadal Matej 23. 8. na fialovú pilulku nad mapou („takmer
   neviditeľná — treba ju zvýrazniť"): PLNÝ tmavý podklad, nie priesvitný tint. Na papierovej
   turistickej mape priesvitná pilulka zmizne. Rám je fialový zo svetelného meča, aby bolo
   na prvý pohľad jasné, že pilulka patrí TRASE, nie značke svorky (tá má vlastné tvary a farby).
   Meno výletu = Cinzel (identita), nie Space Grotesk — rovnaké pravidlo ako názvy výletov inde. */
.trp-dname{position:absolute;left:0;top:0;transform:translate(-50%,-50%);white-space:nowrap;
  padding:4px 10px;border-radius:999px;cursor:pointer;
  background:linear-gradient(180deg,rgba(23,20,14,.96),rgba(11,9,6,.96));
  border:1px solid ${TRAIL_LINE.light};color:#F3E9FF;
  font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.03em;
  box-shadow:0 2px 10px rgba(0,0,0,.5);transition:transform .12s,box-shadow .12s;}
.trp-dname:hover{transform:translate(-50%,-50%) scale(1.06);box-shadow:0 0 0 3px rgba(179,107,255,.3),0 3px 12px rgba(0,0,0,.6);}
/* Bodka náročnosti vnútri názvu — malá, aby meno ostalo hlavné. */
.trp-dname-d{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:6px;vertical-align:middle;}
/* PRI ODDIALENÍ LEN BOD (Matej 2026-08-25). Farba = náročnosť, biely lem drží bod čitateľný
   nad zeleným aj nad šedým podkladom mapy. Terč je zámerne väčší než kresba: 9 px sa palcom
   netrafí, preto je okolo neho priehľadný rám cez box-shadow namiesto väčšieho kruhu. */
.trp-dpin{position:absolute;left:0;top:0;transform:translate(-50%,-50%);display:block;
  width:9px;height:9px;border-radius:50%;cursor:pointer;border:1.5px solid rgba(255,255,255,.92);
  box-shadow:0 0 0 7px rgba(0,0,0,0),0 1px 4px rgba(0,0,0,.55);}
.trp-dpin:hover{box-shadow:0 0 0 4px rgba(179,107,255,.35),0 1px 5px rgba(0,0,0,.6);}

/* ── NÁHĽAD TRASY NAD DOKOM ───────────────────────────────────────────────────
   Sedí NAD dokom (33 vh), nie v ňom: dok patrí kresleniu a jeho tvar má jeden zdroj
   (mapDockShape.ts) — vlievať doň cudzí obsah by ten tvar rozbilo. Karta je preto
   samostatná, nízka a dá sa zavrieť, takže kreslenie pod ňou nezastane. */
.trp-peek{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(33vh + 14px);z-index:1200;
  width:min(360px,calc(100vw - 28px));padding:12px 14px 10px;border-radius:14px;
  background:linear-gradient(180deg,rgba(23,20,14,.97),rgba(11,9,6,.97));
  border:1.5px solid ${TRAIL_LINE.light};box-shadow:0 12px 34px rgba(0,0,0,.6);color:#F3E9FF;}
.trp-peek-x{position:absolute;top:6px;right:9px;background:none;border:0;color:rgba(243,233,255,.6);
  font-size:19px;line-height:1;cursor:pointer;padding:2px 4px;}
.trp-peek-name{font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.02em;
  padding-right:22px;margin-bottom:3px;}
.trp-peek-row{font-family:${FONT_UI};font-weight:500;font-size:12px;color:rgba(243,233,255,.82);
  display:flex;align-items:center;gap:5px;flex-wrap:wrap;}
.trp-peek-sep{color:rgba(243,233,255,.35);}
.trp-peek-elev{margin-top:8px;}
/* Bodka náročnosti — tá istá os a tie isté tokeny ako markery mapy (DIFF_COLOR). */
.trp-peek-diff{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:1px;}
/* AInubisov hlas. Tvár v kruhu ako v jeho bubline nad mapou; text menší než názov trasy —
   je to rada, nie nadpis. */
.trp-peek-ainubis{display:flex;align-items:flex-start;gap:9px;margin:0 0 9px;padding-right:20px;}
.trp-peek-ainubis img{flex:0 0 auto;border-radius:50%;}
.trp-peek-ainubis span{font-family:${FONT_UI};font-weight:500;font-size:12px;line-height:1.35;color:rgba(243,233,255,.9);}
.trp-peek-acts{display:flex;align-items:center;gap:10px;margin-top:10px;}
/* Zlaté CTA = .btn-gold lock (gradient, radius 8, papyrusový rám) — nie pilulka. */
.trp-peek-go{flex:1 1 auto;padding:10px 14px;border-radius:8px;cursor:pointer;
  background:linear-gradient(135deg,#F5C73D,#E69E1A);color:#1c160c;
  border:1px solid rgba(250,244,236,0.30);box-shadow:inset 0 1px 0 rgba(255,255,255,0.3);
  font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.06em;text-transform:uppercase;}
.trp-peek-mine{flex:0 0 auto;background:none;border:0;cursor:pointer;padding:8px 2px;
  font-family:${FONT_UI};font-weight:500;font-size:11.5px;color:rgba(243,233,255,.62);text-decoration:underline;}
/* Nízke okno (mobil na šírku): dok aj karta by si sadli na seba — profil ustúpi ako prvý,
   lebo názov a čas sú odpoveď na otázku, profil je bonus. */
@media (max-height:560px){.trp-peek-elev{display:none;}}
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
  .trp-tagdd-btn{flex:1 1 100px;min-width:92px;padding:9px 11px;font-size:12px;}
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
  /* ── MOBIL NIE JE ZMENŠENÉ PC (Matej 2026-08-28) ────────────────────────────────────
     Slovo PÚTNIK odchádza a jeho miesto berú dva riadky s číslami; rang nesie prstenec
     a číslo pri avatarovi. Tým sa v lište uvoľní priestor pre triplist, ktorý sa sem
     3. 8. 2026 VRACIA zo zoznamu (vtedy odišiel s odôvodnením „na mobil je toho veľa" —
     to už neplatí, lebo ubudlo slovo aj celý riadok pod ním). */
  .trp-mheader-status .trp-level{display:none;}
  .trp-mheader-status .trp-mstats2{display:flex;}
  .trp-mtriplist{flex:0 0 auto;}
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

  /* full-page card list — replaces the map (not an overlay) when mobileView==='list'.
     ⚠️ HORNÝ PADDING JE PREMENNÁ, NIE ČÍSLO (oprava 2026-09-01) — presne ako .trp-ctlstack.
     Komentár tu roky tvrdil „top padding sedí s výškou .trp-mheader", ale sedel len náhodou:
     bolo to natvrdo napísaných 118 px, čo je výška hlavičky pri DVOCH riadkoch. Keď hlavičke
     pribudol tretí riadok (prepínač kategórií), narástla na 159 px a prvých 41 px zoznamu —
     vrátane prepínača NADCHÁDZAJÚCE/ARCHÍV — zmizlo POD hlavičkou. Odmerané, nie odhadnuté.
     --trp-mheader-h publikuje ResizeObserver v PackMap (~4180) a SKUTOČNÁ výška už v sebe
     má env(safe-area-inset-top) z paddingu hlavičky ⇒ pripočítať ho ešte raz by ho zdvojil.
     Fallback 159px = stav pri troch riadkoch (kým observer prvýkrát nezmeria). */
  .trp-mlist{position:absolute;inset:0;z-index:60;overflow-y:auto;background:#050505;padding:var(--trp-mheader-h,159px) 14px 150px;}
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

// ══ BLEDÝ SKIN PC CHROME MAPY (2026-08-26) ═══════════════════════════════════════════════
// Matej: „ideme robiť redizajn do bledého štýlu = ľavý panel bude bledý s okrajom ako má aj
// spodný nav a to isté platí aj o vrchnom headri… teraz ideme riešiť PC /map - add trip a flow."
//
// PREČO SAMOSTATNÝ BLOK A NIE PREPIS `CSS` VYŠŠIE — tri dôvody, každý zaplatený inde:
//  1. `.trp-sidebar` aj `.trp-topbar` sú POD 1024 px `display:none` a ich potomkovia
//     (`.trp-mapsearch`, `.trp-stat-pill`, `.trp-midentity`, `.trp-headright`…) sú ZDIEĽANÍ
//     s mobilnou hlavičkou `.trp-mheader`. Prepis v hlavnom bloku by prefarbil mobil, ktorý
//     ostáva tmavý až do vlastného kola. Celý blok preto stojí v `@media (min-width:${PALE_PC_MIN}px)`
//     a každý selektor je zakotvený v `.trp-sidebar` / `.trp-topbar` / `.trp-addhost`.
//  2. Zamietnutie sa musí dať vrátiť JEDNÝM slovom — `MAP_SKIN = 'glass'` a je späť tmavé
//     sklo, presne ako `NAV_SKIN` v `PackLayout.tsx`. Prepísané pôvodné hodnoty by sa
//     vracali ručne z gitu.
//  3. Ladenie je celé na jednom mieste, nie rozsypané po 800 riadkoch pôvodného CSS.
//
// RÁM = `goldFrameCSS()` z `navGoldSkin.ts` — TEN ISTÝ zdroj, z ktorého žije spodný nav.
// Druhá kópia gradientov by sa rozišla pri prvej úprave a panel by prestal byť z toho istého
// materiálu ako bar, čo je celé zadanie.
//
// PLOCHY VNÚTRI = matrica `PACK_BOX` z `packTheme.ts` (karta / podblok / riadok / pole).
// Nevymýšľame tu vlastné papyrusové odtiene — to je presne to „vyzerá to neprofesionálne",
// kvôli ktorému matrica vznikla.
// ⚠️ `MAP_SKIN` sa importuje z `navGoldSkin.ts` — potrebujú ho aj listové moduly toku
// pridávania, ktoré tento súbor importuje, takže tu stáť nemôže (bol by to kruh).

// Inkoust na papyruse — jedna sada, nech sa neopakujú rgba čísla v päťdesiatich pravidlách.
const P_INK = T.inkStrong;                      // #2a1608 — nadpisy, mená, hodnoty
const P_DIM = T.inkWarm;                        // #7a5a2a — podriadky, eyebrow, meta
const P_FAINT = 'rgba(42,22,8,0.42)';           // tretia úroveň (oddeľovače, „N ďalších")
const P_BORDER = 'rgba(179,130,45,0.55)';       // rám poľa/pilulky (zhoda s `.pf-field`)
const P_HAIR = 'rgba(179,130,45,0.26)';         // vlasová linka MEDZI prvkami (nie rám!)
const P_FIELD = '#FBF5E6';                      // plochá výplň písacieho poľa (`.pf-field--flat`)
const P_SOFT = 'rgba(255,251,240,0.55)';        // nečinná pilulka — svetlejšia než doska
const P_HOT = 'rgba(201,154,63,0.20)';          // hover/označené

const PALE_CSS = MAP_SKIN !== 'pale' ? '' : `
@media (min-width:${PALE_PC_MIN}px){

  /* ── 1. RÁMY ──────────────────────────────────────────────────────────────────────────
     Tri plochy, jeden materiál: ľavý panel, hostiteľ formulára pridávania a stavový riadok
     hlavičky. Tvar NEPÍŠU — berú BLOCK z navGoldSkin.ts (Matej 2026-08-26, 2. kolo:
     „toto musíme ujasniť a aplikovať všade, locknúť dizajn").
     ⚠️ Do teraz tu boli TRI rôzne dvojice (18/6 panely, 14/5 hlavička, 20/7 popup) a každá
     mala vlastné odôvodnenie — spolu s navom (14/6) to boli štyri varianty toho istého bloku
     na jednej obrazovke. Argument „na vysokom paneli by 14 vyzeralo ostro" padol na tom, že
     predlohou je BAR: keď sa má blok naň podobať, kopíruje sa, neladí. */
  /* ⚠️ ĽAVÝ STĹPEC MÁ MASÍVNY RÁM S RELIÉFOM (Matej 2026-08-26, 2. kolo: „ľavý blok by si
     zaslúžil masívnejšie okraje, možno aj jemne zdobené — nejaký jednoduchý anticko-egyptský
     dizajn, reliéf… nie ornamenty!"). Vedomá výnimka z locku jedného tvaru, pomenovaná v
     navGoldSkin.ts ako SLAB (20/12). Platí LEN pre stĺpec cez celú výšku obrazovky — hlavička
     aj popup ostávajú na BLOCK (14/6). Vnútorný polomer je v oboch prípadoch 8, takže sa
     mení výhradne hrúbka lemu, nie doska.
     ⚠️ ŽIADNA RYHA A ŽIADNY BEVEL. Ryhu Matej zamietol po jednom kole („tá ryha mi tam vadí,
     daj ju preč"), bevel po troch — vždy sa prejavil v ROHU, kde sa horná a bočná linka spoja
     a lem tam opticky zdvojnásobí hrúbku („vnútorné rohy v ľavom bloku nekolidujú").
     Masívnosť nesie hrúbka lemu a gradient v ňom, nie kresba na ňom. Odôvodnenie a všetky
     tri pokusy sú v navGoldSkin.ts nad definíciou SLAB. */
  .trp-sidebar{${goldFrameCSS({ radius: SLAB.radius, rim: SLAB.rim })}backdrop-filter:none;-webkit-backdrop-filter:none;}

  /* ── HLAVIČKA MÁ VÝREZ (Matej 2026-08-26, náčrt) ──────────────────────────────────────
     „urobme taký výrez kedy ľavá časť horného navu bude mať ako keby plný okraj" —
     identita (fotka + rang + level) nestojí na doske, ale priamo na zlate, a doska začína
     až za ňou. Riadok preto nesie ZLATO BEZ DOSKY a doska je samostatný prvok.
     ⚠️ Tvar oboch dielov je z navGoldSkin.ts (goldFrameCSS s plate:false + goldPlateCSS),
     nie vlastné čísla — inak by výrez bol piata varianta toho istého bloku, presne to, čo
     lock z 26. 8. zakazuje.
     ⚠️ VÝREZ JE LEN VĽAVO — ZDVOJENÝ OKRAJ BOL CHYBA (Matej 2026-08-26, 2. kolo: „vytvoril si
     dvojitý okraj na bokoch, chcel som všetko zachovať — hrúbku okraja okolo — a len urobiť
     výrez; teraz sú kraje moc široké a je vidno zdvojenie, aj napríklad na pravej strane").
     Príčina: riadok si nechal svoje pôvodné padding 13px/20px, takže doska stála 20 px od
     pravého lemu a 13 px od horného. Vedľa 6 px lemu to čítalo ako druhý, širší rám.
     Odteraz riadok NEMÁ výplň — doska vypĺňa celý padding-box od lemu k lemu (presne ako
     v bare) a jediné, čo ju odsúva, je identita vľavo. Výplň nesú deti. */
  .trp-status-row{${goldFrameCSS({ plate: false })}backdrop-filter:none;-webkit-backdrop-filter:none;padding:0;gap:0;}
  /* align-self:stretch — riadok centruje deti, ale doska musí siahať na plnú výšku lemu.
     Radius je vnútorný (NAV_R.plate = rám 14 mínus lem 6), takže rohy sú koncentrické s rámom. */
  .trp-status-plate{${goldPlateCSS()}display:flex;align-items:center;gap:16px;flex:1 1 auto;min-width:0;align-self:stretch;padding:11px 16px;}
  .trp-status-left{padding:0 16px 0 14px;}
  /* Stredný klaster sa centruje NAD DOSKOU, nie nad celým riadkom: doska je odteraz plocha,
     ktorú človek číta ako „lištu", a chipy patria do jej osi. Auto-margin (nie flex:1) —
     pravý blok si berie len svoju šírku a stred sa vycentruje do zvyšku. */
  .trp-status-plate .trp-status-center{flex:0 1 auto;margin:0 auto;}
  .trp-status-plate .trp-headright{flex:0 0 auto;}
  /* ⚠️ IDENTITA SA UŽ NESMIE ZMRŠTIŤ. V trojdielnom riadku mala flex:1 1 0 (rovnaký podiel
     voľného miesta ako pravý blok) — s výrezom je ale ĽAVÁ ČASŤ tá, ktorá určuje, kde doska
     začína, a doska si ako flex:1 1 auto zobrala priestor pilulke s levelom: číslo zmizlo
     POD dosku. Odteraz drží svoju šírku a voľné miesto berie doska. */
  .trp-status-left{flex:0 0 auto;}

  /* ── 2. HLAVIČKA — stavový riadok ─────────────────────────────────────────────────────
     Identita (rang + level), pilulky s km/výletmi, Triplist, PRIDAŤ a zvonček. */
  .trp-topbar .trp-level-name{color:${P_INK};}
  /* ⚠️ ŠTATISTIKA POD RANGOM SA NEZOBRAZUJE (Matej 2026-08-26: „zároveň je tam info o
     výletoch v chipe aj pod pútnikom… pod pútnikom to vymaž a zväčši slovo pútnik").
     To isté číslo stálo na obrazovke dvakrát vedľa seba. Skrýva sa CSS-om a nie vyhodením
     z renderu zámerne: renderIdentity() obsluhuje aj TMAVÚ MOBILNÚ hlavičku, kde chip
     s výletmi nie je a riadok je jediným miestom, kde tú informáciu človek uvidí. */
  .trp-topbar .trp-mstats2{display:none;}
  /* Lem čísla na okraji avatara = farba dosky pod ním. Na tmavej mobilnej hlavičke drží
     východzia hodnota (#171009), tu ho prepisuje pieskovec, inak by číslo malo okolo seba
     čierny krúžok na svetlom. */
  .trp-topbar .trp-avwrap{--notch-rim:#D8B052;}
  /* Rang ostal v riadku sám, tak môže vážiť viac. */
  .trp-topbar .trp-level-name{font-size:16px;letter-spacing:.12em;}
  .trp-topbar .trp-midentity:hover .trp-level-name{color:#000;}
  /* Avatar: zlatý krúžok na tmavom pozadí mal čierny halo ring, ktorý na papyruse vyzerá
     ako špina. Ostáva rám, halo sa mení na svetlý. */
  .trp-topbar .trp-mavatar{box-shadow:0 0 0 1px rgba(255,252,240,0.9);}
  /* Iniciála ostáva ZLATÁ (rovnaký kruh ako .trp-inldet-authoravatar), nie papyrusová:
     krémový kruh na pieskovej doske je krém na kréme a avatar z hlavičky zmizne. */
  .trp-topbar .trp-mavatar--initial{background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);color:#1c160c;}
  /* Pilulka = úroveň 5 matrice (pilulkový variant poľa): plochá svetlá výplň, jeden rám. */
  /* ── LAPIS — HLAVNÁ AKCIA A OZNAČENÁ VOĽBA (pracovný návrh, 2026-08-26) ───────────────
     Pravidlo: ZLATO drží konštrukciu a polohu (rám, doska, nav, aktívny krok), LAPIS nesie
     to, čo urobí človek (hlavné CTA, označená voľba). Na papyruse bola zlatá naraz rámom,
     doskou aj tlačidlom — PRIDAŤ tak bolo najsvetlejším prvkom lišty a splývalo s ňou.
     ⚠️ NIE JE TO modrá z mapy (T.brandBlue). Značky na mape sú svetlý lem na bielom kruhu,
     lapis je vždy tmavá výplň v chrome — to je jediné, čo tie dve modré drží oddelene.
     ⚠️ Do brand manuálu sa to NEZAPISUJE, kým Matej redizajn neodklepne (jeho slová:
     „zatiaľ to nezapisuj ale používajme to pri redizajne"). Zdroj hodnôt: LAPIS v navGoldSkin.ts. */
  /* ── SPRÁVY A NOS BOLI NEVIDITEĽNÉ (Matej 2026-08-26: „správy a nos viac zvýrazni sú
     neviditeľné") ────────────────────────────────────────────────────────────────────────
     PackNotifications má v svetlej vetve buttonBg: transparent a slabý rám — na
     pieskovej doske z tlačidla nezostalo nič. Farby si nesie v INLINE štýloch, takže sa bez
     !important prebiť nedajú; parameter dark tu nepomôže, lebo problém je práve svetlá
     vetva. Meniť ju v komponente by prefarbilo aj HeroCard na /pack, čo nikto nepýtal —
     preto lokálny prepis. Precedens: .trp-header-notif a .trp-mheader-status už
     !important používajú z toho istého dôvodu. */
  /* ── SPRÁVY A UPOZORNENIA = OBRÁTENÁ PILULKA (Matej 2026-08-26, tretie kolo) ──────────
     „skúsme dať tie správy a upozornenia revertnú = chip tmavý a ikonka zlatá."
     Presný opak chipov vedľa: tam zlatá výplň a tmavá kresba, tu tmavá výplň a zlatá kresba.
     Nie je to tretia farba — je to tá istá dvojica prevrátená, takže pás ostáva jednotný a
     zároveň je hneď vidieť, že tieto dve tlačidlá robia niečo iné než odkazy na výlety.
     ⚠️ Vystúpený tieň sa NEDEDÍ z NAV_PILL_SHADOW: jeho horná hrana je svetlý krém, ktorý na
     tmavej výplni vyzerá ako škrabanec. Tmavá pilulka má vlastnú — zlatú — hornú hranu. */
  .trp-topbar .trp-header-notif button{background:linear-gradient(180deg,#3A2410,#1B0F05)!important;border:1px solid ${T.cardEdge}!important;color:${T.accentGold}!important;box-shadow:inset 0 1px 0 rgba(201,154,63,0.45),0 3px 8px -1px rgba(40,25,6,0.55)!important;}
  .trp-topbar .trp-header-notif button:hover{filter:brightness(1.18);}
  /* Obálka je obrázok tintovaný filtrom — na tmavom chipe zlatý tint (zhoda s BrandIcon gold).
     Nos je inline SVG s currentColor, ten si farbu berie z color vyššie. */
  .trp-topbar .trp-header-notif button img{filter:brightness(0) saturate(100%) invert(58%) sepia(56%) saturate(481%) hue-rotate(2deg) brightness(91%) contrast(86%)!important;opacity:1!important;}

  .trp-topbar .trp-addtrip-btn{background:${LAPIS.grad};color:${LAPIS.ink};border-color:${LAPIS.deep};box-shadow:${LAPIS_BTN_SHADOW};}
  .trp-topbar .trp-addtrip-btn:hover{background:${LAPIS.gradHover};filter:none;box-shadow:${LAPIS_BTN_SHADOW};}
  /* Ikonka plus je čierna kresba — na lapise ju treba prefarbiť na zlatú, inak z tlačidla
     zmizne. Hodnoty filtra mieria na LAPIS.ink (#EFD79A). */
  .trp-topbar .trp-addtrip-icon{filter:brightness(0) saturate(100%) invert(89%) sepia(23%) saturate(720%) hue-rotate(348deg) brightness(101%) contrast(92%);}

  /* ── CHIPY = POLOŽKA SPODNÉHO NAVU (Matej 2026-08-26) ─────────────────────────────────
     „mali vyzerať ako chipy v dolnom nave aj farbou aj tvarom a dizajnom" — teda presne to,
     čo v PackLayout.tsx dostáva AKTÍVNA položka: plná zlatá výplň, tmavý obrys, okrúhly tvar
     a vystúpený tieň. Nie hover-efekt, ale východiskový stav: tieto dva chipy nie sú
     prepínač, sú to trvalé odkazy, takže „vypnutý" stav nemajú.
     ⚠️ Hodnoty sa NEOPISUJÚ — berú sa z NAV_GOLD / NAV_PILL_SHADOW, aby sa lišta hore a lišta
     dole nerozišli pri prvej úprave predlohy. */
  .trp-topbar .trp-stat-pill{background:${NAV_GOLD.activeFill};border:1px solid ${NAV_GOLD.edge};border-radius:999px;box-shadow:${NAV_PILL_SHADOW};}
  .trp-topbar .trp-stat-pill img{filter:none;opacity:.8;}
  .trp-topbar .trp-stat-pill b{color:${NAV_GOLD.ink};}
  .trp-topbar .trp-stat-pill span{color:${NAV_GOLD.ink};}
  .trp-topbar button.trp-stat-pill:hover{filter:brightness(1.06);}
  .trp-topbar button.trp-stat-pill.on{background:${LAPIS.grad};border-color:${LAPIS.deep};}
  .trp-topbar button.trp-stat-pill.on b,.trp-topbar button.trp-stat-pill.on span{color:${LAPIS.ink};}
  .trp-topbar button.trp-stat-pill.on img{opacity:.9;filter:brightness(0) invert(1);}

  /* ── 3. HLAVIČKA — riadok hľadania a filtrov ──────────────────────────────────────────
     Tu ZÁMERNE nie je zlatý rám okolo každého poľa: päť rámovaných doštičiek vedľa seba by
     z hlavičky urobilo výkladnú skriňu. Polia sú úroveň 5 matrice (".pf-field--flat") —
     plochý papyrus, jeden rám, radius 8 — len s tieňom navyše, lebo stoja priamo nad mapou
     a bez neho by na svetlej mape splynuli. */
  .trp-topbar .trp-mapsearch,
  .trp-topbar .trp-tagdd-btn{background:${P_FIELD};border:1.5px solid ${P_BORDER};color:${P_INK};box-shadow:0 6px 18px rgba(70,45,10,0.22);backdrop-filter:none;-webkit-backdrop-filter:none;}
  .trp-topbar .trp-mapsearch img{filter:none;opacity:.55;}
  .trp-topbar .trp-mapsearch input{color:${P_INK};}
  .trp-topbar .trp-mapsearch input::placeholder{color:${P_DIM};opacity:.75;}
  .trp-topbar .trp-mapsearch:focus-within{border-color:${T.cardEdge};}
  .trp-topbar .trp-tagdd-btn.on{border-color:${T.cardEdge};color:#8A5F1E;background:#FFF6E2;}
  .trp-topbar .trp-tagdd-chevron{opacity:.55;}

  /* ── TAGY V ĽAVOM PANELI ─────────────────────────────────────────────────────────────
     Od 2026-08-26 stojí ten istý komponent v .trp-georow. Tlačidlo tam nie je doštička nad
     mapou, ale tretia rozbaľovačka v rade — preberá teda vzhľad svojich dvoch susedov
     (.trp-filter-select), nie hlavičky. */
  .trp-sidebar .trp-tagdd-btn{background:${P_FIELD};border:1px solid ${P_BORDER};color:${P_INK};backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:none;}
  .trp-sidebar .trp-tagdd-btn.on{border-color:${T.cardEdge};color:#8A5F1E;background:#FFF6E2;}
  .trp-sidebar .trp-tagdd-chevron{opacity:.55;}

  /* Nevyplnená časť labiek v hodnotení — na papyruse tmavá, nie biela (viď RatingPaws). */
  .trp-sidebar{--rp-empty-filter:brightness(0);--rp-empty-opacity:0.20;}

  /* Rozbaľovacie panely hlavičky (návrhy miest, výber tagov) — úroveň 4 matrice (PANEL). */
  .trp-topbar .trp-mapsug,
  .trp-topbar .trp-tagdd-panel{background:${T.panelGrad};border:1.5px solid ${T.cardEdge};box-shadow:${T.panelShadow};backdrop-filter:none;-webkit-backdrop-filter:none;}
  .trp-topbar .trp-mapsug-item{border-bottom:1px solid ${P_HAIR};}
  .trp-topbar .trp-mapsug-item:hover{background:${P_HOT};}
  .trp-topbar .trp-mapsug-name{color:${P_INK};}
  .trp-topbar .trp-mapsug-sub{color:${P_DIM};}
  .trp-topbar .trp-tagdd-eyebrow{color:${T.cardEdge};}
  .trp-topbar .trp-tagdd-row{color:${P_INK};opacity:.8;}
  .trp-topbar .trp-tagdd-row.on{color:#8A5F1E;opacity:1;}
  .trp-topbar .trp-tagdd-row:hover{background:${P_HOT};}
  .trp-topbar .trp-tagdd-clear{border-top:1px solid ${P_HAIR};color:${P_DIM};}
  .trp-topbar .trp-tagdd-clear:hover{color:#8A5F1E;}

  /* ── VŠETKY ROZBAĽOVACIE PANELY SÚ BLEDÉ (Matej 2026-08-26) ──────────────────────────
     „dropdowny treba ustáliť — niektoré sú tmavé, niektoré bledé; všade musia byť bledé."
     Do teraz mal bledú verziu len ten, čo stál v .trp-topbar. Panel vrstiev mapy visí na
     .trp-ctlstack a panel tagov sa presťahoval do .trp-sidebar, takže ani jeden z nich
     zakotvený selektor netrafil a ostali tmavé vedľa bledých.
     ⚠️ SELEKTOR JE BEZ KOTVY NA RODIČA — zámerne. Kotva bola príčinou tohto rozchodu: každý
     presun prvku znamenal, že jeho vzhľad ticho vypadol. Celý blok už stojí v
     min-width:${PALE_PC_MIN}px, teda mobil sa ho netýka. */
  .trp-root .trp-tagdd-panel,
  .trp-root .trp-layersdd-panel{background:${T.panelGrad};border:1.5px solid ${T.cardEdge};box-shadow:${T.panelShadow};backdrop-filter:none;-webkit-backdrop-filter:none;}
  .trp-root .trp-tagdd-eyebrow{color:${T.cardEdge};}
  .trp-root .trp-tagdd-row{color:${P_INK};opacity:.8;}
  .trp-root .trp-tagdd-row.on{color:#8A5F1E;opacity:1;}
  .trp-root .trp-tagdd-row:hover{background:${P_HOT};}
  .trp-root .trp-tagdd-clear{border-top:1px solid ${P_HAIR};color:${P_DIM};}
  /* ⚠️ ODYSEA MÁ BIELY TROJUHOLNÍK (DIFF_MARK_CSS) — postavený pre TMAVÚ mapu, kde je biela
     najvyšší stupeň škály. Na papyruse z neho nezostane nič, takže by štvrtá položka filtra
     vyzerala ako jediná bez značky. Tmavý inkoust drží tú istú eskaláciu (zelená → žltá →
     červená → najtmavšia) a je to farba, ktorou na tejto ploche píše všetko ostatné. */
  .trp-root .trp-tagdd-panel .trp-diffmark--triangle.trp-diffmark--odyssey{border-bottom-color:${P_INK};}
  .trp-root .trp-layersdd-group + .trp-layersdd-group{border-top:1px solid ${P_HAIR};}
  .trp-root .trp-layersdd-row{color:${P_INK};}
  .trp-root .trp-layersdd-hint{color:${P_DIM};}

  /* ── 4. PANEL — pozdrav a prepínač kategórií ──────────────────────────────────────────
     Nadpis podľa locku bledých blokov: Cinzel 700 na "inkStrong". Zlatý nadpis na papyruse
     má kontrast ~1.9:1 — na tmavom paneli fungoval, tu je nečitateľný. */
  .trp-sidebar .trp-greet-hi{color:${P_DIM};}
  .trp-sidebar .trp-greet-sub{color:${P_INK};}
  .trp-sidebar .trp-greet-filter{background:${P_SOFT};border-color:${P_BORDER};}
  .trp-sidebar .trp-greet-filter img{filter:none;opacity:.7;}
  .trp-sidebar .trp-greet-filter:hover{border-color:${T.cardEdge};background:#FFFDF6;}
  .trp-sidebar .trp-greet-filter.on{background:linear-gradient(135deg,#F5C73D,#E69E1A);border-color:rgba(250,244,236,0.55);}
  .trp-sidebar .trp-greet-filter.on img{filter:none;opacity:.9;}

  .trp-sidebar .trp-sortpop--desk{background:${T.panelGrad};border:1.5px solid ${T.cardEdge};box-shadow:${T.panelShadow};backdrop-filter:none;-webkit-backdrop-filter:none;}
  .trp-sidebar .trp-sortpop--desk button{color:${P_INK};border-bottom:1px solid ${P_HAIR};}
  .trp-sidebar .trp-sortpop--desk button.on{color:#8A5F1E;}
  .trp-sidebar .trp-sortpop--desk button:hover{background:${P_HOT};}

  .trp-sidebar .trp-catpill{background:${P_SOFT};border-color:${P_BORDER};color:${P_DIM};}
  /* ⚠️ HOVER NIE JE BIELY (Matej 2026-08-26: „pri prejdení myšou na CTA výlety sa mi nepáči
     biely hover"). Biela na papyruse pôsobí ako výpadok farby, nie ako reakcia — pilulka
     vyzerala vypnutá, nie zvýraznená. Teplý zlatý nádych ide tým istým smerom ako zvolený
     stav, len slabšie: hover naznačuje, kliknutie potvrdí. */
  .trp-sidebar .trp-catpill:not(.soon):hover{border-color:${T.cardEdge};color:${P_INK};background:${P_HOT};}
  /* Zvolená kategória = MOJA VOĽBA ⇒ lapis (pravidlo pri PRIDAŤ vyššie). Zlatá dlaždica na
     zlatej doske v zlatom ráme bola tretia zlatá vrstva na sebe — z troch pilulek sa nedalo
     na prvý pohľad povedať, ktorá je zapnutá. */
  .trp-sidebar .trp-catpill.on{background:${LAPIS.grad};border-color:${LAPIS.deep};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};}
  .trp-sidebar .trp-catpill.soon{border-color:${P_HAIR};color:${P_FAINT};opacity:1;}

  /* ⚠️ MENŠIE PÍSMO (Matej 2026-08-26: „tie 3 dropdowny… moc veľké písmo ktoré sa nevojde").
     16 px bola na natívnom selecte zámerná hodnota PRE MOBIL — pod ňou iOS pri ťuknutí
     stránku priblíži. Bledý blok začína na 1024 px, teda tu žiadny takýto telefón nie je.
     (Rozbaľovačky sú od 26. 8. tlačidlá, kde to riziko nehrozí ani na mobile — hodnota tu
     ostáva preto, že rad má byť drobnejší než hlavička, nie kvôli priblíženiu.) */
  .trp-sidebar .trp-pickdd-wrap .trp-tagdd-btn{font-size:13px;}
  /* ⚠️ PANEL SA V ĽAVOM PANELI OTVÁRA DOPRAVA (Matej 2026-08-26: „dropdown región je zle mimo
     výrezu"). Základné pravidlo má right:0, čo je správne pre filtre v pravej časti hlavičky,
     ale prvá rozbaľovačka v rade rastie od svojho pravého okraja doľava — a keďže je panel
     širší než tretina stĺpca, vytiekol von z panela na mapu. */
  .trp-sidebar .trp-georow .trp-pickdd-wrap .trp-tagdd-panel{left:0;right:auto;}

  .trp-sidebar .trp-chip-sm{border-color:${P_BORDER};color:${P_DIM};}
  .trp-sidebar .trp-chip-sm:hover{border-color:${T.cardEdge};color:${P_INK};}
  .trp-sidebar .trp-chip-sm.on{background:${T.cardEdge};border-color:${T.cardEdge};color:#FBF5E6;}

  /* ── 5. PANEL — zoznam výletov ────────────────────────────────────────────────────────
     Karta = úroveň 1 matrice ("PACK_BOX.card"). Na doske panela je karta SVETLEJŠIA než
     podklad, takže vystúpi bez toho, aby musela kričať rámom. */
  .trp-sidebar .trp-cards-sep{color:${P_DIM};}
  .trp-sidebar .trp-cards-sep::before,
  .trp-sidebar .trp-cards-sep::after{background:${P_HAIR};}
  .trp-sidebar .trp-cards-sep b{color:${P_FAINT};}
  /* ⚠️ TIEŇ NIE JE T.cardShadow (Matej 2026-08-26: „pri zozname výletov je okolo tmavý tieň
     po stranách… vidno hranice a rezy overlayu"). Matricový tieň karty je 0 14px 44px
     rgba(0,0,0,0.55) PLUS 0 0 0 4px zlatý halo ring — postavený pre kartu na ČIERNEJ
     stránke. Na papyruse je z neho čierny mrak a ring sa navyše reže o okraj skrolovacieho
     stĺpca, takže vzniká presne tá viditeľná hrana. Karta v zozname je úroveň 3 matrice
     (RIADOK), nie samostatná karta — dostáva teplý tieň bez ringu. */
  .trp-sidebar .trp-bigcard{background:${T.cardGrad};border:1.5px solid ${T.cardEdge};border-radius:16px;box-shadow:0 2px 8px rgba(122,90,42,0.16),inset 0 1px 0 rgba(255,255,255,0.45);}
  /* Označená/hovorená karta: rám sa nemení (už je zlatý) — pridáva sa halo a nadvihnutie,
     inak by hover na papyruse nebolo vidno vôbec. */
  .trp-sidebar .trp-bigcard:hover,
  .trp-sidebar .trp-bigcard.hot{background:${T.cardGrad};border-color:#8A5F1E;box-shadow:0 0 0 3px rgba(201,154,63,0.28),${T.cardShadow};transform:translateY(-1px);}
  .trp-sidebar .trp-bigcard-loc{color:${P_DIM};}
  .trp-sidebar .trp-cbadge{border-color:${P_BORDER};color:${P_DIM};}
  .trp-sidebar .trp-cbadge--via{border-color:#2F6A40;color:#245633;background:rgba(61,122,78,0.14);}
  .trp-sidebar .trp-bigcard-name{color:${P_INK};}
  .trp-sidebar .trp-bigcard-author{color:${P_DIM};}
  /* Počet hlasov v zátvorke — na tmavom je to onDarkDim, teda svetlý inkoust, a na papyruse
     by z neho ostal takmer neviditeľný škvrn. Zlatá by zas z poznámky spravila druhé číslo. */
  .trp-sidebar .comm-bigrating i{color:${P_DIM};}
  /* Zlaté číslo (#C99A3F) uniesol 20 px rating v pravom stĺpci; podpisový riadok ho má 12 px
     a na piesku z neho ostane svetlý fliačik. Tmavšia zlatá je tá istá farba, len čitateľná —
     nie nový inkoust (rovnaká hodnota nesie zvýraznený stav v celom bledom skine). */
  .trp-sidebar .comm-bigrating.mini b{color:#8A5F1E;}
  .trp-sidebar .trp-bigcard-meta2-row{color:${P_DIM};}
  .trp-sidebar .trp-bigcard-star{color:#8A5F1E;}
  .trp-sidebar button.trp-authorbtn{text-decoration-color:rgba(179,130,45,0.6);}
  /* Krúžky avatarov mali rám vo farbe tmavej stránky — na papyruse musí byť svetlý, inak
     okolo malej fotky vznikne čierny prstenec. */
  .trp-sidebar .trp-avatarcircle,
  .trp-topbar .trp-avatarcircle{border-color:#FBF5E6;}

  /* ── 6. PANEL — vnorený detail výletu ─────────────────────────────────────────────────*/
  .trp-sidebar .trp-panelnav-btn{background:${P_SOFT};border-color:${P_BORDER};color:${P_INK};}
  .trp-sidebar .trp-panelnav-btn:hover{border-color:${T.cardEdge};color:#8A5F1E;background:#FFFDF6;}
  .trp-sidebar .trp-inldet-loc{color:${P_DIM};}
  .trp-sidebar .trp-inldet-name{color:${P_INK};}
  .trp-sidebar .trp-inldet-author{color:${P_DIM};}
  .trp-sidebar .trp-inldet-meta2-row{color:${P_DIM};}
  .trp-sidebar .trp-inldet-rating b{color:#8A5F1E;}
  .trp-sidebar .trp-inldet-tag{background:${P_SOFT};border-color:${P_BORDER};color:${P_INK};}
  .trp-sidebar .trp-inldet-desc{color:${P_DIM};}
  .trp-sidebar .trp-inldet-section h4{color:${P_INK};}
  .trp-sidebar .trp-inldet-empty{color:${P_FAINT};}
  .trp-sidebar .trp-inldet-actions{border-top:1px solid ${P_HAIR};}
  .trp-sidebar .trp-inldet-btn--ghost{background:${P_SOFT};color:${P_INK};border-color:${P_BORDER};}
  .trp-sidebar .trp-inldet-btn--ghost.on{background:${P_HOT};color:#8A5F1E;border-color:${T.cardEdge};}

  /* Výškový profil je zdieľaný komponent (ElevationProfile v tripShared.tsx) a kreslí sa
     aj na TMAVEJ stránke článku, takže sa nedá prefarbiť pri zdroji. Popisky aj základňa
     tam ale sedia ako atribúty (fill/stroke), a tie CSS prebije bez !important — stačí
     zakotviť do panela. Bez toho visí nad grafom svetlé „759 m" na piesku. */
  .trp-sidebar .trp-inldet svg text{fill:${P_DIM};}
  .trp-sidebar .trp-inldet svg line{stroke:${P_HAIR};}


  /* ── 8b. PRAVÝ OVLÁDACÍ STĹPEC — VRSTVY / ZOOM / POLOHA ──────────────────────────────
     Matej 2026-08-26: „zmeň aj chipy na pravej strane sú stále čierne."
     ⚠️ RUŠÍ TO JEHO VLASTNÉ ZADANIE Z 3. 8. („bočné tlačítka na mape +- center a vrstvy…
     chcelo by to dať asi tmavé ako aj všetko ostatné"). Vtedy bol dôvod platný: papyrusový
     stack bol na TMAVEJ appke jediný svetlý prvok, teda optické ťažisko obrazovky. Dnes je
     chrome bledý, takže tmavé tlačidlá sú tá istá chyba naopak. Mobil ostáva tmavý — a preto
     ostáva tmavý aj tento stack tam. Rozbaľovací panel vrstiev sa NEMENÍ: je to plávajúci
     panel nad mapou, ktorý si tmavé sklo drží spolu s ostatnými panelmi mapy. */
  .trp-stylebtn,.trp-locatebtn,.trp-zoomgroup{background:${T.panelGrad};border:1.5px solid ${P_BORDER};box-shadow:0 4px 12px rgba(70,45,10,0.28);backdrop-filter:none;-webkit-backdrop-filter:none;}
  .trp-stylebtn:hover,.trp-stylebtn.on,.trp-locatebtn:hover{border-color:${T.cardEdge};}
  /* Ikony sú čierne kresby prevrátené na biele — v bledom stacku sa invert ruší a nahrádza
     tmavým tintom (rovnaká hodnota ako BrandIcon tint dark). */
  .trp-stylebtn img,.trp-locatebtn img{filter:brightness(0) saturate(100%) invert(20%) sepia(30%) saturate(800%) hue-rotate(2deg) brightness(75%) contrast(90%);opacity:.9;}
  .trp-zoomgroup button{color:${P_INK};}
  .trp-zoomgroup button:first-child{border-bottom:1px solid ${P_HAIR};}
  .trp-zoomgroup button:hover{background:${P_HOT};}


  /* ── 8. LIŠTA POSÚVANIA ───────────────────────────────────────────────────────────────
     Bez tohto ostane WebKit šedý pruh na papyruse — jediné miesto, kde by bola vidno
     prehliadačová sivá.
     ⚠️ Dvojička pre .trp-addhost stojí v PALE_ADD_CSS — tok pridávania je bledý na KAŽDEJ
     šírke, ľavý panel len na PC, takže to nesmú byť dva selektory v jednom pravidle. */
  .trp-sidebar .trp-cards-scroll::-webkit-scrollbar{width:8px;}
  .trp-sidebar .trp-cards-scroll::-webkit-scrollbar-thumb{background:rgba(179,130,45,0.42);border-radius:999px;}
  .trp-sidebar .trp-cards-scroll::-webkit-scrollbar-track{background:transparent;}
}
`;

/* ═══════════════════════════════════════════════════════════════════════════════════════
   BLEDÝ SKIN — MOBILNÁ VETVA (Matej 2026-08-28)

   „my to potrebujeme zmeniť na bledé nie dark tému čiže ideme vyladiť dizajn ktorý už PC má…
    na mobile nemusíme dávať ten rámikový nav ako má PC lebo by zaberal priestor namiesto toho
    to dajme bez rámika resp dajme ibe spodný okraj nie krajné"

   ⚠️ HLAVIČKA JE DOSKA BEZ RÁMU, NIE ZMENŠENÝ BLOK. Na PC je nav plávajúci blok so zlatým
   lemom dokola (goldFrameCSS); tu by ten lem zjedol šírku aj výšku na obrazovke, kde je
   oboje vzácne. Preto sa berie SAMOTNÁ DOSKA (goldPlateCSS) cez celú šírku, bez zaoblenia,
   a z rámu ostáva len SPODNÁ hrana — pás v hrúbke lemu (NAV_R.rim) s tou istou spodnou
   časťou gradientu, akú by mal rám na svojom dolnom okraji. Materiál je zhodný s PC, mizne
   len tvar.
   ⚠️ mask-image (rozplynutie do mapy) sa RUŠÍ — malo zmysel nad tmavým sklom, ale pod
   pevnou hranou by z nej spravilo vyblednutý pruh.
   ═══════════════════════════════════════════════════════════════════════════════════════ */
const PALE_MOBILE_CSS = MAP_SKIN !== 'pale' ? '' : `
@media (max-width:${PALE_PC_MIN - 1}px){
  .trp-mheader{${goldPlateCSS({ radius: 0 })}box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;mask-image:none;-webkit-mask-image:none;padding-bottom:16px;}
  .trp-mheader::after{content:'';position:absolute;left:0;right:0;bottom:0;height:${NAV_R.rim}px;background:linear-gradient(180deg,#BC9231,${'#AA8129'});box-shadow:0 1px 0 ${NAV_GOLD.edge},inset 0 1px 0 rgba(255,248,214,0.35);}

  /* ── IDENTITA ─────────────────────────────────────────────────────────────────────── */
  .trp-mheader .trp-mstats2 b{color:${P_INK};}
  .trp-mheader .trp-mstats2 i{color:${P_DIM};}
  .trp-mheader .trp-mavatar{box-shadow:0 0 0 1px rgba(255,252,240,0.9);}
  .trp-mheader .trp-mavatar--initial{background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);color:#1c160c;}
  /* Lem čísla levelu = farba dosky POD ním; na doske je to horný odtieň PANEL_SURFACE. */
  .trp-mheader .trp-avwrap{--notch-rim:#F4E7C6;}

  /* ── CHIPY: zlatá výplň, tmavá kresba — presne ako na PC doske ─────────────────────── */
  .trp-mheader .trp-stat-pill,.trp-mheader .trp-mfilterbtn{background:${NAV_GOLD.activeFill};border:1px solid ${P_BORDER};color:${P_INK};box-shadow:${NAV_PILL_SHADOW};}
  .trp-mheader .trp-stat-pill img,.trp-mheader .trp-mfilterbtn img{filter:none;opacity:1;}
  .trp-mheader .trp-stat-pill b,.trp-mheader .trp-stat-pill span{color:${P_INK};}
  .trp-mheader .trp-mfilterbtn.on{border-color:${LAPIS.edge};color:${LAPIS.deep};}

  /* ── SPRÁVY A UPOZORNENIA = OBRÁTENÁ PILULKA ───────────────────────────────────────
     Tá istá dvojica ako na PC (.trp-topbar .trp-header-notif): tam zlatá výplň a tmavá
     kresba, tu tmavá výplň a zlatá kresba. Farby si komponent nesie v INLINE štýloch,
     takže bez !important sa prebiť nedajú. */
  .trp-mheader .trp-header-notif button{background:linear-gradient(180deg,#3A2410,#1B0F05)!important;border:1px solid ${T.cardEdge}!important;color:${T.accentGold}!important;box-shadow:inset 0 1px 0 rgba(201,154,63,0.45),0 3px 8px -1px rgba(40,25,6,0.55)!important;}

  /* ── HĽADANIE — ploché papyrusové pole (úroveň 5 matrice, pilulkový variant) ────────── */
  .trp-mheader .trp-mapsearch{background:${P_FIELD};border:1px solid ${P_BORDER};box-shadow:inset 0 1px 2px rgba(96,64,16,0.14);}
  .trp-mheader .trp-mapsearch input{color:${P_INK};}
  .trp-mheader .trp-mapsearch input::placeholder{color:${P_FAINT};}
  .trp-mheader .trp-mapsearch img{filter:none;opacity:.75;}
  .trp-mheader .trp-mapsearch-x{color:${P_DIM};}

  /* ── KATEGÓRIA: VÝLETY / PODUJATIA — TRETÍ RIADOK HLAVIČKY (2026-09-01) ────────────
     Jediné dvere k podujatiam na telefóne — dôvod aj rozhodnutie sú pri JSX nižšie.
     Tvar = MALÝ SEGMENT, predloha .pev-toggle v components/pack/events/EventsPanel.tsx
     (ten istý recept: pilulkový obal, dve tlačidlá vnútri, aktívne cez pickTintCSS).
     ⚠️ NIE plný lapis. Plnú farebnú plochu má na tejto obrazovke PRIDAŤ (.trp-mfab) —
     dve plné plochy vedľa seba a ani jedna nevedie (lock 26. 8.: výber je priesvitný tint,
     plná výplň je rezervovaná pre JEDINÉ hlavné CTA na obrazovke).
     ⚠️ Riadok NEMÁ vlastné pozadie — dosku pod ním nesie hlavička (goldPlateCSS).
     ⚠️ Žiadne nové natvrdo písané číslo výšky: hlavička publikuje svoju SKUTOČNÚ výšku
     ako --trp-mheader-h (ResizeObserver, PackMap ~4180), takže ovládače mapy aj zoznam
     pod ňou sa posunú samy. */
  .trp-mheader-cats{display:inline-flex;align-self:flex-start;gap:2px;padding:3px;border-radius:999px;background:${P_SOFT};border:1px solid ${P_BORDER};}
  .trp-mheader-cats button{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:5px 12px;border-radius:999px;border:0;background:transparent;color:${P_DIM};cursor:pointer;transition:all .15s;}
  .trp-mheader-cats button.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}font-weight:600;}

  /* ── DVE TLAČIDLÁ NAD SPODNÝM NAVOM ────────────────────────────────────────────────
     Matej: „zmeň farbu aj dolným tlačítkam - pridať lapis zoznam bude gold a oprav šírky
     tie dve tlačítka musia byť na šírku ako spodnýnav blok."
     ⚠️ Šírka sa NEPÍŠE NATVRDO. Spodný nav už publikuje svoju polovicu ako
     --pack-nav-half (ResizeObserver v PackBottomNav, pôvodne pre AinubisWidget) — dvojica
     si ju berie odtiaľ, takže sa nerozíde, keď v nave pribudne alebo ubudne ikonka.
     Fallback 101px = stav pri troch položkách, aby dvojica nezmizla, keď nav nie je. */
  .trp-mactions{width:calc(var(--pack-nav-half,101px) * 2 * 1.1);}
  /* ── DVOJICA NAD SPODNÝM NAVOM — BRANDOVÉ PROPORCIE (Matej 2026-08-28, tretie kolo) ──
     „tlačítko zoznam je viditelne malé - ved ikonka sa takmer dotýka okraju… dbaj na brand
      aby to vyzeralo profi nie školácky tlačítka majú svoje pravidlá"
     Pravidlo je .btn-gold (SpiralLanding.css, LOCK): padding 14px/32px, radius 8, Cinzel 700
     uppercase, letter-spacing .12em. Vodorovná výplň je tam VIAC NEŽ DVOJNÁSOBOK zvislej —
     presne to chýbalo: pri 12px/11px sa obsah tlačil k okrajom a tlačidlo pôsobilo stiesnene.
     Šírku drží nav, takže dýchanie sa nedá kúpiť výplňou; kupuje sa ZMENŠENÍM OBSAHU —
     ikonka 14 px a písmo 11.5 px nechajú po stranách ~18 px, teda brandový pomer.
     ⚠️ OBE TLAČIDLÁ MAJÚ RADIUS 8, nie jedno pilulku. .btn-gold je hranaté a dve tlačidlá
     rovnakej šírky vedľa seba s rôznym polomerom čítajú ako dva nesúvisiace prvky. */
  .trp-mtoggle,.trp-mfab{flex:1 1 0;min-width:0;padding:14px 12px;gap:7px;font-size:11.5px;letter-spacing:.12em;border-radius:8px;}
  .trp-mtoggle img,.trp-mfab img{width:14px;height:14px;}

  /* ── PRIDAŤ = PLNÝ LAPIS, OBSAH BLEDÝ (Matej 2026-08-28) ────────────────────────────
     „má byť plný lapis a + a text bledý"
     ⚠️ Predošlé kolo prefarbilo CELÉ TLAČIDLO na bledé — to bolo zlé čítanie vety
     „musí byť bledé lebo na lapise zaniká": zanikal OBSAH, nie tlačidlo. Farba patrila
     inkoustu, nie ploche. Rovnaká zámena ako pri lapisovom leme chipu 27. 8.
     ⚠️ Inkoust je PAPYRUSOVÝ, nie zlatý — navGoldSkin má pri LAPIS.ink poznámku, že zlaté
     písmo drží egyptskú dvojicu, ale Matej si tu vypýtal bledý a na tlačidle nad mapou je
     čitateľnejší. Platí to pre TENTO prvok, LAPIS.ink inde ostáva. */
  .trp-mfab{background:${LAPIS.grad};color:#F5F0E4;border:1px solid ${LAPIS.edge};box-shadow:${LAPIS_BTN_SHADOW};}
  .trp-mfab:hover{background:${LAPIS.gradHover};border-color:${LAPIS.edge};}
  .trp-mfab img{filter:brightness(0) invert(1);opacity:.92;}
  .trp-mtoggle{background:${NAV_GOLD.activeFill};color:${P_INK};border:1px solid ${P_BORDER};box-shadow:${NAV_PILL_SHADOW};}
  .trp-mtoggle img{filter:none;opacity:.85;}

  /* ── OVLÁDAČE MAPY VPRAVO (vrstvy · zoom · poloha) ─────────────────────────────────────
     Matej: „treba prerobiť aj panely na pravej strane (vrstvy +- …) a posunúť nižšie lebo su
     v dotyku s hornym headrom."
     ⚠️ Odsadenie je odvodené od SKUTOČNEJ výšky hlavičky (--trp-mheader-h, ResizeObserver
     v PackMap), nie z čísla. Natvrdo zapísaných 118 px bolo presne to, čo sa o hlavičku oprelo,
     keď jej pribudol riadok. Fallback 159px = stav pri TROCH riadkoch (2026-09-01, prepínač
     kategórií); do vtedy tu stálo 124px = stav pri dvoch. Fallback zostarne pri každom
     ďalšom riadku — meraná hodnota z premennej nie.
     ⚠️ Plná výplň, nie priesvitná — ovládače stoja nad mapou. */
  .trp-ctlstack{top:calc(var(--trp-mheader-h,159px) + 14px);}
  .trp-zoomgroup,.trp-locatebtn,.trp-layersdd-panel{background:${NAV_GOLD.surface};backdrop-filter:none;-webkit-backdrop-filter:none;border:1px solid ${P_BORDER};box-shadow:0 4px 12px -3px rgba(20,14,4,0.5);}
  .trp-zoomgroup button{color:${P_INK};}
  .trp-zoomgroup button:first-child{border-bottom:1px solid ${P_HAIR};}
  .trp-zoomgroup button:hover{background:rgba(201,154,63,0.22);}
  .trp-locatebtn img{filter:none;opacity:.85;}
  .trp-locatebtn:hover{border-color:${NAV_GOLD.edge};}
  .trp-layersdd-row{color:${P_INK};}
  .trp-layersdd-hint{color:${P_DIM};}
  .trp-layersdd-group + .trp-layersdd-group{border-top:1px solid ${P_HAIR};}
  /* Eyebrow skupín (BASE MAP / OVERLAYS) je v tmavej vetve svetlý — na papyruse zanikal.
     Farba je tá istá, akú mu dáva PC vetva (T.cardEdge), nie nový odtieň. */
  .trp-layersdd-panel .trp-tagdd-eyebrow{color:${T.cardEdge};}
  /* Trigger vrstiev (.trp-stylebtn) ide s nimi — stĺpec musí byť jeden materiál.
     ⚠️ Matej 2026-08-03 si tieto tlačidlá vypýtal TMAVÉ: „bočné tlačítka na mape +- center
     a vrstvy… chcelo by to dať asi tmavé ako aj všetko ostatné" — s odôvodnením, že
     papyrusový stack bol na tmavej appke JEDINÝ svetlý prvok, teda optické ťažisko obrazovky.
     Ten dôvod dnes zaniká spolu s tmavou mobilnou vetvou: na bledej hlavičke a bledom nave je
     ťažiskom naopak tmavý krúžok. Lock nepadol svojvoľne, padol s podmienkou, na ktorej stál. */
  .trp-stylebtn{background:${NAV_GOLD.surface};backdrop-filter:none;-webkit-backdrop-filter:none;border:1px solid ${P_BORDER};box-shadow:0 4px 12px -3px rgba(20,14,4,0.5);}
  .trp-stylebtn:hover,.trp-stylebtn.on{border-color:${NAV_GOLD.edge};}
  .trp-stylebtn img{filter:none;opacity:.85;}

  /* ── FILTER SHEET — bledý (Matej 2026-08-28: „po kliknutí sa zobrazí panel ale je Dark") ──
     Doska je tá istá ako hlavička; mení sa len tvar (zaoblený vrch) a smer hrany — tu je
     zlatý pás HORE, lebo panel prichádza zdola. */
  .trp-msheet{${goldPlateCSS({ radius: 0 })}border-radius:20px 20px 0 0;backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:0 -18px 50px rgba(0,0,0,0.5);border-top:${NAV_R.rim}px solid transparent;background-clip:padding-box;}
  .trp-msheet::before{content:'';position:absolute;left:0;right:0;top:0;height:${NAV_R.rim}px;border-radius:20px 20px 0 0;background:linear-gradient(180deg,#FCF0C2,#D8B052);box-shadow:0 1px 0 ${NAV_GOLD.edge};}
  .trp-msheet-grab{background:rgba(42,22,8,0.28);}
  .trp-msheet-title{color:${P_INK};}
  .trp-msheet-x{background:${P_FIELD};border:1px solid ${P_BORDER};color:${P_INK};}
  .trp-msheet-label{color:${P_DIM};}
  .trp-msheet-chip{background:${P_SOFT};border:1px solid ${P_BORDER};color:${P_INK};}

  /* ── VLASTNÁ ROZBAĽOVAČKA NÁROČNOSTI V SHEETE ────────────────────────────────────────
     Náročnosť nie je natívny <select>, lebo musí niesť CSS značku (DiffMark). Trigger preto
     dostáva vzhľad susedných polí, nie tmavého skla z globálneho .trp-tagdd-btn — inak by
     jedno pole v riadku vyzeralo ako z inej stránky. */
  /* ⚠️ flex:0 0 auto NIE JE KOZMETIKA. Globálne má obal flex:1 1 140px — postavené pre
     VODOROVNÝ riadok filtrov na PC, kde je 140px flex-basis ŠÍRKA. Tu je rodič
     (.trp-msheet-field) stĺpcový, takže tá istá deklarácia znamená 140px VÝŠKY: pole
     náročnosti narástlo na 160 px a text v ňom plával v strede prázdnej plochy.
     Rovnaká pasca ako s kotvením panela nižšie — prenesený komponent si nesie geometriu
     z pôvodného miesta a v inom smere osi znamená to isté číslo niečo iné. */
  .trp-msheet-field--pick .trp-pickdd-wrap{display:flex;width:100%;flex:0 0 auto;min-width:0;}
  .trp-msheet .trp-tagdd-btn{flex:1 1 auto;min-width:0;background:${P_FIELD};backdrop-filter:none;-webkit-backdrop-filter:none;border:1px solid ${P_BORDER};border-radius:10px;padding:11px 12px;color:${P_INK};font-size:13px;box-shadow:none;}
  .trp-msheet .trp-tagdd-btn.on{border-color:${LAPIS.edge};color:${P_INK};}
  /* Šípka: susedné polia sú natívne selecty so systémovou (tmavou, výraznou) šípkou.
     Textové ▾ v pôvodnej svetlej dim farbe pri nich vyzeralo ako neaktívne pole —
     rozdiel spôsobila výmena ovládača, nie zadanie, tak sa dorovnáva tu. */
  .trp-msheet .trp-tagdd-chevron{color:${P_INK};font-size:13px;opacity:.75;}
  .trp-msheet .trp-pickdd-cur{display:inline-flex;align-items:center;gap:8px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  /* ⚠️ PANEL SA KOTVÍ VĽAVO, NIE VPRAVO. Globálne pravidlo má right:0 + min-width:210px,
     čo je postavené pre riadok filtrov na PC. V sheete stojí trigger v ĽAVOM stĺpci páru
     (šírka ~166 px), takže panel širší než trigger vytiekol o 20 px MIMO obrazovky.
     Precedens je .trp-sidebar .trp-georow vyššie — tá istá oprava, iný povrch. */
  /* PANEL JE BLEDSI NEZ DOSKA, NIE Z NEJ (Matej 2026-08-28: urob ich este bledsie,
     systemove blede nie tmave). Berie P_FIELD - tu istu plochu papyrusovu vypln, aku ma
     pole pod nim (uroven 5 matrice). Je to zamerne najsvetlejsi povrch v paneli: zoznam
     lezi NAD doskou a musi sa od nej odlepit, inak posobi ako jej pokracovanie. */
  .trp-msheet .trp-tagdd-panel{left:0;right:auto;min-width:100%;max-width:calc(100vw - 36px);background:${P_FIELD};backdrop-filter:none;-webkit-backdrop-filter:none;border:1px solid ${P_BORDER};box-shadow:0 14px 34px rgba(20,14,4,0.42);}
  /* Eyebrow v paneli je na PC jediné, co povie, coho sa zoznam tyka. V sheete stoji ten
     isty text uz nad polom (.trp-msheet-label), takze by sa cital dvakrat pod sebou. */
  .trp-msheet .trp-tagdd-eyebrow{display:none;}
  .trp-msheet .trp-tagdd-row{color:${P_INK};}
  .trp-msheet .trp-tagdd-row.on{color:#8A5F1E;}
  .trp-msheet .trp-tagdd-row:hover{background:${P_HOT};}
  /* ⚠️ ODYSEA MÁ PLNÝ BIELY TROJUHOLNÍK (Matej 2026-08-28: „biely trojuholnik je plný nie
     prazdny"). Biela je postavená pre TMAVÚ mapu — na papyruse z nej nezostane nič a štvrtá
     položka by vyzerala ako jediná bez značky. Prefarbuje sa na tmavý inkoust, ktorý drží tú
     istú eskaláciu (zelená → žltá → červená → najtmavšia); tvar ostáva PLNÝ, nemení sa na obrys.
     To isté robí PC vetva o pár stoviek riadkov vyššie — tá istá oprava, dva povrchy. */
  .trp-msheet .trp-diffmark--triangle.trp-diffmark--odyssey{border-bottom-color:${P_INK};}
  /* Označený chip = priesvitný lapisový tint. TU tint PATRÍ — pod ním je doska panela,
     nie mapa (lock 2026-08-26: „výbery chipov budú priesvitné, nie plné farby"). */
  .trp-msheet-chip.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}font-weight:600;}
  .trp-msheet-foot{background:${NAV_GOLD.surface};border-top:1px solid ${P_HAIR};}
  .trp-msheet-clear{border:1px solid ${P_BORDER};color:${P_DIM};}
  /* SHOW N je JEDINÉ hlavné CTA panela — jediná plná farebná plocha na doske (lock 26. 8.). */
  .trp-msheet-show{background:${LAPIS.grad};border:1px solid ${LAPIS.edge};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};}

  /* ── ZOZNAM VÝLETOV — BLEDÝ (Matej 2026-08-28) ────────────────────────────────────────
     „na mobil lebo mobil je ešte čierny — ZOZNAM TRIPOV… kopíruj PC."
     Pravidlá sú prepis PC vetvy (.trp-sidebar .trp-bigcard a spol.) s jediným rozdielom:
     kotva je .trp-mlist namiesto .trp-sidebar. Hodnoty sa NEODVODZUJÚ nanovo — karta na
     papyruse má svoju podobu vyladenú v PC vetve a druhá sada tých istých čísel by sa rozišla
     pri prvej úprave.

     PODKLAD = TÁ ISTÁ DOSKA AKO HLAVIČKA. Zoznam je celoobrazovkový povrch priamo pod ňou,
     takže iný materiál by z jednej obrazovky spravil dva zlepené kusy. Rám nedostáva (Matejov
     lock z dneška: na mobile bez rámika, ten len ukrajuje šírku), preto box-shadow:none —
     goldPlateCSS inak kreslí zapustenú dosku so zlatým prstencom po obvode, čo by na celej
     obrazovke bola linka okolo výrezu.
     ⚠️ Pozadie sa skrolovaním NEHÝBE (background-attachment:scroll na skrolovacom boxe
     maľuje na jeho border-box), takže zrno ani mramorovanie nepocestuje s kartami. */
  .trp-mlist{${goldPlateCSS({ radius: 0 })}box-shadow:none;}

  .trp-mlist .trp-cards-sep{color:${P_DIM};}
  .trp-mlist .trp-cards-sep::before,
  .trp-mlist .trp-cards-sep::after{background:${P_HAIR};}
  .trp-mlist .trp-cards-sep b{color:${P_FAINT};}

  /* Karta = úroveň 1 matrice, teplý tieň BEZ zlatého halo ringu — ring sa reže o okraj
     skrolovacieho stĺpca a vyrába viditeľnú hranu (zistené na PC 26. 8., platí aj tu). */
  .trp-mlist .trp-bigcard{background:${T.cardGrad};border:1.5px solid ${T.cardEdge};border-radius:16px;box-shadow:0 2px 8px rgba(122,90,42,0.16),inset 0 1px 0 rgba(255,255,255,0.45);}
  /* ⚠️ BEZ transform:translateY(-1px), ktoré má PC. Na dotyku :hover po ťuknutí ZOSTANE
     visieť, takže by karta ostala nadvihnutá aj po odchode prsta — nadvihnutie je odpoveď na
     myš, nie na dotyk. Halo ostáva: nesie aj stav .hot. */
  .trp-mlist .trp-bigcard:hover,
  .trp-mlist .trp-bigcard.hot{background:${T.cardGrad};border-color:#8A5F1E;box-shadow:0 0 0 3px rgba(201,154,63,0.28),${T.cardShadow};}

  .trp-mlist .trp-bigcard-loc{color:${P_DIM};}
  .trp-mlist .trp-cbadge{border-color:${P_BORDER};color:${P_DIM};}
  .trp-mlist .trp-cbadge--via{border-color:#2F6A40;color:#245633;background:rgba(61,122,78,0.14);}
  .trp-mlist .trp-bigcard-name{color:${P_INK};}
  .trp-mlist .trp-bigcard-author{color:${P_DIM};}
  .trp-mlist .comm-bigrating i{color:${P_DIM};}
  .trp-mlist .comm-bigrating.mini b{color:#8A5F1E;}
  .trp-mlist .trp-bigcard-meta2-row{color:${P_DIM};}
  .trp-mlist .trp-bigcard-star{color:#8A5F1E;}
  .trp-mlist button.trp-authorbtn{text-decoration-color:rgba(179,130,45,0.6);}
  .trp-mlist .trp-avatarcircle{border-color:#FBF5E6;}
  /* Riadok konceptu („chýba: …") je JEDINÝ text karty POD fotkou, ktorý PC vetva neprefarbila —
     tam ho nikto nevidel, lebo koncept vzniká na mobile. Svetlý inkoust na papyruse je
     neviditeľný, tak dostáva ten istý dim ako podpis. ⚠️ PC má tú istú dieru. */
  .trp-mlist .trp-draftmiss{color:${P_DIM};}
}
`;


/* ═══════════════════════════════════════════════════════════════════════════════════════
   BLEDÝ SKIN — TOK PRIDÁVANIA, BEZ OHĽADU NA ŠÍRKU (Matej 2026-08-28)

   „po kliknutí na pridať sa teraz zobrazí tmavá verzia — potrebujeme to prerobiť na novú
    verziu = natiahni dizajn aký je na PC iba ho prispôsob viewportu"

   ⚠️ PREČO SAMOSTATNÝ BLOK A NIE ĎALŠIA KÓPIA V PALE_MOBILE_CSS: farby toku pridávania sú
   na PC aj na mobile TIE ISTÉ — líši sa iba tvar a rozmery. Druhá sada tých istých rgba
   čísel by sa rozišla pri prvej úprave a mobil by ostal o kolo pozadu, presne ako bol do
   dnes. Preto sú tu pravidlá bez media query a PC-only ostáva len to, čo je naozaj o
   VEĽKOSTI (rám plávajúceho panela, šírka popupu, výplne).

   ⚠️ Selektory sú zakotvené v .trp-addhost / .trp-root .att-entry-*, teda v prvkoch,
   ktoré existujú výhradne v toku pridávania — nemajú ako presiaknuť do mobilnej hlavičky
   ani do zoznamu, čo je jediný dôvod, prečo PALE_CSS vyššie zostáva zamknuté na PC.
   ═══════════════════════════════════════════════════════════════════════════════════════ */
const PALE_ADD_CSS = MAP_SKIN !== 'pale' ? '' : `
/* ── HOSTITEĽ FORMULÁRA ────────────────────────────────────────────────────────────────
   PC = plávajúci stĺpec so zlatým lemom dokola (SLAB, ako .trp-sidebar).
   MOBIL = CELÁ OBRAZOVKA, teda len SAMOTNÁ DOSKA bez lemu a bez zaoblenia — to isté
   rozhodnutie, aké 28. 8. dostala mobilná hlavička („na mobile nemusíme dávať ten rámikový
   nav ako má PC lebo by zaberal priestor"). Lem okolo celej obrazovky nie je rám bloku,
   je to len zjedený riadok na oboch stranách. */
@media (min-width:${PALE_PC_MIN}px){
  .trp-addhost{${goldFrameCSS({ radius: SLAB.radius, rim: SLAB.rim })}backdrop-filter:none;-webkit-backdrop-filter:none;}
}
@media (max-width:${PALE_PC_MIN - 1}px){
  .trp-addhost{${goldPlateCSS({ radius: 0 })}box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;}
}

  /* ── 7. FORMULÁR PRIDÁVANIA (add trip) ────────────────────────────────────────────────
     Písacie povrchy ostávajú PLOCHÝ papyrus (".pf-field--flat"), nie gradient — lock hovorí,
     že čierna aj gradient sú na čítanie, vypĺňa sa do plochého poľa. */
  .trp-addhost .trp-addsetup-title{color:${P_INK};}
  .trp-addhost .trp-addsetup-field label{color:${P_DIM};}
  .trp-addhost .trp-addsetup-input{background:${P_FIELD};border:1px solid ${P_BORDER};color:${P_INK};}
  .trp-addhost .trp-addsetup-input::placeholder{color:${P_DIM};opacity:.7;}
  .trp-addhost .trp-addsetup-input:focus{border-color:${T.cardEdge};}
  .trp-addhost .trp-multitoggle{color:#8A5F1E;}
  .trp-addhost .trp-addsetup-file{color:${P_DIM};}
  .trp-addhost .trp-addsetup-stars button{color:rgba(42,22,8,0.22);}
  .trp-addhost .trp-addsetup-stars button.on{color:#8A5F1E;}
  .trp-addhost .trp-norating{color:${P_FAINT};}
  .trp-addhost .trp-addsetup-livekm,
  .trp-addhost .trp-addsetup-profilenote{background:rgba(201,154,63,0.14);border-color:${P_BORDER};color:#7A4E12;}
  .trp-addhost .trp-planpin{border-color:${P_BORDER};background:rgba(201,154,63,0.10);color:${P_DIM};}
  .trp-addhost .trp-planpin.set{color:#8A5F1E;}
  .trp-addhost .trp-plannedpill{background:rgba(255,251,240,0.75);border-color:${P_BORDER};color:#7A4E12;}
  .trp-addhost .trp-draftpill{background:rgba(255,251,240,0.6);border-color:${P_HAIR};color:${P_DIM};}
  .trp-addhost .trp-draftmiss{color:${P_DIM};}

  /* ── 9. VSTUPNÝ POPUP PRIDÁVANIA (VÝLET / PODUJATIE / ODKAZ) ──────────────────────────
     Prvý krok toku pridávania. Komponent "AddTripEntry" má v hlavičke napísané, že žije na
     tmavom povrchu Portalu a preto berie pk-glass — na PC to odteraz neplatí, tak sa prebíja
     tu, a nie prepisom komponentu: ten istý popup obsluhuje aj mobil, ktorý ostáva tmavý.
     Panel = úroveň 4 matrice (PANEL), dlaždice = úroveň 2 (PODBLOK).
     ⚠️ PREDPONA .trp-root NIE JE OZDOBA. "AddTripEntry" si vkladá vlastný <style> a v DOM stojí
     ZA týmto blokom, takže pri rovnakej špecificite (0-1-0) vyhráva ON — prvý pokus prefarbil
     len panel (mal .pk-glass navyše) a dlaždice ostali tmavé. Popup sa renderuje vnútri
     .trp-root, takže predpona je zadarmo a spor rozhodne. */
  .trp-root .att-entry-backdrop{background:rgba(24,14,4,0.55);}
  /* TABUĽA S OKRAJMI, nie plochý panel (Matej 2026-08-26: „zväčši rámik kde sú teraz 3
     možnosti pridania, rámik bude tabuľa s okrajmi, vo vnútri 3 možnosti").
     Rám je goldFrameCSS — ten istý zdroj ako ľavý panel aj spodný nav, takže popup
     prestáva byť samostatný materiál. Predtým tu bol panelGrad + 1.5px linka: to je
     matrica úroveň 4 (PANEL), ktorá je správna pre plávajúci panel NAD stránkou, ale
     tento popup je prvá obrazovka toku a má vážiť ako doska, nie ako lístok.
     ⚠️ border-radius a border nesie goldFrameCSS — nepridávaj ich znova, prepísal
     by si transparentný rám, na ktorom celý dvojpozaďový trik stojí. */
  .trp-root .att-entry-panel.pk-glass{${goldFrameCSS()}backdrop-filter:none;-webkit-backdrop-filter:none;}
  /* Dlaždice dostali väčší vnútorný priestor spolu s tabuľou — pri 760 px šírky by pôvodné
     odsadenie nechalo emoji plávať v prázdne.
     ⚠️ ROZMERY SÚ PC-ONLY, farby nie. Na telefóne je 34 px výplne a 760 px šírky nezmysel —
     mobilná dvojička stojí v bloku „PRISPÔSOBENIE VIEWPORTU" na konci súboru. */
  @media (min-width:${PALE_PC_MIN}px){
    .trp-root .att-entry-panel.pk-glass{max-width:760px;padding:34px;}
    .trp-root .att-entry-blocks{gap:16px;}
    .trp-root .att-entry-block{padding:28px 22px;}
  }
  .trp-root .att-entry-back{color:${P_DIM};}
  .trp-root .att-entry-back:hover{color:#8A5F1E;}
  .trp-root .att-entry-lead{color:${P_DIM};}
  .trp-root .att-entry-block{background:${T.cardGrad};border:1px solid ${T.cardEdge};box-shadow:0 1px 3px rgba(122,90,42,0.10),inset 0 1px 0 rgba(255,255,255,0.40);}
  .trp-root .att-entry-block:hover,.trp-root .att-entry-block:focus-visible{background:${T.cardGrad};border-color:#8A5F1E;box-shadow:0 0 0 3px rgba(201,154,63,0.28),0 6px 16px rgba(122,90,42,0.22);}
  .trp-root .att-entry-block-disabled:hover,.trp-root .att-entry-block-disabled:focus-visible{border-color:${T.cardEdge};box-shadow:none;}
  .trp-root .att-entry-title{color:${P_INK};}
  .trp-root .att-entry-text{color:${P_DIM};}
  .trp-root .att-entry-soon{color:${P_FAINT};border-color:${P_HAIR};}
  /* Chipy „čo sem patrí" — na papyruse. Sú POPIS, nie výber, takže nedostávajú farebný tint
     z pickTintCSS (ten je vyhradený označeniu) ani lapis (ten nesie odmenu vyššie). Plocha
     je preto len o odtieň svetlejšia než dlaždica a rám je vlasová linka. */
  .trp-root .att-entry-chip{background:rgba(255,252,244,0.55);border-color:${P_HAIR};color:${P_DIM};}
  .trp-root .att-entry-block:hover .att-entry-chip,.trp-root .att-entry-block:focus-visible .att-entry-chip{border-color:rgba(179,130,45,0.55);color:${P_INK};}
  /* BODY V LAPISOVEJ PILULKE (Matej 2026-08-26: „body budú v modrom pilse").
     Podľa pravidla lapisu je odmena „moje" — patrí k voľbe, nie ku konštrukcii. Zlatá
     pilulka na zlatej dlaždici v zlatom ráme bola tretia zlatá vrstva na sebe a číslo
     v nej zaniklo. Písmo je zlaté, nie biele — to drží lapis v brande. */
  .trp-root .att-entry-pts{background:${LAPIS.grad};border-color:${LAPIS.deep};color:${LAPIS.ink};}

  /* ── 7b. VÝBER SPOLOČNÍKOV V TOKU PRIDÁVANIA ──────────────────────────────────────────
     Pilulky psov a „Pridaj ďalších" prichádzajú z COMMUNITY_CSS (packCommunityUI.tsx), ktoré
     obsluhuje aj tmavé komunitné povrchy mimo mapy — prepis pri zdroji by ich zhasol. Preto
     sa prebíja LEN v hostiteľovi formulára a len na PC.
     Bez tohto bloku je krok 5 poloprázdny: popisok „TVOJA SVORKA" aj celý rámček „Pridaj
     ďalších" boli svetlý inkoust na piesku, teda neviditeľné — nie zle čitateľné, ale
     neviditeľné. */
  .trp-addhost .comm-comp-grouplabel{color:${P_DIM};}
  .trp-addhost .comm-comp-dog{background:${P_FIELD};border-color:${P_BORDER};}
  .trp-addhost .comm-comp-dog:hover{border-color:${T.cardEdge};}
  .trp-addhost .comm-comp-dog span{color:${P_INK};}
  .trp-addhost .comm-comp-dog .plus{color:#8A5F1E;}
  .trp-addhost .comm-comp-chip{background:rgba(201,154,63,0.18);border-color:${P_BORDER};}
  .trp-addhost .comm-comp-chip b{color:${P_INK};}
  .trp-addhost .comm-comp-chip button{color:${P_DIM};}
  .trp-addhost .comm-comp-chip button:hover{color:#8A5F1E;}
  /* ── „PRIDAJ ĎALŠÍCH" MUSÍ BYŤ VIDNO (Matej 2026-08-26) ──────────────────────────────
     „pri pridaj ďalší musí byť krajší text area lebo je nevýrazný, priesvitný — musí byť
      viditeľný bledý."
     Bola to čiarkovaná polopriehľadná plocha (0.5 alfa) na papyruse, teda skoro nič. Odteraz
     je to plochý papyrusový povrch matrice (úroveň 5, pf-field--flat: #FBF5E6, r8, rám
     rgba(179,130,45,0.55)) — to isté, čo nesie každé iné pole formulára. Rám je plný, nie
     čiarkovaný: čiara „sem sa dá dopísať" bola ďalší spôsob, ako povedať to isté, čo hovorí
     plusko, a pritom robila prvok bledším než jeho okolie.
     To isté pole dostane aj samotné písanie mien (comm-input) — po otvorení je to ten
     istý povrch, len s kurzorom. */
  .trp-addhost .comm-comp-openothers{background:#FBF5E6;border:1px solid ${P_BORDER};border-radius:8px;color:${P_INK};}
  .trp-addhost .comm-comp-openothers:hover{border-color:${T.cardEdge};color:${P_INK};background:#FFFBF0;}
  .trp-addhost .comm-comp-searchrow .comm-input{background:#FBF5E6;border:1px solid ${P_BORDER};border-radius:8px;color:${P_INK};}
  .trp-addhost .comm-comp-searchrow .comm-input::placeholder{color:${P_DIM};opacity:.75;}
  .trp-addhost .comm-comp-searchrow .comm-input:focus{outline:none;border-color:${T.cardEdge};}
  .trp-addhost .comm-comp-openplus{background:rgba(201,154,63,0.22);color:#8A5F1E;}
  .trp-addhost .comm-comp-addbtn{background:rgba(201,154,63,0.18);border-color:${P_BORDER};color:${P_INK};}
  .trp-addhost .comm-comp-addbtn:not(:disabled):hover{border-color:${T.cardEdge};}
  .trp-addhost .comm-comp-sug{background:${T.panelGrad};border:1.5px solid ${T.cardEdge};box-shadow:${T.panelShadow};backdrop-filter:none;-webkit-backdrop-filter:none;}
  .trp-addhost .comm-comp-sugitem{border-bottom:1px solid ${P_HAIR};color:${P_INK};}

  /* ── LIŠTA POSÚVANIA ────────────────────────────────────────────────────────────────
     Dvojička pravidla zo sekcie 8 v PALE_CSS; tam ostal ľavý panel, sem patrí formulár. */
  .trp-addhost .trp-addsetup-body::-webkit-scrollbar{width:8px;}
  .trp-addhost .trp-addsetup-body::-webkit-scrollbar-thumb{background:rgba(179,130,45,0.42);border-radius:999px;}
  .trp-addhost .trp-addsetup-body::-webkit-scrollbar-track{background:transparent;}

/* ══ PRISPÔSOBENIE VIEWPORTU — VSTUPNÝ POPUP NA TELEFÓNE (Matej 2026-08-28) ═════════════
   „natiahni dizajn aký je na PC iba ho prispôsob viewportu… tam kde je veľa chipov daj ich
    do jedného riadku kde sa ininity pohybuju po horizontálnej osi… každý blok bude taký istý"

   Mení sa VÝHRADNE geometria — materiál, farby aj hierarchia sú tie isté, čo na PC (o tie
   sa stará blok vyššie, ktorý media query nemá).
   ═════════════════════════════════════════════════════════════════════════════════════ */
@media (max-width:${PALE_PC_MIN - 1}px){
  /* ── CELÁ OBRAZOVKA, NIE BLOK NAD MAPOU (Matej 2026-08-28, druhé kolo) ────────────────
     „možno by bolo lepšie na mobile to dať bez toho bloku resp bez okrajov = celá stránka
      bude bledá ako keby menu na celú obrazovku a na nej 3 bloky, nebude vidno mapu vzadu"
     ⚠️ Doska sa maľuje na PODKLAD, nie na panel. Podklad je jediný prvok, ktorý naozaj drží
     celé okno; panel by pri krátkom obsahu nechal po stranách presvitať mapu a pri dlhom by
     sa jeho doska rozišla s tou pod ňou. Panel je preto priehľadný a nesie už len výplň.
     ⚠️ Zlatý rám (goldFrameCSS z bloku vyššie) sa RUŠÍ — lem okolo celej obrazovky nie je rám
     bloku, len zjedený riadok na oboch stranách. To isté rozhodnutie ako pri mobilnej
     hlavičke, hostiteľovi formulára a doku.
     ⚠️ Východ von preberá šípka .att-entry-x (viď AddTripEntry.tsx) — klik vedľa tu už nemá kam. */
  .trp-root .att-entry-backdrop{padding:0;align-items:stretch;justify-content:stretch;${goldPlateCSS({ radius: 0 })}box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;}
  .trp-root .att-entry-panel.pk-glass{background:none;border:0;border-radius:0;box-shadow:none;max-width:none;width:100%;min-height:100%;display:flex;flex-direction:column;justify-content:safe center;
    padding:calc(env(safe-area-inset-top,0px) + 62px) 24px calc(env(safe-area-inset-bottom,0px) + 26px);
    overflow-y:auto;overscroll-behavior:contain;}
  /* Návrat vľavo hore — tvar aj poloha ako .atl-log-back o obrazovku ďalej, aby sa cesta späť
     nesťahovala z rohu do rohu. Preto je aj horná výplň panela 62 px: pod šípku, nie pod ňu. */
  /* ⚠️ ŠÍPKA JE V STREDE HORE, NIE VĽAVO (Matej 2026-08-28: „pri add daj tú šípku dozadu
     do stredu tak ako bude aj pri aktivitách"). Výber aktivity ju tam má od 23. 8. — dve
     obrazovky toku za sebou, na ktorých by návrat skákal z rohu do stredu, sú dva rôzne
     jazyky pre tú istú cestu von. Rohová poloha (.atl-log-back v úzkej hlavičke) ostáva
     krokom, kde nadpis drží riadok; tu je riadok prázdny a stred ho vyplní. */
  .trp-root .att-entry-x{display:flex;align-items:center;justify-content:center;position:absolute;
    top:calc(env(safe-area-inset-top,0px) + 14px);left:50%;transform:translateX(-50%);width:34px;height:34px;border-radius:50%;
    background:${P_SOFT};border:1px solid ${P_BORDER};color:${P_INK};font-size:16px;line-height:1;cursor:pointer;}
  /* Návrat z druhej úrovne stojí na TOM ISTOM mieste ako šípka — nikdy nie sú na obrazovke
     obidva (šípka je len na kroku „čo pridávam"), takže odsadenie vedľa nej by bolo odsadenie
     vedľa prázdna. */
  .trp-root .att-entry-back{top:calc(env(safe-area-inset-top,0px) + 22px);left:18px;color:${P_DIM};}
  /* ── ROZŤAHOVANIE, NIE CENTROVANIE ───────────────────────────────────────────────────
     Tri bloky s pevnou výškou nechali nad sebou ~150 px prázdna a dole sa dotýkali hrany —
     stránka vyzerala, že sa nedoskrolovala. Voľnú výšku si preto rozdelia rovným dielom,
     presne ako zoznam aktivít o obrazovku ďalej (.atl-tiles v AddTripLog, Matej 27. 8.:
     „vyzerá to prázdne").
     ⚠️ flex:1 0 auto, NIE 1 1 0 — základ je obsah a bloky smú len RÁSŤ. Pri zmrašťovaní by
     sa na nízkom telefóne text v nich orezal namiesto toho, aby sa stránka dala posunúť. */
  /* ⚠️ VZDUCH JE MEDZI TLAČIDLAMI, NIE V NICH (Matej 2026-08-28: „prevzdušni hlavne ten ADD
     tie tri tlačítka"). Rozostup aj okraje stránky sú širšie, výplň vnútri bloku ostáva —
     nafúknuté bloky nalepené na seba pôsobia ťažko, tie isté bloky s medzerou pôsobia ako
     tlačidlá. To isté rozhodnutie ako pri výbere aktivity o obrazovku ďalej. */
  /* ⚠️ ZMENA OPROTI RÁNU 28. 8. — BLOKY SA UŽ NENAŤAHUJÚ (Matej: „v budúcnosti tu ešte
     niečo pribudne takže musíme to zmenšiť celé aby boli okraje vzdušné nie tesne pri
     okraji… zmenši len bloky").
     Ráno si tri bloky delili voľnú výšku rovným dielom, lebo inak nad nimi ostalo ~150 px
     prázdna. Lenže tým sa vzduch presunul DOVNÚTRA blokov a von zmizol: rad siahal od hrany
     po hranu a na štvrtú dlaždicu (chystá sa) by nezostalo miesto. Odteraz má rad výšku
     svojho obsahu a voľná výška ide na okraje — panel ho centruje ("justify-content:safe
     center" vyššie; slovo safe drží vrch dosiahnuteľný, keď sa obsah na nízky telefón
     nezmestí). */
  .trp-root .att-entry-blocks{gap:14px;flex:0 0 auto;}
  /* ⚠️ :first-child MUSÍ BYŤ VYMENOVANÝ. Na PC má prvá dlaždica flex:1 1 100% (zaberá celý
     prvý riadok) a v STĹPCI znamená tá istá deklarácia 100 % VÝŠKY — VÝLET tak vyrástol na
     dvojnásobok susedov. Špecificita je zhodná, takže by rozhodlo poradie v DOM a to má
     ENTRY_CSS komponentu, ktorý sa vkladá neskôr. Rovnaká pasca ako pri .trp-msheet-field. */
  .trp-root .att-entry-blocks-kind .att-entry-block,
  .trp-root .att-entry-blocks-kind .att-entry-block:first-child{flex:1 0 auto;}
  /* ⚠️ ZALOMENIE SA NA TELEFÓNE RUŠÍ, INAK BLOK URČUJE ŠÍRKU POPUPU. Stĺpec s flex-wrap
     dostane šírku riadku podľa NAJŠIRŠIEHO obsahu (max-content), a odkedy chipy nezalamujú,
     je ich rad široký cez pol metra — dlaždice tak vytiekli mimo dosku a nadpisy sa odsunuli
     doprava. Bez wrapu je stĺpec obyčajný stĺpec a položky sa naťahujú na šírku popupu.
     Dvojica min-width:0 je tá istá poistka o úroveň nižšie: bez nej scrollovací kontajner
     tlačí svoju max-content šírku do rodiča a preteká presne tak isto. */
  .trp-root .att-entry-blocks-kind{flex-wrap:nowrap;align-items:stretch;}
  .trp-root .att-entry-block{padding:14px 16px;min-width:0;max-width:100%;}

  /* ── KAŽDÝ BLOK TAKÝ ISTÝ ────────────────────────────────────────────────────────────
     Na PC je VÝLET zámerne väčší: leží v prvom riadku cez celú šírku a dva menšie sú pod
     ním, takže hierarchiu nesie PLOCHA. Na telefóne stoja všetky tri POD SEBOU v rovnakej
     šírke — tam by väčšie písmo bolo jediný rozdiel a čítalo by sa ako iný typ prvku, nie
     ako dôležitejšia voľba. Poradie hierarchiu povie samo. */
  .trp-root .att-entry-blocks-kind .att-entry-block:first-child .att-entry-title{font-size:23px;letter-spacing:.05em;margin-bottom:10px;}
  /* ⚠️ Rezervu na dvojriadkový popis si prvá dlaždica na PC ruší (min-height:0) — tam stojí
     sama v riadku, takže nemá s kým zarovnávať dno. V stĺpci má, a bez tejto rezervy je
     o riadok nižšia než susedia, teda „taký istý" padá hneď na prvej z troch. */
  .trp-root .att-entry-blocks-kind .att-entry-block:first-child .att-entry-text{font-size:12.5px;min-height:2.9em;}
  .trp-root .att-entry-blocks-kind .att-entry-block:first-child .att-entry-chips{gap:6px;margin-top:10px;}
  .trp-root .att-entry-blocks-kind .att-entry-block:first-child .att-entry-chip{font-size:10.5px;padding:3px 9px;gap:5px;}
  .trp-root .att-entry-blocks-kind .att-entry-block:first-child .att-entry-chip-emoji{font-size:12px;}

  /* ── BEZ VEĽKÉHO EMOJI, NÁZOV NESIE BLOK SÁM (Matej 2026-08-28) ───────────────────────
     „Názvy blokov sú nevýrazné a na prvý pohľad nie sú vidno = treba ich poriadne zvýrazniť
      a zväčšiť, ikonku dať na začiatok alebo to skúsiť aj bez nej… skúsme bez, veď sú tam
      chipy, aby tam nebolo veľa ikoniek"
     Glyf bol 32 px a nadpis 14 — na prvý pohľad teda blok pomenúvala labka, nie slovo VÝLET.
     Chipy pod ním pritom nesú štyri až šesť ďalších emoji, takže z bloku bola zbierka
     obrázkov s popisom. Odteraz nesie identitu NÁZOV a obrázky ostávajú tam, kde niečo
     rozlišujú — na chipoch.
     ⚠️ Emoji sa NEVYMAZALO Z RENDERU, len sa tu skrýva: na PC je súčasťou dlaždice a mimo
     mapy ten istý popup neexistuje, takže odstránenie z komponentu by menilo aj PC. */
  .trp-root .att-entry-emoji{display:none;}
  /* Výplň zhora robí miesto pilulke s bodmi — tá stojí absolútne v rohu a bez rezervy by
     ju veľký nadpis, ktorý je teraz prvý v poradí, podbehol. */
  .trp-root .att-entry-block{padding-top:38px;}
  /* ── NÁZOV JE PRVÁ VEC, KTORÚ VIDNO (Matej 2026-08-28: „nadpis zvýrazni lebo je to fádne
        a človek v prvej sekunde nevie kam má kliknúť") ───────────────────────────────────
     Zväčšiť sa dalo aj ráno a nepomohlo — bloky sú tri rovnaké papyrusové plochy a text v
     nich mal presne jednu váhu, takže oko nemalo za čo zachytiť. Preto nie ďalšie pixely,
     ale ODDELENIE: pod názvom je zlatá deliaca čiara "T.rule" — ten istý prvok, ktorý delí
     obsah v každej bledej karte (lock „bledý blok", Entry.tsx). Názov tým prestáva byť
     prvým riadkom odseku a stáva sa hlavičkou dlaždice.
     ⚠️ Čiara sa kreslí na ::after, teda NEZABERÁ vlastný riadok textu — bloky si držia
     rovnakú výšku, na ktorej stojí celý zvyšok tejto vetvy.
     ⚠️ Farba ostáva "P_INK". Zlatý gradient v písme ("TITLE_GRAD") je pre nadpisy na
     ČIERNOM; na papyruse má zlato na bledom strop ~2,7:1 a názov by sa zvýraznením stal
     horšie čitateľným — presne naopak, než znie zadanie. */
  .trp-root .att-entry-title{font-size:23px;letter-spacing:.05em;line-height:1.15;color:${P_INK};margin-bottom:10px;padding-bottom:9px;position:relative;}
  .trp-root .att-entry-title::after{content:'';position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:52px;height:2px;border-radius:2px;background:${T.rule};}
  /* Rezerva na dvojriadkový popis drží rovnaké dno aj v stĺpci — bez nej má dlaždica
     s jednoriadkovou vetou o riadok nižší blok než susedia a „taký istý" padá. */
  .trp-root .att-entry-text{min-height:2.9em;max-width:none;}

  /* ── CHIPY: NEKONEČNÁ SLUČKA (Matej 2026-08-28: „chipy daj do infinity slučky") ───────
     PODUJATIE má šesť chipov a na 390 px sa lámali do TROCH riadkov, kým VÝLET mal jeden —
     tým bol jeden blok o 60 px vyšší než susedia a rad prestal byť radom. Zalomenie preto
     padlo už ráno; ručný posuv prstom, ktorý ho nahradil, ale o skrytých chipoch mlčal —
     človek videl štyri a nevedel, že existuje šiesty. Rad sa teraz posúva sám.
     ⚠️ Ručný posuv sa RUŠÍ ("overflow:hidden", žiadny "touch-action:pan-x"): dva spôsoby
     pohybu na tom istom rade si prekážajú a "pan-x" nad chipmi navyše zabíja ZVISLÝ skrol
     stránky — prst na chipoch by popupom nepohol.
     ⚠️ Výbled je teraz na OBOCH stranách: v slučke chipy zľava priebežne pribúdajú, takže
     ľavá hrana potrebuje to isté, čo pravá — inak sa nový chip zjaví strihom.
     ⚠️ Trvanie nesie "--att-loop" z komponentu (čas na jednu sadu) a posun je presne
     "100 % / počet kópií" = šírka JEDNEJ sady, teda bezšvíkovo. Kópie a ich počet →
     komentár pri renderi v AddTripEntry.tsx.
     ⚠️ Odsadenie MEDZI sadami nesie "padding-right" sady, nie "gap" obalu — gap by sa do
     posunu nezapočítal a slučka by po každom kole poskočila o 6 px.
     ⚠️ flex:0 0 auto na chipe nie je ozdoba — bez neho ich flex stlačí na obsah a text sa
     začne lámať vnútri pilulky namiesto toho, aby rad vytiekol. */
  .trp-root .att-entry-chips{flex-wrap:nowrap;justify-content:flex-start;align-self:stretch;width:100%;min-width:0;overflow:hidden;padding-bottom:2px;
    -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 16px,#000 calc(100% - 16px),transparent 100%);
    mask-image:linear-gradient(90deg,transparent 0,#000 16px,#000 calc(100% - 16px),transparent 100%);}
  .trp-root .att-entry-chiploop{display:flex;flex:0 0 auto;width:max-content;will-change:transform;animation:att-chiploop var(--att-loop,12s) linear infinite;}
  .trp-root .att-entry-chipset,.trp-root .att-entry-chipset-copy{display:flex;flex:0 0 auto;gap:6px;padding-right:6px;}
  .trp-root .att-entry-chip{flex:0 0 auto;}
  @keyframes att-chiploop{from{transform:translateX(0);}to{transform:translateX(-33.3333%);}}
  /* Kto má vypnuté animácie, dostane rad stojaci na začiatku — nie prázdno. */
  @media (prefers-reduced-motion:reduce){
    .trp-root .att-entry-chiploop{animation:none;}
  }
}
`;


// ── VRSTVY MAPY (spec-hmla.md §1/§9) — deklaratívne pole, NIE natvrdo naklikané JSX ──────────
// Panel sa vygeneruje z MAP_LAYERS (filter podľa `type`), takže pridanie ďalšej vrstvy (veteriny,
// fotky komunity — spomenuté v zadaní ako budúci prípad) je jeden nový objekt v poli, nie prepis
// JSX. PODKLAD (base) je vždy PRÁVE JEDEN aktívny (radio); OVERLAY (overlay) sa dá zapnúť viac
// naraz (checkbox).
type MapBaseId = 'outdoor' | 'aerial' | 'dogypt';
type MapOverlayId = 'names' | 'vipers' | 'threats' | 'sleep';

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
  {
    // SPACIE MIESTA — útulne, kempy, bivaky, chaty (738 bodov z OSM, celé SK).
    // Matej 2026-08-27: „ak by som chcel pramene, útulne… vidieť hneď — nie viditeľne pri
    // odzoomovaní, ale pri veľkom priblížení by sa zobrazili."
    //
    // ⚠️ VIDNO ICH AŽ OD PRIBLÍŽENIA 15 (`SLEEP_MIN_ZOOM`), takže vypínač je väčšinu času
    // bez viditeľného účinku — a to je zámer, nie chyba. Prah drží lock z 21. 8. („mapa
    // krajiny je o trasách"); vypínač je tu preto, že vrstva je CUDZÍ dataset a človek ju
    // musí vedieť vypnúť aj v priblížení, presne z toho istého dôvodu ako vretenice.
    id: 'sleep',
    type: 'overlay',
    labelKey: 'pack.map.layer.sleep',
    disabledReason: (ctx) => (ctx.isCleanMode ? 'pack.map.overlayDogyptDisabled' : null),
  },
];

/** Prah priblíženia pre spacie miesta na CELKOVEJ mape. Vyššie než `POI_MIN_ZOOM` (13)
 *  zámerne: 13 je kalibrované na detail jedného výletu, kde je otázka „čo je na TEJTO trase".
 *  Na mape krajiny je tá istá hodnota emoji tapeta. */
const SLEEP_MIN_ZOOM = 15;

/**
 * ── PRIBLÍŽENIE PO VÝBERE Z HĽADANIA SA ODVODZUJE OD DRUHU MIESTA ────────────────────────
 *
 * Matej 2026-08-28: „skúšal som nájsť útulňu, mapa ju našla a zamerala, ale nebolo ju vidno
 * až po niekoľkých zoomoch — pri vyhľadávaní musí byť vidno hneď."
 *
 * Predtým tu bola jedna hodnota (13) pre všetko. Lenže útulňa je BOD ZO SVETA a tie sa na
 * mape krajiny kreslia až od `SLEEP_MIN_ZOOM` — prílet na 13 teda skončil presne dva zoomy
 * pod prahom, na ktorom sa hľadaná vec zobrazí. Prah sa NEZNIŽUJE (lock z 21. 8.: pod ním je
 * mapa krajiny príbeh o trasách); posúva sa PRÍLET, aby hľadanie skončilo nad ním.
 *
 * ⚠️ Číslo pre bod je `SLEEP_MIN_ZOOM`, nie vlastná pätnástka — keby sa prah niekedy hol,
 * hľadanie by ostalo pod ním a chyba by sa vrátila v tichosti.
 *
 * `type` vracia Mapy.com suggest (overené naživo 28. 8. na dotazoch „utulna", „Bratislava",
 * „Slovensko", „Hlavna 5 Kosice"): `poi` · `regional.address` · `regional.street` ·
 * `regional.municipality(_part)` · `regional.region` · `regional.country`. Mesto ostáva na 13
 * ako doteraz — kto hľadá Bratislavu, nechce ulicu; kraj a krajina idú ešte ďalej.
 */
const placeZoom = (type?: string): number => {
  if (!type) return 13;
  if (type === 'poi' || type.startsWith('regional.address') || type.startsWith('regional.street')) return SLEEP_MIN_ZOOM;
  if (type.startsWith('regional.municipality')) return 13;
  if (type.startsWith('regional.region')) return 9;
  if (type.startsWith('regional.country')) return 7;
  return 13;
};
// Overlaye majú default stav mimo poľa (pole je o TOM ČO existuje, nie o tom čo je dnes zapnuté).
// ⚠️ `poi` odtiaľto zmizol 21. 8. spolu s celou OSM vrstvou. 27. 8. sa vrátila jej ČASŤ ako
// `sleep` (spacie miesta) — pramene a lavičky tu naďalej nie sú, takže prepínač na ne by bol
// mŕtve tlačidlo. Pribudnú do dlaždíc ⇒ pribudne im vypínač, nie skôr.
// `vipers: true` — Matej si vrstvu vypýtal NA mapu, nie do ponuky. Zapnutá je
// bezpečná preto, že sa kreslí len pri oddialení (VIPER_MAX_ZOOM); pri práci
// s konkrétnou trasou zmizne sama.
// `threats: true` — upozornenia svorky sú dôvod, prečo vrstva zápisov existuje;
// vypínač je tu na to, aby si ich človek vedel odpratať, nie aby si ich musel
// hľadať.
const OVERLAY_DEFAULTS: Record<MapOverlayId, boolean> = { names: false, vipers: true, threats: true, sleep: true };

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

// VÝBER KRAJINY — vlajka v rohu panela (Matej 2026-08-26: „vedľa filtru hore dajme ešte
// druhý filter, resp. vlajku").
//
// Prečo nie natívny <select> zmenšený na ikonku: natívny výber ukazuje presne ten text, ktorý
// nesie zvolená položka, takže buď je v tlačidle „🇸🇰 SK" (a nie je to ikonka), alebo je
// v zozname len holá vlajka (a nie je to zoznam). Panel je ten istý vzor ako pri tagoch —
// jedna trieda, jeden vzhľad, jedno správanie pri kliku vedľa.
function CountryFlagDropdown({
  countries,
  value,
  onPick,
}: {
  countries: string[];
  value: string;
  onPick: (c: string) => void;
}) {
  const t = useT();
  const [open, setOpen] = useExclusiveDropdown();
  // Jedna krajina = nie je z čoho vyberať. Tlačidlo, ktoré nič nemení, je horšie než žiadne.
  if (countries.length < 2) return null;
  return (
    <span className="trp-flagdd">
      <button
        type="button"
        className={`trp-greet-filter${value ? ' on' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t('pack.map.country')}
        title={t('pack.map.country')}
      >
        <span className="trp-flagdd-face" aria-hidden>{value ? flagEmoji(value) : '🌍'}</span>
      </button>
      {open && (
        <>
          <span className="fixed inset-0" style={{ zIndex: 40 }} onClick={() => setOpen(false)} aria-hidden />
          <div className="trp-tagdd-panel trp-flagdd-panel">
            <span className="trp-tagdd-eyebrow">{t('pack.map.country')}</span>
            <button
              type="button"
              className={`trp-tagdd-row${value === '' ? ' on' : ''}`}
              onClick={() => { onPick(''); setOpen(false); }}
            >
              <span>🌍 {t('pack.map.all')}</span>
              {value === '' && <span aria-hidden>✓</span>}
            </button>
            {countries.map((c) => (
              <button
                key={c}
                type="button"
                className={`trp-tagdd-row${value === c ? ' on' : ''}`}
                onClick={() => { onPick(c); setOpen(false); }}
              >
                <span>{flagEmoji(c)} {c.toUpperCase()}</span>
                {value === c && <span aria-hidden>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </span>
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
  const [open, setOpen] = useExclusiveDropdown();
  const count = tags.size;

  return (
    <span className="relative inline-flex trp-tagdd-wrap">
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

// ── NARAZ SMIE BYŤ OTVORENÁ JEDNA ROZBAĽOVAČKA (2026-08-26) ─────────────────────────────────
// Backdrop panelu leží na z-index 40, ale samotné tlačidlá stoja v .trp-topbar (700) a
// .trp-sidebar (20), teda NAD ním — klik na susednú rozbaľovačku ju preto otvoril bez toho, aby
// predošlú zatvoril, a v rade piatich filtrov viseli dva panely vedľa seba. Zdvihnúť backdrop
// nad chrome sa nedá: prekryl by aj vlastný panel. Rozbaľovačky si preto povedia, že sa otvára
// iná — jedna udalosť na dokumente, žiadny zdieľaný stav v PackMap (komponenty sú samostatné a
// stoja v dvoch rôznych vetvách stromu).
const DD_OPEN_EVENT = 'trp-dd-open';
let ddSeq = 0;
function useExclusiveDropdown(): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const idRef = useRef(0);
  if (!idRef.current) idRef.current = ++ddSeq;
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent<number>).detail !== idRef.current) setOpen(false);
    };
    document.addEventListener(DD_OPEN_EVENT, onOther);
    return () => document.removeEventListener(DD_OPEN_EVENT, onOther);
  }, []);
  // Ohlasuje sa AŽ V EFEKTE, nie v handleri: dispatch vnútri setState updatera by v
  // StrictMode odišiel dvakrát a v budúcom React režime by to bol vedľajší účinok v renderi.
  useEffect(() => {
    if (open) document.dispatchEvent(new CustomEvent(DD_OPEN_EVENT, { detail: idRef.current }));
  }, [open]);
  return [open, setOpen];
}

// ── Jednovoľbová rozbaľovačka hlavičky — NÁROČNOSŤ a NÁVŠTEVNOSŤ (2026-08-26) ───────────────
// Nahrádza natívny <select>. Dva Matejove dôvody naraz, oba sa dali vyriešiť len takto:
//
//  1. „náročnosť nemá emoji… resp ikonky." Náročnosť ZNAČKU má — zelený kruh / žltý štvorec /
//     červený trojuholník (`DiffMark`), ten istý znak, aký nesie bod na mape aj pilulka na
//     fotke. `<option>` unesie výhradne text, takže natívny select ju vykresliť NEVIE; jediná
//     alternatíva by bola vymyslieť pre náročnosť tretiu reč (emoji) vedľa farby a tvaru.
//  2. „dropdowny treba zosúladiť — niektoré sú tmavé." Rozbaľovací zoznam natívneho selectu
//     kreslí PREHLIADAČ podľa `color-scheme`, nie stránka (index.html má natvrdo `dark`).
//     Vlastný panel tento spor nemá vôbec.
//
// ⚠️ TRIEDY SÚ `trp-tagdd-*`, teda tie isté, aké nesie filter tagov — zámerne. Bledá vetva pre
// ne už existuje (a od 26. 8. je BEZ kotvy na rodiča, práve preto, že presuny prvkov ju ticho
// zhadzovali). Vlastná sada tried by bola štvrtý vzhľad rozbaľovačky na jednej obrazovke.
function TripPickDropdown({ label, value, options, onPick, anyLabel, anyIcon, placeholder }: {
  label: string;
  value: string;
  options: { value: string; label: string; icon?: React.ReactNode }[];
  onPick: (v: string) => void;
  anyLabel: string;
  /** Značka pri „zrušiť filter" — krajina má pri „Všetko" glóbus a bez toho by sa pri
   *  výmene natívneho selectu za túto rozbaľovačku ticho stratil. */
  anyIcon?: React.ReactNode;
  /**
   * Čo stojí v tlačidle, kým nie je nič vybrané.
   * Na PC je to NÁZOV FILTRA (label) — rozbaľovačka stojí v rade sama a musí povedať, čoho sa
   * týka. V mobilnom paneli je nad ňou popisok, takže by sa ten istý text čítal dvakrát pod
   * sebou („KRAJINA / Krajina"); tam sa posiela anyLabel („Všetko"), presne ako to ukazoval
   * natívny select pred výmenou.
   */
  placeholder?: string;
}) {
  const [open, setOpen] = useExclusiveDropdown();
  const current = options.find((o) => o.value === value);
  return (
    <span className="relative inline-flex trp-pickdd-wrap">
      <button
        type="button"
        className={`trp-tagdd-btn${value ? ' on' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={label}
      >
        <span className="trp-pickdd-cur">{current ? current.icon : anyIcon}{current ? current.label : (placeholder ?? label)}</span>
        <span className="trp-tagdd-chevron" aria-hidden>▾</span>
      </button>
      {open && (
        <>
          {/* Backdrop — klik mimo zatvára. Rovnaký vzor ako TripTagsDropdown vyššie. */}
          <span className="fixed inset-0" style={{ zIndex: 40 }} onClick={() => setOpen(false)} aria-hidden />
          <div className="trp-tagdd-panel">
            <span className="trp-tagdd-eyebrow">{label}</span>
            {/* „Akákoľvek" = zrušenie filtra. V natívnom selecte to bola prvá <option> s
                prázdnou hodnotou; tu je to riadok, inak by sa filter nedal vypnúť. */}
            <button
              type="button"
              className={`trp-tagdd-row${value ? '' : ' on'}`}
              onClick={() => { onPick(''); setOpen(false); }}
            >
              <span className="trp-pickdd-item">{anyIcon}{anyLabel}</span>
              {!value && <span aria-hidden>✓</span>}
            </button>
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`trp-tagdd-row${value === o.value ? ' on' : ''}`}
                onClick={() => { onPick(o.value); setOpen(false); }}
              >
                <span className="trp-pickdd-item">{o.icon}{o.label}</span>
                {value === o.value && <span aria-hidden>✓</span>}
              </button>
            ))}
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
  const [levelPanelOpen, setLevelPanelOpen] = useState(false);

  /**
   * REVEAL PO ZAPÍSANÍ VÝLETU — dáta sa zachytávajú v momente odoslania, lebo `levelInfo`
   * sa v tej chvíli ešte neprepočítal (setState je asynchrónny a `profile` visí na
   * `walkedIds`/`localTrails`). Preto sa tu drží LEN stav PRED zápisom a rozpad za ten jeden
   * výlet; level PO zápise si reveal berie z aktuálneho `levelInfo` pri renderi, teda z tej
   * istej funkcie, ktorá kŕmi hlavičku mapy. Dva rôzne výpočty by dali dve rôzne čísla.
   */
  const [reveal, setReveal] = useState<{
    tripName: string; tripMeta: string; tripStats?: TripStat[]; tripPhoto?: string | null;
    points: TripPointsResult; levelBefore: LevelProgress;
    /** len DEV náhľad — v reálnom zápise je level PO vždy aktuálny `levelInfo` */
    levelAfter?: LevelProgress;
    /** id výletu — reveal z neho vie ponúknuť dopísanie konceptu (a nič iné) */
    tripId?: string;
    /** i18n kľúče polí, ktoré výletu chýbajú do zverejnenia; prázdne = ide von hneď */
    draftMissing?: string[];
    /** neprázdne = reveal PLÁNU (body sú odhad, level sa nehýbe) — viď `openPlanRevealFor` */
    plan?: { whenLine: string };
  } | null>(null);

  /**
   * DEV NÁHĽAD REVEALU — tri režimy, aby sa dali porovnať vedľa seba:
   *   `?reveal=plain` — bežný zisk bez levelu (to, čo človek uvidí zakaždým)
   *   `?reveal=demo`  — level up VNÚTRI pásma (9 → … nie, 7 → 8: farba sa nemení)
   *   `?reveal=tier`  — level up so ZMENOU PÁSMA (9 → 10, Zlato → Karneol)
   *
   * Bez neho sa reveal dá vidieť len prejdením celého päťkrokového sprievodcu vrátane
   * kreslenia trasy, takže každé ladenie animácie stálo dve minúty klikania. Scéna trvá
   * 5,6 s a ladí sa po desatinách — to sa inak overiť nedá.
   *
   * ⚠️ Do produkčného buildu sa to nedostane: `import.meta.env.DEV` je vo `vite build`
   *    `false`, takže vetva je mŕtva a tree-shaking ju odstráni (rovnaká stráž ako
   *    `devMockDogs.ts`).
   */
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const want = new URLSearchParams(location.search).get('reveal');
    if (!want) return;
    // Level up sa nedá nasimulovať posunom PRED, keď je účet na leveli 1 (nižšie sa nedá).
    // Preto sa v náhľade podstrkuje aj level PO — v reálnom zápise sa berie z `levelInfo`.
    openDemoReveal(want);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Spúšťač DEV náhľadu. Vystavuje sa aj na `window.__revealDemo('tier')`, aby sa scéna dala
   * pustiť BEZ reloadu — inak sa nedá odfotiť konkrétny okamih: čas medzi navigáciou a prvým
   * príkazom nie je merateľný a 5,6-sekundová scéna medzitým dobehne.
   */
  const openDemoReveal = (want: string) => {
    const at = (lv: number) => levelProgress(levelThreshold(lv) + 12);
    const before = want === 'tier' ? at(9) : at(7);
    const after = want === 'plain' || want === 'plan' ? before : (want === 'tier' ? at(10) : at(8));
    setReveal({
      tripName: 'Kopaničky okruh',
      tripMeta: '4,5 km · 180 m ↑ · Strážovské vrchy',
      tripPhoto: null,
      points: calculateTripPoints({
        kind: 'trail', km: 5, ascentM: 180, added: true, walked: true,
        newRange: true, rated: true,
      }),
      levelBefore: before,
      levelAfter: after,
      // `?reveal=draft` — náhľad správy o koncepte. Bez neho sa dá uvidieť jedine zapísaním
      // neúplného výletu, teda prejdením celého sprievodcu vrátane kreslenia trasy.
      draftMissing: want === 'draft' ? ['pack.addTrip.field.diff', 'pack.addTrip.field.crowd'] : [],
      tripId: want === 'draft' ? 'demo-draft' : undefined,
      // `?reveal=plan` — odozva po NAPLÁNOVANÍ. Inak sa dá uvidieť jedine prejdením celého
      // sprievodcu vrátane kreslenia trasy, a to je pri ladení textu dve minúty klikania.
      ...(want === 'plan' ? { plan: { whenLine: t('pack.reveal.plan.inDaysFew', { n: 3 }) } } : {}),
    });
  };

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    (window as unknown as { __revealDemo?: (m: string) => void }).__revealDemo = (m: string) => {
      setReveal(null);
      window.setTimeout(() => openDemoReveal(m), 50);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { toast } = useToast();

  const [hoverId, setHoverId] = useState<string | null>(null);
  // Matej 2026-07-31: „pri dotyku myšou trasa vybledne aby bolo vidno turistické značenie farby".
  // Vlastný stav vedľa hoverId zámerne — hoverId plní aj ĽAVÝ ZOZNAM a markery, kde je hover
  // pomôcka na NÁJDENIE trasy (tam musí ostať zlatá). Vybledne len to, na čom reálne stojí myš.
  const [lineHoverId, setLineHoverId] = useState<string | null>(null);
  const [heroDiff, setHeroDiff] = useState<'' | 'Easy' | 'Moderate' | 'Hard' | 'Odyssey'>('');
  const [heroCrowd, setHeroCrowd] = useState<'' | 'Pokojné' | 'Rušné' | 'Ľudoprázdne'>('');
  // ⚠️ HODNOTY = ID KATEGÓRIÍ (2026-08-27), nie staré aktivity. Zoznam bol do 27. 8. napísaný
  // ručne a chýbali v ňom `journey` aj `explore` — dve zo siedmich aktivít sa teda cez typ
  // nedali ani vybrať. Dnes ho drží `TripCategoryId`, takže pribudnutá kategória tu nemá kde
  // vypadnúť.
  const [heroAct, setHeroAct] = useState<'' | TripCategoryId>('');
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
  const [mapTarget, setMapTarget] = useState<FlyTarget | null>(null);
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
    const safeY = map.getSize().y - notePanelH() - 40;
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
   * Platí na PC aj na mobile — v krokoch 1–2 je obrazovkou mapa a formulár ustúpi celý.
   */
  const [addMapPhase, setAddMapPhase] = useState<'off' | 'draw' | 'notes'>('off');
  /**
   * Trasa rozkreslená v sprievodcovi. Slúži JEDINE na to, aby `FitBounds` prestal prepisovať
   * výrez hranicou SR — samotné rámovanie robí sprievodca (viď `onHasRoute` v AddTripLog).
   */
  const [addHasRoute, setAddHasRoute] = useState(false);
  /**
   * Sprievodca „kde nájdeš svoje výlety" — zjaví sa PO NÁVRATE Z REVEALU na mapu, nie v ňom
   * (Matej 2026-08-25). V reveali by súperil so scénou levelu; tu je mapa už pod ním a šípka
   * môže ukázať na skutočnú hlavičku.
   */
  const [coachOpen, setCoachOpen] = useState(false);
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
   * NÁHĽAD EXISTUJÚCEHO VÝLETU POČAS KRESLENIA (2026-08-25).
   * Matej pri teste: „nevidím po kliku na pilulku ten profil ani info o čase."
   * ⚠️ Nie je to inline detail výletu — ten by porušil „pri kreslení sa nemôže otvoriť
   * niečo iné". Je to plochá karta nad dokom, ktorá len ODPOVEDÁ na otázku „čo je to
   * za trasu": názov, dĺžka, prevýšenie, odhad času a výškový profil. Kreslenie beží ďalej.
   */
  const [drawPeek, setDrawPeek] = useState<HeroTrail | null>(null);
  // Koniec kreslenia kartu zavrie — inak by ostala visieť nad krokom 2 a nikto by nevedel,
  // čoho sa týka.
  useEffect(() => { if (!mapDrawing) setDrawPeek(null); }, [mapDrawing]);
  /**
   * KURZOR HOVORÍ, ŽE KLIK DO MAPY NIEČO SPRAVÍ (Matej 2026-08-24: „nevidím pri kurzore +").
   * Na telefóne to povie prst a pilulka s pokynom; na PC nebolo z ničoho vidieť, že mapa je
   * práve kresliaca plocha a nie prehliadanie — kurzor ostával Leafletovská ruka.
   * Trieda, nie inline štýl: Leaflet si `cursor` prepisuje na vlastných vrstvách, takže sa to
   * musí povedať aj im (viď selektor v DRAW_BAR_CSS). Platí pre kreslenie trasy AJ pre
   * zapichovanie značky v kroku 2 — v oboch prípadoch je ďalším úkonom klik do mapy.
   */
  const mapCursorCross = addMapPhase === 'draw' || notePlaceReady;
  useEffect(() => {
    if (!mapCursorCross) return;
    document.body.classList.add('trp-drawing');
    return () => document.body.classList.remove('trp-drawing');
  }, [mapCursorCross]);
  /**
   * ZNAČKY ZAPICHNUTÉ POČAS TOHTO PRIDÁVANIA (krok 2 sprievodcu). Slúžia len na zobrazenie —
   * krok 4 ich ZHRNIE, needituje. Väzba značky na výlet sa NEUKLADÁ (odvodzuje sa zo
   * súradnice, viď mapNotesGeo.ts), takže toto je naozaj len pamäť jednej obrazovky.
   */
  // ⚠️ `readTripNotesForSession`, NIE `readTripNotes` — bez rozrobeného výletu je zoznam
  // v úložisku zvyšok po minulom pokuse a nový výlet by začínal s cudzími značkami
  // (a s bodmi za ne). Dôvod je rozpísaný pri tej funkcii.
  const [tripNotes, setTripNotesState] = useState<TripNoteRef[]>(() => readTripNotesForSession());
  /**
   * ⚠️ PREŽÍVA RELOAD. Zoznam sa musí obnoviť spolu s formulárom (`readAddDraft` vracia aj
   * číslo kroku), inak človek pokračuje v kroku 4 a zhrnutie tvrdí, že neoznačil nič —
   * hoci značky sú uložené. Na telefóne stačí, že iOS zahodí stránku na pozadí.
   * Zápis ide cez túto obálku, nie cez `setTripNotesState` priamo, nech sa nedá pridať
   * značka, ktorá sa neuloží.
   */
  const setTripNotes = useCallback((up: (prev: TripNoteRef[]) => TripNoteRef[]) => {
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
   * ⚠️ HISTÓRIA, KTORÁ SA NESMIE VRÁTIŤ: do 23. 8. mountovali `AddTripLog` DVE miesta naraz
   * (`.trp-sidebar` + `.trp-madd`) a skrývalo ich CSS, nie podmienka. Obe kópie písali do
   * jedného kľúča zálohy, takže tá neviditeľná — prázdna — prepísala prácu tej viditeľnej.
   * S krokovým sprievodcom by z toho boli dvaja sprievodcovia s vlastným číslom kroku, preto
   * kópia zanikla: formulár žije v JEDNOM hostiteľovi (`.trp-addhost`), ktorému len CSS mení
   * tvar z plávajúceho panela na celú obrazovku.
   *
   * ⚠️ MERANIE ŠÍRKY V JS TU UŽ NIE JE (24. 8.). Stav `isNarrow` rozhodoval, či sa formulár
   * v kroku 1 schová a či lišta stojí vedľa panela — teda o TOKU podľa šírky okna. Odkedy je
   * tok na oboch platformách rovnaký (kroky 1–2 = mapa, 3–5 = panel), rozhoduje o tvare už
   * len CSS pri `MOBILE_BP`. Jedna hranica, jedno miesto; dve by vyrobili pásmo šírok
   * bez pravidiel.
   */
  // tripy pridané v tejto session (ADD flow submit) — lokálny state, NIE Supabase (mimo
  // rozsahu tejto iterácie); zobrazujú sa hneď na mape + v zozname pred statickými HERO_TRAILS.
  // sessionStorage mirror (viď vyššie) nech expand na čerstvo pridaný trip nájde aj po navigate.
  const [localTrails, setLocalTrails] = useState<HeroTrail[]>(() => readLocalTrails());
  /**
   * ── KONCEPT, KTORÝ SA PRÁVE DOPĹŇA (2026-08-25) ────────────────────────────────────────
   * Id, nie objekt: záznam sa počas dopĺňania prepisuje, a odložená kópia by po uložení
   * ukazovala stav spred neho.
   */
  const [finishTrailId, setFinishTrailId] = useState<string | null>(null);
  /** true = `finishTrailId` je PREJDENÝ PLÁN, nie dopĺňaný koncept (viď `openWalkPlan`). */
  const [finishFromPlan, setFinishFromPlan] = useState(false);
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
    /**
     * `?walk=<tripId>` — „ÁNO, ZAPÍŠEM" z karty v deň výletu (`PlanAskCard` na `/pack`).
     * Robí presne to, čo `openWalkPlan()` nižšie; nevolá sa ono, lebo tá funkcia žije ZA
     * early returnmi (`id.loading` / `!id.session`) a hook sem musí prísť pred ne.
     * ⚠️ Neexistujúce id sa ticho ignoruje — inak by sprievodca spadol do režimu zápisu
     * NOVÉHO výletu a ponúkol kreslenie človeku, ktorý klikol „áno, bol som".
     */
    const walk = searchParams.get('walk');
    if (walk) {
      setSearchParams({}, { replace: true });
      if (localTrails.some((tr) => tr.id === walk)) {
        setFinishFromPlan(true);
        setFinishTrailId(walk);
        setAddFlow('walked');
        return;
      }
    }
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
  const allTrails = useMemo(() => [...visibleLocalTrails(localTrails), ...HERO_JOURNEYS, ...HERO_TRAILS], [localTrails]);
  // Množina členských id — raz za zmenu zoznamu, nie pri každej karte (inak by sa
  // `trp-local-trails` parsovalo z úložiska raz na výlet).
  const memberIds = useMemo(() => memberTrailIds(), [localTrails]);
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
        // ⚠️ JAZYK PODĽA APPKY, nie natvrdo `en` (opravené 27. 8. 2026). Mapy.com vracia
        // v `label` TYP miesta a s `lang=en` z toho slovenský člen dostal „Shelter" namiesto
        // „Útulňa, bivak" — teda presne to slovo, podľa ktorého miesto hľadá. Overené naživo
        // na dotaze „Kolibka".
        const url = `${MAPY_BASE}/v1/suggest?query=${encodeURIComponent(q)}&lang=${encodeURIComponent(lang)}&limit=6&apikey=${MAPY_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        const items: PlaceSug[] = (data.items || [])
          .map((it: { name?: string; label?: string; location?: string; type?: string; position?: { lat?: number; lon?: number } }) => ({
            name: it.name || '',
            sub: [it.label, it.location].filter(Boolean).join(' · '),
            lat: it.position?.lat as number,
            lon: it.position?.lon as number,
            // druh miesta → priblíženie po prílete (`placeZoom`), inak by bod zo sveta
            // skončil pod prahom, na ktorom sa vôbec kreslí
            type: it.type,
          }))
          .filter((x: PlaceSug) => Number.isFinite(x.lat) && Number.isFinite(x.lon));
        setPlaceSug(items);
      } catch { setPlaceSug([]); }
    }, 250);
    return () => clearTimeout(timer);
  }, [placeQuery, lang]);

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
  // Body za odkazy — hotové číslo z jedného zdroja (`useMyNotePoints`), aby level v hlavičke
  // mapy sedel s TRIPSTATS, homepage aj profilom.
  const myNotePoints = useMyNotePoints();
  const profile = useMemo(() => {
    const email = id.session?.user?.email ?? '';
    const meta = (id.session?.user?.user_metadata ?? {}) as Record<string, unknown>;
    return profileLevelFor({
      walkedTrails: allTrails.filter((tr) => walkedIds.has(tr.id)),
      localTrailIds: localTrails.map((tr) => tr.id),
      votes,
      email,
      ownerName: firstNameFrom(email, (meta.full_name || meta.name) as string | undefined),
      notePoints: myNotePoints,
    });
    // `storeEpoch` je v deps zámerne: `approvedAddedIds` číta statusy priamo z úložiska, takže
    // sa musí prepočítať v momente, keď hydratácia z DB dobehne.
  }, [allTrails, walkedIds, localTrails, votes, storeEpoch, id.session, myNotePoints]);
  const profilePoints = profile.points;
  const levelInfo = profile.level;

  // ── VÝŠKA MOBILNEJ HLAVIČKY IDE VON AKO --trp-mheader-h (2026-08-28) ──────────────────
  // Matej: „panely na pravej strane (vrstvy +- …) … posunúť nižšie lebo su v dotyku s hornym
  // headrom." Odsadenie ovládačov sa preto NEPÍŠE ČÍSLOM: hlavička je dvojriadková a jej výška
  // sa hýbe s veľkosťou písma, safe-area aj s tým, čo v nej práve stojí — natvrdo zapísaných
  // 118 px bolo presne to, prečo sa ovládače o ňu opreli. Vzor je --pack-nav-half
  // v PackBottomNav: kto potrebuje mieru cudzieho prvku, dostane ju od toho prvku.
  // ⚠️ STOJÍ TU, NAD podmieneným if (id.loading) return — hook za ním zhodí render
  //    („Rendered more hooks than during the previous render") a stránka ostane prázdna.
  const mheaderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = mheaderRef.current;
    if (!el) return;
    const root = document.documentElement;
    const apply = () => root.style.setProperty('--trp-mheader-h', `${el.getBoundingClientRect().height}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => { ro.disconnect(); root.style.removeProperty('--trp-mheader-h'); };
    // ⚠️ ZÁVISLOSŤ NA id.loading NIE JE NAVYŠE. Pri prvom renderi vracia komponent načítavaciu
    // obrazovku, takže hlavička v DOM ešte NIE JE — efekt s prázdnym poľom by našiel null,
    // vrátil sa a observer by sa nikdy nezaložil. Ovládače by potom navždy stáli na fallbacku.
  }, [id.loading]);


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
  /**
   * ZRUŠENIE OTVORENÉHO PLÁNU POŠLE ODKAZ PRIJATÝM (Matej 2026-08-25, variant A).
   *
   * „zrušiť + poslať odkaz prijatým… ak nikto prijatý nie je, plán mizne ticho — nie je komu
   *  písať." Odovzdanie výletu inému organizátorovi (variant C) sa NEROBÍ.
   *
   * ⚠️ POSIELA SA PRED MAZANÍM a čaká sa na to. `start_dm()` vpustí dvojicu len vtedy, keď
   * majú spoločný riadok v `trip_requests` — keby sa najprv mazalo a až potom písalo, správa
   * by ticho zapadla presne tým ľuďom, ktorým je určená. (Dnes `deletePlannedTrip` riadky
   * `trip_requests` nemaže, takže by to ešte prešlo; to je zhoda okolností, nie záruka.)
   *
   * ⚠️ Správa ide v MOJOM jazyku, nie v jazyku adresáta — appka cudziu jazykovú voľbu nemá
   * odkiaľ prečítať. Pri 18 jazykoch to raz bude chcieť preklad na strane príjemcu.
   *
   * Zlyhanie odosielania NESMIE zastaviť zrušenie: človek klikol „zruš to" a plán musí
   * zmiznúť aj bez siete. Preto `catch` a ideme ďalej.
   */
  const notifyPlanCancelled = async (tid: string) => {
    const organizerId = id.session?.user?.id ?? null;
    if (!organizerId) return;
    const trail = localTrails.find((tr) => tr.id === tid);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).rpc('get_trip_party', {
        p_trip_slug: tid, p_organizer: organizerId,
      }) as { data: { role: string; pack_number: number | null }[] | null };
      // LEN PRIJATÍ. Kto len požiadal a ešte nedostal odpoveď, nič neplánoval — správa
      // „zrušil som výlet" by mu oznamovala zrušenie niečoho, čo preňho nikdy nezačalo.
      const joiners = (data ?? []).filter((r) => r.role === 'joiner' && r.pack_number != null);
      if (!joiners.length) return;   // nikto prijatý → mizne ticho
      const text = t('pack.map.planCancelledDM', {
        name: trail?.name ?? '',
        date: planDateLabel(trail?.date, (n) => t('pack.addTrip.plan.whenWeekN', { n: String(n) })),
      });
      const m = await import('@/components/pack/messaging/packMessaging');
      for (const j of joiners) {
        const convId = await m.startTripDM({ tripSlug: tid, organizerId, packNumber: j.pack_number });
        if (convId) await m.sendMessage(convId, text);
      }
    } catch { /* bez siete sa plán zruší aj tak — správa je oznámenie, nie podmienka */ }
  };

  const deletePlannedTrip = async (tid: string) => {
    await notifyPlanCancelled(tid);
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

  /**
   * Otvorí sprievodcu nad uloženým konceptom (krok 3, kroky 1–2 zamknuté).
   *
   * ⚠️ Neexistujúce id sa ticho ignoruje. Bez toho by sprievodca spadol do NORMÁLNEHO režimu
   * zápisu — teda by ponúkol kreslenie nového výletu človeku, ktorý klikol „doplniť". Stane
   * sa to pri medzičasom zmazanom výlete aj v DEV náhľade revealu.
   */
  const openFinishTrip = (tripId: string) => {
    if (!localTrails.some((tr) => tr.id === tripId)) return;
    setInlineDetailId(null);
    setAddEntryOpen(false);
    setAddMapPhase('off');
    setFinishFromPlan(false);
    setFinishTrailId(tripId);
    setAddFlow('walked');
  };

  /**
   * PREJDENÝ PLÁN → ZÁPIS (Matej 2026-08-25).
   *
   * „po prejdení tejto trasy sa tento trip musí otvoriť v tripflowe ako pre zápis, ale už bude
   *  mať predvyplnenú trasu (možnosť opraviť, ainubis sa opýta či to sedelo s plánom),
   *  2. krok pridať odkazy - 3 krok-4-5"
   *
   * Ten istý vstup ako dopĺňanie konceptu, len bez zámku na krokoch 1–2 (viď `fromPlan`
   * v AddTripLog). NAHRÁDZA `toggleWalked()` pre vlastný neprejdený plán: to otváralo malý
   * popup na náročnosť a ruch, teda tretiu cestu k tomu istému zápisu, ktorá o značkách,
   * fotkách ani príbehu nevie.
   */
  const openWalkPlan = (tripId: string) => {
    if (!localTrails.some((tr) => tr.id === tripId)) return;
    setInlineDetailId(null);
    setAddEntryOpen(false);
    setAddMapPhase('off');
    setFinishFromPlan(true);
    setFinishTrailId(tripId);
    setAddFlow('walked');
  };

  const closeAdd = () => {
    setAddFlow(null);
    setFinishTrailId(null);
    setFinishFromPlan(false);
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
  /**
   * Body za PRÁVE zapísaný výlet + otvorenie revealu.
   *
   * Geo novinky (nové pohorie / NP / CHKO / vodná plocha / krajina) sa NEHÁDAJÚ z draftu —
   * porovnáva sa `computeCompletion` PRED a PO pridaní trasy. Odškrtnutie sa totiž počíta raz
   * a z celej histórie: kto v Strážovských vrchoch už bol, desiatku znova nedostane, aj keď
   * práve zapisuje výlet v Strážovských vrchoch.
   *
   * ⚠️ `calculateTripPoints` tu dáva rozpad ZA TENTO VÝLET (to, čo ukazuje ⓘ). Celkový počet
   *    bodov a level si reveal berie z `levelInfo`, teda z `profileLevelFor`. Sú to dve
   *    rôzne funkcie nad tými istými cenami a takto to má byť — jedna hovorí „za toto", druhá
   *    „spolu"; keby rozpad počítal aj celok, po prvej zmene cien by sa rozišli.
   */
  const openRevealFor = (trail: HeroTrail, draft: AddTripDraft) => {
    const walkedBefore = allTrails.filter((tr) => walkedIds.has(tr.id));
    const before = computeCompletion(walkedBefore);
    const after = computeCompletion([trail, ...walkedBefore]);
    const gained = (key: 'ranges' | 'parks' | 'chko' | 'waters') => {
      const n = (c: typeof before) => c.categories.find((x) => x.key === key)?.done.length ?? 0;
      return n(after) > n(before);
    };
    const countriesBefore = new Set(walkedBefore.map((tr) => tr.country).filter(Boolean));

    const points = calculateTripPoints({
      kind: draft.geometry.kind === 'route' ? 'trail' : 'place',
      km: Number(trail.km) || 0,
      ascentM: draft.ascentM ?? 0,
      journeyId: (draft as AddTripDraft & { existingTripId?: string }).existingTripId,
      added: true,
      walked: true,
      newRange: gained('ranges'),
      newNp: gained('parks'),
      newChko: gained('chko'),
      newWater: gained('waters'),
      newCountry: !!trail.country && !countriesBefore.has(trail.country),
      rated: (draft.paws ?? 0) > 0,
      // ⚠️ BEZ TOHTO RIADKU ROZPAD O ZNAČKÁCH MLČÍ (Matej 25. 8. 2026, Rokoš: „nepripísalo
      // mi body za odkazy"). Sprievodca ich sľubuje pri každej z troch otázok („+3 body"),
      // level ich od dnešnej opravy `useMyNotePoints` aj započíta — ale obrazovka hneď po
      // HOTOVO je to jediné miesto, kde človek vidí, ZA ČO dostal. Chýbajúci riadok sa tam
      // číta ako nezaplatené.
      // Číta sa stav sprievodcu, nie draft: väzba značky na výlet sa zámerne neukladá
      // (`addTripModel.ts`, `TripNoteRef`). `openRevealFor` beží PRED `closeAdd()`, ktorý
      // zoznam maže — poradie tých dvoch volaní preto nie je kozmetika.
      notes: tripNotes.length,
    });

    // ⚠️ ÚDAJE IDÚ PO KUSOCH, nie ako veta (Matej 28. 8. 2026 — reveal ich kreslí do chipov).
    // Veta sa skladá naďalej: nesie ju scéna level-upu, kde chipy nie sú.
    const stats = [
      trail.km && Number(trail.km) > 0 ? { value: String(trail.km), unit: 'km' } : null,
      draft.ascentM ? { value: String(draft.ascentM), unit: 'm ↑' } : null,
      revealPlaceStat(trail),
    ].filter(Boolean) as TripStat[];
    const meta = stats.map((x) => [x.value, x.unit].filter(Boolean).join(' ')).join(' · ');

    setReveal({
      tripName: trail.name,
      tripMeta: meta,
      tripStats: stats,
      tripPhoto: trail.photos?.[0] ?? draft.photos?.[0] ?? null,
      points,
      levelBefore: levelInfo,
      tripId: trail.id,
      // Počíta sa z PRÁVE zapísaného záznamu, nie z draftu — reveal má hovoriť o tom, čo
      // v úložisku naozaj leží. Keby čítal formulár, tvrdil by „hotovo" aj o poli, ktoré
      // sa do zápisu nedostalo.
      draftMissing: missingOnTrail(trail),
    });
  };

  /**
   * ── CHIP S MIESTOM: `region` NESIE DVE RÔZNE VECI (2026-08-31) ────────────────────────
   * V katalógu je to NÁZOV pohoria („Malé Karpaty"), vo výlete zapísanom cez sprievodcu je
   * to KÓD polovice Slovenska (`AddTripDraft.region`: 'W' | 'C' | 'E'). Reveal chip kreslil
   * surovú hodnotu, takže na vlastnom výlete stálo v pilulke holé „W" — vyzerá to ako
   * preklep, nie ako miesto.
   *
   * Pohorie sa lokálnemu výletu doplní až po schválení (`mountains`), takže kým ho nemá,
   * je správne NEUKÁZAŤ NIČ: chip s menovkou miesta je nepovinný a prázdny rad sa nekreslí.
   * Rozlišuje sa dĺžkou — kód má jeden znak, názov pohoria vždy viac.
   */
  const revealPlaceStat = (trail: HeroTrail): TripStat | null => {
    const mountains = (trail as HeroTrail & { mountains?: string }).mountains;
    if (mountains) return { value: mountains };
    const region = trail.region ?? '';
    return region.length > 2 ? { value: region } : null;
  };

  /**
   * ── KEDY SA VYRÁŽA — JEDEN RIADOK PRE TRI PRESNOSTI (2026-08-31) ───────────────────────
   * Plán nesie termín v troch tvaroch (`addtrip/planDate.ts`): presný deň · týždeň · mesiac.
   * Odpočet dní má zmysel LEN pri presnom dni — „vyrážaš o 12 dní" pri pláne na september
   * je číslo, ktoré nikto nepovedal, a plán môže rovnako dobre padnúť na 30. deň mesiaca.
   * Pri zvyšných dvoch sa preto vypíše samotný termín cez `planDateLabel()`, teda ten istý
   * tvar, aký ukazuje karta plánu a TripSpotlight — jeden termín sa nesmie na dvoch
   * obrazovkách písať dvakrát inak.
   *
   * ⚠️ Dátum v minulosti (plán založený spätne) tiež padá na termín — záporný odpočet by
   *    znel ako chyba appky.
   */
  const planWhenLine = (dateStr: string): string => {
    const weekLbl = (n: number) => t('pack.addTrip.plan.whenWeekN', { n: String(n) });
    const p = parsePlanDate(dateStr);
    if (!p) return t('pack.reveal.plan.noDate');
    if (p.precision === 'exact') {
      const start = planStart(dateStr);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const day = new Date(`${start}T00:00:00`);
      const n = Math.round((day.getTime() - today.getTime()) / 86400000);
      if (n === 0) return t('pack.reveal.plan.today');
      if (n === 1) return t('pack.reveal.plan.tomorrow');
      if (n > 1) return t('pack.reveal.plan.inDays' + pluralKey(n), { n });
    }
    return t('pack.reveal.plan.term', { term: planDateLabel(dateStr, weekLbl) });
  };

  /**
   * ── REVEAL PO NAPLÁNOVANÍ (Matej 2026-08-31) ──────────────────────────────────────────
   * „musíme doplniť REVEAL pri PLANE lebo žiadny nie je" (28. 8.) — človek prešiel celým
   * sprievodcom a vrátil sa na mapu bez jediného slova.
   *
   * Je to TÁ ISTÁ obrazovka ako po zápise, s dvoma rozdielmi:
   *  · body sú PREDPOVEĎ (`~`), lebo za plán sa nedáva nič (Matej 25. 8.: „body za plán = 0"),
   *  · level sa nehýbe ⇒ `levelBefore === levelAfter` ⇒ scéna s konfetami sa nespustí
   *    (Matej 31. 8.: „ano rovnaký ale bez konfiet"). Vypínač navyše by bol druhé pravidlo
   *    o tej istej veci.
   *
   * ⚠️ ODHAD JE ZÁMERNE SPODNÁ HRANICA. Ráta sa len to, čo z nakreslenej trasy vieme isto:
   *    pridanie + prejdenie + km + prevýšenie + prvé pohorie/NP/CHKO/voda/krajina. Hodnotenie
   *    labkami (3) a odkazy na mape (až 9) sa dejú AŽ pri zápise, takže sa nesľubujú — číslo
   *    smie po prejdení vyskočiť vyššie, ale nikdy nesmie klesnúť pod to, čo appka povedala.
   *
   * ⚠️ `km` sa NEBERIE z `planTrail.km` — ten je pri pláne natvrdo '0' (viď zápis plánu nižšie).
   *    Berie sa z geometrie, teda z toho istého čísla, aké človek videl v sprievodcovi.
   */
  const openPlanRevealFor = (planTrail: HeroTrail, draft: AddTripDraft, km: number) => {
    const walkedBefore = allTrails.filter((tr) => walkedIds.has(tr.id));
    const before = computeCompletion(walkedBefore);
    const after = computeCompletion([planTrail, ...walkedBefore]);
    const gained = (key: 'ranges' | 'parks' | 'chko' | 'waters') => {
      const n = (c: typeof before) => c.categories.find((x) => x.key === key)?.done.length ?? 0;
      return n(after) > n(before);
    };
    const countriesBefore = new Set(walkedBefore.map((tr) => tr.country).filter(Boolean));

    const points = calculateTripPoints({
      kind: draft.geometry.kind === 'route' ? 'trail' : 'place',
      km,
      ascentM: draft.ascentM ?? 0,
      added: true,
      walked: true,
      newRange: gained('ranges'),
      newNp: gained('parks'),
      newChko: gained('chko'),
      newWater: gained('waters'),
      newCountry: !!planTrail.country && !countriesBefore.has(planTrail.country),
    });

    const stats = [
      km > 0 ? { value: km.toFixed(1), unit: 'km' } : null,
      draft.ascentM ? { value: String(draft.ascentM), unit: 'm ↑' } : null,
      revealPlaceStat(planTrail),
    ].filter(Boolean) as TripStat[];

    setReveal({
      tripName: planTrail.name,
      tripMeta: stats.map((x) => [x.value, x.unit].filter(Boolean).join(' ')).join(' · '),
      tripStats: stats,
      tripPhoto: planTrail.photos?.[0] ?? draft.photos?.[0] ?? null,
      points,
      levelBefore: levelInfo,
      // ⚠️ TEN ISTÝ LEVEL DVAKRÁT — to je celý „bez konfiet". Bez toho by sa `levelAfter`
      //    pri renderi dolial z aktuálneho `levelInfo`; dnes je zhodný, ale prvá zmena,
      //    ktorá by plánu pripísala čokoľvek, by spustila päťsekundovú scénu s odmenou.
      levelAfter: levelInfo,
      plan: { whenLine: planWhenLine(draft.dateKind === 'flexible' ? '' : (draft.date ?? '')) },
    });
  };

  const submitAddTripDraft = (draft: AddTripDraft): boolean => {
    // ── DOPĹŇANIE KONCEPTU ──────────────────────────────────────────────────────────────
    // Existujúci záznam sa PREPÍŠE. Nový `HeroTrail` tu nevzniká, `walkedIds` sa nedotýkame
    // (výlet je prejdený od prvého uloženia) a reveal sa NEOTVÁRA: body boli pripísané vtedy,
    // druhý reveal by za tú istú prácu sľuboval druhú odmenu.
    const finishId = (draft as AddTripDraft & { finishTripId?: string }).finishTripId;
    if (finishId) {
      const patch: Partial<HeroTrail> = {
        name: draft.name.trim(),
        stars: draft.paws ?? 0,
        surface: draft.surface ?? [],
        crowd: draft.crowd ?? '',
        tags: draft.tags ?? [],
        desc: draft.note ?? '',
        ...(draft.diff ? { diff: draft.diff } : {}),
        ...(draft.photos?.length ? { photos: draft.photos } : {}),
        // POSÁDKA (2026-08-25). Ukladá sa POČET, nie zoznam psov: karta výletu sa pýta
        // „koľko Dogypťanov tadiaľ prešlo", nie „ktorí". Mená psov patria autorovi, nie trase.
        // Platí pre nový výlet aj pre dopĺňanie konceptu — inak by dopísaný výlet psa stratil.
        ...(draft.crew?.length ? { dogs: draft.crew.length } : {}),
        ...(draft.dateKind !== 'flexible' && draft.date ? { date: draft.date } : {}),
      };
      if (!updateLocalTrail(finishId, patch)) {
        setAddError(t('pack.map.errorPhotosStorage'));
        return false;
      }
      setAddError('');
      setLocalTrails(readLocalTrails());
      // Hlas nesie náročnosť a ruch pre celý pack — dopísané hodnoty musia dôjsť aj sem,
      // inak by karta výletu tvrdila niečo iné než filtre nad tými istými dátami.
      if ((draft.paws ?? 0) > 0) {
        setVotes((prev) => ({ ...prev, [finishId]: {
          ...(prev[finishId] ?? { tripId: finishId, comment: '', hazards: [] as Hazard[] }),
          tripId: finishId, rating: draft.paws ?? 0,
          difficulty: (draft.diff ?? prev[finishId]?.difficulty ?? 'Moderate') as TripVote['difficulty'],
          crowd: seedCrowd({ crowd: draft.crowd } as HeroTrail) ?? prev[finishId]?.crowd ?? 'Calm',
          when: draft.date?.slice(0, 7) ?? prev[finishId]?.when ?? '',
          at: Date.now(),
        } }));
      }
      // ── PREJDENÝ PLÁN ────────────────────────────────────────────────────────────────
      // Dopĺňanie konceptu tu končí. Plán, ktorý sa práve odohral, musí navyše PRESTAŤ BYŤ
      // PLÁNOM — a to na každom povrchu, kde ako plán žije. Zrkadlo `deletePlannedTrip()`:
      // ak sa niektorý krok vynechá, výlet vyzerá zapísaný a zároveň stále naplánovaný.
      if ((draft as AddTripDraft & { finishFromPlan?: boolean }).finishFromPlan) {
        // 1. TRASA. Dopĺňanie ju nemení (je zamknutá), tu sa opraviť smie — takže ide von
        //    aj stopa, aj kotvy, aj prepočítané kilometre. `planPath` sa NEMAŽE: keby sa
        //    človek k výletu vrátil, sú to jediné kotvy, ktoré k čiare existujú.
        const line = draft.geometry.kind === 'route' ? (draft.geometry.snapPath ?? draft.geometry.path) : [];
        if (line.length >= 2) {
          updateLocalTrail(finishId, {
            path: line,
            km: (totalDistanceM(line) / 1000).toFixed(1),
            ...(draft.geometry.kind === 'route' && draft.geometry.path.length ? { planPath: draft.geometry.path } : {}),
          });
          setLocalTrails(readLocalTrails());
        }
        // 2. PREJDENÝ. Bez toho ostane na mape 🎯 (`isUnwalkedPlan` sa pýta presne na toto).
        setWalkedIds((prev) => { const n = new Set(prev); n.add(finishId); return n; });
        // 3. UŽ NIE JE V PLÁNE.
        setPlans((prev) => prev.filter((pl) => pl.tripId !== finishId));
        /**
         * ⚠️ UŽ SA NEODSTRAŇUJE Z TRIPLISTU, LEN PRESTÁVA BYŤ PLÁNOM (2026-08-26).
         * `removeMyTrip` tu stálo preto, aby ho `seedTriplistFromPlans()` pri ďalšom mounte
         * nezaložil naspäť ako nadchádzajúci. Lenže odkedy v tripliste stojí aj ZAPÍSANÝ
         * výlet (viď upsert nižšie v tejto funkcii), znamenalo to, že prejdený plán z neho
         * ako jediný zmizne — presne ten stav, na ktorý Matej ukázal vetou „po zápise výlet
         * nevidím v tripliste".
         * Prepis na solo/closed rieši oboje: seed pridáva len `if (all[p.tripId]) continue`,
         * teda existujúci záznam nechá na pokoji.
         */
        upsertMyTrip(finishId, {
          status: 'solo',
          openness: 'closed',
          date: draft.dateKind !== 'flexible' && draft.date ? draft.date : '',
        });
        // 4. POZVÁNKA SKONČILA. Inzerát „hľadám svorku" na výlet, ktorý sa už odohral, by
        //    volal ľudí na termín v minulosti.
        setEvents((prev) => prev.filter((e) => e.tripId !== finishId));
        // 5. ODMENA. Plán bol za nula bodov (Matejovo rozhodnutie 25. 8.) — zapísanie je prvá
        //    chvíľa, kedy si za tento výlet niečo zaslúži, takže reveal sa TU otvára.
        const walkedTrail = readLocalTrails().find((tr) => tr.id === finishId);
        if (walkedTrail) openRevealFor(walkedTrail, draft);
        setFinishTrailId(null);
        setFinishFromPlan(false);
        closeAdd();
        return true;
      }
      setFinishTrailId(null);
      closeAdd();
      return true;
    }
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
        // reveal si berie trasu zo zoznamu — pri existujúcom výlete žiadny nový záznam nevzniká
        const existing = allTrails.find((tr) => tr.id === tid);
        if (existing) openRevealFor(existing, draft);
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
        // KATEGÓRIA + CHIPY V JEDNOM POLI (§2.3 zadania, 2026-08-31). Chip z kroku 4 je
        // rovnocenná hodnota `acts` — filter, karta aj článok ho čítajú tou istou cestou
        // ako kategóriu, takže túra s táboriskom sa nájde pod VISIT bez druhého poľa.
        acts: [ACT_DATA_ID[draft.activity] ?? draft.activity, ...(draft.chips ?? [])],
        surface: draft.surface ?? [],
        crowd: draft.crowd ?? '',
        tags: draft.tags ?? [],
        author: firstName,
        // KEDY (2026-08-25). Dovtedy sa dátum zo sprievodcu zapisoval iba do hlasu
        // (`votes[tid].when`, teda mesiac) a bez labiek nikam — hoci je povinný na odoslanie.
        // Bez neho sa výlet nedal ani dopísať: dopĺňanie by si ho vypýtalo druhýkrát.
        // POSÁDKA (2026-08-25). Ukladá sa POČET, nie zoznam psov: karta výletu sa pýta
        // „koľko Dogypťanov tadiaľ prešlo", nie „ktorí". Mená psov patria autorovi, nie trase.
        // Platí pre nový výlet aj pre dopĺňanie konceptu — inak by dopísaný výlet psa stratil.
        ...(draft.crew?.length ? { dogs: draft.crew.length } : {}),
        ...(draft.dateKind !== 'flexible' && draft.date ? { date: draft.date } : {}),
        ...(draft.dateEnd ? { dateEnd: draft.dateEnd } : {}),
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
      /**
       * 🔴 ZAPÍSANÝ VÝLET MUSÍ BYŤ V TRIPLISTE (Matej 2026-08-26: „po zápise výlet nevidím
       * v tripliste").
       *
       * MY TRIPS číta VÝHRADNE `dogypt.triplist.v1` (`readTriplist()` v PackTriplist.tsx),
       * kým zápis končil len v `trp-local-trails` + `walkedIds`. Výlet teda vznikol, bol na
       * mape aj v štatistikách, ale v zozname „moje výlety" nebol — a nevyzeralo to ako
       * chyba, len ako prázdny zoznam.
       * Plán sa tam dostával (`addPlan` → `seedTriplistFromPlans`), zápis ako jediný nie.
       *
       * ⚠️ `openness: 'closed'` — zapísaný výlet sa už odohral, takže na ňom nemá čo visieť
       * pozvánka „hľadám partiu". Dátum ide z draftu; pri „nepamätám si" ostáva prázdny,
       * čo je pre triplist platný stav (radí sa medzi výlety bez dátumu).
       */
      upsertMyTrip(tid, {
        status: 'solo',
        openness: 'closed',
        date: draft.dateKind !== 'flexible' && draft.date ? draft.date : '',
      });
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
      openRevealFor(newTrail, draft);
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
      // ⚠️ `desc` BOLO NATVRDO PRÁZDNE (opravené 2026-08-25). Krok 2 plánu sa pýta „čo je
      // v pláne" a odpoveď sa doteraz zahodila pri ukladaní — pole, ktoré nikam nevedie.
      // Po prejdení sa ten istý text stáva základom príbehu výletu, takže sa musí dochovať.
      photos: [], seasons: [], desc: draft.note ?? '', dogNote: '',
      acts: [ACT_DATA_ID[draft.activity] ?? draft.activity, ...(draft.chips ?? [])], surface: [], crowd: '', tags: [],
      author: firstName,
      // POSÁDKA a DÁTUM na zázname plánu — nie ozdoba, ale podklad pre zápis po prejdení:
      // formulár sa nimi predvyplní, aby človek nevypisoval druhýkrát to, čo už povedal.
      // Dátum leží aj v `addPlan()` (triplist), ale ten pozná len plán, nie trasu.
      ...(draft.crew?.length ? { dogs: draft.crew.length } : {}),
      ...(draft.dateKind !== 'flexible' && draft.date ? { date: draft.date } : {}),
      ...(draft.dateEnd ? { dateEnd: draft.dateEnd } : {}),
      // KOTVY, NIE LEN STOPA. `path` vyššie je PRICHYTENÁ čiara (stovky bodov po chodníkoch),
      // z ktorej sa kliky spätne nedajú získať. Po prejdení sa ten istý plán otvára ako zápis
      // a človek smie trasu opraviť — bez kotiev by ju musel nakresliť odznova.
      ...(draft.geometry.kind === 'route' && draft.geometry.path.length ? { planPath: draft.geometry.path } : {}),
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
        // AKO SA TAM IDE — organizačná pomôcka inzerátu (Matej 2026-08-26). Na `HeroTrail`
        // to zámerne NIE JE: výlet definuje trasa, nie jeden spoločný odchod.
        // Vzniká, len keď je čo povedať; pri „idem sám" sa sem nedostane už z formulára
        // (celý blok je tam zašednutý) ani odtiaľto — táto vetva beží iba pri `isOpen`.
        ...(draft.travelMode || draft.travelFrom || draft.pickup
          ? { travel: {
              ...(draft.travelMode ? { mode: draft.travelMode } : {}),
              ...(draft.travelFrom ? { from: draft.travelFrom } : {}),
              ...(draft.pickup ? { pickup: true, seats: draft.pickupSeats ?? 1 } : {}),
            } }
          : {}),
      };
      setEvents((prev) => [ev, ...prev]);
    }
    // ODOZVA. Naplánovanie do 31. 8. 2026 nemalo žiadnu — sprievodca sa len zavrel.
    // ⚠️ PRED `closeAdd()`, rovnako ako pri zápise: zatvorenie sprievodcu zhasína jeho stav
    //    a reveal si z neho ešte berie podklad.
    openPlanRevealFor(planTrail, draft, totalDistanceM(anchor) / 1000);
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
  //
  // 2026-08-24 — KLIK NA PILULKU LEVELU OTVORÍ PANEL PÁSIEM, klik inde vedie ako doteraz na
  // triplist. Rozlišuje sa cieľom kliku, NIE vnoreným tlačidlom: `.trp-midentity` je `<button>`
  // a button vnútri buttonu je neplatné HTML (React to prepustí, prehliadač nie).
  // Bublina `title=` s rozpisom bodov zanikla — na dotykovom telefóne sa nedala vyvolať vôbec
  // a rozpad v nej bol zlepený do jedného riadku (Matej: „zvačši popup tak aby sa nemuselo
  // scrolovať a info boli vidno").
  const renderIdentity = () => (
    <button
      type="button"
      className="trp-midentity"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.trp-level-num')) { setLevelPanelOpen(true); return; }
        navigate('/pack/map/triplist?tab=stats');
      }}
    >
      {/* Avatar + prstenec postupu + číslo levelu na jeho okraji (Matej 2026-08-28).
          `tierVars` visí na obale, aby farbu pásma zdedil prstenec AJ číslo — dva prvky,
          jedna farba, jeden zdroj (`@/lib/packTiers`). */}
      <span className="trp-avwrap" style={tierVars(levelInfo.level)}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={RING_R} fill="none" strokeWidth={RING_SW}
            stroke="var(--tier-b,#E69E1A)" strokeOpacity={0.2} />
          <circle cx="50" cy="50" r={RING_R} fill="none" strokeWidth={RING_SW}
            stroke="var(--tier-b,#E69E1A)" strokeLinecap="round"
            strokeDasharray={`${(RING_C * levelInfo.pct) / 100} ${RING_C}`}
            transform="rotate(-90 50 50)" />
        </svg>
        {id.avatarUrl
          ? <img className="trp-mavatar" src={id.avatarUrl} alt="" />
          : <span className="trp-mavatar trp-mavatar--initial">{id.avatarInitial}</span>}
        <span
          className="trp-level-num trp-level-num--notch"
          style={tierVars(levelInfo.level)}
          aria-label={t('pack.map.levelAriaLabel', { level: levelInfo.level })}
        ><em>{levelInfo.level}</em></span>
      </span>
      <span className="trp-midentity-txt">
        <span className="trp-level">
          {/* 2026-08-09: rang ide cez i18n (`pack.map.rankPilgrim`), nie cez natvrdo anglické
              `levelInfo.rank` — to isté slovo ukazuje aj karta na `/pack` a v SK to má byť
              „Pútnik", nie „Pilgrim". */}
          <span className="trp-level-name">{t('pack.map.rankPilgrim')}</span>
          {/* Matej 2026-08-03: „to LVL ma ruší" → popisok preč, ostáva holé číslo.
              2026-08-28: pilulka z riadku ZMIZLA — číslo sedí na okraji avatara vyššie,
              takže rangu ostal celý riadok („zväčši slovo pútnik", 26. 8.). */}
        </span>
        {/* Mobil má na tomto mieste dva riadky s číslami — na 390 px sa slovo PÚTNIK
            aj s číslami do jedného bloku nezmestí (Matej 2026-08-28). CSS rozhoduje,
            ktoré z dvojice je vidieť; render je jeden pre obe šírky. */}
        <span className="trp-mstats2">
          <span><b>{fmtKm(walkedKm)}</b><i>{t('pack.map.statKm')}</i></span>
          <span><b>{walkedIds.size}</b><i>{t('pack.map.statTrips' + pluralKey(walkedIds.size))}</i></span>
        </span>
      </span>
    </button>
  );

  const renderStatusLeft = () => (
    <div className="trp-status-left">{renderIdentity()}</div>
  );

  const renderStatusCenter = () => (
    <div className="trp-status-center">
      {/* ⚠️ DVA SAMOSTATNÉ CHIPY, NIE JEDEN OBAL (Matej 2026-08-26, druhé kolo: „dva chipy mali
          ostať ale mali vyzerať ako chipy v dolnom nave aj farbou aj tvarom a dizajnom").
          Prvé čítanie zadania z nich spravilo jednu dosku so spoločným rámom — to je stavba
          CELÉHO navu, nie jeho položiek. Nepýtal si dosku, pýtal si pilulky. */}
      <button type="button" className="trp-stat-pill" onClick={() => navigate('/pack/map/triplist?tab=stats')} title={t('pack.map.tripStatsTitle')}>
        <img src={ICON('trophy')} alt="" />
        <b>{walkedIds.size} · {fmtKm(walkedKm)} km</b>
      </button>
      {/* Matej 2026-07-27: na mobile (a v kompaktnom desktope) je Triplist LEN ikonka — text
          by rozbil jednoriadkový status. Klikacia plocha, route aj title/aria zostávajú. */}
      {/* trp-triplist-btn = kotva pre sprievodcu po prvom zápise (MapCoach). Nesú ju OBE
          podoby tlačidla (PC lišta aj mobilná hlavička) — coach si z nich vyberie tú, ktorá
          je práve na obrazovke, takže nepotrebuje vedieť, na akej šírke beží. */}
      <button type="button" className="trp-stat-pill trp-stat-pill--icon trp-triplist-btn" onClick={() => navigate('/pack/map/triplist')} title={t('pack.map.openTriplist')} aria-label={t('pack.map.openTriplist')}>
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
  // `dark` je PARAMETER, nie konštanta (2026-08-26): tú istú funkciu volá tmavá mobilná
  // hlavička aj bledá PC hlavička. Zvonček má farby v INLINE štýloch, takže CSS skinu ich
  // neprebije bez `!important` na piatich miestach — lacnejšie je povedať komponentu pravdu.
  const renderHeaderRight = (dark = true) => (
    <div className="trp-headright">
      <PackNotifications dark={dark} layout="inline" className="trp-header-notif" last24h={id.packToday} total={id.packTotal} />
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
        // 🔴 ODYSEA JE VLASTNÁ PRIEHRADKA, NIE STUPEŇ (Matej 2026-08-27, §12.4 kánonu).
        //    ODYSEA vracia VŠETKY viacdňové bez ohľadu na náročnosť; ostatné stupne naopak
        //    viacdňové NEVRACAJÚ.
        //    ⚠️ PRIJATÝ DÔSLEDOK, ktorý Matej odklepol: dvojdňová ŤAŽKÁ túra sa pod HARD
        //    nenájde — je len pod ODYSEA. Bez toho by stála v oboch a filter by na jednu
        //    otázku odpovedal dvakrát.
        (heroDiff === ''
          || (heroDiff === 'Odyssey' ? isOdyssey(tr) : tr.diff === heroDiff && !isOdyssey(tr))) &&
        (heroCrowd === '' || tr.crowd === heroCrowd) &&
        (selectedCountry === '' || trailCountry(tr) === selectedCountry) &&
        // macro región (West/Center/East) filtruje cez REGION_OF[pohorie]; pohorie filtruje
        // priamo tr.region — kaskáda, oba nezávisle aplikovateľné.
        (heroMacroRegion === '' || REGION_OF[tr.region] === heroMacroRegion) &&
        // acts/tagy vedia na budúcich tripoch chýbať (typ acts?/tags? je optional) — bez poľa
        // filter NEvylučuje agresívne, radšej ukáže trip ako by ho stratil.
        // 🔴 VŠETKY kategórie výletu, nie len jeho identita (Matej 2026-08-27) — túra
        // s piknikom sa MUSÍ nájsť aj pod CHILL, inak by kategória ostala prázdna.
        (heroAct === '' || !tr.acts || tr.acts.length === 0 || isInCategory(tr.acts, heroAct)) &&
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
    // ⚠️ V PRIEHRADKE ODYSEA ROZHODUJE NÁROČNOSŤ (Matej 2026-08-27, §12.4: „ODYSEA ukáže
    // všetky viacdňové zoradené podľa náročnosti"). Je to jediná priehradka, kde sú všetky
    // výlety viacdňové, takže „putovanie naspodok" by tu zoradilo zoznam podľa ničoho.
    if (heroDiff === 'Odyssey') {
      const d = diffRank(a.tr.diff) - diffRank(b.tr.diff);
      if (d !== 0) return d;
      return b.tr.stars - a.tr.stars;
    }
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
    // KONCEPT — chýbajú povinné polia, takže výlet nejde von. Odvodzuje sa zo záznamu
    // (tripShared.tsx), neukladá sa; dopísanie ho zhasne samo.
    const draftMissing = tripDraftMissing(tr, memberIds);
    /**
     * ── PREČO JE TENTO VÝLET V TOMTO FILTRI (Matej 2026-08-31) ────────────────────────
     *
     * „človek klikne vo filtri chill a vyskočia mu kategórie vyklikané ako chill ale aj hike
     *  s chipom (označením-chill)"
     *
     * Filter číta VŠETKY kategórie výletu (`isInCategory`), odznak nesie JEDNU
     * (`primaryCategoryOf`) — takže pod VISIT sa objaví aj túra, ktorá nesie táborisko.
     * Bez tejto dvojice odznakov to vyzerá ako chyba filtra: „prečo mi pod VISIT svieti HIKE".
     * ⚠️ Ukazuje sa LEN počas filtrovania a LEN keď sa identita s filtrom rozchádza — inak
     * by každá karta niesla pilulku, ktorá nič nevysvetľuje.
     * ⚠️ Hodnota môže byť aj STARÁ aktivita ('picnic', 'overnight'), nielen nový chip: tie
     * v datasete ležia ďalej a do kategórie patria rovnako. Preto sa najprv skúsi chip
     * a až potom slovník aktivít.
     */
    const identity = primaryCategoryOf(tr.acts);
    const viaAct = heroAct !== '' && identity !== heroAct
      ? (tr.acts ?? []).find((a) => ACT_TO_CATEGORY[a] === heroAct)
      : undefined;
    const viaChip = viaAct ? CHIP_BY_ID[viaAct] : undefined;
    const viaLabel = viaAct
      ? (viaChip ? (t(`pack.map.chipLabel.${viaAct}`) === `pack.map.chipLabel.${viaAct}` ? viaChip.label : t(`pack.map.chipLabel.${viaAct}`)) : t(`pack.map.activityLabel.${viaAct}`))
      : '';
    return (
      <div
        key={tr.id}
        ref={withRef ? (el: HTMLDivElement | null) => { heroCardRefs.current[tr.id] = el; } : undefined}
        className={`trp-bigcard${hoverId === tr.id || inlineDetailId === tr.id ? ' hot' : ''}`}
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
                onClick={(e) => {
                  e.stopPropagation();
                  /* ⚠️ VLASTNÝ NEPREJDENÝ PLÁN IDE TRIPFLOWOM, NIE POPUPOM (Matej 2026-08-25).
                        `toggleWalked` otvorí malý popup na náročnosť a ruch — to je tretia cesta
                        k tomu istému zápisu a nevie o značkách, fotkách ani príbehu. Prejdený
                        plán sa má otvoriť ako zápis s predvyplnenou trasou. Odznačiť (`on`)
                        ostáva na `toggleWalked` — to je návrat, nie zápis. */
                        if (isUnwalkedPlan && isMine) { openWalkPlan(tr.id); return; }
                  toggleWalked(tr.id);
                }}
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
              : draftMissing.length > 0
              ? <span className="trp-draftpill">📝 {t('pack.map.draftPill')}</span>
              : isWaterTrail(tr) ? null
              : <PhotoMetaPills agg={agg} km={tr.km} ascentM={(tr as { ascentM?: number }).ascentM} />}
          </div>
        </div>
        {/* MIESTO, KDE SA KONCEPT DOPÍŠE. Bez neho je „doplň neskôr" sľub bez adresy —
            človek by výlet našiel, ale nemal by kde pokračovať. Vypisuje sa AJ ČO CHÝBA:
            samotné „nedokončené" núti otvárať formulár, aby sa to zistilo.
            ⚠️ HNEĎ POD FOTKOU, nie na spodku karty: na mobile spodnú hranu karty prekrýva
            plávajúca lišta MAPA/PRIDAŤ, takže tam by veta aj tlačidlo ležali pod ňou. */}
        {draftMissing.length > 0 && (
          <div className="trp-draftrow" onClick={(e) => e.stopPropagation()}>
            <span className="trp-draftmiss">{t('pack.map.draftMissing', { fields: draftMissing.map((k) => t(k)).join(', ') })}</span>
            <button type="button" className="trp-draftbtn" onClick={(e) => { e.stopPropagation(); openFinishTrip(tr.id); }}>
              {t('pack.map.draftFinish')}
            </button>
          </div>
        )}
        {/* bod 3: telo karty = 2 stĺpce — vľavo 3 riadky (loc/název/autor), vpravo
            rating(packy)·difficulty·Crowd. */}
        <div className="trp-bigcard-body">
          <div className="trp-bigcard-info">
            {/* pohorie · región label pod fotkou (Matejov feedback bod 3) — región
                len keď je pohorie namapované cez REGION_OF (guard, nič sa nefabrikuje) */}
            {/* Pohorie je vlastné meno (neprekladá sa), macro región áno — inak stálo pod
                slovenským zoznamom „MALÉ KARPATY · WEST". Kľúče `pack.map.macroRegion.*`. */}
            <div className="trp-bigcard-loc">{tr.region}{REGION_OF[tr.region] ? ` · ${t(`pack.map.macroRegion.${REGION_OF[tr.region]}`)}` : ''}</div>
            {viaAct && (
              <div className="trp-bigcard-why">
                <span className="trp-cbadge">
                  <span className="trp-cbadge-e" style={{ fontFamily: FONT_EMOJI }}>{ACT_EMOJI[identity] ?? ''}</span>
                  {t(`pack.map.activityLabel.${identity}`)}
                </span>
                <span className="trp-cbadge trp-cbadge--via">
                  <span className="trp-cbadge-e" style={{ fontFamily: FONT_EMOJI }}>{ACT_EMOJI[viaAct] ?? ''}</span>
                  {viaLabel}
                </span>
              </div>
            )}
            <div className="trp-bigcard-name">{tr.name}</div>
          </div>
          {/* PODPISOVÝ RIADOK (Matej 2026-08-26): „rozdelíme to na 2 riadky — prvý riadok názov,
              treba zväčšiť text, druhý riadok fotka a meno autora a vedľa hodnotenie, malým
              písmom." Hodnotenie prestalo byť pravým STĹPCOM karty a stalo sa poznámkou vedľa
              autora, takže názov dostal celú šírku a smie vážiť.
              autor = svorka čo prešla trip; „+N Dogyptians" = walkeri nad zakladateľov
              (Matej 2026-07-22 — walked count sa presunul sem z crowd stĺpca). */}
          <div className="trp-bigcard-foot">
            <div className="trp-bigcard-authorrow">
              <AuthorAvatars author={authorOf(tr)} size={16} />
              <button
                type="button"
                className="trp-bigcard-author trp-authorbtn"
                onClick={(e) => { e.stopPropagation(); setCreatorTrail(tr); }}
              >{t('pack.map.byAuthor', { author: authorOf(tr) })}{others > 0 ? ` · ${t('pack.map.plusDogyptians' + pluralKey(others), { n: others })}` : ''}</button>
            </div>
            {/* Plán = žiadne hodnotenie (výlet sa neodohral).
                rating = 0 znamená ŽIADNY hlas (Matej 2026-08-03: „neprešli = žiadny rating"). */}
            {!isUnwalkedPlan && agg.rating > 0 && <BigRating rating={agg.rating} count={agg.walkedCount} mini />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`trp-root${mobileView === 'list' ? ' mlist-active' : ''}`}>
      <style>{CSS}</style>
      <style>{PALE_CSS}{PALE_MOBILE_CSS}{PALE_ADD_CSS}</style>
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
          // ⚠️ KATEGÓRIE, NIE SUROVÉ `acts` (2026-08-27) — piknik aj nocľah sú CHILL a chip
          // by inak stál dvakrát. Zároveň je to ten istý zoznam, podľa ktorého výlet nachádza
          // filter: karta tak povie, prečo sa pod CHILL našla túra.
          const dtChips = [
            ...categoriesOf(dt.acts).map((c) => ({ key: `a:${c}`, label: t(`pack.map.activityLabel.${c}`), emoji: ACT_EMOJI[c] ?? '' })),
            // Chipy kroku 4 vedľa kategórií — kategória hovorí ČO VÝLET JE, chip ČO SME TAM
            // ROBILI. `chipsOf()` prepustí len skutočné chipy, staré 'picnic'/'overnight'
            // ostávajú iba v kategórii (nemajú vlastný preklad).
            ...chipsOf(dt.acts).map((ch) => ({
              key: `c:${ch.id}`,
              label: t(`pack.map.chipLabel.${ch.id}`) === `pack.map.chipLabel.${ch.id}` ? ch.label : t(`pack.map.chipLabel.${ch.id}`),
              emoji: ch.emoji,
            })),
            // 'In the middle of nature'/'nowhere' zrušené (Matej 2026-07-26) — filter aj tu, nielen
            // v TAG_VOCAB, lebo dtChips číta dt.tags priamo (surová dátová hodnota, nie cez TAG_VOCAB).
            ...(dt.tags ?? []).filter((tg) => tg !== 'In the middle of nature' && tg !== 'In the middle of nowhere').map((tg) => ({ key: `t:${tg}`, label: tg, emoji: TAG_EMOJI[tg] ?? '' })),
          ];
          const dtAgg = crowdAggregate(dt, votes[dt.id]);
          const isUnwalkedPlan = dt.id.startsWith('plan-') && !walkedIds.has(dt.id);
          const isMine = authorOf(dt) === firstName;
          // AKO SA TAM IDE — z môjho ŽIVÉHO inzerátu na tento výlet. Zavretý (`closed`)
          // sa nepočíta: kto sa už nemôže pridať, nepotrebuje vedieť, odkiaľ sa vyráža.
          // Po prejdení plánu inzerát zaniká (submitAddTripDraft), takže riadok zhasne sám.
          const dtTravel = isUnwalkedPlan
            ? events.find((e) => e.tripId === dt.id && e.hostIsMe && !e.closed)?.travel
            : undefined;
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
                        onClick={() => {
                          // Rovnaká vidlica ako na karte — viď komentár tam.
                          if (isUnwalkedPlan && isMine) { openWalkPlan(dt.id); return; }
                          toggleWalked(dt.id);
                        }}
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
                    {/* ── AKO SA TAM IDE (2026-08-26) ──────────────────────────────
                        Doprava · odkiaľ · voľné miesta. Zdroj je INZERÁT (`events`), nie
                        výlet: Matej 26. 8. — „doprava sa nikde inde nezapisuje, je to len
                        organizačná pomôcka eventripu… ukladá sa len to, čo definuje samotný
                        trip". Preto sa aj zobrazuje len dovtedy, kým inzerát žije.
                        ⚠️ STOJÍ TU, NIE NA KARTE V ĽAVOM ZOZNAME. Neprejdený plán do toho
                        zoznamu zámerne nepatrí (filter vyššie: „len na mapu, do Events
                        a Triplistu"), takže riadok by tam bol mŕtvy. */}
                    {dtTravel && (
                      <div className="trp-bigcard-travel">
                        {dtTravel.mode && (
                          <span>
                            <b style={{ fontFamily: FONT_EMOJI, fontWeight: 400 }}>{TRAVEL_EMOJI[dtTravel.mode] ?? ''}</b>
                            {' '}{t(`pack.addTrip.plan.travel.${dtTravel.mode}`)}
                          </span>
                        )}
                        {dtTravel.from && <span>{dtTravel.from}</span>}
                        {dtTravel.pickup && (
                          <span className="trp-bigcard-seats">
                            {t('pack.map.planSeats' + pluralKey(dtTravel.seats ?? 1), { n: dtTravel.seats ?? 1 })}
                          </span>
                        )}
                      </div>
                    )}
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
                    : <BigRating rating={dtAgg.rating} count={dtAgg.walkedCount} />}
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
                {/* `authorRating`/`authorName` = to isté, čo v článku (`PackTripArticle.tsx`):
                    hodnotenie autora je `trail.stars` a počíta sa ako JEDNO hodnotenie.
                    Bez toho by tá istá sekcia hlásila na dvoch povrchoch dve rôzne čísla.
                    Magistrála je výnimka — `stars` je tam redakčná hodnota, nie hlas chodca. */}
                <TripComments
                  tripId={dt.id}
                  tripName={dt.name}
                  walked={walkedIds.has(dt.id)}
                  onMarkWalked={() => markWalked(dt.id)}
                  onRequestWalk={() => setWalkedPopupId(dt.id)}
                  authorRating={dt.diff === 'Odyssey' ? 0 : (dt.stars ?? 0)}
                  authorName={authorOf(dt)}
                />
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
                      onConfirm={() => { void deletePlannedTrip(dt.id); }}
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
            {/* DVA OVLÁDACIE PRVKY V ROHU (Matej 2026-08-26: „vedľa filtru hore dajme ešte
                druhý filter, resp. vlajku"). Krajina bola do teraz prvým z troch rozbaľovačiek
                v rade pod kategóriami, kde si brala tretinu šírky na dva znaky — a rad tým
                ostal len na dve skutočné voľby. V rohu je z nej ikonka a v rade sa uvoľnilo
                miesto pre TAGY, ktoré prišli z horného panela. */}
            <div className="trp-greet-tools">
            <CountryFlagDropdown
              countries={availableCountries}
              value={selectedCountry}
              onPick={applyCountry}
            />
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
            {/* KRAJINA TU UŽ NIE JE — vlajka sa presťahovala do rohu k filtru (2026-08-26).
                Rad drží tri VOĽBY OBSAHU: kde · čo sa tam dá robiť · aké to je. */}
            {/* F1 (Matej 2026-07-24): „Preč »all ranges« — zbytočne komplikované." → druhostupňový
                dropdown POHORÍ zrušený, filtruje sa len makro-regiónom West/Center/East. Pohorie
                ostáva viditeľné na karte tripu (trp-bigcard-loc), len sa podľa neho nefiltruje. */}
            {/* ⚠️ RAD JE PÄŤ ROZBAĽOVAČIEK NA JEDNEJ OBRAZOVKE A VŠETKY MAJÚ TEN ISTÝ PANEL
                (Matej 2026-08-26: „dropdowny treba zosúladiť — niektoré sú tmavé").
                Región a Aktivity boli do teraz natívne <select>-y: pole papyrusové, ale zoznam
                po rozkliknutí čierny, lebo ho kreslí prehliadač podľa color-scheme z index.html.
                Prepnúť ich na light by síce zoznam zosvetlilo, ale vedľa vlastných panelov
                Náročnosti a Návštevnosti by to boli aj tak dva rôzne vzhľady. */}
            {(selectedCountry === '' || selectedCountry === 'sk') && (
            <TripPickDropdown
              label={t('pack.map.region')}
              anyLabel={t('pack.map.anyRegion')}
              value={heroMacroRegion}
              onPick={(v) => setHeroMacroRegion(v as typeof heroMacroRegion)}
              options={MACRO_REGIONS.map((r) => ({ value: r, label: t(`pack.map.macroRegion.${r}`) }))}
            />
            )}
            {/* Aktivity ostávajú EMOJI (lock 2026-08-14 — „nie emoji nechaj tak!"). Mení sa
                len povrch, na ktorom stoja: vlastný panel namiesto systémového zoznamu. */}
            <TripPickDropdown
              label={t('pack.map.activities')}
              anyLabel={t('pack.map.anyActivity')}
              value={heroAct}
              onPick={(v) => setHeroAct(v as typeof heroAct)}
              options={TRIP_ACTIVITIES.map((a) => ({
                value: a.id,
                label: t(`pack.map.activityLabel.${a.id}`),
                icon: <span className="trp-pickdd-emoji" style={{ fontFamily: FONT_EMOJI }}>{ACT_EMOJI[a.id]}</span>,
              }))}
            />
            {/* TAGY PRIŠLI Z HORNÉHO PANELA (Matej 2026-08-26). Patria k tomu, čo VÝLET JE —
                teda k regiónu a aktivite — nie k tomu, ako sa mapa prehliada. Hore ostalo
                hľadanie miesta, náročnosť a návštevnosť. */}
            <TripTagsDropdown tags={heroTags} onToggle={toggleTag} onClear={() => setHeroTags(new Set())} />
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
      <div className="trp-mheader" ref={mheaderRef}>
        {/* 2026-08-03 (Matej: „na mobil je toho veľa... potrebujem to vylepšiť tak aby to viac
            dýchalo"): mobilný status riadok UŽ NIE JE zdieľaný trojdielny split z desktopu.
            Desktop (.trp-topbar) ostáva 1:1 ako bol („na PC je to v skutku fajn"), mobil dostal
            vlastnú štruktúru — riadok 1 = ČISTÁ IDENTITA, nič iné:
              [avatar] PILGRIM Lvl 15            [✉ 🔔]
                       64 trips · 1550 km
            Trophy pilulka (TRIPSTATS) zanikla — číslo žije ako podriadok pod menom, takže
            ubudol celý prvok a údaj ostal viditeľný bez ťuknutia. Klik na celý blok vedie tam,
            kam viedla pilulka (/pack/map/triplist?tab=stats).
            ADD TRIP je na plávajúcom FAB nad mapou (.trp-mfab) — v hornom rohu bol horšie
            dosiahnuteľný palcom. TRIPLIST bol vtedy odsunutý do LIST pohľadu, ale 28. 8. 2026
            sa VRÁTIL sem: uvoľnilo sa miesto po slove PÚTNIK a po podriadku pod ním.
            Avatar sa sem VRACIA (Matej: „Hor pri PILGRIM z lavej strane musí byť FOTO/avatar
            užívateľa") — v D4 nav reworku 2026-07-24 bol odsťahovaný do PackBottomNav; tam
            zostáva ako navigácia, tu je identita, nie duplicita ovládania. */}
        <div className="trp-mheader-status">
          {/* tá istá identita ako na PC — `renderIdentity()` vyššie */}
          {renderIdentity()}
          {/* TRIPLIST sa 2026-08-28 VRACIA do hlavičky (Matej: „daj tam triplist a hotovo").
              Miesto naň vzniklo tým, že odišlo slovo PÚTNIK aj jednoriadkový podriadok pod ním.
              Zo zoznamu (`.trp-mlist-head`) zmizol — dva vstupy do tej istej routy na jednej
              obrazovke by boli duplicita, nie dostupnosť. */}
          <button
            type="button"
            className="trp-stat-pill trp-stat-pill--icon trp-mtriplist trp-triplist-btn"
            onClick={() => navigate('/pack/map/triplist')}
            title={t('pack.map.openTriplist')}
            aria-label={t('pack.map.openTriplist')}
          >
            <img src={ICON('clipboard')} alt="" />
          </button>
          {renderHeaderRight()}
        </div>
        <div className="trp-mheader-row2">
          <div className="trp-mapsearch">
            <img src={ICON('globe')} alt="" />
            <input
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
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
        {/* ── KATEGÓRIA: VÝLETY / PODUJATIA (2026-09-01) ──────────────────────────────
            `setActiveCat('events')` malo do dnes JEDINÉ volanie — pilulku `.trp-catpill`
            v `.trp-sidebar`, a ten je pod PALE_PC_MIN `display:none`. Na telefóne sa teda
            ku kategórii PODUJATIA nedalo dostať vôbec: ani k zoznamu (EventsPanel
            + EventsView v `.trp-mlist`), ani k PINOM NA MAPE (kreslia sa len pri
            `activeCat === 'events'`). Nebola to regresia — bolo to tak, odkedy mobilná
            vetva vznikla; bledý šat to len zviditeľnil.
            PREČO POD HLAVIČKOU a nie v zozname: kategória neprepína len zoznam, prepína aj
            MAPU, takže v MAPOVOM pohľade by sa k podujatiam nedalo dostať nikdy — tá istá
            diera, len menšia. Hlavička je jediné miesto viditeľné v OBOCH pohľadoch a je to
            tá istá poloha ako na PC, kde pilulky stoja hore v paneli. Jeden model, dva tvary.
            PREČO NIE vedľa LIST/MAP: tá dvojica hovorí *ako sa pozerám*, nie *na čo sa
            pozerám*, a je centrovaná ako celok — tretí prvok jej rozbije os.
            SERVICES tu zámerne NIE JE: na PC je to vypnutá pilulka `soon`, na 390 px by
            zabrala tretinu šírky a nerobí nič. */}
        <div className="trp-mheader-cats" role="tablist">
          <button type="button" role="tab" aria-selected={activeCat === 'trips'} className={activeCat === 'trips' ? 'on' : ''} onClick={() => setActiveCat('trips')}>{t('pack.map.catTrips')}</button>
          <button type="button" role="tab" aria-selected={activeCat === 'events'} className={activeCat === 'events' ? 'on' : ''} onClick={() => setActiveCat('events')}>{t('pack.map.catEvents')}</button>
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
              {/* 🔴 ŽIADNE NATÍVNE <select> V TOMTO PANELI (Matej 2026-08-28: „zmeň všetky dropdowny
                  aby boli také isté bledé… systémové bledé nie tmavé ako je teraz").
                  Natívny select otvára SYSTÉMOVÝ zoznam — na telefóne v tmavom režime čierny —
                  a CSS ho neovplyvní ani o pixel. Bledý sa dá dostať jedine tak, že zoznam
                  kreslíme my; preto všetkých päť filtrov prešlo na TripPickDropdown, ten istý
                  komponent, aký nesie náročnosť. */}
              <div className="trp-msheet-pair">
                <div className="trp-msheet-field trp-msheet-field--pick">
                  <span className="trp-msheet-label">{t('pack.map.country')}</span>
                  <TripPickDropdown
                    label={t('pack.map.country')}
                    anyLabel={t('pack.map.all')}
                    placeholder={t('pack.map.all')}
                    anyIcon={<span aria-hidden>🌍</span>}
                    value={selectedCountry}
                    onPick={applyCountry}
                    options={availableCountries.map((c) => ({
                      value: c,
                      label: c.toUpperCase(),
                      icon: <span aria-hidden>{flagEmoji(c)}</span>,
                    }))}
                  />
                </div>
                {/* Región (West/Center/East) je SK-špecifický — rovnaká podmienka ako v paneli. */}
                {(selectedCountry === '' || selectedCountry === 'sk') && (
                  <div className="trp-msheet-field trp-msheet-field--pick">
                    <span className="trp-msheet-label">{t('pack.map.region')}</span>
                    <TripPickDropdown
                      label={t('pack.map.region')}
                      anyLabel={t('pack.map.allRegions')}
                      placeholder={t('pack.map.allRegions')}
                      value={heroMacroRegion}
                      onPick={(v) => setHeroMacroRegion(v as typeof heroMacroRegion)}
                      options={MACRO_REGIONS.map((r) => ({ value: r, label: t(`pack.map.macroRegion.${r}`) }))}
                    />
                  </div>
                )}
              </div>

              {/* AKTIVITA + POVRCH v jednom riadku (Matej 2026-08-28) — povrch bol dovtedy tri
                  chipy dole v mriežke značiek. Filtruje sa naďalej cez heroTags, mení sa len
                  ovládač; preto rozbaľovačka nepíše do nového stavu, ale prepína tie isté tagy. */}
              <div className="trp-msheet-pair">
                <div className="trp-msheet-field trp-msheet-field--pick">
                  <span className="trp-msheet-label">{t('pack.map.activity')}</span>
                  <TripPickDropdown
                    label={t('pack.map.activity')}
                    anyLabel={t('pack.map.activities')}
                    placeholder={t('pack.map.activities')}
                    value={heroAct}
                    onPick={(v) => setHeroAct(v as typeof heroAct)}
                    options={TRIP_ACTIVITIES.map((a) => ({
                      value: a.id,
                      label: t(`pack.map.activityLabel.${a.id}`),
                      icon: <span aria-hidden>{ACT_EMOJI[a.id]}</span>,
                    }))}
                  />
                </div>
                <div className="trp-msheet-field trp-msheet-field--pick">
                  <span className="trp-msheet-label">{t('pack.map.surface')}</span>
                  <TripPickDropdown
                    label={t('pack.map.surface')}
                    anyLabel={t('pack.map.anySurface')}
                    placeholder={t('pack.map.anySurface')}
                    value={SURFACE_TAGS.find((tg) => heroTags.has(tg)) ?? ''}
                    onPick={(v) => setHeroTags((prev) => {
                      // Rozbaľovačka je JEDNOVÝBEROVÁ, chipy boli viacvýberové — pri prepnutí
                      // preto najprv odídu všetky povrchy a až potom pribudne zvolený. Bez toho
                      // by v heroTags po pár prepnutiach ležali dva povrchy naraz a filter by
                      // nevrátil nič.
                      const next = new Set([...prev].filter((tg) => !IS_SURFACE.has(tg)));
                      if (v) next.add(v);
                      return next;
                    })}
                    options={SURFACE_TAGS.map((tg) => ({
                      value: tg,
                      label: t(TAG_I18N[tg]),
                      icon: TAG_EMOJI[tg] ? <span aria-hidden>{TAG_EMOJI[tg]}</span> : undefined,
                    }))}
                  />
                </div>
              </div>

              <div className="trp-msheet-pair">
                <div className="trp-msheet-field trp-msheet-field--pick">
                  <span className="trp-msheet-label">{t('pack.map.difficulty')}</span>
                  {/* 🔴 NÁROČNOSŤ NESIE NAŠU ZNAČKU, NIE EMOJI (Matej 2026-08-28: „máme svoje
                      vlastné ikonky nie emoji"). Kruh · štvorec · trojuholník = DiffMark
                      z tripShared.tsx, tá istá značka ako na karte, na mape aj v článku.
                      ⚠️ Natívny <select> ju uniesť NEVIE (<option> smie niesť len text) — preto
                      tu stojí TripPickDropdown, tá istá vlastná rozbaľovačka, akú z toho istého
                      dôvodu dostala náročnosť na PC 26. 8. Dva pokusy o emoji náhradu (🟡🔴🏕️,
                      potom 🟨🔺△) boli obchádzka toho istého obmedzenia a obe Matej zamietol. */}
                  <TripPickDropdown
                    label={t('pack.map.difficulty')}
                    anyLabel={t('pack.map.any')}
                    placeholder={t('pack.map.any')}
                    value={heroDiff}
                    onPick={(v) => setHeroDiff(v as typeof heroDiff)}
                    options={DIFF_KEYS.map((d) => ({
                      value: d,
                      label: t(`pack.map.diff.${d}`),
                      icon: <DiffMark diff={d} />,
                    }))}
                  />
                </div>
                <div className="trp-msheet-field trp-msheet-field--pick">
                  {/* D2 (LOCKED 2026-07-24): Crowd = Empty · Calm · Busy */}
                  {/* Emoji z CROWD_EMOJI (packCommunity.ts) — ten istý zdroj, aký kŕmi pilulku
                      na fotke aj formulár zápisu. */}
                  <span className="trp-msheet-label">{t('pack.map.crowd')}</span>
                  <TripPickDropdown
                    label={t('pack.map.crowd')}
                    anyLabel={t('pack.map.any')}
                    placeholder={t('pack.map.any')}
                    value={heroCrowd}
                    onPick={(v) => setHeroCrowd(v as typeof heroCrowd)}
                    options={CROWD_DATA_KEYS.map((sk) => ({
                      value: sk,
                      label: t(`pack.map.crowdLabel.${sk}`),
                      icon: <span aria-hidden>{CROWD_EMOJI[CROWD_KEY_TO_CROWD[sk]]}</span>,
                    }))}
                  />
                </div>
              </div>

              <div className="trp-msheet-field">
                <span className="trp-msheet-label">{t('pack.map.tags')}</span>
                <div className="trp-msheet-chips">
                  {/* Povrch tu už nie je — presťahoval sa do rozbaľovačky vedľa aktivity. */}
                  {TAG_VOCAB.filter((tag) => !IS_SURFACE.has(tag)).map((tag) => (
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

          `is-hidden` = kroky 1–2 (obrazovkou je MAPA) alebo práve prebiehajúce zapichovanie
          značky. Je to `display:none`, NIE unmount — formulár by inak stratil celý svoj
          interný stav vrátane nakreslenej trasy.

          ⚠️ ROVNAKO NA VŠETKÝCH ŠÍRKACH (Matej 2026-08-24: „prvé dva kroky by mali byť takisto
          na strede, dolný panel a až od 3. kroku ten ľavý panel… logika = kreslenie, všetko
          ostatné zmizne"). Do 24. 8. tu stálo `isNarrow &&`, takže PC kreslil do mapy s
          formulárom po boku a mobil bez neho — dva rôzne toky pre tú istú úlohu. O tvare
          rozhoduje odteraz KROK, nie šírka okna. */}
      {(!!addFlow || !!addEventFlow) && (
        <div className={`trp-addhost${addMapPhase !== 'off' || notePlaceReady ? ' is-hidden' : ''}`}>
          {addFlow ? (
            <AddTripLog
              finishTrail={finishTrailId ? (localTrails.find((tr) => tr.id === finishTrailId) ?? null) : null}
              fromPlan={finishFromPlan}
              allTrails={allTrails}
              authorName={firstName}
              myDogs={myDogsForAdd}
              onHasRoute={setAddHasRoute}
              onSubmit={submitAddTripDraft}
              onClose={closeAdd}
              /* Šípka na výbere aktivity vracia do popupu „čo pridávam" — je to krok späť,
                 nie východ (viď `onBackToEntry` v AddTripLog). Pri dopĺňaní konceptu a pri
                 prejdenom pláne sa sprievodca otvára BEZ popupu, takže tam sa vracať nemá
                 kam a šípka ostáva východom. */
              onBackToEntry={finishTrailId ? undefined : () => { closeAdd(); setAddEntryOpen(true); }}
              placeholderFor={placeholderFor}
              mapRef={leafletMapRef}
              seedPoint={seedPoint}
              onMapPhase={setAddMapPhase}
              onPlaceNote={(g, k) => { setNotePlacing(g); setPlacingKind(k ?? null); }}
              // MAZANIE Z CHIPU V ZHRNUTÍ KROKU 2 (Matej 2026-08-24). Ide to cez tú istú
              // cestu ako mazanie z mapy — jedna značka, jeden spôsob, ako zmizne.
              onRemoveNote={(id) => {
                void mapNotes.remove(id);
                setTripNotes((prev) => prev.filter((n) => n.id !== id));
              }}
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
              <FitBounds path={heroBounds} offset={!!inlineDetailId} dock={addMapPhase !== 'off'} hold={addHasRoute} />
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
                const dim = mapDrawing ? DRAW_TRAIL_DIM : 1;
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
              {/* SPACIE MIESTA (Matej 2026-08-27) — útulne, kempy, bivaky, chaty z OSM.
                  Lock z 21. 8. („emoji POI len v blogu") sa tým ZÚŽIL, nezrušil: pod
                  priblížením 15 tu naďalej nie je ani jeden OSM bod a mapa krajiny ostáva
                  príbehom o trasách. Nad ním odpovedá na otázku „čo je tu v okolí", ktorú
                  hľadanie podľa mena zodpovedať nevie — a kvôli ktorej Matej dosiaľ kopíroval
                  súradnice z mapy.cz.
                  Pramene a lavičky tu ZATIAĽ NIE SÚ — je ich 12 000 a 35 000, čo je iná liga
                  než 738 spacích miest; idú do tých istých dlaždíc, keď na ne príde rad.
                  Atribúcia (`<PoiAttribution />` nižšie) je podmienka licencie ODbL. */}
              {!isCleanMode && overlayOn.sleep && <PoiLayer tiles minZoom={SLEEP_MIN_ZOOM} />}
              {/* trip markery (pilulky s km, bodky-piktogramy, zhlukové bubliny s počtom) —
                  DOGYPT čistý vizuál (2026-08-04, Matej: „iba hmla a svetelné meče... žiadne
                  písmo ani vysvetlivky") ich celé skrýva, nesú číslo/piktogram na každom bode. */}
              {/* NÁZVY EXISTUJÚCICH TRÁS — len počas kreslenia, a v DOGYPT vrstve tiež
                  (Matej 2026-08-25: „DOGYPT vrstvu neriešme v súvislosti s tvorbou, je to len
                  funny pohľad kde bol pes"). Čistý vizuál skrýva písmo na PREZERANIE mapy;
                  pri kreslení je otázka „čo tu už je" dôležitejšia než jeho čistota. */}
              {mapDrawing && <DrawTrailNames points={mapPoints} onPick={setDrawPeek} />}
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
                  onDelete={(id) => {
                    // ⚠️ ZMAZANÁ ZNAČKA MUSÍ ZMIZNÚŤ AJ ZO ZOZNAMU V SPRIEVODCOVI (Matej
                    // 24. 8. 2026: „dal som parkovisko a potom som ho zmazal a v dolnom paneli
                    // je v pils pod preskočiť — nevymazalo sa"). `tripNotes` sa doteraz len
                    // dopĺňal pri vzniku značky; mazanie o ňom nevedelo, takže krok 2 aj
                    // zhrnutie v kroku 4 tvrdili, že tam parkovisko je.
                    // Kind sa musí prečítať PRED zmazaním — potom už riadok neexistuje.
                    const gone = mapNotes.notes.find((n) => n.id === id)?.kind;
                    void mapNotes.remove(id);
                    // Zmaže sa PRESNE TÁ značka, nie prvá s rovnakým druhom — od 24. 8. nesie
                    // zoznam aj `id`. Staršie rozrobené pridávanie ho nemá (`id: ''`), tam sa
                    // ako predtým zahodí prvý výskyt druhu.
                    if (addFlow && gone) {
                      setTripNotes((prev) => {
                        const byId = prev.findIndex((n) => n.id === id);
                        const i = byId >= 0 ? byId : prev.findIndex((n) => n.id === '' && n.kind === gone);
                        return i < 0 ? prev : [...prev.slice(0, i), ...prev.slice(i + 1)];
                      });
                    }
                  }}
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

            {/* ATRIBÚCIA OSM — PODMIENKA LICENCIE ODbL, nie dekorácia. Patrí ku každej mape,
                ktorá kreslí `<PoiLayer />`, a NESMIE sa dať vypnúť spolu s vrstvou: vypínač
                je o tom, čo chce človek vidieť, licencia o tom, čo smieme použiť.
                Stojí VŽDY, aj pod prahom priblíženia — dáta sú v appke tak či tak.

                ⚠️ `bottom: 34` NIE JE kozmetika. Vpravo dole už sedí `.trp-attr` (© Seznam.cz
                + logo Mapy.com, `bottom:10px`) — s východzím `bottom: 12` si obe atribúcie
                sadli NA SEBA a čitateľná nebola ani jedna. Dve rôzne licencie, dva zdroje,
                dva riadky nad sebou. Zistené meraním, nie odhadom. */}
            <PoiAttribution style={{ bottom: 34 }} />

            {/* Plusko s prstencom PRI KURZORE (Matej 2026-08-20) — nahradilo pevné
                tlačidlo v rohu, ktoré bolo slabo viditeľné a súperilo s tlačidlom
                PRIDAŤ o tú istú úlohu. Na dotyku sa nekreslí (kurzor neexistuje). */}
            {!isCleanMode && <MapNoteCursor map={mapInstance} hidden={noteBusy || !!notePlacing} />}
            {/* Kým je typ vybraný a čaká sa na klik, kurzor NESIE ZNAČKU, ktorá dopadne
                (Matej 2026-08-27). Plusko sa v tej chvíli skrýva — pozývalo by do druhého
                zápisu uprostred prvého. */}
            {!isCleanMode && notePlaceReady && (
              <MapPlaceCursor map={mapInstance} group={notePlacing!} kind={placingKind} ready={noteZoom >= noteMinZoom} />
            )}

            {/* ── NÁHĽAD EXISTUJÚCEJ TRASY POČAS KRESLENIA (2026-08-25) ──────────────────
                Odpoveď na „čo je to za trasu", nie otvorenie výletu. Stojí NAD dokom
                (`DOCK_VH`), takže neprekrýva ovládanie kreslenia ani AInubisa hore.
                Zavrieť sa dá krížikom aj ťuknutím na inú pilulku — a kreslenie medzitým beží. */}
            {drawPeek && (
              <div className="trp-peek" role="dialog" aria-label={drawPeek.name}>
                <button type="button" className="trp-peek-x" onClick={() => setDrawPeek(null)} aria-label={t('pack.map.closePeek')}>×</button>
                {/* ⚠️ AINUBIS SA MUSÍ OZVAŤ (Matej 2026-08-25: „ainubis by sa mal ozvať a pri kliku
                    na inú trasu napísať — prešiel si túto istú trasu? nekresli ju znova iba ju
                    zapíš"). Karta bez tejto vety len POPISUJE cudziu trasu; s ňou POVIE, čo s tým
                    človek má spraviť — a to je celý dôvod, prečo počas kreslenia vôbec je. */}
                <div className="trp-peek-ainubis">
                  <img src={ainubisFace} alt="" width={30} height={30} />
                  <span>{t('pack.map.peekAinubis')}</span>
                </div>
                <div className="trp-peek-name">{drawPeek.name}</div>
                <div className="trp-peek-row">
                  {drawPeek.diff && (
                    <><span className="trp-peek-diff" style={{ background: DIFF_COLOR[drawPeek.diff] }} />{t(`pack.map.diff.${drawPeek.diff}`)}<span className="trp-peek-sep">·</span></>
                  )}
                  {drawPeek.km} km
                  {typeof drawPeek.ascentM === 'number' && drawPeek.ascentM > 0 && (
                    <><span className="trp-peek-sep">·</span>↑ {drawPeek.ascentM} m</>
                  )}
                  {/* Čas je ODHAD tou istou normou ako pri kreslení (`lib/tripTime.ts`) — inak by
                      tá istá trasa mala dve rôzne čísla podľa toho, kde sa na ňu človek pozrie.
                      Klesanie sa berie ako rovné stúpaniu: drvivá väčšina výletov končí tam,
                      kde začala (okruh alebo tam-a-späť), a hádať to presnejšie by bolo klamstvo
                      o presnosti. */}
                  {formatTripTime(estimateTripMinutes(parseFloat(drawPeek.km) || 0, drawPeek.ascentM ?? null, drawPeek.ascentM ?? null)) && (
                    <>
                      <span className="trp-peek-sep">·</span>
                      {formatTripTime(estimateTripMinutes(parseFloat(drawPeek.km) || 0, drawPeek.ascentM ?? null, drawPeek.ascentM ?? null))}
                    </>
                  )}
                </div>
                {drawPeek.elev && drawPeek.elev.length > 1 && (
                  <div className="trp-peek-elev">
                    <ElevationProfile elev={drawPeek.elev} km={parseFloat(drawPeek.km) || 0} />
                  </div>
                )}
                {/* DVE VOĽBY, OBE ROVNAKO DOSTUPNÉ. Zapísanie je zlaté, lebo je to odporúčaná
                    cesta — ale „kreslím vlastnú" nie je schované v krížiku: dve trasy z toho
                    istého parkoviska sú bežná vec a človek, ktorý naozaj išiel inam, nesmie mať
                    pocit, že ho appka presviedča o opaku. */}
                <div className="trp-peek-acts">
                  <button
                    type="button"
                    className="trp-peek-go"
                    onClick={() => {
                      const tid = drawPeek.id;
                      // Poradie je dôležité: najprv sa ukončí kreslenie, až potom sa zapíše
                      // prejdenie. `toggleWalked` otvára ponuku hodnotenia a tá by inak vyskočila
                      // nad rozkreslenou mapou — teda presne to „otvorí sa niečo iné", proti
                      // ktorému stojí lock z 23. 8.
                      setDrawPeek(null);
                      closeAdd();
                      if (!walkedIds.has(tid)) toggleWalked(tid);
                      else navigate(tripPath(drawPeek));
                    }}
                  >
                    {t(walkedIds.has(drawPeek.id) ? 'pack.map.peekOpen' : 'pack.map.peekWalked')}
                  </button>
                  <button type="button" className="trp-peek-mine" onClick={() => setDrawPeek(null)}>
                    {t('pack.map.peekMine')}
                  </button>
                </div>
              </div>
            )}

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
                {/* VÝREZ (Matej 2026-08-26): doska hlavičky nezačína pri leme — ľavá časť
                    ostáva holé zlato a identita stojí priamo na ňom. Preto je zvyšok riadku
                    zabalený: doska je REÁLNY prvok, nie vrstva pozadia, lebo má zaoblený
                    ľavý okraj a gradient roh nezaoblí.
                    ⚠️ Mimo bledého PC skinu je wrapper `display:contents`, teda z layoutu
                    zmizne úplne — tmavá vetva (aj mobilná hlavička, ktorá volá tie isté
                    render funkcie) sa nemení ani o pixel. */}
                <div className="trp-status-plate">
                  {renderStatusCenter()}
                  {/* messages + zvonček → pravý roh TOHTO bloku (Matej 2026-07-24/26).
                      Inline layout = v toku, nie fixed. */}
                  {renderHeaderRight(MAP_SKIN !== 'pale')}
                </div>
              </div>
              <div className="trp-topsearchrow">
                <div className="trp-floatsearch" ref={placeBoxRef}>
                  <div className="trp-mapsearch">
                    <img src={ICON('globe')} alt="" />
                    <input
                      value={placeQuery}
                      onChange={(e) => setPlaceQuery(e.target.value)}
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
                            setMapTarget({ ll: [s.lat, s.lon], zoom: placeZoom(s.type) });
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
                {/* Náročnosť nesie ZNAČKU, nie emoji (Matej 2026-08-26) — tú istú, akú má bod
                    na mape aj pilulka na fotke. Preto vlastná rozbaľovačka, viď
                    TripPickDropdown. */}
                <TripPickDropdown
                  label={t('pack.map.difficulty')}
                  anyLabel={t('pack.map.any')}
                  value={heroDiff}
                  onPick={(v) => setHeroDiff(v as typeof heroDiff)}
                  options={DIFF_KEYS.map((d) => ({
                    value: d,
                    label: t(`pack.map.diff.${d}`),
                    icon: <DiffMark diff={d} />,
                  }))}
                />
                {/* bod 2 (iterácia 15) → D2 2026-07-24: "Popularity" → "Vibe" → "Crowd" (Empty/Calm/Busy) */}
                {/* Emoji sa berie z CROWD_EMOJI (packCommunity.ts) — ten istý zdroj, aký kŕmi
                    pilulku na fotke aj formulár zápisu. Do 26. 8. si ho preklad niesol vlastný
                    a rady sa rozišli (👣 tu znamenalo „rušné", v tagoch „lesný chodník"). */}
                <TripPickDropdown
                  label={t('pack.map.crowd')}
                  anyLabel={t('pack.map.any')}
                  value={heroCrowd}
                  onPick={(v) => setHeroCrowd(v as typeof heroCrowd)}
                  options={CROWD_DATA_KEYS.map((sk) => ({
                    value: sk,
                    label: t(`pack.map.crowdLabel.${sk}`),
                    icon: <span className="trp-pickdd-emoji" style={{ fontFamily: FONT_EMOJI }}>{CROWD_EMOJI[CROWD_KEY_TO_CROWD[sk]]}</span>,
                  }))}
                />
                {/* Tagy sa 2026-08-26 vrátili do ľavého panela (.trp-georow) — sem prišli
                    2026-07-27 z chip-riadku, ale hore stoja filtre PREHLIADANIA (kde som,
                    ako ťažké, koľko ľudí), kým tag hovorí, ČO ten výlet je. */}
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
          dock={!!addFlow}
          onSubmit={async (n) => {
            const id = await mapNotes.add(n);
            // Krok 2 sprievodcu: druh si odloží formulár, aby ho krok 4 vedel ZHRNÚŤ.
            // Väzba na výlet sa neukladá — odvodzuje sa zo súradnice (mapNotesGeo.ts).
            // `n.kind` (čo sa naozaj uložilo), nie `noteDraft.kind` z uzáveru — panel vie druh
            // zmeniť vlastným výberom a zhrnutie musí hovoriť o zapísanej značke.
            if (addFlow) setTripNotes((prev) => [...prev, { id, kind: n.kind }]);
            setNoteDraft(null);
            /* ── PO ZÁPISE SA VRACIA PANEL (Matej 2026-08-28) ──────────────────────────
               „Po poslednom kliku, ako som dal tip a dal Pridať, sa to pridalo a myš
                zostala pripravená na ďalší tip… a nie je žiadna možnosť ísť ďalej = BUG.
                Ak človek označí tip, tak sa mu otvorí ľavý panel, aby vedel pokračovať."

               ⚠️ RUŠÍ TO „PO ZÁPISE OSTÁVAM V OZNAČOVANÍ" z 27. 8. Vtedajší zámer bol
               správny („kto značí parkoviská, značí ich viac"), ale nosič zlý: označovanie
               drží trp-draw-lock, teda stav, v ktorom panel — a s ním chipy, zoznam
               položených značiek aj cesta ĎALEJ — nestojí nikde. Zo zápisu sa tak stala
               slučka bez východu; jediným únikom bolo × v bubline, čo vyzerá ako zrušenie.
               Druhá značka toho istého druhu stojí odteraz JEDEN ťuk do chipu skupiny
               (od 27. 8. je chip celá akcia, nie prepínač), nie „celý výber odznova" —
               dôvod, pre ktorý auto-pokračovanie vzniklo, tým zaniká.
               placeNote označovanie vypína samo, takže tu nezostáva nič. */
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
          edgeLeft={!!addFlow}
          /* Prepínanie typu bez návratu do panela — len v sprievodcovi výletu (dôvod
             pri `onPickType` v AddMapNote.tsx). */
          onPickType={addFlow ? ((g, k) => { setNotePlacing(g); setPlacingKind(k); }) : undefined}
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

      {/* PANEL PÁSIEM — otvára ho klik na pilulku levelu v hlavičke (viď renderIdentity). */}
      {levelPanelOpen && (
        <LevelPanel level={levelInfo} rows={profilePoints.rows} onClose={() => setLevelPanelOpen(false)} />
      )}

      {/* ⚠️ AŽ KEĎ SA NEKRESLÍ. Sprievodca zatemní obrazovku, takže počas pridávania ďalšieho
          výletu by zhasol mapu presne vtedy, keď sa do nej klikne. */}
      {/* ⚠️ UKAZUJE NA TRIPLIST, NIE NA IDENTITU (Matej 2026-08-28: „tá bublinka musí ukazovať
          na triplist hore v nave"). Otázka po zápise znie „kde nájdem svoj výlet", a odpoveďou
          je zoznam výletov — nie profil s bodmi. Body a level sú druhá vec a majú vlastnú
          cestu (pilulka levelu). */}
      {coachOpen && addMapPhase === 'off' && !addFlow && (
        <MapCoach targetSel=".trp-triplist-btn" onDone={() => setCoachOpen(false)} />
      )}

      {/* REVEAL — `levelAfter` je AKTUÁLNY levelInfo, teda už prepočítaný po zápise.
          Preto sa nikdy nerozíde s číslom v hlavičke: je to tá istá hodnota. */}
      {reveal && (
        <TripReveal
          tripName={reveal.tripName}
          tripMeta={reveal.tripMeta}
          tripStats={reveal.tripStats}
          tripPhoto={reveal.tripPhoto}
          points={reveal.points}
          levelBefore={reveal.levelBefore}
          levelAfter={reveal.levelAfter ?? levelInfo}
          ownerAvatarUrl={id.avatarUrl}
          ownerInitial={id.avatarInitial}
          dogs={id.dogs.map((d) => ({
            id: d.id,
            name: d.dog_name ?? t('pack.map.myDogFallback'),
            photo: d.cloudinary_main_url,
          }))}
          draftMissing={(reveal.draftMissing ?? []).map((k) => t(k))}
          plan={reveal.plan}
          onFinishNow={reveal.tripId ? () => { const tid = reveal.tripId!; setReveal(null); openFinishTrip(tid); } : undefined}
          onAddAnother={() => { setReveal(null); openAddEntry(); }}
          // Sprievodca po zápise sa neotvorí tomu, kto si ho vypol (coachMuted) — inak by
          // „nabudúce nezobrazovať" nič neznamenalo. Kontrola je TU, nie v komponente: ten sa
          // má starať o to, ako vyzerá, nie o to, či má právo existovať.
          onClose={() => { setReveal(null); setCoachOpen(!coachMuted()); }}
        />
      )}
      {/* PackMap je full-bleed a nemountuje <PackLayout> (vlastný header/nav vyššie), takže
          overlay host (Inbox/Thread) sa mountuje aj tu priamo — inak by „Message owner"/„Open
          trip group" vyššie a Messages v zdieľanom PackBottomNav nemali kam otvoriť (viď
          komentár pri MessagingOverlayHost v PackLayout.tsx). */}
      <MessagingOverlayHost />
    </div>
  );
}
