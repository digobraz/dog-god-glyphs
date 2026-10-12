// ════════════════════════════════════════════════════════════════════════════
// DĹŽKA DLHŠIEHO RIADKA HERO NADPISU PODĽA JAZYKA (wall.hero.l1 / l2)
// ────────────────────────────────────────────────────────────────────────────
// Veľkosť nadpisu sa POČÍTA rovnicou z dĺžky dlhšieho riadka v em (guľa:
// DogPlanetLab --ph-em, stena: GodsGridLab --hero-fs). Rovnica bola nastavená
// na EN „YOUR DOG IS" = 7,37 em — preklady s dlhším riadkom (DE, TR, FR…) na
// mobile pretekali z okna. Matej 12. 10. 2026: *„nemčina je veľká a preteká =
// zmenši"*, jazyky, ktoré sú ok, sa nemenia.
// Preto: jazyk s dlhším riadkom než EN dostane zmenšenie v pomere dĺžok,
// jazyky kratšie alebo rovné EN ostávajú presne tam, kde boli.
// Zmerané 12. 10. 2026 (Cinzel 700 + Cinzel Decorative 900 na *slovách*,
// public/fonts/g/fonts-v1.css, Chromium). Jazyky, ktoré tu nie sú, sú kratšie
// než EN.
// ⚠️ Pri zmene prekladu wall.hero.l1/l2 premeraj a prepíš číslo — tabuľka sa
// sama nepohne a dlhší preklad by znova pretiekol.
export const HERO_EM_EN = 7.37;

const HERO_LINE_EM: Record<string, number> = {
  tur: 10.63,
  deu: 8.68,
  fra: 8.63,
  pol: 8.40,
  prt: 8.37,
  nld: 8.21,
  esp: 8.15,
  ita: 7.94,
};

/** ≥ 1 — koľkokrát je dlhší riadok jazyka dlhší než EN (EN a kratšie = 1). */
export function heroLineFactor(lang: string): number {
  return Math.max(1, (HERO_LINE_EM[lang] ?? HERO_EM_EN) / HERO_EM_EN);
}

// ── POPISOK V PORTÁLI (wall.hero.addPhoto) — ten istý problém, iné číslo ──
// Popisok je nowrap a jadro portálu má overflow: hidden, takže dlhší preklad
// sa ORÉŽE v pol slova (DE „FOTO DEINES / …TTES HINZUFÜG", 12. 10. 2026).
// Na guli má popisok strop 0,86 / 0,10 = 8,6 em a EN ho vypĺňa (8,66 em
// s .1em rozostupom). Dlhšie jazyky sa zmenšia v pomere dĺžok.
// Zmerané 12. 10. 2026, Cinzel 700, letter-spacing .1em, dlhší z dvoch riadkov.
export const ADD_LABEL_EM_EN = 8.66;

const ADD_LABEL_EM: Record<string, number> = {
  deu: 13.50,
  ita: 11.99,
  tur: 11.96,
  fra: 11.29,
  prt: 11.17,
  nld: 10.02,
  esp: 9.85,
  pol: 9.67,
};

/** ≥ 1 — koľkokrát je dlhší riadok popisku dlhší než EN. --ph-lblk sa ním delí. */
export function addLabelFactor(lang: string): number {
  return Math.max(1, (ADD_LABEL_EM[lang] ?? ADD_LABEL_EM_EN) / ADD_LABEL_EM_EN);
}
