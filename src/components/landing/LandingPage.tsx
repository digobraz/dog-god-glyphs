import { useEffect, useRef } from 'react';
import { Header } from './Header';
import { HeroStoryStack } from './HeroStoryStack';
import { VisionSection } from './VisionSection';
import { AboutSection } from './AboutSection';

const TRANSITION_DURATION = 1000;
const TOUCH_THRESHOLD = 50;

export function LandingPage() {
  const currentIndexRef = useRef(0);
  const isAnimating = useRef(false);
  const touchStartY = useRef(0);

  // Returns true if the user is currently inside the HeroStoryStack range
  // (i.e. native scroll should be allowed and hijacking suspended).
  const isInsideStack = () => {
    const stack = document.querySelector('[data-stack-native]') as HTMLElement | null;
    if (!stack) return false;
    const top = stack.offsetTop;
    const bottom = top + stack.offsetHeight - window.innerHeight;
    // Allow native scroll while inside the stack; hijack kicks in once
    // we've scrolled past it (or when scrolling up from the next snap page).
    return window.scrollY < bottom - 2;
  };

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
      // For the HeroStoryStack (index 0): scroll to TOP of the stack so
      // sticky animations replay from the start.
      let absoluteTop: number;
      if (clamped === 0) {
        absoluteTop = target.getBoundingClientRect().top + window.scrollY;
      } else {
        absoluteTop = target.getBoundingClientRect().top + window.scrollY;
      }
      const behavior = (instant || isSectionJump) ? 'instant' as ScrollBehavior : 'smooth';
      window.scrollTo({ top: absoluteTop, behavior });
    }

    setTimeout(() => {
      isAnimating.current = false;
    }, TRANSITION_DURATION);
  };

  const navigate = (direction: 1 | -1) => {
    if (isAnimating.current) return;
    const prev = currentIndexRef.current;
    let next: number;

    if (direction === -1) {
      // FAST-TRACK UP — go to first item of current section first
      if (prev === 6) next = 1;                      // ABOUT → VISION 1
      else if (prev > 1 && prev <= 5) next = 1;      // VISION 2-5 → VISION 1
      else if (prev === 1) next = 0;                 // VISION 1 → HERO STACK (top)
      else next = 0;
    } else {
      // STEP-BY-STEP DOWN
      next = Math.min(prev + 1, 6);
    }

    if (next === prev) return;
    scrollToIndex(next);
  };

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      // Inside the hero/story stack: let native scroll happen so the
      // cosmos.so-style animation can play across scroll progress.
      if (isInsideStack()) {
        // If scrolling up at the very top of the stack, fall through to hijack
        // (so we can snap back into hero state nicely if needed).
        return;
      }
      e.preventDefault();
      if (isAnimating.current) return;
      if (Math.abs(e.deltaY) < 5) return;
      navigate(e.deltaY > 0 ? 1 : -1);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isInsideStack()) return; // allow native touch scroll inside stack
      e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (isInsideStack()) return;
      if (isAnimating.current) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) < TOUCH_THRESHOLD) return;
      navigate(deltaY > 0 ? 1 : -1);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isInsideStack()) return;
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

    // Track current snap-page index based on scroll position so navigation
    // works correctly after native-scrolling inside the stack.
    const onScroll = () => {
      const targets = document.querySelectorAll('[data-snap-page]');
      const vh = window.innerHeight;
      const center = window.scrollY + vh / 2;
      let bestIdx = 0;
      let bestDist = Infinity;
      targets.forEach((el, i) => {
        const top = (el as HTMLElement).offsetTop;
        const height = (el as HTMLElement).offsetHeight;
        const elCenter = top + height / 2;
        const dist = Math.abs(center - elCenter);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });
      if (!isAnimating.current) currentIndexRef.current = bestIdx;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('nav-jump', onNavJump);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('nav-jump', onNavJump);
      window.removeEventListener('scroll', onScroll);
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
      <div data-stack-native>
        <HeroStoryStack />
      </div>
      <VisionSection />
      <div data-snap-page>
        <AboutSection />
      </div>
    </div>
  );
}
