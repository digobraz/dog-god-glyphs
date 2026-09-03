// ÚPRAVA UŽ ZAPÍSANÉHO VÝLETU — text, fotky, hodnotenie.
//
// Matej 2026-08-25 (po výstupe na Rokoš): „bohužiaľ nemám dobré fotky z tej túry… ako autor by
// som do toho vedel vstúpiť a prepísať text vymeniť fotky", názov ostáva, mazanie NIE.
//
// ── PLÁN SA UPRAVUJE INAK NEŽ ZÁPIS (Matej 2026-09-03) ────────────────────────────────────
// „pridať dátum + dopravu + viditeľnosť, ale len keď je záznam PLÁN (budúci, neprejdený).
//  Pri prejdenom výlete tie polia nemajú zmysel a robili by neporiadok."
// Do 3. 9. 2026 sa dátum plánu nedal posunúť — plán sa musel zmazať a naplánovať odznova,
// čím sa stratil aj inzerát a s ním ľudia, ktorí sa naň už pridali.
//
// Panel má preto DVE tváre a rozhoduje o nich `plan` prop (dá ho volajúci, ktorý jediný vie,
// či je výlet prejdený):
//   PLÁN   → dátum · viditeľnosť · doprava · popis · psia poznámka.  BEZ fotiek a hodnotenia:
//            výlet, ktorý sa ešte nekonal, nemá čo hodnotiť ani z čoho mať fotky.
//   ZÁPIS  → fotky · popis · psia poznámka · hodnotenie (pôvodný panel, nič sa nemení).
//
// ⚠️ ZMENA DÁTUMU JE ZMENA SĽUBU. Keď je plán verejný, dátum nesie aj inzerát
// (`PartnerEvent.dates`/`month`) — preto ho ukladá volajúci naraz na obidve miesta, nie tento
// panel. Uložiť dátum len do plánu by znamenalo, že v triplistе je jeden termín a v inzeráte,
// ktorý ľudia vidia, druhý.
//
// ⚠️ ČO SA TU ZÁMERNE NEDÁ ──────────────────────────────────────────────────────────────────
//  · NÁZOV a SLUG — slug je cudzí kľúč naraz v URL, v uloženom stave prehliadača (`trp-walked-ids`
//    a spol.), v Supabase (`user_trips`, `trip_requests`, `trip_events`) a v ceste k fotkám na
//    Cloudinary. Premenovanie má vlastný postup (`RENAMED_TRIP_IDS` + migračný skript), nie je to
//    úprava textu. Matej: „názov zostane".
//  · ZMAZANIE výletu — Matej 2026-08-25: „nemaže sa".
//  · TRASA, km, PREVÝŠENIE — sú odmerané, nie napísané. Prekreslenie trasy mení geometriu aj
//    prevýšenie a patrí do sprievodcu, nie do panela na text.
//
// ⚠️ EN PREKLAD SA PRI ÚPRAVE ZAHADZUJE. `descEN`/`dogNoteEN` sú preklad SK originálu (viď
// `tripText()` v tripShared.tsx). Keby po prepise textu ostali, EN návštevník by čítal PÔVODNÚ
// verziu — teda text, ktorý autor práve prepísal, a nemal by ako zistiť, že je starý. Pád na SK
// je horší zážitok, ale pravdivý; preklad sa doplní tou istou cestou ako u ostatných výletov.
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { updateLocalTrail } from '@/components/pack/tripShared';
import { MAX_PHOTOS, optimizePhoto } from '@/components/pack/addtrip/photoOptimize';
import { PawRating } from '@/components/pack/addtrip/PawRating';
import { TRAVEL_MODES, type TravelMode, type TravelInfo } from '@/components/pack/addtrip/addTripModel';
import { FONT_EMOJI } from '@/components/pack/mapnotes/markEmoji';

/** Čo sa dá na PLÁNE prestaviť. `date` prázdny = „ešte neviem kedy" (flexibilný termín). */
export type PlanEdit = { date: string; visibility: 'open' | 'private'; travel?: TravelInfo };

const GOLD = '#C99A3F';

