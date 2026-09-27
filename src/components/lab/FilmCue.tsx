/**
 * ŠÍPKY FILMU (27. 9. 2026) — Matejova kresba z hand-drawn kitu
 * (`vstupy/vizualna-identita/Icons hand drawn/down-arrow-hand-drawn-outline`),
 * tri pod sebou, lapisový obrys s bledou výplňou, blikajú „ako na runwayi"
 * zhora dole. Hodnoty sa ladia v nákrese `plany/nakres-sipky-2026-09-27/` —
 * objekt `CUE` má tie isté kľúče ako `S` v nákrese („Skopíruj nastavenia").
 */
import { LAPIS } from '@/components/pack/navGoldSkin';

// Matejove hodnoty z nákresu (27. 9. 2026).
export const CUE = { order: 'B' as 'A' | 'B' | 'C', size: 25, space: -3, dur: 2.2, gap: 0.19, dim: 0.6, glow: 6, gloss: 0.7, edge: 1 };

const FULL = "M458.176,149.319c-17.61-21.018-36.12-41.228-55.467-60.666c-8.323-8.369-19.297-4.226-24.136,3.488 c-48.362,40.649-96.253,87.067-144.667,127.66C187.644,173.75,135.234,129.363,87.25,85.184 c-5.382-4.956-11.73-5.154-16.919-2.777c-4.936,0.375-9.458,3.361-12.781,7.663c-15.615,20.215-32.078,39.75-49.234,58.676 c-7.815,4.763-12.124,15.884-3.791,24.358c66.496,67.639,141.437,126.848,201.065,201.062c1.632,2.036,3.425,3.407,5.276,4.261 c5.586,4.25,13.65,5.321,20.254-0.797c74.753-69.213,153.913-133.546,227.057-204.521c4.961-4.809,5.561-10.542,3.701-15.462 C461.522,154.819,460.4,151.964,458.176,149.319z M221.286,344.41C166.159,277.893,99.123,223.051,37.905,162.385 c13.086-14.833,25.692-30.042,37.948-45.56c47.073,42.152,97.576,85.615,141.874,130.819c2.308,2.356,4.834,3.656,7.374,4.25 c5.578,3.783,13.347,4.677,19.882-0.782c49.13-41.015,97.63-87.976,146.561-129.219c11.999,12.446,23.577,25.293,34.901,38.364 C359.999,223.772,289.125,282.403,221.286,344.41z";
const INNER = "M221.286,344.41C166.159,277.893,99.123,223.051,37.905,162.385 c13.086-14.833,25.692-30.042,37.948-45.56c47.073,42.152,97.576,85.615,141.874,130.819c2.308,2.356,4.834,3.656,7.374,4.25 c5.578,3.783,13.347,4.677,19.882-0.782c49.13-41.015,97.63-87.976,146.561-129.219c11.999,12.446,23.577,25.293,34.901,38.364 C359.999,223.772,289.125,282.403,221.286,344.41z";

const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, k) => Math.round(v + (B[k] - v) * t).toString(16).padStart(2, '0')).join('');
};

