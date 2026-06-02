import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider-horizontal';
import { PageTopBar } from '@/components/PageTopBar';
import dogyptTextLogo from '@/assets/dogypt-logo-gold.png';

type PillStatus = 'done' | 'progress' | 'future' | 'goal';
type PillData = { icon: string; label: string; tooltip: string; status: PillStatus };

const PILLARS: PillData[] = [
  {
    icon: '/icons/mission/ankh.svg',
    label: 'The Plan',
    tooltip:
      "Dogyptism is alive. The constitution written, the first doglovers gathering, the movement set in motion.",
    status: 'done',
  },
  {
    icon: '/icons/mission/pyramid.svg',
    label: 'One Million',
    tooltip:
      "One million doglovers, one million heroglyphs. The threshold where we stop being individuals and become unstoppable.",
    status: 'progress',
  },
  {
    icon: '/icons/mission/internet.svg',
    label: 'Digital Temple',
    tooltip:
      "One app, one sacred space, connecting every doglover, every dog, every act of kindness across the planet.",
    status: 'progress',
  },
  {
    icon: '/icons/mission/heartpaw.svg',
    label: 'The Mission',
    tooltip:
      "Not shelters but working solutions, fully backed by Dogypt. We fix the root, not the symptoms the system ignores.",
    status: 'future',
  },
  {
    icon: '/icons/mission/doghome.svg',
    label: 'Centers',
    tooltip:
      "Real Dogypt Centers on every continent. Shelters, sanctuaries and gathering places built by us, owned by us.",
    status: 'future',
  },
  {
    icon: '/icons/mission/chemical.svg',
    label: 'Research',
    tooltip:
      "Longevity research guided by Mother Nature, not the pharma machine. Helping every dog live longer, healthier.",
    status: 'future',
  },
  {
    icon: '/icons/mission/balance.svg',
    label: 'Goal',
    tooltip:
      "A home for every stray on Earth. The final vow of the pack: zero dogs left behind, every life returned.",
    status: 'goal',
  },
];

