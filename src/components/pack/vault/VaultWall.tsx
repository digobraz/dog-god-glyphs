// ════════════════════════════════════════════════════════════════════════════
// AINUBIS · ROVINA NÁSTENKA — MAKETA v2 (24. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Prvá podoba (ráno 24. 9.) sa Matejovi nepáčila a vrátil ju. Nákres
// `plany/nakres-nastenka-v2-2026-09-24.html`, nad ním vybral
// **A2 · B1 · C1 · D1 · E1 · F2 · G2**:
//
//   A2  🔴 SPODNÁ LIŠTA TU NIE JE, JE TU ŠÍPKA SPÄŤ. Koreň je MIESTO, nie
//       rovina: `/pack/ainubis` je piaty slot chrbtice, ale pristáva na VAULTE.
//       CHAT aj NÁSTENKA sú o krok hlbšie ⇒ jedno gesto von (lock §3).
//       Ruší to ranné A1 („lišta ostáva") — a s ním aj spor dvoch plusov.
//   B1  🔴 MRIEŽKA, NIE ČITATEĽSKÝ STĹPEC. Ráno som z nástenky spravil stĺpec
//       760 px (šírka článku) a zmizli tým tri karty vedľa seba, ktoré mal
//       nákres v5. Nástenka je NÁSTENKA: auto-fill minmax(360px) so STROPOM.
//   C1  nálepka sveta vpravo hore, kde bola zrušená pilulka typu.
//   D1  filtre = sedem svetov, tie isté ako v mozgu.
//   E1  tretia záložka KNIŽNICA — zoznam zdrojov + pridávanie za DEVOTION.
//   F2/G2 sú v `VaultChat.tsx`.
//
// 🔴 LEN V DEVE (`import.meta.env.DEV`). Naostro ostáva pilulka zamknutá.
//    [[feedback_rozostavanu_vec_stavaj_za_zamknute_dvere]]
//
// ⚠️ MOJE PRÍSPEVKY = TEN ISTÝ ZOZNAM, AKÝ MÁ CHAT (`DEMO_PENDING`). Lock §4.1:
//    objekt má jednu kartu, nech je kdekoľvek.
// ⚠️ ŠTVORICA HOVORÍ KITOM, NIE EMOJI — ako `StoryCard.tsx` (Matej 22. 9.).
// ⚠️ DEVOTION SA TU LEN SĽUBUJE, NEPRIPISUJE. Rebríček a kalkulačka sú vlastná
//    session (Matej 24. 9.: „rozoberieme"); `grant-devotion` sa nedotýka.
// ════════════════════════════════════════════════════════════════════════════
import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI, VEIL_CSS,
} from '@/components/pack/packTheme';
import {
  AINUBIS, AI_GLASS, AI_FOCUS, AI_RAIL, AI_RAIL_BEFORE, AI_RAIL_BLANK, AI_SPINE,
  AI_BREATHE_CSS, aiWorld,
} from '@/components/pack/ainubisSkin';
import {
  HandPaw, HandStar, HandForward, HandPlus, HandArrowLeft, HandSearch, HandAlert,
} from '@/components/pack/HandIcons';
import ainubisFace from '@/assets/ainubis-badge.png';
import { VAULT_WORLDS } from './worlds';
import { DEMO_WALL, shortOf, verdictParts, type WallPost, type SealKind } from './vaultWallDemo';
import { DEMO_PENDING } from './vaultChatDemo';
import {
  LIBRARY_SOURCES, VAULT_SOURCE_TOTALS, SOURCE_KINDS, SOURCE_GROUPS,
  SOURCES_CLAUSE, WEB_RESEARCH_EXISTS, consensusPct, hiddenNote, type VaultSource,
} from './vaultSources';

/* 🔴 STROP MRIEŽKY JE POVINNÝ (nákres v5, r. 707): bez neho vznikne na 27"
   piaty stĺpec s kartami po 300 px a z nástenky je tabuľka. */
const GRID_MIN = 360;
/* 🔴 STROP JE NA TRI STĹPCE, NIE NA ŠÍRKU OKNA (Matej 24. 9.: „prečo si dal
   4 stĺpce a nie 3?"). Predtým tu stálo 1560 podľa nákresu v5 — na 1440 z toho
   vyšli tri, ale na širšom monitore štvrtý: 1560 / (360+16) = 4,1.
   1240 = tri karty po ~403 px aj s medzerami, a štvrtá sa nezmestí ani na 27".
   ⚠️ TO ISTÉ ČÍSLO drží aj hlavička — centruje sa na šírku troch stĺpcov. */
const GRID_MAX = 1240;
/* Zoznamy (knižnica, moje príspevky) držia TÚ ISTÚ os ako mriežka aj hlavička.
   Prvý pokus ich mal na 900 a vyzeralo to rozladene: šípka späť stála na 100 px
   a prvá karta na 270. Riadok je kompaktný (meno, jeden riadok popisu), takže
   1240 sa nečíta ako tabuľka — a celá obrazovka stojí na jednej osi. */
const LIST_MAX = GRID_MAX;
/* Deväť na stranu = tri riadky po troch na PC (a deväť za sebou na mobile).
   Nekonečné rolovanie sa nekladie: nástenka nie je feed, človek sa na ňu vracia
   na to isté miesto a strana je jediné, čo sa dá zapamätať. */
const PER_PAGE = 9;

/** Meno tretej záložky. Matej 24. 9.: „možno by sme mohli použiť mozog namiesto
 *  zdroje?" — MOZOG je obsadený (pohľad MOZOG ⇄ DOGSCROLL vo VAULTE, plátno
 *  brainEngine.ts), takže by sa tak volali dve rôzne veci. KNIŽNICA hovorí,
 *  čo to je, a znesie aj 500 položiek. Je to jedna konštanta — prepnúť sa dá
 *  za sekundu. */
const LIBRARY = 'Library';

