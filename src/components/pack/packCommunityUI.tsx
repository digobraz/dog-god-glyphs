// /pack komunitné UI komponenty (design: plany/pack-community-features-design.md) — všetky
// popupy/dashboard/events na jednom mieste, aby PackMap.tsx nerástol o ďalších 800 riadkov.
// Brand: tmavé glass pozadie + papyrusové karty + zlaté CTA (Cinzel), rovnaké tokeny ako Portal.
// Fáza UI-first: žiadna perzistencia, všetko dostáva dáta/handlery cez props z PackMap.
import { useEffect, useMemo, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { useMyNotePoints } from '@/components/pack/mapnotes/useMyNotePoints';
import { PACK_THEME, GLASS_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
// Bledý chrome: inkousty a plochy (PALE), lapisové CTA a priesvitný tint výberu.
// Jeden zdroj pre celý /pack — tie isté hodnoty drží bledý skin mapy aj triplist.
import { PALE, LAPIS, LAPIS_BTN_SHADOW, pickTintCSS, PICK_INK } from '@/components/pack/navGoldSkin';
import { HieroglyphBg } from '@/components/pack/PackLayout';
import { ICON, RatingPaws, DiffMark, GOLD_ICON_FILTER, isWaterTrail, hasRouteMetrics } from '@/components/pack/tripShared';
import type { HeroTrail } from '@/data/heroTrails.generated';
import {
  DIFFICULTIES, CROWDS, CROWD_EMOJI, VOLUME_THRESHOLD, SK_GEO, HAZARDS, HAZARD_EMOJI,
  computeCompletion, unitsForTrail, isMyEvent, profilePointsFor, addedByMeIds, isFounderEmail,
  approvedAddedIds, ratedCountFor, readVotes, walkedCountries,
  type Difficulty, type Crowd, type Hazard, type CrowdAgg, type PartnerEvent, type TripPlan,
  type SlovakiaCompletion, type MockPerson, type GeoCategory, type DiscoveryBonus,
} from '@/components/pack/packCommunity';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { usePackStoreEpoch } from '@/hooks/usePackStoreEpoch';
import { PawRating } from '@/components/pack/addtrip/PawRating';
import { PointsPill, POINTS_PILL_CSS } from '@/components/pack/PointsPill';
import { levelProgress, POINTS, POINTS_PER_KM, POINTS_PER_100M, JOURNEY_POINTS, type PointsRow } from '@/lib/tripPoints';
// FAREBNÉ PÁSMA LEVELU — jeden zdroj farby pre celú appku (hlavička mapy, karta na /pack,
// reveal po zápise). TRIPSTATS ich doteraz NEPOUŽÍVAL a mal zlatú pilulku aj zlatý pruh,
// takže vysvedčenie ako jediné neukazovalo, kde človek na ceste stojí.
import { tierVars, tierPillStyle, tierOfLevel } from '@/lib/packTiers';
import { TierScale } from '@/components/pack/level/TierScale';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { trailCountry, flagUrl, flagEmojiFromISO2, countryName } from '@/lib/countryGeo';
import { FlagCircle } from './FlagCircle';
import { HeroBadges } from '@/components/pack/HeroBadges';
import { TripProfileCard, partyMemberToProfileCardProps } from '@/components/pack/profile/TripProfileCard';
import { useProfile } from '@/components/pack/profile/packProfile';
// #41 — reálna partia (get_trip_party), namiesto fabrikovaného MOCK_MEMBER_POOL zoznamu.
// Real len pre MOJE vlastné inzeráty (organizátor = ja) — pozri BuddyList nižšie.
import { useTripParty, type TripParty } from '@/components/pack/triplist/useTripParty';
import { PartyDmButton } from '@/components/pack/triplist/PartyMemberCard';
// CSS tlačidla injectuje PackMap.tsx (a EventsPanel) — komunitné karty žijú vnútri nich.
import { DeleteButton } from '@/components/pack/DeleteButton';

// ── Companion (Matej 2026-07-23) — vybratý spoločník do „kto bol so mnou": môj pes (zo svorky,
// reálna cloudinary fotka) alebo iný člen (mock, initial avatar). key = unikát pre dedup/remove. ──
export interface Companion { key: string; name: string; sub?: string; photo?: string | null; }

const T = PACK_THEME;
const GOLD = '#C99A3F';
const INK = '#1F1A0E';
// skratka do CSS literálu — rgba čísla bledého chrome sa nemajú opisovať po súboroch
const P = PALE;
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
// ⚠️ Tie isté DVA STAVY na PAPYRUSE (DRAK → BRIGHT, 2026-09-01). Dvojica vyššie je robená
// na čiernu dosku; na piesku z nej ostane svetlý fliačik. Nie sú to nové farby — je to ten
// istý význam v tmavom inkouste, presne ako to rieši pickTintCSS pre chipy.
const UNIT_DONE_INK = PICK_INK.green;
const UNIT_STARTED_INK = '#7A5410';

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
/* ════════════════════════════════════════════════════════════════════════════
   DRAK → BRIGHT (2026-09-01) — TRIPSTATS, WalkedPopup a EventsView do bledého šatu.
   ────────────────────────────────────────────────────────────────────────────
   Tento súbor obsluhuje TRI povrchy naraz: TRIPSTATS (vysvedčenie na
   /pack/map/triplist), WalkedPopup (článok + mapa) a EventsView (mapa).
   Prezlečené sú VŠETKY TRI (podujatia dobehli 1. 9. večer, 2. beh).
   Tmavá ostáva už len sada .comm-comp-* (kto bol so mnou, v ADD toku) — rieši sa
   vo vlastnom behu; tmavá na neprezlečenom povrchu NIE JE bug, len nevykonaná
   práca (zoznam: plany/zadanie-drak-bright-pack-2026-09-01.md).
   Inkousty a plochy bledého chrome berieme z PALE (navGoldSkin.ts) — tie isté
   hodnoty drží bledý skin mapy, takže sa dve obrazovky nemôžu rozísť.
   ⚠️ Toto je template literál — v komentároch ŽIADNE spätné apostrofy.
   ════════════════════════════════════════════════════════════════════════════ */
/* ── modal shell (walked / wishlist / partner ad / DM) ──
   Panel = úroveň 4 matrice (PACK_BOX.panel): papyrusový gradient, 1.5px zlatý rám,
   radius 14, panelShadow. Bez backdrop-filter — rozmazávať sa má závoj pod panelom,
   nie panel sám. */
.comm-overlay{position:fixed;inset:0;z-index:1200;background:rgba(3,2,1,0.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;}
.comm-modal{width:100%;max-width:420px;max-height:calc(100dvh - 40px);overflow-y:auto;background:${T.panelGrad};border:1.5px solid ${T.cardEdge};border-radius:14px;box-shadow:${T.panelShadow};padding:24px;}
.comm-modal.wide{max-width:640px;}
/* Matej 2026-08-06 („konsolidujeme zjednodušujeme"): nadpis je CENTROVANÝ a nesie priamo názov
   tripu — dvojica „OHODNOŤ A ZÍSKAJ BODY" + podnadpis s názvom bola dva riadky na to isté.
   ⚠️ BOČNÝ PADDING 0 40px ZANIKOL SPOLU S KRÍŽIKOM (2026-09-01). Držal dlhý názov mimo
   tlačidla, ktoré tam už nie je — panel podľa locku z 28. 8. krížik nemá (von sa ide klikom
   mimo alebo Esc), takže by rezerva len zbytočne zužovala nadpis. */
.comm-modal-head{position:relative;display:flex;align-items:flex-start;justify-content:center;gap:12px;margin-bottom:18px;}
.comm-modal-title{font-family:${FONT_TITLE};font-weight:700;font-size:18px;color:${P.ink};line-height:1.25;text-align:center;}
.comm-modal-sub{font-size:12px;color:${P.dim};margin-top:4px;text-align:center;}
.comm-field{margin-bottom:18px;}
.comm-label{display:block;font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:${P.deep};margin-bottom:9px;}

/* rating packy (klikateľné) žijú v PawRating (addtrip/PawRating.tsx) — vlastné inline štýly. */

/* ── ODMENA PO ✓ (2026-08-05, zadanie §3b) — béžová = zarobené nohami, zlatá = objavenie.
   Dve farby, dva druhy bodov. Blok sedí HORE v popupe, nad ponukou hodnotenia: najprv sa
   dozvieš, čo ti padlo, až potom ťa appka o niečo prosí. */
/* ODMENA = PAPYRUSOVÝ BLOK (Matej 2026-08-06: „tieto body sa mi stále nepáčia nie je to dobre
   zvýraznené… skúsme to dať do bežoveho pozadia… urob to krajšie a vizuálnejšie aj
   pochopiteľnejšie"). Predtým bol blok tmavý (rgba(245,240,228,0.05)) a jediná svetlá vec v ňom
   bola béžová pilulka — číslo tak plávalo bez ukotvenia.
   ⚠️ OD 1. 9. 2026 JE TO PODBLOK (úroveň 2), NIE KARTA. Kým bol modal tmavý, bola karta
   správna — bola v ňom jediná svetlá plocha. Odkedy je papyrusový celý panel, sú to dve
   rovnaké karty v sebe a matricový tieň karty (0 14px 44px čiernej + halo ring) urobí okolo
   odmeny tmavý prstenec. Úroveň 2 = panelGrad, 1px rám, radius 12, jemný lift. */
.comm-reward{display:flex;flex-direction:column;gap:10px;margin-bottom:18px;padding:15px 16px;border-radius:12px;background:${T.panelGrad};border:1px solid ${T.cardEdge};box-shadow:0 1px 3px rgba(122,90,42,0.10),inset 0 1px 0 rgba(255,255,255,0.40);}
.comm-reward-eyebrow{font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.26em;text-transform:uppercase;color:${T.cardEdge};}
.comm-reward-row{display:flex;align-items:center;gap:11px;min-width:0;}
.comm-reward-txt{font-family:${FONT_UI};font-weight:600;font-size:12.5px;color:${T.inkStrong};min-width:0;overflow:hidden;text-overflow:ellipsis;}
/* Bonusový riadok je „objav" — meno jednotky nesie väčšiu váhu než druh objavenia.
   Na papyruse ide inkoust, nie svetlý text; druh objavenia ostáva zlatý (drží aj na bledom). */
.comm-reward-row--bonus .comm-reward-txt{color:${T.inkStrong};}
/* ROZPAD ZÁKLADU — odsadený POD pilulku, nie vedľa nej: je to vysvetlivka k číslu nad ním,
   nie ďalšia odmena. Preto žiadne pilulky, len holé čísla v tlmenom inkouste — inak by
   „5 · 11 · 10" vyzeralo ako tri ďalšie výplaty popri +26. */
/* ⚠️ zvislá čiara NESMIE byť ${'T.rule'} — ten je gradient, a border:2px solid <gradient> je
   neplatné CSS, ktoré prehliadač ticho zahodí (čiara by zmizla bez chyby). Preto vyblednutá
   zlatá ako plná farba. */
.comm-reward-break{display:flex;flex-direction:column;gap:3px;margin:-4px 0 0 8px;padding-left:11px;border-left:2px solid rgba(201,154,63,0.45);}
.comm-reward-breakrow{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-family:${FONT_UI};font-weight:500;font-size:11px;color:${T.inkWarm};}
.comm-reward-breakrow b{font-weight:600;color:${T.inkStrong};font-variant-numeric:tabular-nums;white-space:nowrap;}
.comm-reward-unit{font-family:${FONT_TITLE};font-weight:700;}
.comm-reward-kind{display:block;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${T.cardEdge};margin-top:2px;}
/* deliaca čiara vnútri bledej karty = zlatá, vyblednutá do strán (lock z Entry.tsx),
   NIE šedý hairline. Oddeľuje „čo už padlo" od „čo ešte môžeš získať". */
.comm-reward-rule{height:2px;border:0;margin:2px 0 0;background:${T.rule};}
.comm-reward-next{display:flex;align-items:center;gap:10px;min-width:0;}
.comm-reward-nexttxt{font-family:${FONT_UI};font-weight:500;font-size:11.5px;line-height:1.35;color:${T.inkWarm};min-width:0;}

/* WalkedPopup 2-stĺpcový layout (Matej 2026-07-23 — širší popup, zmestí sa na výšku bez rolovania) */
.comm-walked-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 20px;}
@media (max-width:560px){ .comm-walked-grid{grid-template-columns:1fr;} }

/* segmented choice (difficulty / crowd) — VÝBER = PRIESVITNÝ LAPISOVÝ TINT (lock 2026-08-26).
   Plná farebná plocha je vyhradená jedinému hlavnému CTA panela (ODOSLAŤ). */
.comm-seg{display:flex;gap:8px;}
.comm-seg button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:10px;border:1px solid ${P.border};background:${P.soft};color:${P.ink};font-family:inherit;font-size:12px;cursor:pointer;transition:all .15s;white-space:nowrap;}
.comm-seg button:hover{border-color:${T.cardEdge};background:#FFFDF6;}
.comm-seg button.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.14)}font-weight:600;}

/* ⚠️ 16 px = strop proti iOS zoomu dokumentu (feedback_dogypt_form_input_recurring_bugs).
   Týka sa aj poľa „kto bol so mnou" v pridávaní výletu — pri 13 px sa pri kliknutí do neho
   priblížil celý dokument a spodné ovládanie mapy vypadlo mimo obrazovky. */
/* Písacie pole = .pf-field--flat recept: PLOCHÁ papyrusová výplň, jeden zlatý rám, tmavý
   inkoust. Priesvitná biela (starý recept) na svetlom podklade nekreslí nič.
   Zaostrenie je LAPIS — je to moja akcia, nie konštrukcia. */
.comm-textarea,.comm-input,.comm-selectinput{width:100%;min-width:0;max-width:100%;box-sizing:border-box;background:${P.field};border:1px solid ${P.border};border-radius:8px;padding:10px 12px;color:${P.ink};font-family:inherit;font-size:16px;outline:0;resize:vertical;color-scheme:light;}
.comm-textarea:focus,.comm-input:focus,.comm-selectinput:focus{border-color:${LAPIS.edge};box-shadow:0 0 0 3px ${LAPIS.halo};}
.comm-textarea{min-height:66px;}

/* HLAVNÉ CTA PANELA = LAPIS (brandový kánon 2026-08-28). Geometria (radius 8) je z locku
   .btn-gold — zmena farby nie je povolenie na iný tvar. */
.comm-submit{width:100%;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:14px;border-radius:8px;background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.deep};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;}
.comm-submit:hover:not(:disabled){background:${LAPIS.gradHover};}
/* ⚠️ NEDOSTUPNÉ CTA SA NA PAPYRUSE NEROBÍ KRYTÍM. opacity:.4 na plnom lapise dá levanduľovú
   škvrnu, na ktorej zlaté písmo zmizne — svetlý podklad zabíja všetko postavené na
   priesvitnosti. Vypnuté tlačidlo je preto plochý papyrus s tlmeným inkoustom: vidno, že
   je vypnuté, a vidno, čo je na ňom napísané.
   → [[feedback_svetly_povrch_zabija_priesvitnost]] */
