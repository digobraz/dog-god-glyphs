// ════════════════════════════════════════════════════════════════════════════
// DOG ID · MODULY — `/pack/dogs/dogid` (voliteľne `?dog=<id>`). 8. 10. 2026.
//
// Matej nad nákresom `plany/nakres-dogs-konsolidacia-2026-10-08.html` (v3):
// *„DOG ID = moduly. VYPLNIŤ → zoznam modulov: ZÁKLAD · OSOBNOSŤ · neskôr Kŕmna
// dávka, Doplnky…"* · *„treba aj detailný pohľad, čo pes je"*.
// Lock: `plany/locky/dogs-dogid.md` §REVÍZIA 8. 10.
//
// ⚠️ KÔŠ 2 „POZERÁM SA" (lock `architektura-pack.md` §3) — rozcestník, lišta ostáva,
//    hore šípka späť. Samotné vypĺňanie je kôš 3 (kvíz bez lišty).
// ⚠️ Moduly a ich polia drží `components/pack/dogIdModules.ts` — táto obrazovka
//    nič nepočíta po svojom, len kreslí. Percento je TO ISTÉ číslo ako v psom bloku.
// ⚠️ Percento má vlastné dve farby (lock 12. 9.): pod 100 červená, na 100 zelená.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PackLayout } from '@/components/pack/PackLayout';
import { BackButton } from '@/components/pack/BackButton';
import { RightGate } from '@/components/pack/RightGate';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { HandCheck } from '@/components/pack/HandIcons';
import {
  PACK_THEME, PACK_BOX, PACK_HEAD, PACK_SPACE, PACK_TEXT, PACK_R, GOLD_BTN,
  FONT_TITLE, FONT_UI, PILL_CSS, PROGRESS_CSS,
} from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PALE, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import {
  DOGID_MODULES, LIVE_MODULES, BASE_FLOW, moduleProgress, firstOpenStep, segmentAt,
  type DogIdModule,
} from '@/components/pack/dogIdModules';
import { readLatestForDogs, onDogEventsChange, hasValue, type LatestValue } from '@/lib/dogEvents';
import { loadPackDogs } from '@/lib/packDogsList';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
type Tx = (key: string, fallback: string) => string;
type ModDog = { id: string; dog_name: string | null };
type Latest = Record<string, Record<string, LatestValue>>;

/** Zelená HOTOVO — tá istá, akú nesie percento psa na 100 % (lock 12. 9.). */
const DONE_GREEN = '#3D7A4E';

