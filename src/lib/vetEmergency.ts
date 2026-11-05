// ⚙️ GENEROVANÉ — needituj ručne. Zdroj: plany/nakresy/pohotovost-karticka-2026-11-04/data-sk.json (gen-vet-data.mjs).
// Veterinárna pohotovosť v SOS. Čísla sú z vlastných webov kliník, overené 5. 11. 2026. V balíku appky, aby fungovali bez signálu.
import type { SosKey } from '@/components/pack/sos/sosTexts';

export type VetPlace = {
  id: string; name: string; place: string; address: string; tel: string; at: [number, number];
  /** onsite = lekár fyzicky na mieste · nonstop · call = nonstop na zavolanie · ask = web hodiny neuvádza, nikdy netvrdíme „zatvorené" · [od, do] v hodinách, do > 24 = cez polnoc. */
  hours: 'onsite' | 'nonstop' | 'call' | 'ask' | [number, number];
  /** Rozpis po dňoch (wk Po–Pi · sa · su), keď web uvádza pre dni iné hodiny. Má prednosť pred [od, do]. */
  sched?: { wk: [number, number][]; sa: [number, number][]; su: [number, number][] };
  /** Iné číslo v danom čase (hodiny), mimo neho platí `tel`. */
  telBy?: { from: number; to: number; tel: string }[];
  /** Stále ID kliniky: nemení sa s poradím ani prekladom, na neho sa neskôr pripne profil (plany/klinika-profil-navrh-2026-11-05.md). */
  /** exact = poloha overená na dom (OSM), navigácia ide podľa bodu. Bez neho podľa textu adresy. */
  exact?: true;
  /** Fotka z vlastného webu kliniky (súbor v public/vet/), source = stránka, kde je, at = dátum zberu. Bez fotky pole chýba. */
  photo?: { src: string; source: string; at: string };
  /** Hodnotenie z Google opísané ručne (rating 1–5, count = počet recenzií, at = dátum odpisu RRRR-MM-DD, url = profil na Google). Bez neho pole chýba. */
  google?: { rating: number; count: number; at: string; url: string };
  home?: boolean; clientsOnly?: boolean; weekdays?: boolean; fee?: string; note?: SosKey; web: string;
};

