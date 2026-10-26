// HLAVA PROFILU JA — titulka, fotka majiteľa a satelit psov. JEDEN zdroj pre profil
// (`pages/PackMe.tsx`) aj UPRAVIŤ PROFIL (`pages/PackProfile.tsx`) — Matej 23. 10. 2026:
// *„daj náhľad ako bude v realite = meno gradient atď... nech to má človek 1:1"*.
// Úprava hlavy sa preto robí TU a prejaví sa na oboch obrazovkách naraz.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_TOPROW, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { HandCamera } from '@/components/pack/HandIcons';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { sizedUrl } from '@/services/cloudinaryService';
import type { PackDogFull } from '@/hooks/usePackUser';
import type { DogProfileAttrs } from '@/components/pack/profile/packProfile';
import { flagUrl, countryISO2 } from '@/lib/countryGeo';
import { DEVOTION_LEVELS, devotionLevel } from '@/lib/devotion';
import type { LevelProgress } from '@/lib/tripPoints';
import { tierOfLevel, tierGradient, PACK_TIERS, type PackTier } from '@/lib/packTiers';
import { devotionTier, devotionVars, NIGHT, NIGHT_EDGE, NIGHT_INK } from '@/lib/devotionTiers';
import { RANK_BADGE_ON, RANK_BADGE_CSS, RANK_PANEL_CSS, STORY_RING_CSS, RING_V1, ARC_MAX, ARC_BELOW, arcDogs, ServantBadge, PilgrimBadge, BonesBadge, ServantPanel, PilgrimPanel, useActiveDays } from '@/components/pack/profile/rankBadge';
/** BONES = TYRKYS (Matej 23. 10.: „bones pills daj tyrkysovou“) — farba z tej istej sady ako pásma pútnika. */
const BONES_TIER = PACK_TIERS.find((t) => t.key === 'turquoise') as PackTier;

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;
export const DOG_FONT = "'Cinzel Decorative', 'Cinzel', serif";

/* Geometria titulky a fotky majiteľa — JEDNO miesto (rovnica, nie meranie po vykreslení).
 * Fotka sedí v titulke a jej spodok vytŕča `OWN_DROP` pod titulku; satelit visí na jej spodku. */
export const COVER_H = { m: 250, pc: 300 };
const OWN = { m: 126, pc: 158 };
const OWN_X = { m: 10, pc: 16 };
const OWN_DROP = 13;
const SAT = { m: 56, pc: 70 };
/* Satelit je zo 3/4 VONKU z fotky majiteľa a len 1/4 v nej (Matej 23. 10.) — jeho spodok
 * visí 3/4 priemeru pod spodkom fotky. Medzera pod fotkou z toho istého čísla, aby satelit
 * nenarazil do čísel (rezerva S.sm nad nimi, čísla majú vlastný margin S.md). */
const SAT_DROP = { m: SAT.m * 3 / 4, pc: Math.round(SAT.pc * 3 / 4) };
/* PAWMATE vedľa majiteľa — podiely fotky majiteľa. MATE_OUT = kam siaha jeho pravý okraj (meno titulky začína za ním).
 * Jediný pes s pawmatom = DOG1 (stred na styku oboch kruhov, dole). */
const MATE = { d: .6, left: .76, top: .2 };
const MATE_OUT = MATE.left + MATE.d;
const MATE_CSS = { left: `${Math.round(MATE.left * 100)}%`, top: `${Math.round(MATE.top * 100)}%`, d: `${Math.round(MATE.d * 100)}%` };
const DOG1_WITH_MATE = { d: .42, cx: .86, cy: .86 };
const FLAT_X_M = 16;
/* Psy po OBLÚKU (RANK_BADGE_ON) visia inak než satelit: medzera = presne po spodok najnižšieho psa, takže
 * nad číslami ostane tá istá vzdušnosť ako pod nimi k tlačidlám (margin S.md + padding S.sm na oboch stranách).
 * Matej 25. 10.: *„štatistiky posuň hore tak, aby nad nimi bola taká istá medzera ako pod nimi"*. */
const GAP = RANK_BADGE_ON
  ? { m: OWN_DROP + Math.round(OWN.m * ARC_BELOW), pc: PACK_SPACE.lg + Math.round(OWN.pc * ARC_BELOW) }
  : { m: OWN_DROP + SAT_DROP.m + PACK_SPACE.sm - PACK_SPACE.md, pc: PACK_SPACE.lg + SAT_DROP.pc + PACK_SPACE.sm - PACK_SPACE.md };
/* Fotka psa v šuplíku stojí v OSI fotky majiteľa (Matej 22. 10.) — odsadenie z rovnice. */
const DOG_D = { m: 60, pc: 96 };
const DOG_X = { m: OWN_X.m + OWN.m / 2 - DOG_D.m / 2, pc: OWN_X.pc + OWN.pc / 2 - DOG_D.pc / 2 };
const RING_OLD = `conic-gradient(from 200deg,${LAPIS.edge},${LAPIS.deep},${T.cardEdge},#A3782B,${LAPIS.edge})`;
/* OBRUČ V1 „Slnko a Níl" (25. 10. 2026, len TEST_BUILD): Matej po 4 kolách nákresu `plany/nakresy/obruc/ig.html`
   — *„klasika Instagram štýl, jemne 3D, tenké… nemusí to pulzovať ani nič"* + *„ok super aj rozloženie psov aj farba
   aplikuj to!"*. Zlatá → modrá, bez fialovej (tá patrí výletom). Story už netočí ani nedýcha. */
export const RING = RANK_BADGE_ON ? RING_V1 : RING_OLD;

