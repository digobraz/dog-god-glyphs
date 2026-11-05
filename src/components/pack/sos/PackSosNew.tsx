// SOS — VYHLÁSENIE STRATY `/pack/sos/new` (kôš 3 · ROBÍM ÚLOHU: bez lišty, hore šípka späť a nič vpravo).
// Výber psa (`sosMyDogs`, hostia sú v ňom) · mapa s klikom, dva kruhy v skutočných metroch (500 m tmavý, 10 km svetlý)
// · lokalita · dátum a čas (nie v budúcnosti) · telefón predvyplnený · červené CTA. Po úspechu stránka psa.
// Mapa = rovnaký podklad ako PackMap (dlaždice Mapy.com cez `mapyTiles`, atribúcia `MapAttribution`).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAPY_API_KEY, MAPY_BASE, mapyTiles } from '@/lib/env';
import { useLang } from '@/i18n/LanguageContext';
import { countryCentroid, countryISO3 } from '@/lib/countryGeo';
import { sizedUrl } from '@/services/cloudinaryService';
import { sosDeclare, sosLastPhone, sosMyDogs, sosResume, type SosDog } from '@/lib/sos';
import { sosInvalidate } from '@/components/pack/sosKit';
import { MapAttribution, MAP_ATTR_CSS } from '@/components/pack/mapAttribution';
import { PACK_THEME as T, PACK_R, PACK_SPACE, PACK_TEXT, FONT_UI } from '@/components/pack/packTheme';
import { SosCard, sosErrCode, sosPath, useBack, useSosT } from './sosShared';
import { SosTaskShell } from './SosTaskShell';
import type { SosKey } from './sosTexts';

const SK_CENTER: [number, number] = [48.7, 19.7];

const CSS = `
.sosn-dogs{display:grid;grid-template-columns:repeat(3,1fr);gap:${PACK_SPACE.sm}px;}
.sosn-dog{display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.xs}px;min-height:96px;
  border-radius:${PACK_R.tile}px;min-width:0;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;}
.sosn-dog span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:'Cinzel Decorative','Cinzel',serif;font-weight:700;} /* písmo: meno */
.sosn-av{width:52px;height:52px;border-radius:${PACK_R.pill}px;object-fit:cover;background:${T.tileBg};border:2px solid ${T.cardEdge};flex:none;}
.sosn-map{position:relative;width:100%;height:320px;border-radius:${PACK_R.tile}px;overflow:hidden;border:1px solid ${T.border};}
.sosn-map .sosn-canvas{position:absolute;inset:0;cursor:crosshair;}
.sosn-loc{position:absolute;left:${PACK_SPACE.sm}px;top:${PACK_SPACE.sm}px;z-index:800;}
.sosn-when{display:grid;grid-template-columns:1fr 1fr;gap:${PACK_SPACE.sm}px;}
.sosn-swatch{display:inline-block;width:12px;height:12px;border-radius:${PACK_R.pill}px;border:1px solid ${T.sosRed};vertical-align:-1px;margin-right:${PACK_SPACE.xs}px;}
`;

