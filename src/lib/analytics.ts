import posthog from 'posthog-js';

// Aktuálny jazyk — nastavuje App.tsx (RefCapture) cez useLang. Každý event nesie lang.
let currentLang = 'en';
export const setAnalyticsLang = (l: string) => { if (l) currentLang = l; };

// posthog.__loaded je false kým nie je zavolaný posthog.init() (prázdny POSTHOG_KEY
// v main.tsx = init sa nikdy nevolá) — všetky volania nižšie sú vtedy bezpečný no-op.
const enabled = () => Boolean(posthog?.__loaded);

// dataLayer bridge (Vlna C): každý track() ide AJ do window.dataLayer, aby GTM/GA4/Pixel
// mali jeden bod inštrumentácie spolu s PostHogom. Consent Mode v2 (index.html) drží tagy
// pod súhlasom — bridge len dodá eventy, gating rieši GTM. dataLayer vždy existuje (index.html).
const toDataLayer = (event: string, props?: Record<string, unknown>) => {
  try { (window as any).dataLayer?.push({ event, ...props }); } catch { /* ignore */ }
};

export const track = (event: string, props?: Record<string, unknown>) => {
  try { if (enabled()) posthog.capture(event, { lang: currentLang, ...props }); } catch { /* ignore */ }
  toDataLayer(event, { lang: currentLang, ...props });
};

export const trackPageview = (path: string) => {
  try { if (enabled()) posthog.capture('$pageview', { path, lang: currentLang }); } catch { /* ignore */ }
  toDataLayer('spa_pageview', { path, lang: currentLang });
};

// Volá sa vo vlne B po analytics consente — prepne z memory na plný režim + recording.
export const upgradeToTier1 = () => {
  try {
    if (!enabled()) return;
    posthog.set_config({ persistence: 'localStorage+cookie' });
    posthog.startSessionRecording();
  } catch { /* ignore */ }
};

// Volá sa keď user v Cookie settings VYPNE analytics po tom, čo bol predtým Tier1
// (GDPR downgrade — bez tohto by applyConsent bol no-op a recording by bežal ďalej).
// Poradie: najprv stopni recording, potom prepni persistence späť na 'memory' — posthog-js
// interne (PostHogPersistence.update_config) pri zmene `persistence` typu zavolá `clear()`
// na PÔVODNOM storage (localStorage+cookie) PRED prepnutím na nový, takže existujúce
// ph_* cookies/localStorage kľúče sa reálne zmažú, nielen prestanú dostávať nové zápisy.
export const downgradeToTier0 = () => {
  try {
    if (!enabled()) return;
    posthog.stopSessionRecording();
    posthog.set_config({ persistence: 'memory' });
  } catch { /* ignore */ }
};
