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
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
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
import { PACK_THEME } from '@/components/pack/packTheme';
import {
  ICON, authorOf, REGION_OF, diffMarkShape, DIFF_MARK_CSS,
  readLocalTrails, writeLocalTrails, readFavIds, writeFavIds, readWalkedIds, writeWalkedIds,
  ensureWalkedSeeded, FOUNDER_WALKED_JOURNEY_IDS,
} from '@/components/pack/tripShared';
import {
  crowdAggregate, mockEventsSeed, FOUNDER_WALKERS, seedCrowd, HAZARDS, HAZARD_EMOJI,
  readVotes, writeVotes, readPlans, writePlans, readEvents, writeEvents,
  type TripVote, type TripPlan, type PartnerEvent, type Hazard,
} from '@/components/pack/packCommunity';
import {
  COMMUNITY_CSS, BigRating, PhotoMetaPills, HazardTags, CompanionPicker, WalkedPopup, WishlistIntentPopup, PartnerAdForm, DMStub,
  AddModeChoice, EventsView,
  type WalkedInput, type PartnerAdInput, type Companion,
} from '@/components/pack/packCommunityUI';
import { upsertMyTrip } from '@/components/pack/triplist/triplist'; // TRIPLIST (Slice A) — star popup upserts alongside the existing wishlist plan

const GOLD = '#C99A3F';
const INK = '#1F1A0E';
const CARD = '#FFFBF2';
const T = PACK_THEME;
const PANEL_W = 440; // .trp-sidebar width — used to offset the inline-detail fitBounds
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
// `.filter(Boolean)` — 5 vodných plôch (vodne-diela-*) má `region: ""`, bez filtra sa v
// dropdowne pohorí vykreslila prázdna položka (F1 „skontrolovať filter", 2026-07-25).
const ALL_REGIONS: string[] = Array.from(new Set(ALL_TRIPS_STATIC.map((t) => t.region).filter(Boolean))).sort();

// multi-country ADD flow (2026-07-24): krajina sa auto-deteguje z nakreslenej trasy, ale je
// klikateľná (override pri chybnej detekcii na hranici). Zoznam = SK + susedia + Alpy.
const ADD_COUNTRY_OPTIONS = ['sk', 'cz', 'at', 'hu', 'pl', 'de', 'ch', 'it', 'si', 'fr'] as const;
const ISO2_LABEL: Record<string, string> = {
  sk: 'Slovakia', cz: 'Czechia', at: 'Austria', hu: 'Hungary', pl: 'Poland',
  de: 'Germany', ch: 'Switzerland', it: 'Italy', si: 'Slovenia', fr: 'France',
};

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
];
// 'journey' = viacdňová turistika (multi-day thru-hike), napr. Cesta hrdinov SNP.
const ACT_EMOJI: Record<string, string> = { hiking: '🥾', journey: '🎒', picnic: '🧺', overnight: '⛺', skating: '🛼', paddleboard: '🏄' };
// dátové pole tr.acts[] používa 'hike' (nie 'hiking') — mapovanie UI aktivita-id → dáta.
const ACT_DATA_ID: Record<string, string> = { hiking: 'hike', journey: 'journey', picnic: 'picnic', overnight: 'overnight', skating: 'skating', paddleboard: 'paddleboard' };

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
const TAG_VOCAB = [
  'Mountains', 'Forest', 'Lake/Reservoir', 'River', 'View', 'Meadow', 'Sunset',
  'In the middle of nature', 'In the middle of nowhere', 'Embankment',
  'Forest path', 'Asphalt', 'Rocky',
] as const;
const TAG_EMOJI: Record<string, string> = {
  Mountains: '🏔️', Forest: '🌲', 'Lake/Reservoir': '🏞️', River: '💧', View: '🌄', Meadow: '🌼', Sunset: '🌅',
  'In the middle of nature': '🌳', 'In the middle of nowhere': '🌾', Embankment: '🧱',
  'Forest path': '🥾', Asphalt: '🛣️', Rocky: '🪨',
};
// surface = typ cesty (zdroj pravdy: nahadzovač state — hodnoty 'forest'/'asphalt')
const SURFACE_VOCAB = [{ id: 'forest', e: '🌲', t: 'Forest path' }, { id: 'asphalt', e: '🛣️', t: 'Asphalt' }, { id: 'rocky', e: '🪨', t: 'Rocky' }] as const;

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
  'In the middle of nature': 'In the middle of nature',
  'In the middle of nowhere': 'In the middle of nowhere',
  Embankment: 'Embankment',
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

// bod 3 (iterácia 12): marker = čierny pill s difficulty pictogramom + "{km} km", ŽIADNE
// poradové číslo. divIcon html je plain string (nie JSX) — diffMarkShape (tripShared, zdieľané
// s <DiffMark> v React kontexte) len skladá tú istú .trp-diffmark-- triedu, aby tvar/farba
// pictogramu bol na jednom mieste (bod 6). iconSize/iconAnchor zámerne neuvedené — .trp-pill
// sa centruje cez CSS (position:relative;left:-50%;top:-100%), lebo šírka je dynamická (km text).
// journey (diaľková, viacdňová) = ČERVENÁ bublinka + biely trojuholník + biele písmo —
// odlíšenie od bežných tripov (čierny pill), lebo journey má vždy podstatne viac km.
const pillIcon = (tr: HeroTrail, hot: boolean) => {
  const journey = tr.acts?.includes('journey');
  return L.divIcon({
    className: 'trp-pinwrap',
    html: `<div class="trp-pill${journey ? ' trp-pill--journey' : ''}${hot ? ' hot' : ''}"><span class="trp-diffmark trp-diffmark--${diffMarkShape(tr.diff)}"></span><span>${tr.km} km</span></div>`,
  });
};

