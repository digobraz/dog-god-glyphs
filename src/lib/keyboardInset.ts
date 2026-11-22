// ── KOĽKO OBRAZOVKY ZAKRÝVA KLÁVESNICA (22. 11. 2026) ─────────────────────────────────────────────
// Matej 22. 11.: *„nevidím čo píšem, musím scrollovať… chcem po kliknutí vidieť plynulé vysunutie a písanie
// bez problémov“* (snímka: heroflow, meno psa, pole pod lištou „Autom. vyplniť kontakt“).
//
// Dovtedy sa rátalo `innerHeight − visualViewport.height`. To platí, len kým klávesnica nemení `innerHeight`;
// novší iOS Safari zmenší pri klávesnici OBE čísla, rozdiel vyjde 0 a obrazovka sa vôbec neskráti.
// Teraz sa meria priamo to, s čím rátajú obrazovky: výška `100dvh` (sonda — pevný prvok mimo obrazu)
// mínus spodok viditeľnej časti okna. Android, kde sa `dvh` zmenší sám, vyjde 0 a nič sa nezdvojí.
let probe: HTMLDivElement | null = null;

function layoutHeight(): number {
  if (!probe) {
    probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:fixed;top:0;left:-9999px;width:1px;height:100dvh;visibility:hidden;pointer-events:none;';
    document.body.appendChild(probe);
  }
  return probe.getBoundingClientRect().height || window.innerHeight;
}

/** Px obrazovky (100dvh), ktoré zakrýva klávesnica. Pod 80 px = 0 (lišta Safari, nie klávesnica). */
export function keyboardInset(): number {
  const vv = window.visualViewport;
  if (!vv) return 0;
  const kb = layoutHeight() - (vv.height + vv.offsetTop);
  return kb > 80 ? Math.round(kb) : 0;
}

/** Na `<html>` trieda `kb-open`, kým je klávesnica hore — obrazovky sa ňou môžu zhustiť (menší medailón ap.). */
export function markKeyboard(open: boolean) {
  document.documentElement.classList.toggle('kb-open', open);
}
