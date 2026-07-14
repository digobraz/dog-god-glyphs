import { useEffect, useRef, useState, useCallback } from "react";
import { PageTopBar } from "@/components/PageTopBar";

// ── /404 — "Tick Dodger" ────────────────────────────────────────────────
// A page ran off-leash. While the pilgrim is lost, Hekthor keeps himself
// tick-free: SPACE / tap to jump, speed climbs, ranks climb with it.
// Vanilla <canvas> runner (no asset load — dog is drawn vectorially).
// Physics live in a fixed 800×240 logical space; the canvas scales to fit.

const VW = 800;          // logical width
const VH = 240;          // logical height
const GROUND_Y = 196;    // feet baseline
const GRAVITY = 0.72;
const JUMP_V = -13.2;

// Rank ladder — every 8 dodged ticks promotes Hekthor one holy rank.
const RANKS = [
  "PUPPY",
  "GOOD BOY",
  "VERY GOOD BOY",
  "WHO'S A GOOD BOY",
  "LEGEND",
  "GOOD BOY OF THE MILLENNIUM",
];
const rankFor = (score: number) => RANKS[Math.min(Math.floor(score / 8), RANKS.length - 1)];

type Tick = { x: number; w: number; h: number };

const NotFound = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // UI-facing state (overlay only — game loop keeps its own refs to avoid re-renders)
  const [phase, setPhase] = useState<"idle" | "running" | "over">("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [rank, setRank] = useState(RANKS[0]);

  // Mutable game world (survives across frames without re-rendering React)
  const world = useRef({
    dogY: 0,             // offset above ground (0 = on ground)
    dogV: 0,
    ticks: [] as Tick[],
    speed: 5,
    spawnIn: 60,
    score: 0,
    frame: 0,
    running: false,
    raf: 0,
  });

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // ── draw helpers ────────────────────────────────────────────────
  const drawDog = (ctx: CanvasRenderingContext2D, x: number, feetY: number, frame: number, dead: boolean) => {
    const gold = dead ? "#8a6b30" : "#D9A94A";
    const goldDark = dead ? "#5c471f" : "#B07E2E";
    ctx.save();
    ctx.translate(x, feetY);
    // running leg swing (frozen when airborne handled by caller via frame)
    const swing = Math.sin(frame * 0.4) * 5;

    // legs
    ctx.strokeStyle = goldDark;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-12, -14); ctx.lineTo(-12 + swing, -1);
    ctx.moveTo(10, -14); ctx.lineTo(10 - swing, -1);
    ctx.stroke();

    // tail — trails behind, wags (kept low so he reads as dog, not cat)
    ctx.beginPath();
    ctx.moveTo(-22, -33);
    ctx.quadraticCurveTo(-38, -36, -42, -42 + Math.sin(frame * 0.5) * 5);
    ctx.stroke();

    // body
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.ellipse(-4, -30, 22, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // head
    ctx.beginPath();
    ctx.ellipse(20, -40, 12, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    // snout
    ctx.beginPath();
    ctx.ellipse(30, -37, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // ear — floppy, hanging down beside the head (dog, not pointy cat ear)
    ctx.fillStyle = goldDark;
    ctx.beginPath();
    ctx.moveTo(15, -48);
    ctx.quadraticCurveTo(8, -46, 10, -33);
    ctx.quadraticCurveTo(15, -37, 18, -46);
    ctx.closePath();
    ctx.fill();
    // eye
    ctx.fillStyle = "#1a1206";
    ctx.beginPath();
    ctx.arc(23, -42, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawTick = (ctx: CanvasRenderingContext2D, t: Tick, feetY: number) => {
    const cx = t.x + t.w / 2;
    const cy = feetY - t.h / 2;
    ctx.save();
    // legs
    ctx.strokeStyle = "#7a4a2c";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (const s of [-1, 1]) {
      for (const dy of [-4, 0, 4]) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + dy);
        ctx.lineTo(cx + s * (t.w / 2 + 4), cy + dy - 3);
        ctx.stroke();
      }
    }
    // body
    ctx.fillStyle = "#5b3620";
    ctx.beginPath();
    ctx.ellipse(cx, cy, t.w / 2, t.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // back shell mark
    ctx.fillStyle = "#3f2415";
    ctx.beginPath();
    ctx.ellipse(cx, cy - 1, t.w / 3.2, t.h / 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // menace eye
    ctx.fillStyle = "#c9452f";
    ctx.beginPath();
    ctx.arc(cx + 2, cy - 1, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // ── main loop ───────────────────────────────────────────────────
  const loop = useCallback(() => {
    const w = world.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    w.frame++;

    // physics
    w.dogV += GRAVITY;
    w.dogY += w.dogV;
    if (w.dogY > 0) { w.dogY = 0; w.dogV = 0; }

    // spawn ticks — gap scales with speed so a jump can always clear them
    w.spawnIn--;
    if (w.spawnIn <= 0) {
      const h = 20 + Math.random() * 10;
      w.ticks.push({ x: VW + 10, w: 22 + Math.random() * 8, h });
      const base = 900 / w.speed;               // tighter as it speeds up
      w.spawnIn = base + Math.random() * base * 0.7;
    }

    // move + score + collision
    const dogFeet = GROUND_Y + w.dogY;
    const dogBox = { x: 70, y: dogFeet - 58, w: 46, h: 58 };
    for (const t of w.ticks) {
      t.x -= w.speed;
      if (!(t as any).passed && t.x + t.w < dogBox.x) {
        (t as any).passed = true;
        w.score++;
        setScore(w.score);
        const r = rankFor(w.score);
        setRank(r);
        w.speed = 5 + Math.floor(w.score / 8) * 0.75;   // level = speed bump
      }
      // AABB collision (with forgiving padding)
      const tb = { x: t.x + 3, y: GROUND_Y - t.h, w: t.w - 6, h: t.h };
      if (
        dogBox.x < tb.x + tb.w && dogBox.x + dogBox.w > tb.x &&
        dogBox.y < tb.y + tb.h && dogBox.y + dogBox.h > tb.y
      ) {
        w.running = false;
        cancelAnimationFrame(w.raf);
        setBest((b) => Math.max(b, w.score));
        setPhase("over");
        // final dead frame
        render(ctx, true);
        return;
      }
    }
    w.ticks = w.ticks.filter((t) => t.x + t.w > -20);

    render(ctx, false);
    if (w.running) w.raf = requestAnimationFrame(loop);
  }, []);

  // draw a whole frame
  const render = (ctx: CanvasRenderingContext2D, dead: boolean) => {
    const w = world.current;
    ctx.clearRect(0, 0, VW, VH);

    // ground line
    ctx.strokeStyle = "rgba(201,154,63,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 1);
    ctx.lineTo(VW, GROUND_Y + 1);
    ctx.stroke();
    // moving ground dashes (parallax)
    ctx.strokeStyle = "rgba(201,154,63,0.22)";
    ctx.lineWidth = 2;
    const off = (w.frame * w.speed) % 40;
    for (let x = -off; x < VW; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y + 10);
      ctx.lineTo(x + 16, GROUND_Y + 10);
      ctx.stroke();
    }

    for (const t of w.ticks) drawTick(ctx, t, GROUND_Y);
    const airborne = w.dogY < -1;
    drawDog(ctx, 92, GROUND_Y + w.dogY, airborne ? 8 : w.frame, dead);
  };

  const jump = useCallback(() => {
    const w = world.current;
    if (phaseRef.current !== "running") return;
    if (w.dogY === 0) { w.dogV = JUMP_V; }
  }, []);

  const start = useCallback(() => {
    const w = world.current;
    w.dogY = 0; w.dogV = 0; w.ticks = []; w.speed = 5; w.spawnIn = 50;
    w.score = 0; w.frame = 0; w.running = true;
    setScore(0); setRank(RANKS[0]); setPhase("running");
    cancelAnimationFrame(w.raf);
    w.raf = requestAnimationFrame(loop);
  }, [loop]);

  // input + canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = VW * dpr;
    canvas.height = VH * dpr;
    ctx.scale(dpr, dpr);
    render(ctx, false); // idle preview: dog standing, no ticks

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (phaseRef.current === "running") jump();
        else start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(world.current.raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCanvasPointer = () => {
    if (phase === "running") jump();
    else start();
  };

  return (
    <div className="notfound-page dark-bg">
      <PageTopBar />

      <main className="nf-main">
        <p className="nf-eyebrow">Error 404</p>
        <h1 className="nf-code">This page ran off-leash.</h1>
        <p className="nf-sub">
          It slipped its collar and bolted. While we whistle it back —
          keep Hekthor tick-free. One good deed at a time.
        </p>

        <div className="nf-hud">
          <span>ticks dodged&nbsp;·&nbsp;<b>{score}</b></span>
          <span className="nf-rank">{rank}</span>
          <span>best&nbsp;·&nbsp;<b>{best}</b></span>
        </div>

        <div className="nf-stage" onPointerDown={onCanvasPointer} role="button" aria-label="Jump">
          <canvas ref={canvasRef} className="nf-canvas" />

          {phase === "idle" && (
            <div className="nf-overlay">
              <p className="nf-big">HEKTHOR vs TICKS</p>
              <p className="nf-hint">Press <kbd>SPACE</kbd> or tap to start</p>
            </div>
          )}
          {phase === "over" && (
            <div className="nf-overlay">
              <p className="nf-big">A tick got you.</p>
              <p className="nf-hint">Even prophets stumble. You reached <b>{rank}</b> · {score} dodged.</p>
              <p className="nf-hint">Press <kbd>SPACE</kbd> or tap · sit, stay, retry</p>
            </div>
          )}
        </div>

        <div className="nf-actions">
          <a href="/" className="btn-gold">Fetch the homepage</a>
          <a href="/entry" className="nf-link">or become a Dogyptian →</a>
        </div>
      </main>

      <style>{`
        .notfound-page.dark-bg { min-height: 100dvh; display: flex; flex-direction: column; }
        .notfound-page.dark-bg::before { position: fixed; }

        .nf-main {
          flex: 1; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
          padding: 8px 18px 48px;
          max-width: 860px; margin: 0 auto; width: 100%;
        }
        .nf-eyebrow {
          font-family: 'Cinzel', serif; font-weight: 700;
          letter-spacing: 0.34em; text-transform: uppercase;
          font-size: 0.7rem; color: #C99A3F; opacity: 0.85;
          margin: 4px 0 10px;
        }
        .nf-code {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(1.5rem, 5vw, 2.4rem);
          color: #F5E9CF; margin: 0 0 12px; line-height: 1.15;
        }
        .nf-sub {
          color: rgba(245,233,207,0.66);
          font-size: 0.95rem; line-height: 1.55; max-width: 460px;
          margin: 0 0 22px;
        }
        .nf-hud {
          display: flex; gap: 18px; align-items: center; justify-content: center;
          flex-wrap: wrap;
          font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(245,233,207,0.55);
          font-family: 'Cinzel', serif;
          margin-bottom: 12px;
        }
        .nf-hud b { color: #F5C73D; }
        .nf-rank {
          color: #C99A3F; border: 1px solid rgba(201,154,63,0.4);
          border-radius: 999px; padding: 3px 12px; font-weight: 700;
        }
        .nf-stage {
          position: relative; width: 100%; max-width: 820px;
          border: 1px solid rgba(201,154,63,0.28);
          border-radius: 12px; overflow: hidden;
          background: rgba(0,0,0,0.35);
          cursor: pointer; touch-action: manipulation; user-select: none;
        }
        .nf-canvas { display: block; width: 100%; height: auto; }
        .nf-overlay {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 8px; background: rgba(10,7,3,0.62);
          backdrop-filter: blur(1px);
        }
        .nf-big {
          font-family: 'Cinzel', serif; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          font-size: clamp(1rem, 3.4vw, 1.35rem); color: #F5C73D; margin: 0;
        }
        .nf-hint { color: rgba(245,233,207,0.72); font-size: 0.85rem; margin: 0; }
        .nf-hint b { color: #C99A3F; }
        kbd {
          font-family: 'Cinzel', serif; font-size: 0.72rem;
          border: 1px solid rgba(201,154,63,0.5); border-radius: 5px;
          padding: 2px 7px; color: #F5C73D; background: rgba(201,154,63,0.08);
        }
        .nf-actions {
          margin-top: 24px; display: flex; flex-direction: column;
          align-items: center; gap: 14px;
        }
        .btn-gold {
          padding: 14px 32px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250,244,236,0.30); border-radius: 8px;
          color: #000; font-family: 'Cinzel', serif; font-size: 0.85rem;
          font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          text-decoration: none; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.22s;
          box-shadow: 0 0 40px rgba(230,158,26,0.4), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .btn-gold:hover { transform: scale(1.04); }
        .nf-link {
          color: rgba(245,233,207,0.6); font-size: 0.85rem;
          text-decoration: none; letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .nf-link:hover { color: #C99A3F; }
      `}</style>
    </div>
  );
};

export default NotFound;
