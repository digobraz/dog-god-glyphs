/**
 * OTOČ MOBIL — video vízie na šírku (Matej 6. 10. 2026).
 *
 * *„pri vízii konkrétne pri slajde, kedy sa zobrazí len video… som skúšal otočiť
 * mobil na šírku pre lepšie pozeranie videa a po otočení mi ukázalo už ďalšiu
 * sekciu… chcel by som, aby sme tu na mobile dali pod video animáciu — pre
 * otočenie telefónu na sledovanie videa, a po otočení sa video spustí (animácia
 * sa používa napr. aj pri reelsoch — ikonka s popisom otoč mobil)"*.
 *
 * Tri veci:
 *  1. Na zastávke PLÁTNO (koniec 4. dráhy vízie) sa na výšku pod videom ukáže
 *     kreslený telefón, ktorý sa otáča, a popisok.
 *  2. Otočenie na šírku na tejto zastávke otvorí video cez celé okno a spustí ho
 *     (stlmené — zvuk bez dotyku prehliadač nepustí; zapne sa v prehrávači).
 *  3. 🔴 OTOČENIE NIKDY NEPRESKOČÍ OBRAZ. Rozloženie filmu je v lvh, takže po
 *     otočení sa každá dráha prepočíta a tá istá `scrollY` ukazuje inam. Pamätá
 *     sa preto ZASTÁVKA (index), nie pixel, a po otočení sa na ňu film vráti.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/i18n/LanguageContext';
import { filmVh } from '@/lib/filmVh';
import { LAB } from '@/lib/labTheme';

/** To isté video, ktoré pustí ťuk na plátno (VisionLab). */
const YT_ID = 'TwSl_aOwbaY';
/** Telefón: úzka strana do 500 px a dotyk. */
const PHONE_MQ = '(pointer: coarse) and (max-width: 932px) and (max-height: 932px)';

export default function FilmTurn({ cinemaAt, stops }: { cinemaAt: () => number; stops: () => number[] }) {
  const t = useT();
  const [hint, setHint] = useState(false);
  const [full, setFull] = useState(false);
  const hintRef = useRef<HTMLDivElement>(null);
  const atCinema = useRef(false);
  const lastIdx = useRef(-1);
  const portrait = () => window.innerHeight >= window.innerWidth;

  useEffect(() => {
    const phone = window.matchMedia(PHONE_MQ);
    const onScroll = () => {
      if (!phone.matches || !portrait()) return;
      const y = window.scrollY;
      const near = Math.abs(y - cinemaAt()) < filmVh() * 0.12;
      atCinema.current = near;
      setHint(near);
      if (near && hintRef.current) {
        const fr = document.querySelector<HTMLElement>('.video-embed-frame')?.getBoundingClientRect();
        if (fr) hintRef.current.style.top = `${Math.round(fr.bottom + 24)}px`;
      }
      // Zastávka, na ktorej film STOJÍ (motor dojazd presne na ňu).
      const st = stops();
      let bi = -1, bd = Infinity;
      st.forEach((s, i) => { const d = Math.abs(s - y); if (d < bd) { bd = d; bi = i; } });
      if (bd < 8) lastIdx.current = bi;
    };
    let timer = 0;
    let wasPortrait = portrait();
    const onResize = () => {
      if (!phone.matches) return;
      const nowPortrait = portrait();
      if (nowPortrait === wasPortrait) return;
      wasPortrait = nowPortrait;
      if (!nowPortrait && atCinema.current) setFull(true);
      if (nowPortrait) setFull(false);
      setHint(false);
      // Po otočení sa rozloženie ustáli až o pár snímok (lvh, prilepené sekcie).
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const st = stops();
        if (lastIdx.current >= 0 && st[lastIdx.current] != null) {
          window.scrollTo({ top: st[lastIdx.current], behavior: 'instant' as ScrollBehavior });
        }
        onScroll();
      }, 350);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [cinemaAt, stops]);

  // Celé okno patrí videu — stránka pod ním sa nehýbe.
  useEffect(() => {
    if (!full) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = 'hidden';
    return () => { el.style.overflow = prev; };
  }, [full]);

  return (
    <>
      <div ref={hintRef} className={`op-turn${hint && !full ? ' is-on' : ''}`} aria-hidden={!hint}>
        <svg className="op-turn-ph" viewBox="0 0 48 48" width="32" height="32" aria-hidden="true">
          <g className="op-turn-rot">
            <rect x="15" y="6" width="18" height="34" rx="4" />
            <path d="M22 35.5h4" />
          </g>
          <path className="op-turn-arc" d="M37 12c5 4 6 11 3 16" />
          <path className="op-turn-arc" d="M38.5 26.5 40 28.6l2.4-1.3" />
        </svg>
        <span>{t('onepage.turn')}</span>
        <em className="op-turn-or">{t('onepage.turnOr')}</em>
      </div>
      {full && createPortal(
        <div className="op-turn-full" data-film-free role="dialog" aria-modal="true" aria-label={t('onepage.turn')}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${YT_ID}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&color=white`}
            title={t('vision.hero.videoTitle')}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>,
        document.body,
      )}
      <style>{`
        .op-turn {
          position: fixed; left: 50%; top: 70%; z-index: 40; transform: translate(-50%, 8px);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          opacity: 0; pointer-events: none; transition: opacity .4s ease, transform .4s ease;
          font: 500 12px/1.3 'Space Grotesk', sans-serif; letter-spacing: .02em; color: ${LAB.ink};
          text-align: center; white-space: nowrap;
        }
        /* JEMNE (Matej 8. 10. 2026: *„musí to byť jemnejšie, priehľadnejšie, aby bolo jasné,
           že sa dá pokračovať a nie je to posledný krok"*). Plný telefón + veta v strede
           obrazovky čítal ako koniec filmu — 30 % návštev z Instagramu tu skončilo. */
        .op-turn.is-on { opacity: .55; transform: translate(-50%, 0); }
        .op-turn { gap: 4px; }
        .op-turn-or { font-style: normal; font-size: 10px; letter-spacing: .02em; opacity: .8; }
        .op-turn-ph { overflow: visible; }
        .op-turn-ph rect, .op-turn-ph path {
          fill: none; stroke: ${LAB.goldSolid}; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round;
        }
        .op-turn-rot { transform-box: fill-box; transform-origin: center; animation: opTurn 2.6s ease-in-out infinite; }
        .op-turn-arc { animation: opTurnArc 2.6s ease-in-out infinite; }
        @keyframes opTurn {
          0%, 18% { transform: rotate(0deg); }
          46%, 72% { transform: rotate(-90deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes opTurnArc { 0%, 12% { opacity: 0; } 30%, 60% { opacity: 1; } 80%, 100% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .op-turn-rot, .op-turn-arc { animation: none; } }
        @media (min-width: 769px) { .op-turn { display: none; } }
        .op-turn-full { position: fixed; inset: 0; z-index: 10000; background: #000; }
        .op-turn-full iframe { width: 100%; height: 100%; border: 0; display: block; }
      `}</style>
    </>
  );
}
