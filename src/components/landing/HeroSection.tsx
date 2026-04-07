import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MatrixRain } from './MatrixRain';

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
  return (
    <section id="hero" className="relative h-screen flex flex-col items-center justify-center bg-black overflow-hidden">
      <MatrixRain />
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
        <motion.h1
          className="text-5xl md:text-8xl lg:text-9xl font-black tracking-wider"
          style={{
            fontFamily: "'Cinzel', serif",
            background: 'linear-gradient(135deg, #A3782B, #C49B42, #A3782B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          THE PLACE WHERE
          <br />
          DOG IS GOD
        </motion.h1>

        <motion.p
          className="text-lg md:text-2xl tracking-widest uppercase"
          style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <AnimatedCounter target={29} duration={2500} /> HEROGLYPHS CREATED
        </motion.p>

        <motion.a
          href="/name"
          className="mt-4 inline-block px-10 py-4 rounded-full text-lg md:text-xl font-bold tracking-wider border-2 border-white/30 transition-transform hover:scale-105"
          style={{
            fontFamily: "'Cinzel', serif",
            background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
            color: '#000',
            boxShadow: '0 0 40px hsl(39 80% 50% / 0.4)',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          CREATE HEROGLYPH
        </motion.a>
      </div>
    </section>
  );
}
