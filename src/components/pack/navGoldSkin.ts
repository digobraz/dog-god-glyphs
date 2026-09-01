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

/**
 * Výška predlohy v pixeloch — vzdialenosť, na ktorej sa gradienty odohrajú.
 *
 * Bar meria ~56 px, jeho doska (bar mínus dva lemy) ~44 px. Odtiaľto sa počítajú px-zastávky
 * rámu aj dosky, takže KAŽDÝ blok — či je vysoký 56 px alebo 900 px — má v prvých 56 px tú
 * istú cestu farby ako bar a potom sa už len drží na koncovom odtieni.
 */
const FRAME_H = 56;
const PLATE_H = FRAME_H - NAV_R.rim * 2;

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
export const NAV_GRAIN = grainURI(1);

/**
 * Zrno so ZVOLENOU silou.
 *
 * V navigácii sa krytie nastavuje na prekrytej vrstve (`NavGrain` = dva divy s `opacity`).
 * Bledý blok (`goldFrameCSS`) žiadne vnorené divy nemá — zrno je tam vrstva POZADIA, a tá
 * vlastné `opacity` nemá. Sila sa preto pečie priamo do obrázka: posledný riadok matice
 * počíta alfu (`A = 1.8·R − 0.65`), takže vynásobením oboch čísel vznikne to isté zrno,
 * len redšie. Bez toho by bola jediná dostupná sila „naplno" a doska by vyzerala ako šmirgeľ.
 */
export function grainURI(k: number): string {
  const a = (1.8 * k).toFixed(3);
  const b = (-0.65 * k).toFixed(3);
  return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 "
    + `${a} 0 0 0 ${b}`
    + "'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";
}

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

/**
 * MRAMOROVANIE PRE BLOK — to isté, ale v pixeloch (2026-08-26, 2. kolo).
 *
 * ⚠️ `NAV_MOTTLE_LAYERS` sa na blok dať NEDÁ a nie je to opomenutie: jeho prvá vrstva je
 * `75% 130%` VÝŠKY PRVKU, takže na 44 px doske baru je z nej jemný presvit pri hornej hrane,
 * ale na 860 px paneli svetlý záplav cez celú plochu pri 0.6 alfa. Presne to zhodilo 1. pokus
 * bledého panela 26. 8. — doska vyzerala krémovo a karty na nej zanikli.
 *
 * V pixeloch robí tá istá deklarácia to isté na oboch: presvetlí prvé desiatky pixelov pod
 * horným lemom. Bez nej je doska bloku o odtieň sýtejšia než doska baru — jediný rozdiel,
 * ktorý po zosúladení rámu ostal.
 *
 * Vinetácia (druhá vrstva) ostáva v percentách: jej úloha je „zašpiniť okraje", a tú plní na
 * každej veľkosti rovnako. Alfa je nižšia než v bare — na veľkej ploche je jej cesta dlhšia.
 */
export const PLATE_MOTTLE_LAYERS = [
  'radial-gradient(495px 57px at 22% 3px, rgba(255,252,236,0.60), transparent 62%)',
  // ⚠️ Alfa klesla z 0.10 na 0.07 spolu so zosvetlením dosky (viď PANEL_SURFACE): pôvodné
  // zašpinenie okrajov bolo odmerané na tmavší pieskovec a na bledšom vyzeralo ako flek.
  'radial-gradient(140% 100% at 50% 50%, transparent 48%, rgba(112,76,20,0.07) 100%)',
];

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

/**
 * VONKAJŠIA časť tieňa rámu — vrhnutý tieň a tmavá spodná hrana.
 *
 * Oddelené od insetov zámerne: jednoelementový blok (`goldFrameCSS`) kreslí `inset` vnútri
 * DOSKY, nie v leme, takže by mu insety rámu presvetlili horný okraj dosky presne tam, kde
 * má byť zapustená. Berie si preto len tieto dva.
 */
export const NAV_FRAME_SHADOW_OUTER = [
  '0 12px 26px -8px rgba(0,0,0,0.72)',
  '0 3px 0 -1px rgba(70,46,12,0.5)',
].join(', ');

