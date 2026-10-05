// ============================================================================
// ĽUDIA ZO SVORKY — kto so mnou zdieľa psa, a OZNAČENIE na prejdenom výlete (P2 / F3b)
//
// Server: `vystupy/supabase/migrations/20261012_pawtner_oznacenie.sql`
//   `my_pack_humans()`  — ľudia, s ktorými mám spoločného psa (oboma smermi)
//   `tag_walked(slug, ids)` — za každého jeden riadok `trip_walked` so `source='tagged'`
// Matej 12. 9.: *„označí psa aj pawmate, tak sa mu pripíšu tie isté km“*.
//
// V pickri posádky je človek pod kľúčom `human-<uuid>` (pes `dog-<id>`, napísané meno
// `member-<meno>`). Len `human-` je skutočný účet — iba ten sa dá označiť.
// ============================================================================
import { supabase } from '@/integrations/supabase/client';
import { flushQueue } from '@/lib/packStore';
import { PAWMATE_LIVE } from '@/lib/packFlags';

export interface PackHuman { userId: string; name: string | null; avatarUrl: string | null; dogNames: string[] }

export const HUMAN_KEY_PREFIX = 'human-';

export async function fetchPackHumans(): Promise<PackHuman[]> {
  if (!PAWMATE_LIVE) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RPC nie je v generovaných typoch
  const { data, error } = await (supabase as any).rpc('my_pack_humans');
  if (error || !Array.isArray(data)) return [];
  return data.map((r: { user_id: string; name: string | null; avatar_url: string | null; dog_names: string[] | null }) => ({
    userId: r.user_id, name: r.name, avatarUrl: r.avatar_url, dogNames: r.dog_names ?? [],
  }));
}

export const crewHumanIds = (crew?: { key: string }[]): string[] =>
  (crew ?? []).filter((c) => c.key.startsWith(HUMAN_KEY_PREFIX)).map((c) => c.key.slice(HUMAN_KEY_PREFIX.length));

/**
 * Označí ľudí na výlete, ktorý som práve zapísal.
 * ⚠️ Môj vlastný riadok `trip_walked` ide cez frontu `packStore` (asynchrónne), a server
 * označenie bez neho odmietne (`not_walked`). Preto najprv fronta, potom RPC — a pri
 * `not_walked` ešte dva pokusy, kým fronta dobehne.
 */
export async function tagWalked(slug: string, userIds: string[]): Promise<boolean> {
  if (!PAWMATE_LIVE || userIds.length === 0) return true;
  for (let attempt = 0; attempt < 3; attempt++) {
    await flushQueue();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RPC nie je v generovaných typoch
    const { error } = await (supabase as any).rpc('tag_walked', { p_trip_slug: slug, p_users: userIds });
    if (!error) return true;
    if (!/not_walked/.test(error.message ?? '')) {
      console.warn('[tagWalked]', error.message);
      return false;
    }
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  return false;
}
