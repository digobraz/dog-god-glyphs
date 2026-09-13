// ============================================================================
// PAWMATE — PRÁVA, POSTAVENIA A CESTY DO DATABÁZY (B5 / F3)
//
// Zadanie: `plany/zadanie-clenovia-svorky-2026-09-12.md` §5 (čo sa dá dať a čo
// nikdy) a §5b (poradie PRÁVA → E-MAIL → POZVÁNKA → REGISTRÁCIA).
//
// ── ZÁKLAD, KTORÝ SA NEZAŠKRTÁVA ────────────────────────────────────────────
// Každý pawmate VIDÍ o tom psovi všetko. Bez toho nemá pozvanie zmysel —
// opatrovateľ potrebuje vidieť alergie a lieky, a to je celá pointa. Osmička
// nižšie hovorí len o tom, čo smie MENIŤ.
//
// ── ZOZNAM ŽIJE NA TROCH MIESTACH ───────────────────────────────────────────
//   1. `vystupy/supabase/functions/invite-pawmate/index.ts` → `KNOWN_RIGHTS`
//   2. `vystupy/supabase/migrations/20260913_pawmate_panel.sql`
//      → `pawmate_rights_catalog()`
//   3. TU (menovky a poradie v paneli)
// Deno funkcia si SQL zoznam natiahnuť nevie a klientovi sa veriť nesmie, takže
// sa to na jedno miesto stiahnuť nedá — obe serverové kópie sú HRANICE, cez
// ktoré neznáme právo neprejde, a tretia je len popiska. Kto pridáva deviate
// právo, mení všetky tri, a v tomto poradí: pozvánka je jediná cesta, ktorou
// právo vôbec vznikne.
//
// ⚠️ NEVRATNÉ VECI TU NIE SÚ A NIKDY NEBUDÚ: platba a faktúry · kúpa ďalšieho
// psa · zmazanie/prevod psa · označenie psa za mŕtveho (`life_status`,
// `death_date`) · pridanie a odobratie členov · heslo a účet. Deliaca čiara
// §5: **dať sa dá len to, čo sa dá vziať späť.**
// ============================================================================
import { supabase } from '@/integrations/supabase/client';
import { DEV_NOAUTH, DEV_MOCK_ACCESS } from '@/lib/devMockDogs';

/**
 * Osem zaškrtávacích práv. Poradie je zámerné a drží ho aj `/pack/join/:token`:
 * najprv to, čo sa dotýka PSA (doklad, fotka), potom výlety a mapa, nakoniec
 * to, čo hovorí NAVONOK v mene svorky, a úplne na konci závet.
 */
export const PAWMATE_RIGHTS = [
  'dogid.edit',
  'dog.photo',
  'trips.draw',
  'trips.log',
  'map.notes',
  'social',
  'grid.message',
  'will',
] as const;

export type PawmateRight = typeof PAWMATE_RIGHTS[number];
export type PawmateRights = Partial<Record<PawmateRight, boolean>>;

/**
 * Postavenia. „Partner 100 %" NIE JE štvrté postavenie — je to `partner` so
 * všetkými ôsmimi zaškrtnutými (§5). Keby bolo, znamenali by to isté dve
 * hodnoty a rozišli by sa pri prvej zmene matice.
 * `pawtner` (majiteľ) sem NEPATRÍ: ten riadok píše trigger v DB a o jeho práve
 * rozhoduje `dogs.user_id`, nie toto pole.
 */
export type PawmateRole = 'partner' | 'family' | 'friend';

/** Menovka práva v paneli MAJITEĽA — „čo dávam". Dvojička v hlase POZVANÉHO
 *  („čo budeš môcť") žije v `pages/PackJoin.tsx` pod `pack.join.r.*`. */
export const RIGHT_LABEL: Record<PawmateRight, [key: string, fallback: string]> = {
  'dogid.edit':   ['pack.mate.r.dogid', 'DOG ID — health, food, weight'],
  'dog.photo':    ['pack.mate.r.photo', "The dog's photo"],
  'trips.draw':   ['pack.mate.r.draw', 'Draw and add trips'],
  'trips.log':    ['pack.mate.r.log', 'Log a walked trip + photos'],
  'map.notes':    ['pack.mate.r.notes', 'Marks on the map'],
  'social':       ['pack.mate.r.social', 'Messages on behalf of the pack'],
  'grid.message': ['pack.mate.r.grid', 'The message on the WALL'],
  'will':         ['pack.mate.r.will', 'Edit the will'],
};

