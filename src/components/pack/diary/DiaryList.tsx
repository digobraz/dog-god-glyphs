// ════════════════════════════════════════════════════════════════════════════
// DENNÍK — ČITATEĽ. Dlaždica DENNÍK na `/pack/dogs` otvára TOTO, nie formulár.
//
// PREČO (8. 10. 2026, testerka Daniela cez AINUBISA): zapísala 7. 10. spätne míľnik
// z 3. 10. aj s fotkou a ráno ho „nevedela nájsť". Zápis bol v DB celý — ale dlaždica
// DENNÍK otvárala len prázdny formulár na NOVÝ zápis a jediný čitateľ bol kalendár,
// ktorý z dlhého textu ukázal len prvý riadok. Denník, do ktorého sa dá písať a nedá
// sa v ňom listovať, je pre človeka stratený zápis.
//
// ⚠️ ŽIADNE NOVÉ ÚLOŽISKO — číta tie isté riadky `dog_events` ako kalendár
//    (`readEvents`). Váženie sa tu NEUKAZUJE: je to číslo, žije vo váhovej krivke
//    a v kalendári; zoznam je o zápiskoch (text + fotka).
// ⚠️ PREKRYVOVÁ VRSTVA, nie routa (lock `architektura-pack.md` §4.2). Formulár sa
//    otvára NAD zoznamom; po zápise sa zoznam prekreslí sám cez `onDogEventsChange`.
// ⚠️ Šat je ten istý papyrus ako formulár (`DIARY_CSS`) — dve vrstvy jedného denníka.
//    Zavretie = šípka späť vľavo hore (krížik v `/pack` neexistuje, lock 27. 9. 2026).
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  PACK_THEME, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, GOLD_BTN,
  FONT_TITLE, FONT_UI, PF_FIELD_CSS, PILL_CSS, PHOTO_CSS,
} from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { BackButton } from '@/components/pack/BackButton';
import { readEvents, onDogEventsChange } from '@/lib/dogEvents';
import { sizedUrl } from '@/services/cloudinaryService';
import { DIARY_CHIPS, asDiaryValue, isPlanDay } from './diaryModel';
import { DIARY_CSS, type DiaryDog } from './DiaryEntry';

const T = PACK_THEME;
const EMOJI_FONT = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

type Tx = (key: string, fallback: string) => string;

/** Len textové zápisky — váženie (`health.weightKg`) je číslo a patrí krivke. */
const TEXT_CHIPS = DIARY_CHIPS.filter((c) => c.input === 'text');
const TEXT_FIELDS = TEXT_CHIPS.map((c) => c.field);

type Row = {
  key: string;
  dogId: string;
  field: string;
  recordedAt: string;
  text: string;
  photo?: string;
};

export type DiaryListProps = {
  dogs: DiaryDog[];
  /** Otvorí formulár nového zápisu NAD zoznamom. */
  onWrite: () => void;
  onClose: () => void;
  tx: Tx;
};

