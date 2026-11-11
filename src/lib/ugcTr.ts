// PREKLAD TEXTOV OD ČLENOV (Matej 11. 11. 2026): *„keď som si dal appku do english, komentáre sú
// v slovenčine… teda v pôvodnom jazyku“*. Recenzie, rady, komentáre, príspevky a značky na mape sa
// ukážu v jazyku appky, pod textom „Zobraziť originál“ — ten istý vzor ako odkazy na stene (`dogMessages.ts`).
//
// Appka posiela edge `translate-ugc` len DRUH a ID textu (text si funkcia prečíta z DB sama).
// Žiadosti z jednej obrazovky sa zlejú do jedného volania (30 ms okno), výsledok drží pamäť do
// zatvorenia appky. Kým preklad nedorazí, alebo keď chýba, ukáže sa originál.
//
// 🚩 Zatiaľ len testovacia appka (`TEST_BUILD`) — na dogypt.com a v obchodnej appke až na Matejovo slovo.
import { useEffect, useState } from 'react';
import { useLang } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { TEST_BUILD } from '@/lib/env';

export const UGC_TR_ON = TEST_BUILD;

export type UgcKind = 'review' | 'question' | 'quote' | 'post' | 'post_comment' | 'event_comment' | 'note';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ITEMS = 30;

// jazyk → "kind:id" → preklad | null (text je v tom jazyku / preklad nevyšiel)
const cache = new Map<string, Map<string, string | null>>();
const queued = new Map<string, Set<string>>();
const listeners = new Set<() => void>();
let timer: number | null = null;

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
      try {
        const { data } = await supabase.functions.invoke('translate-ugc', { body: { lang, items } });
        if (data && typeof data.tr === 'object') tr = data.tr;
      } catch { /* bez prekladu = originál */ }
      const m = langCache(lang);
      for (const key of part) m.set(key, tr[key] ?? null);
    }
  }
  listeners.forEach((f) => f());
}

function request(lang: string, key: string) {
  const m = langCache(lang);
  if (m.has(key)) return;
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
    request(lang, key);
    return () => { listeners.delete(f); };
  }, [on, key, lang]);
  const t = on && key ? cache.get(lang)?.get(key) : null;
  return t ? { text: t, translated: true } : { text: original ?? '', translated: false };
}
