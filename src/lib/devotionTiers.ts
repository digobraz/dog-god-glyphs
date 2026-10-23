// ─────────────────────────────────────────────────────────────────────────────
// FARBY A KRESBY STUPŇOV DEVOTION — jeden zdroj pre pilulku pod menom aj stupnicu v MeRank.
//
// Štýl „NOC + ŽIARA" (Matej 23. 10. 2026 nad nákresom `plany/nakres-devotion-rebricek-2026-10-23.html`:
// *„skúsme noc a žiara"*): tmavá pilulka, zlatý lem, farbu stupňa nesie ŽIARIACA GULIČKA s kresbou.
// Stupne 1–20 idú dookola kruhu farieb (hue 28° → 358°), Faraón a Polboh sú iná trieda —
// zlatý plech a slnko.
//
// PREČO NIE AKO PÚTNIK: pútnik (`packTiers.ts`) má plnú farebnú pilulku z 9 materiálov. Devotion
// je vždy tmavá so zlatým lemom — vedľa seba pod menom sa nepomýlia ani pri zhodnom odtieni.
//
// Kresby `public/icons/pack/dv-<key>.svg` sú kreslené namieru (generátor
// `scripts/gen-nakres-devotion.py`, slovník `P`). Kresba ☥ ostáva mene, nie stupňu.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react';

export interface DevotionTier {
  /** `pack.ladder.<key>` — ten istý kľúč ako v `DEVOTION_LEVELS` */
  key: string;
  /** svetlý stred guličky */
  glow: string;
  /** farba guličky a jej žiary */
  dot: string;
}

export const DEVOTION_TIERS: DevotionTier[] = [
  { key: 'novice',   glow: '#ECCAAC', dot: '#D8955A' },
  { key: 'wanderer', glow: '#ECDCAC', dot: '#D8B95A' },
  { key: 'follower', glow: '#E9ECAC', dot: '#D2D85A' },
  { key: 'believer', glow: '#D6ECAC', dot: '#AED85A' },
  { key: 'servant',  glow: '#C4ECAC', dot: '#89D85A' },
  { key: 'aspirant', glow: '#B2ECAC', dot: '#65D85A' },
  { key: 'mentor',   glow: '#ACECB9', dot: '#5AD873' },
  { key: 'steward',  glow: '#ACECCC', dot: '#5AD898' },
  { key: 'shepherd', glow: '#ACECDE', dot: '#5AD8BD' },
  { key: 'sentinel', glow: '#ACE7EC', dot: '#5ACFD8' },
  { key: 'elder',    glow: '#ACD5EC', dot: '#5AABD8' },
  { key: 'sage',     glow: '#ACC2EC', dot: '#5A86D8' },
  { key: 'cleric',   glow: '#ACB0EC', dot: '#5A61D8' },
  { key: 'mystic',   glow: '#BBACEC', dot: '#775AD8' },
  { key: 'priest',   glow: '#CDACEC', dot: '#9B5AD8' },
  { key: 'paladin',  glow: '#E0ACEC', dot: '#C05AD8' },
  { key: 'magus',    glow: '#ECACE5', dot: '#D85ACC' },
  { key: 'prophet',  glow: '#ECACD3', dot: '#D85AA7' },
  { key: 'nomarch',  glow: '#ECACC1', dot: '#D85A83' },
  { key: 'vizier',   glow: '#ECACAE', dot: '#D85A5E' },
  { key: 'pharaoh',  glow: '#FFF6D6', dot: '#D8A93F' },
  { key: 'demigod',  glow: '#FFFFFF', dot: '#F3D98A' },
];

/** Tmavé telo pilulky 1–20 a zlatý lem — spoločné pre všetky stupne pod Faraónom. */
export const NIGHT = 'linear-gradient(135deg, #2E2216, #140D07)';
export const NIGHT_EDGE = '#C99A3F';
export const NIGHT_INK = '#F3E6C8';
/** Faraón = zlatý plech, Polboh = slnko. */
const GOLD_LEAF = 'linear-gradient(180deg, #F8E7AE 0%, #D8A93F 46%, #A3782B 54%, #E6C46C 100%)';
const SUN = 'radial-gradient(120% 160% at 50% 30%, #FFFFFF 0%, #FFF3CC 45%, #EFCF78 100%)';

/** Stupeň 1–22 (index z `devotionLevel().index`). Mimo rozsahu vracia krajný. */
export function devotionTier(index: number): DevotionTier {
  const i = Math.min(DEVOTION_TIERS.length, Math.max(1, Math.floor(index || 1))) - 1;
  return DEVOTION_TIERS[i];
}

/** Cesta ku kresbe stupňa. */
export const devotionIcon = (key: string) => `/icons/pack/dv-${key}.svg`;

/**
 * CSS premenné pilulky a guličky na inline `style`. Pravidlo v CSS číta `var(--dv-*)`.
 * ⚠️ Cast je nutný — TS nepozná vlastné `--*` kľúče v `CSSProperties`.
 */
export function devotionVars(index: number): CSSProperties {
  const t = devotionTier(index);
  const top = index >= 21;
  return {
    '--dv-bg': index === 22 ? SUN : top ? GOLD_LEAF : NIGHT,
    '--dv-edge': index === 22 ? '#D8A93F' : top ? '#8C6014' : NIGHT_EDGE,
    '--dv-ink': index === 22 ? '#6E4A12' : top ? '#2a1608' : NIGHT_INK,
    '--dv-dot': `radial-gradient(circle at 35% 30%, ${t.glow}, ${t.dot} 65%)`,
    '--dv-glow': t.dot,
    '--dv-icon': `url(${devotionIcon(t.key)})`,
    '--dv-icon-ink': top ? '#5A3A08' : '#140D07',
  } as CSSProperties;
}
