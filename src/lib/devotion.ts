// ============================================================================
// Devotion ladder — shared between HeroCard (/pack) and StickyDevotionBar
// (dog profile). Single source of truth for level math.
//
// Canonical 22-tier ladder from the devotion sim (devotion-sim/zivot-v-dogypte.html).
// Path 1 of 3 (Devotion). Thresholds 1–20 are sim canon; Pharaoh (★) and Demigod
// (☼) are symbolic in the sim — kept at 1M / 2M so the level math has numbers.
// ============================================================================
// `key` = stabilný i18n kľúč (`pack.ladder.<key>`). `name` = EN fallback / kánon.
// Komponenty rendrujú `t('pack.ladder.' + lv.key)` — názov sa prekladá, prahy nie.
export const DEVOTION_LEVELS = [
  { key: 'novice',   name: 'Novice', at: 0 },          // new member starts here
  { key: 'wanderer', name: 'Wanderer', at: 200 },
  { key: 'follower', name: 'Follower', at: 500 },
  { key: 'believer', name: 'Believer', at: 1000 },
  { key: 'servant',  name: 'Servant', at: 2000 },
  { key: 'aspirant', name: 'Aspirant', at: 3500 },
  { key: 'mentor',   name: 'Mentor', at: 6000 },
  { key: 'steward',  name: 'Steward', at: 10000 },
  { key: 'shepherd', name: 'Shepherd', at: 16000 },
  { key: 'sentinel', name: 'Sentinel', at: 25000 },
  { key: 'elder',    name: 'Elder', at: 38000 },
  { key: 'sage',     name: 'Sage', at: 55000 },
  { key: 'cleric',   name: 'Cleric', at: 80000 },
  { key: 'mystic',   name: 'Mystic', at: 120000 },
  { key: 'priest',   name: 'Priest', at: 160000 },
  { key: 'paladin',  name: 'Paladin', at: 200000 },
  { key: 'magus',    name: 'Magus', at: 260000 },
  { key: 'prophet',  name: 'Prophet', at: 340000 },
  { key: 'nomarch',  name: 'Nomarch', at: 480000 },
  { key: 'vizier',   name: 'Vizier', at: 700000 },
  { key: 'pharaoh',  name: 'Pharaoh', at: 1000000 },   // ★ founder tier
  { key: 'demigod',  name: 'Demigod', at: 2000000 },   // ☼ poloboh — top of the path
] as const;

export interface DevotionLevel {
  index: number;
  key: string;
  name: string;
  next: { key: string; name: string; at: number } | null;
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
  return { index: i + 1, key: cur.key, name: cur.name, next, pct, toNext };
}
