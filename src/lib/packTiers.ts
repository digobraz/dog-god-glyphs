// ─────────────────────────────────────────────────────────────────────────────
// FAREBNÉ PÁSMA LEVELU — jeden zdroj farby pre celú appku.
//
// Level je číslo bez stropu (`levelOf` v `@/lib/tripPoints`). Stupeň je FARBA + obrázok, ktoré to
// číslo práve nosí — deväť stupňov (od 26. 10. 2026 podľa profilu, prahy `PILGRIM_FROM` nižšie;
// pôvodných 9 pásiem po troch leveloch Piesok…Ametyst zaniklo).
//
// PREČO SAMOSTATNÝ MODUL: farbu berie hlavička mapy, karta na `/pack`, panel škály, reveal
// po zápise výletu aj pilulka pri cudzích menách. Keby si ju každý povrch písal sám, rozišli
// by sa — presne tak, ako sa už raz rozišla mapa s vysvedčením pri LEVELI
// (`profileLevelFor` v packCommunity.ts existuje z toho istého dôvodu).
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react';

/**
 * 🔄 26. 10. 2026 — JEDEN ZDROJ PRE PÚTNIKA (Matej: *„zmenili sme farebnosť aj ikonku a to musíme
 * zmeniť aj na /map v tripliste"*). Vzhľad z profilu (`profile/rankBadge.tsx`: 9 stupňov, smalt +
 * obrázok `pilgrim-N.webp`) je od teraz JEDINÝ — mapa, triplist, reveal, panel škály aj profil
 * čítajú tie isté `PILGRIM_FROM` / `PILGRIM_COL`. Staré pásma po troch leveloch (Piesok…Ametyst)
 * a ich farby zanikli; prahy nesie `PILGRIM_FROM`, nie `TIER_SPAN`.
 * Level samotný sa NEMENIL (`levelOf` v `tripPoints.ts`) — hýbe sa len to, do ktorého stupňa spadá.
 */
/** Prvý level každého z 9 stupňov. */
export const PILGRIM_FROM = [1, 4, 8, 13, 19, 26, 34, 43, 53];
/** Smalt stupňa. */
export const PILGRIM_COL = ['#5BD12A', '#1E9A48', '#3FD6C8', '#2F86F0', '#DCEAF2', '#E0287A', '#7A1530', '#6A2AC0', '#141A4A'];
/** Ľadová biela sa NEprelieva do ružovej (Matej 25. 10.: „biela sa farbí do ružova, to sa mi nepáči“). */
export const PILGRIM_NOBLEND = 4;
/** Posledný stupeň nemá ďalší prah — rozpätie na prelievanie farby. */
const LAST_SPAN = 12;

/** Index stupňa (0–8) pre hodnotu `v` — rovnaké pre level aj pre `from` poľa. */
export const stepOf = (from: number[], v: number) => from.reduce((t, f, i) => (v >= f ? i : t), 0);

