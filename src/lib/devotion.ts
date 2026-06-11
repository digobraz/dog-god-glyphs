// ============================================================================
// Devotion ladder — shared between HeroCard (/pack) and StickyDevotionBar
// (dog profile). Single source of truth for level math.
//
// ⚠️ PLACEHOLDER thresholds for the middle tiers — economy canon is still in
// design (KONTEXT "level canon"), to be confirmed with Matej. Top = Demigod
// (poloboh) @ 2M; Pharaoh @ 1M = founder tier.
// ============================================================================
export const DEVOTION_LEVELS = [
  { name: 'Stray', at: 0 },      // new member starts at 100 = Lvl 1
  { name: 'Pup', at: 250 },
  { name: 'Follower', at: 750 },
  { name: 'Disciple', at: 1750 },
  { name: 'Devotee', at: 3500 },
  { name: 'Acolyte', at: 6500 },
  { name: 'Keeper', at: 12000 },
  { name: 'Priest', at: 22000 },
  { name: 'High Priest', at: 40000 },
  { name: 'Vizier', at: 75000 },
  { name: 'Pharaoh', at: 1000000 },   // founder tier
  { name: 'Demigod', at: 2000000 },   // poloboh — top of the path
] as const;

export interface DevotionLevel {
  index: number;
  name: string;
  next: { name: string; at: number } | null;
  pct: number;
  toNext: number;
}

export function devotionLevel(d: number): DevotionLevel {
  let i = 0;
  for (let k = 0; k < DEVOTION_LEVELS.length; k++) {
    if (d >= DEVOTION_LEVELS[k].at) i = k;
  }
  const cur = DEVOTION_LEVELS[i];
  const next = DEVOTION_LEVELS[i + 1] ?? null;
  const span = next ? next.at - cur.at : 0;
  const pct = next && span > 0 && isFinite(span)
    ? Math.max(0, Math.min(100, ((d - cur.at) / span) * 100))
    : 100;
  const toNext = next && isFinite(next.at) ? Math.max(0, next.at - d) : 0;
  return { index: i + 1, name: cur.name, next, pct, toNext };
}
