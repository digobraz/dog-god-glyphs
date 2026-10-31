// ════════════════════════════════════════════════════════════════════════════
// TELO KRONIKY — hero s knihou a NAPÍSAŤ, filter psov, zápisy po mesiacoch, úprava a zmazanie.
// Jedno telo pre dve miesta (audit appky 30. 10. 2026, D·10): obrazovka `/pack/dogs/chronicle`
// a záložka Denník na profile JA. Kronika sa nekopíruje — mení sa tu a platí na oboch.
// ⚠️ Zápis (`DiaryEntry`) je prekryv NAD stránkou (lock §4.2) — človek z kroniky neodíde.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  PACK_THEME, PACK_HEAD, PACK_SPACE, PACK_TEXT, PACK_R, GOLD_BTN,
  FONT_TITLE, /* písmo: cta */ FONT_UI, PILL_CSS, PHOTO_CSS,
} from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { DiaryEntry, type DiaryEditTarget } from './DiaryEntry';
import { ChronicleBook } from './ChronicleBook';
import { DiaryItem, DIARY_LIST_CSS, useDiaryRows, type DiaryRow } from './DiaryList';
import { loadPackDogs } from '@/lib/packDogsList';

const T = PACK_THEME;
type Tx = (key: string, fallback: string) => string;
type ChronDog = { id: string; dog_name: string | null };

export function ChronicleBody({ tx }: { tx: Tx }) {
  const [dogs, setDogs] = useState<ChronDog[] | null>(null);
  const [dogSel, setDogSel] = useState<string>('all');
  const [write, setWrite] = useState(false);
  const [editing, setEditing] = useState<DiaryEditTarget | null>(null);

  useEffect(() => {
    let alive = true;
    loadPackDogs<ChronDog>('id, dog_name').then((rows) => { if (alive) setDogs(rows); });
    return () => { alive = false; };
  }, []);

  const rows = useDiaryRows((dogs ?? []).map((d) => d.id), { weights: true });
  const nameOf = (id: string) => dogs?.find((d) => d.id === id)?.dog_name ?? '';
  const many = (dogs?.length ?? 0) > 1;

  // Filter → zoskupenie po MESIACOCH (kronika sa číta ako kapitoly, nie ako nekonečný zoznam).
  const lang = (typeof document !== 'undefined' && document.documentElement.lang) || undefined;
  const months = useMemo(() => {
    const list = (rows ?? []).filter((r) => dogSel === 'all' || r.dogId === dogSel);
    const out: { label: string; items: DiaryRow[] }[] = [];
    for (const r of list) {
      const label = new Date(r.recordedAt).toLocaleDateString(lang, { month: 'long', year: 'numeric' });
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(r); else out.push({ label, items: [r] });
    }
    return out;
  }, [rows, dogSel, lang]);

  const cta: CSSProperties = {
    width: '100%', maxWidth: 320, borderRadius: PACK_R.field, padding: `${PACK_SPACE.md}px ${PACK_SPACE.lg}px`,
    fontFamily: FONT_TITLE, /* písmo: cta */
    fontSize: PACK_TEXT.label, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
    cursor: 'pointer', whiteSpace: 'nowrap', background: LAPIS.grad, border: `1px solid ${GOLD_BTN.edge}`,
    color: LAPIS.ink, boxShadow: LAPIS_BTN_SHADOW,
  };

  return (
    <>
      <style>{PILL_CSS}{PHOTO_CSS}{DIARY_LIST_CSS}{CHRONICLE_CSS}</style>
      {/* HERO — kniha s packou + jediné CTA NAPÍSAŤ (Matej 8. 10.: „bez CTA photo, iba write").
          Fotka sa pridáva VO formulári zápisu, takže samostatné tlačidlo by bol druhý vchod
          do toho istého okna. */}
      <div className="chr-hero">
        <ChronicleBook size={128} />
        <button type="button" style={cta} onClick={() => setWrite(true)}>{tx('pack.chronicle.write', 'Write')}</button>
      </div>

      {many && (
        <div className="chr-pills">
          <button type="button" className={`pk-pill pk-pill--tap chr-pill${dogSel === 'all' ? ' on' : ''}`} onClick={() => setDogSel('all')}>
            {tx('pack.chronicle.allDogs', 'All')}
          </button>
          {dogs!.map((d) => (
            <button key={d.id} type="button" className={`pk-pill pk-pill--tap chr-pill${dogSel === d.id ? ' on' : ''}`} onClick={() => setDogSel(d.id)}>
              {d.dog_name ?? '—'}
            </button>
          ))}
        </div>
      )}
      {/* Filter VŠETKO / FOTKY zanikol (Matej 8. 10.: „toto nechápem, everything a photos…
          tam nemusí byť nič zatiaľ"). Fotka je príloha zápisu, nie druh obsahu. */}

      {rows === null && <p className="chr-hint">{tx('pack.diary.loading', 'Loading…')}</p>}
      {rows !== null && months.length === 0 && (
        <p className="chr-hint">{tx('pack.diary.empty', 'Nothing written yet. The first entry starts the story.')}</p>
      )}
      {months.map((m) => (
        <div key={m.label} className="chr-month">
          <div style={{ ...PACK_HEAD.section, color: T.inkWarm }}>{m.label}</div>
          <div className="dl-list">
            {m.items.map((r) => (
              <DiaryItem key={r.key} row={r} dogName={many ? nameOf(r.dogId) : undefined} tx={tx}
                onEdit={(row) => setEditing({ id: row.id, dogId: row.dogId, field: row.field, value: row.value, recordedAt: row.recordedAt })} />
            ))}
          </div>
        </div>
      ))}

      {write && dogs && dogs.length > 0 && (
        <DiaryEntry
          dogs={dogs.map((d) => ({ id: d.id, name: d.dog_name ?? '—' }))}
          // Filter na jedného psa = NAPÍSAŤ ho predvyplní (audit 30. 10. 2026).
          dogId={dogSel !== 'all' ? dogSel : undefined}
          mode="write"
          onClose={() => setWrite(false)}
          tx={tx}
        />
      )}
      {editing && dogs && (
        <DiaryEntry
          dogs={dogs.map((d) => ({ id: d.id, name: d.dog_name ?? '—' }))}
          edit={editing}
          onClose={() => setEditing(null)}
          tx={tx}
        />
      )}
    </>
  );
}

const CHRONICLE_CSS = `
.chr-pills{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;margin-bottom:${PACK_SPACE.lg}px}
.chr-pill{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;letter-spacing:0.02em;text-transform:uppercase}
.chr-pill.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.chr-hero{display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.lg}px;margin:${PACK_SPACE.sm}px 0 ${PACK_SPACE.xl}px}
.chr-hint{font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkWarm};margin:0}
.chr-month{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;margin-bottom:${PACK_SPACE.xl}px}
`;
