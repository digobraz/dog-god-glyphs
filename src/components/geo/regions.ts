/**
 * DOGYPT Trails — kánonická PEVNÁ chrbtica regiónov (LOCKED 2026-07-14)
 * =====================================================================
 * Jediný zdroj pravdy pre: filter „kde" · SR pasovú kartu (gamifikácia) · auto-tagging.
 *
 * MODEL (zjednodušený, bez kolízií — Matej 2026-07-14):
 *  - POHORIA (26) = NAVIGAČNÁ CHRBTICA filtra. Čisté, jedna os, žiadny prekryv.
 *  - NP (9) + CHKO (14) = ODZNAKY na trase + zberateľské NÁLEPKY do pasu. NIE filter-os.
 *    (Často zdieľajú názov s pohorím → ako paralelný filter by kolidovali.)
 *  - Okres/mesto = tichý auto-tag (nie je tu — derivuje sa z geometrie).
 *
 * POZNÁMKY:
 *  - `zone` (W/C/E) = len HRUBÉ zoskupenie pre UI dropdown. Autoritatívna zóna trasy
 *    sa derivuje z jej okresu, nie odtiaľto (pohorie môže zónu presahovať).
 *  - POHORIA = 26 kurátorovaných hlavných pohorí (zhoda so sr-checklist). Oficiálne
 *    geomorfologické členenie je jemnejšie (50+ celkov) — pre UX držíme rozpoznateľných 26.
 *  - CHKO má oficiálne 14. sr-checklist mal 10 (dog-friendly dominanty); doplnené 4:
 *    Strážovské vrchy, Východné Karpaty, Záhorie, Dunajské luhy (posledné 3 = nížinné).
 *  - Neskôr: k týmto slugom sa pripoja PostGIS polygóny (geo_pohorie/geo_np/geo_chko)
 *    → point-in-polygon auto-tag. Tento súbor = zoznam pravdy pred polygónmi.
 */

export type Zone = 'W' | 'C' | 'E';

/** Pohorie = navigačná chrbtica filtra (26). */
export interface Pohorie {
  slug: string;
  name: string;
  peak: string;   // dominantný / najvyšší vrch
  peakM: number;  // výška vrcholu (m)
  zone: Zone;     // hrubé UI zoskupenie (nie autoritatívne)
}

/** NP + CHKO = odznak/nálepka (nie filter-os). */
export interface ProtectedArea {
  slug: string;
  name: string;
  kind: 'np' | 'chko';
  pohoria: string[]; // slugy pohorí, v ktorých leží ([] = mimo 26 kurátorovaných)
  lowland?: boolean; // nížina / lužné / mokraď — bez turistickej dominanty
}

/** 26 pohorí — zoradené podľa výšky dominanty (zostupne). */
export const POHORIA: Pohorie[] = [
  { slug: 'vysoke-tatry',       name: 'Vysoké Tatry',        peak: 'Gerlachovský štít', peakM: 2655, zone: 'C' },
  { slug: 'zapadne-tatry',      name: 'Západné Tatry',       peak: 'Bystrá',            peakM: 2248, zone: 'C' },
  { slug: 'belianske-tatry',    name: 'Belianske Tatry',     peak: 'Ždiarska vidla',    peakM: 2142, zone: 'C' },
  { slug: 'nizke-tatry',        name: 'Nízke Tatry',         peak: 'Ďumbier',           peakM: 2043, zone: 'C' },
  { slug: 'mala-fatra',         name: 'Malá Fatra',          peak: 'Veľký Kriváň',      peakM: 1709, zone: 'C' },
  { slug: 'chocske-vrchy',      name: 'Chočské vrchy',       peak: 'Veľký Choč',        peakM: 1611, zone: 'C' },
  { slug: 'velka-fatra',        name: 'Veľká Fatra',         peak: 'Ostredok',          peakM: 1596, zone: 'C' },
  { slug: 'slovenske-rudohorie',name: 'Slovenské rudohorie', peak: 'Stolica',           peakM: 1476, zone: 'E' },
  { slug: 'polana',             name: 'Poľana',              peak: 'Poľana',            peakM: 1458, zone: 'C' },
  { slug: 'vtacnik',            name: 'Vtáčnik',             peak: 'Vtáčnik',           peakM: 1346, zone: 'C' },
  { slug: 'oravska-magura',     name: 'Oravská Magura',      peak: 'Kubínska hoľa',     peakM: 1346, zone: 'C' },
  { slug: 'kremnicke-vrchy',    name: 'Kremnické vrchy',     peak: 'Flochová',          peakM: 1318, zone: 'C' },
  { slug: 'volovske-vrchy',     name: 'Volovské vrchy',      peak: 'Skalisko',          peakM: 1293, zone: 'E' },
  { slug: 'levocske-vrchy',     name: 'Levočské vrchy',      peak: 'Čierna hora',       peakM: 1289, zone: 'E' },
  { slug: 'kysucke-beskydy',    name: 'Kysucké Beskydy',     peak: 'Veľká Rača',        peakM: 1236, zone: 'C' },
  { slug: 'bukovske-vrchy',     name: 'Bukovské vrchy',      peak: 'Kremenec',          peakM: 1221, zone: 'E' },
  { slug: 'strazovske-vrchy',   name: 'Strážovské vrchy',    peak: 'Strážov',           peakM: 1213, zone: 'W' },
  { slug: 'branisko',           name: 'Branisko',            peak: 'Smrekovica',        peakM: 1200, zone: 'E' },
  { slug: 'slanske-vrchy',      name: 'Slanské vrchy',       peak: 'Šimonka',           peakM: 1092, zone: 'E' },
  { slug: 'vihorlat',           name: 'Vihorlat',            peak: 'Vihorlat',          peakM: 1076, zone: 'E' },
  { slug: 'javorniky',          name: 'Javorníky',           peak: 'Veľký Javorník',    peakM: 1071, zone: 'W' },
  { slug: 'povazsky-inovec',    name: 'Považský Inovec',     peak: 'Inovec',            peakM: 1042, zone: 'W' },
  { slug: 'stiavnicke-vrchy',   name: 'Štiavnické vrchy',    peak: 'Sitno',             peakM: 1009, zone: 'C' },
  { slug: 'biele-karpaty',      name: 'Biele Karpaty',       peak: 'Veľká Javorina',    peakM: 970,  zone: 'W' },
  { slug: 'tribec',             name: 'Tribeč',              peak: 'Veľký Tribeč',      peakM: 829,  zone: 'W' },
  { slug: 'male-karpaty',       name: 'Malé Karpaty',        peak: 'Záruby',            peakM: 768,  zone: 'W' },
];

