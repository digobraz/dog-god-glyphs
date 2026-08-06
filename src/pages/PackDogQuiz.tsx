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
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { PACK_THEME, FONT_TITLE, FONT_UI, PF_FIELD_CSS } from '@/components/pack/packTheme';
import { QUIZ_BY_KEY, type QuizStep } from '@/components/pack/dogQuiz';
import { appendDogEvents, readLatestForDogs, type DogEventInput, type LatestValue } from '@/lib/dogEvents';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const NAME_FONT = "'Cinzel Decorative', 'Cinzel', serif";

interface QuizDog { id: string; dog_name: string | null; cloudinary_main_url: string | null }

/** Hodnota odpovede — `string` (single/number/date/text) alebo `string[]` (multi/chips). */
type Answer = string | string[] | null;

const QUIZ_CSS = `
.qz-gold{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:13px 24px;
  background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border:1px solid rgba(250,244,236,0.30); border-radius:8px; color:#000;
  font-family:'Cinzel',serif; font-size:11px; font-weight:800;
  letter-spacing:.12em; text-transform:uppercase; cursor:pointer; white-space:nowrap;
  box-shadow:0 0 28px rgba(230,158,26,0.34), inset 0 1px 0 rgba(255,255,255,0.3);
  transition: transform .2s, box-shadow .22s;
}
.qz-gold:hover{ transform:scale(1.04); }
.qz-gold:disabled{ opacity:.45; cursor:default; transform:none; box-shadow:none; }
.qz-ghost{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:12px 22px; background:transparent;
  border:1.5px solid rgba(201,154,63,0.45); border-radius:8px; color:#7a5a2a;
  font-family:'Cinzel',serif; font-size:11px; font-weight:700;
  letter-spacing:.12em; text-transform:uppercase; cursor:pointer;
}
.qz-ghost:hover{ border-color:#C99A3F; color:#2a1608; }
.qz-pill{ font-family:'Space Grotesk',sans-serif; font-size:11.5px; font-weight:500;
  padding:7px 13px; border-radius:999px; cursor:pointer; }
`;