/**
 * PREDVOLENÉ POSTAVENIA — matica zo §5 zadania, riadok po riadku.
 *
 * Sú to VÝCHODISKÁ, nie zámky: po kliknutí na predvoľbu sa zaškrtávatká len
 * nastavia a majiteľ ich smie doladiť. Preto sa výber predvoľby NIKAM neukladá
 * — v DB je `role` + konkrétne práva, nie „ktoré tlačidlo bolo stlačené".
 */
export interface PawmatePreset {
  id: 'partner100' | 'partner' | 'family' | 'friend';
  role: PawmateRole;
  rights: PawmateRight[];
  label: [key: string, fallback: string];
  hint: [key: string, fallback: string];
}

export const PAWMATE_PRESETS: PawmatePreset[] = [
  {
    id: 'partner100', role: 'partner',
    rights: [...PAWMATE_RIGHTS],
    label: ['pack.mate.p.partner100', 'Partner · everything'],
    hint: ['pack.mate.p.partner100Hint', 'Everything except what cannot be undone'],
  },
  {
    id: 'partner', role: 'partner',
    rights: ['dogid.edit', 'dog.photo', 'trips.draw', 'trips.log', 'map.notes'],
    label: ['pack.mate.p.partner', 'Partner'],
    hint: ['pack.mate.p.partnerHint', 'The dog, the trips, the map'],
  },
  {
    id: 'family', role: 'family',
    rights: ['trips.log', 'map.notes'],
    label: ['pack.mate.p.family', 'Family'],
    hint: ['pack.mate.p.familyHint', 'Walks and marks on the map'],
  },
  {
    id: 'friend', role: 'friend',
    rights: ['trips.log'],
    label: ['pack.mate.p.friend', 'Friend · sitter'],
    hint: ['pack.mate.p.friendHint', 'Sees everything, logs walks'],
  },
];

/** Menovka postavenia tak, ako ho ukáže riadok už prijatého pawmata. */
export const ROLE_LABEL: Record<string, [key: string, fallback: string]> = {
  pawtner: ['pack.mate.role.owner', 'Owner'],
  partner: ['pack.mate.role.partner', 'Partner'],
  family:  ['pack.mate.role.family', 'Family'],
  friend:  ['pack.mate.role.friend', 'Friend'],
};

/** Ktorá predvoľba sedí na uložený stav — len na zvýraznenie, nič sa z nej nečíta. */
export function matchPreset(role: string, rights: PawmateRights): PawmatePreset['id'] | null {
  const on = PAWMATE_RIGHTS.filter((r) => rights[r]);
  for (const p of PAWMATE_PRESETS) {
    if (p.role !== role || p.rights.length !== on.length) continue;
    if (p.rights.every((r) => rights[r])) return p.id;
  }
  return null;
}

// ── DÁTA ────────────────────────────────────────────────────────────────────
// 🔴 VŠETKO IDE CEZ `security definer` RPC, nie cez tabuľku. `dog_invites` nemá
// pre klienta ani jednu politiku (tam leží `token_hash`) a zápis do `dog_humans`
// by cez politiku dovolil zmazať aj riadok majiteľa. Dôvody sú rozpísané
// v hlavičke migrácie `20260913_pawmate_panel.sql`.
//
// ⚠️ `(supabase as any)` — `integrations/supabase/types.ts` o týchto funkciách
// nevie a REGENEROVAŤ SA NEBUDE: je to presne ten súbor, ktorý Lovable bot pri
// každom dotyku oreže (lock v CLAUDE.md), a `go-live` preflight stráži jeho
// dĺžku. Rovnaký vzor drží `useTripParty.ts` aj `useFogSource.ts`.

export interface AccessRow {
  kind: 'human' | 'invite';
  user_id: string | null;
  role: string;
  rights: PawmateRights;
  source: 'owner' | 'invite' | 'merge';
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  since: string;
  expires_at: string | null;
  invite_id: string | null;
}

/**
 * 🔴 POD `DEV_NOAUTH` SA SUPABASE NEVOLÁ. Nie je to úspora: `rpc()` si pýta token
 * cez `navigator.locks`, a keď je ten zámok v profile prehliadača zaseknutý,
 * volanie sa nevráti nikdy a panel ostane na spinneri bez chyby. Ten istý lock
 * drží `usePackIdentity.ts`; zoznam je atrapa v pamäti (`lib/devMockDogs.ts`),
 * takže sa dá celý flow prejsť na telefóne bez prihlásenia.
 */
