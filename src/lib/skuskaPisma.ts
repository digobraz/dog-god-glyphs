// SKÚŠKA PÍSMA A VEĽKOSTÍ — len testovací kanál appky (Matej 5. 11. 2026), volá sa z `main.tsx`.
// Písmo: LT Museum Black namiesto Cinzelu aj Cinzel Decorative; rodiny ostávajú, stačí prekryť ich váhy.
// Veľkosť: Matej: „celkovo by som nadpisy zväčšil aj na CTA aj výlety a podobne (okrem mien vo feede alebo
// nepodstatných vecí, v ainubisovi je celkom dobrá veľkosť, ale pri /map zoznam je to dosť malé)".
// `size-adjust` na rodine Cinzel zväčší každý nadpis a CTA naraz bez zásahu do 375 miest v kóde.
// Decorative ho nemá, takže čo má ostať malé, stačí prehodiť naň (`BEZ_ZVACSENIA`).
const SUBOR = '/fonts/g/ltmuseum-black-test-v1.woff2';
const VAHY = [400, 500, 600, 700, 800, 900];
const ZVACSENIE = '116%'; // 12 → 14 · 14 → 16 · 16 → 18,5 · 20 → 23

const face = (rodina: string, navyse = '') => VAHY
  .map((w) => `@font-face{font-family:'${rodina}';font-weight:${w};font-style:normal;font-display:swap;${navyse}src:url(${SUBOR}) format('woff2')}`)
  .join('');

/** Cinzel, ktorý ostáva vo svojej veľkosti: mená vo feede, AINUBIS a čísla na mapových značkách. */
const BEZ_ZVACSENIA = [
  '.pfp-who b', '.pfm-who b', '.pft-who b', '.pfs-dog b', '.msg-row-name',
  '.wp-name', '.akc-railname', '.akc-seth h5', '.akc-srchd b', '.akv-sttl', '.akv-title', '.akv-zvn',
  '.akw-doc h2', '.akw-htop h1', '.zv-h', '.fai-q q', '.fai-b h3',
  '.leaflet-marker-icon [style*="Cinzel"]',
].join(',');

/** Space Grotesk tam, kde bol nadpis alebo údaj priveľmi malý. Stupnica: 10 → 12, 12 → 14. */
const VACSI_TEXT = `
.trp-bigcard-loc,.trp-mheader-cats button,.comm-mpill,.pkf-th,.pfs-row h2,.dv2-title,.dv2-eb,.wp-label{font-size:12px !important;}
.trp-bigcard-author,.tr-row,.tr-together,.vp-body,.vp-src,.vp-note{font-size:14px !important;}
.tr-sheet{max-height:100dvh;overflow-y:auto;}
${BEZ_ZVACSENIA}{font-family:'Cinzel Decorative',serif !important;}
`;

export function zapniSkuskuPisma() {
  const s = document.createElement('style');
  s.textContent = face('Cinzel', `size-adjust:${ZVACSENIE};`) + face('Cinzel Decorative') + VACSI_TEXT;
  document.head.appendChild(s);
}
