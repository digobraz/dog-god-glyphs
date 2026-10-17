// PREKLAD ODKAZOV NA STENE (Matej 18. 10. 2026): *„ak je jazyk v svk boli odkazy všetky
// v svk — ak v eng tak sa preložia do eng a podobne“*.
//
// `get-dog-messages?lang=xx` vráti `{ "<poradové číslo>": "preklad" }` len pre odkazy
// napísané v inom jazyku. Stiahne sa RAZ na jazyk (malý súbor, nie v hlavnom feede —
// stena by s 18 jazykmi naraz zťažkla) a pri prepnutí jazyka sa dotiahne ďalší.
// Kým nedorazí, alebo keď preklad chýba, ukáže sa originál.
import { useEffect, useState } from 'react';
import { useLang } from '@/i18n/LanguageContext';
import { LIVE_EDGE_BASE } from '@/lib/env';

const cache = new Map<string, Record<string, string>>();
const loading = new Map<string, Promise<Record<string, string>>>();

function load(lang: string): Promise<Record<string, string>> {
  const hit = cache.get(lang);
  if (hit) return Promise.resolve(hit);
  let p = loading.get(lang);
  if (!p) {
    p = fetch(`${LIVE_EDGE_BASE}/get-dog-messages?lang=${encodeURIComponent(lang)}`)
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then((m: Record<string, string>) => { cache.set(lang, m ?? {}); return m ?? {}; });
    loading.set(lang, p);
  }
  return p;
}

/** Odkaz psa v jazyku stránky. `original` = text z feedu; bez prekladu sa vráti on. */
export function useDogMessage(n: number | null | undefined, original: string): { text: string; translated: boolean } {
  const { lang } = useLang();
  const [, bump] = useState(0);
  useEffect(() => {
    if (cache.has(lang)) return;
    let alive = true;
    load(lang).then(() => { if (alive) bump((x) => x + 1); });
    return () => { alive = false; };
  }, [lang]);
  const t = n != null && original ? cache.get(lang)?.[String(n)] : undefined;
  return t ? { text: t, translated: true } : { text: original, translated: false };
}