const pad = (n: number) => String(n).padStart(2, '0');
const todayStr = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const timeStr = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function PickMap({ center, zoom, pt, onPick, locateTick }: {
  center: [number, number]; zoom: number; pt: [number, number] | null;
  onPick: (p: [number, number]) => void; locateTick: number;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layers = useRef<{ g: L.LayerGroup } | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, { zoomControl: false, attributionControl: false }).setView(center, zoom);
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer(mapyTiles('outdoor'), { maxZoom: 19 }).addTo(map);
    layers.current = { g: L.layerGroup().addTo(map) };
    map.on('click', (e: L.LeafletMouseEvent) => onPickRef.current([e.latlng.lat, e.latlng.lng]));
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // stred zvonku (GPS, výber psa) — nie pri každom prekreslení
  useEffect(() => { mapRef.current?.setView(center, zoom); }, [center, zoom, locateTick]);

  // značka + dva kruhy v SKUTOČNÝCH METROCH (L.circle): 10 km svetlý pod 500 m tmavým
  useEffect(() => {
    const map = mapRef.current; const g = layers.current?.g;
    if (!map || !g) return;
    g.clearLayers();
    if (!pt) return;
    L.circle(pt, { radius: 10000, color: T.sosRed, weight: 1.5, opacity: 0.55, fillColor: T.sosRed, fillOpacity: 0.1, interactive: false }).addTo(g);
    L.circle(pt, { radius: 500, color: T.sosRed, weight: 2, fillColor: T.sosRed, fillOpacity: 0.35, interactive: false }).addTo(g);
    L.circleMarker(pt, { radius: 6, color: '#fff', weight: 2, fillColor: T.sosRed, fillOpacity: 1, interactive: false }).addTo(g);
    if (map.getZoom() < 12) map.setView(pt, 13); // aby bol vidno aspoň 500 m kruh
  }, [pt]);

  return <div className="sosn-canvas" ref={el} />;
}

