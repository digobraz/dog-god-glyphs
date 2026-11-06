import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { VAULT_WORLDS } from '@/components/pack/vault/worlds';
import { VAULT_CIRCLES } from '@/components/pack/vault/circles';
import { VAULT_COUNTS } from '@/components/pack/vault/vaultRegister';
import { WORLD_TINT } from '@/components/pack/ainubisSkin';

/** ZNALOSTNÝ LIEVIK v3 (Matej 6. 11. večer: „o mnoho krajšie, prémiovejšie, rýchlejší tok, rôzne farby a pri dotyku
 *  blokov je vidno, ako sa narážajú, vlnia a postupujú“). Poschodia 5 → 4 → 2 → 7 svetov → 46 · 547 → zvitky.
 *  Prúd kreslí CANVAS: svetelné častice so stopou po krivkách medzi kotvami `data-fa` (merajú sa po vykreslení —
 *  poschodia sa zalamujú podľa šírky). Dopad častice = vlna na hrane bloku; blok pod myšou/prstom prúd zhustí,
 *  zrýchli a blok sa rozsvieti a nadvihne — bez chvenia (Matej: „nepulzuje“). Varianty 1–4 zanikli. Svety sú tlačidlá: ťuk = zvitky toho sveta. */

type Lang2 = 'en' | 'sk';
type Pt = [number, number];
type Path = { p: [Pt, Pt, Pt, Pt]; tier: number; a: number; b: number; col: string; len: number };
type Part = { path: number; t: number; v: number; s: number };
type Wave = { x: number; y: number; col: string; age: number; big: boolean };

const SRC_COL = ['#F5C73D', '#5BE0F0', '#B98CFF', '#FF7EB6', '#5AA9FF'];
const wc = (key: string) => `rgb(${WORLD_TINT[key] ?? '91,224,240'})`;
const WORLD_KEYS = VAULT_WORLDS.map((w) => w.key);

/** Ktorý prvok horného poschodia sa spojí s ktorým dolným: podľa polohy v šírke (zlomok 0–1). */
const near = (a: number, b: number, n: number, m: number) => Math.abs((a + 0.5) / n - (b + 0.5) / m) < Math.max(0.5 / n, 0.5 / m) + 0.12;
const bez = (p: Path['p'], t: number): Pt => {
  const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]];
};

