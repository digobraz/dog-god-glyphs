// Central profile — human (identity/interests) + per-dog attrs (design:
// plany/zadanie-profil-messaging-2026-07-23.md §2.1). MOCK dátová vrstva:
// localStorage kľúč 'dogypt.profile.v1', async-tvarované CRUD API kvôli
// budúcemu drop-in swapu na Supabase (žiadne priame localStorage v
// komponentoch — vždy cez toto API).
import { useCallback, useEffect, useState } from 'react';

// ── typy (§2.1, presné znenie zo zadania) ──
export type ActivityTag =
  | 'hiking' | 'running' | 'camping' | 'swimming' | 'cycling'
  | 'city_walks' | 'mountains' | 'water' | 'training_meetups' | 'travel';

export type TripVibe = 'chill' | 'adventure' | 'social' | 'training' | 'family';

export interface HumanProfile {
  interests: ActivityTag[];
  vibes: TripVibe[];
  region?: string;          // SK kraj / mesto (voľný výber z existujúcej SK_GEO)
  languages: string[];      // ['SK','EN']
  bio?: string;             // max 240
  lookingFor?: string;      // 1 veta „s kým/čím chodím na výlety"
}

export type TrainingLevel = 'puppy' | 'basics' | 'advanced' | 'off_leash_ready';
export type SocializationLevel = 'shy' | 'selective' | 'friendly' | 'social_butterfly';
export type EnergyLevel = 'calm' | 'moderate' | 'high' | 'tireless';

export interface DogProfileAttrs {
  dogId: string;
  training: TrainingLevel;
  socialization: SocializationLevel;
  energy: EnergyLevel;
  temperament: string[];        // chips: 'playful','protective','curious','gentle','independent','vocal'…
  sizeClass?: 'S' | 'M' | 'L' | 'XL'; // ak nie je v dogs row
  goodWith: Array<'dogs' | 'kids' | 'cats' | 'strangers'>;
  offLeashReliable?: boolean;
}

export interface CentralProfile {
  human: HumanProfile;
  dogs: Record<string, DogProfileAttrs>; // keyed by dog id
  updatedAt: string;
}

// ── taxonómie (EN labely — web texty = EN; icon = brand hand-drawn názov z
// public/icons/pack/, NIE lucide; ak žiadna ikonka nesedí, necháva sa bez) ──
export interface TaxonomyOption<T extends string = string> {
  value: T;
  labelEN: string;
  icon?: string;
}

export const ACTIVITY_OPTIONS: TaxonomyOption<ActivityTag>[] = [
  { value: 'hiking', labelEN: 'Hiking', icon: 'walk' },
  { value: 'running', labelEN: 'Running' },
  { value: 'camping', labelEN: 'Camping', icon: 'forest' },
  { value: 'swimming', labelEN: 'Swimming', icon: 'water' },
  { value: 'cycling', labelEN: 'Cycling', icon: 'cycle' },
  { value: 'city_walks', labelEN: 'City walks' },
  { value: 'mountains', labelEN: 'Mountains', icon: 'sun' },
  { value: 'water', labelEN: 'Water activities', icon: 'water' },
  { value: 'training_meetups', labelEN: 'Training meetups', icon: 'graduate' },
  { value: 'travel', labelEN: 'Travel', icon: 'globe' },
];

export const VIBE_OPTIONS: TaxonomyOption<TripVibe>[] = [
  { value: 'chill', labelEN: 'Chill', icon: 'yinyang' },
  { value: 'adventure', labelEN: 'Adventure', icon: 'bow' },
  { value: 'social', labelEN: 'Social', icon: 'people' },
  { value: 'training', labelEN: 'Training', icon: 'graduate' },
  { value: 'family', labelEN: 'Family', icon: 'house-heart' },
];

export const TRAINING_OPTIONS: TaxonomyOption<TrainingLevel>[] = [
  { value: 'puppy', labelEN: 'Puppy', icon: 'paw' },
  { value: 'basics', labelEN: 'Basics', icon: 'clipboard' },
  { value: 'advanced', labelEN: 'Advanced', icon: 'badge' },
  { value: 'off_leash_ready', labelEN: 'Off-leash ready', icon: 'star' },
];

export const SOCIALIZATION_OPTIONS: TaxonomyOption<SocializationLevel>[] = [
  { value: 'shy', labelEN: 'Shy' },
  { value: 'selective', labelEN: 'Selective', icon: 'sliders' },
  { value: 'friendly', labelEN: 'Friendly', icon: 'heart' },
  { value: 'social_butterfly', labelEN: 'Social butterfly', icon: 'people' },
];

export const ENERGY_OPTIONS: TaxonomyOption<EnergyLevel>[] = [
  { value: 'calm', labelEN: 'Calm', icon: 'yinyang' },
  { value: 'moderate', labelEN: 'Moderate', icon: 'bars' },
  { value: 'high', labelEN: 'High', icon: 'bone' },
  { value: 'tireless', labelEN: 'Tireless', icon: 'trophy' },
];

export const TEMPERAMENT_OPTIONS: TaxonomyOption[] = [
  { value: 'playful', labelEN: 'Playful', icon: 'bone' },
  { value: 'protective', labelEN: 'Protective', icon: 'badge' },
  { value: 'curious', labelEN: 'Curious', icon: 'nose' },
  { value: 'gentle', labelEN: 'Gentle', icon: 'heart' },
  { value: 'independent', labelEN: 'Independent', icon: 'paw' },
  { value: 'vocal', labelEN: 'Vocal', icon: 'chat' },
];

