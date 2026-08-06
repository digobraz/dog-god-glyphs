// MY PACK (`/pack/dogs`) — VSTUP. Zadanie: plany/zadanie-mypack-petpas-2026-08-06.md §5,
// nákres: vystupy/mockups/pack-mypack-petpas-2026-08-06.html (obrazovka A).
//
// DELIACA ČIARA: táto stránka je VSTUP (kam sa zadáva), karta psa `/pack/dogs/:id` je
// VÝSTUP (pet pas, needituje sa tam nič). Preto tu psie karty nenesú ŽIADNE ÚDAJE —
// len identitu a progres vysvedčenia. Keby tu boli údaje, vzniknú dve pravdy vedľa seba.
//
// Dlaždice akcií sú JEDINÉ miesto, kam sa pridávajú nové funkcie (§5): stránka rastí
// o položku v `QUIZ_SECTIONS`, nie o novú sekciu v JSX.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackLayout } from '@/components/pack/PackLayout';
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { FlagCircle } from '@/components/pack/FlagCircle';
import { DogStats } from '@/components/pack/DogStats';
import ainubisBadge from '@/assets/ainubis-badge.png';
import { QUIZ_SECTIONS, ALL_STEPS, type QuizSection } from '@/components/pack/dogQuiz';
import { readLatestForDogs, onDogEventsChange, hasValue, type LatestValue } from '@/lib/dogEvents';
import { countryISO2 } from '@/lib/countryGeo';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;

// Meno psa = Cinzel Decorative, na každom povrchu (brand manuál, LOCKED 2026-07-26).
const NAME_FONT = "'Cinzel Decorative', 'Cinzel', serif";

// `.btn-gold` sa v projekte NEIMPORTUJE globálne — žije v `SpiralLanding.css` pod
// selektorom `.dogypt-spiral-root`. Zavedený vzor (AddTripPlan.tsx, AddEvent.tsx):
// lokálna kópia PRESNÝCH hodnôt zo SpiralLanding.css, nie vlastný gradient.
// Radius 8px, NIE pill. Hodnoty sa nesmú „doladiť" — CTA je LOCKED.
const HUB_CSS = `
.hub-hover{ transition: transform .2s ease, box-shadow .2s ease; }
/* Mriežka dlaždíc — PEVNÝ počet stĺpcov, nie auto-fill. Pri auto-fill sa v širokom
   stĺpci (PackLayout wide) zmestilo 5 dlaždíc do radu a z ôsmich zostala v druhom
   rade diera vpravo. 2 / 4 stĺpce delia 8 dlaždíc bez zvyšku. */
.hub-tiles{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
@media (min-width:900px){ .hub-tiles{ grid-template-columns:repeat(4,minmax(0,1fr)); } }
.hub-hover:hover{ transform: translateY(-2px); }
.hub-gold{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:13px 24px;
  background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border:1px solid rgba(250,244,236,0.30);
  border-radius:8px;
  color:#000;
  font-family:'Cinzel',serif; font-size:11px; font-weight:800;
  letter-spacing:.12em; text-transform:uppercase;
  cursor:pointer; white-space:nowrap; text-decoration:none;
  box-shadow:0 0 28px rgba(230,158,26,0.34), inset 0 1px 0 rgba(255,255,255,0.3);
  transition: transform .2s, box-shadow .22s;
}
.hub-gold:hover{ transform:scale(1.04); box-shadow:0 0 44px rgba(230,158,26,0.5), inset 0 1px 0 rgba(255,255,255,0.3); }
.hub-gold:active{ transform:scale(0.98); }
`;

interface HubDog {
  id: string;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  pack_number: number | null;
  country: string | null;
  life_status: string | null;
}

