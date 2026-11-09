// ŠAT AINUBIS 3D — základ (Matej 9. 11. 2026, hárok plany/nakresy/ainubis-3d-2026-11-09, zadanie plany/zadanie-ainubis-3d-prepis-2026-11-09.md).
// Len pod `APP_NEW`: CSS vkladá `zapniPapyrus3d` (lib/papyrus3d.ts), web na dogypt.com ho nemá.
// Fyzika 3D je tá istá ako Papyrus 3D (obrys, svetlá hrana, spodná pera, pri stlačení klesne), farby sú AINUBISOVE.
// Matej: „zachovaj brand a dizajn ainubisa“ · „musíme budovať brand a držať rozdiel medzi klasickým prostredím a prostredím kde je ainubis“.
// Povrch sa nekreslí nanovo: oblasť si v svojom súbore (vault, zvitok, chat, mapa, ostatne) preberie existujúce triedy
// cez `html.papyrus3d .trieda{${M3.card}}` a tvar berie odtiaľto. Veľkosti z hárku sú zaokrúhlené na stupnice (lock TLAČIDLO 3D).
import { AINUBIS as A } from '@/components/pack/ainubisSkin';

/** Logo v appke = pes s cyan očami (Matej 9. 11.: „nie šakala ale psa s cyna očami“). */
export const AI_LOGO = '/icons/ainubis-pes.webp';
/** Kresba sveta, tá istá ako na webe `/app`. Kľúč = `WORLD_TINT`. */
export const svetImg = (key: string) => `/icons/svety/${key}.webp`;

const CY = A.cyanRGB;
const W = `var(--ai-w,${CY})`;
const LEM = '0 0 0 2px var(--ai-out)';
const NADPIS = `letter-spacing:0;text-transform:none;color:${A.ink};`;

/** Mixiny: vkladajú sa DO pravidla. Rám nesie farbu sveta cez `--ai-w` (`aiWorld(key)`), bez nej cyan. */
export const M3 = {
  /** Karta: lem vo farbe sveta, tmavá pera. */
  card: `border:3px solid rgb(${W});border-radius:20px;background:var(--ai-card);box-shadow:${LEM},0 7px 0 2px color-mix(in srgb,rgb(${W}) 34%,#000),0 13px 16px var(--ai-sh),0 0 40px -14px rgb(${W});`,
  /** Vnútorný box v karte. */
  box: `border-radius:16px;background:var(--ai-fld);border:2px solid rgba(${CY},.32);box-shadow:inset 0 3px 4px rgba(0,0,0,.6);`,
  /** Vstupné pole. */
  field: `min-height:54px;border-radius:16px;border:2.5px solid var(--ai-edge);background:var(--ai-fld);box-shadow:var(--ai-inset);font:500 16px/1.35 'Space Grotesk',sans-serif;color:${A.ink};`,
  /** Panel zdola. */
  sheet: `background:var(--ai-sheet);border:0;border-top:6px solid var(--ai-edge);border-radius:24px 24px 0 0;box-shadow:0 -3px 0 var(--ai-out),0 -12px 30px rgba(${CY},.28);`,
  /** Úchyt panela: tvar ostáva z `.pk-grab`, mení sa len farba. */
  grab: `background:var(--ai-edge);`,
  scrim: `background:rgba(2,6,11,.72);`,
  /** Hlavička: tá istá stavba ako mapa, tmavé telo. */
  head: `background:var(--ai-head);border-bottom:3px solid var(--ai-edge);box-shadow:0 2px 0 var(--ai-out),0 0 26px -6px rgba(${CY},.55);`,
  /** Prepínač: obal, tlačidlo, zapnuté tlačidlo. */
  sw: `display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px;padding:6px;border-radius:20px;border:2.5px solid var(--ai-edge);background:var(--ai-fld);box-shadow:var(--ai-inset);`,
  swBtn: `height:50px;min-width:0;border:2.5px solid transparent;border-radius:14px;display:flex;align-items:center;justify-content:center;gap:4px;background:none;font:400 14px/1 'LT Museum',serif;letter-spacing:0;text-transform:none;color:${A.inkDim};`,
  swOn: `border-color:#04121A;background:linear-gradient(180deg,#B4F4FB,${A.cyan});color:#04121A;box-shadow:inset 0 2px 0 var(--ai-glow),0 4px 0 #1C7C8C,0 7px 9px var(--ai-sh);`,
  /** Bublina AINUBISA nad obsahom. */
  bub: `border-radius:16px;background:var(--ai-sheet);border:3px solid var(--ai-edge);box-shadow:${LEM},0 6px 0 2px var(--ai-lip),0 12px 16px var(--ai-sh),0 0 30px -8px rgba(${CY},.7);`,
  /** Replika stroja a človeka v chate. */
  bbAi: `border-radius:16px;background:var(--ai-card);border:2.5px solid var(--ai-edge);color:${A.ink};box-shadow:0 0 0 1.5px var(--ai-out),0 4px 0 1.5px var(--ai-lip);`,
  bbMe: `border-radius:16px;background:linear-gradient(135deg,#B4F4FB,${A.cyan});border:2.5px solid #04121A;color:#04121A;box-shadow:inset 0 2px 0 var(--ai-glow),0 4px 0 #1C7C8C;`,
  /** Nadpis, podnadpis, malý nadpis: písmo šatu bez verzálok. */
  h: `font:400 28px/1.12 'LT Museum',serif;${NADPIS}`,
  hSm: `font:400 24px/1.12 'LT Museum',serif;${NADPIS}`,
  hXs: `font:400 20px/1.12 'LT Museum',serif;${NADPIS}`,
  /** Štítok sekcie. */
  lab: `font:600 12px 'Space Grotesk',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:${A.cyan};`,
} as const;

