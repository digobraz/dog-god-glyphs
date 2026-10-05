/**
 * FINÁLE — KONTAKT, posledný obraz filmu (Matej 5. 10. 2026).
 *
 * *„toto bude pravdepodobne posledný slajd, tie ďalšie čo sú tam za týmto
 * môžeš dať preč — bude tam už len posledný SLAJD a ten bude viac-menej
 * kontakt a oznam. Na jednej strane (30 %) fotka mňa a Hektora vo faraónskom
 * (pribudne tam neskôr YTB video) a vedľa text: nadpis DOG IS GOD (for me)…
 * dolu odkazy v blokoch: sociálne siete, e-mail, DOGMA, privacy"*.
 *
 * NAHRADILO (28. 9. 2026): veľký portál s fotkou psa, tlačidlo O NÁS a dvere
 * O autorovi / Psia biblia. Za finále zároveň zhasol podpis (logo + tagline),
 * kniha v päte aj pätička — prepínač `TAIL_ON` v OnePage.tsx.
 *
 * Javisko sa vynorí NAD dohraným WE NEED YOU (sekcia je o `FIN_OVER_VH`
 * zasunutá pod jeho koniec, `.op-wny` si o toľko predĺžila výdrž) a ostane.
 * Jedna zastávka: `FIN_STOPS` (OnePage.filmStops).
 *
 * 🔴 VÝBER FOTKY PRE HEROFLOW OSTÁVA TU, hoci portál zanikol. CTA vo WE NEED
 * YOU ho spúšťa udalosťou `START_HEROFLOW` (výber fotky → karta
 * `openPhotoConfirm` → `/heroglyph/name`) — je to tá istá cesta, akou šiel
 * portál, len bez portálu.
 *
 * 🎬 Ľavý stĺpec je pripravený na YouTube video namiesto fotky — pomer
 * `.op-fin-media` sa vtedy zmení na 16:9 alebo 9:16 podľa videa.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { LAB } from '@/lib/labTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { SOCIALS } from '@/components/landing/Footer';
import { openPhotoConfirm } from '@/components/gods/photoConfirm';
import { intakePhoto, finishPhotoChoice } from '@/lib/photoIntake';
import { track } from '@/lib/analytics';

/** Udalosť, ktorou iné miesto filmu spustí heroflow (výber fotky → potvrdenie →
 *  `/heroglyph/name`). `detail.handled` ostane `false`, kým finále nie je pripojené. */
export const START_HEROFLOW = 'dogypt:start-heroflow';
export function startHeroflow(): boolean {
  const ev = new CustomEvent(START_HEROFLOW, { detail: { handled: false } });
  window.dispatchEvent(ev);
  return ev.detail.handled;
}

/** O koľko vh je finále zasunuté pod koniec WE NEED YOU (= dĺžka vynorenia). */
export const FIN_OVER_VH = 40;
export const FIN_VH = 100 + FIN_OVER_VH;
/** Zastávka motora: kontakt naplno. */
export const FIN_STOPS = [1];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const EMAIL = 'woof@dogypt.com';

