import { useEffect } from 'react';
import { acquireScrollLock } from './useBodyScrollLock';

/**
 * iOS Safari leaves a 100dvh overflow-hidden flow screen scrolled ("stuck in
 * the middle, must refresh") after the soft keyboard opens: it scrolls the
 * layout viewport to reveal the focused input and never restores it.
 *
 * This hook locks body/html scroll while a flow screen is mounted and resets
 * any residual window scroll when an input blurs or the keyboard closes.
 * Flow screens are designed not to scroll, so forcing scrollTo(0,0) is safe.
 *
 * Use on every flow screen that contains a text input / textarea.
 */
export function useFlowKeyboardFix() {
  useEffect(() => {
    // Shared refcount lock (body + html). Previously this saved/restored the
    // overflow itself, which clobbered — and got clobbered by — PageNav's two
    // locks whenever a flow screen and the nav/language overlay were mounted at
    // the same time, leaving the page permanently frozen. See useBodyScrollLock.
    const releaseLock = acquireScrollLock(true);

    const resetScroll = () => window.scrollTo(0, 0);
    window.addEventListener('focusout', resetScroll);
    window.visualViewport?.addEventListener('resize', resetScroll);

    // ── POLE SA PÍŠE PRIAMO NA OBRAZOVKE (17. 11. 2026) ─────────────────────────
    // Matej: *„po kliknutí na meno — zrušme ten popup a nechajme to klasicky, ako to býva v appkách"*.
    // iOS klávesnica nemení `dvh` ani layout viewport (viď `useKeyboardLift`), takže by pole aj dolné CTA
    // ostali POD ňou. Koľko okna klávesnica zobrala, ide do `--flow-kb`; šat vstupu (`flowP3dSkin`) o to
    // skráti obrazovku a zdvihne CTA. Kde sa okno zmenší samo (Android), vyjde 0 a nič sa nedeje.
    const vv = window.visualViewport;
    const root = document.documentElement;
    const syncKb = () => {
      if (!vv) return;
      const kb = Math.max(0, window.innerHeight - vv.height);
      root.style.setProperty('--flow-kb', kb > 80 ? `${Math.round(kb)}px` : '0px');
    };
    let seeTimer: number | undefined;
    const seeField = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el || !/^(INPUT|TEXTAREA)$/.test(el.tagName) || el.getAttribute('aria-hidden') === 'true') return;
      window.clearTimeout(seeTimer);
      // Až keď klávesnica dosadne a obrazovka sa skráti — skôr by sa rolovalo na starú polohu.
      seeTimer = window.setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 350);
    };
    syncKb();
    vv?.addEventListener('resize', syncKb);
    window.addEventListener('focusin', seeField);

    return () => {
      releaseLock();
      window.removeEventListener('focusout', resetScroll);
      window.visualViewport?.removeEventListener('resize', resetScroll);
      vv?.removeEventListener('resize', syncKb);
      window.removeEventListener('focusin', seeField);
      window.clearTimeout(seeTimer);
      root.style.removeProperty('--flow-kb');
    };
  }, []);
}
