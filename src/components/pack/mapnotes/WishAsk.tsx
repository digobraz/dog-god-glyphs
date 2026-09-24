// ============================================================================
// ŽIVOT PRIANIA — AINUBIS sa pýta (BUDDY krok 2, 26. 9. 2026)
//
// Hlášky: `plany/nakres-buddy-hlasky-2026-09-24.html` — B3 · C1–C5 · D1–D3.
// DB: `20260926_wish_life.sql`. Vstupy sú dva:
//   · upozornenie v NOS → `/pack/map?wish=<id>&ask=<druh>` (B3, C1, C4, C5)
//   · zapísaný výlet blízko môjho prania → D1 (`wishMatchForTrail`, po zatvorení odmeny)
//
// ── NIE JE TO NOVÁ OBRAZOVKA ────────────────────────────────────────────────
// Tá istá bublina ako pri pridávaní prania (`AinubisGuide` + triedy `ADD_WISH_CSS`),
// pod ňou vždy len tlačidlá odpovede. Upozornenie len zavolá; odpovedá sa nad mapou,
// kde pin stojí. Šat je AINUBISOV (lock brand.md: oznamy appky hovorí on).
//
// ── MENO MIESTA STOJÍ V PRVOM PÁDE ──────────────────────────────────────────
// „Nórsko", „Rysy", „Praha" prichádzajú z vyhľadávača a skloňovať sa nedajú (pamäť
// `feedback_meno_z_dat_sa_v_sk_neda_sklonovat`). Vety z nákresu („chcú tiež do Nórska")
// sú preto preskladané tak, aby miesto stálo v nominatíve („Nórsko chcú aj …").
//
// ── PES V HLÁŠKE = ŽIVÝ PES ─────────────────────────────────────────────────
// „Hektor nemládne" o psovi, ktorý odišiel, by bolelo. Kto má len zosnulých psov,
// dostane vetu bez mena (E4: pin aj prianie ostávajú, veta sa len nepýta psa).
// ============================================================================
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { useT } from '@/i18n/LanguageContext';
import { AinubisGuide } from '@/components/pack/addtrip/AinubisGuide';
import { emitOpenThread } from '@/components/pack/messaging/openBridge';
import { startWishDM } from '@/components/pack/messaging/packMessaging';
import { POINTS } from '@/lib/tripPoints';
import { wishWhenLabel } from './WishLayer';
import { ADD_WISH_CSS } from './AddWish';
import {
  WISH_WHENS, cancelWishPin, dismissMissedWish, fetchMyWishes, fulfillWish, postponeWish,
  wishEarnsPoints, wishLater, wishYearFor, zoomForPlaceKind,
  type MyWish, type WishPin, type WishWhen,
} from './wishData';

export type WishAskKind = 'wish_me_too' | 'wish_ask' | 'wish_missed' | 'wish_nudge' | 'match';
export type WishAskReq = { id: string; kind: WishAskKind; tripId?: string };

type Step =
  | 'loading' | 'gone'
  | 'metoo'          // B3
  | 'ask'            // C1
  | 'when'           // C2
  | 'cancelled'      // C3
  | 'missed'         // C4
  | 'nudge'          // C5
  | 'postponed'
  | 'match'          // D1
  | 'done'           // D2 (aj po „len označiť")
  | 'noLog';         // D3

const startStep = (k: WishAskKind): Step =>
  k === 'wish_me_too' ? 'metoo' : k === 'wish_ask' ? 'ask' : k === 'wish_missed' ? 'missed'
    : k === 'wish_nudge' ? 'nudge' : 'match';