export const VET_EMERGENCY: VetPlace[] = [
 {
  "id": "vetline-24h-bratislava",
  "name": "VetLINE 24H",
  "place": "Bratislava-Staré Mesto",
  "address": "Staromestská 6/D, Bratislava",
  "tel": "+421 2 5441 2869",
  "at": [
   48.146679,
   17.1045933
  ],
  "hours": "onsite",
  "exact": true,
  "web": "https://www.vetline.sk/"
 },
 {
  "id": "smallvet-plus-bratislava",
  "name": "SmallVet Plus",
  "place": "Bratislava-Rača",
  "address": "Žitná 46, Bratislava",
  "tel": "+421 949 247 294",
  "at": [
   48.2074684,
   17.1542877
  ],
  "hours": "nonstop",
  "exact": true,
  "web": "https://www.smallvet.sk/"
 },
 {
  "id": "vetpoint-bratislava",
  "name": "VetPoint",
  "place": "Bratislava-Petržalka",
  "address": "Panónska cesta 38, Bratislava",
  "tel": "+421 948 029 674",
  "at": [
   48.1079218,
   17.0950244
  ],
  "hours": "nonstop",
  "exact": true,
  "web": "http://www.vetpoint.sk/",
  "photo": {
   "src": "/vet/vetpoint-bratislava.webp",
   "source": "http://www.vetpoint.sk/",
   "at": "2026-11-05"
  }
 },
 {
  "id": "univerzitna-veterinarna-nemocnica-uvlf-kosice",
  "name": "Univerzitná veterinárna nemocnica UVLF",
  "place": "Košice",
  "address": "Komenského 73, Košice",
  "tel": "+421 905 579 559",
  "at": [
   48.7375621,
   21.2468625
  ],
  "hours": "onsite",
  "exact": true,
  "telBy": [
   {
    "from": 15.5,
    "to": 20,
    "tel": "+421 915 991 474"
   }
  ],
  "web": "https://www.uvlf.sk/kliniky-sluzby/pohotovost"
 },
 {
  "id": "veterinarna-klinika-poprad",
  "name": "Veterinárna klinika Poprad",
  "place": "Poprad",
  "address": "Hraničná 12, Poprad",
  "tel": "+421 911 761 664",
  "at": [
   49.0598714,
   20.2819929
  ],
  "hours": "call",
  "exact": true,
  "fee": "39 €",
  "web": "http://www.veterinapoprad.sk/"
 },
 {
  "id": "ambulancia-s-pohotovostou-centrum-poprad",
  "name": "Ambulancia s pohotovosťou Centrum",
  "place": "Poprad",
  "address": "Dominika Tatarku 5, Poprad",
  "tel": "+421 908 252 898",
  "at": [
   49.055316,
   20.2991774
  ],
  "hours": "call",
  "exact": true,
  "web": "http://www.veterinar-pohotovost.sk/",
  "photo": {
   "src": "/vet/ambulancia-s-pohotovostou-centrum-poprad.webp",
   "source": "http://www.veterinar-pohotovost.sk/",
   "at": "2026-11-05"
  }
 },
 {
  "id": "klinika-fenix-zilina",
  "name": "Klinika Fénix",
  "place": "Žilina",
  "address": "Štrková 10A, Žilina",
  "tel": "+421 915 983 343",
  "at": [
   49.1942701,
   18.726622
  ],
  "hours": "call",
  "exact": true,
  "web": "http://www.klinikafenix.sk/",
  "photo": {
   "src": "/vet/klinika-fenix-zilina.webp",
   "source": "http://www.klinikafenix.sk/",
   "at": "2026-11-05"
  }
 },
 {
  "id": "tri-vet-cifer",
  "name": "Tri-Vet",
  "place": "Cífer",
  "address": "Kaplnská 14, Cífer",
  "tel": "+421 917 213 934",
  "at": [
   48.3144837,
   17.4831545
  ],
  "hours": "call",
  "exact": true,
  "note": "pack.sos.er.noteBranch",
  "web": "http://www.trivet.sk/"
 },
 {
  "id": "scar-vet-trnava",
  "name": "SCAR Vet",
  "place": "Trnava",
  "address": "Sladovnícka 22, Trnava",
  "tel": "+421 952 209 967",
  "at": [
   48.3706744,
   17.5973269
  ],
  "hours": "call",
  "exact": true,
  "web": "http://www.scarvet.sk/",
  "photo": {
   "src": "/vet/scar-vet-trnava.webp",
   "source": "http://www.scarvet.sk/",
   "at": "2026-11-05"
  }
 },
 {
  "id": "pet-clinic-nitra",
  "name": "Pet Clinic",
  "place": "Nitra",
  "address": "Nábrežie mládeže 47, Nitra",
  "tel": "+421 905 332 599",
  "at": [
   48.31471,
   18.09833
  ],
  "hours": "call",
  "exact": true,
  "web": "http://www.petclinic.sk/"
 },
 {
  "id": "doktor-zvierat-piestany",
  "name": "Doktor Zvierat",
  "place": "Piešťany",
  "address": "Vrbovská cesta 14, Piešťany",
  "tel": "+421 905 455 931",
  "at": [
   48.59139,
   17.81739
  ],
  "hours": "call",
  "exact": true,
  "web": "http://www.doktorzvierat.sk/",
  "photo": {
   "src": "/vet/doktor-zvierat-piestany.webp",
   "source": "http://www.doktorzvierat.sk/",
   "at": "2026-11-05"
  }
 },
 {
  "id": "klinika-lives-liptovsky",
  "name": "Klinika LiVeS",
  "place": "Liptovský Mikuláš",
  "address": "1. mája 75, Liptovský Mikuláš",
  "tel": "+421 905 505 015",
  "at": [
   49.0803385,
   19.6242831
  ],
  "hours": "call",
  "exact": true,
  "web": "http://www.veterina-lives.sk/"
 },
 {
  "id": "veterinar-topolcany",
  "name": "Veterinár Topoľčany",
  "place": "Topoľčany",
  "address": "Vajanského 18, Topoľčany",
  "tel": "+421 905 218 313",
  "at": [
   48.56141,
   18.15034
  ],
  "hours": "call",
  "exact": true,
  "note": "pack.sos.er.noteMayClose",
  "web": "http://www.veterinartopolcany.sk/",
  "photo": {
   "src": "/vet/veterinar-topolcany.webp",
   "source": "http://www.veterinartopolcany.sk/",
   "at": "2026-11-05"
  }
 },
 {
  "id": "vetkom-povazska",
  "name": "Vetkom",
  "place": "Považská Bystrica",
  "address": "Žilinská 28, Považská Bystrica",
  "tel": "+421 907 462 525",
  "at": [
   49.125,
   18.46494
  ],
  "hours": "call",
  "exact": true,
  "note": "pack.sos.er.noteGeneral",
  "web": "http://www.vetkom.sk/"
 },
 {
  "id": "belopotocka-levice",
  "name": "MVDr. Belopotocká",
  "place": "Levice",
  "address": "Andreja Kmeťa 29, Levice",
  "tel": "+421 908 185 043",
  "at": [
   48.20652,
   18.61369
  ],
  "hours": "ask",
  "web": "http://www.bebabelvet.sk/"
 },
 {
  "id": "szakall-senec",
  "name": "MVDr. Szakall",
  "place": "Senec",
  "address": "SNP 7, Senec",
  "tel": "+421 903 461 468",
  "at": [
   48.22275,
   17.40484
  ],
  "hours": "call",
  "exact": true,
  "web": "http://www.szakallvet.eu/",
  "photo": {
   "src": "/vet/szakall-senec.webp",
   "source": "http://www.szakallvet.eu/",
   "at": "2026-11-05"
  }
 },
 {
  "id": "klinika-e-vet-kralova",
  "name": "Klinika E-VET",
  "place": "Kráľová pri Senci",
  "address": "Sadová 588, Kráľová pri Senci",
  "tel": "+421 951 506 104",
  "at": [
   48.19742,
   17.4425253
  ],
  "hours": "ask",
  "exact": true,
  "fee": "60 €",
  "web": "http://evetklinika.sk/",
  "photo": {
   "src": "/vet/klinika-e-vet-kralova.webp",
   "source": "http://evetklinika.sk/",
   "at": "2026-11-05"
  }
 },
 {
  "id": "zbonakova-martin",
  "name": "MVDr. Zboňáková",
  "place": "Martin",
  "address": "Aurela Stodolu 5307, Martin",
  "tel": "+421 948 115 386",
  "at": [
   49.0897,
   18.9046
  ],
  "hours": "call",
  "clientsOnly": true,
  "fee": "50 €",
  "web": "http://www.veterinamartin.sk/",
  "photo": {
   "src": "/vet/zbonakova-martin.webp",
   "source": "http://www.veterinamartin.sk/",
   "at": "2026-11-05"
  }
 },
 {
  "id": "mypet-clinic-bratislava",
  "name": "MyPet Clinic",
  "place": "Bratislava-Ružinov",
  "address": "Mierová 27, Bratislava",
  "tel": "+421 2 2211 3113",
  "at": [
   48.1496635,
   17.1678996
  ],
  "hours": [
   10,
   24
  ],
  "exact": true,
  "web": "https://www.mypet.sk/",
  "photo": {
   "src": "/vet/mypet-clinic-bratislava.webp",
   "source": "https://www.mypet.sk/",
   "at": "2026-11-05"
  }
 },
 {
  "id": "cassovet-kosice",
  "name": "Cassovet",
  "place": "Košice",
  "address": "Trieda KVP 7, Košice",
  "tel": "+421 55 643 58 48",
  "at": [
   48.71575,
   21.2133
  ],
  "hours": [
   8,
   24
  ],
  "web": "https://www.cassovet.sk/",
  "photo": {
   "src": "/vet/cassovet-kosice.webp",
   "source": "https://www.cassovet.sk/",
   "at": "2026-11-05"
  }
 },
 {
  "id": "petservis-banska",
  "name": "PETSERVIS",
  "place": "Banská Bystrica",
  "address": "Sládkovičova 22, Banská Bystrica",
  "tel": "+421 905 184 429",
  "at": [
   48.7164,
   19.13208
  ],
  "hours": [
   8,
   22
  ],
  "exact": true,
  "sched": {
   "wk": [
    [
     16,
     22
    ]
   ],
   "sa": [
    [
     8,
     22
    ]
   ],
   "su": [
    [
     8,
     22
    ]
   ]
  },
  "web": "https://www.petservis.sk/"
 },
 {
  "id": "vetone-sliac",
  "name": "VetOne",
  "place": "Sliač",
  "address": "Hájnická 51, Sliač",
  "tel": "+421 911 681 168",
  "at": [
   48.61336,
   19.13652
  ],
  "hours": [
   19,
   31
  ],
  "exact": true,
  "fee": "po 24:00 30 €",
  "web": "http://www.vetone.info/"
 },
 {
  "id": "vetaxs-trencin",
  "name": "VETAXS",
  "place": "Trenčín",
  "address": "Električná 17, Trenčín",
  "tel": "+421 908 683 123",
  "at": [
   48.89061,
   18.03096
  ],
  "hours": [
   8,
   22
  ],
  "exact": true,
  "web": "http://vetaxs.sk/"
 },
 {
  "id": "foxyvet-trencin",
  "name": "FOXYVET",
  "place": "Trenčín",
  "address": "Štefánikova 86, Trenčín",
  "tel": "+421 950 581 282",
  "at": [
   48.89227,
   18.03875
  ],
  "hours": [
   9,
   22
  ],
  "fee": "50 €",
  "web": "http://www.foxyvet.sk/",
  "photo": {
   "src": "/vet/foxyvet-trencin.webp",
   "source": "http://www.foxyvet.sk/",
   "at": "2026-11-05"
  }
 },
 {
  "id": "vet-centrum-nitra",
  "name": "VET CENTRUM",
  "place": "Nitra",
  "address": "Akademická 3, Nitra",
  "tel": "+421 37 651 39 13",
  "at": [
   48.30418,
   18.10416
  ],
  "hours": [
   9,
   22
  ],
  "exact": true,
  "weekdays": true,
  "web": "http://www.veterinarnaklinikanitra.sk/",
  "photo": {
   "src": "/vet/vet-centrum-nitra.webp",
   "source": "http://www.veterinarnaklinikanitra.sk/",
   "at": "2026-11-05"
  }
 },
 {
  "id": "dkvet-dolny",
  "name": "DKVet",
  "place": "Dolný Kubín",
  "address": "Bysterecká 14, Dolný Kubín",
  "tel": "+421 948 881 733",
  "at": [
   49.21227,
   19.28693
  ],
  "hours": [
   6,
   22
  ],
  "exact": true,
  "web": "http://dkvet.sk/"
 },
 {
  "id": "klinika-animal-michalovce",
  "name": "Klinika Animal",
  "place": "Michalovce",
  "address": "Masarykova 25, Michalovce",
  "tel": "+421 948 168 592",
  "at": [
   48.75716,
   21.90932
  ],
  "hours": [
   8,
   20
  ],
  "exact": true,
  "sched": {
   "wk": [
    [
     18,
     20
    ]
   ],
   "sa": [
    [
     17,
     19
    ]
   ],
   "su": [
    [
     9,
     12
    ],
    [
     17,
     19
    ]
   ]
  },
  "clientsOnly": true,
  "note": "pack.sos.er.noteClients",
  "web": "http://www.animalcentrum.sk/"
 },
 {
  "id": "morvayova-vyjazdy-bratislava",
  "name": "MVDr. Morvayová, výjazdy",
  "place": "Bratislava a okolie",
  "address": "Bebravská, Bratislava",
  "tel": "+421 908 224 683",
  "at": [
   48.13956,
   17.21267
  ],
  "hours": "ask",
  "home": true,
  "fee": "po 16:00 30 €",
  "web": "https://www.vyjazdovyveterinar.sk/"
 },
 {
  "id": "veterinar-domov-mvdr-hilcanska-kosice",
  "name": "Veterinár domov, MVDr. Hilčanská",
  "place": "Košice a okolie",
  "address": "Košice a okolie",
  "tel": "+421 944 762 228",
  "at": [
   48.71897,
   21.27037
  ],
  "hours": "ask",
  "home": true,
  "fee": "35 €",
  "web": "http://www.veterinardomov.sk/"
 },
 {
  "id": "vetart-mvdr-halas-dolny",
  "name": "VetArt, MVDr. Halás",
  "place": "Dolný Ohaj a okolie",
  "address": "Hlavná 312/55, Dolný Ohaj",
  "tel": "+421 918 993 268",
  "at": [
   48.08269,
   18.24951
  ],
  "hours": "ask",
  "home": true,
  "web": "https://www.vetart.sk/"
 },
 {
  "id": "rhvet-martin",
  "name": "RHvet",
  "place": "Martin a okolie",
  "address": "Záturčianska 54, Martin",
  "tel": "+421 903 832 560",
  "at": [
   49.09455,
   18.91661
  ],
  "hours": "ask",
  "exact": true,
  "home": true,
  "fee": "20 €",
  "web": "https://rhvet.webnode.sk/"
 },
 {
  "id": "pet-medic-praha",
  "name": "Pet-Medic",
  "place": "Praha",
  "address": "Praha",
  "tel": "+420 724 184 840",
  "at": [
   50.075,
   14.437
  ],
  "hours": "nonstop",
  "home": true,
  "web": "https://www.pet-medic.cz/"
 },
 {
  "id": "sonda-praha",
  "name": "Sonda.cz",
  "place": "Praha a stredné Čechy",
  "address": "Pod Nuselskými schody 3, Praha 2",
  "tel": "+420 790 388 444",
  "at": [
   50.0694,
   14.4347
  ],
  "hours": [
   8,
   20
  ],
  "home": true,
  "web": "https://www.sonda.cz/"
 }
];

