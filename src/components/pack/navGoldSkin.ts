// ── ZLATÝ SKIN NAVU — jeden zdroj pravdy ────────────────────────────────────
// Vytiahnuté z `PackLayout.tsx` (25. 8. 2026), aby ten istý rám vedeli použiť aj
// povrchy MIMO Reactu — steny `/wall-lab` a `GodsGrid` majú nav v jednom veľkom
// CSS template literáli, nie v inline štýloch. Matej: „vytiahni DNA z nášho
// projektu /pack aby to nebolo všade iné." Dve kópie tých istých gradientov by sa
// rozišli pri prvej úprave a bar v `/pack` a na stene by prestal byť ten istý bar.
//
// Hodnoty sú VYMERANÉ z Matejovej predlohy (`nav-predloha`, 24. 8., 3 kolá) —
// nemeň ich odhadom, komentáre v PackLayout.tsx hovoria, čo ktoré kolo zistilo.

/** Rozmery z predlohy, prepočítané na bar ~60 px. */
export const NAV_R = { frame: 14, rim: 6, plate: 8, line: 1 };

export const NAV_GOLD = {
  /** Rám: leštené zlato, svetlá hrana hore, telo, tmavý spodok. */
  frame:
    'linear-gradient(180deg, #FCF0C2 0%, #EDCE7C 20%, #D8B052 50%, #C09636 78%, #AA8129 100%)',
  /** Tmavý obrys — ten istý vonku aj na vnútornej hranici rámu. */
  edge: '#6E4E18',
  /** Doska: teplý pieskovec, nie krém. */
  surface:
    'linear-gradient(180deg, #F1DFB6 0%, #E9D5A7 42%, #E1CA97 72%, #D6BC85 100%)',
  /** Aktívna pilulka: sýtejšie zlato než doska, aby vystúpila. */
  activeFill:
    'linear-gradient(180deg, #F4DC97 0%, #E6C267 34%, #D9AC46 70%, #C99A33 100%)',
  ink: '#2A1608',
};

// Zrnitosť papiera/kameňa. Inline SVG turbulencia = žiadny asset, žiadny request;
// `#` MUSÍ byť `%23`, inak sa data URI zlomí na fragmente a vrstva ticho zmizne.
//
// ⚠️ 1. pokus mal JEDNU vrstvu s `mix-blend-mode: overlay` a bol NEVIDITEĽNÝ: overlay
// šedého šumu na strednej zlatej takmer nemení jas. Zrno potrebuje DVE vrstvy —
// `multiply` (tmavé body) a `screen` (svetlé), navzájom posunuté.
export const NAV_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 1.8 0 0 0 -0.65'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Mramorovanie dosky — v predlohe je papier nerovnomerný, svetlejší v strede a
// zašpinený pri okrajoch. Vignette robí presne to a je to lacnejšie než textúra.
export const NAV_MOTTLE =
  'radial-gradient(75% 130% at 22% 6%, rgba(255,252,236,0.6), transparent 62%), ' +
  'radial-gradient(88% 145% at 50% 50%, transparent 48%, rgba(112,76,20,0.13) 100%), ' +
  'radial-gradient(45% 95% at 78% 96%, rgba(112,76,20,0.11), transparent 66%)';

/** Tieň RÁMU — odliatok, nie nálepka: vrhnutý tieň + svetlá horná hrana + tmavý spodok. */
export const NAV_FRAME_SHADOW = [
  '0 12px 26px -8px rgba(0,0,0,0.72)',
  '0 3px 0 -1px rgba(70,46,12,0.5)',
  'inset 0 1.5px 0 rgba(255,250,228,0.95)',
  'inset 0 7px 9px -7px rgba(255,248,214,0.95)',
  'inset 0 -2px 3px rgba(84,56,14,0.55)',
  'inset 1.5px 0 2px -1px rgba(255,246,214,0.5)',
  'inset -1.5px 0 2px -1px rgba(84,56,14,0.4)',
].join(', ');

/** Tieň DOSKY — zapustená do rámu (horný vnútorný tieň), spodná hrana presvetlená. */
export const NAV_PLATE_SHADOW = [
  'inset 0 2px 5px rgba(96,64,16,0.42)',
  'inset 0 -1px 0 rgba(255,252,240,0.45)',
  '0 1px 0 rgba(255,248,222,0.55)',
].join(', ');

/** Tieň vystúpenej AKTÍVNEJ pilulky (v predlohe HOME a kruh G). */
export const NAV_PILL_SHADOW = [
  'inset 0 2px 0 rgba(255,250,222,0.85)',
  'inset 0 -3px 5px rgba(110,74,20,0.42)',
  '0 3px 6px -1px rgba(70,45,10,0.5)',
].join(', ');

// ── Verzie pre čisté CSS (povrchy mimo Reactu) ──────────────────────────────
// V `PackLayout` sa zrno kreslí ako DVE prekryté vrstvy (`NavGrain`). V CSS ho
// vieme dostať lacnejšie: tmavé zrno ide ako ďalšia vrstva pozadia s
// `background-blend-mode: multiply`, svetlé sa dokresľuje cez `::after`
// (`NAV_GRAIN_SCREEN_CSS`). Počet položiek v `*_BLEND` MUSÍ sedieť s počtom
// vrstiev v `*_BG` — inak prehliadka blend ticho zahodí.
export const NAV_FRAME_BG = `${NAV_GRAIN} 0 0 / 180px 180px, ${NAV_GOLD.frame}`;
export const NAV_FRAME_BLEND = 'multiply, normal';
export const NAV_PLATE_BG = `${NAV_GRAIN} 0 0 / 180px 180px, ${NAV_MOTTLE}, ${NAV_GOLD.surface}`;
export const NAV_PLATE_BLEND = 'multiply, normal, normal, normal, normal';
/** Svetlé zrno — posunutá dlaždica, `mix-blend-mode: screen` na vlastnej vrstve. */
export const NAV_GRAIN_SCREEN_CSS = `
  background-image: ${NAV_GRAIN};
  background-size: 180px 180px;
  background-position: 37px 23px;
  mix-blend-mode: screen;
`;
