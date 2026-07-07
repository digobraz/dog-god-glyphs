/**
 * Footer — úplne posledná sekcia (pod CouncilSection na /about).
 * Stĺpcový layout (left-aligned): vľavo pečať + motto, vedľa Follow + Contact.
 *
 * ⚠️ FLAG (Matej potvrď): SOCIALS hrefy sú best-guess @dogypt — oficiálne
 * účty ešte nie sú v kóde potvrdené (TODO „DOGYPT official IG/FB/TikTok/YouTube
 * setup" v KONTEXT.md). Pred Republish over reálne handles nižšie.
 */
import { useT } from '@/i18n/LanguageContext';

const SOCIALS = [
  {
    id: 'youtube',
    label: 'YouTube',
    href: 'https://youtube.com/@dogypt',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.6A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.6 8.9.6 8.9.6s7 0 8.9-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.5 12 31 31 0 0 0 23 7.2zM9.8 15.3V8.7l5.7 3.3z" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com/dogypt',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.2" />
        <circle cx="12" cy="12" r="4.1" />
        <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    href: 'https://tiktok.com/@dogypt',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.6 5.8a4.3 4.3 0 0 1-1-2.8h-3.1v12.2a2.5 2.5 0 1 1-1.8-2.4V9.6a5.6 5.6 0 1 0 4.9 5.6V9.25a7.3 7.3 0 0 0 4.3 1.4V7.55a4.3 4.3 0 0 1-2.3-1.75z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://facebook.com/dogypt',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
      </svg>
    ),
  },
];

