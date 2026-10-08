import type { PostHog } from 'posthog-js';
import { POSTHOG_KEY, POSTHOG_HOST } from './env';

// Aktuálny jazyk — nastavuje App.tsx (RefCapture) cez useLang. Každý event nesie lang.
let currentLang = 'en';
export const setAnalyticsLang = (l: string) => { if (l) currentLang = l; };

// ── POSTHOG SA NAČÍTAVA LENIVO (6. 10. 2026, perf pass /onepage) ──────────────
// `posthog-js` je 215 KB v hlavnom balíku — parsoval sa PRED prvým vykreslením, hoci
// analytika nič nevykresľuje. Teraz sa dotiahne až po `load` + voľnom čase prehliadača
// (`initAnalytics`, volá ju main.tsx). Eventy, čo prídu skôr (pageview, prvé kliky),
// čakajú vo fronte a po inite sa odohrajú v tom istom poradí — nič sa nestratí.
// Prázdny POSTHOG_KEY = init sa nikdy nevolá a všetky volania sú bezpečný no-op.
let posthog: PostHog | null = null;
const queue: Array<(ph: PostHog) => void> = [];
const MAX_QUEUE = 100;
const run = (fn: (ph: PostHog) => void) => {
  if (posthog) { try { fn(posthog); } catch { /* ignore */ } return; }
  if (POSTHOG_KEY && queue.length < MAX_QUEUE) queue.push(fn);
};

// ── „TO SOM JA" — vlastné návštevy von z čísiel (8. 10. 2026) ───────────────────────────────
// Matej: *„potrebujem aby si ten udaj o navštevach filtrobval a ukazoval len navštevy mimo mňa!
// nie lokal nie ja iba čista navšteva"*. Dovtedy ho od sveta delilo len mesto z geoIP
// (Biely Kostol) — telefón na mobilných dátach sa tváril ako Bratislava a rátal sa.
// Značka `internal: true` ide na KAŽDÝ event; `posthog-analytics.py` aj filter testovacích
// účtov v PostHogu ju vyhadzujú. Dostane ju: (1) zariadenie, ktoré raz otvorí `dogypt.com/?ja`,
// (2) zariadenie, kde sa prihlási účet zakladateľa, (3) každý host mimo dogypt.com
// (localhost, náhľad workers.dev, prerender) — tam nie je skutočný návštevník nikdy.
const SELF_KEY = 'dogypt_self';
const isProdHost = () => /^(www\.)?dogypt\.com$/.test(location.hostname);
const isSelf = () => {
  if (!isProdHost()) return true;
  try { return localStorage.getItem(SELF_KEY) === '1'; } catch { return false; }
};
// `?ja` sa číta HNEĎ pri načítaní modulu — init PostHogu príde až o pár sekúnd neskôr
// a router by medzitým adresu mohol prepísať.
try { if (typeof location !== 'undefined' && new URLSearchParams(location.search).has('ja')) localStorage.setItem(SELF_KEY, '1'); } catch { /* ignore */ }
export const markSelf = () => {
  try { localStorage.setItem(SELF_KEY, '1'); } catch { /* súkromné okno */ }
  run((ph) => ph.register({ internal: true }));
};

export const initAnalytics = (scrub: (ev: any) => any) => {
  if (!POSTHOG_KEY || posthog) return;
  import('posthog-js').then(({ default: ph }) => {
    ph.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      persistence: 'memory',              // Tier 0: cookieless, bez person profilu (vlna B zapne consent)
      person_profiles: 'identified_only',
      disable_session_recording: true,    // zapne sa vo vlne B po analytics consente
      autocapture: true,
      capture_exceptions: true,           // error tracking zadarmo
      capture_pageview: false,            // pageviews riešime manuálne v App.tsx (SPA routy)
      // Heatmapy (21. 9. 2026): bez `enable_heatmaps` PostHog kliky na súradnice NEZBIERA
      // vôbec — sú to dve rôzne veci ako `autocapture`. Dáta idú ako `$$heatmap_data`
      // prilepené k pageview, teda bez ďalšieho volania navyše.
      enable_heatmaps: true,
      // Čas na obrazovke (27. 9. 2026): bez `$pageleave` nemala posledná obrazovka session
      // čas nikdy a heatmapa „kde sa ľudia zdržujú" (Funkcie → TEPLO) by o nej mlčala.
      capture_pageleave: true,
      // 🔴 Tajomstvá v URL nesmú do analytiky. `maskPath` čistí len náš `path` — PostHog si
      // `$current_url`, `$pathname`, `$referrer` berie sám z okna, takže pozývací token
      // z `/pack/join/<token>` a Supabase tokeny v hashi magic linku odchádzali celé.
      before_send: (ev) => (ev ? scrub(ev) : ev),
    });
    if (isSelf()) ph.register({ internal: true });
    posthog = ph;
    queue.splice(0).forEach((fn) => { try { fn(ph); } catch { /* ignore */ } });
    vitals.splice(0).forEach(({ props, timestamp }) => { try { ph.capture('web_vital', props, { timestamp }); } catch { /* ignore */ } });
  }).catch(() => { queue.length = 0; });
};

// dataLayer bridge (Vlna C): každý track() ide AJ do window.dataLayer, aby GTM/GA4/Pixel
// mali jeden bod inštrumentácie spolu s PostHogom. Consent Mode v2 (index.html) drží tagy
// pod súhlasom — bridge len dodá eventy, gating rieši GTM. dataLayer vždy existuje (index.html).
const toDataLayer = (event: string, props?: Record<string, unknown>) => {
  try { (window as any).dataLayer?.push({ event, ...props }); } catch { /* ignore */ }
};

