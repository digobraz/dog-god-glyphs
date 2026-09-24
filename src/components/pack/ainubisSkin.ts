// ════════════════════════════════════════════════════════════════════════════
// AINUBIS — JEHO VLASTNÝ BRAND, jeden zdroj (2026-09-01)
// ────────────────────────────────────────────────────────────────────────────
// Matej 9. 8. 2026: „musí byť v jeho brande, modro zlatá, AI vibe… farebne
// odlíšiteľné." · 28. 8.: „AInubisovu bublinu nechaj v brande! ako bola."
//
// AINUBIS NIE JE POVRCH APPKY. Papyrus a lapis sú hlas DOGYPTU; toto je hlas
// stroja, ktorý v ňom býva. Preto sa naňho papyrusový lock ani lapisový kánon
// NEVZŤAHUJÚ — a nie je to dlh, je to lock (CLAUDE.md: „ainubis je samostatná
// jednotka tmavá modrá a zlatooranžová").
//
// ⚠️ PREČO TENTO SÚBOR VZNIKOL: tie isté čísla ležali v TROCH kópiách —
//    `Gateways.tsx` (.gw-ainubis), `MapCoach.tsx` (.mcoach-*) a
//    `components/ainubis/AinubisWidget.css` (.ainubis-panel). Rozišli by sa pri
//    prvej zmene. ZJEDNOTENÉ 13. 9. 2026:
//    • Gateways.tsx a MapCoach.tsx skladajú CSS v template literáli a berú
//      hodnoty priamo odtiaľto (`${AINUBIS.x}`, krytie cez `rgba(${AINUBIS.cyanRGB},…)`).
//    • AinubisWidget.css je SAMOSTATNÝ .css súbor — TS token doň nedosiahne bez
//      zásahu do widgetu. Preto má na vrchu blok CSS premenných `--ainubis-*`
//      (jediná kópia každého čísla v tom súbore) a zvyšok súboru číta len ich.
//      ⚠️ Keď tu zmeníš číslo, zmeň ho aj v tom bloku — sú to tie isté hodnoty
//      pod iným zápisom, nie druhá paleta.
//    Nový povrch v jeho brande berie tokeny ODTIAĽTO. Nepíš `rgba(91,224,240,…)`
//    ručne — vezmi `cyanRGB` (rovnaký postup ako pri PACK_THEME.tripPurpleRGB).
//
// ⚠️ CTA JE JEHO ZLATO-ORANŽOVÉ, NIE LAPIS — priznaná výnimka z brandového
//    kánonu (Matej 28. 8.: „AINUBIS je výnimka! Je to jeho brand", potvrdené
//    „CTA si dal správne"). Lapis znamená „čo urobím JA v appke"; keď hovorí on,
//    nesie svoju paletu.
// ════════════════════════════════════════════════════════════════════════════

// ── ATÓMY — z nich sa skladá všetko nižšie ────────────────────────────────────
// RGB trojice sú tu preto, aby si krytie skladal z JEDNÉHO čísla:
// `rgba(${AINUBIS.cyanRGB},0.55)`. Druhá trojica napísaná ručne sa pri prvej
// zmene odtieňa rozíde (presne to, čo sa stalo s fialovou výletov).
const CYAN = '#5BE0F0';
const CYAN_RGB = '91,224,240';
const GLOW = '#3B9EFF';
const GLOW_RGB = '59,158,255';
const BG = '#071019';
const BG_DEEP = '#03070C';
const CTA_A = '#F5C73D';
const CTA_B = '#E69E1A';
const CTA_RGB = '245,199,61';