/** Navigácia: s overeným bodom podľa súradníc, inak podľa adresy. Bez čísla domu v adrese (výjazdy, „Praha“) null: nie je kam viesť. */
export type NavApp = 'google' | 'waze' | 'mapy';
export function vetNavUrl(app: NavApp, p: VetPlace): string | null {
  const [lat, lon] = p.at;
  const q = encodeURIComponent(p.address);
  if (p.exact) {
    if (app === 'google') return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    if (app === 'waze') return `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
    return `https://mapy.com/fnc/v1/route?end=${lon},${lat}&routeType=car_fast`;
  }
  if (!/\d/.test(p.address)) return null;
  if (app === 'google') return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  if (app === 'waze') return `https://waze.com/ul?q=${q}&navigate=yes`;
  return `https://mapy.com/zakladni?q=${q}`;
}

export const CITIES: { name: string; at: [number, number] }[] = [
  { name: 'Bratislava', at: [48.148, 17.107] }, { name: 'Trnava', at: [48.377, 17.588] }, { name: 'Nitra', at: [48.307, 18.086] },
  { name: 'Trenčín', at: [48.894, 18.04] }, { name: 'Žilina', at: [49.223, 18.739] }, { name: 'Banská Bystrica', at: [48.736, 19.146] },
  { name: 'Poprad', at: [49.059, 20.297] }, { name: 'Prešov', at: [48.998, 21.24] }, { name: 'Košice', at: [48.716, 21.261] },
  { name: 'Praha', at: [50.075, 14.437] },
];

