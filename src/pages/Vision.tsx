import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from 'framer-motion';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

const GOLD = '#C99A3F';
const SEG = 1 / 6;

const BLOCKS = [
  {
    tag: 'THE NATION',
    heading: '200 Million\nDog Lovers.\nOne Nation.',
    body: "DOGYPT is not a platform. It's an identity. One million is our first milestone — our destination is 200 million Dogyptians united by a single belief: dogs belong in the world.",
    bullets: [
      'One Heroglyph. One dog. One permanent place in the pack.',
      '1 million Dogyptians is where it begins.',
      'You are not a user. You are Dogyptian.',
    ],
    symbol: '𓂀',
    shortDesc: 'One identity. One movement.',
  },
  {
    tag: 'THE MISSION',
    heading: 'A Network\nBuilt to\nRescue.',
    body: "Every Dogyptian is trained, connected, and ready. First aid. Fundraising. Direct rescue. The Pack doesn't wait for institutions — it moves.",
    bullets: [
      'First aid knowledge embedded in every member portal.',
      'Transparent fundraising — every cent publicly tracked.',
      'Direct rescue coordination across borders.',
    ],
    symbol: '𓃭',
    shortDesc: 'Trained, connected, ready.',
  },
  {
    tag: 'THE WORLD',
    heading: 'Real Places.\nReal Dogs.\nReal Heroes.',
    body: 'DOGYPT funds real shelters, real gardens, real infrastructure. From rescue sanctuaries to iconic landmarks — physical proof that this movement exists.',
    bullets: [
      'DOGYPT-funded shelters, each with named dog heroes.',
      'Gardens, parks, lakes, and Dogyptian pyramids.',
      'Infrastructure built for dogs — and the people who love them.',
    ],
    symbol: '𓇳',
    shortDesc: 'Physical proof of the movement.',
  },
  {
    tag: 'THE RESEARCH',
    heading: "Dogs Live\nToo Short.\nWe're Changing That.",
    body: 'Part of every Heroglyph funds veterinary science — longevity research, disease prevention, and the work that lets our dogs live longer.',
    bullets: [
      'Direct funding of longevity and health research.',
      'Partnerships with leading veterinary institutions.',
      'Because every year with your dog matters.',
    ],
    symbol: '𓆑',
    shortDesc: 'Every year with your dog matters.',
  },
  {
    tag: 'THE TEMPLE',
    heading: 'A World That\nRuns on\nLoyalty.',
    body: 'The Dogyptian digital temple — an app, a portal, a social network, and an economy built entirely for the pack. Own rules. Own currency. Self-sustaining.',
    bullets: [
      'App, portal, and social network — one identity.',
      'A closed ecosystem with its own economy.',
      'The Dogyptian currency: backed by loyalty, not speculation.',
    ],
    symbol: '𓊽',
    shortDesc: 'App, portal, economy — one identity.',
  },
  {
    tag: 'THE WHY',
    heading: '700,000,000\nDogs. No Home.\nNo Human.',
    body: "That number is not a statistic. It's a mission. Every Heroglyph funds a dog in need. Every Dogyptian carries this truth: no dog should be alone.",
    bullets: [
      'Every Heroglyph funds a dog in need.',
      'Transparent impact — every cent tracked.',
      'No dog should be alone.',
    ],
    symbol: '𓀭',
    shortDesc: 'No dog should be alone.',
  },
];

