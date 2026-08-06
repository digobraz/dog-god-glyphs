// OSOBNOSTNÝ KVÍZ PSA (`/pack/nature`, voliteľne `?dog=<id>`).
// Dataset + scoring: `components/pack/natureQuiz.ts`. Zadanie:
// plany/zadanie-osobnostny-kviz-2026-08-06.md
//
// PREČO SAMOSTATNÝ POVRCH A NIE `dogQuiz.ts`:
// existujúci engine (`/pack/dogs/quiz/:key`) je field-collector — otázka = pole na
// karte psa, žiadne váhy. Tento kvíz potrebuje SCORING a výsledok. Výsledok sa ale
// zapíše ako polia EXISTUJÚCEJ psej karty (`nature.*`), takže nevzniká druhý profil.
//
// ⚠️ Routa je `/pack/nature`, NIE `/pack/dogs/quiz/nature` — tú by zachytil
// `:key` v starom engine — a ani `/pack/dogs/nature`, ktorú by zjedol `:id`.
//
// TRI VECI, KTORÉ SA TU NESMÚ ROZBIŤ:
//  1. Titul výsledku je v GENITÍVE („The Defender of Water") — `natureTitleEN()`.
//     Adjektívum by v SK dalo „Drevený Obranca“ = nemotorný obranca.
//  2. Zvláštna úloha sa NIKDY nevykreslí ako samostatný chip — vždy s prefixom
//     „Special role“. Bez toho sa `The Loner` zrazí s tagom povahy `loner`
//     („Samotár“), ktorý na psej karte už existuje.
//  3. Pätička s attribution je POVINNÁ na obrazovke výsledku aj na intre.
//     Zdroj (Wolf and Dog Development Centre) sa priznáva a odkazuje.
//
// Glyfy (5 elementov + 9 úloh) NEEXISTUJÚ — výsledok je zatiaľ textový, miesto pre
// glyf je pripravené v `ResultHead`.
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, ChevronLeft, RotateCcw, Check } from 'lucide-react';
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import {
  NATURE_QUESTIONS, NATURE_ELEMENTS, NATURE_ROLES, NATURE_SPECIALS,
  SPECIAL_KEYS, NATURE_ATTRIBUTION, scoreNature, natureTitleEN,
  type SpecialAnswer, type SpecialKey, type NatureResult,
} from '@/components/pack/natureQuiz';
import { appendDogEvents } from '@/lib/dogEvents';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;

const NQ_CSS = `
.nq-gold{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:13px 26px;
  background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border:1px solid rgba(250,244,236,0.30); border-radius:8px; color:#000;
  font-family:'Cinzel',serif; font-size:11px; font-weight:800;
  letter-spacing:.12em; text-transform:uppercase; cursor:pointer; white-space:nowrap;
  box-shadow:0 0 28px rgba(230,158,26,0.34), inset 0 1px 0 rgba(255,255,255,0.3);
  transition: transform .2s, box-shadow .22s;
}
.nq-gold:hover{ transform:scale(1.04); }
.nq-gold:disabled{ opacity:.45; cursor:default; transform:none; box-shadow:none; }
.nq-ghost{
  display:inline-flex; align-items:center; justify-content:center; gap:7px;
  padding:11px 20px; background:transparent;
  border:1.5px solid rgba(201,154,63,0.45); border-radius:8px; color:#7a5a2a;
  font-family:'Cinzel',serif; font-size:10.5px; font-weight:700;
  letter-spacing:.12em; text-transform:uppercase; cursor:pointer;
}
.nq-ghost:hover{ border-color:#C99A3F; color:#2a1608; }
/* Odpoveď = dlaždica na celú šírku, nie pill — otázky sú dlhé vety. */
.nq-opt{
  display:block; width:100%; text-align:left; cursor:pointer;
  padding:13px 15px; border-radius:10px;
  background:rgba(201,154,63,0.06); border:1px solid rgba(201,154,63,0.45);
  font-family:'Space Grotesk',sans-serif; font-size:13.5px; line-height:1.45;
  color:#2a1608; transition:border-color .18s, background .18s, transform .12s;
}
.nq-opt:hover{ border-color:#C99A3F; background:rgba(201,154,63,0.12); }
.nq-opt.is-on{
  border-color:#C99A3F; background:linear-gradient(135deg,rgba(245,199,61,0.22),rgba(230,158,26,0.14));
  box-shadow:inset 0 0 0 1px rgba(201,154,63,0.5);
}
.nq-tri{
  flex:1 1 0; cursor:pointer; padding:11px 8px; border-radius:10px;
  background:rgba(201,154,63,0.06); border:1px solid rgba(201,154,63,0.45);
  font-family:'Space Grotesk',sans-serif; font-size:12.5px; font-weight:500; color:#2a1608;
}
.nq-tri.is-on{ border-color:#C99A3F; background:linear-gradient(135deg,rgba(245,199,61,0.22),rgba(230,158,26,0.14)); }
`;

