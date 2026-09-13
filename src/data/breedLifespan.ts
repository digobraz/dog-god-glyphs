// ════════════════════════════════════════════════════════════════════════════
// DOŽITIE PODĽA PLEMENA — podklad pre čiaru priemeru v ŽIVOTNEJ mriežke `/dogs`.
//
// ⚠️ ČÍSLO NIE JE PRE PLEMENO, JE PRE HMOTNOSŤ. Matej to povedal sám
// (13. 9. 2026: „male plemena kludne 13-15, velke a obrie menej niekedy aj len
// 7-9") a veterinárna epidemiológia hovorí to isté: dĺžka života psa koreluje
// s TELESNOU HMOTNOSŤOU, nie s menom plemena. Preto je zdrojom pravdy
// päť hmotnostných tried a nie 380 ručne opísaných čísel — tie by sa pri prvom
// novom plemene rozišli a nikto by nevedel, odkiaľ ktoré je.
//
// ⚠️ `breeds.json` VEĽKOSŤ NEMÁ — má len FCI-nepodobnú „skupinu" siluety
// (Furballs, Speedsters…), a tá veľkosť nenesie: v `04 Speedsters` sedí
// whippet (12 kg) aj borzoj (40 kg). Trieda sa preto musela priradiť plemenu
// po plemene. Pokrytie je 378/378 UNIKÁTNYCH mien (`breeds.json` má 380
// položiek, z toho 2 duplicitné: Smålandsstövare a Tornjak).
//
// ODKIAĽ ČÍSLA: mediány sú konsenzus veterinárnych prehľadov dožitia podľa
// hmotnostnej triedy (UK VetCompass / RVC life tables 2024 a staršie kohortové
// štúdie). PÁSMO je zámerné — jedno číslo by predstieralo presnosť, ktorú
// populačný medián nemá. Appka preto nikdy nepíše dátum, píše ROZSAH.
//
// VÝNIMKY (`BREED_EXCEPTIONS`) sú plemená, kde publikované dožitie leží
// o 2+ roky mimo toho, čo predpovedá hmotnosť. Drvivá väčšina z nich sú
// brachycefalické plemená — nie je to chyba modelu, je to nález.
// ════════════════════════════════════════════════════════════════════════════

export type DogSize = 'toy' | 'small' | 'medium' | 'large' | 'giant';

/** Medián a pásmo dožitia v rokoch pre hmotnostnú triedu. */
export interface LifeBand {
  /** Stred pásma — čiara v mriežke stojí TU. */
  median: number;
  /** Spodná a horná hranica pásma — v mriežke je to tieň okolo čiary. */
  low: number;
  high: number;
  /** Orientačná dospelá hmotnosť, ktorá triedu definuje (do popisku). */
  kgSK: string;
}

export const LIFE_BANDS: Record<DogSize, LifeBand> = {
  toy:    { median: 14.5, low: 13, high: 16, kgSK: 'do 6 kg' },
  small:  { median: 13.0, low: 12, high: 15, kgSK: '6–12 kg' },
  medium: { median: 12.0, low: 11, high: 14, kgSK: '12–25 kg' },
  large:  { median: 10.0, low: 9,  high: 12, kgSK: '25–45 kg' },
  giant:  { median: 8.0,  low: 7,  high: 10, kgSK: 'nad 45 kg' },
};

export const SIZE_NAME_SK: Record<DogSize, string> = {
  toy: 'Trpaslíčie', small: 'Malé', medium: 'Stredné', large: 'Veľké', giant: 'Obrie',
};

