import { useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from 'framer-motion';

const SEG = 1 / 3;

const FEATURES = [
  {
    label: 'Identity',
    heading: "Your dog's\nunique symbol",
    body: "Like a fingerprint — no two glyphs are the same. Breed, bloodline, and personality encoded into one sacred mark. 380+ breeds, thousands of combinations.",
    shortDesc: 'Breed, bloodline & personality encoded.',
    cards: [
      { title: 'Breed & bloodline', desc: 'Visual language rooted in your dog\'s origins and lineage.' },
      { title: 'Personality traits', desc: 'Two character symbols. One truth about who they are.' },
    ],
  },
  {
    label: 'Your Bond',
    heading: "You live\ninside their story",
    body: "Your symbol lives within your dog's frame. In this world, the dog is the hero — and you're woven into them. Not next to them. Inside.",
    shortDesc: 'Your identity inside your dog\'s glyph.',
    cards: [
      { title: 'Zodiac & horoscope', desc: 'Your cosmic identity encoded alongside theirs.' },
      { title: 'Dog number & initial', desc: 'The order of love — how many dogs shaped your life.' },
    ],
  },
  {
    label: 'Mission',
    heading: "Every glyph\nhelps a real dog",
    body: "Part of every purchase goes to a shelter you choose. Tracked publicly. No fine print, no overhead games. Your dog's symbol funds a dog in need.",
    shortDesc: 'Part of every purchase helps a shelter.',
    cards: [
      { title: 'Transparent donations', desc: 'Live counter. You see exactly where it goes.' },
      { title: 'You choose the shelter', desc: 'Direct impact, zero middlemen.' },
    ],
  },
];

export function ScrollFeatureSection() {
  const wrapperRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  // Progress bars driven by motion values — no re-renders
  const progress0 = useTransform(scrollYProgress, [0, SEG], [0, 1], { clamp: true });
  const progress1 = useTransform(scrollYProgress, [SEG, 2 * SEG], [0, 1], { clamp: true });
  const progress2 = useTransform(scrollYProgress, [2 * SEG, 1], [0, 1], { clamp: true });
  const progresses = [progress0, progress1, progress2];

  // Active index: state update only on segment boundary (≤3 updates total)
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const idx = Math.min(Math.floor(p / SEG), 2);
    setActiveIndex((prev) => (prev !== idx ? idx : prev));
  });

  const feature = FEATURES[activeIndex];

  return (
    <section
      ref={wrapperRef}
      className="relative w-full"
      style={{ height: '320vh', backgroundColor: '#000' }}
    >
      <div
        className="sticky top-0 w-full flex flex-col"
        style={{ height: '100dvh', backgroundColor: '#080808' }}
      >
        {/* ── TOP: media + feature content ── */}
        <div className="flex-1 flex flex-col md:flex-row items-center gap-8 md:gap-16 px-8 md:px-0 md:w-[min(900px,80vw)] md:mx-auto pt-14 md:pt-20 min-h-0 overflow-hidden w-full">

          {/* LEFT: HEROGLYF visual */}
          <div className="w-full md:w-[52%] flex items-center justify-center shrink-0">
            <GlyphVisual activeIndex={activeIndex} />
          </div>

          {/* RIGHT: changing feature content */}
          <div className="w-full md:w-[48%] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.38, ease: 'easeOut' }}
                className="flex flex-col gap-5"
              >
                <span
                  className="text-[10px] tracking-[0.3em] uppercase"
                  style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}
                >
                  HEROGLYF — {feature.label}
                </span>

                <h2
                  className="text-3xl md:text-4xl lg:text-[2.75rem] font-black leading-tight whitespace-pre-line"
                  style={{ fontFamily: "'Cinzel', serif", color: '#FAF4EC' }}
                >
                  {feature.heading}
                </h2>

                <p
                  className="text-sm md:text-[15px] leading-relaxed max-w-sm"
                  style={{ color: 'rgba(250,244,236,0.52)' }}
                >
                  {feature.body}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-1">
                  {feature.cards.map((card) => (
                    <div
                      key={card.title}
                      className="rounded-xl p-4 flex flex-col gap-2"
                      style={{
                        background: 'rgba(250,244,236,0.03)',
                        border: '1px solid rgba(196,155,66,0.13)',
                      }}
                    >
                      <span
                        className="text-[11px] font-semibold tracking-widest uppercase"
                        style={{ color: '#C49B42' }}
                      >
                        {card.title}
                      </span>
                      <span
                        className="text-xs leading-relaxed"
                        style={{ color: 'rgba(250,244,236,0.42)' }}
                      >
                        {card.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── BOTTOM: 3 progress blocks ── */}
        <div
          className="flex-none"
          style={{ borderTop: '1px solid rgba(250,244,236,0.05)' }}
        >
          <div className="grid grid-cols-3 md:w-[min(900px,80vw)] md:mx-auto">
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              className="relative flex flex-col gap-2 px-5 md:px-8 py-4 md:py-6"
              style={{
                borderRight: i < 2 ? '1px solid rgba(250,244,236,0.05)' : 'none',
              }}
            >
              <span
                className="text-[11px] md:text-sm font-bold tracking-widest uppercase transition-colors duration-500"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: i === activeIndex ? '#FAF4EC' : 'rgba(250,244,236,0.22)',
                }}
              >
                {f.label}
              </span>

              {/* Progress line */}
              <div
                className="relative h-[2px] w-full rounded-full overflow-hidden"
                style={{ background: 'rgba(250,244,236,0.07)' }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full origin-left"
                  style={{
                    scaleX: progresses[i],
                    background: 'linear-gradient(90deg, #C49B42, #F0D88A)',
                  }}
                />
              </div>

              <p
                className="hidden md:block text-[11px] leading-relaxed"
                style={{ color: 'rgba(250,244,236,0.28)' }}
              >
                {f.shortDesc}
              </p>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Animated HEROGLYF visual ─────────────────────────────────────────────────

function GlyphVisual({ activeIndex }: { activeIndex: number }) {
  return (
    <div
      className="relative w-full max-w-[460px] aspect-square rounded-2xl flex items-center justify-center overflow-hidden"
      style={{
        background: 'rgba(196,155,66,0.025)',
        border: '1px solid rgba(196,155,66,0.12)',
        boxShadow: '0 0 100px rgba(196,155,66,0.07), 0 0 300px rgba(196,155,66,0.03)',
      }}
    >
      {/* Slow rotating outer ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '74%',
          height: '74%',
          border: '1px solid rgba(196,155,66,0.2)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner ring counter-rotating */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '50%',
          height: '50%',
          border: '1px solid rgba(196,155,66,0.12)',
          borderStyle: 'dashed',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />

      {/* Animated glyph SVG — swaps per feature */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative z-10"
        >
          <GlyphSVG index={activeIndex} />
        </motion.div>
      </AnimatePresence>

      {/* Corner marks */}
      {[
        ['top-5 left-5'],
        ['top-5 right-5 rotate-90'],
        ['bottom-5 left-5 -rotate-90'],
        ['bottom-5 right-5 rotate-180'],
      ].map((cls, i) => (
        <svg
          key={i}
          className={`absolute ${cls[0]} opacity-30`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M0 16 L0 0 L16 0" stroke="#C49B42" strokeWidth="1.5" />
        </svg>
      ))}
    </div>
  );
}

function GlyphSVG({ index }: { index: number }) {
  const gold = '#C49B42';
  const goldFaint = 'rgba(196,155,66,0.35)';

  if (index === 0) {
    // Identity: outer square frame + inner cross grid
    return (
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
        <rect x="20" y="20" width="120" height="120" rx="3" stroke={gold} strokeWidth="1.5" strokeOpacity="0.65" />
        <rect x="36" y="36" width="88" height="88" rx="2" stroke={goldFaint} strokeWidth="1" />
        <line x1="80" y1="28" x2="80" y2="132" stroke={goldFaint} strokeWidth="1" />
        <line x1="28" y1="80" x2="132" y2="80" stroke={goldFaint} strokeWidth="1" />
        <circle cx="80" cy="80" r="10" stroke={gold} strokeWidth="1.5" strokeOpacity="0.7" />
        <circle cx="80" cy="80" r="3.5" fill={gold} fillOpacity="0.9" />
        <rect x="27" y="27" width="8" height="8" rx="1" fill={gold} fillOpacity="0.4" />
        <rect x="125" y="27" width="8" height="8" rx="1" fill={gold} fillOpacity="0.4" />
        <rect x="27" y="125" width="8" height="8" rx="1" fill={gold} fillOpacity="0.4" />
        <rect x="125" y="125" width="8" height="8" rx="1" fill={gold} fillOpacity="0.4" />
      </svg>
    );
  }

  if (index === 1) {
    // Bond: outer square + inner circle with small circle above center
    return (
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
        <rect x="20" y="20" width="120" height="120" rx="3" stroke={gold} strokeWidth="1.5" strokeOpacity="0.65" />
        <circle cx="80" cy="86" r="30" stroke={gold} strokeWidth="1.5" strokeOpacity="0.6" />
        <circle cx="80" cy="86" r="20" stroke={goldFaint} strokeWidth="1" strokeDasharray="3 3" />
        {/* Owner circle above center */}
        <circle cx="80" cy="54" r="10" stroke={gold} strokeWidth="1.5" strokeOpacity="0.8" />
        <circle cx="80" cy="54" r="3.5" fill={gold} fillOpacity="0.9" />
        <circle cx="80" cy="86" r="4" fill={gold} fillOpacity="0.5" />
        <rect x="27" y="27" width="8" height="8" rx="1" fill={gold} fillOpacity="0.4" />
        <rect x="125" y="27" width="8" height="8" rx="1" fill={gold} fillOpacity="0.4" />
        <rect x="27" y="125" width="8" height="8" rx="1" fill={gold} fillOpacity="0.4" />
        <rect x="125" y="125" width="8" height="8" rx="1" fill={gold} fillOpacity="0.4" />
      </svg>
    );
  }

  // Mission: outer square + diamond/star shape
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      <rect x="20" y="20" width="120" height="120" rx="3" stroke={gold} strokeWidth="1.5" strokeOpacity="0.65" />
      <path d="M80 42 L118 80 L80 118 L42 80 Z" stroke={gold} strokeWidth="1.5" strokeOpacity="0.65" />
      <path d="M80 56 L104 80 L80 104 L56 80 Z" stroke={goldFaint} strokeWidth="1" />
      <circle cx="80" cy="80" r="6" fill={gold} fillOpacity="0.85" />
      <circle cx="80" cy="42" r="3" fill={gold} fillOpacity="0.5" />
      <circle cx="118" cy="80" r="3" fill={gold} fillOpacity="0.5" />
      <circle cx="80" cy="118" r="3" fill={gold} fillOpacity="0.5" />
      <circle cx="42" cy="80" r="3" fill={gold} fillOpacity="0.5" />
      <rect x="27" y="27" width="8" height="8" rx="1" fill={gold} fillOpacity="0.4" />
      <rect x="125" y="27" width="8" height="8" rx="1" fill={gold} fillOpacity="0.4" />
      <rect x="27" y="125" width="8" height="8" rx="1" fill={gold} fillOpacity="0.4" />
      <rect x="125" y="125" width="8" height="8" rx="1" fill={gold} fillOpacity="0.4" />
    </svg>
  );
}
