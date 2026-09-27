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
 * ⚠️ KOSTRA. Obsah (screenshoty, odrážky, finálne texty) sa dopĺňa spolu
 * s Matejom — všetko je v `APPS` nižšie. Texty zatiaľ berú hotové kľúče
 * z heroflowu (`heroglyph.flow.more.*`, `…checkoutNew.getD.*`), nič nové.
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
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/i18n/LanguageContext';
import { LAB } from '@/lib/labTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { HandArrowLeft } from '@/components/pack/HandIcons';
import Iphone15Pro, { IPHONE_H, IPHONE_W } from '@/components/ui/iphone-15-pro';

type AppFeature = {
  id: string;
  /** Názov funkcie (nadpis vľavo aj na obrazovke telefónu). */
  nameKey: string;
  /** Odstavec vľavo. */
  textKey: string;
  /** Odrážky vľavo — dopĺňa sa. */
  bulletKeys: string[];
  /** Obrázok na displeji telefónu; kým chýba, stojí tam zástupca. */
  shot?: string;
  /** Screenshoty z appky do popupu. */
  shots: string[];
};

/** Poradie = poradie v karuseli. Matej: *„dog id/profil, sniffer, dogtrips,
 *  AInubis a pomoc/možnosti… celkovo 4 obrazovky"*. */
const APPS: AppFeature[] = [
  { id: 'dogid', nameKey: 'heroglyph.flow.more.dogid.t', textKey: 'heroglyph.flow.more.dogid.d',
    bulletKeys: ['heroglyph.flow.checkoutNew.getD.dogid'], shots: [] },
  { id: 'sniffer', nameKey: 'heroglyph.flow.more.sniffer.t', textKey: 'heroglyph.flow.more.sniffer.d',
    bulletKeys: ['heroglyph.flow.checkoutNew.getD.sniffer'], shots: [] },
  { id: 'dogtrip', nameKey: 'heroglyph.flow.more.dogtrip.t', textKey: 'heroglyph.flow.more.dogtrip.d',
    bulletKeys: ['heroglyph.flow.checkoutNew.getD.map'], shots: [] },
  { id: 'ainubis', nameKey: 'heroglyph.flow.more.ainubis.t', textKey: 'heroglyph.flow.more.ainubis.d',
    bulletKeys: ['heroglyph.flow.checkoutNew.getD.ainubis'], shots: [] },
];

/** Dráha ODCHODU HEROGLYPHu a príchodu telefónov (prvý ťah) vo `vh`. Oblúk
 *  si o toľko predĺži výdrž (OnePage `ARC_HOLD2_VH`), aby stál, kým sa to deje. */
