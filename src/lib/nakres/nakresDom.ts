// NÁKRES — práca s DOM-om appky v iframe (23. 10. 2026, 3. kolo).
//
// Matej: „ak naťahujem niečo, hýbe sa len okraj, obsah zostáva" — klik vyberal NAJHLBŠÍ uzol
// (štítok NOVÉ v rohu fotky), nie blok. A „keď drag and drop urobím medzi, tak sa vsunie a urobí
// medzera" — posun cez `translate` miesto nerobí. Tu sú tri odpovede:
//   blokPre()        — klik vyberie BLOK (kartu), dvojklik ide o úroveň dovnútra (ako Figma)
//   miestoVlozenia() — kam by sa prvok vsunul, keď ho pustím (čiara medzi blokmi)
//   vyrobPrvok()     — nový prvok LEN z katalógu brandu (PACK_BLOCKS), nič vymyslené
// ⚠️ Prvky sú z iného okna (iframe): `instanceof` neplatí a štýly sa čítajú cez JEHO okno.
import { LAPIS } from '@/components/pack/navGoldSkin';
import { PACK_BOX, PACK_HEAD, PACK_THEME, PILL_CSS, BRAND_GOLD_BTN } from '@/components/pack/packTheme';

export type Novy = 'pilulka' | 'text' | 'rozbalovac' | 'sekcia' | 'blok' | 'karta' | 'cta-lapis' | 'cta-zlate' | 'tvar';
export type Typ = Novy | 'kopia';

export const NOVE: [Novy, string][] = [
  ['pilulka', 'PILULKA'], ['text', 'TEXT'], ['rozbalovac', 'ROZBAĽOVAČ'],
  ['sekcia', 'SEKCIA'], ['blok', 'BLOK'], ['karta', 'KARTA'],
  ['cta-lapis', 'CTA LAPIS'], ['cta-zlate', 'CTA ZLATÉ'], ['tvar', 'TVAR'],
];
export const TYP_MENO = { ...Object.fromEntries(NOVE), kopia: 'KÓPIA' } as Record<Typ, string>;

export const cs = (el: Element) => el.ownerDocument.defaultView!.getComputedStyle(el);
export const viditelny = (el: Element) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
export const vToku = (el: Element) => { const p = cs(el).position; return p !== 'fixed' && p !== 'absolute'; };
/** Leží prvok vo vrstve pripnutej k oknu (position: fixed na ňom alebo na predkovi)? */
export const vPevnej = (el: Element) => {
  for (let e: Element | null = el; e && e.tagName !== 'BODY'; e = e.parentElement) if (cs(e).position === 'fixed') return true;
  return false;
};
const obsahuje = (el: Element, x: number, y: number) => {
  const r = el.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
};
const rovnakyRect = (a: Element, b: Element) => {
  const p = a.getBoundingClientRect(), q = b.getBoundingClientRect();
  return Math.abs(p.left - q.left) < 2 && Math.abs(p.top - q.top) < 2 && Math.abs(p.width - q.width) < 2 && Math.abs(p.height - q.height) < 2;
};

/** Nový prvok / kópia z nákresu nesie typ v data-atribúte — nemá zdroj v kóde. */
export const novyTyp = (el: Element | null) => ((el as HTMLElement | null)?.dataset?.nakresNovy as Typ | undefined);

/** Matrice brandu píšu čísla bez jednotky (React) — DOM ich bez `px` ticho zahodí. */
const BEZ_JEDNOTKY = new Set(['fontWeight', 'opacity', 'zIndex', 'flex', 'lineHeight']);
export function stylDom(el: HTMLElement, s: Record<string, unknown>) {
  for (const [k, v] of Object.entries(s)) {
    (el.style as unknown as Record<string, string>)[k] = typeof v === 'number' && !BEZ_JEDNOTKY.has(k) ? `${v}px` : String(v);
  }
}

/** Je rodič riadok (deti vedľa seba), alebo stĺpec? Rozhoduje, či sa vsúva vľavo/vpravo či hore/dole. */
export function jeRiadok(P: Element) {
  const s = cs(P);
  if (s.display.includes('flex')) return s.flexDirection.startsWith('row');
  if (s.display.includes('grid')) return s.gridTemplateColumns.trim().split(/\s+/).filter((x) => x && x !== 'none').length > 1;
  const deti = Array.from(P.children).filter(viditelny);
  return deti.length > 0 && deti.every((c) => cs(c).display.startsWith('inline'));
}

/** Má veľkosť bloku: užší než okno a menší než 60 % jeho plochy (inak je to stránka/stĺpec). */
export function jeVelkostBloku(e: Element) {
  const w = e.ownerDocument.defaultView!;
  const vw = w.innerWidth, vh = w.innerHeight;
  const r = e.getBoundingClientRect();
  return r.width > 0 && r.width < vw * 0.96 && r.width * r.height < vw * vh * 0.6;
}

