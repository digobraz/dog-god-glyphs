// EDITOR NÁKRESU — Matej ukazuje zmenu na živej appke namiesto Canvy (23. 10. 2026).
//
// Matej: „často ti vysvetlujem moju predstavu o nákrese appky a kreslím to v Canve… je to
// nepraktické". Otvorí `?nakres=1` na dev serveri, appka beží v rámci mobilu (základ) alebo
// PC, a v režime UPRAVOVAŤ ťahá, prehadzuje, mení veľkosť, prepisuje text a pripína poznámky.
//
// 🔴 DO KÓDU SA NEZAPÍŠE NIČ. Zmeny sú len inline štýly na živom DOM-e a po obnovení zmiznú.
//    ULOŽIŤ NÁKRES pošle ZÁZNAM do `plany/nakresy/<id>/` (vite-plugin-nakres.ts) — každá zmena
//    nesie súbor:riadok komponentu (nakresPopis.ts), takže „sprav podľa nákresu" nehádá prvok.
// ⚠️ Posun sa prichytáva na 4 px (dno stupnice PACK_SPACE). Px na jednej šírke nie je zámer —
//    pri prepise do kódu sa prekladá na odsadenie, poradie alebo zarovnanie.
// ⚠️ PORADIE presúva DOM uzly pod Reactom. Na nákres to stačí; keď appka ten blok prekreslí,
//    môže spadnúť — ⌘R a záznam ostáva v zozname len do uloženia, preto ukladaj priebežne.
import { createRoot } from 'react-dom/client';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type PointerEvent as RPointerEvent } from 'react';
import { popis, kratkyText, menoKomponentu, type Popis } from './nakresPopis';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { PACK_BOX, PILL_CSS, BRAND_GOLD_BTN } from '@/components/pack/packTheme';

const ZARIADENIA = {
  mobil: { w: 390, h: 844, meno: 'MOBIL' },
  // Matejovo okno (CLAUDE.md, PAGE_AIR) — na ňom sa veci lámu ako prvé.
  pc: { w: 1477, h: 724, meno: 'PC' },
} as const;
type Zariadenie = keyof typeof ZARIADENIA;
type Rezim = 'pozriet' | 'upravit';
type Druh = 'presun' | 'velkost' | 'text' | 'skryt' | 'poradie' | 'poznamka' | 'pridat';
// Nový prvok len z katalógu brandu (PACK_BLOCKS) — vymyslený tvar by nákres posunul mimo brand.
type Novy = 'pilulka' | 'blok' | 'karta' | 'cta-lapis' | 'cta-zlate' | 'tvar';
const NOVE: [Novy, string][] = [
  ['pilulka', 'PILULKA'], ['blok', 'BLOK'], ['karta', 'KARTA'], ['cta-lapis', 'CTA LAPIS'], ['cta-zlate', 'CTA ZLATÉ'], ['tvar', 'TVAR'],
];
const NOVY_MENO = Object.fromEntries(NOVE) as Record<Novy, string>;

type Zmena = {
  id: string; druh: Druh; trasa: string; zariadenie: Zariadenie; prvok: Popis | null;
  dx?: number; dy?: number; w?: number; h?: number;
  pred?: string; po?: string; poznamka?: string; o?: number; vedla?: string; typ?: Novy;
  /** PRIDAŤ: za vybraný prvok · položený na miesto · voľne v strede. */
  poloha?: 'za' | 'na' | 'volne'; x?: number; y?: number;
};

type NakresWin = Window & { __nakresSnap?: (pixelRatio: number) => Promise<string> };

const KROK = 4;
const snap = (v: number) => Math.round(v / KROK) * KROK;
const novyId = () => Math.random().toString(36).slice(2, 8);

const C = {
  papyrus: '#F4ECDC', papyrusTmavy: '#E9DCC3', ink: '#2B2116', inkSoft: '#6B5A45',
  gold: '#C99A3F', stage: '#24201B', border: 'rgba(43,33,22,0.18)',
};
const FONT = "'Space Grotesk', system-ui, sans-serif";

const DRUH_MENO: Record<Druh, string> = {
  presun: 'PRESUN', velkost: 'VEĽKOSŤ', text: 'TEXT', skryt: 'SKRYŤ', poradie: 'PORADIE', poznamka: 'POZNÁMKA', pridat: 'NOVÝ',
};

function popisZmeny(z: Zmena) {
  if (z.druh === 'presun') {
    const c: string[] = [];
    if (z.dy) c.push(`${z.dy > 0 ? 'dole' : 'hore'} ${Math.abs(z.dy)}`);
    if (z.dx) c.push(`${z.dx > 0 ? 'vpravo' : 'vľavo'} ${Math.abs(z.dx)}`);
    return c.length ? c.join(', ') + ' px' : 'bez posunu';
  }
  if (z.druh === 'velkost') return `${z.prvok?.rect.w}x${z.prvok?.rect.h} na ${z.w}x${z.h}`;
  if (z.druh === 'text') return `„${z.po}“`;
  if (z.druh === 'poradie') return `o ${Math.abs(z.o ?? 0)} ${(z.o ?? 0) < 0 ? 'skôr' : 'neskôr'}`;
  if (z.druh === 'poznamka') return `„${z.poznamka}“`;
  if (z.druh === 'pridat') return `${NOVY_MENO[z.typ!]}${z.po ? ` „${z.po}“` : ''}`;
  return 'preč';
}

const maText = (el: Element) =>
  Array.prototype.some.call(el.childNodes, (n: Node) => n.nodeType === 3 && (n.textContent ?? '').trim() !== '');

const jeElement = (n: unknown): n is HTMLElement => !!n && (n as Node).nodeType === 1;

