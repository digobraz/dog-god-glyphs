// /pack/map/triplist — DVOJPOVRCH: TRIPLIST + TRIPSTATS na jednej route (Matej 2026-07-23,
// konsolidácia headera 4→2). ?tab=stats fokusuje TRIPSTATS, inak TRIPLIST; dve karty vedľa seba
// prepínajú view. Vstup z PackMap headera: ✓/km pilulka → ?tab=stats, 🐾 pilulka → list.
//   TRIPLIST = MY TRIPS (seeded z plans; placeholdery keď prázdne) + OPEN TRIPS (mock). Wishlist
//     splynul sem (★ = „mám to v zozname"), samostatná wishlist sekcia zrušená.
//   TRIPSTATS = <TripStatsPanel> z packCommunityUI (svet + home 🇸🇰 + prejdené) — bývalý „Trippin'"
//     dashboard modal, ktorý je TÝMTO zrušený (MySlovakiaDashboard už nemá vstup).
// Slice B (accept/decline, open/close toggle, leave/handoff, request→DM), D (post-trip loop) NIE sú
// tu — joiners/requests stay [] (see triplist.ts).
//
// DESIGN (2026-07-23, LOCKED): obsah v LIQUID GLASS paneli (.pk-glass z packTheme GLASS_CSS) nad
// heroglyf pozadím — NEmixovať s plnou čiernou. Rovnaký primitív ide neskôr aj na článok + walked.
// Bloky = štvorcové karty v 3-stĺpcovom gride (MY TRIPS + OPEN TRIPS zdieľajú .tl-grid/.tl-block).
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HERO_TRAILS, type HeroTrail } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { PackBottomNav, HieroglyphBg } from '@/components/pack/PackLayout';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, GLASS_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { readLocalTrails, readWalkedIds, ensureWalkedSeeded, FOUNDER_WALKED_JOURNEY_IDS, ICON, GOLD_ICON_FILTER } from '@/components/pack/tripShared';
import { readPlans, MOCK_MEMBER_POOL } from '@/components/pack/packCommunity';
import { COMMUNITY_CSS, TripStatsPanel } from '@/components/pack/packCommunityUI';
import { flagUrl } from '@/lib/countryGeo';
import { TripAnnouncePopup } from '@/components/pack/triplist/TripAnnouncePopup';
import {
  readTriplist, upsertMyTrip, seedTriplistFromPlans, buildPublicTrips,
  trailWCE, WCE_LABEL, type WCE,
  type TriplistTrip, type TripStatus, type PublicTrip,
} from '@/components/pack/triplist/triplist';

const GOLD = '#C99A3F';
const INK = '#1F1A0E';
const T = PACK_THEME;
const DAY_MS = 86400000;
const isoDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);

