// ============================================================================
// MOJE PRÁVA KU KAŽDÉMU PSOVI — vstup pre `<RightGate>` (B6 / F4)
//
// Zadanie: `plany/zadanie-clenovia-svorky-2026-09-12.md` §5 (osem práv) a §6.3
// (ako vyzerá prvok bez práva). Serverová dvojička: RPC `my_dog_rights()`
// v `migrations/20260913_my_dog_rights.sql`.
//
// ── DVE PODOBY TEJ ISTEJ OTÁZKY ─────────────────────────────────────────────
// Zápisy v `/pack` sú dvojakého druhu a gate sa ich pýta inak:
//
//   A) ZÁPIS PATRÍ PSOVI — doklad, fotka, odkaz na WALL, závet. Riadok v DB
//      nesie `dog_id`, takže sa dá pýtať presne: `can(dogId, 'dogid.edit')`.
//
//   B) ZÁPIS PATRÍ MNE — prejdený výlet, nakreslená trasa, značka na mape,
//      správa. Riadok nesie `user_id`, nie `dog_id` (`trip_walked`, `user_trips`,
//      `trip_events`, `pack_trips`, `map_notes`), a je to tak správne: R2 hovorí,
//      že km sú MOJE, nie psove. Pýtať sa „pri ktorom psovi" tu nemá koho —
//      preto `canAny(right)`: stačí, že mi to právo dal aspoň jeden majiteľ.
//
// 🔴 MAJITEĽ MÁ VŽDY VŠETKO. Neplynie to z `rights` (ktoré má v DB prázdne), ale
// z `dogs.user_id` — tak to rozhoduje `dog_right()` v DB aj `my_dog_rights()`.
// Preto je pre dnešného člena appky každý gate otvorený a F4 mu nemení nič.
//
// ⚠️ KLIENTSKÝ GATE NIE JE OCHRANA, JE TO VYSVETLENIE. Skutočnú hranicu drží
// server (RLS na `dogs`/`dog_profiles` a `security definer` RPC). Tento modul
// existuje preto, aby človek nevidel tlačidlo, ktoré mu server aj tak odmietne —
// nie preto, aby ho zastavil.
// ============================================================================
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEV_NOAUTH } from '@/lib/devMockDogs';
import { PAWMATE_RIGHTS, type PawmateRight, type PawmateRights } from '@/lib/pawmateRights';

export interface DogRightsRow {
  dogId: string;
  dogName: string | null;
  isOwner: boolean;
  role: string;
  rights: PawmateRights;
}

// ── DEV: PREZLEČ SA ZA PAWMATA ──────────────────────────────────────────────
// Bez tohto sa gate nedá vidieť: dnešný člen je VŽDY majiteľ, takže by bol
// vždy odomknutý a celý beh by sa dal odovzdať bez jediného pohľadu naň.
// Prvý skutočný pawmate vznikne až po B8 (odomknutie dverí).
//
// Použitie na telefóne aj na PC: `?devmate=trips.log,map.notes` v URL — voľba
// sa uloží a platí aj po preklikoch. `?devmate=none` = pawmate bez práv,
// `?devmate=off` = späť majiteľ.
//
// ⚠️ `import.meta.env.DEV` je vo `vite build` false ⇒ do produkcie sa to
// nedostane. Rovnaká poistka drží `devMockDogs.ts`.
const DEVMATE_KEY = 'dogypt.dev.pawmate';
const DEV_TOOLS = import.meta.env.DEV;

function readDevMate(): string | null {
  if (!DEV_TOOLS) return null;
  try {
    const q = new URLSearchParams(window.location.search).get('devmate');
    if (q !== null) {
      if (q === 'off') localStorage.removeItem(DEVMATE_KEY);
      else localStorage.setItem(DEVMATE_KEY, q === 'none' ? '' : q);
    }
    return localStorage.getItem(DEVMATE_KEY);
  } catch {
    return null;
  }
}

/** Prezlečie načítané riadky za pawmata s vymenovanými právami. */
function applyDevMate(rows: DogRightsRow[]): DogRightsRow[] {
  const spec = readDevMate();
  if (spec === null) return rows;
  const on = new Set(spec.split(',').map((s) => s.trim()).filter(Boolean));
  return rows.map((r) => ({
    ...r,
    isOwner: false,
    role: 'family',
    rights: Object.fromEntries(PAWMATE_RIGHTS.map((k) => [k, on.has(k)])) as PawmateRights,
  }));
}

