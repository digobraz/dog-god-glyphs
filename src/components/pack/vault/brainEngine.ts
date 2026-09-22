// ════════════════════════════════════════════════════════════════════════════
// MOZOG VAULTU — plátno (2026-09-21)
// ────────────────────────────────────────────────────────────────────────────
// PRENOS, NIE PREPIS. Zdroj je nákres `plany/nakres-vault-fasada-v5-2026-09-20.html`,
// sekcie 12 · 14 · 15 (recept `jadro`, ktorý je v nákrese východiskový). Čísla,
// prahy a poradie kreslenia sú odtiaľ a každé má v nákrese svoj dôvod — kto ich
// ladí, nech ich ladí TAM a prenesie sem, nie naopak.
//
// Z nákresu sem zámerne NEPRIŠLO:
//   · recepty guľa / prstence / sektory / packa / mozog / súhvezdie (dev pás),
//   · vrstvy POSTUP · MÔJ PES · PÔVOD (Zem) · SVORKA — bez obsahu nemajú čo ukázať,
//   · demo stavy „videné / prečítané" (nákres si ich nasypal sám). Farba uzla je
//     STAV ČÍTANIA (modrá nedotknuté · žltá videné · zelená prečítané) a dnes nikto
//     nič neprečítal, takže je všetko modré. Stav pribudne so zvitkami.
//
// 22. 9. 2026 (Matej nad `plany/nakres-vault-zamok-2026-09-22.html`):
//   · „dajme B svieti celý svet" — poloha `dim` ZANIKLA, mozog svieti vždy naplno,
//   · „všetky svety môžu mať názvy okruhov, ďalej už nie" — meno SVETA je pod
//     bublinou stále, meno OKRUHU pri priblížení a na dotyk, zvitok ostáva bez nápisu,
//   · „na mobile môže byť to jadro priblížené a ikony svetov väčšie" — `MOBIL`.
//
// Pribudlo navyše: PRIBLÍŽENIE DVOMA PRSTAMI. Nákres ho nemal (bežal na myši);
// na mobile je to jediné koliesko, ktoré človek má.
//
// ⚠️ Plátno je VANILLA, nie React — to isté pravidlo ako GodsGrid. React mu dá
//    <canvas>, rozmery a callbacky; 60 snímok za sekundu cez stav by prekresľovalo
//    celý strom.
// ════════════════════════════════════════════════════════════════════════════
import type { VaultWorld } from './worlds';

export type BrainRole = 'root' | 'w' | 'o' | 'z';

interface Node {
  x: number; y: number; role: BrainRole; wi: number; sz: number;
  dx: number; dy: number; vx: number; vy: number; sx: number; sy: number;
  ex: number; ph: number; lw: number; nb: Node[];
  /** poradie okruhu vo svete (len `o`, inak -1) */
  oi: number;
}

export interface BrainTip { title: string; sub?: string; hint?: string }

export interface BrainOptions {
  canvas: HTMLCanvasElement;
  tip: HTMLDivElement;
  worlds: readonly VaultWorld[];
  worldName: (wi: number) => string;
  /** Meno okruhu `oi` vo svete `wi` (poradie = O1, O2 … z rozpadu). */
  circleName: (wi: number, oi: number) => string;
  head: string;
  /** Mobilný pohľad — priblížené jadro a väčšie bubliny svetov. */
  isMobile: () => boolean;
  /** Rezerva hore a dole v px (horný pás; lišta + pilulka) — mozog sa centruje do zvyšku. */
  insets: () => { top: number; bottom: number };
  describe: (role: BrainRole, wi: number, oi: number) => BrainTip | null;
  onWorld: (wi: number) => void;
  onRoot: () => void;
}

export interface BrainHandle {
  zoomBy: (k: number) => void;
  reset: () => void;
  resize: () => void;
  destroy: () => void;
}

