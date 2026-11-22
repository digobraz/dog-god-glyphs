// `/pack/sos/nebezpecenstvo/priroda` — PRÍRODA (nákres scr 12): druhá brána k TÝM ISTÝM upozorneniam, ktoré člen pridáva na mape cez plus.
// Jeden zoznam (`GROUP_KINDS.warning`), jedno API (`addMapNote`), PackMap ani mapnotes sa nemenia. Okruh podľa pravidla druhu (`radiusRule`).
// Prvá položka zoznamu = Otrava. 🔴 Matej 21. 11. 2026: *„otrava neotvára celú kartu … otrava ako aj ostatné prírodné nástrahy budú mať ten
// istý podklad … každá pils musí mať ikonku“* — otrava je pilulka v TOM ISTOM formulári, ide cez `dangerReport` (kind poison: okruh,
// varovanie okolia), ostatné cez `addMapNote`. Ikonka pilulky = tá istá samolepka ako značka na mape (`noteStickerSrc`).
// Názvy druhov a nápovedy berie z existujúcich `pack.mapNotes.kind.*` / `pack.mapNotes.add.placeholder.*`.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { MapAttribution, MAP_ATTR_CSS } from '@/components/pack/mapAttribution';
import { MyLocIcon } from '@/components/pack/MyLocIcon';
import { noteStickerSrc } from '@/components/pack/mapnotes/mapStickers';
import { addMapNote, defaultRadius, GROUP_KINDS, radiusRule, type NoteKind } from '@/components/pack/mapnotes/mapNotesData';
import { SysIcon } from '@/components/pack/SysIcon';
import { SosCard, useBack, useSosT } from '../sosShared';
import { SosTaskShell } from '../SosTaskShell';
import { DANGER_FORM_CSS, DangerMap, GeoStatus, useGeoPick, type GeoPick } from './PackDangerReport';
import { CharCount, clearDraft, loadDraft, saveDraft, useArmed, useFieldErr, useSubmitLock } from './dangerForm';
import { DANGER_RADIUS, dangerIsOffline, dangerPrecheck, dangerReport, type DangerGate } from '@/lib/danger';
import type { SosKey } from '../sosTexts';

const BODY_MAX = 600;
const DRAFT_KEY = 'nature';
type NatureKind = NoteKind | 'poison';
interface NatureDraft { pt: [number, number] | null; geo: GeoPick; kind: NatureKind; body: string; radius: number }

