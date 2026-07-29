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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Polygon, Marker, ScaleControl, useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapyTiles, MAPY_API_KEY } from '@/lib/env';
import { HERO_TRAILS, type HeroTrail } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { SVK_BORDER } from '@/data/svkBorder';
import { COUNTRY_BORDERS } from '@/data/countryBorders';
import { trailCountry, flagUrl, flagEmoji } from '@/lib/countryGeo';
import { PackBottomNav, HieroglyphBg, MessagingOverlayHost } from '@/components/pack/PackLayout';
import { PackNotifications } from '@/components/pack/PackNotifications';
import { TripComments } from '@/components/pack/trip/TripComments';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import {
  ICON, authorOf, REGION_OF, diffMarkShape, DIFF_MARK_CSS, DIFF_COLOR, WATER_COLOR, ElevationProfile,
  readLocalTrails, writeLocalTrails, readFavIds, writeFavIds, readWalkedIds, writeWalkedIds,
  ensureWalkedSeeded, FOUNDER_WALKED_JOURNEY_IDS,
} from '@/components/pack/tripShared';
import {
  crowdAggregate, mockEventsSeed, FOUNDER_WALKERS, seedCrowd, HAZARDS, HAZARD_EMOJI,
  readVotes, writeVotes, readPlans, writePlans, readEvents, writeEvents,
  type TripVote, type TripPlan, type PartnerEvent, type Hazard,
} from '@/components/pack/packCommunity';
import {
  COMMUNITY_CSS, BigRating, PhotoMetaPills, HazardTags, WalkedPopup, WishlistIntentPopup, PartnerAdForm, DMStub,
  EventsView,
  type WalkedInput, type PartnerAdInput,
} from '@/components/pack/packCommunityUI';
import { upsertMyTrip } from '@/components/pack/triplist/triplist'; // TRIPLIST (Slice A) — star popup upserts alongside the existing wishlist plan
// ADD TRIP flow (krok 9, plany/zadanie-addtrip-flow-2026-07-27.md §15 bod 8) — vytiahnuté z
// tohto súboru do vlastného adresára (§2 zadania). Portal len zapája vstupný popup + oba
// formuláre a konvertuje AddTripDraft → HeroTrail zápis (§3 tam), formuláre samotné sa needitujú.
import { AddTripEntry } from '@/components/pack/addtrip/AddTripEntry';
import { AddTripPlan } from '@/components/pack/addtrip/AddTripPlan';
import { AddTripLog } from '@/components/pack/addtrip/AddTripLog';
import type { AddTripDraft, TripState } from '@/components/pack/addtrip/addTripModel';

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

// bod 6 (iterácia 16): dva malé kruhové avatary (majiteľ + pes) pri "by {author}" riadku, karta
// aj inline detail. Seed dáta nemajú per-trip owner/dog foto — pes používa reálny Hekthor asset
// (public/images/about-hekthor.png, tá istá fotka čo /about stránka), majiteľ je initial-letter
// placeholder kruh (rovnaký vzor ako .trp-status-avatar fallback). FLAG: toto je vizuálny slot,
// reálne per-trip owner/dog fotky sú mimo rozsahu — potrebujú dátové polia, ktoré HeroTrail
// typ nemá (viď report).
const AUTHOR_DOG_AVATAR = '/images/about-hekthor.png';
function AuthorAvatars({ author, size }: { author: string; size: number }) {
  const pairStyle = { '--trp-av-size': `${size}px` } as React.CSSProperties;
  return (
    <span className="trp-avatarpair" style={pairStyle}>
      <span className="trp-avatarcircle" style={{ backgroundImage: `url('${AUTHOR_DOG_AVATAR}')` }} title="Dog (placeholder)" />
      <span className="trp-avatarcircle trp-avatarcircle--placeholder" title="Owner (placeholder)">
        {author.charAt(0).toUpperCase()}
      </span>
    </span>
  );
}