export function AiFlow({ L, c, counter, learn, onWorld, published }: {
  L: Lang2; c: (k: string) => string;
  counter: (n: number, run: boolean) => ReactNode; learn: ReactNode;
  onWorld: (key: string) => void; published: string[];
}) {
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const paths = useRef<Path[]>([]);
  const els = useRef<HTMLElement[]>([]);
  const hot = useRef(-1);
  const vis = useRef(false);
  const [run, setRun] = useState(false);
  const [openC, setOpenC] = useState(false);

  /* čísla bežia raz, prúd len pri obrazovke */
  useEffect(() => {
    const el = box.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { vis.current = e.isIntersecting; if (e.isIntersecting) setRun(true); }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(el); return () => io.disconnect();
  }, []);

  /* kotvy → krivky */
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const measure = () => {
      const o = el.getBoundingClientRect();
      const list = Array.from(el.querySelectorAll<HTMLElement>('[data-fa]'));
      els.current = list;
      const tiers: number[][] = [];
      list.forEach((n, i) => { (tiers[+n.dataset.fa!] ??= []).push(i); });
      const out: Path[] = [];
      for (let t = 0; t < tiers.length - 1; t++) {
        const A = tiers[t], B = tiers[t + 1]; if (!A || !B) continue;
        A.forEach((ia, i) => B.forEach((ib, j) => {
          if (!near(i, j, A.length, B.length)) return;
          const a = list[ia].getBoundingClientRect(), b = list[ib].getBoundingClientRect();
          const x1 = a.left + a.width / 2 - o.left, y1 = a.bottom - o.top, x2 = b.left + b.width / 2 - o.left, y2 = b.top - o.top;
          const my = (y1 + y2) / 2;
          const wa = list[ia].dataset.w, wb = list[ib].dataset.w;
          const col = t === 0 ? SRC_COL[i % SRC_COL.length] : wb ? wc(wb) : wa ? wc(wa) : t === 1 ? '#5BE0F0' : '#F5C73D';
          out.push({ p: [[x1, y1], [x1, my], [x2, my], [x2, y2]], tier: t, a: ia, b: ib, col, len: Math.hypot(x2 - x1, y2 - y1) });
        }));
      }
      paths.current = out;
      const c2 = cv.current; if (c2) {
        const dpr = Math.min(2, devicePixelRatio || 1);
        c2.width = o.width * dpr; c2.height = o.height * dpr; c2.style.width = `${o.width}px`; c2.style.height = `${o.height}px`;
        c2.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, [openC]);

  /* prúd — častice so stopou, dopad = vlna, blok pod prstom sa zachveje */
  useEffect(() => {
    const ctx = cv.current?.getContext('2d'); if (!ctx) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const parts: Part[] = []; const waves: Wave[] = [];
    const acc = new Map<number, number>();
    let last = performance.now(), raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!vis.current) return;
      const P = paths.current, W = ctx.canvas.width, H = ctx.canvas.height;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H); ctx.restore();
      const h = hot.current;
      /* podklad: tenké krivky, horúce svietia vo svojej farbe */
      P.forEach((p) => {
        const on = h >= 0 && (p.a === h || p.b === h);
        ctx.beginPath(); ctx.moveTo(...p.p[0]); ctx.bezierCurveTo(...p.p[1], ...p.p[2], ...p.p[3]);
        ctx.strokeStyle = p.col; ctx.globalAlpha = on ? 0.55 : 0.13; ctx.lineWidth = on ? 1.6 : 1; ctx.stroke();
      });
      ctx.globalAlpha = 1;
      if (still) return;
      /* zrod — hustota podľa poschodia, horúce ×4 */
      P.forEach((p, k) => {
        const on = h >= 0 && (p.a === h || p.b === h);
        const rate = (p.tier === 0 ? 1.6 : p.tier === 3 ? 1.1 : 1.3) * (on ? 4 : 1);
        const v = (acc.get(k) ?? Math.random()) + rate * dt;
        if (v >= 1) { parts.push({ path: k, t: 0, v: (0.55 + Math.random() * 0.35) * (on ? 1.5 : 1), s: 1.4 + Math.random() * 1.4 }); acc.set(k, v - 1); }
        else acc.set(k, v);
      });
      ctx.globalCompositeOperation = 'lighter';
      for (let i = parts.length - 1; i >= 0; i--) {
        const q = parts[i], p = P[q.path]; if (!p) { parts.splice(i, 1); continue; }
        const on = h >= 0 && (p.a === h || p.b === h);
        /* krátke krivky prejdú rýchlo, dlhé nesmú vliecť: ~1,1–1,8 s */
        q.t += dt * q.v * (on ? 1.35 : 1) * Math.max(0.55, Math.min(1.1, 260 / (p.len || 260)));
        if (q.t >= 1) {
          parts.splice(i, 1);
          waves.push({ x: p.p[3][0], y: p.p[3][1], col: p.col, age: 0, big: p.b === h });
          continue;
        }
        /* stopa: 6 bodov dozadu, slabne */
        const tail = 0.09;
        let prev = bez(p.p, Math.max(0, q.t - tail));
        for (let s = 1; s <= 6; s++) {
          const pt = bez(p.p, Math.max(0, q.t - tail + (tail * s) / 6));
          ctx.beginPath(); ctx.moveTo(...prev); ctx.lineTo(...pt);
          ctx.strokeStyle = p.col; ctx.globalAlpha = (s / 6) * (on ? 0.9 : 0.6); ctx.lineWidth = q.s * (s / 6) * (on ? 1.4 : 1); ctx.lineCap = 'round'; ctx.stroke();
          prev = pt;
        }
        const [x, y] = bez(p.p, q.t);
        const r = q.s * (on ? 4.5 : 3.2);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, '#fff'); g.addColorStop(0.25, p.col); g.addColorStop(1, 'transparent');
        ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
      /* vlny — elipsa na hrane bloku, rozbieha sa a slabne */
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i]; w.age += dt * (w.big ? 1.4 : 2.2);
        if (w.age >= 1) { waves.splice(i, 1); continue; }
        const R = (w.big ? 46 : 18) * (0.2 + w.age);
        ctx.globalAlpha = (1 - w.age) * (w.big ? 0.85 : 0.45);
        ctx.strokeStyle = w.col; ctx.lineWidth = w.big ? 2 : 1.2;
        ctx.beginPath(); ctx.ellipse(w.x, w.y, R, R * 0.32, 0, 0, 7); ctx.stroke();
        if (w.big) { ctx.globalAlpha *= 0.5; ctx.beginPath(); ctx.ellipse(w.x, w.y, R * 0.55, R * 0.18, 0, 0, 7); ctx.stroke(); }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      if (parts.length > 420) parts.splice(0, parts.length - 420);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* blok pod myšou / prstom */
  const heat = (e: React.PointerEvent) => {
    const n = (e.target as HTMLElement).closest<HTMLElement>('[data-fa]');
    hot.current = n ? els.current.indexOf(n) : -1;
  };

  const worldName = (key: string) => c(({ dogsPath: 'w7', understanding: 'w5', anatomy: 'w6', nutrition: 'w4', prevention: 'w3', training: 'w2', problems: 'w1' } as Record<string, string>)[key]);
  const nCircles = Object.values(VAULT_CIRCLES).reduce((s, a) => s + a.length, 0);

  return (
    <div className="af" ref={box} onPointerOver={heat} onPointerDown={heat} onPointerLeave={() => { hot.current = -1; }}>
      <canvas className="af-cv" ref={cv} aria-hidden />

      <div className="af-row r5">
        {[[532, 'src1', 'src1s'], [337, 'src2', 'src2s'], [1996, 'src3', 'src3s'], [1158, 'src4', 'src4s'], [16, 'src5', 'src5s']].map(([n, k, s], i) => (
          <div key={k} className="af-tile" data-fa="0" style={{ ['--fc' as string]: SRC_COL[i] }}><b>{counter(n as number, run)}</b><span>{c(k as string)}</span><small>{c(s as string)}</small></div>
        ))}
      </div>
      <div className="af-row r4">
        {[['≈ 12 500', 'a4_1'], ['1,25 m', 'a4_2'], ['3,7 km', 'a4_3'], ['47', 'a4_4']].map(([n, k]) => (
          <div key={k} className="af-tile" data-fa="1"><b>{L === 'en' ? n.replace(',', '.').replace('12 500', '12,500') : n}</b><span>{c(k)}</span></div>
        ))}
      </div>
      <div className="af-row r2">
        <div className="af-tile big cy" data-fa="2"><b>{counter(13864, run)}</b><span>{c('ring1b')}</span></div>
        <div className="af-tile big cy" data-fa="2"><b>{counter(2106, run)}</b><span>{c('ring2b')}</span><small>{c('ring2s')}</small></div>
      </div>
      <div className="af-row r7">
        {VAULT_WORLDS.map((w, k) => {
          const n = VAULT_COUNTS[w.key];
          const live = published.includes(w.key);
          return (
            <button key={w.key} type="button" className="af-world" data-fa="3" data-w={w.key} onClick={() => onWorld(w.key)}
              style={{ ['--wc' as string]: wc(w.key), ['--k' as string]: k }}>
              <span className="orb"><i style={{ ['--m' as string]: `url(/icons/pack/${w.ic}.svg)` }} /></span>
              <span className="nm">{worldName(w.key)}</span>
              <span className="tip">{n ? `${n.circles} ${c('ai_circles')} · ${n.scrolls} ${c('ai_scrolls')}` : ''}<em>{live ? c('w_open') : c('w_soon')}</em></span>
            </button>
          );
        })}
      </div>
      <div className="af-row r1">
        <div className="af-sum" data-fa="4">
          <button type="button" className="af-circ" aria-expanded={openC} onClick={() => setOpenC((v) => !v)}>
            <b>{counter(nCircles, run)}</b> {c('ai_circles')} <em>{openC ? '−' : '+'}</em>
          </button>
          <span className="af-dot" />
          <span className="af-scr"><b>{counter(547, run)}</b> {c('scr_pod')}<span className="af-ast" tabIndex={0}>*<span className="tip">{c('pod_note')}</span></span></span>
        </div>
      </div>
      {openC && (
        <div className="af-circles">
          {VAULT_WORLDS.map((w) => (
            <div key={w.key} style={{ ['--wc' as string]: wc(w.key) }}>
              <h5>{worldName(w.key)}</h5>
              <ol>{(VAULT_CIRCLES[w.key] ?? []).map((o, i) => <li key={i}>{o[L]}</li>)}</ol>
            </div>
          ))}
        </div>
      )}
      {learn}
    </div>
  );
}

export { WORLD_KEYS };
