// KARTA DŇA — kresba na canvas 9:16 (Instagram Story 1080×1920), 25. 11. 2026.
// Zadanie `plany/zadanie-karta-dna-2026-11-25.md`, nákres `plany/nakresy/zdielanie-zapisu-2026-11-25/index.html`
// (rozloženie `DEF` + vrch D `topHTML('D')`, CSS `.vF` / `.tD`). Všetky miery sú v `u` = 1 % šírky karty,
// presne ako `cqw` v nákrese — malý náhľad aj veľký obrázok sa kreslia tou istou funkciou.
//
// Zhora: fotka 43 % · vrch D na hrane fotky (človek + štít Služobníka + kôpka psov s lapisovým #číslom)
// · meno + pilulka dní · dátum vľavo, labky vpravo · správa (max 2 riadky) · aktivity s názvom · veta + hlava psa + dogypt.com.

/** Farby z nákresu (papyrus, zlato = rám, lapis = pilulka). */
const C = {
  paperHi: '#FBF5E6', paper: '#F3E4C4', paperLo: '#E6D2A6',
  ink: '#2A1608', inkWarm: '#7A5A2A',
  gold: '#C99A3F', goldInk: '#8A5A14',
  lapisHi: '#1E3C90', lapisDeep: '#0A1A4A', lapisRim: '#EFD79A',
  shadow: 'rgba(60,35,8,.3)',
} as const;

export const KD_W = 1080;
export const KD_H = 1920;
/** Rodina pre canvas — načíta ju `loadKartaFonts` priamo zo súboru, nezávisle od šatu stránky. */
const MUSEUM = '"KD Museum"';
const FIRA = "'Space Grotesk',sans-serif";

export interface KartaDog { name: string; number: number | null; img: HTMLImageElement | null }
export interface KartaAct { img: HTMLImageElement | null; name: string; n: number }
export interface KartaData {
  photo: HTMLImageElement | null;
  dogs: KartaDog[];
  human: { name: string; img: HTMLImageElement | null; initial: string; badge: HTMLImageElement | null; days: string | null };
  date: string;
  rating: number;
  paw: { on: HTMLImageElement | null; off: HTMLImageElement | null };
  msg: string;
  acts: KartaAct[];
  more: string;
  /** Veta dole; zlaté je JEDNO slovo (`gold`). */
  veta: { pre: string; gold: string; post: string };
  head: HTMLImageElement | null;
}

let museum: Promise<unknown> | null = null;
/** LT Museum (Black) + Fira v potrebných váhach. Bez toho by canvas kreslil náhradným písmom. */
export function loadKartaFonts(): Promise<unknown> {
  museum ??= new FontFace('KD Museum', 'url(/fonts/museum-black.woff2)').load().then((f) => { document.fonts.add(f); }).catch(() => undefined);
  return Promise.all([museum, document.fonts.load(`400 40px ${FIRA}`), document.fonts.load(`500 40px ${FIRA}`), document.fonts.load(`600 40px ${FIRA}`),
    document.fonts.load(`700 40px ${FIRA}`), document.fonts.load(`italic 400 40px ${FIRA}`)]).catch(() => undefined);
}

const imgCache = new Map<string, Promise<HTMLImageElement | null>>();
export function loadImg(src: string | null | undefined): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  const hit = imgCache.get(src);
  if (hit) return hit;
  const p = new Promise<HTMLImageElement | null>((res) => {
    const i = new Image();
    if (!src.startsWith('blob:') && !src.startsWith('data:')) i.crossOrigin = 'anonymous';
    i.onload = () => res(i); i.onerror = () => res(null); i.src = src;
  });
  imgCache.set(src, p);
  return p;
}

/** Obrázok na plochu „cover" (vyplní, oreže), `fy` = kde držať zvislý stred (0 hore · .5 stred). */
function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, fy = 0.5) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / s, sh = h / s;
  const sx = (img.naturalWidth - sw) / 2, sy = (img.naturalHeight - sh) * fy;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function circleImg(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, cx: number, cy: number, d: number, ring: number, shadow: [number, number], fallback?: string) {
  const r = d / 2;
  ctx.save();
  ctx.shadowColor = C.shadow; ctx.shadowOffsetY = shadow[0]; ctx.shadowBlur = shadow[1];
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r - ring, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = C.paperLo; ctx.fillRect(cx - r, cy - r, d, d);
  if (img) cover(ctx, img, cx - r + ring, cy - r + ring, d - 2 * ring, d - 2 * ring, 0.3);
  else if (fallback) {
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `400 ${d * 0.42}px ${MUSEUM}`; ctx.fillText(fallback, cx, cy + d * 0.03);
  }
  ctx.restore();
}

