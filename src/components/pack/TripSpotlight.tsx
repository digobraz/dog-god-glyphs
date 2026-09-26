// TripSpotlight — druhý blok homepage `/pack` (Matej 2026-08-09).
//
// Riadok delený 70 / 30:
//   · 70 % = PLAGÁT VÝLETU — vzor `.hub-hero` z `pages/PackDogs.tsx` (fotka cez celú
//     kartu + dvojitý gradient + text zarovnaný dole + rohová stuha). Vedie na konkrétny
//     výlet cez `tripPath()`.
//   · 30 % = PLANÉTA — cobe guľa s reálnymi kontinentmi a pinmi výletov, odkaz na
//     `/pack/map`. Matej: „treba aby bola viditeľná mapa sveta, kontinenty a piny".
//
// NAHRÁDZA `NextTripCard` (issue #44). Ten robil ten istý odpočet plánovaného výletu —
// keby bežali oba, člen by mal na homepage odpočet dvakrát. `NextTripCard.tsx` sa NEMAZAL,
// parkuje ako `PackTree`/`DailyPrayers`; logika (`readTriplist()` + rozdiel KALENDÁRNYCH
// dní) je prebratá sem 1:1 vrátane dôvodu, prečo sa nepočítajú hodiny.
//
// Zdroj pravdy pre výlety je ten istý ako v mape: `readLocalTrails()` + HERO_JOURNEYS +
// HERO_TRAILS. Nikdy nie placeholdery, ktoré si PackTriplist seeduje do vlastného stavu —
// odpočet na neexistujúci výlet je klamstvo (to je presne to, čo riešila issue #44).
import { sizedUrl } from '@/services/cloudinaryService';
import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PLANNING_LIVE } from '@/lib/packFlags';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { readLocalTrails, readWalkedIds, tripPath, pluralKey, visibleLocalTrails, RatingPaws } from './tripShared';
import { readTriplist } from './triplist/triplist';
import { parsePlanDate, planDateLabel, planStart } from './addtrip/planDate';
import { planPhase } from './planReminder';
import { tierVars } from '@/lib/packTiers';
import { PACK_THEME, FONT_TITLE, FONT_UI, GOLD_BTN } from './packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from './navGoldSkin';
import { PackTrailSketch } from './PackTrailSketch';
import { trailCountry } from '@/lib/countryGeo';
import { placeholderFor } from '@/lib/tripPlaceholder';
import { useMyNotePoints } from '@/components/pack/mapnotes/useMyNotePoints';
import { useMyEventCount } from '@/components/pack/events/eventStore';
import { useMyWishCount } from '@/components/pack/mapnotes/wishData';
import { profileLevelFor, readVotes, readPlans } from './packCommunity';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const DAY_MS = 86400000;

// Pilulka s odpočtom = LOCKED vizuál pilulky dní (zdroj pravdy `PackTree.tsx`).
// Ten istý údaj („koľko dní") má mať naprieč appkou ten istý tvar.
const DAYS_PILL = {
  background: 'linear-gradient(180deg, #F5C73D 0%, #E69E1A 100%)',
  color: '#3d1f00',
  letterSpacing: '0.02em',
} as const;

// ⚠️ Guľa je BLEDÁ (2026-08-12, Matej: „zmeňme to na bledú verziu pretože to na tom
// čiernom pozadí zaniká"). Tým padol lock z 9.8., že karta je tmavá zámerne — dôvodom
// bola obava z duplicity s bledou guľou v `GlobePulse` nižšie. Odlíšenie teraz nerobí
// FARBA, ale KOMPOZÍCIA: tu je guľa orezaná hranou karty (vidno ~štvrtinu) a nesie
// tri tmavé pilulky, dole je celá guľa v strede karty. Farebne sú obe papyrusové.
const SPIN = 0.0011;     // rad/frame, ~jedna otáčka za 95 s

