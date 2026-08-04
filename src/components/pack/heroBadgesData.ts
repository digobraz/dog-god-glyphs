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
// PRÍBEHY (#65, 2026-08-04): text UŽ NIE JE tu — žije v slovníku pod `pack.heroBadge.<id>.story`
// (SK = pôvodné znenie z artefaktu „Panteón" 1:1, EN = preklad). Kľúč sa odvodzuje z `id`, preto
// `id` musí sedieť s kľúčom v en.ts/sk.ts. Ostatných 16 jazykov padá na EN fallback — zámerne.
export interface HeroBadge {
  id: string;    // slug = názov súboru
  name: string;  // meno na banneri
  trips: number; // míľnik: koľko prejdených tripov odomkne
  img: string;   // cesta k transparentnému PNG
  source?: { url: string; label: string }; // overený článok „Viac o príbehu →" (Hekthor = interný, bez externého média)
}

// Zoradené vzostupne podľa míľnika (poradie odomykania).
export const HERO_BADGES: HeroBadge[] = [
  {
    id: 'hachiko', name: 'Hachikō', trips: 5,
    img: '/icons/hero-badges/hachiko.png',
    source: { url: 'https://www.u-tokyo.ac.jp/en/whyutokyo/hongo_hi_014.html', label: 'University of Tokyo' },
  },
  {
    id: 'barry', name: 'Barry', trips: 15,
    img: '/icons/hero-badges/barry.png',
    source: { url: 'https://www.nmbe.ch/en/exhibitions/barry', label: 'Naturhistorisches Museum Bern' },
  },
  {
    id: 'togo', name: 'Togo', trips: 25,
    img: '/icons/hero-badges/togo.png',
    source: { url: 'https://www.smithsonianmag.com/history/this-heroic-dog-raced-across-the-frozen-alaskan-wilderness-to-deliver-life-saving-medicine-but-his-contributions-were-long-overlooked-180985905/', label: 'Smithsonian Magazine' },
  },
  {
    id: 'hekthor', name: 'Hekthor', trips: 42,
    img: '/icons/hero-badges/hekthor.png',
  },
  {
    id: 'bothie', name: 'Bothie', trips: 82,
    img: '/icons/hero-badges/bothie.png',
    source: { url: 'https://geographical.co.uk/news/reliving-the-transglobe-expedition', label: 'Geographical · RGS' },
  },
  {
    id: 'laika', name: 'Laika', trips: 100,
    img: '/icons/hero-badges/laika.png',
    source: { url: 'https://www.smithsonianmag.com/smithsonian-institution/sad-story-laika-space-dog-and-her-one-way-trip-orbit-1-180968728/', label: 'Smithsonian Magazine' },
  },
  {
    id: 'bobbie', name: 'Bobbie', trips: 150,
    img: '/icons/hero-badges/bobbie.png',
    source: { url: 'https://kval.com/features/pet-of-the-week/bobbie-oregons-wonder-dog', label: 'KVAL News' },
  },
  {
    id: 'seaman', name: 'Seaman', trips: 300,
    img: '/icons/hero-badges/seaman.png',
    source: { url: 'https://www.nps.gov/articles/000/seaman-s-contributions-to-the-lewis-and-clark-expedition.htm', label: 'U.S. National Park Service' },
  },
  {
    id: 'savannah', name: 'Savannah', trips: 1000,
    img: '/icons/hero-badges/savannah.png',
    source: { url: 'https://www.inquirer.com/life/tom-turcich-walk-world-jersey-dog-death-20240521.html', label: 'The Philadelphia Inquirer' },
  },
];

/** Koľko odznakov je odomknutých pri danom počte prejdených tripov. */
export function earnedHeroBadges(walkedCount: number): number {
  return HERO_BADGES.filter((b) => walkedCount >= b.trips).length;
}
