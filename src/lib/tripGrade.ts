// ═══ ZNÁMKA VÝLETU A/B/C (Matej 11. 10. 2026) ═══════════════════════════════════════════════
// „čím väčšia známka, tým bude trip vyššie pri hľadaní = ľudia sa budú snažiť".
// Schválený nákres: plany/nakresy/nakres-znamka-vyletu-2026-10-11.html
// Pamäť: project_dogypt_znamka_vyletu_abc_2026-10-11.
//
// 🔑 JEDINÝ ZDROJ ZNÁMKY. Číta ju záver zápisu (AddTripLog), radenie v hľadaní (PackMap)
// aj Horská chata + nočný job (scripts/svet/, cez esbuild bundle). Druhé počítadlo nezakladaj —
// tri miesta by sa rozišli presne tam, kde ich človek porovná (zápis tvrdí B, správa C).
//
// Interná metrika: písmeno vidí LEN autor a my. Verejne sa prejaví iba PORADÍM.
// ⚠️ Náročnosť, povrch, ruch, tagy a labky sem NEPATRIA — sú povinné na schválenie
// (`APPROVAL_REQUIRED` v addTripModel.ts), známka by ich len zdvojila.
// ⚠️ Nie je to hodnotenie packami (`RatingPaws`) — to dávajú ľudia, toto je úplnosť zápisu.
import type { HeroTrail } from '@/data/heroTrails.generated';
import type { MapNote } from '@/components/pack/mapnotes/mapNotesData';
import { notesForTrail, parkingForTrail } from '@/components/pack/mapnotes/mapNotesGeo';

export type TripGrade = 'A' | 'B' | 'C';
export type GradePoint = 'desc' | 'photos' | 'route' | 'parking' | 'tip';
/** Poradie bodov = poradie riadkov v checkliste.
 *  ⚠️ PSÍ TIP VYPADOL (Matej 11. 10. 2026 večer: „ten tip vyhoďme z podmienok pre zisk A známky… (zatiaľ)").
 *  Vstup `tip` sa ďalej ráta, len sa do známky nepočíta — na návrat stačí vrátiť ho sem. */
export const GRADE_POINTS: readonly GradePoint[] = ['desc', 'photos', 'route', 'parking'];
/** Plný počet bodov (dnes 4). Nikde nepíš „/ 5" ani „/ 4" natvrdo — ber toto číslo. */
export const GRADE_MAX = GRADE_POINTS.length;

/** Popis „2–3 vety": aspoň 2 vety A aspoň 120 znakov (jedna dlhá veta ani tri slová nestačia). */
export const DESC_MIN_SENTENCES = 2;
export const DESC_MIN_CHARS = 120;
export const PHOTOS_MIN = 3;

/** Holé vstupy — z nich sa známka ráta. Server (chata) ich skladá z DB, appka z trasy a značiek. */
export interface GradeInputs {
  desc: string;
  photos: number;
  /** nakreslená čiara (≥ 2 body) ALEBO miesto/návšteva (okruh `areaR`) — návšteva čiaru nemá mať */
  route: boolean;
  parking: boolean;
  /** aspoň 1 psí tip na trase: upozornenie alebo komentár na mape (alebo vlastný bod datasetu) */
  tip: boolean;
}

export interface GradeResult {
  grade: TripGrade;
  /** 0–GRADE_MAX */
  score: number;
  /** splnené body */
  met: GradePoint[];
  /** chýbajúce body v poradí GRADE_POINTS */
  missing: GradePoint[];
}

export function countSentences(text: string): number {
  return String(text || '').split(/[.!?…]+(?:\s|$)/u).map((s) => s.trim()).filter((s) => s.length >= 3).length;
}

export function descOk(text: string): boolean {
  const t = String(text || '').trim();
  return t.length >= DESC_MIN_CHARS && countSentences(t) >= DESC_MIN_SENTENCES;
}

/**
 * A = plný počet · B = o 1 menej a sú v tom popis AJ fotky · C = všetko ostatné.
 * (Popis a fotky sú to, čo vie dodať iba autor — bez nich výlet nemôže byť B, nech má čokoľvek.)
 */
export function gradeFromInputs(i: GradeInputs): GradeResult {
  const ok: Record<GradePoint, boolean> = {
    desc: descOk(i.desc),
    photos: i.photos >= PHOTOS_MIN,
    route: i.route,
    parking: i.parking,
    tip: i.tip,
  };
  const met = GRADE_POINTS.filter((p) => ok[p]);
  const missing = GRADE_POINTS.filter((p) => !ok[p]);
  const score = met.length;
  const grade: TripGrade = score === GRADE_MAX ? 'A' : score === GRADE_MAX - 1 && ok.desc && ok.photos ? 'B' : 'C';
  return { grade, score, met, missing };
}

/** Vstupy z hotovej trasy + značiek na mape (väzba značky na výlet sa ODVODZUJE zo súradníc). */
export function gradeInputsForTrail(trail: HeroTrail, notes: MapNote[]): GradeInputs {
  const path = trail.path ?? [];
  return {
    desc: trail.desc ?? '',
    photos: (trail.photos ?? []).length,
    route: path.length >= 2 || (path.length >= 1 && !!trail.areaR),
    parking: !!trail.parking || !!parkingForTrail(notes, trail),
    tip: notesForTrail(notes, trail).length > 0 || (trail.customPoi ?? []).length > 0,
  };
}

export function gradeTrail(trail: HeroTrail, notes: MapNote[]): GradeResult {
  return gradeFromInputs(gradeInputsForTrail(trail, notes));
}

/** Na radenie: A=0, B=1, C=2 (menšie = vyššie). */
export const gradeRank = (g: TripGrade): number => (g === 'A' ? 0 : g === 'B' ? 1 : 2);
