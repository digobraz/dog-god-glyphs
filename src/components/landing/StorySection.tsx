import { motion } from 'framer-motion';

export function StorySection() {
  const videoId = 'WDZQP7LuOBc';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&playsinline=1&showinfo=0&iv_load_policy=3`;

  return (
    <section
      id="story"
      className="relative w-full flex flex-col items-center justify-start px-6 md:px-10 overflow-visible"
      style={{
        height: '100dvh',
        background:
          'linear-gradient(to bottom, #000000 0%, #0a0806 30%, #1a1410 45%, #4a3a2a 58%, #a89376 70%, #d8c8ad 80%, #ecdfc8 88%, #F3EBDD 100%)',
      }}
    >
      {/* Lift the whole label + video block upward so the video pokes a tiny strip
          above the bottom edge of the Hero section above. */}
      <div
        className="flex flex-col items-center w-full"
        style={{
          transform: 'translateY(-10vh)',
          position: 'relative',
          zIndex: 30,
        }}
      >
        <motion.span
          className="block text-xs md:text-sm tracking-[0.25em] uppercase mb-3"
          style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          Watch INTRO MOVIE
        </motion.span>

        <motion.div
          className="w-full max-w-[760px] aspect-video rounded-2xl overflow-hidden relative"
          style={{
            boxShadow:
              '0 0 80px rgba(196,155,66,0.18), 0 0 200px rgba(196,155,66,0.08), 0 20px 60px rgba(0,0,0,0.6)',
            border: '1px solid rgba(196,155,66,0.15)',
          }}
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <iframe
            src={embedUrl}
            title="DOGYPT story"
            className="absolute inset-0 w-full h-full"
            frameBorder={0}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      </div>
    </section>
  );
}
