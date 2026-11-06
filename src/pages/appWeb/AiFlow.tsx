import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { VAULT_WORLDS } from '@/components/pack/vault/worlds';
import { VAULT_CIRCLES } from '@/components/pack/vault/circles';
import { WORLD_TINT } from '@/components/pack/ainubisSkin';

/** ZNALOSTNÝ LIEVIK v2 (Matej 6. 11. večer): poschodia 5 → 4 → 2 → 7 svetov → 46 okruhov · 547 zvitkov,
 *  a z 547 vedie prúd až do prvého bloku učenia (celý zvitok). Čísla oranžovou.
 *  Prúd = SVG krivky medzi poschodiami (kotvy `data-fa` sa merajú po vykreslení — poschodia sa zalamujú
 *  podľa šírky, rovnicou sa to vyjadriť nedá). Varianty prúdenia `flow` 1–4 (výber cez /app?varianty). */

export type FlowVariant = '1' | '2' | '3' | '4';
export const FLOW_NAMES: Record<FlowVariant, string> = { 1: 'kométy', 2: 'prúd bodiek', 3: 'dych', 4: 'stuhy' };

type Lang2 = 'en' | 'sk';
type Path = { d: string; tier: number; k: number };

/** Ktorý prvok horného poschodia sa spojí s ktorým dolným: podľa polohy v šírke (zlomok 0–1). */
const near = (a: number, b: number, n: number, m: number) => Math.abs((a + 0.5) / n - (b + 0.5) / m) < Math.max(0.5 / n, 0.5 / m) + 0.12;

export function AiFlow({ L, c, flow, counter, learn }: {
  L: Lang2; c: (k: string) => string; flow: FlowVariant;
  counter: (n: number, run: boolean) => ReactNode; learn: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [run, setRun] = useState(false);
  const [vis, setVis] = useState(false);
  const [openC, setOpenC] = useState(false);

  /* čísla bežia raz, prúd len pri obrazovke */
  useEffect(() => {
    const el = box.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { setVis(e.isIntersecting); if (e.isIntersecting) setRun(true); }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(el); return () => io.disconnect();
  }, []);

  /* kotvy → krivky */
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const measure = () => {
      const o = el.getBoundingClientRect();
      const tiers: DOMRect[][] = [];
      el.querySelectorAll<HTMLElement>('[data-fa]').forEach((n) => {
        const t = +n.dataset.fa!; (tiers[t] ??= []).push(n.getBoundingClientRect());
      });
      const out: Path[] = [];
      for (let t = 0; t < tiers.length - 1; t++) {
        const A = tiers[t], B = tiers[t + 1]; if (!A || !B) continue;
        A.forEach((a, i) => B.forEach((b, j) => {
          if (!near(i, j, A.length, B.length)) return;
          const x1 = a.left + a.width / 2 - o.left, y1 = a.bottom - o.top, x2 = b.left + b.width / 2 - o.left, y2 = b.top - o.top;
          const my = (y1 + y2) / 2;
          out.push({ d: `M${x1.toFixed(1)},${y1.toFixed(1)} C${x1.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`, tier: t, k: out.length });
        }));
      }
      setPaths(out); setSize({ w: o.width, h: o.height });
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, [openC]);

  const worldName = (key: string) => c(({ dogsPath: 'w7', understanding: 'w5', anatomy: 'w6', nutrition: 'w4', prevention: 'w3', training: 'w2', problems: 'w1' } as Record<string, string>)[key]);
  const nCircles = Object.values(VAULT_CIRCLES).reduce((s, a) => s + a.length, 0);

  return (
    <div className={`af af-v${flow}${vis ? ' on' : ''}`} ref={box}>
      <svg className="af-svg" width={size.w} height={size.h} viewBox={`0 0 ${size.w || 1} ${size.h || 1}`} aria-hidden>
        <defs>
          <filter id="af-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {paths.map((p) => (
          <g key={p.k} className={`af-p t${p.tier}`} style={{ ['--i' as string]: p.k % 7, ['--t' as string]: p.tier }}>
            <path className="af-base" d={p.d} pathLength={1000} />
            <path className="af-fx" d={p.d} pathLength={1000} filter="url(#af-glow)" />
          </g>
        ))}
      </svg>

      <div className="af-row r5">
        {[[532, 'src1', 'src1s'], [337, 'src2', 'src2s'], [1996, 'src3', 'src3s'], [1158, 'src4', 'src4s'], [16, 'src5', 'src5s']].map(([n, k, s]) => (
          <div key={k} className="af-tile" data-fa="0"><b>{counter(n as number, run)}</b><span>{c(k as string)}</span><small>{c(s as string)}</small></div>
        ))}
      </div>
      <div className="af-row r4">
        {[['≈ 12 500', 'a4_1'], ['1,25 m', 'a4_2'], ['3,7 km', 'a4_3'], ['47', 'a4_4']].map(([n, k]) => (
          <div key={k} className="af-tile" data-fa="1"><b>{L === 'en' ? n.replace(',', '.').replace('12 500', '12,500') : n}</b><span>{c(k)}</span></div>
        ))}
      </div>
      <div className="af-row r2">
        <div className="af-tile big" data-fa="2"><b>{counter(13864, run)}</b><span>{c('ring1b')}</span></div>
        <div className="af-tile big" data-fa="2"><b>{counter(2106, run)}</b><span>{c('ring2b')}</span><small>{c('ring2s')}</small></div>
      </div>
      <div className="af-row r7">
        {VAULT_WORLDS.map((w) => (
          <div key={w.key} className="af-world" data-fa="3" style={{ ['--wc' as string]: `rgb(${WORLD_TINT[w.key] ?? '91,224,240'})` }}>
            <i style={{ ['--m' as string]: `url(/icons/pack/${w.ic}.svg)` }} />
            <span>{worldName(w.key)}</span>
          </div>
        ))}
      </div>
      <div className="af-row r1">
        <div className="af-sum" data-fa="4">
          <button type="button" className="af-circ" aria-expanded={openC} onClick={() => setOpenC((v) => !v)}>
            <b>{counter(nCircles, run)}</b> {c('ai_circles')} <em>{openC ? '−' : '+'}</em>
          </button>
          <span className="af-dot" />
          <span className="af-scr"><b>{counter(547, run)}</b> {c('scr_pod')}<sup>*</sup></span>
        </div>
      </div>
      {openC && (
        <div className="af-circles">
          {VAULT_WORLDS.map((w) => (
            <div key={w.key} style={{ ['--wc' as string]: `rgb(${WORLD_TINT[w.key] ?? '91,224,240'})` }}>
              <h5>{worldName(w.key)}</h5>
              <ol>{(VAULT_CIRCLES[w.key] ?? []).map((o, i) => <li key={i}>{o[L]}</li>)}</ol>
            </div>
          ))}
        </div>
      )}
      <p className="af-note"><sup>*</sup> {c('pod_note')}</p>
      {learn}
    </div>
  );
}
