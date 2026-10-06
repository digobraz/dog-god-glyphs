// Consent storage + effects — Vlna B (Časť 1, infra).
// localStorage kľúč `dogypt_consent`. Aplikuje účinky voľby (analytics/marketing).
import { track, upgradeToTier1, downgradeToTier0 } from './analytics';

const STORAGE_KEY = 'dogypt_consent';

export type Consent = { analytics: boolean; marketing: boolean; v: 1; ts: number };

export function getConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.analytics !== 'boolean' || typeof parsed?.marketing !== 'boolean') return null;
    return parsed as Consent;
  } catch {
    return null;
  }
}

export function saveConsent(c: { analytics: boolean; marketing: boolean }): void {
  // Predchádzajúca voľba treba PRED prepísaním — applyConsent podľa nej rozlíši
  // upgrade (Tier0→Tier1) od downgrade (Tier1→Tier0, viď nižšie).
  const prev = getConsent();
  const consent: Consent = { analytics: c.analytics, marketing: c.marketing, v: 1, ts: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch { /* ignore */ }
  // Meranie accept rate (2026-08-06). Do 6.8. sa voľba hlásila IBA do dataLayera,
  // takže sme nevedeli, koľko ľudí analytics prijme — a teda ani akú časť session
  // replay pokrytia strácame (replay beží až po `analytics: true`). Event ide
  // ZÁMERNE odtiaľto, nie z applyConsent(): applyConsent sa volá aj pri každom
  // mounte ConsentBanneru z uloženej voľby, takže by rátal návštevy, nie voľby.
  // `change` odlíši prvú voľbu od neskoršej úpravy v Cookie settings.
  track('consent_choice', {
    analytics: c.analytics,
    marketing: c.marketing,
    change: prev ? 'update' : 'first',
  });
  applyConsent(consent, prev);
}

export function applyConsent(c: Consent, prev?: Consent | null): void {
  if (c.analytics === true) {
    upgradeToTier1();
  } else if (prev?.analytics === true) {
    // Downgrade: user mal predtým zapnuté analytics (session recording + cookies)
    // a teraz to v Cookie settings vypol a uložil — bez tejto vetvy by applyConsent
    // bol no-op a nahrávanie/cookies by bežali ďalej (GDPR problém).
    downgradeToTier0();
  }
  // Consent Mode v2 (Vlna C): gtag existuje (inicializovaný v index.html PRED GTM).
  // Posielame KOMPLETNÝ stav pri každej voľbe — aj revoke (granted→denied), inak by
  // GA4/Pixel bežali ďalej po odvolaní v Cookie settings. analytics_storage viazané na
  // `analytics`, ad_* na `marketing` (Consent Mode v2 ich rozlišuje).
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('consent', 'update', {
      analytics_storage:  c.analytics ? 'granted' : 'denied',
      ad_storage:         c.marketing ? 'granted' : 'denied',
      ad_user_data:       c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied',
    });
  }
  // Custom eventy PO gtag update — GTM tagy s „require analytics_storage/ad_storage"
  // sa pri neskoršom grante v tej istej session samy neznovuspustia (spustia sa len pri
  // reloade s už uloženým súhlasom). Tieto eventy im dajú druhý firing trigger, aby GA4/Pixel
  // nabehli okamžite po kliknutí Accept, nie až po reloade. Poradie: gtag update už prebehol
  // vyššie, takže consent state je granted keď trigger spustí gated tag.
  if (c.analytics === true) {
    (window as any).dataLayer?.push({ event: 'consent_analytics_granted' });
  }
  if (c.marketing === true) {
    (window as any).dataLayer?.push({ event: 'consent_marketing_granted' });
  }
  // Tier 0 posthog beží ďalej nezávisle (cookieless memory, kryté policy).
}

export function hasChoice(): boolean {
  return Boolean(getConsent());
}