export default function Vision() {
  const navigate = useNavigate();
  const [activePill, setActivePill] = useState<number | null>(null);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="dark-bg vision-root flex flex-col min-h-[100dvh] overflow-y-auto relative">
      {/* Mild radial overlay — fixed so it stays put when scroll-snap moves sections */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.5) 100%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Mobile only: extra 25% dark layer on page bg (image stays in original colors — z-index higher) */}
      <div
        className="md:hidden"
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.25)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <style>{`
        /* Page scrollovateľný (min-h + overflow-y-auto) → .dark-bg::before (absolute, cover)
         * by sa inak roztiahol na celú výšku scrollu a zväčšil heroglyf pozadie.
         * Fix = fixed na viewport (rovnaký pattern ako .about-root). Scoped na .vision-root. */
        .vision-root.dark-bg::before {
          position: fixed;
        }

        /* ── 2-col layout (mobile: flex column with reordered items via display:contents) ── */
        .mission-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(14px, 2.4vh, 22px);
          width: 100%;
          max-width: 1120px;
          text-align: center;
        }
        @media (max-width: 767px) {
          .mission-grid { gap: clamp(18px, 3vh, 30px); }
        }

        /* Mobile-only headline — match /codex .codex-headline mobile size (IN DOG WE TRUST) for cross-page consistency */
        @media (max-width: 767px) {
          .headline-main {
            font-size: 2.8rem !important;
            letter-spacing: 0.03em !important;
            line-height: 1.04 !important;
          }
          .headline-sub {
            font-size: 1.5rem !important;
            letter-spacing: 0.06em !important;
            margin-top: 10px !important;
            white-space: nowrap !important;
          }
        }
        @media (min-width: 768px) {
          .mission-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
            gap: clamp(28px, 4.5vw, 64px);
            align-items: stretch;
            text-align: left;
          }
        }

        /* Body paragraph */
        .mission-para {
          font-family: 'Inter', sans-serif;
          font-size: clamp(0.85rem, 1.15vw, 0.98rem);
          font-weight: 400;
          color: rgba(250,244,236,0.78);
          line-height: 1.65;
          letter-spacing: 0.005em;
          margin: 0;
          max-width: 480px;
        }
        @media (max-width: 767px) {
          .mission-para {
            font-size: clamp(15px, 4.4vw, 19px);
            line-height: 1.5;
            max-width: 92%;
            color: rgba(250,244,236,0.92);
            text-align: center;
            text-wrap: balance;
          }
        }

        /* Left column: middle group centered, CTA pinned to bottom (aligns with image bottom edge) */
        .mission-left {
          display: flex;
          flex-direction: column;
          gap: clamp(16px, 2.8vh, 28px);
        }
        @media (min-width: 768px) {
          .mission-left {
            gap: clamp(18px, 2.8vh, 26px);
            padding-top: 2px;
            justify-content: flex-start;
          }
        }
        .mission-left-middle {
          display: flex;
          flex-direction: column;
          gap: clamp(18px, 3.2vh, 34px);
        }
        .mission-bottom {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        @media (max-width: 767px) {
          .mission-bottom { align-items: center; }
        }

        /* ── MOBILE: 2 "podlažia" – snap scroll, každá sekcia = jeden viewport ── */
        .m-screen {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @media (max-width: 767px) {
          .topbar-wrap {
            position: sticky;
            top: 0;
            z-index: 50;
            background: #000;
            flex-shrink: 0;
          }
          .mission-grid { gap: 0; max-width: none; }
          .m-screen {
            padding: 0 5vw;
          }
          .m-screen-a {
            justify-content: flex-start;
            padding-top: clamp(24px, 5vh, 48px);
            padding-bottom: clamp(40px, 8vh, 70px);
            gap: clamp(16px, 2.8vh, 24px);
          }
          .m-screen-b {
            justify-content: flex-start;
            padding-top: clamp(10px, 3vh, 28px);
            padding-bottom: clamp(48px, 10vh, 90px);
            gap: clamp(22px, 3.6vh, 32px);
          }
        }
        @media (min-width: 768px) {
          .m-screen { display: contents; }
          .topbar-wrap { display: contents; }
        }

        /* Desktop: 3 groups in left column with space-between — top group / CTA centered / pills bottom */
        @media (min-width: 768px) {
          .mission-left { justify-content: space-between; }
          .mission-bottom { align-self: flex-start; }
        }
        .mission-subline {
          font-family: 'Inter', sans-serif;
          font-size: clamp(0.6rem, 0.85vw, 0.72rem);
          font-weight: 500;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(250,244,236,0.42);
          margin: 0;
        }

        /* ── PILLARS (ROADMAP) ── */
        .mission-pillars {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: clamp(4px, 0.55vw, 7px);
          justify-content: flex-start;
        }
        @media (max-width: 767px) {
          .mission-pillars {
            justify-content: center;
            gap: 9px;
            max-width: 92%;
          }
        }
        .mission-pill {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.55rem, 0.85vw, 0.68rem);
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #FAF3E1;
          background: rgba(250, 243, 225, 0.10);
          border: 1px solid rgba(250, 243, 225, 0.55);
          border-radius: 999px;
          padding: 4px 10px;
          white-space: nowrap;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
        }
        .mission-pill:hover {
          background: rgba(250, 243, 225, 0.20);
          border-color: rgba(250, 243, 225, 0.95);
          transform: translateY(-1px);
        }
        @media (max-width: 767px) {
          .mission-pill {
            font-size: 11px;
            letter-spacing: 0.14em;
            padding: 5px 11px;
            gap: 6px;
            border-radius: 999px;
          }
        }
        .mission-pill-icon {
          width: 13px;
          height: 13px;
          object-fit: contain;
          filter: brightness(0) saturate(100%) invert(96%) sepia(7%)
                  saturate(382%) hue-rotate(355deg) brightness(101%) contrast(96%);
          opacity: 0.85;
        }
        @media (max-width: 767px) {
          .mission-pill-icon { width: 12px; height: 12px; }
          .pill-status-dot { width: 6px; height: 6px; }
        }

        /* Status dot — done (green) / progress (orange pulsing) / future (red) */
        .pill-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .pill-status-dot.done {
          background: #4ADE80;
          box-shadow: 0 0 6px rgba(74, 222, 128, 0.65);
        }
        .pill-status-dot.progress {
          background: #F59E0B;
          box-shadow: 0 0 7px rgba(245, 158, 11, 0.75);
          animation: dotPulse 1.4s ease-in-out infinite;
        }
        .pill-status-dot.future {
          background: #EF4444;
          box-shadow: 0 0 5px rgba(239, 68, 68, 0.45);
          opacity: 0.75;
        }
        .pill-status-dot.goal {
          background: #8B5CF6;
          box-shadow: 0 0 7px rgba(139, 92, 246, 0.75);
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 7px rgba(245, 158, 11, 0.85); }
          50%      { opacity: 0.55; transform: scale(0.78); box-shadow: 0 0 4px rgba(245, 158, 11, 0.45); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pill-status-dot.progress { animation: none; }
        }

        /* Force row break after The App (pill #3) so The Mission starts row 2 */
        .pill-row-break {
          flex-basis: 100%;
          height: 0;
        }
        .pill-row-break-mobile { display: none; }
        .pill-row-break-desktop { display: block; }
        @media (max-width: 767px) {
          .pill-row-break-mobile { display: none; }
          .pill-row-break-desktop { display: none; }
        }

        /* Roadmap connector — papyrus "···" inline */
        .pill-connector {
          display: inline-flex;
          align-items: center;
          font-family: 'Inter', sans-serif;
          font-size: clamp(0.55rem, 0.85vw, 0.7rem);
          color: rgba(250, 244, 236, 0.30);
          letter-spacing: 0.22em;
          padding: 0 2px;
          user-select: none;
          pointer-events: none;
        }

        /* Desktop: per-pill floating tooltip (papyrus + downward arrow) */
        .pill-tooltip-float {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          width: clamp(220px, 22vw, 280px);
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 10px;
          padding: 9px 13px;
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          font-weight: 400;
          line-height: 1.45;
          letter-spacing: 0.005em;
          text-transform: none;
          color: #1a0a05;
          white-space: normal;
          text-align: left;
          z-index: 20;
          pointer-events: none;
          box-shadow:
            0 6px 24px rgba(0, 0, 0, 0.55),
            0 0 0 3px rgba(201, 154, 63, 0.18);
          animation: tooltipFloatFade 0.18s ease-out;
        }
        .pill-tooltip-float::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 7px solid transparent;
          border-top-color: #C99A3F;
        }

        /* Mobile: shared block below pills, papyrus styling (matches /heroglyph) */
        .pill-tooltip {
          width: 100%;
          max-width: 360px;
          margin: 4px auto 0;
          padding: 10px 14px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 10px;
          box-shadow:
            0 6px 24px rgba(0, 0, 0, 0.55),
            0 0 0 3px rgba(201, 154, 63, 0.18);
          text-align: left;
          animation: tooltipFade 0.18s ease-out;
        }
        .pill-tooltip-label {
          font-family: 'Cinzel', serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: #1a0a05;
          line-height: 1.25;
        }
        .pill-tooltip-text {
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          font-weight: 400;
          letter-spacing: 0.005em;
          line-height: 1.45;
          color: #4a3010;
          margin-top: 4px;
        }
        @media (max-width: 767px) {
          .pill-tooltip {
            position: absolute;
            top: calc(100% + 10px);
            left: 50%;
            transform: translateX(-50%);
            width: max-content;
            max-width: min(360px, 86vw);
            padding: 11px 14px;
            margin: 0;
            z-index: 30;
            cursor: pointer;
          }
          .pill-tooltip-label { font-size: 12px; letter-spacing: 0.10em; }
          .pill-tooltip-text  { font-size: 12px; line-height: 1.45; }
        }
        /* Desktop floating: preserve translateX(-50%) centering during fade */
        @keyframes tooltipFloatFade {
          from { opacity: 0; transform: translate(-50%, -4px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        /* Mobile shared block: opacity-only (no transform on block) */
        @keyframes tooltipFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Active pill state */
        .mission-pill.is-active {
          background: rgba(201, 154, 63, 0.22);
          border-color: rgba(201, 154, 63, 0.95);
        }

        /* ── SQUARE COMPARISON ── */
        .square-frame {
          position: relative;
          width: 100%;
          max-width: min(62vh, 560px);
          aspect-ratio: 1 / 1;
          border-radius: 14px;
          overflow: hidden;
          box-shadow:
            0 0 72px rgba(201,154,63,0.22),
            0 0 0 1px rgba(250,244,236,0.10) inset;
          margin: 0 auto;
        }
        @media (max-width: 767px) {
          .square-frame {
            max-width: 76vw;
            margin-left: auto;
            margin-right: auto;
          }
        }

        /* ── MOBILE: pulsing scroll arrow under headline (section A only) ── */
        .scroll-arrow {
          display: none;
        }
        @media (max-width: 767px) {
          .scroll-arrow {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-top: clamp(6px, 1.4vh, 14px);
            animation: scrollArrowPulse 1.8s ease-in-out infinite;
          }
          .scroll-arrow svg {
            filter: drop-shadow(0 0 6px rgba(255,255,255,0.35));
          }
        }
        @keyframes scrollArrowPulse {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50%      { transform: translateY(7px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .scroll-arrow { animation: none; opacity: 0.9; }
        }
        .square-label {
          position: absolute;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.62rem, 0.95vw, 0.78rem);
          font-weight: 700;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          z-index: 4;
          text-shadow: 0 1px 8px rgba(0,0,0,0.85);
        }
        .square-label.today {
          top: 14px;
          left: 14px;
          color: rgba(250,244,236,0.72);
        }
        .square-label.dogypt {
          bottom: 14px;
          right: 14px;
          color: #F5C73D;
          text-shadow: 0 1px 8px rgba(0,0,0,0.85), 0 0 14px rgba(245,199,61,0.45);
        }

        /* ── CTA — same DNA as /heroglyph ── */
        .mission-cta {
          padding: clamp(11px, 1.7vh, 15px) clamp(28px, 4.4vw, 44px);
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250, 244, 236, 0.40);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.84rem, 1.2vw, 0.98rem);
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          box-shadow:
            0 0 24px rgba(255, 200, 90, 0.65),
            0 0 60px rgba(230, 158, 26, 0.50),
            0 0 110px rgba(230, 158, 26, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.45);
          text-shadow: 0 1px 0 rgba(255, 240, 200, 0.45);
          transition: transform 0.2s, box-shadow 0.25s;
          animation: missionCtaPulse 3.2s ease-in-out infinite;
          align-self: flex-start;
        }
        @media (max-width: 767px) {
          .mission-cta {
            align-self: center;
            padding: 13px 34px;
            font-size: 0.95rem;
            letter-spacing: 0.14em;
            margin: clamp(18px, 3.5vh, 30px) 0;
          }
          .mission-pillars { margin-bottom: 0; }
        }
        .mission-cta:hover {
          transform: scale(1.05);
          box-shadow:
            0 0 36px rgba(255, 215, 110, 0.85),
            0 0 90px rgba(230, 158, 26, 0.70),
            0 0 150px rgba(230, 158, 26, 0.40),
            inset 0 1px 0 rgba(255, 255, 255, 0.55);
        }
        .mission-cta:active { transform: scale(0.98); }
        @keyframes missionCtaPulse {
          0%, 100% {
            box-shadow:
              0 0 24px rgba(255, 200, 90, 0.55),
              0 0 60px rgba(230, 158, 26, 0.42),
              0 0 110px rgba(230, 158, 26, 0.22),
              inset 0 1px 0 rgba(255, 255, 255, 0.45);
          }
          50% {
            box-shadow:
              0 0 34px rgba(255, 215, 110, 0.85),
              0 0 84px rgba(230, 158, 26, 0.62),
              0 0 140px rgba(230, 158, 26, 0.38),
              inset 0 1px 0 rgba(255, 255, 255, 0.55);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .mission-cta { animation: none; }
        }

        /* ── Eyebrow / overline ── */
        .eyebrow {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.62rem, 0.95vw, 0.74rem);
          letter-spacing: 0.36em;
          color: rgba(250,244,236,0.45);
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .eyebrow::before {
          content: '';
          height: 1px;
          width: clamp(20px, 3vw, 32px);
          background: rgba(201,154,63,0.45);
        }

        /* ── INTRO VIDEO HERO (top section) ── */
        .vision-video-hero {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(18px, 3vh, 30px);
          padding: clamp(28px, 6vh, 60px) 5vw clamp(36px, 7vh, 72px);
          min-height: calc(100dvh - 72px);
          text-align: center;
        }
        @media (max-width: 767px) {
          .vision-video-hero {
            min-height: auto;
            padding-top: clamp(24px, 5vh, 40px);
            padding-bottom: clamp(30px, 6vh, 50px);
            gap: clamp(16px, 2.6vh, 24px);
          }
        }
        .video-hero-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          letter-spacing: 0.03em;
          line-height: 1;
          margin: 0;
          text-transform: uppercase;
        }
        .video-embed-frame {
          position: relative;
          width: min(680px, 100%);
          aspect-ratio: 16 / 9;
          border-radius: 14px;
          overflow: hidden;
          background: #000;
          box-shadow:
            0 0 90px 12px rgba(201,154,63,0.40),
            0 0 180px 30px rgba(201,154,63,0.22),
            0 0 0 1px rgba(250,244,236,0.16) inset;
          transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.45s ease;
        }
        /* Po kliku na "Watch ..." → náhľad sa zväčší + spustí prehrávanie */
        .video-embed-frame.is-playing {
          width: min(980px, 100%);
          box-shadow:
            0 0 120px 16px rgba(201,154,63,0.48),
            0 0 220px 40px rgba(201,154,63,0.26),
            0 0 0 1px rgba(250,244,236,0.18) inset;
        }
        .video-embed-frame iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
        /* Clean facade poster — no YouTube chrome until played */
        .video-poster {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          padding: 0;
          border: 0;
          background: #000;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
        }
        .video-poster img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .video-play-btn {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: clamp(64px, 9vw, 84px);
          height: clamp(64px, 9vw, 84px);
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.32);
          backdrop-filter: blur(2px);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .video-play-btn svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 10px rgba(201, 154, 63, 0.55));
        }
        .video-poster:hover .video-play-btn {
          transform: scale(1.08);
          background: rgba(0, 0, 0, 0.45);
        }
        .video-poster:active .video-play-btn { transform: scale(0.97); }
        .video-hero-caption {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.64rem, 0.98vw, 0.82rem);
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(250,244,236,0.66);
          margin: 0;
          padding: 4px 2px;
          background: none;
          border: 0;
          cursor: pointer;
          display: inline-block;
          text-decoration: underline;
          text-decoration-color: rgba(201,154,63,0.70);
          text-decoration-thickness: 1px;
          text-underline-offset: 0.34em;
          -webkit-tap-highlight-color: transparent;
          transition: color 0.2s ease, text-decoration-color 0.2s ease;
        }
        .video-hero-caption::before {
          content: '\\25B6';
          font-size: 0.7em;
          color: #C99A3F;
          margin-right: 9px;
          display: inline-block;
        }
        .video-hero-caption:hover {
          color: #F5C73D;
          text-decoration-color: #F5C73D;
        }
        .video-hero-caption:hover::before { color: #F5C73D; }

        /* Content area below the video — own viewport band on desktop */
        .vision-content-area { width: 100%; }
        @media (min-width: 768px) {
          .vision-content-area {
            min-height: 100dvh;
            padding-top: 40px;
            padding-bottom: 60px;
          }
        }
      `}</style>

      <div className="topbar-wrap">
        <PageTopBar withNav />
      </div>

      {/* ── Intro video hero ── */}
      <section className="vision-video-hero" style={{ zIndex: 2 }}>
        <h1 className="video-hero-title">
          <span
            style={{
              background:
                'linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter:
                'drop-shadow(0 0 22px rgba(245,199,61,0.42)) drop-shadow(0 0 7px rgba(230,158,26,0.5))',
            }}
          >
            The Vision
          </span>
        </h1>
        {!videoPlaying && (
          <button
            type="button"
            className="video-hero-caption"
            onClick={() => setVideoPlaying(true)}
          >
            Watch Dogypt Intro Movie
          </button>
        )}
        <div className={`video-embed-frame${videoPlaying ? ' is-playing' : ''}`}>
          {videoPlaying ? (
            <iframe
              src="https://www.youtube-nocookie.com/embed/TwSl_aOwbaY?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&color=white"
              title="DOGYPT Intro Movie"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className="video-poster"
              onClick={() => setVideoPlaying(true)}
              aria-label="Play Dogypt Intro Movie"
            >
              <img src="/images/mission/intro-poster.jpg" alt="" />
              <span className="video-play-btn" aria-hidden>
                <svg viewBox="0 0 72 72" width="72" height="72">
                  <circle cx="36" cy="36" r="34" fill="none" stroke="#C99A3F" strokeWidth="2.5" />
                  <path d="M29 25 L51 36 L29 47 Z" fill="none" stroke="#C99A3F" strokeWidth="2.5" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          )}
        </div>
      </section>

      {/* Main 2-col area */}
      <div
        className="vision-content-area flex items-start md:items-center justify-center px-0 md:px-10 relative"
        style={{ zIndex: 2 }}
      >
        {(() => {
          const headlineJsx = (
            <div className="mission-headline">
              <h1
                className="headline-main"
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: 'clamp(2.4rem, 5.4vw, 4.2rem)',
                  letterSpacing: '0.02em',
                  lineHeight: 0.98,
                  margin: 0,
                  textTransform: 'uppercase',
                }}
              >
                <span
                  style={{
                    background:
                      'linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter:
                      'drop-shadow(0 0 22px rgba(245,199,61,0.42)) drop-shadow(0 0 7px rgba(230,158,26,0.5))',
                  }}
                >
                  Imagine
                </span>
                <br />
                <span style={{ color: '#FAF4EC' }}>A World</span>
              </h1>
              <p
                className="headline-sub"
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: 'clamp(1.15rem, 2.2vw, 1.7rem)',
                  letterSpacing: '0.04em',
                  color: 'rgba(250,244,236,0.90)',
                  textTransform: 'none',
                  margin: '8px 0 0',
                  lineHeight: 1.15,
                  whiteSpace: 'nowrap',
                }}
              >
                Built By{' '}
                <span
                  style={{
                    textDecoration: 'underline',
                    textDecorationThickness: '1px',
                    textUnderlineOffset: '0.18em',
                    textDecorationColor: 'rgba(201,154,63,0.85)',
                  }}
                >
                  Doglovers
                </span>
                .
              </p>
            </div>
          );

          const imageJsx = (
            <div className="square-frame" aria-label="Day One vs One Day">
              <ImageComparisonSlider
                leftImage="/images/mission/shelter-before.png"
                rightImage="/images/mission/shelter-after.png"
                altLeft="Day One — overwhelmed dog shelter"
                altRight="One Day — Dogypt Center"
                initialPosition={50}
                handleLogo="/images/mission/dogypt-circle-logo.png"
                mobileHandleLogo={dogyptTextLogo}
              />
              <div className="square-label today">Day One</div>
              <div className="square-label dogypt">One Day</div>
            </div>
          );

          const paraJsx = (
            <p className="mission-para">
              Beyond borders and politics — doglovers are Earth's kindest hidden force. Only together, we can rebuild the system and change the world.
            </p>
          );

          const ctaJsx = (
            <button onClick={() => navigate('/heroglyph')} className="mission-cta">
              Become Dogyptian
            </button>
          );

          const pillsJsx = (
            <div className="mission-pillars">
              {PILLARS.map((p, i) => (
                <Fragment key={p.label}>
                  <button
                    type="button"
                    className={`mission-pill${isMobile && activePill === i ? ' is-active' : ''}`}
                    onClick={() => {
                      if (isMobile) {
                        setActivePill((prev) => (prev === i ? null : i));
                      }
                    }}
                    onMouseEnter={() => {
                      if (!isMobile) setActivePill(i);
                    }}
                    onMouseLeave={() => {
                      if (!isMobile)
                        setActivePill((prev) => (prev === i ? null : prev));
                    }}
                    aria-expanded={isMobile ? activePill === i : undefined}
                  >
                    <span className={`pill-status-dot ${p.status}`} aria-hidden />
                    <img src={p.icon} alt="" className="mission-pill-icon" />
                    {p.label}
                    {!isMobile && activePill === i && (
                      <span className="pill-tooltip-float" role="tooltip">
                        {p.tooltip}
                      </span>
                    )}
                  </button>
                  {i === 2 && <span className="pill-row-break pill-row-break-desktop" aria-hidden />}
                  {(i === 1 || i === 3) && <span className="pill-row-break pill-row-break-mobile" aria-hidden />}
                </Fragment>
              ))}

              {isMobile && activePill !== null && (
                <div
                  className="pill-tooltip"
                  role="tooltip"
                  onClick={() => setActivePill(null)}
                >
                  <div className="pill-tooltip-label">
                    {PILLARS[activePill].label}
                  </div>
                  <div className="pill-tooltip-text">
                    {PILLARS[activePill].tooltip}
                  </div>
                </div>
              )}
            </div>
          );

          return (
            <div className="mission-grid">
              {isMobile ? (
                <>
                  <section className="m-screen m-screen-a">
                    {imageJsx}
                    {headlineJsx}
                    <span className="scroll-arrow" aria-hidden>
                      <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
                        <path
                          d="M4 4 L14 12.5 L24 4"
                          stroke="#FAF4EC"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </span>
                  </section>
                  <section className="m-screen m-screen-b">
                    {paraJsx}
                    {ctaJsx}
                    {pillsJsx}
                  </section>
                </>
              ) : (
                <>
                  <div
                    className="mission-left"
                    style={{ textAlign: 'left', alignItems: 'flex-start' }}
                  >
                    <div
                      className="mission-left-middle"
                      style={{ alignItems: 'flex-start' }}
                    >
                      {headlineJsx}
                      {paraJsx}
                    </div>
                    <div className="mission-bottom">{ctaJsx}</div>
                    {pillsJsx}
                  </div>
                  {imageJsx}
                </>
              )}
            </div>
          );
        })()}
      </div>

    </div>
  );
}
