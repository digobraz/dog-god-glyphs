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

// ── full profile taxonómie (zadanie-profil-full-2026-07-24 ČASŤ A) ──
export type Gender = 'male' | 'female' | 'other' | 'undisclosed';
export type RelationshipStatus = 'single' | 'taken' | 'complicated' | 'just_dogs';
export type PersonType = 'sporty' | 'active' | 'homebody';
export type Smoking = 'non_smoker' | 'socially' | 'smoker' | 'vaper';
export type Diet = 'omnivore' | 'vegetarian' | 'vegan' | 'healthy' | 'gourmet';
export type Intent = 'trip_buddies' | 'dog_playdates' | 'friendship' | 'dating' | 'community';
// ZRUŠENÉ 2026-07-26: `Alcohol` + `ALCOHOL_OPTIONS` + pole `alcohol` (Matej:
// „dropdowny alkohol nedavame") a `HobbyTag` + `HOBBY_OPTIONS` + pole `hobbies`
// (mŕtvy kód — 13 tagov sa nerenderovalo nikde, jediný výskyt bol `hobbies: []`
// v mock generátore; nahradil ich PERSONALITY_OPTIONS, s ktorým sa prekrývali
// v music/art/movies/coffee).

// ── „koncentrát osobnosti" (zadanie-profil-koncentrat-2026-07-24) — jeden
// pool, max 10 vybraných, zoskupené jemnými pod-labelmi (Vibe/Active/
// Creative/Taste/Dogs) ale zdieľajú jeden limit. Nahrádza (v renderi, nie v
// type — back-compat) staré interests/vibes/hobbies/personType. ──
export type PersonalityGroup = 'vibe' | 'active' | 'creative' | 'taste' | 'dog';
export type PersonalityTag =
  | 'chill' | 'adventurous' | 'social' | 'homebody' | 'family' | 'open_minded'
  | 'hiking' | 'camping' | 'sport' | 'travel'
  | 'art' | 'music' | 'books' | 'movies'
  | 'food' | 'coffee' | 'tea'
  | 'dog_training' | 'dog_rescue' | 'work_with_dog';

export type Smoke = 'yes' | 'no';
export type Work = 'business' | 'employee' | 'free' | 'study';
export const MAX_PERSONALITY = 10;

// Visibility model — jadro rozšíriteľnosti. trip = vidno aj na výlete (buddy-listu),
// profile = len na plnom profile, private = len ja. Override žije v human.visibility,
// default v DEFAULT_VISIBILITY (nižšie) — getTier() spája oboje.
//
// D3 (Matej 2026-07-25): trip-tier polia vidí KTORÝKOĽVEK člen packu, žiadny
// výpočet spoločného výletu sa nerobí → 'trip' a 'profile' sú prakticky to isté
// a reálne rozhodnutie je len „vidí to pack" vs. 'private'. Tiery ostávajú v type
// kvôli budúcemu sprísneniu; UI ich neponúka, prepína sa len na/z 'private'.
export type VisTier = 'trip' | 'profile' | 'private';
export type ProfileFieldKey =
  | 'gender' | 'age' | 'relationship' | 'languages'
  | 'dogVoiceBio' | 'bio'
  | 'interests' | 'vibes'
  // `smoke` (Yes/No), NIE `smoking` (4 hodnoty). Opravené 2026-07-26: UI ukladá do
  // `smoke`, ale tier 'trip' sedel na nepoužívanom `smoking` → fajčenie, ktoré je
  // LOCKED ako trip-viditeľné, fakticky žiadny tier nemalo a nedalo sa skryť.
  | 'personType' | 'smoke' | 'diet'
  | 'intents'
  | 'region';

export interface HumanProfile {
  interests: ActivityTag[];
  vibes: TripVibe[];
  region?: string;          // SK kraj / mesto (voľný výber z existujúcej SK_GEO)
  languages: string[];      // ['SK','EN']
  bio?: string;             // „About me" — ≤150 slov (word-count, nie znaky)
  lookingFor?: string;      // legacy — 1 veta „s kým/čím chodím na výlety", nahradené `intents`
  gender?: Gender;
  age?: number;
  nickname?: string;        // voliteľná prezývka (zadanie-profil-blok1-rework-2026-07-24)
  displayAs?: 'name' | 'nickname'; // ktorá verzia sa ukazuje navonok, default 'name'
  nationality?: string;     // country code z NATIONALITY_OPTIONS, default 'SK' (nezapisuje sa kým user nevyberie)
  relationship?: RelationshipStatus;
  dogVoiceBio?: string;      // „What my dog says about me" — ≤150 slov, HERO (zobrazuje sa prvý)
  personType?: PersonType;
  smoking?: Smoking;         // legacy 4-hodnotové fajčenie — nerenderuje sa, drží staré dáta
  diet?: Diet;
  intents: Intent[];         // default []
  personality: PersonalityTag[]; // koncentrát osobnosti — max MAX_PERSONALITY, default []
  customPersonality?: string;    // ONE user-written personality pill (counts toward MAX_PERSONALITY)
  smoke?: Smoke;             // Yes/No — nahrádza `smoking` v renderi (pole ostáva pre back-compat)
  work?: Work;
  visibility: Partial<Record<ProfileFieldKey, VisTier>>; // override defaultov, default {}
}

