// ============================================================================
// Devotion ladder — shared between HeroCard (/pack) and StickyDevotionBar
// (dog profile). Single source of truth for level math.
//
// Canonical 22-tier ladder from the devotion sim (devotion-sim/zivot-v-dogypte.html).
// Path 1 of 3 (Devotion). Thresholds 1–20 are sim canon; Pharaoh (★) and Demigod
// (☼) are symbolic in the sim — kept at 1M / 2M so the level math has numbers.
// ============================================================================
export const DEVOTION_LEVELS = [
  { name: 'Novice', at: 0 },          // new member starts here
  { name: 'Wanderer', at: 200 },
  { name: 'Follower', at: 500 },
  { name: 'Believer', at: 1000 },
  { name: 'Servant', at: 2000 },
  { name: 'Aspirant', at: 3500 },
  { name: 'Mentor', at: 6000 },
  { name: 'Steward', at: 10000 },
  { name: 'Shepherd', at: 16000 },
  { name: 'Sentinel', at: 25000 },
  { name: 'Elder', at: 38000 },
  { name: 'Sage', at: 55000 },
  { name: 'Cleric', at: 80000 },
  { name: 'Mystic', at: 120000 },
  { name: 'Priest', at: 160000 },
  { name: 'Paladin', at: 200000 },
  { name: 'Magus', at: 260000 },
  { name: 'Prophet', at: 340000 },
  { name: 'Nomarch', at: 480000 },
  { name: 'Vizier', at: 700000 },
  { name: 'Pharaoh', at: 1000000 },   // ★ founder tier
  { name: 'Demigod', at: 2000000 },   // ☼ poloboh — top of the path
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