// ── CSS ──────────────────────────────────────────────────────────────────────
// ⚠️ Toto je JS template literal: spätný apostrof v CSS komentári zhodí build a `tsc`
//    to nechytí. Po zásahu vždy `npm run build` (rovnaká pasca ako HUB_CSS v PackDogs).
const CSS = `
/* 62/38, nie 70/30 (Matej 9.8.: „skús zväčšiť pravý blok s planétkou"). Guľa + stĺpec
   pilulek vedľa seba potrebujú šírku; pri 30 % by pilulky ležali na guli. */
.ts-row{ display:grid; grid-template-columns: 62fr 38fr; gap:16px; }
.ts-hero{
  position:relative; overflow:hidden; display:flex; align-items:flex-end;
  min-height:300px; padding:32px 32px 24px;
  border-radius:16px; border:1px solid rgba(201,154,63,0.5);
  box-shadow:0 30px 74px -32px rgba(0,0,0,0.95);
  text-decoration:none; cursor:pointer;
  transition: transform .2s ease, box-shadow .2s ease;
}
.ts-hero:hover{ transform: translateY(-2px); }
.ts-art{
  position:absolute; inset:0; width:100%; height:100%; z-index:0;
  object-fit:cover; object-position:center 38%; pointer-events:none;
}
/* Gradient je to jediné, co drží text citatelný na cudzej fotke — vlavo kvôli textu,
   zdola kvôli CTA. Fotky výletov sú casto svetlé (obloha, sneh). */
.ts-hero::before{
  content:''; position:absolute; inset:0; z-index:1; pointer-events:none;
  background:
    linear-gradient(to right,
      rgba(4,2,0,0.58) 0%, rgba(4,2,0,0.12) 42%, rgba(4,2,0,0.16) 66%, rgba(4,2,0,0.52) 100%),
    linear-gradient(to top,
      rgba(4,2,0,0.94) 6%, rgba(4,2,0,0.72) 40%, rgba(4,2,0,0.18) 78%, transparent 100%);
}
.ts-body{ position:relative; z-index:2; width:100%; min-width:0; }
.ts-ribbon{
  position:absolute; top:24px; right:-56px; z-index:3; pointer-events:none;
  width:200px; text-align:center; transform:rotate(45deg); padding:8px 0;
  font-family:${FONT_UI}; font-weight:600; font-size:10px;
  letter-spacing:0.22em; text-transform:uppercase; color:#04140f;
  background:#1AA39A; box-shadow:0 6px 18px rgba(0,0,0,0.5);
}
.ts-count{
  position:absolute; top:22px; left:24px; z-index:3;
  display:inline-flex; align-items:center; gap:7px;
  padding:8px 16px; border-radius:999px; white-space:nowrap;
  font-family:${FONT_TITLE}; font-weight:700; font-size:13px;
  box-shadow:0 6px 20px -6px rgba(0,0,0,0.9);
  animation: ts-glow 2.6s ease-in-out infinite;
}
@keyframes ts-glow{
  0%,100%{ box-shadow:0 6px 20px -6px rgba(0,0,0,0.9), 0 0 0 0 rgba(245,199,61,0.42); }
  50%{ box-shadow:0 6px 20px -6px rgba(0,0,0,0.9), 0 0 0 9px rgba(245,199,61,0); }
}
@media (prefers-reduced-motion: reduce){ .ts-count{ animation:none; } }
.ts-chip{
  font-family:${FONT_UI}; font-size:10.5px; letter-spacing:0.14em;
  text-transform:uppercase; color:rgba(255,246,226,0.9);
  background:rgba(4,2,0,0.42); border:1px solid rgba(245,240,228,0.28);
  border-radius:999px; padding:4px 12px;
}
/* BLEDÁ karta = papyrus lock (Entry.tsx): T.cardGrad · 1.5px T.cardEdge · radius 16.
   ⚠️ Do 12.8.2026 bola TMAVÁ. Matej: „zmeňme to na bledú verziu pretože to na tom čiernom
   pozadí zaniká" — tmavá karta na čiernej stránke nemala hranu a splývala s pozadím,
   zatiaľ čo plagát vedľa ju má z fotky. Späť na tmavú NEVRACAŤ bez Mateja. */
.ts-globe{
  position:relative; overflow:hidden; border-radius:16px; min-height:340px;
  background:${T.cardGrad}; border:1.5px solid ${T.cardEdge}; box-shadow:${T.cardShadow};
  display:flex; flex-direction:column; justify-content:space-between;
  /* Väčší odstup od okrajov (Matej 9.8.: „je to moc na kraji") — rovnaký rád ako plagát vľavo. */
  padding:24px 24px 24px; text-decoration:none; cursor:pointer;
  transition: transform .2s ease;
}
.ts-globe:hover{ transform: translateY(-2px); }
/* Odkaz na mapu pokrýva celú kartu; CTA leží nad ním vyšším z-indexom, takže si klik vezme
   ono. Bez tohto prekrytia by telo karty prestalo byť klikateľné úplne. */
.ts-globe-hit{ position:absolute; inset:0; z-index:2; border-radius:16px; }

/* MAPA je pozadie karty, nie obrázok v rámčeku — kreslí ju PackAtlas do SVG.
   Presahuje kartu zámerne: výrez Európy tak ide až pod text a nevzniká rám v ráme.
   Guľa (cobe) tu stála do 11. 9. 2026 a odišla preto, že tá istá bola o dva bloky nižšie
   v GlobePulse — Matej: "je tam teraz planétka ako je aj nižšie". */
.ts-atlas{ position:absolute; inset:0; width:100%; height:100%; z-index:0; pointer-events:none; }

.ts-scrim{
  position:absolute; inset:0; z-index:1; pointer-events:none;
  background:
    linear-gradient(to bottom, rgba(251,245,230,0.92) 0%, rgba(243,228,196,0.30) 18%, rgba(243,228,196,0) 34%, rgba(234,214,166,0) 62%, rgba(234,214,166,0.55) 86%, rgba(234,214,166,0.80) 100%);
}
.ts-globe-head{ position:relative; z-index:2; padding-top:24px; }
/* CTA CEZ CELÚ ŠÍRKU (Matej 11. 9. 2026: "dolu daj cez šírku CTA (pridaj svoj výlet do
   lapisu) = bude len mapka hore a dole cta"). Nadpis tým z karty odišiel — jeho text sa
   presťahoval do tlačidla, takže karta hovorí jednu vec a nie tú istú dvakrát.
   LAPIS = brandový kánon pre hlavné CTA na BLEDOM podklade (CLAUDE.md 28. 8.); geometriu
   (radius 8, nie pilulka) preberá od locknutého .btn-gold, mení sa len výplň.
   ⚠️ Je to <span> vnútri <a>, nie vlastný odkaz — celá karta vedie na mapu a tlačidlo je
   pozvánka, nie druhá cieľová adresa. Tlačidlo v odkaze by bolo neplatné HTML. */
.ts-cta{
  position:relative; z-index:3; display:block; width:100%; margin-top:auto;
  padding:16px 16px; border-radius:8px; text-align:center;
  background:${LAPIS.grad}; border:1px solid ${GOLD_BTN.edge};
  color:${LAPIS.ink}; font-family:${FONT_TITLE}; font-weight:700; font-size:12.5px;
  letter-spacing:0.14em; text-transform:uppercase;
  box-shadow:${LAPIS_BTN_SHADOW};
  transition:transform .18s ease, box-shadow .22s ease;
}
/* Rovnaká ikonka ako tlačidlo PRIDAŤ v hlavičke mapy (Matej 11. 9.: "pred slovo pridaj svoj...
   daj ikonku + našu ako je aj v map") — hand-drawn plus z brand kitu, public/icons/pack/plus.svg.
   ⚠️ Kresba je natívne ČIERNA (fill je v súbore natvrdo, nie currentColor), takže na lapise
   zanikne; filter ju prefarbí na LAPIS.ink — tie isté hodnoty používa .trp-addtrip-icon
   v PackMap.tsx. Bez neho z tlačidla zmizne. */
.ts-cta-row{display:inline-flex;align-items:center;justify-content:center;gap:9px;}
.ts-cta-icon{
  width:15px;height:15px;flex-shrink:0;display:block;
  filter:brightness(0) saturate(100%) invert(89%) sepia(23%) saturate(720%) hue-rotate(348deg) brightness(101%) contrast(92%);
}
.ts-globe:hover .ts-cta{ transform:translateY(-1px); }
/* ⚠️ Ten padding nie je vzduch, ale VYHNUTIE SA RANGU. Rang sedí absolútne v pravom hornom
   rohu a nadpis má celú šírku karty: pri "ROZŠÍR" sa míňali o vlások, pri "NAKRESLI" sa
   prekryli o 110 px (odmerané). Kto mení nadpis, nech to premeria znova — 30 px Cinzelu
   je lock (rovnaká úroveň ako názov výletu v susednej karte), takže ustupuje nadpis. */
/* Nadpis má ROVNAKÚ veľkosť ako názov výletu v susednej karte (30px Cinzel 700) — dva bloky
   v jednom riadku musia mať jednu typografickú úroveň, inak menší vyzerá ako podradený.
   ⚠️ TRI riadky = JEDNO SLOVO NA RIADOK (Matej 12.8.: „daj tam 3 riadky - Rozšír hranice
   DOGYPTU"). Láme to JSX, nie CSS: znaky Cinzelu sú širšie než jednotka ch, takže max-width
   v ch by nadpis raz zalomil a inokedy pretiekol podľa prekladu. Preklad teda MUSÍ mať tri
   slová (SK „Rozšír hranice DOGYPTU", EN „Expand DOGYPT's borders") — pri dvoch vyjdú dva
   riadky a karta ostane hore prázdna, pri štyroch pretečie. */
.ts-globe-title{
  font-family:${FONT_TITLE}; font-weight:700; font-size:30px; line-height:1.08;
  letter-spacing:0.02em; text-transform:uppercase; color:${T.inkStrong}; margin:0;
  /* Svetlé halo, nie tmavý tieň — nadpis stojí nad kontinentmi, ktoré sú v bledej
     verzii TMAVÉ, takže ho drží čitateľný rozžiarený papyrus okolo písmen. */
  text-shadow:0 2px 14px rgba(250,244,236,0.95);
}
.ts-globe-title span{ display:block; }
/* Rang + level: meno rangu Cinzel, číslo v PLNEJ pilulke vo farbe pásma bez popisky „Lvl"
   (Matej 3.8.: „to LVL ma ruší").
   ⚠️ Od 28. 8. 2026 to UŽ NIE JE ten istý vzor ako v hlavičke mapy — tam sa pilulka zrušila
   a číslo sedí na okraji avatara, v prstenci postupu (lock v CLAUDE.md). Tu pilulka OSTÁVA:
   karta nemá avatar, o ktorý by sa číslo mohlo oprieť. Farbu pásma berú obe z packTiers.
   ⚠️ Od 12. 9. 2026 je z toho CELÝ HORNÝ RIADOK karty: vľavo rang a level, vpravo km
   a výlety (Matej: „v hornom riadku už je putnik 16, len to treba presunut doľava a pridať
   stats"). Tým padlo umiestnenie z 12. 8. („pútnika daj do pravého horného rohu") — dôvod
   preň bol trojriadkový nadpis pod ním, a ten z karty odišiel 11. 9. Absolútne ukotvenie
   ostáva: riadok leží nad náhľadom trasy, ktorý je pozadím karty. */
/* ⚠️ RIADOK SA MUSÍ VEDIEŤ ZALOMIŤ (22. 9. 2026, po zúžení stĺpca na 832).
   Odmerané pri obsahu 832: riadok potrebuje 277 px (meno 71 + gap 9 + pilulka 39 + gap 12
   + čísla 146), karta mu dáva 264 — pilulka levelu preto podliezla pod „1955". Pri 976 sa
   to ešte vošlo, takže to nie je chyba tejto karty, ale dôsledok šírky stĺpca.
   flex-wrap necháva v tesnom pásme spadnúť ČÍSLA pod meno; slovo PÚTNIK sa NESKRÝVA —
   to robí hlavička /map až na mobile a tam ho nahrádzajú dva riadky pod avatarom.
   ⚠️ V TOMTO KOMENTÁRI NESMIE BYŤ SPÄTNÝ APOSTROF — je vnútri CSS v JS literáli
   a ukončil by šablónu (zhodené 22. 9., presne tá pasca, na ktorú je npm run check:css). */
.ts-rank{
  position:absolute; top:22px; left:22px; right:22px; z-index:3;
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  flex-wrap:wrap; row-gap:4px;
}
.ts-rank-me{ display:inline-flex; align-items:center; gap:9px; min-width:0; }
/* Čísla vpravo v rade = ten istý údaj a to isté poradie ako hlavička /map
   (trieda .trp-mstats2): km, potom výlety. Číslo je Space Grotesk (dáta), popisok malý
   a tlmený — nie druhá pilulka, aby si váhu v riadku držal level. */
.ts-rank-stats{ display:inline-flex; align-items:baseline; gap:14px; flex-shrink:0; }
.ts-rank-stats span{ display:inline-flex; align-items:baseline; gap:4px; white-space:nowrap; }
.ts-rank-stats b{
  font-family:${FONT_UI}; font-weight:600; font-size:16px; line-height:1;
  color:${T.inkStrong}; text-shadow:0 2px 10px rgba(250,244,236,0.9);
}
.ts-rank-stats i{
  font-family:${FONT_UI}; font-style:normal; font-weight:500; font-size:10px;
  letter-spacing:0.14em; text-transform:uppercase; color:${T.inkWarm};
  text-shadow:0 2px 10px rgba(250,244,236,0.9);
}
.ts-rank-name{
  font-family:${FONT_TITLE}; font-weight:700; font-size:13px; letter-spacing:0.22em;
  text-transform:uppercase; color:${T.inkStrong}; text-shadow:0 2px 10px rgba(250,244,236,0.9);
}
/* FARBA PÁSMA (2026-08-24) — gradient a inkoust berie z premenných --tier-a / --tier-b /
   --tier-ink, ktoré vešia tierVars(level); fallback drží pôvodnú zlatú.
   Tá istá pilulka ako v hlavičke mapy, tá istá farba. */
.ts-rank-num{
  display:inline-flex; align-items:center; padding:4px 12px 4px; border-radius:999px;
  background:linear-gradient(135deg,var(--tier-a,#F5C73D),var(--tier-b,#E69E1A));
  color:var(--tier-ink,${T.ink});
  font-family:${FONT_UI}; font-weight:600; font-size:14px; line-height:1;
  box-shadow:0 2px 8px var(--tier-glow,rgba(245,199,61,0.28));
  transition:background .5s, color .5s, box-shadow .5s;
}
/* TRI bloky vedľa seba na SPODNOM okraji karty (Matej 9.8.) — level odišiel hore k rangu.
   margin-top:auto ich pritlačí dole nezávisle od výšky karty; pevná výška by sa rozišla
   s výškou ľavého plagátu. */
.ts-pills{
  position:relative; z-index:2; margin-top:auto; width:100%;
  display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;
}
/* LAPIS, NIE ČIERNA (Matej 11. 9. 2026: „tie bloky by som dal lapisom nie čiernou farbou,
   riad sa brandom"). Prebíja to jeho staršie „tie 3 pills viac výrazné resp ponechaj ich
   v tej farbe" z 12. 8. — kontrastný akcent na bledej karte ostáva, len prestal byť bez
   farby. Zlaté písmo na modrom nie je ozdoba: lapis + zlato je pôvodná egyptská dvojica,
   a bez nej je to len tmavý blok bez príslušnosti k brandu.
   ⚠️ Plná farebná plocha inak patrí JEDINÉMU hlavnému CTA na obrazovke — tu platí výnimka
   pre neinteraktívny štítok (CLAUDE.md 28. 8.): dlaždice sa nedajú kliknúť samostatne,
   nemajú stav a na paneli nie je iné plné farebné CTA.
   Preto tu nie je backdrop-filter: pod plnou výplňou nemá čo rozostrovať a stál výkon
   pri každom prekreslení gule. */
.ts-pill{
  position:relative; overflow:hidden; border-radius:12px; padding:12px 12px; text-align:center;
  background:${LAPIS.grad};
  border:1px solid rgba(201,154,63,0.55);
  box-shadow:inset 0 1px 0 rgba(201,154,63,0.22), 0 10px 24px -14px rgba(5,15,48,0.75);
}
/* Zlatý svetelný pruh po hornej hrane — to je celý „šperk" pilulky, nie ďalší rám. */
.ts-pill::before{
  content:''; position:absolute; top:0; left:14%; right:14%; height:1px;
  background:linear-gradient(90deg, transparent, rgba(245,199,61,0.85), transparent);
}
/* Číslo = DÁTA → Space Grotesk (typografický lock v CLAUDE.md: Cinzel = identita, Grotesk =
   dáta a čísla). Predtým tu bol Cinzel 700 a v tej istej karte pilulka levelu v Grotesku —
   dve písma na tú istú vec (Matej 9.8.: „čísla v blokoch by nemali byť grotesk?").
   ⚠️ Váha STROP 600: Space Grotesk je načítaný len v 300–600, 700 by prehliadač dosyntetizoval
   (fake bold, rozmazané hrany). */
.ts-pill b{
  display:block; font-family:${FONT_UI}; font-weight:600; font-size:22px;
  line-height:1; color:${LAPIS.ink}; letter-spacing:0; text-shadow:0 2px 10px rgba(3,10,34,0.7);
}
.ts-pill span{
  display:block; margin-top:6px; font-family:${FONT_UI}; font-weight:500;
  font-size:8.5px; letter-spacing:0.22em; text-transform:uppercase; color:rgba(239,215,154,0.66);
}

@media (max-width: 860px){
  .ts-row{ grid-template-columns: 1fr; }
  .ts-hero{ min-height:340px; padding:24px 16px 16px; }
  .ts-globe{ min-height:270px; }
  .ts-ribbon{ top:16px; right:-58px; width:184px; font-size:9px; letter-spacing:0.22em; }
  /* Mobil: nadpis + rang sa zarovnajú DOPRAVA (vľavo je guľa, vpravo voľné miesto),
     tri pilulky sedia na spodnej hrane. Guľa preto nesedí pri spodku — tam by ju pilulky
     prekryli — ale v STREDOVEJ medzere vľavo. */
  /* 148 % šírky karty, nie 98 % (Matej 9.8.: „zväčši tú planétku, je moc malá a veľa
     priestoru čierneho je okolo"). Menšia guľa nechávala v strede karty prázdny čierny
     pás — orezaná guľa musí kartu VYPLNIŤ, inak je to len ikonka na čiernom. */
  .ts-scrim{
    background:
      linear-gradient(to left, rgba(243,228,196,0.90) 6%, rgba(243,228,196,0.30) 46%, rgba(243,228,196,0) 76%),
      linear-gradient(to top, rgba(234,214,166,0.92) 24%, rgba(243,228,196,0.20) 66%, rgba(251,245,230,0.55) 100%);
  }
  /* Rang sedí v pravom hornom rohu aj tu, preto hlavička začína pod ním — inak by sa
     prvý riadok nadpisu (zarovnaný doprava) prekryl s pilulkou levelu. */
  .ts-globe-head{ text-align:right; display:flex; flex-direction:column; align-items:flex-end; padding-top:32px; }
  .ts-globe-title{ font-size:28px; }
  .ts-pills{ grid-template-columns:repeat(3, 1fr); }
}
`;

