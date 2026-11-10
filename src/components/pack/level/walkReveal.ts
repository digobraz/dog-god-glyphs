// Odmena po ✓ na výlete z katalógu: rovnaký rozpis bodov ako sprievodca (`openRevealFor` v PackMap), len bez „pridal som výlet".
import { computeCompletion } from '@/components/pack/packCommunity';
import { hasRouteMetrics } from '@/components/pack/tripShared';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { calculateTripPoints, type TripPointsResult } from '@/lib/tripPoints';

export function walkRevealPoints(trail: HeroTrail, walkedBefore: HeroTrail[], rated: boolean): TripPointsResult {
  const before = computeCompletion(walkedBefore);
  const after = computeCompletion([trail, ...walkedBefore]);
  const gained = (key: 'ranges' | 'parks' | 'chko' | 'waters') => {
    const n = (c: typeof before) => c.categories.find((x) => x.key === key)?.done.length ?? 0;
    return n(after) > n(before);
  };
  const countriesBefore = new Set(walkedBefore.map((tr) => tr.country).filter(Boolean));
  return calculateTripPoints({
    kind: hasRouteMetrics(trail) ? 'trail' : 'place',
    km: Number(trail.km) || 0,
    ascentM: (trail as { ascentM?: number }).ascentM ?? 0,
    journeyId: trail.id,
    walked: true,
    newRange: gained('ranges'),
    newNp: gained('parks'),
    newChko: gained('chko'),
    newWater: gained('waters'),
    newCountry: !!trail.country && !countriesBefore.has(trail.country),
    rated,
  });
}