export const VAULT_WALL_CSS = `
${AI_BREATHE_CSS}
${VEIL_CSS}
/* ── ČO Z VAULTU V TEJTO ROVINE NIE JE ─────────────────────────────────────
   🔴 A2: mizne CELÝ horný pás aj mozog — nástenka má vlastnú hlavičku so
   šípkou. Spodnú lištu nevykresľuje PackAinubis (nie skrýva: navRef v nej
   publikuje --pack-nav-h a skrytá by appke tvrdila, že pod obsahom je 68 px). */
.akv-root[data-plane="wall"] .akv-brain,
.akv-root[data-plane="wall"] .akv-top,
.akv-root[data-plane="wall"] .akv-ctl,
.akv-root[data-plane="wall"] .akv-mactions{display:none;}
/* Guľa chatu nad lištou by na nástenke prekryla akcie karty. */
body:has(.akv-root[data-plane="wall"]) .ainubis-launcher{visibility:hidden;pointer-events:none;}

/* 🔴 STĹPEC MRIEŽKY SA MUSÍ POMENOVAŤ, INAK SA ROZTIAHNE NA MIN-CONTENT.
   Implicitný auto track má minimum min-content — a to je pri rolujúcich
   pásoch so zápornými okrajmi 886 px. Premerané 24. 9. na 390 px: .akw-list
   mala clientWidth 886 v 390 px okne, mriežka kariet si z toho vzala DVA
   stĺpce po 419 px a nástenka sa dala rolovať do strany.
   minmax(0,1fr) drží stĺpec na šírke okna a preteká až obsah, ktorý na to
   má vlastné overflow. */
.akw-root{position:absolute;z-index:3;inset:0;display:grid;
  grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);
  overflow:hidden;background:${AINUBIS.surfaceBase};}
/* ⚠️ Riadky mriežky priraďujem MENOM, nie poradím — presne tá pasca, ktorá
   v chate odviazala písacie pole od spodku (prvok s display:none z mriežky
   vypadne a zvyšné si posunú riadky). */
.akw-head{grid-row:1;}
.akw-list{grid-row:2;}

/* ── HLAVA ─────────────────────────────────────────────────────────────────
   Riadok 1 = šípka + meno roviny. Riadok 2 = záložky, deliaca čiara a svety. */
.akw-head{min-width:0;border-bottom:1px solid ${AINUBIS.edge};
  padding:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.md}px)
    ${PACK_SPACE.lg}px ${PACK_SPACE.md}px;}
/* Hlavička stojí na tej istej osi ako karty pod ňou (Matej 24. 9.:
   „header by som centroval na stred, na šírku 3 stĺpcov"). */
.akw-hin{max-width:${GRID_MAX}px;margin:0 auto;min-width:0;
  display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.akw-htop{display:flex;align-items:center;gap:${PACK_SPACE.md}px;}
.akw-back{width:32px;height:32px;flex:0 0 32px;display:flex;align-items:center;justify-content:center;
  border-radius:${PACK_R.pill}px;cursor:pointer;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.cyan};}
.akw-back:hover{border-color:${AINUBIS.edgeStrong};}
.akw-htop h1{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h2}px;line-height:1.1;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.ink};}
.akw-count{margin-left:auto;font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}

/* ── ZÁLOŽKY — TRI FARBY (Matej 24. 9.: „mali by sme rozlíšiť farebne") ─────
   Farba nie je ozdoba, hovorí ČÍ je ten obsah:
     SVORKA   cyan  — hlas appky, sem píšu ľudia
     MOJE     zlatá — moje veci a ich stav (čaká / v mozgu / zamietnuté je už zlaté)
     KNIŽNICA modrá — svit vaultu, tá istá farba ako nálepka sveta na karte
   ⚠️ Výber je TINT + LEM, nikdy plná plocha — tá patrí jedinému CTA (brand). */
/* 🔴 NA MOBILE SÚ TO DVA RIADKY. Tri záložky majú spolu ~360 px, čo je na 390 px
   celá šírka — v jednom rade so svetmi pretiekol pás z okna, potiahol so sebou
   celý koreň a mriežka kariet si z toho vzala TRI stĺpce mimo obrazovky.
   Deliaca čiara a jeden rad sú PC vec (Matej 24. 9.: „vedľa za deliacu čiaru
   (na PC)"), tak sú aj v kóde len tam. */
.akw-bar{display:flex;flex-direction:column;align-items:stretch;gap:${PACK_SPACE.md}px;min-width:0;}
/* Aj samotné záložky na 390 px rolujú — inak sa tretia oreže. */
.akw-tabs{display:flex;gap:${PACK_SPACE.sm}px;flex:0 0 auto;min-width:0;
  overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none;
  margin:0 -${PACK_SPACE.lg}px;padding:0 ${PACK_SPACE.lg}px;}
.akw-tabs::-webkit-scrollbar{display:none;}
.akw-tab{flex:0 0 auto;}
.akw-tab{padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  border:1px solid ${AINUBIS.edge};background:transparent;color:${AINUBIS.inkDim};white-space:nowrap;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.micro}px;line-height:15px;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;}
.akw-tab[data-t="pack"][aria-current="page"]{color:${AINUBIS.cyan};
  border-color:${AINUBIS.edgeStrong};background:rgba(${AINUBIS.cyanRGB},0.16);}
.akw-tab[data-t="mine"][aria-current="page"]{color:${AINUBIS.ctaA};
  border-color:${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};}
.akw-tab[data-t="lib"][aria-current="page"]{color:${AINUBIS.glow};
  border-color:${AINUBIS.glowEdge};background:${AINUBIS.glowTint};}
/* Deliaca čiara medzi „čo pozerám" a „podľa čoho filtrujem" — len na PC,
   kde stoja v jednom rade (Matej 24. 9.: „vedľa za deliacu čiaru (na PC)"). */
.akw-div{display:none;flex:0 0 auto;width:1px;align-self:stretch;background:${AINUBIS.edge};}
/* ── HĽADANIE NA NÁSTENKE (Matej 24. 9. 2026) ──────────────────────────────
   *„pri boarde dajme vyhľadávanie, podla názvu čo človek napíše"*.
   ⚠️ Písmo 16 px (PACK_TEXT.lead): pod ním iOS pri ťuknutí priblíži celú stránku.
      Tú istú poznámku nesie hľadanie vo VAULTE — je to tá istá pasca. */
/* 🔴 flex:1 1 220px SA NESMIE DAŤ PRIAMO DO STĹPCOVÉHO RADU. Trieda .akw-bar je na
   mobile flex-direction:column, takže základ 220 px platí pre VÝŠKU — pole
   narástlo na 450 px a vyzeralo ako chyba vykreslenia (premerané 390 px).
   Preto sú nástroje vo vlastnom riadku .akw-tools, ktorý je VŽDY row
   a zalamuje sa; v ňom už základ znamená šírku. */
.akw-tools{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;flex-wrap:wrap;min-width:0;
  flex:0 0 auto;width:100%;}
.akw-find{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;flex:1 1 200px;min-width:0;
  padding:0 ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;color:${AINUBIS.inkFaint};${AI_GLASS}}
.akw-find:focus-within{${AI_FOCUS}}
.akw-find input{flex:1 1 auto;min-width:0;background:transparent;border:0;outline:0;
  padding:${PACK_SPACE.sm}px 0;color:${AINUBIS.ink};font-family:${FONT_UI};font-size:${PACK_TEXT.lead}px;}
.akw-find input::placeholder{color:${AINUBIS.inkFaint};}
/* Natívny krížik prehliadača = holý znak mimo brandu (pole NOT IN THE BRAND). */
.akw-find input::-webkit-search-cancel-button{-webkit-appearance:none;display:none;}

/* Značka sporu — jediná vec, ktorá „kontroverzné" robí VIDITEĽNÝM aj bez
   triedenia. Bez nej by bola voľba v roletke tvrdením, ktoré sa nedá overiť. */
.akw-clash{display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;color:${AINUBIS.ctaA};}

/* ── SVETY = ROZBAĽOVAČ S VIACNÁSOBNÝM VÝBEROM (Matej 24. 9. 2026) ─────────
   Predtým rad siedmich pilulek cez celú šírku: na mobile sa rolovali do strany,
   na PC zabrali celý druhý pás a vybrať sa dal VŽDY LEN JEDEN svet. Sedem je
   strop (svet už nepribudne), takže zoznam sa zmestí do jedného panelu — a
   viacnásobný výber je to, čo človek naozaj chce („výživa AJ prevencia").
   ⚠️ Zvolené svety nesie POČÍTADLO na tlačidle, nie sedem pilulek vedľa seba.  */
.akw-wsel{position:relative;flex:0 0 auto;}
.akw-wbtn{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;cursor:pointer;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.edge};background:transparent;color:${AINUBIS.inkDim};
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;line-height:1.3;white-space:nowrap;}
.akw-wbtn:hover{border-color:${AINUBIS.edgeStrong};}
.akw-wbtn[aria-expanded="true"]{border-color:${AINUBIS.edgeStrong};color:${AINUBIS.cyan};}
.akw-wbtn u{text-decoration:none;display:inline-flex;align-items:center;justify-content:center;
  min-width:18px;height:18px;padding:0 ${PACK_SPACE.xs}px;border-radius:${PACK_R.pill}px;
  background:rgba(${AINUBIS.cyanRGB},0.16);color:${AINUBIS.cyan};
  font-size:${PACK_TEXT.micro}px;font-weight:600;}
.akw-wpanel{position:absolute;z-index:6;top:calc(100% + ${PACK_SPACE.sm}px);left:0;min-width:240px;
  border-radius:${PACK_R.card}px;padding:${PACK_SPACE.sm}px;${AI_GLASS}}
.akw-wrow{display:flex;align-items:center;gap:${PACK_SPACE.md}px;width:100%;cursor:pointer;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;border:1px solid transparent;
  background:transparent;color:${AINUBIS.inkDim};text-align:left;
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;line-height:1.3;}
.akw-wrow:hover{background:rgba(${AINUBIS.cyanRGB},0.08);}
.akw-wrow i{width:16px;height:16px;flex:0 0 16px;background:currentColor;}
.akw-wrow em{font-style:normal;margin-left:auto;font-size:${PACK_TEXT.micro}px;color:${AINUBIS.inkFaint};}
/* Zaškrtnutie = TINT a lem, nie plná plocha (plnú má jediné CTA). */
.akw-wrow[aria-checked="true"]{color:${AINUBIS.cyan};border-color:${AINUBIS.edgeStrong};
  background:rgba(${AINUBIS.cyanRGB},0.14);}
.akw-wclear{width:100%;margin-top:${PACK_SPACE.xs}px;padding:${PACK_SPACE.sm}px;cursor:pointer;
  border:0;border-top:1px solid ${AINUBIS.edge};background:transparent;color:${AINUBIS.inkFaint};
  font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.section.letterSpacing};
  text-transform:uppercase;}
.akw-wclear:hover{color:${AINUBIS.cyan};}

/* ── STRÁNKY ──────────────────────────────────────────────────────────────
   Matej 24. 9.: „kde budu nejake stranky". Deväť na stranu = tri riadky po
   troch na PC; nekonečné rolovanie sa nekladie, lebo nástenka nie je feed
   a človek sa na ňu vracia na to isté miesto. */
.akw-pages{display:flex;align-items:center;justify-content:center;gap:${PACK_SPACE.sm}px;
  margin-top:${PACK_SPACE.xl}px;}
.akw-pg{min-width:34px;height:34px;padding:0 ${PACK_SPACE.sm}px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.edge};background:transparent;color:${AINUBIS.inkDim};
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;}
.akw-pg:hover{border-color:${AINUBIS.edgeStrong};color:${AINUBIS.cyan};}
.akw-pg[aria-current="page"]{color:${AINUBIS.cyan};border-color:${AINUBIS.edgeStrong};
  background:rgba(${AINUBIS.cyanRGB},0.14);}
.akw-pg:disabled{opacity:0.35;cursor:default;}
.akw-worlds{display:flex;flex-wrap:nowrap;gap:${PACK_SPACE.sm}px;min-width:0;
  overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none;
  margin:0 -${PACK_SPACE.lg}px;padding:0 ${PACK_SPACE.lg}px;}
.akw-worlds::-webkit-scrollbar{display:none;}
/* 🔴 FILTRE SA NEZALAMUJÚ, ROLUJÚ. Osem chipov (všetko + 7 svetov) sa na 390 px
   zalomí do troch radov a hlavička zožerie polovicu obrazovky. */
.akw-wchip{flex:0 0 auto;display:flex;align-items:center;gap:${PACK_SPACE.xs}px;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  border:1px solid ${AINUBIS.edge};background:transparent;color:${AINUBIS.inkDim};
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;line-height:1.35;letter-spacing:0.02em;}
.akw-wchip i{width:14px;height:14px;flex:0 0 14px;background:currentColor;}
.akw-wchip[aria-pressed="true"]{color:${AINUBIS.glow};border-color:${AINUBIS.glowEdge};
  background:${AINUBIS.glowTint};}

.akw-list{min-height:0;min-width:0;overflow-y:auto;overscroll-behavior:contain;
  padding:${PACK_SPACE.lg}px ${PACK_SPACE.lg}px ${PACK_SPACE.xxl}px;}
.akw-in{max-width:${GRID_MAX}px;margin:0 auto;}

/* ── MRIEŽKA (B1) ──────────────────────────────────────────────────────────
   Presne to, čo mal nákres v5: karty vedľa seba, nie čitateľský stĺpec.
   Na 1440 px tri, na 27" štyri, na mobile jedna — počet je vec šírky, nie
   pevného čísla. align-items:start drží karty rôznej výšky pri hornej hrane. */
/* ⚠️ min(360px,100%), NIE holých 360 px. Na 390 px má stĺpec k dispozícii 358 —
   pevné dno 360 by kartu vytlačilo z okna a celá obrazovka by sa dala rolovať
   do strany (premerané 24. 9.: mriežka si vzala tri stĺpce mimo obrazovky). */
.akw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(${GRID_MIN}px,100%),1fr));
  gap:${PACK_SPACE.lg}px;align-items:start;}
/* Zoznamy (moje príspevky, knižnica) sú stĺpec — sú to RIADKY, nie karty. */
.akw-col{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;
  max-width:${LIST_MAX}px;margin:0 auto;}

/* PÍSANIE JE JEDINÉ CTA NA OBRAZOVKE — preto jediná plná plocha. */
.akw-new{align-self:flex-start;display:flex;align-items:center;gap:${PACK_SPACE.sm}px;cursor:pointer;border:0;
  margin-bottom:${PACK_SPACE.lg}px;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;border-radius:${PACK_R.field}px;
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.label}px;line-height:1;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;
  background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};box-shadow:${AINUBIS.ctaShadow};}
.akw-new:hover{background:${AINUBIS.ctaGradHover};}

/* ── KARTA PRÍSPEVKU ───────────────────────────────────────────────────────
   Jedna kresba pre nástenku, feed aj profil (lock §4.1). KARTA (r16). */
.akw-post{border-radius:${PACK_R.card}px;${AI_GLASS}
  overflow:hidden;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;
  padding:${PACK_SPACE.lg}px;}
.akw-phead{display:flex;align-items:center;gap:${PACK_SPACE.md}px;}

/* ── PLAGÁT (voľba B1, 24. 9. 2026) ────────────────────────────────────────
   🔴 KARTA NIE JE ČLÁNOK, JE POZVÁNKA NAŇ. Premerané pred zmenou: 592–1037
   znakov, 534–844 px, 7 tlačidiel ⇒ na obrazovku 1,2 karty. Matej: „board je
   bez nápadu len text a vela textu.. to zabíja potrebujeme to zjadnodušiť aby
   človek nebol paralyzovaný toľkým textom."
   Na nástenke ostáva len to, čo rozhodne, či kartu otvoríš: kto · čo sa deje ·
   verdikt jednou vetou · aká je odozva. Zvyšok žije v prekryve.
   🔴 CELÁ KARTA JE JEDINÉ TLAČIDLO — preto v plagáte NESMIE byť vnorené
   tlačidlo (button v buttone je neplatný HTML a klik by sa bil s kartou).
   Štvorica ❤🔖➕↗ je preto vnútri prekryvu, nie tu. */
.akw-post{text-align:left;font:inherit;color:inherit;cursor:pointer;
  transition:transform 140ms ease;}
/* ⚠️ Hover nesie IBA transform — box-shadow je jedna vlastnosť a prepísal by
   celý odliatok AI-SKLA aj s dosvitom sveta (tá istá pasca ako pri D-BLOKU). */
.akw-post:hover{transform:translateY(-2px);}
.akw-post:focus-visible{outline:2px solid ${AINUBIS.edgeStrong};outline-offset:2px;}
/* DVA RIADKY A DOSŤ — bez stropu sa karty rozídu do rôznych výšok a z mriežky
   je murivo. Rovnaká výška JE ten „uhladený" pocit, nie farba. */
/* Strop AJ dno: bez min-height je karta s jednoriadkovým verdiktom o 21 px
   nižšia (premerané 24. 9.: 202 vs. 223 px) a mriežka sa rozladí. Dva riadky
   vždy, aj keď je v nich text len na jeden. */
.akw-clamp{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
  min-height:3em;}
/* 🔴 ODPOVEĎ NA NÁSTENKE NIE JE (Matej 24. 9. 2026: „odpoveď ainubisa až na
   rozklik... nie hneď"). Karta povie len TO, ŽE odpovedal a z čoho — samotná
   veta sa otvorí spolu s príspevkom. Vstup má mať čo najmenej textu.
   ⚠️ Prúžok sa NERUŠÍ. Keby zmizol, karta by zatajila jedinú vec, ktorou sa
      nástenka líši od diskusného fóra: že na to niekto odpovedal zo zdrojov. */
.akw-said{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;
  font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;line-height:1.4;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akw-said b{color:${AINUBIS.cyan};font-weight:600;letter-spacing:0.02em;text-transform:none;
  font-size:${PACK_TEXT.label}px;}
.akw-ai.is-blank .akw-said b{color:${AINUBIS.ctaA};}
.akw-vd{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.5;color:${AINUBIS.ink};}
.akw-vd b{color:${AINUBIS.cyan};font-weight:600;}
.akw-ai.is-blank .akw-vd b{color:${AINUBIS.ctaA};}
/* Jeden riadok čísel namiesto troch radov tlačidiel. Je to ÚDAJ, nie akcia —
   akcie sú v prekryve, kde je na ne miesto. */
.akw-met{display:flex;align-items:center;gap:${PACK_SPACE.lg}px;margin-top:auto;
  font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;line-height:1.4;color:${AINUBIS.inkFaint};}
.akw-met s{text-decoration:none;display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;}
.akw-met s b{color:${AINUBIS.inkDim};font-weight:500;}
.akw-met s,.akw-met u{white-space:nowrap;}
.akw-met u{margin-left:auto;text-decoration:none;font-weight:600;color:${AINUBIS.cyan};
  display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;
  letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;}

/* ── PREKRYV KARTY (voľba E1) ──────────────────────────────────────────────
   Lock architektura-pack.md §4.2: akcia nikdy neodnesie človeka preč z miesta,
   kde je. Preto vrstva NAD nástenkou a nie vlastná stránka — mriežka ostáva za
   ňou a po zavretí si človek stojí presne tam, kde stál.
   Adresu nesie ?post=<id> (vlastná stránka by bola druhá kresba toho istého
   objektu, čo §4.1 zakazuje). */
/* 🔴 ZÁVOJ SI KOMPONENT NEKRESLÍ — je to ZÁVOJ z katalógu (.pk-veil--modal).
   Prvý pokus mal vlastné rgba(...) a rozmazanie; stráž check:pack ho zhodila
   a mala pravdu (216 miest so sklom a tromi rôznymi tmavosťami bol presne ten
   dôvod, prečo recept vznikol). Odtieň je AINUBISOV cez --pk-veil, tmavosť
   a rozmazanie sú z receptu. */
.akw-scrim{--pk-veil:rgba(3,7,12,0.72);
  align-items:flex-start;overflow-y:auto;overscroll-behavior:contain;}
.akw-sheet{position:relative;width:100%;max-width:720px;margin:auto;border-radius:${PACK_R.card}px;
  padding:${PACK_SPACE.lg}px;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
/* ⚠️ Zatváracie tlačidlo patrí DO karty, nie vedľa nej. Prvý pokus ho mal ako
   súrodenca v závoji a flex ho odsunul mimo — na 1440 px skončilo v pravom
   dolnom rohu okna. Vnútri karty má pevný roh bez ohľadu na šírku. */
.akw-x{position:absolute;top:${PACK_SPACE.md}px;right:${PACK_SPACE.md}px;
  width:32px;height:32px;display:flex;align-items:center;justify-content:center;
  border-radius:${PACK_R.pill}px;border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};
  color:${AINUBIS.cyan};cursor:pointer;z-index:1;}
.akw-x:hover{border-color:${AINUBIS.edgeStrong};}
/* Nálepka sveta by pod tlačidlom skončila — v prekryve jej urob miesto. */
.akw-sheet .akw-world{margin-right:${PACK_SPACE.xl}px;}
.akw-av{width:34px;height:34px;flex:0 0 34px;border-radius:${PACK_R.pill}px;
  display:flex;align-items:center;justify-content:center;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.faceBg};
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;line-height:1;color:${AINUBIS.cyan};}
.akw-who{min-width:0;}
.akw-who b{display:block;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.body}px;
  line-height:1.3;color:${AINUBIS.ink};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.akw-who em{display:block;font-style:normal;font-size:${PACK_TEXT.micro}px;line-height:1.4;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
/* 🔴 NÁLEPKA SVETA (C1) — vpravo hore, kde bola zrušená pilulka typu.
   MODRÁ je farba vaultu: nálepka hovorí „tento príspevok patrí do sveta X",
   a tá istá modrá svieti na záložke KNIŽNICA a na vybranom filtri. Druh
   (problém · skúsenosť) je ZLATÝ štítok dole — dve osi, dve farby. */
.akw-world{margin-left:auto;flex:0 0 auto;display:flex;align-items:center;gap:${PACK_SPACE.xs}px;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.glowEdge};background:${AINUBIS.glowTint};color:${AINUBIS.glow};
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;line-height:1.4;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;white-space:nowrap;}
.akw-world i{width:13px;height:13px;flex:0 0 13px;background:currentColor;}
.akw-ptxt{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.55;color:${AINUBIS.inkDim};}
.akw-tags{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.akw-tag{padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;line-height:1.4;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;
  border:1px solid ${AINUBIS.edge};color:${AINUBIS.inkFaint};}
.akw-tag.is-kind{border-color:${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};color:${AINUBIS.ctaA};}

/* ODPOVEĎ AINUBISA — SVETELNÝ RAIL, nie box v boxe (voľba C1, 24. 9. 2026).
   Predtým tu bol orámovaný blok vnútri karty a v ňom ďalší blok DO THIS: tri
   lemy na sebe, ktoré oko číta ako tri úradné dokumenty. Premerané na boarde:
   3 úrovne vnorenia. Rail povie „toto hovorí stroj" rovnako jasne a NEPRIDÁ
   úroveň — a ten istý rail nesie jeho hlas aj v chate, takže obe roviny konečne
   vyzerajú ako jeden prístroj. */
.akw-ai{${AI_RAIL}}
.akw-ai::before{${AI_RAIL_BEFORE}}
/* Keď mozog o téme nič nemá, rail zhasne do jeho zlatej — nie je to odpoveď,
   je to priznanie. Cyan by mu dal váhu znalosti, ktorú nemá. */
.akw-ai.is-blank::before{${AI_RAIL_BLANK}}
.akw-aihd{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.micro}px;line-height:1;
  letter-spacing:${PACK_HEAD.section.letterSpacing};color:${AINUBIS.inkFaint};}
/* MENO JE VŽDY AI + NUBIS — záporný margin vracia medzeru zjedenú rozstrelením. */
.akw-aihd i{font-style:normal;color:${AINUBIS.aiInk};text-shadow:${AINUBIS.aiShadow};margin-right:-0.22em;}
.akw-aiface{width:20px;height:20px;flex:0 0 20px;border-radius:${PACK_R.pill}px;object-fit:cover;}
.akw-aibody{margin:${PACK_SPACE.sm}px 0 0;font-size:${PACK_TEXT.body}px;line-height:1.55;color:${AINUBIS.inkDim};}
.akw-advice{margin-top:${PACK_SPACE.md}px;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid ${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};
  font-size:${PACK_TEXT.body}px;line-height:1.5;color:${AINUBIS.ink};}
.akw-advice b{display:block;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;line-height:1;
  letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${AINUBIS.ctaA};
  margin-bottom:${PACK_SPACE.sm}px;}
/* RIADOK „FROM" — jediné, čím sa toto líši od diskusného fóra, a zároveň
   vchod do knižnice. */
.akw-from{display:flex;align-items:center;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;
  margin-top:${PACK_SPACE.md}px;padding-top:${PACK_SPACE.md}px;border-top:1px solid ${AINUBIS.edge};
  font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;line-height:1.4;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}

.akw-from b{font-weight:500;letter-spacing:0.02em;text-transform:none;font-size:${PACK_TEXT.label}px;
  color:${AINUBIS.cyan};}
.akw-from button{margin-left:auto;display:flex;align-items:center;gap:${PACK_SPACE.xs}px;cursor:pointer;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.cyan};
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;line-height:1.2;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;}
.akw-from button:hover{border-color:${AINUBIS.edgeStrong};}
/* Kresba v kite je šípka DOĽAVA — vpravo za textom musí ukázať dopredu. */
.akw-from button .akw-chev{display:inline-flex;transform:rotate(180deg);}
/* ➕ POUŽIŤ — jediná akcia, ktorá na nástenke patrí LEN AINUBISOVI. */
.akw-use{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;margin-top:${PACK_SPACE.md}px;cursor:pointer;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.inkDim};
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;line-height:1.35;}
.akw-use:hover{border-color:${AINUBIS.edgeStrong};color:${AINUBIS.cyan};}

/* ── RADY OD ĽUDÍ + PEČAŤ ──────────────────────────────────────────────────
   🔴 BEZ PERCENT. Tri polohy, každá z tokenov ainubisSkin:
     sedí        → ok (zelená rozjasnená na tmavý podklad)
     nepozná     → tichý cyanový lem, žiadna farba stavu
     hovorí inak → jeho ZLATÁ, nie červená: červená v tomto šate znamená
                   BLOKOVANIE, a rozpor s vaultom nie je zákaz. */
.akw-reps{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.akw-rep{font-size:${PACK_TEXT.body}px;line-height:1.5;color:${AINUBIS.inkDim};}
.akw-rep b{color:${AINUBIS.ink};font-weight:500;}
.akw-seal{display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;margin-left:${PACK_SPACE.sm}px;
  padding:2px ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;cursor:default;
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;line-height:1.5;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;
  border:1px solid ${AINUBIS.edge};background:transparent;color:${AINUBIS.inkFaint};}
.akw-seal.is-fits{border-color:${AINUBIS.okEdge};background:${AINUBIS.okTint};color:${AINUBIS.ok};}
.akw-seal.is-differs{border-color:${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};color:${AINUBIS.ctaA};
  cursor:pointer;}
.akw-why{margin-top:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  border-radius:${PACK_R.tile}px;border:1px solid ${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};
  font-size:${PACK_TEXT.label}px;line-height:1.5;color:${AINUBIS.inkDim};}
.akw-more{display:flex;align-items:center;gap:${PACK_SPACE.xs}px;align-self:flex-start;
  padding:0;border:0;background:none;cursor:pointer;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;color:${AINUBIS.cyan};}
.akw-more .akw-chev{display:inline-flex;transform:rotate(180deg);}

/* ── ŠTVORICA + ODPOVEDAŤ ──────────────────────────────────────────────────
   🔴 Žiadna z nich neodnesie človeka preč z nástenky (lock §4.2). */
.akw-foot{display:flex;align-items:center;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;margin-top:auto;}
.akw-act{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;cursor:pointer;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.inkDim};
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;line-height:1.35;}
.akw-act:hover{border-color:${AINUBIS.edgeStrong};color:${AINUBIS.cyan};}
.akw-act.is-on{color:${AINUBIS.ctaA};border-color:${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};}
.akw-reply{margin-left:auto;}

/* ── MOJE PRÍSPEVKY ────────────────────────────────────────────────────────
   Ten istý zoznam, aký nesie chat (DEMO_PENDING). Stav je TINT + LEM. */
.akw-my{display:flex;gap:${PACK_SPACE.md}px;align-items:flex-start;padding:${PACK_SPACE.md}px;
  border-radius:${PACK_R.frame}px;border:1px solid ${AINUBIS.edge};background:rgba(3,7,12,0.35);}
.akw-kind{flex:0 0 auto;min-width:76px;text-align:center;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.edge};color:${AINUBIS.inkFaint};
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;line-height:1.4;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;}
.akw-mytx{min-width:0;flex:1 1 auto;}
.akw-my b{display:block;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.body}px;line-height:1.35;
  color:${AINUBIS.ink};}
.akw-my em{font-style:normal;display:block;margin-top:${PACK_SPACE.xs}px;font-size:${PACK_TEXT.label}px;
  line-height:1.45;color:${AINUBIS.inkFaint};}
.akw-myst{flex:0 0 auto;text-align:right;}
.akw-myst u{display:block;text-decoration:none;font-family:${FONT_UI};font-weight:600;
  font-size:${PACK_TEXT.micro}px;line-height:1.6;letter-spacing:${PACK_HEAD.card.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.ctaA};}
.akw-myst u.is-ok{color:${AINUBIS.ok};}
.akw-myst u.is-no{color:${AINUBIS.danger};}
.akw-myst i{font-style:normal;display:block;margin-top:${PACK_SPACE.xs}px;font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}

/* ── KNIŽNICA ──────────────────────────────────────────────────────────────
   Klauzula stojí HORE a nie je to drobné písmo v päte: je to prvá veta, ktorú
   človek na tejto obrazovke prečíta (Matej 24. 9.). */
/* ══ KNIŽNICA — FASÁDA (Matej 24. 9. 2026) ════════════════════════════════
   *„library si zaslúži urobiť krajšiu fasádu možno rozdeliť obrazovku na dve
   časti dať menej textu pridať knihy a hore cez ikonku hand writen dať
   vysvetlenie ako fungujeme"*.
   🔴 ZÁMER JE MENEJ TEXTU NA VSTUPE, VIAC AŽ PO KLIKU. Preto klauzula, legenda
   pruhu aj celé „ako fungujeme" zmizli z plochy a sedia za jednou ikonkou.
   Vstup je POLICA: vľavo kam idem, vpravo čo tam je. */
.akw-lib{display:grid;grid-template-columns:240px minmax(0,1fr);gap:${PACK_SPACE.xl}px;
  align-items:start;}
.akw-shelf{position:sticky;top:0;display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;}
.akw-sh{display:flex;align-items:center;gap:${PACK_SPACE.md}px;width:100%;cursor:pointer;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid transparent;background:transparent;color:${AINUBIS.inkDim};text-align:left;
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;line-height:1.3;}
.akw-sh:hover{background:rgba(${AINUBIS.cyanRGB},0.08);}
.akw-sh em{font-style:normal;margin-left:auto;font-size:${PACK_TEXT.micro}px;color:${AINUBIS.inkFaint};}
.akw-sh[aria-current="true"]{color:${AINUBIS.cyan};border-color:${AINUBIS.edgeStrong};
  background:rgba(${AINUBIS.cyanRGB},0.14);}
/* Ikonka „ako to funguje" — jediné miesto, kde na vstupe ostal text, a je to
   jedna veta. Zvyšok je za ňou. */
.akw-howbtn{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;width:100%;cursor:pointer;
  margin-bottom:${PACK_SPACE.md}px;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid ${AINUBIS.glowEdge};background:${AINUBIS.glowTint};color:${AINUBIS.inkDim};
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;line-height:1.35;text-align:left;}
.akw-howbtn:hover{border-color:${AINUBIS.edgeStrong};color:${AINUBIS.ink};}
.akw-howbtn i{width:22px;height:22px;flex:0 0 22px;background:currentColor;color:${AINUBIS.cyan};}
.akw-howsheet{width:100%;max-width:640px;margin:auto;border-radius:${PACK_R.card}px;
  padding:${PACK_SPACE.xl}px;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;position:relative;}
.akw-howsheet h2{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h2}px;
  line-height:1.2;letter-spacing:${PACK_HEAD.card.letterSpacing};color:${AINUBIS.ink};}
.akw-howsheet p{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.6;color:${AINUBIS.inkDim};}
.akw-howsheet p b{color:${AINUBIS.cyan};font-weight:500;}
.akw-howsheet .akw-leg{margin-top:${PACK_SPACE.md}px;padding-top:${PACK_SPACE.md}px;
  border-top:1px solid ${AINUBIS.edge};}
/* Kniha má CHRBÁT — polica sa dá čítať okom skôr než názvom. */
.akw-books{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr));
  gap:${PACK_SPACE.md}px;}
.akw-spine{width:34px;flex:0 0 34px;align-self:stretch;min-height:64px;border-radius:${PACK_R.tile}px;
  ${AI_SPINE}}
.akw-src.is-pending .akw-spine{background:repeating-linear-gradient(135deg,
  rgba(${AINUBIS.cyanRGB},0.10) 0 6px,transparent 6px 12px);}
@media (max-width:860px){
  .akw-lib{grid-template-columns:minmax(0,1fr);}
  .akw-shelf{position:static;flex-direction:row;flex-wrap:wrap;}
  .akw-sh{width:auto;}
}
.akw-clause{border-radius:${PACK_R.tile}px;border:1px solid ${AINUBIS.glowEdge};
  background:${AINUBIS.glowTint};padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;
  font-size:${PACK_TEXT.label}px;line-height:1.55;color:${AINUBIS.inkDim};}
/* NADPIS SKUPINY — tichý eyebrow, nie druhá hlavička obrazovky. */
.akw-grp{margin:${PACK_SPACE.lg}px 0 0;font-family:${FONT_UI};font-weight:500;
  font-size:${PACK_TEXT.micro}px;line-height:1;letter-spacing:${PACK_HEAD.label.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akw-grp:first-of-type{margin-top:0;}
.akw-gempty{font-size:${PACK_TEXT.label}px;line-height:1.5;color:${AINUBIS.inkFaint};
  padding:${PACK_SPACE.sm}px 0;}
/* LEGENDA PRUHU — bez nej je trojfarebná čiara ozdoba. Stojí RAZ, nad zoznamom. */
.akw-leg{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.lg}px;font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akw-leg span{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;}
.akw-leg u{width:14px;height:4px;border-radius:${PACK_R.pill}px;text-decoration:none;}
.akw-src{border-radius:${PACK_R.frame}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;${AI_GLASS}}
/* ⚠️ Čerstvo pridaný zdroj bol do 24. 9. odlíšený PRERUŠOVANÝM LEMOM. S AI-SKLOM
   to nejde: lem je gradient cez border-box a border-style:dashed by ho rozsekal
   na čiarky aj s dosvitom. Rozdiel preto nesie PRIESVITNOSŤ — zdroj, ktorý ešte
   neprešiel, je na polici bledší a jeho chrbát je šrafovaný. */
.akw-src.is-pending{opacity:0.62;}
/* ⚠️ Hlavička karty zdroja MUSÍ vedieť zalomiť. Prvý pokus mal chrbát, text
   a odznak „original" v jednom neprelamovateľnom rade a názov sa lámal po
   jednom slove na riadok („Feeding / Dogs: Dry / or Raw?"). Odznak ide na
   vlastný riadok skôr, než sa rozseká meno knihy. */
.akw-srchd{display:flex;align-items:flex-start;gap:${PACK_SPACE.md}px;flex-wrap:wrap;}
.akw-srchd > div{flex:1 1 180px;min-width:0;}
.akw-src h2{margin:0;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.body}px;line-height:1.35;
  color:${AINUBIS.ink};}
.akw-src.is-pending h2{color:${AINUBIS.inkFaint};}
.akw-au{margin:${PACK_SPACE.xs}px 0 0;font-size:${PACK_TEXT.label}px;line-height:1.45;color:${AINUBIS.inkFaint};}
/* O ČOM TO JE — jedna veta pod menom. Bez nej je zoznam kníh zoznam titulov. */
.akw-about{margin:${PACK_SPACE.sm}px 0 0;font-size:${PACK_TEXT.body}px;line-height:1.5;
  color:${AINUBIS.inkDim};}
/* HÁČIK — až po rozkliknutí. Zlatý, lebo je to výhrada, nie fakt o knihe. */
.akw-caveat{margin:${PACK_SPACE.md}px 0 0;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid ${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};
  font-size:${PACK_TEXT.label}px;line-height:1.55;color:${AINUBIS.inkDim};}
.akw-caveat b{display:block;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;
  line-height:1;letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;
  color:${AINUBIS.ctaA};margin-bottom:${PACK_SPACE.sm}px;}
.akw-open{display:flex;align-items:center;gap:${PACK_SPACE.xs}px;margin-top:${PACK_SPACE.sm}px;
  padding:0;border:0;background:none;cursor:pointer;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;color:${AINUBIS.cyan};}
.akw-open .akw-chev{display:inline-flex;transform:rotate(-90deg);}
.akw-open[aria-expanded="true"] .akw-chev{transform:rotate(90deg);}
/* Päta zoznamu — veta o zdroji, ktorý v ňom nie je. */
.akw-foot-note{font-size:${PACK_TEXT.label}px;line-height:1.55;color:${AINUBIS.inkFaint};}
/* ODKAZ NA ORIGINÁL — klauzula hovorí „autori urobili prácu, my na ňu ukazujeme",
   toto je to ukázanie. ⚠️ Affiliate ešte neexistuje (Matej: „doladíme, vyrobíme
   si affiliate"), takže tlačidlo je ZATIAĽ MŔTVE a povie to — mŕtvy odkaz, ktorý
   vyzerá živo, je horší než žiadny. */
.akw-buy{flex:0 0 auto;margin-left:auto;order:3;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  border:1px dashed ${AINUBIS.edge};background:transparent;color:${AINUBIS.inkFaint};cursor:default;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;line-height:1.4;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;white-space:nowrap;}
/* 🔴 PRUH ROZSUDKU — konsenzus · tradícia · autorský postoj. Merané z korpusu
   (pole status na každom zvitku), nie vymyslené skóre. Je to ÚDAJ, takže
   nesie tri farby, nie jednu: zelená = zhoda odboru, modrá = tradícia,
   zlatá = autor si to myslí a nesie k tomu protiváhu. */
.akw-split{display:flex;height:4px;border-radius:${PACK_R.pill}px;overflow:hidden;
  margin:${PACK_SPACE.md}px 0 ${PACK_SPACE.sm}px;background:rgba(${AINUBIS.cyanRGB},0.12);}
.akw-split i{display:block;height:100%;}
.akw-split i.c{background:${AINUBIS.ok};}
.akw-split i.t{background:${AINUBIS.glow};}
.akw-split i.a{background:${AINUBIS.ctaA};}
.akw-mt{display:flex;flex-wrap:wrap;align-items:center;gap:${PACK_SPACE.md}px;font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akw-mt b{color:${AINUBIS.cyan};font-weight:500;}
.akw-mt s{text-decoration:none;color:${AINUBIS.ok};}
.akw-devo{margin-left:auto;display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;
  padding:2px ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};color:${AINUBIS.ctaA};
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;line-height:1.5;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;}
/* PRÁZDNY RIADOK — zdroj, ktorý NEEXISTUJE. Nie nula medzi číslami. */
.akw-none{border-radius:${PACK_R.frame}px;border:1px dashed ${AINUBIS.edge};background:transparent;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;color:${AINUBIS.inkFaint};}
.akw-none h2{margin:0;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.body}px;line-height:1.35;
  color:${AINUBIS.inkFaint};}
.akw-none p{margin:${PACK_SPACE.xs}px 0 0;font-size:${PACK_TEXT.label}px;line-height:1.45;}
/* PONUKA DRUHOV ZDROJA — otvorí ju zlaté CTA. */
.akw-kinds{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;margin-bottom:${PACK_SPACE.lg}px;}
.akw-kbtn{display:flex;flex-direction:column;gap:2px;align-items:flex-start;cursor:pointer;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.inkDim};text-align:left;}
.akw-kbtn:hover{border-color:${AINUBIS.edgeStrong};}
.akw-kbtn b{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.label}px;line-height:1.3;
  color:${AINUBIS.ink};}
.akw-kbtn em{font-style:normal;font-size:${PACK_TEXT.micro}px;line-height:1.4;color:${AINUBIS.inkFaint};}
.akw-kbtn u{text-decoration:none;margin-top:2px;font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.ctaA};}

/* Priznanie, že je to maketa. Stojí hneď hore — nie v päte, kam sa nescrolluje. */
.akw-mock{border-radius:${PACK_R.tile}px;border:1px dashed ${AINUBIS.edge};background:${AINUBIS.raised};
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;font-size:${PACK_TEXT.label}px;line-height:1.5;
  color:${AINUBIS.inkFaint};margin-bottom:${PACK_SPACE.lg}px;}
.akw-mock b{color:${AINUBIS.cyan};font-weight:600;}

@media (min-width:1024px){
  .akw-head{padding:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.xl}px)
    ${PACK_SPACE.xxl}px ${PACK_SPACE.md}px;}
  .akw-list{padding:${PACK_SPACE.xl}px ${PACK_SPACE.xxl}px ${PACK_SPACE.xxl}px;}
  /* Záložky a svety stoja v JEDNOM rade, oddelené čiarou (Matej 24. 9.). */
  .akw-bar{flex-direction:row;align-items:center;}
  /* Až TU smie mať riadok nástrojov pružný základ — v rade je to šírka.
     Nad tým istým pravidlom v stĺpci by to bola výška (viď .akw-find). */
  .akw-tools{flex:1 1 240px;width:auto;}
  .akw-tabs,.akw-worlds{margin:0;padding:0;overflow:visible;}
  .akw-worlds{overflow-x:auto;}
  .akw-div{display:block;}
}
`;

