// ════════════════════════════════════════════════════════════════════════════
// AINUBIS — `/pack/ainubis` = VAULT podľa nákresu v5 (2026-09-21)
// ────────────────────────────────────────────────────────────────────────────
// Zadanie `plany/zadanie-ainubis-vault-pristatie-2026-09-21.md`. Nahrádza kostru
// so siedmimi dlaždicami (commity `880f04d`, `33aa5e11`), na ktorú Matej nekývol:
// *„na ničom takom sme sa nedohodli"*. Dohodnuté bolo „AINUBIS pristáva na VAULTE"
// — a VAULT je nákres `plany/nakres-vault-fasada-v5-2026-09-20.html`, nie mriežka.
// Mriežka by sa v novembri zbúrala a ľudia by sa ju medzitým naučili (lock §0).
//
// ČO TU JE — tri osi z locku `architektura-pack.md` §1.3.1:
//   · HORE ROVINA   VAULT · CHAT · (NÁSTENKA čoskoro) — iný obsah
//   · DOLE POHĽAD   MOZOG ⇄ DOGSCROLL — ten istý obsah, iný pohľad (len mobil;
//                   na PC stoja vedľa seba 40 / 60 ako v nákrese a ako mapa + zoznam)
//   · MOZOG         plátno `components/pack/vault/brainEngine.ts` (recept JADRO)
//
// ⚠️ KÔŠ 1 — „SOM DOMA" (lock §3). AINUBIS je miesto chrbtice: lišta je vidno vždy,
//    šípka späť tu NIE JE. CHAT je kôš 3 a otvára ho `ainubisBus` ako doteraz —
//    na mobile je to celoobrazovkový panel, v ktorom lišta mizne.
// ⚠️ OBRAZOVKA JE CELÁ PLOCHA, nie stĺpec. Preto nestojí na `PackLayout` (ten dáva
//    stĺpec `PACK_COL`), ale skladá si shell sama — ten istý vzor ako `PackMap`:
//    `PackBottomNav` + `MessagingOverlayHost` ako súrodenci plochy.
// ⚠️ ŠAT JE AINUBISOV, NIE PAPYRUS. Do `PAPER_ROUTES` routa NEPATRÍ; farby sa
//    NEPÍŠU ručne, berú sa z `AINUBIS.*` (AI-PALUBA v katalógu blokov).
// ⚠️ SVETY SÚ ZAMKNUTÉ V MOZGU, NIE DLAŽDICE. Obsah zatiaľ neexistuje, takže mozog
//    ukazuje tvar, klik na svet vedie na jeho upútavku v DOGSCROLLE a stred (hlava
//    AINUBISA) otvára chat — jediné, čo dnes naozaj žije.
// ✅ ROZHODNUTÉ 22. 9. 2026 (Matej nad `plany/nakres-vault-zamok-2026-09-22.html`):
//    · „dajme B svieti celý svet" — `?zamok` zanikol, mozog svieti vždy,
//    · „správy a oznam by som dal úplne hore a pod to prepínač" + „riadok s ikonkou
//      mena ako máme v /map" → prvý riadok = `PackIdentityBar` s oznamom v strede,
//      druhý = roviny,
//    · „nazvať to dogscroll namiesto vault (vault je celá sekcia)" → ráno premenované,
//      o hodinu VRÁTENÉ (Matej: „mal si pravdu … hore bude prepínač - vault a dolu
//      namiesto list bude dogscroll/brain"). HORE ROVINA = VAULT · CHAT · BOARD (iný
//      obsah), DOLE POHĽAD = DOGSCROLL ⇄ BRAIN (ten istý obsah, iný pohľad).
// 🚩 OTVORENÉ: chat ako rovina hore + stred mozgu ako vstup (postavené podľa odporúčania).
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PackBottomNav, MessagingOverlayHost } from '@/components/pack/PackLayout';
import { PackIdentityBar } from '@/components/pack/PackIdentityBar';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import {
  PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI, STAGE_CSS,
} from '@/components/pack/packTheme';
import {
  AINUBIS, AI_GLASS, AI_BREATHE_CSS, AI_PANEL_SHADOW, AI_FOCUS, aiWorld,
} from '@/components/pack/ainubisSkin';
import { VaultChat, VAULT_CHAT_CSS } from '@/components/pack/vault/VaultChat';
import { VaultWall, VAULT_WALL_CSS } from '@/components/pack/vault/VaultWall';
import { VAULT_SOURCE_TOTALS } from '@/components/pack/vault/vaultSources';
import { openAinubis } from '@/lib/ainubisBus';
import { useT, useLang } from '@/i18n/LanguageContext';
import { VAULT_WORLDS } from '@/components/pack/vault/worlds';
import { VAULT_CIRCLES } from '@/components/pack/vault/circles';
import { mountBrain, type BrainHandle } from '@/components/pack/vault/brainEngine';
import ainubisHead from '@/assets/ainubis-head.png';
import { HandArrowLeft, HandSearch } from '@/components/pack/HandIcons';

/* ⚠️ JEDNA HRANICA — tá istá ako na mape (`PackMap`: ≤1023 = mobilný pohľad
   s pilulkou ZOZNAM). Dve čísla by znamenali šírku, kde má mapa pilulku a VAULT nie. */
const PC_MIN = 1024;
/* Rezerva pod mozgom: lišta + pilulka na mobile, len lišta na PC. Mozog sa centruje
   do plochy nad ňou (nákres: `vol = H - 110`, tam bez lišty). */
const BOTTOM_MOBILE = 160;
const BOTTOM_PC = 112;