/** `YYYY-MM-DD` miestneho dňa — to isté porovnanie, aké robí `isPlanDay`. */
function dayKeyOf(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function DiaryList({ dogs, onWrite, onClose, tx }: DiaryListProps) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const ids = dogs.map((d) => d.id).join(',');

  useEffect(() => {
    let alive = true;
    const load = () => {
      readEvents(ids ? ids.split(',') : [], TEXT_FIELDS).then((evs) => {
        if (!alive) return;
        const out: Row[] = [];
        evs.forEach((ev, i) => {
          const v = asDiaryValue(ev.value);
          if (!v || (!v.text.trim() && !v.photo)) return;
          out.push({ key: ev.id ?? `${ev.dogId}-${ev.recordedAt}-${i}`, dogId: ev.dogId, field: ev.field,
            recordedAt: ev.recordedAt, text: v.text, photo: v.photo });
        });
        // Najnovší deň hore — denník sa číta od včerajška dozadu.
        out.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
        setRows(out);
      }).catch(() => { if (alive) setRows([]); });
    };
    load();
    const off = onDogEventsChange(load);
    return () => { alive = false; off(); };
  }, [ids]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const lang = (typeof document !== 'undefined' && document.documentElement.lang) || undefined;
  const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
  const nameOf = (id: string) => dogs.find((d) => d.id === id)?.name ?? '';

  const btn: CSSProperties = {
    borderRadius: PACK_R.field,
    padding: `${PACK_SPACE.md}px ${PACK_SPACE.lg}px`,
    fontFamily: FONT_TITLE,
    fontSize: PACK_TEXT.label,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    width: '100%',
    background: LAPIS.grad,
    border: `1px solid ${GOLD_BTN.edge}`,
    color: LAPIS.ink,
    boxShadow: LAPIS_BTN_SHADOW,
  };

  return createPortal((
    <div className="dia-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{PF_FIELD_CSS}{PILL_CSS}{PHOTO_CSS}{DIARY_CSS}{CSS}</style>
      <div className="dia-pop" role="dialog" aria-modal="true" aria-label={tx('pack.diary.listTitle', 'Diary')}>
        <div className="dl-head">
          <BackButton tone="pale" onClick={onClose} label={tx('pack.diary.cancel', 'Cancel')} />
          <h4>{tx('pack.diary.listTitle', 'Diary')}</h4>
        </div>

        {/* NOVÝ ZÁPIS HORE — jediné CTA vrstvy, preto lapis cez celú šírku. */}
        <button type="button" style={btn} onClick={onWrite}>
          {tx('pack.diary.new', '+ New entry')}
        </button>

        {rows === null && <p className="dia-hint dl-gap">{tx('pack.diary.loading', 'Loading…')}</p>}
        {rows !== null && rows.length === 0 && (
          <p className="dia-hint dl-gap">{tx('pack.diary.empty', 'Nothing written yet. The first entry starts the story.')}</p>
        )}

        {rows && rows.length > 0 && (
          <div className="dl-list">
            {rows.map((r) => {
              const chip = TEXT_CHIPS.find((c) => c.field === r.field);
              const plan = isPlanDay(dayKeyOf(r.recordedAt));
              return (
                <article key={r.key} className="dl-item" style={{ ...PACK_BOX.subblock }}>
                  <div className="dl-meta">
                    <span>{fmtDay(r.recordedAt)}</span>
                    {plan && <span className="dl-plan">{tx('pack.diary.planTag', 'Plan')}</span>}
                  </div>
                  <div className="dl-kind">
                    <span style={{ fontFamily: EMOJI_FONT }}>{chip?.emoji}</span>
                    {chip ? tx(chip.labelKey, chip.labelFallback) : ''}
                    {dogs.length > 1 && <span className="dl-dog">· {nameOf(r.dogId)}</span>}
                  </div>
                  {r.text.trim() && <p className="dl-text">{r.text}</p>}
                  {r.photo && (
                    <a className="pk-photo dl-photo" href={r.photo} target="_blank" rel="noreferrer">
                      <img src={sizedUrl(r.photo, 720)} alt="" loading="lazy" />
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  ), document.body);
}

/** Rozmery z matríc — číslo mimo stupnice zhodí `npm run check:pack`. */
const CSS = `
.dl-head{display:flex;align-items:center;gap:${PACK_SPACE.md}px;margin-bottom:${PACK_SPACE.md}px}
.dl-head h4{margin:0}
.dl-gap{margin-top:${PACK_SPACE.lg}px}
.dl-list{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;margin-top:${PACK_SPACE.lg}px}
.dl-item{padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px}
.dl-meta{display:flex;gap:${PACK_SPACE.sm}px;align-items:center;font-family:${FONT_UI};
  font-size:${PACK_TEXT.micro}px;letter-spacing:0.14em;text-transform:uppercase;color:${T.inkWarm}}
.dl-plan{border:1px solid ${LAPIS.edge};color:${LAPIS.edge};border-radius:${PACK_R.pill}px;padding:0 ${PACK_SPACE.sm}px}
.dl-kind{display:flex;gap:${PACK_SPACE.xs}px;align-items:center;margin-top:${PACK_SPACE.xs}px;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;color:${T.inkStrong}}
.dl-dog{font-family:${FONT_UI};font-weight:500;color:${T.inkWarm}}
.dl-text{white-space:pre-wrap;overflow-wrap:anywhere;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;
  line-height:1.55;color:${T.inkStrong};margin:${PACK_SPACE.sm}px 0 0}
.dl-photo{margin-top:${PACK_SPACE.md}px;width:100%;aspect-ratio:4/3}
`;