.comm-submit:disabled{background:rgba(42,22,8,0.06);border-color:${P.hair};color:${P.faint};box-shadow:none;cursor:default;}
/* „Teraz nie" je rovnocenná ponuka, nie akcia — papyrusový outline, nie druhá plná farba. */
.comm-ghostbtn{width:100%;margin-top:9px;font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.05em;text-transform:uppercase;padding:11px;border-radius:8px;background:${P.soft};color:${P.ink};border:1px solid ${P.border};cursor:pointer;}
.comm-ghostbtn:hover{border-color:${T.cardEdge};color:${P.deep};background:#FFFDF6;}


/* multi-select chips (hazards, atď.) — hrozba je červená, lebo červená TU nesie význam
   (nie je to voľba farby): označený hazard je varovanie pre ostatných. */
.comm-chips{display:flex;flex-wrap:wrap;gap:7px;}
.comm-chip{padding:7px 12px;border-radius:999px;border:1px solid ${P.border};background:${P.soft};color:${P.ink};font-family:inherit;font-size:12px;cursor:pointer;transition:all .15s;white-space:nowrap;}
.comm-chip:hover{border-color:${T.cardEdge};background:#FFFDF6;}
.comm-chip.on{${pickTintCSS('#B25640', PICK_INK.red, 0.14)}font-weight:600;}


/* ── crowd meta (agregát na karte + inline detaile) ── */
.comm-crowd{display:flex;flex-direction:column;align-items:flex-end;gap:4px;}
.comm-crowd.detail{gap:6px;}
.comm-crowd-rating{display:inline-flex;align-items:center;gap:5px;font-family:${FONT_UI};font-weight:600;color:${GOLD};}
.comm-crowd-row{display:inline-flex;align-items:center;gap:5px;color:rgba(245,240,228,0.6);white-space:nowrap;}
.comm-crowd-count{font-size:9.5px;color:${T.onDarkDim};font-style:italic;white-space:nowrap;}
.comm-crowd-seed{font-size:9px;color:${GOLD};opacity:.7;letter-spacing:.04em;text-transform:uppercase;}

/* ── BigRating (Matej 2026-07-22): pravý stĺpec karty/detailu = LEN 1 packa + veľké číslo X.Y,
   ostatné (náročnosť/popularita/hazard) sa presunuli na fotku ako PhotoMetaPills. ── */
/* Rad sa zalomí, keď je stĺpec úzky — päť packiek s číslom a zátvorkou je širšie než jedna
   ikonka, ktorá tu stála predtým. Zarovnanie doprava drží celý blok pri hrane karty. */
.comm-bigrating{display:inline-flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:4px 7px;}
.comm-bigrating b{font-family:${FONT_UI};font-weight:600;font-size:26px;color:${GOLD};line-height:1;}
/* Počet hlasov je poznámka k číslu, nie druhé číslo — najmenší stupeň, bez kurzívy navyše. */
.comm-bigrating i{font-style:normal;font-family:${FONT_UI};font-weight:500;font-size:11px;color:${T.onDarkDim};line-height:1;}
.comm-bigrating.compact b{font-size:20px;}
.comm-bigrating.compact i{font-size:10px;}
/* mini = podpisový riadok karty (autor + hodnotenie). Nezalamuje sa: je to jedna poznámka,
   nie stĺpec — pri zalomení by odtlačila meno autora do druhého riadku. */
.comm-bigrating.mini{flex-wrap:nowrap;gap:0 5px;}
/* Matej 2026-08-26: „hodnotenie o 10 % zväčši" — podpis vedľa klesol na 12 px, takže hodnotenie
   musí zostať tým, čo v riadku vedie. 12 → 13,2 px, labky 10 → 11 px, počet hlasov 9 → 10 px. */
.comm-bigrating.mini b{font-size:13.2px;}
.comm-bigrating.mini i{font-size:10px;}

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

/* ⚠️ SHELL ZRUŠENÉHO DASHBOARDU „My Slovakia" ZMAZANÝ 2026-09-01.
   .comm-dash / -inner / -head / -title / -hero / .comm-ring / -herotxt / -tabs / -tab
   nekreslil od 23. 7. 2026 nikto — dashboard nahradil TripStatsPanel na /pack/map/triplist
   (viď hlavička PackTriplist.tsx: „bývalý Trippin dashboard modal, ktorý je TÝMTO zrušený").
   Overené grepom cez všetky className v src: jediná žijúca trieda z tejto rodiny je
   .comm-dash-section-title nižšie. Prezliekať mŕtvy tmavý shell do papyrusu by znamenalo
   nechať v súbore recept, ktorý niekto raz skopíruje pre nový povrch.

/* IDENTITY header = PAPYRUSOVÝ BLOK (Matej 2026-08-06: „BLOK s profilom dajme do papyrusovej
   nech vynikne a pils dajme vedla nie pod, ikonku info daj do horneho praveho rohu").
   Predtým to bolo tmavé sklo v tmavom paneli — profil sa vizuálne nelíšil od štatistík pod ním.
   "position:relative" je kvôli info tlačidlu v rohu.
   ⚠️ OD 1. 9. 2026 JE TO PODBLOK (úroveň 2 matrice), NIE KARTA. Kým bol panel okolo neho
   tmavý, bola karta (úroveň 1) správna — bola jediná svetlá vec na doske. Odkedy je celý
   panel papyrusová karta, sú to dve rovnaké karty v sebe: rovnaký gradient, rovnaký rám,
   a matricový tieň (0 14px 44px čiernej + halo ring) z toho urobí tmavý mrak vnútri svetlého
   bloku. Úroveň 2 = panelGrad, 1px rám, radius 12, jemný lift. */
.comm-vhead{position:relative;display:flex;align-items:center;gap:16px;flex-wrap:wrap;background:${T.panelGrad};border:1px solid ${T.cardEdge};border-radius:12px;box-shadow:0 1px 3px rgba(122,90,42,0.10),inset 0 1px 0 rgba(255,255,255,0.40);padding:18px 20px;margin-bottom:22px;}
.comm-vhead-pack{display:flex;align-items:center;flex-shrink:0;}
/* prstenec okolo avatara = farba PODKLADU, nie čierna stránka — na papyruse by čierny krúžok
   vyzeral ako dier(k)a. T.card je plná papyrusová, T.cardGrad by sa v box-shadow nedal použiť. */
.comm-vavatar{width:48px;height:48px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid ${T.cardEdge};box-shadow:0 0 0 3px ${T.card};background:rgba(201,154,63,0.12);margin-left:-14px;}
.comm-vhead-pack .comm-vavatar:first-child{margin-left:0;}
.comm-vavatar img{width:100%;height:100%;object-fit:cover;display:block;}
.comm-vavatar img.comm-vavatar-fallback{width:18px;height:18px;object-fit:contain;filter:none;opacity:.6;}
.comm-vavatar--owner{background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);font-family:${FONT_UI};font-weight:600;font-size:16px;color:${INK};}
/* .comm-vavatar--slot (prerušovaný „+" krúžok = priestor pre budúceho member, Matej 23. 7.)
   ZMAZANÝ 2026-08-05 — Matej: „to plus daj preč tu sa psy nebudú pridávať". */
/* MENO + PILULKA V JEDNOM RADE (Matej 2026-08-06: „pils dajme vedla nie pod"). Meno berie
   zvyšok šírky, pilulka sa nezmenší; "padding-right" drží text mimo info tlačidla v rohu. */
.comm-vhead-id{flex:1;min-width:180px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding-right:30px;}
/* vlajky precestovaných krajín — trofej, ktorá rastie. Krúžok má vlastný zlatý rám z FlagCircle,
   takže tu ide len o rozostup, klikateľnosť a zvýraznenie práve zvolenej krajiny. */
.comm-vflags{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;}
.comm-vflag{display:inline-flex;padding:0;border:0;background:none;cursor:pointer;border-radius:50%;line-height:0;transition:transform .15s;}
.comm-vflag:hover{transform:translateY(-1px);}
/* zvolená krajina = zlatý prstenec OKOLO krúžku (box-shadow, nie border — border by vlajku
   zmenšil a rad by poskakoval pri každom prepnutí). */
.comm-vflag.on{box-shadow:0 0 0 2px ${T.card},0 0 0 4px ${GOLD};}

.comm-vhead-name{font-family:${FONT_TITLE};font-weight:700;font-size:16px;color:${T.inkStrong};min-width:0;}
/* Výplň, inkoust a rám dodáva tierPillStyle(level) inline — tu ostáva len tvar. Pilulka je
   TLAČIDLO (otvára škálu pásiem), takže potrebuje reset kurzora a rodinu písma. */
.comm-tierwrap{position:relative;display:inline-flex;flex-shrink:0;}
.comm-level-pill{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(250,244,236,0.3);border-radius:999px;padding:7px 14px;font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;flex-shrink:0;cursor:pointer;transition:filter .15s;}
.comm-level-pill:hover{filter:brightness(1.06);}
/* Ikonka DEDÍ inkoust pásma cez masku — pri tmavých pásmach (karneol, cyprus, lapis, ametyst)
   je tier.ink svetlý a čierny filter by z pohára spravil dieru. */
.comm-level-ic{width:14px;height:14px;flex-shrink:0;background:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat;}
/* JEDINÝ VÝKLAD LEVELU — plávajúci PANEL (úroveň 4 matrice) pod pilulkou (Matej 1. 9. 2026:
   „spojiť dva popupy na hlavičke do jedného ako na mape"). Nesie ŠKÁLU PÁSIEM aj CENNÍK
   BODOV, teda to isté a v tom istom poradí ako LevelPanel na mape.
   ⚠️ max-height NIE 70vh a ani holé 52vh: popup začína ~300 px pod horným okrajom okna (visí
   pod hlavičkou profilu), takže percento z celého okna mu preteká POD spodok — a vnútorný
   overflow s tým nič nespraví, lebo neoreže ho vlastná výška, ale viewport. Presne takto bola
   sekcia "Country ranks" neviditeľná. Preto sa tá rezerva odpočíta rovno vo vzorci; 320 px je
   podlaha, aby na nízkom okne ostal popup použiteľný. Odkedy nesie OBA výklady (1. 9.), by
   pevných 52vh znamenalo, že sa k vlastným bodom vždy musí rolovať.
   ⚠️ Šírka je 520, nie 340 — dvojstĺpcový cenník sa do úzkeho popupu nezmestí; pod 560 px
   padá na jeden stĺpec sám (media query pri .comm-pts-cols). */
.comm-tiers{position:absolute;top:calc(100% + 9px);left:0;z-index:32;width:min(520px,88vw);max-height:max(320px,calc(100vh - 300px));overflow-y:auto;overscroll-behavior:contain;text-align:left;cursor:default;text-transform:none;letter-spacing:normal;background:${T.panelGrad};border:1.5px solid ${T.cardEdge};border-radius:14px;box-shadow:${T.panelShadow};padding:14px 15px;}
@media (max-width:560px){
  .comm-vhead{padding:14px 16px;gap:12px;}
  .comm-vhead-name{font-size:14px;}
  /* ⚠️ NA ÚZKOM OKNE SA POPUP KOTVÍ NA BLOK, NIE NA PILULKU. Pilulka začína ~145 px od ľavého
     okraja, takže popup široký 88vw jej spod pravého okraja vytiekol z obrazovky (bolo to tak
     aj pri pôvodných 340 px — zväčšenie na 520 to len zviditeľnilo). Zrušením position:relative
     na obale sa najbližším ukotveným predkom stáva .comm-vhead a popup dostane šírku bloku. */
  .comm-tierwrap{position:static;}
  .comm-tiers{left:16px;right:16px;width:auto;}
}

/* svetový prehľad — easy dashboard (Matej 2026-07-23).
   Dlaždica = PODBLOK (úroveň 2): papyrusový gradient, plný zlatý rám, jemný lift pri hoveri.
   Ten istý recept, aký nesie tabuľka čísel v článku výletu (.pta-stat) a dlaždice DOG ID —
   plochá výplň so slabým rámom (úroveň 3) je „suché bez šťavy" a Matej ju na sekcii
   zamietol dvakrát. Číslo je Space Grotesk (dáta), popisok zlatý eyebrow. */
/* ── 1. 9. 2026 (Matej: „krajiny vylety a km a highest point by som dal tiež nejak pekne,
   zaujímavo") ────────────────────────────────────────────────────────────────────────
   Tri veci, žiadna z nich nová farba:
     · číslo je VÄČŠIE (24 → 30) a dostalo tabulárne číslice, aby štyri dlaždice vedľa seba
       stáli na jednej optickej linke a nepohybovali sa pri zmene hodnoty
     · medzi číslom a popiskom je krátka ZLATÁ LINKA (ten istý vyblednutý gradient ako
       deliaca čiara karty, len 26 px) — dlaždica tým dostane os, na ktorej číslo visí
     · hover dvíha a pridáva zlaté halo, teda to isté správanie ako dlaždice DOG ID */
.comm-worldstats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:8px;}
.comm-wstat{background:${T.panelGrad};border:1.5px solid ${T.cardEdge};border-radius:14px;box-shadow:0 1px 3px rgba(122,90,42,0.10),inset 0 1px 0 rgba(255,255,255,0.40);padding:18px 12px 15px;text-align:center;transition:transform .2s ease,box-shadow .2s ease;}
.comm-wstat:hover{transform:translateY(-2px);box-shadow:0 0 0 3px rgba(201,154,63,0.22),0 1px 3px rgba(122,90,42,0.10);}
.comm-wstat b{display:block;font-family:${FONT_UI};font-weight:600;font-size:30px;font-variant-numeric:tabular-nums;color:${P.ink};line-height:1;}
/* ⚠️ NAJVYŠŠÍ BOD JE MENO MIESTA, NIE ČÍSLO — a typografický lock hovorí, že identitu
   (názvy miest) nesie Cinzel, kým dáta nesie Space Grotesk. Do 1. 9. tu stálo meno vrcholu
   v Space Grotesku so zmenšeným písmom cez inline style, takže sa v rade štyroch dlaždíc
   čítalo ako pokazené číslo. */
.comm-wstat--name b{font-family:${FONT_TITLE};font-weight:700;font-size:17px;line-height:1.15;letter-spacing:.01em;}
.comm-wstat span{display:block;font-family:${FONT_UI};font-weight:500;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:${T.cardEdge};margin-top:9px;padding-top:9px;position:relative;}
/* krátka zlatá linka nad popiskom — vyblednutá do strán, teda tá istá technika ako T.rule,
   len na 26 px. Border-top by kreslil ostrý predel cez celú šírku dlaždice. */
.comm-wstat span::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:26px;height:2px;background:${T.rule};}
@media (max-width:560px){ .comm-worldstats{grid-template-columns:repeat(2,1fr);} .comm-wstat b{font-size:26px;} }