// ── Plemená podľa hmotnostnej triedy ────────────────────────────────────────
// Kľúč je ANGLICKÝ názov z `breeds.json` (`selections.breed` ukladá práve ten).
const BY_SIZE: Record<DogSize, string[]> = {
  toy: [
    'Affenpinscher', 'Bichon Frise', 'Biewer Terrier', 'Bolognese', 'Brussels Griffon', 'Chihuahua',
    'Chinese Crested', 'Coton de Tulear', 'English Toy Terrier', 'German Spitz (Klein)', 'Havanese',
    'Italian Greyhound', 'Japanese Chin', 'Japanese Terrier', 'King Charles Spaniel', 'Löwchen',
    'Maltese', 'Maltipoo', 'Miniature Pinscher', 'Morkie', 'Norfolk Terrier', 'Norwich Terrier',
    'Papillon', 'Pekingese', 'Petit Brabançon', 'Phalène', 'Pomeranian', 'Poochon', 'Prague Ratter',
    'Russian Toy', 'Russian Tsvetnaya Bolonka', 'Russkiy Toy (long-haired)', 'Shichon', 'Shih Tzu',
    'Shorkie', 'Silky Terrier', 'Tibetan Spaniel', 'Toy Fox Terrier', 'Toy Manchester Terrier',
    'Toy Poodle', 'Volpino Italiano', 'Yorkipoo', 'Yorkshire Terrier',
  ],
  small: [
    'Alaskan Klee Kai', 'Alpine Dachsbracke', 'American Cocker Spaniel', 'American Eskimo Dog',
    'Australian Terrier', 'Austrian Pinscher', 'Basenji', 'Basset Fauve de Bretagne', 'Beagle',
    'Bedlington Terrier', 'Berger des Pyrénées', 'Border Terrier', 'Boston Terrier',
    'Cairn Terrier', 'Cardigan Welsh Corgi', 'Cavachon', 'Cavalier King Charles Spaniel', 'Cavapoo',
    'Cesky Terrier', "Cirneco dell'Etna", 'Cockapoo', 'Dachshund', 'Dandie Dinmont Terrier',
    'Danish-Swedish Farmdog', 'Drever', 'Dutch Smoushond', 'Finnish Spitz', 'French Bulldog',
    'German Hunting Terrier', 'German Spitz (Mittel)', 'Glen of Imaal Terrier',
    'Icelandic Sheepdog', 'Irish Terrier', 'Jack Russell Terrier', 'Japanese Spitz',
    'Kooikerhondje', 'Kromfohrländer', 'Lakeland Terrier', 'Lancashire Heeler', 'Lhasa Apso',
    'Manchester Terrier', 'Miniature Bull Terrier', 'Miniature Poodle', 'Miniature Schnauzer',
    'Norrbottenspets', 'Norwegian Lundehund', 'Parson Russell Terrier', 'Patterdale Terrier',
    'Pembroke Welsh Corgi', 'Petit Basset Griffon Vendéen', 'Plummer Terrier', 'Pomsky',
    'Portuguese Podengo', 'Pug', 'Puggle', 'Pumi', 'Rat Terrier', 'Schipperke', 'Schnoodle',
    'Scottish Terrier', 'Sealyham Terrier', 'Shetland Sheepdog', 'Shiba Inu', 'Skye Terrier',
    'Small Swiss Hound', 'Smooth Fox Terrier', 'Swedish Vallhund', 'Teddy Roosevelt Terrier',
    'Tibetan Terrier', 'Welsh Terrier', 'West Highland White Terrier', 'Westphalian Dachsbracke',
    'Whippet', 'Wire Fox Terrier',
  ],
  medium: [
    'Aidi', 'Airedale Terrier', 'American Pit Bull Terrier', 'American Staffordshire Terrier',
    'American Water Spaniel', 'Anglo-Français de Petite Vénerie', 'Aussiedoodle',
    'Australian Cattle Dog', 'Australian Kelpie', 'Australian Shepherd',
    'Austrian Black and Tan Hound', 'Azawakh', 'Barbet', 'Basset Artésien Normand',
    'Basset Bleu de Gascogne', 'Basset Hound', 'Bavarian Mountain Scent Hound', 'Beagle Harrier',
    'Bearded Collie', 'Berger Picard', 'Black Norwegian Elkhound', 'Blue Picardy Spaniel',
    'Border Collie', 'Boykin Spaniel', 'Braque du Bourbonnais', 'Brittany', 'Canaan Dog',
    'Canarian Warren Hound', 'Cao da Serra de Aires', 'Catalan Sheepdog', "Chien d'Artois",
    'Chow Chow', 'Croatian Sheepdog', 'Deutscher Wachtelhund', 'Drentse Patrijshond', 'Dunker',
    'East Siberian Laika', 'English Bulldog', 'English Cocker Spaniel', 'English Springer Spaniel',
    'Entlebucher Mountain Dog', 'Eurasier', 'Field Spaniel', 'Finnish Hound', 'Finnish Lapphund',
    'French Spaniel', 'German Pinscher', 'Grand Basset Griffon Vendéen',
    'Griffon Fauve de Bretagne', 'Griffon Nivernais', 'Halden Hound', 'Hamilton Hound', 'Harrier',
    'Hellinikos Ichnilatis', 'Hokkaido', 'Hygenhund', 'Ibizan Hound', 'Istrian Shorthaired Hound',
    'Italian Hound', 'Jindo', 'Kai Ken', 'Karelian Bear Dog', 'Keeshond', 'Kerry Blue Terrier',
    'Kishu Ken', 'Lagotto Romagnolo', 'Mountain Cur', 'Mudi', 'Norwegian Buhund',
    'Norwegian Elkhound', 'Norwegian Hound', 'Nova Scotia Duck Tolling Retriever',
    'Peruvian Inca Orchid', 'Pharaoh Hound', 'Picardy Spaniel', 'Plott Hound',
    'Polish Lowland Sheepdog', 'Pont-Audemer Spaniel', 'Portuguese Pointing Dog',
    'Portuguese Water Dog', 'Posavaz Hound', 'Puli', 'Russian-European Laika', 'Saluki', 'Samoyed',
    'Schapendoes', 'Schiller Hound', 'Serbian Hound', 'Serbian Tricolour Hound', 'Shar Pei',
    'Shikoku', 'Siberian Husky', 'Sloughi', 'Slovensky Kopov', 'Small Münsterländer',
    'Smålandsstövare', 'Soft Coated Wheaten Terrier', 'Spanish Water Dog',
    'St. Germain Pointing Dog', 'Stabyhoun', 'Staffordshire Bull Terrier', 'Standard Schnauzer',
    'Styrian Coarse-haired Hound', 'Sussex Spaniel', 'Swedish Lapphund', 'Swiss Hound',
    'Thai Ridgeback', 'Tyrolean Hound', 'Vizsla', 'Welsh Springer Spaniel', 'West Siberian Laika',
    'Wetterhoun', 'Wirehaired Vizsla', 'Xoloitzcuintli',
  ],
  large: [
    'Afghan Hound', 'Akita Inu', 'Alaskan Malamute', 'American Akita', 'American Bulldog',
    'American Bully', 'American English Coonhound', 'American Foxhound', 'Appenzeller Sennenhund',
    'Ariegeois', 'Beauceron', 'Belgian Groenendael', 'Belgian Laekenois', 'Belgian Malinois',
    'Belgian Tervuren', 'Bergamasco Sheepdog', 'Bernedoodle', 'Billy', 'Black Mouth Cur',
    'Black and Tan Coonhound', 'Bluetick Coonhound', 'Borzoi', 'Bouvier des Ardennes',
    'Bouvier des Flandres', 'Boxer', 'Bracco Italiano', 'Briard', 'Bull Terrier', 'Ca de Bou',
    'Cao de Castro Laboreiro', 'Catahoula Leopard Dog', 'Cesky Fousek', 'Chart Polski',
    'Chesapeake Bay Retriever', 'Cimarrón Uruguayo', 'Clumber Spaniel', 'Curly-Coated Retriever',
    'Czechoslovakian Wolfdog', 'Dalmatian', 'Dobermann', 'Dutch Shepherd', 'English Foxhound',
    'English Setter', 'Flat-Coated Retriever', 'French Pointing Dog', 'Galgo Español',
    'German Longhaired Pointer', 'German Shepherd', 'German Shorthaired Pointer',
    'German Wirehaired Pointer', 'Giant Schnauzer', 'Golden Retriever', 'Goldendoodle',
    'Gonczy Polski', 'Gordon Setter', 'Grand Anglo-Français', 'Grand Bleu de Gascogne',
    'Grand Griffon Vendéen', 'Greenland Dog', 'Greyhound', 'Hanoverian Scenthound', 'Hovawart',
    'Irish Red and White Setter', 'Irish Setter', 'Irish Water Spaniel', 'Italian Spinone',
    'Krasky Ovcar', 'Labradoodle', 'Labrador Retriever', 'Lapinporokoira', 'Large Münsterländer',
    'Magyar Agar', 'Majorca Shepherd Dog', 'Old Danish Pointing Dog', 'Old English Sheepdog',
    'Olde English Bulldogge', 'Otterhound', 'Perdiguero de Burgos', 'Pointer (English)', 'Poitevin',
    'Polish Hound', 'Porcelaine', 'Pudelpointer', 'Redbone Coonhound', 'Rhodesian Ridgeback',
    'Rottweiler', 'Rough Collie', 'Saarloos Wolfdog', 'Sheepadoodle',
    'Slovakian Wirehaired Pointer', 'Smooth Collie', 'Standard Poodle', 'Swedish Elkhound',
    'Transylvanian Hound', 'Treeing Walker Coonhound', 'Weimaraner', 'White Swiss Shepherd',
    'Wirehaired Pointing Griffon',
  ],
  giant: [
    'Akbash', 'American Bandogge', 'Anatolian Shepherd', 'Bernese Mountain Dog',
    'Black Russian Terrier', 'Bloodhound', 'Boerboel', 'Broholmer', 'Bucovina Shepherd',
    'Bullmastiff', 'Cane Corso', 'Caucasian Shepherd', 'Central Asian Shepherd',
    'Cão de Gado Transmontano', 'Dogo Argentino', 'Dogue de Bordeaux', 'English Mastiff',
    'Estrela Mountain Dog', 'Fila Brasileiro', 'Great Dane', 'Greater Swiss Mountain Dog',
    'Irish Wolfhound', 'Kangal', 'Karakachan', 'Komondor', 'Kuvasz', 'Landseer', 'Leonberger',
    'Maremma Sheepdog', 'Mioritic Shepherd', 'Moscow Watchdog', 'Neapolitan Mastiff',
    'Newfoundland', 'Perro de Presa Canario', 'Polish Tatra Sheepdog', 'Pyrenean Mastiff',
    'Pyrenean Mountain Dog', 'Rafeiro do Alentejo', 'Saint Bernard', 'Sarplaninac',
    'Scottish Deerhound', 'Slovensky Cuvac', 'South African Boerboel', 'South Russian Ovcharka',
    'Spanish Mastiff', 'Tibetan Mastiff', 'Tornjak', 'Tosa Inu', 'Šarplaninac',
  ],};

