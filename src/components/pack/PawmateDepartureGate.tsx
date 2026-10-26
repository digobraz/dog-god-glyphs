// K4c · ODCHOD PAWMATA (26. 10. 2026) — nákres `plany/nakresy/pawmate-k4-autor-2026-10-27/index.html` §3.
// Matej: *„3 dni na to, aby označila fotky"* · *„ona len označí ale zmazať ich nemôže"* ·
// *„nech sa nič nemaže a nemizne, je to všetko pawtnerove dielo"*.
// Vyradený pawmate, ktorému DOGYPT stál len na tomto psovi, vidí počas 3 dní JEDINE toto:
// svoje príspevky, označenie a POŽIADAŤ O ZMAZANIE. Rozhoduje pawtner (Moja svorka).
// Hovorí AINUBIS — oznamy appky sú jeho (CLAUDE.md §Brand, `ainubisSkin.ts`).
// Kto má vlastného psa alebo iný prístup, bránu nevidí: účet mu ostáva, stratil len tohto psa.
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/i18n/LanguageContext';
import { sizedUrl } from '@/services/cloudinaryService';
import { useMyDogRights } from '@/lib/dogRights';
import { forgetPushToken } from '@/lib/appPush';
import { HandCheck } from '@/components/pack/HandIcons';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { FONT_TITLE, FONT_UI, PACK_R, PACK_SPACE, PACK_TEXT } from '@/components/pack/packTheme';
import { fetchMyDeparture, fetchMyActedPosts, requestPostDeletion, type Departure, type ActedPost } from '@/lib/pawmateDeparture';

const DAY = 24 * 60 * 60 * 1000;

const CSS = `
.pd-root{position:fixed;inset:0;z-index:1200;overflow-y:auto;background:${AINUBIS.surface};color:${AINUBIS.ink};font-family:${FONT_UI};}
.pd-col{max-width:640px;margin:0 auto;padding:${PACK_SPACE.xl}px ${PACK_SPACE.lg}px ${PACK_SPACE.xxl}px;display:flex;flex-direction:column;gap:${PACK_SPACE.lg}px;}
.pd-msg{border:1px solid ${AINUBIS.edgeStrong};border-radius:${PACK_R.card}px;padding:${PACK_SPACE.lg}px;background:${AINUBIS.raised};display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.pd-name{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:.14em;color:${AINUBIS.ink};} /* písmo: meno */
.pd-name span{color:${AINUBIS.aiInk};}
.pd-msg p{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.5;color:${AINUBIS.inkDim};}
.pd-days{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;letter-spacing:.14em;color:${AINUBIS.ctaA};text-transform:uppercase;} /* písmo: nadpis */
.pd-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${PACK_SPACE.sm}px;}
.pd-th{position:relative;aspect-ratio:1;border-radius:${PACK_R.tile}px;overflow:hidden;border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};padding:0;cursor:pointer;}
.pd-th img{width:100%;height:100%;object-fit:cover;display:block;}
.pd-th p{margin:0;padding:${PACK_SPACE.sm}px;font-size:${PACK_TEXT.label}px;color:${AINUBIS.inkDim};text-align:left;overflow:hidden;height:100%;}
.pd-th i{position:absolute;top:${PACK_SPACE.sm}px;right:${PACK_SPACE.sm}px;width:20px;height:20px;border-radius:${PACK_R.field}px;border:1.5px solid ${AINUBIS.ink};background:rgba(0,0,0,.35);font-style:normal;display:grid;place-items:center;color:${AINUBIS.ink};}
.pd-th.on{border-color:${AINUBIS.danger};box-shadow:0 0 0 2px ${AINUBIS.danger} inset;}
.pd-th.on i{background:${AINUBIS.danger};border-color:${AINUBIS.danger};}
.pd-th.sent{cursor:default;opacity:.55;}
.pd-th.sent b{position:absolute;left:0;right:0;bottom:0;padding:${PACK_SPACE.xs}px;font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;background:rgba(0,0,0,.6);color:${AINUBIS.ink};}
.pd-cta{width:100%;border:none;border-radius:${PACK_R.field}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};box-shadow:${AINUBIS.ctaShadow};
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;} /* písmo: cta */
.pd-cta:disabled{opacity:.45;cursor:default;}
.pd-out{align-self:center;background:none;border:1px solid ${AINUBIS.edge};border-radius:${PACK_R.field}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;
  font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;letter-spacing:.26em;text-transform:uppercase;color:${AINUBIS.inkDim};cursor:pointer;}
.pd-note{margin:0;font-size:${PACK_TEXT.label}px;color:${AINUBIS.inkFaint};text-align:center;}
`;

