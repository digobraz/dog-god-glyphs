// KVÍZY DOG ID V APPKE. Matej 2. 11. 2026 nad nákresom (`plany/nakres-kvizy-dogid-2026-11-01.html`):
// *„upravil všetko … všetko to aplikuj do apky"*. Web drží starý `PackDogQuiz` a `PackNatureQuiz`.
//
//   mode 'base'    Základ, jeden súvislý flow
//   mode 'nature'  Osobnosť: úvod · element · úloha · zvláštna úloha · výsledok · dobrovoľná Rovnováha
//   mode 'will'    Závet, jedna obrazovka
//   mode 'modules' rozcestník DOG ID
//
// Zápis ide do `dog_events` ako prírastok a len pri zmene, rovnako ako v starom kvíze.
// Doplnenie k odpovedi sa vysúva priamo pod ňou (Matej: *„nie dolu pod všetkým, uplatni na každej otázke"*).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BackButton } from '@/components/pack/BackButton';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { AinubisSheet } from '@/components/pack/ainubisSheet';
import { FLOW_CSS } from '@/components/pack/dogid/flowCss';
import {
  flowScreens, screenById, screenFields, primaryFields, fieldOf, noteField, normalizeValue,
} from '@/components/pack/dogid/flowCatalog';
import type { FlowOpt, FlowScreen } from '@/components/pack/dogid/flowTypes';
import { LIVE_MODULES, moduleProgress } from '@/components/pack/dogIdModules';
import {
  NATURE_ELEMENTS, NATURE_ROLES, NATURE_SPECIALS, ELEMENT_KEYS, ROLE_KEYS, SPECIAL_KEYS, scoreFromTallies,
  type ElementKey, type RoleKey, type SpecialKey, type SpecialAnswer, type NatureResult,
} from '@/components/pack/natureQuiz';
import { appendDogEvents, hasValue, readLatestForDogs, type DogEventInput, type LatestValue } from '@/lib/dogEvents';
import { loadPackDogs } from '@/lib/packDogsList';
import { MAPY_API_KEY, MAPY_BASE, SUPABASE_URL } from '@/lib/env';
import { supabase } from '@/integrations/supabase/client';
import { uploadDogIdPhoto } from '@/services/cloudinaryService';
import { PACK_THEME as T, PROGRESS_CSS } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { useT, useLang } from '@/i18n/LanguageContext';

type Dog = { id: string; dog_name: string | null; cloudinary_main_url: string | null };
type Vals = Record<string, unknown>;
type Tx = (k: string, f?: string) => string;

const percent = (n: number) => `${n}%`;
const ART = (a?: string) => (a ? `/images/dogid/${a}.webp` : '');
const empty = (v: unknown) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
const same = (a: unknown, b: unknown) => (empty(a) && empty(b)) || JSON.stringify(a) === JSON.stringify(b);
const asList = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : empty(v) ? [] : [String(v)]);

function useDogs(onlyId: string | null) {
  const [dogs, setDogs] = useState<Dog[] | null>(null);
  useEffect(() => {
    let alive = true;
    loadPackDogs<Dog>('id, dog_name, cloudinary_main_url').then((rows) => {
      if (alive) setDogs(onlyId ? rows.filter((d) => d.id === onlyId) : rows);
    });
    return () => { alive = false; };
  }, [onlyId]);
  return dogs;
}

export default function PackDogIdFlow({ mode }: { mode: 'base' | 'nature' | 'will' | 'modules' }) {
  const t = useT();
  const tx: Tx = (k, f) => { const v = t(k); return v === k ? (f ?? k) : v; };
  const [params] = useSearchParams();
  const onlyDog = params.get('dog');
  const dogs = useDogs(onlyDog);
  return (
    <div className="dfl">
      <style>{PROGRESS_CSS}{FLOW_CSS}</style>
      {mode === 'modules' && <Modules tx={tx} dogs={dogs} onlyDog={onlyDog} />}
      {mode === 'will' && <Will tx={tx} dogs={dogs} />}
      {(mode === 'base' || mode === 'nature') && <Flow key={mode} mode={mode} tx={tx} dogs={dogs} jump={params.get('field')} />}
    </div>
  );
}

/** Kde sa pes vypĺňa: `/pack/dogs/quiz/:key`. Starý odkaz na sekciu (`health`, `food`…) vedie do Základu. */
export function DogIdQuizRoute() {
  const { key = '' } = useParams();
  return <PackDogIdFlow mode={key === 'will' ? 'will' : 'base'} />;
}

// ── MODULY ──────────────────────────────────────────────────────────────────
function Ring({ pct }: { pct: number }) {
  const r = 30; const c = 2 * Math.PI * r;
  return (
    <div className="dfm-ring">
      <svg viewBox="0 0 72 72" aria-hidden>
        <circle cx="36" cy="36" r={r} fill="none" stroke={T.hairline} strokeWidth="8" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={LAPIS.edge} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} />
      </svg>
      <b>{pct} %</b>
    </div>
  );
}