.comm-cat{background:${T.panelGrad};border:1px solid ${T.cardEdge};border-radius:12px;box-shadow:0 1px 3px rgba(122,90,42,0.10),inset 0 1px 0 rgba(255,255,255,0.40);padding:16px 18px;margin-bottom:12px;}
/* klikateľná geo kategória → ADD TRIP (Matej 2026-07-23): button reset + hover. */
.comm-cat--click{display:block;width:100%;text-align:left;cursor:pointer;font-family:inherit;transition:border-color .15s;}
.comm-cat--click:hover{border-color:${P.deep};background:#FFFDF6;}
.comm-cat-head{display:flex;align-items:center;gap:10px;margin-bottom:11px;}
/* zbaliteľná hlavička (magistrály) — vyzerá ako ostatné hlavičky kategórií, len je klikacia
   a nesie šípku. "width:100%" + "margin:0" prebíjajú default <button>, aby zavretá kategória
   nemala pod sebou dieru po "margin-bottom". */
.comm-cat-head--btn{width:100%;background:none;border:0;padding:0;font-family:inherit;text-align:left;cursor:pointer;margin-bottom:0;}
.comm-cat-head--btn.on{margin-bottom:11px;}
.comm-cat-head--btn:hover .comm-cat-name{color:${P.deep};}
.comm-cat-head--btn .comm-drop-chev{flex-shrink:0;transition:transform .2s;}
.comm-cat-head--btn.on .comm-drop-chev{transform:translateY(1px) rotate(-135deg);}
/* ⚠️ .comm-cat-ic ZMAZANÉ 2026-09-01 — Matej: „radšej daj preč ikonky pri blkoch (national
   parks mountain ranges atd…)". Ikonka pred nadpisom nič nerozlišovala (vrstvy, strom, labka,
   pohár, vlnky sa pri sebe čítali ako ozdoba) a v každom bloku pridávala druhý tvar do riadku,
   ktorý má niesť jedno slovo a jedno číslo. c.icon v SK_GEO ostáva — kreslí sa ním MEDAILA
   v kategóriách bez loga (vrcholy, vody). */
.comm-cat-name{font-family:${FONT_TITLE};font-weight:700;font-size:13px;color:${P.ink};flex:1;}
.comm-cat-pct{font-family:${FONT_UI};font-weight:600;font-size:13px;color:${P.deep};}
/* koľajnica pruhu = tmavý inkoust s nízkou alfou (ako .comm-lvlbar). Svetlá koľajnica by
   na papyruse zmizla a pruh by vyzeral, akoby začínal odnikiaľ. */
.comm-cat-bar{height:7px;border-radius:999px;background:rgba(42,22,8,0.14);overflow:hidden;}
.comm-cat-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#F5C73D,#E69E1A);transition:width .4s;}
/* ⚠️ .comm-walkedhead / -n ZMAZANÉ 2026-09-01 — nahradil ich .comm-drop (viditeľný ovládač,
   #46) a od vtedy ich nekreslil nikto. */
.comm-dash-section-title{font-family:${FONT_UI};font-weight:600;font-size:13px;letter-spacing:.04em;color:${P.deep};margin:20px 0 12px;}
/* položka zoznamu = RIADOK (úroveň 3 matrice): plochá výplň, slabší rám. Desať kariet pod
   sebou by z panela spravilo schodisko. */
.comm-walkedrow{display:flex;align-items:center;justify-content:space-between;gap:12px;background:${T.tileBg};border:1px solid ${T.border};border-radius:10px;padding:13px 16px;margin-bottom:9px;cursor:pointer;transition:border-color .15s,background .15s;}
.comm-walkedrow:hover{border-color:${T.cardEdge};background:#FFFDF6;}
.comm-walkedrow-name{font-family:${FONT_TITLE};font-weight:700;font-size:13px;color:${P.ink};}
.comm-walkedrow-meta{font-size:11px;color:${P.dim};white-space:nowrap;flex-shrink:0;}
.comm-cat-units{display:flex;flex-wrap:wrap;gap:6px;margin-top:11px;}
.comm-unit{font-size:10.5px;padding:4px 9px;border-radius:999px;border:1px solid ${P.border};color:${P.dim};background:${P.soft};font-family:inherit;cursor:pointer;transition:border-color .15s,color .15s,background .15s;}
.comm-unit:hover{border-color:${T.cardEdge};color:${P.deep};background:#FFFDF6;}
.comm-unit.done{border-color:${T.cardEdge};color:${P.deep};background:rgba(201,154,63,0.18);}
/* per-unit rozklad (Slice A, bod 2): farba podľa počtu prejdených tripov na jednotku.
   ⚠️ Na papyruse ide TMAVÝ inkoust tej istej farby — UNIT_STARTED_COLOR (#E8B22E) aj
   UNIT_DONE_COLOR (#37B26A) sú svetlé odtiene robené na čiernu dosku a na piesku by z nich
   ostal svetlý fliačik. Rám ostáva plnou farbou významu, čitateľnosť nesie inkoust. */
.comm-unit--started{border-color:${UNIT_STARTED_COLOR};color:${UNIT_STARTED_INK};background:rgba(232,178,46,0.20);}
.comm-unit--done{border-color:${T.growGreen};color:${UNIT_DONE_INK};background:rgba(61,122,78,0.16);}

/* medaily (parks/chko/peaks/waters) — Matej 2026-07-23 zadanie bod 2: „musia to byť ozaj
   odznaky… na to sa kliknúť nebude dať bude to len medaila". Žiadny bar, žiadny ×N, žiadny klik. */
.comm-cat-count{font-size:11px;color:${P.dim};flex-shrink:0;}
.comm-medals{display:flex;flex-wrap:wrap;gap:14px;margin-top:13px;}
.comm-medal{width:68px;display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;}
.comm-medal-ic{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.comm-medal-ic img{width:26px;height:26px;}
.comm-medal--on .comm-medal-ic{background:linear-gradient(135deg,#F5C73D,#E69E1A);box-shadow:0 0 14px rgba(245,199,61,0.45),inset 0 1px 0 rgba(255,255,255,0.35);}
.comm-medal--on .comm-medal-ic img{filter:brightness(0) invert(1);}
/* ⚠️ VRCHOLY A VODY SÚ LAPISOVÉ, NIE ZLATÉ (Matej 1. 9. 2026: „highest peaks a top waters by
   mali byť lapisom nie zlatou").
   Nie je to rozmar: na tejto obrazovke je zlatá naraz rámom bloku, pruhom postupu, chipom
   odškrtnutého pohoria AJ medailou — päť rôznych významov v jednej farbe. Parky a CHKO majú
   vlastné farebné logá, takže odlíšiť sa potrebujú práve tie dve kategórie, ktoré kreslíme
   my. Zlato ostáva na LEME — lapis so zlatým prstencom je pôvodná egyptská dvojica, holý
   modrý kruh by na papyruse stál mimo brandu. */
.comm-medal--on.comm-medal--lapis .comm-medal-ic{background:${LAPIS.grad};box-shadow:0 0 0 1.5px rgba(201,154,63,0.60),0 4px 12px rgba(5,15,48,0.35),inset 0 1px 0 rgba(239,215,154,0.30);}
/* nezískaná medaila = zapustené miesto v papyruse, nie svetlá škvrna: tmavý inkoust s nízkou
   alfou a ČIERNA maska ikonky. invert(1) ju robilo bielou — správne na čiernej doske, na
   piesku prázdne miesto. */
.comm-medal--off .comm-medal-ic{background:rgba(42,22,8,0.07);border:1px solid ${P.border};}
.comm-medal--off .comm-medal-ic img{filter:brightness(0);opacity:.34;}
/* parks = reálne NP logá (Matej 2026-07-23): ŽIADNY krúžok/chip — logá ponechané ako sú, len
   vystrihnuté na priehľadnom pozadí. Earned = plná farba; off = odšednuté + stlmené. */
.comm-medal-ic--logo{width:62px;height:62px;padding:0;border-radius:0;background:none;border:none;}
.comm-medal-ic--logo img{width:100%;height:100%;object-fit:contain;}
.comm-medal--on .comm-medal-ic--logo{background:none;box-shadow:none;border:none;}
.comm-medal--on .comm-medal-ic--logo img{filter:none;}
.comm-medal--off .comm-medal-ic--logo{background:none;box-shadow:none;border:none;}
.comm-medal--off .comm-medal-ic--logo img{filter:grayscale(1) brightness(.88) contrast(1.05);opacity:.62;}
/* TANAP + Pieniny = biely kruh za logo (tmavý text robený pre biele pozadie → čitateľný v OBOCH
   stavoch). off = mierne stlmený svetlý disk, ale text stále vidno (žiadne opacity .3/.5 fade). */
.comm-medal-ic--disc{background:#FBF9F4;border-radius:50%;padding:7px;box-shadow:0 0 0 1px rgba(122,90,42,0.30),0 2px 7px rgba(122,90,42,0.22);}
.comm-medal-ic--disc img{filter:none;opacity:1;}
.comm-medal--off .comm-medal-ic--disc{background:#D6D1C4;}
.comm-medal--off .comm-medal-ic--disc img{filter:grayscale(.45);opacity:.92;}
/* voľný per-park hook na zväčšenie tenkých log (aktuálne prázdny — Pieniny rieši disc). */
.comm-medal-ic--big img{transform:scale(1.22);}
.comm-medal-name{font-size:10px;line-height:1.25;color:${P.ink};}
.comm-medal--off .comm-medal-name{color:${P.dim};opacity:.7;}
.comm-unit-drop{margin-top:10px;padding-top:10px;border-top:1px solid ${P.hair};}
.comm-unit-empty{text-align:center;font-size:11px;color:${P.dim};padding:6px 0 10px;font-style:italic;}
.comm-unit-addrow{text-align:center;font-family:${FONT_UI};font-weight:600;font-size:10.5px;letter-spacing:.04em;color:${P.deep};padding:10px;border-radius:10px;border:1px dashed rgba(201,154,63,0.55);cursor:pointer;transition:border-color .15s,background .15s;}
.comm-unit-addrow:hover{border-color:${T.cardEdge};background:rgba(201,154,63,0.14);}

/* HERO BADGES — deviatka hrdinských odznakov (Matej 2026-07-24), globálny trip-míľnik achievement.
   3D medailón feel: earned = plná farba + zlatý glow + jemný float; locked = grayscale + tlmené
   (pes aj číslo míľnika stále čitateľné — žiadna silueta). */
.comm-heroes{display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:13px;}
@media (min-width:640px){.comm-heroes{gap:10px;}}
.comm-hero{display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;font-family:inherit;cursor:pointer;padding:2px;}
.comm-hero img{width:100%;aspect-ratio:1;object-fit:contain;transition:transform .25s,filter .25s;}
/* ⚠️ ZÍSKANÝ ODZNAK SVIETI TIEŇOM, NIE ŽIAROU (2026-09-01). Zlatá žiara okolo zlatého
   medailónu na PIESKU nekreslí nič — halo na svetlom podklade sa nezosilňuje polomerom,
   ale hustotou a kontrastom voči podkladu. Na papyruse teda hrá teplý VRHNUTÝ tieň:
   odznak sa dvíha nad dosku namiesto toho, aby do nej svietil.
   Plávanie aj naklonenie pri hoveri ostávajú — tie na podklade nezávisia. */
.comm-hero--on img{filter:drop-shadow(0 0 5px rgba(201,154,63,0.55)) drop-shadow(0 5px 7px rgba(90,62,20,0.40));animation:comm-hero-float 4s ease-in-out infinite;}
.comm-hero--on:hover img{transform:perspective(500px) rotateY(-8deg) scale(1.08);}
/* nezískaný = odšednutý a stlmený, ale stále čitateľný (pes aj číslo míľnika). brightness pod
   1 ho na papyruse zatemní do machule, preto mierne NAD 1. */
.comm-hero--off img{filter:grayscale(1) brightness(.94) contrast(1.06);opacity:.58;}
.comm-hero-trips{font-family:${FONT_UI};font-weight:600;font-size:10px;color:${P.dim};}
.comm-hero--on .comm-hero-trips{color:${P.deep};}
@keyframes comm-hero-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);}}
@media (prefers-reduced-motion:reduce){.comm-hero--on img{animation:none;}.comm-hero--on:hover img{transform:none;}}

/* REVEAL overlay — „milestone reached" moment (Matej 2026-07-24, upresnenie 2026-07-24 = horizontálny
   card layout), portál do document.body (rodičovský .pk-glass má backdrop-filter → containing block
   by ukotvil position:fixed o panel, nie o viewport). Backdrop klik = dismiss; klik NA card = nič. */
/* Závoj ostáva tmavý — je to okamih, keď má obrazovka stíchnuť a svietiť má len odznak.
   Karta pod ním je PANEL (úroveň 4 matrice): papyrus, 1.5px zlatý rám, panelShadow. */
.comm-reveal{position:fixed;inset:0;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px;cursor:pointer;animation:comm-reveal-fadein .35s ease;}
.comm-reveal-card{position:relative;display:flex;gap:28px;align-items:center;width:100%;max-width:760px;max-height:86vh;background:${T.panelGrad};border:1.5px solid ${T.cardEdge};border-radius:14px;padding:34px;cursor:default;box-shadow:${T.panelShadow};animation:comm-reveal-pop .55s cubic-bezier(.2,1.3,.4,1);}
.comm-reveal-left{flex:0 0 210px;display:flex;flex-direction:column;align-items:center;gap:12px;}
.comm-reveal-badge{width:210px;max-width:44vw;filter:drop-shadow(0 0 14px rgba(201,154,63,.45)) drop-shadow(0 10px 20px rgba(90,62,20,.40));}
.comm-reveal-trips{font-family:${FONT_UI};font-weight:600;font-size:13px;color:${P.deep};letter-spacing:.16em;text-transform:uppercase;}
.comm-reveal-right{flex:1;min-width:0;text-align:left;max-height:70vh;overflow-y:auto;}
/* Eyebrow na papyruse = zlatá (T.cardEdge), telo textu plný inkoust s tichším krytím —
   inkWarm je na popisky a odsek v ňom sa číta ako poznámka pod čiarou. */
.comm-reveal-kicker{font-family:${FONT_UI};font-weight:600;font-size:11px;letter-spacing:.24em;color:${T.cardEdge};text-transform:uppercase;}
.comm-reveal-name{font-family:${FONT_TITLE};font-weight:700;font-size:30px;color:${P.ink};margin-top:6px;line-height:1.05;}
.comm-reveal-story{font-size:14px;line-height:1.65;color:rgba(42,22,8,0.86);margin-top:14px;}
/* ⚠️ .comm-reveal-x ZMAZANÉ 2026-09-01 — panel podľa locku z 28. 8. krížik nemá, von sa ide
   klikom na závoj alebo Esc (obidve rieši HeroBadges.tsx). */
.comm-reveal-badge--off{filter:grayscale(1) brightness(.94) contrast(1.06) drop-shadow(0 10px 20px rgba(90,62,20,.30));}
.comm-reveal-kicker--locked{color:${P.dim};}
.comm-reveal-source{display:inline-block;margin-top:16px;font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.04em;color:${P.deep};text-decoration:none;border-bottom:1px solid rgba(201,154,63,.55);padding-bottom:2px;}
.comm-reveal-source:hover{border-bottom-color:${T.cardEdge};}
.comm-reveal-source-label{font-family:inherit;font-weight:400;font-size:11px;color:${P.dim};letter-spacing:0;}
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

/* ── KARTA PLÁNOVANÉHO VÝLETU S POZVÁNKOU (EventsView) — BLEDÁ (2026-09-01, 2. beh) ──
   Karta stála TMAVÁ vnútri papyrusového panela mapy (.trp-sidebar na PC, .trp-mlist na
   mobile) a v tom istom stĺpci vedľa nej leží bledá .trp-bigcard — jediný tmavý blok
   v zozname.
   ⚠️ HODNOTY SA NEODVODZUJÚ NANOVO. Karta v zozname má podobu vyladenú v bledom skine
   mapy (PackMap.tsx: .trp-sidebar .trp-bigcard); toto je jej SÚRODENEC, takže berie tie
   isté čísla — cardGrad, 1.5px cardEdge, radius 16 a TEPLÝ tieň BEZ zlatého halo ringu.
   Matricový T.cardShadow je pre kartu na ČIERNEJ stránke; na papyruse je z neho čierny
   mrak a ring sa reže o okraj skrolovacieho stĺpca.
   ⚠️ .comm-plan-tag ZMAZANÉ — pravidlo bez jediného výskytu v JSX (overené grepom cez src). */
.comm-plan{background:${T.cardGrad};border:1.5px solid ${T.cardEdge};border-radius:16px;box-shadow:0 2px 8px rgba(122,90,42,0.16),inset 0 1px 0 rgba(255,255,255,0.45);padding:15px 17px;margin-bottom:12px;}
/* Fotka a štítok na nej ostávajú TMAVÉ — podklad je snímka, nie papyrus, presne ako
   .trp-bigcard-photoactbtn. Radius je o hrúbku rámu menší (16 − 1.5), inak fotka vyčnieva
   z oblúka karty. */
.comm-plan-photo{position:relative;margin:-15px -17px 13px;height:150px;background-size:cover;background-position:center;border-radius:15px 15px 0 0;cursor:pointer;}
.comm-plan-planned{position:absolute;left:12px;bottom:10px;font-family:${FONT_UI};font-weight:600;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#F5C73D;background:rgba(0,0,0,0.5);padding:4px 9px;border-radius:7px;border:1px solid rgba(201,154,63,0.5);}
.comm-plan-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
/* NEUTRÁLNY typový štítok (výlet). Protipól je zlatý .pev-typechip (podujatie) v
   events/EventCard.tsx — dvojica sa musí líšiť farbou, nielen textom. Na papyruse je
   z toho holý obrys proti teplej zlatej výplni.
   ⚠️ Zlatá #C99A3F ako PÍSMO má na piesku ~1.9:1, takže zvýraznenie nesie tmavšia
   P.deep — tá istá hodnota, akou svieti zvýraznený stav v celom bledom skine mapy. */
.comm-plan-type{display:inline-block;font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.12em;text-transform:uppercase;padding:3px 9px;border-radius:999px;border:1px solid ${P.border};color:${P.dim};margin-bottom:5px;}
.comm-plan-name{font-family:${FONT_TITLE};font-weight:700;font-size:14px;color:${P.ink};}
.comm-plan-meta{font-size:11.5px;color:${P.dim};margin-top:3px;}
.comm-plan-people{display:flex;flex-direction:column;gap:7px;margin-top:12px;padding-top:12px;border-top:1px solid ${P.hair};}
.comm-person{display:flex;align-items:center;gap:9px;}
/* Zlatý krúžok s tmavým písmenom drží aj na papyruse — je to plocha, nie písmo. */
.comm-person-av{width:28px;height:28px;border-radius:50%;flex-shrink:0;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:12px;color:${INK};}
.comm-person-txt{flex:1;min-width:0;font-size:11.5px;color:${P.ink};}
.comm-person-txt b{color:${P.ink};}
.comm-person-txt span{color:${P.dim};}
.comm-buddytoggle{font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.06em;text-transform:uppercase;padding:6px 0;background:none;border:none;color:${P.deep};cursor:pointer;}
.comm-msgbtn{flex-shrink:0;font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.04em;text-transform:uppercase;padding:6px 11px;border-radius:999px;background:${P.soft};border:1px solid ${P.border};color:${P.ink};cursor:pointer;}
.comm-msgbtn:hover{border-color:${T.cardEdge};color:${P.deep};background:${P.hot};}
/* JOIN = HLAVNÉ CTA karty ⇒ LAPIS, radius 8 (brandový kánon 28. 8.). Tá istá dvojica,
   akú dostali JOIN a SAVE DATE v tripliste 1. 9. Pilulkový tvar zaniká: geometriu nesie
   lock .btn-gold, lapis mení len výplň. */
.comm-joinbtn{flex-shrink:0;font-family:${FONT_TITLE};font-weight:700;font-size:10px;letter-spacing:.05em;text-transform:uppercase;padding:8px 15px;border-radius:8px;background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.deep};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;}
.comm-joinbtn:hover{background:${LAPIS.gradHover};}
/* „Going" nie je akcia, je to STAV — zelený tint, rovnako ako prejdený výlet v článku.
   Plná zelená by na karte stála druhá plná farba vedľa lapisu a ani jedna by neviedla. */
.comm-joinbtn.joined{${pickTintCSS(T.growGreen, PICK_INK.green)}box-shadow:none;}
/* Vypnuté CTA = PLOCHÝ PAPYRUS, nie opacity — krytie na svetlom podklade dá levanduľovú
   škvrnu a písmo z nej zmizne (zistené pri tripliste 1. 9.). */
.comm-joinbtn.closed{background:${P.soft};color:${P.faint};border-color:${P.hair};box-shadow:none;cursor:default;}
.comm-lockbtn{flex-shrink:0;font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.04em;text-transform:uppercase;padding:5px 10px;border-radius:999px;background:none;border:1px solid ${P.border};color:${P.dim};cursor:pointer;}
.comm-lockbtn:hover{border-color:${T.cardEdge};color:${P.deep};}
.comm-lockbtn.on{border-color:${P.deep};color:${P.deep};background:${P.hot};}
.comm-empty{text-align:center;padding:34px 16px;color:${P.dim};font-size:12.5px;font-style:italic;}
/* #55 — prázdny stav = JEDNA veta faktu + JEDNA akcia. Bez tlačidla je to slepá ulička:
   po zmazaní fabrikovaných dát (2026-08-03) je toto prvé, čo nový člen v paneli uvidí. */
.comm-emptybox{display:flex;flex-direction:column;align-items:center;gap:14px;padding:34px 16px;text-align:center;}
.comm-emptybox p{margin:0;color:${P.dim};font-size:12.5px;font-style:italic;line-height:1.5;}
/* jediná akcia prázdneho stavu = hlavné CTA ⇒ LAPIS (kánon 2026-08-28). Radius 8 ostáva
   z locku .btn-gold — mení sa výplň, nie tvar. */
.comm-emptybtn{font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.16em;text-transform:uppercase;padding:11px 20px;border-radius:8px;border:1px solid ${LAPIS.deep};background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;}
.comm-emptybtn:hover{background:${LAPIS.gradHover};}
/* #41 — úprimná veta namiesto fabrikovaného člena/prázdneho bloku (issue #41, ČASŤ 2) */
.comm-buddynote{font-size:11px;color:${P.dim};font-style:italic;padding:8px 0 2px;}

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
/* ⚠️ VYBRATÝ PES SVIETI NAZELENO, NIE NAZLATO (Matej 2026-08-25: „musí tam svietiť hlavy
   psov a po kliknutí sa zazelenajú"). Zlatá na tejto obrazovke znamená „tu si" a nesie ju
   postup krokov; zelená znamená HOTOVO — tá istá, akou svieti dokončený krok v číselníku
   a splnená značka na trase (GROUP_TINT.comment). Jeden význam, jedna farba. */
.comm-comp-dog.on{background:rgba(58,150,88,0.18);border-color:#3A9658;}
.comm-comp-dog.on .comm-comp-dog-av{box-shadow:0 0 0 2px #3A9658;}
/* Zbalené + pred otvorením poľa s menami. Nie zlaté CTA — je to rozbalenie, nie akcia kroku. */
.comm-comp-openothers{display:flex;align-items:center;gap:9px;width:100%;padding:10px 12px;margin-top:10px;border-radius:10px;background:rgba(245,240,228,0.04);border:1px dashed ${T.onDarkBorder};color:${T.onDarkDim};font-family:${FONT_UI};font-size:12px;cursor:pointer;}
.comm-comp-openothers:hover{border-color:${GOLD};color:${T.onDark};}
.comm-comp-openplus{display:flex;align-items:center;justify-content:center;flex:0 0 auto;width:22px;height:22px;border-radius:50%;background:rgba(201,154,63,0.16);color:${GOLD};font-size:15px;line-height:1;}
.comm-comp-searchwrap{position:relative;}
.comm-comp-searchrow{display:flex;gap:8px;align-items:stretch;}
.comm-comp-searchrow .comm-input{flex:1 1 auto;min-width:0;}
/* Štvorec vedľa poľa, nie zlaté CTA: zlatá je vyhradená hlavnej akcii obrazovky a tou je
   ĎALEJ dole. Toto je pomocné potvrdenie jedného poľa. */
.comm-comp-addbtn{flex:0 0 auto;width:44px;border-radius:9px;background:rgba(201,154,63,0.14);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-family:${FONT_UI};font-size:20px;line-height:1;cursor:pointer;padding:0;}
.comm-comp-addbtn:disabled{opacity:.38;cursor:default;}
.comm-comp-addbtn:not(:disabled):hover{border-color:${GOLD};}
.comm-comp-sug{position:absolute;top:calc(100% + 6px);left:0;right:0;background:rgba(6,5,3,0.96);backdrop-filter:blur(8px);border:1px solid ${T.onDarkBorder};border-radius:11px;overflow:hidden;box-shadow:0 12px 34px rgba(0,0,0,0.55);z-index:30;max-height:210px;overflow-y:auto;}
.comm-comp-sugitem{display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;border-bottom:1px solid ${T.onDarkHair};}
.comm-comp-sugitem:last-child{border-bottom:0;}
.comm-comp-sugitem:hover{background:rgba(201,154,63,0.14);}
.comm-comp-sugitem-av{width:30px;height:30px;border-radius:50%;flex-shrink:0;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:12px;color:${INK};}
.comm-comp-sugitem-tx{font-size:12.5px;color:${T.onDark};}
.comm-comp-sugitem-tx span{color:${T.onDarkDim};font-size:11px;}

/* ⚠️ .comm-modechoice / .comm-mode* ZMAZANÉ 2026-09-01 — voľba „Plánujem / Prešiel som" sa
   presťahovala do ADD toku (dlaždice TRIP / EVENT / QUICK NOTE na /pack/add/trip) a tieto
   triedy odvtedy nekreslil nikto (overené grepom cez všetky className v src). Tmavý recept
   bez povrchu je horší než žiadny: pri prezliekaní by ho niekto skopíroval na nový blok.

/* ── TRIPSTATS V3 (issues #46 / #47 / #50) ──────────────────────────────────────────────────
   Tri zmeny naraz, lebo bývajú v jednom paneli:
    · #46 level a progressbar do ďalšieho levelu priamo v hlavičke + ⓘ cenník bodov,
    · #47 vysvedčenie BEZ percent krajiny — hero krajiny, počty tripov a km, odznak za počet,
    · #50 magistrála je odkaz na svoj detail, nie rozbaľovacia položka.
   POZOR: toto je template literál — v komentároch ŽIADNE spätné apostrofy. */

/* level + progressbar (#46) — od 2026-08-06 NA PAPYRUSE, takže všetky farby sú inkoustové.
   Pruh berie percentá z levelProgress(), nie z počtu tripov. */
.comm-lvlwrap{flex-basis:100%;display:flex;flex-direction:column;gap:7px;}
/* koľajnica pruhu = tmavý inkoust s nízkou alfou. Svetlá koľajnica (rgba papyrus) by na
   papyrusovom podklade zmizla a pruh by vyzeral, akoby začínal odnikiaľ. */
.comm-lvlbar{height:8px;border-radius:999px;background:rgba(42,22,8,0.14);overflow:hidden;}
/* ⚠️ PRUH NESIE FARBU PÁSMA, NIE ZLATÚ (Matej 1. 9. 2026: „treba prerobiť proggres bar na
   farbu aktuálneho levelu ako aj celý pils"). Premenné vešia tierVars na .comm-vhead;
   fallback drží pôvodnú zlatú, takže povrch bez premenných vyzerá presne ako predtým.
   Poradie b→a (tmavý → svetlý) je zhodné s pruhom v paneli levelu na mape. */
.comm-lvlbar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--tier-b,#F5C73D),var(--tier-a,#E69E1A));transition:width .45s;}
.comm-lvlfoot{display:flex;align-items:center;justify-content:space-between;gap:10px;font-family:${FONT_UI};font-weight:500;font-size:10.5px;color:${T.inkWarm};}
/* ⚠️ .comm-lvlinfo / .comm-lvlinfo-btn ZMAZANÉ 1. 9. 2026 — ⓘ tlačidlo v pravom hornom rohu
   zaniklo spolu s druhým popupom (Matej: „spojiť dva popupy na hlavičke do jedného ako na
   mape"). Cenník žije v popupe pilulky levelu. */
/* CENNÍK = papyrusový panel, DVA STĹPCE (Matej 2026-08-06: „na lavej strane daj všeobecné za čo
   všetko sú boody a na pravo celkovo za čo má biody ten človek + TOTAL"). Predtým to bol jeden
   úzky stĺpec, kde sa cenník a vlastné body oddeľovali linajkami — dva zoznamy pod sebou vyzerali
   ako jeden dlhý. Šírka je preto väčšia než pri jednom stĺpci; na mobile padá pod seba. */
/* ⚠️ .comm-pts (vlastný obal cenníka) ZMAZANÉ 1. 9. 2026 — cenník sa presťahoval dovnútra
   .comm-tiers, teda do popupu pilulky. Zostávajú len jeho VNÚTORNÉ pravidlá (.comm-pts-*),
   ktoré ten popup používa. */
.comm-pts-cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
/* zvislý predel medzi stĺpcami = zlatý, nie šedý hairline (lock bledého bloku). */
.comm-pts-col + .comm-pts-col{padding-left:18px;border-left:1.5px solid rgba(201,154,63,0.35);}
@media (max-width:560px){
  .comm-pts-cols{grid-template-columns:1fr;gap:12px;}
  .comm-pts-col + .comm-pts-col{padding-left:0;border-left:0;padding-top:12px;border-top:1.5px solid rgba(201,154,63,0.35);}
}
.comm-pts-eyebrow{display:block;font-family:${FONT_UI};font-weight:500;font-size:9px;letter-spacing:.26em;text-transform:uppercase;color:${T.cardEdge};margin-bottom:9px;}
.comm-pts-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-family:${FONT_UI};font-weight:500;font-size:11px;color:${T.inkWarm};padding:3px 0;}
.comm-pts-row b{font-weight:600;color:${T.inkStrong};white-space:nowrap;font-variant-numeric:tabular-nums;}
.comm-pts-rule{display:block;height:2px;margin:10px 0;background:${T.rule};}
.comm-pts-tot{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-family:${FONT_TITLE};font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:${T.inkStrong};}
/* prázdny pravý stĺpec — nový člen nemá ani bod, a prázdna polovica bez vysvetlenia vyzerá
   ako chyba renderu. */
.comm-pts-none{font-family:${FONT_UI};font-weight:500;font-size:11px;font-style:italic;line-height:1.5;color:${T.inkWarm};}
/* jednoveté vysvetlenie pod nadpisom sekcie (ranky krajiny) — menšie a kurzívou, aby sa
   nečítalo ako ďalšia položka zoznamu s chýbajúcim číslom vpravo. */
.comm-pts-note{display:block;font-family:${FONT_UI};font-weight:500;font-size:10px;font-style:italic;line-height:1.45;color:${T.inkWarm};margin:-4px 0 7px;}

/* countries — VŠETKY štáty s vlajkou, aj tie bez výletu (#46) */
.comm-ctrys{display:flex;gap:8px;overflow-x:auto;padding:2px 0 8px;margin-bottom:14px;-webkit-overflow-scrolling:touch;}
/* VYBRANÁ KRAJINA = PRIESVITNÝ LAPISOVÝ TINT (lock 2026-08-26) — je to moja voľba, čo
   chcem vo vysvedčení vidieť, nie konštrukcia. Plná plocha ostáva hlavnému CTA. */
.comm-ctry{flex-shrink:0;display:flex;align-items:center;gap:8px;padding:7px 13px 7px 8px;border-radius:999px;border:1px solid ${P.border};background:${P.soft};font-family:inherit;cursor:pointer;transition:border-color .15s,background .15s;}
.comm-ctry:hover{border-color:${T.cardEdge};background:#FFFDF6;}
.comm-ctry.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.14)}}
.comm-ctry--empty{opacity:.55;}
/* ⚠️ VYBRANÁ KRAJINA JE VŽDY PLNE VIDITEĽNÁ, aj keď v nej človek ešte nebol. Stlmenie
   hovorí „sem si zatiaľ nešiel"; keď na taký chip klikne, je to jeho voľba a musí byť
   vidieť rovnako ako pri prejdenej krajine — inak vyzerá výber ako nedotiahnutý. */
.comm-ctry--empty.on{opacity:1;}
.comm-ctry img{width:22px;height:15px;border-radius:3px;object-fit:cover;flex-shrink:0;}
.comm-ctry b{font-family:${FONT_UI};font-weight:600;font-size:11.5px;color:${P.ink};white-space:nowrap;}
.comm-ctry.on b{color:${PICK_INK.lapis};}
.comm-ctry span{font-family:${FONT_UI};font-weight:500;font-size:10px;color:${P.dim};white-space:nowrap;}

/* hero krajiny + dropdown (#47) — zaoblený obrázok ako v tripovom článku */
/* ⚠️ ŽIADNY overflow:hidden (odstránený 2026-08-06). Mal ho kvôli zaobleniu fotky, ale
   OREZÁVAL AJ popup ranku, ktorý sa otvára nahor — zmizla mu celá hlavička a vyzeralo to,
   akoby sa nadpis nevykreslil. Fotka je background, ten border-radius rešpektuje sám;
   stačilo dorobiť radius prekryvu ::before, ktorý by inak trčal rohmi. Viď
   feedback_overflow_hidden_clips_dropdowns. */
/* ⚠️ HERO KRAJINY OSTÁVA TMAVÝ — a je to zámer, nie nedorobok. Je to FOTKA z prejdeného
   výletu cez celý blok; biely text a tmavý spád naň patria, papyrusová výplň by fotku
   prekryla. Prezliekol sa len RÁM (zlatý namiesto svetlého) a radius, aby blok sedel do
   mriežky ostatných. */
.comm-chero{position:relative;border-radius:14px;border:1.5px solid ${T.cardEdge};background:#2A2013;background-size:cover;background-position:center;min-height:172px;display:flex;align-items:flex-end;padding:18px;margin-bottom:16px;box-shadow:0 2px 8px rgba(122,90,42,0.18);}
.comm-chero::before{content:'';position:absolute;inset:0;border-radius:12.5px;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.78) 100%);}
/* krajina bez vlastnej fotky: vlajka NEsmie ísť cez background cover — roztiahnutá rakúska
   alebo švajčiarska vlajka je len biela plocha. Bez fotky niet čo prekrývať, takže tu už
   tmavý blok nemá dôvod byť a hero ide do papyrusu — inak by v bledom vysvedčení stála
   čierna diera práve pri krajine, kde človek ešte nebol.
   ⚠️ S výplňou sa musí prevrátiť aj INKOUST (text bol robený na fotku): nadpis, podnadpis,
   cieľ a koľajnica pruhu nižšie. Prevrátiť povrch a nechať štítky svetlé = neviditeľný blok.
   → [[feedback_prevratena_doska_prevrati_aj_stitky]] */
.comm-chero--noimg{background-image:none;background:${T.panelGrad};}
.comm-chero--noimg::before{background:none;}
.comm-chero--noimg .comm-chero-name{color:${P.ink};text-shadow:none;}
.comm-chero--noimg .comm-chero-sub{color:${P.dim};}
.comm-chero--noimg .comm-chero-goaltxt{color:${P.deep};}
.comm-chero--noimg .comm-chero-bar{background:rgba(42,22,8,0.14);}
.comm-chero--noimg .comm-chero-flag{border-color:${P.border};box-shadow:0 2px 8px rgba(122,90,42,0.28);}
.comm-chero--noimg .comm-rankinfo-btn{border-color:${P.border};background:${P.soft};color:${P.ink};}
.comm-chero--noimg .comm-chero-sel select{background:${P.field};border-color:${P.border};color:${P.ink};}
.comm-chero-flag{display:block;width:54px;height:36px;object-fit:cover;border-radius:8px;border:1px solid rgba(245,240,228,0.35);box-shadow:0 4px 14px rgba(0,0,0,0.5);margin-bottom:11px;}
.comm-chero-sel{position:absolute;top:12px;right:12px;z-index:2;}
.comm-chero-sel select{appearance:none;-webkit-appearance:none;background:rgba(3,2,1,0.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(201,154,63,0.55);border-radius:999px;color:#F5F0E4;font-family:${FONT_UI};font-weight:600;font-size:11px;padding:7px 28px 7px 13px;cursor:pointer;}
.comm-chero-sel::after{content:'';position:absolute;right:12px;top:50%;width:6px;height:6px;border-right:1.5px solid rgba(201,154,63,0.9);border-bottom:1.5px solid rgba(201,154,63,0.9);transform:translateY(-70%) rotate(45deg);pointer-events:none;}
.comm-chero-in{position:relative;z-index:1;width:100%;}
.comm-chero-name{font-family:${FONT_TITLE};font-weight:700;font-size:28px;line-height:1;letter-spacing:.07em;text-transform:uppercase;color:#F5F0E4;text-shadow:0 2px 14px rgba(0,0,0,0.7);}
.comm-chero-sub{font-family:${FONT_UI};font-weight:500;font-size:12px;color:rgba(245,240,228,0.85);margin-top:7px;}
.comm-chero-goal{margin-top:11px;max-width:340px;}
.comm-chero-goaltxt{display:flex;align-items:center;gap:8px;font-family:${FONT_UI};font-weight:500;font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:rgba(245,240,228,0.8);margin-bottom:5px;}
/* ⓘ pri titule krajiny — na FOTKE, takže svetlý obrys a tmavé sklo, nie inkoust ako v profile. */
.comm-rankinfo{position:relative;display:inline-flex;flex-shrink:0;}
.comm-rankinfo-btn{width:19px;height:19px;border-radius:50%;border:1px solid rgba(245,240,228,0.5);background:rgba(3,2,1,0.45);color:#F5F0E4;font-family:${FONT_UI};font-weight:600;font-size:10px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,border-color .15s;}
.comm-rankinfo-btn:hover,.comm-rankinfo-btn.on{background:${GOLD};border-color:${GOLD};color:#241a06;}
/* Otvára sa NAHOR (bottom:100%): titul sedí na spodku hera, smerom dole by popup prekryl
   kategórie pod ním a na nižšom okne by pretiekol pod okraj viewportu — presne tá chyba,
   ktorú už raz spravil cenník bodov. Nahor má nad sebou celú fotku hera. */
.comm-ranks{position:absolute;bottom:calc(100% + 9px);left:0;z-index:30;width:min(290px,78vw);text-align:left;cursor:default;text-transform:none;letter-spacing:normal;background:${T.panelGrad};border:1.5px solid ${T.cardEdge};border-radius:14px;box-shadow:${T.panelShadow};padding:14px 15px;}
.comm-rankrow b{font-variant-numeric:tabular-nums;}
/* dosiahnutý rank = zelená (rovnaká ako odškrtnutá jednotka), nasledujúci = zlatý a zvýraznený;
   ostatné ostávajú tlmené, aby bolo na prvý pohľad vidieť, kde človek stojí. */
.comm-rankrow.done{color:${T.inkStrong};}
.comm-rankrow.done b{color:${UNIT_DONE_COLOR};}
.comm-rankrow.next{color:${T.inkStrong};font-weight:600;}
.comm-rankrow.next b{color:${T.cardEdge};}
.comm-chero-bar{height:6px;border-radius:999px;background:rgba(245,240,228,0.18);overflow:hidden;}
.comm-chero-bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#F5C73D,#E69E1A);}
@media (max-width:560px){ .comm-chero{min-height:150px;padding:14px;} .comm-chero-name{font-size:22px;} }

/* magistrály = odkazy na detail, žiadny dropdown (#50) */
.comm-jrows{display:flex;flex-direction:column;gap:7px;margin-top:12px;}
/* položka = RIADOK (úroveň 3 matrice) */
.comm-jrow{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:11px 14px;border-radius:10px;border:1px solid ${T.border};background:${T.tileBg};font-family:inherit;cursor:pointer;transition:border-color .15s,background .15s;}
.comm-jrow:hover{border-color:${T.cardEdge};background:#FFFDF6;}
.comm-jrow-name{font-family:${FONT_TITLE};font-weight:700;font-size:12.5px;color:${P.ink};}
.comm-jrow.on .comm-jrow-name{color:${P.deep};}
.comm-jrow-meta{font-family:${FONT_UI};font-weight:500;font-size:10.5px;color:${P.dim};white-space:nowrap;flex-shrink:0;}
.comm-jrow.on .comm-jrow-meta{color:${UNIT_DONE_INK};}

/* zoznam prejdených = viditeľný ovládač, nie holý klikací nadpis (#46) */
.comm-drop{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;margin:20px 0 12px;padding:12px 15px;border-radius:12px;border:1px solid ${T.cardEdge};background:${T.panelGrad};box-shadow:0 1px 3px rgba(122,90,42,0.10),inset 0 1px 0 rgba(255,255,255,0.40);font-family:inherit;cursor:pointer;transition:border-color .15s,background .15s;}
.comm-drop:hover{border-color:${P.deep};background:#FFFDF6;}
.comm-drop-t{font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.04em;color:${P.deep};}
.comm-drop-n{display:flex;align-items:center;gap:8px;font-family:${FONT_UI};font-weight:500;font-size:11px;color:${P.dim};}
.comm-drop-chev{display:inline-block;width:7px;height:7px;border-right:1.5px solid ${P.dim};border-bottom:1.5px solid ${P.dim};transform:translateY(-2px) rotate(45deg);transition:transform .2s;}
.comm-drop.on .comm-drop-chev{transform:translateY(1px) rotate(-135deg);}

`;

// ── modal shell ──────────────────────────────────────────────────────────────────────────────
function Modal({ title, sub, onClose, wide, children }: {
  title: string; sub?: string; onClose: () => void; wide?: boolean; children: React.ReactNode;
}) {
  // ── BEZ KRÍŽIKA (lock 2026-08-28, Matej: „nedávajme tie krížiky na bloky") ──
  // Von sa ide klikom mimo (závoj) alebo Esc. Krížik si pýtal vlastný tvar, hover stav
  // aj bočnú rezervu v hlavičke a pritom nehovoril nič, čo by človek nevedel.
  // Esc je podmienka toho locku, nie ozdoba: na PC je to jediná cesta von, ktorú
  // netreba trafiť myšou.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="comm-overlay" onClick={onClose}>
      <div className={`comm-modal${wide ? ' wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="comm-modal-head">
          <div>
            <div className="comm-modal-title">{title}</div>
            {sub && <div className="comm-modal-sub">{sub}</div>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// clickable rating packy (1..5) — Matej 2026-07-23: „naša packa" = brand Hekypaw (paw.svg,
// jeden väčší prst), NIE generický paw-solid.
// PawInput ZMAZANÝ 2026-08-05 (Matej: „chcem aby pri hodnotení a kontakte myšou alebo dotykom
// sa packy vyplnili na ploche ako to už niekde máme nie len outline"). Kreslil VŽDY obrysový
// `paw.svg` a vybrané odlišoval len zlatým filtrom + opacity — takže rad packiek ostal obrysový
// aj po výbere a pri prejdení myšou sa nedialo nič okrem `scale(1.12)`.
// Náhrada = `PawRating` (`addtrip/PawRating.tsx`), ktorý presne toto vie od 27. 7.: prepína
// medzi `paw.svg` (obrys) a `paw-full.svg` (PLNÁ kresba) cez CSS masku, vypĺňa už pri hoveri
// aj fokuse (`display = hover ?? value`), má klávesnicu a ARIA radiogroup. Bol napísaný pre
// AddTripLog a čakal na zapojenie inde — toto je to „inde".

// ── A · Walked popup ─────────────────────────────────────────────────────────────────────────
// UŽ NIE JE POVINNÝ (2026-08-05): prejdenie zapisuje sám ✓ a tento popup je PONUKA hodnotenia.
// `rewardPoints` = režim ponuky — nadpis povie, koľko bodov za hodnotenie padne, a vedľa
// odoslania stojí rovnocenné „Teraz nie". Bez neho je to obyčajná úprava hlasu (klik na
// „Ohodnotiť" z toastu / úprava starého hodnotenia), kde by sľubovanie bodov klamalo.
export interface WalkedInput { rating: number; difficulty: Difficulty; crowd: Crowd; comment: string; when: string; hazards: Hazard[]; }

/**
 * Čo padlo za práve zapísané prejdenie: základ (vždy) + objavenia (len prvýkrát).
 * `tid` je povinné — odmena patrí KONKRÉTNEMU výletu, nie „poslednému, čo sa odškrtol".
 * Bez neho vedela odmena za trasu A vyskočiť v popupe trasy B (utíšená ponuka → ✓ A skončí
 * v toaste, `walkedReward` ostane visieť, a `onRequestWalk` z komentárov otvorí popup pre B).
 */
export interface WalkReward {
  tid: string;
  base: number;
  /** Z čoho sa `base` skladá (5 prejdenie + km + stúpanie / pevná cena magistrály).
   *  Dodáva `walkPointsBreakdown()` — nikdy sa neskladá ručne, inak sa rozíde so súčtom. */
  baseRows?: PointsRow[];
  bonuses: DiscoveryBonus[];
}

/**
 * ODMENA PO ✓ — základ béžovo, objavenia zlato a s dopočítaním (zadanie §3b).
 * Bonus sa POMENÚVA („Malé Karpaty · nové pohorie"), nie len spočíta: toto je jediné miesto
 * v appke, kde sa človek dozvie, že objavil nové pohorie. Keď žiadny bonus nepadol, riadok sa
 * nezobrazí — žiadne „+0".
 */
export function WalkRewardBlock({ trailName, reward, ratingPoints }: {
  trailName: string; reward: WalkReward;
  /** Body, ktoré ešte MÔŽE získať za hodnotenie — vykreslia sa pod čiarou v tom istom bloku.
   *  Matej 2026-08-06: dve bodové čísla na dvoch miestach popupu boli neprehľadné, toto ich
   *  spája do jedného príbehu „toto ti padlo · toto ešte môžeš dostať". */
  ratingPoints?: number;
}) {
  const t = useT();
  return (
    <div className="comm-reward">
      <span className="comm-reward-eyebrow">{t('pack.community.rewardEyebrow')}</span>
      <div className="comm-reward-row">
        <PointsPill value={reward.base} tone="lapis" size="md" />
        <span className="comm-reward-txt">{trailName}</span>
      </div>
      {/* ROZPAD ZÁKLADU (Matej 2026-08-06: „človek nevie prečo 26… ukáž ten rozpad pri pridávaní
          hodnotenia, tam je dosť priestoru"). Riadky dáva bodový engine (`walkPointsBreakdown`),
          NIE tento komponent — súčet nad nimi a ich sedmička sa preto nemôžu rozísť.
          Pri magistrále je to jediný riadok „pevná cena", čo je presne tá informácia, ktorú
          človek pri 1400 bodoch hľadá. Jednopoložkový rozpad (miesto = len návšteva) sa
          nevykresľuje — zopakovať to isté číslo pod sebou nič nevysvetlí. */}
      {(reward.baseRows?.length ?? 0) > 1 && (
        <div className="comm-reward-break">
          {reward.baseRows!.map((r) => (
            <div key={r.labelKey} className="comm-reward-breakrow">
              <span>{t(r.labelKey, r.labelParams)}</span>
              <b>{r.points}</b>
            </div>
          ))}
        </div>
      )}
      {reward.bonuses.map((b) => (
        <div key={`${b.labelKey}:${b.unit}`} className="comm-reward-row comm-reward-row--bonus">
          <PointsPill value={b.points} tone="bonus" size="md" animate />
          <span className="comm-reward-txt">
            <span className="comm-reward-unit">{b.unit}</span>
            <span className="comm-reward-kind">{t(b.labelKey)}</span>
          </span>
        </div>
      ))}
      {!!ratingPoints && (
        <>
          <hr className="comm-reward-rule" />
          <div className="comm-reward-next">
            <PointsPill value={ratingPoints} tone="bonus" size="md" />
            <span className="comm-reward-nexttxt">{t('pack.community.rewardNextRating')}</span>
          </div>
        </>
      )}
    </div>
  );
}

export function WalkedPopup({ trailName, initial, onSubmit, onClose, rewardPoints, reward }: {
  trailName: string; initial?: WalkedInput | null; onSubmit: (v: WalkedInput) => void; onClose: () => void;
  rewardPoints?: number;
  /** Odmena za PRÁVE zapísané prejdenie — blok hore. Bez nej je to obyčajná úprava hlasu. */
  reward?: WalkReward | null;
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
  // Matej 2026-08-06: „horný nadpis ohodnoť... daj celý preč resp nahraď to tým že v tom istom
  // fonte aj velkosti to centruj na stred a daj nazov tripu (EGREŠ)". Nadpis „Ohodnoť a získaj
  // body" hovoril to isté, čo papyrusový blok pod labkami, len horšie — a názov tripu bol
  // zbytočne odsunutý do podnadpisu. Teraz je názov JEDINÝ nadpis, `sub` sa už nepoužíva.
  return (
    <Modal
      title={trailName}
      onClose={onClose}
      wide
    >
      <style>{POINTS_PILL_CSS}</style>
      {/* PORADIE (Matej 2026-08-06): názov tripu (sub v hlavičke) → HODNOTENIE → vysvetlenie
          odmeny. Labky sú to jediné, čo sa od človeka v tomto kroku chce, takže stoja hore;
          papyrusový blok pod nimi je odpoveď na „a čo z toho mám", nie vstupná bariéra.
          Predtým bol blok prvý a hodnotenie sa strácalo pod ním. */}
      <div className="comm-field" style={{ textAlign: 'center' }}>
        <label className="comm-label">{t('pack.community.walkedRatingLabel')}</label>
        {/* Matej 2026-08-05: „to rate it +3? je úplne stratené" — odmena vyšla z nadpisu von
            ako vycentrovaná pilulka nad labkami.
            2026-08-06: keď je HORE papyrusový blok odmeny, číslo je už v ňom pod čiarou —
            druhá pilulka tu by bola to isté číslo dvakrát na jednej obrazovke (presne tá
            neprehľadnosť, na ktorú Matej ukázal). Zostáva LEN keď blok hore nie je, teda pri
            obyčajnej úprave hlasu bez čerstvej odmeny. */}
        {rewardPoints && !reward ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 11 }}>
            <PointsPill value={rewardPoints} tone="base" size="lg" />
          </div>
        ) : null}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <PawRating value={rating} onChange={setRating} onDark size={40} />
        </div>
      </div>
      {reward && <WalkRewardBlock trailName={trailName} reward={reward} ratingPoints={rewardPoints} />}
      <div className="comm-walked-grid">
        <div className="comm-field">
          <label className="comm-label">{t('pack.community.difficultyLabel')}</label>
          <div className="comm-seg">
            {DIFFICULTIES.map((d) => (
              <button key={d} type="button" className={difficulty === d ? 'on' : ''} onClick={() => setDifficulty(d)}>
                <DiffMark diff={d} /> {diffTx(t, d)}
              </button>
            ))}
          </div>
        </div>
        <div className="comm-field">
          <label className="comm-label">{t('pack.community.crowdLabel')}</label>
          <div className="comm-seg">
            {CROWDS.map((v) => (
              <button key={v} type="button" className={crowd === v ? 'on' : ''} onClick={() => setCrowd(v)}>
                {CROWD_EMOJI[v]} {crowdTx(t, v)}
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
      {/* Zavrieť je pri ponuke ROVNOCENNÁ voľba, nie ✕ v rohu — hodnotenie je dobrovoľné a človek
          to musí vidieť bez hľadania (Matej: „alebo zatvor"). Pod sebou, nie vedľa seba: dve
          tlačidlá v rade sa v dlhších jazykoch na 360 px zlomia. */}
      {rewardPoints ? (
        <button type="button" className="comm-ghostbtn" onClick={onClose}>
          {t('pack.community.notNowBtn')}
        </button>
      ) : null}
    </Modal>
  );
}

// -- ZMAZANE 2026-08-05: WishlistIntentPopup (27 r.) a PartnerAdForm (56 r.) ----------------
// Po zluceni vstupov (★ = jeden klik) nemal WishlistIntentPopup volajuceho, a s nim padol aj
// jediny vstup do PartnerAdForm (otvaral ho `choosePartner`). Verejny inzerat dnes vznika v
// AddTripPlan ("Looking for pack" -> user_trips + trip_events) a zverejnit ulozeny vylet sa da
// v Triplist ("Who can see this trip").
// ⚠️ Co s tym odislo a AddTripPlan to zatial NEVIE: 2-3 navrhy terminov naraz a pole
// "Socialization for this walk". Ak to ma byt sucastou planovaca, je to samostatne zadanie.
// Kod je v historii: git log -- src/components/pack/packCommunityUI.tsx

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
/**
 * NÁROČNOSŤ A RUCH SÚ DÁTOVÉ HODNOTY, NIE TEXT (2026-08-23).
 *
 * `agg.difficulty` je `Easy|Moderate|Hard|Odyssey` a `agg.crowd` je `Empty|Calm|Busy` — to sú
 * kľúče do DB aj do filtra na mape, takže sa neprekladajú. Na obrazovke ich však človek číta,
 * a v slovenskom zozname výletov svietilo „Odyssey" a „🌿 Calm". Slovník je ten istý, aký
 * používa filter mapy aj formulár výletu, nech tá istá vec nemá tri názvy.
 */
type TFn = (key: string, vars?: Record<string, string | number>) => string;
const diffTx = (t: TFn, v?: string | null) => (v ? t(`pack.map.diff.${v}`) : '');
const crowdTx = (t: TFn, v?: string | null) => (v ? t(`pack.map.crowdKind.${v}`) : '');

function diffTip(t: TFn, agg: CrowdAgg): string { return agg.difficultyBreakdown.map((s) => `${s.pct}% ${diffTx(t, s.value)}`).join(' · '); }
function crowdTip(t: TFn, agg: CrowdAgg): string { return agg.crowdBreakdown.map((s) => `${s.pct}% ${crowdTx(t, s.value)}`).join(' · '); }
function hazardTip(agg: CrowdAgg): string { return agg.hazardBreakdown.map((s) => `${s.pct}% reported ${s.value}`).join(' · '); }

// crowd agregát na karte/detaile. „N walked" počet sa TU už NEzobrazuje — presunul sa k autorom
// (svorka čo prešla trip + „+N Dogyptians", Matej 2026-07-22). Hazardy (%) len v detaile.
// belowThreshold/walkedCount:0 (2026-08-03, „začíname so všetkým do nuly") necháva
// difficultyBreakdown/crowdBreakdown prázdne — tooltip sa vtedy nedáva (žiadny prázdny
// rámik na hover), zobrazuje sa len seedová hodnota (difficulty/crowd) bez %-rozpadu.
export function CrowdMeta({ agg, km, compact }: { agg: CrowdAgg; km: string; compact?: boolean }) {
  const t = useT();
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
        data-tip={hasDiffTip ? diffTip(t, agg) : undefined}
      >
        <DiffMark diff={agg.difficulty} /> {diffTx(t, agg.difficulty)} · {km} km
      </span>
      {agg.crowd && (
        <span
          className={`comm-crowd-row${hasCrowdTip ? ' comm-hastip' : ''}`}
          style={{ fontSize: fs }}
          data-tip={hasCrowdTip ? crowdTip(t, agg) : undefined}
        >
          {CROWD_EMOJI[agg.crowd]} {crowdTx(t, agg.crowd)}
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

// ── BigRating — hodnotenie v pravom stĺpci karty a inline detailu.
//
// Matej 2026-08-26: „v zozname potrebujeme packu vyplniť farbou, nie obrys — daj to ako na
// mobile: číslo, 5× packa a v zátvorke hodnotenia."
//
// Do teraz tu stála JEDNA packa (obrys `paw.svg`, len prefarbený filtrom) a vedľa nej veľké
// číslo. Obrysová packa vedľa čísla nič nemeria — je to ikonka, ktorá hovorí „toto je
// hodnotenie", nie stupnica. Päť packiek so zlomkovou výplňou (`RatingPaws`) tú istú hodnotu
// UKAZUJE, a je to ten istý widget, aký nesie článok výletu a jeho mobilná podoba.
//
// Zátvorka = koľko chodcov hlasovalo (`walkedCount` z agregátu, teda `ratings.length`) — váha
// toho čísla. Bez nej „5,0" z jedného hlasu a „5,0" z tridsiatich vyzerajú rovnako.
//
// ⚠️ Poradie je Matejovo (číslo → packy → zátvorka). Článok výletu (`.pta-byrating`) má
// packy pred číslom; keby sa mali zjednotiť, mení sa TAM, nie tu — toto je vypýtaný tvar.
//
// `mini` (2026-08-26) = tretia veľkosť pre PODPISOVÝ RIADOK karty. Matej: „druhý riadok bude
// fotka a meno autora a vedľa hodnotenie — malým písmom." Hodnotenie tam už nie je pravý
// stĺpec karty (kde smie vážiť), ale poznámka vedľa autora — musí sedieť na jeho výšku, inak
// riadok rozhodí. Veľkosť packiek je PROP, nie CSS, takže samotná trieda by nestačila.
export function BigRating({ rating, count, compact, mini }: { rating: number; count?: number; compact?: boolean; mini?: boolean }) {
  return (
    <span className={`comm-bigrating${compact ? ' compact' : ''}${mini ? ' mini' : ''}`}>
      <b>{rating.toFixed(1)}</b>
      <RatingPaws stars={rating} size={mini ? 11 : compact ? 13 : 17} gap={mini ? 1.5 : compact ? 2 : 3} />
      {count != null && count > 0 && <i>({count})</i>}
    </span>
  );
}

// ── PhotoMetaPills — dolný pruh fotky, TRI pilulky vedľa seba (Matej 2026-07-27; predtým dve
// stacknuté v pravom rohu): trasa (↔ km · ↑ m) │ náročnosť │ popularita. Glyfy ↔/↑ sú tie isté
// ako v stat tabuľke článku (PackTripArticle .pta-route) — jeden vizuálny jazyk pre trasu.
// Hazard TU NIE (ten je len v detaile vedľa tagov — HazardTags). Hover na pilulku = %-rozpad
// hlasov členov. Zdieľané karta + inline detail. ──
export function PhotoMetaPills({ agg, km, ascentM, hasRoute = true }: { agg: CrowdAgg; km: string; ascentM?: number; hasRoute?: boolean }) {
  const t = useT();
  // Prázdny breakdown (walkedCount 0, „začíname so všetkým do nuly") → žiadny %-rozpad na
  // ponuku, takže žiadny tooltip (inak by hover ukázal prázdny rámik „Difficulty — ").
  const hasDiffTip = agg.difficultyBreakdown.length > 0;
  const hasCrowdTip = agg.crowdBreakdown.length > 0;
  return (
    <div className="comm-photometa">
      {/* ⚠️ OKRUH NEMÁ ANI JEDNU Z TÝCHTO DVOCH (2026-08-31, `hasRouteMetrics`). Bez čiary
          niet čo merať: km by boli `↔ 0.0 km` a náročnosť fabrikovaná (`needsDifficulty()`
          ju má len pri HIKE, ale `crowdAggregate` jej aj tak dá východiskovú hodnotu).
          Vypadnú OBE naraz, nie „km bez čísla" — prázdna pilulka je horšia než žiadna.
          Ruch nižšie ostáva, ten sa vypĺňa vo všetkých kategóriách. */}
      {hasRoute && (<>
        <span className="comm-mpill">
          ↔ {km} km{ascentM != null ? ` · ↑ ${ascentM} m` : ''}
        </span>
        <span
          className={`comm-mpill${hasDiffTip ? ' comm-hastip' : ''}`}
          data-tip={hasDiffTip ? `${t('pack.map.difficulty')} — ${diffTip(t, agg)}` : undefined}
        >
          <DiffMark diff={agg.difficulty} /> {diffTx(t, agg.difficulty)}
        </span>
      </>)}
      {agg.crowd && (
        <span
          className={`comm-mpill${hasCrowdTip ? ' comm-hastip' : ''}`}
          data-tip={hasCrowdTip ? `${t('pack.map.crowd')} — ${crowdTip(t, agg)}` : undefined}
        >
          {CROWD_EMOJI[agg.crowd]} {crowdTx(t, agg.crowd)}
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
  // ⚠️ TENTO KOMPONENT BOL CELÝ PO ANGLICKY (Matej 2026-08-23, sweep mobilu). Pod slovenským
  // nadpisom SVORKA NA VÝLETE stálo „Add other companions" a „Type a name and press Enter…".
  const t = useT();
  const [q, setQ] = useState('');
  // Otvorí sa samo, keď už nejaký človek vybratý je — inak by po návrate do kroku 5 vyzeralo,
  // že sa vybraté mená stratili.
  const [othersOpen, setOthersOpen] = useState(() => selected.some((c) => !c.key.startsWith('dog-')));
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
  /**
   * ── PES JE V ZOZNAME RAZ, NIE DVAKRÁT (Matej 2026-08-26) ─────────────────────────────
   * „v 5. kroku sú 2× Hektorove fotky — musí byť len jedna! v jednom riadku, na zeleno už
   *  vopred označený."
   * Vlastný pes je predvyplnený, takže sa objavil naraz HORE ako vybratý chip a DOLE
   * v rade „tvoja svorka" so zeleným prstencom. Dva rovnaké portréty nad sebou čítajú ako
   * dvaja psi, nie ako jeden vybratý — a rad svorky to už hovorí sám: zelený = ide s tebou.
   * ⚠️ MENÁ ĽUDÍ V CHIPOCH OSTÁVAJÚ. Tie nemajú svoj rad, v ktorom by sa dali označiť —
   * bez chipu by po napísaní mena nebolo vidieť vôbec nič.
   */
  const namedSelected = selected.filter((c) => !c.key.startsWith('dog-'));
  return (
    <div>
      {namedSelected.length > 0 && (
        <div className="comm-comp-selected">
          {namedSelected.map((c) => (
            <span key={c.key} className="comm-comp-chip">
              {/* meno reálneho člena bez známeho id nie je klikateľné — žiadny odkaz do prázdna. */}
              <span
                className={`comm-comp-chip-av${c.photo ? '' : ' ph'}`}
                style={c.photo ? { backgroundImage: `url('${c.photo}')` } : undefined}
              >
                {c.photo ? '' : c.name.charAt(0).toUpperCase()}
              </span>
              <b>{c.name}</b>
              <button type="button" onClick={() => remove(c.key)} aria-label={t('pack.companions.remove', { name: c.name })}>×</button>
            </span>
          ))}
        </div>
      )}
      {myDogs.length > 0 && (
        <>
          <div className="comm-comp-grouplabel">{t('pack.companions.yourPack')}</div>
          <div className="comm-comp-pack">
            {myDogs.map((d) => {
              const on = selectedKeys.has(`dog-${d.id}`);
              return (
                <button key={d.id} type="button" className={`comm-comp-dog${on ? ' on' : ''}`} onClick={() => toggleDog(d)}>
                  <span className={`comm-comp-dog-av${d.photo ? '' : ' ph'}`} style={d.photo ? { backgroundImage: `url('${d.photo}')` } : undefined}>
                    {d.photo ? '' : (d.name || 'D').charAt(0).toUpperCase()}
                  </span>
                  <span>{d.name || t('pack.companions.myDog')}</span>
                  {!on && <span className="plus">+</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
      {/* ── MENÁ ĽUDÍ SA OTVÁRAJÚ, NESTOJA OTVORENÉ (Matej 2026-08-25) ──────────────────
          „musíme zjednodušiť to pridávanie členov — je to matúce… musí tam svietiť hlavy
           psov a po kliknutí sa zazelenajú a potom bude +, ktoré otvorí textareu, kde môže
           človek písať mená dogypťanov."
          Matúce to bolo tým, že sa naraz ponúkali DVE rôzne veci: hlavy psov (jeden ťuk)
          a textové pole (napíš a potvrď). Pole vyzeralo ako hlavná cesta, hoci väčšina
          výletov je „ja a môj pes" a stačil ten jeden ťuk. Teraz je viditeľné len +;
          kto ho potrebuje, otvorí si ho. */}
      {!othersOpen && (
        <button type="button" className="comm-comp-openothers" onClick={() => setOthersOpen(true)}>
          <span className="comm-comp-openplus">+</span>
          <span>{t('pack.companions.addOthers')}</span>
        </button>
      )}
      {othersOpen && (
      <>
      <div className="comm-comp-grouplabel">{t('pack.companions.addOthers')}</div>
      {/* ── PRIDANIE NESMIE VISIEŤ NA ENTERI (Matej 2026-08-25) ──────────────────────────
          „nefunguje načítanie členov podľa mena… každopádne ak to tam bude, musí to byť
           funkčné."
          Pole fungovalo — len jedinou cestou dnu bol Enter, a na telefónnej klávesnici je
          tam „hotovo"/„prejsť", nie zjavné potvrdenie. Kto meno napísal a ťukol vedľa,
          nedostal nič a pole vyzeralo pokazené. Tlačidlo je viditeľné potvrdenie tej istej
          akcie; Enter funguje ďalej pre toho, kto píše na klávesnici.
          ⚠️ Vypnuté, kým nie je čo pridať — tlačidlo, ktoré po ťuknutí mlčí, je ten istý
          problém len o krok neskôr. */}
      <div className="comm-comp-searchwrap">
        <div className="comm-comp-searchrow">
          <input
            className="comm-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTyped(); } }}
            placeholder={t('pack.companions.typeName')}
          />
          <button
            type="button"
            className="comm-comp-addbtn"
            onClick={addTyped}
            disabled={!q.trim()}
            aria-label={t('pack.companions.addTyped')}
            title={t('pack.companions.addTyped')}
          >
            +
          </button>
        </div>
      </div>
      </>
      )}
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
    // Odkaz do legendy pribudol s jeho zapojením do skóre (25. 8. 2026) — dovtedy tu chýbal,
    // hoci dlaždica ODKAZ pri pridávaní jeho cenu vypisovala.
    ['Map note', `+${POINTS.note}`],
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
/**
 * ── RIADOK PREJDENÉHO VÝLETU — OKRUH TU KM TIEŽ NEMÁ (2026-09-02) ─────────────────────────
 * Tri riadky nižšie písali `{region} · {km} km` na všetko, takže návšteva nakreslená klikom
 * do mapy hlásila „0.0 km" aj v tripliste. Je to tá istá lož ako na karte, v článku a na mape,
 * len na piatom povrchu — a triplist je pritom jedna z troch stránok, ktoré člen dnes vidí.
 * Región ostáva: ten okruh MÁ. Vypadne len číslo, ktoré neexistuje, aj s oddeľovačom pred ním
 * (osamotená bodka na konci riadku vyzerá ako chýbajúci text).
 */
const walkedMeta = (tr: HeroTrail, withRegion: boolean): string => {
  const km = hasRouteMetrics(tr) ? `${tr.km} km` : '';
  const region = withRegion ? tr.region : '';
  return [region, km].filter(Boolean).join(' · ');
};

export function TripStatsPanel({ walkedTrails, walkedKm, onOpenTrip, onAddTrip }: {
  walkedTrails: HeroTrail[];
  walkedKm: number;
  onOpenTrip: (id: string) => void;
  onAddTrip: (region?: string) => void; // klik na jednotku → ADD TRIP pre-filled na dané pohorie/park (Slice A bod 3)
}) {
  // ⚠️ 2026-08-05: `t` tu CHÝBALO, hoci rozpad bodov v ⓘ popupe ho volá (`t(r.labelKey…)`) —
  // popup teda spadol na ReferenceError každému, kto má aspoň jeden bod. tsc to hlásil, vite
  // build nie (netypuje). Nájdené pri zapájaní hodnotení do bodov.
  const t = useT();
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

  // Vlajky do hlavičky profilu: LEN krajiny, kde človek naozaj bol. `countries` obsahuje aj
  // ponúkané prázdne štáty (pás chipov nižšie ich zobrazuje ako "not yet"), tie sem nepatria.
  const walkedCountryList = useMemo(() => countries.filter((c) => c.trips > 0), [countries]);

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
  // `walkedCountries()`, nie `byCountry.size` — to isté číslo musí mať hlavička mapy aj tento
  // panel z JEDNEJ funkcie, inak sa levely rozídu (stalo sa, 2026-08-06).
  const countriesTraveled = walkedCountries(walkedTrails);
  const peaksDone = completion.categories.find((c) => c.key === 'peaks')?.done ?? [];
  const highest = peaksDone[0] ?? '—';
  // per-unit rozbaliteľný dropdown (Slice A bod 2) — jedna otvorená naraz, identifikovaná
  // kategóriou+menom (rovnaké meno jednotky sa opakuje naprieč kategóriami, napr. „Malé Karpaty"
  // v ranges aj chko).
  const [expanded, setExpanded] = useState<{ cat: GeoCategory; unit: string } | null>(null);
  // Fáza 2 (Matej 2026-07-24): „Trips you walked" schovať za dropdown — pri 60 prejdených
  // tripoch to bol nekonečný zoznam pod celým panelom. Zbalené default, počet v hlavičke.
  const [walkedOpen, setWalkedOpen] = useState(false);
  // Magistrály zbalené (Matej 2026-08-06) — zoznam pre menšinu nesmie tlačiť pohoria pod okraj.
  const [journeysOpen, setJourneysOpen] = useState(false);
  // ⓘ pri titule krajiny (Matej 2026-08-06: „nevidím ten popup v krajine"). Zatvára sa klikom
  // kamkoľvek — rovnaký document listener ako `ptsOpen`, z rovnakého dôvodu (backdrop-filter
  // na .pk-glass robí containing block aj pre position:fixed, priesvitný backdrop by nepokryl
  // stránku). Popup si klik na seba zastavuje sám.
  // ── ŠKÁLA PÁSIEM po kliku na pilulku levelu (Matej 1. 9. 2026: „po kliku má byť vidno
  // farby levelov - popup"). Nie je to nová obrazovka — `TierScale` existuje od 24. 8. a
  // jeho vlastná hlavička cituje presne túto požiadavku („v tripstats po kliknutí na pils
  // levelu ukázať v dropdowne to poradie a farby levelov"); dovtedy ho volal len panel
  // levelu na mape. Tu sa len konečne zapája tam, kam bol napísaný.
  const [tierOpen, setTierOpen] = useState(false);
  useEffect(() => {
    if (!tierOpen) return;
    const close = () => setTierOpen(false);
    const tm = window.setTimeout(() => document.addEventListener('click', close), 0);
    return () => { window.clearTimeout(tm); document.removeEventListener('click', close); };
  }, [tierOpen]);
  const [ranksOpen, setRanksOpen] = useState(false);
  useEffect(() => {
    if (!ranksOpen) return;
    const close = () => setRanksOpen(false);
    const tm = window.setTimeout(() => document.addEventListener('click', close), 0);
    return () => { window.clearTimeout(tm); document.removeEventListener('click', close); };
  }, [ranksOpen]);
  // `setRanksOpen(false)` — popup ranku nesie meno krajiny v nadpise; nechať ho otvorený cez
  // prepnutie krajiny by ukazoval prahy pod iným menom, než na aké sa človek díval.
  const pickCountry = (iso: string) => { setCountry(iso); setExpanded(null); setWalkedOpen(false); setRanksOpen(false); };

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
  // Matej 2026-08-05: „pes je veľmi uctievaný ale usecase je stavaný pre človeka" → v TRIPSTATS
  // hlavičke ide MAJITEĽ PRVÝ a psy za ním („Matej & Hektor"), nie naopak.
  // ⚠️ Vedomá výnimka z pravidla „pes je nadradený" — platí IBA tu. Heroglyf (majiteľ vnútri
  // rámiku psa), share karty ani certifikát sa nemenia.
  const packName = dogNames.length > 0 ? [ownerName, ...dogNames].join(' & ') : ownerName;
  // LEVEL z BODOV, nie z počtu tripov (issue #33; lock „level = počet tripov" z 23. 7. padol
  // 25. 7.). Body sa počítajú z toho, čo človek reálne má — prejdené trasy, ich km/stúpanie,
  // pevné ceny magistrál a odškrtnuté geo jednotky. Vďaka tomu sa level nemôže rozísť s dátami.
  // Zdroj cien + krivky = dashboard tab Mapa, sekcia 03/05 (viď src/lib/tripPoints.ts).
  // `approvedAddedIds` (2026-08-05) — +20 len za MOJE a SCHVÁLENÉ výlety; bez neho stačilo
  // nahodiť výlet a level vyskočil skôr, než ho Matej v /admin vôbec videl. `ratings` musia ísť
  // dnu tiež, inak legenda nižšie sľubuje „+3 za hodnotenie", ktoré sa v súčte nikdy neobjaví.
  // `storeEpoch` = prepočet v momente, keď dobehne hydratácia z DB (obe čítajú z úložiska).
  const storeEpoch = usePackStoreEpoch();
  const { addedByMe, myRatings } = useMemo(() => ({
    addedByMe: approvedAddedIds(addedByMeIds(walkedTrails, { ownerName, isFounder: isFounderEmail(id.session?.user?.email) })),
    myRatings: ratedCountFor(walkedTrails, readVotes()),
  }), [walkedTrails, ownerName, id.session, storeEpoch]);
  // Odkazy sa do skóre pripočítali až 25. 8. 2026 — dovtedy appka sľubovala +3 za kus na troch
  // miestach a neplatila ani raz. Číslo chodí hotové (po stropoch) z jedného zdroja, nech sa
  // štyri povrchy s levelom nerozídu.
  const myNotePoints = useMyNotePoints();
  const profilePoints = profilePointsFor(walkedTrails, { addedIds: addedByMe, ratings: myRatings, countries: countriesTraveled, notePoints: myNotePoints });
  const lvl = levelProgress(profilePoints.total);

  return (
    <>
      {/* BLOK 1 — identita svorky + WORLD staty + hero badges zbierka (Matej 2026-07-24: rozdelenie
         jedného veľkého panelu na dva samostatné bloky).
         2026-09-01 (DRAK → BRIGHT): `.pk-glass` (tmavé sklo) je preč — `.tl-panel` je od
         prezlečenia triplistu papyrusová KARTA (úroveň 1 matrice). Predpis žije v
         `PackTriplist.tsx`, lebo panel je jeho; tento komponent si ho len požičiava. */}
      <section className="tl-panel">
      {/* IDENTITY header — foto svorky (psy + owner, priestor pre budúceho member) + level odznak. */}
      {/* `tierVars` visí na CELOM bloku, aby farbu pásma zdedila pilulka AJ pruh postupu —
          sú to dva prvky, ktoré musia hovoriť to isté, a druhá sada čísel by sa rozišla. */}
      <div className="comm-vhead" style={tierVars(lvl.level)}>
        {/* Poradie fotiek = poradie mien (Matej 2026-08-05): človek prvý, psy za ním. */}
        <div className="comm-vhead-pack">
          <span className="comm-vavatar comm-vavatar--owner">
            {id.avatarUrl ? <img src={id.avatarUrl} alt="" /> : id.avatarInitial}
          </span>
          {id.dogs.map((dog) => (
            <span key={dog.id} className="comm-vavatar comm-vavatar--dog">
              {dog.cloudinary_main_url ? (
                <img src={dog.cloudinary_main_url} alt={dog.dog_name || ''} />
              ) : (
                <img className="comm-vavatar-fallback" src={ICON('paw')} alt="" />
              )}
            </span>
          ))}
        </div>
        {/* MENO + LEVEL PILULKA VEDĽA SEBA (Matej 2026-08-06: „pils dajme vedla nie pod").
            Predtým bola pilulka o riadok nižšie a meno stálo samo — dva riadky na to, čo je
            jedna informácia: kto som a kde som. */}
        <div className="comm-vhead-id">
          <div className="comm-vhead-name">{packName}</div>
          {/* PILULKA JE TLAČIDLO — farba pásma bez vysvetlenia je len ozdoba; klik otvorí
              škálu, kde je vidieť, čo tá farba znamená a čo príde po nej.
              Ikonka ide MASKOU (`background: currentColor`), nie filtrom: inkoust pásma je
              raz tmavý a raz svetlý (`tier.ink`), takže filter by sa musel prepočítavať ku
              každému z deviatich pásiem zvlášť. */}
          <span className="comm-tierwrap">
            <button
              type="button"
              className="comm-level-pill"
              style={tierPillStyle(lvl.level)}
              onClick={(e) => { e.stopPropagation(); setTierOpen((v) => !v); }}
              aria-expanded={tierOpen}
              aria-label={`${lvl.rank}, level ${lvl.level} — ${tierOfLevel(lvl.level).name}`}
            >
              <span className="comm-level-ic" style={{ '--ic': `url(${ICON('trophy')})` } as React.CSSProperties} />
              {lvl.rank} · Level {lvl.level}
            </button>
            {tierOpen && (
              <span className="comm-tiers" onClick={(e) => e.stopPropagation()}>
                <span className="comm-pts-eyebrow">Level colours</span>
                <TierScale level={lvl.level} onDark={false} />
                <span className="comm-pts-rule" />
                {/* DVA STĹPCE: vľavo cenník (platí pre každého), vpravo MOJE body + TOTAL.
                    Sú to dve odpovede na dve rôzne otázky — „za čo sa dávajú" a „za čo mám ja" —
                    takže patria vedľa seba, nie pod seba oddelené linajkou. */}
                <span className="comm-pts-cols">
                  <span className="comm-pts-col">
                    <span className="comm-pts-eyebrow">How points work</span>
                    {pointsLegend().map(([label, val]) => (
                      <span key={label} className="comm-pts-row">{label}<b>{val}</b></span>
                    ))}
                    {/* ⚠️ Ranky krajiny tu BOLI a sú PREČ (Matej 2026-08-06: „odtialto to coutry
                        zruš"). Žijú pri titule krajiny, kde ten rank aj svieti — mať ich na dvoch
                        miestach znamená dva zoznamy, ktoré sa raz rozídu. Nevracaj ich sem. */}
                  </span>
                  <span className="comm-pts-col">
                    <span className="comm-pts-eyebrow">Your points</span>
                    {profilePoints.rows.length > 0 ? (
                      <>
                        {profilePoints.rows.map((r) => (
                          <span key={r.labelKey} className="comm-pts-row">{t(r.labelKey, r.labelParams)}<b>{r.points}</b></span>
                        ))}
                        <span className="comm-pts-rule" />
                        <span className="comm-pts-tot">Total<b>{profilePoints.total}</b></span>
                      </>
                    ) : (
                      <span className="comm-pts-none">Nothing yet — your first walked trip starts the count.</span>
                    )}
                  </span>
                </span>
              </span>
            )}
          </span>
          {/* VLAJKY PRECESTOVANÝCH KRAJÍN (Matej 2026-08-06: „za pil levelu by sme mohli dať
              vlajky štátov kde sme boli a tam by sa pridávaly"). Zbierka, ktorá rastie sama —
              nič sa nenastavuje, vlajka pribudne prvým výletom v novej krajine.
              LEN prejdené: prázdne štáty patria do pásu chipov nižšie („not yet" = pozvánka),
              tu by z trofeje spravili checklist. Klik = prepnutie vysvedčenia na tú krajinu,
              takže to nie je len ozdoba. */}
          {walkedCountryList.length > 0 && (
            <span className="comm-vflags">
              {walkedCountryList.map((c) => (
                <button
                  key={c.iso}
                  type="button"
                  className={`comm-vflag${c.iso === country ? ' on' : ''}`}
                  onClick={() => pickCountry(c.iso)}
                  title={`${c.name} · ${c.trips} trip${c.trips === 1 ? '' : 's'}`}
                  aria-label={`${c.name}, ${c.trips} trips`}
                >
                  <FlagCircle iso2={c.iso} label={c.name} size={22} />
                </button>
              ))}
            </span>
          )}
        </div>
        {/* ⚠️ ⓘ V PRAVOM HORNOM ROHU ZANIKLO (Matej 1. 9. 2026: „spojiť dva popupy na hlavičke
            do jedného ako na mape"). Hlavička mala DVA výklady toho istého: pilulka ukazovala
            farby pásiem, ⓘ cenník bodov — dve tlačidlá, dve rôzne polohy, jedna téma. Mapa to
            má od 24. 8. v JEDNOM paneli (LevelPanel: škála pásiem + rozpad bodov pod ňou),
            takže vysvedčenie bolo jediné miesto, kde sa to čítalo na dvakrát.
            Všetko teraz visí na pilulke levelu — tam, kde to číslo aj svieti. */}
        {/* #46 — progressbar do ďalšieho levelu na celú šírku hlavičky. Percento pruhu aj
            chýbajúce body dáva levelProgress() z bodového enginu; panel si nič nepočíta sám. */}
        <div className="comm-lvlwrap">
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
        {/* MENO VRCHOLU ide v Cinzeli (identita miesta), nie zmenšeným Space Groteskom —
            trieda `--name` prepína písmo aj veľkosť, aby to nerobil inline style. Pomlčka
            (žiadny vrchol) ostáva číselným písmom: je to prázdna hodnota, nie meno. */}
        <div className={`comm-wstat${highest === '—' ? '' : ' comm-wstat--name'}`}><b>{highest}</b><span>Highest point</span></div>
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
      <section className="tl-panel" style={{ marginTop: 14 }}>
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
            {/* ⓘ PRI SAMOTNOM TITULE (Matej 2026-08-06: „nevidím ten popup v krajine").
                Vysvetlivku ranku som najprv dal len do profilového ⓘ hore — lenže titul svieti
                TU, o obrazovku nižšie, takže to nikto nespojí. Vysvetlenie patrí k veci, ktorú
                vysvetľuje. Prahy priamo z COUNTRY_TIERS — toto je JEDINÉ miesto, kde sú
                vypísané (v profilovom ⓘ boli krátko a Matej ich odtiaľ dal preč). */}
            <div className="comm-chero-goaltxt">
              <span>
                {tier.earned ? `${tier.earned} · ` : ''}
                {tier.next ? `${cTrails.length}/${tier.nextAt} trips to ${tier.next}` : 'every tier taken'}
              </span>
              <span className="comm-rankinfo">
                <button
                  type="button"
                  className={`comm-rankinfo-btn${ranksOpen ? ' on' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setRanksOpen((v) => !v); }}
                  aria-expanded={ranksOpen}
                  aria-label="How country ranks work"
                >i</button>
                {ranksOpen && (
                  <span className="comm-ranks" onClick={(e) => e.stopPropagation()}>
                    <span className="comm-pts-eyebrow">{cName} ranks</span>
                    <span className="comm-pts-note">Earned separately in every country, by trips walked there.</span>
                    {COUNTRY_TIERS.map((ct) => {
                      const done = cTrails.length >= ct.trips;
                      const isNext = !done && ct.trips === tier.nextAt;
                      return (
                        <span key={ct.title} className={`comm-pts-row comm-rankrow${done ? ' done' : ''}${isNext ? ' next' : ''}`}>
                          {ct.title.charAt(0).toUpperCase() + ct.title.slice(1)}
                          <b>{done ? `✓ ${ct.trips}` : `${cTrails.length}/${ct.trips}`}</b>
                        </span>
                      );
                    })}
                  </span>
                )}
              </span>
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
                <span className="comm-walkedrow-meta">{walkedMeta(tr, true)}</span>
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
              {/* Matej 2026-08-06: „na dropdown, teraz je to strašne dlhé neforemné". Jedenásť
                  magistrál je zoznam pre menšinu — zbalený je z neho jeden riadok so zlomkom,
                  rozbalený je to presne to, čo bolo predtým. Default ZAVRETÝ. */}
              <button
                type="button"
                className={`comm-cat-head comm-cat-head--btn${journeysOpen ? ' on' : ''}`}
                onClick={() => setJourneysOpen((v) => !v)}
                aria-expanded={journeysOpen}
              >
                <span className="comm-cat-name">{c.label}</span>
                <span className="comm-cat-count">{c.done.length}/{c.total}</span>
                <span className="comm-drop-chev" />
              </button>
              {/* ⚠️ NIE `hidden={!open}` — `.comm-jrows` má `display:flex`, ktorý atribút
                  `hidden` (display:none z UA štýlov) prebije, a zoznam by ostal viditeľný. */}
              {journeysOpen && (
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
              )}
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
                          <span className="comm-walkedrow-meta">{walkedMeta(tr, false) && `· ${walkedMeta(tr, false)}`}</span>
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
        //
        // ── VODY NESÚ AJ TO, ČO SI NAOZAJ PREŠIEL (Matej 1. 9. 2026) ────────────────────
        // „do water treba pridať nie top - ale všetky prejdené z triplistu."
        // Kurátorovaná osmička v SK_GEO je CIEĽOVNÍK (Liptovská Mara, Domaša, plesá…) a
        // ostáva — je to zbierka, ktorú má zmysel dokončiť. Lenže výlet na Kráľovú, Sĺňavu
        // či Palcmanskú Mašu neodškrtol NIČ, takže človek videl osem cudzích mien a ani
        // jedno svoje. Preto sa za osmičku pripájajú všetky prejdené vodné plochy, ktoré
        // v nej nie sú — vždy ako ZÍSKANÉ, lebo tam bol.
        // ⚠️ TOTO JE LEN ZOBRAZENIE. `unitsForTrail()` (a teda BODY za „novú vodu") sa
        //    NEMENÍ: keby sa každá prejdená plocha stala jednotkou, dostal by za ňu +10
        //    spätne každý, komu sa dnes nezapočítala — to je zmena výplaty, nie vizuálu.
        //    Rozšírenie preto žije tu, v renderi, a nie v computeCompletion.
        const extraUnits = c.key === 'waters'
          ? cTrails.filter(isWaterTrail).map((tr) => tr.name)
              .filter((n, i, arr) => arr.indexOf(n) === i && !SK_GEO_UNITS('waters').includes(n))
          : [];
        const units = [...SK_GEO_UNITS(c.key), ...extraUnits];
        return (
          <div key={c.key} className="comm-cat">
            <div className="comm-cat-head">
              <span className="comm-cat-name">{c.label}</span>
              <span className="comm-cat-count">{c.done.length + extraUnits.length}/{c.total + extraUnits.length}</span>
            </div>
            <div className="comm-medals">
              {units.map((u) => {
                const earned = c.done.includes(u) || extraUnits.includes(u);
                const logo = c.key === 'parks' ? NP_LOGO[u] : c.key === 'chko' ? CHKO_LOGO[u] : undefined;
                // Biely kruh LEN keď prejdené (Matej 2026-07-24): neprejdené CHKO/park = len vybledne,
                // bez krúžku. Earned CHKO + earned TANAP/Pieniny = biely disk (tmavý text čitateľný, vidno text okolo).
                const onDisc = (c.key === 'chko' || NP_DISC.has(u)) && earned;
                const logoCls = logo
                  ? `comm-medal-ic comm-medal-ic--logo${onDisc ? ' comm-medal-ic--disc' : ''}${NP_BIG.has(u) ? ' comm-medal-ic--big' : ''}`
                  : '';
                return (
                  <div key={u} className={`comm-medal ${earned ? 'comm-medal--on' : 'comm-medal--off'}${c.key === 'peaks' || c.key === 'waters' ? ' comm-medal--lapis' : ''}`}>
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
              <span className="comm-walkedrow-meta">{walkedMeta(tr, true)}</span>
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

export function EventsView({ events, trailsById, onJoin, onToggleClosed, onOpenTrip, onOpenProfile, photoFor, onBrowseTrips, myId, onShareTrip, onDelete }: {
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
  /** Zrušenie VLASTNEJ pozvánky (2026-08-22). Ruší sa inzerát, nie plán — výlet ostáva
   *  v tripliste. Chýba = tlačidlo sa nevykreslí. */
  onDelete?: (id: string) => void;
}) {
  // ⚠️ Hook MUSÍ stáť nad `if (events.length === 0)` — za skorým návratom by sa pri prechode
  //    z prázdneho na neprázdny zoznam zmenil počet zavolaných hookov a React by spadol.
  const t = useT();
  if (events.length === 0) {
    // ⚠️ Tento zoznam drží LEN MOJE inzeráty — `trip_events` sa ťahá s `.eq('host_id', uid)`
    // a cudzie sa sem zámerne neťahajú (packStore.ts:508). Veta preto nesmie znieť „nikto
    // nič neplánuje" — pack môže mať otvorených výletov koľko chce a tento panel ich nevidí.
    // Cudzie otvorené výlety žijú v Triplist → OPEN TRIPS FROM THE PACK (useOpenTrips.ts).
    return (
      <div className="comm-emptybox">
        <p>{t('pack.community.noAnnouncedWalk')}</p>
        {onBrowseTrips && <button type="button" className="comm-emptybtn" onClick={onBrowseTrips}>{t('pack.community.browseTrips')}</button>}
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
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

// Jeden inzerát. Vydelené z `EventsView`, lebo partia (`get_trip_party`) je hook — a počet
// „ide N Dogypťanov" musí sedieť s tým, čo rozbalí buddy list. Predtým to bolo `seedGoing`
// (vymyslený počet ostatných) a po purge už len konštantná 1.
function EventCard({ ev, tr, onJoin, onToggleClosed, onOpenTrip, onOpenProfile, photoFor, myId, onShareTrip, onDelete }: {
  ev: PartnerEvent;
  tr: HeroTrail | undefined;
  onJoin: (id: string) => void;
  onToggleClosed?: (id: string) => void;
  onOpenTrip: (id: string) => void;
  onOpenProfile?: (memberId: string) => void;
  photoFor?: (tr: HeroTrail) => string;
  myId?: string | null;
  onShareTrip?: (tripId: string) => void;
  onDelete?: (id: string) => void;
}) {
  const t = useT();
  const isMine = isMyEvent(ev);
  // partiu vieme dotiahnuť len pre VLASTNÝ inzerát (organizátor = auth.uid(), default v RPC)
  const party = useTripParty(isMine ? ev.tripId : null);
  // organizátor + tí, čo sa reálne pridali. `joiners` organizátora nevracia (useTripParty),
  // takže seba pripočítavam podľa `joinedByMe` — presne ako doteraz, len bez mock zvyšku.
  const going = party.joiners.length + (ev.joinedByMe ? 1 : 0);
  const whenLabel = ev.dates.length > 0 ? ev.dates.join(' or ') : (ev.month ? `${ev.month} (flexible)` : 'Flexible');
  // ⚠️ `ev.host` po hydratácii z DB CHÝBA — `trip_events` meno hostiteľa nedrží (len `host_id`).
  // Do 22. 8. tu bolo holé `ev.host.charAt(0)` a zhodilo to celú mapu, len čo človek na druhom
  // zariadení klikol na UDALOSTI. Tento panel navyše vypisuje VÝHRADNE moje inzeráty
  // (`.eq('host_id', uid)`), takže keď meno chýba, správna náhrada nie je „—", ale „ty".
  const hostLabel = ev.host?.trim() || t('pack.eventsList.hostYou');
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
          {/* Typový štítok (Matej 2026-08-06) — zoznam UDALOSTÍ vedome mieša naplánované
              výlety (toto) s podujatiami (EventCard.tsx). Rozdiel: po tomto zostane MIESTO
              (vsiakne sa do tripu ako log), po podujatí len záznam v archíve. */}
          <div className="comm-plan-type">{t('pack.eventsList.typeTrip')}</div>
          <div className="comm-plan-name" onClick={() => onOpenTrip(ev.tripId)} style={{ cursor: 'pointer' }}>{tr?.name ?? 'Planned walk'}</div>
          <div className="comm-plan-meta">
            {whenLabel} · hosted by{' '}
            <HostNameLink host={hostLabel} />
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
            {hostLabel.charAt(0)}
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
        {/* ZRUŠIŤ POZVÁNKU — len autor (2026-08-22). Zámok a mazanie sú dve rôzne veci
            a musia tak aj vyzerať: zámok povie „už nikoho neberiem", mazanie „táto pozvánka
            nikdy nebola". Zámok preto ostáva prvý a dostupný skôr — mazanie je pod ním
            a pýta sa. Výlet v plánoch prežije, čo hovorí aj text otázky. */}
        {isMine && onDelete && (
          <DeleteButton
            label={t('pack.eventsList.deleteListing')}
            hint={t('pack.eventsList.deleteListingAsk')}
            onConfirm={() => onDelete(ev.id)}
          />
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
