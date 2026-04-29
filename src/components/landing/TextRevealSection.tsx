import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

type Variant = 'white' | 'gold';

const LINES_DATA: {
  words: { word: string; idx: number }[];
  fontSize: string;
  fontWeight: number;
  spread: boolean;
  variant: Variant;
}[] = [
  { words: [{ word: 'THERE', idx: 0 }, { word: 'ARE', idx: 1 }],   fontSize: '8.5vw', fontWeight: 400, spread: true,  variant: 'white' },
  { words: [{ word: 'ONE', idx: 2 }, { word: 'BILLION', idx: 3 }], fontSize: '6.5vw', fontWeight: 700, spread: true,  variant: 'gold'  },
  { words: [{ word: 'D', idx: 4 }, { word: 'O', idx: 4 }, { word: 'G', idx: 4 }, { word: 'S', idx: 4 }], fontSize: '14vw', fontWeight: 900, spread: true, variant: 'gold' },
  { words: [{ word: 'IN', idx: 5 }, { word: 'THE', idx: 6 }, { word: 'WORLD', idx: 7 }], fontSize: '6.6vw', fontWeight: 400, spread: true, variant: 'white' },
];

const N = 8;

// papyrus = brand #FAF4EC (warm off-white, nie čisto biela)
const PAPYRUS = 'rgba(250,244,236,1)';
const GOLD    = 'rgba(196,155,66,1)';
const GOLD_FLASH = 'rgba(255,244,194,1)';

function WordRevealWhite({
  word,
  idx,
  scrollYProgress,
}: {
  word: string;
  idx: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = 0.05 + (idx / N) * 0.60;
  const mid   = start + 0.08;
  const end   = start + 0.16;

  const color = useTransform(
    scrollYProgress,
    [start, mid, end],
    ['rgba(196,155,66,0.07)', PAPYRUS, PAPYRUS],
  );

  return <motion.span style={{ color }}>{word}</motion.span>;
}

function WordRevealGold({
  word,
  idx,
  scrollYProgress,
}: {
  word: string;
  idx: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = 0.05 + (idx / N) * 0.60;
  const mid   = start + 0.08;
  const end   = start + 0.16;

  const color = useTransform(
    scrollYProgress,
    [start, mid, end],
    ['rgba(196,155,66,0.07)', GOLD_FLASH, GOLD],
  );

  // drop-shadow namiesto hero-shine (background-clip: text nie je spoľahlivý na motion.span)
  return (
    <motion.span style={{
      color,
      filter: 'drop-shadow(0 0 14px rgba(196,155,66,0.55)) drop-shadow(0 0 32px rgba(196,155,66,0.25))',
    }}>
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
      style={{ height: '160vh', backgroundColor: '#000' }}
    >
      <div
        className="sticky top-0 flex items-center justify-center"
        style={{ height: '100dvh' }}
      >
        <div
          style={{
            width: '48vw',
            fontFamily: "'Cinzel', serif",
            letterSpacing: '-0.01em',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4vw',
            marginTop: '12vh',
          }}
        >
          {LINES_DATA.map((line, li) => (
            <div
              key={li}
              style={{
                fontSize: line.fontSize,
                fontWeight: line.fontWeight,
                lineHeight: 0.88,
                display: 'flex',
                justifyContent: line.spread ? 'space-between' : 'flex-start',
                width: '100%',
              }}
            >
              {line.words.map(({ word, idx }, wi) =>
                line.variant === 'gold' ? (
                  <WordRevealGold
                    key={`${idx}-${wi}`}
                    word={word}
                    idx={idx}
                    scrollYProgress={scrollYProgress}
                  />
                ) : (
                  <WordRevealWhite
                    key={`${idx}-${wi}`}
                    word={word}
                    idx={idx}
                    scrollYProgress={scrollYProgress}
                  />
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