/** BLOK pod bodom = najvonkajší predok, ktorý ešte nie je celá stránka. */
export function blokPre(t: Element) {
  let best = t;
  for (let e: Element | null = t; e && e.tagName !== 'BODY' && e.tagName !== 'HTML'; e = e.parentElement) {
    if (jeVelkostBloku(e)) best = e;
  }
  return best;
}

/** Dieťa S, v ktorom leží t — obaly s tým istým obdĺžnikom preskočí (dvojklik nemá „nič neurobiť"). */
export function dietaKu(S: Element, t: Element): Element | null {
  if (t === S || !S.contains(t)) return null;
  let c: Element = t;
  while (c.parentElement && c.parentElement !== S) c = c.parentElement;
  if (c.parentElement !== S) return null;
  if (rovnakyRect(c, S)) return dietaKu(c, t) ?? c;
  return c;
}

export const maText = (el: Element) =>
  Array.prototype.some.call(el.childNodes, (n: Node) => n.nodeType === 3 && (n.textContent ?? '').trim() !== '');

export type Miesto = {
  rodic: Element;
  pred: Element | null;
  kotva: Element;
  kam: 'pred' | 'za';
  ciara?: { x: number; y: number; w: number; h: number };
};

const ZAKAZANY_RODIC = (P: Element) => P.tagName === 'HTML' || P.tagName === 'BODY' || P.id === 'root';

/**
 * Kam sa prvok vsunie, keď ho pustím na (x, y) v súradniciach iframu.
 * 1. Bod v MEDZERE kontajnera (medzi kartami, v okraji) → medzi jeho deti, k najbližšiemu.
 * 2. Bod NAD prvkom → pred/za ten najhlbší prvok, ktorý je aspoň o polovicu taký veľký ako ťahaný
 *    (karta sa nevsunie medzi dve pilulky). Keď ťahám medzi súrodencami, prednosť má ten istý rodič.
 * 3. Ťahám celý BLOK (`blok`) → vsúva sa pred/za BLOK pod bodom, nikdy nie do jeho vnútra.
 *    Bez toho karta pustená do stredu inej karty skončila medzi jej vrstvami (test 23. 10.).
 */
export function miestoVlozenia(
  doc: Document, x: number, y: number, ignor: Element[], refW: number, refH: number, preferRodic: Element | null, blok = false,
): Miesto | null {
  // Pevne pripnuté vrstvy (cookie lišta, spodný nav) sa preskočia — pod nimi je stránka, kam sa púšťa.
  const pod = doc.elementsFromPoint(x, y).find((e) => !vPevnej(e)) ?? null;
  if (!pod) return null;
  const mimoIgnor = (c: Element) => !ignor.some((i) => i === c || i.contains(c));
  const deti = (P: Element) => Array.from(P.children).filter((c) => mimoIgnor(c) && viditelny(c) && vToku(c));
  const vRamci = (P: Element, A: Element, kam: 'pred' | 'za'): Miesto => {
    const r = A.getBoundingClientRect();
    let ref: Element | null = kam === 'pred' ? A : A.nextElementSibling;
    while (ref && ignor.includes(ref)) ref = ref.nextElementSibling;
    const ciara = jeRiadok(P)
      ? { x: (kam === 'pred' ? r.left : r.right) - 2, y: r.top, w: 4, h: r.height }
      : { x: r.left, y: (kam === 'pred' ? r.top : r.bottom) - 2, w: r.width, h: 4 };
    return { rodic: P, pred: ref, kotva: A, kam, ciara };
  };

  if (blok) {
    const B = blokPre(pod);
    if (jeVelkostBloku(B) && B.parentElement && !ZAKAZANY_RODIC(B.parentElement) && mimoIgnor(B) && !ignor.some((i) => B.contains(i))) {
      const r = B.getBoundingClientRect();
      const row = jeRiadok(B.parentElement);
      return vRamci(B.parentElement, B, (row ? x < r.left + r.width / 2 : y < r.top + r.height / 2) ? 'pred' : 'za');
    }
  }

  if (!ZAKAZANY_RODIC(pod) && mimoIgnor(pod)) {
    const d = deti(pod);
    if (d.length && !d.some((c) => obsahuje(c, x, y))) {
      const row = jeRiadok(pod);
      const za = d.find((c) => { const r = c.getBoundingClientRect(); return row ? x < r.left + r.width / 2 : y < r.top + r.height / 2; });
      return za ? vRamci(pod, za, 'pred') : vRamci(pod, d[d.length - 1], 'za');
    }
  }

  const retaz: Element[] = [];
  for (let e: Element | null = pod; e && e.tagName !== 'BODY'; e = e.parentElement) retaz.push(e);
  const kandidat = (A: Element) => {
    const P = A.parentElement;
    if (!P || ZAKAZANY_RODIC(P) || !mimoIgnor(A) || !vToku(A) || !viditelny(A)) return false;
    const r = A.getBoundingClientRect();
    return !(r.width < refW * 0.5 && r.height < refH * 0.5);
  };
  const A = (preferRodic && retaz.find((a) => a.parentElement === preferRodic && kandidat(a))) || retaz.find(kandidat);
  if (!A) return null;
  const r = A.getBoundingClientRect();
  const row = jeRiadok(A.parentElement!);
  return vRamci(A.parentElement!, A, (row ? x < r.left + r.width / 2 : y < r.top + r.height / 2) ? 'pred' : 'za');
}

