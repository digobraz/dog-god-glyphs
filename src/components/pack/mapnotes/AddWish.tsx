// ============================================================================
// + PRIDAŤ PRIANIE — sprievodca AINUBIS nad mapou (BUDDY krok 2, 24. 9. 2026)
//
// Matej 24. 9.: *„musí to byť extrémne jednoduché — AINUBIS zahlási: vyber miesto, kam si
// chcel ísť — miesto, vrchol, mesto, štát… druh, kedy, popis… pripnúť"*.
// Hlášky: `plany/nakres-buddy-hlasky-2026-09-24.html`, sekcia A (A1–A5).
//
// ── ŽIADNY FORMULÁR ─────────────────────────────────────────────────────────
// Hovorí AINUBIS (jeho blok v strede obrazovky, `WishSheet`) a pod ním stojí
// vždy len JEDNA vec, ktorú treba spraviť. Mapa je pod závojom — vybrané miesto preto
// stojí v bloku ako štítok 🎯 a mapa k nemu priletí, aby ho po zavretí bolo vidno.
//
// ── TVAR (Matej 24. 9. 2026 večer) ─────────────────────────────────────────
// Tok stojí V STREDE obrazovky nad tmavým závojom: hore AINUBISov blok s otázkou, v ňom
// bledý blok s ovládaním (`WishSheet.tsx`). Na bledom je akcia LAPIS a výber priesvitný
// lapisový tint — prvá verzia mala AINUBISove zlato-oranžové chipy položené priamo na mape.
//
// Miesto sa vyberá VYHĽADÁVANÍM (Mapy.com), nie ťuknutím do mapy: prianie potrebuje meno
// („Nórsko", „Rysy") a spätné geokódovanie appka nemá. Ťuk do mapy môže pribudnúť neskôr.
// ============================================================================
import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { PACK_THEME as T, PACK_R, PACK_SPACE, FONT_UI, PF_FIELD_CSS } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { useT } from '@/i18n/LanguageContext';
import { WishSheet } from './WishSheet';
import { PlaceSearch, type PlaceSug } from '@/components/pack/addtrip/PlaceSearch';
import { BackIcon } from '@/components/pack/BackButton';
import { WISH_EMOJI } from './markEmoji';
import { wishWhenLabel } from './WishLayer';
import {
  WISH_TRIP_KINDS, WISH_WHENS, addWishPin, placeKindFromMapy, zoomForPlaceKind,
  type WishPlaceKind, type WishTripKind, type WishWhen,
} from './wishData';

type Step = 'place' | 'kind' | 'when' | 'note' | 'done';
export type WishDraftPoint = { lat: number; lon: number } | null;

const NOTE_MAX = 140;

