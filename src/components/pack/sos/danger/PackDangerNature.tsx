// `/pack/sos/nebezpecenstvo/priroda` — PRÍRODA (nákres scr 12): druhá brána k TÝM ISTÝM upozorneniam, ktoré člen pridáva na mape cez plus.
// Jeden zoznam (`GROUP_KINDS.warning`), jedno API (`addMapNote`), PackMap ani mapnotes sa nemenia. Okruh podľa pravidla druhu (`radiusRule`).
// Prvá položka zoznamu = Otrava a nástrahy (odkaz na `/otrava`, Matej 21. 11. 2026).
// Názvy druhov a nápovedy berie z existujúcich `pack.mapNotes.kind.*` / `pack.mapNotes.add.placeholder.*`.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { MapAttribution, MAP_ATTR_CSS } from '@/components/pack/mapAttribution';
import { addMapNote, defaultRadius, GROUP_KINDS, radiusRule, type NoteKind } from '@/components/pack/mapnotes/mapNotesData';
import { SysIcon } from '@/components/pack/SysIcon';
import { SosCard, useBack, useSosT } from '../sosShared';
import { SosTaskShell } from '../SosTaskShell';
import { DANGER_FORM_CSS, DangerMap, GeoStatus, useGeoPick, type GeoPick } from './PackDangerReport';
import { CharCount, clearDraft, loadDraft, saveDraft, useArmed, useFieldErr, useSubmitLock } from './dangerForm';
import { dangerIsOffline, dangerPrecheck, type DangerGate } from '@/lib/danger';
import type { SosKey } from '../sosTexts';

const BODY_MAX = 600;
const DRAFT_KEY = 'nature';
interface NatureDraft { pt: [number, number] | null; geo: GeoPick; kind: NoteKind; body: string; radius: number }