/** Rozdiel KALENDÁRNYCH dní, nie hodín — inak výlet o tri dni ukáže poobede „2 days"
 *  a človek to vidí ako chybu appky (a právom). Math.round kvôli 23/25-hodinovým dňom
 *  pri prechode na letný čas. Prebraté z NextTripCard bez zmeny. */
function daysFromNow(dateStr: string, nowMs: number): number {
  const target = new Date(dateStr + 'T00:00:00').getTime();
  const today = new Date(nowMs);
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today.getTime()) / DAY_MS);
}

/**
 * Ktorý tvar množného čísla — CLDR pravidlo pre slovenčinu: `one` = 1, `few` = 2–4,
 * `other` (u nás „Many") = všetko ostatné. Preto „2 krajiny", ale „20 krajín" aj
 * „1 119 kilometrov" (Matej 9.8.: „skloňovanie — kilometrov nie kilometre").
 * ⚠️ Nie je to „posledná číslica 2–4": podľa CLDR ide 22 do `other`, teda „22 krajín".
 * Angličtina má len dva tvary, preto tam Few = Many.
 */
/* ⚠️ `shortDate()` TU BOL DO 26. 8. a mlčky prepúšťal surové `2026-09` na obrazovku:
   `new Date('2026-09T00:00:00')` je Invalid Date, takže funkcia vrátila vstup nezmenený.
   Odkedy má plán tri presnosti (`addtrip/planDate.ts`), formátuje termín `planDateLabel()` —
   jedna funkcia pre túto kartu aj pre `PlanAskCard`. */

