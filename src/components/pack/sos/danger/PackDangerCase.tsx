// `/pack/sos/nebezpecenstvo/p/:id` — DETAIL NEBEZPEČENSTVA (nákres scr 7, kôš 2 · POZERÁM SA: lišta ostáva, hore šípka späť).
// `:id` = id prípadu ALEBO `note_id` značky z mapy (popup „Otvoriť“). Volá len `lib/danger.ts`.
//  · hlavička druhu, kedy, kde (adresa a fotky vidia členovia, `danger_case` ich verejnosti nevydá) · veta o vlastnom riziku
//  · svedkovia = hlas `map_note_votes` (predĺži platnosť) · komentáre · podnet úradu + výsledok · odkazy na podnet a plagát
//  · týranie `pending`: vidí len autor, stav „čaká na schválenie“.
// Ikonky len existujúce (`SysIcon`), emoji na obrazovke nie (emoji smie len mapa).
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PackLayout } from '@/components/pack/PackLayout';
import { SysIcon } from '@/components/pack/SysIcon';
import { PACK_BOX, PACK_THEME as T, PACK_SPACE as S, PACK_TEXT } from '@/components/pack/packTheme';
import { useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { sizedUrl } from '@/services/cloudinaryService';
import {
  dangerCase, dangerComments, dangerCommentAdd, dangerCommentDelete, dangerOutcome, dangerWitness,
  type DangerCase, type DangerComment, type DangerOutcome,
} from '@/lib/danger';
import { authorityByCode } from '@/data/dangerAuthorities';
import { SosCard, SosStyles, useBack, useSosT, type SosT } from '../sosShared';
import type { SosKey } from '../sosTexts';

const K = (k: string) => `pack.sos.danger.case.${k}` as SosKey;
const OUTCOMES: DangerOutcome[] = ['inspected', 'fined', 'removed', 'nothing'];

const CSS = `
.dgc-head{display:flex;align-items:center;gap:${S.md}px;}
.dgc-head h1{flex:1;min-width:0;}
.dgc-meta{display:flex;flex-wrap:wrap;gap:${S.sm}px ${S.lg}px;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.dgc-meta span{display:inline-flex;align-items:center;gap:${S.xs}px;}
.dgc-pending{border-color:${T.sosRed};background:${T.sosRedSoft};}
.dgc-risk{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.45;font-weight:500;color:${T.sosRedDark};}
.dgc-photos{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:${S.sm}px;}
.dgc-photos img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;border:1.5px solid ${T.cardEdge};display:block;}
.dgc-cm{display:flex;flex-direction:column;gap:${S.xs}px;padding:${S.md}px;}
.dgc-cm b{font-weight:600;font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.dgc-cm small{font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.dgc-cm p{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.45;color:${T.inkStrong};white-space:pre-wrap;overflow-wrap:anywhere;}
.dgc-cm button{all:unset;cursor:pointer;align-self:flex-start;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.dgc-add{display:flex;flex-direction:column;gap:${S.sm}px;}
`;

function useAgo() {
  const { lang } = useLang();
  const s = useSosT();
  return useCallback((iso: string) => {
    const diff = (new Date(iso).getTime() - Date.now()) / 1000;
    const a = Math.abs(diff);
    if (a < 60) return s(K('ago.now'));
    const f = new Intl.RelativeTimeFormat(intlLocale(lang), { numeric: 'auto' });
    if (a < 3600) return f.format(Math.round(diff / 60), 'minute');
    if (a < 86400) return f.format(Math.round(diff / 3600), 'hour');
    return f.format(Math.round(diff / 86400), 'day');
  }, [lang, s]);
}

function useDate() {
  const { lang } = useLang();
  return useCallback((iso: string) => new Date(iso).toLocaleDateString(intlLocale(lang), { day: 'numeric', month: 'numeric', year: 'numeric' }), [lang]);
}

function Comments({ c, s }: { c: DangerCase; s: SosT }) {
  const ago = useAgo();
  const [rows, setRows] = useState<DangerComment[] | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const load = useCallback(() => { dangerComments(c.id).then(setRows).catch(() => setRows([])); }, [c.id]);
  useEffect(load, [load]);
  const send = async () => {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true); setErr('');
    try { await dangerCommentAdd(c.id, body); setText(''); load(); } catch { setErr(s(K('err'))); } finally { setBusy(false); }
  };
  const del = async (id: string) => { try { await dangerCommentDelete(id); load(); } catch { setErr(s(K('err'))); } };
  return (
    <SosCard>
      <h2 className="sos-eyebrow">{s(K('comments'))}</h2>
      {rows && rows.length === 0 && <p className="sos-small">{s(K('comments.none'))}</p>}
      <div className="sos-stack" style={{ gap: S.sm }}>
        {(rows ?? []).map((r) => (
          <div key={r.id} className="dgc-cm" style={{ ...PACK_BOX.row, cursor: 'default' }}>
            <b>{r.author_first ?? '?'}{r.pack_number != null ? ` #${r.pack_number}` : ''}</b>
            <small>{ago(r.created_at)}</small>
            <p>{r.body}</p>
            {r.is_mine && <button type="button" onClick={() => void del(r.id)}>{s(K('comment.delete'))}</button>}
          </div>
        ))}
      </div>
      <div className="dgc-add">
        <label className="sos-field">
          <textarea className="pf-field" rows={2} maxLength={600} value={text} placeholder={s(K('comment.ph'))} onChange={(e) => setText(e.target.value)} />
        </label>
        {err && <p className="sos-err">{err}</p>}
        <button type="button" className="sos-cta sos-cta--sm" disabled={busy || !text.trim()} onClick={() => void send()}>{s(K('comment.send'))}</button>
      </div>
    </SosCard>
  );
}

