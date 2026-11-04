// SOS — ČO TERAZ UROBIŤ `/pack/sos/:slug/plan` (kôš 2). Sprievodca krokmi, nie zoznam odkazov (Matej 5. 11. 2026):
// vždy je otvorený práve JEDEN krok (prvý nesplnený), iný sa dá otvoriť ručne — v panike nič neblokuje.
// Otvorený krok: Prečo · Čo povedať (predvyplnený text + SKOPÍROVAŤ) · kontakty ZAVOLAŤ/SMS · Na čo sa spýtať ·
// HOTOVO, ĎALEJ · Preskočiť. Po návrate z hovoru/SMS sa opýta „Podarilo sa?“ (NEDOVOLAL SOM SA → ďalší kontakt).
// Odškrtnutie nesie server (`lost_dogs.plan_done`, `sosSetPlan`); preskočené je len v tejto návšteve a do hotových sa nepočíta.
// Kroky leták a zdieľanie sa odškrtnú samy (`flyer_url`, `shares` / zdieľanie z tejto obrazovky).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PackLayout } from '@/components/pack/PackLayout';
import { toast } from '@/hooks/use-toast';
import { PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PROGRESS_CSS, PACK_THEME as T } from '@/components/pack/packTheme';
import { lostUrl, sosContactsNear, sosSetPlan, type SosContact, type SosContactType } from '@/lib/sos';
import { shareLostDog, sosInvalidate } from '@/components/pack/sosKit';
import { SosStyles, sosPath, useBack, useBreedLabel, useSosLost, useSosT, useWhen, type SosT } from './sosShared';
import type { SosKey } from './sosTexts';

/** Šírka výplne PROGRESU (recept `.pk-progress`) — rovnaký pomocník ako v `StatsDetail`. */
const fillW = (pct: number) => {
  const w = `${Math.min(100, Math.max(0, pct))}%`;
  return { display: 'block', width: w };
};

const CSS = `
.sosp-prog{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.sosp-prog b{font-size:${PACK_TEXT.label}px;font-weight:600;color:${T.inkWarm};letter-spacing:.02em;}
.sosp-step{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;padding:0;overflow:hidden;}
.sosp-head{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:${PACK_SPACE.md}px;width:100%;min-height:56px;padding:${PACK_SPACE.md}px;cursor:pointer;}
.sosp-ring{flex:none;width:44px;height:44px;display:grid;place-items:center;}
.sosp-ring i{display:block;width:24px;height:24px;border-radius:${PACK_R.pill}px;border:2px solid ${T.cardEdge};background:transparent;box-sizing:border-box;color:#fff;font:700 ${PACK_TEXT.label}px/20px sans-serif;text-align:center;}
.sosp-step.is-done .sosp-ring i{background:${T.growGreen};border-color:${T.growGreen};}
.sosp-step.is-skip .sosp-ring i{border-style:dashed;}
.sosp-head .grow{flex:1;min-width:0;}
.sosp-head b{display:block;font-weight:600;font-size:${PACK_TEXT.lead}px;color:${T.inkStrong};}
.sosp-step.is-done:not(.is-open) .sosp-head b{color:${T.inkWarm};text-decoration:line-through;}
.sosp-head small{display:block;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.sosp-body{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;padding:0 ${PACK_SPACE.md}px ${PACK_SPACE.md}px;}
.sosp-lbl{margin:0;font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.sosp-say{margin:0;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;background:${T.tileBg};border:1px solid ${T.border};font-size:${PACK_TEXT.body}px;line-height:1.45;color:${T.inkStrong};white-space:pre-wrap;word-break:break-word;}
.sosp-item{padding:${PACK_SPACE.md}px;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.sosp-item b{font-size:${PACK_TEXT.lead}px;font-weight:600;}
.sosp-tag{display:inline-flex;align-self:flex-start;min-height:24px;align-items:center;padding:0 ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;font-size:${PACK_TEXT.label}px;font-weight:600;}
.sosp-tag--ok{color:#2F6A42;background:${T.growGreenSoft};}
.sosp-tag--no{color:#8A5A10;background:rgba(201,154,63,.2);}
.sosp-tag a{color:inherit;}
.sosp-acts{display:grid;grid-template-columns:1fr 1fr;gap:${PACK_SPACE.sm}px;}
.sosp-fixed{display:grid;grid-template-columns:1fr;gap:${PACK_SPACE.sm}px;}
.sosp-asks{margin:0;padding-left:${PACK_SPACE.lg}px;font-size:${PACK_TEXT.body}px;line-height:1.45;color:${T.inkDim};}
.sosp-ret{padding:${PACK_SPACE.md}px;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;border-radius:${PACK_R.tile}px;background:${T.tileBg};border:1.5px solid ${T.border};}
.sosp-ret b{font-size:${PACK_TEXT.lead}px;font-weight:600;color:${T.inkStrong};}
.sosp-link{all:unset;box-sizing:border-box;cursor:pointer;min-height:44px;display:flex;align-items:center;justify-content:center;font-size:${PACK_TEXT.label}px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};}
`;