const CSS = `
${AI_BREATHE_CSS}
${STAGE_CSS}
.akv-root{position:fixed;inset:0;overflow:hidden;background:${AINUBIS.surfaceBase};color:${AINUBIS.ink};
  font-family:${FONT_UI};--akv-panel:min(40vw,480px);}
/* Podsvietený displej, nie čierny obdĺžnik — dve mriežky ako v nákrese (.bg .mesh / .mesh8). */
.akv-bg{position:absolute;inset:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(${AINUBIS.cyanRGB},0.06) 1px,transparent 1px),
    linear-gradient(90deg,rgba(${AINUBIS.cyanRGB},0.06) 1px,transparent 1px),
    linear-gradient(rgba(${AINUBIS.cyanRGB},0.10) 1px,transparent 1px),
    linear-gradient(90deg,rgba(${AINUBIS.cyanRGB},0.10) 1px,transparent 1px);
  background-size:24px 24px,24px 24px,192px 192px,192px 192px;}
.akv-bg::after{content:'';position:absolute;inset:0;
  background:radial-gradient(60vw 60vw at 85% 10%,rgba(${AINUBIS.cyanRGB},0.14),transparent 62%),
             radial-gradient(55vw 55vw at 70% 105%,rgba(${AINUBIS.glowRGB},0.12),transparent 62%);}

/* ── MOZOG ─────────────────────────────────────────────────────────────── */
.akv-brain{position:absolute;inset:0;}
.akv-brain canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;}
.akv-tip{position:absolute;z-index:5;pointer-events:none;opacity:0;transition:opacity 120ms ease;
  transform:translate(-50%,calc(-100% - ${PACK_SPACE.md}px));max-width:260px;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  background:${AINUBIS.surface};border:1px solid ${AINUBIS.edgeStrong};box-shadow:${AINUBIS.panelShadow};
  font-size:${PACK_TEXT.label}px;line-height:1.4;color:${AINUBIS.inkDim};}
.akv-tip b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.ink};}
.akv-tip u{display:block;text-decoration:none;margin-top:${PACK_SPACE.xs}px;font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;color:${AINUBIS.ctaA};}

/* ── HORNÝ PÁS — ROVINY (vzor .trp-topbar: pás nad DOSTUPNOU šírkou) ────── */
.akv-top{position:absolute;z-index:6;top:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.md}px);
  left:${PACK_SPACE.md}px;right:${PACK_SPACE.md}px;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;
  pointer-events:none;}
.akv-top > *{pointer-events:auto;}
.akv-toprow{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;}
/* ── VÝŠKA PREPÍNAČA = VÝŠKA PREPÍNAČA NA /map (Matej 23. 9. 2026) ────────────
   Zadanie: „skúsme urobiť to aby bol header totožnej veľkosti — treba zmenšiť
   prepínače v ainubisovi". Merané na 390 px: mapa 33 px, AINUBIS mal 46.
   Dnes 35 (zvyšok je gap, ktorý mapa nemá).

   Rovnica, nie meranie po vykreslení:
     obal   4 + 4 padding + 1 + 1 border            = 10
     pilulka 4 + 4 padding + 1 + 1 border + 15 riadok = 25
                                                  spolu 35

   🔴 KĽÚČOVÉ: výšku ubralo PÍSMO, nie odsadenia. Mapa má 10 px (PACK_TEXT.micro),
   AINUBIS mal 12 — a riadok z 18 na 15 je 3 px z tých jedenástich. Preto sa zhoda
   dá dosiahnuť BEZ čísel mimo stupnice, hoci mapa sama ich používa (3 px a 5 px).
   Prvý pokus ich sem skopíroval; stráž check:pack ho zhodila a mala pravdu —
   základňa sa smie len zmenšovať. Pozor pri ďalšom ladení: ber PACK_SPACE, nie mapu. */
.akv-planes{flex:1 1 auto;min-width:0;display:flex;gap:${PACK_SPACE.xs}px;padding:${PACK_SPACE.xs}px;
  border-radius:${PACK_R.pill}px;background:${AINUBIS.surface};border:1px solid ${AINUBIS.edge};
  box-shadow:${AINUBIS.panelShadow};}
.akv-plane{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:${PACK_SPACE.xs}px;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;border:1px solid transparent;
  background:transparent;color:${AINUBIS.inkDim};cursor:pointer;white-space:nowrap;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.micro}px;line-height:15px;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;}
/* Výber je PRIESVITNÝ TINT, nie plná plocha — AINUBIS vyberá cyanom (ainubisSkin). */
.akv-plane[aria-current="page"]{color:${AINUBIS.ink};background:rgba(${AINUBIS.cyanRGB},0.16);
  border-color:${AINUBIS.edgeStrong};}
.akv-plane:disabled{cursor:default;color:${AINUBIS.inkFaint};}
.akv-plane em{font-style:normal;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.section.letterSpacing};color:${AINUBIS.inkFaint};}
.akv-when{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:0.02em;
  text-transform:uppercase;color:${AINUBIS.ctaA};background:${AINUBIS.surface};border:1px solid ${AINUBIS.ctaEdge};}
/* ⚠️ .02em, nie .22em: je to PILULKA, nie nadpis (lock dizajn-systému — tesné sledovanie
   patrí pilulkám). Pri .22em sa na 360 px vedľa správ nezmestila a zvonček vytiekol z okna.
   Mobil nesie KRÁTKE znenie (.akv-when-s) — medzi avatarom a zvončekom je ~150 px. */
.akv-when-s{display:none;}
@media (max-width:${PC_MIN - 1}px){
  .akv-when-l{display:none;} .akv-when-s{display:inline;}
  /* Riadok pod menom má na mobile ~150 px — okruhy a zvitky ostávajú len na PC. */
  .akv-top .akv-stat-x{display:none;}
  /* S ostrými číslami (1487 KM · 70 TRIPS) ostáva na 390 px pre oznam ~70 px — do jedného
     riadku sa nezmestí. Radšej ZÁMERNE dva riadky než orezané „OPENS NO…" (náhľad 22. 9.). */
  .akv-when{white-space:normal;text-align:center;line-height:1.15;border-radius:${PACK_R.tile}px;max-width:112px;}
  /* Správy a zvonček na 32 px ako v mobilnej hlavičke mapy (PackNotifications má
     rozmery v inline štýle, prebiť sa dá len !important — ten istý precedens). */
  .akv-top .pkid-right button{width:32px!important;height:32px!important;}
}

/* ── DOGSCROLL — vzor zoznamu na /map: HLAVIČKA STOJÍ, scrolluje len obsah ──
   (Matej 22. 9.: „vrch zamknutý nadpis, prepínače, filtre a scrolling len obsahy"). */
/* ── POLICA JE SKLENENÝ PANEL NAD PLÁTNOM (24. 9. 2026) ────────────────────
   Do 24. 9. to bol PLOCHÝ tmavý stĺpec: mozog vedľa neho svietil, polica nie,
   a hrana medzi nimi bola obyčajný predel. Teraz panel stojí NAD plátnom —
   presvitá cezeň a nesie na svojej hrane svetlo, takže obe polovice sú z toho
   istého prístroja. To je ten „punc" — nie viac farby, ale jedna hĺbka.
   🔴 ROZMAZANIE SI POLICA NEKRESLÍ — je to SKLENENÁ DOSKA z katalógu (.pk-stage,
      "podklad OBSAHU nad tapetou: tapetu rozmaže, ale nezakryje"). Prvý pokus mal
      vlastný backdrop-filter, stráž check:pack ho zhodila a mala pravdu.
      Farbu nesie povrch cez --pk-stage / --pk-stage-edge, presne ako to recept
      predpisuje; tu je AINUBISOVA, nie papyrusová.
   ⚠️ Doska je na PANELI, nie na kartách — rozmazanie na každej karte zvlášť je
      na mobile drahé a viditeľne seká rolovanie. */
.akv-scroll{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;overflow:hidden;
  padding-top:var(--akv-top-h,112px);border-radius:0;border-width:0 1px 0 0;
  --pk-stage:linear-gradient(180deg,rgba(7,16,25,0.92) 0%,rgba(3,7,12,0.97) 100%);
  --pk-stage-edge:rgba(${AINUBIS.cyanRGB},0.16);
  ${AI_PANEL_SHADOW}}
/* Svetelná niť na pravej hrane police — zhora jasná, dole zhasnutá. */
.akv-scroll::after{content:'';position:absolute;top:0;bottom:0;right:0;width:1px;pointer-events:none;
  background:linear-gradient(180deg,rgba(${AINUBIS.cyanRGB},0.55) 0%,rgba(${AINUBIS.cyanRGB},0.06) 55%,transparent 100%);}
.akv-lhead{flex:0 0 auto;width:100%;max-width:${520 + 2 * PACK_SPACE.lg}px;margin:0 auto;
  display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;
  padding:0 ${PACK_SPACE.lg}px ${PACK_SPACE.md}px;border-bottom:1px solid ${AINUBIS.edge};}
.akv-list{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;
  padding:${PACK_SPACE.lg}px ${PACK_SPACE.lg}px ${BOTTOM_MOBILE + PACK_SPACE.xl}px;}
.akv-col{max-width:520px;margin:0 auto;display:flex;flex-direction:column;gap:${PACK_SPACE.lg}px;}
.akv-title{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1.1;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.ink};}
.akv-claim{margin:${PACK_SPACE.xs}px 0 0;font-size:${PACK_TEXT.body}px;color:${AINUBIS.inkDim};}
/* Riadok pod menom je flex s medzerou — obal je len skupina na skrytie, nie ďalší prvok. */
.akv-stat-x{display:contents;}

/* FILTRE — tri roletky z nákresu v5 (SVET · TYP · STAV). */
.akv-filters{display:flex;gap:${PACK_SPACE.sm}px;}
.akv-dd{position:relative;flex:1 1 0;min-width:0;}
/* SVET nesie najdlhší text („Všetky svety") — na 390 px by sa pri rovnakom podiele orezal. */
.akv-dd:first-child{flex-grow:1.4;}
.akv-ddb{width:100%;display:flex;align-items:center;justify-content:space-between;gap:${PACK_SPACE.xs}px;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;border:1px solid ${AINUBIS.edge};
  background:transparent;color:${AINUBIS.inkDim};cursor:pointer;white-space:nowrap;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;}
.akv-ddb > span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.akv-ddb:disabled .akv-chev{opacity:0.35;}
.akv-ddb .akv-chev{flex:0 0 auto;display:inline-flex;transform:rotate(-90deg);opacity:0.8;}
.akv-dd.is-set .akv-ddb,.akv-dd.is-open .akv-ddb{color:${AINUBIS.cyan};border-color:${AINUBIS.edgeStrong};
  background:rgba(${AINUBIS.cyanRGB},0.14);}
.akv-ddb:disabled{cursor:default;color:${AINUBIS.inkFaint};}
.akv-ddp{position:absolute;z-index:9;top:calc(100% + ${PACK_SPACE.xs}px);left:0;min-width:100%;max-height:320px;overflow-y:auto;
  padding:${PACK_SPACE.xs}px;border-radius:${PACK_R.tile}px;background:${AINUBIS.bg};
  border:1px solid ${AINUBIS.edgeStrong};box-shadow:${AINUBIS.panelShadow};}
.akv-ddp button{display:flex;width:100%;align-items:center;gap:${PACK_SPACE.sm}px;text-align:left;white-space:nowrap;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.field}px;border:1px solid transparent;
  background:transparent;color:${AINUBIS.inkDim};cursor:pointer;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;}
.akv-ddp button:hover{background:rgba(${AINUBIS.cyanRGB},0.10);color:${AINUBIS.cyan};}
.akv-ddp button[aria-selected="true"]{color:${AINUBIS.cyan};}

/* HĽADANIE — vzor .trp-mapsearch. Písmo 16 px: pod ním iOS pri ťuknutí priblíži stránku. */
.akv-search{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;min-width:0;
  padding:0 ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;color:${AINUBIS.inkFaint};
  ${AI_GLASS}}
.akv-search:focus-within{${AI_FOCUS}}
.akv-search input{flex:1 1 auto;min-width:0;background:transparent;border:0;outline:0;
  padding:${PACK_SPACE.sm}px 0;color:${AINUBIS.ink};font-family:${FONT_UI};font-size:${PACK_TEXT.lead}px;}
.akv-search input::placeholder{color:${AINUBIS.inkFaint};}
/* Natívny krížik prehliadača = holý znak mimo brandu (pole NOT IN THE BRAND). */
.akv-search input::-webkit-search-cancel-button{-webkit-appearance:none;display:none;}
.akv-empty{margin:0;text-align:center;font-size:${PACK_TEXT.body}px;color:${AINUBIS.inkFaint};}

/* VRSTVY — PRAVÝ KRAJ nad mozgom, vzor /map (.trp-ctlstack + .trp-layersdd):
   okrúhle tlačidlo, panel sa otvára DOĽAVA. Farebná bodka = farba vrstvy v mozgu. */
.akv-ctl{position:absolute;z-index:6;right:${PACK_SPACE.md}px;top:var(--akv-top-h,112px);}
.akv-ctlbtn{width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;
  border-radius:${PACK_R.pill}px;background:${AINUBIS.surface};border:1px solid ${AINUBIS.edge};box-shadow:${AINUBIS.panelShadow};}
.akv-ctlbtn i{width:18px;height:18px;background:${AINUBIS.inkDim};
  -webkit-mask:url(/icons/pack/layers.svg) center/contain no-repeat;mask:url(/icons/pack/layers.svg) center/contain no-repeat;}
.akv-ctlbtn[aria-expanded="true"]{border-color:${AINUBIS.edgeStrong};background:rgba(${AINUBIS.cyanRGB},0.16);}
.akv-ctlbtn[aria-expanded="true"] i{background:${AINUBIS.cyan};}
.akv-lpanel{position:absolute;top:0;right:calc(100% + ${PACK_SPACE.sm}px);width:220px;display:flex;flex-direction:column;
  gap:${PACK_SPACE.xs}px;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;background:${AINUBIS.bg};
  border:1px solid ${AINUBIS.edgeStrong};box-shadow:${AINUBIS.panelShadow};}
.akv-lpanel > b{margin:0 0 ${PACK_SPACE.xs}px ${PACK_SPACE.xs}px;font-weight:500;font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akv-lyr{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;width:100%;text-align:left;white-space:nowrap;cursor:pointer;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.field}px;border:1px solid transparent;
  background:transparent;color:${AINUBIS.inkDim};font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.body}px;}
.akv-lyr u{width:8px;height:8px;flex:0 0 auto;border-radius:${PACK_R.pill}px;text-decoration:none;}
.akv-lyr em{margin-left:auto;font-style:normal;font-size:${PACK_TEXT.micro}px;color:${AINUBIS.inkFaint};}
.akv-lyr[aria-pressed="true"]{color:${AINUBIS.cyan};background:rgba(${AINUBIS.cyanRGB},0.16);border-color:${AINUBIS.edgeStrong};}
.akv-lyr:disabled{cursor:default;color:${AINUBIS.inkFaint};}
.akv-lyr:disabled u{opacity:0.45;}

/* PC — riadok hľadanie + roletky pod hlavičkou (vzor .trp-topsearchrow). */
.akv-ptools{display:none;}
.akv-lhead-row{display:flex;align-items:flex-start;justify-content:space-between;gap:${PACK_SPACE.md}px;}

/* MOBIL — riadok hľadanie + FILTRE (vzor .trp-mheader-row2) a šuplík filtrov (.trp-msheet). */
.akv-mtools{display:none;}
.akv-fbtn{flex:0 0 auto;display:flex;align-items:center;gap:${PACK_SPACE.xs}px;white-space:nowrap;cursor:pointer;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;border:1px solid ${AINUBIS.edge};
  background:${AINUBIS.surface};color:${AINUBIS.inkDim};font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;}
.akv-fbtn i{width:14px;height:14px;background:currentColor;
  -webkit-mask:url(/icons/pack/sliders.svg) center/contain no-repeat;mask:url(/icons/pack/sliders.svg) center/contain no-repeat;}
.akv-fbtn.is-set{color:${AINUBIS.cyan};border-color:${AINUBIS.edgeStrong};background:rgba(${AINUBIS.cyanRGB},0.14);}
.akv-sback{position:fixed;inset:0;z-index:960;background:rgba(0,0,0,0.55);}
.akv-sheet{position:fixed;left:0;right:0;bottom:0;z-index:961;max-height:86vh;overflow-y:auto;
  display:flex;flex-direction:column;gap:${PACK_SPACE.lg}px;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px calc(env(safe-area-inset-bottom,0px) + ${PACK_SPACE.xl}px);
  border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;background:${AINUBIS.bg};border-top:1px solid ${AINUBIS.edgeStrong};}
.akv-grab{align-self:center;width:40px;height:4px;border:0;padding:0;cursor:pointer;border-radius:${PACK_R.pill}px;background:${AINUBIS.edge};}
.akv-sttl{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:${PACK_HEAD.card.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.ink};}
.akv-sgrp{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.akv-sgrp > b{font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.section.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akv-sgrp > b em{font-style:normal;letter-spacing:0.02em;text-transform:none;}
.akv-chips{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.akv-chip{padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  border:1px solid ${AINUBIS.edge};background:transparent;color:${AINUBIS.inkDim};font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;}
.akv-chip[aria-pressed="true"]{color:${AINUBIS.cyan};border-color:${AINUBIS.edgeStrong};background:rgba(${AINUBIS.cyanRGB},0.16);}
.akv-chip:disabled{cursor:default;color:${AINUBIS.inkFaint};}
/* VCHOD DO ZDROJOV — TRETÍ Z TROCH (voľba E2, Matej 24. 9. 2026). Stojí v päte
   DOGSCROLLU zámerne: vidí ho aj ten, kto nikdy neprispeje ani sa nič nespýta,
   a to je jediné, čím sa AINUBIS líši od chatbota. Sám o sebe to NIE JE miesto
   (to je /pack/ainubis/sources), je to dvere. */
.akv-entry{display:flex;align-items:center;gap:${PACK_SPACE.md}px;width:100%;text-align:left;cursor:pointer;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;border-radius:${PACK_R.tile}px;
  border:1px dashed ${AINUBIS.edge};background:rgba(3,7,12,0.30);color:${AINUBIS.inkDim};
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;line-height:1.4;}
.akv-entry:hover{border-color:${AINUBIS.edgeStrong};}
.akv-entry b{margin-left:auto;display:flex;align-items:center;gap:${PACK_SPACE.xs}px;
  font-weight:500;color:${AINUBIS.cyan};white-space:nowrap;}
.akv-entry b .akv-chev{display:inline-flex;transform:rotate(180deg);}

/* UPÚTAVKA SVETA — tvar budúceho úvodu sveta (.wintro v nákrese), lock §4.1: jedna karta. */
/* ── KARTA SVETA — AI-SKLO (Matej 24. 9. 2026) ─────────────────────────────
   *„postaraj sa o rebrand aj vaultu zvýrazni to urob hlbku tieň, punc
   futurickosti … je rok 2050"*. Karta mala plochý lem a jeden tieň, čo je presne
   to, čo na nástenke prestalo platiť — VAULT je predloha a nesmie byť posledný,
   kto nosí starý materiál. Ten istý odliatok, ten istý dosvit sveta.
   ⚠️ --ai-w nesie karta zo zoznamu svetov, takže polica dostane sedem odtieňov
      a dá sa čítať farbou pri rolovaní. */
.akv-world{position:relative;text-align:center;scroll-margin-top:${PACK_SPACE.lg}px;
  padding:${PACK_SPACE.xl}px ${PACK_SPACE.lg}px;border-radius:${PACK_R.card}px;
  transition:transform 200ms ease;${AI_GLASS}}
/* Vnútorný svit pod ikonkou — karta nie je doska, je to OKNO do sveta.
   Radiálu kreslí pseudoprvok, aby neprepísal vrstvy odliatku. */
.akv-world::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:radial-gradient(60% 40% at 50% 22%,rgba(var(--ai-w,${AINUBIS.cyanRGB}),0.10),transparent 70%);}
.akv-world > *{position:relative;z-index:1;}
.akv-world:hover{transform:translateY(-2px);}
/* ⚠️ Zvýraznenie po skoku z mozgu NEMÔŽE byť border-color — lem je gradient
   cez border-box a jedna farba by ho zmazala aj s dosvitom. Nesie ho prstenec. */
.akv-world.is-flash{outline:1px solid ${AINUBIS.cyan};outline-offset:-1px;}
.akv-wlbl{font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${AINUBIS.cyan};}
/* IKONKA cez MASKU, nie filter — filter farbu hádá (feedback_filter_aproximuje_masku). */
/* ⚠️ Ikonka ostáva ZLATÁ. Skúšal som ju prefarbiť na farbu sveta a polica sa
   rozpadla na sedem rôznych značiek — zlatá je to, čo z nich robí JEDEN zoznam.
   Farbu sveta nesie dosvit karty, nie kresba v nej. */
.akv-wic{width:44px;height:44px;margin:${PACK_SPACE.md}px auto 0;background:${AINUBIS.ctaGrad};
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;
  -webkit-mask-size:contain;mask-size:contain;}
.akv-wname{margin:${PACK_SPACE.md}px 0 0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h2}px;line-height:1.2;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.ink};overflow-wrap:anywhere;}
.akv-wtease{margin:${PACK_SPACE.sm}px auto 0;max-width:40ch;font-size:${PACK_TEXT.body}px;line-height:1.55;color:${AINUBIS.inkDim};}
.akv-wsoon{display:inline-block;margin-top:${PACK_SPACE.lg}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;
  border-radius:${PACK_R.pill}px;font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.section.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.inkDim};border:1px solid ${AINUBIS.edge};}

/* ── POHĽAD DOLE — pilulka nad lištou (lock §1.3.1, geometria .trp-mactions) ──
   ⚠️ Číslo je OPÍSANÉ z PackMap.tsx, lebo register spodného pásu (nástenka r-pas)
   ešte neexistuje. Keď vznikne, táto pilulka ide doň ako prvá — nie ako ďalší
   nezávislý prilepený prvok.
   ⚠️ ŽIADNE spätné apostrofy v komentároch — sú vnútri template literálu CSS. */
.akv-mactions{position:absolute;z-index:7;left:50%;transform:translateX(-50%);
  bottom:calc(env(safe-area-inset-bottom,0px) + 87px + var(--pack-medal-rise, 0px) + 4px);}
/* Prepínač NIE JE výzva k akcii: pilulka 999 BEZ dosvitu (lock §1.3.1). */
.akv-mtoggle{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;cursor:pointer;white-space:nowrap;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.xl}px;border-radius:${PACK_R.pill}px;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:${PACK_HEAD.card.letterSpacing};
  text-transform:uppercase;background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};border:1px solid ${AINUBIS.ctaEdge};}
.akv-mtoggle i{width:16px;height:16px;flex:0 0 auto;background:${AINUBIS.ctaInk};
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;
  -webkit-mask-size:contain;mask-size:contain;}

/* Mobil: pohľady sa striedajú, DOGSCROLL prekrýva mozog. */
.akv-root[data-view="brain"] .akv-scroll{display:none;}
/* Nad pásom kariet dostane horný pás podklad — inak cez medzeru medzi jeho riadkami
   presvitá text karty, ktorá pod ním odchádza (snímka 21. 9., 390 px). */
/* Od 22. 9. je hlavička dvojriadková a mozog svieti celý — podklad dostáva VŽDY,
   inak cez avatar a zvonček bežia vlákna a nápisy okruhov. */
.akv-top::before{content:'';position:absolute;z-index:-1;pointer-events:none;
  left:-${PACK_SPACE.xl}px;right:-${PACK_SPACE.xl}px;bottom:-${PACK_SPACE.lg}px;
  top:calc(-1 * (env(safe-area-inset-top,0px) + ${PACK_SPACE.xl}px));
  background:linear-gradient(180deg,${AINUBIS.bg} 72%,transparent);}
@media (max-width:${PC_MIN - 1}px){
  /* Mobil ako /map: ĽAVÁ HLAVIČKA NEEXISTUJE (bez nadpisu a podnadpisu), hľadanie
     a filtre sú v hornom páse, zoznam začína hneď pod ním (Matej 22. 9.). */
  .akv-lhead{display:none;}
  .akv-mtools{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;}
  .akv-mtools .akv-search{flex:1 1 auto;}
  .akv-root[data-view="scroll"] .akv-ctl{display:none;}
  .akv-root[data-view="scroll"] .akv-top::before{content:'';position:absolute;z-index:-1;pointer-events:none;
    left:-${PACK_SPACE.md}px;right:-${PACK_SPACE.md}px;bottom:-${PACK_SPACE.md}px;
    top:calc(-1 * (env(safe-area-inset-top,0px) + ${PACK_SPACE.md}px));
    background:linear-gradient(180deg,${AINUBIS.bg} 78%,transparent);}
}

/* ── PC: 40 / 60 vedľa seba, pás len nad pravou plochou (nákres, rozhodnutie 2) ── */
@media (min-width:${PC_MIN}px){
  .akv-scroll,.akv-root[data-view="brain"] .akv-scroll{display:flex;right:auto;width:var(--akv-panel);
    padding-top:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.xl}px);
    border-right:1px solid ${AINUBIS.edge};}
  .akv-lhead{max-width:none;padding:0 ${PACK_SPACE.xl}px ${PACK_SPACE.lg}px;gap:${PACK_SPACE.lg}px;}
  .akv-list{padding:${PACK_SPACE.lg}px ${PACK_SPACE.xl}px ${BOTTOM_PC + PACK_SPACE.xl}px;}
  /* Roviny sa na PC presťahovali do ľavého bloku (Matej 22. 9.).
     🔒 Matej 23. 9. 2026: OSTÁVA TAK, presun hore aj na PC zamietnutý. Rovina mení
     obsah ĽAVÉHO bloku, tak stojí pri ňom; hore je na mobile len preto, že tam ľavý
     stĺpec neexistuje. Pravidlo „hore prepínam ROVINU" (lock §1.3.1) je o mobile. */
  .akv-toprow{display:none;}
  .akv-ctl{right:${PACK_SPACE.xl}px;}
  .akv-ptools{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;}
  .akv-ptools .akv-search{flex:1 1 320px;max-width:420px;}
  .akv-ptools .akv-filters{flex:0 1 480px;}
  .akv-brain{left:var(--akv-panel);}
  .akv-top{left:calc(var(--akv-panel) + ${PACK_SPACE.xl}px);right:${PACK_SPACE.xl}px;top:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.xl}px);}
  .akv-mactions{display:none;}
}
`;