const SEAL_TEXT: Record<SealKind, string> = {
  fits: 'fits the vault',
  unknown: 'the vault doesn’t know this',
  differs: 'the vault says otherwise',
};

const chev = <span className="akw-chev" aria-hidden><HandArrowLeft size={12} /></span>;
const mask = (ic: string) => ({
  WebkitMaskImage: `url(/icons/pack/${ic}.svg)`, maskImage: `url(/icons/pack/${ic}.svg)`,
  WebkitMaskSize: 'contain', maskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center', maskPosition: 'center',
});
const worldOf = (key: string) => VAULT_WORLDS.find((w) => w.key === key);

/** Koľko hlasov je pod príspevkom — vypísané aj na karte. */
const talk = (p: WallPost) => p.replies.length + p.moreReplies;
/**
 * 🔴 „KONTROVERZNÉ" NIE JE NÁLADA, JE TO MERANÝ SPOR: aspoň jedna odpoveď svorky,
 * pri ktorej vault hovorí NIEČO INÉ (`seal === 'differs'`). Nevymýšľam skóre
 * z packiek ani z počtu odpovedí — tie merajú záujem, nie nezhodu.
 */
const clash = (p: WallPost) => p.replies.some((r) => r.seal === 'differs');

/** Čo sa prehľadáva. Kto · pes · otázka (plná aj skrátená) · štítky · svet. */
const haystack = (p: WallPost) => [
  p.who, p.dog, p.text, p.short ?? '', p.tags.join(' '), worldOf(p.world)?.en ?? '',
].join(' ').toLowerCase();

