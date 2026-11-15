// Texty obrazoviek po platbe (`WelcomeScreen`, `FlowWelcomeScreen`) v šate Papyrus 3D (15. 11. 2026).
// V slovníkoch majú na okrajoch trojbodku, dlhú pomlčku aj emoji (🎯) — všetko tri sú mimo brandu a opravovať
// 18 jazykov kvôli dvom obrazovkám nie je na mieste, preto sa očistia až pri vykreslení.

/** Bez trojbodky na okrajoch, bez dlhej pomlčky (→ čiarka), bez emoji. */
export const cleanText = (s: string): string => s
  .replace(/\p{Extended_Pictographic}️?/gu, '')
  .replace(/^\s*(\.{3}|…)\s*/, '')
  .replace(/\s*(\.{3}|…)\s*$/, '')
  .replace(/\s+[—–]\s+/g, ', ')
  .trim();

/** Kľúč, ktorý ešte nie je v slovníkoch, padne na EN text (idióm projektu `tx(kľúč, fallback)`). */
export const withFallback = (t: (k: string) => string) => (k: string, fb: string): string => {
  const v = t(k);
  return v === k ? fb : v;
};
