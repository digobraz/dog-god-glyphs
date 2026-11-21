// JEDEN REGISTER KLINÍK — 33 pohotovostí zo SOS + 834 bežných veterinárov z mapy, jedno ID `cid`.
// Zadanie: `plany/zadanie-veterinar-profil-admin-hodnotenie-2026-11-17.md` §STAVBA 1.
//
// POHOTOVOSŤ       — `VET_EMERGENCY` z balíka appky, `cid` = jej ručné ID (`vetline-24h-bratislava`).
// BEŽNÝ VETERINÁR  — `public/vet/mapa-v2.json` (⚙️ `plany/veterinari/gen-vet-mapa.mjs`), `cid` = slug
//                    z mena a mesta, stály (drží ho `plany/veterinari/cid-pevne.json`).
// Na `cid` visí profil `/pack/klinika/:cid`, hodnotenie Dogypťanov (`place_posts.clinic_id`) aj správca.
// DB (`clinics`) drží len meno, doménu a „O klinike"; karta (hodiny, čísla, fotka) je tu — bez signálu
// musí SOS fungovať.
//
// ⚠️ `mapa-v1.json` ostáva na disku pre staré buildy appky (`public/` sa neháše); nový kód číta v2.
import { useEffect, useState } from 'react';
import type { SosT } from '@/components/pack/sos/sosShared';
import { VET_EMERGENCY, closesAt, isOpenAt, opensAt, vetNavUrl, type NavApp, type VetPlace } from '@/lib/vetEmergency';

/** Jeden súbor na krajinu (Česko od 21. 11. 2026), rovnaký tvar; stiahnu sa naraz a zlejú. */
const DATA_URLS = ['/vet/mapa-v2.json', '/vet/mapa-v2-cz.json'];

type Sched = NonNullable<VetPlace['sched']>;
/** Riadok `mapa-v2.json` — krátke kľúče, súbor ide po sieti. `id` = 10 znakov `place_id` (fotka), `cid` = stále ID. */
/** `p` = fotka v `public/vet/m/` (z webu ambulancie alebo z Google profilu); bez nej kreslený obrázok. */
type Raw = { p?: string; cid: string; id: string; n: string; a: string; at: [number, number]; t?: string[]; h?: 'nonstop' | 'onsite' | 'ask'; s?: Sched; r?: number; c?: number; g: string; w?: string };

export type MapVet = {
  cid: string; name: string; address: string; at: [number, number]; tels: string[];
  /** tvar, ktorému rozumejú `isOpenAt` / `closesAt` / `opensAt` z pohotovosti */
  clock: Pick<VetPlace, 'hours' | 'sched' | 'weekdays'>;
  google?: { rating: number; count?: number }; googleUrl?: string; navUrl: string | null;
  sos: boolean; nonstop: boolean; photo: string; web?: string;
  /** Pohotovosť zo SOS: celý záznam (telBy, home, fee, note…) pre profil. */
  er?: VetPlace;
};
// Ambulancia bez vlastnej fotky: tá istá zjavne vymyslená kresba ako v SOS (Matej 5. 11. 2026).
export const NO_PHOTO = '/vet/_bez-fotky.jpg';

let filePromise: Promise<MapVet[]> | null = null;
/** Bežní veterinári. Zlyhanie je tiché (prázdny zoznam); sľub sa zahodí, aby sa skúsilo znova. */
export function loadMapVets(): Promise<MapVet[]> {
  filePromise ||= Promise.all(DATA_URLS.map((u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null)))
    .then((all: ({ vets: Raw[] } | null)[]) => {
      // Krajina, ktorá nedošla, sa skúsi pri ďalšom volaní znova; tá, čo došla, sa ukáže hneď.
      if (all.some((j) => !j)) filePromise = null;
      return all.flatMap((j) => j?.vets ?? []);
    })
    .then((vets) => vets.map((v): MapVet => ({
      cid: v.cid, name: v.n, address: v.a, at: v.at, tels: v.t ?? [],
      clock: v.s ? { hours: [0, 0], sched: v.s } : { hours: v.h ?? 'ask' },
      ...(v.r ? { google: { rating: v.r, count: v.c } } : {}),
      googleUrl: v.g,
      navUrl: `https://www.google.com/maps/dir/?api=1&destination=${v.at[0]},${v.at[1]}`,
      sos: false, nonstop: v.h === 'nonstop' || v.h === 'onsite', photo: v.p ? `/vet/m/${v.p}` : NO_PHOTO,
      ...(v.w ? { web: v.w } : {}),
    })))
    .catch(() => { filePromise = null; return []; });
  return filePromise;
}