type SortKey = 'new' | 'talk' | 'clash' | 'paws';
/** ⚠️ Poradie „najnovšie" = poradie v poli. Demo dáta nemajú dátum a vymyslený
 *  by bol horší než žiadny — naostro sem príde `created_at`. */
const SORTS: Record<SortKey, { label: string; hint: string; cmp: (a: WallPost, b: WallPost) => number }> = {
  new: { label: 'Newest', hint: 'as they came in', cmp: () => 0 },
  talk: { label: 'Most discussed', hint: 'by replies', cmp: (a, b) => talk(b) - talk(a) },
  clash: {
    label: 'Controversial', hint: 'the vault says otherwise',
    cmp: (a, b) => Number(clash(b)) - Number(clash(a)) || talk(b) - talk(a),
  },
  paws: { label: 'Most paws', hint: 'by paws', cmp: (a, b) => b.paws - a.paws },
};

/** Hlavička karty — tá istá v plagáte aj v prekryve (lock §4.1: objekt má
 *  jednu kartu, nech je kdekoľvek). */
function PostHead({ post }: { post: WallPost }) {
  const w = worldOf(post.world);
  return (
    <div className="akw-phead">
      <span className="akw-av" aria-hidden>{post.initial}</span>
      <span className="akw-who"><b>{post.who}</b><em>{post.dog}</em></span>
      {w && <span className="akw-world"><i aria-hidden style={mask(w.ic)} />{w.en}</span>}
    </div>
  );
}