export const AINUBIS = {
  /** Cyborg cyan — jeho určujúca farba. Vedomá odchýlka od brand v3.2. */
  cyan: CYAN,
  /** `91,224,240` — na skladanie `rgba(${cyanRGB}, a)` s vlastným krytím. */
  cyanRGB: CYAN_RGB,
  /** Modrý svit displeja (radiálne vrstvy, dosvit rámu). */
  glow: GLOW,
  /** `59,158,255` — na skladanie `rgba(${glowRGB}, a)`. */
  glowRGB: GLOW_RGB,
  /** Horná a dolná zastávka tmavomodrého displeja. */
  bg: BG,
  bgDeep: BG_DEEP,
  /** Holý podklad displeja bez svitu — keď si povrch kreslí vlastnú radiálu
   *  (MapCoach bublina má svit inde než panel widgetu). */
  surfaceBase: `linear-gradient(180deg, ${BG} 0%, ${BG_DEEP} 100%)`,
  /** Povrch panela: čierna so studeným nádychom + svit zhora, aby to bol
   *  podsvietený displej, nie čierny obdĺžnik. Zhodné s .ainubis-panel. */
  surface:
    `radial-gradient(120% 80% at 50% -10%, rgba(${GLOW_RGB},0.16) 0%, rgba(${GLOW_RGB},0) 60%),`
    + `linear-gradient(180deg, ${BG} 0%, ${BG_DEEP} 100%)`,
  /** Plocha o stupeň vyššie (riadok, pole) — musí sa odlíšiť od `surface`. */
  raised: `linear-gradient(180deg, rgba(${CYAN_RGB},0.07) 0%, rgba(${CYAN_RGB},0.03) 100%)`,
  edge: `rgba(${CYAN_RGB},0.30)`,
  edgeStrong: `rgba(${CYAN_RGB},0.55)`,
  /** Lem a výplň bloku, ktorý hovorí SÁM STROJ o sebe (posudok príspevku) —
   *  modrý svit displeja namiesto cyanu, aby sa odlíšil od bežnej plochy.
   *  ⚠️ Token, nie literál: stráž `check:pack` meria rám DOSLOVNOU farbou, takže
   *  `1px solid rgba(59,158,255,0.3)` napísané v komponente je odchýlka. */
  glowEdge: `rgba(${GLOW_RGB},0.30)`,
  glowTint: `rgba(${GLOW_RGB},0.08)`,
  /** Nadpis a silný inkoust. */
  ink: '#E6FAFF',
  /** Bežný text. */
  inkDim: 'rgba(207,243,250,0.82)',
  /** Popisky a tiché odkazy. */
  inkFaint: 'rgba(207,243,250,0.55)',
  /** Červená, ktorá na jeho tmavom povrchu drží kontrast (blokovanie). */
  danger: '#FF8A7A',
  // ── TRI STAVY PRÍSPEVKU DO MOZGU (23. 9. 2026) ────────────────────────────
  // ⏳ čaká → jeho zlatá (`ctaA` + `ctaEdge`/`ctaTint`, tie už tu sú) ·
  // ✓ v mozgu → `ok` · ✕ zamietnuté → `danger`.
  // ⚠️ ZELENÁ NIE JE BRANDOVÁ #3D7A4E — tá je namiešaná NA PAPYRUS a na
  //    svietiacom tmavom podklade zhasne. Toto je ten istý tón rozjasnený, nie
  //    iná farba. [[feedback_brandova_farba_pre_papier_zanikne_na_svietiacom_bode]]
  // ⚠️ Stav je TINT + LEM, nikdy plná plocha — tá patrí jedinému CTA (lock r. 113).
  ok: '#7FD79A',
  okEdge: 'rgba(127,215,154,0.45)',
  okTint: 'rgba(127,215,154,0.14)',
  dangerEdge: 'rgba(255,138,122,0.45)',
  dangerTint: 'rgba(255,138,122,0.12)',
  panelShadow:
    `0 20px 60px rgba(0,0,0,0.70), 0 0 0 1px rgba(${CYAN_RGB},0.10), 0 0 40px rgba(${GLOW_RGB},0.14)`,
  /** Jeho CTA. Gradient nie je nový — je to ten, ktorý majú jeho tlačidlá. */
  ctaGrad: `linear-gradient(135deg,${CTA_A} 0%,${CTA_B} 100%)`,
  /** Zastávky CTA gradientu samostatne (plná plocha čipu, tint `rgba(${ctaRGB},a)`). */
  ctaA: CTA_A,
  ctaB: CTA_B,
  ctaRGB: CTA_RGB,
  /** Lem okolo jeho zlatej, keď NEJDE o tlačidlo (štítok, sľub, odznak). Existuje ako
   *  token preto, že stráž `check:pack` meria rám DOSLOVNOU farbou: `rgba(245,199,61,…)`
   *  napísané v komponente je odchýlka, `AINUBIS.ctaEdge` je matrica. */
  ctaEdge: 'rgba(245,199,61,0.35)',
  /** Tichá výplň pod tým istým štítkom — plnú plochu `ctaGrad` má len skutočné CTA. */
  ctaTint: 'rgba(245,199,61,0.10)',
  ctaGradHover: 'linear-gradient(135deg,#FFD65A 0%,#F0A81E 100%)',
  ctaInk: '#2a1608',
  ctaShadow: '0 4px 14px -4px rgba(230,158,26,0.55), inset 0 1px 0 rgba(255,255,255,0.30)',
  // ── MENO MÁ TVAR, NIE JE TO OBYČAJNÉ SLOVO ────────────────────────────────
  // Matej 12. 9. 2026: „AINUBIS je tu napísaný bez toho, aby bolo AI zvýraznené!
  // On má predsa svoj tvar, tak ho dodržuj VŠADE."
  // Meno sa píše `AI` + `NUBIS` a prvé dve písmená sú cyan — kúsok stroja v mene
  // strážcu. Zapisuje sa v MARKUPE, nie v preklade (`<span>AI</span>NUBIS`), lebo
  // preklad je holý text a farbu niesť nevie. Meno sa NEPREKLADÁ.
  // `.gw-ai` v Gateways.tsx číta `aiInk`/`aiShadow` odtiaľto; `.ainubis-ai` v
  // AinubisWidget.css číta `--ainubis-ai-ink`/`--ainubis-ai-shadow` z bloku premenných
  // na vrchu toho súboru (tie isté čísla — viď poznámku v hlavičke).
  /** Farba „AI" v mene. */
  aiInk: CYAN,
  /** Dosvit „AI" — bez neho je z toho len iná farba, nie podsvietený displej. */
  aiShadow: `0 0 16px rgba(${CYAN_RGB},0.75)`,
  /** Podklad pod jeho hlavou (kruh). */
  faceBg: 'radial-gradient(circle at 35% 28%, #12233a 0%, #01050A 74%)',
  faceRing: `0 0 0 1.5px rgba(${CYAN_RGB},0.45), 0 0 16px rgba(${GLOW_RGB},0.38)`,
} as const;