// ── VÝNIMKY — kde hmotnosť KLAME ────────────────────────────────────────────
// Publikované dožitie leží o 2+ roky mimo predpovede hmotnostnej triedy.
// Skoro všetko sú brachycefalické („smushface") plemená — plochá tvár je
// samostatný rizikový faktor, ktorý hmotnosť nezachytí. Čísla sú mediány
// z britských kohortových dát (VetCompass), teda populácia, nie jeden pes.
//
// ⚠️ Nedopĺňaj sem plemeno preto, že „sa to tak hovorí". Sem patrí len to,
// pre čo existuje publikovaný medián — inak je to hádanie s väčšou autoritou.
const BREED_EXCEPTIONS: Record<string, LifeBand> = {
  'French Bulldog':      { median: 9.0,  low: 7,  high: 11, kgSK: '6–12 kg' },
  'English Bulldog':     { median: 8.5,  low: 7,  high: 10, kgSK: '12–25 kg' },
  'Pug':                 { median: 10.0, low: 9,  high: 12, kgSK: '6–12 kg' },
  'Olde English Bulldogge': { median: 9.0, low: 8, high: 11, kgSK: '25–45 kg' },
  'Shar Pei':            { median: 10.0, low: 8,  high: 12, kgSK: '12–25 kg' },
  'Bloodhound':          { median: 7.0,  low: 6,  high: 9,  kgSK: 'nad 45 kg' },
  'Dogue de Bordeaux':   { median: 6.5,  low: 5,  high: 8,  kgSK: 'nad 45 kg' },
  'Neapolitan Mastiff':  { median: 7.0,  low: 6,  high: 9,  kgSK: 'nad 45 kg' },
  'Irish Wolfhound':     { median: 7.0,  low: 6,  high: 9,  kgSK: 'nad 45 kg' },
  'Great Dane':          { median: 7.5,  low: 6,  high: 9,  kgSK: 'nad 45 kg' },
  'Bernese Mountain Dog':{ median: 8.0,  low: 7,  high: 10, kgSK: 'nad 45 kg' },
  'Jack Russell Terrier':{ median: 14.0, low: 13, high: 16, kgSK: '6–12 kg' },
  'Border Collie':       { median: 13.5, low: 12, high: 15, kgSK: '12–25 kg' },
  'Miniature Dachshund': { median: 14.0, low: 13, high: 16, kgSK: 'do 6 kg' },
};

