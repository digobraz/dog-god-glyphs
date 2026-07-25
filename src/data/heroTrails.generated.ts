// ⚙️ GENEROVANÉ — needituj ručne. Zdroj pravdy: plany/trails-nahadzovac-state.json (done tripy).
// Regeneruj: node plany/gen-hero-trails.mjs
import type { LatLngTuple } from 'leaflet';

export type HeroTrail = {
  id: string; name: string; region: string;
  diff: 'Easy' | 'Moderate' | 'Hard' | 'Odyssey'; km: string; stars: number;
  path: LatLngTuple[]; photos: string[]; seasons: string[];
  desc: string; dogNote: string;
  acts?: string[]; surface?: string[]; crowd?: string; tags?: string[];
  ascentM?: number;   // prevýšenie z DEM eudem25m (m), kalibrované na SNP=29403
  waves?: number;     // vodná plocha: počet vlniek 1|2|3 podľa OSM plochy (100/1000 ha prahy)
  marks?: ('red'|'blue'|'green'|'yellow')[][];  // turistické značky (KČT) — rad ÚSEKOV štart→cieľ, každý = množina súbežných farieb (auto z OSM)
  // iterácia 11 (Portal /pack/portal/trips bod 1) — generovaný dataset nemá per-trip author,
  // UI fallbackuje na 'Hekthor & Matej' (viď tripShared.tsx authorOf). Nové ADD-flow tripy
  // (lokálny session state, nie tento generátor) nesú meno prihláseného člena.
  author?: string;
  // multi-country (2026-07-24): explicitná krajina (ISO2, napr. 'ch') pre ADD-flow tripy mimo SK;
  // ak chýba, trailCountry() ju odvodí z path[0]. Generovaný SK dataset ju nemá (odvodí sa).
  country?: string;
};