type View = 'brain' | 'scroll';

/* VRSTVY z nákresu v5 §11 — farba bodky = farba, ktorou vrstva kreslí mozog.
   ⚠️ Žije len POSTUP. Ostatné tri potrebujú obsah (zvitky), DOG ID pravidlo a Zem —
   kým ich nie je, sú viditeľné, ale zamknuté so „soon", nie tvária sa funkčne. */
const LAYERS = [
  { k: 'progress', en: 'Progress', rgb: '245,199,61', live: true },
  { k: 'myDog', en: 'My dog', rgb: '178,86,64', live: false },
  { k: 'origin', en: 'Origin', rgb: '91,224,240', live: false },
  { k: 'pack', en: 'Pack', rgb: '59,158,255', live: false },
] as const;
/* Súčty z rozpadu svetov — mozog z nich berie hustotu, hlavička ich ukazuje ako menovateľ. */
const TOTAL_CIRCLES = VAULT_WORLDS.reduce((s, w) => s + w.circles, 0);
const TOTAL_SCROLLS = VAULT_WORLDS.reduce((s, w) => s + w.scrolls, 0);

// ── STAV UČENIA V MOZGU JE DNES ATRAPA ───────────────────────────────────────
// Farby (modrá nedotknuté · žltá videné · zelená prečítané) sú Matejovo rozhodnutie
// z 19. 9. 2026, potvrdené 24. 9. Legenda je postavená, ÚDAJ POD ŇOU NIE JE:
// `/pack` nikde neukladá, ktorý zvitok kto prečítal, a zvitky sa ešte len píšu
// (otvorenie: november 2026).
//
// 🔴 PRETO JE ATRAPA TU, A NIE V ENGINE. V `brainEngine.ts` by sa tvárila ako
//    mechanika a ticho prežila aj deň, keď stav vznikne naozaj. Tu je vidieť, že
//    je to jedna funkcia na výmenu: keď pribudne tabuľka prečítaných, nahradí sa
//    TOTO a v engine sa nemení nič.
// ⚠️ Krok je PEVNÝ, nie náhodný. Pri `Math.random()` by mozog pri každom otvorení
//    vyzeral inak a nedalo by sa povedať, či sa zmenil stav, alebo len seed.
//    [[feedback_seed_pri_otvoreni_meni_meranu_hodnotu]]
// ⚠️ Podiel drží nákres z 20. 9.: každé 7. zrno prečítané, každé 13. videné —
//    teda ~14 % a ~8 %. Mozog má vyzerať ROZČÍTANE, nie zelene.
const demoProgress = (zi: number): 0 | 1 | 2 =>
  (zi % 7 === 0 ? 2 : zi % 13 === 5 ? 1 : 0);

