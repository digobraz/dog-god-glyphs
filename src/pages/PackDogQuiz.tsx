// KVÍZ ENGINE (`/pack/dogs/quiz/:key`, voliteľne `?dog=<id>`) — VSTUP.
// Zadanie: plany/zadanie-mypack-petpas-2026-08-06.md §6, nákres: obrazovka B.
//
// TRI VECI, KTORÉ SA TU NESMÚ ROZBIŤ:
//  1. „Multiodpoveď je vlastnosť FORMULÁRA, nie stránky" (§2/2) — jedna otázka na
//     obrazovke, pod ňou riadok odpovedí PER PES + „rovnako pre všetkých".
//  2. „Solo = ten istý engine" (§2/3) — pri jednom psovi sa riadok psa nevykreslí
//     a odpoveď ide rovno jemu. ŽIADNA druhá vetva v UX, žiadny druhý dizajn.
//     V kóde je to jeden `if` okolo hlavičky riadku, nie druhá komponenta.
//  3. Zápis ide ako APPEND do `dog_events` (§4), nikdy ako prepis. Preto sa pri
//     „Ďalej" posielajú len polia, ktoré sa reálne ZMENILI — inak by log narástol
//     o duplicitné riadky pri každom preklikaní kvízu tam a späť.
//
// Vizuál: Matej 6.8. — „zmeníme neskôr vizuál toho kvízu na kompaktnejší". Mechanika
// je podľa nákresu, vizuál NIE je finálny.
//
// DOG ID = MODULY (8. 10. 2026, lock `dogs-dogid.md` §REVÍZIA): kľúč `base` je modul
// ZÁKLAD — šesť sekcií ako JEDEN súvislý flow (`BASE_FLOW`), hore pás sekcií a celkový
// progres. Pre KAŽDÝ kľúč platí: otvorenie skočí na PRVÚ NEVYPLNENÚ otázku (nie na
// začiatok), dá sa PRESKOČIŤ a pri otázke je HISTÓRIA predošlých hodnôt s dátumom —
// `dog_events` je append-only, úprava nič neprepíše.
import { sizedUrl } from '@/services/cloudinaryService';
import { trackPack } from '@/lib/packAnalytics';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PackTopRow } from '@/components/pack/PackTopRow';
import { PACK_THEME, FONT_TITLE, FONT_UI, PF_FIELD_CSS, PAPER_PAGE_CSS, usePaperRoute, PACK_TOPROW_PAD } from '@/components/pack/packTheme';
import { QUIZ_BY_KEY, quizValueLabel, type QuizStep } from '@/components/pack/dogQuiz';
import { BASE_FLOW, BASE_SEGMENTS, segmentAt, firstOpenStep } from '@/components/pack/dogIdModules';
import { appendDogEvents, readEvents, readLatestForDogs, type DogEvent, type DogEventInput, type LatestValue } from '@/lib/dogEvents';
import { supabase } from '@/integrations/supabase/client';
import { getAccessibleDogIds } from '@/lib/dogRights';
import { useT } from '@/i18n/LanguageContext';
import { HandCheck } from '@/components/pack/HandIcons';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';

const T = PACK_THEME;
const NAME_FONT = "'Cinzel Decorative', 'Cinzel', serif";

interface QuizDog { id: string; dog_name: string | null; cloudinary_main_url: string | null }

/** Hodnota odpovede — `string` (single/number/date/text) alebo `string[]` (multi/chips). */
type Answer = string | string[] | null;

