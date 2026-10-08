// ════════════════════════════════════════════════════════════════════════════
// DOG ID · MODULY — `/pack/dogs/dogid` (voliteľne `?dog=<id>`). 8. 10. 2026.
//
// Matej nad nákresom `plany/nakres-dogs-konsolidacia-2026-10-08.html` (v3):
// *„DOG ID = moduly. VYPLNIŤ → zoznam modulov: ZÁKLAD · OSOBNOSŤ · neskôr Kŕmna
// dávka…"* · *„treba aj detailný pohľad, čo pes je"*.
// Lock: `plany/locky/dogs-dogid.md` §REVÍZIA 8. 10.
//
// 🔁 DRUHÁ PODOBA (Matej 8. 10. nad zoznamom pod sebou): *„táto obrazovka by mala byť
//    na vh 100… zapracuj taste skill ako všade, nech je to juicy, nech je to súrodé"*.
//    Preto:
//  • OBRAZOVKA SA ZMESTÍ — karta je vysoká presne od svojho vrchu po spodný nav
//    (`--dm-top` meria stránka, `--pack-nav-h/-bottom` publikuje nav). Kto sa nezmestí,
//    zmenší OBSAH (pri nízkom okne zmizne zoznam sekcií), nie rezervu (lock PAGE_AIR).
//  • ASYMETRICKÉ BENTO (taste skill: žiadne „3 rovnaké karty"): ZÁKLAD je veľká dlaždica
//    so sekciami, OSOBNOSŤ nesie VITRÁŽ (tú istú ako karta DOG ID na /dogs = súrodosť),
//    ZÁVET menšia dlaždica, Kŕmna dávka tichý riadok ČOSKORO.
//  • Nadpis TMAVÝ (`inkStrong`) — jeden atrament pre celú rodinu /dogs.
//  • Nábeh dlaždíc kaskádou + stlačenie (`scale .98`), bez pohybu pri `reduced-motion`.
//
// ⚠️ KÔŠ 2 „POZERÁM SA" (lock `architektura-pack.md` §3) — lišta ostáva, hore šípka späť.
// ⚠️ Moduly a ich polia drží `components/pack/dogIdModules.ts` — obrazovka nič nepočíta
//    po svojom. Percento je TO ISTÉ číslo ako v psom bloku; farby percenta (lock 12. 9.):
//    pod 100 červená, na 100 zelená.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PackLayout } from '@/components/pack/PackLayout';
import { BackButton } from '@/components/pack/BackButton';
import { RightGate } from '@/components/pack/RightGate';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { HandCheck } from '@/components/pack/HandIcons';
import {
  PACK_THEME, PACK_BOX, PACK_HEAD, PACK_SPACE, PACK_TEXT, PACK_R, PACK_SHADOW, GOLD_BTN,
  FONT_TITLE, FONT_UI, PILL_CSS, PROGRESS_CSS,
} from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import {
  DOGID_MODULES, LIVE_MODULES, BASE_FLOW, BASE_SEGMENTS, moduleProgress, firstOpenStep, segmentAt,
  type DogIdModule,
} from '@/components/pack/dogIdModules';
import { readLatestForDogs, onDogEventsChange, hasValue, type LatestValue } from '@/lib/dogEvents';
import { loadPackDogs } from '@/lib/packDogsList';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
type Tx = (key: string, fallback: string) => string;
type ModDog = { id: string; dog_name: string | null };
type Latest = Record<string, Record<string, LatestValue>>;