/* ── malé stavebné prvky (bledý blok podľa locku z /entry) ─────────────────── */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_UI, fontSize: 10, fontWeight: 500, letterSpacing: '.26em',
      textTransform: 'uppercase', color: T.cardEdge, marginBottom: 8,
    }}>{children}</div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
      boxShadow: T.cardShadow, padding: '20px 18px', ...style,
    }}>{children}</div>
  );
}

function Rule() {
  return <div style={{ height: 2, background: T.rule, margin: '16px 0', border: 0 }} />;
}

function Tile({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: T.tileBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 14px',
    }}>{children}</div>
  );
}

// POZOR: pätička stojí MIMO papyrusovej karty, teda na čiernom pozadí. `T.inkFaint`
// je tmavý ink pre papyrus — na tmavom je nečitateľný. Odhalil to screenshot, nie tsc:
// typová kontrola prejde, text je len neviditeľný. Na tmavých vrstvách sa berú
// `onDark*` tokeny, nie `ink*`.
function Attribution({ tx }: { tx: (k: string, f: string) => string }) {
  return (
    <p style={{
      fontFamily: FONT_UI, fontSize: 10.5, lineHeight: 1.55, color: 'rgba(245,240,228,0.55)',
      marginTop: 18, textAlign: 'center',
    }}>
      {tx(NATURE_ATTRIBUTION.i18n, NATURE_ATTRIBUTION.textEN)}
      {NATURE_ATTRIBUTION.url ? (
        <>
          {' '}
          <a href={NATURE_ATTRIBUTION.url} target="_blank" rel="noreferrer"
             style={{ color: T.cardEdge, textDecoration: 'underline' }}>
            {NATURE_ATTRIBUTION.sourceName}
          </a>
        </>
      ) : null}
    </p>
  );
}

/* ── škrupina (rovnaký vzor ako PackDogQuiz — fullscreen route) ───────────── */

function Shell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="min-h-[100dvh] relative" style={{ backgroundColor: T.pageBg, color: T.onDark }}>
      <div aria-hidden style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100lvh',
        backgroundImage: "url('/images/bg-dark.webp')", backgroundSize: 'cover',
        backgroundPosition: 'center', filter: 'blur(3px)', zIndex: 0, pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100lvh',
        background: 'radial-gradient(ellipse at center, rgba(5,5,5,0.25) 0%, rgba(5,5,5,0.45) 60%, rgba(5,5,5,0.6) 100%)',
        zIndex: 0, pointerEvents: 'none',
      }} />
      <style>{NQ_CSS}</style>
      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 sm:px-6 pb-24"
           style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 22px)' }}>
        <div className="flex justify-end" style={{ marginBottom: 12 }}>
          <button type="button" onClick={onClose} aria-label="Close" style={{
            width: 36, height: 36, borderRadius: 999, cursor: 'pointer',
            background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,154,63,0.4)',
            color: '#E9D9B8', display: 'grid', placeItems: 'center',
          }}><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── výsledok ─────────────────────────────────────────────────────────────── */

