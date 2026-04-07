import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PawPrint } from 'lucide-react';

const steps = [
  {
    title: 'The system is broken.',
    detail: 'Over 500 million dogs live without homes. Shelters are overwhelmed. The current model of rescue and adoption is fragmented, underfunded, and invisible to most of the world. We need a new paradigm.',
  },
  {
    title: 'Dogs gave us everything.',
    detail: 'For 12,000 years, dogs have been our guardians, healers, and companions. They domesticated themselves to be with us. They chose us — and we owe them a debt that no amount of treats can repay.',
  },
  {
    title: 'Identity creates belonging.',
    detail: 'Every dog deserves to be seen. A HEROGLYPH is more than an image — it\'s a digital identity, a sacred symbol that says: "This dog matters. This dog is loved. This dog is part of something bigger."',
  },
  {
    title: 'Community drives change.',
    detail: 'When millions of dog lovers unite around a shared symbol and mission, the impossible becomes inevitable. DOGYPT is building the world\'s largest community of dog lovers — not just to celebrate dogs, but to save them.',
  },
  {
    title: 'Everything starts with your HEROGLYPH.',
    detail: 'Your dog\'s HEROGLYPH is the first step in a revolution. It\'s a statement, a badge of honor, and a contribution to a global movement that will change the lives of millions of dogs.',
    isCTA: true,
  },
];

function TimelineNode({ step, index }: { step: typeof steps[0]; index: number }) {
  return (
    <motion.div
      className="relative flex gap-6 md:gap-10 items-start"
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      {/* Paw node */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <motion.div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #A3782B, #C49B42)',
            boxShadow: '0 0 20px rgba(196,155,66,0.4)',
          }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <PawPrint className="w-5 h-5 text-black" />
        </motion.div>
        {index < steps.length - 1 && (
          <div className="w-0.5 flex-1 min-h-[80px]" style={{ backgroundColor: 'rgba(196,155,66,0.2)' }} />
        )}
      </div>

      {/* Content */}
      <div className={`pb-16 ${step.isCTA ? 'pb-8' : ''}`}>
        <h3
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ fontFamily: "'Cinzel', serif", color: 'hsl(36 58% 40%)' }}
        >
          {step.title}
        </h3>
        <p className="text-foreground/70 text-base md:text-lg leading-relaxed max-w-lg mb-4">
          {step.detail}
        </p>
        {step.isCTA && (
          <motion.a
            href="/name"
            className="inline-block mt-4 px-10 py-4 rounded-full text-lg font-bold tracking-wider border-2 border-white/30 transition-transform hover:scale-105"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
              color: '#000',
              boxShadow: '0 0 40px hsl(39 80% 50% / 0.4)',
            }}
            whileHover={{ scale: 1.05 }}
          >
            CREATE HEROGLYPH
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}

export function VisionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section id="vision" ref={containerRef} className="papyrus-bg py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <motion.h2
          className="text-4xl md:text-6xl font-black text-center mb-20"
          style={{ fontFamily: "'Cinzel', serif", color: 'hsl(36 58% 40%)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          THE VISION
        </motion.h2>

        <div className="relative">
          {/* Animated fill line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ backgroundColor: 'rgba(196,155,66,0.1)' }}>
            <motion.div
              className="w-full origin-top"
              style={{
                height: lineHeight,
                background: 'linear-gradient(to bottom, #A3782B, #C49B42)',
              }}
            />
          </div>

          {steps.map((step, i) => (
            <TimelineNode key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
