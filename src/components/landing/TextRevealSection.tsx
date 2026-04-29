import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

// Container = 75vw (100vw - 12.5vw padding × 2).
// Font sizes calculated so each line fills ~75vw:
//   Regular (400) char width ≈ 0.58 × fs, Bold (700) ≈ 0.62, Black (900) ≈ 0.66
//   Gap between words = 0.28em (flex gap)
//
// THERE ARE:    (5+3 chars + 1 gap) × 0.58 × fs = 75vw → fs ≈ 15vw
// ONE BILLION:  (3+7 chars + 1 gap) × 0.62 × fs = 75vw → fs ≈ 11.5vw
// DOGS:         (4 chars)           × 0.66 × fs = 75vw → fs ≈ 28.5vw
// IN THE WORLD: (2+3+5 chars + 2 gaps) × 0.58 × fs = 75vw → fs ≈ 11.8vw

const LINES_DATA = [
  {
    words: [{ word: 'THERE', idx: 0 }, { word: 'ARE', idx: 1 }],
    fontSize: '15vw',
    fontWeight: 400,
  },
  {
    words: [{ word: 'ONE', idx: 2 }, { word: 'BILLION', idx: 3 }],
    fontSize: '11.5vw',
    fontWeight: 700,
  },
  {
    words: [{ word: 'DOGS', idx: 4 }],
    fontSize: '28.5vw',
    fontWeight: 900,
  },
  {
    words: [{ word: 'IN', idx: 5 }, { word: 'THE', idx: 6 }, { word: 'WORLD', idx: 7 }],
    fontSize: '11.8vw',
    fontWeight: 400,
  },
];

const N = 8;

function WordReveal({
  word,
  idx,
  scrollYProgress,
}: {
  word: string;
  idx: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Reveal starts at 0.05 — word 0 brightens as section enters viewport from below.
  const start = 0.05 + (idx / N) * 0.60;
  const mid   = start + 0.08;
  const end   = start + 0.16;

  const color = useTransform(
    scrollYProgress,
    [start, mid, end],
    ['rgba(196,155,66,0.07)', 'rgba(250,244,236,1)', 'rgba(196,155,66,1)'],
  );

  return (
    <motion.span className="inline-block" style={{ color }}>
      {word}
    </motion.span>
  );
}

export function TextRevealSection() {
  const wrapperRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start end', 'end end'],
  });

  return (
    <section
      ref={wrapperRef}
      className="relative w-full"
      style={{ height: '250vh', backgroundColor: '#000' }}
    >
      <div
        className="sticky top-0 flex items-center justify-center"
        style={{ height: '100dvh' }}
      >
        <div
          className="w-full flex flex-col"
          style={{
            fontFamily: "'Cinzel', serif",
            lineHeight: 0.88,
            letterSpacing: '-0.02em',
            gap: '1vw',
            paddingLeft: '12.5vw',
            paddingRight: '12.5vw',
          }}
        >
          {LINES_DATA.map((line, li) => (
            <div
              key={li}
              className="flex gap-[0.28em]"
              style={{ fontSize: line.fontSize, fontWeight: line.fontWeight }}
            >
              {line.words.map(({ word, idx }) => (
                <WordReveal
                  key={idx}
                  word={word}
                  idx={idx}
                  scrollYProgress={scrollYProgress}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