export const ME_CSS = `
.me-card{ position:relative; border-radius:${PACK_R.card}px; border:1.5px solid ${T.cardEdge}; background:${T.cardGrad}; box-shadow:${T.cardShadow}; overflow:hidden; }
/* Fotka titulky sa ROZPLYNIE do karty maskou (nie prekrytím farbou) — karta má gradient,
 * takže akákoľvek pevná farba na konci by nechala viditeľnú hranu. */
.me-cover{ position:relative; height:${COVER_H.m}px; }
.me-cover::before{ content:''; position:absolute; inset:0; pointer-events:none; background:var(--me-cover, ${T.pageBg}) center var(--me-cover-y, 35%)/cover no-repeat;
  -webkit-mask-image:linear-gradient(180deg, #000 0%, #000 42%, transparent 100%); mask-image:linear-gradient(180deg, #000 0%, #000 42%, transparent 100%); }
.me-cover::after{ content:''; position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(180deg, color-mix(in srgb, ${T.pageBg} 35%, transparent) 0%, transparent 25%); }
.me-cover > *{ position:relative; z-index:1; }
/* UPRAVIŤ PROFIL: titulka sa ťahá prstom hore/dole (poloha = human.coverY). */
.me-cover.pick{ cursor:pointer; }
/* Fotoaparát titulky — sklenený krúžok vpravo hore, aby bolo vidno, že sa pozadie dá vymeniť. */
.me-cvbtn{ width:36px; height:36px; padding:0; border-radius:${PACK_R.pill}px; display:grid; place-items:center; cursor:pointer;
  background:rgba(0,0,0,.42); border:1px solid ${T.onDarkBorder}; }
.me-cover.drag{ cursor:grab; touch-action:none; user-select:none; }
.me-cover.drag.on{ cursor:grabbing; }
.me-tbar{ display:flex; justify-content:space-between; align-items:flex-start; padding:${S.md}px; }
/* VLAJKA NA TITULKE (Matej 25. 10.: *„tá vlajka je super, dal by som ju každému profilu na titulku do pravého rohu
   bez čísla"*). Národnosť je vždy viditeľná (lock 25. 7.), preto aj tu bez prepínača. */
.me-flag{ display:block; width:${S.xl}px; height:${S.xl}px; border-radius:${PACK_R.pill}px; object-fit:cover; border:2px solid ${T.card}; box-shadow:${T.panelShadow}; }
.me-bones{ display:inline-flex; align-items:center; gap:${S.xs}px; padding:${S.xs}px ${S.md}px; border-radius:${PACK_R.pill}px; cursor:pointer;
  background:${tierGradient(BONES_TIER)}; border:1px solid ${BONES_TIER.b}; color:${BONES_TIER.ink}; box-shadow:${T.panelShadow};
  font-family:${FONT_UI}; font-weight:600; font-size:${TX.label}px; letter-spacing:.02em; }
.me-foot{ position:absolute; left:${OWN_X.m + OWN.m + S.sm}px; right:${S.md}px; bottom:-${OWN_DROP}px; }
.me-nm{ margin:0; font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.h2}px; letter-spacing:.14em; color:${T.inkStrong};
  text-transform:uppercase; white-space:nowrap; overflow:hidden; }
.me-with{ margin:${S.xs}px 0 0; font-family:${FONT_UI}; font-size:${TX.label}px; font-weight:500; color:${T.inkWarm}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
/* HODNOSTI VEDĽA SEBA (Matej 23. 10.: „až po pravý okraj“ → v ten istý deň neskôr: „pútnika mierne
   rozšír a faraóna zúž, aby to bolo akurát, nerozťahuj to“). Pilulka = svoj obsah + vzduch, nič sa
   nenaťahuje; dlhý stupeň sa skráti. Pod sebou len so „stack“. Ťuk = rozbaľovač MeRank pod hlavou. */
.me-lv{ display:flex; gap:6px; margin-top:${S.sm}px; }
.me-lv > *{ flex:0 1 auto; min-width:0; justify-content:center; display:inline-flex; align-items:center; gap:${S.xs}px; padding:${S.xs}px ${S.sm}px; border-radius:${PACK_R.pill}px; white-space:nowrap;
  font-family:${FONT_UI}; font-weight:600; font-size:${TX.micro}px; letter-spacing:.02em; text-transform:uppercase; cursor:pointer; }
.me-lv.stack{ flex-direction:column; align-items:flex-start; gap:${S.xs}px; }
.me-lv.stack > *{ flex:none; letter-spacing:.14em; }
.me-lv > .on{ box-shadow:0 0 0 2px ${T.card}, 0 0 0 3.5px ${LAPIS.edge}; }
/* FAREBNÉ BLOKY HODNOSTÍ (Matej 23. 10.: „tie bloky daj farebné, nie bledé, nech je to niečo special").
   Podklad nesie farbu hodnosti (devotion = zlato, pútnik = pásmo z packTiers, štúdium = displej AINUBISA),
   text a pás berú farby z premenných --rk-ink / --rk-dim, ktoré nastaví MeRank. */
.me-rk{ margin:0 0 ${S.md}px; padding:${S.md}px ${S.lg}px; border-radius:${PACK_R.tile}px; background:var(--rk-bg); border:1px solid var(--rk-edge);
  box-shadow:${T.panelShadow}; color:var(--rk-ink); }
.me-rk h3{ margin:0; display:flex; justify-content:space-between; align-items:baseline; gap:${S.sm}px; font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.body}px; letter-spacing:.14em; text-transform:uppercase; color:var(--rk-ink); }
/* HLAVIČKA: ikona stupňa · názov + definícia pod ním · vpravo hore ☥ (ťuk = vysvetlenie). */
.me-rk-hd{ display:flex; align-items:flex-start; gap:${S.md}px; }
.me-rk-hd .tx{ flex:1; min-width:0; }
.me-rk-hd .tx p.me-rk-q{ margin:${S.xs}px 0 0; font-size:${TX.label}px; }
.me-rk-hd .ic{ flex:none; display:grid; place-items:center; width:32px; height:32px; border-radius:${PACK_R.pill}px; background:var(--dv-dot); box-shadow:0 0 14px var(--dv-glow); }
.me-rk-hd .ic b{ font-family:${FONT_UI}; font-weight:600; line-height:1; color:var(--dv-icon-ink); font-style:normal; font-size:${TX.lead}px; }
.me-rk-hd .ic.pt{ background:var(--rk-fill); box-shadow:none; }
.me-rk-hd .ab{ flex:none; display:inline-flex; align-items:center; gap:${S.xs}px; border:0; background:none; padding:${S.xs}px 0; color:var(--rk-ink);
  font-family:${FONT_UI}; font-weight:600; font-size:${TX.label}px; letter-spacing:.02em; white-space:nowrap; }
.me-rk-hd button.ab{ cursor:pointer; }
.me-rk-hd button.ab:disabled{ cursor:default; }
/* Deliaca čiara DO STRATENA (Matej 23. 10.) — zo stredu sa rozplynie do oboch strán. */
.me-rk-line{ height:1px; border:0; margin:${S.md}px 0; background:linear-gradient(90deg, transparent, var(--rk-edge) 50%, transparent); opacity:.85; }
/* PROGRES: koľaj + žiariaca výplň s pomalým leskom, napravo ďalší stupeň. */
.me-rk-row{ display:flex; align-items:center; gap:${S.md}px; }
.me-rk-nx{ flex:none; display:inline-flex; align-items:center; gap:${S.xs}px; font-family:${FONT_UI}; font-weight:600; font-size:${TX.micro}px;
  letter-spacing:.14em; text-transform:uppercase; color:var(--rk-ink); white-space:nowrap; }
.me-rk-nx .g{ display:grid; place-items:center; width:18px; height:18px; border-radius:${PACK_R.pill}px; background:var(--dv-dot); box-shadow:0 0 8px var(--dv-glow); }
.me-rk-nx .g b{ font-family:${FONT_UI}; font-weight:600; line-height:1; color:var(--dv-icon-ink); font-style:normal; font-size:${TX.micro}px; }
.me-rk-nx b{ font-family:${FONT_UI}; font-weight:600; font-size:${TX.label}px; }
.me-rk-bar{ position:relative; flex:1; min-width:0; height:24px; border-radius:${PACK_R.pill}px; background:var(--rk-track); overflow:hidden; }
.me-rk-bar > b{ position:absolute; left:0; top:0; bottom:0; border-radius:${PACK_R.pill}px; overflow:hidden; transition:width .8s cubic-bezier(.2,.8,.2,1);
  background:linear-gradient(90deg, color-mix(in srgb, var(--rk-fill) 55%, transparent), var(--rk-fill));
  box-shadow:0 0 14px var(--rk-fill), 0 0 4px var(--rk-fill); }
.me-rk-bar > b::after{ content:''; position:absolute; inset:0; background:linear-gradient(100deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%);
  transform:translateX(-100%); animation:me-shine 3.2s ease-in-out infinite; }
@keyframes me-shine{ 0%{ transform:translateX(-100%); } 60%,100%{ transform:translateX(100%); } }
@media (prefers-reduced-motion:reduce){ .me-rk-bar > b::after{ animation:none; } }
.me-rk-bar > span{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; padding:0 ${S.sm}px; white-space:nowrap; overflow:hidden;
  font-family:${FONT_UI}; font-weight:600; font-size:${TX.micro}px; letter-spacing:.02em; color:var(--rk-ink); }
.me-rk-bar > span.in{ color:var(--rk-bg-ink); }
.me-rk h3 small{ font-family:${FONT_UI}; font-weight:500; font-size:${TX.micro}px; letter-spacing:.02em; text-transform:none; color:var(--rk-dim); }
.me-rk p{ margin:${S.sm}px 0 0; font-family:${FONT_UI}; font-size:${TX.label}px; line-height:1.45; color:var(--rk-ink); }
.me-rk .pk-progress{ margin-top:${S.sm}px; background:rgba(0,0,0,.22); }
.me-rk .pk-progress__fill{ background:var(--rk-fill); }
.me-rk-sc{ display:flex; gap:${S.xs}px; margin:${S.md}px -${S.lg}px 0; padding:0 ${S.lg}px ${S.xs}px; overflow-x:auto; scrollbar-width:none; }
.me-rk-sc::-webkit-scrollbar{ display:none; }
.me-rk-sc span{ flex:none; padding:${S.xs}px ${S.sm}px; border-radius:${PACK_R.pill}px; border:1px solid var(--rk-edge); font-family:${FONT_UI}; font-size:${TX.micro}px; color:var(--rk-dim); opacity:.7; white-space:nowrap; }
.me-rk-sc span.done{ opacity:1; }
.me-rk-sc span.cur{ opacity:1; background:var(--rk-fill); border-color:var(--rk-fill); color:var(--rk-bg-ink); font-weight:600; }
.me-rk-nums{ display:grid; grid-template-columns:repeat(3,1fr); margin-top:${S.md}px; text-align:center; }
.me-rk-nums b{ display:block; font-family:${FONT_UI}; font-weight:600; font-size:${TX.lead}px; color:var(--rk-ink); }
.me-rk-nums span{ font-family:${FONT_UI}; font-size:${TX.micro}px; color:var(--rk-dim); }
.me-rk-link{ display:inline-flex; align-items:center; gap:${S.xs}px; margin-top:${S.md}px; border:0; background:none; padding:0; cursor:pointer;
  font-family:${FONT_UI}; font-weight:600; font-size:${TX.label}px; color:var(--rk-ink); text-decoration:underline; text-underline-offset:3px; }
.me-dv{ background:var(--dv-bg); border:1px solid var(--dv-edge); color:var(--dv-ink); padding-left:${S.xs}px !important; }
/* NOC + ŽIARA (Matej 23. 10.): farbu stupňa nesie žiariaca gulička s kresbou (devotionTiers.ts). */
.me-dvg{ flex:none; display:grid; place-items:center; width:18px; height:18px; border-radius:${PACK_R.pill}px;
  background:var(--dv-dot); box-shadow:0 0 8px var(--dv-glow); }
.me-dvg b{ font-family:${FONT_UI}; font-weight:600; line-height:1; color:var(--dv-icon-ink); font-style:normal; font-size:${TX.micro}px; letter-spacing:0; }
.me-lv > .me-dv{ padding-right:${S.md}px; }
.me-lv > .me-pt{ flex:none; min-width:52px; padding:${S.xs}px ${S.md}px; }
.me-rk p.me-rk-q{ font-style:italic; color:var(--rk-dim); }
.me-rk-sc span{ display:inline-flex; align-items:center; gap:${S.xs}px; }
.me-rk-py{ display:flex; flex-direction:column; align-items:center; gap:2px; margin-top:${S.md}px; }
.me-rk-py span{ display:flex; align-items:center; justify-content:center; height:14px; border-radius:${PACK_R.pill}px; overflow:hidden; white-space:nowrap;
  border:1px solid var(--rk-edge); background:var(--rk-track); color:var(--rk-dim); opacity:.55;
  font-family:${FONT_UI}; font-weight:600; font-size:${TX.micro}px; line-height:1; letter-spacing:.02em; text-transform:uppercase; }
.me-rk-py span.done{ opacity:1; background:var(--dv-dot); border-color:var(--dv-glow); color:var(--dv-icon-ink); }
.me-rk-py span.on{ opacity:1; height:24px; background:var(--dv-dot); border-color:var(--dv-glow); color:var(--dv-icon-ink); box-shadow:0 0 14px var(--dv-glow); }
.me-rk-py span.gold,.me-rk-py span.sun{ opacity:.85; background:var(--dv-bg); border-color:var(--dv-edge); color:var(--dv-ink); }
.me-rk-sc span i{ display:grid; place-items:center; width:18px; height:18px; font-style:normal; border-radius:${PACK_R.pill}px; background:var(--dv-dot); }
.me-rk-sc span i b{ font-family:${FONT_UI}; font-weight:600; line-height:1; color:var(--dv-icon-ink); font-style:normal; font-size:${TX.micro}px; }
.me-pt{ background:var(--tier-bg); border:1px solid var(--tier-b); color:var(--tier-ink); cursor:pointer; }

.me-under{ position:relative; padding:0 ${S.lg}px ${S.lg}px; }
.me-own{ position:absolute; z-index:3; left:${OWN_X.m}px; top:-${OWN.m - OWN_DROP}px; width:${OWN.m}px; height:${OWN.m}px;
  border-radius:${PACK_R.pill}px; padding:${S.xs}px; background:${RING}; box-shadow:${T.panelShadow}; }
.me-own > button:first-child{ display:block; width:100%; height:100%; padding:0; border:0; border-radius:${PACK_R.pill}px; overflow:hidden; cursor:pointer; background:${T.card}; }
.me-own > button:first-child img{ width:100%; height:100%; object-fit:cover; object-position:50% 14%; display:block; border-radius:${PACK_R.pill}px; border:4px solid ${T.card}; }
/* STORIES (23. 10. 2026, Matej: *„obruč ktorá žiari"*). Živá story = prstenec RING sa otáča a dýcha
   zlatou žiarou; bez story = bezfarebný kruh (v6: *„bez story = bezfarebný kruh + lapis plus"*).
   Prstenec je ::before POD fotkou (z-index -1 vnútri .me-own), aby sa točila len obruč, nie tvár. */
.me-own.st-live, .me-own.st-none{ background:none; }
.me-own.st-live::before, .me-own.st-none::before{ content:''; position:absolute; inset:0; z-index:-1; border-radius:${PACK_R.pill}px; }
.me-own.st-live::before{ background:${RING}; animation:me-spin 6s linear infinite; }
.me-own.st-live{ animation:me-glow 2.4s ease-in-out infinite; }
.me-own.st-none::before{ background:${T.border}; }
@keyframes me-spin{ to{ transform:rotate(360deg); } }
@keyframes me-glow{ 0%,100%{ box-shadow:${T.panelShadow}; } 50%{ box-shadow:0 0 0 2px color-mix(in srgb, ${T.cardEdge} 35%, transparent), 0 0 24px 6px color-mix(in srgb, ${T.cardEdge} 55%, transparent); } }
@media (prefers-reduced-motion:reduce){ .me-own.st-live, .me-own.st-live::before{ animation:none; } }
/* + pridať story — lapisový kotúč vpravo dole na fotke (len môj profil). */
.me-add{ position:absolute; z-index:2; right:0; bottom:${S.sm}px; width:32px; height:32px; padding:0; border-radius:${PACK_R.pill}px; display:grid; place-items:center; cursor:pointer;
  background:${LAPIS.grad}; border:2px solid ${T.card}; box-shadow:${LAPIS_BTN_SHADOW}; }
.me-sdog{ position:relative; border:0; cursor:pointer; }
.me-sdog:disabled{ cursor:default; opacity:.7; }
.me-sdog .cam{ color:${LAPIS.ink}; position:absolute; right:-${S.sm}px; bottom:-${S.xs}px; width:28px; height:28px; border-radius:${PACK_R.pill}px; display:grid; place-items:center;
  background:${LAPIS.grad}; border:2px solid ${T.card}; box-shadow:${LAPIS_BTN_SHADOW}; }
.me-own .ini{ display:grid; place-items:center; width:100%; height:100%; font-family:${FONT_UI}; font-weight:600; font-size:${TX.h1}px; color:${T.inkWarm}; }
${RANK_BADGE_ON ? STORY_RING_CSS : ''}
/* PAWMATE VEDĽA MAJITEĽA (26. 10. 2026, Matej: *„pridá sa vedľa ako fotka a pes, ak bude jeden, pôjde medzi nich"*).
   Polohy v % z fotky majiteľa (jedna rovnica pre mobil 126 aj PC 158): pawmate = MATE_D, vpravo, majiteľ ho
   zľahka prekrýva; jediný pes sedí dole na ich styku. Meno na titulke ustúpi o presah pawmata (MATE_OUT). */
.me-own > button:first-child{ position:relative; z-index:1; }
.me-mate{ position:absolute; z-index:0; left:${MATE_CSS.left}; top:${MATE_CSS.top}; width:${MATE_CSS.d}; aspect-ratio:1; padding:0; border:0; cursor:pointer;
  border-radius:${PACK_R.pill}px; background:${T.card}; box-shadow:0 0 0 2px ${T.border}, ${T.panelShadow}; }
.me-mate img, .me-mate i{ width:100%; height:100%; display:grid; place-items:center; border-radius:${PACK_R.pill}px; object-fit:cover; border:3px solid ${T.card}; background:${T.card};
  font-style:normal; font-family:${FONT_UI}; font-weight:600; font-size:${TX.h2}px; color:${T.inkWarm}; }
.me-card.with-mate .me-foot{ left:${OWN_X.m + Math.round(OWN.m * MATE_OUT) + S.sm}px; }
.me-flat.with-mate .me-foot{ left:${FLAT_X_M + Math.round(OWN.m * MATE_OUT) + S.sm}px; }
.me-card.with-mate .me-foot .rk-row{ zoom:.86; }
@media (min-width:768px){
  .me-card.with-mate .me-foot{ left:${OWN_X.pc + Math.round(OWN.pc * MATE_OUT) + S.lg}px; }
  .me-flat.with-mate .me-foot{ left:${S.xl + Math.round(OWN.pc * MATE_OUT) + S.lg}px; }
  .me-card.with-mate .me-foot .rk-row{ zoom:1; }
}
.me-sat{ position:absolute; left:50%; transform:translateX(-50%); bottom:-${SAT_DROP.m}px; display:flex; align-items:center;
  padding:0; border:0; background:none; cursor:pointer; }
.me-sat .s{ width:${SAT.m}px; height:${SAT.m}px; border-radius:${PACK_R.pill}px; padding:${S.xs}px; background:${RING}; margin-left:-18px;
  box-shadow:0 0 0 2px ${T.card}, ${T.panelShadow}; }
.me-sat .s:first-child{ margin-left:0; }
.me-sat .s img{ width:100%; height:100%; border-radius:${PACK_R.pill}px; object-fit:cover; display:block; border:2px solid ${T.card}; }
.me-sat .cnt{ position:absolute; right:-${S.sm}px; top:-${S.xs}px; min-width:22px; height:22px; padding:0 ${S.xs}px; border-radius:${PACK_R.pill}px;
  background:${LAPIS.grad}; color:${LAPIS.ink}; border:1.5px solid ${T.card}; display:grid; place-items:center;
  font-family:${FONT_UI}; font-weight:600; font-size:${TX.micro}px; }
.me-sat .up{ width:30px; height:30px; border-radius:${PACK_R.pill}px; display:grid; place-items:center; background:${LAPIS.grad};
  box-shadow:${LAPIS_BTN_SHADOW}; border:2px solid ${T.card}; }
.me-sat .up img{ transform:rotate(90deg); }
.me-card.open .me-sat{ bottom:-15px; }

.me-drawer{ margin:0 -${S.lg}px; max-height:0; opacity:0; overflow:hidden; transition:max-height .45s ease, opacity .3s ease;
  background:linear-gradient(180deg, transparent 0%, color-mix(in srgb, ${T.cardEdge} 14%, transparent) 45%, transparent 100%); }
.me-card.open .me-drawer{ max-height:1200px; opacity:1; }
.me-drow{ display:flex; flex-wrap:wrap; align-items:center; gap:${S.sm}px; padding:${S.md}px ${S.sm}px ${S.md}px ${DOG_X.m}px; }
.me-drow:first-child{ padding-top:${S.xxl}px; }
.me-drow + .me-drow{ border-top:1px solid ${T.hairline}; }
.me-drow:last-child{ padding-bottom:${S.xl}px; }
.me-dp{ position:relative; flex:none; width:${DOG_D.m}px; height:${DOG_D.m}px; border-radius:${PACK_R.pill}px; padding:${S.xs}px; background:${RING};
  box-shadow:${T.panelShadow}; border:0; cursor:pointer; }
.me-dp img{ width:100%; height:100%; border-radius:${PACK_R.pill}px; object-fit:cover; display:block; border:2px solid ${T.card}; }
.me-no{ display:inline-flex; align-items:center; background:${LAPIS.grad}; color:${LAPIS.ink}; box-shadow:${LAPIS_BTN_SHADOW};
  font-family:${FONT_UI}; font-weight:600; font-size:${TX.micro}px; letter-spacing:.02em; padding:0 ${S.sm}px; border-radius:${PACK_R.pill}px;
  border:1.5px solid ${T.card}; white-space:nowrap; }
.me-dp .me-no{ position:absolute; left:50%; bottom:-${S.sm}px; transform:translateX(-50%); }
.me-hg{ flex:1; min-width:0; position:relative; height:56px; padding:0; border:0; background:none; cursor:pointer; }
.me-hg .fa, .me-hg .ba{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:${S.sm}px;
  transition:opacity .45s ease, transform .45s ease; }
.me-hg .fa img{ max-width:100%; max-height:100%; display:block; object-fit:contain; }
.me-hg .ba{ opacity:0; transform:translateY(4px); }
.me-hg .ba b{ font-family:${DOG_FONT}; font-weight:700; font-size:${TX.h2}px; color:${T.inkStrong}; white-space:nowrap; overflow:hidden; }
.me-hg .empty{ font-family:${FONT_UI}; font-size:${TX.label}px; color:${T.inkWarm}; }
.me-drow.flip .me-hg .fa{ opacity:0; transform:scale(.96); }
.me-drow.flip .me-hg .ba{ opacity:1; transform:none; }
.me-dinfo{ flex-basis:100%; max-height:0; opacity:0; overflow:hidden; transition:max-height .45s ease, opacity .3s ease; }
.me-drow.flip .me-dinfo{ max-height:240px; opacity:1; }
.me-dedit{ display:inline-flex; align-items:center; gap:${S.xs}px; margin-top:${S.sm}px; padding:${S.xs}px ${S.md}px; border-radius:${PACK_R.pill}px;
  background:transparent; border:1.5px solid ${LAPIS.edge}; color:${LAPIS.edge}; cursor:pointer;
  font-family:${FONT_UI}; font-weight:600; font-size:${TX.micro}px; letter-spacing:.14em; text-transform:uppercase; }
.me-dedit:hover{ background:${LAPIS.fill}; }
.me-dinfo .none{ color:${T.inkFaint}; font-style:italic; cursor:pointer; }
.me-dinfo p{ margin:${S.xs}px 0 0; font-family:${FONT_UI}; font-size:${TX.label}px; line-height:1.45; color:${T.ink};
  display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:3; overflow:hidden; }
.me-gap{ height:${GAP.m}px; }
.me-card.open .me-gap{ height:0; }

.me-stats{ display:grid; grid-template-columns:repeat(5,1fr); margin:${S.md}px 0 0; padding:${S.sm}px 0; }
.me-stats button{ background:none; border:0; padding:0; cursor:pointer; color:inherit; text-align:center; min-width:0; }
.me-stats b{ display:block; font-family:${FONT_UI}; font-weight:600; font-size:${TX.lead}px; color:${T.inkStrong}; line-height:1.2; white-space:nowrap; }
.me-stats b.na{ color:${T.alertRed}; }
.me-stats span{ display:block; font-family:${FONT_UI}; font-size:${TX.micro}px; color:${T.inkWarm}; white-space:nowrap; }
.me-btns{ display:grid; grid-template-columns:1fr 1fr; gap:${S.sm}px; margin-top:${S.md}px; }
/* Tlačidlá v Grotesku, meno ostáva Cinzel (Matej 25. 10.: *„meno cinzel a tlačidlá skús grotesk“*). */
.me-btns button{ font-family:${FONT_UI}; font-weight:600; font-size:${TX.micro}px; letter-spacing:.14em; text-transform:uppercase; white-space:nowrap;
  padding:${S.md}px ${S.sm}px; border-radius:${PACK_R.field}px; cursor:pointer; }
.me-cta{ background:${LAPIS.grad}; color:${LAPIS.ink}; border:1px solid ${LAPIS.deep}; box-shadow:${LAPIS_BTN_SHADOW}; }
.me-cta:hover{ background:${LAPIS.gradHover}; }
.me-out{ background:transparent; color:${LAPIS.edge}; border:1.5px solid ${LAPIS.edge}; }
.me-out:hover{ background:${LAPIS.fill}; }
.me-role{ display:flex; flex-wrap:wrap; gap:${S.xs}px; margin-top:${S.md}px; }
.me-role .pk-pill{ font-family:${FONT_UI}; font-weight:600; font-size:${TX.micro}px; letter-spacing:.14em; text-transform:uppercase; padding:${S.xs}px ${S.md}px; }
.me-bio{ margin:${S.sm}px 0 0; }
.me-bio p{ margin:0; font-family:${FONT_UI}; font-size:${TX.body}px; line-height:1.45; color:${T.ink};
  display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:3; overflow:hidden; }
.me-bio.full p{ display:block; }
.me-bio .sig{ color:${T.inkWarm}; font-size:${TX.label}px; white-space:nowrap; }
.me-bio .sig b{ font-family:${DOG_FONT}; font-weight:700; }
.me-bio.empty p{ color:${T.inkFaint}; font-style:italic; }
.me-more{ background:none; border:0; padding:0; margin-top:2px; cursor:pointer; font-family:${FONT_UI}; font-weight:500; font-size:${TX.label}px; color:${LAPIS.edge}; }
/* Pás pilulek — pretŕča cez pravý okraj karty, aby bolo vidno, že sa dá ťahať (Matej 22. 10.). */
.me-strip{ display:flex; gap:6px; overflow-x:auto; scrollbar-width:none; margin:${S.sm}px -${S.lg}px 0 0; padding:0 ${S.lg}px 2px 0; }
.me-strip::-webkit-scrollbar{ display:none; }
.me-strip .pk-pill{ flex:none; font-family:${FONT_UI}; font-weight:500; font-size:${TX.micro}px; letter-spacing:.14em; text-transform:uppercase; padding:${S.xs}px ${S.sm}px; }
.me-strip .pk-pill i{ font-style:normal; letter-spacing:0; }
.me-dinfo .me-strip{ margin-right:-${S.sm}px; padding-right:${S.sm}px; }

.me-tabs{ display:grid; grid-auto-flow:column; grid-auto-columns:1fr; border-bottom:1px solid ${T.hairline}; margin-top:${S.lg}px; }
.me-tabs button{ display:flex; flex-direction:column; align-items:center; gap:${S.xs}px; background:none; border:0; cursor:pointer;
  padding:${S.sm}px 0; font-family:${FONT_UI}; font-size:${TX.micro}px; letter-spacing:.14em; text-transform:uppercase;
  color:${T.inkWarm}; white-space:nowrap; }
.me-tabs button img{ opacity:.5; }
.me-tabs button.on{ color:${T.inkStrong}; box-shadow:inset 0 -2px 0 ${T.cardEdge}; }
.me-tabs button.on img{ opacity:1; }
.me-sub{ display:flex; gap:6px; margin-top:${S.sm}px; }
.me-sub .pk-pill{ font-family:${FONT_UI}; font-size:${TX.micro}px; letter-spacing:.14em; text-transform:uppercase; padding:${S.xs}px ${S.md}px; }
.me-sub .pk-pill.on{ background:${LAPIS.fill}; border-color:${LAPIS.edge}; color:${LAPIS.edge}; }
/* Každá karta má TÚ ISTÚ dlaždicu (Matej 22. 10.: „každá položka by mala mať tú istú veľkosť"). */
.me-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:4px; margin-top:4px; }
.me-grid button{ position:relative; aspect-ratio:4/5; padding:0; border:0; overflow:hidden; border-radius:${PACK_R.field}px; background:${T.tileBg}; cursor:pointer; }
.me-grid img{ width:100%; height:100%; object-fit:cover; display:block; }
.me-grid .cap{ position:absolute; left:0; right:0; bottom:0; padding:${S.lg}px ${S.sm}px ${S.sm}px; text-align:left;
  background:linear-gradient(180deg, transparent, color-mix(in srgb, ${T.pageBg} 80%, transparent));
  font-family:${FONT_UI}; font-weight:600; font-size:${TX.micro}px; line-height:1.2; color:${LAPIS.ink}; }
.me-grid--story button{ aspect-ratio:9/16; }
.me-tag{ position:absolute; left:4px; top:4px; font-family:${FONT_UI}; font-size:${TX.micro}px; letter-spacing:.14em; background:${LAPIS.grad}; color:${LAPIS.ink}; padding:0 ${S.sm}px; border-radius:${PACK_R.pill}px; }
.me-empty{ padding:${S.xl}px ${S.lg}px; text-align:center; font-family:${FONT_UI}; font-size:${TX.body}px; color:${T.inkWarm}; }

@media (min-width:768px){
  .me-cover{ height:${COVER_H.pc}px; }
  .me-foot{ left:${OWN_X.pc + OWN.pc + S.lg}px; bottom:-${S.lg}px; }
  .me-nm{ font-size:${TX.h1}px; }
  .me-lv{ max-width:360px; }
  .me-lv > *{ letter-spacing:.14em; }
  .me-under{ padding:0 ${S.xl}px ${S.xl}px; }
  .me-own{ left:${OWN_X.pc}px; top:-${OWN.pc - S.lg}px; width:${OWN.pc}px; height:${OWN.pc}px; }
  .me-sat{ bottom:-${SAT_DROP.pc}px; }
  .me-sat .s{ width:${SAT.pc}px; height:${SAT.pc}px; }
  .me-gap{ height:${GAP.pc}px; }
  .me-drawer{ margin:0 -${S.xl}px; }
  .me-drow{ padding-left:${DOG_X.pc}px; gap:${S.lg}px; }
  .me-drow:first-child{ padding-top:${S.xxxl}px; }
  .me-dp{ width:${DOG_D.pc}px; height:${DOG_D.pc}px; }
  .me-dp .me-no{ font-size:${TX.label}px; }
  /* PC: heroglyf menší a meno HNEĎ VEDĽA (Matej 22. 10.) — ťuk ukáže bio a pilulky psa. */
  .me-hg{ flex:0 1 auto; height:72px; display:flex; align-items:center; gap:${S.lg}px; }
  .me-hg .fa, .me-hg .ba{ position:static; opacity:1; transform:none; height:100%; }
  .me-hg .ba b{ font-size:${TX.h1}px; }
  .me-drow.flip .me-hg .fa{ opacity:1; transform:none; }
  /* PC: rozbalený šuplík = ako mobil po ťuku — bio a pilulky psa hneď (Matej 23. 10.). */
  .me-dinfo{ padding-left:${DOG_D.pc + S.lg}px; max-height:240px; opacity:1; }
  .me-strip{ margin-right:0; padding-right:0; }
  .me-bio{ max-width:560px; }
  .me-grid{ grid-template-columns:repeat(5,1fr); }
}
`;

