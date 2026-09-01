// ---------------------------------------------------------------------------
// PROFIL CUDZIEHO ČLENA — čítanie.
//
// Doplnok k `packProfile.ts` (ten rieši MÔJ profil). Tento súbor rieši otázku
// „kto je ten druhý človek", ktorá do 26. 8. 2026 nemala odpoveď: databáza o
// cudzom členovi vydávala presne štyri údaje (krstné meno, meno psa, fotka psa,
// poradové číslo) a bohatý profil ležal v prehliadači svojho majiteľa.
//
// ADRESA ČLENA = PORADOVÉ ČÍSLO, nie `user_id`. Žiadna existujúca funkcia
// (`get_trip_party`, `list_my_conversations`, `start_dm`) `user_id` cudzieho
// človeka nevydáva a tento súbor ten zámok neruší — číslo je jediné, čo appka
// o cudzom človeku drží, tak je to aj kľúč.
//
// OREZ SKRYTÝCH POLÍ ROBÍ SERVER, nie tento kód. `get_member_profiles()`
// odstraňuje `visibility` aj každé pole, ktoré má v ňom hodnotu `private`.
// Keby to robil klient, údaj by odišiel po drôte a „skryť" by bola len ilúzia.
// Dôsledok pre render: cudzí profil má prázdne `visibility`, takže `getTier()`
// naň vracia východiskové tiery — skryté polia jednoducho nie sú v dátach.
//
// Migrácia: `vystupy/supabase/migrations/20260826_pack_profiles.sql`.
// Typy tabuliek/RPC nie sú v generovanom `types.ts` — rovnaký únik ako v
// `mapNotesData.ts` a `packMessaging.ts`.
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  type CentralProfile,
  type DogProfileAttrs,
  type HumanProfile,
  emptyDogAttrs,
} from './packProfile';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface MemberDog {
  dogId: string;
  name: string | null;
  photo: string | null;
  packNumber: number | null;
  /** Z `dogs.selections.dogGender` — určuje farbu pilulky kastrácie v psej galérii. */
  gender: string | null;
  /** Hotový heroglyf (`dogs.heroglyph_png_url`) — ten istý obrázok ako na verejnej stene. */
  heroglyphUrl: string | null;
  attrs: DogProfileAttrs;
}

export interface MemberProfile {
  /** Číslo, na ktoré si sa pýtal — kľúč, pod ktorým si výsledok priradíš späť. */
  askedNumber: number;
  /** Kanonická adresa člena = číslo jeho PRVÉHO psa. Človek s dvoma psami má dve čísla. */
  memberNumber: number | null;
  ownerFirst: string | null;
  avatarUrl: string | null;
  /** Meno, ktoré si človek vypísal v profile. `null` = nevypísal, platí meno z objednávky. */
  displayName: string | null;
  human: HumanProfile;
  dogs: MemberDog[];
  /** `null` = člen existuje, ale profil si nikdy nevyplnil. Nie je to chyba. */
  updatedAt: string | null;
}

type Row = {
  asked_number: number;
  member_number: number | null;
  owner_first: string | null;
  avatar_url: string | null;
  display_name: string | null;
  human: Partial<HumanProfile> | null;
  dogs: Array<{
    dogId: string; name: string | null; photo: string | null; packNumber: number | null;
    gender: string | null; heroglyphUrl: string | null; attrs: Partial<DogProfileAttrs> | null;
  }> | null;
  updated_at: string | null;
};

function emptyHuman(): HumanProfile {
  return { interests: [], vibes: [], languages: [], intents: [], personality: [], visibility: {} };
}

function fromRow(r: Row): MemberProfile {
  return {
    askedNumber: r.asked_number,
    memberNumber: r.member_number,
    ownerFirst: r.owner_first,
    avatarUrl: r.avatar_url,
    displayName: r.display_name,
    human: { ...emptyHuman(), ...(r.human ?? {}) },
    dogs: (r.dogs ?? []).map((d) => ({
      dogId: d.dogId,
      name: d.name,
      photo: d.photo,
      packNumber: d.packNumber,
      gender: d.gender ?? null,
      heroglyphUrl: d.heroglyphUrl ?? null,
      // Nevyplnená karta = prázdna karta, nie chýbajúci pes. `emptyDogAttrs`
      // drží ten istý tvar, aký očakáva `TripProfileCard` aj psia galéria.
      attrs: { ...emptyDogAttrs(d.dogId), ...(d.attrs ?? {}) },
    })),
    updatedAt: r.updated_at,
  };
}