export default function PackDogIdModules() {
  const t = useT();
  const tx: Tx = (key, fallback) => { const v = t(key); return v === key ? fallback : v; };
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [dogs, setDogs] = useState<ModDog[] | null>(null);
  const [latest, setLatest] = useState<Latest | null>(null);

  useEffect(() => {
    let alive = true;
    loadPackDogs<ModDog>('id, dog_name').then((rows) => { if (alive) setDogs(rows); });
    return () => { alive = false; };
  }, []);

  // Prekreslenie po návrate z kvízu nesie `onDogEventsChange` (in-tab signál po zápise).
  useEffect(() => {
    if (!dogs || dogs.length === 0) return;
    let alive = true;
    const load = () => readLatestForDogs(dogs.map((d) => d.id)).then((r) => { if (alive) setLatest(r); });
    load();
    const off = onDogEventsChange(load);
    return () => { alive = false; off(); };
  }, [dogs]);

  const many = (dogs?.length ?? 0) > 1;
  // Výber žije v ADRESE — návrat z kvízu ho musí poznať. Pri jednom psovi niet čo vyberať.
  const asked = params.get('dog');
  const sel = !dogs ? 'all'
    : !many ? (dogs[0]?.id ?? 'all')
    : asked && dogs.some((d) => d.id === asked) ? asked : 'all';
  const ids = useMemo(() => (!dogs ? [] : sel === 'all' ? dogs.map((d) => d.id) : [sel]), [dogs, sel]);
  const pick = (id: string) => setParams(id === 'all' ? {} : { dog: id }, { replace: true });

  const total = useMemo(() => {
    if (!latest) return null;
    let filled = 0; let all = 0;
    for (const m of LIVE_MODULES) { const p = moduleProgress(m, latest, ids); filled += p.filled; all += p.total; }
    return all === 0 ? 0 : Math.round((filled / all) * 100);
  }, [latest, ids]);

  return (
    <PackLayout>
      <style>{PILL_CSS}{PROGRESS_CSS}{CSS}</style>
      <section style={{ ...PACK_BOX.card, padding: PACK_SPACE.xl }}>
        <div className="dm-head">
          <BackButton tone="pale" onClick={() => navigate('/pack/dogs')} label={tx('pack.chronicle.back', 'Back')} />
          <h1 style={{ ...PACK_HEAD.card, color: PALE.deep, margin: 0 }}>{tx('pack.hub.profileTitle', 'DOG ID')}</h1>
        </div>

        {many && (
          <div className="dm-pills">
            <button type="button" className={`pk-pill pk-pill--tap dm-pill${sel === 'all' ? ' on' : ''}`} onClick={() => pick('all')}>
              {tx('pack.chronicle.allDogs', 'All')}
            </button>
            {dogs!.map((d) => (
              <button key={d.id} type="button" className={`pk-pill pk-pill--tap dm-pill${sel === d.id ? ' on' : ''}`} onClick={() => pick(d.id)}>
                {d.dog_name ?? '—'}
              </button>
            ))}
          </div>
        )}

        {/* SPOLU — to isté číslo, aké nesie psí blok (pri jednom psovi doslova). */}
        <div className="dm-total">
          <span style={{ ...PACK_HEAD.section, color: T.inkWarm }}>{tx('pack.dogid.total', 'Overall')}</span>
          <Bar pct={total ?? 0} />
          <b className="dm-pct">{total === null ? '—' : `${total} %`}</b>
        </div>

        {dogs && dogs.length === 0 && <p className="dm-hint">{tx('pack.quiz.noDogs', 'No dog to fill this in for yet.')}</p>}

        <div className="dm-list">
          {DOGID_MODULES.map((m) => (
            <ModuleRow key={m.key} mod={m} latest={latest} ids={ids} sel={sel} dogs={dogs ?? []} tx={tx} />
          ))}
        </div>

        {/* DETAIL — celé DOG ID na čítanie (doklad psa s pohľadmi pre veterinára a strážcu). */}
        {dogs && dogs.length > 0 && (
          <div className="dm-detail">
            <div style={{ minWidth: 0 }}>
              <div className="dm-title">{tx('pack.dogid.detail', 'The whole DOG ID')}</div>
              <p className="dm-sub">{tx('pack.dogid.detailSub', 'To read — for you, the vet or whoever looks after them.')}</p>
            </div>
            <div className="dm-detail-links">
              {(sel === 'all' ? dogs : dogs.filter((d) => d.id === sel)).map((d) => (
                <Link key={d.id} to={`/pack/dogs/${d.id}`} className="pk-pill pk-pill--tap dm-pill">
                  {d.dog_name ?? '—'}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </PackLayout>
  );
}

// ── riadok modulu ────────────────────────────────────────────────────────────
function ModuleRow({ mod, latest, ids, sel, dogs, tx }: {
  mod: DogIdModule; latest: Latest | null; ids: string[]; sel: string; dogs: ModDog[]; tx: Tx;
}) {
  const label = tx(mod.i18n, mod.labelEN);
  const sub = tx(mod.subI18n, mod.subEN);

  // ČOSKORO — RIADOK (plochý), nie PODBLOK: je to prísľub, nie úloha, takže nesmie
  // vyzerať rovnako ťažko ako moduly, ktoré sa dajú vyplniť.
  if (mod.soon) {
    return (
      <div className="dm-mod is-soon" style={PACK_BOX.row}>
        <div className="dm-emoji" aria-hidden><BrandIcon name={mod.icon} size={PACK_SPACE.xl} tint="dim" /></div>
        <div style={{ minWidth: 0 }}>
          <div className="dm-title">{label}</div>
          <p className="dm-sub">{sub}</p>
        </div>
        <span className="pk-pill pk-pill--locked dm-soon">{tx('pack.dogid.soon', 'Soon')}</span>
      </div>
    );
  }

  const p = latest ? moduleProgress(mod, latest, ids) : null;
  const started = !!p && p.filled > 0;
  const meta = mod.questions === 0
    ? tx('pack.hub.nature.meta', '22 questions · ~3 minutes')
    : tx('pack.dogid.questions', '{n} questions').replace('{n}', String(mod.questions));
  const dogQ = sel === 'all' ? '' : `?dog=${sel}`;

  // Kam vedie CTA a čo stojí pod ním — jedno miesto pre všetky živé moduly.
  let href = '';
  let hint = '';
  if (mod.key === 'base') {
    href = `/pack/dogs/quiz/base${dogQ}`;
    // „POKRAČOVAŤ · ZDRAVIE 3/10" — návrat je prvá nevyplnená otázka (Matej 8. 10.).
    if (latest && p && started && !p.done) {
      const at = firstOpenStep(BASE_FLOW.steps, latest, ids);
      if (at >= 0) {
        const seg = segmentAt(at);
        hint = `${tx(seg.section.i18n, seg.section.labelEN)} · ${at - seg.start + 1} / ${seg.count}`;
      }
    }
  } else if (mod.key === 'nature') {
    href = p?.done ? `/pack/nature?view=result${sel === 'all' ? '' : `&dog=${sel}`}` : `/pack/nature${dogQ}`;
  } else if (mod.key === 'will') {
    // Závet je list JEDNÉHO psa — pri „Všetci" ide na prvého, ktorému chýba.
    const target = sel !== 'all' ? sel
      : (dogs.find((d) => mod.steps.some((s) => !hasValue(latest?.[d.id]?.[s.field])))?.id ?? dogs[0]?.id);
    href = target ? `/pack/dogs/${target}?panel=will` : '';
    if (sel === 'all' && dogs.length > 1 && target && !p?.done) hint = dogs.find((d) => d.id === target)?.dog_name ?? '';
  }
  const cta = !p ? ''
    : p.done ? (mod.key === 'nature' ? tx('pack.dogid.result', 'Result') : tx('pack.dogid.edit', 'Edit'))
    : started ? tx('pack.dogid.continue', 'Continue')
    : tx('pack.dogid.start', 'Start');
  // Hotový modul = tiché tlačidlo (úprava je možnosť, nie výzva). Výsledok osobnosti
  // ostáva plný — je to jediná cesta k nemu.
  const quiet = !!p?.done && mod.key !== 'nature';

  return (
    <div className="dm-mod" style={PACK_BOX.subblock}>
      <div className="dm-emoji" aria-hidden><BrandIcon name={mod.icon} size={PACK_SPACE.xxl} tint="gold" /></div>
      <div style={{ minWidth: 0 }}>
        <div className="dm-title">
          {label}
          {p?.done && <span className="dm-done" title={tx('pack.hub.done', 'Done')}><HandCheck size={PACK_TEXT.label} /></span>}
        </div>
        <p className="dm-sub">{sub}</p>
        <div className="dm-bar">
          <Bar pct={p?.pct ?? 0} />
          <b className="dm-pct">{p ? `${p.pct} %` : '—'}</b>
        </div>
        <p className="dm-meta">{meta}</p>
      </div>
      <div className="dm-cta-col">
        {href && cta && (
          <RightGate right="dogid.edit">
            <Link to={href} className={quiet ? 'dm-ghost' : 'dm-cta'}>{cta}</Link>
          </RightGate>
        )}
        {hint && <span className="dm-hint-cta">{hint}</span>}
      </div>
    </div>
  );
}

/** Šírka výplne PROGRESU — rovnaký pomocník ako vo `VaultKnowledge`. */
const fill = (pct: number) => {
  const w = `${Math.min(100, Math.max(0, pct))}%`;
  return { width: w };
};

/** PROGRES z katalógu (`.pk-progress`) s farbami percenta DOG ID. */
function Bar({ pct }: { pct: number }) {
  const cls = pct >= 100 ? ' pk-progress__fill--done' : ' pk-progress__fill--low';
  return (
    <div className="pk-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`pk-progress__fill${cls}`} style={fill(pct)} />
    </div>
  );
}

const CSS = `
.dm-head{display:flex;align-items:center;gap:${PACK_SPACE.md}px;margin-bottom:${PACK_SPACE.lg}px}
.dm-pills{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;margin-bottom:${PACK_SPACE.lg}px}
.dm-pill{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;letter-spacing:0.02em;text-transform:uppercase;text-decoration:none}
.dm-pill.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.dm-total{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:${PACK_SPACE.md}px;margin-bottom:${PACK_SPACE.xl}px}
.dm-pct{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;color:${T.inkStrong};white-space:nowrap;min-width:${PACK_SPACE.xxxl}px;text-align:right}
.dm-list{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px}
.dm-mod{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;padding:${PACK_SPACE.lg}px}
.dm-mod.is-soon{opacity:.62}
.dm-emoji{display:flex;align-items:center;justify-content:center;width:${PACK_SPACE.xxl}px}
.dm-title{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;letter-spacing:0.14em;text-transform:uppercase;color:${T.inkStrong};display:flex;align-items:center;gap:${PACK_SPACE.sm}px}
.dm-done{display:inline-flex;align-items:center;justify-content:center;width:${PACK_SPACE.xl}px;height:${PACK_SPACE.xl}px;border-radius:${PACK_R.pill}px;background:${DONE_GREEN};color:#EAF7ED;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;letter-spacing:0}
.dm-sub{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;line-height:1.45;color:${T.inkWarm};margin:${PACK_SPACE.xs}px 0 0}
.dm-meta{font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;letter-spacing:0.14em;text-transform:uppercase;color:${T.inkFaint};margin:${PACK_SPACE.xs}px 0 0}
.dm-bar{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:${PACK_SPACE.md}px;margin-top:${PACK_SPACE.sm}px;max-width:360px}
.dm-cta-col{display:flex;flex-direction:column;align-items:flex-end;gap:${PACK_SPACE.xs}px}
.dm-cta,.dm-ghost{display:inline-flex;align-items:center;justify-content:center;min-width:132px;border-radius:${PACK_R.field}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;font-family:${FONT_TITLE};font-size:${PACK_TEXT.label}px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;white-space:nowrap;text-decoration:none;transition:transform .2s}
.dm-cta{background:${LAPIS.grad};border:1px solid ${GOLD_BTN.edge};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW}}
.dm-cta:hover{transform:scale(1.04);background:${LAPIS.gradHover}}
.dm-ghost{background:transparent;border:1px solid ${T.border};color:${T.inkWarm}}
.dm-ghost:hover{border-color:${T.cardEdge};color:${T.inkStrong}}
.dm-hint-cta{font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;letter-spacing:0.14em;text-transform:uppercase;color:${T.inkFaint};white-space:nowrap}
.dm-soon{font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase}
.dm-detail{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:${PACK_SPACE.md}px;margin-top:${PACK_SPACE.xl}px;padding-top:${PACK_SPACE.lg}px;border-top:1px dashed ${T.border}}
.dm-detail-links{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px}
.dm-hint{font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkWarm}}
@media (max-width:560px){
  .dm-mod{grid-template-columns:auto minmax(0,1fr)}
  .dm-mod.is-soon{grid-template-columns:auto minmax(0,1fr) auto}
  .dm-cta-col{grid-column:1/-1;align-items:stretch}
  .dm-cta,.dm-ghost{width:100%}
  .dm-hint-cta{text-align:center}
}
`;
