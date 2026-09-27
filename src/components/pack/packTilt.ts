// ── ŽIVÝ BLOK — jemný náklon za kurzorom a pod prstom (Matej 27. 9. 2026) ──────────────
//
// Matej nad DOG ID: „jednotlivé bloky daj trošku pohyblivé, reagujúce na pohyb pre efekt"
// + „oživ na dotyk aj bloky PREJDENÉ CESTY". Blok sa nakloní k miestu, kde je kurzor
// (PC) alebo prst (mobil), a o 2 px sa zdvihne; pri odchode sa vráti.
//
// ⚠️ Nesie IBA `transform` — tieň ostáva bloku (lock D-BLOK: box-shadow je jedna
//    vlastnosť a prepísal by celý odliatok). Rovnaké pravidlo platí aj tu.
// ⚠️ Náklon je v STUPŇOCH, nie v px — vysoký blok (IDENTITA ~600 px) by sa pri rovnakom
//    uhle hýbal na krajoch viac než nízky, preto je strop malý (3°).
// ⚠️ Na mobile pohyb prsta = scroll. Prehliadač vtedy pošle `pointercancel` a blok sa
//    vráti — náklon je len krátka odozva na dotyk, nie ťahanie.
import type { PointerEvent } from 'react';

export const TILT_CSS = `
.pk-tilt{transform:perspective(900px) rotateX(var(--tilt-x,0deg)) rotateY(var(--tilt-y,0deg)) translateY(var(--tilt-l,0px));
  transition:transform .45s cubic-bezier(.2,.8,.2,1);}
.pk-tilt.is-tilting{transition:transform .12s ease-out;}
@media (prefers-reduced-motion:reduce){.pk-tilt{transform:none !important;}}
`;

const MAX_DEG = 3;

function tiltTo(el: HTMLElement, clientX: number, clientY: number) {
  const r = el.getBoundingClientRect();
  const x = (clientX - r.left) / r.width - 0.5;
  const y = (clientY - r.top) / r.height - 0.5;
  el.style.setProperty('--tilt-y', `${(x * 2 * MAX_DEG).toFixed(2)}deg`);
  el.style.setProperty('--tilt-x', `${(-y * 2 * MAX_DEG).toFixed(2)}deg`);
  el.style.setProperty('--tilt-l', '-2px');
  el.classList.add('is-tilting');
}

function reset(el: HTMLElement) {
  el.style.removeProperty('--tilt-x');
  el.style.removeProperty('--tilt-y');
  el.style.removeProperty('--tilt-l');
  el.classList.remove('is-tilting');
}

/** Rozbaľ na blok spolu s triedou `pk-tilt`: `<div className="pk-tilt" {...TILT_PROPS}>`. */
export const TILT_PROPS = {
  onPointerMove: (e: PointerEvent<HTMLElement>) => { if (e.pointerType === 'mouse' || e.buttons) tiltTo(e.currentTarget, e.clientX, e.clientY); },
  onPointerDown: (e: PointerEvent<HTMLElement>) => tiltTo(e.currentTarget, e.clientX, e.clientY),
  onPointerLeave: (e: PointerEvent<HTMLElement>) => reset(e.currentTarget),
  onPointerUp: (e: PointerEvent<HTMLElement>) => { if (e.pointerType !== 'mouse') reset(e.currentTarget); },
  onPointerCancel: (e: PointerEvent<HTMLElement>) => reset(e.currentTarget),
};
