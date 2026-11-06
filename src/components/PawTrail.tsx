import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { HandPaw } from "@/components/pack/HandIcons";
import { IS_APP } from "@/lib/isApp";

// PSIA PACKA NA POZADÍ (6. 11. 2026) — namiesto kurzora packa a za ňou na ploche pozadia
// pomaly miznúce stopy. Len myš (hover + jemný pointer), nikdy dotyk; prefers-reduced-motion
// vypne obe. Beží LEN na verejných cestách nižšie — /pack, /admin, appka a render-cesty nie.
// Žiadne re-rendery Reactu: jeden canvas, pointermove len zapisuje súradnice, kreslí rAF.

const GOLD = "#C99A3F";   // brandové zlato
const INK = "#1A1206";    // tmavý atrament (obrys proti svetlému aj tmavému podkladu)
const STRIDE = 56;        // rozostup stôp v px (podľa prejdenej vzdialenosti, nie času)
const MAX = 30;           // strop stôp naraz
const FADE_MS = 2800;     // dĺžka miznutia
const STAMP = 16;         // veľkosť stopy v px
const CURSOR = 32;        // veľkosť kurzora v px
// z-index 1: nad podkladom stránky (napr. `.aw` je positioned), pod obsahom (`.hero` má z 2)
const MAX_ALPHA = 0.55;

/** Cesty, kde packa smie bežať (verejný web). Všetko ostatné — /pack, /admin, /magnet, flow,
 *  render-cesty — ostáva s normálnym kurzorom. */
const ALLOWED = /^\/(app|wall|terms|privacy|login|dog|d|lost|will|zavet)?(\/|$)/;
const DENIED = /^\/(pack|admin|magnet|heroglyph|checkout|payment|welcome|lab|entry|cert-render|invoice-render|share-render)(\/|$)/;

/** Čo sa NEpovažuje za plochu pozadia: obsah a interaktívne prvky. */
const CONTENT_SEL = [
  "a", "button", "input", "textarea", "select", "label", "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "img", "picture", "video", "iframe", "canvas", "svg", "li", "ul", "ol", "table", "nav", "header",
  "footer", "form", "span", "strong", "em", "small", "[role=button]", "[contenteditable]",
  ".pk-stage", ".pk-card", ".ph", "section .wrap > *",
].join(",");

type Stamp = { x: number; y: number; rot: number; t: number };

export function PawTrail() {
  const { pathname } = useLocation();
  const on = !IS_APP && !DENIED.test(pathname) && ALLOWED.test(pathname);
  const holder = useRef<HTMLSpanElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!on) return;
    const mq = (q: string) => window.matchMedia(q).matches;
    if (!mq("(hover: hover) and (pointer: fine)") || mq("(prefers-reduced-motion: reduce)")) return;
    const svg = holder.current?.querySelector("svg");
    const canvas = cv.current;
    const ctx = canvas?.getContext("2d");
    if (!svg || !canvas || !ctx) return;

    // SVG packy z HandPaw → data-URI (jeden zdroj kresby pre kurzor aj stopy)
    const mk = (size: number, stroke: number) => {
      const c = svg.cloneNode(true) as SVGSVGElement;
      c.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      c.setAttribute("width", String(size)); c.setAttribute("height", String(size));
      c.setAttribute("fill", GOLD); c.setAttribute("stroke", INK);
      c.setAttribute("stroke-width", String(stroke)); c.setAttribute("paint-order", "stroke");
      return "data:image/svg+xml;utf8," + encodeURIComponent(new XMLSerializer().serializeToString(c));
    };
    const img = new Image();
    img.src = mk(STAMP * 2, 10);
    const style = document.createElement("style");
    // kurzor = plná zlatá packa (nie obrys), mierne naklonená doľava
    const solid = `<svg xmlns="http://www.w3.org/2000/svg" width="${CURSOR}" height="${CURSOR}" viewBox="0 0 32 32"><g transform="rotate(-22 16 16)" fill="${GOLD}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"><ellipse cx="7" cy="14" rx="2.8" ry="3.6"/><ellipse cx="12.5" cy="8.5" rx="2.9" ry="3.8"/><ellipse cx="19.5" cy="8.5" rx="2.9" ry="3.8"/><ellipse cx="25" cy="14" rx="2.8" ry="3.6"/><path d="M16 15c-4.6 0-8.2 4.6-8.2 8 0 2.6 2 3.8 4.2 3.8 1.5 0 2.5-.7 4-.7s2.5.7 4 .7c2.2 0 4.2-1.2 4.2-3.8 0-3.4-3.6-8-8.2-8z"/></g></svg>`;
    style.textContent = `html.paw-on, html.paw-on body { cursor: url("data:image/svg+xml;utf8,${encodeURIComponent(solid)}") ${CURSOR / 2} ${CURSOR / 2}, auto; }`;
    document.head.appendChild(style);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fit = () => {
      canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    const stamps: Stamp[] = [];
    let last: { x: number; y: number } | null = null, dist = 0, side = 1, raf = 0, paw = false;

    const draw = (now: number) => {
      raf = 0;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = stamps.length - 1; i >= 0; i--) {
        const s = stamps[i], k = 1 - (now - s.t) / FADE_MS;
        if (k <= 0) { stamps.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = MAX_ALPHA * k;
        ctx.translate(s.x, s.y); ctx.rotate(s.rot);
        ctx.drawImage(img, -STAMP / 2, -STAMP / 2, STAMP, STAMP);
        ctx.restore();
      }
      if (stamps.length) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };

    const setPaw = (v: boolean) => {
      if (v === paw) return;
      paw = v; document.documentElement.classList.toggle("paw-on", v);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const t = e.target as Element | null;
      const bg = !!t && t !== document.documentElement && !t.closest(CONTENT_SEL) && !t.closest("[data-no-paw]");
      setPaw(bg);
      if (!bg) { last = null; return; }
      if (!last) { last = { x: e.clientX, y: e.clientY }; dist = 0; return; }
      const dx = e.clientX - last.x, dy = e.clientY - last.y, d = Math.hypot(dx, dy);
      if (d < 1) return;
      dist += d;
      if (dist >= STRIDE) {
        const a = Math.atan2(dy, dx);
        // Labky striedavo vľavo/vpravo od línie pohybu; kresba mieri prstami hore → +90°
        const off = 7 * side;
        stamps.push({
          x: e.clientX + Math.cos(a + Math.PI / 2) * off,
          y: e.clientY + Math.sin(a + Math.PI / 2) * off,
          rot: a + Math.PI / 2, t: performance.now(),
        });
        if (stamps.length > MAX) stamps.shift();
        side = -side; dist = 0; kick();
      }
      last = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => { setPaw(false); last = null; };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", fit);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("paw-on");
      style.remove();
    };
  }, [on]);

  if (!on) return null;
  return (
    <>
      <span ref={holder} style={{ display: "none" }}><HandPaw size={STAMP} /></span>
      <canvas
        ref={cv}
        aria-hidden
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 1, pointerEvents: "none" }}
      />
    </>
  );
}
