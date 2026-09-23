// ════════════════════════════════════════════════════════════════════════════
// AINUBIS · ROVINA CHAT — MAKETA (23. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Nákres `plany/nakres-vault-fasada-v5-2026-09-20.html`, rovina 2 (riadky
// 487–700 CSS, 1017–1056 markup). Matej 23. 9.: *„pri ainubisovi začať chat
// otvorí ai chat — kde je vidno aj história atď to tiež musíme postaviť len
// ako maketu"* a *„nakres uz sme robili vo v5"*.
//
// 🔴 ŽIVÝ CHAT SA NEDOTKOL. Panel `AinubisWidget` beží naostro (korpus
//    `ainubis_kb_*`, Edge Function `ainubis-chat`) a ostáva jediným skutočným
//    vstupom. Maketa žije za `import.meta.env.DEV` — v produkčnom builde sa
//    rovina CHAT chová presne ako doteraz a otvára widget.
//    [[feedback_rozostavanu_vec_stavaj_za_zamknute_dvere]]
//
// ČO MAKETA DOKAZUJE (a prečo nie je kópia Claude):
//   · pás histórie vľavo, nový rozhovor jedným klikom, rozhovory po dňoch
//   · ODPOVEĎ MÁ PÔVOD — `ODKIAĽ TO VIEM` nad mozgom vymenuje zvitky, z ktorých
//     odpoveď je. Claude má napravo prázdno; my tam máme dôkaz.
//   · JEDNA hlavná akcia odpovede: `ZAPÍSAŤ DO DOG ID`. Matej 20. 9.: „aplikovať
//     pre psa" a „uložiť do protokolu" boli DVE MENÁ PRE JEDNO; protokol = DOG ID
//     a to je locknuté názvoslovie.
//
// ⚠️ ŠÍRKA: lock `pack-dizajn-system.md` drží centrovaný obsah na 832 px, ale
//    výslovne z neho vyníma chat AINUBISA („jeho kostru Matej neschválil").
//    Vlákno má preto meranú šírku 760 (telo článku), nie 832 — inak by odpoveď
//    na 27" mala 1 400 px a čítala by sa ako tabuľka.
// ⚠️ ČÍSLA SÚ ZO STUPNÍC `PACK_*`. Nákres má 9px popisky a vlastné premenné;
//    mikropopisok je v appke 10 (`PACK_TEXT.micro`) — stráž `check:pack` meria.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI,
} from '@/components/pack/packTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { HandArrowLeft } from '@/components/pack/HandIcons';
import {
  DEMO_CHATS, DEMO_SCROLLS, DEMO_CONTEXT, DEMO_FORMS, FORM_ORDER,
  DEMO_PENDING, DEMO_REPLY, DEMO_STARTERS, demoVerdict,
  type DemoAnswer, type DemoChat, type DemoMessage, type DemoPending,
  type DemoVerdict, type FormKind,
} from './vaultChatDemo';

/** Šírka pásu histórie na PC. Užší by neuniesol názov rozhovoru na jeden riadok. */
const RAIL_W = 260;
/* 🔴 MOZOG V CHATE NIE JE (Matej 23. 9. 2026: „budu len 2 stlpce nie 3, to jadro
   pojde preč"). Nákres v5 ho mal ako tretí stĺpec s panelom ODKIAĽ TO VIEM;
   maketa podľa neho vznikla a Matej ju nad ňou opravil. ⚠️ DÔSLEDOK: pôvod
   odpovede nesie UŽ LEN riadok zdrojov pod ňou — a ten je preto povinný. */
/** Meraná šírka vlákna — telo článku z locku, nie šírka obrazovky. */
const THREAD_W = 760;

