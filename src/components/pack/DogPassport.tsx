// PET PAS — čitateľná časť karty psa (`/pack/dogs/:id`). VÝSTUP.
// Zadanie: plany/zadanie-mypack-petpas-2026-08-06.md §7, nákres: obrazovka C.
//
// TRI PRAVIDLÁ, KTORÉ TENTO SÚBOR VYNUCUJE:
//  1. **Needituje sa tu NIČ.** Každá sekcia má „✎", ktoré deep-linkne do príslušného
//     kroku kvízu predfiltrovaného na tohto psa (`/pack/dogs/quiz/:key?dog=<id>&field=…`).
//     Bez toho by karta bola slepá ulička. Žiadne inline formuláre — tie sem patrili
//     dovtedy, kým bol pes jeden.
//  2. **Pri každom údaji je dátum poslednej aktualizácie.** Bez neho je „32 kg" len
//     tvrdenie: veterinár musí vedieť, či je to spred týždňa alebo spred dvoch rokov.
//  3. **Nič sa nedogeneruje** (DogProfileAttrs LOCK, Matej 2026-08-03). Nevyplnené pole
//     sa NEZOBRAZÍ — nezobrazí sa ani prázdny riadok, ani „—", ani odhad.
//
//  4. **JEDEN VEĽKÝ DOKUMENT** (Matej 6.8.2026: „páči sa mi štýl jedneho veľkého dokumentu
//     = človek uvidí komplet všetko (komplet) a dolu aj hore budu možnosti zazdielat info
//     (vet friend....)"). Majiteľ vidí VŽDY celý pas — žiadne taby, ktoré mu časť skryjú.
//     Pohľady (vet · opatrovateľ · kamoš) nie sú filter tejto stránky, ale **voľba pri
//     zdieľaní**: rozhodujú, čo uvidí PRÍJEMCA, nie čo vidí majiteľ. Preto sú hore aj dole
//     ako tlačidlá „poslať", nie ako prepínač zobrazenia.
//
// `stepInView()` a `views` v katalógu ostávajú — použije ich share render (§8 zadania).
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PACK_THEME, FONT_TITLE, FONT_UI } from './packTheme';
import { PASS_GROUPS, STEP_BY_FIELD, type QuizStep } from './dogQuiz';
import { readLatest, onDogEventsChange, hasValue, readSeries, type LatestValue } from '@/lib/dogEvents';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;

const PASS_CSS = `
.pass-share{ display:inline-flex; align-items:center; gap:7px;
  font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.14em;
  text-transform:uppercase; padding:9px 15px; border-radius:999px; cursor:pointer;
  background:transparent; border:1.5px solid rgba(201,154,63,0.45); color:#7a5a2a; }
.pass-share:hover:not(:disabled){ border-color:#C99A3F; color:#2a1608; }
.pass-share:disabled{ opacity:.5; cursor:default; }
.pass-edit{ font-family:'Space Grotesk',sans-serif; font-size:10px; letter-spacing:.1em;
  text-transform:uppercase; color:rgba(31,26,14,.42); border:1px solid rgba(201,154,63,0.45);
  border-radius:999px; padding:3px 9px; background:transparent; text-decoration:none; white-space:nowrap; }
.pass-edit:hover{ color:#2a1608; border-color:#C99A3F; }
`;

