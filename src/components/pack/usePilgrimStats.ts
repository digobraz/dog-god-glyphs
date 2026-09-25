// PÚTNIK na jednom mieste: level + počet výletov + km + krajiny (25. 9. 2026).
// Vytiahnuté z `PackIdentityBar.tsx`, keď to isté číslo potrebovala karta SNIFFERu — druhá
// kópia výpočtu by sa rozišla s hlavičkou mapy (presne tak sa 6. 8. rozišla mapa s vysvedčením).
import { useMemo } from 'react';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { readLocalTrails, readWalkedIds, visibleLocalTrails } from './tripShared';
import { profileLevelFor, readVotes, walkedCountries } from './packCommunity';
import { useMyNotePoints } from './mapnotes/useMyNotePoints';
import { useMyEventCount } from '@/components/pack/events/eventStore';
import { useMyWishCount } from '@/components/pack/mapnotes/wishData';

export function usePilgrimStats(email: string, ownerName: string) {
  const myNotePoints = useMyNotePoints();
  const myEventCount = useMyEventCount();
  const myWishCount = useMyWishCount();
  return useMemo(() => {
    const all: HeroTrail[] = [...visibleLocalTrails(readLocalTrails()), ...HERO_JOURNEYS, ...HERO_TRAILS];
    const walked = readWalkedIds();
    /* ⚠️ Počet aj km z JEDNEJ množiny (mapa, UX audit 14. 9. 2026). */
    const walkedTrails = all.filter((tr) => walked.has(tr.id));
    const km = walkedTrails.reduce((s, tr) => s + (parseFloat(String(tr.km ?? '').replace(',', '.')) || 0), 0);
    const { level } = profileLevelFor({
      walkedTrails,
      localTrailIds: readLocalTrails().map((tr) => tr.id),
      votes: readVotes(),
      email,
      ownerName,
      notePoints: myNotePoints,
      eventsHeld: myEventCount,
      wishesDone: myWishCount,
    });
    return { level, count: walkedTrails.length, km: Math.round(km), countries: walkedCountries(walkedTrails) };
  }, [email, ownerName, myNotePoints, myEventCount, myWishCount]);
}
