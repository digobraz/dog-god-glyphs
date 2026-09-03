// ADD TRIP — plán ("WE'RE HEADING OUT"), vlna 1, plany/zadanie-addtrip-flow-2026-07-27.md §4.2.
// Renderuje sa ako panel content (sidebar na desktope / fullscreen overlay na mobile — kontajner
// a jeho pozíciu rieši volajúci v kroku 9, tento súbor len vypĺňa vnútro, rovnaký vzor ako pôvodné
// `renderAddSetup()` v PackMap.tsx zdieľané medzi `.trp-sidebar` a `.trp-madd`).
// Mapa žije v Portale — `GeometryPicker` (kontrakt: plany/kontrakt-geometrypicker-2026-07-29.md)
// dostane `mapRef` a kreslí do nej, tento formulár len drží riadený `TripGeometry` state.
import { useEffect, useMemo, useState } from 'react';
import type { MutableRefObject } from 'react';
import type { LatLngTuple, Map as LeafletMap } from 'leaflet';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { CompanionPicker, type Companion } from '@/components/pack/packCommunityUI';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { trailCountry } from '@/lib/countryGeo';
import { useT } from '@/i18n/LanguageContext';
import { GeometryPicker, allowedKindsFor, defaultKindFor } from './GeometryPicker';
import { BackButton } from '@/components/pack/BackButton';
import { TRIP_CATEGORIES } from '@/components/pack/tripCategories';
import {
  missingFields,
  type AddTripDraft, type TripGeometry,
} from './addTripModel';

const GOLD = '#C99A3F';

export type AddTripPlanProps = {
  /** Pre GeometryPicker — duchovia existujúcich trás + kontrola duplicity (§5.3). */
  allTrails: HeroTrail[];
  /** firstName z usePackIdentity — zapisuje sa do draftu (`authorName`). */
  authorName: string;
  myDogs: { id: string; name: string; photo?: string | null }[];
  /** false = zlyhal zápis (napr. plná kvóta) — formulár zostane otvorený, ukáže chybu. */
  onSubmit: (draft: AddTripDraft) => boolean;
  onClose: () => void;
  /** PackMap.tsx:246 `placeholderFor()` — lokálna funkcia tam, dostávame ju ako prop
   *  (presun do zdieľaného modulu je krok 9, nie tento). */
  placeholderFor: (actIds: string[] | undefined, seed: string) => string;
  /** Mapa žije v PackMap.tsx — GeometryPicker ju nevytvára, len dostane ref (kontrakt §2). */
  mapRef: MutableRefObject<LeafletMap | null>;
  /** Lišta kreslenia (rez B) — prechádza rovno do GeometryPickera, viď jeho `drawBar`. */
  drawBar?: { active: boolean; onDone: () => void };
};

// Aktivita taxonómia — lokálna kópia (id/label/emoji + dátové ACT_DATA_ID mapovanie pre
// placeholderFor). PackMap.tsx má rovnaký zoznam (TRIP_ACTIVITIES/ACT_EMOJI/ACT_DATA_ID,
// ~riadky 190-201), ale needituje sa a nič z neho nie je exportované — Portal sám o sebe je
// už lokálna kópia z __TrailsPreview.tsx (viď komentár tam), takže toto je tá istá, už zavedená
// duplicačná konvencia, nie nový vzor.
// labelKey → t() sa volá až v komponente (ACTIVITIES je modulová konštanta, useT() je hook).
// ── ŠTYRI KATEGÓRIE, JEDEN ZDROJ (2026-08-27) ───────────────────────────────────────────
// Zoznam ani emoji sa tu NEPÍŠU — sú v `components/pack/tripCategories.ts`. Táto kópia bola
// dôvod, prečo mal plán pri nocľahu ⛺ tam, kde filter na mape 💤, a pri objavovaní 🧭 tam,
// kde filter 🏰: dva zoznamy tej istej veci sa rozišli a nikto to nevidel, lebo každý žije
// na inej obrazovke.
const ACTIVITIES: Array<{ id: string; labelKey: string; emoji: string; dataId: string }> =
  TRIP_CATEGORIES.map((c) => ({
    id: c.id,
    labelKey: `pack.addTrip.plan.activities.${c.id}`,
    emoji: c.emoji,
    dataId: c.dataId,
  }));
