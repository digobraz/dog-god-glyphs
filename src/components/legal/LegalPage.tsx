/**
 * PRÁVNE STRÁNKY — /privacy a /terms v JEDNOM šate (Matej 5. 10. 2026: *„treba do dizajnu
 * upraviť aj privacy terms atď., sú ešte staré"*).
 *
 * Staré stránky mali tmavé pozadie, logo vložené inline (lock: logo hore = `<PageTopBar />`)
 * a písmo JetBrains Mono, ktoré brand nepozná. Teraz: papyrusová plocha ako /onepage,
 * KARTA z matrice (`PACK_BOX.card`), stĺpec textu 760 px (`PACK_COL` — článok), nadpisy
 * v systéme `PACK_HEAD`, odkazy lapis (bledý podklad = lapis).
 *
 * Texty sa NEMENIA — žijú v slovníkoch `privacy.sN.*` / `terms.sN.*` (záväzná je EN).
 */
import { Link, useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { PageTopBar } from '@/components/PageTopBar';
import { LAB } from '@/lib/labTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { PACK_BOX, PACK_HEAD, PACK_THEME as T } from '@/components/pack/packTheme';

type Kind = 'privacy' | 'terms';

const DOCS: { kind: Kind; path: string; title: string }[] = [
  { kind: 'privacy', path: '/privacy', title: 'privacy.title' },
  { kind: 'terms', path: '/terms', title: 'terms.title' },
];

export default function LegalPage({ kind, count }: { kind: Kind; count: number }) {
  const t = useT();
  const navigate = useNavigate();
  const sections = Array.from({ length: count }, (_, i) => ({
    id: `${kind}-${i + 1}`,
    n: i + 1,
    // Slovníky nesú číslo v nadpise („1. Who We Are") — číslo kreslí krúžok, tak ho z textu zložíme.
    title: t(`${kind}.s${i + 1}.title`).replace(/^\s*\d+[.)]\s*/, ''),
    body: t(`${kind}.s${i + 1}.body`),
  }));
  const back = () => (window.history.length > 1 ? navigate(-1) : navigate('/'));
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="lg-root">
      <PageTopBar brandBack onBack={back} backAriaLabel={t('nav.aria.back')} />

      <main className="lg-main">
        {/* Prepínač dokumentov — poloha = zlato (konštrukcia), nie lapis. */}
        <nav className="lg-tabs" aria-label="Legal">
          {DOCS.map((d) => (
            <Link key={d.kind} to={d.path} className={`lg-tab${d.kind === kind ? ' is-on' : ''}`}
              aria-current={d.kind === kind ? 'page' : undefined}>
              {t(d.title)}
            </Link>
          ))}
          <button type="button" className="lg-tab" onClick={() => window.dispatchEvent(new Event('dogypt:open-consent'))}>
            {t('consent.footerLink')}
          </button>
        </nav>

        <article className="lg-card" style={{ ...PACK_BOX.card }}>
          <header className="lg-head">
            <p className="lg-eyebrow" style={{ ...PACK_HEAD.label }}>{t('legal.eyebrow')}</p>
            <h1 className="lg-h1" style={{ ...PACK_HEAD.card }}>{t(`${kind}.title`)}</h1>
            <p className="lg-meta">{t('legal.updated')}</p>
            <p className="lg-note">{t('legal.langNote')}</p>
          </header>

          {/* Obsah — 13/14 sekcií sa bez neho čítať nedá; klik zroluje na sekciu. */}
          <ol className="lg-toc" style={{ ...PACK_BOX.subblock }}>
            {sections.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => jump(s.id)}><i>{s.n}</i><span>{s.title}</span></button>
              </li>
            ))}
          </ol>

          <div className="lg-sections">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="lg-sec">
                <h2><i>{s.n}</i>{s.title}</h2>
                <p>{s.body}</p>
              </section>
            ))}
          </div>

          <footer className="lg-foot">
            <p className="lg-motto" style={{ ...PACK_HEAD.label }}>{t('legal.motto')}</p>
            <Link to={kind === 'privacy' ? '/terms' : '/privacy'} className="lg-other">
              {t(kind === 'privacy' ? 'privacy.linkTerms' : 'terms.linkPrivacy')}
            </Link>
          </footer>
        </article>
        <p className="lg-copy">© 2026 DOGYPT</p>
      </main>

      <style>{`
        .lg-root { min-height: 100vh; background: ${LAB.pageBg}; position: relative; color: ${T.ink}; }
        .lg-root::before { content: ''; position: fixed; inset: 0; background: ${LAB.pageBackdrop}; pointer-events: none; }
        .lg-root > * { position: relative; }
        .lg-main { width: min(760px, 100%); margin: 0 auto; padding: 24px 16px 48px; display: flex; flex-direction: column; gap: 16px; }

        .lg-tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
        .lg-tab {
          height: 40px; padding: 0 16px; border-radius: 999px; display: inline-flex; align-items: center;
          border: 1px solid ${T.border}; background: rgba(251,245,230,.6); color: ${T.inkWarm};
          font: 500 12px/1 'Space Grotesk', sans-serif; letter-spacing: .14em; text-transform: uppercase;
          text-decoration: none; cursor: pointer; transition: border-color .2s ease, color .2s ease;
        }
        .lg-tab:hover { border-color: ${T.cardEdge}; color: ${T.inkStrong}; }
        .lg-tab.is-on { background: ${T.panelGrad}; border-color: ${T.cardEdge}; color: ${T.inkStrong}; box-shadow: 0 1px 3px rgba(122,90,42,.18); }

        .lg-card { padding: 48px; }
        .lg-head { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .lg-eyebrow { margin: 0; color: ${T.cardEdge}; }
        .lg-h1 { margin: 0; color: ${T.inkStrong}; line-height: 1.25; position: relative; padding-bottom: 16px; }
        .lg-h1::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 160px; height: 2px; background: ${T.rule}; }
        .lg-meta { margin: 8px 0 0; font: 500 12px/1.4 'Space Grotesk', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: ${T.inkDim}; }
        .lg-note { margin: 0; font: 400 12px/1.5 'Space Grotesk', sans-serif; font-style: italic; color: ${T.inkFaint}; max-width: 520px; }

        .lg-toc { list-style: none; margin: 32px 0; padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; }
        .lg-toc button {
          width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px; border: 0; border-radius: 8px;
          background: none; cursor: pointer; text-align: left; color: ${T.inkStrong};
          font: 400 14px/1.3 'Space Grotesk', sans-serif; transition: background .2s ease, color .2s ease;
        }
        .lg-toc button:hover { background: ${LAPIS.fill}; color: ${LAPIS.edge}; }
        .lg-toc i, .lg-sec h2 i {
          flex: 0 0 auto; width: 24px; height: 24px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center;
          font: 700 12px/1 'Cinzel', serif; font-style: normal; color: ${LAPIS.edge}; border: 1.5px solid ${LAPIS.edge};
        }

        .lg-sections { display: flex; flex-direction: column; gap: 32px; }
        .lg-sec { scroll-margin-top: 24px; }
        .lg-sec h2 {
          margin: 0 0 8px; display: flex; align-items: center; gap: 12px; color: ${T.inkStrong};
          font: 700 16px/1.3 'Cinzel', serif; letter-spacing: .04em; text-transform: uppercase;
        }
        .lg-sec p { margin: 0; padding-left: 36px; font: 400 16px/1.7 'Space Grotesk', sans-serif; color: ${LAB.ink}; white-space: pre-line; }

        .lg-foot {
          margin-top: 48px; padding-top: 24px; border-top: 1px solid ${T.hairline};
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
        }
        .lg-motto { margin: 0; color: ${T.inkDim}; }
        .lg-other {
          color: ${LAPIS.edge}; text-decoration: none; font: 700 14px/1 'Cinzel', serif; letter-spacing: .14em; text-transform: uppercase;
          border-bottom: 1.5px solid ${LAPIS.halo}; padding-bottom: 4px; transition: border-color .2s ease;
        }
        .lg-other:hover { border-color: ${LAPIS.edge}; }
        .lg-copy { margin: 0; text-align: center; font: 400 12px/1 'Space Grotesk', sans-serif; color: ${T.inkFaint}; }

        @media (max-width: 768px) {
          .lg-main { padding: 16px 16px 32px; }
          .lg-card { padding: 24px 16px; }
          .lg-toc { grid-template-columns: 1fr; margin: 24px 0; padding: 8px; }
          .lg-sections { gap: 24px; }
          .lg-sec p { padding-left: 0; font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
