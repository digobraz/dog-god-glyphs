// KEDY SA IDE — PRESNOSŤ PLÁNU (Matej 2026-08-25).
//
// „v 2. kroku je nelogicke dátum nepamatam si a bol som vonku viac dní... to je hluposť -
//  absurdné skor tam by mala byť možnosť bud pevný dátum alebo len okruhly mesiac a týždeň
//  v ňom alebo len mesiac"
//
// Mal pravdu: obe voľby, ktoré tam stáli, sú o MINULOSTI. Dátum výletu, ktorý sa ešte nekonal,
// nikto nezabudol a nikto ešte nikde nebol. Plán má naopak vlastnú neurčitosť — „15. septembra"
// vie málokto, „niekedy v druhom septembrovom týždni" vie skoro každý.
//
// ⚠️ PRESNOSŤ NESIE SÁM REŤAZEC, NIE DRUHÉ POLE. `HeroTrail.date` aj `TripPlan.date` sú obyčajné
// texty, ktoré cestujú cez localStorage aj Supabase; druhý stĺpec „a akej je to presnosti" by sa
// s nimi musel voziť všade a pri prvom zabudnutí by plán tvrdil deň, ktorý nikto nepovedal.
// Tri tvary, rozoznateľné na pohľad aj regexom:
//    '2026-09-15'  presný deň
//    '2026-09-W2'  druhý týždeň septembra
//    '2026-09'     niekedy v septembri
// Rovnaká konvencia ako doteraz („dĺžka nesie presnosť": 'YYYY-MM-DD' vs 'YYYY-MM'), len s
// jedným tvarom navyše.

export type PlanPrecision = 'exact' | 'week' | 'month';

const RE_EXACT = /^\d{4}-\d{2}-\d{2}$/;
const RE_WEEK = /^(\d{4}-\d{2})-W([1-5])$/;
const RE_MONTH = /^\d{4}-\d{2}$/;

export interface PlanDate {
  precision: PlanPrecision;
  /** 'YYYY-MM' — vždy k dispozícii, nech sa dá zoskupovať podľa mesiaca. */
  month: string;
  /** 1–5, len pri `week`. Týždeň sa počíta od 1. dňa mesiaca, nie podľa ISO. */
  week?: number;
  /** 'YYYY-MM-DD', len pri `exact`. */
  day?: string;
}

export function parsePlanDate(s: string | undefined | null): PlanDate | null {
  if (!s) return null;
  if (RE_EXACT.test(s)) return { precision: 'exact', month: s.slice(0, 7), day: s };
  const w = RE_WEEK.exec(s);
  if (w) return { precision: 'week', month: w[1], week: Number(w[2]) };
  if (RE_MONTH.test(s)) return { precision: 'month', month: s };
  return null;
}

export function buildPlanDate(precision: PlanPrecision, month: string, dayOrWeek?: string | number): string {
  if (precision === 'exact') return typeof dayOrWeek === 'string' ? dayOrWeek : '';
  if (precision === 'week') return month && dayOrWeek ? `${month}-W${dayOrWeek}` : '';
  return month;
}

/**
 * POSLEDNÝ DEŇ, KTORÝ PLÁN EŠTE POKRÝVA — 'YYYY-MM-DD'.
 *
 * Toto je jediné číslo, ktoré potrebuje pripomienka „bol si tam?": pri presnom dátume je to ten
 * deň, pri týždni jeho koniec, pri mesiaci koniec mesiaca. Pýtať sa v pondelok na výlet, ktorý
 * má človek naplánovaný „niekedy v septembri", je tá istá chyba ako pýtať sa ho, či si pamätá
 * dátum, na ktorý sa práve chystá.
 */
export function planDeadline(s: string | undefined | null): string | null {
  const p = parsePlanDate(s);
  if (!p) return null;
  if (p.precision === 'exact') return p.day!;
  const [y, m] = p.month.split('-').map(Number);
  const lastOfMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (p.precision === 'month') return `${p.month}-${String(lastOfMonth).padStart(2, '0')}`;
  // Týždne krájame po sedem dní od prvého; posledný sa zastaví na konci mesiaca, takže
  // „5. týždeň" v krátkom mesiaci nevyrobí 35. deň.
  const end = Math.min(p.week! * 7, lastOfMonth);
  return `${p.month}-${String(end).padStart(2, '0')}`;
}

/**
 * PRVÝ DEŇ, OD KTORÉHO MÁ ZMYSEL SA PÝTAŤ — 'YYYY-MM-DD'.
 * Pri presnom dátume je to ten istý deň; pri týždni jeho pondelok-ekvivalent (1., 8., 15., …).
 */
export function planStart(s: string | undefined | null): string | null {
  const p = parsePlanDate(s);
  if (!p) return null;
  if (p.precision === 'exact') return p.day!;
  if (p.precision === 'month') return `${p.month}-01`;
  return `${p.month}-${String((p.week! - 1) * 7 + 1).padStart(2, '0')}`;
}

/**
 * ČITATEĽNÝ TVAR TERMÍNU — jeden pre všetky povrchy.
 *
 * Presnosť nesie sám reťazec, tak ju nesie aj popisok: „22. 8. 2026" pri dni, „2. týždeň ·
 * 9/2026" pri týždni, „9/2026" pri mesiaci. Bez tohto sa surové `2026-09` dostane na
 * obrazovku ako debug výpis (presne to robil `shortDate()` v `TripSpotlight` — `new Date`
 * ho neprečítal a vrátil vstup nezmenený).
 *
 * Mesiac sa píše ČÍSLOM zámerne: názov mesiaca by si vypýtal vlastnú tabuľku v 18 jazykoch
 * kvôli jednému riadku na dvoch kartách.
 *
 * @param weekLabel preklad „{n}. týždeň" — modul zámerne nevie o i18n.
 */
export function planDateLabel(s: string | undefined | null, weekLabel: (n: number) => string): string {
  const p = parsePlanDate(s);
  if (!p) return '';
  const [y, m] = p.month.split('-');
  const my = `${Number(m)}/${y}`;
  if (p.precision === 'exact') {
    const d = new Date(`${p.day}T00:00:00`);
    return Number.isNaN(d.getTime()) ? p.day! : `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
  }
  if (p.precision === 'week') return `${weekLabel(p.week!)} · ${my}`;
  return my;
}
