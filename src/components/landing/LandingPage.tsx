import { useEffect, useState, useRef } from 'react';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { StorySection } from './StorySection';
import { VisionSection } from './VisionSection';
import { AboutSection } from './AboutSection';

export function LandingPage() {
  const [scrollingUp, setScrollingUp] = useState(false);
  const lastY = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < lastY.current - 8) {
          setScrollingUp(true);
        } else if (y > lastY.current + 8) {
          setScrollingUp(false);
        }
        lastY.current = y;
        tickingRef.current = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={scrollingUp ? 'w-full' : 'w-full snap-y snap-mandatory'} style={{ overflowY: scrollingUp ? 'auto' : undefined }}>
      <div className="snap-start">
        <Header />
        <HeroSection />
      </div>
      <StorySection scrollingUp={scrollingUp} />
      <VisionSection scrollingUp={scrollingUp} />
      <div className="snap-start">
        <AboutSection />
      </div>
    </div>
  );
}