/* PROFIL BEZ KARTY (TEST_BUILD, Matej 25. 10. 2026: *„layout daj bez toho bloku nad chrámom, skrátka
 * obsah na celú šírku — horná časť bude bledá s gradientom nad obrázkom a celá plocha bude bledá"*).
 * Titulka siaha až pod horný rad (AINUBIS · obálka · chvost) a rozplynie sa do papyrusu hore aj dole;
 * stránka stojí na `.pk-paper` (PackMe ju zapíše do `PAPER_ROUTES_EXTRA`). Len `/pack/profile` —
 * UPRAVIŤ PROFIL ostáva na karte, kým to Matej nepovie. Odsadenie z rovnice: rad = `PACK_TOPROW.content`,
 * okraj stĺpca = `px-4` / `sm:px-6` z `PackLayout`. */
const TOP = `(env(safe-area-inset-top, 0px) + ${PACK_TOPROW.content}px)`;
/* Horný rad (ikonky) stojí na PLNOM papyruse — fotka začína až pod ním a rozplynie sa do neho
 * (Matej 25. 10.: *„horná lišta bude širšia, aby ikonky s obálkou a chvostom boli celé na bledom"*). */
/* 🔁 Bez prechodu pod lištou (Matej 25. 10. nad porovnaním: variant „bez horného gradientu" → *„ok"*) —
 * fotka začína ROVNOU hranou hneď pod radom, rozplýva sa len dole. */
