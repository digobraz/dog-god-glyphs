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

    return () => {
      releaseLock();
      window.removeEventListener('focusout', resetScroll);
      window.visualViewport?.removeEventListener('resize', resetScroll);
    };
  }, []);
}
