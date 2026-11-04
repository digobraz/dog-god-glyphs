// ── SOS — spoločné drobnosti povrchov, ktoré ukazujú aktívne pátrania (4. 11. 2026) ──────────
// Popup trojuholníka, červený blok vo FEEDe, značky na /map a riadok v chvoste čítajú TIE ISTÉ aktívne
// straty. Jedno volanie `sosActive()` (krajina člena, bez telefónu) zdieľa `shared()`; po zmene
// (NAŠIEL SA, nové vyhlásenie) volaj `sosInvalidate()`.
// 🔴 Všetko je za `SOS_ON` — v ostrom builde `useSosActive` nevolá NIČ (žiadne `sos_*` v sieti).
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SOS_ON } from '@/lib/env';
import { sosActive, lostShare, lostUrl, type SosActiveRow } from '@/lib/sos';
import { intlLocale } from '@/i18n/bcp47';
import { toast } from '@/hooks/use-toast';
import { withTransform } from '@/services/cloudinaryService';

const TTL = 30_000;
const EVT = 'dogypt:sos-changed';

let cache: { at: number; p: Promise<SosActiveRow[]> } | null = null;

/** Aktívne straty v krajine člena. Odhlásený / ostrý build ⇒ prázdno bez volania. */
export function loadSosActive(): Promise<SosActiveRow[]> {
  if (!SOS_ON) return Promise.resolve([]);
  if (cache && Date.now() - cache.at < TTL) return cache.p;
  const p = (async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { cache = null; return [] as SosActiveRow[]; } // relácia ešte nedoletela: prázdno sa NECACHUJE
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
    if (!SOS_ON) return;
    let alive = true;
    const load = () => { void loadSosActive().then((r) => { if (alive) setRows(r); }); };
    load();
    const onVis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener(EVT, load);
    // prvé načítanie môže predbehnúť obnovu relácie po otvorení stránky — keď príde, načítaj znova (TTL chráni pred zbytočným volaním)
    const { data: sub } = supabase.auth.onAuthStateChange((ev) => { if (ev === 'INITIAL_SESSION' || ev === 'SIGNED_IN') load(); });
    return () => { alive = false; sub.subscription.unsubscribe(); document.removeEventListener('visibilitychange', onVis); window.removeEventListener(EVT, load); };
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

/** Obrázok letáku ako súbor pre natívne zdieľanie (CORS-otvorený Cloudinary). */
async function flyerFile(url: string, name: string): Promise<File | null> {
  try {
    const r = await fetch(url, { mode: 'cors' });
    if (!r.ok) return null;
    const b = await r.blob();
    return new File([b], `dogypt-sos-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'pes'}.${b.type === 'image/jpeg' ? 'jpg' : 'png'}`, { type: b.type || 'image/png' });
  } catch { return null; }
}

/**
 * JEDINÉ zdieľanie pátrania (FEED aj stránka psa aj verejná `/lost`): leták ako obrázok + odkaz, ak je
 * (`flyerUrl`) a prehliadač vie súbory; inak systémové zdieľanie odkazu; inak schránka (+ toast `copiedText`).
 * Počíta sa len skutočné zdieľanie (`lost_share`); zrušenie dialógu nie.
 */
export async function shareLostDog(a: {
  slug: string; name: string; text: string; copiedText: string; flyerUrl?: string | null;
}): Promise<'shared' | 'copied' | 'failed' | 'cancel'> {
  const url = lostUrl(a.slug);
  const nav = navigator as Navigator & { canShare?: (d?: ShareData) => boolean };
  const counted = () => { void lostShare(a.slug).catch(() => {}); };
  try {
    if (a.flyerUrl && typeof nav.canShare === 'function' && typeof navigator.share === 'function') {
      const file = await flyerFile(withTransform(a.flyerUrl, 'c_limit,w_1600,f_jpg,q_auto'), a.name);
      if (file && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: `${a.text} ${url}`, url });
        counted();
        return 'shared';
      }
    }
    if (typeof navigator.share === 'function') {
      await navigator.share({ title: a.text, text: a.text, url });
      counted();
      return 'shared';
    }
  } catch (e) { if (e instanceof DOMException && e.name === 'AbortError') return 'cancel'; /* iná chyba: schránka */ }
  try {
    await navigator.clipboard.writeText(url);
    toast({ title: a.copiedText });
    counted();
    return 'copied';
  } catch { toast({ title: url }); return 'failed'; }
}