// ── Index sa stavia RAZ, nie pri každom pohľade ─────────────────────────────
let INDEX: Map<string, DogSize> | null = null;
function index(): Map<string, DogSize> {
  if (INDEX) return INDEX;
  const m = new Map<string, DogSize>();
  (Object.keys(BY_SIZE) as DogSize[]).forEach((k) => {
    for (const name of BY_SIZE[k]) m.set(name.toLowerCase(), k);
  });
  INDEX = m;
  return m;
}

export function sizeOfBreed(breedEN: string | null | undefined): DogSize | null {
  if (!breedEN) return null;
  return index().get(breedEN.trim().toLowerCase()) ?? null;
}

/** Pásmo pre jedno plemeno. Výnimka prebíja triedu. */
export function bandOfBreed(breedEN: string | null | undefined): LifeBand | null {
  if (!breedEN) return null;
  const ex = BREED_EXCEPTIONS[breedEN.trim()];
  if (ex) return ex;
  const size = sizeOfBreed(breedEN);
  return size ? LIFE_BANDS[size] : null;
}

/** Čo o psovi vieme povedať — a PREČO, aby to vedel povedať aj popisok. */
export interface LifeEstimate {
  band: LifeBand;
  /** 'breed' = poznáme plemeno · 'mix' = priemer dvoch · 'weight' = z váženia · 'default' = nič nevieme */
  basis: 'breed' | 'mix' | 'weight' | 'default';
  /** Čo ukázať človeku ako zdroj čísla (meno plemena, „kríženec", hmotnosť). */
  labelSK: string;
  size: DogSize | null;
}