export function DogPassport({ dogId }: { dogId: string }) {
  const t = useT();
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };

  const [latest, setLatest] = useState<Record<string, LatestValue> | null>(null);
  const [weightTrend, setWeightTrend] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => { readLatest(dogId).then((r) => { if (alive) setLatest(r); }); };
    load();
    const off = onDogEventsChange(load);
    return () => { alive = false; off(); };
  }, [dogId]);

  // Trend váhy — jediné pole, kde má priebeh na karte reálnu výpovednú hodnotu.
  // Práve preto je log append-only: z prepísaného stĺpca by sa toto nedalo spočítať.
  useEffect(() => {
    let alive = true;
    readSeries(dogId, 'health.weightKg').then((rows) => {
      if (!alive || rows.length < 2) { setWeightTrend(null); return; }
      const last = Number(rows[rows.length - 1].value);
      const prev = Number(rows[rows.length - 2].value);
      if (!Number.isFinite(last) || !Number.isFinite(prev)) { setWeightTrend(null); return; }
      const diff = last - prev;
      if (Math.abs(diff) < 0.05) { setWeightTrend(null); return; }
      const months = monthsBetween(rows[rows.length - 2].recordedAt, rows[rows.length - 1].recordedAt);
      const span = months >= 1 ? ` / ${months} ${tx('pack.pass.months', 'mo.')}` : '';
      setWeightTrend(`${diff > 0 ? '↗ +' : '↘ −'}${Math.abs(diff).toFixed(1)} kg${span}`);
    });
    return () => { alive = false; };
  }, [dogId]);

  const groups = useMemo(() => {
    if (!latest) return [];
    return PASS_GROUPS.map((g) => {
      // Bez filtra podľa pohľadu — majiteľ vidí komplet. Filtruje sa až pri zdieľaní.
      const rows = g.fields
        .map((f) => ({ step: STEP_BY_FIELD[f], value: latest[f] }))
        .filter((r) => r.step && hasValue(r.value));
      return { group: g, rows };
    }).filter((g) => g.rows.length > 0);
  }, [latest]);

  if (!latest) return null;

  const filledAny = Object.keys(latest).length > 0;

  return (
    <section
      style={{
        background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
        boxShadow: T.cardShadow, padding: '22px 20px', color: T.ink,
      }}
    >
      <style>{PASS_CSS}</style>

      <ShareRow tx={tx} position="top" />

      {!filledAny && (
        <p style={{ fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.6, color: T.inkDim, margin: 0 }}>
          {tx('pack.pass.empty', 'Nothing filled in yet. Every answer from My pack shows up here.')}
        </p>
      )}

      {groups.length === 0 && filledAny && (
        <p style={{ fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.6, color: T.inkDim, margin: 0 }}>
          {tx('pack.pass.empty', 'Nothing filled in yet. Every answer from My pack shows up here.')}
        </p>
      )}

      {groups.map(({ group, rows }) => (
        <div key={group.key} style={{ marginTop: 16 }}>
          <h5
            className="flex items-center justify-between gap-2.5"
            style={{
              fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 11, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: T.accentGold, margin: '0 0 9px',
            }}
          >
            {tx(group.i18n, group.labelEN)}
            {/* ✎ — jediná cesta k editácii. Predfiltrované na TOHTO psa.
                `editHref` = sekcia má vlastný povrch (osobnostný kvíz), kde deep-link
                na jedno pole nedáva zmysel: je to jeden priebeh so scoringom. */}
            <Link
              className="pass-edit"
              to={group.editHref
                ? `${group.editHref}?dog=${dogId}`
                : `/pack/dogs/quiz/${group.editSection}?dog=${dogId}&field=${group.fields[0]}`}
            >
              ✎ {tx('pack.pass.edit', 'edit')}
            </Link>
          </h5>

          <dl
            style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px',
              alignItems: 'baseline', margin: 0,
            }}
          >
            {rows.map(({ step, value }) => (
              <PassRow
                key={step.field}
                step={step}
                value={value!}
                trend={step.field === 'health.weightKg' ? weightTrend : null}
                tx={tx}
              />
            ))}
          </dl>
        </div>
      ))}

      {/* Druhý rovnaký rad dole — pri dlhom dokumente je scroll späť hore réžia navyše.
          Nie je to duplicita obsahu, je to ten istý ovládač na oboch koncoch. */}
      {filledAny && <ShareRow tx={tx} position="bottom" />}
    </section>
  );
}

