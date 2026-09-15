/**
 * ConsentBanner — Vlna B (Časť 1, infra). Fixed bottom cookie/consent banner.
 * Texty cez t('consent.*') — kľúče pribudnú v Časti 2 (i18n), dovtedy renderujú
 * raw kľúč (fallback v useT/t()). Banner sa zobrazuje len ak !hasChoice().
 * Reopen: window event 'dogypt:open-consent' (volá Footer „Cookie settings").
 */
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { getConsent, saveConsent, applyConsent, hasChoice } from '@/lib/consent';

// Headless capture routes (generate-pdfs → Cloudflare Browser Rendering,
// wall-healer → Playwright). Those browsers are fresh every run, so they never
// have a stored choice and the banner renders over the artwork and gets PRINTED
// INTO the output — Daniela's certificate PDF #42 shipped with the cookie bar
// baked across the bottom (2026-07-16). No consent UI (and no analytics) has any
// business on a route whose only job is to be photographed.
const RENDER_ROUTES = ['/cert-render', '/invoice-render', '/share-render'];

export function ConsentBanner() {
  const t = useT();
  const { pathname } = useLocation();
  const isRenderRoute = RENDER_ROUTES.some((r) => pathname.startsWith(r));
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(false);
  const [marketingOn, setMarketingOn] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);

  // ── VÝŠKA LIŠTY IDE VON AKO `--consent-h` (2026-09-15) ────────────────────
  // Lišta je `position: fixed; bottom: 0`, takže NEZABERÁ miesto v toku — a
  // obrazovky vstupu sú `min-h-[100dvh]` bez scrollu. Na mobile 390 px je lišta
  // VYSOKÁ 296 px (35 % okna, lebo text aj tri tlačidlá sú pod sebou) a hlavné
  // CTA `/heroglyph` skončilo 120 px POD ňou: `elementFromPoint` v strede
  // tlačidla vracal `consent-body`, takže klik na „VYTVORIŤ HEROGLYF" fyzicky
  // nešiel — na telefóne sa nedalo vstúpiť do platenej funnely. Na PC (lišta
  // 118 px) sa to nikdy neprejavilo, preto to prežilo do 15. 9. 2026.
  //
  // Riešenie je ODSADENIE, nie nižšia lišta: výšku publikujeme na <html> a
  // obrazovka si ju pripočíta k spodnému paddingu (`Entry.tsx`). Meriame
  // `ResizeObserver`-om, lebo výška sa mení jazykom, zalomením aj otvorením
  // Settings. Keď lišta zmizne, premenná ide na `0px` — inak by pod obsahom
  // ostala diera po nej.
  useEffect(() => {
    const el = barRef.current;
    const root = document.documentElement;
    const clear = () => root.style.setProperty('--consent-h', '0px');
    if (isRenderRoute || !visible || !el) { clear(); return clear; }
    const publish = () => root.style.setProperty('--consent-h', `${Math.ceil(el.getBoundingClientRect().height)}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => { ro.disconnect(); clear(); };
  }, [isRenderRoute, visible, settingsOpen]);

  // Mount uloženej voľby — ak už existuje, aplikuj účinky (napr. Tier1 po reloade)
  // a banner sa nezobrazí. Guard proti double-apply cez applyConsent volaný raz.
  useEffect(() => {
    if (isRenderRoute) return;
    const c = getConsent();
    if (c) {
      applyConsent(c);
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [isRenderRoute]);

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

  if (isRenderRoute || !visible) return null;

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
    <div ref={barRef} className="consent-banner" role="dialog" aria-live="polite" aria-label={t('consent.title')}>
      <style>{`
        .consent-banner {
          position: fixed; left: 0; right: 0; bottom: 0; z-index: 9999;
          background: #F5EEDF; border-top: 1px solid rgba(201,154,63,0.55);
          box-shadow: 0 -6px 26px rgba(0,0,0,0.28);
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
          color: #1a1206; margin: 0 0 6px;
        }
        .consent-body {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.86rem; line-height: 1.6;
          color: #2a2013; margin: 0; max-width: 640px;
        }
        .consent-actions {
          display: flex; flex-direction: column; gap: 10px; flex-shrink: 0;
        }
        @media (min-width: 760px) {
          .consent-actions { flex-direction: row; align-items: center; }
        }
        .consent-btn-primary {
          background: linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
          border: 1px solid rgba(26,18,6,0.28); border-radius: 8px;
          color: #000; font-family: 'Cinzel', serif; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 12px 26px; cursor: pointer; font-size: 0.78rem;
        }
        .consent-btn-secondary {
          background: transparent; border: 1px solid rgba(26,18,6,0.35);
          border-radius: 8px; color: #2a2013;
          font-family: 'Cinzel', serif; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 12px 26px; cursor: pointer; font-size: 0.78rem;
        }
        .consent-btn-secondary:hover { background: rgba(26,18,6,0.06); }
        .consent-btn-link {
          background: none; border: none; cursor: pointer; padding: 4px 0;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem;
          color: rgba(42,32,19,0.72); text-decoration: underline;
          text-underline-offset: 3px; align-self: flex-start;
        }
        .consent-btn-link:hover { color: #1a1206; }
        @media (max-width: 759px) {
          .consent-btn-primary, .consent-btn-secondary { width: 100%; }
        }
        .consent-settings {
          display: flex; flex-direction: column; gap: 14px;
          margin-top: 4px; padding-top: 16px;
          border-top: 1px solid rgba(26,18,6,0.15);
        }
        .consent-toggle-row {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
        }
        .consent-toggle-label {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.78rem;
          letter-spacing: 0.06em; color: #1a1206; margin: 0 0 4px;
        }
        .consent-toggle-desc {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.8rem; line-height: 1.5;
          color: rgba(42,32,19,0.72); margin: 0; max-width: 460px;
        }
        .consent-switch {
          position: relative; flex-shrink: 0; width: 44px; height: 24px;
          border-radius: 999px; border: 1px solid rgba(26,18,6,0.30);
          background: rgba(26,18,6,0.12); cursor: pointer;
        }
        .consent-switch[data-on="true"] { background: rgba(201,154,63,0.85); border-color: rgba(201,154,63,0.95); }
        .consent-switch-knob {
          position: absolute; top: 2px; left: 2px; width: 18px; height: 18px;
          border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.35);
          transition: transform .15s ease;
        }
        .consent-switch[data-on="true"] .consent-switch-knob { transform: translateX(20px); }

        /* ── MOBIL: LIŠTA NESMIE ZOŽRAŤ TRETINU OBRAZOVKY (2026-09-15) ──────────
           Pod 760 px stáli akcie v stĺpci, takže tri tlačidlá ležali pod sebou a lišta
           merala 296 px pri 390x844 a 312 px pri 360x740 — to je 35 %, resp. 42 % okna.
           Obrazovky vstupu sú min-h-100dvh, takže hlavné CTA skončilo pod lištou a na
           telefóne sa NEDALO vstúpiť do platenej funnely. Samotné odsadenie cez
           premennú --consent-h to nezachránilo: pod CTA je na /heroglyph ďalší obsah,
           takže ani doscrollovanie na koniec ho nedostalo nad lištu.
           Tu sa preto mení LEN ROZLOŽENIE — tlačidlá idú do riadku a smú zalomiť.
           Farba, font, radius 8px ani znenie sa nedotkli (brand lock).
           POZOR: v tomto komentári nesmie byť spätný apostrof — celý blok je template
           literál a jeden apostrof ho ukončí (zhodí štýl aj build, tsc to nechytí). */
        @media (max-width: 759px) {
          .consent-banner { padding: 14px 16px; }
          .consent-inner { gap: 10px; }
          .consent-body { font-size: 0.8rem; line-height: 1.5; }
          .consent-actions { flex-direction: row; flex-wrap: wrap; align-items: center; gap: 8px; }
          /* basis 50 % (nie auto) — s "auto" si každé tlačidlo vypýta šírku svojho textu,
             dve uppercase Cinzel menovky sa vedľa seba nezmestia a grow ich roztiahne na
             plnú šírku, takže riadok zostal jeden na tlačidlo. Zmerané: 3x 328px = 126px. */
          .consent-btn-primary, .consent-btn-secondary {
            flex: 1 1 calc(50% - 4px); min-width: 0; padding: 11px 8px;
            font-size: 0.68rem; letter-spacing: 0.06em; white-space: nowrap;
          }
          .consent-btn-link { flex: 1 0 100%; text-align: center; }
        }
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
