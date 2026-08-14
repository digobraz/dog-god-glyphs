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
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, ChevronLeft, RotateCcw, Check } from 'lucide-react';
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import {
  NATURE_QUESTIONS, NATURE_ELEMENTS, NATURE_ROLES, NATURE_SPECIALS,
  SPECIAL_KEYS, NATURE_ATTRIBUTION, scoreNature, natureTitleEN,
  type SpecialAnswer, type SpecialKey, type NatureResult,
} from '@/components/pack/natureQuiz';
import { appendDogEvents, type DogEventInput } from '@/lib/dogEvents';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const NAME_FONT = "'Cinzel Decorative', 'Cinzel', serif";

interface QuizDog { id: string; dog_name: string | null; cloudinary_main_url: string | null }

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

/* ── VIACPSÍ VÝBER: STĹPEC NA PSA, NIE BLOK NA PSA ────────────────────────────
   Matej 14.8.2026: „chcem zabrániť multiplikovaniu textových možností, chcem verziu
   aby zostala jedna možnosť ale s multivýberom pre každého psa." Riadok na psa (vzor
   z DOG ID kvízu) zopakuje aj to, čo sa nemení — pri troch psoch je z 18 otázok stena.
   Tu text stojí RAZ a pribúdajú len krúžky vpravo. Zvisle sa číta jeden pes, vodorovne
   sa porovnáva svorka.
   Povahový kvíz to znesie preto, že každá otázka má práve JEDNU odpoveď na psa —
   krúžok sa správa ako prepínač. Na polia s viacnásobným výberom (chips v DOG ID kvíze,
   kde pes má osem povelov + vlastný text) tento vzor NESADNE. */
/* Hlavička je len tak široká ako stĺpce, ktoré popisuje — nie pás cez celú kartu.
   Roztiahnutá na plnú šírku z nej robí veľký prázdny biely blok nad možnosťami. */
.nq-head{
  position:sticky; top:0; z-index:3;
  width:fit-content; margin:10px 0 8px auto;
  display:flex; align-items:flex-end; justify-content:flex-end; gap:10px;
  padding:6px 2px 8px; background:#FBF5E6; border-radius:10px;
}
.nq-hcell{ width:54px; display:flex; flex-direction:column; align-items:center; gap:5px; }
/* Meno psa = Cinzel Decorative (brand lock), nie Cinzel a nie Grotesk.
   ⚠️ overflow-wrap:anywhere tu NEPATRÍ — pri 46px stĺpci rozlomil KLEOPATRA na
   „KLEOPA / TRA" a HEKTHOR na „HEKTH / OR". Meno je jeden riadok; čo sa nezmestí,
   odreže sa trojbodkou a celé ostáva v atribúte title.
   ⚠️ ŽIADNY SPÄTNÝ APOSTROF v tomto bloku — je to JS template literal a zhodí build
   (tsc prejde, padne až Vite). To isté pravidlo ako HUB_CSS v PackDogs.tsx. */