function Modules({ tx, dogs, onlyDog }: { tx: Tx; dogs: Dog[] | null; onlyDog: string | null }) {
  const navigate = useNavigate();
  const scr = flowScreens('modules')[0];
  const [latest, setLatest] = useState<Record<string, Record<string, LatestValue>> | null>(null);
  useEffect(() => {
    if (!dogs?.length) return;
    let alive = true;
    readLatestForDogs(dogs.map((d) => d.id)).then((r) => { if (alive) setLatest(r); });
    return () => { alive = false; };
  }, [dogs]);
  const ids = useMemo(() => (dogs ?? []).map((d) => d.id), [dogs]);
  const q = onlyDog ? `?dog=${onlyDog}` : '';
  const liveKey = (k: string) => LIVE_MODULES.find((m) => m.key === k);
  const pctOf = (k: string) => { const m = liveKey(k); return m && latest ? moduleProgress(m, latest, ids).pct : 0; };
  let filled = 0; let all = 0;
  if (latest) for (const m of LIVE_MODULES) { const p = moduleProgress(m, latest, ids); filled += p.filled; all += p.total; }
  const total = all ? Math.round((filled / all) * 100) : 0;
  const counts: Record<string, number> = {
    base: flowScreens('base').length,
    nature: flowScreens('nature').filter((s) => !['intro', 'result'].includes(s.kind)).length + 3,
  };
  const meta = (k: string) => (counts[k]
    ? `${counts[k]} ${tx('pack.flow.ui.questions')} · ${Math.max(1, Math.round(counts[k] / 5.5))} ${tx('pack.flow.ui.min')}`
    : tx('pack.flow.ui.oneScreen'));
  const go = (k: string) => navigate(k === 'nature' ? `/pack/nature${q}` : `/pack/dogs/quiz/${k}${q}`);
  return (
    <div className="dfl-sc">
      <div className="dfl-top"><BackButton tone="pale" onClick={() => navigate('/pack/dogs')} label={tx('pack.quiz.back', 'Back')} /></div>
      <div className="dfm-head">
        <div><h1 className="dfm-h1">{tx(scr.t)}</h1><p className="dfm-sub">{tx(scr.s ?? '')}</p></div>
        <Ring pct={total} />
      </div>
      <div className="dfm-mods">
        {scr.mods?.map((m) => {
          const pct = pctOf(m.key);
          return (
            <div className="dfm" key={m.key}>
              <div className="bg" style={{ backgroundImage: `url(${ART(m.bg)})` }} />
              <div className="mt">
                <span className="ic"><BrandIcon name={m.ic} size={32} /></span>
                <div><h3>{tx(m.t)}</h3><p>{tx(m.d)}</p><p><b>{meta(m.key)}</b></p></div>
              </div>
              <div className="mb">
                <span className="pct">{pct} %</span>
                <div className="pk-progress dfl-lq sm"><div className="pk-progress__fill" style={{ width: percent(pct) }} /></div>
                <button type="button" className="dfl-cta sm" onClick={() => go(m.key)}>{tx(pct ? 'pack.flow.ui.cont' : 'pack.flow.ui.start')}</button>
              </div>
            </div>
          );
        })}
        {scr.soon && (
          <div className="dfm mute"><div className="mt"><span className="ic"><BrandIcon name={scr.soon.ic} size={20} /></span><h3>{tx(scr.soon.t)}</h3><span className="soon">{tx('pack.flow.ui.soon')}</span></div></div>
        )}
      </div>
    </div>
  );
}

// ── FLOW ────────────────────────────────────────────────────────────────────
// Potvrdenie po odoslaní nie je rada, ostáva celé na očiach.
function Say({ text, tx }: { text: string; tx: Tx }) {
  return (
    <div className="dfl-say">
      <span className="who"><span>AI</span>NUBIS</span>
      <span dangerouslySetInnerHTML={{ __html: tx(text) }} />
    </div>
  );
}

// Rada AINUBISa je blok s nadpisom, text je v jeho popupe (Matej 2. 11.: *„len do bloku s nadpisom
// a klik otvorí popup s radou/radami"*). Viac rád k jednej otázke = jeden blok.
function Tip({ title, texts, tx }: { title?: string; texts: string[]; tx: Tx }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="dfl-tip" onClick={() => setOpen(true)}>
        <span className="who"><span>AI</span>NUBIS</span>
        <span className="tt">{title ? tx(title) : ''}</span>
        <BrandIcon name="back" size={12} tint="gold" style={{ transform: 'rotate(180deg)', flex: 'none' }} />
      </button>
      {open && (
        <AinubisSheet onClose={() => setOpen(false)}>
          {title && <div className="msg-modtitle">{tx(title)}</div>}
          {/* Text je náš vlastný zo slovníka, značky `<b>` tam patria. */}
          {texts.map((x) => <p key={x} className="dfl-tipx" dangerouslySetInnerHTML={{ __html: tx(x) }} />)}
          <button type="button" className="msg-modcancel" onClick={() => setOpen(false)}>{tx('pack.tier.close', 'Close')}</button>
        </AinubisSheet>
      )}
    </>
  );
}