type Step = 'police' | 'shelter' | 'hunting' | 'oz' | 'chip' | 'flyer' | 'share' | 'post';
const STEPS: Step[] = ['police', 'shelter', 'hunting', 'oz', 'chip', 'flyer', 'share', 'post'];
/** Kontaktné kroky: typ v `sos_contacts`, koľko kontaktov hneď, či má osnovu na telefonát. */
const CONTACT: Partial<Record<Step, { typ: SosContactType; base: number }>> = {
  police: { typ: 'police', base: 1 }, shelter: { typ: 'shelter', base: 2 }, hunting: { typ: 'hunting', base: 1 }, oz: { typ: 'oz', base: 2 },
};
const WITH_SAY: Step[] = ['police', 'shelter', 'hunting', 'oz', 'share'];
const WITH_ASK: Step[] = ['police', 'shelter', 'hunting', 'oz'];
const key = (step: Step, part: string) => `pack.sos.plan.s.${step}.${part}` as SosKey;

const digits = (p: string) => p.replace(/[^\d+]/g, '');
const mmYYYY = (d: string) => { const m = /^(\d{4})-(\d{2})/.exec(d); return m ? `${m[2]}/${m[1]}` : d; };

function Contact({ c, smsBody, s, onAct }: { c: SosContact; smsBody: string; s: SosT; onAct: () => void }) {
  return (
    <div className="sosp-item" style={{ ...PACK_BOX.row }}>
      <b>{c.name}</b>
      {(c.contact_person || c.contact_role) && <span className="sos-small">{[c.contact_person, c.contact_role].filter(Boolean).join(' · ')}</span>}
      <span className="sos-small">{[c.city, c.distance_km != null ? s('pack.sos.plan.km', { km: Math.round(c.distance_km) }) : null].filter(Boolean).join(' · ')}</span>
      {c.verified_at
        ? <span className="sosp-tag sosp-tag--ok">{s('pack.sos.plan.verified', { date: mmYYYY(c.verified_at) })}</span>
        : <span className="sosp-tag sosp-tag--no">{s('pack.sos.plan.unverified')}{c.source && <>{' · '}{c.source_url ? <a href={c.source_url} target="_blank" rel="noopener noreferrer">{c.source}</a> : c.source}</>}</span>}
      {c.phone ? (
        <div className="sosp-acts">
          <a className="sos-cta" href={`tel:${digits(c.phone)}`} onClick={onAct}>{s('pack.sos.det.call')}</a>
          <a className="sos-cta sos-cta--ghost" href={`sms:${digits(c.phone)}?&body=${encodeURIComponent(smsBody)}`} onClick={onAct}>SMS</a>
        </div>
      ) : c.web ? (
        <a className="sos-cta sos-cta--ghost" href={c.web} target="_blank" rel="noopener noreferrer" onClick={onAct}>{s('pack.sos.plan.web')}</a>
      ) : null}
    </div>
  );
}

