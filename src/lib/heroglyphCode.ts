/**
 * Heroglyph Code – canonical 16-segment identifier for each dog.
 *
 * Schema (per `feedback_dogypt_unique_code.md` 2026-04-30, definitive):
 *
 *   1.  A-Z       — first letter of dog name
 *   2.  XY/XX     — dog gender (king=XY, queen=XX)
 *   3.  M/R/S     — dog colour (dark=M, mix=R, bright=S)
 *   4.  P/L       — dog fate (raised/puppy=P Pacifier, rescued/adopted=L Lifebuoy)
 *   5.  E/S       — dog bloodline (mutt=E, aristocrat=S)
 *   6.  CC        — patron category (01–10) from breeds.json
 *   7.  PP        — patron number in category (00 reserved Hekthor only)
 *   8.  XY/XX     — owner gender
 *   9.  CH01-12   — owner Chinese zodiac index, prefixed CH
 *   10. Z01-12    — owner Western zodiac index, prefixed Z
 *   11. A-Z       — first letter of owner name
 *   12. 01+       — ranking (which dog of the owner) zero-padded 2 digits
 *   13. char₁     — first character 2-letter code (GU/EN/MV/WA/GO/LO/CH/PL)
 *   14. char₂     — second character 2-letter code
 *   15. SVK       — country ISO 3166-1 alpha-3
 *   16. YYYY      — dog birthday year
 *
 * Joined with '-' separator. Missing values fall back to 'X' (single seg)
 * or 'XX' / 'XXXX' for multi-character segments.
 */

import { useDogyptStore } from '@/store/dogyptStore';
import breedsData from '@/data/breeds.json';

type Breed = { id: number; en: string; sk: string; patron: string; group: string };
type BreedsFile = { version: string; breeds: Breed[] };
const BREEDS = (breedsData as BreedsFile).breeds;

// ---------------------------------------------------------------------------
// Segment maps
// ---------------------------------------------------------------------------

const DOG_GENDER_TO_CODE: Record<string, string> = {
  king: 'XY',
  queen: 'XX',
  male: 'XY',
  female: 'XX',
};

const OWNER_GENDER_TO_CODE: Record<string, string> = {
  man: 'XY',
  woman: 'XX',
  male: 'XY',
  female: 'XX',
};

const DOG_COLOUR_TO_CODE: Record<string, string> = {
  dark: 'M',
  mix: 'R',
  bright: 'S',
};

// LOCK 2026-06-06 (plany/heroglyph-kod-symboly.md): osud OPRAVENÝ (predtým prehodené).
//   raised (od šteňaťa) = Pacifier (dudlík) = P
//   rescued (zachránený) = Lifebuoy (záchranné koleso) = L
const DOG_FATE_TO_CODE: Record<string, string> = {
  raised: 'P',
  puppy: 'P',      // alias (wizardSteps legacy)
  pacifier: 'P',
  rescued: 'L',
  adopted: 'L',
  lifebuoy: 'L',
};

const DOG_BLOODLINE_TO_CODE: Record<string, string> = {
  mutt: 'E',
  aristocrat: 'S',
};

const CHINESE_ZODIAC_ORDER = [
  'Rat',     // 01
  'Ox',      // 02
  'Tiger',   // 03
  'Rabbit',  // 04
  'Dragon',  // 05
  'Snake',   // 06
  'Horse',   // 07
  'Goat',    // 08
  'Monkey',  // 09
  'Rooster', // 10
  'Dog',     // 11
  'Pig',     // 12
];

const WESTERN_ZODIAC_ORDER = [
  'Aries',       // 01
  'Taurus',      // 02
  'Gemini',      // 03
  'Cancer',      // 04
  'Leo',         // 05
  'Virgo',       // 06
  'Libra',       // 07
  'Scorpio',     // 08
  'Sagittarius', // 09
  'Capricorn',   // 10
  'Aquarius',    // 11
  'Pisces',      // 12
];