export function AddWish({ map, onDraft, onSaved, onCancel }: {
  map: LeafletMap | null;
  /** Kde má mapa ukázať rozpracovaný 🎯 (null = nikde). */
  onDraft: (p: WishDraftPoint) => void;
  onSaved: () => void;
  onCancel: () => void;
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

  // Čo už je vybrané — mapa je pod závojom, takže výber musí byť vidno v bloku.
  const picked = place && step !== 'done' && (
    <div className="aw-picked">
      <span className="aw-tag aw-tag--place">{WISH_EMOJI} {place.name}</span>
      {kind && step !== 'kind' && <span className="aw-tag">{t(`pack.wish.kind.${kind}`)}</span>}
      {when && step === 'note' && <span className="aw-tag">{wishWhenLabel(t, { when, whenYear: null })}</span>}
    </div>
  );

  return (
    <WishSheet text={text} onClose={onCancel} closeLabel={t('pack.mapNotes.add.cancel')}>
      <style>{PF_FIELD_CSS + ADD_WISH_CSS}</style>
      {picked}
      {step === 'place' && (
        <div className="aw-grow aw-search">
          <PlaceSearch mapRef={mapRef} placeholder={t('pack.wish.searchPlaceholder')} onPicked={pickPlace} />
        </div>
      )}
      {step === 'kind' && (
        <div className="aw-chips">
          {WISH_TRIP_KINDS.map((k) => (
            <button key={k} type="button" className={`aw-chip${kind === k ? ' on' : ''}`} onClick={() => { setKind(k); setStep('when'); }}>
              {t(`pack.wish.kind.${k}`)}
            </button>
          ))}
        </div>
      )}
      {step === 'when' && (
        <div className="aw-chips">
          {WISH_WHENS.map((w) => (
            <button key={w} type="button" className={`aw-chip${when === w ? ' on' : ''}`} onClick={() => { setWhen(w); setStep('note'); }}>
              {t(`pack.wish.when.${w}`)}
            </button>
          ))}
        </div>
      )}
      {step === 'note' && (
        <>
          <input
            className="aw-input pf-field"
            value={note}
            maxLength={NOTE_MAX}
            placeholder={t('pack.wish.notePlaceholder')}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="aw-chips">
            <button type="button" className={`aw-chip${seeking ? ' on' : ''}`} onClick={() => setSeeking(true)}>{t('pack.wish.seeking')}</button>
            <button type="button" className={`aw-chip${!seeking ? ' on' : ''}`} onClick={() => setSeeking(false)}>{t('pack.wish.private')}</button>
          </div>
          <button type="button" className="aw-cta" disabled={busy} onClick={save}>
            {WISH_EMOJI} {busy ? '…' : t('pack.wish.pin')}
          </button>
          {err && <div className="aw-err">{err}</div>}
        </>
      )}
      {step === 'done' && (
        <button type="button" className="aw-cta" onClick={onCancel}>{t('pack.wish.close')}</button>
      )}
      {/* Krok späť stojí dole, nie v bubline — rovnako ako pri odkazoch (MapNotePlacing). */}
      {step !== 'place' && step !== 'done' && <div className="aw-foot">{backBtn}</div>}
    </WishSheet>
  );
}

// ⚠️ JS template literal — spätný apostrof v komentári by ho ukončil (check:css).
// Zdieľa ho aj `WishAsk.tsx` (otázky života prania) — tá istá bublina, tie isté tlačidlá.
export const ADD_WISH_CSS = `
.aw-grow{min-width:0;}
.aw-picked{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.xs}px;}
.aw-tag{font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.02em;color:${T.inkStrong};background:${T.tileBg};border:1px solid ${T.border};border-radius:${PACK_R.pill}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;}
.aw-tag--place{border-color:${T.cardEdge};}
.aw-foot{display:flex;}
.aw-back{flex:0 0 auto;width:32px;height:32px;border-radius:${PACK_R.pill}px;display:flex;align-items:center;justify-content:center;background:transparent;border:1px solid ${T.border};color:${T.inkStrong};cursor:pointer;padding:0;}
.aw-back:hover{border-color:${LAPIS.edge};color:${LAPIS.edge};}
.aw-chips{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.aw-chip{font-family:${FONT_UI};font-weight:600;font-size:14px;letter-spacing:.02em;color:${T.inkStrong};background:${T.tileBg};border:1px solid ${T.border};border-radius:${PACK_R.pill}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;cursor:pointer;transition:border-color .15s,background .15s;}
.aw-chip:hover{border-color:${LAPIS.edge};}
.aw-chip.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.aw-chip:disabled{opacity:.6;cursor:default;}
.aw-input{width:100%;box-sizing:border-box;font-family:${FONT_UI};font-size:16px;color:${T.inkStrong};border-radius:${PACK_R.field}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;}
/* Jediné plné CTA v bloku — lapis, lebo sedí na bledom (brand: rozhoduje podklad). */
.aw-cta{width:100%;font-family:${FONT_UI};font-weight:600;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:${LAPIS.ink};background:${LAPIS.grad};border:1px solid ${LAPIS.edge};box-shadow:${LAPIS_BTN_SHADOW};border-radius:${PACK_R.field}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;cursor:pointer;}
.aw-cta:hover{background:${LAPIS.gradHover};}
.aw-cta:disabled{opacity:.6;cursor:default;}
.aw-ghost{flex:1 1 0;font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};background:transparent;border:1px solid ${T.border};border-radius:${PACK_R.field}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;cursor:pointer;}
.aw-ghost:hover{border-color:${LAPIS.edge};color:${LAPIS.edge};}
.aw-ghost:disabled{opacity:.6;cursor:default;}
.aw-row{display:flex;gap:${PACK_SPACE.sm}px;}
.aw-col{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.aw-pts{align-self:flex-start;font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.14em;color:${T.inkStrong};background:${T.tileBg};border:1px solid ${T.cardEdge};border-radius:${PACK_R.pill}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;}
.aw-sub{font-family:${FONT_UI};font-size:14px;line-height:1.45;color:${T.inkWarm};}
.aw-err{font-family:${FONT_UI};font-size:12px;color:${PICK_INK.red};}
`;
