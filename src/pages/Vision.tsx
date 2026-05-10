import { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
  type MotionValue,
} from 'framer-motion';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

const GOLD = '#C99A3F';
const SEG = 1 / 6;

const BLOCKS = [
  {
    tag: 'THE NATION',
    heading: 'Doglovers,\nAssemble!',
    body: "470 million dogs have a family. Think we can find 0.213% of their owners who know Dog is God? That's 1 million. That's Year One. The future's largest dog community starts here.",
    cards: [
      { title: 'In Dog We Trust', desc: 'Not a slogan.\nA new religion — Dog is God.' },
      { title: 'New Era', desc: 'Dogs gave us everything.\nTime to give back.' },
      { title: 'One Symbol', desc: 'It starts with a Heroglyph.\nYour dog\'s permanent mark.' },
      { title: 'The Pack', desc: '0.213% of all dog owners.\n1M Dogyptians. One nation.' },
    ],
    symbol: '𓂀',
    shortDesc: 'One identity. One movement.',
  },
  {
    tag: 'THE TEMPLE',
    heading: 'A World That\nRuns on\nLoyalty.',
    body: 'The Dogyptian digital temple — an app, a portal, a social network, and an economy built entirely for the pack. Own rules. Own currency. Self-sustaining.',
    cards: [
      { title: 'The App', desc: 'Portal, social network.\nOne identity.' },
      { title: 'The Economy', desc: 'A closed ecosystem.\nOwn rules, own currency.' },
      { title: 'The Currency', desc: 'Backed by loyalty.\nNot speculation.' },
      { title: 'Self-Sustaining', desc: 'The Pack funds itself.\nForever.' },
    ],
    symbol: '𓊽',
    shortDesc: 'App, portal, economy — one identity.',
  },
  {
    tag: 'THE MISSION',
    heading: 'A Network\nBuilt to\nRescue.',
    body: "Every Dogyptian is trained, connected, and ready. First aid. Fundraising. Direct rescue. The Pack doesn't wait for institutions — it moves.",
    cards: [
      { title: 'First Aid', desc: 'Emergency knowledge.\nIn every member portal.' },
      { title: 'Fundraising', desc: 'Every cent tracked.\nZero overhead.' },
      { title: 'Rescue Network', desc: 'Cross-border coordination.\nNo middlemen.' },
      { title: 'Always Ready', desc: "The Pack moves.\nIt doesn't wait." },
    ],
    symbol: '𓃭',
    shortDesc: 'Trained, connected, ready.',
  },
  {
    tag: 'THE WORLD',
    heading: 'Real Places.\nReal Dogs.\nReal Heroes.',
    body: 'DOGYPT funds real shelters, real gardens, real infrastructure. From rescue sanctuaries to iconic landmarks — physical proof that this movement exists.',
    cards: [
      { title: 'Shelters', desc: 'Funded by the Pack.\nNamed after real dog heroes.' },
      { title: 'Sacred Lands', desc: 'Gardens, parks.\nDogyptian pyramids.' },
      { title: 'Infrastructure', desc: 'Built for dogs.\nAnd the people who love them.' },
      { title: 'Physical Proof', desc: 'This movement exists.\nYou can visit it.' },
    ],
    symbol: '𓇳',
    shortDesc: 'Physical proof of the movement.',
  },
  {
    tag: 'THE RESEARCH',
    heading: "Dogs Live\nToo Short.\nWe're Changing That.",
    body: 'Part of every Heroglyph funds veterinary science — longevity research, disease prevention, and the work that lets our dogs live longer.',
    cards: [
      { title: 'Longevity', desc: 'Direct funding.\nDog lifespan research.' },
      { title: 'Prevention', desc: 'Disease research.\nNot just treatment.' },
      { title: 'Institutions', desc: 'Partnerships with vet labs.\nReal funding, real science.' },
      { title: 'Every Year', desc: 'One more year with your dog.\nIt matters.' },
    ],
    symbol: '𓆑',
    shortDesc: 'Every year with your dog matters.',
  },
  {
    tag: 'THE LEGACY',
    heading: '700,000,000\nDogs. No Home.\nNo Human.',
    body: "That number is not a statistic. It's a mission. Every Heroglyph funds a dog in need. Every Dogyptian carries this truth: no dog should be alone.",
    cards: [
      { title: '700M Dogs', desc: 'Homeless globally.\nRight now.' },
      { title: 'Your Heroglyph', desc: 'Funds a dog in need.\nEvery purchase.' },
      { title: 'Transparent', desc: 'Every cent tracked.\nPublic ledger.' },
      { title: 'No Dog Alone', desc: 'This is the mission.\nThis is the why.' },
    ],
    symbol: '𓀭',
    shortDesc: 'No dog should be alone.',
  },
];

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--y', `${e.clientY - rect.top}px`);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (borderRef.current) borderRef.current.style.opacity = '1';
    if (innerRef.current) innerRef.current.style.opacity = '1';
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (borderRef.current) borderRef.current.style.opacity = '0';
    if (innerRef.current) innerRef.current.style.opacity = '0';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        background: 'rgba(250,244,236,0.04)',
        border: '1px solid rgba(196,155,66,0.32)',
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        overflow: 'hidden',
        boxShadow: '0 0 0 0px rgba(196,155,66,0), inset 0 0 24px rgba(196,155,66,0.03)',
        '--x': '50%',
        '--y': '50%',
      } as React.CSSProperties}
    >
      {/* Border glow — lights up the border edge at cursor position */}
      <div
        ref={borderRef}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: 'radial-gradient(18rem circle at var(--x) var(--y), rgba(201,154,63,0.5), transparent 40%)',
          opacity: 0,
          transition: 'opacity 0.4s',
          pointerEvents: 'none',
        }}
      />
      {/* Inner spotlight — subtle gold tint on content */}
      <div
        ref={innerRef}
        style={{
          position: 'absolute',
          inset: 1,
          borderRadius: 'inherit',
          background: 'radial-gradient(18rem circle at var(--x) var(--y), rgba(201,154,63,0.07), transparent)',
          opacity: 0,
          transition: 'opacity 0.4s',
          pointerEvents: 'none',
        }}
      />
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontFamily: "'Cinzel', serif",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: GOLD,
        }}
      >
        {title}
      </span>
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 11,
          lineHeight: 1.55,
          color: 'rgba(250,244,236,0.40)',
          whiteSpace: 'pre-line',
        }}
      >
        {desc}
      </span>
    </div>
  );
}

