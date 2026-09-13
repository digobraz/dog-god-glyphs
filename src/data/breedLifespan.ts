// ════════════════════════════════════════════════════════════════════════════
// DOŽITIE PODĽA PLEMENA — podklad pre čiaru priemeru v ŽIVOTNEJ mriežke `/dogs`.
//
// 🔴 PORADIE ZDROJOV (Matej 13. 9. 2026): „každé plemeno má udavanu dlzku
// dozitia takže prirad to ku konkretnym plemenám a vahu použime len ak nemáme
// dosť info o plemene." Teda:
//   1. PUBLIKOVANÉ ROZPÄTIE PLEMENA (`BREED_LIFESPAN`) — 302 z 378 plemien
//   2. hmotnostná trieda (`LIFE_BANDS`) — zvyšných 76, kde publikovaný údaj
//      neexistuje (väčšinou európske honiče a pastierske plemená bez klubu,
//      ktorý by ho vydával)
//
// ⚠️ PRVÁ VERZIA STÁLA LEN NA HMOTNOSTI a bola to chyba — hmotnosť je dobrá
// aproximácia populácie, nie plemena. Dôkaz je v dátach: **strážcovia stád**
// (kangal, stredoázijský ovčiak, tornjak, karakačan) sú hmotnostne „obrie",
// ale publikované dožitie majú 12–15 rokov, teda o 5 rokov nad triedou. Mastify
// rovnakej hmotnosti majú 7–9. Jedno číslo pre „nad 45 kg" tie dve skupiny
// zlúči a obom klame.
//
// ⚠️ `breeds.json` VEĽKOSŤ NEMÁ — má len FCI-nepodobnú „skupinu" siluety
// (Furballs, Speedsters…), a tá veľkosť nenesie: v `04 Speedsters` sedí
// whippet (12 kg) aj borzoj (40 kg). Trieda sa preto musela priradiť plemenu
// po plemene. Pokrytie je 378/378 UNIKÁTNYCH mien (`breeds.json` má 380
// položiek, z toho 2 duplicitné: Smålandsstövare a Tornjak).
//
// ODKIAĽ ČÍSLA: rozpätia plemien sú publikované údaje plemenných klubov
// (AKC / The Kennel Club / klub plemena); hmotnostné triedy sú konsenzus
// veterinárnych prehľadov (UK VetCompass / RVC life tables 2024).
// PÁSMO je zámerné — jedno číslo by predstieralo presnosť, ktorú populačný
// medián nemá. Appka preto nikdy nepíše dátum, píše ROZSAH.
//
// ⚠️ NEDOPLŇUJ plemeno preto, že „sa to tak hovorí". Sem patrí len to, pre čo
// existuje publikované rozpätie — inak je to hádanie s väčšou autoritou, a od
// hmotnostnej triedy sa to nelíši ničím okrem falošnej presnosti.
//
// ⚠️ STRÁŽ PRI ROZŠIROVANÍ: po pridaní plemien porovnaj ich medián s mediánom
// ich hmotnostnej triedy. Odchýlka nad 3 roky je buď skutočný nález (strážcovia
// stád, chrty, brachycefalici), alebo preklep — takto sa chytil pudel zapísaný
// ako 10–18 (to je údaj AKC pre VŠETKY tri veľkosti naraz, nie pre standarda).
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
  /** true = číslo je PUBLIKOVANÉ pre plemeno; false/chýba = odvodené z hmotnosti. */
  fromBreed?: boolean;
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