export default function PackSosNew() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const back = useBack('/pack/map');
  const [dogs, setDogs] = useState<SosDog[] | null>(null);
  const [dogsErr, setDogsErr] = useState(false);   // chyba načítania ≠ „nemáš psa“
  const [tick, setTick] = useState(0);
  const [locErr, setLocErr] = useState('');
  const [pickCountry, setPickCountry] = useState<string | null>(null);   // ISO3 z miesta straty (rgeocode)
  const pickSeq = useRef(0);
  const [dogId, setDogId] = useState<string | null>(null);
  const [pt, setPt] = useState<[number, number] | null>(null);
  const [gps, setGps] = useState<[number, number] | null>(null);
  const [locateTick, setLocateTick] = useState(0);
  const [place, setPlace] = useState('');
  const placeTouched = useRef(false);
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(timeStr());
  const [phone, setPhone] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const dog = useMemo(() => dogs?.find((d) => d.id === dogId) ?? null, [dogs, dogId]);
  const s = useSosT(dog?.dog_gender);

  useEffect(() => {
    let alive = true;
    setDogsErr(false);
    sosMyDogs().then((d) => {
      if (!alive) return;
      setDogs(d);
      setDogId((cur) => cur ?? (d.find((x) => !x.active_slug) ?? d[0])?.id ?? null);
    }).catch(() => { if (alive) { setDogs([]); setDogsErr(true); } });
    sosLastPhone().then((p) => { if (alive && p) setPhone((cur) => cur || p); }).catch(() => {});
    // GPS len ak je už povolená — povolenie sa tu nevypytuje samo (tlačidlo MOJA POLOHA to robí vedome)
    (async () => {
      try {
        const st = await navigator.permissions?.query({ name: 'geolocation' as PermissionName });
        if (st?.state === 'granted') navigator.geolocation.getCurrentPosition(
          (p) => { if (alive) { setGps([p.coords.latitude, p.coords.longitude]); setLocateTick((n) => n + 1); } }, () => {}, { timeout: 8000 });
      } catch { /* bez Permissions API zostane stred krajiny */ }
    })();
    return () => { alive = false; };
  }, [tick]);

  const center = useMemo<[number, number]>(() => gps ?? countryCentroid(dog?.country) ?? SK_CENTER, [gps, dog?.country]);
  const zoom = gps ? 14 : 7;

  // reverzný geokód: NÁVRH lokality (ručne napísané sa neprepisuje) + KRAJINA z miesta straty (isoCode → ISO3)
  const pick = useCallback((p: [number, number]) => {
    setPt(p);
    setPickCountry(null);
    setErrs((e) => { const { coords: _c, ...rest } = e; return rest; });
    const seq = ++pickSeq.current;
    fetch(`${MAPY_BASE}/v1/rgeocode?lat=${p[0]}&lon=${p[1]}&lang=${lang}&apikey=${MAPY_API_KEY}`)
      .then((r) => r.json())
      .then((d) => {
        if (seq !== pickSeq.current) return;   // novší klik medzitým
        const it = d?.items?.[0];
        if (it && !placeTouched.current) setPlace(String(it.name || it.location || ''));
        const iso = (it?.regionalStructure as Array<{ type?: string; isoCode?: string }> | undefined)?.find((x) => x.type === 'regional.country')?.isoCode;
        setPickCountry(iso ? countryISO3(iso) : null);
      })
      .catch(() => {});
  }, [lang]);

  // MOJA POLOHA: stred mapy + vybraný bod (a reverzný geokód). Zlyhanie / zamietnutie ukáže hlášku; Permissions API sa tu nepoužíva.
  const locate = () => {
    setLocErr('');
    if (!navigator.geolocation) { setLocErr(s('pack.sos.new.locFail')); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { const q: [number, number] = [p.coords.latitude, p.coords.longitude]; setGps(q); setLocateTick((n) => n + 1); pick(q); },
      (e) => setLocErr(e.code === 1 ? s('pack.sos.new.locDenied') : s('pack.sos.new.locFail')),
      { timeout: 10000, enableHighAccuracy: true });
  };

  const errText = (code: string) => {
    const k = `pack.sos.err.${code}` as SosKey;
    return ['bad_phone', 'bad_coords', 'bad_time', 'rate_limited', 'no_access', 'bad_state'].includes(code) ? s(k) : s('pack.sos.error');
  };

  // HĽADÁM ĎALEJ pri psovi s ukončeným pátraním: obnoví tú istú stratu a otvorí jej stránku
  const resumeEnded = async () => {
    if (!dog?.ended_id || !dog.ended_slug || busy) return;
    setBusy(true);
    try {
      await sosResume(dog.ended_id);
      sosInvalidate();
      navigate(sosPath.page(dog.ended_slug), { replace: true });
    } catch (x) {
      setErrs({ resume: errText(sosErrCode(x)) });
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!dog || busy) return;
    const e: Record<string, string> = {};
    if (!pt) e.coords = s('pack.sos.err.bad_coords');
    if (!place.trim()) e.place = s('pack.sos.err.place');
    const when = new Date(`${date}T${time || '00:00'}`);
    if (!date || Number.isNaN(when.getTime()) || when.getTime() > Date.now() + 5 * 60_000) e.when = s('pack.sos.err.bad_time');
    if (!phone.trim()) e.phone = s('pack.sos.err.bad_phone');
    setErrs(e);
    if (Object.keys(e).length || !pt) return;
    setBusy(true);
    try {
      const r = await sosDeclare({ dogId: dog.id, lat: pt[0], lng: pt[1], lastSeen: when, place: place.trim(), phone: phone.trim(), country: pickCountry });
      sosInvalidate();
      navigate(sosPath.page(r.slug), { replace: true });
    } catch (x) {
      const code = sosErrCode(x);
      const map: Record<string, string> = { bad_phone: 'phone', bad_coords: 'coords', bad_time: 'when' };
      setErrs({ [map[code] ?? 'form']: errText(code) });
      setBusy(false);
    }
  };

  return (
    <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      <style>{MAP_ATTR_CSS}</style>
      <SosCard>
        <h1 className="sos-h2">{s('pack.sos.new.title')}</h1>
        {dogs === null ? <p className="sos-p">{s('pack.sos.loading')}</p> : dogsErr ? (
          <>
            <p className="sos-p">{s('pack.sos.offline')}</p>
            <button type="button" className="sos-cta" onClick={() => setTick((n) => n + 1)}>{s('pack.sos.retry')}</button>
          </>
        ) : dogs.length === 0 ? (
          <p className="sos-p">{s('pack.sos.new.noDogs')}</p>
        ) : (
          <>
            <p className="sos-eyebrow">{s('pack.sos.new.pickDog')}</p>
            <div className="sosn-dogs">
              {dogs.map((d) => (
                <button key={d.id} type="button" className={`sosn-dog sos-pick${d.id === dogId ? ' is-on' : ''}`} aria-pressed={d.id === dogId} onClick={() => setDogId(d.id)}>
                  {d.photo ? <img className="sosn-av" src={sizedUrl(d.photo, 160)} alt="" /> : <span className="sosn-av" aria-hidden />}
                  <span>{d.dog_name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </SosCard>

      {dog?.active_slug ? (
        <SosCard>
          <p className="sos-p"><b>{dog.dog_name}</b> {s('pack.sos.new.searching')}</p>
          <button type="button" className="sos-cta" onClick={() => navigate(sosPath.page(dog.active_slug!))}>{s('pack.sos.new.openPage')}</button>
        </SosCard>
      ) : dog && (
        <>
          {dog.ended_slug && dog.ended_id && (
            <SosCard>
              <p className="sos-p"><b>{dog.dog_name}</b> · {s('pack.sos.new.endedHint')}</p>
              <button type="button" className="sos-cta" disabled={busy} onClick={resumeEnded}>{s('pack.sos.det.resume')}</button>
              {errs.resume && <p className="sos-err">{errs.resume}</p>}
            </SosCard>
          )}
          <SosCard>
            <h2 className="sos-h2">{s('pack.sos.new.mapTitle')}</h2>
            <p className="sos-p">{s('pack.sos.new.mapHint')}</p>
            <div className="sosn-map">
              <PickMap center={center} zoom={zoom} pt={pt} onPick={pick} locateTick={locateTick} />
              <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm sosn-loc" style={{ width: 'auto', background: T.card }} onClick={locate}>{s('pack.sos.new.myLocation')}</button>
              <MapAttribution />
            </div>
            {locErr && <p className="sos-err">{locErr}</p>}
            <p className="sos-small"><i className="sosn-swatch" style={{ background: T.sosRed }} />{s('pack.sos.new.legend')}</p>
            <p className="sos-small">{s('pack.sos.new.mapNote')}</p>
            {errs.coords && <p className="sos-err">{errs.coords}</p>}
          </SosCard>

          <SosCard>
            <label className="sos-field"><span>{s('pack.sos.new.place')}</span>
              <input className={`pf-field${errs.place ? ' is-bad' : ''}`} value={place} maxLength={200} placeholder={s('pack.sos.new.placeHint')}
                onChange={(e) => { placeTouched.current = true; setPlace(e.target.value); }} />
            </label>
            {errs.place && <p className="sos-err">{errs.place}</p>}
            <div>
              <p className="sos-eyebrow">{s('pack.sos.new.when')}</p>
              <div className="sosn-when">
                <label className="sos-field"><span>{s('pack.sos.new.date')}</span>
                  <input className={`pf-field${errs.when ? ' is-bad' : ''}`} type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} />
                </label>
                <label className="sos-field"><span>{s('pack.sos.new.time')}</span>
                  <input className={`pf-field${errs.when ? ' is-bad' : ''}`} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </label>
              </div>
              {errs.when && <p className="sos-err">{errs.when}</p>}
            </div>
            <label className="sos-field"><span>{s('pack.sos.new.phone')}</span>
              <input className={`pf-field${errs.phone ? ' is-bad' : ''}`} type="tel" inputMode="tel" autoComplete="tel" value={phone} maxLength={20}
                onChange={(e) => setPhone(e.target.value)} placeholder="+421 900 000 000" />
            </label>
            {errs.phone ? <p className="sos-err">{errs.phone}</p> : <p className="sos-small">{s('pack.sos.new.phoneHint')}</p>}
          </SosCard>

          {errs.form && <p className="sos-err">{errs.form}</p>}
          <button type="button" className="sos-cta sos-cta--red" disabled={busy} onClick={submit}>{busy ? s('pack.sos.new.sending') : s('pack.sos.new.submit')}</button>
        </>
      )}
    </SosTaskShell>
  );
}
