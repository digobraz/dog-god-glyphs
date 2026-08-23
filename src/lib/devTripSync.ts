// ============================================================================
// DEV-ONLY: lokálne nakreslené výlety putujú na disk vývojára.
//
// Matej 2026-08-23: „ulož ten výlet nech je ready na launch! je to realny výlet."
//
// Výlety nakreslené v sprievodcovi žijú v `localStorage` toho zariadenia, na ktorom vznikli.
// Bez prihlásenia ich fronta do Supabase neodošle a do datasetu sa inak nedostanú inak než
// ručným prepísaním z obrazovky telefónu. Tento modul ich pri načítaní mapy pošle na dev
// endpoint `/__save-trip` (vite.config.ts), ktorý ich odloží do `plany/prijate-vylety/`.
//
// Prečo automaticky a nie tlačidlom: výlet vzniká na telefóne uprostred testu a klikať na
// „exportuj" je práca navyše pre človeka, ktorý skúša produkt, nie nástroj.
//
// Idempotentné — súbor sa prepíše rovnakým obsahom. Odoslané id si pamätá, aby sa pri každom
// prekreslení mapy neposielalo to isté znova.
//
// ⚠️ `import.meta.env.DEV` ⇒ v produkčnom builde sa celý modul odstráni.
// ============================================================================
const SENT_KEY = 'trp-dev-synced-trips';

function sent(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SENT_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch { return new Set(); }
}

function markSent(ids: Set<string>) {
  try { sessionStorage.setItem(SENT_KEY, JSON.stringify([...ids])); } catch { /* non-fatal */ }
}

export function devSyncLocalTrips(trails: Array<{ id: string }>): void {
  if (!import.meta.env.DEV) return;
  const done = sent();
  const todo = trails.filter((t) => t.id.startsWith('local-') && !done.has(t.id));
  if (!todo.length) return;
  void (async () => {
    for (const trip of todo) {
      try {
        const r = await fetch('/__save-trip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trip),
        });
        if (r.ok) done.add(trip.id);
      } catch {
        // dev server nebeží alebo je iný pôvod — ticho, je to pomocník, nie funkcia produktu
      }
    }
    markSent(done);
  })();
}