// ── PUBLIKOVANÉ ROZPÄTIE DOŽITIA PO PLEMENÁCH ──────────────────────────────
// Kľúč = ANGLICKÝ názov z `breeds.json` (`selections.breed` ukladá práve ten).
// Hodnota = [spodná hranica, horná hranica] v rokoch; medián je ich stred.
// 302 z 378 plemien. Čo tu nie je, padne na hmotnostnú triedu — a appka to
// v popisku PRIZNÁ (`LifeEstimate.basis`), nikdy nepredstiera plemenný údaj.
const BREED_LIFESPAN: Record<string, [number, number]> = {
  'Affenpinscher': [12, 15],
  'Biewer Terrier': [12, 15],
  'Bolognese': [12, 14],
  'Brussels Griffon': [12, 15],
  'Chihuahua': [14, 16],
  'Chinese Crested': [13, 18],
  'Coton de Tulear': [15, 19],
  'English Toy Terrier': [12, 13],
  'Havanese': [14, 16],
  'Italian Greyhound': [14, 15],
  'Japanese Chin': [10, 12],
  'Japanese Terrier': [12, 15],
  'Löwchen': [13, 15],
  'Maltese': [12, 15],
  'Maltipoo': [12, 16],
  'Morkie': [10, 13],
  'Papillon': [14, 16],
  'Pekingese': [12, 14],
  'Petit Brabançon': [12, 15],
  'Phalène': [14, 16],
  'Pomeranian': [12, 16],
  'Prague Ratter': [12, 14],
  'Russian Toy': [12, 14],
  'Russkiy Toy (long-haired)': [12, 14],
  'Toy Fox Terrier': [13, 15],
  'Toy Poodle': [14, 17],
  'Volpino Italiano': [14, 16],
  'Yorkshire Terrier': [11, 15],
  'Alaskan Klee Kai': [13, 16],
  'Alpine Dachsbracke': [12, 14],
  'Australian Terrier': [11, 15],
  'Basenji': [13, 14],
  'Basset Fauve de Bretagne': [11, 14],
  'Bichon Frise': [14, 15],
  'Border Terrier': [12, 15],
  'Boston Terrier': [11, 13],
  'Cairn Terrier': [13, 15],
  'Cardigan Welsh Corgi': [12, 15],
  'Cavachon': [12, 15],
  'Cavalier King Charles Spaniel': [12, 15],
  'Cavapoo': [12, 15],
  'Cesky Terrier': [12, 15],
  'Cockapoo': [12, 15],
  'Croatian Sheepdog': [13, 14],
  'Dachshund': [12, 16],
  'Dandie Dinmont Terrier': [12, 15],
  'Drever': [12, 15],
  'French Bulldog': [10, 12],
  'German Hunting Terrier': [13, 15],
  'German Pinscher': [12, 14],
  'German Spitz (Klein)': [13, 15],
  'German Spitz (Mittel)': [13, 15],
  'Glen of Imaal Terrier': [10, 15],
  'Grand Basset Griffon Vendéen': [12, 14],
  'Jack Russell Terrier': [13, 16],
  'Japanese Spitz': [12, 16],
  'King Charles Spaniel': [10, 12],
  'Kooikerhondje': [12, 15],
  'Kromfohrländer': [13, 15],
  'Lagotto Romagnolo': [15, 17],
  'Lakeland Terrier': [12, 15],
  'Lancashire Heeler': [12, 15],
  'Lhasa Apso': [12, 15],
  'Manchester Terrier': [15, 17],
  'Miniature Bull Terrier': [11, 13],
  'Miniature Pinscher': [12, 16],
  'Miniature Poodle': [13, 16],
  'Miniature Schnauzer': [12, 15],
  'Mudi': [12, 14],
  'Norfolk Terrier': [12, 16],
  'Norwegian Lundehund': [12, 15],
  'Norwich Terrier': [12, 15],
  'Parson Russell Terrier': [13, 15],
  'Pembroke Welsh Corgi': [12, 13],
  'Petit Basset Griffon Vendéen': [14, 16],
  'Pomsky': [12, 15],
  'Pug': [13, 15],
  'Puggle': [10, 15],
  'Pumi': [12, 13],
  'Rat Terrier': [12, 18],
  'Schapendoes': [12, 15],
  'Schipperke': [13, 15],
  'Schnoodle': [12, 15],
  'Scottish Terrier': [11, 13],
  'Sealyham Terrier': [12, 14],
  'Shetland Sheepdog': [12, 14],
  'Shih Tzu': [11, 15],
  'Silky Terrier': [13, 15],
  'Skye Terrier': [12, 14],
  'Smooth Fox Terrier': [12, 15],
  'Spanish Water Dog': [12, 14],
  'Stabyhoun': [13, 14],
  'Swedish Vallhund': [12, 15],
  'Teddy Roosevelt Terrier': [14, 16],
  'Tibetan Spaniel': [12, 15],
  'Tibetan Terrier': [12, 15],
  'Welsh Terrier': [12, 15],
  'West Highland White Terrier': [13, 15],
  'Westphalian Dachsbracke': [12, 14],
  'Wire Fox Terrier': [12, 15],
  'Afghan Hound': [12, 18],
  'Aidi': [10, 12],
  'Airedale Terrier': [11, 14],
  'American Cocker Spaniel': [10, 14],
  'American English Coonhound': [11, 12],
  'American Foxhound': [11, 13],
  'American Pit Bull Terrier': [12, 16],
  'American Staffordshire Terrier': [12, 16],
  'American Water Spaniel': [10, 14],
  'Appenzeller Sennenhund': [12, 15],
  'Aussiedoodle': [10, 13],
  'Australian Cattle Dog': [12, 16],
  'Australian Shepherd': [12, 15],
  'Azawakh': [12, 15],
  'Barbet': [12, 14],
  'Basset Hound': [12, 13],
  'Bavarian Mountain Scent Hound': [12, 14],
  'Beagle': [10, 15],
  'Bearded Collie': [12, 14],
  'Bedlington Terrier': [11, 16],
  'Belgian Groenendael': [10, 14],
  'Belgian Laekenois': [10, 12],
  'Belgian Malinois': [14, 16],
  'Belgian Tervuren': [12, 14],
  'Bergamasco Sheepdog': [13, 15],
  'Berger Picard': [12, 13],
  'Berger des Pyrénées': [15, 17],
  'Black and Tan Coonhound': [10, 12],
  'Blue Picardy Spaniel': [12, 14],
  'Bluetick Coonhound': [11, 12],
  'Border Collie': [12, 15],
  'Borzoi': [9, 14],
  'Boykin Spaniel': [10, 15],
  'Bracco Italiano': [10, 14],
  'Brittany': [12, 14],
  'Bull Terrier': [12, 13],
  'Canaan Dog': [12, 15],
  'Catalan Sheepdog': [12, 14],
  'Cesky Fousek': [12, 15],
  'Chart Polski': [10, 12],
  'Chow Chow': [8, 12],
  "Cirneco dell'Etna": [12, 14],
  'Clumber Spaniel': [10, 12],
  'Curly-Coated Retriever': [10, 12],
  'Czechoslovakian Wolfdog': [12, 16],
  'Dalmatian': [11, 13],
  'Deutscher Wachtelhund': [12, 14],
  'Drentse Patrijshond': [12, 14],
  'Dutch Shepherd': [11, 14],
  'English Bulldog': [8, 10],
  'English Cocker Spaniel': [12, 14],
  'English Foxhound': [10, 13],
  'English Springer Spaniel': [12, 14],
  'Entlebucher Mountain Dog': [11, 13],
  'Eurasier': [12, 16],
  'Field Spaniel': [12, 13],
  'Finnish Hound': [12, 14],
  'Finnish Lapphund': [12, 15],
  'Finnish Spitz': [13, 15],
  'Flat-Coated Retriever': [8, 10],
  'French Spaniel': [10, 12],
  'Galgo Español': [12, 15],
  'German Longhaired Pointer': [12, 14],
  'German Shorthaired Pointer': [10, 12],
  'German Wirehaired Pointer': [12, 14],
  'Goldendoodle': [10, 15],
  'Greenland Dog': [12, 14],
  'Harrier': [12, 15],
  'Hokkaido': [11, 13],
  'Ibizan Hound': [11, 14],
  'Icelandic Sheepdog': [12, 14],
  'Irish Terrier': [13, 15],
  'Irish Water Spaniel': [10, 12],
  'Italian Spinone': [10, 12],
  'Kai Ken': [12, 15],
  'Karelian Bear Dog': [11, 13],
  'Keeshond': [12, 15],
  'Kerry Blue Terrier': [12, 15],
  'Labradoodle': [12, 14],
  'Norwegian Buhund': [12, 15],
  'Norwegian Elkhound': [12, 15],
  'Nova Scotia Duck Tolling Retriever': [12, 14],
  'Peruvian Inca Orchid': [12, 14],
  'Pharaoh Hound': [12, 14],
  'Picardy Spaniel': [12, 14],
  'Plott Hound': [12, 14],
  'Polish Hound': [13, 14],
  'Polish Lowland Sheepdog': [12, 14],
  'Portuguese Podengo': [12, 15],
  'Portuguese Water Dog': [11, 13],
  'Puli': [12, 16],
  'Redbone Coonhound': [12, 15],
  'Rough Collie': [12, 14],
  'Saarloos Wolfdog': [10, 12],
  'Saluki': [10, 17],
  'Shar Pei': [8, 12],
  'Shiba Inu': [13, 16],
  'Sloughi': [10, 15],
  'Smooth Collie': [12, 14],
  'Soft Coated Wheaten Terrier': [12, 14],
  'Staffordshire Bull Terrier': [12, 14],
  'Standard Poodle': [11, 14],
  'Standard Schnauzer': [13, 16],
  'Sussex Spaniel': [12, 15],
  'Thai Ridgeback': [12, 13],
  'Transylvanian Hound': [10, 14],
  'Treeing Walker Coonhound': [12, 13],
  'Vizsla': [12, 14],
  'Weimaraner': [10, 13],
  'Welsh Springer Spaniel': [12, 15],
  'Whippet': [12, 15],
  'Wirehaired Vizsla': [12, 14],
  'Xoloitzcuintli': [13, 18],
  'Akita Inu': [10, 13],
  'Alaskan Malamute': [10, 14],
  'American Akita': [10, 13],
  'American Bulldog': [10, 12],
  'Anatolian Shepherd': [11, 13],
  'Australian Kelpie': [12, 15],
  'Beauceron': [10, 12],
  'Bernedoodle': [10, 14],
  'Bernese Mountain Dog': [7, 10],
  'Black Russian Terrier': [10, 12],
  'Bloodhound': [10, 12],
  'Bouvier des Flandres': [10, 12],
  'Boxer': [10, 12],
  'Briard': [12, 12],
  'Bullmastiff': [7, 9],
  'Ca de Bou': [10, 12],
  'Cane Corso': [9, 12],
  'Caucasian Shepherd': [10, 12],
  'Central Asian Shepherd': [12, 15],
  'Chesapeake Bay Retriever': [10, 13],
  'Dobermann': [10, 12],
  'Dogo Argentino': [9, 15],
  'Dogue de Bordeaux': [5, 8],
  'English Setter': [10, 12],
  'Estrela Mountain Dog': [10, 14],
  'Fila Brasileiro': [9, 11],
  'German Shepherd': [9, 13],
  'Giant Schnauzer': [10, 12],
  'Golden Retriever': [10, 12],
  'Gordon Setter': [12, 13],
  'Grand Bleu de Gascogne': [10, 12],
  'Greater Swiss Mountain Dog': [8, 11],
  'Greyhound': [10, 13],
  'Hovawart': [10, 14],
  'Irish Red and White Setter': [11, 15],
  'Irish Setter': [12, 15],
  'Irish Wolfhound': [6, 8],
  'Kangal': [12, 15],
  'Komondor': [10, 12],
  'Kuvasz': [10, 12],
  'Labrador Retriever': [11, 13],
  'Landseer': [9, 11],
  'Lapinporokoira': [10, 14],
  'Large Münsterländer': [12, 13],
  'Leonberger': [7, 9],
  'Maremma Sheepdog': [11, 13],
  'Newfoundland': [9, 10],
  'Old English Sheepdog': [10, 12],
  'Otterhound': [10, 13],
  'Perro de Presa Canario': [9, 11],
  'Pointer (English)': [12, 17],
  'Polish Tatra Sheepdog': [10, 12],
  'Pyrenean Mountain Dog': [10, 12],
  'Rhodesian Ridgeback': [10, 12],
  'Rottweiler': [9, 10],
  'Saint Bernard': [8, 10],
  'Samoyed': [12, 14],
  'Sarplaninac': [11, 13],
  'Scottish Deerhound': [8, 11],
  'Sheepadoodle': [12, 15],
  'Siberian Husky': [12, 14],
  'Slovensky Cuvac': [11, 13],
  'Small Münsterländer': [12, 14],
  'South African Boerboel': [9, 11],
  'Spanish Mastiff': [10, 12],
  'Tibetan Mastiff': [10, 12],
  'Tornjak': [12, 14],
  'Tosa Inu': [10, 12],
  'White Swiss Shepherd': [12, 14],
  'Wirehaired Pointing Griffon': [12, 15],
  'Broholmer': [8, 10],
  'English Mastiff': [6, 10],
  'Great Dane': [7, 10],
  'Moscow Watchdog': [9, 11],
  'Neapolitan Mastiff': [7, 9],
  'Pyrenean Mastiff': [10, 13],
  'American Bully': [8, 13],
  'American Eskimo Dog': [13, 15],
  'Akbash': [10, 11],
  'Bucovina Shepherd': [10, 12],
  'Karakachan': [12, 14],
  'Catahoula Leopard Dog': [10, 14],
  'Black Mouth Cur': [12, 16],
  'Patterdale Terrier': [11, 13],
  'Toy Manchester Terrier': [14, 16],
  'Olde English Bulldogge': [9, 14],
  'Danish-Swedish Farmdog': [11, 13],
  'Boerboel': [9, 11],
  'Šarplaninac': [11, 13],
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

/**
 * Pásmo pre jedno plemeno. PUBLIKOVANÝ ÚDAJ PLEMENA PREBÍJA hmotnostnú triedu;
 * trieda je záchranná sieť, nie základ.
 */
export function bandOfBreed(breedEN: string | null | undefined): LifeBand | null {
  if (!breedEN) return null;
  const name = breedEN.trim();
  const pub = BREED_LIFESPAN[name];
  const size = sizeOfBreed(name);
  if (pub) {
    const [low, high] = pub;
    return {
      low, high,
      median: Math.round(((low + high) / 2) * 10) / 10,
      kgSK: size ? LIFE_BANDS[size].kgSK : '',
      fromBreed: true,
    };
  }
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