const CSS = `
.tl-root{min-height:100dvh;background:${T.pageBg};color:${T.onDark};font-family:${FONT_UI};position:relative;padding-bottom:110px;}
.tl-body{max-width:860px;margin:0 auto;padding:calc(env(safe-area-inset-top,0px) + 26px) 20px 0;position:relative;z-index:2;}
/* back = holá šípka v STREDE, NAD blokmi (flow, nie absolute — neprekrýva karty) */
.tl-backrow{display:flex;justify-content:center;margin-bottom:16px;}
.tl-back{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:rgba(0,0,0,0.42);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:19px;line-height:1;cursor:pointer;transition:border-color .15s,color .15s;}
.tl-back:hover{border-color:${GOLD};color:${GOLD};}
.tl-title{font-family:${FONT_TITLE};font-weight:700;font-size:26px;letter-spacing:.03em;color:${GOLD};text-align:center;}
.tl-sub{font-size:12.5px;color:${T.onDarkDim};text-align:center;margin-top:6px;}

/* dvojkartový prepínač TRIPLIST | TRIPSTATS — aktívna karta = zlatý rámik, druhá „vedľa" = klik na prepnutie */
.tl-tabs{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px;}
.tl-tab{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:14px 17px;border-radius:16px;border:1px solid ${T.onDarkBorder};background:${T.glass};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);cursor:pointer;text-align:left;transition:border-color .15s,transform .15s,background .15s;}
.tl-tab:hover{border-color:rgba(201,154,63,0.5);transform:translateY(-1px);}
.tl-tab-label{font-family:${FONT_TITLE};font-weight:700;font-size:13px;letter-spacing:.05em;text-transform:uppercase;color:${T.onDark};display:flex;align-items:center;gap:8px;}
.tl-tab-ic{width:26px;height:26px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:rgba(245,240,228,0.06);border:1px solid ${T.onDarkBorder};flex-shrink:0;}
.tl-tab-ic img{width:15px;height:15px;filter:brightness(0) invert(1);opacity:.8;}
.tl-tab-sub{font-size:10.5px;color:${T.onDarkDim};padding-left:34px;}
.tl-tab.on{background:linear-gradient(135deg,rgba(245,199,61,0.16),rgba(230,158,26,0.10));border-color:${GOLD};}
.tl-tab.on .tl-tab-label{color:${GOLD};}
.tl-tab.on .tl-tab-ic{background:rgba(201,154,63,0.16);border-color:rgba(201,154,63,0.5);}
.tl-tab.on .tl-tab-ic img{filter:${GOLD_ICON_FILTER};opacity:1;}

/* LIQUID GLASS obsahový panel (.pk-glass z GLASS_CSS) */
.tl-panel{margin-top:14px;padding:22px 20px 24px;}
.tl-section + .tl-section{margin-top:22px;}
.tl-divider{height:1px;background:${T.onDarkHair};margin:22px 0;}
.tl-sechead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;}
.tl-sechead h3{font-family:${FONT_UI};font-weight:500;font-size:12.5px;letter-spacing:.2em;text-transform:uppercase;color:${GOLD};margin:0;}
.tl-seeall{font-family:${FONT_UI};font-weight:600;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:${T.onDarkDim};background:rgba(245,240,228,0.06);border:1px solid ${T.onDarkBorder};border-radius:999px;padding:5px 12px;cursor:pointer;white-space:nowrap;}
.tl-seeall:hover{color:${GOLD};border-color:${GOLD};}
.tl-empty{font-size:12.5px;color:${T.onDarkDim};font-style:italic;padding:6px 0 2px;}

/* zdieľaný štvorcový GRID — OPEN TRIPS (MY TRIPS = horizontálny scroll .tl-hscroll) */
.tl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
@media(max-width:560px){.tl-grid{grid-template-columns:repeat(2,1fr);}}
/* MY TRIPS — horizontálny slajd */
.tl-hscroll{display:flex;gap:12px;overflow-x:auto;padding:15px 2px 10px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:thin;}
.tl-hscroll::-webkit-scrollbar{height:6px;}
.tl-hscroll::-webkit-scrollbar-thumb{background:rgba(201,154,63,0.35);border-radius:999px;}
/* wrapper nesie flex + necháva countdown vytŕčať nad kartu (pk-glass-block má overflow:hidden) */
.tl-mycard{position:relative;flex:0 0 170px;scroll-snap-align:start;}
.tl-mycard .tl-block{width:100%;}
@media(max-width:560px){.tl-mycard{flex:0 0 150px;}}
.tl-block{cursor:pointer;transition:border-color .15s,transform .15s;}
.tl-block:hover{border-color:rgba(201,154,63,0.5);transform:translateY(-2px);}
.tl-block-cover{position:relative;aspect-ratio:4/3;background-size:cover;background-position:center;background-color:#111;}
/* vlajka do kruhu — ľavý horný roh, vzor z /wall .card-flag */
.tl-flag{position:absolute;top:8px;left:8px;width:24px;height:24px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.45);background:#1a1a1a;z-index:2;}
/* výrazný odpočet dní — VYTŔČA nad horný okraj karty (dôležitý údaj), na wrapperi .tl-mycard */
.tl-countdown{position:absolute;top:-11px;right:8px;z-index:6;font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:5px 11px;border-radius:999px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:#1a1305;box-shadow:0 4px 14px rgba(230,158,26,0.6),0 0 0 3px ${T.pageBg};white-space:nowrap;pointer-events:none;}
.tl-countdown.soon{background:linear-gradient(135deg,#FF7A45,#E5502A);color:#fff;box-shadow:0 4px 16px rgba(229,80,42,0.65),0 0 0 3px ${T.pageBg};}
.tl-block-badge{position:absolute;right:8px;bottom:8px;font-family:${FONT_UI};font-weight:600;font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;padding:4px 9px;border-radius:999px;background:rgba(201,154,63,0.92);color:#1a1305;box-shadow:0 2px 8px rgba(0,0,0,0.45);max-width:calc(100% - 16px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
/* status farby (Matej 2026-07-23): done=zelená · solo=biela · s niekým=modrá · hľadanie=tyrkys */
.tl-block-badge.done{background:#37B26A;color:#062611;}
.tl-block-badge.solo{background:rgba(245,240,228,0.94);color:#1a1305;}
.tl-block-badge.with{background:#3B82F6;color:#03102b;}
.tl-block-badge.looking{background:#2ED3C3;color:#032420;}
.tl-block-info{padding:9px 11px 11px;}
.tl-block-name{font-family:${FONT_TITLE};font-weight:700;font-size:12px;line-height:1.25;color:${T.onDark};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:30px;}
.tl-block-sub{font-size:9.5px;color:${T.onDarkDim};margin-top:3px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.tl-block-owner{display:flex;align-items:center;gap:6px;font-size:10px;color:${T.onDarkDim};margin-top:7px;min-width:0;}
.tl-block-owner span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.tl-block-avatar{flex-shrink:0;width:17px;height:17px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:8.5px;color:${INK};}
/* krátka správa usporiadateľa — 2 riadky, celá v natívnom tooltipe (overflow:hidden na karte by orezal custom bublinu) */
.tl-msg{font-size:9.5px;color:${T.onDarkDim};line-height:1.4;margin-top:7px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;cursor:help;}
.tl-block-foot{margin-top:8px;}
.tl-datebtn{font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:4px 9px;border-radius:999px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.05);color:${T.onDarkDim};cursor:pointer;}
.tl-datebtn:hover{border-color:${GOLD};color:${GOLD};}
/* dátum v rámiku (open trips) */
.tl-datepill{display:inline-flex;align-items:center;gap:5px;font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.04em;padding:4px 9px;border-radius:8px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.05);color:${T.onDark};}
.tl-date{font-size:10px;color:${T.onDarkDim};}
/* OPEN TRIPS filter bar */
.tl-filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:14px;}
.tl-filter{font-family:${FONT_UI};font-weight:600;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;padding:6px 12px;border-radius:999px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.05);color:${T.onDarkDim};cursor:pointer;transition:all .15s;}
.tl-filter:hover{border-color:${GOLD};color:${GOLD};}
.tl-filter.on{background:${GOLD};border-color:${GOLD};color:${INK};}
.tl-filter-sel{font-family:${FONT_UI};font-weight:600;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;padding:6px 10px;border-radius:999px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.05);color:${T.onDark};cursor:pointer;color-scheme:dark;outline:0;}
.tl-filter-sep{width:1px;height:20px;background:${T.onDarkHair};margin:0 2px;}
/* OPEN TRIPS pager */
.tl-pager{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:18px;}
.tl-pagebtn{font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.12em;text-transform:uppercase;padding:8px 15px;border-radius:999px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.05);color:${T.onDark};cursor:pointer;transition:all .15s;}
.tl-pagebtn:hover:not(:disabled){border-color:${GOLD};color:${GOLD};}
.tl-pagebtn:disabled{opacity:.35;cursor:default;}
.tl-pageinfo{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.06em;color:${T.onDarkDim};}

/* Add date popup — dark glass, vokabulár .tcm-overlay/.tcm-modal (TripComments.tsx) */
.tl-overlay{position:fixed;inset:0;z-index:1200;background:rgba(3,2,1,0.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;}
.tl-modal{width:100%;max-width:360px;background:${T.glass};backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid ${T.onDarkBorder};border-radius:20px;box-shadow:0 30px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(245,240,228,0.06);padding:24px;}
.tl-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px;}
.tl-modal-title{font-family:${FONT_TITLE};font-weight:700;font-size:16px;color:${GOLD};}
.tl-x{flex-shrink:0;width:30px;height:30px;border-radius:50%;background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.tl-x:hover{border-color:${GOLD};color:${GOLD};}
.tl-dateinput{width:100%;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:10px;padding:11px 12px;color:${T.onDark};font-family:inherit;font-size:14px;outline:0;color-scheme:dark;}
.tl-dateinput:focus{border-color:${GOLD};}
.tl-modal-submit{width:100%;margin-top:16px;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:10px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);color:#000;border:1px solid rgba(250,244,236,0.30);cursor:pointer;}
.tl-modal-submit:disabled{opacity:.4;cursor:default;}
`;

