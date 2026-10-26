// SLEDOVANIE ČLENOV — „presne ako IG" (Matej 26. 10. 2026).
// Server: `20261105_sledovanie.sql` (follow_member · get_follow_info · get_follow_list).
// Adresa človeka = číslo psa, cudzí `user_id` klient nemá. `null` = ja.
// Mená a fotky v zozname berie `fetchMemberProfiles` — tá istá cesta ako partia výletu.
// Zoznam = POPUP + RIADOK (`PACK_BOX.row`) + MEDAILÓN, nič nové v katalógu.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PackPopup } from '@/components/pack/PackPopup';
import { PACK_THEME, PACK_SPACE, PACK_TEXT, PACK_BOX, MEDALLION_CSS, FONT_UI, FONT_TITLE } from '@/components/pack/packTheme';
import { fetchMemberProfiles, memberAvatarUrl, memberDisplayName, type MemberProfile } from '@/components/pack/profile/memberProfile';

const db = supabase as any;
const T = PACK_THEME;
const S = PACK_SPACE;

export type FollowKind = 'followers' | 'following';
export interface FollowInfo { followers: number; following: number; iFollow: boolean; isMe: boolean }

export async function fetchFollowInfo(packNumber: number | null): Promise<FollowInfo | null> {
  const { data, error } = await db.rpc('get_follow_info', { p_pack_number: packNumber });
  if (error || !data) return null;
  return { followers: data.followers ?? 0, following: data.following ?? 0, iFollow: !!data.i_follow, isMe: !!data.is_me };
}

/** Vráti výsledný stav (true = sledujem) alebo null, keď sa to nedá (zablokovaný, neplatiaci, sám seba). */
export async function setFollow(packNumber: number, on: boolean): Promise<boolean | null> {
  const { data, error } = await db.rpc('follow_member', { p_pack_number: packNumber, p_on: on });
  if (error) return null;
  return data as boolean | null;
}

export async function fetchFollowList(packNumber: number | null, kind: FollowKind): Promise<number[]> {
  const { data, error } = await db.rpc('get_follow_list', { p_pack_number: packNumber, p_kind: kind });
  if (error) return [];
  return ((data ?? []) as Array<{ pack_number: number }>).map((r) => r.pack_number);
}

/** Počty + môj stav. `toggle` prepne hneď a pri neúspechu vráti späť. */
export function useFollow(packNumber: number | null, enabled = true) {
  const [info, setInfo] = useState<FollowInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const reload = useCallback(() => {
    if (!enabled) return;
    fetchFollowInfo(packNumber).then(setInfo);
  }, [packNumber, enabled]);
  useEffect(() => { reload(); }, [reload]);
  const toggle = async () => {
    if (busy || packNumber == null || !info) return;
    const want = !info.iFollow;
    setBusy(true);
    setInfo({ ...info, iFollow: want, followers: Math.max(0, info.followers + (want ? 1 : -1)) });
    const got = await setFollow(packNumber, want);
    if (got !== want) setInfo(info);
    setBusy(false);
  };
  return { info, busy, toggle, reload };
}

const LIST_CSS = `
.fl-list{display:flex;flex-direction:column;gap:${S.sm}px;margin:0;padding:0;list-style:none;}
.fl-row{display:flex;align-items:center;gap:${S.md}px;width:100%;padding:${S.sm}px ${S.md}px;cursor:pointer;text-align:left;color:${T.inkStrong};}
.fl-ini{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;color:${T.inkWarm};} /* písmo: meno */
.fl-name{flex:1;min-width:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;} /* písmo: meno */
.fl-num{flex:none;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.fl-empty{font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkFaint};text-align:center;margin:${S.lg}px 0;font-style:italic;}
`;

/** Zoznam ľudí po ťuknutí na číslo. Ťuk na človeka = jeho profil. */
export function FollowListPopup({ packNumber, kind, title, empty, onClose }: {
  packNumber: number | null; kind: FollowKind; title: string; empty: string; onClose: () => void;
}) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Array<{ n: number; m: MemberProfile | null }> | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const nums = await fetchFollowList(packNumber, kind);
      const prof = await fetchMemberProfiles(nums);
      if (alive) setRows(nums.map((n) => ({ n, m: prof.get(n) ?? null })));
    })();
    return () => { alive = false; };
  }, [packNumber, kind]);

  return (
    <PackPopup title={title} onClose={onClose}>
      <style>{MEDALLION_CSS}</style>
      <style>{LIST_CSS}</style>
      {rows && rows.length === 0 && <p className="fl-empty">{empty}</p>}
      {rows && rows.length > 0 && (
        <ul className="fl-list">
          {rows.map(({ n, m }) => {
            const name = memberDisplayName(m, `#${n}`);
            const av = memberAvatarUrl(m);
            const num = m?.memberNumber ?? n;
            return (
              <li key={n}>
                <button type="button" className="fl-row" style={{ ...PACK_BOX.row }} onClick={() => { onClose(); navigate(`/pack/u/${num}`); }}>
                  <span className="pk-medallion pk-medallion--md">
                    {av ? <img src={av} alt="" /> : <span className="fl-ini">{(name[0] || 'D').toUpperCase()}</span>}
                  </span>
                  <span className="fl-name">{name}</span>
                  <span className="fl-num">#{num}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </PackPopup>
  );
}