// ════════════════════════════════════════════════════════════════════════════
// AI-SKLO — MATERIÁL JEHO KARIET (2026-09-24)
// ────────────────────────────────────────────────────────────────────────────
// Matej 24. 9.: „potrebujeme zatraktívniť všetky karty pridať tomu hĺbku, odlesk
// … ako maybach medzi trabantami … profesionálne minimalistické a uhladené."
// Nákres `plany/nakres-ainubis-material-2026-09-24.html`, voľba A3.
//
// NIE JE TO NOVÝ BLOK DO KATALÓGU. Je to MATERIÁL existujúcej AI-PALUBY — to,
// z čoho je karta, nie ďalšie meno vedľa KARTY a PODBLOKU.
//
// Hĺbku nerobí tieň, robia ju TRI VRSTVY:
//   1. odlesk `inset 0 1px 0` — horná hrana chytá svetlo, karta prestane byť
//      obdĺžnikom a stane sa doskou,
//   2. lem, ktorý smerom DOLE zhasína — karta stojí vo svetle zhora,
//   3. dosvit vo farbe sveta — nástenka sa dá čítať farbou skôr než slovom.
//
// 🔴 VÝPLŇ MUSÍ BYŤ NEPRIESVITNÁ. Gradientový lem sa kreslí cez `border-box`,
//    teda pod CELOU kartou — nie iba pod tým jedným pixelom rámu. Cez priesvitnú
//    výplň presvitá a zafarbí celú plochu (v nákrese z toho bol ružový obdĺžnik).
//    Preto je medzi tintom a lemom `GLASS_FILL`, a je krycí.
//    [[feedback_gradientovy_lem_presvita_cez_vypln]]
//
// 🔴 VOLÁ SA BEZ PARAMETROV, ako `goldFrameCSS()` na papyruse. Farbu sveta nesie
//    premenná `--ai-w` (RGB trojica) nastavená na prvku; bez nej je to cyan.
//    Parameter by znamenal toľko kópií odliatku, koľko je svetov.
// ⚠️ `check:pack` preskakuje `ainubisSkin.ts`, NIE komponenty. Preto sem patrí
//    celý odliatok a v komponente stojí len `${AI_GLASS}` — literál farby
//    napísaný vo `VaultWall.tsx` by stráž (právom) zhodil.
// ════════════════════════════════════════════════════════════════════════════

