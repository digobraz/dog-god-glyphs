import { useEffect, useRef } from 'react';

/** ZNALOSTNÝ LIEVIK (Matej 6. 11.: „animáciu znalostného lievika — koľko informácií z koľkých zdrojov“).
 *  Častice padajú zhora (zdroje), lievik ich zužuje, na troch filtroch ubúdajú, dole vychádzajú zlaté.
 *  Beží len pri obrazovke; prefers-reduced-motion = jeden statický snímok. Steny a filtre ladia s `.ai-rings`. */
const COLS = ['#5BE0F0', '#CFF3FA', '#3B9EFF', '#8FD3FF', '#E6FAFF'];
export const RINGS = [0.24, 0.5, 0.75];

export function AiFunnel({ run }: { run: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv || !run) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    let W = 0, H = 0, raf = 0;
    type P = { x: number; y: number; v: number; r: number; c: string; k: number };
    let parts: P[] = [];
    const size = () => {
      const r = cv.getBoundingClientRect(), d = devicePixelRatio || 1;
      W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const half = (y: number) => {
      const top = Math.min(W * 0.46, 440), neck = 18, p = Math.max(0, y / H);
      return p < 0.82 ? top - (top - neck) * Math.pow(p / 0.82, 0.8) : neck;
    };
    const spawn = () => {
      const hw = half(0);
      parts.push({ x: W / 2 + (Math.random() * 2 - 1) * hw, y: 0, v: 0.9 + Math.random() * 1.4, r: 0.8 + Math.random() * 1.8, c: COLS[(Math.random() * COLS.length) | 0], k: Math.random() * 2 - 1 });
    };
    const draw = (move: boolean) => {
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      for (let y = 0; y <= H; y += 6) ctx.lineTo(W / 2 - half(y), y);
      ctx.moveTo(W / 2 + half(0), 0);
      for (let y = 0; y <= H; y += 6) ctx.lineTo(W / 2 + half(y), y);
      ctx.strokeStyle = 'rgba(91,224,240,.35)'; ctx.lineWidth = 1.5; ctx.stroke();
      RINGS.forEach((p) => {
        const y = H * p + 11, hw = half(y), g = ctx.createLinearGradient(W / 2 - hw, 0, W / 2 + hw, 0);
        g.addColorStop(0, 'rgba(91,224,240,0)'); g.addColorStop(0.5, 'rgba(91,224,240,.55)'); g.addColorStop(1, 'rgba(91,224,240,0)');
        ctx.fillStyle = g; ctx.fillRect(W / 2 - hw, y, hw * 2, 1.5);
      });
      if (move) for (let i = 0; i < 4; i++) spawn();
      parts = parts.filter((q) => {
        if (move) {
          q.y += q.v * (1 + (q.y / H) * 1.6);
          q.x += (W / 2 + q.k * half(q.y) * 0.9 - q.x) * 0.04;
          const p = q.y / H;
          if (RINGS.some((r) => p > r + 0.01 && p < r + 0.02) && Math.random() < 0.35) return false;
        }
        const gold = q.y / H > 0.78;
        ctx.beginPath(); ctx.arc(q.x, q.y, gold ? q.r + 0.6 : q.r, 0, 7);
        ctx.fillStyle = gold ? '#F5C73D' : q.c; ctx.shadowColor = gold ? '#F5C73D' : '#5BE0F0'; ctx.shadowBlur = gold ? 10 : 6; ctx.fill();
        return q.y < H + 6;
      });
      ctx.shadowBlur = 0;
    };
    size();
    addEventListener('resize', size);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (let i = 0; i < 220; i++) { spawn(); const q = parts[parts.length - 1]; q.y = Math.random() * H; q.x = W / 2 + q.k * half(q.y) * 0.9; }
      draw(false);
    } else {
      const f = () => { draw(true); raf = requestAnimationFrame(f); };
      raf = requestAnimationFrame(f);
    }
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); };
  }, [run]);
  return <canvas ref={ref} aria-hidden />;
}
