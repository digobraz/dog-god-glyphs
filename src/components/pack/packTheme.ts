// Pack theme tokens — vlastný modul (NIE v PackLayout.tsx).
// Dôvod: konštanta exportovaná spolu s React komponentmi láme Vite Fast Refresh
// (každý edit PackLayout = full reload → cobe globe sa roztrhne). Oddelené = HMR čisté.
//
// Soft sandy palette — bledé papyrusové bloky (karty) na ČIERNOM pozadí (web-konzistentné).
// POZN: bgTop/bg/bgBottom = svetlé VÝPLNE VNÚTRI kariet (HeroCard/PackTree/skeletony), NIE page bg.

// ── TYPOGRAFICKÝ PORIADOK (Matej 2026-07-26: „prečo sa mi zdá že všetko je cinzelom") ──
// Trips klaster (PackMap 33× / PackTriplist 17× / PackTripArticle 9×) bol jednofontový —
// všetko Cinzel, nula Space Grotesku. To je proti nášmu vlastnému systému:
//   `index.css`  → `body { Space Grotesk }`, `h1–h6 { Cinzel }`
//   `Entry.tsx`  → eyebrow = Space Grotesk 500 / .26em / uppercase, sub = Space Grotesk
//   `.btn-gold`  → LOCKED brand CTA = Cinzel 700 uppercase
// Delenie rolí:
//   FONT_TITLE = identita — nadpisy, názvy výletov/miest, CTA tlačidlá, rang (Pútnik)
//   FONT_UI    = zvyšok — eyebrow popisky, dáta, čísla, chipy, badge, meta, tooltipy
// ⚠️ Space Grotesk je v index.html načítaný len vo váhach 300–600. `font-weight:700` by
//    prehliadač dosyntetizoval (fake bold, rozmazané hrany) — strop je 600.
// ⚠️ NEPOUŽÍVAJ 'DM Sans' — v projekte sa nikde nenačítava, padá to na system-ui.
export const FONT_TITLE = "'Cinzel',serif";
export const FONT_UI = "'Space Grotesk',sans-serif";
export const PACK_THEME = {
  // "Naše tmavé" — #050505 + bg-dark.webp heroglyf textúra (ako GodsGrid / heroglyph flow)
  pageBg: '#050505',
  glass: 'rgba(5, 5, 5, 0.72)',
  glassSoft: 'rgba(5, 5, 5, 0.55)',
  onDark: 'rgba(245, 240, 228, 0.86)',
  onDarkDim: 'rgba(245, 240, 228, 0.46)',
  onDarkHair: 'rgba(245, 240, 228, 0.10)',
  onDarkBorder: 'rgba(245, 240, 228, 0.18)',
  // Light fills INSIDE cards (papyrus) — neslúžia ako page bg
  bgTop: '#F2E5C7',
  bgBottom: '#E5D5B3',
  bg: '#EDDCBD',
  // `card` = PLNÁ farba, nie gradient — používa sa aj ako `color:` (svetlý text na
  // tmavom podklade, napr. hover overlay avatara). Pre pozadie karty ber `cardGrad`.
  card: '#FBF5E6',
  cardSoft: '#FCF4DF',
  ink: '#1F1A0E', // off-black, warm
  inkDim: 'rgba(31, 26, 14, 0.62)',
  inkFaint: 'rgba(31, 26, 14, 0.42)',
  // ── PAPYRUS LOCK (2026-07-26, Matej: „dizajn bledých blokov sme si lockli
  // podľa /entry") — zdroj pravdy = src/pages/Entry.tsx `.religion-card`,
  // `.crit-tile`, `.religion-rule`. Bledý blok NIE je plochá biela so šedým
  // hairlinom; je to papyrusový gradient v zlatom ráme so zlatým halo ringom.
  // Šedé hairliny (rgba(31,26,14,…)) sú preto preložené na tlmenú zlatú.
  hairline: 'rgba(201, 154, 63, 0.30)',
  border: 'rgba(201, 154, 63, 0.45)',
  /** Pozadie bledej KARTY (`.religion-card`). */
  cardGrad: 'linear-gradient(160deg, #FBF5E6 0%, #F3E4C4 55%, #EAD6A6 100%)',
  /** Pozadie menšieho bledého PANELU (tooltip/modal v /entry). */
  panelGrad: 'linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%)',
  /** Vonkajší okraj bledej karty — 1.5px solid, plná zlatá. */
  cardEdge: '#C99A3F',
  /** Tieň bledej karty vrátane zlatého halo ringu a horného inner highlightu. */
  cardShadow:
    '0 14px 44px rgba(0,0,0,0.55), 0 0 0 4px rgba(201,154,63,0.12), inset 0 1px 0 rgba(255,255,255,0.5)',
  /** Tieň menšieho panelu (užší ring). */
  panelShadow: '0 8px 28px rgba(0,0,0,0.45), 0 0 0 3px rgba(201,154,63,0.15)',
  /** Výplň dlaždice/políčka VNÚTRI bledej karty (`.crit-tile`). */
  tileBg: 'rgba(201, 154, 63, 0.06)',
  /** Deliaca čiara vnútri bledej karty — zlatá, vyblednutá do strán. */
  rule: 'linear-gradient(90deg, transparent, #C99A3F, transparent)',
  /** Tmavý inkoust na papyruse pre nadpisy (Cinzel) — teplejší než `ink`. */
  inkStrong: '#2a1608',
  /** Sekundárny text na papyruse (Space Grotesk sub). */
  inkWarm: '#7a5a2a',
  accentGold: '#C99A3F',
  growGreen: '#3D7A4E',
  // ── Canonical TRANSPARENCY MODEL part colors (LOCKED 2026-06-09) ──────────
  // Jeden zdroj pravdy pre FounderInvite (back of block 5) + TransparentStats
  // (block 3) — farby MUSIA sedieť v oboch. Rozvoj zlatožltá · marketing tyrkys
  // · direct help červená · hektor fialová.
  partDev: '#C99A3F', // rozvoj — zlatožltá (brand gold)
  partMkt: '#1AA39A', // marketing — tyrkysová (brand faience core)
  partHelp: '#C0453A', // direct help — červená
  partHek: '#2E5FD0', // hektor — Egyptian blue accent (bývalá fialová, 2026-06-15)
  growGreenSoft: 'rgba(61, 122, 78, 0.12)',
  alertRed: '#B25640',
  alertRedSoft: 'rgba(178, 86, 64, 0.12)',
};