const TAU = 6.2832;
const RBASE = 470; /* polomer kruhu v jednotkách plátna */
/* recept `jadro` z nákresu — `fit` .62 = mapa o polovicu väčšia než pôvodných .48 */
const C = { w: 0.30, spread: 0.80, zr: 4.2, fit: 0.62, fitPc: 1.05 };
/* ⚠️ `fitPc` (Matej 22. 9.: „základná pozícia asi takáto — zväčši to" + 16:27 „zväčši zoom na jadro"): PC štartuje
   väčší mozog; mobil má vlastné priblíženie cez `MOBIL.zoom` nad `fit`, preto ho
   táto zmena nesmie posunúť. */
/* FARBA UZLA = STAV, NIE OZDOBA (nákres §12). Dnes existuje len „nedotknuté". */
const COL = { modra: '59,158,255', cyan: '91,224,240' };
/* Uzol sa smie rozhrnúť, nie odniesť (nákres §15). */
const MAX_TAH = 70;
/* MOBIL (Matej 22. 9.): jadro priblížené, bubliny svetov a stred väčšie. Okraj
   mozgu vtedy pretečie mimo okna — ťah ho posunie, dva prsty oddialia na celok. */
const MOBIL = { zoom: 1.6, bubble: 1.3, cap: 1.1 };
/* Meno okruhu sa píše až od tohto násobku celkového pohľadu — pri celku by 62
   nápisov bolo len šum. Na dotyk sa píše vždy. */
const OKRUH_OD = 1.9;

/** Zvyšok po delení sa rozdá prvým okruhom, nech súčet sedí do posledného kusa. */
function split(total: number, parts: number) {
  const base = Math.floor(total / parts), rest = total - base * parts, out: number[] = [];
  for (let i = 0; i < parts; i++) out.push(base + (i < rest ? 1 : 0));
  return out;
}

/** Pomer obrázka na plátne — `drawImage(im,x,y,2r,2r)` sploštil hlavu o 17,5 % (Matej 20. 9.). */
function drawFit(c: CanvasRenderingContext2D, im: HTMLImageElement, cx: number, cy: number, box: number, fit: 'cover' | 'contain') {
  const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
  if (!iw || !ih) return;
  const k = fit === 'cover' ? Math.max(box / iw, box / ih) : Math.min(box / iw, box / ih);
  c.drawImage(im, cx - (iw * k) / 2, cy - (ih * k) / 2, iw * k, ih * k);
}

/** Nápis smeruje OD stredu (`ox,oy`) von — hore nad uzol, dole pod, do strán do strán.
 *  Pod bublinou vždy by dve susedné bubliny hore napísali mená cez seba (snímka 22. 9.). */
function labelAt(p: { sx: number; sy: number }, ox: number, oy: number, gap: number) {
  const a = Math.atan2(p.sy - oy, p.sx - ox), c = Math.cos(a), si = Math.sin(a);
  const align: CanvasTextAlign = c > 0.2 ? 'left' : c < -0.2 ? 'right' : 'center';
  const base: CanvasTextBaseline = si > 0.35 ? 'top' : si < -0.35 ? 'bottom' : 'middle';
  return { x: p.sx + c * gap, y: p.sy + si * gap, align, base };
}
type Box = { x0: number; y0: number; x1: number; y1: number };
function boxOf(x: number, y: number, w: number, h: number, align: CanvasTextAlign, base: CanvasTextBaseline): Box {
  const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  const y0 = base === 'top' ? y : base === 'bottom' ? y - h : y - h / 2;
  return { x0, y0, x1: x0 + w, y1: y0 + h };
}
const hits = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

function segDist(px: number, py: number, a: Node, b: Node) {
  const dx = b.sx - a.sx, dy = b.sy - a.sy, l2 = dx * dx + dy * dy;
  if (!l2) return Math.hypot(px - a.sx, py - a.sy);
  const t = Math.max(0, Math.min(1, ((px - a.sx) * dx + (py - a.sy) * dy) / l2));
  return Math.hypot(px - (a.sx + t * dx), py - (a.sy + t * dy));
}