const ACT_BY_ID: Record<string, (typeof ACTIVITIES)[number]> = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));

// §4.2: „Placeholder rotuje z poolu" — kľúče, t() sa volá v komponente.
const NAME_PLACEHOLDER_KEYS = [
  'pack.addTrip.plan.namePlaceholder.barbecue',
  'pack.addTrip.plan.namePlaceholder.hike',
  'pack.addTrip.plan.namePlaceholder.skating',
  'pack.addTrip.plan.namePlaceholder.swimming',
];

// Počiatočná prázdna geometria pre PLÁN — kind = `defaultKindFor(activity,'plan')`
// (GeometryPicker.tsx, exportované), ktorý je vždy najvoľnejší povolený druh (§5: „nikto
// nekreslí presnú trasu na výlet o mesiac"), NIE tabuľkový LOG default z `ACTIVITY_GEOMETRY`.
// `center: undefined` (nie nejaký placeholder súradnicový pár) — to je vlastný GeometryPicker
// konvencia pre „ešte nenastavené" (switchKind/clear v GeometryPicker.tsx robia to isté), lebo
// picker aj `hasGeometry()` v addTripModel.ts testujú `!!center`; reálna súradnica by sa
// tvárila ako už nastavený bod skôr, než používateľ čokoľvek klikol.
function emptyGeometryFor(activity: string): TripGeometry {
  const kind = defaultKindFor(activity, 'plan');
  if (kind === 'point') return { kind: 'point', center: undefined as unknown as LatLngTuple };
  if (kind === 'area') return { kind: 'area', center: undefined as unknown as LatLngTuple, radiusM: 0 };
  return { kind: 'route', path: [], snapped: false };
}

// §4.2 + §14: CompanionPicker (packCommunityUI.tsx:754) sa NEEDITUJE — chipy/pack tam vždy nesú
// meno v texte. Wrapper tu len oblečie tú istú komponentu do scoped CSS, ktorá meno schová do
// hover/focus tooltipu nad avatarom. `.comm-comp-dog` sú reálne <button> → mobilný tap ich
// natívne fokusuje, takže `:focus` funguje aj bez JS ako „tap = tooltip". `.comm-comp-chip`
// (vybraté avatary hore) je <span> bez tabindexu — tam mobilný tap tooltip CSS-only nejde bez
// zásahu do zdroja; na doplnenie by bolo treba JS delegáciu s rizikom race condition oproti
// Reactu (viď report), preto zostáva len hover (desktop) — nízky dopad, sú to čerstvo vybraté
// avatary, autor vie kto je kto.
function CompanionAvatarsOnly(props: {
  myDogs: { id: string; name: string; photo?: string | null }[];
  selected: Companion[];
  onChange: (next: Companion[]) => void;
}) {
  return (
    <div className="att-companions">
      <style>{COMPANION_CSS}</style>
      <CompanionPicker {...props} />
    </div>
  );
}