export function PawmateDepartureGate() {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const rights = useMyDogRights();
  const [dep, setDep] = useState<Departure[] | null>(null);
  const [posts, setPosts] = useState<ActedPost[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    void fetchMyDeparture().then((d) => { if (alive) setDep(d); });
    return () => { alive = false; };
  }, []);

  // Brána len keď účet ZANIKNE: žiadny vlastný pes a každý prístup je v odchode.
  const leavingIds = new Set((dep ?? []).map((d) => d.dogId));
  const closing = !!dep && dep.length > 0 && !!rights.rows
    && !rights.rows.some((r) => r.isOwner || !leavingIds.has(r.dogId));

  useEffect(() => {
    if (!closing || posts) return;
    let alive = true;
    void fetchMyActedPosts().then((p) => { if (alive) setPosts(p); });
    return () => { alive = false; };
  }, [closing, posts]);

  if (!closing || !dep) return null;

  const first = dep[0];
  const owner = first.ownerName || 'Pawtner';
  const msLeft = Math.min(...dep.map((d) => Date.parse(d.leavingUntil))) - Date.now();
  const days = Math.max(0, Math.ceil(msLeft / DAY));
  const daysLabel = days <= 0 ? tx('pack.leave.today', 'Today')
    : days === 1 ? tx('pack.leave.day1', '1 day')
      : tx('pack.leave.days', '{n} days').replace('{n}', String(days));
  const fill = (s: string) => s.split('{owner}').join(owner).split('{dog}').join(first.dogName);

  const toggle = (id: string) => setPicked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const send = async () => {
    if (!picked.length || busy) return;
    setBusy(true);
    try {
      const n = await requestPostDeletion(picked);
      setSent(n);
      setPicked([]);
      setPosts(await fetchMyActedPosts());
    } catch { setSent(-1); }
    finally { setBusy(false); }
  };
  const signOut = async () => {
    await forgetPushToken();
    await supabase.auth.signOut();
    window.location.assign('/login');
  };

  return (
    <div className="pd-root" role="dialog" aria-modal="true">
      <style>{CSS}</style>
      <div className="pd-col">
        <div className="pd-msg">
          <span className="pd-name"><span>AI</span>NUBIS</span>
          <p>{fill(tx('pack.leave.removed', '{owner} removed you from {dog}’s pack.'))}</p>
          <span className="pd-days">{daysLabel}</span>
          <p>{fill(tx('pack.leave.mark', 'Mark the photos you want deleted. {owner} decides.'))}</p>
          <p>{tx('pack.leave.after', 'After that your DOGYPT account closes. What you added stays with the dog.')}</p>
        </div>

        {posts == null ? null : posts.length === 0 ? (
          <p className="pd-note">{tx('pack.leave.none', 'There are no posts from you here.')}</p>
        ) : (
          <div className="pd-grid">
            {posts.map((p) => {
              const on = picked.includes(p.id);
              return (
                <button key={p.id} type="button" disabled={p.requested}
                  className={`pd-th${on ? ' on' : ''}${p.requested ? ' sent' : ''}`}
                  onClick={() => !p.requested && toggle(p.id)}>
                  {p.photos[0] ? <img src={sizedUrl(p.photos[0], 240)} alt="" loading="lazy" /> : <p>{p.body}</p>}
                  {!p.requested && <i>{on && <HandCheck size={14} />}</i>}
                  {p.requested && <b>{tx('pack.leave.sent', 'Requested')}</b>}
                </button>
              );
            })}
          </div>
        )}

        {posts && posts.some((p) => !p.requested) && (
          <button type="button" className="pd-cta" disabled={!picked.length || busy} onClick={send}>
            {tx('pack.leave.request', 'Request deletion')}{picked.length ? ` · ${picked.length}` : ''}
          </button>
        )}
        {sent != null && (
          <p className="pd-note">{sent < 0
            ? tx('pack.leave.err', 'Something went wrong. Try again in a moment.')
            : fill(tx('pack.leave.done', 'Sent. {owner} decides.'))}</p>
        )}
        <button type="button" className="pd-out" onClick={signOut}>{tx('pack.settings.signOut', 'Sign out')}</button>
      </div>
    </div>
  );
}
