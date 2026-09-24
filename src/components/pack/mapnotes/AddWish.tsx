// ============================================================================
// + PRIDAŤ PRIANIE — sprievodca AINUBIS nad mapou (BUDDY krok 2, 24. 9. 2026)
//
// Matej 24. 9.: *„musí to byť extrémne jednoduché — AINUBIS zahlási: vyber miesto, kam si
// chcel ísť — miesto, vrchol, mesto, štát… druh, kedy, popis… pripnúť"*.
// Hlášky: `plany/nakres-buddy-hlasky-2026-09-24.html`, sekcia A (A1–A5).
//
// ── ŽIADNY FORMULÁR ─────────────────────────────────────────────────────────
// Hovorí AINUBIS (tá istá bublina ako pri odkaze a výlete, `AinubisGuide`) a pod ňou stojí
// vždy len JEDNA vec, ktorú treba spraviť. Mapa ostáva celá viditeľná — prianie je miesto
// a človek ho má vidieť, keď ho vyberá.
//
// Farby pod bublinou sú AINUBISOVE (`ainubisSkin.ts`): sedíme na jeho tmavom závoji, nie
// na papyruse, a CTA je jeho zlato-oranžové. Lapis by na tmavomodrom podklade zanikol.
//
// Miesto sa vyberá VYHĽADÁVANÍM (Mapy.com), nie ťuknutím do mapy: prianie potrebuje meno
// („Nórsko", „Rysy") a spätné geokódovanie appka nemá. Ťuk do mapy môže pribudnúť neskôr.
// ============================================================================
import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { FONT_UI } from '@/components/pack/packTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { useT } from '@/i18n/LanguageContext';
import { AinubisGuide } from '@/components/pack/addtrip/AinubisGuide';
import { PlaceSearch, type PlaceSug } from '@/components/pack/addtrip/PlaceSearch';
import { BackIcon } from '@/components/pack/BackButton';
import { WISH_EMOJI } from './markEmoji';
import {
  WISH_TRIP_KINDS, WISH_WHENS, addWishPin, placeKindFromMapy, zoomForPlaceKind,
  type WishPlaceKind, type WishTripKind, type WishWhen,
} from './wishData';

type Step = 'place' | 'kind' | 'when' | 'note' | 'done';
export type WishDraftPoint = { lat: number; lon: number } | null;

const NOTE_MAX = 140;