export function mountBrain(o: BrainOptions): BrainHandle {
  const cv = o.canvas, tip = o.tip;
  const ctx = cv.getContext('2d')!;
  const N: Node[] = [];
  const E: [Node, Node][] = [];
  let W = 0, H = 0;
  let view = { x: 0, y: 0, k: 1 }, vt = { x: 0, y: 0, k: 1 };
  const ptr = { x: -1e5, y: -1e5 };
  let drag: Node | null = null, pan = false, moved = 0, last = { x: 0, y: 0 };
  /* `baseK` = mierka, pri ktorej je vidno CELÝ mozog; `homeK` = kde sa začína
     (na mobile priblížené). Posun je povolený nad `baseK`, teda aj na mobilnom štarte. */
  let HOLD: Node | null = null, down = false, baseK = 1, baseY = 0, homeK = 1;
  let HOV: Node | null = null, HOVE: [Node, Node] | null = null;
  let raf = 0, alive = true;
  const touches = new Map<number, { x: number; y: number }>();
  let pinch0 = 0, pinchK = 1;

  const mk = (x: number, y: number, role: BrainRole, wi: number, sz: number): Node => ({
    x, y, role, wi, sz, dx: 0, dy: 0, vx: 0, vy: 0, sx: 0, sy: 0, ex: 0, ph: 0, lw: 0, nb: [], oi: -1,
  });

  // ── ROZVRH — zhlukový (obsidian graph), nákres `layoutCluster` ─────────────
  // Výsek sveta je ÚMERNÝ počtu zvitkov; okruhy sa rozsypú po ploche výseku
  // („sunflower"), zvitky obiehajú svoj okruh zlatým uhlom.
  const total = o.worlds.reduce((s, w) => s + w.scrolls, 0);
  const root = mk(0, 0, 'root', -1, 30);
  N.push(root);
  let a0 = -Math.PI / 2; /* prvý svet začína hore, nie vpravo */
  o.worlds.forEach((w, wi) => {
    const span = (w.scrolls / total) * TAU, ac = a0 + span / 2;
    const wn = mk(Math.cos(ac) * RBASE * C.w, Math.sin(ac) * RBASE * C.w, 'w', wi, 26);
    N.push(wn); E.push([root, wn]);
    const per = split(w.scrolls, w.circles);
    for (let oi = 0; oi < w.circles; oi++) {
      const t = (oi + 0.5) / w.circles;
      const orad = RBASE * (0.20 + C.spread * Math.sqrt(t));
      const oa = a0 + span * (((oi * 0.6180339887) % 1) * 0.86 + 0.07);
      const ox = Math.cos(oa) * orad, oy = Math.sin(oa) * orad;
      const node = mk(ox, oy, 'o', wi, 6.5);
      node.oi = oi;
      N.push(node); E.push([wn, node]);
      for (let z = 0; z < per[oi]; z++) {
        /* ⚠️ Zhluk začína až ZA uzlom okruhu (26 j.): pri ~.79 je to 20 px, teda viac
           než 18px prah okruhu — pri 20 j. sa prvé zrno nedalo trafiť (nákres §12). */
        const ang = z * 2.39996 + oi, r = 26 + Math.sqrt(z) * C.zr;
        const zn = mk(ox + Math.cos(ang) * r, oy + Math.sin(ang) * r, 'z', wi, 2.9);
        N.push(zn); E.push([node, zn]);
      }
    }
    a0 += span;
  });
  /* LEVITÁCIA — fáza zlatým pomerom z PORADIA, nie náhodou: náhoda by pri každom
     prekreslení presypala pohyb. Perióda ~9–15 s — vidno to, ale neruší. */
  let EXTENT = 0;
  const BB = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 };
  N.forEach((p, i) => {
    p.ph = (i * 0.6180339887 * TAU) % TAU;
    p.lw = 0.42 + (i % 9) * 0.031;
    /* DOSAH ROZVRHU — východisková mierka sa z neho POČÍTA, nehádže sa. */
    EXTENT = Math.max(EXTENT, Math.hypot(p.x, p.y));
    BB.x0 = Math.min(BB.x0, p.x); BB.x1 = Math.max(BB.x1, p.x);
    BB.y0 = Math.min(BB.y0, p.y); BB.y1 = Math.max(BB.y1, p.y);
  });
  E.forEach((e) => { e[0].nb.push(e[1]); e[1].nb.push(e[0]); });

  const ICONS: HTMLImageElement[] = o.worlds.map((w) => { const im = new Image(); im.src = `/icons/pack/${w.ic}.svg`; return im; });
  const HEAD = new Image(); HEAD.src = o.head;
  /* ⚠️ `prefers-reduced-motion` vypína LEN pohyb — interakcia ostáva. */
  const LEVIT = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  function size() {
    const b = cv.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.max(1, Math.round(b.width * dpr)); cv.height = Math.max(1, Math.round(b.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = b.width; H = b.height;
  }
  const toScreen = (p: Node) => ({ x: W / 2 + (p.x + p.dx + view.x) * view.k, y: H / 2 + (p.y + p.dy + view.y) * view.k });

  function frame() {
    if (!alive) return;
    const TL = performance.now() * 0.001;
    view.x += (vt.x - view.x) * 0.18; view.y += (vt.y - view.y) * 0.18; view.k += (vt.k - view.k) * 0.18;
    N.forEach((p) => {
      /* rozbalenie mena sveta — mimo vetvy `drag`, inak by meno zmizlo pri ťahu */
      if (p.role === 'w') p.ex += ((HOV === p ? 1 : 0) - p.ex) * 0.18;
      if (p !== drag && (p.dx || p.dy || p.vx || p.vy)) {
        p.vx += -p.dx * 0.02; p.vy += -p.dy * 0.02; p.vx *= 0.72; p.vy *= 0.72;
        p.dx += p.vx; p.dy += p.vy;
        if (Math.abs(p.dx) < 0.1 && Math.abs(p.vx) < 0.1) { p.dx = 0; p.vx = 0; }
        if (Math.abs(p.dy) < 0.1 && Math.abs(p.vy) < 0.1) { p.dy = 0; p.vy = 0; }
      }
      const s = toScreen(p); p.sx = s.x; p.sy = s.y;
      if (LEVIT && p !== drag) {
        /* ⚠️ Levitácia v PIXELOCH (inak rastie s mierkou) a pripočítaná k tomu, čo sa
           kreslí AJ trafí — keby sa kreslilo inde, uzol by pod prstom unikal. */
        const am = p.role === 'z' ? 4.2 : p.role === 'root' ? 1.2 : 2.6;
        p.sx += Math.sin(TL * p.lw + p.ph) * am;
        p.sy += Math.cos(TL * p.lw * 0.83 + p.ph * 1.7) * am;
      }
    });
    ctx.clearRect(0, 0, W, H);
    const bub = o.isMobile() ? MOBIL.bubble : 1;
    /* Bublina rastie s mierkou len po strop — na mobile nižší, inak by pri priblížení
       svet zabral pol okna (snímka 22. 9.: r 74 px na 390 px širokom okne). */
    const kB = Math.min(o.isMobile() ? MOBIL.cap : 2.2, Math.max(0.5, view.k)) * bub;

    // 2 · VLÁKNA
    E.forEach((e) => {
      const a = e[0], b = e[1], kost = b.role !== 'z';
      /* ⚠️ Vlákno uzla pod prstom sa kreslí, AJ keď sú zrná pri oddialení skryté. */
      if (!kost && view.k < 0.42 && a !== HOV && b !== HOV) return;
      const hi = (HOVE && HOVE[0] === a && HOVE[1] === b) || (HOV && (a === HOV || b === HOV));
      ctx.lineWidth = hi ? 2.4 : kost ? 1.4 : 0.75;
      /* ⚠️ Zvýraznená spojnica je NEÓNOVO MODRÁ, nie zlatá — zlatá znamená „videné". */
      ctx.strokeStyle = hi ? 'rgba(140,240,255,.95)'
        : `rgba(${COL.cyan},${kost ? 0.24 : 0.11})`;
      ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
    });

    // 3 · UZLY — okruhy a zvitky
    N.forEach((p) => {
      if (p.role === 'w' || p.role === 'root') return; /* majú vlastnú bublinu nižšie */
      const col = p.role === 'z' ? COL.modra : COL.cyan, near = HOV === p;
      /* sused na druhom konci synapsy sa rozsvieti tiež — dotyk ukáže SPOJENIE */
      const syn = !!(HOV && !near && HOV.nb.indexOf(p) >= 0);
      let al = p.role === 'z' ? 0.55 : 1;
      if (syn) al = Math.min(1, al + 0.35);
      const sz = p.sz * Math.min(2.2, Math.max(0.5, view.k)) * (near ? 1.7 : syn ? 1.25 : 1);
      if (p.role !== 'z' || near || syn) { ctx.shadowBlur = near ? 26 : syn ? 20 : 14; ctx.shadowColor = `rgba(${col},.9)`; }
      else ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(${col},${al.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(p.sx, p.sy, Math.max(0.8, sz), 0, TAU); ctx.fill();
      /* obrys pri zvitku pod prstom — inak by sa 2px bod viditeľne nerozsvietil */
      if (near && p.role === 'z') {
        ctx.strokeStyle = 'rgba(140,240,255,.95)'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, sz + 4, 0, TAU); ctx.stroke();
      }
    });
    ctx.shadowBlur = 0;

    // 4 · MENÁ — najprv sa ZMERAJÚ nápisy svetov (tie majú prednosť), potom okruhy.
    //     Okruh, ktorého nápis by vliezol do iného nápisu, sa vynechá — pri priblížení
    //     sa uvoľní miesto a objaví sa sám. Ten pod prstom sa píše vždy.
    const zabrate: Box[] = [];
    const wFs = Math.round(Math.min(16, Math.max(12, 11 * view.k * bub + 3)));
    ctx.font = `700 ${wFs}px Cinzel, serif`;
    const wLbl = new Map<Node, ReturnType<typeof labelAt> & { name: string }>();
    N.forEach((p) => {
      if (p.role !== 'w') return;
      const r = p.sz * kB * (HOV === p ? 1.18 : 1);
      const name = o.worldName(p.wi).toUpperCase();
      const w = ctx.measureText(name).width + 6;
      let L = { ...labelAt(p, root.sx, root.sy, r + 6), name };
      let bx = boxOf(L.x, L.y, w, wFs + 6, L.align, L.base);
      /* Nápis, ktorý by vyšiel z okna (mobil, bočné svety), ide POD bublinu. */
      if (bx.x0 < 4 || bx.x1 > W - 4) {
        L = { x: Math.max(4 + w / 2, Math.min(W - 4 - w / 2, p.sx)), y: p.sy + r + 6, align: 'center', base: 'top', name };
        bx = boxOf(L.x, L.y, w, wFs + 6, L.align, L.base);
      }
      wLbl.set(p, L);
      zabrate.push(bx);
      zabrate.push({ x0: p.sx - r, y0: p.sy - r, x1: p.sx + r, y1: p.sy + r });
    });
    const vsetkyOkruhy = view.k >= baseK * OKRUH_OD;
    const okruhy = N.filter((p) => p.role === 'o' && (vsetkyOkruhy || HOV === p))
      .sort((a, b) => (a === HOV ? -1 : b === HOV ? 1 : 0));
    okruhy.forEach((p) => {
      const name = o.circleName(p.wi, p.oi);
      if (!name) return;
      const near = HOV === p;
      const fs = near ? 14 : 12;
      ctx.font = `${near ? 600 : 500} ${fs}px 'Space Grotesk', sans-serif`;
      const wn = p.nb.find((q) => q.role === 'w') ?? root;
      const L = labelAt(p, wn.sx, wn.sy, 10);
      const b = boxOf(L.x, L.y, ctx.measureText(name).width + 4, fs + 4, L.align, L.base);
      /* mimo plochy nad hlavičkou, pod lištou a za okrajom okna sa nepíše — orezané meno klame */
      const ins = o.insets();
      if (!near && (b.y0 < ins.top || b.y1 > H - ins.bottom * 0.6 || b.x0 < 2 || b.x1 > W - 2 || zabrate.some((z) => hits(z, b)))) return;
      zabrate.push(b);
      ctx.textAlign = L.align; ctx.textBaseline = L.base;
      ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(2,6,11,.9)';
      ctx.strokeText(name, L.x, L.y);
      ctx.fillStyle = near ? 'rgba(235,252,255,1)' : 'rgba(207,243,250,.86)';
      ctx.fillText(name, L.x, L.y);
    });

    // 5 · SVETY — neónová bublina s VYREZANOU ikonou · STRED = AINUBIS
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    N.forEach((p) => {
      if (p.role === 'root') {
        /* Medailón, nie výrez: hlava má vlastné farby, vyrezaná by bola čierna škvrna. */
        const rr = p.sz * kB * (HOV === p ? 1.18 : 1);
        ctx.shadowBlur = HOV === p ? 36 : 24; ctx.shadowColor = 'rgba(91,224,240,.95)';
        ctx.fillStyle = 'rgba(91,224,240,1)';
        ctx.beginPath(); ctx.arc(p.sx, p.sy, rr, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
        if (HEAD.complete) {
          ctx.save(); ctx.beginPath(); ctx.arc(p.sx, p.sy, rr - 1.5, 0, TAU); ctx.clip();
          drawFit(ctx, HEAD, p.sx, p.sy, rr * 2, 'cover'); ctx.restore();
        }
        return;
      }
      if (p.role !== 'w') return;
      const near = HOV === p;
      const r = p.sz * kB * (near ? 1.18 : 1);
      ctx.shadowBlur = near ? 34 : 20; ctx.shadowColor = `rgba(${COL.cyan},.95)`;
      ctx.fillStyle = `rgba(${COL.cyan},1)`;
      ctx.beginPath(); ctx.arc(p.sx, p.sy, r, 0, TAU); ctx.fill();
      ctx.shadowBlur = 0;
      const im = ICONS[p.wi];
      if (im && im.complete) {
        /* ⚠️ Ikona sa VYREZÁVA (`destination-out`), nekreslí — kit je zlatý a na modrej
           bubline by zlato bolo farbou bez významu. Tieň musí byť pred výrezom vypnutý. */
        ctx.globalCompositeOperation = 'destination-out';
        drawFit(ctx, im, p.sx, p.sy, r * 1.52, 'contain');
        ctx.globalCompositeOperation = 'source-over';
      }
      /* MENO SVETA JE PRI BUBLINE STÁLE (Matej 22. 9.) — do vtedy len na dotyk.
         Smer od stredu mozgu von (`labelAt`), poloha zmeraná v kroku 4. */
      const L = wLbl.get(p);
      if (!L) return;
      ctx.font = `700 ${wFs}px Cinzel, serif`;
      ctx.textAlign = L.align; ctx.textBaseline = L.base;
      /* ⚠️ NAJPRV TMAVÉ HALO, POTOM TEXT — žiara pred svietiacim pozadím nechráni. */
      ctx.lineJoin = 'round'; ctx.miterLimit = 2;
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(2,6,11,.92)';
      ctx.strokeText(L.name, L.x, L.y);
      ctx.shadowBlur = 8 + 10 * p.ex; ctx.shadowColor = 'rgba(140,240,255,.85)';
      ctx.fillStyle = `rgba(235,252,255,${(0.86 + 0.14 * p.ex).toFixed(2)})`;
      ctx.fillText(L.name, L.x, L.y);
      ctx.shadowBlur = 0; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    });
    raf = requestAnimationFrame(frame);
  }

  // ── ZÁSAHY — DVA PRAHY: kostra 18 px, zrno 9 px (nákres §14) ───────────────
  function hitNode(): Node | null {
    let best: Node | null = null, bd = 18;
    for (const p of N) { if (p.role === 'z') continue; const d = Math.hypot(p.sx - ptr.x, p.sy - ptr.y); if (d < bd) { bd = d; best = p; } }
    if (best) return best;
    bd = 9;
    for (const p of N) { if (p.role !== 'z') continue; const d = Math.hypot(p.sx - ptr.x, p.sy - ptr.y); if (d < bd) { bd = d; best = p; } }
    return best;
  }
  function hitEdge(): [Node, Node] | null {
    let best: [Node, Node] | null = null, bd = 7;
    for (const e of E) { if (e[1].role === 'z') continue; const d = segDist(ptr.x, ptr.y, e[0], e[1]); if (d < bd) { bd = d; best = e; } }
    return best;
  }
  function showTip(t: BrainTip | null, x = 0, y = 0) {
    if (!t) { tip.style.opacity = '0'; return; }
    tip.replaceChildren();
    const b = document.createElement('b'); b.textContent = t.title; tip.appendChild(b);
    if (t.sub) tip.appendChild(document.createTextNode(t.sub));
    if (t.hint) { const u = document.createElement('u'); u.textContent = t.hint; tip.appendChild(u); }
    tip.style.left = `${x}px`; tip.style.top = `${y}px`; tip.style.opacity = '1';
  }
  const panMozne = () => vt.k > baseK * 1.05;
  function hover() {
    HOV = hitNode(); HOVE = HOV ? null : hitEdge();
    if (HOV) {
      /* ⚠️ SVET NEMÁ BUBLINU S TEXTOM — meno si nesie sám, svietiace vedľa uzla. */
      showTip(HOV.role === 'w' ? null : o.describe(HOV.role, HOV.wi, HOV.oi), HOV.sx, HOV.sy);
      cv.style.cursor = 'pointer';
    } else if (HOVE) {
      showTip(o.describe(HOVE[1].role, HOVE[1].wi, HOVE[1].oi), (HOVE[0].sx + HOVE[1].sx) / 2, (HOVE[0].sy + HOVE[1].sy) / 2);
      cv.style.cursor = 'pointer';
    } else { showTip(null); cv.style.cursor = pan ? 'grabbing' : panMozne() ? 'grab' : 'default'; }
  }

  // ── OVLÁDANIE — MOZOG STOJÍ, UZLY SA DAJÚ ROZHRNÚŤ (nákres §15) ─────────────
  //   1. ťah za uzol ho rozhrne a pružina ho vráti — poloha je totožnosť,
  //   2. ťah po prázdne pri východiskovom pohľade nerobí nič,
  //   3. keď je priblížené, ťah posúva mapu — hranica je elipsa okolo rozvrhu.
  function drzVSieti() {
    /* ⚠️ HRANICA JE ELIPSA, NIE OBDĹŽNIK — v rohu boxu je pri kruhu prázdno. */
    const sx = (BB.x0 + BB.x1) / 2, sy = (BB.y0 + BB.y1) / 2;
    const rx = Math.max(1, ((BB.x1 - BB.x0) / 2) * 0.92), ry = Math.max(1, ((BB.y1 - BB.y0) / 2) * 0.92);
    const nx = (-vt.x - sx) / rx, ny = (-vt.y - sy) / ry, m = Math.hypot(nx, ny);
    if (m > 1) { vt.x = -(sx + (nx / m) * rx); vt.y = -(sy + (ny / m) * ry); view.x = vt.x; view.y = vt.y; }
  }
  /* ⚠️ Oddialenie na východisko vráti mapu do stredu — inak by ostala zaparkovaná mimo. */
  const panSpat = () => { if (!panMozne()) { vt.x = 0; vt.y = baseY; } else drzVSieti(); };
  const orez = (q: Node, max: number) => { const m = Math.hypot(q.dx, q.dy); if (m > max) { q.dx *= max / m; q.dy *= max / m; } };
  const at = (e: PointerEvent) => { const b = cv.getBoundingClientRect(); ptr.x = e.clientX - b.left; ptr.y = e.clientY - b.top; };
  const zoomTo = (k: number) => { vt.k = Math.max(0.35, Math.min(4.5, k)); panSpat(); };

  function reset() {
    /* ⚠️ Mozog sa centruje do plochy MEDZI horným pásom a spodnou lištou, nie do okna —
       inak si sadne pod pás a horná štvrtina zmizne (nákres: `vol = H - 110`). */
    const ins = o.insets();
    const vol = Math.min(W, H - ins.top - ins.bottom);
    const fit = o.isMobile() ? C.fit : C.fitPc;
    const k = Math.max(0.35, Math.min(2, (vol * fit) / Math.max(1, EXTENT)));
    /* Mobil začína priblížený na jadro; stred priblíženia je stred plochy, nie okna. */
    homeK = o.isMobile() ? k * MOBIL.zoom : k;
    const y = (ins.top - ins.bottom) / 2 / homeK;
    baseK = k; baseY = (ins.top - ins.bottom) / 2 / k;
    vt = { x: 0, y, k: homeK }; view = { x: 0, y, k: homeK };
    N.forEach((p) => { p.dx = p.dy = p.vx = p.vy = 0; });
  }
  function pick(p: Node) {
    if (p.role === 'root') { o.onRoot(); return; }
    o.onWorld(p.wi);
  }

  const onMove = (e: PointerEvent) => {
    if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) {
      const [a, b] = [...touches.values()];
      if (pinch0 > 0) { moved += 10; zoomTo(pinchK * (Math.hypot(a.x - b.x, a.y - b.y) / pinch0)); }
      return;
    }
    at(e);
    if (drag) {
      moved += Math.hypot(e.clientX - last.x, e.clientY - last.y);
      const ddx = (e.clientX - last.x) / view.k, ddy = (e.clientY - last.y) / view.k;
      drag.dx += ddx; drag.dy += ddy;
      /* susedia idú s ním tretinou — vlákno sa natiahne, nie odtrhne */
      drag.nb.forEach((q) => { q.dx += ddx * 0.3; q.dy += ddy * 0.3; orez(q, MAX_TAH * 0.5); });
      orez(drag, MAX_TAH);
      last = { x: e.clientX, y: e.clientY }; return;
    }
    if (pan) {
      const dx = e.clientX - last.x, dy = e.clientY - last.y; moved += Math.hypot(dx, dy);
      vt.x += dx / view.k; vt.y += dy / view.k; view.x += dx / view.k; view.y += dy / view.k;
      drzVSieti(); last = { x: e.clientX, y: e.clientY }; return;
    }
    if (down) moved += Math.hypot(e.clientX - last.x, e.clientY - last.y);
    hover();
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2) {
        const [a, b] = [...touches.values()];
        pinch0 = Math.hypot(a.x - b.x, a.y - b.y); pinchK = vt.k;
        drag = null; HOLD = null; pan = false; moved = 10; return;
      }
    }
    at(e); cv.setPointerCapture(e.pointerId); last = { x: e.clientX, y: e.clientY }; moved = 0; down = true;
    hover(); /* na dotyku nie je hover — zásah sa musí zmerať pri položení prsta */
    const n = hitNode();
    if (n) { drag = n; drag.vx = drag.vy = 0; HOLD = n; } else if (panMozne()) pan = true;
  };
  const onUp = (e: PointerEvent) => {
    touches.delete(e.pointerId); if (touches.size < 2) pinch0 = 0;
    /* prah 5 px odlíši klik od ťahu — inak by každé mrknutie rukou otváralo svet */
    if (down && moved < 5) {
      if (HOLD) pick(HOLD);
      else { const e2 = hitEdge(); if (e2) pick(e2[1]); }
    }
    drag = null; pan = false; HOLD = null; down = false;
  };
  const onLeave = () => { if (!down) { HOV = null; HOVE = null; showTip(null); } };
  const onWheel = (e: WheelEvent) => { e.preventDefault(); zoomTo(vt.k * Math.exp(-e.deltaY * 0.0015)); };

  cv.addEventListener('pointermove', onMove);
  cv.addEventListener('pointerdown', onDown);
  cv.addEventListener('pointerleave', onLeave);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  cv.addEventListener('wheel', onWheel, { passive: false });

  size(); reset(); raf = requestAnimationFrame(frame);

  return {
    zoomBy: (k) => zoomTo(vt.k * k),
    reset,
    resize: () => { size(); reset(); },
    destroy: () => {
      alive = false; cancelAnimationFrame(raf);
      cv.removeEventListener('pointermove', onMove);
      cv.removeEventListener('pointerdown', onDown);
      cv.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      cv.removeEventListener('wheel', onWheel);
    },
  };
}
