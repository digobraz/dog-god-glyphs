import { useCallback, useEffect, useRef, useState } from "react";
import { PageTopBar } from "@/components/PageTopBar";
import { useT } from "@/i18n/LanguageContext";

// ── /404 — "Hekthor's Run" v novom brande (Matej 11. 11. 2026) ──────────
// „urob ju v novom brande… vygeneruj hektorov obrázok… aj kliešte máme… nech to vyzerá
// dobre ako profi hra + fonty“. Písmo a papyrus nového webu /app (LT Museum, lapis CTA,
// D-BLOK okolo hracej plochy). Grafika = Kie sprity z Hektorovho odznaku a kliešťa
// z mapy (`plany/nakresy/404-hra-2026-11-11/gen.mjs` → `public/images/404/`).
// Hra je vanilla <canvas>; fyzika v logických jednotkách, čas v 60 fps krokoch (120 Hz displej
// nebeží dvakrát rýchlejšie). Výška logického sveta je pevná, šírka podľa pomeru plochy.

const VH = 400;              // logická výška
const GROUND = 336;          // čiara, na ktorej Hektor beží
const GRAVITY = 0.9;
const JUMP_V = -17.5;
const JUMP_CUT = 0.45;       // pustený prst = kratší skok
const DOG_H = 112;
const DOG_X = 120;
const SPEED0 = 7;

// ZAJAC (Matej 11. 11.: „nech má cieľ… zajac pred ním uteká a pri dlhom prenasledovaní ho nakoniec
// chytí… ale bude to náročné“). Odstup 1 → 0 sa sám zmenšuje za ~80 s, loptička a kosť ho skrátia.
const CHASE_FRAMES = 60 * 80;
const BALL_GAIN = 0.025;
const BONE_GAIN = 0.07;
const TICK_GAIN = 0.004;
const HARE_M = 120;          // odstup 1 = 120 m v pilulke

const A = "/images/404/";
const SPRITES = ["hekthor-run-a", "hekthor-run-b", "hekthor-jump", "hekthor-hit", "kliest", "kliest-velky", "lopticka", "kost", "zajac-a", "zajac-b"] as const;
type SpriteId = (typeof SPRITES)[number];
type Sprite = { img: HTMLImageElement; sx: number; sy: number; sw: number; sh: number };

const RANKS = ["PUPPY", "GOOD BOY", "VERY GOOD BOY", "WHO'S A GOOD BOY", "LEGEND", "GOOD BOY OF THE MILLENNIUM"];
// Názvy hodností žijú v i18n (`nf.rank0..5`), EN je fallback.
const rankFor = (s: number) => Math.min(Math.floor(s / 10), RANKS.length - 1);

type Kind = "tick" | "boss";
type Obstacle = { x: number; w: number; h: number; kind: Kind; passed?: boolean; t: number };
type Pickup = { x: number; y: number; kind: "ball" | "bone"; got?: boolean; t: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; r: number };
type Pop = { x: number; y: number; life: number; text: string };

const BEST_KEY = "dogypt_404_best";
const readBest = () => { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } };
const writeBest = (n: number) => { try { localStorage.setItem(BEST_KEY, String(n)); } catch { /* súkromné okno */ } };

/** Orezanie priehľadného okraja spritu — hitbox a kreslenie podľa reálneho obrysu. */
function trim(img: HTMLImageElement): Sprite {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return { img, sx: 0, sy: 0, sw: img.naturalWidth, sh: img.naturalHeight };
  g.drawImage(img, 0, 0);
  const { data, width, height } = g.getImageData(0, 0, c.width, c.height);
  let x0 = width, y0 = height, x1 = 0, y1 = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 <= x0) return { img, sx: 0, sy: 0, sw: width, sh: height };
  return { img, sx: x0, sy: y0, sw: x1 - x0 + 1, sh: y1 - y0 + 1 };
}

