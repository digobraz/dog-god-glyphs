// ─────────────────────────────────────────────────────────────────────────────
// FAREBNÉ PÁSMA LEVELU — jeden zdroj farby pre celú appku.
//
// Level je číslo bez stropu (`levelOf` v `@/lib/tripPoints`). Pásmo je FARBA, ktorú to
// číslo práve nosí, a mení sa každé TRI levely — deväťkrát za celú cestu:
//
//     Level  1– 3  Piesok      Level 10–12  Karneol     Level 19–21  Tyrkys
//     Level  4– 6  Meď         Level 13–15  Olivín      Level 22–24  Lapis
//     Level  7– 9  Zlato       Level 16–18  Cyprus      Level 25+    Ametyst
//
// Sadu si vybral Matej 23. 8. 2026 v palete nákresu (`plany/reveal-nakres.html`) a poslal
// hotový zoznam aj s hexmi — hodnoty nižšie sú jeho výber, nie návrh.
//
// PORADIE = TEPLOTA farby (teplé → studené), s jednou zámernou odbočkou: KARNEOL sedí medzi
// zlatom a olivínom ako akcent. Červený odtieň bol raz zamietnutý (*„vyzerá ako niečo zlé"*)
// a Matej ho vrátil sám — *„ok dajme tam predsa tu červenú"*. Neponúkaj ho preč znova.
// ⚠️ Červená je na MAPE obsadená hrozbou; toto je iný povrch (level človeka) a kolízia
//    významov je prijaté riziko, nie prehliadnutie.
//
// PREČO SAMOSTATNÝ MODUL: farbu berie hlavička mapy, karta na `/pack`, panel škály, reveal
// po zápise výletu aj pilulka pri cudzích menách. Keby si ju každý povrch písal sám, rozišli
// by sa — presne tak, ako sa už raz rozišla mapa s vysvedčením pri LEVELI
// (`profileLevelFor` v packCommunity.ts existuje z toho istého dôvodu).
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react';

/** Koľko levelov pokrýva jedno pásmo. Matej 23. 8.: „treba to hustejšie kludne po 3 leveloch". */
export const TIER_SPAN = 3;

export interface PackTier {
  /** stabilný i18n kľúč — `pack.tier.<key>` */
  key: string;
  /** EN fallback / kánon názvu materiálu */
  name: string;
  /** svetlý koniec gradientu */
  a: string;
  /** tmavý koniec gradientu */
  b: string;
  /** farba písma NA tejto pilulke — nie je odvoditeľná, tmavé pásma potrebujú svetlý inkoust */
  ink: string;
  /** prvý level pásma (1, 4, 7, …) */
  from: number;
  /** posledný level pásma; posledné pásmo je otvorené (`null`) */
  to: number | null;
}

export const PACK_TIERS: PackTier[] = [
  { key: 'sand',     name: 'Sand',      a: '#EFE0B8', b: '#C9AC6E', ink: '#241a06', from: 1,  to: 3 },
  { key: 'copper',   name: 'Copper',    a: '#EE9A4A', b: '#A94E15', ink: '#241a06', from: 4,  to: 6 },
  { key: 'gold',     name: 'Gold',      a: '#F5C73D', b: '#E69E1A', ink: '#241a06', from: 7,  to: 9 },
  { key: 'carnelian',name: 'Carnelian', a: '#E4654A', b: '#8E2118', ink: '#F5F0E4', from: 10, to: 12 },
  { key: 'olivine',  name: 'Olivine',   a: '#C8D75F', b: '#6C8A16', ink: '#241a06', from: 13, to: 15 },
  { key: 'cypress',  name: 'Cypress',   a: '#2E8F63', b: '#06301D', ink: '#F5F0E4', from: 16, to: 18 },
  { key: 'turquoise',name: 'Turquoise', a: '#74DCC6', b: '#178C80', ink: '#0d2426', from: 19, to: 21 },
  { key: 'lapis',    name: 'Lapis',     a: '#6C8FE8', b: '#1F3490', ink: '#F5F0E4', from: 22, to: 24 },
  { key: 'amethyst', name: 'Amethyst',  a: '#BC8BEA', b: '#6431A8', ink: '#F5F0E4', from: 25, to: null },
];

/**
 * Pásmo pre daný level. Level pod 1 aj level nad poslednou hranicou vracia krajné pásmo —
 * funkcia nikdy nevracia `undefined`, aby volajúci nemusel riešiť prázdno vo `style`.
 */
export function tierOfLevel(level: number): PackTier {
  const lv = Math.max(1, Math.floor(level || 1));
  const i = Math.min(PACK_TIERS.length - 1, Math.floor((lv - 1) / TIER_SPAN));
  return PACK_TIERS[i];
}

/** Index pásma (0–8) — na porovnanie „prešiel som do ďalšieho pásma?". */
export function tierIndexOfLevel(level: number): number {
  const lv = Math.max(1, Math.floor(level || 1));
  return Math.min(PACK_TIERS.length - 1, Math.floor((lv - 1) / TIER_SPAN));
}

/**
 * Prechod medzi dvoma levelmi zmenil pásmo? Level up je bežná udalosť, zmena pásma je
 * udalosť, ktorú človek uvidí deväťkrát za celú cestu — a scéna sa podľa toho správa inak.
 */
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
