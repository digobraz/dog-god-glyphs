// ⚙️ GENEROVANÉ — needituj ručne. Zdroj: plany/nakresy/pohotovost-karticka-2026-11-04/data-sk.json (gen-vet-data.mjs).
// Veterinárna pohotovosť v SOS. Čísla sú z vlastných webov kliník, overené 5. 11. 2026. V balíku appky, aby fungovali bez signálu.
import type { SosKey } from '@/components/pack/sos/sosTexts';

export type VetPlace = {
  id: string; name: string; place: string; address: string; tel: string; at: [number, number];
  /** onsite = lekár fyzicky na mieste · nonstop · call = nonstop na zavolanie · [od, do] v hodinách, do > 24 = cez polnoc. */
  hours: 'onsite' | 'nonstop' | 'call' | [number, number];
  home?: boolean; clientsOnly?: boolean; weekdays?: boolean; fee?: string; note?: SosKey; web: string;
};

export const VET_EMERGENCY: VetPlace[] = [
 {
  "id": "sk1",
  "name": "VetLINE 24H",
  "place": "Bratislava-Staré Mesto",
  "address": "Staromestská 6/D, Bratislava",
  "tel": "+421 2 5441 2869",
  "at": [
   48.146679,
   17.1045933
  ],
  "hours": "onsite",
  "web": "https://www.vetline.sk/"
 },
 {
  "id": "sk2",
  "name": "SmallVet Plus",
  "place": "Bratislava-Rača",
  "address": "Žitná 46, Bratislava",
  "tel": "+421 949 247 294",
  "at": [
   48.2074684,
   17.1542877
  ],
  "hours": "nonstop",
  "web": "https://www.smallvet.sk/"
 },
 {
  "id": "sk3",
  "name": "VetPoint",
  "place": "Bratislava-Petržalka",
  "address": "Panónska cesta 38, Bratislava",
  "tel": "+421 948 029 674",
  "at": [
   48.1079218,
   17.0950244
  ],
  "hours": "nonstop",
  "web": "http://www.vetpoint.sk/"
 },
 {
  "id": "sk4",
  "name": "Univerzitná veterinárna nemocnica UVLF",
  "place": "Košice",
  "address": "Komenského 73, Košice",
  "tel": "+421 905 579 559",
  "at": [
   48.7375621,
   21.2468625
  ],
  "hours": "onsite",
  "web": "https://www.uvlf.sk/kliniky-sluzby/pohotovost"
 },
 {
  "id": "sk5",
  "name": "Veterinárna klinika Poprad",
  "place": "Poprad",
  "address": "Hraničná 12, Poprad",
  "tel": "+421 911 761 664",
  "at": [
   49.0598714,
   20.2819929
  ],
  "hours": "call",
  "fee": "39 €",
  "web": "http://www.veterinapoprad.sk/"
 },
 {
  "id": "sk6",
  "name": "Ambulancia s pohotovosťou Centrum",
  "place": "Poprad",
  "address": "Dominika Tatarku 5, Poprad",
  "tel": "+421 908 252 898",
  "at": [
   49.055316,
   20.2991774
  ],
  "hours": "call",
  "web": "http://www.veterinar-pohotovost.sk/"
 },
 {
  "id": "sk7",
  "name": "Klinika Fénix",
  "place": "Žilina",
  "address": "Štrková 10A, Žilina",
  "tel": "+421 915 983 343",
  "at": [
   49.1942701,
   18.726622
  ],
  "hours": "call",
  "web": "http://www.klinikafenix.sk/"
 },
 {
  "id": "sk8",
  "name": "Tri-Vet",
  "place": "Cífer",
  "address": "Kaplnská 14, Cífer",
  "tel": "+421 917 213 934",
  "at": [
   48.3144837,
   17.4831545
  ],
  "hours": "call",
  "note": "pack.sos.er.noteBranch",
  "web": "http://www.trivet.sk/"
 },
 {
  "id": "sk9",
  "name": "SCAR Vet",
  "place": "Trnava",
  "address": "Sladovnícka 22, Trnava",
  "tel": "+421 952 209 967",
  "at": [
   48.3706744,
   17.5973269
  ],
  "hours": "call",
  "web": "http://www.scarvet.sk/"
 },
 {
  "id": "sk10",
  "name": "Pet Clinic",
  "place": "Nitra",
  "address": "Nábrežie mládeže 47, Nitra",
  "tel": "+421 905 332 599",
  "at": [
   48.31471,
   18.09833
  ],
  "hours": "call",
  "web": "http://www.petclinic.sk/"
 },
 {
  "id": "sk11",
  "name": "Doktor Zvierat",
  "place": "Piešťany",
  "address": "Vrbovská cesta 14, Piešťany",
  "tel": "+421 905 455 931",
  "at": [
   48.59139,
   17.81739
  ],
  "hours": "call",
  "web": "http://www.doktorzvierat.sk/"
 },
 {
  "id": "sk12",
  "name": "Klinika LiVeS",
  "place": "Liptovský Mikuláš",
  "address": "1. mája 75, Liptovský Mikuláš",
  "tel": "+421 905 505 015",
  "at": [
   49.0803385,
   19.6242831
  ],
  "hours": "call",
  "fee": "od 40 €",
  "web": "http://www.veterina-lives.sk/"
 },
 {
  "id": "sk13",
  "name": "Veterinár Topoľčany",
  "place": "Topoľčany",
  "address": "Vajanského 18, Topoľčany",
  "tel": "+421 905 218 313",
  "at": [
   48.56141,
   18.15034
  ],
  "hours": "call",
  "note": "pack.sos.er.noteMayClose",
  "web": "http://www.veterinartopolcany.sk/"
 },
 {
  "id": "sk14",
  "name": "Vetkom",
  "place": "Považská Bystrica",
  "address": "Žilinská 28, Považská Bystrica",
  "tel": "+421 907 462 525",
  "at": [
   49.125,
   18.46494
  ],
  "hours": "call",
  "web": "http://www.vetkom.sk/"
 },
 {
  "id": "sk15",
  "name": "MVDr. Belopotocká",
  "place": "Levice",
  "address": "Andreja Kmeťa 29, Levice",
  "tel": "+421 908 185 043",
  "at": [
   48.20652,
   18.61369
  ],
  "hours": "call",
  "web": "http://www.bebabelvet.sk/"
 },
 {
  "id": "sk16",
  "name": "MVDr. Szakall",
  "place": "Senec",
  "address": "SNP 7, Senec",
  "tel": "+421 903 461 468",
  "at": [
   48.22275,
   17.40484
  ],
  "hours": "call",
  "web": "http://www.szakallvet.eu/"
 },
 {
  "id": "sk17",
  "name": "Klinika E-VET",
  "place": "Kráľová pri Senci",
  "address": "Sadová 588, Kráľová pri Senci",
  "tel": "+421 951 506 104",
  "at": [
   49.34071,
   17.21208
  ],
  "hours": "call",
  "fee": "60 €",
  "web": "http://evetklinika.sk/"
 },
 {
  "id": "sk18",
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
  "web": "http://www.veterinamartin.sk/"
 },
 {
  "id": "sk19",
  "name": "MyPet Clinic",
  "place": "Bratislava-Ružinov",
  "address": "Mierová 27, Bratislava",
  "tel": "+421 2 2211 3113",
  "at": [
   48.53832,
   17.03832
  ],
  "hours": [
   10,
   24
  ],
  "web": "https://www.mypet.sk/"
 },
 {
  "id": "sk20",
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
  "web": "http://www.veterinar-jazero.sk/pohotovost/"
 },
 {
  "id": "sk21",
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
  "web": "https://www.petservis.sk/"
 },
 {
  "id": "sk22",
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
  "fee": "po 24:00 30 €",
  "web": "http://www.vetone.info/"
 },
 {
  "id": "sk23",
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
  "web": "http://vetaxs.sk/"
 },
 {
  "id": "sk24",
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
  "web": "http://www.foxyvet.sk/"
 },
 {
  "id": "sk25",
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
  "weekdays": true,
  "web": "http://www.veterinarnaklinikanitra.sk/"
 },
 {
  "id": "sk26",
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
  "web": "http://dkvet.sk/"
 },
 {
  "id": "sk27",
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
  "note": "pack.sos.er.noteClients",
  "web": "http://www.animalcentrum.sk/"
 },
 {
  "id": "sk28",
  "name": "MVDr. Morvayová, výjazdy",
  "place": "Bratislava a okolie",
  "address": "Bebravská, Bratislava",
  "tel": "+421 908 224 683",
  "at": [
   48.13956,
   17.21267
  ],
  "hours": [
   9,
   20
  ],
  "home": true,
  "fee": "po 16:00 30 €",
  "web": "https://www.vyjazdovyveterinar.sk/"
 },
 {
  "id": "sk29",
  "name": "Veterinár domov, MVDr. Hilčanská",
  "place": "Košice a okolie",
  "address": "Palackého, Košice",
  "tel": "+421 944 762 228",
  "at": [
   48.71897,
   21.27037
  ],
  "hours": [
   8,
   22
  ],
  "home": true,
  "fee": "35 €",
  "web": "http://www.veterinardomov.sk/"
 },
 {
  "id": "sk30",
  "name": "VetArt, MVDr. Halás",
  "place": "Dolný Ohaj a okolie",
  "address": "Hlavná 60, Dolný Ohaj",
  "tel": "+421 918 993 268",
  "at": [
   48.08269,
   18.24951
  ],
  "hours": [
   8,
   22
  ],
  "home": true,
  "fee": "od 20 €",
  "web": "https://www.vetart.sk/"
 },
 {
  "id": "sk31",
  "name": "RHvet",
  "place": "Martin a okolie",
  "address": "Záturčianska 54, Martin",
  "tel": "+421 903 832 560",
  "at": [
   49.09455,
   18.91661
  ],
  "hours": [
   9,
   22
  ],
  "home": true,
  "fee": "20–25 €",
  "web": "https://rhvet.webnode.sk/"
 },
 {
  "id": "cz1",
  "name": "Pet-Medic",
  "place": "Praha",
  "address": "Praha",
  "tel": "+420 724 184 840",
  "at": [
   50.075,
   14.437
  ],
  "hours": [
   0,
   24
  ],
  "home": true,
  "web": "https://www.pet-medic.cz/"
 },
 {
  "id": "cz2",
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
  "fee": "od 2 000 Kč",
  "web": "https://www.sonda.cz/"
 }
];

