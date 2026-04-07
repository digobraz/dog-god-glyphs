import { useEffect, useRef, useState, useCallback } from 'react';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { StorySection } from './StorySection';
import { VisionSection } from './VisionSection';
import { AboutSection } from './AboutSection';

const TRANSITION_DURATION = 1000;
const TOUCH_THRESHOLD = 50;

export function LandingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAnimating = useRef(false);
  const touchStartY = useRef(0);
  const totalPages = useRef(0);

  // Calculate total pages: 1 (hero) + 9 (story) + 5 (vision) + 1 (about) = 16
  // We read this from DOM snap targets instead of hardcoding
  const getSnapTargets = useCallback(() => {
    const targets = document.querySelectorAll('[data-snap-page]');
    return targets;
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const targets = getSnapTargets();
    totalPages.current = targets.length;
    const clamped = Math.max(0, Math.min(index, targets.length - 1));
    if (clamped === currentIndex && isAnimating.current) return;

    isAnimating.current = true;
    setCurrentIndex(clamped);

    const target = targets[clamped] as HTMLElement;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }

    setTimeout(() => {
      isAnimating.current = false;
    }, TRANSITION_DURATION);
  }, [currentIndex, getSnapTargets]);

  const navigate = useCallback((direction: 1 | -1) => {
    if (isAnimating.current) return;
    const targets = getSnapTargets();
    totalPages.current = targets.length;
    const next = Math.max(0, Math.min(currentIndex + direction, targets.length - 1));
    if (next === currentIndex) return;
    scrollToIndex(next);
  }, [currentIndex, scrollToIndex, getSnapTargets]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimating.current) return;
      if (Math.abs(e.deltaY) < 5) return;
      navigate(e.deltaY > 0 ? 1 : -1);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (isAnimating.current) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) < TOUCH_THRESHOLD) return;
      navigate(deltaY > 0 ? 1 : -1);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isAnimating.current) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        navigate(1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        navigate(-1);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [navigate]);

  // Handle hash navigation
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const targets = getSnapTargets();
        const arr = Array.from(targets);
        const idx = arr.findIndex(el => `#${el.closest('[id]')?.id}` === hash || el.id === hash.slice(1));
        if (idx >= 0) scrollToIndex(idx);
      }, 200);
    }
  }, [getSnapTargets, scrollToIndex]);

  return (
    <div className="w-full">
      <Header />
      <div data-snap-page>
        <HeroSection />
      </div>
      <StorySection />
      <VisionSection />
      <div data-snap-page>
        <AboutSection />
      </div>
    </div>
  );
}