function SymbolVisual({ symbol, activeIndex }: { symbol: string; activeIndex: number }) {
  return (
    <div
      className="relative aspect-square rounded-2xl flex items-center justify-center overflow-hidden"
      style={{
        width: 'min(100%, 52vw, 420px)',
        background: 'rgba(196,155,66,0.025)',
        border: '1px solid rgba(196,155,66,0.12)',
        boxShadow: '0 0 100px rgba(196,155,66,0.07), 0 0 300px rgba(196,155,66,0.03)',
      }}
    >
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: '72%', height: '72%', border: '1px solid rgba(196,155,66,0.2)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '50%',
          height: '50%',
          border: '1px dashed rgba(196,155,66,0.12)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,154,63,0.07) 0%, transparent 70%)',
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center"
          style={{ gap: 14 }}
        >
          <div
            style={{
              fontSize: 'clamp(72px, 11vw, 116px)',
              lineHeight: 1,
              filter: 'drop-shadow(0 0 28px rgba(201,154,63,0.55))',
              color: GOLD,
            }}
          >
            {symbol}
          </div>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              letterSpacing: '0.35em',
              color: 'rgba(201,154,63,0.4)',
            }}
          >
            0{activeIndex + 1} / 06
          </div>
        </motion.div>
      </AnimatePresence>

      {[
        ['top-4 left-4'],
        ['top-4 right-4 rotate-90'],
        ['bottom-4 left-4 -rotate-90'],
        ['bottom-4 right-4 rotate-180'],
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

export default function Vision() {
  const wrapperRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  const p0 = useTransform(scrollYProgress, [0 * SEG, 1 * SEG], [0, 1], { clamp: true });
  const p1 = useTransform(scrollYProgress, [1 * SEG, 2 * SEG], [0, 1], { clamp: true });
  const p2 = useTransform(scrollYProgress, [2 * SEG, 3 * SEG], [0, 1], { clamp: true });
  const p3 = useTransform(scrollYProgress, [3 * SEG, 4 * SEG], [0, 1], { clamp: true });
  const p4 = useTransform(scrollYProgress, [4 * SEG, 5 * SEG], [0, 1], { clamp: true });
  const p5 = useTransform(scrollYProgress, [5 * SEG, 1], [0, 1], { clamp: true });
  const progresses = [p0, p1, p2, p3, p4, p5];

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const idx = Math.min(Math.floor(p / SEG), 5);
    setActiveIndex((prev) => (prev !== idx ? idx : prev));
  });

  const handleTabClick = (i: number) => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: (i / 6) * totalScroll, behavior: 'smooth' });
  };

  const block = BLOCKS[activeIndex];

  return (
    <div style={{ background: '#000', color: '#F2EAD6' }}>
      {/* Fixed nav */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 28px',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(201,154,63,0.18)',
        }}
      >
        <Link to="/">
          <img
            src={dogyptLogo}
            alt="DOGYPT"
            style={{ height: 30, objectFit: 'contain' }}
          />
        </Link>
        <Link
          to="/heroglyph"
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.12em',
            padding: '9px 20px',
            background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
            color: '#000',
            border: '1px solid rgba(250,244,236,0.30)',
            borderRadius: 8,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          BECOME DOGYPTIAN
        </Link>
      </header>

      {/* Scroll-driven sticky section */}
      <section
        ref={wrapperRef}
        className="relative w-full"
        style={{ height: '700vh', backgroundColor: '#000' }}
      >
        <div
          className="sticky top-0 w-full flex flex-col"
          style={{ height: '100dvh', backgroundColor: '#080808' }}
        >
          {/* Main content */}
          <div
            className="flex-1 flex flex-col md:flex-row items-center gap-8 md:gap-14 px-6 md:px-0 md:w-[min(900px,82vw)] md:mx-auto min-h-0 overflow-hidden w-full"
            style={{ paddingTop: 'clamp(72px, 10vh, 96px)' }}
          >
            {/* Visual */}
            <div className="w-full md:w-[44%] flex items-center justify-center shrink-0">
              <SymbolVisual symbol={block.symbol} activeIndex={activeIndex} />
            </div>

            {/* Text */}
            <div className="w-full md:w-[56%] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.38, ease: 'easeOut' }}
                  className="flex flex-col"
                  style={{ gap: 18 }}
                >
                  <span
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: 10,
                      letterSpacing: '0.3em',
                      color: GOLD,
                    }}
                  >
                    DOGYPT — {block.tag}
                  </span>

                  <h2
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontWeight: 700,
                      fontSize: 'clamp(26px, 3.8vw, 46px)',
                      lineHeight: 1.1,
                      color: '#FAF4EC',
                      whiteSpace: 'pre-line',
                      margin: 0,
                    }}
                  >
                    {block.heading}
                  </h2>

                  <p
                    style={{
                      fontSize: 'clamp(13px, 1.4vw, 15px)',
                      lineHeight: 1.75,
                      color: 'rgba(250,244,236,0.52)',
                      maxWidth: 460,
                      margin: 0,
                    }}
                  >
                    {block.body}
                  </p>

                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    {block.bullets.map((b) => (
                      <li
                        key={b}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          fontSize: 'clamp(12px, 1.3vw, 14px)',
                          lineHeight: 1.6,
                          color: 'rgba(250,244,236,0.42)',
                        }}
                      >
                        <span
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            background: GOLD,
                            marginTop: 7,
                            flexShrink: 0,
                          }}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>

                  {activeIndex === 5 && (
                    <Link
                      to="/heroglyph"
                      style={{
                        display: 'inline-block',
                        fontFamily: "'Cinzel', serif",
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: '0.12em',
                        padding: '12px 28px',
                        background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
                        color: '#000',
                        border: '1px solid rgba(250,244,236,0.30)',
                        borderRadius: 8,
                        textDecoration: 'none',
                        alignSelf: 'flex-start',
                        marginTop: 4,
                      }}
                    >
                      BECOME DOGYPTIAN
                    </Link>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom nav tabs */}
          <div
            className="flex-none"
            style={{ borderTop: '1px solid rgba(250,244,236,0.05)' }}
          >
            <div className="grid grid-cols-6 md:w-[min(900px,82vw)] md:mx-auto">
              {BLOCKS.map((b, i) => (
                <button
                  key={b.tag}
                  onClick={() => handleTabClick(i)}
                  className="relative flex flex-col gap-2 px-3 md:px-6 py-4 md:py-5 text-left cursor-pointer bg-transparent border-0"
                  style={{
                    borderRight:
                      i < 5 ? '1px solid rgba(250,244,236,0.05)' : 'none',
                  }}
                >
                  <span
                    className="text-[9px] md:text-[11px] font-bold tracking-widest uppercase transition-colors duration-500"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      color:
                        i === activeIndex
                          ? '#FAF4EC'
                          : 'rgba(250,244,236,0.22)',
                    }}
                  >
                    <span className="hidden md:inline">{b.tag}</span>
                    <span className="inline md:hidden">
                      0{i + 1}
                    </span>
                  </span>

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
                    className="hidden md:block text-[10px] leading-relaxed"
                    style={{ color: 'rgba(250,244,236,0.28)', margin: 0 }}
                  >
                    {b.shortDesc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