const TRIP_EDIT_CSS = `
.tep-overlay{position:fixed;inset:0;z-index:1200;background:rgba(3,2,1,0.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;}
.tep-modal{width:100%;max-width:440px;max-height:calc(100dvh - 40px);overflow-y:auto;background:${T.glass};backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid ${T.onDarkBorder};border-radius:20px;box-shadow:0 30px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(245,240,228,0.06);padding:24px;}
.tep-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px;}
.tep-title{font-family:${FONT_TITLE};font-weight:700;font-size:16px;color:${GOLD};line-height:1.25;}
.tep-sub{font-size:12px;color:${T.onDarkDim};margin-top:4px;}
.tep-x{flex-shrink:0;width:30px;height:30px;border-radius:50%;background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.tep-x:hover{border-color:${GOLD};color:${GOLD};}
.tep-field{margin-bottom:16px;}
.tep-label{display:block;font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};margin-bottom:9px;}
.tep-hint{font-family:${FONT_UI};font-size:10px;color:${T.onDarkDim};letter-spacing:.04em;}
.tep-textarea{width:100%;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:10px;padding:10px 12px;color:${T.onDark};font-family:inherit;font-size:13px;outline:0;resize:vertical;min-height:84px;}
.tep-textarea:focus{border-color:${GOLD};}
/* Fotky: mriežka s pevnou výškou — rôzne pomery strán by inak rozhádzali riadky a „vymeniť
   fotku" by sa menilo na hľadanie, ktorá je ktorá. */
.tep-photos{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px;}
.tep-photo{position:relative;height:70px;border-radius:9px;overflow:hidden;background:#111;border:1px solid ${T.onDarkBorder};}
.tep-photo img{width:100%;height:100%;object-fit:cover;display:block;}
/* Krížik je nad fotkou, nie vedľa nej: pri ôsmich fotkách sa vedľajšie tlačidlo nedá trafiť. */
.tep-photo-x{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(10,6,2,0.78);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:13px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.tep-photo-x:hover{border-color:${GOLD};color:${GOLD};}
.tep-addphoto{height:70px;border-radius:9px;border:1px dashed ${T.onDarkBorder};background:rgba(245,240,228,0.04);color:${T.onDarkDim};font-family:${FONT_UI};font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.tep-addphoto:hover{border-color:${GOLD};color:${GOLD};}
.tep-addphoto:disabled{opacity:.35;cursor:default;}
.tep-pawpick{display:flex;justify-content:center;}
.tep-submit{width:100%;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:10px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);color:#000;border:1px solid rgba(250,244,236,0.30);cursor:pointer;}
.tep-submit:disabled{opacity:.4;cursor:default;}
.tep-err{font-size:12px;color:#E0796D;margin-top:9px;text-align:center;}
/* ── PLÁN ────────────────────────────────────────────────────────────────────────────────
   Dvojica tlačidiel, nie prepínač: „idem sám" a „hľadám svorku" nie sú zapnuté/vypnuté,
   sú to dve rovnocenné odpovede a jedna z nich platí vždy. */
.tep-input{width:100%;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:10px;padding:10px 12px;color:${T.onDark};font-family:inherit;font-size:13px;outline:0;}
.tep-input:focus{border-color:${GOLD};}
.tep-two{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.tep-opt{padding:10px 8px;border-radius:10px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.04);color:${T.onDarkDim};font-family:${FONT_UI};font-size:12px;cursor:pointer;text-align:center;line-height:1.3;}
.tep-opt.on{border-color:${GOLD};color:${GOLD};background:rgba(201,154,63,0.13);}
.tep-travel{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.tep-travel button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:9px 4px;border-radius:10px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.04);color:${T.onDarkDim};font-family:${FONT_UI};font-size:11px;cursor:pointer;}
.tep-travel button.on{border-color:${GOLD};color:${GOLD};background:rgba(201,154,63,0.13);}
.tep-travel b{font-size:17px;line-height:1;}
.tep-check{display:flex;align-items:center;gap:9px;width:100%;padding:10px 12px;border-radius:10px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.04);color:${T.onDark};font-family:${FONT_UI};font-size:12.5px;cursor:pointer;text-align:left;}
.tep-check.on{border-color:${GOLD};color:${GOLD};background:rgba(201,154,63,0.13);}
.tep-check b{width:16px;flex-shrink:0;font-size:12px;}
.tep-seats{display:flex;align-items:center;gap:9px;margin-top:8px;font-family:${FONT_UI};font-size:12px;color:${T.onDarkDim};}
.tep-seats button{width:28px;height:28px;border-radius:8px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.05);color:${T.onDark};font-size:14px;line-height:1;cursor:pointer;}
.tep-seats b{color:${T.onDark};font-size:14px;min-width:14px;text-align:center;}
`;