/** Vitráž kvízu osobnosti — tá istá ako na karte DOG ID na /dogs. */
const NATURE_ART = '/images/nature-quiz-art.webp';

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

  // VÝŠKA = 100 dvh: vrch karty sa meria (hlavička stránky má vlastnú výšku podľa šírky),
  // spodok drží nav cez CSS premenné, ktoré sám publikuje.
  const cardRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const set = () => el.style.setProperty('--dm-top', `${Math.round(el.getBoundingClientRect().top + window.scrollY)}px`);
    set();
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
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

  const mod = (k: string) => DOGID_MODULES.find((m) => m.key === k)!;
  const soon = DOGID_MODULES.filter((m) => m.soon);
  const shown = sel === 'all' ? (dogs ?? []) : (dogs ?? []).filter((d) => d.id === sel);

  return (
    <PackLayout>
      <style>{PILL_CSS}{PROGRESS_CSS}{CSS}</style>
      <section ref={cardRef} className="dm" style={{ ...PACK_BOX.card, boxShadow: PACK_SHADOW.panel }}>
        {/* ── hlavička: návrat · názov  |  SPOLU ── */}
        <header className="dm-head">
          <div className="dm-head-l">
            <BackButton tone="pale" onClick={() => navigate('/pack/dogs')} label={tx('pack.chronicle.back', 'Back')} />
            <div style={{ minWidth: 0 }}>
              <span className="dm-eyebrow">{tx('pack.dogid.eyebrow', 'Your dog’s document')}</span>
              <h1 className="dm-h1">{tx('pack.hub.profileTitle', 'DOG ID')}</h1>
            </div>
          </div>
          <div className="dm-total">
            <span style={{ ...PACK_HEAD.section, color: T.inkWarm }}>{tx('pack.dogid.total', 'Overall')}</span>
            <b>{total === null ? '—' : `${total} %`}</b>
            <Bar pct={total ?? 0} />
          </div>
        </header>

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

        {dogs && dogs.length === 0 ? (
          <p className="dm-hint">{tx('pack.quiz.noDogs', 'No dog to fill this in for yet.')}</p>
        ) : (
          <div className="dm-bento">
            <BaseTile mod={mod('base')} latest={latest} ids={ids} sel={sel} tx={tx} />
            <NatureTile mod={mod('nature')} latest={latest} ids={ids} sel={sel} tx={tx} />
            <WillTile mod={mod('will')} latest={latest} ids={ids} sel={sel} dogs={dogs ?? []} tx={tx} />
          </div>
        )}

        {/* ── päta: čo príde · celé DOG ID na čítanie ── */}
        <footer className="dm-foot">
          <div className="dm-soon">
            {soon.map((m) => (
              <span key={m.key} className="dm-soon-item">
                <BrandIcon name={m.icon} size={PACK_TEXT.lead} tint="dim" />
                <b>{tx(m.i18n, m.labelEN)}</b>
                <span className="pk-pill pk-pill--locked dm-soon-pill">{tx('pack.dogid.soon', 'Soon')}</span>
              </span>
            ))}
          </div>
          {shown.length > 0 && (
            <div className="dm-detail">
              <span className="dm-detail-l">{tx('pack.dogid.detail', 'The whole DOG ID')}</span>
              {shown.map((d) => (
                <Link key={d.id} to={`/pack/dogs/${d.id}`} className="pk-pill pk-pill--tap dm-pill">{d.dog_name ?? '—'}</Link>
              ))}
            </div>
          )}
        </footer>
      </section>
    </PackLayout>
  );
}

// ── dlaždice ─────────────────────────────────────────────────────────────────
type TileProps = { mod: DogIdModule; latest: Latest | null; ids: string[]; sel: string; tx: Tx };

function ctaLabel(p: ReturnType<typeof moduleProgress> | null, tx: Tx, doneLabel?: string): string {
  if (!p) return '';
  if (p.done) return doneLabel ?? tx('pack.dogid.edit', 'Edit');
  return p.filled > 0 ? tx('pack.dogid.continue', 'Continue') : tx('pack.dogid.start', 'Start');
}

/** Hlavička dlaždice — ikonka (aj na 100 %; fajka je len odznak), názov, popis. */
function TileHead({ mod, done, tx }: { mod: DogIdModule; done: boolean; tx: Tx }) {
  return (
    <div className="dm-th">
      <span className="dm-badge" aria-hidden>
        <BrandIcon name={mod.icon} size={PACK_TEXT.h1} tint="gold" />
        {done && <span className="dm-tick"><HandCheck size={PACK_TEXT.micro} /></span>}
      </span>
      <div style={{ minWidth: 0 }}>
        <h2 className="dm-h2">{tx(mod.i18n, mod.labelEN)}</h2>
        <p className="dm-sub">{tx(mod.subI18n, mod.subEN)}</p>
      </div>
    </div>
  );
}

