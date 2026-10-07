/**
 * ČLENSTVO — telefóny s funkciami appky (Matej 27. 9. 2026).
 *
 * *„HEROGLYPH sekciu vytlačí táto scénka mobilov, ktorá príde zdola na stred…
 * 1. scroll: sekcia odchádza a na stred prichádzajú mockupy telefónov — nadpis
 * Členstvo v DOGYPTe… ďalší scroll posunie mockupy doprava a na ľavej strane
 * pôjde nadpis, text a odrážky… každý telefón bude meniť texting a bude tam
 * vždy aj chip, ktorý otvorí popup so screenshotmi priamo z appky a viac info,
 * aby sme nezaplnili hlavnú obrazovku."* Predloha: 21st.dev `phone-mockups-1`
 * (stredný telefón vpredu, bočné za ním, nižšie a menšie — karusel).
 * 🔴 KARUSEL JE PRENESENÝ Z KOMPONENTU, NIE NAKRESLENÝ PODĽA NEHO (Matej
 * 27. 9.: *„sú užšie a menšie a nefunguje to tak ako v komponente a pri dotyku
 * nereagujú — chcem ich ako v tom prompte"*). Rám = `ui/iphone-15-pro.tsx`
 * (šírka 350, mobil 280) · bočné ±60 %, mierka .9, krytie .3 · prechod
 * 700 ms · samé sa točia á 3 s a pri hover stoja · tlačidlá predošlá / ďalšia
 * (pauza vynechaná — brandová kresba chýba) · ťuk na bočný telefón = prepni naň · hover na prednom = ×1,05 a −6°.
 * Rozdiel oproti komponentu: v stave FUNKCIA drží telefón scroll (text vľavo
 * k nemu patrí), takže šípky a ťuk tam presunú stránku na zastávku tej funkcie
 * a samé točenie beží len v úvodnom stave (nadpis + telefóny do polovice).
 *
 * ⚠️ KOSTRA. Screenshoty sa dopĺňajú spolu s Matejom — všetko je v `APPS`.
 * Nadpis ČLENSTVO + dva riadky pod ním, vo funkcii nadpis + 4 jednoriadkové
 * odrážky + chip DETAIL (Matej 27. 9.: *„nadpis jeden riadok a 3–4 odrážky
 * pod seba jednoriadkových… namiesto pozri v appke daj detail — veľký popup,
 * slider fotka/screen konkrétnej veci a 1–3 riadky o tej funkcii… obsah naľavo
 * je max vo výške tých telefónov"*). Odrážky `onepage.apps.<id>.b1–4` sú
 * PRVÝ NÁSTREL, 1–3 riadky v detaile = `heroglyph.flow.more.<id>.d`.
 *
 * 🔴 STRÁNKA SA NEROLUJE (Matej 27. 9. 2026: *„scéna sa neroluje nová, iba obsah
 * odchádza a nový prichádza — stránka drží obraz ako v celom flowe"*). Sekcia
 * je preto zasunutá POD koniec oblúka (margin-top −(100 + APPS_OUT_VH) lvh):
 * jej javisko sa prilepí presne na dopísanom DOGTRIXe (`.op-arc-rest2`), kým
 * oblúk ešte stojí prilepený vo svojej výdrži (`ARC_HOLD2_VH = APPS_OUT_VH`).
 * Obe javiská stoja naraz, toto je navrchu a priehľadné.
 *
 * DEJ na vlastnej prilepenej dráhe (p 0–1), jeden ťah motora = jedna zastávka:
 *   0 → PEEK   obsah HEROGLYPHu zhasne (`--apps-out` na `.op-arc`), zdola
 *              vyjdú VEĽKÉ telefóny len do polovice obrazovky, nad nimi nadpis
 *              (Matej: *„ukážu sa len do polovice stránky, budú veľké"*)
 *   PEEK → 1.  telefóny sa zmenšia a idú doprava, naľavo nabehne 1. funkcia
 *   ďalej      karusel sa točí po funkciách 1 → 4, text naľavo sa mení s ním
 * Zastávky: `APPS_STOPS` (OnePage.filmStops).
 *
 * 🔴 JEDEN ŤAH (Matej 28. 9. 2026: *„členstvo, kde je 5/5 možností, dajme na
 * jeden scroll — človek môže a nemusí mať záujem čítať… na horizontálny scroll
 * slúžia šípky"*). Dráha má už len príchod (PEEK) a posun doprava, ktoré motor
 * prejde jednou jazdou, a zastávka je jediná: 1. funkcia vľavo. Funkcie 2–5
 * prepínajú šípky a ťuk na bočný telefón — stránka sa pri tom nehýbe.
 * Za zastávkou je krátka dráha ODCHODU (`APPS_EXIT_VH`): javisko zhasne na
 * mieste a pod ním sa vynorí pás hviezd (Matej: *„ďalší scroll bude fade in,
 * nie posun sekcie"*) — `.op-quo` je o ňu zasunutá pod túto sekciu.
 */
import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/i18n/LanguageContext';
import { LAB } from '@/lib/labTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { HandArrowLeft } from '@/components/pack/HandIcons';
import Iphone15Pro, { IPHONE_H, IPHONE_W } from '@/components/ui/iphone-15-pro';
import { filmDefer } from './filmDefer';

type AppFeature = {
  id: string;
  /** Názov funkcie (nadpis vľavo aj na obrazovke telefónu). JEDEN riadok. */
  nameKey: string;
  /** 1–2 vety „čo to je" — vľavo pod nadpisom aj v DETAILE vedľa telefónu. */
  ledeKey: string;
  /** Jednoriadkové odrážky — LEN v DETAILE (Matej 5. 10. 2026: *„nadpis a pod tým
   *  1–2 vety čo to je, odrážky by som dal až v popupe"*). Počet sa smie líšiť. */
  bulletKeys: string[];
  /** Obrázok na displeji telefónu; kým chýba, stojí tam zástupca. */
  shot?: string;
  /** Slider v DETAILE: screenshoty z appky. Kým chýbajú, 3 prázdne rámy. */
  shots: string[];
  /** Mapy pod funkciou dodáva Mapy.com — v DETAILE pod vetou čip s ich logom. */
  mapy?: boolean;
  /** AINUBIS beží na Claude — v DETAILE čip „Powered by Claude“. */
  claude?: boolean;
};

/** Appky, z ktorých DOGYPT berie to najlepšie — názvy sa neprekladajú. */
/** Appky, ktoré DOGYPT spája (Matej 6. 10. 2026: *„pridať aj logá spoločností + ešte tinder +
 *  facebook… aspoň dva riadky… prípadne tam dať and much more"*). Logo = jednofarebné SVG zo
 *  Simple Icons (CC0) v `public/icons/brands/`, farbí sa atramentom cez masku. Skool v Simple
 *  Icons nie je (logo je farebný nápis) — ostáva text. */
/** ČIP POD VETOU V DETAILE — JEDEN TVAR PRE VŠETKY FUNKCIE (Matej 6. 10. 2026: *„pri snifferi dajme do
 *  pilulky inspired by tinder… pri dog id a community musíme tiež vymyslieť nejakú pilulku… nech to je
 *  všade rovnaké… pri AInubis chipe daj claude logo"*). 🚩 DOG ID = Instagram a COMMUNITY = Skool sú
 *  MOJ NÁVRH (profil + galéria + denník · komunita okolo jednej témy) — čaká na Matejovo OK. */
