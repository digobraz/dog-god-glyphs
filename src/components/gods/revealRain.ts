/**
 * DOGTRIX DÁŽĎ PRE ODHALENIE NA STENE (Matej 16. 10. 2026, verzia A: *„rozžiari sa cez
 * celý telefón a následne je vidno DOGTRIX padajúce heroglyfy v pozadí — aj tento padne
 * dolu"*).
 *
 * Tie isté glyfy a tá istá hĺbka ako DOGTRIX v `/onepage` (`OnePage.tsx`, `DGX_RCLS`):
 * štyri triedy, PREDNÉ (veľké) idú POMALŠIE než zadné — zámer z 1. 9. 2026, veľký glyf pri
 * vysokej rýchlosti sa nedá prečítať. Bez réžie scrollu, bez halo spritu: dážď tu beží
 * pár sekúnd na pozadí, nie ako obrazovka filmu.
 */
const GLYPHS = Array.from({ length: 20 }, (_, i) => `/heroglyph/dogtrix/glyphs/${String(i + 1).padStart(2, '0')}.png`);
/** Pomer strán zvislého heroglyfu (w/h) — ten istý ako `DGX_GA` v OnePage. */
const GA = 0.323;
const CLASSES = [
  { w: 28, a: 0.40, v: 1.45 },
  { w: 42, a: 0.58, v: 1.12 },
  { w: 58, a: 0.75, v: 0.85 },
  { w: 78, a: 0.92, v: 0.62 },
];
const rnd = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.545; return x - Math.floor(x); };

let preloaded: HTMLImageElement[] | null = null;
/** Glyfy si stiahni vopred (pri štarte odhalenia), nech dážď nepríde prázdny. */
export function preloadRevealRain(): HTMLImageElement[] {
  if (!preloaded) preloaded = GLYPHS.map((src) => { const im = new Image(); im.decoding = 'async'; im.src = src; return im; });
  return preloaded;
}

/** Spustí dážď na plátne; vráti funkciu, ktorá ho zastaví. */
export function startRevealRain(cv: HTMLCanvasElement): () => void {
  const cx = cv.getContext('2d');
  if (!cx) return () => {};
  const imgs = preloadRevealRain();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = cv.clientWidth, H = cv.clientHeight;
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);

  type Drop = { x: number; w: number; h: number; v: number; a: number; span: number; y0: number; seed: number; gold: boolean };
  const drops: Drop[] = [];
  // Pruhy cez šírku: každý pruh nesie jednu triedu, poradie premiešané semienkom.
  let x = 0, k = 0;
  while (x < W) {
    const c = CLASSES[Math.floor(rnd(k, 3) * CLASSES.length)];
    const lane = c.w * 1.25;
    const h = c.w / GA;
    const gap = h * 1.9;
    const cnt = Math.ceil((H + h * 2) / gap) + 1;
    const span = cnt * gap;
    const v = (40 + rnd(k, 4) * 90) * c.v;
    const ph = rnd(k, 6) * span;
    for (let j = 0; j < cnt; j++) {
      drops.push({ x: x + lane / 2, w: c.w, h, v, a: c.a, span, y0: j * gap - ph, seed: k * 13 + j, gold: rnd(k * 13 + j, 41) < 0.18 });
    }
    x += lane; k++;
  }
  drops.sort((p, q) => p.w - q.w);

  const goldCache = new Map<HTMLImageElement, HTMLCanvasElement>();
  const goldOf = (im: HTMLImageElement) => {
    const hit = goldCache.get(im);
    if (hit) return hit;
    const c = document.createElement('canvas');
    c.width = im.naturalWidth; c.height = im.naturalHeight;
    const g = c.getContext('2d')!;
    g.drawImage(im, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = '#B8871F';
    g.fillRect(0, 0, c.width, c.height);
    goldCache.set(im, c);
    return c;
  };

  let raf = 0;
  const t0 = performance.now();
  const frame = (now: number) => {
    const t = (now - t0) / 1000;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, W, H);
    for (const d of drops) {
      const raw = d.y0 + t * d.v;
      const cyc = Math.floor(raw / d.span);
      const y = raw - cyc * d.span - d.h;
      if (y > H || y + d.h < 0) continue;
      const im = imgs[Math.floor(rnd(d.seed * 7919 + cyc, 31) * imgs.length)];
      if (!im.complete || !im.naturalWidth) continue;
      const prog = (y + d.h) / (H + d.h);
      cx.globalAlpha = d.a * Math.min(1, prog / 0.1) * Math.min(1, (1 - prog) / 0.4);
      cx.drawImage(d.gold ? goldOf(im) : im, d.x - d.w / 2, y, d.w, d.h);
    }
    cx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