export default function PackDogs() {
  const t = useT();
  const tx = (key: string, fallback: string) => {
    const v = t(key);
    return v === key ? fallback : v;
  };

  const [dogs, setDogs] = useState<HubDog[] | null>(null);
  const [latest, setLatest] = useState<Record<string, Record<string, LatestValue>>>({});

  // Vlastný dotaz namiesto `usePackIdentity().dogs` — ten vracia len id/meno/foto,
  // a hub potrebuje aj poradové číslo a krajinu (vlajka na karte psa v zozname).
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) { if (alive) setDogs([]); return; }
      const { data } = await supabase
        .from('dogs')
        .select('id, dog_name, cloudinary_main_url, pack_number, country, life_status')
        .eq('user_id', uid)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true });
      if (alive) setDogs((data as HubDog[]) ?? []);
    })();
    return () => { alive = false; };
  }, []);

  // Progres sa číta pre VŠETKY psy naraz (jeden dotaz, nie N) a prekresľuje sa hneď
  // po návrate z kvízu — `onDogEventsChange` posiela in-tab signál po appende.
  useEffect(() => {
    if (!dogs || dogs.length === 0) return;
    const ids = dogs.map((d) => d.id);
    let alive = true;
    const load = () => { readLatestForDogs(ids).then((r) => { if (alive) setLatest(r); }); };
    load();
    const off = onDogEventsChange(load);
    return () => { alive = false; off(); };
  }, [dogs]);

  const totalSteps = ALL_STEPS.length;

  // Progres dlaždice = súčet cez VŠETKY psy: „3 z 10" znamená 3 zodpovedané otázky
  // z 10 možných naprieč svorkou. Pri jednom psovi je to presne jeho stav.
  const sectionProgress = useMemo(() => {
    const out: Record<string, { filled: number; total: number }> = {};
    const dogIds = dogs?.map((d) => d.id) ?? [];
    for (const s of QUIZ_SECTIONS) {
      if (s.kind !== 'quiz' || dogIds.length === 0) { out[s.key] = { filled: 0, total: 0 }; continue; }
      let filled = 0;
      for (const id of dogIds) {
        for (const step of s.steps) if (hasValue(latest[id]?.[step.field])) filled += 1;
      }
      out[s.key] = { filled, total: s.steps.length * dogIds.length };
    }
    return out;
  }, [dogs, latest]);

  // `wide` = rovnaká šírka stĺpca ako `/pack/profile` (max-w-5xl). Bez neho bol hub
  // v úzkom stĺpci (max-w-2xl) a vedľa profilu vyzeral ako iná stránka (Matej 6.8.).
  if (dogs === null) return <PackLayout wide><HubSkeleton /></PackLayout>;
  if (dogs.length === 0) return <PackLayout wide><style>{HUB_CSS}</style><EmptyState /></PackLayout>;

  return (
    <PackLayout wide>
      <style>{HUB_CSS}</style>
      <section
        style={{
          background: 'var(--brand-gradient)',
          borderRadius: 24,
          padding: '20px 18px 18px',
          border: '1px solid hsl(45 80% 60% / 0.28)',
          boxShadow: '0 20px 50px -22px rgba(40, 18, 60, 0.55)',
        }}
      >
        <h1
          className="text-center"
          style={{
            fontFamily: FONT_TITLE, fontSize: 16, fontWeight: 700,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'hsl(45 75% 92%)', margin: '0 0 4px',
          }}
        >
          {tx('pack.hub.title', 'My pack')}
        </h1>
        <div
          className="text-center"
          style={{
            fontFamily: FONT_UI, fontSize: 10.5, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: 'hsl(45 70% 90% / 0.55)', marginBottom: 16,
          }}
        >
          {dogs.length === 1
            ? tx('pack.hub.countOne', '1 dog')
            : `${dogs.length} ${tx('pack.hub.countMany', 'dogs')}`}
        </div>

        {/* ── psie karty — IDENTITA + PROGRES, žiadne údaje (§5) ── */}
        <div className="flex flex-col gap-2.5">
          {dogs.map((dog) => {
            const filled = ALL_STEPS.filter((s) => hasValue(latest[dog.id]?.[s.field])).length;
            return (
              <DogRow
                key={dog.id}
                dog={dog}
                filled={filled}
                total={totalSteps}
                completeLabel={tx('pack.hub.passComplete', 'Passport complete')}
                progressLabel={tx('pack.hub.passProgress', 'Passport')}
              />
            );
          })}
        </div>

        <hr
          style={{
            height: 2, border: 0, margin: '16px 0',
            background: T.rule,
          }}
        />

        <div
          className="text-center"
          style={{
            fontFamily: FONT_UI, fontWeight: 500, fontSize: 10, letterSpacing: '0.26em',
            textTransform: 'uppercase', color: T.accentGold, marginBottom: 10,
          }}
        >
          {tx('pack.hub.whatToDo', 'What do you want to do')}
        </div>

        {/* ── dlaždice akcií — nové funkcie sa pridávajú SEM (§5) ── */}
        <div className="hub-tiles">
          {QUIZ_SECTIONS.map((s) => (
            <ActionTile
              key={s.key}
              section={s}
              progress={sectionProgress[s.key]}
              tx={tx}
            />
          ))}
        </div>

        {/* ── AINUBIS — VÝSTUP, nie vstup. Preto stojí POD dlaždicami (§5). ── */}
        <AinubisBlock tx={tx} />
      </section>

      {/* ── ŠTATISTIKY — POSLEDNÝ blok stránky (Matej 6.8.: „ako posledné (coming soon)").
             Zámerne MIMO tmavej karty svorky: nie je to akcia ani vstup, je to výhľad. ── */}
      <div style={{ marginTop: 20 }}>
        <DogStats />
      </div>
    </PackLayout>
  );
}