export const VAULT_CHAT_CSS = `
/* ── PÁS HISTÓRIE ──────────────────────────────────────────────────────────
   Z Claude si berieme pás vľavo, nový rozhovor jedným klikom, zoskupenie po
   dňoch a hľadanie v nich. Neberieme si prázdnu pravú plochu. */
.akc-rail{position:absolute;z-index:4;left:0;top:0;bottom:0;width:min(84vw,${RAIL_W}px);
  display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;
  background:${AINUBIS.surfaceBase};border-right:1px solid ${AINUBIS.edge};
  transform:translateX(-101%);transition:transform 180ms ease;}
.akv-root[data-rail="open"] .akc-rail{transform:none;}
.akc-railhd{padding:${PACK_SPACE.xl}px ${PACK_SPACE.md}px 0;
  display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
/* NOVÝ ROZHOVOR je jediné plné CTA v páse — AINUBISOVA zlato-oranžová, nie
   lapis: toto je jeho povrch a on má vlastný brand. */
.akc-new{width:100%;padding:${PACK_SPACE.md}px;border:0;border-radius:${PACK_R.field}px;cursor:pointer;
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.label}px;line-height:1;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;
  background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};box-shadow:${AINUBIS.ctaShadow};}
.akc-new:hover{background:${AINUBIS.ctaGradHover};}
.akc-srch{margin:${PACK_SPACE.md}px ${PACK_SPACE.md}px 0;display:flex;align-items:center;
  gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};}
.akc-srch input{flex:1;min-width:0;border:0;background:none;outline:0;color:${AINUBIS.ink};
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;}
.akc-srch input::placeholder{color:${AINUBIS.inkFaint};}
.akc-list{min-height:0;overflow-y:auto;overscroll-behavior:contain;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;
  display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;}
.akc-day{padding:${PACK_SPACE.md}px ${PACK_SPACE.sm}px ${PACK_SPACE.xs}px;
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;line-height:1;
  letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akc-item{display:block;width:100%;text-align:left;cursor:pointer;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid transparent;background:none;color:${AINUBIS.inkDim};}
.akc-item b{display:block;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;
  line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.akc-item em{font-style:normal;font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.card.letterSpacing};
  color:${AINUBIS.inkFaint};}
.akc-item:hover{background:rgba(${AINUBIS.cyanRGB},0.08);}
/* VÝBER = PRIESVITNÝ TINT. Plná plocha patrí jedinému CTA (brand). */
.akc-item[aria-current="true"]{background:rgba(${AINUBIS.cyanRGB},0.14);
  border-color:${AINUBIS.edge};color:${AINUBIS.cyan};}
/* PÄTA PÁSU — identita a moje príspevky. Vo VAULTE to nesie horná lišta; v chate
   lišta na mobile mizne (kôš 3), takže postup musí byť tu. */
.akc-foot{border-top:1px solid ${AINUBIS.edge};padding:${PACK_SPACE.md}px;
  display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.akc-mine{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;width:100%;text-align:left;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.field}px;cursor:pointer;
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;
  border:1px dashed ${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};color:${AINUBIS.inkDim};}
.akc-mine b{margin-left:auto;color:${AINUBIS.ctaA};font-weight:600;}
.akc-me{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;
  font-size:${PACK_TEXT.micro}px;color:${AINUBIS.inkFaint};}

/* ── VLÁKNO ────────────────────────────────────────────────────────────── */
.akc-thread{position:absolute;z-index:3;inset:0;display:grid;
  grid-template-rows:auto minmax(0,1fr) auto;background:${AINUBIS.surfaceBase};
  padding-top:var(--akv-top-h,112px);}
/* HLAVIČKA — krok späť, šuplík rozhovorov a JEDEN RIADOK kontextu.
   🔴 KONTEXT JE RIADOK TEXTU, NIE RAD PILULEK (Matej 23. 9. 2026, variant A1 nad
   nákresom plany/nakres-ainubis-chat-doladenie-2026-09-23.html). Tri pilulky
   sa na 390 px lámali do troch riadkov a hlavička zaberala 129 px z 844 —
   pätinu obrazovky na vetu, ktorá sa nedá stlačiť. Nie je to ovládač, je to
   tvrdenie „poznám tvojho psa": nič v ňom nie je klikateľné a nič nefiltruje. */
.akc-head{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;
  border-bottom:1px solid ${AINUBIS.edge};
  padding:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.md}px)
    ${PACK_SPACE.lg}px ${PACK_SPACE.md}px;}
.akc-ctx{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;flex-wrap:wrap;
  font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.card.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akc-ctxline{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;line-height:1.35;
  letter-spacing:0.02em;color:${AINUBIS.inkFaint};}
/* Meno psa je jediné slovo, ktoré dokazuje, že pozná TOHTO psa — nesie jeho farbu. */
.akc-ctxline i{font-style:normal;color:${AINUBIS.cyan};}
.akc-back{width:32px;height:32px;flex:0 0 32px;display:flex;align-items:center;justify-content:center;
  border-radius:${PACK_R.pill}px;cursor:pointer;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.cyan};}
.akc-back:hover{border-color:${AINUBIS.edgeStrong};}
.akc-railbtn{padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.card.letterSpacing};
  text-transform:uppercase;border:1px solid ${AINUBIS.edge};background:none;color:${AINUBIS.cyan};}
.akc-msgs{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:${PACK_SPACE.lg}px;}
/* ⚠️ VLÁKNO MÁ MERANÚ ŠÍRKU — stĺpec rastie s oknom, riadok odpovede nie. */
.akc-in{max-width:${THREAD_W}px;margin:0 auto;display:flex;flex-direction:column;gap:${PACK_SPACE.xl}px;}
.akc-me-msg{align-self:flex-end;max-width:82%;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;
  border-radius:${PACK_R.card}px;border-bottom-right-radius:${PACK_R.field}px;
  font-size:${PACK_TEXT.body}px;color:${AINUBIS.ink};
  background:rgba(${AINUBIS.cyanRGB},0.14);border:1px solid ${AINUBIS.edge};}
.akc-ai{align-self:stretch;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.akc-aihd{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.micro}px;line-height:1;
  letter-spacing:${PACK_HEAD.section.letterSpacing};color:${AINUBIS.inkFaint};}
/* MENO JE VŽDY <AI>NUBIS — „AI" cyanom. Záporný margin vracia medzeru, ktorú
   za písmenom I nechalo rozstrelenie: bez neho meno vyzerá ako AI NUBIS. */
.akc-aihd i{font-style:normal;color:${AINUBIS.aiInk};margin-right:-0.22em;}
.akc-body{padding:${PACK_SPACE.lg}px;border-radius:${PACK_R.card}px;border-top-left-radius:${PACK_R.field}px;
  font-size:${PACK_TEXT.body}px;color:${AINUBIS.inkDim};
  background:${AINUBIS.raised};border:1px solid ${AINUBIS.edge};}
.akc-body p{margin:0 0 ${PACK_SPACE.md}px;}
.akc-body p:last-of-type{margin:0;}
.akc-body b{color:${AINUBIS.ink};font-weight:500;}
/* RADA — jedna vec, ktorú má človek urobiť. Zlatá, lebo je to výzva, nie fakt. */
.akc-advice{margin-top:${PACK_SPACE.md}px;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid ${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};
  font-size:${PACK_TEXT.body}px;color:${AINUBIS.ink};}
.akc-advice b{display:block;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;line-height:1;
  letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;
  color:${AINUBIS.ctaA};margin-bottom:${PACK_SPACE.sm}px;}
/* ZDROJ — riadok pod odpoveďou. Klik rozsvieti zvitky v mozgu vpravo. */
.akc-srcrow{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;flex-wrap:wrap;
  margin-top:${PACK_SPACE.md}px;padding-top:${PACK_SPACE.md}px;border-top:1px solid ${AINUBIS.edge};
  font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.card.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akc-srcrow button{padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;line-height:1.2;
  letter-spacing:0.02em;text-transform:none;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.cyan};}
.akc-srcrow button:hover{background:rgba(${AINUBIS.cyanRGB},0.12);}
/* Priznanie, že maketa nehľadala. Kurzíva by z toho spravila citát. */
.akc-srcrow em{font-style:normal;text-transform:none;letter-spacing:0.02em;}
.akc-acts{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.akc-act{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.inkDim};}
.akc-act:hover{border-color:${AINUBIS.edgeStrong};color:${AINUBIS.cyan};}
/* HLAVNÁ AKCIA ODPOVEDE — jediná plná v bloku (protokol = DOG ID, lock). */
.akc-act.is-main{border:0;background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};font-weight:600;}
.akc-act.is-main:hover{background:${AINUBIS.ctaGradHover};color:${AINUBIS.ctaInk};}

/* ── BLOK VO VLÁKNE: UVÍTANIE · FORMULÁR PRÍSPEVKU ──────────────────────
   🔴 FORMULÁR JE SPRÁVA, NIE OKNO NAVRCHU. Lock §4.2: akcia nesmie odniesť
   človeka preč z miesta, kde je — píše sa tam, kde sa pýta.
   ⚠️ Nový názov bloku sa NEZAKLADÁ. Celý tento povrch je AI-PALUBA z katalógu
   PACK_BLOCKS; .akc-* sú jej diely, nie sedemnásty blok. */
.akc-nform{border-radius:${PACK_R.card}px;padding:${PACK_SPACE.lg}px;
  border:1px solid ${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};}
/* Uvítanie prázdneho rozhovoru je ten istý blok v TICHEJ polohe — zlatý lem
   patrí príspevku do mozgu, nie privítaniu. */
.akc-nform.is-quiet{border-color:${AINUBIS.edge};background:${AINUBIS.raised};}
.akc-eb{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;line-height:1;
  letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${AINUBIS.ctaA};}
.akc-nform.is-quiet .akc-eb{color:${AINUBIS.cyan};}
.akc-nform h5{margin:${PACK_SPACE.sm}px 0 0;font-family:${FONT_TITLE};font-weight:700;
  font-size:${PACK_TEXT.lead}px;line-height:1.25;letter-spacing:${PACK_HEAD.card.letterSpacing};
  color:${AINUBIS.ink};}
.akc-nfin{width:100%;margin-top:${PACK_SPACE.md}px;padding:${PACK_SPACE.md}px;
  border-radius:${PACK_R.tile}px;border:1px solid ${AINUBIS.edge};background:${AINUBIS.bgDeep};
  color:${AINUBIS.ink};font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;line-height:1.5;
  outline:0;resize:vertical;}
.akc-nfin::placeholder{color:${AINUBIS.inkFaint};}
.akc-nfrow{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;margin-top:${PACK_SPACE.md}px;
  align-items:center;}
.akc-lb{font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;line-height:1.2;
  letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}
/* PILULKA VOĽBY — výber je priesvitný TINT, plná plocha patrí jedinému CTA (brand). */
.akc-pk{padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;line-height:1.35;
  letter-spacing:0.02em;border:1px solid ${AINUBIS.edge};background:none;color:${AINUBIS.inkDim};}
.akc-pk:hover{border-color:${AINUBIS.edgeStrong};}
.akc-pk[aria-pressed="true"]{background:rgba(${AINUBIS.cyanRGB},0.14);
  border-color:${AINUBIS.edgeStrong};color:${AINUBIS.cyan};}
.akc-cta{border:0;border-radius:${PACK_R.field}px;cursor:pointer;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.label}px;line-height:1;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;
  background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};box-shadow:${AINUBIS.ctaShadow};}
.akc-cta:hover{background:${AINUBIS.ctaGradHover};}
.akc-gho{border-radius:${PACK_R.field}px;cursor:pointer;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;line-height:1;
  border:1px solid ${AINUBIS.edge};background:none;color:${AINUBIS.inkFaint};}
.akc-gho:hover{border-color:${AINUBIS.edgeStrong};color:${AINUBIS.inkDim};}
.akc-nfnote{margin-top:${PACK_SPACE.md}px;font-size:${PACK_TEXT.micro}px;line-height:1.5;
  color:${AINUBIS.inkFaint};}
.akc-nfnote b{color:${AINUBIS.ink};font-weight:500;}
/* Tichý riadok bez odsadenia zhora — keď stojí hneď pod svojím nadpisom. */
.akc-nfrow.is-tight,.akc-nfnote.is-tight{margin-top:0;}
.akc-nfnote.is-tight{font-style:normal;}

/* ── PRÍSPEVOK PO ODOSLANÍ — POSUDOK A STAV ─────────────────────────────
   🔴 POSUDOK JE PODKLAD, NIE ROZSUDOK. AINUBIS predtriedi (relevancia, zdroj,
   kam to patrí), do mozgu to pustí Matej — preto má posudok vlastný blok
   v jeho modrom svite a končí vetou o tom, kto rozhoduje. */
.akc-pend{border-radius:${PACK_R.card}px;padding:${PACK_SPACE.lg}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};}
.akc-pq{font-size:${PACK_TEXT.body}px;line-height:1.4;color:${AINUBIS.inkDim};}
.akc-pq b{color:${AINUBIS.ink};font-weight:500;}
.akc-verdict{margin-top:${PACK_SPACE.md}px;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  font-size:${PACK_TEXT.label}px;line-height:1.5;color:${AINUBIS.inkDim};
  border:1px solid ${AINUBIS.glowEdge};background:${AINUBIS.glowTint};}
.akc-verdict b{color:${AINUBIS.cyan};font-weight:500;}
.akc-kv{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;margin-top:${PACK_SPACE.sm}px;}
.akc-kv span{padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;
  font-size:${PACK_TEXT.micro}px;line-height:1.2;letter-spacing:${PACK_HEAD.card.letterSpacing};
  text-transform:uppercase;border:1px solid ${AINUBIS.edge};color:${AINUBIS.inkFaint};}
/* TRI STAVY — čaká (jeho zlatá) · v mozgu (zelená) · zamietnuté (červená).
   Vždy tint + lem; plná plocha je vyhradená jedinému CTA. */
.akc-pstat{display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;line-height:1.2;
  letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;}
.akc-pstat[data-st="wait"]{color:${AINUBIS.ctaA};border:1px solid ${AINUBIS.ctaEdge};
  background:${AINUBIS.ctaTint};}
.akc-pstat[data-st="ok"]{color:${AINUBIS.ok};border:1px solid ${AINUBIS.okEdge};
  background:${AINUBIS.okTint};}
.akc-pstat[data-st="no"]{color:${AINUBIS.danger};border:1px solid ${AINUBIS.dangerEdge};
  background:${AINUBIS.dangerTint};}
/* ZOZNAM MOJICH PRÍSPEVKOV — otvára sa VO VLÁKNE ako ďalší blok (Matej 23. 9.),
   nie na štvrtej obrazovke: chat je JEDNA úloha. */
.akc-mlist{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;
  margin-top:${PACK_SPACE.md}px;}
.akc-mrow{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;
  padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.bgDeep};}
/* Druh príspevku — tichý štítok, nie zlatý: zlatá tu patrí stavu „čaká". */
.akc-pend > .akc-eb,.akc-mrow > .akc-eb{color:${AINUBIS.inkFaint};}
.akc-mrow > b{font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;
  line-height:1.35;color:${AINUBIS.ink};}
.akc-mrow em{font-style:normal;font-size:${PACK_TEXT.micro}px;line-height:1.4;
  color:${AINUBIS.inkFaint};}

/* ── PÍSACIE POLE + „+" (prispievanie do mozgu) ───────────────────────── */
/* 🔴 SPODNÁ LIŠTA V CHATE NIE JE (Matej 23. 9. 2026 + lock §3: kôš 3 = ÚLOHA).
   Pole preto sadá na spodok obrazovky a odsadzuje sa len o bezpečnú zónu.
   Do 23. 9. tu stál výpočet cez --pack-nav-h — už netreba, lišta nesvieti. */
.akc-ask{position:relative;border-top:1px solid ${AINUBIS.edge};
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px
    calc(env(safe-area-inset-bottom,0px) + ${PACK_SPACE.md}px);}
.akc-askin{max-width:${THREAD_W}px;margin:0 auto;display:flex;gap:${PACK_SPACE.sm}px;align-items:flex-end;}
.akc-ask textarea{flex:1;min-width:0;resize:none;height:44px;padding:${PACK_SPACE.md}px;
  border-radius:${PACK_R.tile}px;border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};
  color:${AINUBIS.ink};font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;line-height:1.4;outline:0;}
.akc-ask textarea::placeholder{color:${AINUBIS.inkFaint};}
.akc-plus,.akc-send{width:44px;height:44px;flex:0 0 44px;border-radius:${PACK_R.tile}px;cursor:pointer;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.cyan};
  font-size:${PACK_TEXT.h2}px;line-height:1;}
.akc-plus:hover,.akc-send:hover{background:rgba(${AINUBIS.cyanRGB},0.12);}
.akc-ask[data-add="open"] .akc-plus{background:rgba(${AINUBIS.cyanRGB},0.18);border-color:${AINUBIS.edgeStrong};}
/* PONUKA PRISPIEVANIA sa otvára NAHOR — dole je lišta a pod ňou nič nie je. */
.akc-addmenu{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(100% - ${PACK_SPACE.sm}px);
  width:min(420px,calc(100% - ${2 * PACK_SPACE.lg}px));display:none;flex-direction:column;gap:${PACK_SPACE.xs}px;
  padding:${PACK_SPACE.sm}px;border-radius:${PACK_R.card}px;z-index:6;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.bgDeep};box-shadow:${AINUBIS.panelShadow};}
.akc-ask[data-add="open"] .akc-addmenu{display:flex;}
.akc-amlb{padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;font-family:${FONT_UI};font-weight:600;
  font-size:${PACK_TEXT.micro}px;line-height:1;letter-spacing:${PACK_HEAD.label.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.cyan};}
.akc-ami{display:flex;gap:${PACK_SPACE.md}px;align-items:flex-start;text-align:left;cursor:pointer;
  padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid transparent;background:none;color:${AINUBIS.inkDim};}
.akc-ami:hover{background:rgba(${AINUBIS.cyanRGB},0.08);border-color:${AINUBIS.edge};}
.akc-ami u{text-decoration:none;font-size:${PACK_TEXT.lead}px;line-height:1.2;}
.akc-ami b{display:block;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;
  line-height:1.3;color:${AINUBIS.ink};}
.akc-ami em{font-style:normal;font-size:${PACK_TEXT.micro}px;color:${AINUBIS.inkFaint};}

/* MOBIL: čo patrí VAULTU, v chate nesvieti. Hľadanie vo vaulte, filtre svetov
   a pilulka POHĽADU (DOGSCROLL ⇄ MOZOG) sa chatu netýkajú — pilulka navyše
   sadala priamo na písacie pole. Identita a prepínač ROVÍN ostávajú: bez nich
   niet cesty späť. */
.akv-root[data-plane="chat"] .akv-mtools,
.akv-root[data-plane="chat"] .akv-mactions,
.akv-root[data-plane="chat"] .akv-ctl{display:none;}

/* GUĽA AINUBISA SA V CHATE SKRÝVA. Je to spúšťač chatu a v chate už si — navyše
   sadá presne na panel ODKIAĽ TO VIEM. Mimo tejto roviny ostáva. */
.akv-root[data-plane="chat"] ~ .ainubis-launcher,
body:has(.akv-root[data-plane="chat"]) .ainubis-launcher{visibility:hidden;pointer-events:none;}

/* 🔴 CHAT JE CELÁ OBRAZOVKA, NIE ROVINA NAD MOZGOM. Mozog, horný pás identity
   ani ovládače vaultu v ňom nesvietia — je to ÚLOHA so šípkou späť. */
.akv-root[data-plane="chat"] .akv-brain,
.akv-root[data-plane="chat"] .akv-top{display:none;}
.akv-root[data-plane="chat"] .akc-thread{padding-top:0;}

/* ── PC: DVA STĹPCE — PÁS · VLÁKNO ───────────────────────────────────────── */
@media (min-width:1024px){
  .akv-root[data-plane="chat"] .akc-rail{transform:none;}
  .akv-root[data-plane="chat"] .akc-thread{left:${RAIL_W}px;right:0;}
  /* Pás je na PC stále na obrazovke, tlačidlo šuplíka teda nemá čo otvárať. */
  .akv-root[data-plane="chat"] .akc-railbtn{display:none;}
  /* ⚠️ HLAVIČKA SI ODSADENIE MUSÍ UROBIŤ SAMA. V chate zhasla lišta identity
     (.akv-top) a s ňou premenná akv-top-h — bez tohto riadku sedí šípka späť na
     0 px od horného okraja okna a vyzerá ako odseknutá. */
  .akv-root[data-plane="chat"] .akc-head{padding-top:${PACK_SPACE.xl}px;}
}
`;

