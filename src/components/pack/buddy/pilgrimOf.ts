// SNIFFER — PÚTNIK level CUDZIEHO ČLOVEKA (kontrakt koordinátora 26. 9. 2026 večer).
//
// Server posiela `card.pilgrimLevel` VŽDY `null` — dovtedy si ho zapisoval majiteľov klient sám
// (audit A8: „level 999 za 1 dotaz"). Matej ale chce Pútnika verejne viditeľného, takže sa počíta
// TU, v prehliadači, z `card.trips` (slugy prejdených výletov, tie server vydáva) tou istou
// funkciou ako VLASTNÝ level — `profileLevelFor` (`packCommunity.ts`, zdroj pravdy pre mapu aj
// TripSpotlight). Rozdiel je len v tom, ČO O CUDZOM ČLOVEKU NEVIEME: autorstvo výletu, jeho
// hlasy/hodnotenia, odkazy, podujatia, priania — tie do funkcie nejdú (prázdne/nulové vstupy),
// „pre cudzieho ber len výlety".
import { HERO_TRAILS, type HeroTrail } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { profileLevelFor } from '@/components/pack/packCommunity';

// Vlastný index (nie ten v `snifferDeck.ts`) — ten súbor NEMENÍME a index nevyváža von.
let trailIndex: Map<string, HeroTrail> | null = null;
function catalog(): Map<string, HeroTrail> {
  trailIndex ??= new Map([...HERO_JOURNEYS, ...HERO_TRAILS].map((tr) => [tr.id, tr]));
  return trailIndex;
}

/**
 * Level PÚTNIKA z prejdených výletov cudzieho človeka. `undefined`, keď nemá ani jeden —
 * odznak sa vtedy SKRÝVA (SnifferLevels), nie „Level 1" naprázdno (`levelOf` nikdy nevráti 0).
 */
export function pilgrimLevelOf(slugs: string[]): number | undefined {
  const idx = catalog();
  const walked = slugs.map((s) => idx.get(s)).filter((tr): tr is HeroTrail => !!tr);
  if (walked.length === 0) return undefined;
  const { level } = profileLevelFor({ walkedTrails: walked, votes: {}, email: '', ownerName: '' });
  return level.level;
}
