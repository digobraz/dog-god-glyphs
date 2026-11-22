// KLÁVESNICA V APPKE (22. 11. 2026): bez lišty nad klávesnicou (šípky ˄ ˅, fajka, „Autom. vyplniť kontakt“).
// Matej: *„ponúka mi vyplnenie automatické, dá sa to vypnúť?“* — na webe nie (lištu kreslí iOS), v appke áno.
// `resize: 'none'` v capacitor.config.ts: okno appky sa pri klávesnici NEZMENŠUJE, obrazovky sa dvíhajú samy
// cez lib/keyboardInset.ts (rovnako ako v Safari) — inak by sa zdvihli dvakrát.
// ⚠️ Plugin je NATÍVNA zmena: telefón ho má až s novým buildom (scripts/appka/test.sh --testflight).
//    Starší build plugin nenájde a nič sa nestane.
import { IS_APP } from '@/lib/isApp';

/** Zavolaj raz pri štarte (main.tsx). Na webe nerobí nič. */
export function startAppKeyboard() {
  if (!IS_APP) return;
  (async () => {
    const [{ Capacitor }, { Keyboard }] = await Promise.all([import('@capacitor/core'), import('@capacitor/keyboard')]);
    if (!Capacitor.isPluginAvailable('Keyboard') || Capacitor.getPlatform() !== 'ios') return;
    await Keyboard.setAccessoryBarVisible({ isVisible: false });
  })().catch((e) => console.warn('[appKeyboard]', e));
}