/* Tvar správy — päť možností, teda päť stráží. `in` je jediné, čo TypeScript
   nad zjednotením bez spoločného poľa unesie. */
const isMe = (m: DemoMessage): m is { me: string } => 'me' in m;
const isAi = (m: DemoMessage): m is { ai: DemoAnswer } => 'ai' in m;
const isForm = (m: DemoMessage): m is { form: FormKind } => 'form' in m;
const isPend = (m: DemoMessage): m is { pend: DemoPending & { verdict: DemoVerdict } } => 'pend' in m;

/** Stav príspevku slovom. ⚠️ BEZ ZNAKU ⏳ ✓ ✕ — Matej 23. 9. 2026: emoji sú mimo
 *  brandu (hovorí nimi len mapa) a holé znaky `×` `✓` sú v manuáli tá istá polica.
 *  Stav nesie FARBA a SLOVO; kresba pribudne, keď bude v kite. */
const STAT: Record<DemoPending['status'], string> = {
  wait: 'waiting for approval',
  ok: 'in the brain',
  no: 'rejected',
};

/**
 * FORMULÁR PRÍSPEVKU — vlastný stav písania, aby každý znak neprekresľoval
 * celé vlákno. Maketa: „poslať" nič nikam neposiela, len vymení blok za posudok.
 */