export async function listDogAccess(dogId: string): Promise<AccessRow[]> {
  // Kópia, nie tá istá referencia — `setRows()` s identickým poľom React zahodí
  // (Object.is) a panel by sa po pozvaní neprekreslil.
  if (DEV_NOAUTH) return [...DEV_MOCK_ACCESS] as unknown as AccessRow[];
  const { data, error } = await (supabase as any).rpc('dog_access_list', { p_dog: dogId });
  if (error) throw new Error(error.message);
  return (data ?? []) as AccessRow[];
}

export async function setPawmateAccess(
  dogId: string, userId: string, role: PawmateRole, rights: PawmateRights,
): Promise<void> {
  if (DEV_NOAUTH) {
    const row = DEV_MOCK_ACCESS.find((r) => r.user_id === userId);
    if (row) { row.role = role; row.rights = { ...rights } as Record<string, boolean>; }
    return;
  }
  const { error } = await (supabase as any).rpc('set_pawmate_access', {
    p_dog: dogId, p_user: userId, p_role: role, p_rights: rights,
  });
  if (error) throw new Error(error.message);
}

export async function revokePawmate(dogId: string, userId: string): Promise<void> {
  if (DEV_NOAUTH) { dropMock((r) => r.user_id === userId && r.source !== 'owner'); return; }
  const { error } = await (supabase as any).rpc('revoke_pawmate', { p_dog: dogId, p_user: userId });
  if (error) throw new Error(error.message);
}

export async function revokeDogInvite(dogId: string, inviteId: string): Promise<void> {
  if (DEV_NOAUTH) { dropMock((r) => r.invite_id === inviteId); return; }
  const { error } = await (supabase as any).rpc('revoke_dog_invite', { p_dog: dogId, p_invite: inviteId });
  if (error) throw new Error(error.message);
}

/**
 * Pozvanie — jediná vec, ktorá NEIDE cez RPC. Potrebuje CSPRNG token, jeho
 * SHA-256 do DB, rate limit a odoslanie mailu, takže je to edge funkcia
 * `invite-pawmate` (B4, nasadená na LIVE aj DEV).
 *
 * 🔴 NEVRACIA TOKEN a nevracia ani to, či ten e-mail už účet má — odpoveď je
 * `{ ok: true }` a v oboch prípadoch rovnaká. Precedens, prečo je to tvrdé
 * pravidlo: `create-magic-link` bola 28. 6. 2026 zabitá práve preto, že token
 * vracala, čiže bola nástrojom na prevzatie cudzieho účtu.
 *
 * Vracia kód chyby (`no_slots`, `rate_limited`, …), nie vetu — preklad robí panel.
 */
export async function invitePawmate(
  dogId: string, email: string, role: PawmateRole, rights: PawmateRights,
): Promise<{ ok: true } | { ok: false; code: string }> {
  if (DEV_NOAUTH) {
    DEV_MOCK_ACCESS.push({
      kind: 'invite', user_id: null, role, rights: { ...rights } as Record<string, boolean>,
      source: 'invite', name: null, email, avatar_url: null,
      since: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 864e5).toISOString(),
      invite_id: 'dev-mock-invite-' + Date.now(),
    });
    return { ok: true };
  }
  const { data, error } = await supabase.functions.invoke('invite-pawmate', {
    body: { dogId, email, role, rights },
  });
  // `invoke` hlási neúspešný HTTP kód ako `error` a telo zahodí, takže dôvod
  // treba vytiahnuť z odpovede ručne — rovnako to robí `PackJoin.tsx`.
  if (error) {
    let code = 'internal';
    try {
      const res = (error as { context?: Response }).context;
      if (res && typeof res.json === 'function') {
        const body = await res.json();
        if (typeof body?.error === 'string') code = body.error;
      }
    } catch { /* telo sa nedá prečítať — ostáva `internal` */ }
    return { ok: false, code };
  }
  if (data && typeof data === 'object' && 'error' in data) {
    return { ok: false, code: String((data as { error: unknown }).error) };
  }
  return { ok: true };
}

/** DEV atrapa — vyhodí riadok zo zoznamu v pamäti (pole musí ostať TO ISTÉ,
 *  panel naň drží referenciu cez `listDogAccess`). */
function dropMock(match: (r: typeof DEV_MOCK_ACCESS[number]) => boolean): void {
  const i = DEV_MOCK_ACCESS.findIndex(match);
  if (i >= 0) DEV_MOCK_ACCESS.splice(i, 1);
}