function Meter({ pct }: { pct: number | null }) {
  return (
    <div className="dm-meter">
      <b>{pct === null ? '—' : `${pct} %`}</b>
      <Bar pct={pct ?? 0} />
    </div>
  );
}

function BaseTile({ mod, latest, ids, sel, tx }: TileProps) {
  const p = latest ? moduleProgress(mod, latest, ids) : null;
  const href = `/pack/dogs/quiz/base${sel === 'all' ? '' : `?dog=${sel}`}`;
  const at = latest && p && !p.done ? firstOpenStep(BASE_FLOW.steps, latest, ids) : -1;
  const cur = at >= 0 ? segmentAt(at) : null;
  return (
    <article className="dm-tile dm-tile--base" style={{ '--i': 1 } as CSSProperties}>
      <TileHead mod={mod} done={!!p?.done} tx={tx} />
      <Meter pct={p?.pct ?? null} />
      {/* Sekcie ZÁKLADU — čo je hotové a kde sa pokračuje. Pri nízkom okne zmiznú
          (obsah ustúpi, rezerva nie). */}
      <ul className="dm-secs">
        {BASE_SEGMENTS.map((g) => {
          const filled = latest ? g.section.steps.filter((st) => ids.every((id) => hasValue(latest[id]?.[st.field]))).length : 0;
          const state = filled >= g.count ? 'is-done' : cur?.key === g.key ? 'is-cur' : '';
          return (
            <li key={g.key} className={state}>
              <i aria-hidden />
              <span>{tx(g.section.i18n, g.section.labelEN)}</span>
              <em>{filled} / {g.count}</em>
            </li>
          );
        })}
      </ul>
      {p && (
        <RightGate right="dogid.edit">
          <Link to={href} className={p.done ? 'dm-ghost' : 'dm-cta'}>
            {ctaLabel(p, tx)}
            {cur && <span className="dm-cta-sub">· {tx(cur.section.i18n, cur.section.labelEN)} {at - cur.start + 1}/{cur.count}</span>}
          </Link>
        </RightGate>
      )}
    </article>
  );
}

function NatureTile({ mod, latest, ids, sel, tx }: TileProps) {
  const p = latest ? moduleProgress(mod, latest, ids) : null;
  const dogQ = sel === 'all' ? '' : `dog=${sel}`;
  const href = p?.done ? `/pack/nature?view=result${dogQ ? `&${dogQ}` : ''}` : `/pack/nature${dogQ ? `?${dogQ}` : ''}`;
  return (
    <article className="dm-tile dm-tile--nature" style={{ '--i': 2 } as CSSProperties}>
      <img className="dm-art" src={NATURE_ART} alt="" aria-hidden />
      <div className="dm-tile-body">
        <TileHead mod={mod} done={!!p?.done} tx={tx} />
        <p className="dm-meta">{tx('pack.hub.nature.meta', '22 questions · ~3 minutes')}</p>
        <Meter pct={p?.pct ?? null} />
        {p && (
          <RightGate right="dogid.edit">
            <Link to={href} className="dm-cta">{ctaLabel(p, tx, tx('pack.dogid.result', 'Result'))}</Link>
          </RightGate>
        )}
      </div>
    </article>
  );
}

