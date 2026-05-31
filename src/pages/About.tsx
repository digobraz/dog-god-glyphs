import { useEffect, useRef } from 'react';
import { PageTopBar } from '@/components/PageTopBar';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';

/**
 * /about — „A Dog Changed My Life." (So did yours.)
 * HERO (headline + intro + Matej & Hekthor photo) → scroll → vertical TIMELINE.
 * Timeline = 5 milestones, each card holds its OWN image + text (mobile-safe).
 * Desktop: cards alternate left/right of a gold centre line; mobile: single column.
 *
 * PLACEHOLDER 2026-05-31: years, body copy & most images sú placeholder.
 * Reálne fotky + presné roky dodá Matej. Video-vizitka = budúcnosť.
 */

type Milestone = {
  id: number;
  year: string;       // placeholder — Matej upresní
  tag: string;
  title: string;
  body: string;
  imageUrl: string;
};

const ph = () => 'https://placehold.co/800x500/15100a/15100a?text=%20';

const MILESTONES: Milestone[] = [
  {
    id: 1,
    year: '2017',
    tag: 'The Shelter',
    title: 'Treasure in the Shelter',
    body:
      'A black dog nobody wanted was waiting behind a shelter fence. His name became Hekthor. Adopting him wasn’t rescue — it was the beginning of everything.',
    imageUrl: ph(),
  },
  {
    id: 2,
    year: '2018',
    tag: 'The Bond',
    title: 'A Forever Bond',
    body:
      'He pulled me through the hardest stretch of my life without saying a single word. Every dog person knows this — they carry you exactly when you’re falling.',
    imageUrl: '/images/hektor-grid.jpg',
  },
  {
    id: 3,
    year: '2019',
    tag: 'The Journey',
    title: 'The Walk That Became a Book',
    body:
      'Together we walked across Slovakia — 42 days, 800 kilometres, one quiet promise. That road became a book: „Cesta s Hrdinom“ — The Road with a Hero.',
    imageUrl: ph(),
  },
  {
    id: 4,
    year: '2023',
    tag: 'The Voice',
    title: 'A Nation of Dog People',
    body:
      'Somewhere on that road the story stopped being about one man and one dog. Dogs give us everything and ask for almost nothing — they deserve a louder voice.',
    imageUrl: ph(),
  },
  {
    id: 5,
    year: 'Now',
    tag: 'Dogypt',
    title: 'The Journey Starts With You',
    body:
      'DOGYPT is a movement for everyone whose life was changed by a dog. Built on the oldest, most honest bond on Earth. Hekthor is founder #1. You are next.',
    imageUrl: '/images/email-pic-matej-hektor.png',
  },
];

