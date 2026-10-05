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
 *   0.86–1.00  dotyk sa ROZPLYNIE (krytie javiska → 0), pod ním už beží DOGTRIX
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
/** Jazda REST → TOUCH v ms, rovnomerná. Video (5 s) beží na 0.36–0.84 z nej,
 *  teda ~89 % jazdy ⇒ 6 s ≈ vlastné tempo videa. Matej 27. 9.: *„ruka
 *  a labka idú k sebe veľmi rýchlo, spomaľ ich"*. */
export const GATE_RIDE_MS = 2520; // 28. 9. piate kolo: o 15 % rýchlejšie (2900 ÷ 1,15); 27. 9. 3500 ÷ 1,2
/** 27. 9. tretie kolo — 6 s bolo *„prehnané"*, 2 s s mäkkou jazdou *„veľmi
 *  rýchlo"*. 3,5 s rovnomerne ≈ video 1,4×. */

/** ROZPLYNUTIE DOTYKU — na tomto úseku dráhy celé javisko brány stráca krytie
 *  a pod ním už beží DOGTRIX (Matej 27. 9.: *„dotyk labka a dlaň pomaly sa
 *  strácajú, ale začína DOGTRIX — padať, potom nadpis HEROGLYF…"*). */
export const GATE_FADE: [number, number] = [0.86, 1];
/** O koľko vh sa oblúk (DOGTRIX) zasunie POD bránu, aby sa prilepil presne
 *  v okamihu, keď sa dotyk začne rozplývať. Počíta sa, nepíše. */
const GATE_OVERLAP_VH = GATE_VH - GATE_FADE[0] * (GATE_VH - 100);

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export default function FilmGate() {
  const secRef = useRef<HTMLElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);

  // 🔴 VIDEO SA ŤAHÁ AŽ NA DOSAH (28. 9. 2026, meranie rýchlosti): 2,8 MB
  // (každé políčko kľúčové kvôli scrubu) išlo pri štarte popri guli. Brána je
  // za celým príbehom — sťahovať sa začne 4 obrazovky pred ňou.
  useEffect(() => {
    const sec = secRef.current, vid = vidRef.current;
    if (!sec || !vid) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      vid.preload = 'auto'; vid.load(); io.disconnect();
    }, { rootMargin: '400% 0px' });
    io.observe(sec);
    return () => io.disconnect();
  }, []);

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
      const pale = seg(p, GATE_FADE[0], GATE_FADE[1]);
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
    // load() spúšťa efekt vyššie, až keď je brána na dosah.
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
    <section ref={secRef} className="op-gate" aria-hidden="true" style={{ height: `${GATE_VH}lvh`, marginBottom: `-${GATE_OVERLAP_VH.toFixed(2)}lvh` }}>
      <div className="op-gate-stage">
        <div className="op-gate-back" />
        <video ref={vidRef} className="op-gate-vid" src="/videos/touch_opening_papyrus.mp4" muted playsInline preload="none" />
        <div className="op-gate-door is-l"><div className="op-gate-img" /></div>
        <div className="op-gate-door is-r"><div className="op-gate-img" /></div>
      </div>
      <style>{`
        /* Nad oblúkom — oblúk sa pod bránu zasúva (margin-bottom) a jeho
           DOGTRIX začína pod rozplývajúcim sa dotykom. */
        .op-gate { position: relative; z-index: 3; pointer-events: none; }
        .op-gate-stage {
          position: sticky; top: 0; height: 100lvh; overflow: hidden;
          opacity: calc(var(--g-in, 0) * (1 - var(--g-pale, 0)));
        }
        /* 🟫 ZA BRÁNOU JE PAPYRUS, NIE BIELA (Matej 27. 9.: *„po otvorení brány
           by bolo béžové pozadie, to biele čo je teraz"*). Papyrus je VO VIDEU:
           touch_opening_papyrus.mp4 = originál, kde neutrálne svetlé pixely
           (obloha, víry) nahradil ffmpeg geq farbou pageBg. Prvý pokus bol
           multiply v CSS — prefarbil aj ruku do žlta (*„ruka je nejaká
           zožltnutá"*), preto nie. Pleť je sýta, obloha sivá — kľúč je sýtosť. */
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
        /* 📱 MOBIL NA VÝŠKU: DOTYK SA OTÁČA (Matej 5. 10. 2026: *„na mobile by som to
           otočil — packa pôjde zhora a ruka zdola = na výšku mobilu, nie na šírku, aby
           bolo viac vidno ruku a labku"*). Video je 16:9 a ruka ide zľava zdola, labka
           sprava zhora; cover na výšku z neho nechal úzky stredný pás. Otočenie o −90°
           dá ľavý okraj dole a pravý hore. Box má rozmery OTOČENÉHO okna (šírka = výška
           okna a naopak), takže po otočení ho presne pokryje — cover oreže už len
           ~ 18 % po stranách (na 390×844), nie dve tretiny. */
        @media (max-width: 767px) and (orientation: portrait) {
          .op-gate-vid {
            inset: auto; top: 50%; left: 50%;
            width: 100lvh; height: 100vw;
            /* Preflight Tailwindu dáva video max-width: 100 % — bez tohto ostal box 390×390. */
            max-width: none;
            transform: translate(-50%, -50%) rotate(-90deg);
          }
        }
        /* Obe polovice nesú CELÚ bránu (100vw), jej stred leží na švíku. */
        .op-gate-door.is-l .op-gate-img { left: 0; }
        .op-gate-door.is-r .op-gate-img { right: 0; }; opacity: var(--g-pale, 0);
        }
      `}</style>
    </section>
  );
}