export function AddWish({ map, onDraft, onSaved, onCancel, edgeLeft }: {
  map: LeafletMap | null;
  /** Kde má mapa ukázať rozpracovaný 🍑 (null = nikde). */
  onDraft: (p: WishDraftPoint) => void;
  onSaved: () => void;
  onCancel: () => void;
  edgeLeft?: boolean;
}) {
  const t = useT();
  const mapRef = useRef<LeafletMap | null>(map);
  mapRef.current = map;

  const [step, setStep] = useState<Step>('place');
  const [place, setPlace] = useState<{ name: string; lat: number; lon: number; kind: WishPlaceKind; country: string | null } | null>(null);
  const [kind, setKind] = useState<WishTripKind | null>(null);
  const [when, setWhen] = useState<WishWhen | null>(null);
  const [note, setNote] = useState('');
  const [seeking, setSeeking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Rozpracovaný pin zmizne s tokom — aj keď sa zavrie inak než tlačidlom.
  useEffect(() => () => onDraft(null), [onDraft]);

  const pickPlace = (s: PlaceSug) => {
    const k = placeKindFromMapy(s.type);
    setPlace({ name: s.name, lat: s.lat, lon: s.lon, kind: k, country: s.country ?? null });
    onDraft({ lat: s.lat, lon: s.lon });
    // PlaceSearch priletí na z14; štát a kraj treba vidieť celý.
    mapRef.current?.setView([s.lat, s.lon], zoomForPlaceKind(k));
    setStep('kind');
  };

  const back = () => {
    setErr(null);
    if (step === 'kind') { setStep('place'); setPlace(null); onDraft(null); return; }
    if (step === 'when') { setStep('kind'); return; }
    if (step === 'note') { setStep('when'); return; }
    onCancel();
  };

  const save = async () => {
    if (!place || !kind || !when) return;
    setBusy(true); setErr(null);
    try {
      await addWishPin({
        lat: place.lat, lon: place.lon, placeName: place.name, placeKind: place.kind, countryCode: place.country,
        tripKind: kind, when, seeking, note: note.trim() ? note.trim().slice(0, NOTE_MAX) : null,
      });
      setStep('done');
      onDraft(null);
      onSaved();
    } catch {
      setErr(t('pack.wish.failed'));
    } finally {
      setBusy(false);
    }
  };

  const text =
    step === 'place' ? t('pack.wish.guide.place')
      : step === 'kind' ? t('pack.wish.guide.kind', { place: place?.name ?? '' })
        : step === 'when' ? t('pack.wish.guide.when')
          : step === 'note' ? t('pack.wish.guide.note')
            : t('pack.wish.guide.done');

  const backBtn = (
    <button type="button" className="aw-back" onClick={back} aria-label={t('pack.mapNotes.add.back')} title={t('pack.mapNotes.add.back')}>
      <BackIcon />
    </button>
  );

  const below = (
    <div className="aw-below">
      <style>{ADD_WISH_CSS}</style>
      {step === 'place' && (
        <div className="aw-row">
          {backBtn}
          <div className="aw-grow">
            <PlaceSearch mapRef={mapRef} placeholder={t('pack.wish.searchPlaceholder')} onPicked={pickPlace} />
          </div>
        </div>
      )}
      {step === 'kind' && (
        <div className="aw-row">
          {backBtn}
          <div className="aw-chips">
            {WISH_TRIP_KINDS.map((k) => (
              <button key={k} type="button" className={`aw-chip${kind === k ? ' on' : ''}`} onClick={() => { setKind(k); setStep('when'); }}>
                {t(`pack.wish.kind.${k}`)}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 'when' && (
        <div className="aw-row">
          {backBtn}
          <div className="aw-chips">
            {WISH_WHENS.map((w) => (
              <button key={w} type="button" className={`aw-chip${when === w ? ' on' : ''}`} onClick={() => { setWhen(w); setStep('note'); }}>
                {t(`pack.wish.when.${w}`)}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 'note' && (
        <div className="aw-col">
          <div className="aw-row">
            {backBtn}
            <input
              className="aw-input"
              value={note}
              maxLength={NOTE_MAX}
              placeholder={t('pack.wish.notePlaceholder')}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="aw-chips">
            <button type="button" className={`aw-chip${seeking ? ' on' : ''}`} onClick={() => setSeeking(true)}>{t('pack.wish.seeking')}</button>
            <button type="button" className={`aw-chip${!seeking ? ' on' : ''}`} onClick={() => setSeeking(false)}>{t('pack.wish.private')}</button>
          </div>
          <button type="button" className="aw-cta" disabled={busy} onClick={save}>
            {WISH_EMOJI} {busy ? '…' : t('pack.wish.pin')}
          </button>
          {err && <div className="aw-err">{err}</div>}
        </div>
      )}
      {step === 'done' && (
        <div className="aw-row">
          <button type="button" className="aw-cta" onClick={onCancel}>{t('pack.wish.close')}</button>
        </div>
      )}
    </div>
  );

  return (
    <AinubisGuide
      text={text}
      onAbort={onCancel}
      abortLabel={t('pack.mapNotes.add.cancel')}
      edgeLeft={edgeLeft}
      below={below}
    />
  );
}

// ⚠️ JS template literal — spätný apostrof v komentári by ho ukončil (check:css).
// Zdieľa ho aj `WishAsk.tsx` (otázky života prania) — tá istá bublina, tie isté tlačidlá.
export const ADD_WISH_CSS = `
.aw-below{display:flex;flex-direction:column;gap:8px;}
.aw-row{display:flex;align-items:center;gap:8px;}
.aw-col{display:flex;flex-direction:column;gap:8px;}
.aw-grow{flex:1 1 auto;min-width:0;}
.aw-back{flex:0 0 auto;width:32px;height:32px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:${AINUBIS.surfaceBase};border:1px solid ${AINUBIS.edgeStrong};color:${AINUBIS.ink};cursor:pointer;padding:0;}
.aw-back:hover{border-color:${AINUBIS.cyan};color:${AINUBIS.cyan};}
.aw-chips{display:flex;flex-wrap:wrap;gap:8px;}
.aw-chip{font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.02em;color:${AINUBIS.ink};background:${AINUBIS.surfaceBase};border:1px solid ${AINUBIS.edgeStrong};border-radius:999px;padding:8px 12px;cursor:pointer;transition:border-color .15s,background .15s;}
.aw-chip:hover{border-color:${AINUBIS.cyan};}
.aw-chip.on{border-color:${AINUBIS.cyan};background:rgba(${AINUBIS.cyanRGB},0.18);color:${AINUBIS.cyan};}
.aw-input{flex:1 1 auto;min-width:0;font-family:${FONT_UI};font-size:14px;color:${AINUBIS.ink};background:${AINUBIS.surfaceBase};border:1px solid ${AINUBIS.edgeStrong};border-radius:12px;padding:8px 12px;outline:none;}
.aw-input:focus{border-color:${AINUBIS.cyan};}
.aw-input::placeholder{color:${AINUBIS.inkFaint};}
.aw-cta{align-self:stretch;font-family:${FONT_UI};font-weight:600;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:${AINUBIS.ctaInk};background:${AINUBIS.ctaGrad};box-shadow:${AINUBIS.ctaShadow};border:0;border-radius:8px;padding:12px 16px;cursor:pointer;}
.aw-cta:hover{background:${AINUBIS.ctaGradHover};}
.aw-cta:disabled{opacity:.6;cursor:default;}
.aw-err{font-family:${FONT_UI};font-size:12px;color:${AINUBIS.danger};}
.aw-ghost{flex:1 1 0;font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${AINUBIS.ink};background:${AINUBIS.surfaceBase};border:1px solid ${AINUBIS.edgeStrong};border-radius:8px;padding:12px 16px;cursor:pointer;}
.aw-ghost:hover{border-color:${AINUBIS.cyan};color:${AINUBIS.cyan};}
.aw-ghost:disabled{opacity:.6;cursor:default;}
.aw-pts{align-self:flex-start;font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.14em;color:${AINUBIS.ctaA};background:${AINUBIS.ctaTint};border:1px solid ${AINUBIS.ctaEdge};border-radius:999px;padding:4px 12px;}
.aw-sub{font-family:${FONT_UI};font-size:12px;color:${AINUBIS.inkFaint};}
`;
