// BODY ZA MOJE ODKAZY — jedno číslo pre všetky povrchy, ktoré ukazujú level.
//
// ⚠️ PREČO VLASTNÝ MODUL A NIE VÝPOČET V KAŽDOM PANELI: level ukazujú ŠTYRI miesta
// (hlavička mapy, TRIPSTATS, homepage `TripSpotlight`, profil) a všetky štyri volajú
// `profileLevelFor` / `profilePointsFor` práve preto, že sa im to už raz rozišlo
// (komentár pri `profileLevelFor` v packCommunity.ts, rozchod z 6. 8. 2026). Keby si
// každý z nich počítal odkazy sám, rozíde sa to znova — len o tri body inak.
//
// ⚠️ Do 25. 8. 2026 sa odkazy do skóre NEPOČÍTALI VÔBEC (Matej po prvom reálnom zápise:
// „v zápise som nedostal body za ODKAZY (9 bodov)"), hoci ich appka sľubuje na troch
// miestach. Toto je tá chýbajúca polovica.
//
// Od B2 (15. 11. 2026) sa pýta `list_map_notes(p_only_mine)` — len moje značky s príznakom `isMine`.
import { useEffect, useState } from 'react';
import { HERO_TRAILS, type HeroTrail } from '@/data/heroTrails.generated';
import { fetchMapNotes, forgetAllNotes, recentAllNotes, type MapNote } from './mapNotesData';
import { nearestTrailId } from './mapNotesGeo';
import { noteScoreFor } from '@/lib/tripPoints';

/**
 * Jeden dotaz na session, zdieľaný medzi povrchmi.
 *
 * Bez neho by štyri panely na jednej obrazovke vypálili štyri `list_map_notes()` naraz —
 * a je to celá vrstva, nie stránka. `null` = ešte sa nenačítalo, `Promise` = práve beží
 * (druhý volajúci sa priloží k tomu istému, nezaloží ďalší).
 */
let cache: MapNote[] | null = null;
let inflight: Promise<MapNote[]> | null = null;

/** Zahodí cache — volá sa po zapísaní nového odkazu, inak by level ostal na starom čísle. */
export function invalidateMyNotePoints(): void {
  cache = null;
  inflight = null;
  forgetAllNotes();
}

/** Zdieľané načítanie MOJICH značiek pre level (celú vrstvu číta `useMapNotes`, nie toto). */
export async function loadNotes(): Promise<MapNote[]> {
  if (cache) return cache;
  if (!inflight) {
    // Mapa a článok výletu si čoskoro po sebe pýtajú aj CELÚ vrstvu (`useMapNotes`) — moje značky sú v nej s `isMine`,
    // takže druhý `list_map_notes` netreba (24. 11. 2026). Bez nej (profil, level) ide ako predtým len `p_only_mine`.
    const all = recentAllNotes();
    inflight = (all ? all.then((n) => n.filter((x) => x.isMine)) : fetchMapNotes(undefined, true)) // B2: stačia moje značky, nie celá vrstva
      .then((n) => { cache = n; return n; })
      // Zlyhanie = nula bodov navyše, nie rozbitý level. Rovnaké pravidlo ako v `useMapNotes`:
      // odkazy sú doplnok, ich výpadok nesmie zhodiť povrch, ktorý ich len pripočítava.
      .catch(() => [] as MapNote[])
      .finally(() => { inflight = null; });
  }
  return inflight;
}

/**
 * Kľúč, pod ktorý zápis spadne pri stropovaní.
 *
 * `pinnedSlug` je VÝNIMKA, nie väzba (zápis z otvoreného článku výletu vie, kam patrí);
 * všetko ostatné sa odvodzuje geometriou, rovnako ako pri kreslení vrstvy — inak by ten
 * istý zápis patril k výletu na mape, ale nie pri počítaní bodov.
 * `null` = samostatný zápis, ide do denného stropu.
 */
function tripKeyOf(n: MapNote, trails: HeroTrail[]): string | null {
  return n.pinnedSlug ?? nearestTrailId(n.lat, n.lon, n.kind, trails);
}

/** Body za odkazy tohto člena, už orezané oboma stropmi (9 na výlet · 5 samostatných za deň). */
export function useMyNotePoints(enabled = true): number {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (!enabled) { setPoints(0); return; }
    let cancelled = false;
    void loadNotes().then((notes) => {
      if (cancelled) return;
      const mine = notes
        .filter((n) => n.isMine)
        .map((n) => ({ createdAt: n.createdAt, tripKey: tripKeyOf(n, HERO_TRAILS) }));
      setPoints(noteScoreFor(mine));
    });
    return () => { cancelled = true; };
  }, [enabled]);

  return points;
}
