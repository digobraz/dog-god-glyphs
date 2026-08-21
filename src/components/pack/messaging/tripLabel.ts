// Preklad slugu výletu na jeho názov — pre štítok nad konverzáciou.
//
// PREČO EXISTUJE: `start_dm()` ukladá do `pack_conversations.tag_label`
// `coalesce(tag_label, p_trip_slug)`, teda SLUG. Na obrazovke tak svietilo
// `havrania-skala-slovensky-raj` namiesto „Havrania skala". Uložiť rovno názov
// by bola horšia oprava: názov sa dá v trip-audite prepísať a je jazykovo
// premenlivý, kým slug je stabilný kľúč. Preklad preto patrí na klienta.
//
// ⚠️ DATASET SA IMPORTUJE LAZY. `heroTrails.generated.ts` má rádovo megabajt
// (trasy, výškové profily, fotky) a messaging je globálny chrome — statický
// import by ho vtiahol do každej stránky `/pack`, aj keď žiadna konverzácia
// nad výletom neexistuje. Rovnaký dôvod, prečo `tripPathById()` berie zoznam
// trás parametrom namiesto toho, aby si ho importoval sám.

// ⚠️ SLUG V DB MÔŽE BYŤ STARÝ. `pack_conversations.tag_label`/`tag_id` sa zapísali
// pri založení vlákna a premenovanie slugu (3. 8.: `<pohorie>-<lokalita>` →
// `<lokalita>-<pohorie>`) sa do Supabase nepremietlo — `RENAMED_TRIP_IDS` je len
// klientská mapa. Bez `currentTripId()` by sa taký výlet v datasete nenašiel a
// štítok by ostal na slugu; overené na živom vlákne
// `male-karpaty-zaruby-1-kostol-certov-zlab-zaruby`.
import { currentTripId } from '@/components/pack/tripShared';

let cache: Map<string, string> | null = null;
let loading: Promise<Map<string, string>> | null = null;

/** slug → názov výletu. Prvé volanie stiahne dataset, ďalšie sú zadarmo. */
export function tripNames(): Promise<Map<string, string>> {
  if (cache) return Promise.resolve(cache);
  if (loading) return loading;
  loading = import('@/data/heroTrails.generated')
    .then((m) => {
      cache = new Map(m.HERO_TRAILS.map((t) => [t.id, t.name]));
      return cache;
    })
    .catch(() => {
      // Dataset sa nestiahol (offline, chyba chunku) — štítok ostane na slugu.
      // Prázdna mapa sa NEcachuje, aby to ďalšie otvorenie skúsilo znova.
      loading = null;
      return new Map<string, string>();
    });
  return loading;
}

/**
 * Názov výletu, ak ho poznáme. `fallback` je to, čo príde z DB (slug alebo
 * label) — vždy sa vráti niečo, štítok nikdy nezostane prázdny.
 */
export function tripNameSync(slug: string | undefined, fallback: string): string {
  if (!slug || !cache) return fallback;
  return cache.get(currentTripId(slug)) ?? fallback;
}