/** PLAGÁT — čo je na nástenke. Celá karta je jedno tlačidlo. */
function Post({ post, onOpen }: { post: WallPost; onOpen: () => void }) {
  return (
    <button type="button" className="akw-post" style={aiWorld(post.world)} onClick={onOpen}>
      <PostHead post={post} />
      <p className="akw-ptxt akw-clamp">{shortOf(post)}</p>
      <div className={`akw-ai${post.ai.blank ? ' is-blank' : ''}`}>
        <div className="akw-said">
          <img className="akw-aiface ai-breathe-face" src={ainubisFace} alt="" aria-hidden />
          {post.ai.blank
            ? <span><b>AINUBIS</b> · nothing written here yet</span>
            : <span><b>AINUBIS</b> answered · from {post.ai.scrolls} scrolls</span>}
        </div>
      </div>
      <div className="akw-met">
        <s><HandPaw size={13} /><b>{post.paws}</b></s>
        {/* ⚠️ IKONKA ODPOVEDE V KITE NIE JE — podľa brand locku je to dôvod vypýtať
            si kresbu od Mateja, nie siahnuť po lucide alebo emoji. Kým nie je,
            stojí tu holé slovo. 🚩 NA MATEJA. */}
        <s><b>{talk(post)}</b> replies</s>
        {clash(post) && (
          <s className="akw-clash" title="The vault says otherwise">
            <HandAlert size={13} />disputed
          </s>
        )}
        <u>open{chev}</u>
      </div>
    </button>
  );
}