/** Krycia výplň skla. Bez nej presvitá lem cez celú kartu (viď hlavičku). */
const GLASS_FILL = `linear-gradient(180deg,#0A1622 0%,#04080E 100%)`;

// 🔵 SÝTOSŤ FARBY SVETA — Matej 24. 9. 2026, voľba A z `plany/nakres-ainubis-
//    farby-svetov-2026-09-24.html`: *„páči sa mi rozdelenie, dal by som sýtejšie
//    farby"*. Dvíha sa KRYTIE (0.16→0.30 radiála · 0.55→0.85 lem a dosvit), NIE
//    odtieň — štyri zo siedmich farieb sú jeho tokeny (`danger` · `ctaA` · `ok` ·
//    `glow`) a iný odtieň by vedľa jeho palety založil druhú. Presne to zakazuje
//    brand lock po prípade fialovej výletov.
//    ⚠️ Krytie dýchania ide s tým — inak by karta pri nádychu zosvetlela MENEJ
//       než stojí v pokoji a dýchanie by sa opticky obrátilo.
/** Materiál karty. Vkladá sa DO pravidla: `.karta{${AI_GLASS}}`. */
export const AI_GLASS = `
  border:1px solid transparent;
  background:
    radial-gradient(85% 34% at 50% -4%,rgba(var(--ai-w,${CYAN_RGB}),0.30) 0%,transparent 72%) padding-box,
    linear-gradient(180deg,rgba(${CYAN_RGB},0.06) 0%,rgba(${CYAN_RGB},0.02) 55%,rgba(${CYAN_RGB},0) 100%) padding-box,
    ${GLASS_FILL} padding-box,
    linear-gradient(180deg,rgba(var(--ai-w,${CYAN_RGB}),0.85) 0%,rgba(${CYAN_RGB},0.14) 42%,rgba(${CYAN_RGB},0.05) 100%) border-box;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.10),
    0 18px 40px -22px rgba(0,0,0,0.90),
    0 0 50px -18px rgba(var(--ai-w,${CYAN_RGB}),0.85);
`;

/** REPLIKA ČLOVEKA v chate — plná plocha jeho cyanu s tmavým inkoustom
 *  (Matej 24. 9. 2026: „otázka v plnom fille bubliny a odpoveď v inom").
 *  ⚠️ Odlíšenie nesie MATERIÁL, nie odtieň: človek plná plocha, stroj sklo.
 *  ⚠️ Patrí sem, a nie do komponentu, lebo stráž check:pack meria tieň proti
 *     PACK_SHADOW a tento svit je AINUBISOV — skin je jediné miesto, kde smie
 *     mať vlastný (rovnako ako AI_GLASS). */
export const AI_BUBBLE = `
  border:0;color:#04121A;font-weight:500;
  background:linear-gradient(135deg,${CYAN} 0%,${GLOW} 140%);
  box-shadow:0 10px 26px -14px rgba(${CYAN_RGB},0.65), inset 0 1px 0 rgba(255,255,255,0.35);
`;

/** Tieň police nad plátnom — vodorovný, lebo panel stojí VEDĽA mozgu, nie nad ním.
 *  V skine preto, že stráž check:pack meria tieň proti PACK_SHADOW (tri zvislé
 *  výšky) a toto je štvrtý smer, nie štvrtá výška. */
export const AI_PANEL_SHADOW = `box-shadow:24px 0 60px -40px rgba(0,0,0,0.90);`;

/** Zaostrenie na poli — svetlo zvnútra, nie hrubší lem. */
export const AI_FOCUS = `
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.10),
    0 0 0 1px rgba(${CYAN_RGB},0.35), 0 0 28px -10px rgba(${CYAN_RGB},0.55);
`;

/** CHRBÁT KNIHY v knižnici — polica sa dá čítať okom skôr než názvom.
 *  Dve vnútorné hrany robia z obdĺžnika objekt: svetlá vpravo, tmavá vľavo.
 *  ⚠️ V skine z toho istého dôvodu ako AI_BUBBLE — stráž meria tieň proti
 *     PACK_SHADOW a toto je vnútorná hrana, nie výška nad plochou. */
