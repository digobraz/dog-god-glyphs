// PÚTNIK na jednom mieste: level + počet výletov + km + krajiny (25. 9. 2026).
// Vytiahnuté z `PackIdentityBar.tsx`, keď to isté číslo potrebovala karta SNIFFERu — druhá
// kópia výpočtu by sa rozišla s hlavičkou mapy (presne tak sa 6. 8. rozišla mapa s vysvedčením).
import { useEffect, useMemo } from 'react';
import { saveHuman, useProfile, type HumanProfile } from '@/components/pack/profile/packProfile';
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

/** Zverejní PÚTNIK level, aby ho videli ostatní (Matej 25. 9.: „level putnika musi vidieť
 *  každý každému"). Volá ho hlavička mapy — to isté číslo, ktoré človek vidí sám, bez druhej
 *  definície na serveri. Zapisuje sa LEN pri zmene (`human.pilgrim.level`).
 *  ⚠️ Kým človek appku neotvorí, ostatní vidia posledné zverejnené číslo. */
export function usePublishPilgrimLevel(level: number | null | undefined) {
  const { profile } = useProfile();
  const published = profile?.human?.pilgrim?.level;
  // ⏳ ZÁPIS AŽ KEĎ SA ÚROVEŇ USTÁLI (audit /pack/map B6, 26. 9. 2026). Mapa ráta úroveň
  // najprv s nulovými bodmi za odkazy, podujatia a priania (ešte sa načítavajú) a hneď ju
  // zapísala — iní členovia tak na chvíľu videli nižšiu úroveň a o sekundu išiel druhý zápis.
  // Čaká sa 4 s bez zmeny; každá nová hodnota odpočet reštartuje.
  useEffect(() => {
    if (!profile || level == null || level === published) return;
    const h = setTimeout(() => {
      void saveHuman({ pilgrim: { level, at: new Date().toISOString() } });
    }, 4000);
    return () => clearTimeout(h);
  }, [profile, level, published]);
}

/** Zverejní ČÍSLA PROFILU (`human.stats`), aby ich cudzí profil ukázal 1:1 s mojím (25. 10. 2026).
 *  Rovnaký recept ako `usePublishPilgrimLevel`: zápis len pri zmene a až keď sa čísla 4 s neupravia
 *  (načítavajú sa postupne — bez čakania by išli von medzistavy). `null` = ešte sa ráta, nezapisuj. */
export function usePublishProfileStats(next: Omit<NonNullable<HumanProfile['stats']>, 'at'> | null) {
  const { profile } = useProfile();
  const cur = profile?.human?.stats;
  const same = !!cur && !!next && cur.km === next.km && cur.pilgrimPct === next.pilgrimPct
    && cur.brought === next.brought && cur.study === next.study && cur.servantYears === next.servantYears
    && cur.points === next.points && cur.trips === next.trips && cur.countries === next.countries;
  const key = next ? JSON.stringify(next) : '';
  useEffect(() => {
    if (!profile || !next || same) return;
    const h = setTimeout(() => { void saveHuman({ stats: { ...next, at: new Date().toISOString() } }); }, 4000);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, key, same]);
}