// ── ZDIEĽANIE ────────────────────────────────────────────────────────────────
// Hore aj dole. Voľba príjemcu = voľba POHĽADU, a ten sa zapečie do odkazu (§2/8 zadania):
// odkaz sa nedá dodatočne prepnúť, chceš iný — vyrobíš nový. Bezpečnostná vlastnosť.
//
// Share sheet sa ešte nestavia (krok 6 poradia), preto sú tlačidlá zatiaľ mŕtve a označené
// „čoskoro" — radšej viditeľný zámer než tlačidlo, ktoré nič neurobí a tvári sa funkčne.
function ShareRow({ tx, position }: { tx: (k: string, f: string) => string; position: 'top' | 'bottom' }) {
  const targets = [
    { key: 'vet', labelEN: 'Vet', i18n: 'pack.pass.share.vet', emoji: '🩺' },
    { key: 'sitter', labelEN: 'Sitter', i18n: 'pack.pass.share.sitter', emoji: '🏠' },
    { key: 'story', labelEN: 'Friend', i18n: 'pack.pass.share.friend', emoji: '✨' },
    { key: 'will', labelEN: 'Will (PDF)', i18n: 'pack.pass.share.will', emoji: '⤓' },
  ];
  return (
    <div style={position === 'top' ? { marginBottom: 6 } : { marginTop: 22 }}>
      <div
        className="text-center"
        style={{
          fontFamily: FONT_UI, fontWeight: 500, fontSize: 10, letterSpacing: '0.26em',
          textTransform: 'uppercase', color: T.accentGold, marginBottom: 9,
        }}
      >
        {tx('pack.pass.shareTitle', 'Share this card')}
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {targets.map((x) => (
          <button key={x.key} type="button" className="pass-share" disabled>
            <span aria-hidden>{x.emoji}</span>
            {tx(x.i18n, x.labelEN)}
          </button>
        ))}
      </div>
      {position === 'top' && (
        <p
          className="text-center"
          style={{ fontFamily: FONT_UI, fontSize: 11, color: T.inkFaint, margin: '9px 0 14px' }}
        >
          {tx('pack.pass.shareNote', 'Each recipient sees only what they need — you pick when you create the link.')}
        </p>
      )}
    </div>
  );
}

function PassRow({
  step, value, trend, tx,
}: {
  step: QuizStep; value: LatestValue; trend: string | null; tx: (k: string, f: string) => string;
}) {
  return (
    <>
      <dt style={{ fontFamily: FONT_UI, fontSize: 11.5, color: T.inkWarm, whiteSpace: 'nowrap' }}>
        {tx(step.rowI18n, step.rowEN)}
      </dt>
      <dd style={{ margin: 0, fontFamily: FONT_UI, fontSize: 13, color: T.inkStrong, fontWeight: 500 }}>
        {renderValue(step, value.value, tx)}
        {trend && (
          <span style={{ fontFamily: FONT_UI, fontSize: 10.5, color: T.growGreen, marginLeft: 6 }}>{trend}</span>
        )}
        {/* Dátum aktualizácie — bez neho je údaj len tvrdenie (§2/6). */}
        <span
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9.5,
            color: T.inkFaint, marginLeft: 7, whiteSpace: 'nowrap',
          }}
        >
          {shortDate(value.recordedAt)}
        </span>
      </dd>
    </>
  );
}

// ── formátovanie hodnôt ──────────────────────────────────────────────────────
function renderValue(step: QuizStep, v: unknown, tx: (k: string, f: string) => string) {
  const label = (val: string) => {
    // Rovnaký kľúčový priestor ako `DogCardFields.tsx` — preklady možností už existujú.
    const fromOpt = tx(`pack.dogCard.opt.${val}`, '');
    if (fromOpt) return fromOpt;
    const fromTag = tx(`pack.dogTag.${val}`, '');
    if (fromTag) return fromTag;
    const known = step.options?.find((o) => o.value === val);
    return known ? known.labelEN : humanize(val);
  };

  if (Array.isArray(v)) {
    return (
      <span className="inline-flex flex-wrap gap-1.5">
        {v.map((x) => (
          <span
            key={String(x)}
            style={{
              fontFamily: FONT_UI, fontSize: 11, padding: '3px 9px', borderRadius: 999,
              background: T.tileBg, border: `1px solid ${T.border}`, color: T.inkStrong,
            }}
          >
            {label(String(x))}
          </span>
        ))}
      </span>
    );
  }

  const s = String(v);
  if (step.kind === 'date') return longDate(s);
  if (step.kind === 'number') return step.unit ? `${s} ${step.unit}` : s;
  if (step.kind === 'single') return label(s);
  return s;
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric', year: 'numeric' });
}

function longDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

function monthsBetween(a: string, b: string): number {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  if (Number.isNaN(d1) || Number.isNaN(d2)) return 0;
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24 * 30.44));
}

function humanize(v: string): string {
  const s = v.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