export const HERO_TRAILS: HeroTrail[] = [
  {
    "id": "male-karpaty-zaruby-5-sposobov",
    "name": "Záruby (5 spôsobov)",
    "region": "Malé Karpaty",
    "diff": "Moderate",
    "km": "10",
    "stars": 4,
    "path": [
      [
        48.5099341659112,
        17.432191371917728
      ],
      [
        48.51183367610723,
        17.43212699890137
      ],
      [
        48.51253553510426,
        17.430238723754886
      ],
      [
        48.51247867600309,
        17.429745197296146
      ],
      [
        48.513004620254144,
        17.428092956542972
      ],
      [
        48.51417020697544,
        17.430946826934818
      ],
      [
        48.5146250628124,
        17.429337501525882
      ],
      [
        48.51426970703873,
        17.42412328720093
      ],
      [
        48.513953438303915,
        17.42118358612061
      ],
      [
        48.51295842266704,
        17.41989612579346
      ],
      [
        48.51344171841695,
        17.416849136352543
      ],
      [
        48.513100568954364,
        17.41341590881348
      ],
      [
        48.51366915011589,
        17.408094406127933
      ],
      [
        48.512873134703206,
        17.399597167968754
      ],
      [
        48.51474943674437,
        17.401871681213382
      ],
      [
        48.51636271665271,
        17.403030395507816
      ],
      [
        48.51801147827925,
        17.40165710449219
      ],
      [
        48.51977388826626,
        17.40045547485352
      ],
      [
        48.52062664527988,
        17.398567199707035
      ],
      [
        48.52142253887381,
        17.397880554199222
      ],
      [
        48.52085404472565,
        17.396249771118168
      ],
      [
        48.52051294517419,
        17.394533157348636
      ],
      [
        48.52168546525951,
        17.39470481872559
      ],
      [
        48.52228237414982,
        17.39496231079102
      ],
      [
        48.52259503790406,
        17.394275665283207
      ],
      [
        48.523049818101235,
        17.395005226135257
      ],
      [
        48.5237035574808,
        17.39418983459473
      ],
      [
        48.5233909005694,
        17.39243030548096
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784632656/trails/male-karpaty-zaruby/1784632655730-579020.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784632658/trails/male-karpaty-zaruby/1784632658030-64e529.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784632771/trails/male-karpaty-zaruby/1784632770000-f82879.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784632772/trails/male-karpaty-zaruby/1784632772141-68ac10.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784663820/trails/male-karpaty-zaruby-5-sposobov/1784663818714-9c400f.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784663824/trails/male-karpaty-zaruby-5-sposobov/1784663822798-000182.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784663826/trails/male-karpaty-zaruby-5-sposobov/1784663826339-e71d6d.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784663829/trails/male-karpaty-zaruby-5-sposobov/1784663829265-8ac7a9.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784663834/trails/male-karpaty-zaruby-5-sposobov/1784663833951-944d44.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784663837/trails/male-karpaty-zaruby-5-sposobov/1784663836580-a0462a.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784663839/trails/male-karpaty-zaruby-5-sposobov/1784663839495-8bb6da.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784663843/trails/male-karpaty-zaruby-5-sposobov/1784663842606-5fb235.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784663846/trails/male-karpaty-zaruby-5-sposobov/1784663845736-08875d.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784663849/trails/male-karpaty-zaruby-5-sposobov/1784663848493-3d4b13.webp"
    ],
    "seasons": [
      "Spring",
      "Summer",
      "Autumn"
    ],
    "desc": "Cesta vedie cez peknú lúku s altánkom na opekanie a pokračuje cez Čertov žľab – skalnatý priesmyk do sedla, odkiaľ vedie cestička priamo na Záruby.",
    "dogNote": "Cesta pre psíka bezproblémová, žiaľ bez vodného zdroja.",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Rušné",
    "tags": [
      "Forest",
      "View"
    ],
    "ascentM": 532,
    "marks": [
      [
        "blue",
        "yellow"
      ],
      [
        "yellow"
      ],
      [
        "green",
        "yellow"
      ],
      [
        "blue"
      ],
      [
        "green"
      ],
      [
        "blue",
        "green"
      ],
      [
        "green"
      ],
      [
        "red",
        "green"
      ]
    ]
  },
  {
    "id": "male-karpaty-vapenna-rostun",
    "name": "Vápenná (Roštún)",
    "region": "Malé Karpaty",
    "diff": "Moderate",
    "km": "8",
    "stars": 4,
    "path": [
      [
        48.451503251772685,
        17.245252132415775
      ],
      [
        48.45163133854422,
        17.24608898162842
      ],
      [
        48.451346700835394,
        17.24660396575928
      ],
      [
        48.452969114403224,
        17.247462272644047
      ],
      [
        48.45332489992164,
        17.247247695922855
      ],
      [
        48.45500417391454,
        17.251195907592777
      ],
      [
        48.45676877487208,
        17.248771190643314
      ],
      [
        48.45720991552833,
        17.249457836151127
      ],
      [
        48.45706761250966,
        17.250444889068607
      ],
      [
        48.45753721095753,
        17.251431941986088
      ],
      [
        48.457238376084184,
        17.251925468444828
      ],
      [
        48.457309527404064,
        17.252976894378666
      ],
      [
        48.45792142463851,
        17.25389957427979
      ],
      [
        48.458220255491156,
        17.257440090179447
      ],
      [
        48.45886060139489,
        17.258749008178714
      ],
      [
        48.458732532860324,
        17.26033687591553
      ],
      [
        48.45915942671906,
        17.261281013488773
      ],
      [
        48.45900289938767,
        17.26336240768433
      ],
      [
        48.46018395733332,
        17.267653942108158
      ],
      [
        48.45992782661828,
        17.26934909820557
      ],
      [
        48.460084351097706,
        17.270700931549076
      ],
      [
        48.46022664566017,
        17.271988391876224
      ],
      [
        48.46012703950835,
        17.27413415908814
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784632717/trails/male-karpaty-vapenna-rostun/1784632716463-d4616c.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784632718/trails/male-karpaty-vapenna-rostun/1784632718609-d24414.jpg"
    ],
    "seasons": [
      "Spring",
      "Summer",
      "Autumn"
    ],
    "desc": "Výstup na jeden z najvyšších bodov v Malých Karpatoch, ktorý pokračuje po hrebeni na Mesačnú lúku.",
    "dogNote": "Bez vodného zdroja...",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Rušné",
    "tags": [
      "Sunset",
      "View",
      "Forest",
      "Meadow"
    ],
    "ascentM": 455,
    "marks": [
      [
        "red"
      ],
      [
        "red",
        "green"
      ],
      [
        "red",
        "green",
        "yellow"
      ]
    ]
  },
  {
    "id": "male-karpaty-slepy-vrch",
    "name": "Slepý vrch",
    "region": "Malé Karpaty",
    "diff": "Moderate",
    "km": "6.1",
    "stars": 4,
    "path": [
      [
        48.460728230811725,
        17.397880554199222
      ],
      [
        48.454922346172495,
        17.397794723510746
      ],
      [
        48.45258842113762,
        17.39839553833008
      ],
      [
        48.455093116962814,
        17.40371704101563
      ],
      [
        48.458280732949675,
        17.40869522094727
      ],
      [
        48.4579392122385,
        17.412729263305668
      ],
      [
        48.46385857933855,
        17.417793273925785
      ],
      [
        48.465395225240265,
        17.420539855957035
      ],
      [
        48.465622872528215,
        17.424230575561527
      ],
      [
        48.46733019464032,
        17.425518035888675
      ],
      [
        48.46846837747267,
        17.41693496704102
      ],
      [
        48.46357401017716,
        17.411355972290043
      ],
      [
        48.46385857933855,
        17.40869522094727
      ],
      [
        48.46084206504968,
        17.39839553833008
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784633027/trails/male-karpaty-slepy-vrch/1784633026213-7bccc2.jpg"
    ],
    "seasons": [
      "Spring",
      "Summer",
      "Autumn",
      "Winter"
    ],
    "desc": "Nenáročná trasa na malebný kopček s pekným výhľadom.",
    "dogNote": "Pozor na psov na začiatku trasy v Majdánskom – niektorí sa dokázali dostať za plot a prenasledovať nás (možno už sú diery v plotoch opravené).",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Ľudoprázdne",
    "tags": [
      "View",
      "Forest"
    ],
    "ascentM": 264,
    "marks": [
      [
        "blue"
      ]
    ]
  },
  {
    "id": "male-karpaty-chtalnica-klenova",
    "name": "Chtelnica-Klenová",
    "region": "Malé Karpaty",
    "diff": "Easy",
    "km": "3.7",
    "stars": 4,
    "path": [
      [
        48.61824,
        17.58503
      ],
      [
        48.61961,
        17.58662
      ],
      [
        48.62108,
        17.58905
      ],
      [
        48.62197,
        17.59117
      ],
      [
        48.62342,
        17.59319
      ],
      [
        48.62585,
        17.59679
      ],
      [
        48.6257,
        17.59864
      ],
      [
        48.62769,
        17.60113
      ],
      [
        48.62865,
        17.59997
      ],
      [
        48.62871,
        17.59864
      ],
      [
        48.62999,
        17.59851
      ],
      [
        48.63061,
        17.59757
      ],
      [
        48.62922,
        17.59387
      ],
      [
        48.62885,
        17.5928
      ],
      [
        48.62968,
        17.59048
      ],
      [
        48.63243,
        17.59091
      ],
      [
        48.63407,
        17.5904
      ],
      [
        48.63634,
        17.5907
      ],
      [
        48.63654,
        17.5922
      ],
      [
        48.63597,
        17.5937
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784664000/trails/male-karpaty-chtalnica-klenova/1784663999037-8e4176.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784663996/trails/male-karpaty-chtalnica-klenova/1784663995447-f59d71.webp"
    ],
    "seasons": [],
    "desc": "Ľahká nenáročná prechádzka s pekným výhľadom pri opekanisku.",
    "dogNote": "",
    "acts": [
      "hike",
      "picnic"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Forest",
      "View"
    ],
    "ascentM": 275,
    "marks": [
      [
        "green"
      ],
      [
        "red"
      ]
    ]
  },
  {
    "id": "male-karpaty-celo-veterlin",
    "name": "Čelo+Veterlín",
    "region": "Malé Karpaty",
    "diff": "Hard",
    "km": "13",
    "stars": 5,
    "path": [
      [
        48.509152307539274,
        17.431826591491703
      ],
      [
        48.51011896703645,
        17.43118286132813
      ],
      [
        48.510033674293155,
        17.430474758148197
      ],
      [
        48.511682641887376,
        17.426054477691654
      ],
      [
        48.51188165158875,
        17.422084808349613
      ],
      [
        48.5113841258698,
        17.421720027923588
      ],
      [
        48.512862473697645,
        17.418973445892338
      ],
      [
        48.513470147435136,
        17.410798072814945
      ],
      [
        48.512723880421085,
        17.408609390258793
      ],
      [
        48.51391790236764,
        17.408094406127933
      ],
      [
        48.51312189086307,
        17.400112152099613
      ],
      [
        48.516192152042514,
        17.403373718261722
      ],
      [
        48.519717037288245,
        17.400369644165043
      ],
      [
        48.52056979525894,
        17.398996353149418
      ],
      [
        48.52136568974612,
        17.398138046264652
      ],
      [
        48.52062664527988,
        17.39667892456055
      ],
      [
        48.52056979525894,
        17.394618988037113
      ],
      [
        48.517784066072714,
        17.39290237426758
      ],
      [
        48.51744294584877,
        17.39221572875977
      ],
      [
        48.51710182332785,
        17.390327453613285
      ],
      [
        48.51516875232223,
        17.375650405883793
      ],
      [
        48.51408847463445,
        17.364149093627933
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784633413/trails/male-karpaty-veterlin/1784633412963-16f062.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784633369/trails/male-karpaty-veterlin/1784633368242-3a56d6.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784633371/trails/male-karpaty-veterlin/1784633371278-8364e5.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784633406/trails/male-karpaty-veterlin/1784633406387-9b8fc6.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784633407/trails/male-karpaty-veterlin/1784633407835-f78cfd.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784633412/trails/male-karpaty-veterlin/1784633412044-98ba55.jpg"
    ],
    "seasons": [
      "Spring",
      "Summer",
      "Autumn",
      "Winter"
    ],
    "desc": "Oveľa krajší výhľad ako zo Zárub. Na trase však môžu byť obmedzenia – je to chránené vtáčie územie, preto treba ísť na vlastné riziko.",
    "dogNote": "Pri výstupe na Čelo a Veterlín majte psíka na vôdzke. Na Veterlíne vždy fúka :)",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Ľudoprázdne",
    "tags": [
      "Forest",
      "View",
      "Sunset"
    ],
    "ascentM": 566,
    "marks": [
      [
        "green"
      ],
      [
        "green",
        "yellow"
      ],
      [
        "blue"
      ],
      [
        "green"
      ],
      [
        "blue",
        "green"
      ],
      [
        "blue"
      ]
    ]
  },
  {
    "id": "male-karpaty-amonova-luka",
    "name": "Amonova lúka",
    "region": "Malé Karpaty",
    "diff": "Easy",
    "km": "9",
    "stars": 5,
    "path": [
      [
        48.48376023315223,
        17.25986480712891
      ],
      [
        48.49217945451297,
        17.269477844238285
      ],
      [
        48.484670486631586,
        17.29127883911133
      ],
      [
        48.48512560724519,
        17.29557037353516
      ],
      [
        48.480232846617845,
        17.302608489990238
      ],
      [
        48.480752013659725,
        17.307200431823734
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784633608/trails/male-karpaty-amonova-luka/1784633607596-a231c3.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784633610/trails/male-karpaty-amonova-luka/1784633610361-add384.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784633612/trails/male-karpaty-amonova-luka/1784633612296-9e6e18.jpg"
    ],
    "seasons": [],
    "desc": "Krásna lúka v strede lesa s altánkom aj prameňom.",
    "dogNote": "",
    "acts": [
      "hike",
      "picnic"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Forest",
      "Meadow"
    ],
    "ascentM": 415,
    "marks": [
      [
        "blue"
      ]
    ]
  },
  {
    "id": "male-karpaty-cierna-skala",
    "name": "Čierna skala",
    "region": "Malé Karpaty",
    "diff": "Moderate",
    "km": "12",
    "stars": 4,
    "path": [
      [
        48.49419161210761,
        17.402086257934574
      ],
      [
        48.497142158166675,
        17.394533157348636
      ],
      [
        48.49793842069067,
        17.391014099121097
      ],
      [
        48.4966302685112,
        17.389039993286136
      ],
      [
        48.4966302685112,
        17.386293411254886
      ],
      [
        48.49594774093051,
        17.383632659912113
      ],
      [
        48.49691465229123,
        17.372903823852543
      ],
      [
        48.49549271743853,
        17.362174987792972
      ],
      [
        48.49719903447602,
        17.357797622680668
      ],
      [
        48.49628900586944,
        17.3499870300293
      ],
      [
        48.494696416500794,
        17.345952987670902
      ],
      [
        48.49611837368712,
        17.33797073364258
      ],
      [
        48.49719903447602,
        17.336597442626957
      ],
      [
        48.498962168415765,
        17.34148979187012
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784634806/trails/male-karpaty-cierna-skala/1784634805313-55a1a7.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784634813/trails/male-karpaty-cierna-skala/1784634812245-a55858.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784634814/trails/male-karpaty-cierna-skala/1784634814275-7b8324.jpg"
    ],
    "seasons": [],
    "desc": "Pekná prechádzka s krásnym výhľadom. Pozor, posledný výstup je dosť ostrý :)",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Rušné",
    "tags": [
      "Forest",
      "View"
    ],
    "ascentM": 376,
    "marks": [
      [
        "blue",
        "yellow"
      ],
      [
        "green",
        "yellow"
      ],
      [
        "yellow"
      ]
    ]
  },
  {
    "id": "male-karpaty-plavecky-hrad",
    "name": "Plavecký hrad",
    "region": "Malé Karpaty",
    "diff": "Easy",
    "km": "3",
    "stars": 3,
    "path": [
      [
        48.48711,
        17.26244
      ],
      [
        48.48941,
        17.2648
      ],
      [
        48.49118,
        17.26656
      ],
      [
        48.49231,
        17.27012
      ],
      [
        48.49291,
        17.27012
      ],
      [
        48.49348,
        17.2684
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646784/trails/male-karpaty-plavecky-hrad/1784646783983-749d3c.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646784/trails/male-karpaty-plavecky-hrad/1784646783981-c821ff.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646784/trails/male-karpaty-plavecky-hrad/1784646783977-186d99.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646787/trails/male-karpaty-plavecky-hrad/1784646783985-bf5226.webp"
    ],
    "seasons": [],
    "desc": "Jednoduchá prechádzka, prístupná zrúcanina (mňa moc nenadchla).",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Rušné",
    "tags": [
      "Forest",
      "Meadow"
    ],
    "ascentM": 158,
    "marks": [
      [
        "blue"
      ]
    ]
  },
  {
    "id": "male-karpaty-jelenec-a-keltek",
    "name": "Jelenec a Keltek",
    "region": "Malé Karpaty",
    "diff": "Hard",
    "km": "11.6",
    "stars": 5,
    "path": [
      [
        48.40516,
        17.35089
      ],
      [
        48.41553,
        17.34097
      ],
      [
        48.41684,
        17.33703
      ],
      [
        48.41678,
        17.32819
      ],
      [
        48.41975,
        17.32535
      ],
      [
        48.42288,
        17.31677
      ],
      [
        48.42499,
        17.3175
      ],
      [
        48.42661,
        17.31553
      ],
      [
        48.42781,
        17.31068
      ],
      [
        48.4282,
        17.30952
      ],
      [
        48.42914,
        17.3066
      ],
      [
        48.42946,
        17.3045
      ],
      [
        48.43094,
        17.30467
      ],
      [
        48.43122,
        17.29754
      ],
      [
        48.43162,
        17.30548
      ],
      [
        48.43273,
        17.31038
      ],
      [
        48.43228,
        17.31222
      ],
      [
        48.43077,
        17.3142
      ],
      [
        48.43097,
        17.32145
      ],
      [
        48.42652,
        17.33557
      ],
      [
        48.4247,
        17.33746
      ],
      [
        48.42254,
        17.34106
      ],
      [
        48.42043,
        17.34226
      ],
      [
        48.42009,
        17.34544
      ],
      [
        48.41405,
        17.3469
      ],
      [
        48.41029,
        17.3511
      ],
      [
        48.40693,
        17.35273
      ],
      [
        48.40505,
        17.35291
      ],
      [
        48.40476,
        17.35085
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784638716/trails/male-karpaty-jelenec/1784638716117-8dbee0.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784638717/trails/male-karpaty-jelenec/1784638717554-6548e5.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784638715/trails/male-karpaty-jelenec/1784638714266-57a0af.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784638719/trails/male-karpaty-jelenec/1784638718921-861773.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784638720/trails/male-karpaty-jelenec/1784638719884-6948c4.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784638721/trails/male-karpaty-jelenec/1784638720883-13a560.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784638722/trails/male-karpaty-jelenec/1784638722183-71ce69.jpg"
    ],
    "seasons": [],
    "desc": "Zabudnuté miestečko, bez turistov. Jeden z najkrajších západov slnka v Malých Karpatoch - výborné miestečko na prespatie (Jelenec). Na Keltek vedie extréééééémny strmák, výhľad je to pekný :)",
    "dogNote": "",
    "acts": [
      "hike",
      "overnight"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Ľudoprázdne",
    "tags": [
      "Sunset",
      "Forest",
      "View"
    ],
    "ascentM": 491,
    "marks": [
      [
        "green"
      ]
    ]
  },
  {
    "id": "male-karpaty-majdan-klasicky-okruh",
    "name": "Majdán klasický okruh",
    "region": "Malé Karpaty",
    "diff": "Easy",
    "km": "15",
    "stars": 5,
    "path": [
      [
        48.47148088195302,
        17.381079196929935
      ],
      [
        48.468816940859156,
        17.378826141357425
      ],
      [
        48.46688202814557,
        17.378911972045902
      ],
      [
        48.46021597358183,
        17.374105453491214
      ],
      [
        48.45987446588999,
        17.371273040771488
      ],
      [
        48.456060807258346,
        17.37092971801758
      ],
      [
        48.45640234060607,
        17.36947059631348
      ],
      [
        48.45367000949253,
        17.362089157104496
      ],
      [
        48.454246372824066,
        17.35423564910889
      ],
      [
        48.45359173742439,
        17.35153198242188
      ],
      [
        48.45307940818056,
        17.349600791931156
      ],
      [
        48.45228244130375,
        17.348699569702152
      ],
      [
        48.45228244130375,
        17.346510887146
      ],
      [
        48.45079165271395,
        17.34627485275269
      ],
      [
        48.44975270017996,
        17.34674692153931
      ],
      [
        48.448614097648246,
        17.346167564392093
      ],
      [
        48.44763203245948,
        17.346103191375736
      ],
      [
        48.447603566518644,
        17.346704006195072
      ],
      [
        48.44831521025341,
        17.348141670227054
      ],
      [
        48.44710540997072,
        17.350373268127445
      ],
      [
        48.4461517823772,
        17.351596355438236
      ],
      [
        48.44519813687714,
        17.35423564910889
      ],
      [
        48.44501309910882,
        17.356059551239017
      ],
      [
        48.446891912811445,
        17.356660366058353
      ],
      [
        48.44847177053677,
        17.356638908386234
      ],
      [
        48.449838094340684,
        17.359299659729007
      ],
      [
        48.45009427596126,
        17.36047983169556
      ],
      [
        48.45012274050599,
        17.361896038055423
      ],
      [
        48.45076318854415,
        17.363162040710453
      ],
      [
        48.45181635219933,
        17.363634109497074
      ],
      [
        48.453022482389926,
        17.36470699310303
      ],
      [
        48.45339249888831,
        17.366895675659183
      ],
      [
        48.4554133106465,
        17.370543479919437
      ],
      [
        48.45712097618841,
        17.370328903198246
      ],
      [
        48.459511611450026,
        17.37071514129639
      ],
      [
        48.459710825973445,
        17.374148368835453
      ],
      [
        48.461532179652245,
        17.374105453491214
      ],
      [
        48.46580072126143,
        17.377667427062992
      ],
      [
        48.46730885346842,
        17.378869056701664
      ],
      [
        48.470239623730045,
        17.379856109619144
      ],
      [
        48.471491551662865,
        17.38071441650391
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635175/trails/male-karpaty-majdan/1784635174798-54c879.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635015/trails/male-karpaty-majdan/1784635014294-0b6bc6.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635017/trails/male-karpaty-majdan/1784635017668-e2b49b.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635019/trails/male-karpaty-majdan/1784635019012-ea3832.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635173/trails/male-karpaty-majdan/1784635171978-ef5fe3.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635176/trails/male-karpaty-majdan/1784635176639-961a6c.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635178/trails/male-karpaty-majdan/1784635178490-55c969.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635180/trails/male-karpaty-majdan/1784635180017-8c6ac1.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635186/trails/male-karpaty-majdan/1784635181659-d2b231.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635188/trails/male-karpaty-majdan/1784635187308-962ea8.jpg"
    ],
    "seasons": [
      "Spring",
      "Summer",
      "Autumn",
      "Winter"
    ],
    "desc": "Nádherná prechádzka po novej asfaltovej ceste v strede lesa pri potôčiku – vhodná aj na korčule. Pozor na cyklistov. Najlepšie ísť cez týždeň, víkendy bývajú pomerne plné.",
    "dogNote": "",
    "acts": [
      "hike",
      "picnic",
      "skating"
    ],
    "surface": [
      "asphalt"
    ],
    "crowd": "Rušné",
    "tags": [
      "River",
      "Forest"
    ],
    "ascentM": 192,
    "marks": [
      [
        "green"
      ]
    ]
  },
  {
    "id": "male-karpaty-vysoka-na-steroidoch-tajne-skaly",
    "name": "Vysoká na steroidoch (tajné skaly)",
    "region": "Malé Karpaty",
    "diff": "Moderate",
    "km": "14.2",
    "stars": 5,
    "path": [
      [
        48.3814,
        17.27722
      ],
      [
        48.38338,
        17.27439
      ],
      [
        48.38462,
        17.27162
      ],
      [
        48.38673,
        17.26635
      ],
      [
        48.3889,
        17.26231
      ],
      [
        48.39024,
        17.2563
      ],
      [
        48.39149,
        17.25077
      ],
      [
        48.39508,
        17.24592
      ],
      [
        48.39779,
        17.246
      ],
      [
        48.40095,
        17.24609
      ],
      [
        48.40478,
        17.24399
      ],
      [
        48.40859,
        17.23446
      ],
      [
        48.41224,
        17.23394
      ],
      [
        48.41327,
        17.23034
      ],
      [
        48.41537,
        17.22759
      ],
      [
        48.4197,
        17.22382
      ],
      [
        48.41885,
        17.22294
      ],
      [
        48.4184,
        17.22161
      ],
      [
        48.41975,
        17.22249
      ],
      [
        48.42119,
        17.22414
      ],
      [
        48.42218,
        17.22506
      ],
      [
        48.42265,
        17.22573
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639033/trails/male-karpaty-vysoka-tajne-skaly/1784639032975-927370.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639028/trails/male-karpaty-vysoka-tajne-skaly/1784639027353-c56041.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639030/trails/male-karpaty-vysoka-tajne-skaly/1784639029599-8a1190.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639032/trails/male-karpaty-vysoka-tajne-skaly/1784639031175-095e2c.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639035/trails/male-karpaty-vysoka-tajne-skaly/1784639034917-c4dc44.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639036/trails/male-karpaty-vysoka-tajne-skaly/1784639036471-5f127c.jpg"
    ],
    "seasons": [],
    "desc": "Vysoká je jedno z najrušnejších miest v Malých Karpatoch, ale takmer nikto nevie o krásnom mieste kúsok od nej. Výhľady sú možno ešte krajšie. Treba skúsiť.",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Ľudoprázdne",
    "tags": [
      "Forest",
      "View"
    ],
    "ascentM": 383,
    "marks": [
      [
        "blue"
      ],
      [
        "red",
        "blue"
      ],
      [
        "blue"
      ]
    ]
  },
  {
    "id": "male-karpaty-casta-pila",
    "name": "Častá-Píla",
    "region": "Malé Karpaty",
    "diff": "Easy",
    "km": "8",
    "stars": 5,
    "path": [
      [
        48.39743247957125,
        17.317113876342777
      ],
      [
        48.399113601336275,
        17.314968109130863
      ],
      [
        48.39982592431014,
        17.311878204345707
      ],
      [
        48.39897113554457,
        17.309389114379886
      ],
      [
        48.4001678357947,
        17.30702877044678
      ],
      [
        48.40347286166595,
        17.302994728088382
      ],
      [
        48.4060654471706,
        17.301621437072757
      ],
      [
        48.408230582142664,
        17.299990653991703
      ],
      [
        48.40996832116131,
        17.298231124877933
      ],
      [
        48.41424119735532,
        17.294712066650394
      ],
      [
        48.41523815013604,
        17.292737960815433
      ],
      [
        48.41640598424514,
        17.287158966064457
      ],
      [
        48.41777317057937,
        17.28308200836182
      ],
      [
        48.41951058349394,
        17.282009124755863
      ],
      [
        48.42284283226086,
        17.278919219970707
      ],
      [
        48.426224698987696,
        17.276773452758793
      ],
      [
        48.42685120959113,
        17.274026870727543
      ],
      [
        48.42804725384203,
        17.27059364318848
      ],
      [
        48.42821811500862,
        17.26510047912598
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635443/trails/male-karpaty-casta-pila/1784635442611-c1510f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635429/trails/male-karpaty-casta-pila/1784635428780-b7dc55.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635426/trails/male-karpaty-casta-pila/1784635426080-d9ab96.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635427/trails/male-karpaty-casta-pila/1784635427395-2ecc5f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635440/trails/male-karpaty-casta-pila/1784635440641-cdd5b1.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635445/trails/male-karpaty-casta-pila/1784635444208-a618ec.jpg"
    ],
    "seasons": [],
    "desc": "Krásna prechádzka v absolútnom pokoji po asfaltovej ceste. Odporúčam ísť až k prameňu Žobrák. Po trase je veľká Kobylská lúka. POZOR: celé územie je zvernica – množstvo divokej zveri na každom kroku.",
    "dogNote": "Pes lovec – na vôdzke!",
    "acts": [
      "hike",
      "picnic",
      "skating"
    ],
    "surface": [
      "forest",
      "asphalt"
    ],
    "crowd": "Ľudoprázdne",
    "tags": [
      "River",
      "Forest",
      "Meadow"
    ],
    "ascentM": 228
  },
  {
    "id": "male-karpaty-egres",
    "name": "Egreš",
    "region": "Malé Karpaty",
    "diff": "Moderate",
    "km": "10",
    "stars": 5,
    "path": [
      [
        48.40278195806304,
        17.35273361206055
      ],
      [
        48.40534608916516,
        17.35024452209473
      ],
      [
        48.405118171634996,
        17.35299110412598
      ],
      [
        48.40637170541165,
        17.352819442749027
      ],
      [
        48.41349346994099,
        17.34801292419434
      ],
      [
        48.41998764959999,
        17.345609664916996
      ],
      [
        48.422721792859775,
        17.340631484985355
      ],
      [
        48.4225153132162,
        17.338442802429203
      ],
      [
        48.421828228362926,
        17.33601808547974
      ],
      [
        48.421301338349465,
        17.334923744201664
      ],
      [
        48.42074596188244,
        17.33028888702393
      ],
      [
        48.422725352846285,
        17.329924106597904
      ],
      [
        48.423152549416024,
        17.331941127777103
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635781/trails/male-karpaty-egres/1784635780208-8edd68.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635785/trails/male-karpaty-egres/1784635784789-cf7611.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784635786/trails/male-karpaty-egres/1784635786411-614a28.jpg"
    ],
    "seasons": [
      "Spring",
      "Summer",
      "Autumn"
    ],
    "desc": "Nenápadný kopec, pekné výhľady, pokojná príroda.",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Ľudoprázdne",
    "tags": [
      "Meadow",
      "Forest"
    ],
    "ascentM": 338,
    "marks": [
      [
        "green"
      ]
    ]
  },
  {
    "id": "male-karpaty-chtelnica-rajska-zahrada",
    "name": "Chtelnica-Rajská záhrada",
    "region": "Malé Karpaty",
    "diff": "Moderate",
    "km": "12",
    "stars": 5,
    "path": [
      [
        48.60377956796024,
        17.537140846252445
      ],
      [
        48.607553741201805,
        17.534136772155765
      ],
      [
        48.60900090575169,
        17.53199100494385
      ],
      [
        48.61078852234994,
        17.531132698059086
      ],
      [
        48.61053315242472,
        17.52752780914307
      ],
      [
        48.61146950250307,
        17.525639533996586
      ],
      [
        48.61260444901595,
        17.525210380554203
      ],
      [
        48.6167467872948,
        17.523450851440433
      ],
      [
        48.618959678045385,
        17.52207756042481
      ],
      [
        48.62017956351918,
        17.52624034881592
      ],
      [
        48.619640547991565,
        17.527141571044925
      ],
      [
        48.619640547991565,
        17.52851486206055
      ],
      [
        48.61833553919372,
        17.52804279327393
      ],
      [
        48.61762628113147,
        17.529072761535648
      ],
      [
        48.61439193804192,
        17.532591819763187
      ],
      [
        48.614817521339695,
        17.53478050231934
      ],
      [
        48.61430682095188,
        17.536368370056156
      ],
      [
        48.61362587906548,
        17.538213729858402
      ],
      [
        48.61348401501653,
        17.542891502380375
      ],
      [
        48.61461891624717,
        17.545895576477054
      ],
      [
        48.61586727813577,
        17.546582221984867
      ],
      [
        48.615640305542904,
        17.548384666442875
      ],
      [
        48.6166989111825,
        17.551302909851078
      ],
      [
        48.618573138416245,
        17.552826404571537
      ],
      [
        48.617424140759006,
        17.552933692932132
      ],
      [
        48.617239731292145,
        17.554156780242923
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636062/trails/male-karpaty-dobra-voda-rajska-zahrada/1784636062212-fc20b6.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636220/trails/male-karpaty-dobra-voda-rajska-zahrada/1784636220271-5622c5.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636219/trails/male-karpaty-dobra-voda-rajska-zahrada/1784636219062-0a22ac.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636055/trails/male-karpaty-dobra-voda-rajska-zahrada/1784636055602-01d083.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636060/trails/male-karpaty-dobra-voda-rajska-zahrada/1784636060576-b39bc8.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636064/trails/male-karpaty-dobra-voda-rajska-zahrada/1784636063944-75f1a5.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636065/trails/male-karpaty-dobra-voda-rajska-zahrada/1784636065293-1bbc99.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636067/trails/male-karpaty-dobra-voda-rajska-zahrada/1784636067133-674e94.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636217/trails/male-karpaty-dobra-voda-rajska-zahrada/1784636216531-f41ac2.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636222/trails/male-karpaty-dobra-voda-rajska-zahrada/1784636222135-2dcaa1.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636871/trails/male-karpaty-chtelnica-rajska-zahrada/1784636870694-417df5.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636873/trails/male-karpaty-chtelnica-rajska-zahrada/1784636873095-0d168e.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636875/trails/male-karpaty-chtelnica-rajska-zahrada/1784636874586-8d470b.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636877/trails/male-karpaty-chtelnica-rajska-zahrada/1784636876373-b4f7c0.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636879/trails/male-karpaty-chtelnica-rajska-zahrada/1784636878999-187d07.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636882/trails/male-karpaty-chtelnica-rajska-zahrada/1784636882283-8c45d6.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636884/trails/male-karpaty-chtelnica-rajska-zahrada/1784636883917-1641a6.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636885/trails/male-karpaty-chtelnica-rajska-zahrada/1784636885312-f807d2.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636887/trails/male-karpaty-chtelnica-rajska-zahrada/1784636887074-9a54c4.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636889/trails/male-karpaty-chtelnica-rajska-zahrada/1784636889113-ac88bb.jpg"
    ],
    "seasons": [
      "Spring",
      "Summer",
      "Autumn",
      "Winter"
    ],
    "desc": "Pekná asfaltová cestička cez les vedúca ku krásnemu výhľadu na vysokú skalnú stenu. Hore na výhľade je aj húpačka a ohnisko :)",
    "dogNote": "",
    "acts": [
      "hike",
      "picnic",
      "overnight"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Forest",
      "View"
    ],
    "ascentM": 263,
    "marks": [
      [
        "red"
      ]
    ]
  },
  {
    "id": "male-karpaty-dechtice",
    "name": "Dechtice",
    "region": "Malé Karpaty",
    "diff": "Easy",
    "km": "4.2",
    "stars": 4,
    "path": [
      [
        48.551392683042174,
        17.593038082122806
      ],
      [
        48.551754880250414,
        17.590495347976688
      ],
      [
        48.55348238322222,
        17.591814994812015
      ],
      [
        48.5549026909177,
        17.590870857238773
      ],
      [
        48.556095718569374,
        17.59194374084473
      ],
      [
        48.559475810804905,
        17.58666515350342
      ],
      [
        48.55953261714802,
        17.585849761962894
      ],
      [
        48.56328169474917,
        17.58348941802979
      ],
      [
        48.56311128815929,
        17.581515312194828
      ],
      [
        48.56140719068349,
        17.579884529113773
      ],
      [
        48.5602710938035,
        17.580056190490726
      ],
      [
        48.55957877225485,
        17.57848978042603
      ],
      [
        48.560019018849395,
        17.58044242858887
      ],
      [
        48.55811598992602,
        17.58123636245728
      ],
      [
        48.55592528777012,
        17.581343650817875
      ],
      [
        48.55265858648971,
        17.583103179931644
      ],
      [
        48.55123821579709,
        17.5937032699585
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636529/trails/male-karpaty-dechtice/1784636528630-df5e5a.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636531/trails/male-karpaty-dechtice/1784636531035-b19a97.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636532/trails/male-karpaty-dechtice/1784636532508-3629b6.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636535/trails/male-karpaty-dechtice/1784636534124-26717a.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784636536/trails/male-karpaty-dechtice/1784636536210-cd65ce.jpg"
    ],
    "seasons": [],
    "desc": "Krátka prechádzka cez pekný ihličnatý lesík a lúku vedúca ku gigantickej lavičke a soche Panny Márie. V okolí sú rôzne cestičky vedúce nad kameňolom s peknými výhľadmi na Dechtice a okolie.",
    "dogNote": "Bez vodného zdroja, čo je škoda – prameň býva vyschnutý.",
    "acts": [
      "hike",
      "picnic"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Forest",
      "Meadow",
      "Sunset",
      "View"
    ],
    "ascentM": 113,
    "marks": [
      [
        "yellow"
      ]
    ]
  },
  {
    "id": "male-karpaty-chtelnica-priehrada",
    "name": "Chtelnica priehrada",
    "region": "Malé Karpaty",
    "diff": "Moderate",
    "km": "6.8",
    "stars": 5,
    "path": [
      [
        48.5933423688953,
        17.607307434082035
      ],
      [
        48.59640776590385,
        17.60516166687012
      ],
      [
        48.59992706644097,
        17.590055465698246
      ],
      [
        48.601012607651704,
        17.588381767272953
      ],
      [
        48.60314105211202,
        17.587265968322757
      ],
      [
        48.606762748931594,
        17.586557865142826
      ],
      [
        48.60801130506489,
        17.587094306945804
      ],
      [
        48.60915697003946,
        17.58773803710938
      ],
      [
        48.610178469830515,
        17.58692264556885
      ],
      [
        48.61395216486538,
        17.586407661437992
      ],
      [
        48.61829298399099,
        17.58516311645508
      ],
      [
        48.61800928172274,
        17.583532333374027
      ],
      [
        48.61690282764197,
        17.580313682556156
      ],
      [
        48.6147182188911,
        17.577524185180668
      ],
      [
        48.612987487706086,
        17.57224559783936
      ],
      [
        48.61247676880683,
        17.571172714233402
      ],
      [
        48.61415077258075,
        17.570099830627445
      ],
      [
        48.614292634756254,
        17.569069862365726
      ],
      [
        48.614973567650004,
        17.568383216857914
      ],
      [
        48.61630703463057,
        17.56670951843262
      ],
      [
        48.616789343800946,
        17.562632560729984
      ],
      [
        48.61752698420755,
        17.56151676177979
      ],
      [
        48.61670423075278,
        17.558941841125492
      ],
      [
        48.61724327763438,
        17.5587272644043
      ],
      [
        48.617158165351526,
        17.55495071411133
      ],
      [
        48.618690164487944,
        17.55623817443848
      ],
      [
        48.61973984075809,
        17.558083534240726
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784637106/trails/male-karpaty-chtelnica-priehrada/1784637106063-ce5785.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784637101/trails/male-karpaty-chtelnica-priehrada/1784637100526-31ff4a.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784637102/trails/male-karpaty-chtelnica-priehrada/1784637102398-bf84c0.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784637103/trails/male-karpaty-chtelnica-priehrada/1784637103490-20c1a4.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784637105/trails/male-karpaty-chtelnica-priehrada/1784637104866-79ad37.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784637107/trails/male-karpaty-chtelnica-priehrada/1784637107600-1fcf5b.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784637109/trails/male-karpaty-chtelnica-priehrada/1784637108949-963bed.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784637111/trails/male-karpaty-chtelnica-priehrada/1784637111756-88fd77.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784637113/trails/male-karpaty-chtelnica-priehrada/1784637113192-7a12eb.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784637114/trails/male-karpaty-chtelnica-priehrada/1784637114554-94cd80.jpg"
    ],
    "seasons": [
      "Spring",
      "Summer",
      "Autumn",
      "Winter"
    ],
    "desc": "Moje najobľúbenejšie miesto na zemi. Priehrada v strede lesa, najkrajšia lúka s ikonickými stromami a majestátny výhľad zo skaly… To všetko bez ľudí, s obrovským pokojom.",
    "dogNote": "",
    "acts": [
      "paddleboard",
      "skating"
    ],
    "surface": [
      "asphalt"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Lake",
      "Meadow",
      "Forest",
      "View",
      "In the middle of nature",
      "Embankment"
    ],
    "waves": 1,
    "marks": [
      [
        "green"
      ]
    ]
  },
  {
    "id": "male-karpaty-chtelnica-plesiva-nadrz",
    "name": "Chtelnica (Plešivá/Nádrž)",
    "region": "Malé Karpaty",
    "diff": "Moderate",
    "km": "15",
    "stars": 4,
    "path": [
      [
        48.571,
        17.59915
      ],
      [
        48.57018,
        17.59782
      ],
      [
        48.56957,
        17.59769
      ],
      [
        48.5701,
        17.59724
      ],
      [
        48.57114,
        17.59857
      ],
      [
        48.57181,
        17.59759
      ],
      [
        48.57337,
        17.59546
      ],
      [
        48.57387,
        17.59383
      ],
      [
        48.57367,
        17.59171
      ],
      [
        48.57445,
        17.58958
      ],
      [
        48.57424,
        17.58866
      ],
      [
        48.57399,
        17.58853
      ],
      [
        48.57405,
        17.58772
      ],
      [
        48.57336,
        17.58574
      ],
      [
        48.57297,
        17.58574
      ],
      [
        48.57488,
        17.5886
      ],
      [
        48.57672,
        17.58628
      ],
      [
        48.57862,
        17.58649
      ],
      [
        48.57947,
        17.58842
      ],
      [
        48.58004,
        17.58503
      ],
      [
        48.57956,
        17.5831
      ],
      [
        48.57831,
        17.58139
      ],
      [
        48.5778,
        17.58001
      ],
      [
        48.57712,
        17.5789
      ],
      [
        48.57547,
        17.57843
      ],
      [
        48.57456,
        17.57988
      ],
      [
        48.5732,
        17.58182
      ],
      [
        48.57121,
        17.58366
      ],
      [
        48.5703,
        17.58594
      ],
      [
        48.57104,
        17.5886
      ],
      [
        48.57101,
        17.59044
      ],
      [
        48.57045,
        17.59203
      ],
      [
        48.57022,
        17.59306
      ],
      [
        48.57093,
        17.59315
      ],
      [
        48.5701,
        17.59636
      ],
      [
        48.57087,
        17.59958
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639468/trails/male-karpaty-plesiva-chtelnica/1784639467744-e545b2.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639434/trails/male-karpaty-plesiva-chtelnica/1784639433433-4bb0ff.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639435/trails/male-karpaty-plesiva-chtelnica/1784639435403-6d2fcd.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639436/trails/male-karpaty-plesiva-chtelnica/1784639436714-2c1ea0.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639438/trails/male-karpaty-plesiva-chtelnica/1784639437971-03f907.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639439/trails/male-karpaty-plesiva-chtelnica/1784639439535-fd39de.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639441/trails/male-karpaty-plesiva-chtelnica/1784639440997-4e8297.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639442/trails/male-karpaty-plesiva-chtelnica/1784639442278-f57cc4.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639443/trails/male-karpaty-plesiva-chtelnica/1784639443625-6b2bf2.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639445/trails/male-karpaty-plesiva-chtelnica/1784639445040-c1d7a4.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639446/trails/male-karpaty-plesiva-chtelnica/1784639446182-1a8f65.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639447/trails/male-karpaty-plesiva-chtelnica/1784639447643-fdfa47.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639449/trails/male-karpaty-plesiva-chtelnica/1784639448924-1e7cc9.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639466/trails/male-karpaty-plesiva-chtelnica/1784639465562-dac1c9.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639469/trails/male-karpaty-plesiva-chtelnica/1784639468982-dad6ec.jpg"
    ],
    "seasons": [],
    "desc": "Veľmi podarená lokalita. Krásne výhľady, možnosť opekania aj viacerých prechádzok. Miesto ako stvorené na \"dobrodružstvo\" v aute pre zamilovaných :)",
    "dogNote": "",
    "acts": [
      "hike",
      "picnic",
      "overnight"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Ľudoprázdne",
    "tags": [
      "Forest",
      "Meadow",
      "Sunset",
      "View"
    ],
    "ascentM": 124
  },
  {
    "id": "male-karpaty-lancarska-luka",
    "name": "Lančárska lúka",
    "region": "Malé Karpaty",
    "diff": "Easy",
    "km": "7",
    "stars": 4,
    "path": [
      [
        48.58987,
        17.64722
      ],
      [
        48.59115,
        17.6467
      ],
      [
        48.59206,
        17.6455
      ],
      [
        48.59189,
        17.64366
      ],
      [
        48.59356,
        17.64151
      ],
      [
        48.59881,
        17.63683
      ],
      [
        48.60242,
        17.63301
      ],
      [
        48.60449,
        17.63048
      ],
      [
        48.60554,
        17.62872
      ],
      [
        48.60531,
        17.62619
      ],
      [
        48.60596,
        17.62271
      ],
      [
        48.60577,
        17.62022
      ],
      [
        48.60494,
        17.61838
      ],
      [
        48.6044,
        17.61645
      ],
      [
        48.60571,
        17.62945
      ],
      [
        48.60384,
        17.6325
      ],
      [
        48.60208,
        17.63683
      ],
      [
        48.60083,
        17.63628
      ],
      [
        48.60003,
        17.6364
      ],
      [
        48.59932,
        17.6361
      ],
      [
        48.59515,
        17.63992
      ],
      [
        48.59206,
        17.64314
      ],
      [
        48.59166,
        17.64636
      ],
      [
        48.58967,
        17.64769
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639593/trails/male-karpaty-lancarska-luka/1784639593201-3c69f2.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639584/trails/male-karpaty-lancarska-luka/1784639583144-ca5f40.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639586/trails/male-karpaty-lancarska-luka/1784639586307-5a3673.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639588/trails/male-karpaty-lancarska-luka/1784639587831-ad7b13.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639590/trails/male-karpaty-lancarska-luka/1784639590159-b9902a.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639591/trails/male-karpaty-lancarska-luka/1784639591691-9f511c.jpg"
    ],
    "seasons": [],
    "desc": "Zaujímavá lesná prechádzka v súkromí. Trasa vedie cez nádhernú lúku v strede lesa - pripomína obrovské futbalové ihrisko - tu sa žiada stanovať! Určite to raz vyskúšame!",
    "dogNote": "",
    "acts": [
      "hike",
      "overnight",
      "picnic"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Ľudoprázdne",
    "tags": [
      "Meadow",
      "Forest",
      "View"
    ],
    "ascentM": 128
  },
  {
    "id": "male-karpaty-cachticky-hrad-plesivce",
    "name": "Čachtický hrad – Plešivce",
    "region": "Malé Karpaty",
    "diff": "Moderate",
    "km": "11",
    "stars": 4,
    "path": [
      [
        48.72107,
        17.76459
      ],
      [
        48.72385,
        17.76202
      ],
      [
        48.7224,
        17.76258
      ],
      [
        48.72154,
        17.76268
      ],
      [
        48.72051,
        17.76292
      ],
      [
        48.71964,
        17.76242
      ],
      [
        48.71906,
        17.76232
      ],
      [
        48.71831,
        17.76178
      ],
      [
        48.7163,
        17.7626
      ],
      [
        48.71549,
        17.76139
      ],
      [
        48.71554,
        17.75968
      ],
      [
        48.71469,
        17.75835
      ],
      [
        48.7153,
        17.75616
      ],
      [
        48.71603,
        17.75485
      ],
      [
        48.71538,
        17.75399
      ],
      [
        48.71435,
        17.7532
      ],
      [
        48.71265,
        17.7541
      ],
      [
        48.71186,
        17.75311
      ],
      [
        48.71176,
        17.75056
      ],
      [
        48.7106,
        17.74998
      ],
      [
        48.71061,
        17.74936
      ],
      [
        48.71246,
        17.74835
      ],
      [
        48.71262,
        17.7479
      ],
      [
        48.7121,
        17.74687
      ],
      [
        48.71252,
        17.74562
      ],
      [
        48.71222,
        17.74532
      ],
      [
        48.71263,
        17.7412
      ],
      [
        48.71196,
        17.74043
      ],
      [
        48.712,
        17.73959
      ],
      [
        48.71021,
        17.73867
      ],
      [
        48.70914,
        17.73869
      ],
      [
        48.70833,
        17.74084
      ],
      [
        48.70766,
        17.74033
      ],
      [
        48.70729,
        17.7388
      ],
      [
        48.70647,
        17.7388
      ],
      [
        48.70692,
        17.73635
      ],
      [
        48.7057,
        17.73625
      ],
      [
        48.70466,
        17.73668
      ],
      [
        48.70434,
        17.73816
      ],
      [
        48.70411,
        17.74022
      ],
      [
        48.70337,
        17.73871
      ],
      [
        48.70255,
        17.7371
      ],
      [
        48.70176,
        17.73698
      ],
      [
        48.70471,
        17.73537
      ],
      [
        48.70575,
        17.73479
      ],
      [
        48.70693,
        17.7359
      ],
      [
        48.70669,
        17.7385
      ],
      [
        48.70752,
        17.73869
      ],
      [
        48.70779,
        17.74065
      ],
      [
        48.70876,
        17.73912
      ],
      [
        48.70993,
        17.73846
      ],
      [
        48.7115,
        17.73936
      ],
      [
        48.71196,
        17.74002
      ],
      [
        48.71246,
        17.74146
      ],
      [
        48.71214,
        17.74485
      ],
      [
        48.71238,
        17.74597
      ],
      [
        48.71212,
        17.74725
      ],
      [
        48.71246,
        17.74775
      ],
      [
        48.71045,
        17.74944
      ],
      [
        48.71156,
        17.75037
      ],
      [
        48.7117,
        17.75285
      ],
      [
        48.71251,
        17.75399
      ],
      [
        48.71421,
        17.75307
      ],
      [
        48.7154,
        17.75363
      ],
      [
        48.71603,
        17.75494
      ],
      [
        48.7153,
        17.7562
      ],
      [
        48.71468,
        17.75803
      ],
      [
        48.71551,
        17.75961
      ],
      [
        48.71552,
        17.76166
      ],
      [
        48.71627,
        17.76266
      ],
      [
        48.7178,
        17.76167
      ],
      [
        48.71893,
        17.76185
      ],
      [
        48.71916,
        17.76242
      ],
      [
        48.72027,
        17.76266
      ],
      [
        48.72128,
        17.76266
      ],
      [
        48.72246,
        17.7624
      ],
      [
        48.72369,
        17.76208
      ],
      [
        48.7211,
        17.76474
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639662/trails/male-karpaty-cachticky-hrad-plesivce/1784639661813-9d8193.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639654/trails/male-karpaty-cachticky-hrad-plesivce/1784639653676-c7ae11.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639656/trails/male-karpaty-cachticky-hrad-plesivce/1784639656019-7e1f05.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639657/trails/male-karpaty-cachticky-hrad-plesivce/1784639657407-a979f1.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639658/trails/male-karpaty-cachticky-hrad-plesivce/1784639658628-17a6da.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639660/trails/male-karpaty-cachticky-hrad-plesivce/1784639660024-a0becf.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639664/trails/male-karpaty-cachticky-hrad-plesivce/1784639664651-99b94a.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639666/trails/male-karpaty-cachticky-hrad-plesivce/1784639666346-1b623e.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639668/trails/male-karpaty-cachticky-hrad-plesivce/1784639668098-66a2b6.jpg"
    ],
    "seasons": [],
    "desc": "Jednoduchá, ale celkom dlhá prechádzka na Malý aj Veľký Plešivec cez Čachtický hrad :) Krásne ale vždy veterné výhľady.",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Rušné",
    "tags": [
      "Forest",
      "View"
    ],
    "ascentM": 446,
    "marks": [
      [
        "green"
      ],
      [
        "blue",
        "green"
      ],
      [
        "blue"
      ],
      [
        "blue",
        "yellow"
      ],
      [
        "blue"
      ],
      [
        "blue",
        "green"
      ],
      [
        "green"
      ]
    ]
  },
  {
    "id": "male-karpaty-orlie-skaly",
    "name": "Orlie skaly",
    "region": "Malé Karpaty",
    "diff": "Easy",
    "km": "8",
    "stars": 5,
    "path": [
      [
        48.61099,
        17.67344
      ],
      [
        48.61472,
        17.67039
      ],
      [
        48.61617,
        17.66743
      ],
      [
        48.61826,
        17.66743
      ],
      [
        48.61957,
        17.67078
      ],
      [
        48.62153,
        17.67194
      ],
      [
        48.62221,
        17.67331
      ],
      [
        48.62391,
        17.67288
      ],
      [
        48.6219,
        17.6667
      ],
      [
        48.62076,
        17.66619
      ],
      [
        48.62104,
        17.66387
      ],
      [
        48.62102,
        17.6625
      ],
      [
        48.62519,
        17.65821
      ],
      [
        48.62607,
        17.6564
      ],
      [
        48.62691,
        17.65548
      ],
      [
        48.62691,
        17.65512
      ],
      [
        48.62859,
        17.65134
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639745/trails/male-karpaty-orlie-skaly/1784639744744-1d3926.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639747/trails/male-karpaty-orlie-skaly/1784639747118-d457c9.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639751/trails/male-karpaty-orlie-skaly/1784639750244-26b631.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639753/trails/male-karpaty-orlie-skaly/1784639752693-cf1185.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639754/trails/male-karpaty-orlie-skaly/1784639754075-9ab739.jpg"
    ],
    "seasons": [],
    "desc": "Krásna prechádzka s majestátnym výhľadom na Malé Karpaty",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Forest",
      "View",
      "Meadow",
      "Sunset"
    ],
    "ascentM": 200,
    "marks": [
      [
        "green"
      ]
    ]
  },
  {
    "id": "male-karpaty-medvedie-udolie-limbach",
    "name": "Medvedie údolie – Limbach",
    "region": "Malé Karpaty",
    "diff": "Easy",
    "km": "9.5",
    "stars": 4,
    "path": [
      [
        48.28676,
        17.19953
      ],
      [
        48.28852,
        17.19631
      ],
      [
        48.28972,
        17.19335
      ],
      [
        48.28989,
        17.18858
      ],
      [
        48.29112,
        17.18481
      ],
      [
        48.292,
        17.18403
      ],
      [
        48.29299,
        17.18184
      ],
      [
        48.29493,
        17.17601
      ],
      [
        48.2951,
        17.17249
      ],
      [
        48.29539,
        17.16983
      ],
      [
        48.29573,
        17.16511
      ],
      [
        48.29613,
        17.16159
      ],
      [
        48.29721,
        17.15755
      ],
      [
        48.29738,
        17.15592
      ],
      [
        48.29885,
        17.1567
      ],
      [
        48.30057,
        17.15532
      ],
      [
        48.30248,
        17.15584
      ],
      [
        48.30245,
        17.15884
      ],
      [
        48.301,
        17.16253
      ],
      [
        48.30188,
        17.16408
      ],
      [
        48.30271,
        17.16691
      ],
      [
        48.30505,
        17.16635
      ],
      [
        48.30582,
        17.16481
      ],
      [
        48.30591,
        17.16318
      ],
      [
        48.30725,
        17.16657
      ],
      [
        48.30635,
        17.16923
      ],
      [
        48.30382,
        17.17129
      ],
      [
        48.30154,
        17.17391
      ],
      [
        48.29983,
        17.17841
      ],
      [
        48.29748,
        17.18253
      ],
      [
        48.29529,
        17.18382
      ],
      [
        48.29369,
        17.18433
      ],
      [
        48.29246,
        17.18425
      ],
      [
        48.29037,
        17.18644
      ],
      [
        48.28989,
        17.19107
      ],
      [
        48.28903,
        17.19575
      ],
      [
        48.28723,
        17.1985
      ],
      [
        48.28686,
        17.19935
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639889/trails/male-karpaty-medvedie-udolie-limbach/1784639888429-91cb38.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639884/trails/male-karpaty-medvedie-udolie-limbach/1784639883809-9d8060.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639886/trails/male-karpaty-medvedie-udolie-limbach/1784639886367-a41d3f.jpg"
    ],
    "seasons": [],
    "desc": "Krásna prechádzka :)",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Forest",
      "River"
    ],
    "ascentM": 373,
    "marks": [
      [
        "green"
      ]
    ]
  },
  {
    "id": "male-karpaty-bukova-priehrada",
    "name": "Buková priehrada",
    "region": "Malé Karpaty",
    "diff": "Moderate",
    "km": "",
    "stars": 4,
    "path": [
      [
        48.53481,
        17.36189
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639926/trails/male-karpaty-bukova/1784639925133-ca940d.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639928/trails/male-karpaty-bukova/1784639927744-749722.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784639930/trails/male-karpaty-bukova/1784639929681-fd9e21.jpg"
    ],
    "seasons": [],
    "desc": "Malebná priehrada obklopená lesom",
    "dogNote": "",
    "acts": [
      "paddleboard",
      "skating"
    ],
    "surface": [],
    "crowd": "Pokojné",
    "tags": [
      "In the middle of nature",
      "Forest"
    ],
    "waves": 1
  },
  {
    "id": "male-karpaty-stary-plast",
    "name": "Starý plášť",
    "region": "Malé Karpaty",
    "diff": "Moderate",
    "km": "13.2",
    "stars": 5,
    "path": [
      [
        48.47172,
        17.38194
      ],
      [
        48.47268,
        17.37908
      ],
      [
        48.47511,
        17.37462
      ],
      [
        48.47841,
        17.3723
      ],
      [
        48.48052,
        17.36338
      ],
      [
        48.48382,
        17.35891
      ],
      [
        48.48592,
        17.35677
      ],
      [
        48.48558,
        17.35394
      ],
      [
        48.48581,
        17.34947
      ],
      [
        48.48615,
        17.33926
      ],
      [
        48.48625,
        17.33741
      ],
      [
        48.48272,
        17.33767
      ],
      [
        48.48201,
        17.3396
      ],
      [
        48.48201,
        17.3408
      ],
      [
        48.47885,
        17.34158
      ],
      [
        48.47908,
        17.33788
      ],
      [
        48.47766,
        17.33638
      ],
      [
        48.47786,
        17.33449
      ],
      [
        48.47882,
        17.33398
      ],
      [
        48.48127,
        17.33304
      ],
      [
        48.48264,
        17.33175
      ],
      [
        48.48284,
        17.33007
      ],
      [
        48.48156,
        17.32952
      ],
      [
        48.48042,
        17.32939
      ],
      [
        48.48301,
        17.32887
      ],
      [
        48.48363,
        17.32806
      ],
      [
        48.48099,
        17.32544
      ],
      [
        48.48013,
        17.32329
      ],
      [
        48.4774,
        17.32741
      ],
      [
        48.47802,
        17.33151
      ],
      [
        48.47855,
        17.33366
      ],
      [
        48.47763,
        17.33561
      ],
      [
        48.47506,
        17.34072
      ],
      [
        48.4721,
        17.34175
      ],
      [
        48.46925,
        17.34939
      ],
      [
        48.46549,
        17.36063
      ],
      [
        48.46379,
        17.36089
      ],
      [
        48.46373,
        17.36449
      ],
      [
        48.4672,
        17.36561
      ],
      [
        48.46954,
        17.37059
      ],
      [
        48.4705,
        17.37514
      ],
      [
        48.46914,
        17.37908
      ],
      [
        48.47175,
        17.38046
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640018/trails/male-karpaty-stary-plast/1784640018311-f3dc62.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640016/trails/male-karpaty-stary-plast/1784640016732-8b6323.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640015/trails/male-karpaty-stary-plast/1784640014053-7404c3.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640020/trails/male-karpaty-stary-plast/1784640020023-38c03a.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640021/trails/male-karpaty-stary-plast/1784640021303-9df4c9.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640023/trails/male-karpaty-stary-plast/1784640023258-5c25cd.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640025/trails/male-karpaty-stary-plast/1784640025397-a354f7.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640028/trails/male-karpaty-stary-plast/1784640027080-8475ea.jpg"
    ],
    "seasons": [],
    "desc": "Nenápadný kopček s prekvapivým výhľadom - takmer bez ľudí :))",
    "dogNote": "",
    "acts": [
      "hike",
      "picnic"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Ľudoprázdne",
    "tags": [
      "Forest",
      "Meadow",
      "View"
    ],
    "ascentM": 558,
    "marks": [
      [
        "green"
      ]
    ]
  },
  {
    "id": "biele-karpaty-vrsatecke-podhradie-chelova-okruh",
    "name": "Vršatecké Podhradie (Cheľová +okruh)",
    "region": "Biele Karpaty",
    "diff": "Moderate",
    "km": "5.9",
    "stars": 5,
    "path": [
      [
        49.06913,
        18.15297
      ],
      [
        49.0721,
        18.15714
      ],
      [
        49.07362,
        18.15431
      ],
      [
        49.07283,
        18.15735
      ],
      [
        49.07584,
        18.15903
      ],
      [
        49.07778,
        18.16001
      ],
      [
        49.07916,
        18.16182
      ],
      [
        49.08054,
        18.16443
      ],
      [
        49.08169,
        18.16838
      ],
      [
        49.08172,
        18.17139
      ],
      [
        49.08068,
        18.17293
      ],
      [
        49.07854,
        18.17306
      ],
      [
        49.07688,
        18.17177
      ],
      [
        49.07646,
        18.1704
      ],
      [
        49.07517,
        18.1701
      ],
      [
        49.07362,
        18.17027
      ],
      [
        49.07213,
        18.16984
      ],
      [
        49.06982,
        18.16641
      ],
      [
        49.07011,
        18.16431
      ],
      [
        49.06769,
        18.16199
      ],
      [
        49.06735,
        18.15898
      ],
      [
        49.06639,
        18.15722
      ],
      [
        49.06562,
        18.15486
      ],
      [
        49.06455,
        18.15386
      ],
      [
        49.06439,
        18.15356
      ],
      [
        49.06439,
        18.15197
      ],
      [
        49.06688,
        18.15272
      ],
      [
        49.06789,
        18.15298
      ],
      [
        49.06871,
        18.15317
      ],
      [
        49.06896,
        18.15289
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641331/trails/biele-karpaty-vrsatecke-podhradie/1784641331368-f9c690.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641333/trails/biele-karpaty-vrsatecke-podhradie/1784641332662-c3edde.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641330/trails/biele-karpaty-vrsatecke-podhradie/1784641329135-acaae8.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641334/trails/biele-karpaty-vrsatecke-podhradie/1784641334071-69dbe1.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641335/trails/biele-karpaty-vrsatecke-podhradie/1784641335380-e652a5.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641337/trails/biele-karpaty-vrsatecke-podhradie/1784641337032-79b56c.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641338/trails/biele-karpaty-vrsatecke-podhradie/1784641338396-de1352.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641340/trails/biele-karpaty-vrsatecke-podhradie/1784641340060-cff1e7.jpg"
    ],
    "seasons": [],
    "desc": "Krásny výlet, prekvapí vás už samotná cesta ale aj samotné majestátne skalné bralá. V okolí je kopu ďalších možností krásnych turistík :)",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Mountains",
      "Forest",
      "View",
      "Meadow"
    ],
    "ascentM": 400,
    "marks": [
      [
        "green",
        "yellow"
      ],
      [
        "yellow"
      ],
      [
        "green",
        "yellow"
      ],
      [
        "green"
      ],
      [
        "blue",
        "green"
      ]
    ]
  },
  {
    "id": "biele-karpaty-velky-lopenik-rozhladna",
    "name": "Veľký Lopeník-rozhľadňa",
    "region": "Biele Karpaty",
    "diff": "Moderate",
    "km": "4.4",
    "stars": 5,
    "path": [
      [
        48.90051,
        17.79278
      ],
      [
        48.90148,
        17.79253
      ],
      [
        48.90205,
        17.79371
      ],
      [
        48.90298,
        17.79356
      ],
      [
        48.90477,
        17.79356
      ],
      [
        48.90725,
        17.79328
      ],
      [
        48.90879,
        17.79204
      ],
      [
        48.90985,
        17.79223
      ],
      [
        48.9138,
        17.7883
      ],
      [
        48.91394,
        17.78727
      ],
      [
        48.91549,
        17.78472
      ],
      [
        48.916,
        17.78474
      ],
      [
        48.91676,
        17.78257
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640113/trails/biele-karpaty-velky-lopenik/1784640113048-90ab9e.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640059/trails/biele-karpaty-velky-lopenik/1784640058788-3cd7c5.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640061/trails/biele-karpaty-velky-lopenik/1784640061490-bd5deb.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640062/trails/biele-karpaty-velky-lopenik/1784640062661-1668dc.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640064/trails/biele-karpaty-velky-lopenik/1784640064514-b35d18.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640066/trails/biele-karpaty-velky-lopenik/1784640065872-80a178.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640111/trails/biele-karpaty-velky-lopenik/1784640110631-fd34c2.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640114/trails/biele-karpaty-velky-lopenik/1784640114238-de53fa.jpg"
    ],
    "seasons": [],
    "desc": "Celkom pekný výlet, neustále stúpanie - človek sa zapotí. V cieli čaká obrovská rozhľadňa. ",
    "dogNote": "",
    "acts": [
      "hike",
      "picnic"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Forest",
      "View",
      "Sunset",
      "Meadow"
    ],
    "ascentM": 318,
    "marks": [
      [
        "blue"
      ]
    ]
  },
  {
    "id": "biele-karpaty-haluzicka-tiesnava",
    "name": "Haluzická tiesňava",
    "region": "Biele Karpaty",
    "diff": "Easy",
    "km": "1.3",
    "stars": 5,
    "path": [
      [
        48.82157,
        17.86731
      ],
      [
        48.82205,
        17.86774
      ],
      [
        48.82252,
        17.86825
      ],
      [
        48.82272,
        17.86897
      ],
      [
        48.82186,
        17.8697
      ],
      [
        48.82178,
        17.87109
      ],
      [
        48.82128,
        17.87111
      ],
      [
        48.8211,
        17.87191
      ],
      [
        48.82074,
        17.8722
      ],
      [
        48.82046,
        17.8725
      ],
      [
        48.82035,
        17.87263
      ],
      [
        48.82003,
        17.87297
      ],
      [
        48.81958,
        17.87122
      ],
      [
        48.8199,
        17.86942
      ],
      [
        48.82097,
        17.86941
      ],
      [
        48.82129,
        17.8694
      ],
      [
        48.82207,
        17.8684
      ],
      [
        48.82198,
        17.86763
      ],
      [
        48.82145,
        17.86728
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641357/trails/biele-karpaty-haluzicka-tiesnava/1784641356730-47c20c.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646770/trails/biele-karpaty-haluzicka-tiesnava/1784646769494-e83440.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646771/trails/biele-karpaty-haluzicka-tiesnava/1784646771170-1edf0b.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646771/trails/biele-karpaty-haluzicka-tiesnava/1784646771193-39a9e3.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646771/trails/biele-karpaty-haluzicka-tiesnava/1784646771180-73e454.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646771/trails/biele-karpaty-haluzicka-tiesnava/1784646771459-19218f.webp"
    ],
    "seasons": [],
    "desc": "Vhodné ako krátka zástavka. Aj napriek krátkej trase je to fakt nádherné miesto.",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Rušné",
    "tags": [
      "Forest",
      "Meadow",
      "River"
    ],
    "ascentM": 46,
    "marks": [
      [
        "green"
      ]
    ]
  },
  {
    "id": "biele-karpaty-dracia-studna-biely-vrch",
    "name": "Dračia studňa + Biely vrch",
    "region": "Biele Karpaty",
    "diff": "Hard",
    "km": "16.1",
    "stars": 5,
    "path": [
      [
        49.02059,
        18.12227
      ],
      [
        49.02127,
        18.12231
      ],
      [
        49.02403,
        18.11892
      ],
      [
        49.02566,
        18.11641
      ],
      [
        49.02548,
        18.11592
      ],
      [
        49.02891,
        18.1151
      ],
      [
        49.03001,
        18.11337
      ],
      [
        49.03205,
        18.1106
      ],
      [
        49.03458,
        18.10937
      ],
      [
        49.03602,
        18.11023
      ],
      [
        49.03745,
        18.11461
      ],
      [
        49.03945,
        18.11736
      ],
      [
        49.04032,
        18.12075
      ],
      [
        49.04283,
        18.12285
      ],
      [
        49.04067,
        18.12328
      ],
      [
        49.04074,
        18.12802
      ],
      [
        49.04513,
        18.12935
      ],
      [
        49.04829,
        18.1271
      ],
      [
        49.04904,
        18.12444
      ],
      [
        49.05292,
        18.12191
      ],
      [
        49.05276,
        18.12006
      ],
      [
        49.05554,
        18.11954
      ],
      [
        49.05917,
        18.12306
      ],
      [
        49.06204,
        18.12242
      ],
      [
        49.06693,
        18.12624
      ],
      [
        49.0716,
        18.13221
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640409/trails/biele-karpaty-dracia-studna/1784640408130-d058c7.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640412/trails/biele-karpaty-dracia-studna/1784640412278-efe49f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640410/trails/biele-karpaty-dracia-studna/1784640410562-aa4810.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640413/trails/biele-karpaty-dracia-studna/1784640413644-701fab.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640415/trails/biele-karpaty-dracia-studna/1784640415282-b88530.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640417/trails/biele-karpaty-dracia-studna/1784640416843-aecee9.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640418/trails/biele-karpaty-dracia-studna/1784640418464-11a580.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640420/trails/biele-karpaty-dracia-studna/1784640419831-81960c.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640421/trails/biele-karpaty-dracia-studna/1784640421462-90f481.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640423/trails/biele-karpaty-dracia-studna/1784640423564-09b120.jpg"
    ],
    "seasons": [],
    "desc": "Nekonečná asfaltová cesta pomedzi krásny prasličkový prales bez ľudí... ",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "asphalt",
      "forest"
    ],
    "crowd": "Ľudoprázdne",
    "tags": [
      "Forest",
      "Meadow",
      "River",
      "View"
    ],
    "ascentM": 531,
    "marks": [
      [
        "green"
      ]
    ]
  },
  {
    "id": "biele-karpaty-zlatnicka-dolina",
    "name": "Zlatnícka dolina",
    "region": "Biele Karpaty",
    "diff": "Moderate",
    "km": "8.0",
    "stars": 5,
    "path": [
      [
        48.82518,
        17.29995
      ],
      [
        48.82235,
        17.30222
      ],
      [
        48.81969,
        17.30364
      ],
      [
        48.81738,
        17.30574
      ],
      [
        48.81605,
        17.30797
      ],
      [
        48.81472,
        17.30978
      ],
      [
        48.81441,
        17.31359
      ],
      [
        48.81416,
        17.31922
      ],
      [
        48.81311,
        17.32111
      ],
      [
        48.81348,
        17.32432
      ],
      [
        48.81396,
        17.32673
      ],
      [
        48.81489,
        17.32819
      ],
      [
        48.81523,
        17.33252
      ],
      [
        48.81577,
        17.33582
      ],
      [
        48.81545,
        17.3393
      ],
      [
        48.815,
        17.34218
      ],
      [
        48.81418,
        17.34376
      ],
      [
        48.81627,
        17.34248
      ],
      [
        48.81774,
        17.34205
      ],
      [
        48.81794,
        17.33844
      ],
      [
        48.81893,
        17.33437
      ],
      [
        48.81822,
        17.32836
      ],
      [
        48.81845,
        17.32621
      ],
      [
        48.81715,
        17.32368
      ],
      [
        48.81803,
        17.32068
      ],
      [
        48.81803,
        17.31583
      ],
      [
        48.81969,
        17.31226
      ],
      [
        48.82159,
        17.30669
      ],
      [
        48.82328,
        17.30394
      ],
      [
        48.82266,
        17.30342
      ],
      [
        48.82501,
        17.30003
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640565/trails/biele-karpaty-zlatnicka-dolina/1784640564632-91da99.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640561/trails/biele-karpaty-zlatnicka-dolina/1784640560631-2bd760.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640563/trails/biele-karpaty-zlatnicka-dolina/1784640563127-d8fd86.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640566/trails/biele-karpaty-zlatnicka-dolina/1784640566313-b57828.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640567/trails/biele-karpaty-zlatnicka-dolina/1784640567612-fa6d77.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640569/trails/biele-karpaty-zlatnicka-dolina/1784640569107-dac39c.jpg"
    ],
    "seasons": [],
    "desc": "Veľmi krásna prechádzka, super asfalt, vedľa potôčik. Z Kamennej budy odporúčam ísť naspäť po žltej... magická prechádzka!",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "asphalt",
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Forest",
      "River"
    ],
    "ascentM": 219,
    "marks": [
      [
        "yellow"
      ]
    ]
  },
  {
    "id": "povazsky-inovec-hradok-bezovec",
    "name": "Hrádok/Bezovec",
    "region": "Považský Inovec",
    "diff": "Moderate",
    "km": "12.5",
    "stars": 5,
    "path": [
      [
        48.69413,
        17.93705
      ],
      [
        48.69415,
        17.93943
      ],
      [
        48.69267,
        17.94535
      ],
      [
        48.69163,
        17.94926
      ],
      [
        48.69021,
        17.95162
      ],
      [
        48.6878,
        17.95664
      ],
      [
        48.68766,
        17.96029
      ],
      [
        48.68981,
        17.96526
      ],
      [
        48.69004,
        17.97496
      ],
      [
        48.68959,
        17.98123
      ],
      [
        48.68857,
        17.9832
      ],
      [
        48.68536,
        17.98488
      ],
      [
        48.68545,
        17.98427
      ],
      [
        48.68454,
        17.98307
      ],
      [
        48.68311,
        17.98305
      ],
      [
        48.68247,
        17.98486
      ],
      [
        48.68049,
        17.98848
      ],
      [
        48.68024,
        17.99119
      ],
      [
        48.6808,
        17.99222
      ],
      [
        48.68007,
        17.9932
      ],
      [
        48.6759,
        17.98509
      ],
      [
        48.67613,
        17.9823
      ],
      [
        48.67516,
        17.98093
      ],
      [
        48.67363,
        17.98033
      ],
      [
        48.67389,
        17.97797
      ],
      [
        48.67454,
        17.97505
      ],
      [
        48.67573,
        17.97252
      ],
      [
        48.67533,
        17.97136
      ],
      [
        48.67148,
        17.96908
      ],
      [
        48.66975,
        17.96814
      ],
      [
        48.6689,
        17.96741
      ],
      [
        48.66845,
        17.96677
      ],
      [
        48.67137,
        17.96535
      ],
      [
        48.67318,
        17.96509
      ],
      [
        48.6738,
        17.96715
      ],
      [
        48.67582,
        17.96312
      ],
      [
        48.67661,
        17.96342
      ],
      [
        48.67672,
        17.96063
      ],
      [
        48.67754,
        17.95874
      ],
      [
        48.68035,
        17.95677
      ],
      [
        48.68378,
        17.95642
      ],
      [
        48.68497,
        17.95587
      ],
      [
        48.68729,
        17.95484
      ],
      [
        48.68995,
        17.9517
      ],
      [
        48.69174,
        17.94848
      ],
      [
        48.69318,
        17.94415
      ],
      [
        48.69403,
        17.9387
      ],
      [
        48.69412,
        17.9366
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641529/trails/povazsky-inovec-bezovec/1784641529107-b85356.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641441/trails/povazsky-inovec-bezovec/1784641439779-88b019.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641443/trails/povazsky-inovec-bezovec/1784641443292-c23925.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641445/trails/povazsky-inovec-bezovec/1784641444941-1b60ed.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641524/trails/povazsky-inovec-bezovec/1784641523155-ce53a7.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641525/trails/povazsky-inovec-bezovec/1784641525437-ebbd0e.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641527/trails/povazsky-inovec-bezovec/1784641527333-387be3.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641530/trails/povazsky-inovec-bezovec/1784641530581-ead106.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641532/trails/povazsky-inovec-bezovec/1784641532031-d22889.jpg"
    ],
    "seasons": [],
    "desc": "Príjemná prechádzka po krásnych lesoch a lúkach – pekné výhľady.",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Forest",
      "River",
      "Meadow"
    ],
    "ascentM": 480,
    "marks": [
      [
        "blue"
      ],
      [
        "red"
      ],
      [
        "blue"
      ]
    ]
  },
  {
    "id": "povazsky-inovec-sokolie-skaly-marhat",
    "name": "Sokolie skaly + Marhát",
    "region": "Považský Inovec",
    "diff": "Moderate",
    "km": "10.0",
    "stars": 4,
    "path": [
      [
        48.60266,
        17.9334
      ],
      [
        48.60203,
        17.93484
      ],
      [
        48.6003,
        17.93591
      ],
      [
        48.5983,
        17.93647
      ],
      [
        48.59661,
        17.93771
      ],
      [
        48.59627,
        17.93769
      ],
      [
        48.59499,
        17.93943
      ],
      [
        48.59404,
        17.93986
      ],
      [
        48.59328,
        17.93979
      ],
      [
        48.59048,
        17.94102
      ],
      [
        48.58837,
        17.9414
      ],
      [
        48.58747,
        17.94338
      ],
      [
        48.5825,
        17.9469
      ],
      [
        48.58426,
        17.94677
      ],
      [
        48.58752,
        17.94338
      ],
      [
        48.5888,
        17.94411
      ],
      [
        48.58948,
        17.94801
      ],
      [
        48.59317,
        17.95016
      ],
      [
        48.59485,
        17.95136
      ],
      [
        48.59414,
        17.95788
      ],
      [
        48.59351,
        17.96642
      ],
      [
        48.5947,
        17.9705
      ],
      [
        48.5939,
        17.96814
      ],
      [
        48.59333,
        17.96496
      ],
      [
        48.59401,
        17.95698
      ],
      [
        48.59435,
        17.95123
      ],
      [
        48.59202,
        17.95003
      ],
      [
        48.58913,
        17.94668
      ],
      [
        48.58839,
        17.94419
      ],
      [
        48.58771,
        17.94411
      ],
      [
        48.59128,
        17.94085
      ],
      [
        48.59577,
        17.93844
      ],
      [
        48.59838,
        17.93673
      ],
      [
        48.60252,
        17.93303
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641569/trails/povazsky-inovec-hubina/1784641569008-583f30.jpg"
    ],
    "seasons": [],
    "desc": "Krásna prechádzka, pekné výhľady.",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Ľudoprázdne",
    "tags": [
      "Forest",
      "View"
    ],
    "ascentM": 554,
    "marks": [
      [
        "green"
      ],
      [
        "red",
        "green"
      ],
      [
        "red"
      ],
      [
        "red",
        "green"
      ],
      [
        "red"
      ],
      [
        "red",
        "green"
      ],
      [
        "green"
      ]
    ]
  },
  {
    "id": "povazsky-inovec-tesare",
    "name": "Tesáre",
    "region": "Považský Inovec",
    "diff": "Easy",
    "km": "15.0",
    "stars": 4,
    "path": [
      [
        48.60748,
        18.0403
      ],
      [
        48.60963,
        18.03942
      ],
      [
        48.6108,
        18.03938
      ],
      [
        48.61284,
        18.03693
      ],
      [
        48.61346,
        18.03487
      ],
      [
        48.61556,
        18.03311
      ],
      [
        48.61624,
        18.03389
      ],
      [
        48.61746,
        18.03238
      ],
      [
        48.62036,
        18.03032
      ],
      [
        48.62163,
        18.02766
      ],
      [
        48.6225,
        18.02324
      ],
      [
        48.62318,
        18.01646
      ],
      [
        48.62471,
        18.01586
      ],
      [
        48.62653,
        18.01904
      ],
      [
        48.62982,
        18.015
      ],
      [
        48.63271,
        18.0162
      ],
      [
        48.6335,
        18.01904
      ],
      [
        48.63566,
        18.0199
      ],
      [
        48.63702,
        18.0223
      ],
      [
        48.63543,
        18.0217
      ],
      [
        48.63384,
        18.02316
      ],
      [
        48.63401,
        18.02547
      ],
      [
        48.63158,
        18.02874
      ],
      [
        48.63101,
        18.03406
      ],
      [
        48.63163,
        18.03492
      ],
      [
        48.63333,
        18.03397
      ],
      [
        48.63504,
        18.03535
      ],
      [
        48.63577,
        18.03432
      ],
      [
        48.63447,
        18.03148
      ],
      [
        48.63577,
        18.0308
      ],
      [
        48.63657,
        18.03337
      ],
      [
        48.63747,
        18.03337
      ],
      [
        48.63708,
        18.03114
      ],
      [
        48.63963,
        18.03183
      ],
      [
        48.64179,
        18.03191
      ],
      [
        48.64502,
        18.02899
      ],
      [
        48.64649,
        18.02788
      ],
      [
        48.64666,
        18.02556
      ],
      [
        48.64496,
        18.02462
      ],
      [
        48.64451,
        18.01844
      ],
      [
        48.64258,
        18.01844
      ],
      [
        48.64031,
        18.02281
      ],
      [
        48.64098,
        18.02483
      ],
      [
        48.63964,
        18.02535
      ],
      [
        48.63669,
        18.02406
      ],
      [
        48.63468,
        18.02513
      ],
      [
        48.63409,
        18.02661
      ],
      [
        48.63422,
        18.02378
      ],
      [
        48.6346,
        18.02301
      ],
      [
        48.63201,
        18.02284
      ],
      [
        48.63033,
        18.02187
      ],
      [
        48.62641,
        18.02238
      ],
      [
        48.62392,
        18.02487
      ],
      [
        48.62187,
        18.02565
      ],
      [
        48.61688,
        18.03251
      ],
      [
        48.60985,
        18.03981
      ],
      [
        48.60729,
        18.04049
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641594/trails/povazsky-inovec-tesare/1784641593521-4e9aa8.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641596/trails/povazsky-inovec-tesare/1784641596346-1ef465.jpg"
    ],
    "seasons": [],
    "desc": "Celkom výživná prechádzka neďaleko Bojnej :)",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Forest",
      "View"
    ],
    "ascentM": 537,
    "marks": [
      [
        "green"
      ],
      [
        "blue",
        "green"
      ],
      [
        "blue"
      ],
      [
        "green"
      ]
    ]
  },
  {
    "id": "strazovske-vrchy-strazov",
    "name": "Strážov",
    "region": "Strážovské vrchy",
    "diff": "Moderate",
    "km": "6.4",
    "stars": 5,
    "path": [
      [
        48.95643,
        18.44021
      ],
      [
        48.95687,
        18.44218
      ],
      [
        48.95845,
        18.44478
      ],
      [
        48.95963,
        18.44768
      ],
      [
        48.96014,
        18.45147
      ],
      [
        48.96045,
        18.45248
      ],
      [
        48.96091,
        18.45259
      ],
      [
        48.96042,
        18.45527
      ],
      [
        48.9606,
        18.45682
      ],
      [
        48.95993,
        18.4574
      ],
      [
        48.96012,
        18.45843
      ],
      [
        48.9591,
        18.46197
      ],
      [
        48.95921,
        18.46416
      ],
      [
        48.95907,
        18.4666
      ],
      [
        48.95879,
        18.46553
      ],
      [
        48.95865,
        18.46656
      ],
      [
        48.95828,
        18.46591
      ],
      [
        48.95828,
        18.4681
      ],
      [
        48.95659,
        18.46875
      ],
      [
        48.95485,
        18.46321
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641649/trails/strazovske-vrchy-strazov/1784641647904-3caf9f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641650/trails/strazovske-vrchy-strazov/1784641650433-d81958.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641652/trails/strazovske-vrchy-strazov/1784641652253-414662.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641654/trails/strazovske-vrchy-strazov/1784641654025-0f41ce.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641655/trails/strazovske-vrchy-strazov/1784641655302-2116d3.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641656/trails/strazovske-vrchy-strazov/1784641656465-a08752.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641658/trails/strazovske-vrchy-strazov/1784641658245-a1eef0.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641659/trails/strazovske-vrchy-strazov/1784641659600-344b1e.jpg"
    ],
    "seasons": [],
    "desc": "Jeden z najkrajších vrchov na Slovensku.",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Rušné",
    "tags": [
      "Meadow",
      "Forest",
      "View",
      "River"
    ],
    "ascentM": 529,
    "marks": [
      [
        "red"
      ],
      [
        "red",
        "yellow"
      ],
      [
        "red"
      ]
    ]
  },
  {
    "id": "strazovske-vrchy-vapec",
    "name": "Vápeč",
    "region": "Strážovské vrchy",
    "diff": "Moderate",
    "km": "5.1",
    "stars": 5,
    "path": [
      [
        48.93301,
        18.30831
      ],
      [
        48.93407,
        18.31146
      ],
      [
        48.93335,
        18.31683
      ],
      [
        48.93378,
        18.32116
      ],
      [
        48.93391,
        18.322
      ],
      [
        48.9344,
        18.32144
      ],
      [
        48.93386,
        18.32451
      ],
      [
        48.93491,
        18.32485
      ],
      [
        48.93517,
        18.32459
      ],
      [
        48.93593,
        18.32288
      ],
      [
        48.93721,
        18.32211
      ],
      [
        48.9382,
        18.32193
      ],
      [
        48.93807,
        18.32268
      ],
      [
        48.9392,
        18.32356
      ],
      [
        48.93866,
        18.32378
      ],
      [
        48.93806,
        18.32556
      ],
      [
        48.93845,
        18.32814
      ],
      [
        48.93925,
        18.32822
      ],
      [
        48.93927,
        18.32642
      ],
      [
        48.9389,
        18.32597
      ],
      [
        48.93939,
        18.32522
      ],
      [
        48.93915,
        18.3241
      ],
      [
        48.93849,
        18.32277
      ],
      [
        48.94059,
        18.32105
      ],
      [
        48.94063,
        18.31962
      ],
      [
        48.94116,
        18.31801
      ],
      [
        48.94197,
        18.31719
      ],
      [
        48.93833,
        18.31743
      ],
      [
        48.93647,
        18.31854
      ],
      [
        48.93582,
        18.31378
      ],
      [
        48.93458,
        18.31159
      ],
      [
        48.93299,
        18.30872
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640711/trails/strazovske-vrchy-vapec/1784640711740-f92c57.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640693/trails/strazovske-vrchy-vapec/1784640692577-97a31e.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640695/trails/strazovske-vrchy-vapec/1784640694992-916159.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640696/trails/strazovske-vrchy-vapec/1784640696526-5f4534.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640698/trails/strazovske-vrchy-vapec/1784640698065-1f4561.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640700/trails/strazovske-vrchy-vapec/1784640699659-bebb1f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640702/trails/strazovske-vrchy-vapec/1784640702265-c4147f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640707/trails/strazovske-vrchy-vapec/1784640707011-22393b.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640708/trails/strazovske-vrchy-vapec/1784640708675-fbe724.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640710/trails/strazovske-vrchy-vapec/1784640710214-7edb6d.jpg"
    ],
    "seasons": [],
    "desc": "Jedna z najkrajších turistík na SVK s krásnym 360 stupňovým výhľadom! Je relatívne krátka = máte dosť času vychutnať si všetko čo trasa ponúka = výhľady, potôčik, jazierko...",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "",
    "tags": [
      "River",
      "View",
      "Meadow",
      "Forest"
    ],
    "ascentM": 463,
    "marks": [
      [
        "green"
      ],
      [
        "red"
      ],
      [
        "green"
      ],
      [
        "red",
        "green"
      ],
      [
        "red"
      ],
      [
        "red",
        "blue"
      ],
      [
        "red"
      ],
      [
        "red",
        "blue"
      ],
      [
        "yellow"
      ],
      [
        "green"
      ],
      [
        "blue",
        "green"
      ],
      [
        "green"
      ],
      [
        "red"
      ],
      [
        "green"
      ]
    ]
  },
  {
    "id": "strazovske-vrchy-sulovske-skaly",
    "name": "Súľovské skaly",
    "region": "Strážovské vrchy",
    "diff": "Moderate",
    "km": "8.4",
    "stars": 5,
    "path": [
      [
        49.16644,
        18.57855
      ],
      [
        49.16669,
        18.57958
      ],
      [
        49.1684,
        18.57998
      ],
      [
        49.16906,
        18.58121
      ],
      [
        49.1702,
        18.58215
      ],
      [
        49.1708,
        18.58151
      ],
      [
        49.17024,
        18.58001
      ],
      [
        49.171,
        18.58046
      ],
      [
        49.17144,
        18.58127
      ],
      [
        49.17183,
        18.58217
      ],
      [
        49.17348,
        18.58209
      ],
      [
        49.17371,
        18.58146
      ],
      [
        49.17386,
        18.58226
      ],
      [
        49.17473,
        18.5834
      ],
      [
        49.17545,
        18.5834
      ],
      [
        49.17606,
        18.58432
      ],
      [
        49.17626,
        18.58558
      ],
      [
        49.17668,
        18.58644
      ],
      [
        49.17963,
        18.58895
      ],
      [
        49.18215,
        18.59101
      ],
      [
        49.18344,
        18.59247
      ],
      [
        49.18434,
        18.59642
      ],
      [
        49.18625,
        18.59831
      ],
      [
        49.18715,
        18.6008
      ],
      [
        49.18698,
        18.60543
      ],
      [
        49.18636,
        18.60689
      ],
      [
        49.18468,
        18.61007
      ],
      [
        49.18069,
        18.60998
      ],
      [
        49.17856,
        18.61041
      ],
      [
        49.1775,
        18.60638
      ],
      [
        49.17649,
        18.60457
      ],
      [
        49.17839,
        18.60406
      ],
      [
        49.17803,
        18.59912
      ],
      [
        49.17654,
        18.59745
      ],
      [
        49.17609,
        18.5947
      ],
      [
        49.17374,
        18.59234
      ],
      [
        49.1725,
        18.59076
      ],
      [
        49.17354,
        18.58762
      ],
      [
        49.17158,
        18.58591
      ],
      [
        49.1679,
        18.58423
      ],
      [
        49.16655,
        18.58466
      ],
      [
        49.16574,
        18.58299
      ],
      [
        49.16613,
        18.5787
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640916/trails/strazovske-vrchy-sulovske-skaly/1784640916092-00ab41.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640913/trails/strazovske-vrchy-sulovske-skaly/1784640913575-286789.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640845/trails/strazovske-vrchy-sulovske-skaly/1784640843607-417152.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640846/trails/strazovske-vrchy-sulovske-skaly/1784640846564-483a65.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640850/trails/strazovske-vrchy-sulovske-skaly/1784640849686-429259.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640852/trails/strazovske-vrchy-sulovske-skaly/1784640852091-19021f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640854/trails/strazovske-vrchy-sulovske-skaly/1784640854031-206c32.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640855/trails/strazovske-vrchy-sulovske-skaly/1784640855602-a83f12.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640857/trails/strazovske-vrchy-sulovske-skaly/1784640857180-e364da.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640859/trails/strazovske-vrchy-sulovske-skaly/1784640858916-b39da8.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640861/trails/strazovske-vrchy-sulovske-skaly/1784640860819-d40004.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640863/trails/strazovske-vrchy-sulovske-skaly/1784640862786-0218e4.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640865/trails/strazovske-vrchy-sulovske-skaly/1784640864800-7d97dc.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640867/trails/strazovske-vrchy-sulovske-skaly/1784640867142-a923bf.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640868/trails/strazovske-vrchy-sulovske-skaly/1784640868506-c0035c.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640899/trails/strazovske-vrchy-sulovske-skaly/1784640898944-ad74ae.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640901/trails/strazovske-vrchy-sulovske-skaly/1784640901003-31379a.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640902/trails/strazovske-vrchy-sulovske-skaly/1784640902530-6b1e53.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640905/trails/strazovske-vrchy-sulovske-skaly/1784640905251-7852ba.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640906/trails/strazovske-vrchy-sulovske-skaly/1784640906454-8f3e67.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640909/trails/strazovske-vrchy-sulovske-skaly/1784640908041-4fd33c.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640910/trails/strazovske-vrchy-sulovske-skaly/1784640910679-fbbacd.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640912/trails/strazovske-vrchy-sulovske-skaly/1784640912324-dff90e.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640915/trails/strazovske-vrchy-sulovske-skaly/1784640915010-1a5656.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640920/trails/strazovske-vrchy-sulovske-skaly/1784640917958-59791a.jpg"
    ],
    "seasons": [],
    "desc": "Ikonické miesto s miliónom ľudí. Ultimátna rada = ak sem ideš nechoď cez víkend! V strede trasy sa cesta rozvetvuje a naspäť sa dá zísť aj žltou značkou cez Šarkaniu dieru, ale vraj je tam rebrík =  pre psa nebezpečné/neschodné. Ale neviem nikdy som to neskúšal - kľudne pridajte koment! ",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [],
    "crowd": "Rušné",
    "tags": [
      "View",
      "Meadow",
      "Forest"
    ],
    "ascentM": 590,
    "marks": [
      [
        "green"
      ],
      [
        "red"
      ],
      [
        "green",
        "yellow"
      ],
      [
        "green"
      ],
      [
        "blue",
        "green"
      ],
      [
        "blue"
      ],
      [
        "yellow"
      ],
      [
        "red",
        "green",
        "yellow"
      ],
      [
        "red",
        "blue",
        "green",
        "yellow"
      ]
    ]
  },
  {
    "id": "strazovske-vrchy-zbynovsky-budzogan",
    "name": "Zbyňovský budzogáň",
    "region": "Strážovské vrchy",
    "diff": "Moderate",
    "km": "8.9",
    "stars": 5,
    "path": [
      [
        49.12396,
        18.64267
      ],
      [
        49.12465,
        18.64201
      ],
      [
        49.12455,
        18.64054
      ],
      [
        49.12495,
        18.63979
      ],
      [
        49.12403,
        18.63686
      ],
      [
        49.12407,
        18.63307
      ],
      [
        49.12586,
        18.63058
      ],
      [
        49.12691,
        18.63
      ],
      [
        49.12658,
        18.62826
      ],
      [
        49.12527,
        18.62607
      ],
      [
        49.12295,
        18.62346
      ],
      [
        49.12027,
        18.62189
      ],
      [
        49.11896,
        18.61962
      ],
      [
        49.11751,
        18.61547
      ],
      [
        49.12003,
        18.61788
      ],
      [
        49.12082,
        18.61496
      ],
      [
        49.11992,
        18.6099
      ],
      [
        49.12256,
        18.60715
      ],
      [
        49.12335,
        18.60844
      ],
      [
        49.12734,
        18.60955
      ],
      [
        49.12606,
        18.61174
      ],
      [
        49.12575,
        18.61492
      ],
      [
        49.12553,
        18.61762
      ],
      [
        49.12609,
        18.61891
      ],
      [
        49.1276,
        18.61977
      ],
      [
        49.12651,
        18.6214
      ],
      [
        49.12999,
        18.62324
      ],
      [
        49.13095,
        18.62595
      ],
      [
        49.13168,
        18.62818
      ],
      [
        49.13103,
        18.63015
      ],
      [
        49.13022,
        18.62919
      ],
      [
        49.12838,
        18.62818
      ],
      [
        49.13077,
        18.63024
      ],
      [
        49.12725,
        18.63009
      ],
      [
        49.12454,
        18.63202
      ],
      [
        49.12364,
        18.63365
      ],
      [
        49.12409,
        18.63749
      ],
      [
        49.12493,
        18.63944
      ],
      [
        49.12439,
        18.64056
      ],
      [
        49.12452,
        18.64197
      ],
      [
        49.12393,
        18.64264
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641964/trails/strazovske-vrchy-zbynovsky-budzogan/1784641963142-d06ada.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641846/trails/strazovske-vrchy-zbynovsky-budzogan/1784641845092-30a438.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641965/trails/strazovske-vrchy-zbynovsky-budzogan/1784641965296-e9200a.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641966/trails/strazovske-vrchy-zbynovsky-budzogan/1784641966698-a7e001.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641968/trails/strazovske-vrchy-zbynovsky-budzogan/1784641967996-361753.jpg"
    ],
    "seasons": [],
    "desc": "Stratený budzogáň sa rozhodne oplatí vidieť :))",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Meadow",
      "Forest",
      "View"
    ],
    "ascentM": 508,
    "marks": [
      [
        "yellow"
      ],
      [
        "blue"
      ],
      [
        "green"
      ],
      [
        "yellow"
      ],
      [
        "blue"
      ],
      [
        "blue",
        "yellow"
      ],
      [
        "yellow"
      ]
    ]
  },
  {
    "id": "mala-fatra-velky-krivan",
    "name": "Veľký Kriváň",
    "region": "Malá Fatra",
    "diff": "Hard",
    "km": "8.1",
    "stars": 5,
    "path": [
      [
        49.20938,
        19.04122
      ],
      [
        49.20765,
        19.04304
      ],
      [
        49.20639,
        19.04295
      ],
      [
        49.20688,
        19.04109
      ],
      [
        49.20525,
        19.03937
      ],
      [
        49.20465,
        19.03931
      ],
      [
        49.20471,
        19.04014
      ],
      [
        49.20384,
        19.03875
      ],
      [
        49.20408,
        19.04092
      ],
      [
        49.20375,
        19.04053
      ],
      [
        49.2037,
        19.04107
      ],
      [
        49.20354,
        19.04008
      ],
      [
        49.20338,
        19.04068
      ],
      [
        49.20276,
        19.03956
      ],
      [
        49.20216,
        19.04124
      ],
      [
        49.2004,
        19.03933
      ],
      [
        49.19949,
        19.03963
      ],
      [
        49.19838,
        19.0383
      ],
      [
        49.19742,
        19.03924
      ],
      [
        49.19319,
        19.03845
      ],
      [
        49.19153,
        19.03841
      ],
      [
        49.18982,
        19.03077
      ],
      [
        49.19005,
        19.02789
      ],
      [
        49.18764,
        19.03072
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640960/trails/mala-fatra-velky-krivan/1784640958808-0c6e8d.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640961/trails/mala-fatra-velky-krivan/1784640961368-2f5f69.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784640963/trails/mala-fatra-velky-krivan/1784640962764-922845.jpg"
    ],
    "seasons": [],
    "desc": "Je to zaujímavý strmáčik, ale výhľady stoja za to!",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "",
    "tags": [
      "Mountains",
      "View",
      "Forest"
    ],
    "ascentM": 936,
    "marks": [
      [
        "green"
      ],
      [
        "red",
        "green"
      ],
      [
        "red"
      ]
    ]
  },
  {
    "id": "mala-fatra-sokolie",
    "name": "Sokolie",
    "region": "Malá Fatra",
    "diff": "Moderate",
    "km": "6.4",
    "stars": 5,
    "path": [
      [
        49.24911,
        19.01364
      ],
      [
        49.24807,
        19.01476
      ],
      [
        49.24802,
        19.02072
      ],
      [
        49.24479,
        19.02188
      ],
      [
        49.24426,
        19.02274
      ],
      [
        49.24306,
        19.02377
      ],
      [
        49.24379,
        19.02381
      ],
      [
        49.24398,
        19.02587
      ],
      [
        49.24224,
        19.02527
      ],
      [
        49.24166,
        19.0272
      ],
      [
        49.24129,
        19.02853
      ],
      [
        49.23944,
        19.02823
      ],
      [
        49.23835,
        19.02755
      ],
      [
        49.23737,
        19.023
      ],
      [
        49.23653,
        19.01738
      ],
      [
        49.23544,
        19.01442
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646781/trails/mala-fatra-sokolie/1784646781346-44a6e5.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646781/trails/mala-fatra-sokolie/1784646781344-ccb788.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646781/trails/mala-fatra-sokolie/1784646781342-66b815.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646782/trails/mala-fatra-sokolie/1784646781347-ebc6ad.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646782/trails/mala-fatra-sokolie/1784646782289-738e37.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646782/trails/mala-fatra-sokolie/1784646782321-bd7812.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646783/trails/mala-fatra-sokolie/1784646782350-5c3871.webp"
    ],
    "seasons": [],
    "desc": "Krásny trip cez skalnaté územie.",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "View",
      "Forest"
    ],
    "ascentM": 633,
    "marks": [
      [
        "blue"
      ],
      [
        "yellow"
      ]
    ]
  },
  {
    "id": "mala-fatra-klak",
    "name": "Kľak",
    "region": "Malá Fatra",
    "diff": "Moderate",
    "km": "8.5",
    "stars": 5,
    "path": [
      [
        48.96369,
        18.61208
      ],
      [
        48.9624,
        18.61826
      ],
      [
        48.96268,
        18.62153
      ],
      [
        48.96488,
        18.6238
      ],
      [
        48.96465,
        18.62423
      ],
      [
        48.96671,
        18.62487
      ],
      [
        48.96685,
        18.62723
      ],
      [
        48.96623,
        18.62702
      ],
      [
        48.96601,
        18.62848
      ],
      [
        48.96505,
        18.62753
      ],
      [
        48.96479,
        18.62844
      ],
      [
        48.96471,
        18.6335
      ],
      [
        48.96727,
        18.63715
      ],
      [
        48.97116,
        18.63955
      ],
      [
        48.97347,
        18.64144
      ],
      [
        48.97587,
        18.64273
      ],
      [
        48.97758,
        18.64264
      ],
      [
        48.97882,
        18.64328
      ],
      [
        48.9811,
        18.64118
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646778/trails/mala-fatra-klak/1784646777781-a48a32.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646775/trails/mala-fatra-klak/1784646775007-f378ae.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646775/trails/mala-fatra-klak/1784646775009-4f4989.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646775/trails/mala-fatra-klak/1784646775004-91b4aa.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646776/trails/mala-fatra-klak/1784646776348-b0ccc4.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646777/trails/mala-fatra-klak/1784646776188-2163ff.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646776/trails/mala-fatra-klak/1784646776061-a78b39.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646777/trails/mala-fatra-klak/1784646777079-8d039f.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646778/trails/mala-fatra-klak/1784646777900-e7f265.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646778/trails/mala-fatra-klak/1784646775011-14f23a.webp"
    ],
    "seasons": [],
    "desc": "Jeden z najikonickejších kopcov, naozaj fotogenický s krásnymi výhľadmi.",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Rušné",
    "tags": [
      "Forest",
      "View"
    ],
    "ascentM": 526,
    "marks": [
      [
        "red",
        "yellow"
      ],
      [
        "yellow"
      ],
      [
        "green",
        "yellow"
      ]
    ]
  },
  {
    "id": "mala-fatra-sutovsky-vodopad-buchta",
    "name": "Šútovský vodopád+buchta",
    "region": "Malá Fatra",
    "diff": "Moderate",
    "km": "15.6",
    "stars": 5,
    "path": [
      [
        49.15828,
        19.08722
      ],
      [
        49.16053,
        19.08606
      ],
      [
        49.16116,
        19.08645
      ],
      [
        49.16312,
        19.08415
      ],
      [
        49.16457,
        19.0819
      ],
      [
        49.16642,
        19.08038
      ],
      [
        49.16688,
        19.08066
      ],
      [
        49.16829,
        19.07917
      ],
      [
        49.17026,
        19.07797
      ],
      [
        49.17213,
        19.07815
      ],
      [
        49.17265,
        19.0792
      ],
      [
        49.17369,
        19.0799
      ],
      [
        49.17538,
        19.08115
      ],
      [
        49.17694,
        19.08222
      ],
      [
        49.17794,
        19.08254
      ],
      [
        49.17934,
        19.08394
      ],
      [
        49.18043,
        19.0851
      ],
      [
        49.1816,
        19.0857
      ],
      [
        49.18362,
        19.08531
      ],
      [
        49.18431,
        19.08488
      ],
      [
        49.18634,
        19.08364
      ],
      [
        49.18705,
        19.0839
      ],
      [
        49.18663,
        19.08308
      ],
      [
        49.18741,
        19.08209
      ],
      [
        49.18741,
        19.08209
      ],
      [
        49.18789,
        19.08106
      ],
      [
        49.18831,
        19.08145
      ],
      [
        49.18938,
        19.07969
      ],
      [
        49.19137,
        19.07536
      ],
      [
        49.18977,
        19.07154
      ],
      [
        49.1882,
        19.06712
      ],
      [
        49.18856,
        19.066
      ],
      [
        49.18769,
        19.06209
      ],
      [
        49.18828,
        19.06076
      ],
      [
        49.18522,
        19.05381
      ],
      [
        49.18992,
        19.05759
      ],
      [
        49.18773,
        19.05192
      ],
      [
        49.18932,
        19.04416
      ],
      [
        49.1878,
        19.04587
      ],
      [
        49.18643,
        19.04828
      ],
      [
        49.18116,
        19.04969
      ],
      [
        49.18506,
        19.0539
      ],
      [
        49.18841,
        19.06025
      ],
      [
        49.18757,
        19.06248
      ],
      [
        49.19104,
        19.07493
      ],
      [
        49.18695,
        19.08351
      ],
      [
        49.18067,
        19.0854
      ],
      [
        49.17702,
        19.08196
      ],
      [
        49.17057,
        19.07802
      ],
      [
        49.16282,
        19.0842
      ],
      [
        49.15794,
        19.08737
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641171/trails/mala-fatra-sutovsky-vodopad/1784641169921-faf60f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641172/trails/mala-fatra-sutovsky-vodopad/1784641172190-68ce7f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641174/trails/mala-fatra-sutovsky-vodopad/1784641173951-f8eda5.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641176/trails/mala-fatra-sutovsky-vodopad/1784641175793-128fa8.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641179/trails/mala-fatra-sutovsky-vodopad-buchta/1784641178142-0ca6ad.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641181/trails/mala-fatra-sutovsky-vodopad-buchta/1784641180810-d79edd.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641183/trails/mala-fatra-sutovsky-vodopad-buchta/1784641182643-65fe21.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641184/trails/mala-fatra-sutovsky-vodopad-buchta/1784641184312-79ff43.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641185/trails/mala-fatra-sutovsky-vodopad-buchta/1784641185614-6da85d.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641187/trails/mala-fatra-sutovsky-vodopad-buchta/1784641187085-29953f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641188/trails/mala-fatra-sutovsky-vodopad-buchta/1784641188639-c7e81f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641190/trails/mala-fatra-sutovsky-vodopad-buchta/1784641190035-f1c1ef.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641191/trails/mala-fatra-sutovsky-vodopad-buchta/1784641191477-7da3e0.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641192/trails/mala-fatra-sutovsky-vodopad-buchta/1784641192489-c425f6.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641195/trails/mala-fatra-sutovsky-vodopad-buchta/1784641194866-e43764.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641196/trails/mala-fatra-sutovsky-vodopad-buchta/1784641196617-b44192.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784641200/trails/mala-fatra-sutovsky-vodopad-buchta/1784641200626-0db1ba.jpg"
    ],
    "seasons": [],
    "desc": "Jeden z najkrajších vodopádov na Slovensku - ideálna turistika v letných horúčavách. Trasa vedie celý čas v tieni pri zurčajúcom potoku, prvá polovica je vhodná aj pre kočíky (asfalt). Pre maškrtných odporúčam vybehnúť na chatu pod Chlebom - cesta vedie cez krásne lúky, Mojžišove pramene a buchta stojí za to! (2024)",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest",
      "asphalt"
    ],
    "crowd": "Rušné",
    "tags": [
      "River",
      "Forest",
      "View",
      "Mountains"
    ],
    "ascentM": 1209,
    "marks": [
      [
        "blue"
      ],
      [
        "yellow"
      ],
      [
        "red"
      ],
      [
        "red",
        "green"
      ],
      [
        "green"
      ],
      [
        "blue",
        "yellow"
      ],
      [
        "blue"
      ]
    ]
  },
  {
    "id": "mala-fatra-mincol",
    "name": "Minčol",
    "region": "Malá Fatra",
    "diff": "Moderate",
    "km": "10.2",
    "stars": 5,
    "path": [
      [
        49.10227,
        18.87983
      ],
      [
        49.10252,
        18.87498
      ],
      [
        49.10274,
        18.87232
      ],
      [
        49.10715,
        18.86966
      ],
      [
        49.10634,
        18.86674
      ],
      [
        49.10713,
        18.86271
      ],
      [
        49.10676,
        18.86014
      ],
      [
        49.10968,
        18.8549
      ],
      [
        49.11269,
        18.84542
      ],
      [
        49.11494,
        18.83559
      ],
      [
        49.11564,
        18.83293
      ],
      [
        49.11783,
        18.82984
      ],
      [
        49.11912,
        18.82829
      ],
      [
        49.12397,
        18.82739
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642085/trails/mala-fatra-mincol/1784642084324-dfdaac.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642086/trails/mala-fatra-mincol/1784642086551-5befc2.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642087/trails/mala-fatra-mincol/1784642087605-9c4fdf.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642089/trails/mala-fatra-mincol/1784642088887-efbe78.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642150/trails/mala-fatra-mincol/1784642149237-040bc9.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642152/trails/mala-fatra-mincol/1784642151745-84d957.jpg"
    ],
    "seasons": [],
    "desc": "Výstup sa konal cez polmetra snehu v krátkom tričku, takže sme si moc prírodu neužili a nevideli pod nánosom bielej pokrývky ale výhľady aj atmosféra boli super, určite by sme sa chceli vrátiť aj mimo zimy!",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Mountains",
      "View",
      "Forest"
    ],
    "ascentM": 774,
    "marks": [
      [
        "yellow"
      ],
      [
        "red",
        "yellow"
      ]
    ]
  },
  {
    "id": "velka-fatra-ostredok",
    "name": "Ostredok",
    "region": "Veľká Fatra",
    "diff": "Hard",
    "km": "20.3",
    "stars": 5,
    "path": [
      [
        48.906,
        19.16033
      ],
      [
        48.90735,
        19.1523
      ],
      [
        48.9062,
        19.14595
      ],
      [
        48.90594,
        19.13857
      ],
      [
        48.90493,
        19.13376
      ],
      [
        48.90465,
        19.12844
      ],
      [
        48.90752,
        19.122
      ],
      [
        48.9097,
        19.11407
      ],
      [
        48.91494,
        19.10771
      ],
      [
        48.91692,
        19.10986
      ],
      [
        48.91906,
        19.10797
      ],
      [
        48.919,
        19.10377
      ],
      [
        48.92222,
        19.10488
      ],
      [
        48.92453,
        19.10153
      ],
      [
        48.92154,
        19.09381
      ],
      [
        48.91669,
        19.09192
      ],
      [
        48.90891,
        19.08591
      ],
      [
        48.90755,
        19.08171
      ],
      [
        48.90219,
        19.07922
      ],
      [
        48.89965,
        19.08102
      ],
      [
        48.89288,
        19.0793
      ],
      [
        48.88916,
        19.08196
      ],
      [
        48.87714,
        19.07879
      ],
      [
        48.87426,
        19.08102
      ],
      [
        48.87663,
        19.09012
      ],
      [
        48.87809,
        19.08651
      ],
      [
        48.88188,
        19.09106
      ],
      [
        48.88233,
        19.10007
      ],
      [
        48.88718,
        19.11106
      ],
      [
        48.88995,
        19.1169
      ],
      [
        48.88854,
        19.12934
      ],
      [
        48.89068,
        19.14848
      ],
      [
        48.89915,
        19.1587
      ],
      [
        48.90558,
        19.16179
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642235/trails/velka-fatra-ostredok/1784642234851-bb5cdc.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642233/trails/velka-fatra-ostredok/1784642233162-87fd85.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642232/trails/velka-fatra-ostredok/1784642231081-057906.jpg"
    ],
    "seasons": [],
    "desc": "Zo všetkých turistík, tu sme boli asi najbližšie k smrti. Išli sme po značenom chodníku, ktorý bol zapadnutý v metre snehu. Zistili sme to, keď sme zišli do doliny... zrazu nebola vidno značka... každý druhý nášľap = prepadnutie do metra, s nohami do potoka. Fakt masaker, nikdy nezabudnem ako sme to všetci prežili. Večerná vírivka potom padla vhod :))) nelozte tam, keď je sneh a zima!!!  Inak kolosálne výhľady 10/10",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Mountains",
      "View",
      "Meadow",
      "River"
    ],
    "ascentM": 1096,
    "marks": [
      [
        "yellow"
      ],
      [
        "red"
      ],
      [
        "red",
        "blue"
      ],
      [
        "red"
      ],
      [
        "green"
      ]
    ]
  },
  {
    "id": "velka-fatra-tlsta-ostra",
    "name": "Tlstá – Ostrá",
    "region": "Veľká Fatra",
    "diff": "Moderate",
    "km": "11.7",
    "stars": 5,
    "path": [
      [
        48.93578,
        18.93837
      ],
      [
        48.93347,
        18.94129
      ],
      [
        48.93437,
        18.94644
      ],
      [
        48.93172,
        18.95047
      ],
      [
        48.92873,
        18.95399
      ],
      [
        48.92648,
        18.95742
      ],
      [
        48.92653,
        18.96094
      ],
      [
        48.92518,
        18.97081
      ],
      [
        48.92215,
        18.97566
      ],
      [
        48.92153,
        18.9739
      ],
      [
        48.92186,
        18.9715
      ],
      [
        48.92136,
        18.96961
      ],
      [
        48.92017,
        18.96914
      ],
      [
        48.92093,
        18.97163
      ],
      [
        48.92,
        18.97137
      ],
      [
        48.91876,
        18.96657
      ],
      [
        48.91761,
        18.97262
      ],
      [
        48.91975,
        18.98034
      ],
      [
        48.92409,
        18.98296
      ],
      [
        48.92745,
        18.9842
      ],
      [
        48.92984,
        18.9833
      ],
      [
        48.93137,
        18.98317
      ],
      [
        48.93216,
        18.98098
      ],
      [
        48.93233,
        18.97626
      ],
      [
        48.93337,
        18.97352
      ],
      [
        48.93385,
        18.97146
      ],
      [
        48.93533,
        18.96858
      ],
      [
        48.93939,
        18.96807
      ],
      [
        48.94035,
        18.96051
      ],
      [
        48.93905,
        18.95708
      ],
      [
        48.94102,
        18.95322
      ],
      [
        48.94145,
        18.94884
      ],
      [
        48.94401,
        18.94704
      ],
      [
        48.94226,
        18.94352
      ],
      [
        48.93905,
        18.9394
      ],
      [
        48.93606,
        18.9382
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642302/trails/velka-fatra-tlsta-ostra/1784642301413-b6172d.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642304/trails/velka-fatra-tlsta-ostra/1784642303803-9dddee.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642305/trails/velka-fatra-tlsta-ostra/1784642305432-e8f2fb.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642307/trails/velka-fatra-tlsta-ostra/1784642306850-da5a0b.jpg"
    ],
    "seasons": [],
    "desc": "Dychberúca turistika, škoda, že na vrchole pršalo aj keď vrchol sme stihli v jaskyni - if you know what I mean :D Odporúčam! Je to fakt bomba.",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Mountains",
      "Meadow",
      "River",
      "Forest",
      "View"
    ],
    "ascentM": 946,
    "marks": [
      [
        "blue"
      ],
      [
        "yellow"
      ],
      [
        "green"
      ],
      [
        "blue"
      ],
      [
        "yellow"
      ]
    ]
  },
  {
    "id": "velka-fatra-gaderska-dolina",
    "name": "Gaderská dolina",
    "region": "Veľká Fatra",
    "diff": "Easy",
    "km": "14.1",
    "stars": 5,
    "path": [
      [
        48.93168,
        18.93343
      ],
      [
        48.9318,
        18.93652
      ],
      [
        48.9329,
        18.93704
      ],
      [
        48.93465,
        18.93607
      ],
      [
        48.93602,
        18.93738
      ],
      [
        48.93806,
        18.93882
      ],
      [
        48.93964,
        18.93949
      ],
      [
        48.94153,
        18.94305
      ],
      [
        48.9466,
        18.94948
      ],
      [
        48.94903,
        18.95536
      ],
      [
        48.94829,
        18.95824
      ],
      [
        48.94894,
        18.96266
      ],
      [
        48.95041,
        18.96618
      ],
      [
        48.95052,
        18.9682
      ],
      [
        48.95154,
        18.9697
      ],
      [
        48.95238,
        18.97369
      ],
      [
        48.95275,
        18.97583
      ],
      [
        48.95385,
        18.97704
      ],
      [
        48.95348,
        18.97892
      ],
      [
        48.95351,
        18.9824
      ],
      [
        48.95213,
        18.98429
      ],
      [
        48.95089,
        18.98631
      ],
      [
        48.95052,
        18.98901
      ],
      [
        48.94948,
        18.99184
      ],
      [
        48.94886,
        18.99352
      ],
      [
        48.94759,
        18.99725
      ],
      [
        48.94753,
        18.99948
      ],
      [
        48.94663,
        19.00317
      ],
      [
        48.9436,
        19.0054
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642595/trails/velka-fatra-gaderska-dolina/1784642595020-92e42f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642504/trails/velka-fatra-gaderska-dolina/1784642503085-c3b996.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642510/trails/velka-fatra-gaderska-dolina/1784642506035-ec6be4.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642514/trails/velka-fatra-gaderska-dolina/1784642513158-6f2177.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642516/trails/velka-fatra-gaderska-dolina/1784642515716-66b313.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642518/trails/velka-fatra-gaderska-dolina/1784642518148-b553e9.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642522/trails/velka-fatra-gaderska-dolina/1784642521933-9016e9.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642525/trails/velka-fatra-gaderska-dolina/1784642524927-6d1c58.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642527/trails/velka-fatra-gaderska-dolina/1784642527514-0a0fd3.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642530/trails/velka-fatra-gaderska-dolina/1784642529526-29c52b.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642578/trails/velka-fatra-gaderska-dolina/1784642577584-b5fa0d.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642581/trails/velka-fatra-gaderska-dolina/1784642581074-bf16e6.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642585/trails/velka-fatra-gaderska-dolina/1784642584986-34623a.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642588/trails/velka-fatra-gaderska-dolina/1784642586953-a8400b.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642590/trails/velka-fatra-gaderska-dolina/1784642589636-22ef5f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642592/trails/velka-fatra-gaderska-dolina/1784642591862-134477.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642593/trails/velka-fatra-gaderska-dolina/1784642593445-53ae4c.jpg"
    ],
    "seasons": [],
    "desc": "Nádherná asfaltová cestička v zajatí lesa a potoka - ideálna na korčule. Neodporúčam návštevu cez víkend.",
    "dogNote": "",
    "acts": [
      "hike",
      "skating",
      "picnic"
    ],
    "surface": [
      "asphalt"
    ],
    "crowd": "Rušné",
    "tags": [
      "River",
      "Forest",
      "Meadow"
    ],
    "ascentM": 259,
    "marks": [
      [
        "yellow"
      ]
    ]
  },
  {
    "id": "chocske-vrchy-velky-choc",
    "name": "Veľký Choč",
    "region": "Chočské vrchy",
    "diff": "Moderate",
    "km": "13.4",
    "stars": 5,
    "path": [
      [
        49.12911,
        19.40203
      ],
      [
        49.13719,
        19.39688
      ],
      [
        49.14236,
        19.384
      ],
      [
        49.13809,
        19.37387
      ],
      [
        49.13551,
        19.36392
      ],
      [
        49.14101,
        19.35276
      ],
      [
        49.1473,
        19.35126
      ],
      [
        49.14859,
        19.351
      ],
      [
        49.14823,
        19.34916
      ],
      [
        49.14929,
        19.3483
      ],
      [
        49.14682,
        19.34469
      ],
      [
        49.15086,
        19.34306
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642613/trails/chocske-vrchy-velky-choc/1784642612862-79995f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642615/trails/chocske-vrchy-velky-choc/1784642615395-ce34da.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642616/trails/chocske-vrchy-velky-choc/1784642616703-feea8e.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642618/trails/chocske-vrchy-velky-choc/1784642618022-f71148.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642621/trails/chocske-vrchy-velky-choc/1784642620988-136bb8.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642639/trails/chocske-vrchy-velky-choc/1784642638956-2e890a.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642641/trails/chocske-vrchy-velky-choc/1784642640831-079ad5.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642642/trails/chocske-vrchy-velky-choc/1784642642015-cc91b7.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642644/trails/chocske-vrchy-velky-choc/1784642643973-fc5785.jpg"
    ],
    "seasons": [],
    "desc": "Vraj najkrajší vrchol na Slovensku. Asi to tak bude... Chystám sa tam opäť bez snehu! Aj keď so snehom to malo krásne čaro :)",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Mountains",
      "River",
      "View",
      "Meadow",
      "Forest"
    ],
    "ascentM": 1021,
    "marks": [
      [
        "red",
        "blue"
      ],
      [
        "blue"
      ],
      [
        "red"
      ]
    ]
  },
  {
    "id": "chocske-vrchy-sip",
    "name": "Šíp",
    "region": "Chočské vrchy",
    "diff": "Moderate",
    "km": "4.3",
    "stars": 5,
    "path": [
      [
        49.1642,
        19.15765
      ],
      [
        49.16558,
        19.15883
      ],
      [
        49.16657,
        19.16159
      ],
      [
        49.16565,
        19.16322
      ],
      [
        49.16535,
        19.16404
      ],
      [
        49.16427,
        19.16303
      ],
      [
        49.16394,
        19.16434
      ],
      [
        49.16394,
        19.16565
      ],
      [
        49.16301,
        19.16608
      ],
      [
        49.16346,
        19.16713
      ],
      [
        49.16312,
        19.16846
      ],
      [
        49.16464,
        19.1708
      ],
      [
        49.16495,
        19.17279
      ],
      [
        49.16511,
        19.17498
      ],
      [
        49.16526,
        19.17814
      ],
      [
        49.16542,
        19.17923
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646773/trails/chocske-vrchy-sip/1784646773381-b39bfb.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646772/trails/chocske-vrchy-sip/1784646772555-2863c5.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646772/trails/chocske-vrchy-sip/1784646772554-ad5037.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646772/trails/chocske-vrchy-sip/1784646772556-d0b3f4.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646773/trails/chocske-vrchy-sip/1784646773287-7db704.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646773/trails/chocske-vrchy-sip/1784646773361-e61a56.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646773/trails/chocske-vrchy-sip/1784646773425-535303.webp"
    ],
    "seasons": [],
    "desc": "Krátka turistika na celkom pekný nenápadný kopček :)",
    "dogNote": "",
    "acts": [
      "hike",
      "picnic"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Meadow",
      "Forest",
      "View"
    ],
    "ascentM": 422,
    "marks": [
      [
        "yellow"
      ]
    ]
  },
  {
    "id": "chocske-vrchy-kvacianska-dolina",
    "name": "Kvačianska dolina",
    "region": "Chočské vrchy",
    "diff": "Moderate",
    "km": "17.3",
    "stars": 5,
    "path": [
      [
        49.17835,
        19.54236
      ],
      [
        49.17967,
        19.5415
      ],
      [
        49.18107,
        19.53987
      ],
      [
        49.18427,
        19.5415
      ],
      [
        49.18609,
        19.54249
      ],
      [
        49.18845,
        19.54592
      ],
      [
        49.19024,
        19.54682
      ],
      [
        49.19153,
        19.54588
      ],
      [
        49.19316,
        19.54644
      ],
      [
        49.19445,
        19.54485
      ],
      [
        49.19543,
        19.54472
      ],
      [
        49.19519,
        19.54352
      ],
      [
        49.19617,
        19.54275
      ],
      [
        49.1968,
        19.54127
      ],
      [
        49.19624,
        19.54101
      ],
      [
        49.19711,
        19.53929
      ],
      [
        49.19649,
        19.53727
      ],
      [
        49.19645,
        19.53629
      ],
      [
        49.19599,
        19.53429
      ],
      [
        49.19606,
        19.53273
      ],
      [
        49.19559,
        19.52785
      ],
      [
        49.1954,
        19.52301
      ],
      [
        49.19622,
        19.52017
      ],
      [
        49.19305,
        19.51502
      ],
      [
        49.18738,
        19.50537
      ],
      [
        49.18054,
        19.49408
      ],
      [
        49.17998,
        19.49232
      ],
      [
        49.17988,
        19.50125
      ],
      [
        49.17949,
        19.51129
      ],
      [
        49.17337,
        19.50391
      ],
      [
        49.17362,
        19.51206
      ],
      [
        49.17921,
        19.5197
      ],
      [
        49.18521,
        19.52262
      ],
      [
        49.18846,
        19.53524
      ],
      [
        49.18914,
        19.53781
      ],
      [
        49.19121,
        19.53738
      ],
      [
        49.19329,
        19.53601
      ],
      [
        49.19121,
        19.52622
      ],
      [
        49.19564,
        19.53137
      ],
      [
        49.19688,
        19.53773
      ],
      [
        49.19542,
        19.54442
      ],
      [
        49.192,
        19.54597
      ],
      [
        49.18852,
        19.54588
      ],
      [
        49.18605,
        19.54236
      ],
      [
        49.18218,
        19.54073
      ],
      [
        49.1782,
        19.54245
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642725/trails/chocske-vrchy-kvacianska-dolina/1784642724443-601c35.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642728/trails/chocske-vrchy-kvacianska-dolina/1784642727350-b050c9.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642796/trails/chocske-vrchy-kvacianska-dolina/1784642795192-4198ad.jpg"
    ],
    "seasons": [],
    "desc": "Krásne miesto na konci Kvačianskej doliny je obrovský rebrík do Prosieckej... s veľkým psom to nedáte a neodporúčal by som to ani s malým. Tam cesta končí... vrátiť sa môžete tak isto alebo ísť cez Prosečné a trošku si zamakať :)",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "River",
      "View",
      "Meadow",
      "Forest"
    ],
    "ascentM": 1099,
    "marks": [
      [
        "red",
        "green"
      ],
      [
        "blue",
        "green"
      ],
      [
        "green"
      ],
      [
        "blue",
        "green"
      ],
      [
        "red",
        "green"
      ]
    ]
  },
  {
    "id": "nizke-tatry-chopok-dumbier",
    "name": "Chopok – Ďumbier",
    "region": "Nízke Tatry",
    "diff": "Hard",
    "km": "12.2",
    "stars": 5,
    "path": [
      [
        48.92487,
        19.61042
      ],
      [
        48.92521,
        19.61901
      ],
      [
        48.9265,
        19.62536
      ],
      [
        48.92583,
        19.63171
      ],
      [
        48.92667,
        19.63832
      ],
      [
        48.9265,
        19.6463
      ],
      [
        48.9265,
        19.64973
      ],
      [
        48.93045,
        19.6475
      ],
      [
        48.93338,
        19.64622
      ],
      [
        48.93558,
        19.64055
      ],
      [
        48.9384,
        19.63034
      ],
      [
        48.9371,
        19.62441
      ],
      [
        48.93919,
        19.6209
      ],
      [
        48.94054,
        19.61386
      ],
      [
        48.94088,
        19.60613
      ],
      [
        48.94111,
        19.59789
      ],
      [
        48.94269,
        19.59206
      ],
      [
        48.9419,
        19.59034
      ],
      [
        48.93981,
        19.59017
      ],
      [
        48.93637,
        19.59214
      ],
      [
        48.93507,
        19.59317
      ],
      [
        48.93203,
        19.59085
      ],
      [
        48.93237,
        19.59635
      ],
      [
        48.93217,
        19.59841
      ],
      [
        48.93156,
        19.5998
      ],
      [
        48.92891,
        19.60073
      ],
      [
        48.93031,
        19.60238
      ],
      [
        48.92803,
        19.60257
      ],
      [
        48.92804,
        19.60298
      ],
      [
        48.92619,
        19.60242
      ],
      [
        48.92509,
        19.60223
      ],
      [
        48.92481,
        19.60268
      ],
      [
        48.92714,
        19.60532
      ],
      [
        48.92611,
        19.60682
      ],
      [
        48.92457,
        19.60673
      ],
      [
        48.92425,
        19.60744
      ],
      [
        48.92535,
        19.61036
      ],
      [
        48.92495,
        19.61042
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642920/trails/nizke-tatry-chopok-dumbier/1784642919362-251c38.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642921/trails/nizke-tatry-chopok-dumbier/1784642921336-341800.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642923/trails/nizke-tatry-chopok-dumbier/1784642922706-588e39.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642924/trails/nizke-tatry-chopok-dumbier/1784642923974-ffcbcb.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642926/trails/nizke-tatry-chopok-dumbier/1784642925731-e6ca15.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642928/trails/nizke-tatry-chopok-dumbier/1784642927329-2ea159.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642930/trails/nizke-tatry-chopok-dumbier/1784642929950-d2041d.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642932/trails/nizke-tatry-chopok-dumbier/1784642931763-205fc5.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784642934/trails/nizke-tatry-chopok-dumbier/1784642933862-6b37c1.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784643430/trails/nizke-tatry-chopok-dumbier/1784643429681-ba9155.jpg"
    ],
    "seasons": [],
    "desc": "Epická vysokohorská turistika. Dá sa to síce aj lanovkou ale odporúčam túto časť Nízkych Tatier prejsť pešo, boli sme tam asi 4x :) Klasika z Trangošky...",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [],
    "ascentM": 1151,
    "marks": [
      [
        "green"
      ],
      [
        "green",
        "yellow"
      ],
      [
        "green"
      ],
      [
        "red",
        "blue",
        "green"
      ],
      [
        "red"
      ],
      [
        "red",
        "green"
      ],
      [
        "red"
      ],
      [
        "yellow"
      ],
      [
        "blue",
        "yellow"
      ],
      [
        "yellow"
      ]
    ]
  },
  {
    "id": "nizke-tatry-ohniste",
    "name": "Ohnište",
    "region": "Nízke Tatry",
    "diff": "Hard",
    "km": "6.1",
    "stars": 5,
    "path": [
      [
        49.0221,
        19.72044
      ],
      [
        49.02008,
        19.71715
      ],
      [
        49.01837,
        19.71728
      ],
      [
        49.01198,
        19.7166
      ],
      [
        49.00584,
        19.71291
      ],
      [
        49.00173,
        19.71325
      ],
      [
        48.99734,
        19.70913
      ],
      [
        48.99317,
        19.70261
      ],
      [
        48.98461,
        19.70467
      ],
      [
        48.98247,
        19.71085
      ],
      [
        48.97932,
        19.711
      ],
      [
        48.97794,
        19.70879
      ],
      [
        48.97671,
        19.70711
      ],
      [
        48.97534,
        19.70565
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646442/trails/nizke-tatry-ohniste/1784646441137-0565b7.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646443/trails/nizke-tatry-ohniste/1784646443673-d3f072.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646446/trails/nizke-tatry-ohniste/1784646445588-14f199.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646447/trails/nizke-tatry-ohniste/1784646446829-b7c5cb.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646449/trails/nizke-tatry-ohniste/1784646449027-ad1fbb.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646450/trails/nizke-tatry-ohniste/1784646450492-c20038.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646452/trails/nizke-tatry-ohniste/1784646451878-67b780.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646453/trails/nizke-tatry-ohniste/1784646453404-b2483d.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646455/trails/nizke-tatry-ohniste/1784646454794-5f4e2c.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646456/trails/nizke-tatry-ohniste/1784646456145-e2d294.jpg"
    ],
    "seasons": [],
    "desc": "Najkrajšie skalné okno na Slovensku - bez pochyby. Predtým, ako tam pôjdeš, si zisti, či je to povolené, počul som že niekedy to zvyknú uzatvoriť... takže na vlastné riziko! Ale tento rok som žiadne upozornenie nevidel :) Na mapy.cz to býva uvedené...alebo priamo značka v teréne :) Určite odporúčam!",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Ľudoprázdne",
    "tags": [],
    "ascentM": 898,
    "marks": [
      [
        "red"
      ],
      [
        "blue"
      ],
      [
        "green"
      ]
    ]
  },
  {
    "id": "zapadne-tatry-sivy-vrch",
    "name": "Sivý vrch",
    "region": "Západné Tatry",
    "diff": "Hard",
    "km": "7.7",
    "stars": 5,
    "path": [
      [
        49.22295,
        19.59909
      ],
      [
        49.22295,
        19.60639
      ],
      [
        49.22104,
        19.60733
      ],
      [
        49.21886,
        19.60982
      ],
      [
        49.21914,
        19.61145
      ],
      [
        49.21678,
        19.61068
      ],
      [
        49.21381,
        19.61884
      ],
      [
        49.2128,
        19.62853
      ],
      [
        49.21174,
        19.63368
      ],
      [
        49.21212,
        19.63482
      ],
      [
        49.21205,
        19.63613
      ],
      [
        49.21245,
        19.63716
      ],
      [
        49.21187,
        19.63939
      ],
      [
        49.21116,
        19.64177
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644651/trails/zapadne-tatry-sivy-vrch/1784644650862-71754a.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644653/trails/zapadne-tatry-sivy-vrch/1784644653006-6c411c.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644655/trails/zapadne-tatry-sivy-vrch/1784644654714-3603ae.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644656/trails/zapadne-tatry-sivy-vrch/1784644656207-13f34a.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644657/trails/zapadne-tatry-sivy-vrch/1784644657078-5be3fc.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644658/trails/zapadne-tatry-sivy-vrch/1784644658110-e50305.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644659/trails/zapadne-tatry-sivy-vrch/1784644659566-ff3e6b.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644661/trails/zapadne-tatry-sivy-vrch/1784644660816-07574c.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644662/trails/zapadne-tatry-sivy-vrch/1784644662200-17f566.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644663/trails/zapadne-tatry-sivy-vrch/1784644663551-c2bf4e.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644664/trails/zapadne-tatry-sivy-vrch/1784644664720-022acf.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644665/trails/zapadne-tatry-sivy-vrch/1784644665837-c2502b.jpg"
    ],
    "seasons": [],
    "desc": "Ako z iného sveta. Krásna príroda aj výhľady - na vrchole už cez skaly so psom celkom neprejdete, ale oplatí sa to vidieť :)",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Mountains",
      "View",
      "Meadow",
      "Forest"
    ],
    "ascentM": 832,
    "marks": [
      [
        "red"
      ]
    ]
  },
  {
    "id": "vysoke-tatry-bielovodska-dolina",
    "name": "Bielovodská dolina",
    "region": "Vysoké Tatry",
    "diff": "Hard",
    "km": "22.0",
    "stars": 5,
    "path": [
      [
        49.26308,
        20.11449
      ],
      [
        49.25852,
        20.11189
      ],
      [
        49.2526,
        20.10344
      ],
      [
        49.24834,
        20.10155
      ],
      [
        49.23876,
        20.10043
      ],
      [
        49.2257,
        20.10249
      ],
      [
        49.2202,
        20.10215
      ],
      [
        49.21701,
        20.10026
      ],
      [
        49.21443,
        20.10189
      ],
      [
        49.21364,
        20.10412
      ],
      [
        49.21196,
        20.10301
      ],
      [
        49.20837,
        20.10807
      ],
      [
        49.19834,
        20.11459
      ],
      [
        49.19424,
        20.11683
      ],
      [
        49.18341,
        20.11674
      ],
      [
        49.17999,
        20.11957
      ],
      [
        49.1796,
        20.1267
      ],
      [
        49.17884,
        20.13058
      ],
      [
        49.17819,
        20.12964
      ],
      [
        49.17778,
        20.12989
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646794/trails/vysoke-tatry-bielovodska-dolina/1784646793312-812aa4.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646793/trails/vysoke-tatry-bielovodska-dolina/1784646793310-14394f.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646794/trails/vysoke-tatry-bielovodska-dolina/1784646794007-d5795c.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646794/trails/vysoke-tatry-bielovodska-dolina/1784646793315-7182a0.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646794/trails/vysoke-tatry-bielovodska-dolina/1784646794714-18e97f.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646795/trails/vysoke-tatry-bielovodska-dolina/1784646793316-18fa64.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646795/trails/vysoke-tatry-bielovodska-dolina/1784646794745-eae434.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646795/trails/vysoke-tatry-bielovodska-dolina/1784646794852-506f2f.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646796/trails/vysoke-tatry-bielovodska-dolina/1784646796078-918b0b.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646796/trails/vysoke-tatry-bielovodska-dolina/1784646795718-4d72d7.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646796/trails/vysoke-tatry-bielovodska-dolina/1784646796519-ca9d99.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646797/trails/vysoke-tatry-bielovodska-dolina/1784646797237-0895f2.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646797/trails/vysoke-tatry-bielovodska-dolina/1784646797417-e0832d.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646797/trails/vysoke-tatry-bielovodska-dolina/1784646797244-d699db.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646796/trails/vysoke-tatry-bielovodska-dolina/1784646796313-a7e775.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646798/trails/vysoke-tatry-bielovodska-dolina/1784646798193-44ac08.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646798/trails/vysoke-tatry-bielovodska-dolina/1784646798416-031834.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646799/trails/vysoke-tatry-bielovodska-dolina/1784646798560-6aba31.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646799/trails/vysoke-tatry-bielovodska-dolina/1784646799212-e65df9.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646799/trails/vysoke-tatry-bielovodska-dolina/1784646799089-ddb305.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646799/trails/vysoke-tatry-bielovodska-dolina/1784646798785-b886ca.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646799/trails/vysoke-tatry-bielovodska-dolina/1784646799662-2207ab.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646800/trails/vysoke-tatry-bielovodska-dolina/1784646800314-8fc8d6.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646800/trails/vysoke-tatry-bielovodska-dolina/1784646800594-e25cda.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646801/trails/vysoke-tatry-bielovodska-dolina/1784646801116-88491c.webp"
    ],
    "seasons": [],
    "desc": "Naša prvá Vysokotatranská túra - nič sa na ňu nechytá bola DOKONALÁ. Dostali sme sa po Litvorové pleso a to sme riadne šlapali takmer stále! Pán prsteňov VIBE a málo ľudí. Potôčik, skaly, lesy, ticho fakt krása - toto odštartovalo našu kariéru turistov :)",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Pokojné",
    "tags": [
      "Mountains",
      "River",
      "View",
      "Meadow",
      "Forest"
    ],
    "ascentM": 938,
    "marks": [
      [
        "blue"
      ]
    ]
  },
  {
    "id": "vysoke-tatry-zelene-pleso",
    "name": "Zelené pleso",
    "region": "Vysoké Tatry",
    "diff": "Moderate",
    "km": "20.6",
    "stars": 5,
    "path": [
      [
        49.22437,
        20.32192
      ],
      [
        49.21946,
        20.31479
      ],
      [
        49.21941,
        20.31106
      ],
      [
        49.21617,
        20.3078
      ],
      [
        49.21908,
        20.30728
      ],
      [
        49.2165,
        20.29922
      ],
      [
        49.22483,
        20.27681
      ],
      [
        49.21777,
        20.26531
      ],
      [
        49.22138,
        20.2533
      ],
      [
        49.22037,
        20.25098
      ],
      [
        49.22312,
        20.2363
      ],
      [
        49.22256,
        20.23132
      ],
      [
        49.22133,
        20.23098
      ],
      [
        49.21936,
        20.22901
      ],
      [
        49.21841,
        20.23321
      ],
      [
        49.21398,
        20.22386
      ],
      [
        49.21275,
        20.22549
      ],
      [
        49.20989,
        20.2212
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784650107/trails/vysoke-tatry-zelene-pleso/1784650106624-849363.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784650110/trails/vysoke-tatry-zelene-pleso/1784650109565-5c0f68.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644754/trails/vysoke-tatry-zelene-pleso/1784644754788-133110.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644750/trails/vysoke-tatry-zelene-pleso/1784644749334-0dc87e.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644751/trails/vysoke-tatry-zelene-pleso/1784644751441-f52f89.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644753/trails/vysoke-tatry-zelene-pleso/1784644753187-a89187.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644756/trails/vysoke-tatry-zelene-pleso/1784644755943-aba3de.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644757/trails/vysoke-tatry-zelene-pleso/1784644757061-604d75.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644759/trails/vysoke-tatry-zelene-pleso/1784644759215-60c6d0.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784644761/trails/vysoke-tatry-zelene-pleso/1784644760668-80c9c5.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784650113/trails/vysoke-tatry-zelene-pleso/1784650111951-5f6659.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784650116/trails/vysoke-tatry-zelene-pleso/1784650116095-b9258a.jpg"
    ],
    "seasons": [],
    "desc": "Krásne pleso. Je fakt zelené! Hektor sa v ňom okúpal ešte skôr než to bola poburujúca téma :) Nádherná turistika-fakt.",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Rušné",
    "tags": [
      "River",
      "Mountains",
      "View",
      "Meadow",
      "Forest"
    ],
    "ascentM": 1064,
    "marks": [
      [
        "blue",
        "green"
      ],
      [
        "green"
      ],
      [
        "red"
      ]
    ]
  },
  {
    "id": "slovensky-raj-tomasovsky-vyhlad",
    "name": "Tomášovský výhľad",
    "region": "Volovské vrchy",
    "diff": "Hard",
    "km": "26.3",
    "stars": 5,
    "path": [
      [
        48.86802,
        20.38281
      ],
      [
        48.8705,
        20.39088
      ],
      [
        48.87959,
        20.39655
      ],
      [
        48.88371,
        20.40118
      ],
      [
        48.88868,
        20.41826
      ],
      [
        48.88838,
        20.42127
      ],
      [
        48.89053,
        20.42311
      ],
      [
        48.8923,
        20.42234
      ],
      [
        48.89275,
        20.42157
      ],
      [
        48.8936,
        20.42187
      ],
      [
        48.89676,
        20.42135
      ],
      [
        48.89981,
        20.42015
      ],
      [
        48.90212,
        20.41985
      ],
      [
        48.90527,
        20.41929
      ],
      [
        48.90752,
        20.41509
      ],
      [
        48.91232,
        20.41843
      ],
      [
        48.92292,
        20.42453
      ],
      [
        48.93093,
        20.42487
      ],
      [
        48.93651,
        20.42453
      ],
      [
        48.93787,
        20.4283
      ],
      [
        48.94012,
        20.43397
      ],
      [
        48.94125,
        20.44024
      ],
      [
        48.93989,
        20.44564
      ],
      [
        48.94204,
        20.45114
      ],
      [
        48.94401,
        20.45654
      ],
      [
        48.94482,
        20.45676
      ],
      [
        48.94565,
        20.45614
      ],
      [
        48.94654,
        20.45676
      ],
      [
        48.94623,
        20.45738
      ],
      [
        48.94777,
        20.45815
      ],
      [
        48.94717,
        20.45944
      ],
      [
        48.94595,
        20.45985
      ],
      [
        48.94492,
        20.45978
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784645638/trails/slovensky-raj-tomasovsky-vyhlad/1784645637377-a43ab3.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784645640/trails/slovensky-raj-tomasovsky-vyhlad/1784645639849-dd523c.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784645641/trails/slovensky-raj-tomasovsky-vyhlad/1784645641480-25e79f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784645644/trails/slovensky-raj-tomasovsky-vyhlad/1784645643614-387acf.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784645646/trails/slovensky-raj-tomasovsky-vyhlad/1784645645818-bd951f.jpg"
    ],
    "seasons": [],
    "desc": "Toto bola fakt luxusná ale aj veľmi náročná turistika. Na výhľad sa dá ísť aj kratšou cestičkou - toto odporúčam len pokročilým dobrodruhom :) bolo to cez 30 km! Mladosť – pochabosť. Ale za to prejdený Slovenský Raj skrz na skrz!",
    "dogNote": "",
    "acts": [
      "hike"
    ],
    "surface": [
      "forest"
    ],
    "crowd": "Rušné",
    "tags": [
      "Mountains",
      "View",
      "River",
      "Meadow"
    ],
    "ascentM": 558,
    "marks": [
      [
        "green"
      ],
      [
        "blue",
        "green"
      ],
      [
        "green"
      ],
      [
        "blue",
        "green"
      ],
      [
        "green"
      ],
      [
        "green",
        "yellow"
      ]
    ]
  },
  {
    "id": "vodne-diela-liptovska-mara",
    "name": "Liptovská Mara",
    "region": "",
    "diff": "Moderate",
    "km": "",
    "stars": 5,
    "path": [
      [
        49.12411,
        19.51035
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646788/trails/vodne-diela-liptovska-mara/1784646788679-bfd009.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646789/trails/vodne-diela-liptovska-mara/1784646788877-866b2c.webp",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646362/trails/vodne-diela-liptovska-mara/1784646361867-2a7643.jpg"
    ],
    "seasons": [],
    "desc": "Epické kúpanie v krásnej a celkom studenej vode :)",
    "dogNote": "",
    "acts": [
      "paddleboard"
    ],
    "surface": [],
    "crowd": "",
    "tags": [
      "In the middle of nature"
    ],
    "waves": 3
  },
  {
    "id": "vodne-diela-kralova",
    "name": "Kráľová",
    "region": "",
    "diff": "Moderate",
    "km": "",
    "stars": 4,
    "path": [
      [
        48.22004,
        17.81708
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646070/trails/vodne-diela-kralova/1784646069877-b52384.jpg"
    ],
    "seasons": [],
    "desc": "Fakt obrovské dielo = súkromie na hladine. (opaľovanie bez plaviek - bezpečné)",
    "dogNote": "",
    "acts": [
      "paddleboard",
      "skating"
    ],
    "surface": [],
    "crowd": "",
    "tags": [
      "In the middle of nowhere"
    ],
    "waves": 3
  },
  {
    "id": "vodne-diela-slnava",
    "name": "Sĺňava",
    "region": "",
    "diff": "Moderate",
    "km": "",
    "stars": 5,
    "path": [
      [
        48.56324,
        17.83197
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646136/trails/vodne-diela-slnava/1784646135086-b0324f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646137/trails/vodne-diela-slnava/1784646137205-9862fa.jpg"
    ],
    "seasons": [],
    "desc": "Zaujímavá vodná nádrž - s vtáčím ostrovom :)) Stojí za to urobiť si okružnú jazdu. Na mape som označil super miesto na parking - hneď pri vode.",
    "dogNote": "",
    "acts": [
      "paddleboard",
      "skating",
      "picnic"
    ],
    "surface": [],
    "crowd": "",
    "tags": [
      "In the middle of nowhere",
      "In the middle of nature"
    ],
    "waves": 2
  },
  {
    "id": "vodne-diela-oresianska-priehrada",
    "name": "Orešianska priehrada",
    "region": "",
    "diff": "Moderate",
    "km": "",
    "stars": 5,
    "path": [
      [
        48.4738,
        17.41831
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646186/trails/vodne-diela-oresianska-priehrada/1784646185382-2f6754.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646187/trails/vodne-diela-oresianska-priehrada/1784646187273-3f5064.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646190/trails/vodne-diela-oresianska-priehrada/1784646189089-1e0f8f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646192/trails/vodne-diela-oresianska-priehrada/1784646191424-57733c.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646193/trails/vodne-diela-oresianska-priehrada/1784646193148-996764.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646194/trails/vodne-diela-oresianska-priehrada/1784646194528-52a5d3.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646196/trails/vodne-diela-oresianska-priehrada/1784646195724-afc56e.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646197/trails/vodne-diela-oresianska-priehrada/1784646197127-bc6066.jpg"
    ],
    "seasons": [],
    "desc": "Asi najkrajšia vodná plocha na západe - v strede prírody, málo ľudí, možnosť vylodiť sa na opustených zátokách, kopce vrhajú tieň, čistá voda... skrátka naša obľúbená priehrada, ktorú máme kúsok od domu! ",
    "dogNote": "",
    "acts": [
      "skating",
      "paddleboard",
      "picnic"
    ],
    "surface": [],
    "crowd": "",
    "tags": [
      "In the middle of nature"
    ],
    "waves": 1
  },
  {
    "id": "vodne-diela-palcmanska-masa",
    "name": "Palcmanská Maša",
    "region": "",
    "diff": "Moderate",
    "km": "",
    "stars": 5,
    "path": [
      [
        48.86192,
        20.38084
      ]
    ],
    "photos": [
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646293/trails/vodne-diela-palcmanska-masa/1784646292878-5a7db6.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646281/trails/vodne-diela-palcmanska-masa/1784646280611-a39ee2.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646282/trails/vodne-diela-palcmanska-masa/1784646282479-3397c3.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646286/trails/vodne-diela-palcmanska-masa/1784646286227-808b1d.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646287/trails/vodne-diela-palcmanska-masa/1784646287309-007671.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646288/trails/vodne-diela-palcmanska-masa/1784646288391-73ed09.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646289/trails/vodne-diela-palcmanska-masa/1784646289377-1c8b41.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646290/trails/vodne-diela-palcmanska-masa/1784646290474-b3864f.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646291/trails/vodne-diela-palcmanska-masa/1784646291564-06d138.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646295/trails/vodne-diela-palcmanska-masa/1784646294328-7a2dbc.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646296/trails/vodne-diela-palcmanska-masa/1784646296222-ad1935.jpg",
      "https://res.cloudinary.com/dz8lolmod/image/upload/v1784646297/trails/vodne-diela-palcmanska-masa/1784646297423-9dd065.jpg"
    ],
    "seasons": [],
    "desc": "Za nás: Najkrajšia vodná plocha na SVK kde sa vraciame každý rok od 2019 :)) Výborný kemp hneď na brehu - dokonalosť.",
    "dogNote": "",
    "acts": [
      "paddleboard",
      "picnic",
      "overnight"
    ],
    "surface": [],
    "crowd": "",
    "tags": [
      "In the middle of nature"
    ],
    "waves": 2
  }
];