// vodná plocha (jazero/priehrada) = MODRÝ kruh s VLNKAMI, ŽIADNY názov (Matej 2026-07-24).
// Počet vlniek = veľkosť plochy: 1 = malá (<100 ha) · 2 = stredná (100–1000) · 3 = veľká (>1000).
// Zaradenie z OSM plochy (plany/compute-water-waves.py → gen). Kruh mierne rastie s kategóriou.
// Farebná logika mapy: čierny pill = hike trasa · červená = diaľkové (journey) · modrá = voda.
const waterIcon = (waves?: number) => {
  const n = Math.min(3, Math.max(1, waves || 1));
  const wave = (y: number) => `<path d="M1 ${y} Q3.25 ${y - 2} 5.5 ${y} T10 ${y} T14.5 ${y}" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>`;
  const ys = n === 1 ? [7.5] : n === 2 ? [5, 10] : [3.5, 7.5, 11.5];
  return L.divIcon({
    className: 'trp-pinwrap',
    html: `<div class="trp-waterdot trp-waterdot--${n}"><svg viewBox="0 0 15.5 15" width="15" height="15" aria-hidden="true">${ys.map(wave).join('')}</svg></div>`,
  });
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
    const mobile = typeof window !== 'undefined' && window.innerWidth <= 760;
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

const CSS = `
.trp-root{position:fixed;inset:0;overflow:hidden;background:#000;color:rgba(245,240,228,0.9);font-family:'DM Sans',system-ui,sans-serif;display:flex;flex-direction:column;}

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
.trp-toprow-select{flex:1 1 140px;min-width:120px;background:${T.glass};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid ${T.onDarkBorder};border-radius:12px;padding:10px 15px;box-shadow:0 6px 22px rgba(0,0,0,0.4);color:${T.onDark};font-family:inherit;font-size:13px;cursor:pointer;outline:0;}
.trp-toprow-select:focus{border-color:${GOLD};}

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
   žije v zdieľanom bottom nave (PackBottomNav), duplicita zrušená. .trp-status-right
   preto už netlačí doprava (margin-left:auto zrušené) — hugne prirodzene zľava. */
.trp-status-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap;width:100%;background:${T.glass};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid ${T.onDarkBorder};border-radius:14px;padding:13px 20px;box-shadow:0 10px 30px rgba(0,0,0,0.35);}

.trp-status-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.trp-stat-pill{display:flex;align-items:center;gap:6px;background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};border-radius:999px;padding:9px 15px;}
.trp-stat-pill img{width:14px;height:14px;filter:brightness(0) invert(1);opacity:.75;flex-shrink:0;}
.trp-stat-pill span{font-family:'Cinzel',serif;font-weight:700;font-size:13px;color:${GOLD};line-height:1;}
.trp-stat-pill b{font-family:'Cinzel',serif;font-weight:700;font-size:13px;color:rgba(245,240,228,0.92);white-space:nowrap;}
button.trp-stat-pill{cursor:pointer;transition:all .15s;}
button.trp-stat-pill:hover{border-color:${GOLD};}
button.trp-stat-pill.on{background:${GOLD};border-color:${GOLD};}
button.trp-stat-pill.on span,button.trp-stat-pill.on b{color:${INK};}
.trp-addtrip-btn{flex-shrink:0;display:inline-flex;align-items:center;gap:5px;font-family:'Cinzel',serif;font-weight:700;font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:9px 16px;border-radius:8px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border:1px solid rgba(250,244,236,0.3);cursor:pointer;white-space:nowrap;}
.trp-addtrip-btn:hover{filter:brightness(1.05);}
/* Matej 2026-07-24: "+" brand ikonka pred textom — plus.svg je natívne čierne (fill hardcoded,
   nie currentColor), čo na zlatom gradiente číta ako tmavá/INK farba presne ako treba — žiadny
   invert filter (to by ju zmenilo na bielu). */
.trp-addtrip-icon{width:13px;height:13px;flex-shrink:0;display:block;}

.trp-greet-hi{font-family:'Cinzel',serif;font-weight:700;font-size:13px;color:rgba(245,240,228,0.65);}
.trp-greet-sub{font-family:'Cinzel',serif;font-weight:700;font-size:19px;color:${GOLD};letter-spacing:.01em;margin-top:2px;line-height:1.25;}

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
.trp-sortpop--desk button.on{color:${GOLD};font-weight:700;}
.trp-sortpop--desk button:hover{background:rgba(201,154,63,0.14);}

/* category pills — Trips active (solid gold), rest dashed + muted, CSS
   tooltip on hover ("Coming soon"), no inline "Soon" label anymore. Iterácia 7
   (Matejov feedback bod 1): FULL-WIDTH grid, 4 rovnaké stĺpce, edge-to-edge —
   rovnako široké ako dropdowny pod nimi. */
.trp-cat-pills{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;}
.trp-catpill{width:100%;padding:12px 8px;border-radius:10px;border:1px solid rgba(245,240,228,0.22);background:rgba(245,240,228,0.07);font-family:'Cinzel',serif;font-weight:700;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:rgba(245,240,228,0.78);cursor:pointer;white-space:nowrap;transition:all .15s;text-align:center;}
.trp-catpill.on{background:linear-gradient(135deg,#F5C73D,#E69E1A);border-color:rgba(250,244,236,0.3);color:#1c160c;box-shadow:0 4px 14px rgba(201,154,63,0.3);}
.trp-catpill.soon{border-style:dashed;opacity:.5;cursor:default;position:relative;}
.trp-catpill.soon:hover{opacity:.8;}
.trp-catpill.soon::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:${CARD};color:${INK};font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;padding:5px 10px;border-radius:6px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s;box-shadow:0 8px 22px rgba(0,0,0,0.45);z-index:5;}
.trp-catpill.soon:hover::after{opacity:1;}

/* country select — flag + 3-letter code; native <select> so the dropdown escapes
   the panel's overflow:hidden cleanly (no popover-clip risk). Only SK enabled. */
.trp-country-select,.trp-filter-select{width:100%;min-width:0;background:rgba(245,240,228,0.05);border:1px solid rgba(245,240,228,0.16);border-radius:9px;padding:8px 9px;color:rgba(245,240,228,0.85);font-family:inherit;font-size:11.5px;cursor:pointer;outline:0;}
.trp-country-select:focus,.trp-filter-select:focus{border-color:${GOLD};}
/* geo kaskáda (Matejov feedback bod 4, iterácia 7; Pohorie vrátené iterácia 9): country
   (malinký, flag+kód) → región (West/Center/East) → pohorie (tr.region), 3 stĺpce vedľa seba. */
.trp-georow{display:grid;grid-template-columns:78px 1fr 1fr;gap:7px;}
.trp-georow .trp-country-select{padding:8px 6px;}

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
/* náročnosť + popularita STACKED — dolný PRAVÝ roh fotky (PhotoMetaPills). Hazard tu NIE. */
.trp-bigcard-photometa{position:absolute;right:9px;bottom:9px;z-index:2;}
.trp-bigcard-photoactbtn{display:flex;align-items:center;gap:5px;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.22);color:#fff;font-family:'Cinzel',serif;font-weight:700;font-size:10px;letter-spacing:.02em;padding:6px 10px;border-radius:999px;cursor:pointer;white-space:nowrap;}
.trp-bigcard-photoactbtn:hover{border-color:${GOLD};}
.trp-bigcard-photoactbtn.on{background:${GOLD};border-color:${GOLD};color:${INK};}
/* bod 3: telo karty = 2 stĺpce — vľavo 3 riadky (loc/název/autor), vpravo rating·difficulty·Crowd */
/* align-items:center (Matej 2026-07-22) — rating (pravý stĺpec) vertikálne na STRED karty,
   nie pri hornom okraji. */
.trp-bigcard-body{padding:11px 13px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;}
.trp-bigcard-info{min-width:0;}
/* pohorie · región label, pod fotkou (Matejov feedback bod 3, iterácia 7) */
.trp-bigcard-loc{font-family:'Cinzel',serif;font-weight:700;font-size:9px;letter-spacing:.07em;text-transform:uppercase;color:rgba(245,240,228,0.45);margin-bottom:3px;}
/* bod 4 (iterácia 16): line-clamp 2 riadky, nech dlhé názvy nerozbíjajú layout */
.trp-bigcard-name{font-family:'Cinzel',serif;font-weight:700;font-size:13.5px;color:rgba(245,240,228,0.92);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
/* bod 6: "by {author}" riadok + avatarpair (majiteľ+pes) — .trp-bigcard-author je teraz
   inline text vedľa avatarov, nie vlastný blok (margin presunutý na wrapper riadok). */
.trp-bigcard-authorrow{display:flex;align-items:center;gap:6px;margin-top:4px;}
.trp-bigcard-author{font-size:10px;color:rgba(245,240,228,0.45);}
.trp-bigcard-meta2{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;}
.trp-bigcard-meta2 span{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;white-space:nowrap;}
.trp-bigcard-meta2-row{color:rgba(245,240,228,0.55);}
.trp-bigcard-star{color:${GOLD};font-weight:700;}

/* bod 6 (iterácia 16): dva prekrývajúce sa kruhové avatary (majiteľ + pes) pri "by {author}"
   riadku — zdieľané medzi kartou a inline detailom (AuthorAvatars komponent), veľkosť cez
   --trp-av-size CSS var (size prop, rôzna pre kompaktnú kartu vs. priestrannejší detail). */
.trp-avatarpair{display:inline-flex;align-items:center;flex-shrink:0;}
.trp-avatarcircle{width:var(--trp-av-size,16px);height:var(--trp-av-size,16px);border-radius:50%;border:1.5px solid ${T.pageBg};background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;font-family:'Cinzel',serif;font-weight:700;font-size:calc(var(--trp-av-size,16px) * 0.42);color:#1c160c;}
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
.trp-inldet-authoravatar span{font-family:'Cinzel',serif;font-weight:700;font-size:12px;color:#1c160c;}
.trp-inldet-savebtn{position:absolute;bottom:10px;right:10px;z-index:3;display:flex;align-items:center;gap:5px;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);border:1.5px solid rgba(255,255,255,0.28);color:#fff;font-family:'Cinzel',serif;font-weight:700;font-size:10.5px;padding:7px 12px;border-radius:999px;cursor:pointer;white-space:nowrap;}
.trp-inldet-savebtn.on{background:${GOLD};border-color:${GOLD};color:${INK};}
/* bod 4 (i15) + bod 1/2/6 (i16): 2 stĺpce (ako karta) — vľavo 3 riadky (loc/název/autor+
   avatarpair), vpravo rating(packy+číslo)+difficulty+km+Crowd. Tagy a text idú POD tento blok
   (mimo gridu, vlastný riadok). */
.trp-inldet-main{display:grid;grid-template-columns:1fr auto;gap:14px;margin-top:12px;align-items:center;}
.trp-inldet-loc{font-family:'Cinzel',serif;font-weight:700;font-size:9px;letter-spacing:.07em;text-transform:uppercase;color:${T.onDarkDim};}
/* bod 4 (iterácia 16): line-clamp 2 riadky */
.trp-inldet-name{font-family:'Cinzel',serif;font-weight:700;font-size:17px;color:${T.onDark};margin-top:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
/* bod 6: "by {author}" riadok + avatarpair (majiteľ+pes), rovnaký vzor ako karta */
.trp-inldet-authorrow{display:flex;align-items:center;gap:7px;margin-top:5px;}
.trp-inldet-author{font-size:10.5px;color:${T.onDarkDim};}
.trp-inldet-meta2{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;}
.trp-inldet-meta2-row{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:${T.onDarkDim};white-space:nowrap;}
/* bod 2 (iterácia 16): rating = 5-pack (RatingPaws, tripShared) + stars.toFixed(1) */
.trp-inldet-rating{display:inline-flex;align-items:center;gap:6px;}
.trp-inldet-rating b{font-family:'Cinzel',serif;font-weight:700;font-size:12px;color:${GOLD};}
/* bod 4: tagy JEDEN riadok vedľa seba (nie stĺpec/pravá strana ako v i12) */
.trp-inldet-tagrow{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px;}
.trp-inldet-tag{background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:10.5px;font-weight:600;padding:5px 10px;border-radius:999px;white-space:nowrap;}
.trp-inldet-desc{font-size:12.5px;line-height:1.6;color:${T.onDarkDim};margin-top:10px;}
/* bod 4: Comments + "Walked by N Dogyptians" — placeholder empty-state sekcie */
.trp-inldet-section{margin-top:16px;}
.trp-inldet-section h4{font-family:'Cinzel',serif;font-weight:700;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:${T.onDark};margin-bottom:6px;}
.trp-inldet-empty{font-size:11.5px;color:${T.onDarkDim};font-style:italic;}
.trp-inldet-actions{display:flex;gap:9px;padding:14px 20px 20px;border-top:1px solid ${T.onDarkHair};flex-shrink:0;}
.trp-inldet-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-family:'Cinzel',serif;font-weight:700;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;padding:10px 8px;border-radius:10px;cursor:pointer;border:1px solid transparent;transition:all .15s;}
.trp-inldet-btn--ghost{background:rgba(245,240,228,0.06);color:${T.onDark};border-color:${T.onDarkBorder};}
.trp-inldet-btn--ghost.on{background:rgba(201,154,63,0.16);color:${GOLD};border-color:${GOLD};}

/* ── bod 6 (iterácia 11): ADD TRIP setup — draw-on-map recyklovaný z
   AddTrailFlow.tsx (handleMapClick/undo/clear/haversine), preštýlovaný do
   tmavého portal panela. Submit ide len do lokálneho session state (viď
   submitAdd) — DB zápis je mimo rozsahu tejto iterácie. ── */
.trp-addsetup{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:hidden;}
.trp-addsetup-head{display:flex;align-items:center;gap:10px;padding:16px 20px 10px;flex-shrink:0;}
.trp-addsetup-title{font-family:'Cinzel',serif;font-weight:700;font-size:14px;color:${T.onDark};}
.trp-addsetup-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:4px 20px 16px;display:flex;flex-direction:column;gap:13px;}
.trp-addsetup-field label{display:block;font-family:'Cinzel',serif;font-weight:700;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:${T.onDarkDim};margin-bottom:6px;}
.trp-addsetup-input{width:100%;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:9px;padding:9px 11px;color:${T.onDark};font-family:inherit;font-size:12.5px;outline:0;}
.trp-addsetup-input:focus{border-color:${GOLD};}
.trp-addsetup-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.trp-multitoggle{margin-top:6px;background:none;border:0;padding:2px 0;color:${GOLD};font-family:inherit;font-size:11.5px;font-weight:600;cursor:pointer;opacity:.85;}
.trp-multitoggle:hover{opacity:1;text-decoration:underline;}
.trp-plannedpill{display:inline-block;font-family:'Cinzel',serif;font-weight:700;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#F5C73D;background:rgba(0,0,0,0.5);padding:4px 9px;border-radius:7px;border:1px solid rgba(201,154,63,0.5);}
.trp-norating{font-size:22px;font-weight:700;color:rgba(245,240,228,0.35);letter-spacing:.05em;}
.trp-planmarker-dot{width:16px;height:16px;border-radius:50% 50% 50% 0;background:#FF5FA2;border:2.5px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 7px rgba(0,0,0,0.5);}
/* plánovanie (Matej 2026-07-23): 3 date dropdowny (deň/mesiac/rok) + profil note. */
.trp-addsetup-daterow{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
.trp-addsetup-profilenote{font-size:11.5px;line-height:1.5;color:${GOLD};background:rgba(201,154,63,0.1);border:1px solid rgba(201,154,63,0.3);border-radius:10px;padding:11px 13px;}
/* TODO: forest placeholder foto (Cloudinary) doplniť keď Matej vyberie z 10 návrhov → background-image na .trp-planph */
.trp-planph{position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;margin-bottom:12px;overflow:hidden;background:linear-gradient(135deg,#1c2b1a,#0e1a0d);display:flex;align-items:center;justify-content:center;border:1px solid rgba(245,240,228,0.12);}
.trp-planph-badge{font-family:'Cinzel',serif;font-weight:700;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#F5C73D;background:rgba(0,0,0,0.45);padding:8px 14px;border-radius:8px;border:1px solid rgba(201,154,63,0.5);}
.trp-planpin{padding:9px 11px;border-radius:9px;border:1px dashed rgba(201,154,63,0.5);background:rgba(201,154,63,0.06);color:rgba(245,240,228,0.75);font-size:12px;}
.trp-planpin.set{border-style:solid;color:${GOLD};}
.trp-addsetup-file{font-size:11px;color:${T.onDarkDim};}
.trp-addsetup-photos{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px;}
.trp-addsetup-photo{position:relative;width:64px;height:64px;border-radius:8px;background-size:cover;background-position:center;}
.trp-addsetup-photo button{position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,0.75);color:#fff;border:none;font-size:11px;line-height:1;cursor:pointer;}
.trp-addsetup-stars{display:flex;gap:4px;}
.trp-addsetup-stars button{background:none;border:none;font-size:20px;color:rgba(245,240,228,0.22);cursor:pointer;line-height:1;}
.trp-addsetup-stars button.on{color:${GOLD};}
.trp-addsetup-livekm{font-family:'Cinzel',serif;font-weight:700;font-size:11.5px;color:${GOLD};background:rgba(201,154,63,0.1);border:1px solid rgba(201,154,63,0.3);border-radius:9px;padding:9px 11px;}
.trp-addsetup-submit{flex-shrink:0;margin:0 20px 20px;font-family:'Cinzel',serif;font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:10px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border:1px solid rgba(250,244,236,0.3);cursor:pointer;}
.trp-addsetup-submit:disabled{opacity:.45;cursor:default;}

/* draw hint bubble — shown on the map while ADD TRIP is open (bod 6) */
/* Matej 2026-07-23: hint bol hore v headri (zle) → POD search-a-place riadkom (top:120px),
   ČERVENÝ a väčší, nech je jasne vidno. Mobile override nižšie ho drží pod mobilným headerom. */
.trp-drawhint{position:absolute;top:152px;left:calc(50% + ${PANEL_W / 2}px);transform:translateX(-50%);z-index:750;background:rgba(178,38,30,0.94);backdrop-filter:blur(10px);border:1.5px solid rgba(255,124,112,0.7);border-radius:12px;padding:13px 22px;box-shadow:0 12px 34px rgba(120,20,14,0.5);display:flex;align-items:center;gap:14px;max-width:calc(100vw - ${PANEL_W + 60}px);}
.trp-drawhint-txt{font-size:15px;font-weight:700;color:#fff;white-space:nowrap;}
.trp-drawhint-actions{display:flex;gap:8px;flex-shrink:0;}
.trp-drawhint-actions button{font-family:'Cinzel',serif;font-weight:700;font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:${GOLD};background:none;border:none;cursor:pointer;text-decoration:underline;}

/* ── mobile-only surfaces (header/list/toggle/ADD overlay), hidden on desktop — see the
   ≤760px media query below for their real layout (bod 5 i11, bod 4 i14). ── */
.trp-mheader,.trp-mtoggle,.trp-mlist,.trp-madd,.trp-madd-drawbtn{display:none;}

/* ── map region — full-bleed, the floating panel sits on top of it ── */
.trp-mapregion{position:absolute;inset:0;z-index:0;}
.trp-mapfull{position:absolute;inset:0;z-index:0;}
.trp-mapfull .leaflet-container{width:100%;height:100%;background:#0a0a0a;}
.trp-attr{position:absolute;right:10px;bottom:10px;z-index:800;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.85);border-radius:4px;padding:2px 7px;font-size:9px;color:#333;}
/* D4 nav rework (2026-07-24, Matej): notif+messages žijú VNÚTRI status headra, odtlačené do
   jeho pravého rohu cez margin-left:auto (sibling .trp-status-right v .trp-status-row /
   .trp-mheader-status). width:auto zruší inline-layout w-full, nech je to kompaktný klaster. */
.trp-header-notif{margin-left:auto;width:auto!important;}
/* pravý vertikálny ovládací stack (AllTrails vzor): štýl / zoom / poloha —
   z-index 800 musí prebiť Leaflet vlastné panes (idú až po 700). */
.trp-ctlstack{position:absolute;top:16px;right:16px;z-index:800;display:flex;flex-direction:column;align-items:flex-end;gap:10px;}
/* bod 2 (iterácia 12): Terrain/Satellite/Winter stack → JEDNO kruhové tlačidlo, prepína
   len outdoor↔aerial (Winter úplne preč, aj z mapStyle typu aj z mapyTiles volania). */
.trp-stylebtn{width:38px;height:38px;border-radius:50%;background:${CARD};border:1px solid rgba(201,154,63,0.45);box-shadow:0 3px 10px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.trp-stylebtn:hover{border-color:${GOLD};}
.trp-stylebtn img{width:18px;height:18px;filter:brightness(0) saturate(0);opacity:.75;}
.trp-zoomgroup{display:flex;flex-direction:column;background:${CARD};border:1px solid rgba(201,154,63,0.45);border-radius:9px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,0.4);}
.trp-zoomgroup button{background:none;border:none;cursor:pointer;width:38px;height:36px;font-size:17px;font-weight:700;line-height:1;color:${INK};display:flex;align-items:center;justify-content:center;}
.trp-zoomgroup button:first-child{border-bottom:1px solid rgba(31,26,14,0.12);}
.trp-zoomgroup button:hover{background:rgba(201,154,63,0.12);}
.trp-locatebtn{width:38px;height:38px;border-radius:9px;background:${CARD};border:1px solid rgba(201,154,63,0.45);box-shadow:0 3px 10px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.trp-locatebtn:hover{border-color:${GOLD};}
.trp-locatebtn img{width:18px;height:18px;filter:brightness(0) saturate(0);opacity:.7;}
.trp-locatebtn.loading img{opacity:.35;}
.trp-mapfull .leaflet-control-scale{margin-left:12px;margin-bottom:12px;}
.trp-mapfull .leaflet-control-scale-line{background:rgba(255,255,255,0.8);border-color:rgba(31,26,14,0.55);color:#2a2a2a;font-size:10px;}

/* bod 3 (iterácia 12): marker = čierny pill (diffmark + km), ŽIADNE poradové číslo. Pozícia
   centrovaná cez left:-50%/top:-100% (dynamická šírka podľa km textu — viď pillIcon komentár). */
.trp-pinwrap{background:none;border:0;}
.trp-pill{position:relative;left:-50%;top:-100%;display:inline-flex;align-items:center;gap:5px;background:#141414;color:#fff;font-family:'Cinzel',serif;font-weight:700;font-size:10.5px;padding:5px 9px 5px 7px;border-radius:999px;border:1.5px solid rgba(255,255,255,0.16);box-shadow:0 3px 10px rgba(0,0,0,0.5);white-space:nowrap;transition:all .15s;}
.trp-pill.hot{border-color:${GOLD};box-shadow:0 0 0 3px rgba(245,199,61,0.3),0 4px 12px rgba(0,0,0,0.6);}
.trp-pill--journey{background:#E01B22;color:#fff;border-color:rgba(255,255,255,0.55);}
.trp-pill--journey.hot{border-color:#fff;box-shadow:0 0 0 3px rgba(224,27,34,0.35),0 4px 12px rgba(0,0,0,0.6);}
.trp-pill--journey .trp-diffmark--triangle{border-bottom-color:#fff;}
.trp-pill--journey .trp-diffmark--circle,.trp-pill--journey .trp-diffmark--square{background:#fff;}
/* vodná plocha = modrý kruh s 1–3 vlnkami (bez názvu). Kruh rastie s kategóriou plochy. */
.trp-waterdot{position:relative;left:-50%;top:-50%;display:flex;align-items:center;justify-content:center;background:#2E6FD6;border-radius:50%;border:1.5px solid rgba(255,255,255,0.6);box-shadow:0 3px 9px rgba(0,0,0,0.45);cursor:pointer;transition:transform .12s;}
.trp-waterdot:hover{transform:scale(1.12);}
.trp-waterdot--1{width:22px;height:22px;}
.trp-waterdot--2{width:26px;height:26px;}
.trp-waterdot--3{width:30px;height:30px;}
.trp-waterdot svg{display:block;}
/* farebná legenda mapy — floating vpravo dole, nad Dev nav / atribúciou */
.trp-legend{position:absolute;right:12px;bottom:54px;z-index:600;display:flex;flex-direction:column;gap:4px;background:rgba(20,20,20,0.82);backdrop-filter:blur(6px);padding:8px 11px;border-radius:12px;border:1px solid rgba(255,255,255,0.14);box-shadow:0 4px 14px rgba(0,0,0,0.45);font-family:'Cinzel',serif;font-weight:700;font-size:10.5px;color:#fff;letter-spacing:.3px;pointer-events:none;}
.trp-legrow{display:flex;align-items:center;gap:7px;}
.trp-legdot{width:12px;height:12px;border-radius:50%;flex:0 0 auto;border:1.5px solid rgba(255,255,255,0.5);}
.trp-legdot--hike{background:#141414;}
.trp-legdot--journey{background:#E01B22;}
.trp-legdot--water{background:#2E6FD6;}
/* plánovaný trip = ružový teardrop pin (zhoduje sa s .trp-planmarker-dot na mape) */
.trp-legdot--planned{background:#FF5FA2;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border-color:#fff;}
/* bod 2 (iterácia 17): live "{km} km" label pri konci kreslenej trasy (ADD flow draw) —
   rovnaká centrovacia technika ako .trp-pill (left:-50%/top:-100%), o kúsok vyššie (-10px
   extra gap), nech nesedí priamo na poslednom bode trasy. */
.trp-drawlabel{position:relative;left:-50%;top:calc(-100% - 10px);background:rgba(6,5,3,0.92);color:${GOLD};font-family:'Cinzel',serif;font-weight:700;font-size:10.5px;padding:4px 10px;border-radius:999px;border:1.5px solid ${GOLD};box-shadow:0 3px 10px rgba(0,0,0,0.5);white-space:nowrap;}
${DIFF_MARK_CSS}

/* ── desktop: floating bottom nav stays CENTERED (PackBottomNav default —
   left:50%/translateX untouched); only its bottom offset is pinned so it
   lines up with the floating panel's bottom edge (both 20px). Scoped under
   .trp-root so it never touches other /pack pages. ── */
@media (min-width:761px){
  .trp-root .fixed.z-40{ bottom:20px !important; }
}

/* ── mobile (≤760px) — bod 5, iterácia 11: map-first + LIST/MAP toggle +
   full-width liquid-glass header. Nahradzuje starý floating .trp-topbar
   (skrytý) a starý bottom-sheet .trp-sidebar (skrytý — inline DETAIL/ADD sú
   desktop-only, mobile detail ide priamo na full-page článok — PackTripArticle,
   iterácia 12 bod 5). Nav stays centered + fixed, untouched (PackBottomNav
   default). ── */
@media (max-width:760px){
  .trp-topbar{display:none;}
  .trp-sidebar{display:none;}

  /* bod 1 (iterácia 13): 78px → 122px — header je teraz 2-riadkový (status + search row),
     vyšší ako predtým, ctlstack/drawhint musia začínať POD ním, nie ho prekrývať. */
  .trp-ctlstack{top:calc(env(safe-area-inset-top,0px) + 122px);right:12px;gap:7px;}

  .trp-stylebtn{width:34px;height:34px;}
  .trp-stylebtn img{width:16px;height:16px;}
  .trp-zoomgroup button{width:34px;height:32px;font-size:15px;}
  .trp-locatebtn{width:34px;height:34px;}
  .trp-locatebtn img{width:16px;height:16px;}

  .trp-drawhint{left:50%;max-width:calc(100vw - 40px);top:calc(env(safe-area-inset-top,0px) + 122px);}

  /* bod 1 (iterácia 13, prestavané i15): mobilný header = 2 riadky — (1) status (avatar +
     renderStatusRight() pilulky, ako desktop .trp-status-row) + (2) search+dropdowny+filter
     (i12 bod 7). .trp-mheader je teraz column namiesto jedného riadku. */
  .trp-mheader{display:flex;flex-direction:column;gap:8px;position:absolute;top:0;left:0;right:0;z-index:900;background:${T.glass};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid ${T.onDarkBorder};padding:calc(env(safe-area-inset-top,0px) + 10px) 10px 10px;}
  .trp-mheader-status{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
  .trp-mheader-status .trp-status-right{gap:6px;}
  .trp-mheader-status .trp-stat-pill{gap:4px;padding:5px 9px;}
  .trp-mheader-status .trp-stat-pill img{width:11px;height:11px;}
  .trp-mheader-status .trp-stat-pill span,.trp-mheader-status .trp-stat-pill b{font-size:10.5px;}
  .trp-mheader-status .trp-addtrip-btn{padding:7px 12px;font-size:9.5px;}
  .trp-mheader-row2{display:flex;align-items:center;gap:6px;}
  .trp-mheader-scroll{display:flex;align-items:center;gap:6px;flex:1 1 auto;min-width:0;overflow-x:auto;scrollbar-width:none;}
  .trp-mheader-scroll::-webkit-scrollbar{display:none;}
  .trp-mheader .trp-mapsearch{flex:0 0 96px;min-width:96px;padding:6px 10px;border-radius:999px;}
  .trp-mheader .trp-mapsearch img{width:12px;height:12px;}
  .trp-mheader .trp-mapsearch input{font-size:11.5px;}
  /* bod 2 (iterácia 13): flex:1 1 0 (nie auto) — 3 selecty sa DELIA o zvyšný priestor a
     zmršťujú (min-width:0 + ellipsis), nech sa vždy zmestia všetky tri + filter ikonka do
     riadku bez orezania (predtým "popularity" vypadávalo mimo viewport). */
  .trp-mheader-select{flex:1 1 0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:${T.glassSoft};border:1px solid ${T.onDarkBorder};border-radius:999px;padding:6px 8px;color:${T.onDark};font-size:10px;font-family:inherit;outline:0;}
  .trp-mfilterwrap{position:relative;flex-shrink:0;}
  .trp-mfiltericon{width:32px;height:32px;border-radius:50%;background:${T.glassSoft};border:1px solid ${T.onDarkBorder};display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}
  .trp-mfiltericon img{width:15px;height:15px;filter:brightness(0) invert(1);opacity:.8;}
  .trp-sortpop{position:absolute;top:calc(100% + 8px);right:0;background:rgba(6,5,3,0.94);backdrop-filter:blur(8px);border:1px solid ${T.onDarkBorder};border-radius:10px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);z-index:950;min-width:132px;}
  .trp-sortpop button{display:block;width:100%;text-align:left;padding:10px 14px;font-size:12px;color:${T.onDark};background:none;border:0;border-bottom:1px solid ${T.onDarkHair};cursor:pointer;}
  .trp-sortpop button:last-child{border-bottom:0;}
  .trp-sortpop button.on{color:${GOLD};font-weight:700;}
  .trp-sortpop button:hover{background:rgba(201,154,63,0.14);}

  /* LIST/MAP toggle pill, bottom-center — default view = map (žiadny
     bottom-sheet defaultne), klik prepína celú stránku na zoznam. */
  .trp-mtoggle{display:flex;position:absolute;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 78px);z-index:900;font-family:'Cinzel',serif;font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:11px 26px;border-radius:999px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border:1px solid rgba(250,244,236,0.3);box-shadow:0 10px 30px rgba(0,0,0,0.4);cursor:pointer;}

  /* full-page card list — replaces the map (not an overlay) when mobileView==='list'.
     top padding 122px (bod 1) matches the now-taller 2-row .trp-mheader. */
  .trp-mlist{position:absolute;inset:0;z-index:60;overflow-y:auto;background:#050505;padding:calc(env(safe-area-inset-top,0px) + 122px) 14px 100px;}
  .trp-root.mlist-active .trp-mapregion{display:none;}
  .trp-root.mlist-active .trp-mlist{display:block;}

  /* bod 4 (iterácia 14): ADD TRIP full-screen overlay — .trp-sidebar (desktop ADD setup home)
     je tu display:none, tak renderAddSetup() beží znova vo full-screen .trp-madd namiesto. */
  .trp-madd{display:flex;flex-direction:column;position:fixed;inset:0;z-index:950;background:#0a0a0a;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);}
  .trp-madd .trp-addsetup{background:transparent;}
  .trp-madd-drawbtn{display:block;width:100%;margin-top:2px;font-family:'Cinzel',serif;font-weight:700;font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:11px;border-radius:9px;background:rgba(201,154,63,0.14);border:1px solid rgba(201,154,63,0.4);color:${GOLD};cursor:pointer;}
}

`;

export default function PackPortal() {
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

  // bod 6 — ADD TRIP flow (recyklované z AddTrailFlow.tsx: click-to-draw, undo/clear, km).
  const [addOpen, setAddOpen] = useState(false);
  const [drawPoints, setDrawPoints] = useState<LatLngTuple[]>([]);
  const [addName, setAddName] = useState('');
  const [addDate, setAddDate] = useState('');
  const [addRegion, setAddRegion] = useState('');
  const [addCountry, setAddCountry] = useState(''); // '' = auto z trasy; hodnota = manuálny override
  const [addDiff, setAddDiff] = useState<'' | 'Easy' | 'Moderate' | 'Hard'>('');
  const [addMultiTrip, setAddMultiTrip] = useState(false);     // toggle „+ multi-day" → odhalí End date
  const [addDateEnd, setAddDateEnd] = useState('');            // koniec multideň tripu → odomkne Journey
  const [addCrowd, setAddCrowd] = useState<'' | 'Pokojné' | 'Rušné' | 'Ľudoprázdne'>(''); // popularita
  const [addSurface, setAddSurface] = useState<Set<string>>(new Set()); // 'forest' | 'asphalt'
  const [addPlanPoint, setAddPlanPoint] = useState<LatLngTuple | null>(null); // planning pin
  const toggleAddSurface = (s: string) => setAddSurface((prev) => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  const [addTags, setAddTags] = useState<Set<string>>(new Set());
  // F1 (Matej 2026-07-24): „Add-trip — pridať možnosť hrozby (hazards), teraz tam nie je."
  // Hazards nie sú vlastnosť TRASY ale HLÁSENIE CHODCA (agregujú sa ako % chodcov), preto
  // idú do hlasu autora (setVotes nižšie), nie do HeroTrail. VOLITEĽNÉ — nie v addMissing:
  // „žiadne nebezpečenstvá" je legitímna odpoveď a nedá sa odlíšiť od nevyplneného.
  const [addHazards, setAddHazards] = useState<Set<Hazard>>(new Set());
  const toggleAddHazard = (h: Hazard) => setAddHazards((prev) => { const n = new Set(prev); n.has(h) ? n.delete(h) : n.add(h); return n; });
  const [addActs, setAddActs] = useState<Set<string>>(new Set());
  // Journey = viacdňová (Start+End) A dostatočne dlhá (≥50 km). MUSÍ byť tu (pred early-return
  // `if (!id.session)`), inak useEffect po podmienenom return poruší Rules of Hooks (biela stránka).
  const isMultiDay = addMultiTrip && !!addDateEnd && addDateEnd > addDate;
  const drawKm = totalDistanceM(drawPoints) / 1000;
  const journeyOk = isMultiDay && drawKm >= 50;
  useEffect(() => { if (!journeyOk && addActs.has('journey')) setAddActs((prev) => { const n = new Set(prev); n.delete('journey'); return n; }); }, [journeyOk]); // eslint-disable-line react-hooks/exhaustive-deps
  // „kto bol so mnou" — spoločníci (svorka + iní členovia), Matej 2026-07-23. Bol to string,
  // teraz štruktúrovaný výber cez CompanionPicker.
  const [addCrew, setAddCrew] = useState<Companion[]>([]);
  const [addPhotos, setAddPhotos] = useState<string[]>([]);
  const [addPhotoNote, setAddPhotoNote] = useState('');   // feedback pri zahodených/HEIC/prebytočných fotkách
  const [addError, setAddError] = useState('');           // chyba pri ukladaní (napr. plný localStorage)
  const [addRating, setAddRating] = useState(0);
  // bod 4 (iterácia 14): mobile ADD overlay (.trp-madd) prekrýva celú obrazovku vrátane mapy,
  // takže "Draw route on map" dočasne SCHOVÁ formulár (mobileDrawing=true) nech je mapa
  // klikateľná; "Done" v .trp-drawhint ju vráti. Draw samotný je nezávisle aktívny už len cez
  // addOpen (DrawClickCatcher), toto len riadi VIDITEĽNOSŤ .trp-madd na mobile.
  const [mobileDrawing, setMobileDrawing] = useState(false);
  // tripy pridané v tejto session (ADD flow submit) — lokálny state, NIE Supabase (mimo
  // rozsahu tejto iterácie); zobrazujú sa hneď na mape + v zozname pred statickými HERO_TRAILS.
  // sessionStorage mirror (viď vyššie) nech expand na čerstvo pridaný trip nájde aj po navigate.
  const [localTrails, setLocalTrails] = useState<HeroTrail[]>(() => readLocalTrails());
  useEffect(() => { writeLocalTrails(localTrails); }, [localTrails]);

  // TRIPSTATS Slice A (bod 3, Matej 2026-07-23) — add-trip z pohoria: TripStatsPanel „+ Add a
  // trip here" navigate-uje sem s ?add=<region>. Raz na mount: otvor ADD flow pre-filled na
  // daný región + odleť mapou na jeho stred. leafletMapRef môže byť ešte null (id.loading gate
  // odloží mount <MapContainer>) — pendingFlyRef drží cieľ, MapRefBridge onReady ho skonzumuje
  // keď mapa domountuje.
  useEffect(() => {
    const addParam = searchParams.get('add');
    if (!addParam) return;
    setAddRegion(addParam);
    setDrawPoints([]);
    setAddOpen(true);
    const target = regionCenter(addParam);
    if (leafletMapRef.current) leafletMapRef.current.flyTo(target, 11, { duration: 1.2 });
    else pendingFlyRef.current = target;
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // bod 5 — mobile map-first + LIST/MAP toggle + FILTER (sort) popover.
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileSort, setMobileSort] = useState<'' | 'top' | 'easiest' | 'hardest'>('');

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
  // ADD lifecycle (design §E): najprv voľba zámeru, potom form. addMode určuje polia + kam to ide.
  const [addModeChoiceOpen, setAddModeChoiceOpen] = useState(false);
  const [addMode, setAddMode] = useState<'planning' | 'done'>('done');
  const [addSocial, setAddSocial] = useState('');
  // Matej 2026-07-23: PLÁNOVANIE zjednodušené — názov = aktivita + lokalita; dátum = 3 dropdowny
  // (deň/mesiac/rok), min. rok; žiadny región/difficulty/tagy vopred; správa o tripe = technické
  // veci (idem autom, ostávam celý deň…) + info z profilu sa priloží.
  const [addPlanAct, setAddPlanAct] = useState('');
  const [addPlanLoc, setAddPlanLoc] = useState('');
  const [addYear, setAddYear] = useState('');
  const [addMonth, setAddMonth] = useState('');
  const [addDay, setAddDay] = useState('');

  const allTrails = useMemo(() => [...localTrails, ...HERO_JOURNEYS, ...HERO_TRAILS], [localTrails]);
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
    if (typeof window !== 'undefined' && window.innerWidth <= 760) {
      navigate(`/pack/map/${tr.id}`);
      return;
    }
    setAddOpen(false);
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
  // carousel na veľkej foto-karte — cyklí photoIdx pre daný trip, dir = -1/+1
  const cyclePhoto = (tid: string, dir: -1 | 1, total: number) => setPhotoIdx((prev) => {
    const cur = prev[tid] ?? 0;
    return { ...prev, [tid]: (cur + dir + total) % total };
  });

  // ── bod 6: ADD TRIP flow handlers ──────────────────────────────────────
  const toggleAddTag = (tag: string) => setAddTags((prev) => {
    const n = new Set(prev); if (n.has(tag)) n.delete(tag); else n.add(tag); return n;
  });
  const toggleAddAct = (aid: string) => setAddActs((prev) => {
    const n = new Set(prev); if (n.has(aid)) n.delete(aid); else n.add(aid); return n;
  });
  // Fotky (Matej 2026-07-24): max 10 + aktívny optimalizátor veľkosti. Predtým sa ukladal
  // `blob:` URL z createObjectURL — ten po reloade tabu zomrie (rozbitý obrázok) A nespadol
  // by do localStorage zmysluplne. Teraz: každú fotku prekreslíme na canvas (longest side
  // ≤1280 px), export JPEG q0.72 → data URL. Prežije reload aj drží veľkosť pod kontrolou.
  const MAX_PHOTOS = 10;
  const optimizePhoto = (file: File, maxDim = 1280, quality = 0.72): Promise<string | null> =>
    new Promise((resolve) => {
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
  const handleAddPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    const imgs = picked.filter((f) => f.type.startsWith('image/'));
    const room = MAX_PHOTOS - addPhotos.length;
    if (room <= 0) { setAddPhotoNote(`Max ${MAX_PHOTOS} photos reached.`); return; }
    const take = imgs.slice(0, room);
    const results = await Promise.all(take.map((f) => optimizePhoto(f)));
    const ok = results.filter(Boolean) as string[];
    if (ok.length) setAddPhotos((prev) => [...prev, ...ok].slice(0, MAX_PHOTOS));
    // #2 + #5: povedz používateľovi čo sa nezmestilo / nedalo prečítať (HEIC z iPhonu → img.onerror).
    const notes: string[] = [];
    if (imgs.length > room) notes.push(`only ${room} added (max ${MAX_PHOTOS})`);
    const failed = results.length - ok.length;
    if (failed > 0) notes.push(`${failed} couldn't be read — use JPG/PNG (HEIC not supported)`);
    if (picked.length > imgs.length) notes.push(`${picked.length - imgs.length} skipped (not an image)`);
    setAddPhotoNote(notes.join(' · '));
  };
  const removeAddPhoto = (i: number) => setAddPhotos((prev) => prev.filter((_, idx) => idx !== i));
  // design §E: „Add trip" → najprv voľba zámeru (Plánujem / Prešiel som), potom form.
  const openAddChoice = () => setAddModeChoiceOpen(true);
  const pickAddMode = (m: 'planning' | 'done') => {
    setAddMode(m);
    setAddModeChoiceOpen(false);
    openAdd();
  };
  const openAdd = () => {
    setInlineDetailId(null);
    setDrawPoints([]);
    setMobileDrawing(false);
    setAddOpen(true);
  };
  // multi-country ADD flow: krajina detegovaná z prvého bodu nakreslenej trasy; efektívna =
  // manuálny override (addCountry) má prednosť, inak detekcia, inak SK. Region je SK-viazaný
  // dropdown len pri SK — pri inej krajine sa prepne na voľný text (SK pohoria tam nedávajú zmysel).
  // #4: detekcia z CELEJ nakreslenej trasy (nie len drawPoints[0]) — rovnaká logika ako
  // trailCountry (whole-path SK-aware), nech editor readout nesklame pri štarte od hranice.
  const addDetectedCountry = drawPoints.length ? trailCountry({ path: drawPoints as [number, number][] }) : null;
  const addEffCountry = addCountry || addDetectedCountry || 'sk';
  const addCountryOpts = ADD_COUNTRY_OPTIONS.includes(addEffCountry as typeof ADD_COUNTRY_OPTIONS[number])
    ? ADD_COUNTRY_OPTIONS
    : [addEffCountry, ...ADD_COUNTRY_OPTIONS];

  const closeAdd = () => {
    setAddOpen(false);
    setMobileDrawing(false);
    setDrawPoints([]);
    setAddName(''); setAddDate(''); setAddRegion(''); setAddCountry(''); setAddDiff('');
    setAddTags(new Set()); setAddActs(new Set()); setAddCrew([]);
    setAddPhotos([]); setAddPhotoNote(''); setAddError(''); setAddRating(0); setAddSocial('');
    setAddPlanAct(''); setAddPlanLoc(''); setAddYear(''); setAddMonth(''); setAddDay('');
    setAddMultiTrip(false); setAddDateEnd(''); setAddCrowd(''); setAddSurface(new Set()); setAddPlanPoint(null);
    setAddMode('done');
  };
  // design §E: „Prešiel som" (done) = názov + nakreslená trasa. „Plánujem" = navyše dátum
  // (kedy pôjdeš, pre event/inzerát); rating/trail fotky sa nezbierajú (ešte si to neprešiel).
  // Matej 2026-07-23: PLÁNOVANIE zjednodušené — vyžaduje aktivitu + lokalitu + aspoň ROK (deň/
  // mesiac voliteľné, „možno k výletu ani nepríde"). Trasa sa nekreslí. „Prešiel som" (done)
  // stále vyžaduje názov + nakreslenú trasu.
  // „Prešiel som" trip — VŠETKO povinné (Matej 2026-07-24: „aby nemohli tam byť blbosti").
  // Krajina je auto z trasy, „kto bol so mnou" ostáva voliteľné (neboli v povinnom zozname).
  // addMissing = ľudské labely chýbajúcich polí → nápoveda pri disabled submite (nie mŕtve tlačidlo).
  const addMissing: string[] = addMode === 'done' ? ([
    addName.trim().length === 0 && 'name',
    drawPoints.length < 2 && 'route on map',
    addDate === '' && 'date',
    addDiff === '' && 'difficulty',
    addCrowd === '' && 'popularity',
    addSurface.size === 0 && 'surface',
    addActs.size === 0 && 'activity',
    addTags.size === 0 && 'tag',
    addRating < 1 && 'rating',
    addPhotos.length === 0 && 'photo',
  ].filter(Boolean) as string[]) : [];
  const canSubmitAdd = addMode === 'done'
    ? addMissing.length === 0
    : (addPlanAct !== '' && addPlanLoc.trim().length > 0 && addYear !== '');
  const submitAdd = () => {
    if (!canSubmitAdd) return;

    // ── PLÁNOVANIE (Matej 2026-07-23): názov = aktivita + lokalita; dátum z 3 dropdownov (min
    // rok); žiadny región/difficulty/tagy/trasa; správa o tripe + info z profilu → len Events/
    // wishlist. Nič sa nekreslí na mapu (path=[]). ──
    if (addMode === 'planning') {
      const actLabel = TRIP_ACTIVITIES.find((a) => a.id === addPlanAct)?.label ?? 'Trip';
      const name = `${actLabel} · ${addPlanLoc.trim()}`;
      // benevolentný dátum: deň+mesiac+rok → YYYY-MM-DD; mesiac+rok → YYYY-MM; inak len rok.
      const dateStr = addDay && addMonth && addYear ? `${addYear}-${addMonth}-${addDay}`
        : addMonth && addYear ? `${addYear}-${addMonth}`
        : addYear;
      const tid = `plan-${nowMs}`;
      const planTrail: HeroTrail = {
        id: tid, name, region: '', diff: 'Moderate', km: '0', stars: 0, path: addPlanPoint ? [addPlanPoint] : [],
        photos: [], seasons: [], desc: '', dogNote: addSocial,
        acts: [ACT_DATA_ID[addPlanAct] ?? addPlanAct], surface: [], crowd: '', tags: [], author: firstName,
      };
      setLocalTrails((prev) => [planTrail, ...prev]);
      addPlan(tid, 'partner', dateStr);
      const ev: PartnerEvent = {
        id: `plan-event-${nowMs}`, tripId: tid,
        dates: dateStr.length >= 7 ? [dateStr] : [],
        month: dateStr.length >= 7 ? dateStr.slice(0, 7) : dateStr,
        socialization: addSocial, host: `${firstName} & your dog`, hostIsMe: true,
        at: nowMs, joinedByMe: true, seedGoing: 0,
      };
      setEvents((prev) => [ev, ...prev]);
      closeAdd();
      return;
    }

    // ── „PREŠIEL SOM" (done): názov + nakreslená trasa + rating/fotky. ──
    const km = (totalDistanceM(drawPoints) / 1000).toFixed(1);
    const tid = `local-${nowMs}-${Math.round(totalDistanceM(drawPoints))}`;
    const newTrail: HeroTrail = {
      id: tid,
      name: addName.trim(),
      region: addRegion,
      country: addEffCountry,
      diff: addDiff || 'Moderate',
      km,
      stars: addRating,
      path: drawPoints,
      photos: addPhotos,
      seasons: [],
      desc: '',
      dogNote: '',
      acts: Array.from(addActs).map((a) => ACT_DATA_ID[a] ?? a),
      surface: Array.from(addSurface),
      crowd: addCrowd,
      tags: Array.from(addTags),
      author: firstName,
    };
    // #1: over zápis PRED pridaním do state — inak sa trip zobrazí, ale po reloade zmizne
    // (writeLocalTrails vráti false pri plnom localStorage, napr. priveľa base64 fotiek).
    const next = [newTrail, ...localTrails];
    if (!writeLocalTrails(next)) {
      setAddError(`Couldn't save — photos are too large for this device's storage. Remove a few and try again.`);
      return;
    }
    setAddError('');
    setLocalTrails(next);
    setWalkedIds((prev) => { const n = new Set(prev); n.add(tid); return n; });
    if (addRating > 0) {
      // Crowd aj hazards berieme z formulára — predtým tu bolo natvrdo `crowd: 'Calm'` a
      // `hazards: []`, takže autorov vlastný hlas protirečil tomu, čo práve vyplnil.
      // seedCrowd() prekladá SK hodnotu z nahadzovača (addCrowd) na EN Crowd.
      setVotes((prev) => ({ ...prev, [tid]: {
        tripId: tid, rating: addRating,
        difficulty: (addDiff || 'Moderate') as TripVote['difficulty'],
        crowd: seedCrowd(newTrail) ?? 'Calm',
        comment: '', when: addDate.slice(0, 7),
        hazards: Array.from(addHazards), at: nowMs,
      } }));
    }
    closeAdd();
  };

  // ADD setup form — zdieľané medzi desktop .trp-sidebar (bod 4, iterácia 11) a mobile
  // full-screen .trp-madd overlay (bod 4, iterácia 14, keďže .trp-sidebar je na mobile
  // display:none). ".trp-madd-drawbtn" je viditeľné len vnútri .trp-madd na mobile (CSS
  // scoped selector) — desktop má mapu vždy vedľa panela, netreba "choď na mapu" krok.
  const renderAddSetup = () => (
    <div className="trp-addsetup">
      <div className="trp-addsetup-head">
        <button type="button" className="trp-panelnav-btn" onClick={closeAdd} aria-label="Back to list">←</button>
        <div className="trp-addsetup-title">{addMode === 'planning' ? 'Plan a trip' : 'Add a walked trip'}</div>
      </div>
      <div className="trp-addsetup-body">
        {addMode === 'planning' ? (
          /* ── PLÁNOVANIE (Matej 2026-07-23) — jednoduché: aktivita + lokalita = názov; dátum z 3
             dropdownov (min rok); žiadny región/difficulty/tagy; správa o tripe + profil sa priloží.
             Ide len do wishlistu/Events. ── */
          <>
            <div className="trp-planph" style={addPlanAct ? { backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.45)), url('${placeholderFor([ACT_DATA_ID[addPlanAct] ?? addPlanAct], addPlanLoc || addPlanAct)}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              <div className="trp-planph-badge">ADVENTURE · COMING SOON</div>
            </div>
            <div className="trp-addsetup-row2">
              <div className="trp-addsetup-field">
                <label>Activity</label>
                <select className="trp-addsetup-input" value={addPlanAct} onChange={(e) => setAddPlanAct(e.target.value)}>
                  <option value="">Select…</option>
                  {TRIP_ACTIVITIES.map((a) => <option key={a.id} value={a.id}>{ACT_EMOJI[a.id]} {a.label}</option>)}
                </select>
              </div>
              <div className="trp-addsetup-field">
                <label>Where <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>· click the map</span></label>
                <div className={`trp-planpin${addPlanPoint ? ' set' : ''}`}>
                  {addPlanPoint ? `📍 Pin set (${addPlanPoint[0].toFixed(4)}, ${addPlanPoint[1].toFixed(4)})` : '📍 Click on the map to drop a pin'}
                </div>
                <input className="trp-addsetup-input" style={{ marginTop: 6 }} value={addPlanLoc} onChange={(e) => setAddPlanLoc(e.target.value)} placeholder="Optional name — e.g. Vápeč" />
              </div>
            </div>
            <div className="trp-addsetup-field">
              <label>Roughly when <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>· year is enough</span></label>
              <div className="trp-addsetup-daterow">
                <select className="trp-addsetup-input" value={addDay} onChange={(e) => setAddDay(e.target.value)} aria-label="Day">
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="trp-addsetup-input" value={addMonth} onChange={(e) => setAddMonth(e.target.value)} aria-label="Month">
                  <option value="">Month</option>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                    <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                  ))}
                </select>
                <select className="trp-addsetup-input" value={addYear} onChange={(e) => setAddYear(e.target.value)} aria-label="Year">
                  <option value="">Year*</option>
                  {Array.from({ length: 3 }, (_, i) => String(new Date(nowMs).getFullYear() + i)).map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="trp-addsetup-field">
              <label>Message about the trip</label>
              <textarea className="trp-addsetup-input" style={{ minHeight: 66, resize: 'vertical' }} value={addSocial} onChange={(e) => setAddSocial(e.target.value)} placeholder="e.g. going by car, planning to stay the whole day, easy pace…" />
            </div>
            <div className="trp-addsetup-profilenote">
              🐾 Your Dogyptian profile (you &amp; your dog) is attached automatically.
            </div>
          </>
        ) : (
          /* ── „PREŠIEL SOM" (done) — plný záznam: názov + trasa + región/difficulty + aktivity +
             tagy + spoločníci + fotky + rating. ── */
          <>
            <div className="trp-addsetup-field">
              <label>Trip name</label>
              <input className="trp-addsetup-input" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. Sunset ridge walk" />
            </div>
            <div className="trp-addsetup-field">
              <label>Date</label>
              <input type="date" className="trp-addsetup-input" value={addDate} onChange={(e) => setAddDate(e.target.value)} />
              {!addMultiTrip ? (
                <button type="button" className="trp-multitoggle" onClick={() => setAddMultiTrip(true)}>+ Multi-day trip</button>
              ) : (
                <div className="trp-addsetup-field" style={{ marginTop: 8 }}>
                  <label>End date <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>· multi-day · unlocks Journey</span></label>
                  <input type="date" className="trp-addsetup-input" value={addDateEnd} min={addDate || undefined} onChange={(e) => setAddDateEnd(e.target.value)} />
                  <button type="button" className="trp-multitoggle" onClick={() => { setAddMultiTrip(false); setAddDateEnd(''); }}>− Single day</button>
                </div>
              )}
            </div>
            {/* Country — auto z nakreslenej trasy, klikateľné (override). Skryté kým nič nenakreslené. */}
            {addDetectedCountry && (
              <div className="trp-addsetup-field">
                <label>Country <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>· auto from your route</span></label>
                <select className="trp-addsetup-input" value={addEffCountry} onChange={(e) => setAddCountry(e.target.value)}>
                  {addCountryOpts.map((c) => <option key={c} value={c}>{flagEmoji(c)} {ISO2_LABEL[c] ?? c.toUpperCase()}</option>)}
                </select>
              </div>
            )}
            {/* #3: región sa ukladá (predtým hardcode '') — select z existujúcich pohorí, nech
                pridaná trasa sedí do filtra regiónu. Voliteľné; pri ne-SK krajine sú SK pohoria
                irelevantné, tak sa skryje. */}
            {addEffCountry === 'sk' && (
              <div className="trp-addsetup-field">
                <label>Region <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>· optional</span></label>
                <select className="trp-addsetup-input" value={addRegion} onChange={(e) => setAddRegion(e.target.value)}>
                  <option value="">— none —</option>
                  {ALL_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}
            <div className="trp-addsetup-row2">
              <div className="trp-addsetup-field">
                <label>Difficulty</label>
                <select className="trp-addsetup-input" value={addDiff} onChange={(e) => setAddDiff(e.target.value as typeof addDiff)}>
                  <option value="">Select…</option>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="trp-addsetup-field">
                {/* D2 (LOCKED 2026-07-24): „Popularity" → „Crowd" — jeden názov naprieč appkou. */}
                <label>Crowd</label>
                <select className="trp-addsetup-input" value={addCrowd} onChange={(e) => setAddCrowd(e.target.value as typeof addCrowd)}>
                  <option value="">Select…</option>
                  {Object.entries(CROWD_LABELS).map(([sk, en]) => <option key={sk} value={sk}>{en}</option>)}
                </select>
              </div>
            </div>
            <div className="trp-addsetup-field">
              <label>Surface</label>
              <div className="trp-filters-row2">
                {SURFACE_VOCAB.map((s) => (
                  <button key={s.id} type="button" className={`trp-chip-sm${addSurface.has(s.id) ? ' on' : ''}`} onClick={() => toggleAddSurface(s.id)}>{s.e} {s.t}</button>
                ))}
              </div>
            </div>
            {/* F1 (Matej 2026-07-24): hrozby aj v add-trip, nielen vo walked popupe. Rovnaké
                HAZARDS + HAZARD_EMOJI = jeden zdroj pravdy, žiadna lokálna kópia. */}
            <div className="trp-addsetup-field">
              <label>Any hazards? <span style={{ opacity: 0.55, textTransform: 'none', letterSpacing: 0 }}>(optional — helps the pack)</span></label>
              <div className="trp-filters-row2">
                {HAZARDS.map((h) => (
                  <button key={h} type="button" className={`trp-chip-sm${addHazards.has(h) ? ' on' : ''}`} onClick={() => toggleAddHazard(h)}>{HAZARD_EMOJI[h]} {h}</button>
                ))}
              </div>
            </div>
            {/* Matej 2026-07-23: Aktivity PRED tagy — tagy sú len doplnky. */}
            <div className="trp-addsetup-field">
              <label>Activities</label>
              <div className="trp-filters-row2">
                {TRIP_ACTIVITIES.map((a) => {
                  const locked = a.id === 'journey' && !journeyOk;
                  return (
                    <button key={a.id} type="button" disabled={locked}
                      className={`trp-chip-sm${addActs.has(a.id) ? ' on' : ''}${locked ? ' locked' : ''}`}
                      title={locked ? 'Journey needs a multi-day trip (Start + End) of at least 50 km' : undefined}
                      onClick={() => toggleAddAct(a.id)}>{ACT_EMOJI[a.id]} {a.label}</button>
                  );
                })}
              </div>
            </div>
            <div className="trp-addsetup-field">
              <label>Tags</label>
              <div className="trp-filters-row2">
                {TAG_VOCAB.map((tag) => (
                  <button key={tag} type="button" className={`trp-chip-sm${addTags.has(tag) ? ' on' : ''}`} onClick={() => toggleAddTag(tag)}>{TAG_EMOJI[tag] ? `${TAG_EMOJI[tag]} ` : ''}{tag}</button>
                ))}
              </div>
            </div>
            <div className="trp-addsetup-field">
              {/* Matej 2026-07-23: „kto bol so mnou" — jasný + a výber zo svorky + iní členovia. */}
              <label>Who was with you</label>
              <CompanionPicker
                myDogs={id.dogs.map((d) => ({ id: d.id, name: d.dog_name ?? 'My dog', photo: d.cloudinary_main_url }))}
                selected={addCrew}
                onChange={setAddCrew}
                onOpenProfile={(mid) => navigate('/pack/u/' + mid)}
              />
            </div>
            <div className="trp-addsetup-field">
              <label>Trail photos <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>· {addPhotos.length}/{MAX_PHOTOS} · auto-resized</span></label>
              <input type="file" accept="image/*" multiple onChange={handleAddPhotos} className="trp-addsetup-file" disabled={addPhotos.length >= MAX_PHOTOS} />
              {addPhotoNote && <div style={{ fontSize: 10.5, opacity: 0.72, marginTop: 4, lineHeight: 1.45 }}>{addPhotoNote}</div>}
              {addPhotos.length > 0 && (
                <div className="trp-addsetup-photos">
                  {addPhotos.map((p, i) => (
                    <div key={i} className="trp-addsetup-photo" style={{ backgroundImage: `url('${p}')` }}>
                      <button type="button" onClick={() => removeAddPhoto(i)} aria-label="Remove photo">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="trp-addsetup-field">
              <label>Your rating</label>
              <div className="trp-addsetup-stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" className={n <= addRating ? 'on' : ''} onClick={() => setAddRating(n)}>★</button>
                ))}
              </div>
            </div>
            <div className="trp-addsetup-livekm">
              {drawPoints.length < 2
                ? 'Draw a route on the map to set the distance'
                : `${(totalDistanceM(drawPoints) / 1000).toFixed(1)} km · ${drawPoints.length} points`}
            </div>
            {/* mobile-only — .trp-madd prekrýva mapu, tlačidlo ju dočasne odkryje na kreslenie. */}
            <button type="button" className="trp-madd-drawbtn" onClick={() => setMobileDrawing(true)}>
              {drawPoints.length > 0 ? 'Edit route on map' : 'Draw route on map'}
            </button>
          </>
        )}
      </div>
      {addMode === 'done' && addMissing.length > 0 && (
        <div style={{ fontSize: 11, textAlign: 'center', opacity: 0.72, margin: '0 12px 8px', letterSpacing: '.02em', lineHeight: 1.5 }}>
          Still needed: {addMissing.join(' · ')}
        </div>
      )}
      {addError && (
        <div style={{ fontSize: 11.5, textAlign: 'center', color: '#E8896B', margin: '0 12px 8px', lineHeight: 1.5 }}>{addError}</div>
      )}
      <button type="button" className="trp-addsetup-submit" disabled={!canSubmitAdd} onClick={submitAdd}>
        {addMode === 'planning' ? 'Post plan → Events' : 'Add walked trip'}
      </button>
    </div>
  );

  // bod 1 (iterácia 15): pravá skupina status riadku — zdieľaná medzi desktop .trp-status-row
  // (v .trp-topbar) a mobile .trp-mheader-status (i13 bod 1), presne tá istá "ako desktop"
  // logika ako predtým, len teraz pilulky namiesto holých ikoniek. Poradie: km → ✓ (walked
  // count) → ★ (wishlist count) → ADD TRIP.
  // Matej 2026-07-22: km + ✓ SPOJENÉ do jednej pilulky (✓ N · Y km) → Walked tab; ★ → Wishlist tab.
  // Matej 2026-07-23: header konsolidovaný 4→2 pilulky. TRIPSTATS (✓ N · km) a TRIPLIST (🐾) sú dva
  // povrchy tej istej route /pack/map/triplist (?tab=stats vs list). ✓/★ dashboard modal ZRUŠENÝ,
  // wishlist splynul do triplistu. + Add trip (akcia, ostáva).
  // D4 nav rework (2026-07-24, Matej: "nechaj to vnútri headru a len to posun na pravý roh
  // toho vnútorného bloku") — notif+messages sú PRIDANÉ ako sibling tohto .trp-status-right
  // v .trp-status-row / .trp-mheader-status s .trp-header-notif (margin-left:auto) → odtlačené
  // do pravého rohu status headra, oddelené od Add trip. NIE samostatný rohový klaster nad mapou.
  const renderStatusRight = () => (
    <div className="trp-status-right">
      <button type="button" className="trp-stat-pill" onClick={() => navigate('/pack/map/triplist?tab=stats')} title="Your trip stats — world, home & walked">
        <img src={ICON('trophy')} alt="" />
        <b>{walkedIds.size} · {fmtKm(walkedKm)} km</b>
      </button>
      <button type="button" className="trp-stat-pill" onClick={() => navigate('/pack/map/triplist')} title="Open your triplist">
        <img src={ICON('clipboard')} alt="" />
        <b>Triplist</b>
      </button>
      <button type="button" className="trp-addtrip-btn" onClick={openAddChoice}>
        <img src={ICON('plus')} alt="" className="trp-addtrip-icon" />
        Add trip
      </button>
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

  // bod 5: FILTER (sort) popover na mobile — Top rated/Easiest/Hardest, aplikované na
  // visibleHeroTrails. Desktop nemá UI pre tento sort (mobileSort ostáva ''), takže tam
  // je toto no-op — zdieľané pole nech sa karta nerenderuje dvakrát rôzne (desktop vs mobile).
  const sortedVisibleHeroTrails = mobileSort
    ? [...visibleHeroTrails].sort((a, b) => {
        if (mobileSort === 'top') return b.tr.stars - a.tr.stars;
        if (mobileSort === 'easiest') return diffRank(a.tr.diff) - diffRank(b.tr.diff);
        return diffRank(b.tr.diff) - diffRank(a.tr.diff); // 'hardest'
      })
    : visibleHeroTrails;

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
          {/* bod 3 (Matej 2026-07-22): ✓/★ v HORNOM pravom rohu fotky (predtým dole). */}
          <div className="trp-bigcard-photoacts">
            {/* Walked: pri pláne LEN pre autora (ostatní ho nemôžu označiť ako prejdený — nebol) */}
            {(!isUnwalkedPlan || isMine) && (
              <button
                type="button"
                className={`trp-bigcard-photoactbtn${walkedIds.has(tr.id) ? ' on' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleWalked(tr.id); }}
              >✓ Walked</button>
            )}
            <button
              type="button"
              className={`trp-bigcard-photoactbtn${favIds.has(tr.id) ? ' on' : ''}`}
              onClick={(e) => { e.stopPropagation(); toggleFav(tr.id); }}
            >★ Triplist</button>
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
        {addOpen ? renderAddSetup() : inlineDetailId ? (() => {
          const dt = allTrails.find((x) => x.id === inlineDetailId);
          if (!dt) return null;
          const idx = photoIdx[dt.id] ?? 0;
          const photo = dt.photos[idx] ?? dt.photos[0] ?? placeholderFor(dt.acts, dt.id);
          // bod 4 (i12): tagy/aktivity s emoji (rovnaký vocabulary ako filter chipy nižšie).
          const dtChips = [
            ...(dt.acts ?? []).map((a) => ({ key: `a:${a}`, label: a, emoji: ACT_EMOJI[a] ?? '' })),
            ...(dt.tags ?? []).map((tg) => ({ key: `t:${tg}`, label: tg, emoji: TAG_EMOJI[tg] ?? '' })),
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
                    {/* Walked: pri pláne LEN autor (ostatní nemôžu — výlet sa neodohral) */}
                    {(!isUnwalkedPlan || isMine) && (
                      <button
                        type="button"
                        className={`trp-bigcard-photoactbtn${walkedIds.has(dt.id) ? ' on' : ''}`}
                        onClick={() => toggleWalked(dt.id)}
                      >✓ {walkedIds.has(dt.id) ? 'Walked' : 'Mark walked'}</button>
                    )}
                    <button
                      type="button"
                      className={`trp-bigcard-photoactbtn${favIds.has(dt.id) ? ' on' : ''}`}
                      onClick={() => toggleFav(dt.id)}
                    >★ {favIds.has(dt.id) ? 'In triplist' : 'Triplist'}</button>
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
              <button type="button" className={`trp-greet-filter${mobileSort ? ' on' : ''}`} onClick={() => setSortOpen((v) => !v)} aria-label="Sort & filter">
                <img src={ICON('sliders')} alt="" />
              </button>
              {sortOpen && (
                <div className="trp-sortpop trp-sortpop--desk">
                  {([['top', 'Top rated'], ['easiest', 'Easiest'], ['hardest', 'Hardest']] as const).map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      className={mobileSort === v ? 'on' : ''}
                      onClick={() => { setMobileSort((cur) => (cur === v ? '' : v)); setSortOpen(false); }}
                    >{l}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="trp-cat-pills">
            <button type="button" className={`trp-catpill${activeCat === 'trips' ? ' on' : ''}`} onClick={() => setActiveCat('trips')}>Trips</button>
            <button type="button" className="trp-catpill soon" disabled data-tip="Coming soon">Places</button>
            <button type="button" className="trp-catpill soon" disabled data-tip="Coming soon">Services</button>
            {/* design §D: Events sa aktivoval — zoznam plánovaných spoločných výletov + join. */}
            <button type="button" className={`trp-catpill${activeCat === 'events' ? ' on' : ''}`} onClick={() => setActiveCat('events')}>Events</button>
          </div>

          {/* geo/tag filtre sú trip-specifické — pri Events kategórii sa skryjú. */}
          {activeCat === 'trips' && (<>
          {/* geo kaskáda (Matejov feedback bod 4): country (malinký, flag+kód) → región
              (West/Center/East) → pohorie (tr.region); výber regiónu filtruje ponuku pohorí. */}
          <div className="trp-georow">
            <select
              className="trp-country-select"
              value={selectedCountry}
              aria-label="Country"
              onChange={(e) => {
                const c = e.target.value;
                setSelectedCountry(c);
                // SK-špecifický región filter (West/Center/East) platí len pre SK
                if (c !== '' && c !== 'sk') setHeroMacroRegion('');
                // prefokus mapy na trasy vybranej krajiny (union ich path bodov); '' → celé SR
                if (c === '') { setHeroBounds(SVK_BORDER); }
                else {
                  const pts = allTrails.filter((t) => trailCountry(t) === c).flatMap((t) => t.path);
                  if (pts.length) setHeroBounds(pts as typeof heroBounds);
                }
              }}
            >
              {availableCountries.length > 1 && <option value="">🌍 All</option>}
              {availableCountries.map((c) => (
                <option key={c} value={c}>{flagEmoji(c)} {c.toUpperCase()}</option>
              ))}
            </select>
            {(selectedCountry === '' || selectedCountry === 'sk') && (<>
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
            {/* F1 (Matej 2026-07-24): „Preč »all ranges« — zbytočne komplikované." → druhostupňový
                dropdown POHORÍ zrušený, filtruje sa len makro-regiónom West/Center/East. Pohorie
                ostáva viditeľné na karte tripu (trp-bigcard-loc), len sa podľa neho nefiltruje. */}
            </>)}
          </div>

          <div className="trp-filters-row2">
            {/* univerzálny 8-tag vocabulary (Matejov feedback bod 2, iterácia 7) — vždy
                celý, nezávisle od vybranej aktivity (per-activity scoping zrušený).
                Activity/Difficulty/Popularity presunuté (iterácia 8) do top filter baru
                nad mapou — panel nesie už len tagy. */}
            {TAG_VOCAB.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`trp-chip-sm${heroTags.has(tag) ? ' on' : ''}`}
                onClick={() => toggleTag(tag)}
              >{TAG_EMOJI[tag] ? `${TAG_EMOJI[tag]} ` : ''}{tag}</button>
            ))}
          </div>
          </>)}
        </div>

        <div className="trp-cards-scroll">
          <div className="trp-cards">
            {activeCat === 'trips'
              ? sortedVisibleHeroTrails.map(({ tr }) => renderTripCard(tr, true))
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
          {/* Avatar REMOVED here too (D4 nav rework) — same reasoning as desktop .trp-status-row. */}
          {renderStatusRight()}
          <PackNotifications dark layout="inline" className="trp-header-notif" last24h={id.packToday} total={id.packTotal} />
        </div>
        <div className="trp-mheader-row2">
          <div className="trp-mheader-scroll">
            <div className="trp-mapsearch">
              <img src={ICON('globe')} alt="" />
              <input
                value={placeQuery}
                onChange={(e) => setPlaceQuery(e.target.value)}
                placeholder="Search a place…"
              />
            </div>
            <select
              className="trp-mheader-select"
              value={heroAct}
              onChange={(e) => setHeroAct(e.target.value as typeof heroAct)}
              aria-label="Activity"
            >
              {/* bod 2 (iterácia 13): "All activities" → "Activities" — kratší default label */}
              <option value="">Activities</option>
              {TRIP_ACTIVITIES.map((a) => (
                <option key={a.id} value={a.id}>{ACT_EMOJI[a.id]} {a.label}</option>
              ))}
            </select>
            <select
              className="trp-mheader-select"
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
              className="trp-mheader-select"
              value={heroCrowd}
              onChange={(e) => setHeroCrowd(e.target.value as typeof heroCrowd)}
              aria-label="Crowd"
            >
              <option value="">Crowd</option>
              {Object.entries(CROWD_LABELS).map(([sk, en]) => (
                <option key={sk} value={sk}>{en}</option>
              ))}
            </select>
          </div>
          <div className="trp-mfilterwrap">
            {/* bod 7: sliders/tune ikonka (NIE graph/chart) — bez textového labelu "All" */}
            <button type="button" className="trp-mfiltericon" onClick={() => setSortOpen((v) => !v)} aria-label="Sort">
              <img src={ICON('sliders')} alt="" />
            </button>
            {sortOpen && (
              <div className="trp-sortpop">
                {([['top', 'Top rated'], ['easiest', 'Easiest'], ['hardest', 'Hardest']] as const).map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    className={mobileSort === v ? 'on' : ''}
                    onClick={() => { setMobileSort((cur) => (cur === v ? '' : v)); setSortOpen(false); }}
                  >{l}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
            ? sortedVisibleHeroTrails.map(({ tr }) => renderTripCard(tr, false))
            : <EventsView events={events} trailsById={trailsById} onJoin={joinEvent} onToggleClosed={toggleEventClosed} onMessage={setDmName} onOpenProfile={(mid) => navigate('/pack/u/' + mid)} photoFor={(tr) => tr.photos[0] ?? placeholderFor(tr.acts, tr.id)} onOpenTrip={(tid) => navigate(`/pack/map/${tid}`)} />}
        </div>
      </div>

      {/* bod 4 (iterácia 14): ADD TRIP na mobile — .trp-sidebar (kde žije desktop ADD setup)
          je na mobile display:none, tak reused renderAddSetup() beží aj tu vo full-screen
          overlayi. Keď mobileDrawing=true, overlay sa schová (nie unmountne — inputy si držia
          hodnotu) nech je mapa pod ním klikateľná pre kreslenie trasy ("Draw route on map" v
          renderAddSetup, "Done" v .trp-drawhint nižšie ho vráti). */}
      {addOpen && !mobileDrawing && (
        <div className="trp-madd">
          {renderAddSetup()}
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
                  Krajina s trasou ale bez polygónu tu → dogeneruj cez scripts/gen_borders.py. */}
              {availableCountries.flatMap((iso) => {
                const rings = COUNTRY_BORDERS[iso];
                if (!rings) {
                  if (import.meta.env.DEV) console.warn(`[territory] chýba hraničný polygón pre '${iso}' — dogeneruj cez scripts/gen_borders.py a doplň do countryBorders.ts`);
                  return [];
                }
                return rings.flatMap((ring, i) => [
                  <Polygon key={`border-${iso}-${i}-casing`} positions={ring} pathOptions={{ color: '#0A0A0A', weight: 11, opacity: 0.9, fill: false, interactive: false, lineJoin: 'round' }} />,
                  <Polygon key={`border-${iso}-${i}-gold`} positions={ring} pathOptions={{ color: '#C99A3F', weight: 2.5, opacity: 0.9, fillColor: '#C99A3F', fillOpacity: 0.03, interactive: false, lineJoin: 'round' }} />,
                ]);
              })}
              <ScaleControl position="bottomleft" imperial={false} />
              <FlyTo target={mapTarget} />
              <FitBounds path={heroBounds} offset={!!inlineDetailId} />
              <MapRefBridge onReady={(map) => {
                leafletMapRef.current = map;
                if (pendingFlyRef.current) { map.flyTo(pendingFlyRef.current, 11, { duration: 1.2 }); pendingFlyRef.current = null; }
              }} />
              <DrawClickCatcher active={addOpen && addMode === 'done'} onPoint={(lat, lng) => setDrawPoints((p) => [...p, [lat, lng]])} />
              <DrawClickCatcher active={addOpen && addMode === 'planning'} onPoint={(lat, lng) => setAddPlanPoint([lat, lng])} />
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
                // ráme: biely spojitý casing (pod) + červené spojité jadro (nad). Vždy
                // zvýraznená (hero trasa), pri hoveri zhrubne.
                if (tr.acts?.includes('journey')) {
                  const w = hot ? 5 : 4;
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
                  return (
                    <Polyline
                      key={tr.id}
                      positions={tr.path}
                      pathOptions={{ color: '#161616', weight: 3, opacity: .8 }}
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
              {allTrails.map((tr) => tr.path.length > 0 && !isWaterTrail(tr) && !tr.id.startsWith('plan-') && (
                <Marker
                  key={tr.id + ':m'}
                  /* bežný trip = pill na začiatku trasy; journey (diaľková) = v STREDE trasy,
                     nech červená bublinka sadne doprostred dlhej červenej čiary (Matej). */
                  position={tr.acts?.includes('journey') ? tr.path[Math.floor(tr.path.length / 2)] : tr.path[0]}
                  icon={pillIcon(tr, hoverId === tr.id || inlineDetailId === tr.id)}
                  eventHandlers={{
                    mouseover: () => setHoverId(tr.id),
                    mouseout: () => setHoverId(null),
                    click: () => selectTrail(tr),
                  }}
                />
              ))}
              {/* vodné plochy = SUP tripy (paddleboard) = MODRÝ kruh + vlnovky + názov priehrady
                  (Matej 2026-07-24). NIE čierny hike pill / trasa — na mape 1 bod (ťažisko stopy).
                  Klik = detail tripu (má fotky/reviews). Bez súradnice (0 bodov, napr. Buková
                  priehrada) sa nezobrazí — čaká na nahadzovač 📍 bod-miesto. */}
              {allTrails.filter((tr) => isWaterTrail(tr) && tr.path.length > 0).map((tr) => (
                <Marker
                  key={'w:' + tr.id}
                  position={waterPoint(tr.path)}
                  icon={waterIcon((tr as { waves?: number }).waves)}
                  eventHandlers={{
                    mouseover: () => setHoverId(tr.id),
                    mouseout: () => setHoverId(null),
                    click: () => selectTrail(tr),
                  }}
                />
              ))}
              {/* bod 6 (i11) + bod 2 (i17): draft polyline kým sa kreslí nová trasa v ADD flow —
                  rovnaký čierno-zlatý casing ako zvýraznená trasa (bod 1), jadro ostáva
                  prerušované (dashArray), nech je vidno že ešte nie je finálna. */}
              {addOpen && drawPoints.length > 1 && (
                <>
                  <Polyline positions={drawPoints} pathOptions={{ color: '#0A0A0A', weight: 8, opacity: 1, lineCap: 'round', lineJoin: 'round' }} />
                  <Polyline positions={drawPoints} pathOptions={{ color: '#F5C73D', weight: 4, dashArray: '6 8', opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} />
                </>
              )}
              {/* bod 2 (iterácia 17): malý live "{km} km" label pri konci kreslenej trasy
                  (mimo .trp-drawhint bubliny nižšie — priamo na mape, pri poslednom bode). */}
              {addOpen && drawPoints.length > 1 && (
                <Marker
                  position={drawPoints[drawPoints.length - 1]}
                  interactive={false}
                  icon={L.divIcon({
                    className: 'trp-pinwrap',
                    html: `<div class="trp-drawlabel">${(totalDistanceM(drawPoints) / 1000).toFixed(1)} km</div>`,
                  })}
                />
              )}
              {addOpen && addMode === 'planning' && addPlanPoint && (
                <Marker position={addPlanPoint} icon={PLAN_PIN} />
              )}
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
                pravá skupina = renderStatusRight() pilulky (km/✓/★/ADD TRIP). */}
            <div className="trp-topbar">
              {/* Avatar REMOVED from this status pill (D4 nav rework 2026-07-24) — it now lives
                  in the shared bottom nav (PackBottomNav), so having it here too was a duplicate.
                  See PackLayout.tsx AvatarNavButton. */}
              <div className="trp-status-row">
                {renderStatusRight()}
                {/* notif+messages → pravý roh TOHTO bloku (Matej 2026-07-24), margin-left:auto ich
                    odtlačí od add-trip na koniec status-row. Inline layout = v toku, nie fixed. */}
                <PackNotifications dark layout="inline" className="trp-header-notif" last24h={id.packToday} total={id.packTotal} />
              </div>
              <div className="trp-topsearchrow">
                <div className="trp-floatsearch">
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
                          onClick={() => { setMapTarget([s.lat, s.lon]); setPlaceQuery(s.name); setPlaceSug([]); }}
                        >
                          <div className="trp-mapsug-name">{s.name}</div>
                          {s.sub && <div className="trp-mapsug-sub">{s.sub}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* bod 3 (iterácia 11): Activity/Difficulty/Popularity — samostatné, totožné
                    borderless polia priamo v riadku (.trp-topfilters wrapper box zrušený). */}
                <select
                  className="trp-toprow-select"
                  value={heroAct}
                  onChange={(e) => setHeroAct(e.target.value as typeof heroAct)}
                  aria-label="Activity"
                >
                  {/* bod 2 (iterácia 13): "All activities" → "Activities" — kratší default label */}
                  <option value="">Activities</option>
                  {TRIP_ACTIVITIES.map((a) => (
                    <option key={a.id} value={a.id}>{ACT_EMOJI[a.id]} {a.label}</option>
                  ))}
                </select>
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

            {/* bod 6 (i11): draw hint bubble — "Click on the map to draw your route" + live
                km/undo/clear. Bod 4 (i14): "Done" (mobile draw toggle, viď mobileDrawing) —
                zobrazí sa aj pri 0 bodoch, nech sa dá vrátiť na formulár bez nakreslenia. */}
            {addOpen && addMode === 'done' && (
              <div className="trp-drawhint">
                <div className="trp-drawhint-txt">
                  {drawPoints.length > 0
                    ? `${drawPoints.length} points · ${(totalDistanceM(drawPoints) / 1000).toFixed(1)} km`
                    : 'Click on the map to draw your route'}
                </div>
                {(drawPoints.length > 0 || mobileDrawing) && (
                  <div className="trp-drawhint-actions">
                    {drawPoints.length > 0 && <button type="button" onClick={() => setDrawPoints((p) => p.slice(0, -1))}>Undo</button>}
                    {drawPoints.length > 0 && <button type="button" onClick={() => setDrawPoints([])}>Clear</button>}
                    {mobileDrawing && <button type="button" onClick={() => setMobileDrawing(false)}>Done</button>}
                  </div>
                )}
              </div>
            )}
          </div>
      </div>

      {/* bod 5 (iterácia 12): starý full-page modal (.trp-detoverlay) tu žil predtým —
          ⤢ expand teraz navigate('/pack/map/:slug') na SAMOSTATNÚ route
          (PackTripArticle.tsx cez App.tsx), tak tento súbor už nikdy nemountuje so slugom. */}

      {/* ── KOMUNITNÉ modaly / dashboard (design plany/pack-community-features-design.md) ── */}
      {addModeChoiceOpen && (
        <AddModeChoice onPick={pickAddMode} onClose={() => setAddModeChoiceOpen(false)} />
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
      {/* PackPortal je full-bleed a nemountuje <PackLayout> (vlastný header/nav vyššie), takže
          overlay host (Inbox/Thread) sa mountuje aj tu priamo — inak by „Message owner"/„Open
          trip group" vyššie a Messages v zdieľanom PackBottomNav nemali kam otvoriť (viď
          komentár pri MessagingOverlayHost v PackLayout.tsx). */}
      <MessagingOverlayHost />
    </div>
  );
}
