/**
 * FINÁLE — dva posledné obrazy filmu (Matej 5. 10. 2026).
 *
 * *„rozdeľme ešte tento slajd na 2 — úvodný budú moje slová a posledný budú
 * aktuality a štatistiky"* · *„musí byť pekná, úprimná, minimalistická…
 * nadpis musí byť výrazný"*.
 *
 *   A · MOJE SLOVÁ   výrez Mateja s Hektorom bez pozadia (`kontakt-matej-hektor-cut.webp`,
 *                    neskôr YouTube video) + DOG IS GOD (for me) + tri odseky
 *   B · ČO ĎALEJ     TMAVÝ, v štýle AINUBISA (Matej 5. 10. 2026 večer): od 2018 · online
 *                    od 2026 · hodiny práce · „na čom práve pracujeme" z nástenky dashboardu ·
 *                    pozvánka do verejného AINUBIS chatu · siete · kontakty.
 *                    Nákres: `plany/nakres-posledna-karta-2026-10-05/`.
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
import { useT, useLang } from '@/i18n/LanguageContext';
import { LAB } from '@/lib/labTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { SOCIALS } from '@/components/landing/Footer';
import { openPhotoConfirm } from '@/components/gods/photoConfirm';
import { intakePhoto, finishPhotoChoice } from '@/lib/photoIntake';
import { track } from '@/lib/analytics';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { openAinubis } from '@/lib/ainubisBus';
import ainubisHead from '@/assets/ainubis-head.webp';
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

/** Rýchle voľby pozvánky do chatu — klik otvorí AINUBISA s rozpísaným začiatkom správy. */
const ASKS = ['idea', 'broken', 'help', 'join'] as const;
/** Dátum nástenky „2026-10-04" → „4 Oct 2026" (mesiac podľa jazyka). */
function boardDate(iso: string | null, lang: string): string {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'en' ? 'en-GB' : lang, { day: 'numeric', month: 'short', year: 'numeric' });
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (v: number, a: number, b: number) => clamp01((v - a) / Math.max(1e-6, b - a));
const smooth = (x: number) => x * x * (3 - 2 * x);

const EMAIL = 'woof@dogypt.com';
/** Brand v3.2 zlato — na tmavom podklade B (LAB.goldInk je atrament pre papier). */
const GOLD = '#C99A3F';

