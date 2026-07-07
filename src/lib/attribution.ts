// First-touch atribúcia do localStorage. Konzumuje ju PaymentScreen → create-checkout payload → dogs.
const KEY = 'dogypt_attribution';

export interface Attribution {
  utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string;
  first_referrer?: string; first_landing?: string;
}

// Zavolaj raz pri prvom loade (App.tsx). Ak už existuje záznam, NEPREPISUJ (first-touch wins).
export const captureAttribution = () => {
  try {
    if (localStorage.getItem(KEY)) return;
    const p = new URLSearchParams(window.location.search);
    const data: Attribution = {
      utm_source: p.get('utm_source') || undefined,
      utm_medium: p.get('utm_medium') || undefined,
      utm_campaign: p.get('utm_campaign') || undefined,
      utm_content: p.get('utm_content') || undefined,
      first_referrer: document.referrer || undefined,
      first_landing: window.location.pathname || undefined,
    };
    // ulož len ak je aspoň jedna hodnota (nezaprac prázdnym objektom priame návštevy bez referreru)
    if (Object.values(data).some(Boolean)) localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* ignore */ }
};

export const getAttribution = (): Attribution => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
};
