import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';

const steps = [
  {
    title: 'The system is broken.',
    detail: 'Over 500 million dogs live without homes. Shelters are overwhelmed. The current model of rescue and adoption is fragmented, underfunded, and invisible to most of the world. We need a new paradigm.',
  },
  {
    title: 'Saving one is not enough.',
    detail: 'Individual rescues are heroic, but they don\'t scale. We need infrastructure, identity, and community to create lasting change for every dog — not just the lucky few.',
  },
  {
    title: 'If the state fails, we unite.',
    detail: 'When institutions fall short, communities rise. DOGYPT is building a decentralized movement of dog lovers who take responsibility — not because they\'re asked, but because they care.',
  },
  {
    title: 'From charity to infrastructure.',
    detail: 'We\'re moving beyond donations and towards building permanent systems: digital identity for every dog, transparent funding, and a global network that makes no dog invisible.',
  },
  {
    title: 'Everything starts with your HEROGLYPH.',
    detail: 'Your dog\'s HEROGLYPH is the first step in a revolution. It\'s a statement, a badge of honor, and a contribution to a global movement that will change the lives of millions of dogs.',
    isCTA: true,
  },
];

function VisionStep({ step, index }: { step: typeof steps[0]; index: number }) {
  return (
    <div className="h-screen w-full snap-center flex items-center justify-center px-6 md:px-8">
      <motion.div
        className="max-w-2xl w-full flex flex-col items-center text-center gap-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7 }}
      >
        {/* Paw icon */}
        <motion.div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #A3782B, #C49B42)',
            boxShadow: '0 0 24px rgba(196,155,66,0.4)',
          }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <PawPrint className="w-6 h-6 text-black" />
        </motion.div>

        {/* Step number */}
        <span
          className="text-xs tracking-[0.3em] uppercase"
          style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}
        >
          Step {index + 1} of {steps.length}
        </span>

        <h3
          className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight"
          style={{ fontFamily: "'Cinzel', serif", color: '#1a1a1a' }}
        >
          {step.title}
        </h3>

        <p className="text-lg md:text-xl leading-relaxed max-w-lg" style={{ color: 'rgba(0,0,0,0.6)' }}>
          {step.detail}
        </p>

        {step.isCTA && (
          <motion.a
            href="/name"
            className="mt-4 inline-block px-10 py-4 rounded-full text-lg md:text-xl font-bold tracking-wider border-2 transition-transform hover:scale-105"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
              color: '#000',
              borderColor: 'rgba(163,120,43,0.3)',
              boxShadow: '0 0 40px hsl(39 80% 50% / 0.4)',
            }}
            whileHover={{ scale: 1.05 }}
          >
            CREATE HEROGLYPH
          </motion.a>
        )}
      </motion.div>
    </div>
  );
}

export function VisionSection() {
  return (
    <section
      id="vision"
      className="snap-y snap-mandatory overflow-y-auto"
      style={{ backgroundColor: '#F3EBDD', height: `${steps.length * 100}vh` }}
    >
      {steps.map((step, i) => (
        <VisionStep key={i} step={step} index={i} />
      ))}
    </section>
  );
}