function kmNumber(km: string | undefined): number {
  const n = parseFloat(String(km ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

interface TripSpotlightProps {
  /** Prihlásený člen — vstup do `profileLevelFor` (autorstvo výletov + founder bonus).
   *  Bez neho by level vyšiel nižší než v hlavičke mapy. */
  email?: string;
  /** Krstné meno — `addedByMeIds` ním páruje autora výletu. */
  ownerName?: string;
}

export function TripSpotlight({ email = '', ownerName = '' }: TripSpotlightProps) {
  const t = useT();

  // Body za odkazy — to isté číslo, aké má hlavička mapy aj TRIPSTATS.
  const myNotePoints = useMyNotePoints();
  const myEventCount = useMyEventCount();
  const myWishCount = useMyWishCount();
  const view = useMemo(() => {
    const nowMs = Date.now();
    const allTrails: HeroTrail[] = [...visibleLocalTrails(readLocalTrails()), ...HERO_JOURNEYS, ...HERO_TRAILS];
    const walked = readWalkedIds();
    const triplist = readTriplist();

    // 1 · naplánovaný výlet má prednosť pred čímkoľvek iným
    //
    // ⚠️ TERMÍN SA NEČÍTA `daysFromNow`-om (opravené 26. 8.). Odkedy má plán tri presnosti,
    // je `date` aj `2026-09-W2` alebo `2026-09` — `new Date()` z toho vyrobí NaN, NaN >= 0 je
    // false, a plán „niekedy v septembri" z homepage BEZ SLOVA vypadol. Fázu preto počíta
    // `planPhase()` (z KONCA obdobia), poradie `planStart()` (od kedy sa naň dá ísť).
    //
    // `'upcoming'` navyše vyradí plány, ktorých termín už uplynul — na tie sa v tej istej
    // chvíli pýta `PlanAskCard` nad touto kartou. Odpočet „dnes" vedľa otázky „bol si tam?"
    // sú dve tvrdenia o jednom výlete.
    // ⚠️ ZDROJE SÚ DVA (opravené 26. 8.). Sprievodca pri založení plánu zapisuje do
    // `trp-plans` (`addPlan`), triplist entry vzniká až pri MOUNTE triplistu
    // (`seedTriplistFromPlans`) — čerstvo naplánovaný výlet sa preto na plagát nedostal,
    // kým si člen neotvoril MY TRIPS. Rovnaká konvencia, akú má `nextPlannedTrip()`
    // v `packCommunity.ts`: volajúci posiela OBOJE a duplicity nevadia.
    // Triplist má prednosť — tam sa dátum priamo edituje.
    const planRows = [...readPlans(), ...Object.values(triplist)]
      .reduce((acc, e) => { acc.set(e.tripId, e); return acc; }, new Map<string, { tripId: string; date?: string; joiners?: { memberId: string; acceptedAt: number }[] }>());
    // PLÁNOVANIE V SKLADE (24. 9. 2026, `PLANNING_LIVE`) — plagát plánu sa neukazuje,
    // karta padá rovno na čerstvý výlet alebo tip dňa.
    const planned = !PLANNING_LIVE ? null : [...planRows.values()]
      .filter((e) => e.date && !walked.has(e.tripId) && planPhase(e.date, nowMs) === 'upcoming')
      .map((e) => ({ entry: e, trail: allTrails.find((tr) => tr.id === e.tripId) ?? null }))
      .filter((x): x is { entry: typeof x.entry; trail: HeroTrail } => !!x.trail)
      .sort((a, b) => (planStart(a.entry.date) ?? '').localeCompare(planStart(b.entry.date) ?? ''))[0] ?? null;

    // 2 · bez plánu: najprv POSLEDNE PRIDANÝ výlet, ak ho člen ešte neprešiel.
    // ⚠️ „Posledne pridaný" je ODVODENÉ Z PORADIA v datasete — generátor zachováva poradie
    //    z `plany/trails-nahadzovac-state.json` a trip-audit nové výlety pripája na koniec.
    //    Nie je to timestamp. Keby raz generátor začal triediť, tento riadok začne klamať
    //    ticho; poctivé riešenie je pole `addedAt` v state.json.
    const publishedNewest = HERO_TRAILS[HERO_TRAILS.length - 1] ?? null;
    const isFresh = !!publishedNewest && !walked.has(publishedNewest.id) && !triplist[publishedNewest.id];

    // 3 · inak TIP DŇA — deterministický podľa dňa, nie Math.random(): pri každom
    //     rerenderi by sa výlet prehodil a karta by pôsobila rozbito.
    const candidates = HERO_TRAILS.filter((tr) => !walked.has(tr.id) && tr.photos.length > 0);
    const dayIdx = Math.floor(nowMs / DAY_MS);
    const tip = candidates.length ? candidates[dayIdx % candidates.length] : null;

    const trail = planned?.trail ?? (isFresh ? publishedNewest : tip);
    const kind: 'plan' | 'fresh' | 'tip' = planned ? 'plan' : isFresh ? 'fresh' : 'tip';

    // Pilulky vpravo = TVOJ záznam: prejdené výlety, km a počet krajín.
    // Krajina sa berie cez `trailCountry()` (ISO2, s fallbackom z `path[0]`) — tá istá
    // konvencia, akou sa skladá URL výletu. Ručné čítanie `tr.country` by prehliadlo
    // celý generovaný SK dataset, ktorý pole nemá a odvodzuje sa zo súradníc.
    let walkedCount = 0;
    let walkedKm = 0;
    const countries = new Set<string>();
    const walkedTrails: HeroTrail[] = [];
    for (const tr of allTrails) {
      if (!walked.has(tr.id)) continue;
      walkedTrails.push(tr);
      walkedCount += 1;
      walkedKm += kmNumber(tr.km);
      const c = trailCountry(tr);
      if (c) countries.add(c.toLowerCase());
    }

    // Rang + level cez SPOLOČNÚ funkciu s hlavičkou mapy — vlastný výpočet by dal iné číslo
    // na dvoch povrchoch (ten rozchod tu už raz bol, viď komentár pri `profileLevelFor`).
    const { level } = profileLevelFor({
      walkedTrails,
      localTrailIds: readLocalTrails().map((tr) => tr.id),
      votes: readVotes(),
      email,
      ownerName,
      notePoints: myNotePoints,
      eventsHeld: myEventCount,
      wishesDone: myWishCount,
    });

    return {
      trail,
      kind,
      // Odpočet LEN pri presnom dni. Pri „druhý septembrový týždeň" by číslo dní tvrdilo
      // presnosť, ktorú človek sám nepovedal — tam hovorí len popisok termínu.
      days: planned && parsePlanDate(planned.entry.date)?.precision === 'exact'
        ? daysFromNow(planned.entry.date as string, nowMs)
        : null,
      dateLabel: planned?.entry.date ?? null,
      joiners: planned?.entry.joiners?.length ?? 0,
      walkedCount,
      walkedKm: Math.round(walkedKm),
      countryCount: countries.size,
      level: level.level,
    };
  }, [email, ownerName, myNotePoints, myEventCount, myWishCount]);

  // Bez jediného výletu s fotkou nemá plagát čo ukázať — radšej nič než prázdny rám.
  if (!view.trail) return null;

  const { trail, kind } = view;
  // ⚠️ ILUSTRAČNÁ FOTKA (doplnené 26. 8.). Plán nemá vlastnú fotku — obrázok mu dáva databáza
  // podľa aktivity. Bez tohto riadku bol plagát naplánovaného výletu ČIERNA PLOCHA; to je tá
  // istá diera, akú Matej našiel 25. 8. („výlet sa pridal ale nepridala sa fotka") na troch
  // iných povrchoch. `lib/tripPlaceholder.ts` je jediný zdroj — volaj ho, nekopíruj tabuľku.
  const photo = trail.photos[0] || placeholderFor(trail.acts, trail.id);
  const countdown =
    view.days === null ? null
      : view.days <= 0 ? t('pack.nextTrip.today')
      : view.days === 1 ? t('pack.nextTrip.tomorrow')
      : t('pack.tree.daysUnit', { days: String(view.days) });
  const dateLabel = planDateLabel(view.dateLabel, (n) => t('pack.addTrip.plan.whenWeekN', { n: String(n) }));

  const eyebrow =
    kind === 'plan' ? t('pack.spotlight.eyebrowPlan')
      : kind === 'fresh' ? t('pack.spotlight.eyebrowFresh')
      : t('pack.spotlight.eyebrowTip');
  // ⚠️ ŽIADNE CTA tlačidlo (Matej 9.8.: „CTA daj aj z tripu aj z mapy preč, samé o sebe
  // budú bloky CTA"). Obe karty sú `<Link>` na celej ploche — tlačidlo vnútri klikateľnej
  // karty len opakovalo, čo karta už robí. Kľúče `pack.spotlight.open` / `.plan` ostávajú
  // v i18n nepoužité pre prípad návratu; nemazať bez prečistenia oboch locale.

  return (
    <div className="ts-row">
      <style>{CSS}</style>

      {/* ── 70 % · plagát výletu ─────────────────────────────────────────── */}
      <Link className="ts-hero" to={tripPath(trail)}>
        {photo && <img className="ts-art" src={sizedUrl(photo, 1080)} alt="" aria-hidden />}

        {/* Pri pláne ZÁMERNE bez stuhy — odpočet už hovorí „toto máš naplánované".
            Dve značky na jednej karte si konkurujú. */}
        {kind !== 'plan' && (
          <span className="ts-ribbon">
            {kind === 'fresh' ? t('pack.spotlight.ribbonNew') : t('pack.spotlight.ribbonTip')}
          </span>
        )}

        {/* Odpočet vľavo hore, nie v spodnom texte: je to jediný údaj, ktorý sa mení
            každý deň, takže má sedieť tam, kam padne oko prvé. */}
        {(countdown || dateLabel) && (
          <span className="ts-count" style={DAYS_PILL}>
            {countdown ?? dateLabel}
            {countdown && dateLabel && (
              <small style={{ fontFamily: FONT_UI, fontWeight: 500, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.72 }}>
                {dateLabel}
              </small>
            )}
          </span>
        )}

        <div className="ts-body">
          <p style={{ fontFamily: FONT_UI, fontWeight: 500, fontSize: 11.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#F5C73D', margin: '0 0 9px', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
            {eyebrow}
          </p>

          <h3 style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 30, lineHeight: 1.08, letterSpacing: '0.02em', textTransform: 'uppercase', color: T.cardSoft, margin: 0, textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
            {trail.name}
          </h3>

          <div className="flex flex-wrap gap-2" style={{ marginTop: 12 }}>
            {trail.region && <span className="ts-chip">{trail.region}</span>}
            {trail.km && <span className="ts-chip">{trail.km} km</span>}
            {trail.diff && <span className="ts-chip">{t('pack.map.diff.' + trail.diff)}</span>}
            {/* HODNOTENIE = PACKY, NIE HVIEZDIČKY (Matej 12. 9. 2026: „v 2. bloku sú
                hviezdičky ale my používame packy“). Rovnaký widget ako karty a inline detail
                v /map a článok výletu — `RatingPaws` z `tripShared`, nie vlastná kresba.
                Chip stojí na tmavom plagáte, takže nevyplnená časť ostáva na východiskovom
                bielom filtri widgetu (na papyruse by sa prepisovala premennými). */}
            {trail.stars > 0 && (
              <span className="ts-chip" style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px' }}>
                <RatingPaws stars={trail.stars} size={12} gap={3} />
              </span>
            )}
          </div>

          {/* Kto ide s vami — údaj, ktorý mapa nevie zobraziť. Existuje len pri pláne
              (bez plánu niet koho pozvať), preto sa inde nezobrazuje. */}
          {kind === 'plan' && view.joiners > 0 && (
            <div style={{ marginTop: 12, fontFamily: FONT_UI, fontSize: 11.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,246,226,0.78)', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {t('pack.spotlight.joiners', { count: String(view.joiners) })}
            </div>
          )}

        </div>
      </Link>

      {/* ── 38 % · planéta ───────────────────────────────────────────────── */}
      {/* ⚠️ KARTA UŽ NIE JE JEDEN ODKAZ (Matej 11. 9. 2026, voľba z dvoch ciest): telo vedie
          na mapu, tlačidlo rovno do pridávania. Odkaz v odkaze je neplatné HTML, takže obal
          je <div> a sú v ňom DVA odkazy — neviditeľný cez celú plochu (.ts-globe-hit) a CTA
          nad ním. Poradie rieši z-index, nie DOM: CTA má vyšší, takže klik naň ide doň. */}
      <div className="ts-globe">
        {/* Guľa je pozadie karty (z-index 0), nie ilustrácia v rámčeku. */}
        {/* Náhľad kreslenia trasy (Matej 11. 9.: "daj predsa len tú možnosť - nakresli svoj
            výlet"). Mapa Európy so značkami tu stála pár hodín a odišla — "tie emoji musíme
            zmeniť, vyzerá to hrozne". Parkuje ako PackAtlas.tsx, vrátiť ju sem = jeden riadok. */}
        <PackTrailSketch />
        <span className="ts-scrim" aria-hidden />

        {/* JEDEN nadpis, žiadny podnadpis a žiadna popiska dole (Matej 9.8.:
            „nadpis daj PRESKÚMAJ MAPU, 71 výletov daj preč a aj preskúmaj mapu zdola
            vyhoď — konsolidujeme"). Počet výletov už svieti v dlaždici MAPA nižšie. */}
        {/* Rang + level — ten istý výpočet ako hlavička mapy (`profileLevelFor`).
            Stojí MIMO hlavičky, lebo je absolútne ukotvený v pravom hornom rohu karty. */}
        <span className="ts-rank">
          <span className="ts-rank-me">
            <span className="ts-rank-name">{t('pack.map.rankPilgrim')}</span>
            <span
              className="ts-rank-num"
              style={tierVars(view.level)}
              aria-label={t('pack.map.levelAriaLabel', { level: view.level })}
            >
              {view.level}
            </span>
          </span>
          {/* ⚠️ TOTO NIE JE NÁVRAT TROCH DLAŽDÍC z 11. 9. („tie 3 bloky daj preč"). Tie
              zaberali spodnú tretinu karty, ktorú si pýtal pre CTA, a hovorili o krajinách
              navyše. Tu sú DVE čísla v riadku, ktorý na karte už aj tak stál kvôli rangu —
              spodok ostáva CTA. Kľúče sú tie isté ako v hlavičke `/map`, takže sa nemôžu
              rozísť v skloňovaní. */}
          <span className="ts-rank-stats">
            <span><b>{view.walkedKm}</b><i>{t('pack.map.statKm')}</i></span>
            <span>
              <b>{view.walkedCount}</b>
              <i>{t('pack.map.statTrips' + pluralKey(view.walkedCount))}</i>
            </span>
          </span>
        </span>

        {/* ⚠️ TROJRIADKOVÝ NADPIS ODIŠIEL 11. 9. 2026 — jeho text je teraz na CTA dole
            ("bude len mapka hore a dole cta"). CSS `.ts-globe-title` nižšie NEMAŽEM: keby sa
            nadpis vracal, vracia sa aj jeho lock na tri slová a tri riadky. */}

        {/* ⚠️ TRI BLOKY S ČÍSLAMI (krajiny · kilometre · výlety) SÚ PREČ (Matej 11. 9. 2026:
            "tie 3 bloky daj preč"). Karta odvtedy nehovorí o tvojom zázname, ale o jedinej
            veci — že si výlet vieš pridať sám. Uvoľnená spodná tretina je presne to miesto,
            ktoré si pýtal ("je to moc malé, roztiahni to").
            CSS `.ts-pills` / `.ts-pill` nižšie NEMAŽEM — čísla sa môžu vrátiť, keď sa karta
            bude rozhodovať znova; mŕtvy je len tento JSX blok. */}

        <Link className="ts-globe-hit" to="/pack/map" aria-label={t('pack.layout.navOut')} />

        <Link className="ts-cta" to="/pack/add/trip">
          <span className="ts-cta-row">
            <img src="/icons/pack/plus.svg" alt="" aria-hidden className="ts-cta-icon" />
            {t('pack.spotlight.mapTitle')}
          </span>
        </Link>
      </div>
    </div>
  );
}
