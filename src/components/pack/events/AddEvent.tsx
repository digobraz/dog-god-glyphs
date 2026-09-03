// ADD EVENT — formulár podujatia (krok 3, plany/zadanie-eventy-2026-08-06.md §4).
// Vzor architektúry 1:1 z `../addtrip/AddTripPlan.tsx`: panel content, ktorý vyplní sidebar na
// desktope / fullscreen overlay na mobile — kontajner a jeho pozíciu rieši volajúci (PackMap.tsx),
// tento súbor len vypĺňa vnútro. Mapa žije v Portale (PackMap.tsx `<MapContainer>`), preto miesto
// sa vyberá cez `mapRef` — klik na mapu položí pin (rovnaká imperatívna technika ako GeometryPicker
// point-mód), text search používa ten istý `api.mapy.com/v1/suggest`, aký už beží v PackMap.tsx
// (~1822) — samostatná ľahká kópia namiesto vytiahnutia zdieľanej komponenty (search box tam je
// vnorený priamo v JSX PackMapu, nie samostatný export; extrakcia by bola refaktor mimo zadania).
//
// KROK 4 (mimo rozsahu tohto kroku): automatické predvyplnenie z `sourceUrl` (JSON-LD/OG čítanie
// odkazu, kontrola duplicity, Anubis). Tu sa `sourceUrl` len ULOŽÍ — človek vyplní zvyšok ručne.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import L from 'leaflet';
import type { LatLngTuple, Map as LeafletMap } from 'leaflet';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import { trailCountry } from '@/lib/countryGeo';
import { MAPY_API_KEY, MAPY_BASE } from '@/lib/env';
import { BackButton } from '@/components/pack/BackButton';
import {
  EVENT_KINDS, EVENT_KIND_LABEL_KEYS, missingEventFields,
  type AddEventDraft, type EventKind, type EventOrigin,
} from './eventModel';

const GOLD = '#C99A3F';
const GOLD_BRIGHT = '#F5C73D';

export type AddEventProps = {
  origin: EventOrigin;
  authorName: string;
  /** false = zlyhal zápis (napr. plná kvóta) — formulár zostane otvorený, ukáže chybu. */
  onSubmit: (draft: AddEventDraft) => boolean;
  onClose: () => void;
  /** Mapa žije v PackMap.tsx — tento komponent ju nevytvára, len dostane ref (rovnaký kontrakt
   *  ako GeometryPicker) a kreslí do nej pin imperatívne cez Leaflet API. */
  mapRef: MutableRefObject<LeafletMap | null>;
};

type PlaceSug = { name: string; sub: string; lat: number; lon: number };

// missingEventFields() vracia field ID-čka (eventModel.ts nevie o i18n) — tu sa mapujú na
// preložené labely pre nápovedu pri disabled submite, vzor `FIELD_LABEL` v addTripModel.ts.
const FIELD_LABEL_KEYS: Record<string, string> = {
  title: 'pack.addEvent.fieldTitle',
  kind: 'pack.addEvent.fieldKind',
  startsAt: 'pack.addEvent.fieldStarts',
  location: 'pack.addEvent.fieldLocation',
  sourceUrl: 'pack.addEvent.fieldLink',
};

