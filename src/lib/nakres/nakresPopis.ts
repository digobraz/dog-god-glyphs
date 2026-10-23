// KTO JE TENTO PRVOK — súbor, riadok a komponent z vnútra Reactu (nákres, 23. 10. 2026).
//
// V dev builde nesie každý DOM uzol svoj fiber (`__reactFiber$…`) a ten `_debugSource`
// = presné miesto JSX v zdrojáku. `_debugOwner` je komponent, ktorý ho vykreslil, a jeho
// `_debugSource` = kde bol ten komponent POUŽITÝ. Netreba žiadny tagger ani atribúty v kóde.
// ⚠️ Prvok z iframu je z iného okna — `instanceof HTMLElement` tam neplatí, preto `nodeType`.

type DebugSource = { fileName: string; lineNumber: number };
type Fiber = {
  _debugSource?: DebugSource | null;
  _debugOwner?: Fiber | null;
  type?: unknown;
  return?: Fiber | null;
};

export type Popis = {
  tag: string;
  text: string;
  zdroj: string | null;
  komponenty: string[];
  cesta: string;
  rect: { x: number; y: number; w: number; h: number };
};

const KOREN = '/vystupy/web/';
const rel = (f: string) => {
  const i = f.indexOf(KOREN);
  return i >= 0 ? f.slice(i + KOREN.length) : f;
};
const fmt = (s?: DebugSource | null) => (s ? `${rel(s.fileName)}:${s.lineNumber}` : null);

function fiberOf(el: Element): Fiber | null {
  const k = Object.keys(el).find((x) => x.startsWith('__reactFiber$'));
  return k ? ((el as unknown as Record<string, Fiber>)[k] ?? null) : null;
}

function meno(f: Fiber): string {
  const t = f.type as { displayName?: string; name?: string; render?: { displayName?: string; name?: string } } | string | undefined;
  if (!t) return '?';
  if (typeof t === 'string') return t;
  return t.displayName || t.name || t.render?.displayName || t.render?.name || '?';
}

/** Krátky text prvku na rozpoznanie okom (nie celý obsah karty). */
export function kratkyText(el: Element, max = 60) {
  // innerText, nie textContent — ten by priniesol aj obsah vnorených <style> (pk-goldblock…).
  const t = ((el as HTMLElement).innerText ?? el.textContent ?? '').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

function cesta(el: Element) {
  const casti: string[] = [];
  let e: Element | null = el;
  while (e && e.tagName !== 'BODY' && casti.length < 12) {
    const p: Element | null = e.parentElement;
    const i = p ? Array.prototype.indexOf.call(p.children, e) + 1 : 1;
    casti.unshift(`${e.tagName.toLowerCase()}:nth-child(${i})`);
    e = p;
  }
  return casti.join(' > ');
}

export function popis(el: Element): Popis {
  let f = fiberOf(el);
  // Uzol bez vlastného zdroja (vytvorila ho knižnica) — hľadá sa najbližší predok, ktorý ho má.
  let k = 0;
  while (f && !f._debugSource && f.return && k++ < 20) f = f.return;
  const komponenty: string[] = [];
  let o = f?._debugOwner ?? null;
  while (o && komponenty.length < 3) {
    const kde = fmt(o._debugSource);
    komponenty.push(kde ? `${meno(o)} (použitý v ${kde})` : meno(o));
    o = o._debugOwner ?? null;
  }
  const r = el.getBoundingClientRect();
  return {
    tag: el.tagName.toLowerCase(),
    text: kratkyText(el),
    zdroj: fmt(f?._debugSource),
    komponenty,
    cesta: cesta(el),
    rect: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
  };
}

/** Meno komponentu na štítok nad výberom. */
export function menoKomponentu(el: Element) {
  const f = fiberOf(el);
  return f?._debugOwner ? meno(f._debugOwner) : el.tagName.toLowerCase();
}