function WillTile({ mod, latest, ids, sel, dogs, tx }: TileProps & { dogs: ModDog[] }) {
  const p = latest ? moduleProgress(mod, latest, ids) : null;
  // Závet je list JEDNÉHO psa — pri „Všetci" ide na prvého, ktorému chýba.
  const target = sel !== 'all' ? sel
    : (dogs.find((d) => mod.steps.some((s) => !hasValue(latest?.[d.id]?.[s.field])))?.id ?? dogs[0]?.id);
  const who = sel === 'all' && dogs.length > 1 && !p?.done ? dogs.find((d) => d.id === target)?.dog_name : null;
  return (
    <article className="dm-tile dm-tile--will" style={{ '--i': 3 } as CSSProperties}>
      <TileHead mod={mod} done={!!p?.done} tx={tx} />
      <Meter pct={p?.pct ?? null} />
      {p && target && (
        <RightGate right="dogid.edit">
          <Link to={`/pack/dogs/${target}?panel=will`} className={p.done ? 'dm-ghost' : 'dm-cta'}>
            {ctaLabel(p, tx)}
            {who && <span className="dm-cta-sub">· {who}</span>}
          </Link>
        </RightGate>
      )}
    </article>
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
/* ── karta = presne jedna obrazovka ── */
.dm{ display:flex; flex-direction:column; gap:${PACK_SPACE.lg}px; padding:${PACK_SPACE.xl}px;
  height:calc(100dvh - var(--dm-top, 96px) - var(--pack-nav-h, 72px) - var(--pack-nav-bottom, 16px) - ${PACK_SPACE.lg}px);
  min-height:480px;
  /* PackLayout drží pod obsahom rezervu na plávajúci nav (pb-32 / pb-40). Karta už končí NAD
     navom sama, takže rezervu vracia späť — inak by sa stránka posúvala o pár desiatok px. */
  margin-bottom:-${PACK_SPACE.xxxl * 2}px; }
.dm-head{ display:flex; align-items:center; justify-content:space-between; gap:${PACK_SPACE.lg}px; }
.dm-head-l{ display:flex; align-items:center; gap:${PACK_SPACE.md}px; min-width:0; }
.dm-eyebrow{ display:block; font-family:${FONT_UI}; font-weight:500; font-size:${PACK_TEXT.micro}px; letter-spacing:0.26em; text-transform:uppercase; color:${T.inkWarm}; margin-bottom:${PACK_SPACE.xs}px; }
.dm-h1{ margin:0; font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.h1}px; line-height:1.1; letter-spacing:0.14em; text-transform:uppercase; color:${T.inkStrong}; }
.dm-total{ display:grid; grid-template-columns:auto auto; align-items:baseline; gap:${PACK_SPACE.xs}px ${PACK_SPACE.md}px; width:220px; }
.dm-total b{ justify-self:end; font-family:${FONT_UI}; font-size:${PACK_TEXT.h2}px; font-weight:600; color:${T.inkStrong}; }
.dm-total .pk-progress{ grid-column:1/-1; }
.dm-pills{ display:flex; flex-wrap:wrap; gap:${PACK_SPACE.sm}px; }
.dm-pill{ font-family:${FONT_UI}; font-size:${PACK_TEXT.label}px; font-weight:600; letter-spacing:0.02em; text-transform:uppercase; text-decoration:none; }
.dm-pill.on{ ${pickTintCSS(LAPIS.edge, PICK_INK.lapis)} }

/* ── BENTO: ZÁKLAD veľký vľavo, OSOBNOSŤ a ZÁVET vpravo ── */
.dm-bento{ flex:1; min-height:0; display:grid; grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);
  grid-template-rows:minmax(0,1.15fr) minmax(0,1fr); gap:${PACK_SPACE.md}px; }
.dm-tile{ position:relative; overflow:hidden; display:flex; flex-direction:column; gap:${PACK_SPACE.md}px; min-height:0;
  padding:${PACK_SPACE.lg}px; border-radius:${PACK_R.tile}px;
  background:${PACK_BOX.subblock.background}; border:${PACK_BOX.subblock.border}; box-shadow:${PACK_SHADOW.lift};
  animation:dmIn .55s cubic-bezier(.16,1,.3,1) both; animation-delay:calc(var(--i, 0) * 70ms); }
.dm-tile--base{ grid-row:1 / span 2; }
.dm-tile .dm-cta,.dm-tile .dm-ghost{ margin-top:auto; }
.dm-th{ display:flex; align-items:center; gap:${PACK_SPACE.md}px; }
.dm-badge{ position:relative; flex:0 0 auto; display:flex; align-items:center; justify-content:center;
  width:${PACK_SPACE.xxxl}px; height:${PACK_SPACE.xxxl}px; border-radius:${PACK_R.tile}px;
  background:${T.panelGrad}; border:1px solid ${T.cardEdge}; box-shadow:${PACK_SHADOW.lift}; }