/** PREKRYV — celý príspevok. To, čo tu je, na nástenke ZÁMERNE nie je. */
function PostFull({ post, onLibrary, onClose }: {
  post: WallPost; onLibrary: () => void; onClose: () => void;
}) {
  const [paw, setPaw] = useState(false);
  const [saved, setSaved] = useState(false);
  const [why, setWhy] = useState<number | null>(null);
  return (
    <article className="akw-post akw-sheet" style={aiWorld(post.world)}>
      <button type="button" className="akw-x" aria-label="Close" onClick={onClose}>
        <HandArrowLeft size={15} />
      </button>
      <PostHead post={post} />
      <p className="akw-ptxt">{post.text}</p>
      <div className="akw-tags">
        {post.tags.map((tag, i) => (
          <span key={tag} className={`akw-tag${i === 0 ? ' is-kind' : ''}`}>{tag}</span>
        ))}
      </div>

      <div className={`akw-ai${post.ai.blank ? ' is-blank' : ''}`}>
        <div className="akw-aihd">
          <img className="akw-aiface ai-breathe-face" src={ainubisFace} alt="" aria-hidden />
          <span><i>AI</i>NUBIS answered first</span>
        </div>
        <p className="akw-aibody">{post.ai.body}</p>
        {post.ai.advice && <div className="akw-advice"><b>Do this</b>{post.ai.advice}</div>}
        <div className="akw-from">
          {post.ai.blank ? (
            <span>from nothing — {post.ai.world.toLowerCase()} is not written yet</span>
          ) : (
            <>
              <span>from</span>
              <b>{post.ai.scrolls} scrolls · {post.ai.world} › {post.ai.circle}</b>
            </>
          )}
          <button type="button" onClick={onLibrary}>where this comes from{chev}</button>
        </div>
        {!post.ai.blank && (
          <button type="button" className="akw-use">
            <HandPlus size={14} />Write into DOG ID
          </button>
        )}
      </div>

      <div className="akw-reps">
        {post.replies.map((r, i) => (
          <div className="akw-rep" key={r.who}>
            <b>{r.who}:</b> {r.text}
            <span
              className={`akw-seal is-${r.seal}`}
              role={r.why ? 'button' : undefined}
              tabIndex={r.why ? 0 : undefined}
              onClick={r.why ? () => setWhy((v) => (v === i ? null : i)) : undefined}
              onKeyDown={r.why ? (e) => { if (e.key === 'Enter' || e.key === ' ') setWhy((v) => (v === i ? null : i)); } : undefined}
            >
              {SEAL_TEXT[r.seal]}
            </span>
            {r.why && why === i && <div className="akw-why">{r.why}</div>}
          </div>
        ))}
        <button type="button" className="akw-more">
          {post.moreReplies} more replies from the pack{chev}
        </button>
      </div>

      {/* ŠTVORICA — packa nahrádza srdce (v DOGYPTe sa hodnotí packami),
          hviezdička ukladá radu do AINUBISA, šípka ju pošle do správy. */}
      <div className="akw-foot">
        <button type="button" className={`akw-act${paw ? ' is-on' : ''}`} onClick={() => setPaw((v) => !v)}
          aria-label="Paws">
          <HandPaw size={14} /><b>{post.paws + (paw ? 1 : 0)}</b>
        </button>
        <button type="button" className={`akw-act${saved ? ' is-on' : ''}`} onClick={() => setSaved((v) => !v)}
          aria-label="Save"><HandStar size={14} /></button>
        <button type="button" className="akw-act" aria-label="Send"><HandForward size={14} /></button>
        <button type="button" className="akw-act akw-reply">Reply</button>
      </div>
    </article>
  );
}