/** Nový prvok z nákresu nesie typ v data-atribúte — nemá zdroj v kóde. */
const novyTyp = (el: Element | null) => ((el as HTMLElement | null)?.dataset?.nakresNovy as Novy | undefined);
const menoPrvku = (el: Element) => { const t = novyTyp(el); return t ? `nový ${NOVY_MENO[t].toLowerCase()}` : menoKomponentu(el); };

/** Voľne položený blok nemá rodiča, od ktorého by vzal šírku — dostane šírku obsahu stránky. */
function sirkaVolne(el: HTMLElement, typ: Novy, sirkaOkna: number) {
  if (typ === 'blok' || typ === 'karta') el.style.width = `${Math.min(sirkaOkna - 32, 560)}px`;
}

function vyrobPrvok(doc: Document, typ: Novy): HTMLElement {
  if (!doc.getElementById('nakres-pill-css')) {
    const st = doc.createElement('style');
    st.id = 'nakres-pill-css';
    st.textContent = PILL_CSS;
    doc.head.appendChild(st);
  }
  const el = doc.createElement(typ.startsWith('cta') ? 'button' : 'div');
  el.dataset.nakresNovy = typ;
  const cta: Partial<CSSStyleDeclaration> = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 24px', borderRadius: '8px',
    fontFamily: "'Cinzel', serif", fontWeight: '700', fontSize: '14px', letterSpacing: '.14em', textTransform: 'uppercase',
  };
  if (typ === 'pilulka') { el.className = 'pk-pill'; el.textContent = 'Pilulka'; Object.assign(el.style, { fontFamily: "'Cinzel', serif", fontWeight: '700', fontSize: '12px' }); }
  if (typ === 'blok') Object.assign(el.style, PACK_BOX.subblock, { display: 'block', minHeight: '80px', padding: '16px' });
  if (typ === 'karta') Object.assign(el.style, PACK_BOX.card, { display: 'block', minHeight: '120px', padding: '24px' });
  if (typ === 'tvar') Object.assign(el.style, { display: 'block', width: '160px', height: '80px', border: '2px dashed #C99A3F', borderRadius: '12px', background: 'rgba(201,154,63,0.08)' });
  if (typ === 'cta-lapis') { el.textContent = 'Tlačidlo'; Object.assign(el.style, cta, { background: LAPIS.grad, color: LAPIS.ink, border: `1px solid ${LAPIS.edge}` }); }
  if (typ === 'cta-zlate') { el.textContent = 'Tlačidlo'; Object.assign(el.style, cta, { background: BRAND_GOLD_BTN.grad, color: BRAND_GOLD_BTN.ink, border: `1px solid ${BRAND_GOLD_BTN.edge}`, boxShadow: BRAND_GOLD_BTN.glow }); }
  return el;
}

