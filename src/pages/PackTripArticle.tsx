// /pack/map/:slug — full-page trip article (iterácia 12 bod 5). Route model
// (LOCKED): klik na kartu v PackMap.tsx → inline detail v paneli, BEZ navigácie (zostáva
// na /pack/map). ⤢ expand → navigate() SEM, na SAMOSTATNÚ route — toto NAHRÁDZA
// starý `.trp-detoverlay` popup modal (zrušený z PackMap.tsx). Deep-link na :slug ide
// rovno sem (žiadna mapa/panel, shareable článok — AllTrails trail-page vzor).
//
// ADD-flow tripy (PackMap bod 6, iterácia 11) aj wishlist/walked toggle žijú v PackMap
// component state, ktorý sa pri navigácii sem zruší — tripShared.ts sessionStorage mirror
// (readLocalTrails/readFavIds/readWalkedIds) drží ich konzistentné cez mount/unmount v rámci
// tej istej browser session (žiadna Supabase perzistencia, tá je mimo rozsahu).
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // KRITICKÉ: bez neho .leaflet-tile stratí position:absolute a
// dlaždice kaskádujú dole ako bloky (Matej 2026-07-22 „mapa sa vykresľuje zle"). PackMap ho
// importuje, ale pri PRIAMOM otvorení článku (deep-link / ⤢ expand) PackMap nie je mountnutý.
import { mapyTiles } from '@/lib/env';
import { tripPillIcon } from '@/components/geo/trailIcons';
import { PoiLayer, PoiAttribution } from '@/components/geo/PoiLayer';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { placeholderFor } from '@/lib/tripPlaceholder';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { PackBottomNav, HieroglyphBg } from '@/components/pack/PackLayout';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { usePackStoreEpoch } from '@/hooks/usePackStoreEpoch';
import { useT, useLang } from '@/i18n/LanguageContext';
import { PACK_THEME, GLASS_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
// Emoji v čísle výletu (km, prevýšenie) — bez tohto fontu sadne Windows na čiernobiely
// textový variant. Ten istý zdroj, aký drží značky na mape.
import { FONT_EMOJI } from '@/components/pack/mapnotes/markEmoji';
import { TRAVEL_EMOJI } from '@/components/pack/addtrip/addTripModel';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { countryName, flagUrl, trailCountry } from '@/lib/countryGeo';
import {
  ICON, authorOf, REGION_OF, DiffMark, DIFF_MARK_CSS, RatingPaws, ElevationProfile, isWaterTrail, pluralKey,
  readLocalTrails, readFavIds, writeFavIds, readWalkedIds, writeWalkedIds, RENAMED_TRIP_IDS, tripPath,
  tripShareText, tripText, TRAIL_SABER_LAYERS, ensureTrailLineCss, visibleLocalTrails, tripDraftMissing } from '@/components/pack/tripShared';
import {
  crowdAggregate, founderWalkers, CROWD_EMOJI, readVotes, writeVotes, readPlans, writePlans, readEvents, writeEvents,
  walkPointsFor, walkRewardBase, RATE_PROMPT_POINTS, discoveryBonusFor, bonusToastText,
  type TripVote, type TripPlan, type PartnerEvent, type CrowdSlice,
} from '@/components/pack/packCommunity';
import {
  COMMUNITY_CSS, WalkedPopup,
  type WalkedInput, type WalkReward,
} from '@/components/pack/packCommunityUI';
import { PointsPill, POINTS_PILL_CSS } from '@/components/pack/PointsPill';
import { TripComments } from '@/components/pack/trip/TripComments';
import { TripEditPanel } from '@/components/pack/trip/TripEditPanel';
// ZÁPISY DO MAPY (2026-08-20) — v článku sú ROZBALENÉ, v mape schované pod ikonkou.
// Ktoré sem patria, rozhoduje geometria (notesForTrail), nie uložený kľúč.
import { MapNotesSection, MAP_NOTES_SECTION_CSS } from '@/components/pack/mapnotes/MapNotesSection';
import {
  AddMapNotePin, NoteSpotPin, AddMapNotePanel, MapNotePlacing, NoteQuickPalette, MapNoteTooFar,
  ADD_NOTE_CSS, notePanelH,
} from '@/components/pack/mapnotes/AddMapNote';
import { useLongPressPoint, useMapClickPoint, MIN_ZOOM_FOR_NOTE, LONG_PRESS_CSS } from '@/components/pack/mapnotes/useLongPressPoint';
import { GROUP_KINDS, defaultRadius, type NoteGroup, type NoteKind, type TickDisease } from '@/components/pack/mapnotes/mapNotesData';
import { MapNotesLayer, MAP_NOTES_CSS } from '@/components/pack/mapnotes/MapNotesLayer';
import { useMapNotes } from '@/components/pack/mapnotes/useMapNotes';
import { intlLocale } from '@/i18n/bcp47';
import { TrailMarks, type TrailMarkColor } from '@/components/pack/TrailMarks';
import { upsertMyTrip } from '@/components/pack/triplist/triplist'; // TRIPLIST (Slice A) — star popup upserts alongside the existing wishlist plan
// #41 — karta tvorcu výletu. Tá istá trojica ako v PackMap (inline detail), lebo
// mobil sem naviguje namiesto otvorenia panelu.
import { useOpenTrips, useTripEventTravel } from '@/components/pack/triplist/useOpenTrips';
import { useTripParties, partyKey } from '@/components/pack/triplist/useTripParty';
import { PartyMemberCard, PARTY_CARD_CSS } from '@/components/pack/triplist/PartyMemberCard';
import { ACT_TAG_EMOJI, ACT_TO_CATEGORY, categoriesOf, chipsOf } from '@/components/pack/tripCategories';

const GOLD = '#C99A3F';
const INK = '#1F1A0E';
const T = PACK_THEME;

// bod 2 (iterácia 14): rovnaké emoji mapovanie ako inline detail v PackMap.tsx (Aktivita/
// Tag vocabulary) — LOKÁLNA kópia, lebo zadanie scopuje bod 2 výhradne na tento súbor
// (PackMap.tsx sa v tejto iterácii nemení). Ak sa emoji sada niekedy zmení, treba upraviť
// na oboch miestach. Rovnaká poznámka ako PackMap: tr.acts[] nesie dátové id 'hike' (nie
// 'hiking'), takže ACT_EMOJI['hike'] je undefined — zdedený stav z inline detailu, flag v reporte.
//
// ✅ OPRAVENÉ 2026-08-03 (audit #45): kľúče sú odteraz TIE, ktoré reálne sú v dátach.
// Zmerané na `heroTrails.generated.ts`: acts = hike 55× · picnic 18 · overnight 7 ·
// skating 7 · paddleboard 7 · explore 1; tags = Forest 55 · View 49 · Meadow 34 ·
// River 18 · Sunset 12 · Mountains 12 · Lake 8. Staré kľúče `hiking` a `Lake/Reservoir`
// nemali v dátach ani jeden výskyt, takže tie dve emoji sa nikdy nezobrazili na
// 55, resp. 8 výletoch. `Asphalt` v tagoch neexistuje (je to hodnota `surface`) —
// nechávam ho tu len ako neškodnú rezervu.
// ⚠️ Dorovnané s `ACT_EMOJI`/`TAG_EMOJI` v `PackMap.tsx` (matrica 24. 8. 2026). Kľúče sú tu
// DATASETOVÉ (`hike`, `Lake`), emoji musia byť tie isté — článok a filter ukazujú ten istý výlet.
// ⚠️ ŽIADNA ŠTVRTÁ KÓPIA (2026-08-27). Do 27. 8. tu chýbalo `journey` úplne — magistrála
// teda v článku ostala bez emoji, hoci ho filter aj formulár mali. Zoznam je jeden:
// `components/pack/tripCategories.ts`.
const ACT_EMOJI: Record<string, string> = ACT_TAG_EMOJI;
// Dataset nesie `hike`, slovník kľúč `hiking` (ten používa filter aj formulár) — jeden riadok
// prekladu medzi nimi je lacnejší než tretí názov tej istej aktivity.
// Dátová hodnota `acts` → kľúč do slovníka. Staré hodnoty ('picnic', 'skating'…) ležia
// v datasete ďalej a preložia sa cez kategóriu, do ktorej patria — nový názov teda dostanú
// aj výlety, ktoré sa nikdy nemigrovali.
const ACT_ID_TO_UI = (a: string): string => ACT_TO_CATEGORY[a] ?? a;
const TAG_I18N_KEY: Record<string, string> = {
  Mountains: 'pack.map.tagLabel.mountains', Forest: 'pack.map.tagLabel.forest',
  'Lake/Reservoir': 'pack.map.tagLabel.lake', River: 'pack.map.tagLabel.river',
  View: 'pack.map.tagLabel.view', Meadow: 'pack.map.tagLabel.meadow', Sunset: 'pack.map.tagLabel.sunset',
  Shade: 'pack.map.tagLabel.shade', 'No shade': 'pack.map.tagLabel.noshade',
  'Forest path': 'pack.map.surfaceLabel.forest', Asphalt: 'pack.map.surfaceLabel.asphalt',
  Rocky: 'pack.map.surfaceLabel.rocky',
};
const TAG_EMOJI: Record<string, string> = {
  Mountains: '🏔️', Forest: '🌲', Lake: '🔵', River: '🌀', View: '👁️', Meadow: '🌼', Sunset: '🌅', Asphalt: '🛣️',
  // Tieň (Matej 2026-08-24) — v dátach zatiaľ nula výskytov, chip sa objaví až prvému
  // výletu, ktorý ho dostane. Kľúč je `label` z `TAG_OPTIONS`, nie `id`.
  Shade: '⛱️', 'No shade': '🌡️',
};

// bod 6 (iterácia 13): mobile route mapa sa renderovala sčasti čierna — Leaflet meria
// veľkosť pri mounte, kedy layout (hero/statrow nad ňou) ešte nemusí byť dokončený. Rovnaký
// vzor ako MapRefBridge v PackMap.tsx, len tu priamo volá invalidateSize namiesto expose.
// Leaflet si meria veľkosť kontajnera pri mounte — lenže nad mapou sú fotky galérie, ktoré sa
// ešte doťahujú a posúvajú layout, takže dlaždice sa napozicujú podľa zastaralej/nulovej veľkosti
// (Matej 2026-07-22: „mapa sa vykresľuje zle" — dva odsadené útržky). Fix = invalidateSize až keď
// sa layout ustáli: rAF + oneskorený tik + ResizeObserver na kontajner (chytí aj neskorý reflow).
// ZÁBER MAPY SA POČÍTA Z TRASY, nie z pevného zoomu (Matej 2026-08-20: „zaruby bukova je
// nejaka divna a zle nevidno v screene trasu"). Predtým tu bolo `center = stred poľa bodov`
// + `zoom={13}` natvrdo — pri trase, ktorá je dlhšia alebo inak tvarovaná než tá, na ktorej
// sa to kedysi nastavilo, časť stopy jednoducho vypadla z výrezu. Stred poľa bodov navyše NIE
// JE stred trasy: je to bod v polovici ZOZNAMU, čo pri nerovnomerne hustej stope sedí inde.
// `fitBounds` s odsadením drží celú trasu vnútri vždy; `maxZoom` bráni tomu, aby sa krátky
// výlet priblížil tak, že z mapy ostane textúra bez orientačných bodov.
function FitRoute({ path }: { path: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (path.length < 2) return;
    // Hore je odsadenie VÄČŠIE: na prvom bode trasy stojí pilulka s km a tá rastie NAHOR
    // (`translate(-50%,-100%)`). So symetrickým odsadením ju horná hrana mapy orezala.
    map.fitBounds(path, { paddingTopLeft: [28, 48], paddingBottomRight: [28, 28], maxZoom: 15 });
  }, [map, path]);
  return null;
}

function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize();
    const raf = requestAnimationFrame(fix);
    const t = setTimeout(fix, 250);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fix) : null;
    ro?.observe(map.getContainer());
    return () => { cancelAnimationFrame(raf); clearTimeout(t); ro?.disconnect(); };
  }, [map]);
  return null;
}