export function AddTripPlan({ allTrails, authorName, myDogs, onSubmit, onClose, placeholderFor, mapRef, drawBar }: AddTripPlanProps) {
  const t = useT();
  const [name, setName] = useState('');
  const [activity, setActivity] = useState<string>('hiking');
  const [geometry, setGeometry] = useState<TripGeometry>(() => emptyGeometryFor('hiking'));
  const [dateKind, setDateKind] = useState<'exact' | 'month' | 'flexible'>('exact');
  const [date, setDate] = useState('');
  const [crew, setCrew] = useState<Companion[]>([]);
  // #42 — konzervatívny default: kým člen výslovne nezvolí "Looking for pack", výlet je
  // súkromný. Predtým sa toto vôbec nepýtalo a draft vždy odišiel ako verejný inzerát.
  const [visibility, setVisibility] = useState<'private' | 'open'>('private');
  const [note, setNote] = useState('');
  const [phIdx, setPhIdx] = useState(0);
  const [submitError, setSubmitError] = useState('');

  // rotujúci placeholder pre Názov (§4.2) — beží kým je pole prázdne, netreba to gatovať za
  // podmienkou (Rules of Hooks — žiadny hook smie byť pod podmieneným returnom, tento komponent
  // žiadny early return nemá).
  useEffect(() => {
    const iv = setInterval(() => setPhIdx((i) => (i + 1) % NAME_PLACEHOLDER_KEYS.length), 2600);
    return () => clearInterval(iv);
  }, []);

  // aktivita mení povolené druhy geometrie (ACTIVITY_GEOMETRY) — ak aktuálny kind už nesedí
  // (napr. prepnutie z Hiking na Picnic), resetni na nový default namiesto ponechania neplatnej
  // kombinácie (route by na Picnic/Overnight nedávalo zmysel bez explicitnej voľby).
  useEffect(() => {
    const allowed = allowedKindsFor(activity);
    setGeometry((prev) => (allowed.includes(prev.kind) ? prev : emptyGeometryFor(activity)));
  }, [activity]);

  const act = ACT_BY_ID[activity];
  const photoUrl = placeholderFor([act?.dataId ?? 'hike'], name.trim() || activity);

  const draft = useMemo<AddTripDraft>(() => {
    const now = Date.now();
    // §6: krajina auto z geometrie — kým bod/územie nemá centrum (ešte neklikol), prázdna
    // path necháva trailCountry() padnúť na jej vlastný 'sk' fallback.
    const anchor: LatLngTuple[] = geometry.kind === 'route'
      ? (geometry.snapPath ?? geometry.path)
      : (geometry.center ? [geometry.center] : []);
    return {
      id: `plan-${now}`,
      state: 'planned',
      // Plán nejde cez schvaľovaciu frontu (§4.3 „Povinné na SCHVÁLENIE" platí len pre walked) —
      // po odoslaní sa rovno objaví v My trips aj Events (§4.2).
      approval: 'approved',
      name: name.trim(),
      activity,
      geometry,
      country: trailCountry({ path: anchor }),
      dateKind,
      date: dateKind === 'flexible' ? undefined : (date || undefined),
      crew,
      note: note.trim() || undefined,
      visibility,
      authorName,
      createdAt: now,
      updatedAt: now,
    };
  }, [geometry, name, activity, dateKind, date, crew, note, visibility, authorName]);

  const missing = missingFields(draft).toSubmit;
  const canSubmit = missing.length === 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitError('');
    const ok = onSubmit(draft);
    if (!ok) setSubmitError("Couldn't save — storage might be full. Remove something and try again.");
  };

  return (
    <div className="att-plan">
      <style>{PLAN_CSS}</style>
      <div className="att-plan-head">
        <BackButton tone="dark" onClick={onClose} label="Back" />
        <div className="att-plan-title">Plan a trip</div>
      </div>
      <div className="att-plan-body">
        <div className="att-photo" style={{ backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.45)), url('${photoUrl}')` }}>
          <span className="att-photo-badge">ADVENTURE · COMING SOON</span>
        </div>

        <div className="att-field">
          <label>Name</label>
          <input
            className="att-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(NAME_PLACEHOLDER_KEYS[phIdx])}
          />
        </div>

        <div className="att-row2">
          <div className="att-field">
            <label>Activity</label>
            <select className="att-input" value={activity} onChange={(e) => setActivity(e.target.value)}>
              {ACTIVITIES.map((a) => <option key={a.id} value={a.id}>{a.emoji} {t(a.labelKey)}</option>)}
            </select>
          </div>
          <div className="att-field">
            <label>Where</label>
            <GeometryPicker
              value={geometry}
              onChange={setGeometry}
              activity={activity}
              mode="plan"
              allTrails={allTrails}
              mapRef={mapRef}
              drawBar={drawBar}
            />
          </div>
        </div>

        <div className="att-field">
          <label>When</label>
          <div className="att-when-toggle" role="tablist" aria-label="When">
            {(['exact', 'month', 'flexible'] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={dateKind === k}
                className={`att-when-btn${dateKind === k ? ' on' : ''}`}
                onClick={() => { setDateKind(k); setDate(''); }}
              >
                {k === 'exact' ? 'Exact date' : k === 'month' ? 'Month' : 'Flexible'}
              </button>
            ))}
          </div>
          {dateKind === 'exact' && (
            <input type="date" className="att-input" style={{ marginTop: 8 }} value={date} onChange={(e) => setDate(e.target.value)} />
          )}
          {dateKind === 'month' && (
            <input type="month" className="att-input" style={{ marginTop: 8 }} value={date} onChange={(e) => setDate(e.target.value)} />
          )}
          {dateKind === 'flexible' && <p className="att-when-note">we'll agree in the chat</p>}
        </div>

        {/* #42 — viditeľnosť sa volí TU, pri zakladaní, nie schovaná v nastaveniach.
            Default "Private" (konzervatívne) — "Looking for pack" je vedomá voľba. */}
        <div className="att-field">
          <label>Who can see this</label>
          <div className="att-when-toggle" role="tablist" aria-label="Who can see this">
            <button
              type="button"
              role="tab"
              aria-selected={visibility === 'private'}
              className={`att-when-btn${visibility === 'private' ? ' on' : ''}`}
              onClick={() => setVisibility('private')}
            >Private</button>
            <button
              type="button"
              role="tab"
              aria-selected={visibility === 'open'}
              className={`att-when-btn${visibility === 'open' ? ' on' : ''}`}
              onClick={() => setVisibility('open')}
            >Looking for pack</button>
          </div>
          <p className="att-when-note">
            {visibility === 'private'
              ? "Only you and your pack see this. Nobody outside can find it or ask to join."
              : 'Your pack can see the trail, the date and your dog — and ask to join.'}
          </p>
        </div>

        {/* Note — what's planned */}
        <div className="att-field">
          <label>Plan details</label>
          <textarea
            className="att-input att-textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's the plan? Meeting point, pace, what to bring…"
          />
        </div>

        <div className="att-field">
          <label>Trip pack</label>
          <CompanionAvatarsOnly myDogs={myDogs} selected={crew} onChange={setCrew} />
        </div>
      </div>
      <div className="att-plan-foot">
        <button type="button" className="btn-gold" disabled={!canSubmit} onClick={handleSubmit}>
          Plan trip
        </button>
        {!canSubmit && <p className="att-plan-hint">{t('pack.addTrip.log.missing', { fields: missing.map((k) => t(k)).join(', ') })}</p>}
        {submitError && <p className="att-plan-error">{submitError}</p>}
      </div>
    </div>
  );
}

const COMPANION_CSS = `
.att-companions .comm-comp-selected{gap:8px;}
.att-companions .comm-comp-chip{padding:3px;gap:4px;position:relative;}
.att-companions .comm-comp-chip b{
  position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);
  white-space:nowrap;background:rgba(6,5,3,0.95);border:1px solid ${T.onDarkBorder};
  padding:4px 9px;border-radius:6px;font-family:${FONT_UI};font-size:11px;font-weight:500;
  color:${T.onDark};opacity:0;pointer-events:none;transition:opacity .15s ease;z-index:6;
}
.att-companions .comm-comp-chip:hover b{opacity:1;}
.att-companions .comm-comp-pack{gap:8px;}
.att-companions .comm-comp-dog{padding:3px;gap:0;position:relative;}
.att-companions .comm-comp-dog span:not(.plus){
  position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);
  white-space:nowrap;background:rgba(6,5,3,0.95);border:1px solid ${T.onDarkBorder};
  padding:4px 9px;border-radius:6px;font-family:${FONT_UI};font-size:11px;font-weight:500;
  color:${T.onDark};opacity:0;pointer-events:none;transition:opacity .15s ease;z-index:6;
}
.att-companions .comm-comp-dog:hover span:not(.plus),
.att-companions .comm-comp-dog:focus span:not(.plus){opacity:1;}
.att-companions .comm-comp-dog .plus{
  position:absolute;right:-3px;bottom:-3px;margin:0;background:${GOLD};color:${T.ink};
  width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:11px;line-height:1;
}
`;

// CTA (§14 LOCKED): .btn-gold sa nikde v projekte neimportuje globálne (SpiralLanding.css ho
// scopuje pod .dogypt-spiral-root) — zavedený vzor je LOKÁLNA kópia presne tých istých hodnôt
// (NotFound.tsx, DogShare.tsx, About.tsx robia to isté, „canonical, scoped locally"). Tmavý
// povrch → gradient/border/shadow 1:1 zo SpiralLanding.css (nie svetlá „grounded" varianta).
const PLAN_CSS = `
.att-plan{display:flex;flex-direction:column;height:100%;min-height:0;}
.att-plan-head{display:flex;align-items:center;gap:10px;padding:16px 20px 10px;flex-shrink:0;}
.att-plan-title{font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:${T.onDark};}
.att-plan-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:4px 20px 16px;display:flex;flex-direction:column;gap:14px;}
/* flex:0 0 auto NIE JE kozmetika: .att-plan-body je flex column so scrollom a obsah ho pretečie
   (716 > 471 px). Bez tejto brzdy prehliadač zmrští práve tento blok — nemá textový obsah, ktorý
   by ho držal (badge je orezaný cez overflow hidden), takže aspect-ratio prehrá a fotka spadne
   na 2 px. Navonok to vyzeralo ako „niečo tam je a blokuje scroll" (Matej 2026-08-05).
   POZOR: celý tento CSS blok je template literal — do komentárov nepatria spätné apostrofy. */
