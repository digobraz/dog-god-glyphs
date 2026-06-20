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
    noteKey: 'transparency.part.development.note' as const,
  },
  {
    share: 3,
    labelKey: 'transparency.part.affiliate' as const,
    color: T.partMkt,
    noteKey: 'transparency.part.affiliate.note' as const,
  },
  {
    share: 2,
    labelKey: 'transparency.part.directHelp' as const,
    color: T.partHelp,
    noteKey: 'transparency.part.directHelp.note' as const,
  },
  {
    share: 1,
    labelKey: 'transparency.part.hekthorBowl' as const,
    color: T.partHek,
    noteKey: 'transparency.part.hekthorBowl.note' as const,
  },
] as const;

export type TransparencySplitItem = (typeof TRANSPARENCY_SPLIT)[number];
