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

    // ⚠️ Návrat hore LEN keď klávesnica zmizne. Dovtedy sa volal pri KAŽDEJ zmene viewportu — aj počas písania,
    //    keď iOS sám posúva ku kurzoru — a obrazovka poskočila hore a späť (Matej 19. 11. 2026: „seká to… na
    //    mikrosekundu to vyzerá ako pokazené“). Tri ruky na jednom posune: iOS, toto a `seeField`.
    const kbOpen = () => !!window.visualViewport && window.innerHeight - window.visualViewport.height > 80;
    const resetScroll = () => { if (!kbOpen() && window.scrollY !== 0) window.scrollTo(0, 0); };
    const onFocusOut = () => window.setTimeout(resetScroll, 50);
    window.addEventListener('focusout', onFocusOut);
    window.visualViewport?.addEventListener('resize', resetScroll);

    // ── POLE SA PÍŠE PRIAMO NA OBRAZOVKE (17. 11. 2026) ─────────────────────────
    // Matej: *„po kliknutí na meno — zrušme ten popup a nechajme to klasicky, ako to býva v appkách"*.
    // iOS klávesnica nemení `dvh` ani layout viewport (viď `useKeyboardLift`), takže by pole aj dolné CTA
    // ostali POD ňou. Koľko okna klávesnica zobrala, ide do `--flow-kb`; šat vstupu (`flowP3dSkin`) o to
    // skráti obrazovku a zdvihne CTA. Kde sa okno zmenší samo (Android), vyjde 0 a nič sa nedeje.
    const vv = window.visualViewport;
    const root = document.documentElement;
    // Raz za snímku a len pri skutočnej zmene: iOS hlási `resize` počas celej animácie klávesnice
    // a každý zápis premennej preskladá celú obrazovku.
    let lastKb = '';
    let kbFrame = 0;
    const syncKb = () => {
      if (!vv || kbFrame) return;
      kbFrame = window.requestAnimationFrame(() => {
        kbFrame = 0;
        const kb = Math.max(0, window.innerHeight - vv.height);
        const v = kb > 80 ? `${Math.round(kb)}px` : '0px';
        if (v === lastKb) return;
        lastKb = v;
        root.style.setProperty('--flow-kb', v);
      });
    };
    let seeTimer: number | undefined;
    const seeField = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el || !/^(INPUT|TEXTAREA)$/.test(el.tagName) || el.getAttribute('aria-hidden') === 'true') return;
      window.clearTimeout(seeTimer);
      // Až keď klávesnica dosadne a obrazovka sa skráti — skôr by sa rolovalo na starú polohu.
      // Len keď pole naozaj nie je vidno — inak zbytočný posun obrazovky, ktorá sa práve skracuje.
      seeTimer = window.setTimeout(() => {
        const r = el.getBoundingClientRect();
        const h = window.visualViewport?.height ?? window.innerHeight;
        if (r.top < 0 || r.bottom > h) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }, 350);
    };
    syncKb();
    vv?.addEventListener('resize', syncKb);
    window.addEventListener('focusin', seeField);

    return () => {
      releaseLock();
      window.removeEventListener('focusout', onFocusOut);
      window.cancelAnimationFrame(kbFrame);
      window.visualViewport?.removeEventListener('resize', resetScroll);
      vv?.removeEventListener('resize', syncKb);
      window.removeEventListener('focusin', seeField);
      window.clearTimeout(seeTimer);
      root.style.removeProperty('--flow-kb');
    };
  }, []);
}
