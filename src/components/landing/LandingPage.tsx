import { useEffect, useRef } from 'react';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { StorySection } from './StorySection';
import { VisionSection } from './VisionSection';
import { AboutSection } from './AboutSection';

const TRANSITION_DURATION = 1000;
const TOUCH_THRESHOLD = 50;

export function LandingPage() {
  const currentIndexRef = useRef(0);
  const isAnimating = useRef(false);
  const touchStartY = useRef(0);

  const scrollToIndex = (index: number, instant = false) => {
    const targets = document.querySelectorAll('[data-snap-page]');
    const clamped = Math.max(0, Math.min(index, targets.length - 1));
    if (clamped === currentIndexRef.current && isAnimating.current) return;
    if (isAnimating.current) return;

    const prevIndex = currentIndexRef.current;
    const isSectionJump = Math.abs(clamped - prevIndex) > 1;

    isAnimating.current = true;
    currentIndexRef.current = clamped;

    const target = targets[clamped] as HTMLElement;
    if (target) {
      const absoluteTop = target.getBoundingClientRect().top + window.scrollY;
      // Use instant scroll for section jumps to avoid rewind glitch
      const behavior = (instant || isSectionJump) ? 'instant' as ScrollBehavior : 'smooth';
      window.scrollTo({ top: absoluteTop, behavior });
    }

    const delay = TRANSITION_DURATION;
    setTimeout(() => {
      isAnimating.current = false;
    }, delay);
  };

  const navigate = (direction: 1 | -1) => {
    if (isAnimating.current) return;
    const prev = currentIndexRef.current;
    let next: number;

    if (direction === -1) {
      // FAST-TRACK UP — go to first item of current section first
      if (prev === 15) next = 10;
      else if (prev > 10 && prev <= 14) next = 10;  // VISION 2-5 → VISION 1
      else if (prev === 10) next = 1;                // VISION 1 → STORY 1
      else if (prev > 1 && prev <= 9) next = 1;      // STORY 2-9 → STORY 1
      else if (prev === 1) next = 0;                  // STORY 1 → HERO
      else next = 0;
    } else {
      // STEP-BY-STEP DOWN
      next = Math.min(prev + 1, 15);
    }

    if (next === prev) return;
    scrollToIndex(next);
  };

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

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
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

    const onNavJump = (e: Event) => {
      const targetIndex = (e as CustomEvent).detail as number;
      scrollToIndex(targetIndex);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('nav-jump', onNavJump);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('nav-jump', onNavJump);
    };
  }, []);

  // Handle hash navigation
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const targets = document.querySelectorAll('[data-snap-page]');
        const arr = Array.from(targets);
        const idx = arr.findIndex(el => `#${el.closest('[id]')?.id}` === hash || el.id === hash.slice(1));
        if (idx >= 0) scrollToIndex(idx);
      }, 200);
    }
  }, []);

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