/** Trieda odvodená z REÁLNEJ hmotnosti — záchranná sieť pre kríženca bez plemena. */
export function sizeOfWeight(kg: number): DogSize {
  if (kg < 6) return 'toy';
  if (kg < 12) return 'small';
  if (kg < 25) return 'medium';
  if (kg < 45) return 'large';
  return 'giant';
}

/**
 * Odhad pre KONKRÉTNEHO psa. Poradie zdrojov je zámerné:
 *   1. plemeno (najpresnejšie, lebo nesie aj výnimky)
 *   2. kríženec → priemer oboch polovíc; keď poznáme len jednu, berie sa ona
 *   3. posledné váženie → hmotnostná trieda (kríženec bez mena plemena)
 *   4. nič → stredná trieda, a popisok to MUSÍ priznať
 *
 * ⚠️ Kríženec dostáva PRIEMER, nie horšiu polovicu. Krížence žijú v priemere
 * dlhšie než čistokrvní psi rovnakej hmotnosti (heterózny efekt), takže brať
 * kratšie z dvoch čísel by klamalo v neprospech psa.
 */
export function estimateLife(
  breed: string | null | undefined,
  mix1: string | null | undefined,
  mix2: string | null | undefined,
  weightKg: number | null | undefined,
): LifeEstimate {
  const isMix = (breed || '').trim().toLowerCase() === 'mixed';

  if (!isMix) {
    const b = bandOfBreed(breed);
    if (b) return { band: b, basis: 'breed', labelSK: (breed || '').trim(), size: sizeOfBreed(breed) };
  }

  const b1 = bandOfBreed(mix1);
  const b2 = bandOfBreed(mix2);
  if (b1 && b2) {
    const avg = (a: number, b: number) => Math.round(((a + b) / 2) * 10) / 10;
    return {
      band: { median: avg(b1.median, b2.median), low: avg(b1.low, b2.low), high: avg(b1.high, b2.high), kgSK: '' },
      basis: 'mix',
      labelSK: `${(mix1 || '').trim()} × ${(mix2 || '').trim()}`,
      size: null,
    };
  }
  const only = b1 || b2;
  if (only) {
    return { band: only, basis: 'mix', labelSK: (mix1 || mix2 || '').trim(), size: sizeOfBreed(mix1 || mix2) };
  }

  if (weightKg && weightKg > 0) {
    const size = sizeOfWeight(weightKg);
    return { band: LIFE_BANDS[size], basis: 'weight', labelSK: `${weightKg} kg`, size };
  }

  return { band: LIFE_BANDS.medium, basis: 'default', labelSK: '', size: null };
}
