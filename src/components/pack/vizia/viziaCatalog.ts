// ČO STAVIAME — katalóg bez závislostí (importuje ho aj profil, preto žiadne ťažké importy). Pravidlá → `viziaData.ts`.
export const VIZIA_TAG = 't:vizia';
export const VIZIA_PATH = '/pack/staviame';

/** Id plánu je voľný reťazec (23. 11. 2026): nové plány a Hotovo pribúdajú v DB bez nasadenia appky. */
export type ViziaId = string;
/** plan = Vízia, wip = Práve pracujeme, done = Hotovo (`attach.vizia.kind`, chýba = plan). */
export type ViziaKind = 'plan' | 'wip' | 'done';
export type ViziaStage = 1 | 2 | 3;

/** Ikonky z továrne (`public/icons/vizia/`, 256 px) — Matej ich schválil, nemenia sa. Poradie = poradie v nákrese. */
export const VIZIA_ICON: Record<string, string> = {
  utulky: '/icons/vizia/utulky.webp',
  zbierky: '/icons/vizia/zbierky.webp',
  bones: '/icons/vizia/bones.webp',
  kruhy: '/icons/vizia/kruhy.webp',
  centra: '/icons/vizia/centra.webp',
  land: '/icons/vizia/land.webp',
  pomoc: '/icons/vizia/pomoc.webp',
};
export const VIZIA_IDS = Object.keys(VIZIA_ICON);
export const isViziaId = (x: unknown): x is ViziaId => typeof x === 'string' && x.length > 0;
/** Ikonka plánu: `attach.vizia.icon` z DB, inak tá z továrne, inak neutrálna (Hotovo má bohaté ikonky z `web-app/ikony/`). */
export const viziaIconOf = (id: string, icon?: string | null) => icon || VIZIA_ICON[id] || '/web-app/ikony/feed.webp';

