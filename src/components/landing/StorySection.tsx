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
        background:
          'linear-gradient(to bottom, #000000 0%, #0a0806 25%, #1a1410 45%, #4a3a2a 62%, #a89376 76%, #d8c8ad 86%, #ecdfc8 93%, #F3EBDD 100%)',
      }}
    />
  );
}
