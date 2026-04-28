import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

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

export function HeroSection() {
  const videoId = 'WDZQP7LuOBc';
  const peekEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&playsinline=1&showinfo=0&iv_load_policy=3`;

  const scrollToStory = () => {
    document.getElementById('story')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="hero"
      className="relative w-full flex flex-col items-center text-center px-4 pt-[140px] md:pt-[160px] overflow-hidden"
      style={{ height: '100dvh', backgroundColor: '#000' }}
    >
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" />

      {/* Centered text block */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
      <motion.div
        className="flex flex-row items-baseline justify-center gap-3 mb-2 relative"
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
        className="text-4xl md:text-7xl lg:text-8xl font-black tracking-wider leading-none relative"
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
        className="mt-8 inline-block px-10 py-4 rounded-full text-lg md:text-xl font-bold tracking-wider border-2 border-[#FAF4EC]/30 transition-transform hover:scale-105 relative"
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
      </div>

      {/* Video peek at bottom — cosmos.so style */}
      <motion.button
        onClick={scrollToStory}
        className="relative z-10 flex items-center gap-2 mb-4 text-xs md:text-sm tracking-[0.2em] uppercase cursor-pointer hover:opacity-100 transition-opacity"
        style={{ fontFamily: "'Cinzel', serif", color: 'rgba(250, 244, 236, 0.7)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <Play className="w-3 h-3 md:w-4 md:h-4 fill-current" />
        Watch our story
      </motion.button>

      <motion.div
        onClick={scrollToStory}
        className="relative w-[88%] max-w-[1100px] rounded-t-2xl overflow-hidden cursor-pointer"
        style={{
          height: '45vh',
          boxShadow:
            '0 0 60px rgba(196,155,66,0.15), 0 -10px 40px rgba(196,155,66,0.08)',
          border: '1px solid rgba(196,155,66,0.15)',
          borderBottom: 'none',
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <iframe
          src={peekEmbedUrl}
          title="DOGYPT story preview"
          className="absolute inset-0 w-full h-full pointer-events-none"
          frameBorder={0}
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      </motion.div>
    </section>
  );
}