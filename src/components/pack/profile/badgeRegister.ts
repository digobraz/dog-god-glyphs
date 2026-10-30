// ⚠️ GENEROVANÉ — needituj. Zdroj: plany/nakresy/odznaky-zbierka/register.json
// Prepis: node scripts/gen-badge-register.mjs (z koreňa ~/AI/DOGYPT).
// Mená a „za čo" sú v i18n: pack.badge.<id> · pack.badge.<id>.for

export interface BadgeFamily { id: string; symbol: string; prahy: readonly number[] }

/** 23 rodín s radom prahov, v poradí registra. */
export const BADGE_FAMILIES: readonly BadgeFamily[] = [
  { id: "rad", symbol: "a0", prahy: [7, 14, 30, 60, 90, 120, 150, 200] },
  { id: "dni", symbol: "e5", prahy: [1, 10, 30, 60, 100, 200, 365, 500, 730, 1000] },
  { id: "vencenie", symbol: "f4", prahy: [1, 25, 50, 100, 250, 500, 750, 1000] },
  { id: "prechadzky", symbol: "d5", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "vylety", symbol: "a3", prahy: [1, 5, 10, 25, 50, 100, 200, 300, 500] },
  { id: "pritomnost", symbol: "e4", prahy: [1, 25, 50, 100, 200, 365, 500, 1000] },
  { id: "ocuchanie", symbol: "c3", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "veterina", symbol: "e2", prahy: [1, 3, 5, 10, 20, 30, 50, 75, 100] },
  { id: "kliest", symbol: "d2", prahy: [1, 3, 5, 10, 20, 30, 50, 75, 100] },
  { id: "plavanie", symbol: "sym6", prahy: [1, 5, 10, 25, 50, 100, 200, 300, 500] },
  { id: "spa", symbol: "a5", prahy: [1, 3, 5, 10, 20, 30, 50, 75, 100] },
  { id: "leny", symbol: "sym7", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "prusvih", symbol: "a6", prahy: [5, 10, 25, 50, 100, 150, 200, 300] },
  { id: "hovienko", symbol: "sym2", prahy: [1, 3, 5, 10, 20, 30, 50, 75, 100] },
  { id: "vault", symbol: "a7", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "zahranicie", symbol: "b0", prahy: [1, 2, 3, 5, 7, 10, 15, 20, 30] },
  { id: "kronika", symbol: "b1", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "tvorca", symbol: "d7", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "hra", symbol: "c7", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "trening", symbol: "d0", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "sutaz", symbol: "b4", prahy: [1, 3, 5, 10, 20, 30, 50, 75, 100] },
  { id: "zajac", symbol: "b5", prahy: [1, 3, 5, 10, 20, 30, 50, 75, 100] },
  { id: "krmenie", symbol: "sym1", prahy: [1, 10, 30, 60, 100, 200, 365, 500, 730, 1000] },
];

/** Počet stupňov rámu (1 = malachit/bronz … 8 = vesmír/krídla+slnko). */
export const BADGE_TIERS = 8;

/** Stupeň rámu pre i-ty prah z n: prvý = 1, strop = 8 (rovnaké pravidlo ako gen-tabulka.py). */
export const badgeTier = (i: number, n: number): number => (n < 2 ? 1 : 1 + Math.round((i * (BADGE_TIERS - 1)) / (n - 1)));

export const badgeImg = (symbol: string, tier: number): string => `/icons/pack/badges/${symbol}-${tier}.webp`;