const CSS = `
/* bod 1 (iterácia 14): action bar presunutý z fixného spodného pruhu (.pta-actions zrušený)
   na spodný okraj hero fotky — .pta-root už nepotrebuje veľkú rezervu, len bežný bottom
   padding nech posledná sekcia (Comments) nezmizne za PackBottomNav. */
.pta-root{min-height:100dvh;background:${T.pageBg};color:${T.onDark};font-family:${FONT_UI};position:relative;padding-bottom:100px;}
/* §16 (2026-07-23): fotka je VNÚTRI glass rámika (.pta-shell) — full-bleed hore, zaoblené rohy
   dedí z rámika (overflow:hidden). Už NIE samostatná karta + rámik pod ňou, ale fotka v rámiku. */
.pta-shell{max-width:800px;width:calc(100% - 32px);margin:22px auto 0;position:relative;z-index:2;overflow:hidden;}
.pta-hero{position:relative;width:100%;height:34vh;min-height:230px;max-height:360px;overflow:hidden;background-size:cover;background-position:center;background-color:#111;}
.pta-hero-grad{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.30) 0%,rgba(0,0,0,0) 34%,rgba(0,0,0,0.55) 100%);}
/* CC atribúcia cover fotky (Wikimedia Commons, CC BY-SA — legálne nutná viditeľnosť) */
.pta-hero-credit{position:absolute;top:8px;right:10px;z-index:4;font-family:system-ui,sans-serif;font-size:9.5px;letter-spacing:.02em;line-height:1.25;color:rgba(255,255,255,0.72);background:rgba(0,0,0,0.34);padding:3px 8px;border-radius:6px;max-width:62%;text-align:right;pointer-events:none;}
.pta-back{position:absolute;top:calc(env(safe-area-inset-top,0px) + 18px);left:18px;z-index:5;width:38px;height:38px;border-radius:50%;background:rgba(0,0,0,0.55);border:1px solid rgba(255,255,255,0.28);color:#fff;font-size:17px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;}
/* Zrkadlo .pta-back — rovnaká výška aj tvar, aby hero mal dva rovnocenné rohy a nie jeden
   ovládač a jednu ozdobu. Zlatý inkoust hovorí „toto je tvoje", nie „pozor". */
.pta-edit{position:absolute;top:calc(env(safe-area-inset-top,0px) + 18px);right:18px;z-index:5;width:38px;height:38px;border-radius:50%;background:rgba(0,0,0,0.55);border:1px solid rgba(201,154,63,0.55);color:#E9C46A;font-size:16px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.pta-edit:hover{border-color:#C99A3F;color:#F5C73D;}
/* iterácia 15 (Matej 2026-07-27): akčný rad je VON z hero fotky — sedí v glass paneli NAD
   stat tabuľkou (km/prevýšenie). Dôvod: ghost tlačidlá na fotke boli „slabo viditeľné a biedne",
   plné farby na tmavom paneli čítajú lepšie a fotka ostáva čistá.
   Mobile: IntersectionObserver na .pta-hero → .collapsed trieda, keď fotka vyscrolluje z
   viewportu — rad sa "odtrhne" a prilepí ako zvislý icon-only rail vpravo (position:fixed).
   .pta-acts-slot drží výšku v toku, aby obsah pod ním neposkočil hore, keď rad odíde do railu.
   Desktop bez collapse (.collapsed nemá na ≥761px žiadny efekt). */
.pta-acts-slot{margin-top:18px;}
.pta-acts{display:flex;gap:9px;}
.pta-acts .pta-actbtn{display:flex;align-items:center;justify-content:center;gap:6px;}
/* dropdown na zelenom WALKED ✓ (Matej 2026-07-27) — wrapper musí byť position:relative,
   inak menu vypadne mimo tlačidla. */
.pta-actwrap{position:relative;flex:1;display:flex;}
.pta-actwrap .pta-actbtn{flex:1;}
.pta-actmenu{position:absolute;left:0;top:calc(100% + 6px);z-index:20;min-width:200px;background:#0d0d0d;border:1px solid ${T.onDarkBorder};border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,0.6);overflow:hidden;}
.pta-actmenu button{display:flex;width:100%;align-items:center;gap:9px;padding:11px 13px;background:none;border:0;cursor:pointer;font-family:${FONT_UI};font-size:12px;font-weight:500;color:${T.onDark};text-align:left;}
.pta-actmenu button + button{border-top:1px solid ${T.onDarkHair};}
.pta-actmenu button:hover{background:rgba(245,240,228,0.07);}
.pta-actmenu .pta-actmenu-off{color:${T.onDarkDim};}
.pta-caret{font-size:9px;opacity:0.8;}
.pta-actbtn-label{white-space:nowrap;}
/* Body za prejdenie = <PointsPill> (components/pack/PointsPill.tsx). Zlatý <span>
   .pta-actbtn-pts ZMAZANÝ 2026-08-05 (Matej: „tie body musia byť výrazné… je to úplne
   stratené") — zlatá na zlatom/priehľadnom tlačidle splývala.
   NA MOBILE bolo číslo do 5. 8. ÚPLNE SKRYTÉ, lebo sa rad troch tlačidiel na 390 px nezmestil
   (merané: ~434 px do 312 px radu). Nezmestil sa kvôli TEXTOM, nie kvôli číslu — preto sú
   sekundárne akcie (Triplist, Share) na mobile icon-only a číslo je konečne vidieť. */
/* F1 (Matej 2026-07-24): „Ikonka srdiečka ≠ ikonka checklistu z headra → zladiť." Unicode ♡/♥
   vymenené za brand clipboard.svg — rovnaká ikonka ako Triplist v status pruhu/headri.
   Mask + currentColor namiesto <img filter:…>: ikonka tak drží PRESNÚ farbu textu tlačidla
   v oboch stavoch (tmavá na zlatom podklade → zlatá keď je trip už v triplistе). */
.pta-ic-mask{display:inline-block;width:13px;height:13px;background-color:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat;}
@media (max-width:760px){
  .pta-acts-slot{min-height:44px;}
  .pta-actbtn{font-size:10px;padding:12px 4px;}
  /* ── 390 px rad (2026-08-05) ─────────────────────────────────────────────────
     Hlavná akcia (✓ prejdené) drží text AJ pilulku bodov; Triplist a Share sa zmrštia na
     štvorcovú ikonku. Obe majú aria-label od začiatku, takže sa nestráca nič okrem slova,
     ktoré sa aj tak nezmestilo.
     ⚠️ Selektory MUSIA byť dvojtriedne (.pta-acts .pta-actbtn--gold). Media query nepridáva
     špecificitu a základné .pta-actbtn{flex:1} stojí v tomto súbore NIŽŠIE — jednotriedny
     override by prehral na poradí a tlačidlá by ostali tretinové. */
  .pta-acts{gap:7px;}
  .pta-acts .pta-actbtn--gold,.pta-acts .pta-actbtn--blue{flex:0 0 42px;padding:12px 0;}
  /* Cinzel 700 uppercase s .06em sa v SK („Označiť ako prejdené", 20 znakov) na 390 px nezmestí
     ani po zmrštení susedov — chýbalo 16 px. Rozpal písmen je jediné, čo sa dá ubrať bez toho,
     aby sa buď skrátil text, alebo zmizla pilulka. Cinzel a veľkosť ostávajú. */
  .pta-acts .pta-actbtn-label{letter-spacing:.01em;min-width:0;overflow:hidden;text-overflow:ellipsis;}
  .pta-acts .pta-actbtn--gold .pta-actbtn-label,.pta-acts .pta-actbtn--blue .pta-actbtn-label{display:none;}
  .pta-acts .pta-actbtn--ghost,.pta-acts .pta-actbtn--green{flex:1 1 auto;min-width:0;overflow:hidden;}
  .pta-acts.collapsed{position:fixed;left:auto;right:14px;bottom:auto;top:50%;transform:translateY(-50%);flex-direction:column;padding:0;gap:10px;z-index:45;}
  .pta-acts.collapsed .pta-actwrap{flex:0 0 auto;}
  .pta-acts.collapsed .pta-actbtn{flex:0 0 auto;width:42px;height:42px;padding:0;border-radius:50%;box-shadow:0 6px 18px rgba(0,0,0,0.45);}
  /* Rail = kruhové ikonky pri okraji → text, šípka aj pilulka bodov idú preč (kruh má 42 px). */
  .pta-acts.collapsed .pta-actbtn-label,.pta-acts.collapsed .pta-caret,.pta-acts.collapsed .pts-pill{display:none;}
  .pta-acts.collapsed .pta-actbtn,.pta-acts.collapsed .pta-actbtn--gold,.pta-acts.collapsed .pta-actbtn--blue{flex:0 0 auto;padding:0;}
  /* v raile je rad pri pravom okraji → menu sa musí otvárať doľava, nie pod tlačidlo */
  .pta-acts.collapsed .pta-actmenu{left:auto;right:calc(100% + 8px);top:0;}
}
/* bod 3 (iterácia 14): fotky v galérii klikacie → lightbox (fullscreen popup) */
.pta-lightbox{position:fixed;inset:0;z-index:200;background:rgba(5,5,5,0.94);display:flex;align-items:center;justify-content:center;padding:28px;}
.pta-lightbox img{max-width:100%;max-height:100%;object-fit:contain;border-radius:10px;}
.pta-lightbox-close{position:absolute;top:16px;right:16px;z-index:2;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.3);color:#fff;font-size:19px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.pta-lightbox-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:2;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.3);color:#fff;font-size:24px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.pta-lightbox-prev{left:16px;}
.pta-lightbox-next{right:16px;}
/* bod 1: bez negatívneho margin-top prekryvu (buttony teraz sedia na spodku hero fotky —
   prekryv by kolidoval s nimi); telo článku začína čisto pod fotkou. */
.pta-body{max-width:760px;margin:0 auto;padding:20px 20px 0;position:relative;z-index:2;}
/* §16 (2026-07-23): obsahová časť článku do zdieľaného LIQUID GLASS panelu (.pk-glass z GLASS_CSS)
   — nemá plávať na plnej čiernej, rovnaká situácia ako triplist/walked. */
.pta-panel{padding:22px 20px 26px;}
.pta-loc{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};display:flex;align-items:center;gap:7px;}
/* vlajka krajiny — na karte v mape je (.trp-cardflag), v článku chýbala, takže zahraničný
   výlet stratil pri otvorení jediný signál, že je v cudzine (audit #45) */
.pta-flag{width:16px;height:16px;border-radius:50%;object-fit:cover;border:1px solid rgba(255,255,255,0.55);flex-shrink:0;}
.pta-title{font-family:${FONT_TITLE};font-weight:700;font-size:26px;line-height:1.15;color:${T.onDark};margin-top:4px;}
/* Autor vľavo, hodnotenie vpravo — jeden riadok pod titulom (Matej 2026-08-25).
   align-items:baseline (nie center): meno aj číslo sedia na tej istej linke písma, inak
   labky riadok opticky roztiahnu a podpis odskočí nahor. Na úzkom mobile sa smie zalomiť. */
.pta-byline{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:8px;}
.pta-author{font-size:11.5px;color:${T.onDarkDim};}
.pta-byrating{display:inline-flex;align-items:center;gap:5px;flex-shrink:0;}
.pta-byrating b{font-family:${FONT_UI};font-weight:600;font-size:13px;color:${T.onDark};}
/* Počet hodnotení je váha čísla, nie údaj sám o sebe — preto tichšie a bez kurzívy. */
/* Zátvorka s počtom je tlačidlo, ale nesmie vyzerať ako tlačidlo — je to počet, ktorý sa dá
   nasledovať. Podčiarknutie bodkami hovorí „dá sa kliknúť" tichšie než rám alebo farba. */
.pta-bycount{font-family:${FONT_UI};font-size:11px;color:${T.onDarkDim};background:none;border:none;padding:0;cursor:pointer;text-decoration:underline dotted;text-underline-offset:3px;}
.pta-bycount:hover{color:${T.onDark};}
.pta-statrow{display:flex;margin-top:20px;border-radius:14px;overflow:hidden;border:1px solid ${T.onDarkBorder};background:${T.glassSoft};}
.pta-stat{flex:1;padding:13px 6px;text-align:center;display:flex;flex-direction:column;justify-content:center;}
.pta-stat + .pta-stat{border-left:1px solid ${T.onDarkBorder};}
.pta-stat b{display:flex;align-items:center;justify-content:center;gap:5px;font-family:${FONT_UI};font-size:15px;font-weight:600;color:${T.onDark};}
.pta-stat span{display:block;font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:${T.onDarkDim};margin-top:2px;}
/* F1 (Matej 2026-07-24): „Zlúčiť dĺžka + prevýšenie do jedného bloku oddeleného zvislou čiarou
   + spraviť miesto na VIBE." Route = km │ ↑m v jednej bunke, uvoľnená bunka ide na Crowd. */
.pta-route{display:flex;align-items:center;justify-content:center;gap:8px;}
.pta-route i{display:block;width:1px;height:13px;background:${T.onDarkBorder};}
/* .pta-stat span je label (9px, uppercase) — vnútorné spany v .pta-route ho NESMÚ zdediť,
   inak „8 km" vysadne menšie než susedné „Moderate". */
.pta-route span{display:inline;font-size:inherit;letter-spacing:normal;text-transform:none;color:inherit;margin-top:0;}
/* Matej 2026-07-27: label „Distance · Elevation" zrušený — ikony hovoria to isté.
   Na mobile ide route pod seba (km NAD prevýšením), aby stĺpec nepotreboval toľko šírky.
   ⚠️ Trieda .pta-ratingstack tu zanikla 25. 8. 2026 spolu so štvrtou dlaždicou — hodnotenie
   je dnes v riadku pod titulom (.pta-byrating), kde sa nelomí a stohovať sa nemá čo. */
@media (max-width:560px){
  .pta-route{flex-direction:column;gap:3px;}
  .pta-route i{display:none;}
}
/* bod 2 (iterácia 14): tagy + aktivity s emoji, POD stat tabuľkou */
.pta-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px;}
.pta-tag{background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:11px;font-weight:600;padding:5px 11px;border-radius:999px;}
.pta-gallery{display:flex;gap:8px;overflow-x:auto;margin-top:20px;padding-bottom:4px;scrollbar-width:none;}
.pta-gallery::-webkit-scrollbar{display:none;}
.pta-gallery img{flex:0 0 148px;height:104px;border-radius:11px;object-fit:cover;background:#111;cursor:pointer;}
/* AKO SA TAM IDE — riadok plánu nad popisom. Bodka medzi políčkami je pseudoprvok medzi
   súrodencami, nie znak v texte: ktorékoľvek z troch políčok môže chýbať. */
.pta-travel{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:20px;font-family:${FONT_UI};font-weight:500;font-size:13px;color:${PACK_THEME.onDarkDim};}
/* Pod kartou organizátora stojí tesnejšie — nie je to odsek stránky, ale poznámka k nemu. */
.pta-travel--host{margin:6px 0 10px 4px;font-size:12.5px;}
.pta-travel > span + span::before{content:'·';margin-right:8px;opacity:.5;}
.pta-travel-seats{color:#C99A3F;}
.pta-desc{font-size:14px;line-height:1.75;color:${T.onDarkDim};margin-top:20px;}
.pta-dognote{font-size:14px;line-height:1.75;color:${T.onDarkDim};margin-top:10px;}
.pta-mapwrap{position:relative;margin-top:24px;border-radius:16px;overflow:hidden;height:320px;border:1px solid ${T.onDarkBorder};background:#0a0a0a;}
.pta-mapwrap .leaflet-container{width:100%;height:100%;background:#0a0a0a;}
.pta-mapwrap .leaflet-interactive{transition:opacity .2s ease;}
/* ── CELOOBRAZOVKOVÝ REŽIM MAPY POČAS ZÁPISU ODKAZU (Matej 2026-08-25) ──────
   „ak chce človek nechať odkaz na mape, tak sa otvorí panel s možnosťami ale zakryje mapu
   a tak sa to nedá pridať… treba pri kliknutí na pridať odkaz otvoriť náhľad výletu
   v rozhraní ako v 2. kroku pri nahadzovaní, nech je vidno mapu."

   Prečo sa to doladiť NEDALO: mapa v článku je 320 px vysoká, paleta odkazov aj formulár
   značky stoja pri spodnej hrane a merajú 33vh — na telefóne je teda spodný panel skoro
   taký vysoký ako CELÁ mapa. Uhýbanie stránkou (scrollMapClear, zmazané) navyše počítalo
   s natvrdo napísanou výškou panela 60 px, ktorá so skutočným panelom nesúvisela.

   Riešenie je to isté, aké má krok 2 sprievodcu: mapa cez celú obrazovku, panel pri spodnej
   hrane (tvar z mapDockShape.ts), návrat krížikom toho panela, ktorý práve stojí. Článok
   pod mapou sa nemení, preto sa scroll pri zavretí vracia na to isté miesto.

   z-index 1100 = NAD spodnou navigáciou (50) a mobilným railom (45), POD panelmi zápisu
   (.mnq-wrap 1250, .mna-sheet 1200, bublina AInubisa 1202).
   ⚠️ Poradie v súbore rozhoduje: --full musí stáť ZA .pta-mapwrap, obe majú jednu
   triedu, teda rovnakú špecifickosť. */
.pta-mapwrap--full{position:fixed;inset:0;z-index:1100;height:auto;margin:0;border:0;border-radius:0;}
/* Článok pod mapou sa nesmie hýbať, kým je mapa cez celú obrazovku. */
body.pta-mapfull{overflow:hidden;}
/* 🔑 BEZ TOHTO SA MAPA NA CELÚ OBRAZOVKU NEROZTIAHNE. Sklenený rámik článku (.pk-glass)
   má backdrop-filter, a prvok s filtrom je PODĽA ŠPECIFIKÁCIE obklopujúci blok pre svojich
   fixed potomkov — position:fixed;inset:0 sa teda nevzťahovalo na okno, ale na rámik.
   Odmerané: mapa mala top −790 a výšku 1449 px (rozmery celého článku), nie 0 a 760.
   Rozmazanie na tú chvíľu vypíname; je aj tak celé skryté pod mapou. */
body.pta-mapfull .pta-shell{-webkit-backdrop-filter:none;backdrop-filter:none;}
/* 🔑 A DRUHÝ DÔVOD, PREČO SA TO RIEŠI NA RÁMIKU: .pta-shell má z-index 2, teda je vlastný
   vrstviaci kontext. Akékoľvek číslo vnútri neho (aj 1100) sa porovnáva až cez tú dvojku,
   takže mapa síce bola cez celú obrazovku, ale POD mobilným railom (45) aj spodnou
   navigáciou (40). Kým mapa stojí, dvíha sa celý rámik — článok za ňou aj tak nevidno. */
body.pta-mapfull .pta-shell{z-index:1100;}
/* ── PRIDAJ ODKAZ PRIAMO NA MAPKE (Matej 2026-08-21) ────────────────────────
   „doplnenie k článku dal by som ho priamo na mapku pridaj odkaz". Vstup patrí
   tam, kde človek pozerá, nie len do hlavičky sekcie nad mapou.

   VĽAVO DOLE zámerne: vpravo dole sedí PoiAttribution a tá sa prekryť NESMIE —
   viditeľná atribúcia je podmienka licencie ODbL, nie dekorácia.

   Vzhľad je .mns-add (zlatý outline pill), nie .btn-gold — plná zlatá by na mape
   kričala hlasnejšie než samotné značky. Výška 40 px je dotykové minimum. */
.pta-mapadd{position:absolute;left:12px;bottom:12px;z-index:700;display:inline-flex;align-items:center;gap:7px;min-height:40px;padding:0 15px;border-radius:999px;cursor:pointer;font-family:${FONT_UI};font-weight:600;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:${GOLD};background:rgba(5,5,5,0.82);border:1px solid rgba(201,154,63,0.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 4px 14px rgba(0,0,0,0.45);transition:background .15s,border-color .15s;}
.pta-mapadd:hover{background:rgba(201,154,63,0.18);border-color:${GOLD};}
.pta-mapadd b{font-weight:400;font-size:15px;line-height:1;}
/* ÚZKE OKNO: tlačidlo sa musí zmestiť VEDĽA atribúcie, nie na ňu — zakrytá
   atribúcia je porušenie licencie ODbL, nie kozmetika. Merané na obale mapy:
   pri plnej veľkosti sa obe zrazia až pod ~334 px okna, so zúžením pod ~305 px.
   Výška 40 px ostáva — je to dotykové minimum, nie ozdoba. */
@media (max-width:420px){.pta-mapadd{padding:0 11px;font-size:9.5px;letter-spacing:.09em;gap:5px;}}
.pta-mapempty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:${T.onDarkDim};font-family:${FONT_UI};font-weight:500;font-size:11px;letter-spacing:.2em;text-transform:uppercase;text-align:center;padding:20px;}
.pta-section{margin-top:28px;}
/* #41 — blok jednej partie (organizátor + kto s ním ide) */
.pta-host + .pta-host{margin-top:10px;}
.pta-section h3{font-family:${FONT_UI};font-weight:500;font-size:12.5px;letter-spacing:.2em;text-transform:uppercase;color:${GOLD};margin-bottom:8px;}
.pta-empty{font-size:12.5px;color:${T.onDarkDim};font-style:italic;}
/* .pta-actbtn — zdieľané medzi .pta-acts (iterácia 15; predtým .pta-hero-actions na fotke) */
.pta-actbtn{flex:1;font-family:${FONT_TITLE};font-weight:700;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;padding:12px 6px;border-radius:10px;cursor:pointer;border:1px solid transparent;transition:all .15s;}
.pta-actbtn--gold{background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border-color:rgba(250,244,236,0.3);}
.pta-actbtn--gold.on{background:rgba(201,154,63,0.18);color:${GOLD};border-color:${GOLD};}
/* Ghost = len „Mark walked" pred označením. Zosilnené oproti iterácii 14 (0.06/0.18 splývalo
   s podkladom — Matej: „slabo viditeľné a biedne"). */
.pta-actbtn--ghost{background:rgba(245,240,228,0.10);color:${T.onDark};border-color:rgba(245,240,228,0.34);}
.pta-actbtn--ghost:hover{background:rgba(245,240,228,0.16);}
/* Modrá SHARE + zelená WALKED ✓ — obe kotvené na kánonické brand tokeny z packTheme:
   T.partHek #2E5FD0 (Egyptian blue) a T.growGreen #3D7A4E. Gradient je len svetlejší/tmavší
   odtieň okolo tokenu, aby držal rovnaký diagonálny vzor ako zlatý .btn-gold. */
.pta-actbtn--blue{background:linear-gradient(135deg,#3A6BDD,#2148B8);color:#fff;border-color:rgba(255,255,255,0.24);box-shadow:0 6px 16px rgba(46,95,208,0.30);}
.pta-actbtn--blue:hover{background:linear-gradient(135deg,#4478EC,#264FC7);}
.pta-actbtn--green{background:linear-gradient(135deg,#4A8F5D,#2F6440);color:#fff;border-color:rgba(255,255,255,0.22);box-shadow:0 6px 16px rgba(61,122,78,0.28);}
.pta-actbtn--green:hover{background:linear-gradient(135deg,#549C68,#356E47);}
.pta-notfound{min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:${T.onDarkDim};font-family:${FONT_UI};text-align:center;padding:20px;}
${DIFF_MARK_CSS}
`;