function Flow({ mode, tx, dogs, jump }: { mode: 'base' | 'nature'; tx: Tx; dogs: Dog[] | null; jump: string | null }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const onlyDog = params.get('dog');
  const exit = () => navigate(`/pack/dogs/dogid${onlyDog ? `?dog=${onlyDog}` : ''}`);
  const screens = useMemo(() => (mode === 'base' ? flowScreens('base') : [...flowScreens('nature'), ...flowScreens('balance')]), [mode]);
  const FIELDS = useMemo(() => [...new Set(screens.flatMap(screenFields))], [screens]);

  const [idx, setIdx] = useState(0);
  const [dogIdx, setDogIdx] = useState(0);
  const [allSame, setAllSame] = useState(false);
  const [vals, setVals] = useState<Record<string, Vals>>({});
  const [saved, setSaved] = useState<Record<string, Vals>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const [noteOpen, setNoteOpen] = useState<Record<string, boolean>>({});
  const [own, setOwn] = useState('');
  const [results, setResults] = useState<Record<string, NatureResult>>({});
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dogs?.length) return;
    let alive = true;
    readLatestForDogs(dogs.map((d) => d.id)).then((by) => {
      if (!alive) return;
      const init: Record<string, Vals> = {};
      for (const d of dogs) {
        init[d.id] = {};
        for (const f of FIELDS) {
          const v = by[d.id]?.[f]?.value;
          if (!empty(v)) init[d.id][f] = normalizeValue(f, v);
        }
      }
      setVals(init); setSaved(structuredClone(init));
      if (jump) {
        const at = screens.findIndex((s) => screenFields(s).includes(jump));
        if (at >= 0) { setIdx(at); return; }
      }
      if (mode === 'base') {
        const at = screens.findIndex((s) => dogs.some((d) => primaryFields(s).some((f) => !hasValue(by[d.id]?.[f]))));
        if (at > 0) setIdx(at);
      }
    });
    return () => { alive = false; };
  }, [dogs, FIELDS, jump, mode, screens]);

  useEffect(() => { mainRef.current?.scrollTo?.({ top: 0 }); setOwn(''); }, [idx]);

  if (!dogs) return null;
  if (dogs.length === 0) {
    return (
      <div className="dfl-sc">
        <div className="dfl-top"><BackButton tone="pale" onClick={exit} label={tx('pack.quiz.back', 'Back')} /></div>
        <p className="dfl-s">{tx('pack.quiz.noDogs', 'No dog to fill this in for yet.')}</p>
      </div>
    );
  }

  const s = screens[idx];
  const dog = dogs[Math.min(dogIdx, dogs.length - 1)];
  const v = vals[dog.id] ?? {};
  const set = (field: string, value: unknown) => setVals((prev) => {
    const next = { ...prev };
    for (const d of allSame ? dogs : [dog]) next[d.id] = { ...next[d.id], [field]: value };
    return next;
  });

  const flush = async (cur = vals): Promise<boolean> => {
    const inputs: DogEventInput[] = [];
    for (const d of dogs) {
      for (const f of FIELDS) {
        if (same(cur[d.id]?.[f], saved[d.id]?.[f])) continue;
        inputs.push({ dogId: d.id, field: f, value: empty(cur[d.id]?.[f]) ? null : cur[d.id][f], source: 'quiz' });
      }
    }
    if (!inputs.length) return true;
    setBusy(true);
    try {
      await appendDogEvents(inputs);
      setSaved(structuredClone(cur));
      setErr(false);
      return true;
    } catch {
      setErr(true);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const toResult = () => navigate(`/pack/nature?view=result&dog=${onlyDog ?? dog.id}${onlyDog ? '&from=id' : ''}`);
  const goIdx = (id: string) => setIdx(screens.findIndex((x) => x.id === id));

  /** Koniec osobnosti: „Iné" ohodnotí AI, zráta sa výsledok a zapíše sa do tých istých polí ako doteraz. */
  const finishNature = async (cur = vals) => {
    setBusy(true);
    const nature = flowScreens('nature');
    const inputs: DogEventInput[] = [];
    const out: Record<string, NatureResult> = {};
    for (const d of dogs) {
      const a = cur[d.id] ?? {};
      if (!nature.some((q) => q.kind === 'pick2' && !empty(a[fieldOf(q)]))) continue;
      const others = nature.filter((q) => q.kind === 'pick2' && asList(a[fieldOf(q)]).includes('other') && !empty(a[`other.${q.id}`]));
      const ai = others.length ? await classifyOther(others.map((q) => ({ id: q.id, question: tx(q.t), text: String(a[`other.${q.id}`]), axis: q.id.startsWith('e-') ? 'element' : 'role' }))) : {};
      const el = Object.fromEntries(ELEMENT_KEYS.map((k) => [k, 0])) as Record<ElementKey, number>;
      const role = Object.fromEntries(ROLE_KEYS.map((k) => [k, 0])) as Record<RoleKey, number>;
      const tally = (k?: string | null) => {
        if (!k) return;
        if (k in el) el[k as ElementKey] += 1;
        else if (k in role) role[k as RoleKey] += 1;
      };
      let tieEl: string | undefined; let tieRole: string | undefined;
      for (const q of nature.filter((x) => x.kind === 'pick2')) {
        for (const pick of asList(a[fieldOf(q)])) {
          const keys = pick === 'other' ? [ai[q.id]] : q.opts?.find((o) => o.v === pick)?.score ?? [];
          keys.forEach(tally);
          if (q.id === 'e-telo' && !tieEl) tieEl = keys[0] ?? undefined;
          if (q.id === 'r-zvonec' && !tieRole) tieRole = keys[0] ?? undefined;
        }
      }
      const spAns: Partial<Record<SpecialKey, SpecialAnswer>> = {};
      for (const k of SPECIAL_KEYS) { const x = a[`special.${k}`]; if (x) spAns[k] = x as SpecialAnswer; }
      const r = scoreFromTallies(el, role, spAns, tieEl, tieRole);
      out[d.id] = r;
      inputs.push(
        { dogId: d.id, field: 'nature.element', value: r.element, source: 'quiz' },
        { dogId: d.id, field: 'nature.role', value: r.role, source: 'quiz' },
        { dogId: d.id, field: 'nature.specials', value: r.specials, source: 'quiz' },
        { dogId: d.id, field: 'nature.scores', value: { ...r.scores, sec: { el: r.elementSecond, role: r.roleSecond } }, source: 'quiz' },
      );
    }
    try {
      if (!(await flush(cur))) return;
      if (inputs.length) await appendDogEvents(inputs);
      setResults(out);
      setErr(false);
      setIdx(idx + 1);
    } catch {
      setErr(true);
    } finally {
      setBusy(false);
    }
  };

  /** Rovnováha: zaškrtnutia sa ukladajú ako id, záver sa z nich kedykoľvek prepočíta. */
  const finishBalance = async (cur = vals) => {
    const inputs: DogEventInput[] = [];
    const bal = flowScreens('balance').filter((x) => x.kind === 'chips');
    for (const d of dogs) {
      const a = cur[d.id] ?? {};
      if (!bal.some((q) => !empty(a[fieldOf(q)]))) continue;
      const picked = bal.flatMap((q) => asList(a[fieldOf(q)]).filter((x) => x !== 'none').flatMap((x) => x.split(',')));
      inputs.push({ dogId: d.id, field: 'nature.balance', value: picked, source: 'quiz' });
    }
    if (!(await flush(cur))) return;
    try {
      if (inputs.length) await appendDogEvents(inputs);
      toResult();
    } catch {
      setErr(true);
    }
  };

  const next = async () => {
    if (s.id === 's-spec') { await finishNature(); return; }
    if (s.id === 'b-vstup') {
      if (!(await flush())) return;
      if (v[fieldOf(s)] === 'yes') setIdx(idx + 1); else toResult();
      return;
    }
    if (idx + 1 >= screens.length) {
      if (mode === 'nature') { await finishBalance(); return; }
      if (await flush()) exit();
      return;
    }
    if (await flush()) setIdx(idx + 1);
  };

  const prev = async () => {
    await flush();
    if (idx === 0) exit();
    else if (s.kind === 'result') goIdx('s-spec');
    else setIdx(idx - 1);
  };

  const skip = async () => {
    const reverted = { ...vals };
    for (const d of dogs) {
      reverted[d.id] = { ...reverted[d.id] };
      for (const f of screenFields(s)) {
        if (empty(saved[d.id]?.[f])) delete reverted[d.id][f];
        else reverted[d.id][f] = saved[d.id][f];
      }
    }
    setVals(reverted);
    if (s.id === 's-spec') { await finishNature(reverted); return; }
    if (s.id === 'b-vstup') { if (await flush(reverted)) toResult(); return; }
    if (idx + 1 >= screens.length) {
      if (mode === 'nature') { await finishBalance(reverted); return; }
      if (await flush(reverted)) exit();
      return;
    }
    if (await flush(reverted)) setIdx(idx + 1);
  };

  const dogRow = dogs.length > 1 && (
    <div className="dfl-dogs">
      {dogs.map((d, i) => (
        <button key={d.id} type="button" className={`dfl-dog${i === dogIdx ? ' on' : ''}`} onClick={() => setDogIdx(i)}>
          <i style={d.cloudinary_main_url ? { backgroundImage: `url(${d.cloudinary_main_url})` } : undefined} />{d.dog_name ?? '—'}
        </button>
      ))}
      <button type="button" className={`dfl-dog${allSame ? ' on' : ''}`} style={{ paddingLeft: 12 }} onClick={() => setAllSame((x) => !x)}>
        {tx('pack.flow.ui.allSame')}
      </button>
    </div>
  );

  if (s.kind === 'intro') return <Intro s={s} tx={tx} onBack={exit} onStart={() => setIdx(idx + 1)} />;
  if (s.kind === 'result') {
    return (
      <Result s={s} tx={tx} dog={dog} r={results[dog.id]} onBack={() => { void prev(); }}
        onAgain={() => setIdx(0)} onDone={() => goIdx('b-vstup')} dogRow={dogRow} />
    );
  }

  const list = screens.filter((x) => x.flow === s.flow && !['intro', 'result'].includes(x.kind));
  const at = list.indexOf(s);
  const ticks: number[] = [];
  list.forEach((x, i) => { if (i > 0 && x.sec !== list[i - 1].sec) ticks.push((i / list.length) * 100); });
  const pct = ((at + 1) / list.length) * 100;

  return (
    <div className="dfl-sc">
      {s.art && <div className="dfl-art" style={{ backgroundImage: `url(${ART(s.art)})` }} />}
      <div className="dfl-top">
        <BackButton tone="pale" onClick={() => { void prev(); }} label={tx('pack.quiz.back', 'Back')} />
        {s.sec && <span className="dfl-sec">{s.secE && <span className="dfl-em">{s.secE} </span>}{tx(s.sec)}</span>}
      </div>
      <div className="dfl-prog">
        <div className="dfl-progl"><span>{at + 1} / {list.length}</span><span>{Math.round(pct)} %</span></div>
        <div className="pk-progress dfl-lq"><div className="pk-progress__fill" style={{ width: percent(pct) }} />{ticks.map((x) => <s key={x} style={{ left: `${x}%` }} />)}</div>
      </div>
      {dogRow}
      <h2 className="dfl-q">{tx(s.t)}</h2>
      {s.s && <p className="dfl-s">{tx(s.s)}</p>}
      <div className="dfl-main" ref={mainRef}>
        <Body s={s} v={v} set={set} tx={tx} own={own} setOwn={setOwn} dogId={dog.id} />
        {s.tip && <Tip title={s.tipT} texts={s.tip} tx={tx} />}
        <div className="dfl-note">
          {(s.noteOpen || noteOpen[s.id] || !empty(v[noteField(s)])) ? (
            <textarea className="dfl-in" value={String(v[noteField(s)] ?? '')} placeholder={tx(s.notePh ?? 'pack.flow.ui.notePh')} onChange={(e) => set(noteField(s), e.target.value)} />
          ) : (
            <button type="button" className="dfl-noteb" onClick={() => setNoteOpen((x) => ({ ...x, [s.id]: true }))}>+ {tx('pack.flow.ui.addNote')}</button>
          )}
        </div>
      </div>
      {err && <p className="dfl-err" role="alert">{tx('pack.flow.ui.saveErr')}</p>}
      <div className="dfl-foot">
        <button type="button" className="dfl-skip" disabled={busy} onClick={() => { void skip(); }}>{tx('pack.flow.ui.skip')}</button>
        <button type="button" className="dfl-cta" disabled={busy} onClick={() => { void next(); }}>{tx(idx + 1 >= screens.length ? 'pack.flow.ui.done' : 'pack.flow.ui.next')}</button>
      </div>
    </div>
  );
}

async function classifyOther(items: { id: string; question: string; text: string; axis: string }[]): Promise<Record<string, string | null>> {
  try {
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    if (!token) return {};
    const ctl = new AbortController();
    const timer = window.setTimeout(() => ctl.abort(), 12000);
    const res = await fetch(`${SUPABASE_URL}/functions/v1/dogid-classify-other`, {
      method: 'POST', signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items }),
    });
    window.clearTimeout(timer);
    if (!res.ok) return {};
    const json = await res.json();
    return (json?.results ?? {}) as Record<string, string | null>;
  } catch {
    // Výsledok sa zráta aj bez toho a text ostáva pri psovi.
    return {};
  }
}