function SourceCard({ s }: { s: VaultSource }) {
  const [open, setOpen] = useState(false);
  const pct = consensusPct(s);
  const all = s.split.consensus + s.split.traditional + s.split.author;
  const seg = (n: number) => (all > 0 ? `${(n / all) * 100}%` : '0%');
  /* Riadok pod menom: autor · rok · STRANY · rozsah · druh. Strany sú tie
     nášho dokumentu, nie tlačeného vydania — viď poznámku pri `pages`. */
  const meta = [s.author, s.year, s.pages ? `${s.pages} pp` : null, s.extent, s.kind]
    .filter(Boolean).join(' · ');
  return (
    <article className={`akw-src${s.pending ? ' is-pending' : ''}`}>
      <div className="akw-srchd">
        {/* CHRBÁT — kniha má na polici tvar, nie len riadok textu. Pri zdroji,
            ktorý ešte čaká na posúdenie, je šrafovaný: miesto na polici, ale
            zatiaľ prázdne. */}
        <span className="akw-spine" aria-hidden />
        <div style={{ minWidth: 0 }}>
          <h2>{s.title}</h2>
          <p className="akw-au">{meta}</p>
        </div>
        {/* Odkaz na originál patrí len tomu, čo sa dá kúpiť — vlastný text ani
            slovenské skriptá sa na Amazone nedajú objednať. */}
        {!s.pending && s.kind === 'book' && <span className="akw-buy">original · link soon</span>}
      </div>

      <p className="akw-about">{s.about}</p>

      {s.pending ? (
        <div className="akw-mt" style={{ marginTop: PACK_SPACE.md }}>
          <span>added by {s.addedBy}</span>
          <span>waiting {s.waiting} days</span>
          {s.devotion != null && <span className="akw-devo">+{s.devotion} devotion when it passes</span>}
        </div>
      ) : (
        <>
          <div className="akw-split" aria-hidden>
            <i className="c" style={{ width: seg(s.split.consensus) }} />
            <i className="t" style={{ width: seg(s.split.traditional) }} />
            <i className="a" style={{ width: seg(s.split.author) }} />
          </div>
          <div className="akw-mt">
            <span><b>{s.scrolls}</b> scrolls</span>
            {pct != null && <span><s>{pct} %</s> settled</span>}
            <span>{s.tags.join(' · ')}</span>
            {s.addedBy && <span>added by {s.addedBy}</span>}
          </div>
          {/* 🔴 HÁČIK AŽ PO ROZKLIKNUTÍ. Na karte by z každého zdroja spravil
              podozrivého; za klikom je to, čo si človek pred kúpou chce prečítať. */}
          {s.caveat && (
            <>
              <button type="button" className="akw-open" aria-expanded={open}
                onClick={() => setOpen((v) => !v)}>
                {open ? 'Less' : 'What we take from it'}{chev}
              </button>
              {open && <div className="akw-caveat"><b>The catch</b>{s.caveat}</div>}
            </>
          )}
        </>
      )}
    </article>
  );
}

