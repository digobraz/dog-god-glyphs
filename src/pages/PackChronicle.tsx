// ════════════════════════════════════════════════════════════════════════════
// KRONIKA — `/pack/dogs/chronicle`. Denník + galéria na JEDNOM mieste (8. 10. 2026).
//
// Matej nad nákresom `plany/nakres-dogs-konsolidacia-2026-10-08.html`:
// *„denník musí mať svoj vlastný dashboard, kde vidí prehľadne svoje zápisky — taká
// kronika s možnosťou zápisu v hlasovke… pri viacerých psoch možnosť vybrať jedného
// alebo všetkých"* · *„denník zlúčiť s galériou, pretože sa tam bude ukladať aj foto"*.
// Podnet: testerka Daniela nevidela, čo už zapísala.
//
// ⚠️ KÔŠ 2 „POZERÁM SA" (lock `architektura-pack.md` §3) — čítanie, lišta ostáva,
//    hore šípka späť. Písanie je formulár `DiaryEntry` NAD stránkou (prekryv), takže
//    zápis človeka z kroniky neodnesie (§4.2).
// ⚠️ ŽIADNE NOVÉ ÚLOŽISKO — `dog_events` cez `useDiaryRows`. Galéria = zápisy s fotkou.
// ✍️ JEDINÉ CTA = NAPÍSAŤ (Matej 8. 10.: „bez CTA photo — iba write"). Fotka je príloha
//    vo formulári zápisu. Formulár je široký 640 px (`.dia-pop--write`).
// 🟡 HLASOVKA S PREPISOM je schválená, ale je to DRUHÝ krok (úložisko zvuku + prepis
//    sa platí za minútu — cena sa Matejovi ukáže pred stavbou). Filter „Hlasovky"
//    preto ešte nie je: filter bez jediného možného zápisu by klamal.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackLayout } from '@/components/pack/PackLayout';
import { BackButton } from '@/components/pack/BackButton';
import {
  PACK_THEME, PACK_BOX, PACK_HEAD, PACK_SPACE, PACK_TEXT, PACK_R, GOLD_BTN,
  FONT_TITLE, FONT_UI, PILL_CSS, PHOTO_CSS,
} from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PALE, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { DiaryEntry } from '@/components/pack/diary/DiaryEntry';
import { ChronicleBook } from '@/components/pack/diary/ChronicleBook';
import { DiaryItem, DIARY_LIST_CSS, useDiaryRows, type DiaryRow } from '@/components/pack/diary/DiaryList';
import { loadPackDogs } from '@/lib/packDogsList';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
type Tx = (key: string, fallback: string) => string;
type ChronDog = { id: string; dog_name: string | null };
type Kind = 'all' | 'photo';

export default function PackChronicle() {
  const t = useT();
  const tx: Tx = (key, fallback) => { const v = t(key); return v === key ? fallback : v; };
  const navigate = useNavigate();

  const [dogs, setDogs] = useState<ChronDog[] | null>(null);
  const [dogSel, setDogSel] = useState<string>('all');
  const [kind, setKind] = useState<Kind>('all');
  const [write, setWrite] = useState(false);

  useEffect(() => {
    let alive = true;
    loadPackDogs<ChronDog>('id, dog_name').then((rows) => { if (alive) setDogs(rows); });
    return () => { alive = false; };
  }, []);

  const rows = useDiaryRows((dogs ?? []).map((d) => d.id));
  const nameOf = (id: string) => dogs?.find((d) => d.id === id)?.dog_name ?? '';
  const many = (dogs?.length ?? 0) > 1;

  // Filter → zoskupenie po MESIACOCH (kronika sa číta ako kapitoly, nie ako nekonečný zoznam).
  const lang = (typeof document !== 'undefined' && document.documentElement.lang) || undefined;
  const months = useMemo(() => {
    const list = (rows ?? []).filter((r) => (dogSel === 'all' || r.dogId === dogSel) && (kind === 'all' || !!r.photo));
    const out: { label: string; items: DiaryRow[] }[] = [];
    for (const r of list) {
      const label = new Date(r.recordedAt).toLocaleDateString(lang, { month: 'long', year: 'numeric' });
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(r); else out.push({ label, items: [r] });
    }
    return out;
  }, [rows, dogSel, kind, lang]);

  const back = () => { if (window.history.length > 1) navigate(-1); else navigate('/pack/dogs'); };

  const cta: CSSProperties = {
    width: '100%', maxWidth: 320, borderRadius: PACK_R.field, padding: `${PACK_SPACE.md}px ${PACK_SPACE.lg}px`, fontFamily: FONT_TITLE,
    fontSize: PACK_TEXT.label, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
    cursor: 'pointer', whiteSpace: 'nowrap', background: LAPIS.grad, border: `1px solid ${GOLD_BTN.edge}`,
    color: LAPIS.ink, boxShadow: LAPIS_BTN_SHADOW,
  };

  return (
    <PackLayout>
      <style>{PILL_CSS}{PHOTO_CSS}{DIARY_LIST_CSS}{CSS}</style>
      <section style={{ ...PACK_BOX.card, padding: PACK_SPACE.xl }}>
        <div className="chr-head">
          <BackButton tone="pale" onClick={back} label={tx('pack.chronicle.back', 'Back')} />
          <h1 style={{ ...PACK_HEAD.card, color: PALE.deep, margin: 0 }}>{tx('pack.chronicle.title', 'Chronicle')}</h1>
        </div>

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
        <div className="chr-pills">
          {(['all', 'photo'] as const).map((k) => (
            <button key={k} type="button" className={`pk-pill pk-pill--tap chr-pill${kind === k ? ' on' : ''}`} onClick={() => setKind(k)}>
              {k === 'all' ? tx('pack.chronicle.kindAll', 'Everything') : tx('pack.chronicle.kindPhoto', 'Photos')}
            </button>
          ))}
        </div>

        {rows === null && <p className="chr-hint">{tx('pack.diary.loading', 'Loading…')}</p>}
        {rows !== null && months.length === 0 && (
          <p className="chr-hint">{kind === 'photo'
            ? tx('pack.chronicle.noPhotos', 'No photos yet. Add one to an entry and it will show up here.')
            : tx('pack.diary.empty', 'Nothing written yet. The first entry starts the story.')}</p>
        )}
        {months.map((m) => (
          <div key={m.label} className="chr-month">
            <div style={{ ...PACK_HEAD.section, color: T.inkWarm }}>{m.label}</div>
            <div className="dl-list">
              {m.items.map((r) => <DiaryItem key={r.key} row={r} dogName={many ? nameOf(r.dogId) : undefined} tx={tx} />)}
            </div>
          </div>
        ))}
      </section>

      {write && dogs && (
        <DiaryEntry
          dogs={dogs.map((d) => ({ id: d.id, name: d.dog_name ?? '—' }))}
          mode="write"
          onClose={() => setWrite(false)}
          tx={tx}
        />
      )}
    </PackLayout>
  );
}

const CSS = `
.chr-head{display:flex;align-items:center;gap:${PACK_SPACE.md}px;margin-bottom:${PACK_SPACE.lg}px}
.chr-pills{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;margin-bottom:${PACK_SPACE.lg}px}
.chr-pill{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;letter-spacing:0.02em;text-transform:uppercase}
.chr-pill.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.chr-hero{display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.lg}px;margin:${PACK_SPACE.sm}px 0 ${PACK_SPACE.xl}px}
.chr-hint{font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkWarm};margin:0}
.chr-month{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;margin-bottom:${PACK_SPACE.xl}px}
`;
