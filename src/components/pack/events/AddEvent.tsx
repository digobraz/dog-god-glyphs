// ADD EVENT — formulár podujatia (krok 3, plany/zadanie-eventy-2026-08-06.md §4).
// Vzor architektúry 1:1 z `../addtrip/AddTripLog.tsx` (pôvodne z `AddTripPlan.tsx`, ten je od
// 16. 9. 2026 zmazaný ako mŕtvy — archív `archiv/addtripplan-2026-09-16`): panel content, ktorý vyplní sidebar na
// desktope / fullscreen overlay na mobile — kontajner a jeho pozíciu rieši volajúci (PackMap.tsx),
// tento súbor len vypĺňa vnútro. Mapa žije v Portale (PackMap.tsx `<MapContainer>`), preto miesto
// sa vyberá cez `mapRef` — klik na mapu položí pin (rovnaká imperatívna technika ako GeometryPicker
// point-mód), text search používa ten istý `api.mapy.com/v1/suggest`, aký už beží v PackMap.tsx
// (~1822) — samostatná ľahká kópia namiesto vytiahnutia zdieľanej komponenty (search box tam je
// vnorený priamo v JSX PackMapu, nie samostatný export; extrakcia by bola refaktor mimo zadania).
//
// VLNA 2 (25. 9. 2026, plany/zadanie-podujatia-funkcne-2026-09-24.md §5.4):
//   · zápis do DB cez `eventStore.saveEvent` (volá PackMap); pri chybe formulár OSTANE vyplnený
//     a povie prečo
//   · ÚPRAVA existujúceho podujatia (`initial`) — ten istý formulár, nie druhá obrazovka
//   · FOTKA sa nahráva na Cloudinary (unsigned preset ako výlety) pod `pack-events/<id>/`;
//     `id` vzniká tu v prehliadači, lebo fotka ide skôr než riadok
//   · TIP: po vložení odkazu sa volá edge `event-link-preview` a predvyplní fakty (názov,
//     termín, miesto, organizátor). Facebook dnu nepustí → človek doplní ručne.
//   · tvrdá duplicita (`source_url` už máme) → „už ho máme" + ukázať existujúce
import { useEffect, useMemo, useRef, useState } from 'react';
import { optimizePhoto } from '@/components/pack/addtrip/photoOptimize';
import { uploadEventPhoto } from '@/services/cloudinaryService';
import { previewLink, isoToLocalInput, type EventItem } from './eventStore';
import type { MutableRefObject } from 'react';
import L from 'leaflet';
import type { LatLngTuple, Map as LeafletMap } from 'leaflet';
import { PACK_THEME as T, FONT_TITLE, FONT_UI, GOLD_BTN } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import { trailCountry } from '@/lib/countryGeo';
import { MAPY_API_KEY, MAPY_BASE } from '@/lib/env';
import { BackButton } from '@/components/pack/BackButton';
import { MAP_SKIN, PALE, LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import {
  EVENT_KINDS, EVENT_KIND_LABEL_KEYS, missingEventFields, endsBeforeStarts, normalizeSourceUrl,
  type AddEventDraft, type EventKind, type EventOrigin,
} from './eventModel';

const GOLD = T.cardEdge;
const GOLD_BRIGHT = '#F5C73D';

/** Výsledok zápisu, ako ho formulár potrebuje: chyba nesie i18n kľúč, duplicita id pôvodného. */
export type AddEventOutcome = { ok: true } | { ok: false; errorKey: string; duplicateId?: string };

export type AddEventProps = {
  origin: EventOrigin;
  authorName: string;
  /** Zápis do DB robí volajúci. Pri chybe formulár zostane otvorený a ukáže prečo. */
  onSubmit: (draft: AddEventDraft, existingId?: string) => Promise<AddEventOutcome>;
  onClose: () => void;
  /** Úprava existujúceho podujatia — formulár sa predvyplní a zápis ide do toho istého riadku. */
  initial?: EventItem;
  /** „už ho máme" → ukáž pôvodné podujatie (volajúci zavrie formulár a otvorí kartu). */
  onShowExisting?: (id: string) => void;
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

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const r = await fetch(dataUrl);
  return r.blob();
}

export function AddEvent({ origin: originProp, authorName, onSubmit, onClose, mapRef, initial, onShowExisting }: AddEventProps) {
  const t = useT();
  const origin: EventOrigin = initial?.origin ?? originProp;
  // id ročníka vzniká TU — fotka sa nahráva pod `pack-events/<id>/` skôr, než existuje riadok.
  const [eventId] = useState<string>(() => initial?.id ?? (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))));
  const [title, setTitle] = useState(initial?.title ?? '');
  const [kind, setKind] = useState<EventKind>(initial?.kind ?? 'social_walk');
  const [startsAt, setStartsAt] = useState(initial?.startsAt ?? '');
  const [endsAt, setEndsAt] = useState(initial?.endsAt ?? '');
  const [endsTouched, setEndsTouched] = useState(!!initial);
  const [venueName, setVenueName] = useState(initial?.venueName ?? '');
  const [center, setCenter] = useState<LatLngTuple | undefined>(initial?.center);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? '');
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? '');
  const [organizerCredit, setOrganizerCredit] = useState(initial?.organizerCredit ?? '');
  const [submitError, setSubmitError] = useState('');
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoRef = useRef<HTMLInputElement | null>(null);
  // Predvyplnenie z odkazu: stav + ktoré polia prišli z webu (tie sa zvýraznia „skontroluj").
  const [linkState, setLinkState] = useState<'idle' | 'loading' | 'filled' | 'facebook' | 'manual'>('idle');
  const [fromLink, setFromLink] = useState<Set<string>>(new Set());
  const lastPreviewed = useRef('');

  // §4: „Ends default = starts" — kým človek endsAt sám neupraví, drží krok so startsAt.
  useEffect(() => {
    if (!endsTouched) setEndsAt(startsAt);
  }, [startsAt, endsTouched]);

  const country = useMemo(() => trailCountry({ path: center ? [center] : [] }), [center]);

  // ── vyhľadávanie miesta (Mapy.com Suggest) — rovnaký endpoint ako PackMap.tsx, samostatná
  // ľahká kópia (debounce 250 ms, guard proti dofetchnutiu po výbere). ──────────────────────
  const [suggestions, setSuggestions] = useState<PlaceSug[]>([]);
  // Pri úprave je miesto už vybraté — bez toho by sa hneď po otvorení vysypal našeptávač.
  const pickedRef = useRef(initial?.venueName ?? '');
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
      id: eventId,
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
      // Schéma sa dopĺňa TU, nie pri vykreslení karty — do úložiska má ísť odkaz, ktorý
      // niekam vedie. Karta z neho robí `<a href>` a bez schémy by ho prehliadač
      // vyhodnotil relatívne, teda dovnútra našej vlastnej appky (viď `normalizeSourceUrl`).
      sourceUrl: origin === 'tip' ? normalizeSourceUrl(sourceUrl) : undefined,
      organizerCredit: origin === 'tip' ? (organizerCredit.trim() || undefined) : undefined,
      authorName,
      createdAt: now,
      updatedAt: now,
    };
  }, [eventId, origin, title, kind, startsAt, endsAt, venueName, center, country, description, photoUrl, sourceUrl, organizerCredit, authorName]);

  const missing = missingEventFields(draft);
  // Zle usporiadaný rozsah NIE JE chýbajúce pole — má vlastnú vetu, nie riadok v zozname
  // „chýba: …" (ten by nad vyplneným poľom hovoril nepravdu).
  const dateBad = endsBeforeStarts(draft);
  const canSubmit = missing.length === 0 && !dateBad;
  const missingLabel = missing.map((f) => t(FIELD_LABEL_KEYS[f] ?? f)).join(', ');

  const handleSubmit = async () => {
    if (!canSubmit || busy) return;
    setSubmitError('');
    setDuplicateId(null);
    setBusy(true);
    const r = await onSubmit(draft, initial?.id);
    setBusy(false);
    if (r.ok) return;
    // projekt nemá strictNullChecks, takže zúženie únie cez `ok` nefunguje — pretypovanie
    const fail = r as { ok: false; errorKey: string; duplicateId?: string };
    setSubmitError(t(fail.errorKey));
    if (fail.duplicateId) setDuplicateId(fail.duplicateId);
  };

  // ── FOTKA — len vlastné podujatie (cudziu fotku nikdy, §4.3) ─────────────────────────────
  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setPhotoBusy(true);
    setSubmitError('');
    try {
      const small = await optimizePhoto(f);
      if (!small) throw new Error('photo');
      const up = await uploadEventPhoto(await dataUrlToBlob(small), eventId, `cover-${Date.now()}`);
      setPhotoUrl(up.secureUrl);
    } catch {
      setSubmitError(t('pack.event.errorPhoto'));
    } finally {
      setPhotoBusy(false);
    }
  };

  // ── ODKAZ → FAKTY (edge `event-link-preview`) ────────────────────────────────────────────
  // Volá sa pri opustení poľa, nie pri každom písmene. Vyplní LEN prázdne polia — čo človek
  // napísal sám, sa neprepisuje.
  const runPreview = async () => {
    const url = normalizeSourceUrl(sourceUrl);
    if (!url || url === lastPreviewed.current) return;
    lastPreviewed.current = url;
    setLinkState('loading');
    const r = await previewLink(url);
    if (!r.ok) {
      setLinkState(r.reason === 'facebook' ? 'facebook' : 'manual');
      return;
    }
    const got = new Set<string>();
    if (r.title && !title.trim()) { setTitle(r.title); got.add('title'); }
    if (r.startsAt && !startsAt) { setStartsAt(isoToLocalInput(r.startsAt)); got.add('startsAt'); }
    if (r.endsAt && !endsTouched) { setEndsAt(isoToLocalInput(r.endsAt)); setEndsTouched(true); }
    if (r.venueName && !venueName.trim()) {
      setVenueName(r.venueName);
      got.add('location');
      if (Number.isFinite(r.lat) && Number.isFinite(r.lng)) {
        pickedRef.current = r.venueName;
        setCenter([r.lat as number, r.lng as number]);
        mapRef.current?.flyTo([r.lat as number, r.lng as number], 14, { duration: 1.2 });
      }
    }
    if (r.organizer && !organizerCredit.trim()) { setOrganizerCredit(r.organizer); got.add('organizer'); }
    setFromLink(got);
    setLinkState(got.size ? 'filled' : 'manual');
  };
  const filledCls = (f: string) => (fromLink.has(f) ? ' aev-filled' : '');

  return (
    <div className="aev-root">
      <style>{AEV_CSS}</style>
      <style>{PALE_AEV_CSS}</style>
      <div className="aev-head">
        <BackButton tone={MAP_SKIN === 'pale' ? 'pale' : 'dark'} onClick={onClose} label={t('pack.addEvent.backAriaLabel')} />
        <div className="aev-title">{initial ? t('pack.event.editTitle') : origin === 'own' ? t('pack.addEvent.title.own') : t('pack.addEvent.title.tip')}</div>
      </div>
      <div className="aev-body">
        {/* TIP začína ODKAZOM — z neho sa predvyplní zvyšok, takže patrí na začiatok. */}
        {origin === 'tip' && (
          <div className="aev-field">
            <label>{t('pack.addEvent.sourceUrlLabel')}</label>
            <input
              className="aev-input"
              value={sourceUrl}
              inputMode="url"
              onChange={(e) => setSourceUrl(e.target.value)}
              onBlur={() => void runPreview()}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void runPreview(); } }}
              placeholder={t('pack.addEvent.sourceUrlPlaceholder')}
            />
            <p className="aev-hint">
              {linkState === 'loading' ? t('pack.event.linkLoading')
                : linkState === 'filled' ? t('pack.event.linkFilled')
                : linkState === 'facebook' ? t('pack.event.linkFacebook')
                : linkState === 'manual' ? t('pack.event.linkManual')
                : t('pack.addEvent.sourceUrlHint')}
            </p>
          </div>
        )}
        <div className="aev-field">
          <label>{t('pack.addEvent.titleLabel')}</label>
          <input
            className={`aev-input${filledCls('title')}`}
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
              className={`aev-input${filledCls('startsAt')}`}
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>
          <div className="aev-field">
            <label>{t('pack.addEvent.endsLabel')}</label>
            {/* `min` drží len klikanie v kalendári — vpísaný či vložený text ním
                neprejde, preto to isté pravidlo stráži aj `endsBeforeStarts` nad CTA. */}
            <input
              type="datetime-local"
              className="aev-input"
              min={startsAt || undefined}
              value={endsAt}
              onChange={(e) => { setEndsAt(e.target.value); setEndsTouched(true); }}
            />
          </div>
        </div>

        <div className="aev-field">
          <label>{t('pack.addEvent.venueLabel')}</label>
          <div className="aev-venuebox" ref={venueBoxRef}>
            <input
              className={`aev-input${filledCls('location')}`}
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
            <input ref={photoRef} type="file" accept="image/*" hidden onChange={(e) => void pickPhoto(e)} />
            {photoUrl && <div className="aev-photo"><img src={photoUrl} alt="" /></div>}
            <button type="button" className="aev-pill" disabled={photoBusy} onClick={() => photoRef.current?.click()}>
              {photoBusy ? t('pack.event.photoUploading') : photoUrl ? t('pack.event.photoChange') : t('pack.event.photoAdd')}
            </button>
          </div>
        )}

        {origin === 'tip' && (
          <>
            <div className="aev-field">
              <label>{t('pack.addEvent.organizerLabel')}</label>
              <input
                className={`aev-input${filledCls('organizer')}`}
                value={organizerCredit}
                onChange={(e) => setOrganizerCredit(e.target.value)}
                placeholder={t('pack.addEvent.organizerPlaceholder')}
              />
            </div>
          </>
        )}
      </div>
      <div className="aev-foot">
        <button type="button" className="btn-gold" disabled={!canSubmit || busy || photoBusy} onClick={() => void handleSubmit()}>
          {busy ? t('pack.event.saving') : initial ? t('pack.event.saveChanges') : t('pack.addEvent.submit')}
        </button>
        {/* ⚠️ DVE RÔZNE PREKÁŽKY, DVE RÔZNE VETY. `missingHint` vypisuje zoznam chýbajúcich
            polí — pri zle usporiadanom rozsahu je ten zoznam PRÁZDNY, takže by pod
            formulárom stálo „chýba:" a nič za tým. Poradie vetiev je zámerné: kým niečo
            chýba, o dátumoch nemá zmysel hovoriť. */}
        {missing.length > 0
          ? <p className="aev-hint aev-hint-center">{t('pack.addEvent.missingHint', { fields: missingLabel })}</p>
          : dateBad && <p className="aev-error">{t('pack.addEvent.datesHint')}</p>}
        {submitError && <p className="aev-error">{submitError}</p>}
        {duplicateId && onShowExisting && (
          <button type="button" className="aev-pill" onClick={() => onShowExisting(duplicateId)}>{t('pack.event.showExisting')}</button>
        )}
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
  width:100%;padding:13px;background:${GOLD_BTN.grad};
  border:1px solid ${GOLD_BTN.edge};border-radius:8px;color:#000;font-family:${FONT_TITLE};
  font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;
  box-shadow:${GOLD_BTN.glow};
  transition:transform .2s,box-shadow .22s,opacity .22s;
}
.aev-foot .btn-gold:hover:not(:disabled){transform:scale(1.02);box-shadow:${GOLD_BTN.glowHover};}
.aev-foot .btn-gold:disabled{opacity:.45;cursor:default;box-shadow:none;}
.aev-error{margin:0;font-family:${FONT_UI};font-size:11.5px;color:#E08A6E;text-align:center;}
@media (max-width:640px){
  .aev-row2{grid-template-columns:1fr;}
}
`;

// ── BLEDÝ (PAPYRUSOVÝ) PREPIS — 2026-09-13 ───────────────────────────────────────────────
// Matej zo screenshotu /pack/map: „je vidno že je zlá farba textu aj CTA."
// PRÍČINA: formulár bol písaný pre TMAVÝ povrch Portalu (T.onDark*), ale `.trp-addhost` je od
// redizajnu mapy papyrusová doska (goldFrameCSS v PackMap.tsx) — svetlý text na svetlom
// podklade zmizol. `AddTripLog` má na to `PALE_LOG_CSS`; toto je tá istá vec pre podujatia.
//
// ⚠️ BEZ MEDIA QUERY, zámerne. Chrome mapy je bledý na KAŽDEJ šírke (usePaleChrome.ts,
// 28. 8. 2026) — druhá kópia farieb pre mobil by sa rozišla pri prvej úprave.
// ⚠️ Vkladá sa ako DRUHÝ <style>, teda za AEV_CSS: pri rovnakej špecificite (0-1-0) rozhoduje
// poradie v DOM. Prepínač späť na tmavé sklo je `MAP_SKIN` v navGoldSkin.ts, nie zmazanie.
//
// Plochy podľa matrice PACK_BOX: pole = úroveň 5 (plochý papyrus `PALE.field`), pilulka = 5.
// CTA je LAPIS — na papyruse je zlatá naraz rámom, doskou aj tlačidlom (ten istý dôvod
// a ten istý zápis ako `.atl-log-foot .btn-gold` v AddTripLog).
const PALE_AEV_CSS = MAP_SKIN !== 'pale' ? '' : `
.aev-title{color:${PALE.ink};}
.aev-field label{color:${PALE.dim};}
.aev-input{background:${PALE.field};border-color:${PALE.border};color:${PALE.ink};}
.aev-input:focus{border-color:${PALE.edge};}
.aev-input::placeholder{color:${PALE.faint};}
.aev-pill{background:${PALE.soft};border-color:${PALE.border};color:${PALE.dim};}
.aev-pill:hover{border-color:${PALE.edge};color:${PALE.ink};}
/* Vybraná pilulka = priesvitný tint, nie plná farba (LOCKED 2026-08-26) — plná výplň je
   vyhradená jedinému hlavnému CTA na doske, a to je PRIDAŤ PODUJATIE dole. */
.aev-pill.on{background:rgba(201,154,63,0.22);border-color:${PALE.edge};color:${PALE.ink};}
.aev-suggest{background:${T.card};border-color:${PALE.border};box-shadow:0 12px 32px rgba(122,90,42,0.28);}
.aev-suggest-item{border-bottom-color:${PALE.hair};}
.aev-suggest-item:hover{background:rgba(201,154,63,0.12);}
.aev-suggest-name{color:${PALE.ink};}
.aev-suggest-sub{color:${PALE.dim};}
.aev-hint{color:${PALE.dim};}
.aev-foot .btn-gold{background:${LAPIS.grad};border-color:${LAPIS.deep};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};}
.aev-foot .btn-gold:hover:not(:disabled){background:${LAPIS.gradHover};box-shadow:${LAPIS_BTN_SHADOW};}
.aev-foot .btn-gold:disabled{box-shadow:none;}
.aev-error{color:#8E2A20;}
/* Pole doplnené z odkazu — LAPIS (moja voľba: skontrolovať), nie chyba. */
.aev-filled{border-color:${LAPIS.edge};}
.aev-photo{height:120px;border-radius:12px;overflow:hidden;margin-bottom:8px;border:1px solid ${PALE.border};}
.aev-photo img{width:100%;height:100%;object-fit:cover;display:block;}
`;

export default AddEvent;