/** 9 národných parkov — odznak/nálepka. */
export const NARODNE_PARKY: ProtectedArea[] = [
  { slug: 'np-tatransky',       name: 'Tatranský NP (TANAP)', kind: 'np', pohoria: ['vysoke-tatry', 'zapadne-tatry', 'belianske-tatry'] },
  { slug: 'np-nizke-tatry',     name: 'NP Nízke Tatry',       kind: 'np', pohoria: ['nizke-tatry'] },
  { slug: 'np-mala-fatra',      name: 'NP Malá Fatra',        kind: 'np', pohoria: ['mala-fatra'] },
  { slug: 'np-velka-fatra',     name: 'NP Veľká Fatra',       kind: 'np', pohoria: ['velka-fatra'] },
  { slug: 'np-slovensky-raj',   name: 'NP Slovenský raj',     kind: 'np', pohoria: ['volovske-vrchy'] },
  { slug: 'np-slovensky-kras',  name: 'NP Slovenský kras',    kind: 'np', pohoria: ['slovenske-rudohorie'] },
  { slug: 'np-muranska-planina',name: 'NP Muránska planina',  kind: 'np', pohoria: ['slovenske-rudohorie'] },
  { slug: 'np-poloniny',        name: 'NP Poloniny',          kind: 'np', pohoria: ['bukovske-vrchy'] },
  { slug: 'np-pieniny',         name: 'NP Pieniny (PIENAP)',  kind: 'np', pohoria: [] }, // Pieniny = mimo 26
];

/** 14 CHKO — odznak/nálepka. */
export const CHKO: ProtectedArea[] = [
  { slug: 'chko-male-karpaty',     name: 'CHKO Malé Karpaty',     kind: 'chko', pohoria: ['male-karpaty'] },
  { slug: 'chko-biele-karpaty',    name: 'CHKO Biele Karpaty',    kind: 'chko', pohoria: ['biele-karpaty'] },
  { slug: 'chko-kysuce',           name: 'CHKO Kysuce',           kind: 'chko', pohoria: ['kysucke-beskydy', 'javorniky'] },
  { slug: 'chko-horna-orava',      name: 'CHKO Horná Orava',      kind: 'chko', pohoria: ['oravska-magura'] },
  { slug: 'chko-strazovske-vrchy', name: 'CHKO Strážovské vrchy', kind: 'chko', pohoria: ['strazovske-vrchy'] },
  { slug: 'chko-ponitrie',         name: 'CHKO Ponitrie',         kind: 'chko', pohoria: ['tribec', 'vtacnik'] },
  { slug: 'chko-stiavnicke-vrchy', name: 'CHKO Štiavnické vrchy', kind: 'chko', pohoria: ['stiavnicke-vrchy'] },
  { slug: 'chko-polana',           name: 'CHKO Poľana',           kind: 'chko', pohoria: ['polana'] },
  { slug: 'chko-cerova-vrchovina', name: 'CHKO Cerová vrchovina', kind: 'chko', pohoria: [] }, // mimo 26
  { slug: 'chko-vihorlat',         name: 'CHKO Vihorlat',         kind: 'chko', pohoria: ['vihorlat'] },
  { slug: 'chko-vychodne-karpaty', name: 'CHKO Východné Karpaty', kind: 'chko', pohoria: ['bukovske-vrchy'] },
  { slug: 'chko-latorica',         name: 'CHKO Latorica',         kind: 'chko', pohoria: [], lowland: true },
  { slug: 'chko-zahorie',          name: 'CHKO Záhorie',          kind: 'chko', pohoria: [], lowland: true },
  { slug: 'chko-dunajske-luhy',    name: 'CHKO Dunajské luhy',    kind: 'chko', pohoria: [], lowland: true },
];

/** Všetky chránené územia (odznaky) spolu. */
export const PROTECTED_AREAS: ProtectedArea[] = [...NARODNE_PARKY, ...CHKO];

/** Pohoria zoskupené podľa zóny (pre UI dropdown). */
export const POHORIA_BY_ZONE: Record<Zone, Pohorie[]> = {
  W: POHORIA.filter((p) => p.zone === 'W'),
  C: POHORIA.filter((p) => p.zone === 'C'),
  E: POHORIA.filter((p) => p.zone === 'E'),
};

export const ZONE_LABEL: Record<Zone, string> = { W: 'West', C: 'Center', E: 'East' };

/** Počty pre SR pasovú kartu (gamifikácia). */
export const PASSPORT_TOTALS = {
  pohoria: POHORIA.length,     // 26
  np: NARODNE_PARKY.length,    // 9
  chko: CHKO.length,           // 14
} as const;

export const findPohorie = (slug: string) => POHORIA.find((p) => p.slug === slug);
export const findProtected = (slug: string) => PROTECTED_AREAS.find((a) => a.slug === slug);