function ContribForm({ kind, onSend, onDrop }: {
  kind: FormKind;
  onSend: (text: string) => void;
  onDrop: () => void;
}) {
  const f = DEMO_FORMS[kind];
  const [text, setText] = useState('');
  const [mine, setMine] = useState(true);
  const [circle, setCircle] = useState(true);
  return (
    <div className="akc-nform">
      <div className="akc-eb">contribution to the brain</div>
      <h5>{f.name}</h5>
      <textarea className="akc-nfin" rows={3} value={text} placeholder={f.placeholder}
        aria-label={f.name} onChange={(e) => setText(e.target.value)} />
      {/* Kniha je jediný druh, ktorý má čo priložiť — ostatné by mali prázdne tlačidlá. */}
      {kind === 'book' && (
        <div className="akc-nfrow">
          <button type="button" className="akc-pk">Photograph the pages</button>
          <button type="button" className="akc-pk">Upload a PDF</button>
        </div>
      )}
      <div className="akc-nfrow">
        <span className="akc-lb">about</span>
        <button type="button" className="akc-pk" aria-pressed={mine}
          onClick={() => setMine(true)}>my dog</button>
        <button type="button" className="akc-pk" aria-pressed={!mine}
          onClick={() => setMine(false)}>dogs in general</button>
      </div>
      {/* Okruh NAVRHUJE stroj a človek ho smie prebiť — nie naopak. */}
      <div className="akc-nfrow">
        <span className="akc-lb">AINUBIS suggests</span>
        <button type="button" className="akc-pk" aria-pressed={circle}
          onClick={() => setCircle(true)}>{f.circle}</button>
        <button type="button" className="akc-pk" aria-pressed={!circle}
          onClick={() => setCircle(false)}>another circle…</button>
      </div>
      <div className="akc-nfrow">
        <button type="button" className="akc-cta" onClick={() => onSend(text)}>send for approval</button>
        <button type="button" className="akc-gho" onClick={onDrop}>discard</button>
      </div>
      <p className="akc-nfnote">{f.sub}</p>
    </div>
  );
}

