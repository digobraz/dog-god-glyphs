import { useRef, useState, useCallback, useEffect } from 'react';
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
    heading: 'One Dogfriendly\nAll-In Ecosystem.',
    body: 'A global database of dogs, owners, and their stories. A Pet Pass that travels with your dog through whole life. A social network, fundraising, first aid, shelter maps — all in one portal.',
    cards: [
      { title: 'The Dog Database', desc: 'Every dog, one profile.\nGlobal. Permanent. Unique.' },
      { title: 'Pet Pass', desc: 'Health records, social ID.\nOne pass follows your dog everywhere.' },
      { title: 'Social Network', desc: 'Own rules. Own culture.\nNo algorithm without a leash.' },
      { title: 'Full Ecosystem', desc: 'Portal, fundraising, shelter maps.\nOne purpose — the dog.' },
    ],
    symbol: '𓊽',
    shortDesc: 'The only home built for Dogyptians.',
  },
  {
    tag: 'THE MISSION',
    heading: 'Governments Fail.\nThe Pack Steps In.',
    body: "430 million stray dogs. The shelter system handles a fraction — and barely. DOGYPT isn't another rescue campaign — it's a new model built to replace what doesn't work.",
    cards: [
      { title: 'Education', desc: 'Responsible ownership.\nFewer strays start here.' },
      { title: 'Own Nation', desc: 'Where governments stop.\nThe Pack steps in.' },
      { title: 'Accountability', desc: 'Standards, tracking, transparency.\nNot charity. A system.' },
      { title: 'Dog Purpose', desc: 'Not scared faces.\nEvery dog has a mission.' },
    ],
    symbol: '𓃭',
    shortDesc: 'A new model. Not another campaign.',
  },
  {
    tag: 'THE WORLD',
    heading: 'OFFLINE\nINFRASTRUCTURE.',
    body: "Imagine a shelter without the sad faces. That's what happens when the work is paid and the infrastructure is real. The Pack funds it directly — to dogs and the people beside them.",
    cards: [
      { title: 'Dogypt Center', desc: 'Not a charity facility.\nShelter 2.0. A new model.' },
      { title: 'Dogyptland', desc: 'Dog-first territories.\nParks, lands, sacred grounds.' },
      { title: 'Pack Direct', desc: 'From Dogyptians, straight to dogs.\nAnd the people beside them.' },
      { title: 'Dogypt Map', desc: 'Dog-friendly spots, worldwide.\nMarked. Always growing.' },
    ],
    symbol: '𓇳',
    shortDesc: 'Infrastructure. Not charity.',
  },
  {
    tag: 'THE RESEARCH',
    heading: 'Real Data.\nDog-First.',
    body: 'Most dog research is funded by the brands selling dog food. DOGYPT backs the full spectrum — from longevity science to holistic and traditional approaches. For dogs. Not brands.',
    cards: [
      { title: 'Longevity', desc: 'More years with your dog.\nFunded research, real results.' },
      { title: 'Holistic Medicine', desc: 'From TCM to acupuncture.\nEvery approach that helps dogs.' },
      { title: 'Dog Tech', desc: 'Smart gadgets, wearables,\nhealth monitors for dogs.' },
      { title: 'Open Data', desc: 'No brand owns these results.\nPublic. Transparent. Always.' },
    ],
    symbol: '𓆑',
    shortDesc: 'Real science. No brand agenda.',
  },
  {
    tag: 'THE LEGACY',
    heading: 'Their Only\nHope Is Us.',
    body: "The world is splitting — virtual, orbital, and natural. Dog people are the natural side. We're building this for them — and for every generation that follows.",
    cards: [
      { title: 'The Split', desc: 'Virtual, orbital, or natural.\nDog people know which side.' },
      { title: '430 Million', desc: '470 million dogs. One Heroglyph.\nThe math works if we do.' },
      { title: 'The Oath', desc: 'Every Dogyptian carries it.\nNo dog alone. Forever.' },
      { title: 'New World', desc: 'Dog people. Natural side.\nThe era begins now.' },
    ],
    symbol: '𓀭',
    shortDesc: 'Their only hope is us.',
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

function GateRevealSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Tracking starts when section fills viewport — logo fully visible before gate moves
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // RAF loop — reads scroll.get() once per frame, avoids seeking queue
  useEffect(() => {
    let rafId: number;
    const loop = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.duration) {
        const p = scrollYProgress.get();
        const vp = Math.max(0, Math.min(1, (p - 0.15) / 0.7));
        const target = vp * video.duration;
        if (Math.abs(video.currentTime - target) > 0.025) {
          video.currentTime = target;
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [scrollYProgress]);

  // Gate opens from first scroll tick (section enters viewport)
  const gateLeft  = useTransform(scrollYProgress, [0, 0.4], ['0%', '-100%'], { clamp: true });
  const gateRight = useTransform(scrollYProgress, [0, 0.4], ['0%',  '100%'], { clamp: true });
  // Video fades in as gate opens
  const videoOpacity = useTransform(scrollYProgress, [0.05, 0.25], [0, 1], { clamp: true });
  // CTA appears only when hand+paw touch = video end = scroll ≈ 0.85
  const ctaOpacity = useTransform(scrollYProgress, [0.85, 0.93], [0, 1], { clamp: true });
  const ctaY       = useTransform(scrollYProgress, [0.85, 0.93], [36, 0], { clamp: true });

  return (
    <section
      ref={sectionRef}
      style={{ height: '500vh', position: 'relative', backgroundColor: '#000' }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100dvh',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      >
        {/* Video layer — behind gate */}
        <motion.video
          ref={videoRef}
          src="/videos/touch_opening.mp4"
          muted
          playsInline
          preload="auto"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: videoOpacity,
          }}
        />

        {/* Edge vignette — only outermost edges, keeps center bright */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
          background: 'radial-gradient(ellipse 90% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.35) 100%)',
        }}/>

        {/* ═══ GATE PANELS — actual gate photo, split at seam ═══ */}
        {(['left', 'right'] as const).map((side) => {
          const isLeft = side === 'left';
          return (
            <motion.div
              key={side}
              style={{
                position: 'absolute',
                top: 0,
                [isLeft ? 'left' : 'right']: 0,
                width: '50%',
                height: '100%',
                overflow: 'hidden',
                zIndex: 10,
                x: isLeft ? gateLeft : gateRight,
              }}
            >
              {/* Gate photo — 100vw inner div ensures full coverage on any aspect ratio */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  [isLeft ? 'right' : 'left']: 0,
                  width: '100vw',
                  height: '100dvh',
                  backgroundImage: 'url(/images/brana-final.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                  pointerEvents: 'none',
                }}
              />
            </motion.div>
          );
        })}

        {/* CTA — text fades in, button always solid */}
        <motion.div
          style={{
            position: 'absolute', inset: 0, zIndex: 20,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 24, pointerEvents: 'none',
            y: ctaY,
          }}
        >
          {/* Legibility backdrop — fades with text */}
          <motion.div style={{
            position: 'absolute', inset: 0, opacity: ctaOpacity,
            background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(0,0,0,0.7) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}/>

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <motion.div style={{ opacity: ctaOpacity }}>
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(10px, 1.2vw, 13px)',
                letterSpacing: '0.4em',
                color: 'rgba(201,154,63,0.8)',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}>
                The Pack awaits
              </div>
              <h2 style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: 'clamp(28px, 5vw, 64px)',
                color: '#FAF4EC',
                letterSpacing: '0.05em',
                margin: 0,
                textShadow: '0 2px 24px rgba(0,0,0,0.9)',
              }}>
                BECOME DOGYPTIAN
              </h2>
            </motion.div>

            {/* Button: fades in with CTA text after gate opens */}
            <motion.div style={{ opacity: ctaOpacity, pointerEvents: 'auto' }}>
              <Link
                to="/heroglyph"
                style={{
                  display: 'inline-block',
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: 'clamp(12px, 1.4vw, 15px)',
                  letterSpacing: '0.14em',
                  padding: 'clamp(13px, 1.6vw, 17px) clamp(32px, 4vw, 52px)',
                  background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
                  color: '#000',
                  border: '1px solid rgba(250,244,236,0.3)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  boxShadow: '0 0 28px rgba(201,154,63,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
                }}
              >
                CLAIM YOUR HEROGLYPH →
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
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

      <GateRevealSection />
    </div>
  );
}
