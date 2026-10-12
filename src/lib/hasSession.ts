// Je návštevník prihlásený? (12. 10. 2026)
//
// Od FLIPu (`DEV_FULL = true`) `/pack/map` pustí aj návštevníka bez prihlásenia. Členské RPC
// (`trip_crowd`, `my_dog_rights`, `list_map_notes`, `list_event_editions`, `my_event_points`…)
// mu DB správne odmietne — no každé odmietnutie je riadok `permission denied` v postgres logoch
// a stráž `scripts/ops/db-chyby.mjs` ho hlási na Telegram ako chybu. Za 11. 10. ich boli stovky
// a medzi nimi by sa stratila skutočná chyba (napr. `update_own_trip` z 11. 10.).
// Preto sa bez session členské RPC NEVOLAJÚ — výsledok je ten istý (prázdno), len bez šumu.
//
// `getSession()` číta uloženú session (sieť len pri obnove tokenu) — lacné aj pri každom volaní.
import { supabase } from '@/integrations/supabase/client';

export async function hasSession(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch {
    return false;
  }
}
