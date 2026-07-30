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
import { usePackStoreEpoch } from '@/hooks/usePackStoreEpoch';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, GLASS_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { readLocalTrails, readWalkedIds, ensureWalkedSeeded, FOUNDER_WALKED_JOURNEY_IDS, ICON, GOLD_ICON_FILTER } from '@/components/pack/tripShared';
import { readPlans, MOCK_MEMBER_POOL } from '@/components/pack/packCommunity';
import { COMMUNITY_CSS, TripStatsPanel } from '@/components/pack/packCommunityUI';
import { flagUrl } from '@/lib/countryGeo';
import { TripAnnouncePopup } from '@/components/pack/triplist/TripAnnouncePopup';
import { useMyTripParties, useTripParties, partyKey, type TripParty, type PartyMember } from '@/components/pack/triplist/useTripParty';
import { useOpenTrips } from '@/components/pack/triplist/useOpenTrips';
import {
  requestToJoin, decideRequest, useMyRequests, useIncomingRequests, pairPending, requestKey,
  type TripRequestStatus,
} from '@/components/pack/triplist/tripRequests';
import { PartyMemberCard, PARTY_CARD_CSS } from '@/components/pack/triplist/PartyMemberCard';
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

/* VIDITEĽNOSŤ VÝLETU (#42) — badge na MY TRIPS karte je prepínač, nie nálepka */
.tl-block-badge.tap{cursor:pointer;border:0;font-family:inherit;}
.tl-block-badge.tap:hover{filter:brightness(1.08);}
.tl-vis{display:flex;flex-direction:column;gap:10px;}
.tl-vischoice{display:flex;align-items:flex-start;gap:11px;text-align:left;padding:13px 14px;border-radius:12px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.04);cursor:pointer;transition:all .15s;}
.tl-vischoice:hover{border-color:${GOLD};background:rgba(201,154,63,0.08);}
.tl-vischoice.on{border-color:${GOLD};background:rgba(201,154,63,0.12);}
.tl-vischoice-ic{flex-shrink:0;width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:rgba(245,240,228,0.06);border:1px solid ${T.onDarkBorder};font-size:14px;}
.tl-vischoice-t{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:12.5px;letter-spacing:.04em;color:${T.onDark};}
.tl-vischoice-d{display:block;font-size:10.5px;line-height:1.45;color:${T.onDarkDim};margin-top:4px;}

/* Po prijatí žiadosti — ponuka stiahnuť inzerát (#42, „na rande nechceš tretiu osobu") */
.tl-closebar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;padding:12px 14px;border-radius:12px;border:1px solid rgba(55,178,106,0.4);background:rgba(55,178,106,0.10);}
.tl-closebar-t{flex:1;min-width:180px;font-size:11.5px;line-height:1.45;color:${T.onDark};}
.tl-closebar-t b{font-family:${FONT_TITLE};font-weight:700;}