function ResultHead({ r, tx }: { r: NatureResult; tx: (k: string, f: string) => string }) {
  const role = NATURE_ROLES[r.role];
  const el = NATURE_ELEMENTS[r.element];
  return (
    <div style={{ textAlign: 'center' }}>
      {/* miesto pre glyf — 14 glyfov (5 elementov + 9 úloh) sa ešte nevyrobilo */}
      <Eyebrow>{tx('pack.nature.result.eyebrow', 'Your dog is')}</Eyebrow>
      {/* DVE OSI SA NEZLUČUJÚ do jednej frázy — sú to dva samostatné výsledky
          oddelené lomkou (Matej: „nedavajme to dokopy dajme defender/metal"). */}
      <h1 style={{
        fontFamily: FONT_TITLE, fontWeight: 700, textTransform: 'uppercase',
        fontSize: 'clamp(1.35rem, 5.4vw, 2rem)', lineHeight: 1.15,
        letterSpacing: '.02em', color: T.inkStrong,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, flexWrap: 'wrap',
      }}>
        <span>{tx(role.i18n, role.labelEN)}</span>
        <span aria-hidden style={{ color: T.cardEdge, fontWeight: 400 }}>/</span>
        <span>{tx(el.i18n, el.labelEN)}</span>
      </h1>
      <p style={{
        fontFamily: FONT_UI, fontSize: 13, color: T.inkWarm, marginTop: 10, lineHeight: 1.5,
      }}>{tx(`${role.i18n}.function`, role.functionEN)}</p>
    </div>
  );
}

