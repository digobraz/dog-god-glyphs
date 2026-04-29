import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

// DOGS (17.2vw / 900) defines the container width → ~48vw natural fill.
// Lines 1, 2, 4 use text-align: justify to stretch to that same 48vw.
// Font sizes chosen so natural text width < 48vw (gives room for justify to expand).
//
// THERE ARE    8.5vw / 400 — natural ~44.7vw, justify adds ~3.3vw between words
// ONE BILLION  6.5vw / 700 — natural ~44.9vw, justify adds ~3.1vw between words
// DOGS        17.2vw / 900 — natural ~48vw, no justify needed
// IN THE WORLD 6.6vw / 400 — natural ~44.9vw, justify adds ~1.6vw per gap

const LINES_DATA = [
  { words: [{ word: 'THERE', idx: 0 }, { word: 'ARE', idx: 1 }], fontSize: '8.5vw', fontWeight: 400, justify: true },
  { words: [{ word: 'ONE', idx: 2 }, { word: 'BILLION', idx: 3 }], fontSize: '6.5vw', fontWeight: 700, justify: true },
  { words: [{ word: 'DOGS', idx: 4 }], fontSize: '17.2vw', fontWeight: 900, justify: false },
  { words: [{ word: 'IN', idx: 5 }, { word: 'THE', idx: 6 }, { word: 'WORLD', idx: 7 }], fontSize: '6.6vw', fontWeight: 400, justify: true },
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
  const start = 0.05 + (idx / N) * 0.60;
  const mid   = start + 0.08;
  const end   = start + 0.16;

  const color = useTransform(
    scrollYProgress,
    [start, mid, end],
    ['rgba(196,155,66,0.07)', 'rgba(250,244,236,1)', 'rgba(196,155,66,1)'],
  );

  // display:inline (not inline-block) so CSS text-align:justify can work
  return (
    <motion.span style={{ color, display: 'inline' }}>
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
        {/* Container width = DOGS natural width (~48vw) */}
        <div
          style={{
            width: '48vw',
            fontFamily: "'Cinzel', serif",
            letterSpacing: '-0.01em',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4vw',
          }}
        >
          {LINES_DATA.map((line, li) => (
            <div
              key={li}
              style={{
                fontSize: line.fontSize,
                fontWeight: line.fontWeight,
                lineHeight: 0.88,
                // justify stretches words to fill container width
                textAlign: line.justify ? 'justify' : 'left',
                textAlignLast: line.justify ? 'justify' : 'left',
                display: 'block',
                width: '100%',
              }}
            >
              {line.words.map(({ word, idx }, wi) => (
                <span key={idx}>
                  <WordReveal
                    word={word}
                    idx={idx}
                    scrollYProgress={scrollYProgress}
                  />
                  {/* space between words for justify to distribute */}
                  {wi < line.words.length - 1 ? ' ' : ''}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