export type TrainingLevel = 'puppy' | 'basics' | 'advanced' | 'off_leash_ready';
export type SocializationLevel = 'shy' | 'selective' | 'friendly' | 'social_butterfly';
export type EnergyLevel = 'calm' | 'moderate' | 'high' | 'tireless';

// Dog BIO + tags — read-profil / accordion editor (zadanie-profil-read-dog-2026-07-25 §1).
// Closed-vocab chip taxonómie, i18n label key = `pack.dogTag.<value>`.
//
// POVAHA (zadanie-psia-karta-2026-07-25) — rozšírené zo 7 na 19, orezané na 17
// 2026-07-26 (Matej: „povaha psa má zbytočne vela pils, niektoré sa opakujú").
// Zlúčené polia „povaha" + „správanie" z Matejových zápiskov: boli to dve mená
// pre to isté, druhé navyše nieslo dôsledok (dominantný → s dominantným možný
// problém), ktorý teraz žije v `card.triggers` (čo reakciu spúšťa), nie v povahe.
// Vyhodené duplicity:
//  • 'easygoing' (Nekonfliktný) — takmer synonymum 'tolerant' (Tolerantný).
//  • 'ignoring' (Iných psov nerieši) — duplikuje semafor „With other dogs"
//    (`DOG_COMPAT_ROWS`, S KÝM VYCHÁDZA), ktorý tú istú otázku už kladie ako
//    green/amber/red, nie ako voľný tag.
//  • 'social' (Spoločenský) — 2026-07-29 (Matej): rovnaký dôvod ako vyššie,
//    prekrýva sa s 'friendly' (Priateľský) a je opak 'loner' (Samotár).
//    i18n kľúč `pack.dogTag.social` ostáva (mŕtvy, rovnaký precedens ako
//    easygoing/ignoring) — nie je referencovaný odtiaľto.
export const DOG_TEMPERAMENT_TAGS = [
  'playful', 'friendly', 'calm', 'shy', 'alert', 'loner',
  'tolerant', 'dominant', 'submissive',
  'curious', 'gentle', 'goofy', 'stubborn', 'cuddly', 'vocal', 'protective',
] as const;
export type DogTemperamentTag = typeof DOG_TEMPERAMENT_TAGS[number];

// DEPRECATED v UI — obsah pohltili štruktúrované polia DogCard (range/pace/
// compat/joys). Typ + uložené dáta ostávajú kvôli back-compat starých recordov.
export const DOG_TRAIL_TAGS = [
  'dogs_ok', 'kids_ok', 'loves_water', 'long_distance', 'slow_pace', 'off_leash', 'hunts',
] as const;
export type DogTrailTag = typeof DOG_TRAIL_TAGS[number];

// ── PSIA KARTA (zadanie-psia-karta-2026-07-25) ────────────────────────────────
// Tri vrstvy: 1 ZÁKLAD (identita) · 2 AKO FUNGUJE + S KÝM (buddy matching) ·
// 3 VET (owner-only, aditívny pohľad — NIE samostatný profil; ťahá 1+2 a
// pridáva anamnézu). Semafor sa používa VÝHRADNE na kompatibilitu a riziko —
// neutrálne vlastnosti (energia, veľkosť) sú škály, nie semafor.
export type TrafficLight = 'green' | 'amber' | 'red';

export type DogFitness = 'full' | 'normal' | 'take_it_easy';
export type DogRange = 'r5' | 'r15' | 'r30' | 'all_day';
export type DogAlone = 'fine' | 'a_while' | 'cannot';
export type DogNeutered = 'yes' | 'no';
export type DogOrigin = 'breeder' | 'shelter' | 'street' | 'bad_conditions' | 'loving_family' | 'other';
export type DogFeeding = 'kibble' | 'wet' | 'barf' | 'cooked';