export default function PackDogQuiz() {
  const { key = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const t = useT();
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };

  const section = QUIZ_BY_KEY[key];
  const onlyDogId = params.get('dog');
  const jumpField = params.get('field'); // „✎" z karty psa mieri na konkrétny krok

  const [dogs, setDogs] = useState<QuizDog[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, Record<string, Answer>>>({});
  const [saved, setSaved] = useState<Record<string, Record<string, Answer>>>({});
  const [idx, setIdx] = useState(0);
  const [allSame, setAllSame] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) { if (alive) setDogs([]); return; }
      let q = supabase
        .from('dogs')
        .select('id, dog_name, cloudinary_main_url')
        .eq('user_id', uid)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true });
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
    });
    return () => { alive = false; };
  }, [dogs, section]);

  // Deep-link z karty psa na konkrétne pole (`?field=health.weightKg`).
  useEffect(() => {
    if (!section || !jumpField) return;
    const i = section.steps.findIndex((s) => s.field === jumpField);
    if (i >= 0) setIdx(i);
  }, [section, jumpField]);

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
  const flush = async () => {
    const inputs: DogEventInput[] = [];
    for (const d of dogs ?? []) {
      for (const st of section?.steps ?? []) {
        const now = answers[d.id]?.[st.field] ?? null;
        const before = saved[d.id]?.[st.field] ?? null;
        if (sameAnswer(now, before)) continue;
        inputs.push({ dogId: d.id, field: st.field, value: now, source: 'quiz' });
      }
    }
    if (inputs.length === 0) return;
    setBusy(true);
    try {
      await appendDogEvents(inputs);
      setSaved(structuredClone(answers));
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => { await flush(); navigate('/pack/dogs'); };

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
            {tx(section.i18n, section.labelEN)}
          </span>
          <div style={{ flex: 1, height: 5, borderRadius: 999, background: T.hairline, position: 'relative', overflow: 'hidden' }}>
            <i style={{
              position: 'absolute', inset: 0, right: 'auto', width: `${pct}%`,
              background: 'linear-gradient(90deg,#F5C73D,#E69E1A)', borderRadius: 999, display: 'block',
            }} />
          </div>
          <span style={{ fontFamily: FONT_UI, fontSize: 11, color: T.inkFaint, whiteSpace: 'nowrap' }}>
            {idx + 1} / {total}
          </span>
        </div>

        <h1 style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 21, color: T.inkStrong, margin: '0 0 5px' }}>
          {tx(step!.i18n, step!.labelEN)}
        </h1>
        <p style={{ fontFamily: FONT_UI, fontSize: 12.5, color: T.inkWarm, margin: '0 0 16px' }}>
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
              padding: '11px 13px', borderRadius: 11, marginBottom: 12, textAlign: 'left',
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
          <AnswerControl
            step={step!}
            value={answers[dogs[0].id]?.[step!.field] ?? null}
            onChange={(v) => (isAll ? setForAll(step!.field, v) : setValue(dogs[0].id, step!.field, v))}
            tx={tx}
          />
        ) : (
          dogs.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 flex-wrap"
              style={{
                padding: '11px 12px', borderRadius: 12, background: T.tileBg,
                border: `1px solid ${T.border}`, marginBottom: 9,
              }}
            >
              <div className="flex items-center gap-2" style={{ minWidth: 132 }}>
                {d.cloudinary_main_url ? (
                  <img
                    src={d.cloudinary_main_url} alt=""
                    style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.cardEdge}` }}
                  />
                ) : (
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', background: 'rgba(201,154,63,0.16)',
                    border: `2px solid ${T.cardEdge}`,
                  }} />
                )}
                <span style={{ fontFamily: NAME_FONT, fontWeight: 700, fontSize: 13.5, color: T.inkStrong }}>
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
              </div>
            </div>
          ))
        )}

        {/* pätička */}
        <div className="flex items-center justify-between gap-3" style={{ marginTop: 18 }}>
          <button
            type="button"
            className="qz-ghost"
            onClick={() => { if (idx === 0) { void finish(); } else { void flush(); setIdx(idx - 1); } }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {idx === 0 ? tx('pack.quiz.close', 'Close') : tx('pack.quiz.back', 'Back')}
          </button>
          <button
            type="button"
            className="qz-gold"
            disabled={busy}
            onClick={() => { if (idx + 1 >= total) { void finish(); } else { void flush(); setIdx(idx + 1); } }}
          >
            {idx + 1 >= total ? tx('pack.quiz.done', 'Done') : tx('pack.quiz.next', 'Next')}
            {idx + 1 >= total ? <Check className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </Card>
    </Shell>
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

  const optLabel = (v: string, fallback: string) => {
    // Rovnaký kľúčový priestor ako `DogCardFields.tsx` — preklady možností už existujú.
    const k = `pack.dogCard.opt.${v}`;
    const translated = tx(k, '');
    return translated || tx(`pack.dogTag.${v}`, fallback);
  };

  if (step.kind === 'single' || step.kind === 'multi') {
    const options = step.options ?? [];
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = step.kind === 'single' ? value === o.value : list.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              className={`pf-pill qz-pill${on ? ' is-selected' : ''}`}
              onClick={() =>
                step.kind === 'single'
                  ? onChange(on ? null : o.value)
                  : onChange(on ? list.filter((x) => x !== o.value) : [...list, o.value])
              }
            >
              {o.emoji ? `${o.emoji} ` : ''}{optLabel(o.value, o.labelEN)}
            </button>
          );
        })}
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
            return (
              <button
                key={v}
                type="button"
                className={`pf-pill qz-pill${on ? ' is-selected' : ''}`}
                onClick={() => onChange(on ? list.filter((x) => x !== v) : [...list, v])}
              >
                {optLabel(v, humanize(v))}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input
            className="pf-field"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder={tx('pack.quiz.addOwn', 'Add your own…')}
            style={fieldStyle}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || !custom.trim()) return;
              e.preventDefault();
              onChange([...list, custom.trim()]);
              setCustom('');
            }}
          />
        </div>
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
        {step.unit && <span style={{ fontFamily: FONT_UI, fontSize: 12.5, color: T.inkWarm }}>{step.unit}</span>}
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
  borderRadius: 10,
  padding: '10px 12px',
  fontFamily: FONT_UI,
  fontSize: 13,
  color: T.inkStrong,
};

// ── škrupina ─────────────────────────────────────────────────────────────────
function Shell({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="min-h-[100dvh] relative" style={{ backgroundColor: T.pageBg, color: T.onDark }}>
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
      <style>{PF_FIELD_CSS}</style>
      <style>{QUIZ_CSS}</style>
      <div
        className="relative z-10 mx-auto w-full max-w-2xl px-4 sm:px-6 pb-24"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 22px)' }}
      >
        {onClose && (
          <div className="flex justify-end" style={{ marginBottom: 12 }}>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 36, height: 36, borderRadius: 999, cursor: 'pointer',
                background: 'rgba(245,240,228,0.06)', border: `1px solid ${T.onDarkBorder}`,
                color: T.onDarkDim, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
        boxShadow: T.cardShadow, padding: '22px 20px', color: T.ink,
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
function humanize(v: string): string {
  const s = v.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
