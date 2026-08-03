import { supabase } from '@/integrations/supabase/client';

/**
 * Otvorenie DOGMY = First Step „Prelistuj DOGMU" (`/pack` checklist, +10 ☥ za 100 %).
 *
 * Dva zápisy zámerne:
 *  - `localStorage` — okamžitá odozva na tomto zariadení (fajočka naskočí bez round-tripu),
 *  - `user_metadata.constitution_opened` — trvalý per-user flag. Bez neho quest po prepnutí
 *    zariadenia/prehliadača zmizol a členke sa „nezaškrtol" vôbec (sťažnosť 2026-07-30).
 *
 * Server zápis je best-effort: na `/religion` môže byť čitateľ nezalogovaný a to je v poriadku.
 */
export function markConstitutionOpened() {
  try { localStorage.setItem('dogypt_constitution_opened', '1'); } catch { /* ignore */ }
  void supabase.auth.updateUser({ data: { constitution_opened: true } }).catch(() => { /* nezalogovaný / offline */ });
}
