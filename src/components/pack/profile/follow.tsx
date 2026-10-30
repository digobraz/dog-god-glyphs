// SLEDOVANIE ČLENOV — „presne ako IG" (Matej 26. 10. 2026).
// Server: `20261105_sledovanie.sql` (follow_member · get_follow_info · get_follow_list).
// Adresa človeka = číslo psa, cudzí `user_id` klient nemá. `null` = ja.
// Mená a fotky v zozname berie `fetchMemberProfiles` — tá istá cesta ako partia výletu.
// Zoznam = POPUP + RIADOK (`PACK_BOX.row`) + MEDAILÓN, nič nové v katalógu.
import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PackPopup } from '@/components/pack/PackPopup';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_BOX, MEDALLION_CSS, FONT_UI, FONT_TITLE } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
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
  const t = useT();
  const { toast } = useToast();
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
    if (got !== want) {
      setInfo(info);
      // Vrátenie bez slova pôsobilo ako „tlačidlo nefunguje" (audit 30. 10. 2026).
      toast({ title: t('pack.follow.err') === 'pack.follow.err' ? 'Could not follow right now. Try again.' : t('pack.follow.err'), variant: 'destructive' });
    }
    setBusy(false);
  };
  return { info, busy, toggle, reload };
}

// ── ČIPKA „SLEDOVAŤ" VO FEEDE (Matej 28. 10. 2026) ───────────────────────────────
// Kariet je veľa a jeden autor ich môže mať viac ⇒ stav drží ZDIEĽANÝ obchod podľa čísla autora:
// jedno volanie `get_follow_info` na autora (nie na kartu) a ťuk na jednej karte prepne všetky.
const chipCache = new Map<number, FollowInfo | null>();
const chipLoading = new Set<number>();
const chipListeners = new Set<() => void>();
const chipEmit = () => chipListeners.forEach((fn) => fn());

function useChipInfo(n: number | null) {
  const [, tick] = useState(0);
  useEffect(() => {
    const fn = () => tick((v) => v + 1);
    chipListeners.add(fn);
    return () => { chipListeners.delete(fn); };
  }, []);
  useEffect(() => {
    if (n == null || chipCache.has(n) || chipLoading.has(n)) return;
    chipLoading.add(n);
    fetchFollowInfo(n).then((info) => { chipCache.set(n, info); chipLoading.delete(n); chipEmit(); });
  }, [n]);
  return n == null ? null : chipCache.get(n) ?? null;
}

export const FOLLOW_CHIP_CSS = `
.fchip{flex:none;cursor:pointer;border-radius:${PACK_R.field}px;padding:${S.xs}px ${S.sm}px;font:600 ${PACK_TEXT.label}px/1.2 ${FONT_UI};white-space:nowrap;
  background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.deep};box-shadow:${LAPIS_BTN_SHADOW};}
.fchip.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}box-shadow:none;font-weight:500;}
.fchip:disabled{opacity:.6;cursor:default;}
`;

/** Skrytie (vlastné, bez čísla, katalóg) rieši volajúci: `n == null` ⇒ nič. Sledovaný = tichší tint. */
export function FollowChip({ n }: { n: number | null }) {
  const t = useT();
  const { toast } = useToast();
  const info = useChipInfo(n);
  const [busy, setBusy] = useState(false);
  if (n == null || !info || info.isMe) return null;
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    const want = !info.iFollow;
    setBusy(true);
    chipCache.set(n, { ...info, iFollow: want, followers: Math.max(0, info.followers + (want ? 1 : -1)) });
    chipEmit();
    const got = await setFollow(n, want);
    if (got !== want) {
      chipCache.set(n, info); chipEmit();
      toast({ title: tx('pack.follow.err', 'Could not follow right now. Try again.'), variant: 'destructive' });
    }
    setBusy(false);
  };
  return (
    <button type="button" className={`fchip${info.iFollow ? ' on' : ''}`} onClick={toggle} disabled={busy} aria-pressed={info.iFollow}>
      {info.iFollow ? `✓ ${tx('pack.publicProfile.followingBtn', 'Following')}` : tx('pack.publicProfile.follow', 'Follow')}
    </button>
  );
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
