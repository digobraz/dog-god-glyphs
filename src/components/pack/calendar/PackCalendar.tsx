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
  SEASONS, seasonOf, seasonsInMonth, seasonOfMonth, dim, doy, dateKey, parseFullDay,
  moonDaysOfYear, PROTOCOL, TICKS, visibleProtocol, protocolOn, protocolLanes, ticksInMonth,
  protWholeMonth, protWindowColor, CAL_RGB, calRGBA, hexRGBA, LOG_TYPES, cellFill,
  birthdaysOn, humanYearsOn,
  LIFE_YEARS, LIFE_ACTIVE_YEARS, WEEKS_PER_YEAR, LIFE_WEEKS, LIFE_RECORDS, LIFE_TIPS, weekIndex, weekStart,
  type CalDog, type CalEntry, type LogKind, type MoonPhase, type ProtWindow,
} from './calendarModel';
import { estimateLife, SIZE_NAME_SK, type LifeEstimate } from '@/data/breedLifespan';

const T = PACK_THEME;
const EMOJI_FONT = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

/**
 * Desatinné číslo v jazyku, v ktorom appka práve hovorí. `String(29.5)` dá
 * v slovenčine „29.5", čo je anglická interpunkcia uprostred slovenskej vety.
 * Jazyk berieme z `<html lang>` — `tx` vracia len texty, nie kód jazyka.
 */
