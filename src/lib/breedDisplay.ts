import breedsData from '@/data/breeds.json';

type Breed = { en: string; sk: string };
type BreedsFile = { version: string; breeds: Breed[] };
const BREEDS = (breedsData as BreedsFile).breeds;

// en (lowercased, trimmed) → sk. Storage is EN-canonical (breeds.json `en`),
// so this map covers every breed a user can actually pick.
const EN_TO_SK: Record<string, string> = Object.fromEntries(
  BREEDS.map((b) => [b.en.trim().toLowerCase(), b.sk]),
);

// Tokens stored verbatim by BreedPatronScreen (and legacy paths).
const SPECIAL_SK: Record<string, string> = {
  mixed: 'Kríženec',
  unknown: 'Neznáme',
  other: 'Iné',
};

/**
 * Localized DISPLAY name for a stored breed string. Storage stays EN-canonical
 * (breeds.json `en`); this only swaps the label so SK users don't see English.
 *
 * Only SK has translations in breeds.json — every other language falls back to
 * the EN string. Comma-joined mixes ("German Shepherd, Poodle") are localized
 * part by part. Unknown strings are returned unchanged (never empty).
 */
export function localizeBreed(breed: string | null | undefined, lang: string): string {
  if (!breed) return '';
  if (lang !== 'sk') return breed;
  return breed
    .split(',')
    .map((part) => {
      const key = part.trim().toLowerCase();
      if (!key) return part;
      return SPECIAL_SK[key] ?? EN_TO_SK[key] ?? part.trim();
    })
    .join(', ');
}