/** Tieň DOSKY — zapustená do rámu (horný vnútorný tieň), spodná hrana presvetlená. */
export const NAV_PLATE_SHADOW_INSET = [
  'inset 0 2px 5px rgba(96,64,16,0.42)',
  'inset 0 -1px 0 rgba(255,252,240,0.45)',
].join(', ');

export const NAV_PLATE_SHADOW = `${NAV_PLATE_SHADOW_INSET}, 0 1px 0 rgba(255,248,222,0.55)`;

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
//
// ⚠️ ZASTÁVKY SÚ V PIXELOCH, NIE V PERCENTÁCH (Matej 2026-08-26: „1. krok je blok inej
// farby ako úvod… bloky musia byť všade rovnaké"). Mal pravdu a príčina nebola vo farbe:
// gradient v percentách sa VŽDY roztiahne na výšku prvku, takže tá istá deklarácia dala
// na 860 px vysokom paneli svetlý vrch (spodný odtieň bol až úplne dole) a na 200 px
// vysokom doku takmer celý spodný odtieň naraz. Dva bloky vedľa seba, jedna deklarácia,
// dve rôzne farby.
//
// V pixeloch prejde plocha rovnakú cestu bez ohľadu na to, aká je vysoká — nízky blok
// jednoducho nedôjde na koniec. Čísla sú prepočítané z pôvodných percent na výšku ľavého
// panela (~860 px), aby sa VYSOKÝ panel nezmenil ani o odtieň; mení sa len to, čo robia
// NÍZKE bloky.
//
// ── DOSKA JE BLEDŠIA NEŽ DOSKA BARU (Matej 2026-08-26, večer) ───────────────────────────
// „vnútro toho bloku všade — aj v /map, aj v tripflow — môžeš dať bledšie, je to až moc tmavé."
//
// ⚠️ JE TO VEDOMÝ ROZCHOD S PREDLOHOU, NIE ZABUDNUTÁ SYNCHRONIZÁCIA. Ranný lock hovorí, že
// blok kopíruje spodný bar (`NAV_GOLD.surface`), a to platí ďalej pre TVAR: polomer, hrúbku
// lemu, gradient v leme, zrno aj tiene. Rozchádza sa jediná vec — svetlosť dosky. Dôvod je
// v tom, čo na tej doske stojí: bar nesie štyri ikonky, blok nesie formulár. Odtieň, ktorý
// na 44 px vysokom prúžku vyzerá ako kameň, je na 860 px paneli plocha, na ktorej bledé
// polia (`PALE.field` = #FBF5E6) takmer zaniknú — text a vstupy potrebujú viac rozdielu
// medzi papierom a tým, čo je naň napísané.
// Hodnoty sú posunuté k papyrusu karty (`T.cardGrad`), aby doska stála v tej istej rodine
// ako bledé bloky vo zvyšku `/pack`, nie ako štvrtý odtieň navyše.
export const PANEL_SURFACE =
  `linear-gradient(180deg, #FBF3E0 0px, #F4E7C6 ${Math.round(PLATE_H * 0.42)}px,`
  + ` #EDDCB2 ${Math.round(PLATE_H * 0.72)}px, #E4D0A0 ${PLATE_H}px)`;

/**
 * ── RÁM V PIXELOCH — PRÍČINA, PREČO BOL BLOK „INEJ FARBY" (2026-08-26, 2. kolo) ─────────
 *
 * Matej: „1. blok nie je totožný a súrodý s ostatným webom — okraje aj farebnosť sú iné…
 * predloha je spodný nav v /map, tieňovanie aj farebnosť aj hrúbka okraja."
 *
 * `NAV_GOLD.frame` je `180deg` gradient cez CELÝ prvok. V nave (výška ~56 px) sa doň zmestí
 * celá cesta leštenej zlatej: horný lem svetlý, boky prechod, spodný lem tmavý bronz. Na
 * 860 px vysokom paneli tá istá deklarácia znamená, že horný 6 px lem ukazuje prvé 0,7 %
 * gradientu — teda takmer bielu — a boky sa menia tak pomaly, že rám nikde nevyzerá ako
 * kov. Preto pôsobil vyblednuto a „inak" než bar, hoci farby boli tie isté.
 *
 * V pixeloch prejde lem rovnakú cestu bez ohľadu na výšku bloku. Pod `FRAME_H` sa gradient
 * už len drží na spodnom odtieni, takže spodný lem vysokého panela je rovnako tmavý ako
 * spodný lem baru. To isté zistenie ako pri doske (viď `PANEL_SURFACE`) — len o vrstvu vyššie.
 */
