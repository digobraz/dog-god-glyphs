// ============================================================================
// SPACIE MIESTA — ČÍTANIE PREVZATÝCH MIEST (`list_sleep_spots`).
//
// ── DVE VRSTVY, KTORÉ SA TU STRETÁVAJÚ ──────────────────────────────────────
// Dlaždice `public/poi/v1/` nesú BOD ZO SVETA: meno, súradnicu, druh, výšku. Nič viac —
// OSM o útulni nevie, či sa tam dá spať s psom ani aké to tam je.
// Tabuľka `sleep_spots` nesie PREVZATÉ MIESTO: to isté miesto, ktoré už niekto zo svorky
// otvoril, popísal a odklikal chipy.
//
// Karta miesta ukazuje jedno alebo druhé podľa toho, či sa našla dvojica — preto sa tu
// páruje GEOMETRICKY (`spotAt`), nie cez `osm_ref`: dlaždice OSM id nenesú (pri 47 000
// bodoch by boli väčšie než dáta) a človek smie miesto založiť aj vedľa OSM bodu, ktorý
// nikdy nevidel. Vzdialenosť je preto jediný spoločný jazyk oboch vrstiev.
//
// ⚠️ NAČÍTAVA SA RAZ ZA ŽIVOT STRÁNKY. Mapa aj článok výletu si kartu otvárajú nezávisle,
// takže bez spoločného sľubu by štyri povrchy vypálili štyri rovnaké RPC naraz — to isté
// zistenie, kvôli ktorému vznikol `useMyNotePoints`.
// ============================================================================
import { useEffect, useState } from 'react';
import { supabase as db } from '@/integrations/supabase/client';
import { DEV_NOAUTH } from '@/lib/devMockDogs';
import { DEV_MOCK_SPOTS } from './devMockSpots';
import type { SleepKind } from './sleepSpots';

/** Prevzaté miesto tak, ako ho potrebuje karta. */
export interface SleepSpot {
  id: string;
  kind: SleepKind;
  name: string;
  lat: number;
  lon: number;
  chips: string[];
  body: string;
  /** jedna fotka (Cloudinary) — galéria to nie je, karta má miesto na jednu */
  photoUrl: string | null;
  /** krstné meno autora — `list_sleep_spots` ho vracia, priezvisko nikdy */
  authorFirst: string | null;
  /** číslo majiteľa = najnižšie číslo z jeho zaplatených psov (CLAUDE.md, Identita) */
  packNumber: number | null;
  isMine: boolean;
}

interface SpotRow {
  id: string;
  kind: string;
  name: string;
  lat: number;
  lon: number;
  chips: string[] | null;
  body: string | null;
  photo_url: string | null;
  author_first: string | null;
  pack_number: number | null;
  is_mine: boolean;
}

const fromRow = (r: SpotRow): SleepSpot => ({
  id: r.id,
  kind: r.kind as SleepKind,
  name: r.name,
  lat: r.lat,
  lon: r.lon,
  chips: r.chips ?? [],
  body: r.body ?? '',
  photoUrl: r.photo_url,
  authorFirst: r.author_first,
  packNumber: r.pack_number,
  isMine: !!r.is_mine,
});

let promise: Promise<SleepSpot[]> | null = null;

/**
 * Zoznam prevzatých miest. Zlyhanie je TICHÉ a vracia prázdno — karta vtedy ukáže bod zo
 * sveta, čo je pravda („nikto to zatiaľ nepopísal"), nie chybový stav. Hlásenie o sieti nad
 * mapou by bolo horšie než chýbajúci popis.
 */
export function loadSleepSpots(): Promise<SleepSpot[]> {
  if (!promise) {
    promise = (async () => {
      if (DEV_NOAUTH) return DEV_MOCK_SPOTS;
      try {
        const { data, error } = await db.rpc('list_sleep_spots');
        if (error) throw error;
        return ((data ?? []) as SpotRow[]).map(fromRow);
      } catch {
        return [];
      }
    })();
  }
  return promise;
}

export function useSleepSpots(): SleepSpot[] {
  const [spots, setSpots] = useState<SleepSpot[]>([]);
  useEffect(() => {
    let alive = true;
    loadSleepSpots().then((s) => { if (alive) setSpots(s); });
    return () => { alive = false; };
  }, []);
  return spots;
}

/** Zhoda bodu zo sveta s prevzatým miestom. 60 m ~ areál kempu; menej by rozdvojilo
 *  útulňu nakreslenú ako budova (stred plochy) a jej vlastný uzol. */
const MATCH_M = 60;

export function spotAt(spots: SleepSpot[], lat: number, lon: number): SleepSpot | null {
  let best: SleepSpot | null = null;
  let bestD = MATCH_M;
  for (const s of spots) {
    // rovinná aproximácia — na 60 m je odchýlka od haversine pod centimeter
    const dx = (s.lon - lon) * 111320 * Math.cos((lat * Math.PI) / 180);
    const dy = (s.lat - lat) * 110540;
    const d = Math.hypot(dx, dy);
    if (d < bestD) { bestD = d; best = s; }
  }
  return best;
}