export default function PackDangerCase() {
  const { id } = useParams<{ id: string }>();
  const s = useSosT();
  const ago = useAgo();
  const date = useDate();
  const navigate = useNavigate();
  const back = useBack('/pack/map');
  const [c, setC] = useState<DangerCase | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!id) { setState('missing'); return; }
    dangerCase(id).then((r) => { setC(r); setState(r ? 'ready' : 'missing'); }).catch(() => setState('error'));
  }, [id]);
  useEffect(load, [load]);

  if (state !== 'ready' || !c) {
    return (
      <PackLayout onBack={back} backLabel={s('pack.sos.back')}>
        <SosStyles />
        <p className="sos-p" style={{ textAlign: 'center' }}>
          {state === 'loading' ? s(K('loading')) : state === 'missing' ? s(K('missing')) : s('pack.sos.offline')}
        </p>
        {state === 'error' && <button type="button" className="sos-cta" onClick={load}>{s('pack.sos.retry')}</button>}
      </PackLayout>
    );
  }

  const abuse = c.kind === 'abuse';
  const expired = !!c.expires_at && new Date(c.expires_at).getTime() < Date.now();
  const pending = c.review === 'pending';
  const rejected = c.review === 'rejected';
  const sent = c.complaints.filter((x) => x.sent_at);
  const toRate = c.is_mine ? sent.find((x) => !x.outcome) : undefined;
  const rated = c.complaints.find((x) => x.outcome);
  // Obec sa pripíše len vtedy, keď ju adresa ešte nenesie („Hlavná 12, Trenčín, Trenčín“).
  const where = c.place_label && c.municipality && c.place_label.includes(c.municipality) ? c.place_label
    : [c.place_label, c.municipality].filter(Boolean).join(', ');

  const witness = async () => {
    if (busy) return;
    setBusy(true);
    try { await dangerWitness(c.id, !c.i_witnessed); load(); } finally { setBusy(false); }
  };
  const rate = async (cid: string, o: DangerOutcome) => {
    setBusy(true);
    try { await dangerOutcome(cid, o); load(); } finally { setBusy(false); }
  };

  return (
    <PackLayout onBack={back} backLabel={s('pack.sos.back')}>
      <SosStyles />
      <style>{CSS}</style>
      <div className="sos-stack">
        <SosCard className={pending ? 'dgc-pending' : ''}>
          <div className="dgc-head">
            <SysIcon name="pozor" size={32} />
            <h1 className="sos-h2">{s(K(abuse ? 'title.abuse' : 'title.poison'))}</h1>
          </div>
          <div className="dgc-meta">
            <span>{s(K('reported'), { when: ago(c.created_at) })}</span>
            {c.witnesses > 0 && <span><SysIcon name="oko" size={16} />{s(K('witnesses.n'), { n: c.witnesses })}</span>}
            {c.expires_at && !expired && <span>{s(K('validUntil'), { date: date(c.expires_at) })}</span>}
            {!abuse && c.radius_m != null && <span>{s(K('radius'), { m: c.radius_m })}</span>}
          </div>
          {pending && <><b className="sos-small">{s(K('pending'))}</b><p className="sos-p">{s(K('pending.p'))}</p></>}
          {rejected && <><b className="sos-small">{s(K('rejected'))}</b><p className="sos-p">{s(K('rejected.p'))}</p></>}
          {expired && !pending && !rejected && <p className="sos-small">{s(K('expired'))}</p>}
          {where && (
            <div className="sos-fact"><small>{s(K('place'))}</small><span>{where}</span></div>
          )}
          {c.what.length > 0 && (
            <div className="sos-chips">
              {c.what.map((w) => <span key={w} className="sos-pill">{s(K(`chip.${w}`))}</span>)}
              {c.how_often && <span className="sos-pill">{s(K(`how.${c.how_often}`))}</span>}
            </div>
          )}
          {c.body && <p className="sos-p" style={{ color: T.inkStrong, whiteSpace: 'pre-wrap' }}>{c.body}</p>}
          {c.what.includes('dog_fights') && (
            <a className="sos-cta sos-cta--red sos-cta--sm" href="tel:158">{s(K('call158'))}</a>
          )}
          {abuse && <p className="dgc-risk">{s(K('risk'))}</p>}
          {!abuse && (
            <Link className="sos-row" style={{ ...PACK_BOX.row }} to="/pack/sos/prva-pomoc">
              <SysIcon name="sos-pomoc" size={32} />
              <span className="grow"><b>{s(K('poison.help'))}</b></span>
            </Link>
          )}
        </SosCard>

        {c.photos.length > 0 && (
          <SosCard>
            <h2 className="sos-eyebrow">{s(K('photos'))}</h2>
            <div className="dgc-photos">
              {c.photos.map((p) => <img key={p} src={sizedUrl(p, 360)} alt="" loading="lazy" />)}
            </div>
          </SosCard>
        )}

        {c.review === 'approved' && !expired && (
          <SosCard>
            <button type="button" className={`sos-cta${c.i_witnessed ? ' sos-cta--tint' : ''}`} disabled={busy} onClick={() => void witness()}>
              <SysIcon name="oko" size={24} />{s(K(abuse ? 'witness.abuse' : 'witness.poison'))}
            </button>
            <p className="sos-small">{c.i_witnessed ? s(K('witness.done')) : s(K('witness.p'))}</p>
          </SosCard>
        )}

        {(c.review === 'approved' || c.is_mine) && (
          <SosCard>
            <h2 className="sos-eyebrow">{s(K('complaint.title'))}</h2>
            {c.complaints.map((x) => (
              <div key={x.id} className="sos-fact">
                <small>{authorityByCode(x.authority_code)?.name ?? x.authority_code}</small>
                <span>{x.sent_at ? s(K('complaint.sent'), { date: date(x.sent_at) }) : s(K('complaint.waiting'))}</span>
              </div>
            ))}
            {rated?.outcome && <p className="sos-p">{s(K('outcome.done'), { what: s(K(`outcome.${rated.outcome}`)) })}</p>}
            {toRate && (
              <>
                <h3 className="sos-eyebrow">{s(K('outcome.title'))}</h3>
                <div className="sos-opts">
                  {OUTCOMES.map((o) => (
                    <button key={o} type="button" className="sos-opt sos-opt--calm" disabled={busy} onClick={() => void rate(toRate.id, o)}>{s(K(`outcome.${o}`))}</button>
                  ))}
                </div>
              </>
            )}
            {!expired && <p className="sos-small">{s(K('complaint.add.p'))}</p>}
            <button type="button" className="sos-cta sos-cta--tint" onClick={() => navigate(`/pack/sos/nebezpecenstvo/podnet?case=${c.id}`)}>{s(K('complaint.add'))}</button>
            <button type="button" className="sos-cta sos-cta--ghost" onClick={() => navigate(`/pack/sos/nebezpecenstvo/p/${c.id}/plagat`)}>{s(K('poster'))}</button>
          </SosCard>
        )}

        {c.review === 'approved' && <Comments c={c} s={s} />}
      </div>
    </PackLayout>
  );
}
