import { useEffect } from 'react';

/**
 * Page-scroll locking that survives MULTIPLE overlapping overlays.
 *
 * Why a shared refcount instead of each caller saving/restoring itself:
 * the naive per-component pattern
 *
 *   const prev = document.body.style.overflow;
 *   document.body.style.overflow = 'hidden';
 *   return () => { document.body.style.overflow = prev; };
 *
 * breaks the moment two of them overlap, because the second captures
 * `prev = 'hidden'` from the first and restores THAT on close:
 *
 *   A opens  → prevA='',       body='hidden'
 *   B opens  → prevB='hidden', body='hidden'
 *   A closes → body=''         (unlocked too early)
 *   B closes → body='hidden'   ← STUCK, page frozen until reload
 *
 * That is the bug a member hit on 2026-07-26 ("zaseklo a nedalo sa s tým hýbať…
 * dala som to cele refreshnúť A potom už to išlo"). Three independent copies of
 * the pattern existed — the language picker, the mobile menu (both PageNav) and
 * the flow-screen keyboard fix — so any two of them overlapping froze the page.
 *
 * Here the first locker records the original value and the element is restored
 * only when the LAST lock is released, so overlap and unmount order stop
 * mattering.
 */

type Target = 'body' | 'html';

const state: Record<Target, { count: number; saved: string | null }> = {
  body: { count: 0, saved: null },
  html: { count: 0, saved: null },
};

const elementFor = (t: Target): HTMLElement =>
  t === 'body' ? document.body : document.documentElement;

function acquire(t: Target): void {
  const s = state[t];
  if (s.count === 0) {
    s.saved = elementFor(t).style.overflow;
    elementFor(t).style.overflow = 'hidden';
  }
  s.count += 1;
}

function release(t: Target): void {
  const s = state[t];
  if (s.count === 0) return;
  s.count -= 1;
  if (s.count === 0) {
    elementFor(t).style.overflow = s.saved ?? '';
    s.saved = null;
  }
}

/** Imperative form — for hooks that already own an effect (e.g. useFlowKeyboardFix). */
export function acquireScrollLock(alsoHtml = false): () => void {
  acquire('body');
  if (alsoHtml) acquire('html');
  let released = false;
  return () => {
    if (released) return;
    released = true;
    release('body');
    if (alsoHtml) release('html');
  };
}

/** Lock page scroll while `active` is true. Safe to nest/overlap. */
export function useBodyScrollLock(active: boolean, alsoHtml = false): void {
  useEffect(() => {
    if (!active) return;
    return acquireScrollLock(alsoHtml);
  }, [active, alsoHtml]);
}
