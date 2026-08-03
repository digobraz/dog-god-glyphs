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
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // KRITICKÉ: bez neho .leaflet-tile stratí position:absolute a
// dlaždice kaskádujú dole ako bloky (Matej 2026-07-22 „mapa sa vykresľuje zle"). PackMap ho
// importuje, ale pri PRIAMOM otvorení článku (deep-link / ⤢ expand) PackMap nie je mountnutý.
import { mapyTiles } from '@/lib/env';
import { placeIcon } from '@/components/geo/trailIcons';
import { PoiLayer, PoiAttribution } from '@/components/geo/PoiLayer';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { PackBottomNav, HieroglyphBg } from '@/components/pack/PackLayout';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { usePackStoreEpoch } from '@/hooks/usePackStoreEpoch';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, GLASS_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useToast } from '@/hooks/use-toast';
import { countryName, flagUrl, trailCountry } from '@/lib/countryGeo';
import {
  ICON, authorOf, REGION_OF, DiffMark, DIFF_MARK_CSS, RatingPaws, ElevationProfile,
  readLocalTrails, readFavIds, writeFavIds, readWalkedIds, writeWalkedIds, RENAMED_TRIP_IDS,
} from '@/components/pack/tripShared';
import {
  crowdAggregate, FOUNDER_WALKERS, CROWD_EMOJI, readVotes, writeVotes, readPlans, writePlans, readEvents, writeEvents,
  type TripVote, type TripPlan, type PartnerEvent, type CrowdSlice,
} from '@/components/pack/packCommunity';
import {
  COMMUNITY_CSS, WalkedPopup, WishlistIntentPopup, PartnerAdForm,
  type WalkedInput, type PartnerAdInput,
} from '@/components/pack/packCommunityUI';
import { TripComments } from '@/components/pack/trip/TripComments';
import { TrailMarks, type TrailMarkColor } from '@/components/pack/TrailMarks';
import { upsertMyTrip } from '@/components/pack/triplist/triplist'; // TRIPLIST (Slice A) — star popup upserts alongside the existing wishlist plan
// #41 — karta tvorcu výletu. Tá istá trojica ako v PackMap (inline detail), lebo
// mobil sem naviguje namiesto otvorenia panelu.
import { useOpenTrips } from '@/components/pack/triplist/useOpenTrips';
import { useTripParties, partyKey } from '@/components/pack/triplist/useTripParty';
import { PartyMemberCard, PARTY_CARD_CSS } from '@/components/pack/triplist/PartyMemberCard';

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
const ACT_EMOJI: Record<string, string> = { hike: '🥾', picnic: '🧺', overnight: '⛺', skating: '🛼', paddleboard: '🏄', explore: '🧭' };
const TAG_EMOJI: Record<string, string> = {
  Mountains: '🏔️', Forest: '🌲', Lake: '🏞️', River: '💧', View: '🌄', Meadow: '🌼', Sunset: '🌅', Asphalt: '🛣️',
};

// bod 6 (iterácia 13): mobile route mapa sa renderovala sčasti čierna — Leaflet meria
// veľkosť pri mounte, kedy layout (hero/statrow nad ňou) ešte nemusí byť dokončený. Rovnaký
// vzor ako MapRefBridge v PackMap.tsx, len tu priamo volá invalidateSize namiesto expose.
// Leaflet si meria veľkosť kontajnera pri mounte — lenže nad mapou sú fotky galérie, ktoré sa
// ešte doťahujú a posúvajú layout, takže dlaždice sa napozicujú podľa zastaralej/nulovej veľkosti
// (Matej 2026-07-22: „mapa sa vykresľuje zle" — dva odsadené útržky). Fix = invalidateSize až keď
// sa layout ustáli: rAF + oneskorený tik + ResizeObserver na kontajner (chytí aj neskorý reflow).
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
/* F1 (Matej 2026-07-24): „Ikonka srdiečka ≠ ikonka checklistu z headra → zladiť." Unicode ♡/♥
   vymenené za brand clipboard.svg — rovnaká ikonka ako Triplist v status pruhu/headri.
   Mask + currentColor namiesto <img filter:…>: ikonka tak drží PRESNÚ farbu textu tlačidla
   v oboch stavoch (tmavá na zlatom podklade → zlatá keď je trip už v triplistе). */