// ── TELO OTÁZKY ─────────────────────────────────────────────────────────────
function Reveal({ s, o, v, set, tx }: { s: FlowScreen; o: FlowOpt; v: Vals; set: (f: string, x: unknown) => void; tx: Tx }) {
  const rv = o.reveal;
  const textField = o.other ? `other.${s.id}` : rv?.field;
  const chips = asList(rv?.chipsField ? v[rv.chipsField] : undefined);
  const subVal = o.sub ? (v[o.sub.field] as string | undefined) : undefined;
  const subOpt = o.sub?.opts.find((x) => x.v === subVal);
  if (!rv && !o.sub && !o.warn) return null;
  return (
    <div className="dfl-rv">
      {rv?.chips && rv.chipsField && (
        <div className="dfl-chips">
          {rv.chips.map((c) => (
            <button key={c.v} type="button" className={`dfl-c small${chips.includes(c.v) ? ' on' : ''}`}
              onClick={() => set(rv.chipsField!, chips.includes(c.v) ? chips.filter((x) => x !== c.v) : [...chips, c.v])}>{tx(c.t)}</button>
          ))}
        </div>
      )}
      {rv?.chips && !rv.chipsField && rv.field && (
        <div className="dfl-chips">
          {rv.chips.map((c) => (
            <button key={c.v} type="button" className={`dfl-c small${v[rv.field!] === tx(c.t) ? ' on' : ''}`} onClick={() => set(rv.field!, tx(c.t))}>{tx(c.t)}</button>
          ))}
        </div>
      )}
      {textField && rv?.ph && (
        <textarea className="dfl-in" placeholder={tx(rv.ph)} value={String(v[textField] ?? '')} onChange={(e) => set(textField, e.target.value)} />
      )}
      {rv?.dateField && (
        <label><span className="dfl-lab">{tx('pack.flow.ui.when')}</span>
          <input className="dfl-in" type="date" value={String(v[rv.dateField] ?? '')} onChange={(e) => set(rv.dateField!, e.target.value)} />
        </label>
      )}
      {o.sub && (
        <div className="dfl-chips">
          {o.sub.opts.map((x) => (
            <button key={x.v} type="button" className={`dfl-c small${subVal === x.v ? ' on' : ''}`} onClick={() => set(o.sub!.field, subVal === x.v ? null : x.v)}>{tx(x.t)}</button>
          ))}
        </div>
      )}
      {o.warn && <Tip title={o.warnT} texts={[o.warn]} tx={tx} />}
      {subOpt?.warn && <Tip title={subOpt.warnT} texts={[subOpt.warn]} tx={tx} />}
    </div>
  );
}

