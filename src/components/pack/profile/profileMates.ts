// PAWMATE NA PROFILE (26. 10. 2026) — čítanie pre cudzí profil a kartu pawmata.
// O tom, kto sa ukáže, rozhoduje majiteľ (`human.showMates`); server vydá len pawmata, ktorý
// naozaj stojí pri jeho zaplatenom psovi. Migrácia `20261026_profile_mates.sql`.
// Bez migrácie (stará DB) RPC zlyhá → prázdny zoznam, profil vyzerá ako dovtedy.
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { HumanProfile } from './packProfile';
import { fetchMemberProfiles, memberAvatarUrl, memberDisplayName } from './memberProfile';
import { listMyPawmates } from '@/lib/pawmateRights';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface ProfileMate {
  ownerNumber: number;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  human: HumanProfile;
}

type Row = { owner_number: number; user_id: string; display_name: string | null; avatar_url: string | null; human: HumanProfile | null };
const fromRow = (r: Row): ProfileMate => ({ ownerNumber: r.owner_number, userId: r.user_id, name: r.display_name, avatarUrl: r.avatar_url, human: r.human ?? ({} as HumanProfile) });

export async function fetchProfileMates(args: { packNumber?: number | null; userId?: string | null }): Promise<ProfileMate[]> {
  if (args.packNumber == null && !args.userId) return [];
  const { data, error } = await db.rpc('get_profile_mates', { p_pack_number: args.packNumber ?? null, p_user: args.userId ?? null });
  if (error) return [];
  return ((data ?? []) as Row[]).map(fromRow);
}

/** Pawmati ukázaní na profile člena s týmto číslom. `null` číslo = nič sa nepýta. */
export function useProfileMates(packNumber: number | null | undefined): ProfileMate[] {
  const [list, setList] = useState<ProfileMate[]>([]);
  useEffect(() => {
    let alive = true;
    if (packNumber == null) { setList([]); return; }
    fetchProfileMates({ packNumber }).then((m) => { if (alive) setList(m); });
    return () => { alive = false; };
  }, [packNumber]);
  return list;
}

/** `to` = null pri pawmatovi — PAWMATE nemá samostatný profil (model A, Matej 26. 10. 2026). */
export interface Beside { photo: string | null; initial: string; label: string; to: string | null }

/** KTO STOJÍ VEDĽA MOJEJ FOTKY — profil aj UPRAVIŤ PROFIL z jedného miesta.
 *  Majiteľ: pawmate, ktorého si zapol (`human.showMates`) · pawmate: majiteľ, ktorý ho ukázal. `uid` null = nikto. */
export function useBeside({ uid, isMate, showMates, myNumber }: { uid: string | null; isMate: boolean; showMates?: string[]; myNumber: number | null }): Beside | null {
  const [beside, setBeside] = useState<Beside | null>(null);
  const key = (showMates ?? []).join(',');
  useEffect(() => {
    if (!uid) { setBeside(null); return; }
    let alive = true;
    if (isMate) {
      fetchProfileMates({ userId: uid }).then(async (list) => {
        const n = list[0]?.ownerNumber;
        if (n == null) { if (alive) setBeside(null); return; }
        const owner = (await fetchMemberProfiles([n])).get(n);
        if (!alive) return;
        if (!owner) { setBeside(null); return; }
        const nm = memberDisplayName(owner) || '';
        setBeside({ photo: memberAvatarUrl(owner), initial: (nm[0] || 'D').toUpperCase(), label: nm, to: `/pack/u/${n}` });
      });
    } else if (key && myNumber != null) {
      const want = key.split(',');
      listMyPawmates().then((r) => {
        const m = r.people.find((p) => p.kind === 'human' && p.user_id && want.includes(p.user_id));
        if (alive) setBeside(m ? { photo: m.avatar_url, initial: (m.name?.[0] || 'P').toUpperCase(), label: m.name || 'Pawmate', to: null } : null);
      }).catch(() => { if (alive) setBeside(null); });
    } else setBeside(null);
    return () => { alive = false; };
  }, [uid, isMate, key, myNumber]);
  return beside;
}
