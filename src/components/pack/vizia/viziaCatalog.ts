// ČO STAVIAME — katalóg bez závislostí (importuje ho aj profil, preto žiadne ťažké importy). Pravidlá → `viziaData.ts`.
export const VIZIA_TAG = 't:vizia';
export const VIZIA_PATH = '/pack/staviame';

export type ViziaId = 'utulky' | 'zbierky' | 'bones' | 'kruhy' | 'centra' | 'land' | 'pomoc';
export type ViziaStage = 1 | 2 | 3;

/** Ikonky z továrne (`public/icons/vizia/`, 256 px) — Matej ich schválil, nemenia sa. Poradie = poradie v nákrese. */
export const VIZIA_ICON: Record<ViziaId, string> = {
  utulky: '/icons/vizia/utulky.webp',
  zbierky: '/icons/vizia/zbierky.webp',
  bones: '/icons/vizia/bones.webp',
  kruhy: '/icons/vizia/kruhy.webp',
  centra: '/icons/vizia/centra.webp',
  land: '/icons/vizia/land.webp',
  pomoc: '/icons/vizia/pomoc.webp',
};
export const VIZIA_IDS = Object.keys(VIZIA_ICON) as ViziaId[];
export const isViziaId = (x: unknown): x is ViziaId => typeof x === 'string' && (VIZIA_IDS as string[]).includes(x);