export default function PackDangerNature() {
  const s = useSosT();
  const t = useT();
  const navigate = useNavigate();
  const back = useBack('/pack/sos/nebezpecenstvo');
  // rozpísané prežije „späť → vpred“ aj obnovenie stránky (sessionStorage), po pridaní na mapu sa zmaže
  const draft = useMemo(() => {
    const d = loadDraft<NatureDraft>(DRAFT_KEY);
    return d && d.kind && (d.kind === 'poison' || GROUP_KINDS.warning.includes(d.kind)) ? d : null;
  }, []);
  const { pt, geo, center, zoom, locateTick, locErr, pick, locate, setPlace, setCountry, geoState, tilesFail, onTiles } = useGeoPick(draft ? { pt: draft.pt ?? null, geo: draft.geo ?? null } : null);
  const [kind, setKind] = useState<NatureKind>(draft?.kind ?? 'poison');
  const [body, setBody] = useState(draft?.body ?? '');
  const isPoison = kind === 'poison';
  const radiusOf = (k: NatureKind) => (k === 'poison' ? DANGER_RADIUS.def : defaultRadius(k) ?? 150);
  const [radius, setRadius] = useState<number>(draft?.radius ?? radiusOf(draft?.kind ?? 'poison'));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) saveDraft(DRAFT_KEY, { pt, geo, kind, body, radius } satisfies NatureDraft);
  }, [done, pt, geo, kind, body, radius]);

  const rule = isPoison ? { mode: 'required' as const, min: DANGER_RADIUS.min, max: DANGER_RADIUS.max, step: 50 } : radiusRule(kind as NoteKind);
  const withRadius = rule.mode !== 'none';
  const tx = (key: string, fb: string) => { const v = t(key); return v === key ? fb : v; };
  const kinds = useMemo<NatureKind[]>(() => ['poison', ...GROUP_KINDS.warning.filter((k) => k !== 'poison')], []);
  const kindLabel = (k: NatureKind) => (k === 'poison' ? s('pack.sos.danger.report.title.poison') : tx(`pack.mapNotes.kind.${k}`, k));

  const choose = (k: NatureKind) => { setKind(k); setRadius(radiusOf(k)); setErr(''); fe.clear(); };

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
    // otrava: krajinu nehádame (server ju chce kvôli úradu a okruhu)
    if (isPoison && (!geo.country || geo.country === 'OTHER')) { setErr(s(geo.country === 'OTHER' ? 'pack.sos.danger.report.otherCountry' : 'pack.sos.danger.report.err.country')); fe.flag('country'); return; }
    setErr(''); fe.clear(); setBusy(true);
    try {
      if (isPoison) {
        await dangerReport({
          kind: 'poison', lat: pt[0], lng: pt[1], country: geo.country as string,
          place_label: geo.place.trim() || null, municipality: geo.municipality?.trim() || null, district: geo.district,
          radius_m: radius, what: [], how_often: null, body: body.trim(), photos: [],
        });
      } else {
        await addMapNote({ kind: kind as NoteKind, lat: pt[0], lon: pt[1], body: body.trim(), radiusM: withRadius ? radius : null });
      }
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
          {kinds.map((k) => {
            const ico = noteStickerSrc(k);
            return (
              <button key={k} type="button" className={`sos-pill sos-pick dgr-chip${kind === k ? ' is-on' : ''}`} aria-pressed={kind === k} onClick={() => choose(k)}>
                {ico ? <img src={ico} alt="" aria-hidden draggable={false} style={{ width: 24, height: 24, objectFit: 'contain', flexShrink: 0 }} /> : k === 'poison' && <SysIcon name="sos-otrava" size={24} />}
                {kindLabel(k)}
              </button>
            );
          })}
        </div>
        <p className="sos-p">{s('pack.sos.danger.report.mapHint')}</p>
        <div className={`dgr-map${fe.bad === 'map' ? ' is-bad' : ''}`} ref={fe.reg('map')}>
          <DangerMap center={center} zoom={zoom} pt={pt} radius={withRadius ? radius : null} onPick={(p) => { fe.clear('map'); setErr(''); pick(p); }} locateTick={locateTick} onTiles={onTiles} />
          <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm dgr-loc" onClick={locate}><MyLocIcon size={24} />{s('pack.sos.danger.report.myLocation')}</button>
          <MapAttribution />
        </div>
        {locText && <p className="sos-err">{locText}</p>}
        <GeoStatus pt={pt} geoState={geoState} tilesFail={tilesFail}
          {...(isPoison ? { country: geo.country, onCountry: (v: string) => { fe.clear('country'); setErr(''); setCountry(v); }, countryRef: fe.reg('country'), countryBad: fe.bad === 'country' } : {})} />
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
            placeholder={s('pack.sos.danger.nature.bodyHint')} />
          <CharCount len={body.length} max={BODY_MAX} />
        </label>
      </SosCard>

      {isPoison && (
        <SosCard>
          <p className="sos-p"><b>{s('pack.sos.danger.report.poisonHelp')}</b></p>
          <div className="dgr-links">
            <button type="button" onClick={() => navigate('/pack/sos/prva-pomoc')}>{s('pack.sos.danger.report.firstAid')}</button>
            <button type="button" onClick={() => navigate('/pack/sos/pohotovost')}>{s('pack.sos.danger.report.er')}</button>
          </div>
        </SosCard>
      )}

      {err && <p className="sos-err">{err}</p>}
      <button type="button" className="sos-cta" disabled={busy || gate !== 'ok'} onClick={submit}>{busy ? s('pack.sos.danger.nature.sending') : s('pack.sos.danger.nature.add')}</button>
    </SosTaskShell>
  );
}
