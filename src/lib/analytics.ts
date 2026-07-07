import posthog from 'posthog-js';

// Aktuálny jazyk — nastavuje App.tsx (RefCapture) cez useLang. Každý event nesie lang.
let currentLang = 'en';
export const setAnalyticsLang = (l: string) => { if (l) currentLang = l; };

// posthog.__loaded je false kým nie je zavolaný posthog.init() (prázdny POSTHOG_KEY
// v main.tsx = init sa nikdy nevolá) — všetky volania nižšie sú vtedy bezpečný no-op.
const enabled = () => Boolean(posthog?.__loaded);

export const track = (event: string, props?: Record<string, unknown>) => {
  try { if (enabled()) posthog.capture(event, { lang: currentLang, ...props }); } catch { /* ignore */ }
};

export const trackPageview = (path: string) => {
  try { if (enabled()) posthog.capture('$pageview', { path, lang: currentLang }); } catch { /* ignore */ }
};

// Volá sa vo vlne B po analytics consente — prepne z memory na plný režim + recording.
export const upgradeToTier1 = () => {
  try {
    if (!enabled()) return;
    posthog.set_config({ persistence: 'localStorage+cookie' });
    posthog.startSessionRecording();
  } catch { /* ignore */ }
};