const fromEr = (p: VetPlace): MapVet => ({
  cid: p.id, name: p.name, address: p.address, at: p.at, tels: [p.tel, ...(p.telBy?.map((x) => x.tel) ?? [])],
  clock: { hours: p.hours, sched: p.sched, weekdays: p.weekdays },
  ...(p.google ? { google: { rating: p.google.rating, count: p.google.count }, googleUrl: p.google.url } : {}),
  navUrl: vetNavUrl('google', p),
  sos: true, nonstop: p.hours === 'onsite' || p.hours === 'nonstop', photo: p.photo?.src ?? NO_PHOTO,
  web: p.web, er: p,
});

/** Všetky pohotovosti zo SOS (aj výjazdové — profil majú, na mapu nejdú). */
export const ER_CLINICS: MapVet[] = VET_EMERGENCY.map(fromEr);

/** Klinika podľa `cid`. Pohotovosť hneď z balíka, bežný veterinár po stiahnutí súboru. */
export async function clinic(cid: string): Promise<MapVet | null> {
  const er = ER_CLINICS.find((c) => c.cid === cid);
  if (er) return er;
  return (await loadMapVets()).find((c) => c.cid === cid) ?? null;
}

/** `undefined` = ešte sa hľadá · `null` = taká klinika nie je. */
export function useClinic(cid: string | undefined): MapVet | null | undefined {
  const [c, setC] = useState<MapVet | null | undefined>(() => (cid ? ER_CLINICS.find((x) => x.cid === cid) : null));
  useEffect(() => {
    if (!cid) { setC(null); return; }
    let alive = true;
    void clinic(cid).then((x) => { if (alive) setC(x); });
    return () => { alive = false; };
  }, [cid]);
  return c;
}

/** Navigácia do kliniky v Google / Waze / Mapy.com. Pohotovosť podľa SOS (overený bod alebo adresa),
 *  bežný veterinár podľa bodu z Google (`place_id` poloha je na dom). */
export function clinicNavUrl(app: NavApp, v: MapVet): string | null {
  return vetNavUrl(app, v.er ?? { at: v.at, address: v.address, exact: true } as VetPlace);
}

export const clinicPath =(cid: string) => `/pack/klinika/${encodeURIComponent(cid)}`;

const hm = (h: number) => { const x = h % 24; return `${Math.floor(x)}:${String(Math.round((x % 1) * 60)).padStart(2, '0')}`; };

/** Stav hodín pre pilulku. `on` = zelená (teraz otvorené), inak tichá. */
export function hoursLabel(v: MapVet, s: SosT, now: Date): { text: string; on: boolean } {
  const p = v.clock as VetPlace;
  if (p.hours === 'onsite') return { text: s('pack.sos.er.onsite'), on: true };
  if (p.hours === 'nonstop') return { text: s('pack.sos.er.nonstop'), on: true };
  if (p.hours === 'call') return { text: s('pack.sos.er.call'), on: true };
  if (p.hours === 'ask') return { text: s('pack.sos.er.ask'), on: false };
  const open = isOpenAt(p, now);
  const at = open ? closesAt(p, now) : opensAt(p, now);
  if (at == null) return { text: s('pack.sos.er.closed'), on: false };
  return { text: s(open ? 'pack.sos.er.until' : 'pack.sos.er.from', { time: hm(at) }), on: open };
}

/** „729 recenzií" so správnym tvarom množného čísla. */
export function googleReviews(n: number, s: SosT, loc: string): string {
  const cat = new Intl.PluralRules(loc).select(n);
  return s(cat === 'one' ? 'pack.sos.er.gRevOne' : cat === 'few' ? 'pack.sos.er.gRevFew' : 'pack.sos.er.gRevMany', { count: n.toLocaleString(loc) });
}
