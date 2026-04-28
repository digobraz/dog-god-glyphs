import { motion } from 'framer-motion';

export function StorySection() {
  const videoId = 'WDZQP7LuOBc';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&playsinline=1&showinfo=0&iv_load_policy=3`;

  return (
    <section
      id="story"
      className="relative w-full flex flex-col items-center justify-center px-6 md:px-10"
      style={{ height: '100dvh', backgroundColor: '#000' }}
    >
      <motion.div
        className="flex flex-col items-center text-center mb-6 md:mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <span
          className="text-xs md:text-sm tracking-[0.3em] uppercase mb-2"
          style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}
        >
          29 PEOPLE SAY: IN DOG WE TRUST
        </span>
        <h2
          className="text-2xl md:text-4xl font-black tracking-wider"
          style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}
        >
          BE NEXT!
        </h2>
      </motion.div>

      <motion.div
        className="w-full max-w-[1100px] aspect-video rounded-2xl overflow-hidden relative"
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
    </section>
  );
}