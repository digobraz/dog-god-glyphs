// ════════════════════════════════════════════════════════════════════════════
// NASTAVENIE RÁMIKOV ŽIVOTA — tri rámiky pri číslach rokov v pohľade ŽIVOT.
//
// Matej 8. 10. 2026: „okrem narodenia aj od kedy sú spolu… z útulku, kde mohla byť
// kľudne aj 5 rokov… vytvorí sa to červeným rámikom ako je zlatý a zelený… všetky 3
// by sa mali dať evidovať… štandardne nastavené podľa nás, ale človek si to môže
// evidovať podľa seba; náš názor tam musí byť stále malou vetou."
//
//   🟥 PRED VAMI   — od narodenia po `basics.since` (deň prevzatia). Údaj JE pole
//                    DOG ID, nie nové úložisko: zmena tu = zmena v doklade.
//   🟨 PRIEMER     — priemerné dožitie; náš odhad z `estimateLife()`.
//   🟩 OPTIMUM     — dožitie pri výbornej starostlivosti; náš odhad = 5 rokov nad priemer.
//
// ⚠️ VLASTNÉ ROZPÄTIA ŽIJÚ V `dog_events` pod `calendar.bands` (append-only, ako
//    všetko o psovi). Prázdna hodnota = platí náš odhad. Piate miesto na údaje
//    o psovi nevzniká (CLAUDE.md, identita používateľa).
// ⚠️ NÁŠ ODHAD SA NIKDY NESKRÝVA — ani keď má človek vlastné čísla, pod poľom stojí
//    jedna veta „náš odhad … na základe dostupných informácií, každý pes je iný".
// ⚠️ Šat = papyrusová prekryvová vrstva denníka (`DIARY_CSS`), zavretie šípkou späť.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, GOLD_BTN, FONT_TITLE, FONT_UI, PF_FIELD_CSS,
} from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { BackButton } from '@/components/pack/BackButton';
import { appendDogEvents, type DogEventInput } from '@/lib/dogEvents';
import { DIARY_CSS } from '@/components/pack/diary/DiaryEntry';

const T = PACK_THEME;
type Tx = (key: string, fallback: string) => string;

/** Rok života, v ktorom rámik začína a končí (vrátane). */
export type YearSpan = { low: number; high: number };
/** Hodnota `dog_events.calendar.bands`. Chýbajúci kľúč = náš odhad. */
export type CalBands = { life?: YearSpan; target?: YearSpan };

export const CAL_BANDS_FIELD = 'calendar.bands';
/** Červená z brandu — tá istá, akou DOG ID značí „ešte nie je hotové" (`.dogblk-fill`). */
export const PRE_RED = '#B25640';

/** Prečíta `calendar.bands` z `latest`. Neplatné rozpätie sa zahodí, nie opraví. */
export function asCalBands(v: unknown): CalBands {
  if (!v || typeof v !== 'object') return {};
  const o = v as Record<string, unknown>;
  const span = (x: unknown): YearSpan | undefined => {
    if (!x || typeof x !== 'object') return undefined;
    const { low, high } = x as Record<string, unknown>;
    return typeof low === 'number' && typeof high === 'number' && low >= 0 && high >= low && high <= 30
      ? { low, high } : undefined;
  };
  return { life: span(o.life), target: span(o.target) };
}

export type CalBandsSettingsProps = {
  dogId: string;
  dogName: string;
  /** `YYYY-MM-DD` narodenia — len na čítanie (v `/pack` ho dnes nikde nezmeníš). */
  birthLabel: string;
  /** `YYYY-MM-DD` z `basics.since`, alebo prázdne. */
  since: string;
  ourLife: YearSpan;
  ourTarget: YearSpan;
  /** Odkiaľ je náš odhad priemeru — veta z `bandText` kalendára. */
  ourLifeBasis: string;
  saved: CalBands;
  onClose: () => void;
  tx: Tx;
};