export default function FilmFinale({ packNo, onDogma }: { packNo: number | null; onDogma: () => void }) {
  const t = useT();
  const navigate = useNavigate();
  const secRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const packRef = useRef(packNo);
  packRef.current = packNo;
  const [live, setLive] = useState(false);

  // ── HEROFLOW: výber fotky ─────────────────────────────────────────────
  useEffect(() => {
    const file = document.createElement('input');
    file.type = 'file'; file.accept = 'image/*'; file.className = 'ph-add-file';
    file.style.display = 'none';
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
    file.addEventListener('change', () => {
      const f = file.files?.[0];
      if (!f) return;
      const intake = intakePhoto(f);
      uploading = intake.uploaded;
      picked = intake.previewUrl;
      showConfirm(picked);
    });
    document.body.append(file);
    const onStart = (e: Event) => {
      (e as CustomEvent<{ handled: boolean }>).detail.handled = true;
      if (picked) showConfirm(picked); else openPicker();
    };
    window.addEventListener(START_HEROFLOW, onStart);
    return () => { file.remove(); window.removeEventListener(START_HEROFLOW, onStart); };
  }, [navigate]);

  // ── RÉŽIA PODĽA SCROLLU ───────────────────────────────────────────────
  useEffect(() => {
    const on = () => {
      const sec = secRef.current, st = stageRef.current;
      if (!sec || !st) return;
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      const fin = clamp01(-r.top / Math.max(1, r.height - vh));
      st.style.setProperty('--fin', fin.toFixed(3));
      st.style.pointerEvents = fin > 0.6 ? 'auto' : 'none';
      setLive(fin > 0.6);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);

  const tab = live ? 0 : -1;
  return (
    <section ref={secRef} className="op-scene op-fin" aria-label={t('onepage.fin.aria')}
      style={{ height: `${FIN_VH}vh`, marginTop: `-${100 + FIN_OVER_VH}vh` }}>
      <div ref={stageRef} className="op-fin-stage" aria-hidden={!live}>
        <div className="op-fin-wrap">
          <div className="op-fin-media">
            <img src="/images/council-pharaoh.webp" alt={t('onepage.fin.photoAlt')} />
          </div>
          <div className="op-fin-body">
            <h2 className="op-fin-h2">
              DOG IS GOD <small>{t('onepage.fin.forMe')}</small>
            </h2>
            <p className="op-fin-txt">{t('onepage.fin.p1')}</p>
            <p className="op-fin-txt">{t('onepage.fin.p2')}</p>
            <p className="op-fin-txt"><b>{t('onepage.fin.p3')}</b></p>
            <div className="op-fin-links">
              {SOCIALS.map((s) => (
                <a key={s.id} className="op-fin-blk op-fin-blk--ico" href={s.href} target="_blank" rel="noreferrer"
                  aria-label={s.label} tabIndex={tab}>
                  {s.icon}
                </a>
              ))}
              <a className="op-fin-blk op-fin-blk--mail" href={`mailto:${EMAIL}`} tabIndex={tab}>{EMAIL}</a>
              <button type="button" className="op-fin-blk op-fin-blk--dogma" onClick={onDogma} tabIndex={tab}>DOGMA</button>
            </div>
            <p className="op-fin-legal">
              <a href="/privacy" tabIndex={tab}>{t('about.footer.privacy')}</a>
              <span>·</span>
              <a href="/terms" tabIndex={tab}>{t('about.footer.terms')}</a>
              <span>·</span>
              <a href="#" tabIndex={tab} onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('dogypt:open-consent')); }}>
                {t('consent.footerLink')}
              </a>
              <span>·</span>
              <span>© 2026 DOGYPT</span>
            </p>
          </div>
        </div>
      </div>
      <style>{`
        .op-fin { position: relative; z-index: 6; pointer-events: none; }
        .op-fin-stage {
          position: sticky; top: 0; height: 100vh; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          padding: var(--op-nav-h, 124px) 16px 24px;
          background: ${LAB.pageBg};
          opacity: var(--fin, 0);
          pointer-events: none;
        }
        .op-fin-stage::before { content: ''; position: absolute; inset: 0; background: ${LAB.pageBackdrop}; pointer-events: none; }
        .op-fin-wrap {
          position: relative; width: min(1040px, 100%);
          display: grid; grid-template-columns: 3fr 7fr; gap: 48px; align-items: center;
          transform: translateY(calc(24px * (1 - var(--fin, 0))));
        }
        .op-fin-media { display: flex; justify-content: center; }
        .op-fin-media img {
          width: 100%; max-height: calc(100vh - var(--op-nav-h, 124px) - 48px);
          object-fit: contain; display: block;
        }
        .op-fin-body { display: flex; flex-direction: column; gap: 12px; text-align: left; }
        .op-root .op-fin .op-fin-h2 { text-align: left; margin-bottom: 12px; }
        .op-root .op-fin .op-fin-h2::after { left: 0; transform: none; }
        .op-fin-h2 small {
          font: 500 .32em/1 'Space Grotesk', sans-serif; letter-spacing: .02em; text-transform: none;
          vertical-align: middle;
        }
        .op-fin-txt {
          margin: 0; max-width: 560px;
          font: 400 16px/1.55 'Space Grotesk', sans-serif; color: ${LAB.ink};
        }
        .op-fin-txt b { font-weight: 600; }
        .op-fin-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
        .op-fin-blk {
          height: 48px; min-width: 48px; padding: 0 16px; border-radius: 12px; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          background: rgba(255,251,241,.6); border: 1px solid rgba(201,154,63,.45);
          box-shadow: 0 4px 16px rgba(42,22,8,.08);
          color: ${LAB.goldInk}; text-decoration: none;
          font: 700 14px/1 'Cinzel', serif; letter-spacing: .06em;
          transition: transform .2s ease, border-color .2s ease, color .2s ease;
        }
        .op-fin-blk:hover { transform: translateY(-2px); border-color: ${LAPIS.edge}; color: ${LAPIS.edge}; }
        .op-fin-blk--ico { padding: 0; width: 48px; }
        .op-fin-blk--ico svg { width: 24px; height: 24px; }
        .op-fin-blk--mail { font: 500 14px/1 'Space Grotesk', sans-serif; letter-spacing: .02em; }
        .op-fin-legal {
          margin: 16px 0 0; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
          font: 400 12px/1.4 'Space Grotesk', sans-serif; color: ${LAB.inkSoft};
        }
        .op-fin-legal a { color: inherit; text-decoration: none; }
        .op-fin-legal a:hover { color: ${LAB.ink}; text-decoration: underline; }
        @media (max-width: 768px) {
          .op-fin-stage { align-items: flex-start; padding-top: calc(var(--op-nav-h, 118px) + 8px); }
          .op-fin-wrap { grid-template-columns: 1fr; gap: 12px; }
          .op-fin-media img { width: auto; max-width: 100%; height: 24vh; max-height: none; }
          .op-fin-body { gap: 8px; }
          .op-root .op-fin .op-fin-h2 { margin-bottom: 4px; }
          .op-fin-txt { font-size: 14px; line-height: 1.45; }
          .op-fin-links { margin-top: 8px; }
          .op-fin-blk { height: 40px; min-width: 40px; }
          .op-fin-blk--ico { width: 40px; }
          .op-fin-blk--ico svg { width: 20px; height: 20px; }
          .op-fin-legal { margin-top: 8px; }
        }
        /* Nízky telefón (360 × 640): ustúpi FOTKA, nie vzduch (PAGE_AIR). */
        @media (max-width: 768px) and (max-height: 720px) {
          .op-fin-media img { height: 14vh; }
          .op-fin-txt { font-size: 12px; }
          .op-fin-legal { margin-top: 4px; }
        }
      `}</style>
    </section>
  );
}