const FLAT_FADE = 'linear-gradient(180deg, #000 0%, #000 42%, transparent 100%)';
/* Titulka o 20 px vyššia než na karte (Matej 25. 10.: *„zväčši veľkosť fotky tak o 20px na výšku"*). */
const FLAT_TALL = 20;
/* ODZNAKY V OSI PSA (Matej 25. 10.: *„tie odznaky by mohli byť v tej istej výške ako ikonka psa, nech to sedí
 * a lícuje — teraz sú vyššie"*). Stred radu odznakov (46 px) = stred spodného psa na obruči, ktorý sedí
 * 3 px (mobil) / 4 px (PC) nad spodkom fotky majiteľa: klesnutie = 46/2 − 3, resp. 46/2 − 4 (zmerané 25. 10.). */
const BADGE_SINK = { m: 20, pc: 19 };
/* Bez rámu karty meria vzduch od okraja OKNA — fotka majiteľa na `PAGE_AIR` (16), šuplík v jej osi. */
const FLAT_X = S.lg;
export const ME_FLAT_CSS = `
.me-flat .me-nm{ font-weight:900; }
.me-card.me-flat{ border:0; border-radius:0; background:none; box-shadow:none; margin:calc(-1 * ${TOP}) -${S.lg}px 0; }
.me-flat .me-cover{ height:calc(${COVER_H.m + FLAT_TALL}px + ${TOP}); }
/* Fotka (::before) začína POD horným radom — nie maskou nad ním. Tak sa výrez (coverY) aj ťahanie v UPRAVIŤ
   rátajú z výšky, ktorú človek naozaj vidí. */
.me-flat .me-cover::before{ top:calc(${TOP}); -webkit-mask-image:${FLAT_FADE}; mask-image:${FLAT_FADE}; }
.me-flat .me-cover::after{ display:none; }
.me-role--label{ flex-wrap:nowrap; align-items:center; gap:${S.sm}px; margin-top:${S.lg}px; }
.me-role--label span{ font-family:${FONT_UI}; font-weight:600; font-size:${TX.micro}px; letter-spacing:.26em; text-transform:uppercase; color:${T.inkWarm}; white-space:nowrap; }
.me-role--label i{ flex:1; height:1px; background:linear-gradient(90deg, ${T.cardEdge}, transparent); }
.me-flat .me-tbar{ padding-top:calc(${TOP} + ${S.sm}px); padding-left:${FLAT_X}px; padding-right:${FLAT_X}px; }
.me-flat .me-own{ left:${FLAT_X}px; }
.me-flat .me-foot{ left:${FLAT_X + OWN.m + S.sm}px; right:${FLAT_X}px; bottom:-${OWN_DROP + BADGE_SINK.m}px; }
.me-flat .me-drow{ padding-left:${FLAT_X + OWN.m / 2 - DOG_D.m / 2}px; }
@media (min-width:640px){ .me-card.me-flat{ margin:calc(-1 * ${TOP}) -${S.xl}px 0; } }
@media (min-width:768px){
  .me-flat .me-cover{ height:calc(${COVER_H.pc + FLAT_TALL}px + ${TOP}); }
  .me-flat .me-tbar{ padding-left:${S.xl}px; padding-right:${S.xl}px; }
  .me-flat .me-own{ left:${S.xl}px; }
  .me-flat .me-foot{ left:${S.xl + OWN.pc + S.lg}px; right:${S.xl}px; bottom:-${S.lg + BADGE_SINK.pc}px; }
  .me-flat .me-drow{ padding-left:${S.xl + OWN.pc / 2 - DOG_D.pc / 2}px; }
  /* PC: stĺpec 880 nekončí na okraji okna — titulka sa rozplynie aj do strán, inak by stáli dve tvrdé hrany. */
  .me-flat .me-cover::before{ -webkit-mask-image:${FLAT_FADE}, linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%);
    mask-image:${FLAT_FADE}, linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%);
    -webkit-mask-composite:source-in; mask-composite:intersect; }
}
`;


