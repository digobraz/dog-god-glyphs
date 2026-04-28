import { useEffect } from 'react';
import { Header } from './Header';
import { HeroVideoSequence } from './HeroVideoSequence';
import { StorySection } from './StorySection';
import { VisionSection } from './VisionSection';
import { AboutSection } from './AboutSection';
import { TestimonialsSection } from './TestimonialsSection';

/**
 * Cosmos.so-style landing page.
 * Pure native smooth scroll. No hijacking, no snapping, no scrubbing.
 * Sections fade in via Framer Motion `whileInView`.
 */
export function LandingPage() {
  // Handle initial hash navigation on load
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.slice(1);
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full">
      <Header />
      <HeroVideoSequence />
      <StorySection />
      <VisionSection />
      <AboutSection />
      <TestimonialsSection />
    </div>
  );
}