/** Lapisová pilulka (číslo psa, dni). Vráti šírku. `x` je ľavý okraj, `y` horný. */
function lapisPill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fs: number, padX: number, padY: number, rim: number): { w: number; h: number } {
  ctx.font = `600 ${fs}px ${FIRA}`;
  const tw = ctx.measureText(text).width;
  const w = tw + padX * 2 + rim * 2, h = fs + padY * 2 + rim * 2;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2);
  if (rim) { ctx.fillStyle = C.lapisRim; ctx.fill(); ctx.beginPath(); ctx.roundRect(x + rim, y + rim, w - 2 * rim, h - 2 * rim, (h - 2 * rim) / 2); }
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, C.lapisHi); g.addColorStop(1, C.lapisDeep);
  ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + fs * 0.04);
  return { w, h };
}

const CJK = /[\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]/;
/** Riadky textu do šírky; posledný povolený riadok skráti trojbodkou. Písmo bez medzier (CJK) delí po znakoch,
 *  ostatné len na medzere — slovo sa nikdy nerozdelí („Prechádzk|a“). */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const chars = CJK.test(text) && !/\s/.test(text.trim());
  const words = chars ? Array.from(text.trim()) : text.trim().split(/\s+/);
  const join = chars ? '' : ' ';
  const lines: string[] = [];
  let cur = '';
  for (let i = 0; i < words.length; i++) {
    const next = cur ? cur + join + words[i] : words[i];
    if (ctx.measureText(next).width <= maxW || !cur) { cur = next; continue; }
    lines.push(cur); cur = words[i];
    if (lines.length === maxLines) { cur = ''; break; }
  }
  if (cur) lines.push(cur);
  const all = lines.join(join).length < text.trim().replace(/\s+/g, join).length;
  if (lines.length > maxLines || all) {
    const out = lines.slice(0, maxLines);
    let last = out[maxLines - 1] ?? '';
    while (last && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1);
    out[maxLines - 1] = last.trimEnd() + '…';
    return out;
  }
  return lines;
}

