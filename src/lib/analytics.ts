// Inertný analytics wrapper — funguje len ak je window.posthog načítaný (snippet sa pridá neskôr s kľúčom).
// Bez PostHog kľúča sú všetky volania no-op (nič nerozbijú).

declare global {
  interface Window {
    posthog?: { capture: (e: string, p?: Record<string, unknown>) => void };
  }
}

export const track = (event: string, props?: Record<string, unknown>) => {
  try {
    window.posthog?.capture(event, props);
  } catch {
    /* ignore */
  }
};

export const trackPageview = (path: string) => {
  try {
    window.posthog?.capture('$pageview', { path });
  } catch {
    /* ignore */
  }
};

export {};