// Vyrovnávacia pamäť na dobu načítania stránky. Partia výletu, zoznam plánov aj
// karty v mape sa pýtajú na tých istých ľudí opakovane pri každom prekreslení —
// bez nej by to bol dotaz do DB na každý render.
const cache = new Map<number, MemberProfile | null>(); // null = číslo nič nevrátilo
const inFlight = new Map<number, Promise<void>>();

/** Zahodí vyrovnávaciu pamäť — po odhlásení/prihlásení sa mení, čo účet vidí. */
export function resetMemberProfileCache(): void {
  cache.clear();
  inFlight.clear();
}

// Bez tohto by po prepnutí účtu ostali v pamäti profily, ktoré nový účet nemusí
// mať právo vidieť (RPC vydá cudzí profil len platiacemu členovi).
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') resetMemberProfileCache();
});

/**
 * Načíta profily pre zadané čísla. Hromadne, nie po jednom — partia výletu má
 * bežne 3–6 ľudí a N+1 volaní by bolo na mobile vidieť.
 * Číslo, ktoré nič nevráti (neexistuje, neplatí, nie je členom), sa uloží ako
 * `null` a druhýkrát sa už nepýta.
 */
export async function fetchMemberProfiles(numbers: number[]): Promise<Map<number, MemberProfile>> {
  const wanted = [...new Set(numbers.filter((n) => Number.isFinite(n)))];
  const missing = wanted.filter((n) => !cache.has(n) && !inFlight.has(n));

  if (missing.length) {
    const p = (async () => {
      const { data, error } = await db.rpc('get_member_profiles', { p_pack_numbers: missing });
      // Chyba siete/oprávnení: čísla NEZNAČÍME ako `null`, aby sa dotaz dal
      // zopakovať. Zapamätaný neúspech by sa tváril ako „taký člen nie je".
      if (error) return;
      const rows = (data ?? []) as Row[];
      const got = new Set<number>();
      for (const r of rows) { cache.set(r.asked_number, fromRow(r)); got.add(r.asked_number); }
      for (const n of missing) if (!got.has(n)) cache.set(n, null);
    })().finally(() => { missing.forEach((n) => inFlight.delete(n)); });
    missing.forEach((n) => inFlight.set(n, p));
  }

  await Promise.all(wanted.map((n) => inFlight.get(n)).filter(Boolean));

  const out = new Map<number, MemberProfile>();
  for (const n of wanted) { const v = cache.get(n); if (v) out.set(n, v); }
  return out;
}

/**
 * Hook pre povrchy, ktoré vykresľujú viacerých ľudí naraz (partia výletu,
 * zoznam plánov, karty v mape).
 *
 * Zoznam čísel sa porovnáva podľa OBSAHU, nie podľa identity poľa — volajúci
 * ho typicky skladá cez `.map()` priamo v JSX, takže by to bolo pri každom
 * prekreslení nové pole a efekt by bežal donekonečna.
 */
export function useMemberProfiles(numbers: Array<number | null | undefined>): Map<number, MemberProfile> {
  const key = useMemo(
    () => [...new Set(numbers.filter((n): n is number => typeof n === 'number'))].sort((a, b) => a - b).join(','),
    [numbers],
  );
  const [map, setMap] = useState<Map<number, MemberProfile>>(new Map());

  useEffect(() => {
    if (!key) { setMap(new Map()); return; }
    let alive = true;
    fetchMemberProfiles(key.split(',').map(Number)).then((m) => { if (alive) setMap(m); });
    return () => { alive = false; };
  }, [key]);

  return map;
}


