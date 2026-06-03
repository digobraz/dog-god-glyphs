import { useRef, useState, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Link } from 'react-router-dom';
import dogyptSeal from '@/assets/dogypt-seal.png';
import { SACRED_INDEX } from '@/data/sacredIndex.generated';

// ════════════════════════════════════════════════════════════════════════
// 🔒 DESKTOP / PC LAYOUT LOCKED 2026-06-03 (Matej OK).
//   Zamknuté: CTA spread3 nudge (±25px) + nadpisy clamp(18.7px,2.64vw,34px),
//   ľavý pod "Sign up for the dog religion…", "Full Constitution" btn,
//   mouse swipe (onPtr*) + trackpad wheel (useEffect) + flip glitch fix
//   (clip-path:inset(7.5% 0 8% 0) na .cb-bookwrap).
//   NEMENIŤ desktop bez Matejovho OK. Aktívne ladenie = LEN @media(max-width:767px).
// ════════════════════════════════════════════════════════════════════════
// Posledný slide RELIGION = interaktívna Constitution kniha.
// Zatvorená DOGMA obálka jemne žiari (navádza na klik) → klik = CROSSFADE na
//   otvorenú knihu (žiadne preklápanie obálky) → listovateľné strany (page-curl)
//   s 12 kapitolami → posledná dvojstránka = CTA.
// Mechanizmus listovania: react-pageflip (StPageFlip). Cover = vlastný overlay.

const Book = HTMLFlipBook as unknown as React.ComponentType<Record<string, unknown>>;
const RATIO = 0.665; // šírka/výška jednej strany

function calcDims() {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const mobile = vw < 768;
  if (mobile) {
    let h = vh * 0.60;
    let w = h * RATIO;
    const maxW = vw * 0.90;
    if (w > maxW) { w = maxW; h = w / RATIO; }
    return { w: Math.round(w), h: Math.round(h), mobile };
  }
  let h = Math.min(vh * 0.76, 840);
  let w = h * RATIO;
  const maxSpread = Math.min(vw * 0.82, 1180);
  if (2 * w > maxSpread) { w = maxSpread / 2; h = w / RATIO; }
  return { w: Math.round(w), h: Math.round(h), mobile };
}

const CHAPTER_PAGES = [
  SACRED_INDEX.slice(0, 6),
  SACRED_INDEX.slice(6, 12),
];

