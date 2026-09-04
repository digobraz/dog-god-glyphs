/* ── VÝŠKA OBRAZOVKY SA POČAS SCROLLU NESMIE HÝBAŤ (4. 9. 2026) ──────────
   Matej: *„text na druhom slajde kmitá hore dole, vyzerá to pokazene."*

   🔑 PRÍČINA NIE JE V TEXTE. Mobilný prehliadač pri scrolle skrýva adresný
   riadok, takže `window.innerHeight` — a s ním jednotka `dvh` — počas pohybu
   RASTIE (na telefóne o ~60 px). Réžia filmu z tej výšky počíta dráhu
   (`p = scrollY / (vh * PIN_VH)`), takže každý taký rast posunie NARAZ všetky
   hodnoty prechodu. Na obrazovke to nevyzerá ako zmena výšky okna, ale ako
   keby text poskakoval hore-dole.

   RIEŠENIE MÁ DVE POLOVICE A MUSIA DRŽAŤ TO ISTÉ ČÍSLO:
     · rozloženie — celý film je prepísaný z `dvh` na **`lvh`** (najväčšia
       možná výška, teda so schovaným riadkom). Tá je z definície nemenná.
     · réžia — `filmVh()` vracia PRESNE tú istú hodnotu, lebo si ju odmeria
       sondou s `height: 100lvh`, nie z `window.innerHeight`.
   Keby každá polovica počítala z iného čísla, prilepenie sekcie a dráha
   prechodu by sa rozišli a text by kmital ďalej, len inak.

   ⚠️ Vo filme (`OnePage.tsx` a všetko, čo je v ňom namontované) sa
   `window.innerHeight` volať NESMIE — jediné povolené miesto je sonda nižšie,
   ako záchrana pre prehliadač bez `lvh`. Šírky (`window.innerWidth`) sa to netýka, tá sa
   pri skrytí lišty nemení.
   ⚠️ Meria sa RAZ a znovu až pri zmene ŠÍRKY (otočenie telefónu). Sonda visí
   mimo toku (`position: fixed`, nulová šírka, `visibility: hidden`), takže
   nič nekreslí ani nezaberá miesto. */
let filmVhProbe: HTMLDivElement | null = null;
let filmVhCache = 0;
let filmVhWidth = -1;
export const filmVh = (): number => {
  if (filmVhCache > 0 && filmVhWidth === window.innerWidth) return filmVhCache;
  if (!filmVhProbe) {
    filmVhProbe = document.createElement('div');
    filmVhProbe.setAttribute('aria-hidden', 'true');
    filmVhProbe.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none;';
    document.body.appendChild(filmVhProbe);
  }
  // Prehliadač bez `lvh` dá sonde nulu — vtedy je `window.innerHeight` to
  // najlepšie, čo máme, a film beží ako predtým (žiadna prázdna obrazovka).
  const h = filmVhProbe.getBoundingClientRect().height;
  filmVhCache = h > 1 ? h : window.innerHeight;
  filmVhWidth = window.innerWidth;
  return filmVhCache;
};
