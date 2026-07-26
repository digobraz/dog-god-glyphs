import { useEffect, useRef, useState, useCallback } from "react";
import { PageTopBar } from "@/components/PageTopBar";
import dogSilhouette from "@/assets/patroni/l11-hekthor.svg";

// ── /404 — "Hekthor's Run" ──────────────────────────────────────────────
// A page ran off-leash. Set on a big papyrus block: giant 404, one line of
// copy, and a clean endless runner. Hekthor (a real brand patron silhouette,
// inked onto the papyrus) leaps the hazards a dog actually faces — ticks,
// grass awns, the vet's syringe — and snatches tennis balls from the air
// for bonus points. Vanilla <canvas>; physics in a fixed logical space.

const VW = 900;          // logical width
const VH = 220;          // logical height
const GROUND_Y = 178;    // ink baseline (obstacle + dog feet)
const GRAVITY = 0.74;
const JUMP_V = -13.6;

const INK = "#3a2a15";       // dog + ground ink on papyrus
const INK_SOFT = "#6b4e22";

// Rank ladder — every 6 points promotes Hekthor one holy rank.
const RANKS = ["PUPPY", "GOOD BOY", "VERY GOOD BOY", "WHO'S A GOOD BOY", "LEGEND", "GOOD BOY OF THE MILLENNIUM"];
const rankFor = (s: number) => RANKS[Math.min(Math.floor(s / 6), RANKS.length - 1)];

type Kind = "tick" | "awn" | "syringe";
type Obstacle = { x: number; w: number; h: number; kind: Kind; passed?: boolean };
type Ball = { x: number; y: number; got?: boolean };
type Pop = { x: number; y: number; life: number; text: string };

