/**
 * ConsentBanner — Vlna B (Časť 1, infra). Fixed bottom cookie/consent banner.
 * Texty cez t('consent.*') — kľúče pribudnú v Časti 2 (i18n), dovtedy renderujú
 * raw kľúč (fallback v useT/t()). Banner sa zobrazuje len ak !hasChoice().
 * Reopen: window event 'dogypt:open-consent' (volá Footer „Cookie settings").
 */
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HandArrowLeft } from '@/components/pack/HandIcons';
import { useT } from '@/i18n/LanguageContext';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const splitRef = useRef<HTMLDivElement | null>(null);
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
  // ⛔ 22. 9. 2026 ZMENA: lišta klesla na 112 px a obsah stránok už NEPOSÚVA —
  // prekrýva ho (Matej: „radšej keby zakryli obsah na mobile než ho vytlačiť").
  // Premennú dnes čítajú LEN okná, ktoré si človek sám otvoril (panel `+`,
  // denník) — ich tlačidlá by lišta zakryla. Stránka ani nav ju nečítajú.
  // Pôvodné riešenie bolo ODSADENIE, nie nižšia lišta: výšku publikujeme na <html> a
  // obrazovka si ju pripočítala k spodnému paddingu (`Entry.tsx`). Meriame
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

  // Rozbaľovačka pri „Only necessary" sa zavrie klikom mimo (vzor PackNotifications).
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (splitRef.current && !splitRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

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
    setMenuOpen(false);
    const c = getConsent();
    setAnalyticsOn(Boolean(c?.analytics));
    setMarketingOn(Boolean(c?.marketing));
    setSettingsOpen(true);
  };

  return (
    <div ref={barRef} className="consent-banner" role="dialog" aria-live="polite" aria-label={t('consent.title')}>
      {/* ── LIŠTA 22. 9. 2026 (Matej: „cookies sa nedajú zmenšiť skrátiť a CTA musí byť
          lapis - oprav to všade … a v only necessary dať dropdown s choose") ──────────
          · CTA je LAPIS — lišta je bledá, na bledom je hlavné CTA lapis (brand lock).
            Zlatý gradient sem patril len kým bol kánon zlatý. Tlačidlo Uložiť aj zapnutý
            prepínač idú s ním: je to MOJA VOĽBA, teda lapis (deliaca čiara zlato/lapis).
          · Nadpis nie je samostatný riadok, ale tučný začiatok vety — o riadok menej.
          · „Choose" nie je tretí prvok, ale položka v rozbaľovačke pri „Only necessary".
          ⚠️ „Only necessary" ostáva JEDNÝM KLIKOM (hlavná plocha deleného tlačidla),
             šípka je len vedľa. Odmietnutie nesmie byť ťažšie než súhlas (GDPR/EDPB) —
             keby celé tlačidlo len otváralo menu, bolo by.
          ⚠️ V CSS nižšie nesmie byť spätný apostrof — celý blok je template literál. */}
      <style>{`
        .consent-banner {
          position: fixed; left: 0; right: 0; bottom: 0; z-index: 9999;
          background: #F5EEDF; border-top: 1px solid rgba(201,154,63,0.55);
          box-shadow: 0 -6px 26px rgba(0,0,0,0.28);
          padding: 12px 24px;
        }
        .consent-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 24px;
        }
        .consent-body {
          font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.45;
          color: #2a2013; margin: 0; max-width: 640px;
        }
        .consent-body b {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
          letter-spacing: 0.14em; text-transform: uppercase; color: #1a1206; margin-right: 4px;
        }
        .consent-bone { display: inline-block; width: 20px; height: 20px; vertical-align: -4px; margin-right: 8px; }
        .consent-actions { display: flex; flex-direction: row; align-items: center; gap: 8px; flex-shrink: 0; }
        .consent-btn-primary, .consent-btn-secondary, .consent-split-main, .consent-split-arrow {
          font-family: 'Cinzel', serif; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          font-size: 12px; cursor: pointer; white-space: nowrap;
        }
        .consent-btn-primary {
          background: ${LAPIS.grad}; color: ${LAPIS.ink};
          border: 1px solid ${LAPIS.deep}; border-radius: 8px; box-shadow: ${LAPIS_BTN_SHADOW};
          padding: 12px 24px;
        }
        .consent-btn-primary:hover { background: ${LAPIS.gradHover}; }
        .consent-btn-secondary {
          background: transparent; border: 1px solid rgba(26,18,6,0.35);
          border-radius: 8px; color: #2a2013; padding: 12px 24px;
        }
        .consent-btn-secondary:hover { background: rgba(26,18,6,0.06); }
        /* DELENÉ TLAČIDLO — hlavná plocha = len nevyhnutné, šípka = rozbaľovačka */
        .consent-split { position: relative; display: flex; }
        .consent-split-main {
          background: transparent; color: #2a2013; padding: 12px 16px;
          border: 1px solid rgba(26,18,6,0.35); border-right: none; border-radius: 8px 0 0 8px;
        }
        .consent-split-arrow {
          display: flex; align-items: center; justify-content: center; padding: 0 8px;
          background: transparent; color: #2a2013;
          border: 1px solid rgba(26,18,6,0.35); border-radius: 0 8px 8px 0;
        }
        .consent-split-main:hover, .consent-split-arrow:hover { background: rgba(26,18,6,0.06); }
        .consent-arrow-ic { display: flex; transform: rotate(-90deg); transition: transform .15s ease; }
        .consent-split-arrow[aria-expanded="true"] .consent-arrow-ic { transform: rotate(90deg); }
        .consent-menu {
          position: absolute; right: 0; bottom: calc(100% + 8px); min-width: 100%;
          background: #FFFDF7; border: 1px solid rgba(201,154,63,0.55); border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.22); padding: 4px; z-index: 1;
        }
        .consent-menu button {
          display: block; width: 100%; text-align: left; background: none; border: none; cursor: pointer;
          padding: 8px 12px; border-radius: 8px;
          font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: #2a2013;
        }
        .consent-menu button:hover { background: ${LAPIS.fill}; }
        .consent-settings {
          display: flex; flex-direction: column; gap: 12px;
          margin-top: 12px; padding-top: 12px;
          border-top: 1px solid rgba(26,18,6,0.15);
        }
        .consent-toggle-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .consent-toggle-label {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
          letter-spacing: 0.06em; color: #1a1206; margin: 0 0 4px;
        }
        .consent-toggle-desc {
          font-family: 'Space Grotesk', sans-serif; font-size: 12px; line-height: 1.5;
          color: rgba(42,32,19,0.72); margin: 0; max-width: 460px;
        }
        .consent-switch {
          position: relative; flex-shrink: 0; width: 44px; height: 24px;
          border-radius: 999px; border: 1px solid rgba(26,18,6,0.30);
          background: rgba(26,18,6,0.12); cursor: pointer;
        }
        .consent-switch[data-on="true"] { background: ${LAPIS.edge}; border-color: ${LAPIS.deep}; }
        .consent-switch-knob {
          position: absolute; top: 2px; left: 2px; width: 18px; height: 18px;
          border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.35);
          transition: transform .15s ease;
        }
        .consent-switch[data-on="true"] .consent-switch-knob { transform: translateX(20px); }

        /* MOBIL: text nad tlačidlami, obe tlačidlá v JEDNOM riadku 50/50. */
        @media (max-width: 759px) {
          .consent-banner { padding: 12px 16px; }
          .consent-inner { flex-direction: column; align-items: stretch; gap: 8px; }
          .consent-body { font-size: 12px; }
          .consent-actions > * { flex: 1 1 0; min-width: 0; }
          .consent-btn-primary, .consent-btn-secondary { padding: 12px 8px; letter-spacing: 0.06em; }
          .consent-split-main { flex: 1 1 auto; min-width: 0; padding: 12px 8px; letter-spacing: 0.06em; }
          .consent-split-arrow { flex: 0 0 auto; }
          .consent-menu { left: 0; right: 0; }
          .consent-split-main { overflow: hidden; text-overflow: ellipsis; }
        }
        /* Pod 380 px sa ONLY NECESSARY v 12 px vedľa šípky do polovice riadku nezmestí
           a nowrap by roztiahol celú stránku do šírky (snímka 360 px, 22. 9.). */
        @media (max-width: 379px) {
          .consent-btn-primary, .consent-btn-secondary, .consent-split-main { font-size: 10px; letter-spacing: 0.04em; }
          .consent-split-arrow { padding: 0 6px; }
        }
      `}</style>

      <div className="consent-inner">
        <div>
          <p className="consent-body">
            {/* Kosť z kitu — cookie, ktorá JE na jedenie, vedľa vety o tých, čo nie sú
                (Matej 22. 9.). Veľkosť písma, aby riadok nenarástol. */}
            <img className="consent-bone" src="/icons/pack/bone.svg" alt="" aria-hidden />
            <b>{t('consent.title')}</b>{t('consent.body')}
          </p>

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
          {settingsOpen ? (
            <>
              <button type="button" className="consent-btn-secondary" onClick={handleNecessaryOnly}>
                {t('consent.necessary')}
              </button>
              <button type="button" className="consent-btn-primary" onClick={handleSave}>
                {t('consent.save')}
              </button>
            </>
          ) : (
            <>
              <div className="consent-split" ref={splitRef}>
                <button type="button" className="consent-split-main" onClick={handleNecessaryOnly}>
                  {t('consent.necessary')}
                </button>
                <button
                  type="button"
                  className="consent-split-arrow"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label={t('consent.settings')}
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  {/* Šípka z KITU (ručná kresba), otočená nadol — lucide ChevronDown by bola nová
                      generická ikonka a stráž check:ikony by ju zastavila. */}
                  <span className="consent-arrow-ic" aria-hidden><HandArrowLeft size={16} /></span>
                </button>
                {menuOpen && (
                  <div className="consent-menu" role="menu">
                    <button type="button" role="menuitem" onClick={handleOpenSettings}>
                      {t('consent.settings')}
                    </button>
                  </div>
                )}
              </div>
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