/** Najbližší predok, ktorý roluje — na posun stránky, keď ťahám pri okraji. */
export function najdiScroller(el: Element | null): Element | null {
  for (let e = el; e && e.tagName !== 'HTML'; e = e.parentElement) {
    const s = cs(e);
    if (/(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 1) return e;
  }
  return el?.ownerDocument.scrollingElement ?? null;
}

export function klonuj(el: Element): HTMLElement {
  const c = el.cloneNode(true) as HTMLElement;
  c.dataset.nakresNovy = 'kopia';
  c.removeAttribute('contenteditable');
  c.style.translate = '';
  c.style.opacity = '';
  c.style.pointerEvents = '';
  return c;
}

/** Voľne položený blok nemá rodiča, od ktorého by vzal šírku — dostane šírku obsahu stránky. */
export function sirkaVolne(el: HTMLElement, typ: Novy, sirkaOkna: number) {
  if (['blok', 'karta', 'sekcia', 'rozbalovac'].includes(typ)) el.style.width = `${Math.min(sirkaOkna - 32, 560)}px`;
}

const FONT_UI = "'Space Grotesk', system-ui, sans-serif";

export function vyrobPrvok(doc: Document, typ: Novy): HTMLElement {
  if (!doc.getElementById('nakres-pill-css')) {
    const st = doc.createElement('style');
    st.id = 'nakres-pill-css';
    st.textContent = PILL_CSS;
    doc.head.appendChild(st);
  }
  const el = doc.createElement(typ.startsWith('cta') ? 'button' : 'div');
  el.dataset.nakresNovy = typ;
  const pridajText = (text: string, s: Record<string, unknown>) => {
    const d = doc.createElement(typ === 'rozbalovac' ? 'span' : 'div');
    d.textContent = text;
    stylDom(d, s);
    el.appendChild(d);
    return d;
  };
  const cta = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 24px', borderRadius: 8,
    fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, letterSpacing: '.14em', textTransform: 'uppercase',
  };
  const telo = { fontFamily: FONT_UI, fontSize: 14, color: PACK_THEME.inkStrong };
  if (typ === 'pilulka') { el.className = 'pk-pill'; el.textContent = 'Pilulka'; stylDom(el, { fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 12 }); }
  if (typ === 'text') { el.textContent = 'Text'; stylDom(el, telo); }
  if (typ === 'blok') stylDom(el, { ...PACK_BOX.subblock, display: 'block', minHeight: 80, padding: 16 });
  if (typ === 'karta') stylDom(el, { ...PACK_BOX.card, display: 'block', minHeight: 120, padding: 24 });
  if (typ === 'sekcia') {
    // Vnútorný blok ako v UPRAVIŤ PROFIL (O MNE, ZÁKLAD…): PODBLOK + tichý nadpis sekcie + obsah.
    stylDom(el, { ...PACK_BOX.subblock, display: 'block', padding: 16 });
    pridajText('SEKCIA', { ...PACK_HEAD.section, color: PACK_THEME.inkWarm, marginBottom: 8 });
    pridajText('Obsah sekcie', telo);
  }
  if (typ === 'rozbalovac') {
    stylDom(el, { ...PACK_BOX.subblock, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px' });
    pridajText('Rozbaľovač', { ...telo, fontWeight: 500 });
    // Šípka kreslená rámom, nie znakom — holý znak by bol ikonka mimo brandu.
    pridajText('', { width: 8, height: 8, borderRight: `2px solid ${BRAND_GOLD_BTN.edge}`, borderBottom: `2px solid ${BRAND_GOLD_BTN.edge}`, transform: 'rotate(45deg)', marginTop: -4, flex: 'none' });
  }
  if (typ === 'tvar') stylDom(el, { display: 'block', width: 160, height: 80, border: '2px dashed #C99A3F', borderRadius: 12, background: 'rgba(201,154,63,0.08)' });
  if (typ === 'cta-lapis') { el.textContent = 'Tlačidlo'; stylDom(el, { ...cta, background: LAPIS.grad, color: LAPIS.ink, border: `1px solid ${LAPIS.edge}` }); }
  if (typ === 'cta-zlate') { el.textContent = 'Tlačidlo'; stylDom(el, { ...cta, background: BRAND_GOLD_BTN.grad, color: BRAND_GOLD_BTN.ink, border: `1px solid ${BRAND_GOLD_BTN.edge}`, boxShadow: BRAND_GOLD_BTN.glow }); }
  return el;
}