const num = (v: number): string => {
  const lang = (typeof document !== 'undefined' && document.documentElement.lang) || 'sk';
  try { return new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(v); }
  catch { return String(v); }
};

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
  /** Vstup do Dogyptu. `created_at` je začiatok flow, platba je o minúty neskôr —
      na mriežke, kde bunka je TÝŽDEŇ, je ten rozdiel neviditeľný. */
  created_at?: string | null;
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

  const [view, setView] = useState<'year' | 'month' | 'life'>(() =>
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
  // ŽIVOTNÁ OS JE VŽDY JEDNÉHO PSA. „Celá svorka" je pre ňu nezmysel — dva psy
  // majú dva rôzne dni narodenia, takže by sa mriežka musela začínať dvakrát.
  // Pri výbere `all` berie prvého psa a pilulka „Celá svorka" v tomto pohľade
  // ZMIZNE, aby sa nedalo vybrať niečo, čo sa nedá nakresliť.
  const lifeRow = useMemo(
    () => (sel === 'all' ? dogs[0] : dogs.find((r) => r.id === sel)) ?? dogs[0],
    [sel, dogs],
  );
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
        const day = parseFullDay(t.date);
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
          y: day.y, m: day.m, d: day.d,
          title: trail?.name || '',
          dogId: null,
          href: trail ? `/pack/map/${trail.country ? trail.country.toLowerCase() : 'svk'}/${slug}` : undefined,
        });
      }
      setTripEntries(out);
    })();
    return () => { alive = false; };
    // ⚠️ BEZ `year` v závislostiach — od 13. 9. 2026 sa zbiera CELÁ história,
    // nie jeden rok. Pohľad ROK si svoj rok filtruje až v `byDay`.
  }, []);

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
          const day = parseFullDay(ev.recordedAt);
          if (!day) continue;
          const kg = typeof ev.value === 'number' ? ev.value : parseFloat(String(ev.value ?? ''));
          if (!kg || Number.isNaN(kg)) continue;
          out.push({ kind: 'weigh', y: day.y, m: day.m, d: day.d, title: `${kg} kg`, dogId: ids[i] });
        }
      });
      setWeighEntries(out);
    })();
    return () => { alive = false; };
  }, [dogs]);

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
        const day = parseFullDay(typeof v === 'string' ? v : null);
        if (!day) continue;
        out.push({ kind: f.kind, y: day.y, m: day.m, d: day.d, title: tx(f.key, f.fb), dogId: row.id });
      }
    }
    return out;
  }, [dogs, latest, tx]);

  // Jeden index na celý rok — mriežka sa pýta 372× „čo je v tento deň".
  const byDay = useMemo(() => {
    const map = new Map<string, CalEntry[]>();
    for (const e of [...tripEntries, ...weighEntries, ...vetEntries]) {
      if (e.y !== year) continue;                                  // pohľad ROK drží jeden rok
      if (e.dogId !== null && solo && e.dogId !== sel) continue;   // cudzieho psa skryjeme
      const k = dateKey(e.m, e.d);
      const arr = map.get(k);
      if (arr) arr.push(e); else map.set(k, [e]);
    }
    return map;
  }, [tripEntries, weighEntries, vetEntries, solo, sel, year]);

  /** CELÁ história pre životnú os — bez filtra roka, s filtrom psa. */
  const allEntries = useMemo(() => [...tripEntries, ...weighEntries, ...vetEntries]
    .filter((e) => !(e.dogId !== null && solo && e.dogId !== sel)),
  [tripEntries, weighEntries, vetEntries, solo, sel]);

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

      {/* Podnadpis pod nadpisom ODIŠIEL 13. 9. 2026 (Matej: „preč pod text pod
          nadpisom"). Vetu „čo sa stalo, čo sa má a čo je vonku" hovorí legenda
          pod mriežkou konkrétnejšie — text ju len predbiehal.
          ⚠️ Kľúč `pack.cal.sub` sa NEMAŽE zo slovníkov, kým sa neoverí, že ho
          nečíta iný povrch. */}
      <div className="flex items-center gap-2.5" style={{ marginBottom: 14 }}>
        <BrandIcon name="bars" size={24} tint="gold" />
        <h2 style={{ fontFamily: FONT_TITLE, fontSize: 24, fontWeight: 700, letterSpacing: '0.14em', color: T.inkStrong, lineHeight: 1.05, textTransform: 'uppercase' }}>
          {tx('pack.cal.title', 'Kalendár')}
        </h2>
      </div>
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
          {(['year', 'month', 'life'] as const).map((v) => (
            <button
              key={v} type="button"
              className={`pf-toggle__opt${view === v ? ' is-on' : ''}`}
              aria-pressed={view === v}
              onClick={() => setView(v)}
            >
              {v === 'year' ? tx('pack.cal.viewYear', 'Rok')
                : v === 'month' ? tx('pack.cal.viewMonth', 'Mesiac')
                  : tx('pack.cal.viewLife', 'Život')}
            </button>
          ))}
        </div>

        {/* V ŽIVOTNEJ osi rad vrstiev ZMIZNE: mriežka nekreslí ani okná protokolu,
            ani fázy mesiaca, takže dve z troch pilulek by neprepínali nič —
            a prepínač, ktorý nič nerobí, sa číta ako pokazený. */}
        <div className="cal-layers" role="group" aria-label={tx('pack.cal.layers', 'Vrstvy')}
          style={view === 'life' ? { display: 'none' } : undefined}>
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
          {view !== 'life' && (
            <button type="button" className={`cal-dogpill${sel === 'all' ? ' on' : ''}`} onClick={() => setSel('all')}>
              {tx('pack.cal.allDogs', 'Celá svorka')}
            </button>
          )}
          {calDogs.map((g) => (
            <button
              key={g.id} type="button"
              className={`cal-dogpill${(view === 'life' ? lifeRow?.id === g.id : sel === g.id) ? ' on' : ''}`}
              onClick={() => setSel(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {view === 'life' ? (
        lifeRow ? (
          <LifeGrid
            row={lifeRow} dogs={shown} entries={allEntries} latest={latest} tx={tx} monthName={monthName}
          />
        ) : null
      ) : view === 'year' ? (
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
      {view !== 'life' && layers.log && !hasAnyEntry && (
        <p className="cal-note" style={{ marginTop: 12 }}>
          {tx('pack.cal.emptyHint', 'Zatiaľ tu nie je ani jeden zápis. Kalendár kreslí len to, čo má DEŇ — výlet s dátumom, očkovanie, váženie.')}
        </p>
      )}

      {/* Legenda hovorí o sezónach, protokole a fázach mesiaca — ŽIVOTNÁ os
          z toho nekreslí nič, takže by pod ňou stála legenda k inému obrázku.
          Vlastnú legendu má životná mriežka v riadku pod sebou. */}
      {view !== 'life'
        ? <Legend layers={layers} solo={solo} tx={tx} typeName={typeName} />
        : <LifeLegend tx={tx} deceased={lifeRow?.life_status === 'deceased' && !!lifeRow?.death_date} />}

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
// ════════════════════════════════════════════════════════════════════════════
// ŽIVOT — 30 rokov × 52 týždňov. Jedna bunka = JEDEN TÝŽDEŇ života psa.
// Zadanie: Matej 13. 9. 2026, predloha „your life in weeks" (engaging-data).
//
// ČO KTORÁ BUNKA ZNAMENÁ (a prečo práve tak):
//   • prežitý týždeň BEZ zápisu → bledá modrá — ubehnutý čas
//   • prežitý týždeň SO zápisom → TMAVÁ — boli ste spolu niekde inde než doma
//   • ešte neprežitý týždeň     → prázdna papyrusová bunka
//   • riadky 20–29              → vyblednuté, to už nie je predpoveď, ale história
//
// ⚠️ TMAVÁ JE ODMENA, NIE HUSTOTA. Prvá úvaha bola škálovať tmavosť počtom
// zápisov, ale to by z mriežky spravilo teplotnú mapu, v ktorej sa týždeň
// s jedným výletom stratí. Jeden zápis = plná tmavá. Koľko ich bolo, povie
// tooltip a popup.
//
// ⚠️ ČIARA PRIEMERU NIE JE PREDPOVEĎ SMRTI. Je to populačný medián hmotnostnej
// triedy plemena (`@/data/breedLifespan`), teda číslo o tisíckach psov, nie
// o tomto. Preto je pod ňou PÁSMO (low–high) a preto appka nikde nepíše dátum.
// ════════════════════════════════════════════════════════════════════════════
function LifeGrid({
  row, dogs, entries, latest, tx, monthName,
}: {
  row: CalendarDogRow; dogs: CalDog[]; entries: CalEntry[]; latest: Latest; tx: Tx;
  monthName: (m: number) => string;
}) {
  const [hover, setHover] = useState<{ wi: number; x: number; y: number } | null>(null);
  const [openWeek, setOpenWeek] = useState<number | null>(null);

  const s = row.selections ?? undefined;
  const by = parseInt(s?.birthdayYear || '', 10) || row.birth_year || 0;
  const bm = parseInt(s?.birthdayMonth || '', 10) || 1;
  const bd = parseInt(s?.birthdayDay || '', 10) || 1;
  const birth = by >= 1990 ? new Date(by, bm - 1, bd) : null;

  // Koniec osi: živý pes → dnes, pes po smrti → deň úmrtia. Mriežka psa, ktorý
  // odišiel, sa nesmie ďalej plniť — bol by to čas, ktorý nikto nežil.
  const deceased = row.life_status === 'deceased' && !!row.death_date;
  const endDate = useMemo(() => (deceased ? new Date(row.death_date as string) : new Date()), [deceased, row.death_date]);

  // ── DVE UDALOSTI NA OSI ────────────────────────────────────────────────
  // „Odkedy sme spolu" = DOG ID pole `basics.since` (rovnaký údaj, aký doklad
  // ukazuje ako „Together since"), NIE nové úložisko.
  // „Odkedy je v Dogypte" = `created_at` riadku psa.
  const sinceRaw = latest[row.id]?.['basics.since']?.value;
  const sinceDate = parseFullDay(typeof sinceRaw === 'string' ? sinceRaw : null);
  const joinDate = parseFullDay(row.created_at);

  const lastWeightRaw = latest[row.id]?.['health.weightKg']?.value;
  const lastWeight = typeof lastWeightRaw === 'number' ? lastWeightRaw
    : parseFloat(String(lastWeightRaw ?? '')) || null;

  const est: LifeEstimate = useMemo(
    () => estimateLife(s?.breed, s?.mixBreed1, s?.mixBreed2, lastWeight),
    [s?.breed, s?.mixBreed1, s?.mixBreed2, lastWeight],
  );

  // Týždne so zápisom. Index je JEDEN pre celú mriežku — 1560 buniek sa nemôže
  // pýtať zoznamu zápisov jedna po druhej.
  const byWeek = useMemo(() => {
    const map = new Map<number, CalEntry[]>();
    if (!birth) return map;
    for (const e of entries) {
      const wi = weekIndex(birth, new Date(e.y, e.m - 1, e.d));
      if (wi < 0 || wi >= LIFE_WEEKS) continue;
      const arr = map.get(wi);
      if (arr) arr.push(e); else map.set(wi, [e]);
    }
    return map;
  }, [entries, birth]);

  if (!birth) {
    return (
      <p className="cal-note" style={{ marginTop: 4 }}>
        {tx('pack.cal.life.noBirth',
          'Životná os potrebuje dátum narodenia. Doplň ho psovi v DOG ID a mriežka sa vykreslí od prvého týždňa.')}
      </p>
    );
  }

  const livedWeeks = Math.max(0, weekIndex(birth, endDate));
  const livedYears = livedWeeks / WEEKS_PER_YEAR;
  const livedDays = Math.max(0, Math.floor((endDate.getTime() - birth.getTime()) / 86_400_000));
  const band = est.band;

  const sinceWeek = sinceDate ? weekIndex(birth, new Date(sinceDate.y, sinceDate.m - 1, sinceDate.d)) : null;
  const joinWeek = joinDate ? weekIndex(birth, new Date(joinDate.y, joinDate.m - 1, joinDate.d)) : null;
  const togetherDays = sinceDate
    ? Math.max(0, Math.floor((endDate.getTime() - new Date(sinceDate.y, sinceDate.m - 1, sinceDate.d).getTime()) / 86_400_000))
    : null;

  // 🕊️ PES PO SMRTI DOSTÁVA INÚ STRÁNKU, nie tú istú s vypnutými kúskami
  // (Matej 13. 9. 2026: „pes po smrti bude mať citlivo len vyplnený celý blok
  // s infom že žil najlepší život a pásmo dožitia priemer"). Mriežka končí na
  // dvadsiatke, zóna rekordov aj rady odchádzajú — rekord je súťaž a rada je
  // budúcnosť, a ani jedno už nemá komu patriť.
  const overMedian = livedYears >= band.median;
  const remainLow = Math.max(0, Math.round((band.low - livedYears) * 10) / 10);
  const remainHigh = Math.max(0, Math.round((band.high - livedYears) * 10) / 10);

  const senior = livedYears >= 8;
  const weighCount = entries.filter((e) => e.kind === 'weigh').length;
  // Do počtu „týždňov spolu vonku" ide len to, čo sa naozaj stalo. Plán
  // v budúcnosti by inak nafúkol číslo, ktoré má byť odmenou za prežité.
  const darkWeeks = [...byWeek.keys()].filter((wi) => wi < livedWeeks).length;

  const gridYears = deceased ? LIFE_ACTIVE_YEARS : LIFE_YEARS;
  const tips = deceased ? [] : LIFE_TIPS.filter((t) => {
    if (t.when === 'always') return true;
    if (t.when === 'senior') return senior;
    if (t.when === 'noWeight') return weighCount === 0;
    if (t.when === 'fewTrips') return darkWeeks < Math.max(4, livedYears * 4);
    if (t.when === 'overMedian') return overMedian;
    return false;
  });

  const hoverEntries = hover ? byWeek.get(hover.wi) ?? [] : [];

  // Popis dňa v týždni na popisky — „14. 4. – 20. 4. 2019".
  const weekLabel = (wi: number): string => {
    const a = weekStart(birth, wi);
    const b = new Date(a.getTime() + 6 * 86_400_000);
    return `${a.getDate()}. ${a.getMonth() + 1}. – ${b.getDate()}. ${b.getMonth() + 1}. ${b.getFullYear()}`;
  };

  return (
    <div className="cal-life">
      {/* ── ZHRNUTIE: tri čísla, nie odsek ───────────────────────────────── */}
      <div className="cal-lifehead">
        {/* DNI, nie roky+týždne. Matej 13. 9.: „v prvom bloku mi chýbajú aj dni
            (livin his best life - xyz dní)". Je to ten istý údaj, aký nesie
            pilulka v psom bloku vyššie (`3 768 DNÍ`) — jedno číslo, dve miesta. */}
        <div className="cal-lifestat">
          <b>{num(livedDays)}</b>
          <span>{deceased
            ? tx('pack.cal.life.daysLived', 'dní najlepšieho života')
            : tx('pack.cal.life.days', 'dní najlepšieho života')}</span>
        </div>
        <div className="cal-lifestat">
          <b>{darkWeeks}</b>
          <span>{tx('pack.cal.life.darkWeeks', 'aktívnych týždňov')}</span>
        </div>
        {togetherDays !== null && (
          <div className="cal-lifestat">
            <b>{num(togetherDays)}</b>
            <span>{tx('pack.cal.life.together', 'dní spolu')}</span>
          </div>
        )}
        {!deceased && (
          <div className="cal-lifestat">
            <b>{overMedian ? '∞' : `${num(remainLow)}–${num(remainHigh)}`}</b>
            <span>{overMedian
              ? tx('pack.cal.life.overMedian', 'nad priemerom plemena')
              : tx('pack.cal.life.remain', 'rokov podľa priemeru')}</span>
          </div>
        )}
      </div>

      {/* 🕊️ Veta pre psa, ktorý odišiel. Stojí NAD mriežkou, nie pod ňou —
          človek, ktorý sem príde, nemá najprv čítať štatistiku. */}
      {deceased && (
        <p className="cal-bestlife">
          {tx('pack.cal.life.bestLife', 'Žil najlepší život.')}
        </p>
      )}

      {/* Odkiaľ je čiara. Bez tejto vety je to číslo z neba. */}
      <p className="cal-note cal-lifesrc">
        {est.basis === 'default'
          ? tx('pack.cal.life.srcNone',
            'Plemeno ani hmotnosť zatiaľ nepoznáme, takže čiara stojí na strednej triede. Doplň plemeno v DOG ID a posunie sa na správne miesto.')
          : `${tx('pack.cal.life.srcPre', 'Pásmo dožitia:')} ${num(band.low)}–${num(band.high)} `
            + `${tx('pack.cal.life.years', 'rokov')} · ${est.labelSK}`
            + (band.fromBreed
              ? ` · ${tx('pack.cal.life.srcBreed', 'publikovaný údaj plemena')}`
              : est.size
                ? ` · ${tx('pack.cal.life.srcWeight', 'odhad podľa hmotnosti')} (${SIZE_NAME_SK[est.size]}, ${band.kgSK})`
                : '')}
      </p>

      {/* ── MRIEŽKA ──────────────────────────────────────────────────────── */}
      <div className="cal-lifewrap">
        <div className="cal-lifegrid" onMouseLeave={() => setHover(null)}>
          {Array.from({ length: gridYears }, (_, yr) => {
            const past = yr >= LIFE_ACTIVE_YEARS;
            // ⚠️ PÁSMO, NIE ČIARA (Matej 13. 9.: „ten median dožitia by som dal
            // ako pásmo od do nie len čiaru v istý rok"). Priemer je rozsah,
            // takže jedna čiara o ňom klamala presnosťou, ktorú nemá. Kreslia sa
            // dve hrany — spodná hranica a horná — a medzi nimi tichý tint.
            //
            // ⚠️ HRANY STOJA VNÚTRI RIADKU, NIE POD NÍM. Verzia s čiarou ako
            // spodnou hranou riadku `floor(x)` ukazovala 10,0 opticky na
            // jedenástke — o celý rok vedľa. `top` podľa desatinnej časti to
            // rieši a zároveň prežije medzeru pred zónou rekordov, ktorú by
            // percento nad celou mriežkou rozhodilo.
            const edges: { key: string; top: string }[] = [];
            if (Math.floor(band.low) === yr) edges.push({ key: 'lo', top: `${(band.low % 1) * 100}%` });
            if (Math.floor(band.high) === yr) edges.push({ key: 'hi', top: `${(band.high % 1) * 100}%` });
            const inBand = yr >= Math.floor(band.low) && yr < Math.ceil(band.high);
            return (
              <Fragment key={yr}>
                <div className={`cal-lifeyr${past ? ' faded' : ''}${inBand ? ' inband' : ''}`}>
                  {yr % 5 === 0 || yr === LIFE_ACTIVE_YEARS ? yr : ''}
                </div>
                <div
                  className={`cal-liferow${past ? ' faded' : ''}${inBand ? ' inband' : ''}${yr === LIFE_ACTIVE_YEARS ? ' zone' : ''}`}
                  data-zone={yr === LIFE_ACTIVE_YEARS
                    ? tx('pack.cal.life.zone', 'Odtiaľto ďalej sa dostala hŕstka psov v histórii')
                    : undefined}
                >
                  {edges.map((e) => (
                    <i
                      key={e.key} className="cal-medline" style={{ top: e.top }}
                      aria-label={`${tx('pack.cal.life.srcPre', 'Pásmo dožitia:')} ${num(band.low)}–${num(band.high)}`}
                    />
                  ))}
                  {Array.from({ length: WEEKS_PER_YEAR }, (__, w) => {
                    const wi = yr * WEEKS_PER_YEAR + w;
                    const lived = wi < livedWeeks;
                    const hits = byWeek.get(wi);
                    // ⚠️ TMAVÁ PATRÍ LEN PREŽITÉMU TÝŽDŇU. Zápis s dátumom
                    // v budúcnosti je PLÁN — nakreslený ako plná tmavá by tvrdil,
                    // že ste tam už boli. Dostáva obrys, tak ako v pohľade ROK.
                    const cls = hits ? (lived ? 'dark' : 'plan') : lived ? 'lived' : 'empty';
                    // Dve udalosti života na osi: ZELENÁ na spodnej hrane =
                    // odkedy ste spolu · ZLATÁ na hornej = odkedy je v Dogypte.
                    // Zlatá je zámerne tá druhá — v brande nesie príslušnosť.
                    const mark = (wi === sinceWeek ? ' mSince' : '') + (wi === joinWeek ? ' mJoin' : '');
                    return (
                      <span
                        key={w}
                        className={`cal-lifecell ${cls}${mark}${wi === livedWeeks ? ' now' : ''}`}
                        onMouseEnter={(ev) => setHover({ wi, x: ev.clientX, y: ev.clientY })}
                        onMouseMove={(ev) => setHover({ wi, x: ev.clientX, y: ev.clientY })}
                        onClick={() => { if (hits) setOpenWeek(wi); }}
                        role={hits ? 'button' : undefined}
                        tabIndex={-1}
                        aria-label={hits ? weekLabel(wi) : undefined}
                      />
                    );
                  })}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* ── ZÓNA REKORDOV — prečo mriežka nekončí na dvadsiatke ───────────── */}
      {!deceased && (
      <div className="cal-records">
        <div className="cal-lgtitle">{tx('pack.cal.life.recTitle', 'Nad dvadsiatkou — psy, ktoré tam naozaj boli')}</div>
        <p className="cal-note" style={{ marginBottom: 9 }}>
          {tx('pack.cal.life.recSub',
            'Vyblednutá časť mriežky nie je predpoveď. Je to miesto, kam sa dostala hŕstka psov — a dôkaz, že priemer nie je strop. Polovica týchto rekordov je doložená, polovica stojí na slove majiteľa; kde chýba dôkaz, je to napísané.')}
        </p>
        <div className="cal-recgrid">
          {LIFE_RECORDS.map((r) => (
            <div className={`cal-rec${r.verified ? '' : ' unver'}`} key={r.name}>
              <b>{r.name}</b>
              <u>{r.exactSK || `${num(r.years)} ${tx('pack.cal.life.years', 'rokov')}`}</u>
              <i>{r.breedSK} · {r.countrySK} · {r.fromTo}</i>
              {/* Neoverený rekord sa NESKRÝVA, ale ani nepredstiera. Značka je
                  jediné, čo ho odlišuje — a je to tá dôležitá časť. */}
              {!r.verified && (
                <em>{tx('pack.cal.life.unverified', 'neoverené — stojí na tvrdení majiteľa')}</em>
              )}
            </div>
          ))}
        </div>
      </div>
      )}

      {/* ── RADY ─────────────────────────────────────────────────────────── */}
      {tips.length > 0 && (
      <div className="cal-records">
        <div className="cal-lgtitle">{tx('pack.cal.life.tipsTitle', 'Čo s tým vieš urobiť')}</div>
        <div className="cal-tipgrid">
          {tips.map((t) => (
            <div className="cal-tip" key={t.id}>
              <em>{t.emoji}</em>
              <div>
                <b>{t.titleSK}</b>
                <p>{t.bodySK}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* ── TOOLTIP pri myši ─────────────────────────────────────────────── */}
      {hover && hoverEntries.length > 0 && (
        <div className="cal-lifetip" style={{ left: hover.x + 14, top: hover.y + 14 }}>
          <b>{weekLabel(hover.wi)}</b>
          {hoverEntries.slice(0, 5).map((e, i) => (
            <span key={i}>{LOG_TYPES[e.kind].emoji} {e.title || tx(LOG_TYPES[e.kind].i18n, LOG_TYPES[e.kind].nameSK)}</span>
          ))}
          {hoverEntries.length > 5 && <span>+{hoverEntries.length - 5}</span>}
        </div>
      )}

      {openWeek !== null && (
        <WeekPopup
          birth={birth} wi={openWeek} entries={byWeek.get(openWeek) ?? []}
          onClose={() => setOpenWeek(null)} monthName={monthName} tx={tx}
          label={weekLabel(openWeek)}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// POPUP TÝŽDŇA — mesačný kalendárik so zvýrazneným týždňom + zápisy.
// Matej: „pri kliku sa zobrazí mesačný kalendárik". Je to VLASTNÁ mriežka,
// nie `MonthGrid` — ten je zviazaný s aktuálnym rokom (sezóny, okná protokolu,
// fázy mesiaca sa počítajú pre `year`), kým tu ide o mesiac spred rokov.
// ════════════════════════════════════════════════════════════════════════════
function WeekPopup({
  birth, wi, entries, onClose, monthName, tx, label,
}: {
  birth: Date; wi: number; entries: CalEntry[]; onClose: () => void;
  monthName: (m: number) => string; tx: Tx; label: string;
}) {
  const start = weekStart(birth, wi);
  const end = new Date(start.getTime() + 6 * 86_400_000);
  // ⚠️ MESIAC BERIEME PODĽA STREDU TÝŽDŇA, nie podľa jeho začiatku. Týždeň
  // 31. 7. – 6. 8. má v júli JEDINÝ deň, takže pri kotve na začiatku popup
  // otvoril júl, zvýraznil v ňom jeden štvorček a zápisy (3. 8.) v mriežke
  // nezvýraznil vôbec — vyzeralo to ako prázdny mesiac s náhodnou bunkou.
  // Stred týždňa vždy padne do mesiaca, ktorý má z týždňa väčšinu dní.
  const anchor = new Date(start.getTime() + 3 * 86_400_000);
  const y = anchor.getFullYear();
  const m = anchor.getMonth() + 1;
  const first = new Date(y, m - 1, 1);
  const lead = (first.getDay() + 6) % 7;                 // pondelok = 0
  const days = dim(y, m);

  const inWeek = (d: number): boolean => {
    const t = new Date(y, m - 1, d).getTime();
    return t >= start.getTime() && t <= end.getTime();
  };
  const entryOn = (d: number): CalEntry[] => entries.filter((e) => e.y === y && e.m === m && e.d === d);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="cal-popbg" onClick={onClose} role="presentation">
      <div className="cal-pop" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h4>{monthName(m)} {y}</h4>
        <div className="cal-when">{label}</div>

        <div className="cal-wkmini">
          {DOW_SK.map((w) => <div className="cal-dow" key={w}>{w}</div>)}
          {Array.from({ length: lead }, (_, i) => <div key={`l${i}`} />)}
          {Array.from({ length: days }, (_, i) => {
            const d = i + 1;
            const hits = entryOn(d);
            return (
              <div key={d} className={`cal-wkday${inWeek(d) ? ' on' : ''}${hits.length ? ' has' : ''}`}>
                <u>{d}</u>
                {hits.length > 0 && <em>{LOG_TYPES[hits[0].kind].emoji}</em>}
              </div>
            );
          })}
        </div>

        {entries.length === 0 ? (
          <p className="cal-note">{tx('pack.cal.life.weekEmpty', 'V tomto týždni nemáš zapísané nič. Prežili ste ho, len o ňom nič nevieme.')}</p>
        ) : entries.map((e, i) => (
          <div className="cal-entry" key={i}>
            <span className="cal-ico">{LOG_TYPES[e.kind].emoji}</span>
            <div style={{ minWidth: 0 }}>
              <b>{e.title || tx(LOG_TYPES[e.kind].i18n, LOG_TYPES[e.kind].nameSK)}</b>
              <p>{e.d}. {e.m}. {e.y}{e.text ? ` · ${e.text}` : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Legenda ŽIVOTNEJ mriežky — stavy bunky a dve značky udalostí. */
function LifeLegend({ tx, deceased }: { tx: Tx; deceased: boolean }) {
  const items: { cls: string; b: string; t: string }[] = [
    { cls: 'lived', b: tx('pack.cal.life.lgLived', 'Prežitý týždeň'), t: tx('pack.cal.life.lgLivedSub', 'ubehnutý čas') },
    { cls: 'dark', b: tx('pack.cal.life.lgDark', 'Boli ste vonku'), t: tx('pack.cal.life.lgDarkSub', 'klik = mesiac') },
    ...(deceased ? [] : [{ cls: 'empty', b: tx('pack.cal.life.lgEmpty', 'Ešte len bude'), t: tx('pack.cal.life.lgEmptySub', 'nezapísaný čas') }]),
    { cls: 'sincesw', b: tx('pack.cal.life.lgSince', 'Odkedy ste spolu'), t: tx('pack.cal.life.lgSinceSub', 'z DOG ID') },
    { cls: 'joinsw', b: tx('pack.cal.life.lgJoin', 'Vstup do Dogyptu'), t: tx('pack.cal.life.lgJoinSub', 'deň heroglyfu') },
    { cls: 'mediansw', b: tx('pack.cal.life.lgMedian', 'Pásmo dožitia'), t: tx('pack.cal.life.lgMedianSub', 'priemer, nie strop') },
  ];
  return (
    <div className="cal-lgroup">
      <div className="cal-lgtitle">{tx('pack.cal.life.legend', 'Ako čítať mriežku')}</div>
      <div className="cal-lgrid">
        {items.map((i) => (
          <div className="cal-lg" key={i.cls}>
            <span className={`cal-sw cal-lifecell ${i.cls}`} />
            <div><b>{i.b}</b><span>{i.t}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
/* ── ŽIVOT: 30 rokov × 52 týždňov ───────────────────────────────────────── */
.cal-life{margin-top:2px}
.cal-lifehead{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px}
.cal-lifestat{flex:1 1 130px;min-width:0;
  background:${T.tileBg};border:1px solid ${T.border};border-radius:10px;padding:9px 12px}
.cal-lifestat b{display:block;font-family:${FONT_TITLE};font-size:21px;font-weight:700;line-height:1.05;color:${T.inkStrong}}
.cal-lifestat b i{font-style:normal;font-size:12px;opacity:.6;margin-right:4px}
.cal-lifestat span{display:block;font-family:${FONT_UI};font-size:9.5px;letter-spacing:.1em;
  text-transform:uppercase;color:${T.inkFaint};margin-top:3px}
.cal-lifesrc{margin-bottom:12px}
/* Veta o psovi, ktorý odišiel. Cinzel a pokoj — nie štatistika, nie tučné. */
.cal-bestlife{font-family:${FONT_TITLE};font-size:15px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:${T.accentGold};text-align:center;margin:2px 0 14px}

/* Mriežka nesmie tlačiť stránku do vodorovného rolovania — 52 buniek sa vojde
   do šírky vždy, lebo bunka je zlomok riadku, nie pevné číslo. */
.cal-lifewrap{overflow:hidden}
.cal-lifegrid{display:grid;grid-template-columns:22px 1fr;row-gap:2px;column-gap:7px;align-items:center}
.cal-lifeyr{font-family:ui-monospace,Menlo,monospace;font-size:8px;color:${T.inkFaint};text-align:right;line-height:1}
.cal-liferow{display:flex;gap:2px;min-width:0;padding-bottom:1px}
/* Vyblednutá zóna 20–30 — história, nie predpoveď. */
.cal-lifeyr.faded{opacity:.4}
.cal-liferow.faded{opacity:.42}
/* Pásmo low–high je TIEŇ, nie druhá čiara: dve čiary by sa čítali ako dva
   priemery. Tichý zlatý podklad hovorí „niekde tu", čiara hovorí „stred". */
/* Pásmo low–high je tichý tint riadku; ČÍSLO roka, v ktorom leží priemer,
   sa navyše rozsvieti zlatou.
   ⚠️ Zvislá zlatá hrana na stĺpci s rokom sa SKÚŠALA a vypadla: čísla sú len
   po piatich, takže na rokoch bez čísla z nej ostal plávajúci zlatý pruh
   a vedľa čísla 10 to vyzeralo ako preškrtnutie. */
.cal-liferow.inband{background:rgba(201,154,63,.13);border-radius:3px}
.cal-lifeyr.inband{color:${T.accentGold};font-weight:700}
.cal-liferow{position:relative}
.cal-medline{position:absolute;left:0;right:0;height:1.5px;background:${T.accentGold};
  border-radius:1px;pointer-events:none;z-index:3;transform:translateY(-0.75px)}
/* Hranica dvadsiatky je PREDEL, nie ďalší riadok mriežky: nad ňou je pes,
   pod ňou je história. Bez nej sa vyblednutá zóna pri prázdnych bunkách
   nedala odlíšiť od zvyšku prázdneho miesta. */
.cal-liferow.zone{position:relative;margin-top:26px}
.cal-liferow.zone::before{content:attr(data-zone);position:absolute;left:0;right:0;top:-21px;
  font-family:${FONT_UI};font-size:8.5px;letter-spacing:.13em;text-transform:uppercase;
  color:${T.accentGold};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.95}
.cal-liferow.zone::after{content:'';position:absolute;left:0;right:0;top:-7px;height:1px;
  background:linear-gradient(90deg,rgba(201,154,63,.55),rgba(201,154,63,0))}
.cal-lifecell{flex:1 1 0;min-width:0;aspect-ratio:1/1;border-radius:1.5px;background:transparent;
  box-shadow:inset 0 0 0 .5px rgba(122,90,42,.22);cursor:default}
/* Prežitý čas = bledá modrá. Je to ten istý lapis, akým appka hovorí „moje" —
   len stiahnutý na tapetu, lebo ubehnutý čas nie je akcia. */
.cal-lifecell.lived{background:rgba(46,95,208,.30);box-shadow:none}
/* Tmavá = boli ste spolu vonku. Plná, neškálovaná — jeden zápis stačí. */
.cal-lifecell.dark{background:#14243F;box-shadow:none;cursor:pointer}
.cal-lifecell.dark:hover{background:${LAPIS.edge};transform:scale(1.55);border-radius:2px;position:relative;z-index:2}
.cal-lifecell.empty{background:rgba(250,244,236,.55)}
/* PLÁN = týždeň, ktorý má zápis, ale ešte neprišiel. Obrys, nie výplň —
   tá istá reč ako .cal-cell.isPlan v pohľade ROK. */
.cal-lifecell.plan{background:rgba(250,244,236,.55);box-shadow:inset 0 0 0 1px ${LAPIS.edge};cursor:pointer}
.cal-lifecell.now{box-shadow:inset 0 0 0 1px ${T.accentGold}}
/* DVE UDALOSTI ŽIVOTA. Sú to HRANY bunky, nie výplň — výplň už nesie „prežité"
   a „boli sme vonku", a tretí význam v tom istom mieste by prepísal jeden z nich.
   Zelená = odkedy ste spolu (spodná hrana) · LAPIS = odkedy je v Dogypte (horná).
   ⚠️ Obe naraz na jednej bunke sa nebijú — každá má svoju hranu.
   ⚠️ Vstup do Dogyptu bol najprv ZLATÝ (zlato = príslušnosť) a bola to chyba:
   pásmo dožitia má zlaté hrany cez celú šírku, takže 6 px zlatý ťah na bunke
   sa čítal ako ich odrobinka. Lapis je navyše presnejší — vstup do svorky je
   ČIN člena, a lapis v brande znamená práve „čo urobím ja". */
.cal-lifecell.mSince{position:relative;z-index:4}
.cal-lifecell.mSince::after{content:'';position:absolute;left:-0.5px;right:-0.5px;bottom:-2px;height:2.5px;
  background:${T.growGreen};border-radius:1px}
.cal-lifecell.mJoin{position:relative;z-index:4}
.cal-lifecell.mJoin::before{content:'';position:absolute;left:-0.5px;right:-0.5px;top:-2px;height:2.5px;
  background:${LAPIS.edge};border-radius:1px}
.cal-sw.cal-lifecell{aspect-ratio:auto;border-radius:4px;flex:0 0 auto}
.cal-sw.cal-lifecell.mediansw{background:rgba(201,154,63,.30);box-shadow:inset 0 2px 0 ${T.accentGold},inset 0 -2px 0 ${T.accentGold}}
.cal-sw.cal-lifecell.sincesw{background:rgba(46,95,208,.30);box-shadow:inset 0 -3px 0 ${T.growGreen}}
.cal-sw.cal-lifecell.joinsw{background:rgba(46,95,208,.30);box-shadow:inset 0 3px 0 ${LAPIS.edge}}

.cal-lifetip{position:fixed;z-index:70;pointer-events:none;max-width:250px;
  background:${T.panelGrad};border:1px solid ${T.cardEdge};border-radius:9px;padding:8px 10px;box-shadow:${T.panelShadow}}
.cal-lifetip b{display:block;font-family:${FONT_TITLE};font-size:10px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:${T.inkStrong};margin-bottom:4px}
.cal-lifetip span{display:block;font-family:${FONT_UI};font-size:11px;color:${T.inkWarm};line-height:1.45;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ── REKORDY a RADY ─────────────────────────────────────────────────────── */
.cal-records{margin-top:18px}
.cal-recgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:9px}
.cal-rec{background:${T.tileBg};border:1px solid ${T.border};border-radius:10px;padding:10px 12px}
.cal-rec b{font-family:${FONT_TITLE};font-size:12.5px;font-weight:700;letter-spacing:.06em;color:${T.inkStrong};
  display:inline-block;margin-right:7px}
.cal-rec u{font-family:${FONT_UI};font-size:11px;font-weight:600;text-decoration:none;color:${T.accentGold}}
.cal-rec i{display:block;font-style:normal;font-family:${FONT_UI};font-size:9.5px;letter-spacing:.04em;
  text-transform:uppercase;color:${T.inkFaint};margin:3px 0 5px}
.cal-rec em{display:block;font-style:normal;font-family:${FONT_UI};font-size:9.5px;line-height:1.4;
  color:${T.alertRed};letter-spacing:.02em}
.cal-rec.unver{opacity:.82}
.cal-tipgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:9px}
.cal-tip{display:flex;gap:10px;background:${T.tileBg};border:1px solid ${T.border};border-radius:10px;padding:11px 12px}
.cal-tip em{font-style:normal;font-size:19px;line-height:1.1;flex:0 0 auto;font-family:${EMOJI_FONT}}
.cal-tip b{display:block;font-family:${FONT_TITLE};font-size:12px;font-weight:700;letter-spacing:.05em;
  color:${T.inkStrong};margin-bottom:3px;line-height:1.25}
.cal-tip p{font-family:${FONT_UI};font-size:11px;line-height:1.55;color:${T.inkWarm};margin:0}

/* ── MINI MESIAC v popupe týždňa ────────────────────────────────────────── */
.cal-wkmini{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:14px}
.cal-wkday{aspect-ratio:1/1;border-radius:6px;border:1px solid rgba(179,130,45,.25);background:${T.tileBg};
  display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative}
.cal-wkday u{font-family:ui-monospace,Menlo,monospace;font-size:9.5px;text-decoration:none;color:${T.inkFaint};line-height:1}
.cal-wkday em{font-style:normal;font-size:11px;line-height:1;font-family:${EMOJI_FONT}}
/* Zvýraznený je TÝŽDEŇ, na ktorý sa kliklo — preto plný lapis tint, nie rám:
   rám by sa bil s rámom dnešného dňa v mriežke mesiaca vedľa. */
.cal-wkday.on{background:rgba(46,95,208,.16);border-color:${LAPIS.edge}}
.cal-wkday.has u{color:${T.inkStrong};font-weight:700}

@media(max-width:700px){
  .cal-lifegrid{column-gap:5px;grid-template-columns:18px 1fr}
  .cal-liferow{gap:1px}
  .cal-lifecell{border-radius:1px}
  /* Bunka má na telefóne ~5 px — kliknúť sa na ňu nedá a hover tam neexistuje.
     Mriežka je tam OBRAZ, nie nástroj; detail týždňa je na PC. */
  .cal-lifecell.dark{cursor:default}
  .cal-lifestat b{font-size:18px}
}

`;
