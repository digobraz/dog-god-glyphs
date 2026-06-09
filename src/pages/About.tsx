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

// Star Wars opening-crawl copy (Matej OK 2026-06-08: full Hekthor story, EN master; SK saved for later i18n)
const CRAWL_INTRO = 'Ten years ago, in a shelter in the heart of Europe….';
const CRAWL_PARAS = [
  'In 2016, eight black puppies arrived at the shelter, thrown away in a single box. Seven found a home. The biggest one nobody wanted — he waited a whole year. His name was Hekthor.',
  'One day a couple came to the shelter to see Sindy, a small white female they wanted to adopt. By pure chance, Hekthor was in her kennel at the time — his own was just being cleaned. The man, who had only come along for the ride and never wanted a dog, fell in love with the black dog he was seeing for the very first time.',
  'A week later the two of them were together, and a beautiful story began. The man’s whole life changed, and in time he understood one thing: only someone who has a dog, and knows what a dog’s love feels like, can truly help dogs in need.',
  'And so the heroglyph was born — a symbol meant to unite doglovers everywhere into the largest community the world has ever known. A community that will stand for us, for our dogs, and for the generations to come — for people unafraid to admit that a dog is not just an animal, but a being that makes us better humans.',
  'Right now, the journey to the first milestone begins — to create 1,000,000 heroglyphs. And you can be part of it. Because the only ones crazy enough to believe they can change the world are the ones who do.',
  'In dog we trust.',
];

