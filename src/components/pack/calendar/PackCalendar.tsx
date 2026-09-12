// ════════════════════════════════════════════════════════════════════════════
// KALENDÁR na `/pack/dogs` — POSLEDNÝ blok stránky, MIMO bloku DOG ID.
// Matej 12. 9. 2026: „kalendár nie je časť dokladu, je to dochádzka."
// Nákres (vrátane zamietnutej prvej verzie a dôvodov):
//   plany/nakres-kalendar-dogs-2026-09-12.html
//
// NAHRADIL `DogStats.tsx` — ten kreslil DEMO farby pod prekrytím COMING SOON
// (`statDemoColor()`), takže sa nedal začať čítať ako pravda o psovi. Tento
// kalendár kreslí LEN skutočné dáta a keď ich nie je, radšej neukáže nič.
//
// ODKIAĽ BERIE DÁTA (nič z toho nie je nové úložisko):
//   • výlety s dátumom → `readTriplist()` (`user_trips.trip_date` sa doň sype
//     pri hydratácii) + množina prejdených `PACK_KEYS.walked`
//   • veterinár a odčervenie → DÁTUMOVÉ polia DOG ID (`health.vaxRabies`,
//     `vaxCombo`, `deworm`) — už načítané v `PackDogs`, nulový dotaz navyše
//   • váženia → `readSeries(dogId, 'health.weightKg')`, append-only s `recordedAt`
//   • narodeniny a ľudské roky → `selections.birthday*`, počítajú sa
//   • sezóny, spln/nov, kliešte, okná protokolu → VÝPOČET, žiadne dáta
//
// ⚠️ ČO TU ZÁMERNE NIE JE: zápis. Denník, „bol som u vety" a „deň bez seba" sa
// dnes nemajú kam uložiť v tvare, ktorý kalendár potrebuje, takže popup dňa je
// ČÍTACÍ — žiadne mŕtve tlačidlo „pridať". Zápis je samostatný krok (§3 nákresu,
// `dog_events` na LIVE existuje a je prázdna).
// ⚠️ A ČO CHÝBA VÝLETOM: `trip_walked` drží len `walked_at` (kedy si ťukol ✓),
// nie deň, kedy si šiel. Preto sú tu len výlety, ktoré prešli cez PRIDAJ VÝLET
// alebo plán s dátumom. Riadok „KEDY" v popupe po ✓ je ďalší krok.
// ════════════════════════════════════════════════════════════════════════════
import { Fragment, useEffect, useMemo, useState } from 'react';
import { PACK_THEME, PACK_BOX, FONT_TITLE, FONT_UI, PF_FIELD_CSS } from '@/components/pack/packTheme';
import { LAPIS, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { readSeries, type LatestValue } from '@/lib/dogEvents';
import { readTriplist } from '@/components/pack/triplist/triplist';
import { readLocalTrails } from '@/components/pack/tripShared';
import { readStringSet, PACK_KEYS } from '@/lib/packStore';
import { computeAge } from '@/lib/dogAge';
import type { ElementKey } from '@/components/pack/natureQuiz';
import {
  SEASONS, seasonOf, seasonsInMonth, seasonOfMonth, dim, doy, dateKey, parseDayInYear,
  moonDaysOfYear, PROTOCOL, TICKS, visibleProtocol, protocolOn, protocolLanes, ticksInMonth,
  protWholeMonth, protWindowColor, CAL_RGB, calRGBA, hexRGBA, LOG_TYPES, cellFill,
  birthdaysOn, humanYearsOn,
  type CalDog, type CalEntry, type LogKind, type MoonPhase, type ProtWindow,
} from './calendarModel';

const T = PACK_THEME;
const EMOJI_FONT = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

type Tx = (key: string, fallback: string) => string;
type Latest = Record<string, Record<string, LatestValue>>;

/** Minimum z riadku `dogs`, ktoré kalendár potrebuje. */
export interface CalendarDogRow {
  id: string;
  dog_name: string | null;
  selections?: Record<string, string> | null;
  birth_year?: number | null;
  life_status?: string | null;
  death_date?: string | null;
}

const MONTHS_SHORT_SK = ['Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
const MONTHS_LONG_SK = ['Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 'Júl', 'August', 'September', 'Október', 'November', 'December'];
const DOW_SK = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

// Mobil otvára MESIAC, PC ROK (nákres §7). Bunka roka má na telefóne ~9 px —
// kliknúť sa na ňu nedá, takže ROK je tam pohľad, nie nástroj.
const MOBILE_Q = '(max-width:700px)';

export function PackCalendar({ dogs, latest, tx }: { dogs: CalendarDogRow[]; latest: Latest; tx: Tx }) {
  const year = new Date().getFullYear();
  const today = useMemo(() => { const n = new Date(); return { m: n.getMonth() + 1, d: n.getDate(), year: n.getFullYear() }; }, []);

  const [view, setView] = useState<'year' | 'month'>(() =>
    typeof window !== 'undefined' && window.matchMedia(MOBILE_Q).matches ? 'month' : 'year');
  const [sel, setSel] = useState<string>('all');          // 'all' | dogId
  const [layers, setLayers] = useState({ log: true, prot: true, nat: true });
  const [month, setMonth] = useState(today.m);
  const [open, setOpen] = useState<{ m: number; d: number } | null>(null);

  // ── psy do tvaru, ktorý pozná logika ──────────────────────────────────────
  const calDogs: CalDog[] = useMemo(() => dogs.map((row) => {
    const s = row.selections ?? undefined;
    const bm = parseInt(s?.birthdayMonth || '', 10);
    const bd = parseInt(s?.birthdayDay || '', 10);
    const age = computeAge(s, row.birth_year, row.life_status === 'deceased' && row.death_date ? new Date(row.death_date) : undefined);
    const el = latest[row.id]?.['nature.element']?.value;
    return {
      id: row.id,
      name: row.dog_name || '—',
      birth: bm >= 1 && bm <= 12 && bd >= 1 && bd <= 31 ? { m: bm, d: bd } : null,
      element: (typeof el === 'string' ? el : null) as ElementKey | null,
      years: age?.years ?? null,
      // Kĺbová kúra je jediné okno protokolu pre JEDNÉHO psa — „senior" je tu
      // 8+ rokov. Je to odporúčanie protokolu, nie diagnóza.
      senior: (age?.years ?? 0) >= 8,
    };
  }), [dogs, latest]);

  const shown = useMemo(() => (sel === 'all' ? calDogs : calDogs.filter((g) => g.id === sel)), [sel, calDogs]);
  const solo = sel !== 'all';
  // Zvýraznená sezóna sa objaví AŽ po výbere psa: element je psí a dvaja psi =
  // dve sezóny, čím by zvýraznenie prestalo niečo znamenať. To je zároveň dôvod,
  // prečo filter vôbec niekto použije.
  const myElement: ElementKey | null = solo ? (shown[0]?.element ?? null) : null;
  const seniorSelected = solo ? (shown[0]?.senior ?? false) : calDogs.some((g) => g.senior);

  // ── zápisy ────────────────────────────────────────────────────────────────
  const [tripEntries, setTripEntries] = useState<CalEntry[]>([]);
  const [weighEntries, setWeighEntries] = useState<CalEntry[]>([]);

  // Výlety. Dataset trás (1,7 MB) sa ťahá DYNAMICKY — kvôli menám výletov by inak
  // sedel v chunku celej stránky, hoci ho potrebuje jediný blok na jej konci.
  useEffect(() => {
    let alive = true;
    const list = readTriplist();
    const slugs = Object.entries(list).filter(([, t]) => !!t.date);
    if (slugs.length === 0) { setTripEntries([]); return; }
    const walked = readStringSet(PACK_KEYS.walked);
    (async () => {
      const mod = await import('@/data/heroTrails.generated');
      if (!alive) return;
      // ⚠️ DVA zdroje názvov, nie jeden: okrem datasetu aj výlety, ktoré si člen
      // nahodil sám (`trp-local-trails`). Bez nich popup ukázal technický slug
      // `PLAN-1787784003366` namiesto názvu — a to je presne tá časť zoznamu,
      // ktorá má dátum najčastejšie, lebo ju človek zadával ručne.
      const byId = new Map([...mod.HERO_TRAILS, ...readLocalTrails()].map((t) => [t.id, t]));
      const out: CalEntry[] = [];
      for (const [slug, t] of slugs) {
        const day = parseDayInYear(t.date, year);
        if (!day) continue;
        const trail = byId.get(slug);
        // Keď meno nepoznáme ani z jedného zdroja, ostáva PRÁZDNE a názov typu
        // dosadí až render (`titleOf`). Preklad do dát nepatrí: `tx` je pri každom
        // renderi nová funkcia, takže v závislostiach effectu by roztočil
        // import → setState → render → import (nekonečná smyčka).
        // Prejdený = minulosť (⛰️), zvyšok s dátumom = plán (📍). O tom, čo to je,
        // rozhoduje ✓, nie to, či dátum leží v budúcnosti — človek si môže ✓ ťuknúť
        // aj o týždeň a deň zostáva ten, ktorý si zapísal.
        out.push({
          kind: walked.has(slug) ? 'trip' : 'plan',
          m: day.m, d: day.d,
          title: trail?.name || '',
          dogId: null,
          href: trail ? `/pack/map/${trail.country ? trail.country.toLowerCase() : 'svk'}/${slug}` : undefined,
        });
      }
      setTripEntries(out);
    })();
    return () => { alive = false; };
  }, [year]);

  // Váženia — append-only séria, teda krivka, ktorú dnes nikto nekreslí.
  useEffect(() => {
    let alive = true;
    const ids = dogs.map((d) => d.id);
    if (ids.length === 0) { setWeighEntries([]); return; }
    (async () => {
      const all = await Promise.all(ids.map((id) => readSeries(id, 'health.weightKg').catch(() => [])));
      if (!alive) return;
      const out: CalEntry[] = [];
      all.forEach((series, i) => {
        for (const ev of series) {
          const day = parseDayInYear(ev.recordedAt, year);
          if (!day) continue;
          const kg = typeof ev.value === 'number' ? ev.value : parseFloat(String(ev.value ?? ''));
          if (!kg || Number.isNaN(kg)) continue;
          out.push({ kind: 'weigh', m: day.m, d: day.d, title: `${kg} kg`, dogId: ids[i] });
        }
      });
      setWeighEntries(out);
    })();
    return () => { alive = false; };
  }, [dogs, year]);

  // Veterinár a odčervenie z DOG ID. Sú to dátumy udalostí, ktoré sa STALI —
  // teda plnohodnotné zápisy, len ich nikto nikdy nenakreslil.
  const vetEntries: CalEntry[] = useMemo(() => {
    const out: CalEntry[] = [];
    const FIELDS: { field: string; kind: LogKind; fb: string; key: string }[] = [
      { field: 'health.vaxRabies', kind: 'vet', fb: 'Besnota', key: 'pack.cal.vaxRabies' },
      { field: 'health.vaxCombo', kind: 'vet', fb: 'Kombinovaná vakcína', key: 'pack.cal.vaxCombo' },
      { field: 'health.deworm', kind: 'deworm', fb: 'Odčervenie', key: 'pack.cal.deworm' },
    ];
    for (const row of dogs) {
      for (const f of FIELDS) {
        const v = latest[row.id]?.[f.field]?.value;
        const day = parseDayInYear(typeof v === 'string' ? v : null, year);
        if (!day) continue;
        out.push({ kind: f.kind, m: day.m, d: day.d, title: tx(f.key, f.fb), dogId: row.id });
      }
    }
    return out;
  }, [dogs, latest, year, tx]);

  // Jeden index na celý rok — mriežka sa pýta 372× „čo je v tento deň".
  const byDay = useMemo(() => {
    const map = new Map<string, CalEntry[]>();
    for (const e of [...tripEntries, ...weighEntries, ...vetEntries]) {
      if (e.dogId !== null && solo && e.dogId !== sel) continue;   // cudzieho psa skryjeme
      const k = dateKey(e.m, e.d);
      const arr = map.get(k);
      if (arr) arr.push(e); else map.set(k, [e]);
    }
    return map;
  }, [tripEntries, weighEntries, vetEntries, solo, sel]);

  const entriesOn = (m: number, d: number): CalEntry[] => (layers.log ? byDay.get(dateKey(m, d)) ?? [] : []);
  const moons = useMemo(() => moonDaysOfYear(year), [year]);
  const moonOn = (m: number, d: number): MoonPhase | null => (layers.nat ? moons.get(dateKey(m, d)) ?? null : null);

  const hasAnyEntry = byDay.size > 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const monthName = (m: number): string => tx(`pack.cal.monthLong.${m}`, MONTHS_LONG_SK[m - 1]);
  const monthShort = (m: number): string => tx(`pack.cal.monthShort.${m}`, MONTHS_SHORT_SK[m - 1]);
  const seasonName = (k: ElementKey): string => tx(`pack.cal.season.${k}`, SEASONS.find((s) => s.key === k)!.nameSK);
  const elementName = (k: ElementKey): string => tx(`pack.nature.el.${k}`, SEASONS.find((s) => s.key === k)!.elementSK);
  const typeName = (k: LogKind): string => tx(LOG_TYPES[k].i18n, LOG_TYPES[k].nameSK);
  const protName = (w: ProtWindow): string => tx(`pack.cal.prot.${w.id}`, w.nameSK);

  return (
    <section id="calendar" style={{ ...PACK_BOX.card, padding: 24 }}>
      <style>{CAL_CSS}</style>

      <div className="flex items-center gap-2.5" style={{ marginBottom: 4 }}>
        <BrandIcon name="bars" size={24} tint="gold" />
        <h2 style={{ fontFamily: FONT_TITLE, fontSize: 24, fontWeight: 700, letterSpacing: '0.14em', color: T.inkStrong, lineHeight: 1.05, textTransform: 'uppercase' }}>
          {tx('pack.cal.title', 'Kalendár')}
        </h2>
      </div>
      <p style={{ fontFamily: FONT_UI, fontSize: 12.5, color: T.inkWarm, marginBottom: 16 }}>
        {tx('pack.cal.sub', 'Jedna os času: čo sa stalo, čo sa má a čo je vonku.')}
      </p>

      {/* ── OVLÁDANIE — TRI TVARY, nie jeden rad ôsmich rovnakých pilulek ─────
           Prvá verzia mala pohľad, psov aj vrstvy ako identické lapisové pilulky
           v jednom rade: osem rovnakých prvkov, z ktorých päť svietilo rovnako,
           takže sa nedalo prečítať, čo je pohľad, čo filter a čo vrstva. Nákres
           to mal rozdelené od začiatku a toto je návrat k nemu:
             • POHĽAD  = spojený prepínač v jednej dráhe (`.pf-toggle` — ten istý,
               aký má prepínač šatu; aktívna polovica je PLNÝ lapis)
             • VRSTVY  = tiché pilulky s bodkou, na opačnom konci riadku
             • PSY     = vlastný riadok, lapis TINT (výber, nie akcia) */}
      <div className="cal-ctl">
        <style>{PF_FIELD_CSS}</style>
        <div className="pf-toggle inline-flex items-center" style={{ borderRadius: 999, padding: 3, gap: 3 }}>
          {(['year', 'month'] as const).map((v) => (
            <button
              key={v} type="button"
              className={`pf-toggle__opt${view === v ? ' is-on' : ''}`}
              aria-pressed={view === v}
              onClick={() => setView(v)}
            >
              {v === 'year' ? tx('pack.cal.viewYear', 'Rok') : tx('pack.cal.viewMonth', 'Mesiac')}
            </button>
          ))}
        </div>

        <div className="cal-layers" role="group" aria-label={tx('pack.cal.layers', 'Vrstvy')}>
          {([
            ['log', tx('pack.cal.layerLog', 'Zápisy')],
            ['prot', tx('pack.cal.layerProt', 'Protokol')],
            ['nat', tx('pack.cal.layerNat', 'Príroda')],
          ] as const).map(([k, label]) => {
            const on = layers[k as keyof typeof layers];
            return (
              <button
                key={k} type="button"
                className={`cal-lay${on ? ' on' : ''}`}
                aria-pressed={on}
                onClick={() => setLayers((p) => ({ ...p, [k]: !p[k as keyof typeof layers] }))}
              >
                <span className="cal-dot" />{label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rad psov sa zobrazí len pri DVOCH a viac — s jedným psom je to chrome
          bez úlohy. Výber NESKRÝVA spoločné výlety: pes tam bol tiež. */}
      {calDogs.length > 1 && (
        <div className="cal-dogsel" role="group" aria-label={tx('pack.cal.filter', 'Filter psov')}>
          <button type="button" className={`cal-dogpill${sel === 'all' ? ' on' : ''}`} onClick={() => setSel('all')}>
            {tx('pack.cal.allDogs', 'Celá svorka')}
          </button>
          {calDogs.map((g) => (
            <button key={g.id} type="button" className={`cal-dogpill${sel === g.id ? ' on' : ''}`} onClick={() => setSel(g.id)}>
              {g.name}
            </button>
          ))}
        </div>
      )}

      {view === 'year' ? (
        <YearGrid
          year={year} today={today} dogs={shown} solo={solo} myElement={myElement}
          seniorSelected={seniorSelected} layers={layers}
          entriesOn={entriesOn} moonOn={moonOn} onDay={(m, d) => setOpen({ m, d })}
          monthShort={monthShort} seasonName={seasonName} elementName={elementName} protName={protName}
          tx={tx}
        />
      ) : (
        <MonthGrid
          year={year} month={month} today={today} dogs={shown} solo={solo} myElement={myElement}
          seniorSelected={seniorSelected} layers={layers}
          entriesOn={entriesOn} moonOn={moonOn} onDay={(m, d) => setOpen({ m, d })}
          setMonth={setMonth} monthName={monthName} seasonName={seasonName} elementName={elementName}
          protName={protName} tx={tx}
        />
      )}

      {/* Prázdny kalendár musí POVEDAŤ, prečo je prázdny — inak vyzerá pokazený. */}
      {layers.log && !hasAnyEntry && (
        <p className="cal-note" style={{ marginTop: 12 }}>
          {tx('pack.cal.emptyHint', 'Zatiaľ tu nie je ani jeden zápis. Kalendár kreslí len to, čo má DEŇ — výlet s dátumom, očkovanie, váženie.')}
        </p>
      )}

      <Legend layers={layers} solo={solo} tx={tx} typeName={typeName} />

      {open && (
        <DayPopup
          year={year} day={open} dogs={shown} solo={solo} myElement={myElement}
          seniorSelected={seniorSelected} layers={layers}
          entries={entriesOn(open.m, open.d)} moon={moonOn(open.m, open.d)}
          onClose={() => setOpen(null)}
          monthName={monthName} seasonName={seasonName} elementName={elementName}
          typeName={typeName} protName={protName} tx={tx}
        />
      )}
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROK — 12 riadkov × 31 buniek + pás období vpravo.
// Bunka nesie JEDEN DEŇ. Sezóna je tiché pozadie, všetko, čo TRVÁ, je v páse.
// ════════════════════════════════════════════════════════════════════════════
function YearGrid({
  year, today, dogs, solo, myElement, seniorSelected, layers, entriesOn, moonOn, onDay,
  monthShort, seasonName, elementName, protName, tx,
}: {
  year: number; today: { m: number; d: number; year: number }; dogs: CalDog[]; solo: boolean;
  myElement: ElementKey | null; seniorSelected: boolean; layers: { log: boolean; prot: boolean; nat: boolean };
  entriesOn: (m: number, d: number) => CalEntry[]; moonOn: (m: number, d: number) => MoonPhase | null;
  onDay: (m: number, d: number) => void; monthShort: (m: number) => string;
  seasonName: (k: ElementKey) => string; elementName: (k: ElementKey) => string;
  protName: (w: ProtWindow) => string; tx: Tx;
}) {
  const lanes = layers.prot ? protocolLanes(seniorSelected) : [];
  return (
    <>
      <div className="cal-yr">
        <span />
        <div className="cal-yr-hdnum" aria-hidden>
          {Array.from({ length: 31 }, (_, i) => <span key={i}>{i + 1}</span>)}
        </div>
        <div className="cal-yr-hdrail">{tx('pack.cal.periods', 'Obdobia')}</div>

        {Array.from({ length: 12 }, (_, mi) => {
          const m = mi + 1;
          const all = seasonsInMonth(year, m);
          const sm = seasonOfMonth(year, m);
          // „Jeho sezóna" sa pozná podľa VŠETKÝCH sezón mesiaca, nie podľa
          // prevažujúcej — inak by pes s elementom ZEM (17 dní) nesvietil nikdy.
          const mine = myElement !== null && all.some((o) => o.season.key === myElement);
          // Fragment zámerne: menovka a rad buniek musia byť PRIAME deti gridu,
          // inak sa riadok mesiaca zabalí do jednej bunky a mriežka sa rozsype.
          return (
            <Fragment key={m}>
              <div
                className={`cal-mlbl${mine ? ' mine' : ''}`}
                style={{ background: hexRGBA(sm.bg, 0.85), color: sm.ink }}
                title={all.map((o) => `${seasonName(o.season.key)} · ${elementName(o.season.key)}`).join(' → ')}
              >
                <b>{monthShort(m)}</b>
                <i>{all.map((o) => tx(`pack.cal.seasonShort.${o.season.key}`, o.season.shortSK)).join(' · ')}</i>
              </div>
              <div className="cal-yr-cells">
                {Array.from({ length: 31 }, (_, di) => {
                  const d = di + 1;
                  if (d > dim(year, m)) return <span key={d} className="cal-cell void" />;
                  const s = seasonOf(year, m, d);
                  const es = entriesOn(m, d);
                  const fill = layers.log ? cellFill(es) : null;
                  const cls = ['cal-cell'];
                  if (layers.log) {
                    if (birthdaysOn(dogs, m, d).length) cls.push('ringBirth');
                    else if (humanYearsOn(year, dogs, m, d, solo).length) cls.push('ringHuman');
                    else if (!fill && es.some((e) => LOG_TYPES[e.kind].group === 'plan')) cls.push('isPlan');
                  }
                  if (year === today.year && m === today.m && d === today.d) cls.push('today');
                  const mo = moonOn(m, d);
                  return (
                    <span
                      key={d}
                      className={cls.join(' ')}
                      style={{ background: fill || hexRGBA(s.bg, 0.5) }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${d}. ${monthShort(m)}`}
                      onClick={() => onDay(m, d)}
                      onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onDay(m, d); } }}
                    >
                      {mo && <span className={mo === 'full' ? 'moonF' : 'moonN'} />}
                    </span>
                  );
                })}
              </div>
            </Fragment>
          );
        })}

        {/* PÁS OBDOBÍ — jediné miesto, kde stoja veci, ktoré TRVAJÚ, a majú tu meno. */}
        <div className="cal-rail" aria-hidden>
          {lanes.map((it, i) => {
            const c = protWindowColor(it.w, CAL_RGB);
            return (
              <div
                key={`${it.w.id}-${i}`}
                className="cal-bar"
                style={{
                  gridColumn: it.lane + 1,
                  gridRow: `${it.m1}/${it.m2 + 1}`,
                  background: `rgba(${c},0.15)`,
                  border: `1px solid rgba(${c},0.45)`,
                  color: `rgb(${c})`,
                }}
                title={`${protName(it.w)} — ${rangeTxt(it.w)}`}
              >
                <em style={{ fontFamily: EMOJI_FONT }}>{it.w.emoji}</em>
                <span>{protName(it.w)}</span>
              </div>
            );
          })}
          {layers.nat && (
            <div
              className="cal-barnat"
              style={{ gridRow: `${TICKS.fromMonth}/${TICKS.toMonth + 1}`, background: calRGBA('nat', 0.13), border: `1px solid ${calRGBA('nat', 0.4)}` }}
              title={tx('pack.cal.ticks', TICKS.nameSK)}
            >
              <span style={{ fontFamily: EMOJI_FONT }}>{TICKS.emoji}</span>
            </div>
          )}
        </div>
      </div>
      <p className="cal-note" style={{ marginTop: 10 }}>
        {tx('pack.cal.yearNote', 'Bunka nesie jeden deň. Všetko, čo trvá — sezóna, okno protokolu, kliešte — stojí vpravo a má meno.')}
      </p>
    </>
  );
}

const rangeTxt = (w: ProtWindow): string => `${w.from.d}. ${w.from.m}. – ${w.to.d}. ${w.to.m}.`;

// ════════════════════════════════════════════════════════════════════════════
// MESIAC — klikacia mriežka. Bunka je NEUTRÁLNA: sezóna aj okná protokolu sú
// v pilulkách nad mriežkou, takže ich netreba opakovať 31× pod sebou.
// ════════════════════════════════════════════════════════════════════════════
function MonthGrid({
  year, month, today, dogs, solo, myElement, seniorSelected, layers, entriesOn, moonOn, onDay,
  setMonth, monthName, seasonName, elementName, protName, tx,
}: {
  year: number; month: number; today: { m: number; d: number; year: number }; dogs: CalDog[]; solo: boolean;
  myElement: ElementKey | null; seniorSelected: boolean; layers: { log: boolean; prot: boolean; nat: boolean };
  entriesOn: (m: number, d: number) => CalEntry[]; moonOn: (m: number, d: number) => MoonPhase | null;
  onDay: (m: number, d: number) => void; setMonth: (m: number) => void;
  monthName: (m: number) => string; seasonName: (k: ElementKey) => string;
  elementName: (k: ElementKey) => string; protName: (w: ProtWindow) => string; tx: Tx;
}) {
  const s1 = seasonOf(year, month, 1);
  const s2 = seasonOf(year, month, dim(year, month));
  const first = (new Date(year, month - 1, 1).getDay() + 6) % 7;   // pondelok = 0
  const chip = (k: ElementKey): string =>
    `${seasonName(k)} · ${elementName(k)}${k === myElement ? ` — ${tx('pack.cal.hisSeason', 'jeho sezóna')}` : ''}`;

  return (
    <>
      <div className="cal-monav">
        <button type="button" onClick={() => setMonth(month > 1 ? month - 1 : 12)} aria-label={tx('pack.cal.prevMonth', 'Predchádzajúci mesiac')}>‹</button>
        <span className="cal-moname">{monthName(month)} {year}</span>
        <button type="button" onClick={() => setMonth(month < 12 ? month + 1 : 1)} aria-label={tx('pack.cal.nextMonth', 'Ďalší mesiac')}>›</button>
      </div>

      <div className="cal-band">
        <span className="cal-chip" style={{ background: s1.bg, color: s1.ink, borderColor: `${s1.ink}55` }}>{chip(s1.key)}</span>
        {s2.key !== s1.key && (
          <span className="cal-chip" style={{ background: s2.bg, color: s2.ink, borderColor: `${s2.ink}55` }}>{chip(s2.key)}</span>
        )}
        {layers.prot && visibleProtocol(seniorSelected).filter((w) => w.from.m <= month && w.to.m >= month).map((w, i) => {
          const c = protWindowColor(w, CAL_RGB);
          return (
            <span key={`${w.id}-${i}`} className="cal-chip" style={{ color: `rgb(${c})`, borderColor: `rgba(${c},0.45)`, background: `rgba(${c},0.08)` }}>
              <span style={{ fontFamily: EMOJI_FONT }}>{w.emoji}</span>
              {protName(w)}
              {!protWholeMonth(year, w, month) && <small>{rangeTxt(w)}</small>}
            </span>
          );
        })}
        {layers.nat && ticksInMonth(month) && (
          <span className="cal-chip" style={{ color: `rgb(${CAL_RGB.nat})`, borderColor: calRGBA('nat', 0.4), background: calRGBA('nat', 0.07) }}>
            <span style={{ fontFamily: EMOJI_FONT }}>{TICKS.emoji}</span>{tx('pack.cal.ticks', TICKS.nameSK)}
          </span>
        )}
      </div>

      <div className="cal-mogrid">
        {DOW_SK.map((x, i) => <div key={x} className="cal-dow">{tx(`pack.cal.dow.${i}`, x)}</div>)}
        {Array.from({ length: first }, (_, i) => <div key={`out-${i}`} className="cal-mocell out" />)}
        {Array.from({ length: dim(year, month) }, (_, di) => {
          const d = di + 1;
          const es = entriesOn(month, d);
          const fill = layers.log ? cellFill(es) : null;
          const marks: string[] = [];
          if (layers.log) {
            birthdaysOn(dogs, month, d).forEach(() => marks.push('🎂'));
            humanYearsOn(year, dogs, month, d, solo).forEach(() => marks.push('🎈'));
            es.forEach((e) => marks.push(LOG_TYPES[e.kind].emoji));
          }
          const mo = moonOn(month, d);
          const isToday = year === today.year && month === today.m && d === today.d;
          return (
            <div
              key={d}
              className={`cal-mocell${isToday ? ' today' : ''}`}
              style={fill ? { background: softer(fill, 0.10), borderColor: softer(fill, 0.45) } : undefined}
              role="button"
              tabIndex={0}
              onClick={() => onDay(month, d)}
              onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onDay(month, d); } }}
            >
              <span className="cal-monum">{d}</span>
              {mo && <span className="cal-momoon" style={{ background: mo === 'full' ? '#FFFDF5' : '#241a09' }} />}
              <span className="cal-momk" style={{ fontFamily: EMOJI_FONT }}>
                {marks.slice(0, 3).join('')}
                {marks.length > 3 && <u>+{marks.length - 3}</u>}
              </span>
            </div>
          );
        })}
      </div>
      <p className="cal-note" style={{ marginTop: 10 }}>
        {tx('pack.cal.monthNote', 'Kalendár kreslí len to, čo má deň. Výlet bez dátumu tu nie je — ostáva v tripliste.')}
      </p>
    </>
  );
}

/** Prepíše krytie v hotovom `rgba(...)` — bunka mesiaca je tichšia než bunka roka. */
function softer(rgba: string, alpha: number): string {
  return rgba.replace(/[\d.]+\)$/, `${alpha})`);
}

// ════════════════════════════════════════════════════════════════════════════
// LEGENDA — DVE skupiny, nie štrnásť riadkov pod sebou.
// Prvý nákres mal legendu na 14 riadkov (7 typov + spln + nov + 5 sezón) a bola
// to presne tá kaša, ktorú nákres vyčítal papierovému protokolu 1.0.
// Sezóny v legende NIE SÚ — ich meno stojí pri mesiaci.
// ════════════════════════════════════════════════════════════════════════════
function Legend({
  layers, solo, tx, typeName,
}: { layers: { log: boolean; prot: boolean; nat: boolean }; solo: boolean; tx: Tx; typeName: (k: LogKind) => string }) {
  const row = (swatch: React.CSSProperties, name: string, desc?: string) => (
    <div className="cal-lg" key={name}>
      <span className="cal-sw" style={swatch} />
      <div><b>{name}</b>{desc && <span>{desc}</span>}</div>
    </div>
  );
  const emo = (e: string, name: string, desc?: string) => (
    <div className="cal-lg" key={`${e}${name}`}>
      <span className="cal-sw" style={{ fontFamily: EMOJI_FONT }}>{e}</span>
      <div><b>{name}</b>{desc && <span>{desc}</span>}</div>
    </div>
  );
  return (
    <>
      {layers.log && (
        <>
          <div className="cal-lgroup">
            <div className="cal-lgtitle">{tx('pack.cal.legendHuman', 'Píše človek')}</div>
            <div className="cal-lgrid">
              {(['trip', 'vet', 'deworm', 'note', 'alone', 'weigh'] as LogKind[]).map((k) => emo(LOG_TYPES[k].emoji, typeName(k)))}
            </div>
          </div>
          <div className="cal-lgroup">
            <div className="cal-lgtitle">{tx('pack.cal.legendAuto', 'Objaví sa samo')}</div>
            <div className="cal-lgrid">
              {emo('🎂', tx('pack.cal.birthday', 'Narodeniny'), tx('pack.cal.birthdayDesc', 'zlatý prstenec'))}
              {emo('🎈', tx('pack.cal.humanYear', 'Ľudský rok'), solo ? tx('pack.cal.humanYearDesc', '1 zo 7') : tx('pack.cal.humanYearPick', 'vyber psa, aby sa ukázal'))}
              {emo(LOG_TYPES.plan.emoji, typeName('plan'), tx('pack.cal.planDesc', 'budúci termín, tenký obrys'))}
              {layers.nat && emo('🌕', tx('pack.cal.full', 'Spln'), tx('pack.cal.fullDesc', 'regenerácia, hojenie'))}
              {layers.nat && emo('🌑', tx('pack.cal.new', 'Nov'), tx('pack.cal.newDesc', 'detoxikácia, očista'))}
            </div>
          </div>
          <div className="cal-lgroup">
            <div className="cal-lgtitle">{tx('pack.cal.legendDensity', 'Sila zelenej = koľko toho bolo')}</div>
            <div className="cal-lgrid">
              {row({ background: calRGBA('log', 0.42) }, tx('pack.cal.one', 'Jeden zápis'))}
              {row({ background: calRGBA('log', 0.66) }, tx('pack.cal.two', 'Dva'))}
              {row({ background: calRGBA('log', 0.92) }, tx('pack.cal.three', 'Tri a viac'))}
              {row({ background: calRGBA('vet', 0.72) }, typeName('vet'), tx('pack.cal.vetWins', 'modrá prebíja — je to druhá otázka roka'))}
            </div>
          </div>
        </>
      )}
      {(layers.prot || layers.nat) && (
        <div className="cal-lgroup">
          <div className="cal-lgtitle">{tx('pack.cal.legendRail', 'Pás období')}</div>
          <div className="cal-lgrid">
            {layers.prot && row({ background: calRGBA('give', 0.15), border: `1px solid ${calRGBA('give', 0.45)}` }, tx('pack.cal.giveGroup', '💊 🌿 Čo podáš'), tx('pack.cal.giveDesc', 'odčervenie, kúry, doplnky'))}
            {layers.prot && row({ background: calRGBA('vet', 0.15), border: `1px solid ${calRGBA('vet', 0.45)}` }, tx('pack.cal.labGroup', '🔬 Čo zmeriaš'), tx('pack.cal.labDesc', 'koprológia, biochémia'))}
            {layers.nat && row({ background: calRGBA('nat', 0.13), border: `1px solid ${calRGBA('nat', 0.4)}` }, `${TICKS.emoji} ${tx('pack.cal.ticks', TICKS.nameSK)}`, tx('pack.cal.ticksDesc', 'apríl – október'))}
          </div>
        </div>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// POPUP DŇA — ČÍTACÍ. Zápis sem pribudne, až keď bude kam ukladať (§3 nákresu);
// tlačidlo, ktoré nič nerobí, je horšie než jeho absencia.
// ⚠️ BEZ KRÍŽIKA (brand lock 2026-08-28): von sa ide klikom mimo alebo Esc.
// ════════════════════════════════════════════════════════════════════════════
function DayPopup({
  year, day, dogs, solo, myElement, seniorSelected, layers, entries, moon, onClose,
  monthName, seasonName, elementName, typeName, protName, tx,
}: {
  year: number; day: { m: number; d: number }; dogs: CalDog[]; solo: boolean;
  myElement: ElementKey | null; seniorSelected: boolean;
  layers: { log: boolean; prot: boolean; nat: boolean };
  entries: CalEntry[]; moon: MoonPhase | null; onClose: () => void;
  monthName: (m: number) => string; seasonName: (k: ElementKey) => string;
  elementName: (k: ElementKey) => string; typeName: (k: LogKind) => string;
  protName: (w: ProtWindow) => string; tx: Tx;
}) {
  const { m, d } = day;
  const s = seasonOf(year, m, d);
  const prots = layers.prot ? protocolOn(year, m, d, seniorSelected) : [];
  const births = layers.log ? birthdaysOn(dogs, m, d) : [];
  const humans = layers.log ? humanYearsOn(year, dogs, m, d, solo) : [];
  const nameOf = (id: string | null): string =>
    id === null ? tx('pack.cal.wholePack', 'celá svorka') : dogs.find((g) => g.id === id)?.name ?? '—';

  let when = `${seasonName(s.key)} · ${elementName(s.key)}${s.key === myElement ? ` — ${tx('pack.cal.hisSeason', 'jeho sezóna')}` : ''}`;
  if (moon) when += ` · ${moon === 'full' ? `${tx('pack.cal.full', 'spln')} 🌕` : `${tx('pack.cal.new', 'nov')} 🌑`}`;
  if (layers.nat && ticksInMonth(m)) when += ` · ${tx('pack.cal.ticks', TICKS.nameSK)} ${TICKS.emoji}`;

  const empty = entries.length === 0 && prots.length === 0 && births.length === 0 && humans.length === 0;

  return (
    <div className="cal-popbg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cal-pop" role="dialog" aria-modal="true">
        <h4>{d}. {monthName(m).toLowerCase()} {year}</h4>
        <div className="cal-when">{when}</div>

        {empty && (
          <p className="cal-note" style={{ marginBottom: 10 }}>
            {tx('pack.cal.emptyDay', 'Tento deň je zatiaľ prázdny. To nie je dlh — je to len deň.')}
          </p>
        )}

        {births.map((g) => (
          <div className="cal-entry" key={`b-${g.id}`}>
            <span className="cal-ico">🎂</span>
            <div>
              <b>{tx('pack.cal.birthday', 'Narodeniny')}</b>
              <p>{g.years !== null ? tx('pack.cal.birthdayLine', '{name} má {years}.').replace('{name}', g.name).replace('{years}', String(g.years)) : g.name}</p>
            </div>
          </div>
        ))}
        {humans.map((g) => (
          <div className="cal-entry" key={`h-${g.id}`}>
            <span className="cal-ico">🎈</span>
            <div>
              <b>{tx('pack.cal.humanYear', 'Ľudský rok')}</b>
              <p>{g.name} — {tx('pack.cal.humanYearLine', 'jeden zo siedmich. Naplánuj niečo.')}</p>
            </div>
          </div>
        ))}
        {entries.map((e, i) => {
          const g = LOG_TYPES[e.kind].group;
          // Bezmenný zápis nesie názov SVOJHO TYPU — nikdy slug ani id.
          const title = e.title || typeName(e.kind);
          const col = g === 'vet' ? `rgb(${CAL_RGB.vet})` : g === 'log' ? `rgb(${CAL_RGB.log})` : T.inkWarm;
          const body = (
            <>
              <b>{title}</b>
              {e.text && <p>{e.text}</p>}
              <p style={{ color: col, marginTop: 3, fontWeight: 600 }}>
                {typeName(e.kind)} · {nameOf(e.dogId)}
              </p>
            </>
          );
          return (
            <div className="cal-entry" key={`e-${i}`}>
              <span className="cal-ico" style={{ fontFamily: EMOJI_FONT }}>{LOG_TYPES[e.kind].emoji}</span>
              {e.href
                ? <a href={e.href} style={{ minWidth: 0, textDecoration: 'none', color: 'inherit' }}>{body}</a>
                : <div style={{ minWidth: 0 }}>{body}</div>}
            </div>
          );
        })}
        {prots.map((w, i) => (
          <div className="cal-entry" key={`p-${w.id}-${i}`} style={{ opacity: 0.85, borderStyle: 'dashed' }}>
            <span className="cal-ico" style={{ fontFamily: EMOJI_FONT }}>{w.emoji}</span>
            <div>
              <b>{protName(w)}</b>
              <p>{tx('pack.cal.protWindow', 'Okno protokolu')} — {rangeTxt(w)} {tx('pack.cal.protHint', 'Odporúčanie, nie termín.')}</p>
            </div>
          </div>
        ))}

        <p className="cal-note" style={{ marginTop: 10, textAlign: 'center' }}>
          {tx('pack.cal.closeHint', 'Klikni mimo bloku alebo Esc')}
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CSS. Rozmery sú prenesené z nákresu 1:1 — tam sa ladili na živých dátach.
// ⚠️ JE TO JS TEMPLATE LITERAL: spätný apostrof v komentári zhodí build a `tsc`
//    to nechytí. Po zásahu pusti `npm run check:css` z `vystupy/web/`.
// ⚠️ Výber JE PRIESVITNÝ TINT, nie plná farba (brand lock 2026-08-26) — plná
//    lapisová plocha je vyhradená jedinému hlavnému CTA na obrazovke a tu žiadne
//    nie je. Čitateľnosť nesie TMAVÝ inkoust a plný rám, nie krytie výplne.
// ════════════════════════════════════════════════════════════════════════════
const CAL_CSS = `
/* Pohľad vľavo, vrstvy na opačnom konci riadku — sú tichšie, je to nastavenie
   viditeľnosti, nie hlavná voľba. */
.cal-ctl{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;margin-bottom:10px}
.cal-layers{display:flex;gap:7px;flex-wrap:wrap;margin-left:auto}
.cal-lay{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;
  font-family:${FONT_UI};font-size:10.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
  cursor:pointer;border:1px solid ${T.border};background:${T.tileBg};color:${T.inkWarm};user-select:none}
/* Vypnutá vrstva je TICHÁ PILULKA, nie preškrtnutá: preškrtnutie hovorí „chyba",
   pritom vypnutá vrstva je legitímny stav, ktorý si človek práve vybral. */
.cal-lay.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.cal-lay .cal-dot{width:8px;height:8px;border-radius:2px;background:currentColor;opacity:.75;flex:0 0 auto}
.cal-dogsel{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
/* Meno psa je na OFICIÁLNYCH povrchoch Cinzel Decorative (DOG ID, certifikát,
   WALL), ale filter kalendára oficiálny povrch NIE JE — brand lock zúžený
   2026-08-14: mapa, zoznamy a bežná prevádzka smú mať meno v obyčajnom Cinzeli. */
.cal-dogpill{font-family:${FONT_TITLE};font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  padding:6px 13px;border-radius:999px;border:1px solid ${T.border};background:${T.tileBg};color:${T.inkWarm};cursor:pointer}
.cal-dogpill.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.cal-note{font-family:${FONT_UI};font-size:10.5px;line-height:1.55;color:${T.inkFaint};margin:0}

/* ── ROK: menovka mesiaca · 31 dní · pás období ─────────────────────────── */
.cal-yr{display:grid;grid-template-columns:76px 1fr 200px;column-gap:9px;row-gap:3px}
.cal-yr-hdnum{display:flex;gap:3px;min-width:0;align-items:flex-end}
.cal-yr-hdnum span{flex:1 1 0;min-width:0;text-align:center;font-family:ui-monospace,Menlo,monospace;font-size:7px;color:${T.inkFaint}}
.cal-yr-hdrail{font-family:${FONT_TITLE};font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:${T.inkFaint};align-self:end;padding-bottom:2px}
.cal-mlbl{display:flex;flex-direction:column;justify-content:center;border-radius:6px;padding:3px 6px;min-width:0}
.cal-mlbl b{font-family:${FONT_TITLE};font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;line-height:1.15}
.cal-mlbl i{font-style:normal;font-size:6.6px;letter-spacing:.05em;text-transform:uppercase;opacity:.9;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cal-mlbl.mine{box-shadow:inset 0 0 0 1.5px currentColor}
.cal-yr-cells{display:flex;gap:3px;min-width:0;align-items:center}
.cal-cell{flex:1 1 0;min-width:0;aspect-ratio:1/1;border-radius:3px;position:relative;cursor:pointer}
.cal-cell.void{background:transparent!important;cursor:default;pointer-events:none}
.cal-cell.ringBirth{box-shadow:inset 0 0 0 1.8px ${T.accentGold}}
.cal-cell.ringHuman{box-shadow:inset 0 0 0 1.2px rgba(201,154,63,.6)}
.cal-cell.isPlan{box-shadow:inset 0 0 0 1.2px rgba(42,22,8,.34)}
/* Mesiac je ROH bunky, nie celá bunka — inak prekryje značku zápisu a deň so
   splnom vyzerá ako deň bez zápisu. */
.cal-cell .moonF,.cal-cell .moonN{position:absolute;top:-1px;right:-1px;width:40%;height:40%;border-radius:50%;
  border:1px solid rgba(107,90,52,.75);box-shadow:0 0 0 1px rgba(247,237,214,.85)}
.cal-cell .moonF{background:#FBF5E6}
.cal-cell .moonN{background:rgba(36,26,9,.62)}
.cal-cell.today{outline:2px solid ${LAPIS.edge};outline-offset:1px}
.cal-rail{grid-column:3;grid-row:2/14;display:grid;grid-template-columns:1fr 1fr 20px;grid-template-rows:repeat(12,1fr);gap:3px;align-self:stretch}
.cal-bar{border-radius:5px;padding:2px 5px;display:flex;align-items:center;gap:4px;font-family:${FONT_UI};font-size:8.5px;font-weight:600;line-height:1.15;overflow:hidden;min-width:0}
.cal-bar span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.cal-bar em{font-style:normal;font-size:10px;flex:0 0 auto}
.cal-barnat{grid-column:3;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:10px}

/* ── MESIAC ─────────────────────────────────────────────────────────────── */
.cal-monav{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:10px}
.cal-monav button{border:1.5px solid ${T.border};background:${T.tileBg};border-radius:8px;width:34px;height:30px;font-size:14px;color:${T.inkWarm};cursor:pointer}
.cal-moname{font-family:${FONT_TITLE};font-size:15px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${T.inkStrong}}
.cal-band{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.cal-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;font-family:${FONT_UI};
  font-size:10.5px;font-weight:600;border:1px solid ${T.border};background:${T.tileBg};color:${T.inkWarm}}
.cal-chip small{font-size:9px;opacity:.75;font-weight:500}
.cal-mogrid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.cal-dow{text-align:center;font-family:${FONT_TITLE};font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:${T.inkFaint};padding-bottom:2px}
/* Bunka mesiaca je NEUTRÁLNA. Sezóna aj okná protokolu sú v pilulkách nad
   mriežkou, takže ich netreba opakovať 31-krát pod sebou — a zápis konečne vidno. */
.cal-mocell{min-height:74px;border-radius:9px;border:1px solid rgba(179,130,45,.30);position:relative;padding:4px;
  display:flex;flex-direction:column;cursor:pointer;background:${T.tileBg};overflow:hidden}
.cal-mocell.out{opacity:.25;cursor:default;pointer-events:none}
.cal-mocell.today{border:1.5px solid ${LAPIS.edge};box-shadow:0 0 0 2px rgba(22,48,122,.14)}
.cal-monum{font-family:ui-monospace,Menlo,monospace;font-size:10px;color:${T.inkWarm};line-height:1}
.cal-momk{margin-top:auto;display:flex;gap:3px;flex-wrap:wrap;font-size:16px;line-height:1}
.cal-momk u{font-style:normal;text-decoration:none;font-family:ui-monospace,Menlo,monospace;font-size:9px;color:${T.inkWarm};align-self:center}
.cal-momoon{position:absolute;top:4px;right:4px;width:9px;height:9px;border-radius:50%;border:1.4px solid #6b5a34}

/* ── POPUP DŇA ──────────────────────────────────────────────────────────── */
.cal-popbg{position:fixed;inset:0;background:rgba(20,12,4,.55);display:flex;align-items:center;justify-content:center;padding:18px;z-index:60}
.cal-pop{background:${T.panelGrad};border:1.5px solid ${T.cardEdge};border-radius:14px;padding:18px 18px 16px;max-width:420px;width:100%;
  box-shadow:${T.panelShadow};max-height:86vh;overflow:auto}
.cal-pop h4{font-family:${FONT_TITLE};font-size:14px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin:0 0 2px;color:${T.inkStrong}}
.cal-when{font-family:${FONT_UI};font-size:11px;color:${T.inkWarm};margin-bottom:12px}
.cal-entry{display:flex;gap:10px;align-items:flex-start;background:${T.tileBg};border:1px solid ${T.border};border-radius:10px;padding:10px 11px;margin-bottom:7px}
.cal-ico{font-size:17px;line-height:1.1;flex:0 0 auto}
.cal-entry b{font-family:${FONT_TITLE};font-size:12px;font-weight:700;letter-spacing:.06em;display:block;margin-bottom:2px;color:${T.inkStrong}}
.cal-entry p{font-family:${FONT_UI};font-size:11.5px;color:${T.inkWarm};margin:0;line-height:1.5}

/* ── LEGENDA ────────────────────────────────────────────────────────────── */
.cal-lgroup{margin-top:16px}
.cal-lgtitle{font-family:${FONT_TITLE};font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:${T.accentGold};margin-bottom:7px}
.cal-lgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(152px,1fr));gap:8px}
.cal-lg{display:flex;gap:8px;align-items:center}
.cal-lg .cal-sw{width:17px;height:17px;border-radius:4px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:11px}
.cal-lg b{font-family:${FONT_TITLE};font-size:11px;font-weight:700;display:block;line-height:1.2;color:${T.inkStrong}}
.cal-lg span{font-family:${FONT_UI};font-size:9.5px;color:${T.inkFaint};display:block}

/* Pás období sa pod 860 px NEZMRŠŤUJE, ale ODCHÁDZA: jeho mená potrebujú šírku
   a v pohľade MESIAC sú tie isté okná ako pilulky nad mriežkou, kde je na ne miesto. */
@media(max-width:860px){
  .cal-yr{grid-template-columns:62px 1fr}
  .cal-rail{display:none}
  .cal-yr-hdrail{display:none}
}
@media(max-width:700px){
  .cal-mocell{min-height:0;aspect-ratio:1/1;padding:3px;border-radius:7px}
  .cal-momk{font-size:12px}
  .cal-mogrid{gap:4px}
  /* Na mobile sa rad vrstiev zalomí na vlastný riadok a margin-left:auto ho
     odtlačí od ľavej hrany — tri rady ovládania by potom začínali na troch
     rôznych miestach. Na šírke telefónu preto zarovnanie vľavo ako ostatné. */
  .cal-layers{margin-left:0}
}
`;
