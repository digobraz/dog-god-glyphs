/**
 * FINÁLE — veľký portál a dvere ďalej (Matej 28. 9. 2026).
 *
 * *„posledný slajd a obrazovka sa fadne, navrhujem veľký portál ako na walle
 * s CTA výzvou + posledný slajd portál sa posunie doľava a napravo vyjde obsah:
 * nadpis a bloky na klikanie (o autorovi, psia biblia)"*.
 *
 * Dve zastávky na vlastnej prilepenej dráhe (p 0–1):
 *   0 → FIN_IN   javisko sa vynorí NAD dohraným WE NEED YOU (sekcia je o
 *                `FIN_OVER_VH` zasunutá pod jeho koniec, `.op-wny` si o toľko
 *                predĺžila výdrž) — v strede veľký portál s výzvou
 *   FIN_IN → 1   portál ide doľava, napravo nabehne nadpis a dva bloky
 * Zastávky: `FIN_STOPS` (OnePage.filmStops).
 *
 * Portál je TEN ISTÝ ako na guli a na stene (`buildPortal` z dogPortal.ts),
 * veľkosťou stena (260 px). Výber fotky ide rovnakou cestou ako na guli:
 * `intakePhoto` → karta `openPhotoConfirm` → `/heroglyph/name`.
 * ⚠️ Iskry potrebujú slučku. Guľa je na konci filmu dávno zastavená, takže
 * tu beží vlastná — ale LEN kým je javisko vidieť (IntersectionObserver).
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { LAB } from '@/lib/labTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { PORTAL_CSS, PORTAL_REDUCE_MOTION, buildPortal, createSparks } from '@/components/gods/dogPortal';
import { openPhotoConfirm } from '@/components/gods/photoConfirm';
import { intakePhoto, finishPhotoChoice } from '@/lib/photoIntake';
import { track } from '@/lib/analytics';

/** Udalosť, ktorou iné miesto filmu spustí heroflow cez portál finále (výber fotky → potvrdenie →
 *  `/heroglyph/name`). `detail.handled` ostane `false`, kým portál ešte nie je postavený. */
export const START_HEROFLOW = 'dogypt:start-heroflow';
export function startHeroflow(): boolean {
  const ev = new CustomEvent(START_HEROFLOW, { detail: { handled: false } });
  window.dispatchEvent(ev);
  return ev.detail.handled;
}

