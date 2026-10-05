/**
 * FINÁLE — dva posledné obrazy filmu (Matej 5. 10. 2026).
 *
 * *„rozdeľme ešte tento slajd na 2 — úvodný budú moje slová a posledný budú
 * aktuality a štatistiky"* · *„musí byť pekná, úprimná, minimalistická…
 * nadpis musí byť výrazný"*.
 *
 *   A · MOJE SLOVÁ   fotka Mateja s Hektorom (`kontakt-matej-hektor.webp`,
 *                    neskôr YouTube video) + DOG IS GOD (for me) + tri odseky
 *   B · ČO ĎALEJ     tri čísla (odpracované hodiny · verzia · dni do mobilnej
 *                    appky) · tri ďalšie kroky + zvyšok po rozkliku · kontakty
 *
 * Nadpisy sú v SYSTÉME NADPISOV FILMU (Cinzel 700, `.04em`, FILM_GOLD,
 * `--op-h-obraz`) — prvá verzia z 5. 10. ho nemala, nadpis padol na tenký
 * Cinzel 400 a obraz vyzeral, akoby bol z iného webu.
 *
 * Javisko sa vynorí NAD dohraným WE NEED YOU (sekcia je zasunutá o
 * `FIN_OVER_VH` pod jeho koniec), potom sa A prelína na B. Zastávky:
 * `FIN_STOPS` (OnePage.filmStops).
 *
 * 🔴 VÝBER FOTKY PRE HEROFLOW OSTÁVA TU (`START_HEROFLOW`): CTA vo WE NEED
 * YOU ním otvorí výber fotky → kartu `openPhotoConfirm` → `/heroglyph/name`.
 * Je to cesta, ktorou šiel portál z 28. 9., len bez portálu.
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
import PULSE from '@/data/onepagePulse.json';

/** Udalosť, ktorou iné miesto filmu spustí heroflow (výber fotky → potvrdenie →
 *  `/heroglyph/name`). `detail.handled` ostane `false`, kým finále nie je pripojené. */
export const START_HEROFLOW = 'dogypt:start-heroflow';
export function startHeroflow(): boolean {
  const ev = new CustomEvent(START_HEROFLOW, { detail: { handled: false } });
  window.dispatchEvent(ev);
  return ev.detail.handled;
}

/** O koľko vh je finále zasunuté pod koniec WE NEED YOU (= dĺžka vynorenia A). */
export const FIN_OVER_VH = 40;
/** Dráha prelínania A → B. */
const FIN_NEXT_VH = 100;
export const FIN_VH = 100 + FIN_OVER_VH + FIN_NEXT_VH;
const TRACK = FIN_OVER_VH + FIN_NEXT_VH;
/** Zastávky motora: A (moje slová) · B (čo ďalej). */
export const FIN_STOPS = [FIN_OVER_VH / TRACK, 1];

/** Mobilná appka — Matej 5. 10. 2026: *„appka na mobil za a počet dní — dajme od 02/2027"*. */
const APP_DATE = new Date(2027, 1, 1);
/** Ďalšie kroky: prvé tri na obrazovke, zvyšok po rozkliku. Text je v slovníku. */
const STEPS = 3;
const STEPS_ALL = 6;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (v: number, a: number, b: number) => clamp01((v - a) / Math.max(1e-6, b - a));
const smooth = (x: number) => x * x * (3 - 2 * x);

const EMAIL = 'woof@dogypt.com';

