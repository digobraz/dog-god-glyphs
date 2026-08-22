// VÝSKYT VRETENICE SEVERNEJ — HRUBÉ OBLASTI, NIE BODY.
//
// Matej 2026-08-21: „našiel som mapku vreteníc na Slovensku ktorá sa pravidelne
// aktualizuje občianskym združením kde ľudia posielajú nálezy — mám len fotku…
// tie vretenice skús od oka, je jasné že sú takmer výlučne na severe, inú mapku
// som nenašiel… kľudne to zakry do veľkých oblastí tak ako je v mapke."
//
// ── ZNAČKA NA KÚT KRAJINY, NIE ŠPENDLÍK NA MIESTO ──────────────────────────
// Zdroj máme len ako SCREENSHOT. Odčítať z neho jednotlivé súradnice znamená
// chybu rádovo kilometre — a špendlík na konkrétnom mieste tvrdí opak: „tu to
// je, o 200 m ďalej nie". Preto je značiek presne toľko, koľko je KÚTOV KRAJINY,
// a to, ktorý kút to je, hovorí NÁZOV v bubline, nie tvar na mape.
//
// ⚠️ VYKRESLENÉ POLYGÓNY SME SKÚSILI A MATEJ ICH ZAMIETOL (21. 8.): „tá červená
// machuľa by nemala byť cez celé SVK, urobme len body resp. väčšie emoji
// v náhľade." Mal pravdu aj vecne, nielen vizuálne — ručne obkreslený obrys
// predstiera hranicu, ktorá v dátach nie je. Súradnica je teraz JEDEN bod
// v ťažisku zhluku a nesľubuje nič viac.
//
// Rovnaký dôvod, prečo to NIE SÚ `map_notes`: členské zápisy majú autora,
// hlasovanie „platí / už neplatí" a dajú sa zmazať. Toto je cudzí dataset —
// nikto z nás ho neoveril a nikto z členov ho nemá prepisovať.
//
// 🔴 ČÍSLA SÚ ODČÍTANÉ Z OBRÁZKA, NIE Z DÁT. Sú to počty značiek spočítané
// okom v danom kúte mapy, preto všade „cca". Akonáhle bude k dispozícii export
// zo zdroja (KML/GeoJSON), tento súbor sa NAHRADÍ generovaným — súradnice aj
// počty. Dovtedy je to najlepšie, čo z fotky čestne vyjde.

/** Kto dáta zbiera. Uvádza sa v bubline — je to ich práca, nie naša. */
export const VIPER_SOURCE = {
  name: 'Plazy na Slovensku',
  org: 'Spolok priateľov herpetofauny Slovenska',
  /** kedy sme z ich mapy odčítali oblasti */
  readAt: '2026-08-21',
} as const;

export interface ViperArea {
  id: string;
  /** SK názov kúta krajiny — nie administratívny kraj, ale to, ako o tom ľudia hovoria */
  name: string;
  nameEN: string;
  /** cca počet nahlásených pozorovaní odčítaný z mapy zdroja */
  finds: number;
  /** kde sedí značka — ťažisko zhluku, NIE nález; rozsah kúta nesie názov, nie tvar */
  at: [number, number];
}

// Štyri kúty namiesto šiestich: mapa zdroja sa číta ako široký severný pás
// s vetvou na severovýchod, nie ako mozaika pohorí.
export const VIPER_AREAS: ViperArea[] = [
  {
    id: 'kysuce-orava-mala-fatra',
    name: 'Kysuce, Orava a Malá Fatra',
    nameEN: 'Kysuce, Orava and Malá Fatra',
    finds: 16,
    // Posunuté na Oravu (pôvodne 49.28/19.12): pri Žiline sedí zhluk pilulek výletov
    // a značka pod nimi zmizla. Zhluk nálezov je aj tak najhustejší severnejšie.
    at: [49.38, 19.32],
  },
  {
    id: 'tatry-liptov',
    name: 'Tatry a Liptov',
    nameEN: 'The Tatras and Liptov',
    finds: 24,
    at: [49.09, 19.88],
  },
  {
    id: 'nizke-tatry-horehronie',
    name: 'Nízke Tatry a Horehronie',
    nameEN: 'Low Tatras and Horehronie',
    finds: 9,
    at: [48.80, 19.92],
  },
  {
    id: 'spis-saris',
    name: 'Spiš a Šariš',
    nameEN: 'Spiš and Šariš',
    finds: 18,
    at: [49.16, 20.98],
  },
];

/** Spolu — do bubliny aj do prípadného popisku vrstvy. */
export const VIPER_FINDS_TOTAL = VIPER_AREAS.reduce((n, a) => n + a.finds, 0);