export const NAV_FRAME_PX =
  `linear-gradient(180deg, #FCF0C2 0px, #EDCE7C ${Math.round(FRAME_H * 0.2)}px,`
  + ` #D8B052 ${Math.round(FRAME_H * 0.5)}px, #C09636 ${Math.round(FRAME_H * 0.78)}px,`
  + ` #AA8129 ${FRAME_H}px)`;

/**
 * ── JEDEN TVAR PRE VŠETKY BLOKY — LOCK 2026-08-26 ──────────────────────────────────────
 *
 * Matej: „toto musíme ujasniť a aplikovať všade, locknúť dizajn, aby sme nerobili zbytočne
 * viacero variant."
 *
 * Do teraz mala každá zlato-rámovaná plocha vlastnú dvojicu: ľavý panel a dok 18/6, vstupný
 * popup 20/7, stavový riadok hlavičky 14/5, nav 14/6. Štyri varianty toho istého bloku na
 * jednej obrazovke — a keďže sa polomer aj hrúbka lemu líšili o jednotky pixelov, nedalo sa
 * to pomenovať inak než „nejak to nesedí".
 *
 * ⚠️ ČÍSLA SÚ NAVOVE (`NAV_R`), nie priemer. Predloha je bar, takže sa neladí — kopíruje.
 * Kto potrebuje iný tvar, potrebuje iný DRUH prvku, nie iný blok.
 */
export const BLOCK = { radius: NAV_R.frame, rim: NAV_R.rim } as const;

/**
 * Polomer DLAŽDICE NA DOSKE — druhá a posledná geometria bloku.
 *
 * Dlaždica je to, čo na doske stojí a dá sa na to kliknúť: druh zápisu vo vstupnom popupe
 * (`.att-entry-block`) aj aktivita v kroku 1 (`.atl-tile`). Výplň (`T.cardGrad`), rám
 * (`T.cardEdge`) aj tieň mali obe zhodné už predtým — rozchádzal sa len polomer (16 vs. 12),
 * čo pri prechode z popupu do panela vyzeralo, že sa dlaždice cestou premenili.
 */
export const PLATE_TILE_R = 12;

/**
 * ── MASÍVNY RÁM — VEDOMÁ VÝNIMKA Z LOCKU „JEDEN TVAR" (2026-08-26, 2. kolo) ──────────────
 *
 * Matej: „ľavý blok by si zaslúžil masívnejšie okraje, možno aj jemne zdobené — nejaký
 * jednoduchý anticko-egyptský dizajn, reliéf… nie ornamenty!"
 *
 * Lock z toho istého dňa hovorí, že bloky majú jeden tvar (`BLOCK` = 14/6, čísla baru). Táto
 * výnimka ho NERUŠÍ a je úzka zámerne: platí LEN pre stĺpec, ktorý stojí cez celú výšku
 * obrazovky — ľavý panel a hostiteľa formulára pridávania. Bar je 56 px vysoký prvok, panel
 * 860 px; 6 px lem, ktorý na bare vyzerá ako odliatok, na paneli vyzerá ako linka.
 *
 * ⚠️ VNÚTORNÝ POLOMER RASTIE S LEMOM — 24 − 12 = 12, nie 8 (2026-08-26, oprava po Matejovom
 * „vnútorné rohy v ľavom bloku nekolidujú, vyzerá to zle").
 * Prvý pokus držal vnútro na 8, aby sa doska „nezmenila oproti baru". Bola to chyba: pri 6 px
 * leme je 8 taký istý oblúk ako vonkajších 14, ale pri 12 px leme stojí vedľa vonkajších 20
 * takmer hranatý roh. Rovnaká HRÚBKA lemu v rohu (outer − inner) nestačí — oko porovnáva
 * ZAKRIVENIE, a dva oblúky s pomerom 20 : 8 nečíta ako jeden prvok.
 * Pravidlo pre ďalšie tvary: vnútorný polomer drž zhruba na polovici vonkajšieho.
 */