/** PRÍSPEVOK PO ODOSLANÍ — posudok stroja a stav. Posudok je podklad, nie rozsudok. */
function PendBlock({ p }: { p: DemoPending & { verdict?: DemoVerdict } }) {
  return (
    <div className="akc-pend">
      {/* DRUH PRÍSPEVKU SLOVOM — bez neho sa odkaz od knihy nedá odlíšiť,
          keď ikonky nemáme. */}
      <div className="akc-eb">{DEMO_FORMS[p.kind].name}</div>
      <div className="akc-pq"><b>{p.text}</b></div>
      {p.verdict && (
        <div className="akc-verdict">
          <b>{p.verdict.lead}</b> {p.verdict.line}
          <div className="akc-kv">{p.verdict.tags.map((t) => <span key={t}>{t}</span>)}</div>
        </div>
      )}
      <div className="akc-nfrow">
        <span className="akc-pstat" data-st={p.status}>{STAT[p.status]}</span>
        {/* Kam sa to podelo — nie posudok, ten je vyššie. */}
        <em className="akc-nfnote is-tight">you will find it under my contributions</em>
      </div>
    </div>
  );
}

/**
 * MOJE PRÍSPEVKY — otvára sa VO VLÁKNE ako ďalší blok (Matej 23. 9. 2026), nie
 * na štvrtej obrazovke: chat je JEDNA úloha a akcia nemá odniesť človeka preč.
 * ⚠️ ZAMIETNUTÝ MUSÍ BYŤ VIDNO. Zoznam, kde všetko prejde, klame o tom jedinom,
 *    čo prispievanie drží pri živote — že to niekto naozaj číta.
 */
