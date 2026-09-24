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

/** Materiál karty. Vkladá sa DO pravidla: `.karta{${AI_GLASS}}`. */
export const AI_GLASS = `
  border:1px solid transparent;
  background:
    radial-gradient(85% 34% at 50% -4%,rgba(var(--ai-w,${CYAN_RGB}),0.16) 0%,transparent 72%) padding-box,
    linear-gradient(180deg,rgba(${CYAN_RGB},0.06) 0%,rgba(${CYAN_RGB},0.02) 55%,rgba(${CYAN_RGB},0) 100%) padding-box,
    ${GLASS_FILL} padding-box,
    linear-gradient(180deg,rgba(var(--ai-w,${CYAN_RGB}),0.55) 0%,rgba(${CYAN_RGB},0.14) 42%,rgba(${CYAN_RGB},0.05) 100%) border-box;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.10),
    0 18px 40px -22px rgba(0,0,0,0.90),
    0 0 50px -18px rgba(var(--ai-w,${CYAN_RGB}),0.55);
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
    0 0 44px -20px rgba(var(--ai-w,${CYAN_RGB}),0.38);}
  50%{box-shadow:inset 0 1px 0 rgba(255,255,255,0.14),0 18px 40px -22px rgba(0,0,0,0.90),
    0 0 58px -12px rgba(var(--ai-w,${CYAN_RGB}),0.62);}
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
// ⚠️ NIE JE TO NOVÁ PALETA APPKY. Sú to odtiene JEHO displeja a fungujú rovnako
//    ako farba obrysu mapovej značky: nesú DRUH, nie ozdobu (CLAUDE.md, značka
//    na mape sa nezjednocuje — je to ÚDAJ).
// 🚩 NA MATEJA: štyri z nich sú jeho existujúce tokeny (danger · ctaA · ok ·
//    glow), tri zvyšné sú dopočítané do rovnakej rodiny. Sedem odtieňov je
//    brandové rozhodnutie — pozri si ich vedľa seba skôr, než to pôjde ďalej.
export const WORLD_TINT: Readonly<Record<string, string>> = {
  problems: '255,138,122',      // = danger
  training: '245,199,61',       // = ctaA
  prevention: '127,215,154',    // = ok
  understanding: GLOW_RGB,      // = glow
  dogsPath: '198,164,255',      // dopočítané
  anatomy: CYAN_RGB,            // = cyan
  nutrition: '255,176,122',     // dopočítané
} as const;

/** `style={aiWorld(key)}` na karte — nastaví `--ai-w`, inak ostane cyan. */
export const aiWorld = (key?: string): Record<string, string> =>
  (key && WORLD_TINT[key] ? { ['--ai-w']: WORLD_TINT[key] } : {});

