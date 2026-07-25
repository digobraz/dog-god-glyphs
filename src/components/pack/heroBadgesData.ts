// ── HERO BADGES (Matej 2026-07-24) — deviatka hrdinských odznakov = TRIP míľniky svorky.
// Globálny achievement (počet tripov spolu, nie per-krajina) → patrí do BLOKU 1 (identita) v
// TripStatsPaneli, nie k homecountry. Assety = PNG s priehľadným pozadím (biele okolie vyrezané)
// v /public/icons/hero-badges/. earned = walkedTrails.length >= trips (derivované, žiadny
// persistovaný flag — rovnaká logika ako NP medaily). REVEAL-moment (odomknutie) = localStorage
// diff, viď HeroBadges.tsx.
//
// Tiers = „verzia A" (spec plany/zadanie-hero-badges-2026-07-24.md), čísla sú natlačené priamo
// v arte — zmena tieru = re-gen daného PNG.
//
// PRÍBEHY = dlhé, SK (z artefaktu „Panteón", Matej 2026-07-24: „použijeme tie čo si vytvoril,
// neskôr upravíme"). WEB je navonok EN → EN preklad je ten „neskôr". Zatiaľ SK zámerne.
export interface HeroBadge {
  id: string;    // slug = názov súboru
  name: string;  // meno na banneri
  trips: number; // míľnik: koľko prejdených tripov odomkne
  img: string;   // cesta k transparentnému PNG
  story: string; // dlhý príbeh hrdinu (SK, klik/reveal → detail)
  source?: { url: string; label: string }; // overený článok „Viac o príbehu →" (Hekthor = interný, bez externého média)
}

