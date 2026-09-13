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
  /** Nadpis a silný inkoust. */
  ink: '#E6FAFF',
  /** Bežný text. */
  inkDim: 'rgba(207,243,250,0.82)',
  /** Popisky a tiché odkazy. */
  inkFaint: 'rgba(207,243,250,0.55)',
  /** Červená, ktorá na jeho tmavom povrchu drží kontrast (blokovanie). */
  danger: '#FF8A7A',
  panelShadow:
    `0 20px 60px rgba(0,0,0,0.70), 0 0 0 1px rgba(${CYAN_RGB},0.10), 0 0 40px rgba(${GLOW_RGB},0.14)`,
  /** Jeho CTA. Gradient nie je nový — je to ten, ktorý majú jeho tlačidlá. */
  ctaGrad: `linear-gradient(135deg,${CTA_A} 0%,${CTA_B} 100%)`,
  /** Zastávky CTA gradientu samostatne (plná plocha čipu, tint `rgba(${ctaRGB},a)`). */
  ctaA: CTA_A,
  ctaB: CTA_B,
  ctaRGB: '245,199,61',
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
