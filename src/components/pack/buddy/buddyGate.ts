// BUDDY (interne ASSNIF) — brána do 100 % a nastavenie zobrazenia.
// Zadanie: plany/zadanie-assnif-2026-09-24.md §3.1, §5, §10 · nákres plany/nakres-buddy-urovne-2026-09-24.html (0a–0d, 5b)
//
// 🔴 BRÁNA = TIE ISTÉ POLIA AKO PROFIL, NIE KÓPIA (Matej 24. 9.: „mali by sme to nejak prepojiť
//    s profilom"). Človek sa zapisuje do `pack_profiles.human` cez `saveHuman`, pes do
//    `dog_profiles.attrs` cez `saveDogAttrs` — presne tam, odkiaľ číta `/pack/profile` a DOG ID.
//    Čo doplníš tu, uvidíš v profile, a naopak.
//
// 🔴 DEFINÍCIA 100 % JE DVAKRÁT A MUSÍ SEDIEŤ: tu (okamžité odškrtávanie pri vypĺňaní)
//    a v `buddy_gate_missing()` (`supabase/migrations/20260927_buddy_settings.sql`), ktorá
//    zapnutie VYNÚTI. Rozhoduje server; kto zmení podmienku, mení obe miesta.
//
// ⚠️ PES: nákres hovorí „povaha, energia", ale `attrs.energy` nemá v appke žiadny editor.
//    DOG ID edituje `card.fitness` („Fyzická kondícia") — brána berie to, čo profil naozaj píše.
import { supabase } from '@/integrations/supabase/client';
import { INTENT_OPTIONS, type DogProfileAttrs, type Gender, type HumanProfile, type Intent } from '@/components/pack/profile/packProfile';

// `assnif_settings` nie je v generovanom `types.ts` — rovnaký únik ako `packProfile.ts`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** Poradie = poradie riadkov v bráne (nákres 0b). Kľúče = kľúče zo servera. */
export const BUDDY_STEPS = [
  { key: 'name', group: 'human' },
  { key: 'age', group: 'human' },
  { key: 'gender', group: 'human' },
  { key: 'region', group: 'human' },
  { key: 'photo', group: 'human' },
  { key: 'temperament', group: 'dog' },
  { key: 'fitness', group: 'dog' },
  { key: 'compat', group: 'dog' },
  { key: 'intents', group: 'buddy' },
  { key: 'audience', group: 'buddy' },
] as const;
export type BuddyStepKey = typeof BUDDY_STEPS[number]['key'];

/** Zámery do BUDDY. `community` („len komunita") nie je zámer na parťáka — sám bránu nesplní. */
export const BUDDY_INTENTS = INTENT_OPTIONS.filter((o) => o.value !== 'community');

export const BUDDY_MIN_AGE = 18;

export interface BuddySettings {
  enabled: boolean;
  show_to_genders: Gender[];
  age_min: number;
  age_max: number;
  radius_km: number | null;
  dog_compat_only: boolean;
  paused_until: string | null;
  notify_match: boolean;
  notify_mail: boolean;
  /** Ukazujem sa v Ľudia v okolí (kolo 2) — východisko NIE (Matej 25. 9.). */
  show_nearby: boolean;
}

export const DEFAULT_BUDDY_SETTINGS: BuddySettings = {
  enabled: false,
  show_to_genders: [],
  age_min: 18,
  age_max: 99,
  radius_km: 50,
  dog_compat_only: true,
  paused_until: null,
  notify_match: true,
  notify_mail: false,
  show_nearby: false,
};

/** Tri psie body. Rovnaká podmienka ako v SQL. */
export function dogStepsDone(a: DogProfileAttrs | undefined): Record<'temperament' | 'fitness' | 'compat', boolean> {
  return {
    temperament: (a?.tags?.temperament?.length ?? 0) > 0,
    fitness: !!a?.card?.fitness,
    compat: !!a?.card?.compat?.dogs_overall,
  };
}

/**
 * Ktorý pes nesie BUDDY bránu: ten, ktorý je k nej najbližšie; pri zhode nižšie poradové
 * číslo. Tá istá voľba ako v SQL (`order by … desc, pack_number asc`).
 */
export function pickBuddyDog<D extends { id: string; pack_number: number | null }>(
  dogs: D[], attrsOf: (id: string) => DogProfileAttrs | undefined,
): D | null {
  if (!dogs.length) return null;
  const score = (d: D) => Object.values(dogStepsDone(attrsOf(d.id))).filter(Boolean).length;
  return [...dogs].sort((a, b) =>
    score(b) - score(a) || (a.pack_number ?? Infinity) - (b.pack_number ?? Infinity),
  )[0];
}

/** Čo chýba do 100 %. Prázdne = smie vstúpiť. */
export function buddyGateMissing(input: {
  name: string;
  human: HumanProfile | undefined;
  dogAttrs: DogProfileAttrs | undefined;
  hasDog: boolean;
  settings: BuddySettings;
}): BuddyStepKey[] {
  const h = input.human;
  const dog = dogStepsDone(input.hasDog ? input.dogAttrs : undefined);
  const done: Record<BuddyStepKey, boolean> = {
    name: input.name.trim() !== '',
    age: typeof h?.age === 'number' && h.age >= BUDDY_MIN_AGE,
    gender: !!h?.gender,
    region: !!h?.region?.trim(),
    temperament: dog.temperament,
    fitness: dog.fitness,
    compat: dog.compat,
    photo: !!h?.buddyPhoto?.trim(),
    intents: (h?.intents ?? []).some((i: Intent) => i !== 'community'),
    audience: input.settings.show_to_genders.length > 0,
  };
  return BUDDY_STEPS.map((s) => s.key).filter((k) => !done[k]);
}

// ── dáta ─────────────────────────────────────────────────────────────────────

export async function loadBuddySettings(): Promise<BuddySettings> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return DEFAULT_BUDDY_SETTINGS;
  const { data } = await db.from('assnif_settings').select('*').eq('user_id', u.user.id).maybeSingle();
  return data ? { ...DEFAULT_BUDDY_SETTINGS, ...(data as Partial<BuddySettings>) } : DEFAULT_BUDDY_SETTINGS;
}

/**
 * Uloží nastavenie. Zapnutie (`enabled: true`) stráži trigger na serveri — pri neúplnej
 * bráne vráti zoznam toho, čo chýba, a nič sa nezapíše.
 */
export async function saveBuddySettings(
  patch: Partial<BuddySettings>,
): Promise<{ ok: true } | { ok: false; missing: BuddyStepKey[]; error?: string }> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { ok: false, missing: [], error: 'no_session' };
  const { error } = await db.from('assnif_settings')
    .upsert({ user_id: u.user.id, ...patch }, { onConflict: 'user_id' });
  if (!error) return { ok: true };
  if (error.message === 'buddy_gate') {
    const missing = String(error.details ?? '').split(',').filter(Boolean) as BuddyStepKey[];
    return { ok: false, missing };
  }
  return { ok: false, missing: [], error: error.message };
}
