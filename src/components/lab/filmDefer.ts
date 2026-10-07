/**
 * 🔴 OBRÁZKY FILMU MIMO PRVEJ OBRAZOVKY ČAKAJÚ NA GUĽU (7. 10. 2026, Matej: *„zrýchli ten mobil"*).
 *
 * Meranie (Lighthouse mobil, / ): LCP 15,6 s, z toho 96 % „render delay". Nadpis gule
 * sa ukáže až s guľou (opona z index.html, `dogypt:planet-ready`), a kým guľa dobehla,
 * prehliadač stiahol 3,2 MB — z toho 1,3 MB boli obrázky z konca filmu (telefóny appiek,
 * kontakt, brána, faraón…), ktoré na úvode nikto nevidí a guli brali linku.
 *
 * Preto: `<img {...filmDefer()} />` = `loading="lazy"` do okamihu, keď je guľa hotová.
 * Potom `releaseFilm()` prepne všetky na `eager` — film ich dotiahne v pozadí naraz,
 * aby pri rolovaní nič nedobiehalo (lazy samo by ich ťahalo až tesne pred oknom).
 * CSS pozadia sa gatujú triedou `html.film-eager`.
 */
import { useEffect, useState } from 'react';

let eager = false;
const subs = new Set<() => void>();

/** Props pre `<img>` mimo prvej obrazovky filmu. Po uvoľnení prázdne. */
export function filmDefer(): { loading?: 'lazy'; 'data-film-defer'?: '' } {
  return eager ? {} : { loading: 'lazy', 'data-film-defer': '' };
}

export function releaseFilm() {
  if (eager || typeof document === 'undefined') return;
  eager = true;
  document.documentElement.classList.add('film-eager');
  document.querySelectorAll<HTMLImageElement>('img[data-film-defer]').forEach((im) => { im.loading = 'eager'; });
  subs.forEach((f) => f());
  subs.clear();
}

/** Zavolá `f` po uvoľnení (hneď, ak už prebehlo). Pre obrázky, ktoré si film ťahá sám (`new Image()`). */
export function onFilmRelease(f: () => void) {
  if (eager) f(); else subs.add(f);
}

/** Pre prvky, ktoré nie sú `<img>` (plagát videa) — true po uvoľnení. */
export function useFilmEager() {
  const [v, setV] = useState(eager);
  useEffect(() => {
    if (eager) { setV(true); return; }
    const f = () => setV(true);
    subs.add(f);
    return () => { subs.delete(f); };
  }, []);
  return v;
}

/** Spúšťač vo filme: guľa hotová (+ chvíľa na zdvih opony) → uvoľni. Prvý ťah prstom
 *  uvoľní hneď; strop pre prípad, že udalosť nepríde (napr. /wall bez gule). */
export function armFilmRelease(): () => void {
  if (eager) return () => {};
  let t = 0;
  const later = () => { window.clearTimeout(t); t = window.setTimeout(releaseFilm, 1200); };
  const now = () => releaseFilm();
  window.addEventListener('dogypt:planet-ready', later, { once: true });
  window.addEventListener('touchstart', now, { once: true, passive: true });
  window.addEventListener('wheel', now, { once: true, passive: true });
  window.addEventListener('keydown', now, { once: true });
  const cap = window.setTimeout(releaseFilm, 8000);
  return () => {
    window.clearTimeout(t); window.clearTimeout(cap);
    window.removeEventListener('dogypt:planet-ready', later);
    window.removeEventListener('touchstart', now);
    window.removeEventListener('wheel', now);
    window.removeEventListener('keydown', now);
  };
}
