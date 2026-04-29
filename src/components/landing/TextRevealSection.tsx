import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

// Lines pre-computed with global word index
const LINES_DATA = [
  [{ word: 'THERE', idx: 0 }, { word: 'ARE', idx: 1 }],
  [{ word: 'ONE', idx: 2 }, { word: 'BILLION', idx: 3 }],
  [{ word: 'DOGS', idx: 4 }],
  [{ word: 'IN', idx: 5 }, { word: 'THE', idx: 6 }, { word: 'WORLD', idx: 7 }],
];

const N = 8;

// Each word reveals in a staggered window across scrollYProgress 0 → 0.9
function WordReveal({
  word,
  idx,
  scrollYProgress,
}: {
  word: string;
  idx: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = (idx / N) * 0.72;
  const mid   = start + 0.10;
  const end   = start + 0.20;

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
    offset: ['start start', 'end end'],
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
          className="w-[min(880px,82vw)] mx-auto flex flex-col gap-1 md:gap-2"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          {LINES_DATA.map((line, li) => (
            <div key={li} className="flex gap-[0.28em]">
              {line.map(({ word, idx }) => (
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