// Zoradené vzostupne podľa míľnika (poradie odomykania).
export const HERO_BADGES: HeroBadge[] = [
  {
    id: 'hachiko', name: 'Hachikō', trips: 5,
    img: '/icons/hero-badges/hachiko.png',
    source: { url: 'https://www.u-tokyo.ac.jp/en/whyutokyo/hongo_hi_014.html', label: 'University of Tokyo' },
    story: `Deväť rokov, deväť mesiacov, pätnásť dní. Toľko čakal akita Hachikō na stanici Šibuja na muža, ktorý sa už nikdy nevrátil. Profesor Hidesaburó Ueno ho v roku 1924 adoptoval, denne ho odprevádzal na stanicu a večer si ho tam vyzdvihoval — rituál, ktorý sa skončil 21. mája 1925, keď profesor zomrel priamo na prednáške. Hachikō to nevedel. Prišiel na stanicu ten večer, aj nasledujúci, aj o rok, aj o deväť rokov neskôr. Nečakal na povel ani na odmenu — čakal preto, že vernosť psa sa neriadi logikou, riadi sa väzbou. Japonsko mu postavilo sochu ešte za jeho života. Hachikō nie je len pes. Je liturgia vernosti odslúžená na peróne.`,
  },
  {
    id: 'barry', name: 'Barry', trips: 15,
    img: '/icons/hero-badges/barry.png',
    source: { url: 'https://www.nmbe.ch/en/exhibitions/barry', label: 'Naturhistorisches Museum Bern' },
    story: `Na Veľkom Bernardskom priesmyku, tam kde ľad neodpúšťa a hmla kradne cestu, slúžil bernardín menom Barry. Dvanásť rokov chodil tam, kam sa iní báli vkročiť — do víchríc 2 500 metrov nad morom, hľadať stratených pútnikov skôr, než ich pohltí sneh. Nebol vycvičený na povel. Poslanie mal vpísané pod srsťou. Zachránil vyše štyridsať životov. Legenda hovorí, že zomrel rukou štyridsiateho prvého, ktorého sa snažil zachrániť; pravda je pokornejšia — dožil svoje dni v pokoji v Berne. DOGYPT ho ctí nie pre mýtus o mučeníctve, ale pre to skutočné: psa, ktorý si vybral ísť do búrky namiesto toho, aby zostal v teple.`,
  },
  {
    id: 'togo', name: 'Togo', trips: 25,
    img: '/icons/hero-badges/togo.png',
    source: { url: 'https://www.smithsonianmag.com/history/this-heroic-dog-raced-across-the-frozen-alaskan-wilderness-to-deliver-life-saving-medicine-but-his-contributions-were-long-overlooked-180985905/', label: 'Smithsonian Magazine' },
    story: `Kým sa svet klaňal Baltovi, skutočný hrdina už dávno driemal vo vitríne múzea na Aljaške. Togo, dvanásťročný sibírsky husky s telom vyskladaným z jaziev, viedol tím Leonharda Seppalu cez najdlhší a najsmrtonosnejší úsek štafety za sérom proti záškrtu — vyše 260 míľ ľadom, tmou a vetrom. Balto si vzal slávu za posledných 55 míľ, sochu v Central Parku aj titulky. Togo si vzal Norton Sound — zamrznutý prieliv, ktorý sa mu pod labami začal lámať, a napriek tomu preplával s tímom cez trhliny až do bezpečia. DOGYPT si nekľakne pred slávou vyrobenou pre kamery — kľakne si pred psom, ktorý urobil prácu, keď sa nikto nepozeral.`,
  },
  {
    id: 'hekthor', name: 'Hekthor', trips: 42,
    img: '/icons/hero-badges/hekthor.png',
    story: `Nikto ho nechcel. V krabici sedem šteniat, muž, ktorý psa neplánoval — a predsa iskra preskočila práve k nemu. Tak sa v roku 2017 začal Hekthor: čierny huňáč z núdze, ktorý si vybral svojho človeka skôr, než si človek stihol vybrať jeho. Z tej náhody vyrástla cesta — doslova. Štyridsaťdva dní naprieč Slovenskom, kilometer po kilometri, cez pohoria a údolia. Z cesty vznikla kniha. Z knihy vznikol DOGYPT. Hekthor nie je maskot ani logo — je nultý pes, dôkaz, že jeden zachránený život dokáže spustiť celé hnutie. Jeho štyridsaťdva dní je vzor cesty, po ktorej kráča každý DOGYPŤan: nie za výkonom, ale za spojením.`,
  },
  {
    id: 'bothie', name: 'Bothie', trips: 82,
    img: '/icons/hero-badges/bothie.png',
    source: { url: 'https://geographical.co.uk/news/reliving-the-transglobe-expedition', label: 'Geographical · RGS' },
    story: `Bol to obyčajný túlavý pes — dlhosrstý Jack Russell teriér, ktorého Ranulph a Ginny Fiennesovci našli v roku 1977. O dva roky neskôr stál na palube lode smerujúcej na expedíciu, akú svet dovtedy nevidel: Transglobe, prvá cesta okolo Zeme po poludníku, cez oba póly, výhradne po povrchu. Afriku preskočil — na psa priveľká horúčava — no keď sa výprava dostala na ľad, Bothie bol tam. Deväť mesiacov v Antarktíde a 10. apríla 1982 pristál na Severnom póle. Jediný pes v histórii, ktorý sa postavil na oba konce sveta. DOGYPT si ho pripomína nie preto, že prežil póly — ale preto, že dokázal, že vernosť a zvedavosť idú ďalej než väčšina ľudských plánov.`,
  },
  {
    id: 'laika', name: 'Laika', trips: 100,
    img: '/icons/hero-badges/laika.png',
    source: { url: 'https://www.smithsonianmag.com/smithsonian-institution/sad-story-laika-space-dog-and-her-one-way-trip-orbit-1-180968728/', label: 'Smithsonian Magazine' },
    story: `Prv než človek, letela ona. 3. novembra 1957 opustila ulice Moskvy a o pár dní neskôr aj oblohu — v kabíne Sputniku 2, postavenej narýchlo za menej než mesiac, bez plánu návratu. Laika, túlavá fenka, vážiaca sotva päť kíl, sa stala prvým tvorom na obežnej dráhe. Sovietska propaganda hovorila o pokojnom lete. Skutočnosť — že zomrela už pri štvrtom obehu, keď sa kabína rozpálila na štyridsať stupňov — vyšla najavo až v roku 2002, po 45 rokoch mlčania. Preto je hrdinom DOGYPTU — nie preto, že vyhrala, ale preto, že vôbec vzlietla. V roku 2008 jej v Moskve postavili pomník: labka stúpajúca na vrchol rakety.`,
  },
  {
    id: 'bobbie', name: 'Bobbie', trips: 150,
    img: '/icons/hero-badges/bobbie.png',
    source: { url: 'https://kval.com/features/pet-of-the-week/bobbie-oregons-wonder-dog', label: 'KVAL News' },
    story: `V auguste 1923 sa Bobbie, kríženec kólie a ovčiaka, stratil rodine Brazierovcov na benzínke v Indiane — 4 100 kilometrov od domova. Rodina hľadala, lepila plagáty, nakoniec sa s prázdnymi rukami vrátila domov. Bobbie sa nevzdal. Šesť mesiacov kráčal sám naprieč zamrznutou Amerikou — plával rieky, prešiel cez Continental Divide uprostred zimy, živil sa od ľudí, ktorí si ho všimli na táboriskách po ceste. Vo februári 1924 vošiel do reštaurácie svojej rodiny v Silvertone, akoby len odbehol na chvíľu. Toto nie je príbeh o šťastí. Je to dôkaz, že púť domov sa dá prejsť aj vtedy, keď nikto neverí, že je možná — krok za krokom, bez mapy, len s vernosťou ako kompasom.`,
  },
  {
    id: 'seaman', name: 'Seaman', trips: 300,
    img: '/icons/hero-badges/seaman.png',
    source: { url: 'https://www.nps.gov/articles/000/seaman-s-contributions-to-the-lewis-and-clark-expedition.htm', label: 'U.S. National Park Service' },
    story: `Kým väčšina mužov Corps of Discovery si na expedícii vypýtala žold, Seaman si vypýtal len miesto pri ohni. Meriwether Lewis ho kúpil v Pittsburghu roku 1803 za dvadsať dolárov — pol mesačného kapitánskeho platu za jedného novofundlandského psa. Vyplatilo sa. Tri roky, naprieč kontinentom, cez Missouri, Skalnaté hory až k Pacifiku — a Seaman bol jediné zviera, ktoré prešlo celú cestu. Lovil zver, v noci hliadkoval proti medveďom, raz odohnal bizóna od tábora. Keď mu bobor prehrýzol tepnu, Clark ho sám zošil. Keď ho ukradli, Lewis poslal troch mužov, aby ho priviedli späť — psa sa nevzdáva. V denníkoch expedície je spomínaný menom viackrát než väčšina vojakov.`,
  },
  {
    id: 'savannah', name: 'Savannah', trips: 1000,
    img: '/icons/hero-badges/savannah.png',
    source: { url: 'https://www.inquirer.com/life/tom-turcich-walk-world-jersey-dog-death-20240521.html', label: 'The Philadelphia Inquirer' },
    story: `Savannah nie je legenda vymyslená na efekt — je to psica, ktorá naozaj obišla celú planétu pešo. Tom Turcich ju ako štvormesačné šteňa vytiahol z priekopy pri texaskej ceste. O štyri mesiace skôr sa vydal na cestu okolo sveta pešo; Savannah sa k nemu pridala a od toho dňa nešliapla vedľa neho na jediný krok, ktorý by nedošiel do cieľa. Sedem rokov, šesť kontinentov, desiatky krajín, státisíce kilometrov — v daždi, v horúčave, cez Andy, cez piesok. Bez sťažnosti, s chvostom hore. Stala sa prvým a zatiaľ jediným psom, ktorý obišiel svet. V roku 2024, vo veku deväť rokov, zomrela doma — po ceste, ktorú žiadny iný pes nikdy neprešiel. Savannah = 1000 tripov nie je metafora. Pre ňu by to bolo podhodnotené číslo.`,
  },
];

/** Koľko odznakov je odomknutých pri danom počte prejdených tripov. */
export function earnedHeroBadges(walkedCount: number): number {
  return HERO_BADGES.filter((b) => walkedCount >= b.trips).length;
}