export const AI_SPINE = `
  background:linear-gradient(160deg,rgba(${CYAN_RGB},0.30),rgba(${GLOW_RGB},0.10));
  box-shadow:inset -1px 0 0 rgba(255,255,255,0.10), inset 1px 0 0 rgba(0,0,0,0.35);
`;

/** Hlas stroja v karte — svetelný rail namiesto boxu v boxe (voľba C1).
 *  ⚠️ Rámik navyše je najlacnejší spôsob, ako z centrály urobiť úradný formulár.
 *  Dvojpixelová svietiaca čiara povie „toto hovorí stroj" rovnako jasne
 *  a NEPRIDÁ úroveň vnorenia. Ten istý rail nesie jeho hlas aj v chate. */
export const AI_RAIL = `
  position:relative;padding-left:16px;border:0;background:transparent;
`;
export const AI_RAIL_BEFORE = `
  content:'';position:absolute;left:0;top:2px;bottom:2px;width:2px;border-radius:999px;
  background:linear-gradient(180deg,${CYAN},rgba(${CYAN_RGB},0.05));
  box-shadow:0 0 12px rgba(${CYAN_RGB},0.60);
`;
/** Keď mozog na tému nič nemá: rail zhasne do jeho zlatej, nie do cyanu. */
export const AI_RAIL_BLANK = `
  background:linear-gradient(180deg,${CTA_A},rgba(${CTA_RGB},0.05));
  box-shadow:0 0 12px rgba(${CTA_RGB},0.45);
`;

/** DÝCHANIE — 6 s, a dýcha LEN to, čo hovorí stroj (jeho tvár, jeho karta).
 *  🔴 Obsah človeka NIKDY. Inak je z centrály vianočný stromček.
 *  Vloží sa raz do CSS povrchu, prvok ho berie triedou `.ai-breathe`. */
export const AI_BREATHE_CSS = `
@keyframes aiBreathe{
  0%,100%{box-shadow:inset 0 1px 0 rgba(255,255,255,0.10),0 18px 40px -22px rgba(0,0,0,0.90),
    0 0 44px -20px rgba(var(--ai-w,${CYAN_RGB}),0.58);}
  50%{box-shadow:inset 0 1px 0 rgba(255,255,255,0.14),0 18px 40px -22px rgba(0,0,0,0.90),
    0 0 58px -12px rgba(var(--ai-w,${CYAN_RGB}),0.92);}
}
.ai-breathe{animation:aiBreathe 6s ease-in-out infinite;}
@media (prefers-reduced-motion:reduce){.ai-breathe{animation:none;}}

/* Tá istá vec na jeho TVÁRI — tam, kde karta patrí človeku a dýchať nemá čo.
   Prstenec okolo hlavy, nie kus obsahu. Toto je „centrála, ktorá dýcha": jeden
   bod na obrazovke, ktorý sa hýbe, a nič iné. */
@keyframes aiBreatheFace{
  0%,100%{box-shadow:0 0 0 1.5px rgba(${CYAN_RGB},0.40), 0 0 12px rgba(${GLOW_RGB},0.28);}
  50%{box-shadow:0 0 0 1.5px rgba(${CYAN_RGB},0.60), 0 0 20px rgba(${GLOW_RGB},0.50);}
}
.ai-breathe-face{animation:aiBreatheFace 6s ease-in-out infinite;}
@media (prefers-reduced-motion:reduce){.ai-breathe-face{animation:none;}}
`;

