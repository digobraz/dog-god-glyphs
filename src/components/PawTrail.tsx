import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { IS_APP } from "@/lib/isApp";

// PSIA PACKA (6. 11. 2026, v2) — kurzor je VŽDY naša packa (Matej: „bude stále na stránke,
// nebude sa meniť"); živé je len TRASOVANIE: za myšou ostávajú na ploche pozadia stopy,
// ktoré pomaly miznú. Len myš (hover + jemný pointer), nikdy dotyk; prefers-reduced-motion
// vypne stopy (packa ostáva). Beží LEN na verejných cestách nižšie — /pack, /admin, appka nie.
//
// v1 kreslila celoplošný canvas cez rAF a pri každom pohybe prepínala triedu na <html>
// (prepočet štýlov celej stránky) — sekalo to a canvas pod sklenou hlavičkou nútil blur
// prepočítavať každý snímok. v2: stopy sú recyklované <i> v STRÁNKE (absolútne, scrollujú
// s obsahom), miznú CSS animáciou (len opacity = kompozítor), JS beží len raz za krok.
// „Pozadie" sa už nehádže podľa zoznamu tagov (ten vyradil celé stĺpce aj prázdne miesto
// vedľa nadpisu), ale meria sa v bode stopy: nie je nad textom, médiom, ovládačom ani nad
// kartou (plocha s vlastným podkladom užšia ako okno).

const GOLD = "#C99A3F";   // brandové zlato
const INK = "#1A1206";    // tmavý atrament
const BROWN = "#3B2614";  // stopy — tmavohnedé bez obrysu (Matej 6. 11.)
const LAPIS = "#16307A";  // kurzor — lapis bez obrysu (Matej 6. 11.)
const AI_LIGHT = "#CFF3FA"; // v sekcii AINUBIS (`[data-paw=ai]`) svetlé stopy a cyan packa (Matej 6. 11.)
const STRIDE = 44;        // rozostup stôp v px (podľa prejdenej vzdialenosti, nie času)
const MAX = 40;           // strop stôp naraz (recyklujú sa dookola)
const FADE_MS = 3000;     // dĺžka miznutia
const STAMP = 14;         // veľkosť stopy v px
const CURSOR_BOX = 44;    // kurzor so žiarou — packa ostáva ~30 px, okolo miesto na žiaru

