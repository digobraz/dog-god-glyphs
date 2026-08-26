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
// ⚠️ Vrstvy sú POLE, nie jeden reťazec: bledý panel (`goldFrameCSS` nižšie) ich
// musí vedieť poskladať s vlastným `padding-box` sufixom, a rozdeliť hotový
// reťazec čiarkou sa nedá — čiarky sú aj vnútri každého gradientu.
export const NAV_MOTTLE_LAYERS = [
  'radial-gradient(75% 130% at 22% 6%, rgba(255,252,236,0.6), transparent 62%)',
  'radial-gradient(88% 145% at 50% 50%, transparent 48%, rgba(112,76,20,0.13) 100%)',
  'radial-gradient(45% 95% at 78% 96%, rgba(112,76,20,0.11), transparent 66%)',
];
export const NAV_MOTTLE = NAV_MOTTLE_LAYERS.join(', ');

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

// ── BLEDÝ PANEL — ten istý rám ako nav, len na veľkej ploche (2026-08-26) ────
// Matej: „ľavý panel bude bledý s okrajom ako má aj spodný nav a to isté platí
// aj o vrchnom headri."
//
// Doska panela = TIE ISTÉ farby pieskovca ako v nave, len rozložené na inú výšku.
// Nav ide #F1DFB6 → #D6BC85 cez 48 px; na 950 px vysokom paneli by tá istá cesta
// spravila zo spodku panela súmrak, takže gradient prejde väčšinu rozdielu hneď
// v hornej tretine a potom sa už len drží.
//
// ⚠️ MRAMOROVANIE (`NAV_MOTTLE`) SA NA PANEL NEDÁVA a nie je to opomenutie: jeho
// vrstvy sú v PERCENTÁCH prvku (`75% 130% at 22% 6%`), takže na pilulke sú to
// jemné škvrny, ale na paneli je z prvej vrstvy svetlý záplav cez celú plochu
// pri 0.6 alfa. Presne to zhodilo 1. pokus — doska vyzerala krémovo a karty na
// nej zanikli, hoci farba dosky bola správna.
export const PANEL_SURFACE =
  'linear-gradient(180deg, #F1DFB6 0%, #E6D3A0 26%, #E0CB94 62%, #DCC68C 100%)';

/**
 * Rám + doska JEDNÝM elementom, bez vnoreného divu.
 *
 * `border: <rim>px solid transparent` + dvojité pozadie (`padding-box` pre
 * dosku, `border-box` pre zlato) nakreslí to isté, čo v navigácii robia dva
 * vnorené divy. Prečo takto: `.trp-sidebar` má tri swapované stavy obsahu a
 * `.trp-addhost` hostí cudzí komponent — wrapper by musel obísť všetky štyri
 * miesta a pri ďalšom stave by sa naň zabudlo.
 *
 * Tmavé obrysy nesú box-shadow ringy: vonkajší `0 0 0 1px` je za rámom,
 * `inset 0 0 0 1px` sa kreslí po hranici padding-boxu, teda presne na styku
 * rámu a dosky. Bez tej vnútornej linky rám „pretečie" do dosky (to isté
 * zistenie ako pri nave, 24. 8.).
 */
export function goldFrameCSS(opts: {
  radius: number;
  rim: number;
  surface?: string;
  shadow?: string;
  /** Mramorovanie. Východisko je PRÁZDNE — viď varovanie pri `PANEL_SURFACE`. */
  mottle?: string[];
}): string {
  const { radius, rim, surface = PANEL_SURFACE, shadow = NAV_FRAME_SHADOW, mottle = [] } = opts;
  const plate = [...mottle, surface].map((l) => `${l} padding-box`).join(',');
  return `border:${rim}px solid transparent;border-radius:${radius}px;`
    + `background:${plate},${NAV_GOLD.frame} border-box;`
    + `box-shadow:0 0 0 1px ${NAV_GOLD.edge},inset 0 0 0 1px ${NAV_GOLD.edge},${shadow};`;
}

// ── PREPÍNAČ BLEDÉHO SKINU PC CHROME MAPY (2026-08-26) ──────────────────────
// Žije TU, a nie v `PackMap.tsx`, lebo ten istý prepínač potrebujú aj listové
// moduly toku pridávania (`AddTripLog`, `GeometryPicker`, `AddMapNote`,
// `mapDockShape`) — a tie `PackMap` importuje, takže opačný smer by bol kruh.
// Vzor je `NAV_SKIN` v `PackLayout.tsx`: zamietnutie sa vracia jedným slovom,
// nie hľadaním pôvodných hodnôt v gite.
export const MAP_SKIN: 'pale' | 'glass' = 'pale';