// Farby 3D tlačidla: [horná, spodná, pera, lem, inkoust, svetlá hrana].
const FARBY = {
  or: ['#FFD65A', A.ctaB, '#8A5A0E', A.ctaInk, A.ctaInk, 'var(--ai-glow)'],
  cy: ['#B4F4FB', A.cyan, '#1C7C8C', '#04121A', '#04121A', 'var(--ai-glow)'],
  nt: ['#16324A', '#0A1622', '#020509', 'var(--ai-edge)', A.ink, `rgba(${CY},.32)`],
  rd: ['#FF9C8C', '#D4503E', '#7A2418', '#2A0805', '#2A0805', 'var(--ai-glow)'],
  gr: ['#A8E8BC', '#4FB070', '#1F6B3B', '#04210F', '#04210F', 'var(--ai-glow)'],
} as const;
export type Farba3D = keyof typeof FARBY;

/** Celé pravidlo 3D tlačidla pre existujúcu triedu, aj so stlačením. `sel` = selektor, `r` = polomer, `pera` = výška pery. */
export const b3 = (sel: string, f: Farba3D, r = '16px', pera = 6) => {
  const [a, b, p, l, i, g] = FARBY[f];
  return `${sel}{border:2.5px solid ${l};border-radius:${r};background:linear-gradient(180deg,${a},${b});color:${i};font-family:'LT Museum',serif;font-weight:400;letter-spacing:0;text-transform:none;box-shadow:inset 0 2px 0 ${g},inset 0 -4px 0 rgba(0,0,0,.18),0 ${pera}px 0 ${p},0 ${pera + 5}px 14px var(--ai-sh);transition:transform .07s,box-shadow .07s;}
${sel}:active:not(:disabled){transform:translateY(${pera - 1}px);box-shadow:inset 0 2px 0 ${g},inset 0 -2px 0 rgba(0,0,0,.18),0 1px 0 ${p},0 2px 4px var(--ai-sh);}`;
};

const VARIANT = (Object.keys(FARBY) as Farba3D[]).map((f) => b3(`.pk-b3.pk-b3--ai-${f}`, f, 'var(--b3-r)')).join('\n');

export const AI3D_ZAKLAD_CSS = `
html.papyrus3d{--ai-edge:#2E93A6;--ai-lip:#0E4A58;--ai-out:#01050A;--ai-fld:#03090F;--ai-sh:rgba(0,0,0,.62);--ai-glow:rgba(255,255,255,.28);
  --ai-head:linear-gradient(180deg,#0E2133,#071019);--ai-card:linear-gradient(180deg,#0E1E2D,#050A11);--ai-sheet:linear-gradient(180deg,#0E2133,#050A11);--ai-inset:inset 0 4px 5px rgba(0,0,0,.7);}
${VARIANT}
`;