.dm-tick{ position:absolute; right:-${PACK_SPACE.xs + 2}px; top:-${PACK_SPACE.xs + 2}px; display:flex; align-items:center; justify-content:center;
  width:${PACK_SPACE.lg + 2}px; height:${PACK_SPACE.lg + 2}px; border-radius:${PACK_R.pill}px; background:#3D7A4E; color:#EAF7ED; border:2px solid ${T.card}; }
.dm-h2{ margin:0; font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.lead}px; letter-spacing:0.14em; text-transform:uppercase; color:${T.inkStrong}; }
.dm-sub{ margin:${PACK_SPACE.xs}px 0 0; font-family:${FONT_UI}; font-size:${PACK_TEXT.label}px; line-height:1.4; color:${T.inkWarm}; }
.dm-meta{ margin:0; font-family:${FONT_UI}; font-size:${PACK_TEXT.micro}px; letter-spacing:0.14em; text-transform:uppercase; color:${T.inkFaint}; }
.dm-meter{ display:grid; grid-template-columns:auto minmax(0,1fr); align-items:center; gap:${PACK_SPACE.md}px; }
.dm-meter b{ font-family:${FONT_UI}; font-size:${PACK_TEXT.h2}px; font-weight:600; color:${T.inkStrong}; min-width:${PACK_SPACE.xxxl + PACK_SPACE.md}px; }

/* sekcie ZÁKLADU — bodka: zelená hotovo · lapis tu pokračuješ · sivá ešte nie */
.dm-secs{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; min-height:0; overflow:hidden; }
.dm-secs li{ display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:${PACK_SPACE.md}px;
  padding:${PACK_SPACE.sm}px 0; border-top:1px dashed ${T.border}; font-family:${FONT_UI}; font-size:${PACK_TEXT.label}px; color:${T.inkWarm}; }
