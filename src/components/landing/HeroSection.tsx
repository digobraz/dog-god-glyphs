import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

export function HeroSection() {
  const scrollToStory = () => {
    document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="h-screen w-full relative bg-black overflow-hidden">
      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />

      {/* Bottom gradient overlay - fades into STORY's black */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

      {/* Main content - perfectly centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20 pt-[120px] md:pt-[140px]">
        {/* Row 1: Social Proof */}
        <motion.div
          className="flex flex-row items-baseline justify-center gap-3 mb-2"
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

        {/* Row 2: Main Heading */}
        <motion.h1
          className="text-5xl md:text-8xl lg:text-9xl font-black tracking-wider leading-none"
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

        {/* Row 3: CTA Button */}
        <motion.a
          href="/generator-process"
          className="mt-8 inline-block px-12 py-5 rounded-full text-xl md:text-2xl font-bold tracking-wider border-2 border-[#FAF4EC]/30 transition-transform hover:scale-105"
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

        {/* Row 4: Secondary Action */}
        <motion.p
          className="mt-4 text-xs md:text-sm tracking-widest uppercase"
          style={{ fontFamily: "'Cinzel', serif", color: 'rgba(250, 244, 236, 0.6)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          or see story first
        </motion.p>
      </div>

      {/* Row 5: Pulsing Down Arrow */}
      <motion.button
        onClick={scrollToStory}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse z-20"
        style={{ color: '#C49B42' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        aria-label="Scroll to story"
      >
        <ChevronDown className="w-8 h-8 md:w-10 md:h-10" />
      </motion.button>
    </section>
  );
}
