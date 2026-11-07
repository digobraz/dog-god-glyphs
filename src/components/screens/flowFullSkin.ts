import { LAB } from '@/lib/labTheme';
import { PAGE_AIR } from '@/components/pack/packTheme';

// ════════════════════════════════════════════════════════════════════════════
// HEROFLOW NA CELÚ OBRAZOVKU (7. 11. 2026) — jeden zdroj
// ────────────────────────────────────────────────────────────────────────────
// Zdroj: `plany/nakresy/heroflow-cela-obrazovka-2026-11-07/index.html`, stĺpec PO.
// Matej: *„zatiaľ je to super! z nákresu to daj do devu, ešte to poladíme"*.
//
// 🔑 Ide o VRSTVU nad existujúcim bledým šatom (`flowPaleSkin.ts` + `flowRedress.tsx`),
//    nie o prepis dvanástich obrazoviek. Každé pravidlo je zapuzdrené v
//    `html[data-flow-full]`, ktorý `FlowRedress` vešia na <html> LEN keď je
//    `FLOW_FULL` true. Vrátenie na predošlý vzhľad = `FLOW_FULL = false` (jeden riadok).
//
// 🔤 PÍSMO = LT Museum, LEN v heroflowe (nákres: telo Medium 500, nadpisy a CTA Black 900).
//    ⚠️ Brand lock hovorí Cinzel 700 — toto je Matejova skúška z 6. 11. („daj font museum"),
//    ktorú už nesie aj web /app. Jedna premenná `FLOW_FONT`; späť na Cinzel = zmeniť ju
//    (alebo `FLOW_FULL = false`). Súbory sú v `public/fonts/museum-*.woff2`; licencia: skúšobná
//    verzia fontu (`ltmuseum-black-test-v1`) — pred ostrým použitím treba kúpenú licenciu.
//
// ⚠️ Čo sa tu NEMENÍ: logika krokov, poradie, texty. Len koža.
// ════════════════════════════════════════════════════════════════════════════

/** Zapnutie celej vrstvy. `false` = flow vyzerá ako pred 7. 11. 2026. */
export const FLOW_FULL = true;

/** Písmo heroflowu — JEDNO miesto. Emoji fonty na konci, aby vlajky nespadli na textový variant. */
export const FLOW_FONT =
  "'LT Museum', 'Space Grotesk', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";

/** Zlato-oranžový gradient progresu (Matej 7. 11., 2. kolo). */
export const FLOW_PROGRESS_FILL = 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)';

/** Výška hlavného CTA v doku (nákres `.pk-cta` ≈ 48). */
const DOCK_H = 48;

const F = 'html[data-flow-full]';
const ROOT = `${F} :is(.dark-bg, .hf-pale)`;
const TXT = ':is(div, span, p, h1, h2, h3, h4, button, input, textarea, select, label, b, strong, i, a, li, small, em)';

