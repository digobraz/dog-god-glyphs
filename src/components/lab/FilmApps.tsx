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
 *
 * ⚠️ KOSTRA. Obsah (screenshoty, odrážky, finálne texty) sa dopĺňa spolu
 * s Matejom — všetko je v `APPS` nižšie. Texty zatiaľ berú hotové kľúče
 * z heroflowu (`heroglyph.flow.more.*`, `…checkoutNew.getD.*`), nič nové.
 *
 * DEJ na vlastnej prilepenej dráhe (p 0–1), jeden ťah motora = jedna zastávka:
 *   p = 0      telefóny na strede, nadpis ČLENSTVO V DOGYPTE (sem prídu zdola
 *              obyčajným scrollom — sekcia vytlačí oblúk HEROGLYPH)
 *   0 → .25    telefóny idú doprava, naľavo nabehne 1. funkcia
 *   .25 → 1    karusel sa točí po funkciách 1 → 4, text naľavo sa mení s ním
 * Zastávky: `absTop('.op-apps')` + `APPS_STOPS` (OnePage.filmStops).
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/i18n/LanguageContext';
import { LAB } from '@/lib/labTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';

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

/** Dráha sekcie vo `vh`: obrazovka javiska + 100 vh na každý ťah (4 ťahy). */
export const APPS_VH = 100 + APPS.length * 100;
/** Zastávky motora na dráhe (bez nulky — tú dáva začiatok sekcie). */
export const APPS_STOPS = APPS.map((_, i) => (i + 1) / APPS.length);

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number) => t * t * (3 - 2 * t);