.nq-hname{
  font-family:'Cinzel Decorative','Cinzel',serif; font-weight:700; font-size:8.5px;
  letter-spacing:.02em; text-transform:uppercase; color:#2a1608; text-align:center;
  line-height:1.1; max-width:62px;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.nq-optrow{ display:flex; align-items:center; gap:10px; }
/* Klik na SAMOTNÚ VETU = tá istá odpoveď pre celú svorku. Nahrádza to checkbox
   „rovnako pre všetkých" z DOG ID kvízu — tu je prirodzenejší, lebo cieľ je vidieť. */
.nq-optlbl{
  flex:1 1 auto; text-align:left; cursor:pointer; padding:13px 15px; border-radius:10px;
  background:rgba(201,154,63,0.06); border:1px solid rgba(201,154,63,0.45);
  font-family:'Space Grotesk',sans-serif; font-size:13.5px; line-height:1.45; color:#2a1608;
  transition:border-color .18s, background .18s;
}
.nq-optlbl:hover{ border-color:#C99A3F; background:rgba(201,154,63,0.12); }
.nq-dogs{ display:flex; gap:10px; flex:0 0 auto; }
/* Nevybraté = odfarbené a stlmené, ale NIE tak, aby to čítalo ako vypnuté;
   vybraté = plná farba + zlatý prstenec. 46px je nad hranicou 36px na dotyk. */
.nq-dog{
  width:54px; height:54px; border-radius:999px; cursor:pointer; padding:0; overflow:hidden;
  border:2px solid rgba(201,154,63,0.35); background:#EDDCBD;
  filter:grayscale(1); opacity:.45;
  transition:opacity .18s, filter .18s, border-color .18s, box-shadow .18s;
}
.nq-dog img{ width:100%; height:100%; object-fit:cover; display:block; }
.nq-dog:hover{ opacity:.8; filter:grayscale(.35); }
.nq-dog.is-on{
  opacity:1; filter:none; border-color:#C99A3F; box-shadow:0 0 0 3px rgba(201,154,63,0.22);
}
.nq-dogfb{
  display:grid; place-items:center; width:100%; height:100%;
  font-family:'Cinzel',serif; font-weight:700; font-size:15px; color:#7a5a2a;
}
/* Pod 500px sa veta a dva krúžky do riadku nezmestia — rad ide POD text.
   Ostáva vpravo, takže hlavička sedí nad krúžkami aj tu. */
@media (max-width:500px){
  .nq-optrow{ flex-wrap:wrap; }
  .nq-dogs{ width:100%; justify-content:flex-end; }
}
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

/* ── stĺpce psov ──────────────────────────────────────────────────────────── */

/** Prilepená hlavička: meno + fotka nad každým stĺpcom. Bez nej po tretej otázke
 *  nevieš, ktorý krúžok je čí — a v časti so zvláštnymi úlohami je 12 riadkov pod sebou. */
function DogHead({ dogs }: { dogs: QuizDog[] }) {
  return (
    <div className="nq-head">
      {dogs.map((d) => (
        <div key={d.id} className="nq-hcell">
          <div className="nq-hname" title={d.dog_name ?? ''}>{(d.dog_name || '?').toUpperCase()}</div>
          <DogFace dog={d} />
        </div>
      ))}
    </div>
  );
}

/** Fotka psa v krúžku. Bez fotky ostáva iniciála — prázdny krúžok by v hlavičke
 *  vyzeral ako chýbajúci stĺpec. */
function DogFace({ dog, on = true }: { dog: QuizDog; on?: boolean }) {
  const initial = (dog.dog_name || '?').trim().charAt(0).toUpperCase();
  return (
    <span
      aria-hidden
      style={{
        width: 34, height: 34, borderRadius: 999, overflow: 'hidden', display: 'block',
        border: `1.5px solid ${T.border}`, background: T.bg, opacity: on ? 1 : 0.5,
      }}
    >
      {dog.cloudinary_main_url
        ? <img src={dog.cloudinary_main_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <span className="nq-dogfb" style={{ fontSize: 13 }}>{initial}</span>}
    </span>
  );
}

/**
 * Jedna možnosť = JEDEN riadok textu + krúžok na psa.
 *
 * `onPickAll` (klik na vetu) je zámerne na tom istom prvku ako text: pri viacerých
 * psoch je „rovnako pre všetkých" najčastejší úkon a nemá zmysel naň robiť ďalší
 * ovládač. Pri jednom psovi sa krúžky nekreslia vôbec — 18× fotka toho istého psa
 * nič nehovorí — a riadok sa správa presne ako pôvodné tlačidlo možnosti.
 */
function OptionRow({
  label, dogs, solo, isOn, onPickDog, onPickAll,
}: {
  label: string;
  dogs: QuizDog[];
  solo: boolean;
  isOn: (dogId: string) => boolean;
  onPickDog: (dogId: string) => void;
  onPickAll: () => void;
}) {
  if (solo) {
    return (
      <button type="button" className={`nq-opt${isOn(dogs[0]?.id ?? '') ? ' is-on' : ''}`} onClick={onPickAll}>
        {label}
      </button>
    );
  }
  return (
    <div className="nq-optrow">
      <button type="button" className="nq-optlbl" onClick={onPickAll}>{label}</button>
      <div className="nq-dogs">
        {dogs.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`nq-dog${isOn(d.id) ? ' is-on' : ''}`}
            aria-label={`${d.dog_name ?? ''}: ${label}`}
            aria-pressed={isOn(d.id)}
            onClick={() => onPickDog(d.id)}
          >
            {d.cloudinary_main_url
              ? <img src={d.cloudinary_main_url} alt="" />
              : <span className="nq-dogfb">{(d.dog_name || '?').trim().charAt(0).toUpperCase()}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Krúžok a veta robia dve rôzne veci — bez jednej vety to nikto neuhádne. */
function PackHint({ tx }: { tx: (k: string, f: string) => string }) {
  return (
    <p style={{
      fontFamily: FONT_UI, fontSize: 11.5, lineHeight: 1.5, color: T.inkWarm,
      margin: '10px 0 0',
    }}>
      {tx('pack.nature.pickHint', 'Tap a dog to answer for them — tap the sentence to answer for the whole pack.')}
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

  // `?dog=` je FILTER, nie podmienka (rovnako ako v DOG ID kvíze). Predtým to bol
  // jediný zdroj cieľového psa — a `PackDogs` ho pri viacerých psoch zámerne
  // neposielal, takže `dogId` bolo `null`, zápis sa ticho preskočil a človek prešiel
  // 18 otázok do prázdna. Odteraz sa svorka načíta a parameter ju len zúži.
  const onlyDogId = params.get('dog');

  const [dogs, setDogs] = useState<QuizDog[] | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  /** dogId → qid → optionId */
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  /** dogId → zvláštna úloha → yes/sometimes/no */
  const [specials, setSpecials] = useState<Record<string, Partial<Record<SpecialKey, SpecialAnswer>>>>({});
  const [saved, setSaved] = useState(false);
  // Zrkadlo stavu pre kliky, ktoré prídu skôr, než React stihne prekresliť.
  const answersRef = useRef<Record<string, Record<string, string>>>({});
  const specialsRef = useRef<Record<string, Partial<Record<SpecialKey, SpecialAnswer>>>>({});

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

  const list = useMemo(() => dogs ?? [], [dogs]);
  const solo = list.length === 1;

  const total = NATURE_QUESTIONS.length + SPECIAL_KEYS.length;
  // Otázka je hotová, až keď na ňu odpovedali VŠETCI psy — inak by prúžok sľuboval
  // hotovo pri svorke, kde je vyplnený jeden pes z troch.
  const done = useMemo(() => {
    if (list.length === 0) return 0;
    const core = NATURE_QUESTIONS.filter((q) => list.every((d) => answers[d.id]?.[q.id])).length;
    const spec = SPECIAL_KEYS.filter((k) => list.every((d) => specials[d.id]?.[k])).length;
    return core + spec;
  }, [list, answers, specials]);

  const allSpecialsDone = list.length > 0
    && list.every((d) => SPECIAL_KEYS.every((k) => specials[d.id]?.[k]));

  /** Jeden výsledok na psa — `scoreNature` je čistá funkcia, takže sa len zavolá N×. */
  const results = useMemo(() => {
    if (phase !== 'result') return [];
    return list.map((d) => ({ dog: d, r: scoreNature(answers[d.id] ?? {}, specials[d.id] ?? {}) }));
  }, [phase, list, answers, specials]);

  const finish = async (rs: { dog: QuizDog; r: NatureResult }[]) => {
    if (saved || rs.length === 0) return;
    const inputs: DogEventInput[] = [];
    for (const { dog, r } of rs) {
      inputs.push({ dogId: dog.id, field: 'nature.element', value: r.element, source: 'quiz' });
      inputs.push({ dogId: dog.id, field: 'nature.role', value: r.role, source: 'quiz' });
      inputs.push({ dogId: dog.id, field: 'nature.specials', value: r.specials, source: 'quiz' });
    }
    try {
      await appendDogEvents(inputs);
      setSaved(true);
    } catch {
      /* zápis je bonus — výsledok sa ukáže aj keď zlyhá */
    }
  };

  /** `dogId === null` = celá svorka (klik na vetu). Inak jeden pes (klik na krúžok). */
  const pick = (qid: string, oid: string, dogId: string | null) => {
    const targets = dogId ? [dogId] : list.map((d) => d.id);
    // ⚠️ Číta sa z REFU, nie zo `answers`. Dva kliky v jednom ticku (Hekthor hneď po
    // Kleopatre) by zo stavu čítali tú istú zastaranú hodnotu a druhý by prvý prepísal —
    // presne to sa dialo pri prvom teste: klik na prvého psa sa stratil.
    const next = { ...answersRef.current };
    for (const id of targets) next[id] = { ...next[id], [qid]: oid };
    answersRef.current = next;
    setAnswers(next);
    // Ďalej sa ide, až keď má odpoveď KAŽDÝ pes — pri svorke by posun po prvom
    // kliku odniesol obrazovku spod ruky, kým sú ostatné krúžky prázdne.
    const q = NATURE_QUESTIONS[idx];
    if (!q || q.id !== qid) return;
    if (!list.every((d) => next[d.id]?.[qid])) return;
    setTimeout(() => {
      if (idx < NATURE_QUESTIONS.length - 1) setIdx((i) => i + 1);
      else setPhase('special');
    }, 220);
  };

  const pickSpecial = (k: SpecialKey, a: SpecialAnswer, dogId: string | null) => {
    const targets = dogId ? [dogId] : list.map((d) => d.id);
    const next = { ...specialsRef.current };   // ten istý dôvod ako v `pick`
    for (const id of targets) next[id] = { ...next[id], [k]: a };
    specialsRef.current = next;
    setSpecials(next);
    const complete = list.length > 0
      && list.every((d) => SPECIAL_KEYS.every((sk) => next[d.id]?.[sk]));
    if (complete) {
      const rs = list.map((d) => ({ dog: d, r: scoreNature(answers[d.id] ?? {}, next[d.id] ?? {}) }));
      setPhase('result');
      void finish(rs);
    }
  };

  const restart = () => {
    answersRef.current = {}; specialsRef.current = {};
    setAnswers({}); setSpecials({}); setIdx(0); setSaved(false); setPhase('intro');
  };

  // Bez psa sa nedá nič zapísať. Predtým to bola TICHÁ strata celého priebehu —
  // preto je to odteraz vidieť hneď na začiatku, nie až (ne)uložením na konci.
  if (dogs !== null && list.length === 0) {
    return (
      <Shell onClose={() => navigate('/pack')}>
        <Card>
          <Eyebrow>{tx('pack.nature.intro.eyebrow', 'Two questions in one')}</Eyebrow>
          <p style={{ fontFamily: FONT_UI, fontSize: 13.5, lineHeight: 1.6, color: T.inkStrong, margin: 0 }}>
            {tx('pack.nature.noDogs', 'This quiz writes its result onto a dog’s card, and there is no dog on your account yet.')}
          </p>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button type="button" className="nq-gold" onClick={() => navigate('/pack/dogs')}>
              {tx('pack.nature.noDogsCta', 'Back to my dogs')}
            </button>
          </div>
        </Card>
        <Attribution tx={tx} />
      </Shell>
    );
  }

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

          {!solo && <PackHint tx={tx} />}
          {!solo && <DogHead dogs={list} />}

          <div style={{ display: 'grid', gap: 9, marginTop: solo ? 16 : 0 }}>
            {q.options.map((o) => (
              <OptionRow
                key={o.id}
                label={tx(o.i18n, o.labelEN)}
                dogs={list}
                solo={solo}
                isOn={(dogId) => answers[dogId]?.[q.id] === o.id}
                onPickDog={(dogId) => pick(q.id, o.id, dogId)}
                onPickAll={() => pick(q.id, o.id, null)}
              />
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
          {!solo && <PackHint tx={tx} />}
          {!solo && <DogHead dogs={list} />}
          <div style={{ display: 'grid', gap: 14, marginTop: solo ? 0 : 2 }}>
            {SPECIAL_KEYS.map((k) => {
              const s = NATURE_SPECIALS[k];
              return (
                <div key={k}>
                  <div style={{ fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.45, color: T.inkStrong, marginBottom: 8 }}>
                    {tx(s.qI18n, s.questionEN)}
                  </div>
                  {/* Pri svorke idú áno/občas/nie POD SEBA ako v jadre kvízu — tri
                      vodorovné tlačidlá plus krúžky by sa do riadku nezmestili.
                      Sólo si ponecháva pôvodný vodorovný trojlístok. */}
                  {solo ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['yes', 'sometimes', 'no'] as SpecialAnswer[]).map((a) => (
                        <button
                          key={a}
                          type="button"
                          className={`nq-tri${specials[list[0]?.id]?.[k] === a ? ' is-on' : ''}`}
                          onClick={() => pickSpecial(k, a, null)}
                        >
                          {tx(`pack.nature.ans.${a}`, a === 'yes' ? 'Yes' : a === 'no' ? 'No' : 'Sometimes')}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 7 }}>
                      {(['yes', 'sometimes', 'no'] as SpecialAnswer[]).map((a) => (
                        <OptionRow
                          key={a}
                          label={tx(`pack.nature.ans.${a}`, a === 'yes' ? 'Yes' : a === 'no' ? 'No' : 'Sometimes')}
                          dogs={list}
                          solo={false}
                          isOn={(dogId) => specials[dogId]?.[k] === a}
                          onPickDog={(dogId) => pickSpecial(k, a, dogId)}
                          onPickAll={() => pickSpecial(k, a, null)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <button
              type="button"
              className="nq-gold"
              disabled={!allSpecialsDone}
              onClick={() => {
                const rs = list.map((d) => ({ dog: d, r: scoreNature(answers[d.id] ?? {}, specials[d.id] ?? {}) }));
                setPhase('result');
                void finish(rs);
              }}
            >
              {tx('pack.nature.special.cta', 'Show the result')}
            </button>
          </div>
        </Card>
        <Attribution tx={tx} />
      </Shell>
    );
  }

  /* — výsledok: jeden na psa — */
  if (results.length === 0) return null;
  return (
    <Shell onClose={() => navigate('/pack')}>
      {results.map(({ dog, r }, i) => (
        <div key={dog.id} style={{ marginTop: i === 0 ? 0 : 26 }}>
          {/* Meno psa nad výsledkom sa pri svorke pridáva zámerne — bez neho sú
              dve karty pod sebou nerozlíšiteľné. Sólo ho nepotrebuje. */}
          {!solo && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              marginBottom: 10,
            }}>
              <DogFace dog={dog} />
              <span style={{
                fontFamily: NAME_FONT, fontWeight: 700, fontSize: 15, letterSpacing: '.03em',
                textTransform: 'uppercase', color: T.onDark,
              }}>{(dog.dog_name || '').toUpperCase()}</span>
            </div>
          )}
          <Card>
            <ResultHead r={r} tx={tx} />
          </Card>
          <ResultBody r={r} tx={tx} />
        </div>
      ))}
      <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="nq-ghost" onClick={restart}>
          <RotateCcw className="h-3.5 w-3.5" /> {tx('pack.nature.result.again', 'Take it again')}
        </button>
        <button type="button" className="nq-gold" onClick={() => navigate('/pack')}>
          {tx('pack.nature.result.done', 'Done')}
        </button>
      </div>
      {saved && (
        <p style={{ fontFamily: FONT_UI, fontSize: 11, color: 'rgba(245,240,228,0.55)', marginTop: 12, textAlign: 'center' }}>
          <Check className="h-3 w-3 inline" />{' '}
          {solo
            ? tx('pack.nature.result.saved', 'Saved to your dog’s card')
            : tx('pack.nature.result.savedAll', 'Saved to every dog’s card')}
        </p>
      )}
      <Attribution tx={tx} />
    </Shell>
  );
}