function SymbolVisual({ symbol, activeIndex }: { symbol: string; activeIndex: number }) {
  return (
    <div
      className="relative aspect-square rounded-2xl flex items-center justify-center overflow-hidden"
      style={{
        width: 'min(100%, 52vw, 420px)',
        background: 'rgba(196,155,66,0.03)',
        border: '1px solid rgba(196,155,66,0.38)',
        boxShadow: '0 0 60px rgba(196,155,66,0.14), 0 0 180px rgba(196,155,66,0.06), inset 0 0 40px rgba(196,155,66,0.04)',
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

function ProgressBar({ progress, isActive }: { progress: MotionValue<number>; isActive: boolean }) {
  const tipLeft = useTransform(progress, [0, 1], ['0%', '100%']);
  return (
    <div
      style={{
        position: 'relative',
        height: 2,
        width: '100%',
        borderRadius: 999,
        background: 'rgba(250,244,236,0.07)',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 999,
          transformOrigin: 'left',
          scaleX: progress,
          background: 'linear-gradient(90deg, rgba(196,155,66,0.25), #C49B42)',
        }}
      />
      {isActive && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            marginTop: -4,
            marginLeft: -4,
            left: tipLeft,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#FFF8E0',
            boxShadow: '0 0 6px 3px rgba(255,240,180,0.95), 0 0 18px 8px rgba(245,199,61,0.7)',
            pointerEvents: 'none',
          }}
        />
      )}
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
          style={{ height: '100dvh', backgroundColor: '#080808', paddingBottom: 'clamp(100px, 11vh, 130px)' }}
        >
          {/* Main content */}
          <div
            className="flex-1 flex items-center justify-center min-h-0 w-full px-4 md:px-6"
            style={{
              paddingTop: 'clamp(72px, 9vh, 88px)',
              paddingBottom: 'clamp(28px, 5vh, 56px)',
            }}
          >
            {/* Bordered card */}
            <div
              className="flex flex-col md:flex-row items-center gap-8 md:gap-14 w-full md:w-[min(1100px,94vw)]"
              style={{
                border: '1px solid rgba(196,155,66,0.22)',
                borderRadius: 16,
                padding: 'clamp(24px, 3.5vw, 48px)',
                background: 'rgba(250,244,236,0.018)',
              }}
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
                    {block.tag}
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

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 8,
                    }}
                  >
                    {block.cards.map((card) => (
                      <FeatureCard key={card.title} title={card.title} desc={card.desc} />
                    ))}
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>
            </div>{/* end bordered card */}
          </div>

          {/* Bottom nav tabs */}
          <div
            className="flex-none"
            style={{}}
          >
            <div className="grid grid-cols-6 md:w-[min(1100px,94vw)] md:mx-auto">
              {BLOCKS.map((b, i) => (
                <button
                  key={b.tag}
                  onClick={() => handleTabClick(i)}
                  className="relative flex flex-col gap-2 px-3 md:px-4 py-4 md:py-5 text-left cursor-pointer bg-transparent border-0"
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

                  <ProgressBar progress={progresses[i]} isActive={i === activeIndex} />

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