function Chevron({ i, scale }: { i: number; scale: number }) {
  const g = CUE.gloss, w = CUE.size * scale;
  return (
    <svg className="op-cue-c" style={{ ['--i' as string]: i } as React.CSSProperties} width={w} height={w * 0.8} viewBox="0 60 463 340" aria-hidden="true">
      <defs>
        <linearGradient id={`cueLap${i}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix('#3A62C8', LAPIS.edge, 1 - g)} />
          <stop offset=".5" stopColor={LAPIS.edge} />
          <stop offset="1" stopColor={LAPIS.deep} />
        </linearGradient>
        <linearGradient id={`cuePal${i}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFBF1" />
          <stop offset="1" stopColor={mix('#E8D3A0', '#F6EAD0', 1 - g)} />
        </linearGradient>
      </defs>
      <path d={INNER} fill={`url(#cuePal${i})`} />
      <path d={FULL} fill={`url(#cueLap${i})`} fillRule="evenodd" stroke={LAPIS.deep} strokeWidth={CUE.edge * 6} strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 ${2 + g * 4}px ${2 + g * 4}px rgba(10,26,74,${0.15 + g * 0.3}))` }} />
      {g > 0 && <path d={FULL} fill="none" stroke={`rgba(255,255,255,${g * 0.55})`} strokeWidth={5} transform="translate(0,-5)" style={{ mixBlendMode: 'screen' }} />}
    </svg>
  );
}

export default function FilmCue({ moving, onNext, label, hint, big }: { moving: boolean; onNext: () => void; label: string; hint?: string; big?: boolean }) {
  const sc = CUE.order === 'A' ? [1, 0.78, 0.58] : CUE.order === 'B' ? [0.58, 0.78, 1] : [0.8, 0.8, 0.8];
  return (
    <button type="button" className={`op-cue${moving ? ' is-moving' : ''}${big ? ' is-big' : ''}`} aria-label={label} onClick={onNext}
      style={{ ['--dur' as string]: `${CUE.dur}s`, ['--gap' as string]: `${CUE.gap}s`, ['--dim' as string]: CUE.dim, ['--glow' as string]: `${CUE.glow}px` } as React.CSSProperties}>
      {/* Nápis nad šípkami — len v príbehu (Matej 27. 9.: *„nad šípkami nápis
          prescroluj príbeh"*). Miesto drží stále, aby šípky neposkakovali. */}
      <em className={`op-cue-hint${hint ? ' is-on' : ''}`}>{hint ?? ''}</em>
      {sc.map((s, i) => (
        <span key={i} style={{ marginTop: i ? CUE.space : 0 }}><Chevron i={i} scale={s} /></span>
      ))}
    </button>
  );
}

/** ŠÍPKA HORE (27. 9. 2026) — Matej: *„treba doplniť aj do pravého dolného
 *  rohu šípku hore pre návrat"*. Tá istá kresba z kitu, otočená; jedna, bez
 *  runway bliku — nie je to výzva, je to cesta späť. */
export function FilmTop({ show, onTop, label }: { show: boolean; onTop: () => void; label: string }) {
  return (
    <button type="button" className={`op-top${show ? ' is-on' : ''}`} aria-label={label} onClick={onTop} tabIndex={show ? 0 : -1}>
      <Chevron i={9} scale={1.3} />
    </button>
  );
}

export const FILM_CUE_CSS = `
  .op-top {
    position: fixed; right: 24px; bottom: 24px; z-index: 60;
    display: grid; place-items: center; width: 48px; height: 48px; padding: 0;
    background: none; border: 0; cursor: pointer;
    opacity: 0; pointer-events: none; transform: translateY(8px);
    transition: opacity .35s ease, transform .35s ease;
  }
  .op-top.is-on { opacity: .85; pointer-events: auto; transform: none; }
  .op-top.is-on:hover { opacity: 1; }
  .op-top svg { transform: rotate(180deg); }
  /* Rámik po kliku myšou nie — len pri klávesnici (Matej ho videl ako štvorec). */
  .op-top:focus:not(:focus-visible) { outline: none; }
  @media (max-width: 768px) { .op-top { right: 16px; bottom: 16px; } }
  .op-cue {
    position: fixed; left: 50%; bottom: clamp(24px, 10vh, 104px); z-index: 60;
    transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center;
    padding: 8px 16px; background: none; border: 0; cursor: pointer;
    transition: opacity .35s ease, transform .5s cubic-bezier(.22,.9,.28,1);
    transform-origin: 50% 100%;
  }
  /* Na homepage (guľa) o 50 % väčšie — Matej 27. 9. 2026. */
  .op-cue.is-big { transform: translateX(-50%) scale(1.5); }
  .op-cue > span { display: block; line-height: 0; }
  .op-cue-hint {
    display: block; min-height: 12px; margin-bottom: 8px; font-style: normal;
    font: 500 10px/1.2 'Space Grotesk', sans-serif; letter-spacing: .22em; text-transform: uppercase;
    color: rgba(239,215,154,.85); white-space: nowrap;
    opacity: 0; transition: opacity .4s ease;
  }
  .op-cue-hint.is-on { opacity: 1; }
  .op-cue.is-moving { opacity: 0; pointer-events: none; }
  .op-cue-c { display: block; overflow: visible; opacity: var(--dim); animation: opCueRun var(--dur) ease-in-out infinite; animation-delay: calc(var(--i) * var(--gap)); }
  .op-cue:hover .op-cue-c { animation-duration: calc(var(--dur) * .6); }
  @keyframes opCueRun {
    0%, 100% { opacity: var(--dim); }
    22% { opacity: 1; filter: drop-shadow(0 0 var(--glow) rgba(90,130,230,.55)); }
    44% { opacity: var(--dim); }
  }
  @media (max-width: 768px) { .op-cue { bottom: clamp(16px, 8vh, 72px); } }
  @media (prefers-reduced-motion: reduce) { .op-cue-c { animation: none; opacity: .8; } }
`;
