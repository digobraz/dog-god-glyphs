// ⚙️ GENEROVANÉ — needituj ručne. Zdroj: plany/nakresy/pohotovost-karticka-2026-11-04/data-sk.json + data-cz.json (gen-vet-data.mjs).
// Veterinárna pohotovosť v SOS. SK: čísla z vlastných webov kliník, overené 5. 11. 2026 · CZ: data-cz.json (zber 21. 11. 2026, web + Google). V balíku appky, aby fungovali bez signálu.
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
  "web": "https://www.vetline.sk/",
  "photo": {
   "src": "/vet/vetline-24h-bratislava.webp",
   "source": "https://vetline.sk/",
   "at": "2026-11-05"
  },
  "google": {
   "rating": 4.4,
   "count": 729,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=VetLINE%2024H%20Staromestsk%C3%A1%206%2FD%20Bratislava"
  }
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
  "web": "https://www.smallvet.sk/",
  "google": {
   "rating": 4.2,
   "count": 135,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=SmallVet%20%C5%BDitn%C3%A1%2046%20Bratislava"
  }
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
  },
  "google": {
   "rating": 4.2,
   "count": 410,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=VetPoint%20Pan%C3%B3nska%20cesta%2038%20Bratislava"
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
  "web": "https://www.uvlf.sk/kliniky-sluzby/pohotovost",
  "google": {
   "rating": 4.6,
   "count": 672,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=Klinika%20mal%C3%BDch%20zvierat%20UVLF%20Ko%C5%A1ice"
  }
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
  "web": "http://www.veterinapoprad.sk/",
  "photo": {
   "src": "/vet/veterinarna-klinika-poprad.webp",
   "source": "https://veterinapoprad.sk/sk/",
   "at": "2026-11-05"
  },
  "google": {
   "rating": 4.7,
   "count": 152,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=Veterin%C3%A1rna%20klinika%20Hrani%C4%8Dn%C3%A1%2012%20Poprad"
  }
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
  },
  "google": {
   "rating": 4.8,
   "count": 154,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=veterin%C3%A1r%20Dominika%20Tatarku%205%20Poprad"
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
  },
  "google": {
   "rating": 4.9,
   "count": 172,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=Klinika%20F%C3%A9nix%20%C5%A0trkov%C3%A1%2010A%20%C5%BDilina"
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
  "web": "http://www.trivet.sk/",
  "photo": {
   "src": "/vet/tri-vet-cifer.webp",
   "source": "https://www.trivet.sk/veterinarna-klinika-cifer/",
   "at": "2026-11-05"
  },
  "google": {
   "rating": 4.7,
   "count": 269,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=Tri-Vet%20Kaplnsk%C3%A1%2014%20C%C3%ADfer"
  }
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
  },
  "google": {
   "rating": 4.8,
   "count": 104,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=SCAR%20Vet%20Sladovn%C3%ADcka%2022%20Trnava"
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
  "web": "http://www.petclinic.sk/",
  "google": {
   "rating": 4.7,
   "count": 163,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=Pet%20Clinic%20N%C3%A1bre%C5%BEie%20ml%C3%A1de%C5%BEe%2047%20Nitra"
  }
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
  },
  "google": {
   "rating": 4.3,
   "count": 31,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=Doktor%20Zvierat%20Vrbovsk%C3%A1%20cesta%2014%20Pie%C5%A1%C5%A5any"
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
  "web": "http://www.veterina-lives.sk/",
  "google": {
   "rating": 4.6,
   "count": 94,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=Klinika%20LiVeS%201.%20m%C3%A1ja%2075%20Liptovsk%C3%BD%20Mikul%C3%A1%C5%A1"
  }
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
  },
  "google": {
   "rating": 4.2,
   "count": 134,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=veterin%C3%A1r%20Vajansk%C3%A9ho%2018%20Topo%C4%BE%C4%8Dany"
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
  "web": "http://www.bebabelvet.sk/",
  "google": {
   "rating": 3.4,
   "count": 8,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=BeBaBel%20s.r.o.%20Levice"
  }
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
  },
  "google": {
   "rating": 4.3,
   "count": 277,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=MVDr.%20Szakall%20SNP%207%20Senec"
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
  },
  "google": {
   "rating": 4.8,
   "count": 78,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=Klinika%20E-VET%20Sadov%C3%A1%20588%20Kr%C3%A1%C4%BEov%C3%A1%20pri%20Senci"
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
  },
  "google": {
   "rating": 4.9,
   "count": 27,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=MVDr.%20Zbo%C5%88%C3%A1kov%C3%A1%20Aurela%20Stodolu%205307%20Martin"
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
  },
  "google": {
   "rating": 4.7,
   "count": 142,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=MyPet%20Clinic%20Mierov%C3%A1%2027%20Bratislava"
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
   "source": "https://www.cassovet.sk/o-nas/",
   "at": "2026-11-05"
  },
  "google": {
   "rating": 4.6,
   "count": 391,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=Cassovet%20Trieda%20KVP%207%20Ko%C5%A1ice"
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
  "web": "https://www.petservis.sk/",
  "google": {
   "rating": 4.4,
   "count": 259,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=PETSERVIS%20Sl%C3%A1dkovi%C4%8Dova%2022%20Bansk%C3%A1%20Bystrica"
  }
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
  "web": "http://www.vetone.info/",
  "google": {
   "rating": 4.8,
   "count": 74,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=VetOne%20H%C3%A1jnick%C3%A1%2051%20Slia%C4%8D"
  }
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
  "web": "http://vetaxs.sk/",
  "google": {
   "rating": 4.6,
   "count": 259,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=VETAXS%20Elektri%C4%8Dn%C3%A1%2017%20Tren%C4%8D%C3%ADn"
  }
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
  },
  "google": {
   "rating": 4.8,
   "count": 79,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=FOXYVET%20%C5%A0tef%C3%A1nikova%2086%20Tren%C4%8D%C3%ADn"
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
  },
  "google": {
   "rating": 4.6,
   "count": 241,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=VET%20CENTRUM%20Akademick%C3%A1%203%20Nitra"
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
  "web": "http://dkvet.sk/",
  "photo": {
   "src": "/vet/dkvet-dolny.webp",
   "source": "https://dkvet.sk/",
   "at": "2026-11-05"
  },
  "google": {
   "rating": 4.8,
   "count": 132,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=DKVet%20Bystereck%C3%A1%2014%20Doln%C3%BD%20Kub%C3%ADn"
  }
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
  "web": "http://www.animalcentrum.sk/",
  "photo": {
   "src": "/vet/klinika-animal-michalovce.webp",
   "source": "https://animalcentrum.sk/",
   "at": "2026-11-05"
  },
  "google": {
   "rating": 4.7,
   "count": 328,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=Klinika%20Animal%20Masarykova%2025%20Michalovce"
  }
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
  "web": "https://www.vyjazdovyveterinar.sk/",
  "google": {
   "rating": 5,
   "count": 37,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=MVDr.%20Morvayov%C3%A1%20v%C3%BDjazdov%C3%BD%20veterin%C3%A1r%20Bratislava"
  }
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
  "web": "http://www.veterinardomov.sk/",
  "google": {
   "rating": 5,
   "count": 3,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=Veterin%C3%A1r%20domov%20MVDr.%20Hil%C4%8Dansk%C3%A1%20Ko%C5%A1ice"
  }
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
  "web": "https://www.vetart.sk/",
  "photo": {
   "src": "/vet/vetart-mvdr-halas-dolny.webp",
   "source": "https://www.vetart.sk/",
   "at": "2026-11-05"
  },
  "google": {
   "rating": 4.8,
   "count": 54,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=VetArt%20MVDr.%20Hal%C3%A1s%20Doln%C3%BD%20Ohaj"
  }
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
  "web": "https://rhvet.webnode.sk/",
  "photo": {
   "src": "/vet/rhvet-martin.webp",
   "source": "https://rhvet.webnode.sk/",
   "at": "2026-11-05"
  },
  "google": {
   "rating": 4.8,
   "count": 83,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=RHvet%20Z%C3%A1tur%C4%8Dianska%2054%20Martin"
  }
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
  "web": "https://www.pet-medic.cz/",
  "photo": {
   "src": "/vet/pet-medic-praha.webp",
   "source": "https://www.pet-medic.cz/",
   "at": "2026-11-05"
  },
  "google": {
   "rating": 4.6,
   "count": 212,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=Pet-Medic%20veterin%C3%A1rn%C3%AD%20sanitka%20Praha"
  }
 },
 {
  "id": "sonda-praha",
  "name": "Sonda.cz",
  "place": "Praha a střední Čechy",
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
  "web": "https://www.sonda.cz/",
  "photo": {
   "src": "/vet/sonda-praha.webp",
   "source": "https://www.sonda.cz/vysetreni-na-klinice",
   "at": "2026-11-05"
  },
  "google": {
   "rating": 4.8,
   "count": 141,
   "at": "2026-11-05",
   "url": "https://www.google.com/maps/search/?api=1&query=Sonda.cz%20Pod%20Nuselsk%C3%BDmi%20schody%203%20Praha"
  }
 },
 {
  "id": "myvet-veterinarni-ordinace-sro-uhersky-brod",
  "name": "MYVET veterinární ordinace sro",
  "place": "Uherský Brod",
  "address": "1 Uherský Brod-Uherský Brod 1 CZ, Horní Valy 556, Uherský Brod-Uherský Brod 1",
  "tel": "+420 777067349",
  "at": [
   49.0257071,
   17.6499489
  ],
  "hours": "call",
  "web": "http://myvet.cz/",
  "photo": {
   "src": "/vet/myvet-veterinarni-ordinace-sro-uhersky-brod.webp",
   "source": "https://maps.google.com/?cid=2648437056888393638",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 5,
   "count": 17,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=2648437056888393638"
  }
 },
 {
  "id": "veterinarni-klinika-live-litomerice-litomerice",
  "name": "Veterinární Klinika Live Litoměřice",
  "place": "Litoměřice",
  "address": "1, Zelená 2184, Litoměřice-Litoměřice 1",
  "tel": "+420 603 325 538",
  "at": [
   50.5437114,
   14.1157935
  ],
  "hours": [
   7.5,
   8
  ],
  "sched": {
   "wk": [
    [
     7.5,
     8
    ],
    [
     18.5,
     22
    ]
   ],
   "sa": [
    [
     8,
     18
    ]
   ],
   "su": [
    [
     8,
     18
    ]
   ]
  },
  "fee": "18:30-22:00 - 1900 Kč",
  "web": "https://www.veterina-live.eu/index.php/kontakt/",
  "photo": {
   "src": "/vet/veterinarni-klinika-live-litomerice-litomerice.webp",
   "source": "https://maps.google.com/?cid=15886261511178553405",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.7,
   "count": 1126,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=15886261511178553405"
  }
 },
 {
  "id": "veterinarni-klinika-aeskulap-prostejov",
  "name": "Veterinární Klinika - Aeskulap",
  "place": "Prostějov",
  "address": "18, Jana Kuchaře 2781, Prostějov-Prostějov 1",
  "tel": "+420 602 521 578",
  "at": [
   49.4792044,
   17.1229637
  ],
  "hours": "call",
  "clientsOnly": true,
  "web": "https://veterina-prostejov.webnode.cz/",
  "google": {
   "rating": 4.4,
   "count": 191,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=15047254161798621730"
  }
 },
 {
  "id": "mvdr-jana-bednarska-decin",
  "name": "MVDr. Jana Bednarska",
  "place": "Děčín",
  "address": "2, Puchmayerova 299, Děčín-Děčín 2",
  "tel": "+420 728 721 328",
  "at": [
   50.78137460000001,
   14.205503
  ],
  "hours": "call",
  "web": "http://www.dcvet.cz/",
  "photo": {
   "src": "/vet/mvdr-jana-bednarska-decin.webp",
   "source": "http://www.dcvet.cz/",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.6,
   "count": 35,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=6811354709316834059"
  }
 },
 {
  "id": "veterinarni-osetrovna-alfavet-vratimov",
  "name": "Veterinární ošetřovna AlfaVet",
  "place": "Vratimov",
  "address": "21, Frýdecká 607, Vratimov-Vratimov 1",
  "tel": "+420 777185201",
  "at": [
   49.7739167,
   18.3057798
  ],
  "hours": [
   18,
   23
  ],
  "sched": {
   "wk": [
    [
     18,
     23
    ]
   ],
   "sa": [
    [
     17,
     23
    ]
   ],
   "su": [
    [
     17,
     23
    ]
   ]
  },
  "fee": "Pohotovostní služba je poskytována s příplatkem.",
  "web": "http://www.alfavet.cz/",
  "google": {
   "rating": 4.5,
   "count": 39,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=17331053383027262158"
  }
 },
 {
  "id": "veterinarni-osetrovna-novy-jicin-mvdr-novy-jicin",
  "name": "Veterinární ošetřovna Nový Jičín, MVDr. Jana Hečková",
  "place": "Nový Jičín",
  "address": "26, Jugoslávská 1006, Nový Jičín-Nový Jičín 1",
  "tel": "+420 775 100 774",
  "at": [
   49.5996052,
   18.015561599999998
  ],
  "hours": [
   8,
   22
  ],
  "sched": {
   "wk": [],
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
  "fee": "pro stávající klienty 1000 Kč",
  "web": "http://www.veterinanovyjicin.cz/",
  "photo": {
   "src": "/vet/veterinarni-osetrovna-novy-jicin-mvdr-novy-jicin.webp",
   "source": "https://maps.google.com/?cid=16260978314149906306",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.7,
   "count": 111,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=16260978314149906306"
  }
 },
 {
  "id": "veterinarni-klinika-ivet-praha-4",
  "name": "Veterinární klinika IVET",
  "place": "Praha 4",
  "address": "3, Ke Kamýku 996, Praha 4",
  "tel": "+420 241714358",
  "at": [
   50.0157228,
   14.4462823
  ],
  "hours": "call",
  "web": "https://www.veterinarni-klinika.net/",
  "photo": {
   "src": "/vet/veterinarni-klinika-ivet-praha-4.webp",
   "source": "https://maps.google.com/?cid=4927533791182318928",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.1,
   "count": 402,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=4927533791182318928"
  }
 },
 {
  "id": "veterina-visvet-mvdr-peter-dobrik-praha-20",
  "name": "Veterina Visvet - MVDr. Peter Dobrík",
  "place": "Praha 20",
  "address": "31, Domkovská 1484, Praha 20",
  "tel": "+420 777 708 177",
  "at": [
   50.1053533,
   14.610117800000001
  ],
  "hours": "call",
  "web": "http://www.visvet.cz/",
  "google": {
   "rating": 4.6,
   "count": 161,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=15734533814054614651"
  }
 },
 {
  "id": "veterinarni-ordinace-brno-vinohrady-mvdr-brno",
  "name": "Veterinární ordinace Brno Vinohrady MVDr. Boris Seman",
  "place": "Brno",
  "address": "3A, Pálavské nám. 4288, Brno-Vinohrady",
  "tel": "+420 544210718",
  "at": [
   49.206228599999996,
   16.6579652
  ],
  "hours": "call",
  "web": "http://www.veterina-seman.cz/",
  "photo": {
   "src": "/vet/veterinarni-ordinace-brno-vinohrady-mvdr-brno.webp",
   "source": "https://maps.google.com/?cid=440088448793134057",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.8,
   "count": 397,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=440088448793134057"
  }
 },
 {
  "id": "veterinarni-nemocnice-libus-praha",
  "name": "Veterinární nemocnice Libuš",
  "place": "Praha",
  "address": "45, Na šejdru 238, Praha-Libuš",
  "tel": "+420 244470553",
  "at": [
   50.0084083,
   14.4587471
  ],
  "hours": "ask",
  "web": "http://www.vetnemo.cz/",
  "photo": {
   "src": "/vet/veterinarni-nemocnice-libus-praha.webp",
   "source": "https://maps.google.com/?cid=469344064678975102",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 3.7,
   "count": 218,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=469344064678975102"
  }
 },
 {
  "id": "veterinarni-klinika-mvdr-pospisil-vyskov",
  "name": "Veterinární klinika MVDr. Pospíšil Vlastimil",
  "place": "Vyškov",
  "address": "63, Puškinova 409, Nosálovice, Vyškov-Vyškov 1",
  "tel": "+420 603223340",
  "at": [
   49.2768695,
   16.982623999999998
  ],
  "hours": [
   7,
   22
  ],
  "sched": {
   "wk": [
    [
     7,
     22
    ]
   ],
   "sa": [
    [
     7,
     22
    ]
   ],
   "su": [
    [
     7,
     22
    ]
   ]
  },
  "fee": "SLUŽBA JE ZPOPLATNĚNA POHOTOVOSTNÍM PŘÍPLATKEM.",
  "web": "http://www.veterina-vyskov.cz/",
  "photo": {
   "src": "/vet/veterinarni-klinika-mvdr-pospisil-vyskov.webp",
   "source": "https://www.veterina-vyskov.cz/",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 5,
   "count": 72,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=768267595074970595"
  }
 },
 {
  "id": "mvdr-kristyna-lutovska-brno",
  "name": "MVDr. Kristýna Lutovská",
  "place": "Brno",
  "address": "75A, Oblá 518, Brno-Nový Lískovec",
  "tel": "+420 777 679 000",
  "at": [
   49.176237199999996,
   16.553161799999998
  ],
  "hours": [
   19,
   23
  ],
  "sched": {
   "wk": [
    [
     19,
     23
    ]
   ],
   "sa": [
    [
     0,
     24
    ]
   ],
   "su": [
    [
     0,
     24
    ]
   ]
  },
  "web": "http://www.drhladik.cz/",
  "photo": {
   "src": "/vet/mvdr-kristyna-lutovska-brno.webp",
   "source": "https://www.drhladik.cz/",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 5,
   "count": 5,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=7611207939930018595"
  }
 },
 {
  "id": "mvdr-tomas-malina-senov-u-noveho-jicina",
  "name": "MVDr. Tomáš Malina",
  "place": "Šenov u Nového Jičína",
  "address": "Anenská 367, Šenov u Nového Jičína",
  "tel": "+420 603 462 984",
  "at": [
   49.599689999999995,
   18.0006541
  ],
  "hours": "ask",
  "fee": "pohotovostní příplatek ve výši 1000,-Kč",
  "web": "http://www.veterina-anenska.cz/",
  "photo": {
   "src": "/vet/mvdr-tomas-malina-senov-u-noveho-jicina.webp",
   "source": "http://www.veterina-anenska.cz/",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.8,
   "count": 271,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=4307433424689519092"
  }
 },
 {
  "id": "pet-medic-beranovych-praha",
  "name": "Pet-medic",
  "place": "Praha",
  "address": "Beranových 130, Praha-Praha 18",
  "tel": "+420 724184840",
  "at": [
   50.1317786,
   14.512528500000002
  ],
  "hours": "call",
  "home": true,
  "web": "https://pet-medic.cz/",
  "photo": {
   "src": "/vet/pet-medic-beranovych-praha.webp",
   "source": "https://pet-medic.cz/",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.6,
   "count": 213,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=4159883349971513584"
  }
 },
 {
  "id": "veterinarni-ordinace-tisnov-mvdr-viktor-tisnov",
  "name": "Veterinární Ordinace Tišnov - MVDr. Viktor Dvořák",
  "place": "Tišnov",
  "address": "Brněnská 159, Tišnov-Tišnov 1",
  "tel": "+420 732 761 681",
  "at": [
   49.346032,
   16.424177999999998
  ],
  "hours": "call",
  "web": "http://vet-tisnov.cz/",
  "photo": {
   "src": "/vet/veterinarni-ordinace-tisnov-mvdr-viktor-tisnov.webp",
   "source": "https://maps.google.com/?cid=6992810954680069597",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.9,
   "count": 289,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=6992810954680069597"
  }
 },
 {
  "id": "mvdr-ivan-stuchlik-pohorelice",
  "name": "MVDr. Ivan Stuchlík",
  "place": "Pohořelice",
  "address": "Brněnská 352, Pohořelice",
  "tel": "+420 603 425 646",
  "at": [
   48.9843731,
   16.528875799999998
  ],
  "hours": "call",
  "web": "http://www.veterina-stuchlik.cz/",
  "google": {
   "rating": 4.7,
   "count": 146,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=4505252243282340515"
  }
 },
 {
  "id": "veterinarni-klinika-alfavet-frydek",
  "name": "Veterinární klinika AlfaVet",
  "place": "Frýdek",
  "address": "Bruzovská 1852, Frýdek-Místek",
  "tel": "+420 558632435",
  "at": [
   49.6906591,
   18.3606631
  ],
  "hours": [
   18,
   23
  ],
  "sched": {
   "wk": [
    [
     18,
     23
    ]
   ],
   "sa": [
    [
     17,
     23
    ]
   ],
   "su": [
    [
     17,
     23
    ]
   ]
  },
  "web": "http://www.alfavet.cz/",
  "photo": {
   "src": "/vet/veterinarni-klinika-alfavet-frydek.webp",
   "source": "https://maps.google.com/?cid=1978503331919838746",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.4,
   "count": 347,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=1978503331919838746"
  }
 },
 {
  "id": "veterinarni-ordinace-valasske-klobouky-valasske-klobouky",
  "name": "Veterinární ordinace Valašské Klobouky",
  "place": "Valašské Klobouky",
  "address": "Československé armády, za Lidlem 1090, Valašské Klobouky",
  "tel": "+420 775 943 827",
  "at": [
   49.139079699999996,
   18.0115171
  ],
  "hours": "call",
  "web": "http://www.veterinavk.cz/",
  "google": {
   "rating": 5,
   "count": 25,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=8412154492486871094"
  }
 },
 {
  "id": "veterinarni-klinika-vyvet-s-r-o-vyskov",
  "name": "Veterinární klinika Vyvet s.r.o.",
  "place": "Vyškov",
  "address": "Dědická 680/27A, Vyškov-Vyškov 1",
  "tel": "+420 517 330 436",
  "at": [
   49.283844699999996,
   16.987729899999998
  ],
  "hours": "call",
  "web": "http://www.veterinar-vyskov.cz/",
  "photo": {
   "src": "/vet/veterinarni-klinika-vyvet-s-r-o-vyskov.webp",
   "source": "https://maps.google.com/?cid=4256900669351870768",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.4,
   "count": 120,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=4256900669351870768"
  }
 },
 {
  "id": "veterinarni-klinika-erika-nemocnice-praha-7",
  "name": "Veterinární klinika Erika nemocnice",
  "place": "Praha 7",
  "address": "Dělnická 12, Praha 7-Holešovice",
  "tel": "+420 284821784",
  "at": [
   50.102764500000006,
   14.4467077
  ],
  "hours": "ask",
  "web": "https://vet-klin-erika.cz/",
  "google": {
   "rating": 4.3,
   "count": 1599,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=5005510079850297293"
  }
 },
 {
  "id": "veterinarni-ordinace-veverska-bityska-veverska-bityska",
  "name": "Veterinární ordinace Veverská Bítýška - MVDr. Viktor Dvořák",
  "place": "Veverská Bítýška",
  "address": "Dlouhá 305, Veverská Bítýška",
  "tel": "+420 732 761 681",
  "at": [
   49.2756494,
   16.443187299999998
  ],
  "hours": "call",
  "web": "http://www.vet-tisnov.cz/",
  "google": {
   "rating": 4.9,
   "count": 61,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=11172051393346491999"
  }
 },
 {
  "id": "dravet-veterinarni-ordinace-drasov-drasov",
  "name": "Dravet - veterinární ordinace Drásov",
  "place": "Drásov",
  "address": "Drásov č. ev. 32, Drásov",
  "tel": "+420 727 833 816",
  "at": [
   49.3323702,
   16.4787331
  ],
  "hours": [
   8,
   21
  ],
  "sched": {
   "wk": [
    [
     8,
     21
    ]
   ],
   "sa": [
    [
     8,
     21
    ]
   ],
   "su": [
    [
     8,
     21
    ]
   ]
  },
  "web": "https://www.veterinadrasov.cz/",
  "photo": {
   "src": "/vet/dravet-veterinarni-ordinace-drasov-drasov.webp",
   "source": "https://maps.google.com/?cid=18168125861996477063",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 5,
   "count": 58,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=18168125861996477063"
  }
 },
 {
  "id": "veterinarni-klinika-jhvet-jindrichuv-hradec",
  "name": "Veterinární klinika JHvet",
  "place": "Jindřichův Hradec",
  "address": "Družstevní 242, Jindřichův Hradec-Jindřichův Hradec 1",
  "tel": "+420 608 753 537",
  "at": [
   49.154041899999996,
   14.998423100000002
  ],
  "hours": "call",
  "web": "http://www.jhvet.cz/",
  "photo": {
   "src": "/vet/veterinarni-klinika-jhvet-jindrichuv-hradec.webp",
   "source": "https://maps.google.com/?cid=9359003856215446671",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.9,
   "count": 85,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=9359003856215446671"
  }
 },
 {
  "id": "rpvet-veterinarni-klinika-a-prodejna-plzen",
  "name": "RPVET veterinární klinika a prodejna krmiv a veterinárních diet.",
  "place": "Plzeň",
  "address": "Dvořákova 1181/9, Plzeň-Plzeň 3",
  "tel": "+420 777 802 165",
  "at": [
   49.7277412,
   13.3690424
  ],
  "hours": [
   9,
   21
  ],
  "sched": {
   "wk": [],
   "sa": [
    [
     9,
     21
    ]
   ],
   "su": [
    [
     9,
     21
    ]
   ]
  },
  "web": "https://rpvet.cz/",
  "photo": {
   "src": "/vet/rpvet-veterinarni-klinika-a-prodejna-plzen.webp",
   "source": "https://maps.google.com/?cid=121037887172138406",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.4,
   "count": 488,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=121037887172138406"
  }
 },
 {
  "id": "skavet-veterinarni-centrum-mvdr-jan-ceska-skalice",
  "name": "Skavet veterinární centrum, MVDr. Jan Čermák",
  "place": "Česká Skalice",
  "address": "E. Beneše 470, Česká Skalice",
  "tel": "+420 774 510 159",
  "at": [
   50.3954673,
   16.0388897
  ],
  "hours": "call",
  "web": "https://www.skavet.cz/",
  "google": {
   "rating": 4.8,
   "count": 322,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=15378722369409413013"
  }
 },
 {
  "id": "veterinarni-klinika-ctvet-cesky-tesin",
  "name": "Veterinární klinika CTVET",
  "place": "Český Těšín",
  "address": "Frýdecká 1876, Český Těšín-Český Těšín 1",
  "tel": "+420 734 232 575",
  "at": [
   49.739954,
   18.613163
  ],
  "hours": "ask",
  "fee": "Příplatek za ošetření mimo ordinační hodiny je 2500 Kč vč DPH plus cestovné.",
  "web": "http://www.ctvet.cz/",
  "photo": {
   "src": "/vet/veterinarni-klinika-ctvet-cesky-tesin.webp",
   "source": "https://maps.google.com/?cid=4284379452190178570",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.8,
   "count": 487,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=4284379452190178570"
  }
 },
 {
  "id": "mvdr-ivo-svoboda-veterinaria-liberec",
  "name": "MVDr. Ivo Svoboda - VETERINARIA",
  "place": "Liberec",
  "address": "Hodkovická 52/52, Liberec",
  "tel": "+420 602 473 573",
  "at": [
   50.7426189,
   15.058170800000001
  ],
  "hours": "call",
  "web": "http://www.veterinaria.cz/",
  "google": {
   "rating": 4.2,
   "count": 6,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=16471274785921178301"
  }
 },
 {
  "id": "veterina-hodov-mvdr-jaroslav-chyba-hodov",
  "name": "Veterina Hodov - MVDr. Jaroslav Chyba",
  "place": "Hodov",
  "address": "Hodov 9, Hodov",
  "tel": "+420 734305398",
  "at": [
   49.2937138,
   15.985082299999998
  ],
  "hours": "call",
  "fee": "Pohotovostní příplatek_________________________500 - 1000 Kč",
  "web": "https://veterinahodov.cz/",
  "photo": {
   "src": "/vet/veterina-hodov-mvdr-jaroslav-chyba-hodov.webp",
   "source": "https://veterinahodov.cz/",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 5,
   "count": 9,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=5610680056502221813"
  }
 },
 {
  "id": "pet-doc-s-r-o-hodonin",
  "name": "Pet Doc s.r.o.",
  "place": "Hodonín",
  "address": "Horní Plesová 4573, Hodonín-Hodonín 1",
  "tel": "+420 777 757 071",
  "at": [
   48.855513099999996,
   17.133917999999998
  ],
  "hours": "ask",
  "web": "https://www.petdoc.cz/",
  "photo": {
   "src": "/vet/pet-doc-s-r-o-hodonin.webp",
   "source": "https://maps.google.com/?cid=4916119098748587651",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.8,
   "count": 77,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=4916119098748587651"
  }
 },
 {
  "id": "aa-vet-veterinarni-nemocnice-praha-10",
  "name": "AA-Vet - Veterinární nemocnice",
  "place": "Praha 10",
  "address": "Chmelová 3316/6b, Praha 10 - Zahradní město-Praha 10",
  "tel": "+420 604 242 789",
  "at": [
   50.0590124,
   14.4971448
  ],
  "hours": "ask",
  "web": "http://www.aavet.cz/",
  "photo": {
   "src": "/vet/aa-vet-veterinarni-nemocnice-praha-10.webp",
   "source": "https://maps.google.com/?cid=4409651646215498363",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.5,
   "count": 1872,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=4409651646215498363"
  }
 },
 {
  "id": "ress-dalibor-mvdr-frydek",
  "name": "Ress Dalibor MVDr.",
  "place": "Frýdek",
  "address": "J. Suka 1753, Frýdek-Místek-Frýdek-Místek 1",
  "tel": "+420 732222999",
  "at": [
   49.6698872,
   18.3482326
  ],
  "hours": "call",
  "web": "http://www.ress-veterinar.cz/",
  "google": {
   "rating": 4.6,
   "count": 171,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=5080741707376620884"
  }
 },
 {
  "id": "veterinarni-ordinace-horackova-mvdr-veseli-nad-luznici",
  "name": "Veterinární Ordinace - Horáčková MVDr.",
  "place": "Veselí nad Lužnicí",
  "address": "Jateční 42, Veselí nad Lužnicí-Veselí nad Lužnicí 1",
  "tel": "+420 733358439",
  "at": [
   49.188057199999996,
   14.706322400000001
  ],
  "hours": "call",
  "web": "https://vetveseli.webnode.cz/",
  "google": {
   "rating": 4.7,
   "count": 106,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=7751496729425359800"
  }
 },
 {
  "id": "just-robert-mvdr-brno",
  "name": "Just Robert MVDr.",
  "place": "Brno",
  "address": "Jihomoravské nám. 1098/1, Brno-Slatina",
  "tel": "+420 723 523 960",
  "at": [
   49.179069899999995,
   16.6843212
  ],
  "hours": "ask",
  "web": "https://www.vet-just.cz/?utm_source=GoogleMojeFirma&utm_medium=organic&utm_campaign=google_profil_mojefirma",
  "photo": {
   "src": "/vet/just-robert-mvdr-brno.webp",
   "source": "https://maps.google.com/?cid=4681772077961257504",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4,
   "count": 68,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=4681772077961257504"
  }
 },
 {
  "id": "veterina-pohotovost-brno-veterinarni-brno",
  "name": "Veterina pohotovost Brno, veterinární pohotovost",
  "place": "Brno",
  "address": "Jihomoravské nám., Brno-Slatina",
  "tel": "+420 723 523 960",
  "at": [
   49.1795656,
   16.685986
  ],
  "hours": "ask",
  "web": "http://www.pohotovost-veterina.cz/kontakty/"
 },
 {
  "id": "veterinarni-nemocnice-stodulky-praha-13",
  "name": "Veterinární nemocnice Stodůlky",
  "place": "Praha 13",
  "address": "K Hájům 2671/8, Praha 13",
  "tel": "+420 251511651",
  "at": [
   50.0572727,
   14.323887599999999
  ],
  "hours": [
   8,
   24
  ],
  "sched": {
   "wk": [
    [
     8,
     24
    ]
   ],
   "sa": [
    [
     8,
     24
    ]
   ],
   "su": [
    [
     8,
     24
    ]
   ]
  },
  "fee": "příplatek 1500 Kč",
  "web": "http://www.vetcentrum.cz/",
  "google": {
   "rating": 4.5,
   "count": 692,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=2883641745287298493"
  }
 },
 {
  "id": "veterinarni-klinika-kleisslova-plzen-1",
  "name": "Veterinární klinika Kleisslova",
  "place": "Plzeň 1",
  "address": "Kleisslova 228/7, Plzeň 1-Severní Předměstí",
  "tel": "+420 377533461",
  "at": [
   49.7564724,
   13.372495299999999
  ],
  "hours": [
   18,
   22
  ],
  "sched": {
   "wk": [
    [
     18,
     22
    ]
   ],
   "sa": [
    [
     8,
     15
    ]
   ],
   "su": [
    [
     14,
     22
    ]
   ]
  },
  "web": "https://www.veterinakleisslova.cz/",
  "photo": {
   "src": "/vet/veterinarni-klinika-kleisslova-plzen-1.webp",
   "source": "https://maps.google.com/?cid=5343691580013488123",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.2,
   "count": 357,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=5343691580013488123"
  }
 },
 {
  "id": "veterinarni-nemocnice-cesky-brod-cesky-brod",
  "name": "Veterinární nemocnice Český Brod",
  "place": "Český Brod",
  "address": "Klučovská 1280, Český Brod",
  "tel": "+420 321 622 460",
  "at": [
   50.0809313,
   14.874653299999999
  ],
  "hours": "onsite",
  "web": "https://vetnem.cz/",
  "photo": {
   "src": "/vet/veterinarni-nemocnice-cesky-brod-cesky-brod.webp",
   "source": "https://vetnem.cz/",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.3,
   "count": 658,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=4546846420507643956"
  }
 },
 {
  "id": "veterinarni-ordinace-klatovy-klatovy",
  "name": "Veterinární ordinace Klatovy",
  "place": "Klatovy",
  "address": "Koldinova 272, Klatovy-Klatovy 1",
  "tel": "+420 378605663",
  "at": [
   49.4019445,
   13.288343399999999
  ],
  "hours": [
   17.5,
   22
  ],
  "sched": {
   "wk": [
    [
     17.5,
     22
    ]
   ],
   "sa": [
    [
     9,
     22
    ]
   ],
   "su": [
    [
     9,
     22
    ]
   ]
  },
  "web": "https://www.veterinakoldinova.cz/",
  "photo": {
   "src": "/vet/veterinarni-ordinace-klatovy-klatovy.webp",
   "source": "https://veterinakoldinova.cz/",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.3,
   "count": 165,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=4689917293736648974"
  }
 },
 {
  "id": "mvdr-kostal-lanskroun",
  "name": "MVDr. Košťál",
  "place": "Lanškroun",
  "address": "Králická 704, Žichlínské Předměstí, Lanškroun",
  "tel": "+420 733616927",
  "at": [
   49.9165372,
   16.6179645
  ],
  "hours": "call",
  "clientsOnly": true,
  "web": "https://www.vet-ct.cz/cz/index.php/lanskroun",
  "photo": {
   "src": "/vet/mvdr-kostal-lanskroun.webp",
   "source": "https://www.vet-ct.cz/cz/index.php/lanskroun",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 5,
   "count": 2,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=2331106729212805955"
  }
 },
 {
  "id": "veterinarni-klinika-zvire-brno",
  "name": "Veterinární klinika Zvíře+",
  "place": "Brno",
  "address": "Krkoškova 6, Brno-Brno-sever",
  "tel": "+420 778 011 112",
  "at": [
   49.21860170000001,
   16.626859
  ],
  "hours": "call",
  "web": "https://www.zvireplus.cz/",
  "photo": {
   "src": "/vet/veterinarni-klinika-zvire-brno.webp",
   "source": "https://maps.google.com/?cid=18431065267700538585",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.4,
   "count": 136,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=18431065267700538585"
  }
 },
 {
  "id": "verivet-brno",
  "name": "Verivet",
  "place": "Brno",
  "address": "Krkoškova 6, Brno-sever",
  "tel": "+420 778 011 112",
  "at": [
   49.218539899999996,
   16.6268612
  ],
  "hours": "call",
  "web": "https://veterinarkabrno.cz/",
  "google": {
   "rating": 4.2,
   "count": 10,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=5435504285180757309"
  }
 },
 {
  "id": "zoovet-vaclav-bartos-hradec-kralove",
  "name": "ZOOVET - Václav Bartoš",
  "place": "Hradec Králové",
  "address": "Labská louka 650, Třebeš, Hradec Králové-Hradec Králové 11",
  "tel": "+420 495262144",
  "at": [
   50.1841909,
   15.827348599999999
  ],
  "hours": [
   20,
   24
  ],
  "sched": {
   "wk": [
    [
     20,
     24
    ]
   ],
   "sa": [],
   "su": []
  },
  "web": "http://www.zoovet.cz/",
  "photo": {
   "src": "/vet/zoovet-vaclav-bartos-hradec-kralove.webp",
   "source": "https://maps.google.com/?cid=2750551801108203317",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.8,
   "count": 479,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=2750551801108203317"
  }
 },
 {
  "id": "veterinarni-ordinace-veticum-lochenice",
  "name": "Veterinární ordinace Veticum",
  "place": "Lochenice",
  "address": "Lochenice 221, Lochenice",
  "tel": "+420 603189888",
  "at": [
   50.271046299999995,
   15.819462199999998
  ],
  "hours": [
   18,
   32
  ],
  "sched": {
   "wk": [
    [
     18,
     32
    ]
   ],
   "sa": [
    [
     0,
     24
    ]
   ],
   "su": [
    [
     0,
     24
    ]
   ]
  },
  "web": "https://www.veticum.cz/",
  "photo": {
   "src": "/vet/veterinarni-ordinace-veticum-lochenice.webp",
   "source": "https://maps.google.com/?cid=2207666499682868121",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 5,
   "count": 48,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=2207666499682868121"
  }
 },
 {
  "id": "albavet-s-r-o-ujezd-u-brna",
  "name": "AlbaVet s.r.o.",
  "place": "Újezd u Brna",
  "address": "Masarykova 701, Šternov, Újezd u Brna",
  "tel": "+420 770626049",
  "at": [
   49.101555,
   16.7542764
  ],
  "hours": [
   6,
   22
  ],
  "sched": {
   "wk": [],
   "sa": [
    [
     6,
     22
    ]
   ],
   "su": [
    [
     6,
     22
    ]
   ]
  },
  "fee": "Pohotovostní příplatek 1000 Kč.",
  "web": "http://www.albavet.cz/",
  "photo": {
   "src": "/vet/albavet-s-r-o-ujezd-u-brna.webp",
   "source": "https://maps.google.com/?cid=15954198874786836708",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.9,
   "count": 52,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=15954198874786836708"
  }
 },
 {
  "id": "veterinarni-nemocnice-a-ambulance-praha-8",
  "name": "Veterinární nemocnice a ambulance",
  "place": "Praha 8",
  "address": "Maškova, Praha 8",
  "tel": "+420 604 242 789",
  "at": [
   50.132638400000005,
   14.451071799999998
  ],
  "hours": "onsite",
  "web": "http://www.veterinarni-lekar.eu/category/napsali-o-nas/"
 },
 {
  "id": "veterinarni-klinika-helion-mvdr-daniel-usti-nad-labem",
  "name": "Veterinární Klinika Helion - MVDr. Daniel Petrák",
  "place": "Ústí nad Labem",
  "address": "město, centrum, Pod Holoměří 3116/2, Ústí nad Labem-město-Ústí nad Labem-centrum",
  "tel": "+420 606 511 357",
  "at": [
   50.6733762,
   14.021441699999999
  ],
  "hours": [
   14,
   22
  ],
  "sched": {
   "wk": [],
   "sa": [
    [
     14,
     22
    ]
   ],
   "su": [
    [
     14,
     22
    ]
   ]
  },
  "web": "http://www.veterinahelion.cz/",
  "photo": {
   "src": "/vet/veterinarni-klinika-helion-mvdr-daniel-usti-nad-labem.webp",
   "source": "https://maps.google.com/?cid=12536537273187925876",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.8,
   "count": 802,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=12536537273187925876"
  }
 },
 {
  "id": "mvdr-vlastimil-filas-mladosovice",
  "name": "MVDr. Vlastimil Filás",
  "place": "Mladošovice",
  "address": "Mladošovice 64, Mladošovice",
  "tel": "+420 607 666 598",
  "at": [
   48.9401438,
   14.6988716
  ],
  "hours": "call",
  "web": "http://www.veterina-filas.cz/",
  "google": {
   "rating": 4.6,
   "count": 12,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=9225884065114471452"
  }
 },
 {
  "id": "mvdr-vlastimil-pospisil-ivanovice-na-hane",
  "name": "MVDr. Vlastimil Pospíšil",
  "place": "Ivanovice na Hané",
  "address": "Mlýnská 367/4, Ivanovice na Hané",
  "tel": "+420 517363082",
  "at": [
   49.3044374,
   17.090241199999998
  ],
  "hours": [
   7,
   22
  ],
  "sched": {
   "wk": [
    [
     7,
     22
    ]
   ],
   "sa": [
    [
     7,
     22
    ]
   ],
   "su": [
    [
     7,
     22
    ]
   ]
  },
  "web": "http://veterina-vyskov.cz/",
  "photo": {
   "src": "/vet/mvdr-vlastimil-pospisil-ivanovice-na-hane.webp",
   "source": "https://www.veterina-vyskov.cz/",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.9,
   "count": 90,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=15274701310255410380"
  }
 },
 {
  "id": "mvdr-ondrej-ryba-morkuvky",
  "name": "MVDr. Ondřej Ryba",
  "place": "Morkůvky",
  "address": "Morkůvky 32, Morkůvky",
  "tel": "+420 723 762 868",
  "at": [
   48.964393099999995,
   16.8616706
  ],
  "hours": [
   19,
   30
  ],
  "sched": {
   "wk": [
    [
     19,
     30
    ]
   ],
   "sa": [
    [
     0,
     24
    ]
   ],
   "su": [
    [
     0,
     24
    ]
   ]
  },
  "web": "http://www.rybavet.cz/",
  "photo": {
   "src": "/vet/mvdr-ondrej-ryba-morkuvky.webp",
   "source": "https://maps.google.com/?cid=641885080498824931",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.7,
   "count": 21,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=641885080498824931"
  }
 },
 {
  "id": "vetnemo-en-praha-4",
  "name": "VETNEMO EN",
  "place": "Praha 4",
  "address": "Na šejdru 45, Praha 4",
  "tel": "+420 244470704",
  "at": [
   50.008396399999995,
   14.4586796
  ],
  "hours": "ask",
  "web": "http://vetnemo.cz/",
  "google": {
   "rating": 4.5,
   "count": 48,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=7437528805058172724"
  }
 },
 {
  "id": "veterinarni-klinika-veticea-dolni-lutyne",
  "name": "Veterinární klinika VETICEA",
  "place": "Dolní Lutyně",
  "address": "Na Výšině 1002, Dolní Lutyně",
  "tel": "+420 776 015 533",
  "at": [
   49.8864247,
   18.4298651
  ],
  "hours": "ask",
  "web": "http://www.veticea.cz/",
  "google": {
   "rating": 4.8,
   "count": 397,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=11424017403399293418"
  }
 },
 {
  "id": "veterinarni-osetrovna-alfavet-paskov",
  "name": "Veterinární ošetřovna AlfaVet",
  "place": "Paskov",
  "address": "Nádražní 700, Paskov",
  "tel": "+420 777185200",
  "at": [
   49.732832099999996,
   18.2937644
  ],
  "hours": [
   18,
   23
  ],
  "sched": {
   "wk": [
    [
     18,
     23
    ]
   ],
   "sa": [
    [
     17,
     23
    ]
   ],
   "su": [
    [
     17,
     23
    ]
   ]
  },
  "web": "http://www.alfavet.cz/",
  "google": {
   "rating": 4.6,
   "count": 9,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=5752592234714156982"
  }
 },
 {
  "id": "mvdr-vladimir-ondrej-brozek-vet-ordinace-dobris",
  "name": "MVDr. Vladimír Ondřej Brožek - vet. ordinace + salon pro psy",
  "place": "Dobříš",
  "address": "nám. Komenského 536, Dobříš",
  "tel": "+420 603 332 053",
  "at": [
   49.780691999999995,
   14.1727268
  ],
  "hours": "call",
  "web": "http://www.veterina-online.cz/mvdr-vladimir-ondrej-brozek-vet-ordinace--salon-pro-psy/",
  "photo": {
   "src": "/vet/mvdr-vladimir-ondrej-brozek-vet-ordinace-dobris.webp",
   "source": "https://maps.google.com/?cid=7108987660781441656",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.2,
   "count": 53,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=7108987660781441656"
  }
 },
 {
  "id": "nespor-jindrich-mvdr-klinika-brno",
  "name": "Nešpor Jindřich MVDr. - Klinika",
  "place": "Brno",
  "address": "Neklež 19, Brno-Líšeň",
  "tel": "+420 602 945 769",
  "at": [
   49.202489500000006,
   16.681606
  ],
  "hours": "call",
  "web": "http://www.veterinanespor.cz/",
  "photo": {
   "src": "/vet/nespor-jindrich-mvdr-klinika-brno.webp",
   "source": "https://maps.google.com/?cid=16091753560095100497",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.7,
   "count": 149,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=16091753560095100497"
  }
 },
 {
  "id": "veterinarni-klinika-mvdr-jaromir-stursa-havlickuv-brod",
  "name": "Veterinární Klinika - MVDr. Jaromír Štursa",
  "place": "Havlíčkův Brod",
  "address": "Nerudova 2258, Havlíčkův Brod-Havlíčkův Brod 1",
  "tel": "+420 604 569 831",
  "at": [
   49.607440999999994,
   15.569225999999997
  ],
  "hours": "call",
  "web": "http://www.veterinahb.cz/",
  "photo": {
   "src": "/vet/veterinarni-klinika-mvdr-jaromir-stursa-havlickuv-brod.webp",
   "source": "https://maps.google.com/?cid=16850891175355328248",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.8,
   "count": 365,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=16850891175355328248"
  }
 },
 {
  "id": "veterinarni-klinika-karakal-tabor",
  "name": "Veterinární klinika Karakal",
  "place": "Tábor",
  "address": "Petrohradská 2909, Tábor-Tábor 3",
  "tel": "+420 602 554 246",
  "at": [
   49.420549799999996,
   14.6451058
  ],
  "hours": "ask",
  "web": "http://www.vetkarakal.cz/",
  "google": {
   "rating": 4.7,
   "count": 392,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=4784173514872983425"
  }
 },
 {
  "id": "veterinar-domu-brno-vet-brno-12",
  "name": "VETERINÁŘ DOMŮ BRNO +VET",
  "place": "Brno 12",
  "address": "pouze skladové místo, Kumpoštova 12/198, Brno 12",
  "tel": "+420 731750840",
  "at": [
   49.2297772,
   16.6079714
  ],
  "hours": "call",
  "home": true,
  "web": "https://plusvet.cz/",
  "google": {
   "rating": 4.8,
   "count": 245,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=16401325575185555221"
  }
 },
 {
  "id": "veterinarni-klinika-mvdr-radomir-uherske-hradiste",
  "name": "Veterinární klinika - MVDr. Radomír Mlejnský",
  "place": "Uherské Hradiště",
  "address": "Revoluční 1506, Uherské Hradiště-Uherské Hradiště 6",
  "tel": "+420 725 761 501",
  "at": [
   49.0652847,
   17.457071799999998
  ],
  "hours": [
   17,
   22
  ],
  "sched": {
   "wk": [
    [
     17,
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
  "web": "http://www.veterinamlejnsky.cz/",
  "photo": {
   "src": "/vet/veterinarni-klinika-mvdr-radomir-uherske-hradiste.webp",
   "source": "https://maps.google.com/?cid=6661430463757525339",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.6,
   "count": 228,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=6661430463757525339"
  }
 },
 {
  "id": "vm-vet-s-r-o-breclav",
  "name": "VM vet s.r.o.",
  "place": "Břeclav",
  "address": "Slovácká 50, Břeclav-Břeclav 2",
  "tel": "+420 777 002 549",
  "at": [
   48.7560918,
   16.8929184
  ],
  "hours": "call",
  "web": "http://www.vmvet.cz/",
  "photo": {
   "src": "/vet/vm-vet-s-r-o-breclav.webp",
   "source": "https://vmvet.cz/",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.2,
   "count": 74,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=5886151305854082393"
  }
 },
 {
  "id": "mvdr-josef-stach-dobruska",
  "name": "MVDr. Josef Štach",
  "place": "Dobruška",
  "address": "Solnická 1012, Dobruška",
  "tel": "+420 603 253 254",
  "at": [
   50.288864000000004,
   16.165539
  ],
  "hours": "call",
  "fee": "POHOTOVOSTNÍ PŘÍPLATEK 1.000,- Kč",
  "web": "http://www.veterinadobruska.cz/",
  "photo": {
   "src": "/vet/mvdr-josef-stach-dobruska.webp",
   "source": "https://www.veterinadobruska.cz/",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.7,
   "count": 144,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=12264563437606235744"
  }
 },
 {
  "id": "veterinar-s-r-o-trutnov",
  "name": "Veterinář s.r.o.",
  "place": "Trutnov",
  "address": "Spojovací 571, Trutnov-Trutnov 1",
  "tel": "+420 734223252",
  "at": [
   50.5702593,
   15.896450499999998
  ],
  "hours": "call",
  "web": "http://veterinarsro.cz/",
  "photo": {
   "src": "/vet/veterinar-s-r-o-trutnov.webp",
   "source": "https://veterinarsro.cz/",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.7,
   "count": 568,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=9918632822426745889"
  }
 },
 {
  "id": "veterina-dolni-bukovsko-dolni-bukovsko",
  "name": "Veterina Dolní Bukovsko",
  "place": "Dolní Bukovsko",
  "address": "Staré Město 453, Dolní Bukovsko",
  "tel": "+420 723803346",
  "at": [
   49.172663,
   14.578282799999998
  ],
  "hours": "call",
  "web": "https://veterina-dolni-bukovsko.webnode.cz/",
  "photo": {
   "src": "/vet/veterina-dolni-bukovsko-dolni-bukovsko.webp",
   "source": "https://maps.google.com/?cid=17129970660682841899",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.7,
   "count": 15,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=17129970660682841899"
  }
 },
 {
  "id": "veterinarni-klinika-brandys-brandys-nad-labem",
  "name": "Veterinární klinika Brandýs",
  "place": "Brandýs nad Labem",
  "address": "Šarochova 495, Stará Boleslav, Brandýs nad Labem-Stará Boleslav-Brandýs nad Labem-Stará Boleslav 1",
  "tel": "+420 326 903 189",
  "at": [
   50.1949107,
   14.6743343
  ],
  "hours": "call",
  "web": "http://www.veterinaplzen.cz/",
  "google": {
   "rating": 4.4,
   "count": 9,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=7958418146099374950"
  }
 },
 {
  "id": "veterinarni-ordinace-mvdr-michal-tesar-olomouc",
  "name": "Veterinární ordinace MVDr. Michal Tesař",
  "place": "Olomouc",
  "address": "tř. Míru 305/71A, Neředín, Olomouc-Olomouc 9",
  "tel": "+420 722358616",
  "at": [
   49.5960896,
   17.2260518
  ],
  "hours": "ask",
  "web": "http://veterinatesar.cz/",
  "photo": {
   "src": "/vet/veterinarni-ordinace-mvdr-michal-tesar-olomouc.webp",
   "source": "https://www.veterinatesar.cz/",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.6,
   "count": 56,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=10066883408917991954"
  }
 },
 {
  "id": "veterinarni-ordinace-velka-bites-dvorak-velka-bites",
  "name": "Veterinární Ordinace Velká Bíteš - Dvořák Viktor MVDr.",
  "place": "Velká Bíteš",
  "address": "Tyršova 648, Velká Bíteš",
  "tel": "+420 732 761 681",
  "at": [
   49.2907764,
   16.2211726
  ],
  "hours": "call",
  "web": "http://vet-tisnov.cz/",
  "google": {
   "rating": 4.8,
   "count": 128,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=8869847409583498462"
  }
 },
 {
  "id": "mvdr-radek-herynk-plzen-8",
  "name": "MVDr. Radek Herynk",
  "place": "Plzeň 8",
  "address": "U Školy 94/8, Plzeň 8-Černice",
  "tel": "+420 732 969 741",
  "at": [
   49.6963024,
   13.4179543
  ],
  "hours": "call",
  "web": "http://www.primaveterina.cz/",
  "photo": {
   "src": "/vet/mvdr-radek-herynk-plzen-8.webp",
   "source": "https://maps.google.com/?cid=5324913954597634242",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.9,
   "count": 947,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=5324913954597634242"
  }
 },
 {
  "id": "zodiacus-97-s-r-o-plzen-3",
  "name": "Zodiacus 97 s.r.o.",
  "place": "Plzeň 3",
  "address": "Vejprnická 1107/79, Plzeň 3",
  "tel": "+420 602 951 259",
  "at": [
   49.7428032,
   13.338140899999999
  ],
  "hours": [
   11,
   22
  ],
  "sched": {
   "wk": [],
   "sa": [
    [
     11,
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
  "web": "http://www.veterina-plzen.cz/",
  "google": {
   "rating": 4.6,
   "count": 615,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=16170652434442946350"
  }
 },
 {
  "id": "veterinarni-klinika-s-pohotovosti-brno",
  "name": "Veterinární klinika s pohotovostí",
  "place": "Brno",
  "address": "Veslařská 25b, Brno-Brno-Žabovřesky",
  "tel": "+420 603 103 377",
  "at": [
   49.2113509,
   16.560905599999998
  ],
  "hours": "call",
  "fee": "Pohotovostní příplatek činí 1 500,- Kč",
  "web": "http://www.hosek-vet.cz/",
  "photo": {
   "src": "/vet/veterinarni-klinika-s-pohotovosti-brno.webp",
   "source": "https://maps.google.com/?cid=14027173703172544168",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.7,
   "count": 820,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=14027173703172544168"
  }
 },
 {
  "id": "veterinarni-klinika-medicanima-praha-8",
  "name": "Veterinární klinika Medicanima",
  "place": "Praha 8",
  "address": "Voctářova 18, Praha 8-Palmovka",
  "tel": "+420 252 252 111",
  "at": [
   50.104417999999995,
   14.469940999999999
  ],
  "hours": "call",
  "web": "https://www.medicanima.cz/",
  "photo": {
   "src": "/vet/veterinarni-klinika-medicanima-praha-8.webp",
   "source": "https://maps.google.com/?cid=3134421422806999955",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.5,
   "count": 330,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=3134421422806999955"
  }
 },
 {
  "id": "akita-veterinarni-ordinace-lanskroun-lanskroun",
  "name": "AKITA Veterinární ordinace Lanškroun - MVDr. Šilarová M.",
  "place": "Lanškroun",
  "address": "Wolkerova 120/396, Lanškroun",
  "tel": "+420 723 771 464",
  "at": [
   49.9143572,
   16.6084708
  ],
  "hours": "call",
  "web": "https://www.veterina-akita.cz/",
  "photo": {
   "src": "/vet/akita-veterinarni-ordinace-lanskroun-lanskroun.webp",
   "source": "https://maps.google.com/?cid=2764782811390327071",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.6,
   "count": 30,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=2764782811390327071"
  }
 },
 {
  "id": "animal-veterinarni-klinika-mvdr-jiri-kurim",
  "name": "Animal - veterinární klinika - MVDr. Jiří Pikula, Ph.D.",
  "place": "Kuřim",
  "address": "Zahradní 617, Kuřim",
  "tel": "+420 541231383",
  "at": [
   49.2992533,
   16.5364883
  ],
  "hours": "call",
  "web": "http://www.animalvet.cz/",
  "google": {
   "rating": 4.6,
   "count": 21,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=2173741380783570564"
  }
 },
 {
  "id": "veterinarni-klinika-chotebor-chotebor",
  "name": "Veterinární klinika Chotěboř",
  "place": "Chotěboř",
  "address": "Západní 287, Chotěboř",
  "tel": "+420 602 283 290",
  "at": [
   49.7187473,
   15.6642128
  ],
  "hours": "call",
  "web": "http://www.veterinachotebor.cz/",
  "photo": {
   "src": "/vet/veterinarni-klinika-chotebor-chotebor.webp",
   "source": "https://maps.google.com/?cid=905670075955452307",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 4.8,
   "count": 135,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=905670075955452307"
  }
 },
 {
  "id": "mvdr-libor-okrina-jihlava",
  "name": "MVDr. Libor Okřina",
  "place": "Jihlava",
  "address": "Znojemská 807/81, Jihlava-Jihlava 1",
  "tel": "+420 724 049 364",
  "at": [
   49.3875895,
   15.5942359
  ],
  "hours": "call",
  "fee": "pohotovostní příplatek",
  "web": "https://www.veterinaokrina.cz/",
  "google": {
   "rating": 3.9,
   "count": 85,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=13604555272934044790"
  }
 },
 {
  "id": "veterinarni-ordinace-mvdr-slavomir-brno",
  "name": "Veterinární ordinace MVDr. Slavomír Hladík",
  "place": "Brno",
  "address": "Zvěřinova 759/23, Brno-Černovice",
  "tel": "+420 777 679 000",
  "at": [
   49.1882905,
   16.6296525
  ],
  "hours": "call",
  "web": "http://www.drhladik.cz/",
  "photo": {
   "src": "/vet/veterinarni-ordinace-mvdr-slavomir-brno.webp",
   "source": "https://maps.google.com/?cid=12218472654442769183",
   "at": "2026-11-21"
  },
  "google": {
   "rating": 5,
   "count": 34,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=12218472654442769183"
  }
 },
 {
  "id": "mvdr-vymazal-petr-veterinarni-klinika-vyskov",
  "name": "MVDr. Vymazal Petr, Veterinární klinika pro malá zvířata",
  "place": "Vyškov",
  "address": "Žižkova 13a, Vyškov-Vyškov 1",
  "tel": "+420 732 655 482",
  "at": [
   49.280945499999994,
   17.0030829
  ],
  "hours": "call",
  "web": "http://www.veterinavyskov.cz/",
  "google": {
   "rating": 4.9,
   "count": 699,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=13951208358540349218"
  }
 },
 {
  "id": "vethb-veterinarni-klinika-havlickuv-brod-havlickuv-brod",
  "name": "VetHB veterinární klinika Havlíčkův Brod",
  "place": "Havlíčkův Brod",
  "address": "Žižkova 494, Havlíčkův Brod-Havlíčkův Brod 1",
  "tel": "+420 724 704 470",
  "at": [
   49.6044376,
   15.588656999999998
  ],
  "hours": "call",
  "web": "https://www.vethb.cz/",
  "google": {
   "rating": 4.9,
   "count": 132,
   "at": "2026-11-21",
   "url": "https://maps.google.com/?cid=16639401958671539503"
  }
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
  { name: 'Praha', at: [50.075, 14.437] }, { name: 'Brno', at: [49.195, 16.608] }, { name: 'Ostrava', at: [49.835, 18.292] },
  { name: 'Plzeň', at: [49.747, 13.378] }, { name: 'Olomouc', at: [49.594, 17.251] }, { name: 'Liberec', at: [50.767, 15.056] },
  { name: 'České Budějovice', at: [48.975, 14.474] }, { name: 'Hradec Králové', at: [50.209, 15.833] }, { name: 'Pardubice', at: [50.034, 15.781] },
  { name: 'Ústí nad Labem', at: [50.661, 14.032] }, { name: 'Zlín', at: [49.226, 17.667] }, { name: 'Jihlava', at: [49.396, 15.591] },
  { name: 'Karlovy Vary', at: [50.231, 12.872] },
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