export default function PackSosPlan() {
  const { slug } = useParams<{ slug: string }>();
  const s = useSosT();
  const navigate = useNavigate();
  const when = useWhen();
  const breedLabel = useBreedLabel();
  const back = useBack(sosPath.page(slug ?? ''));
  const load = useSosLost(slug);
  const [rows, setRows] = useState<SosContact[] | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [shared, setShared] = useState(false);
  const [openId, setOpenId] = useState<Step | null | undefined>(undefined); // undefined = prvý nesplnený
  const [extra, setExtra] = useState<Partial<Record<Step, number>>>({});
  const [away, setAway] = useState<Step | null>(null);
  const [asking, setAsking] = useState<Step | null>(null);
  const [noMore, setNoMore] = useState<Step | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const pub = load.state === 'ready' ? load.pub : null;
  const mine = load.state === 'ready' ? load.mine : null;

  useEffect(() => { if (mine) setDone(new Set(mine.plan_done ?? [])); }, [mine?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (load.state === 'ready' && !load.mine) navigate(sosPath.page(slug ?? ''), { replace: true }); }, [load.state, slug]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!pub) return;
    let alive = true;
    sosContactsNear(pub.lat, pub.lng, pub.country, 5).then((r) => alive && setRows(r)).catch(() => alive && setRows([]));
    return () => { alive = false; };
  }, [pub?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Po návrate z hovoru / SMS sa opýtame, či to vyšlo.
  const awayRef = useRef<Step | null>(null);
  awayRef.current = away;
  useEffect(() => {
    const back = () => { if (document.visibilityState === 'visible' && awayRef.current) { setAsking(awayRef.current); setAway(null); } };
    document.addEventListener('visibilitychange', back);
    window.addEventListener('focus', back);
    return () => { document.removeEventListener('visibilitychange', back); window.removeEventListener('focus', back); };
  }, []);

  const isDone = useCallback((st: Step) =>
    done.has(st) || (st === 'flyer' && !!mine?.flyer_url) || (st === 'share' && (shared || (mine?.shares ?? 0) > 0)), [done, mine, shared]);

  const persist = useCallback((next: Set<string>) => {
    setDone(next);
    if (mine) void sosSetPlan(mine.id, [...next]).catch(() => {});
  }, [mine]);

  const total = STEPS.length;
  const doneCount = STEPS.filter(isDone).length;
  const firstPending = STEPS.find((st) => !isDone(st) && !skipped.has(st)) ?? null;
  const allDone = doneCount === total && !reviewing;
  const current = openId === undefined ? (reviewing ? STEPS.find((st) => !isDone(st)) ?? null : firstPending) : openId;

  const markDone = (st: Step) => {
    const next = new Set(done); next.add(st);
    persist(next);
    setAsking(null); setNoMore(null);
    const after = STEPS.slice(STEPS.indexOf(st) + 1).concat(STEPS.slice(0, STEPS.indexOf(st))).find((x) => x !== st && !next.has(x) && !skipped.has(x) && !(x === 'flyer' && mine?.flyer_url) && !(x === 'share' && (shared || (mine?.shares ?? 0) > 0)));
    setOpenId(after ?? null);
  };
  const toggle = (st: Step) => {
    if (isDone(st) && done.has(st)) { const next = new Set(done); next.delete(st); persist(next); return; }
    if (!isDone(st)) markDone(st);
  };
  const skip = (st: Step) => {
    const nextSk = new Set(skipped); nextSk.add(st); setSkipped(nextSk);
    const after = STEPS.slice(STEPS.indexOf(st) + 1).find((x) => !isDone(x) && !nextSk.has(x));
    setOpenId(after ?? null);
  };

  const dogDesc = pub ? [pub.dog_name, breedLabel(pub.breed)].filter(Boolean).join(', ') : '';
  const url = pub ? lostUrl(pub.slug) : '';
  const say = pub && mine
    ? s('pack.sos.plan.say.body', { desc: dogDesc, when: when(pub.last_seen_at), place: pub.place_label ?? '', url, phone: mine.phone ?? '' })
    : '';
  const smsBody = pub ? s('pack.sos.plan.smsText', { name: pub.dog_name, place: pub.place_label ?? '', url }) : '';

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast({ title: s('pack.sos.plan.copied') }); } catch { toast({ title: text }); }
  };
  const doShare = async () => {
    if (!pub || !mine) return;
    const res = await shareLostDog({ slug: pub.slug, name: pub.dog_name, flyerUrl: mine.flyer_url, text: s('pack.sos.det.shareText', { name: pub.dog_name }), copiedText: s('pack.sos.det.copied') });
    if (res === 'shared' || res === 'copied') {
      setShared(true);
      const next = new Set(done); next.add('share'); persist(next);
      sosInvalidate();
    }
  };

  const ready = pub && mine;
  const pct = Math.round((doneCount / total) * 100);

  const renderContacts = (st: Step) => {
    const cfg = CONTACT[st];
    if (!cfg) return null;
    const all = (rows ?? []).filter((r) => r.typ === cfg.typ);
    const shown = all.slice(0, cfg.base + (extra[st] ?? 0));
    const act = () => setAway(st);
    return (
      <>
        {st === 'police' && (
          <div className="sosp-fixed">
            <a className="sos-cta sos-cta--red" href="tel:158" onClick={act}>158 · {s('pack.sos.plan.police158')}</a>
            <a className="sos-cta sos-cta--red" href="tel:112" onClick={act}>112 · {s('pack.sos.plan.emergency112')}</a>
          </div>
        )}
        {shown.map((c, i) => <Contact key={`${c.name}-${i}`} c={c} smsBody={smsBody} s={s} onAct={act} />)}
        {rows && all.length === 0 && st !== 'police' && <p className="sos-small">{s('pack.sos.plan.empty')}</p>}
        {noMore === st && <p className="sos-small">{s('pack.sos.plan.ret.noMore')}</p>}
        {asking === st && (
          <div className="sosp-ret">
            <b>{s('pack.sos.plan.ret.title')}</b>
            <button type="button" className="sos-cta sos-cta--green" onClick={() => markDone(st)}>{s('pack.sos.plan.ret.yes')}</button>
            <button type="button" className="sos-cta sos-cta--ghost" onClick={() => {
              setAsking(null);
              if (all.length > shown.length) { setExtra({ ...extra, [st]: (extra[st] ?? 0) + 1 }); setNoMore(null); } else setNoMore(st);
            }}>{s('pack.sos.plan.ret.no')}</button>
          </div>
        )}
      </>
    );
  };

  return (
    <PackLayout onBack={back} backLabel={s('pack.sos.back')}>
      <SosStyles /><style>{PROGRESS_CSS + CSS}</style>
      <div className="sos-stack">
        <h1 className="sos-h2">{s('pack.sos.plan.title')}</h1>
        {load.state === 'loading' && <p className="sos-p" style={{ textAlign: 'center' }}>{s('pack.sos.loading')}</p>}
        {(load.state === 'missing' || load.state === 'error') && <p className="sos-err" style={{ textAlign: 'center' }}>{load.state === 'missing' ? s('pack.sos.notFound') : s('pack.sos.error')}</p>}

        {ready && (
          <>
            <div className="sosp-prog">
              <b>{s('pack.sos.plan.progress', { done: doneCount, total })}</b>
              <span className="pk-progress"><span className="pk-progress__fill" style={fillW(pct)} /></span>
            </div>

            {allDone && (
              <section className="sos-card" style={{ ...PACK_BOX.card }}>
                <h2 className="sos-h2">{s('pack.sos.plan.all.title')}</h2>
                <p className="sos-p">{s('pack.sos.plan.all.text')}</p>
                <p className="sos-p">{s('pack.sos.plan.all.check', { name: pub.dog_name })}</p>
                <button type="button" className="sos-cta" onClick={() => navigate(sosPath.page(pub.slug))}>{s('pack.sos.plan.all.page')}</button>
                <button type="button" className="sos-cta sos-cta--ghost" onClick={() => { setReviewing(true); setOpenId(null); }}>{s('pack.sos.plan.all.again')}</button>
              </section>
            )}

            {STEPS.map((st, idx) => {
              const d = isDone(st);
              const sk = !d && skipped.has(st);
              const open = current === st;
              return (
                <section key={st} className={`sosp-step${d ? ' is-done' : ''}${sk ? ' is-skip' : ''}${open ? ' is-open' : ''}`} style={{ ...(open ? PACK_BOX.card : PACK_BOX.row) }}>
                  <div className="sosp-head" role="button" tabIndex={0} aria-expanded={open}
                    onClick={() => setOpenId(open ? null : st)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenId(open ? null : st); } }}>
                    <button type="button" className="sosp-ring" aria-label={s(key(st, 't'))} aria-pressed={d}
                      onClick={(e) => { e.stopPropagation(); toggle(st); }}>
                      <i>{d ? '✓' : ''}</i>
                    </button>
                    <span className="grow">
                      <b>{idx + 1}. {s(key(st, 't'))}</b>
                      {(d || sk) && <small>{d ? s('pack.sos.plan.doneTag') : s('pack.sos.plan.skippedTag')}</small>}
                    </span>
                  </div>
                  {open && (
                    <div className="sosp-body">
                      <p className="sos-p">{s(key(st, 'why'))}</p>
                      {WITH_SAY.includes(st) && (
                        <>
                          <p className="sosp-lbl">{s('pack.sos.plan.say')}</p>
                          <p className="sosp-say">{st === 'share' ? `${s('pack.sos.det.shareText', { name: pub.dog_name })} ${url}` : say}</p>
                          <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm" onClick={() => void copy(st === 'share' ? `${s('pack.sos.det.shareText', { name: pub.dog_name })} ${url}` : say)}>{s('pack.sos.plan.copy')}</button>
                        </>
                      )}
                      {renderContacts(st)}
                      {st === 'flyer' && <button type="button" className="sos-cta" onClick={() => navigate(sosPath.flyer(pub.slug))}>{s(key(st, 'cta'))}</button>}
                      {st === 'share' && <button type="button" className="sos-cta sos-cta--gold" onClick={() => void doShare()}>{s(key(st, 'cta'))}</button>}
                      {WITH_ASK.includes(st) && (
                        <>
                          <p className="sosp-lbl">{s('pack.sos.plan.ask')}</p>
                          <ul className="sosp-asks"><li>{s(key(st, 'ask1'))}</li><li>{s(key(st, 'ask2'))}</li></ul>
                        </>
                      )}
                      {!d && <button type="button" className="sos-cta sos-cta--green" onClick={() => markDone(st)}>{s('pack.sos.plan.next')}</button>}
                      {!d && !sk && <button type="button" className="sosp-link" onClick={() => skip(st)}>{s('pack.sos.plan.skip')}</button>}
                    </div>
                  )}
                </section>
              );
            })}
          </>
        )}
      </div>
    </PackLayout>
  );
}