export default function About() {
  const tlRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  // Scroll-reveal milestones (mobile vertical timeline)
  useEffect(() => {
    const rows = tlRef.current?.querySelectorAll('.tl-row');
    if (!rows || rows.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  // Pinned horizontal carousel (desktop): vertical scroll → horizontal translate
  useEffect(() => {
    const wrap = pinRef.current, track = trackRef.current;
    if (!wrap || !track) return;
    let raf = 0, pitch = 0, maxShift = 0, count = 0;

    const setup = () => {
      const cards = track.querySelectorAll<HTMLElement>('.hcard');
      count = cards.length;
      if (window.innerWidth < 768 || count < 2) {
        track.style.transform = '';
        track.style.paddingLeft = track.style.paddingRight = '';
        return false;
      }
      const pad = Math.max((window.innerWidth - cards[0].offsetWidth) / 2, 0);
      track.style.paddingLeft = `${pad}px`;
      track.style.paddingRight = `${pad}px`;
      pitch = cards[1].offsetLeft - cards[0].offsetLeft;
      maxShift = pitch * (count - 1);
      return true;
    };

    const render = () => {
      if (window.innerWidth < 768) return;
      const total = wrap.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(Math.max(-wrap.getBoundingClientRect().top / total, 0), 1) : 0;
      track.style.transform = `translate3d(${-(p * maxShift)}px,0,0)`;
      const active = Math.round(p * (count - 1));
      const dots = dotsRef.current?.children;
      if (dots) for (let i = 0; i < dots.length; i++) dots[i].classList.toggle('on', i === active);
    };

    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(render); };
    const onResize = () => { if (setup()) render(); };
    if (setup()) render();
    const t = setTimeout(() => { if (setup()) render(); }, 200); // re-measure after fonts/layout
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="dark-bg about-root flex flex-col relative" style={{ overflowX: 'clip' }}>
      <style>{`
        /* About je viac-obrazovková → bg-dark.png nech je viewport-sized (fixed),
           inak cover roztiahne vzor cez celú výšku stránky = obrie ikonky.
           Scopnuté len na .about-root, globálny .dark-bg ostáva nedotknutý. */
        .about-root.dark-bg::before { position: fixed; }

        /* ── Headline ── */
        .about-quote {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(2.6rem, 5.6vw, 4.4rem); line-height: 1.08; letter-spacing: 0.01em; margin: 0;
          background: linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 0 22px rgba(245,199,61,0.40)) drop-shadow(0 0 7px rgba(230,158,26,0.5));
        }
        .about-quote .aq-white {
          -webkit-text-fill-color: #FAF4EC; color: #FAF4EC;
        }
        .about-sub {
          font-family: 'Cinzel', serif; font-weight: 400; font-size: clamp(1rem, 1.7vw, 1.45rem);
          color: rgba(250,244,236,0.92); letter-spacing: 0.04em; margin: 0;
        }
        .hero-intro {
          font-family: 'Inter', sans-serif; font-size: clamp(1rem, 1.25vw, 1.15rem); font-weight: 400;
          color: rgba(250,244,236,0.72); line-height: 1.7; margin: 0; max-width: 540px;
          display: flex; flex-direction: column; gap: 0.7em;
        }
        .hero-intro p { margin: 0; text-wrap: balance; }
        .hero-intro strong { font-weight: 700; color: #FAF4EC; }
        @media (max-width: 767px) {
          .about-quote { font-size: clamp(2.3rem, 10.5vw, 3.1rem); }
          .about-sub { font-size: 1.05rem; }
          .hero-intro { font-size: 0.9rem; max-width: 100%; }
        }

        /* ── Hero ── */
        .hero-grid {
          display: flex; flex-direction: column; gap: clamp(22px, 4vh, 36px);
          width: 100%; max-width: 1120px; align-items: center; text-align: center;
        }
        @media (min-width: 768px) {
          .hero-grid {
            display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
            gap: clamp(40px, 5vw, 80px); align-items: center; text-align: left;
          }
        }
        .hero-photo {
          position: relative; width: 100%; max-width: min(58vh, 480px); aspect-ratio: 1 / 1;
          border-radius: 16px; overflow: hidden; margin: 0 auto; background: #0a0705;
          box-shadow: 0 0 72px rgba(201,154,63,0.22), 0 0 0 1px rgba(250,244,236,0.10) inset;
        }
        @media (max-width: 767px) { .hero-photo { max-width: min(50vh, 320px); } }
        .hero-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .scroll-hint {
          display: flex; flex-direction: column; align-items: center;
          color: #E6B84A; animation: hintBob 1.9s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(230,184,74,0.55)) drop-shadow(0 0 3px rgba(230,184,74,0.7));
        }
        @keyframes hintBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(7px); } }

        /* ── Timeline ── */
        .tl-section { width: 100%; display: flex; flex-direction: column; align-items: center; padding: clamp(20px,6vh,64px) 20px clamp(40px,9vh,90px); position: relative; z-index: 2; }
        .tl-head { text-align: center; margin-bottom: clamp(26px, 5vh, 52px); }
        .tl-eyebrow {
          font-family: 'Cinzel', serif; font-size: clamp(0.6rem,0.9vw,0.72rem); letter-spacing: 0.34em;
          text-transform: uppercase; color: rgba(250,244,236,0.45); margin: 0 0 10px;
        }
        .tl-h2 {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: clamp(2.5rem, 6vw, 5rem);
          margin: 0; text-transform: uppercase; letter-spacing: 0.02em;
          background: linear-gradient(135deg, #F5C73D 0%, #FFB840 40%, #E69E1A 70%, #F5C73D 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 0 16px rgba(245,199,61,0.32));
        }

        /* ── Cards (shared) ── */
        .tl-card {
          background: linear-gradient(180deg, rgba(28,22,14,0.92) 0%, rgba(16,12,8,0.94) 100%);
          border: 1px solid rgba(201,154,63,0.26); border-radius: 14px; overflow: hidden;
          box-shadow: 0 18px 48px rgba(0,0,0,0.45);
        }
        .tl-img { position: relative; width: 100%; aspect-ratio: 16 / 10; background: #0a0705; }
        .tl-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tl-img::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%); }
        .tl-body-wrap { padding: clamp(16px, 2vw, 22px) clamp(18px, 2.2vw, 26px) clamp(18px, 2.4vw, 24px); }
        .tl-year {
          display: inline-block; font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.72rem;
          letter-spacing: 0.2em; color: #C99A3F; border: 1px solid rgba(201,154,63,0.4);
          padding: 3px 12px; border-radius: 999px; margin-bottom: 12px;
        }
        .tl-title { font-family: 'Cinzel', serif; font-weight: 700; font-size: clamp(1.1rem, 1.7vw, 1.35rem); color: #FAF4EC; margin: 0 0 9px; letter-spacing: 0.01em; }
        .tl-text { font-family: 'Inter', sans-serif; font-size: clamp(0.85rem, 1vw, 0.95rem); line-height: 1.65; color: rgba(250,244,236,0.76); margin: 0; }

        .tl-node {
          position: absolute; width: 15px; height: 15px; border-radius: 50%; z-index: 3;
          background: radial-gradient(circle at 35% 30%, #FFD879, #C99A3F 70%);
          box-shadow: 0 0 0 4px rgba(201,154,63,0.18), 0 0 14px rgba(201,154,63,0.6);
        }
        .tl-conn { position: absolute; background: rgba(201,154,63,0.5); z-index: 1; }
        .tl-row { opacity: 0; transform: translateY(26px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .tl-row.in-view { opacity: 1; transform: none; }
        .tl-hint { display: none; }

        /* ── MOBILE (base): vertical single column, line on the left ── */
        .tl { position: relative; width: 100%; max-width: 520px; }
        .tl::before {
          content: ''; position: absolute; top: 8px; bottom: 8px; left: 13px; width: 2px;
          background: linear-gradient(180deg, rgba(201,154,63,0) 0%, rgba(201,154,63,0.55) 8%, rgba(201,154,63,0.55) 92%, rgba(201,154,63,0) 100%);
        }
        .tl-row { position: relative; width: 100%; box-sizing: border-box; padding: 0 0 0 42px; margin-bottom: 26px; }
        .tl-node { top: 24px; left: 6px; }
        .tl-conn { top: 30px; left: 14px; height: 1.5px; width: 22px; }

        /* mobile timeline hidden on desktop (PC uses pinned carousel below) */
        @media (min-width: 768px) { .tl-section { display: none; } }

        /* ===== PC PINNED HORIZONTAL CAROUSEL ===== */
        .hpin { display: none; }
        @media (min-width: 768px) {
          .hpin { display: block; position: relative; z-index: 2; }  /* height inline = N×100vh */
          .hpin-sticky {
            position: sticky; top: 0; height: 100vh; overflow: hidden;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
          }
          .hpin-head { position: relative; text-align: center; margin: 0 0 clamp(44px, 7.5vh, 88px); z-index: 4; pointer-events: none; }
          .hpin-head .tl-h2 { margin: 0; }
          .hpin-stage { position: relative; width: 100%; display: flex; align-items: center; }
          .hpin-track { display: flex; align-items: center; will-change: transform; }

          .hcard {
            flex: 0 0 auto; width: min(1120px, 88vw); margin-right: 48px;
            display: flex; align-items: center; gap: clamp(26px, 3vw, 50px);
            background:
              radial-gradient(125% 95% at 50% -12%, rgba(201,154,63,0.13) 0%, transparent 56%),
              linear-gradient(180deg, rgba(34,25,15,0.96) 0%, rgba(14,10,6,0.97) 100%);
            border: 1px solid rgba(201,154,63,0.36); border-radius: 22px;
            padding: clamp(26px, 2.8vw, 44px);
            box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 54px rgba(201,154,63,0.11), inset 0 1px 0 rgba(245,199,61,0.20);
          }
          .hcard-photo {
            flex: 0 0 auto; width: min(42vh, 400px); aspect-ratio: 1 / 1; border-radius: 14px; overflow: hidden;
            background: #0a0705; box-shadow: 0 0 0 1px rgba(250,244,236,0.10) inset;
          }
          .hcard-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
          .hcard-text { flex: 1 1 auto; min-width: 0; }
          .hcard-text .tl-year { font-size: 0.8rem; margin-bottom: 16px; }
          .hcard-text .tl-title { font-size: clamp(1.6rem, 2.7vw, 2.3rem); margin-bottom: 16px; }
          .hcard-text .tl-text { font-size: clamp(0.98rem, 1.2vw, 1.12rem); line-height: 1.7; max-width: 560px; }

          .hpin-dots { position: relative; margin-top: clamp(18px, 3vh, 30px); display: flex; gap: 9px; z-index: 4; }
          .hpin-dot { width: 8px; height: 8px; border-radius: 999px; background: rgba(201,154,63,0.3); transition: width .35s ease, background .35s ease; }
          .hpin-dot.on { width: 26px; background: #C99A3F; }
        }
      `}</style>

      {/* Page-level vignette overlay (fixed = pokrýva celú stránku pri scrolle, ako bg vzor) */}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.55) 100%)',
          zIndex: 1, pointerEvents: 'none',
        }}
      />

      {/* ───────────── HERO ───────────── */}
      <section className="relative flex flex-col" style={{ minHeight: '100dvh' }}>
        <PageTopBar withNav />

        <div className="flex-1 flex items-center justify-center px-5 md:px-10 py-8 relative min-h-0" style={{ zIndex: 2 }}>
          <div className="hero-grid">
            <div className="flex flex-col" style={{ gap: 'clamp(16px, 2.6vh, 24px)' }}>
              <div className="flex flex-col" style={{ gap: '10px' }}>
                <h1 className="about-quote"><span className="aq-white">It Was Never</span> “Just a Dog.”</h1>
              </div>
              <div className="hero-intro">
                <p>You already know the feeling…</p>
                <p>That a dog isn't something you own — it's <strong>someone you love</strong>. Now imagine that love organized. Connected. <strong>Powerful enough to change things.</strong></p>
                <p>It's about us. <strong>The doglovers.</strong></p>
              </div>
            </div>

            <div className="hero-photo" aria-label="Matej and Hekthor">
              <img src="/images/email-pic-matej-hektor.png" alt="Matej and Hekthor" />
            </div>
          </div>
        </div>

        {/* scroll hint */}
        <div className="scroll-hint" style={{ position: 'relative', zIndex: 2, paddingBottom: 22 }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ───────────── TIMELINE — PC: pinned horizontal carousel ───────────── */}
      <section className="hpin" style={{ height: `${MILESTONES.length * 100}vh` }} ref={pinRef}>
        <div className="hpin-sticky">
          <div className="hpin-head">
            <h2 className="tl-h2">The Story of Dogypt</h2>
          </div>
          <div className="hpin-stage">
            <div className="hpin-track" ref={trackRef}>
              {MILESTONES.map((m) => (
                <div key={m.id} className="hcard">
                  <div className="hcard-photo">
                    <img src={m.imageUrl} alt={m.tag}
                      onError={(e) => { const t = e.currentTarget; t.onerror = null; t.src = ph(); }} />
                  </div>
                  <div className="hcard-text">
                    <span className="tl-year">{m.year}</span>
                    <h3 className="tl-title">{m.title}</h3>
                    <p className="tl-text">{m.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hpin-dots" ref={dotsRef}>
            {MILESTONES.map((m, i) => (
              <span key={m.id} className={`hpin-dot${i === 0 ? ' on' : ''}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── TIMELINE — mobile: vertical ───────────── */}
      <section className="tl-section">
        <div className="tl-head">
          <h2 className="tl-h2">The Story of Dogypt</h2>
        </div>

        <div className="tl" ref={tlRef}>
          {MILESTONES.map((m) => (
            <div key={m.id} className="tl-row">
              <span className="tl-node" />
              <span className="tl-conn" />
              <article className="tl-card">
                <div className="tl-img">
                  <img src={m.imageUrl} alt={m.tag}
                    onError={(e) => { const t = e.currentTarget; t.onerror = null; t.src = ph(); }} />
                </div>
                <div className="tl-body-wrap">
                  <span className="tl-year">{m.year}</span>
                  <h3 className="tl-title">{m.title}</h3>
                  <p className="tl-text">{m.body}</p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials — placeholder, nechané zatiaľ (Matej 2026-05-31) */}
      <TestimonialsSection />
    </div>
  );
}
