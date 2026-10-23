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

export type Novy = 'pilulka' | 'text' | 'rozbalovac' | 'sekcia' | 'blok' | 'karta' | 'cta-lapis' | 'cta-zlate' | 'tvar' | 'medzera';
export type Typ = Novy | 'kopia';

export const NOVE: [Novy, string][] = [
  ['pilulka', 'PILULKA'], ['text', 'TEXT'], ['rozbalovac', 'ROZBAĽOVAČ'],
  ['sekcia', 'SEKCIA'], ['blok', 'BLOK'], ['karta', 'KARTA'],
  ['cta-lapis', 'CTA LAPIS'], ['cta-zlate', 'CTA ZLATÉ'], ['tvar', 'TVAR'],
  // Matej 23. 10.: „nedá sa mi s tým pohybovať… je to prilepené na horný prvok… dajme do prvkov aj medzeru".
  ['medzera', 'MEDZERA'],
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

/** pred/za = v toku · dnu = do prázdneho kontajnera · obal-* = pri bočnom kraji: spolu s kotvou do riadku/stĺpca. */
export type Kam = 'pred' | 'za' | 'dnu' | 'obal-pred' | 'obal-za';
type Obdl = { x: number; y: number; w: number; h: number };
export type Miesto = {
  rodic: Element;
  pred: Element | null;
  kotva: Element;
  kam: Kam;
  ciara?: Obdl;
  vypln?: Obdl;
};

const ZAKAZANY_RODIC = (P: Element) => P.tagName === 'HTML' || P.tagName === 'BODY' || P.id === 'root';
const SVG_NS = 'http://www.w3.org/2000/svg';
const ATOM = new Set(['INPUT', 'SELECT', 'TEXTAREA', 'IMG', 'VIDEO', 'CANVAS', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LABEL', 'PICTURE', 'IFRAME']);
const KONTAJNER_NOVY = new Set(['blok', 'karta', 'sekcia', 'tvar']);

/** Celok, do ktorého sa nevkladá (tlačidlo, text, obrázok, pilulka) — vkladá sa pred/za/vedľa neho. */
export function jeAtom(e: Element) {
  if (e.namespaceURI === SVG_NS) return true;
  const n = novyTyp(e);
  if (n && n !== 'kopia') return !KONTAJNER_NOVY.has(n);
  const t = e.tagName.toUpperCase();
  // Malé tlačidlo/odkaz je celok; veľká karta zabalená do <a> je kontajner.
  if (t === 'A' || t === 'BUTTON') return e.getBoundingClientRect().height < 80;
  if (ATOM.has(t)) return true;
  return e.children.length === 0 && maText(e);
}

/**
 * Kam sa prvok vsunie, keď ho pustím na (x, y) v súradniciach iframu. Matej: „nech viem urobiť
 * hocičo — slúži to len ako nákres" — žiadne obmedzenie veľkosti, len tri jednoduché zóny:
 *   • bočný kraj prvku (kolmo na smer rodiča) → VEDĽA neho (v stĺpci) / NAD-POD (v riadku);
 *     obaja sa zabalia do nového riadku/stĺpca — tak idú dve CTA vedľa seba do sekcie
 *   • stred kontajnera (blok, sekcia, karta) → DNU, medzi jeho deti alebo do prázdneho
 *   • inak → PRED / ZA prvok podľa polovice
 * Vrstva mimo toku (obrázok cez celú kartu) sa berie ako jej najbližší predok v toku, celý.
 */
export function miestoVlozenia(doc: Document, x: number, y: number, ignor: Element[]): Miesto | null {
  const mimoIgnor = (c: Element) => !ignor.some((i) => i === c || i.contains(c));
  // Pevne pripnuté vrstvy (cookie lišta, spodný nav) sa preskočia — pod nimi je stránka, kam sa púšťa.
  const pod = doc.elementsFromPoint(x, y).find((e) => e.tagName !== 'HTML' && !vPevnej(e) && mimoIgnor(e)) ?? null;
  if (!pod || pod.tagName === 'BODY') return null;
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

  let T: Element = pod;
  let atom = false;
  for (let e: Element | null = pod; e && e.tagName !== 'BODY'; e = e.parentElement) if (jeAtom(e)) { T = e; atom = true; }
  while (T.parentElement && T.tagName !== 'BODY' && (!vToku(T) || !viditelny(T))) { T = T.parentElement; atom = true; }
  if (T.tagName === 'BODY' || T.tagName === 'HTML') return null;

  const r = T.getBoundingClientRect();
  const P = T.parentElement;
  const maRodica = !!P && !ZAKAZANY_RODIC(P);
  const rowP = maRodica ? jeRiadok(P!) : false;

  if (maRodica) {
    const zp = rowP ? Math.min(r.height / 4, 24) : Math.min(r.width / 4, 40);
    const pos = rowP ? y - r.top : x - r.left;
    const dlzka = rowP ? r.height : r.width;
    if (pos < zp) return { rodic: P!, pred: T, kotva: T, kam: 'obal-pred', ciara: rowP ? { x: r.left, y: r.top - 2, w: r.width, h: 4 } : { x: r.left - 2, y: r.top, w: 4, h: r.height } };
    if (pos > dlzka - zp) return { rodic: P!, pred: T.nextElementSibling, kotva: T, kam: 'obal-za', ciara: rowP ? { x: r.left, y: r.bottom - 2, w: r.width, h: 4 } : { x: r.right - 2, y: r.top, w: 4, h: r.height } };
  }

  if (!atom) {
    const okrajZona = rowP ? Math.min(r.width / 4, 16) : Math.min(r.height / 4, 16);
    const pos = rowP ? x - r.left : y - r.top;
    const dlzka = rowP ? r.width : r.height;
    if (!maRodica || (pos >= okrajZona && pos <= dlzka - okrajZona)) {
      const d = deti(T);
      if (!d.length) return { rodic: T, pred: null, kotva: T, kam: 'dnu', vypln: { x: r.left, y: r.top, w: r.width, h: r.height } };
      const rowT = jeRiadok(T);
      const za = d.find((c) => { const q = c.getBoundingClientRect(); return rowT ? x < q.left + q.width / 2 : y < q.top + q.height / 2; });
      return za ? vRamci(T, za, 'pred') : vRamci(T, d[d.length - 1], 'za');
    }
  }

  if (!maRodica) return null;
  return vRamci(P!, T, (rowP ? x < r.left + r.width / 2 : y < r.top + r.height / 2) ? 'pred' : 'za');
}

/** Zabalí T do nového riadku (vedľa seba) alebo stĺpca; obal sedí na jeho mieste. */
export function zabal(T: Element, riadok: boolean): HTMLElement {
  const d = T.ownerDocument;
  const P = T.parentElement!;
  const obal = d.createElement('div');
  obal.dataset.nakresObal = '1';
  const maly = T.getBoundingClientRect().width < P.getBoundingClientRect().width * 0.5;
  Object.assign(obal.style, riadok
    ? (maly ? { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } : { display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(0,1fr)', gap: '8px' })
    : { display: 'flex', flexDirection: 'column', alignItems: maly ? 'flex-start' : 'stretch', gap: '8px' });
  P.insertBefore(obal, T);
  obal.appendChild(T);
  return obal;
}

/** Späť: deti obalu na jeho miesto, obal preč. */
export function rozbal(obal: Element) {
  const P = obal.parentElement;
  if (!P) return;
  while (obal.firstChild) P.insertBefore(obal.firstChild, obal);
  obal.remove();
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
  if (typ === 'medzera') {
    // Prázdne miesto medzi prvkami — šrafa je len pre oko v nákrese, výšku mení úchyt.
    // `flex: 0 0 24px` = 24 px po smere rodiča (v stĺpci výška, v riadku šírka).
    stylDom(el, {
      display: 'block', height: 24, minWidth: 24, flex: '0 0 24px', alignSelf: 'stretch',
      background: 'repeating-linear-gradient(45deg, rgba(22,48,122,0.12) 0 6px, transparent 6px 12px)',
      outline: '1px dashed rgba(22,48,122,0.45)', outlineOffset: -1,
    });
  }
  if (typ === 'tvar') stylDom(el, { display: 'block', width: 160, height: 80, border: '2px dashed #C99A3F', borderRadius: 12, background: 'rgba(201,154,63,0.08)' });
  if (typ === 'cta-lapis') { el.textContent = 'Tlačidlo'; stylDom(el, { ...cta, background: LAPIS.grad, color: LAPIS.ink, border: `1px solid ${LAPIS.edge}` }); }
  if (typ === 'cta-zlate') { el.textContent = 'Tlačidlo'; stylDom(el, { ...cta, background: BRAND_GOLD_BTN.grad, color: BRAND_GOLD_BTN.ink, border: `1px solid ${BRAND_GOLD_BTN.edge}`, boxShadow: BRAND_GOLD_BTN.glow }); }
  return el;
}