const QUIZ_CSS = `
/* CTA na papyruse = LAPIS (brand kánon 28. 8., rovnako ako kvíz povahy .nq-gold).
   Oranžovo-zlatý gradient patrí na tmavý podklad; tu stojí tlačidlo vždy na karte. */
.qz-gold{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:12px 24px;
  background:${LAPIS.grad};
  border:1px solid ${LAPIS.edge}; border-radius:8px; color:${LAPIS.ink};
  font-family:'Cinzel',serif; font-size:10px; font-weight:700;
  letter-spacing:0.14em; text-transform:uppercase; cursor:pointer; white-space:nowrap;
  box-shadow:${LAPIS_BTN_SHADOW};
  transition: transform .2s, box-shadow .22s;
}
.qz-gold:hover{ transform:scale(1.04); background:${LAPIS.gradHover}; }
.qz-gold:disabled{ opacity:.45; cursor:default; transform:none; box-shadow:none; }
.qz-ghost{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:12px 24px; background:transparent;
  border:1.5px solid ${T.border}; border-radius:8px; color:${T.inkWarm};
  font-family:'Cinzel',serif; font-size:10px; font-weight:700;
  letter-spacing:0.14em; text-transform:uppercase; cursor:pointer;
}
.qz-ghost:hover{ border-color:${T.cardEdge}; color:${T.inkStrong}; }
.qz-pill{ font-family:'Space Grotesk',sans-serif; font-size:12px; font-weight:500;
  padding:8px 12px; border-radius:999px; cursor:pointer; }
/* STROP VÝBERU (2026-09-02) — pilulka nad strop nezhasína priesvitnosťou: papyrus je svetlý
   a krytie na ňom takmer nič neurobí (to isté zistenie ako pri prezliekaní na bledé).
   Stlmí sa preto INKOUST a rám, výplň ostáva. */
.qz-pill.is-capped{ cursor:not-allowed; color:rgba(42,22,8,.34); border-color:rgba(179,130,45,.22); }
/* Pole kvizu stoji vzdy na papyrusovej karte: natívny kalendar musi byt svetly. */
.qz-card .pf-field{ color-scheme:light; }
.qz-cap-note{ font-family:'Space Grotesk',sans-serif; font-size:12px; color:${T.inkWarm}; margin:2px 0 0; }
/* PÁS SEKCIÍ ZÁKLADU (8. 10. 2026). Text, nie pilulky — je to mapa polohy, nie výber;
   pilulky by vedľa odpovedí (tiež pilulky) súperili o pozornosť. */
/* JEDEN riadok, posúva sa vodorovne — na mobile sa šesť názvov lámalo do troch riadkov
   a otázka klesla o pol obrazovky. Aktuálna sekcia sa sama posunie do zorného poľa. */
.qz-segs{ display:flex; gap:12px; margin:-4px 0 16px; overflow-x:auto; scrollbar-width:none;
  -webkit-mask-image:linear-gradient(90deg,#000 88%,transparent); mask-image:linear-gradient(90deg,#000 88%,transparent); }
.qz-segs::-webkit-scrollbar{ display:none; }
.qz-seg{ flex:0 0 auto; white-space:nowrap; }
.qz-seg{ position:relative; padding:4px 0 4px 12px; background:none; border:0; cursor:pointer;
  font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:500; letter-spacing:0.14em;
  text-transform:uppercase; color:${T.inkFaint}; }
.qz-seg::before{ content:''; position:absolute; left:0; top:50%; width:6px; height:6px; margin-top:-3px;
  border-radius:999px; background:rgba(122,90,42,0.22); }
.qz-seg.is-done::before{ background:#3D7A4E; }
.qz-seg.is-on{ color:${LAPIS.edge}; font-weight:600; }
.qz-seg.is-on::before{ background:${LAPIS.edge}; }
.qz-seg:hover{ color:${T.inkStrong}; }
.qz-skip{ padding:12px 12px; background:none; border:0; cursor:pointer;
  font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:0.14em;
  text-transform:uppercase; color:${T.inkWarm}; text-decoration:underline; text-underline-offset:4px;
  text-decoration-color:rgba(122,90,42,0.35); }
.qz-skip:hover{ color:${T.inkStrong}; text-decoration-color:currentColor; }
.qz-skip:disabled{ opacity:.45; cursor:default; }
/* HISTÓRIA POĽA — „nič sa neprepíše, staré ostáva v archíve" (nákres v3). */
.qz-hist{ margin-top:8px; }
.qz-hist > button{ display:inline-flex; align-items:center; gap:4px; background:none; border:0; padding:4px 0; cursor:pointer;
  font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:500; letter-spacing:0.14em;
  text-transform:uppercase; color:${T.inkFaint}; }
.qz-hist > button:hover{ color:${T.inkStrong}; }
.qz-hist ol{ list-style:none; margin:4px 0 0; padding:8px 12px; border-left:2px solid ${T.border}; }
.qz-hist li{ display:flex; gap:8px; font-family:'Space Grotesk',sans-serif; font-size:12px; color:${T.inkWarm}; padding:4px 0; }
.qz-hist li time{ color:${T.inkFaint}; white-space:nowrap; min-width:88px; }
.qz-hist li.is-now{ color:${T.inkStrong}; font-weight:600; }
@media (max-width:420px){ .qz-back{ padding:12px 12px; } .qz-back-word{ display:none; } }
`;

