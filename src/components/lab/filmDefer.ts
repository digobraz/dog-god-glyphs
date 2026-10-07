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

// ── DVA STUPNE (7. 10. 2026, Matej vonku na mobile: *„web sa mi načítava pomaly, niekde
// nevidím obrázky“*). Meranie na pomalom 4G: po zdvihu opony sa naraz pustilo ~1,3 MB z celého
// filmu a krava s Hektorom (HNEĎ ďalšia obrazovka pod mottom) prišli až po ~16 s, lebo stáli
// v rade s telefónmi appiek a kontaktom zo samého konca. Teraz: najprv NEXT (to, čo príde pri
// prvom ťahu), až keď dobehne, zvyšok filmu.
/** Obrázky obrazovky hneď pod guľou — idú prvé (ReligionLab, HektorSpot). */
export const FILM_NEXT_URLS = ['/images/codex3-cow-nohalo.webp', '/images/codex3-hektor-v1.webp'];
let nextOn = false;
const nextSubs = new Set<() => void>();

export function releaseNext() {
  if (nextOn || typeof document === 'undefined') return;
  nextOn = true;
  document.documentElement.classList.add('film-next');
  nextSubs.forEach((f) => f());
  nextSubs.clear();
}

/** true, keď smie ísť obrázok obrazovky hneď pod guľou (alebo už celý film). */
export function useFilmNext() {
  const [v, setV] = useState(nextOn || eager);
  useEffect(() => {
    if (nextOn || eager) { setV(true); return; }
    const f = () => setV(true);
    nextSubs.add(f); subs.add(f);
    return () => { nextSubs.delete(f); subs.delete(f); };
  }, []);
  return v;
}

/** Spúšťač vo filme: guľa hotová alebo prvý dotyk → NEXT hneď (s vysokou prioritou), a keď
 *  dobehne (strop 4 s), zvyšok filmu. Strop 12 s pre prípad, že udalosť nepríde (/wall bez gule). */
export function armFilmRelease(): () => void {
  if (eager) return () => {};
  let started = false;
  let t = 0;
  const start = () => {
    if (started) return;
    started = true;
    releaseNext();
    const loads = FILM_NEXT_URLS.map((u) => new Promise<void>((r) => {
      const im = new Image();
      (im as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'high';
      im.onload = im.onerror = () => r();
      im.src = u;
    }));
    t = window.setTimeout(releaseFilm, 4000);
    void Promise.all(loads).then(() => { window.clearTimeout(t); t = window.setTimeout(releaseFilm, 300); });
  };
  window.addEventListener('dogypt:planet-ready', start, { once: true });
  window.addEventListener('touchstart', start, { once: true, passive: true });
  window.addEventListener('wheel', start, { once: true, passive: true });
  window.addEventListener('keydown', start, { once: true });
  const cap = window.setTimeout(() => { start(); }, 12000);
  return () => {
    window.clearTimeout(t); window.clearTimeout(cap);
    window.removeEventListener('dogypt:planet-ready', start);
    window.removeEventListener('touchstart', start);
    window.removeEventListener('wheel', start);
    window.removeEventListener('keydown', start);
  };
}
