// `/pack/sos/nebezpecenstvo/priroda` — PRÍRODA (nákres scr 12): druhá brána k TÝM ISTÝM upozorneniam, ktoré člen pridáva na mape cez plus.
// Jeden zoznam (`GROUP_KINDS.warning`), jedno API (`addMapNote`), PackMap ani mapnotes sa nemenia. Okruh podľa pravidla druhu (`radiusRule`).
// Názvy druhov a nápovedy berie z existujúcich `pack.mapNotes.kind.*` / `pack.mapNotes.add.placeholder.*`.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { MapAttribution, MAP_ATTR_CSS } from '@/components/pack/mapAttribution';
import { addMapNote, defaultRadius, GROUP_KINDS, radiusRule, type NoteKind } from '@/components/pack/mapnotes/mapNotesData';
import { SosCard, useBack, useSosT } from '../sosShared';
import { SosTaskShell } from '../SosTaskShell';
import { DANGER_FORM_CSS, DangerMap, useGeoPick } from './PackDangerReport';

export default function PackDangerNature() {
  const s = useSosT();
  const t = useT();
  const navigate = useNavigate();
  const back = useBack('/pack/sos/nebezpecenstvo');
  const { pt, geo, center, zoom, locateTick, locErr, pick, locate, setPlace } = useGeoPick();
  const [kind, setKind] = useState<NoteKind>(GROUP_KINDS.warning[0]);
  const [body, setBody] = useState('');
  const [radius, setRadius] = useState<number>(defaultRadius(GROUP_KINDS.warning[0]) ?? 150);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const rule = radiusRule(kind);
  const withRadius = rule.mode !== 'none';
  const tx = (key: string, fb: string) => { const v = t(key); return v === key ? fb : v; };
  const kinds = useMemo(() => GROUP_KINDS.warning, []);

  const choose = (k: NoteKind) => { setKind(k); setRadius(defaultRadius(k) ?? 150); };

  const submit = async () => {
    if (busy) return;
    if (!pt) { setErr(s('pack.sos.danger.report.err.bad_coords')); return; }
    if (!body.trim()) { setErr(s('pack.sos.danger.nature.err.body')); return; }
    setErr(''); setBusy(true);
    try {
      await addMapNote({ kind, lat: pt[0], lon: pt[1], body: body.trim(), radiusM: withRadius ? radius : null });
      setDone(true);
    } catch (x) {
      const m = String((x as { message?: string })?.message ?? '');
      setErr(/limit|too_many|rate/i.test(m) ? s('pack.sos.danger.nature.err.limit') : s('pack.sos.danger.report.err.error'));
    }
    setBusy(false);
  };

  if (done) {
    return (
      <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
        <h1 className="sos-h2">{s('pack.sos.danger.nature.title')}</h1>
        <p className="sos-p">{s('pack.sos.danger.nature.done')}</p>
        <button type="button" className="sos-cta" onClick={() => navigate('/pack/map')}>{s('pack.sos.danger.nature.openMap')}</button>
        <button type="button" className="sos-cta sos-cta--ghost" onClick={() => { setDone(false); setBody(''); }}>{s('pack.sos.danger.nature.another')}</button>
      </SosTaskShell>
    );
  }

  const locText = locErr === 'denied' ? s('pack.sos.danger.report.locDenied') : locErr === 'fail' ? s('pack.sos.danger.report.locFail') : '';
  return (
    <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
      <style>{DANGER_FORM_CSS}</style>
      <style>{MAP_ATTR_CSS}</style>
      <h1 className="sos-h2">{s('pack.sos.danger.nature.title')}</h1>
      <p className="sos-p">{s('pack.sos.danger.nature.lead')}</p>

      <SosCard>
        <div className="sos-chips">
          {kinds.map((k) => (
            <button key={k} type="button" className={`sos-pill sos-pick dgr-chip${kind === k ? ' is-on' : ''}`} aria-pressed={kind === k} onClick={() => choose(k)}>
              {tx(`pack.mapNotes.kind.${k}`, k)}
            </button>
          ))}
        </div>
        <p className="sos-p">{s('pack.sos.danger.report.mapHint')}</p>
        <div className="dgr-map">
          <DangerMap center={center} zoom={zoom} pt={pt} radius={withRadius ? radius : null} onPick={pick} locateTick={locateTick} />
          <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm dgr-loc" onClick={locate}>{s('pack.sos.danger.report.myLocation')}</button>
          <MapAttribution />
        </div>
        {locText && <p className="sos-err">{locText}</p>}
        <label className="sos-field"><span>{s('pack.sos.danger.report.place')}</span>
          <input className="pf-field" value={geo.place} maxLength={200} placeholder={s('pack.sos.danger.report.placeHint')} onChange={(e) => setPlace(e.target.value)} />
        </label>
        {withRadius && (
          <label className="sos-field"><span>{s('pack.sos.danger.report.radius', { n: radius })}</span>
            <input className="dgr-range" type="range" min={rule.min} max={rule.max} step={rule.step} value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
          </label>
        )}
        <label className="sos-field"><span>{s('pack.sos.danger.report.body')}</span>
          <textarea className="pf-field dgr-ta" rows={4} maxLength={600} value={body} onChange={(e) => setBody(e.target.value)}
            placeholder={tx(`pack.mapNotes.add.placeholder.${kind}`, s('pack.sos.danger.nature.bodyHint'))} />
        </label>
      </SosCard>

      {err && <p className="sos-err">{err}</p>}
      <button type="button" className="sos-cta" disabled={busy} onClick={submit}>{busy ? s('pack.sos.danger.nature.sending') : s('pack.sos.danger.nature.add')}</button>
    </SosTaskShell>
  );
}
