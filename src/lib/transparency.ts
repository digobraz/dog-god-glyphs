/**
 * DOGYPT Transparency Model — single source of truth.
 *
 * Used by:
 *  - src/components/pack/FounderInvite.tsx (back-of-card panel)
 *  - src/components/screens/PaymentScreen.tsx (100% Transparency block)
 *
 * Colors are CANONICAL (packTheme partDev/Mkt/Help/Hek — LOCKED 2026-06-09).
 * Do NOT duplicate this constant anywhere else.
 */
import { PACK_THEME } from '@/components/pack/packTheme';

const T = PACK_THEME;

export const TRANSPARENCY_SPLIT = [
  {
    share: 5,
    labelKey: 'transparency.part.development' as const,
    color: T.partDev,
    note: 'Building the nation and paying the people behind it — programmers, caretakers, trainers — plus the tools and servers that keep DOGYPT alive and growing. Every expense will be published.',
  },
  {
    share: 3,
    labelKey: 'transparency.part.affiliate' as const,
    color: T.partMkt,
    note: "Not ads — people. This goes straight into the accounts of Dogyptians who spread the faith (as bones): spend them later inside DOGYPT or donate them to dogs in need. DOGYPT invests in the pack, not in expensive marketing — the pack spreads it far better.",
  },
  {
    share: 2,
    labelKey: 'transparency.part.directHelp' as const,
    color: T.partHelp,
    note: 'Straight to dogs in need — shelters, food, vet bills, rescue — every cent documented and public.',
  },
  {
    share: 1,
    labelKey: 'transparency.part.hekthorBowl' as const,
    color: T.partHek,
    note: "The founder dog who started it all. His share keeps the original promise alive — the dream stays simple: become a millionaire by helping dogs, not despite them.",
  },
] as const;

export type TransparencySplitItem = (typeof TRANSPARENCY_SPLIT)[number];
