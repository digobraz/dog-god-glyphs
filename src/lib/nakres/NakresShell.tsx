// EDITOR NÁKRESU — Matej ukazuje zmenu na živej appke namiesto Canvy (23. 10. 2026).
//
// Matej: „často ti vysvetlujem moju predstavu o nákrese appky a kreslím to v Canve… je to
// nepraktické". Tlačidlo Nákres (DevNav, vľavo dole) alebo `npm run nakres` otvorí appku
// v rámci mobilu (základ) alebo PC. Editor je VŽDY v úprave — prezerá sa v appke.
//
// 3. kolo (Matej: „je to ešte chaotické… plnefunkčný nástroj"):
//   klik = BLOK, dvojklik = o úroveň dovnútra / prepis textu · Cmd + klik = viac prvkov
//   ťah = PRESUN V TOKU (čiara ukáže, kam sa vsunie, ostatné uhnú) · Shift + ťah = voľne
//   Option + ťah = kópia · Cmd+C / Cmd+V / Cmd+D · plusy VEDĽA / POD vybraným prvkom
//   prvky z ponuky sa doťahujú rovnako ako bloky — do medzery medzi nimi.
//
// 🔴 DO KÓDU SA NEZAPÍŠE NIČ. Zmeny žijú len v DOM-e iframu a po obnovení zmiznú.
//    ULOŽIŤ NÁKRES pošle ZÁZNAM do `plany/nakresy/<id>/` (vite-plugin-nakres.ts) — každá zmena
//    nesie súbor:riadok komponentu (nakresPopis.ts), takže „sprav podľa nákresu" nehádá prvok.
// ⚠️ Presun v toku hýbe DOM uzlami pod Reactom. Na nákres to stačí; keď appka blok prekreslí,
//    môže spadnúť — preto ukladaj priebežne. Server `npm run nakres` beží bez HMR, aby ho
//    uloženie súboru v inej session neobnovilo.
import { createRoot } from 'react-dom/client';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type PointerEvent as RPointerEvent } from 'react';
import { popis, menoKomponentu, type Popis } from './nakresPopis';
import {
  NOVE, TYP_MENO, blokPre, dietaKu, jeRiadok, klonuj, maText, miestoVlozenia, najdiScroller, novyTyp,
  sirkaVolne, vyrobPrvok, type Miesto, type Novy, type Typ,
} from './nakresDom';
import { LAPIS } from '@/components/pack/navGoldSkin';

const ZARIADENIA = {
  mobil: { w: 390, h: 844, meno: 'MOBIL' },
  // Matejovo okno (CLAUDE.md, PAGE_AIR) — na ňom sa veci lámu ako prvé.
  pc: { w: 1477, h: 724, meno: 'PC' },
} as const;
type Zariadenie = keyof typeof ZARIADENIA;
type Druh = 'presun' | 'premiestnit' | 'velkost' | 'text' | 'skryt' | 'poznamka' | 'pridat';
type Poloha = 'pred' | 'za' | 'vedla' | 'pod' | 'na' | 'volne';

type Zmena = {
  id: string; druh: Druh; trasa: string; zariadenie: Zariadenie; prvok: Popis | null;
  dx?: number; dy?: number; w?: number; h?: number;
  pred?: string; po?: string; poznamka?: string;
  typ?: Typ; poloha?: Poloha; kotva?: Popis | null; rodic?: Popis | null; original?: Popis | null; x?: number; y?: number;
};

type NakresWin = Window & { __nakresSnap?: (pixelRatio: number) => Promise<string> };

/** Ťah prvku v appke (myš je v iframe). */
type Tah = {
  rezim: 'tok' | 'volne'; kopia: boolean; sx: number; sy: number; zacal: boolean;
  prvky: HTMLElement[]; originaly: HTMLElement[]; zaklad: Map<Element, { dx: number; dy: number }>;
  povodne: { el: HTMLElement; op: string; pe: string }[];
};
/** Čo práve ťahám (z appky aj z ponuky) — z toho sa ráta miesto vloženia. */
type Ciel = { ignor: Element[]; w: number; h: number; prefer: Element | null; ox: number; oy: number; volne: boolean; blok: boolean };

const KROK = 4;
const snap = (v: number) => Math.round(v / KROK) * KROK;
const novyId = () => Math.random().toString(36).slice(2, 8);

const C = {
  papyrus: '#F4ECDC', papyrusTmavy: '#E9DCC3', ink: '#2B2116', inkSoft: '#6B5A45',
  gold: '#C99A3F', stage: '#24201B', border: 'rgba(43,33,22,0.18)',
};
const FONT = "'Space Grotesk', system-ui, sans-serif";

const DRUH_MENO: Record<Druh, string> = {
  presun: 'POSUN', premiestnit: 'PRESUN', velkost: 'VEĽKOSŤ', text: 'TEXT', skryt: 'SKRYŤ', poznamka: 'POZNÁMKA', pridat: 'NOVÝ',
};
const POLOHA_MENO: Record<Poloha, string> = { pred: 'pred', za: 'za', vedla: 'vedľa', pod: 'pod', na: 'na', volne: 'voľne' };

