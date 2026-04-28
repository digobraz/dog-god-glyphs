import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [target, duration]);
  return <span>{count.toLocaleString()}</span>;
}

/**
 * Cosmos.so-style hero → video transition.
 * Outer wrapper = 230dvh tall scroll track.
 * Inside: ONE sticky 100dvh stage that holds both hero text and video,
 * stacked absolutely. Scroll progress drives opacity/scale/translate.
 */
export function HeroStoryStack() {
  const stackRef = useRef<HTMLDivElement>(null);
  const videoId = 'WDZQP7LuOBc';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&playsinline=1&showinfo=0&iv_load_policy=3`;

  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ['start start', 'end end'],
  });

  // Hero text fades + scales down (0 → 0.4 progress)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, -40]);
  const arrowOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // Video rises (0.2 → 0.7 progress)
  const videoOpacity = useTransform(scrollYProgress, [0.2, 0.7], [0, 1]);
  const videoY = useTransform(scrollYProgress, [0.2, 0.7], [60, 0]);
  const videoScale = useTransform(scrollYProgress, [0.2, 0.7], [0.93, 1]);

  // Caption above video
  const captionOpacity = useTransform(scrollYProgress, [0.4, 0.75], [0, 1]);

  return (
    <div
      ref={stackRef}
      className="relative w-full bg-black"
      style={{ height: '230dvh' }}
      data-snap-page
    >
      {/* Single sticky stage that holds both layers */}
      <div
        className="sticky top-0 left-0 w-full overflow-hidden bg-black"
        style={{ height: '100dvh' }}
      >
        {/* === Layer 1: HERO TEXT === */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-[120px] md:pt-[140px]"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY, zIndex: 1 }}
        >
          {/* Top + bottom gradient overlays (decorative) */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black to-transparent pointer-events-none" />

          <motion.div
            className="flex flex-row items-baseline justify-center gap-3 mb-2 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="font-black text-3xl md:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Cinzel', serif", color: '#FAF4EC' }}
            >
              <AnimatedCounter target={29} duration={2500} />
            </span>
            <span
              className="font-normal text-xl md:text-2xl tracking-widest uppercase"
              style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}
            >
              PEOPLE SAY:
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-8xl lg:text-9xl font-black tracking-wider leading-none relative"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, #A3782B, #C49B42, #A3782B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            IN DOG
            <br />
            WE TRUST
          </motion.h1>

          <motion.a
            href="/generator-process"
            className="mt-8 inline-block px-12 py-5 rounded-full text-xl md:text-2xl font-bold tracking-wider border-2 border-[#FAF4EC]/30 transition-transform hover:scale-105 relative"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
              color: '#000',
              boxShadow: '0 0 40px hsl(39 80% 50% / 0.4)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            BE NEXT!
          </motion.a>

          <motion.p
            className="mt-4 text-xs md:text-sm tracking-widest uppercase relative"
            style={{ fontFamily: "'Cinzel', serif", color: 'rgba(250, 244, 236, 0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            or see story first
          </motion.p>
        </motion.div>

        {/* Pulsing arrow (separate so it can fade independently) */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse"
          style={{ color: '#C49B42', opacity: arrowOpacity, zIndex: 2 }}
        >
          <ChevronDown className="w-8 h-8 md:w-10 md:h-10" />
        </motion.div>

        {/* === Layer 2: VIDEO === */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 md:px-10 pt-20 md:pt-24"
          style={{ opacity: videoOpacity, zIndex: 3, pointerEvents: 'none' }}
        >
          <motion.div
            className="flex flex-col items-center text-center mb-6 md:mb-8"
            style={{ opacity: captionOpacity }}
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
              y: videoY,
              scale: videoScale,
              pointerEvents: 'auto',
              boxShadow:
                '0 0 80px rgba(196,155,66,0.18), 0 0 200px rgba(196,155,66,0.08), 0 20px 60px rgba(0,0,0,0.6)',
              border: '1px solid rgba(196,155,66,0.15)',
            }}
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
        </motion.div>
      </div>

      {/* Anchor for nav#story */}
      <div id="story" className="absolute" style={{ top: '100dvh', height: '130dvh' }} />
    </div>
  );
}