const POP_CHIPS: Record<string, { labelKey: string; name: string; href: string; icon?: string; img?: string }> = {
  dogid: { labelKey: 'onepage.apps.insp', name: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  dogtrip: { labelKey: 'onepage.apps.mapy', name: 'Mapy.com', href: 'https://mapy.com', img: '/nav-apps/mapy.svg' },
  sniffer: { labelKey: 'onepage.apps.insp', name: 'Tinder', href: 'https://tinder.com', icon: 'tinder' },
  cause: { labelKey: 'onepage.apps.insp', name: 'Skool', href: 'https://skool.com' },
  ainubis: { labelKey: 'onepage.apps.claude', name: 'Claude', href: 'https://claude.ai', icon: 'claude' },
};

const APP_CHIPS: { name: string; icon?: string }[] = [
  { name: 'Google', icon: 'google' },
  { name: 'Instagram', icon: 'instagram' },
  { name: 'Facebook', icon: 'facebook' },
  { name: 'Tinder', icon: 'tinder' },
  { name: 'Tripadvisor', icon: 'tripadvisor' },
  { name: 'AllTrails', icon: 'alltrails' },
  { name: 'Skool' },
];

const bn = (id: string, n = 4) => Array.from({ length: n }, (_, i) => `onepage.apps.${id}.b${i + 1}`);

/* SNÍMKY (Matej 5. 10. 2026) — DOG ID = stránka psa s heroglyfom (Hekthor, ostré prihlásenie; kvíz ide do detailu) · SNIFFER = len bledá
   plocha karty s logom, podnadpisom a CTA, bez tapety s heroglyfmi (*„zjednodušíme to"*) ·
   DOGTRIP = švajčiarsky výlet Seealpsee (karta + trasa na mape) · AINUBIS = VAULT a Dogscroll
   BEZ oznamu otvorenia · KOMUNITA = „100 % TRANSPARENCY" nad obrazom The Open Treasury z ústavy 10.6, zdola
   tmavý prechod so zlatým nadpisom (Matej 5. 10.: poloha B z `plany/nakres-komunita-2026-10-05/`). Zdroj a výber: `plany/nakres-clenstvo-screeny-2026-10-05/`; detailné
   slajdy sa ešte vyberajú. */
/** Poradie = poradie v karuseli. Matej: *„dog id/profil, sniffer, dogtrips,
 *  AInubis a pomoc/možnosti… celkovo 4 obrazovky"*, 27. 9. doplnená piata. */
/** Snímka z `public/images/onepage/apps/`. Pri prefotení zvýš `v` (cache — Matej: „nevidím to na lokáli"). */
const img = (f: string) => `/images/onepage/apps/${f}.webp?v=10`;
/* DETAIL = hlavná snímka z telefónu + výber z nákresu `plany/nakres-clenstvo-screeny-2026-10-05/`
   (Matej 5. 10. 2026: *„máš to vybraté — aplikuj to"*). Komunita na OSTRÝCH číslach z LIVE,
   SNIFFER s fiktívnymi ľuďmi (Eva…) a správami len na snímke. */
const APPS: AppFeature[] = [
  /* 🔁 PORADIE 5. 10. 2026 — Matej: *„na úvodnom mockupe musia byť tie najkrajšie = DOG ID
     v strede, sprava DOGTRIP, zľava AINUBIS"*. Sprava stojí nasledujúci, zľava posledný. */
  { id: 'dogid', nameKey: 'heroglyph.flow.more.dogid.t', ledeKey: 'onepage.apps.dogid.lede', bulletKeys: bn('dogid', 4), shot: img('dogid-profil'), shots: [img('dogid-profil'), img('dogid-kviz'), img('dogid-kalendar'), img('dogid-zdravie'), img('dogid-zivot-prehlad')] },
  { id: 'dogtrip', nameKey: 'heroglyph.flow.more.dogtrip.t', ledeKey: 'onepage.apps.dogtrip.lede', bulletKeys: bn('dogtrip', 4), shot: img('dogtrip-swiss'), shots: [img('dogtrip-swiss'), img('dogtrip-mapa'), img('dogtrip-clanok'), img('dogtrip-mapa-celok'), img('dogtrip-stats'), img('dogtrip-odznaky'), img('dogtrip-odznaky-parky'), img('dogtrip-pridat-2-druh'), img('dogtrip-pridat-6-o-vylete')], mapy: true },
  { id: 'sniffer', nameKey: 'heroglyph.flow.more.sniffer.t', ledeKey: 'onepage.apps.sniffer.lede', bulletKeys: bn('sniffer'), shot: img('sniffer-cisty'), shots: [img('sniffer-cisty'), img('sniffer-hladat'), img('sniffer-profil-eva'), img('sniffer-profil-eva-2'), img('sniffer-zhody')] },
  // 5/5 — Matej 27. 9.: *„komunita/pomoc… transparentná pomoc, nové výskumy —
  // to, čo členstvo vie pomáhať psom"*. Detail = text „VYŠŠÍ CIEĽ" z heroflowu.
  { id: 'cause', nameKey: 'onepage.apps.cause.name', ledeKey: 'onepage.apps.cause.lede', bulletKeys: bn('cause'), shot: img('komunita-transparency'), shots: [img('komunita-transparency'), img('kom-pokladnica'), img('kom-svet')] },
  { id: 'ainubis', nameKey: 'heroglyph.flow.more.ainubis.t', ledeKey: 'onepage.apps.ainubis.lede', bulletKeys: bn('ainubis'), shot: img('ainubis-vault-bez-oznamu'), shots: [img('ainubis-vault-bez-oznamu'), img('ainubis-dogscroll'), img('ainubis-zvitok-podcast'), img('ainubis-zvitok-prepis'), img('ainubis-zvitok-text')], claude: true },
];

/** Dráha ODCHODU HEROGLYPHu a príchodu telefónov (prvý ťah) vo `vh`. Oblúk
 *  si o toľko predĺži výdrž (OnePage `ARC_HOLD2_VH`), aby stál, kým sa to deje. */
export const APPS_OUT_VH = 100;
/** Dráha ODCHODU javiska (zhasne na mieste, pod ním nabehnú hviezdy) vo `vh`. */
export const APPS_EXIT_VH = 30;
/** Dráha sekcie vo `vh`: obrazovka javiska + príchod + posun doprava + odchod. */
export const APPS_VH = 100 + APPS_OUT_VH + 100 + APPS_EXIT_VH;
const TRACK_VH = APPS_VH - 100;
/** Bod „telefóny do polovice" (podiel dráhy) — motor ním len prejde. */
const PEEK = APPS_OUT_VH / TRACK_VH;
const STEP = 100 / TRACK_VH;
/** Zastávka „funkcia vľavo, telefóny vpravo". */
const FEAT = PEEK + STEP;
/** Zastávky motora na dráhe. 🔴 PEEK JE ZNOVA ZASTÁVKA (Matej 28. 9. 2026,
 *  večer: *„po slajde s heroglyfom zostane snipnutý najprv obraz, kde je
 *  nadpis členstvo a 3 telefóny dolu, až následný slajd posunie telefóny
 *  doprava a text doľava"*). Ranný „jeden ťah" tým padol. */
export const APPS_STOPS = [PEEK, FEAT];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const NARROW = 768;
/** Šírka rámu z komponentu (useIsMobile: < 768 ⇒ 280). */
const phoneW = () => (window.innerWidth < NARROW ? 280 : 350);

export default function FilmApps({ onPopup }: { onPopup?: (open: boolean) => void }) {
  const t = useT();
  const secRef = useRef<HTMLElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  /** Snímok slideru v DETAILE. */
  const [slide, setSlide] = useState(0);
  const swipeX = useRef<number | null>(null);
  /** Telefón vpredu (index do APPS). */
  const [idx, setIdx] = useState(0);
  /** Úvodný stav (nadpis + telefóny do polovice) — len tu sa točia samé. */
  const [peek, setPeek] = useState(true);
  const [shown, setShown] = useState(false);
  const [hover, setHover] = useState(false);
  const n = APPS.length;

  useEffect(() => { onPopup?.(open != null); }, [open, onPopup]);
  useEffect(() => { setSlide(0); }, [open]);
  const slideCount = open != null ? Math.max(1, APPS[open].shots.length || 3) : 1;
  const moveSlide = useCallback((d: number) => setSlide((i) => (i + d + slideCount) % slideCount), [slideCount]);
  /** Stred telefónu v karte DETAILU → `--sl-mid` (šípky na krajoch v jeho výške, mobil). */
  const popRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const card = popRef.current;
    const sl = card?.querySelector<HTMLElement>('.op-apps-sl');
    if (!card || !sl) return;
    const put = () => card.style.setProperty('--sl-mid', `${(sl.offsetTop + sl.offsetHeight / 2).toFixed(1)}px`);
    put();
    const ro = new ResizeObserver(put);
    ro.observe(card); ro.observe(sl);
    return () => ro.disconnect();
  }, [open]);
  const moveApp = useCallback((d: number) => {
    setOpen((o) => {
      if (o == null) return o;
      const nx = (o + d + n) % n;
      setIdx(nx);
      return nx;
    });
  }, [n]);
  /* ŠVIH PRSTOM V DETAILE (Matej 5. 10. 2026: *„popup umožní slajdovať prstom"* → *„slajd nefunguje
     na popupe, len na mockupy"* → *„ak slajdujem na ploche pod obrázkom, aj tak sa posúva obrázok
     mockupu a nie celá karta 1/5"*): ťah PO TELEFÓNE = ďalšia snímka, ťah KDEKOĽVEK INDE na karte
     = ďalšia FUNKCIA (ako zlaté šípky). React onPointerUp na karte v Safari
     na iPhone nedošiel — preto natívne TOUCH udalosti (prst) a pointer len pre myš, pustenie
     sa chytá na okne ako pri karuseli. Zvislý ťah sa ignoruje. */
  useEffect(() => {
    const card = popRef.current;
    if (!card) return;
    const MIN = 40;
    let x0: number | null = null, y0 = 0, onShot = false;
    const end = (x: number, y: number) => {
      if (x0 == null) return;
      const dx = x - x0, dy = y - y0;
      x0 = null;
      if (Math.abs(dx) >= MIN && Math.abs(dx) > Math.abs(dy) * 1.2) (onShot ? moveSlide : moveApp)(dx < 0 ? 1 : -1);
    };
    // Matej 6. 10. 2026: *„swajp do strany v hornej polovici bloku, kde je obrázok, swajpuje mockupy
    // a v spodnej časti swajpuje celé bloky 1/5"* → celá plocha s obrázkom (aj vedľa telefónu) = snímky.
    // Mobil = jeden stĺpec → zóna je celý pás nad spodnou hranou obrázku (aj vedľa telefónu a v
    // okraji karty); PC = dva stĺpce → zóna je ľavý stĺpec s obrázkom.
    const shotHit = (t: EventTarget | null, y: number) => {
      const shot = card.querySelector<HTMLElement>('.op-apps-pop-shot');
      if (!shot) return false;
      if (shot.offsetWidth > card.clientWidth * 0.6) return y <= shot.getBoundingClientRect().bottom;
      return !!(t as Element | null)?.closest?.('.op-apps-pop-shot');
    };
    const ts = (e: TouchEvent) => { const t0 = e.touches[0]; x0 = t0.clientX; y0 = t0.clientY; onShot = shotHit(e.target, t0.clientY); };
    const te = (e: TouchEvent) => { const t1 = e.changedTouches[0]; end(t1.clientX, t1.clientY); };
    const tc = () => { x0 = null; };
    const pd = (e: PointerEvent) => { if (e.pointerType === 'mouse') { x0 = e.clientX; y0 = e.clientY; onShot = shotHit(e.target, e.clientY); } };
    const pu = (e: PointerEvent) => { if (e.pointerType === 'mouse') end(e.clientX, e.clientY); };
    card.addEventListener('touchstart', ts, { passive: true });
    card.addEventListener('touchend', te);
    card.addEventListener('touchcancel', tc);
    card.addEventListener('pointerdown', pd);
    window.addEventListener('pointerup', pu);
    return () => {
      card.removeEventListener('touchstart', ts);
      card.removeEventListener('touchend', te);
      card.removeEventListener('touchcancel', tc);
      card.removeEventListener('pointerdown', pd);
      window.removeEventListener('pointerup', pu);
    };
  }, [open, moveSlide, moveApp]);
  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      else if (e.key === 'ArrowLeft') moveSlide(-1);
      else if (e.key === 'ArrowRight') moveSlide(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, moveSlide]);

  // Samé točenie á 3 s — ako komponent, ale len v úvodnom stave a keď je vidieť.
  useEffect(() => {
    if (!peek || !shown || hover || open != null) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % n), 3000);
    return () => clearInterval(id);
  }, [peek, shown, hover, open, n]);

  /** Prepni na funkciu i — len karusel a text vľavo, stránka stojí. */
  const goTo = useCallback((i: number) => {
    setIdx(((i % n) + n) % n);
  }, [n]);
  /* ŠVIH PRSTAMI — mobil aj PC (Matej 5. 10. 2026: *„prepínať by sa malo dať aj slajdom
     prstami na mobile aj na PC"*). Dotyk a myš = ťah po telefónoch (pointer), PC touchpad =
     vodorovné koliesko (deltaX). Vodorovný ťah si karusel nechá — motor filmu ho nedostane
     (`stopPropagation`) a Chrome z neho neurobí „späť" v histórii (`preventDefault`). */
  const carRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  useEffect(() => {
    const el = carRef.current;
    if (!el) return;
    const MIN = 40;
    let x0: number | null = null, y0 = 0;
    const down = (e: PointerEvent) => { x0 = e.clientX; y0 = e.clientY; dragged.current = false; };
    const up = (e: PointerEvent) => {
      if (x0 == null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) >= MIN && Math.abs(dx) > Math.abs(dy) * 1.2) {
        dragged.current = true;
        setIdx((i) => (((i + (dx < 0 ? 1 : -1)) % n) + n) % n);
      }
    };
    let acc = 0, last = 0, fired = false;
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); e.stopPropagation();
      const now = performance.now();
      if (now - last > 250) { acc = 0; fired = false; }
      last = now;
      acc += e.deltaX;
      if (fired || Math.abs(acc) < 50) return;
      fired = true;
      setIdx((i) => (((i + (acc > 0 ? 1 : -1)) % n) + n) % n);
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      el.removeEventListener('wheel', wheel);
    };
  }, [n]);
  /** Z úvodu do funkcií sa vždy vchádza na 1/5 (DOG ID). */
  const wasPeek = useRef(true);

  useEffect(() => {
    const sec = secRef.current;
    const rig = rigRef.current;
    if (!sec || !rig) return;
    const arc = document.querySelector<HTMLElement>('.op-arc');
    const root = document.querySelector<HTMLElement>('.op-root');
    let raf = 0;
    let lastP = -1;
    const apply = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight, vw = window.innerWidth;
      const p = clamp01(-r.top / Math.max(1, sec.offsetHeight - vh));
      if (Math.abs(p - lastP) < 0.0003) return;
      lastP = p;
      // Príchod: HEROGLYPH zhasne, telefóny vyjdú zdola do polovice.
      // Dva texty naraz sa nečítajú ako prelínačka, ale ako chyba — preto
      // HEROGLYPH zhasne v prvej polovici ťahu a nový obsah vyjde v druhej.
      const k = clamp01(p / PEEK);
      const out = smooth(clamp01(k / 0.5));
      const rise = smooth(clamp01((k - 0.4) / 0.6));
      // Posun telefónov doprava (a nábeh ľavého stĺpca).
      const sx = smooth(clamp01((p - PEEK) / STEP));
      sec.style.setProperty('--r', rise.toFixed(4));
      sec.style.setProperty('--sx', sx.toFixed(4));
      sec.style.setProperty('--o', out.toFixed(4));
      arc?.style.setProperty('--apps-out', out.toFixed(4));

      // POLOHA SÚPRAVY — rovnicou z okna, nie meraním po vykreslení.
      const navH = parseFloat(root ? getComputedStyle(root).getPropertyValue('--op-nav-h') : '') || 124;
      const w = phoneW(), h = w * IPHONE_H / IPHONE_W;
      const narrow = vw < NARROW;
      // Úvod: plná veľkosť komponentu, horná hrana v polovici okna.
      const peekY = vh * 0.5 + h / 2;
      // Funkcia: PC napravo a celé vidieť; mobil pod textom, menšie.
      // CTL = rezerva pod telefónom pre tlačidlá (40 + medzery), v mierke.
      const CTL = 72;
      const fs = narrow ? Math.min(0.62, (vh * 0.4) / (h + CTL)) : Math.min(1, (vh - navH - 24) / (h + CTL));
      const featX = narrow ? 0 : Math.min(vw * 0.22, 300);
      const featY = narrow ? vh - 16 - ((h / 2 + CTL) * fs) : navH + (vh - navH - CTL * fs) / 2 + 8;
      const x = mix(0, featX, sx);
      const y = mix(peekY, featY, sx) + (1 - rise) * vh;
      const s = mix(1, fs, sx);
      sec.style.setProperty('--rig-s', s.toFixed(4));
      rig.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(4)})`;
      // Ľavý stĺpec stojí na strede PREDNÉHO telefónu — výškou sa do neho zmestí.
      sec.style.setProperty('--mid', `${(narrow ? navH + (vh - navH) / 2 : featY).toFixed(1)}px`);
      sec.style.setProperty('--phh', `${(h * fs).toFixed(1)}px`);
      // Mobil: pás pre text = od lišty po hornú hranu telefónu (bez rezervy šípok), text v jeho strede.
      sec.style.setProperty('--colt', `${(navH + 8).toFixed(1)}px`);
      sec.style.setProperty('--colh', `${Math.max(0, featY - (h / 2) * fs - 16 - navH - 8).toFixed(1)}px`);

      // Odchod: javisko zhasne na mieste, pod ním nabiehajú hviezdy.
      // Zhasne v PRVEJ polovici odchodu — hviezdy nabiehajú až v druhej
      // (dva texty naraz sa nečítajú ako prelínačka, ale ako chyba).
      const exit = smooth(clamp01((p - FEAT) / Math.max(0.001, (1 - FEAT) * 0.5)));
      sec.style.setProperty('--x', exit.toFixed(4));
      sec.toggleAttribute('data-gone', exit > 0.5);

      const isPeek = p < PEEK + STEP * 0.5;
      setPeek(isPeek);
      sec.toggleAttribute('data-peek', isPeek);
      setShown(rise > 0.9);
      if (wasPeek.current && !isPeek) setIdx(0);
      wasPeek.current = isPeek;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener('scroll', on, { passive: true });
    const onResize = () => { lastP = -1; on(); };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', onResize);
    };
  }, [n]);

  const cur = open != null ? APPS[open] : null;
  const prevI = (idx - 1 + n) % n, nextI = (idx + 1) % n;

  return (
    <section ref={secRef} className="op-scene op-apps" aria-label={t('onepage.apps.head')}
      style={{ height: `${APPS_VH}lvh`, marginTop: `-${100 + APPS_OUT_VH}lvh` }}>
      <div className="op-apps-stage">
        <div className="op-apps-hero">
          <h2 className="op-apps-h2">{t('onepage.apps.head')}</h2>
          {/* JEDNA VETA, MAX 2 RIADKY V KAŽDOM JAZYKU (Matej 5. 10. 2026: *„tento texting je zlý,
              musí byť v každom jazyku na max 2 riadky — nie 4"* + návrh *„We create a dog world,
              a helpful and entertaining ecosystem for all doglovers"*). Dve vety (`sub2`) zanikli. */}
          <p className="op-apps-sub">{t('onepage.apps.sub1')}</p>
          {/* APPKY, KTORÉ DOGYPT STELESŇUJE (Matej 6. 10. 2026: *„chipy ako príklad — google, instagram,
              tripadvisor, skool, alltrails… one app with the best from … in dogfriendly world"*).
              Len textové pilulky — cudzie logá v kite nemáme. */}
          <p className="op-apps-lead">{t('onepage.apps.chips.lead')}</p>
          {/* PC: nekonečný horizontálny pás (Matej 6. 10. 2026: *„pri chipoch s appkami infinity scrolling
              horizontálny"*). Zoznam je v DOM dvakrát; kópia je len dekorácia (aria-hidden) a na mobile
              sa skrýva — tam chipy ostávajú ako zalomený rad. */}
          <div className="op-apps-marq">
            <ul className="op-apps-chips">
              {[0, 1].map((copy) => (
                <Fragment key={copy}>
                  {APP_CHIPS.map((c) => (
                    <li key={c.name} className={copy ? 'op-apps-clone' : undefined} aria-hidden={copy ? true : undefined}>
                      {c.icon && <i style={{ ['--m' as string]: `url(/icons/brands/${c.icon}.svg)` }} aria-hidden />}
                      {c.name}
                    </li>
                  ))}
                  <li className={`op-apps-chip-more${copy ? ' op-apps-clone' : ''}`} aria-hidden={copy ? true : undefined}>{t('onepage.apps.chips.more')}</li>
                </Fragment>
              ))}
            </ul>
          </div>
          <p className="op-apps-lead op-apps-tail">{t('onepage.apps.chips.tail')}</p>
        </div>

        <div className="op-apps-col">
          {APPS.map((a, i) => (
            <div className={`op-apps-txt${!peek && i === idx ? ' is-on' : ''}`} key={a.id} aria-hidden={peek || i !== idx}>
              <p className="op-apps-eye">{t('onepage.apps.head')} · {i + 1}/{n}</p>
              <h3 className="op-apps-name">{t(a.nameKey)}</h3>
              <p className="op-apps-lede">{t(a.ledeKey)}</p>
              <button type="button" className="dgx-example op-apps-chip" onClick={() => setOpen(i)}>
                {t('onepage.apps.more')}
              </button>
            </div>
          ))}
        </div>

        <div className="op-apps-rig" ref={rigRef}>
          <div className="op-apps-car" ref={carRef} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            {APPS.map((a, i) => {
              const pos = i === idx ? 'is-cur' : i === prevI ? 'is-prev' : i === nextI ? 'is-next' : 'is-off';
              return (
                <div className={`op-apps-ph ${pos}`} key={a.id} aria-hidden={i !== idx}
                  /* Ťuk na PREDNÝ telefón = DETAIL, to isté ako tlačidlo DETAIL (Matej 5. 10. 2026:
                     *„po kliknutí na obrazovku sa otvorí detail"*). Bočný telefón ostáva prepnutím. */
                  onClick={() => {
                    if (dragged.current) { dragged.current = false; return; } /* koniec švihu nie je ťuk */
                    if (pos === 'is-prev' || pos === 'is-next') goTo(i);
                    else if (pos === 'is-cur') setOpen(i);
                  }}>
                  <div className="op-apps-tilt">
                    <Iphone15Pro src={a.shot} alt={t(a.nameKey)} imgProps={filmDefer()}>
                      <div className="op-apps-ph-empty"><b>{t(a.nameKey)}</b><span>screenshot</span></div>
                    </Iphone15Pro>
                  </div>
                </div>
              );
            })}
          </div>
          {/* „KLIKNI NA MOCKUP“ (Matej 6. 10. 2026: *„text na krivo s kreslenou šípkou nad telefónmi
              zasahujúcou do telefónu"*). Sedí v súradniciach súpravy (roh predného telefónu), takže
              ide s ním; mierka sa vracia späť, nech písmo ostane čitateľné. Len mobil. */}
          <div className="op-apps-hint" aria-hidden="true" style={{ ['--ph-h' as string]: `${(280 * IPHONE_H / IPHONE_W).toFixed(1)}px` } as CSSProperties}>
            <span>{t('onepage.apps.tap')}</span>
            <svg viewBox="0 0 96 72" width="96" height="72" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <g className="halo" stroke="#FBF5E6" strokeWidth="6.5">
                <path d="M6 8 C 40 -2, 80 10, 76 56" />
                <path d="M62 44 C 68 50, 74 55, 77 60 C 80 54, 84 48, 90 42" />
              </g>
              <path d="M6 8 C 40 -2, 80 10, 76 56" />
              <path d="M62 44 C 68 50, 74 55, 77 60 C 80 54, 84 48, 90 42" />
            </svg>
          </div>
          <div className="op-apps-ctl">
            {/* Šípky = brandová kresba (HandArrowLeft, pravá zrkadlená). Pauza
                z komponentu tu NIE JE — kresba v kite chýba (check:ikony) a točenie
                aj tak stojí, keď je nad telefónmi myš. */}
            <button type="button" aria-label={t('heroglyph.flow.more.prev')} onClick={() => goTo(idx - 1)}><HandArrowLeft size={24} /></button>
            <button type="button" aria-label={t('heroglyph.flow.more.next')} onClick={() => goTo(idx + 1)}><HandArrowLeft size={24} style={{ transform: 'scaleX(-1)' }} /></button>
          </div>
        </div>
      </div>

      {/* Portál do body — sekcia má vlastný z-index (vrstvenie filmu), popup
          v nej by ostal POD horným navom. */}
      {cur && createPortal(
        <div className="op-alba" role="dialog" aria-modal="true" aria-label={t(cur.nameKey)} data-film-free onClick={() => setOpen(null)}>
          <div ref={popRef} className="op-alba-card op-apps-pop" onClick={(e) => e.stopPropagation()}
>
            {/* ŠÍPKY NA KRAJI KARTY = ĎALŠIA FUNKCIA (Matej 5. 10. 2026: *„daj aj šípky na jeho kraj,
                aby si človek mohol pozrieť detaily bez toho, aby sa neustále vracal na stránku
                a klikal na mockupy"*). Šípky vnútri (pri telefóne) listujú SNÍMKY jednej funkcie;
                tieto na okraji karty listujú FUNKCIE — preto iný tvar (zlatý rám = navigácia,
                „kde som") a iné miesto. Karusel za popupom ide s nimi, nech po zatvorení stojí
                človek na funkcii, ktorú práve čítal. */}
            {/* KRÍŽIK LEN NA MOBILE (Matej 5. 10. 2026, nad popupom na iPhone: *„a tu by som možno dal
                aj krížik"*) — novší pokyn prebíja 28. 9. len tu: na mobile niet „kliku mimo karty"
                (karta je cez celé okno) ani Esc. Kresba z kitu (`cross.svg`), nie znak ×. PC ostáva bez. */}
            <button type="button" className="op-apps-pop-x" aria-label={t('nav.aria.close')} onClick={() => setOpen(null)}>
              <i aria-hidden="true" />
            </button>
            {/* Bez krížika (Matej 28. 9. 2026: *„na webe nechceme krížiky"*) — zatvára klik mimo karty a Esc.
                Tlačidlo bez štýlu tu prežilo a v mriežke popupu si vzalo vlastnú bunku (karta 973 px). */}
            {/* MOCKUP NA JEDNEJ STRANE, TEXT NA DRUHEJ (Matej 5. 10. 2026: *„pri popupe by som
                dal mockup na jednu stranu a text na druhú"*). Mobil: pod sebou. */}
            <div className="op-apps-pop-shot">
            {/* SLIDER — screenshoty konkrétnej funkcie v ráme telefónu. */}
            <div className="op-apps-sl">
              <button type="button" className="op-apps-sl-btn is-l" aria-label={t('onepage.apps.prev')} onClick={() => moveSlide(-1)}>
                <HandArrowLeft size={18} />
              </button>
              <div className="op-apps-sl-view">
                <div className="op-apps-sl-track" style={{ transform: `translateX(${-slide * 100}%)` }}>
                  {Array.from({ length: slideCount }, (_, i) => (
                    <div className="op-apps-sl-item" key={i} aria-hidden={i !== slide}>
                      <Iphone15Pro src={cur.shots[i]} alt={`${t(cur.nameKey)} ${i + 1}`} imgProps={filmDefer()}>
                        <div className="op-apps-ph-empty"><b>{t(cur.nameKey)}</b><span>screenshot {i + 1}</span></div>
                      </Iphone15Pro>
                    </div>
                  ))}
                </div>
              </div>
              <button type="button" className="op-apps-sl-btn is-r" aria-label={t('onepage.apps.next')} onClick={() => moveSlide(1)}>
                <HandArrowLeft size={18} style={{ transform: 'scaleX(-1)' }} />
              </button>
            </div>
            <div className="op-apps-sl-dots">
              {Array.from({ length: slideCount }, (_, i) => (
                <button type="button" key={i} className={i === slide ? 'is-on' : ''} aria-label={`${i + 1}`} onClick={() => setSlide(i)} />
              ))}
            </div>
            </div>
            <div className="op-apps-pop-txt">
              {/* Šípky funkcií sedia v riadku NADPISU (Matej 6. 10. 2026: *„šípky daj nižšie do úrovne
                  nadpisu, menšie a lapisom"*). Na PC ostávajú absolútne na kraji karty (rodič nie je positioned). */}
              <div className="op-apps-pop-head">
                <h2 className="op-apps-name">{t(cur.nameKey)}</h2>
                <span className="op-apps-pop-navs">
                  <button type="button" className="op-apps-pop-nav is-l" aria-label={t(APPS[(open! - 1 + n) % n].nameKey)} onClick={() => moveApp(-1)}>
                    <HandArrowLeft size={20} />
                  </button>
                  <button type="button" className="op-apps-pop-nav is-r" aria-label={t(APPS[(open! + 1) % n].nameKey)} onClick={() => moveApp(1)}>
                    <HandArrowLeft size={20} style={{ transform: 'scaleX(-1)' }} />
                  </button>
                </span>
              </div>
              <p className="op-apps-lede">{t(cur.ledeKey)}</p>
              {/* ČIP MAPY.COM (Matej 5. 10. 2026: *„dal by som logo mapy cz alebo chip… nech to má
                  lepšiu relevantnosť"*). Logo je to isté ako vo „Vyraziť na miesto" (`/nav-apps/mapy.svg`). */}
              <div className="op-apps-pop-chip">
              {POP_CHIPS[cur.id] && (() => { const c = POP_CHIPS[cur.id]; return (
                <a className="op-apps-mapy" href={c.href} target="_blank" rel="noopener noreferrer">
                  <span>{t(c.labelKey)}</span>
                  {c.img && <img src={c.img} alt="" width={20} height={20} />}
                  {c.icon && <i style={{ ['--m' as string]: `url(/icons/brands/${c.icon}.svg)` }} aria-hidden />}
                  <b>{c.name}</b>
                </a>
              ); })()}
              </div>
              <ul className="op-apps-ul">
                {cur.bulletKeys.map((k, j) => (
                  <li key={k} style={{ ['--i' as string]: j } as CSSProperties}>
                    <i className="op-apps-dot" aria-hidden="true" />{t(k)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>,
        document.body,
      )}

      <style>{`
        /* 🔴 SEKCIA NECHYTÁ KLIKY (Matej 28. 9.: *„na tejto stránke nejde klikať
           na ikonky ani na chip"*). Je zasunutá pod koniec oblúka, takže jej
           prázdny obal leží nad dopísaným DOGTRIXom. Kliky chytajú len prvky,
           ktoré ich majú povolené samy (karusel, šípky, text funkcie). */
        .op-apps { position: relative; z-index: 3; pointer-events: none; }
        /* Obsah oblúka (DOGTRIX) zhasína, kým vychádzajú telefóny. */
        .op-arc .op-arc-stage { opacity: calc(1 - var(--apps-out, 0)); }
        .op-apps-stage {
          position: sticky; top: 0; height: 100lvh; overflow: hidden;
          pointer-events: none;
          opacity: calc(1 - var(--x, 0));
        }
        .op-apps[data-gone] .op-apps-stage * { pointer-events: none !important; }
        /* Papyrus javiska nabieha s odchodom HEROGLYPHu — keď oblúk odíde, drží obraz on. */
        .op-apps-stage::before {
          content: ''; position: absolute; inset: 0;
          background: ${LAB.pageBg}; background-image: ${LAB.pageBackdrop};
          opacity: var(--o, 0);
        }
        .op-apps-hero {
          position: absolute; left: 16px; right: 16px; bottom: calc(50lvh + 32px);
          text-align: center;
          opacity: calc(var(--r, 0) * (1 - var(--sx, 0)));
          transform: translateY(calc((1 - var(--r, 0)) * 32px - var(--sx, 0) * 24px));
        }
        .op-apps-lead {
          margin: 16px auto 0; max-width: 640px;
          font: 500 14px/1.4 'Space Grotesk', sans-serif; color: rgba(35,22,8,.7);
        }
        .op-apps-tail { margin-top: 8px; }
        /* PILULKA — štítok (PACK_BLOCKS): zlatý obrys = konštrukcia, nie akcia; text, nie logo. */
        .op-apps-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 12px auto 0; padding: 0; list-style: none; max-width: 640px; }
        .op-apps-chips li {
          padding: 4px 12px; border-radius: 999px; border: 1px solid rgba(201,154,63,.6); background: rgba(255,255,255,.55);
          font: 600 12px/1 'Space Grotesk', sans-serif; letter-spacing: .02em; color: ${LAB.ink};
          display: inline-flex; align-items: center; gap: 6px;
        }
        .op-apps-chips li i {
          width: 14px; height: 14px; flex: 0 0 auto; background: currentColor;
          -webkit-mask: var(--m) center / contain no-repeat; mask: var(--m) center / contain no-repeat;
        }
        .op-apps-clone { display: none !important; }
        .op-apps-chips li.op-apps-chip-more { border-style: dashed; background: transparent; font-weight: 500; font-style: italic; }
        /* PC sa nemení (Matej ladí mobil) — pilulky a „klikni“ len do 767 px. */
        /* PC = TO ISTÉ, ČO MOBIL (Matej 6. 10. 2026: *„chipy daj aj na PC… obsah, ktorý sme doplnili,
           by mal byť aj na PC"*): veta „Jedna appka…", pilulky a „— pre svet priateľský k psom".
           Veta sub1 ustupuje ako na mobile (nesie ju veta nad pilulkami). „klikni“ ostáva len mobilu —
           na PC je pri funkcii tlačidlo DETAIL. */
        .op-apps-hint, .op-apps-sub { display: none; }
        @media (min-width: 768px) {
          .op-apps-lead { font-size: 16px; }
          .op-apps-marq {
            width: min(1040px, 92vw); margin: 12px auto 0; overflow: hidden;
            -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
            mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          }
          .op-apps-chips {
            flex-wrap: nowrap; justify-content: flex-start; width: max-content; max-width: none; margin: 0;
            padding: 0 8px 0 0; animation: opAppsMarq 38s linear infinite;
          }
          .op-apps-chips li { flex: none; white-space: nowrap; }
          .op-apps-chips li.op-apps-clone { display: inline-flex !important; }
          .op-apps-marq:hover .op-apps-chips { animation-play-state: paused; }
          @keyframes opAppsMarq { to { transform: translateX(-50%); } }
          @media (prefers-reduced-motion: reduce) { .op-apps-chips { animation: none; } }
          .op-apps-chips li { padding: 6px 16px; font-size: 14px; }
          .op-apps-chips li i { width: 16px; height: 16px; }
        }
        .op-apps-sub {
          margin: 16px auto 0; max-width: 640px;
          font: 400 clamp(14px, 1.4vw, 20px)/1.5 'Space Grotesk', sans-serif; color: ${LAB.ink};
        }
        /* Zlatá čiara pod nadpisom — tá istá ako pod VÍZIOU (.vhero-h2::after,
           Matej 27. 9.: *„pod nadpis dať čiaru ako je pod víziou"*). */
        .op-apps-h2::after, .op-apps-name::after {
          content: ''; position: absolute; bottom: 0; height: 2px;
          background: linear-gradient(90deg, rgba(201,154,63,0) 0%, rgba(201,154,63,.85) 22%, rgba(201,154,63,.85) 78%, rgba(201,154,63,0) 100%);
        }
        .op-apps-h2::after { left: 50%; transform: translateX(-50%); width: min(220px, 60%); }
        .op-apps-h2 {
          position: relative; padding-bottom: 16px;
          margin: 0; text-align: center;
          font: 700 clamp(24px, 4.2vw, 56px)/1.1 'Cinzel', serif; letter-spacing: .06em; text-transform: uppercase;
          background: linear-gradient(90deg, #8A6420, #C99A3F 30%, #E8C35A 50%, #C99A3F 70%, #8A6420);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        /* Súprava: bod (0,0) = stred predného telefónu; polohu píše réžia. */
        .op-apps-rig {
          position: absolute; left: 50%; top: 0; width: 0; height: 0;
          transform-origin: 0 0; will-change: transform;
        }
        .op-apps-car { position: absolute; left: 0; top: 0; pointer-events: auto; }
        /* Karusel = komponent phone-mockups-1: bočné ±60 %, ×0,9, krytie .3, 700 ms. */
        .op-apps-ph {
          position: absolute; left: 0; top: 0; width: 350px;
          transition: transform .7s ease-in-out, opacity .7s ease-in-out;
          transform: translate(-50%, -50%) scale(.9);
          opacity: 0; z-index: 0;
        }
        .op-apps-ph.is-cur { transform: translate(-50%, -50%); opacity: 1; z-index: 20; cursor: pointer; }
        .op-apps-ph.is-prev { transform: translate(-50%, -50%) translateX(-60%) scale(.9); opacity: .3; z-index: 10; cursor: pointer; }
        .op-apps-ph.is-next { transform: translate(-50%, -50%) translateX(60%) scale(.9); opacity: .3; z-index: 10; cursor: pointer; }
        .op-apps-ph.is-prev:hover, .op-apps-ph.is-next:hover { opacity: .5; }
        .op-apps-tilt { transition: transform .1s; }
        .op-apps-ph.is-cur:hover .op-apps-tilt { transform: scale(1.05) rotate(-6deg); }
        .op-apps-ph-empty {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 8px;
          background: ${LAB.pageBg}; background-image: ${LAB.pageBackdrop};
        }
        .op-apps-ph-empty b { font: 700 24px/1.2 'Cinzel', serif; letter-spacing: .14em; color: #8A6420; }
        .op-apps-ph-empty span {
          font: 500 10px/1 'Space Grotesk', sans-serif; letter-spacing: .22em; text-transform: uppercase;
          color: rgba(35,22,8,.45);
        }
        /* ŠÍPKY V STREDE VÝŠKY, PO BOKOCH PREDNÉHO TELEFÓNU, VÄČŠIE (Matej 5. 10. 2026:
           *„šípky by som dal do stredu mockupov a vedľa a väčšie"*). Dovtedy 40 px pod
           telefónom. Bod (0,0) súpravy = stred predného telefónu; šípka sedí na jeho hrane
           + 40 px, na mobile ju drží okraj okna (16 px vzduchu). Na PC stoja za bočnými telefónmi. */
        .op-apps-ctl {
          position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none;
          opacity: var(--r, 0);
          /* MIMO OBRAZOVIEK (Matej 5. 10.: „tie šípky daj vedľa, mimo obrazoviek"): bočný telefón
             končí na 60 % × 350 + 350 × 0,9 / 2 = 367,5 px od stredu; šípka (56) za ním + 16 px. */
          --arr-x: 412px;
        }
        .op-apps-ctl button {
          position: absolute; top: 0; pointer-events: auto;
          width: 56px; height: 56px; border-radius: 999px; display: grid; place-items: center; cursor: pointer;
          background: rgba(0,0,0,.6); border: 1px solid rgba(255,255,255,.2); color: #fff;
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,.2); transition: background .2s;
          z-index: 30;
        }
        .op-apps-ctl button:first-child { transform: translate(calc(-1 * var(--arr-x) - 50%), -50%); }
        .op-apps-ctl button:last-child { transform: translate(calc(var(--arr-x) - 50%), -50%); }
        .op-apps-ctl button:hover { background: rgba(0,0,0,.8); }
        .op-apps-ctl svg { width: 24px; height: 24px; fill: currentColor; }
        .op-apps-car { touch-action: pan-y; user-select: none; -webkit-user-select: none; }
        /* Bez toho myš „chytí" obrázok (natívny drag) a pointerup nepríde — ťah by nič neprepol. */
        .op-apps-car img { -webkit-user-drag: none; user-drag: none; pointer-events: none; }
        /* Ľavý stĺpec — texty funkcií stoja na sebe, vymenia sa s telefónom (700 ms). */
        .op-apps-col {
          position: absolute; left: max(16px, calc(50vw - 560px)); width: min(440px, 40vw);
          top: var(--mid, 50%);
          opacity: var(--sx, 0);
        }
        .op-apps-txt {
          position: absolute; left: 0; right: 0; top: 0; transform: translateY(-50%);
          opacity: 0; visibility: hidden; pointer-events: none;
          transition: opacity .7s ease-in-out, visibility .7s;
        }
        .op-apps-txt.is-on { opacity: 1; visibility: visible; pointer-events: auto; }
        .op-apps-eye {
          margin: 0 0 8px; font: 500 11px/1.4 'Space Grotesk', sans-serif; letter-spacing: .22em;
          text-transform: uppercase; color: rgba(35,22,8,.6);
        }
        /* Pri nadpise zarovnanom doľava čiara vychádza z plnej zlatej a doznieva. */
        .op-apps-name::after {
          left: 0; width: min(200px, 70%);
          background: linear-gradient(90deg, rgba(201,154,63,.9) 0%, rgba(201,154,63,.85) 55%, rgba(201,154,63,0) 100%);
        }
        .op-apps-name {
          position: relative; padding-bottom: 16px;
          margin: 0 0 8px; white-space: nowrap; font: 700 clamp(24px, 3vw, 40px)/1.1 'Cinzel', serif; letter-spacing: .06em; color: #8A6420;
        }
        /* ODRÁŽKY = RIADKY (Matej 27. 9.: *„zatraktívni… urob tam riadky,
           pulzujúce odrážky, skrátka nejak to oživiť"*). Deliace čiary ako vo
           VÍZII, bod = lapisová bodka s vlnou (hotspot DOGTRIXu), riadky
           nabehnú postupne, keď sa slajd rozsvieti. */
        .op-apps-ul { margin: 0 0 24px; padding: 0; list-style: none; font: 400 16px/1.5 'Space Grotesk', sans-serif; color: ${LAB.ink}; }
        /* Odrážka = JEDEN riadok — zalomenie by rozhodilo výšku slajdov. */
        .op-apps-ul li {
          position: relative; display: flex; align-items: center; gap: 16px;
          padding: 12px 0; white-space: nowrap;
          border-bottom: 1px solid rgba(201,154,63,.35);
          opacity: 0; transform: translateX(-16px);
          transition: opacity .5s ease, transform .5s ease;
          transition-delay: calc(var(--i, 0) * 110ms + 150ms);
        }
        .op-apps-pop .op-apps-ul li { animation: opAppsLi .5s ease both; animation-delay: calc(var(--i, 0) * 110ms + 250ms); }
        @keyframes opAppsLi { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: none; } }
        .op-apps-dot {
          position: relative; flex: none; width: 8px; height: 8px; border-radius: 999px;
          background: ${LAPIS.edge}; box-shadow: 0 0 0 2px #FBF5E6;
        }
        .op-apps-dot::after {
          content: ''; position: absolute; inset: -4px; border-radius: inherit;
          border: 1.5px solid rgba(22,48,122,.55);
          animation: opAppsDot 2.4s ease-out infinite;
          animation-delay: calc(var(--i, 0) * .6s);
        }
        @keyframes opAppsDot {
          0% { transform: scale(.6); opacity: .9; }
          70%, 100% { transform: scale(2.2); opacity: 0; }
        }
        .op-apps-ul li:hover .op-apps-dot { background: #2A4CA8; }
        .op-apps .op-apps-chip { margin: 0; }
        /* 1–2 vety pod nadpisom (vľavo aj v DETAILE). */
        .op-apps-lede { margin: 0 0 24px; max-width: 440px; font: 400 16px/1.55 'Space Grotesk', sans-serif; color: ${LAB.ink}; }
        /* Popup — plášť je .op-alba z OnePage. PC: telefón vľavo, text vpravo. */
        .op-apps-pop { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 48px; align-items: center; text-align: left; padding: 48px 48px 32px; }
        .op-apps-pop .op-apps-sl { margin-top: 0; }
        /* Pevné bunky — plášť .op-alba-card má vlastné dekoratívne dieťa, ktoré by si inak vzalo prvú bunku. */
        .op-apps-pop-shot { grid-column: 1; grid-row: 1; }
        .op-apps-pop-txt { grid-column: 2; grid-row: 1; }
        .op-apps-pop .op-apps-sl-view { width: min(300px, calc((100dvh - 250px) * ${(IPHONE_W / IPHONE_H).toFixed(4)})); }
        .op-apps-pop .op-apps-ul { margin: 0; }
        .op-apps-mapy {
          display: inline-flex; align-items: center; gap: 8px; margin: -8px 0 24px; padding: 4px 12px 4px 12px;
          border-radius: 999px; border: 1px solid rgba(201,154,63,.6); background: rgba(255,255,255,.55);
          font: 500 12px/1 'Space Grotesk', sans-serif; letter-spacing: .02em; color: rgba(35,22,8,.7);
          text-decoration: none; transition: background .15s;
        }
        .op-apps-mapy:hover { background: #fff; }
        .op-apps-mapy img { width: 20px; height: 20px; border-radius: 4px; display: block; }
        .op-apps-mapy b { font-weight: 600; color: ${LAB.ink}; }
        .op-apps-mapy i {
          width: 16px; height: 16px; flex: 0 0 auto; background: ${LAB.ink};
          -webkit-mask: var(--m) center / contain no-repeat; mask: var(--m) center / contain no-repeat;
        }
        /* DETAIL — slider: telefón so screenshotom, šípky po bokoch, bodky pod ním. */
        .op-apps-sl { position: relative; display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; touch-action: pan-y; }
        .op-apps-sl-view { width: min(280px, calc((100dvh - 320px) * ${(IPHONE_W / IPHONE_H).toFixed(4)})); overflow: hidden; }
        .op-apps-sl-track { display: flex; transition: transform .5s ease-in-out; }
        .op-apps-sl-item { flex: 0 0 100%; }
        .op-apps-sl-btn {
          width: 40px; height: 40px; border-radius: 999px; display: grid; place-items: center; cursor: pointer; flex: none;
          background: rgba(0,0,0,.6); border: 1px solid rgba(255,255,255,.2); color: #fff;
        }
        .op-apps-sl-btn:hover { background: rgba(0,0,0,.8); }
        .op-apps-sl-btn svg { fill: currentColor; }
        /* Šípky na kraji karty — sedia na jej hrane (polovica von), zlatý rám ako navigácia. */
        .op-apps-pop-nav {
          position: absolute; top: 50%; z-index: 2; transform: translateY(-50%);
          width: 48px; height: 48px; border-radius: 999px; display: grid; place-items: center; cursor: pointer;
          background: ${LAB.pageBg}; border: 1.5px solid rgba(201,154,63,.85); color: ${LAB.ink};
          box-shadow: 0 8px 24px rgba(42,22,8,.25); transition: transform .15s, background .15s;
        }
        .op-apps-pop-nav.is-l { left: -24px; }
        .op-apps-pop-nav.is-r { right: -24px; }
        .op-apps-pop-nav:hover { transform: translateY(-50%) scale(1.06); }
        .op-apps-pop-nav svg { fill: currentColor; }
        .op-apps-pop-x { display: none; }
        .op-apps-pop-navs { display: contents; }
        .op-apps-pop img { -webkit-user-drag: none; user-drag: none; pointer-events: none; }
        .op-apps-sl-dots { display: flex; gap: 8px; justify-content: center; margin-top: 16px; }
        .op-apps-sl-dots button {
          width: 8px; height: 8px; padding: 0; border-radius: 999px; cursor: pointer;
          border: 1px solid ${LAPIS.edge}; background: transparent;
        }
        .op-apps-sl-dots button.is-on { background: ${LAPIS.edge}; }

        /* MOBIL — rám 280 (komponent), text hore, telefóny pod ním. */
        @media (max-width: 767px) {
          .op-apps-ph { width: 280px; }
          /* 🔴 DNO JE LIŠTA, NIE TELEFÓN (6. 10.: s logami appiek nadpis vyliezol pod medailón).
             Pás medzi lištou a telefónom; obsah sedí dole cez margin-top:auto — keď sa nezmestí,
             auto okraj padne na 0 a obsah ide od lišty dole, nikdy nie pod ňu. */
          .op-apps-hero {
            top: calc(var(--op-nav-h, 118px) + 8px); bottom: calc(50lvh + 64px);
            display: flex; flex-direction: column;
          }
          .op-apps-hero > :first-child { margin-top: auto; }
          .op-apps-lead { display: block; }
          /* Nízke okno: veta „Staviame psí svet…“ ustúpi pilulkám, inak nadpis zaleze pod lištu. */
          /* 6. 10.: s logami appiek (3 riadky pilulek) sa veta „Staviame psí svet…" nezmestí ani na
             844 px — na mobile ju nesie veta nad pilulkami. */
          .op-apps-sub { display: none; } .op-apps-lead:not(.op-apps-tail) { margin-top: 12px; }
          @media (max-height: 700px) {
            .op-apps-tail { display: none; }
            /* iPhone SE: pilulky hustejšie, aby nadpis aj tri riadky lôg ostali nad telefónom. */
            .op-apps-chips { gap: 6px; margin-top: 8px; }
            .op-apps-chips li { padding: 3px 9px; font-size: 11px; gap: 4px; }
            .op-apps-chips li i { width: 12px; height: 12px; }
            .op-root .op-apps-h2 { padding-bottom: 8px; }
            .op-apps-lead:not(.op-apps-tail) { margin-top: 8px; }
          }
          .op-apps-chips { display: flex; }
          .op-apps-ctl { --arr-x: min(172px, calc(50vw - 44px)); }
          .op-apps-ctl button { width: 48px; height: 48px; }
          /* V ÚVODE BEZ ŠÍPOK: stred telefónu je na spodku okna, šípky by ležali na AINUBIS
             bubline a šípke filmu (Matejov iPhone 5. 10.). Točí sa samo a ide švih; šípky nabehnú s funkciou. */
          .op-apps-ctl { opacity: calc(var(--r, 0) * var(--sx, 0)); }
          .op-apps[data-peek] .op-apps-ctl button { pointer-events: none; }
          /* TEXT V STREDE MEDZI LIŠTOU A TELEFÓNOM (Matej 5. 10. 2026: *„rozloženie zosúlaď —
             posuň text dolu a detail chip daj preč"*). Pás --colt…--colb píše réžia rovnicou. */
          .op-apps-col { left: 16px; right: 16px; width: auto; top: var(--colt, 124px); height: var(--colh, 300px); }
          .op-apps-txt { top: 50%; transform: translateY(-50%); }
          .op-apps-txt .op-apps-lede { margin-bottom: 0; }
          /* „KLIKNI“ — nakrivo, LAPIS, šípka končí v rohu predného telefónu; mierka sa vracia (--rig-s). */
          .op-apps-hint {
            display: block; position: absolute; left: 36px; top: calc(var(--ph-h) / -2 - 4px); width: 96px; height: 72px;
            pointer-events: none; z-index: 40; color: ${LAPIS.edge};
            /* Až na druhej polohe (telefóny celé, funkcia pod nimi) — nie pri vymenovaných appkách. */
            opacity: calc(var(--r, 0) * var(--sx, 0));
            transform-origin: 77px 60px; transform: scale(calc(1 / var(--rig-s, 1)));
          }
          .op-apps-hint svg { position: absolute; inset: 0; }
          .op-apps-hint span {
            position: absolute; left: 12px; top: -20px; white-space: nowrap; transform: rotate(-8deg); transform-origin: 0 100%;
            font: 700 16px/1 'Cinzel', serif; letter-spacing: .06em;
          }
          /* DETAIL otvára ťuk na predný telefón. */
          .op-apps .op-apps-chip { display: none; }
          /* NADPISY VÝRAZNEJŠIE (Matej 5. 10. 2026: *„trocha zväčšiť, zvýrazniť nadpisy"*). */
          .op-apps-eye { font-size: 14px; font-weight: 600; color: rgba(35,22,8,.8); margin-bottom: 12px; }
          .op-apps-name { margin-bottom: 8px; font-size: 32px; }
          /* ŠÍPKY VEDĽA TELEFÓNOV, NIE NA NICH (Matej 5. 10. 2026: *„tie šípky dať mimo mockupov,
             vedľa"*). Súprava je zmenšená (--rig-s), preto sa veľkosť aj odstup delia mierkou:
             na obrazovke 40 px, stred 16 + 20 px od okraja okna. */
          .op-apps-col ~ .op-apps-rig .op-apps-ctl { --arr-x: calc((50vw - 36px) / var(--rig-s, 1)); }
          .op-apps-ctl button { width: calc(40px / var(--rig-s, 1)); height: calc(40px / var(--rig-s, 1)); }
          .op-apps-ctl svg { width: calc(20px / var(--rig-s, 1)); height: calc(20px / var(--rig-s, 1)); }
          .op-apps-ul { margin-bottom: 16px; font-size: 14px; }
          .op-apps-ul li { padding: 8px 0; gap: 12px; }
          .op-apps-sl { gap: 8px; }
          .op-apps-lede { margin-bottom: 16px; font-size: 14px; }
          /* POPUP SA NESCROLLUJE (Matej 5. 10. 2026: *„urob to tak, aby popup nebol scrollovateľný,
             zmenši obsah"*). Karta má výšku okna, text svoju prirodzenú, telefón berie ZVYŠOK —
             výška ho určuje cez aspect-ratio, šírka max 220. */
          .op-alba:has(.op-apps-pop) { overflow: hidden; }
          .op-apps-pop {
            display: flex; flex-direction: column; gap: 16px;
            height: calc(100dvh - 32px); padding: 16px 16px 16px; overflow: hidden; touch-action: pan-y;
          }
          .op-apps-pop-shot { flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; }
          .op-apps-pop .op-apps-sl { flex: 1 1 0; min-height: 0; }
          .op-apps-pop .op-apps-sl-view { height: 100%; width: auto; max-width: 220px; aspect-ratio: ${IPHONE_W} / ${IPHONE_H}; }
          .op-apps-pop .op-apps-sl-dots { margin-top: 12px; }
          /* Snímky švihom a bodkami — sivé šípky pri telefóne by sa bili so zlatými na kraji. */
          .op-apps-pop .op-apps-sl-btn { display: none; }
          .op-apps-pop-txt { flex: none; }
          .op-apps-pop .op-apps-name { font-size: 20px; padding-bottom: 12px; }
          .op-apps-pop-txt { min-width: 0; width: 100%; }
          .op-apps-pop .op-apps-lede { margin-bottom: 12px; font-size: 14px; line-height: 1.45; }
          .op-apps-pop .op-apps-ul li { padding: 6px 0; font-size: 14px; }
          /* ŠÍPKY NA KRAJOCH, V STREDE TELEFÓNU (Matej 5. 10. 2026: *„šípky premiestni na kraje
             do stredu"*) — dovtedy v horných rohoch. Stred = polovica bunky telefónu. */
          /* ŠÍPKY FUNKCIÍ — v riadku nadpisu, menšie, LAPIS (Matej 6. 10. 2026: *„šípky daj nižšie do úrovne
             nadpisu/textovej časti, menšie a lapisom"*). Dovtedy zlaté na krajoch v strede telefónu. */
          .op-apps-pop-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
          .op-apps-pop-navs { display: flex; gap: 8px; flex: none; }
          .op-apps-pop-nav {
            position: static; transform: none; width: 28px; height: 28px; box-shadow: none; background: transparent;
            border: 1px solid ${LAPIS.edge}; color: ${LAPIS.edge};
          }
          .op-apps-pop-nav svg { width: 14px; height: 14px; }
          .op-apps-pop-nav:hover { transform: none; background: rgba(22,48,122,.08); }
          /* SÚMERNÝ POPUP: rovnaká veta (3 riadky), 4 odrážky a vyhradené miesto na čip pri každej funkcii. */
          .op-apps-pop .op-apps-lede { min-height: calc(3 * 1.45em); }
          .op-apps-pop-chip { height: 28px; margin-bottom: 4px; }
          .op-apps-pop-chip .op-apps-mapy { margin: 0; }
          .op-apps-pop-x {
            display: grid; place-items: center; position: absolute; top: 8px; right: 8px; z-index: 3;
            width: 32px; height: 32px; border-radius: 999px; cursor: pointer;
            background: ${LAB.pageBg}; border: 1.5px solid rgba(201,154,63,.85); color: ${LAB.ink};
            box-shadow: 0 8px 24px rgba(42,22,8,.25);
          }
          .op-apps-pop-x i {
            width: 12px; height: 12px; background: currentColor;
            -webkit-mask: url(/icons/pack/cross.svg) center / contain no-repeat; mask: url(/icons/pack/cross.svg) center / contain no-repeat;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .op-apps-ph, .op-apps-txt, .op-apps-sl-track, .op-apps-ul li { transition: none; animation: none; }
          .op-apps-dot::after { animation: none; }
        }
      `}</style>
    </section>
  );
}