export function TripEditPanel({ trail, plan, onSaved, onPlanSaved, onClose }: {
  trail: HeroTrail;
  /**
   * Aktuálny stav PLÁNU, alebo `undefined` pri prejdenom výlete. Rozhoduje o tvári panela.
   * Nepočíta sa tu: či je výlet prejdený, vie len volajúci (`walkedIds`), a hádať to
   * z dátumu by znamenalo, že plán, ktorý termín prešvihol, si ticho zmení podobu.
   */
  plan?: PlanEdit;
  /** Dostane upravený výlet, aby článok prekreslil bez čakania na ďalší mount. */
  onSaved: (patch: Partial<HeroTrail>) => void;
  /** Uloží dátum/viditeľnosť/dopravu naraz do plánu aj do inzerátu — viď hlavičku súboru. */
  onPlanSaved?: (p: PlanEdit) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [desc, setDesc] = useState(trail.desc ?? '');
  const [dogNote, setDogNote] = useState(trail.dogNote ?? '');
  const [stars, setStars] = useState(trail.stars ?? 0);
  const [photos, setPhotos] = useState<string[]>(trail.photos ?? []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  // ── stav plánu (mŕtvy pri prejdenom výlete — sekcia sa nevykreslí) ──
  const isPlan = !!plan;
  const [date, setDate] = useState(plan?.date ?? '');
  const [visibility, setVisibility] = useState<'open' | 'private'>(plan?.visibility ?? 'private');
  const [travelMode, setTravelMode] = useState<TravelMode | ''>((plan?.travel?.mode as TravelMode) ?? '');
  const [travelFrom, setTravelFrom] = useState(plan?.travel?.from ?? '');
  const [pickup, setPickup] = useState(!!plan?.travel?.pickup);
  const [pickupSeats, setPickupSeats] = useState(plan?.travel?.seats ?? 1);

  // Panel sa zatvára klikom mimo (nižšie) alebo Esc — krížik na bloku je zrušený lockom
  // z 28. 8. 2026, takže Esc nie je pohodlie navyše, ale druhá polovica odchodu na PC.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) { setErr(t('pack.trip.edit.photoMax', { n: MAX_PHOTOS })); return; }
    setBusy(true);
    const take = Array.from(files).slice(0, room);
    const out = (await Promise.all(take.map((f) => optimizePhoto(f)))).filter((x): x is string => !!x);
    setPhotos((prev) => [...prev, ...out].slice(0, MAX_PHOTOS));
    setBusy(false);
  };

  const save = () => {
    setErr('');
    // ⚠️ `descEN`/`dogNoteEN` idú na `undefined` ZÁMERNE — viď hlavička súboru.
    // ⚠️ `stars`/`photos` sa pri PLÁNE neposielajú vôbec (nie ako 0 a prázdne pole): panel
    //    ich nezobrazuje, takže by zapisoval hodnotu, ktorú nikto nevidel — a keby plán
    //    nejakú niesol z minulosti, prepísal by ju na prázdno.
    const patch: Partial<HeroTrail> = {
      desc: desc.trim(),
      dogNote: dogNote.trim(),
      descEN: undefined,
      dogNoteEN: undefined,
      ...(isPlan ? {} : { stars, photos }),
    };
    // `updateLocalTrail` sa sama postará o frontu do Supabase (nové fotky sú base64 a nahrajú
    // sa na Cloudinary pri jej spracovaní). `false` = kvóta úložiska, nie chyba siete.
    if (!updateLocalTrail(trail.id, patch)) { setErr(t('pack.trip.edit.saveFailed')); return; }
    onSaved(patch);
    if (isPlan) {
      // VYZDVIHNUTIE NESIE LEN VEREJNÝ PLÁN — na súkromnom ho nemá kto prijať. Vypĺňať sa
      // pritom smie ďalej (pole ostáva v paneli aj v drafte sprievodcu, Matej 3. 9.:
      // „nemazať, len skryť"); zahadzuje sa až TU, na ceste do inzerátu.
      const travel: TravelInfo = {
        ...(travelMode ? { mode: travelMode } : {}),
        ...(travelFrom.trim() ? { from: travelFrom.trim() } : {}),
        ...(visibility === 'open' && pickup ? { pickup: true, seats: pickupSeats } : {}),
      };
      onPlanSaved?.({ date, visibility, travel: Object.keys(travel).length ? travel : undefined });
    }
    onClose();
  };

  return (
    <div className="tep-overlay" onClick={onClose}>
      <div className="tep-modal" onClick={(e) => e.stopPropagation()}>
        <style>{TRIP_EDIT_CSS}</style>
        <div className="tep-head">
          <div>
            <div className="tep-title">{t(isPlan ? 'pack.trip.edit.planTitle' : 'pack.trip.edit.title')}</div>
            {/* Názov je tu ako POPIS, nie ako pole — nedá sa meniť a človek má hneď vidieť,
                ktorý výlet upravuje. */}
            <div className="tep-sub">{trail.name}</div>
          </div>
          {/* KRÍŽIK ZANIKOL (lock 2026-08-28: „nedávajme tie krížiky na bloky"). Von sa ide
              klikom mimo panela — na mobile to je jediné gesto, na PC k tomu Esc nižšie. */}
        </div>

        {/* FOTKY A HODNOTENIE LEN PRI PREJDENOM VÝLETE. Na pláne by to bola výzva
            ohodnotiť cestu, po ktorej človek ešte nešiel — presne tá istá úvaha, kvôli
            ktorej ich nemá ani sprievodca v režime plánu. */}
        {!isPlan && (
        <div className="tep-field">
          <label className="tep-label">
            {t('pack.trip.edit.photos')} <span className="tep-hint">· {photos.length}/{MAX_PHOTOS}</span>
          </label>
          <div className="tep-photos">
            {photos.map((p, i) => (
              <div className="tep-photo" key={`${i}-${p.slice(-24)}`}>
                <img src={p} alt="" />
                <button
                  type="button"
                  className="tep-photo-x"
                  aria-label={t('pack.trip.edit.removePhoto')}
                  onClick={() => setPhotos((prev) => prev.filter((_, k) => k !== i))}
                >×</button>
              </div>
            ))}
            <button
              type="button"
              className="tep-addphoto"
              disabled={busy || photos.length >= MAX_PHOTOS}
              onClick={() => fileRef.current?.click()}
              aria-label={t('pack.trip.edit.addPhoto')}
            >+</button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => { void addPhotos(e.target.files); e.target.value = ''; }}
          />
        </div>
        )}

        {/* ── PLÁN: KEDY · S KÝM · AKO SA TAM IDE ─────────────────────────────────────────
            Poradie kopíruje sprievodcu (AddTripLog), aby to bola tá istá otázka na tom
            istom mieste — panel je oprava plánu, nie druhý formulár s vlastnou logikou. */}
        {isPlan && (
          <>
            <div className="tep-field">
              <label className="tep-label">{t('pack.trip.edit.planDate')}</label>
              <input
                className="tep-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {/* Prázdny dátum je platná odpoveď („ešte neviem kedy"), nie chyba — plán sa
                  dá založiť aj bez termínu, takže sa bez neho musí dať aj uložiť. */}
              <p className="tep-hint" style={{ marginTop: 6 }}>{t('pack.trip.edit.planDateHint')}</p>
            </div>

            <div className="tep-field">
              <label className="tep-label">{t('pack.trip.edit.planVisibility')}</label>
              <div className="tep-two">
                <button
                  type="button"
                  aria-pressed={visibility === 'private'}
                  className={`tep-opt${visibility === 'private' ? ' on' : ''}`}
                  onClick={() => setVisibility('private')}
                >{t('pack.trip.edit.planSolo')}</button>
                <button
                  type="button"
                  aria-pressed={visibility === 'open'}
                  className={`tep-opt${visibility === 'open' ? ' on' : ''}`}
                  onClick={() => setVisibility('open')}
                >{t('pack.trip.edit.planOpen')}</button>
              </div>
            </div>

            <div className="tep-field">
              <label className="tep-label">{t('pack.addTrip.plan.travel')}</label>
              <div className="tep-travel">
                {TRAVEL_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={travelMode === m.id}
                    className={travelMode === m.id ? 'on' : undefined}
                    /* Druhý klik ODZNAČÍ — pole je nepovinné, rovnako ako v sprievodcovi. */
                    onClick={() => setTravelMode((v) => (v === m.id ? '' : m.id))}
                  >
                    <b style={{ fontFamily: FONT_EMOJI }}>{m.emoji}</b>
                    <span>{t(`pack.addTrip.plan.travel.${m.id}`)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="tep-field">
              <label className="tep-label">{t('pack.addTrip.plan.travelFrom')}</label>
              <input
                className="tep-input"
                value={travelFrom}
                onChange={(e) => setTravelFrom(e.target.value)}
                placeholder={t('pack.addTrip.plan.travelFromPlaceholder')}
              />
            </div>

            {/* VYZDVIHNUTIE LEN PRI VEREJNOM PLÁNE — na súkromnom niet koho vyzdvihnúť.
                Vyplnené sa pritom NEMAŽE (Matej 3. 9.): stav ostáva v paneli, len sa skryje
                a do inzerátu nejde (viď `save`). Kto sa prepne späť na „hľadám svorku",
                nájde svoje miesta tam, kde ich nechal. */}
            {visibility === 'open' && (
              <div className="tep-field">
                <button
                  type="button"
                  className={`tep-check${pickup ? ' on' : ''}`}
                  aria-pressed={pickup}
                  onClick={() => setPickup((v) => !v)}
                >
                  <b>{pickup ? '✓' : ''}</b>
                  <span>{t('pack.addTrip.plan.pickup')}</span>
                </button>
                {pickup && (
                  <div className="tep-seats">
                    <span>{t('pack.addTrip.plan.pickupSeats')}</span>
                    {/* ⚠️ Znak MÍNUS, nie escape: v JSX je text aj hodnota atribútu doslovná,
                        takže `\u2212` by sa vykreslilo ako tých šesť znakov. */}
                    <button type="button" onClick={() => setPickupSeats((n) => Math.max(1, n - 1))} aria-label="−">−</button>
                    <b>{pickupSeats}</b>
                    <button type="button" onClick={() => setPickupSeats((n) => Math.min(8, n + 1))} aria-label="+">+</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="tep-field">
          <label className="tep-label">{t('pack.trip.edit.desc')}</label>
          <textarea className="tep-textarea" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>

        <div className="tep-field">
          <label className="tep-label">{t('pack.trip.edit.dogNote')}</label>
          <textarea className="tep-textarea" value={dogNote} onChange={(e) => setDogNote(e.target.value)} />
        </div>

        {!isPlan && (
          <div className="tep-field" style={{ textAlign: 'center' }}>
            <label className="tep-label">{t('pack.trip.edit.rating')}</label>
            <div className="tep-pawpick"><PawRating value={stars} onChange={setStars} onDark size={30} /></div>
          </div>
        )}

        <button type="button" className="tep-submit" disabled={busy} onClick={save}>
          {busy ? t('pack.mapNotes.add.saving') : t('pack.trip.edit.save')}
        </button>
        {err && <div className="tep-err">{err}</div>}
      </div>
    </div>
  );
}