// ── LIQUID GLASS primitív (LOCKED design language, 2026-07-23) ───────────────
// JEDEN zdroj pravdy pre „obsahovú časť" na heroglyf pozadí: obsah nesmie plávať
// priamo na čiernej — ide do frosted panelu (.pk-glass) cez ktorý heroglyfy
// presvitajú (backdrop-blur). Bloky vnútra = .pk-glass-block. Reuse: triplist,
// trip článok, walked — všade rovnaká situácia = rovnaký primitív. NEmixovať s
// plnou čiernou. Render `<style>{GLASS_CSS}</style>` v komponente.
export const GLASS_CSS = `
.pk-glass{
  background:linear-gradient(180deg,rgba(245,240,228,0.075) 0%,rgba(245,240,228,0.028) 100%);
  -webkit-backdrop-filter:blur(24px) saturate(120%);
  backdrop-filter:blur(24px) saturate(120%);
  border:1px solid rgba(245,240,228,0.14);
  border-radius:24px;
  box-shadow:0 30px 70px rgba(0,0,0,0.5),inset 0 1px 0 rgba(245,240,228,0.12);
}
.pk-glass-block{
  background:rgba(245,240,228,0.05);
  border:1px solid rgba(245,240,228,0.10);
  border-radius:16px;
  overflow:hidden;
}
`;