export function drawKarta(cv: HTMLCanvasElement, d: KartaData, W = KD_W): void {
  const H = Math.round(W * 16 / 9);
  if (cv.width !== W) cv.width = W;
  if (cv.height !== H) cv.height = H;
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const u = W / 100;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';

  // papyrus
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, C.paperHi); bg.addColorStop(0.75, C.paper); bg.addColorStop(1, C.paperLo);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // ── FOTKA 43 % (bez fotky = koláž profiloviek psov)
  const ph = H * 0.43;
  ctx.fillStyle = C.paperLo; ctx.fillRect(0, 0, W, ph);
  if (d.photo) cover(ctx, d.photo, 0, 0, W, ph, 0.35);
  else {
    const pics = d.dogs.map((g) => g.img).filter((x): x is HTMLImageElement => !!x);
    pics.forEach((img, i) => { const w = W / pics.length; ctx.save(); ctx.beginPath(); ctx.rect(i * w, 0, w, ph); ctx.clip(); cover(ctx, img, i * w, 0, w, ph, 0.35); ctx.restore(); });
  }
  ctx.fillStyle = C.gold; ctx.fillRect(0, ph - 0.8 * u, W, 0.8 * u);

  // ── VRCH D: človek + štít + kôpka psov
  const n = Math.max(1, d.dogs.length);
  const hmD = (n === 1 ? 24 : n === 2 ? 22 : n === 3 ? 20 : 18) * u;
  const dmD = (n === 1 ? 17 : n === 2 ? 15 : n === 3 ? 13 : 11) * u;
  const mt = (n === 1 ? 6 : n === 2 ? 5.5 : 5) * u;
  const ml = (n >= 3 ? 9.5 : 10) * u;
  const numFs = (n === 1 ? 3 : n >= 3 ? 2.4 : 2.5) * u;
  const top = H * 0.37, hx = 6 * u;
  circleImg(ctx, d.human.img, hx + hmD / 2, top + hmD / 2, hmD, 1 * u, [1 * u, 3 * u], d.human.initial);
  const hmR = hx + hmD, hmB = top + hmD;
  if (d.human.badge) {
    const bw = 22 * u, bh = bw * d.human.badge.naturalHeight / d.human.badge.naturalWidth;
    ctx.save(); ctx.shadowColor = C.shadow; ctx.shadowOffsetY = 0.6 * u; ctx.shadowBlur = 1 * u;
    ctx.drawImage(d.human.badge, hmR + 11 * u - bw, hmB + 4.5 * u - bh, bw, bh);
    ctx.restore();
  }
  // prvý pes navrchu → kreslí sa od posledného
  const sx = hmR + ml, sy = top + mt, step = dmD - 3.2 * u;
  for (let i = d.dogs.length - 1; i >= 0; i--) {
    const g = d.dogs[i], x = sx + i * step;
    circleImg(ctx, g.img, x + dmD / 2, sy + dmD / 2, dmD, 0.6 * u, [0.8 * u, 2 * u], (g.name || '?').slice(0, 1));
    if (g.number != null) {
      const t = `#${g.number}`;
      ctx.font = `600 ${numFs}px ${FIRA}`;
      const pw = ctx.measureText(t).width + 2.6 * u + 0.6 * u, phh = numFs + 1.2 * u + 0.6 * u;
      lapisPill(ctx, t, x + dmD + 1.4 * u - pw, sy + dmD + 1 * u - phh, numFs, 1.3 * u, 0.6 * u, 0.3 * u);
    }
  }

  // meno + pilulka dní (jeden riadok, pri dlhom mene sa meno zmenší)
  const txY = hmB + 2.6 * u;
  let nameFs = 5.6 * u;
  const pillFs = 3 * u;
  ctx.font = `600 ${pillFs}px ${FIRA}`;
  const pillW = d.human.days ? ctx.measureText(d.human.days).width + 5.6 * u : 0;
  const nameMax = 88 * u - (pillW ? pillW + 2.4 * u : 0);
  ctx.font = `400 ${nameFs}px ${MUSEUM}`;
  while (nameFs > 3.6 * u && ctx.measureText(d.human.name).width > nameMax) { nameFs -= 0.2 * u; ctx.font = `400 ${nameFs}px ${MUSEUM}`; }
  const rowH = 5.6 * u, mid = txY + rowH / 2;
  ctx.fillStyle = C.ink; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  let name = d.human.name;
  while (name.length > 1 && ctx.measureText(name).width > nameMax) name = name.slice(0, -1);
  if (name !== d.human.name) name = name.trimEnd() + '…';
  ctx.fillText(name, hx, mid + nameFs * 0.06);
  const nw = ctx.measureText(name).width;
  if (d.human.days) lapisPill(ctx, d.human.days, hx + (name ? nw + 2.4 * u : 0), mid - (pillFs + 2.6 * u) / 2, pillFs, 2.8 * u, 1.3 * u, 0);

  // ── DÁTUM vľavo · LABKY vpravo
  const rowY = H * 0.613;
  ctx.font = `600 ${3 * 0.89 * u}px ${FIRA}`;
  ctx.fillStyle = C.goldInk; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${0.2 * 3 * 0.89 * u}px`;
  ctx.fillText(d.date.toUpperCase(), 6.44 * u, rowY);
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '0px';
  if (d.rating > 0) {
    const pw = 5.6 * 1.15 * u, gap = 1 * 1.15 * u;
    const right = 91.6 * u;
    for (let i = 0; i < 5; i++) {
      const im = i < d.rating ? d.paw.on : d.paw.off;
      if (im) ctx.drawImage(im, right - (5 - i) * pw - (4 - i) * gap, rowY - pw / 2, pw, pw);
    }
  }

  // ── SPRÁVA (max 2 riadky, zlatá čiara vľavo)
  const msg = d.msg.trim();
  /** Kde končí správa (bez správy = riadok dátumu) — dva rady aktivít začnú hneď pod ňou. */
  let msgEnd = H * 0.613 + 3 * u;
  if (msg) {
    const fs = 4.1 * u, lh = fs * 1.35, mx = 6.45 * u, my = H * 0.6506;
    ctx.font = `italic 400 ${fs}px ${FIRA}`;
    const lines = wrap(ctx, msg, 88 * u - 3.8 * u, 2);
    ctx.fillStyle = C.gold; ctx.fillRect(mx, my, 0.8 * u, lines.length * lh);
    ctx.fillStyle = C.ink; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    lines.forEach((l, i) => ctx.fillText(l, mx + 3.8 * u, my + lh * i + lh / 2));
    msgEnd = my + lines.length * lh;
  }

  // ── AKTIVITY: ≤6 jeden riadok · 7–12 dva riadky po 6 · >12 → 11 + „+N"
  const acts = d.acts;
  if (acts.length) {
    const many = acts.length > 6, cut = acts.length > 12;
    const shown = cut ? acts.slice(0, 11) : acts;
    const ax = 5.86 * u, aw = 88 * u, ay = many ? Math.min(H * 0.7421, msgEnd + 3 * u) : H * 0.7421;
    const cols = many ? 6 : shown.length + (cut ? 1 : 0);
    const colW = many ? (aw - 5 * 1 * u) / 6 : aw / cols;
    let im = (many ? 8.5 : 10.5) * u, fs = (many ? 2.4 : 2.7) * u;
    // Výška radu = jeho najdlhší názov (1 alebo 2 riadky); keď sa rady nevojdú nad vetu, všetko sa pomerne zmenší.
    const linesOf = (from: number, to: number) => {
      ctx.font = `500 ${fs}px ${FIRA}`;
      const names = [...shown.slice(from, to).map((a) => a.name), ...(cut && to > 11 ? [d.more] : [])];
      return Math.max(1, ...names.map((t) => wrap(ctx, t, colW - 1 * u, 2).length));
    };
    const rows = many ? [[0, 6], [6, 12]] : [[0, shown.length]];
    const room = H * 0.8805 - 2 * u - ay;
    for (let g = 0; g < 8; g++) {
      const need = rows.reduce((a, [f, t], i) => a + im + 1 * u + fs * 1.1 * linesOf(f, t) + (i ? 2 * u : 0), 0);
      if (need <= room) break;
      im *= 0.93; fs *= 0.93;
    }
    const lh = fs * 1.1;
    const rowY: number[] = [];
    rows.reduce((y, [f, t]) => { rowY.push(y); return y + im + 1 * u + lh * linesOf(f, t) + 2 * u; }, ay);
    const cell = (i: number) => ({ x: ax + (i % (many ? 6 : cols)) * (colW + (many ? 1 * u : 0)), y: rowY[many ? Math.floor(i / 6) : 0] });
    ctx.textAlign = 'center';
    shown.forEach((a, i) => {
      const { x, y } = cell(i), cx = x + colW / 2;
      if (a.img) {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowOffsetY = 0.6 * u; ctx.shadowBlur = 1 * u;
        ctx.drawImage(a.img, cx - im / 2, y, im, im); ctx.restore();
      }
      if (a.n > 1) {
        const t = `×${a.n}`, bfs = 2.5 * u;
        ctx.font = `700 ${bfs}px ${FIRA}`;
        const bw = ctx.measureText(t).width + 2.4 * u, bh = bfs + 1.2 * u;
        const bx = Math.min(x + colW - 1 * u - bw, cx + im / 2 - bw * 0.4);
        ctx.beginPath(); ctx.roundRect(bx, y - 1 * u, bw, bh, bh / 2); ctx.fillStyle = C.goldInk; ctx.fill();
        ctx.fillStyle = '#FFFFFF'; ctx.textBaseline = 'middle'; ctx.fillText(t, bx + bw / 2, y - 1 * u + bh / 2);
      }
      let afs = fs;
      ctx.font = `500 ${afs}px ${FIRA}`;
      const longest = Math.max(...a.name.split(/\s+/).map((w) => ctx.measureText(w).width));
      if (longest > colW - 1 * u) { afs = fs * (colW - 1 * u) / longest; ctx.font = `500 ${afs}px ${FIRA}`; }
      ctx.fillStyle = C.ink; ctx.textBaseline = 'middle';
      wrap(ctx, a.name, colW - 1 * u, 2).forEach((l, k) => ctx.fillText(l, cx, y + im + 1 * u + lh * k + lh / 2));
    });
    if (cut) {
      const { x, y } = cell(11), cx = x + colW / 2, r = im / 2;
      ctx.beginPath(); ctx.arc(cx, y + r, r, 0, Math.PI * 2); ctx.fillStyle = C.paperHi; ctx.fill();
      ctx.lineWidth = 0.4 * u; ctx.strokeStyle = C.gold; ctx.stroke();
      ctx.font = `700 ${3.2 * u}px ${FIRA}`; ctx.fillStyle = C.goldInk; ctx.textBaseline = 'middle';
      ctx.fillText(`+${acts.length - 11}`, cx, y + r);
      ctx.font = `500 ${fs}px ${FIRA}`; ctx.fillStyle = C.ink;
      ctx.fillText(d.more, cx, y + im + 1 * u + lh / 2);
    }
  }

  // ── VETA (LT Museum, zlaté jedno slovo) — jeden riadok, inak dva vyvážené
  drawVeta(ctx, d.veta, W / 2, H * 0.8805, 79 * u, 3.86 * u);

  // ── hlava psa + dogypt.com
  const lg = 5.5 * u, ly = H * 0.926 + lg / 2;
  ctx.font = `500 ${2.9 * u}px ${FIRA}`;
  const site = 'dogypt.com', sw = ctx.measureText(site).width;
  const hw = d.head ? lg * d.head.naturalWidth / d.head.naturalHeight : 0;
  const total = hw + (hw ? 2 * u : 0) + sw;
  let lx = W / 2 - total / 2;
  if (d.head) { ctx.drawImage(d.head, lx, ly - lg / 2, hw, lg); lx += hw + 2 * u; }
  ctx.fillStyle = C.inkWarm; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(site, lx, ly);
}

function drawVeta(ctx: CanvasRenderingContext2D, v: KartaData['veta'], cx: number, top: number, maxW: number, fs0: number) {
  type Tok = { t: string; gold: boolean };
  const spaced = /\s/.test(`${v.pre}${v.gold}${v.post}`.trim()) || !!v.pre.trim() || !!v.post.trim();
  const toks: Tok[] = [];
  const push = (s: string, gold: boolean) => {
    if (!s) return;
    if (!spaced) { toks.push({ t: s, gold }); return; }
    // interpunkcia prilepená k zlatému slovu ostáva pri ňom, medzery delia slová
    s.split(/(\s+)/).filter(Boolean).forEach((p) => toks.push({ t: p, gold }));
  };
  push(v.pre, false); push(v.gold, true); push(v.post, false);
  let fs = fs0;
  for (let guard = 0; guard < 20; guard++) {
    ctx.font = `400 ${fs}px ${MUSEUM}`;
    const w = (ts: Tok[]) => ts.reduce((a, x) => a + ctx.measureText(x.t).width, 0);
    const trim = (ts: Tok[]) => { const o = [...ts]; while (o.length && !o[0].t.trim()) o.shift(); while (o.length && !o[o.length - 1].t.trim()) o.pop(); return o; };
    let lines: Tok[][] = [trim(toks)];
    if (w(lines[0]) > maxW) {
      let best: Tok[][] | null = null, bestW = Infinity;
      for (let i = 1; i < toks.length; i++) {
        if (toks[i].t.trim()) continue;   // deliť len na medzere
        const a = trim(toks.slice(0, i)), b = trim(toks.slice(i + 1));
        const m = Math.max(w(a), w(b));
        if (m < bestW) { bestW = m; best = [a, b]; }
      }
      if (best) lines = best;
    }
    if (lines.every((l) => w(l) <= maxW) || fs < fs0 * 0.6) {
      const lh = fs * 1.1;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      lines.forEach((l, k) => {
        let x = cx - w(l) / 2;
        const y = top + lh * k + lh / 2;
        for (const tk of l) { ctx.fillStyle = tk.gold ? C.goldInk : C.ink; ctx.fillText(tk.t, x, y); x += ctx.measureText(tk.t).width; }
      });
      return;
    }
    fs *= 0.94;
  }
}