function Body({ s, v, set, tx, own, setOwn, dogId }: {
  s: FlowScreen; v: Vals; set: (f: string, x: unknown) => void; tx: Tx; own: string; setOwn: (x: string) => void; dogId: string;
}) {
  const field = fieldOf(s);
  if (s.kind === 'single' || s.kind === 'pick2') {
    const pick = asList(v[field]);
    const toggle = (o: FlowOpt) => {
      if (s.kind === 'single') { set(field, pick.includes(o.v) ? null : o.v); return; }
      if (o.other) { set(field, pick.includes(o.v) ? [] : [o.v]); return; }
      let p = pick.filter((x) => x !== 'other');
      p = p.includes(o.v) ? p.filter((x) => x !== o.v) : [...p, o.v];
      set(field, p.slice(-2));
    };
    return (
      <div className="dfl-ans">
        {s.opts?.map((o) => (
          <React.Fragment key={o.v}>
            <button type="button" className={`dfl-a${pick.includes(o.v) ? ' on' : ''}${o.none ? ' none' : ''}`} onClick={() => toggle(o)}>
              <span className="dfl-em">{o.e}</span>
              <span className="tx">{tx(o.t)}{o.d && <small>{tx(o.d)}</small>}</span>
              <span className="dot" />
            </button>
            {pick.includes(o.v) && <Reveal s={s} o={o} v={v} set={set} tx={tx} />}
          </React.Fragment>
        ))}
      </div>
    );
  }
  if (s.kind === 'size') {
    const H = [36, 52, 72, 100];
    return (
      <div className="dfl-sizes">
        {s.opts?.map((o, i) => {
          const [kg, br] = tx(o.d ?? '').split('·').map((x) => x.trim());
          return (
            <button type="button" key={o.v} className={`dfl-sz${v[field] === o.v ? ' on' : ''}`} onClick={() => set(field, v[field] === o.v ? null : o.v)}>
              <span className="pic"><img src="/images/dogid/siluela.svg" alt="" style={{ height: `${H[i]}%` }} /></span>
              <b>{tx(o.t)}</b><em>{kg}</em><small>{br}</small>
            </button>
          );
        })}
      </div>
    );
  }
  if (s.kind === 'chips') {
    const pick = asList(v[field]);
    const known = new Set((s.opts ?? []).map((o) => o.v));
    const extras = pick.filter((x) => !known.has(x));
    const toggle = (val: string, none?: boolean) => {
      if (none) { set(field, pick.includes(val) ? [] : [val]); return; }
      const noneVals = new Set((s.opts ?? []).filter((o) => o.none).map((o) => o.v));
      const p = pick.filter((x) => !noneVals.has(x));
      set(field, p.includes(val) ? p.filter((x) => x !== val) : [...p, val]);
    };
    const full = !!s.max && pick.length >= s.max;
    const commit = () => { const x = own.trim(); if (!x) return; setOwn(''); if (!pick.includes(x) && !full) set(field, [...pick, x]); };
    return (
      <>
        <div className="dfl-chips">
          {s.opts?.map((o) => (
            <React.Fragment key={o.v}>
              <button type="button" disabled={full && !pick.includes(o.v)} className={`dfl-c${pick.includes(o.v) ? ' on' : ''}${o.none ? ' none' : ''}`} onClick={() => toggle(o.v, o.none)}>
                {o.e && <span className="dfl-em">{o.e} </span>}{tx(o.t)}
              </button>
              {/* Doplnenie ide hneď pod svoju odpoveď, nie pod všetky (Matej 2. 11.). */}
              {pick.includes(o.v) && <Reveal s={s} o={o} v={v} set={set} tx={tx} />}
            </React.Fragment>
          ))}
          {extras.map((x) => <button type="button" key={x} className="dfl-c on" onClick={() => toggle(x)}>{tx(`pack.dogTag.${x}`, tx(`pack.dogCard.fear.${x}`, x))}</button>)}
        </div>
        {s.max && <div className="dfl-count">{pick.length} / {s.max}</div>}
        {s.add && (
          <div className="dfl-add">
            <input className="dfl-in" value={own} onChange={(e) => setOwn(e.target.value)} onBlur={commit} placeholder={tx('pack.flow.ui.addOwn')}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }} />
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={commit}>{tx('pack.flow.ui.add')}</button>
          </div>
        )}
      </>
    );
  }
  if (s.kind === 'matrix') {
    const tone: Record<string, string> = { green: 'green', amber: 'amber', red: 'red' };
    return (
      <div className="dfl-mx">
        {s.rows?.map((r) => (
          <div className="dfl-mr" key={r.field}>
            <b>{r.e && <span className="dfl-em">{r.e} </span>}{tx(r.l)}</b>
            <div className="dfl-mo">
              {r.vals.map((x) => (
                <button type="button" key={x.v} className={`${v[r.field] === x.v ? 'on' : ''} ${s.colored ? tone[x.v] ?? '' : ''}`} onClick={() => set(r.field, v[r.field] === x.v ? null : x.v)}>{tx(x.t)}</button>
              ))}
            </div>
            {r.noteField && v[r.field] === 'amber' && (
              <input className="dfl-in" placeholder={tx('pack.flow.ui.depends')} value={String(v[r.noteField] ?? '')} onChange={(e) => set(r.noteField!, e.target.value)} />
            )}
          </div>
        ))}
      </div>
    );
  }
  if (s.kind === 'fields') {
    return (
      <>
        <div className="dfl-flds">
          {s.fields?.map((f) => (
            <label key={f.field}>
              <span className="dfl-lab">{tx(f.l)}</span>
              {f.area
                ? <textarea className="dfl-in" placeholder={f.ph ? tx(f.ph) : undefined} value={String(v[f.field] ?? '')} onChange={(e) => set(f.field, e.target.value)} />
                : <input className={`dfl-in${s.big ? ' big' : ''}`} type={s.big ? 'number' : f.type ?? 'text'} inputMode={s.big ? 'decimal' : undefined} placeholder={f.ph ? tx(f.ph) : undefined} value={String(v[f.field] ?? '')} onChange={(e) => set(f.field, e.target.value)} />}
            </label>
          ))}
        </div>
        {s.photos && <WeightPhotos s={s} tx={tx} dogId={dogId} v={v} set={set} />}
      </>
    );
  }
  if (s.kind === 'vet') return <VetSearch field={field} v={v} set={set} tx={tx} />;
  return null;
}