export const FLOW_FULL_CSS = `
@font-face { font-family: 'LT Museum'; src: url('/fonts/museum-medium.woff2') format('woff2'); font-weight: 500; font-display: swap; }
@font-face { font-family: 'LT Museum'; src: url('/fonts/museum-black.woff2') format('woff2'); font-weight: 900; font-display: swap; }

/* ── STENA: jednoliaty papyrus, kresba len dole a väčšia ────────────────────
   Nákres \`.art\`: bg-light, 220 % šírky, pri dne, jemný prechod do papyrusu.
   Závoj (\`::after\`) odpadá — papyrus je podklad celého koreňa. */
${ROOT} { background: ${LAB.pageBackdrop}; background-color: ${LAB.pageBg}; }
${ROOT}::before {
  top: auto !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
  width: auto !important; height: 38% !important;
  background-image: var(--bg-light) !important;
  background-size: 220% auto !important; background-position: center bottom !important;
  filter: none !important; opacity: .11;
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 40%);
  mask-image: linear-gradient(180deg, transparent, #000 40%);
}
${ROOT}::after { display: none !important; }

/* ── PÍSMO ──────────────────────────────────────────────────────────────────
   Telo Medium, nadpisy / CTA / mená Black. Emoji ostáva na svojom fonte. */
${ROOT} ${TXT}:not(.em) { font-family: ${FLOW_FONT} !important; font-weight: 500; }
${ROOT} :is(.hf-cta, .nm-cta, button.bg-primary, .btn-gold, h3, b, strong) { font-weight: 900; }

/* ── MEDAILÓN: fotka s tenkým zlatým lemom, bez obruče (nákres \`.pk-medallion\`) ── */
${ROOT} .fm > :is(.fm-ring, .fm-bevel, .fm-gloss, .fm-well, svg) { display: none !important; }
${ROOT} .fm-face {
  inset: 0 !important;
  border: 1.5px solid rgba(179, 130, 45, 0.55);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28);
  background: ${LAB.pageBg};
}

/* ── BLOKY ZANIKAJÚ: obsah leží priamo na podklade ──────────────────────── */
${ROOT} .hf-stage :is(.hf-block, .hf-carved, .papyrus-bg) {
  background: none !important; border: 0 !important; box-shadow: none !important;
  padding: 0 !important; border-radius: 0;
}
${ROOT} .hf-stage :is(.hf-carved-rim) { display: none !important; }
${ROOT} .hf-stage .hf-plate { padding: 0; }
${ROOT} .hf-stage .hf-block { margin-top: 0; }
/* Obsah je HORE, nie uprostred (nákres: \`.bd\` začína pod radom). */
${ROOT} .hf-stage:not(.wl-page) > * { margin-top: 0; margin-bottom: auto; }
${ROOT} .hf-stage { padding-bottom: ${DOCK_H + PAGE_AIR.min * 2 + PAGE_AIR.md}px; }

/* ── RAD SPÄŤ · LOGO · JAZYK ────────────────────────────────────────────── */
${ROOT} .hf-topbar { position: relative; z-index: 2; }

/* ── BUBLINA: fotka vľavo, otázka v papyrusovej rečovej bubline s chvostíkom ──
   Nákres \`.hd .bub\`: papyrusový gradient, zlatý rám 1 px, chvost k fotke. */
${ROOT} .hf-speak:not(.st-speak) {
  background: none !important; padding: 0 !important; border-radius: 0 !important;
  gap: ${PAGE_AIR.min}px; align-items: center;
}
${ROOT} .hf-speak:not(.st-speak) > .fm { width: 64px !important; height: 64px !important; }
${ROOT} .hf-speak:not(.st-speak) .say {
  position: relative; flex: 1; min-width: 0; padding: 8px 12px; border-radius: 12px;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%); border: 1px solid #C99A3F;
  box-shadow: 0 1px 3px rgba(122, 90, 42, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.4);
}
${ROOT} .hf-speak:not(.st-speak) .say::before {
  content: ''; position: absolute; left: -9px; top: 50%; margin-top: -8px;
  border: 8px solid transparent; border-left: 0; border-right: 9px solid #C99A3F;
}
${ROOT} .hf-speak:not(.st-speak) .say::after {
  content: ''; position: absolute; left: -7px; top: 50%; margin-top: -7px;
  border: 7px solid transparent; border-left: 0; border-right: 8px solid #FAF1DC;
}
${ROOT} .hf-speak:not(.st-speak) h2 { color: #000; text-transform: uppercase; letter-spacing: .04em; }
${ROOT} .hf-speak:not(.st-speak) p { color: #1a1208; }
/* Zvýraznené slovo = zlatý text, jediné Black (nákres \`.hl\`). */
${ROOT} :is(.hf-speak:not(.st-speak), .hf-bubble) :is(b, strong) {
  background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; font-weight: 900;
}

/* Krok MENO: tmavý pozdrav zaniká, ostáva medailón a čierny nadpis. */
${ROOT} [style*="brand-gradient"] { background: none !important; }
${ROOT} [style*="brand-gradient"] .text-white { color: #000 !important; text-transform: uppercase; filter: none; }

${ROOT} :is([style*="brand-gradient"], .hf-speak) :is(.text-amber-300) {
  background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent !important; font-weight: 900;
}
${ROOT} .hf-speak:not(.st-speak) { margin-bottom: ${PAGE_AIR.min}px; }

/* ── PILULKY TÉM A VOLIEB = papyrus, vybraná = lapisový tint (nákres \`.pk-pill\`) ── */
${ROOT} .ftc-chip {
  min-height: 40px; font-size: 12px; font-weight: 500; letter-spacing: .1em;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%); border: 1px solid #C99A3F;
  color: #2a1608; box-shadow: 0 1px 3px rgba(122, 90, 42, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.4);
}
${ROOT} .ftc-chip:hover { background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%); }
${ROOT} .ftc-chip.on {
  background: rgba(22, 48, 122, 0.16); border-color: #16307A; color: #0A1A4A;
  box-shadow: inset 0 0 0 1px rgba(22, 48, 122, 0.45);
}
/* Deliace čiary medzi časťami dosky zanikajú spolu s doskou. */
${ROOT} .hf-stage .fdh-rule { display: none; }
${ROOT} .hf-stage .fdh-name { color: #000; }

/* ── POVAHA: mriežka 3 + 3 + 2 namiesto vodorovného radu (Matej 7. 11., 4. kolo) ── */
${ROOT} .hf-scroll .hf-snav { display: none !important; }
${ROOT} .ch-traits { display: flex !important; flex-wrap: wrap; justify-content: center; gap: 8px; overflow: visible !important; padding: 0 !important; margin: 0 !important; }
${ROOT} .ch-traits .ch-trait { width: calc((100% - 16px) / 3); padding: 12px 4px; }
${ROOT} .ch-traits .ch-trait img { width: 44px; height: 44px; }
${ROOT} .ch-traits .ch-trait .lb { font-weight: 900; color: #000; letter-spacing: .06em; }
${ROOT} .ch-traits .ch-trait.on .lb { color: #16307A; }
@media (max-height: 700px) {
  ${ROOT} .ch-traits { gap: 4px; }
  ${ROOT} .ch-traits .ch-trait { width: calc((100% - 8px) / 3); padding: 4px; gap: 0; }
  ${ROOT} .ch-traits .ch-trait img { width: 32px; height: 32px; }
}

/* Ikonka (i) bola svetlá na tmavej bubline — na papyruse musí byť tmavá. */
${ROOT} :is([style*="brand-gradient"], .hf-speak) button { color: #000 !important; }
${ROOT} :is([style*="brand-gradient"], .hf-speak) button span { color: #000 !important; border-color: rgba(0, 0, 0, 0.45) !important; }

/* ── HLAVNÉ CTA = DOK DOLE NA CELÚ ŠÍRKU ────────────────────────────────────
   Obsah je hore, lapisové CTA pri spodnom okraji, okraje PAGE_AIR; na PC stĺpec 640.
   ⚠️ \`position: fixed\` zámerne: CTA sedí v rôznych vnoreniach (doska, plate, skupina)
   a sticky by držalo len v hraniciach rodiča. Značku \`.hf-dock\` nesie hlavné CTA obrazovky. */
${ROOT} .hf-dock {
  position: fixed; z-index: 40; width: auto; height: ${DOCK_H}px;
  left: max(${PAGE_AIR.side}px, calc(50% - 320px)); right: max(${PAGE_AIR.side}px, calc(50% - 320px));
  bottom: max(${PAGE_AIR.md}px, env(safe-area-inset-bottom));
}
`;