export function VaultWall({ onBack, tab, onTab, post, onPost }: {
  /** Jedno gesto von (A2) — vracia na rovinu VAULT, tak ako šípka v chate. */
  onBack: () => void;
  tab: 'pack' | 'mine' | 'lib';
  onTab: (t: 'pack' | 'mine' | 'lib') => void;
  /** 🔴 OTVORENÁ KARTA ŽIJE V ADRESE (`?post=<id>`), rovnako ako rovina a
   *  záložka. Vlastní ju `PackAinubis`, aby bolo jedno miesto, ktoré rozhoduje
   *  o adrese — a aby sa dal odkaz poslať. */
  post: string | null;
  onPost: (id: string | null) => void;
}) {
  /** Filter je VRSTVA nad tým istým obsahom, nie ďalšia záložka (lock §1.3). */
  /* Filter je VRSTVA nad tým istým obsahom (lock §1.3) — a od 24. 9. 2026 znesie
     VIAC svetov naraz. Prázdna množina = všetko, nie „nič". */
  const [worlds, setWorlds] = useState<Set<string>>(new Set());
  const [wopen, setWopen] = useState(false);
  const [kinds, setKinds] = useState(false);
  /* Polica: null = všetky. Vľavo sa ňou len preskakuje, obsah je ten istý. */
  const [shelf, setShelf] = useState<string | null>(null);
  const [how, setHow] = useState(false);
  const [page, setPage] = useState(0);
  const [find, setFind] = useState('');
  const [sort, setSort] = useState<SortKey>('new');
  const [sopen, setSopen] = useState(false);
  const q = find.trim().toLowerCase();
  const posts = useMemo(() => {
    let out = worlds.size ? DEMO_WALL.filter((p) => worlds.has(p.world)) : DEMO_WALL.slice();
    if (q) out = out.filter((p) => haystack(p).includes(q));
    /* ⚠️ Triedi sa KÓPIA. `DEMO_WALL.sort()` by prehádzal samotné pole a poradie
       „najnovšie" (= poradie vloženia) by sa po prvom triedení už nikdy nevrátilo. */
    return [...out].sort(SORTS[sort].cmp);
  }, [worlds, q, sort]);
  const pages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  /* ⚠️ Strana sa musí vrátiť na prvú, keď sa zmení filter — inak človek pristane
     na strane 3 zoznamu, ktorý má odteraz jednu. */
  const pageSafe = Math.min(page, pages - 1);
  const shown = posts.slice(pageSafe * PER_PAGE, pageSafe * PER_PAGE + PER_PAGE);
  const toggleWorld = (k: string) => {
    setWorlds((v) => { const n = new Set(v); if (n.has(k)) n.delete(k); else n.add(k); return n; });
    setPage(0);
  };
  /* Zavrieť roletku klikom mimo nej — inak ostane visieť nad obsahom. */
  useEffect(() => {
    if (!wopen && !sopen) return undefined;
    const away = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('.akw-wsel')) { setWopen(false); setSopen(false); }
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [wopen, sopen]);

  /* ⚠️ Zavrieť sa musí dať aj klávesnicou — prekryv, z ktorého sa nedá vyjsť
     Escapom, je pasca pre každého, kto nemá myš. */
  const open = post ? DEMO_WALL.find((p) => p.id === post) ?? null : null;
  useEffect(() => {
    if (!open) return undefined;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onPost(null); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, onPost]);

  return (
    <section className="akw-root" aria-label="Board">
      <header className="akw-head">
        <div className="akw-hin">
        <div className="akw-htop">
          <button type="button" className="akw-back" onClick={onBack} aria-label="Back">
            <HandArrowLeft size={14} />
          </button>
          <h1>Board</h1>
          {tab === 'lib' && (
            <span className="akw-count">
              {VAULT_SOURCE_TOTALS.documents} documents · {VAULT_SOURCE_TOTALS.scrolls} scrolls
            </span>
          )}
        </div>
        <div className="akw-bar">
          <div className="akw-tabs">
            <button type="button" className="akw-tab" data-t="pack" aria-current={tab === 'pack' ? 'page' : undefined}
              onClick={() => onTab('pack')}>The pack</button>
            <button type="button" className="akw-tab" data-t="mine" aria-current={tab === 'mine' ? 'page' : undefined}
              onClick={() => onTab('mine')}>My posts</button>
            <button type="button" className="akw-tab" data-t="lib" aria-current={tab === 'lib' ? 'page' : undefined}
              onClick={() => onTab('lib')}>{LIBRARY}</button>
          </div>
          {/* Svety filtrujú len nástenku svorky — v mojich príspevkoch a v knižnici
              by filtrovali zoznam, ktorý svety nemá. */}
          {tab === 'pack' && (
            <>
              <span className="akw-div" aria-hidden />
              <div className="akw-tools">
              <label className="akw-find">
                <HandSearch size={15} />
                <input type="search" value={find} placeholder="Search the board…"
                  aria-label="Search the board"
                  onChange={(e) => { setFind(e.target.value); setPage(0); }} />
              </label>
              {/* TRIEDENIE — jedna voľba, nie viac; preto tie isté triedy ako
                  svety, ale `role="radio"`. */}
              <div className="akw-wsel">
                <button type="button" className="akw-wbtn" aria-expanded={sopen}
                  onClick={() => setSopen((v) => !v)}>
                  {SORTS[sort].label}{chev}
                </button>
                {sopen && (
                  <div className="akw-wpanel" role="radiogroup" aria-label="Sort">
                    {(Object.keys(SORTS) as SortKey[]).map((k) => (
                      <button key={k} type="button" className="akw-wrow" role="radio"
                        aria-checked={sort === k}
                        onClick={() => { setSort(k); setPage(0); setSopen(false); }}>
                        {SORTS[k].label}<em>{SORTS[k].hint}</em>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="akw-wsel">
                <button type="button" className="akw-wbtn" aria-expanded={wopen}
                  onClick={() => setWopen((v) => !v)}>
                  {worlds.size ? 'Worlds' : 'All worlds'}
                  {worlds.size > 0 && <u>{worlds.size}</u>}
                  {chev}
                </button>
                {wopen && (
                  <div className="akw-wpanel" role="group" aria-label="Worlds">
                    {VAULT_WORLDS.map((w) => (
                      <button key={w.key} type="button" className="akw-wrow" role="checkbox"
                        aria-checked={worlds.has(w.key)} onClick={() => toggleWorld(w.key)}>
                        <i aria-hidden style={mask(w.ic)} />{w.en}
                        <em>{DEMO_WALL.filter((p) => p.world === w.key).length}</em>
                      </button>
                    ))}
                    <button type="button" className="akw-wclear"
                      onClick={() => { setWorlds(new Set()); setPage(0); }}>show everything</button>
                  </div>
                )}
              </div>
              </div>
            </>
          )}
        </div>
        </div>
      </header>

      <div className="akw-list">
        <div className="akw-in">
          {tab === 'pack' && (
            <>
              {/* ⚠️ Vysvetlivka „Mock-up. Four posts, written by hand…" ODSTRÁNENÁ
                  24. 9. 2026. Matej: „toto je čo? relevantne pre zakaznika? asi nie".
                  Bola to poznámka pre nás o tom, že obsah je ručný — člen ju číta
                  ako priznanie, že appka je atrapa. Čo je maketa, patrí do kódu
                  a do nákresu, nie na obrazovku. */}
              <button type="button" className="akw-new"><HandPlus size={14} />Share an experience or a problem</button>
              <div className="akw-grid">
                {shown.map((p) => <Post key={p.id} post={p} onOpen={() => onPost(p.id)} />)}
              </div>
              {posts.length === 0 && (
                <p className="akw-gempty">
                  {q ? `Nothing matches “${find.trim()}”.` : 'Nothing in these worlds yet.'}
                </p>
              )}
              {pages > 1 && (
                <nav className="akw-pages" aria-label="Pages">
                  <button type="button" className="akw-pg" disabled={pageSafe === 0}
                    onClick={() => setPage(pageSafe - 1)} aria-label="Previous">{chev}</button>
                  {Array.from({ length: pages }, (_, i) => (
                    <button type="button" className="akw-pg" key={i}
                      aria-current={i === pageSafe ? 'page' : undefined}
                      onClick={() => setPage(i)}>{i + 1}</button>
                  ))}
                  <button type="button" className="akw-pg" disabled={pageSafe === pages - 1}
                    onClick={() => setPage(pageSafe + 1)} aria-label="Next">
                    <span className="akw-chev" aria-hidden style={{ transform: 'rotate(180deg)' }}>
                      <HandArrowLeft size={12} />
                    </span>
                  </button>
                </nav>
              )}
            </>
          )}

          {tab === 'mine' && (
            <div className="akw-col">
              <p className="akw-mock">
                <b>What I sent into the brain, and what happened to it.</b> The same list the
                chat shows — one post, one card, wherever you look at it.
              </p>
              {DEMO_PENDING.map((p) => (
                <div className="akw-my" key={p.text}>
                  <span className="akw-kind">{p.kind}</span>
                  <span className="akw-mytx"><b>{p.text}</b><em>{p.note}</em></span>
                  <span className="akw-myst">
                    <u className={p.status === 'ok' ? 'is-ok' : p.status === 'no' ? 'is-no' : ''}>
                      {p.status === 'ok' ? 'in the brain' : p.status === 'no' ? 'turned down' : 'waiting'}
                    </u>
                    <i>{p.when}</i>
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === 'lib' && (
            <div className="akw-lib">
              {/* ── VĽAVO: KAM IDEM ──────────────────────────────────────── */}
              <div className="akw-shelf">
                <button type="button" className="akw-howbtn" onClick={() => setHow(true)}>
                  <i aria-hidden style={mask('idea')} />
                  How this library works
                </button>
                {SOURCE_GROUPS.map((g) => {
                  const n = LIBRARY_SOURCES.filter((d) => d.group === g.key).length;
                  return (
                    <button type="button" className="akw-sh" key={g.key}
                      aria-current={shelf === g.key ? 'true' : undefined}
                      onClick={() => setShelf(shelf === g.key ? null : g.key)}>
                      {g.label}<em>{n}</em>
                    </button>
                  );
                })}
                <button type="button" className="akw-new" style={{ marginTop: PACK_SPACE.md }}
                  onClick={() => setKinds((v) => !v)}>
                  <HandPlus size={14} />Add a source
                </button>
                {kinds && (
                  <div className="akw-kinds">
                    {SOURCE_KINDS.map((k) => (
                      <button type="button" className="akw-kbtn" key={k.key}>
                        <b>{k.label}</b><em>{k.hint}</em>
                        {/* ⚠️ Číslo, ktoré ešte nepadlo, sa NEVYMÝŠĽA — povie sa to. */}
                        <u>{k.devotion != null ? `+${k.devotion} devotion` : 'devotion tbd'}</u>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── VPRAVO: ČO TAM JE ────────────────────────────────────── */}
              <div className="akw-col">
                {SOURCE_GROUPS.filter((g) => !shelf || g.key === shelf).map((g) => {
                  const inGroup = LIBRARY_SOURCES.filter((d) => d.group === g.key);
                  return (
                    <Fragment key={g.key}>
                      <div className="akw-grp">{g.label}</div>
                      {inGroup.length === 0
                        ? <p className="akw-gempty">{g.empty}</p>
                        : <div className="akw-books">
                          {inGroup.map((d) => <SourceCard key={d.key} s={d} />)}
                        </div>}
                    </Fragment>
                  );
                })}

                {/* 🔴 NEEXISTUJÚCI ZDROJ SA NEPÍŠE AKO NULA. */}
                {!WEB_RESEARCH_EXISTS && !shelf && (
                  <div className="akw-none">
                    <h2>Web research</h2>
                    <p>None. AINUBIS cannot search the internet — everything above came in as a document.</p>
                  </div>
                )}

                {/* 🔴 ZDROJ, KTORÝ ZOZNAM NEUVÁDZA, SA NEZAMLČÍ. */}
                {hiddenNote() && !shelf && <p className="akw-foot-note">{hiddenNote()}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
      {how && (
        <div className="pk-veil pk-veil--modal akw-scrim" role="dialog" aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setHow(false); }}>
          <article className="akw-post akw-howsheet">
            <button type="button" className="akw-x" aria-label="Close" onClick={() => setHow(false)}>
              <HandArrowLeft size={15} />
            </button>
            {/* 🔴 CELÝ TEXT JE AŽ TU (Matej 24. 9.: „zámer je dať čo najmenej textu
                na vstupe a viac ukázať len po kliku"). Na polici stojí jedna veta
                na tlačidle; toto sa otvorí, keď o to človek požiada. */}
            <h2>How this library works</h2>
            <p>This is a place that collects what is known about dogs. <b>AINUBIS weighs the
              sources against each other</b> and shows where they agree and where they do not.
              Together we build knowledge that serves the dog — without human ego.</p>
            <p>We give precedence to relevant sources and to scientific work. We also hold that
              <b> a dog reads energy</b> and absorbs our moods and our stress — something many
              scientists will never accept. That one is yours to settle: your own heart, or the
              people who have not found the proof yet.</p>
            <p>{SOURCES_CLAUSE}</p>
            {/* LEGENDA PRUHU — číslo nehovorí, aká je kniha DOBRÁ; hovorí, koľko
                z toho, čo sme z nej vzali, je zhoda odboru a koľko názor autora. */}
            <div className="akw-leg">
              <span><u style={{ background: AINUBIS.ok }} />settled — the field agrees</span>
              <span><u style={{ background: AINUBIS.glow }} />tradition — true inside its own system</span>
              <span><u style={{ background: AINUBIS.ctaA }} />author’s own view — carries a counterweight</span>
            </div>
          </article>
        </div>
      )}
      {open && (
        <div className="pk-veil pk-veil--modal akw-scrim" role="dialog" aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) onPost(null); }}>
          <PostFull post={open} onLibrary={() => { onPost(null); onTab('lib'); }}
            onClose={() => onPost(null)} />
        </div>
      )}
    </section>
  );
}