.pta-ic-mask{display:inline-block;width:13px;height:13px;background-color:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat;}
@media (max-width:760px){
  .pta-acts-slot{min-height:44px;}
  .pta-actbtn{font-size:10px;padding:12px 4px;}
  .pta-acts.collapsed{position:fixed;left:auto;right:14px;bottom:auto;top:50%;transform:translateY(-50%);flex-direction:column;padding:0;gap:10px;z-index:45;}
  .pta-acts.collapsed .pta-actwrap{flex:0 0 auto;}
  .pta-acts.collapsed .pta-actbtn{flex:0 0 auto;width:42px;height:42px;padding:0;border-radius:50%;box-shadow:0 6px 18px rgba(0,0,0,0.45);}
  .pta-acts.collapsed .pta-actbtn-label,.pta-acts.collapsed .pta-caret{display:none;}
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
.pta-author{font-size:11.5px;color:${T.onDarkDim};margin-top:8px;}
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
/* Matej 2026-07-27: label „Distance · Elevation" zrušený — ikony (↔ / ↑) hovoria to isté.
   Na mobile ide route pod seba (↔ km NAD ↑ m) a rating tiež (číslo NAD packami), aby stĺpce
   nepotrebovali toľko šírky a text sa nelámal. */
@media (max-width:560px){
  .pta-route{flex-direction:column;gap:3px;}
  .pta-route i{display:none;}
  /* column-reverse = číslo hore, packy pod ním (v DOM sú packy prvé, aby desktop čítal „🐾 4.0"). */
  .pta-ratingstack{flex-direction:column-reverse;gap:3px;}
}
/* bod 2 (iterácia 14): tagy + aktivity s emoji, POD stat tabuľkou */
.pta-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px;}
.pta-tag{background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:11px;font-weight:600;padding:5px 11px;border-radius:999px;}
.pta-gallery{display:flex;gap:8px;overflow-x:auto;margin-top:20px;padding-bottom:4px;scrollbar-width:none;}
.pta-gallery::-webkit-scrollbar{display:none;}
.pta-gallery img{flex:0 0 148px;height:104px;border-radius:11px;object-fit:cover;background:#111;cursor:pointer;}
.pta-desc{font-size:14px;line-height:1.75;color:${T.onDarkDim};margin-top:20px;}
.pta-dognote{font-size:14px;line-height:1.75;color:${T.onDarkDim};margin-top:10px;}
.pta-mapwrap{position:relative;margin-top:24px;border-radius:16px;overflow:hidden;height:320px;border:1px solid ${T.onDarkBorder};background:#0a0a0a;}
.pta-mapwrap .leaflet-container{width:100%;height:100%;background:#0a0a0a;}
.pta-mapwrap .leaflet-interactive{transition:opacity .2s ease;}
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
function voteTip(slices: CrowdSlice<string>[]): string {
  return slices
    .map((s) => `${s.count} ${s.count === 1 ? 'walker' : 'walkers'}: ${s.value} (${s.pct}%)`)
    .join(' · ');
}

export default function PackTripArticle() {
  const t = useT();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const id = usePackIdentity();
  const { toast } = useToast();

  // bod 5 side-effect (viď súborový komentár hore): allTrails = statické HERO_TRAILS +
  // sessionStorage mirror ADD-flow tripov z PackMap (jeden-krát na mount stačí — táto
  // stránka je detail jedného tripu, nepotrebuje živú reaktivitu na iný tab/mount).
  const allTrails = useMemo(() => [...readLocalTrails(), ...HERO_JOURNEYS, ...HERO_TRAILS], []);
  const trail = useMemo(() => allTrails.find((x) => x.id === slug) ?? null, [allTrails, slug]);
  // Starý (premenovaný) slug → redirect na nový, nech zdieľané odkazy nehádžu „trip not found".
  const renamedTo = !trail && slug ? RENAMED_TRIP_IDS[slug] : undefined;
  useEffect(() => {
    if (renamedTo) navigate(`/pack/map/${renamedTo}`, { replace: true });
  }, [renamedTo, navigate]);

  // #41 — KTO TENTO VÝLET VYPÍSAL. Na desktope to rieši inline detail v PackMap, ale
  // MOBIL sem naviguje na celú routu (`/pack/map/:slug`), takže bez tohto by na
  // primárnom povrchu nebolo vidieť organizátora vôbec. Hooky MUSIA byť nad
  // `if (!trail)` returnom nižšie (Rules of Hooks).
  const { trips: openTrips } = useOpenTrips();
  const hostsHere = useMemo(
    () => openTrips.filter((o) => o.slug === slug),
    [openTrips, slug],
  );
  const hostParties = useTripParties(hostsHere.map((o) => ({ slug: o.slug, organizerId: o.organizerId })));
  const hosts = useMemo(() => hostsHere.flatMap((o) => {
    const party = hostParties[partyKey(o.slug, o.organizerId)];
    // bez organizátora z RPC (zavretý medzitým, nezaplatený) nie je koho vykresliť
    if (!party?.organizer) return [];
    return [{
      key: partyKey(o.slug, o.organizerId), date: o.date,
      organizer: party.organizer, joiners: party.joiners,
      // kontext pre „Message" na karte (#53) — adresu si server odvodí sám
      slug: o.slug, organizerId: o.organizerId,
    }];
  }), [hostsHere, hostParties]);

  const [favIds, setFavIds] = useState<Set<string>>(() => readFavIds());
  const [walkedIds, setWalkedIds] = useState<Set<string>>(() => readWalkedIds());
  useEffect(() => { writeFavIds(favIds); }, [favIds]);
  useEffect(() => { writeWalkedIds(walkedIds); }, [walkedIds]);

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
  const storeEpoch = usePackStoreEpoch();
  useEffect(() => {
    if (!storeEpoch) return;
    setFavIds(readFavIds());
    setWalkedIds(readWalkedIds());
    setVotes(readVotes());
    setPlans(readPlans());
    setEvents(readEvents());
  }, [storeEpoch]);
  const [walkedPopupOpen, setWalkedPopupOpen] = useState(false);
  // Zelené WALKED ✓ nie je toggle — klik otvorí menu (Add to triplist / Remove walked).
  // Dôvod (Matej 2026-07-27): odznačenie zmaže aj hlas o obtiažnosti, nesmie sa stať omylom.
  const [walkedMenuOpen, setWalkedMenuOpen] = useState(false);
  const walkedMenuRef = useRef<HTMLDivElement | null>(null);
  const [wishlistPopupOpen, setWishlistPopupOpen] = useState(false);
  const [partnerAdOpen, setPartnerAdOpen] = useState(false);

  // greeting meno pre partner-ad host (rovnaký vzor ako PackMap firstNameFrom)
  const firstName = useMemo(() => {
    const meta = (id.session?.user?.user_metadata ?? {}) as Record<string, unknown>;
    const full = (meta.full_name || meta.name) as string | undefined;
    if (full && full.trim()) return full.trim().split(' ')[0];
    const local = (id.session?.user?.email ?? '').split('@')[0] || '';
    const base = local.split('+')[0].replace(/[._-]/g, ' ').replace(/\d+/g, '').trim();
    return base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Dogyptian';
  }, [id.session]);

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

  // ★ wishlist → zámer popup (ak nie je uložený); walked → povinný walked popup. Odznačenie
  // = priame odobratie (aj hlas/plán). Rovnaká logika ako PackMap.
  const toggleFav = (tid: string) => {
    if (favIds.has(tid)) {
      setFavIds((prev) => { const n = new Set(prev); n.delete(tid); return n; });
      setPlans((prev) => prev.filter((p) => p.tripId !== tid));
    } else {
      setWishlistPopupOpen(true);
    }
  };
  const toggleWalked = (tid: string) => {
    if (walkedIds.has(tid)) {
      setWalkedIds((prev) => { const n = new Set(prev); n.delete(tid); return n; });
      setVotes((prev) => { const n = { ...prev }; delete n[tid]; return n; });
    } else {
      setWalkedPopupOpen(true);
    }
  };
  const submitWalked = (v: WalkedInput) => {
    if (!trail) return;
    setVotes((prev) => ({ ...prev, [trail.id]: { tripId: trail.id, ...v, at: nowMs } }));
    setWalkedIds((prev) => { const n = new Set(prev); n.add(trail.id); return n; });
    setWalkedPopupOpen(false);
  };
  const addPlan = (intent: 'solo' | 'partner', date = '') => {
    if (!trail) return;
    setPlans((prev) => [{ tripId: trail.id, intent, date, at: nowMs }, ...prev.filter((p) => p.tripId !== trail.id)]);
  };
  const chooseSolo = () => {
    if (!trail) return;
    setFavIds((prev) => { const n = new Set(prev); n.add(trail.id); return n; });
    addPlan('solo');
    // TRIPLIST (Slice A): rename wishlist → triplist, star popup navyše upsertne triplist entry.
    upsertMyTrip(trail.id, { status: 'solo', openness: 'closed', date: '' });
    setWishlistPopupOpen(false);
  };
  const choosePartner = () => {
    if (!trail) return;
    setFavIds((prev) => { const n = new Set(prev); n.add(trail.id); return n; });
    addPlan('partner');
    upsertMyTrip(trail.id, { status: 'looking', openness: 'open', date: '' });
    setWishlistPopupOpen(false);
    setPartnerAdOpen(true);
  };
  const submitPartnerAd = (ad: PartnerAdInput) => {
    if (!trail) return;
    // partner inzerát je VŽDY public → Events (Matej 2026-07-22).
    const ev: PartnerEvent = {
      id: `ad-${nowMs}-${trail.id}`, tripId: trail.id, dates: ad.dates, month: ad.month,
      socialization: ad.socialization, host: `${firstName} & your dog`, hostIsMe: true,
      at: nowMs, joinedByMe: true, seedGoing: 0,
    };
    setEvents((prev) => [ev, ...prev]);
    setPlans((prev) => prev.map((p) => (p.tripId === trail.id ? { ...p, date: ad.dates[0] ?? ad.month } : p)));
    setPartnerAdOpen(false);
    // Inzerát sa na TEJTO stránke nikde nevykresľuje (žije v triplist/OPEN TRIPS), takže bez
    // potvrdenia človek zavrie popup a nemá jediný signál, že je vonku. (audit #45)
    toast({ description: 'Your trip is now open — the pack can join you.' });
  };

  const handleShare = async () => {
    if (!trail) return;
    const url = `${window.location.origin}/pack/map/${trail.id}`;
    const shareData = { title: trail.name, text: `${trail.name} — ${trail.km} km, ${trail.diff}`, url };
    if (typeof navigator.share === 'function') {
      try { await navigator.share(shareData); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ description: 'Link copied' });
    } catch {
      toast({ description: url });
    }
  };

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
        <div style={{ fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Trip not found</div>
        <button
          type="button"
          onClick={() => navigate('/pack/map')}
          style={{ fontFamily: FONT_UI, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD, background: 'none', border: 'none', cursor: 'pointer' }}
        >← Back to trips</button>
      </div>
    );
  }

  const cover = trail.photos[0];
  // crowd agregát (design §A) — konzistentné s kartami v PackMap
  const agg = crowdAggregate(trail, votes[trail.id]);
  // bod 2 (iterácia 14): rovnaká chip-skladačka ako inline detail v PackMap.tsx (acts + tags,
  // emoji prefix keď existuje mapovanie).
  const tripChips = [
    ...(trail.acts ?? []).map((a) => ({ key: `a:${a}`, label: a, emoji: ACT_EMOJI[a] ?? '' })),
    ...(trail.tags ?? []).map((tg) => ({ key: `t:${tg}`, label: tg, emoji: TAG_EMOJI[tg] ?? '' })),
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
              aria-label={favIds.has(trail.id) ? 'In triplist' : 'Add to triplist'}
            >
              <span className="pta-actbtn-icon pta-ic-mask" style={{ '--ic': `url(${ICON('clipboard')})` } as React.CSSProperties} />
              <span className="pta-actbtn-label">{favIds.has(trail.id) ? 'In triplist' : 'Add to triplist'}</span>
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
                aria-label="Walked"
              >
                <span className="pta-actbtn-icon">🐾</span>
                <span className="pta-actbtn-label">Walked ✓</span>
                <span className="pta-caret">▾</span>
              </button>
              {walkedMenuOpen && (
                <div className="pta-actmenu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setWalkedMenuOpen(false); toggleFav(trail.id); }}
                  >
                    {favIds.has(trail.id) ? '✓ In triplist — remove' : '+ Add to triplist'}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="pta-actmenu-off"
                    onClick={() => { setWalkedMenuOpen(false); toggleWalked(trail.id); }}
                  >
                    ✕ Remove walked
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
              <span className="pta-actbtn-label">Mark walked</span>
            </button>
          )}
          <button type="button" className="pta-actbtn pta-actbtn--blue" onClick={handleShare} aria-label="Share">
            <span className="pta-actbtn-icon"><img src={ICON('link')} alt="" style={{ width: 12, height: 12, filter: 'brightness(0) invert(1)' }} /></span>
            <span className="pta-actbtn-label">Share</span>
          </button>
        </div>
  );

  return (
    <div className="pta-root">
      <style>{CSS}</style>
      <style>{COMMUNITY_CSS}</style>
      <style>{GLASS_CSS}</style>
      <style>{PARTY_CARD_CSS}</style>
      {/* §16 (2026-07-23): heroglyf textúra ZA obsahom — bez nej glass panel nemá čo rozmazať
          (predtým holá čierna = „všetko na čiernej"). Rovnaké pozadie ako triplist/pack. */}
      <HieroglyphBg />

      <div className="pta-shell pk-glass">
      <div className="pta-hero" ref={heroRef} style={cover ? { backgroundImage: `url('${cover}')` } : undefined}>
        <div className="pta-hero-grad" />
        {(trail as { photoCredit?: string }).photoCredit && (
          <div className="pta-hero-credit">{(trail as { photoCredit?: string }).photoCredit}</div>
        )}
        <button type="button" className="pta-back" onClick={() => navigate('/pack/map')} aria-label="Back to trips">←</button>
      </div>

        <div className="pta-panel">
        <div className="pta-loc">
          <img className="pta-flag" src={flagUrl(trailCountry(trail))} alt={countryName(trailCountry(trail))} loading="lazy" draggable={false} />
          <span>{trail.region}{REGION_OF[trail.region] ? ` · ${REGION_OF[trail.region]}` : ''}</span>
        </div>
        <div className="pta-title">{trail.name}</div>
        {/* bod 4 (iterácia 13): samostatný DiffMark+diff riadok pod titulom ZMAZANÝ —
            difficulty ostáva len v stat tabuľke nižšie (bolo 2×, teraz 1×). */}
        <div className="pta-author">by {authorOf(trail)}{agg.walkedCount - FOUNDER_WALKERS > 0 ? ` · +${agg.walkedCount - FOUNDER_WALKERS} Dogyptians` : ''}</div>

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
          <div className="pta-stat">
            <b className="pta-route">
              {/* 6 výletov (vodné plochy: Bukovská priehrada, Liptovská Mara, Kráľová, Sĺňava,
                  Orešianska, Palcmanská Maša) má `km: ""` — bez tejto podmienky sa vykreslilo
                  holé „↔  km". Pri paddleboarde a pikniku pri vode vzdialenosť ani nedáva
                  zmysel, preto sa riadok radšej nezobrazí vôbec. (audit #45) */}
              {trail.km?.trim() && <span>↔ {trail.km} km</span>}
              {(trail as { ascentM?: number }).ascentM != null && (<>
                <i />
                <span>↑ {(trail as { ascentM?: number }).ascentM} m</span>
              </>)}
            </b>
          </div>
          <div
            className={agg.belowThreshold ? 'pta-stat' : 'pta-stat comm-hastip'}
            data-tip={agg.belowThreshold ? undefined : voteTip(agg.difficultyBreakdown)}
          >
            <b><DiffMark diff={agg.difficulty} /> {agg.difficulty}</b><span>Difficulty</span>
          </div>
          {agg.crowd && (
            <div
              className={agg.belowThreshold ? 'pta-stat' : 'pta-stat comm-hastip'}
              data-tip={agg.belowThreshold ? undefined : voteTip(agg.crowdBreakdown)}
            >
              <b>{CROWD_EMOJI[agg.crowd]} {agg.crowd}</b><span>Crowd</span>
            </div>
          )}
          <div className="pta-stat"><b className="pta-ratingstack"><RatingPaws stars={agg.rating} size={11} gap={2} />{agg.rating.toFixed(1)}</b><span>Rating</span></div>
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
            <TrailMarks marks={(trail as { marks?: TrailMarkColor[][] }).marks} labelColor={PACK_THEME.onDark} />
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

        {trail.desc && <p className="pta-desc">{trail.desc}</p>}
        {trail.dogNote && <p className="pta-dognote">🐾 {trail.dogNote}</p>}

        {/* §16 (2026-07-23): reviews + advice (rovnaká komponenta ako inline detail v PackMap)
            NAD mapou — nahrádza starú spodnú „Comments" sekciu (zmazaná). walked/onRequestWalk
            napojené na tunajší walked-popup: keď trip nie je walked, CTA otvorí „you did it" popup. */}
        <TripComments
          tripId={trail.id}
          tripName={trail.name}
          walked={walkedIds.has(trail.id)}
          onMarkWalked={() => setWalkedIds((prev) => (prev.has(trail.id) ? prev : new Set(prev).add(trail.id)))}
          onRequestWalk={() => setWalkedPopupOpen(true)}
        />

        <div
          className="pta-mapwrap"
          onMouseEnter={() => setRouteDimmed(true)}
          onMouseLeave={() => setRouteDimmed(false)}
          onTouchStart={() => setRouteDimmed(true)}
          onTouchEnd={() => setRouteDimmed(false)}
        >
          {trail.path.length > 0 ? (
            <MapContainer
              center={trail.path[Math.floor(trail.path.length / 2)]}
              zoom={13} zoomControl={false} attributionControl={false} style={{ width: '100%', height: '100%' }}
            >
              <TileLayer url={mapyTiles('outdoor')} />
              <InvalidateSizeOnMount />
              {/* bod 1 (iterácia 17): article route mapa = trasa je vždy "tá" → plný AllTrails-
                  style čierno-zlatý casing (rovnaké dve vrstvy ako zvýraznená trasa v PackMap).
                  Hover/dotyk (routeDimmed) stiahne opacity oboch vrstiev na 50%, nech je vidno
                  podklad — obe vrstvy naraz, inak by čierny casing ostal nepriehľadný sám. */}
              {/* Trasu kreslíme len keď to trasa naozaj JE. 6 výletov k vodným plochám má
                  v `path` jediný bod — dve polyline z jedného bodu vykreslili neviditeľnú
                  čiaru a mapa tvárila, že trasa existuje. Pri jednom bode ostáva mapa
                  s markerom: pri paddleboarde je odpoveď „kde to je", nie „kadiaľ ísť".
                  (audit #45) */}
              {trail.path.length > 1 && (<>
                <Polyline positions={trail.path} pathOptions={{ color: '#0A0A0A', weight: 8, opacity: routeDimmed ? 0.5 : 1, lineCap: 'round', lineJoin: 'round' }} />
                <Polyline positions={trail.path} pathOptions={{ color: '#F5C73D', weight: 4, opacity: routeDimmed ? 0.5 : 1, lineCap: 'round', lineJoin: 'round' }} />
              </>)}
              <Marker position={trail.path[0]} icon={placeIcon('walk', true)} />
              {/* POI z OSM (issue #40) — pramene/výhľady/prístrešky pozdĺž TEJTO trasy.
                  Atribúcia je podmienka licencie ODbL, preto ide s vrstvou vždy v páre. */}
              <PoiLayer />
            </MapContainer>
          ) : (
            <div className="pta-mapempty">Route map coming soon</div>
          )}
          {trail.path.length > 0 && <PoiAttribution />}
        </div>

        {/* #41 — KTO TENTO VÝLET VYPÍSAL. Nie autor trasy (`authorOf` je textové pole
            datasetu), ale reálny člen, ktorý má trasu ako otvorený výlet v DB.
            Nad profilom prevýšenia, lebo „s kým" je pri otvorenom výlete dôležitejšie
            než „koľko metrov". */}
        {hosts.length > 0 && (
          <div className="pta-section">
            <h3>Open trip from the pack</h3>
            {hosts.map((h) => (
              <div key={h.key} className="pta-host">
                <PartyMemberCard
                  member={h.organizer}
                  roleLabel={h.date ? `Trip host · ${h.date}` : 'Trip host'}
                  dm={{ tripSlug: h.slug, organizerId: h.organizerId, isMe: h.organizerId === id.session?.user?.id }}
                />
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
            <h3>Elevation profile</h3>
            <ElevationProfile elev={(trail as { elev?: number[] }).elev} km={parseFloat(trail.km) || 0} />
          </div>
        )}

        <div className="pta-section">
          <h3>Walked by {agg.walkedCount} Dogyptian{agg.walkedCount === 1 ? '' : 's'}</h3>
          {agg.walkedCount === 0 && <div className="pta-empty">Be the first to walk this.</div>}
        </div>
        </div>
      </div>

      {/* bod 3 (iterácia 14): lightbox — fullscreen popup, tmavé pozadie, ✕ + prev/next */}
      {lightboxIdx !== null && (
        <div className="pta-lightbox" onClick={() => setLightboxIdx(null)}>
          <button type="button" className="pta-lightbox-close" onClick={() => setLightboxIdx(null)} aria-label="Close">×</button>
          {trail.photos.length > 1 && (
            <button
              type="button"
              className="pta-lightbox-nav pta-lightbox-prev"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => ((i ?? 0) - 1 + trail.photos.length) % trail.photos.length); }}
              aria-label="Previous photo"
            >‹</button>
          )}
          <img src={trail.photos[lightboxIdx]} alt="" onClick={(e) => e.stopPropagation()} />
          {trail.photos.length > 1 && (
            <button
              type="button"
              className="pta-lightbox-nav pta-lightbox-next"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => ((i ?? 0) + 1) % trail.photos.length); }}
              aria-label="Next photo"
            >›</button>
          )}
        </div>
      )}

      {/* Mobilný rail — ten istý actsRow, len portálom mimo .pk-glass (viď komentár pri actsRow). */}
      {railed && createPortal(actsRow, document.body)}

      {/* ── KOMUNITNÉ modaly (rovnaké ako PackMap) ── */}
      {walkedPopupOpen && (
        <WalkedPopup
          trailName={trail.name}
          initial={votes[trail.id] ? { rating: votes[trail.id].rating, difficulty: votes[trail.id].difficulty, crowd: votes[trail.id].crowd, comment: votes[trail.id].comment, when: votes[trail.id].when, hazards: votes[trail.id].hazards } : null}
          onSubmit={submitWalked}
          onClose={() => setWalkedPopupOpen(false)}
        />
      )}
      {wishlistPopupOpen && (
        <WishlistIntentPopup
          trailName={trail.name}
          onSolo={chooseSolo}
          onPartner={choosePartner}
          onClose={() => setWishlistPopupOpen(false)}
        />
      )}
      {partnerAdOpen && (
        <PartnerAdForm
          trailName={trail.name}
          onSubmit={submitPartnerAd}
          onClose={() => setPartnerAdOpen(false)}
        />
      )}

      <PackBottomNav />
    </div>
  );
}