function ChapterList({ rows }: { rows: typeof SACRED_INDEX }) {
  return (
    <ul className="cb-chapters">
      {rows.map((r) => (
        <li key={r.num} className="cb-chapter">
          <span className="cb-ch-num">{r.num}</span>
          <span className="cb-ch-text">
            <span className="cb-ch-name">{r.name}</span>
            <span className="cb-ch-desc">{r.desc}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function ConstitutionBook() {
  const bookRef = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void } } | null>(null);
  const [opened, setOpened] = useState(false);
  const [page, setPage] = useState(0);
  const [dims, setDims] = useState(calcDims);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(t); t = setTimeout(() => setDims(calcDims()), 180); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t); };
  }, []);

  const onFlip = useCallback((e: { data: number }) => setPage(e.data), []);
  const flip = (dir: 'next' | 'prev') => {
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    dir === 'next' ? api.flipNext() : api.flipPrev();
  };

  // StPageFlip vyhodnocuje swipe-flick LEN pre touch (changedTouches), nie pre myš.
  // Vlastný mouse/trackpad swipe → flip; touch necháme na StPageFlip (inak dvojflip).
  const swipe = useRef<{ x: number; y: number; t: number } | null>(null);
  const onPtrDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if ((e.target as HTMLElement).closest('a,button')) return;
    swipe.current = { x: e.clientX, y: e.clientY, t: e.timeStamp };
  };
  const onPtrUp = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !swipe.current) return;
    const dx = e.clientX - swipe.current.x;
    const dy = e.clientY - swipe.current.y;
    const dt = e.timeStamp - swipe.current.t;
    swipe.current = null;
    if (Math.abs(dx) > 45 && Math.abs(dy) < 90 && dt < 600) flip(dx < 0 ? 'next' : 'prev');
  };

  // Dvojprstový trackpad slide = horizontálny wheel (deltaX), NIE pointer drag.
  // Natívny listener s {passive:false} → preventDefault zastaví browser back/forward swipe.
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let lock = false;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertikál = nech scrolluje
      e.preventDefault();
      if (lock || Math.abs(e.deltaX) < 24) return;
      lock = true;
      flip(e.deltaX > 0 ? 'next' : 'prev');
      setTimeout(() => { lock = false; }, 780);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spreadW = dims.mobile ? dims.w : dims.w * 2;

  return (
    <div className={`cb-wrap ${opened ? 'cb-open' : 'cb-closed'}`}>
      <style>{CSS}</style>

      <div className="cb-stage" style={{ width: spreadW, height: dims.h }}>
        {/* OPEN BOOK (flipbook) — pod coverom, crossfade po otvorení */}
        <div className="cb-bookwrap" ref={wrapRef} onPointerDown={onPtrDown} onPointerUp={onPtrUp}>
          <Book
            ref={bookRef}
            key={`${dims.w}x${dims.h}`}
            className="cb-book"
            width={dims.w}
            height={dims.h}
            size="fixed"
            minWidth={dims.w}
            maxWidth={dims.w}
            minHeight={dims.h}
            maxHeight={dims.h}
            maxShadowOpacity={0.4}
            drawShadow
            flippingTime={750}
            showCover={false}
            usePortrait
            mobileScrollSupport={false}
            useMouseEvents
            swipeDistance={18}
            showPageCorners
            clickEventForward={['a', 'button']}
            startZIndex={5}
            onFlip={onFlip}
          >
            {/* 0 — SEAL (left) */}
            <div className="cb-page cb-left">
              <div className="cb-content cb-seal-page">
                <img src={dogyptSeal} alt="The Dogyptian seal" className="cb-seal-big" />
              </div>
            </div>

            {/* 1 — TITLE (right) */}
            <div className="cb-page cb-right">
              <div className="cb-content cb-title-page">
                <h2 className="cb-title">
                  <span>The</span>
                  <span className="cb-title-brand">Dogypt</span>
                  <span>Constitution</span>
                </h2>
                <p className="cb-trust">In Dog We Trust</p>
                <p className="cb-sub">Required reading for every doglover to become a Dogyptian.</p>
              </div>
            </div>

            {/* 2 — Chapters I–VI (left) */}
            <div className="cb-page cb-left">
              <div className="cb-content cb-index-page"><ChapterList rows={CHAPTER_PAGES[0]} /></div>
            </div>

            {/* 3 — Chapters VII–XII (right) */}
            <div className="cb-page cb-right">
              <div className="cb-content cb-index-page"><ChapterList rows={CHAPTER_PAGES[1]} /></div>
            </div>

            {/* 4 — CTA join (left) */}
            <div className="cb-page cb-left">
              <div className="cb-content cb-cta-page">
                <p className="cb-cta-kicker">The Path Begins</p>
                <h3 className="cb-cta-head">Join the<br />Religion</h3>
                <p className="cb-cta-text">Sign up for the dog religion — take a heroglyph.</p>
                <Link to="/heroglyph" className="cb-cta-btn">Become Dogyptian</Link>
              </div>
            </div>

            {/* 5 — CTA read full (right) */}
            <div className="cb-page cb-right">
              <div className="cb-content cb-cta-page">
                <p className="cb-cta-kicker">The Whole Word</p>
                <h3 className="cb-cta-head">Read the<br />Constitution</h3>
                <p className="cb-cta-text">Every canon, credo and commandment — in full.</p>
                <a href="https://dogyptism.dogypt.com" target="_blank" rel="noreferrer" className="cb-cta-btn cb-cta-ghost">Full Constitution</a>
              </div>
            </div>
          </Book>
        </div>

        {/* CLOSED COVER overlay — crossfade out po kliku */}
        <button
          type="button"
          className="cb-cover-layer"
          onClick={() => !opened && setOpened(true)}
          aria-label="Open the Constitution"
          tabIndex={opened ? -1 : 0}
        >
          <span className="cb-halo" aria-hidden />
          <img src="/images/dogma-cover.png" alt="The Dogyptian Constitution" className="cb-cover-img" style={{ height: dims.h }} />
          <span className="cb-shimmer" aria-hidden />
        </button>
      </div>

      {/* hint / nav */}
      {!opened ? (
        <button type="button" className="cb-hint" onClick={() => setOpened(true)}>
          <span className="cb-hint-dot" /> Tap the book to open
        </button>
      ) : (
        <div className="cb-nav">
          <button
            type="button"
            className={`cb-arrow ${page === 0 ? 'cb-arrow-close' : ''}`}
            onClick={() => (page === 0 ? setOpened(false) : flip('prev'))}
            aria-label={page === 0 ? 'Close book' : 'Previous page'}
            title={page === 0 ? 'Close book' : 'Previous page'}
          >
            {page === 0 ? '✕' : '‹'}
          </button>
          <button type="button" className="cb-arrow" onClick={() => flip('next')} disabled={page >= 4} aria-label="Next page">›</button>
        </div>
      )}
    </div>
  );
}

