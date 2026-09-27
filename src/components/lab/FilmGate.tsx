/**
 * BRÁNA — koniec príbehu na čiernej (Matej 27. 9. 2026: *„pri konci scrolu
 * v príbehu by sme mohli pomaly vyjsť z tmy tú bránu, ktorú sme už raz
 * postavili, ktorá sa scrollingom otvára"*).
 *
 * 🔑 NIE JE TO NOVÝ NÁPAD — je to `GateRevealSection` z `/betavision`
 * (`pages/BetaVision.tsx`): fotka brány `brana-final.webp` rozdelená na švíku
 * a za ňou video `touch_opening.mp4` (ruka s heroglyfom podáva dlaň labke).
 * Tu je bez framer-motion a bez CTA — film ďalej vedie motor a šípky.
 *
 * DEJ na vlastnej prilepenej dráhe (podiel p 0–1):
 *   0.00–0.30  zhasnutá brána z pozadia príbehu sa rozsvieti (jas + krytie + priblíženie)
 *   0.30–0.62  krídla sa rozostúpia, za nimi video
 *   0.36–0.84  video sa prehrá scrollom (currentTime = dráha), dobehne na zastávke
 *   0.86–1.00  obraz zbledne do papyrusu — WE NEED YOU za ním je papyrus
 *
 * Zastávky motora: `GATE_REST` (brána zatvorená) · `GATE_TOUCH` (dotyk).
 */
import { useEffect, useRef } from 'react';
import { LAB } from '@/lib/labTheme';

export const GATE_VH = 320;
/** Kde na dráhe stojí zastávka „brána zatvorená, celá vidieť". */
export const GATE_REST = 0.3;
/** Krytie zhasnutej brány v pozadí príbehu (.op-wall::before v OnePage). Brána
 *  sa rozsvecuje PRÁVE Z NEJ, preto musí sedieť presne. */
const GATE_DIM = 0.34;
/** Druhá zastávka — video dohralo (ruka a labka sa dotkli), obraz ešte nebledne. */
export const GATE_TOUCH = 0.84;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export default function FilmGate() {
  const secRef = useRef<HTMLElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    const vid = vidRef.current;
    if (!sec) return;
    let raf = 0;
    let lastP = -1;
    const apply = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const span = Math.max(1, sec.offsetHeight - window.innerHeight);
      const p = clamp01(-r.top / span);
      if (Math.abs(p - lastP) < 0.0005) return;
      lastP = p;
      const rise = easeInOut(seg(p, 0.01, GATE_REST));
      const open = easeInOut(seg(p, GATE_REST, 0.62));
      const pale = seg(p, 0.86, 1);
      // 🔴 BEZ PRÍCHODU ZDOLA (Matej 27. 9.: *„záver nie je scroll na osvetlené
      // dvere, ale táto scéna sa osvetlí… bez pohnutia"*). Kým sekcia neprilepí,
      // je javisko priehľadné a vidno len zhasnutú bránu v pozadí príbehu.
      // V okamihu prilepenia sa naň prepne tá istá brána v tom istom jase —
      // prechod nie je vidieť — a až potom sa rozsvecuje.
      sec.style.setProperty('--g-in', r.top <= 1 ? '1' : '0');
      sec.style.setProperty('--g-rise', rise.toFixed(4));
      sec.style.setProperty('--g-open', open.toFixed(4));
      sec.style.setProperty('--g-pale', pale.toFixed(4));
      if (vid && vid.readyState >= 1 && isFinite(vid.duration) && vid.duration > 0) {
        const t = seg(p, 0.36, GATE_TOUCH) * vid.duration;
        if (Math.abs(vid.currentTime - t) > 0.03) vid.currentTime = t;
      }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(apply); };
    vid?.load();
    apply();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, []);

  return (
    <section ref={secRef} className="op-gate" aria-hidden="true" style={{ height: `${GATE_VH}lvh` }}>
      <div className="op-gate-stage">
        <div className="op-gate-back" />
        <video ref={vidRef} className="op-gate-vid" src="/videos/touch_opening.mp4" muted playsInline preload="auto" />
        <div className="op-gate-door is-l"><div className="op-gate-img" /></div>
        <div className="op-gate-door is-r"><div className="op-gate-img" /></div>
        <div className="op-gate-pale" />
      </div>
      <style>{`
        .op-gate { position: relative; }
        .op-gate-stage {
          position: sticky; top: 0; height: 100lvh; overflow: hidden;
          opacity: var(--g-in, 0);
        }
        /* 🟫 ZA BRÁNOU JE PAPYRUS, NIE BIELA (Matej 27. 9.: *„po otvorení brány
           by bolo béžové pozadie, to biele čo je teraz"*). Video má bielu
           vírivú oblohu; násobenie (multiply) ju nad papyrusom prefarbí na papyrus
           a ruka s labkou (tmavšie) ostanú. Filter najprv vybieli sivé víry,
           inak by po násobení zostali ako špinavé mapy. */
        .op-gate-stage { isolation: isolate; }
        /* Kým brána stojí zatvorená, svieti jej krídlami (krytie < 1) čierna
           ako doteraz — papyrus pribúda až s otváraním. */
        .op-gate-back { position: absolute; inset: 0; background: #000; }
        .op-gate-back::after {
          content: ''; position: absolute; inset: 0;
          background: ${LAB.pageBg}; opacity: var(--g-open, 0);
        }
        .op-gate-vid {
          position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
          opacity: var(--g-open, 0);
          mix-blend-mode: multiply;
          filter: brightness(1.16) contrast(1.12);
        }
        /* Brána nevychádza z čiernej, ale zo ZHASNUTEJ SEBA — príbeh beží na
           tej istej bráne stlmenej (.op-wall::before v OnePage: jas .5, krytie .4).
           Rozsvietenie = jas aj krytie idú z tejto hodnoty na plnú. */
        .op-gate-door {
          position: absolute; top: 0; width: 50%; height: 100%; overflow: hidden;
          opacity: calc(${GATE_DIM} + var(--g-rise, 0) * ${1 - GATE_DIM});
          filter: brightness(calc(0.5 + var(--g-rise, 0) * 0.5)) saturate(calc(0.8 + var(--g-rise, 0) * 0.2));
        }
        .op-gate-door.is-l { left: 0; transform: translateX(calc(var(--g-open, 0) * -100%)); }
        .op-gate-door.is-r { right: 0; transform: translateX(calc(var(--g-open, 0) * 100%)); }
        .op-gate-img {
          position: absolute; top: 0; width: 100vw; height: 100%;
          background: url(/images/brana-final.webp) center / cover no-repeat;
          transform: scale(calc(1 + var(--g-rise, 0) * 0.04));
        }
        /* Obe polovice nesú CELÚ bránu (100vw), jej stred leží na švíku. */
        .op-gate-door.is-l .op-gate-img { left: 0; }
        .op-gate-door.is-r .op-gate-img { right: 0; }
        .op-gate-pale {
          position: absolute; inset: 0; pointer-events: none;
          background: ${LAB.pageBg}; opacity: var(--g-pale, 0);
        }
      `}</style>
    </section>
  );
}