// ── psia karta v zozname ─────────────────────────────────────────────────────
function DogRow({
  dog, filled, total, completeLabel, progressLabel,
}: {
  dog: HubDog; filled: number; total: number; completeLabel: string; progressLabel: string;
}) {
  const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
  const name = (dog.dog_name || '').toUpperCase();
  // ⚠️ `dogs.country` je ISO3 („SVK"), NIE ISO2 — flagcdn chce ISO2, inak vráti 404
  // a krúžok ostane prázdny (emoji fallback z 3 písmen tiež nič nevyrobí). Rovnaký
  // prevod robí karta psa cez `countryISO2()`; iný postup = rozbitá vlajka.
  const iso2 = countryISO2(dog.country || '') || 'sk';

  return (
    <Link
      to={`/pack/dogs/${dog.id}`}
      className="hub-hover flex items-center gap-3"
      style={{
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 14,
        padding: '11px 13px',
        boxShadow: T.cardShadow,
        textDecoration: 'none',
      }}
    >
      {dog.cloudinary_main_url ? (
        <img
          src={dog.cloudinary_main_url}
          alt={dog.dog_name || ''}
          style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.cardEdge}`, flex: '0 0 auto' }}
        />
      ) : (
        <div
          style={{
            width: 52, height: 52, borderRadius: '50%', flex: '0 0 auto',
            background: 'rgba(201,154,63,0.16)', border: `2px solid ${T.cardEdge}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <BrandIcon name="paw" size={20} tint="dark" />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: NAME_FONT, fontWeight: 700, fontSize: 17, lineHeight: 1.15,
            color: T.inkStrong, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap',
          }}
        >
          {name}
          {dog.pack_number !== null && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontWeight: 700, fontSize: 11,
                color: T.accentGold, background: 'rgba(201,154,63,0.14)',
                border: `1px solid ${T.border}`, borderRadius: 999, padding: '3px 9px', lineHeight: 1,
              }}
            >
              #{dog.pack_number}
            </span>
          )}
          <FlagCircle iso2={iso2} label={iso2.toUpperCase()} size={16} />
        </div>

        <div style={{ marginTop: 7 }}>
          <div style={{ height: 6, borderRadius: 999, background: T.hairline, overflow: 'hidden', position: 'relative' }}>
            <i
              style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pct}%`,
                background: 'linear-gradient(90deg, hsl(224 42% 42%), hsl(45 82% 55%))',
                borderRadius: 999, display: 'block',
              }}
            />
          </div>
          <span style={{ fontFamily: FONT_UI, fontSize: 10, color: T.inkWarm, marginTop: 4, display: 'block' }}>
            {filled === total ? completeLabel : `${progressLabel} ${filled} / ${total}`}
          </span>
        </div>
      </div>

      <span aria-hidden style={{ color: T.inkFaint, fontSize: 19 }}>›</span>
    </Link>
  );
}

// ── dlaždica akcie ───────────────────────────────────────────────────────────
function ActionTile({
  section, progress, tx,
}: {
  section: QuizSection;
  progress?: { filled: number; total: number };
  tx: (k: string, f: string) => string;
}) {
  // Galéria a denník ešte nemajú vlastný flow (§2/11 — hromadný vstup s tagovaním psov).
  // Dlaždica sa zobrazuje, ale nikam nevedie — inak by mizla z mapy funkcií a nikto by
  // si nevšimol, že chýba.
  const ready = section.kind === 'quiz';
  const p = progress ?? { filled: 0, total: 0 };

  const pill = !ready
    ? tx('pack.hub.soon', 'Soon')
    : p.total === 0
      ? tx('pack.hub.notStarted', 'Not started')
      : p.filled >= p.total
        ? tx('pack.hub.done', 'Done')
        : p.filled === 0
          ? tx('pack.hub.notStarted', 'Not started')
          : `${p.filled} / ${p.total}`;

  const filledPill = ready && p.total > 0 && p.filled >= p.total;

  const inner = (
    <>
      <div style={{ fontSize: 20, lineHeight: 1 }}>{section.emoji}</div>
      <h4
        style={{
          fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 12, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: T.inkStrong, margin: '9px 0 3px',
        }}
      >
        {tx(section.i18n, section.labelEN)}
      </h4>
      <p style={{ fontFamily: FONT_UI, fontSize: 11, color: T.inkWarm, margin: 0, lineHeight: 1.45 }}>
        {tx(section.subI18n, section.subEN)}
      </p>
      <span
        style={{
          display: 'inline-block', marginTop: 8, fontFamily: FONT_UI, fontSize: 9.5,
          letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 999, padding: '3px 9px',
          background: filledPill ? 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)' : 'rgba(201,154,63,0.16)',
          border: `1px solid ${filledPill ? '#E69E1A' : 'rgba(179,130,45,0.5)'}`,
          color: filledPill ? '#241a06' : T.inkWarm,
          opacity: ready ? 1 : 0.65,
        }}
      >
        {pill}
      </span>
    </>
  );

  const style: React.CSSProperties = {
    background: T.panelGrad,
    border: `1.5px solid ${T.cardEdge}`,
    borderRadius: 14,
    boxShadow: T.panelShadow,
    padding: '15px 13px',
    textAlign: 'left',
    display: 'block',
    textDecoration: 'none',
    opacity: ready ? 1 : 0.72,
    cursor: ready ? 'pointer' : 'default',
  };

  if (!ready) return <div style={style}>{inner}</div>;

  return (
    <Link to={`/pack/dogs/quiz/${section.key}`} className="hub-hover" style={style}>
      {inner}
    </Link>
  );
}

// ── AINUBIS ──────────────────────────────────────────────────────────────────
// ⚠️ VEDOMÁ ODCHÝLKA OD BRAND v3.2. AINUBIS má naprieč appkou VLASTNÚ cyborg paletu:
// cyan `#5BE0F0` + modrá = STROJ, zlatá = ČLOVEK (Matej 2026-07-26: „základ modrý, ale
// prvky zlatej — modrý je AINUBIS a človek má zlaté interakcie"). Zdroj pravdy =
// hlavička `components/ainubis/AinubisWidget.css`. Papyrusová karta by tu bola chyba —
// blok by splynul so vstupnými dlaždicami a AINUBIS by prestal byť rozoznateľný ako AI.
//
// COMING SOON (Matej 6.8.): plán sa zatiaľ nestavia, preto tu NIE JE zlaté CTA —
// zlatá = interakcia človeka, a tá tu žiadna nie je. Odznak je technický, cyan.
function AinubisBlock({ tx }: { tx: (k: string, f: string) => string }) {
  return (
    <div
      className="flex items-center gap-4 flex-wrap"
      style={{
        marginTop: 14, padding: '18px 20px', borderRadius: 16,
        background: 'radial-gradient(circle at 22% 20%, #12233a 0%, #01050A 74%)',
        border: '1px solid rgba(91,224,240,0.28)',
        boxShadow: '0 0 0 4px rgba(59,158,255,0.05), 0 18px 44px -22px rgba(59,158,255,0.45)',
      }}
    >
      <img
        src={ainubisBadge}
        alt=""
        aria-hidden
        style={{
          width: 62, height: 62, objectFit: 'contain', borderRadius: '50%', flex: '0 0 auto',
          background: 'radial-gradient(circle at 35% 28%, #12233a 0%, #01050A 74%)',
          border: '1px solid rgba(91,224,240,0.35)',
          boxShadow: '0 0 0 5px rgba(59,158,255,0.06), 0 0 26px rgba(59,158,255,0.34)',
        }}
      />
      <div style={{ flex: 1, minWidth: 200 }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9.5,
            letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(91,224,240,0.7)',
          }}
        >
          Ainubis
        </span>
        <h4
          style={{
            fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 15, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#E6FAFF', margin: '6px 0 5px',
            textShadow: '0 0 18px rgba(91,224,240,0.45)',
          }}
        >
          {tx('pack.hub.ainubisTitle', 'A plan made for your dog')}
        </h4>
        <p
          style={{
            fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.55,
            color: 'rgba(230,250,255,0.62)', margin: 0, maxWidth: '52ch',
          }}
        >
          {tx(
            'pack.hub.ainubisBody',
            'From what you filled in, I put together a training, movement and feeding plan — and keep adjusting it as your dog changes.',
          )}
        </p>
      </div>
      <span
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10,
          letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap',
          color: '#5BE0F0', background: 'rgba(91,224,240,0.08)',
          border: '1px solid rgba(91,224,240,0.35)', borderRadius: 999, padding: '8px 16px',
        }}
      >
        {tx('pack.hub.soon', 'Soon')}
      </span>
    </div>
  );
}

// ── prázdne stavy ────────────────────────────────────────────────────────────
function HubSkeleton() {
  return (
    <div
      style={{
        background: 'var(--brand-gradient)', borderRadius: 24, padding: '20px 18px',
        border: '1px solid hsl(45 80% 60% / 0.28)', minHeight: 320,
      }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{ height: 76, borderRadius: 14, background: 'rgba(245,240,228,0.06)', marginBottom: 9 }}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  return (
    <div
      className="flex flex-col items-center text-center gap-4"
      style={{
        background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16, padding: '36px 24px', boxShadow: T.cardShadow,
      }}
    >
      <BrandIcon name="bone" size={30} tint="dark" />
      <p style={{ fontFamily: FONT_UI, fontSize: 14.5, lineHeight: 1.6, color: T.inkDim, margin: 0, maxWidth: 320 }}>
        {tx('pack.hub.empty', "No dog on your leash yet. Give one a heroglyph and it'll show up here.")}
      </p>
      <Link to="/heroglyph" className="hub-gold">
        {tx('pack.hub.emptyCta', 'Get a heroglyph')}
      </Link>
    </div>
  );
}
