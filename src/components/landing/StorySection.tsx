/**
 * StorySection — gradient bridge from the black HeroVideoSequence into the
 * Papyrus-coloured VisionSection. The video itself now lives inside
 * HeroVideoSequence (scroll-driven). This section is purely a visual transition.
 */
export function StorySection() {
  return (
    <section
      id="story"
      className="relative w-full"
      style={{
        height: '40vh',
        background: '#000000',
      }}
    />
  );
}
