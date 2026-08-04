// /pack komunitné UI komponenty (design: plany/pack-community-features-design.md) — všetky
// popupy/dashboard/events na jednom mieste, aby PackMap.tsx nerástol o ďalších 800 riadkov.
// Brand: tmavé glass pozadie + papyrusové karty + zlaté CTA (Cinzel), rovnaké tokeny ako Portal.
// Fáza UI-first: žiadna perzistencia, všetko dostáva dáta/handlery cez props z PackMap.
import { useEffect, useMemo, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, GLASS_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { HieroglyphBg } from '@/components/pack/PackLayout';
import { ICON, RatingPaws, DiffMark, GOLD_ICON_FILTER } from '@/components/pack/tripShared';
import type { HeroTrail } from '@/data/heroTrails.generated';
import {
  DIFFICULTIES, CROWDS, CROWD_EMOJI, VOLUME_THRESHOLD, SK_GEO, HAZARDS, HAZARD_EMOJI,
  computeCompletion, unitsForTrail, isMyEvent, profilePointsFor, addedByMeIds, isFounderEmail,
  type Difficulty, type Crowd, type Hazard, type CrowdAgg, type PartnerEvent, type TripPlan,
  type SlovakiaCompletion, type MockPerson, type GeoCategory,
} from '@/components/pack/packCommunity';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { levelProgress, POINTS, POINTS_PER_KM, POINTS_PER_100M, JOURNEY_POINTS } from '@/lib/tripPoints';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { trailCountry, flagUrl, flagEmojiFromISO2, countryName } from '@/lib/countryGeo';
import { HeroBadges } from '@/components/pack/HeroBadges';
import { TripProfileCard, partyMemberToProfileCardProps } from '@/components/pack/profile/TripProfileCard';
import { useProfile } from '@/components/pack/profile/packProfile';
// #41 — reálna partia (get_trip_party), namiesto fabrikovaného MOCK_MEMBER_POOL zoznamu.
// Real len pre MOJE vlastné inzeráty (organizátor = ja) — pozri BuddyList nižšie.
import { useTripParty, type TripParty } from '@/components/pack/triplist/useTripParty';
import { PartyDmButton } from '@/components/pack/triplist/PartyMemberCard';

// ── Companion (Matej 2026-07-23) — vybratý spoločník do „kto bol so mnou": môj pes (zo svorky,
// reálna cloudinary fotka) alebo iný člen (mock, initial avatar). key = unikát pre dedup/remove. ──
export interface Companion { key: string; name: string; sub?: string; photo?: string | null; }

const T = PACK_THEME;
const GOLD = '#C99A3F';
const INK = '#1F1A0E';
// Papyrus lock (2026-07-26): žiadny hardcoded bledý hex — plná bledá farba ide cez token.
const CARD = PACK_THEME.card;

// prvé meno z user_metadata (full_name/name), fallback e-mail local-part — rovnaký vzor ako
// firstNameFrom() v Pack.tsx / PackMap.tsx, len lokálna kópia (usePackIdentity meno
// neexponuje). Použité v TRIPSTATS identity header (Slice B) pre „meno svorky".
function firstNameFrom(email: string, fullName?: string): string {
  if (fullName && fullName.trim()) return fullName.trim().split(' ')[0];
  if (!email) return 'Dogyptian';
  const local = email.split('@')[0] || '';
  const base = local.split('+')[0].replace(/[._-]/g, ' ').replace(/\d+/g, '').trim();
  if (!base) return 'Dogyptian';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

// TRIPSTATS per-unit pills (Slice A, Matej 2026-07-23 zadanie bod 2) — farba podľa POČTU
// prejdených tripov na danú jednotku. Tunable: prah + farby na jednom mieste.
const UNIT_DONE_THRESHOLD = 5; // count >= 5 → "prechodené pohorie/park"
const UNIT_DONE_COLOR = '#37B26A';   // rovnaká zelená ako triplist badge (.tl-block-badge.done)
const UNIT_STARTED_COLOR = '#E8B22E'; // rozrobené (1 <= count < prah)

// TRIPSTATS 'parks' medaily — reálne logá 9 SK národných parkov (edukačné použitie, zdroj
// vstupy/MAP/NP+CHKO, orezané do public/icons/np/). Kľúč = presný 'parks' unit string zo SK_GEO.
// Earned = plnofarebné logo na svetlom chipe (enamel-pin look); off = odšednuté. Ostatné
// kategórie (chko/peaks/waters) ostávajú na generickej glyfe — logá nemáme.
const NP_LOGO: Record<string, string> = {
  'Tatranský NP': '/icons/np/tatransky-np.png',
  'NP Nízke Tatry': '/icons/np/np-nizke-tatry.png',
  'NP Malá Fatra': '/icons/np/np-mala-fatra.png',
  'NP Slovenský raj': '/icons/np/np-slovensky-raj.png',
  'NP Muránska planina': '/icons/np/np-muranska-planina.png',
  'NP Poloniny': '/icons/np/np-poloniny.png',
  'NP Slovenský kras': '/icons/np/np-slovensky-kras.png',
  'NP Veľká Fatra': '/icons/np/np-velka-fatra.png',
  'Pieninský NP': '/icons/np/pieninsky-np.png',
};
// per-park treatment (Matej 2026-07-23): TANAP má tmavý text → biely kruh za logo nech je vidno napis;
// Pieniny je tenké/svetlé logo → zväčšiť.
const NP_DISC = new Set(['Tatranský NP', 'Pieninský NP']);
const NP_BIG = new Set<string>([]);

// CHKO logá (ŠOP SR, sopsr.sk/img/posobnost, edukačné použitie) — kľúč = 'chko' unit zo SK_GEO.
// Všetky sú kruhové s tmavým textovým prstencom „CHRÁNENÁ KRAJINNÁ OBLASŤ" → renderujú sa VŽDY
// na bielom kruhu (disc), inak by tmavý text na tmavom packu zanikol.
const CHKO_LOGO: Record<string, string> = {
  'Malé Karpaty': '/icons/chko/male-karpaty.png',
  'Biele Karpaty': '/icons/chko/biele-karpaty.png',
  'Strážovské vrchy': '/icons/chko/strazovske-vrchy.png',
  'Kysuce': '/icons/chko/kysuce.png',
  'Horná Orava': '/icons/chko/horna-orava.png',
  'Ponitrie': '/icons/chko/ponitrie.png',
  'Poľana': '/icons/chko/polana.png',
  'Cerová vrchovina': '/icons/chko/cerova-vrchovina.png',
  'Vihorlat': '/icons/chko/vihorlat.png',
  'Latorica': '/icons/chko/latorica.png',
  'Štiavnické vrchy': '/icons/chko/stiavnicke-vrchy.png',
  'Východné Karpaty': '/icons/chko/vychodne-karpaty.png',
  'Dunajské luhy': '/icons/chko/dunajske-luhy.png',
  'Záhorie': '/icons/chko/zahorie.png',
};

// ── zdieľané CSS — PackMap ho injektne raz vedľa svojho vlastného <style> ──────────────────
export const COMMUNITY_CSS = `
/* ── modal shell (walked / wishlist / partner ad / DM) ── */
.comm-overlay{position:fixed;inset:0;z-index:1200;background:rgba(3,2,1,0.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;}
.comm-modal{width:100%;max-width:420px;max-height:calc(100dvh - 40px);overflow-y:auto;background:${T.glass};backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid ${T.onDarkBorder};border-radius:20px;box-shadow:0 30px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(245,240,228,0.06);padding:24px;}
.comm-modal.wide{max-width:640px;}
.comm-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px;}
.comm-modal-title{font-family:${FONT_TITLE};font-weight:700;font-size:18px;color:${GOLD};line-height:1.25;}
.comm-modal-sub{font-size:12px;color:${T.onDarkDim};margin-top:4px;}
.comm-x{flex-shrink:0;width:32px;height:32px;border-radius:50%;background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.comm-x:hover{border-color:${GOLD};color:${GOLD};}
.comm-field{margin-bottom:18px;}
.comm-label{display:block;font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:${T.onDarkDim};margin-bottom:9px;}

/* rating packy (klikateľné) — Matej 2026-07-23: naša brand packa, väčšia. */
.comm-paws{display:flex;gap:10px;}
.comm-paws button{background:none;border:none;cursor:pointer;padding:2px;line-height:0;}
.comm-paws img{width:40px;height:40px;transition:transform .1s;}
.comm-paws button:hover img{transform:scale(1.12);}

/* WalkedPopup 2-stĺpcový layout (Matej 2026-07-23 — širší popup, zmestí sa na výšku bez rolovania) */
.comm-walked-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 20px;}
@media (max-width:560px){ .comm-walked-grid{grid-template-columns:1fr;} }

/* segmented choice (difficulty / crowd) */
.comm-seg{display:flex;gap:8px;}
.comm-seg button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:10px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.05);color:${T.onDark};font-family:inherit;font-size:12px;cursor:pointer;transition:all .15s;white-space:nowrap;}
.comm-seg button:hover{border-color:${GOLD};}
.comm-seg button.on{background:rgba(201,154,63,0.16);border-color:${GOLD};color:${GOLD};font-weight:600;}

.comm-textarea,.comm-input,.comm-selectinput{width:100%;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:10px;padding:10px 12px;color:${T.onDark};font-family:inherit;font-size:13px;outline:0;resize:vertical;}
.comm-textarea:focus,.comm-input:focus,.comm-selectinput:focus{border-color:${GOLD};}
.comm-textarea{min-height:66px;}

.comm-submit{width:100%;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:14px;border-radius:10px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border:1px solid rgba(250,244,236,0.3);cursor:pointer;}
.comm-submit:disabled{opacity:.4;cursor:default;}
.comm-ghostbtn{width:100%;margin-top:9px;font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.05em;text-transform:uppercase;padding:11px;border-radius:10px;background:rgba(245,240,228,0.06);color:${T.onDark};border:1px solid ${T.onDarkBorder};cursor:pointer;}
.comm-ghostbtn:hover{border-color:${GOLD};color:${GOLD};}

/* ── wishlist intent — 2 veľké voľby ── */
.comm-choicerow{display:flex;flex-direction:column;gap:12px;}
.comm-choice{display:flex;align-items:center;gap:14px;text-align:left;padding:16px;border-radius:14px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.04);cursor:pointer;transition:all .15s;}
.comm-choice:hover{border-color:${GOLD};background:rgba(201,154,63,0.08);}
.comm-choice-ic{width:44px;height:44px;border-radius:50%;flex-shrink:0;background:rgba(201,154,63,0.14);border:1px solid rgba(201,154,63,0.4);display:flex;align-items:center;justify-content:center;}
.comm-choice-ic img{width:22px;height:22px;filter:brightness(0) invert(1);opacity:.85;}
.comm-choice-t{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:14px;color:${T.onDark};}
.comm-choice-d{display:block;font-size:11.5px;color:${T.onDarkDim};margin-top:3px;line-height:1.4;}

/* multi-select chips (hazards, atď.) */
.comm-chips{display:flex;flex-wrap:wrap;gap:7px;}
.comm-chip{padding:7px 12px;border-radius:999px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.05);color:${T.onDark};font-family:inherit;font-size:12px;cursor:pointer;transition:all .15s;white-space:nowrap;}
.comm-chip:hover{border-color:${GOLD};}
.comm-chip.on{background:rgba(201,154,63,0.16);border-color:${GOLD};color:${GOLD};font-weight:600;}

/* profil blurb (read-only, z turistického profilu — jeden zdroj naprieč platformou) */
.comm-profile{display:flex;gap:11px;align-items:flex-start;background:rgba(201,154,63,0.08);border:1px solid rgba(201,154,63,0.3);border-radius:12px;padding:12px 14px;margin-bottom:18px;}
.comm-profile-av{width:34px;height:34px;border-radius:50%;flex-shrink:0;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:14px;color:${INK};}
.comm-profile-t{display:block;font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:${GOLD};margin-bottom:3px;}
.comm-profile-b{display:block;font-size:12px;color:${T.onDark};line-height:1.45;}
.comm-profile-edit{display:block;font-size:10.5px;color:${T.onDarkDim};margin-top:5px;font-style:italic;}

/* repeatable date navrhy */
.comm-daterow{display:flex;gap:8px;align-items:center;margin-bottom:8px;}
.comm-daterow input{flex:1;}
.comm-daterow button{flex-shrink:0;width:34px;height:34px;border-radius:9px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.05);color:${T.onDark};font-size:16px;cursor:pointer;}
.comm-addbtn{width:100%;padding:9px;border-radius:9px;border:1px dashed ${T.onDarkBorder};background:transparent;color:${T.onDarkDim};font-family:inherit;font-size:11.5px;cursor:pointer;}
.comm-addbtn:hover{border-color:${GOLD};color:${GOLD};}

/* ── crowd meta (agregát na karte + inline detaile) ── */
.comm-crowd{display:flex;flex-direction:column;align-items:flex-end;gap:4px;}
.comm-crowd.detail{gap:6px;}
.comm-crowd-rating{display:inline-flex;align-items:center;gap:5px;font-family:${FONT_UI};font-weight:600;color:${GOLD};}
.comm-crowd-row{display:inline-flex;align-items:center;gap:5px;color:rgba(245,240,228,0.6);white-space:nowrap;}
.comm-crowd-count{font-size:9.5px;color:${T.onDarkDim};font-style:italic;white-space:nowrap;}
.comm-crowd-seed{font-size:9px;color:${GOLD};opacity:.7;letter-spacing:.04em;text-transform:uppercase;}

/* ── BigRating (Matej 2026-07-22): pravý stĺpec karty/detailu = LEN 1 packa + veľké číslo X.Y,
   ostatné (náročnosť/popularita/hazard) sa presunuli na fotku ako PhotoMetaPills. ── */
.comm-bigrating{display:inline-flex;align-items:center;gap:8px;}
.comm-bigrating img{width:30px;height:30px;flex-shrink:0;}
.comm-bigrating b{font-family:${FONT_UI};font-weight:600;font-size:26px;color:${GOLD};line-height:1;}
.comm-bigrating.compact img{width:25px;height:25px;}
.comm-bigrating.compact b{font-size:22px;}

/* ── PhotoMetaPills — DOLNÝ pruh fotky. Hazard TU NIE JE (ten je až v detaile vedľa tagov).
   Hover na pilulku = vysvetlenie (%-rozpad hlasov členov).
   Matej 2026-07-27: z 2 stacknutých pilúl (náročnosť·km·↑m / popularita) sú TRI vedľa seba
   po šírke fotky — ↔ km · ↑ m │ náročnosť │ popularita. Dôvod: stacknuté zaberali výšku
   fotky a km sa strácali v pilulke náročnosti. ── */
.comm-photometa{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;gap:6px;}
.comm-mpill{display:inline-flex;align-items:center;gap:5px;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.2);color:#fff;font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.02em;padding:5px 9px;border-radius:999px;white-space:nowrap;}
/* hazard chip (len v detaile, vedľa tagov) — červený, % = koľko členov nahlásilo. */
.comm-hazardtag{display:inline-flex;align-items:center;gap:5px;background:rgba(178,38,30,0.16);border:1px solid rgba(206,75,60,0.6);color:#E0796D;font-size:10.5px;font-weight:600;padding:5px 10px;border-radius:999px;white-space:nowrap;}

/* hover %-rozpad tooltip (design §A) */
.comm-hastip{position:relative;cursor:help;}
/* Matej 2026-07-27: „pri prejdení myšou ten obsah vysvetlenia preteka mimo viewport".
   Tooltip je kotvený right:0 NA PILULKU — kým bola náročnosť sama v pravom rohu, vošla sa.
   Odkedy sú pilulky v rade, náročnosť je v strede a nowrap tooltip vylezie vľavo z karty.
   Pevný strop šírky nestačí (pri krátkej km pilulke vyjde ľavá hrana mimo kartu), takže
   tooltip kotvíme na CELÝ pruh pilúl, nie na jednu pilulku: pilulka je position:static,
   pruh position:relative, tooltip left:0/right:0 → má presne šírku pruhu a pretiecť
   nemôže bez ohľadu na to, koľko pilúl je pred ním. V článku (stat tabuľka, 760px) sa nič
   nemení — tam nowrap funguje.
   POZOR: tento CSS blok je template literál — ŽIADNE spätné apostrofy v komentároch. */
.comm-photometa{position:relative;}
/* backdrop-filter na pilulke robí z pilulky CONTAINING BLOCK pre absolútne deti — tooltip sa
   z nej potom nedá vymaniť ani cez position:static a ostane široký ako pilulka (5 riadkov na
   šírku 80px). Na fotke preto blur rušíme; pozadie rgba(0,0,0,0.6) + biely okraj ostávajú,
   rozdiel je opticky nulový. Mimo fotky (.comm-mpill inde) sa blur nemení. */
.comm-photometa .comm-mpill{backdrop-filter:none;-webkit-backdrop-filter:none;}
.comm-photometa .comm-hastip{position:static;}
.comm-photometa .comm-hastip::after{left:0;right:0;width:auto;max-width:none;white-space:normal;text-align:left;line-height:1.4;}
.comm-hastip::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 7px);right:0;background:${T.panelGrad};border:1.5px solid ${T.cardEdge};color:${INK};font-family:${FONT_UI};font-size:10px;font-weight:600;padding:6px 10px;border-radius:10px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s;box-shadow:${T.panelShadow};z-index:20;}
.comm-hastip:hover::after{opacity:1;}

/* ── dashboard „My Slovakia" ── */
.comm-dash{position:fixed;inset:0;z-index:1150;background:${T.pageBg};overflow-y:auto;}
/* §16 (2026-07-23): obsah dashboardu (Trippin') do zdieľaného LIQUID GLASS panelu nad heroglyf
   textúrou — rovnaká situácia ako triplist/článok, už NIE „všetko na čiernej". */
.comm-dash-inner{max-width:760px;margin:calc(env(safe-area-inset-top,0px) + 22px) auto 120px;padding:24px 20px 28px;position:relative;z-index:1;}
.comm-dash-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px;}
.comm-dash-title{font-family:${FONT_TITLE};font-weight:700;font-size:22px;color:${GOLD};}
.comm-dash-hero{display:flex;align-items:center;gap:20px;background:${T.glass};border:1px solid ${T.onDarkBorder};border-radius:18px;padding:22px;margin-bottom:24px;}
.comm-ring{--pct:0;width:96px;height:96px;border-radius:50%;flex-shrink:0;background:conic-gradient(${GOLD} calc(var(--pct)*1%),rgba(245,240,228,0.1) 0);display:flex;align-items:center;justify-content:center;position:relative;}
.comm-ring::after{content:'';position:absolute;inset:9px;border-radius:50%;background:${T.pageBg};}
.comm-ring span{position:relative;z-index:1;font-family:${FONT_UI};font-weight:600;font-size:22px;color:${GOLD};}
.comm-dash-herotxt h3{font-family:${FONT_TITLE};font-weight:700;font-size:16px;color:${T.onDark};}
.comm-dash-herotxt p{font-size:12.5px;color:${T.onDarkDim};margin-top:5px;line-height:1.5;}
.comm-dash-tabs{display:flex;gap:9px;margin-bottom:18px;}
.comm-dash-tab{padding:9px 18px;border-radius:999px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.05);color:${T.onDark};font-family:${FONT_UI};font-weight:600;font-size:11px;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;}
.comm-dash-tab.on{background:linear-gradient(135deg,#F5C73D,#E69E1A);border-color:rgba(250,244,236,0.3);color:${INK};}

/* identity header — foto svorky + level odznak (TRIPSTATS Slice B, Matej 2026-07-23) */
.comm-vhead{display:flex;align-items:center;gap:16px;flex-wrap:wrap;background:${T.glass};border:1px solid ${T.onDarkBorder};border-radius:18px;padding:18px 20px;margin-bottom:22px;}
.comm-vhead-pack{display:flex;align-items:center;flex-shrink:0;}
.comm-vavatar{width:48px;height:48px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid rgba(201,154,63,0.45);box-shadow:0 0 0 3px ${T.pageBg};background:rgba(245,240,228,0.08);margin-left:-14px;}
.comm-vhead-pack .comm-vavatar:first-child{margin-left:0;}
.comm-vavatar img{width:100%;height:100%;object-fit:cover;display:block;}
.comm-vavatar img.comm-vavatar-fallback{width:18px;height:18px;object-fit:contain;filter:brightness(0) invert(1);opacity:.85;}
.comm-vavatar--owner{background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);font-family:${FONT_UI};font-weight:600;font-size:16px;color:${INK};}
.comm-vavatar--slot{background:rgba(245,240,228,0.04);border-style:dashed;opacity:.5;}
.comm-vavatar--slot img{width:16px;height:16px;object-fit:contain;filter:brightness(0) invert(1);opacity:.6;}
.comm-vhead-name{flex:1;min-width:140px;font-family:${FONT_TITLE};font-weight:700;font-size:16px;color:${T.onDark};}
.comm-level{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;}
.comm-level-pill{display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,#F5C73D,#E69E1A);border:1px solid rgba(250,244,236,0.3);border-radius:999px;padding:7px 14px;font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:${INK};white-space:nowrap;}
.comm-level-ic{width:14px;height:14px;flex-shrink:0;filter:brightness(0);}
.comm-level-next{display:flex;align-items:center;gap:4px;font-size:10.5px;color:${T.onDarkDim};white-space:nowrap;}
@media (max-width:560px){ .comm-vhead{padding:14px 16px;gap:12px;} .comm-vhead-name{font-size:14px;} }

/* svetový prehľad — easy dashboard (Matej 2026-07-23) */
.comm-worldstats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:8px;}
.comm-wstat{background:${T.glass};border:1px solid ${T.onDarkBorder};border-radius:14px;padding:16px 12px;text-align:center;}
.comm-wstat b{display:block;font-family:${FONT_UI};font-weight:600;font-size:24px;color:${GOLD};line-height:1.1;}
.comm-wstat span{display:block;font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:${T.onDarkDim};margin-top:5px;}
@media (max-width:560px){ .comm-worldstats{grid-template-columns:repeat(2,1fr);} }

.comm-cat{background:${T.glass};border:1px solid ${T.onDarkBorder};border-radius:14px;padding:16px 18px;margin-bottom:12px;}
/* klikateľná geo kategória → ADD TRIP (Matej 2026-07-23): button reset + hover. */
.comm-cat--click{display:block;width:100%;text-align:left;cursor:pointer;font-family:inherit;transition:border-color .15s;}
.comm-cat--click:hover{border-color:${GOLD};}
.comm-cat-head{display:flex;align-items:center;gap:10px;margin-bottom:11px;}
.comm-cat-ic{width:26px;height:26px;flex-shrink:0;filter:brightness(0) invert(1);opacity:.7;}
.comm-cat-name{font-family:${FONT_TITLE};font-weight:700;font-size:13px;color:${T.onDark};flex:1;}
.comm-cat-pct{font-family:${FONT_UI};font-weight:600;font-size:13px;color:${GOLD};}
.comm-cat-bar{height:7px;border-radius:999px;background:rgba(245,240,228,0.09);overflow:hidden;}
.comm-cat-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#F5C73D,#E69E1A);transition:width .4s;}
.comm-walkedhead{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;background:none;border:none;cursor:pointer;padding:0;font-family:${FONT_UI};font-weight:600;font-size:13px;letter-spacing:.04em;color:${GOLD};margin:20px 0 12px;}
.comm-walkedhead-n{font-family:'JetBrains Mono',monospace;font-weight:400;font-size:11px;letter-spacing:0;color:${T.onDarkDim};}
.comm-dash-section-title{font-family:${FONT_UI};font-weight:600;font-size:13px;letter-spacing:.04em;color:${GOLD};margin:20px 0 12px;}
.comm-walkedrow{display:flex;align-items:center;justify-content:space-between;gap:12px;background:${T.glass};border:1px solid ${T.onDarkBorder};border-radius:12px;padding:13px 16px;margin-bottom:9px;cursor:pointer;transition:border-color .15s;}
.comm-walkedrow:hover{border-color:${GOLD};}
.comm-walkedrow-name{font-family:${FONT_TITLE};font-weight:700;font-size:13px;color:${T.onDark};}
.comm-walkedrow-meta{font-size:11px;color:${T.onDarkDim};white-space:nowrap;flex-shrink:0;}
.comm-cat-units{display:flex;flex-wrap:wrap;gap:6px;margin-top:11px;}
.comm-unit{font-size:10.5px;padding:4px 9px;border-radius:999px;border:1px solid ${T.onDarkHair};color:${T.onDarkDim};background:none;font-family:inherit;cursor:pointer;transition:border-color .15s,color .15s,background .15s;}
.comm-unit:hover{border-color:${GOLD};color:${GOLD};}
.comm-unit.done{border-color:${GOLD};color:${GOLD};background:rgba(201,154,63,0.1);}
/* per-unit rozklad (Slice A, bod 2): farba podľa počtu prejdených tripov na jednotku. */
.comm-unit--started{border-color:${UNIT_STARTED_COLOR};color:${UNIT_STARTED_COLOR};background:rgba(232,178,46,0.12);}
.comm-unit--done{border-color:${UNIT_DONE_COLOR};color:${UNIT_DONE_COLOR};background:rgba(55,178,106,0.12);}

/* medaily (parks/chko/peaks/waters) — Matej 2026-07-23 zadanie bod 2: „musia to byť ozaj
   odznaky… na to sa kliknúť nebude dať bude to len medaila". Žiadny bar, žiadny ×N, žiadny klik. */
.comm-cat-count{font-size:11px;color:${T.onDarkDim};flex-shrink:0;}
.comm-medals{display:flex;flex-wrap:wrap;gap:14px;margin-top:13px;}
.comm-medal{width:68px;display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;}
.comm-medal-ic{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.comm-medal-ic img{width:26px;height:26px;}
.comm-medal--on .comm-medal-ic{background:linear-gradient(135deg,#F5C73D,#E69E1A);box-shadow:0 0 14px rgba(245,199,61,0.45),inset 0 1px 0 rgba(255,255,255,0.35);}
.comm-medal--on .comm-medal-ic img{filter:brightness(0) invert(1);}
.comm-medal--off .comm-medal-ic{background:rgba(245,240,228,0.06);border:1px solid ${T.onDarkHair};}
.comm-medal--off .comm-medal-ic img{filter:brightness(0) invert(1);opacity:.28;}
/* parks = reálne NP logá (Matej 2026-07-23): ŽIADNY krúžok/chip — logá ponechané ako sú, len
   vystrihnuté na priehľadnom pozadí. Earned = plná farba; off = odšednuté + stlmené. */
.comm-medal-ic--logo{width:62px;height:62px;padding:0;border-radius:0;background:none;border:none;}
.comm-medal-ic--logo img{width:100%;height:100%;object-fit:contain;}
.comm-medal--on .comm-medal-ic--logo{background:none;box-shadow:none;border:none;}
.comm-medal--on .comm-medal-ic--logo img{filter:none;}
.comm-medal--off .comm-medal-ic--logo{background:none;box-shadow:none;border:none;}
.comm-medal--off .comm-medal-ic--logo img{filter:grayscale(1) brightness(1.1);opacity:.5;}
/* TANAP + Pieniny = biely kruh za logo (tmavý text robený pre biele pozadie → čitateľný v OBOCH
   stavoch). off = mierne stlmený svetlý disk, ale text stále vidno (žiadne opacity .3/.5 fade). */
.comm-medal-ic--disc{background:#FBF9F4;border-radius:50%;padding:7px;box-shadow:0 0 0 1px rgba(0,0,0,0.12),0 2px 9px rgba(0,0,0,0.4);}
.comm-medal-ic--disc img{filter:none;opacity:1;}
.comm-medal--off .comm-medal-ic--disc{background:#D6D1C4;}
.comm-medal--off .comm-medal-ic--disc img{filter:grayscale(.45);opacity:.92;}
/* voľný per-park hook na zväčšenie tenkých log (aktuálne prázdny — Pieniny rieši disc). */
.comm-medal-ic--big img{transform:scale(1.22);}
.comm-medal-name{font-size:10px;line-height:1.25;color:${T.onDark};}
.comm-medal--off .comm-medal-name{color:${T.onDarkDim};opacity:.55;}
.comm-unit-drop{margin-top:10px;padding-top:10px;border-top:1px solid ${T.onDarkHair};}
.comm-unit-empty{text-align:center;font-size:11px;color:${T.onDarkDim};padding:6px 0 10px;font-style:italic;}
.comm-unit-addrow{text-align:center;font-family:${FONT_UI};font-weight:600;font-size:10.5px;letter-spacing:.04em;color:${GOLD};padding:10px;border-radius:10px;border:1px dashed rgba(201,154,63,0.4);cursor:pointer;transition:border-color .15s,background .15s;}
.comm-unit-addrow:hover{border-color:${GOLD};background:rgba(201,154,63,0.08);}

/* HERO BADGES — deviatka hrdinských odznakov (Matej 2026-07-24), globálny trip-míľnik achievement.
   3D medailón feel: earned = plná farba + zlatý glow + jemný float; locked = grayscale + tlmené
   (pes aj číslo míľnika stále čitateľné — žiadna silueta). */
.comm-heroes{display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:13px;}
@media (min-width:640px){.comm-heroes{gap:10px;}}
.comm-hero{display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;font-family:inherit;cursor:pointer;padding:2px;}
.comm-hero img{width:100%;aspect-ratio:1;object-fit:contain;transition:transform .25s,filter .25s;}
.comm-hero--on img{filter:drop-shadow(0 0 6px rgba(201,154,63,0.65)) drop-shadow(0 4px 6px rgba(0,0,0,0.5));animation:comm-hero-float 4s ease-in-out infinite;}
.comm-hero--on:hover img{transform:perspective(500px) rotateY(-8deg) scale(1.08);}
.comm-hero--off img{filter:grayscale(1) brightness(.75);opacity:.4;}
.comm-hero-trips{font-family:${FONT_UI};font-weight:600;font-size:10px;color:${T.onDarkDim};}
.comm-hero--on .comm-hero-trips{color:${GOLD};}
@keyframes comm-hero-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);}}
@media (prefers-reduced-motion:reduce){.comm-hero--on img{animation:none;}.comm-hero--on:hover img{transform:none;}}

/* REVEAL overlay — „milestone reached" moment (Matej 2026-07-24, upresnenie 2026-07-24 = horizontálny
   card layout), portál do document.body (rodičovský .pk-glass má backdrop-filter → containing block
   by ukotvil position:fixed o panel, nie o viewport). Backdrop klik = dismiss; klik NA card = nič. */
.comm-reveal{position:fixed;inset:0;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px;cursor:pointer;animation:comm-reveal-fadein .35s ease;}
.comm-reveal-card{position:relative;display:flex;gap:28px;align-items:center;width:100%;max-width:760px;max-height:86vh;background:linear-gradient(180deg,#161412,#0e0d0c);border:1px solid rgba(201,154,63,.28);border-radius:20px;padding:34px;cursor:default;box-shadow:0 24px 70px rgba(0,0,0,.6);animation:comm-reveal-pop .55s cubic-bezier(.2,1.3,.4,1);}
.comm-reveal-left{flex:0 0 210px;display:flex;flex-direction:column;align-items:center;gap:12px;}
.comm-reveal-badge{width:210px;max-width:44vw;filter:drop-shadow(0 0 20px rgba(201,154,63,.5)) drop-shadow(0 10px 22px rgba(0,0,0,.55));}
.comm-reveal-trips{font-family:${FONT_UI};font-weight:600;font-size:13px;color:${GOLD};letter-spacing:.16em;text-transform:uppercase;}
.comm-reveal-right{flex:1;min-width:0;text-align:left;max-height:70vh;overflow-y:auto;}
.comm-reveal-kicker{font-family:${FONT_UI};font-weight:600;font-size:11px;letter-spacing:.24em;color:${GOLD};text-transform:uppercase;}
.comm-reveal-name{font-family:${FONT_TITLE};font-weight:700;font-size:30px;color:${T.onDark};margin-top:6px;line-height:1.05;}
.comm-reveal-story{font-size:14px;line-height:1.65;color:${T.onDarkDim};margin-top:14px;}
.comm-reveal-x{position:absolute;top:12px;right:14px;width:34px;height:34px;border-radius:50%;border:1px solid rgba(243,236,221,.18);background:rgba(255,255,255,.04);color:${T.onDark};font-size:20px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.comm-reveal-x:hover{background:rgba(255,255,255,.1);}
.comm-reveal-badge--off{filter:grayscale(1) brightness(.72) drop-shadow(0 10px 22px rgba(0,0,0,.55));}
.comm-reveal-kicker--locked{color:${T.onDarkDim};}
.comm-reveal-source{display:inline-block;margin-top:16px;font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.04em;color:${GOLD};text-decoration:none;border-bottom:1px solid rgba(201,154,63,.35);padding-bottom:2px;}
.comm-reveal-source:hover{border-bottom-color:${GOLD};}
.comm-reveal-source-label{font-family:inherit;font-weight:400;font-size:11px;color:${T.onDarkDim};letter-spacing:0;}
@media (max-width:600px){
  .comm-reveal-card{flex-direction:column;gap:16px;padding:26px 20px 22px;text-align:center;}
  .comm-reveal-left{flex:none;}
  .comm-reveal-badge{width:150px;}
  .comm-reveal-right{text-align:center;max-height:48vh;}
  .comm-reveal-name{font-size:24px;}
}
@keyframes comm-reveal-fadein{from{opacity:0;}to{opacity:1;}}
@keyframes comm-reveal-pop{from{opacity:0;transform:scale(.94) translateY(8px);}to{opacity:1;transform:none;}}
@media (prefers-reduced-motion:reduce){
  .comm-reveal{animation:none;}
  .comm-reveal-card{animation:none;}
}

/* planning list (C2) + events list (D) share the card style */
.comm-plan{background:${T.glass};border:1px solid ${T.onDarkBorder};border-radius:14px;padding:15px 17px;margin-bottom:12px;}
.comm-plan-photo{position:relative;margin:-15px -17px 13px;height:150px;background-size:cover;background-position:center;border-radius:14px 14px 0 0;cursor:pointer;}
.comm-plan-planned{position:absolute;left:12px;bottom:10px;font-family:${FONT_UI};font-weight:600;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#F5C73D;background:rgba(0,0,0,0.5);padding:4px 9px;border-radius:7px;border:1px solid rgba(201,154,63,0.5);}
.comm-plan-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.comm-plan-name{font-family:${FONT_TITLE};font-weight:700;font-size:14px;color:${T.onDark};}
.comm-plan-meta{font-size:11.5px;color:${T.onDarkDim};margin-top:3px;}
.comm-plan-tag{font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.05em;text-transform:uppercase;padding:4px 9px;border-radius:999px;flex-shrink:0;}
.comm-plan-tag.solo{background:rgba(245,240,228,0.08);color:${T.onDarkDim};}
.comm-plan-tag.partner{background:rgba(201,154,63,0.16);color:${GOLD};}
.comm-plan-people{display:flex;flex-direction:column;gap:7px;margin-top:12px;padding-top:12px;border-top:1px solid ${T.onDarkHair};}
.comm-person{display:flex;align-items:center;gap:9px;}
.comm-person-av{width:28px;height:28px;border-radius:50%;flex-shrink:0;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:12px;color:${INK};}
.comm-person-txt{flex:1;min-width:0;font-size:11.5px;color:${T.onDark};}
.comm-person-txt b{color:${T.onDark};}
.comm-person-txt span{color:${T.onDarkDim};}
.comm-buddytoggle{font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.06em;text-transform:uppercase;padding:6px 0;background:none;border:none;color:${GOLD};cursor:pointer;}
.comm-msgbtn{flex-shrink:0;font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.04em;text-transform:uppercase;padding:6px 11px;border-radius:999px;background:rgba(245,240,228,0.06);border:1px solid ${T.onDarkBorder};color:${T.onDark};cursor:pointer;}
.comm-msgbtn:hover{border-color:${GOLD};color:${GOLD};}
.comm-joinbtn{flex-shrink:0;font-family:${FONT_TITLE};font-weight:700;font-size:10px;letter-spacing:.05em;text-transform:uppercase;padding:8px 15px;border-radius:999px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border:1px solid rgba(250,244,236,0.3);cursor:pointer;}
.comm-joinbtn.joined{background:rgba(201,154,63,0.16);color:${GOLD};border-color:${GOLD};}
.comm-joinbtn.closed{background:rgba(245,240,228,0.05);color:${T.onDarkDim};border-color:${T.onDarkBorder};cursor:default;}
.comm-lockbtn{flex-shrink:0;font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.04em;text-transform:uppercase;padding:5px 10px;border-radius:999px;background:none;border:1px solid ${T.onDarkBorder};color:${T.onDarkDim};cursor:pointer;}
.comm-lockbtn:hover{border-color:${GOLD};color:${GOLD};}
.comm-lockbtn.on{border-color:${GOLD};color:${GOLD};}
.comm-empty{text-align:center;padding:34px 16px;color:${T.onDarkDim};font-size:12.5px;font-style:italic;}
/* #55 — prázdny stav = JEDNA veta faktu + JEDNA akcia. Bez tlačidla je to slepá ulička:
   po zmazaní fabrikovaných dát (2026-08-03) je toto prvé, čo nový člen v paneli uvidí. */
.comm-emptybox{display:flex;flex-direction:column;align-items:center;gap:14px;padding:34px 16px;text-align:center;}
.comm-emptybox p{margin:0;color:${T.onDarkDim};font-size:12.5px;font-style:italic;line-height:1.5;}
.comm-emptybtn{font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.16em;text-transform:uppercase;padding:11px 20px;border-radius:8px;border:1px solid rgba(250,244,236,0.30);background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};cursor:pointer;}
/* #41 — úprimná veta namiesto fabrikovaného člena/prázdneho bloku (issue #41, ČASŤ 2) */
.comm-buddynote{font-size:11px;color:${T.onDarkDim};font-style:italic;padding:8px 0 2px;}

/* ── CompanionPicker (Matej 2026-07-23): „kto bol so mnou" — svorka (moje psy s fotkami) +
   iní členovia podľa mena. Vybraté = avatar chipy s ×. ── */
.comm-comp-selected{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:11px;}
.comm-comp-chip{display:inline-flex;align-items:center;gap:8px;background:rgba(201,154,63,0.12);border:1px solid rgba(201,154,63,0.4);border-radius:999px;padding:5px 11px 5px 5px;}
.comm-comp-chip-av{width:26px;height:26px;border-radius:50%;flex-shrink:0;background-size:cover;background-position:center;background-color:rgba(245,240,228,0.1);display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:11px;color:${INK};}
.comm-comp-chip-av.ph{background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);}
.comm-comp-chip b{font-size:12px;color:${T.onDark};font-weight:600;}
.comm-comp-chip button{background:none;border:none;color:${T.onDarkDim};font-size:15px;line-height:1;cursor:pointer;padding:0 2px;}
.comm-comp-chip button:hover{color:${GOLD};}
.comm-comp-grouplabel{font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:${T.onDarkDim};margin:2px 0 7px;font-family:${FONT_UI};font-weight:600;}
.comm-comp-pack{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}
.comm-comp-dog{display:inline-flex;align-items:center;gap:8px;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:999px;padding:5px 13px 5px 5px;cursor:pointer;transition:all .15s;}
.comm-comp-dog:hover{border-color:${GOLD};}
.comm-comp-dog.on{background:rgba(201,154,63,0.16);border-color:${GOLD};}
.comm-comp-dog-av{width:28px;height:28px;border-radius:50%;flex-shrink:0;background-size:cover;background-position:center;background-color:rgba(245,240,228,0.1);display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:12px;color:${INK};}
.comm-comp-dog-av.ph{background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);}
.comm-comp-dog span{font-size:12.5px;color:${T.onDark};}
.comm-comp-dog .plus{margin-left:2px;color:${GOLD};font-size:15px;font-weight:600;line-height:1;}
.comm-comp-searchwrap{position:relative;}
.comm-comp-sug{position:absolute;top:calc(100% + 6px);left:0;right:0;background:rgba(6,5,3,0.96);backdrop-filter:blur(8px);border:1px solid ${T.onDarkBorder};border-radius:11px;overflow:hidden;box-shadow:0 12px 34px rgba(0,0,0,0.55);z-index:30;max-height:210px;overflow-y:auto;}
.comm-comp-sugitem{display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;border-bottom:1px solid ${T.onDarkHair};}
.comm-comp-sugitem:last-child{border-bottom:0;}
.comm-comp-sugitem:hover{background:rgba(201,154,63,0.14);}
.comm-comp-sugitem-av{width:30px;height:30px;border-radius:50%;flex-shrink:0;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:12px;color:${INK};}
.comm-comp-sugitem-tx{font-size:12.5px;color:${T.onDark};}
.comm-comp-sugitem-tx span{color:${T.onDarkDim};font-size:11px;}

/* ── add-mode choice (Plánujem / Prešiel som) ── */
.comm-modechoice{display:flex;flex-direction:column;gap:12px;}
.comm-mode{display:flex;align-items:flex-start;gap:14px;text-align:left;padding:17px;border-radius:14px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.04);cursor:pointer;transition:all .15s;}
.comm-mode:hover{border-color:${GOLD};background:rgba(201,154,63,0.08);}
.comm-mode-em{font-size:26px;line-height:1;flex-shrink:0;}
.comm-mode-t{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:15px;color:${T.onDark};}
.comm-mode-d{display:block;font-size:11.5px;color:${T.onDarkDim};margin-top:4px;line-height:1.45;}

/* ── TRIPSTATS V3 (issues #46 / #47 / #50) ──────────────────────────────────────────────────
   Tri zmeny naraz, lebo bývajú v jednom paneli:
    · #46 level a progressbar do ďalšieho levelu priamo v hlavičke + ⓘ cenník bodov,
    · #47 vysvedčenie BEZ percent krajiny — hero krajiny, počty tripov a km, odznak za počet,
    · #50 magistrála je odkaz na svoj detail, nie rozbaľovacia položka.
   POZOR: toto je template literál — v komentároch ŽIADNE spätné apostrofy. */

/* level + progressbar (#46). Pruh berie percentá z levelProgress(), nie z počtu tripov. */
.comm-lvlwrap{flex-basis:100%;display:flex;flex-direction:column;gap:7px;}
.comm-lvlhead{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.comm-lvlbar{height:8px;border-radius:999px;background:rgba(245,240,228,0.09);overflow:hidden;}
.comm-lvlbar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#F5C73D,#E69E1A);transition:width .45s;}
.comm-lvlfoot{display:flex;align-items:center;justify-content:space-between;gap:10px;font-family:${FONT_UI};font-weight:500;font-size:10.5px;color:${T.onDarkDim};}
.comm-lvlinfo{position:relative;flex-shrink:0;display:inline-flex;margin-left:auto;}
.comm-lvlinfo-btn{width:22px;height:22px;border-radius:50%;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.06);color:${T.onDarkDim};font-family:${FONT_UI};font-weight:600;font-size:11px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.comm-lvlinfo-btn:hover,.comm-lvlinfo-btn.on{border-color:${GOLD};color:${GOLD};}
/* cenník = papyrusový panel (rovnaká vrstva ako comm-hastip), nie ďalšie tmavé sklo */
.comm-pts{position:absolute;top:calc(100% + 9px);right:0;z-index:30;width:min(280px,78vw);max-height:320px;overflow-y:auto;text-align:left;cursor:default;background:${T.panelGrad};border:1.5px solid ${T.cardEdge};border-radius:14px;box-shadow:${T.panelShadow};padding:14px 15px;}
.comm-pts-eyebrow{font-family:${FONT_UI};font-weight:500;font-size:9px;letter-spacing:.26em;text-transform:uppercase;color:${T.cardEdge};margin-bottom:9px;}
.comm-pts-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-family:${FONT_UI};font-weight:500;font-size:11px;color:${T.inkWarm};padding:3px 0;}
.comm-pts-row b{font-weight:600;color:${T.inkStrong};white-space:nowrap;}
.comm-pts-rule{height:2px;margin:10px 0;background:${T.rule};}
.comm-pts-tot{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-family:${FONT_TITLE};font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:${T.inkStrong};}

/* countries — VŠETKY štáty s vlajkou, aj tie bez výletu (#46) */
.comm-ctrys{display:flex;gap:8px;overflow-x:auto;padding:2px 0 8px;margin-bottom:14px;-webkit-overflow-scrolling:touch;}
.comm-ctry{flex-shrink:0;display:flex;align-items:center;gap:8px;padding:7px 13px 7px 8px;border-radius:999px;border:1px solid ${T.onDarkHair};background:none;font-family:inherit;cursor:pointer;transition:border-color .15s,background .15s;}
.comm-ctry:hover{border-color:${GOLD};}
.comm-ctry.on{border-color:${GOLD};background:rgba(201,154,63,0.12);}
.comm-ctry--empty{opacity:.5;}
.comm-ctry img{width:22px;height:15px;border-radius:3px;object-fit:cover;flex-shrink:0;}
.comm-ctry b{font-family:${FONT_UI};font-weight:600;font-size:11.5px;color:${T.onDark};white-space:nowrap;}
.comm-ctry.on b{color:${GOLD};}
.comm-ctry span{font-family:${FONT_UI};font-weight:500;font-size:10px;color:${T.onDarkDim};white-space:nowrap;}

/* hero krajiny + dropdown (#47) — zaoblený obrázok ako v tripovom článku */
.comm-chero{position:relative;border-radius:18px;overflow:hidden;border:1px solid ${T.onDarkBorder};background:${T.glass};background-size:cover;background-position:center;min-height:172px;display:flex;align-items:flex-end;padding:18px;margin-bottom:16px;}
.comm-chero::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.78) 100%);}
/* krajina bez vlastnej fotky: vlajka NEsmie ísť cez background cover — roztiahnutá rakúska
   alebo švajčiarska vlajka je len biela plocha. Ostáva tmavý panel + vlajka ako odznak. */
.comm-chero--noimg{background-image:none;}
.comm-chero--noimg::before{background:linear-gradient(180deg,rgba(245,240,228,0.04) 0%,rgba(0,0,0,0.45) 100%);}
.comm-chero-flag{display:block;width:54px;height:36px;object-fit:cover;border-radius:8px;border:1px solid rgba(245,240,228,0.35);box-shadow:0 4px 14px rgba(0,0,0,0.5);margin-bottom:11px;}
.comm-chero-sel{position:absolute;top:12px;right:12px;z-index:2;}
.comm-chero-sel select{appearance:none;-webkit-appearance:none;background:rgba(3,2,1,0.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(201,154,63,0.55);border-radius:999px;color:#F5F0E4;font-family:${FONT_UI};font-weight:600;font-size:11px;padding:7px 28px 7px 13px;cursor:pointer;}
.comm-chero-sel::after{content:'';position:absolute;right:12px;top:50%;width:6px;height:6px;border-right:1.5px solid rgba(201,154,63,0.9);border-bottom:1.5px solid rgba(201,154,63,0.9);transform:translateY(-70%) rotate(45deg);pointer-events:none;}
.comm-chero-in{position:relative;z-index:1;width:100%;}
.comm-chero-name{font-family:${FONT_TITLE};font-weight:700;font-size:28px;line-height:1;letter-spacing:.07em;text-transform:uppercase;color:#F5F0E4;text-shadow:0 2px 14px rgba(0,0,0,0.7);}
.comm-chero-sub{font-family:${FONT_UI};font-weight:500;font-size:12px;color:rgba(245,240,228,0.85);margin-top:7px;}
.comm-chero-goal{margin-top:11px;max-width:340px;}
.comm-chero-goaltxt{font-family:${FONT_UI};font-weight:500;font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:rgba(245,240,228,0.8);margin-bottom:5px;}
.comm-chero-bar{height:6px;border-radius:999px;background:rgba(245,240,228,0.18);overflow:hidden;}
.comm-chero-bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#F5C73D,#E69E1A);}
@media (max-width:560px){ .comm-chero{min-height:150px;padding:14px;} .comm-chero-name{font-size:22px;} }

/* magistrály = odkazy na detail, žiadny dropdown (#50) */
.comm-jrows{display:flex;flex-direction:column;gap:7px;margin-top:12px;}
.comm-jrow{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:11px 14px;border-radius:11px;border:1px solid ${T.onDarkHair};background:rgba(245,240,228,0.03);font-family:inherit;cursor:pointer;transition:border-color .15s,background .15s;}
.comm-jrow:hover{border-color:${GOLD};background:rgba(201,154,63,0.07);}
.comm-jrow-name{font-family:${FONT_TITLE};font-weight:700;font-size:12.5px;color:${T.onDark};}
.comm-jrow.on .comm-jrow-name{color:${GOLD};}
.comm-jrow-meta{font-family:${FONT_UI};font-weight:500;font-size:10.5px;color:${T.onDarkDim};white-space:nowrap;flex-shrink:0;}
.comm-jrow.on .comm-jrow-meta{color:${UNIT_DONE_COLOR};}

/* zoznam prejdených = viditeľný ovládač, nie holý klikací nadpis (#46) */
.comm-drop{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;margin:20px 0 12px;padding:12px 15px;border-radius:12px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.04);font-family:inherit;cursor:pointer;transition:border-color .15s;}
.comm-drop:hover{border-color:${GOLD};}
.comm-drop-t{font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.04em;color:${GOLD};}
.comm-drop-n{display:flex;align-items:center;gap:8px;font-family:${FONT_UI};font-weight:500;font-size:11px;color:${T.onDarkDim};}
.comm-drop-chev{display:inline-block;width:7px;height:7px;border-right:1.5px solid ${T.onDarkDim};border-bottom:1.5px solid ${T.onDarkDim};transform:translateY(-2px) rotate(45deg);transition:transform .2s;}
.comm-drop.on .comm-drop-chev{transform:translateY(1px) rotate(-135deg);}

@media (max-width:760px){
  .comm-dash-hero{flex-direction:column;text-align:center;gap:14px;}
  .comm-dash-inner{padding-top:calc(env(safe-area-inset-top,0px) + 16px);}
}
`;

// ── modal shell ──────────────────────────────────────────────────────────────────────────────
function Modal({ title, sub, onClose, wide, children }: {
  title: string; sub?: string; onClose: () => void; wide?: boolean; children: React.ReactNode;
}) {
  const t = useT();
  return (
    <div className="comm-overlay" onClick={onClose}>
      <div className={`comm-modal${wide ? ' wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="comm-modal-head">
          <div>
            <div className="comm-modal-title">{title}</div>
            {sub && <div className="comm-modal-sub">{sub}</div>}
          </div>
          <button type="button" className="comm-x" onClick={onClose} aria-label={t('pack.community.closeAriaLabel')}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// clickable rating packy (1..5) — Matej 2026-07-23: „naša packa" = brand Hekypaw (paw.svg,
// jeden väčší prst), NIE generický paw-solid.
function PawInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const t = useT();
  return (
    <div className="comm-paws">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={t('pack.community.pawsAriaLabel', { n })}>
          <img
            src={ICON('paw')}
            alt=""
            style={{
              filter: n <= value ? GOLD_ICON_FILTER : 'brightness(0) invert(1)',
              opacity: n <= value ? 1 : 0.28,
            }}
          />
        </button>
      ))}
    </div>
  );
}

// ── A · Walked popup (povinný po označení „walked") ──────────────────────────────────────────
export interface WalkedInput { rating: number; difficulty: Difficulty; crowd: Crowd; comment: string; when: string; hazards: Hazard[]; }
export function WalkedPopup({ trailName, initial, onSubmit, onClose }: {
  trailName: string; initial?: WalkedInput | null; onSubmit: (v: WalkedInput) => void; onClose: () => void;
}) {
  const t = useT();
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [difficulty, setDifficulty] = useState<Difficulty | ''>(initial?.difficulty ?? '');
  const [crowd, setCrowd] = useState<Crowd | ''>(initial?.crowd ?? '');
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [when, setWhen] = useState(initial?.when ?? '');
  const [hazards, setHazards] = useState<Hazard[]>(initial?.hazards ?? []);
  const toggleHazard = (h: Hazard) => setHazards((prev) => prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]);
  const canSubmit = rating > 0 && difficulty !== '' && crowd !== '';
  // Matej 2026-07-23: „urop popup širší aby sa zmestil na vh 100" → wide modal + 2-stĺpcový
  // layout, nech sa zmestí bez rolovania. Rating hore cez obe kolóny, zvyšok v 2 stĺpcoch.
  return (
    <Modal title={t('pack.community.walkedTitle')} sub={trailName} onClose={onClose} wide>
      <div className="comm-field" style={{ textAlign: 'center' }}>
        <label className="comm-label">{t('pack.community.walkedRatingLabel')}</label>
        <div style={{ display: 'flex', justifyContent: 'center' }}><PawInput value={rating} onChange={setRating} /></div>
      </div>
      <div className="comm-walked-grid">
        <div className="comm-field">
          <label className="comm-label">{t('pack.community.difficultyLabel')}</label>
          <div className="comm-seg">
            {DIFFICULTIES.map((d) => (
              <button key={d} type="button" className={difficulty === d ? 'on' : ''} onClick={() => setDifficulty(d)}>
                <DiffMark diff={d} /> {d}
              </button>
            ))}
          </div>
        </div>
        <div className="comm-field">
          <label className="comm-label">{t('pack.community.crowdLabel')}</label>
          <div className="comm-seg">
            {CROWDS.map((v) => (
              <button key={v} type="button" className={crowd === v ? 'on' : ''} onClick={() => setCrowd(v)}>
                {CROWD_EMOJI[v]} {v}
              </button>
            ))}
          </div>
        </div>
        {/* nebezpečenstvá — multi-select, na tripe sa agregujú ako % (Matej 2026-07-22) */}
        <div className="comm-field">
          <label className="comm-label">{t('pack.community.hazardsLabel')}</label>
          <div className="comm-chips">
            {HAZARDS.map((h) => (
              <button key={h} type="button" className={`comm-chip${hazards.includes(h) ? ' on' : ''}`} onClick={() => toggleHazard(h)}>
                {HAZARD_EMOJI[h]} {h}
              </button>
            ))}
          </div>
        </div>
        {/* dátum benevolentný — stačí rok/mesiac (Matej 2026-07-22) */}
        <div className="comm-field">
          <label className="comm-label">{t('pack.community.whenLabel')}</label>
          <input type="month" className="comm-input" value={when} onChange={(e) => setWhen(e.target.value)} />
        </div>
        <div className="comm-field" style={{ gridColumn: '1 / -1' }}>
          <label className="comm-label">{t('pack.community.commentLabel')}</label>
          <textarea className="comm-textarea" value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('pack.community.commentPlaceholder')} />
        </div>
      </div>
      <button
        type="button"
        className="comm-submit"
        disabled={!canSubmit}
        onClick={() => canSubmit && onSubmit({ rating, difficulty: difficulty as Difficulty, crowd: crowd as Crowd, comment, when, hazards })}
      >
        {initial ? t('pack.community.updateVoteBtn') : t('pack.community.logWalkBtn')}
      </button>
    </Modal>
  );
}

// ── B · Wishlist zámer popup ─────────────────────────────────────────────────────────────────
export function WishlistIntentPopup({ trailName, onSolo, onPartner, onClose }: {
  trailName: string; onSolo: () => void; onPartner: () => void; onClose: () => void;
}) {
  return (
    <Modal title="Save this trip" sub={trailName} onClose={onClose}>
      <div className="comm-choicerow">
        <button type="button" className="comm-choice" onClick={onSolo}>
          <span className="comm-choice-ic"><img src={ICON('paw')} alt="" /></span>
          <span>
            <span className="comm-choice-t">Go solo</span>
            <span className="comm-choice-d">Just save it to your wishlist for later.</span>
          </span>
        </button>
        <button type="button" className="comm-choice" onClick={onPartner}>
          <span className="comm-choice-ic"><img src={ICON('people')} alt="" /></span>
          <span>
            <span className="comm-choice-t">Find a walk buddy</span>
            {/* #42: povedať NAHLAS, čo sa zverejňuje. Doteraz tu stálo len „post a shout" —
                z toho sa nedalo vyčítať, že s trasou ide von aj dátum a pes. Znenie sedí na
                to, čo reálne vydá `user_trips_read_open` + `get_trip_party`. */}
            <span className="comm-choice-d">Your pack sees the trail, the date and your dog — and any member can ask to join. You can switch it back to private in your triplist.</span>
          </span>
        </button>
      </div>
    </Modal>
  );
}

// ── D · Partner ad form (aj z „Plánujem" v ADD flow) — VŽDY public (keď hľadáš parťáka, nemôže
// byť private, Matej 2026-07-22). „Pár slov o mne" ťahá z turistického profilu (jeden zdroj),
// tu sa len zobrazí; editovateľná je len socializácia pre tento výlet. Dátum benevolentný. ──
export interface PartnerAdInput { dates: string[]; month: string; socialization: string; }
export function PartnerAdForm({ trailName, onSubmit, onClose }: {
  trailName: string; onSubmit: (ad: PartnerAdInput) => void; onClose: () => void;
}) {
  const [dates, setDates] = useState<string[]>(['']);
  const [month, setMonth] = useState('');
  // LOCKED 2026-08-03 (Matej: „nesmie sa nič dogenerovať!") — pole štartuje PRÁZDNE.
  // Doteraz sa predvyplnilo MOCK_PROFILE.dog ('chill trail dog, good with everyone') a keďže
  // odtiaľto ide text rovno do verejného inzerátu, appka za člena zverejňovala vetu o psovi,
  // ktorú nikdy nenapísal — a o psovi, ktorého nepozná.
  const [socialization, setSocialization] = useState('');
  const { profile } = useProfile();
  const aboutMe = (profile?.human.dogVoiceBio ?? profile?.human.bio ?? '').trim();
  const setDate = (i: number, v: string) => setDates((prev) => prev.map((d, idx) => (idx === i ? v : d)));
  const addDate = () => setDates((prev) => (prev.length < 3 ? [...prev, ''] : prev));
  const removeDate = (i: number) => setDates((prev) => prev.filter((_, idx) => idx !== i));
  const filledDates = dates.map((d) => d.trim()).filter(Boolean);
  const canSubmit = filledDates.length > 0 || month.trim().length > 0; // aspoň termín ALEBO mesiac
  return (
    <Modal title="Find a walk buddy" sub={`${trailName} · your shout goes public to Events`} onClose={onClose}>
      {/* pár slov o tebe — z profilu, read-only (jeden zdroj naprieč platformou) */}
      <div className="comm-profile">
        <span className="comm-profile-av">🐾</span>
        <span>
          <span className="comm-profile-t">About you (from your profile)</span>
          {/* prázdny profil = prázdny riadok + výzva, NIE vymyslená veta o sebe */}
          <span className="comm-profile-b">{aboutMe || 'Nothing written yet — the pack will see just your name and your dog.'}</span>
          <span className="comm-profile-edit">Edit once in your profile — shows on every shout.</span>
        </span>
      </div>
      <div className="comm-field">
        <label className="comm-label">Suggest a few dates (pick 1–3, or just a month below)</label>
        {dates.map((d, i) => (
          <div key={i} className="comm-daterow">
            <input type="date" className="comm-input" value={d} onChange={(e) => setDate(i, e.target.value)} />
            {dates.length > 1 && <button type="button" onClick={() => removeDate(i)} aria-label="Remove date">×</button>}
          </div>
        ))}
        {dates.length < 3 && <button type="button" className="comm-addbtn" onClick={addDate}>+ Add another date</button>}
      </div>
      <div className="comm-field">
        <label className="comm-label">…or just a month (flexible)</label>
        <input type="month" className="comm-input" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>
      <div className="comm-field">
        <label className="comm-label">Socialization for this walk</label>
        <textarea className="comm-textarea" value={socialization} onChange={(e) => setSocialization(e.target.value)} placeholder="Great with big dogs, a bit shy with small ones…" />
      </div>
      <button type="button" className="comm-submit" disabled={!canSubmit} onClick={() => canSubmit && onSubmit({ dates: filledDates, month, socialization })}>
        Publish to Events
      </button>
    </Modal>
  );
}

// -- ZMAZANE 2026-08-04: DMStub (18 r.) --------------------------------------------------------
// Falosny composer: po odoslani napisal "Sent (mock) - ... will see it once messaging goes live."
// a spravu zahodil. Realny messaging medzitym bezi (pack_conversations, start_dm) -- kazdy, kto
// sa v partii da napisat, ide cez PartyMemberCard `dm` kontext, teda skutocne vlakno.
// Kod je v historii: git log -- src/components/pack/packCommunityUI.tsx

// -- ZMAZANE 2026-08-03: MySlovakiaDashboard (166 r.) a AddModeChoice (22 r.) ----------------
// Ani jeden nemal volajuceho: dashboard od zrusenia vstupu v PackTriplist (2026-07-22),
// AddModeChoice po nahradeni cez AddTripEntry. Boli to obrazovky, ktore sa nedali otvorit.
// Kod je v historii: git log -- src/components/pack/packCommunityUI.tsx
// Vedlajsi efekt, kvoli ktoremu to ide von prave teraz: ~25 slovenskych retazcov menej vo #65.


// ── crowd meta (agregát) — karta (compact) aj inline detail ──────────────────────────────────
function diffTip(agg: CrowdAgg): string { return agg.difficultyBreakdown.map((s) => `${s.pct}% ${s.value}`).join(' · '); }
function crowdTip(agg: CrowdAgg): string { return agg.crowdBreakdown.map((s) => `${s.pct}% ${s.value}`).join(' · '); }
function hazardTip(agg: CrowdAgg): string { return agg.hazardBreakdown.map((s) => `${s.pct}% reported ${s.value}`).join(' · '); }

// crowd agregát na karte/detaile. „N walked" počet sa TU už NEzobrazuje — presunul sa k autorom
// (svorka čo prešla trip + „+N Dogyptians", Matej 2026-07-22). Hazardy (%) len v detaile.
// belowThreshold/walkedCount:0 (2026-08-03, „začíname so všetkým do nuly") necháva
// difficultyBreakdown/crowdBreakdown prázdne — tooltip sa vtedy nedáva (žiadny prázdny
// rámik na hover), zobrazuje sa len seedová hodnota (difficulty/crowd) bez %-rozpadu.
export function CrowdMeta({ agg, km, compact }: { agg: CrowdAgg; km: string; compact?: boolean }) {
  const rSize = compact ? 10 : 15;
  const fs = compact ? 10.5 : 11.5;
  const hasDiffTip = agg.difficultyBreakdown.length > 0;
  const hasCrowdTip = agg.crowdBreakdown.length > 0;
  return (
    <div className={`comm-crowd${compact ? '' : ' detail'}`}>
      {/* rating = 0 znamená ŽIADNY hlas (Matej 2026-08-03: „neprešli = žiadny rating") — labky
          vôbec nevykresľuj, inak sa ukáže „0.0" a prázdna päťka. */}
      {agg.rating > 0 && (
        <span className="comm-crowd-rating" style={{ fontSize: fs }}>
          <RatingPaws stars={agg.rating} size={rSize} gap={compact ? 2 : 4} /> {agg.rating.toFixed(1)}
        </span>
      )}
      <span
        className={`comm-crowd-row${hasDiffTip ? ' comm-hastip' : ''}`}
        style={{ fontSize: fs }}
        data-tip={hasDiffTip ? diffTip(agg) : undefined}
      >
        <DiffMark diff={agg.difficulty} /> {agg.difficulty} · {km} km
      </span>
      {agg.crowd && (
        <span
          className={`comm-crowd-row${hasCrowdTip ? ' comm-hastip' : ''}`}
          style={{ fontSize: fs }}
          data-tip={hasCrowdTip ? crowdTip(agg) : undefined}
        >
          {CROWD_EMOJI[agg.crowd]} {agg.crowd}
        </span>
      )}
      {!compact && agg.hazardBreakdown.length > 0 && (
        <span className="comm-crowd-row comm-hastip comm-crowd-hazard" style={{ fontSize: fs }} data-tip={hazardTip(agg)}>
          ⚠️ {agg.hazardBreakdown.slice(0, 2).map((h) => `${HAZARD_EMOJI[h.value]} ${h.pct}%`).join(' · ')}
        </span>
      )}
    </div>
  );
}
export { VOLUME_THRESHOLD };

// ── BigRating (Matej 2026-07-22) — pravý stĺpec karty/detailu: 1 packa + veľké číslo X.Y.
// Náročnosť/popularita/hazard sa presunuli na fotku (PhotoMetaPills), tu ostáva len rating. ──
export function BigRating({ rating, compact }: { rating: number; compact?: boolean }) {
  // Matej 2026-07-22: „našu packu s jedným väčším prstom, nie random" → brand Hekypaw (paw.svg,
  // jeden zreteľne väčší prst), NIE generický paw-solid. Jedna väčšia packa + číslo.
  return (
    <span className={`comm-bigrating${compact ? ' compact' : ''}`}>
      <img src={ICON('paw')} alt="" style={{ filter: GOLD_ICON_FILTER }} />
      <b>{rating.toFixed(1)}</b>
    </span>
  );
}

// ── PhotoMetaPills — dolný pruh fotky, TRI pilulky vedľa seba (Matej 2026-07-27; predtým dve
// stacknuté v pravom rohu): trasa (↔ km · ↑ m) │ náročnosť │ popularita. Glyfy ↔/↑ sú tie isté
// ako v stat tabuľke článku (PackTripArticle .pta-route) — jeden vizuálny jazyk pre trasu.
// Hazard TU NIE (ten je len v detaile vedľa tagov — HazardTags). Hover na pilulku = %-rozpad
// hlasov členov. Zdieľané karta + inline detail. ──
export function PhotoMetaPills({ agg, km, ascentM }: { agg: CrowdAgg; km: string; ascentM?: number }) {
  // Prázdny breakdown (walkedCount 0, „začíname so všetkým do nuly") → žiadny %-rozpad na
  // ponuku, takže žiadny tooltip (inak by hover ukázal prázdny rámik „Difficulty — ").
  const hasDiffTip = agg.difficultyBreakdown.length > 0;
  const hasCrowdTip = agg.crowdBreakdown.length > 0;
  return (
    <div className="comm-photometa">
      <span className="comm-mpill">
        ↔ {km} km{ascentM != null ? ` · ↑ ${ascentM} m` : ''}
      </span>
      <span
        className={`comm-mpill${hasDiffTip ? ' comm-hastip' : ''}`}
        data-tip={hasDiffTip ? `Difficulty — ${diffTip(agg)}` : undefined}
      >
        <DiffMark diff={agg.difficulty} /> {agg.difficulty}
      </span>
      {agg.crowd && (
        <span
          className={`comm-mpill${hasCrowdTip ? ' comm-hastip' : ''}`}
          data-tip={hasCrowdTip ? `Crowd — ${crowdTip(agg)}` : undefined}
        >
          {CROWD_EMOJI[agg.crowd]} {agg.crowd}
        </span>
      )}
    </div>
  );
}

// ── HazardTags (Matej 2026-07-22) — LEN v inline detaile, vedľa tagov (nie na fotke). Červené
// chipy: koľko % členov nahlásilo dané nebezpečenstvo. Prázdne → nič nevykreslí. ──
export function HazardTags({ agg }: { agg: CrowdAgg }) {
  if (agg.hazardBreakdown.length === 0) return null;
  return (
    <>
      {agg.hazardBreakdown.map((h) => (
        <span key={h.value} className="comm-hazardtag" title={`${h.pct}% of members reported ${h.value}`}>
          {HAZARD_EMOJI[h.value]} {h.value} · {h.pct}%
        </span>
      ))}
    </>
  );
}

// ── CompanionPicker (Matej 2026-07-23) — „kto bol so mnou": jasný + a výber zo SVORKY (moje
// psy, reálne fotky) + iní ČLENOVIA podľa mena. Matej 2026-08-03 „začíname so všetkým do
// nuly" — reálny zoznam členov (`pack_members`) ešte neexistuje, takže autocomplete zo
// zmazaného MOCK_MEMBER_POOL padá: pole je odteraz VOĽNÝ TEXT (Enter pridá napísané meno ako
// chip). Keď raz bude členský adresár, sem príde skutočný lookup + dropdown návrhov.
// Vybraté ako avatar chipy. Zdieľané done aj planning ADD flow. ──
export function CompanionPicker({ myDogs, selected, onChange, onOpenProfile }: {
  myDogs: { id: string; name: string; photo?: string | null }[];
  selected: Companion[];
  onChange: (next: Companion[]) => void;
  onOpenProfile?: (memberId: string) => void; // avatar klik → /pack/u/:id, zatiaľ bez zdroja id (žiadny členský adresár)
}) {
  const [q, setQ] = useState('');
  const selectedKeys = new Set(selected.map((c) => c.key));
  const add = (c: Companion) => { if (!selectedKeys.has(c.key)) onChange([...selected, c]); };
  const remove = (key: string) => onChange(selected.filter((c) => c.key !== key));
  const toggleDog = (d: { id: string; name: string; photo?: string | null }) => {
    const key = `dog-${d.id}`;
    if (selectedKeys.has(key)) remove(key);
    else add({ key, name: d.name || 'My dog', sub: 'your pack', photo: d.photo });
  };
  // Voľný text: Enter pridá napísané meno ako companion chip (žiadny reálny profil za ním).
  const addTyped = () => {
    const name = q.trim();
    if (!name || selectedKeys.has(`member-${name}`)) return;
    add({ key: `member-${name}`, name });
    setQ('');
  };
  return (
    <div>
      {selected.length > 0 && (
        <div className="comm-comp-selected">
          {selected.map((c) => (
            <span key={c.key} className="comm-comp-chip">
              {/* meno reálneho člena bez známeho id nie je klikateľné — žiadny odkaz do prázdna. */}
              <span
                className={`comm-comp-chip-av${c.photo ? '' : ' ph'}`}
                style={c.photo ? { backgroundImage: `url('${c.photo}')` } : undefined}
              >
                {c.photo ? '' : c.name.charAt(0).toUpperCase()}
              </span>
              <b>{c.name}</b>
              <button type="button" onClick={() => remove(c.key)} aria-label={`Remove ${c.name}`}>×</button>
            </span>
          ))}
        </div>
      )}
      {myDogs.length > 0 && (
        <>
          <div className="comm-comp-grouplabel">Your pack</div>
          <div className="comm-comp-pack">
            {myDogs.map((d) => {
              const on = selectedKeys.has(`dog-${d.id}`);
              return (
                <button key={d.id} type="button" className={`comm-comp-dog${on ? ' on' : ''}`} onClick={() => toggleDog(d)}>
                  <span className={`comm-comp-dog-av${d.photo ? '' : ' ph'}`} style={d.photo ? { backgroundImage: `url('${d.photo}')` } : undefined}>
                    {d.photo ? '' : (d.name || 'D').charAt(0).toUpperCase()}
                  </span>
                  <span>{d.name || 'My dog'}</span>
                  {!on && <span className="plus">+</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
      <div className="comm-comp-grouplabel">Add other companions</div>
      <div className="comm-comp-searchwrap">
        <input
          className="comm-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTyped(); } }}
          placeholder="Type a name and press Enter…"
        />
      </div>
    </div>
  );
}


// ── TRIPSTATS V3 pomocníci (issues #46 / #47 / #50) ──────────────────────────────────────────

// #50 — magistrála (unit string zo SK_GEO 'journeys') → slug jej detailu. Detail ako routa
// `/pack/map/:slug` (PackTripArticle: mapa + prevýšenie + komentáre) UŽ EXISTUJE, takže
// štatistika nemá dôvod stavať vlastný rozbaľovací zoznam — klik vedie rovno tam.
const JOURNEY_SLUG: Record<string, string> = Object.fromEntries(HERO_JOURNEYS.map((j) => [j.name, j.id]));

// #46 — ktoré štáty sa v prehľade ukazujú aj bez jediného výletu. Zoznam = krajiny, ktoré vie
// appka rozpoznať z geometrie (COUNTRY_BBOX v countryGeo.ts) + domovská SK. Prázdny štát nie je
// chyba, je to pozvánka: klik naň skončí výzvou „pridaj tam prvý výlet".
const OFFERED_COUNTRIES = ['sk', 'cz', 'pl', 'at', 'hu', 'si', 'de', 'ch', 'it', 'fr'];

// #47 — odznak za krajinu NAMIESTO percenta. Percento krajiny je mätúce: 100 % znamená prejsť
// celé Slovensko, čo nespraví nikto, takže „50 %" nemeria nič, k čomu sa dá dôjsť. Počet
// prejdených výletov áno. Prahy sú tunable na jednom mieste.
const COUNTRY_TIERS: Array<{ trips: number; title: string }> = [
  { trips: 5, title: 'visitor' },
  { trips: 10, title: 'regular' },
  { trips: 20, title: 'specialist' },
  { trips: 40, title: 'native' },
];
function countryTier(trips: number, countryLabel: string) {
  const reached = COUNTRY_TIERS.filter((t) => trips >= t.trips).length;
  const next = COUNTRY_TIERS[reached];
  const from = reached > 0 ? COUNTRY_TIERS[reached - 1].trips : 0;
  return {
    earned: reached > 0 ? `${countryLabel} ${COUNTRY_TIERS[reached - 1].title}` : null,
    next: next ? `${countryLabel} ${next.title}` : null,
    nextAt: next?.trips ?? null,
    pct: next ? Math.min(100, Math.max(0, ((trips - from) / (next.trips - from)) * 100)) : 100,
  };
}

// #46 — cenník do ⓘ popupu. Čísla sa NEPÍŠU ručne: ťahajú sa z bodového enginu (tripPoints.ts),
// inak by popup sľuboval iné hodnoty, než appka pripisuje. Geo objavenia sa zlievajú do jedného
// riadku LEN keď majú rovnakú cenu — keď sa raz rozídu, riadky sa rozpadnú samy.
function pointsLegend(): Array<[string, string]> {
  const geo = [POINTS.range, POINTS.np, POINTS.chko, POINTS.water];
  const rows: Array<[string, string]> = [
    ['Add a trail', `+${POINTS.add}`],
    ['Add a place', `+${POINTS.place}`],
    ['Walk a trail', `+${POINTS.walk}`],
    ['Visit a place', `+${POINTS.visit}`],
    ['Every km walked', `+${POINTS_PER_KM}`],
    ['Every 100 m of climb', `+${POINTS_PER_100M}`],
  ];
  if (geo.every((p) => p === geo[0])) rows.push(['New range, park, protected area or water', `+${geo[0]}`]);
  else rows.push(['New range', `+${POINTS.range}`], ['New national park', `+${POINTS.np}`], ['New protected area', `+${POINTS.chko}`], ['New water', `+${POINTS.water}`]);
  rows.push(
    ['New country', `+${POINTS.country}`],
    ['Rate a trail you walked', `+${POINTS.rate}`],
    ['Complete a collection', `+${POINTS.collection}`],
    ['Long-distance trail', 'fixed price'],
  );
  return rows;
}

// ── C2 · TRIPSTATS panel (Matej 2026-07-23) — obsahové telo bývalého „Walked" tabu, vytiahnuté
// z MySlovakiaDashboard nech ho vie rendrovať aj /pack/map/triplist ako druhá karta. Žiadny
// modal chrome (fixed overlay, close, tabs) ani wishlist — ten splynul do TRIPLISTU. Konzument
// dodá <style>{COMMUNITY_CSS}</style>. completion sa počíta interne z walkedTrails. ──
export function TripStatsPanel({ walkedTrails, walkedKm, onOpenTrip, onAddTrip }: {
  walkedTrails: HeroTrail[];
  walkedKm: number;
  onOpenTrip: (id: string) => void;
  onAddTrip: (region?: string) => void; // klik na jednotku → ADD TRIP pre-filled na dané pohorie/park (Slice A bod 3)
}) {
  const fmtKm = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

  // V3 (#47): vysvedčenie je PER KRAJINU. Delí sa cez trailCountry() — tou istou funkciou triedi
  // výlety mapa, takže sa počty na dvoch povrchoch nemôžu rozísť.
  const byCountry = useMemo(() => {
    const m = new Map<string, HeroTrail[]>();
    for (const tr of walkedTrails) {
      const iso = trailCountry(tr);
      const arr = m.get(iso);
      if (arr) arr.push(tr); else m.set(iso, [tr]);
    }
    return m;
  }, [walkedTrails]);

  // #46 — VŠETKY štáty, nielen prejdené: ponúkané + hocijaký ďalší, kde už výlet je.
  // SK prvá (domovská), potom podľa počtu výletov, zvyšok podľa abecedy.
  const countries = useMemo(() => (
    [...new Set<string>([...OFFERED_COUNTRIES, ...byCountry.keys()])]
      .map((iso) => ({ iso, name: countryName(iso), trips: byCountry.get(iso)?.length ?? 0 }))
      .sort((a, b) => (a.iso === 'sk' ? -1 : b.iso === 'sk' ? 1 : (b.trips - a.trips) || a.name.localeCompare(b.name)))
  ), [byCountry]);

  const [country, setCountry] = useState('sk');
  const cTrails = byCountry.get(country) ?? [];
  const cKm = cTrails.reduce((s, tr) => s + (Number(tr.km) || 0), 0);
  const cName = countryName(country);
  const tier = countryTier(cTrails.length, cName);
  // hero obrázok = reálna fotka z prejdenej trasy v tej krajine; kým tam človek nebol, vlajka
  // ako odznak na tmavom paneli. Žiadny nový kurátorovaný asset — dominanta krajiny je fotka
  // výletu, ktorý tam naozaj má.
  const heroPhoto = cTrails.find((tr) => tr.photos?.[0])?.photos[0];

  // SK taxonómia (pohoria/NP/CHKO/vrcholy/vody) sa počíta LEN zo slovenských výletov — je to
  // slovenský zoznam a cudzí výlet doň aj tak nikdy nič nepridal.
  const completion = useMemo(() => computeCompletion(byCountry.get('sk') ?? []), [byCountry]);
  const countriesTraveled = byCountry.size;
  const peaksDone = completion.categories.find((c) => c.key === 'peaks')?.done ?? [];
  const highest = peaksDone[0] ?? '—';
  // per-unit rozbaliteľný dropdown (Slice A bod 2) — jedna otvorená naraz, identifikovaná
  // kategóriou+menom (rovnaké meno jednotky sa opakuje naprieč kategóriami, napr. „Malé Karpaty"
  // v ranges aj chko).
  const [expanded, setExpanded] = useState<{ cat: GeoCategory; unit: string } | null>(null);
  // Fáza 2 (Matej 2026-07-24): „Trips you walked" schovať za dropdown — pri 60 prejdených
  // tripoch to bol nekonečný zoznam pod celým panelom. Zbalené default, počet v hlavičke.
  const [walkedOpen, setWalkedOpen] = useState(false);
  // #46 — ⓘ pri leveli: čo koľko dáva. Zatvára sa klikom KAMKOĽVEK cez document listener, nie
  // priesvitným backdropom: `.pk-glass` má backdrop-filter, a ten robí z panelu containing block
  // aj pre `position:fixed` deti — backdrop by nepokryl stránku, len panel.
  const [ptsOpen, setPtsOpen] = useState(false);
  useEffect(() => {
    if (!ptsOpen) return;
    const close = () => setPtsOpen(false);
    // až v ďalšom ticku, inak popup zavrie ten istý klik, ktorý ho otvoril
    const t = window.setTimeout(() => document.addEventListener('click', close), 0);
    return () => { window.clearTimeout(t); document.removeEventListener('click', close); };
  }, [ptsOpen]);
  const pickCountry = (iso: string) => { setCountry(iso); setExpanded(null); setWalkedOpen(false); };

  // ── identity header (Slice B, Matej 2026-07-23) — foto svorky + meno svorky + level odznak.
  // usePackIdentity() je vlastný hook call (spec: „TripStatsPanel volá usePackIdentity() priamo"),
  // aj keď PackTriplist (jediný konzument zatiaľ) si ho už volá tiež — dva volania toho istého
  // hooku sú neškodné (rovnaká Supabase session, žiadny side-effect navyše mimo duplicitného
  // fetchu), ale drží TripStatsPanel samostatne použiteľný bez toho, aby identitu musel dostávať
  // cez props.
  const id = usePackIdentity();
  const authMeta = (id.session?.user?.user_metadata ?? {}) as Record<string, unknown>;
  const authFullName = (authMeta.full_name || authMeta.name) as string | undefined;
  const ownerName = id.session?.user?.email
    ? firstNameFrom(id.session.user.email, authFullName)
    : id.avatarInitial;
  const dogNames = id.dogs.map((d) => d.dog_name).filter((n): n is string => !!n);
  const packName = dogNames.length > 0 ? [...dogNames, ownerName].join(' & ') : ownerName;
  // LEVEL z BODOV, nie z počtu tripov (issue #33; lock „level = počet tripov" z 23. 7. padol
  // 25. 7.). Body sa počítajú z toho, čo človek reálne má — prejdené trasy, ich km/stúpanie,
  // pevné ceny magistrál a odškrtnuté geo jednotky. Vďaka tomu sa level nemôže rozísť s dátami.
  // Zdroj cien + krivky = dashboard tab Mapa, sekcia 03/05 (viď src/lib/tripPoints.ts).
  const addedByMe = addedByMeIds(walkedTrails, { ownerName, isFounder: isFounderEmail(id.session?.user?.email) });
  const profilePoints = profilePointsFor(walkedTrails, { addedIds: addedByMe, countries: countriesTraveled });
  const lvl = levelProgress(profilePoints.total);

  return (
    <>
      {/* BLOK 1 — identita svorky + WORLD staty + hero badges zbierka (Matej 2026-07-24: rozdelenie
         jedného veľkého panelu na dva samostatné pk-glass bloky). */}
      <section className="pk-glass tl-panel">
      {/* IDENTITY header — foto svorky (psy + owner, priestor pre budúceho member) + level odznak. */}
      <div className="comm-vhead">
        <div className="comm-vhead-pack">
          {id.dogs.map((dog) => (
            <span key={dog.id} className="comm-vavatar comm-vavatar--dog">
              {dog.cloudinary_main_url ? (
                <img src={dog.cloudinary_main_url} alt={dog.dog_name || ''} />
              ) : (
                <img className="comm-vavatar-fallback" src={ICON('paw')} alt="" />
              )}
            </span>
          ))}
          <span className="comm-vavatar comm-vavatar--owner">
            {id.avatarUrl ? <img src={id.avatarUrl} alt="" /> : id.avatarInitial}
          </span>
          {/* priestor pre budúceho member (Matej: „member prípadne treba tam na to priestor") */}
          <span className="comm-vavatar comm-vavatar--slot" aria-hidden="true">
            <img src={ICON('plus')} alt="" />
          </span>
        </div>
        <div className="comm-vhead-name">{packName}</div>
        {/* #46 — level + progressbar do ďalšieho levelu na celú šírku hlavičky, nie schovaný
            do rohovej pilulky. Percento pruhu aj chýbajúce body dáva levelProgress() z bodového
            enginu; panel si nič nepočíta sám. */}
        <div className="comm-lvlwrap">
          <div className="comm-lvlhead">
            <span className="comm-level-pill">
              <img className="comm-level-ic" src={ICON('trophy')} alt="" />
              {lvl.rank} · Level {lvl.level}
            </span>
            <span className="comm-lvlinfo">
              <button
                type="button"
                className={`comm-lvlinfo-btn${ptsOpen ? ' on' : ''}`}
                onClick={() => setPtsOpen((v) => !v)}
                aria-expanded={ptsOpen}
                aria-label="How points work"
              >i</button>
              {ptsOpen && (
                  <span className="comm-pts" onClick={(e) => e.stopPropagation()}>
                    <span className="comm-pts-eyebrow">How points work</span>
                    {pointsLegend().map(([label, val]) => (
                      <span key={label} className="comm-pts-row">{label}<b>{val}</b></span>
                    ))}
                    {profilePoints.rows.length > 0 && (
                      <>
                        <span className="comm-pts-rule" />
                        <span className="comm-pts-eyebrow">Your points</span>
                        {profilePoints.rows.map((r) => (
                          <span key={r.labelKey} className="comm-pts-row">{t(r.labelKey, r.labelParams)}<b>{r.points}</b></span>
                        ))}
                        <span className="comm-pts-rule" />
                        <span className="comm-pts-tot">Total<b>{profilePoints.total}</b></span>
                      </>
                    )}
                  </span>
              )}
            </span>
          </div>
          <div className="comm-lvlbar"><i style={{ width: `${lvl.pct}%` }} /></div>
          {/* Rebrík nemá strop (rozhodnuté 29. 7.) → žiadny „Top rank" stav, vždy je kam ísť. */}
          <div className="comm-lvlfoot">
            <span>{lvl.points} pts</span>
            <span>{lvl.toNext} pts to Level {lvl.level + 1}</span>
          </div>
        </div>
      </div>

      {/* WORLD prehľad — precestované krajiny/vrch/výlety/km (scope select presunutý do BLOKU 2). */}
      <div className="comm-worldstats">
        <div className="comm-wstat"><b>{countriesTraveled}</b><span>Countries</span></div>
        <div className="comm-wstat"><b>{walkedTrails.length}</b><span>Trips</span></div>
        <div className="comm-wstat"><b>{fmtKm(walkedKm)}</b><span>Km</span></div>
        <div className="comm-wstat"><b style={{ fontSize: highest === '—' ? undefined : 14 }}>{highest}</b><span>Highest point</span></div>
      </div>

      {/* #55 — štyri nuly a deväť zhasnutých odznakov sú konštatovanie bez pokračovania.
          Jedna veta + jedno tlačidlo; mizne hneď po prvom zapísanom výlete. */}
      {walkedTrails.length === 0 && (
        <div className="comm-emptybox" style={{ paddingTop: 8, paddingBottom: 4 }}>
          <p>Nothing walked yet — your first trip starts the record.</p>
          <button type="button" className="comm-emptybtn" onClick={() => onAddTrip()}>Log your first trip</button>
        </div>
      )}

      {/* HERO BADGES — globálna zbierka deviatich hrdinov (trip míľniky, nie per-krajina). */}
      <HeroBadges walkedCount={walkedTrails.length} />
      </section>

      {/* BLOK 2 — VYSVEDČENIE krajiny: všetky štáty s vlajkou (#46) + hero krajiny s dropdownom
         a cieľom v tripoch namiesto percent (#47) + kategórie + zoznam prejdených tripov. */}
      <section className="pk-glass tl-panel" style={{ marginTop: 14 }}>
      {/* #46 — VŠETKY štáty, aj tie bez výletu. Prázdny štát sa dá vybrať a skončí výzvou
         „pridaj tam prvý výlet"; predtým tu bol select s troma natvrdo vypnutými krajinami. */}
      <div className="comm-ctrys">
        {countries.map((c) => (
          <button
            key={c.iso}
            type="button"
            className={`comm-ctry${c.iso === country ? ' on' : ''}${c.trips === 0 ? ' comm-ctry--empty' : ''}`}
            onClick={() => pickCountry(c.iso)}
          >
            <img src={flagUrl(c.iso)} alt="" loading="lazy" draggable={false} />
            <b>{c.name}</b>
            <span>{c.trips > 0 ? `${c.trips} trip${c.trips === 1 ? '' : 's'}` : 'not yet'}</span>
          </button>
        ))}
      </div>

      {/* #47 — hero krajiny: obrázok (fotka z vlastného výletu, inak vlajka), veľký názov vľavo,
         dropdown na inú krajinu vpravo hore. Cieľ je v TRIPOCH, nie v percentách. */}
      <div
        className={`comm-chero${heroPhoto ? '' : ' comm-chero--noimg'}`}
        style={heroPhoto ? { backgroundImage: `url('${heroPhoto}')` } : undefined}
      >
        <div className="comm-chero-sel">
          <select value={country} onChange={(e) => pickCountry(e.target.value)} aria-label="Country">
            {countries.map((c) => (
              <option key={c.iso} value={c.iso}>{flagEmojiFromISO2(c.iso)} {c.name}</option>
            ))}
          </select>
        </div>
        <div className="comm-chero-in">
          {!heroPhoto && <img className="comm-chero-flag" src={flagUrl(country, 160)} alt="" loading="lazy" draggable={false} />}
          <div className="comm-chero-name">{cName}</div>
          <div className="comm-chero-sub">
            {cTrails.length} trip{cTrails.length === 1 ? '' : 's'} · {fmtKm(cKm)} km
            {country === 'sk' ? ` · ${completion.doneUnits}/${completion.totalUnits} places ticked` : ''}
          </div>
          <div className="comm-chero-goal">
            <div className="comm-chero-goaltxt">
              {tier.earned ? `${tier.earned} · ` : ''}
              {tier.next ? `${cTrails.length}/${tier.nextAt} trips to ${tier.next}` : 'every tier taken'}
            </div>
            <div className="comm-chero-bar"><i style={{ width: `${tier.pct}%` }} /></div>
          </div>
        </div>
      </div>

      {country !== 'sk' ? (
        // Zahraničie je zatiaľ PROVIZÓRIUM (#47): žiadna geo taxonómia (pohoria/NP/CHKO sú
        // slovenský zoznam), len počty, km a zoznam. Kým nebude geo dataset pre cudzie krajiny,
        // vymyslený menovateľ by klamal viac než jeho absencia.
        cTrails.length === 0 ? (
          <>
            <div className="comm-empty">No trips in {cName} yet.</div>
            <div className="comm-unit-addrow" onClick={() => onAddTrip()}>＋ Add the first trip in {cName}</div>
          </>
        ) : (
          <>
            <div className="comm-worldstats" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
              <div className="comm-wstat"><b>{cTrails.filter((tr) => tr.acts?.includes('hike')).length}</b><span>Hikes</span></div>
              <div className="comm-wstat"><b>{cTrails.filter((tr) => !tr.acts?.includes('hike')).length}</b><span>Places</span></div>
              <div className="comm-wstat"><b>{fmtKm(cKm)}</b><span>Km</span></div>
            </div>
            <div className="comm-dash-section-title">Trips in {cName}</div>
            {cTrails.map((tr) => (
              <div key={tr.id} className="comm-walkedrow" onClick={() => onOpenTrip(tr.id)}>
                <span className="comm-walkedrow-name">{tr.name}</span>
                <span className="comm-walkedrow-meta">{tr.region} · {tr.km} km</span>
              </div>
            ))}
            <div className="comm-unit-addrow" style={{ marginTop: 12 }} onClick={() => onAddTrip()}>＋ Add a trip in {cName}</div>
          </>
        )
      ) : (
      <>
      {completion.categories.map((c) => {
        // #50 — magistrály sú ODKAZY na svoj detail (/pack/map/:slug), nie rozbaľovací zoznam.
        if (c.key === 'journeys') {
          return (
            <div key={c.key} className="comm-cat">
              <div className="comm-cat-head">
                <img className="comm-cat-ic" src={ICON(c.icon)} alt="" />
                <span className="comm-cat-name">{c.label}</span>
                <span className="comm-cat-count">{c.done.length}/{c.total}</span>
              </div>
              <div className="comm-jrows">
                {SK_GEO_UNITS(c.key).map((u) => {
                  const slug = JOURNEY_SLUG[u];
                  const done = c.done.includes(u);
                  const price = slug ? JOURNEY_POINTS[slug] : undefined;
                  return (
                    <button
                      key={u}
                      type="button"
                      className={`comm-jrow${done ? ' on' : ''}`}
                      disabled={!slug}
                      onClick={() => { if (slug) onOpenTrip(slug); }}
                    >
                      <span className="comm-jrow-name">{u}</span>
                      {/* Pevná cena magistrály stojí na karte od prvého dňa (tripPoints.ts) —
                          nie je to výplata po dokončení, ale vypísaná odmena. */}
                      <span className="comm-jrow-meta">{done ? '✓ walked' : price ? `+${price} pts` : ''} ›</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }
        // ranges = hlavná os (bar + count-pills + dropdown). #47: percento preč, ostáva zlomok
        // odškrtnutých pohorí — to je počet, nie „koľko percent Slovenska mám prejdených".
        if (c.key === 'ranges') {
          const expandedUnit = expanded?.cat === c.key ? expanded.unit : null;
          return (
            <div key={c.key} className="comm-cat">
              <div className="comm-cat-head">
                <img className="comm-cat-ic" src={ICON(c.icon)} alt="" />
                <span className="comm-cat-name">{c.label}</span>
                <span className="comm-cat-pct">{c.done.length}/{c.total}</span>
              </div>
              <div className="comm-cat-bar"><div className="comm-cat-fill" style={{ width: `${c.pct}%` }} /></div>
              <div className="comm-cat-units">
                {SK_GEO_UNITS(c.key).map((u) => {
                  const count = c.counts[u] ?? 0;
                  const cls = count >= UNIT_DONE_THRESHOLD ? ' comm-unit--done' : count >= 1 ? ' comm-unit--started' : '';
                  return (
                    <button
                      key={u}
                      type="button"
                      className={`comm-unit${cls}`}
                      /* Matej 2026-07-24: klik VŽDY otvorí inline dropdown (aj nevysvietené) —
                         nevysvietené ukážu „No trails yet — add one?", NIE skok rovno do ADD formu. */
                      onClick={() => setExpanded((cur) => (cur && cur.cat === c.key && cur.unit === u ? null : { cat: c.key, unit: u }))}
                    >
                      {u}{count > 0 ? ` ×${count}` : ''}
                    </button>
                  );
                })}
              </div>
              {expandedUnit && (() => {
                const matches = cTrails.filter((tr) => (unitsForTrail(tr)[c.key] ?? []).includes(expandedUnit));
                return (
                  <div className="comm-unit-drop">
                    {matches.length > 0 ? (
                      matches.map((tr) => (
                        <div key={tr.id} className="comm-walkedrow" onClick={() => onOpenTrip(tr.id)} style={{ marginBottom: 8 }}>
                          <span className="comm-walkedrow-name">{tr.name}</span>
                          <span className="comm-walkedrow-meta">· {tr.km} km</span>
                        </div>
                      ))
                    ) : (
                      <div className="comm-unit-empty">No trails here yet.</div>
                    )}
                    <div className="comm-unit-addrow" onClick={() => onAddTrip(expandedUnit)}>＋ Add a trip here</div>
                  </div>
                );
              })()}
            </div>
          );
        }
        // parks / chko / peaks / waters = MEDAILY (Matej: „na to sa kliknúť nebude dať bude to
        // len medaila" — žiadny bar, žiadny ×N, žiadny dropdown, neklikacie <div>).
        return (
          <div key={c.key} className="comm-cat">
            <div className="comm-cat-head">
              <img className="comm-cat-ic" src={ICON(c.icon)} alt="" />
              <span className="comm-cat-name">{c.label}</span>
              <span className="comm-cat-count">{c.done.length}/{c.total}</span>
            </div>
            <div className="comm-medals">
              {SK_GEO_UNITS(c.key).map((u) => {
                const earned = c.done.includes(u);
                const logo = c.key === 'parks' ? NP_LOGO[u] : c.key === 'chko' ? CHKO_LOGO[u] : undefined;
                // Biely kruh LEN keď prejdené (Matej 2026-07-24): neprejdené CHKO/park = len vybledne,
                // bez krúžku. Earned CHKO + earned TANAP/Pieniny = biely disk (tmavý text čitateľný, vidno text okolo).
                const onDisc = (c.key === 'chko' || NP_DISC.has(u)) && earned;
                const logoCls = logo
                  ? `comm-medal-ic comm-medal-ic--logo${onDisc ? ' comm-medal-ic--disc' : ''}${NP_BIG.has(u) ? ' comm-medal-ic--big' : ''}`
                  : '';
                return (
                  <div key={u} className={`comm-medal ${earned ? 'comm-medal--on' : 'comm-medal--off'}`}>
                    {logo ? (
                      <div className={logoCls}><img src={`${logo}?v=3`} alt={u} /></div>
                    ) : (
                      <div className="comm-medal-ic"><img src={ICON(c.icon)} alt="" /></div>
                    )}
                    <span className="comm-medal-name">{u}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* #46 — zoznam prejdených ako viditeľný ovládač (rámik + šípka), nie holý zlatý nadpis:
         predtým sa nedalo uhádnuť, že sa to dá rozkliknúť. */}
      {cTrails.length === 0 ? (
        <>
          <div className="comm-dash-section-title">Trips you've walked</div>
          <div className="comm-empty">Log a walk to start ticking places.</div>
        </>
      ) : (
        <>
          <button
            type="button"
            className={`comm-drop${walkedOpen ? ' on' : ''}`}
            onClick={() => setWalkedOpen((v) => !v)}
            aria-expanded={walkedOpen}
          >
            <span className="comm-drop-t">{walkedOpen ? 'Hide' : 'Show all'} {cTrails.length} trip{cTrails.length === 1 ? '' : 's'} you've walked</span>
            <span className="comm-drop-n">{fmtKm(cKm)} km <i className="comm-drop-chev" /></span>
          </button>
          {walkedOpen && cTrails.map((tr) => (
            <div key={tr.id} className="comm-walkedrow" onClick={() => onOpenTrip(tr.id)}>
              <span className="comm-walkedrow-name">{tr.name}</span>
              <span className="comm-walkedrow-meta">{tr.region} · {tr.km} km</span>
            </div>
          ))}
        </>
      )}
      </>
      )}
      </section>
    </>
  );
}

// units za kategóriu — malý helper aby dashboard nemusel importovať celý SK_GEO tvar
function SK_GEO_UNITS(key: GeoCategory): string[] { return SK_GEO.find((c) => c.key === key)?.units ?? []; }

// ── D · Events view (zoznam plánovaných spoločných výletov + join) ────────────────────────────
// "hosted by X" — Matej 2026-08-03 „začíname so všetkým do nuly": bez členského adresára
// (pack_members) niet odkiaľ zobrať profil id pre cudzie meno, takže plain text vždy —
// žiadny odkaz do prázdna. `onOpenProfile` ostáva v props pre budúci reálny lookup.
function HostNameLink({ host }: { host: string }) {
  return <>{host}</>;
}

export function EventsView({ events, trailsById, onJoin, onToggleClosed, onOpenTrip, onOpenProfile, photoFor, onBrowseTrips, myId, onShareTrip }: {
  events: PartnerEvent[];
  trailsById: (id: string) => HeroTrail | undefined;
  onJoin: (id: string) => void;
  onToggleClosed?: (id: string) => void; // zavrieť/otvoriť skupinu — len pre členov skupiny
  onOpenTrip: (id: string) => void;
  onOpenProfile?: (memberId: string) => void; // avatar/host klik → /pack/u/:id — čaká na reálny členský adresár, host v tomto view sám odkaz nevyrába
  photoFor?: (tr: HeroTrail) => string;
  /** #55 — prázdny stav potrebuje akciu; jediná cesta k inzerátu vedie cez trip. */
  onBrowseTrips?: () => void;
  /** moje `auth.uid()`. Inzeráty v tomto paneli sú VŽDY moje, takže som organizátor —
   *  a `start_dm()` bez id organizátora účastníka nenájde (party CTE, 20260803_dm_founder.sql). */
  myId?: string | null;
  /** #55 — prázdna partia potrebuje akciu: pozvať niekoho = zdieľať odkaz na výlet. */
  onShareTrip?: (tripId: string) => void;
}) {
  if (events.length === 0) {
    // ⚠️ Tento zoznam drží LEN MOJE inzeráty — `trip_events` sa ťahá s `.eq('host_id', uid)`
    // a cudzie sa sem zámerne neťahajú (packStore.ts:508). Veta preto nesmie znieť „nikto
    // nič neplánuje" — pack môže mať otvorených výletov koľko chce a tento panel ich nevidí.
    // Cudzie otvorené výlety žijú v Triplist → OPEN TRIPS FROM THE PACK (useOpenTrips.ts).
    return (
      <div className="comm-emptybox">
        <p>You haven’t announced a walk yet. Open a trip, pick “Find a buddy”, and the pack will see it.</p>
        {onBrowseTrips && <button type="button" className="comm-emptybtn" onClick={onBrowseTrips}>Browse trips</button>}
      </div>
    );
  }
  return (
    <>
      {events.map((ev) => (
        <EventCard
          key={ev.id}
          ev={ev}
          tr={trailsById(ev.tripId)}
          onJoin={onJoin}
          onToggleClosed={onToggleClosed}
          onOpenTrip={onOpenTrip}
          onOpenProfile={onOpenProfile}
          photoFor={photoFor}
          myId={myId}
          onShareTrip={onShareTrip}
        />
      ))}
    </>
  );
}

// Jeden inzerát. Vydelené z `EventsView`, lebo partia (`get_trip_party`) je hook — a počet
// „ide N Dogypťanov" musí sedieť s tým, čo rozbalí buddy list. Predtým to bolo `seedGoing`
// (vymyslený počet ostatných) a po purge už len konštantná 1.
function EventCard({ ev, tr, onJoin, onToggleClosed, onOpenTrip, onOpenProfile, photoFor, myId, onShareTrip }: {
  ev: PartnerEvent;
  tr: HeroTrail | undefined;
  onJoin: (id: string) => void;
  onToggleClosed?: (id: string) => void;
  onOpenTrip: (id: string) => void;
  onOpenProfile?: (memberId: string) => void;
  photoFor?: (tr: HeroTrail) => string;
  myId?: string | null;
  onShareTrip?: (tripId: string) => void;
}) {
  const isMine = isMyEvent(ev);
  // partiu vieme dotiahnuť len pre VLASTNÝ inzerát (organizátor = auth.uid(), default v RPC)
  const party = useTripParty(isMine ? ev.tripId : null);
  // organizátor + tí, čo sa reálne pridali. `joiners` organizátora nevracia (useTripParty),
  // takže seba pripočítavam podľa `joinedByMe` — presne ako doteraz, len bez mock zvyšku.
  const going = party.joiners.length + (ev.joinedByMe ? 1 : 0);
  const whenLabel = ev.dates.length > 0 ? ev.dates.join(' or ') : (ev.month ? `${ev.month} (flexible)` : 'Flexible');
  const photo = tr && photoFor ? photoFor(tr) : '';
  return (
    <div className="comm-plan">
      {/* fotka (placeholder podľa aktivity) — plán vyzerá ako bežná karta. Rating = pomlčky
          (výlet sa ešte neodohral → nehodnotený). Matej 2026-07-24. */}
      {photo && (
        <div className="comm-plan-photo" style={{ backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.5)), url('${photo}')` }} onClick={() => onOpenTrip(ev.tripId)}>
          <span className="comm-plan-planned">🗓️ Planned · —</span>
        </div>
      )}
      <div className="comm-plan-top">
        <div>
          <div className="comm-plan-name" onClick={() => onOpenTrip(ev.tripId)} style={{ cursor: 'pointer' }}>{tr?.name ?? 'Planned walk'}</div>
          <div className="comm-plan-meta">
            {whenLabel} · hosted by{' '}
            <HostNameLink host={ev.host} />
            {tr ? ` · ${tr.region}` : ''}
          </div>
        </div>
        {/* Zavretá skupina: inzerát ostáva viditeľný, len sa nedá pridať.
            Kto je vnútri, vidí namiesto toho svoje „✓ Going". */}
        {ev.closed && !ev.joinedByMe ? (
          <button type="button" className="comm-joinbtn closed" disabled>
            🔒 Closed
          </button>
        ) : (
          <button type="button" className={`comm-joinbtn${ev.joinedByMe ? ' joined' : ''}`} onClick={() => onJoin(ev.id)}>
            {ev.joinedByMe ? '✓ Going' : 'Join'}
          </button>
        )}
      </div>
      {ev.socialization && <div className="comm-plan-meta" style={{ marginTop: 8 }}>🤝 {ev.socialization}</div>}
      <div className="comm-plan-people">
        <div className="comm-person">
          {/* host bez známeho profil id (žiadny členský adresár) → statický avatar, nie klik do prázdna */}
          <span className="comm-person-av">
            {ev.host.charAt(0)}
          </span>
          {/* „Message host" tu bolo do 2026-08-04 a otváralo mock composer. Tento panel drží
              VÝHRADNE moje inzeráty (`trip_events` sa ťahá s `.eq('host_id', uid)`), takže
              hostiteľ som ja — `start_dm()` na seba samého vracia null. Písať sa dá tomu,
              kto sa pridal, a to je v buddy liste pod týmto riadkom. */}
          <span className="comm-person-txt"><b>{going}</b> <span>{going === 1 ? 'Dogyptian going' : 'Dogyptians going'}</span></span>
        </div>
        {/* FÁZA 3 — buddy list: „kto ide" už nie je len počet, rozbalí sa na TripProfileCard
            každého účastníka (trip-tier polia, teda presne to, čo o sebe na výlet pustil). */}
        <BuddyList event={ev} party={party} isMine={isMine} myId={myId} onOpenProfile={onOpenProfile} onShareTrip={onShareTrip} />
        {/* Zámok — VÝHRADNE autor inzerátu (Matej 2026-07-25: „close to môže len
            autor tripu nie ten čo sa pridá"), a až keď sú aspoň dvaja. Sám sebe
            skupinu zavrieť nemôžeš — nie je pred kým. */}
        {isMine && going >= 2 && onToggleClosed && (
          <button
            type="button"
            className={`comm-lockbtn${ev.closed ? ' on' : ''}`}
            onClick={() => onToggleClosed(ev.id)}
            style={{ marginTop: 8 }}
          >
            {ev.closed ? '🔒 Closed — reopen' : '🔒 Close to others'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Buddy list (FÁZA 3, prerobené #41) — kto ide na plánovaný výlet, s TripProfileCard
// každého účastníka. PREDTÝM fabrikovalo ľudí z MOCK_MEMBER_POOL pre KAŽDÝ inzerát (aj cudzí
// „Zuzka & Bady" seed). Reálnu partiu (get_trip_party) vieme dotiahnuť LEN pre MOJE VLASTNÉ
// inzeráty — organizátor je tam ja (auth.uid(), default v RPC); demo seed „hostia" nemajú
// reálne uuid, appka pre nich žiadnu skutočnú partiu vytiahnuť nemá odkiaľ. Pre tie namiesto
// vymysleného človeka ide úprimná veta (issue #41, bod 3).
function BuddyList({ event, party, isMine, myId, onShareTrip }: {
  event: PartnerEvent;
  /** partiu ťahá rodič (`EventCard`) — počet „ide N" a tento zoznam musia byť to isté číslo */
  party: TripParty;
  isMine: boolean;
  myId?: string | null;
  onOpenProfile?: (memberId: string) => void;
  onShareTrip?: (tripId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  if (!isMine) {
    return <div className="comm-buddynote">Preview listing — real participants aren't tracked here yet.</div>;
  }
  const members = party.joiners;
  return (
    <div style={{ marginTop: 10 }}>
      <button type="button" className="comm-buddytoggle" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide who’s going' : `See who’s going (${members.length})`}
      </button>
      {open && (
        members.length === 0 ? (
          // #55 — prázdny stav dostal akciu: inzerát je vypísaný, chýba už len to, aby ho
          // niekto videl. Odkaz na výlet je jediná vec, ktorú s tým člen môže spraviť sám.
          <div className="comm-emptybox" style={{ paddingTop: 10, paddingBottom: 4 }}>
            <p>Nobody has joined yet. Your listing is live in the pack — share the trip and someone will.</p>
            {onShareTrip && <button type="button" className="comm-emptybtn" onClick={() => onShareTrip(event.tripId)}>Share this trip</button>}
          </div>
        ) : (
          <div className="flex flex-col gap-2" style={{ marginTop: 10 }}>
            {members.map((m, i) => {
              const cardProps = partyMemberToProfileCardProps(m);
              return (
                <div key={i}>
                  <TripProfileCard {...cardProps} />
                  <div className="flex gap-2" style={{ marginTop: 6 }}>
                    {/* reálne vlákno (`start_dm`) — organizátor som ja, takže adresa je
                        moje uuid + poradové číslo psa účastníka. Bez `myId` server účastníka
                        v party CTE nenájde a tlačidlo sa radšej nevykreslí, než by malo klamať. */}
                    <PartyDmButton member={m} dm={myId ? { tripSlug: event.tripId, organizerId: myId } : undefined} className="comm-msgbtn" />
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
