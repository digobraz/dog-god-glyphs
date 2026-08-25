/**
 * Iniciála (meno majiteľa aj meno psa) pre heroglyf a jeho textový kód.
 *
 * Písmenkový set `assets/letters/` má LEN A–Z. Do 25. 8. 2026 sa iniciála brala holým
 * `charAt(0).toUpperCase()`, takže „ŠIMON" dalo „Š", `letterMap["Š"]` bolo `undefined`
 * a slot v rámiku majiteľa ostal PRÁZDNY (prerušovaný obdĺžnik) — na WALL, na dog page,
 * v PDF aj na share karte naraz, lebo všetky renderujú ten istý komponent. Takto viseli
 * MIA #7 (ŠIMON) a ARON #70 (ĽUDMILA). To isté padalo v `heroglyphCode.ts`, kde sa
 * neznáme písmeno prepisuje na „X" — a keďže tá funkcia beží aj nad menom PSA, mal
 * ČAKY #66 kód `X-XY-…` namiesto `C-XY-…`.
 *
 * `normalize('NFD')` rozloží Š→S+mäkčeň, Ľ→L+mäkčeň, Á→A+dĺžeň; kombinačné znaky
 * (U+0300–U+036F) potom zahodíme. Písmená, ktoré NFD NEROZLOŽÍ — prečiarknuté a zliate
 * tvary (Ł, Ø, Æ, Đ, ß) — normalizácia minie, preto ručná mapa nižšie.
 *
 * ⚠️ Nelatinka (cyrilika, gréčtina, arabčina, CJK) sa transliterovať NEPOKÚŠA — set je
 * latinkový a hádať А→A naprieč abecedami je vlastné rozhodnutie, nie oprava. Namiesto
 * toho hľadáme prvé latinské písmeno KDEKOĽVEK v mene: „奥莉 (Aoli)" tak dá „A" z prepisu,
 * ktorý majiteľ sám uviedol. Keď v mene latinka nie je vôbec, vraciame `undefined`
 * (volajúci si dosadí svoj fallback) — to je pôvodné správanie, len bez falošných zásahov.
 */

const FOLD: Record<string, string> = {
  'Ł': 'L', 'Ø': 'O', 'Æ': 'A', 'Œ': 'O', 'Đ': 'D', 'Ð': 'D',
  'Þ': 'T', 'ß': 'S', 'Ħ': 'H', 'Ŋ': 'N', 'Ŧ': 'T', 'Ə': 'E',
};

/** Zhodí diakritiku z jedného znaku a vráti A–Z, alebo `null` ak to latinka nie je. */
function fold(rawChar: string): string | null {
  const up = rawChar.toUpperCase();
  const stripped = up.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // `toUpperCase()` vie znak ROZŠÍRIŤ na dva (ß→SS, ﬁ→FI) — bez `charAt(0)` by
  // jednoznakový test zlyhal a iterácia by omylom vzala až DRUHÉ písmeno mena.
  const ch = FOLD[stripped] ?? FOLD[up] ?? stripped.charAt(0);
  return /^[A-Z]$/.test(ch) ? ch : null;
}

export function initialLetter(name: string | null | undefined): string | undefined {
  const raw = (name ?? '').trim();
  if (!raw) return undefined;
  // Iterujeme po code pointoch (nie po `charAt`) — emoji a CJK sú surrogate páry
  // a `charAt(0)` by z nich vrátil polovicu znaku.
  for (const chunk of [...raw]) {
    const ch = fold(chunk);
    if (ch) return ch;
  }
  return undefined;
}