// Semafor — orezaný na JEDEN riadok (Matej 2026-07-25 2. kolo: „nechajme len ako
// vychádza so psami semafor a potom čo nemá rád"). Všetky ostatné cieľové skupiny
// (samci/feny/malé/veľké/šteniatka/deti/cudzí/mačky) sa presunuli do otvorenej
// otázky `dislikedTypes` ako návrhové pills — pýtať sa 11× na semafor bolo veľa,
// a v praxi človek vymenuje len to, čo pes NEZNÁŠA.
export const DOG_COMPAT_KEYS = ['dogs_overall'] as const;
export type DogCompatKey = typeof DOG_COMPAT_KEYS[number];

export interface DogCard {
  // ── VRSTVA 1 — ZÁKLAD ──
  sizeClass?: 'S' | 'M' | 'L' | 'XL';
  neutered?: DogNeutered;
  heatLast?: string;            // ISO — len nekastrovaná fena; ruší skupinový výlet
  origin?: DogOrigin;
  originSince?: string;         // ISO — odkedy ho máš

  // ── VRSTVA 2a — AKO FUNGUJE ──
  fitness?: DogFitness;         // koľko MÔŽE (verejné — buddy inak naplánuje 25 km)
  range?: DogRange;
  obedience?: TrafficLight;     // dropdown (Matej 3. kolo: nie semafor)
  recall?: TrafficLight;        // samostatne — najdôležitejšia jedna vec pri off-leash
  alone?: DogAlone;             // sám na ubytovaní — rozhoduje o prespaní na tripe
  feeding?: DogFeeding[];       // Matej: do vrstvy 2, nie do vet

  // ── VRSTVA 2b — S KÝM (semafor, 1 riadok) ──
  compat: Partial<Record<DogCompatKey, TrafficLight>>;

  // ── VRSTVA 2c — otvorené otázky (voľný text + návrhové pills) ──
  // Hodnota je BUĎ kľúč z príslušného *_SUGGESTIONS (→ i18n label), ALEBO
  // vlastný text používateľa. Render rozlišuje členstvom v zozname návrhov.
  dislikedTypes: string[];      // „čo nemá rád" — typy psov + skupiny presunuté zo semaforu
  triggers: string[];           // nahrádza pole „agresivita" (self-report bias + stigma)
  fears: string[];
  joys: string[];
  quirks: string[];             // flavour, nefiltruje sa — bezpečnostné veci sú vyššie
}

export function emptyDogCard(): DogCard {
  return { compat: {}, dislikedTypes: [], triggers: [], fears: [], joys: [], quirks: [] };
}

export interface DogProfileAttrs {
  dogId: string;
  training: TrainingLevel;
  socialization: SocializationLevel;
  energy: EnergyLevel;          // koľko CHCE — párové s card.fitness (koľko môže)
  temperament: string[];        // chips: 'playful','protective','curious','gentle','independent','vocal'…
  sizeClass?: 'S' | 'M' | 'L' | 'XL'; // ak nie je v dogs row
  goodWith: Array<'dogs' | 'kids' | 'cats' | 'strangers'>;
  offLeashReliable?: boolean;
  bio: string;                  // voľný text, ≤200 znakov (trim + orez) — public (tier 'profile')
  tags: {
    temperament: DogTemperamentTag[]; // Povaha
    trail: DogTrailTag[];             // DEPRECATED v UI — viď DOG_TRAIL_TAGS
  };
  card: DogCard;
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
  emoji?: string; // font-native emoji prefix (zadanie-profil-kompakt-emoji-2026-07-24) — replaces <BrandIcon> in ProfilePill
  abbr?: string; // short code (e.g. 3-letter nationality) for compact pill display (zadanie-profil-shrink-2026-07-24)
  group?: PersonalityGroup; // sub-label grouping for the personality concentrate (zadanie-profil-koncentrat-2026-07-24)
}

export const ACTIVITY_OPTIONS: TaxonomyOption<ActivityTag>[] = [
  { value: 'hiking', labelEN: 'Hiking', icon: 'walk', emoji: '🥾' },
  { value: 'running', labelEN: 'Running', emoji: '🏃' },
  { value: 'camping', labelEN: 'Camping', icon: 'forest', emoji: '🏕️' },
  { value: 'swimming', labelEN: 'Swimming', icon: 'water', emoji: '🏊' },
  { value: 'cycling', labelEN: 'Cycling', icon: 'cycle', emoji: '🚴' },
  { value: 'city_walks', labelEN: 'City walks', emoji: '🏙️' },
  { value: 'mountains', labelEN: 'Mountains', icon: 'sun', emoji: '⛰️' },
  { value: 'water', labelEN: 'Water activities', icon: 'water', emoji: '🌊' },
  { value: 'training_meetups', labelEN: 'Training meetups', icon: 'graduate', emoji: '🎓' },
  { value: 'travel', labelEN: 'Travel', icon: 'globe', emoji: '✈️' },
];

