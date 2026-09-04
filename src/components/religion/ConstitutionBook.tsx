import { useRef, useState, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Link } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { markConstitutionOpened } from '@/lib/constitutionRead';
import dogyptSeal from '@/assets/dogypt-seal.webp';
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
    // Mobile (2026-06-03): celá dvojstrana ako na PC — fit do šírky, 10px po stranách.
    const side = 10;
    let w = (vw - 2 * side) / 2;     // per-page → spread = vw - 20px
    let h = w / RATIO;
    const maxH = vh * 0.72;          // vertikálny strop (nad hint/nav pod knihou)
    if (h > maxH) { h = maxH; w = h * RATIO; }
    return { w: Math.round(w), h: Math.round(h), mobile };
  }
  // Pôvodné stropy (2026-07-08 vrátené): kniha bola „malá" kvôli Chrome flex-img height
  // bugu (rieši min-height na cover), NIE kvôli dims — zväčšovanie dims/scale robilo knihu
  // priveľkú a nadpis „The Bible…" nad ňou narážal do knihy. Držíme pôvodnú clearance.
  let h = Math.min(vh * 0.70, 800);
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
  const t = useT();
  // Kapitola má DVE polia a prekladá sa LEN jedno: NÁZOV (CANON, CREDO, …) je
  // kánonický pojem DOGMY a ostáva rovnaký vo všetkých jazykoch, POPISOK je
  // obyčajná veta a musí hovoriť jazykom čitateľa.
  // ⚠️ Dáta sú v `src/data/sacredIndex.generated.ts` (AUTO-GENERATED — needituj
  //    ho ručne). Slovník ho preto PREBÍJA a EN hodnoty kľúčov sú s ním zhodné;
  //    keď kľúč chýba, `t()` vráti sám kľúč, tak padáme späť na dataset.
  // ⚠️ Kľúč je PORADOVÉ ČÍSLO, nie `r.num` — to je „I.\" a bodka by rozsekla
  //    plochý dotted kľúč slovníka.
  const desc = (r: (typeof SACRED_INDEX)[number]) => {
    const key = `religion.book.ch.${SACRED_INDEX.indexOf(r) + 1}.desc`;
    const v = t(key);
    return v === key ? r.desc : v;
  };
  return (
    <ul className="cb-chapters">
      {rows.map((r) => (
        <li key={r.num} className="cb-chapter">
          <span className="cb-ch-num">{r.num}</span>
          <span className="cb-ch-text">
            <span className="cb-ch-name">{r.name}</span>
            <span className="cb-ch-desc">{desc(r)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * `belowBook` = voliteľný uzol POD knihou, nad chipom „klikni a otvor".
 * Existuje kvôli `/onepage`, kde má nadpis („Biblia" pre psíčkarov) stáť pod
 * knihou a chip pod ním (Matej 28. 8. 2026) — nad knihou by ho zjedla horná
 * lišta filmu. Prop je aditívny: kto ho nepošle (živá `/religion`), dostane
 * presne to, čo doteraz. Slot je TU, a nie v ReligionLab, lebo chip sa kotví
 * cez `--cb-h`, ktoré žije na `.cb-wrap` — mimo neho by nadpis a chip nemali
 * spoločnú sústavu a museli by sa dopočítavať dvakrát.
 */
/**
 * `openOnMount` = kniha sa zjaví UŽ OTVORENÁ.
 * Prišlo to s tlačidlom „Read the Bible for dog lovers" na /onepage (Matej
 * 28. 8. 2026): keď človek klikne na „prečítaj si", nemá pristáť na zavretej
 * obálke a klikať druhýkrát. Tam, kde je kniha PREDMETOM (pätička filmu,
 * /religion-lab), ostáva zavretá — otvorenie je tam súčasť objavu.
 * Aditívne, default false ⇒ existujúce miesta sa nemenia.
 */
export default function ConstitutionBook({ belowBook, openOnMount = false }: { belowBook?: React.ReactNode; openOnMount?: boolean } = {}) {
  const t = useT();
  const bookRef = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void } } | null>(null);
  const [opened, setOpened] = useState(openOnMount);
  const [page, setPage] = useState(0);
  const [dims, setDims] = useState(calcDims);

  // Mark the Constitution as opened — drives the "Flip through the Constitution"
  // step in the /pack First Steps checklist (no DB signal for reading).
  useEffect(() => {
    if (opened) {
      markConstitutionOpened();
    }
  }, [opened]);

  // Prepočet rozmerov knihy. `useState(calcDims)` počíta iba raz pri mounte — ak sa to
  // trafí do okna, keď viewport ešte nie je ustálený (alebo sa okno neskôr zmení cez CDP,
  // ktorý NEVYVOLÁ window 'resize'), kniha zamrzne na malej hodnote a vykreslí sa ako
  // drobná ikonka. ResizeObserver na <html> fírne aj po mounte (garantovaný re-measure po
  // layoute) aj pri akejkoľvek zmene viewportu → robustné naprieč prostrediami (2026-07-08).
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const recalc = () => { clearTimeout(t); t = setTimeout(() => setDims(calcDims()), 120); };
    const ro = new ResizeObserver(recalc);
    ro.observe(document.documentElement);
    window.addEventListener('resize', recalc);        // orientationchange / fallback
    recalc();                                         // istota: prepočet hneď po mounte
    return () => { ro.disconnect(); window.removeEventListener('resize', recalc); clearTimeout(t); };
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

  const spreadW = dims.w * 2;

  return (
    <div
      className={`cb-wrap ${opened ? 'cb-open' : 'cb-closed'}`}
      style={{ '--cb-h': `${dims.h}px` } as React.CSSProperties}
    >
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
            usePortrait={!dims.mobile}
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
                <img src={dogyptSeal} alt={t('religion.book.sealAlt')} className="cb-seal-big" />
              </div>
            </div>

            {/* 1 — TITLE (right) */}
            <div className="cb-page cb-right">
              <div className="cb-content cb-title-page">
                <h2 className="cb-title">
                  <span>{t('religion.book.titleThe')}</span>
                  <span className="cb-title-brand">{t('religion.book.titleBrand')}</span>
                  <span>{t('religion.book.titleConstitution')}</span>
                </h2>
                <p className="cb-trust">{t('religion.book.trust')}</p>
                <p className="cb-sub">{t('religion.book.sub')}</p>
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
                <p className="cb-cta-kicker">{t('religion.book.cta1.kicker')}</p>
                <h3 className="cb-cta-head" dangerouslySetInnerHTML={{ __html: t('religion.book.cta1.head') }} />
                <p className="cb-cta-text">{t('religion.book.cta1.text')}</p>
                <Link to="/entry" className="cb-cta-btn">{t('religion.book.cta1.btn')}</Link>
              </div>
            </div>

            {/* 5 — CTA read full (right) */}
            <div className="cb-page cb-right">
              <div className="cb-content cb-cta-page">
                <p className="cb-cta-kicker">{t('religion.book.cta2.kicker')}</p>
                <h3 className="cb-cta-head" dangerouslySetInnerHTML={{ __html: t('religion.book.cta2.head') }} />
                <p className="cb-cta-text">{t('religion.book.cta2.text')}</p>
                <a href="https://dogma.dogypt.com" target="_blank" rel="noreferrer" className="cb-cta-btn cb-cta-ghost">{t('religion.book.cta2.btn')}</a>
              </div>
            </div>
          </Book>
        </div>

        {/* CLOSED COVER overlay — crossfade out po kliku */}
        <button
          type="button"
          className="cb-cover-layer"
          onClick={() => !opened && setOpened(true)}
          aria-label={t('religion.book.coverOpenAria')}
          tabIndex={opened ? -1 : 0}
        >
          <span className="cb-halo" aria-hidden />
          {/* minHeight = height: Chrome (150+) ignoruje `height` na <img> flex-item vo flex
              kontajneri (kniha sa scvrkla na ~8%), ale rešpektuje min-height. 2026-07-08. */}
          <img src="/images/dogma-cover.png" alt={t('religion.book.coverAlt')} className="cb-cover-img" style={{ height: dims.h, minHeight: dims.h }} />
          <span className="cb-shimmer" aria-hidden />
        </button>
      </div>

      {belowBook}

      {/* hint / nav */}
      {!opened ? (
        <button type="button" className="cb-hint" onClick={() => setOpened(true)}>
          <span className="cb-hint-dot" /> {t('religion.book.hint')}
        </button>
      ) : (
        <div className="cb-nav">
          <button
            type="button"
            className={`cb-arrow ${page === 0 ? 'cb-arrow-close' : ''}`}
            onClick={() => (page === 0 ? setOpened(false) : flip('prev'))}
            aria-label={page === 0 ? t('religion.book.close') : t('religion.book.prevPage')}
            title={page === 0 ? t('religion.book.close') : t('religion.book.prevPage')}
          >
            {page === 0 ? '✕' : '‹'}
          </button>
          <button type="button" className="cb-arrow" onClick={() => flip('next')} disabled={page >= 4} aria-label={t('religion.book.nextPage')}>›</button>
        </div>
      )}

      {/* Mobile only: CTA tlačidlá poslednej dvojstrany vytiahnuté POD knihu, pod seba.
          In-page verzia je na mobile skrytá cez CSS (.cb-cta-page .cb-cta-btn). */}
      {dims.mobile && opened && page >= 4 && (
        <div className="cb-mobile-cta">
          <Link to="/entry" className="cb-cta-btn">{t('religion.book.cta1.btn')}</Link>
          <a href="https://dogma.dogypt.com" target="_blank" rel="noreferrer" className="cb-cta-btn cb-cta-ghost">{t('religion.book.cta2.btn')}</a>
        </div>
      )}
    </div>
  );
}

const CSS = `
.cb-wrap{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(12px,2.2vh,24px);width:100%;height:100%;}
.cb-stage{position:relative;flex:0 0 auto;max-width:100%;}

/* crossfade vrstvy */
.cb-bookwrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  opacity:0;transition:opacity .85s ease;pointer-events:none;
  /* orež prečnievanie listu pri prevracaní presne po pokojovú hranu knihy
     (page PNG má hore 7.5% / dole 8% priehľadný okraj → tam list pri curl-e vykúkal) */
  clip-path:inset(7.5% 0 8% 0);}
.cb-open .cb-bookwrap{opacity:1;pointer-events:auto;}
.cb-book{margin:0 auto;}

/* PC (2026-06-03, Matej OK): kniha −15% (scale od stredu) aby bolo nad ňou vidno nadpis
   "The Bible for dog lovers". Scale = strany aj text sa zmenšia proporčne. Mobile má vlastný
   layout. (2026-07-08: scale sa NEZVYŠUJE — „malá kniha" bol Chrome flex-img height bug,
   rieši min-height na cover img, nie zväčšenie knihy — to len naráža nadpis do knihy.) */
@media (min-width:768px){
  .cb-stage{transform:scale(0.85);}
  /* "Tap the book to open" 15px pod VIZUÁLNYM spodkom knihy (box je väčší kvôli scale →
     absolútne cez --cb-h × 0.85, inak by hint visel priďaleko). Hint = len closed stav. */
  .cb-hint{position:absolute;left:50%;top:calc(50% + (var(--cb-h) * 0.85 / 2) + 15px);transform:translateX(-50%);}
}

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
.cb-title{display:flex;flex-direction:column;gap:1px;margin:0;font-weight:700;line-height:1.1;font-size:clamp(15px,2.05vw,29px);}
.cb-title em{font-style:italic;color:#9a6a16;}
.cb-title-brand{font-size:1.5em;line-height:1;color:#9a6a16;letter-spacing:.01em;}
.cb-trust{margin:0;font-size:clamp(10px,1.15vw,14px);letter-spacing:.22em;text-transform:uppercase;color:#7a531a;}
.cb-sub{margin:0;font-family:'Space Grotesk',sans-serif;font-size:clamp(8px,0.9vw,11px);color:#6b4a18;max-width:26ch;line-height:1.45;}

/* ── strany 2-4: kapitoly — širšia zóna než titulná (dlhé názvy) ── */
.cb-left .cb-index-page{padding:12% 11% 12% 22%;transform:translateX(15px);}
.cb-right .cb-index-page{padding:12% 22% 12% 11%;transform:translateX(-30px);}
.cb-index-page{align-items:center;justify-content:center;gap:6%;}
.cb-page-head{font-size:clamp(11px,1.35vw,16px);letter-spacing:.16em;text-transform:uppercase;color:#7a531a;margin:0;text-align:center;}
.cb-chapters{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:clamp(5px,1.5vh,15px);align-self:center;width:max-content;max-width:100%;}
.cb-chapter{display:flex;align-items:baseline;gap:12px;}
.cb-ch-num{flex:0 0 auto;min-width:2.4em;font-weight:700;color:#9a6a16;font-size:clamp(9px,1.05vw,13px);text-align:right;}
.cb-ch-text{display:flex;flex-direction:column;line-height:1.14;align-items:flex-start;}
.cb-ch-name{font-weight:700;letter-spacing:.05em;font-size:clamp(11px,1.2vw,15px);color:#3a2204;white-space:nowrap;}
.cb-ch-desc{font-family:'Space Grotesk',sans-serif;font-style:italic;font-size:clamp(7px,0.8vw,10px);color:#6b4a18;text-align:left;}

/* ── strana 4-5: CTA, centrované — per-page nudge k stredu väzby ── */
.cb-cta-page{align-items:center;justify-content:center;text-align:center;gap:4%;}
.cb-left .cb-cta-page{transform:translateX(25px);}
.cb-right .cb-cta-page{transform:translateX(-25px);}
.cb-cta-kicker{margin:0;font-size:clamp(7px,0.85vw,10px);letter-spacing:.22em;text-transform:uppercase;color:#9a6a16;}
.cb-cta-head{margin:0;font-weight:700;line-height:1.05;font-size:clamp(14px,2vw,25px);color:#3a2204;}
.cb-cta-text{margin:0;font-family:'Space Grotesk',sans-serif;font-size:clamp(8px,0.9vw,11px);color:#6b4a18;max-width:22ch;line-height:1.45;}
.cb-cta-btn{margin-top:3%;display:inline-block;padding:.62em 1.5em;border-radius:8px;font-family:'Cinzel',serif;font-weight:700;font-size:clamp(9px,1.05vw,13px);letter-spacing:.04em;text-decoration:none;color:#2a1a06;background:linear-gradient(135deg,#F5C73D,#E69E1A);border:1px solid rgba(250,244,236,.30);box-shadow:0 4px 14px rgba(90,58,12,.35);transition:transform .18s ease,box-shadow .18s ease;}
.cb-cta-btn:hover{transform:translateY(-2px);box-shadow:0 7px 20px rgba(90,58,12,.45);}
.cb-cta-link{font-family:'Cinzel',serif;font-size:clamp(10px,1.1vw,13px);letter-spacing:.06em;text-transform:uppercase;color:#7a531a;text-decoration:none;border-bottom:1px solid rgba(122,83,26,.4);padding-bottom:1px;transition:color .18s ease,border-color .18s ease;}
.cb-cta-link:hover{color:#9a6a16;border-color:rgba(154,106,22,.7);}

/* hint — zväčšený + jemný kontrastný podklad (2026-07-08, Matej OK), nech nezanikne vedľa cow/hektor scény */
.cb-hint{display:inline-flex;align-items:center;gap:9px;background:rgba(0,0,0,.32);border:1px solid rgba(201,154,63,.28);
  border-radius:20px;cursor:pointer;
  font-family:'Cinzel',serif;font-size:clamp(13px,1.6vw,17px);letter-spacing:.13em;text-transform:uppercase;
  color:#C99A3F;padding:8px 18px;animation:cbHint 2.6s ease-in-out infinite;}
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
  /* Mobile (2026-06-03): KNIHA fixne na rovnakej úrovni v OBOCH stavoch (closed == open) a nemenná.
     Trik: .cb-stage = jediný prvok vo flow (centrovaný) + fixný translateY; šípky/hint/CTA sú
     position:absolute (mimo flow) → nikdy neposunú knihu. --cb-h = výška knihy (inline z JS). */
  .cb-wrap{position:relative;}
  .cb-stage{transform:translateY(-60px);}
  .cb-hint{position:absolute;left:50%;top:calc(50% - 60px + var(--cb-h)/2 + 12px);transform:translateX(-50%);}
  /* Mobile (2026-06-03): TITLE strana — nadpis −15% −10% (20px → 15.3px) */
  .cb-title{font-size:15.3px;}
  /* Mobile (2026-06-03): 2. dvojstrana (kapitoly) — obsah −15% −10% (scale 0.765) */
  .cb-chapters{transform:scale(0.765);}
  /* Mobile (2026-06-03): 3. dvojstrana (CTA) — obsah −15% (translateX nudge zachovaný) */
  .cb-left .cb-cta-page{transform:translateX(25px) scale(0.85);}
  .cb-right .cb-cta-page{transform:translateX(-25px) scale(0.85);}
  /* Mobile (2026-06-03): ľavý CTA body do 2 riadkov (menší font, plná šírka strany) */
  .cb-left .cb-cta-text{font-size:9px;max-width:none;}
  /* Mobile (2026-06-03): CTA tlačidlá — menšie (font+padding) ale zvýraznené (zlatý glow),
     posun do vonkajšej strany (ľavé doľava, pravé doprava ~5px po scale 0.85) */
  .cb-cta-btn{padding:.5em 10px;font-size:10px;
    border-color:rgba(250,244,236,.55);
    box-shadow:0 3px 10px rgba(90,58,12,.4),0 0 14px rgba(245,199,61,.5);}
  .cb-left .cb-cta-btn{transform:translateX(-6px);}
  .cb-right .cb-cta-btn{transform:translateX(6px);}
  /* Mobile (2026-06-03): posledná dvojstrana (CTA) — nadpis −10% (18.7px → 16.83px) */
  .cb-cta-head{font-size:16.83px;}
  /* Mobile (2026-06-03): šípky NAD knihou, 20px medzera, absolútne (nehýbu knihou) */
  .cb-nav{position:absolute;left:50%;top:calc(50% - 60px - var(--cb-h)/2 - 20px);transform:translate(-50%,-100%);margin:0;}
  /* Mobile (2026-06-03): in-page CTA tlačidlá skryté — vytiahnuté pod knihu (JSX .cb-mobile-cta) */
  .cb-cta-page .cb-cta-btn{display:none;}
  .cb-mobile-cta{position:absolute;left:50%;top:calc(50% - 60px + var(--cb-h)/2 + 16px);transform:translateX(-50%);
    display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;padding:0 16px;box-sizing:border-box;}
  .cb-mobile-cta .cb-cta-btn{display:inline-block;transform:none;width:100%;max-width:260px;text-align:center;
    font-size:14px;padding:.8em 2em;
    box-shadow:0 4px 14px rgba(90,58,12,.4),0 0 16px rgba(245,199,61,.5);}
}
`;