export function AddEvent({ origin, authorName, onSubmit, onClose, mapRef }: AddEventProps) {
  const t = useT();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<EventKind>('social_walk');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [endsTouched, setEndsTouched] = useState(false);
  const [venueName, setVenueName] = useState('');
  const [center, setCenter] = useState<LatLngTuple | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [organizerCredit, setOrganizerCredit] = useState('');
  const [submitError, setSubmitError] = useState('');

  // §4: „Ends default = starts" — kým človek endsAt sám neupraví, drží krok so startsAt.
  useEffect(() => {
    if (!endsTouched) setEndsAt(startsAt);
  }, [startsAt, endsTouched]);

  const country = useMemo(() => trailCountry({ path: center ? [center] : [] }), [center]);

  // ── vyhľadávanie miesta (Mapy.com Suggest) — rovnaký endpoint ako PackMap.tsx, samostatná
  // ľahká kópia (debounce 250 ms, guard proti dofetchnutiu po výbere). ──────────────────────
  const [suggestions, setSuggestions] = useState<PlaceSug[]>([]);
  const pickedRef = useRef('');
  const venueBoxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const q = venueName.trim();
    if (q.length < 2) { setSuggestions([]); return; }
    if (pickedRef.current === q) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const url = `${MAPY_BASE}/v1/suggest?query=${encodeURIComponent(q)}&lang=en&limit=6&apikey=${MAPY_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        const items: PlaceSug[] = (data.items || [])
          .map((it: { name?: string; label?: string; location?: string; position?: { lat?: number; lon?: number } }) => ({
            name: it.name || '',
            sub: [it.label, it.location].filter(Boolean).join(' · '),
            lat: it.position?.lat as number,
            lon: it.position?.lon as number,
          }))
          .filter((x: PlaceSug) => Number.isFinite(x.lat) && Number.isFinite(x.lon));
        setSuggestions(items);
      } catch { setSuggestions([]); }
    }, 250);
    return () => clearTimeout(timer);
  }, [venueName]);

  useEffect(() => {
    if (suggestions.length === 0) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!venueBoxRef.current?.contains(e.target as Node)) setSuggestions([]);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSuggestions([]); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [suggestions.length]);

  const pickSuggestion = (s: PlaceSug) => {
    pickedRef.current = s.name;
    setVenueName(s.name);
    setCenter([s.lat, s.lon]);
    setSuggestions([]);
    mapRef.current?.flyTo([s.lat, s.lon], 14, { duration: 1.2 });
  };

  // ── klik do mapy = položí pin priamo (rovnaká imperatívna technika ako GeometryPicker) ───
  const clickRef = useRef((lat: number, lng: number) => { setCenter([lat, lng]); });
  useEffect(() => { clickRef.current = (lat: number, lng: number) => setCenter([lat, lng]); }, []);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onClick = (e: L.LeafletMouseEvent) => clickRef.current(e.latlng.lat, e.latlng.lng);
    map.on('click', onClick);
    return () => { map.off('click', onClick); };
  }, [mapRef]);

  // pin vrstva — imperatívne, rovnaký vzor ako GeometryPicker point-mód (GOLD_BRIGHT bod).
  const markerRef = useRef<L.CircleMarker | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null; }
    if (center) {
      const m = L.circleMarker(center, { radius: 7, color: '#000', weight: 2, fillColor: GOLD_BRIGHT, fillOpacity: 1, interactive: false });
      m.addTo(map);
      markerRef.current = m;
    }
    return () => {
      if (markerRef.current && mapRef.current) { mapRef.current.removeLayer(markerRef.current); markerRef.current = null; }
    };
  }, [center, mapRef]);

  const draft = useMemo<AddEventDraft>(() => {
    const now = Date.now();
    return {
      id: `event-${now}`,
      origin,
      title: title.trim(),
      kind,
      startsAt,
      endsAt: endsAt || startsAt,
      venueName: venueName.trim(),
      center,
      country,
      description: description.trim() || undefined,
      photoUrl: origin === 'own' ? (photoUrl.trim() || undefined) : undefined,
      sourceUrl: origin === 'tip' ? sourceUrl.trim() : undefined,
      organizerCredit: origin === 'tip' ? (organizerCredit.trim() || undefined) : undefined,
      authorName,
      createdAt: now,
      updatedAt: now,
    };
  }, [origin, title, kind, startsAt, endsAt, venueName, center, country, description, photoUrl, sourceUrl, organizerCredit, authorName]);

  const missing = missingEventFields(draft);
  const canSubmit = missing.length === 0;
  const missingLabel = missing.map((f) => t(FIELD_LABEL_KEYS[f] ?? f)).join(', ');

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitError('');
    const ok = onSubmit(draft);
    if (!ok) setSubmitError(t('pack.addEvent.submitError'));
  };

  return (
    <div className="aev-root">
      <style>{AEV_CSS}</style>
      <div className="aev-head">
        <BackButton tone="dark" onClick={onClose} label={t('pack.addEvent.backAriaLabel')} />
        <div className="aev-title">{origin === 'own' ? t('pack.addEvent.title.own') : t('pack.addEvent.title.tip')}</div>
      </div>
      <div className="aev-body">
        <div className="aev-field">
          <label>{t('pack.addEvent.titleLabel')}</label>
          <input
            className="aev-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('pack.addEvent.titlePlaceholder')}
          />
        </div>

        <div className="aev-field">
          <label>{t('pack.addEvent.kindLabel')}</label>
          <div className="aev-pills">
            {EVENT_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                className={`aev-pill${kind === k ? ' on' : ''}`}
                onClick={() => setKind(k)}
              >{t(EVENT_KIND_LABEL_KEYS[k])}</button>
            ))}
          </div>
        </div>

        <div className="aev-row2">
          <div className="aev-field">
            <label>{t('pack.addEvent.startsLabel')}</label>
            <input
              type="datetime-local"
              className="aev-input"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>
          <div className="aev-field">
            <label>{t('pack.addEvent.endsLabel')}</label>
            <input
              type="datetime-local"
              className="aev-input"
              value={endsAt}
              onChange={(e) => { setEndsAt(e.target.value); setEndsTouched(true); }}
            />
          </div>
        </div>

        <div className="aev-field">
          <label>{t('pack.addEvent.venueLabel')}</label>
          <div className="aev-venuebox" ref={venueBoxRef}>
            <input
              className="aev-input"
              value={venueName}
              onChange={(e) => { setVenueName(e.target.value); pickedRef.current = ''; }}
              placeholder={t('pack.addEvent.venuePlaceholder')}
            />
            {suggestions.length > 0 && (
              <div className="aev-suggest">
                {suggestions.map((s, i) => (
                  <button key={i} type="button" className="aev-suggest-item" onClick={() => pickSuggestion(s)}>
                    <span className="aev-suggest-name">{s.name}</span>
                    {s.sub && <span className="aev-suggest-sub">{s.sub}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="aev-hint">
            {center
              ? t('pack.addEvent.venueSet', { lat: center[0].toFixed(4), lng: center[1].toFixed(4) })
              : t('pack.addEvent.venueHintMap')}
          </p>
        </div>

        <div className="aev-field">
          <label>{t('pack.addEvent.descriptionLabel')}</label>
          <textarea
            className="aev-input aev-textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={origin === 'own' ? t('pack.addEvent.descriptionPlaceholderOwn') : t('pack.addEvent.descriptionPlaceholderTip')}
          />
        </div>

        {origin === 'own' && (
          <div className="aev-field">
            <label>{t('pack.addEvent.photoLabel')}</label>
            <input
              className="aev-input"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder={t('pack.addEvent.photoPlaceholder')}
            />
          </div>
        )}

        {origin === 'tip' && (
          <>
            <div className="aev-field">
              <label>{t('pack.addEvent.sourceUrlLabel')}</label>
              <input
                className="aev-input"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder={t('pack.addEvent.sourceUrlPlaceholder')}
              />
              <p className="aev-hint">{t('pack.addEvent.sourceUrlHint')}</p>
            </div>
            <div className="aev-field">
              <label>{t('pack.addEvent.organizerLabel')}</label>
              <input
                className="aev-input"
                value={organizerCredit}
                onChange={(e) => setOrganizerCredit(e.target.value)}
                placeholder={t('pack.addEvent.organizerPlaceholder')}
              />
            </div>
          </>
        )}
      </div>
      <div className="aev-foot">
        <button type="button" className="btn-gold" disabled={!canSubmit} onClick={handleSubmit}>
          {t('pack.addEvent.submit')}
        </button>
        {!canSubmit && <p className="aev-hint aev-hint-center">{t('pack.addEvent.missingHint', { fields: missingLabel })}</p>}
        {submitError && <p className="aev-error">{submitError}</p>}
      </div>
    </div>
  );
}

// CTA (LOCKED §8): .btn-gold lokálna kópia zo SpiralLanding.css hodnôt — rovnaký zavedený vzor
// ako AddTripPlan.tsx (`.att-plan-foot .btn-gold`), tmavý povrch → gradient/border/shadow 1:1.
const AEV_CSS = `
.aev-root{display:flex;flex-direction:column;height:100%;min-height:0;}
.aev-head{display:flex;align-items:center;gap:10px;padding:16px 20px 10px;flex-shrink:0;}
.aev-title{font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:${T.onDark};}
.aev-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:4px 20px 16px;display:flex;flex-direction:column;gap:14px;}
.aev-field label{display:block;font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};margin-bottom:6px;}
.aev-input{width:100%;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:9px;padding:9px 11px;color:${T.onDark};font-family:${FONT_UI};font-size:12.5px;outline:0;}
.aev-input:focus{border-color:${GOLD};}
.aev-input::placeholder{color:${T.onDarkDim};}
.aev-textarea{resize:vertical;font-family:${FONT_UI};}
.aev-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.aev-pills{display:flex;flex-wrap:wrap;gap:6px;}
.aev-pill{font-family:${FONT_UI};font-weight:500;font-size:11px;letter-spacing:.03em;padding:8px 12px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};color:${T.onDarkDim};cursor:pointer;}
.aev-pill.on{background:rgba(201,154,63,0.14);border-color:${GOLD};color:${T.onDark};}
.aev-pill:hover{border-color:${GOLD};}
.aev-venuebox{position:relative;}
.aev-suggest{position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:5;background:rgba(6,5,3,0.97);border:1px solid ${T.onDarkBorder};border-radius:10px;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,0.5);}
.aev-suggest-item{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;padding:9px 11px;background:transparent;border:0;border-bottom:1px solid ${T.onDarkHair};cursor:pointer;text-align:left;}
.aev-suggest-item:last-child{border-bottom:0;}
.aev-suggest-item:hover{background:rgba(201,154,63,0.10);}
.aev-suggest-name{font-family:${FONT_UI};font-size:12.5px;font-weight:500;color:${T.onDark};}
.aev-suggest-sub{font-family:${FONT_UI};font-size:11px;color:${T.onDarkDim};}
.aev-hint{margin:8px 0 0;font-family:${FONT_UI};font-size:11.5px;color:${T.onDarkDim};font-style:italic;}
.aev-hint-center{text-align:center;font-style:normal;}
.aev-foot{flex-shrink:0;margin:0 20px 20px;display:flex;flex-direction:column;gap:8px;}
.aev-foot .btn-gold{
  width:100%;padding:13px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border:1px solid rgba(250,244,236,0.30);border-radius:8px;color:#000;font-family:${FONT_TITLE};
  font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;
  box-shadow:0 0 40px rgba(230,158,26,0.4),inset 0 1px 0 rgba(255,255,255,0.3);
  transition:transform .2s,box-shadow .22s,opacity .22s;
}
.aev-foot .btn-gold:hover:not(:disabled){transform:scale(1.02);box-shadow:0 0 56px rgba(230,158,26,0.55),inset 0 1px 0 rgba(255,255,255,0.3);}
.aev-foot .btn-gold:disabled{opacity:.45;cursor:default;box-shadow:none;}
.aev-error{margin:0;font-family:${FONT_UI};font-size:11.5px;color:#E08A6E;text-align:center;}
@media (max-width:640px){
  .aev-row2{grid-template-columns:1fr;}
}
`;

export default AddEvent;
