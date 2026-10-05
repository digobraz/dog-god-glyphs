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
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/i18n/LanguageContext';
import { LAB } from '@/lib/labTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { HandArrowLeft } from '@/components/pack/HandIcons';
import Iphone15Pro, { IPHONE_H, IPHONE_W } from '@/components/ui/iphone-15-pro';

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
};

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
const img = (f: string) => `/images/onepage/apps/${f}.webp?v=9`;
/* DETAIL = hlavná snímka z telefónu + výber z nákresu `plany/nakres-clenstvo-screeny-2026-10-05/`
   (Matej 5. 10. 2026: *„máš to vybraté — aplikuj to"*). Komunita na OSTRÝCH číslach z LIVE,
   SNIFFER s fiktívnymi ľuďmi (Eva…) a správami len na snímke. */
const APPS: AppFeature[] = [
  /* 🔁 PORADIE 5. 10. 2026 — Matej: *„na úvodnom mockupe musia byť tie najkrajšie = DOG ID
     v strede, sprava DOGTRIP, zľava AINUBIS"*. Sprava stojí nasledujúci, zľava posledný. */
  { id: 'dogid', nameKey: 'heroglyph.flow.more.dogid.t', ledeKey: 'onepage.apps.dogid.lede', bulletKeys: bn('dogid', 5), shot: img('dogid-profil'), shots: [img('dogid-profil'), img('dogid-kviz'), img('dogid-kalendar'), img('dogid-zdravie'), img('dogid-zivot-prehlad')] },
  { id: 'dogtrip', nameKey: 'heroglyph.flow.more.dogtrip.t', ledeKey: 'onepage.apps.dogtrip.lede', bulletKeys: bn('dogtrip', 5), shot: img('dogtrip-swiss'), shots: [img('dogtrip-swiss'), img('dogtrip-mapa'), img('dogtrip-clanok'), img('dogtrip-mapa-celok'), img('dogtrip-stats'), img('dogtrip-odznaky'), img('dogtrip-odznaky-parky'), img('dogtrip-pridat-2-druh'), img('dogtrip-pridat-6-o-vylete')], mapy: true },
  { id: 'sniffer', nameKey: 'heroglyph.flow.more.sniffer.t', ledeKey: 'onepage.apps.sniffer.lede', bulletKeys: bn('sniffer'), shot: img('sniffer-cisty'), shots: [img('sniffer-cisty'), img('sniffer-hladat'), img('sniffer-profil-eva'), img('sniffer-profil-eva-2'), img('sniffer-zhody')] },
  // 5/5 — Matej 27. 9.: *„komunita/pomoc… transparentná pomoc, nové výskumy —
  // to, čo členstvo vie pomáhať psom"*. Detail = text „VYŠŠÍ CIEĽ" z heroflowu.
  { id: 'cause', nameKey: 'onepage.apps.cause.name', ledeKey: 'onepage.apps.cause.lede', bulletKeys: bn('cause'), shot: img('komunita-transparency'), shots: [img('komunita-transparency'), img('kom-pokladnica'), img('kom-svet')] },
  { id: 'ainubis', nameKey: 'heroglyph.flow.more.ainubis.t', ledeKey: 'onepage.apps.ainubis.lede', bulletKeys: bn('ainubis'), shot: img('ainubis-vault-bez-oznamu'), shots: [img('ainubis-vault-bez-oznamu'), img('ainubis-dogscroll'), img('ainubis-zvitok-podcast'), img('ainubis-zvitok-prepis'), img('ainubis-zvitok-text')] },
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
  const moveApp = useCallback((d: number) => {
    setOpen((o) => {
      if (o == null) return o;
      const nx = (o + d + n) % n;
      setIdx(nx);
      return nx;
    });
  }, [n]);
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
      rig.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(4)})`;
      // Ľavý stĺpec stojí na strede PREDNÉHO telefónu — výškou sa do neho zmestí.
      sec.style.setProperty('--mid', `${(narrow ? navH + (vh - navH) / 2 : featY).toFixed(1)}px`);
      sec.style.setProperty('--phh', `${(h * fs).toFixed(1)}px`);

      // Odchod: javisko zhasne na mieste, pod ním nabiehajú hviezdy.
      // Zhasne v PRVEJ polovici odchodu — hviezdy nabiehajú až v druhej
      // (dva texty naraz sa nečítajú ako prelínačka, ale ako chyba).
      const exit = smooth(clamp01((p - FEAT) / Math.max(0.001, (1 - FEAT) * 0.5)));
      sec.style.setProperty('--x', exit.toFixed(4));
      sec.toggleAttribute('data-gone', exit > 0.5);

      const isPeek = p < PEEK + STEP * 0.5;
      setPeek(isPeek);
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
                    <Iphone15Pro src={a.shot} alt={t(a.nameKey)}>
                      <div className="op-apps-ph-empty"><b>{t(a.nameKey)}</b><span>screenshot</span></div>
                    </Iphone15Pro>
                  </div>
                </div>
              );
            })}
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
          <div className="op-alba-card op-apps-pop" onClick={(e) => e.stopPropagation()}>
            {/* ŠÍPKY NA KRAJI KARTY = ĎALŠIA FUNKCIA (Matej 5. 10. 2026: *„daj aj šípky na jeho kraj,
                aby si človek mohol pozrieť detaily bez toho, aby sa neustále vracal na stránku
                a klikal na mockupy"*). Šípky vnútri (pri telefóne) listujú SNÍMKY jednej funkcie;
                tieto na okraji karty listujú FUNKCIE — preto iný tvar (zlatý rám = navigácia,
                „kde som") a iné miesto. Karusel za popupom ide s nimi, nech po zatvorení stojí
                človek na funkcii, ktorú práve čítal. */}
            <button type="button" className="op-apps-pop-nav is-l" aria-label={t(APPS[(open! - 1 + n) % n].nameKey)} onClick={() => moveApp(-1)}>
              <HandArrowLeft size={20} />
            </button>
            <button type="button" className="op-apps-pop-nav is-r" aria-label={t(APPS[(open! + 1) % n].nameKey)} onClick={() => moveApp(1)}>
              <HandArrowLeft size={20} style={{ transform: 'scaleX(-1)' }} />
            </button>
            {/* Bez krížika (Matej 28. 9. 2026: *„na webe nechceme krížiky"*) — zatvára klik mimo karty a Esc.
                Tlačidlo bez štýlu tu prežilo a v mriežke popupu si vzalo vlastnú bunku (karta 973 px). */}
            {/* MOCKUP NA JEDNEJ STRANE, TEXT NA DRUHEJ (Matej 5. 10. 2026: *„pri popupe by som
                dal mockup na jednu stranu a text na druhú"*). Mobil: pod sebou. */}
            <div className="op-apps-pop-shot">
            {/* SLIDER — screenshoty konkrétnej funkcie v ráme telefónu. */}
            <div className="op-apps-sl"
              onPointerDown={(e) => { swipeX.current = e.clientX; }}
              onPointerUp={(e) => {
                if (swipeX.current == null) return;
                const dx = e.clientX - swipeX.current; swipeX.current = null;
                if (Math.abs(dx) > 40) moveSlide(dx < 0 ? 1 : -1);
              }}>
              <button type="button" className="op-apps-sl-btn is-l" aria-label={t('onepage.apps.prev')} onClick={() => moveSlide(-1)}>
                <HandArrowLeft size={18} />
              </button>
              <div className="op-apps-sl-view">
                <div className="op-apps-sl-track" style={{ transform: `translateX(${-slide * 100}%)` }}>
                  {Array.from({ length: slideCount }, (_, i) => (
                    <div className="op-apps-sl-item" key={i} aria-hidden={i !== slide}>
                      <Iphone15Pro src={cur.shots[i]} alt={`${t(cur.nameKey)} ${i + 1}`}>
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
              <h2 className="op-apps-name">{t(cur.nameKey)}</h2>
              <p className="op-apps-lede">{t(cur.ledeKey)}</p>
              {/* ČIP MAPY.COM (Matej 5. 10. 2026: *„dal by som logo mapy cz alebo chip… nech to má
                  lepšiu relevantnosť"*). Logo je to isté ako vo „Vyraziť na miesto" (`/nav-apps/mapy.svg`). */}
              {cur.mapy && (
                <a className="op-apps-mapy" href="https://mapy.com" target="_blank" rel="noopener noreferrer">
                  <span>{t('onepage.apps.mapy')}</span>
                  <img src="/nav-apps/mapy.svg" alt="" width={20} height={20} />
                  <b>Mapy.com</b>
                </a>
              )}
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
        .op-apps-sl-dots { display: flex; gap: 8px; justify-content: center; margin-top: 16px; }
        .op-apps-sl-dots button {
          width: 8px; height: 8px; padding: 0; border-radius: 999px; cursor: pointer;
          border: 1px solid ${LAPIS.edge}; background: transparent;
        }
        .op-apps-sl-dots button.is-on { background: ${LAPIS.edge}; }

        /* MOBIL — rám 280 (komponent), text hore, telefóny pod ním. */
        @media (max-width: 767px) {
          .op-apps-ph { width: 280px; }
          .op-apps-ctl { --arr-x: min(172px, calc(50vw - 44px)); }
          .op-apps-ctl button { width: 48px; height: 48px; }
          .op-apps-col { left: 16px; right: 16px; width: auto; top: calc(var(--op-nav-h, 118px) + 8px); }
          .op-apps-txt { transform: none; }
          .op-apps-name { margin-bottom: 8px; }
          .op-apps-ul { margin-bottom: 16px; font-size: 14px; }
          .op-apps-ul li { padding: 8px 0; gap: 12px; }
          .op-apps-sl { gap: 8px; }
          .op-apps-lede { margin-bottom: 16px; font-size: 14px; }
          .op-apps-pop { grid-template-columns: 1fr; gap: 24px; padding: 48px 16px 24px; }
          /* Mobil: karta je cez celú šírku, hrana by šípku vytlačila z okna — idú do horných rohov karty (48 px rezerva nad telefónom). */
          .op-apps-pop-nav { top: 8px; transform: none; width: 40px; height: 40px; }
          .op-apps-pop-nav.is-l { left: 8px; }
          .op-apps-pop-nav.is-r { right: 8px; }
          .op-apps-pop-nav:hover { transform: none; }
          .op-apps-pop-txt { grid-column: 1; grid-row: 2; }
          .op-apps-pop .op-apps-sl-view { width: min(220px, calc((100dvh - 420px) * ${(IPHONE_W / IPHONE_H).toFixed(4)})); }
        }
        @media (prefers-reduced-motion: reduce) {
          .op-apps-ph, .op-apps-txt, .op-apps-sl-track, .op-apps-ul li { transition: none; animation: none; }
          .op-apps-dot::after { animation: none; }
        }
      `}</style>
    </section>
  );
}