function popisZmeny(z: Zmena) {
  if (z.druh === 'presun') {
    const c: string[] = [];
    if (z.dy) c.push(`${z.dy > 0 ? 'dole' : 'hore'} ${Math.abs(z.dy)}`);
    if (z.dx) c.push(`${z.dx > 0 ? 'vpravo' : 'vľavo'} ${Math.abs(z.dx)}`);
    return c.length ? c.join(', ') + ' px' : 'bez posunu';
  }
  const k = z.kotva ? (z.kotva.text || `<${z.kotva.tag}>`) : '';
  if (z.druh === 'premiestnit') return `${POLOHA_MENO[z.poloha ?? 'za']} „${k}“`;
  if (z.druh === 'velkost') return `${z.prvok?.rect.w}x${z.prvok?.rect.h} na ${z.w}x${z.h}`;
  if (z.druh === 'text') return `„${z.po}“`;
  if (z.druh === 'poznamka') return `„${z.poznamka}“`;
  if (z.druh === 'pridat') return `${TYP_MENO[z.typ!]} ${POLOHA_MENO[z.poloha ?? 'volne']}${k ? ` „${k}“` : ''}`;
  return 'preč';
}

const jeElement = (n: unknown): n is HTMLElement => !!n && (n as Node).nodeType === 1;
const menoPrvku = (el: Element) => { const t = novyTyp(el); return t ? TYP_MENO[t].toLowerCase() : menoKomponentu(el); };