// ── PAPYRUS „ŠŤAVA" primitív (2026-07-26, Matej: „tie políčka text area aj
// pils su nevyrazne blede ani sa mi tam nechce kliknúť… je to suche bez
// šťavy"). DNA prevzatá z `/pack/map` (PackTriplist) — gradient výplň + farebný
// glow tieň namiesto plochej výplne — v papyrusovej palete, nie v čiernom skle.
// Zdieľané medzi PackProfile.tsx (blok 1 polia) A DogGallery.tsx/DogCardFields.tsx
// (psia karta, editor AJ read-profil) — render `<style>{PF_FIELD_CSS}</style>`
// raz na stránke, presne ako `GLASS_CSS` vyššie.
export const PF_FIELD_CSS = `
.pf-field{
  background: linear-gradient(180deg, #FFFDF7 0%, #F1DFB3 100%);
  border: 1.5px solid rgba(179,130,45,0.55);
  box-shadow: inset 0 1px 2px rgba(122,90,42,0.16);
  transition: border-color .15s ease, box-shadow .15s ease;
}
.pf-field::placeholder{ color: rgba(122,90,42,0.5); }
.pf-field:hover{ border-color: rgba(179,130,45,0.8); }
.pf-field:focus{
  outline: none;
  border-color: #C99A3F;
  box-shadow: inset 0 1px 2px rgba(122,90,42,0.16), 0 0 0 3px rgba(201,154,63,0.28);
}
.pf-pill{
  background: linear-gradient(180deg, #FFFDF7 0%, #EFDDAE 100%);
  border: 1.5px solid rgba(179,130,45,0.42);
  color: #5c4318;
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.pf-pill:hover:not(:disabled){
  border-color: rgba(179,130,45,0.85);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(122,90,42,0.22);
}
.pf-pill.is-selected{
  background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
  border-color: #E69E1A;
  color: #241a06;
  box-shadow: 0 3px 12px rgba(230,158,26,0.5);
}
.pf-pill.is-selected:hover{ box-shadow: 0 4px 16px rgba(230,158,26,0.62); }
.pf-pill:disabled{ opacity: 0.4; cursor: default; transform: none; box-shadow: none; }

/* Sub-section accordion header (BASICS / HOW THEY WORK / …) — bola plochý
   text riadok s hairlinom, nikto ho nevnímal ako klikateľný (Matej 2026-07-29:
   „je to nevýrazné slabo viditeľné a mozog to prehliada"). Rovnaká DNA ako
   .pf-field/.pf-pill vyššie — gradient výplň + hover lift + glow, nie plochá farba. */
.pf-subsection{
  background: linear-gradient(180deg, #FFFDF7 0%, #F1DFB3 100%);
  border: 1.5px solid rgba(179,130,45,0.4);
  box-shadow: inset 0 1px 2px rgba(122,90,42,0.10);
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.pf-subsection:hover{
  border-color: rgba(179,130,45,0.85);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(122,90,42,0.26), inset 0 1px 2px rgba(122,90,42,0.10);
}
.pf-subsection.is-open{
  border-color: #C99A3F;
  box-shadow: 0 2px 10px rgba(201,154,63,0.28), inset 0 1px 2px rgba(122,90,42,0.10);
}
.pf-subsection-badge{
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
}
.pf-subsection-badge.is-empty{
  border: 1px dashed rgba(179,130,45,0.6);
  color: #7a5a2a;
}
.pf-subsection-badge.is-filled{
  background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
  border: 1px solid #E69E1A;
  color: #241a06;
  box-shadow: 0 2px 8px rgba(230,158,26,0.45);
}
.pf-subsection-chevron{
  width: 22px; height: 22px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(201,154,63,0.14);
  transition: background .15s ease;
}
.pf-subsection:hover .pf-subsection-chevron{ background: rgba(201,154,63,0.26); }
`;