export default function PackAinubis() {
  const t = useT();
  const tx = (key: string, fallback: string) => {
    const v = t(key);
    return v === key ? fallback : v;
  };
  const id = usePackIdentity();
  const { lang } = useLang();
  const [view, setView] = useState<View>('brain');
  /* ROVINA — VAULT alebo CHAT (maketa). 🔴 LEN V DEVE: v produkčnom builde CHAT
     naďalej otvára živý panel `AinubisWidget`, ktorý beží naostro. Maketa je
     rozostavaná vec za zamknutými dverami, nie náhrada fungujúceho chatu. */
  const CHAT_MOCK = import.meta.env.DEV;
  /* NÁSTENKA = rovina 3, maketa z 24. 9. 2026 (voľby A1 · B2 · C2 · D2 · E2 · F1).
     Naostro ostáva pilulka zamknutá so „soon" — rozostavaná vec stojí za
     zamknutými dverami, rovnako ako chat. */
  const WALL_MOCK = import.meta.env.DEV;
  /* Zoznam zdrojov (`/pack/ainubis/sources`) je súčasť tej istej makety — jeho
     tri vchody sa preto zapínajú spolu s ňou, nie zvlášť. */
  const SOURCES_MOCK = import.meta.env.DEV;
  /* 🔴 ROVINA ŽIJE V ADRESE (`?plane=wall`), nie len v stave komponentu.
     Premerané 24. 9. 2026: zo zdrojov (`/pack/ainubis/sources`) sa človek šípkou
     vracal na `/pack/ainubis` — a pristál vo VAULTE, hoci odišiel z NÁSTENKY.
     Stav komponentu prechod cez inú adresu neprežije. Query parameter ho prežije,
     a navyše sa dá rovina poslať odkazom a prežije obnovenie stránky.
     ⚠️ Parameter sa pridáva DO EXISTUJÚCICH, nie namiesto nich — `setSearchParams({…})`
        by zmazal všetko ostatné, čo na adrese je. */
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const planeParam = sp.get('plane');
  const [plane2, setPlane2] = useState<'vault' | 'chat' | 'wall'>(
    planeParam === 'wall' && WALL_MOCK ? 'wall'
      : planeParam === 'chat' && CHAT_MOCK ? 'chat'
        : 'vault',
  );
  /* Záložka nástenky žije v adrese z toho istého dôvodu ako rovina: riadok
     „odkiaľ to viem" pod odpoveďou a vchod z VAULTU vedú rovno do KNIŽNICE,
     a keby to bol len stav komponentu, F5 by človeka hodilo na svorku. */
  const tabParam = sp.get('tab');
  const [wallTab, setWallTab] = useState<'pack' | 'mine' | 'lib'>(
    tabParam === 'mine' || tabParam === 'lib' ? tabParam : 'pack',
  );
  const setQuery = (patch: Record<string, string | null>) => {
    const q = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(patch)) { if (v === null) q.delete(k); else q.set(k, v); }
    setSp(q, { replace: true });
  };
  const goPlane = (next: 'vault' | 'chat' | 'wall') => {
    setPlane2(next);
    setQuery({ plane: next === 'vault' ? null : next, tab: null });
  };
  const pushedPost = useRef(false);
  const goWallTab = (t: 'pack' | 'mine' | 'lib') => {
    setWallTab(t);
    /* ⚠️ Zmaže aj otvorenú kartu — a NEvracia sa históriou. Záznam s `?post=`
       sa tým prepíše, takže SPÄŤ vedie na nástenku pred otvorením, nie znova
       do prekryvu. Preto sa musí zabudnúť aj príznak, že sme pushli. */
    pushedPost.current = false;
    setQuery({ tab: t === 'pack' ? null : t, post: null });
  };
  /* 🔴 OTVORENÁ KARTA SA PUSHUJE, NEZAMIEŇA (voľba E1, 24. 9. 2026).
     Rovina a záložka idú cez `replace` zámerne — prepínanie pohľadu nemá
     zaplniť históriu. Otvorenie karty je OPAK: prekryv sa musí dať zavrieť
     tlačidlom SPÄŤ v prehliadači, a to vie len zápis do histórie.
     ⚠️ Pri príchode ODKAZOM (`?post=w1` ako prvá adresa) sme nič nepushli —
        `history.back()` by človeka vyhodil z appky. Preto si pamätáme, či sme
        pushli my, a inak parameter len odoberieme. */
  const postParam = sp.get('post');
  const goPost = (id: string | null) => {
    if (id) {
      const q = new URLSearchParams(sp);
      q.set('post', id);
      setSp(q);                       // push — späť prekryv zavrie
      pushedPost.current = true;
      return;
    }
    if (pushedPost.current) { pushedPost.current = false; navigate(-1); return; }
    setQuery({ post: null });
  };
  /** Vchod do KNIŽNICE z chatu aj z päty VAULTU — jedno miesto, tri dvere. */
  const openLibrary = () => {
    setPlane2('wall');
    setWallTab('lib');
    setQuery({ plane: 'wall', tab: 'lib' });
  };
  const [flash, setFlash] = useState<string | null>(null);
  /* Filter SVET: -1 = všetky. Roletka otvorená: kľúč alebo null. */
  const [wf, setWf] = useState(-1);
  const [dd, setDd] = useState<string | null>(null);
  /* Hľadanie nad menami a upútavkami svetov; vrstvy (panel pri pravom kraji); šuplík filtrov (mobil). */
  const [q, setQ] = useState('');
  const [lyrOpen, setLyrOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    if (!dd) return;
    const close = () => setDd(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [dd]);

  const rootRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const brain = useRef<BrainHandle | null>(null);
  const ready = !id.loading && !!id.session;

  const names = useMemo(
    () => VAULT_WORLDS.map((w) => tx(`pack.ainubis.world.${w.key}`, w.en)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );
  /* Plátno sa mountuje RAZ — jeho callbacky preto čítajú aktuálne mená a jazyk z refu. */
  /* Mená okruhov: SK pre slovenčinu, inak EN (návrh) — `vault/circles.ts`. */
  const circleName = (wi: number, oi: number) => {
    const c = VAULT_CIRCLES[VAULT_WORLDS[wi].key]?.[oi];
    return c ? (lang === 'sk' ? c.sk : c.en) : '';
  };
  const live = useRef({ names, tx, circleName });
  live.current = { names, tx, circleName };

  const openWorld = (wi: number) => {
    const key = VAULT_WORLDS[wi].key;
    /* Klik na svet v mozgu ukáže jeho kartu — filter iného sveta by ju skryl. */
    setWf(-1);
    /* Od 22. 9. klik na uzol mozog PRIBLÍŽI a vycentruje (brainEngine focus). Na PC stojí
       zoznam vedľa, takže karta sa len dorolovaním rozsvieti; na mobile by prepnutie na
       zoznam priblíženie hneď schovalo — tam sa ku karte ide pilulkou DOGSCROLL. */
    if (window.innerWidth < PC_MIN) { setFlash(key); window.setTimeout(() => setFlash((f) => (f === key ? null : f)), 1400); return; }
    setView('scroll');
    setFlash(key);
    /* Až po vykreslení: na mobile je DOGSCROLL do tejto chvíle `display:none`. */
    requestAnimationFrame(() => {
      document.getElementById(`akv-w-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    window.setTimeout(() => setFlash((f) => (f === key ? null : f)), 1400);
  };
  const openWorldRef = useRef(openWorld);
  openWorldRef.current = openWorld;

  // ── MOZOG — mount raz, keď je plátno v DOM ────────────────────────────────
  useEffect(() => {
    const cv = cvRef.current, tip = tipRef.current;
    if (!ready || !cv || !tip) return;
    const isPc = () => window.innerWidth >= PC_MIN;
    brain.current = mountBrain({
      canvas: cv,
      tip,
      worlds: VAULT_WORLDS,
      head: ainubisHead,
      isMobile: () => !isPc(),
      worldName: (wi) => live.current.names[wi],
      circleName: (wi, oi) => live.current.circleName(wi, oi),
      insets: () => ({
        top: (topRef.current?.getBoundingClientRect().bottom ?? 0) + PACK_SPACE.sm,
        /* Cookie lišta sa NEPRIPOČÍTAVA — od 22. 9. obsah prekrýva, neposúva. */
        bottom: isPc() ? BOTTOM_PC : BOTTOM_MOBILE,
      }),
      describe: (role, wi, oi) => {
        const { names: n, tx: x, circleName: cn } = live.current;
        if (role === 'root') return { title: 'AINUBIS', hint: x('pack.ainubis.tip.home', 'Back to the whole brain') };
        /* Okruh má vlastné meno; zvitok zatiaľ nie (Matej: „ďalej už nie"). */
        return {
          title: role === 'o' ? (cn(wi, oi) || n[wi]) : n[wi],
          sub: role === 'o' ? `${n[wi]} · ${x('pack.ainubis.tip.circle', 'A chapter being written')}`
            : x('pack.ainubis.tip.scroll', 'A scroll being written'),
          hint: x('pack.ainubis.opening', 'Expected opening: November 2026'),
        };
      },
      onWorld: (wi) => openWorldRef.current(wi),
      onRoot: openAinubis,
      progress: demoProgress,
    });
    const ro = new ResizeObserver(() => brain.current?.resize());
    ro.observe(cv);
    return () => { ro.disconnect(); brain.current?.destroy(); brain.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  /* Výška horného pásu ide von ako premenná — DOGSCROLL na mobile začína pod ním,
     nie pod odhadnutým číslom. */
  useEffect(() => {
    const top = topRef.current, root = rootRef.current;
    if (!ready || !top || !root) return;
    const pub = () => root.style.setProperty('--akv-top-h', `${Math.round(top.getBoundingClientRect().bottom) + PACK_SPACE.md}px`);
    pub();
    const ro = new ResizeObserver(pub);
    ro.observe(top);
    return () => ro.disconnect();
  }, [ready]);

  if (!ready) return <div className="akv-root" style={{ position: 'fixed', inset: 0, background: AINUBIS.surfaceBase }} />;

  const plane = (key: 'vault' | 'chat' | 'wall', en: string) => tx(`pack.ainubis.plane.${key}`, en);
  const mask = (ic: string) => ({ WebkitMaskImage: `url(/icons/pack/${ic}.svg)`, maskImage: `url(/icons/pack/${ic}.svg)` });
  const soon = tx('pack.ainubis.soon', 'soon');

  /* ROVINY — jeden render, dve miesta: mobil hore pod identitou, PC v ľavom bloku. */
  const planes = (cls: string) => (
    <nav className={`akv-planes ${cls}`} aria-label="AINUBIS">
      <button type="button" className="akv-plane" aria-current={plane2 === 'vault' ? 'page' : undefined}
        onClick={() => goPlane('vault')}>{plane('vault', 'Vault')}</button>
      {/* CHAT = kôš 3. V PRODUKCII sa otvára tým istým kanálom ako doteraz
          (`ainubisBus`), takže beží presne ten chat, ktorý žije naostro.
          V DEVE sa prepne na MAKETU podľa nákresu v5 (`VaultChat`). */}
      <button type="button" className="akv-plane" aria-current={plane2 === 'chat' ? 'page' : undefined}
        onClick={() => (CHAT_MOCK ? goPlane('chat') : openAinubis())}>{plane('chat', 'Chat')}</button>
      {/* „čoskoro" len v tooltipe — v SK „NÁSTENKA ČOSKORO" pretiekla z pilulky (390 px aj PC 40 %). */}
      <button type="button" className="akv-plane" aria-current={plane2 === 'wall' ? 'page' : undefined}
        disabled={!WALL_MOCK} title={WALL_MOCK ? undefined : soon}
        onClick={() => goPlane('wall')}>{plane('wall', 'Board')}</button>
    </nav>
  );

  /* ROLETKA — SVET žije (filtruje karty), TYP a STAV čakajú na zvitky. */
  const chev = <span className="akv-chev" aria-hidden><HandArrowLeft size={12} /></span>;
  const worldOpts = [tx('pack.ainubis.filter.allWorlds', 'All worlds'), ...names];
  const worldDd = (
    <div className={`akv-dd${wf >= 0 ? ' is-set' : ''}${dd === 'world' ? ' is-open' : ''}`}>
      <button type="button" className="akv-ddb" aria-haspopup="listbox" aria-expanded={dd === 'world'}
        onClick={(e) => { e.stopPropagation(); setDd((d) => (d === 'world' ? null : 'world')); }}>
        <span>{worldOpts[wf + 1]}</span>{chev}
      </button>
      {dd === 'world' && (
        <div className="akv-ddp" role="listbox">
          {worldOpts.map((o, i) => (
            <button key={o} type="button" role="option" aria-selected={wf === i - 1}
              onClick={() => { setWf(i - 1); setDd(null); }}>{o}</button>
          ))}
        </div>
      )}
    </div>
  );
  const lockedDd = (key: string, en: string) => (
    <div className="akv-dd">
      <button type="button" className="akv-ddb" disabled title={soon}>
        <span>{tx(`pack.ainubis.filter.${key}`, en)}</span>{chev}
      </button>
    </div>
  );

  /* Hľadá bez ohľadu na diakritiku a veľkosť písmen — „vyziva" nájde VÝŽIVU. */
  const norm = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const nq = norm(q.trim());
  const shown = VAULT_WORLDS.map((w, i) => ({ w, i })).filter(({ w, i }) => (wf < 0 || wf === i)
    && (!nq || norm(`${names[i]} ${tx(`pack.ainubis.tease.${w.key}`, w.tease)}`).includes(nq)));
  const onSearch = (v: string) => {
    setQ(v);
    /* Výsledok hľadania je zoznam — na mobile sa naň prepne sám. */
    if (v.trim()) setView('scroll');
  };
  const search = (
    <label className="akv-search">
      <HandSearch size={14} />
      <input
        type="search"
        value={q}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={tx('pack.ainubis.search', 'Search the Vault…')}
        aria-label={tx('pack.ainubis.search', 'Search the Vault…')}
      />
    </label>
  );
  const filtersLabel = wf >= 0 ? t('pack.map.filtersCount', { n: 1 }) : t('pack.map.filters');
  /* Postup vo VAULTE — dnes nula, lebo žiadny svet ešte nie je otvorený. Keď pribudne
     čítanie, čísla prídu z neho; menovatele sú súčty z rozpadu svetov.
     🔒 Matej 23. 9. 2026: menovatele 62 okruhov / 569 zvitkov OSTÁVAJÚ viditeľné aj
     predtým, než je rozpad svetov odsúhlasený — sú to CIEĽOVÉ čísla, nie stav.
     Zamietnuté boli obe úľavy: skrytie menovateľov („0 svetov · 0 okruhov") aj
     orezanie PC na svety + %. Keď sa rozpad zmení, zmení sa číslo — to je v poriadku. */
  const read = { worlds: 0, circles: 0, scrolls: 0 };
  const pct = Math.round((read.scrolls / Math.max(1, TOTAL_SCROLLS)) * 100);
  /* 🔴 HLAVIČKA = SVETY A %, BEZ MENA (Matej 23. 9. 2026).
     Prvé zadanie: *„ainubis nebude mať pri fotka meno ale počet svetov a okruhov"*,
     spresnené o hodinu: *„ok daj len svety a %"*. Dva riadky s číslami — presne ako
     mapa (`1516,1 KM` / `73 VÝLETOV`), ktorá je podľa toho istého zadania vzorom.
     ⚠️ OKRUHY A ZVITKY TÝM NEZANIKAJÚ. Ráno 23. 9. bolo rozhodnuté, že ich
        menovatele (62 / 569) ostávajú viditeľné — to platí o ZOZNAME a rozpade
        svetov, nie o hlavičke. Hlavička je identita, nie prehľad. */
  const vaultPrimary = (
    <>{read.worlds}/{VAULT_WORLDS.length} {tx('pack.ainubis.stat.worlds', 'worlds')}</>
  );
  const vaultStats = (<><b>{pct} %</b></>);

  return (
    <div className="akv-root" ref={rootRef} data-view={view} data-plane={plane2}>
      <style>{CSS}</style>
      {CHAT_MOCK && <style>{VAULT_CHAT_CSS}</style>}
      {WALL_MOCK && <style>{VAULT_WALL_CSS}</style>}
      <div className="akv-bg" aria-hidden />

      {/* ── MOZOG ─────────────────────────────────────────────────────────── */}
      <section className="akv-brain" aria-label={tx('pack.ainubis.view.brain', 'Brain')}>
        <canvas ref={cvRef} />
        <div className="akv-tip" ref={tipRef} role="status" />
        {/* ⚠️ Tlačidlá + − ⤾ z nákresu tu NIE SÚ: kit má len plus, mínus ani „späť na
            celok" nemá, a holý znak je brandový dlh (pole NOT IN THE BRAND). Priblíženie
            ide kolieskom a dvoma prstami, oddialenie na východisko mozog samo vycentruje.
            Kresby si treba vypýtať od Mateja. */}
        <div className="akv-ctl">
          <button type="button" className="akv-ctlbtn" aria-expanded={lyrOpen} aria-haspopup="true"
            aria-label={tx('pack.ainubis.layers', 'Layers')} title={tx('pack.ainubis.layers', 'Layers')}
            onClick={(e) => { e.stopPropagation(); setLyrOpen((v) => !v); }}>
            <i aria-hidden />
          </button>
          {lyrOpen && (
            <>
              <span style={{ position: 'fixed', inset: 0, zIndex: -1 }} onClick={() => setLyrOpen(false)} aria-hidden />
              <div className="akv-lpanel" role="group" aria-label={tx('pack.ainubis.layers', 'Layers')}>
                <b>{tx('pack.ainubis.layers', 'Layers')}</b>
                {LAYERS.map((l) => (
                  <button key={l.k} type="button" className="akv-lyr" disabled={!l.live} aria-pressed={l.live}>
                    <u style={{ background: `rgb(${l.rgb})` }} />
                    {tx(`pack.ainubis.layer.${l.k}`, l.en)}
                    {!l.live && <em>{soon}</em>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

      </section>

      {/* ── ROVINA CHAT (maketa, len DEV) — pás histórie + vlákno ──────────────
          Stojí NAD mozgom ako DOGSCROLL, ale mozog v nej ostáva viditeľný: panel
          `ODKIAĽ TO VIEM` je jediné, čím sa tento chat líši od každého iného. */}
      {CHAT_MOCK && plane2 === 'chat' && (
        <VaultChat onBack={() => goPlane('vault')} onOpenScroll={() => goPlane('vault')}
          onOpenSources={openLibrary} />
      )}

      {/* ── ROVINA NÁSTENKA (maketa, len DEV) ────────────────────────────────
          🔴 NA ROZDIEL OD CHATU TU LIŠTA OSTÁVA (voľba A1). Nástenka je ČÍTANIE
          (kôš 2), nie úloha: pilulka „nástenka" musí ostať viditeľná, inak by
          záložka viedla tam, kde sama zmizne. */}
      {WALL_MOCK && plane2 === 'wall' && (
        <VaultWall onBack={() => goPlane('vault')} tab={wallTab} onTab={goWallTab}
          post={postParam} onPost={goPost} />
      )}

      {/* ── DOGSCROLL — dnes upútavky svetov, v novembri pás zvitkov ────────── */}
      {/* ⚠️ V chate sa NEVYKRESĽUJE VÔBEC. Atribút `hidden` nestačil — `.akv-scroll`
          má v CSS `display:flex`, ktorý ho prebije, a panel svetov presvital pod
          vláknom. Tá istá pasca čaká pri každom `hidden` nad flexom. */}
      {plane2 === 'vault' && (
      <aside className="pk-stage akv-scroll" aria-label={tx('pack.ainubis.view.dogscroll', 'Dogscroll')}>
        {/* ZAMKNUTÁ HLAVIČKA (Matej 22. 9.): nadpis · roviny · filtre · vrstvy.
            Logo, eyebrow a trojriadkový úvod zanikli — „opäť je tam veľa textu".
            „Stavba pred očami" nesie oznam hore a pilulka na každej karte. */}
        <header className="akv-lhead">
          {/* Riadok nadpisu má PRAVÚ STRANU VOĽNÚ — Matej 22. 9.: „vedľa nadpisu sa žiada
              niečo doplniť, asi časom filter, zoradenie". Pod nadpis už nič nepribúda,
              ľavý blok má čo najviac miesta na scrolling.
              🔒 Matej 23. 9. 2026: OSTÁVA PRÁZDNA. Zoradenie ani prstenec postupu tam
              nejdú — kým je v zozname 7 upútaviek svetov, ovládač je nábytok bez práce
              (a postup už nesie riadok pod menom). Vracia sa to až so zvitkami. */}
          <div className="akv-lhead-row">
            <div>
            <h1 className="akv-title">{tx('pack.ainubis.dogscroll.title', 'Dogscrolling')}</h1>
            <p className="akv-claim">{tx('pack.ainubis.dogscroll.claim', 'Your dog will thank you for this scroll.')}</p>
            </div>
          </div>
          {planes('akv-planes-l')}
        </header>

        <div className="akv-list">
        <div className="akv-col">
          {shown.length === 0 && <p className="akv-empty">{tx('pack.ainubis.noMatch', 'Nothing found.')}</p>}
          {shown.map(({ w, i }) => (
            <section
              key={w.key}
              id={`akv-w-${w.key}`}
              className={`akv-world${flash === w.key ? ' is-flash' : ''}`}
              style={aiWorld(w.key)}
            >
              <div className="akv-wlbl">{tx('pack.ainubis.worldOf', 'World {n} of 7').replace('{n}', String(i + 1))}</div>
              <div className="akv-wic" aria-hidden style={mask(w.ic)} />
              <h2 className="akv-wname">{names[i]}</h2>
              <p className="akv-wtease">{tx(`pack.ainubis.tease.${w.key}`, w.tease)}</p>
              <span className="akv-wsoon">{tx('pack.ainubis.opening', 'Expected opening: November 2026')}</span>
            </section>
          ))}
          {SOURCES_MOCK && (
            <button type="button" className="akv-entry" onClick={openLibrary}>
              {tx('pack.ainubis.sources.entry', 'What this brain stands on')}
              <b>{VAULT_SOURCE_TOTALS.documents} {tx('pack.ainubis.sources.entryN', 'documents')}{chev}</b>
            </button>
          )}
        </div>
        </div>
      </aside>
      )}

      {/* ── HORE: IDENTITA + OZNAM, POD TÝM ROVINA (Matej 22. 9.) ─────────────── */}
      <div className="akv-top" ref={topRef}>
        <PackIdentityBar
          id={id}
          primary={vaultPrimary}
          stats={vaultStats}
          middle={(
            <span className="akv-when">
              <span className="akv-when-l">{tx('pack.ainubis.opening', 'Expected opening: November 2026')}</span>
              <span className="akv-when-s">{tx('pack.ainubis.openingShort', 'Opens Nov 2026')}</span>
            </span>
          )}
        />
        {/* PC: hľadanie a filtre POD hlavičkou nad mozgom, ako na /map (Matej 22. 9.). */}
        <div className="akv-ptools">
          {search}
          <div className="akv-filters">
            {worldDd}
            {lockedDd('type', 'Type')}
            {lockedDd('state', 'Status')}
          </div>
        </div>
        {/* 🔴 PORADIE NA MOBILE = PORADIE NA `/map` (Matej 23. 9. 2026):
            *„mobil zobrazenie na /map by sa mal zhodovať a mal by si podľa neho urobiť
            aj ainubis"* — identita → HĽADANIE + FILTRE → prepínače. Do 23. 9. tu boli
            prepínače NAD hľadaním, teda presne naopak než na mape.
            ⚠️ Na PC sa tým NEMENÍ NIČ: `.akv-toprow` je tam `display:none` a roviny
               žijú v ľavom bloku — to je vlastné rozhodnutie z toho istého rána
               („OSTÁVA TAK, presun hore aj na PC zamietnutý"). Presúva sa poradie
               v DOM, nie miesto rovín. */}
        <div className="akv-mtools">
          {search}
          <button type="button" className={`akv-fbtn${wf >= 0 ? ' is-set' : ''}`}
            aria-expanded={sheet} onClick={() => setSheet(true)}>
            <i aria-hidden />{filtersLabel}
          </button>
        </div>
        <div className="akv-toprow">{planes('akv-planes-t')}</div>
      </div>

      {/* ŠUPLÍK FILTROV (mobil) — vzor .trp-msheet: všetky filtre na jednom mieste. */}
      {sheet && (
        <>
          <div className="akv-sback" onClick={() => setSheet(false)} aria-hidden />
          <div className="akv-sheet" role="dialog" aria-label={t('pack.map.filters')}>
            <button type="button" className="akv-grab" onClick={() => setSheet(false)} aria-label={t('pack.map.filters')} />
            <div className="akv-sttl">{t('pack.map.filters')}</div>
            <div className="akv-sgrp">
              <b>{tx('pack.ainubis.filter.world', 'World')}</b>
              <div className="akv-chips">
                {worldOpts.map((o, i) => (
                  <button key={o} type="button" className="akv-chip" aria-pressed={wf === i - 1}
                    onClick={() => { setWf(i - 1); setSheet(false); setView('scroll'); }}>{o}</button>
                ))}
              </div>
            </div>
            {([['type', 'Type'], ['state', 'Status']] as const).map(([k, en]) => (
              <div className="akv-sgrp" key={k}>
                <b>{tx(`pack.ainubis.filter.${k}`, en)} · <em>{soon}</em></b>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── DOLE POHĽAD (len mobil) — ikonka aj text ukazujú CIEĽ, nie stav ──── */}
      <div className="akv-mactions">
        <button
          type="button"
          className="akv-mtoggle"
          onClick={() => setView((v) => (v === 'brain' ? 'scroll' : 'brain'))}
        >
          <i aria-hidden style={mask(view === 'brain' ? 'menu' : 'idea')} />
          {view === 'brain'
            ? tx('pack.ainubis.view.dogscroll', 'Dogscroll')
            : tx('pack.ainubis.view.brain', 'Brain')}
        </button>
      </div>

      {/* 🔴 LIŠTA SA VYKRESĽUJE LEN VO VAULTE (Matej 23. a 24. 9. 2026, lock §3).
          Koreň je MIESTO, nie rovina: `/pack/ainubis` je piaty slot chrbtice, ale
          pristáva na VAULTE. CHAT aj NÁSTENKA sú o krok hlbšie, takže z oboch
          vedie JEDNO gesto von — šípka späť.
          ⚠️ 24. 9. ráno tu ešte platilo A1 („na nástenke lišta ostáva"). Matej to
             po videní vrátil: *„nástenka tiež nemusí mať spodný nav ale šípku
             spať, nie sú to koreňové obrazovky nie?"* — a mal pravdu.
          ⚠️ NEVYKRESLIŤ, NIE SKRYŤ: `navRef` v lište publikuje `--pack-nav-h`
             a skrytá lišta by appke tvrdila, že pod obsahom je 68 px, ktoré tam
             nie sú. */}
      {plane2 === 'vault' && (
        <PackBottomNav avatarUrl={id.avatarUrl} avatarInitial={id.avatarInitial} dogs={id.dogs} />
      )}
      <MessagingOverlayHost />
    </div>
  );
}
