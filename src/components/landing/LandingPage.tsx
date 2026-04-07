import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { StorySection } from './StorySection';
import { VisionSection } from './VisionSection';
import { AboutSection } from './AboutSection';

export function LandingPage() {
  return (
    <div className="w-full">
      <Header />
      <HeroSection />
      <StorySection />
      <VisionSection />
      <AboutSection />
    </div>
  );
}
