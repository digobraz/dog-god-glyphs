// ── SESSION PREŽIJE REŠTART APPKY (20. 10. 2026, plán appky Fáza 1 bod 3) ───────
// iOS vie úložisko WebView (localStorage) zmazať, keď má málo miesta alebo appku dlho
// nikto neotvoril — člen by bol odhlásený bez dôvodu. Session preto žije v natívnom úložisku
// (`@capacitor/preferences`: UserDefaults / SharedPreferences), ktoré OS nečistí.
//
// ⚠️ localStorage ostáva ako ZRKADLO, nie náhrada: `packFlags.ts` a `PackWizard.tsx` čítajú
//    kľúč `sb-<ref>-auth-token` SYNCHRONNE, ešte pred supabase-js. Preto
//    · zápis ide do oboch,
//    · pred prvým renderom (`restoreAppSession()` v main.tsx) sa chýbajúci kľúč z Preferences
//      vráti do localStorage.
// Web nič z tohto nepoužíva: adaptér sa dosadí len keď `IS_APP` (integrations/supabase/client.ts)
// a plugin sa sťahuje dynamicky.
import { IS_APP } from '@/lib/isApp';

// 🔴 Plugin NIKDY nevracaj z async/then priamo: je to Proxy a `await` by na ňom zavolal `.then()`
//    („Preferences.then() is not implemented") — preto je zabalený v objekte.
const loadPrefs = () => import('@capacitor/preferences').then((m) => ({ P: m.Preferences }));
const AUTH_KEY = /^sb-.*-auth-token/;

const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* */ } },
  del: (k: string) => { try { localStorage.removeItem(k); } catch { /* */ } },
};

/** Úložisko pre `supabase.auth` v appke (supabase-js zvláda async storage). */
export const appAuthStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const { value } = await (await loadPrefs()).P.get({ key });
      if (value != null) return value;
    } catch { /* plugin nedostupný — padne na localStorage */ }
    return ls.get(key); // session z čias pred pluginom sa pri najbližšom zápise presunie
  },
  async setItem(key: string, value: string): Promise<void> {
    ls.set(key, value);
    try { await (await loadPrefs()).P.set({ key, value }); } catch { /* localStorage stačí */ }
  },
  async removeItem(key: string): Promise<void> {
    ls.del(key);
    try { await (await loadPrefs()).P.remove({ key }); } catch { /* */ }
  },
};

/** Pred prvým renderom: kľúče session z natívneho úložiska späť do localStorage (ak ich OS zmazal). */
export async function restoreAppSession(): Promise<void> {
  if (!IS_APP) return;
  try {
    const { P } = await loadPrefs();
    const { keys } = await P.keys();
    for (const key of keys.filter((k) => AUTH_KEY.test(k))) {
      if (ls.get(key) != null) continue;
      const { value } = await P.get({ key });
      if (value != null) ls.set(key, value);
    }
  } catch { /* bez pluginu ide appka ako doteraz */ }
}