// F1 (Matej 2026-07-24): „hover → info koľko ľudí tak hlasovalo". Počet ide PRVÝ — otázka je
// koľko ľudí, nie aké percento; % ostáva v zátvorke ako druhotná informácia.
// „walker/walkers" = jednotné/množné číslo, aby to nečítalo „1 walkers".
function voteTip(t: ReturnType<typeof useT>, slices: CrowdSlice<string>[]): string {
  return slices
    .map((s) => `${s.count} ${s.count === 1 ? t('pack.trip.walkerSingular') : t('pack.trip.walkerPlural')}: ${s.value} (${s.pct}%)`)
    .join(' · ');
}

export default function PackTripArticle() {
  const t = useT();
  const { lang } = useLang();   // popisy výletov nesú DÁTA, nie i18n kľúče (viď tripText)
  const mapNotes = useMapNotes(true);

  // ── DOPĹŇANIE ODKAZOV PRIAMO Z ČLÁNKU (Matej 2026-08-21) ─────────────────
  // „pri blogovom článku pri mape by mala byť možnosť doplniť tieto info ak človek
  // prešiel trasu." Do 21. 8. sa dalo písať len gestom na celkovej mape — človek,
  // ktorý sa práve vrátil z trasy a číta jej článok, teda musel odísť inam a tam
  // to miesto znova nájsť.
  //
  // ⚠️ BRÁNA JE „PREJDENÉ", nie členstvo: odkaz na trase je svedectvo, nie názor.
  // Kto tam nebol, nevie, či je rampa zavretá ani kde boli kliešte.
  //
  // Rovnaké komponenty ako v `PackMap.tsx`, len bez rýchlej cesty pri kurzore —
  // v malej mape v článku by plusko za myšou prekážalo pri čítaní.
  const [noteMap, setNoteMap] = useState<L.Map | null>(null);
  const [noteDraft, setNoteDraft] = useState<{ lat: number; lon: number; group: NoteGroup; kind: NoteKind; disease: TickDisease | null; radiusM: number | null } | null>(null);
  const [notePlacing, setNotePlacing] = useState<NoteGroup | null>(null);
  const [noteSpot, setNoteSpot] = useState<{ lat: number; lon: number } | null>(null);
  const [notePick, setNotePick] = useState(false);
  const [noteZoom, setNoteZoom] = useState(0);
  const [noteTooFar, setNoteTooFar] = useState<{ x: number; y: number } | null>(null);
  const tooFarTimer = useRef<number | null>(null);

  const showTooFar = useCallback((x: number, y: number) => {
    setNoteTooFar({ x, y });
    if (tooFarTimer.current !== null) window.clearTimeout(tooFarTimer.current);
    tooFarTimer.current = window.setTimeout(() => { setNoteTooFar(null); tooFarTimer.current = null; }, 2600);
  }, []);
  useEffect(() => () => { if (tooFarTimer.current !== null) window.clearTimeout(tooFarTimer.current); }, []);

  // Priblíženie ako stav — lišta „ukáž miesto" musí prepnúť na „priblíž si mapu"
  // v tej chvíli, keď človek odzoomuje, nie až po kliknutí naprázdno.
  useEffect(() => {
    if (!noteMap) return;
    const sync = () => setNoteZoom(noteMap.getZoom());
    sync();
    noteMap.on('zoomend', sync);
    return () => { noteMap.off('zoomend', sync); };
  }, [noteMap]);
  const dateLocale = intlLocale(lang);
  const navigate = useNavigate();
  const { slug, country } = useParams<{ slug: string; country?: string }>();
  const id = usePackIdentity();
  const { toast } = useToast();

  // bod 5 side-effect (viď súborový komentár hore): allTrails = statické HERO_TRAILS +
  // sessionStorage mirror ADD-flow tripov z PackMap (jeden-krát na mount stačí — táto
  // stránka je detail jedného tripu, nepotrebuje živú reaktivitu na iný tab/mount).
  const allTrails = useMemo(() => [...visibleLocalTrails(readLocalTrails()), ...HERO_JOURNEYS, ...HERO_TRAILS], []);
  const baseTrail = useMemo(() => allTrails.find((x) => x.id === slug) ?? null, [allTrails, slug]);
  /**
   * ── ÚPRAVA VÝLETU AUTOROM (Matej 2026-08-25) ────────────────────────────────────────────
   * „ako autor by som do toho vedel vstúpiť a prepísať text vymeniť fotky" — názov ostáva,
   * mazanie nie je (obe potvrdené v tej istej správe).
   *
   * `allTrails` sa číta RAZ na mount (viď komentár vyššie — detail jedného výletu nepotrebuje
   * živú reaktivitu), takže po uložení by stránka ukazovala starý text až do reloadu. Preto sa
   * čerstvá zmena drží vedľa a prekrýva základ.
   *
   * ⚠️ VLASTNÍCTVO SA TESTUJE ÚLOŽISKOM, NIE MENOM. `authorOf(trail) === moje meno` je zlý kľúč
   * z troch dôvodov naraz (rovnaké zdôvodnenie ako pri mazaní plánu v `PackMap.tsx`): meno sa
   * v profile zmení a stratíš prístup k staršiemu, dvaja Mateji v svorke by si videli navzájom,
   * a seed výlety majú v autorovi `AUTHOR_FALLBACK`. Kto má výlet vo svojich `localTrails`,
   * ten ho zapísal.
   * ⚠️ Dôsledok, ktorý je zámerný: **seed výlety z datasetu (Záruby a spol.) sa upraviť nedajú.**
   * Sú generované zo `plany/trails-nahadzovac-state.json` a najbližšie pregenerovanie by zmenu
   * prepísalo — upravujú sa nástrojom `npm run trip-audit`, nie z appky.
   */
  const [edits, setEdits] = useState<Partial<HeroTrail> | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const canEdit = useMemo(() => !!slug && readLocalTrails().some((t) => t.id === slug), [slug]);
  const trail = useMemo(
    () => (baseTrail && edits ? { ...baseTrail, ...edits } : baseTrail),
    [baseTrail, edits],
  );
  // Starý (premenovaný) slug → redirect na nový, nech zdieľané odkazy nehádžu „trip not found".
  const renamedTo = !trail && slug ? RENAMED_TRIP_IDS[slug] : undefined;
  useEffect(() => {
    if (renamedTo) navigate(`/pack/map/svk/${renamedTo}`, { replace: true });
  }, [renamedTo, navigate]);
  // Dosvit fialového meča žije v `TRAIL_LINE_CSS`, ktorý si PackMap vlieva do vlastného
  // <style>. Článok je vlastná routa, takže bez tohto by mu trieda `trp-saber-glow`
  // ticho nič nerobila. Idempotentné — štýl sa vloží raz na dokument.
  useEffect(() => { ensureTrailLineCss(); }, []);

  // Odkaz bez krajiny (`/pack/map/:slug`, tvar spred 3.8.2026) → doplň segment a prepíš URL.
  // `replace`, aby sa späť tlačidlo nezasekalo na starom tvare.
  useEffect(() => {
    if (trail && !country) navigate(tripPath(trail), { replace: true });
  }, [trail, country, navigate]);

  // #41 — KTO TENTO VÝLET VYPÍSAL. Na desktope to rieši inline detail v PackMap, ale
  // MOBIL sem naviguje na celú routu (`/pack/map/:slug`), takže bez tohto by na
  // primárnom povrchu nebolo vidieť organizátora vôbec. Hooky MUSIA byť nad
  // `if (!trail)` returnom nižšie (Rules of Hooks).
  const { trips: openTrips } = useOpenTrips();
  // Hydratácia z DB (issue #32). Stojí TU, nie nižšie pri ostatnom komunitnom stave: číta ho
  // `useTripEventTravel` o pár riadkov nižšie a `const` sa nedá použiť pred deklaráciou —
  // pri pokuse spadne CELÁ stránka na „Cannot access 'storeEpoch' before initialization".
  // Chytí to až error boundary, takže to vyzerá ako prázdna stránka, nie ako chyba kódu.
  const storeEpoch = usePackStoreEpoch();

  const hostsHere = useMemo(
    () => openTrips.filter((o) => o.slug === slug),
    [openTrips, slug],
  );
  const hostParties = useTripParties(hostsHere.map((o) => ({ slug: o.slug, organizerId: o.organizerId })));
  // AKO SA ORGANIZÁTOR DOSTANE NA VÝLET — z `trip_events` daného slugu (viď hook).
  // Kľúč je `host_id`, nie slug: na jednom výlete môže hľadať partiu viacero ľudí naraz
  // a každý ide inak.
  const travelByHost = useTripEventTravel(slug, storeEpoch);
  const hosts = useMemo(() => hostsHere.flatMap((o) => {
    const party = hostParties[partyKey(o.slug, o.organizerId)];
    // bez organizátora z RPC (zavretý medzitým, nezaplatený) nie je koho vykresliť
    if (!party?.organizer) return [];
    return [{
      key: partyKey(o.slug, o.organizerId), date: o.date,
      organizer: party.organizer, joiners: party.joiners,
      travel: travelByHost[o.organizerId],
      // kontext pre „Message" na karte (#53) — adresu si server odvodí sám
      slug: o.slug, organizerId: o.organizerId,
    }];
  }), [hostsHere, hostParties, travelByHost]);

  const [favIds, setFavIds] = useState<Set<string>>(() => readFavIds());
  const [walkedIds, setWalkedIds] = useState<Set<string>>(() => readWalkedIds());
  useEffect(() => { writeFavIds(favIds); }, [favIds]);
  useEffect(() => { writeWalkedIds(walkedIds); }, [walkedIds]);

  // ── VSTUPY DO ZÁPISU NA MAPE V ČLÁNKU ────────────────────────────────────
  // TRI vstupy: dlhé podržanie / pravý klik dá najprv MIESTO a pýta sa typ,
  // tlačidlo v rohu mapy a tlačidlo v sekcii dajú najprv TYP a čakajú na klik.
  // Rýchla cesta beží len keď nie je rozrobená pomalá — inak by si klik a držanie
  // súperili o ten istý dotyk.
  //
  // Bránu na písanie (`noteGate`) drží jedno miesto nižšie — potrebuje hlasy,
  // ktoré vznikajú až za komunitnou vrstvou.
  const noteBusy = !!noteDraft || !!noteSpot || notePick;

  /**
   * CELOOBRAZOVKOVÝ REŽIM MAPY. Zapína sa v okamihu, keď sa začne zápis odkazu — teda
   * pri palete (typ), pri „ukáž miesto" aj pri otvorenom formulári.
   *
   * Dôvod, čísla a CSS → komentár pri `.pta-mapwrap--full`. Návrat obstaráva krížik toho
   * panela, ktorý práve stojí; samostatné × tu preto nie je — dve východiská na jednej
   * obrazovke sú horšie než jedno.
   */
  const noteFull = noteBusy || notePlacing !== null;

  /**
   * KAM SA ČLÁNOK VRÁTI PO ZAVRETÍ MAPY.
   *
   * 🔑 Nedá sa to prečítať až vo chvíli otvorenia: kým sa effect dostane k slovu, mapa už
   * je pripnutá, `.pta-mapwrap` vypadla z toku, článok sa o jej výšku skrátil a prehliadač
   * scroll sám orezal — namerané 1157 → 813 px, teda návrat o 344 px vedľa. Preto sa
   * posledná poloha článku drží priebežne a počas celoobrazovkového režimu sa neprepisuje.
   */
  const articleScrollRef = useRef(0);
  const noteFullRef = useRef(false);
  useEffect(() => {
    const save = () => { if (!noteFullRef.current) articleScrollRef.current = window.scrollY; };
    save();
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, []);

  // ⚠️ LAYOUT effect, nie obyčajný: zámok sa musí zavesiť v tom istom kroku, v akom sa mapa
  // pripne. Obyčajný effect beží až po vykreslení, takže by ho mohla predbehnúť udalosť
  // scrollu z orezania a uložená poloha článku by sa prepísala tou orezanou.
  useLayoutEffect(() => {
    if (!noteFull) return;
    noteFullRef.current = true;
    const back = articleScrollRef.current;
    document.body.classList.add('pta-mapfull');
    const map = noteMap;
    // Leaflet o zmene výšky svojho kontajnera sám nevie. `InvalidateSizeOnMount` ju chytí
    // cez ResizeObserver, ale až o snímku neskôr — dovtedy by mapa mala dlaždice pre
    // 320 px vysoký box a spodné dve tretiny obrazovky by ostali prázdne.
    //
    // ⚠️ Záber sa ZÁMERNE NEPREPOČÍTAVA. `invalidateSize` drží stred, takže výrez, ktorý
    // človek videl v článku, ostane v strede vyššej obrazovky — teda nad panelom. Nové
    // `fitBounds` by zahodilo priblíženie, ktoré si možno práve nastavil na miesto,
    // kvôli ktorému odkaz píše.
    const raf = window.requestAnimationFrame(() => map?.invalidateSize());
    return () => {
      window.cancelAnimationFrame(raf);
      document.body.classList.remove('pta-mapfull');
      map?.invalidateSize();
      window.scrollTo({ top: back });
      noteFullRef.current = false;
    };
  }, [noteFull, noteMap]);

  /**
   * SKUTOČNÁ VÝŠKA SPODNÉHO PANELA — meraná, nie odhadnutá.
   *
   * `notePanelH()` je ODHAD spred mountu: mapa sa musí odpanovať v okamihu kliku, keď panel
   * ešte neexistuje, takže tam iná možnosť nie je. Atribúcia sa ale dvíha AŽ POTOM a merať
   * si dovoliť môže — a rozdiel je veľký: paleta meria na PC 107 px, formulár až 420.
   * S odhadom by pilulka na PC visela v strede mapy.
   *
   * ⚠️ Atribúcia POI je podmienka licencie ODbL, nie dekorácia — preto sa vôbec dvíha.
   */
  const hasDraft = !!noteDraft;
  const [notePanelPx, setNotePanelPx] = useState(0);
  useEffect(() => {
    if (!noteBusy) { setNotePanelPx(0); return; }
    const el = document.querySelector('.mna-sheet, .mnq-panel') as HTMLElement | null;
    if (!el) { setNotePanelPx(0); return; }
    const read = () => setNotePanelPx(Math.round(el.getBoundingClientRect().height));
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [noteBusy, hasDraft]);

  /**
   * DRUHÝ POHĽAD — AŽ KEĎ PANEL NAOZAJ STOJÍ.
   *
   * `placeNote` odpanuje mapu podľa ODHADU (`notePanelH()` = 33vh), lebo v okamihu kliku
   * panel ešte neexistuje. Lenže 33vh je pre formulár len SPODNÁ hranica: pri kliešti
   * s potvrdenou chorobou a zapnutým okruhom narastie na ~366 px, a vtedy značka, ktorú
   * človek práve položil, skončí POD ním — teda presne to, čomu má odpanovanie zabrániť.
   * Odmerané pri parkovisku (288 px): spodok značky prečnieval pod hranu panela.
   *
   * ⚠️ Dorovnáva sa LEN keď je značka naozaj schovaná — druhý skok mapy bez dôvodu vyzerá
   * ako chyba. A vedome to NEZÁVISÍ od `lat`/`lon`: ťahanie značky mení súradnice priebežne
   * a mapa by pod prstom ušla. Beží teda pri vzniku zápisu a pri RASTE panela (výmena druhu),
   * nie pri posune značky.
   *
   * Odklad 420 ms = prvé odpanovanie z `placeNote` je animované 350 ms; bez čakania by sa
   * počítalo z rozbehnutej polohy.
   */
  useEffect(() => {
    if (!hasDraft || !noteMap || !notePanelPx || !noteDraft) return;
    const map = noteMap;
    const { lat, lon } = noteDraft;
    const t = window.setTimeout(() => {
      const pt = map.latLngToContainerPoint([lat, lon]);
      const hidden = pt.y - (map.getSize().y - notePanelPx - 12);
      if (hidden > 0) map.panBy([0, hidden + 28], { animate: true, duration: 0.3 });
    }, 420);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDraft, noteMap, notePanelPx]);

  /**
   * Položí značku a odpanuje MAPU tak, aby značka ostala nad spodným panelom.
   *
   * Do 25. 8. sa tu namiesto toho hýbalo STRÁNKOU — mapa bola nízky box v strede článku,
   * takže `panBy` by v nej posunul trasu, ale samotný box by ostal ležať pod panelom.
   * Odkedy je počas zápisu mapa cez celú obrazovku, platí to isté a jediné pravidlo ako
   * v `PackMap`: hýbe sa mapa. Výška panela sa NEOPISUJE, berie ju `notePanelH()` z toho
   * istého zdroja ako CSS (`mapDockShape.ts`).
   */
  const placeNote = useCallback((group: NoteGroup, lat: number, lon: number) => {
    setNoteTooFar(null);
    setNotePlacing(null);
    setNoteSpot(null);
    setNotePick(false);
    setNoteDraft({ lat, lon, group, kind: GROUP_KINDS[group][0], disease: null, radiusM: defaultRadius(GROUP_KINDS[group][0]) });
    const map = noteMap;
    if (!map) return;
    const pt = map.latLngToContainerPoint([lat, lon]);
    const safeY = map.getSize().y - notePanelH() - 40;
    if (pt.y > safeY) map.panBy([0, pt.y - safeY], { animate: true, duration: 0.35 });
  }, [noteMap]);

  // ── KOMUNITNÁ vrstva (rovnaké flowy ako PackMap — walked popup / wishlist zámer /
  // partner ad); sessionStorage mirror (packCommunity), žiadna Supabase. ──
  const nowMs = useMemo(() => Date.now(), []);
  const [votes, setVotes] = useState<Record<string, TripVote>>(() => readVotes());
  const [plans, setPlans] = useState<TripPlan[]>(() => readPlans());
  const [events, setEvents] = useState<PartnerEvent[]>(() => readEvents());
  useEffect(() => { writeVotes(votes); }, [votes]);
  useEffect(() => { writePlans(plans); }, [plans]);
  useEffect(() => { writeEvents(events); }, [events]);
  // Znovu prečítať po hydratácii z DB (issue #32) — viď usePackStoreEpoch.
  // ⚠️ `storeEpoch` je deklarovaný VYŠŠIE (nad blokom organizátorov) — číta ho
  // `useTripEventTravel`; druhá deklarácia tu by ho zatienila.
  useEffect(() => {
    if (!storeEpoch) return;
    setFavIds(readFavIds());
    setWalkedIds(readWalkedIds());
    setVotes(readVotes());
    setPlans(readPlans());
    setEvents(readEvents());
  }, [storeEpoch]);
  /**
   * AKO SA TAM IDE — z MÔJHO živého inzerátu na tento výlet (2026-08-26).
   * Zavretý inzerát (`closed`) sa nepočíta: kto sa už nemôže pridať, nepotrebuje vedieť,
   * odkiaľ sa vyráža. Po prejdení plánu inzerát zaniká, takže riadok zhasne sám.
   */
  const myTravel = useMemo(() => {
    if (!trail || !trail.id.startsWith('plan-') || walkedIds.has(trail.id)) return undefined;
    return events.find((e) => e.tripId === trail.id && e.hostIsMe && !e.closed)?.travel;
  }, [events, trail, walkedIds]);

  const [walkedPopupOpen, setWalkedPopupOpen] = useState(false);

  // ── BRÁNA NA ZÁPIS ODKAZU: PREJDENÉ **A** OHODNOTENÉ (Matej 2026-08-21) ───
  // „musí to človek mať prejdené a ohodnotené aby mohol interagovať". Odkaz na
  // trase je svedectvo, nie názor — a kto trasu neuzavrel hodnotením, ju ešte
  // nedočítal do konca.
  //
  //   neprešiel        → ovládač sa NEKRESLÍ, gesto na mape neurobí nič
  //   prešiel, nehodnotil → ovládač je vidieť, klik otvorí HODNOTENIE
  //   prešiel a hodnotil  → klik otvorí paletu
  //
  // ⚠️ JEDNA brána pre VŠETKY vstupy (tlačidlo na mape, tlačidlo v sekcii, dlhé
  // podržanie). Tri samostatné podmienky na tú istú vec sa časom rozídu — presne
  // to sa stalo s farbou upozornenia v `MapNotesSection`.
  //
  // „ohodnotené" = ten istý test, aký ráta `ratedCountFor()` v `packCommunity.ts`:
  // hlas bez labiek (samotné hazardy/komentár) hodnotenie nie je. Druhý sa
  // nevymýšľa.
  //
  // 💡 Na CELKOVEJ mape (`/pack/map`) žiadna takáto brána nie je a ani byť nemôže —
  // tam sa nedá vedieť, ktorej trasy sa zápis týka. Platí len v článku.
  const noteGate: 'none' | 'rate' | 'open' = !walkedIds.has(String(slug))
    ? 'none'
    : (votes[String(slug)]?.rating ?? 0) > 0 ? 'open' : 'rate';
  // Hodnotí PRETO, že chcel písať → po odoslaní sa paleta otvorí sama. Bez tohto
  // príznaku by vyskočila aj po bežnom hodnotení z tlačidla PREJDENÉ.
  const [noteAfterRating, setNoteAfterRating] = useState(false);
  /** Prejde bránou, alebo namiesto zápisu otvorí hodnotenie. `false` = teraz sa nepíše. */
  const passNoteGate = useCallback(() => {
    if (noteGate === 'none') return false;
    if (noteGate === 'rate') { setNoteAfterRating(true); setWalkedPopupOpen(true); return false; }
    return true;
  }, [noteGate]);

  useLongPressPoint(noteGate !== 'none' ? noteMap : null, !noteBusy && !notePlacing, {
    onPoint: (lat, lng) => { if (!passNoteGate()) return; setNoteTooFar(null); setNoteSpot({ lat, lon: lng }); },
    onTooFar: showTooFar,
  });
  // Klik do mapy je POKRAČOVANIE už začatého zápisu (`notePlacing`), takže bránou
  // prešiel o krok skôr — druhýkrát sa nepýta.
  useMapClickPoint(noteGate !== 'none' ? noteMap : null, !!notePlacing && !noteBusy, {
    onPoint: (lat, lng) => { if (notePlacing) placeNote(notePlacing, lat, lng); },
    onTooFar: showTooFar,
  });
  // Odmena za práve zapísané prejdenie (§3b) — spätne sa nedá dopočítať, bonus závisí od stavu
  // PRED klikom.
  const [walkedReward, setWalkedReward] = useState<WalkReward | null>(null);
  // Zelené WALKED ✓ nie je toggle — klik otvorí menu (Add to triplist / Remove walked).
  // Dôvod (Matej 2026-07-27): odznačenie zmaže aj hlas o obtiažnosti, nesmie sa stať omylom.
  const [walkedMenuOpen, setWalkedMenuOpen] = useState(false);
  const walkedMenuRef = useRef<HTMLDivElement | null>(null);

  // bod 1 (iterácia 14): mobile sticky icon-only rail — keď .pta-hero vyscrolluje z viewportu
  // (IntersectionObserver), akčné tlačidlá sa "odtrhnú" z fotky a prilepia napravo (viď CSS
  // .pta-acts.collapsed, scoped len ≤760px). Effect musí bežať aj po tom, čo `trail`
  // prejde z null→nájdený (heroRef sa naplní až vtedy), preto dep [trail?.id] nie [].
  // ⚠️ `id.loading` v depoch (fix 2026-07-27): kým identita načítava, komponent vracia loading
  // obrazovku → .pta-hero ešte NEEXISTUJE a heroRef.current je null. Bez tejto závislosti sa
  // effect po dobehnutí identity už nespustil a rail bol ticho mŕtvy.
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [heroCollapsed, setHeroCollapsed] = useState(false);
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([entry]) => setHeroCollapsed(!entry.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [trail?.id, id.loading]);

  // Rail je MOBILE-only. Predtým to riešila len CSS media query, ale s portálom (nižšie) musí
  // o šírke vedieť aj JS — inak by sa rad na desktope prehodil do document.body a vyzeral by
  // ako voľne plávajúci pruh mimo článku.
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width:760px)').matches,
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width:760px)');
    const onChange = () => setIsNarrow(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const railed = isNarrow && heroCollapsed;

  // WALKED dropdown: klik mimo / Escape zatvorí. Hook MUSÍ byť nad podmienenými returnmi nižšie
  // (Rules of Hooks) — inak biela stránka pri `trip not found`.
  useEffect(() => {
    if (!walkedMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!walkedMenuRef.current?.contains(e.target as Node)) setWalkedMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setWalkedMenuOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [walkedMenuOpen]);

  // bod 3 (iterácia 14): lightbox — index otvorenej fotky v trail.photos, null = zavreté
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // hover (desktop) / dotyk (mobile) nad route mapou → trasa zpriesvitnie na 50%, nech je
  // vidno podklad (terén/farba) pod ňou. Väzba na wrapper div, nie na Polyline samotnú —
  // presné trafenie 4px čiary prstom je nespoľahlivé.
  const [routeDimmed, setRouteDimmed] = useState(false);

  // ★ = jeden klik (uloží solo/closed), ✓ = jeden klik (zapíše prejdenie); hodnotenie aj
  // zverejnenie sú ponuka v toaste, nie podmienka. Odznačenie = priame odobratie (aj hlas/plán).
  // Rovnaká logika ako PackMap — dôvody sú popísané tam pri `toggleFav`/`toggleWalked`.
  const toggleFav = (tid: string) => {
    if (favIds.has(tid)) {
      setFavIds((prev) => { const n = new Set(prev); n.delete(tid); return n; });
      setPlans((prev) => prev.filter((p) => p.tripId !== tid));
      return;
    }
    chooseSolo();
    toast({
      description: t('pack.map.toastSavedToTriplist'),
      action: (
        <ToastAction altText={t('pack.map.toastOpenTriplist')} onClick={() => navigate('/pack/map/triplist')}>
          {t('pack.map.toastOpenTriplist')}
        </ToastAction>
      ),
    });
  };
  const toggleWalked = (tid: string) => {
    if (walkedIds.has(tid)) {
      setWalkedIds((prev) => { const n = new Set(prev); n.delete(tid); return n; });
      setVotes((prev) => { const n = { ...prev }; delete n[tid]; return n; });
      setWalkedReward(null);
      return;
    }
    // ODMENA (§3b): základ = presne to, čo sľubovalo tlačidlo · bonus = objavenia dopočítané
    // voči trasám prejdeným PREDTÝM (`walkedIds` je tu ešte stará množina). Rovnaká logika
    // ako v PackMap.tsx — jedna funkcia `discoveryBonusFor`, dva povrchy.
    const tr = allTrails.find((x) => x.id === tid);
    const reward: WalkReward | null = tr
      ? { tid, ...walkRewardBase(tr), bonuses: discoveryBonusFor(tr, allTrails.filter((x) => walkedIds.has(x.id))) }
      : null;
    setWalkedReward(reward);
    setWalkedIds((prev) => { const n = new Set(prev); n.add(tid); return n; });
    // Ponuka hodnotenia ide VŽDY (2026-08-06) — rovnako ako na mape. Odmenu aj objavenia
    // ukáže samotný popup, takže toast by len zdvojoval to isté číslo.
    setWalkedPopupOpen(true);
  };
  const closeWalkedPopup = () => {
    setWalkedPopupOpen(false);
    setWalkedReward(null);
    // Zavrel hodnotenie bez odoslania → zámer písať odkaz zaniká spolu s ním.
    setNoteAfterRating(false);
  };
  const submitWalked = (v: WalkedInput) => {
    if (!trail) return;
    setVotes((prev) => ({ ...prev, [trail.id]: { tripId: trail.id, ...v, at: nowMs } }));
    setWalkedIds((prev) => { const n = new Set(prev); n.add(trail.id); return n; });
    setWalkedPopupOpen(false);
    setWalkedReward(null);
    // Prišiel sem cez bránu odkazu — nech neklikne druhýkrát za tým istým.
    // `WalkedPopup` bez labiek odoslať nedá (`canSubmit`), takže brána je tu už otvorená.
    if (noteAfterRating) { setNoteAfterRating(false); setNotePick(true); }
  };
  const addPlan = (intent: 'solo' | 'partner', date = '') => {
    if (!trail) return;
    setPlans((prev) => [{ tripId: trail.id, intent, date, at: nowMs }, ...prev.filter((p) => p.tripId !== trail.id)]);
  };
  // `choosePartner` + `submitPartnerAd` ZMAZANÉ 2026-08-05 spolu s WishlistIntentPopupom, ktorý
  // ich ako jediný volal — ★ po zlúčení vstupov ukladá jedným klikom (solo/closed). Verejný
  // inzerát vzniká v AddTripPlan („Looking for pack") a zverejniť uložený výlet sa dá
  // v Triplistе. Rovnaká zmena ako v PackMap.tsx.
  const chooseSolo = () => {
    if (!trail) return;
    setFavIds((prev) => { const n = new Set(prev); n.add(trail.id); return n; });
    addPlan('solo');
    // TRIPLIST (Slice A): rename wishlist → triplist, star popup navyše upsertne triplist entry.
    upsertMyTrip(trail.id, { status: 'solo', openness: 'closed', date: '' });
  };

  const handleShare = async () => {
    if (!trail) return;
    const url = `${window.location.origin}${tripPath(trail)}`;
    const shareData = { title: trail.name, text: tripShareText(trail), url };
    if (typeof navigator.share === 'function') {
      try { await navigator.share(shareData); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ description: t('pack.trip.toastLinkCopied') });
    } catch {
      toast({ description: url });
    }
  };

  /**
   * ⚠️ TIETO DVA HOOKY MUSIA STÁŤ NAD `if (id.loading)` / `if (!id.session)` / `if (!trail)`
   * (opravené 2026-08-25). Ležali pri hodnotení, teda POD early returnmi — a keďže sa tie tri
   * podmienky za života stránky prepnú (načítavam → mám session → mám výlet), React na druhom
   * vykreslení narazil na dva hooky navyše: „Rendered more hooks than during the previous
   * render". Prejavilo sa to ako „Something went wrong" na KAŽDOM výlete, nielen na pláne.
   * Počiatočná hodnota `ratingCount` sa preto počíta z `baseTrail`, ktorý je k dispozícii už
   * tu; `trail` (základ + čerstvé úpravy) vzniká z toho istého záznamu a labky nemení.
   */
  const [ratingCount, setRatingCount] = useState(
    baseTrail && baseTrail.diff !== 'Odyssey' && (baseTrail.stars ?? 0) > 0 ? 1 : 0,
  );
  const reviewsRef = useRef<HTMLDivElement | null>(null);

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

  if (!trail) {
    return (
      <div className="pta-notfound" style={{ backgroundColor: T.pageBg }}>
        <style>{CSS}</style>
        <div style={{ fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('pack.trip.notFound')}</div>
        <button
          type="button"
          onClick={() => navigate('/pack/map')}
          style={{ fontFamily: FONT_UI, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD, background: 'none', border: 'none', cursor: 'pointer' }}
        >{t('pack.trip.notFoundBackToTrips')}</button>
      </div>
    );
  }

  /* ⚠️ ILUSTRAČNÁ FOTKA, KEĎ VLASTNÁ NIE JE (Matej 2026-08-25: „výlet sa pridal ale nepridala
     sa fotka (ilustračná)"). Čerstvo pridaný výlet — a každý plán — fotku nemá, takže hlavička
     článku bola čierna plocha. Ten istý zdroj, aký kreslí karty na mape aj v triplíste. */
  const cover = trail.photos[0] ?? placeholderFor(trail.acts, trail.id);
  // crowd agregát (design §A) — konzistentné s kartami v PackMap
  const agg = crowdAggregate(trail, votes[trail.id]);
  /**
   * ── POČET HODNOTENÍ MÁ JEDEN ZDROJ (Matej 2026-08-25, Záruby 1: „pri hodnotení je zátvorka 2
   *    ale dolu je pri hodnotení 0 = tu treba správny údaj") ────────────────────────────────
   *
   * Zátvorka pri labkách ukazovala `agg.walkedCount`, teda počet CHODCOV — a ten je pri seed
   * výlete vždy 2 (Matej + Hekthor, `FOUNDER_WALKERS`). Sekcia nižšie pritom počítala riadky
   * v `trip_reviews`, teda 0. Dve rôzne čísla pod tým istým slovom.
   * Číslo teraz hlási `TripComments` (jediné miesto, kde sú hodnotenia naozaj poskladané:
   * autor + členovia) a zátvorka ho len zobrazuje. Kým sa zoznam nedotiahne z DB, drží sa
   * autorovho hodnotenia — teda toho, čo vieme bez siete.
   */
  /**
   * AUTOROVO HODNOTENIE — `trail.stars`, teda labky zadané pri zakladaní výletu
   * (`stars: draft.paws` v `PackMap.tsx`; pri výletoch z datasetu hodnota z nahadzovača).
   *
   * ⚠️ MAGISTRÁLA JE VÝNIMKA a nie je to detail. Pri journey (`diff: 'Odyssey'`) je `stars`
   * REDAKČNÁ hodnota z `heroJourneys.ts`, nie hodnotenie chodca — a presne toto Matej
   * 3. 8. 2026 zamietol („neprešli = žiadny rating"), keď magistrála bez jediného chodca
   * svietila „5.0" vedľa vety, že ju nikto neprešiel. Autorské hodnotenie sa tam preto
   * nepočíta ani dnes.
   */
  // 🔴 TU JE `'Odyssey'` NÁZOV KATALÓGOVEJ MAGISTRÁLY, nie príznak viacdňovosti (2026-08-27).
  //    Na `isOdyssey()` sa to prepísať NESMIE: členova dvojdňovka by prišla o vlastné
  //    hodnotenie, hoci ho zadala. Rozdiel je vecný — magistrály nemá kto ohodnotiť.
  const authorRating = trail.diff === 'Odyssey' ? 0 : (trail.stars ?? 0);
  /**
   * ⚠️ Číslo hore padá na autorovo hodnotenie, keď agregát nemá čo agregovať.
   * `crowdAggregate` počíta zo `founderVotes` + môjho hlasu; pri výlete, ktorý pridal ČLEN,
   * sú zakladateľské hlasy nula (`founderWalkers`), takže cudziemu návštevníkovi vyšla nula
   * a labky zmizli — hoci hneď pod nimi stálo „hodnotenie (1)" s riadkom autora. Dve čísla
   * o tej istej veci, znova, len o poschodie nižšie.
   */
  const shownRating = agg.rating > 0 ? agg.rating : authorRating;
  /**
   * ⚠️ Skroluje sa STRÁNKOU s vlastným odsadením, nie `scrollIntoView`.
   * `block:'start'` by kotvu prilepil na horný okraj okna a `block:'center'` ju v dlhom
   * článku posunie tak, že prvé hodnotenie skončí mimo záberu. Chceme ukázať ZAČIATOK
   * sekcie aj s jej hlavičkou, teda kotvu s malým vzduchom nad ňou.
   */
  const scrollToReviews = () => {
    const el = reviewsRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };
  // audit #45 (2026-08-03, „začíname so všetkým do nuly"): FOUNDER_WALKERS bola globálna
  // konštanta (2) a fungovala len kým KAŽDÁ trasa mala garantovaných aspoň toľko hlasov.
  // Teraz je zakladateľských hlasov na trasu 0 alebo 2 (founderWalkers(trail)), takže base na
  // odčítanie musí byť per-trail, inak by sa „+X Dogyptians" buď nezobrazilo pri reálnom hlase
  // (0 zakladateľov + 1 user vote by dalo 1-2=-1), alebo počítalo z nesprávneho základu.
  const extraWalkers = agg.walkedCount - founderWalkers(trail);
  // bod 2 (iterácia 14): rovnaká chip-skladačka ako inline detail v PackMap.tsx (acts + tags,
  // emoji prefix keď existuje mapovanie).
  // ⚠️ `label` je DÁTOVÁ hodnota z `heroTrails.generated.ts` (`acts` = 'hike', `tags` =
  // 'Forest'), takže sa neprekladá — prekladá sa to, čo z nej človek číta. Kľúče sú tie isté
  // ako vo filtri mapy a vo formulári výletu; keď kľúč chýba, ostáva pôvodná hodnota.
  const actTx = (a: string) => {
    const k = `pack.map.activityLabel.${ACT_ID_TO_UI(a)}`;
    const v = t(k);
    return v === k ? a : v;
  };
  /** Názov chipu — slovník, s anglickým textom z `tripCategories.ts` ako záchranou. */
  const chipTx = (id: string, fallback: string) => {
    const k = `pack.map.chipLabel.${id}`;
    const v = t(k);
    return v === k ? fallback : v;
  };
  const tagTx = (tg: string) => {
    const k = TAG_I18N_KEY[tg];
    return k ? t(k) : tg;
  };
  // ⚠️ CHIPY SÚ KATEGÓRIE, NIE SUROVÉ `acts` (2026-08-27). Dve staré aktivity vedia padnúť
  // do jednej kategórie (piknik + nocľah = CHILL) a chip by potom stál na karte dvakrát
  // s tým istým slovom. `categoriesOf()` ich zlúči — a zároveň je to presne ten zoznam,
  // podľa ktorého výlet nachádza filter, takže karta ukáže, PREČO sa našla.
  // ⚠️ CHIPY KROKU 4 STOJA VEDĽA KATEGÓRIÍ, NIE NAMIESTO NICH (2026-08-31). Kategória hovorí,
  // ČO VÝLET JE („Visit"), chip ČO SME TAM ROBILI („⛺ Táborisko") — na túre s táboriskom sú
  // to dva rôzne údaje a zlúčiť ich do jedného slova by znamenalo jeden z nich zahodiť.
  // `chipsOf()` prepustí LEN skutočné chipy: staré `picnic`/`overnight` do kategórie patria,
  // ale chipom nikdy neboli a nemajú vlastný preklad — tie ostávajú len v kategórii.
  const tripChips = [
    ...categoriesOf(trail.acts).map((c) => ({ key: `a:${c}`, label: actTx(c), emoji: ACT_EMOJI[c] ?? '' })),
    ...chipsOf(trail.acts).map((ch) => ({ key: `c:${ch.id}`, label: chipTx(ch.id, ch.label), emoji: ch.emoji })),
    ...(trail.tags ?? []).map((tg) => ({ key: `t:${tg}`, label: tagTx(tg), emoji: TAG_EMOJI[tg] ?? '' })),
  ];

  // Akčný rad ako premenná — na mobile ho po odscrollovaní fotky renderujeme PORTÁLOM do
  // document.body (nie na mieste). Dôvod: rodičovský .pk-glass má backdrop-filter, ktorý robí
  // containing block pre position:fixed — rail by sa inak ukotvil o glass panel a plával
  // uprostred článku namiesto viewportu. Rovnaký vzor ako HeroBadges.tsx.
  const actsRow = (
        <div className={`pta-acts${railed ? ' collapsed' : ''}`}>
          {!walkedIds.has(trail.id) && (
            <button
              type="button"
              className={`pta-actbtn pta-actbtn--gold${favIds.has(trail.id) ? ' on' : ''}`}
              onClick={() => toggleFav(trail.id)}
              aria-label={favIds.has(trail.id) ? t('pack.trip.inTriplist') : t('pack.trip.addToTriplist')}
            >
              <span className="pta-actbtn-icon pta-ic-mask" style={{ '--ic': `url(${ICON('clipboard')})` } as React.CSSProperties} />
              <span className="pta-actbtn-label">{favIds.has(trail.id) ? t('pack.trip.inTriplist') : t('pack.trip.addToTriplist')}</span>
            </button>
          )}
          {walkedIds.has(trail.id) ? (
            <div className="pta-actwrap" ref={walkedMenuRef}>
              <button
                type="button"
                className="pta-actbtn pta-actbtn--green"
                onClick={() => setWalkedMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={walkedMenuOpen}
                aria-label={t('pack.trip.walkedAriaLabel')}
              >
                <span className="pta-actbtn-icon">🐾</span>
                <span className="pta-actbtn-label">{t('pack.trip.walkedCheck')}</span>
                <span className="pta-caret">▾</span>
              </button>
              {walkedMenuOpen && (
                <div className="pta-actmenu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setWalkedMenuOpen(false); toggleFav(trail.id); }}
                  >
                    {favIds.has(trail.id) ? t('pack.trip.inTriplistRemove') : t('pack.trip.addToTriplistPlus')}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="pta-actmenu-off"
                    onClick={() => { setWalkedMenuOpen(false); toggleWalked(trail.id); }}
                  >
                    {t('pack.trip.removeWalked')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="pta-actbtn pta-actbtn--ghost"
              onClick={() => toggleWalked(trail.id)}
            >
              <span className="pta-actbtn-icon">🐾</span>
              <span className="pta-actbtn-label">{t('pack.trip.markWalked')}</span>
              {/* Skutočné body za TÚTO trasu (5 + km + stúpanie / pevná cena magistrály) —
                  paušálne „+5" by klamalo, viď walkPointsFor. Objavenia (nové pohorie/NP)
                  tu ZÁMERNE nie sú: tlačidlo je sľub pred akciou a ten musí platiť vždy,
                  aj pri druhom prechode. Bonus sa odhalí až po ✓ (zadanie §3b). */}
              <PointsPill value={walkPointsFor(trail)} />
            </button>
          )}
          <button type="button" className="pta-actbtn pta-actbtn--blue" onClick={handleShare} aria-label={t('pack.trip.share')}>
            <span className="pta-actbtn-icon"><img src={ICON('link')} alt="" style={{ width: 12, height: 12, filter: 'brightness(0) invert(1)' }} /></span>
            <span className="pta-actbtn-label">{t('pack.trip.share')}</span>
          </button>
        </div>
  );

  return (
    <div className="pta-root">
      <style>{CSS}</style>
      <style>{COMMUNITY_CSS}</style>
      <style>{POINTS_PILL_CSS}</style>
      <style>{GLASS_CSS}</style>
      <style>{PARTY_CARD_CSS}</style>
      <style>{MAP_NOTES_SECTION_CSS}</style>
      <style>{MAP_NOTES_CSS}</style>
      {/* Kurzor v režime „ukáž miesto" (`.mn-placing` a spol.) — triedy sadajú na
          `.leaflet-container`, takže CSS musí byť na stránke, nie v komponente. */}
      <style>{LONG_PRESS_CSS}</style>
      <style>{ADD_NOTE_CSS}</style>
      {/* §16 (2026-07-23): heroglyf textúra ZA obsahom — bez nej glass panel nemá čo rozmazať
          (predtým holá čierna = „všetko na čiernej"). Rovnaké pozadie ako triplist/pack. */}
      <HieroglyphBg />

      <div className="pta-shell pk-glass">
      <div className="pta-hero" ref={heroRef} style={cover ? { backgroundImage: `url('${cover}')` } : undefined}>
        <div className="pta-hero-grad" />
        {(trail as { photoCredit?: string }).photoCredit && (
          <div className="pta-hero-credit">{(trail as { photoCredit?: string }).photoCredit}</div>
        )}
        <button type="button" className="pta-back" onClick={() => navigate('/pack/map')} aria-label={t('pack.trip.backToTrips')}>←</button>
        {/* Ceruzka je v hero oproti šípke späť — je to akcia nad CELÝM článkom, nie nad jeho
            sekciou, a v rade pod titulom (triplist / prešiel som / zdieľať) by si konkurovala
            s vecami, ktoré robí ktokoľvek. Vidí ju len autor (`canEdit`). */}
        {canEdit && (
          <button type="button" className="pta-edit" onClick={() => setEditOpen(true)} aria-label={t('pack.trip.edit.open')}>✎</button>
        )}
      </div>

        <div className="pta-panel">
        <div className="pta-loc">
          <img className="pta-flag" src={flagUrl(trailCountry(trail))} alt={countryName(trailCountry(trail))} loading="lazy" draggable={false} />
          <span>{trail.region}{REGION_OF[trail.region] ? ` · ${t(`pack.map.macroRegion.${REGION_OF[trail.region]}`)}` : ''}</span>
        </div>
        <div className="pta-title">{trail.name}</div>
        {/* bod 4 (iterácia 13): samostatný DiffMark+diff riadok pod titulom ZMAZANÝ —
            difficulty ostáva len v stat tabuľke nižšie (bolo 2×, teraz 1×). */}
        {/* ── HODNOTENIE HORE VEDĽA AUTORA (Matej 2026-08-25) ────────────────────────────
            „hodnotenie sa presunie hore vedľa autora na pravú stranu bez slova hodnotenie —
             budú tam packy + číslo a v zátvorke počet hodnotení."
            Dôvod je miesto: stat tabuľka niesla ŠTYRI dlaždice a v blogu majú byť tri
            (trasa · náročnosť · návštevnosť). Hodnotenie sa z nich vymyká aj obsahom —
            ostatné tri opisujú TERÉN, toto je súd ľudí, a preto patrí k podpisu, nie
            k tabuľke. Slovo „HODNOTENIE" odpadá: labka s číslom sa nedá čítať inak.
            Zátvorka = koľko chodcov ho dalo (`walkedCount`), teda váha toho čísla. */}
        <div className="pta-byline">
          <span className="pta-author">{t('pack.trip.by', { author: authorOf(trail) })}{extraWalkers > 0 ? ` · ${t('pack.trip.extraWalkers', { n: extraWalkers })}` : ''}</span>
          {/* rating = 0 znamená ŽIADNY hlas (Matej 2026-08-03) — vtedy tu nesmie byť nič,
              inak vyskočí „0.0" a prázdne labky vedľa mena autora. */}
          {shownRating > 0 && (
            <span className="pta-byrating">
              <RatingPaws stars={shownRating} size={12} gap={2} />
              <b>{shownRating.toFixed(1)}</b>
              {/* Zátvorka je ODKAZ na zoznam hodnotení (Matej 2026-08-25: „kliknutie na
                  zátvorku scroluje na hodnotenie"). Číslo bez cesty k tomu, čo počíta,
                  je slepá ulička — kto sa pýta „kto to hodnotil?", musí mať kam kliknúť. */}
              <button type="button" className="pta-bycount" onClick={scrollToReviews}>({ratingCount})</button>
            </span>
          )}
        </div>

        {/* iterácia 15 (Matej 2026-07-27): AKCIE — von z fotky, nad stat tabuľku.
            Stavová logika:
              neprejdený → ADD TO TRIPLIST (zlatá) · MARK WALKED (outline) · SHARE (modrá)
              prejdený   → triplist ZMIZNE (načo plánovať, čo už máš za sebou),
                           WALKED ✓ je zelené s dropdownom (Add to triplist — keď chceš
                           opakovať — / Remove walked) · SHARE
            SHARE je VŽDY viditeľný a modrý: má vyzývať na zdieľanie, nie sa stratiť. */}
        <div className="pta-acts-slot">
          {railed ? null : actsRow}
        </div>

        {/* crowd-sourced agregát (design §A): rating = priemer, difficulty + crowd = konsenzus.
            Hover na Difficulty/Crowd → %-rozpad AJ s počtom hlasov (F1: „hover → info koľko ľudí
            tak hlasovalo"). Pod prahom VOLUME_THRESHOLD sa hover nezobrazuje — je to seed, nie
            hlasovanie, tooltip „100% (2)" by tvrdil viac než dáta vedia. */}
        <div className="pta-statrow">
          {/* 6 výletov (vodné plochy: Bukovská priehrada, Liptovská Mara, Kráľová, Sĺňava,
              Orešianska, Palcmanská Maša) má `km: ""` a žiadne ascentM — bez tejto podmienky na
              CELEJ dlaždici (nie len na obsahu <b>) ostala prázdna .pta-stat bunka vedľa
              Crowd/Rating (audit #45 + doplnené: prázdny obal, nie len prázdny text). */}
          {(trail.km?.trim() || (trail as { ascentM?: number }).ascentM != null) && (
            <div className="pta-stat">
              {/* ⚠️ OBE ČÍSLA NESÚ EMOJI, NIE JEDNO (Matej 2026-08-25: „dvojšípka znázorňujúca
                  km je emoji = musí byť aj prevýšenie"). Do teraz tu stálo textové `↑` vedľa
                  emoji `↔️` — na telefóne to vyzerá ako dve rôzne abecedy v jednom riadku,
                  lebo emoji sa vykreslí farebne a holá šípka písmom textu.
                  ↗️, nie ⛰️: hora je hneď pod tabuľkou ako tag `Mountains` (`TAG_EMOJI`) a
                  dva rovnaké symboly na jednej obrazovke by hovorili o dvoch rôznych veciach.
                  `FONT_EMOJI` je povinný — bez neho Windows sadne na čiernobiely textový
                  variant a farebná dvojšípka vedľa neho vyzerá ako chyba. */}
              <b className="pta-route">
                {trail.km?.trim() && <span><em style={{ fontFamily: FONT_EMOJI, fontStyle: 'normal' }}>↔️</em> {trail.km} km</span>}
                {(trail as { ascentM?: number }).ascentM != null && (<>
                  <i />
                  <span><em style={{ fontFamily: FONT_EMOJI, fontStyle: 'normal' }}>↗️</em> {(trail as { ascentM?: number }).ascentM} m</span>
                </>)}
              </b>
            </div>
          )}
          {/* vodná plocha (isWaterTrail) nikdy nemá náročnosť — tvrdé pravidlo, nie len chýbajúca
              hodnota (audit #45, Bled ukazoval fabrikované „Moderate"). */}
          {!isWaterTrail(trail) && (
            <div
              className={agg.belowThreshold ? 'pta-stat' : 'pta-stat comm-hastip'}
              data-tip={agg.belowThreshold ? undefined : voteTip(t, agg.difficultyBreakdown)}
            >
              <b><DiffMark diff={agg.difficulty} /> {t(`pack.map.diff.${agg.difficulty}`)}</b><span>{t('pack.trip.stat.difficulty')}</span>
            </div>
          )}
          {agg.crowd && (
            <div
              className={agg.belowThreshold ? 'pta-stat' : 'pta-stat comm-hastip'}
              data-tip={agg.belowThreshold ? undefined : voteTip(t, agg.crowdBreakdown)}
            >
              <b>{CROWD_EMOJI[agg.crowd]} {t(`pack.map.crowdKind.${agg.crowd}`)}</b><span>{t('pack.trip.stat.crowd')}</span>
            </div>
          )}
        </div>

        {/* bod 2 (iterácia 14): tagy + aktivity s emoji, POD stat tabuľkou */}
        {tripChips.length > 0 && (
          <div className="pta-tags">
            {tripChips.map((c) => <span key={c.key} className="pta-tag">{c.emoji ? `${c.emoji} ` : ''}{c.label}</span>)}
          </div>
        )}

        {/* turistické značky (KČT) v poradí štart→cieľ — auto z OSM (compute-trail-marks.py) */}
        {(trail as { marks?: TrailMarkColor[][] }).marks?.length ? (
          <div style={{ marginTop: 14 }}>
            <TrailMarks marks={(trail as { marks?: TrailMarkColor[][] }).marks} labelColor={PACK_THEME.onDark} label={t('pack.trip.followMarkers')} />
          </div>
        ) : null}

        {trail.photos.length > 0 && (
          <div className="pta-gallery">
            {/* bod 3 (iterácia 14): klik na fotku → lightbox */}
            {trail.photos.map((p, i) => (
              <img key={i} src={p} alt="" loading="lazy" onClick={() => setLightboxIdx(i)} />
            ))}
          </div>
        )}

        {/* ── AKO SA TAM IDE (2026-08-26) ────────────────────────────────────────────
            Doprava · odkiaľ · voľné miesta z INZERÁTU, nie z výletu (Matej 26. 8.:
            „doprava sa nikde inde nezapisuje… ukladá sa len to, čo definuje samotný trip").
            Stojí NAD popisom: kto zvažuje, či sa pridá, rieši najprv „dostanem sa tam",
            až potom „čo to je".
            ⚠️ Ten istý riadok kreslí aj vnorený detail na mape (PackMap `trp-inldet`).
            Sú to dve obrazovky toho istého plánu, nie kópia jednej — obe čítajú `travel`
            z inzerátu a text zo slovníka, takže sa nemajú ako rozísť.
            ⚠️ Na MOBILE je toto JEDINÝ povrch, kde sa to dá prečítať (klik na kartu tam
            nevedie do vnoreného detailu, ale rovno sem). */}
        {myTravel && (
          <div className="pta-travel">
            {myTravel.mode && (
              <span>
                <b style={{ fontFamily: FONT_EMOJI, fontWeight: 400 }}>{TRAVEL_EMOJI[myTravel.mode] ?? ''}</b>
                {' '}{t(`pack.addTrip.plan.travel.${myTravel.mode}`)}
              </span>
            )}
            {myTravel.from && <span>{myTravel.from}</span>}
            {myTravel.pickup && (
              <span className="pta-travel-seats">
                {t('pack.map.planSeats' + pluralKey(myTravel.seats ?? 1), { n: myTravel.seats ?? 1 })}
              </span>
            )}
          </div>
        )}
        {tripText(trail, 'desc', lang) && <p className="pta-desc">{tripText(trail, 'desc', lang)}</p>}
        {tripText(trail, 'dogNote', lang) && <p className="pta-dognote">🐾 {tripText(trail, 'dogNote', lang)}</p>}

        {/* Zápisy členov (parkovisko, výstrahy, poznámky) — NAD diskusiou: je to
            informácia „než vyrazíš", nie rozhovor.
            Tlačidlo „Nechať odkaz" sa ukáže LEN tomu, kto trasu prešiel — a klik
            cez `passNoteGate()` ešte pýta hodnotenie, ak chýba (viď `noteGate`).
            Druhý, primárny vstup je tlačidlo priamo v rohu mapy nižšie. */}
        <MapNotesSection
          trail={trail}
          notes={mapNotes.notes}
          locale={dateLocale}
          onAdd={noteGate !== 'none' ? () => { if (passNoteGate()) setNotePick(true); } : undefined}
        />

        {/* §16 (2026-07-23): reviews + advice (rovnaká komponenta ako inline detail v PackMap)
            NAD mapou — nahrádza starú spodnú „Comments" sekciu (zmazaná). walked/onRequestWalk
            napojené na tunajší walked-popup: keď trip nie je walked, CTA otvorí „you did it" popup. */}
        <div ref={reviewsRef}>
        <TripComments
          tripId={trail.id}
          tripName={trail.name}
          walked={walkedIds.has(trail.id)}
          onMarkWalked={() => setWalkedIds((prev) => (prev.has(trail.id) ? prev : new Set(prev).add(trail.id)))}
          onRequestWalk={() => setWalkedPopupOpen(true)}
          authorRating={authorRating}
          authorName={authorOf(trail)}
          onCountChange={setRatingCount}
        />
        </div>

        <div
          className={`pta-mapwrap${noteFull ? ' pta-mapwrap--full' : ''}`}
          onMouseEnter={() => setRouteDimmed(true)}
          onMouseLeave={() => setRouteDimmed(false)}
          onTouchStart={() => setRouteDimmed(true)}
          onTouchEnd={() => setRouteDimmed(false)}
        >
          {trail.path.length > 0 ? (
            <MapContainer
              center={trail.path[Math.floor(trail.path.length / 2)]}
              zoom={13} zoomControl={false} attributionControl={false} style={{ width: '100%', height: '100%' }}
              ref={setNoteMap}
            >
              <TileLayer url={mapyTiles('outdoor')} />
              <InvalidateSizeOnMount />
              {/* `center`/`zoom` vyššie sú len počiatočné — skutočný záber dá FitRoute. Ostávajú
                  kvôli jedinému bodu (vodné plochy), kde sa niet čo zmestiť. */}
              <FitRoute path={trail.path} />
              {/* FARBA TRASY = FIALOVÝ MEČ, ROVNAKO AKO NA MAPE (Matej 2026-08-20:
                  „ak je blogovy clanok tak tam moze byt fialova, lebo bude vzdy iba jedna").
                  Predtým tu bol čierno-zlatý casing, takže tá istá trasa vyzerala na mape
                  fialovo a v článku žlto a človek nevedel, či sa pozerá na to isté. Zlatá
                  ostáva REZERVOVANÁ pre „táto je vybraná" — to má zmysel len tam, kde je
                  trás viac vedľa seba, čiže na mape. Tu je trasa vždy jedna.
                  Hover/dotyk (routeDimmed) stiahne opacity VŠETKÝCH vrstiev naraz, nech je
                  vidno turistické značenie pod nimi — jedna vrstva sama by ostala krytá. */}
              {/* Trasu kreslíme len keď to trasa naozaj JE. 6 výletov k vodným plochám má
                  v `path` jediný bod — dve polyline z jedného bodu vykreslili neviditeľnú
                  čiaru a mapa tvárila, že trasa existuje. Pri jednom bode ostáva mapa
                  s markerom: pri paddleboarde je odpoveď „kde to je", nie „kadiaľ ísť".
                  (audit #45) */}
              {trail.path.length > 1 && (<>
                {TRAIL_SABER_LAYERS.map((ly) => (
                  <Polyline
                    key={ly.key}
                    positions={trail.path}
                    // dosvit sa vlieva priamo na SVG element — react-leaflet posiela
                    // `pathOptions` cez `setStyle`, a ten `className` ignoruje (rovnaká
                    // pasca ako v PackMap, preto ten istý ref trik).
                    ref={(layer) => {
                      const el = (layer as unknown as { _path?: SVGElement } | null)?._path;
                      if (el) el.classList.toggle('trp-saber-glow', 'glow' in ly && !!ly.glow);
                    }}
                    pathOptions={{
                      color: ly.color,
                      weight: ly.weight,
                      opacity: ly.opacity * (routeDimmed ? 0.5 : 1),
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                ))}
              </>)}
              {/* Začiatok trasy nesie ÚDAJ (km, resp. názov pri vodnej ploche), nie packu —
                  Matej 2026-08-20: „daj preč tú packu a nechaj tam ten pils s km radšej".
                  Rovnaký tvar, aký má výlet na `/pack/map`, takže dva povrchy hovoria rovnako. */}
              <Marker
                position={trail.path[0]}
                icon={tripPillIcon({
                  km: trail.km,
                  diff: trail.diff,
                  label: trail.name,
                  water: isWaterTrail(trail),
                })}
              />
              {/* POI z OSM (issue #40) — pramene/výhľady/prístrešky pozdĺž TEJTO trasy.
                  Atribúcia je podmienka licencie ODbL, preto ide s vrstvou vždy v páre. */}
              <PoiLayer />
              {/* Hlasovanie a mazanie tu vedome NIE SÚ — zoznam pod článkom je miesto,
                  kde sa odkazy spravujú. Lajk zanikol 22. 8. na celom povrchu. */}
              <MapNotesLayer notes={mapNotes.notes} locale={dateLocale} />
              {/* Rozpracovaný zápis. Patrí DOVNÚTRA MapContainer (na rozdiel od panela) —
                  viď hlavičku AddMapNote.tsx. */}
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
          ) : (
            <div className="pta-mapempty">{t('pack.trip.routeSoon')}</div>
          )}
          {/* ⚠️ Atribúcia je PODMIENKA licencie ODbL, nie dekorácia — v celoobrazovkovom
              režime by inak zmizla pod spodným panelom. Dvíha sa presne o jeho nameranú
              výšku (viď `notePanelPx`); počas „ukáž miesto" je dole voľno a ostáva na mieste. */}
          {trail.path.length > 0 && <PoiAttribution style={notePanelPx ? { bottom: notePanelPx + 12 } : undefined} />}
          {/* Vstup do zápisu priamo na mape. Kreslí sa len tomu, kto trasu prešiel;
              ak ju ešte neohodnotil, klik otvorí najprv hodnotenie (viď `noteGate`).
              Počas rozrobeného zápisu mizne — inak by prekrýval vlastnú paletu. */}
          {trail.path.length > 0 && noteGate !== 'none' && !noteBusy && !notePlacing && (
            <button
              type="button"
              className="pta-mapadd"
              onClick={() => { if (passNoteGate()) setNotePick(true); }}
            >
              <b>+</b>{t('pack.mapNotes.map.add')}
            </button>
          )}
          {/* Výzva „priblíž si mapu" v mieste kliku — patrí do pozicovaného obalu
              mapy, lebo súradnice prichádzajú v jeho pixeloch. */}
          {noteTooFar && noteMap && (
            <MapNoteTooFar
              x={noteTooFar.x}
              y={noteTooFar.y}
              width={noteMap.getSize().x}
              height={noteMap.getSize().y}
            />
          )}
        </div>

        {/* #41 — KTO TENTO VÝLET VYPÍSAL. Nie autor trasy (`authorOf` je textové pole
            datasetu), ale reálny člen, ktorý má trasu ako otvorený výlet v DB.
            Nad profilom prevýšenia, lebo „s kým" je pri otvorenom výlete dôležitejšie
            než „koľko metrov". */}
        {hosts.length > 0 && (
          <div className="pta-section">
            <h3>{t('pack.trip.openFromPack')}</h3>
            {hosts.map((h) => (
              <div key={h.key} className="pta-host">
                <PartyMemberCard
                  member={h.organizer}
                  roleLabel={h.date ? `${t('pack.trip.host')} · ${h.date}` : t('pack.trip.host')}
                  dm={{ tripSlug: h.slug, organizerId: h.organizerId, isMe: h.organizerId === id.session?.user?.id }}
                />
                {/* Doprava organizátora — jediné miesto, kde ju vidí NIEKTO INÝ než autor.
                    Vlastný plán ju ukazuje vyššie (`myTravel`); tu ide o cudzí otvorený výlet,
                    takže sa číta z DB, nie z lokálneho skladu.
                    Stojí hneď pod kartou organizátora, nie nad zoznamom: patrí k NEMU —
                    keď na výlet vypíšu partiu dvaja, každý ide inak. */}
                {h.travel && (
                  <div className="pta-travel pta-travel--host">
                    {h.travel.mode && (
                      <span>
                        <b style={{ fontFamily: FONT_EMOJI, fontWeight: 400 }}>{TRAVEL_EMOJI[h.travel.mode] ?? ''}</b>
                        {' '}{t(`pack.addTrip.plan.travel.${h.travel.mode}`)}
                      </span>
                    )}
                    {h.travel.from && <span>{h.travel.from}</span>}
                    {h.travel.pickup && (
                      <span className="pta-travel-seats">
                        {t('pack.map.planSeats' + pluralKey(h.travel.seats ?? 1), { n: h.travel.seats ?? 1 })}
                      </span>
                    )}
                  </div>
                )}
                {h.joiners.map((j, i) => (
                  <PartyMemberCard
                    key={`${h.key}:${i}`}
                    member={j}
                    dm={{ tripSlug: h.slug, organizerId: h.organizerId }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {(trail as { elev?: number[] }).elev && (
          <div className="pta-section">
            <h3>{t('pack.trip.elevation')}</h3>
            <ElevationProfile elev={(trail as { elev?: number[] }).elev} km={parseFloat(trail.km) || 0} />
          </div>
        )}

        <div className="pta-section">
          {/* audit #45 (2026-08-03): fabrikované hlasy sú preč, walkedCount môže byť 0 (magistrála/
              trip bez zakladateľských hlasov) — „Walked by 0 Dogyptians" by bola nepravdivá veta.
              Matej 2026-08-03: pri nule JEDEN riadok, a nech je to výzva, nie konštatovanie —
              „No Dogyptian has walked this yet." + „Be the first to walk this." hovorili to isté. */}
          {/* ⚠️ POČÍTAJÚ SA DOGYPŤANIA, NIE HLASY (Matej 2026-08-25: „dogypťan je člen dogyptu,
              teda aj človek aj pes"). Slovenčina má tri tvary — bez varianty `few` by pri dvoch
              stálo „Prešlo 2 Dogypťanov". Podmienka ostáva na `walkedCount`: pýta sa, či tam
              niekto BOL, a to je otázka o ľuďoch. */}
          {agg.walkedCount === 0 ? (
            <h3>{t('pack.trip.beFirstWalk')}</h3>
          ) : (
            <h3>{t(`pack.trip.walkedBy.${pluralKey(agg.dogyptianCount).toLowerCase()}`, { n: agg.dogyptianCount })}</h3>
          )}
        </div>
        </div>
      </div>

      {/* bod 3 (iterácia 14): lightbox — fullscreen popup, tmavé pozadie, ✕ + prev/next */}
      {lightboxIdx !== null && (
        <div className="pta-lightbox" onClick={() => setLightboxIdx(null)}>
          <button type="button" className="pta-lightbox-close" onClick={() => setLightboxIdx(null)} aria-label={t('pack.trip.photoClose')}>×</button>
          {trail.photos.length > 1 && (
            <button
              type="button"
              className="pta-lightbox-nav pta-lightbox-prev"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => ((i ?? 0) - 1 + trail.photos.length) % trail.photos.length); }}
              aria-label={t('pack.trip.photoPrev')}
            >‹</button>
          )}
          <img src={trail.photos[lightboxIdx]} alt="" onClick={(e) => e.stopPropagation()} />
          {trail.photos.length > 1 && (
            <button
              type="button"
              className="pta-lightbox-nav pta-lightbox-next"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => ((i ?? 0) + 1) % trail.photos.length); }}
              aria-label={t('pack.trip.photoNext')}
            >›</button>
          )}
        </div>
      )}

      {/* Mobilný rail — ten istý actsRow, len portálom mimo .pk-glass (viď komentár pri actsRow). */}
      {railed && createPortal(actsRow, document.body)}

      {/* ── ÚPRAVA VÝLETU (len autor) ── */}
      {editOpen && (
        <TripEditPanel
          trail={trail}
          onSaved={(patch) => setEdits((prev) => ({ ...(prev ?? {}), ...patch }))}
          onClose={() => setEditOpen(false)}
        />
      )}

      {/* ── KOMUNITNÉ modaly (rovnaké ako PackMap) ── */}
      {walkedPopupOpen && (
        <WalkedPopup
          trailName={trail.name}
          initial={votes[trail.id] ? { rating: votes[trail.id].rating, difficulty: votes[trail.id].difficulty, crowd: votes[trail.id].crowd, comment: votes[trail.id].comment, when: votes[trail.id].when, hazards: votes[trail.id].hazards } : null}
          onSubmit={submitWalked}
          onClose={closeWalkedPopup}
          rewardPoints={votes[trail.id] ? undefined : RATE_PROMPT_POINTS}
          reward={walkedReward?.tid === trail.id ? walkedReward : null}
        />
      )}

      {/* ── ZÁPIS ODKAZU Z ČLÁNKU (Matej 2026-08-21) ──────────────────────────
          Panely žijú MIMO <MapContainer> — formulár nie je vrstva mapy (viď hlavičku
          AddMapNote.tsx). Poradie krokov je rovnaké ako na celkovej mape. */}
      {notePick && !noteDraft && (
        <NoteQuickPalette
          /* Uhýbanie mapou tu ZANIKLO: od celoobrazovkového režimu je mapa pod paletou
             celá a lišta „ukáž miesto" stojí hore pri AInubisovi, nie nad mapou. */
          onPick={(g) => { setNotePick(false); setNotePlacing(g); }}
          onCancel={() => setNotePick(false)}
        />
      )}
      {noteSpot && !noteDraft && (
        <NoteQuickPalette
          onPick={(g) => placeNote(g, noteSpot.lat, noteSpot.lon)}
          onCancel={() => setNoteSpot(null)}
        />
      )}
      {notePlacing && !noteDraft && (
        <MapNotePlacing
          group={notePlacing}
          ready={noteZoom >= MIN_ZOOM_FOR_NOTE}
          onCancel={() => setNotePlacing(null)}
        />
      )}
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
          /* Odkaz z článku sa pripína k TOMUTO výletu — na rozdiel od celkovej mapy,
             kde sa najbližší výlet len odhaduje geometriou. */
          pinnedSlug={trail.id}
          pinnedName={trail.name}
          onSubmit={async (n) => { await mapNotes.add(n); setNoteDraft(null); }}
          onCancel={() => setNoteDraft(null)}
        />
      )}

      <PackBottomNav />
    </div>
  );
}