export const SLAB = { radius: 24, rim: 12 } as const;

/**
 * ── PREČO TU NIE JE FUNKCIA NA BEVEL (2026-08-26, tri pokusy, všetky zamietnuté) ─────────
 *
 * Pokus 1: plný `NAV_FRAME_SHADOW` na ráme s výrezom → insety sa kreslia od padding-boxu, teda
 *          NA DOSKE. Matej: „vytvoril si dvojitý okraj na bokoch."
 * Pokus 2: insety presunuté na pseudoelement `inset:0` (padding-box = celý box, hrany teda
 *          pristanú na vonkajšom okraji zlata). Geometricky správne — a stále zle: rozostrené
 *          pásy (`inset 0 10px 12px -8px`) sú dlhšie než lem, takže dohoria presne na hranici
 *          dosky. Matej: „ľavá strana je zložená akoby z dvoch vrstiev."
 * Pokus 3: tie isté hrany bez rozostrenia. V ROHU sa horná a bočná linka spoja a s polomerom
 *          rámu vykreslia široký svetlý oblúk — lem tam opticky zdvojnásobí hrúbku.
 *
 * ⚠️ ZÁVER: modeláciu nesie GRADIENT v leme (`NAV_FRAME_PX`, od takmer bielej po bronz) a dve
 * 1px linky — vonkajší obrys (`0 0 0 1px edge`) a obrys dosky (`inset 0 0 0 1px edge`).
 * Overené vypnutím pseudoelementu naživo: bez neho je roh čistý a lem má rovnakú hrúbku po
 * celom obvode. Kto sem bude chcieť vrátiť bevel, nech najprv odfotí ROH pri 4× priblížení —
 * na 1× je rozdiel neviditeľný a všetky tri pokusy vyzerali na prvý pohľad v poriadku.
 */


/**
 * Rám + doska JEDNÝM elementom, bez vnoreného divu.
 *
 * `border: <rim>px solid transparent` + viacvrstvové pozadie (`padding-box` pre dosku a jej
 * zrno, `border-box` pre zlato a jeho zrno) nakreslí to isté, čo v navigácii robia dva
 * vnorené divy a štyri prekryvy `NavGrain`. Prečo takto: `.trp-sidebar` má tri swapované
 * stavy obsahu a `.trp-addhost` hostí cudzí komponent — wrapper by musel obísť všetky štyri
 * miesta a pri ďalšom stave by sa naň zabudlo.
 *
 * ⚠️ ZRNO JE POVINNÁ ČASŤ MATERIÁLU, NIE OZDOBA. Bar má pieskovec so speklou, panel mal
 * hladkú plochu — vedľa seba to boli dva rôzne materiály skôr, než sa dala porovnať farba.
 * V pozadí sa krytie nastaviť nedá, preto `grainURI(k)` (viď tam).
 *
 * ⚠️ POČET POLOŽIEK V `background-blend-mode` MUSÍ SEDIEŤ S POČTOM VRSTIEV. Pri nezhode
 * prehliadač blend ticho zahodí a zo zrna sa stane šedý závoj cez celý blok.
 *
 * ⚠️ INSET TIENE PATRIA DOSKE, NIE RÁMU. Pri jednom elemente sa `inset` kreslí od hranice
 * padding-boxu, teda VNÚTRI dosky — nie v leme. Preto sa tu berie `NAV_PLATE_SHADOW`
 * (doska zapustená do rámu), nie insety z `NAV_FRAME_SHADOW`: tie v nave ležia na ráme, tu
 * by presvetlili horný okraj dosky a blok by vyzeral plocho. Z `NAV_FRAME_SHADOW` sa berie
 * len to, čo je VONKU — vrhnutý tieň a tmavá spodná hrana.
 */