function NakresShell() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [zariadenie, setZariadenie] = useState<Zariadenie>('mobil');
  // Bez prepínača POZERAŤ/UPRAVOVAŤ (Matej 23. 10.: „ak kliknem na nákres = hneď upravovať,
  // pozerať je keď na to nekliknem“). Prezerá sa v appke, editor je vždy úprava.
  const rezim = 'upravit' as Rezim;
  const [trasa, setTrasa] = useState('');
  // Mierka = FIT (celý telefón v okne) × ZOOM. Mobil štartuje priblížený, oddialiť sa dá po FIT.
  const [fit, setFit] = useState(1);
  const [zoom, setZoom] = useState(1.5);
  const scale = fit * zoom;
  const [, setTick] = useState(0);
  const [poznamka, setPoznamka] = useState('');
  const [nazov, setNazov] = useState('');
  const [stav, setStav] = useState('');

  // Zdroj pravdy sú REFY — počúvadlá v iframe žijú mimo Reactu a potrebujú vždy čerstvé hodnoty.
  const zmenyRef = useRef<Zmena[]>([]);
  const navrat = useRef(new Map<string, () => void>());
  const prvky = useRef(new Map<string, Element>());
  const zaznam = useRef(new WeakMap<Element, Partial<Record<Druh, string>>>());
  const rezimRef = useRef(rezim);
  const zariadenieRef = useRef(zariadenie);
  const trasaRef = useRef(trasa);
  const hoverRef = useRef<Element | null>(null);
  const selRef = useRef<Element | null>(null);
  const editRef = useRef<{ el: HTMLElement; pred: string; html: string; popis: Popis } | null>(null);
  const dragRef = useRef<{ el: HTMLElement; sx: number; sy: number; bx: number; by: number; aktivny: boolean; id: string } | null>(null);
  const snimky = useRef<Record<string, { pred?: string; po?: string }>>({});
  const nakresId = useRef<string | null>(null);
  const neulozene = useRef(false);

  rezimRef.current = rezim;
  zariadenieRef.current = zariadenie;
  trasaRef.current = trasa;

  const prekresli = useCallback(() => setTick((t) => t + 1), []);
  const ZOOM_MAX = 3;
  const zoomBy = (f: number) => setZoom((z) => Math.min(ZOOM_MAX, Math.max(1, z * f)));
  const zoomRef = useRef(zoomBy);
  zoomRef.current = zoomBy;

  // ── záznam zmien ───────────────────────────────────────────────────────────
  const najdi = (el: Element, druh: Druh) => {
    const id = zaznam.current.get(el)?.[druh];
    return id ? zmenyRef.current.find((z) => z.id === id) : undefined;
  };

  /** Zmena daného druhu pre prvok — prvý dotyk ju založí (s popisom PRED zásahom), ďalšie ju len menia. */
  const zaloz = (el: Element | null, druh: Druh, revert: () => void, pred?: Popis, extra?: Partial<Zmena>) => {
    if (el && druh !== 'poznamka') {
      const z = najdi(el, druh);
      if (z) return z.id;
      // Posun, veľkosť a text NOVÉHO prvku patria do jeho záznamu PRIDAŤ — nemá zdroj v kóde.
      const novy = novyTyp(el) && druh !== 'pridat' ? najdi(el, 'pridat') : undefined;
      if (novy) {
        zaznam.current.set(el, { ...zaznam.current.get(el), [druh]: novy.id });
        return novy.id;
      }
    }
    const id = novyId();
    zmenyRef.current = [...zmenyRef.current, {
      id, druh, trasa: trasaRef.current, zariadenie: zariadenieRef.current, prvok: el ? (pred ?? popis(el)) : null, ...extra,
    }];
    navrat.current.set(id, revert);
    if (el) {
      prvky.current.set(id, el);
      zaznam.current.set(el, { ...zaznam.current.get(el), [druh]: id });
    }
    neulozene.current = true;
    prekresli();
    return id;
  };

  const uprav = (id: string, patch: Partial<Zmena>) => {
    zmenyRef.current = zmenyRef.current.map((z) => (z.id === id ? { ...z, ...patch } : z));
    neulozene.current = true;
    prekresli();
  };

  const vrat = (id: string) => {
    const z = zmenyRef.current.find((x) => x.id === id);
    if (!z) return;
    try { navrat.current.get(id)?.(); } catch { /* uzol už React zahodil — nie je čo vracať */ }
    const el = prvky.current.get(id);
    if (el) {
      const m = { ...zaznam.current.get(el) };
      delete m[z.druh];
      zaznam.current.set(el, m);
    }
    navrat.current.delete(id);
    prvky.current.delete(id);
    zmenyRef.current = zmenyRef.current.filter((x) => x.id !== id);
    prekresli();
  };

  // ── úkony nad prvkom ──────────────────────────────────────────────────────
  const posun = (el: HTMLElement, dx: number, dy: number) => {
    const z = najdi(el, 'presun');
    const povodny = el.style.translate;
    const id = z?.id ?? zaloz(el, 'presun', () => { el.style.translate = povodny; });
    const nx = (z?.dx ?? 0) + dx, ny = (z?.dy ?? 0) + dy;
    el.style.translate = `${nx}px ${ny}px`;
    uprav(id, { dx: nx, dy: ny });
  };

  const skry = (el: HTMLElement) => {
    const novy = novyTyp(el) ? najdi(el, 'pridat') : undefined;
    if (novy) { vrat(novy.id); selRef.current = null; return; }
    const povodny = el.style.display;
    zaloz(el, 'skryt', () => { el.style.display = povodny; });
    el.style.display = 'none';
    selRef.current = null;
  };

  const poradie = (el: HTMLElement, smer: -1 | 1) => {
    const p = el.parentElement;
    const sused = smer < 0 ? el.previousElementSibling : el.nextElementSibling;
    if (!p || !sused) { setStav(smer < 0 ? 'Prvok je už prvý.' : 'Prvok je už posledný.'); return; }
    const z = najdi(el, 'poradie');
    const index = Array.prototype.indexOf.call(p.children, el);
    const id = z?.id ?? zaloz(el, 'poradie', () => {
      const ostatne = Array.prototype.filter.call(p.children, (c: Element) => c !== el) as Element[];
      p.insertBefore(el, ostatne[index] ?? null);
    });
    if (smer < 0) p.insertBefore(el, sused); else p.insertBefore(sused, el);
    uprav(id, { o: (z?.o ?? 0) + smer, vedla: kratkyText(sused, 40) });
  };

  const zacniText = (el: HTMLElement) => {
    if (editRef.current) koniecText(true);
    editRef.current = { el, pred: el.innerText, html: el.innerHTML, popis: popis(el) };
    el.contentEditable = 'true';
    el.focus();
    el.ownerDocument.getSelection()?.selectAllChildren(el);
    el.addEventListener('blur', () => koniecText(true), { once: true });
  };

  const koniecText = (ulozit: boolean) => {
    const e = editRef.current;
    if (!e) return;
    editRef.current = null;
    e.el.removeAttribute('contenteditable');
    if (!ulozit) { e.el.innerHTML = e.html; return; }
    const po = e.el.innerText;
    if (po === e.pred && !najdi(e.el, 'text')) return;
    const id = zaloz(e.el, 'text', () => { e.el.innerHTML = e.html; }, e.popis, { pred: e.pred });
    uprav(id, { po });
  };

  const pridaj = (typ: Novy) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const el = vyrobPrvok(doc, typ);
    const sel = selRef.current;
    const kotva = sel && sel.isConnected && sel.parentElement && sel.tagName !== 'BODY' ? sel : null;
    if (kotva) kotva.after(el);
    else {
      Object.assign(el.style, { position: 'fixed', zIndex: '2147483000', left: '0px', top: '0px' });
      sirkaVolne(el, typ, doc.defaultView!.innerWidth);
      doc.body.appendChild(el);
      const r = el.getBoundingClientRect();
      const w = doc.defaultView!;
      el.style.left = `${snap((w.innerWidth - r.width) / 2)}px`;
      el.style.top = `${snap((w.innerHeight - r.height) / 2)}px`;
    }
    const r = el.getBoundingClientRect();
    zaloz(el, 'pridat', () => el.remove(), kotva ? popis(kotva) : popis(el), {
      typ, w: Math.round(r.width), h: Math.round(r.height), po: el.innerText || undefined,
      vedla: kotva ? kratkyText(kotva, 40) : undefined, poloha: kotva ? 'za' : 'volne',
    });
    selRef.current = el;
    prekresli();
  };

  /** Prvok dotiahnutý z ponuky — leží presne tam, kde ho Matej pustil; kotva = čo je pod ním. */
  const polozNa = (typ: Novy, x: number, y: number) => {
    const doc = iframeRef.current?.contentDocument;
    const win = doc?.defaultView;
    if (!doc || !win) return;
    const pod = doc.elementFromPoint(x, y);
    const kotva = pod && pod.tagName !== 'BODY' && pod.tagName !== 'HTML' ? pod : null;
    const el = vyrobPrvok(doc, typ);
    Object.assign(el.style, { position: 'absolute', zIndex: '2147483000', left: '0px', top: '0px' });
    sirkaVolne(el, typ, win.innerWidth);
    doc.body.appendChild(el);
    const r0 = el.getBoundingClientRect();
    el.style.left = `${snap(x - r0.width / 2 + win.scrollX)}px`;
    el.style.top = `${snap(y - r0.height / 2 + win.scrollY)}px`;
    const r = el.getBoundingClientRect();
    zaloz(el, 'pridat', () => el.remove(), kotva ? popis(kotva) : popis(el), {
      typ, w: Math.round(r.width), h: Math.round(r.height), po: el.innerText || undefined,
      vedla: kotva ? kratkyText(kotva, 40) : undefined, poloha: 'na', x: Math.round(r.left), y: Math.round(r.top),
    });
    selRef.current = el;
    prekresli();
  };

  /** Ťah z ponuky: duch ide za myšou v hornom dokumente (capture), pustenie nad telefónom = položenie.
   *  Krátky klik bez ťahu = pridať za vybraný prvok (bez výberu do stredu). */
  const zacniVklad = (e: RPointerEvent, typ: Novy) => {
    e.preventDefault();
    const dlazdica = e.currentTarget as HTMLElement;
    dlazdica.setPointerCapture(e.pointerId);
    const sx = e.clientX, sy = e.clientY;
    const m = scale;
    const dz = ZARIADENIA[zariadenieRef.current];
    let duch: HTMLElement | null = null;
    const bod = (cx: number, cy: number) => {
      const f = iframeRef.current;
      if (!f) return null;
      const r = f.getBoundingClientRect();
      const x = (cx - r.left) / m, y = (cy - r.top) / m;
      return x >= 0 && y >= 0 && x <= dz.w && y <= dz.h ? { x, y } : null;
    };
    const pohyb = (ev: PointerEvent) => {
      if (!duch) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
        duch = vyrobPrvok(document, typ);
        sirkaVolne(duch, typ, dz.w);
        Object.assign(duch.style, { position: 'fixed', zIndex: '2147483600', pointerEvents: 'none', opacity: '0.85', transform: `scale(${m}) translate(-50%, -50%)`, transformOrigin: '0 0' });
        document.body.appendChild(duch);
      }
      duch.style.left = `${ev.clientX}px`;
      duch.style.top = `${ev.clientY}px`;
      const b = bod(ev.clientX, ev.clientY);
      hoverRef.current = b ? iframeRef.current?.contentDocument?.elementFromPoint(b.x, b.y) ?? null : null;
      prekresli();
    };
    const koniec = (ev: PointerEvent) => {
      dlazdica.removeEventListener('pointermove', pohyb);
      dlazdica.removeEventListener('pointerup', koniec);
      hoverRef.current = null;
      if (!duch) { pridaj(typ); return; }
      duch.remove();
      const b = bod(ev.clientX, ev.clientY);
      if (b) polozNa(typ, b.x, b.y);
      else prekresli();
    };
    dlazdica.addEventListener('pointermove', pohyb);
    dlazdica.addEventListener('pointerup', koniec);
  };

  /** Náhľad prvku v ponuke = ten istý prvok, aký pribudne v appke. */
  const nahlad = (typ: Novy) => (n: HTMLDivElement | null) => {
    if (!n || n.firstChild) return;
    const el = vyrobPrvok(document, typ);
    if (typ === 'blok' || typ === 'karta') Object.assign(el.style, { width: '160px', minHeight: '56px', padding: '0' });
    if (typ === 'tvar') Object.assign(el.style, { width: '120px', height: '56px' });
    n.appendChild(el);
  };

  const pripniPoznamku = () => {
    const t = poznamka.trim();
    if (!t) return;
    zaloz(selRef.current, 'poznamka', () => {}, undefined, { poznamka: t });
    setPoznamka('');
  };

  // ── počúvadlá v iframe ────────────────────────────────────────────────────
  const klaves = useCallback((e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    const pise = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (editRef.current) {
      if (e.key === 'Escape') { e.preventDefault(); koniecText(false); }
      else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); editRef.current.el.blur(); }
      return;
    }
    if (pise) return;
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      const posledna = zmenyRef.current[zmenyRef.current.length - 1];
      if (posledna) { e.preventDefault(); vrat(posledna.id); }
      return;
    }
    if (rezimRef.current !== 'upravit') return;
    const sel = selRef.current as HTMLElement | null;
    if (e.key === 'Escape') { selRef.current = null; prekresli(); e.preventDefault(); return; }
    if (!sel) return;
    const k = e.shiftKey ? 16 : KROK;
    const sipky: Record<string, [number, number]> = { ArrowLeft: [-k, 0], ArrowRight: [k, 0], ArrowUp: [0, -k], ArrowDown: [0, k] };
    if (sipky[e.key]) { posun(sel, ...sipky[e.key]); e.preventDefault(); e.stopPropagation(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { skry(sel); prekresli(); e.preventDefault(); return; }
    if (e.key === 'p' || e.key === 'P') {
      if (sel.parentElement && sel.parentElement.tagName !== 'BODY') { selRef.current = sel.parentElement; prekresli(); }
      e.preventDefault();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pripoj = useCallback((win: Window) => {
    const doc = win.document;
    const vEdite = (t: EventTarget | null) => !!editRef.current && !!t && editRef.current.el.contains(t as Node);
    const ciel = (e: Event): HTMLElement | null => {
      let t = e.target as Node | null;
      if (t && t.nodeType === 3) t = t.parentNode;
      return jeElement(t) && t.tagName !== 'HTML' && t.tagName !== 'BODY' ? t : null;
    };
    const zastav = (e: Event) => {
      if (rezimRef.current !== 'upravit' || vEdite(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    };
    const pohyb = (e: PointerEvent) => {
      if (rezimRef.current !== 'upravit') { if (hoverRef.current) { hoverRef.current = null; prekresli(); } return; }
      const d = dragRef.current;
      if (d) {
        const dx0 = e.clientX - d.sx, dy0 = e.clientY - d.sy;
        if (!d.aktivny) {
          if (Math.hypot(dx0, dy0) < 4) return;
          d.aktivny = true;
          const povodny = d.el.style.translate;
          const el = d.el;
          d.id = d.id || zaloz(el, 'presun', () => { el.style.translate = povodny; });
        }
        const dx = snap(d.bx + dx0), dy = snap(d.by + dy0);
        d.el.style.translate = `${dx}px ${dy}px`;
        uprav(d.id, { dx, dy });
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (vEdite(e.target)) return;
      const t = ciel(e);
      if (t !== hoverRef.current) { hoverRef.current = t; prekresli(); }
    };
    const dole = (e: PointerEvent) => {
      if (rezimRef.current !== 'upravit' || vEdite(e.target)) return;
      zastav(e);
      if (editRef.current) koniecText(true);
      const t = ciel(e);
      if (!t) return;
      const sel = selRef.current as HTMLElement | null;
      const el = sel && sel.contains(t) ? sel : t;
      selRef.current = el;
      const z = najdi(el, 'presun');
      dragRef.current = { el, sx: e.clientX, sy: e.clientY, bx: z?.dx ?? 0, by: z?.dy ?? 0, aktivny: false, id: z?.id ?? '' };
      prekresli();
    };
    const hore = (e: PointerEvent) => {
      if (dragRef.current) { dragRef.current = null; zastav(e); }
    };
    const dvojklik = (e: MouseEvent) => {
      if (rezimRef.current !== 'upravit' || vEdite(e.target)) return;
      zastav(e);
      let t = ciel(e);
      // Dvojklik na obal textu (napr. tlačidlo s ikonkou) — hľadá sa prvé dieťa, ktoré text nesie.
      while (t && !maText(t)) {
        const dieta = Array.prototype.find.call(t.children, (c: Element) => (c.textContent ?? '').trim() !== '') as HTMLElement | undefined;
        t = dieta ?? null;
      }
      if (!t) { setStav('Tu nie je text na prepísanie.'); return; }
      selRef.current = t;
      zacniText(t);
      prekresli();
    };
    doc.addEventListener('pointermove', pohyb, true);
    doc.addEventListener('pointerdown', dole, true);
    doc.addEventListener('pointerup', hore, true);
    doc.addEventListener('dblclick', dvojklik, true);
    for (const ev of ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'contextmenu', 'submit', 'dragstart']) {
      doc.addEventListener(ev, zastav, true);
    }
    doc.addEventListener('keydown', klaves, true);
    win.addEventListener('scroll', prekresli, true);
    win.addEventListener('wheel', (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomRef.current(e.deltaY < 0 ? 1.1 : 1 / 1.1);
    }, { passive: false, capture: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [klaves, prekresli]);

  const snimaj = useCallback(async (kluc: 'pred' | 'po') => {
    const win = iframeRef.current?.contentWindow as NakresWin | null;
    if (!win?.__nakresSnap) return;
    const t = trasaRef.current;
    if (kluc === 'pred' && snimky.current[t]?.pred) return;
    try {
      const png = await win.__nakresSnap(zariadenieRef.current === 'mobil' ? 2 : 1);
      snimky.current[t] = { ...snimky.current[t], [kluc]: png };
    } catch { /* snímka je pomôcka, záznam ide aj bez nej */ }
  }, []);

  // Iframe: po každom načítaní pripoj počúvadlá; SPA navigáciu sleduj podľa adresy.
  useEffect(() => {
    const f = iframeRef.current;
    if (!f) return;
    const nacitane = () => { if (f.contentWindow) pripoj(f.contentWindow); };
    f.addEventListener('load', nacitane);
    const t = window.setInterval(() => {
      const p = f.contentWindow?.location.pathname;
      if (p && p !== trasaRef.current) {
        trasaRef.current = p;
        setTrasa(p);
        selRef.current = null;
        hoverRef.current = null;
        // Snímka PRED až keď sa nová obrazovka vykreslí — prvá zmena by ju inak predbehla.
        window.setTimeout(() => { if (rezimRef.current === 'upravit' && !zmenyRef.current.some((z) => z.trasa === p)) void snimaj('pred'); }, 1500);
      }
    }, 400);
    return () => { f.removeEventListener('load', nacitane); window.clearInterval(t); };
  }, [pripoj, snimaj]);

  useEffect(() => {
    window.addEventListener('keydown', klaves);
    const odist = (e: BeforeUnloadEvent) => { if (neulozene.current && zmenyRef.current.length) e.preventDefault(); };
    window.addEventListener('beforeunload', odist);
    return () => { window.removeEventListener('keydown', klaves); window.removeEventListener('beforeunload', odist); };
  }, [klaves]);

  useEffect(() => {
    if (rezim === 'upravit') void snimaj('pred');
    else { hoverRef.current = null; prekresli(); }
  }, [rezim, snimaj, prekresli]);

  // Rámy výberu sledujú prvok aj počas animácií a rolovania v appke.
  useEffect(() => {
    if (rezim !== 'upravit') return;
    let r = 0;
    const slucka = () => { prekresli(); r = requestAnimationFrame(slucka); };
    r = requestAnimationFrame(slucka);
    return () => cancelAnimationFrame(r);
  }, [rezim, prekresli]);

  // Mierka rámu podľa voľného miesta.
  useEffect(() => {
    const s = stageRef.current;
    if (!s) return;
    const d = ZARIADENIA[zariadenie];
    const prepocitaj = () => {
      const PAD = 48;
      setFit(Math.min(1, (s.clientWidth - PAD) / d.w, (s.clientHeight - PAD) / d.h));
    };
    setZoom(zariadenie === 'mobil' ? 1.5 : 1);
    const koliesko = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomRef.current(e.deltaY < 0 ? 1.1 : 1 / 1.1);
    };
    s.addEventListener('wheel', koliesko, { passive: false });
    prepocitaj();
    const ro = new ResizeObserver(prepocitaj);
    ro.observe(s);
    return () => { ro.disconnect(); s.removeEventListener('wheel', koliesko); };
  }, [zariadenie]);

  // Priblížený telefón ostane vodorovne v strede.
  useEffect(() => {
    const s = stageRef.current;
    if (s) s.scrollLeft = (s.scrollWidth - s.clientWidth) / 2;
  }, [scale]);

  // ── zmena veľkosti (úchyty v hornom dokumente) ─────────────────────────────
  const zacniVelkost = (e: RPointerEvent, os: 'w' | 'h' | 'wh') => {
    const el = selRef.current as HTMLElement | null;
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    // Bez capture by pohyb nad rámom odišiel do dokumentu iframu a úchyt by nič nedostal.
    const uchyt = e.currentTarget as HTMLElement;
    uchyt.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    const st = { w: el.style.width, h: el.style.height, d: el.style.display, b: el.style.boxSizing, mw: el.style.maxWidth };
    const sx = e.clientX, sy = e.clientY;
    let id = '';
    const pohyb = (ev: PointerEvent) => {
      if (!id) {
        id = zaloz(el, 'velkost', () => {
          el.style.width = st.w; el.style.height = st.h; el.style.display = st.d; el.style.boxSizing = st.b; el.style.maxWidth = st.mw;
        });
        if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
        el.style.boxSizing = 'border-box';
        el.style.maxWidth = 'none';
      }
      const w = snap(r.width + (os !== 'h' ? (ev.clientX - sx) / scale : 0));
      const h = snap(r.height + (os !== 'w' ? (ev.clientY - sy) / scale : 0));
      if (os !== 'h') el.style.width = `${w}px`;
      if (os !== 'w') el.style.height = `${h}px`;
      const nr = el.getBoundingClientRect();
      uprav(id, { w: Math.round(nr.width), h: Math.round(nr.height) });
    };
    const koniec = () => { uchyt.removeEventListener('pointermove', pohyb); uchyt.removeEventListener('pointerup', koniec); };
    uchyt.addEventListener('pointermove', pohyb);
    uchyt.addEventListener('pointerup', koniec);
  };

  // ── uloženie ──────────────────────────────────────────────────────────────
  const ulozit = async () => {
    if (!zmenyRef.current.length) { setStav('Zatiaľ žiadna zmena.'); return; }
    setStav('Ukladám…');
    const sel = selRef.current;
    selRef.current = null;
    prekresli();
    await snimaj('po');
    selRef.current = sel;
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    if (!nakresId.current) {
      const t = (zmenyRef.current[0]?.trasa || trasaRef.current).replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9]+/g, '-') || 'domov';
      nakresId.current = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}-${t}`;
    }
    try {
      const r = await fetch('/__nakres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: nakresId.current,
          nazov: nazov.trim() || undefined,
          vytvorene: d.toLocaleString('sk-SK'),
          zmeny: zmenyRef.current,
          snimky: snimky.current,
        }),
      });
      const j = await r.json() as { ok: boolean; kam?: string; error?: string };
      if (!j.ok) throw new Error(j.error);
      neulozene.current = false;
      setStav(`Uložené: ${j.kam}. Povedz Claudovi „sprav podľa nákresu“.`);
    } catch (e) {
      setStav(`Neuložilo sa: ${String(e)}`);
    }
  };

  const odznova = () => {
    if (zmenyRef.current.length && neulozene.current && !window.confirm('Zahodiť neuložené zmeny?')) return;
    zmenyRef.current = [];
    navrat.current.clear();
    prvky.current.clear();
    zaznam.current = new WeakMap();
    snimky.current = {};
    nakresId.current = null;
    selRef.current = null;
    neulozene.current = false;
    setStav('');
    iframeRef.current?.contentWindow?.location.reload();
  };

  // ── vykreslenie ───────────────────────────────────────────────────────────
  const d = ZARIADENIA[zariadenie];
  const rect = (el: Element | null) => (el && el.isConnected ? el.getBoundingClientRect() : null);
  const hr = rezim === 'upravit' && hoverRef.current !== selRef.current ? rect(hoverRef.current) : null;
  const sr = rezim === 'upravit' ? rect(selRef.current) : null;
  const inv = 1 / scale;
  const sel = selRef.current;
  const selPopis = sel && sel.isConnected ? popis(sel) : null;
  const zmeny = zmenyRef.current;

  const src = (() => {
    const u = new URL(window.location.href);
    u.searchParams.delete('nakres');
    return u.pathname + u.search + u.hash;
  })();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2147483000, display: 'flex', background: C.stage, fontFamily: FONT, color: C.ink }}>
      <aside style={{ width: 320, flex: 'none', background: C.papyrus, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 20, letterSpacing: '.14em' }}>NÁKRES</div>
            <Tlacidlo onClick={() => {
              const w = iframeRef.current?.contentWindow;
              window.location.href = w ? w.location.pathname + w.location.search + w.location.hash : '/';
            }}>ZAVRIEŤ</Tlacidlo>
          </div>
          <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 4 }}>{trasa || '…'} · do kódu sa nezapíše nič</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Prepinac moznosti={[['mobil', 'MOBIL'], ['pc', 'PC']]} hodnota={zariadenie} zmen={(v) => setZariadenie(v as Zariadenie)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Tlacidlo onClick={() => zoomBy(1 / 1.25)}>-</Tlacidlo>
              <span style={{ fontSize: 10, fontWeight: 600, minWidth: 40, textAlign: 'center' }}>{Math.round(scale * 100)} %</span>
              <Tlacidlo onClick={() => zoomBy(1.25)}>+</Tlacidlo>
              <Tlacidlo onClick={() => setZoom(1)}>CELÝ</Tlacidlo>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Stitok>PRVKY — DOTIAHNI NA TELEFÓN</Stitok>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {NOVE.map(([t, m]) => (
                <div
                  key={t}
                  onPointerDown={(e) => zacniVklad(e, t)}
                  title={sel ? 'Ťahaj na telefón · klik = hneď za vybraný prvok' : 'Ťahaj na telefón · klik = do stredu'}
                  style={{ height: 88, borderRadius: 12, border: `1px solid ${C.border}`, background: '#FFFBF3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'grab', userSelect: 'none', touchAction: 'none', overflow: 'hidden' }}
                >
                  <div ref={nahlad(t)} style={{ pointerEvents: 'none', transform: 'scale(0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48 }} />
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', color: C.inkSoft }}>{m}</span>
                </div>
              ))}
            </div>
          </section>
          {!selPopis ? (
            <Napoveda riadky={['Prvok z ponuky dotiahni na telefón', 'Klik = vyber prvok', 'Ťahaj = posuň (po 4 px)', 'Šípky = jemne, so Shiftom po 16', 'Dvojklik = prepíš text', 'P = vyber rodiča · Del = skry', 'Rohy výberu = veľkosť', 'Cmd+Z = vráť poslednú zmenu']} />
          ) : (
            <section style={{ background: C.papyrusTmavy, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{menoPrvku(sel!)} <span style={{ color: C.inkSoft, fontWeight: 400 }}>&lt;{selPopis.tag}&gt; {selPopis.rect.w}x{selPopis.rect.h}</span></div>
              {selPopis.text && <div style={{ fontSize: 12, color: C.inkSoft }}>„{selPopis.text}“</div>}
              <div style={{ fontSize: 10, color: C.inkSoft, wordBreak: 'break-all' }}>{novyTyp(sel) ? 'nový prvok z nákresu' : (selPopis.zdroj ?? 'zdroj neznámy')}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Tlacidlo onClick={() => { if (sel?.parentElement && sel.parentElement.tagName !== 'BODY') { selRef.current = sel.parentElement; prekresli(); } }}>RODIČ</Tlacidlo>
                <Tlacidlo onClick={() => poradie(sel as HTMLElement, -1)}>SKÔR</Tlacidlo>
                <Tlacidlo onClick={() => poradie(sel as HTMLElement, 1)}>NESKÔR</Tlacidlo>
                <Tlacidlo onClick={() => zacniText(sel as HTMLElement)}>TEXT</Tlacidlo>
                <Tlacidlo onClick={() => { skry(sel as HTMLElement); prekresli(); }}>SKRYŤ</Tlacidlo>
                <Tlacidlo onClick={() => { selRef.current = null; prekresli(); }}>ZRUŠIŤ VÝBER</Tlacidlo>
              </div>
            </section>
          )}


          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Stitok>{sel ? 'POZNÁMKA K PRVKU' : 'POZNÁMKA K OBRAZOVKE'}</Stitok>
            <textarea
              value={poznamka}
              onChange={(e) => setPoznamka(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) pripniPoznamku(); }}
              placeholder="napr. toto zlaté a menšie"
              rows={2}
              style={{ fontFamily: FONT, fontSize: 14, padding: 8, borderRadius: 8, border: `1px solid ${C.border}`, background: '#FFFBF3', color: C.ink, resize: 'vertical' }}
            />
            <Tlacidlo onClick={pripniPoznamku}>PRIPNÚŤ POZNÁMKU</Tlacidlo>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Stitok>ZMENY ({zmeny.length})</Stitok>
            {!zmeny.length && <div style={{ fontSize: 12, color: C.inkSoft }}>Zatiaľ nič.</div>}
            {zmeny.map((z, i) => (
              <div
                key={z.id}
                onMouseEnter={() => { const el = prvky.current.get(z.id); if (el?.isConnected) { hoverRef.current = el; prekresli(); } }}
                style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}
              >
                <span style={{ fontWeight: 700, minWidth: 16 }}>{i + 1}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b>{DRUH_MENO[z.druh]}</b> {popisZmeny(z)}
                  <span style={{ display: 'block', color: C.inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {z.trasa} · {z.prvok ? (z.prvok.text || `<${z.prvok.tag}>`) : 'celá obrazovka'}
                  </span>
                </span>
                <button onClick={() => vrat(z.id)} style={{ ...MALE_TL, padding: '2px 8px' }}>VRÁTIŤ</button>
              </div>
            ))}
          </section>
        </div>

        <div style={{ padding: 16, borderTop: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            value={nazov}
            onChange={(e) => setNazov(e.target.value)}
            placeholder="Názov nákresu (nepovinné)"
            style={{ fontFamily: FONT, fontSize: 14, padding: 8, borderRadius: 8, border: `1px solid ${C.border}`, background: '#FFFBF3', color: C.ink }}
          />
          <button
            onClick={ulozit}
            style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, letterSpacing: '.14em', padding: '12px 16px', borderRadius: 8, border: `1px solid ${LAPIS.edge}`, background: LAPIS.grad, color: LAPIS.ink, cursor: 'pointer' }}
          >
            ULOŽIŤ NÁKRES
          </button>
          <button onClick={odznova} style={{ ...MALE_TL, alignSelf: 'center' }}>ZAČAŤ ODZNOVA</button>
          {stav && <div style={{ fontSize: 12, color: C.inkSoft, wordBreak: 'break-word' }}>{stav}</div>}
        </div>
      </aside>

      {/* Rolovateľná scéna; telefón centruje margin:auto, nie justify-center (s overflow by sa horná časť nedala odrolovať). */}
      <div ref={stageRef} style={{ flex: 1, minWidth: 0, display: 'flex', overflow: 'auto', padding: 24 }}>
        <div style={{ width: d.w * scale, height: d.h * scale, position: 'relative', flex: 'none', margin: 'auto' }}>
          <div style={{ width: d.w, height: d.h, transform: `scale(${scale})`, transformOrigin: '0 0', position: 'absolute', inset: 0, borderRadius: zariadenie === 'mobil' ? 16 : 8, overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.5)', background: '#000' }}>
            <iframe ref={iframeRef} src={src} title="Appka" style={{ width: d.w, height: d.h, border: 0, display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
              {/* Kde prvok BOL pred posunom — prerušovaný obrys. */}
              {rezim === 'upravit' && zmeny.filter((z) => z.druh === 'presun' && z.trasa === trasa).map((z) => {
                const r = rect(prvky.current.get(z.id) ?? null);
                if (!r) return null;
                return <div key={z.id} style={{ position: 'absolute', left: r.left - (z.dx ?? 0), top: r.top - (z.dy ?? 0), width: r.width, height: r.height, outline: `${inv}px dashed ${C.gold}`, opacity: 0.7 }} />;
              })}
              {hr && <div style={{ position: 'absolute', left: hr.left, top: hr.top, width: hr.width, height: hr.height, outline: `${inv}px solid ${LAPIS.edge}`, background: 'rgba(22,48,122,0.08)' }} />}
              {sr && (
                <div style={{ position: 'absolute', left: sr.left, top: sr.top, width: sr.width, height: sr.height, outline: `${2 * inv}px solid ${C.gold}` }}>
                  <div style={{ position: 'absolute', left: -1 * inv, bottom: '100%', transform: `scale(${inv})`, transformOrigin: '0 100%', whiteSpace: 'nowrap', background: C.gold, color: C.ink, fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                    {menoPrvku(sel!)} · {Math.round(sr.width)}x{Math.round(sr.height)}
                  </div>
                  {(['w', 'h', 'wh'] as const).map((os) => (
                    <div
                      key={os}
                      onPointerDown={(e) => zacniVelkost(e, os)}
                      style={{
                        position: 'absolute', pointerEvents: 'auto', width: 12 * inv, height: 12 * inv, background: C.papyrus, border: `${2 * inv}px solid ${C.gold}`, borderRadius: 2 * inv,
                        right: os === 'h' ? '50%' : -6 * inv, bottom: os === 'w' ? '50%' : -6 * inv,
                        cursor: os === 'w' ? 'ew-resize' : os === 'h' ? 'ns-resize' : 'nwse-resize',
                      }}
                    />
                  ))}
                </div>
              )}
              {/* Pripnuté poznámky — číslo = poradie v zozname. */}
              {zmeny.map((z, i) => {
                if (z.druh !== 'poznamka' || z.trasa !== trasa) return null;
                const r = rect(prvky.current.get(z.id) ?? null);
                if (!r) return null;
                return (
                  <div key={z.id} title={z.poznamka} style={{ position: 'absolute', left: r.right - 10 * inv, top: r.top - 10 * inv, width: 22 * inv, height: 22 * inv, borderRadius: 999, background: LAPIS.edge, color: LAPIS.ink, fontSize: 12 * inv, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

const MALE_TL: CSSProperties = {
  fontFamily: FONT, fontSize: 10, fontWeight: 600, letterSpacing: '.08em', padding: '4px 8px', borderRadius: 999,
  border: `1px solid ${C.border}`, background: 'transparent', color: C.ink, cursor: 'pointer',
};

function Tlacidlo({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} style={MALE_TL}>{children}</button>;
}

function Stitok({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.22em', color: C.inkSoft }}>{children}</div>;
}

function Napoveda({ riadky }: { riadky: string[] }) {
  return (
    <div style={{ fontSize: 12, lineHeight: 1.6, color: C.inkSoft }}>
      {riadky.map((r) => <div key={r}>{r}</div>)}
    </div>
  );
}

function Prepinac({ moznosti, hodnota, zmen }: { moznosti: [string, string][]; hodnota: string; zmen: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: 999, overflow: 'hidden' }}>
      {moznosti.map(([v, m]) => (
        <button
          key={v}
          onClick={() => zmen(v)}
          style={{
            fontFamily: FONT, fontSize: 10, fontWeight: 600, letterSpacing: '.08em', padding: '4px 12px', border: 0, cursor: 'pointer',
            background: hodnota === v ? LAPIS.fill : 'transparent', color: hodnota === v ? LAPIS.edge : C.ink,
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

export function mountNakres() {
  document.title = 'NÁKRES · DOGYPT';
  document.body.style.overflow = 'hidden';
  const host = document.createElement('div');
  document.body.appendChild(host);
  createRoot(host).render(<NakresShell />);
}
