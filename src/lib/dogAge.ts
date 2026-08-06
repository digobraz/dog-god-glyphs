// ============================================================================
// Vek psa — JEDEN zdroj pravdy. Predtým žil len vnútri PackDogDetail.tsx; keď
// pribudli "dni nažive" do svorky na `/pack` (blok 2), kópia by sa rozišla —
// hlavne poistka na deceased psa bez dátumu úmrtia (viď `awaitingDeathDate`).
// ============================================================================

export interface DogAge {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  humanYears: number; // zlaté „≈ N v ľudských rokoch" (×7)
}

/** Minimum, ktoré potrebuje výpočet — nie celý riadok z `dogs`. */
export interface DogLifeInput {
  selections?: Record<string, string> | null;
  birth_year?: number | null;
  life_status?: string | null;   // 'alive' | 'deceased'
  death_date?: string | null;
}

export function computeAge(
  selections: Record<string, string> | null | undefined,
  fallbackYear: number | null | undefined,
  asOf?: Date,           // deceased pes → vek zamrzne k dátumu úmrtia
): DogAge | null {
  const y = parseInt(selections?.birthdayYear || '', 10) || fallbackYear || 0;
  if (!y || y < 1990) return null;
  const m = parseInt(selections?.birthdayMonth || '', 10) || 1;
  const d = parseInt(selections?.birthdayDay || '', 10) || 1;
  const birth = new Date(y, m - 1, d);
  const now = asOf ?? new Date();
  if (birth > now) return null;

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const totalDays = Math.floor((now.getTime() - birth.getTime()) / 86_400_000);
  const humanYears = Math.max(1, Math.round((totalDays / 365.25) * 7));
  return { years, months, days, totalDays, humanYears };
}

export interface DogLifeLine {
  /** Počet dní na zobrazenie — buď nažive, alebo v anjelskej podobe. */
  days: number | null;
  /** true = pes je po smrti a `days` ráta dni OD úmrtia, nie od narodenia. */
  isAngel: boolean;
  /** Vek k správnemu dňu (deceased = zamrznutý ku dňu úmrtia). */
  age: DogAge | null;
}

/**
 * Jeden riadok života psa pre zoznamy a karty.
 *
 * Deceased pes BEZ zapísaného dátumu úmrtia vráti `days: null` — bez toho by
 * `asOf` spadlo na dnešok a počítadlo „žije si naplno" by majiteľovi rástlo deň
 * čo deň, akoby pes stále žil.
 */
export function dogLifeLine(dog: DogLifeInput): DogLifeLine {
  const isDeceased = dog.life_status === 'deceased';
  const deathDate = dog.death_date ? new Date(dog.death_date) : null;

  if (isDeceased) {
    if (!deathDate) return { days: null, isAngel: true, age: null };
    const age = computeAge(dog.selections, dog.birth_year, deathDate);
    const angelDays = Math.max(0, Math.floor((Date.now() - deathDate.getTime()) / 86_400_000));
    return { days: angelDays, isAngel: true, age };
  }

  const age = computeAge(dog.selections, dog.birth_year);
  return { days: age?.totalDays ?? null, isAngel: false, age };
}