export function WishAsk({ req, wishes, map, dogName, onClose, onChanged, onLogTrip, edgeLeft }: {
  req: WishAskReq;
  /** živé priania na mape — B3 si z nich berie kópiu toho, kto chce tiež */
  wishes: WishPin[];
  map: LeafletMap | null;
  /** meno ŽIVÉHO psa (hlavička súboru); null = veta bez psa */
  dogName: string | null;
  onClose: () => void;
  onChanged: () => void;
  /** D3 ZAPÍSAŤ VÝLET — LOG predvyplnený miestom prania */
  onLogTrip: (lat: number, lon: number) => void;
  edgeLeft?: boolean;
}) {
  const t = useT();
  const [step, setStep] = useState<Step>(req.kind === 'wish_me_too' ? 'metoo' : 'loading');
  const [mine, setMine] = useState<MyWish | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [newWhen, setNewWhen] = useState<WishWhen | null>(null);
  // D2: `logged` = splnené cez LOG (nie „len označiť"), `earned` = LOG + prianie staršie ako týždeň
  const [logged, setLogged] = useState(false);
  const [earned, setEarned] = useState(false);

  const copy = useMemo(() => (req.kind === 'wish_me_too' ? wishes.find((w) => w.id === req.id) ?? null : null), [req, wishes]);
  // Mapa môže prísť až po prvom vykreslení (`mapInstance` je state v PackMap).
  const mapRef = useRef<LeafletMap | null>(map);
  mapRef.current = map;
  const flewRef = useRef(false);
  useEffect(() => {
    if (!copy || !map || flewRef.current) return;
    flewRef.current = true;
    map.setView([copy.lat, copy.lon], zoomForPlaceKind(copy.placeKind));
  }, [copy, map]);

  // Vlastné prianie sa berie z `list_my_wishes()` — prešvihnuté už na mape nie je.
  useEffect(() => {
    if (req.kind === 'wish_me_too') return;
    let live = true;
    fetchMyWishes()
      .then((list) => {
        if (!live) return;
        const w = list.find((x) => x.id === req.id) ?? null;
        // Na otázku sa už odpovedalo inde (druhý telefón, profil) — nepýtať sa znova.
        const stale = !w
          || (req.kind === 'wish_missed' ? w.status !== 'missed' : w.status !== 'live');
        setMine(w);
        setStep(stale ? 'gone' : startStep(req.kind));
        // Z upozornenia sa priletí k pinu — otázka „Nórsko ešte platí?" nad Tatrami mätie.
        // D1 nie: človek práve zapísal výlet a mapa stojí tam, kde má.
        if (w && !stale && req.kind !== 'match') mapRef.current?.setView([w.lat, w.lon], zoomForPlaceKind(w.placeKind));
      })
      .catch(() => { if (live) setStep('gone'); });
    return () => { live = false; };
  }, [req]);

  const place = mine?.placeName ?? copy?.placeName ?? '';
  const flyTo = (w: MyWish) => map?.setView([w.lat, w.lon], zoomForPlaceKind(w.placeKind));

  /** `next` = krok po úspechu; null = hotovo, bublina sa zavrie. */
  const run = async (fn: () => Promise<void>, next: Step | null) => {
    setBusy(true); setErr(null);
    try { await fn(); onChanged(); if (next) setStep(next); else onClose(); }
    catch { setErr(t('pack.wish.failed')); }
    finally { setBusy(false); }
  };

  const write = async () => {
    setBusy(true); setErr(null);
    try {
      const conv = await startWishDM(req.id);
      if (!conv) { setErr(t('pack.wish.cantWrite')); return; }
      emitOpenThread(conv);
      onClose();
    } catch { setErr(t('pack.wish.cantWrite')); } finally { setBusy(false); }
  };

  const fulfill = (tripId: string | null) => {
    if (!mine) return;
    // Body = LOG + prianie staršie ako týždeň. Server to pri počítaní stráži znova
    // (`my_wish_points`); tu sa len rozhoduje, či sa ukáže „+10".
    setLogged(!!tripId);
    setEarned(!!tripId && wishEarnsPoints(mine));
    void run(() => fulfillWish(mine.id, tripId), 'done');
  };

  const postpone = (w: WishWhen) => {
    if (!mine) return;
    setNewWhen(w);
    void run(() => postponeWish(mine.id, w, req.kind === 'wish_nudge'), 'postponed');
  };

  // „raz v živote" koniec nemá — C1 sa naň nepýta, fallback je len poistka.
  const endKey = !mine || mine.when === 'lifetime' ? 'year' : mine.when;
  const text = (() => {
    switch (step) {
      case 'loading': return '';
      case 'gone': return t('pack.wish.ask.gone');
      case 'metoo': return copy
        ? t('pack.wish.ask.meToo', { place, who: [copy.ownerFirst, copy.dogName].filter(Boolean).join(' + ') || t('pack.triplist.fallbackDogyptian') })
        : t('pack.wish.ask.gone');
      case 'ask': return t('pack.wish.ask.stillOn', { end: t(`pack.wish.ask.end.${endKey}`), place });
      case 'when': return t('pack.wish.ask.when');
      case 'cancelled': return t('pack.wish.ask.cancelled');
      case 'missed': return t('pack.wish.ask.missed', { place });
      case 'nudge': return dogName ? t('pack.wish.ask.nudge', { place, dog: dogName }) : t('pack.wish.ask.nudgeNoDog', { place });
      case 'postponed': return t('pack.wish.ask.postponed', { place, when: newWhen ? wishWhenLabel(t, { when: newWhen, whenYear: wishYearFor(newWhen) }) : '' });
      case 'match': return t('pack.wish.ask.match', { place });
      case 'done': return dogName ? t('pack.wish.ask.done', { dog: dogName }) : t('pack.wish.ask.doneNoDog');
      case 'noLog': return t('pack.wish.ask.noLog');
    }
  })();

  const btn = (label: string, onClick: () => void, cta = false) => (
    <button type="button" className={cta ? 'aw-cta' : 'aw-ghost'} disabled={busy} onClick={onClick}>{label}</button>
  );
  const closeRow = <div className="aw-row">{btn(t('pack.wish.close'), onClose, true)}</div>;

  const below = (
    <div className="aw-below">
      <style>{ADD_WISH_CSS}</style>
      {(step === 'gone' || step === 'cancelled' || step === 'postponed') && closeRow}
      {step === 'metoo' && (copy
        ? <div className="aw-row">{btn(t('pack.wish.write'), write, true)}{btn(t('pack.wish.close'), onClose)}</div>
        : closeRow)}
      {step === 'ask' && mine && (
        <div className="aw-col">
          {btn(t('pack.wish.ask.btn.postpone'), () => setStep('when'), true)}
          <div className="aw-row">
            {btn(t('pack.wish.ask.btn.done'), () => setStep('noLog'))}
            {btn(t('pack.wish.ask.btn.cancel'), () => void run(() => cancelWishPin(mine.id), 'cancelled'))}
          </div>
        </div>
      )}
      {step === 'when' && (
        <div className="aw-chips">
          {WISH_WHENS.map((w) => (
            <button key={w} type="button" className="aw-chip" disabled={busy} onClick={() => postpone(w)}>
              {t(`pack.wish.when.${w}`)}
            </button>
          ))}
        </div>
      )}
      {step === 'missed' && mine && (
        <div className="aw-row">
          {btn(t('pack.wish.ask.btn.revive'), () => setStep('when'), true)}
          {btn(t('pack.wish.ask.btn.letGo'), () => void run(() => dismissMissedWish(mine.id), null))}
        </div>
      )}
      {step === 'nudge' && mine && (
        <div className="aw-col">
          {btn(t('pack.wish.ask.btn.thisYear'), () => postpone('year'), true)}
          <div className="aw-row">
            {mine.others > 0 && btn(t('pack.wish.ask.btn.whoElse'), () => { flyTo(mine); onClose(); })}
            {btn(t('pack.wish.ask.btn.notYet'), () => void run(() => wishLater(mine.id), null))}
          </div>
        </div>
      )}
      {step === 'match' && (
        <div className="aw-row">
          {btn(t('pack.wish.ask.btn.yes'), () => fulfill(req.tripId ?? null), true)}
          {btn(t('pack.wish.ask.btn.notYet'), onClose)}
        </div>
      )}
      {step === 'done' && (
        <div className="aw-col">
          {earned && <span className="aw-pts">+{POINTS.wish} {t('pack.wish.ask.pilgrim')}</span>}
          {logged && !earned && <span className="aw-sub">{t('pack.wish.ask.tooYoung')}</span>}
          {mine && mine.others > 0 && (
            <>
              <span className="aw-sub">{t('pack.wish.ask.othersWant', { n: mine.others })}</span>
              {btn(t('pack.wish.ask.btn.showThem'), () => { flyTo(mine); onClose(); })}
            </>
          )}
          {btn(t('pack.wish.close'), onClose, true)}
        </div>
      )}
      {step === 'noLog' && mine && (
        <div className="aw-col">
          {btn(t('pack.wish.ask.btn.logTrip'), () => { onClose(); onLogTrip(mine.lat, mine.lon); }, true)}
          {btn(t('pack.wish.ask.btn.justMark'), () => fulfill(null))}
        </div>
      )}
      {err && <div className="aw-err">{err}</div>}
    </div>
  );

  if (step === 'loading') return null;
  return (
    <AinubisGuide
      text={text}
      onAbort={onClose}
      abortLabel={t('pack.wish.close')}
      edgeLeft={edgeLeft}
      below={below}
    />
  );
}