export function goldFrameCSS(opts: {
  radius?: number;
  rim?: number;
  surface?: string;
  /** Mramorovanie. Východisko = px-verzia navovho (`PLATE_MOTTLE_LAYERS`). */
  mottle?: string[];
  /**
   * `false` = ZLATO VYPĹŇA CELÝ BLOK, doska sa nekreslí (viď `goldPlateCSS`).
   *
   * Pre blok s VÝREZOM: doska v ňom nie je plocha od lemu k lemu, ale samostatný prvok,
   * ktorý časť zlata necháva odkrytú. Jedným elementom sa to nakresliť nedá — doska má
   * zaoblený ľavý okraj a gradient roh nezaoblí.
   */
  plate?: boolean;
} = {}): string {
  const {
    radius = BLOCK.radius, rim = BLOCK.rim,
    surface = PANEL_SURFACE, mottle = PLATE_MOTTLE_LAYERS, plate = true,
  } = opts;
  const frameLayers = [
    `${grainURI(0.18)} 0 0 / 180px 180px border-box`,
    `${NAV_FRAME_PX} border-box`,
  ];
  if (!plate) {
    // ⚠️ LEN vrstvy `border-box` — a nie je to skratka. `border-box` sa kreslí cez CELÝ prvok
    // (vrátane padding-boxu), takže zlato je jedna súvislá plocha a gradient prejde svoju
    // cestu raz. Pridať tie isté vrstvy ešte raz s `padding-box` by ich pod lemom REŠTARTOVALO
    // (poloha 0 0 = vrch padding-boxu) a hneď pod horným lemom by vznikol svetlý pás.
    // ⚠️ LEN VONKAJŠIA ČASŤ TIEŇA. Plný `NAV_FRAME_SHADOW` sem NEPATRÍ: jeho insety sa kreslia
    // od hranice PADDING-BOXU, a tá je pri bloku s výrezom presne tam, kde začína doska —
    // svetlá horná hrana aj tmavé bočnice teda pristanú NA DOSKE, hneď vedľa jej vlastného
    // obrysu, a vyzerá to ako druhý, širší rám. Presne to Matej videl 26. 8.: „na pravej strane
    // je stále vidno zdvojený okraj, hore dolu aj naľavo."
    // Bevel sa preto NEKRESLÍ VÔBEC — modeláciu nesie gradient v leme a dve 1px linky
    // (vonkajší obrys a obrys dosky). Tri zamietnuté pokusy o bevel sú popísané nižšie.
    return `border:${rim}px solid transparent;border-radius:${radius}px;position:relative;`
      + `background:${frameLayers.join(',')};`
      + 'background-blend-mode:multiply,normal;'
      + `box-shadow:0 0 0 1px ${NAV_GOLD.edge},${NAV_FRAME_SHADOW_OUTER};`;
  }
  const plateLayers = platePaintLayers(surface, mottle);
  const blend = [
    ...plateBlend(mottle),
    'multiply',
    'normal',
  ].join(',');
  return `border:${rim}px solid transparent;border-radius:${radius}px;`
    + `background:${[...plateLayers, ...frameLayers].join(',')};`
    + `background-blend-mode:${blend};`
    + `box-shadow:inset 0 0 0 1px ${NAV_GOLD.edge},${NAV_PLATE_SHADOW_INSET},`
    + `0 0 0 1px ${NAV_GOLD.edge},${NAV_FRAME_SHADOW_OUTER};`;
}

/** Vrstvy DOSKY — zdieľané medzi blokom (`goldFrameCSS`) a samostatnou doskou (`goldPlateCSS`). */
function platePaintLayers(surface: string, mottle: string[]): string[] {
  return [
    `${grainURI(0.28)} 37px 23px / 180px 180px padding-box`,
    `${grainURI(0.36)} 0 0 / 180px 180px padding-box`,
    ...mottle.map((l) => `${l} padding-box`),
    `${surface} padding-box`,
  ];
}
function plateBlend(mottle: string[]): string[] {
  return ['screen', 'multiply', ...mottle.map(() => 'normal'), 'normal'];
}