/** Plná packa = obrys `HandPaw` (HandIcons.tsx) bez vnútorných otvorov, viewBox 0 0 369 382. */
const PAW_SOLID = "M221.853,2.2c9.821,-3.237 26.732,-2.685 34.074,1.105c18.917,9.805 32.575,30.648 36.443,55.627c1.863,11.969 0.869,34.911 -2.021,46.849c-2.889,11.889 -10.911,27.568 -18.379,35.89c-22.627,25.263 -55.438,26.937 -79.407,4.073c-11.1,-10.595 -19.2,-28.484 -21.853,-48.348c-2.337,-17.369 2.021,-41.227 10.658,-58.406c9.553,-19.011 22.627,-30.901 40.485,-36.79Zm-119.292,43.437c17.685,-4.547 38.812,8.306 50.401,30.632c9.695,18.68 12.222,35.227 7.911,51.728c-3.332,12.774 -7.074,19.153 -16.09,27.379c-21.648,19.785 -56.606,10.106 -70.785,-19.595c-17.764,-37.216 -3.616,-81.87 28.563,-90.144Zm216.178,73.012c7.09,-1.674 9.395,-1.595 16.69,0.569c13.895,4.137 27.079,22.484 31.627,44.037c5.858,27.727 -7.279,56.212 -31.059,67.359c-6.189,2.906 -9.063,3.443 -18.205,3.427c-9.222,-0.016 -11.922,-0.537 -18.048,-3.537c-13.769,-6.727 -23.195,-20.858 -25.753,-38.59c-1.105,-7.69 -0.948,-11.101 0.979,-20.274c5.763,-27.475 22.753,-48.033 43.769,-52.991Zm-284.958,23.369c21.601,-5.384 47.464,14.811 56.212,43.911c7.61,25.296 -1.974,50.133 -23.795,61.723c-4.595,2.431 -7.564,2.968 -16.453,2.984c-13.674,0.016 -22.422,-3.679 -31.706,-13.406c-7.706,-8.084 -12.127,-16.595 -15.506,-29.858c-3.205,-12.553 -3.221,-16.99 -0.11,-29.164c3.016,-11.747 6.363,-18.569 12.489,-25.342c5.4,-5.985 10.027,-8.637 18.869,-10.848Zm136.582,33.459c11.052,-2.274 17.163,-2.432 26.89,-0.695c22.832,4.074 35.448,12.442 54.948,36.427c6.711,8.274 12.474,13.768 19.39,18.521c31.8,21.837 48.901,50.48 49.059,82.139c0.158,34.2 -20.574,56.653 -55.959,60.632c-13.279,1.484 -20.669,0.032 -38.938,-7.674c-8.147,-3.442 -17.874,-6.915 -21.632,-7.721c-14.274,-3.063 -30.664,0.821 -55.059,13.043c-22.8,11.4 -39.837,13.958 -57.696,8.652c-17.842,-5.305 -26.116,-11.7 -33.142,-25.626c-12.49,-24.775 -10.548,-51.128 5.652,-76.36c3.79,-5.889 12.364,-15.695 22.327,-25.516c12.221,-12.063 18.522,-19.532 25.785,-30.585c17.448,-26.511 35.574,-40.564 58.375,-45.237Z";
const svg = (size: number, rot: number, stroke: number, fill = GOLD) =>
  "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-20 -20 409 422">` +
    `<g transform="rotate(${rot} 184 191)"><path d="${PAW_SOLID}" fill="${fill}" stroke="${stroke ? INK : "none"}" stroke-width="${stroke}" stroke-linejoin="round"/></g></svg>`);

/** Kurzor — lesklý lapis (svetlejší hore) so zlatou žiarou okolo (Matej 6. 11.: „packu urob trochu žiariacu, je taká fádna“).
 *  `ai` = cyan packa s cyan žiarou pre tmavú sekciu AINUBISA. */
const cursorSvg = (size: number, rot: number, ai = false) =>
  "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-90 -90 549 562">` +
    (ai
      ? `<defs><linearGradient id="l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6FAFF"/><stop offset=".45" stop-color="#5BE0F0"/><stop offset="1" stop-color="#1A8FA8"/></linearGradient>`
      : `<defs><linearGradient id="l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4F7BEA"/><stop offset=".45" stop-color="${LAPIS}"/><stop offset="1" stop-color="#0A1A4A"/></linearGradient>`) +
    `<filter id="g" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="26"/></filter></defs>` +
    `<g transform="rotate(${rot} 184 191)"><path d="${PAW_SOLID}" fill="${ai ? "#5BE0F0" : "#F5C73D"}" filter="url(#g)"/>` +
    `<path d="${PAW_SOLID}" fill="url(#l)" stroke="${ai ? "#E6FAFF" : "#EFD79A"}" stroke-width="10" stroke-opacity=".7"/></g></svg>`);

/** Cesty, kde packa smie bežať (verejný web). */
const ALLOWED = /^\/(app|wall|terms|privacy|login|dog|d|lost|will|zavet)?(\/|$)/;
const DENIED = /^\/(pack|admin|magnet|heroglyph|checkout|payment|welcome|lab|entry|cert-render|invoice-render|share-render)(\/|$)/;

/** Nikdy pozadie: ovládače, médiá, hlavička a výslovne vyňaté miesta. Karty chytá meranie podkladu. */
const SOLID_SEL = [
  "a", "button", "input", "textarea", "select", "label", "img", "picture", "video", "iframe",
  "canvas", "svg", "details", "header", "nav", "[role=button]", "[contenteditable]", "[data-no-paw]",
].join(",");

/** Leží bod (x, y) na ploche pozadia? Volá sa raz za krok, nie pri každom pohybe. */
function isBackground(x: number, y: number): boolean {
  const el = document.elementFromPoint(x, y);
  if (!el || el.closest(SOLID_SEL)) return false;
  // karta = predok s vlastným podkladom/sklom, užší ako okno (sekcia cez celú šírku je pozadie)
  const vw = window.innerWidth * 0.9;
  for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) {
    const cs = getComputedStyle(n);
    const surf = (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent")
      || cs.backgroundImage !== "none" || (cs.backdropFilter && cs.backdropFilter !== "none");
    if (surf && n.getBoundingClientRect().width < vw) return false;
  }
  // text: rozhoduje glyf pod bodom, nie celý blok — vedľa krátkeho nadpisu je pozadie
  const doc = document as Document & { caretRangeFromPoint?: (x: number, y: number) => Range | null };
  const r = doc.caretRangeFromPoint?.(x, y);
  const node = r?.startContainer;
  if (node && node.nodeType === 3 && node.textContent?.trim()) {
    const rg = document.createRange();
    const i = Math.min(r!.startOffset, (node.textContent?.length ?? 1) - 1);
    rg.setStart(node, Math.max(0, i - 1)); rg.setEnd(node, Math.min(node.textContent!.length, i + 1));
    for (const b of Array.from(rg.getClientRects())) {
      if (x >= b.left - 6 && x <= b.right + 6 && y >= b.top - 6 && y <= b.bottom + 6) return false;
    }
  }
  return true;
}