.dm-secs li:first-child{ border-top:0; }
.dm-secs i{ width:${PACK_SPACE.sm}px; height:${PACK_SPACE.sm}px; border-radius:${PACK_R.pill}px; background:rgba(122,90,42,0.22); }
.dm-secs li.is-done i{ background:#3D7A4E; }
.dm-secs li.is-cur{ color:${T.inkStrong}; font-weight:600; }
.dm-secs li.is-cur i{ background:${LAPIS.edge}; }
.dm-secs em{ font-style:normal; font-size:${PACK_TEXT.micro}px; letter-spacing:0.14em; color:${T.inkFaint}; }

/* OSOBNOSŤ — vitráž vpravo, prechádza do papyrusu (súrodé s kartou na /dogs) */
.dm-tile--nature{ padding:0; }
.dm-art{ position:absolute; top:0; right:0; bottom:0; width:40%; height:100%; object-fit:cover; object-position:0 18%; pointer-events:none;
  -webkit-mask-image:linear-gradient(270deg,#000 35%,transparent 100%); mask-image:linear-gradient(270deg,#000 35%,transparent 100%); }
.dm-tile-body{ position:relative; display:flex; flex-direction:column; gap:${PACK_SPACE.md}px; height:100%; padding:${PACK_SPACE.lg}px; padding-right:32%; }
.dm-tile--nature .dm-cta{ align-self:flex-start; }

/* ── tlačidlá ── */
.dm-cta,.dm-ghost{ display:inline-flex; align-items:center; justify-content:center; gap:${PACK_SPACE.sm}px; border-radius:${PACK_R.field}px;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px; font-family:${FONT_TITLE}; font-size:${PACK_TEXT.label}px; font-weight:700; letter-spacing:0.14em;
  text-transform:uppercase; white-space:nowrap; text-decoration:none; transition:transform .2s cubic-bezier(.16,1,.3,1); }
.dm-cta{ background:${LAPIS.grad}; border:1px solid ${GOLD_BTN.edge}; color:${LAPIS.ink}; box-shadow:${LAPIS_BTN_SHADOW}; }
.dm-cta:hover{ transform:translateY(-1px); background:${LAPIS.gradHover}; }
.dm-ghost{ background:transparent; border:1px solid ${T.border}; color:${T.inkWarm}; }
.dm-ghost:hover{ border-color:${T.cardEdge}; color:${T.inkStrong}; }
.dm-cta:active,.dm-ghost:active{ transform:scale(.98); }
.dm-cta-sub{ font-family:${FONT_UI}; font-size:${PACK_TEXT.micro}px; font-weight:500; letter-spacing:0.14em; opacity:.8; }

/* ── päta ── */
.dm-foot{ display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:${PACK_SPACE.md}px;
  padding-top:${PACK_SPACE.md}px; border-top:1px dashed ${T.border}; animation:dmIn .55s cubic-bezier(.16,1,.3,1) both; animation-delay:280ms; }
.dm-soon{ display:flex; flex-wrap:wrap; gap:${PACK_SPACE.md}px; }
.dm-soon-item{ display:inline-flex; align-items:center; gap:${PACK_SPACE.sm}px; opacity:.7; }
.dm-soon-item b{ font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.label}px; letter-spacing:0.14em; text-transform:uppercase; color:${T.inkWarm}; }
.dm-soon-pill{ font-family:${FONT_UI}; font-size:${PACK_TEXT.micro}px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; }
.dm-detail{ display:flex; align-items:center; flex-wrap:wrap; gap:${PACK_SPACE.sm}px; }
.dm-detail-l{ font-family:${FONT_UI}; font-size:${PACK_TEXT.micro}px; letter-spacing:0.14em; text-transform:uppercase; color:${T.inkWarm}; }
.dm-hint{ font-family:${FONT_UI}; font-size:${PACK_TEXT.body}px; color:${T.inkWarm}; }

@keyframes dmIn{ from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:none; } }
@media (prefers-reduced-motion:reduce){ .dm-tile,.dm-foot{ animation:none; } }

/* Nízke okno (Matejovo PC 1477×724): ustúpia popisy, sekcie zhustnú, ikonka sa zmenší — nie vzduch. */
@media (max-height:780px){
  .dm-sub,.dm-meta{ display:none; }
  .dm-secs li{ padding:${PACK_SPACE.xs}px 0; }
  .dm{ gap:${PACK_SPACE.md}px; }
  .dm-tile,.dm-tile-body{ gap:${PACK_SPACE.sm}px; }
  .dm-tile{ padding:${PACK_SPACE.md}px; }
  .dm-tile--nature{ padding:0; }
  .dm-tile-body{ padding:${PACK_SPACE.md}px; padding-right:32%; }
  .dm-badge{ width:${PACK_SPACE.xxl + PACK_SPACE.sm}px; height:${PACK_SPACE.xxl + PACK_SPACE.sm}px; }
}

/* ── mobil: jeden stĺpec, dlaždice nízke ── */
@media (max-width:720px){
  .dm{ padding:${PACK_SPACE.lg}px; gap:${PACK_SPACE.md}px; height:auto; min-height:calc(100dvh - var(--dm-top, 96px) - var(--pack-nav-h, 72px) - var(--pack-nav-bottom, 16px) - ${PACK_SPACE.lg}px); }
  .dm-head{ flex-direction:column; align-items:stretch; gap:${PACK_SPACE.md}px; }
  .dm-total{ width:auto; }
  .dm-bento{ display:flex; flex-direction:column; gap:${PACK_SPACE.sm}px; flex:1; }
  /* Dlaždica na mobile = MRIEŽKA: hore ikonka + názov, dole percento s pruhom a vedľa CTA.
     Tri dlaždice pod sebou sa tak zmestia nad nav aj na 844 px. */
  .dm-tile,.dm-tile-body{ display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:${PACK_SPACE.sm}px ${PACK_SPACE.md}px; }
  .dm-tile{ padding:${PACK_SPACE.md}px; }
  .dm-tile--nature{ display:block; padding:0; }
  .dm-th{ grid-column:1/-1; }
  .dm-tile .dm-cta,.dm-tile .dm-ghost{ margin-top:0; width:auto; min-width:120px; }
  .dm-secs,.dm-sub,.dm-meta{ display:none; }
  .dm-badge{ width:${PACK_SPACE.xxl + PACK_SPACE.sm}px; height:${PACK_SPACE.xxl + PACK_SPACE.sm}px; }
  .dm-meter b{ font-size:${PACK_TEXT.body}px; min-width:${PACK_SPACE.xxxl}px; }
  .dm-tile-body{ padding:${PACK_SPACE.md}px; }
  .dm-tile--nature .dm-th{ padding-right:30%; }
  .dm-cta,.dm-ghost{ padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px; }
  .dm-cta-sub{ display:none; }
  .dm-foot{ gap:${PACK_SPACE.sm}px; }
  .dm-detail-l{ display:none; }
}
`;