function MineBlock({ items }: { items: DemoPending[] }) {
  const n = (s: DemoPending['status']) => items.filter((i) => i.status === s).length;
  return (
    <div className="akc-nform is-quiet">
      <div className="akc-eb">my contributions</div>
      <h5>What I sent into the brain</h5>
      <div className="akc-nfrow">
        <span className="akc-pstat" data-st="wait">{n('wait')} waiting</span>
        <span className="akc-pstat" data-st="ok">{n('ok')} in the brain</span>
        <span className="akc-pstat" data-st="no">{n('no')} rejected</span>
      </div>
      <div className="akc-mlist">
        {items.map((p, i) => (
          <div className="akc-mrow" key={`${p.text}-${i}`}>
            <div className="akc-eb">{DEMO_FORMS[p.kind].name}</div>
            <b>{p.text}</b>
            <div className="akc-nfrow is-tight">
              <span className="akc-pstat" data-st={p.status}>{STAT[p.status]}</span>
              <em>{p.when}</em>
            </div>
            <em>{p.note}</em>
          </div>
        ))}
      </div>
      <p className="akc-nfnote">Matej reads every one of them. A contribution reaches the brain
        only when it holds up on its own.</p>
    </div>
  );
}

/**
 * CHAT — pás histórie + vlákno + písacie pole. CELÁ OBRAZOVKA bez spodnej lišty,
 * von sa ide šípkou vľavo hore (kôš 3 = úloha, lock §3).
 */
