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
// ⚠️ PREČO TENTO SÚBOR VZNIKOL: tie isté čísla dnes ležia v TROCH kópiách —
//    `Gateways.tsx` (.gw-ainubis), `MapCoach.tsx` (.mcoach-*) a
//    `ainubis/AinubisWidget.css` (.ainubis-panel). Rozišli by sa pri prvej zmene.
//    Nový povrch v jeho brande berie tokeny ODTIAĽTO; keď sa niektorej z troch
//    starých kópií dotkneš, prepíš ju na tento zdroj (rovnaký postup ako pri
//    PACK_THEME.tripPurple). Prepisovať ich naslepo teraz by bolo prezliekanie
//    povrchov, o ktoré nikto nežiadal.
//
// ⚠️ CTA JE JEHO ZLATO-ORANŽOVÉ, NIE LAPIS — priznaná výnimka z brandového
//    kánonu (Matej 28. 8.: „AINUBIS je výnimka! Je to jeho brand", potvrdené
//    „CTA si dal správne"). Lapis znamená „čo urobím JA v appke"; keď hovorí on,
//    nesie svoju paletu.
// ════════════════════════════════════════════════════════════════════════════

export const AINUBIS = {
  /** Cyborg cyan — jeho určujúca farba. Vedomá odchýlka od brand v3.2. */
  cyan: '#5BE0F0',
  /** Modrý svit displeja (radiálne vrstvy, dosvit rámu). */
  glow: '#3B9EFF',
  /** Povrch panela: čierna so studeným nádychom + svit zhora, aby to bol
   *  podsvietený displej, nie čierny obdĺžnik. Zhodné s .ainubis-panel. */
  surface:
    'radial-gradient(120% 80% at 50% -10%, rgba(59,158,255,0.16) 0%, rgba(59,158,255,0) 60%),'
    + 'linear-gradient(180deg, #071019 0%, #03070C 100%)',
  /** Plocha o stupeň vyššie (riadok, pole) — musí sa odlíšiť od `surface`. */
  raised: 'linear-gradient(180deg, rgba(91,224,240,0.07) 0%, rgba(91,224,240,0.03) 100%)',
  edge: 'rgba(91,224,240,0.30)',
  edgeStrong: 'rgba(91,224,240,0.55)',
  /** Nadpis a silný inkoust. */
  ink: '#E6FAFF',
  /** Bežný text. */
  inkDim: 'rgba(207,243,250,0.82)',
  /** Popisky a tiché odkazy. */
  inkFaint: 'rgba(207,243,250,0.55)',
  /** Červená, ktorá na jeho tmavom povrchu drží kontrast (blokovanie). */
  danger: '#FF8A7A',
  panelShadow:
    '0 20px 60px rgba(0,0,0,0.70), 0 0 0 1px rgba(91,224,240,0.10), 0 0 40px rgba(59,158,255,0.14)',
  /** Jeho CTA. Gradient nie je nový — je to ten, ktorý majú jeho tlačidlá. */
  ctaGrad: 'linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%)',
  ctaGradHover: 'linear-gradient(135deg,#FFD65A 0%,#F0A81E 100%)',
  ctaInk: '#2a1608',
  ctaShadow: '0 4px 14px -4px rgba(230,158,26,0.55), inset 0 1px 0 rgba(255,255,255,0.30)',
  /** Podklad pod jeho hlavou (kruh). */
  faceBg: 'radial-gradient(circle at 35% 28%, #12233a 0%, #01050A 74%)',
  faceRing: '0 0 0 1.5px rgba(91,224,240,0.45), 0 0 16px rgba(59,158,255,0.38)',
} as const;
