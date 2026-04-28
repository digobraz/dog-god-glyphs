import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { Play } from 'lucide-react';
import { DogCircleCarousel } from './DogCircleCarousel';

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [target, duration]);
  return <span>{count.toLocaleString()}</span>;
}

/**
 * Pinned scroll-driven Hero → Video sequence (cosmos.so style stage):
 *
 * Outer wrapper has tall height (≈165 vh) — that's the "scroll budget".
 * Inner stage is `position: sticky; height: 100dvh`, so it stays glued to the
 * viewport top while the user scrolls through the budget.
 *
 * scrollYProgress (0 → 1) drives 4 things in parallel:
 *  - spiral: extra rotation boost + opacity fade
 *  - hero text + CTA: scale down + fade out
 *  - video: translateY upward from "peeking from below" → centered in viewport
 *  - background stays #000 the whole time
 */
export function HeroVideoSequence() {
  const wrapperRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  // --- Hero text/CTA fade+scale (fade almost immediately into black) ---
  const heroOpacity = useTransform(scrollYProgress, [0, 0.04, 0.1], [1, 0.2, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.9]);

  // --- Spiral fade (very fast) + spin SPEED multiplier (rings spin faster, frame stays still) ---
  const spiralOpacity = useTransform(scrollYProgress, [0, 0.04, 0.1], [1, 0.25, 0]);
  const spiralSpeed = useTransform(scrollYProgress, [0, 0.3, 1], [1, 6, 12]);

  // --- Video position ---
  // Desktop: peek at 66vh (kept fixed per user). Mobile: 42vh — viewport is too
  // short for 66vh, video would fall completely under the fold.
  const videoStartY = isMobile ? '42vh' : '66vh';
  const videoY = useTransform(scrollYProgress, [0, 0.58, 1], [videoStartY, '0vh', '0vh']);
  const videoScale = useTransform(scrollYProgress, [0, 0.58, 1], [0.92, 1, 1]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.03, 0.1], [1, 0.2, 0]);

  // --- Blackout layer: text + spiral should disappear into black, not just fade away. ---
  const blackoutOpacity = useTransform(scrollYProgress, [0, 0.02, 0.06, 0.1], [0, 0.85, 1, 1]);

  // --- Bottom gradient mask intensity (used only at the start). ---
  const maskOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // Reduced-motion: pin the values at the start state.
  const reduceMotion = useMotionValue(0);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotion.set(mq.matches ? 1 : 0);
    const onChange = () => reduceMotion.set(mq.matches ? 1 : 0);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [reduceMotion]);

  const videoId = 'WDZQP7LuOBc';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;

  const handlePlayClick = () => {
    const wrapper = wrapperRef.current;
    if (wrapper) {
      // scrollYProgress = (scrollY - wrapperTop) / (wrapperHeight - viewportHeight).
      // Video is centered when progress = 0.58, so:
      const vh = window.innerHeight;
      const scrollable = wrapper.offsetHeight - vh;
      const target = wrapper.offsetTop + scrollable * 0.58;
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
    window.setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
    }, 900);
  };

  // Optional: log progress in dev so we can verify the pin works.
  useMotionValueEvent(scrollYProgress, 'change', () => {
    /* hook intentionally empty — keeps motion value subscribed for smooth updates */
  });

  return (
    <section
      ref={wrapperRef}
      id="hero"
      className="relative w-full"
      style={{ height: '165vh', backgroundColor: '#000' }}
    >
      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: '100dvh', backgroundColor: '#000' }}
      >
        {/* ---------- SPIRAL LAYER ---------- */}
        {/* Note: we DO NOT rotate the wrapper. Instead we pass a `--speed` CSS var
            that divides each ring's animation-duration, so individual photos spin
            faster while the frame stays still. */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            opacity: spiralOpacity,
            ['--speed' as never]: spiralSpeed,
          }}
        >
          <DogCircleCarousel />
        </motion.div>

        {/* central radial vignette behind headline */}
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            opacity: heroOpacity,
            background:
              'radial-gradient(ellipse 46% 34% at 50% 46%, #000 0%, #000 32%, rgba(0,0,0,0.98) 50%, rgba(0,0,0,0.85) 66%, rgba(0,0,0,0.5) 82%, rgba(0,0,0,0) 100%)',
          }}
        />
        {/* bottom fade zone */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{
            opacity: maskOpacity,
            height: '32%',
            background:
              'linear-gradient(to top, #000 0%, #000 20%, rgba(0,0,0,0.9) 48%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0) 100%)',
          }}
        />

        {/* ---------- HERO TEXT + CTA ---------- */}
        <motion.div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 pt-[80px] md:pt-[140px]"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <motion.div
            className="flex flex-row items-baseline justify-center gap-3 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="font-black text-2xl md:text-4xl lg:text-5xl"
              style={{ fontFamily: "'Cinzel', serif", color: '#FAF4EC' }}
            >
              <AnimatedCounter target={29} duration={2500} />
            </span>
            <span
              className="font-normal text-base md:text-xl tracking-widest uppercase"
              style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}
            >
              PEOPLE SAY:
            </span>
          </motion.div>

          <motion.h1
            className="text-[2rem] md:text-7xl lg:text-8xl font-black tracking-wider leading-none"
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
            className="mt-5 md:mt-8 inline-block px-7 py-3 md:px-10 md:py-4 rounded-full text-base md:text-xl font-bold tracking-wider border-2 border-[#FAF4EC]/30 transition-transform hover:scale-105"
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
        </motion.div>

        <motion.div
          className="absolute inset-0 z-[25] pointer-events-none"
          style={{
            opacity: blackoutOpacity,
            backgroundColor: '#000',
          }}
        />

        {/* ---------- VIDEO LAYER ---------- */}
        <motion.div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 md:px-10 pointer-events-none"
          style={{ y: videoY }}
        >
          <motion.button
            type="button"
            onClick={handlePlayClick}
            className="pointer-events-auto flex items-center gap-3 mb-3 transition-transform hover:scale-105 cursor-pointer bg-transparent border-0 p-0"
            style={{ opacity: labelOpacity }}
          >
            <span
              className="rounded-full grid place-items-center w-7 h-7 md:w-8 md:h-8"
              style={{
                border: '1.5px solid #FAF4EC',
                boxShadow: '0 0 14px rgba(250,244,236,0.25)',
              }}
            >
              <Play
                size={12}
                fill="#FAF4EC"
                strokeWidth={0}
                style={{ marginLeft: '1px' }}
              />
            </span>
            <span
              className="text-xs md:text-sm tracking-[0.25em] uppercase"
              style={{ fontFamily: "'Cinzel', serif", color: '#FAF4EC' }}
            >
              Watch INTRO MOVIE
            </span>
          </motion.button>

          <motion.div
            className="w-full max-w-[760px] aspect-video rounded-2xl overflow-hidden relative pointer-events-auto"
            style={{
              scale: videoScale,
              boxShadow:
                '0 0 80px rgba(196,155,66,0.18), 0 0 200px rgba(196,155,66,0.08), 0 20px 60px rgba(0,0,0,0.6)',
              border: '1px solid rgba(196,155,66,0.15)',
            }}
          >
            <iframe
              ref={iframeRef}
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
    </section>
  );
}