export default function FilmApps({ onPopup }: { onPopup?: (open: boolean) => void }) {
  const t = useT();
  const secRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => { onPopup?.(open != null); }, [open, onPopup]);
  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;
    const phones = Array.from(sec.querySelectorAll<HTMLElement>('.op-apps-ph'));
    const texts = Array.from(sec.querySelectorAll<HTMLElement>('.op-apps-txt'));
    const n = APPS.length;
    const step = 1 / n;
    let raf = 0;
    let lastP = -1;
    const apply = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const p = clamp01(-r.top / Math.max(1, sec.offsetHeight - window.innerHeight));
      if (Math.abs(p - lastP) < 0.0003) return;
      lastP = p;
      // Posun telefónov doprava (a nábeh ľavého stĺpca) — prvý ťah.
      const sx = smooth(clamp01(p / step));
      // Karusel: plávajúci index funkcie, mäkký medzi zastávkami.
      const raw = clamp01((p - step) / (1 - step)) * (n - 1);
      const fi = Math.min(n - 1, Math.floor(raw));
      const f = fi + smooth(raw - fi);
      sec.style.setProperty('--sx', sx.toFixed(4));
      phones.forEach((el, i) => {
        // Kruhová vzdialenosť od čela v rozsahu [-n/2, n/2) — vpredu je d = 0,
        // po bokoch ±1, zadný (±2) je skrytý. Tak stoja vždy tri ako v predlohe.
        let d = i - f;
        d = ((d + n / 2) % n + n) % n - n / 2;
        const a = Math.abs(d);
        el.style.setProperty('--d', d.toFixed(4));
        el.style.setProperty('--a', Math.min(a, 1.5).toFixed(4));
        el.style.opacity = clamp01(1.7 - a).toFixed(3);
        el.style.zIndex = String(10 - Math.round(a * 2));
      });
      texts.forEach((el, i) => {
        const o = clamp01(1 - Math.abs(f - i) * 2) * sx;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
        el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
      });
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
  }, []);

  const cur = open != null ? APPS[open] : null;

  return (
    <section ref={secRef} className="op-scene op-apps" aria-label={t('heroglyph.flow.more.eyebrow')} style={{ height: `${APPS_VH}lvh` }}>
      <div className="op-apps-stage">
        <h2 className="op-apps-h2">{t('heroglyph.flow.more.eyebrow')}</h2>

        <div className="op-apps-col">
          {APPS.map((a, i) => (
            <div className="op-apps-txt" key={a.id} style={{ opacity: 0, visibility: 'hidden' }}>
              <p className="op-apps-eye">{t('heroglyph.flow.more.eyebrow')} · {i + 1}/{APPS.length}</p>
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

        <div className="op-apps-rig">
          {APPS.map((a) => (
            <div className="op-apps-ph" key={a.id}>
              <div className="op-apps-scr">
                <i className="op-apps-isl" aria-hidden="true" />
                {a.shot
                  ? <img src={a.shot} alt={t(a.nameKey)} />
                  : <div className="op-apps-ph-empty"><b>{t(a.nameKey)}</b><span>screenshot</span></div>}
              </div>
            </div>
          ))}
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
        .op-apps { position: relative; z-index: 2; }
        .op-apps-stage {
          position: sticky; top: 0; height: 100lvh; overflow: hidden;
          background: ${LAB.pageBg}; background-image: ${LAB.pageBackdrop};
          --ph-w: min(240px, 24lvh);
          /* Stred súpravy: plocha pod navom mínus pás 88 px pre šípky filmu. */
          --mid: calc(var(--op-nav-h, 124px) + (100lvh - var(--op-nav-h, 124px) - 88px) / 2);
          --ph-h: calc(var(--ph-w) * 2.05);
        }
        /* Nadpis na strede — odchádza hore, keď telefóny idú doprava. */
        .op-apps-h2 {
          position: absolute; left: 16px; right: 16px; top: calc(var(--op-nav-h, 124px) + 8px);
          margin: 0; text-align: center;
          font: 700 clamp(24px, 4.2vw, 56px)/1.1 'Cinzel', serif; letter-spacing: .06em; text-transform: uppercase;
          background: linear-gradient(90deg, #8A6420, #C99A3F 30%, #E8C35A 50%, #C99A3F 70%, #8A6420);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          opacity: calc(1 - var(--sx, 0));
          transform: translateY(calc(var(--sx, 0) * -24px));
        }
        /* Súprava telefónov — stred okna pod nadpisom, s posunom doprava. */
        .op-apps-rig {
          position: absolute; left: 50%; top: var(--mid);
          width: 0; height: 0;
          transform: translateX(calc(var(--sx, 0) * 22vw));
        }
        .op-apps-ph {
          position: absolute; left: calc(var(--ph-w) / -2); top: calc(var(--ph-h) / -2);
          width: var(--ph-w); height: var(--ph-h);
          padding: 9px; border-radius: 44px; box-sizing: border-box;
          background: linear-gradient(145deg, #2A2520, #0E0C0A);
          box-shadow: 0 0 0 1.5px #3A332C, 0 28px 60px -24px rgba(42,22,8,.55);
          transform:
            translateX(calc(var(--d, 0) * var(--ph-w) * .62))
            translateY(calc(var(--a, 0) * 7%))
            scale(calc(1 - var(--a, 0) * .16));
          filter: brightness(calc(1 - var(--a, 0) * .12));
          will-change: transform, opacity;
        }
        .op-apps-scr {
          position: relative; width: 100%; height: 100%; overflow: hidden;
          border-radius: 36px; background: ${LAB.pageBg};
        }
        .op-apps-scr > img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .op-apps-isl {
          position: absolute; top: 10px; left: 50%; width: 32%; height: 22px; margin-left: -16%;
          border-radius: 999px; background: #0E0C0A; z-index: 2;
        }
        .op-apps-ph-empty {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 8px;
          border: 1.5px dashed rgba(201,154,63,.55); border-radius: 36px;
        }
        .op-apps-ph-empty b { font: 700 16px/1.2 'Cinzel', serif; letter-spacing: .14em; color: #8A6420; }
        .op-apps-ph-empty span, .op-apps-pop-shot span {
          font: 500 10px/1 'Space Grotesk', sans-serif; letter-spacing: .22em; text-transform: uppercase;
          color: rgba(35,22,8,.45);
        }
        /* Ľavý stĺpec — texty funkcií stoja na sebe, réžia prelína krytie. */
        .op-apps-col {
          position: absolute; left: max(16px, calc(50vw - 560px)); width: min(440px, 40vw);
          top: var(--mid);
        }
        .op-apps-txt { position: absolute; left: 0; right: 0; top: 0; transform: translateY(-50%); }
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

        /* MOBIL — text hore, telefóny pod ním (posun dolu a zmenšenie namiesto doprava). */
        @media (max-width: 768px) {
          .op-apps-stage { --ph-w: min(200px, 24lvh); }
          .op-apps-rig {
            transform: translateY(calc(var(--sx, 0) * 12lvh)) scale(calc(1 - var(--sx, 0) * .3));
          }
          .op-apps-col {
            left: 16px; right: 16px; width: auto;
            top: calc(var(--op-nav-h, 118px) + 8px); transform: none;
          }
          .op-apps-txt { transform: none; }
          .op-apps-name { margin-bottom: 8px; }
          .op-apps-p { font-size: 14px; margin-bottom: 8px; }
          .op-apps-ul { margin-bottom: 16px; font-size: 12px; }
          .op-apps-pop-shot { width: 132px; }
        }
      `}</style>
    </section>
  );
}
