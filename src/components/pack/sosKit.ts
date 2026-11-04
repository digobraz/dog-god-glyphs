// ── SOS — spoločné drobnosti povrchov, ktoré ukazujú aktívne pátrania (4. 11. 2026) ──────────
// Popup trojuholníka, červený blok vo FEEDe, značky na /map a riadok v chvoste čítajú TIE ISTÉ aktívne
// straty. Jedno volanie `sosActive()` (krajina člena, bez telefónu) zdieľa `shared()`; po zmene
// (NAŠIEL SA, nové vyhlásenie) volaj `sosInvalidate()`.
// 🔴 Všetko je za `TEST_BUILD` — v ostrom builde `useSosActive` nevolá NIČ (žiadne `sos_*` v sieti).
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TEST_BUILD } from '@/lib/env';
import { sosActive, lostShare, lostUrl, type SosActiveRow } from '@/lib/sos';
import { intlLocale } from '@/i18n/bcp47';

const TTL = 30_000;
const EVT = 'dogypt:sos-changed';

let cache: { at: number; p: Promise<SosActiveRow[]> } | null = null;

/** Aktívne straty v krajine člena. Odhlásený / ostrý build ⇒ prázdno bez volania. */
export function loadSosActive(): Promise<SosActiveRow[]> {
  if (!TEST_BUILD) return Promise.resolve([]);
  if (cache && Date.now() - cache.at < TTL) return cache.p;
  const p = (async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return [] as SosActiveRow[];
    const rows = await sosActive();
    return [...rows].sort((a, b) => Number(b.is_mine) - Number(a.is_mine) || (a.created_at < b.created_at ? 1 : -1));
  })().catch(() => { cache = null; return [] as SosActiveRow[]; });
  cache = { at: Date.now(), p };
  return p;
}

/** Zahodí odpoveď a vyzve všetky povrchy, aby sa načítali znova (po NAŠIEL SA, po vyhlásení). */
export function sosInvalidate(): void {
  cache = null;
  try { window.dispatchEvent(new Event(EVT)); } catch { /* SSR */ }
}

/** Zoznam aktívnych pátraní; obnoví sa pri návrate na kartu a po `sosInvalidate()`. */
export function useSosActive(): SosActiveRow[] {
  const [rows, setRows] = useState<SosActiveRow[]>([]);
  useEffect(() => {
    if (!TEST_BUILD) return;
    let alive = true;
    const load = () => { void loadSosActive().then((r) => { if (alive) setRows(r); }); };
    load();
    const onVis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener(EVT, load);
    return () => { alive = false; document.removeEventListener('visibilitychange', onVis); window.removeEventListener(EVT, load); };
  }, []);
  return rows;
}

/** „pred 3 h" / „3 hours ago" — krátky relatívny čas posledného videnia. */
export function sosAgo(iso: string, lang: string): string {
  const mins = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  const rtf = new Intl.RelativeTimeFormat(intlLocale(lang), { numeric: 'auto' });
  const abs = Math.abs(mins);
  if (abs < 60) return rtf.format(mins, 'minute');
  if (abs < 60 * 24) return rtf.format(Math.round(mins / 60), 'hour');
  return rtf.format(Math.round(mins / 1440), 'day');
}

/** Zdieľanie odkazu na pátranie: systémové zdieľanie, inak schránka. Počíta sa len skutočné zdieľanie (`lost_share`). */
export async function shareLostDog(slug: string, text: string): Promise<'shared' | 'copied' | 'failed' | 'cancel'> {
  const url = lostUrl(slug);
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: text, text, url });
      void lostShare(slug).catch(() => {});
      return 'shared';
    } catch { return 'cancel'; }
  }
  try {
    await navigator.clipboard.writeText(url);
    void lostShare(slug).catch(() => {});
    return 'copied';
  } catch { return 'failed'; }
}