export const CITIES: { name: string; at: [number, number] }[] = [
  { name: 'Bratislava', at: [48.148, 17.107] }, { name: 'Trnava', at: [48.377, 17.588] }, { name: 'Nitra', at: [48.307, 18.086] },
  { name: 'Trenčín', at: [48.894, 18.04] }, { name: 'Žilina', at: [49.223, 18.739] }, { name: 'Banská Bystrica', at: [48.736, 19.146] },
  { name: 'Poprad', at: [49.059, 20.297] }, { name: 'Prešov', at: [48.998, 21.24] }, { name: 'Košice', at: [48.716, 21.261] },
  { name: 'Praha', at: [50.075, 14.437] },
];

export function isOpenAt(p: VetPlace, d: Date): boolean {
  if (typeof p.hours === 'string') return true;
  if (p.weekdays && (d.getDay() === 0 || d.getDay() === 6)) return false;
  const h = d.getHours() + d.getMinutes() / 60;
  const [from, to] = p.hours;
  return to > 24 ? h >= from || h < to - 24 : h >= from && h < to;
}

export function distanceKm(a: [number, number], b: [number, number]): number {
  const r = (x: number) => (x * Math.PI) / 180;
  const dl = r(b[0] - a[0]); const dn = r(b[1] - a[1]);
  return 2 * 6371 * Math.asin(Math.sqrt(Math.sin(dl / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dn / 2) ** 2));
}