/** Čas v Europe/Bratislava (aj pre Prahu: rovnaké pásmo), nezávisle od pásma telefónu. day 0 = nedeľa. */
function localParts(d: Date): { day: number; h: number } {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Bratislava', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d);
  const get = (t: string) => parts.find((x) => x.type === t)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, h: Number(get('hour')) + Number(get('minute')) / 60 };
}

function slotsFor(sched: NonNullable<VetPlace['sched']>, day: number) {
  return day === 0 ? sched.su : day === 6 ? sched.sa : sched.wk;
}

/** Hodina, do ktorej platí dnešná služba (práve bežiaca, inak posledná dnešná). Pre štítok „Do 20:00". */
export function closesAt(p: VetPlace, d: Date): number | null {
  if (typeof p.hours === 'string') return null;
  if (!p.sched) return p.hours[1];
  const { day, h } = localParts(d);
  const s = slotsFor(p.sched, day);
  return (s.find(([, b]) => h < b) ?? s[s.length - 1])?.[1] ?? null;
}

export function telAt(p: VetPlace, d: Date): string {
  const { h } = localParts(d);
  return p.telBy?.find((x) => h >= x.from && h < x.to)?.tel ?? p.tel;
}

/** Hodina, od ktorej dnes služba začína (ďalšia dnešná, inak prvá dnešná). */
export function opensAt(p: VetPlace, d: Date): number | null {
  if (typeof p.hours === 'string') return null;
  if (!p.sched) return p.hours[0];
  const { day, h } = localParts(d);
  const s = slotsFor(p.sched, day);
  return (s.find(([a]) => h < a) ?? s[0])?.[0] ?? null;
}

export function isOpenAt(p: VetPlace, d: Date): boolean {
  if (typeof p.hours === 'string') return true;
  const { day, h } = localParts(d);
  if (p.weekdays && (day === 0 || day === 6)) return false;
  if (p.sched) return slotsFor(p.sched, day).some(([a, b]) => h >= a && h < b);
  const [from, to] = p.hours;
  return to > 24 ? h >= from || h < to - 24 : h >= from && h < to;
}

export function distanceKm(a: [number, number], b: [number, number]): number {
  const r = (x: number) => (x * Math.PI) / 180;
  const dl = r(b[0] - a[0]); const dn = r(b[1] - a[1]);
  return 2 * 6371 * Math.asin(Math.sqrt(Math.sin(dl / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dn / 2) ** 2));
}
