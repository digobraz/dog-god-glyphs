// ════════════════════════════════════════════════════════════════════════════
// BONES — FARBA SEKCIE JE TYRKYS, jeden zdroj (23. 10. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 23. 10. 2026: *„čo sa týka bones zmeňme to tak, že farbou tejto sekcie bude
// tyrkys … konsolidácia, modernizácia, zatraktívnenie"*.
//
// Odtieň NIE JE nový — je to pásmo `turquoise` z `lib/packTiers.ts`, ktoré už nesie
// pilulka BONES na titulke profilu (`meHead.tsx`, BONES_TIER). Šuplík a pilulka sú
// tak jedna vec jednou farbou.
//
// ⚠️ PRIZNANÁ VÝNIMKA z lapisového kánonu (ako AINUBIS a zelená Mapy.com): v sekcii
//    BONES je hlavné CTA tyrkysové, nie lapis. Mimo BONES sa tyrkys na CTA nedáva.
// ════════════════════════════════════════════════════════════════════════════
import { BONES_TIER, tierGradient } from '@/lib/packTiers';

const TQ = BONES_TIER;

export const BONES = {
  /** Svetlý a tmavý koniec pásma. */
  light: TQ.a,
  deep: TQ.b,
  /** Tmavý inkoust na tyrkysovej ploche. */
  ink: TQ.ink,
  /** Plocha CTA a odznakov — ten istý gradient ako pilulka BONES. */
  grad: tierGradient(TQ),
  /** Hlboký podklad hrdinu (čísla na ňom svietia). */
  heroGrad: `linear-gradient(140deg, ${TQ.b} 0%, #0F5F58 55%, #0A3D3A 100%)`,
  /** Text na hlbokom podklade. */
  onDeep: '#E6FBF6',
  onDeepDim: 'rgba(230,251,246,0.72)',
  /** Deliaca čiara na hlbokom podklade hrdinu. */
  heroLine: 'rgba(116,220,198,0.28)',
  /** Rám a tenké čiary na papyruse. */
  edge: 'rgba(23,140,128,0.55)',
  /** Jemný tint plochy na papyruse (zbalený blok, prázdny slot). */
  tint: 'rgba(116,220,198,0.16)',
  /** RGB trojice na krytie — `rgba(${BONES.rgb},x)`. */
  rgb: '23,140,128',
  lightRgb: '116,220,198',
} as const;
