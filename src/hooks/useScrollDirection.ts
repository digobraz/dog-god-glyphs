import { useState, useEffect, useRef } from 'react';

export type ScrollDirection = 'down' | 'up' | null;

export function useScrollDirection(threshold = 10) {
  const [direction, setDirection] = useState<ScrollDirection>(null);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - lastY.current) >= threshold) {
          setDirection(y > lastY.current ? 'down' : 'up');
        }
        lastY.current = y;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return direction;
}
