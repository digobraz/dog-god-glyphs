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
import { createPortal } from 'react-dom';
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
import { filmVh } from '@/lib/filmVh';

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

/** Tri dlaždice pozvánky (Matej 5. 10. 2026: *„join môžeš dať preč, nech sú len 3"*).
 *  Klik otvorí AINUBISA rovno v téme — vlákno začne voľbou a jeho otázkou k nej.
 *  Ikonky z ručného kitu (emoji mimo mapy = mimo brandu). */
const ASKS = [
  { k: 'idea', icon: '/icons/pack/idea.svg' },
  { k: 'problem', icon: '/icons/pack/target.svg' },
  { k: 'help', icon: '/icons/pack/heartpaw.svg' },
] as const;
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
  /** Popup „Viac o mne" (Matej 6. 10. 2026: *„tlačítko viac o mne… scroll popup, kde
   *  napíšem správu a žiadosť o pomoc pri projekte… nie je to o mne — je to o nás"*). */
  const [more, setMore] = useState(false);
  useEffect(() => {
    if (!more) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMore(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [more]);

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
      // ⚠️ filmVh(), nie window.innerHeight — zastávku počíta motor z lvh a na iPhone je
      // innerHeight o lištu Safari menší (viď lib/filmVh.ts). Rozdiel nechal krytie pod 1.
      const p = clamp01(-r.top / Math.max(1, r.height - filmVh()));
      // 🔴 Plné krytie UŽ PRED zastávkou (Matej 6. 10. 2026: *„pri about me presvitá
      // nadpis potrebujeme ťa"*). Zastávka a toto `p` sa rátajú z výšky okna, ktorá sa na
      // iPhone mení s lištou Safari — pri pár px rozdielu ostalo krytie pod 1 a WE NEED YOU
      // presvital. Prelínanie dobehne v 80 % dráhy, na zastávke je javisko celé.
      const fin = seg(p, 0, FIN_STOPS[0] * 0.8);
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
  // ── B OŽÍVA PRI PRÍCHODE: hodiny sa narátajú, otázka AINUBISA sa vypíše ──
  const hoursRef = useRef<HTMLSpanElement>(null);
  const [said, setSaid] = useState('');
  // Striedajúce sa vety (Matej 5. 10. 2026: *„aby sa prepisovali texty: Like it? Join us!
  // See potential, fund us! Donate would be great!… aby sme dali vedieť, že hľadáme
  // investorov"*). Jeden kľúč, vety oddelené „|".
  const phrases = t('onepage.fin.askRotate').split('|').map((x) => x.trim()).filter(Boolean);
  const question = phrases[0] ?? '';
  useEffect(() => {
    if (on !== 'b') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = hoursRef.current;
    let raf = 0;
    if (el) {
      if (reduce) el.textContent = PULSE.hours.toLocaleString('en-US');
      else {
        const t0 = performance.now();
        const tick = (n: number) => {
          const p = Math.min(1, (n - t0) / 1600);
          el.textContent = Math.round(PULSE.hours * (1 - Math.pow(1 - p, 3))).toLocaleString('en-US');
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }
    }
    if (reduce) { setSaid(question); return () => cancelAnimationFrame(raf); }
    // Písací stroj v slučke: vypíš → podrž → zmaž → ďalšia veta.
    let k = 0, i = 0, dir: 1 | -1 = 1, hold = 0;
    setSaid('');
    const iv = window.setInterval(() => {
      const ph = phrases[k % phrases.length] ?? '';
      if (hold > 0) { hold -= 1; return; }
      i += dir;
      setSaid(ph.slice(0, i));
      if (dir === 1 && i >= ph.length) { dir = -1; hold = 50; }
      else if (dir === -1 && i <= 0) { dir = 1; k += 1; hold = 6; }
    }, 45);
    return () => { cancelAnimationFrame(raf); window.clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, phrases.join('|')]);

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
            <button type="button" className="dgx-example op-fin-more" tabIndex={on === 'a' ? 0 : -1}
              onClick={() => { track('onepage_about_more'); setMore(true); }}>
              {t('onepage.fin.aboutMore')}
            </button>
          </div>
        </div>

        {/* ── B · LIVE STATUS (tmavý, AINUBIS) ───────────────────────── */}
        <div className={`op-fin-b${on === 'b' ? ' is-on' : ''}`} data-film-free data-film-edge aria-hidden={on !== 'b'} style={{ pointerEvents: on === 'b' ? 'auto' : 'none' }}>
          <div className="op-fin-now">
            <h2 className="op-fin-h2 op-fin-h2--left">
              {t('onepage.fin.liveHead')} <span className="op-fin-live"><i />LIVE</span>
            </h2>
            <p className="op-fin-ailine" dangerouslySetInnerHTML={{ __html: t('onepage.fin.aiLine') }} />
            {/* Hodiny = zamrznutý odhad do 14. 8. + zmeraný čas AI agentov z `plany/praca-log.json`
                (gen-praca-stats → onepagePulse.json, čerstvé k poslednému deployu). */}
            <div className="op-fin-stats">
              {/* Tri farby (Matej 5. 10. 2026: *„tie tri bloky nejak farebne urobiť"*) — všetky
                  z palety AINUBISA: myšlienka = svit, online = cyan, práca = zelená „živé". */}
              {/* Poradie v bloku: štítok → číslo → krátka veta (Matej 5. 10. 2026: *„nadpis bude až
                  druhý a ten text daj hore… a potom ešte krátky text, nech tam nie je toľko voľného
                  priestoru"*). */}
              <div className="op-fin-stat op-glass op-fin-stat--idea">
                <em>{t('onepage.fin.statIdea')}</em><b>2018</b><span>{t('onepage.fin.statIdeaSub')}</span>
              </div>
              <div className="op-fin-stat op-glass op-fin-stat--online">
                <em>{t('onepage.fin.statOnline')}</em><b>07/2026</b><span>{t('onepage.fin.statOnlineSub')}</span>
              </div>
              <div className="op-fin-stat op-glass op-fin-stat--work">
                <em>{t('onepage.fin.statHours')}</em>
                <b><span ref={hoursRef}>{PULSE.hours.toLocaleString('en-US')}</span>+</b>
                <span>{t('onepage.fin.statHoursWho')}</span>
              </div>
            </div>
            <div className="op-fin-workbox op-glass">
              <div className="op-fin-eb">{t('onepage.fin.nowHead')}</div>
              <ul className="op-fin-work">
                {PULSE.work.map((w, i) => (
                  <li key={i} style={{ ['--d' as string]: `${i * 90}ms` }}>
                    <span className="op-fin-tag">{t(`onepage.fin.tag.${w.tag}`)}</span>
                    <span className="op-fin-wname">{t(`onepage.fin.work.${w.name}`)}</span>
                    <span className="op-fin-bar"><i style={{ ['--w' as string]: `${w.pct}%` }} /></span>
                    <span className="op-fin-pct">{w.pct} %</span>
                  </li>
                ))}
              </ul>
              {PULSE.updated && (
                <div className="op-fin-upd"><i />{t('onepage.fin.updated')} {boardDate(PULSE.updated, lang)}</div>
              )}
            </div>
          </div>

          <div className="op-fin-side">
            <div className="op-fin-ai op-glass">
              <div className="op-fin-ai-headwrap" aria-hidden>
                <span className="op-fin-ai-ring2" /><span className="op-fin-ai-ring" />
                <img src={ainubisHead} alt="" className="op-fin-ai-head" />
              </div>
              <div className="op-fin-ai-nm"><span>AI</span>NUBIS</div>
              <div className="op-fin-ai-role"><i />{t('onepage.fin.aiRole')}</div>
              <p className="op-fin-ai-q" aria-label={question}>{said}<span className="op-fin-caret" /></p>
              <div className="op-fin-ai-tiles">
                {ASKS.map((a) => (
                  <button key={a.k} type="button" tabIndex={tabB}
                    onClick={() => { track('onepage_ainubis_topic', { k: a.k }); openAinubis(undefined, a.k); }}>
                    <span className="op-fin-ico" style={{ ['--m' as string]: `url(${a.icon})` }} />
                    {t(`onepage.fin.ask.${a.k}`)}
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
              {/* E-mail ako čip „Email me" (Matej 5. 10. 2026: *„namiesto emailu len chip email me"*). */}
              <a className="op-fin-blk op-fin-blk--mail" href="mailto:woof@dogypt.com" tabIndex={tabB}>{t('onepage.fin.emailMe')}</a>
              <button type="button" className="op-fin-blk" onClick={onDogma} tabIndex={tabB}>DOGMA</button>
            </div>
            <p className="op-fin-legal">
              <a href="/privacy" tabIndex={tabB}>{t('about.footer.privacy')}</a>
              <a href="/terms" tabIndex={tabB}>{t('about.footer.terms')}</a>
              <a href="#" tabIndex={tabB} onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('dogypt:open-consent')); }}>
                {t('consent.footerLink')}
              </a>
              <span className="op-fin-motto">{t('religion.book.trust')}</span>
              <span>© 2026 DOGYPT</span>
            </p>
          </div>
        </div>
      </div>
      {more && createPortal(
        <div className="op-fin-pop" role="dialog" aria-modal="true" aria-label={t('onepage.fin.moreHead')}
          data-film-free onClick={() => setMore(false)}>
          <div className="op-fin-pop-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="op-fin-pop-x" aria-label={t('onepage.fin.moreClose')} onClick={() => setMore(false)} />
            <h3 className="op-fin-pop-h">{t('onepage.fin.moreHead')}</h3>
            <div className="op-fin-pop-body">
              {t('onepage.fin.moreBody').split('\n\n').map((para, i) => {
                if (para.startsWith('## ')) return <h4 key={i} className="op-fin-pop-sec">{para.slice(3)}</h4>;
                const ph = para.match(/^\[\[(\d)\]\]$/);
                if (ph) return <img key={i} className={`op-fin-pop-img p${ph[1]} ${Number(ph[1]) % 2 ? 'is-r' : 'is-l'}${ph[1] === '5' ? ' is-wide' : ''}`} src={`/images/about-popup/foto-${ph[1]}.jpg`} alt="" loading="lazy" decoding="async" />;
                return <p key={i}>{para}</p>;
              })}
            </div>
          </div>
        </div>,
        document.body,
      )}
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
        .op-fin-txt { margin: 0; font: 400 15px/1.55 'Space Grotesk', sans-serif; color: ${LAB.ink}; }
        .op-fin-txt--last { font-weight: 600; }
        /* VIAC O MNE = CHIP (Matej 6. 10. 2026: *„viac o mne daj do chipu, nie do CTA"*) — ten istý
           chip dgx-example ako PRÍKLAD pri HEROGLYPHE. */
        .op-fin-more { align-self: flex-start; margin: 8px 0 0; }
        /* PC: chip na pravú stranu bloku (Matej 6. 10. 2026); mobil ostáva vľavo. */
        @media (min-width: 768px) { .op-fin-more { align-self: flex-end; } }
        /* Popup: papyrusová karta so scrollom vnútri, závoj cez celé okno. */
        .op-fin-pop {
          position: fixed; inset: 0; z-index: 120; display: grid; place-items: center;
          padding: 16px; background: rgba(20,12,4,.55); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
        }
        .op-fin-pop-card {
          position: relative; width: min(640px, 100%); max-height: calc(100dvh - 32px); overflow-y: auto;
          overscroll-behavior: contain; padding: 32px 24px 24px; border-radius: 16px;
          background: ${LAB.pageBg}; border: 1.5px solid rgba(201,154,63,.55);
          box-shadow: 0 24px 48px -24px rgba(42,22,8,.55);
        }
        .op-fin-pop-h {
          margin: 0 32px 16px 0; font: 700 24px/1.2 'Cinzel', serif; letter-spacing: .04em;
          text-transform: uppercase; color: ${LAB.goldSolid};
        }
        .op-fin-pop-body p { margin: 0 0 12px; font: 400 16px/1.6 'Space Grotesk', sans-serif; color: ${LAB.ink}; white-space: pre-line; }
        .op-fin-pop-sec {
          margin: 32px 0 12px; font: 700 20px/1.2 'Cinzel', serif; letter-spacing: .04em;
          text-transform: uppercase; color: ${LAB.goldSolid};
        }
        .op-fin-pop-img { display: block; width: 100%; height: auto; margin: 16px 0; border-radius: 12px; }
        .op-fin-pop-body::after { content: ''; display: block; clear: both; }
        /* PC = ČLÁNOK (Matej 6. 10. 2026): širšia karta, výrazný hlavný nadpis, menšie súrodé
           podnadpisy a menšie fotky, okolo ktorých text obteká (strany sa striedajú). */
        @media (min-width: 768px) {
          .op-fin-pop-card { width: min(760px, 100%); padding: 48px 48px 32px; }
          .op-fin-pop-h {
            margin: 0 0 32px; padding-bottom: 24px; text-align: center; font-size: 32px; line-height: 1.2;
            letter-spacing: .08em; border-bottom: 1.5px solid rgba(201,154,63,.55);
          }
          .op-fin-pop-sec { clear: both; margin: 32px 0 12px; font-size: 16px; letter-spacing: .14em; }
          .op-fin-pop-img { width: 200px; aspect-ratio: 4 / 5; object-fit: cover; object-position: 50% 30%; margin: 4px 0 16px; }
          .op-fin-pop-img.is-wide { width: 300px; aspect-ratio: 16 / 9; }
          .op-fin-pop-img.p4 { object-position: 50% 70%; }
          .op-fin-pop-img.p6 { object-position: 50% 60%; }
          .op-fin-pop-img.is-r { float: right; margin-left: 24px; }
          .op-fin-pop-img.is-l { float: left; margin-right: 24px; }
        }
        .op-fin-pop-x {
          position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border: 0; padding: 0;
          background: ${LAB.ink}; cursor: pointer;
          -webkit-mask: url(/icons/pack/cross.svg) center / 20px no-repeat; mask: url(/icons/pack/cross.svg) center / 20px no-repeat;
        }

        /* ── B · LIVE STATUS — TMAVÝ AINUBIS S MRIEŽKOU (Matej 5. 10. 2026: *„pozadie mriežkové…
           tu nesmie byť zlatá (text)… bloky krajšie a zvýrazniť… liquid glass"*). Mriežka je tá
           istá ako na /pack/ainubis (.akv-bg). Zlaté ostáva len CTA (jeho brand). ── */
        .op-fin-dark {
          position: absolute; inset: 0; pointer-events: none; opacity: var(--nx, 0); overflow: hidden;
          background: ${AINUBIS.surfaceBase};
        }
        .op-fin-dark::before {
          content: ''; position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(${AINUBIS.cyanRGB},0.06) 1px,transparent 1px),
            linear-gradient(90deg,rgba(${AINUBIS.cyanRGB},0.06) 1px,transparent 1px),
            linear-gradient(rgba(${AINUBIS.cyanRGB},0.10) 1px,transparent 1px),
            linear-gradient(90deg,rgba(${AINUBIS.cyanRGB},0.10) 1px,transparent 1px);
          background-size: 24px 24px,24px 24px,192px 192px,192px 192px;
          animation: op-fin-drift 40s linear infinite;
        }
        .op-fin-dark::after {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(50vw 50vw at 78% 20%, rgba(${AINUBIS.cyanRGB},.14), transparent 62%),
            radial-gradient(45vw 45vw at 20% 110%, rgba(${AINUBIS.glowRGB},.12), transparent 62%),
            linear-gradient(180deg, transparent 0, rgba(${AINUBIS.cyanRGB},.05) 50%, transparent 100%) 0 -30vh / 100% 30vh no-repeat;
          animation: op-fin-scan 7s ease-in-out infinite;
        }
        @keyframes op-fin-drift { to { background-position: 0 192px,192px 0,0 192px,192px 0; } }
        @keyframes op-fin-scan { 0% { background-position: 0 0, 0 0, 0 -30vh; } 60%, 100% { background-position: 0 0, 0 0, 0 130vh; } }

        .op-fin-b {
          flex-direction: row; align-items: center; justify-content: center; gap: 48px; text-align: left;
          padding-left: 24px; padding-right: 24px; color: ${AINUBIS.ink};
        }
        .op-fin-now { width: min(600px, 52vw); display: flex; flex-direction: column; gap: 12px; }
        .op-fin-side { width: 440px; flex: 0 0 auto; display: flex; flex-direction: column; gap: 12px; }

        /* SKLO („liquid glass"): rozmazaný podklad, svetlý lem hore, jemný cyan dosvit. */
        .op-glass {
          position: relative; border-radius: 16px;
          background: linear-gradient(160deg, rgba(${AINUBIS.cyanRGB},.12) 0%, rgba(${AINUBIS.cyanRGB},.03) 45%, rgba(${AINUBIS.glowRGB},.06) 100%);
          border: 1px solid rgba(${AINUBIS.cyanRGB},.28);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.14), inset 0 -1px 0 rgba(${AINUBIS.cyanRGB},.08),
            0 16px 40px rgba(0,0,0,.45), 0 0 32px rgba(${AINUBIS.glowRGB},.10);
          -webkit-backdrop-filter: blur(12px) saturate(140%); backdrop-filter: blur(12px) saturate(140%);
        }
        .op-glass::before {
          content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
          background: linear-gradient(115deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 32%);
        }

        /* NADPIS bez zlata: biely s cyan dosvitom, čiara pod ním cyan. */
        .op-root .op-fin .op-fin-b .op-fin-h2 {
          background-image: none; color: ${AINUBIS.ink}; -webkit-text-fill-color: ${AINUBIS.ink};
          text-shadow: 0 0 24px rgba(${AINUBIS.cyanRGB},.35); padding-bottom: 12px; margin: 0;
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
        }
        .op-root .op-fin .op-fin-b .op-fin-h2::after {
          background: linear-gradient(90deg, rgba(${AINUBIS.cyanRGB},.85) 0%, rgba(${AINUBIS.cyanRGB},0) 100%);
        }
        .op-fin-live {
          display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 999px;
          font: 600 10px/1 'Space Grotesk', sans-serif; letter-spacing: .22em; text-shadow: none;
          color: ${AINUBIS.ok}; -webkit-text-fill-color: ${AINUBIS.ok}; border: 1px solid ${AINUBIS.okEdge};
        }
        .op-fin-live i, .op-fin-upd i, .op-fin-ai-role i {
          display: inline-block; width: 8px; height: 8px; border-radius: 50%;
          background: ${AINUBIS.ok}; box-shadow: 0 0 8px ${AINUBIS.ok}; animation: op-fin-pulse 1.6s ease-in-out infinite;
        }
        @keyframes op-fin-pulse { 50% { opacity: .35; transform: scale(.7); } }
        .op-fin-ailine { margin: 0; font: 400 16px/1.5 'Space Grotesk', sans-serif; color: ${AINUBIS.inkDim}; }
        .op-fin-ailine b { font-weight: 500; color: ${AINUBIS.cyan}; }

        .op-fin-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .op-fin-stat { display: flex; flex-direction: column; gap: 4px; padding: 16px; }
        .op-fin-stat b { font: 700 24px/1 'Cinzel', serif; letter-spacing: .04em; color: var(--sc); text-shadow: 0 0 18px rgba(var(--scr),.55); }
        .op-fin-stat > span { font: 400 12px/1.3 'Space Grotesk', sans-serif; color: ${AINUBIS.inkDim}; }
        .op-fin-stat > em {
          font: 500 10px/1.3 'Space Grotesk', sans-serif; font-style: normal; letter-spacing: .22em;
          text-transform: uppercase; color: var(--sc); opacity: .9; margin-bottom: 4px;
        }
        /* Farba bloku: tónovaná výplň, farebný lem a horná svetelná hrana. */
        .op-fin-stat.op-glass {
          overflow: hidden;
          background: linear-gradient(160deg, rgba(var(--scr),.20) 0%, rgba(var(--scr),.05) 55%, rgba(var(--scr),.10) 100%);
          border-color: rgba(var(--scr),.45);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 16px 40px rgba(0,0,0,.45), 0 0 28px rgba(var(--scr),.18);
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .op-fin-stat.op-glass::after {
          content: ''; position: absolute; left: 16px; right: 16px; top: 0; height: 2px; border-radius: 2px;
          background: linear-gradient(90deg, rgba(var(--scr),0), var(--sc), rgba(var(--scr),0));
          box-shadow: 0 0 12px var(--sc);
        }
        .op-fin-stat.op-glass:hover { transform: translateY(-3px); box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 20px 44px rgba(0,0,0,.5), 0 0 36px rgba(var(--scr),.32); }
        .op-fin-stat--idea { --sc: ${AINUBIS.glow}; --scr: ${AINUBIS.glowRGB}; }
        .op-fin-stat--online { --sc: ${AINUBIS.cyan}; --scr: ${AINUBIS.cyanRGB}; }
        .op-fin-stat--work { --sc: ${AINUBIS.ok}; --scr: 127,215,154; }

        .op-fin-workbox { padding: 16px; }
        .op-fin-eb {
          margin: 0 0 4px; font: 500 10px/1 'Space Grotesk', sans-serif; letter-spacing: .26em;
          text-transform: uppercase; color: ${AINUBIS.cyan};
        }
        .op-fin-work { list-style: none; margin: 0; padding: 0; }
        .op-fin-work li {
          display: grid; grid-template-columns: 88px minmax(0, 1fr) 96px 40px; gap: 12px; align-items: center;
          padding: 8px 0; border-bottom: 1px solid rgba(${AINUBIS.cyanRGB},.10);
          font: 400 14px/1.3 'Space Grotesk', sans-serif; color: ${AINUBIS.ink};
          opacity: 0; transform: translateX(-8px); transition: opacity .5s ease var(--d, 0ms), transform .5s ease var(--d, 0ms);
        }
        .op-fin-work li:last-child { border-bottom: 0; }
        .op-fin-b.is-on .op-fin-work li { opacity: 1; transform: none; }
        .op-fin-tag {
          justify-self: start; padding: 4px 8px; border-radius: 999px; border: 1px solid ${AINUBIS.edgeStrong};
          font: 500 10px/1 'Space Grotesk', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: ${AINUBIS.cyan};
        }
        .op-fin-bar { height: 6px; border-radius: 999px; background: rgba(${AINUBIS.cyanRGB},.12); overflow: hidden; }
        .op-fin-bar i {
          position: relative; display: block; height: 100%; width: 0; border-radius: 999px; overflow: hidden;
          background: linear-gradient(90deg, ${AINUBIS.glow}, ${AINUBIS.cyan}); box-shadow: 0 0 8px ${AINUBIS.cyan};
          transition: width 1.4s cubic-bezier(.2,.8,.2,1) .3s;
        }
        .op-fin-b.is-on .op-fin-bar i { width: var(--w); }
        .op-fin-bar i::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent);
          animation: op-fin-shim 2.4s ease-in-out infinite;
        }
        @keyframes op-fin-shim { from { transform: translateX(-100%); } to { transform: translateX(200%); } }
        .op-fin-pct { font-size: 12px; text-align: right; color: ${AINUBIS.inkDim}; }
        .op-fin-upd { margin-top: 8px; font: 500 10px/1 'Space Grotesk', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: ${AINUBIS.inkFaint}; }
        .op-fin-upd i { margin-right: 8px; vertical-align: -1px; }

        /* AINUBIS — predstavený ako strážca a AI agent, hlava v otáčajúcich sa prstencoch. */
        .op-fin-ai { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 24px; }
        .op-fin-ai-headwrap { position: relative; width: 104px; height: 104px; }
        .op-fin-ai-head {
          position: absolute; inset: 8px; width: 88px; height: 88px; border-radius: 50%; object-fit: cover; background: #000;
          border: 2px solid ${AINUBIS.cyan}; animation: op-fin-breathe 4s ease-in-out infinite;
        }
        @keyframes op-fin-breathe {
          0%, 100% { box-shadow: 0 0 10px ${AINUBIS.cyan}; }
          50% { box-shadow: 0 0 28px ${AINUBIS.cyan}, 0 0 60px rgba(${AINUBIS.cyanRGB},.4); }
        }
        .op-fin-ai-ring { position: absolute; inset: 0; border-radius: 50%; border: 1.5px dashed rgba(${AINUBIS.cyanRGB},.55); animation: op-fin-spin 18s linear infinite; }
        .op-fin-ai-ring2 { position: absolute; inset: -8px; border-radius: 50%; border: 1px solid rgba(${AINUBIS.cyanRGB},.18); border-top-color: ${AINUBIS.cyan}; animation: op-fin-spin 3.5s linear infinite; }
        @keyframes op-fin-spin { to { transform: rotate(360deg); } }
        .op-fin-ai-nm { margin-top: 8px; font: 700 18px/1 'Cinzel', serif; letter-spacing: .14em; color: ${AINUBIS.ink}; }
        .op-fin-ai-nm span { color: ${AINUBIS.cyan}; }
        .op-fin-ai-role {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; padding: 6px 10px; border-radius: 999px;
          border: 1px solid ${AINUBIS.edgeStrong}; color: ${AINUBIS.cyan};
          font: 500 10px/1 'Space Grotesk', sans-serif; letter-spacing: .22em; text-transform: uppercase;
        }
        .op-fin-ai-role i { background: ${AINUBIS.cyan}; box-shadow: 0 0 8px ${AINUBIS.cyan}; }
        .op-fin-ai-q { margin: 16px 0 0; min-height: 24px; font: 500 16px/1.5 'Space Grotesk', sans-serif; color: ${AINUBIS.ink}; }
        .op-fin-caret { display: inline-block; width: 2px; height: 16px; margin-left: 2px; vertical-align: -2px; background: ${AINUBIS.cyan}; animation: op-fin-blink 1s steps(1) infinite; }
        @keyframes op-fin-blink { 50% { opacity: 0; } }
        .op-fin-ai-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%; margin: 16px 0; }
        .op-fin-ai-tiles button {
          display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px 8px; cursor: pointer;
          border-radius: 12px; border: 1px solid rgba(${AINUBIS.cyanRGB},.3); color: ${AINUBIS.ink};
          background: linear-gradient(180deg, rgba(${AINUBIS.cyanRGB},.08), rgba(${AINUBIS.cyanRGB},.02));
          font: 500 12px/1.2 'Space Grotesk', sans-serif;
          transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
        }
        .op-fin-ai-tiles button:hover {
          transform: translateY(-4px); border-color: ${AINUBIS.cyan};
          box-shadow: 0 0 0 1px rgba(${AINUBIS.cyanRGB},.4), 0 10px 24px rgba(${AINUBIS.glowRGB},.25);
        }
        .op-fin-ico {
          width: 28px; height: 28px; background: ${AINUBIS.cyan};
          -webkit-mask: var(--m) center / contain no-repeat; mask: var(--m) center / contain no-repeat;
          transition: transform .3s ease;
        }
        .op-fin-ai-tiles button:hover .op-fin-ico { transform: scale(1.15) rotate(-6deg); }
        .op-fin-ai-cta {
          cursor: pointer; width: 100%; height: 48px; border: 0; border-radius: 8px;
          background: ${AINUBIS.ctaGrad}; color: #2a1608;
          font: 700 14px/1 'Cinzel', serif; letter-spacing: .14em; text-transform: uppercase;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .op-fin-ai-cta:hover { transform: translateY(-2px); box-shadow: 0 0 24px rgba(${AINUBIS.ctaRGB},.45); }

        .op-fin-links { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; }
        .op-fin-blk {
          height: 40px; min-width: 40px; padding: 0 16px; border-radius: 999px; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          background: rgba(${AINUBIS.cyanRGB},.04); border: 1px solid ${AINUBIS.edge};
          color: ${AINUBIS.inkDim}; text-decoration: none;
          font: 700 14px/1 'Cinzel', serif; letter-spacing: .04em;
          transition: transform .2s ease, border-color .2s ease, color .2s ease;
        }
        .op-fin-blk:hover { transform: translateY(-2px); border-color: ${AINUBIS.cyan}; color: ${AINUBIS.cyan}; }
        .op-fin-blk--ico { padding: 0; width: 40px; }
        .op-fin-blk--ico svg { width: 20px; height: 20px; }
        .op-fin-blk--mail { font: 500 14px/1 'Space Grotesk', sans-serif; letter-spacing: .02em; }
        .op-fin-legal {
          /* Oba riadky pod blokom AINUBISA sú široké ako blok (Matej: *„centruj… aby to bolo
             súrodé a obidva riadky boli široké ako blok, kde je chat"*). */
          margin: 0; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 8px;
          font: 400 12px/1.4 'Space Grotesk', sans-serif; color: ${AINUBIS.inkFaint};
        }
        .op-fin-motto { color: ${AINUBIS.inkDim}; letter-spacing: .04em; }
        .op-fin-legal a { color: inherit; text-decoration: none; }
        .op-fin-legal a:hover { color: ${AINUBIS.ink}; text-decoration: underline; }
        @media (prefers-reduced-motion: reduce) {
          .op-fin-dark::before, .op-fin-dark::after, .op-fin-ai-ring, .op-fin-ai-ring2, .op-fin-ai-head, .op-fin-bar i::after { animation: none; }
        }

        @media (max-width: 768px) {
          .op-fin-a { flex-direction: column; justify-content: flex-start; gap: 16px; padding-top: calc(var(--op-nav-h, 118px) + 8px); }
          /* MOBIL: výrez cez celú šírku, hlava pri lište, spodok sa rozplynie a nadpis
             sedí NA ňom; text bez bloku (na úzkom displeji by blok len ubral miesto). */
          .op-fin-a { padding: calc(var(--op-nav-h, 118px) - 24px) 0 0; gap: 0; justify-content: flex-start; }
          .op-fin-photo {
            position: relative; top: auto; left: auto; bottom: auto; flex: 0 0 auto;
            /* Fotka ustupuje textu (6. 10.: pribudla veta aj tlačidlo VIAC O MNE) — tváre ostávajú. */
            width: 100%; height: 36vh;
            -webkit-mask-image: linear-gradient(to bottom, #000 56%, transparent 96%);
                    mask-image: linear-gradient(to bottom, #000 56%, transparent 96%);
          }
          .op-fin-photo img { height: 150%; }
          .op-fin-words {
            width: auto; gap: 8px; margin-top: -72px; padding: 0 16px;
            background: none; border: 0; box-shadow: none; border-radius: 0;
          }
          .op-fin-txt { font-size: 13px; line-height: 1.45; }
          /* Spodok patrí guli AINUBISA (60 px + 16) a šípkam — text nad nimi končí. */
          .op-fin-a { padding-bottom: 88px; }
          .op-fin-more { align-self: center; }
          .op-fin-b {
            flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 24px;
            padding: calc(var(--op-nav-h, 118px) + 8px) 16px 24px;
          }
          .op-fin-now, .op-fin-side { width: 100%; }
          .op-fin-stats { gap: 8px; }
          .op-fin-stat { padding: 12px 8px; }
          .op-fin-stat b { font-size: 20px; }
          .op-fin-stat > span { font-size: 10px; }
          .op-fin-work li { grid-template-columns: 84px minmax(0, 1fr) 48px 32px; gap: 8px; font-size: 12px; }
          /* SK „TESTOVANIE" pri .14em pretiekol stĺpec — na mobile tesnejšie sledovanie. */
          .op-fin-tag { letter-spacing: .06em; padding: 4px 6px; }
          .op-fin-workbox { padding: 12px; }
          .op-fin-ailine { font-size: 14px; }
          .op-fin-ai { padding: 16px; }
          .op-fin-ai-q { font-size: 14px; min-height: 42px; }
          /* Riadky pod blokom: 4 ikonky + 2 čipy sa musia zmestiť do 358 px; päta nesmie
             skončiť pod guľou AINUBISA vľavo dole (60 px + 16 od okraja). */
          .op-fin-links { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; justify-items: center; }
          .op-fin-blk { font-size: 12px; }
          .op-fin-blk:not(.op-fin-blk--ico) { grid-column: span 2; width: 100%; }
          .op-fin-legal { justify-content: center; gap: 4px 12px; }
          .op-fin-b { padding-bottom: 96px; }
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