/** Poloha titulky v % (0 = horný okraj fotky, 100 = spodný). Prázdne = 35, ako doteraz. */
export const COVER_Y_DEFAULT = 35;

/** TITULKA — BONES · meno · DEVOTION · PÚTNIK. Fotka sa rozplynie do karty maskou.
 *  `onMoveY` = režim UPRAVIŤ: titulka sa ťahá prstom hore/dole a pri pustení sa poloha
 *  odovzdá von (`onMoveEnd`). Ťah je prepočítaný na skutočný presah fotky, aby fotka
 *  išla pod prstom 1:1, nie rýchlejšie ani pomalšie. */
export function MeCover({ cover, coverY, name, devLabel, devLevel, pilgrimLabel, pilgrimLevel, pilgrimPct = 0, servantYears = null, servantLabel = 'Servant', pilgrimRankLabel = 'Pilgrim', bones, onBones, onDev, onPilgrim, rank, stack = false, right, onMoveY, onMoveEnd, onCover, coverLabel, noRanks = false, withName }: {
  /** Meno pawmata pod menom (Matej 26. 10.: „každý kto uvidí môj profil by videl aj foto aj názov A Lenka“) — len tam, kde je jeho fotka. */
  withName?: string | null;
  cover: string | null;
  /** PAWMATE bez vlastného psa (Matej 26. 10. 2026: *„ona nebude mať level pútnika ani služobníka"*) — titulka len s menom. */
  noRanks?: boolean;
  coverY?: number;
  name: string;
  devLabel: string;
  /** Stupeň DEVOTION 1–22 — pilulka nesie jeho guličku a kresbu (`devotionTiers.ts`). */
  devLevel: number;
  /** Text pilulky pútnika — pod menom len číslo (Matej 23. 10.: slovo „Pútnik" až v rozklike). */
  pilgrimLabel: string;
  /** Level PÚTNIKA — pilulka nesie farbu jeho pásma (`packTiers.ts`), tú istú ako hlavička `/map`. */
  pilgrimLevel: number;
  /** Postup PÚTNIKA k ďalšiemu levelu 0–100 — plní kapsulu odznaku (TEST_BUILD). */
  pilgrimPct?: number;
  /** Dokončené roky služby (DOG ID `basics.since`); null = UČEŇ. */
  servantYears?: number | null;
  /** Mená pre čítačku pri odznakoch (TEST_BUILD): „Služobník", „Pútnik". */
  servantLabel?: string;
  pilgrimRankLabel?: string;
  /** Bez `bones` sa pilulka nekreslí — UPRAVIŤ PROFIL ju nemá (Matej 23. 10.: BONES = šuplík na profile). */
  bones?: string;
  onBones?: () => void;
  onDev?: () => void;
  onPilgrim?: () => void;
  /** Ktorý rozbaľovač je otvorený — jeho pilulka dostane lem. */
  rank?: 'dev' | 'pt' | 'study' | null;
  /** Hodnosti pod sebou (vedľa fotky stojí viac ľudí). */
  stack?: boolean;
  right?: ReactNode;
  onMoveY?: (y: number) => void;
  onMoveEnd?: (y: number) => void;
  /** Ťuk na pozadie titulky = album titulky (`CoverSheet`, 23. 10. 2026). Nie v režime ťahania. */
  onCover?: () => void;
  coverLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [drag, setDrag] = useState<{ y0: number; p0: number } | null>(null);
  const y = coverY ?? COVER_Y_DEFAULT;
  const url = cover ? sizedUrl(cover, 1200) : null;

  useEffect(() => {
    if (!url || !onMoveY) return;
    const img = new Image();
    img.onload = () => setNat({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
  }, [url, onMoveY]);

  // Koľko px fotky presahuje titulku zvisle (background-size: cover). 0 = niet čo posúvať.
  const overflow = () => {
    const el = ref.current;
    if (!el || !nat) return 0;
    // Fotka je pseudo-prvok `::before`; v profile bez karty začína až POD horným radom (`top`),
    // takže posúva sa len v jeho výške, nie v celej titulke (Matej 25. 10.: „fotka Hektora v upraviť
    // titulku mi nejde dať nižšie, ako keby mala iný horný koniec a bola za panelom").
    const { width: W, height: full } = el.getBoundingClientRect();
    const H = full - (parseFloat(getComputedStyle(el, '::before').top) || 0);
    const scale = Math.max(W / nat.w, H / nat.h);
    return Math.max(0, nat.h * scale - H);
  };
  const editable = !!onMoveY && !!url;
  const pilgrimTier = tierOfLevel(pilgrimLevel);
  const activeDays = useActiveDays(RANK_BADGE_ON);

  return (
    <div
      ref={ref}
      className={`me-cover${editable ? ' drag' : onCover ? ' pick' : ''}${drag ? ' on' : ''}`}
      style={url ? ({ '--me-cover': `url(${url})`, '--me-cover-y': `${y}%` } as CSSProperties) : undefined}
      onPointerDown={editable ? (e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setDrag({ y0: e.clientY, p0: y });
      } : undefined}
      onPointerMove={editable && drag ? (e) => {
        const ov = overflow();
        if (!ov) return;
        const next = Math.min(100, Math.max(0, drag.p0 - ((e.clientY - drag.y0) / ov) * 100));
        onMoveY?.(Math.round(next));
      } : undefined}
      onPointerUp={editable && drag ? () => { setDrag(null); onMoveEnd?.(y); } : undefined}
      onPointerCancel={editable && drag ? () => { setDrag(null); onMoveEnd?.(y); } : undefined}
      onClick={!editable && onCover ? (e) => { if (!(e.target as HTMLElement).closest('button')) onCover(); } : undefined}
    >
      <div className="me-tbar">
        {bones == null ? <span /> : RANK_BADGE_ON ? (
          <BonesBadge value={bones} onClick={onBones} label={`${bones} BONES`} />
        ) : onBones ? (
          <button type="button" className="me-bones" onClick={onBones} aria-label={`${bones} BONES`}>
            <BrandIcon name="bone" size={16} tint="dark" />
            {bones}
          </button>
        ) : (
          <span className="me-bones" aria-label={`${bones} BONES`}>
            <BrandIcon name="bone" size={16} tint="dark" />
            {bones}
          </span>
        )}
        {right ?? (onCover && (
          <button type="button" className="me-cvbtn" onClick={onCover} aria-label={coverLabel}>
            <BrandIcon name="camera" size={16} tint="white" />
          </button>
        ))}
      </div>
      <div className="me-foot">
        <h1 className="me-nm">{name}</h1>
        {withName && <p className="me-with">&amp; {withName}</p>}
        {RANK_BADGE_ON && <style>{RANK_BADGE_CSS}</style>}
        {noRanks ? null : RANK_BADGE_ON ? (
          // TEST_BUILD (25. 10. 2026): odznaky SLUŽOBNÍK + PÚTNIK namiesto pilulky DEVOTION + PÚTNIK.
          // Roky = DOG ID `basics.since` (useServantYears, volá stránka so psami).
          <div className="me-lv rk-row">
            <ServantBadge years={servantYears ?? null} activeDays={activeDays} on={rank === 'dev'} onClick={onDev} label={servantLabel} />
            <PilgrimBadge level={pilgrimLevel} pct={pilgrimPct} on={rank === 'pt'} onClick={onPilgrim} label={`${pilgrimRankLabel} ${pilgrimLevel}`} />
          </div>
        ) : (
        <div className={`me-lv${stack ? ' stack' : ''}`}>
          {/* Prázdny `devLabel` = DEVOTION cudzieho človeka appka nemá (cudzí profil) — pilulka sa nekreslí. */}
          {devLabel && <button type="button" data-rank-toggle className={`me-dv${rank === 'dev' ? ' on' : ''}`} onClick={onDev} aria-expanded={rank === 'dev'} style={devotionVars(devLevel)}>
            <span className="me-dvg"><b>{devLevel}</b></span>
            {devLabel}
          </button>}
          <button type="button" data-rank-toggle className={`me-pt${rank === 'pt' ? ' on' : ''}`} onClick={onPilgrim} aria-expanded={rank === 'pt'} style={tierStyle(pilgrimTier)}>
            <BrandIcon name="world-grid" size={12} tint={inkIsLight(pilgrimTier.ink) ? 'white' : 'dark'} />
            {pilgrimLabel}
          </button>
        </div>
        )}
      </div>
    </div>
  );
}

/** Polohy psov: s pawmatom a JEDNÝM psom sedí pes na styku oboch kruhov, inak oblúk ako dovtedy. */
function arcFor(count: number, withMate: boolean): CSSProperties[] {
  if (!withMate || count !== 1) return arcDogs(count);
  const { d, cx, cy } = DOG1_WITH_MATE;
  const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;
  return [{ width: pct(d), left: pct(cx - d / 2), top: pct(cy - d / 2) }];
}

/** FOTKA MAJITEĽA + SATELIT PSOV. Bez `onToggle` je satelit len obraz (náhľad v UPRAVIŤ). */
export function MeOwn({ photo, initial, dogs, open = false, onToggle, onPhoto, photoLabel, toggleLabel, badge, story, onAdd, addLabel, onDogPhoto, dogBusy, dogPhotoLabel, mate }: {
  photo: string | null;
  /** PAWMATE ukázaný vedľa majiteľa (26. 10. 2026). Bez neho sa hlava kreslí ako dovtedy. */
  mate?: { photo: string | null; initial: string; label: string; onClick?: () => void } | null;
  initial: string;
  dogs: PackDogFull[];
  open?: boolean;
  onToggle?: () => void;
  onPhoto: () => void;
  photoLabel: string;
  toggleLabel?: string;
  badge?: ReactNode;
  /** Stav stories — bez neho ostane stály prstenec RING (UPRAVIŤ PROFIL). */
  story?: 'live' | 'none';
  /** `+` na fotke = nová story (len môj profil). */
  onAdd?: () => void;
  addLabel?: string;
  /** UPRAVIŤ PROFIL: ťuk na psa v satelite = nová hlavná fotka psa (Matej 23. 10.: *„fotka psa aj majiteľa
   *  sa mení v edit profile na ich fotkách"*). Každý pes dostane foťák ako fotka majiteľa. */
  onDogPhoto?: (dog: PackDogFull) => void;
  dogBusy?: string | null;
  dogPhotoLabel?: string;
}) {
  // UPRAVIŤ PROFIL s oblúkom: psy stoja tam, kde na profile — len každý nesie foťák (Matej 25. 10.: *„fotka psa
  // je inak ako v edite, daj ju podľa /profile"*). Satelit nižšie ostáva pre starý build bez oblúka.
  if (onDogPhoto && dogs.length > 0 && RANK_BADGE_ON) {
    const shown = dogs.slice(0, ARC_MAX);
    return (
      <div className={`me-own${story ? ` st-${story}` : ''}`}>
        <button type="button" onClick={onPhoto} aria-label={photoLabel}>
          {photo ? <img src={sizedUrl(photo, 320)} alt="" /> : <span className="ini">{initial}</span>}
        </button>
        {badge}
        {mate && (
          <button type="button" className="me-mate" onClick={mate.onClick} disabled={!mate.onClick} aria-label={mate.label}>
            {mate.photo ? <img src={sizedUrl(mate.photo, 200)} alt="" /> : <i>{mate.initial}</i>}
          </button>
        )}
        <span className="me-arc">
          {arcFor(shown.length, !!mate).map((p, k) => {
            const d = shown[k];
            return (
              <button key={d.id} type="button" className="ad me-sdog" style={p} onClick={() => onDogPhoto(d)} disabled={dogBusy === d.id}
                aria-label={`${dogPhotoLabel ?? ''} ${d.dog_name ?? ''}`.trim()}>
                {d.cloudinary_main_url && <img src={sizedUrl(d.cloudinary_main_url, 140)} alt="" />}
                <span className="cam">{dogBusy === d.id ? <BrandIcon name="cycle" size={14} tint="white" /> : <HandCamera size={15} />}</span>
              </button>
            );
          })}
        </span>
      </div>
    );
  }
  if (onDogPhoto && dogs.length > 0) {
    return (
      <div className={`me-own${story ? ` st-${story}` : ''}`}>
        <button type="button" onClick={onPhoto} aria-label={photoLabel}>
          {photo ? <img src={sizedUrl(photo, 320)} alt="" /> : <span className="ini">{initial}</span>}
        </button>
        {badge}
        {mate && (
          <button type="button" className="me-mate" onClick={mate.onClick} disabled={!mate.onClick} aria-label={mate.label}>
            {mate.photo ? <img src={sizedUrl(mate.photo, 200)} alt="" /> : <i>{mate.initial}</i>}
          </button>
        )}
        <span className="me-sat">
          {dogs.slice(0, 3).map((d) => (
            <button key={d.id} type="button" className="s me-sdog" onClick={() => onDogPhoto(d)} disabled={dogBusy === d.id}
              aria-label={`${dogPhotoLabel ?? ''} ${d.dog_name ?? ''}`.trim()}>
              {d.cloudinary_main_url && <img src={sizedUrl(d.cloudinary_main_url, 140)} alt="" />}
              <span className="cam">{dogBusy === d.id ? <BrandIcon name="cycle" size={14} tint="white" /> : <HandCamera size={15} />}</span>
            </button>
          ))}
        </span>
      </div>
    );
  }
  const sat = open ? (
    <span className="up"><BrandIcon name="back" size={13} tint="white" /></span>
  ) : (
    <>
      {dogs.slice(0, 2).map((d) => (
        <span key={d.id} className="s">{d.cloudinary_main_url && <img src={sizedUrl(d.cloudinary_main_url, 140)} alt="" />}</span>
      ))}
      {dogs.length > 2 && <span className="cnt">{dogs.length}</span>}
    </>
  );
  // TEST_BUILD: psy po spodnom oblúku obruče (nákres `plany/nakresy/obruc/ig.html`, sekcia „psy po spodku kruhu").
  // DEV: `?psy=5` zopakuje psov, aby sa dal oblúk pozrieť aj s jedným psom v účte; `?story=1` zapne obruč story.
  const devN = import.meta.env.DEV ? Number(new URLSearchParams(window.location.search).get('psy')) : 0;
  if (devN > 0 && dogs.length > 0) dogs = Array.from({ length: devN }, (_, k) => ({ ...dogs[k % dogs.length], id: `${dogs[k % dogs.length].id}-${k}` }));
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('story') === '1') story = 'live';
  const arc = RANK_BADGE_ON && !open && dogs.length > 0;
  return (
    <div className={`me-own${story ? ` st-${story}` : ''}`}>
      <button type="button" onClick={onPhoto} aria-label={photoLabel}>
        {photo ? <img src={sizedUrl(photo, 320)} alt="" /> : <span className="ini">{initial}</span>}
      </button>
      {badge}
      {mate && (
        <button type="button" className="me-mate" onClick={mate.onClick} disabled={!mate.onClick} aria-label={mate.label}>
          {mate.photo ? <img src={sizedUrl(mate.photo, 200)} alt="" /> : <i>{mate.initial}</i>}
        </button>
      )}
      {arc && (
        <button type="button" className="me-arc" onClick={onToggle} aria-expanded={open} aria-label={toggleLabel} disabled={!onToggle}>
          {arcFor(dogs.length, !!mate).map((p, k) => {
            const more = dogs.length > ARC_MAX && k === ARC_MAX - 1;
            const d = dogs[k];
            return more
              ? <span key="cnt" className="ad cnt" style={p}>+{dogs.length - (ARC_MAX - 1)}</span>
              : <span key={d.id} className="ad" style={p}>{d.cloudinary_main_url && <img src={sizedUrl(d.cloudinary_main_url, 140)} alt="" />}</span>;
          })}
        </button>
      )}
      {onAdd && (
        <button type="button" className="me-add" onClick={onAdd} aria-label={addLabel}>
          <BrandIcon name="plus-sign" size={14} tint="white" />
        </button>
      )}
      {!arc && dogs.length > 0 && (onToggle ? (
        <button type="button" className="me-sat" onClick={onToggle} aria-expanded={open} aria-label={toggleLabel}>{sat}</button>
      ) : (
        <span className="me-sat" aria-hidden>{sat}</span>
      ))}
    </div>
  );
}

/** Farby pásma PÚTNIKA ako CSS premenné — `.me-pt` aj výplň pásu v MeRank ich čítajú. */
const tierStyle = (t: PackTier) => ({ '--tier-bg': tierGradient(t), '--tier-b': t.b, '--tier-ink': t.ink } as CSSProperties);
/** Svetlý inkoust ⇒ biela ikonka, tmavý ⇒ tmavá (inkousty v `PACK_TIERS` sú len tieto dva druhy). */
const inkIsLight = (ink: string) => parseInt(ink.slice(1, 3), 16) > 0x80;


/** PROGRES HODNOSTI (Matej 23. 10.: *„progresbar žiari, urob to krajšie… názov ďalšieho levelu daj napravo
 *  a do stredu xxx/yyy"*). Pás žiari farbou hodnosti, v strede body v tomto stupni / koľko stupeň chce,
 *  napravo ďalší stupeň. Text v strede je dvakrát — svetlý nad koľajou, tmavý orezaný na šírku výplne. */
function RankBar({ pct, center, next, label }: { pct: number; center: string; next?: ReactNode; label: string }) {
  const w = Math.max(0, Math.min(100, pct));
  const fill = `max(${w}%, 26px)`;
  return (
    <div className="me-rk-row">
      <div className="me-rk-bar" role="progressbar" aria-valuenow={Math.round(w)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <b style={{ width: fill }} />
        <span>{center}</span>
        <span className="in" style={{ clipPath: `inset(0 calc(100% - ${fill}) 0 0)` }}>{center}</span>
      </div>
      {next && <span className="me-rk-nx">{next}</span>}
    </div>
  );
}

/** Oddanosť nesie SRDCE S LABKOU, nie ankh (Matej 23. 10.). */
export function DevotionMark({ size = 14, tint = 'gold' as const }: { size?: number; tint?: 'gold' | 'white' | 'dark' }) {
  return <BrandIcon name="heartpaw" size={size} tint={tint} style={{ verticalAlign: '-2px' }} />;
}

export interface StudyStats { read: number; total: number; pct: number; liked: number; saved: number }

/** Farby bloku podľa hodnosti — premenné pre `.me-rk` (podklad, inkoust, výplň pásu). */
function rankVars(kind: 'dev' | 'pt' | 'study', ptLevel: number, devIndex = 1): CSSProperties {
  if (kind === 'dev') {
    // NOC + ŽIARA: tmavý blok so zlatým lemom, pás a aktuálny stupeň vo farbe guličky.
    const t = devotionTier(devIndex);
    return { '--rk-bg': NIGHT, '--rk-edge': NIGHT_EDGE, '--rk-ink': NIGHT_INK,
      '--rk-dim': NIGHT_INK, '--rk-fill': t.dot, '--rk-bg-ink': '#140D07', '--rk-track': 'rgba(243,230,200,.14)', ...devotionVars(devIndex) } as CSSProperties;
  }
  if (kind === 'pt') {
    const t = tierOfLevel(ptLevel);
    return { '--rk-bg': tierGradient(t), '--rk-edge': t.b, '--rk-ink': t.ink, '--rk-dim': t.ink,
      '--rk-fill': T.card, '--rk-bg-ink': '#1F1A0E', '--rk-track': 'rgba(0,0,0,.28)' } as CSSProperties;
  }
  return { '--rk-bg': AINUBIS.surface, '--rk-edge': AINUBIS.edgeStrong, '--rk-ink': '#EAFBFF',
    '--rk-dim': AINUBIS.cyan, '--rk-fill': AINUBIS.cyan, '--rk-bg-ink': '#06121A', '--rk-track': 'rgba(234,251,255,.12)' } as CSSProperties;
}

/** ROZBAĽOVAČ HODNOSTI pod hlavou (Matej 23. 10.: *„po kliknutí na faraóna sa zroluje dropdown s infom
 *  o leveloch a stupnica … to isté pri pútnikovi — chýbajúce body do ďalšieho levelu, otvoriť tripstats"*).
 *  Rebríček je `DEVOTION_LEVELS` (jeden zdroj), PÚTNIK je `levelProgress` z `tripPoints.ts`.
 *  Tretí druh ŠTÚDIUM (23. 10. večer): ťuk na percento štúdia — základné čísla AINUBISA + odkaz do VAULTu. */
export function MeRank({ kind, devotion, pilgrim, study, servantYears, onDogId, onStats, onVault, onAbout, onClose, tx }: {
  kind: 'dev' | 'pt' | 'study';
  /** TEST_BUILD: roky SLUŽOBNÍKA (`useServantYears`); null = nikto z psov nemá „Spolu od“. */
  servantYears?: number | null;
  /** TEST_BUILD: odkaz do DOG ID, keď chýba „Spolu od“. */
  onDogId?: () => void;
  devotion: number;
  pilgrim: { level: LevelProgress; count: number; km: number; countries: number };
  study?: StudyStats;
  onStats?: () => void;
  onVault?: () => void;
  /** Ťuk na „Oddanosť · N ☥" vpravo hore = vysvetlenie, za čo sa ☥ dostáva. */
  onAbout?: () => void;
  /** Ťuk VEDĽA bloku ho zavrie (Matej 23. 10.). Prepínače bloku nesú `data-rank-toggle` — tie si
      ho otvárajú/zatvárajú samy, inak by ho ťuk zavrel a ten istý ťuk hneď znova otvoril. */
  onClose?: () => void;
  tx: (key: string, fallback: string) => string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!onClose) return;
    const down = (e: PointerEvent) => {
      const el = e.target as HTMLElement;
      if (boxRef.current?.contains(el) || el.closest('[data-rank-toggle], [role="dialog"]')) return;
      onClose();
    };
    document.addEventListener('pointerdown', down);
    return () => document.removeEventListener('pointerdown', down);
  }, [onClose]);
  const dev = devotionLevel(devotion);
  const vars = rankVars(kind, pilgrim.level.level, dev.index);
  const fmtN = (n: number) => Math.round(n).toLocaleString('sk-SK');
  // TEST_BUILD (25. 10. 2026): rozklik odznaku SLUŽOBNÍK / PÚTNIK — noc so zlatým lemom ako odznaky,
  // obsah v `rankBadge.tsx` (ServantPanel / PilgrimPanel). DEVOTION pyramída ostáva pre web.
  if (RANK_BADGE_ON && kind !== 'study') {
    const night = { '--rk-bg': 'radial-gradient(120% 100% at 0% 0%, #22306a 0%, #121a44 45%, #0a0d26 100%)', '--rk-edge': 'rgba(231,196,108,.7)', '--rk-ink': NIGHT_INK } as CSSProperties;
    const lv = pilgrim.level;
    return (
      <div className="me-rk" style={night} ref={boxRef}>
        <style>{RANK_PANEL_CSS}</style>
        {kind === 'dev'
          ? <ServantPanel years={servantYears ?? null} onDogId={onDogId} tx={tx} />
          : <PilgrimPanel level={lv.level} pct={lv.pct} points={lv.points} floor={lv.floorPoints} nextAt={lv.nextPoints}
              trips={pilgrim.count} km={pilgrim.km} countries={pilgrim.countries} onStats={onStats} tx={tx} />}
      </div>
    );
  }
  if (kind === 'study') {
    const st = study ?? { read: 0, total: 0, pct: 0, liked: 0, saved: 0 };
    return (
      <div className="me-rk" style={vars} ref={boxRef}>
        <div className="me-rk-hd">
          <span className="ic pt"><BrandIcon name="graduate" size={16} tint="dark" /></span>
          <div className="tx"><h3>{tx('pack.me.studying', 'Study')}</h3></div>
        </div>
        <hr className="me-rk-line" />
        <RankBar pct={st.pct} center={`${st.read} / ${st.total}`} next={<b>{st.pct} %</b>}
          label={tx('pack.rank.studyRead', '{n} of {total} scrolls read').replace('{n}', String(st.read)).replace('{total}', String(st.total))} />
        <div className="me-rk-nums">
          <div><b>{st.read}</b><span>{tx('pack.rank.scrolls', 'scrolls')}</span></div>
          <div><b>{st.liked}</b><span>{tx('pack.rank.liked', 'liked')}</span></div>
          <div><b>{st.saved}</b><span>{tx('pack.rank.saved', 'saved')}</span></div>
        </div>
        <button type="button" className="me-rk-link" onClick={onVault}>
          {tx('pack.rank.openVault', 'My knowledge in the VAULT')}<BrandIcon name="back" size={12} tint="white" style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>
    );
  }
  if (kind === 'dev') {
    const cur = DEVOTION_LEVELS[dev.index - 1];
    const span = dev.next ? dev.next.at - cur.at : 0;
    return (
      <div className="me-rk" style={vars} ref={boxRef}>
        <div className="me-rk-hd">
          <span className="ic"><b>{dev.index}</b></span>
          <div className="tx">
            <h3>{tx(`pack.ladder.${dev.key}`, dev.name)}</h3>
            <p className="me-rk-q">{tx(`pack.ladder.desc.${dev.key}`, devotionTier(dev.index).desc)}</p>
          </div>
          <button type="button" className="ab" onClick={onAbout} disabled={!onAbout} aria-label={tx('pack.dvinfo.title', 'How you earn devotion')}>
            <DevotionMark size={16} />{fmtN(devotion)}{onAbout && <BrandIcon name="question" size={12} tint="white" />}
          </button>
        </div>
        <hr className="me-rk-line" />
        {dev.next ? (
          <RankBar pct={dev.pct} center={`${fmtN(devotion - cur.at)} / ${fmtN(span)}`}
            label={tx('pack.rank.devToNext', '{n} to the {name} step').replace('{n}', fmtN(dev.toNext)).replace('{name}', tx(`pack.ladder.${dev.next.key}`, dev.next.name))}
            next={<><span className="g" style={devotionVars(dev.index + 1)}><b>{dev.index + 1}</b></span>{tx(`pack.ladder.${dev.next.key}`, dev.next.name)}</>} />
        ) : (
          <RankBar pct={100} center={tx('pack.rank.devTop', 'You stand at the top of the ladder.')} label={tx('pack.rank.devTop', 'You stand at the top of the ladder.')} />
        )}
        {/* PYRAMÍDA (Matej 24. 10. 2026 nad nákresom devotion-flow: 5B) — 22 vrstiev, Nováčik dole najširší,
            postavené vrstvy vo farbe svojho stupňa, moja vrstva s lemom, nad ňou tma, vrchol Faraón (zlato) a Polboh (slnko). */}
        <div className="me-rk-py" aria-label={tx('pack.rank.devPyramid', 'The pyramid of devotion')}>
          {DEVOTION_LEVELS.map((_, i) => i).reverse().map((i) => {
            const l = DEVOTION_LEVELS[i];
            const w = 100 - 78 * (i / (DEVOTION_LEVELS.length - 1));
            const pw = `${w}%`;   // šírka vrstvy pyramídy (nie progres)
            const cls = i + 1 === dev.index ? 'on' : i + 1 < dev.index ? 'done' : i === 20 ? 'gold' : i === 21 ? 'sun' : '';
            return (
              <span key={l.key} className={cls} style={{ width: pw, ...devotionVars(i + 1) }}>
                {i + 1}{(w > 44 || i + 1 === dev.index || i >= 20) && <> · {tx(`pack.ladder.${l.key}`, l.name)}</>}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
  const lv = pilgrim.level;
  return (
    <div className="me-rk" style={vars} ref={boxRef}>
      <div className="me-rk-hd">
        {/* Kotúč ikonky má výplň papyrusu (`--rk-fill` = T.card) ⇒ ikonka vždy tmavá. */}
        <span className="ic pt"><BrandIcon name="world-grid" size={16} tint="dark" /></span>
        <div className="tx"><h3>{tx('pack.map.rankPilgrim', 'Pilgrim')} {lv.level}</h3></div>
        <span className="ab">{fmtN(lv.points)} {tx('pack.rank.pts', 'pts')}</span>
      </div>
      <hr className="me-rk-line" />
      <RankBar pct={lv.pct} center={`${fmtN(lv.points - lv.floorPoints)} / ${fmtN(lv.nextPoints - lv.floorPoints)}`}
        label={tx('pack.tier.toNext', '{n} points to level {level}').replace('{n}', fmtN(lv.toNext)).replace('{level}', String(lv.level + 1))}
        next={<><BrandIcon name="world-grid" size={12} tint={inkIsLight(tierOfLevel(lv.level).ink) ? 'white' : 'dark'} />{tx('pack.map.rankPilgrim', 'Pilgrim')} {lv.level + 1}</>} />
      <div className="me-rk-nums">
        <div><b>{pilgrim.count}</b><span>{tx('pack.rank.trips', 'trips')}</span></div>
        <div><b>{pilgrim.km}</b><span>km</span></div>
        <div><b>{pilgrim.countries}</b><span>{tx('pack.rank.countries', 'countries')}</span></div>
      </div>
      {onStats && (
        <button type="button" className="me-rk-link" onClick={onStats}>
          {tx('pack.rank.openStats', 'Trip stats')}<BrandIcon name="back" size={12} tint={/^#[0-3]/.test(tierOfLevel(lv.level).ink) ? 'dark' : 'white'} style={{ transform: 'rotate(180deg)' }} />
        </button>
      )}
    </div>
  );
}

/** Vlajka národnosti do pravého rohu titulky (`MeCover right`). */
export function MeFlag({ code, label }: { code: string; label: string }) {
  return <img className="me-flag" src={flagUrl(countryISO2(code) || 'sk', 80)} alt={label} title={label} />;
}

/** Riadok psa v šuplíku (môj aj cudzí profil — vytiahnuté z PackMe 25. 10. 2026). Bio a povaha sú tie isté polia ako v DOG ID (`profile.dogs[id]`). */
export function MeDogRow({ dog, attrs, onClose, onDogId, tx }: {
  dog: PackDogFull;
  attrs: Partial<DogProfileAttrs> | undefined;
  onClose: () => void;
  /** Môj pes → úprava v DOG ID. Cudzí pes (`/pack/u/:id`) ho nemá: bez ceruzky a bez výzvy písať. */
  onDogId?: () => void;
  tx: (key: string, fallback: string) => string;
}) {
  const [flip, setFlip] = useState(false);
  const src = dog.cloudinary_main_url;
  const name = dog.dog_name ?? '';
  const num = dog.pack_number != null ? <span className="me-no">#{dog.pack_number}</span> : null;
  const bio = attrs?.bio?.trim();
  const tags = attrs?.tags?.temperament ?? [];
  return (
    <div className={`me-drow${flip ? ' flip' : ''}`}>
      <button type="button" className="me-dp" onClick={onClose} aria-label={tx('pack.me.closeDogs', 'Hide dogs')}>
        {src && <img src={sizedUrl(src, 200)} alt="" />}
        {num}
      </button>
      <button type="button" className="me-hg" onClick={() => setFlip((f) => !f)} aria-expanded={flip} aria-label={name}>
        <span className="fa">
          {dog.heroglyph_png_url ? <img src={dog.heroglyph_png_url} alt="" /> : <span className="empty">{name}</span>}
        </span>
        <span className="ba"><b>{name}</b>{num}</span>
      </button>
      <div className="me-dinfo">
          {bio ? <p>{bio}</p> : onDogId ? (
            <p className="none" onClick={onDogId}>{tx('pack.me.dogBioEmpty', 'No bio yet. Write it in DOG ID.')}</p>
          ) : <p className="none">{tx('pack.publicProfile.noBio', 'No bio yet.')}</p>}
          {tags.length > 0 && (
            <div className="me-strip">
              {tags.map((g) => <span key={g} className="pk-pill">{tx(`pack.dogTag.${g}`, g)}</span>)}
            </div>
          )}
          {/* Môj pes → úprava v DOG ID (Matej 23. 10.: „možnosť upraviť a klikom sa preniesť do /dogs"). */}
          {onDogId && (
            <button type="button" className="me-dedit" onClick={onDogId}>
              <BrandIcon name="pencil" size={12} tint="violet" />
              {tx('pack.me.editDog', 'Edit DOG ID')}
            </button>
          )}
      </div>
    </div>
  );
}