// MERANIE RÝCHLOSTI (lib/rum.ts) — 8. 10. 2026. LCP, CLS aj INP hlási prehliadač až keď
// človek stránku OPÚŠŤA (skryje kartu, zatvorí ju). Bežný `track` ich v tej chvíli len
// zaradí: PostHog posiela v dávkach á pár sekúnd a pred `initAnalytics` (load + ~2,5 s)
// ešte vôbec nežije. Prvé dni RUM to bolo vidieť — na `/` 25× FCP, ale len 7× LCP.
// Preto: PostHog beží ⇒ hneď a cez sendBeacon; nebeží a stránka sa skrýva ⇒ vlastný
// beacon na ten istý endpoint (formát ako posthog-js: data=base64 JSON).
const vitals: Array<{ props: Record<string, unknown>; timestamp: Date }> = [];
let vitalId = '';
// 🔴 Roboty von: posthog-js ich odfiltruje sám (headless, Lighthouse), vlastný beacon nie —
// bez tejto vetvy by RUM plnil Lighthouse, Googlebot a NÁŠ prerender pri každom builde.
const isBot = () => navigator.webdriver || /bot|crawl|spider|headless|lighthouse|pagespeed|prerender|slurp|facebookexternalhit/i.test(navigator.userAgent);
const beaconVitals = () => {
  if (posthog || !vitals.length || !POSTHOG_KEY || !navigator.sendBeacon || isBot()) return;
  vitalId ||= 'rum-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  const batch = vitals.splice(0).map(({ props, timestamp }) => ({
    event: 'web_vital',
    timestamp: timestamp.toISOString(),
    properties: { ...props, token: POSTHOG_KEY, distinct_id: vitalId, $process_person_profile: false, $lib: 'rum-beacon', ...(isSelf() ? { internal: true } : {}) },
  }));
  try {
    const json = JSON.stringify(batch);
    const b64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))));
    navigator.sendBeacon(`${POSTHOG_HOST}/e/?compression=base64`, new Blob(['data=' + encodeURIComponent(b64)], { type: 'application/x-www-form-urlencoded' }));
  } catch { /* meranie nesmie zhodiť stránku */ }
};
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') beaconVitals(); });
  window.addEventListener('pagehide', beaconVitals);
}
export const trackVital = (props: Record<string, unknown>) => {
  const p = { lang: currentLang, ...props }; const timestamp = new Date();
  if (posthog) { try { posthog.capture('web_vital', p, { timestamp, send_instantly: true, transport: 'sendBeacon' }); } catch { /* ignore */ } return; }
  if (POSTHOG_KEY && vitals.length < MAX_QUEUE) vitals.push({ props: p, timestamp });
  if (document.visibilityState === 'hidden') beaconVitals();
};

export const track = (event: string, props?: Record<string, unknown>) => {
  const lang = currentLang; const timestamp = new Date(); run((ph) => ph.capture(event, { lang, ...props }, { timestamp }));
  toDataLayer(event, { lang: currentLang, ...props });
};

// Abandoned-cart identify (2026-07-10): kupec dopíše platný email na /checkout →
// PostHog person dostane email ako identitu. Bez tohto sú checkout-odídenci anonymi
// (Stripe redirect navyše láme person_id) a záchranný mail nemá komu ísť.
export const identifyUser = (email: string) => {
  const e = email.trim().toLowerCase();
  if (e) run((ph) => ph.identify(e, { email: e }));
};

// Identita ČLENA v /pack (21. 9. 2026, rozhodol Matej): distinct_id = UUID účtu, email sa
// neposiela. Oddelené od `identifyUser` vyššie schválne — tá posiela email, lebo abandoned-cart
// mail nemá komu ísť bez neho. Tu by email bol osobný údaj navyše, bez úžitku.
export const identifyById = (userId: string) => {
  if (userId) run((ph) => ph.identify(userId));
};

// Odhlásenie musí identitu PUSTIŤ — bez toho by ďalší človek na tom istom zariadení (Matejov
// testovací telefón, zdieľaný notebook) pokračoval pod cudzím person profilom.
export const resetIdentity = () => {
  run((ph) => ph.reset());
};

export const trackPageview = (path: string) => {
  const lang = currentLang; const timestamp = new Date(); run((ph) => ph.capture('$pageview', { path, lang }, { timestamp }));
  toDataLayer('spa_pageview', { path, lang: currentLang });
};

// Volá sa vo vlne B po analytics consente — prepne z memory na plný režim + recording.
export const upgradeToTier1 = () => {
  run((ph) => {
    ph.set_config({ persistence: 'localStorage+cookie' });
    if (isSelf()) ph.register({ internal: true }); // zmena persistence volá clear() — značka by zmizla
    ph.startSessionRecording();
  });
};

// Volá sa keď user v Cookie settings VYPNE analytics po tom, čo bol predtým Tier1
// (GDPR downgrade — bez tohto by applyConsent bol no-op a recording by bežal ďalej).
// Poradie: najprv stopni recording, potom prepni persistence späť na 'memory' — posthog-js
// interne (PostHogPersistence.update_config) pri zmene `persistence` typu zavolá `clear()`
// na PÔVODNOM storage (localStorage+cookie) PRED prepnutím na nový, takže existujúce
// ph_* cookies/localStorage kľúče sa reálne zmažú, nielen prestanú dostávať nové zápisy.
export const downgradeToTier0 = () => {
  run((ph) => {
    ph.stopSessionRecording();
    ph.set_config({ persistence: 'memory' });
    if (isSelf()) ph.register({ internal: true }); // zmena persistence volá clear() — značka by zmizla
  });
};