const NotFound = () => {
  const t = useT();
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const sprites = useRef<Partial<Record<SpriteId, Sprite>>>({});
  const bg = useRef<{ far?: HTMLImageElement; mid?: HTMLImageElement }>({});

  const [phase, setPhase] = useState<"idle" | "running" | "over" | "win">("idle");
  const [score, setScore] = useState(0);
  const [meters, setMeters] = useState(HARE_M);
  const [secs, setSecs] = useState(0);
  const [best, setBest] = useState(readBest);
  const [rank, setRank] = useState(0);
  const [ready, setReady] = useState(false);

  const world = useRef({
    vw: 960, dogY: 0, dogV: 0, holding: false, landed: 0,
    obs: [] as Obstacle[], picks: [] as Pickup[], parts: [] as Particle[], pops: [] as Pop[],
    speed: SPEED0, obGap: 60, pickGap: 120, dist: 0, gap: 1, won: false,
    score: 0, frame: 0, running: false, raf: 0, last: 0, shake: 0, dead: false,
  });
  // robot pre headless test hry (len dev)
  if (import.meta.env.DEV) (window as unknown as { __nf?: unknown }).__nf = world.current;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // ── grafika ─────────────────────────────────────────────────────
  useEffect(() => {
    let left = SPRITES.length + 2;
    const done = () => { if (--left === 0) { setReady(true); paint(); } };
    for (const id of SPRITES) {
      const img = new Image();
      img.onload = () => { sprites.current[id] = trim(img); done(); };
      img.onerror = done;
      img.src = `${A}${id}.webp`;
    }
    for (const k of ["far", "mid"] as const) {
      const img = new Image();
      img.onload = () => { bg.current[k] = img; done(); };
      img.onerror = done;
      img.src = `${A}${k === "far" ? "bg-hory" : "bg-les"}.webp`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spr = (ctx: CanvasRenderingContext2D, id: SpriteId, x: number, feetY: number, h: number) => {
    const s = sprites.current[id];
    if (!s) return;
    ctx.drawImage(s.img, s.sx, s.sy, s.sw, s.sh, x, feetY - h, h * (s.sw / s.sh), h);
  };

  /** Pozadie na nekonečné rolovanie — každá druhá dlaždica zrkadlovo, aby nebolo vidno šev. */
  const layer = (ctx: CanvasRenderingContext2D, img: HTMLImageElement | undefined, off: number, top: number, h: number) => {
    if (!img) return;
    const w = h * (img.naturalWidth / img.naturalHeight);
    const o = off % (w * 2);
    for (let x = -o, i = 0; x < world.current.vw; x += w, i++) {
      if (i % 2) { ctx.save(); ctx.translate(x + w, top); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, w, h); ctx.restore(); }
      else ctx.drawImage(img, x, top, w, h);
    }
  };

  const drawGround = (ctx: CanvasRenderingContext2D, dist: number) => {
    const vw = world.current.vw;
    const g = ctx.createLinearGradient(0, GROUND, 0, VH);
    g.addColorStop(0, "#6FA23A"); g.addColorStop(0.18, "#4E7F27"); g.addColorStop(0.2, "#B88A4E"); g.addColorStop(1, "#7A5428");
    ctx.fillStyle = g; ctx.fillRect(0, GROUND, vw, VH - GROUND);
    ctx.fillStyle = "#2B2116"; ctx.fillRect(0, GROUND - 1, vw, 3);               // obrys ako na spritoch
    ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.fillRect(0, GROUND + 2, vw, 2); // odlesk
    const o = dist % 64;                                                           // trsy trávy + kamienky
    for (let x = -o; x < vw + 64; x += 64) {
      ctx.fillStyle = "#3E6B1E";
      ctx.beginPath(); ctx.moveTo(x, GROUND + 1); ctx.lineTo(x + 5, GROUND - 9); ctx.lineTo(x + 9, GROUND + 1); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 7, GROUND + 1); ctx.lineTo(x + 13, GROUND - 6); ctx.lineTo(x + 16, GROUND + 1); ctx.fill();
      ctx.fillStyle = "rgba(60,36,12,0.35)";
      ctx.beginPath(); ctx.ellipse(x + 34, GROUND + 34, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 52, GROUND + 50, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
    }
  };

  const burst = (x: number, y: number, n: number, colors: string[], spread = 4, up = 4) => {
    const w = world.current;
    for (let i = 0; i < n; i++) {
      const max = 22 + Math.random() * 18;
      w.parts.push({ x, y, vx: (Math.random() - 0.5) * spread * 2, vy: -Math.random() * up, life: max, max, c: colors[i % colors.length], r: 2 + Math.random() * 3.5 });
    }
  };

  // ── jeden snímok ────────────────────────────────────────────────
  const paint = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const w = world.current, vw = w.vw;
    ctx.save();
    ctx.clearRect(0, 0, vw, VH);
    if (w.shake > 0) ctx.translate((Math.random() - 0.5) * w.shake, (Math.random() - 0.5) * w.shake);

    // obloha, hory, les
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, "#F7D9A0"); sky.addColorStop(1, "#FBEFD2");
    ctx.fillStyle = sky; ctx.fillRect(-20, -20, vw + 40, GROUND + 20);
    layer(ctx, bg.current.far, w.dist * 0.12, 0, GROUND + 10);
    layer(ctx, bg.current.mid, w.dist * 0.4, GROUND - 150, 168);
    drawGround(ctx, w.dist);

    // prekážky
    for (const o of w.obs) {
      const bob = Math.abs(Math.sin(o.t * 0.35)) * (o.kind === "boss" ? 2 : 3);
      ctx.fillStyle = "rgba(43,33,22,0.22)";
      ctx.beginPath(); ctx.ellipse(o.x + o.w / 2, GROUND + 4, o.w * 0.45, 5, 0, 0, Math.PI * 2); ctx.fill();
      spr(ctx, o.kind === "boss" ? "kliest-velky" : "kliest", o.x, GROUND + 2 - bob, o.h);
    }
    // loptičky a kosti
    for (const p of w.picks) {
      const fl = Math.sin(p.t * 0.12) * 6, size = p.kind === "bone" ? 54 : 40;
      ctx.save();
      ctx.shadowColor = p.kind === "bone" ? "rgba(245,199,61,0.85)" : "rgba(220,240,80,0.6)";
      ctx.shadowBlur = 18;
      spr(ctx, p.kind === "bone" ? "kost" : "lopticka", p.x - size / 2, p.y + size / 2 + fl, size);
      ctx.restore();
    }

    // zajac — skáče stále, kliešte mu podbehnú
    if (!w.won) {
      const hx = hareX(), hop = Math.abs(Math.sin(w.frame * 0.16)) * 46;
      ctx.fillStyle = "rgba(43,33,22,0.18)";
      ctx.beginPath(); ctx.ellipse(hx + 40, GROUND + 4, 30 - hop * 0.3, 5, 0, 0, Math.PI * 2); ctx.fill();
      spr(ctx, hop > 20 ? "zajac-a" : "zajac-b", hx, GROUND + 2 - hop, 74);
    }

    // Hektor
    const air = w.dogY < -1;
    const feet = GROUND + 4 + w.dogY;
    ctx.fillStyle = `rgba(43,33,22,${air ? 0.12 : 0.25})`;
    ctx.beginPath(); ctx.ellipse(DOG_X + 70, GROUND + 4, air ? 34 : 52, 6, 0, 0, Math.PI * 2); ctx.fill();
    const id: SpriteId = w.dead ? "hekthor-hit" : air ? "hekthor-jump" : (Math.floor(w.frame / 6) % 2 ? "hekthor-run-a" : "hekthor-run-b");
    const squash = w.landed > 0 ? 1 - w.landed * 0.012 : 1;
    ctx.save();
    ctx.translate(DOG_X, feet); ctx.scale(2 - squash, squash); ctx.translate(-DOG_X, -feet);
    spr(ctx, id, DOG_X, feet, w.dead ? DOG_H * 0.95 : DOG_H);
    ctx.restore();

    // častice a body
    for (const p of w.parts) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    for (const p of w.pops) {
      ctx.globalAlpha = Math.min(1, p.life / 20);
      ctx.font = "900 34px 'LT Museum', serif";
      ctx.lineWidth = 6; ctx.strokeStyle = "#2B2116"; ctx.lineJoin = "round";
      const y = p.y - (46 - p.life) * 1.1;
      ctx.strokeText(p.text, p.x, y);
      ctx.fillStyle = "#F5C73D"; ctx.fillText(p.text, p.x, y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  };

  const dogBox = () => {
    const w = world.current, s = sprites.current["hekthor-run-a"];
    const dw = s ? DOG_H * (s.sw / s.sh) : DOG_H;
    // hitbox je o niečo menší než obrys — uši a chvost nerozhodujú
    return { x: DOG_X + dw * 0.22, y: GROUND + 4 + w.dogY - DOG_H * 0.82, w: dw * 0.6, h: DOG_H * 0.72 };
  };

  /** Zajac stojí pri odstupe 1 vpravo hore na ploche, pri 0 pri Hektorovom čumáku. */
  const hareX = () => {
    const w = world.current;
    const near = DOG_X + 150, far = Math.max(near + 60, w.vw - 150);
    return near + (far - near) * Math.max(0, w.gap);
  };

  const closer = (d: number) => {
    const w = world.current;
    w.gap = Math.max(0, w.gap - d);
    setMeters(Math.ceil(w.gap * HARE_M));
  };

  const win = () => {
    const w = world.current;
    w.running = false; w.won = true;
    burst(hareX() + 30, GROUND - 80, 40, ["#F5C73D", "#FFF3C4", "#16307A", "#E69E1A"], 7, 9);
    w.score += 50; setScore(w.score); setRank(rankFor(w.score));
    setSecs(Math.round(w.frame / 60));
    setBest((b) => { const n = Math.max(b, w.score); writeBest(n); return n; });
    setPhase("win");
    let n = 50;
    const fade = () => { if (w.running) return; tickFx(1); paint(); if (--n > 0) requestAnimationFrame(fade); };
    requestAnimationFrame(fade);
  };

  const tickFx = (k: number) => {
    const w = world.current;
    for (const p of w.parts) { p.x += p.vx * k; p.y += p.vy * k; p.vy += 0.3 * k; p.life -= k; }
    w.parts = w.parts.filter((p) => p.life > 0);
    for (const p of w.pops) p.life -= k;
    w.pops = w.pops.filter((p) => p.life > 0);
    if (w.shake > 0) w.shake = Math.max(0, w.shake - 1.2 * k);
    if (w.landed > 0) w.landed = Math.max(0, w.landed - k);
  };

  const end = () => {
    const w = world.current;
    w.running = false; w.dead = true; w.shake = 14;
    burst(DOG_X + 80, GROUND - 60, 22, ["#C8202F", "#F5C73D", "#2B2116"], 6, 7);
    setBest((b) => { const n = Math.max(b, w.score); writeBest(n); return n; });
    setPhase("over");
    // dobehnutie: častice a otras ešte pár snímok
    let n = 40;
    const fade = () => { if (w.running) return; tickFx(1); paint(); if (--n > 0) requestAnimationFrame(fade); };
    requestAnimationFrame(fade);
  };

  const step = useCallback((now: number) => {
    const w = world.current;
    if (!w.running) return;
    const k = Math.min(3, (now - (w.last || now)) / (1000 / 60)) || 1;
    w.last = now;
    w.frame += k;
    w.dist += w.speed * k;
    const m0 = Math.ceil(w.gap * HARE_M);
    w.gap = Math.max(0, w.gap - k / CHASE_FRAMES);
    if (Math.ceil(w.gap * HARE_M) !== m0) setMeters(Math.ceil(w.gap * HARE_M));
    if (w.gap <= 0) { win(); paint(); return; }

    // fyzika skoku
    if (w.dogV < 0 && !w.holding) w.dogV *= Math.pow(JUMP_CUT, k * 0.35);
    w.dogV += GRAVITY * k; w.dogY += w.dogV * k;
    if (w.dogY >= 0) {
      if (w.dogV > 4) { w.landed = 10; burst(DOG_X + 60, GROUND, 8, ["#B88A4E", "#8E6A3A"], 3, 2); }
      w.dogY = 0; w.dogV = 0;
    }
    if (w.dogY === 0 && Math.floor(w.frame) % 9 === 0) burst(DOG_X + 30, GROUND, 1, ["rgba(140,100,50,0.6)"], 1.5, 1.2);

    // nové prekážky — rozstup rastie s rýchlosťou, aby bol vždy preskočiteľný
    w.obGap -= k;
    if (w.obGap <= 0) {
      const boss = w.score >= 8 && Math.random() < 0.28;
      const h = boss ? 86 : 50 + Math.random() * 10;
      const s = sprites.current[boss ? "kliest-velky" : "kliest"];
      const ow = s ? h * (s.sw / s.sh) : h;
      w.obs.push({ x: w.vw + 40, w: ow, h, kind: boss ? "boss" : "tick", t: 0 });
      // pár: dva malé kliešte tesne za sebou od skóre 15
      if (!boss && w.score >= 15 && Math.random() < 0.3) w.obs.push({ x: w.vw + 40 + ow + 26, w: ow, h, kind: "tick", t: 2 });
      const base = 560 / w.speed;
      w.obGap = base * 1.25 + Math.random() * base;
    }
    w.pickGap -= k;
    if (w.pickGap <= 0) {
      const bone = Math.random() < 0.15;
      w.picks.push({ x: w.vw + 40, y: GROUND - 150 - Math.random() * 70, kind: bone ? "bone" : "ball", t: 0 });
      w.pickGap = 110 + Math.random() * 140;
    }

    const box = dogBox();
    for (const o of w.obs) {
      o.x -= w.speed * k; o.t += k;
      if (!o.passed && o.x + o.w < box.x) {
        o.passed = true; w.score += o.kind === "boss" ? 2 : 1; closer(TICK_GAIN);
        setScore(w.score); setRank(rankFor(w.score));
        w.speed = SPEED0 + Math.min(7, w.score * 0.12);
      }
      const ob = { x: o.x + o.w * 0.18, y: GROUND - o.h * 0.75, w: o.w * 0.64, h: o.h * 0.72 };
      if (box.x < ob.x + ob.w && box.x + box.w > ob.x && box.y < ob.y + ob.h && box.y + box.h > ob.y) { end(); paint(); return; }
    }
    w.obs = w.obs.filter((o) => o.x + o.w > -60);

    for (const p of w.picks) {
      p.x -= w.speed * k; p.t += k;
      const dx = p.x - (box.x + box.w / 2), dy = p.y - (box.y + box.h / 2);
      if (!p.got && Math.hypot(dx, dy) < 62) {
        p.got = true;
        const pts = p.kind === "bone" ? 10 : 3;
        closer(p.kind === "bone" ? BONE_GAIN : BALL_GAIN);
        w.score += pts; setScore(w.score); setRank(rankFor(w.score));
        w.pops.push({ x: p.x, y: p.y, life: 46, text: `+${pts}` });
        burst(p.x, p.y, p.kind === "bone" ? 22 : 12, p.kind === "bone" ? ["#F5C73D", "#FFF3C4", "#E69E1A"] : ["#E2F04A", "#FFFFFF", "#B6D12A"], 5, 5);
      }
    }
    w.picks = w.picks.filter((p) => !p.got && p.x > -60);

    tickFx(k);
    paint();
    w.raf = requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = () => {
    const w = world.current;
    cancelAnimationFrame(w.raf);
    Object.assign(w, { dogY: 0, dogV: 0, obs: [], picks: [], parts: [], pops: [], speed: SPEED0, obGap: 50, pickGap: 80, score: 0, frame: 0, dist: 0, running: true, last: 0, shake: 0, dead: false, landed: 0, gap: 1, won: false });
    setScore(0); setMeters(HARE_M); setRank(0); setPhase("running");
    w.raf = requestAnimationFrame(step);
  };

  const press = () => {
    const w = world.current;
    w.holding = true;
    if (phaseRef.current !== "running") { if (Object.keys(sprites.current).length) start(); return; }
    if (w.dogY === 0) { w.dogV = JUMP_V; burst(DOG_X + 60, GROUND, 6, ["#B88A4E", "#8E6A3A"], 2.5, 2); }
  };
  const release = () => { world.current.holding = false; };
  const pressRef = useRef(press);
  pressRef.current = press;

  // ── plátno: ostré na každom displeji, šírka podľa plochy ─────────
  useEffect(() => {
    const canvas = canvasRef.current, stage = stageRef.current;
    if (!canvas || !stage) return;
    const fit = () => {
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      world.current.vw = Math.round(VH * (r.width / r.height));
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.setTransform(canvas.width / world.current.vw, 0, 0, canvas.height / VH, 0, 0); ctx.imageSmoothingQuality = "high"; }
      paint();
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(stage);

    const isJump = (e: KeyboardEvent) => e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW";
    const down = (e: KeyboardEvent) => { if (isJump(e)) { e.preventDefault(); if (!e.repeat) pressRef.current(); } };
    const up = (e: KeyboardEvent) => { if (isJump(e)) world.current.holding = false; };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { ro.disconnect(); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); cancelAnimationFrame(world.current.raf); world.current.running = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="nf">
      <style>{NF_CSS}</style>
      <header className="nf-top">
        <PageTopBar />
      </header>

      <main className="nf-main">
        <div className="nf-head">
          <img className="nf-tilt" src={`${A}hekthor-tilt.webp`} width={512} height={512} alt={tx("nf.tiltAlt", "Hekthor, puzzled")} />
          <div>
            <p className="nf-eye">{tx("nf.eye", "Error 404")}</p>
            <h1 className="nf-404">{tx("nf.h1a", "This page ran")} <span>{tx("nf.h1b", "off-leash.")}</span></h1>
            <p className="nf-sub">{tx("nf.sub", "Hekthor went looking for it and found a hare instead. Help him catch it.")}</p>
          </div>
        </div>

        <div className="nf-frame">
          <div
            ref={stageRef}
            className="nf-stage"
            onPointerDown={(e) => { e.preventDefault(); press(); }}
            onPointerUp={release}
            onPointerLeave={release}
            onPointerCancel={release}
            role="button"
            aria-label={tx("nf.jump", "Jump")}
          >
            <canvas ref={canvasRef} className="nf-canvas" />

            <div className="nf-hud" aria-live="polite">
              <span className="nf-pill nf-score">{score}<small>{tx("nf.pts", "pts")}</small></span>
              <span className="nf-pill nf-hare"><img src={`${A}zajac-a.webp`} alt="" width={24} height={24} />{meters} m</span>
              <span className="nf-pill nf-rank">{tx(`nf.rank${rank}`, RANKS[rank])}</span>
              <span className="nf-pill nf-best">{tx("nf.best", "Best")} {best}</span>
            </div>

            {phase !== "running" && (
              <div className="nf-over">
                <div className="nf-card">
                  {phase === "idle" ? (
                    <>
                      <p className="nf-title">{tx("nf.titleA", "Hekthor's")} <span>{tx("nf.titleB", "Run")}</span></p>
                      <p className="nf-hint">{tx("nf.idleHint", "Chase the hare. Jump the ticks. Balls and the golden bone bring you closer.")}</p>
                    </>
                  ) : phase === "win" ? (
                    <>
                      <img className="nf-win" src={`${A}vyhra.webp`} alt={tx("nf.winAlt", "Hekthor and the hare")} width={512} height={512} />
                      <p className="nf-title">{tx("nf.winA", "Got the")} <span>{tx("nf.winB", "hare.")}</span></p>
                      <p className="nf-hint">{tx("nf.winHint", "Tag, you're it.")} {secs} {tx("nf.secs", "s of chase")} · {score} {tx("nf.pts", "pts")}</p>
                    </>
                  ) : (
                    <>
                      <p className="nf-title">{tx("nf.loseA", "A tick got")} <span>{tx("nf.loseB", "him.")}</span></p>
                      <p className="nf-hint">{tx("nf.loseHint", "The hare got away")} {meters} {tx("nf.mAhead", "m ahead")} · {score} {tx("nf.pts", "pts")}{score > 0 && score >= best ? ` · ${tx("nf.newBest", "new best")}` : ""}</p>
                    </>
                  )}
                  <button type="button" className="nf-cta" disabled={!ready}>
                    {phase === "idle" ? (ready ? tx("nf.play", "Play") : tx("nf.loading", "Loading")) : phase === "win" ? tx("nf.again", "Chase again") : tx("nf.retry", "Run again")}
                  </button>
                  <p className="nf-keys"><kbd>{tx("nf.key", "Space")}</kbd> {tx("nf.keysTail", "or tap · hold to jump higher")}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="nf-actions">
          <a href="/" className="nf-cta">{tx("nf.home", "Fetch the homepage")}</a>
          <a href="/heroglyph/name" className="nf-link">{tx("nf.join", "or become a Dogyptian →")}</a>
        </div>
      </main>
    </div>
  );
};

// Brand nového webu /app (`pages/appWeb/appWeb.css`): papyrus LAB, LT Museum na nadpisy,
// Space Grotesk na UI, lapis CTA r8, D-BLOK (zlatý odliatok r14) okolo hracej plochy.
// Zlaté je len jedno slovo nadpisu.
const NF_CSS = `
@font-face{font-family:'LT Museum';src:url('/fonts/museum-black.woff2') format('woff2');font-weight:900;font-display:swap}
@font-face{font-family:'LT Museum';src:url('/fonts/museum-bold.woff2') format('woff2');font-weight:700;font-display:swap}
.nf{--ink:#2a1608;--ink-soft:rgba(60,40,12,0.62);--gold-ink:#8a5a14;
  --gold-text:linear-gradient(100deg,#6E4A12 0%,#A3782B 30%,#D8A93F 50%,#A3782B 70%,#6E4A12 100%);
  --lapis:linear-gradient(180deg,#16307A,#0A1A4A);--lapis-hover:linear-gradient(180deg,#1E3C90,#0F2560);
  --lapis-shadow:0 4px 13px -3px rgba(5,15,48,0.6),inset 0 1px 0 rgba(201,154,63,0.30);
  min-height:100dvh;display:flex;flex-direction:column;color:var(--ink);font-family:'Space Grotesk',sans-serif;
  background:#F3E4C4 radial-gradient(125% 100% at 50% 38%,#FDF8EC 0%,#F8EDD6 34%,#F1E1BE 64%,#E6D2A6 100%) fixed}
.nf *{box-sizing:border-box}
.nf-top{display:flex;justify-content:center;padding:16px 16px 0}
.nf-top img{width:132px;height:auto;display:block}
.nf-main{flex:1;width:100%;max-width:880px;margin:0 auto;padding:16px 16px 48px;display:flex;flex-direction:column;gap:24px}
.nf-head{display:flex;align-items:center;gap:16px}
.nf-tilt{width:120px;height:120px;flex:none;filter:drop-shadow(0 8px 14px rgba(110,71,16,0.28))}
.nf-eye{margin:0 0 4px;font:500 12px/1.4 'Space Grotesk',sans-serif;letter-spacing:.26em;text-transform:uppercase;color:var(--gold-ink)}
.nf-404{margin:0;font:900 clamp(28px,6.4vw,52px)/1.02 'LT Museum',serif;color:var(--ink)}
.nf-404 span,.nf-title span{background:var(--gold-text);-webkit-background-clip:text;background-clip:text;color:transparent}
.nf-sub{margin:8px 0 0;font-size:16px;line-height:1.5;color:var(--ink-soft)}

.nf-frame{border:6px solid transparent;border-radius:14px;
  background:linear-gradient(180deg,#FBF3E0,#E4D0A0) padding-box,linear-gradient(180deg,#FCF0C2 0px,#EDCE7C 11px,#D8B052 28px,#C09636 44px,#AA8129 56px) border-box;
  box-shadow:inset 0 0 0 1px #6E4E18,0 0 0 1px #6E4E18,0 12px 26px -8px rgba(0,0,0,0.72),0 3px 0 -1px rgba(70,46,12,0.5)}
.nf-stage{position:relative;aspect-ratio:2/1;border-radius:8px;overflow:hidden;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;background:#FBEFD2}
.nf-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}

.nf-hud{position:absolute;top:12px;left:12px;right:12px;display:flex;gap:8px;align-items:center;pointer-events:none}
.nf-pill{display:inline-flex;align-items:baseline;gap:4px;padding:8px 12px;border-radius:999px;white-space:nowrap;
  background:linear-gradient(180deg,#FFFDF7 0%,#EFDDAE 100%);border:1.5px solid rgba(179,130,45,0.6);color:#5c4318;
  font:600 12px/1 'Space Grotesk',sans-serif;letter-spacing:.02em;text-transform:uppercase;box-shadow:0 3px 10px rgba(43,33,22,0.18)}
.nf-score{font:600 20px/1 'Space Grotesk',sans-serif;font-variant-numeric:tabular-nums;color:var(--ink);padding:8px 16px}
.nf-score small{font:600 10px/1 'Space Grotesk',sans-serif;color:var(--gold-ink)}
.nf-best{margin-left:auto;font-variant-numeric:tabular-nums}
.nf-hare{align-items:center;font-variant-numeric:tabular-nums}
.nf-hare img{width:24px;height:24px;margin:-8px 0}
.nf-win{display:block;width:120px;height:120px;margin:-8px auto 8px}

.nf-over{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(43,26,8,0.28)}
.nf-card{text-align:center;padding:24px;border-radius:16px;max-width:420px;width:100%;
  background:linear-gradient(160deg,#FBF5E6 0%,#F3E4C4 55%,#EAD6A6 100%);border:1.5px solid #C99A3F;
  box-shadow:0 14px 44px rgba(0,0,0,0.45),0 0 0 4px rgba(201,154,63,0.12),inset 0 1px 0 rgba(255,255,255,0.5)}
.nf-title{margin:0;font:900 clamp(24px,4.6vw,36px)/1.05 'LT Museum',serif;color:var(--ink)}
.nf-hint{margin:8px 0 16px;font-size:14px;color:var(--ink-soft)}
.nf-keys{margin:12px 0 0;font-size:12px;color:var(--ink-soft)}
.nf kbd{font:600 12px/1 'Space Grotesk',sans-serif;border:1px solid rgba(154,110,36,0.6);border-radius:4px;padding:2px 8px;background:rgba(154,110,36,0.1);color:#5c4318}

.nf-cta{display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border:1.5px solid rgba(250,244,236,0.30);
  border-radius:8px;padding:16px 32px;background:var(--lapis);box-shadow:var(--lapis-shadow);color:#EFD79A;
  font:700 16px/1 'LT Museum',serif;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;transition:transform .12s ease}
.nf-cta:hover{background:var(--lapis-hover);transform:translateY(-1px)}
.nf-cta:disabled{opacity:.6;cursor:wait}
.nf-actions{display:flex;flex-direction:column;align-items:center;gap:12px}
.nf-link{color:var(--gold-ink);font-size:14px;text-decoration:none}
.nf-link:hover{color:var(--ink)}

@media (max-width:640px){
  .nf-head{flex-direction:column;text-align:center;gap:8px}
  .nf-tilt{width:96px;height:96px}
  .nf-stage{aspect-ratio:4/3}
  .nf-rank{display:none}
  .nf-card{padding:16px}
  .nf-over{padding:8px}
  .nf-win{width:72px;height:72px;margin:0 auto 4px}
  .nf-hint{margin:4px 0 12px}
  .nf-keys{display:none}
  .nf-card .nf-cta{padding:12px 24px}
  .nf-main{gap:16px}
}
@media (min-width:768px){ .nf-main{padding-top:24px} }
`;

export default NotFound;