export default function About() {
  const tlRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const crawlRef = useRef<HTMLDivElement>(null);
  const swDarkRef = useRef<HTMLDivElement>(null);
  const swIntroRef = useRef<HTMLParagraphElement>(null);
  const swLogoRef = useRef<HTMLImageElement>(null);
  const swTextRef = useRef<HTMLDivElement>(null);

  // Skip the cinematic crawl → land at the start of the story timeline.
  const skipIntro = () => {
    const wrap = crawlRef.current;
    if (!wrap) return;
    window.scrollTo({ top: wrap.offsetTop + wrap.offsetHeight, behavior: 'smooth' });
  };

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

  // Star Wars opening crawl (scroll-linked): intro line fades → DOGYPT logo
  // recedes into the distance → gold text crawls up a tilted 3D plane, fading
  // into the distance at the top. Drives off the section's own scroll.
  useEffect(() => {
    const wrap = crawlRef.current;
    const hero = heroRef.current;
    const dark = swDarkRef.current;
    const intro = swIntroRef.current;
    const logo = swLogoRef.current;
    const text = swTextRef.current;
    if (!wrap || !text) return;
    let raf = 0;
    const clamp = (v: number, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const band = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

    const render = () => {
      const vh = window.innerHeight;
      const total = wrap.offsetHeight - vh;
      const p = total > 0 ? clamp(-wrap.getBoundingClientRect().top / total) : 0;

      // 0) hero (nav + content + hint) dissolves IN PLACE — it's sticky-pinned,
      //    so we only fade opacity + scale (NO counter-scroll → no jitter). The
      //    whole screen darkens ~25% at the same time.
      const hp = band(p, 0, 0.08);
      if (hero) {
        hero.style.opacity = String(1 - hp);
        hero.style.transform = `scale(${lerp(1, 0.96, hp)})`;
        hero.style.pointerEvents = hp > 0.98 ? 'none' : 'auto';
      }
      if (dark) dark.style.opacity = String(lerp(0, 0.25, hp));

      // 1) purple intro line — appears after the hero is gone, holds, fades out
      if (intro) intro.style.opacity = String(clamp(band(p, 0.1, 0.18) - band(p, 0.34, 0.4)));

      // 2) DOGYPT logo — appears, then shrinks away into the distance.
      //    Must be FULLY gone before the crawl text fades in (no overlap).
      if (logo) {
        const appear = band(p, 0.42, 0.5);
        const recede = band(p, 0.5, 0.60);
        logo.style.transform = `translate(-50%, -50%) scale(${lerp(1, 0.04, recede)})`;
        logo.style.opacity = String(clamp(appear - recede * 1.1));
      }

      // 3) gold crawl text — stays fully BELOW the fold until its beat, then
      //    rises and recedes up the tilted plane. Start offset = the block's
      //    own height (+ margin) so even a long crawl begins off-screen at the
      //    bottom and never pokes into the middle behind the logo. END offset =
      //    just clear of the top fold (NOT -1.35*H — that overshoots far above
      //    the viewport, so the last line vanishes long before p=1 and leaves a
      //    huge empty tail). With -1.1*vh the last word leaves exactly as the
      //    section ends → next section's heading appears on the very next scroll.
      const H = text.offsetHeight || vh;
      const ct = band(p, 0.56, 1);
      const y = lerp(H + 0.12 * vh, -1.1 * vh, ct);
      text.style.opacity = String(clamp(band(p, 0.55, 0.60)));
      text.style.transform = `translateX(-50%) rotateX(28deg) translateY(${y}px)`;
    };

    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(render); };
    render();
    const t = setTimeout(render, 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Pinned cinematic reveal (desktop): heading locks to centre, then each card
  // surfaces one-by-one in the centre as you scroll. Fully scroll-linked.
  useEffect(() => {
    const wrap = pinRef.current, stage = trackRef.current;
    if (!wrap || !stage) return;
    const head = wrap.querySelector<HTMLElement>('.hpin-head');
    let raf = 0;

    const clamp = (v: number, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const easeIO = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const render = () => {
      if (window.innerWidth < 768) {
        stage.style.opacity = '';
        if (head) { head.style.transform = ''; head.style.opacity = ''; }
        return;
      }
      const cards = stage.querySelectorAll<HTMLElement>('.hcard');
      const n = cards.length;
      if (n === 0) return;

      const vh = window.innerHeight;
      const total = wrap.offsetHeight - vh;
      const scrolled = clamp(-wrap.getBoundingClientRect().top, 0, total);

      // ── Intro — heading EMERGES in place, RIGHT as the crawl ends ────────
      //   Matej: „po dorolovaní textu sa sekcia fixne, zobrazí sa nadpis" —
      //   vynorenie, NIE scroling od spodu. The reveal is driven by the section
      //   APPROACHING the fold (wrapTop), NOT by `scrolled` (which stays 0 until
      //   the section pins ~1vh later — that 1vh of invisible glide WAS the
      //   empty gap). The heading is counter-translated by the section's own
      //   pre-pin offset so it stays DOCKED and just fades in, instead of
      //   sliding up from the bottom.
      const wrapTop = wrap.getBoundingClientRect().top;
      const HEAD_SCALE = 0.92;          // fixed (narrower than the slide ≈ 72vw)
      const DOCK_TOP = 0.13;            // fixed docked position (upper area)
      const padTop = 0.04 * vh;         // .hpin-head padding-top: 4vh
      const dockedY = DOCK_TOP * vh - HEAD_SCALE * padTop;
      // approach: 0 the moment the crawl section releases (wrapTop = vh) → 1 a
      // little later. Heading is fully in well before the section finishes pinning.
      const approach = clamp((vh - wrapTop) / (0.55 * vh));
      const revealT = easeIO(approach);

      if (head) {
        const y = dockedY - Math.max(wrapTop, 0);   // hold docked during pre-pin glide
        head.style.transform = `translateY(${y}px) scale(${HEAD_SCALE})`;
        head.style.opacity = String(revealT);
      }

      // cards fade in once the section has actually pinned (scrolled > 0), so
      // they never slide up from below behind the heading. Then they advance
      // HORIZONTALLY (filmstrip — no crossfade).
      stage.style.opacity = String(clamp(scrolled / (0.25 * vh)));
      const cardP = total > 0 ? clamp(scrolled / total) : 0;
      const f = cardP * (n - 1);
      const SPACING = 80; // vw between card centres → slight overlap, no centre gap
      cards.forEach((card, i) => {
        const d = f - i;            // 0 = centred/active, <0 next (right), >0 past (left)
        const ad = Math.abs(d);
        card.style.opacity = ad < 1.5 ? '1' : '0';   // solid slides, no crossfade
        card.style.transform = `translate(-50%, -50%) translateX(${-d * SPACING}vw)`;
        card.style.zIndex = String(Math.round(100 - ad * 10));
        card.style.pointerEvents = ad < 0.5 ? 'auto' : 'none';
      });

      const active = clamp(Math.round(f), 0, n - 1);
      const dots = dotsRef.current?.children;
      if (dots) for (let i = 0; i < dots.length; i++) dots[i].classList.toggle('on', i === active);
    };

    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(render); };
    render();
    const t = setTimeout(render, 200); // re-measure after fonts/layout
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
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

        /* ── Signature ── */
        .about-signoff {
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0;
          font-size: clamp(1.05rem, 1.5vw, 1.3rem); letter-spacing: 0.09em; text-transform: uppercase;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 0 14px rgba(245,199,61,0.28));
        }
        .about-signoff .amp {
          -webkit-text-fill-color: rgba(250,244,236,0.55); color: rgba(250,244,236,0.55);
          font-weight: 400; text-transform: lowercase; font-size: 0.78em; letter-spacing: 0.04em; padding: 0 0.18em;
          filter: none;
        }
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

        /* ===== PC PINNED CINEMATIC REVEAL ===== */
        /* ── Star Wars opening crawl (all viewports) ── */
        .swcrawl { position: relative; z-index: 2; }
        .swcrawl-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; }
        .op-hero { position: absolute; inset: 0; display: flex; flex-direction: column; will-change: opacity, transform; }

        /* ── Opening SCROLL cue (clean dark screen before the crawl) ── */
        .scroll-intro {
          flex: 1; min-height: 0; position: relative;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: clamp(8px, 1.4vh, 16px); text-align: center; padding: 0 24px;
        }
        .origin-title {
          /* size matched to Religion .codex-headline (the larger hero heading) so
             the main title is identical across pages. Mobile overridden below. */
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0; line-height: 1.02;
          text-transform: uppercase; letter-spacing: 0.1em; padding-left: 0.1em;
          font-size: clamp(2.85rem, 6.84vw, 5.32rem);
          background: linear-gradient(135deg, #F5C73D 0%, #FFB840 38%, #E69E1A 70%, #F5C73D 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 0 26px rgba(245,199,61,0.42)) drop-shadow(0 0 7px rgba(230,158,26,0.5));
        }
        .origin-sub {
          font-family: 'Cinzel', serif; font-weight: 400; margin: 0; text-transform: uppercase;
          font-size: clamp(0.8rem, 1.5vw, 1.05rem); letter-spacing: 0.34em; padding-left: 0.34em;
          color: rgba(250,244,236,0.62);
        }
        .scroll-cue { display: flex; flex-direction: column; align-items: center; color: #E6B84A; margin-top: clamp(10px, 2.2vh, 22px); }
        .scroll-cue svg { display: block; margin-top: -18px; opacity: 0.32; filter: drop-shadow(0 0 10px rgba(230,184,74,0.6)); animation: scrollCue 1.6s ease-in-out infinite; }

        /* ── Flanking figures (Matej left, Hekthor right) with warm halo ── */
        .about-fig {
          position: absolute; bottom: 0; z-index: 1; pointer-events: none;
          height: 64vh; display: flex; align-items: flex-end; justify-content: center;
        }
        .about-fig img { height: 100%; width: auto; object-fit: contain; display: block;
          filter: drop-shadow(0 10px 44px rgba(0,0,0,0.75)); }
        .about-fig::before {
          content: ''; position: absolute; left: 50%; bottom: 6%; transform: translateX(-50%);
          width: 118%; aspect-ratio: 1 / 1; border-radius: 50%; z-index: -1;
          background: radial-gradient(circle, rgba(201,154,63,0.30) 0%, rgba(201,154,63,0.10) 42%, transparent 70%);
          filter: blur(6px);
        }
        /* Inner edge pinned to a fixed viewport fraction (NOT fixed px) so the
           centre column (32vw–68vw) stays clear for the title at ANY width.
           Anchor each figure to the OUTER edge (natural width, NO clamp → no
           squish, image keeps aspect + sits on the bottom edge) then translate
           so the inner edge lands on 32vw / 68vw; the outer arm bleeds off.
           (NB: anchoring via right:68vw+width:auto clamped the box to 32vw and
           squished the photo + lifted it off the floor → use transform.) */
        /* Matej = exact MIRROR of Hekthor (same height + mirrored anchor) so he
           behaves identically at every width. A bigger figure shows a smaller
           fraction of itself inside the fixed 32vw on-screen slice → his face
           got cut at narrow widths while Hekthor (smaller) stayed whole. Equal
           size → equal visible fraction → both read cleanly, symmetrically. */
        .fig-matej { left: 0; right: auto; transform: translateX(calc(32vw - 100% + 200px)); height: min(73.75vh, 781px); }
        .fig-hekthor { right: 0; left: auto; transform: translateX(calc(100% - 32vw)); height: min(59vh, 625px); }

        /* PC: lift the title block toward the upper third */
        @media (min-width: 768px) { .scroll-intro { padding-bottom: 18vh; } }

        /* ── Clickable skip — 150px from the bottom edge ── */
        .about-skip {
          position: absolute; left: 50%; bottom: 64px; transform: translateX(-50%);
          z-index: 5; pointer-events: auto; cursor: pointer; background: none; border: none;
          font-family: 'Cinzel', serif; font-weight: 400; text-transform: uppercase;
          letter-spacing: 0.28em; padding-left: 0.28em;
          font-size: clamp(0.66rem, 1.1vw, 0.78rem); color: rgba(250,244,236,0.42);
          transition: color 0.25s ease;
        }
        .about-skip:hover { color: #E6B84A; }
        .about-skip { text-shadow: 0 1px 8px rgba(0,0,0,0.8); }

        @media (max-width: 767px) {
          /* lift the whole text block (title+sub+arrows) to the same start
             height as the Religion hero (~181px from top) instead of centering */
          .scroll-intro { justify-content: flex-start; padding-top: 92px; }
          /* skip flows under the arrows (visible) instead of behind the figures */
          .about-skip { position: static; transform: none; left: auto; bottom: auto; margin-top: 14px; }
          .origin-title { font-size: clamp(2.2rem, 11vw, 3.4rem); }
          .fig-matej { height: 46vh; left: -58px; right: auto; transform: none; opacity: 0.92; }
          .fig-hekthor { height: 30vh; right: 4px; left: auto; transform: none; opacity: 0.92; }
        }
        .scroll-cue svg:nth-child(1) { animation-delay: 0s; }
        .scroll-cue svg:nth-child(2) { animation-delay: 0.18s; }
        .scroll-cue svg:nth-child(3) { animation-delay: 0.36s; }
        @keyframes scrollCue { 0%, 100% { opacity: 0.38; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .scroll-cue svg { animation: none; opacity: 0.55; } }

        /* ── Outro hero (moved to the very bottom of the page) ── */
        .about-outro {
          position: relative; z-index: 2;
          display: flex; align-items: center; justify-content: center;
          padding: clamp(56px, 12vh, 130px) 20px;
        }

        .sw-intro {
          position: absolute; left: 50%; top: 40%; transform: translate(-50%, -50%); pointer-events: none;
          margin: 0; width: min(86vw, 760px); text-align: center; opacity: 0;
          color: #D9A2FF; font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(1.05rem, 2.2vw, 1.6rem); line-height: 1.5;
          text-shadow: 0 0 7px #C77DFF, 0 0 18px rgba(188,92,255,0.85), 0 0 38px rgba(160,60,255,0.55);
          will-change: opacity;
        }
        .sw-logo {
          position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(1);
          width: min(72vw, 720px); height: auto; opacity: 0; pointer-events: none;
          filter: drop-shadow(0 0 50px rgba(201,154,63,0.45)); will-change: transform, opacity;
        }
        .sw-stage {
          position: absolute; inset: 0; overflow: hidden; pointer-events: none;
          perspective: 320px; perspective-origin: 50% 0%;
          -webkit-mask-image: linear-gradient(to top, #000 14%, rgba(0,0,0,0.92) 34%, transparent 76%);
          mask-image: linear-gradient(to top, #000 14%, rgba(0,0,0,0.92) 34%, transparent 76%);
        }
        .sw-crawl-text {
          position: absolute; left: 50%; bottom: 0; width: min(92vw, 720px);
          transform-origin: 50% 100%;
          transform: translateX(-50%) rotateX(28deg) translateY(92vh); opacity: 0;
          color: #F5C73D; font-family: 'Cinzel', serif; text-align: justify;
          text-shadow: 0 0 26px rgba(245,199,61,0.22); will-change: transform;
        }
        .sw-crawl-text .sw-episode {
          text-align: center; text-transform: uppercase; letter-spacing: 0.4em;
          font-size: clamp(0.9rem, 1.6vw, 1.15rem); margin: 0 0 0.4em; opacity: 0.85;
        }
        .sw-crawl-text .sw-ctitle {
          text-align: center; text-transform: uppercase; font-weight: 700;
          font-size: clamp(2.2rem, 6vw, 4rem); margin: 0 0 8vh; letter-spacing: 0.04em;
        }
        .sw-crawl-text p:not(.sw-episode) {
          font-size: clamp(1.15rem, 2.3vw, 1.7rem); line-height: 1.55; font-weight: 700; margin: 0 0 4vh;
        }

        .hpin { display: none; }
        @media (min-width: 768px) {
          .hpin { display: block; position: relative; z-index: 2; }  /* height inline = (N+1)×100vh */
          .hpin-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; }

          .hpin-head {
            position: absolute; left: 0; right: 0; top: 0; padding-top: 4vh;
            text-align: center; z-index: 50; pointer-events: none;
            transform-origin: center top; will-change: transform;
          }
          .hpin-head .tl-h2 { margin: 0; }

          /* stage fills the viewport; cards are stacked + centred, driven by JS */
          .hpin-stage { position: absolute; inset: 0; opacity: 0; }

          .hcard {
            position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%);
            width: min(1040px, 86vw); will-change: transform, opacity;
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
          .hcard-photo img {
            width: 100%; height: 100%; object-fit: cover; display: block;
            animation: kenburns 16s ease-in-out infinite alternate;
          }
          @keyframes kenburns { 0% { transform: scale(1); } 100% { transform: scale(1.08); } }
          .hcard-text { flex: 1 1 auto; min-width: 0; }
          .hcard-text .tl-year { font-size: 0.8rem; margin-bottom: 16px; }
          .hcard-text .tl-title { font-size: clamp(1.6rem, 2.7vw, 2.3rem); margin-bottom: 16px; }
          .hcard-text .tl-text { font-size: clamp(0.98rem, 1.2vw, 1.12rem); line-height: 1.7; max-width: 560px; }

          .hpin-dots { position: absolute; left: 0; right: 0; bottom: clamp(26px, 5vh, 52px); justify-content: center; display: flex; gap: 9px; z-index: 50; }
          .hpin-dot { width: 8px; height: 8px; border-radius: 999px; background: rgba(201,154,63,0.3); transition: width .35s ease, background .35s ease; }
          .hpin-dot.on { width: 26px; background: #C99A3F; }

          @media (prefers-reduced-motion: reduce) { .hcard-photo img { animation: none; } }
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

      {/* Scroll-driven darken (covers the whole viewport, incl. hero) — fades the
          hero into the dark before the Star Wars crawl begins. */}
      <div
        ref={swDarkRef}
        aria-hidden
        style={{ position: 'fixed', inset: 0, background: '#000', opacity: 0, zIndex: 1, pointerEvents: 'none' }}
      />

      {/* ───────── OPENING — hero dissolve → Star Wars crawl (single sticky pin) ───────── */}
      <section className="swcrawl" ref={crawlRef} style={{ height: '560vh' }}>
        <div className="swcrawl-sticky">
          <div ref={heroRef} className="op-hero">
        <PageTopBar withNav />

        {/* Figures flank the opening (Religion-style bleed): Matej left, Hekthor
            right. Both transparent cutouts on a warm gold halo so the (black) dog
            reads against the dark page. They fade out with the hero on scroll. */}
        <div className="about-fig fig-matej" aria-hidden>
          <img src="/images/about-matej.png" alt="" />
        </div>
        <div className="about-fig fig-hekthor" aria-hidden>
          <img src="/images/about-hekthor.png" alt="" />
        </div>

        {/* Opening = clean dark screen + a single SCROLL cue. Scrolling dissolves
            this (handled by heroRef fade) → darken → purple intro → crawl. */}
        {/* Centered, thin band: big title + small slide cue. No body copy. */}
        <div className="scroll-intro" style={{ zIndex: 3 }}>
          <h1 className="origin-title">The<br />Origin</h1>
          <p className="origin-sub">Slide and read</p>
          <div className="scroll-cue" aria-hidden>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          {/* Clickable skip — desktop: low on screen (absolute); mobile: under the arrows (static). */}
          <button type="button" className="about-skip" onClick={skipIntro}>
            or skip
          </button>
        </div>
          </div>

          <p className="sw-intro" ref={swIntroRef}>{CRAWL_INTRO}</p>
          <img className="sw-logo" ref={swLogoRef} src="/images/dogypt-gold-logo.png" alt="DOGYPT" />
          <div className="sw-stage">
            <div className="sw-crawl-text" ref={swTextRef}>
              <p className="sw-episode">Episode I</p>
              <h2 className="sw-ctitle">A New Faith</h2>
              {CRAWL_PARAS.map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── TIMELINE — PC: pinned cinematic reveal ───────────── */}
      <section className="hpin" style={{ height: `${(MILESTONES.length + 1) * 100}vh` }} ref={pinRef}>
        <div className="hpin-sticky">
          <div className="hpin-head">
            <h2 className="tl-h2">The Story of Dogypt</h2>
          </div>
          <div className="hpin-stage" ref={trackRef}>
            {MILESTONES.map((m) => (
              <article key={m.id} className="hcard">
                <div className="hcard-photo">
                  <img src={m.imageUrl} alt={m.tag}
                    onError={(e) => { const t = e.currentTarget; t.onerror = null; t.src = ph(); }} />
                </div>
                <div className="hcard-text">
                  <span className="tl-year">{m.year}</span>
                  <h3 className="tl-title">{m.title}</h3>
                  <p className="tl-text">{m.body}</p>
                </div>
              </article>
            ))}
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

      {/* ───────── OUTRO HERO — moved to the very bottom (Matej 2026-06-09):
          page opens on a clean SCROLL screen, the personal hero lands last. ───────── */}
      <section className="about-outro">
        <div className="hero-grid">
          <div className="flex flex-col" style={{ gap: 'clamp(16px, 2.6vh, 24px)' }}>
            <div className="flex flex-col" style={{ gap: '10px' }}>
              <h1 className="about-quote"><span className="aq-white">It Was Never</span> “Just a Dog.”</h1>
            </div>
            <div className="hero-intro">
              <p>You already know the feeling…</p>
              <p>That a dog isn't something you own — it's <strong>someone you love</strong>. Now imagine that love organized. Connected. <strong>Powerful enough to change things.</strong></p>
              <p>And that's why <strong>DOGYPT</strong> exists.</p>
            </div>
            <p className="about-signoff">Matej <span className="amp">and</span> Hekthor</p>
          </div>

          <div className="hero-photo" aria-label="Matej and Hekthor">
            <img src="/images/email-pic-matej-hektor.png" alt="Matej and Hekthor" />
          </div>
        </div>
      </section>
    </div>
  );
}