.att-photo{position:relative;width:100%;aspect-ratio:16/9;flex:0 0 auto;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,#1c2b1a,#0e1a0d);background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;border:1px solid ${T.onDarkBorder};}
.att-photo-badge{font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#F5C73D;background:rgba(0,0,0,0.45);padding:8px 14px;border-radius:8px;border:1px solid rgba(201,154,63,0.5);}
.att-field label{display:block;font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};margin-bottom:6px;}
.att-input{width:100%;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:9px;padding:9px 11px;color:${T.onDark};font-family:${FONT_UI};font-size:12.5px;outline:0;}
.att-input:focus{border-color:${GOLD};}
.att-input::placeholder{color:${T.onDarkDim};}
.att-textarea{resize:vertical;font-family:${FONT_UI};}
.att-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.att-when-toggle{display:flex;gap:6px;}
.att-when-btn{flex:1 1 0;font-family:${FONT_UI};font-weight:500;font-size:11px;letter-spacing:.03em;padding:8px 6px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};color:${T.onDarkDim};cursor:pointer;}
.att-when-btn.on{background:rgba(201,154,63,0.14);border-color:${GOLD};color:${T.onDark};}
.att-when-note{margin:8px 0 0;font-family:${FONT_UI};font-size:11.5px;color:${T.onDarkDim};font-style:italic;}
.att-plan-foot{flex-shrink:0;margin:0 20px 20px;display:flex;flex-direction:column;gap:8px;}
.att-plan-foot .btn-gold{
  width:100%;padding:13px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border:1px solid rgba(250,244,236,0.30);border-radius:8px;color:#000;font-family:${FONT_TITLE};
  font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;
  box-shadow:0 0 40px rgba(230,158,26,0.4),inset 0 1px 0 rgba(255,255,255,0.3);
  transition:transform .2s,box-shadow .22s,opacity .22s;
}
.att-plan-foot .btn-gold:hover:not(:disabled){transform:scale(1.02);box-shadow:0 0 56px rgba(230,158,26,0.55),inset 0 1px 0 rgba(255,255,255,0.3);}
.att-plan-foot .btn-gold:disabled{opacity:.45;cursor:default;box-shadow:none;}
.att-plan-hint{margin:0;font-family:${FONT_UI};font-size:11px;color:${T.onDarkDim};text-align:center;}
.att-plan-error{margin:0;font-family:${FONT_UI};font-size:11.5px;color:#E08A6E;text-align:center;}
@media (max-width:640px){
  .att-row2{grid-template-columns:1fr;}
}
`;