const NotFound = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dogImg = useRef<HTMLCanvasElement | null>(null); // pre-inked silhouette

  const [phase, setPhase] = useState<"idle" | "running" | "over">("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [rank, setRank] = useState(RANKS[0]);

  const world = useRef({
    dogY: 0, dogV: 0,
    obs: [] as Obstacle[],
    balls: [] as Ball[],
    pops: [] as Pop[],
    speed: 5.2, obSpawn: 55, ballSpawn: 130,
    score: 0, frame: 0, running: false, raf: 0,
  });

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // ── pre-ink the brand dog silhouette into an offscreen canvas ───────
  useEffect(() => {
    const img = new Image();
    img.src = dogSilhouette;
    img.onload = () => {
      const H = 200;
      const W = Math.round(H * (img.width / img.height));
      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const c = off.getContext("2d");
      if (!c) return;
      c.drawImage(img, 0, 0, W, H);
      c.globalCompositeOperation = "source-in";
      c.fillStyle = INK;
      c.fillRect(0, 0, W, H);
      dogImg.current = off;
      // repaint idle preview once the dog is ready
      const cv = canvasRef.current;
      const ctx = cv?.getContext("2d");
      if (ctx && phaseRef.current === "idle") render(ctx, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── draw: dog (right-facing brand silhouette, subtle running bob) ───
  const drawDog = (ctx: CanvasRenderingContext2D, feetY: number, frame: number, airborne: boolean) => {
    const off = dogImg.current;
    const h = 82;
    const w = off ? h * (off.width / off.height) : 90;
    const bob = airborne ? 0 : Math.abs(Math.sin(frame * 0.22)) * 4;
    const x = 92;
    const topY = feetY - h + bob;
    if (off) {
      // Hekthor silhouette drawn facing right, into the oncoming hazards
      ctx.drawImage(off, x, topY, w, h);
    } else {
      ctx.fillStyle = INK;
      ctx.fillRect(x, topY + 20, w, h - 20);
    }
    return { x, y: topY, w, h };
  };

  // ── parallax background scenery — faded, slower than hazards ────────
  const peak = (c: CanvasRenderingContext2D, x: number, by: number, w: number, h: number) => {
    c.beginPath(); c.moveTo(x - w / 2, by); c.lineTo(x, by - h); c.lineTo(x + w / 2, by); c.closePath(); c.fill();
  };
  const hill = (c: CanvasRenderingContext2D, x: number, by: number, w: number, h: number) => {
    c.beginPath(); c.moveTo(x - w / 2, by);
    c.quadraticCurveTo(x - w * 0.22, by - h, x, by - h);
    c.quadraticCurveTo(x + w * 0.22, by - h, x + w / 2, by); c.closePath(); c.fill();
  };
  const pine = (c: CanvasRenderingContext2D, x: number, by: number, h: number) => {
    c.beginPath(); c.moveTo(x - h * 0.4, by); c.lineTo(x, by - h); c.lineTo(x + h * 0.4, by); c.closePath(); c.fill();
  };
  const roundTree = (c: CanvasRenderingContext2D, x: number, by: number, r: number) => {
    c.fillRect(x - 1.5, by - r, 3, r);
    c.beginPath(); c.arc(x, by - r - r * 0.55, r * 0.95, 0, Math.PI * 2); c.fill();
  };
  const house = (c: CanvasRenderingContext2D, x: number, by: number, w: number, h: number) => {
    c.fillRect(x - w / 2, by - h, w, h);
    c.beginPath(); c.moveTo(x - w / 2 - 3, by - h); c.lineTo(x, by - h - h * 0.55); c.lineTo(x + w / 2 + 3, by - h); c.closePath(); c.fill();
  };

  const drawScenery = (ctx: CanvasRenderingContext2D, frame: number, speed: number) => {
    const gy = GROUND_Y + 1;
    // FAR — mountains, very faint & slow
    ctx.fillStyle = "rgba(122,96,54,0.09)";
    const tA = 540, offA = (frame * speed * 0.12) % tA;
    for (let bx = -offA - tA; bx < VW + tA; bx += tA) {
      peak(ctx, bx + 120, gy, 210, 96); peak(ctx, bx + 330, gy, 168, 70); hill(ctx, bx + 470, gy, 250, 52);
    }
    // NEAR — forest + village + a pyramid, faint (slower than hazards so never read as one)
    ctx.fillStyle = "rgba(96,72,36,0.13)";
    const tB = 680, offB = (frame * speed * 0.26) % tB;
    for (let bx = -offB - tB; bx < VW + tB; bx += tB) {
      pine(ctx, bx + 28, gy, 40); pine(ctx, bx + 56, gy, 30); pine(ctx, bx + 80, gy, 34);
      roundTree(ctx, bx + 142, gy, 15);
      house(ctx, bx + 224, gy, 46, 30);
      peak(ctx, bx + 330, gy, 128, 72);
      roundTree(ctx, bx + 432, gy, 17);
      house(ctx, bx + 512, gy, 38, 24);
      pine(ctx, bx + 588, gy, 36); pine(ctx, bx + 612, gy, 28);
    }
  };

  const drawTick = (ctx: CanvasRenderingContext2D, o: Obstacle) => {
    const cx = o.x + o.w / 2, cy = GROUND_Y - o.h / 2;
    ctx.save();
    ctx.strokeStyle = "#6d4326"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
    for (const s of [-1, 1]) for (const dy of [-5, -1, 3]) {
      ctx.beginPath();
      ctx.moveTo(cx, cy + dy);
      ctx.quadraticCurveTo(cx + s * (o.w / 2 + 3), cy + dy - 5, cx + s * (o.w / 2 + 7), cy + dy + 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#5b3620";
    ctx.beginPath(); ctx.ellipse(cx, cy, o.w / 2, o.h / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#402616";
    ctx.beginPath(); ctx.ellipse(cx, cy + 1, o.w / 3, o.h / 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3a2414";                       // head
    ctx.beginPath(); ctx.arc(cx - o.w / 2 - 1, cy - 2, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c9452f";                       // menace eye
    ctx.beginPath(); ctx.arc(cx + 2, cy - 1, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  const drawAwn = (ctx: CanvasRenderingContext2D, o: Obstacle) => {
    // grass awn / foxtail — a barbed seed stalk that pierces paws
    const bx = o.x + o.w / 2, base = GROUND_Y, top = GROUND_Y - o.h;
    ctx.save();
    ctx.strokeStyle = "#8a6d2c"; ctx.lineWidth = 2.4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(bx, base); ctx.lineTo(bx, top + 4); ctx.stroke();
    ctx.lineWidth = 1.8;
    const barbs = 6;
    for (let i = 0; i < barbs; i++) {
      const t = i / (barbs - 1);
      const y = base - 6 - t * (o.h - 10);
      const len = 6 + (1 - t) * 4;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(bx, y);
        ctx.lineTo(bx + s * len, y - len * 0.9);
        ctx.stroke();
      }
    }
    ctx.fillStyle = "#a9852f";                       // seed tip
    ctx.beginPath(); ctx.ellipse(bx, top + 2, 3, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  const drawSyringe = (ctx: CanvasRenderingContext2D, o: Obstacle) => {
    // the vet's needle — floats just off the ground, points at Hekthor
    const y = GROUND_Y - o.h / 2 - 4;
    const bx = o.x, bw = o.w;
    ctx.save();
    ctx.fillStyle = "#c7cdd4";                        // glass barrel
    ctx.strokeStyle = "#7d838b"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.roundRect(bx + 6, y - 6, bw - 16, 12, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#8fd0e6"; ctx.globalAlpha = 0.7; // liquid
    ctx.fillRect(bx + 8, y - 4, (bw - 18) * 0.55, 8); ctx.globalAlpha = 1;
    ctx.strokeStyle = "#9aa0a8"; ctx.lineWidth = 2.4; // plunger
    ctx.beginPath(); ctx.moveTo(bx + bw - 10, y); ctx.lineTo(bx + bw, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + bw, y - 5); ctx.lineTo(bx + bw, y + 5); ctx.stroke();
    ctx.strokeStyle = "#b9bfc6"; ctx.lineWidth = 1.6; // needle
    ctx.beginPath(); ctx.moveTo(bx + 6, y); ctx.lineTo(bx - 6, y); ctx.stroke();
    ctx.restore();
  };

  const drawBall = (ctx: CanvasRenderingContext2D, b: Ball, frame: number) => {
    const r = 9, pulse = 1 + Math.sin(frame * 0.15) * 0.06;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(pulse, pulse);
    const g = ctx.createRadialGradient(-3, -3, 1, 0, 0, r);
    g.addColorStop(0, "#F7DE8B"); g.addColorStop(1, "#D9A426");
    ctx.fillStyle = g;
    ctx.shadowColor = "rgba(230,165,40,0.6)"; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(90,60,15,0.5)"; ctx.lineWidth = 1.2; // tennis seam
    ctx.beginPath(); ctx.arc(-r * 0.6, 0, r, -0.9, 0.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(r * 0.6, 0, r, Math.PI - 0.9, Math.PI + 0.9); ctx.stroke();
    ctx.restore();
  };

  // ── main loop ───────────────────────────────────────────────────
  const loop = useCallback(() => {
    const w = world.current;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    w.frame++;

    w.dogV += GRAVITY; w.dogY += w.dogV;
    if (w.dogY > 0) { w.dogY = 0; w.dogV = 0; }
    const dogFeet = GROUND_Y + w.dogY;
    const dogBox = { x: 96, y: dogFeet - 74, w: 74, h: 74 };

    // spawn hazards
    if (--w.obSpawn <= 0) {
      const r = Math.random();
      const kind: Kind = r < 0.5 ? "tick" : r < 0.8 ? "awn" : "syringe";
      const dims = kind === "tick" ? { w: 30, h: 24 } : kind === "awn" ? { w: 16, h: 46 } : { w: 46, h: 22 };
      w.obs.push({ x: VW + 20, kind, ...dims });
      const base = 1050 / w.speed;
      w.obSpawn = base + Math.random() * base * 0.8;
    }
    // spawn bonus balls in the air (reachable near jump apex)
    if (--w.ballSpawn <= 0) {
      w.balls.push({ x: VW + 20, y: GROUND_Y - 78 - Math.random() * 34 });
      w.ballSpawn = 150 + Math.random() * 160;
    }

    // move + collide obstacles
    for (const o of w.obs) {
      o.x -= w.speed;
      if (!o.passed && o.x + o.w < dogBox.x) {
        o.passed = true; w.score += 1; setScore(w.score); setRank(rankFor(w.score));
        w.speed = 5.2 + Math.floor(w.score / 6) * 0.7;
      }
      const pad = o.kind === "awn" ? 5 : 4;
      const ob = { x: o.x + pad, y: GROUND_Y - o.h, w: o.w - pad * 2, h: o.h };
      if (dogBox.x < ob.x + ob.w && dogBox.x + dogBox.w > ob.x && dogBox.y < ob.y + ob.h && dogBox.y + dogBox.h > ob.y) {
        w.running = false; cancelAnimationFrame(w.raf);
        setBest((b) => Math.max(b, w.score)); setPhase("over");
        render(ctx, true); return;
      }
    }
    w.obs = w.obs.filter((o) => o.x + o.w > -30);

    // move + collect balls
    for (const b of w.balls) {
      b.x -= w.speed;
      if (!b.got) {
        const dx = b.x - (dogBox.x + dogBox.w / 2), dy = b.y - (dogBox.y + dogBox.h / 2);
        if (Math.hypot(dx, dy) < 46) {
          b.got = true; w.score += 3; setScore(w.score); setRank(rankFor(w.score));
          w.pops.push({ x: b.x, y: b.y, life: 42, text: "+3" });
        }
      }
    }
    w.balls = w.balls.filter((b) => !b.got && b.x > -30);
    w.pops = w.pops.filter((p) => --p.life > 0);

    render(ctx, false);
    if (w.running) w.raf = requestAnimationFrame(loop);
  }, []);

  // ── render a frame onto the papyrus ─────────────────────────────
  const render = (ctx: CanvasRenderingContext2D, dead: boolean) => {
    const w = world.current;
    ctx.clearRect(0, 0, VW, VH);

    drawScenery(ctx, w.frame, w.speed);

    // ground: ink baseline + moving dashes
    ctx.strokeStyle = INK_SOFT; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, GROUND_Y + 1); ctx.lineTo(VW, GROUND_Y + 1); ctx.stroke();
    ctx.strokeStyle = "rgba(107,78,34,0.35)"; ctx.lineWidth = 2;
    const off = (w.frame * w.speed) % 46;
    for (let x = -off; x < VW; x += 46) {
      ctx.beginPath(); ctx.moveTo(x, GROUND_Y + 11); ctx.lineTo(x + 20, GROUND_Y + 11); ctx.stroke();
    }

    for (const o of w.obs) {
      if (o.kind === "tick") drawTick(ctx, o);
      else if (o.kind === "awn") drawAwn(ctx, o);
      else drawSyringe(ctx, o);
    }
    for (const b of w.balls) drawBall(ctx, b, w.frame);

    const airborne = w.dogY < -1;
    ctx.globalAlpha = dead ? 0.4 : 1;
    drawDog(ctx, GROUND_Y + w.dogY, airborne ? 6 : w.frame, airborne);
    ctx.globalAlpha = 1;

    for (const p of w.pops) {
      ctx.globalAlpha = Math.min(1, p.life / 24);
      ctx.fillStyle = "#B07E2E"; ctx.font = "700 18px Cinzel, serif"; ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y - (42 - p.life) * 0.7);
      ctx.globalAlpha = 1;
    }
  };

  const jump = useCallback(() => {
    const w = world.current;
    if (phaseRef.current !== "running") return;
    if (w.dogY === 0) w.dogV = JUMP_V;
  }, []);

  const start = useCallback(() => {
    const w = world.current;
    Object.assign(w, { dogY: 0, dogV: 0, obs: [], balls: [], pops: [], speed: 5.2, obSpawn: 45, ballSpawn: 90, score: 0, frame: 0, running: true });
    setScore(0); setRank(RANKS[0]); setPhase("running");
    cancelAnimationFrame(w.raf);
    w.raf = requestAnimationFrame(loop);
  }, [loop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = VW * dpr; canvas.height = VH * dpr;
    ctx.scale(dpr, dpr);
    render(ctx, false);

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (phaseRef.current === "running") jump(); else start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); cancelAnimationFrame(world.current.raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointer = () => { if (phase === "running") jump(); else start(); };

  return (
    <div className="nf-page dark-bg">
      <PageTopBar />

      <main className="nf-main">
        <section className="nf-block">
          <h1 className="nf-404">404</h1>
          <p className="nf-lead">This page ran off-leash.</p>

          <div className="nf-stage" onPointerDown={onPointer} role="button" aria-label="Jump">
            <canvas ref={canvasRef} className="nf-canvas" />
            {phase === "idle" && (
              <div className="nf-overlay">
                <p className="nf-big">HEKTHOR'S RUN</p>
                <p className="nf-hint"><kbd>SPACE</kbd> / tap — leap the ticks, snatch the balls</p>
              </div>
            )}
            {phase === "over" && (
              <div className="nf-overlay">
                <p className="nf-big">Caught you.</p>
                <p className="nf-hint">{rank} · {score} pts — <kbd>SPACE</kbd> / tap to run again</p>
              </div>
            )}
          </div>

          <div className="nf-hud">
            <span><b>{score}</b> pts</span>
            <span className="nf-rank">{rank}</span>
            <span>best <b>{best}</b></span>
          </div>

          <div className="nf-actions">
            <a href="/" className="btn-gold">Fetch the homepage</a>
            <a href="/entry" className="nf-link">or become a Dogyptian →</a>
          </div>
        </section>
      </main>

      <style>{`
        .nf-page.dark-bg { min-height: 100dvh; display: flex; flex-direction: column; }
        .nf-page.dark-bg::before { position: fixed; }
        .nf-main {
          flex: 1; z-index: 1; display: flex; align-items: center; justify-content: center;
          padding: 24px 16px 40px;
        }
        /* ── the big pale papyrus block ─────────────────────────── */
        .nf-block {
          position: relative; width: 100%; max-width: 940px;
          background: linear-gradient(160deg, #FBF5E6 0%, #F3E4C4 55%, #EAD6A6 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 16px;
          padding: clamp(22px, 4vw, 40px) clamp(18px, 4vw, 44px) clamp(24px, 4vw, 38px);
          box-shadow:
            0 14px 44px rgba(0,0,0,0.55),
            0 0 0 4px rgba(201,154,63,0.12),
            inset 0 1px 0 rgba(255,255,255,0.5);
          text-align: center;
        }
        .nf-eyebrow {
          font-family: 'Cinzel', serif; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          font-size: clamp(0.6rem, 1.6vw, 0.72rem); color: #9A6E24; margin: 0 0 6px;
        }
        .nf-404 {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(3.4rem, 12vw, 6rem); line-height: 0.92;
          color: #4A340F; margin: 0;
          text-shadow: 0 2px 0 rgba(255,255,255,0.5);
        }
        .nf-lead {
          font-family: 'Cinzel', serif; font-weight: 600;
          font-size: clamp(0.95rem, 2.6vw, 1.25rem); color: #6B4E22;
          margin: 4px 0 20px; letter-spacing: 0.02em;
        }
        .nf-stage {
          position: relative; width: 100%; border-radius: 12px; overflow: hidden;
          background:
            repeating-linear-gradient(90deg, rgba(154,110,36,0.05) 0 2px, transparent 2px 46px),
            linear-gradient(180deg, #F6ECD4 0%, #EFE0BE 100%);
          border: 1px solid rgba(154,110,36,0.28);
          box-shadow: inset 0 2px 12px rgba(120,86,30,0.14);
          cursor: pointer; touch-action: manipulation; user-select: none;
          aspect-ratio: 900 / 220;
        }
        .nf-canvas { display: block; width: 100%; height: auto; }
        .nf-overlay {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 7px;
          background: linear-gradient(180deg, rgba(246,236,212,0.55), rgba(239,224,190,0.75));
        }
        .nf-big {
          font-family: 'Cinzel', serif; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          font-size: clamp(1rem, 3.2vw, 1.4rem); color: #4A340F; margin: 0;
        }
        .nf-hint { color: #7A5A28; font-size: clamp(0.72rem, 2vw, 0.88rem); margin: 0; }
        kbd {
          font-family: 'Cinzel', serif; font-size: 0.72rem;
          border: 1px solid rgba(154,110,36,0.6); border-radius: 5px;
          padding: 1px 7px; color: #6B4E22; background: rgba(154,110,36,0.1);
        }
        .nf-hud {
          display: flex; gap: 16px; align-items: center; justify-content: center; flex-wrap: wrap;
          margin: 16px 0 4px;
          font-family: 'Cinzel', serif; font-size: 0.72rem;
          letter-spacing: 0.1em; text-transform: uppercase; color: #8A6A2E;
        }
        .nf-hud b { color: #4A340F; }
        .nf-rank {
          color: #6B4E22; border: 1px solid rgba(154,110,36,0.5);
          border-radius: 999px; padding: 3px 12px; font-weight: 700;
        }
        .nf-actions { margin-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .btn-gold {
          padding: 14px 32px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(120,86,30,0.35); border-radius: 8px;
          color: #2a1d0e; font-family: 'Cinzel', serif; font-size: 0.85rem;
          font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          text-decoration: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.22s;
          box-shadow: 0 8px 26px rgba(180,120,26,0.4), inset 0 1px 0 rgba(255,255,255,0.4);
        }
        .btn-gold:hover { transform: scale(1.04); }
        .nf-link { color: #8A6A2E; font-size: 0.85rem; text-decoration: none; letter-spacing: 0.03em; transition: color 0.2s; }
        .nf-link:hover { color: #4A340F; }
      `}</style>
    </div>
  );
};

export default NotFound;