// LOCK 2026-06-06 (plany/heroglyph-kod-symboly.md): 2-PÍSMENOVÉ kódy, unikátne iniciály.
// Hodnoty zľava = `value` z DogCharacterScreen + aliasy (legacy/wizardSteps).
//   Guardian GU 👁️ · Energizer EN 🔋 · Maverick MV ☠️ · Waterlover WA 🌊
//   Gourmet GO 🥣 · Lover LO 💘 · Chiller CH 🛋️ · Player PL 🎾
// (Founder účty môžu mať v DB ručnú výnimku v char segmente — číta sa ako bežný kód.)
const CHARACTER_TO_CODE: Record<string, string> = {
  watcher: 'GU',     guardian: 'GU',
  hyperactive: 'EN', energizer: 'EN',
  pirate: 'MV',      maverick: 'MV',    savage: 'MV',
  waterlover: 'WA',  poseidog: 'WA',
  gourmet: 'GO',
  lover: 'LO',
  chillman: 'CH',    chiller: 'CH',     chillmaster: 'CH',
  playful: 'PL',     player: 'PL',      aporter: 'PL',  gamer: 'PL',
};

// ISO 3166-1 alpha-3 lookup. Covers EN + SK names of common destinations
// for DOGYPT pre-launch (SK + EU + major English-speaking + worldwide subset).
const COUNTRY_TO_ISO3: Record<string, string> = {
  // Slovak names
  'slovensko': 'SVK',
  'česko': 'CZE',
  'cesko': 'CZE',
  'maďarsko': 'HUN',
  'madarsko': 'HUN',
  'rakúsko': 'AUT',
  'rakusko': 'AUT',
  'poľsko': 'POL',
  'polsko': 'POL',
  'nemecko': 'DEU',
  'francúzsko': 'FRA',
  'francuzsko': 'FRA',
  'taliansko': 'ITA',
  'španielsko': 'ESP',
  'spanielsko': 'ESP',
  'spojené štáty': 'USA',
  'spojene staty': 'USA',
  'spojené kráľovstvo': 'GBR',
  'spojene kralovstvo': 'GBR',

  // English names (matches CheckoutScreen COUNTRIES list)
  'slovakia': 'SVK',
  'czechia': 'CZE',
  'czech republic': 'CZE',
  'hungary': 'HUN',
  'austria': 'AUT',
  'poland': 'POL',
  'germany': 'DEU',
  'france': 'FRA',
  'italy': 'ITA',
  'spain': 'ESP',
  'united states': 'USA',
  'usa': 'USA',
  'united kingdom': 'GBR',
  'uk': 'GBR',
  'ireland': 'IRL',
  'netherlands': 'NLD',
  'belgium': 'BEL',
  'luxembourg': 'LUX',
  'switzerland': 'CHE',
  'liechtenstein': 'LIE',
  'denmark': 'DNK',
  'sweden': 'SWE',
  'norway': 'NOR',
  'finland': 'FIN',
  'iceland': 'ISL',
  'portugal': 'PRT',
  'greece': 'GRC',
  'cyprus': 'CYP',
  'malta': 'MLT',
  'estonia': 'EST',
  'latvia': 'LVA',
  'lithuania': 'LTU',
  'romania': 'ROU',
  'bulgaria': 'BGR',
  'croatia': 'HRV',
  'slovenia': 'SVN',
  'serbia': 'SRB',
  'montenegro': 'MNE',
  'bosnia and herzegovina': 'BIH',
  'north macedonia': 'MKD',
  'albania': 'ALB',
  'ukraine': 'UKR',
  'belarus': 'BLR',
  'moldova': 'MDA',
  'russia': 'RUS',
  'turkey': 'TUR',
  'canada': 'CAN',
  'mexico': 'MEX',
  'brazil': 'BRA',
  'argentina': 'ARG',
  'chile': 'CHL',
  'australia': 'AUS',
  'new zealand': 'NZL',
  'japan': 'JPN',
  'south korea': 'KOR',
  'china': 'CHN',
  'india': 'IND',
  'singapore': 'SGP',
  'south africa': 'ZAF',
  'israel': 'ISR',
  'united arab emirates': 'ARE',
  'saudi arabia': 'SAU',
  'egypt': 'EGY',
  'morocco': 'MAR',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const upper = (v: unknown) => (typeof v === 'string' ? v.trim() : '').toUpperCase();
const lower = (v: unknown) => (typeof v === 'string' ? v.trim() : '').toLowerCase();

function firstLetter(name: string): string {
  const ch = (name || '').trim().charAt(0).toUpperCase();
  return /^[A-Z]$/.test(ch) ? ch : 'X';
}

function pad2(n: number | string | undefined): string {
  const num = typeof n === 'string' ? parseInt(n, 10) : (n ?? NaN);
  if (!Number.isFinite(num) || num < 0) return 'XX';
  return String(num).padStart(2, '0');
}

function chineseIndex(name: string | undefined): string {
  const idx = CHINESE_ZODIAC_ORDER.findIndex(
    (n) => n.toLowerCase() === lower(name)
  );
  return idx >= 0 ? `CH${pad2(idx + 1)}` : 'CHXX';
}

function westernIndex(name: string | undefined): string {
  const idx = WESTERN_ZODIAC_ORDER.findIndex(
    (n) => n.toLowerCase() === lower(name)
  );
  return idx >= 0 ? `Z${pad2(idx + 1)}` : 'ZXX';
}

function patronCC_PP(input: HeroglyphCodeInput): { cc: string; pp: string } {
  // Prefer explicit patronSvg / patronCategory from store (richest source).
  // patronSvg is something like "08-01.svg".
  const svg = input.patronSvg || '';
  const m = svg.match(/(\d{2})-(\d{2})/);
  if (m) return { cc: m[1], pp: m[2] };

  // Fallback: derive from breed name via breeds.json
  const breedName = (input.breed || input.selections?.breed || '').trim();
  if (breedName) {
    const breed = BREEDS.find(
      (b) => b.en.toLowerCase() === breedName.toLowerCase() ||
             b.sk.toLowerCase() === breedName.toLowerCase()
    );
    if (breed) {
      const m2 = breed.patron.match(/(\d{2})-(\d{2})/);
      if (m2) return { cc: m2[1], pp: m2[2] };
    }
  }

  // patronCategory only (group fallback)
  if (input.patronCategory && /^\d{2}$/.test(input.patronCategory)) {
    return { cc: input.patronCategory, pp: 'XX' };
  }

  return { cc: 'XX', pp: 'XX' };
}

function countryISO3(country: string | undefined): string {
  if (!country) return 'XXX';
  const key = country.trim().toLowerCase();
  if (COUNTRY_TO_ISO3[key]) return COUNTRY_TO_ISO3[key];
  // Fallback: first 3 letters uppercase, A-Z only.
  const cleaned = country.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return cleaned.length >= 3 ? cleaned.slice(0, 3) : 'XXX';
}

function characterCode(value: string | undefined): string {
  if (!value) return 'XX';
  const code = CHARACTER_TO_CODE[value.toLowerCase()];
  if (code) return code;
  // Fallback: first two letters uppercase
  const ch = value.trim().slice(0, 2).toUpperCase();
  return /^[A-Z]{2}$/.test(ch) ? ch : 'XX';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface HeroglyphCodeInput {
  /** Dog name (used for first letter, pos 1). */
  dogName?: string;
  /** Owner name (used for first letter, pos 11). */
  ownerName?: string;
  /** Breed display name (fallback for patron lookup). */
  breed?: string;
  /** Patron SVG filename, e.g. "08-01.svg" — preferred source for CC-PP. */
  patronSvg?: string;
  /** Patron category id ("01"–"10"), fallback if patronSvg missing. */
  patronCategory?: string;
  /** Country (EN or SK common name). */
  country?: string;
  /** Selections record from store (dogGender, dogColour, dogFate, ...). */
  selections: Record<string, string>;
}

/**
 * Build the canonical 16-segment heroglyph code.
 *
 * Hektor's golden case (LOCK 2026-06-06 — 2-letter chars + fate swap):
 *   buildHeroglyphCode({
 *     dogName: 'Hektor', ownerName: 'Matej',
 *     patronSvg: '08-00.svg', country: 'Slovensko',
 *     selections: {
 *       dogGender: 'king', dogColour: 'dark', dogFate: 'rescued',
 *       dogBloodline: 'mutt', ownerGender: 'man',
 *       ownerChineseZodiac: 'Rooster', ownerZodiac: 'Leo',
 *       ranking: '1', dogCharacter1: 'playful', dogCharacter2: 'waterlover',
 *       birthdayYear: '2016',
 *     },
 *   })
 * → "H-XY-M-L-E-08-00-XY-CH10-Z05-M-01-PL-WA-SVK-2016"
 */
export function buildHeroglyphCode(
  raw: HeroglyphCodeInput | Record<string, string>
): string {
  // Backwards-compat: legacy callers passed just `selections` (Record<string, string>).
  // Detect that shape and rewrap.
  const isLegacy =
    !!raw && typeof raw === 'object' && !('selections' in raw);
  const input: HeroglyphCodeInput = isLegacy
    ? {
        dogName: (raw as Record<string, string>).dogName,
        ownerName: (raw as Record<string, string>).ownerName,
        breed: (raw as Record<string, string>).breed,
        patronSvg: (raw as Record<string, string>).patronSvg,
        patronCategory: (raw as Record<string, string>).patronCategory,
        country:
          (raw as Record<string, string>).country ||
          (raw as Record<string, string>).ownerCountry,
        selections: raw as Record<string, string>,
      }
    : (raw as HeroglyphCodeInput);

  const sel = input.selections || {};

  const pos1  = firstLetter(input.dogName || sel.dogName || '');
  const pos2  = DOG_GENDER_TO_CODE[lower(sel.dogGender)] || 'XX';
  const pos3  = DOG_COLOUR_TO_CODE[lower(sel.dogColour)] || 'X';
  const pos4  = DOG_FATE_TO_CODE[lower(sel.dogFate)] || 'X';
  const pos5  = DOG_BLOODLINE_TO_CODE[lower(sel.dogBloodline)] || 'X';
  const { cc: pos6, pp: pos7 } = patronCC_PP(input);
  const pos8  = OWNER_GENDER_TO_CODE[lower(sel.ownerGender)] || 'XX';
  const pos9  = chineseIndex(sel.ownerChineseZodiac);
  const pos10 = westernIndex(sel.ownerZodiac);
  const pos11 = firstLetter(input.ownerName || sel.ownerName || '');
  const pos12 = pad2(sel.ranking);
  const pos13 = characterCode(sel.dogCharacter1);
  const pos14 = characterCode(sel.dogCharacter2);
  const pos15 = countryISO3(input.country || sel.country || sel.ownerCountry);
  const pos16 = /^\d{4}$/.test(sel.birthdayYear || '') ? sel.birthdayYear : 'XXXX';

  return [
    pos1, pos2, pos3, pos4, pos5,
    pos6, pos7,
    pos8, pos9, pos10, pos11, pos12,
    pos13, pos14,
    pos15, pos16,
  ].join('-');
}

/**
 * Convenience: build a HeroglyphCodeInput from the live Zustand store.
 * Use this in components that don't yet have a session-data object.
 */
export function getHeroglyphCodeInputFromStore(): HeroglyphCodeInput {
  const s = useDogyptStore.getState();
  return {
    dogName: s.dogName,
    ownerName: s.ownerName,
    breed: s.breed,
    patronSvg: s.patronSvg,
    patronCategory: s.patronCategory,
    country: s.selections?.country || s.selections?.ownerCountry,
    selections: s.selections,
  };
}

/**
 * Backwards-compatible signature: callers that only have a `selections` record
 * can still call the util. Note: the resulting code will fall back to 'X'
 * placeholders for fields that live outside `selections` (dogName, ownerName,
 * patronSvg, country) unless those keys exist inside the record.
 */
export function buildHeroglyphCodeFromSelections(
  selections: Record<string, string>
): string {
  return buildHeroglyphCode({
    dogName: selections.dogName,
    ownerName: selections.ownerName,
    breed: selections.breed,
    patronSvg: selections.patronSvg,
    patronCategory: selections.patronCategory,
    country: selections.country || selections.ownerCountry,
    selections,
  });
}
