/**
 * ConsentBanner — Vlna B (Časť 1, infra). Fixed bottom cookie/consent banner.
 * Texty cez t('consent.*') — kľúče pribudnú v Časti 2 (i18n), dovtedy renderujú
 * raw kľúč (fallback v useT/t()). Banner sa zobrazuje len ak !hasChoice().
 * Reopen: window event 'dogypt:open-consent' (volá Footer „Cookie settings").
 */
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { getConsent, saveConsent, applyConsent, hasChoice } from '@/lib/consent';

export function ConsentBanner() {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(false);
  const [marketingOn, setMarketingOn] = useState(false);

  // Mount uloženej voľby — ak už existuje, aplikuj účinky (napr. Tier1 po reloade)
  // a banner sa nezobrazí. Guard proti double-apply cez applyConsent volaný raz.
  useEffect(() => {
    const c = getConsent();
    if (c) {
      applyConsent(c);
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, []);

  // Reopen z Footer „Cookie settings" — znova zobraz banner v Settings režime.
  useEffect(() => {
    const onOpen = () => {
      const c = getConsent();
      setAnalyticsOn(Boolean(c?.analytics));
      setMarketingOn(Boolean(c?.marketing));
      setSettingsOpen(true);
      setVisible(true);
    };
    window.addEventListener('dogypt:open-consent', onOpen);
    return () => window.removeEventListener('dogypt:open-consent', onOpen);
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    setVisible(false);
    setSettingsOpen(false);
  };

  const handleNecessaryOnly = () => {
    saveConsent({ analytics: false, marketing: false });
    setVisible(false);
    setSettingsOpen(false);
  };

  const handleSave = () => {
    saveConsent({ analytics: analyticsOn, marketing: marketingOn });
    setVisible(false);
    setSettingsOpen(false);
  };

  const handleOpenSettings = () => {
    const c = getConsent();
    setAnalyticsOn(Boolean(c?.analytics));
    setMarketingOn(Boolean(c?.marketing));
    setSettingsOpen(true);
  };

  return (
    <div className="consent-banner" role="dialog" aria-live="polite">
      <style>{`
        .consent-banner {
          position: fixed; left: 0; right: 0; bottom: 0; z-index: 9999;
          background: #000; border-top: 1px solid rgba(201,154,63,0.30);
          padding: clamp(18px, 3vh, 26px) clamp(18px, 5vw, 48px);
        }
        .consent-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 16px;
        }
        @media (min-width: 760px) {
          .consent-inner { flex-direction: row; align-items: center; justify-content: space-between; gap: 24px; }
        }
        .consent-title {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(201,154,63,0.9); margin: 0 0 6px;
        }
        .consent-body {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.86rem; line-height: 1.6;
          color: rgba(250,244,236,0.78); margin: 0; max-width: 640px;
        }
        .consent-actions {
          display: flex; flex-direction: column; gap: 10px; flex-shrink: 0;
        }
        @media (min-width: 760px) {
          .consent-actions { flex-direction: row; align-items: center; }
        }
        .consent-btn-primary {
          background: linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
          border: 1px solid rgba(250,244,236,0.30); border-radius: 8px;
          color: #000; font-family: 'Cinzel', serif; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 12px 26px; cursor: pointer; font-size: 0.78rem;
        }
        .consent-btn-secondary {
          background: transparent; border: 1px solid rgba(250,244,236,0.30);
          border-radius: 8px; color: rgba(250,244,236,0.78);
          font-family: 'Cinzel', serif; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 12px 26px; cursor: pointer; font-size: 0.78rem;
        }
        .consent-btn-link {
          background: none; border: none; cursor: pointer; padding: 4px 0;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem;
          color: rgba(250,244,236,0.55); text-decoration: underline;
          text-underline-offset: 3px; align-self: flex-start;
        }
        .consent-btn-link:hover { color: rgba(250,244,236,0.9); }
        @media (max-width: 759px) {
          .consent-btn-primary, .consent-btn-secondary { width: 100%; }
        }
        .consent-settings {
          display: flex; flex-direction: column; gap: 14px;
          margin-top: 4px; padding-top: 16px;
          border-top: 1px solid rgba(201,154,63,0.20);
        }
        .consent-toggle-row {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
        }
        .consent-toggle-label {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.78rem;
          letter-spacing: 0.06em; color: rgba(250,244,236,0.9); margin: 0 0 4px;
        }
        .consent-toggle-desc {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.8rem; line-height: 1.5;
          color: rgba(250,244,236,0.55); margin: 0; max-width: 460px;
        }
        .consent-switch {
          position: relative; flex-shrink: 0; width: 44px; height: 24px;
          border-radius: 999px; border: 1px solid rgba(250,244,236,0.30);
          background: rgba(250,244,236,0.08); cursor: pointer;
        }
        .consent-switch[data-on="true"] { background: rgba(201,154,63,0.55); border-color: rgba(201,154,63,0.7); }
        .consent-switch-knob {
          position: absolute; top: 2px; left: 2px; width: 18px; height: 18px;
          border-radius: 50%; background: #FAF4EC; transition: transform .15s ease;
        }
        .consent-switch[data-on="true"] .consent-switch-knob { transform: translateX(20px); }
      `}</style>

      <div className="consent-inner">
        <div>
          <p className="consent-title">{t('consent.title')}</p>
          <p className="consent-body">{t('consent.body')}</p>

          {settingsOpen && (
            <div className="consent-settings">
              <div className="consent-toggle-row">
                <div>
                  <p className="consent-toggle-label">{t('consent.analytics.label')}</p>
                  <p className="consent-toggle-desc">{t('consent.analytics.desc')}</p>
                </div>
                <button
                  type="button"
                  className="consent-switch"
                  data-on={analyticsOn}
                  role="switch"
                  aria-checked={analyticsOn}
                  aria-label={t('consent.analytics.label')}
                  onClick={() => setAnalyticsOn((v) => !v)}
                >
                  <span className="consent-switch-knob" />
                </button>
              </div>
              <div className="consent-toggle-row">
                <div>
                  <p className="consent-toggle-label">{t('consent.marketing.label')}</p>
                  <p className="consent-toggle-desc">{t('consent.marketing.desc')}</p>
                </div>
                <button
                  type="button"
                  className="consent-switch"
                  data-on={marketingOn}
                  role="switch"
                  aria-checked={marketingOn}
                  aria-label={t('consent.marketing.label')}
                  onClick={() => setMarketingOn((v) => !v)}
                >
                  <span className="consent-switch-knob" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="consent-actions">
          {!settingsOpen && (
            <button type="button" className="consent-btn-link" onClick={handleOpenSettings}>
              {t('consent.settings')}
            </button>
          )}
          {settingsOpen ? (
            <button type="button" className="consent-btn-primary" onClick={handleSave}>
              {t('consent.save')}
            </button>
          ) : (
            <>
              <button type="button" className="consent-btn-secondary" onClick={handleNecessaryOnly}>
                {t('consent.necessary')}
              </button>
              <button type="button" className="consent-btn-primary" onClick={handleAcceptAll}>
                {t('consent.acceptAll')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