// ── NAČÍTANIE ───────────────────────────────────────────────────────────────
// Jedna spoločná fronta pre celú stránku: doklad psa má cez dvadsať gateov
// a každý by si inak vypýtal vlastný dotaz.
let cache: DogRightsRow[] | null = null;
let inflight: Promise<DogRightsRow[]> | null = null;
const listeners = new Set<() => void>();

function emit(): void { listeners.forEach((l) => l()); }

async function load(): Promise<DogRightsRow[]> {
  // 🔴 POD `DEV_NOAUTH` SA SUPABASE NEVOLÁ (lock v CLAUDE.md) — `rpc()` si pýta
  // token cez `navigator.locks` a pri zaseknutom zámku sa nevráti nikdy.
  if (DEV_NOAUTH) {
    const { DEV_MOCK_DOGS } = await import('@/lib/devMockDogs');
    return DEV_MOCK_DOGS.map((d) => ({
      dogId: d.id, dogName: d.dog_name, isOwner: true, role: 'pawtner',
      rights: Object.fromEntries(PAWMATE_RIGHTS.map((k) => [k, true])) as PawmateRights,
    }));
  }
  const { data, error } = await (supabase as any).rpc('my_dog_rights');
  if (error) {
    // Tichý neúspech je tu ZÁMER: gate je vysvetlenie, nie ochrana. Keby sa pri
    // výpadku siete zamkol, majiteľ by prišiel o vlastnú appku — a server by ho
    // aj tak pustil. Preto sa pri chybe tvárime ako majiteľ (prázdny zoznam =
    // `can()` padne na `true`, viď nižšie).
    console.warn('[dogRights] my_dog_rights failed:', error.message);
    return [];
  }
  return ((data ?? []) as Array<{
    dog_id: string; dog_name: string | null; is_owner: boolean; role: string; rights: PawmateRights;
  }>).map((r) => ({
    dogId: r.dog_id, dogName: r.dog_name, isOwner: r.is_owner, role: r.role, rights: r.rights ?? {},
  }));
}

export function getDogRights(): Promise<DogRightsRow[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = load()
      .then((rows) => { cache = applyDevMate(rows); emit(); return cache; })
      .finally(() => { inflight = null; });
  }
  return inflight;
}

/** Po prihlásení/odhlásení je to iný človek, teda iné práva. */
supabase.auth.onAuthStateChange((event) => {
  if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
  cache = null;
  emit();
});

// ── HOOK ────────────────────────────────────────────────────────────────────
export interface DogRightsApi {
  rows: DogRightsRow[] | null;
  /** Ešte sa načítava — gate sa v tom čase tvári ODOMKNUTO (viď `can`). */
  loading: boolean;
  /** A) zápis patrí PSOVI — smiem pri tomto psovi meniť túto vec? */
  can: (dogId: string | null | undefined, right: PawmateRight) => boolean;
  /** B) zápis patrí MNE — dal mi to právo aspoň jeden majiteľ? */
  canAny: (right: PawmateRight) => boolean;
  isOwner: (dogId: string | null | undefined) => boolean;
  /** Meno psa do vety „Toto smie meniť majiteľ Hektora". */
  dogName: (dogId: string | null | undefined) => string | null;
}

export function useMyDogRights(): DogRightsApi {
  const [rows, setRows] = useState<DogRightsRow[] | null>(cache);

  useEffect(() => {
    let alive = true;
    const sync = () => { if (alive) setRows(cache); };
    listeners.add(sync);
    void getDogRights().then(() => sync());
    return () => { alive = false; listeners.delete(sync); };
  }, []);

  // 🔒 KÝM SA NEVIE, PLATÍ „SMIEM". Dnešný člen je vždy majiteľ, takže opačná
  // voľba by každému na okamih zamkla celú appku a rozsvietila by ju až potom —
  // to sa číta ako porucha. Pawmate uvidí gate hneď, ako odpoveď dorazí; nič
  // sa tým neotvára, lebo server drží vlastnú hranicu.
  const find = (dogId: string | null | undefined) =>
    dogId && rows ? rows.find((r) => r.dogId === dogId) ?? null : null;

  return {
    rows,
    loading: rows === null,
    can: (dogId, right) => {
      const row = find(dogId);
      if (!row) return true;
      return row.isOwner || row.rights[right] === true;
    },
    canAny: (right) => {
      if (!rows || rows.length === 0) return true;
      return rows.some((r) => r.isOwner || r.rights[right] === true);
    },
    isOwner: (dogId) => {
      const row = find(dogId);
      return row ? row.isOwner : true;
    },
    dogName: (dogId) => find(dogId)?.dogName ?? null,
  };
}
