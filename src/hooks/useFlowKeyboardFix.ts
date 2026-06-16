import { useEffect } from 'react';

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
    const { body } = document;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';

    const resetScroll = () => window.scrollTo(0, 0);
    window.addEventListener('focusout', resetScroll);
    window.visualViewport?.addEventListener('resize', resetScroll);

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      window.removeEventListener('focusout', resetScroll);
      window.visualViewport?.removeEventListener('resize', resetScroll);
    };
  }, []);
}
