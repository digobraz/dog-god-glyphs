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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // RAF loop — reads scroll once per frame, avoids seeking queue buildup
  useEffect(() => {
    let rafId: number;
    let lastTime = -1;
    const loop = () => {
      const video = videoRef.current;
      if (video && video.duration) {
        const p = scrollYProgress.get();
        const vp = Math.max(0, Math.min(1, (p - 0.1) / 0.75));
        const target = vp * video.duration;
        if (Math.abs(video.currentTime - target) > 0.033) {
          video.currentTime = target;
          lastTime = target;
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [scrollYProgress]);

  // Gate panels open immediately from 0 → 0.45 scroll progress
  const gateLeft = useTransform(scrollYProgress, [0, 0.45], ['0%', '-100%'], { clamp: true });
  const gateRight = useTransform(scrollYProgress, [0, 0.45], ['0%', '100%'], { clamp: true });
  // Gate glow — full from start
  const gateGlow = useTransform(scrollYProgress, [0, 0.06], [0.4, 1], { clamp: true });
  // CTA appears at 0.72 → 0.88
  const ctaOpacity = useTransform(scrollYProgress, [0.72, 0.88], [0, 1], { clamp: true });
  const ctaY = useTransform(scrollYProgress, [0.72, 0.88], [40, 0], { clamp: true });
  // Video opacity — fades in early
  const videoOpacity = useTransform(scrollYProgress, [0.08, 0.3], [0, 1], { clamp: true });

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

        {/* Dark vignette over video */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 20%, rgba(0,0,0,0.55) 100%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* ═══ GATE PANELS ═══ */}
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
              {/* ── SVG panel decoration ── */}
              <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                viewBox="0 0 400 700"
                preserveAspectRatio="none"
              >
                <defs>
                  <radialGradient id={`bg-${side}`} cx="50%" cy="35%" r="75%">
                    <stop offset="0%" stopColor="#1c1408" />
                    <stop offset="100%" stopColor="#060402" />
                  </radialGradient>
                  <linearGradient id={`outer-col-${side}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#C99A3F" stopOpacity="0.08" />
                    <stop offset="50%" stopColor="#E8B84B" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#C99A3F" stopOpacity="0.12" />
                  </linearGradient>
                  <linearGradient id={`seam-col-${side}`} x1={isLeft ? '0' : '1'} y1="0" x2={isLeft ? '1' : '0'} y2="0">
                    <stop offset="0%" stopColor="#C99A3F" stopOpacity="0.04" />
                    <stop offset="60%" stopColor="#E8B84B" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#FFF0A0" stopOpacity="1" />
                  </linearGradient>
                  <pattern id={`diamonds-${side}`} width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M15 2 L28 15 L15 28 L2 15 Z" fill="none" stroke="#C99A3F" strokeWidth="0.7" strokeOpacity="0.3"/>
                  </pattern>
                  <pattern id={`hlines-${side}`} width="400" height="14" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="400" y2="0" stroke="#C99A3F" strokeWidth="0.4" strokeOpacity="0.14"/>
                  </pattern>
                  <filter id={`glow-${side}`}>
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* Background */}
                <rect width="400" height="700" fill={`url(#bg-${side})`}/>

                {/* Subtle horizontal lines throughout */}
                <rect width="400" height="700" fill={`url(#hlines-${side})`}/>

                {/* ── OUTER COLUMN (far edge) ── */}
                <rect x="0" y="0" width="42" height="700" fill={`url(#outer-col-${side})`}/>
                <line x1="42" y1="0" x2="42" y2="700" stroke="#C99A3F" strokeWidth="1.2" strokeOpacity="0.55"/>
                <line x1="50" y1="0" x2="50" y2="700" stroke="#C99A3F" strokeWidth="0.35" strokeOpacity="0.22"/>
                {/* Lotus capital top */}
                <path d="M21 18 Q10 30 6 48 Q21 38 21 48 Q21 38 36 48 Q32 30 21 18Z" fill="#C99A3F" fillOpacity="0.28"/>
                {/* Lotus capital bottom */}
                <path d="M21 682 Q10 670 6 652 Q21 662 21 652 Q21 662 36 652 Q32 670 21 682Z" fill="#C99A3F" fillOpacity="0.28"/>
                {/* Outer col vertical lines */}
                {[12, 22, 32].map(x => (
                  <line key={x} x1={x} y1="60" x2={x} y2="640" stroke="#C99A3F" strokeWidth="0.4" strokeOpacity="0.2"/>
                ))}

                {/* ── TOP CORNICE ── */}
                <rect x="50" y="0" width="314" height="62" fill="#100c05"/>
                <line x1="50" y1="62" x2="364" y2="62" stroke="#C99A3F" strokeWidth="1.4" strokeOpacity="0.7"/>
                <line x1="50" y1="56" x2="364" y2="56" stroke="#C99A3F" strokeWidth="0.4" strokeOpacity="0.3"/>
                <line x1="50" y1="66" x2="364" y2="66" stroke="#C99A3F" strokeWidth="0.4" strokeOpacity="0.25"/>
                {/* Cornice horizontal rules */}
                {[14, 24, 34, 46].map(y => (
                  <line key={y} x1="80" y1={y} x2="340" y2={y} stroke="#C99A3F" strokeWidth="0.5" strokeOpacity="0.3"/>
                ))}
                {/* Wing / scarab motif */}
                <path d="M207 10 L155 40 L168 40 L207 24 L246 40 L259 40 Z" fill="#C99A3F" fillOpacity="0.35"/>
                <path d="M207 10 L193 26 L207 22 L221 26 Z" fill="#C99A3F" fillOpacity="0.5"/>
                {/* Cornice side columns */}
                <rect x="50" y="0" width="22" height="62" fill="#C99A3F" fillOpacity="0.06"/>
                <rect x="342" y="0" width="22" height="62" fill="#C99A3F" fillOpacity="0.06"/>

                {/* ── UPPER DIAMOND GRID ── */}
                <rect x="50" y="66" width="314" height="200" fill={`url(#diamonds-${side})`}/>
                {/* Upper grid border */}
                <line x1="50" y1="266" x2="364" y2="266" stroke="#C99A3F" strokeWidth="1" strokeOpacity="0.55"/>
                <line x1="50" y1="272" x2="364" y2="272" stroke="#C99A3F" strokeWidth="0.35" strokeOpacity="0.25"/>
                {/* Sub-column lines in diamond area */}
                <line x1="150" y1="66" x2="150" y2="266" stroke="#C99A3F" strokeWidth="0.5" strokeOpacity="0.3"/>
                <line x1="260" y1="66" x2="260" y2="266" stroke="#C99A3F" strokeWidth="0.5" strokeOpacity="0.3"/>

                {/* ── MIDDLE SECTION (below diamond grid, above bottom) ── */}
                {[310, 346, 382, 416, 452, 488, 520, 550, 578].map(y => (
                  <line key={y} x1="50" y1={y} x2="364" y2={y} stroke="#C99A3F" strokeWidth="0.45" strokeOpacity="0.2"/>
                ))}
                {/* Vertical sub-panel lines */}
                <line x1="150" y1="272" x2="150" y2="630" stroke="#C99A3F" strokeWidth="0.4" strokeOpacity="0.2"/>
                <line x1="260" y1="272" x2="260" y2="630" stroke="#C99A3F" strokeWidth="0.4" strokeOpacity="0.2"/>

                {/* ── BOTTOM CORNICE ── */}
                <rect x="50" y="638" width="314" height="62" fill="#100c05"/>
                <line x1="50" y1="638" x2="364" y2="638" stroke="#C99A3F" strokeWidth="1.4" strokeOpacity="0.7"/>
                <line x1="50" y1="644" x2="364" y2="644" stroke="#C99A3F" strokeWidth="0.4" strokeOpacity="0.3"/>
                {[654, 664, 676, 686].map(y => (
                  <line key={y} x1="80" y1={y} x2="340" y2={y} stroke="#C99A3F" strokeWidth="0.5" strokeOpacity="0.3"/>
                ))}
                <rect x="50" y="638" width="22" height="62" fill="#C99A3F" fillOpacity="0.06"/>
                <rect x="342" y="638" width="22" height="62" fill="#C99A3F" fillOpacity="0.06"/>

                {/* ── SEAM COLUMN (inner edge — bright gold) ── */}
                <rect x={isLeft ? 362 : 0} y="0" width="38" height="700" fill={`url(#seam-col-${side})`}/>
                {/* Seam edge glow line */}
                <line
                  x1={isLeft ? 400 : 0} y1="0"
                  x2={isLeft ? 400 : 0} y2="700"
                  stroke="#F5C73D" strokeWidth="2.5" strokeOpacity="0.9"
                  filter={`url(#glow-${side})`}
                />
                {/* Seam column inner line */}
                <line
                  x1={isLeft ? 362 : 38} y1="0"
                  x2={isLeft ? 362 : 38} y2="700"
                  stroke="#C99A3F" strokeWidth="0.8" strokeOpacity="0.5"
                />
              </svg>

              {/* ── CIRCULAR SEAL — split at seam ── */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  [isLeft ? 'right' : 'left']: 0,
                  transform: `translate(${isLeft ? '50%' : '-50%'}, -50%)`,
                  width: 'clamp(200px, 32vw, 400px)',
                  height: 'clamp(200px, 32vw, 400px)',
                  zIndex: 3,
                  pointerEvents: 'none',
                }}
              >
                {/* Outer glow ring */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  boxShadow: '0 0 40px 8px rgba(201,154,63,0.35), 0 0 80px 20px rgba(201,154,63,0.12)',
                }}/>
                {/* Outer border ring */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '4px solid #C99A3F',
                  background: 'radial-gradient(circle, #0e0905 55%, #1a1208 100%)',
                }}/>
                {/* Inner ring */}
                <div style={{
                  position: 'absolute', inset: '10%', borderRadius: '50%',
                  border: '1.5px solid rgba(201,154,63,0.45)',
                }}/>
                {/* Logo */}
                <div style={{
                  position: 'absolute', inset: '18%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img
                    src={dogyptLogo}
                    alt="DOGYPT"
                    style={{
                      width: '100%', height: '100%', objectFit: 'contain',
                      filter: 'drop-shadow(0 0 14px rgba(201,154,63,0.7)) brightness(1.1)',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Top seam glow — fixed, full width */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 5, zIndex: 11,
            background: 'linear-gradient(90deg, transparent 5%, #C99A3F 30%, #F5C73D 50%, #C99A3F 70%, transparent 95%)',
            boxShadow: '0 0 20px 5px rgba(201,154,63,0.55)',
          }}
        />

        {/* CTA overlay — appears at end */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            opacity: ctaOpacity,
            y: ctaY,
            pointerEvents: 'none',
          }}
        >
          {/* Dark overlay for CTA legibility */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,0,0,0.65) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(10px, 1.2vw, 13px)',
              letterSpacing: '0.4em',
              color: 'rgba(201,154,63,0.7)',
              textTransform: 'uppercase',
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
              textShadow: '0 0 40px rgba(0,0,0,0.8)',
            }}>
              BECOME DOGYPTIAN
            </h2>
            <motion.div style={{ pointerEvents: 'auto' }}>
              <Link
                to="/heroglyph"
                style={{
                  display: 'inline-block',
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: 'clamp(12px, 1.4vw, 15px)',
                  letterSpacing: '0.14em',
                  padding: 'clamp(12px, 1.5vw, 16px) clamp(28px, 3.5vw, 44px)',
                  background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
                  color: '#000',
                  border: '1px solid rgba(250,244,236,0.30)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  boxShadow: '0 0 32px rgba(201,154,63,0.5)',
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
