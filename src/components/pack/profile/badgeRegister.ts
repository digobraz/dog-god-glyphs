// ⚠️ GENEROVANÉ — needituj. Zdroj: plany/nakresy/odznaky-zbierka/register.json
// Prepis: node scripts/gen-badge-register.mjs (z koreňa ~/AI/DOGYPT).
// Mená a „za čo" sú v i18n: pack.badge.<id> · pack.badge.<id>.for

export interface BadgeFamily { id: string; symbol: string; prahy: readonly number[] }

/** 20 rodín s radom prahov, v poradí registra. */
export const BADGE_FAMILIES: readonly BadgeFamily[] = [
  { id: "rad", symbol: "z-streak", prahy: [7, 14, 30, 60, 90, 120, 150, 200] },
  { id: "dni", symbol: "e5", prahy: [1, 10, 30, 60, 100, 200, 365, 500, 730, 1000] },
  { id: "vencenie", symbol: "z-walk_short", prahy: [1, 25, 50, 100, 250, 500, 750, 1000] },
  { id: "prechadzky", symbol: "z-walk", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "vylety", symbol: "z-trip", prahy: [1, 5, 10, 25, 50, 100, 200, 300, 500] },
  { id: "pritomnost", symbol: "z-presence", prahy: [1, 25, 50, 100, 200, 365, 500, 1000] },
  { id: "ocuchanie", symbol: "z-sniff", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "veterina", symbol: "z-vet", prahy: [1, 3, 5, 10, 20, 30, 50, 75, 100] },
  { id: "plavanie", symbol: "z-swim", prahy: [1, 5, 10, 25, 50, 100, 200, 300, 500] },
  { id: "spa", symbol: "z-spa", prahy: [1, 3, 5, 10, 20, 30, 50, 75, 100] },
  { id: "zapad", symbol: "z-sunset", prahy: [1, 3, 5, 10, 20, 30, 50, 75, 100] },
  { id: "leny", symbol: "z-lazy", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "prusvih", symbol: "z-mischief", prahy: [5, 10, 25, 50, 100, 150, 200, 300] },
  { id: "vault", symbol: "a7", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "zahranicie", symbol: "z-abroad", prahy: [1, 2, 3, 5, 7, 10, 15, 20, 30] },
  { id: "tvorca", symbol: "z-tvorca", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "hra", symbol: "z-play", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "trening", symbol: "z-training", prahy: [5, 25, 50, 100, 200, 300, 500] },
  { id: "sutaz", symbol: "z-contest", prahy: [1, 3, 5, 10, 20, 30, 50, 75, 100] },
  { id: "krmenie", symbol: "z-feeding", prahy: [1, 10, 30, 60, 100, 200, 365, 500, 730, 1000] },
];

/** Počet stupňov rámu (1 = malachit/bronz … 8 = vesmír/krídla+slnko). */
export const BADGE_TIERS = 8;

/** Stupeň rámu pre i-ty prah z n: prvý = 1, strop = 8 (rovnaké pravidlo ako gen-tabulka.py). */
export const badgeTier = (i: number, n: number): number => (n < 2 ? 1 : 1 + Math.round((i * (BADGE_TIERS - 1)) / (n - 1)));

export const badgeImg = (symbol: string, tier: number): string => `/icons/pack/badges/${symbol}-${tier}.webp`;