const CSS = `
.cb-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(12px,2.2vh,24px);width:100%;height:100%;}
.cb-stage{position:relative;flex:0 0 auto;max-width:100%;}

/* crossfade vrstvy */
.cb-bookwrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  opacity:0;transition:opacity .85s ease;pointer-events:none;
  /* orež prečnievanie listu pri prevracaní presne po pokojovú hranu knihy
     (page PNG má hore 7.5% / dole 8% priehľadný okraj → tam list pri curl-e vykúkal) */
  clip-path:inset(7.5% 0 8% 0);}
.cb-open .cb-bookwrap{opacity:1;pointer-events:auto;}
.cb-book{margin:0 auto;}

.cb-cover-layer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  background:none;border:none;padding:0;cursor:pointer;z-index:6;
  opacity:1;transition:opacity .85s ease,transform .85s ease;}
.cb-closed .cb-cover-layer:hover{transform:scale(1.015);}
.cb-closed .cb-cover-layer:hover .cb-halo{animation-play-state:paused;opacity:.8;filter:blur(48px);width:88%;height:102%;
  background:radial-gradient(ellipse at center,rgba(201,154,63,.72),rgba(168,85,247,.24) 56%,rgba(168,85,247,0) 76%);}
.cb-open .cb-cover-layer{opacity:0;transform:scale(.985);pointer-events:none;}
.cb-cover-img{width:auto;max-width:100%;object-fit:contain;display:block;position:relative;z-index:1;
  filter:drop-shadow(0 10px 30px rgba(0,0,0,.55));}

/* mäkké halo (len opacity+scale pulz → bez sekania) */
.cb-halo{position:absolute;left:50%;top:50%;width:74%;height:90%;transform:translate(-50%,-50%);
  border-radius:16px;z-index:0;pointer-events:none;filter:blur(38px);opacity:.45;
  background:radial-gradient(ellipse at center,rgba(201,154,63,.55),rgba(168,85,247,.16) 56%,rgba(168,85,247,0) 74%);
  animation:cbHalo 6.5s ease-in-out infinite;
  transition:opacity .4s ease,filter .4s ease,width .4s ease,height .4s ease,background .4s ease;}
.cb-open .cb-halo{animation:none;opacity:0;transition:opacity .6s ease;}
@keyframes cbHalo{0%,100%{opacity:.4;transform:translate(-50%,-50%) scale(1);}50%{opacity:.66;transform:translate(-50%,-50%) scale(1.04);}}

/* záblesk — svetelný pruh prejde po obálke (len transform → plynulé, maska statická) */
.cb-shimmer{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;overflow:hidden;
  -webkit-mask:url(/images/dogma-cover.png) center/contain no-repeat;mask:url(/images/dogma-cover.png) center/contain no-repeat;
  transition:opacity .5s ease;}
.cb-closed .cb-shimmer{opacity:1;}
.cb-shimmer::before{content:"";position:absolute;top:-25%;left:0;width:42%;height:150%;
  background:linear-gradient(105deg,rgba(255,249,224,0) 0%,rgba(255,249,224,.28) 50%,rgba(255,249,224,0) 100%);
  transform:translateX(-170%) rotate(6deg);animation:cbSweep 8s ease-in-out 1.6s infinite;}
@keyframes cbSweep{0%{transform:translateX(-170%) rotate(6deg);}40%,100%{transform:translateX(330%) rotate(6deg);}}
@media (prefers-reduced-motion:reduce){.cb-shimmer{display:none;}}

/* pages */
.cb-page{position:relative;background:transparent;overflow:hidden;}
.cb-left{background-image:url(/images/dogma-page-left.png);background-size:100% 100%;background-repeat:no-repeat;}
.cb-right{background-image:url(/images/dogma-page-right.png);background-size:100% 100%;background-repeat:no-repeat;}

/* ── Obsahový box = parchment safe-area (kožená väzba na vonkajšej strane).
   Tu sa ladí KDE môže text ísť. Každá strana má vlastnú page-triedu nižšie. ── */
/* Textová zóna = parchment plocha (odmeraná z PNG): väzba ~29% / chrbát ~14% /
   hore-dole ~12%. Symetrická cez chrbát. Obsah sa v nej centruje. */
.cb-content{position:absolute;inset:0;display:flex;flex-direction:column;color:#3a2204;font-family:'Cinzel',serif;}
.cb-left .cb-content{padding:12% 14% 12% 29%;}
.cb-right .cb-content{padding:12% 29% 12% 14%;}

/* ── strana 0: veľká pečať, centrovaná v zóne + nudge k chrbtu (vpravo) ── */
.cb-left .cb-seal-page{padding:11% 8% 11% 28%;transform:translateX(16px);}
.cb-seal-page{align-items:center;justify-content:center;}
.cb-seal-big{width:min(82%,210px);height:auto;opacity:.95;filter:drop-shadow(0 4px 12px rgba(90,58,12,.4));}

/* ── strana 1: nadpis + motto + body, centrované v zóne + nudge k chrbtu (vľavo) ── */
.cb-right .cb-title-page{padding:11% 28% 11% 8%;transform:translateX(-16px);}
.cb-title-page{align-items:center;justify-content:center;text-align:center;gap:5%;}
.cb-title{display:flex;flex-direction:column;gap:1px;margin:0;font-weight:700;line-height:1.1;font-size:clamp(20px,2.7vw,38px);}
.cb-title em{font-style:italic;color:#9a6a16;}
.cb-title-brand{font-size:1.5em;line-height:1;color:#9a6a16;letter-spacing:.01em;}
.cb-trust{margin:0;font-size:clamp(12px,1.5vw,18px);letter-spacing:.22em;text-transform:uppercase;color:#7a531a;}
.cb-sub{margin:0;font-family:'Inter',sans-serif;font-size:clamp(10px,1.15vw,14px);color:#6b4a18;max-width:26ch;line-height:1.45;}

/* ── strany 2-4: kapitoly — širšia zóna než titulná (dlhé názvy) ── */
.cb-left .cb-index-page{padding:12% 11% 12% 22%;transform:translateX(15px);}
.cb-right .cb-index-page{padding:12% 22% 12% 11%;transform:translateX(-30px);}
.cb-index-page{align-items:center;justify-content:center;gap:6%;}
.cb-page-head{font-size:clamp(12px,1.5vw,18px);letter-spacing:.16em;text-transform:uppercase;color:#7a531a;margin:0;text-align:center;}
.cb-chapters{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:clamp(5px,1.5vh,15px);align-self:center;width:max-content;max-width:100%;}
.cb-chapter{display:flex;align-items:baseline;gap:12px;}
.cb-ch-num{flex:0 0 auto;min-width:2.4em;font-weight:700;color:#9a6a16;font-size:clamp(11px,1.35vw,17px);text-align:right;}
.cb-ch-text{display:flex;flex-direction:column;line-height:1.14;align-items:flex-start;}
.cb-ch-name{font-weight:700;letter-spacing:.05em;font-size:clamp(13px,1.55vw,20px);color:#3a2204;white-space:nowrap;}
.cb-ch-desc{font-family:'Inter',sans-serif;font-style:italic;font-size:clamp(9px,1.05vw,13px);color:#6b4a18;text-align:left;}

/* ── strana 4-5: CTA, centrované — per-page nudge k stredu väzby ── */
.cb-cta-page{align-items:center;justify-content:center;text-align:center;gap:4%;}
.cb-left .cb-cta-page{transform:translateX(25px);}
.cb-right .cb-cta-page{transform:translateX(-25px);}
.cb-cta-kicker{margin:0;font-size:clamp(9px,1.1vw,13px);letter-spacing:.22em;text-transform:uppercase;color:#9a6a16;}
.cb-cta-head{margin:0;font-weight:700;line-height:1.05;font-size:clamp(18.7px,2.64vw,34px);color:#3a2204;}
.cb-cta-text{margin:0;font-family:'Inter',sans-serif;font-size:clamp(10px,1.15vw,14px);color:#6b4a18;max-width:22ch;line-height:1.45;}
.cb-cta-btn{margin-top:3%;display:inline-block;padding:.62em 1.5em;border-radius:8px;font-family:'Cinzel',serif;font-weight:700;font-size:clamp(11px,1.25vw,16px);letter-spacing:.04em;text-decoration:none;color:#2a1a06;background:linear-gradient(135deg,#F5C73D,#E69E1A);border:1px solid rgba(250,244,236,.30);box-shadow:0 4px 14px rgba(90,58,12,.35);transition:transform .18s ease,box-shadow .18s ease;}
.cb-cta-btn:hover{transform:translateY(-2px);box-shadow:0 7px 20px rgba(90,58,12,.45);}
.cb-cta-link{font-family:'Cinzel',serif;font-size:clamp(10px,1.1vw,13px);letter-spacing:.06em;text-transform:uppercase;color:#7a531a;text-decoration:none;border-bottom:1px solid rgba(122,83,26,.4);padding-bottom:1px;transition:color .18s ease,border-color .18s ease;}
.cb-cta-link:hover{color:#9a6a16;border-color:rgba(154,106,22,.7);}

/* hint */
.cb-hint{display:inline-flex;align-items:center;gap:9px;background:none;border:none;cursor:pointer;
  font-family:'Cinzel',serif;font-size:clamp(11px,1.4vw,15px);letter-spacing:.13em;text-transform:uppercase;
  color:#C99A3F;padding:6px 4px;animation:cbHint 2.6s ease-in-out infinite;}
.cb-hint-dot{width:7px;height:7px;border-radius:50%;background:#C99A3F;box-shadow:0 0 10px rgba(201,154,63,.7);}
@keyframes cbHint{0%,100%{opacity:.55;}50%{opacity:1;}}

/* nav */
.cb-nav{display:flex;gap:18px;}
.cb-arrow{width:42px;height:42px;border-radius:50%;border:1px solid rgba(201,154,63,.45);background:rgba(201,154,63,.06);
  color:#C99A3F;font-size:22px;line-height:1;cursor:pointer;transition:background .18s ease,transform .18s ease;}
.cb-arrow:hover:not(:disabled){background:rgba(201,154,63,.16);transform:translateY(-1px);}
.cb-arrow:disabled{opacity:.3;cursor:default;}
.cb-arrow-close{font-size:15px;}

@media (prefers-reduced-motion:reduce){
  .cb-halo,.cb-hint{animation:none;}
}
@media (max-width:767px){
  .cb-left .cb-content{padding:12% 10% 12% 17%;}
  .cb-right .cb-content{padding:12% 17% 12% 10%;}
}
`;
