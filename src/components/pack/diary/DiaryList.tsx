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
//    (`readEvents`). Váženie sa tu NEUKAZUJE: je to číslo, žije vo váhovej krivke
//    a v kalendári; kronika je o zápiskoch (text + fotka). GALÉRIA nemá vlastnú
//    tabuľku: fotka je príloha zápisu, filter „Fotky" sú zápisy s `photo`.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { PACK_THEME, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { readEvents, onDogEventsChange } from '@/lib/dogEvents';
import { sizedUrl } from '@/services/cloudinaryService';
import { DIARY_CHIPS, asDiaryValue, isPlanDay } from './diaryModel';

const T = PACK_THEME;
const EMOJI_FONT = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

type Tx = (key: string, fallback: string) => string;

/** Len textové zápisky — váženie (`health.weightKg`) je číslo a patrí krivke. */
const TEXT_CHIPS = DIARY_CHIPS.filter((c) => c.input === 'text');
const TEXT_FIELDS = TEXT_CHIPS.map((c) => c.field);

export type DiaryRow = {
  key: string;
  dogId: string;
  field: string;
  recordedAt: string;
  text: string;
  photo?: string;
};

/** `YYYY-MM-DD` miestneho dňa — to isté porovnanie, aké robí `isPlanDay`. */
function dayKeyOf(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Zápisky psov, najnovší hore. `null` = ešte sa načítava. Prekreslí sa po každom zápise. */
export function useDiaryRows(dogIds: string[]): DiaryRow[] | null {
  const [rows, setRows] = useState<DiaryRow[] | null>(null);
  const ids = dogIds.join(',');

  useEffect(() => {
    let alive = true;
    const load = () => {
      readEvents(ids ? ids.split(',') : [], TEXT_FIELDS).then((evs) => {
        if (!alive) return;
        const out: DiaryRow[] = [];
        evs.forEach((ev, i) => {
          const v = asDiaryValue(ev.value);
          if (!v || (!v.text.trim() && !v.photo)) return;
          out.push({ key: ev.id ?? `${ev.dogId}-${ev.recordedAt}-${i}`, dogId: ev.dogId, field: ev.field,
            recordedAt: ev.recordedAt, text: v.text, photo: v.photo });
        });
        // Najnovší deň hore — kronika sa číta od včerajška dozadu.
        out.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
        setRows(out);
      }).catch(() => { if (alive) setRows([]); });
    };
    load();
    const off = onDogEventsChange(load);
    return () => { alive = false; off(); };
  }, [ids]);

  return rows;
}

/** Jeden zápis — celý text a celá fotka, nič orezané. */
export function DiaryItem({ row, dogName, tx }: { row: DiaryRow; dogName?: string; tx: Tx }) {
  const lang = (typeof document !== 'undefined' && document.documentElement.lang) || undefined;
  const chip = TEXT_CHIPS.find((c) => c.field === row.field);
  const plan = isPlanDay(dayKeyOf(row.recordedAt));
  return (
    <article className="dl-item" style={{ ...PACK_BOX.subblock }}>
      <div className="dl-meta">
        <span>{new Date(row.recordedAt).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        {plan && <span className="dl-plan">{tx('pack.diary.planTag', 'Plan')}</span>}
      </div>
      <div className="dl-kind">
        <span style={{ fontFamily: EMOJI_FONT }}>{chip?.emoji}</span>
        {chip ? tx(chip.labelKey, chip.labelFallback) : ''}
        {dogName && <span className="dl-dog">· {dogName}</span>}
      </div>
      {row.text.trim() && <p className="dl-text">{row.text}</p>}
      {row.photo && (
        <a className="pk-photo dl-photo" href={row.photo} target="_blank" rel="noreferrer">
          <img src={sizedUrl(row.photo, 720)} alt="" loading="lazy" />
        </a>
      )}
    </article>
  );
}

/** Rozmery z matríc — číslo mimo stupnice zhodí `npm run check:pack`. */
export const DIARY_LIST_CSS = `
.dl-list{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px}
.dl-item{padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px}
.dl-meta{display:flex;gap:${PACK_SPACE.sm}px;align-items:center;font-family:${FONT_UI};
  font-size:${PACK_TEXT.micro}px;letter-spacing:0.14em;text-transform:uppercase;color:${T.inkWarm}}
.dl-plan{border:1px solid ${LAPIS.edge};color:${LAPIS.edge};border-radius:${PACK_R.pill}px;padding:0 ${PACK_SPACE.sm}px}
.dl-kind{display:flex;gap:${PACK_SPACE.xs}px;align-items:center;margin-top:${PACK_SPACE.xs}px;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;color:${T.inkStrong}}
.dl-dog{font-family:${FONT_UI};font-weight:500;color:${T.inkWarm}}
.dl-text{white-space:pre-wrap;overflow-wrap:anywhere;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;
  line-height:1.55;color:${T.inkStrong};margin:${PACK_SPACE.sm}px 0 0}
/* Fotka na PC nesmie byť plagát cez 832 px stĺpec — strop 560, na mobile celá šírka. */
.dl-photo{margin-top:${PACK_SPACE.md}px;width:100%;max-width:560px;aspect-ratio:4/3}
`;