// ── DÁVKOVANIE PRE JEDNOTLIVÉ KARTY ─────────────────────────────────────────
// Karty partie sa vykresľujú v `.map()` uprostred veľkých súborov (`PackMap`,
// `packCommunityUI`), takže si každá pýta svojho člena sama. Bez dávkovania by
// šesť kariet spravilo šesť volaní. Čísla vypýtané v tom istom kole sa preto
// zbierajú do jednej fronty a odchádzajú jedným dotazom.
let queue: number[] = [];
let queued: Promise<Map<number, MemberProfile>> | null = null;

function enqueue(n: number): Promise<Map<number, MemberProfile>> {
  queue.push(n);
  if (!queued) {
    queued = new Promise<Map<number, MemberProfile>>((resolve) => {
      setTimeout(() => {
        const batch = queue;
        queue = [];
        queued = null; // ďalší žiadateľ už otvára novú frontu
        resolve(fetchMemberProfiles(batch));
      }, 0);
    });
  }
  return queued;
}

/**
 * Profil JEDNÉHO člena podľa poradového čísla. `null` = ešte sa načítava, alebo
 * taký člen nie je — rozdiel sa zámerne nerozlišuje, karta sa v oboch prípadoch
 * vykreslí z toho, čo o ňom vie výlet (meno, pes, fotka, číslo).
 */
export function useMemberProfile(packNumber?: number | null): MemberProfile | null {
  const [profile, setProfile] = useState<MemberProfile | null>(
    () => (typeof packNumber === 'number' ? cache.get(packNumber) ?? null : null),
  );

  useEffect(() => {
    if (typeof packNumber !== 'number') { setProfile(null); return; }
    const hit = cache.get(packNumber);
    if (hit !== undefined) { setProfile(hit); return; }
    let alive = true;
    enqueue(packNumber).then((m) => { if (alive) setProfile(m.get(packNumber) ?? null); });
    return () => { alive = false; };
  }, [packNumber]);

  return profile;
}


/**
 * MENO ČLOVEKA — jediné miesto, kde sa o ňom rozhoduje.
 *
 * Matej 26. 8. 2026: *„meno ukazuje ako si to človek nastaví v profile… štandardne to
 * bude to čo zadal pri objednávke"*. Poradie je teda:
 *   1. prezývka, ak si zvolil, že sa má ukazovať ona,
 *   2. meno vypísané v profile,
 *   3. meno z objednávky (`dogs.owner_name` → `owner_first`) — východisko,
 *   4. `fallback` volajúceho (na výlete je to krstné meno z partie), inak nič.
 *
 * PREČO JEDNA FUNKCIA: to isté meno sa vykresľuje na profile, na karte partie a na
 * mini-karte výletu. Keď o ňom rozhodovalo každé miesto samo, na jednej obrazovke stálo
 * „Stachoman" a na druhej „Matej" — to isté číslo, ten istý človek, dve mená.
 */
export function memberDisplayName(m: MemberProfile | null | undefined, fallback?: string | null): string {
  const nick = m?.human.nickname?.trim();
  if (m?.human.displayAs === 'nickname' && nick) return nick;
  return m?.displayName?.trim() || m?.ownerFirst?.trim() || fallback?.trim() || '';
}

/** Fotka človeka, keď ju nahral; inak fotka jeho prvého psa (Matej 26. 8.). */
export function memberAvatarUrl(m: MemberProfile | null | undefined, fallback?: string | null): string | null {
  return m?.avatarUrl ?? m?.dogs[0]?.photo ?? fallback ?? null;
}

/**
 * `MemberProfile` → `CentralProfile`, teda tvar, ktorý žiada `TripProfileCard`
 * aj psia galéria. Existuje preto, aby sa cudzí profil vykresľoval TÝM ISTÝM
 * komponentom ako vlastný — dve karty pre tú istú vec sa rozídu pri prvej zmene.
 */
export function memberToCentralProfile(m: MemberProfile | null | undefined): CentralProfile {
  if (!m) {
    return { human: emptyHuman(), dogs: {}, updatedAt: new Date(0).toISOString() };
  }
  return {
    human: m.human,
    dogs: Object.fromEntries(m.dogs.map((d) => [d.dogId, d.attrs])),
    updatedAt: m.updatedAt ?? new Date(0).toISOString(),
  };
}