export function Footer() {
  const t = useT();
  return (
    <footer className="dogypt-footer">
      <style>{`
        .dogypt-footer {
          background: #000; position: relative; z-index: 2;
          padding: clamp(48px, 9vh, 84px) clamp(22px, 5vw, 64px) clamp(28px, 4vh, 40px);
          display: flex; flex-direction: column; align-items: center;
          gap: clamp(32px, 5vh, 52px);
        }
        .footer-inner {
          width: 100%; max-width: 1100px; margin-top: -100px;
          display: grid; grid-template-columns: 1fr; gap: clamp(34px, 6vh, 46px);
          align-items: start; text-align: left;
        }
        @media (min-width: 760px) {
          .footer-inner {
            grid-template-columns: 1fr 1fr 1fr;
            gap: clamp(34px, 5vw, 64px); align-items: center;
          }
        }
        /* ── Brand: seal (centre column) ── */
        .footer-brand { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: clamp(14px, 2vh, 18px); }
        .footer-seal { height: clamp(118px, 15vw, 158px); width: auto; display: block; }
        .footer-tagline {
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0;
          font-size: clamp(0.82rem, 1.1vw, 0.96rem); letter-spacing: 0.20em; text-transform: uppercase;
          color: rgba(201,154,63,0.88);
        }
        .footer-mission {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem; line-height: 1.6; margin: 0;
          color: rgba(250,244,236,0.42); max-width: 260px;
        }
        /* ── Columns ── */
        .footer-col { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
        .footer-col-title {
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0;
          font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(250,244,236,0.45);
        }
        /* ── Socials — rounded squares (single row 1×4) ── */
        .footer-socials { display: flex; gap: 10px; align-items: center; flex-wrap: nowrap; }
        .footer-social {
          width: clamp(46px, 5.2vw, 56px); height: clamp(46px, 5.2vw, 56px);
          display: flex; align-items: center; justify-content: center;
          border-radius: 13px; color: rgba(250,244,236,0.80);
          border: 1px solid rgba(201,154,63,0.30); background: rgba(250,244,236,0.02);
          transition: color .2s ease, border-color .2s ease, background .2s ease, transform .15s ease;
        }
        .footer-social svg { width: clamp(22px, 2.6vw, 27px); height: clamp(22px, 2.6vw, 27px); }
        .footer-social:hover {
          color: #F5C73D; border-color: rgba(201,154,63,0.7);
          background: rgba(201,154,63,0.10); transform: translateY(-2px);
        }
        /* ── Email (emphasized) + legal ── */
        .footer-col-email { justify-content: center; align-items: center; }
        @media (min-width: 760px) {
          /* social left · seal centre · email right */
          .footer-col-social { align-items: flex-start; padding-left: 50px; }
          .footer-col-email { padding-top: 0; align-items: flex-end; padding-right: 50px; }
        }
        /* mobile stack: seal on top, then social, then email */
        @media (max-width: 759px) { .footer-brand { order: -1; } }
        .footer-email {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(0.98rem, 1.5vw, 1.22rem); letter-spacing: 0.03em;
          color: #F5C73D; text-decoration: none;
          border-bottom: 1px solid rgba(201,154,63,0.55); padding-bottom: 3px;
          text-shadow: 0 0 18px rgba(245,199,61,0.28);
          transition: color .2s ease, border-color .2s ease, text-shadow .2s ease;
        }
        .footer-email:hover { color: #FFD879; border-color: #F5C73D; text-shadow: 0 0 24px rgba(245,199,61,0.45); }
        .footer-links { display: flex; align-items: center; gap: 12px; }
        .footer-links a {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem;
          color: rgba(250,244,236,0.55); text-decoration: none; transition: color .2s ease;
        }
        .footer-links a:hover { color: rgba(250,244,236,0.9); }
        .footer-links span { color: rgba(250,244,236,0.28); }
        .footer-copy {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.74rem; margin: 0;
          color: rgba(250,244,236,0.34); letter-spacing: 0.04em;
        }
        /* ── Bottom bar — mission + copyright ── */
        .footer-bar {
          width: 100%; max-width: 1100px;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          text-align: center; padding-top: clamp(18px, 3vh, 26px);
          border-top: 1px solid rgba(201,154,63,0.12);
        }
        @media (min-width: 760px) {
          .footer-bar { flex-direction: row; justify-content: space-between; text-align: left; }
        }
        .footer-bar .footer-mission { max-width: none; }
        .footer-bar-text { margin: 0; line-height: 1.7; }
        .footer-bar-text .footer-tagline { margin-right: 4px; }
        @media (min-width: 760px) { .footer-bar-text .footer-tagline { display: inline; } }
        .footer-bar-right { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        @media (min-width: 760px) { .footer-bar-right { flex-direction: row; align-items: center; gap: 16px; } }

        /* ── Mobile (<760px): everything centered, motto on its own row ── */
        @media (max-width: 759px) {
          .footer-col { align-items: center; }
          .footer-bar-text .footer-tagline { display: block; margin-right: 0; margin-bottom: 6px; }
        }
      `}</style>

      <div className="footer-inner">
        {/* Follow — left: social row */}
        <div className="footer-col footer-col-social">
          <div className="footer-socials">
            {SOCIALS.map((s) => (
              <a
                key={s.id}
                className="footer-social"
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Brand — center: seal */}
        <div className="footer-brand">
          <img className="footer-seal" src="/images/peciat-dogypt.png" alt={t('about.footer.sealAlt')} />
        </div>

        {/* Contact — right: email, emphasized */}
        <div className="footer-col footer-col-email">
          <a className="footer-email" href="mailto:woof@dogypt.com">
            woof@dogypt.com
          </a>
        </div>
      </div>

      {/* Bottom bar — motto + mission + copyright */}
      <div className="footer-bar">
        <p className="footer-bar-text">
          {/* motto = brand, ostáva EN naprieč jazykmi (EN-only kľúč, fallback) */}
          <span className="footer-tagline">{t('about.footer.motto')}</span>{' '}
          <span className="footer-mission">{t('about.footer.mission')}</span>
        </p>
        <div className="footer-bar-right">
          <div className="footer-links">
            <a href="/privacy">{t('about.footer.privacy')}</a>
            <span>·</span>
            <a href="/terms">{t('about.footer.terms')}</a>
            <span>·</span>
            <a href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('dogypt:open-consent')); }}>
              {t('consent.footerLink')}
            </a>
          </div>
          <p className="footer-copy">© 2026 DOGYPT</p>
        </div>
      </div>
    </footer>
  );
}