export function mixHex(a: string, b: string, t: number) {
  const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

/** Farba náplne pre level + postup k ďalšiemu (0–100): začiatok a koniec prechodu k farbe ďalšieho stupňa. */
export function pilgrimColors(level: number, pct = 0): { t: number; c: string; c0: string; c1: string } {
  const t = stepOf(PILGRIM_FROM, level);
  const c = PILGRIM_COL[t];
  const nx = t < PILGRIM_COL.length - 1 ? PILGRIM_COL[t + 1] : c;
  const f = PILGRIM_FROM[t];
  const span = (t < PILGRIM_FROM.length - 1 ? PILGRIM_FROM[t + 1] : f + LAST_SPAN) - f;
  const still = t === PILGRIM_NOBLEND;
  return {
    t, c,
    c0: mixHex(c, nx, still ? 0 : (level - f) / span),
    c1: mixHex(c, nx, still ? 0 : Math.min(1, (level - f + pct / 100) / span)),
  };
}

/** Obrázok stupňa (ikonka PÚTNIKA). */
export const pilgrimImg = (t: number) => `/icons/pack/rank/pilgrim-${t}.webp`;

export interface PackTier {
  /** stabilný i18n kľúč — `pack.tier.<key>` */
  key: string;
  /** EN fallback / názov stupňa */
  name: string;
  /** svetlý koniec gradientu */
  a: string;
  /** hlavná farba (smalt stupňa; pri `tierOfLevel` už prelievaná podľa levelu) */
  b: string;
  /** farba písma NA tejto pilulke — tmavé stupne potrebujú svetlý inkoust */
  ink: string;
  /** prvý level stupňa */
  from: number;
  /** posledný level stupňa; posledný stupeň je otvorený (`null`) */
  to: number | null;
  /** index stupňa 0–8 (obrázok `pilgrim-<idx>.webp`) */
  idx: number;
}

const TIER_KEYS = ['lime', 'emerald', 'turquoise', 'azure', 'ice', 'rose', 'garnet', 'amethyst', 'indigo'];
// Mená pásiem = KRAJINA cesty pútnika (Matej 26. 10.: „pásma pomenujeme podľa zeme… lúky, lesa, hôr“ → schválené A + Peak + Nad oblakmi + Mliečna dráha).
const TIER_NAMES = ['Meadow', 'Wildwood', 'Tarn', 'Peak', 'Glacier', 'Aurora', 'Volcano', 'Above the Clouds', 'Milky Way'];

/** Svetlý inkoust na tmavej farbe, tmavý na svetlej (vnímaný jas). */
function inkFor(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#0d1630' : '#F5F0E4';
}

function tierAt(i: number, color: string): PackTier {
  return {
    key: TIER_KEYS[i], name: TIER_NAMES[i],
    a: mixHex(color, '#ffffff', 0.3), b: color, ink: inkFor(color),
    from: PILGRIM_FROM[i], to: i < PILGRIM_FROM.length - 1 ? PILGRIM_FROM[i + 1] - 1 : null, idx: i,
  };
}

export const PACK_TIERS: PackTier[] = PILGRIM_COL.map((c, i) => tierAt(i, c));

/** Odtieň BONES (tyrkys) — NIE je to PÚTNIK; zostal z pôvodnej sady, aby sa BONES nezmenili s rebríčkom. */
export const BONES_TIER: PackTier = {
  key: 'turquoise', name: 'Turquoise', a: '#74DCC6', b: '#178C80', ink: '#0d2426', from: 0, to: null, idx: 2,
};

/**
 * Stupeň pre daný level, s farbou už prelievanou podľa levelu (ako náplň odznaku v profile).
 * Level pod 1 aj nad poslednou hranicou vracia krajný stupeň — nikdy `undefined`.
 */
export function tierOfLevel(level: number): PackTier {
  const lv = Math.max(1, Math.floor(level || 1));
  const { t, c0 } = pilgrimColors(lv, 0);
  return tierAt(t, c0);
}

/** Index stupňa (0–8) — na porovnanie „prešiel som do ďalšieho stupňa?". */
export function tierIndexOfLevel(level: number): number {
  return stepOf(PILGRIM_FROM, Math.max(1, Math.floor(level || 1)));
}

/** Prechod medzi dvoma levelmi zmenil stupeň? */
export function crossedTier(fromLevel: number, toLevel: number): boolean {
  return tierIndexOfLevel(fromLevel) !== tierIndexOfLevel(toLevel);
}

/** Gradient pásma — na `background` pilulky. */
export const tierGradient = (t: PackTier): string => `linear-gradient(135deg, ${t.a}, ${t.b})`;

/**
 * Hotový štýl farebnej pilulky levelu. Rám je ten istý papyrusový `rgba(250,244,236,0.30)`
 * ako na `.btn-gold` — pilulka je odznak z tej istej rodiny, nie nový tvar.
 */
export function tierPillStyle(level: number): { background: string; color: string; borderColor: string } {
  const t = tierOfLevel(level);
  return { background: tierGradient(t), color: t.ink, borderColor: 'rgba(250,244,236,0.30)' };
}

/** Rozsah pásma ako text do zoznamu: „1–3" · „25+". */
export function tierRangeLabel(t: PackTier): string {
  return t.to === null ? `${t.from}+` : `${t.from}–${t.to}`;
}

/**
 * CSS premenné pásma na inline `style`. Používa sa tam, kde farbu nesie hotové CSS pravidlo
 * (hlavička mapy, karta na `/pack`) — pravidlo číta `var(--tier-a, …)` a fallback drží pôvodnú
 * zlatú, takže povrch, ktorý premenné nedostane, vyzerá presne ako predtým.
 *
 * ⚠️ Cast vnútri je nutný — TS nepozná vlastné `--*` kľúče v `CSSProperties`. Robí sa TU,
 * aby ho nemusel opakovať každý volajúci (a aby nikto nepotreboval `React` v scope).
 */
export function tierVars(level: number): CSSProperties {
  const t = tierOfLevel(level);
  return {
    '--tier-a': t.a,
    '--tier-b': t.b,
    '--tier-ink': t.ink,
    // halo pod pilulkou v odtieni pásma — zlatý glow pod modrou pilulkou vyzerá ako chyba
    '--tier-glow': hexToRgba(t.b, 0.42),
  } as CSSProperties;
}

/** #RRGGBB → rgba(). Krátka pomôcka pre glow, aby sa druhá farebná sada nemusela písať ručne. */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
