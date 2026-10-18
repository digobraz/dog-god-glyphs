/**
 * DOGYPT Transparency Model — single source of truth.
 *
 * Used by:
 *  - src/components/screens/PaymentScreen.tsx (100% Transparency block)
 *  - src/components/screens/flowMoreInfo.tsx (popup Členstvo › KAM IDÚ PENIAZE)
 *  - src/components/pack/TransparentStats.tsx (pokladnica v /pack)
 *  - src/pages/Magnet.tsx (KAM IDE 11 €)
 *
 * NAVONOK 8 · 2 · 1, VNÚTRI 5 · 3 (Matej 18. 10. 2026: *„skonsolidujeme sekcie na 3 ale
 * zachováme aj bones"* · *„Rozvoj komunity, priama pomoc, hektorova miska; [5+3] iba pri
 * rozkliku"*). Peniaze tečú presne ako pri 5·3·2·1 — server (`get-dashboard-stats`) ďalej
 * vedie štyri šuflíky; mení sa len to, ako ich ukazujeme. `parts` sa ukazujú LEN v detaile.
 *
 * Colors are CANONICAL (packTheme partDev/Mkt/Help/Hek — LOCKED 2026-06-09).
 * Do NOT duplicate this constant anywhere else.
 */
import { PACK_THEME } from '@/components/pack/packTheme';

const T = PACK_THEME;

export type TransparencyPart = {
  share: number;
  labelKey: string;
  noteKey: string;
  color: string;
};

export type TransparencySplitItem = TransparencyPart & {
  /** Vnútorný rozpad — ukazuje sa len po rozkliku. Prázdne = podiel sa nedelí. */
  parts: readonly TransparencyPart[];
};

export const TRANSPARENCY_SPLIT: readonly TransparencySplitItem[] = [
  {
    share: 8,
    labelKey: 'transparency.part.community',
    color: T.partDev,
    noteKey: 'transparency.part.community.note',
    parts: [
      { share: 5, labelKey: 'transparency.part.development', noteKey: 'transparency.part.development.note', color: T.partDev },
      { share: 3, labelKey: 'transparency.part.affiliate', noteKey: 'transparency.part.affiliate.note', color: T.partMkt },
    ],
  },
  {
    share: 2,
    labelKey: 'transparency.part.directHelp',
    color: T.partHelp,
    noteKey: 'transparency.part.directHelp.note',
    parts: [],
  },
  {
    share: 1,
    labelKey: 'transparency.part.hekthorBowl',
    color: T.partHek,
    noteKey: 'transparency.part.hekthorBowl.note',
    parts: [],
  },
];