/**
 * Hranica, od ktorej je chrome mapy bledý. JEDNO číslo pre CSS aj pre JS
 * (`useIsPaleChrome`) — dve rôzne hranice vyrobia pásmo šírok bez pravidiel,
 * kde je panel už papyrusový, ale komponent si o sebe ešte myslí, že je tmavý.
 * Zhodné s hranicou, na ktorej `PackMap.tsx` skrýva `.trp-sidebar`/`.trp-topbar`.
 */
export const PALE_PC_MIN = 1024;

// Inkoust a plochy bledého chrome — jedna sada pre všetky súbory toku, nech sa
// v piatich CSS blokoch neopakujú tie isté rgba čísla (a nerozídu sa).
// Zdroj hodnôt = `packTheme.ts`; `PALE.deep` je jediná, ktorá tam nie je:
// `cardEdge` (#C99A3F) je NA papyruse slabá, na zvýraznený stav treba tmavšiu.
export const PALE = {
  ink: '#2a1608',
  dim: '#7a5a2a',
  faint: 'rgba(42,22,8,0.42)',
  edge: '#C99A3F',
  deep: '#8A5F1E',
  border: 'rgba(179,130,45,0.55)',
  hair: 'rgba(179,130,45,0.26)',
  field: '#FBF5E6',
  soft: 'rgba(255,251,240,0.55)',
  hot: 'rgba(201,154,63,0.20)',
} as const;

// ── LAPIS — akcia a voľba na bledom povrchu (2026-08-26) ────────────────────
// ⚠️ PRACOVNÝ NÁVRH, NIE BRANDOVÝ KÁNON. Matej ho odklepol pre redizajn `/map`
// („zatiaľ to nezapisuj ale používajme to pri redizajne"), do brand manuálu ani
// do CLAUDE.md sa NEZAPISUJE, kým redizajn nie je hotový a schválený.
//
// PREČO VZNIKOL: na papyruse je zlatá naraz rámom, dlaždicou aj tlačidlom, takže
// hlavné CTA je najsvetlejší prvok panela a splýva s tým, čo ho drží. Zlatá sa
// preto zúžila na konštrukciu a druhá farba prevzala akciu.
//
// PRAVIDLO (test pri každom novom prvku — „je to nábytok, alebo to urobím ja?"):
//   ZLATO = konštrukcia a poloha — rám, doska, čiary, nav, aktívna pilulka navu,
//           aktívny krok, obrys dlaždice. Odpovedá na „kde som".
//   LAPIS = moja voľba a moja akcia — hlavné CTA, označený chip, vybraná dlaždica,
//           zaostrené pole, pilulka bodov. Odpovedá na „čo som urobil / urobím".
// Červená (mazanie) a zelená (splnené) nesú význam a ostávajú, ako sú.
//
// ⚠️ NIE JE TO `T.brandBlue`. Egyptská modrá #1034A6 (a jej svetlá #2E5FD0) drží
// ZNAČKY NA MAPE — parkovisko, lem udalostí, „ideš s niekým". Lapis je tmavšia a
// vždy ako PLNÁ VÝPLŇ v chrome; mapová modrá je vždy svetlý lem na bielom kruhu.
// Iná hodnota, iný tvar, iná vrstva — to je jediné, čo ich drží oddelene, takže
// lapis sa na mapové značky nesmie použiť a modrá na tlačidlá.
//
// Zlaté písmo na tlačidle nie je ozdoba — bez neho je z lapisu len tmavé tlačidlo
// bez príslušnosti k brandu (lapis + zlato je pôvodná egyptská dvojica).
export const LAPIS = {
  /** Rám, obrys chipu, halo zaostreného poľa. */
  edge: '#16307A',
  /** Spodok gradientu tlačidla, inkoust označeného chipu. */
  deep: '#0A1A4A',
  /** Vrch hover gradientu. */
  lite: '#1E3C90',
  /** Výplň hlavného CTA a pilulky bodov. */
  grad: 'linear-gradient(180deg,#16307A,#0A1A4A)',
  /** Hover CTA — o odtieň svetlejší, nie iný gradient. */
  gradHover: 'linear-gradient(180deg,#1E3C90,#0F2560)',
  /** Zlaté písmo NA lapise. */
  ink: '#EFD79A',
  /** Výplň označeného chipu na papyruse — priehľadná, aby doska presvitala. */
  fill: 'rgba(22,48,122,0.12)',
  /** Halo okolo zaostreného poľa a vybranej dlaždice. */
  halo: 'rgba(22,48,122,0.22)',
} as const;

/** Tieň hlavného CTA — odliatok ako nav, len v modrej: vrhnutý tieň + zlatá horná hrana. */
export const LAPIS_BTN_SHADOW = [
  '0 4px 13px -3px rgba(5,15,48,0.6)',
  'inset 0 1px 0 rgba(201,154,63,0.30)',
].join(', ');