function ResultBody({ r, tx }: { r: NatureResult; tx: (k: string, f: string) => string }) {
  const role = NATURE_ROLES[r.role];
  const el = NATURE_ELEMENTS[r.element];
  const second = r.roleSecond ? NATURE_ROLES[r.roleSecond] : null;
  const elSecond = r.elementSecond ? NATURE_ELEMENTS[r.elementSecond] : null;

  return (
    <>
      {/* ÚLOHA — a v nej „najčastejšie nepochopenie": veta, ktorú majiteľ o svojom
          psovi celý život slýcha, vyvrátená. To je emočný zásah celého kvízu. */}
      <Card style={{ marginTop: 16 }}>
        <Eyebrow>{tx('pack.nature.result.roleLabel', 'Role in the pack')}</Eyebrow>
        <h2 style={{
          fontFamily: FONT_TITLE, fontWeight: 700, textTransform: 'uppercase',
          fontSize: 16, color: T.inkStrong,
        }}>{tx(role.i18n, role.labelEN)}</h2>
        <p style={{ fontFamily: FONT_UI, fontSize: 11, color: T.inkFaint, marginTop: 4 }}>
          {tx('pack.nature.result.origin', 'In the source research')}: {role.originEN}
        </p>

        <ul style={{ marginTop: 12, display: 'grid', gap: 7 }}>
          {role.signsEN.map((s, i) => (
            <li key={i} style={{
              fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.5, color: T.inkStrong,
              paddingLeft: 14, position: 'relative',
            }}>
              <span style={{ position: 'absolute', left: 0, color: T.cardEdge }}>·</span>
              {tx(`${role.i18n}.sign${i}`, s)}
            </li>
          ))}
        </ul>

        <Rule />
        <Tile>
          <div style={{
            fontFamily: FONT_UI, fontSize: 11.5, color: T.inkWarm, marginBottom: 6,
            fontStyle: 'italic',
          }}>„{tx(`${role.i18n}.myth`, role.mythEN)}"</div>
          <div style={{ fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.5, color: T.inkStrong }}>
            {tx(`${role.i18n}.mythAnswer`, role.mythAnswerEN)}
          </div>
        </Tile>

        <div style={{ marginTop: 12, fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.5, color: T.inkWarm }}>
          <strong style={{ color: T.inkStrong }}>{tx('pack.nature.result.pressure', 'Under pressure')}: </strong>
          {tx(`${role.i18n}.pressure`, role.pressureEN)}
        </div>

        {second && (
          <p style={{ fontFamily: FONT_UI, fontSize: 12, color: T.inkWarm, marginTop: 12 }}>
            {tx('pack.nature.result.alsoRole', 'They also carry a strong second role')}:{' '}
            <strong style={{ color: T.inkStrong }}>{tx(second.i18n, second.labelEN)}</strong>
          </p>
        )}
      </Card>

      {/* ELEMENT — telo a konštitúcia. `watch` NIE JE diagnóza. */}
      <Card style={{ marginTop: 14 }}>
        <Eyebrow>{tx('pack.nature.result.elementLabel', 'Constitution')}</Eyebrow>
        <h2 style={{
          fontFamily: FONT_TITLE, fontWeight: 700, textTransform: 'uppercase',
          fontSize: 16, color: T.inkStrong,
        }}>{tx(el.i18n, el.labelEN)}</h2>
        <p style={{ fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.5, color: T.inkStrong, marginTop: 8 }}>
          {tx(`${el.i18n}.summary`, el.summaryEN)}
        </p>
        <Rule />
        <div style={{ display: 'grid', gap: 10 }}>
          <Tile>
            <div style={{ fontFamily: FONT_UI, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: T.cardEdge, marginBottom: 5 }}>
              {tx('pack.nature.result.body', 'Body')}
            </div>
            <div style={{ fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.5, color: T.inkStrong }}>
              {tx(`${el.i18n}.body`, el.bodyEN)}
            </div>
          </Tile>
          <Tile>
            <div style={{ fontFamily: FONT_UI, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: T.cardEdge, marginBottom: 5 }}>
              {tx('pack.nature.result.watch', 'Worth keeping an eye on')}
            </div>
            <div style={{ fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.5, color: T.inkStrong }}>
              {tx(`${el.i18n}.watch`, el.watchEN)}
            </div>
            <div style={{ fontFamily: FONT_UI, fontSize: 10.5, color: T.inkFaint, marginTop: 7 }}>
              {tx('pack.nature.result.notDiagnosis', 'This is a conversation to have with your vet — not a diagnosis.')}
            </div>
          </Tile>
        </div>
        {elSecond && (
          <p style={{ fontFamily: FONT_UI, fontSize: 12, color: T.inkWarm, marginTop: 12 }}>
            {tx('pack.nature.result.alsoElement', 'There is a strong second element')}:{' '}
            <strong style={{ color: T.inkStrong }}>{tx(elSecond.i18n, elSecond.labelEN)}</strong>
          </p>
        )}
      </Card>

      {/* ZVLÁŠTNE ÚLOHY — vždy s prefixom „Special role", nikdy ako samotný chip
          (inak sa `The Loner` zrazí s tagom povahy „Samotár"). */}
      {r.specials.length > 0 && (
        <Card style={{ marginTop: 14 }}>
          <Eyebrow>{tx('pack.nature.result.specialLabel', 'Special roles')}</Eyebrow>
          <div style={{ display: 'grid', gap: 12 }}>
            {r.specials.map((k) => {
              const s = NATURE_SPECIALS[k];
              return (
                <Tile key={k}>
                  <div style={{ fontFamily: FONT_UI, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: T.cardEdge, marginBottom: 5 }}>
                    {tx('pack.nature.result.specialPrefix', 'Special role')}
                  </div>
                  <div style={{ fontFamily: FONT_TITLE, fontWeight: 700, textTransform: 'uppercase', fontSize: 14, color: T.inkStrong }}>
                    {tx(s.i18n, s.labelEN)}
                  </div>
                  <div style={{ fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.5, color: T.inkStrong, marginTop: 6 }}>
                    {tx(`${s.i18n}.desc`, s.descEN)}
                  </div>
                </Tile>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}

/* ── stránka ──────────────────────────────────────────────────────────────── */

type Phase = 'intro' | 'core' | 'special' | 'result';

export default function PackNatureQuiz() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const t = useT();
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };

  const dogId = params.get('dog');

  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [specials, setSpecials] = useState<Partial<Record<SpecialKey, SpecialAnswer>>>({});
  const [saved, setSaved] = useState(false);

  const total = NATURE_QUESTIONS.length + SPECIAL_KEYS.length;
  const done = Object.keys(answers).length + Object.keys(specials).length;

  const result = useMemo(
    () => (phase === 'result' ? scoreNature(answers, specials) : null),
    [phase, answers, specials],
  );

  const finish = async (r: NatureResult) => {
    // Výsledok ide na psiu kartu ako polia — nie do druhého profilu. Bez psa
    // v URL sa kvíz dá prejsť aj tak (verejný náhľad), len sa nič nezapíše.
    if (!dogId || saved) return;
    try {
      await appendDogEvents([
        { dogId, field: 'nature.element', value: r.element, source: 'quiz' },
        { dogId, field: 'nature.role', value: r.role, source: 'quiz' },
        { dogId, field: 'nature.specials', value: r.specials, source: 'quiz' },
      ]);
      setSaved(true);
    } catch {
      /* zápis je bonus — výsledok sa ukáže aj keď zlyhá */
    }
  };

  const pick = (qid: string, oid: string) => {
    setAnswers((p) => ({ ...p, [qid]: oid }));
    if (idx < NATURE_QUESTIONS.length - 1) setTimeout(() => setIdx((i) => i + 1), 180);
    else setTimeout(() => setPhase('special'), 180);
  };

  const pickSpecial = (k: SpecialKey, a: SpecialAnswer) => {
    const next = { ...specials, [k]: a };
    setSpecials(next);
    if (Object.keys(next).length === SPECIAL_KEYS.length) {
      const r = scoreNature(answers, next);
      setPhase('result');
      void finish(r);
    }
  };

  const restart = () => {
    setAnswers({}); setSpecials({}); setIdx(0); setSaved(false); setPhase('intro');
  };

  /* — intro — */
  if (phase === 'intro') {
    return (
      <Shell onClose={() => navigate('/pack')}>
        <Card>
          <Eyebrow>{tx('pack.nature.intro.eyebrow', 'Two questions in one')}</Eyebrow>
          <h1 style={{
            fontFamily: FONT_TITLE, fontWeight: 700, textTransform: 'uppercase',
            fontSize: 'clamp(1.25rem, 5vw, 1.7rem)', lineHeight: 1.2, color: T.inkStrong,
          }}>{tx('pack.nature.intro.title', 'Who is your dog?')}</h1>
          <p style={{ fontFamily: FONT_UI, fontSize: 13.5, lineHeight: 1.6, color: T.inkStrong, marginTop: 12 }}>
            {tx('pack.nature.intro.body',
              'Eighteen questions give you two answers at once: what your dog is made of, and what job they do for your family. Nobody taught them that job — they were born into it.')}
          </p>
          <Rule />
          <div style={{ display: 'grid', gap: 10 }}>
            <Tile>
              <div style={{ fontFamily: FONT_TITLE, fontWeight: 700, textTransform: 'uppercase', fontSize: 12, color: T.inkStrong }}>
                {tx('pack.nature.intro.axis1', 'Constitution')}
              </div>
              <div style={{ fontFamily: FONT_UI, fontSize: 12.5, color: T.inkWarm, marginTop: 4 }}>
                {tx('pack.nature.intro.axis1sub', 'Body, temperament, what to keep an eye on — and what to feed.')}
              </div>
            </Tile>
            <Tile>
              <div style={{ fontFamily: FONT_TITLE, fontWeight: 700, textTransform: 'uppercase', fontSize: 12, color: T.inkStrong }}>
                {tx('pack.nature.intro.axis2', 'Role in the pack')}
              </div>
              <div style={{ fontFamily: FONT_UI, fontSize: 12.5, color: T.inkWarm, marginTop: 4 }}>
                {tx('pack.nature.intro.axis2sub', 'What your dog is trying to do for your family — and what everyone gets wrong about it.')}
              </div>
            </Tile>
          </div>
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <button type="button" className="nq-gold" onClick={() => setPhase('core')}>
              {tx('pack.nature.intro.cta', 'Start')}
            </button>
          </div>
        </Card>
        <Attribution tx={tx} />
      </Shell>
    );
  }

  /* — 14 jadrových otázok — */
  if (phase === 'core') {
    const q = NATURE_QUESTIONS[idx];
    const picked = answers[q.id];
    return (
      <Shell onClose={() => navigate('/pack')}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: FONT_UI, fontSize: 10.5, letterSpacing: '.2em', textTransform: 'uppercase', color: T.cardEdge }}>
              {idx + 1} / {total}
            </span>
            {idx > 0 && (
              <button type="button" className="nq-ghost" onClick={() => setIdx((i) => i - 1)}>
                <ChevronLeft className="h-3.5 w-3.5" /> {tx('pack.nature.back', 'Back')}
              </button>
            )}
          </div>
          {/* progres — zlatá niť, nie farebný bar */}
          <div style={{ height: 2, background: 'rgba(201,154,63,0.2)', borderRadius: 2, marginBottom: 16 }}>
            <div style={{
              height: '100%', width: `${(done / total) * 100}%`, borderRadius: 2,
              background: 'linear-gradient(90deg,#F5C73D,#E69E1A)', transition: 'width .25s',
            }} />
          </div>

          <h2 style={{
            fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 'clamp(1.05rem,4vw,1.3rem)',
            lineHeight: 1.3, color: T.inkStrong,
          }}>{tx(q.i18n, q.labelEN)}</h2>

          <div style={{ display: 'grid', gap: 9, marginTop: 16 }}>
            {q.options.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`nq-opt${picked === o.id ? ' is-on' : ''}`}
                onClick={() => pick(q.id, o.id)}
              >
                {tx(o.i18n, o.labelEN)}
              </button>
            ))}
          </div>
        </Card>
        <Attribution tx={tx} />
      </Shell>
    );
  }

  /* — 4 doplnkové na zvláštne úlohy — */
  if (phase === 'special') {
    return (
      <Shell onClose={() => navigate('/pack')}>
        <Card>
          <Eyebrow>{tx('pack.nature.special.eyebrow', 'Four more — looking for special roles')}</Eyebrow>
          <p style={{ fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.55, color: T.inkWarm, marginBottom: 14 }}>
            {tx('pack.nature.special.body',
              'These four roles sit on top of the main one. Most dogs carry none — that is normal.')}
          </p>
          <div style={{ display: 'grid', gap: 14 }}>
            {SPECIAL_KEYS.map((k) => {
              const s = NATURE_SPECIALS[k];
              const cur = specials[k];
              return (
                <div key={k}>
                  <div style={{ fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.45, color: T.inkStrong, marginBottom: 8 }}>
                    {tx(s.qI18n, s.questionEN)}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['yes', 'sometimes', 'no'] as SpecialAnswer[]).map((a) => (
                      <button
                        key={a}
                        type="button"
                        className={`nq-tri${cur === a ? ' is-on' : ''}`}
                        onClick={() => pickSpecial(k, a)}
                      >
                        {tx(`pack.nature.ans.${a}`, a === 'yes' ? 'Yes' : a === 'no' ? 'No' : 'Sometimes')}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <button
              type="button"
              className="nq-gold"
              disabled={Object.keys(specials).length < SPECIAL_KEYS.length}
              onClick={() => { const r = scoreNature(answers, specials); setPhase('result'); void finish(r); }}
            >
              {tx('pack.nature.special.cta', 'Show the result')}
            </button>
          </div>
        </Card>
        <Attribution tx={tx} />
      </Shell>
    );
  }

  /* — výsledok — */
  if (!result) return null;
  return (
    <Shell onClose={() => navigate('/pack')}>
      <Card>
        <ResultHead r={result} tx={tx} />
      </Card>
      <ResultBody r={result} tx={tx} />
      <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="nq-ghost" onClick={restart}>
          <RotateCcw className="h-3.5 w-3.5" /> {tx('pack.nature.result.again', 'Take it again')}
        </button>
        <button type="button" className="nq-gold" onClick={() => navigate('/pack')}>
          {tx('pack.nature.result.done', 'Done')}
        </button>
      </div>
      {dogId && saved && (
        <p style={{ fontFamily: FONT_UI, fontSize: 11, color: T.inkFaint, marginTop: 12, textAlign: 'center' }}>
          <Check className="h-3 w-3 inline" /> {tx('pack.nature.result.saved', 'Saved to your dog’s card')}
        </p>
      )}
      <Attribution tx={tx} />
    </Shell>
  );
}