export function CalBandsSettings({
  dogId, dogName, birthLabel, since, ourLife, ourTarget, ourLifeBasis, saved, onClose, tx,
}: CalBandsSettingsProps) {
  const [sinceVal, setSinceVal] = useState(since);
  const [life, setLife] = useState<YearSpan>(saved.life ?? ourLife);
  const [target, setTarget] = useState<YearSpan>(saved.target ?? ourTarget);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const same = (a: YearSpan, b: YearSpan) => a.low === b.low && a.high === b.high;
  const valid = (x: YearSpan) => Number.isFinite(x.low) && Number.isFinite(x.high)
    && x.low >= 1 && x.high >= x.low && x.high <= 30;

  async function save(): Promise<void> {
    if (!valid(life) || !valid(target)) {
      setErr(tx('pack.cal.set.invalid', 'Years must be 1–30 and "from" cannot be higher than "to".'));
      return;
    }
    setSaving(true);
    setErr(null);
    const now = new Date().toISOString();
    const ev: DogEventInput[] = [];
    if (sinceVal && sinceVal !== since) {
      ev.push({ dogId, field: 'basics.since', value: sinceVal, source: 'profile', recordedAt: now });
    }
    // Zhoda s naším odhadom sa NEUKLADÁ ako vlastné číslo — inak by človek, ktorý
    // len klikol ULOŽIŤ, navždy zamrzol na dnešnom odhade a nový údaj (váha,
    // presnejšie plemeno) by sa ho už nedotkol.
    const next: CalBands = {
      ...(same(life, ourLife) ? {} : { life }),
      ...(same(target, ourTarget) ? {} : { target }),
    };
    const prev = JSON.stringify(saved);
    if (JSON.stringify(next) !== prev) {
      ev.push({ dogId, field: CAL_BANDS_FIELD, value: next, source: 'profile', recordedAt: now });
    }
    try {
      if (ev.length) await appendDogEvents(ev);
      onClose();
    } catch {
      setErr(tx('pack.diary.saveFailed', 'The entry could not be saved. Try again.'));
      setSaving(false);
    }
  }

  const btn: CSSProperties = {
    borderRadius: PACK_R.field, padding: `${PACK_SPACE.md}px ${PACK_SPACE.lg}px`, fontFamily: FONT_TITLE,
    fontSize: PACK_TEXT.label, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
    cursor: 'pointer', whiteSpace: 'nowrap', width: '100%',
    background: LAPIS.grad, border: `1px solid ${GOLD_BTN.edge}`, color: LAPIS.ink, boxShadow: LAPIS_BTN_SHADOW,
    opacity: saving ? 0.45 : 1,
  };

  const yrs = tx('pack.cal.life.years', 'rokov');
  const spanRow = (val: YearSpan, set: (v: YearSpan) => void, idp: string) => (
    <div className="cbs-span">
      <input id={`${idp}-lo`} className="pf-field dia-inp" type="number" inputMode="numeric" min={1} max={30}
        value={Number.isFinite(val.low) ? val.low : ''}
        onChange={(e) => set({ ...val, low: parseInt(e.target.value, 10) })}
        aria-label={tx('pack.cal.set.from', 'from')} />
      <span>–</span>
      <input id={`${idp}-hi`} className="pf-field dia-inp" type="number" inputMode="numeric" min={1} max={30}
        value={Number.isFinite(val.high) ? val.high : ''}
        onChange={(e) => set({ ...val, high: parseInt(e.target.value, 10) })}
        aria-label={tx('pack.cal.set.to', 'to')} />
      <span>{yrs}</span>
    </div>
  );
  const ours = (x: YearSpan, why: string) => (
    <p className="dia-hint">
      {tx('pack.cal.set.ours', 'Our estimate:')} {x.low}–{x.high} {yrs} · {why}{' '}
      <i>{tx('pack.cal.set.disclaimer', 'Based on available information — every dog is different.')}</i>
    </p>
  );
  const resetLink = (cur: YearSpan, our: YearSpan, set: (v: YearSpan) => void) => !same(cur, our) && (
    <button type="button" className="dia-link" onClick={() => set(our)}>
      {tx('pack.cal.set.reset', 'Use our estimate')}
    </button>
  );

  return createPortal((
    <div className="dia-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{PF_FIELD_CSS}{DIARY_CSS}{CSS}</style>
      <div className="dia-pop" role="dialog" aria-modal="true" aria-label={tx('pack.cal.set.title', 'Life frames')}>
        <div className="cbs-head">
          <BackButton tone="pale" onClick={onClose} label={tx('pack.diary.cancel', 'Cancel')} />
          <h4>{tx('pack.cal.set.title', 'Life frames')}</h4>
        </div>
        <p className="dia-hint" style={{ marginTop: 0 }}>
          {tx('pack.cal.set.intro', 'Three frames next to the years in the LIFE view. We set them for you; you can set them your way — {name} is your dog.').replace('{name}', dogName)}
        </p>

        {/* 🟥 PRED VAMI */}
        <div className="cbs-sec" style={{ borderColor: PRE_RED }}>
          <div className="cbs-t" style={{ color: PRE_RED }}>{tx('pack.cal.set.pre', 'Before you')}</div>
          <p className="dia-hint">{tx('pack.cal.set.preSub', 'From birth to the day they came to you — from a breeder, a shelter or the street.')}</p>
          <label className="dia-lbl" htmlFor="cbs-since">{tx('pack.cal.set.since', 'Together since')}</label>
          <input id="cbs-since" className="pf-field dia-inp" type="date" value={sinceVal}
            onChange={(e) => setSinceVal(e.target.value)} />
          <p className="dia-hint">
            {tx('pack.cal.set.birth', 'Born:')} {birthLabel} · {tx('pack.cal.set.sinceNote', 'the same date as in DOG ID')}
          </p>
        </div>

        {/* 🟨 PRIEMER */}
        <div className="cbs-sec" style={{ borderColor: T.accentGold }}>
          <div className="cbs-t" style={{ color: T.accentGold }}>{tx('pack.cal.set.life', 'Average lifespan')}</div>
          {spanRow(life, setLife, 'cbs-life')}
          {ours(ourLife, ourLifeBasis)}
          {resetLink(life, ourLife, setLife)}
        </div>

        {/* 🟩 OPTIMUM */}
        <div className="cbs-sec" style={{ borderColor: T.growGreen }}>
          <div className="cbs-t" style={{ color: T.growGreen }}>{tx('pack.cal.set.target', 'With excellent care')}</div>
          {spanRow(target, setTarget, 'cbs-tgt')}
          {ours(ourTarget, tx('pack.cal.set.targetWhy', 'up to 5 years above average with lean weight, movement and prevention'))}
          {resetLink(target, ourTarget, setTarget)}
        </div>

        {err && <p className="dia-err">{err}</p>}
        <div style={{ marginTop: PACK_SPACE.xl }}>
          <button type="button" style={btn} disabled={saving} onClick={() => void save()}>
            {saving ? tx('pack.diary.saving', 'Saving…') : tx('pack.cal.set.save', 'Save')}
          </button>
        </div>
      </div>
    </div>
  ), document.body);
}

const CSS = `
.cbs-head{display:flex;align-items:center;gap:${PACK_SPACE.md}px;margin-bottom:${PACK_SPACE.md}px}
.cbs-head h4{margin:0}
.cbs-sec{border:1px solid;border-radius:${PACK_R.tile}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;margin-top:${PACK_SPACE.lg}px}
.cbs-t{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;letter-spacing:0.14em;text-transform:uppercase}
.cbs-span{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;margin-top:${PACK_SPACE.sm}px;
  font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkWarm}}
.cbs-span .dia-inp{width:72px;text-align:center}
`;
