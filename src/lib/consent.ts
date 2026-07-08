// Consent storage + effects — Vlna B (Časť 1, infra).
// localStorage kľúč `dogypt_consent`. Aplikuje účinky voľby (analytics/marketing).
import { upgradeToTier1, downgradeToTier0 } from './analytics';

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
  if (c.marketing === true) {
    // gtag ešte NEEXISTUJE (príde vo vlne C) — guard = no-op teraz.
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      });
    }
    (window as any).dataLayer?.push({ event: 'consent_marketing_granted' });
  }
  // pri false nič nevoláme — Tier 0 posthog beží ďalej (cookieless memory, kryté policy).
}

export function hasChoice(): boolean {
  return Boolean(getConsent());
}