export function PawTrail() {
  const { pathname } = useLocation();
  const on = !IS_APP && !DENIED.test(pathname) && ALLOWED.test(pathname);
  const layer = useRef<HTMLDivElement>(null);

  // kurzor — vždy packa, na celej stránke (okrem písania do poľa)
  useEffect(() => {
    if (!on || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const style = document.createElement("style");
    style.textContent =
      `html, html * { cursor: url("${cursorSvg(CURSOR_BOX, -22)}") ${CURSOR_BOX / 2} ${CURSOR_BOX / 2}, auto !important; }` +
      `[data-paw=ai], [data-paw=ai] * { cursor: url("${cursorSvg(CURSOR_BOX, -22, true)}") ${CURSOR_BOX / 2} ${CURSOR_BOX / 2}, auto !important; }` +
      `html input:not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]), html textarea, html [contenteditable] { cursor: text !important; }`;
    document.head.appendChild(style);
    return () => style.remove();
  }, [on]);

  // trasovanie
  useEffect(() => {
    if (!on) return;
    const mq = (q: string) => window.matchMedia(q).matches;
    if (!mq("(hover: hover) and (pointer: fine)") || mq("(prefers-reduced-motion: reduce)")) return;
    const box = layer.current;
    if (!box) return;

    const url = `url("${svg(STAMP * 2, 0, 0, BROWN)}")`;
    const urlAi = `url("${svg(STAMP * 2, 0, 0, AI_LIGHT)}")`;
    const pool: HTMLElement[] = [];
    for (let i = 0; i < MAX; i++) {
      const s = document.createElement("i");
      s.style.cssText = `position:absolute;left:0;top:0;width:${STAMP}px;height:${STAMP}px;` +
        `margin:${-STAMP / 2}px 0 0 ${-STAMP / 2}px;background:${url} center/contain no-repeat;opacity:0;will-change:opacity`;
      box.appendChild(s); pool.push(s);
    }
    let next = 0, lx = NaN, ly = NaN, dist = 0, side = 1;

    const stamp = (x: number, y: number, a: number, ai: boolean) => {
      const off = 6 * side; side = -side;
      const px = x + Math.cos(a + Math.PI / 2) * off, py = y + Math.sin(a + Math.PI / 2) * off;
      if (!isBackground(px, py)) return;
      const o = box.getBoundingClientRect();   // vrstva scrolluje so stránkou → súradnice stránky
      const s = pool[next]; next = (next + 1) % MAX;
      s.getAnimations().forEach((an) => an.cancel());
      s.style.backgroundImage = ai ? urlAi : url;
      s.style.transform = `translate(${px - o.left}px, ${py - o.top}px) rotate(${a + Math.PI / 2}rad)`;
      s.animate([{ opacity: 0.5 }, { opacity: 0.5, offset: 0.25 }, { opacity: 0 }], { duration: FADE_MS, easing: "ease-in", fill: "forwards" });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = e.clientX, y = e.clientY;
      if (Number.isNaN(lx)) { lx = x; ly = y; return; }
      const dx = x - lx, dy = y - ly, d = Math.hypot(dx, dy);
      if (d > 300) { lx = x; ly = y; dist = 0; return; }   // skok (nové okno, tab) — žiadna čiara cez stránku
      dist += d; lx = x; ly = y;
      if (dist >= STRIDE) { dist = 0; stamp(x, y, Math.atan2(dy, dx), !!(e.target as Element | null)?.closest?.("[data-paw=ai]")); }
    };
    const onLeave = () => { lx = NaN; };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      pool.forEach((s) => s.remove());
    };
  }, [on]);

  if (!on) return null;
  // absolútne voči dokumentu ⇒ stopa ostane na mieste stránky aj pri scrolle;
  // z 15 = nad obsahom sekcií (max 6), pod lepiacou hlavičkou (20) a spodnou lištou (30)
  return <div ref={layer} aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, zIndex: 15, pointerEvents: "none" }} />;
}
