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
import { useState } from 'react';
import {
  PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI,
} from '@/components/pack/packTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { HandPaw, HandStar, HandForward, HandPlus, HandArrowLeft } from '@/components/pack/HandIcons';
import ainubisFace from '@/assets/ainubis-badge.png';
import { VAULT_WORLDS } from './worlds';
import { DEMO_WALL, type WallPost, type SealKind } from './vaultWallDemo';
import { DEMO_PENDING } from './vaultChatDemo';
import {
  VAULT_SOURCES, VAULT_SOURCE_TOTALS, SOURCE_KINDS, SOURCES_CLAUSE,
  WEB_RESEARCH_EXISTS, consensusPct, type VaultSource,
} from './vaultSources';

/* 🔴 STROP MRIEŽKY JE POVINNÝ (nákres v5, r. 707): bez neho vznikne na 27"
   piaty stĺpec s kartami po 300 px a z nástenky je tabuľka. */
const GRID_MIN = 360;
const GRID_MAX = 1560;

/** Meno tretej záložky. Matej 24. 9.: „možno by sme mohli použiť mozog namiesto
 *  zdroje?" — MOZOG je obsadený (pohľad MOZOG ⇄ DOGSCROLL vo VAULTE, plátno
 *  brainEngine.ts), takže by sa tak volali dve rôzne veci. KNIŽNICA hovorí,
 *  čo to je, a znesie aj 500 položiek. Je to jedna konštanta — prepnúť sa dá
 *  za sekundu. */
const LIBRARY = 'Library';