/* REQUESTS TO JOIN — schránka organizátora (#41). Riadok = karta člena (.pmc) + dve akcie. */
.tl-req{display:flex;align-items:center;gap:10px;}
.tl-req + .tl-req{margin-top:8px;}
.tl-req-member{flex:1;min-width:0;}
.tl-req-member .pmc{margin-top:0;}
.tl-req-acts{display:flex;gap:6px;flex-shrink:0;}
.tl-reqbtn{font-family:${FONT_UI};font-weight:600;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;padding:9px 13px;border-radius:10px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.05);color:${T.onDarkDim};cursor:pointer;transition:all .15s;}
.tl-reqbtn:disabled{opacity:.4;cursor:default;}
.tl-reqbtn.yes:not(:disabled):hover{border-color:#37B26A;color:#5FD98C;background:rgba(55,178,106,0.12);}
.tl-reqbtn.no:not(:disabled):hover{border-color:#E5502A;color:#FF8A66;background:rgba(229,80,42,0.12);}
@media(max-width:560px){.tl-req{flex-wrap:wrap;}.tl-req-acts{width:100%;}.tl-reqbtn{flex:1;}}

/* JOIN tlačidlo na karte cudzieho otvoreného výletu (#41) — CTA lock .btn-gold (gradient + radius) */
.tl-join{width:100%;margin-top:8px;font-family:${FONT_TITLE};font-weight:700;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;padding:8px 6px;border-radius:8px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);color:#000;border:1px solid rgba(250,244,236,0.30);cursor:pointer;transition:filter .15s;}
.tl-join:hover:not(:disabled){filter:brightness(1.05);}
.tl-join:disabled{cursor:default;}
.tl-join.done{background:rgba(55,178,106,0.16);border-color:rgba(55,178,106,0.5);color:#5FD98C;}
.tl-join.pending{background:rgba(245,240,228,0.06);border-color:${T.onDarkBorder};color:${T.onDarkDim};}
.tl-joinerr{font-size:9px;color:#FF8A66;margin-top:5px;line-height:1.35;}

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

// status pilulka. done = walked (prejdené) má prednosť pred statusom.
// Farebné triedy: done/with/looking/solo.
//
// #41: mená účastníkov idú z DB (`get_trip_party`), nie z lokálneho `entry.joiners`
// — ten drží len mock/placeholder. Keď má výlet reálnu partiu, vyhráva ona; lokálna
// vetva ostáva pre placeholder riadky (prázdny triplist) a offline.
function statusLabel(entry: TriplistTrip, done?: boolean, party?: TripParty): string {
  if (done) return 'Done';
  const real = party?.joiners ?? [];
  if (real.length === 1) return `With ${real[0].ownerFirst ?? 'a Dogyptian'}`;
  if (real.length > 1) return `With ${real.length}`;
  if (entry.status === 'going') {
    if (entry.joiners.length === 1) {
      const name = MOCK_MEMBER_POOL.find((m) => m.id === entry.joiners[0].memberId)?.name ?? 'a Dogyptian';
      return `With ${name}`;
    }
    if (entry.joiners.length > 1) return `With ${entry.joiners.length}`;
    return 'Going';
  }
  if (entry.status === 'looking') {
    // organizátor vidí, koľko ľudí čaká na jeho odpoveď — inak by o žiadosti nevedel
    const waiting = party?.requests.length ?? 0;
    return waiting ? `Looking · ${waiting} asked` : 'Looking for pack';
  }
  return 'Solo';
}
function statusClass(entry: TriplistTrip, done?: boolean, party?: TripParty): string {
  if (done) return 'done';
  if ((party?.joiners.length ?? 0) > 0) return 'with';
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

// Jedna karta v OPEN TRIPS. Dva pôvody, jeden tvar: `real` = inzerát z DB (dá sa
// oň požiadať), `mock` = deterministická demo náplň z triplist.ts (otvára starý
// oznamový popup s vymyslenými profilmi). Mock sa ukáže LEN keď v DB nie je nič.
type OpenCard = {
  key: string;
  trail: HeroTrail;
  date: string;            // '' = bez dátumu
  joiners: number;
  ownerName: string;
  ownerInitial: string;
  message?: string;
  real?: { slug: string; organizerId: string };
  mock?: PublicTrip;
};

// stav tlačidla „požiadať" podľa mojej existujúcej žiadosti na ten výlet
function joinLabel(status?: TripRequestStatus): { label: string; cls: string; disabled: boolean } {
  switch (status) {
    case 'requested': return { label: '✓ Requested', cls: ' pending', disabled: true };
    case 'accepted': return { label: "✓ You're going", cls: ' done', disabled: true };
    // odmietnutý aj odídený smie požiadať znova — starý riadok sa pri tom zmaže
    // a založí nanovo (viď tripRequests.ts, unique constraint)
    case 'declined': return { label: 'Ask again', cls: '', disabled: false };
    case 'left': return { label: 'Ask again', cls: '', disabled: false };
    default: return { label: 'Request to join', cls: '', disabled: false };
  }
}

// Keď `get_trip_party()` k žiadosti meno nevydá (človek medzitým prestal byť platiaci
// člen → vypadne z `member` v SQL), riadok sa aj tak MUSÍ dať vybaviť.
const UNKNOWN_MEMBER: PartyMember = {
  role: 'requested', ownerFirst: null, dogName: null, dogPhoto: null, packNumber: null, at: null,
};

export default function PackTriplist() {
  const t = useT();
  const navigate = useNavigate();
  const id = usePackIdentity();

  // Hydratácia z DB (issue #32) dobehne po mounte → epoch prečíta walked/triplist znova.
  const storeEpoch = usePackStoreEpoch();
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
  }, [allTrails, storeEpoch]);
  // tr.km je STRING (HeroTrail.km: string) → coerce na number, inak reduce reťazí stringy a walkedKm.toFixed spadne
  const walkedKm = useMemo(() => walkedTrails.reduce((s, tr) => s + (Number(tr.km) || 0), 0), [walkedTrails]);

  // migrácia existujúcich wishlist plánov → triplist entries, idempotentné (viď triplist.ts).
  useEffect(() => { seedTriplistFromPlans(readPlans()); }, []);

  const [triplist, setTriplist] = useState<Record<string, TriplistTrip>>(() => readTriplist());
  useEffect(() => { if (storeEpoch) setTriplist(readTriplist()); }, [storeEpoch]);
  const [dateTripId, setDateTripId] = useState<string | null>(null);
  const [dateValue, setDateValue] = useState('');
  const [publicWCE, setPublicWCE] = useState<WCE | 'all'>('all'); // OPEN TRIPS filter (region)
  const [publicPage, setPublicPage] = useState(0);                // OPEN TRIPS stránkovanie (9/stránku)
  const PUBLIC_PER_PAGE = 9;
  // OPEN TRIP oznamový popup (flow A) — klik na kartu otvorí oznam, join = mock session stav.
  const [announceTrip, setAnnounceTrip] = useState<PublicTrip | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(() => new Set());

  const walkedSet = useMemo(() => readWalkedIds(), [allTrails, storeEpoch]);

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
  // #41 — ŽIADOSTI. `reqEpoch` je ručný refresh: prijatie/odmietnutie zmení riadok
  // v DB, ale RPC ani zoznamy o tom samy nevedia. `reqBusy` drží id práve
  // spracúvanej akcie (dvojklik na Accept by inak poslal dva updaty).
  const [reqEpoch, setReqEpoch] = useState(0);
  const [reqBusy, setReqBusy] = useState<string | null>(null);
  const [joinErr, setJoinErr] = useState<Record<string, string>>({});
  // #42 — prepínač viditeľnosti (badge na MY TRIPS karte) + ponuka zavrieť po prijatí
  const [visTripId, setVisTripId] = useState<string | null>(null);
  const [closeOffer, setCloseOffer] = useState<{ slug: string; who: string | null } | null>(null);
  const incoming = useIncomingRequests(reqEpoch);
  const myRequests = useMyRequests(reqEpoch);

  // #41: kto reálne ide. Len pre SKUTOČNÉ výlety — placeholder riadky (prázdny
  // triplist) nemajú v DB čo hľadať a zbytočne by strieľali RPC. Slugy zo schránky
  // sa pridávajú aj keď v lokálnom triplíste (ešte) nie sú — inak by žiadosť visela bez mena.
  const partySlugs = useMemo(() => {
    const s = new Set<string>(realMyTrips.map((r) => r.entry.tripId));
    Object.keys(incoming.bySlug).forEach((slug) => s.add(slug));
    return [...s];
  }, [realMyTrips, incoming.bySlug]);
  const parties = useMyTripParties(partySlugs, reqEpoch);

  // #41: REÁLNE otvorené výlety ostatných členov (DB) + ich organizátori.
  const { trips: dbOpenTrips } = useOpenTrips(reqEpoch);
  const openParties = useTripParties(
    dbOpenTrips.map((o) => ({ slug: o.slug, organizerId: o.organizerId })),
    reqEpoch,
  );
  // najbližší nadchádzajúci trip → sub v TRIPLIST tab-e (Matej: „v headri môže byť info next trip za xy dní")
  const nextUpDays = useMemo(() => {
    const up = myTrips.find((r) => !r.done && (daysFromNow(r.entry.date, nowMs) ?? -1) >= 0);
    return up ? daysFromNow(up.entry.date, nowMs) : null;
  }, [myTrips, nowMs]);

  // depends on `triplist` — trip pridaný do vlastného zoznamu vypadne z PUBLIC (buildPublicTrips
  // excludes tripIds v readTriplist()).
  const publicTripsAll: PublicTrip[] = useMemo(() => buildPublicTrips(allTrails, nowMs), [allTrails, nowMs, triplist]);

  // #41: DB inzeráty majú prednosť pred mockom — mock je len demo náplň, kým reálne
  // inzeráty nie sú (rovnaký vzor ako placeholderMyTrips vyššie).
  const realOpenCards = useMemo<OpenCard[]>(() => dbOpenTrips.flatMap((o) => {
    const trail = allTrails.find((tr) => tr.id === o.slug);
    // cudzia LOKÁLNA trasa — jej geometriu ani fotky appka nemá, kartu nepostaví
    if (!trail) return [];
    const party = openParties[partyKey(o.slug, o.organizerId)];
    const org = party?.organizer;
    const who = [org?.ownerFirst, org?.dogName].filter(Boolean).join(' & ');
    return [{
      key: partyKey(o.slug, o.organizerId),
      trail,
      date: o.date ?? '',
      joiners: party?.joiners.length ?? 0,
      ownerName: who || 'A Dogyptian',
      ownerInitial: (org?.ownerFirst ?? org?.dogName ?? '?').charAt(0).toUpperCase(),
      real: { slug: o.slug, organizerId: o.organizerId },
    }];
  }), [dbOpenTrips, openParties, allTrails]);

  const mockOpenCards = useMemo<OpenCard[]>(() => publicTripsAll.map((pt) => ({
    key: pt.trail.id,
    trail: pt.trail,
    date: pt.date,
    joiners: pt.joinersCount,
    ownerName: `${pt.owner.name} & ${pt.owner.dog}`,
    ownerInitial: pt.owner.name.charAt(0).toUpperCase(),
    message: pt.message,
    mock: pt,
  })), [publicTripsAll]);

  const openCardsAll = realOpenCards.length > 0 ? realOpenCards : mockOpenCards;
  const openCards = useMemo(
    () => (publicWCE === 'all' ? openCardsAll : openCardsAll.filter((c) => trailWCE(c.trail) === publicWCE)),
    [openCardsAll, publicWCE],
  );
  const publicPageCount = Math.max(1, Math.ceil(openCards.length / PUBLIC_PER_PAGE));
  const publicShown = openCards.slice(publicPage * PUBLIC_PER_PAGE, publicPage * PUBLIC_PER_PAGE + PUBLIC_PER_PAGE);
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

  // #41 — požiadať o pridanie na cudzí otvorený výlet. `from_user_id` sa neposiela
  // odtiaľto: doplní ho tripRequests.ts zo session a RLS ho aj tak zamyká na auth.uid().
  const onRequestJoin = async (real: { slug: string; organizerId: string }) => {
    const k = requestKey(real.slug, real.organizerId);
    setReqBusy(k);
    const err = await requestToJoin(real.slug, real.organizerId);
    setReqBusy(null);
    setJoinErr((prev) => ({ ...prev, [k]: err ?? '' }));
    if (!err) setReqEpoch((e) => e + 1);
  };

  // #41 — organizátor rozhodne. Riadok sa adresuje `id`; meno k nemu má appka len
  // z RPC (get_trip_party cudzie uuid zámerne nevydáva).
  //
  // #42: po PRIJATÍ ponúkneme stiahnuť inzerát. Zámerne PONUKA, nie automat — organizátor
  // môže hľadať ďalších. Bez toho ostane `looking` navždy a žiadosti chodia aj do plnej
  // partie (Matej: „ak sa dohodnu dvaja na rande, nebudú chcieť tretiu osobu").
  const onDecide = async (id: string, status: 'accepted' | 'declined', slug?: string, who?: string | null) => {
    setReqBusy(id);
    const err = await decideRequest(id, status);
    setReqBusy(null);
    if (err) console.warn('[trip request]', err);
    // ponuku ukazujeme LEN keď je výlet naozaj ešte inzerovaný — pri zavretom by to bola
    // otázka na niečo, čo už platí
    if (!err && status === 'accepted' && slug && triplist[slug]?.openness === 'open') {
      setCloseOffer({ slug, who: who ?? null });
    }
    setReqEpoch((e) => e + 1);
  };

  // #42 — zmena viditeľnosti výletu. `private` pri výlete, na ktorý už niekto ide, NESMIE
  // zhodiť status na 'solo' — tým by sa stratilo, že partia existuje. Preto 'going'.
  const setVisibility = (tripId: string, open: boolean) => {
    const hasJoiners = (parties[tripId]?.joiners.length ?? 0) > 0;
    const next = open
      ? { status: 'looking' as TripStatus, openness: 'open' as const }
      : { status: (hasJoiners ? 'going' : 'solo') as TripStatus, openness: 'closed' as const };
    const saved = upsertMyTrip(tripId, next);
    setTriplist((prev) => ({ ...prev, [tripId]: saved }));
    setVisTripId(null);
    setCloseOffer(null);
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
      <style>{PARTY_CARD_CSS}</style>
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
          // onAddTrip: issue #35 — kanonická ADD adresa `/pack/add/trip`; `?region=` (nie starý
          // `?add=`), PackMap rozumie obom tvarom.
          <TripStatsPanel
            walkedTrails={walkedTrails}
            walkedKm={walkedKm}
            onOpenTrip={(tid) => navigate(`/pack/map/${tid}`)}
            onAddTrip={(region) => navigate('/pack/add/trip' + (region ? `?region=${encodeURIComponent(region)}` : ''))}
          />
        ) : (
        <div className="pk-glass tl-panel">
          {/* REQUESTS TO JOIN (#41) — schránka organizátora. Ukáže sa LEN keď niekto čaká;
              prijatie/odmietnutie píše do `trip_requests` (status prepína výhradne organizátor,
              policy trip_requests_decide). Meno k riadku dáva get_trip_party, id dáva tabuľka. */}
          {incoming.count > 0 && (
            <>
              <div className="tl-section">
                <div className="tl-sechead">
                  <h3>Requests to join · {incoming.count}</h3>
                </div>
                {Object.entries(incoming.bySlug).map(([slug, rows]) => {
                  const trail = allTrails.find((tr) => tr.id === slug);
                  return pairPending(rows, parties[slug]?.requests ?? []).map(({ row, member }) => (
                    <div key={row.id} className="tl-req">
                      <div className="tl-req-member">
                        <PartyMemberCard member={member ?? UNKNOWN_MEMBER} roleLabel={trail?.name ?? slug} />
                      </div>
                      <div className="tl-req-acts">
                        <button
                          type="button"
                          className="tl-reqbtn yes"
                          disabled={reqBusy === row.id}
                          onClick={() => void onDecide(row.id, 'accepted', slug, member?.ownerFirst ?? member?.dogName ?? null)}
                        >Accept</button>
                        <button
                          type="button"
                          className="tl-reqbtn no"
                          disabled={reqBusy === row.id}
                          onClick={() => void onDecide(row.id, 'declined')}
                        >Decline</button>
                      </div>
                    </div>
                  ));
                })}
              </div>
              <div className="tl-divider" />
            </>
          )}

          {/* #42 — po prijatí: stiahnuť inzerát, alebo hľadať ďalej. Ponuka, nie automat. */}
          {closeOffer && (
            <>
              <div className="tl-closebar">
                <span className="tl-closebar-t">
                  <b>{closeOffer.who ?? 'A Dogyptian'}</b> is going with you. Close this trip to new requests?
                </span>
                <div className="tl-req-acts">
                  <button type="button" className="tl-reqbtn yes" onClick={() => setVisibility(closeOffer.slug, false)}>
                    Close it
                  </button>
                  <button type="button" className="tl-reqbtn" onClick={() => setCloseOffer(null)}>
                    Keep looking
                  </button>
                </div>
              </div>
              <div className="tl-divider" />
            </>
          )}

          {/* MY TRIPS — horizontálny slajd, status badge (farebný: done/with/looking/solo), vlajka */}
          <div className="tl-section">
            <div className="tl-sechead">
              <h3>My trips</h3>
            </div>
            {myTrips.length === 0 ? (
              <div className="tl-empty">No trips in your list yet. Add a trail to start planning.</div>
            ) : (
              <div className="tl-hscroll">
                {myTrips.map(({ entry, trail, done, placeholder }) => {
                  const dleft = done ? null : daysFromNow(entry.date, nowMs);
                  // #42: badge je prepínač viditeľnosti. Nie na placeholder riadkoch — tie
                  // v DB neexistujú, nie je čo prepínať.
                  //
                  // ⚠️ PREJDENÉ výlety sem PATRIA. Prvá verzia ich vylúčila („čo už sa
                  // zverejňovať") a tým vyrobila slepú uličku: `walked` neprepína `openness`,
                  // takže prejdený výlet ostane visieť v OPEN TRIPS celému packu — aj s
                  // dátumom — a majiteľ ho nemá ako stiahnuť. Badge vtedy hlási „Done", nie
                  // „Looking", takže o tom ani nevie.
                  const canToggleVis = !placeholder;
                  return (
                  <div key={entry.tripId} className="tl-mycard">
                    {dleft !== null && dleft >= 0 && (
                      <span className={`tl-countdown${dleft <= 3 ? ' soon' : ''}`}>{countdownLabel(dleft)}</span>
                    )}
                  <div className="pk-glass-block tl-block" onClick={() => navigate(`/pack/map/${trail.id}`)}>
                    <div className="tl-block-cover" style={trail.photos[0] ? { backgroundImage: `url('${trail.photos[0]}')` } : undefined}>
                      <img className="tl-flag" src={flagUrl('sk')} alt="Slovakia" title="Slovakia" loading="lazy" draggable={false} />
                      {canToggleVis ? (
                        <button
                          type="button"
                          className={`tl-block-badge tap ${statusClass(entry, done, parties[entry.tripId])}`}
                          title="Who can see this trip"
                          onClick={(e) => { e.stopPropagation(); setVisTripId(entry.tripId); }}
                        >{statusLabel(entry, done, parties[entry.tripId])}</button>
                      ) : (
                        <span className={`tl-block-badge ${statusClass(entry, done, parties[entry.tripId])}`}>{statusLabel(entry, done, parties[entry.tripId])}</span>
                      )}
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
            {openCards.length === 0 ? (
              <div className="tl-empty">No open trips in this region right now.</div>
            ) : (
              <>
              <div className="tl-grid">
                {publicShown.map((c) => {
                  // `real` do lokálnej konštanty — TS si zúženie c.real do onClick closure neprenesie
                  const real = c.real;
                  const k = real ? requestKey(real.slug, real.organizerId) : '';
                  const st = real ? joinLabel(myRequests[k]) : null;
                  return (
                  <div
                    key={c.key}
                    className="pk-glass-block tl-block"
                    onClick={() => (c.mock ? setAnnounceTrip(c.mock) : navigate(`/pack/map/${c.trail.id}`))}
                  >
                    <div className="tl-block-cover" style={c.trail.photos[0] ? { backgroundImage: `url('${c.trail.photos[0]}')` } : undefined}>
                      <img className="tl-flag" src={flagUrl('sk')} alt="Slovakia" title="Slovakia" loading="lazy" draggable={false} />
                      <span className="tl-block-badge looking">Looking for pack{c.joiners > 0 ? ` · +${c.joiners}` : ''}</span>
                    </div>
                    <div className="tl-block-info">
                      <div className="tl-block-name">{c.trail.name}</div>
                      <div className="tl-block-sub">{c.trail.region} · {WCE_LABEL[trailWCE(c.trail)]}</div>
                      <div className="tl-block-owner">
                        <span className="tl-block-avatar">{c.ownerInitial}</span>
                        <span>{c.ownerName}</span>
                      </div>
                      {c.message && <div className="tl-msg" title={c.message}>{c.message}</div>}
                      <div className="tl-block-foot">
                        {c.date ? <span className="tl-datepill">{c.date}</span> : <span className="tl-date">No date yet</span>}
                      </div>
                      {real && st && (
                        <>
                          <button
                            type="button"
                            className={`tl-join${st.cls}`}
                            disabled={st.disabled || reqBusy === k}
                            onClick={(e) => { e.stopPropagation(); void onRequestJoin(real); }}
                          >{reqBusy === k ? '…' : st.label}</button>
                          {joinErr[k] && <div className="tl-joinerr">{joinErr[k]}</div>}
                        </>
                      )}
                    </div>
                  </div>
                  );
                })}
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

      {/* #42 — KTO VIDÍ TENTO VÝLET. Text hovorí presne to, čo appka reálne vydá
          (`user_trips_read_open` + `get_trip_party`): trasa, dátum, pes. Matejovo rozhodnutie
          2026-07-30: presný dátum ostáva vonku, takže to musí byť aspoň POVEDANÉ. */}
      {visTripId && (() => {
        const entry = triplist[visTripId];
        const isOpen = entry?.openness === 'open';
        const trail = allTrails.find((tr) => tr.id === visTripId);
        const joiners = parties[visTripId]?.joiners.length ?? 0;
        const waiting = parties[visTripId]?.requests.length ?? 0;
        return (
          <div className="tl-overlay" onClick={() => setVisTripId(null)}>
            <div className="tl-modal" onClick={(e) => e.stopPropagation()}>
              <div className="tl-modal-head">
                <div>
                  <div className="tl-modal-title">Who can see this trip</div>
                  <div className="tl-sub" style={{ textAlign: 'left', marginTop: 4 }}>{trail?.name ?? visTripId}</div>
                </div>
                <button type="button" className="tl-x" onClick={() => setVisTripId(null)} aria-label="Close">×</button>
              </div>
              <div className="tl-vis">
                <button type="button" className={`tl-vischoice${!isOpen ? ' on' : ''}`} onClick={() => setVisibility(visTripId, false)}>
                  <span className="tl-vischoice-ic">🔒</span>
                  <span>
                    <span className="tl-vischoice-t">Private</span>
                    <span className="tl-vischoice-d">
                      Only you {joiners > 0 ? 'and the Dogyptians already going ' : ''}see this trip. Nobody new can ask to join.
                    </span>
                  </span>
                </button>
                <button type="button" className={`tl-vischoice${isOpen ? ' on' : ''}`} onClick={() => setVisibility(visTripId, true)}>
                  <span className="tl-vischoice-ic">🐾</span>
                  <span>
                    <span className="tl-vischoice-t">Looking for pack</span>
                    <span className="tl-vischoice-d">
                      Your pack sees the trail, the date{entry?.date ? ` (${entry.date})` : ''} and your dog — and any member can ask to join.
                    </span>
                  </span>
                </button>
              </div>
              {waiting > 0 && !isOpen && (
                <div className="tl-sub" style={{ textAlign: 'left', marginTop: 12 }}>
                  {waiting} pending request{waiting === 1 ? '' : 's'} stay{waiting === 1 ? 's' : ''} in your list — closing the trip doesn't answer them.
                </div>
              )}
            </div>
          </div>
        );
      })()}

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