/** O koľko vh je finále zasunuté pod koniec WE NEED YOU (= dĺžka vynorenia). */
export const FIN_OVER_VH = 40;
/** Dráha posunu portálu doľava vo vh. */
const FIN_SHIFT_VH = 100;
export const FIN_VH = 100 + FIN_OVER_VH + FIN_SHIFT_VH;
const TRACK = FIN_OVER_VH + FIN_SHIFT_VH;
/** Zastávky motora: portál v strede · portál vľavo + obsah. */
export const FIN_STOPS = [FIN_OVER_VH / TRACK, 1];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (v: number, a: number, b: number) => clamp01((v - a) / Math.max(1e-6, b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);

export default function FilmFinale({ packNo, onBible, onAuthor, onAbout }: { packNo: number | null; onBible: () => void; onAuthor: () => void; onAbout: () => void }) {
  const t = useT();
  const navigate = useNavigate();
  const secRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const packRef = useRef(packNo);
  packRef.current = packNo;
  const [live, setLive] = useState(false);
  /** Portál sa stavia, až keď je finále na dosah (2 obrazovky). */
  const [ready, setReady] = useState(false);

  // ── PORTÁL ────────────────────────────────────────────────────────────
  useEffect(() => {
    const host = mountRef.current;
    if (!host || !ready) return;
    // Tváre z gule — tá je načítaná od prvej obrazovky, takže adresy sú v cache.
    // Guľa ich má načítané, ale pri mounte ešte nemusí — preto až pri prvom
    // priblížení k finále (`ready` nižšie).
    const faces = [...document.querySelectorAll<HTMLImageElement>('.planet-ball img')]
      .map((im) => im.currentSrc || im.src).filter((u) => u && !u.startsWith('data:')).slice(0, 12);
    const file = document.createElement('input');
    file.type = 'file'; file.accept = 'image/*'; file.className = 'ph-add-file';
    let picked: string | null = null;
    let uploading: Promise<string | null> | undefined;
    const openPicker = () => { file.value = ''; file.click(); };
    const showConfirm = (url: string) => {
      track('finale_photo_confirm_shown');
      openPhotoConfirm({
        photoUrl: url,
        packNumber: packRef.current ?? 0,
        onContinue: (crop) => {
          track('cta_become_dogyptian_click', { location: 'onepage_finale' });
          void finishPhotoChoice(crop, uploading);
          navigate('/heroglyph/name');
        },
        onPickAnother: openPicker,
        onClose: () => track('finale_photo_confirm_dismissed'),
      });
    };
    // 🔴 „VEZMI SI SVOJE ČÍSLO" JE V PORTÁLI (Matej 28. 9. 2026: *„vezmi si
    // svoje číslo daj do toho portálu"*) — predtým riadok pod ním.
    const label = packNo == null ? t('onepage.fin.take') : `${t('onepage.fin.take')}<br><b class="ph-no">#${packNo.toLocaleString('en-US')}</b>`;
    const p = buildPortal({
      faces,
      label,
      note: '',
      onPick: () => (picked ? showConfirm(picked) : openPicker()),
    });
    // Pomery steny (GodsGridLab, 27. 8. 2026) — 260 px dlaždica.
    p.el.style.setProperty('--ph-rimw', '6px');
    p.el.style.setProperty('--ph-icok', '0.185');
    p.el.style.setProperty('--ph-lblk', '0.072');
    file.addEventListener('change', () => {
      const f = file.files?.[0];
      if (!f) return;
      const intake = intakePhoto(f);
      uploading = intake.uploaded;
      picked = intake.previewUrl;
      p.setPhoto(picked);
      showConfirm(picked);
    });
    host.append(p.el, file);
    // CTA „JOIN US" vo WE NEED YOU spúšťa heroflow TOU ISTOU cestou ako portál (Matej 5. 10. 2026:
    // *„tu nejde CTA… a daj tam join us — otvorí heroflow"*). Jedna cesta, nie kópia výberu fotky.
    const onStart = (e: Event) => {
      (e as CustomEvent<{ handled: boolean }>).detail.handled = true;
      if (picked) showConfirm(picked); else openPicker();
    };
    window.addEventListener(START_HEROFLOW, onStart);
    const sparks = createSparks(p.canvas, { density: 0.42 });

    // Slučka iskier len kým je finále na obrazovke.
    let raf = 0, last = 0, on = false;
    const step = (ts: number) => {
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
      last = ts;
      sparks.frame(dt);
      if (on) raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(([e]) => {
      const vis = e.isIntersecting && !PORTAL_REDUCE_MOTION;
      if (vis && !on) { on = true; last = 0; raf = requestAnimationFrame(step); }
      else if (!vis) { on = false; cancelAnimationFrame(raf); }
    });
    if (stageRef.current) io.observe(stageRef.current);
    return () => { on = false; cancelAnimationFrame(raf); io.disconnect(); p.el.remove(); file.remove(); window.removeEventListener(START_HEROFLOW, onStart); };
  }, [navigate, ready, packNo, t]);

  // ── RÉŽIA PODĽA SCROLLU ───────────────────────────────────────────────
  useEffect(() => {
    const on = () => {
      const sec = secRef.current, st = stageRef.current;
      if (!sec || !st) return;
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp01(-r.top / Math.max(1, r.height - vh));
      if (r.top < vh * 3) setReady(true);
      const fin = seg(p, 0, FIN_STOPS[0]);
      const sh = smooth(seg(p, FIN_STOPS[0] + 0.04, 0.92));
      st.style.setProperty('--fin', fin.toFixed(3));
      st.style.setProperty('--sh', sh.toFixed(3));
      st.style.pointerEvents = fin > 0.6 ? 'auto' : 'none';
      setLive(fin > 0.6);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);

  return (
    <section ref={secRef} className="op-scene op-fin" aria-label={t('onepage.fin.aria')}
      style={{ height: `${FIN_VH}vh`, marginTop: `-${100 + FIN_OVER_VH}vh` }}>
      <div ref={stageRef} className="op-fin-stage" aria-hidden={!live}>
        <div className="op-fin-left">
          <h2 className="op-fin-h2">{t('onepage.need.cta')}</h2>
          <div className="op-fin-portal" ref={mountRef} />
          {/* Namiesto šípok tlačidlo O NÁS (Matej 28. 9. 2026: *„ani na tejto
              obrazovke nie je treba šípky dolu, skôr tlačítko o nás"*) — klik
              = druhá zastávka finále (portál vľavo, O autorovi + Psia biblia). */}
          <button type="button" className="op-fin-about" onClick={onAbout} tabIndex={live ? 0 : -1}
            style={{ opacity: 'calc(1 - var(--sh, 0))' } as React.CSSProperties}>
            {t('onepage.fin.about')}
          </button>
        </div>
        <div className="op-fin-right">
          <p className="op-fin-eye">{t('onepage.fin.eye')}</p>
          <h3 className="op-fin-h3">{t('onepage.fin.head')}</h3>
          <button type="button" className="op-fin-card" style={{ ['--i' as string]: 0 } as React.CSSProperties} onClick={onAuthor} tabIndex={live ? 0 : -1}>
            <b>{t('onepage.fin.author')}</b>
            <span>{t('onepage.fin.authorSub')}</span>
          </button>
          <button type="button" className="op-fin-card" style={{ ['--i' as string]: 1 } as React.CSSProperties} onClick={onBible} tabIndex={live ? 0 : -1}>
            <b>{t('onepage.fin.bible')}</b>
            <span>{t('onepage.fin.bibleSub')}</span>
          </button>
        </div>
      </div>
      <style>{PORTAL_CSS + `
        .op-fin { position: relative; z-index: 6; pointer-events: none; }
        .op-fin-stage {
          position: sticky; top: 0; height: 100vh; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          padding: var(--op-nav-h, 124px) 16px 120px; /* spodok = šípky filmu */
          background: ${LAB.pageBg};
          opacity: var(--fin, 0);
          pointer-events: none;
        }
        .op-fin-stage::before { content: ''; position: absolute; inset: 0; background: ${LAB.pageBackdrop}; pointer-events: none; }
        .op-fin-left {
          position: relative; display: flex; flex-direction: column; align-items: center; gap: 24px;
          transform: translateX(calc(var(--sh, 0) * -1 * min(24vw, 300px)));
        }
        .op-fin-portal { display: flex; justify-content: center; margin: 24px 0; }
        /* Jadro LAPIS, ako na guli (Matej 28. 9. 2026). */
        .op-fin-portal .ph-bed { background: radial-gradient(120% 120% at 50% 30%, rgba(30,60,144,.9) 0%, rgba(22,48,122,.9) 55%, rgba(10,26,74,.92) 100%); }
        .op-fin-portal .ph-add-veil { background: linear-gradient(180deg, rgba(10,26,74,0.12), rgba(10,26,74,0.5)); }
        .op-fin-portal .ph-lbl { text-align: center; line-height: 1.15; }
        .op-fin-portal .ph-portal { --ph-w: clamp(200px, 22vw, 260px); }
        .op-fin-h2 {
          margin: 0; font: 700 clamp(24px, 3.4vw, 40px)/1.1 'Cinzel', serif; letter-spacing: .06em;
          text-transform: uppercase; color: ${LAB.goldSolid}; text-align: center;
          position: relative; z-index: 3;
        }
        .op-fin-portal .ph-no { display: inline-block; margin-top: 4px; font: 700 1.5em/1 'Cinzel', serif; letter-spacing: .04em; color: ${LAPIS.ink}; }
        .op-fin-about {
          position: relative; z-index: 3; cursor: pointer;
          padding: 12px 32px; border-radius: 8px; border: 1.5px solid rgba(250,244,236,0.30);
          background: ${LAPIS.grad}; box-shadow: ${LAPIS_BTN_SHADOW};
          font: 700 16px/1 'Cinzel', serif; letter-spacing: .06em; text-transform: uppercase; color: ${LAPIS.ink};
          transition: transform .2s ease;
        }
        .op-fin-about:hover { background: ${LAPIS.gradHover}; transform: translateY(-2px); }
        .op-fin-right {
          position: absolute; left: 50%; top: 50%;
          width: min(380px, 40vw);
          transform: translate(calc(min(4vw, 48px) + 40px * (1 - var(--sh, 0))), -40%);
          opacity: var(--sh, 0);
          display: flex; flex-direction: column; gap: 12px;
        }
        .op-fin-eye { margin: 0; font: 500 11px/1.2 'Space Grotesk', sans-serif; letter-spacing: .22em; text-transform: uppercase; color: ${LAB.inkSoft}; }
        .op-fin-h3 { margin: 0 0 12px; font: 700 24px/1.2 'Cinzel', serif; letter-spacing: .06em; color: ${LAB.ink}; }
        .op-fin-card {
          display: flex; flex-direction: column; gap: 4px; text-align: left;
          padding: 16px 24px; border-radius: 12px; cursor: pointer;
          background: rgba(255,251,241,.6); border: 1px solid rgba(201,154,63,.45);
          box-shadow: 0 4px 16px rgba(42,22,8,.08);
          transition: transform .2s ease, border-color .2s ease;
        }
        .op-fin-card:hover { transform: translateY(-2px); border-color: ${LAPIS.edge}; }
        .op-fin-card b { font: 700 16px/1.2 'Cinzel', serif; letter-spacing: .06em; color: ${LAPIS.edge}; text-transform: uppercase; }
        .op-fin-card span { font: 400 14px/1.4 'Space Grotesk', sans-serif; color: ${LAB.inkSoft}; }
        @media (max-width: 768px) {
          .op-fin-stage { flex-direction: column; justify-content: flex-start; padding-top: calc(var(--op-nav-h, 118px) + 16px); }
          .op-fin-left { transform: translateY(calc(var(--sh, 0) * -8vh)) scale(calc(1 - var(--sh, 0) * .3)); transform-origin: 50% 0; }
          .op-fin-right {
            left: 16px; right: 16px; top: auto; bottom: 112px; width: auto; /* nad spodnou lištou */
            transform: translateY(calc(24px * (1 - var(--sh, 0))));
          }
        }
      `}</style>
    </section>
  );
}
