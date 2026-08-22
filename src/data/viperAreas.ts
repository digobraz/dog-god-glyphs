// VÝSKYT VRETENICE SEVERNEJ — BODY ODČÍTANÉ Z MAPKY ZDROJA.
//
// Matej 2026-08-21: „našiel som mapku vreteníc na Slovensku ktorá sa pravidelne
// aktualizuje občianskym združením kde ľudia posielajú nálezy — mám len fotku…
// tie vretenice skús od oka, je jasné že sú takmer výlučne na severe."
// Matej 2026-08-22: „tie vretenice rozšírme… daj ako su na tej mapke čo najviac
// ako vieš."
//
// ── TRI PODOBY ZA DVA DNI, A KAŽDÁ PADLA Z INÉHO DÔVODU ────────────────────
// 1. POLYGÓNY (21. 8.) — zamietnuté: „tá červená machuľa by nemala byť cez celé
//    SVK". Ručne obkreslený obrys predstiera hranicu, ktorú dáta nemajú.
// 2. ŠTYRI ZNAČKY NA KÚT KRAJINY (21. 8.) — technicky čestné, ale prázdne:
//    celý Šariš, Bardejov aj Kysuce ostali bez značky, hoci nálezy tam sú.
// 3. **97 BODOV** (22. 8., toto) — hustota a rozloženie sedia na predlohu,
//    presnosť si vrstva nenárokuje (viď poistky pri `VIPER_POINTS`).
//
// Prečo to NIE SÚ `map_notes`: členské zápisy majú autora, hlasovanie
// „platí / už neplatí" a dajú sa zmazať. Toto je cudzí dataset — nikto z nás ho
// neoveril a nikto z členov ho nemá prepisovať. Preto sa ani nezhlukuje spolu
// s upozorneniami svorky: jedno číslo nad oboma by tvrdilo, že za polovicou
// stoja členovia.
//
// Akonáhle bude k dispozícii export zo zdroja (KML/GeoJSON), `VIPER_POINTS` sa
// NAHRADÍ generovaným zoznamom skutočných nálezov a generátor zanikne.

/** Kto dáta zbiera. Uvádza sa v bubline — je to ich práca, nie naša. */
export const VIPER_SOURCE = {
  name: 'Plazy na Slovensku',
  org: 'Spolok priateľov herpetofauny Slovenska',
  /** kedy sme z ich mapy odčítali oblasti */
  readAt: '2026-08-21',
} as const;

export interface ViperPoint {
  id: string;
  /** SK názov kúta krajiny — nie administratívny kraj, ale to, ako o tom ľudia hovoria */
  name: string;
  nameEN: string;
  /** poloha odčítaná OKOM z mapky zdroja — orientačná, nie nález na súradnici */
  at: [number, number];
}