export default function FilmFinale({ packNo, onDogma }: { packNo: number | null; onDogma: () => void }) {
  const t = useT();
  const navigate = useNavigate();
  const secRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const packRef = useRef(packNo);
  packRef.current = packNo;
  const { lang } = useLang();
  const [on, setOn] = useState<'a' | 'b' | null>(null);

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
  const tabB = on === 'b' ? 0 : -1;
  return (
    <section ref={secRef} className="op-scene op-fin" aria-label={t('onepage.fin.aria')}
      style={{ height: `${FIN_VH}vh`, marginTop: `-${100 + FIN_OVER_VH}vh` }}>
      <div ref={stageRef} className="op-fin-stage">
        {/* Tmavá plocha AINUBISA sa rozsvieti spolu s B (opacity = --nx). */}
        <div className="op-fin-dark" aria-hidden />
        {/* ── A · MOJE SLOVÁ ─────────────────────────────────────────── */}
        <div className="op-fin-a" aria-hidden={on !== 'a'} style={{ pointerEvents: on === 'a' ? 'auto' : 'none' }}>
          <figure className="op-fin-photo">
            {/* Dve veľkosti (Matej: *„veľmi slabá kvalita, rozmazanú tvár mám"* — 1600 px na
                výšku sa pri 150 % a retine rozťahoval). `sizes` = šírka výrezu: PC ≈ výška okna,
                mobil ≈ pol výšky okna. */}
            <img src="/images/kontakt-matej-hektor-cut.webp"
              srcSet="/images/kontakt-matej-hektor-cut-m.webp 1048w, /images/kontakt-matej-hektor-cut.webp 1957w"
              sizes="(max-width: 768px) 53vh, 100vh" alt={t('onepage.fin.photoAlt')} />
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

        {/* ── B · ČO ĎALEJ (tmavý, AINUBIS) ───────────────────────────── */}
        <div className="op-fin-b" data-film-free aria-hidden={on !== 'b'} style={{ pointerEvents: on === 'b' ? 'auto' : 'none' }}>
          <div className="op-fin-now">
            <h2 className="op-fin-h2 op-fin-h2--left">{t('onepage.fin.nextHead')}</h2>
            {/* Hodiny = zamrznutý odhad do 14. 8. + zmeraný čas AI agentov z `plany/praca-log.json`
                (gen-praca-stats → onepagePulse.json, čerstvé k poslednému deployu). */}
            <div className="op-fin-stats">
              <div className="op-fin-stat"><b>2018</b><span>{t('onepage.fin.statIdea')}</span></div>
              <div className="op-fin-stat"><b>2026</b><span>{t('onepage.fin.statOnline')}</span></div>
              <div className="op-fin-stat"><b>{PULSE.hours.toLocaleString('en-US')}+</b><span>{t('onepage.fin.statHours')}</span></div>
            </div>
            <div className="op-fin-eb">{t('onepage.fin.nowHead')}</div>
            <ul className="op-fin-work">
              {PULSE.work.map((w, i) => (
                <li key={i}>
                  <span className="op-fin-tag">{t(`onepage.fin.tag.${w.tag}`)}</span>
                  <span className="op-fin-wname">{t(`onepage.fin.work.${w.name}`)}</span>
                  <span className="op-fin-bar"><i style={{ width: `${w.pct}%` }} /></span>
                  <span className="op-fin-pct">{w.pct} %</span>
                </li>
              ))}
            </ul>
            {PULSE.updated && (
              <div className="op-fin-upd"><i />{t('onepage.fin.updated')} {boardDate(PULSE.updated, lang)}</div>
            )}
          </div>

          <div className="op-fin-side">
            <div className="op-fin-ai">
              <img src={ainubisHead} alt="" className="op-fin-ai-head" />
              <div className="op-fin-ai-nm"><span>AI</span>NUBIS</div>
              <p className="op-fin-ai-q">{t('onepage.fin.askHead')}</p>
              <p className="op-fin-ai-sub">{t('onepage.fin.askSub')}</p>
              <div className="op-fin-ai-chips">
                {ASKS.map((k) => (
                  <button key={k} type="button" tabIndex={tabB}
                    onClick={() => { track('onepage_ainubis_chip', { k }); openAinubis(t(`onepage.fin.askPre.${k}`)); }}>
                    {t(`onepage.fin.ask.${k}`)}
                  </button>
                ))}
              </div>
              <button type="button" className="op-fin-ai-cta" tabIndex={tabB}
                onClick={() => { track('onepage_ainubis_open'); openAinubis(); }}>
                {t('onepage.fin.askCta')}
              </button>
            </div>
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
        .op-fin-h2--left { white-space: nowrap; }
        .op-root .op-fin .op-fin-h2--left { text-align: left; }
        .op-root .op-fin .op-fin-h2--left::after { left: 0; transform: none; }
        .op-fin-h2 small {
          font: 500 .36em/1 'Space Grotesk', sans-serif; letter-spacing: .02em; text-transform: none;
          vertical-align: middle; margin-left: 8px;
        }

        /* ── A ── */
        /* VÝREZ BEZ POZADIA, VYCHÁDZAME Z GRADIENTU (Matej 5. 10. 2026: *„odstráň pozadie,
           daj preč rámik a z gradientu vyjdeme obaja, zväčši nás… nech nám je dobre vidno
           tváre, moja tvár môže byť aj v dotyku s navom"* + skica: postava vľavo ukotvená
           na spodok obrazovky, text v bloku vpravo). Výrez = macOS Vision (foreground
           mask) z FOTO-REF/Kontakt.JPG. Hlava sedí tesne pod lištou, kolená odchádzajú
           pod spodný okraj a maska ich rozplynie. */
        .op-fin-a { justify-content: flex-end; padding-right: max(16px, calc(50vw - 560px)); }
        .op-fin-photo {
          position: absolute; margin: 0; bottom: 0; top: calc(var(--op-nav-h, 124px) - 32px);
          /* Celá ľavá polovica — maska strihá na okraji boxu, užší box useknul ruky. */
          left: 0; width: calc(50vw + 40px);
          -webkit-mask-image: linear-gradient(to bottom, #000 62%, transparent 100%);
                  mask-image: linear-gradient(to bottom, #000 62%, transparent 100%);
        }
        .op-fin-photo img {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          height: 150%; width: auto; max-width: none; display: block;
        }
        .op-fin-words {
          position: relative; z-index: 1; width: min(580px, 46vw); display: flex; flex-direction: column; gap: 16px; text-align: left;
          padding: 32px; border-radius: 16px;
          background: rgba(255,251,241,.62); border: 1px solid rgba(201,154,63,.45);
          box-shadow: 0 16px 40px -24px rgba(42,22,8,.35);
        }
        .op-fin-words .op-fin-h2 { margin-bottom: 8px; }
        .op-fin-txt { margin: 0; font: 400 16px/1.6 'Space Grotesk', sans-serif; color: ${LAB.ink}; }
        .op-fin-txt--last { font-weight: 600; }

        /* ── B · TMAVÝ AINUBIS (Matej 5. 10. 2026: *„v štýle ainubisa = tmavá stránka"*) ── */
        .op-fin-dark {
          position: absolute; inset: 0; pointer-events: none; opacity: var(--nx, 0);
          background:
            radial-gradient(90% 70% at 72% 18%, rgba(${AINUBIS.glowRGB},.18) 0%, rgba(${AINUBIS.glowRGB},0) 60%),
            ${AINUBIS.surfaceBase};
        }
        .op-fin-b {
          flex-direction: row; align-items: center; justify-content: center; gap: 48px; text-align: left;
          padding-left: 24px; padding-right: 24px; color: ${AINUBIS.ink};
        }
        .op-fin-now { width: min(560px, 50vw); display: flex; flex-direction: column; }
        .op-fin-side { width: 440px; flex: 0 0 auto; display: flex; flex-direction: column; gap: 12px; }
        .op-fin-b .op-fin-h2 { padding-bottom: 16px; margin-bottom: 16px; }
        .op-fin-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .op-fin-stat {
          display: flex; flex-direction: column; gap: 4px; padding: 12px 16px;
          border-radius: 12px; background: ${AINUBIS.raised}; border: 1px solid ${AINUBIS.edge};
        }
        .op-fin-stat b { font: 700 24px/1 'Cinzel', serif; letter-spacing: .04em; color: ${GOLD}; }
        .op-fin-stat span { font: 400 12px/1.3 'Space Grotesk', sans-serif; color: ${AINUBIS.inkDim}; }
        .op-fin-eb {
          margin: 24px 0 8px; font: 500 10px/1 'Space Grotesk', sans-serif; letter-spacing: .26em;
          text-transform: uppercase; color: ${AINUBIS.cyan};
        }
        .op-fin-work { list-style: none; margin: 0; padding: 0; }
        .op-fin-work li {
          display: grid; grid-template-columns: 88px minmax(0, 1fr) 96px 40px; gap: 12px; align-items: center;
          padding: 8px 0; border-bottom: 1px solid rgba(${AINUBIS.cyanRGB},.10);
          font: 400 14px/1.3 'Space Grotesk', sans-serif; color: ${AINUBIS.ink};
        }
        .op-fin-tag {
          justify-self: start; padding: 4px 8px; border-radius: 999px; border: 1px solid ${AINUBIS.edgeStrong};
          font: 500 10px/1 'Space Grotesk', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: ${AINUBIS.cyan};
        }
        .op-fin-bar { height: 6px; border-radius: 999px; background: rgba(${AINUBIS.cyanRGB},.12); overflow: hidden; }
        .op-fin-bar i { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, ${AINUBIS.glow}, ${AINUBIS.cyan}); box-shadow: 0 0 8px ${AINUBIS.cyan}; }
        .op-fin-pct { font-size: 12px; text-align: right; color: ${AINUBIS.inkDim}; }
        .op-fin-upd { margin-top: 8px; font: 500 10px/1 'Space Grotesk', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: ${AINUBIS.inkFaint}; }
        .op-fin-upd i { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; background: ${AINUBIS.ok}; box-shadow: 0 0 8px ${AINUBIS.ok}; vertical-align: -1px; }

        .op-fin-ai {
          display: flex; flex-direction: column; align-items: center; text-align: center; padding: 24px;
          border-radius: 16px; background: rgba(7,16,25,.72); border: 1px solid ${AINUBIS.edge}; box-shadow: ${AINUBIS.panelShadow};
        }
        .op-fin-ai-head { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; background: #000; border: 2px solid ${AINUBIS.cyan}; box-shadow: 0 0 18px ${AINUBIS.cyan}; }
        .op-fin-ai-nm { margin-top: 8px; font: 700 16px/1 'Cinzel', serif; letter-spacing: .14em; color: ${AINUBIS.ink}; }
        .op-fin-ai-nm span { color: ${AINUBIS.cyan}; }
        .op-fin-ai-q { margin: 16px 0 8px; font: 700 20px/1.3 'Cinzel', serif; letter-spacing: .04em; color: ${AINUBIS.ink}; }
        .op-fin-ai-sub { margin: 0; font: 400 14px/1.4 'Space Grotesk', sans-serif; color: ${AINUBIS.inkDim}; }
        .op-fin-ai-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 16px 0; }
        .op-fin-ai-chips button {
          cursor: pointer; padding: 8px 12px; border-radius: 999px; border: 1px solid ${AINUBIS.edge};
          background: rgba(${AINUBIS.cyanRGB},.06); color: ${AINUBIS.ink}; font: 500 12px/1 'Space Grotesk', sans-serif;
          transition: border-color .2s ease, background .2s ease;
        }
        .op-fin-ai-chips button:hover { border-color: ${AINUBIS.edgeStrong}; background: rgba(${AINUBIS.cyanRGB},.14); }
        .op-fin-ai-cta {
          cursor: pointer; width: 100%; height: 48px; border: 0; border-radius: 8px;
          background: ${AINUBIS.ctaGrad}; color: #2a1608;
          font: 700 14px/1 'Cinzel', serif; letter-spacing: .14em; text-transform: uppercase;
          transition: transform .2s ease;
        }
        .op-fin-ai-cta:hover { transform: translateY(-2px); }
        .op-fin-links { display: flex; flex-wrap: wrap; gap: 8px; }
        .op-fin-blk {
          height: 40px; min-width: 40px; padding: 0 16px; border-radius: 999px; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          background: transparent; border: 1px solid rgba(201,154,63,.5);
          color: ${GOLD}; text-decoration: none;
          font: 700 14px/1 'Cinzel', serif; letter-spacing: .04em;
          transition: transform .2s ease, border-color .2s ease, color .2s ease;
        }
        .op-fin-blk:hover { transform: translateY(-2px); border-color: ${AINUBIS.cyan}; color: ${AINUBIS.cyan}; }
        .op-fin-blk--ico { padding: 0; width: 40px; }
        .op-fin-blk--ico svg { width: 20px; height: 20px; }
        .op-fin-blk--mail { font: 500 14px/1 'Space Grotesk', sans-serif; letter-spacing: .02em; }
        .op-fin-legal {
          margin: 0; display: flex; flex-wrap: wrap; gap: 8px;
          font: 400 12px/1.4 'Space Grotesk', sans-serif; color: ${AINUBIS.inkFaint};
        }
        .op-fin-legal a { color: inherit; text-decoration: none; }
        .op-fin-legal a:hover { color: ${AINUBIS.ink}; text-decoration: underline; }

        @media (max-width: 768px) {
          .op-fin-a { flex-direction: column; justify-content: flex-start; gap: 16px; padding-top: calc(var(--op-nav-h, 118px) + 8px); }
          /* MOBIL: výrez cez celú šírku, hlava pri lište, spodok sa rozplynie a nadpis
             sedí NA ňom; text bez bloku (na úzkom displeji by blok len ubral miesto). */
          .op-fin-a { padding: calc(var(--op-nav-h, 118px) - 24px) 0 0; gap: 0; justify-content: flex-start; }
          .op-fin-photo {
            position: relative; top: auto; left: auto; bottom: auto; flex: 0 0 auto;
            width: 100%; height: 50vh;
            -webkit-mask-image: linear-gradient(to bottom, #000 56%, transparent 96%);
                    mask-image: linear-gradient(to bottom, #000 56%, transparent 96%);
          }
          .op-fin-photo img { height: 150%; }
          .op-fin-words {
            width: auto; gap: 8px; margin-top: -72px; padding: 0 16px;
            background: none; border: 0; box-shadow: none; border-radius: 0;
          }
          .op-fin-txt { font-size: 14px; line-height: 1.5; }
          .op-fin-b {
            flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 24px;
            padding: calc(var(--op-nav-h, 118px) + 8px) 16px 24px;
          }
          .op-fin-now, .op-fin-side { width: 100%; }
          .op-fin-stats { gap: 8px; }
          .op-fin-stat { padding: 8px; }
          .op-fin-stat b { font-size: 20px; }
          .op-fin-stat span { font-size: 10px; }
          .op-fin-work li { grid-template-columns: 76px minmax(0, 1fr) 48px 32px; gap: 8px; font-size: 12px; }
          .op-fin-ai { padding: 16px; }
          .op-fin-ai-head { width: 64px; height: 64px; }
          .op-fin-ai-q { font-size: 16px; }
          /* B je posledný obraz: obsah smie na telefóne odrolovať
             VNÚTRI obrazu (data-film-free = motor filmu ho nechá tak). Obsah stojí
             zhora (flex-start), takže pretečenie ide len dole a dá sa dočítať. */
          .op-fin-b { overflow-y: auto; overscroll-behavior: contain; }
        }
        /* Nízky telefón: ustúpi FOTKA, nie vzduch (PAGE_AIR). */
        @media (max-width: 768px) and (max-height: 720px) {
          .op-fin-photo { height: 38vh; }
          .op-fin-words { margin-top: -56px; }
          .op-fin-words .op-fin-h2 { margin-bottom: 0; }
          .op-fin-txt { font-size: 12px; line-height: 1.4; }
        }
      `}</style>
    </section>
  );
}
