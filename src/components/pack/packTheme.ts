// Pack theme tokens — vlastný modul (NIE v PackLayout.tsx).
// Dôvod: konštanta exportovaná spolu s React komponentmi láme Vite Fast Refresh
// (každý edit PackLayout = full reload → cobe globe sa roztrhne). Oddelené = HMR čisté.
//
// Soft sandy palette — bledé papyrusové bloky (karty) na ČIERNOM pozadí (web-konzistentné).
// POZN: bgTop/bg/bgBottom = svetlé VÝPLNE VNÚTRI kariet (HeroCard/PackTree/skeletony), NIE page bg.
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
  card: '#FFFBF2',
  cardSoft: '#FCF4DF',
  ink: '#1F1A0E', // off-black, warm
  inkDim: 'rgba(31, 26, 14, 0.62)',
  inkFaint: 'rgba(31, 26, 14, 0.42)',
  hairline: 'rgba(31, 26, 14, 0.08)',
  border: 'rgba(31, 26, 14, 0.16)',
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
