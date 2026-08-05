// ============================================================================
// PACK feature flags — LIVE (trimmed) vs DEV (full) split.
//
// DEV_FULL=false (default, incl. Lovable production build) → trimmed LIVE pack:
//   only profile + documents + Wall message are interactive; everything else
//   ships as "coming soon". This is what goes out to customers.
//
// DEV_FULL=true → the full backoffice, frozen in its current state. The full
//   code is NEVER deleted — it stays gated behind this flag so post-launch we
//   keep building from where we left off, not from scratch.
//
// Run the full dev version locally:   VITE_PACK_FULL=true npm run web
//
// ── FOUNDER VÝNIMKA NA PRODUKCII (2026-08-05) ───────────────────────────────
// `MapGate.tsx` (4.8.) odomkol founderovi ROUTY mapy, ale nie CHROME okolo nich —
// ten visí na tomto flagu. Dôsledok, na ktorý Matej narazil pri prvom teste na
// dogypt.com: mapa sa načítala, ale správy hlásili „coming soon"
// (`PackNotifications.tsx`) a chýbal avatar (desktopová identita žije v spodnom
// nave `PackLayout`, ktorý je celý za `DEV_FULL`). Testovať flow „ako to uvidí
// reálny člen" sa tak nedalo — polovica obrazovky bola vypnutá.
//
// Preto flag dostal druhú vetvu: prihlásený účet z FULL_PACK_EMAILS vidí plný
// pack aj v produkčnom builde. MapGate tým NEZANIKÁ — pri `DEV_FULL === true`
// vracia rovno `allowed`, takže sa obe brány zhodujú a routy naďalej gatuje on.
//
// ⚠️ Je to VIDITEĽNOSŤ, nie zámok. Kód je v bundli tak či tak (flag gatuje
//    obrazovku, nie chunk) → kto vie čítať JS, odomkne si to aj bez allowlistu.
//    Skutočnú ochranu dát drží RLS v Supabase, nie tento súbor.
//
// ⚠️ Vyhodnocuje sa RAZ pri načítaní modulu, synchronne z localStorage. Async
//    `getSession()` tu nejde: `DEV_FULL` číta 8 konzumentov ako modulovú
//    konštantu (PackLayout, PackNotifications, HeroCard, Pack, PackDogDetail,
//    routy v App.tsx) a prepisovať ich na hook by bola prestavba pol packu.
//    Cena: po ČERSTVOM prihlásení treba tvrdý reload — rieši Login.tsx.
//
// Zrušenie po flipe `DEV_FULL`: zmazať FULL_PACK_EMAILS a vetvu na konci súboru.
// ============================================================================
import { SUPABASE_URL } from '@/lib/env';

/** Účty, ktoré vidia plný `/pack` aj v produkčnom builde. Prázdne pole = výnimka vypnutá. */
export const FULL_PACK_EMAILS = ['hekthorsk@gmail.com'];

export function isFullPackEmail(email?: string | null): boolean {
  if (!email) return false;
  return FULL_PACK_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Prečíta e-mail z uloženej Supabase session SYNCHRONNE (localStorage), bez čakania na
 * `getSession()`. Kľúč aj tvar hodnoty určuje supabase-js: `sb-<projectRef>-auth-token`,
 * obsah je JSON session, od v2.9 môže byť zabalený ako `base64-<payload>`. Ošetrené sú
 * oba tvary a čokoľvek neočakávané padne na `null` — výnimka sa nikdy nesmie zapnúť omylom.
 */
function sessionEmailFromStorage(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const ref = new URL(SUPABASE_URL).hostname.split('.')[0];
    const raw = localStorage.getItem(`sb-${ref}-auth-token`);
    if (!raw) return null;
    const json = raw.startsWith('base64-') ? atob(raw.slice('base64-'.length)) : raw;
    const parsed = JSON.parse(json) as { user?: { email?: string } } | null;
    return parsed?.user?.email ?? null;
  } catch {
    return null; // poškodený/nečitateľný záznam — správame sa ako neprihlásený
  }
}

export const DEV_FULL =
  import.meta.env.VITE_PACK_FULL === 'true' || isFullPackEmail(sessionEmailFromStorage());
