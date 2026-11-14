// PREKLAD TEXTOV OD ČLENOV (Matej 11. 11. 2026): *„keď som si dal appku do english, komentáre sú
// v slovenčine… teda v pôvodnom jazyku“*. Recenzie, rady, komentáre, príspevky a značky na mape sa
// ukážu v jazyku appky, pod textom „Zobraziť originál“ — ten istý vzor ako odkazy na stene (`dogMessages.ts`).
//
// Appka posiela edge `translate-ugc` len DRUH a ID textu (text si funkcia prečíta z DB sama).
// Žiadosti z jednej obrazovky sa zlejú do jedného volania (30 ms okno), výsledok drží pamäť do
// zatvorenia appky. Kým preklad nedorazí, alebo keď chýba, ukáže sa originál.
//
// 🚩 Len appka (`APP_NEW`) — web na dogypt.com ho nemá, kým Matej nepovie.
import { useEffect, useState } from 'react';
import { useLang } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { APP_NEW } from '@/lib/packFlags';

export const UGC_TR_ON = APP_NEW;

export type UgcKind = 'review' | 'question' | 'quote' | 'post' | 'post_comment' | 'event_comment' | 'note';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ITEMS = 30;

// jazyk → "kind:id" → preklad | null (text je v tom jazyku / preklad nevyšiel)
const cache = new Map<string, Map<string, string | null>>();
const queued = new Map<string, Set<string>>();
const listeners = new Set<() => void>();
let timer: number | null = null;

// ── TRVALÁ PAMÄŤ (audit 14. 11. 2026) ────────────────────────────────────────────────────────
// Pamäť do zatvorenia appky znamenala volanie `translate-ugc` pri každom spustení. Preklady sa
// preto držia aj v localStorage (kľúč → [odtlačok originálu, preklad|null]); upravený originál
// má iný odtlačok ⇒ ide znova na server. Zlyhaný dotaz sa NEUKLADÁ (null len po úspešnej odpovedi).
const LS_KEY = 'ugc-tr-v1';
const LS_MAX = 400;
type Stored = Record<string, Record<string, [string, string | null]>>;
let stored: Stored | null = null;
const loadStored = (): Stored => {
  if (stored) return stored;
  try { stored = JSON.parse(localStorage.getItem(LS_KEY) || '{}') as Stored; } catch { stored = {}; }
  if (!stored || typeof stored !== 'object') stored = {};
  return stored;
};
let saveTimer: number | null = null;
const saveStored = () => {
  if (saveTimer != null) return;
  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    try { localStorage.setItem(LS_KEY, JSON.stringify(loadStored())); } catch { /* kvóta / private mode — pamäť je len pohodlie */ }
  }, 500);
};
const fp = (s: string) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return `${s.length}.${h.toString(36)}`; };
const origOf = new Map<string, string>(); // "lang|key" → odtlačok originálu (len pre ukladanie)

function langCache(lang: string) {
  let m = cache.get(lang);
  if (!m) { m = new Map(); cache.set(lang, m); }
  return m;
}

async function flush() {
  timer = null;
  const jobs = [...queued].map(([lang, keys]) => [lang, [...keys]] as const);
  queued.clear();
  for (const [lang, keys] of jobs) {
    for (let i = 0; i < keys.length; i += MAX_ITEMS) {
      const part = keys.slice(i, i + MAX_ITEMS);
      const items = part.map((key) => { const [k, id] = key.split(':'); return { k, id }; });
      let tr: Record<string, string> = {};
      let ok = false;
      try {
        const { data } = await supabase.functions.invoke('translate-ugc', { body: { lang, items } });
        if (data && typeof data.tr === 'object') { tr = data.tr; ok = true; }
      } catch { /* bez prekladu = originál */ }
      const m = langCache(lang);
      const st = loadStored();
      const sl = (st[lang] ||= {});
      for (const key of part) {
        m.set(key, tr[key] ?? null);
        const h = origOf.get(`${lang}|${key}`);
        if (ok && h) sl[key] = [h, tr[key] ?? null];
      }
      const ks = Object.keys(sl);
      if (ks.length > LS_MAX) for (const k of ks.slice(0, ks.length - LS_MAX)) delete sl[k];
      saveStored();
    }
  }
  listeners.forEach((f) => f());
}

function request(lang: string, key: string, original: string) {
  const m = langCache(lang);
  if (m.has(key)) return;
  const h = fp(original);
  const hit = loadStored()[lang]?.[key];
  if (hit && hit[0] === h) { m.set(key, hit[1]); return; } // z trvalej pamäte — bez volania servera
  origOf.set(`${lang}|${key}`, h);
  m.set(key, null); // rezervované — ďalší výskyt toho istého textu sa už nepýta
  let q = queued.get(lang);
  if (!q) { q = new Set(); queued.set(lang, q); }
  q.add(key);
  if (timer == null) timer = window.setTimeout(() => { void flush(); }, 30);
}

/** Text od člena v jazyku appky. `skip` = vlastný text (ten sa neprekladá, ako na IG). */
export function useUgcTr(kind: UgcKind, id: string | null | undefined, original: string | null | undefined, skip = false): { text: string; translated: boolean } {
  const { lang } = useLang();
  const [, bump] = useState(0);
  const key = id && UUID.test(id) ? `${kind}:${id}` : null;
  const on = UGC_TR_ON && !skip && !!key && !!original?.trim();
  useEffect(() => {
    if (!on || !key) return;
    const f = () => bump((x) => x + 1);
    listeners.add(f);
    request(lang, key, original ?? '');
    if (cache.get(lang)?.get(key)) f(); // preklad z trvalej pamäte je k dispozícii hneď
    return () => { listeners.delete(f); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `original` len pre odtlačok; zmena textu = nový kľúč pamäte
  }, [on, key, lang]);
  const t = on && key ? cache.get(lang)?.get(key) : null;
  return t ? { text: t, translated: true } : { text: original ?? '', translated: false };
}