// ── JEDEN BOD = JEDEN NÁLEZ Z MAPKY ZDROJA (Matej 2026-08-22) ───────────────
// „tie ikonky vretenic tam daj ako su na tej mapke čo najviac ako vieš."
//
// Dvanásť „kútov krajiny" z rána nahradilo 97 bodov. Presné súradnice zo
// screenshotu odčítať nejde, ale HUSTOTA a ROZLOŽENIE áno — a to je to, čo mapa
// má povedať. Body preto GENERUJE `plany/gen-viper-points.mjs`: v každom kúte
// rozsype toľko bodov, koľko sa v ňom na mapke počíta, v elipse zhruba na tvar
// toho kúta. Semienko je pevné, takže výstup je vždy ten istý.
//
// ⚠️ NEEDITUJ TENTO ZOZNAM RUČNE — uprav REGIONS v generátore a pusti ho znova.
//
// 🔴 ČESTNOSŤ JE V DVOCH POISTKÁCH, NIE V ČÍSLACH:
//   1. bublina hovorí nahlas, že poloha je odčítaná okom a je orientačná;
//   2. vrstva sa nad `VIPER_MAX_ZOOM` NEKRESLÍ, takže sa nikdy nedostane do
//      priblíženia, kde by špendlík tvrdil „vretenica je presne TU".
// Bez druhej poistky by z toho bolo presne to, čo Matej zamietol pri polygónoch:
// tvar, ktorý predstiera presnosť, ktorú dáta nemajú.
export const VIPER_POINTS: ViperPoint[] = [
// <<< VIPER_POINTS_GENERATED — needituj ručne, uprav stav a pusti generátor
  { id: 'kysuce-1', name: 'Kysuce a Javorníky', nameEN: 'Kysuce and the Javorníky', at: [49.4342, 19.1135] },
  { id: 'kysuce-2', name: 'Kysuce a Javorníky', nameEN: 'Kysuce and the Javorníky', at: [49.3861, 19.0343] },
  { id: 'kysuce-3', name: 'Kysuce a Javorníky', nameEN: 'Kysuce and the Javorníky', at: [49.4639, 18.6391] },
  { id: 'kysuce-4', name: 'Kysuce a Javorníky', nameEN: 'Kysuce and the Javorníky', at: [49.4344, 18.5616] },
  { id: 'kysuce-5', name: 'Kysuce a Javorníky', nameEN: 'Kysuce and the Javorníky', at: [49.5199, 18.9185] },
  { id: 'kysuce-6', name: 'Orava a Horná Orava', nameEN: 'Orava and Upper Orava', at: [49.2803, 19.3881] },
  { id: 'kysuce-7', name: 'Kysuce a Javorníky', nameEN: 'Kysuce and the Javorníky', at: [49.4214, 18.5858] },
  { id: 'kysuce-8', name: 'Malá Fatra a Terchová', nameEN: 'Malá Fatra and Terchová', at: [49.3251, 19.1821] },
  { id: 'kysuce-9', name: 'Kysuce a Javorníky', nameEN: 'Kysuce and the Javorníky', at: [49.3984, 19.0733] },
  { id: 'mala-1', name: 'Malá Fatra a Terchová', nameEN: 'Malá Fatra and Terchová', at: [49.1626, 19.1331] },
  { id: 'mala-2', name: 'Malá Fatra a Terchová', nameEN: 'Malá Fatra and Terchová', at: [49.2194, 19.1107] },
  { id: 'mala-3', name: 'Malá Fatra a Terchová', nameEN: 'Malá Fatra and Terchová', at: [49.1553, 19.0858] },
  { id: 'mala-4', name: 'Malá Fatra a Terchová', nameEN: 'Malá Fatra and Terchová', at: [49.2447, 19.0219] },
  { id: 'mala-5', name: 'Malá Fatra a Terchová', nameEN: 'Malá Fatra and Terchová', at: [49.275, 19.1025] },
  { id: 'mala-6', name: 'Malá Fatra a Terchová', nameEN: 'Malá Fatra and Terchová', at: [49.2408, 19.1665] },
  { id: 'mala-7', name: 'Malá Fatra a Terchová', nameEN: 'Malá Fatra and Terchová', at: [49.164, 19.2278] },
  { id: 'orava-1', name: 'Orava a Horná Orava', nameEN: 'Orava and Upper Orava', at: [49.3842, 19.5914] },
  { id: 'orava-2', name: 'Orava a Horná Orava', nameEN: 'Orava and Upper Orava', at: [49.3627, 19.5062] },
  { id: 'orava-3', name: 'Orava a Horná Orava', nameEN: 'Orava and Upper Orava', at: [49.4717, 19.6133] },
  { id: 'orava-4', name: 'Orava a Horná Orava', nameEN: 'Orava and Upper Orava', at: [49.5078, 19.196] },
  { id: 'orava-5', name: 'Orava a Horná Orava', nameEN: 'Orava and Upper Orava', at: [49.5306, 19.5062] },
  { id: 'orava-6', name: 'Orava a Horná Orava', nameEN: 'Orava and Upper Orava', at: [49.4554, 19.1762] },
  { id: 'orava-7', name: 'Orava a Horná Orava', nameEN: 'Orava and Upper Orava', at: [49.513, 19.3044] },
  { id: 'orava-8', name: 'Orava a Horná Orava', nameEN: 'Orava and Upper Orava', at: [49.4002, 19.6902] },
  { id: 'orava-9', name: 'Orava a Horná Orava', nameEN: 'Orava and Upper Orava', at: [49.4431, 19.5309] },
  { id: 'orava-10', name: 'Orava a Horná Orava', nameEN: 'Orava and Upper Orava', at: [49.2427, 19.3387] },
  { id: 'orava-11', name: 'Orava a Horná Orava', nameEN: 'Orava and Upper Orava', at: [49.5965, 19.4733] },
  { id: 'zapadne-1', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.2175, 19.6613] },
  { id: 'zapadne-2', name: 'Veľká Fatra a Turiec', nameEN: 'Veľká Fatra and Turiec', at: [49.0109, 19.3359] },
  { id: 'zapadne-3', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.0325, 19.5996] },
  { id: 'zapadne-4', name: 'Vysoké Tatry a Podtatranie', nameEN: 'High Tatras and the Tatra foothills', at: [49.1283, 19.9415] },
  { id: 'zapadne-5', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.2425, 19.5157] },
  { id: 'zapadne-6', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.0955, 19.6161] },
  { id: 'zapadne-7', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.117, 19.693] },
  { id: 'zapadne-8', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.1655, 19.8099] },
  { id: 'zapadne-9', name: 'Orava a Horná Orava', nameEN: 'Orava and Upper Orava', at: [49.2821, 19.5639] },
  { id: 'zapadne-10', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.222, 19.5721] },
  { id: 'zapadne-11', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.145, 19.6404] },
  { id: 'zapadne-12', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.1835, 19.6985] },
  { id: 'vysoke-1', name: 'Vysoké Tatry a Podtatranie', nameEN: 'High Tatras and the Tatra foothills', at: [49.1688, 20.3296] },
  { id: 'vysoke-2', name: 'Vysoké Tatry a Podtatranie', nameEN: 'High Tatras and the Tatra foothills', at: [49.1907, 19.9292] },
  { id: 'vysoke-3', name: 'Vysoké Tatry a Podtatranie', nameEN: 'High Tatras and the Tatra foothills', at: [49.2127, 20.2925] },
  { id: 'vysoke-4', name: 'Vysoké Tatry a Podtatranie', nameEN: 'High Tatras and the Tatra foothills', at: [49.1915, 20.3719] },
  { id: 'vysoke-5', name: 'Vysoké Tatry a Podtatranie', nameEN: 'High Tatras and the Tatra foothills', at: [49.1314, 20.1077] },
  { id: 'vysoke-6', name: 'Vysoké Tatry a Podtatranie', nameEN: 'High Tatras and the Tatra foothills', at: [49.3018, 20.1682] },
  { id: 'vysoke-7', name: 'Vysoké Tatry a Podtatranie', nameEN: 'High Tatras and the Tatra foothills', at: [49.2273, 20.1276] },
  { id: 'vysoke-8', name: 'Vysoké Tatry a Podtatranie', nameEN: 'High Tatras and the Tatra foothills', at: [49.2074, 20.0821] },
  { id: 'vysoke-9', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.1494, 19.8935] },
  { id: 'vysoke-10', name: 'Vysoké Tatry a Podtatranie', nameEN: 'High Tatras and the Tatra foothills', at: [49.1972, 20.3099] },
  { id: 'vysoke-11', name: 'Vysoké Tatry a Podtatranie', nameEN: 'High Tatras and the Tatra foothills', at: [49.1781, 20.1736] },
  { id: 'vysoke-12', name: 'Vysoké Tatry a Podtatranie', nameEN: 'High Tatras and the Tatra foothills', at: [49.2592, 20.1611] },
  { id: 'vysoke-13', name: 'Spiš — Poprad a Kežmarok', nameEN: 'Spiš — Poprad and Kežmarok', at: [49.1314, 20.3522] },
  { id: 'velka-1', name: 'Veľká Fatra a Turiec', nameEN: 'Veľká Fatra and Turiec', at: [48.8286, 19.1766] },
  { id: 'velka-2', name: 'Malá Fatra a Terchová', nameEN: 'Malá Fatra and Terchová', at: [49.1314, 18.9432] },
  { id: 'velka-3', name: 'Veľká Fatra a Turiec', nameEN: 'Veľká Fatra and Turiec', at: [48.8828, 19.1245] },
  { id: 'velka-4', name: 'Malá Fatra a Terchová', nameEN: 'Malá Fatra and Terchová', at: [49.1655, 18.9349] },
  { id: 'nizke-1', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.1134, 19.7781] },
  { id: 'nizke-2', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [48.9874, 19.6463] },
  { id: 'nizke-3', name: 'Nízke Tatry a Horehronie', nameEN: 'Low Tatras and Horehronie', at: [48.8466, 19.6793] },
  { id: 'nizke-4', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.0757, 19.6902] },
  { id: 'nizke-5', name: 'Nízke Tatry a Horehronie', nameEN: 'Low Tatras and Horehronie', at: [48.8909, 19.4183] },
  { id: 'nizke-6', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.0973, 19.5502] },
  { id: 'nizke-7', name: 'Orava a Horná Orava', nameEN: 'Orava and Upper Orava', at: [49.3198, 19.5062] },
  { id: 'nizke-8', name: 'Nízke Tatry a Horehronie', nameEN: 'Low Tatras and Horehronie', at: [48.7942, 19.6573] },
  { id: 'spis-1', name: 'Spiš — Poprad a Kežmarok', nameEN: 'Spiš — Poprad and Kežmarok', at: [48.9802, 20.473] },
  { id: 'spis-2', name: 'Vysoké Tatry a Podtatranie', nameEN: 'High Tatras and the Tatra foothills', at: [49.2606, 20.3247] },
  { id: 'spis-3', name: 'Spiš — Poprad a Kežmarok', nameEN: 'Spiš — Poprad and Kežmarok', at: [49.0793, 20.311] },
  { id: 'spis-4', name: 'Spiš — Poprad a Kežmarok', nameEN: 'Spiš — Poprad and Kežmarok', at: [49.214, 20.528] },
  { id: 'spis-5', name: 'Levoča a Slovenský raj', nameEN: 'Levoča and Slovenský raj', at: [48.9333, 20.5087] },
  { id: 'spis-6', name: 'Vysoké Tatry a Podtatranie', nameEN: 'High Tatras and the Tatra foothills', at: [49.0415, 20.2286] },
  { id: 'spis-7', name: 'Spiš — Poprad a Kežmarok', nameEN: 'Spiš — Poprad and Kežmarok', at: [49.0091, 20.5884] },
  { id: 'spis-8', name: 'Zamagurie a Pieniny', nameEN: 'Zamagurie and the Pieniny', at: [49.2588, 20.5087] },
  { id: 'spis-9', name: 'Zamagurie a Pieniny', nameEN: 'Zamagurie and the Pieniny', at: [49.3251, 20.5637] },
  { id: 'levoca-1', name: 'Levoča a Slovenský raj', nameEN: 'Levoča and Slovenský raj', at: [48.9722, 20.3644] },
  { id: 'levoca-2', name: 'Levoča a Slovenský raj', nameEN: 'Levoča and Slovenský raj', at: [48.8032, 20.4263] },
  { id: 'levoca-3', name: 'Levoča a Slovenský raj', nameEN: 'Levoča and Slovenský raj', at: [48.787, 20.6735] },
  { id: 'levoca-4', name: 'Levoča a Slovenský raj', nameEN: 'Levoča and Slovenský raj', at: [48.8846, 20.2121] },
  { id: 'levoca-5', name: 'Levoča a Slovenský raj', nameEN: 'Levoča and Slovenský raj', at: [48.9207, 20.4236] },
  { id: 'levoca-6', name: 'Levoča a Slovenský raj', nameEN: 'Levoča and Slovenský raj', at: [48.8846, 20.5005] },
  { id: 'levoca-7', name: 'Spiš — Poprad a Kežmarok', nameEN: 'Spiš — Poprad and Kežmarok', at: [48.9423, 20.5911] },
  { id: 'saris-1', name: 'Šariš a Čergov', nameEN: 'Šariš and Čergov', at: [49.1116, 20.9619] },
  { id: 'saris-2', name: 'Zamagurie a Pieniny', nameEN: 'Zamagurie and the Pieniny', at: [49.3448, 20.4895] },
  { id: 'saris-3', name: 'Šariš a Čergov', nameEN: 'Šariš and Čergov', at: [49.1296, 21.0306] },
  { id: 'saris-4', name: 'Košická kotlina a Slanské vrchy', nameEN: 'Košice Basin and the Slanské Hills', at: [48.7852, 21.2283] },
  { id: 'saris-5', name: 'Šariš a Čergov', nameEN: 'Šariš and Čergov', at: [49.1925, 21.1542] },
  { id: 'saris-6', name: 'Šariš a Čergov', nameEN: 'Šariš and Čergov', at: [49.1637, 20.9674] },
  { id: 'saris-7', name: 'Košická kotlina a Slanské vrchy', nameEN: 'Košice Basin and the Slanské Hills', at: [48.8521, 21.2119] },
  { id: 'bardejov-1', name: 'Košická kotlina a Slanské vrchy', nameEN: 'Košice Basin and the Slanské Hills', at: [48.8846, 21.6211] },
  { id: 'bardejov-2', name: 'Košická kotlina a Slanské vrchy', nameEN: 'Košice Basin and the Slanské Hills', at: [48.8665, 21.0168] },
  { id: 'bardejov-3', name: 'Šariš a Čergov', nameEN: 'Šariš and Čergov', at: [49.2104, 21.0059] },
  { id: 'bardejov-4', name: 'Šariš a Čergov', nameEN: 'Šariš and Čergov', at: [49.2929, 20.9152] },
  { id: 'bardejov-5', name: 'Šariš a Čergov', nameEN: 'Šariš and Čergov', at: [49.1602, 20.9097] },
  { id: 'bardejov-6', name: 'Šariš a Čergov', nameEN: 'Šariš and Čergov', at: [49.1817, 21.0635] },
  { id: 'kosicka-1', name: 'Košická kotlina a Slanské vrchy', nameEN: 'Košice Basin and the Slanské Hills', at: [48.7924, 21.0938] },
  { id: 'kosicka-2', name: 'Košická kotlina a Slanské vrchy', nameEN: 'Košice Basin and the Slanské Hills', at: [48.8195, 21.0251] },
  { id: 'kosicka-3', name: 'Košická kotlina a Slanské vrchy', nameEN: 'Košice Basin and the Slanské Hills', at: [48.8503, 21.0855] },
  { id: 'rucny-mt459q57', name: 'Zamagurie a Pieniny', nameEN: 'Zamagurie and the Pieniny', at: [49.3949, 20.4868] },
  { id: 'rucny-mt459tn4', name: 'Zamagurie a Pieniny', nameEN: 'Zamagurie and the Pieniny', at: [49.4378, 20.4181] },
  { id: 'rucny-mt459w4x', name: 'Zamagurie a Pieniny', nameEN: 'Zamagurie and the Pieniny', at: [49.3377, 20.701] },
  { id: 'rucny-mt459z9w', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.2194, 19.8509] },
  { id: 'rucny-mt459zei', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.2194, 19.8509] },
  { id: 'rucny-mt459zj5', name: 'Západné Tatry a Liptov', nameEN: 'Western Tatras and Liptov', at: [49.2194, 19.8509] },
  { id: 'rucny-mt459zop', name: 'Zamagurie a Pieniny', nameEN: 'Zamagurie and the Pieniny', at: [49.3162, 20.7999] },
  { id: 'rucny-mt45a3gd', name: 'Zamagurie a Pieniny', nameEN: 'Zamagurie and the Pieniny', at: [49.4413, 20.4895] },
  { id: 'rucny-mt45a6s9', name: 'Šariš a Čergov', nameEN: 'Šariš and Čergov', at: [49.2571, 20.9454] },
  { id: 'rucny-mt45a9s4', name: 'Zamagurie a Pieniny', nameEN: 'Zamagurie and the Pieniny', at: [49.3931, 20.7092] },
  { id: 'rucny-mt45al4g', name: 'Šariš a Čergov', nameEN: 'Šariš and Čergov', at: [49.1224, 21.1267] },
// VIPER_POINTS_GENERATED >>>
];

/** Spolu — do bubliny aj do popisku vrstvy. */
export const VIPER_FINDS_TOTAL = VIPER_POINTS.length;