export const VAULT_WALL_CSS = `
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
    ${PACK_SPACE.lg}px ${PACK_SPACE.md}px;
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
.akw-col{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;max-width:900px;}

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
.akw-post{border-radius:${PACK_R.card}px;border:1px solid ${AINUBIS.edge};
  background:rgba(3,7,12,0.35);overflow:hidden;
  display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;
  padding:${PACK_SPACE.lg}px;}
.akw-phead{display:flex;align-items:center;gap:${PACK_SPACE.md}px;}
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

/* ODPOVEĎ AINUBISA — jeho vlastný šat vnútri karty človeka. */
.akw-ai{padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid ${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};}
/* Keď mozog o téme nič nemá, blok stratí zlato — nie je to odpoveď, je to
   priznanie. Zlatý lem by mu dal váhu, ktorú nemá. */
.akw-ai.is-blank{border-color:${AINUBIS.edge};background:${AINUBIS.raised};}
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
  margin-top:${PACK_SPACE.md}px;padding-top:${PACK_SPACE.md}px;border-top:1px solid ${AINUBIS.ctaEdge};
  font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;line-height:1.4;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akw-ai.is-blank .akw-from{border-top-color:${AINUBIS.edge};}
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
.akw-clause{border-radius:${PACK_R.tile}px;border:1px solid ${AINUBIS.glowEdge};
  background:${AINUBIS.glowTint};padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;
  font-size:${PACK_TEXT.label}px;line-height:1.55;color:${AINUBIS.inkDim};}
.akw-src{border-radius:${PACK_R.frame}px;border:1px solid ${AINUBIS.edge};
  background:rgba(3,7,12,0.35);padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;}
/* Čerstvo pridaný zdroj je v zozname HNEĎ — ale bledo a so stavom. */
.akw-src.is-pending{border-style:dashed;background:transparent;}
.akw-srchd{display:flex;align-items:flex-start;gap:${PACK_SPACE.md}px;}
.akw-src h2{margin:0;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.body}px;line-height:1.35;
  color:${AINUBIS.ink};}
.akw-src.is-pending h2{color:${AINUBIS.inkFaint};}
.akw-au{margin:${PACK_SPACE.xs}px 0 0;font-size:${PACK_TEXT.label}px;line-height:1.45;color:${AINUBIS.inkFaint};}
/* ODKAZ NA ORIGINÁL — klauzula hovorí „autori urobili prácu, my na ňu ukazujeme",
   toto je to ukázanie. ⚠️ Affiliate ešte neexistuje (Matej: „doladíme, vyrobíme
   si affiliate"), takže tlačidlo je ZATIAĽ MŔTVE a povie to — mŕtvy odkaz, ktorý
   vyzerá živo, je horší než žiadny. */
.akw-buy{flex:0 0 auto;margin-left:auto;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
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

function Post({ post, onLibrary }: { post: WallPost; onLibrary: () => void }) {
  const [paw, setPaw] = useState(false);
  const [saved, setSaved] = useState(false);
  const [why, setWhy] = useState<number | null>(null);
  const w = worldOf(post.world);
  return (
    <article className="akw-post">
      <div className="akw-phead">
        <span className="akw-av" aria-hidden>{post.initial}</span>
        <span className="akw-who"><b>{post.who}</b><em>{post.dog}</em></span>
        {w && <span className="akw-world"><i aria-hidden style={mask(w.ic)} />{w.en}</span>}
      </div>
      <p className="akw-ptxt">{post.text}</p>
      <div className="akw-tags">
        {post.tags.map((tag, i) => (
          <span key={tag} className={`akw-tag${i === 0 ? ' is-kind' : ''}`}>{tag}</span>
        ))}
      </div>

      <div className={`akw-ai${post.ai.blank ? ' is-blank' : ''}`}>
        <div className="akw-aihd">
          <img className="akw-aiface" src={ainubisFace} alt="" aria-hidden />
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
  const pct = consensusPct(s);
  const all = s.split.consensus + s.split.traditional + s.split.author;
  const seg = (n: number) => (all > 0 ? `${(n / all) * 100}%` : '0%');
  return (
    <article className={`akw-src${s.pending ? ' is-pending' : ''}`}>
      <div className="akw-srchd">
        <div style={{ minWidth: 0 }}>
          <h2>{s.title}</h2>
          <p className="akw-au">{[s.author, s.year, s.extent, s.kind].filter(Boolean).join(' · ')}</p>
        </div>
        {/* Odkaz na originál patrí len tomu, čo sa dá kúpiť — vlastný text ani
            slovenské skriptá sa na Amazone nedajú objednať. */}
        {!s.pending && s.kind === 'book' && <span className="akw-buy">original · link soon</span>}
      </div>

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
            {pct != null && <span><s>{pct} %</s> consensus</span>}
            <span><b>{s.scrolls}</b> scrolls</span>
            <span>{s.tags.join(' · ')}</span>
            {s.addedBy && <span>added by {s.addedBy}</span>}
          </div>
        </>
      )}
    </article>
  );
}

export function VaultWall({ onBack, tab, onTab }: {
  /** Jedno gesto von (A2) — vracia na rovinu VAULT, tak ako šípka v chate. */
  onBack: () => void;
  tab: 'pack' | 'mine' | 'lib';
  onTab: (t: 'pack' | 'mine' | 'lib') => void;
}) {
  /** Filter je VRSTVA nad tým istým obsahom, nie ďalšia záložka (lock §1.3). */
  const [world, setWorld] = useState<string | null>(null);
  const [kinds, setKinds] = useState(false);
  const posts = world ? DEMO_WALL.filter((p) => p.world === world) : DEMO_WALL;

  return (
    <section className="akw-root" aria-label="Board">
      <header className="akw-head">
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
              <div className="akw-worlds">
                <button type="button" className="akw-wchip" aria-pressed={world === null}
                  onClick={() => setWorld(null)}>everything</button>
                {VAULT_WORLDS.map((w) => (
                  <button key={w.key} type="button" className="akw-wchip" aria-pressed={world === w.key}
                    onClick={() => setWorld((v) => (v === w.key ? null : w.key))}>
                    <i aria-hidden style={mask(w.ic)} />{w.en}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      <div className="akw-list">
        <div className="akw-in">
          {tab === 'pack' && (
            <>
              <p className="akw-mock">
                <b>Mock-up.</b> Four posts, written by hand. What is real here is the shape:
                every post carries the world it belongs to, AINUBIS answers first and names the
                scrolls he answers from — and when the vault has nothing on the subject, he says
                so instead of inventing a source.
              </p>
              <button type="button" className="akw-new"><HandPlus size={14} />Share an experience or a problem</button>
              <div className="akw-grid">
                {posts.map((p) => <Post key={p.id} post={p} onLibrary={() => onTab('lib')} />)}
              </div>
              {posts.length === 0 && <p className="akw-mock">Nothing in this world yet.</p>}
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
            <div className="akw-col">
              {/* 🔴 KLAUZULA HORE (Matej 24. 9.) — a je to popis toho, čo sa naozaj
                  deje, nie právnická veta na okrasu. */}
              <p className="akw-clause">{SOURCES_CLAUSE}</p>

              <button type="button" className="akw-new" onClick={() => setKinds((v) => !v)}>
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

              {VAULT_SOURCES.map((s) => <SourceCard key={s.key} s={s} />)}

              {/* 🔴 NEEXISTUJÚCI ZDROJ SA NEPÍŠE AKO NULA. */}
              {!WEB_RESEARCH_EXISTS && (
                <div className="akw-none">
                  <h2>Web research</h2>
                  <p>None. AINUBIS cannot search the internet — everything above came in as a document.</p>
                </div>
              )}

              <p className="akw-mock">
                <b>Mock-up.</b> The scroll counts and the consensus split are measured from the
                corpus as it stood on 24 September 2026 and written into the page. Before this
                screen goes live it has to ask the corpus itself, or it will start lying about
                the one thing it exists to prove.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