export const VIBE_OPTIONS: TaxonomyOption<TripVibe>[] = [
  { value: 'chill', labelEN: 'Chill', icon: 'yinyang', emoji: '😌' },
  { value: 'adventure', labelEN: 'Adventure', icon: 'bow', emoji: '🧭' },
  { value: 'social', labelEN: 'Social', icon: 'people', emoji: '🎉' },
  { value: 'training', labelEN: 'Training', icon: 'graduate', emoji: '🎯' },
  { value: 'family', labelEN: 'Family', icon: 'house-heart', emoji: '👨‍👩‍👧' },
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

// ── full profile taxonómie — icon = len keď sedí sémanticky, inak necháva sa bez ──
export const GENDER_OPTIONS: TaxonomyOption<Gender>[] = [
  { value: 'male', labelEN: 'Male' },
  { value: 'female', labelEN: 'Female' },
  { value: 'other', labelEN: 'Other' },
  { value: 'undisclosed', labelEN: 'Prefer not to say' },
];

// Trimmed to single/taken only (zadanie-profil-blok1-rework-2026-07-24 — was
// 4 options incl. 'complicated'/'just_dogs', now rendered as 2 pills in BLOK 1's
// one-row pill layout). RelationshipStatus type keeps the wider union so any
// legacy-saved value still type-checks; the UI simply no longer offers them.
export const RELATIONSHIP_OPTIONS: TaxonomyOption<RelationshipStatus>[] = [
  { value: 'single', labelEN: 'Single', emoji: '💚' },
  { value: 'taken', labelEN: 'Taken', emoji: '❤️' },
];

// ── nationality (zadanie-profil-blok1-rework-2026-07-24) — ~20 najčastejších
// + 'other' catch-all, flag emoji per option, default 'SK' handled at the call
// site (select shows SK until the user actually picks something). ──
export const NATIONALITY_OPTIONS: TaxonomyOption<string>[] = [
  { value: 'SK', labelEN: 'Slovakia', emoji: '🇸🇰', abbr: 'SVK' },
  { value: 'CZ', labelEN: 'Czechia', emoji: '🇨🇿', abbr: 'CZE' },
  { value: 'PL', labelEN: 'Poland', emoji: '🇵🇱', abbr: 'POL' },
  { value: 'HU', labelEN: 'Hungary', emoji: '🇭🇺', abbr: 'HUN' },
  { value: 'AT', labelEN: 'Austria', emoji: '🇦🇹', abbr: 'AUT' },
  { value: 'DE', labelEN: 'Germany', emoji: '🇩🇪', abbr: 'DEU' },
  { value: 'UK', labelEN: 'United Kingdom', emoji: '🇬🇧', abbr: 'GBR' },
  { value: 'IE', labelEN: 'Ireland', emoji: '🇮🇪', abbr: 'IRL' },
  { value: 'US', labelEN: 'United States', emoji: '🇺🇸', abbr: 'USA' },
  { value: 'FR', labelEN: 'France', emoji: '🇫🇷', abbr: 'FRA' },
  { value: 'IT', labelEN: 'Italy', emoji: '🇮🇹', abbr: 'ITA' },
  { value: 'ES', labelEN: 'Spain', emoji: '🇪🇸', abbr: 'ESP' },
  { value: 'NL', labelEN: 'Netherlands', emoji: '🇳🇱', abbr: 'NLD' },
  { value: 'CH', labelEN: 'Switzerland', emoji: '🇨🇭', abbr: 'CHE' },
  { value: 'UA', labelEN: 'Ukraine', emoji: '🇺🇦', abbr: 'UKR' },
  { value: 'RO', labelEN: 'Romania', emoji: '🇷🇴', abbr: 'ROU' },
  { value: 'HR', labelEN: 'Croatia', emoji: '🇭🇷', abbr: 'HRV' },
  { value: 'SI', labelEN: 'Slovenia', emoji: '🇸🇮', abbr: 'SVN' },
  { value: 'PT', labelEN: 'Portugal', emoji: '🇵🇹', abbr: 'PRT' },
  { value: 'OTHER', labelEN: 'Other', emoji: '🏳️', abbr: 'OTH' },
];

export const PERSON_TYPE_OPTIONS: TaxonomyOption<PersonType>[] = [
  { value: 'sporty', labelEN: 'Sporty', icon: 'trophy', emoji: '🏅' },
  { value: 'active', labelEN: 'Active', icon: 'walk', emoji: '🚶' },
  { value: 'homebody', labelEN: 'Homebody', icon: 'house-heart', emoji: '🛋️' },
];

export const SMOKING_OPTIONS: TaxonomyOption<Smoking>[] = [
  { value: 'non_smoker', labelEN: 'Non-smoker', emoji: '🚭' },
  { value: 'socially', labelEN: 'Socially', emoji: '🚬' },
  { value: 'smoker', labelEN: 'Smoker', emoji: '🚬' },
  { value: 'vaper', labelEN: 'Vaper', emoji: '💨' },
];

export const DIET_OPTIONS: TaxonomyOption<Diet>[] = [
  { value: 'omnivore', labelEN: 'All eater', emoji: '🍖' },
  { value: 'vegetarian', labelEN: 'Vegetarian', emoji: '🥗' },
  { value: 'vegan', labelEN: 'Vegan', emoji: '🌱' },
  { value: 'healthy', labelEN: 'Healthy', emoji: '🍳' },
  { value: 'gourmet', labelEN: 'Gourmet', emoji: '🍽️' },
];

// Personality concentrate — 20 tags, 5 groups (zadanie-profil-koncentrat-2026-07-24
// ČASŤ A). Emoji exact per spec. `group` drives the pod-label rendering in
// PackProfile.tsx; all 20 share ONE max-10 selection limit.
export const PERSONALITY_OPTIONS: TaxonomyOption<PersonalityTag>[] = [
  { value: 'chill', labelEN: 'Chill', emoji: '😌', group: 'vibe' },
  { value: 'adventurous', labelEN: 'Adventurous', emoji: '🧭', group: 'vibe' },
  { value: 'social', labelEN: 'Social', emoji: '🎉', group: 'vibe' },
  { value: 'homebody', labelEN: 'Homebody', emoji: '🛋️', group: 'vibe' },
  { value: 'family', labelEN: 'Family', emoji: '👨‍👩‍👧', group: 'vibe' },
  { value: 'open_minded', labelEN: 'Open-minded', emoji: '🕊️', group: 'vibe' },
  { value: 'hiking', labelEN: 'Hiking', emoji: '🥾', group: 'active' },
  { value: 'camping', labelEN: 'Camping', emoji: '🏕️', group: 'active' },
  { value: 'sport', labelEN: 'Sport', emoji: '🏅', group: 'active' },
  { value: 'travel', labelEN: 'Travel', emoji: '✈️', group: 'active' },
  { value: 'art', labelEN: 'Art', emoji: '🎨', group: 'creative' },
  { value: 'music', labelEN: 'Music', emoji: '🎵', group: 'creative' },
  { value: 'books', labelEN: 'Books', emoji: '📚', group: 'creative' },
  { value: 'movies', labelEN: 'Movies', emoji: '🎬', group: 'creative' },
  { value: 'food', labelEN: 'Food', emoji: '🍽️', group: 'taste' },
  { value: 'coffee', labelEN: 'Coffee', emoji: '☕', group: 'taste' },
  { value: 'tea', labelEN: 'Tea', emoji: '🍵', group: 'taste' },
  { value: 'dog_training', labelEN: 'Dog training', emoji: '🐾', group: 'dog' },
  { value: 'dog_rescue', labelEN: 'Dog rescue', emoji: '🐕', group: 'dog' },
  { value: 'work_with_dog', labelEN: 'Work with dog', emoji: '🐕‍🦺', group: 'dog' },
];

export const PERSONALITY_GROUPS: { group: PersonalityGroup; label: string }[] = [
  { group: 'vibe', label: 'Vibe' },
  { group: 'active', label: 'Active' },
  { group: 'creative', label: 'Creative' },
  { group: 'taste', label: 'Taste' },
  { group: 'dog', label: 'Dogs' },
];

export const SMOKE_OPTIONS: TaxonomyOption<Smoke>[] = [
  { value: 'yes', labelEN: 'Yes', emoji: '🚬' },
  { value: 'no', labelEN: 'No', emoji: '🚭' },
];

export const WORK_OPTIONS: TaxonomyOption<Work>[] = [
  { value: 'business', labelEN: 'Business', emoji: '📈' },
  { value: 'employee', labelEN: 'Employee', emoji: '💼' },
  { value: 'free', labelEN: 'Free', emoji: '🕊️' },
  { value: 'study', labelEN: 'Study', emoji: '🎓' },
];

// ── PSIA KARTA — taxonómie (zadanie-psia-karta-2026-07-25) ───────────────────
export const DOG_FITNESS_OPTIONS: TaxonomyOption<DogFitness>[] = [
  { value: 'full', labelEN: 'Full strength', emoji: '💪' },
  { value: 'normal', labelEN: 'Normal', emoji: '🐾' },
  { value: 'take_it_easy', labelEN: 'Needs to take it easy', emoji: '🌿' },
];

export const DOG_RANGE_OPTIONS: TaxonomyOption<DogRange>[] = [
  { value: 'r5', labelEN: 'Up to 5 km' },
  { value: 'r15', labelEN: 'Up to 15 km' },
  { value: 'r30', labelEN: 'Up to 30 km' },
  { value: 'all_day', labelEN: 'All day' },
];

export const DOG_ALONE_OPTIONS: TaxonomyOption<DogAlone>[] = [
  { value: 'fine', labelEN: 'Totally fine' },
  { value: 'a_while', labelEN: 'A while, then not' },
  { value: 'cannot', labelEN: "Can't be alone" },
];

export const DOG_NEUTERED_OPTIONS: TaxonomyOption<DogNeutered>[] = [
  { value: 'yes', labelEN: 'Neutered' },
  { value: 'no', labelEN: 'Intact' },
];

export const DOG_ORIGIN_OPTIONS: TaxonomyOption<DogOrigin>[] = [
  { value: 'breeder', labelEN: 'Breeder', emoji: '📜' },
  { value: 'shelter', labelEN: 'Shelter', emoji: '🏠' },
  { value: 'street', labelEN: 'Street', emoji: '🌍' },
  { value: 'bad_conditions', labelEN: 'Bad conditions', emoji: '⛓️' },
  { value: 'loving_family', labelEN: 'Loving family', emoji: '💛' },
  { value: 'other', labelEN: 'Other' },
];

export const DOG_FEEDING_OPTIONS: TaxonomyOption<DogFeeding>[] = [
  { value: 'kibble', labelEN: 'Kibble', emoji: '🥣' },
  { value: 'wet', labelEN: 'Wet food', emoji: '🥫' },
  { value: 'barf', labelEN: 'BARF / raw', emoji: '🥩' },
  { value: 'cooked', labelEN: 'Home cooked', emoji: '🍲' },
];

// Skratky, nie slová (Matej 3. kolo) — ZÁKLAD má tri polia v jednom riadku,
// „Small/Medium/Large/Giant" by ho pretiekli.
export const DOG_SIZE_OPTIONS: TaxonomyOption<'S' | 'M' | 'L' | 'XL'>[] = [
  { value: 'S', labelEN: 'S' },
  { value: 'M', labelEN: 'M' },
  { value: 'L', labelEN: 'L' },
  { value: 'XL', labelEN: 'XL' },
];

// Dropdown varianty semaforu (Matej 3. kolo: „nedat na semafor ale na dropdown").
// Hodnoty ostávajú TrafficLight — mení sa len ovládací prvok a labely. Emoji bodka
// nesie farbu aj v natívnom <select> popupe, kde CSS nedosiahne.
// 2026-07-29 (Matej, o Poslušnosti): „nepáči sa mi odpoveď nie... skor sa
// zamerať na to že zvádnuté, závisí/učíme sa... nie moc vyčítavé". Tento set
// je zdieľaný (DOG_COMPAT_OPTIONS alias nižšie) medzi Poslušnosťou, Privolaním
// aj „S kým vychádza" — Matej odsúhlasil zjednotiť všade rovnako.
export const DOG_SKILL_OPTIONS: TaxonomyOption<TrafficLight>[] = [
  { value: 'green', labelEN: 'Mastered', emoji: '🟢' },
  { value: 'amber', labelEN: 'Depends', emoji: '🟡' },
  { value: 'red', labelEN: 'Still learning', emoji: '🔴' },
];
/** Alias — rovnaké hodnoty aj labely, len iné volacie miesto (čitateľnosť). */
export const DOG_COMPAT_OPTIONS = DOG_SKILL_OPTIONS;

/** Farby semaforu — zdieľané medzi `SelectRow toneOf` a legendou. */
export const TRAFFIC_COLORS: Record<TrafficLight, string> = {
  green: '#3D7A4E',  // PACK_THEME.growGreen
  amber: '#C99A3F',  // brand gold
  red: '#B25640',    // PACK_THEME.alertRed
};

// Semafor legenda — MUSÍ sa renderovať v UI, inak si každý vyloží farby inak.
export const TRAFFIC_OPTIONS: TaxonomyOption<TrafficLight>[] = [
  { value: 'green', labelEN: 'Mastered' },
  { value: 'amber', labelEN: 'Depends' },
  { value: 'red', labelEN: 'Still learning' },
];

// Semafor riadky — jediný zostávajúci: ako vychádza so psami.
export const DOG_COMPAT_ROWS: { key: DogCompatKey; labelEN: string; indent?: boolean }[] = [
  { key: 'dogs_overall', labelEN: 'With other dogs' },
];

// ── otvorené otázky: návrhové pills ──
// „Čo nemá rád" — dva pôvody návrhov:
//  1) TYP psa (nie plemeno). Psy nereagujú na plemeno, reagujú na typ; krátkonosé
//     majú stlačenú mimiku a nevedia signalizovať, preto ich veľa psov neznáša.
//  2) skupiny presunuté zo zrušených semafor riadkov (2. kolo škrtania) — človek
//     ich vymenuje rýchlejšie ako výpočet, než keby na každú klikal semafor.
export const DOG_DISLIKED_TYPE_SUGGESTIONS = [
  'big_dark', 'fluffy', 'curly', 'flat_faced', 'no_tail',
  'small_dogs', 'big_dogs', 'puppies', 'intact_males', 'intact_females',
  'kids', 'strangers', 'cats',
  'snow', 'rain', 'wet', 'water',
] as const;

export const DOG_TRIGGER_SUGGESTIONS = [
  'jump_on_back', 'at_food', 'at_toy', 'near_owner', 'on_leash', 'tight_space', 'cornered',
] as const;

export const DOG_FEAR_SUGGESTIONS = [
  'storm', 'fireworks', 'water', 'cars', 'strange_men', 'vacuum', 'stairs', 'vet',
  'big_animals',
] as const;

export const DOG_JOY_SUGGESTIONS = [
  'water', 'snow', 'mud', 'stick', 'ball', 'kids', 'food', 'car_rides', 'couch',
] as const;

export const DOG_QUIRK_SUGGESTIONS = [
  'eats_poop', 'rolls_in_poop', 'hunts', 'digs', 'barks_at_postman', 'steals_food', 'sleeps_in_bed',
  'pesters_dogs', 'marks_everything', 'buries_prey', 'chases_birds',
] as const;

export const INTENT_OPTIONS: TaxonomyOption<Intent>[] = [
  { value: 'trip_buddies', labelEN: 'Trip buddies', icon: 'walk', emoji: '🥾' },
  { value: 'dog_playdates', labelEN: 'Dog playdates', icon: 'paw', emoji: '🐕' },
  { value: 'friendship', labelEN: 'Friendship', icon: 'people', emoji: '🤝' },
  { value: 'dating', labelEN: 'Dating', icon: 'heart', emoji: '💘' },
  { value: 'community', labelEN: 'Just the community', icon: 'heartpaw', emoji: '🏛️' },
];

// Default viditeľnosť — override žije v human.visibility (getTier nižšie).
// trip: fajčenie je LOCKED (Matej) — dealbreaker pri turistike so psom, viditeľné aj na výlete.
export const DEFAULT_VISIBILITY: Record<ProfileFieldKey, VisTier> = {
  languages: 'trip',
  interests: 'trip',
  vibes: 'trip',
  personType: 'trip',
  smoke: 'trip',
  gender: 'profile',
  age: 'profile',
  relationship: 'profile',
  dogVoiceBio: 'profile',
  bio: 'profile',
  diet: 'profile',
  intents: 'profile',
  region: 'profile',
};

export function getTier(profile: CentralProfile, key: ProfileFieldKey): VisTier {
  return profile.human.visibility[key] ?? DEFAULT_VISIBILITY[key];
}

// Skryté = user si to sám vypol cez oko pri identity riadku. Jediná otázka, ktorú
// UI dnes kladie (viď komentár pri VisTier) — všetko ostatné vidí celý pack.
export function isHidden(profile: CentralProfile | null, key: ProfileFieldKey): boolean {
  return !!profile && getTier(profile, key) === 'private';
}

// Polia identity riadku, ktoré sa dajú skryť. Počet psov zámerne NIE — pes je
// dôvod, prečo tu človek je. Národnosť tiež NIE — „nechaj viditeľné furt"
// (Matej 2026-07-25). Druhý riadok (status/fajčenie/strava/práca) oko nemá:
// je dobrovoľný, kto ho nechce ukázať, nevyplní ho.
export const HIDEABLE_IDENTITY_FIELDS: { key: ProfileFieldKey; emoji: string; labelEN: string }[] = [
  { key: 'age', emoji: '🎂', labelEN: 'Age' },
  { key: 'region', emoji: '📍', labelEN: 'City' },
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

  return {
    dogId: seed, training, socialization, energy, temperament, sizeClass, goodWith, offLeashReliable,
    bio: '', tags: { temperament: [], trail: [] }, card: emptyDogCard(),
  };
}

// Migrácia starých localStorage recordov (uložených pred zadanie-profil-read-dog-2026-07-25 /
// zadanie-psia-karta-2026-07-25) — chýbajúce bio/tags/card → default prázdne, žiadny crash.
function normalizeDogAttrs(d: Partial<DogProfileAttrs>): DogProfileAttrs {
  // Anotácia typu je potrebná: bez nej sa `{}` odvodí ako typ `{}` a všetkých 7 prístupov
  // nižšie (c.compat, c.triggers…) hodí TS2339 „Property does not exist on type '{}'".
  const c: Partial<DogCard> = d.card ?? {};
  return {
    ...(d as DogProfileAttrs),
    bio: d.bio ?? '',
    tags: { temperament: d.tags?.temperament ?? [], trail: d.tags?.trail ?? [] },
    card: {
      ...c,
      compat: c.compat ?? {},
      dislikedTypes: c.dislikedTypes ?? [],
      triggers: c.triggers ?? [],
      fears: c.fears ?? [],
      joys: c.joys ?? [],
      quirks: c.quirks ?? [],
      // sizeClass žil na attrs, karta ho preberá — nech sa staré dáta neztratia
      sizeClass: c.sizeClass ?? d.sizeClass,
    },
  };
}

// Koľko z ĽUDSKÉHO profilu je vyplnené — poháňa progress v hlavičke sekcie
// „WHO YOU ARE" (Matej 2026-07-26: „ukázať stav vyplnenia profilu").
//
// Zámerne sa počítajú len polia, ktoré user reálne vyplňuje na /pack/profile,
// a každé váži rovnako — je to motivačný ukazovateľ, nie skóre. `avatar` a
// `name` žijú v Supabase user_metadata (nie v HumanProfile), preto ich stránka
// dopĺňa cez `extra` — inak by profil nikdy nemohol byť na 100 %.
export interface CompletionStep { key: string; labelEN: string; done: boolean }

export function humanProfileCompletion(
  human: HumanProfile | undefined,
  extra: CompletionStep[] = [],
): { filled: number; total: number; pct: number; steps: CompletionStep[]; missing: CompletionStep[] } {
  const has = (v: unknown) => v !== undefined && v !== null && v !== '';
  const steps: CompletionStep[] = [
    ...extra,
    { key: 'gender', labelEN: 'Gender', done: has(human?.gender) },
    { key: 'age', labelEN: 'Age', done: has(human?.age) },
    { key: 'nationality', labelEN: 'Nationality', done: has(human?.nationality) },
    { key: 'region', labelEN: 'City', done: has(human?.region) },
    { key: 'relationship', labelEN: 'Status', done: has(human?.relationship) },
    { key: 'smoke', labelEN: 'Smoke', done: has(human?.smoke) },
    { key: 'diet', labelEN: 'Diet', done: has(human?.diet) },
    { key: 'work', labelEN: 'Work', done: has(human?.work) },
    { key: 'dogVoiceBio', labelEN: 'Bio', done: has(human?.dogVoiceBio) },
    { key: 'personality', labelEN: 'Personality', done: (human?.personality?.length ?? 0) > 0 },
  ];
  const filled = steps.filter((s) => s.done).length;
  const total = steps.length;
  return {
    filled,
    total,
    pct: total === 0 ? 0 : Math.round((filled / total) * 100),
    steps,
    missing: steps.filter((s) => !s.done),
  };
}

// Koľko z karty je vyplnené — poháňa „Hekthor je na 40 % spoznaný" progress.
export function dogCardCompletion(card: DogCard): { filled: number; total: number; pct: number } {
  const scalars: Array<unknown> = [
    card.sizeClass, card.neutered, card.origin,
    card.fitness, card.range, card.obedience, card.recall, card.alone,
  ];
  const lists: Array<unknown[]> = [
    card.feeding ?? [], card.dislikedTypes, card.triggers, card.fears, card.joys, card.quirks,
  ];
  const compatFilled = DOG_COMPAT_ROWS.some((r) => card.compat[r.key]) ? 1 : 0;
  const filled =
    scalars.filter((v) => v !== undefined && v !== null && v !== '').length +
    lists.filter((l) => l.length > 0).length +
    compatFilled;
  const total = scalars.length + lists.length + 1;
  return { filled, total, pct: Math.round((filled / total) * 100) };
}

// ── localStorage CRUD (async-tvarované kvôli budúcemu Supabase swapu) ──
const STORAGE_KEY = 'dogypt.profile.v1';

function emptyProfile(): CentralProfile {
  return {
    human: { interests: [], vibes: [], languages: [], intents: [], personality: [], visibility: {} },
    dogs: {},
    updatedAt: new Date(0).toISOString(),
  };
}

function readRaw(): CentralProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProfile();
    const parsed = JSON.parse(raw) as Partial<CentralProfile>;
    const rawDogs = parsed.dogs ?? {};
    return {
      human: {
        interests: [], vibes: [], languages: [], intents: [], personality: [], visibility: {},
        ...parsed.human,
      },
      dogs: Object.fromEntries(Object.entries(rawDogs).map(([id, d]) => [id, normalizeDogAttrs(d)])),
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