// ── VETERINÁR ───────────────────────────────────────────────────────────────
// Našeptávač Mapy.com, rovnaký endpoint ako `PlaceField`. Text sa dá nechať aj vlastný.
function VetSearch({ field, v, set, tx }: { field: string; v: Vals; set: (f: string, x: unknown) => void; tx: Tx }) {
  const { lang } = useLang();
  const [sug, setSug] = useState<{ name: string; sub: string }[]>([]);
  const text = String(v[field] ?? '');
  const seq = useRef(0);
  const type = (x: string) => {
    set(field, x);
    const my = ++seq.current;
    if (x.trim().length < 3) { setSug([]); return; }
    window.setTimeout(async () => {
      if (my !== seq.current) return;
      try {
        const res = await fetch(`${MAPY_BASE}/v1/suggest?query=${encodeURIComponent(`${x} veterin`)}&lang=${lang}&limit=5&apikey=${MAPY_API_KEY}`);
        const json = await res.json();
        if (my !== seq.current) return;
        setSug((json?.items ?? []).map((i: { name: string; location?: string; label?: string }) => ({ name: i.name, sub: i.location ?? i.label ?? '' })));
      } catch { setSug([]); }
    }, 300);
  };
  return (
    <>
      <input className="dfl-in" value={text} placeholder={tx('pack.flow.ui.vetPh')} onChange={(e) => type(e.target.value)} />
      {sug.length > 0 && (
        <div className="dfl-vet">
          {sug.map((x) => (
            <button type="button" key={`${x.name}${x.sub}`} className="dfl-a" onClick={() => { set(field, `${x.name}, ${x.sub}`); setSug([]); }}>
              <span className="tx">{x.name}<small>{x.sub}</small></span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ── FOTKY VÁHY ──────────────────────────────────────────────────────────────
// Dobrovoľné. AI pripraví návrh, Matej ho odklikne na Telegrame a až potom ide členovi do správ.
function WeightPhotos({ s, tx, dogId, v, set }: { s: FlowScreen; tx: Tx; dogId: string; v: Vals; set: (f: string, x: unknown) => void }) {
  const { lang } = useLang();
  const [side, setSide] = useState<string | null>(null);
  const [top, setTop] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<'idle' | 'sent' | 'err'>('idle');
  const P = s.photos!;
  const up = async (e: React.ChangeEvent<HTMLInputElement>, put: (x: string) => void) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true); setState('idle');
    try { put((await uploadDogIdPhoto(f)).secureUrl); } catch { setState('err'); } finally { setBusy(false); }
  };
  const send = async () => {
    if (!side || !top) return;
    setBusy(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/dogid-weight-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sess.session?.access_token ?? ''}` },
        body: JSON.stringify({ dogId, sideUrl: side, topUrl: top, weightKg: v['health.weightKg'] ?? null, lang }),
      });
      if (!res.ok) throw new Error(String(res.status));
      set('health.weightPhotos', { side, top });
      setState('sent');
    } catch { setState('err'); } finally { setBusy(false); }
  };
  return (
    <div style={{ marginTop: 16 }}>
      <span className="dfl-lab">{tx(P.title)}</span>
      <p className="dfl-s" style={{ marginTop: 0 }}>{tx(P.hint)}</p>
      <div className="dfl-ph">
        {[{ url: side, put: setSide, l: P.side, h: P.sideHint, ex: 'siluela' }, { url: top, put: setTop, l: P.top, h: P.topHint, ex: 'zhora' }].map((x) => (
          <label className="dfl-phb" key={x.ex}>
            {x.url ? <img className="full" src={x.url} alt="" /> : <img src={`/images/dogid/${x.ex}.svg`} alt="" />}
            {!x.url && <><b>{tx(x.l)}</b><small>{tx(x.h)}</small></>}
            <input type="file" accept="image/*" disabled={busy} aria-label={tx(x.l)} onChange={(e) => { void up(e, x.put); }} />
          </label>
        ))}
      </div>
      {state === 'sent'
        ? <Say text={P.sent} tx={tx} />
        : <button type="button" className="dfl-cta sm" style={{ marginTop: 8 }} disabled={busy || !side || !top} onClick={() => { void send(); }}>{tx(busy ? 'pack.flow.ui.sending' : P.cta)}</button>}
      {state === 'err' && <p className="dfl-err" role="alert">{tx('pack.flow.ui.saveErr')}</p>}
    </div>
  );
}

// ── ÚVOD OSOBNOSTI ──────────────────────────────────────────────────────────
function Intro({ s, tx, onBack, onStart }: { s: FlowScreen; tx: Tx; onBack: () => void; onStart: () => void }) {
  return (
    <div className="dfl-sc">
      {s.art && <div className="dfl-art" style={{ backgroundImage: `url(${ART(s.art)})` }} />}
      <div className="dfl-top"><BackButton tone="pale" onClick={onBack} label={tx('pack.quiz.back', 'Back')} /></div>
      <h2 className="dfl-q" style={{ marginTop: 0 }}>{tx(s.t)}</h2>
      {s.s && <p className="dfl-s">{tx(s.s)}</p>}
      <div className="dfl-main">
        {s.badgesTitle && <span className="dfl-lab">{tx(s.badgesTitle)}</span>}
        <div className="dfl-ax">{ELEMENT_KEYS.map((k) => <figure key={k}><img src={`/images/nature/el-${k}.webp`} alt="" />{tx(NATURE_ELEMENTS[k].i18n, NATURE_ELEMENTS[k].labelEN)}</figure>)}</div>
        <div className="dfl-ax">{ROLE_KEYS.map((k) => <figure key={k}><img src={`/images/nature/role-${k}.webp`} alt="" />{tx(NATURE_ROLES[k].i18n, NATURE_ROLES[k].labelEN)}</figure>)}</div>
        <div className="dfl-ax" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>{SPECIAL_KEYS.map((k) => <figure key={k}><img src={`/images/nature/spec-${k}.webp`} alt="" />{tx(NATURE_SPECIALS[k].i18n, NATURE_SPECIALS[k].labelEN)}</figure>)}</div>
      </div>
      {s.attr && <p className="dfl-attr">{tx(s.attr)}</p>}
      <button type="button" className="dfl-cta w" onClick={onStart}>{tx(s.cta ?? 'pack.flow.ui.start')}</button>
    </div>
  );
}

// ── VÝSLEDOK ────────────────────────────────────────────────────────────────
function Result({ s, tx, dog, r, onBack, onAgain, onDone, dogRow }: {
  s: FlowScreen; tx: Tx; dog: Dog; r?: NatureResult; onBack: () => void; onAgain: () => void; onDone: () => void; dogRow: React.ReactNode;
}) {
  return (
    <div className="dfl-sc">
      {s.art && <div className="dfl-art" style={{ backgroundImage: `url(${ART(s.art)})` }} />}
      <div className="dfl-top"><BackButton tone="pale" onClick={onBack} label={tx('pack.quiz.back', 'Back')} /></div>
      {dogRow}
      {r && (
        <div className="dfl-res">
          <div className="nm">{dog.dog_name}</div>
          <div className="tt">{tx(NATURE_ROLES[r.role].i18n, NATURE_ROLES[r.role].labelEN)} {tx(`pack.nature.el.${r.element}.of`, r.element)}</div>
          <div className="dfl-badges">
            <div className="dfl-bd"><img src={`/images/nature/el-${r.element}.webp`} alt="" /><b>{tx(NATURE_ELEMENTS[r.element].i18n, NATURE_ELEMENTS[r.element].labelEN)}</b></div>
            <div className="dfl-bd"><img src={`/images/nature/role-${r.role}.webp`} alt="" /><b>{tx(NATURE_ROLES[r.role].i18n, NATURE_ROLES[r.role].labelEN)}</b></div>
          </div>
        </div>
      )}
      <div className="dfl-foot">
        <button type="button" className="dfl-lnk" onClick={onAgain}>{tx(s.cta2 ?? 'pack.flow.ui.again')}</button>
        <button type="button" className="dfl-cta" style={{ marginLeft: 'auto' }} onClick={onDone}>{tx(s.cta ?? 'pack.flow.ui.done')}</button>
      </div>
    </div>
  );
}

// ── ZÁVET ───────────────────────────────────────────────────────────────────
// Tie isté polia a to isté odoslanie ako `WillPanel` na doklade.
function Will({ tx, dogs }: { tx: Tx; dogs: Dog[] | null }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const onlyDog = params.get('dog');
  const s = screenById('zavet')!;
  const [dogIdx, setDogIdx] = useState(0);
  const [form, setForm] = useState({ heirName: '', heirEmail: '', heirEmail2: '', letter: '' });
  const [stored, setStored] = useState(form);
  const [state, setState] = useState<'idle' | 'ask' | 'sent'>('idle');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const dog = dogs?.[Math.min(dogIdx, dogs.length - 1)];
  const L = s.labels ?? {};
  useEffect(() => {
    if (!dog) return;
    let alive = true;
    readLatestForDogs([dog.id]).then((by) => {
      if (!alive) return;
      const str = (f: string) => { const x = by[dog.id]?.[f]?.value; return typeof x === 'string' ? x : ''; };
      const next = { heirName: str('will.heirName'), heirEmail: str('will.heirEmail'), heirEmail2: str('will.heirEmail2'), letter: str('will.letter') };
      setForm(next); setStored(next); setState('idle');
    });
    return () => { alive = false; };
  }, [dog?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const dirty = JSON.stringify(form) !== JSON.stringify(stored);
  const put = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((x) => ({ ...x, [k]: e.target.value }));
  const emailOk = /^\S+@\S+\.\S+$/.test(form.heirEmail.trim());
  const save = async () => {
    if (!dog) return;
    setBusy(true);
    try {
      await appendDogEvents((Object.keys(form) as (keyof typeof form)[])
        .filter((k) => form[k] !== stored[k])
        .map((k) => ({ dogId: dog.id, field: `will.${k}`, value: form[k].trim() || null, source: 'profile' as const })));
      setStored(form); setErr(false);
    } catch { setErr(true); } finally { setBusy(false); }
  };
  const send = async () => {
    if (!dog) return;
    setBusy(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-will`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sess.session?.access_token ?? ''}` },
        body: JSON.stringify({ dogId: dog.id }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState('sent'); setErr(false);
    } catch { setErr(true); setState('idle'); } finally { setBusy(false); }
  };
  return (
    <div className="dfl-sc">
      {s.art && <div className="dfl-art" style={{ backgroundImage: `url(${ART(s.art)})` }} />}
      <div className="dfl-top"><BackButton tone="pale" onClick={() => navigate(`/pack/dogs/dogid${onlyDog ? `?dog=${onlyDog}` : ''}`)} label={tx('pack.quiz.back', 'Back')} /></div>
      {dogs && dogs.length > 1 && (
        <div className="dfl-dogs">{dogs.map((d, i) => <button key={d.id} type="button" className={`dfl-dog${i === dogIdx ? ' on' : ''}`} onClick={() => setDogIdx(i)}><i />{d.dog_name ?? '—'}</button>)}</div>
      )}
      <h2 className="dfl-q" style={{ marginTop: 8 }}>{tx(s.t)}</h2>
      {s.s && <p className="dfl-s">{tx(s.s)}</p>}
      <div className="dfl-main">
        <div className="dfl-flds">
          <label><span className="dfl-lab">{tx(L.heir)}</span><input className="dfl-in" value={form.heirName} placeholder={tx(L.heirPh)} onChange={put('heirName')} /></label>
          <label><span className="dfl-lab">{tx(L.email)}</span><input className="dfl-in" type="email" inputMode="email" autoCapitalize="off" value={form.heirEmail} placeholder="meno@email.sk" onChange={put('heirEmail')} /></label>
          <label><span className="dfl-lab">{tx(L.email2)}</span><input className="dfl-in" type="email" inputMode="email" autoCapitalize="off" value={form.heirEmail2} onChange={put('heirEmail2')} /></label>
          <label><span className="dfl-lab">{tx(L.letter)}</span><textarea className="dfl-in" value={form.letter} placeholder={tx(L.letterPh)} onChange={put('letter')} /></label>
          <div className="dfl-chips">
            {s.sug?.map((x) => (
              <button key={x} type="button" className="dfl-c small" style={{ textAlign: 'left' }} onClick={() => setForm((f) => ({ ...f, letter: `${f.letter.trim() ? `${f.letter.trim()}\n` : ''}${tx(x)}` }))}>+ {tx(x)}</button>
            ))}
          </div>
        </div>
      </div>
      {err && <p className="dfl-err" role="alert">{tx('pack.flow.ui.saveErr')}</p>}
      {state === 'sent' ? (
        <Say text="pack.flow.ui.sentOk" tx={tx} />
      ) : state === 'ask' ? (
        <>
          <p className="dfl-s">{tx('pack.flow.ui.confirmSend')}</p>
          <div className="dfl-foot" style={{ marginTop: 0 }}>
            <button type="button" className="dfl-lnk" onClick={() => setState('idle')}>{tx('pack.flow.ui.notYet')}</button>
            <button type="button" className="dfl-cta" style={{ marginLeft: 'auto' }} disabled={busy} onClick={() => { void send(); }}>{tx('pack.flow.ui.willSend')}</button>
          </div>
        </>
      ) : dirty || !emailOk || !form.heirName.trim() || !form.letter.trim() ? (
        <div className="dfl-foot"><button type="button" className="dfl-cta w" disabled={busy || !dirty} onClick={() => { void save(); }}>{tx(L.save)}</button></div>
      ) : (
        <div className="dfl-foot"><span className="dfl-s" style={{ margin: 0 }}>{tx('pack.flow.ui.saved')}</span><button type="button" className="dfl-cta" style={{ marginLeft: 'auto' }} onClick={() => setState('ask')}>{tx(L.send)}</button></div>
      )}
    </div>
  );
}