export default function PackDangerNature() {
  const s = useSosT();
  const t = useT();
  const navigate = useNavigate();
  const back = useBack('/pack/sos/nebezpecenstvo');
  // rozpísané prežije „späť → vpred“ aj obnovenie stránky (sessionStorage), po pridaní na mapu sa zmaže
  const draft = useMemo(() => {
    const d = loadDraft<NatureDraft>(DRAFT_KEY);
    return d && d.kind && GROUP_KINDS.warning.includes(d.kind) ? d : null;
  }, []);
  const { pt, geo, center, zoom, locateTick, locErr, pick, locate, setPlace, geoState, tilesFail, onTiles } = useGeoPick(draft ? { pt: draft.pt ?? null, geo: draft.geo ?? null } : null);
  const [kind, setKind] = useState<NoteKind>(draft?.kind ?? GROUP_KINDS.warning[0]);
  const [body, setBody] = useState(draft?.body ?? '');
  const [radius, setRadius] = useState<number>(draft?.radius ?? defaultRadius(draft?.kind ?? GROUP_KINDS.warning[0]) ?? 150);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) saveDraft(DRAFT_KEY, { pt, geo, kind, body, radius } satisfies NatureDraft);
  }, [done, pt, geo, kind, body, radius]);

  const rule = radiusRule(kind);
  const withRadius = rule.mode !== 'none';
  const tx = (key: string, fb: string) => { const v = t(key); return v === key ? fb : v; };
  const kinds = useMemo(() => GROUP_KINDS.warning, []);

  const choose = (k: NoteKind) => { setKind(k); setRadius(defaultRadius(k) ?? 150); };

  const lock = useSubmitLock();
  const armed = useArmed(done);
  // brána hneď pri vstupe (odhlásený / nečlen): `add_map_note` by ich odmietol až po vyplnení („Niečo sa pokazilo“). Limit hlásení sa tu netýka.
  const [gate, setGate] = useState<'ok' | 'not_authenticated' | 'no_access'>('ok');
  useEffect(() => {
    let alive = true;
    dangerPrecheck('poison').then((g: DangerGate) => { if (alive && (g === 'not_authenticated' || g === 'no_access')) setGate(g); });
    return () => { alive = false; };
  }, []);
  const fe = useFieldErr();
  const submit = () => lock(async () => {
    if (busy || gate !== 'ok') return;
    if (!pt) { setErr(s('pack.sos.danger.report.err.bad_coords')); fe.flag('map'); return; }
    if (!body.trim()) { setErr(s('pack.sos.danger.nature.err.body')); fe.flag('body'); return; }
    setErr(''); fe.clear(); setBusy(true);
    try {
      await addMapNote({ kind, lat: pt[0], lon: pt[1], body: body.trim(), radiusM: withRadius ? radius : null });
      clearDraft(DRAFT_KEY);
      setDone(true);
    } catch (x) {
      const m = String((x as { message?: string })?.message ?? '');
      setErr(/limit|too_many|rate/i.test(m) ? s('pack.sos.danger.nature.err.limit') : dangerIsOffline(x) ? s('pack.sos.offline') : s('pack.sos.danger.report.err.error'));
    } finally { setBusy(false); }
  });

  if (done) {
    return (
      <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
        <h1 className="sos-h2">{s('pack.sos.danger.nature.title')}</h1>
        <p className="sos-p">{s('pack.sos.danger.nature.done')}</p>
        <button type="button" className="sos-cta" disabled={!armed} onClick={() => navigate('/pack/map')}>{s('pack.sos.danger.nature.openMap')}</button>
        <button type="button" className="sos-cta sos-cta--ghost" disabled={!armed} onClick={() => { setDone(false); setBody(''); }}>{s('pack.sos.danger.nature.another')}</button>
      </SosTaskShell>
    );
  }

  const locText = locErr === 'denied' ? s('pack.sos.danger.report.locDenied') : locErr === 'fail' ? s('pack.sos.danger.report.locFail') : '';
  return (
    <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
      <style>{DANGER_FORM_CSS}</style>
      <style>{MAP_ATTR_CSS}</style>
      <h1 className="sos-h2">{s('pack.sos.danger.nature.title')}</h1>
      {gate !== 'ok' && <p className="dgr-note dgr-note--red" role="alert">{s(`pack.sos.danger.report.err.${gate}` as SosKey)}</p>}
      <p className="sos-p">{s('pack.sos.danger.nature.lead')}</p>

      <SosCard>
        <div className="sos-chips">
          {/* Otrava a nástrahy: vlastný tok s okruhom a upozornením okolia (`/otrava`), preto odkaz, nie druh */}
          <button type="button" className="sos-pill sos-pick dgr-chip" onClick={() => navigate('/pack/sos/nebezpecenstvo/otrava')}>
            <SysIcon name="pozor" size={20} />{s('pack.sos.danger.hub.poison')}
          </button>
          {kinds.map((k) => (
            <button key={k} type="button" className={`sos-pill sos-pick dgr-chip${kind === k ? ' is-on' : ''}`} aria-pressed={kind === k} onClick={() => choose(k)}>
              {tx(`pack.mapNotes.kind.${k}`, k)}
            </button>
          ))}
        </div>
        <p className="sos-p">{s('pack.sos.danger.report.mapHint')}</p>
        <div className={`dgr-map${fe.bad === 'map' ? ' is-bad' : ''}`} ref={fe.reg('map')}>
          <DangerMap center={center} zoom={zoom} pt={pt} radius={withRadius ? radius : null} onPick={(p) => { fe.clear('map'); setErr(''); pick(p); }} locateTick={locateTick} onTiles={onTiles} />
          <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm dgr-loc" onClick={locate}>{s('pack.sos.danger.report.myLocation')}</button>
          <MapAttribution />
        </div>
        {locText && <p className="sos-err">{locText}</p>}
        <GeoStatus pt={pt} geoState={geoState} tilesFail={tilesFail} />
        <label className="sos-field"><span>{s('pack.sos.danger.report.place')}</span>
          <input className="pf-field" value={geo.place} maxLength={200} placeholder={s('pack.sos.danger.report.placeHint')} onChange={(e) => setPlace(e.target.value)} />
        </label>
        {withRadius && (
          <label className="sos-field"><span>{s('pack.sos.danger.report.radius', { n: radius })}</span>
            <input className="dgr-range" type="range" min={rule.min} max={rule.max} step={rule.step} value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
          </label>
        )}
        <label className="sos-field"><span>{s('pack.sos.danger.report.body')}</span>
          <textarea ref={fe.reg('body')} className={`pf-field dgr-ta${fe.bad === 'body' ? ' is-bad' : ''}`} rows={4} maxLength={BODY_MAX} value={body} onChange={(e) => { fe.clear('body'); setBody(e.target.value); }}
            placeholder={tx(`pack.mapNotes.add.placeholder.${kind}`, s('pack.sos.danger.nature.bodyHint'))} />
          <CharCount len={body.length} max={BODY_MAX} />
        </label>
      </SosCard>

      {err && <p className="sos-err">{err}</p>}
      <button type="button" className="sos-cta" disabled={busy || gate !== 'ok'} onClick={submit}>{busy ? s('pack.sos.danger.nature.sending') : s('pack.sos.danger.nature.add')}</button>
    </SosTaskShell>
  );
}