const diffRank = (d: string) => (d === 'Easy' ? 0 : d === 'Moderate' ? 1 : d === 'Hard' ? 2 : 3);

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
  // explore-1/2/3 v Cloudinary NEEXISTUJÚ — nateraz požičané z picnic (najbližší neutrálny
  // outdoor-spot vizuál, bez turistickej výbavy ako hiking-set). Matej má doplniť vlastné
  // explore-1/2/3.webp do pack/placeholders, potom vymeniť tento riadok.
  explore: [`${CLD}/picnic-1.webp`, `${CLD}/picnic-2.webp`, `${CLD}/picnic-3.webp`],
};
// vyber 1 z 3 stabilne podľa seedu (id tripu / názov) → variety naprieč kartami, ale nemení sa pri re-renderi
function placeholderFor(actIds: string[] | undefined, seed: string): string {
  const act = (actIds && actIds.find((a) => ACTIVITY_PLACEHOLDERS[a])) || 'hike';
  const arr = ACTIVITY_PLACEHOLDERS[act] || ACTIVITY_PLACEHOLDERS.hike;
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

// Ružový pin pre PLÁNOVANÉ výlety na mape (Matej 2026-07-24) — teardrop, odlíšený od trás.
const PLAN_PIN = L.divIcon({
  className: 'trp-planmarker',
  html: '<div class="trp-planmarker-dot"></div>',
  iconSize: [20, 20], iconAnchor: [10, 18],
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
const pointPicto = (p: MapPoint): string =>
  p.water ? waterWaves((p.tr as { waves?: number }).waves) : `<span class="trp-diffmark trp-diffmark--${diffMarkShape(p.tr.diff)}"></span>`;
const pointTypeClass = (p: MapPoint): string => (p.journey ? '--journey' : p.water ? '--water' : '');

// bod = pilulka (km, vodná plocha bez km nesie NÁZOV — zadanie 2.3) alebo bodka (17px, len
// piktogram) podľa vrstvy. iconSize/iconAnchor zámerne neuvedené — centrovanie cez CSS
// (left:-50%/top:-100%|-50%), rovnaký vzor ako pôvodný pillIcon/waterIcon.
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
const clusterIcon = (n: number) => {
  const s = n < 5 ? 30 : n < 12 ? 36 : 42;
  return L.divIcon({ className: 'trp-pinwrap', html: `<div class="trp-cluster" style="width:${s}px;height:${s}px;font-size:${n < 12 ? 12 : 13}px">${n}</div>` });
};

// vodná plocha = trip s aktivitou SUP/paddleboard → na mape 1 modrý bod (NIE čierny hike/trasa).
const isWaterTrail = (tr: { acts?: string[] }) => !!tr.acts?.includes('paddleboard') && !tr.acts?.includes('journey');
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
    const pad = mobile
      ? { paddingTopLeft: [28, 150] as [number, number], paddingBottomRight: [28, 150] as [number, number] }
      : { paddingTopLeft: [PANEL_W + 60, 130] as [number, number], paddingBottomRight: [90, 140] as [number, number] };
    map.fitBounds(bounds, { ...pad, animate: false, ...(offset ? { maxZoom: 14 } : {}) });
    // Matej 2026-07-23: celokrajinný pohľad bol „moc malý" → o JEDEN stupeň bližšie. DÔLEŽITÉ:
    // zoomovať okolo stredu VIDITEĽNEJ plochy (vpravo od panela, medzi topbarom a navom), nie
    // okolo stredu celého kontajnera — inak sa krajina posunie doľava ZA panel. setZoomAround
    // drží ten pixel fixný, takže po priblížení ostane centrovaná v okne. Len „celé SR".
    if (!offset) {
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
function metersPerPixel(lat: number, zoom: number) {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}
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
    const cell = tier === 0 ? 58 : 48;
    const buckets = new Map<string, MapPoint[]>();
    // Diaľkové sa NEZHLUKUJÚ, kým nesú km (Matej 2026-07-27) — majú vyzerať dôležito a vzácne,
    // a pohltenie do bubliny s počtom by ich z mapy zmazalo. Mimo toho pásma (celá Európa) sú to
    // už len bodky a zhlukujú sa ako všetko ostatné — inak sa na seba nakopia.
    const solo: MapMarkerItem[] = vis.filter((p) => pointIsPill(p, zoom)).map((p) => ({ kind: 'single', p }));
    vis.filter((p) => !pointIsPill(p, zoom)).forEach((p) => {
      const pt = map.latLngToContainerPoint([p.lat, p.lon]);
      const key = `${Math.floor(pt.x / cell)}:${Math.floor(pt.y / cell)}`;
      let bucket = buckets.get(key);
      if (!bucket) { bucket = []; buckets.set(key, bucket); }
      bucket.push(p);
    });
    return solo.concat(Array.from(buckets.values()).map((g): MapMarkerItem => (g.length === 1
      ? { kind: 'single', p: g[0] }
      : {
          kind: 'cluster',
          lat: g.reduce((s, p) => s + p.lat, 0) / g.length,
          lon: g.reduce((s, p) => s + p.lon, 0) / g.length,
          count: g.length,
        })));
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
.trp-toprow-select,.trp-tagdd-btn{flex:1 1 140px;min-width:120px;background:${T.glass};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid ${T.onDarkBorder};border-radius:12px;padding:10px 15px;box-shadow:0 6px 22px rgba(0,0,0,0.4);color:${T.onDark};font-family:inherit;font-size:13px;cursor:pointer;outline:0;}
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
.trp-mapsearch input{background:transparent;border:0;outline:0;color:${T.onDark};font-size:13.5px;width:100%;font-family:inherit;}
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
/* LEVEL (Matej 2026-07-26): NIE pilulka — holý text v status riadku. „Zatraktívnené" cez
   typografiu, nie cez rámik. Tri role, tri roly písma (Matej 2026-07-26 „ten level si odflákol"
   — pôvodne bolo všetko Cinzel, takže tam nebol žiadny kontrast, len rozdiel veľkostí):
     PÚTNIK = rang → FONT_TITLE (identita)
     LVL    = eyebrow → FONT_UI 500 / .26em ako .religion-eyebrow v Entry.tsx
     1      = číslo → FONT_UI 600, veľké, gold gradient
   Gradient ide cez background-clip:text (glyf je transparentný) → glow MUSÍ byť
   filter:drop-shadow, text-shadow by presvital cez dieru v glyfe. */
.trp-level{display:inline-flex;align-items:baseline;gap:9px;flex-shrink:0;padding-right:2px;white-space:nowrap;}
.trp-level-name{font-family:${FONT_TITLE};font-weight:700;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:rgba(245,240,228,0.92);}
.trp-level-num{display:inline-flex;align-items:baseline;gap:5px;font-family:${FONT_UI};line-height:1;background:linear-gradient(135deg,#F5C73D,#E69E1A);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 7px rgba(245,199,61,0.35));}
.trp-level-num i{font-style:normal;font-weight:500;font-size:9px;letter-spacing:.26em;text-transform:uppercase;}
.trp-level-num em{font-style:normal;font-weight:600;font-size:21px;letter-spacing:0;}
/* CTA tlačidlo → Cinzel ostáva: .btn-gold (SpiralLanding.css) je LOCKED brand CTA a ten je
   Cinzel 700 uppercase. Grotesk sem nepatrí. */
.trp-addtrip-btn{flex-shrink:0;display:inline-flex;align-items:center;gap:5px;font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:9px 16px;border-radius:8px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border:1px solid rgba(250,244,236,0.3);cursor:pointer;white-space:nowrap;}
.trp-addtrip-btn:hover{filter:brightness(1.05);}
/* Dva labely CTA (Matej 2026-07-27): plný „Add trip" na širokom desktope, skrátený „Add"
   v kompaktnom desktope a na mobile — tam sa musí celý status riadok zmestiť do JEDNÉHO
   riadku. Prepínajú sa v media queries nižšie; default = plný. */
.trp-addtrip-short{display:none;}
/* Modálny filter sheet skrýva plávajúci AINUBIS launcher — viď komentár pri useEffect vyššie. */
body.trp-sheet-open .ainubis-launcher{display:none;}
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
.trp-cat-pills{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;}
/* Kategórie (Trips/Events/Places/Services) sú nadpisy sekcií, nie dáta → FONT_TITLE. */
.trp-catpill{width:100%;padding:12px 8px;border-radius:10px;border:1px solid rgba(245,240,228,0.22);background:rgba(245,240,228,0.07);font-family:${FONT_TITLE};font-weight:700;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:rgba(245,240,228,0.78);cursor:pointer;white-space:nowrap;transition:all .15s;text-align:center;}
.trp-catpill.on{background:linear-gradient(135deg,#F5C73D,#E69E1A);border-color:rgba(250,244,236,0.3);color:#1c160c;box-shadow:0 4px 14px rgba(201,154,63,0.3);}
.trp-catpill.soon{border-style:dashed;opacity:.5;cursor:default;position:relative;}
.trp-catpill.soon:hover{opacity:.8;}
.trp-catpill.soon::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:${T.panelGrad};border:1.5px solid ${T.cardEdge};color:${INK};font-family:${FONT_UI};font-size:10px;font-weight:600;padding:5px 10px;border-radius:10px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s;box-shadow:${T.panelShadow};z-index:5;}
.trp-catpill.soon:hover::after{opacity:1;}

/* country select — flag + 3-letter code; native <select> so the dropdown escapes
   the panel's overflow:hidden cleanly (no popover-clip risk). Only SK enabled. */
.trp-country-select,.trp-filter-select{width:100%;min-width:0;background:rgba(245,240,228,0.05);border:1px solid rgba(245,240,228,0.16);border-radius:9px;padding:8px 9px;color:rgba(245,240,228,0.85);font-family:inherit;font-size:11.5px;cursor:pointer;outline:0;}
.trp-country-select:focus,.trp-filter-select:focus{border-color:${GOLD};}
/* geo kaskáda (Matejov feedback bod 4, iterácia 7; Pohorie vrátené iterácia 9; Activity
   presunutá sem 2026-07-27): country (malinký, flag+kód) → región (West/Center/East) →
   activity. Flexbox namiesto grid-u 3 pevných stĺpcov, lebo activity musí ostať v riadku
   aj keď je región skrytý (mimo SK) — grid s 3 stĺpcami by vtedy nechal prázdnu medzeru. */
.trp-georow{display:flex;gap:7px;}
.trp-georow .trp-country-select{flex:0 0 72px;padding:8px 6px;}
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
.trp-planmarker-dot{width:16px;height:16px;border-radius:50% 50% 50% 0;background:#FF5FA2;border:2.5px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 7px rgba(0,0,0,0.5);}
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
.trp-drawhint{position:absolute;top:152px;left:calc(50% + ${PANEL_W / 2}px);transform:translateX(-50%);z-index:750;background:rgba(178,38,30,0.94);backdrop-filter:blur(10px);border:1.5px solid rgba(255,124,112,0.7);border-radius:12px;padding:13px 22px;box-shadow:0 12px 34px rgba(120,20,14,0.5);display:flex;align-items:center;gap:14px;max-width:calc(100vw - ${PANEL_W + 60}px);}
.trp-drawhint-txt{font-size:15px;font-weight:600;color:#fff;white-space:nowrap;}
.trp-drawhint-actions{display:flex;gap:8px;flex-shrink:0;}
.trp-drawhint-actions button{font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:${GOLD};background:none;border:none;cursor:pointer;text-decoration:underline;}

/* ── mobile-only surfaces (header/list/toggle/ADD overlay), hidden on desktop — see the
   ≤760px media query below for their real layout (bod 5 i11, bod 4 i14). ── */
.trp-mheader,.trp-mtoggle,.trp-mlist,.trp-madd,.trp-madd-drawbtn{display:none;}

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
/* bod 2 (iterácia 12): Terrain/Satellite/Winter stack → JEDNO kruhové tlačidlo, prepína
   len outdoor↔aerial (Winter úplne preč, aj z mapStyle typu aj z mapyTiles volania). */
.trp-stylebtn{width:38px;height:38px;border-radius:50%;background:${CARD};border:1px solid rgba(201,154,63,0.45);box-shadow:0 3px 10px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.trp-stylebtn:hover{border-color:${GOLD};}
.trp-stylebtn img{width:18px;height:18px;filter:brightness(0) saturate(0);opacity:.75;}
.trp-zoomgroup{display:flex;flex-direction:column;background:${CARD};border:1px solid rgba(201,154,63,0.45);border-radius:9px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,0.4);}
.trp-zoomgroup button{background:none;border:none;cursor:pointer;width:38px;height:36px;font-size:17px;font-weight:600;line-height:1;color:${INK};display:flex;align-items:center;justify-content:center;}
.trp-zoomgroup button:first-child{border-bottom:1px solid rgba(31,26,14,0.12);}
.trp-zoomgroup button:hover{background:rgba(201,154,63,0.12);}
.trp-locatebtn{width:38px;height:38px;border-radius:9px;background:${CARD};border:1px solid rgba(201,154,63,0.45);box-shadow:0 3px 10px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.trp-locatebtn:hover{border-color:${GOLD};}
.trp-locatebtn img{width:18px;height:18px;filter:brightness(0) saturate(0);opacity:.7;}
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
.trp-pill{position:relative;left:-50%;top:-100%;display:inline-flex;align-items:center;gap:5px;background:linear-gradient(180deg,rgba(23,20,14,.94),rgba(11,9,6,.94));color:#F6F1E4;font-family:${FONT_UI};font-weight:600;font-size:10.5px;padding:5px 9px 5px 7px;border-radius:999px;border:1px solid rgba(201,154,63,0.55);box-shadow:0 2px 7px rgba(0,0,0,0.34);white-space:nowrap;transition:all .15s;}
.trp-pill.hot{background:linear-gradient(135deg,#F5C73D,#E69E1A);color:#1c160c;border-color:rgba(250,244,236,0.55);box-shadow:0 0 0 3px rgba(245,199,61,0.3),0 4px 12px rgba(0,0,0,0.6);}
/* diaľkové (journey) — 2026-07-27: #E01B22 → stlmená bordová (Matej "stlmiť odtiene"); voda
   ostáva jasne modrá (.trp-pill--water nižšie), lebo stlmenie by oslabilo novú asociáciu. */
/* Matej 2026-07-27: „ten piktogram by sme mohli zväčšiť — nech vyzerá dôležito, vzácne, teraz je
   nenápadný". Diaľkové sú na mape rarita (10 z 67) a jediné nesú km aj z diaľky → väčšie písmo,
   viac priestoru, plný zlatý prsteň (bežné pilulky majú lem na 55 % — zlatý RING je vyhradený
   práve im) a väčší trojuholník náročnosti. */
.trp-pill--journey{background:linear-gradient(135deg,#8C1C22,#4a0f13);color:#fff;font-size:11.5px;padding:5px 10px 5px 8px;gap:6px;border-width:1.5px;border-color:${GOLD};box-shadow:0 0 0 2px rgba(201,154,63,0.20),0 3px 10px rgba(0,0,0,0.42);}
.trp-pill--journey.hot{background:linear-gradient(135deg,#8C1C22,#4a0f13);border-color:#fff;box-shadow:0 0 0 4px rgba(245,199,61,0.45),0 4px 14px rgba(0,0,0,0.6);}
.trp-pill--journey .trp-diffmark--triangle{border-bottom-color:#fff;border-left-width:5.5px;border-right-width:5.5px;border-bottom-width:10px;}
.trp-pill--journey .trp-diffmark--circle,.trp-pill--journey .trp-diffmark--square{background:#fff;}
/* vodná plocha — bez stlmenia (zadanie 2.5). Väčšina plôch nemá km → pilulka nesie NÁZOV
   (viď pointIcon), vlnky vo vnútri = rovnaká krivka ako pôvodný .trp-waterdot. */
.trp-pill--water{background:${WATER_COLOR};color:#fff;border-color:rgba(255,255,255,0.55);}
.trp-pill--water.hot{background:${WATER_COLOR};border-color:#fff;box-shadow:0 0 0 3px rgba(46,111,214,0.35),0 4px 12px rgba(0,0,0,0.6);}
/* bodka (z<=9, zadanie 2.3) — 17px kruh, rovnaký glass+zlatý lem ako pilulka, len piktogram. */
.trp-dot{position:relative;left:-50%;top:-50%;display:flex;align-items:center;justify-content:center;width:17px;height:17px;border-radius:50%;background:linear-gradient(180deg,rgba(23,20,14,.94),rgba(11,9,6,.94));border:1px solid rgba(201,154,63,0.55);box-shadow:0 2px 6px rgba(0,0,0,0.32);transition:transform .12s;}
.trp-dot.hot{background:linear-gradient(135deg,#F5C73D,#E69E1A);border-color:rgba(250,244,236,0.55);}
.trp-dot--journey{background:linear-gradient(135deg,#8C1C22,#4a0f13);border-color:rgba(201,154,63,0.5);}
.trp-dot--journey.hot{background:linear-gradient(135deg,#8C1C22,#4a0f13);border-color:#fff;}
.trp-dot--journey .trp-diffmark--triangle{border-bottom-color:#fff;}
.trp-dot--journey .trp-diffmark--circle,.trp-dot--journey .trp-diffmark--square{background:#fff;}
/* vodná bodka — zachováva pôvodný .trp-waterdot hover-pop (jediný CSS :hover efekt v pôvodnom
   kóde), teraz na zdieľanej .trp-dot základni. */
.trp-dot--water{background:${WATER_COLOR};border-color:rgba(255,255,255,0.55);}
.trp-dot--water:hover{transform:scale(1.12);}
.trp-dot--water.hot{background:${WATER_COLOR};border-color:#fff;}
/* zhluk (zadanie 2.4) — rovnaký glass+zlatý lem, veľkosť rastie s počtom bodov (clusterIcon). */
.trp-cluster{position:relative;left:-50%;top:-50%;display:flex;align-items:center;justify-content:center;border-radius:999px;font-family:${FONT_UI};font-weight:600;color:#F6F1E4;background:linear-gradient(180deg,rgba(23,20,14,.95),rgba(11,9,6,.95));border:1px solid rgba(201,154,63,0.6);box-shadow:0 3px 12px rgba(0,0,0,0.45);cursor:pointer;transition:transform .12s;}
.trp-cluster:hover{transform:scale(1.09);}
/* farebná legenda mapy — floating vpravo dole, nad Dev nav / atribúciou */
.trp-legend{position:absolute;right:12px;bottom:54px;z-index:600;display:flex;flex-direction:column;gap:4px;background:rgba(20,20,20,0.82);backdrop-filter:blur(6px);padding:8px 11px;border-radius:12px;border:1px solid rgba(255,255,255,0.14);box-shadow:0 4px 14px rgba(0,0,0,0.45);font-family:${FONT_UI};font-weight:500;font-size:10.5px;color:#fff;letter-spacing:.06em;pointer-events:none;}
.trp-legrow{display:flex;align-items:center;gap:7px;}
.trp-legdot{width:12px;height:12px;border-radius:50%;flex:0 0 auto;border:1.5px solid rgba(255,255,255,0.5);}
.trp-legdot--hike{background:#141414;}
.trp-legdot--journey{background:#E01B22;}
.trp-legdot--water{background:${WATER_COLOR};}
/* plánovaný trip = ružový teardrop pin (zhoduje sa s .trp-planmarker-dot na mape) */
.trp-legdot--planned{background:#FF5FA2;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border-color:#fff;}
/* bod 2 (iterácia 17): live "{km} km" label pri konci kreslenej trasy (ADD flow draw) —
   rovnaká centrovacia technika ako .trp-pill (left:-50%/top:-100%), o kúsok vyššie (-10px
   extra gap), nech nesedí priamo na poslednom bode trasy. */
.trp-drawlabel{position:relative;left:-50%;top:calc(-100% - 10px);background:rgba(6,5,3,0.92);color:${GOLD};font-family:${FONT_UI};font-weight:600;font-size:10.5px;padding:4px 10px;border-radius:999px;border:1.5px solid ${GOLD};box-shadow:0 3px 10px rgba(0,0,0,0.5);white-space:nowrap;}
${DIFF_MARK_CSS}

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
  .trp-ctlstack{top:calc(env(safe-area-inset-top,0px) + 106px);right:12px;gap:7px;}

  .trp-stylebtn{width:34px;height:34px;}
  .trp-stylebtn img{width:16px;height:16px;}
  .trp-zoomgroup button{width:34px;height:32px;font-size:15px;}
  .trp-locatebtn{width:34px;height:34px;}
  .trp-locatebtn img{width:16px;height:16px;}

  .trp-drawhint{left:50%;max-width:calc(100vw - 40px);top:calc(env(safe-area-inset-top,0px) + 106px);}

  /* bod 1 (iterácia 13, prestavané i15): mobilný header = 2 riadky — (1) status (avatar +
     renderStatusRight() pilulky, ako desktop .trp-status-row) + (2) search+dropdowny+filter
     (i12 bod 7). .trp-mheader je teraz column namiesto jedného riadku. */
  .trp-mheader{display:flex;flex-direction:column;gap:8px;position:absolute;top:0;left:0;right:0;z-index:900;background:${T.glass};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid ${T.onDarkBorder};padding:calc(env(safe-area-inset-top,0px) + 10px) 10px 10px;}
  /* Matej 2026-07-27: status riadok sa musí zmestiť do JEDNÉHO riadku — LEVEL · staty ·
     triplist(ikonka) · Add · správy+zvonček. Preto flex-wrap:nowrap; overflow-x:auto je len
     poistka pre <350px zariadenia (nech sa radšej dá odscrollovať, než aby to zalomilo). */
  .trp-mheader-status{display:flex;align-items:center;gap:6px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;}
  .trp-mheader-status::-webkit-scrollbar{display:none;}
  /* Matej 2026-07-27 (druhé kolo): LEVEL vľavo, stred (staty/triplist/add) naozaj centrovaný
     v riadku — ako na desktope (flex:1 na krajných blokoch). min-width:max-content namiesto
     0 drží krajné bloky nad ich obsahom, nech sa pri 390px nestlačia na nulu — pri nedostatku
     miesta prevezme overflow-x:auto (horizontálny scroll), nie kolaps stredu. */
  .trp-mheader-status .trp-status-left{flex:1 1 0;min-width:max-content;}
  .trp-mheader-status .trp-status-center{gap:6px;flex-wrap:nowrap;flex:0 0 auto;}
  .trp-mheader-status .trp-headright{gap:5px;flex:1 1 0;min-width:max-content;justify-content:flex-end;}
  /* PackNotifications má rozmery v inline style (38px) → prebiť sa dá len !important. */
  .trp-mheader-status .trp-header-notif button{width:32px!important;height:32px!important;}
  .trp-mheader-status .trp-stat-pill{gap:4px;padding:5px 8px;}
  .trp-mheader-status .trp-stat-pill img{width:11px;height:11px;}
  .trp-mheader-status .trp-stat-pill span,.trp-mheader-status .trp-stat-pill b{font-size:10px;}
  /* Triplist = len clipboard ikonka (Matej 2026-07-27: „triplist iba ikonka nie aj názov"). */
  .trp-mheader-status .trp-triplist-label{display:none;}
  .trp-mheader-status .trp-stat-pill--icon{padding:5px 7px;}
  /* LEVEL text zmenšený v rovnakom pomere ako pilulky, nech nepretlačí status riadok na mobile. */
  .trp-mheader-status .trp-level{gap:5px;}
  .trp-mheader-status .trp-level-name{font-size:10px;letter-spacing:.1em;}
  .trp-mheader-status .trp-level-num i{font-size:8px;}
  .trp-mheader-status .trp-level-num em{font-size:14px;}
  .trp-mheader-status .trp-addtrip-btn{padding:6px 10px;font-size:9.5px;gap:4px;}
  .trp-mheader-status .trp-addtrip-icon{width:10px;height:10px;}
  .trp-mheader-status .trp-addtrip-full{display:none;}
  .trp-mheader-status .trp-addtrip-short{display:inline;}
  /* Riadok 2 (Matej 2026-07-27, prestavané): predtým tu boli 3 natívne selecty
     (Activities/Difficulty/Crowd) v horizontálnom scrolli — a country, región a Tagy sa na
     mobile NEZOBRAZOVALI VÔBEC (žijú v .trp-sidebar / .trp-topbar, oboje display:none).
     Teraz: search + jedna „Filters · N" pilulka, ktorá otvára .trp-msheet so VŠETKÝMI
     filtrami (country, región, activity, difficulty, crowd, tagy, sort). */
  .trp-mheader-row2{display:flex;align-items:center;gap:8px;}
  .trp-mheader .trp-mapsearch{flex:1 1 auto;min-width:0;padding:7px 12px;border-radius:999px;}
  .trp-mheader .trp-mapsearch img{width:12px;height:12px;}
  .trp-mheader .trp-mapsearch input{font-size:12px;}
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
     bottom-sheet defaultne), klik prepína celú stránku na zoznam. */
  .trp-mtoggle{display:flex;position:absolute;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 78px);z-index:900;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:11px 26px;border-radius:999px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border:1px solid rgba(250,244,236,0.3);box-shadow:0 10px 30px rgba(0,0,0,0.4);cursor:pointer;}

  /* full-page card list — replaces the map (not an overlay) when mobileView==='list'.
     top padding sedí s výškou .trp-mheader (viď .trp-ctlstack vyššie). */
  .trp-mlist{position:absolute;inset:0;z-index:60;overflow-y:auto;background:#050505;padding:calc(env(safe-area-inset-top,0px) + 106px) 14px 100px;}
  .trp-root.mlist-active .trp-mapregion{display:none;}
  .trp-root.mlist-active .trp-mlist{display:block;}

  /* bod 4 (iterácia 14, krok 9 zachované): ADD TRIP full-screen overlay — .trp-sidebar (desktop
     ADD setup home) je tu display:none, tak AddTripPlan/AddTripLog bežia znova vo full-screen
     .trp-madd namiesto. */
  .trp-madd{display:flex;flex-direction:column;position:fixed;inset:0;z-index:950;background:#0a0a0a;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);}
  .trp-madd .trp-addsetup{background:transparent;}
  .trp-madd-drawbtn{display:block;width:100%;margin-top:2px;font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:11px;border-radius:9px;background:rgba(201,154,63,0.14);border:1px solid rgba(201,154,63,0.4);color:${GOLD};cursor:pointer;}
}

`;

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
  const [open, setOpen] = useState(false);
  const count = tags.size;

  return (
    <span className="relative inline-flex" style={{ flex: '1 1 140px', minWidth: 120 }}>
      <button
        type="button"
        className={`trp-tagdd-btn${count > 0 ? ' on' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Tags"
      >
        <span>{count > 0 ? `Tags · ${count}` : 'Tags'}</span>
        <span className="trp-tagdd-chevron" aria-hidden>▾</span>
      </button>

      {open && (
        <>
          {/* Backdrop — klik mimo zatvára, aj natívne <select>-y pod panelom ostanú nedostupné. */}
          <span className="fixed inset-0" style={{ zIndex: 40 }} onClick={() => setOpen(false)} aria-hidden />
          <div className="trp-tagdd-panel">
            <span className="trp-tagdd-eyebrow">Filter by tag</span>
            {TAG_VOCAB.map((tag) => {
              const on = tags.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`trp-tagdd-row${on ? ' on' : ''}`}
                  onClick={() => onToggle(tag)}
                >
                  <span>{TAG_EMOJI[tag] ? `${TAG_EMOJI[tag]} ` : ''}{tag}</span>
                  {on && <span aria-hidden>✓</span>}
                </button>
              );
            })}
            {count > 0 && (
              <button type="button" className="trp-tagdd-clear" onClick={onClear}>Clear</button>
            )}
          </div>
        </>
      )}
    </span>
  );
}

export default function PackMap() {
  const t = useT();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const id = usePackIdentity();

  const [hoverId, setHoverId] = useState<string | null>(null);
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
  const [mapStyle, setMapStyle] = useState<'outdoor' | 'aerial'>('outdoor'); // bod 2: Winter preč
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
  const [addError, setAddError] = useState('');           // chyba pri ukladaní (napr. plný localStorage)
  // bod 4 (iterácia 14, zachované): mobile ADD overlay (.trp-madd) prekrýva celú obrazovku
  // vrátane mapy — mobileDrawing dočasne SCHOVÁ formulár (CSS display, NIE unmount — inak by
  // AddTripPlan/AddTripLog stratili svoj interný state pri každom "choď na mapu"), nech je mapa
  // pod ním klikateľná. GeometryPicker počúva `map.on('click')` priamo cez mapRef, nezávisle od
  // viditeľnosti panela, takže zápis geometrie beží ďalej aj kým je panel schovaný.
  const [mobileDrawing, setMobileDrawing] = useState(false);
  // tripy pridané v tejto session (ADD flow submit) — lokálny state, NIE Supabase (mimo
  // rozsahu tejto iterácie); zobrazujú sa hneď na mape + v zozname pred statickými HERO_TRAILS.
  // sessionStorage mirror (viď vyššie) nech expand na čerstvo pridaný trip nájde aj po navigate.
  const [localTrails, setLocalTrails] = useState<HeroTrail[]>(() => readLocalTrails());
  useEffect(() => { writeLocalTrails(localTrails); }, [localTrails]);

  // TRIPSTATS Slice A (bod 3, Matej 2026-07-23) — add-trip z pohoria: TripStatsPanel „+ Add a
  // trip here" navigate-uje sem s ?add=<region>. Raz na mount: otvor ADD flow (log formulár —
  // krok 9: región už nie je samostatné pole, AddTripLog si ho odvodí z nakreslenej geometrie)
  // + odleť mapou na jeho stred. leafletMapRef môže byť ešte null (id.loading gate odloží mount
  // <MapContainer>) — pendingFlyRef drží cieľ, MapRefBridge onReady ho skonzumuje keď mapa domountuje.
  useEffect(() => {
    const addParam = searchParams.get('add');
    if (!addParam) return;
    setAddFlow('walked');
    const target = regionCenter(addParam);
    if (leafletMapRef.current) leafletMapRef.current.flyTo(target, 11, { duration: 1.2 });
    else pendingFlyRef.current = target;
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // bod 5 — mobile map-first + LIST/MAP toggle + FILTER (sort) popover.
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [sortOpen, setSortOpen] = useState(false);
  // Matej 2026-07-27: default poradie = „klasicky na najlepšie hodnotené" → 'top' je VÝCHODZÍ
  // stav, nie voliteľný filter (preto sa ani neráta do activeFilterCount a prázdna hodnota ''
  // z únie zmizla — vypnúť sort sa nedá, len prepnúť). Platí pre desktop popover aj mobile sheet.
  const [mobileSort, setMobileSort] = useState<'top' | 'easiest' | 'hardest'>('top');
  // aktuálny výrez mapy (hlási <ViewportWatcher>) — riadi rozdelenie ľavého zoznamu na
  // „v tomto výreze" / „inde na mape". null = mapa ešte nedomountovala → zoznam bez delenia.
  const [viewBox, setViewBox] = useState<ViewBox | null>(null);
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

  // ── KOMUNITNÁ vrstva (design: plany/pack-community-features-design.md) — MOCK, sessionStorage
  // mirror (packCommunity), žiadna Supabase perzistencia. `now` fixné pri mounte kvôli
  // deterministickým mock dátumom (planners/events). ──
  const nowMs = useMemo(() => Date.now(), []);
  const [votes, setVotes] = useState<Record<string, TripVote>>(() => readVotes());
  const [plans, setPlans] = useState<TripPlan[]>(() => readPlans());
  const [events, setEvents] = useState<PartnerEvent[]>(() => {
    const stored = readEvents();
    return stored.length ? stored : mockEventsSeed(HERO_TRAILS, Date.now());
  });
  useEffect(() => { writeVotes(votes); }, [votes]);
  useEffect(() => { writePlans(plans); }, [plans]);
  useEffect(() => { writeEvents(events); }, [events]);

  // flow modaly (design §A/§B/§D): walked popup, wishlist zámer, partner ad, DM stub, dashboard.
  const [walkedPopupId, setWalkedPopupId] = useState<string | null>(null);
  const [wishlistPopupId, setWishlistPopupId] = useState<string | null>(null);
  const [partnerAdCtx, setPartnerAdCtx] = useState<{ tripId: string } | null>(null);
  const [dmName, setDmName] = useState<string | null>(null);
  // Portal kategória (design §D): Trips ↔ Events (Events pill sa aktivoval).
  const [activeCat, setActiveCat] = useState<'trips' | 'events'>('trips');
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
  const trailsById = useMemo(() => {
    const m = new Map<string, HeroTrail>();
    allTrails.forEach((t) => m.set(t.id, t));
    return (id: string) => m.get(id);
  }, [allTrails]);

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
        const url = `https://api.mapy.com/v1/suggest?query=${encodeURIComponent(q)}&lang=en&limit=6&apikey=${MAPY_API_KEY}`;
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
      navigate(`/pack/map/${tr.id}`);
      return;
    }
    setAddFlow(null);
    setInlineDetailId(tr.id);
    setHeroBounds(tr.path);
  };
  const expandDetail = (tid: string) => navigate(`/pack/map/${tid}`);
  // ── design §B: klik na ★ → ak už NIE je na wishliste, otvor „zámer" popup (Solo/Buddy);
  // ak už je, odober (aj z planning). Priame pridanie ide až cez chooseSolo/choosePartner. ──
  const toggleFav = (tid: string) => {
    if (favIds.has(tid)) {
      setFavIds((prev) => { const n = new Set(prev); n.delete(tid); return n; });
      setPlans((prev) => prev.filter((p) => p.tripId !== tid));
    } else {
      setWishlistPopupId(tid);
    }
  };
  // ── design §A: klik na ✓ → ak už NIE je walked, otvor POVINNÝ walked popup (rating/diff/crowd/
  // koment); zápis do walkedIds ide až po submite. Ak už je walked, odznač (aj hlas). ──
  const toggleWalked = (tid: string) => {
    if (walkedIds.has(tid)) {
      setWalkedIds((prev) => { const n = new Set(prev); n.delete(tid); return n; });
      setVotes((prev) => { const n = { ...prev }; delete n[tid]; return n; });
    } else {
      setWalkedPopupId(tid);
    }
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
  };
  const addPlan = (tid: string, intent: 'solo' | 'partner', date = '') =>
    setPlans((prev) => [{ tripId: tid, intent, date, at: nowMs }, ...prev.filter((p) => p.tripId !== tid)]);
  const chooseSolo = (tid: string) => {
    setFavIds((prev) => { const n = new Set(prev); n.add(tid); return n; });
    addPlan(tid, 'solo');
    // TRIPLIST (Slice A): rename wishlist → triplist, star popup navyše upsertne triplist entry.
    upsertMyTrip(tid, { status: 'solo', openness: 'closed', date: '' });
    setWishlistPopupId(null);
  };
  const choosePartner = (tid: string) => {
    setFavIds((prev) => { const n = new Set(prev); n.add(tid); return n; });
    addPlan(tid, 'partner');
    upsertMyTrip(tid, { status: 'looking', openness: 'open', date: '' });
    setWishlistPopupId(null);
    setPartnerAdCtx({ tripId: tid });
  };
  const submitPartnerAd = (ad: PartnerAdInput) => {
    if (!partnerAdCtx) return;
    // partner inzerát je VŽDY public → Events (Matej 2026-07-22).
    const ev: PartnerEvent = {
      id: `ad-${nowMs}-${partnerAdCtx.tripId}`,
      tripId: partnerAdCtx.tripId,
      dates: ad.dates, month: ad.month, socialization: ad.socialization,
      host: `${firstName} & your dog`, at: nowMs, joinedByMe: true, seedGoing: 0, hostIsMe: true,
    };
    setEvents((prev) => [ev, ...prev]);
    const firstDate = ad.dates[0] ?? ad.month;
    setPlans((prev) => prev.map((p) => (p.tripId === partnerAdCtx.tripId ? { ...p, date: firstDate } : p)));
    setPartnerAdCtx(null);
  };
  const joinEvent = (eid: string) =>
    setEvents((prev) => prev.map((e) => (e.id === eid ? { ...e, joinedByMe: !e.joinedByMe } : e)));
  // Zavrieť/otvoriť skupinu — inzerát ostáva pre pack viditeľný, len sa nedá pridať
  // (Matej 2026-07-25). Prepína ho ktokoľvek zo skupiny, gating je v EventsView.
  const toggleEventClosed = (eid: string) =>
    setEvents((prev) => prev.map((e) => (e.id === eid ? { ...e, closed: !e.closed } : e)));
  const removePlan = (tid: string) => {
    setPlans((prev) => prev.filter((p) => p.tripId !== tid));
    setFavIds((prev) => { const n = new Set(prev); n.delete(tid); return n; });
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
  const myDogsForAdd = id.dogs.map((d) => ({ id: d.id, name: d.dog_name ?? 'My dog', photo: d.cloudinary_main_url }));
  const openAddEntry = () => setAddEntryOpen(true);
  const pickAddFlow = (state: TripState) => {
    setAddEntryOpen(false);
    setInlineDetailId(null);
    setMobileDrawing(false);
    setAddFlow(state);
  };
  const closeAdd = () => {
    setAddFlow(null);
    setMobileDrawing(false);
    setAddError('');
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
        diff: draft.diff ?? 'Moderate',
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
      const next = [newTrail, ...localTrails];
      if (!writeLocalTrails(next)) {
        setAddError(`Couldn't save — photos are too large for this device's storage. Remove a few and try again.`);
        return false;
      }
      setAddError('');
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
    addPlan(tid, 'partner', dateStr);
    const ev: PartnerEvent = {
      id: `plan-event-${now}`, tripId: tid,
      dates: dateStr.length >= 7 ? [dateStr] : [],
      month: dateStr.length >= 7 ? dateStr.slice(0, 7) : dateStr,
      socialization: '', host: `${firstName} & your dog`, hostIsMe: true,
      at: now, joinedByMe: true, seedGoing: 0,
    };
    setEvents((prev) => [ev, ...prev]);
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
  // „niekde medzi". LEVEL nie je pilulka ani tlačidlo — klasický text (.trp-level), lebo nič
  // neotvára; pilulky sú vyhradené akciám/routám.
  // 🔴 "Pútnik Lvl. 1" je zatiaľ HARDCODED placeholder — reálny bodový systém (prah(N)=(N−1)(15N+20),
  // Pilgrim/Pútnik 1–N) je LOCKED spec z 2026-07-25, ale ešte NEIMPLEMENTOVANÝ (čaká sa na zelenú
  // na kódenie: walked→DB, points.config.ts, atď.). Keď sa postaví, tento text sa napojí naň.
  const renderStatusLeft = () => (
    <div className="trp-status-left">
      <div className="trp-level" title="Your pack level">
        <span className="trp-level-name">Pútnik</span>
        <span className="trp-level-num"><i>Lvl</i><em>1</em></span>
      </div>
    </div>
  );

  const renderStatusCenter = () => (
    <div className="trp-status-center">
      <button type="button" className="trp-stat-pill" onClick={() => navigate('/pack/map/triplist?tab=stats')} title="Your trip stats — world, home & walked">
        <img src={ICON('trophy')} alt="" />
        <b>{walkedIds.size} · {fmtKm(walkedKm)} km</b>
      </button>
      {/* Matej 2026-07-27: na mobile (a v kompaktnom desktope) je Triplist LEN ikonka — text
          by rozbil jednoriadkový status. Klikacia plocha, route aj title/aria zostávajú. */}
      <button type="button" className="trp-stat-pill trp-stat-pill--icon" onClick={() => navigate('/pack/map/triplist')} title="Open your triplist" aria-label="Open your triplist">
        <img src={ICON('clipboard')} alt="" />
        <b className="trp-triplist-label">Triplist</b>
      </button>
      {/* ADD TRIP patrí do stredného klastra (Matej 2026-07-26) — vedľa správ nemá čo robiť,
          a je to jediný vstup do ADD flow, takže sa nesmie stratiť. */}
      <button type="button" className="trp-addtrip-btn" onClick={openAddEntry}>
        <img src={ICON('plus')} alt="" className="trp-addtrip-icon" />
        <span className="trp-addtrip-full">Add trip</span>
        <span className="trp-addtrip-short" aria-hidden>Add</span>
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
  const sortTrips = (arr: typeof visibleHeroTrails) => [...arr].sort((a, b) => {
    const ja = a.tr.acts?.includes('journey') ? 1 : 0;
    const jb = b.tr.acts?.includes('journey') ? 1 : 0;
    if (ja !== jb) return ja - jb;
    if (mobileSort === 'easiest') return diffRank(a.tr.diff) - diffRank(b.tr.diff);
    if (mobileSort === 'hardest') return diffRank(b.tr.diff) - diffRank(a.tr.diff);
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
          <span>{inViewTrails.length === 0 ? 'Nothing in this view' : 'Elsewhere on the map'}</span>
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
                aria-label="Previous photo"
              >‹</button>
              <button
                type="button"
                className="trp-bigcard-photobtn"
                onClick={(e) => { e.stopPropagation(); cyclePhoto(tr.id, 1, tr.photos.length); }}
                aria-label="Next photo"
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
              >✓ Walked</button>
            )}
            {!walkedIds.has(tr.id) && (
              <button
                type="button"
                className={`trp-bigcard-photoactbtn${favIds.has(tr.id) ? ' on' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleFav(tr.id); }}
              >★ Triplist</button>
            )}
          </div>
          {/* bod 3: náročnosť · km + popularita + hazard(červený) — dolný ľavý roh fotky.
              Plán = žiadne meta (výlet sa neodohral), len „Planned" pilulka. */}
          <div className="trp-bigcard-photometa">
            {isUnwalkedPlan
              ? <span className="trp-plannedpill">🗓️ Planned</span>
              : <PhotoMetaPills agg={agg} km={tr.km} ascentM={(tr as { ascentM?: number }).ascentM} />}
          </div>
        </div>
        {/* bod 3: telo karty = 2 stĺpce — vľavo 3 riadky (loc/název/autor), vpravo
            rating(packy)·difficulty·Crowd (CROWD_LABELS už nesie emoji, napr. "🌿 Calm"). */}
        <div className="trp-bigcard-body">
          <div className="trp-bigcard-info">
            {/* pohorie · región label pod fotkou (Matejov feedback bod 3) — región
                len keď je pohorie namapované cez REGION_OF (guard, nič sa nefabrikuje) */}
            <div className="trp-bigcard-loc">{tr.region}{REGION_OF[tr.region] ? ` · ${REGION_OF[tr.region]}` : ''}</div>
            <div className="trp-bigcard-name">{tr.name}</div>
            {/* autor = svorka čo prešla trip; „+N Dogyptians" = walkeri nad zakladateľov
                (Matej 2026-07-22 — walked count sa presunul sem z crowd stĺpca). */}
            <div className="trp-bigcard-authorrow">
              <AuthorAvatars author={authorOf(tr)} size={16} />
              <span className="trp-bigcard-author">by {authorOf(tr)}{others > 0 ? ` · +${others} Dogyptians` : ''}</span>
            </div>
          </div>
          {/* bod 3 (Matej 2026-07-22): pravý stĺpec = LEN veľký rating (1 packa + X.Y). Náročnosť/
              popularita/hazard sa presunuli na fotku (PhotoMetaPills vyššie).
              Plán = žiadne hodnotenie (výlet sa neodohral). */}
          {!isUnwalkedPlan && <BigRating rating={agg.rating} compact />}
        </div>
      </div>
    );
  };

  return (
    <div className={`trp-root${mobileView === 'list' ? ' mlist-active' : ''}`}>
      <style>{CSS}</style>
      <style>{COMMUNITY_CSS}</style>

      {/* floating dark "Explore" panel — no header, margined off top/left/bottom. Bod 4/6:
          3 mutually-exclusive stavy (LIST default / inline DETAIL / ADD setup), desktop-only
          (mobile ho celý skrýva — bod 5, viď .trp-sidebar{display:none} v mobile media query). */}
      <aside className="trp-sidebar">
        {addFlow ? (
          addFlow === 'planned' ? (
            <AddTripPlan allTrails={allTrails} authorName={firstName} myDogs={myDogsForAdd} onSubmit={submitAddTripDraft} onClose={closeAdd} placeholderFor={placeholderFor} mapRef={leafletMapRef} />
          ) : (
            <AddTripLog allTrails={allTrails} authorName={firstName} myDogs={myDogsForAdd} onSubmit={submitAddTripDraft} onClose={closeAdd} placeholderFor={placeholderFor} mapRef={leafletMapRef} />
          )
        ) : inlineDetailId ? (() => {
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
                <button type="button" className="trp-panelnav-btn" onClick={() => { setInlineDetailId(null); setHeroBounds(SVK_BORDER); }} aria-label="Back to list">←</button>
                <button type="button" className="trp-panelnav-btn" onClick={() => expandDetail(dt.id)} aria-label="Expand to full page">⤢</button>
              </div>
              <div className="trp-inldet-body">
                {/* bod 4 (iterácia 15): fotka — avatar autora (initial, ľavý horný roh) + bočné
                    šípky (reused .trp-bigcard-photonav) + ♡ zmenené na ★ "Add to wishlist"
                    textové tlačidlo (dolný pravý roh, ako karta bod 3). */}
                <div className="trp-inldet-photowrap">
                  {photo && <div className="trp-inldet-photo" style={{ backgroundImage: `url('${photo}')` }} />}
                  <div className="trp-inldet-authoravatar" title={`by ${authorOf(dt)}`}>
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
                      >✓ {walkedIds.has(dt.id) ? 'Walked' : 'Mark walked'}</button>
                    )}
                    {!walkedIds.has(dt.id) && (
                      <button
                        type="button"
                        className={`trp-bigcard-photoactbtn${favIds.has(dt.id) ? ' on' : ''}`}
                        onClick={() => toggleFav(dt.id)}
                      >★ {favIds.has(dt.id) ? 'In triplist' : 'Triplist'}</button>
                    )}
                  </div>
                  {/* náročnosť · km + popularita + hazard(červený) — dolný ľavý roh fotky.
                      Plán = žiadne meta, len „Planned" pilulka. */}
                  <div className="trp-bigcard-photometa">
                    {isUnwalkedPlan
                      ? <span className="trp-plannedpill">🗓️ Planned</span>
                      : <PhotoMetaPills agg={dtAgg} km={dt.km} ascentM={(dt as { ascentM?: number }).ascentM} />}
                  </div>
                  {dt.photos.length > 1 && (
                    <div className="trp-bigcard-photonav">
                      <button type="button" className="trp-bigcard-photobtn" onClick={() => cyclePhoto(dt.id, -1, dt.photos.length)} aria-label="Previous photo">‹</button>
                      <button type="button" className="trp-bigcard-photobtn" onClick={() => cyclePhoto(dt.id, 1, dt.photos.length)} aria-label="Next photo">›</button>
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
                    <div className="trp-inldet-loc">{dt.region}{REGION_OF[dt.region] ? ` · ${REGION_OF[dt.region]}` : ''}</div>
                    <div className="trp-inldet-name">{dt.name}</div>
                    {/* bod 6 (iterácia 16): dva avatary (majiteľ+pes) vedľa "by {author}" */}
                    <div className="trp-inldet-authorrow">
                      <AuthorAvatars author={authorOf(dt)} size={22} />
                      <span className="trp-inldet-author">by {authorOf(dt)}{dtAgg.walkedCount - FOUNDER_WALKERS > 0 ? ` · +${dtAgg.walkedCount - FOUNDER_WALKERS} Dogyptians` : ''}</span>
                    </div>
                  </div>
                  {/* Matej 2026-07-22: pravý stĺpec = LEN veľký rating (1 packa + X.Y). Náročnosť/
                      popularita/hazard sú na fotke (PhotoMetaPills). */}
                  {isUnwalkedPlan
                    ? <span className="trp-norating" title="Not rated yet — the trip hasn't happened">— —</span>
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

                {dt.desc && <p className="trp-inldet-desc">{dt.desc}</p>}
                {dt.dogNote && <p className="trp-inldet-desc">🐾 {dt.dogNote}</p>}

                {(dt as { elev?: number[] }).elev && (
                  <div className="trp-inldet-section">
                    <h4>Elevation profile</h4>
                    <ElevationProfile elev={(dt as { elev?: number[] }).elev} km={parseFloat(dt.km) || 0} />
                  </div>
                )}

                <div className="trp-inldet-section">
                  <h4>Walked by {dtAgg.walkedCount} Dogyptian{dtAgg.walkedCount === 1 ? '' : 's'}</h4>
                  {dtAgg.walkedCount === 0 && <div className="trp-inldet-empty">Be the first to walk this.</div>}
                </div>
                {/* §14 zadania (2026-07-23): komentová sekcia nahrádza staré "Message owner" /
                    "Open trip group" placeholdery — reviews (paw rating + voliteľný text) + advice.
                    §15 (2026-07-23): walked/onMarkWalked napojené na existujúci walkedIds stav —
                    "Add review" je gated na walked, submit markuje walked (markWalked, additive). */}
                <TripComments tripId={dt.id} tripName={dt.name} walked={walkedIds.has(dt.id)} onMarkWalked={() => markWalked(dt.id)} onRequestWalk={() => setWalkedPopupId(dt.id)} />
              </div>
            </div>
          );
        })() : (
        <>
        <div className="trp-sidebar-top">
          {/* bod 2 (Matej 2026-07-22): pozdrav + filter ikonka (sliders) v pravom rohu — otvára
              sort popover (Top rated/Easiest/Hardest), rovnaká ikonka ako mobilný filter. */}
          <div className="trp-greet-row">
            <div>
              <div className="trp-greet-hi">Hi {firstName},</div>
              <div className="trp-greet-sub">What are you exploring?</div>
            </div>
            <div className="trp-greet-filterwrap">
              <button type="button" className={`trp-greet-filter${mobileSort !== 'top' ? ' on' : ''}`} onClick={() => setSortOpen((v) => !v)} aria-label="Sort & filter">
                <img src={ICON('sliders')} alt="" />
              </button>
              {sortOpen && (
                <div className="trp-sortpop trp-sortpop--desk">
                  {([['top', 'Top rated'], ['easiest', 'Easiest'], ['hardest', 'Hardest']] as const).map(([v, l]) => (
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
            <button type="button" className={`trp-catpill${activeCat === 'trips' ? ' on' : ''}`} onClick={() => setActiveCat('trips')}>Trips</button>
            {/* design §D: Events sa aktivoval — zoznam plánovaných spoločných výletov + join.
                Matej 2026-07-26: presunuté hneď vedľa Trips (pred Places/Services placeholdery). */}
            <button type="button" className={`trp-catpill${activeCat === 'events' ? ' on' : ''}`} onClick={() => setActiveCat('events')}>Events</button>
            <button type="button" className="trp-catpill soon" disabled data-tip="Coming soon">Places</button>
            <button type="button" className="trp-catpill soon" disabled data-tip="Coming soon">Services</button>
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
              aria-label="Country"
              onChange={(e) => applyCountry(e.target.value)}
            >
              {availableCountries.length > 1 && <option value="">🌍 All</option>}
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
              aria-label="Region"
            >
              <option value="">All regions</option>
              {MACRO_REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            )}
            <select
              className="trp-filter-select"
              value={heroAct}
              onChange={(e) => setHeroAct(e.target.value as typeof heroAct)}
              aria-label="Activity"
            >
              <option value="">Activities</option>
              {TRIP_ACTIVITIES.map((a) => (
                <option key={a.id} value={a.id}>{ACT_EMOJI[a.id]} {a.label}</option>
              ))}
            </select>
          </div>
          </>)}
        </div>

        <div className="trp-cards-scroll">
          <div className="trp-cards">
            {activeCat === 'trips'
              ? renderTripList(true)
              : <EventsView events={events} trailsById={trailsById} onJoin={joinEvent} onToggleClosed={toggleEventClosed} onMessage={setDmName} onOpenProfile={(mid) => navigate('/pack/u/' + mid)} photoFor={(tr) => tr.photos[0] ?? placeholderFor(tr.acts, tr.id)} onOpenTrip={(tid) => { setActiveCat('trips'); selectTrail(trailsById(tid) ?? HERO_TRAILS[0]); }} />}
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
        <div className="trp-mheader-status">
          {/* Avatar REMOVED here too (D4 nav rework) — same reasoning as desktop .trp-status-row.
              Trojdielny split je zdieľaný s desktopom, len s menšou typografiou (viď media query). */}
          {renderStatusLeft()}
          {renderStatusCenter()}
          {renderHeaderRight()}
        </div>
        <div className="trp-mheader-row2">
          <div className="trp-mapsearch">
            <img src={ICON('globe')} alt="" />
            <input
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              placeholder="Search a place…"
            />
          </div>
          {/* Matej 2026-07-27: jedna „Filters · N" pilulka namiesto troch selectov — všetky
              filtre (včetane country/region/tagov, ktoré na mobile chýbali ÚPLNE) žijú v sheete. */}
          <div className="trp-mfilterwrap">
            <button
              type="button"
              className={`trp-mfilterbtn${activeFilterCount > 0 ? ' on' : ''}`}
              onClick={() => setFilterSheetOpen(true)}
              aria-label="Filters"
              aria-expanded={filterSheetOpen}
            >
              <img src={ICON('sliders')} alt="" />
              <span>{activeFilterCount > 0 ? `Filters · ${activeFilterCount}` : 'Filters'}</span>
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
          <div className="trp-msheet" role="dialog" aria-label="Filters">
            <div className="trp-msheet-grab" aria-hidden />
            <div className="trp-msheet-head">
              <span className="trp-msheet-title">Filters</span>
              <button type="button" className="trp-msheet-x" onClick={() => setFilterSheetOpen(false)} aria-label="Close filters">✕</button>
            </div>

            <div className="trp-msheet-body">
              <div className="trp-msheet-pair">
                <div className="trp-msheet-field">
                  <span className="trp-msheet-label">Country</span>
                  <select className="trp-msheet-select" value={selectedCountry} aria-label="Country" onChange={(e) => applyCountry(e.target.value)}>
                    {availableCountries.length > 1 && <option value="">🌍 All</option>}
                    {availableCountries.map((c) => (
                      <option key={c} value={c}>{flagEmoji(c)} {c.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                {/* Región (West/Center/East) je SK-špecifický — rovnaká podmienka ako v paneli. */}
                {(selectedCountry === '' || selectedCountry === 'sk') && (
                  <div className="trp-msheet-field">
                    <span className="trp-msheet-label">Region</span>
                    <select
                      className="trp-msheet-select"
                      value={heroMacroRegion}
                      aria-label="Region"
                      onChange={(e) => setHeroMacroRegion(e.target.value as typeof heroMacroRegion)}
                    >
                      <option value="">All regions</option>
                      {MACRO_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="trp-msheet-field">
                <span className="trp-msheet-label">Activity</span>
                <select className="trp-msheet-select" value={heroAct} aria-label="Activity" onChange={(e) => setHeroAct(e.target.value as typeof heroAct)}>
                  <option value="">Activities</option>
                  {TRIP_ACTIVITIES.map((a) => (
                    <option key={a.id} value={a.id}>{ACT_EMOJI[a.id]} {a.label}</option>
                  ))}
                </select>
              </div>

              <div className="trp-msheet-pair">
                <div className="trp-msheet-field">
                  <span className="trp-msheet-label">Difficulty</span>
                  <select className="trp-msheet-select" value={heroDiff} aria-label="Difficulty" onChange={(e) => setHeroDiff(e.target.value as typeof heroDiff)}>
                    <option value="">Any</option>
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                    <option value="Odyssey">Odyssey</option>
                  </select>
                </div>
                <div className="trp-msheet-field">
                  {/* D2 (LOCKED 2026-07-24): Crowd = Empty · Calm · Busy */}
                  <span className="trp-msheet-label">Crowd</span>
                  <select className="trp-msheet-select" value={heroCrowd} aria-label="Crowd" onChange={(e) => setHeroCrowd(e.target.value as typeof heroCrowd)}>
                    <option value="">Any</option>
                    {Object.entries(CROWD_LABELS).map(([sk, en]) => (
                      <option key={sk} value={sk}>{en}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="trp-msheet-field">
                <span className="trp-msheet-label">Tags</span>
                <div className="trp-msheet-chips">
                  {TAG_VOCAB.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`trp-msheet-chip${heroTags.has(tag) ? ' on' : ''}`}
                      aria-pressed={heroTags.has(tag)}
                      onClick={() => toggleTag(tag)}
                    >{TAG_EMOJI[tag] ? `${TAG_EMOJI[tag]} ` : ''}{tag}</button>
                  ))}
                </div>
              </div>

              <div className="trp-msheet-field">
                <span className="trp-msheet-label">Sort</span>
                <div className="trp-msheet-chips">
                  {([['top', 'Top rated'], ['easiest', 'Easiest'], ['hardest', 'Hardest']] as const).map(([v, l]) => (
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
              <button type="button" className="trp-msheet-clear" disabled={activeFilterCount === 0} onClick={clearAllFilters}>Clear</button>
              <button type="button" className="trp-msheet-show" onClick={() => setFilterSheetOpen(false)}>
                Show {sortedVisibleHeroTrails.length}
              </button>
            </div>
          </div>
        </>
      )}

      {/* LIST/MAP toggle (mobile only) — default view = map, bod 5. */}
      <button
        type="button"
        className="trp-mtoggle"
        onClick={() => setMobileView((v) => (v === 'map' ? 'list' : 'map'))}
      >
        {mobileView === 'map' ? 'List' : 'Map'}
      </button>

      {/* full-page card list (mobile 'list' view — replaces the map, not an overlay) */}
      <div className="trp-mlist">
        <div className="trp-cards">
          {activeCat === 'trips'
            ? renderTripList(false)
            : <EventsView events={events} trailsById={trailsById} onJoin={joinEvent} onToggleClosed={toggleEventClosed} onMessage={setDmName} onOpenProfile={(mid) => navigate('/pack/u/' + mid)} photoFor={(tr) => tr.photos[0] ?? placeholderFor(tr.acts, tr.id)} onOpenTrip={(tid) => navigate(`/pack/map/${tid}`)} />}
        </div>
      </div>

      {/* bod 4 (iterácia 14, krok 9 zachované): ADD TRIP na mobile — .trp-sidebar (kde žije
          desktop ADD setup) je na mobile display:none, tak formulár beží aj tu vo full-screen
          overlayi. mobileDrawing=true CSS-schová overlay (display:none, NIE unmount — inak by
          AddTripPlan/AddTripLog stratili svoj interný state) nech je mapa pod ním klikateľná pre
          GeometryPicker; "View map" tlačidlo ju schová, "Done" v .trp-drawhint nižšie ju vráti. */}
      {!!addFlow && (
        <div className="trp-madd" style={mobileDrawing ? { display: 'none' } : undefined}>
          <button type="button" className="trp-madd-drawbtn" onClick={() => setMobileDrawing(true)}>
            View map to place your route / pin
          </button>
          {addFlow === 'planned' ? (
            <AddTripPlan allTrails={allTrails} authorName={firstName} myDogs={myDogsForAdd} onSubmit={submitAddTripDraft} onClose={closeAdd} placeholderFor={placeholderFor} mapRef={leafletMapRef} />
          ) : (
            <AddTripLog allTrails={allTrails} authorName={firstName} myDogs={myDogsForAdd} onSubmit={submitAddTripDraft} onClose={closeAdd} placeholderFor={placeholderFor} mapRef={leafletMapRef} />
          )}
        </div>
      )}

      {/* mapa — full-bleed, panel je nad ňou (position:absolute) */}
      <div className="trp-mapregion">
          <div className="trp-mapfull">
            <MapContainer center={CENTER} zoom={9} zoomControl={false} attributionControl={false} style={{ width: '100%', height: '100%' }}>
              <TileLayer key={mapStyle} url={mapyTiles(mapStyle)} />
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
              <ScaleControl position="bottomleft" imperial={false} />
              <FlyTo target={mapTarget} />
              <FitBounds path={heroBounds} offset={!!inlineDetailId} />
              {/* ľavý zoznam podľa výrezu mapy (Matej 2026-07-27) — hlási bounds na moveend/zoomend */}
              <ViewportWatcher onChange={handleViewport} />
              <MapRefBridge onReady={(map) => {
                leafletMapRef.current = map;
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
              {allTrails.filter((tr) => tr.path.length > 1 && !isWaterTrail(tr)).map((tr) => {
                const hot = hoverId === tr.id || inlineDetailId === tr.id;
                const handlers = {
                  mouseover: () => setHoverId(tr.id),
                  mouseout: () => setHoverId(null),
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
                if (tr.acts?.includes('journey')) {
                  if (!hot) return null;
                  const w = 5;
                  return (
                    <Fragment key={tr.id}>
                      <Polyline
                        positions={tr.path}
                        pathOptions={{ color: '#FFFFFF', weight: w + 4, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
                        eventHandlers={handlers}
                      />
                      <Polyline
                        positions={tr.path}
                        pathOptions={{ color: '#E01B22', weight: w, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
                        eventHandlers={handlers}
                      />
                    </Fragment>
                  );
                }
                if (!hot) {
                  // farebnosť podľa náročnosti (2026-07-26) — rovnaká paleta ako DiffMark
                  // pilulky/markery (DIFF_COLOR), nech je náročnosť čitateľná aj bez hoveru.
                  // Výber = zámerný: hot/selected stav zostáva čierno-zlatý (brand), toto
                  // mení len pokojný, nevybraný stav.
                  return (
                    <Polyline
                      key={tr.id}
                      positions={tr.path}
                      pathOptions={{ color: DIFF_COLOR[tr.diff] ?? '#161616', weight: 3, opacity: .62, lineCap: 'round', lineJoin: 'round' }}
                      eventHandlers={handlers}
                    />
                  );
                }
                return (
                  <Fragment key={tr.id}>
                    <Polyline
                      positions={tr.path}
                      pathOptions={{ color: '#0A0A0A', weight: 8, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
                      eventHandlers={handlers}
                    />
                    <Polyline
                      positions={tr.path}
                      pathOptions={{ color: '#F5C73D', weight: 4, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
                      eventHandlers={handlers}
                    />
                  </Fragment>
                );
              })}
              {/* trip pily (start/stred trasy) + vodné plochy (ťažisko) — jedna vrstva, zoomovo
                  vrstvená + pixelovo zhlukovaná (zadanie 2.3/2.4, <TripMarkers> vyššie pri mape).
                  Bez súradnice (0 bodov, napr. Buková priehrada) sa vodná plocha nezobrazí — čaká
                  na nahadzovač 📍 bod-miesto (mapPoints guard, viď komentár pri jeho definícii). */}
              <TripMarkers
                points={mapPoints}
                hoverId={hoverId}
                inlineDetailId={inlineDetailId}
                onHover={setHoverId}
                onSelect={selectTrail}
              />
              {/* krok 9: draft polyline/km-label/pin, ktoré tu predtým kreslil starý drawPoints
                  ADD flow, sú preč — GeometryPicker (vnútri AddTripPlan/AddTripLog) kreslí kotvy,
                  snapnutú stopu aj bod/územie imperatívne priamo na túto mapu cez mapRef, takže
                  duplicitné React vrstvy tu už nie sú potrebné (viď kontrakt §2.1 „vrstvy na mape"). */}
              {/* uložené PLÁNY (nie vodné plochy!) = jeden RUŽOVÝ bod na mape → Marker, klik vyberie
                  trip. Gate na id 'plan-' — vodné plochy s 1 bodom nesmú dostať pin. */}
              {allTrails.filter((tr) => tr.id.startsWith('plan-') && tr.path.length === 1).map((tr) => (
                <Marker key={tr.id} position={tr.path[0]} icon={PLAN_PIN} eventHandlers={{ click: () => selectTrail(tr) }} />
              ))}
            </MapContainer>

            {/* farebná legenda mapy (Matej 2026-07-24): čierna=hike · červená=diaľkové · modrá=voda.
                „do budúcna možno pribudnú ďalšie" → stačí pridať ďalší .trp-legrow. */}
            <div className="trp-legend">
              <div className="trp-legrow"><span className="trp-legdot trp-legdot--hike" />Hike</div>
              <div className="trp-legrow"><span className="trp-legdot trp-legdot--journey" />Long-distance</div>
              <div className="trp-legrow"><span className="trp-legdot trp-legdot--water" />Water</div>
              <div className="trp-legrow"><span className="trp-legdot trp-legdot--planned" />Planned</div>
            </div>

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
                      placeholder="Search a place…"
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
                  aria-label="Difficulty"
                >
                  <option value="">Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                  <option value="Odyssey">Odyssey</option>
                </select>
                {/* bod 2 (iterácia 15) → D2 2026-07-24: "Popularity" → "Vibe" → "Crowd" (Empty/Calm/Busy) */}
                <select
                  className="trp-toprow-select"
                  value={heroCrowd}
                  onChange={(e) => setHeroCrowd(e.target.value as typeof heroCrowd)}
                  aria-label="Crowd"
                >
                  <option value="">Crowd</option>
                  {Object.entries(CROWD_LABELS).map(([sk, en]) => (
                    <option key={sk} value={sk}>{en}</option>
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
              {/* bod 2: Terrain/Satellite/Winter stack → jedno kruhové tlačidlo, prepína len
                  outdoor↔aerial (Winter úplne odstránený z mapStyle typu aj z mapyTiles). */}
              <button
                type="button"
                className="trp-stylebtn"
                onClick={() => setMapStyle((v) => (v === 'outdoor' ? 'aerial' : 'outdoor'))}
                aria-label={mapStyle === 'outdoor' ? 'Switch to satellite view' : 'Switch to terrain view'}
                title={mapStyle === 'outdoor' ? 'Switch to satellite view' : 'Switch to terrain view'}
              >
                <img src={ICON('layers')} alt="" />
              </button>
              <div className="trp-zoomgroup">
                <button type="button" onClick={() => leafletMapRef.current?.zoomIn()} aria-label="Zoom in">+</button>
                <button type="button" onClick={() => leafletMapRef.current?.zoomOut()} aria-label="Zoom out">−</button>
              </div>
              <button
                type="button"
                className={`trp-locatebtn${locating ? ' loading' : ''}`}
                onClick={handleLocate}
                aria-label="My location"
                title="My location"
              >
                <img src={ICON('locate')} alt="" />
              </button>
            </div>

            <div className="trp-attr">
              <a href="https://mapy.com" target="_blank" rel="noopener noreferrer"><img src="https://api.mapy.com/img/api/logo.svg" alt="Mapy.com" style={{ height: 13, display: 'block' }} /></a>
              <span>© Seznam.cz a.s.</span>
            </div>

            {/* bod 4 (i14, krok 9 zjednodušené): kým je formulár na mobile schovaný
                (mobileDrawing), GeometryPicker vlastný readout/Undo/Clear panel je schovaný
                s ním (je jeho súčasťou) — táto bublina len drží "Done" návrat k formuláru. */}
            {mobileDrawing && (
              <div className="trp-drawhint">
                <div className="trp-drawhint-txt">Tap the map to place your route or pin</div>
                <div className="trp-drawhint-actions">
                  <button type="button" onClick={() => setMobileDrawing(false)}>Done</button>
                </div>
              </div>
            )}
          </div>
      </div>

      {/* bod 5 (iterácia 12): starý full-page modal (.trp-detoverlay) tu žil predtým —
          ⤢ expand teraz navigate('/pack/map/:slug') na SAMOSTATNÚ route
          (PackTripArticle.tsx cez App.tsx), tak tento súbor už nikdy nemountuje so slugom. */}

      {/* ── KOMUNITNÉ modaly / dashboard (design plany/pack-community-features-design.md) ── */}
      {addEntryOpen && (
        <AddTripEntry onPick={pickAddFlow} onClose={() => setAddEntryOpen(false)} />
      )}
      {walkedPopupId && (
        <WalkedPopup
          trailName={trailsById(walkedPopupId)?.name ?? 'this trip'}
          initial={votes[walkedPopupId] ? { rating: votes[walkedPopupId].rating, difficulty: votes[walkedPopupId].difficulty, crowd: votes[walkedPopupId].crowd, comment: votes[walkedPopupId].comment, when: votes[walkedPopupId].when, hazards: votes[walkedPopupId].hazards } : null}
          onSubmit={submitWalked}
          onClose={() => setWalkedPopupId(null)}
        />
      )}
      {wishlistPopupId && (
        <WishlistIntentPopup
          trailName={trailsById(wishlistPopupId)?.name ?? 'this trip'}
          onSolo={() => chooseSolo(wishlistPopupId)}
          onPartner={() => choosePartner(wishlistPopupId)}
          onClose={() => setWishlistPopupId(null)}
        />
      )}
      {partnerAdCtx && (
        <PartnerAdForm
          trailName={trailsById(partnerAdCtx.tripId)?.name ?? 'this trip'}
          onSubmit={submitPartnerAd}
          onClose={() => setPartnerAdCtx(null)}
        />
      )}
      {dmName && <DMStub toName={dmName} onClose={() => setDmName(null)} />}

      <PackBottomNav avatarUrl={id.avatarUrl} avatarInitial={id.avatarInitial} dogs={id.dogs} />
      {/* PackMap je full-bleed a nemountuje <PackLayout> (vlastný header/nav vyššie), takže
          overlay host (Inbox/Thread) sa mountuje aj tu priamo — inak by „Message owner"/„Open
          trip group" vyššie a Messages v zdieľanom PackBottomNav nemali kam otvoriť (viď
          komentár pri MessagingOverlayHost v PackLayout.tsx). */}
      <MessagingOverlayHost />
    </div>
  );
}
