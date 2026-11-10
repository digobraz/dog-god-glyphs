import { useCallback, useEffect, useRef, type RefObject } from 'react';

/**
 * Plávajúci prvok nad zoznamom sa počas rolovania schová a po zastavení vráti (Matej 10. 11. 2026).
 * Vracia obsluhu do `onScroll`. Prepína len triedu `is-scrolling`, aby rolovanie neprekresľovalo celú obrazovku;
 * prvok ostáva v rozložení (skrýva ho CSS cez `opacity`), takže jeho meraná poloha sa nemení.
 */
export function useHideWhileScrolling(ref: RefObject<HTMLElement>) {
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return useCallback(() => {
    ref.current?.classList.add('is-scrolling');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => ref.current?.classList.remove('is-scrolling'), 200);
  }, [ref]);
}
