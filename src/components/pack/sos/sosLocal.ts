// SOS — lokálna kópia malých údajov pre prihláseného (zoznam psov, posledný telefón, údaje kartičky), aby sa kartička a formulár straty
// otvorili aj pri PRVOM otvorení bez signálu. Ukladá sa v pokoji po načítaní appky (`warmSosLocal`, volá `sosPrefetch`).
// Všetky kľúče začínajú `dogypt.ecard.`, takže ich zmaže `clearCardDrafts()` pri odhlásení aj zmazaní účtu; navyše sa mažú pri `SIGNED_OUT`.
import { SUPABASE_URL } from '@/lib/env';
import { clearCardDrafts } from '@/components/pack/dogCard/cardDraft';
import type { SosDog } from '@/lib/sos';

const P = 'dogypt.ecard.';
export const dogsKey = (uid: string) => `${P}sos.dogs.${uid}`;
export const phoneKey = (uid: string) => `${P}sos.phone.${uid}`;
export const lastDogKey = (uid: string) => `${P}last.${uid}`;
export const cardCacheKey = (uid: string, dogId: string) => `${P}cache.${uid}.${dogId}`;

/** `user.id` z uloženej relácie, SYNCHRONNE (bez supabase-js, ktorý na pomalej sieti čaká na zámok a obnovu tokenu). */
export function storedUserId(): string | null {
  try {
    const ref = new URL(SUPABASE_URL).hostname.split('.')[0];
    const raw = localStorage.getItem(`sb-${ref}-auth-token`);
    if (!raw) return null;
    const j = JSON.parse(raw.startsWith('base64-') ? atob(raw.slice(7)) : raw) as { user?: { id?: string } } | null;
    return j?.user?.id ?? null;
  } catch { return null; }
}

/** Sľub s časovým stropom: nikdy nevisí donekonečna. */
export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((res, rej) => {
    const t = window.setTimeout(() => rej(new Error('timeout')), ms);
    p.then((v) => { window.clearTimeout(t); res(v); }, (e) => { window.clearTimeout(t); rej(e); });
  });
}

export function localGet<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : null; } catch { return null; }
}
export function localSet(key: string, v: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* plné úložisko: bez kópie */ }
}

let warmed = false;
/** Raz za načítanie stránky, len pre prihláseného: zoznam psov, posledný telefón a údaje kartičky prvých troch živých psov. */
export async function warmSosLocal(): Promise<void> {
  const uid = storedUserId();
  if (warmed || !uid) return;
  warmed = true;
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    supabase.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_OUT') clearCardDrafts(); });
    const { sosMyDogs, sosLastPhone } = await import('@/lib/sos');
    const dogs: SosDog[] = await sosMyDogs();
    localSet(dogsKey(uid), dogs);
    void sosLastPhone().then((p) => { if (p) localSet(phoneKey(uid), p); }).catch(() => {});
    const { fetchCardData } = await import('@/components/pack/dogCard/cardData');
    for (const d of dogs.slice(0, 3)) {
      try { const c = await fetchCardData(d.id); if (c.dog) localSet(cardCacheKey(uid, d.id), c); } catch { /* ďalší pokus pri ďalšom štarte */ }
    }
  } catch { warmed = false; }
}