// ── FARBA SVETA — nesie ju DOSVIT, nie výplň ─────────────────────────────────
// Farba tu nesie DRUH, nie ozdobu — rovnako ako farba obrysu mapovej značky
// (CLAUDE.md: značka na mape sa nezjednocuje, je to ÚDAJ).
//
// 🔴 OD 24. 9. 2026 JE TO SAMOSTATNÁ PALETA, NIE VÝSEK Z AINUBISOVEJ.
//    Dovtedy tu stálo, že štyri zo siedmich SÚ jeho tokeny (`danger` · `ctaA` ·
//    `ok` · `glow`) a že vlastný odtieň by založil druhú paletu. Matej to nad
//    miešačkou (`plany/nakres-ainubis-paleta-2026-09-24.html`) namiešal celé
//    nanovo a všetkých sedem je odteraz vlastných. Dôvod nie je vkus: `anatomy`
//    BOL doslova `CYAN_RGB`, čiže svet mal farbu, ktorou hovorí sám AINUBIS
//    a ktorá zároveň znamená „žiadny svet" (`--ai-w` má cyan ako fallback).
//    Svet sa tým nedal odlíšiť od stroja. Požičané tokeny tento spor niesli
//    zabudovaný, preto sa požičiavanie skončilo.
// ⚠️ NEVRACAJ SEM ODKAZ NA `CYAN_RGB`/`GLOW_RGB`/`CTA_RGB`. Vyzerá to ako
//    úspora, ale je to práve tá pasca: zmena jeho displeja by ticho prefarbila
//    svet a naopak.
//
// 📏 ZRÁŽKA FARIEB SA MERIA, NEODHADUJE — CIE76 ΔE v Lab, nie „vyzerá inak".
//    Prah: <18 sa na obrazovke pletie · 18–28 tesné · >28 vlastná farba.
//    Zmerané pri zápise (24. 9.):
//      🔴 prevention × BRAIN_STATE.read = 11,4 — a sú na TOM ISTOM plátne
//         (bublina sveta a zrno so stavom). Nahlásené Matejovi, čaká na jeho slovo.
//      🟠 understanding × anatomy = 18,9 · problems × AINUBIS.danger = 19,3
//      🟢 zvyšok. `understanding × brandBlueLite = 11,3` sa NERÁTA: brandBlueLite
//         žije na mape a v DOG ID, s AINUBISOM sa na jednej obrazovke nestretne.
//    ⚠️ Meraj vždy aj proti `BRAIN_STATE` — mozog kreslí OBE sady naraz.
export const WORLD_TINT: Readonly<Record<string, string>> = {
  problems: '232,126,142',      // #E87E8E
  training: '255,190,140',      // #FFBE8C
  prevention: '61,184,98',      // #3DB862
  understanding: '0,120,240',   // #0078F0
  dogsPath: '193,104,253',      // #C168FD
  anatomy: '134,148,255',       // #8694FF
  nutrition: '186,224,116',     // #BAE074
} as const;

/** `style={aiWorld(key)}` na karte — nastaví `--ai-w`, inak ostane cyan. */
export const aiWorld = (key?: string): Record<string, string> =>
  (key && WORLD_TINT[key] ? { ['--ai-w']: WORLD_TINT[key] } : {});

// ── STAV UČENIA V MOZGU — farba uzla je LEGENDA, nie ozdoba ──────────────────
// Matej 19. 9. 2026 (nákres `plany/nakres-vault-fasada-v5-2026-09-20.html`, r. 2597):
// *„svety by som dal modrou… a žltá a zelená má svoj zmysel — videné/prečítané.
//  Modrá je nedotknutá, resp. štandardná."* Potvrdené 24. 9.
//
// 🔴 DVE FARBY, DVA OBJEKTY — a práve preto sa nebijú:
//    ZRNO (zvitok) nesie STAV  → `BRAIN_STATE` nižšie,
//    BUBLINA SVETA nesie DRUH  → `WORLD_TINT` vyššie (tá istá farba ako karta
//                                 na nástenke, takže mozog a nástenka hovoria
//                                 jedným jazykom),
//    KARTUŠA, RÁM, NAV nesú KONŠTRUKCIU → zlato (brand lock).
// ⚠️ Zlatá tým na uzle PRESTÁVA byť voľná: znamená „videné", nikde inde na uzle
//    sa použiť nesmie.
export const BRAIN_STATE = {
  /** Nedotknutý zvitok. */
  untouched: GLOW_RGB,
  /** Nedotknutý svet / okruh / stred — vyššia úroveň má vyšší jas. */
  untouchedHi: CYAN_RGB,
  /** VIDENÉ — otvoril si to a nedočítal. Jeho zlatá, `ctaA`. */
  seen: CTA_RGB,
  /** PREČÍTANÉ. ⚠️ NIE brandová `#3D7A4E` (61,122,78) — tá je namiešaná NA PAPIER
   *  a svietiaci 3px bod v nej na čiernom zanikol; prečítané zvitky vyzerali ako
   *  diery. Ten istý tón, o dva stupne svetlejší.
   *  [[feedback_brandova_farba_pre_papier_zanikne_na_svietiacom_bode]] */
  read: '92,190,120',
} as const;