/**
 * DOSKA AKO SAMOSTATNÝ PRVOK — druhá polovica bloku s VÝREZOM (2026-08-26).
 *
 * Matej: „urobme taký výrez kedy ľavá časť horného navu bude mať ako keby plný okraj."
 * Doska teda nezačína pri leme — časť plochy ostáva holé zlato a identita (avatar, rang,
 * level) stojí priamo na ňom.
 *
 * Materiál je TEN ISTÝ, aký nesie doska bloku — obe vetvy si vrstvy berú z
 * `platePaintLayers()`. Druhá kópia gradientov by sa rozišla pri prvej úprave predlohy a
 * doska vo výreze by prestala byť z toho istého pieskovca ako doska panela vedľa nej.
 *
 * ⚠️ POLOMER = `NAV_R.plate` (8), nie `BLOCK.radius` (14). Je to VNÚTORNÝ tvar — v bare ho
 * kreslí to isté číslo (rám 14 mínus lem 6). Doska s polomerom rámu vyzerá ako druhý blok
 * položený na prvom, nie ako plocha zapustená doň.
 */
export function goldPlateCSS(opts: {
  radius?: number;
  surface?: string;
  mottle?: string[];
} = {}): string {
  const { radius = NAV_R.plate, surface = PANEL_SURFACE, mottle = PLATE_MOTTLE_LAYERS } = opts;
  return `border-radius:${radius}px;`
    + `background:${platePaintLayers(surface, mottle).join(',')};`
    + `background-blend-mode:${plateBlend(mottle).join(',')};`
    + `box-shadow:inset 0 0 0 1px ${NAV_GOLD.edge},${NAV_PLATE_SHADOW_INSET};`;
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
// 🔵 BRANDOVÝ KÁNON od 28. 8. 2026. Matej: „CTA má byť v lapise (náš nový brand
// — poznač si to už)." Tým padol jeho vlastný hold z 26. 8. („zatiaľ to
// nezapisuj ale používajme to pri redizajne") a pravidlo je zapísané v CLAUDE.md.
// ⚠️ Zapísané NEZNAMENÁ plošne nasadené: `.btn-gold` na povrchoch, kde redizajn
// ešte nebol, nie je bug. Prepnutie zvyšku appky je samostatná úloha.
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

// ── VÝBER JE PRIESVITNÝ TINT, NIE PLNÁ FARBA (2026-08-26, 3. kolo) ──────────
// Matej: „výber PWT som chcel modré/zelené/červené, ale PRIESVITNÉ — nie modrá plná,
// to sa bije s CTA… výbery chipov budú priesvitné, nie plné farby, aj ďalej pri
// označovaní náročnosti, tagov a podobne."
//
// PREČO SA TO BIJE: hlavné CTA je jediná plná farebná plocha na doske (LAPIS_BTN_SHADOW).
// Keď tú istú váhu dostane aj chip, ktorý človek práve klikol, obrazovka má dve „hlavné"
// veci a ani jedna nevedie. Tint drží FAREBNÝ VÝZNAM (modrá = moja voľba, zelená = hotové,
// červená = chýba), ale váhu si necháva tlačidlo.
//
// ⚠️ NIE JE TO NÁVRAT PRED 26. 8. Vtedy tu bola zelená pri 12–14 % so SVETLÝM inkoustom a
// na papyruse z toho ostal svetlý text na takmer bielom — práve preto sa siahlo po plnej
// výplni. Tint sám o sebe nestačí: čitateľnosť nesie TMAVÝ inkoust a plný farebný rám,
// nie krytie výplne. Preto je to funkcia a nie tri rgba čísla opísané po súboroch.
function rgbOf(hex: string): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

/**
 * @param hex   farba významu (modrá voľba / zelená hotovo / červená chýba)
 * @param ink   inkoust — TMAVÝ odtieň tej istej farby, nie čierna a nie biela
 * @param alpha krytie výplne; na papyruse stačí málo, doska je svetlá
 */
export function pickTintCSS(hex: string, ink: string, alpha = 0.16): string {
  const rgb = rgbOf(hex);
  return `background:rgba(${rgb},${alpha});border-color:${hex};color:${ink};`
    + `box-shadow:inset 0 0 0 1px rgba(${rgb},0.45);`;
}

/** Tmavé odtiene tých istých troch farieb — inkoust tintu na papyruse. */
export const PICK_INK = {
  lapis: '#0F2560',
  green: '#1F5C33',
  red: '#8E2A20',
} as const;

/** To isté krytie, ale ako hodnota — pre prvky, ktoré si farbu nesú inline (mriežka druhov). */
export function tintRGBA(hex: string, alpha: number): string {
  return `rgba(${rgbOf(hex)},${alpha})`;
}