function NakresShell() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [zariadenie, setZariadenie] = useState<Zariadenie>('mobil');
  const [trasa, setTrasa] = useState('');
  // Mierka = FIT (celý telefón v okne) × ZOOM. Mobil štartuje priblížený, oddialiť sa dá po FIT.
  const [fit, setFit] = useState(1);
  const [zoom, setZoom] = useState(1.5);
  const scale = fit * zoom;
  const [, setTick] = useState(0);
  const [poznamka, setPoznamka] = useState('');
  const [nazov, setNazov] = useState('');
  const [stav, setStav] = useState('');
  const [menu, setMenu] = useState<'vedla' | 'pod' | null>(null);

  // Zdroj pravdy sú REFY — počúvadlá v iframe žijú mimo Reactu a potrebujú vždy čerstvé hodnoty.
  const zmenyRef = useRef<Zmena[]>([]);
  const navrat = useRef(new Map<string, () => void>());
  const prvky = useRef(new Map<string, Element>());
  const zaznam = useRef(new WeakMap<Element, Partial<Record<Druh, string>>>());
  const zariadenieRef = useRef(zariadenie);
  const trasaRef = useRef(trasa);
  const hoverRef = useRef<Element | null>(null);
  const selRef = useRef<Element[]>([]);
  const kontextRef = useRef<Element | null>(null);
  const schrankaRef = useRef<Element[]>([]);
  const editRef = useRef<{ el: HTMLElement; pred: string; html: string; popis: Popis } | null>(null);
  const tahRef = useRef<Tah | null>(null);
  const cielRef = useRef<Ciel | null>(null);
  const bodRef = useRef<{ x: number; y: number } | null>(null);
  const miestoRef = useRef<Miesto | null>(null);
  const snimky = useRef<Record<string, { pred?: string; po?: string }>>({});
  const nakresId = useRef<string | null>(null);
  const neulozene = useRef(false);

  zariadenieRef.current = zariadenie;
  trasaRef.current = trasa;

  const prekresli = useCallback(() => setTick((t) => t + 1), []);
  const ZOOM_MAX = 3;
  const zoomBy = (f: number) => setZoom((z) => Math.min(ZOOM_MAX, Math.max(1, z * f)));
  const zoomRef = useRef(zoomBy);
  zoomRef.current = zoomBy;

  const doc = () => iframeRef.current?.contentDocument ?? null;
  const primarny = () => selRef.current[selRef.current.length - 1] ?? null;
  const vyber = (els: Element[]) => { selRef.current = els.filter((e) => e.isConnected); setMenu(null); prekresli(); };

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
      // Úpravy NOVÉHO prvku (aj kópie) patria do jeho záznamu NOVÝ — v kóde zdroj nemá.
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
      for (const k of Object.keys(m) as Druh[]) if (m[k] === id) delete m[k];
      zaznam.current.set(el, m);
    }
    navrat.current.delete(id);
    prvky.current.delete(id);
    zmenyRef.current = zmenyRef.current.filter((x) => x.id !== id);
    selRef.current = selRef.current.filter((e) => e.isConnected);
    prekresli();
  };

  // ── úkony nad prvkom ──────────────────────────────────────────────────────
  const nastavPosun = (el: HTMLElement, nx: number, ny: number) => {
    const z = najdi(el, 'presun');
    const povodny = el.style.translate;
    const id = z?.id ?? zaloz(el, 'presun', () => { el.style.translate = povodny; });
    el.style.translate = nx || ny ? `${nx}px ${ny}px` : '';
    uprav(id, { dx: nx, dy: ny });
  };
  const posun = (el: HTMLElement, dx: number, dy: number) => {
    const z = najdi(el, 'presun');
    nastavPosun(el, (z?.dx ?? 0) + dx, (z?.dy ?? 0) + dy);
  };

  const skry = (el: HTMLElement) => {
    const novy = novyTyp(el) ? najdi(el, 'pridat') : undefined;
    if (novy) { vrat(novy.id); return; }
    const povodny = el.style.display;
    zaloz(el, 'skryt', () => { el.style.display = povodny; });
    el.style.display = 'none';
  };

  /** Presun v toku — prvok sa vsunie medzi ostatné a tie mu urobia miesto. */
  const premiestni = (el: HTMLElement, m: Miesto) => {
    const kotva = popis(m.kotva);
    const rodic = popis(m.rodic);
    const novy = novyTyp(el) ? najdi(el, 'pridat') : undefined;
    if (novy) {
      m.rodic.insertBefore(el, m.pred);
      uprav(novy.id, { poloha: m.kam, kotva, rodic });
      return;
    }
    const z = najdi(el, 'premiestnit');
    const P0 = el.parentElement, N0 = el.nextSibling;
    const pred = z ? undefined : popis(el);
    m.rodic.insertBefore(el, m.pred);
    const id = z?.id ?? zaloz(el, 'premiestnit', () => {
      if (P0) P0.insertBefore(el, N0 && N0.parentNode === P0 ? N0 : null);
    }, pred);
    uprav(id, { poloha: m.kam, kotva, rodic });
  };

  const susedMiesto = (el: Element, smer: -1 | 1): Miesto | null => {
    const P = el.parentElement;
    const s = smer < 0 ? el.previousElementSibling : el.nextElementSibling;
    if (!P || !s) { setStav(smer < 0 ? 'Prvok je už prvý.' : 'Prvok je už posledný.'); return null; }
    return smer < 0 ? { rodic: P, pred: s, kotva: s, kam: 'pred' } : { rodic: P, pred: s.nextElementSibling, kotva: s, kam: 'za' };
  };

  /** Záznam nového prvku alebo kópie, ktorá už stojí na svojom mieste. */
  const zapisNovy = (el: HTMLElement, typ: Typ, poloha: Poloha, kotva: Element | null, extra?: Partial<Zmena>, revertNavyse?: () => void) => {
    const r = el.getBoundingClientRect();
    zaloz(el, 'pridat', () => { el.remove(); revertNavyse?.(); }, undefined, {
      prvok: null, typ, poloha, kotva: kotva ? popis(kotva) : null, rodic: el.parentElement ? popis(el.parentElement) : null,
      w: Math.round(r.width), h: Math.round(r.height), po: typ === 'kopia' ? undefined : (el.innerText || undefined), ...extra,
    });
  };

  const vlozDoMiesta = (el: HTMLElement, typ: Typ, m: Miesto, original?: Element) => {
    m.rodic.insertBefore(el, m.pred);
    zapisNovy(el, typ, m.kam, m.kotva, original ? { original: popis(original) } : undefined);
  };

  /** VEDĽA / POD vybraného: keď rodič ide tým smerom, stačí vložiť za; inak sa oba zabalia do riadku/stĺpca. */
  const pridajK = (el: HTMLElement, smer: 'vedla' | 'pod', typ: Typ) => {
    const d = el.ownerDocument;
    const P = el.parentElement;
    if (!P) return null;
    const novy = typ === 'kopia' ? klonuj(el) : vyrobPrvok(d, typ);
    const riadok = smer === 'vedla';
    let obal: HTMLElement | null = null;
    if (jeRiadok(P) === riadok) el.after(novy);
    else {
      obal = d.createElement('div');
      obal.dataset.nakresObal = '1';
      const maly = el.getBoundingClientRect().width < P.getBoundingClientRect().width * 0.5;
      Object.assign(obal.style, riadok
        ? (maly ? { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } : { display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(0,1fr)', gap: '8px' })
        : { display: 'flex', flexDirection: 'column', alignItems: maly ? 'flex-start' : 'stretch', gap: '8px' });
      P.insertBefore(obal, el);
      obal.append(el, novy);
    }
    const o = obal;
    zapisNovy(novy, typ, smer, el, typ === 'kopia' ? { original: popis(el) } : undefined, () => {
      if (o && o.isConnected) { o.parentElement?.insertBefore(el, o); o.remove(); }
    });
    return novy;
  };

  /** Kópie vložené za `za` (bez neho za posledný zdroj) v tom istom poradí. */
  const kopiruj = (zdroje: Element[], za0?: Element | null) => {
    const nove: HTMLElement[] = [];
    let za: Element | undefined = za0 ?? zdroje[zdroje.length - 1];
    for (const z of zdroje) {
      if (!z.isConnected || !za?.isConnected) continue;
      const c = klonuj(z);
      za.after(c);
      zapisNovy(c, 'kopia', 'za', za, { original: popis(z) });
      nove.push(c);
      za = c;
    }
    if (nove.length) vyber(nove);
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

  /** Prvý text pod prvkom — Enter a tlačidlo TEXT nemajú vyžadovať prekliknutie až na list. */
  const textovyPrvok = (el: Element): HTMLElement | null => {
    if (maText(el)) return el as HTMLElement;
    for (const c of Array.from(el.children)) { const t = textovyPrvok(c); if (t) return t; }
    return null;
  };

  const pripniPoznamku = () => {
    const t = poznamka.trim();
    if (!t) return;
    zaloz(primarny(), 'poznamka', () => {}, undefined, { poznamka: t });
    setPoznamka('');
  };

  // ── výber ─────────────────────────────────────────────────────────────────
  /** Čo vyberie klik na t: v kontexte (po dvojkliku dovnútra) dieťa kontextu, inak celý BLOK. */
  const urovenPre = (t: Element) => {
    const k = kontextRef.current;
    if (k && k.isConnected && k !== t && k.contains(t)) return dietaKu(k, t) ?? t;
    return blokPre(t);
  };

  // ── miesto vloženia + posun stránky pri okraji ────────────────────────────
  const prepocitajMiesto = () => {
    const c = cielRef.current, b = bodRef.current, d = doc();
    if (!c || !b || !d || c.volne) { miestoRef.current = null; return; }
    miestoRef.current = miestoVlozenia(d, b.x, b.y, c.ignor, c.w, c.h, c.prefer, c.blok);
  };

  useEffect(() => {
    let r = 0;
    const slucka = () => {
      const b = bodRef.current, d = doc();
      if (b && d?.defaultView) {
        // Ťah pri hornom/dolnom okraji telefónu roluje stránku — dá sa ísť aj „mimo obrazovky".
        const vh = d.defaultView.innerHeight;
        const krok = b.y < 48 ? -12 : b.y > vh - 48 ? 12 : 0;
        if (krok) {
          const s = najdiScroller(d.elementFromPoint(b.x, Math.min(Math.max(b.y, 1), vh - 1)));
          if (s) { s.scrollTop += krok; prepocitajMiesto(); }
        }
      }
      prekresli();
      r = requestAnimationFrame(slucka);
    };
    r = requestAnimationFrame(slucka);
    return () => cancelAnimationFrame(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prekresli]);

  // ── klávesy ───────────────────────────────────────────────────────────────
  const klaves = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    const pise = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (editRef.current) {
      if (e.key === 'Escape') { e.preventDefault(); koniecText(false); }
      else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); editRef.current.el.blur(); }
      return;
    }
    if (pise) return;
    const cmd = e.metaKey || e.ctrlKey;
    const sel = selRef.current.filter((x) => x.isConnected) as HTMLElement[];
    const hotovo = () => { e.preventDefault(); e.stopPropagation(); };
    if (cmd && e.key === 'z') {
      const posledna = zmenyRef.current[zmenyRef.current.length - 1];
      if (posledna) { hotovo(); vrat(posledna.id); }
      return;
    }
    if (cmd && e.key === 'c' && sel.length) { schrankaRef.current = [...sel]; setStav(`Skopírované: ${sel.length}. Cmd+V vloží kópiu za vybraný prvok.`); hotovo(); return; }
    if (cmd && e.key === 'v' && schrankaRef.current.length) {
      // Vložiť ZA vybraný prvok, nie za originál — kopíruje sa preto, aby kópia išla inam.
      const ciel = primarny();
      kopiruj(schrankaRef.current, ciel && ciel.isConnected ? ciel : null);
      hotovo();
      return;
    }
    if (cmd && e.key === 'd' && sel.length) { kopiruj(sel); hotovo(); return; }
    if (e.key === 'Escape') { if (menu) setMenu(null); else { kontextRef.current = null; vyber([]); } hotovo(); return; }
    if (!sel.length) return;
    const k = e.shiftKey ? 16 : KROK;
    const sipky: Record<string, [number, number]> = { ArrowLeft: [-k, 0], ArrowRight: [k, 0], ArrowUp: [0, -k], ArrowDown: [0, k] };
    if (sipky[e.key]) { sel.forEach((el) => posun(el, ...sipky[e.key])); hotovo(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { sel.forEach(skry); vyber([]); hotovo(); return; }
    if (e.key === 'Enter') { const t2 = textovyPrvok(sel[sel.length - 1]); if (t2) { vyber([t2]); zacniText(t2); } hotovo(); return; }
    if (e.key === 'p' || e.key === 'P') {
      const p = sel[sel.length - 1].parentElement;
      if (p && p.tagName !== 'BODY') { kontextRef.current = p.parentElement; vyber([p]); }
      hotovo();
    }
  };
  const klavesRef = useRef(klaves);
  klavesRef.current = klaves;

  // ── počúvadlá v iframe ────────────────────────────────────────────────────
  // Funkcie sa volajú cez ref, aby počúvadlo pripojené raz videlo vždy čerstvý render.
  const akcieRef = useRef({ urovenPre, vyber, koniecText, zacniText, nastavPosun, najdi, zapisNovy, premiestni, vlozDoMiesta, prepocitajMiesto, textovyPrvok });
  akcieRef.current = { urovenPre, vyber, koniecText, zacniText, nastavPosun, najdi, zapisNovy, premiestni, vlozDoMiesta, prepocitajMiesto, textovyPrvok };

  const pripoj = useCallback((win: Window) => {
    const d = win.document;
    // Cookie lišta do nákresu nepatrí a prekrýva spodok obrazovky, kam sa najčastejšie ťahá.
    const st = d.createElement('style');
    st.textContent = '.consent-banner{display:none!important}';
    d.head.appendChild(st);
    const A = () => akcieRef.current;
    const vEdite = (t: EventTarget | null) => !!editRef.current && !!t && editRef.current.el.contains(t as Node);
    const ciel = (e: Event): HTMLElement | null => {
      let t = e.target as Node | null;
      if (t && t.nodeType === 3) t = t.parentNode;
      return jeElement(t) && t.tagName !== 'HTML' && t.tagName !== 'BODY' ? t : null;
    };
    const zastav = (e: Event) => {
      if (vEdite(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const zacniTah = (T: Tah) => {
      T.zacal = true;
      if (T.rezim === 'volne') {
        if (T.kopia) {
          T.prvky = T.originaly.map((o) => { const c = klonuj(o); o.after(c); A().zapisNovy(c, 'kopia', 'za', o, { original: popis(o) }); return c; });
        }
        for (const el of T.prvky) { const z = A().najdi(el, 'presun'); T.zaklad.set(el, { dx: z?.dx ?? 0, dy: z?.dy ?? 0 }); }
        selRef.current = T.prvky;
        return;
      }
      if (T.kopia) T.prvky = T.originaly.map((o) => klonuj(o));
      else for (const el of T.prvky) {
        T.povodne.push({ el, op: el.style.opacity, pe: el.style.pointerEvents });
        el.style.opacity = '0.35';
        el.style.pointerEvents = 'none';
      }
      const r = T.originaly[T.originaly.length - 1].getBoundingClientRect();
      const rodicia = new Set(T.originaly.map((o) => o.parentElement));
      cielRef.current = {
        ignor: T.kopia ? [] : T.prvky, w: r.width, h: r.height, volne: false,
        blok: T.originaly.every((o) => blokPre(o) === o),
        prefer: !T.kopia && rodicia.size === 1 ? [...rodicia][0] : null,
        ox: T.sx - r.left, oy: T.sy - r.top,
      };
    };

    const pohyb = (e: PointerEvent) => {
      const T = tahRef.current;
      if (T) {
        const dx0 = e.clientX - T.sx, dy0 = e.clientY - T.sy;
        if (!T.zacal) { if (Math.hypot(dx0, dy0) < 4) return; zacniTah(T); }
        if (T.rezim === 'volne') {
          for (const el of T.prvky) { const b = T.zaklad.get(el)!; A().nastavPosun(el, snap(b.dx + dx0), snap(b.dy + dy0)); }
        } else {
          bodRef.current = { x: e.clientX, y: e.clientY };
          A().prepocitajMiesto();
        }
        hoverRef.current = null;
        zastav(e);
        return;
      }
      if (vEdite(e.target)) return;
      const t = ciel(e);
      const h = t ? A().urovenPre(t) : null;
      if (h !== hoverRef.current) { hoverRef.current = h; prekresli(); }
    };

    const dole = (e: PointerEvent) => {
      if (vEdite(e.target)) return;
      zastav(e);
      if (editRef.current) A().koniecText(true);
      const t = ciel(e);
      if (!t) { kontextRef.current = null; A().vyber([]); return; }
      const k = kontextRef.current;
      if (k && !k.contains(t)) kontextRef.current = null;
      const u = A().urovenPre(t);
      if (e.metaKey || e.ctrlKey) {
        // Cmd + klik = pridať / odobrať z výberu (Matej: „cmd držať = označím viac prvkov").
        const s = selRef.current;
        A().vyber(s.includes(u) ? s.filter((x) => x !== u) : [...s, u]);
        return;
      }
      const s = selRef.current;
      const vybrane = s.some((x) => x.contains(t)) ? s : [u];
      if (vybrane !== s) A().vyber(vybrane);
      else setMenu(null);
      tahRef.current = {
        rezim: e.shiftKey ? 'volne' : 'tok', kopia: e.altKey, sx: e.clientX, sy: e.clientY, zacal: false,
        prvky: vybrane as HTMLElement[], originaly: vybrane as HTMLElement[], zaklad: new Map(), povodne: [],
      };
    };

    const hore = (e: PointerEvent) => {
      const T = tahRef.current;
      tahRef.current = null;
      if (!T) return;
      zastav(e);
      if (T.zacal && T.rezim === 'tok') {
        for (const p of T.povodne) { p.el.style.opacity = p.op; p.el.style.pointerEvents = p.pe; }
        const m = miestoRef.current;
        if (m) {
          if (T.kopia) T.prvky.forEach((c, i) => A().vlozDoMiesta(c, 'kopia', m, T.originaly[i]));
          else {
            // Poradie v toku = poradie v stránke, nie poradie klikania.
            const vPoradi = [...T.prvky].sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1));
            vPoradi.forEach((el) => A().premiestni(el, m));
          }
          selRef.current = T.prvky;
        }
      }
      cielRef.current = null;
      bodRef.current = null;
      miestoRef.current = null;
      prekresli();
    };

    const dvojklik = (e: MouseEvent) => {
      if (vEdite(e.target)) return;
      zastav(e);
      const t = ciel(e);
      if (!t) return;
      const S = selRef.current.length === 1 ? selRef.current[0] : null;
      if (S && S.contains(t)) {
        // Dvojklik = o úroveň dovnútra; na liste s textom rovno prepis.
        const d2 = dietaKu(S, t);
        if (d2) {
          kontextRef.current = S;
          A().vyber([d2]);
          if (maText(d2) && !d2.children.length) A().zacniText(d2 as HTMLElement);
          return;
        }
        const tx = A().textovyPrvok(S);
        if (tx) { A().vyber([tx]); A().zacniText(tx); }
        return;
      }
      A().vyber([A().urovenPre(t)]);
    };

    d.addEventListener('pointermove', pohyb, true);
    d.addEventListener('pointerdown', dole, true);
    d.addEventListener('pointerup', hore, true);
    d.addEventListener('dblclick', dvojklik, true);
    for (const ev of ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'contextmenu', 'submit', 'dragstart']) {
      d.addEventListener(ev, zastav, true);
    }
    d.addEventListener('keydown', (e) => klavesRef.current(e), true);
    win.addEventListener('scroll', prekresli, true);
    win.addEventListener('wheel', (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomRef.current(e.deltaY < 0 ? 1.1 : 1 / 1.1);
    }, { passive: false, capture: true });
  }, [prekresli]);

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
        selRef.current = [];
        kontextRef.current = null;
        hoverRef.current = null;
        // Snímka PRED až keď sa nová obrazovka vykreslí — prvá zmena by ju inak predbehla.
        window.setTimeout(() => { if (!zmenyRef.current.some((z) => z.trasa === p)) void snimaj('pred'); }, 1500);
      }
    }, 400);
    return () => { f.removeEventListener('load', nacitane); window.clearInterval(t); };
  }, [pripoj, snimaj]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => klavesRef.current(e);
    window.addEventListener('keydown', k);
    const odist = (e: BeforeUnloadEvent) => { if (neulozene.current && zmenyRef.current.length) e.preventDefault(); };
    window.addEventListener('beforeunload', odist);
    return () => { window.removeEventListener('keydown', k); window.removeEventListener('beforeunload', odist); };
  }, []);

  // Mierka rámu podľa voľného miesta.
  useEffect(() => {
    const s = stageRef.current;
    if (!s) return;
    const d = ZARIADENIA[zariadenie];
    const prepocitaj = () => {
      const PAD = 48;
      setFit(Math.min(1, (s.clientWidth - PAD) / d.w, (s.clientHeight - PAD) / d.h));
    };
    prepocitaj();
    setZoom(zariadenie === 'mobil' ? 1.5 : 1);
    const ro = new ResizeObserver(prepocitaj);
    ro.observe(s);
    const koliesko = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomRef.current(e.deltaY < 0 ? 1.1 : 1 / 1.1);
    };
    s.addEventListener('wheel', koliesko, { passive: false });
    return () => { ro.disconnect(); s.removeEventListener('wheel', koliesko); };
  }, [zariadenie]);

  // Priblížený telefón ostane vodorovne v strede.
  useEffect(() => {
    const s = stageRef.current;
    if (s) s.scrollLeft = (s.scrollWidth - s.clientWidth) / 2;
  }, [scale]);

  // ── zmena veľkosti (úchyty v hornom dokumente) ─────────────────────────────
  const zacniVelkost = (e: RPointerEvent, os: 'w' | 'h' | 'wh') => {
    const el = primarny() as HTMLElement | null;
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

  // ── prvky z ponuky ────────────────────────────────────────────────────────
  /** Klik na dlaždicu bez ťahu: POD vybraný prvok, bez výberu doprostred obrazovky. */
  const pridajKlikom = (typ: Novy) => {
    const d = doc();
    if (!d) return;
    const sel = primarny() as HTMLElement | null;
    if (sel && sel.isConnected && sel.parentElement && sel.tagName !== 'BODY') {
      const n = pridajK(sel, 'pod', typ);
      if (n) vyber([n]);
      return;
    }
    const el = vyrobPrvok(d, typ);
    Object.assign(el.style, { position: 'fixed', zIndex: '2147483000', left: '0px', top: '0px' });
    sirkaVolne(el, typ, d.defaultView!.innerWidth);
    d.body.appendChild(el);
    const r = el.getBoundingClientRect();
    el.style.left = `${snap((d.defaultView!.innerWidth - r.width) / 2)}px`;
    el.style.top = `${snap((d.defaultView!.innerHeight - r.height) / 2)}px`;
    zapisNovy(el, typ, 'volne', null);
    vyber([el]);
  };

  /** Shift + pustenie = voľne presne tam, kde ho Matej pustil; kotva = čo je pod ním. */
  const polozNa = (typ: Novy, x: number, y: number) => {
    const d = doc();
    const win = d?.defaultView;
    if (!d || !win) return;
    const pod = d.elementFromPoint(x, y);
    const kotva = pod && pod.tagName !== 'BODY' && pod.tagName !== 'HTML' ? pod : null;
    const el = vyrobPrvok(d, typ);
    Object.assign(el.style, { position: 'absolute', zIndex: '2147483000', left: '0px', top: '0px' });
    sirkaVolne(el, typ, win.innerWidth);
    d.body.appendChild(el);
    const r0 = el.getBoundingClientRect();
    el.style.left = `${snap(x - r0.width / 2 + win.scrollX)}px`;
    el.style.top = `${snap(y - r0.height / 2 + win.scrollY)}px`;
    const r = el.getBoundingClientRect();
    zapisNovy(el, typ, 'na', kotva, { x: Math.round(r.left), y: Math.round(r.top) });
    vyber([el]);
  };

  /** Ťah z ponuky: duch ide za myšou v hornom dokumente (capture); nad telefónom sa ráta miesto v toku. */
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
        const r = duch.getBoundingClientRect();
        cielRef.current = { ignor: [], w: r.width / m, h: r.height / m, prefer: null, ox: 0, oy: 0, volne: false, blok: typ === 'karta' };
      }
      duch.style.left = `${ev.clientX}px`;
      duch.style.top = `${ev.clientY}px`;
      cielRef.current!.volne = ev.shiftKey;
      bodRef.current = bod(ev.clientX, ev.clientY);
      prepocitajMiesto();
      hoverRef.current = ev.shiftKey && bodRef.current ? doc()?.elementFromPoint(bodRef.current.x, bodRef.current.y) ?? null : null;
    };
    const koniec = (ev: PointerEvent) => {
      dlazdica.removeEventListener('pointermove', pohyb);
      dlazdica.removeEventListener('pointerup', koniec);
      const b = bod(ev.clientX, ev.clientY);
      const mi = miestoRef.current;
      cielRef.current = null;
      bodRef.current = null;
      miestoRef.current = null;
      hoverRef.current = null;
      if (!duch) { pridajKlikom(typ); return; }
      duch.remove();
      const d = doc();
      if (!b || !d) { prekresli(); return; }
      if (ev.shiftKey || !mi) { polozNa(typ, b.x, b.y); return; }
      const el = vyrobPrvok(d, typ);
      vlozDoMiesta(el, typ, mi);
      vyber([el]);
    };
    dlazdica.addEventListener('pointermove', pohyb);
    dlazdica.addEventListener('pointerup', koniec);
  };

  /** Náhľad prvku v ponuke = ten istý prvok, aký pribudne v appke. */
  const nahlad = (typ: Novy) => (n: HTMLDivElement | null) => {
    if (!n || n.firstChild) return;
    const el = vyrobPrvok(document, typ);
    if (['blok', 'karta', 'sekcia', 'rozbalovac'].includes(typ)) Object.assign(el.style, { width: '150px' });
    if (typ === 'blok' || typ === 'karta') Object.assign(el.style, { minHeight: '56px', padding: '0' });
    if (typ === 'tvar') Object.assign(el.style, { width: '120px', height: '56px' });
    n.appendChild(el);
  };

  // ── uloženie ──────────────────────────────────────────────────────────────
  const ulozit = async () => {
    if (!zmenyRef.current.length) { setStav('Zatiaľ žiadna zmena.'); return; }
    setStav('Ukladám…');
    const sel = selRef.current;
    selRef.current = [];
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
    selRef.current = [];
    kontextRef.current = null;
    neulozene.current = false;
    setStav('');
    iframeRef.current?.contentWindow?.location.reload();
  };

  // ── vykreslenie ───────────────────────────────────────────────────────────
  const d = ZARIADENIA[zariadenie];
  const rect = (el: Element | null) => (el && el.isConnected ? el.getBoundingClientRect() : null);
  const sel = selRef.current.filter((e) => e.isConnected);
  const jeden = sel.length === 1 ? sel[0] : null;
  const tahaSa = !!tahRef.current?.zacal || !!cielRef.current;
  const hr = !tahaSa && hoverRef.current && !sel.includes(hoverRef.current) ? rect(hoverRef.current) : null;
  const hrShift = cielRef.current?.volne && hoverRef.current ? rect(hoverRef.current) : null;
  const sr = jeden && !tahaSa ? rect(jeden) : null;
  const inv = 1 / scale;
  const selPopis = jeden ? popis(jeden) : null;
  const zmeny = zmenyRef.current;
  const mi = miestoRef.current;
  const ciel = cielRef.current, bod = bodRef.current;
  const duchRect = tahRef.current?.zacal && tahRef.current.rezim === 'tok' && ciel && bod
    ? { left: bod.x - ciel.ox, top: bod.y - ciel.oy, width: ciel.w, height: ciel.h } : null;

  const src = (() => {
    const u = new URL(window.location.href);
    u.searchParams.delete('nakres');
    return u.pathname + u.search + u.hash;
  })();

  const box = (r: { left: number; top: number; width: number; height: number }, s: CSSProperties, key?: string | number) => (
    <div key={key} style={{ position: 'absolute', left: r.left, top: r.top, width: r.width, height: r.height, ...s }} />
  );

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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {NOVE.map(([t, m]) => (
                <div
                  key={t}
                  onPointerDown={(e) => zacniVklad(e, t)}
                  title={jeden ? 'Ťahaj do medzery na telefóne · klik = pod vybraný prvok' : 'Ťahaj do medzery na telefóne · klik = do stredu'}
                  style={{ height: 72, borderRadius: 12, border: `1px solid ${C.border}`, background: '#FFFBF3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'grab', userSelect: 'none', touchAction: 'none', overflow: 'hidden' }}
                >
                  <div ref={nahlad(t)} style={{ pointerEvents: 'none', transform: 'scale(0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40 }} />
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.04em', color: C.inkSoft }}>{m}</span>
                </div>
              ))}
            </div>
          </section>

          {sel.length > 1 ? (
            <section style={{ background: C.papyrusTmavy, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Vybraté prvky: {sel.length}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Tlacidlo onClick={() => kopiruj(sel)}>KÓPIA</Tlacidlo>
                <Tlacidlo onClick={() => { sel.forEach((x) => skry(x as HTMLElement)); vyber([]); }}>SKRYŤ</Tlacidlo>
                <Tlacidlo onClick={() => vyber([])}>ZRUŠIŤ VÝBER</Tlacidlo>
              </div>
            </section>
          ) : jeden && selPopis ? (
            <section style={{ background: C.papyrusTmavy, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{menoPrvku(jeden)} <span style={{ color: C.inkSoft, fontWeight: 400 }}>&lt;{selPopis.tag}&gt; {selPopis.rect.w}x{selPopis.rect.h}</span></div>
              {selPopis.text && <div style={{ fontSize: 12, color: C.inkSoft }}>„{selPopis.text}“</div>}
              <div style={{ fontSize: 10, color: C.inkSoft, wordBreak: 'break-all' }}>{novyTyp(jeden) ? 'nový prvok z nákresu' : (selPopis.zdroj ?? 'zdroj neznámy')}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Tlacidlo onClick={() => { const p = jeden.parentElement; if (p && p.tagName !== 'BODY') { kontextRef.current = p.parentElement; vyber([p]); } }}>RODIČ</Tlacidlo>
                <Tlacidlo onClick={() => { const m = susedMiesto(jeden, -1); if (m) premiestni(jeden as HTMLElement, m); }}>SKÔR</Tlacidlo>
                <Tlacidlo onClick={() => { const m = susedMiesto(jeden, 1); if (m) premiestni(jeden as HTMLElement, m); }}>NESKÔR</Tlacidlo>
                <Tlacidlo onClick={() => { const t = textovyPrvok(jeden); if (t) { vyber([t]); zacniText(t); } }}>TEXT</Tlacidlo>
                <Tlacidlo onClick={() => kopiruj([jeden])}>KÓPIA</Tlacidlo>
                <Tlacidlo onClick={() => { skry(jeden as HTMLElement); vyber([]); }}>SKRYŤ</Tlacidlo>
                <Tlacidlo onClick={() => vyber([])}>ZRUŠIŤ VÝBER</Tlacidlo>
              </div>
            </section>
          ) : (
            <Napoveda riadky={[
              'Klik = blok · dvojklik = dovnútra / prepíš text',
              'Ťahaj = presuň medzi ostatné (urobia miesto)',
              'Shift + ťahaj = voľne · Option + ťahaj = kópia',
              'Cmd + klik = viac prvkov naraz',
              'Plus vedľa / pod výberom = pridaj k nemu',
              'Cmd+C, Cmd+V · Cmd+D = kópia · Del = skry',
              'Šípky = jemný posun · P = rodič · Enter = text',
              'Rohy výberu = veľkosť · Cmd+Z = späť',
            ]} />
          )}

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Stitok>{jeden ? 'POZNÁMKA K PRVKU' : 'POZNÁMKA K OBRAZOVKE'}</Stitok>
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
                    {z.trasa} · {z.prvok ? (z.prvok.text || `<${z.prvok.tag}>`) : z.druh === 'poznamka' ? 'celá obrazovka' : 'nový prvok'}
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
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
              {/* Kde vybraný prvok BOL pred voľným posunom — len pri výbere, inak by obrysy zaplavili obrazovku. */}
              {zmeny.filter((z) => z.druh === 'presun' && z.trasa === trasa && sel.includes(prvky.current.get(z.id)!)).map((z) => {
                const r = rect(prvky.current.get(z.id) ?? null);
                return r ? box({ left: r.left - (z.dx ?? 0), top: r.top - (z.dy ?? 0), width: r.width, height: r.height }, { outline: `${inv}px dashed ${C.gold}`, opacity: 0.7 }, z.id) : null;
              })}
              {hr && box(hr, { outline: `${inv}px solid ${LAPIS.edge}`, background: 'rgba(22,48,122,0.08)' })}
              {hrShift && box(hrShift, { outline: `${inv}px dashed ${LAPIS.edge}` })}
              {!tahaSa && sel.length > 1 && sel.map((el, i) => { const r = rect(el); return r ? box(r, { outline: `${2 * inv}px solid ${C.gold}` }, i) : null; })}
              {/* Kam sa vsunie: rodič prerušovane, miesto plnou lapisovou čiarou. */}
              {mi && rect(mi.rodic) && box(rect(mi.rodic)!, { outline: `${inv}px dashed ${LAPIS.edge}` })}
              {mi?.ciara && box({ left: mi.ciara.x, top: mi.ciara.y, width: mi.ciara.w, height: mi.ciara.h }, { background: LAPIS.edge, borderRadius: 2, boxShadow: '0 0 0 1px #FFFBF3' })}
              {duchRect && box(duchRect, { outline: `${2 * inv}px dashed ${C.gold}`, background: 'rgba(201,154,63,0.12)', borderRadius: 8 })}
              {sr && (
                <div style={{ position: 'absolute', left: sr.left, top: sr.top, width: sr.width, height: sr.height, outline: `${2 * inv}px solid ${C.gold}` }}>
                  <div style={{ position: 'absolute', left: -1 * inv, bottom: '100%', transform: `scale(${inv})`, transformOrigin: '0 100%', whiteSpace: 'nowrap', background: C.gold, color: C.ink, fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                    {menoPrvku(jeden!)} · {Math.round(sr.width)}x{Math.round(sr.height)}
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
                  {/* Plus VEDĽA a POD — pridá k vybranému prvku (Matej: „šípka vedľa alebo pod"). Sedí VNÚTRI rámu pri hrane, aby ho neorezal okraj telefónu. */}
                  {(['vedla', 'pod'] as const).map((smer) => (
                    <div
                      key={smer}
                      onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setMenu(menu === smer ? null : smer); }}
                      title={smer === 'vedla' ? 'Pridať vedľa' : 'Pridať pod'}
                      style={{
                        position: 'absolute', pointerEvents: 'auto', width: 24 * inv, height: 24 * inv, borderRadius: 999, background: LAPIS.grad, color: LAPIS.ink,
                        border: `${inv}px solid #FFFBF3`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 * inv, fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                        ...(smer === 'vedla' ? { right: -12 * inv, top: `calc(50% - ${12 * inv}px)` } : { bottom: -12 * inv, left: `calc(50% - ${12 * inv}px)` }),
                      }}
                    >
                      +
                    </div>
                  ))}
                  {menu && (
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute', pointerEvents: 'auto', transform: `scale(${inv})`, transformOrigin: menu === 'vedla' ? '100% 0' : '50% 0', zIndex: 2,
                        ...(menu === 'vedla' ? { right: 16 * inv, top: `calc(50% + ${16 * inv}px)` } : { top: `calc(100% + ${16 * inv}px)`, left: `calc(50% - 110px)` }),
                        background: C.papyrus, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.35)', padding: 8,
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, width: 220,
                      }}
                    >
                      <div style={{ gridColumn: '1 / -1', fontSize: 10, letterSpacing: '.22em', color: C.inkSoft, padding: '4px 4px 0' }}>{menu === 'vedla' ? 'PRIDAŤ VEDĽA' : 'PRIDAŤ POD'}</div>
                      {([['kopia', 'KÓPIA TOHTO'], ...NOVE] as [Typ, string][]).map(([t, m]) => (
                        <button
                          key={t}
                          onClick={() => { const n = pridajK(jeden as HTMLElement, menu, t); setMenu(null); if (n) vyber([n]); }}
                          style={{ ...MALE_TL, borderRadius: 8, textAlign: 'left', gridColumn: t === 'kopia' ? '1 / -1' : undefined }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
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