export const GOOD_WITH_OPTIONS: TaxonomyOption<'dogs' | 'kids' | 'cats' | 'strangers'>[] = [
  { value: 'dogs', labelEN: 'Dogs', icon: 'paw' },
  { value: 'kids', labelEN: 'Kids', icon: 'house-heart' },
  { value: 'cats', labelEN: 'Cats' },
  { value: 'strangers', labelEN: 'Strangers', icon: 'people' },
];

// ── deterministický hash → PRNG (mulberry32 + FNV-1a) — rovnaký vzor ako
// packCommunity.ts, zámerne duplikovaný (nie import) — profil modul stojí
// samostatne, packCommunity naopak importuje z NEHO (deriveDefaultDogAttrs),
// obrátený import by vytvoril cyklus. ──
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministicky odvodí DogProfileAttrs z ľubovoľného reťazca (meno/id psa).
// Slúži ako seed pre mock členov (packCommunity.MOCK_MEMBER_POOL) aj ako
// default pre reálnych psov bez vyplneného profilu — rovnaký pes/meno vždy
// dostane rovnaké atribúty (žiadny Math.random).
export function deriveDefaultDogAttrs(seed: string): DogProfileAttrs {
  const rnd = mulberry32(hashStr(seed));
  const training = TRAINING_OPTIONS[Math.floor(rnd() * TRAINING_OPTIONS.length)].value;
  const socialization = SOCIALIZATION_OPTIONS[Math.floor(rnd() * SOCIALIZATION_OPTIONS.length)].value;
  const energy = ENERGY_OPTIONS[Math.floor(rnd() * ENERGY_OPTIONS.length)].value;

  const temperamentPool = TEMPERAMENT_OPTIONS.map((o) => o.value);
  const t1 = temperamentPool[Math.floor(rnd() * temperamentPool.length)];
  let t2 = temperamentPool[Math.floor(rnd() * temperamentPool.length)];
  if (t2 === t1) t2 = temperamentPool[(temperamentPool.indexOf(t1) + 1) % temperamentPool.length];
  const temperament = [t1, t2];

  const sizeClasses: NonNullable<DogProfileAttrs['sizeClass']>[] = ['S', 'M', 'L', 'XL'];
  const sizeClass = sizeClasses[Math.floor(rnd() * sizeClasses.length)];

  const goodWithPool: DogProfileAttrs['goodWith'] = ['dogs', 'kids', 'cats', 'strangers'];
  const goodWithCount = 1 + Math.floor(rnd() * goodWithPool.length);
  const remaining = [...goodWithPool];
  const goodWith: DogProfileAttrs['goodWith'] = [];
  for (let i = 0; i < goodWithCount && remaining.length; i++) {
    const idx = Math.floor(rnd() * remaining.length);
    goodWith.push(remaining.splice(idx, 1)[0]);
  }

  const offLeashReliable = rnd() < 0.5;

  return { dogId: seed, training, socialization, energy, temperament, sizeClass, goodWith, offLeashReliable };
}

// ── localStorage CRUD (async-tvarované kvôli budúcemu Supabase swapu) ──
const STORAGE_KEY = 'dogypt.profile.v1';

function emptyProfile(): CentralProfile {
  return { human: { interests: [], vibes: [], languages: [] }, dogs: {}, updatedAt: new Date(0).toISOString() };
}

function readRaw(): CentralProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProfile();
    const parsed = JSON.parse(raw) as Partial<CentralProfile>;
    return {
      human: { interests: [], vibes: [], languages: [], ...parsed.human },
      dogs: parsed.dogs ?? {},
      updatedAt: parsed.updatedAt ?? new Date(0).toISOString(),
    };
  } catch {
    return emptyProfile(); // corrupt / private-mode — non-fatal, fall back to empty
  }
}

function writeRaw(profile: CentralProfile): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch { /* quota / private mode — non-fatal */ }
}

// in-tab listeners — reload() / useProfile() reagujú na zmenu bez pageload
type Listener = () => void;
const listeners = new Set<Listener>();
function emitChange(): void { listeners.forEach((l) => l()); }

export async function getProfile(): Promise<CentralProfile> {
  return readRaw();
}

export async function saveHuman(patch: Partial<HumanProfile>): Promise<CentralProfile> {
  const cur = readRaw();
  const next: CentralProfile = { ...cur, human: { ...cur.human, ...patch }, updatedAt: new Date().toISOString() };
  writeRaw(next);
  emitChange();
  return next;
}

export async function saveDogAttrs(dogId: string, patch: Partial<DogProfileAttrs>): Promise<CentralProfile> {
  const cur = readRaw();
  const existing = cur.dogs[dogId] ?? deriveDefaultDogAttrs(dogId);
  const next: CentralProfile = {
    ...cur,
    dogs: { ...cur.dogs, [dogId]: { ...existing, ...patch, dogId } },
    updatedAt: new Date().toISOString(),
  };
  writeRaw(next);
  emitChange();
  return next;
}

// ── hook ──
export function useProfile(): { profile: CentralProfile | null; reload: () => void } {
  const [profile, setProfile] = useState<CentralProfile | null>(null);

  const reload = useCallback(() => {
    getProfile().then(setProfile);
  }, []);

  useEffect(() => {
    reload();
    listeners.add(reload);
    return () => { listeners.delete(reload); };
  }, [reload]);

  return { profile, reload };
}

// SWAP: localStorage → supabase.from('profiles'/'dog_attrs') — verejné API sa nemení.