export default function PackDogQuiz() {
  const { key = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const t = useT();
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };

  const isBase = key === 'base';
  const section = isBase ? BASE_FLOW : QUIZ_BY_KEY[key];
  const onlyDogId = params.get('dog');
  const jumpField = params.get('field'); // „✎" z karty psa mieri na konkrétny krok

  const [dogs, setDogs] = useState<QuizDog[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, Record<string, Answer>>>({});
  const [saved, setSaved] = useState<Record<string, Record<string, Answer>>>({});
  const [idx, setIdx] = useState(0);
  const [allSame, setAllSame] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  // Server zápis ODMIETOL (napr. pawmate bez práva zápisu) — do 5. 10. 2026 to tu nebolo
  // vidno vôbec: `appendDogEvents` chybu prehltol a odpoveď ostala len v prehliadači.
  const [saveErr, setSaveErr] = useState(false);
  /** Celá história polí tohto kvízu (dogId → pole → zápisy, najnovší posledný). */
  const [history, setHistory] = useState<Record<string, Record<string, DogEvent[]>>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) { if (alive) setDogs([]); return; }
      // B3c: zoznam ide z práv (`my_dog_rights()`), nie z vlastníctva. Majiteľovi
      // vráti tú istú množinu; pri `null` (RPC zlyhala) ostáva dnešný filter.
      const accessIds = await getAccessibleDogIds();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = (supabase as any)
        .from('dogs')
        .select('id, dog_name, cloudinary_main_url')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true });
      q = accessIds ? q.in('id', accessIds) : q.eq('user_id', uid);
      if (onlyDogId) q = q.eq('id', onlyDogId);
      const { data } = await q;
      if (alive) setDogs((data as QuizDog[]) ?? []);
    })();
    return () => { alive = false; };
  }, [onlyDogId]);

  // Predvyplnenie z posledných známych hodnôt — kvíz sa dá kedykoľvek doplniť a
  // človek musí vidieť, čo už raz odpovedal (inak odpovedá naslepo druhýkrát).
  useEffect(() => {
    if (!dogs || dogs.length === 0 || !section) return;
    let alive = true;
    readLatestForDogs(dogs.map((d) => d.id)).then((byDog) => {
      if (!alive) return;
      const init: Record<string, Record<string, Answer>> = {};
      for (const d of dogs) {
        init[d.id] = {};
        for (const st of section.steps) {
          init[d.id][st.field] = toAnswer(byDog[d.id]?.[st.field], st);
        }
      }
      setAnswers(init);
      setSaved(structuredClone(init));
      // Návrat = PRVÁ NEVYPLNENÁ otázka (Matej 8. 10.), nie začiatok. Deep-link na pole
      // (`?field=`) má prednosť — vtedy človek prišiel opraviť konkrétnu vec.
      if (!jumpField) {
        const at = firstOpenStep(section.steps, byDog, dogs.map((d) => d.id));
        if (at > 0) setIdx(at);
      }
    });
    readEvents(dogs.map((d) => d.id), section.steps.map((st) => st.field)).then((rows) => {
      if (!alive) return;
      const by: Record<string, Record<string, DogEvent[]>> = {};
      for (const r of rows) ((by[r.dogId] ??= {})[r.field] ??= []).push(r);
      setHistory(by);
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dogs, section]);

  // Deep-link z karty psa na konkrétne pole (`?field=health.weightKg`).
  useEffect(() => {
    if (!section || !jumpField) return;
    const i = section.steps.findIndex((s) => s.field === jumpField);
    if (i >= 0) setIdx(i);
  }, [section, jumpField]);

  // Nová otázka = začiatok stránky — inak na mobile ostane okno dole pri tlačidle DALEJ
  // a nadpis ďalšej otázky stojí pod pripnutým radom AINUBIS · šípka (audit 27. 9.).
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [idx]);

  const step = section?.steps[idx];
  const solo = (dogs?.length ?? 0) === 1;

  const setValue = (dogId: string, field: string, v: Answer) =>
    setAnswers((prev) => ({ ...prev, [dogId]: { ...prev[dogId], [field]: v } }));

  const setForAll = (field: string, v: Answer) =>
    setAnswers((prev) => {
      const next = { ...prev };
      for (const d of dogs ?? []) next[d.id] = { ...next[d.id], [field]: v };
      return next;
    });

  /** Zapíše LEN zmenené polia — append log nesmie zbierať duplicitné riadky. */
  const flush = async (cur = answers): Promise<boolean> => {
    const inputs: DogEventInput[] = [];
    for (const d of dogs ?? []) {
      for (const st of section?.steps ?? []) {
        const now = cur[d.id]?.[st.field] ?? null;
        const before = saved[d.id]?.[st.field] ?? null;
        if (sameAnswer(now, before)) continue;
        inputs.push({ dogId: d.id, field: st.field, value: now, source: 'quiz' });
      }
    }
    if (inputs.length === 0) return true;
    setBusy(true);
    try {
      await appendDogEvents(inputs);
      setSaved(structuredClone(cur));
      setSaveErr(false);
      return true;
    } catch {
      setSaveErr(true);
      return false;
    } finally {
      setBusy(false);
    }
  };

  // Pri chybe zápisu NEODCHÁDZAME — odpovede by sa stratili s komponentom.
  // ZÁKLAD sa vracia na MODULY (odtiaľ sa prišlo a tam vidno, čo ostáva), ostatné na /dogs.
  const exitTo = isBase ? `/pack/dogs/dogid${onlyDogId ? `?dog=${onlyDogId}` : ''}` : '/pack/dogs';
  const finish = async () => { if (await flush()) navigate(exitTo); };

  /** PRESKOČIŤ — otázka ostane nevyplnená (rozpísanú odpoveď vráti na uložený stav)
   *  a ide sa ďalej. Vráti sa k nej ďalší príchod, lebo začína na prvej nevyplnenej. */
  // ⚠️ Vrátený stav sa posiela do `flush` PRIAMO — `setAnswers` sa prejaví až po
  //    prekreslení, takže `flush()` bez argumentu by rozpísanú odpoveď predsa uložil.
  const skip = async () => {
    const f = section?.steps[idx]?.field;
    const next = { ...answers };
    if (f) for (const d of dogs ?? []) next[d.id] = { ...next[d.id], [f]: saved[d.id]?.[f] ?? null };
    setAnswers(next);
    const ok = await flush(next);
    if (idx + 1 >= (section?.steps.length ?? 0)) { if (ok) navigate(exitTo); return; }
    setIdx(idx + 1);
  };

  if (!section || section.kind !== 'quiz') {
    return <Shell><Card><p style={{ fontFamily: FONT_UI, color: T.inkDim, margin: 0 }}>
      {tx('pack.quiz.unknown', 'This quiz does not exist.')}
    </p></Card></Shell>;
  }

  if (dogs === null) return <Shell><Card><div style={{ height: 180 }} /></Card></Shell>;

  if (dogs.length === 0) {
    return <Shell><Card><p style={{ fontFamily: FONT_UI, color: T.inkDim, margin: 0 }}>
      {tx('pack.quiz.noDogs', 'No dog to fill this in for yet.')}
    </p></Card></Shell>;
  }

  const total = section.steps.length;
  const pct = Math.round(((idx + 1) / total) * 100);
  const isAll = !!allSame[step!.field];
  // Pri ZÁKLADE nesie hlavička SEKCIU („ZDRAVIE · 3 / 10") a pruh CELÝ flow.
  const seg = isBase ? segmentAt(idx) : null;

  return (
    <Shell onClose={() => { void finish(); }}>
      <Card>
        {/* hlavička — názov kvízu · progres · „3 / 10" */}
        <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
          <span
            style={{
              fontFamily: FONT_UI, fontWeight: 500, fontSize: 10, letterSpacing: '0.26em',
              textTransform: 'uppercase', color: T.accentGold, whiteSpace: 'nowrap',
            }}
          >
            {seg ? tx(seg.section.i18n, seg.section.labelEN) : tx(section.i18n, section.labelEN)}
          </span>
          <div style={{ flex: 1, height: 5, borderRadius: 999, background: T.hairline, position: 'relative', overflow: 'hidden' }}>
            <i style={{
              position: 'absolute', inset: 0, right: 'auto', width: `${pct}%`,
              background: 'linear-gradient(90deg,#F5C73D,#E69E1A)', borderRadius: 999, display: 'block',
            }} />
          </div>
          <span style={{ fontFamily: FONT_UI, fontSize: 10, color: T.inkFaint, whiteSpace: 'nowrap' }}>
            {seg ? `${idx - seg.start + 1} / ${seg.count}` : `${idx + 1} / ${total}`}
          </span>
        </div>

        {/* PÁS SEKCIÍ ZÁKLADU — kde v celku som a skok na začiatok sekcie. Hotová sekcia
            má zelenú bodku (SPLNENÉ), aktuálna lapis (moja poloha vo voľbe). */}
        {seg && (
          <div className="qz-segs">
            {BASE_SEGMENTS.map((g) => {
              const done = (dogs ?? []).every((d) => g.section.steps.every((st) => {
                const a = saved[d.id]?.[st.field];
                return Array.isArray(a) ? a.length > 0 : a !== null && a !== undefined && a !== '';
              }));
              return (
                <button
                  key={g.key}
                  type="button"
                  ref={g.key === seg.key ? (el) => el?.scrollIntoView({ block: 'nearest', inline: 'center' }) : undefined}
                  className={`qz-seg${g.key === seg.key ? ' is-on' : ''}${done ? ' is-done' : ''}`}
                  onClick={() => { if (g.key !== seg.key) { void flush(); setIdx(g.start); } }}
                >
                  {tx(g.section.i18n, g.section.labelEN)}
                </button>
              );
            })}
          </div>
        )}

        <h1 style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 20, color: T.inkStrong, margin: '0 0 5px' }}>
          {tx(step!.i18n, step!.labelEN)}
        </h1>
        <p style={{ fontFamily: FONT_UI, fontSize: 12, color: T.inkWarm, margin: '0 0 16px' }}>
          {step!.hintEN
            ? tx(step!.hintI18n ?? '', step!.hintEN)
            : solo
              ? tx('pack.quiz.soloHint', 'The answer is saved to your dog.')
              : tx('pack.quiz.multiHint', 'Answer for each dog — or for the whole pack at once.')}
        </p>

        {/* „rovnako pre všetkých" — len pri viacerých psoch (§2/3) */}
        {!solo && (
          <button
            type="button"
            onClick={() => setAllSame((p) => ({ ...p, [step!.field]: !p[step!.field] }))}
            className="flex items-center gap-2 w-full"
            style={{
              padding: '12px 12px', borderRadius: 12, marginBottom: 12, textAlign: 'left',
              border: `1.5px dashed ${isAll ? T.cardEdge : 'rgba(179,130,45,0.6)'}`,
              background: isAll ? 'rgba(201,154,63,0.10)' : 'transparent',
              color: T.inkWarm, fontFamily: FONT_UI, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <span style={{ color: isAll ? T.accentGold : T.inkFaint }}>{isAll ? '☑' : '☐'}</span>
            <b>{tx('pack.quiz.allSame', 'Same for all')}</b>
            <span style={{ color: T.inkFaint }}>— {tx('pack.quiz.allSameHint', 'pick once, applies to the whole pack')}</span>
          </button>
        )}

        {/* odpovede */}
        {solo || isAll ? (
          <>
            <AnswerControl
              step={step!}
              value={answers[dogs[0].id]?.[step!.field] ?? null}
              onChange={(v) => (isAll ? setForAll(step!.field, v) : setValue(dogs[0].id, step!.field, v))}
              tx={tx}
            />
            {solo && <FieldHistory step={step!} rows={history[dogs[0].id]?.[step!.field]} tx={tx} />}
          </>
        ) : (
          dogs.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 flex-wrap"
              style={{
                padding: '12px 12px', borderRadius: 12, background: T.tileBg,
                border: `1px solid ${T.border}`, marginBottom: 9,
              }}
            >
              <div className="flex items-center gap-2" style={{ minWidth: 132 }}>
                {d.cloudinary_main_url ? (
                  <img
                    src={sizedUrl(d.cloudinary_main_url, 200)} alt=""
                    style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.cardEdge}` }}
                  />
                ) : (
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', background: 'rgba(201,154,63,0.16)',
                    border: `2px solid ${T.cardEdge}`,
                  }} />
                )}
                <span style={{ fontFamily: NAME_FONT, fontWeight: 700, fontSize: 14, color: T.inkStrong }}>
                  {d.dog_name}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <AnswerControl
                  step={step!}
                  value={answers[d.id]?.[step!.field] ?? null}
                  onChange={(v) => setValue(d.id, step!.field, v)}
                  tx={tx}
                />
                <FieldHistory step={step!} rows={history[d.id]?.[step!.field]} tx={tx} />
              </div>
            </div>
          ))
        )}

        {saveErr && (
          <p role="alert" style={{ fontFamily: FONT_UI, fontSize: 12, color: '#B25640', margin: '16px 0 0', textAlign: 'center' }}>
            {tx('pack.diary.saveFailed', 'The entry could not be saved. Try again.')}
          </p>
        )}
        {/* pätička */}
        <div className="flex items-center justify-between gap-3" style={{ marginTop: 18 }}>
          <button
            type="button"
            className="qz-ghost qz-back"
            aria-label={idx === 0 ? tx('pack.quiz.close', 'Close') : tx('pack.quiz.back', 'Back')}
            onClick={() => { if (idx === 0) { void finish(); } else { void flush(); setIdx(idx - 1); } }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="qz-back-word">{idx === 0 ? tx('pack.quiz.close', 'Close') : tx('pack.quiz.back', 'Back')}</span>
          </button>
          <span style={{ flex: 1 }} />
          {/* PRESKOČIŤ (Matej 8. 10.: „PRESKOČIŤ áno") — otázka ostane otvorená. */}
          <button type="button" className="qz-skip" disabled={busy} onClick={() => { void skip(); }}>
            {tx('pack.quiz.skip', 'Skip')}
          </button>
          <button
            type="button"
            className="qz-gold"
            disabled={busy}
            /* Meranie (v1-posthog): „dokončený" je LEN posledný krok. `finish()` sa volá aj
               pri zavretí krížikom a pri kroku späť z prvej otázky — merať priamo v ňom by
               z odchodu po prvej otázke spravilo dokončený kvíz. */
            onClick={() => {
              if (idx + 1 >= total) { trackPack('pack_quiz_done', { quiz: key }); void finish(); }
              else { void flush(); setIdx(idx + 1); }
            }}
          >
            {idx + 1 >= total ? tx('pack.quiz.done', 'Done') : tx('pack.quiz.next', 'Next')}
            {idx + 1 >= total ? <HandCheck size={14} /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </Card>
    </Shell>
  );
}

// ── história poľa ────────────────────────────────────────────────────────────
// Matej 8. 10.: *„história zmeny = pri otázke (zoznam predošlých hodnôt s dátumom),
// nie v kronike"*. Zobrazí sa až keď sa hodnota NAOZAJ menila — jediný zápis nie je
// história, len odpoveď. Zápisy s tou istou hodnotou za sebou sa zlúčia.
function FieldHistory({ step, rows, tx }: {
  step: QuizStep;
  rows: DogEvent[] | undefined;
  tx: (k: string, f: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const list = useMemo(() => {
    const out: DogEvent[] = [];
    for (const r of rows ?? []) {
      const last = out[out.length - 1];
      if (last && JSON.stringify(last.value) === JSON.stringify(r.value)) continue;
      out.push(r);
    }
    return out.reverse();
  }, [rows]);
  if (list.length < 2) return null;

  const lang = (typeof document !== 'undefined' && document.documentElement.lang) || undefined;
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(lang, { day: 'numeric', month: 'numeric', year: 'numeric' });
  const show = (v: unknown): string => {
    if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return '—';
    if (Array.isArray(v)) return v.map((x) => quizValueLabel(step, String(x), tx)).join(', ');
    const x = String(v);
    if (step.kind === 'date') return fmtDate(x);
    if (step.kind === 'number') return step.unit ? `${x} ${step.unit}` : x;
    if (step.kind === 'text') return x;
    return quizValueLabel(step, x, tx);
  };

  return (
    <div className="qz-hist">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {tx('pack.quiz.history', 'Changed {n}×').replace('{n}', String(list.length - 1))}
        <ChevronRight className="h-3 w-3" style={{ transform: open ? 'rotate(90deg)' : undefined, transition: 'transform .15s' }} />
      </button>
      {open && (
        <ol>
          {list.map((r, i) => (
            <li key={r.id} className={i === 0 ? 'is-now' : undefined}>
              <time dateTime={r.recordedAt}>{fmtDate(r.recordedAt)}</time>
              <span>{show(r.value)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ── ovládací prvok odpovede ──────────────────────────────────────────────────
// Jeden komponent pre všetky typy vstupov. Pri viacerých psoch sa vykreslí N-krát,
// pri jednom raz — to je celý rozdiel medzi solo a multi režimom.
function AnswerControl({
  step, value, onChange, tx,
}: {
  step: QuizStep;
  value: Answer;
  onChange: (v: Answer) => void;
  tx: (k: string, f: string) => string;
}) {
  const [custom, setCustom] = useState('');
  const list = Array.isArray(value) ? value : [];

  // Ten istý popisok ako v DOG ID (`quizValueLabel`) — kvíz a doklad sa nesmú rozísť.
  const optLabel = (v: string) => quizValueLabel(step, v, tx);

  /**
   * STROP VÝBERU (2026-09-02). Plný sa nedá pridať ďalšie, ale odobrať áno — vybrané pilulky
   * ostávajú aktívne, hasnú len tie, ktoré by výber prekročili. Bez tohto rozlíšenia by sa
   * plný krok zamkol celý a nedal by sa opraviť.
   * ⚠️ Hláška musí byť VIDNO. Zhasnutá pilulka bez slova vyzerá ako pokazená appka —
   *    presne to je dôvod, prečo krok 7 v sprievodcovi dostal tú istú vetu.
   */
  const cap = step.maxPick ?? 0;
  const capped = cap > 0 && list.length >= cap;
  const capNote = capped ? (
    <p className="qz-cap-note">{tx('pack.quiz.maxPick', `Pick up to ${cap} — untick one to swap.`).replace('{n}', String(cap))}</p>
  ) : null;

  if (step.kind === 'single' || step.kind === 'multi') {
    const options = step.options ?? [];
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {options.map((o) => {
            const on = step.kind === 'single' ? value === o.value : list.includes(o.value);
            const blocked = step.kind !== 'single' && capped && !on;
            return (
              <button
                key={o.value}
                type="button"
                disabled={blocked}
                className={`pf-pill qz-pill${on ? ' is-selected' : ''}${blocked ? ' is-capped' : ''}`}
                onClick={() =>
                  step.kind === 'single'
                    ? onChange(on ? null : o.value)
                    : onChange(on ? list.filter((x) => x !== o.value) : [...list, o.value])
                }
              >
                {o.emoji ? `${o.emoji} ` : ''}{optLabel(o.value)}
              </button>
            );
          })}
        </div>
        {step.kind !== 'single' && capNote}
      </div>
    );
  }

  if (step.kind === 'chips') {
    const suggestions = step.suggestions ?? [];
    // Vlastné hodnoty (mimo návrhov) sa musia vykresliť tiež — inak by po uložení
    // zmizli z obrazovky a vyzeralo by to, že sa neuložili.
    const extras = list.filter((v) => !suggestions.includes(v));
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {[...suggestions, ...extras].map((v) => {
            const on = list.includes(v);
            const blocked = capped && !on;
            return (
              <button
                key={v}
                type="button"
                disabled={blocked}
                className={`pf-pill qz-pill${on ? ' is-selected' : ''}${blocked ? ' is-capped' : ''}`}
                onClick={() => onChange(on ? list.filter((x) => x !== v) : [...list, v])}
              >
                {optLabel(v)}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input
            className="pf-field"
            value={custom}
            disabled={capped}
            onChange={(e) => setCustom(e.target.value)}
            placeholder={tx('pack.quiz.addOwn', 'Add your own…')}
            style={fieldStyle}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || !custom.trim()) return;
              e.preventDefault();
              // ⚠️ Aj tu, nie len na pilulkách — vlastný text je tá istá položka zoznamu
              //    a bez brzdy by strop obišiel každý, kto ho napíše ručne.
              if (capped) return;
              onChange([...list, custom.trim()]);
              setCustom('');
            }}
          />
        </div>
        {capNote}
      </div>
    );
  }

  if (step.kind === 'number') {
    return (
      <div className="flex items-center gap-2">
        <input
          className="pf-field"
          type="number"
          inputMode="decimal"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value || null)}
          style={{ ...fieldStyle, maxWidth: 140 }}
        />
        {step.unit && <span style={{ fontFamily: FONT_UI, fontSize: 12, color: T.inkWarm }}>{step.unit}</span>}
      </div>
    );
  }

  if (step.kind === 'date') {
    return (
      <input
        className="pf-field"
        type="date"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value || null)}
        style={{ ...fieldStyle, maxWidth: 200 }}
      />
    );
  }

  return (
    <input
      className="pf-field"
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value || null)}
      style={fieldStyle}
    />
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 8,
  padding: '12px 12px',
  fontFamily: FONT_UI,
  fontSize: 12,
  color: T.inkStrong,
};

// ── škrupina ─────────────────────────────────────────────────────────────────
function Shell({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  const t = useT();
  // Panel kvízu bol papyrusový v OBOCH šatoch, tapeta za ním len tmavá — pri zapnutom
  // bledom šate si sa tak z papyrusového `/pack/dogs` preklikol do čiernej a späť.
  // Recept bledej plochy je `pk-paper` + `PAPER_PAGE_CSS` (packTheme.ts), rovnako ako
  // v `PackLayout`; tmavá vetva ostáva nedotknutá.
  const paper = usePaperRoute(useLocation().pathname);
  // Šípka späť je VŽDY — aj keď kvíz nemá komu sa vypĺňať alebo neexistuje. Bez nej
  // to bola slepá ulička (audit 26. 9.): text bez cesty von.
  const navigate = useNavigate();
  const back = onClose ?? (() => navigate('/pack/dogs'));
  return (
    <div
      className={`min-h-[100dvh] relative${paper ? ' pk-paper' : ''}`}
      style={paper ? { color: T.inkStrong } : { backgroundColor: T.pageBg, color: T.onDark }}
    >
      {paper ? <style>{PAPER_PAGE_CSS}</style> : (
        <>
          <div
            aria-hidden
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100lvh',
              backgroundImage: "url('/images/bg-dark.webp')", backgroundSize: 'cover',
              backgroundPosition: 'center', filter: 'blur(3px)', zIndex: 0, pointerEvents: 'none',
            }}
          />
          {/* Stmavenie — bez neho je heroglyfová textúra na fullscreen route príliš svetlá
              a karta na nej stráca kontrast. Rovnaké hodnoty ako `HieroglyphBg` v PackLayout. */}
          <div
            aria-hidden
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100lvh',
              background: 'radial-gradient(ellipse at center, rgba(5,5,5,0.25) 0%, rgba(5,5,5,0.45) 60%, rgba(5,5,5,0.6) 100%)',
              zIndex: 0, pointerEvents: 'none',
            }}
          />
        </>
      )}
      <style>{PF_FIELD_CSS}</style>
      <style>{QUIZ_CSS}</style>
      <div
        className="relative z-10 mx-auto w-full max-w-2xl px-4 sm:px-6 pb-24"
        style={{ paddingTop: PACK_TOPROW_PAD }}
      >
        {/* × → ŠÍPKA SPÄŤ v spoločnom rade (Matej 27. 9. 2026: „pri kvízoch je nutný ten
            krížik? nemáme ho nikde … napr. šípka dozadu"). Robí to isté, čo krížik: uloží
            rozpracované a vráti na /pack/dogs. Ľavý roh tým pripadol AINUBISOVI. */}
        <PackTopRow onBack={back} backLabel={t('pack.quiz.back')} />
        {children}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="qz-card"
      style={{
        background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
        boxShadow: T.cardShadow, padding: '24px 24px', color: T.ink,
      }}
    >
      {children}
    </div>
  );
}

// ── pomocníci ────────────────────────────────────────────────────────────────
function toAnswer(v: LatestValue | undefined, step: QuizStep): Answer {
  if (!v || v.value === null || v.value === undefined) return null;
  const multi = step.kind === 'multi' || step.kind === 'chips';
  if (multi) return Array.isArray(v.value) ? (v.value as string[]) : [String(v.value)];
  return Array.isArray(v.value) ? (v.value[0] ?? null) : String(v.value);
}

function sameAnswer(a: Answer, b: Answer): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => x === b[i]);
  }
  // Prázdne pole a `null` sú ten istý stav („nevyplnené") — bez tohto by sa pri
  // každom prechode kvízom zapísal prázdny prírastok.
  if (Array.isArray(a)) return a.length === 0 && b === null;
  if (Array.isArray(b)) return b.length === 0 && a === null;
  return a === b;
}

/** Fallback popisok pre návrh bez prekladu: 'flat_faced' → 'Flat faced'. */