// status pilulka — 'going' vetva reálne nastane až Slice B (joiners naplní on), okrem placeholderov.
// done = walked (prejdené) má prednosť pred statusom. Farebné triedy: done/with/looking/solo.
function statusLabel(entry: TriplistTrip, done?: boolean): string {
  if (done) return 'Done';
  if (entry.status === 'going') {
    if (entry.joiners.length === 1) {
      const name = MOCK_MEMBER_POOL.find((m) => m.id === entry.joiners[0].memberId)?.name ?? 'a Dogyptian';
      return `With ${name}`;
    }
    if (entry.joiners.length > 1) return `With ${entry.joiners.length}`;
    return 'Going';
  }
  if (entry.status === 'looking') return 'Looking for pack';
  return 'Solo';
}
function statusClass(entry: TriplistTrip, done?: boolean): string {
  if (done) return 'done';
  if (entry.status === 'going') return 'with';
  if (entry.status === 'looking') return 'looking';
  return 'solo';
}

// dni od dnes (kladné = budúcnosť). null = bez dátumu.
function daysFromNow(dateStr: string | undefined, nowMs: number): number | null {
  if (!dateStr) return null;
  const ms = new Date(dateStr + 'T00:00:00').getTime();
  if (Number.isNaN(ms)) return null;
  return Math.round((ms - nowMs) / DAY_MS);
}
function countdownLabel(days: number): string {
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days left`;
}
// Poradie MY TRIPS (Matej 2026-07-23): blížiace sa PRVÉ (najbližší dátum), potom bez dátumu, DONE POSLEDNÉ.
function sortMyTrips(rows: MyTripRow[], nowMs: number): MyTripRow[] {
  const rank = (r: MyTripRow) => {
    if (r.done) return 2;
    const d = daysFromNow(r.entry.date, nowMs);
    return d !== null && d >= 0 ? 0 : 1;
  };
  return [...rows].sort((a, b) => {
    const ra = rank(a), rb = rank(b);
    if (ra !== rb) return ra - rb;
    const da = daysFromNow(a.entry.date, nowMs), db = daysFromNow(b.entry.date, nowMs);
    if (ra === 0) return (da ?? 9e9) - (db ?? 9e9);       // upcoming: najbližší prvý
    if (ra === 2) return (db ?? -9e9) - (da ?? -9e9);      // done: najnovší minulý prvý
    return b.entry.addedAt - a.entry.addedAt;
  });
}

type MyTripRow = { entry: TriplistTrip; trail: HeroTrail; placeholder?: boolean; done?: boolean };

export default function PackTriplist() {
  const t = useT();
  const navigate = useNavigate();
  const id = usePackIdentity();

  const allTrails = useMemo(() => [...readLocalTrails(), ...HERO_JOURNEYS, ...HERO_TRAILS], []);
  // Founder walked seed (Matej 2026-07-24): nahodené = prejdené + z červených len SNP/Poloniny.
  // Seedne raz za session aj keď sa na vysvedčenie príde priamo (mimo PackMap mapy).
  useMemo(() => ensureWalkedSeeded([
    ...HERO_TRAILS.map((t) => t.id),
    ...FOUNDER_WALKED_JOURNEY_IDS.filter((id) => [...HERO_JOURNEYS, ...HERO_TRAILS].some((t) => t.id === id)),
  ]), []);
  const nowMs = useMemo(() => Date.now(), []);

  // dva povrchy na jednej route — ?tab=stats otvorí TRIPSTATS, inak TRIPLIST (Matej 2026-07-23,
  // konsolidácia headera 4→2 pilulky). Header ✓/km pilulka linkuje sem s ?tab=stats.
  const [searchParams, setSearchParams] = useSearchParams();
  const view: 'list' | 'stats' = searchParams.get('tab') === 'stats' ? 'stats' : 'list';
  const setView = (v: 'list' | 'stats') => setSearchParams(v === 'stats' ? { tab: 'stats' } : {}, { replace: true });

  // TRIPSTATS dáta — prejdené (walked) tripy + km, rovnaký zdroj ako bývalý „Trippin'" dashboard.
  const walkedTrails = useMemo(() => {
    const walked = readWalkedIds();
    return allTrails.filter((tr) => walked.has(tr.id));
  }, [allTrails]);
  // tr.km je STRING (HeroTrail.km: string) → coerce na number, inak reduce reťazí stringy a walkedKm.toFixed spadne
  const walkedKm = useMemo(() => walkedTrails.reduce((s, tr) => s + (Number(tr.km) || 0), 0), [walkedTrails]);

  // migrácia existujúcich wishlist plánov → triplist entries, idempotentné (viď triplist.ts).
  useEffect(() => { seedTriplistFromPlans(readPlans()); }, []);

  const [triplist, setTriplist] = useState<Record<string, TriplistTrip>>(() => readTriplist());
  const [dateTripId, setDateTripId] = useState<string | null>(null);
  const [dateValue, setDateValue] = useState('');
  const [publicWCE, setPublicWCE] = useState<WCE | 'all'>('all'); // OPEN TRIPS filter (region)
  const [publicPage, setPublicPage] = useState(0);                // OPEN TRIPS stránkovanie (9/stránku)
  const PUBLIC_PER_PAGE = 9;
  // OPEN TRIP oznamový popup (flow A) — klik na kartu otvorí oznam, join = mock session stav.
  const [announceTrip, setAnnounceTrip] = useState<PublicTrip | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(() => new Set());

  const walkedSet = useMemo(() => readWalkedIds(), [allTrails]);

  const realMyTrips = useMemo<MyTripRow[]>(() => {
    return Object.values(triplist)
      .map((entry) => ({ entry, trail: allTrails.find((tr) => tr.id === entry.tripId) }))
      .filter((x): x is MyTripRow => !!x.trail)
      .map((x) => ({ ...x, done: walkedSet.has(x.entry.tripId) }))
      .sort((a, b) => b.entry.addedAt - a.entry.addedAt);
  }, [triplist, allTrails, walkedSet]);

  // PLACEHOLDER MY TRIPS (design simulácia — keď užívateľ ešte nič nemá). Deterministické, aby sa
  // sekcia dala vidieť „naživo" (aj DONE badge). Klik navigujе na reálny článok. Zmizne akonáhle pribudne 1 reálny.
  const placeholderMyTrips = useMemo<MyTripRow[]>(() => {
    const withPhotos = allTrails.filter((tr) => tr.photos[0]);
    if (withPhotos.length === 0) return [];
    // days = offset od dnes (záporné = minulosť pre DONE). Poradie sa aj tak prepočíta sortMyTrips.
    const specs: { status: TripStatus; days: number | null; done?: boolean }[] = [
      { status: 'going', days: 2 },        // blíži sa
      { status: 'looking', days: 6 },
      { status: 'solo', days: 13 },
      { status: 'looking', days: 24 },
      { status: 'solo', days: null },      // bez dátumu
      { status: 'going', days: -9, done: true },   // hotové (minulosť)
      { status: 'solo', days: -28, done: true },
    ];
    return specs.map((s, i) => {
      const trail = withPhotos[(i * 7 + 3) % withPhotos.length];
      const joiner = MOCK_MEMBER_POOL[(i * 5 + 2) % MOCK_MEMBER_POOL.length];
      const entry: TriplistTrip = {
        tripId: trail.id,
        date: s.days !== null ? isoDate(nowMs + s.days * DAY_MS) : undefined,
        status: s.status,
        openness: s.status === 'solo' ? 'closed' : 'open',
        joiners: s.status === 'going' ? [{ memberId: joiner.id, acceptedAt: nowMs }] : [],
        requests: [],
        addedAt: nowMs - i * 1000,
      };
      return { entry, trail, placeholder: true, done: s.done };
    });
  }, [allTrails, nowMs]);

  const myTrips = useMemo(
    () => sortMyTrips(realMyTrips.length > 0 ? realMyTrips : placeholderMyTrips, nowMs),
    [realMyTrips, placeholderMyTrips, nowMs],
  );
  // najbližší nadchádzajúci trip → sub v TRIPLIST tab-e (Matej: „v headri môže byť info next trip za xy dní")
  const nextUpDays = useMemo(() => {
    const up = myTrips.find((r) => !r.done && (daysFromNow(r.entry.date, nowMs) ?? -1) >= 0);
    return up ? daysFromNow(up.entry.date, nowMs) : null;
  }, [myTrips, nowMs]);

  // depends on `triplist` — trip pridaný do vlastného zoznamu vypadne z PUBLIC (buildPublicTrips
  // excludes tripIds v readTriplist()).
  const publicTripsAll: PublicTrip[] = useMemo(() => buildPublicTrips(allTrails, nowMs), [allTrails, nowMs, triplist]);
  const publicTrips = useMemo(
    () => (publicWCE === 'all' ? publicTripsAll : publicTripsAll.filter((pt) => trailWCE(pt.trail) === publicWCE)),
    [publicTripsAll, publicWCE],
  );
  const publicPageCount = Math.max(1, Math.ceil(publicTrips.length / PUBLIC_PER_PAGE));
  const publicShown = publicTrips.slice(publicPage * PUBLIC_PER_PAGE, publicPage * PUBLIC_PER_PAGE + PUBLIC_PER_PAGE);
  const setRegion = (k: WCE | 'all') => { setPublicWCE(k); setPublicPage(0); };

  const openAddDate = (tripId: string, current?: string) => {
    setDateValue(current ?? '');
    setDateTripId(tripId);
  };
  const saveDate = () => {
    if (!dateTripId) return;
    const next = upsertMyTrip(dateTripId, { date: dateValue || undefined });
    setTriplist((prev) => ({ ...prev, [dateTripId]: next }));
    setDateTripId(null);
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

  return (
    <div className="tl-root">
      <style>{GLASS_CSS}</style>
      <style>{COMMUNITY_CSS}</style>
      <style>{CSS}</style>
      <HieroglyphBg />

      <div className="tl-body">
        <div className="tl-backrow">
          <button type="button" className="tl-back" onClick={() => navigate('/pack/map')} aria-label="Back to map">←</button>
        </div>

        {/* dve karty-prepínače (Matej 2026-07-23): naše ikony (paw/trophy), žiadne emoji, žiadne nadpisy nad.
            Matej 2026-07-26: poradie otočené — Tripstats vľavo, Triplist vpravo. */}
        <div className="tl-tabs">
          <button type="button" className={`tl-tab${view === 'stats' ? ' on' : ''}`} onClick={() => setView('stats')}>
            <span className="tl-tab-label"><span className="tl-tab-ic"><img src={ICON('trophy')} alt="" /></span> Tripstats</span>
            <span className="tl-tab-sub">{walkedTrails.length} walked · {walkedKm % 1 === 0 ? walkedKm : walkedKm.toFixed(1)} km</span>
          </button>
          <button type="button" className={`tl-tab${view === 'list' ? ' on' : ''}`} onClick={() => setView('list')}>
            <span className="tl-tab-label"><span className="tl-tab-ic"><img src={ICON('clipboard')} alt="" /></span> Triplist</span>
            <span className="tl-tab-sub">{nextUpDays !== null ? `Next trip · ${countdownLabel(nextUpDays)}` : 'Plans & open trips'}</span>
          </button>
        </div>

        {view === 'stats' ? (
          <TripStatsPanel
            walkedTrails={walkedTrails}
            walkedKm={walkedKm}
            onOpenTrip={(tid) => navigate(`/pack/map/${tid}`)}
            onAddTrip={(region) => navigate('/pack/map' + (region ? `?add=${encodeURIComponent(region)}` : ''))}
          />
        ) : (
        <div className="pk-glass tl-panel">
          {/* MY TRIPS — horizontálny slajd, status badge (farebný: done/with/looking/solo), vlajka */}
          <div className="tl-section">
            <div className="tl-sechead">
              <h3>My trips</h3>
            </div>
            {myTrips.length === 0 ? (
              <div className="tl-empty">No trips in your list yet. Add a trail to start planning.</div>
            ) : (
              <div className="tl-hscroll">
                {myTrips.map(({ entry, trail, done }) => {
                  const dleft = done ? null : daysFromNow(entry.date, nowMs);
                  return (
                  <div key={entry.tripId} className="tl-mycard">
                    {dleft !== null && dleft >= 0 && (
                      <span className={`tl-countdown${dleft <= 3 ? ' soon' : ''}`}>{countdownLabel(dleft)}</span>
                    )}
                  <div className="pk-glass-block tl-block" onClick={() => navigate(`/pack/map/${trail.id}`)}>
                    <div className="tl-block-cover" style={trail.photos[0] ? { backgroundImage: `url('${trail.photos[0]}')` } : undefined}>
                      <img className="tl-flag" src={flagUrl('sk')} alt="Slovakia" title="Slovakia" loading="lazy" draggable={false} />
                      <span className={`tl-block-badge ${statusClass(entry, done)}`}>{statusLabel(entry, done)}</span>
                    </div>
                    <div className="tl-block-info">
                      <div className="tl-block-name">{trail.name}</div>
                      <div className="tl-block-foot">
                        {entry.date ? (
                          <button type="button" className="tl-datebtn" onClick={(e) => { e.stopPropagation(); openAddDate(entry.tripId, entry.date); }}>
                            {entry.date}
                          </button>
                        ) : (
                          <button type="button" className="tl-datebtn" onClick={(e) => { e.stopPropagation(); openAddDate(entry.tripId); }}>
                            + Add date
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="tl-divider" />

          {/* OPEN TRIPS — filter (region WCE + krajina), grid, pohorie+lokalita, meno+pes, dátum v rámiku, správa */}
          <div className="tl-section">
            <div className="tl-sechead">
              <h3>Open trips from the pack</h3>
            </div>
            <div className="tl-filters">
              {(['all', 'W', 'C', 'E'] as const).map((k) => (
                <button key={k} type="button" className={`tl-filter${publicWCE === k ? ' on' : ''}`} onClick={() => setRegion(k)}>
                  {k === 'all' ? 'All regions' : WCE_LABEL[k]}
                </button>
              ))}
              <span className="tl-filter-sep" />
              <select className="tl-filter-sel" defaultValue="SK">
                <option value="SK">🇸🇰 Slovakia</option>
                <option value="CZ" disabled>Czechia — soon</option>
                <option value="PL" disabled>Poland — soon</option>
                <option value="AT" disabled>Austria — soon</option>
              </select>
            </div>
            {publicTrips.length === 0 ? (
              <div className="tl-empty">No open trips in this region right now.</div>
            ) : (
              <>
              <div className="tl-grid">
                {publicShown.map((pt) => (
                  <div key={pt.trail.id} className="pk-glass-block tl-block" onClick={() => setAnnounceTrip(pt)}>
                    <div className="tl-block-cover" style={pt.trail.photos[0] ? { backgroundImage: `url('${pt.trail.photos[0]}')` } : undefined}>
                      <img className="tl-flag" src={flagUrl('sk')} alt="Slovakia" title="Slovakia" loading="lazy" draggable={false} />
                      <span className="tl-block-badge looking">Looking for pack{pt.joinersCount > 0 ? ` · +${pt.joinersCount}` : ''}</span>
                    </div>
                    <div className="tl-block-info">
                      <div className="tl-block-name">{pt.trail.name}</div>
                      <div className="tl-block-sub">{pt.trail.region} · {WCE_LABEL[trailWCE(pt.trail)]}</div>
                      <div className="tl-block-owner">
                        <span className="tl-block-avatar">{pt.owner.name.charAt(0).toUpperCase()}</span>
                        <span>{pt.owner.name} & {pt.owner.dog}</span>
                      </div>
                      <div className="tl-msg" title={pt.message}>{pt.message}</div>
                      <div className="tl-block-foot"><span className="tl-datepill">{pt.date}</span></div>
                    </div>
                  </div>
                ))}
              </div>
              {publicPageCount > 1 && (
                <div className="tl-pager">
                  <button type="button" className="tl-pagebtn" disabled={publicPage === 0} onClick={() => setPublicPage((p) => Math.max(0, p - 1))}>← Prev</button>
                  <span className="tl-pageinfo">Page {publicPage + 1} / {publicPageCount}</span>
                  <button type="button" className="tl-pagebtn" disabled={publicPage >= publicPageCount - 1} onClick={() => setPublicPage((p) => Math.min(publicPageCount - 1, p + 1))}>Next →</button>
                </div>
              )}
              </>
            )}
          </div>
        </div>
        )}
      </div>

      {dateTripId && (
        <div className="tl-overlay" onClick={() => setDateTripId(null)}>
          <div className="tl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tl-modal-head">
              <div className="tl-modal-title">Set a date</div>
              <button type="button" className="tl-x" onClick={() => setDateTripId(null)} aria-label="Close">×</button>
            </div>
            <input type="date" className="tl-dateinput" value={dateValue} onChange={(e) => setDateValue(e.target.value)} />
            <button type="button" className="tl-modal-submit" onClick={saveDate}>Save date</button>
          </div>
        </div>
      )}

      {announceTrip && (
        <TripAnnouncePopup
          trip={announceTrip}
          nowMs={nowMs}
          joined={joinedIds.has(announceTrip.trail.id)}
          onRequestJoin={() => setJoinedIds((prev) => new Set(prev).add(announceTrip.trail.id))}
          onViewTrail={() => { const id = announceTrip.trail.id; setAnnounceTrip(null); navigate(`/pack/map/${id}`); }}
          onClose={() => setAnnounceTrip(null)}
        />
      )}

      <PackBottomNav />
    </div>
  );
}