export default function FilmFinale({ packNo, onDogma }: { packNo: number | null; onDogma: () => void }) {
  const t = useT();
  const navigate = useNavigate();
  const secRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const packRef = useRef(packNo);
  packRef.current = packNo;
  const [on, setOn] = useState<'a' | 'b' | null>(null);
  const [more, setMore] = useState(false);
  const days = Math.max(0, Math.ceil((APP_DATE.getTime() - Date.now()) / 864e5));

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
    const step = () => {
      const sec = secRef.current, st = stageRef.current;
      if (!sec || !st) return;
      const r = sec.getBoundingClientRect();
      const p = clamp01(-r.top / Math.max(1, r.height - window.innerHeight));
      const fin = seg(p, 0, FIN_STOPS[0]);
      const nx = smooth(seg(p, FIN_STOPS[0] + 0.04, 0.96));
      st.style.setProperty('--fin', fin.toFixed(3));
      st.style.setProperty('--nx', nx.toFixed(3));
      setOn(fin <= 0.6 ? null : nx > 0.6 ? 'b' : nx < 0.4 ? 'a' : null);
    };
    step();
    window.addEventListener('scroll', step, { passive: true });
    window.addEventListener('resize', step);
    return () => { window.removeEventListener('scroll', step); window.removeEventListener('resize', step); };
  }, []);
  useEffect(() => { if (on !== 'b') setMore(false); }, [on]);

  const tabB = on === 'b' ? 0 : -1;
  const steps = Array.from({ length: more ? STEPS_ALL : STEPS }, (_, i) => i + 1);
  return (
    <section ref={secRef} className="op-scene op-fin" aria-label={t('onepage.fin.aria')}
      style={{ height: `${FIN_VH}vh`, marginTop: `-${100 + FIN_OVER_VH}vh` }}>
      <div ref={stageRef} className="op-fin-stage">
        {/* ── A · MOJE SLOVÁ ─────────────────────────────────────────── */}
        <div className="op-fin-a" aria-hidden={on !== 'a'} style={{ pointerEvents: on === 'a' ? 'auto' : 'none' }}>
          <figure className="op-fin-photo">
            <img src="/images/kontakt-matej-hektor.webp" alt={t('onepage.fin.photoAlt')} />
          </figure>
          <div className="op-fin-words">
            <h2 className="op-fin-h2 op-fin-h2--left">
              DOG IS GOD <small>{t('onepage.fin.forMe')}</small>
            </h2>
            <p className="op-fin-txt">{t('onepage.fin.p1')}</p>
            <p className="op-fin-txt">{t('onepage.fin.p2')}</p>
            <p className="op-fin-txt op-fin-txt--last">{t('onepage.fin.p3')}</p>
          </div>
        </div>

        {/* ── B · ČO ĎALEJ ───────────────────────────────────────────── */}
        <div className="op-fin-b" data-film-free aria-hidden={on !== 'b'} style={{ pointerEvents: on === 'b' ? 'auto' : 'none' }}>
          <h2 className="op-fin-h2">{t('onepage.fin.nextHead')}</h2>
          {/* Čísla: hodiny z `plany/praca-log.json` (gen-praca-stats → onepagePulse.json,
              čerstvé k poslednému deployu), dni do appky sa rátajú pri otvorení. */}
          <div className="op-fin-stats">
            <div className="op-fin-stat">
              <b>{PULSE.hours.toLocaleString('en-US')}<small> h</small></b>
              <span>{t('onepage.fin.statHours')}</span>
            </div>
            <div className="op-fin-stat">
              <b>1.MVP</b>
              <span>{t('onepage.fin.statVersion')}</span>
            </div>
            <div className="op-fin-stat">
              <b>{days.toLocaleString('en-US')}</b>
              <span>{t('onepage.fin.statApp')}</span>
            </div>
          </div>
          <ol className={`op-fin-steps${more ? ' is-more' : ''}`}>
            {steps.map((n) => (
              <li key={n}><i>{n}</i><span>{t(`onepage.fin.step${n}`)}</span></li>
            ))}
          </ol>
          <button type="button" className="dgx-example op-fin-more" onClick={() => setMore((m) => !m)} tabIndex={tabB}>
            {t(more ? 'onepage.fin.less' : 'onepage.fin.more')}
          </button>
          <div className="op-fin-links">
            {SOCIALS.map((s) => (
              <a key={s.id} className="op-fin-blk op-fin-blk--ico" href={s.href} target="_blank" rel="noreferrer"
                aria-label={s.label} tabIndex={tabB}>
                {s.icon}
              </a>
            ))}
            <a className="op-fin-blk op-fin-blk--mail" href={`mailto:${EMAIL}`} tabIndex={tabB}>{EMAIL}</a>
            <button type="button" className="op-fin-blk" onClick={onDogma} tabIndex={tabB}>DOGMA</button>
          </div>
          <p className="op-fin-legal">
            <a href="/privacy" tabIndex={tabB}>{t('about.footer.privacy')}</a>
            <span>·</span>
            <a href="/terms" tabIndex={tabB}>{t('about.footer.terms')}</a>
            <span>·</span>
            <a href="#" tabIndex={tabB} onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('dogypt:open-consent')); }}>
              {t('consent.footerLink')}
            </a>
            <span>·</span>
            <span>© 2026 DOGYPT</span>
          </p>
        </div>
      </div>
      <style>{`
        .op-fin { position: relative; z-index: 6; pointer-events: none; }
        .op-fin-stage {
          position: sticky; top: 0; height: 100vh; overflow: hidden;
          background: ${LAB.pageBg};
          opacity: var(--fin, 0);
          pointer-events: none;
        }
        .op-fin-stage::before { content: ''; position: absolute; inset: 0; background: ${LAB.pageBackdrop}; pointer-events: none; }
        .op-fin-a, .op-fin-b {
          position: absolute; inset: 0;
          padding: var(--op-nav-h, 124px) 16px 24px;
          display: flex; align-items: center; justify-content: center;
        }
        .op-fin-a { opacity: calc(1 - var(--nx, 0)); transform: translateY(calc(var(--nx, 0) * -24px)); }
        .op-fin-b {
          flex-direction: column; gap: 16px; text-align: center;
          opacity: var(--nx, 0); transform: translateY(calc((1 - var(--nx, 0)) * 24px));
        }

        /* NADPIS = SYSTÉM NADPISOV FILMU (veľkosť a zlato nesie .op-root .op-fin-h2 v OnePage). */
        .op-fin-h2 { margin: 0; font-family: 'Cinzel', serif; font-weight: 700; text-transform: uppercase; }
        .op-root .op-fin .op-fin-h2--left { text-align: left; }
        .op-root .op-fin .op-fin-h2--left::after { left: 0; transform: none; }
        .op-fin-h2 small {
          font: 500 .36em/1 'Space Grotesk', sans-serif; letter-spacing: .02em; text-transform: none;
          vertical-align: middle; margin-left: 8px;
        }

        /* ── A ── */
        .op-fin-a { gap: 48px; }
        .op-fin-photo {
          margin: 0; flex: 0 0 auto; height: min(560px, calc(100vh - var(--op-nav-h, 124px) - 48px));
          aspect-ratio: 2 / 3; border-radius: 16px; overflow: hidden;
          box-shadow: 0 0 0 1px rgba(201,154,63,.45), 0 16px 40px -16px rgba(42,22,8,.35);
        }
        .op-fin-photo img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; display: block; }
        .op-fin-words { max-width: 520px; display: flex; flex-direction: column; gap: 16px; text-align: left; }
        .op-fin-words .op-fin-h2 { margin-bottom: 8px; }
        .op-fin-txt { margin: 0; font: 400 16px/1.6 'Space Grotesk', sans-serif; color: ${LAB.ink}; }
        .op-fin-txt--last { font-weight: 600; }

        /* ── B ── */
        .op-fin-b .op-fin-h2 { padding-bottom: 16px; }
        .op-fin-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 168px)); gap: 12px; justify-content: center; }
        .op-fin-stat {
          display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 16px 12px;
          border-radius: 12px; background: rgba(255,251,241,.6); border: 1px solid rgba(201,154,63,.45);
        }
        .op-fin-stat b { font: 700 24px/1 'Cinzel', serif; letter-spacing: .04em; color: ${LAB.goldInk}; }
        .op-fin-stat span { font: 500 12px/1.3 'Space Grotesk', sans-serif; color: ${LAB.inkSoft}; }
        .op-fin-steps {
          list-style: none; margin: 0; padding: 0; width: min(520px, 100%);
          display: flex; flex-direction: column; gap: 8px; text-align: left;
        }
        .op-fin-steps li { display: flex; align-items: center; gap: 12px; font: 400 14px/1.4 'Space Grotesk', sans-serif; color: ${LAB.ink}; }
        .op-fin-steps i {
          flex: 0 0 auto; width: 24px; height: 24px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center;
          font: 700 12px/1 'Cinzel', serif; font-style: normal; color: ${LAPIS.edge}; border: 1.5px solid ${LAPIS.edge};
        }
        .op-fin-stat b small { font: 500 .6em/1 'Space Grotesk', sans-serif; }
        /* Rozbalené kroky idú na PC do dvoch stĺpcov — šesť pod sebou by
           pretieklo spodok nízkeho okna (1477 × 724). */
        .op-fin-steps.is-more { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, auto); grid-auto-flow: column; gap: 8px 24px; width: min(832px, 100%); }
        .op-fin-more { margin: 0; }
        .op-fin-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 8px; }
        .op-fin-blk {
          height: 40px; min-width: 40px; padding: 0 16px; border-radius: 12px; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          background: rgba(255,251,241,.6); border: 1px solid rgba(201,154,63,.45);
          color: ${LAB.goldInk}; text-decoration: none;
          font: 700 14px/1 'Cinzel', serif; letter-spacing: .04em;
          transition: transform .2s ease, border-color .2s ease, color .2s ease;
        }
        .op-fin-blk:hover { transform: translateY(-2px); border-color: ${LAPIS.edge}; color: ${LAPIS.edge}; }
        .op-fin-blk--ico { padding: 0; width: 40px; }
        .op-fin-blk--ico svg { width: 20px; height: 20px; }
        .op-fin-blk--mail { font: 500 14px/1 'Space Grotesk', sans-serif; letter-spacing: .02em; }
        .op-fin-legal {
          margin: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;
          font: 400 12px/1.4 'Space Grotesk', sans-serif; color: ${LAB.inkSoft};
        }
        .op-fin-legal a { color: inherit; text-decoration: none; }
        .op-fin-legal a:hover { color: ${LAB.ink}; text-decoration: underline; }

        @media (max-width: 768px) {
          .op-fin-a { flex-direction: column; justify-content: flex-start; gap: 16px; padding-top: calc(var(--op-nav-h, 118px) + 8px); }
          .op-fin-photo { height: 30vh; }
          .op-fin-words { gap: 8px; }
          .op-fin-txt { font-size: 14px; line-height: 1.5; }
          .op-fin-b { justify-content: flex-start; gap: 12px; padding-top: calc(var(--op-nav-h, 118px) + 8px); }
          .op-fin-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); width: 100%; gap: 8px; }
          .op-fin-stat { padding: 12px 4px; }
          .op-fin-stat b { font-size: 20px; }
          .op-fin-stat span { font-size: 10px; }
          .op-fin-steps li { font-size: 12px; }
          .op-fin-steps.is-more { grid-template-columns: 1fr; grid-template-rows: none; grid-auto-flow: row; }
          /* B je posledný obraz: rozbalené kroky smú na nízkom telefóne odrolovať
             VNÚTRI obrazu (data-film-free = motor filmu ho nechá tak). Obsah stojí
             zhora (flex-start), takže pretečenie ide len dole a dá sa dočítať. */
          .op-fin-b { overflow-y: auto; overscroll-behavior: contain; }
        }
        /* Nízky telefón: ustúpi FOTKA, nie vzduch (PAGE_AIR). */
        @media (max-width: 768px) and (max-height: 720px) {
          .op-fin-a { gap: 8px; }
          .op-fin-photo { height: 24vh; }
          .op-fin-words .op-fin-h2 { margin-bottom: 0; }
          .op-fin-txt { font-size: 12px; line-height: 1.4; }
        }
      `}</style>
    </section>
  );
}