export function VaultChat({ onBack, onOpenScroll }: {
  /** Krok späť z úlohy — vracia na rovinu VAULT. */
  onBack: () => void;
  onOpenScroll?: (id: number) => void;
}) {
  const [chats, setChats] = useState<DemoChat[]>(DEMO_CHATS);
  const [cur, setCur] = useState(DEMO_CHATS[0].id);
  const [q, setQ] = useState('');
  const [add, setAdd] = useState(false);
  const [draft, setDraft] = useState('');
  const [mine, setMine] = useState<DemoPending[]>(DEMO_PENDING);
  const msgsRef = useRef<HTMLDivElement>(null);
  const askRef = useRef<HTMLDivElement>(null);

  const chat = chats.find((c) => c.id === cur) ?? chats[0];

  /* Koniec vlákna. `scrollHeight` sa číta až po prekreslení — inak sa skáče na
     výšku, ktorú mal blok PRED pridaním správy. */
  const toEnd = () => requestAnimationFrame(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  /* Po prepnutí rozhovoru scrolluj na koniec vlákna. ⚠️ `toEnd` vracia číslo
     z requestAnimationFrame — priamo ako efekt by ho React bral za upratovaciu
     funkciu. */
  useEffect(() => { toEnd(); }, [chat]);

  /* ⚠️ PONUKA „+" SA MUSÍ DAŤ ZAVRIEŤ AJ INAK NEŽ TÝM ISTÝM TLAČIDLOM — klik
     vedľa a Esc. Do 23. 9. 2026 sa zatvárala len opätovným klikom na `+`, takže
     na mobile zakrývala pol vlákna a človek nemal kam klepnúť.
     `pointerdown` chytí aj dotyk; tlačidlo `+` je vnútri `askRef`, takže ho tento
     poslucháč minie a `onClick` prepne stav sám. */
  useEffect(() => {
    if (!add) return undefined;
    const away = (e: Event) => {
      if (!askRef.current?.contains(e.target as Node)) setAdd(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAdd(false); };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [add]);

  const shown = useMemo(() => {
    const nq = q.trim().toLowerCase();
    return nq ? chats.filter((c) => c.title.toLowerCase().includes(nq)) : chats;
  }, [chats, q]);

  /** Zmena správ AKTUÁLNEHO rozhovoru. Ostatné ostávajú, ako boli. */
  const edit = (fn: (msgs: DemoMessage[]) => DemoMessage[], title?: (c: DemoChat) => string) =>
    setChats((v) => v.map((c) => (c.id === cur
      ? { ...c, msgs: fn(c.msgs), title: title ? title(c) : c.title }
      : c)));

  const newChat = () => {
    const c: DemoChat = { id: Date.now(), day: 'today', title: 'New conversation', msgs: [] };
    setChats((v) => [c, ...v]);
    setCur(c.id);
    document.querySelector<HTMLElement>('.akv-root')?.removeAttribute('data-rail');
  };

  /* 🔴 ŽIADNY SERVER. Otázka sa pridá do miestneho stavu a odpoveď je napísaná
     (`DEMO_REPLY`) — maketa ukazuje TVAR odpovede a priznáva, že je maketa.
     Volanie `ainubis-chat` sem NEPATRÍ: živý chat je widget, ktorý beží naostro. */
  const askQ = (text: string, sources: number[] = []) => {
    const t = text.trim();
    if (!t) return;
    edit(
      (m) => [...m, { me: t }, { ai: { ...DEMO_REPLY, sources } }],
      (c) => (c.msgs.length === 0 ? t.slice(0, 44) : c.title),
    );
    setDraft('');
    toEnd();
  };

  const openForm = (kind: FormKind) => { setAdd(false); edit((m) => [...m, { form: kind }]); toEnd(); };
  const dropForm = (at: number) => edit((m) => m.filter((_, i) => i !== at));
  const sendForm = (at: number, kind: FormKind, text: string) => {
    const item = {
      kind,
      text: text.trim() || DEMO_FORMS[kind].name,
      status: 'wait' as const,
      note: `suggested for ${DEMO_FORMS[kind].circle}`,
      when: 'just now',
      verdict: demoVerdict(kind),
    };
    edit((m) => m.map((x, i) => (i === at ? { pend: item } : x)));
    setMine((v) => [item, ...v]);
    toEnd();
  };

  /** „my contributions" — zoznam sa vypíše vo vlákne, druhýkrát sa neopakuje. */
  const openMine = () => {
    document.querySelector<HTMLElement>('.akv-root')?.removeAttribute('data-rail');
    edit((m) => (m.length && 'mine' in m[m.length - 1] ? m : [...m, { mine: true }]));
    toEnd();
  };

  const waiting = mine.filter((p) => p.status === 'wait').length;

  return (
    <>
      <aside className="akc-rail" aria-label="Conversations">
        <div className="akc-railhd">
          <button type="button" className="akc-new" onClick={newChat}>+ New conversation</button>
        </div>
        <label className="akc-srch">
          <span aria-hidden>⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations…" aria-label="Search conversations" />
        </label>
        <div className="akc-list">
          {shown.map((c, i) => (
            <div key={c.id}>
              {(i === 0 || shown[i - 1].day !== c.day) && <div className="akc-day">{c.day}</div>}
              <button type="button" className="akc-item" aria-current={c.id === cur}
                onClick={() => setCur(c.id)}>
                <b>{c.title}</b>
                <em>{c.msgs.length} messages</em>
              </button>
            </div>
          ))}
          {shown.length === 0 && <div className="akc-day">nothing found</div>}
        </div>
        <div className="akc-foot">
          {/* Prispievanie do mozgu má svoj stav — čaká na Mateja, nie na server. */}
          <button type="button" className="akc-mine" onClick={openMine}>
            <span>my contributions</span><b>{waiting} pending</b>
          </button>
          <div className="akc-me">DEVOTION 2 · 12 / 569 scrolls</div>
        </div>
      </aside>

      <section className="akc-thread" aria-label="Chat">
        <header className="akc-head">
          <div className="akc-ctx">
            {/* 🔴 ŠÍPKA SPÄŤ VĽAVO HORE — CHAT je ÚLOHA (kôš 3), nie miesto: spodná
                lišta v ňom mizne a von sa ide krokom späť. Matej 23. 9. 2026. */}
            <button type="button" className="akc-back" onClick={onBack} aria-label="Back">
              <HandArrowLeft size={16} />
            </button>
            <button type="button" className="akc-railbtn"
              onClick={() => {
                const r = document.querySelector<HTMLElement>('.akv-root');
                if (r) r.dataset.rail = r.dataset.rail === 'open' ? '' : 'open';
              }}>☰ conversations</button>
          </div>
          {/* Riadok, nie rad pilulek — dôvod je v CSS nad `.akc-head`. */}
          <div className="akc-ctxline">
            knows <i>{DEMO_CONTEXT.name}</i> · {DEMO_CONTEXT.rest}
          </div>
        </header>

        <div className="akc-msgs" ref={msgsRef}>
          <div className="akc-in">
            {chat.msgs.map((m, i) => {
              if (isMe(m)) return <div className="akc-me-msg" key={i}>{m.me}</div>;
              if (isForm(m)) {
                return (
                  <ContribForm key={i} kind={m.form}
                    onSend={(t) => sendForm(i, m.form, t)} onDrop={() => dropForm(i)} />
                );
              }
              if (isPend(m)) return <PendBlock key={i} p={m.pend} />;
              if (!isAi(m)) return <MineBlock key={i} items={mine} />;
              return (
                <div className="akc-ai" key={i}>
                  <div className="akc-aihd"><i>AI</i>NUBIS</div>
                  <div className="akc-body">
                    {m.ai.paragraphs.map((p, j) => (
                      // Odseky sú NAŠE demo texty, nie vstup od človeka — jediná
                      // značka v nich je <b>. Keď sa maketa napojí na server,
                      // musí sa to nahradiť sanitizáciou alebo štruktúrou.
                      // eslint-disable-next-line react/no-danger
                      <p key={j} dangerouslySetInnerHTML={{ __html: p }} />
                    ))}
                    <div className="akc-advice"><b>do this</b>{m.ai.advice}</div>
                    {/* 🔴 JEDINÝ PÔVOD ODPOVEDE. Panel ODKIAĽ TO VIEM zanikol s tretím
                        stĺpcom (Matej 23. 9.) — tento riadok je odvtedy to JEDINÉ,
                        čím sa chat líši od každého iného chatbota. Neupratuj ho. */}
                    <div className="akc-srcrow">
                      <span>from</span>
                      {m.ai.sources.map((s) => (
                        <button type="button" key={s} onClick={() => onOpenScroll?.(s)}>
                          {DEMO_SCROLLS[s].title}
                        </button>
                      ))}
                      {/* Riadok ostáva aj bez zvitkov — maketa nehľadá a povie to. */}
                      {m.ai.sources.length === 0 && <em>the mock-up does not search the vault</em>}
                    </div>
                  </div>
                  <div className="akc-acts">
                    {/* JEDNA hlavná akcia — protokol = DOG ID (locknuté názvoslovie). */}
                    <button type="button" className="akc-act is-main">Write into DOG ID</button>
                    <button type="button" className="akc-act">Save</button>
                    <button type="button" className="akc-act">Share</button>
                  </div>
                </div>
              );
            })}
            {chat.msgs.length === 0 && (
              /* UVÍTANIE PRÁZDNEHO ROZHOVORU — ten istý blok v tichej polohe.
                 Do 23. 9. 2026 tu stála jedna veta uprostred prázdna a človek
                 nemal sa čoho chytiť. */
              <div className="akc-nform is-quiet">
                <div className="akc-eb">new conversation</div>
                <h5>What are you asking today?</h5>
                <div className="akc-nfrow">
                  {DEMO_STARTERS.map((s) => (
                    <button type="button" className="akc-pk" key={s.q}
                      onClick={() => askQ(s.q, s.sources)}>{s.q}</button>
                  ))}
                </div>
                {/* ⚠️ Medzera pred pomlčkou musí byť zapísaná (`{' — '}`) — zalomenie
                    riadku v JSX ju zožerie a text sa zliepne do „12 scrolls— and". */}
                <p className="akc-nfnote">
                  AINUBIS knows <b>{DEMO_CONTEXT.name}</b> · {DEMO_CONTEXT.rest}{' — '}
                  and answers from the vault. Every answer says where it comes from.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="akc-ask" data-add={add ? 'open' : ''} ref={askRef}>
          {/* PRISPIEVANIE DO MOZGU — `+` pri poli, nie schované v menu.
              AINUBIS predtriedi, schvaľuje Matej (nákres v5, rozhodnutie 20. 9.).
              ⚠️ BEZ EMOJI (Matej 23. 9.) — meno druhu unesie význam samo. */}
          <div className="akc-addmenu">
            <div className="akc-amlb">add to the brain</div>
            {FORM_ORDER.map((k) => (
              <button type="button" className="akc-ami" key={k} onClick={() => openForm(k)}>
                <span><b>{DEMO_FORMS[k].name}</b><em>{DEMO_FORMS[k].menuSub}</em></span>
              </button>
            ))}
          </div>
          <div className="akc-askin">
            <button type="button" className="akc-plus" aria-label="Add to the brain"
              aria-expanded={add} onClick={() => setAdd((v) => !v)}>+</button>
            <textarea placeholder="Ask anything about your dog…" aria-label="Ask AINUBIS"
              value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                /* Enter pošle, Shift+Enter zalomí — ako v každom chate. */
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askQ(draft); }
              }} />
            <button type="button" className="akc-send" aria-label="Send"
              onClick={() => askQ(draft)}>↑</button>
          </div>
        </div>
      </section>
    </>
  );
}

/* 🔴 `VaultChatSources` (panel ODKIAĽ TO VIEM nad mozgom) tu BOL a 23. 9. 2026
   ZANIKOL spolu s tretím stĺpcom. Nemazal sa bez náhrady: pôvod odpovede nesie
   riadok zdrojov pod ňou (`.akc-srcrow`) — ten je odteraz jediný a povinný. */