export const APPS_OUT_VH = 100;
/** Dráha sekcie vo `vh`: obrazovka javiska + príchod + 100 vh na každú funkciu. */
export const APPS_VH = 100 + APPS_OUT_VH + APPS.length * 100;
const TRACK_VH = APPS_VH - 100;
/** Zastávka „telefóny do polovice" (podiel dráhy). */
const PEEK = APPS_OUT_VH / TRACK_VH;
const STEP = 100 / TRACK_VH;
/** Zastávky motora na dráhe: PEEK + štyri funkcie. */
export const APPS_STOPS = [PEEK, ...APPS.map((_, i) => PEEK + (i + 1) * STEP)];

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
  /** Telefón vpredu (index do APPS). */
  const [idx, setIdx] = useState(0);
  /** Úvodný stav (nadpis + telefóny do polovice) — len tu sa točia samé. */
  const [peek, setPeek] = useState(true);
  const [shown, setShown] = useState(false);
  const [hover, setHover] = useState(false);
  const n = APPS.length;

  useEffect(() => { onPopup?.(open != null); }, [open, onPopup]);
  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Samé točenie á 3 s — ako komponent, ale len v úvodnom stave a keď je vidieť.
  useEffect(() => {
    if (!peek || !shown || hover || open != null) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % n), 3000);
    return () => clearInterval(id);
  }, [peek, shown, hover, open, n]);

  /** Prepni na funkciu i. V stave FUNKCIA ide stránka na jej zastávku
   *  (text a telefón patria k sebe), v úvode len otočí karusel. */
  const goTo = useCallback((i: number) => {
    const j = ((i % n) + n) % n;
    const sec = secRef.current;
    if (peek || !sec) { setIdx(j); return; }
    const top = sec.getBoundingClientRect().top + window.scrollY;
    const span = Math.max(1, sec.offsetHeight - window.innerHeight);
    window.scrollTo({ top: top + span * APPS_STOPS[j + 1], behavior: 'smooth' });
  }, [peek, n]);

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
      sec.style.setProperty('--mid', `${(navH + (vh - navH) / 2).toFixed(1)}px`);

      const isPeek = p < PEEK + STEP * 0.5;
      setPeek(isPeek);
      setShown(rise > 0.9);
      if (!isPeek) {
        const fi = Math.max(0, Math.min(n - 1, Math.round((p - PEEK - STEP) / STEP)));
        setIdx(fi);
      }
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
    <section ref={secRef} className="op-scene op-apps" aria-label={t('heroglyph.flow.more.eyebrow')}
      style={{ height: `${APPS_VH}lvh`, marginTop: `-${100 + APPS_OUT_VH}lvh` }}>
      <div className="op-apps-stage">
        <h2 className="op-apps-h2">{t('heroglyph.flow.more.eyebrow')}</h2>

        <div className="op-apps-col">
          {APPS.map((a, i) => (
            <div className={`op-apps-txt${!peek && i === idx ? ' is-on' : ''}`} key={a.id} aria-hidden={peek || i !== idx}>
              <p className="op-apps-eye">{t('heroglyph.flow.more.eyebrow')} · {i + 1}/{n}</p>
              <h3 className="op-apps-name">{t(a.nameKey)}</h3>
              <p className="op-apps-p">{t(a.textKey)}</p>
              <ul className="op-apps-ul">
                {a.bulletKeys.map((k) => <li key={k}>{t(k)}</li>)}
              </ul>
              <button type="button" className="dgx-example op-apps-chip" onClick={() => setOpen(i)}>
                {t('onepage.apps.more')}
              </button>
            </div>
          ))}
        </div>

        <div className="op-apps-rig" ref={rigRef}>
          <div className="op-apps-car" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            {APPS.map((a, i) => {
              const pos = i === idx ? 'is-cur' : i === prevI ? 'is-prev' : i === nextI ? 'is-next' : 'is-off';
              return (
                <div className={`op-apps-ph ${pos}`} key={a.id} aria-hidden={i !== idx}
                  onClick={pos === 'is-prev' || pos === 'is-next' ? () => goTo(i) : undefined}>
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
            <button type="button" aria-label={t('heroglyph.flow.more.prev')} onClick={() => goTo(idx - 1)}><HandArrowLeft size={18} /></button>
            <button type="button" aria-label={t('heroglyph.flow.more.next')} onClick={() => goTo(idx + 1)}><HandArrowLeft size={18} style={{ transform: 'scaleX(-1)' }} /></button>
          </div>
        </div>
      </div>

      {/* Portál do body — sekcia má vlastný z-index (vrstvenie filmu), popup
          v nej by ostal POD horným navom. */}
      {cur && createPortal(
        <div className="op-alba" role="dialog" aria-modal="true" aria-label={t(cur.nameKey)} data-film-free onClick={() => setOpen(null)}>
          <div className="op-alba-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="op-alba-x" aria-label={t('nav.aria.close')} onClick={() => setOpen(null)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            <h2 className="op-alba-h2">{t(cur.nameKey)}</h2>
            <p className="op-apps-pop-p">{t(cur.textKey)}</p>
            {/* Screenshoty z appky — kým nie sú, tri prázdne rámy. */}
            <div className="op-apps-pop-shots">
              {(cur.shots.length ? cur.shots : ['', '', '']).map((s, i) => (
                <div className="op-apps-pop-shot" key={i}>
                  {s ? <img src={s} alt="" /> : <span>screenshot</span>}
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body,
      )}

      <style>{`
        .op-apps { position: relative; z-index: 3; }
        /* Obsah oblúka (DOGTRIX) zhasína, kým vychádzajú telefóny. */
        .op-arc .op-arc-stage { opacity: calc(1 - var(--apps-out, 0)); }
        .op-apps-stage {
          position: sticky; top: 0; height: 100lvh; overflow: hidden;
          pointer-events: none;
        }
        /* Papyrus javiska nabieha s odchodom HEROGLYPHu — keď oblúk odíde, drží obraz on. */
        .op-apps-stage::before {
          content: ''; position: absolute; inset: 0;
          background: ${LAB.pageBg}; background-image: ${LAB.pageBackdrop};
          opacity: var(--o, 0);
        }
        .op-apps-h2 {
          position: absolute; left: 16px; right: 16px; bottom: calc(50lvh + 48px);
          margin: 0; text-align: center;
          font: 700 clamp(24px, 4.2vw, 56px)/1.1 'Cinzel', serif; letter-spacing: .06em; text-transform: uppercase;
          background: linear-gradient(90deg, #8A6420, #C99A3F 30%, #E8C35A 50%, #C99A3F 70%, #8A6420);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          opacity: calc(var(--r, 0) * (1 - var(--sx, 0)));
          transform: translateY(calc((1 - var(--r, 0)) * 32px - var(--sx, 0) * 24px));
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
        .op-apps-ph.is-cur { transform: translate(-50%, -50%); opacity: 1; z-index: 20; }
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
        .op-apps-ph-empty span, .op-apps-pop-shot span {
          font: 500 10px/1 'Space Grotesk', sans-serif; letter-spacing: .22em; text-transform: uppercase;
          color: rgba(35,22,8,.45);
        }
        /* Tlačidlá z komponentu (predošlá · pauza · ďalšia) — pod predným telefónom. */
        .op-apps-ctl {
          position: absolute; left: 0; top: calc(${(350 * IPHONE_H / IPHONE_W / 2).toFixed(1)}px + 16px);
          transform: translateX(-50%);
          display: flex; gap: 16px; pointer-events: auto;
          opacity: var(--r, 0);
        }
        .op-apps-ctl button {
          width: 40px; height: 40px; border-radius: 999px; display: grid; place-items: center; cursor: pointer;
          background: rgba(0,0,0,.6); border: 1px solid rgba(255,255,255,.2); color: #fff;
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,.2); transition: background .2s;
        }
        .op-apps-ctl button:hover { background: rgba(0,0,0,.8); }
        .op-apps-ctl svg { width: 18px; height: 18px; fill: currentColor; }
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
          margin: 0 0 8px; font: 500 10px/1.4 'Space Grotesk', sans-serif; letter-spacing: .22em;
          text-transform: uppercase; color: rgba(35,22,8,.6);
        }
        .op-apps-name {
          margin: 0 0 16px; font: 700 clamp(24px, 3vw, 40px)/1.1 'Cinzel', serif; letter-spacing: .06em; color: #8A6420;
        }
        .op-apps-p { margin: 0 0 16px; font: 400 16px/1.55 'Space Grotesk', sans-serif; color: ${LAB.ink}; }
        .op-apps-ul { margin: 0 0 24px; padding: 0; list-style: none; font: 400 14px/1.5 'Space Grotesk', sans-serif; color: ${LAB.ink}; }
        .op-apps-ul li { position: relative; margin: 0 0 4px; padding-left: 16px; }
        .op-apps-ul li::before {
          content: ''; position: absolute; left: 0; top: .6em; width: 6px; height: 6px;
          border-radius: 999px; background: ${LAPIS.edge};
        }
        .op-apps .op-apps-chip { margin: 0; }
        /* Popup — plášť je .op-alba z OnePage, tu len obsah. */
        .op-apps-pop-p { margin: 8px auto 24px; max-width: 640px; font: 400 16px/1.55 'Space Grotesk', sans-serif; color: ${LAB.ink}; }
        .op-apps-pop-shots { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .op-apps-pop-shot {
          width: 180px; aspect-ratio: 9 / 19; border-radius: 24px; overflow: hidden;
          display: grid; place-items: center;
          border: 1.5px dashed rgba(201,154,63,.55); background: rgba(255,251,241,.5);
        }
        .op-apps-pop-shot img { width: 100%; height: 100%; object-fit: cover; }

        /* MOBIL — rám 280 (komponent), text hore, telefóny pod ním. */
        @media (max-width: 767px) {
          .op-apps-ph { width: 280px; }
          .op-apps-ctl { top: calc(${(280 * IPHONE_H / IPHONE_W / 2).toFixed(1)}px + 16px); }
          .op-apps-col { left: 16px; right: 16px; width: auto; top: calc(var(--op-nav-h, 118px) + 8px); }
          .op-apps-txt { transform: none; }
          .op-apps-name { margin-bottom: 8px; }
          .op-apps-p { font-size: 14px; margin-bottom: 8px; }
          .op-apps-ul { margin-bottom: 16px; font-size: 12px; }
          .op-apps-pop-shot { width: 132px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .op-apps-ph, .op-apps-txt { transition: none; }
        }
      `}</style>
    </section>
  );
}
