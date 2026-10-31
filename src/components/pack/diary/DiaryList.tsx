// ════════════════════════════════════════════════════════════════════════════
// DENNÍK — ČITATEĽ. Kúsky, z ktorých sa skladá KRONIKA (`pages/PackChronicle.tsx`).
//
// PREČO (8. 10. 2026, testerka Daniela cez AINUBISA): zapísala 7. 10. spätne míľnik
// z 3. 10. aj s fotkou a ráno ho „nevedela nájsť". Zápis bol v DB celý — ale dlaždica
// DENNÍK otvárala len prázdny formulár na NOVÝ zápis a jediný čitateľ bol kalendár,
// ktorý z dlhého textu ukázal len prvý riadok. Denník, do ktorého sa dá písať a nedá
// sa v ňom listovať, je pre človeka stratený zápis.
//
// 🔁 8. 10. 2026 popoludní: prekryvná vrstva so zoznamom ZANIKLA. Matej nad nákresom
//    `plany/nakres-dogs-konsolidacia-2026-10-08.html`: denník + galéria = KRONIKA
//    s vlastnou obrazovkou (kôš 2, šípka späť). Ostal tu len čitateľ a jeden zápis.
//
// ⚠️ ŽIADNE NOVÉ ÚLOŽISKO — číta tie isté riadky `dog_events` ako kalendár
//    (`readEvents`). Váženie sa v KRONIKE ukazuje od 31. 10. 2026 (`opts.weights`) ako jeden riadok bez
//    úpravy — je to údaj, append-only; teaser na /pack/dogs ho ďalej nerátá. GALÉRIA nemá vlastnú
//    tabuľku: fotka je príloha zápisu, filter „Fotky" sú zápisy s `photo`.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { HandPencil, HandTrash } from '@/components/pack/HandIcons';
import { toast } from '@/hooks/use-toast';
import { PACK_THEME, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { readEvents, onDogEventsChange, deleteDiaryEvent } from '@/lib/dogEvents';
import { sizedUrl } from '@/services/cloudinaryService';
import { DIARY_CHIPS, asDiaryValue, isPlanDay } from './diaryModel';

const T = PACK_THEME;
const EMOJI_FONT = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

type Tx = (key: string, fallback: string) => string;

/** Len textové zápisky — váženie (`health.weightKg`) je číslo a patrí krivke. */
const TEXT_CHIPS = DIARY_CHIPS.filter((c) => c.input === 'text');
const TEXT_FIELDS = TEXT_CHIPS.map((c) => c.field);
/** Váženie je v KRONIKE od 31. 10. 2026 (audit D·9) — jeden riadok „⚖️ 24,5 kg", bez úpravy (údaj je append-only). */
const WEIGHT_CHIP = DIARY_CHIPS.find((c) => c.input === 'number')!;

export type DiaryRow = {
  key: string;
  /** `dog_events.id` (alebo `local-…` zo offline fronty). */
  id: string;
  dogId: string;
  field: string;
  recordedAt: string;
  /** Okamih zápisu — poradie v rámci dňa (zápis dňa nesie recordedAt na pol dňa, teda rovnaký pre všetky). */
  createdAt?: string;
  text: string;
  photo?: string;
  /** Len váženie. */
  kg?: number;
  /** Surová hodnota — úprava ju posiela formuláru. */
  value?: unknown;
};

/** `YYYY-MM-DD` miestneho dňa — to isté porovnanie, aké robí `isPlanDay`. */
function dayKeyOf(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Zápisky psov, najnovší hore. `null` = ešte sa načítava. Prekreslí sa po každom zápise. */
export function useDiaryRows(dogIds: string[], opts: { weights?: boolean } = {}): DiaryRow[] | null {
  const [rows, setRows] = useState<DiaryRow[] | null>(null);
  const ids = dogIds.join(',');
  const withWeights = !!opts.weights;

  useEffect(() => {
    let alive = true;
    const load = () => {
      readEvents(ids ? ids.split(',') : [], withWeights ? [...TEXT_FIELDS, WEIGHT_CHIP.field] : TEXT_FIELDS).then((evs) => {
        if (!alive) return;
        const out: DiaryRow[] = [];
        evs.forEach((ev, i) => {
          if (ev.field === WEIGHT_CHIP.field) {
            if (typeof ev.value === 'number' && ev.value > 0) {
              out.push({ key: ev.id ?? `${ev.dogId}-${ev.recordedAt}-${i}`, id: ev.id, dogId: ev.dogId, field: ev.field,
                recordedAt: ev.recordedAt, text: '', kg: ev.value });
            }
            return;
          }
          const v = asDiaryValue(ev.value);
          if (!v || (!v.text.trim() && !v.photo)) return;
          out.push({ key: ev.id ?? `${ev.dogId}-${ev.recordedAt}-${i}`, id: ev.id, dogId: ev.dogId, field: ev.field,
            recordedAt: ev.recordedAt, createdAt: ev.createdAt, text: v.text, photo: v.photo, value: ev.value });
        });
        // Najnovší deň hore — kronika sa číta od včerajška dozadu.
        out.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
        setRows(out);
      }).catch(() => { if (alive) setRows([]); });
    };
    load();
    const off = onDogEventsChange(load);
    return () => { alive = false; off(); };
  }, [ids, withWeights]);

  return rows;
}

/** Jeden zápis — celý text a celá fotka, nič orezané. `onEdit` = úprava (len zápisy denníka, nie váženie).
 *  `inDay` = riadok VNÚTRI karty dňa (Kronika od 31. 10. 2026): bez vlastného rámu a dátumu — ten nesie karta;
 *  druh sa píše len keď nie je obyčajná zápiska (⭐ míľnik, ⚖️ váha…), „Poznámka" pri každom riadku bol šum. */
export function DiaryItem({ row, dogName, tx, onEdit, inDay }: { row: DiaryRow; dogName?: string; tx: Tx; onEdit?: (row: DiaryRow) => void; inDay?: boolean }) {
  const lang = (typeof document !== 'undefined' && document.documentElement.lang) || undefined;
  const chip = DIARY_CHIPS.find((c) => c.field === row.field);
  const plan = isPlanDay(dayKeyOf(row.recordedAt));
  const editable = row.kg === undefined;   // váženie je údaj (append-only), zápis denníka je text autora
  const [askDel, setAskDel] = useState(false);
  const [busy, setBusy] = useState(false);
  const del = async () => {
    if (busy) return;
    setBusy(true);
    try { await deleteDiaryEvent(row.id); }   // prekreslenie nesie signál `onDogEventsChange`
    catch { toast({ title: tx('pack.diary.deleteFailed', 'Could not delete the entry.'), variant: 'destructive' }); setBusy(false); setAskDel(false); }
  };
  return (
    <article className={inDay ? 'dl-item dl-item--day' : 'dl-item'} style={inDay ? undefined : { ...PACK_BOX.subblock }}>
      <div className="dl-meta">
        {!inDay && <span>{new Date(row.recordedAt).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
        {inDay && (row.field !== 'diary.note' || dogName) && (
          <span className="dl-kind dl-kind--day">
            {row.field !== 'diary.note' && <><span style={{ fontFamily: EMOJI_FONT }}>{chip?.emoji}</span>{chip ? tx(chip.labelKey, chip.labelFallback) : ''}</>}
            {dogName && <span className="dl-dog">{row.field !== 'diary.note' ? '· ' : ''}{dogName}</span>}
          </span>
        )}
        {plan && <span className="dl-plan">{tx('pack.diary.planTag', 'Plan')}</span>}
        {editable && onEdit && (
          <span className="dl-acts">
            <button type="button" aria-label={tx('pack.diary.edit', 'Edit')} onClick={() => onEdit(row)}><HandPencil size={16} /></button>
            <button type="button" aria-label={tx('pack.diary.delete', 'Delete')} onClick={() => setAskDel(true)}><HandTrash size={16} /></button>
          </span>
        )}
      </div>
      {!inDay && (
        <div className="dl-kind">
          <span style={{ fontFamily: EMOJI_FONT }}>{chip?.emoji}</span>
          {chip ? tx(chip.labelKey, chip.labelFallback) : ''}
          {dogName && <span className="dl-dog">· {dogName}</span>}
        </div>
      )}
      {row.kg !== undefined && <p className="dl-text">{row.kg.toLocaleString(lang, { maximumFractionDigits: 1 })} kg</p>}
      {row.text.trim() && <p className="dl-text">{row.text}</p>}
      {row.photo && (
        <a className="pk-photo dl-photo" href={row.photo} target="_blank" rel="noreferrer">
          <img src={sizedUrl(row.photo, 720)} alt="" loading="lazy" />
        </a>
      )}
      {askDel && (
        <div className="dl-ask" role="alertdialog" aria-label={tx('pack.diary.deleteQ', 'Delete this entry?')}>
          <span>{tx('pack.diary.deleteQ', 'Delete this entry?')}</span>
          <button type="button" onClick={() => void del()} disabled={busy}>{tx('pack.diary.deleteYes', 'Delete')}</button>
          <button type="button" className="no" onClick={() => setAskDel(false)}>{tx('pack.diary.deleteNo', 'Keep it')}</button>
        </div>
      )}
    </article>
  );
}

/** Rozmery z matríc — číslo mimo stupnice zhodí `npm run check:pack`. */
export const DIARY_LIST_CSS = `
.dl-list{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px}
.dl-item{padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px}
.dl-item--day{padding:${PACK_SPACE.md}px 0 0;border-top:1px solid ${T.hairline}}
.dl-item--day .dl-text{margin-top:0}
.dl-item--day > .dl-meta{float:right;margin:-8px -8px 0 ${PACK_SPACE.sm}px}
.dl-item--day::after{content:'';display:block;clear:both}
.dl-kind--day{margin-top:0;font-size:${PACK_TEXT.label}px;text-transform:none;letter-spacing:0}
.dl-meta{display:flex;gap:${PACK_SPACE.sm}px;align-items:center;font-family:${FONT_UI};
  font-size:${PACK_TEXT.micro}px;letter-spacing:0.14em;text-transform:uppercase;color:${T.inkWarm}}
.dl-acts{margin-left:auto;display:inline-flex;gap:${PACK_SPACE.xs}px}
.dl-acts button{appearance:none;display:grid;place-items:center;width:40px;height:40px;padding:0;background:none;border:0;border-radius:${PACK_R.pill}px;cursor:pointer;color:${T.inkWarm}}
.dl-ask{display:flex;align-items:center;gap:${PACK_SPACE.md}px;flex-wrap:wrap;margin-top:${PACK_SPACE.md}px}
.dl-ask span{flex:1 1 100%;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.body}px;color:${T.inkStrong}}
.dl-ask button{border-radius:${PACK_R.field}px;cursor:pointer;padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.label}px;border:1.5px solid ${T.border};background:${T.card};color:${T.inkStrong}}
.dl-ask button.no{border-color:${LAPIS.edge};color:${LAPIS.edge}}
.dl-plan{border:1px solid ${LAPIS.edge};color:${LAPIS.edge};border-radius:${PACK_R.pill}px;padding:0 ${PACK_SPACE.sm}px}
.dl-kind{display:flex;gap:${PACK_SPACE.xs}px;align-items:center;margin-top:${PACK_SPACE.xs}px;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;color:${T.inkStrong}}
.dl-dog{font-family:${FONT_UI};font-weight:500;color:${T.inkWarm}}
.dl-text{white-space:pre-wrap;overflow-wrap:anywhere;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;
  line-height:1.55;color:${T.inkStrong};margin:${PACK_SPACE.sm}px 0 0}
/* Fotka na PC nesmie byť plagát cez 832 px stĺpec — strop 560, na mobile celá šírka.
   POMER FOTKY, NIE RÁMU (20. 10. 2026): rám 4:3 + cover nechal z fotky na výšku len pás
   v strede — Alenka: „ukazuje ich odrezané". Výška má strop, aby fotka na výšku
   nezabrala celé okno; obraz sa vtedy zúži, neoreže. */
.dl-photo{margin-top:${PACK_SPACE.md}px;width:fit-content;max-width:min(100%, 560px)}
.pk-photo.dl-photo > img{width:auto;max-width:100%;height:auto;max-height:min(70vh, 560px);object-fit:contain}
`;
