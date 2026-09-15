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
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PACK_THEME, PACK_BOX, PACK_HEAD, PACK_R, PACK_SHADOW, FONT_TITLE, FONT_UI, PF_FIELD_CSS,
} from '@/components/pack/packTheme';
import { LAPIS, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { AINUBIS } from '@/components/pack/ainubisSkin';
// ⚠️ `ainubis-head.png` (800 px, PRIEHĽADNÉ okolie), NIE `ainubis-badge.png` — badge je
//    odznak v tvare štítu a jeho hranatá silueta sa na tmavom displeji číta ako tmavý
//    štvorec v kruhu (lock 11. 9. 2026). Ten istý zdroj má medailón spodného navu,
//    `Gateways.tsx` aj `MapCoach.tsx`.
import ainubisFace from '@/assets/ainubis-head.png';
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
  LIFE_YEARS, LIFE_ACTIVE_YEARS, WEEKS_PER_YEAR, LIFE_WEEKS, LIFE_RECORDS, LIFE_TIPS,
  TARGET_EXTRA_YEARS, weekIndex, weekStart, ageParts,
  type CalDog, type CalEntry, type LogKind, type MoonPhase, type ProtWindow,
} from './calendarModel';
import { estimateLife, SIZE_NAME_SK, type LifeEstimate } from '@/data/breedLifespan';

const T = PACK_THEME;
const EMOJI_FONT = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

/** Záznam matrice `PACK_BOX` ako CSS text — do template literalu sa spread nedá,
 *  a opísať štyri hodnoty ručne znamená mať ich o mesiac iné než v matrici. */
const boxCSS = (b: { background: string; border: string; borderRadius: number; boxShadow?: string }): string =>
  `background:${b.background};border:${b.border};border-radius:${b.borderRadius}px`
  + (b.boxShadow ? `;box-shadow:${b.boxShadow}` : '');
/** Tvar nadpisu (`PACK_HEAD.*`) ako CSS text. */
const headCSS = (h: typeof PACK_HEAD.card | typeof PACK_HEAD.section): string =>
  `font-family:${h.fontFamily};font-weight:${h.fontWeight};font-size:${h.fontSize}px;`
  + `letter-spacing:${h.letterSpacing};text-transform:${h.textTransform}`;

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

/**
 * SK skloňovanie po číslovke: 1 rok · 2–4 roky · 5+ rokov. Píše sa raz tu,
 * lebo vek sa v mriežke skladá na troch miestach (dlaždica, bublina, popisok)
 * a tri kópie tej istej tabuľky sa rozídu pri prvej oprave.
 */
const plural = (n: number, one: string, few: string, many: string): string =>
  `${n} ${n === 1 ? one : n >= 2 && n <= 4 ? few : many}`;

/** „24. 3. 2019" — deň v tvare, aký appka používa všade inde. */
const fmtDay = (d: Date): string => `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;

/**
 * „10 rokov · 4 mesiace · 2 týždne". Nulové časti VYPADNÚ — „0 rokov 0 mesiacov
 * 3 týždne" je šum, a pri šteňati je práve to najčastejší prípad. Keď je vek
 * kratší než týždeň, ostane aspoň „0 týždňov", nech dlaždica nie je prázdna.
 */
const ageText = (a: { y: number; m: number; w: number }): string => {
  const out: string[] = [];
  if (a.y) out.push(plural(a.y, 'rok', 'roky', 'rokov'));
  if (a.m) out.push(plural(a.m, 'mesiac', 'mesiace', 'mesiacov'));
  if (a.w || out.length === 0) out.push(plural(a.w, 'týždeň', 'týždne', 'týždňov'));
  return out.join(' · ');
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
  /** ZÁLOHA PLEMENA. Flow zapisuje meno na DVE miesta naraz — `selections.breed`
      aj stĺpec `dogs.breed` — a pásmo dožitia stálo len na tom prvom. Pes,
      ktorému sa `selections` nezapísali celé, tak padal až na hmotnostnú triedu
      a hlásil o 1–3 roky kratší život, než má jeho plemeno publikované.
      Obsah je EN meno z `breeds.json` alebo „Mixed" — SK je len zobrazenie. */
  breed?: string | null;
}

const MONTHS_SHORT_SK = ['Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
const MONTHS_LONG_SK = ['Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 'Júl', 'August', 'September', 'Október', 'November', 'December'];
const DOW_SK = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

// ⚠️ ŽIVOT JE HLAVNÝ POHĽAD NA OBOCH ŠÍRKACH (Matej 13. 9. 2026 večer: „tento
// život prehoď ako MAIN = človek ho uvidí ako prvý a potom vie prepínať na rok
// a mesiac"). Predtým otváral mobil MESIAC a PC ROK. Dôvod zmeny je obsahový:
// ROK aj MESIAC ukazujú prevádzku (kedy čo bolo), ŽIVOT ukazuje CELOK — a ten
// je to, kvôli čomu sa sem človek vracia. Preto je aj v prepínači prvý zľava.
// Mobilná výhrada ostáva v platnosti a je v CSS: bunka má na telefóne ~5 px,
// takže tam je mriežka OBRAZ, nie nástroj (klik a hover sú vypnuté).
// ⚠️ Tým padol aj `matchMedia` pri štarte — pohľad už nezávisí od šírky okna,
// takže dve šírky dostanú tú istú prvú obrazovku. Hranica 700 px žije ďalej
// len v CSS (`@media(max-width:700px)` na konci tohto súboru).


/** Dni, ktoré v ročnom pohľade nesú číslo. Zvyšné bunky ostávajú prázdne — pri 31
 *  stĺpcoch na ~250 px sa dvojciferné čísla pri 10 px prekrývajú. */
const DAY_TICKS = new Set([1, 5, 10, 15, 20, 25, 31]);

export function PackCalendar({ dogs, latest, tx }: { dogs: CalendarDogRow[]; latest: Latest; tx: Tx }) {
  const year = new Date().getFullYear();
  const today = useMemo(() => { const n = new Date(); return { m: n.getMonth() + 1, d: n.getDate(), year: n.getFullYear() }; }, []);

  const [view, setView] = useState<'year' | 'month' | 'life'>('life');
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
      <style>{PF_FIELD_CSS}</style>

      {/* Podnadpis pod nadpisom ODIŠIEL 13. 9. 2026 (Matej: „preč pod text pod
          nadpisom"). Vetu „čo sa stalo, čo sa má a čo je vonku" hovorí legenda
          pod mriežkou konkrétnejšie — text ju len predbiehal.
          ⚠️ Kľúč `pack.cal.sub` sa NEMAŽE zo slovníkov, kým sa neoverí, že ho
          nečíta iný povrch. */}
      {/* PREPÍNAČ POHĽADU SEDÍ V PRAVOM HORNOM ROHU BLOKU (Matej 13. 9. 2026:
          „prepínač rok mesiac život daj do pravého horného rohu"). Je to voľba
          OBRAZOVKY, nie nastavenie mriežky — patrí k nadpisu, nie medzi vrstvy.
          Na mobile sa zalomí pod nadpis a zaberie celú šírku, aby sa tri slová
          nestlačili do rohu. */}
      <div className="cal-head">
        <div className="flex items-center gap-3">
          <BrandIcon name="bars" size={24} tint="gold" />
          <h2 style={{ ...PACK_HEAD.card, color: T.inkStrong, lineHeight: 1.05 }}>
            {tx('pack.cal.title', 'Kalendár')}
          </h2>
        </div>
        <div className="pf-toggle inline-flex items-center cal-viewsw" style={{ borderRadius: PACK_R.pill, padding: 4, gap: 4 }}>
          {(['life', 'year', 'month'] as const).map((v) => (
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
      </div>
      {/* ── OVLÁDANIE — TRI TVARY, nie jeden rad ôsmich rovnakých pilulek ─────
           Prvá verzia mala pohľad, psov aj vrstvy ako identické lapisové pilulky
           v jednom rade: osem rovnakých prvkov, z ktorých päť svietilo rovnako,
           takže sa nedalo prečítať, čo je pohľad, čo filter a čo vrstva:
             • POHĽAD  = spojený prepínač v jednej dráhe, ale od 13. 9. 2026 je
               HORE PRI NADPISE (`.cal-head`), nie v tomto rade
             • VRSTVY  = tiché pilulky s bodkou
             • PSY     = vlastný riadok, lapis TINT (výber, nie akcia) */}
      <div className="cal-ctl">
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
          Vlastnú legendu si životná mriežka kreslí sama NAD sebou (13. 9. 2026). */}
      {view !== 'life' && <Legend layers={layers} solo={solo} tx={tx} typeName={typeName} />}

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
          {/* ⚠️ Bunka dňa má na mobile ~4,8 px, najmenšie povolené písmo je 10 px
              (`PACK_TEXT.micro`) — všetkých 31 čísel vedľa seba je nečitateľná kaša
              („1111111111222222…"). Píšu sa preto len ORIENTAČNÉ dni; ostatné bunky
              ostávajú, aby mriežka sedela so stĺpcami pod ňou. */}
          {Array.from({ length: 31 }, (_, i) => (
            <span key={i} className={DAY_TICKS.has(i + 1) ? 'is-tick' : undefined}>{i + 1}</span>
          ))}
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
      <p className="cal-note" style={{ marginTop: 12 }}>
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
      <p className="cal-note" style={{ marginTop: 12 }}>
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
          <p className="cal-note" style={{ marginBottom: 12 }}>
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
              <p style={{ color: col, marginTop: 4, fontWeight: 600 }}>
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

        <p className="cal-note" style={{ marginTop: 12, textAlign: 'center' }}>
          {tx('pack.cal.closeHint', 'Klikni mimo bloku alebo Esc')}
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CSS. Rozmery boli prenesené z nákresu 1:1; 13. 9. 2026 (nákres dizajnového systému,
// 11/11) sa PRICHYTILI na stupnice: polomery `PACK_R`, písmo `PACK_TEXT`, odsadenia
// `PACK_SPACE`, obaly `PACK_BOX` (cez `boxCSS`), nadpisy `PACK_HEAD` (cez `headCSS`).
// ⚠️ Medzery MRIEŽKY (1–3 px medzi bunkami dňa/týždňa) na rebríku NIE SÚ a ostali —
//    52 buniek v riadku 4 px medzeru neunesie; je to hairline, nie odsadenie.
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
  // Pás rekordmanov — šípky ním posúvajú, preto naň treba ref. Krok sa počíta
  // za behu z reálnej šírky: pevné číslo by na mobile (karta 78 %) preskočilo
  // dve karty naraz.
  const recRef = useRef<HTMLDivElement | null>(null);
  const recStep = () => Math.max(160, (recRef.current?.clientWidth ?? 480) - 96);

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

  // `selections.breed` má prednosť (nesie aj polovice kríženca), stĺpec je
  // záchranná sieť pre riadok, ktorému sa selections nezapísali celé.
  const breedName = s?.breed || row.breed || null;
  const est: LifeEstimate = useMemo(
    () => estimateLife(breedName, s?.mixBreed1, s?.mixBreed2, lastWeight),
    [breedName, s?.mixBreed1, s?.mixBreed2, lastWeight],
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
  // ⚠️ DLAŽDICA „ROKOV PODĽA PRIEMERU" ODIŠLA 13. 9. 2026 (Matej: „tam bude
  // stačiť len pásmo v blokoch"). Bolo to pásmo dožitia napísané číslom, teda
  // tá istá predpoveď dvakrát — a v čísle znie oveľa tvrdšie než dve tiché
  // hrany v mriežke. S ňou odišla aj rada „priemer už prekonal", takže
  // `band.median` dnes nečíta nikto; `band.low`/`.high` kreslia hrany.

  const senior = livedYears >= 8;
  // ⚠️ DLAŽDICA „AKTÍVNYCH TÝŽDŇOV" ODIŠLA 13. 9. 2026 (Matej: „tie aktívne
  // týždne daj preč… bude to divne, ako v mojom prípade vyzerá to, že sme celý
  // život nič nerobili"). Kalendár začal zbierať zápisy dnes, takže číslo
  // meria vek KALENDÁRA, nie život psa — a postavené vedľa „4 000 dní" čítalo
  // ako obžaloba. Tmavé bunky v mriežke to isté hovoria bez sčítania.

  const gridYears = deceased ? LIFE_ACTIVE_YEARS : LIFE_YEARS;
  // ŠESŤ STÁLYCH RÁD + siedma pre seniora. Rady o stave kalendára („nemáš
  // váženie", „mriežka je svetlá", „priemer prekonal") odišli 13. 9. 2026 —
  // hovorili o appke, nie o psovi.
  const tips = deceased ? [] : LIFE_TIPS.filter((t) => t.when === 'always' || senior);

  const hoverEntries = hover ? byWeek.get(hover.wi) ?? [] : [];
  // Leží týždeň pod kurzorom v pásme dožitia? Rok života je celé delenie indexu,
  // takže sa to nemusí ťahať cez stav riadku — bublina si to zistí sama.
  // ⚠️ PÁSMO JE INKLUZÍVNE PO `floor(high)` (13. 9. 2026). Kým sa kreslili dve
  // hrany vnútri riadkov, končilo pásmo `< ceil(high)`, teda pri 9–12 rámovalo
  // roky 9, 10, 11 — a v rámiku by potom stálo „9–11", hoci popisok hovorí
  // 9–12. Matej: „daj do rámika čísla, ktorých sa pásmo týka = 9-12".
  const bandFirst = Math.floor(band.low);
  const bandLast = Math.floor(band.high);
  // 🎯 CIEĽOVÉ PÁSMO — päť rokov hneď NAD priemerom (Matej 13. 9. 2026:
  // „pridaj 5 rokov rámik… ten bude zelený"). Začína rokom za horným okrajom
  // priemeru, aby sa rámiky neprekrývali: dva rámiky na tom istom čísle by
  // nepovedali, do ktorého ten rok patrí. Strop je posledný riadok mriežky —
  // pri dlhovekom plemene (napr. 12–16) by inak cieľ vyliezol za tridsiatku.
  // Psovi, ktorý odišiel, sa cieľ nekreslí: nemá komu patriť.
  const tgtFirst = deceased ? -1 : bandLast + 1;
  const tgtLast = Math.min(bandLast + TARGET_EXTRA_YEARS, gridYears - 1);
  // Popis pásma má JEDNO znenie pre dve miesta: bublinu nad blokom a `title`
  // rámika pri číslach rokov. Dva ručne opísané texty by sa rozišli pri prvej
  // úprave zdroja odhadu.
  const bandText = est.basis === 'default'
    ? tx('pack.cal.life.srcNone',
      'Priemerný vek dožitia: plemeno ani hmotnosť zatiaľ nepoznáme, takže odhad stojí na strednej triede. Doplň plemeno v DOG ID.')
    : `${tx('pack.cal.life.srcPre', 'Priemerný vek dožitia:')} ${num(band.low)}–${num(band.high)} `
      + `${tx('pack.cal.life.years', 'rokov')} · ${est.labelSK}`
      + (band.fromBreed
        ? ` · ${tx('pack.cal.life.srcBreed', 'publikovaný údaj plemena')}`
        : est.size
          ? ` · ${tx('pack.cal.life.srcWeight', 'odhad podľa hmotnosti')} (${SIZE_NAME_SK[est.size]}, ${band.kgSK})`
          : '');
  // ⚠️ ODKIAĽ SA ČÍSLO BERIE, MUSÍ BYŤ V POPISKU (Matej 13. 9. 2026: „aj
  // s odkazom, odkiaľ sa čerpá! wikipedia napr."). Wikipédia to ale NIE JE
  // a napísať ju by bolo nepresné: `BREED_LIFESPAN` stojí na publikovaných
  // rozpätiach plemenných klubov (AKC / The Kennel Club), hmotnostné triedy
  // na veterinárnych prehľadoch (UK VetCompass / RVC life tables 2024).
  // Popisok preto menuje ten zdroj, ktorý sa na TENTO odhad naozaj použil.
  const bandTitle = `${bandText}\n${tx('pack.cal.life.bandNote',
    'Je to priemer tisícok psov, nie predpoveď o tomto jednom.')}`
    + `\n${band.fromBreed
      ? tx('pack.cal.life.srcRefBreed', 'Zdroj: publikované rozpätie plemenného klubu (AKC / The Kennel Club).')
      : tx('pack.cal.life.srcRefWeight', 'Zdroj: veterinárne prehľady dožitia podľa hmotnosti (UK VetCompass / RVC life tables).')}`;
  // 🎯 CIEĽ — musí byť počuť, že je to CIEĽ, nie údaj. Tvrdé číslo v ňom je
  // len jedno (Purina, +1,8 roka za štíhlosť); päť je horná hranica súčtu
  // všetkého ostatného. Bez zdroja by to bola nepodložená zdravotná veta.
  const tgtText = `${tx('pack.cal.life.tgtPre', 'Cieľ:')} ${num(bandLast + 1)}–${num(tgtLast)} `
    + `${tx('pack.cal.life.years', 'rokov')} · `
    + tx('pack.cal.life.tgtBody',
      'až päť rokov navyše, ktoré vie pridať holistická starostlivosť — štíhlosť, '
      + 'pohyb v teréne, chrup, spánok a čo najmenej zbytočnej chémie.');
  const tgtTitle = `${tgtText}\n${tx('pack.cal.life.tgtSrc',
    'Hrubý odhad, nie sľub. Zmerané je z toho zatiaľ jedno: samotná štíhlosť pridala '
    + 'labradorom 1,8 roka (Purina Life Span Study, JAVMA 2002).')}`;

  const hoverYear = hover === null ? -1 : Math.floor(hover.wi / WEEKS_PER_YEAR);
  const hoverInBand = hoverYear >= bandFirst && hoverYear <= bandLast;
  const hoverInTarget = tgtFirst >= 0 && hoverYear >= tgtFirst && hoverYear <= tgtLast;

  // Popis dňa v týždni na popisky — „14. 4. – 20. 4. 2019".
  const weekLabel = (wi: number): string => {
    const a = weekStart(birth, wi);
    const b = new Date(a.getTime() + 6 * 86_400_000);
    return `${a.getDate()}. ${a.getMonth() + 1}. – ${b.getDate()}. ${b.getMonth() + 1}. ${b.getFullYear()}`;
  };

  return (
    <div className="cal-life">
      {/* ── ÚVODNÁ VETA (Matej 13. 9. 2026) ───────────────────────────────
          „pod nadpisom kalendár bude krátka veta… nižšie vidíš celý život
          tvojho psa v blokoch… na jednej strane desivé, ale na druhej strane
          nám táto vizualizácia pripomenie, že si treba užiť každý okamih
          a neodkladať veci na potom."
          Je to JEHO text, nie môj opis. Nahradila suchý riadok o mierke
          (`pack.cal.life.scale`) — mierku hovorí druhá veta a tretia dáva
          mriežke dôvod, prečo sa na ňu človek díva.
          ⚠️ Vykresľuje sa LEN v pohľade ŽIVOT: v ROKU a MESIACI by tvrdila
          niečo, čo tam nie je (blok = deň, nie týždeň). */}
      <p className="cal-intro">{tx('pack.cal.life.intro',
        'Nižšie vidíš celý život svojho psa v blokoch. Jeden blok = jeden týždeň, riadok = jeden rok. '
        + 'Na jednej strane je to desivé, na druhej presne tá pripomienka, že si treba užiť každý '
        + 'okamih a neodkladať veci na potom.')}</p>

      {/* ── HLAVIČKA: ČÍSLA VĽAVO POD SEBOU, LEGENDA VPRAVO ────────────────
          Matej 13. 9. 2026: „na ľavú stranu pod seba DNI celkovo a dni spolu,
          a doprava premiestnil legendy". Predtým stáli dlaždice vedľa seba cez
          celú šírku a legenda pod nimi ako tretí pás — tri vodorovné vrstvy
          nad mriežkou, kým na papieri je vedľa seba miesta dosť. */}
      <div className="cal-lifetop">
      <div className="cal-lifehead">
        {/* DNI, nie roky+týždne. Matej 13. 9.: „v prvom bloku mi chýbajú aj dni
            (livin his best life - xyz dní)". Je to ten istý údaj, aký nesie
            pilulka v psom bloku vyššie (`3 768 DNÍ`) — jedno číslo, dve miesta.
            ⚠️ DOPLNENÉ 13. 9. popoludní: pod dňami stojí ten istý čas v ROKOCH,
            MESIACOCH a TÝŽDŇOCH (Matej: „pri bloku s dňami treba dať aj roky
            týždne mesiace"). Štyri tisícky dní nikto nevie preložiť na vek;
            vedľa seba to robí z čísla údaj, ktorý sa dá povedať nahlas.
            ⚠️ CERUZKU NEMÁ, hoci „dní spolu" ju má: dátum narodenia sedí
            v `dogs.selections` z heroglyph flow a v celom `/pack` NEEXISTUJE
            povrch, ktorý by ho vedel zmeniť (doklad ho kreslí medzi read-only
            riadkami). Ceruzka by viedla do prázdna. Ostáva teda „minimálne"
            z Matejovho zadania — dátum na dotyk. */}
        <div className="cal-lifestat" title={`${tx('pack.cal.life.fromBirth', 'Počíta sa od narodenia')}: ${fmtDay(birth)}`}>
          <b>{num(livedDays)}</b>
          <span>{deceased
            ? tx('pack.cal.life.daysLived', 'dní najlepšieho života')
            : tx('pack.cal.life.days', 'dní najlepšieho života')}</span>
          <u>{ageText(ageParts(birth, endDate))}</u>
        </div>
        {togetherDays !== null && sinceDate && (
          /* ✎ VEDIE DO DOG ID, NEEDITUJE TU (Matej: „to by bolo prepojené aj
             z dog id, čiže zmena tam by sa prejavila aj tu"). Je to ten istý
             deep-link, aký má doklad — jeden zdroj, `basics.since`. */
          <div className="cal-lifestat" title={`${tx('pack.cal.life.fromSince', 'Počíta sa od')}: ${fmtDay(new Date(sinceDate.y, sinceDate.m - 1, sinceDate.d))}`}>
            <Link className="cal-statedit" to={`/pack/dogs/quiz/basics?dog=${row.id}&field=basics.since`}
              aria-label={tx('pack.pass.edit', 'edit')}>✎</Link>
            <b>{num(togetherDays)}</b>
            <span>{tx('pack.cal.life.together', 'dní spolu')}</span>
            <u>{fmtDay(new Date(sinceDate.y, sinceDate.m - 1, sinceDate.d))}</u>
          </div>
        )}
      </div>
      <LifeLegend tx={tx} />
      </div>

      {/* 🕊️ Veta pre psa, ktorý odišiel. Stojí NAD mriežkou, nie pod ňou —
          človek, ktorý sem príde, nemá najprv čítať štatistiku. */}
      {deceased && (
        <p className="cal-bestlife">
          {tx('pack.cal.life.bestLife', 'Žil najlepší život.')}
        </p>
      )}

      {/* ⚠️ POPIS PÁSMA DOŽITIA TU NIE JE a nikdy sa sem nevracia (13. 9. 2026).
          Veta „Pásmo dožitia: 9–12 rokov · odhad podľa hmotnosti" bola prvá vec,
          ktorú sa človek o svojom psovi dozvedel — teda odhad, kedy zomrie.
          Pásmo hovorí rámik pri rokoch a bublina na dotyk, nič iné.
          ⚠️ Riadok o mierke (`pack.cal.life.scale`) SPLYNUL s úvodnou vetou
          hore; legenda sa presunula vedľa dlaždíc. */}
      {/* ── MRIEŽKA ──────────────────────────────────────────────────────── */}
      <div className="cal-lifewrap">
        <div className="cal-lifegrid" onMouseLeave={() => setHover(null)}>
          {Array.from({ length: gridYears }, (_, yr) => {
            const past = yr >= LIFE_ACTIVE_YEARS;
            // 🔴 PÁSMO DOŽITIA ODIŠLO Z MRIEŽKY DO ČÍSEL ROKOV (Matej 13. 9. 2026:
            // „tú hranicu/pásmo dožitia daj preč a dávajme ho za okraj blokov =
            // daj do rámika čísla, ktorých sa pásmo týka = 9-12 bude
            // v ohraničenom bloku"). Dve zlaté hrany ležali PRIAMO NA
            // prežitých týždňoch, takže cez život psa viedli dva škrty —
            // predpoveď nakreslená do jeho vlastných dát. V ľavom stĺpci
            // je to tá istá informácia, ale mimo mriežky: rámik povie
            // „týchto rokov sa to týka" a života sa nedotkne.
            const inBand = yr >= bandFirst && yr <= bandLast;
            const inTgt = tgtFirst >= 0 && yr >= tgtFirst && yr <= tgtLast;
            return (
              <Fragment key={yr}>
                {/* ČÍSLO MÁ KAŽDÝ RIADOK (Matej 13. 9.: „do každého riadku daj
                    čísla rokov, nie len 0-5-10"). Po piatich sa nedalo povedať,
                    v ktorom roku života leží konkrétny tmavý týždeň — človek
                    musel počítať riadky od najbližšej päťky. */}
                <div className={`cal-lifeyr${past ? ' faded' : ''}`
                  + (inBand ? ' inband' : '') + (yr === bandFirst ? ' bandtop' : '')
                  + (yr === bandLast ? ' bandbot' : '')
                  + (inTgt ? ' intgt' : '') + (yr === tgtFirst ? ' tgttop' : '')
                  + (yr === tgtLast ? ' tgtbot' : '')}
                  title={inTgt ? tgtTitle : inBand ? bandTitle : undefined}
                >{yr}</div>
                <div
                  className={`cal-liferow${past ? ' faded' : ''}${inBand ? ' inband' : ''}${yr === LIFE_ACTIVE_YEARS ? ' zone' : ''}`}
                  data-zone={yr === LIFE_ACTIVE_YEARS
                    ? tx('pack.cal.life.zone', 'Odtiaľto ďalej sa dostala hŕstka psov v histórii')
                    : undefined}
                >
                  {Array.from({ length: WEEKS_PER_YEAR }, (__, w) => {
                    const wi = yr * WEEKS_PER_YEAR + w;
                    const lived = wi < livedWeeks;
                    const hits = byWeek.get(wi);
                    // ⚠️ TMAVÁ PATRÍ LEN PREŽITÉMU TÝŽDŇU.
                    // ⚠️ V BUDÚCNOSTI SA NEKRESLÍ NIČ OKREM PRÁZDNEHO BLOKU
                    // (Matej 13. 9. popoludní: „nehovoril som ti aby si zrušil
                    // bloky ktoré nenastali, len to že v budúcich blokoch nebude
                    // plán ani nič podobné, ale bloky tam vráť, klasika priesvitné,
                    // naznačené"). Bloky teda ostávajú ako tichý obrys toho, čo
                    // ešte len bude; zmizol z nich iba PLÁN — výlet s dátumom
                    // v budúcnosti tam vyzeral ako prežitý týždeň o rok dopredu.
                    // Plán ďalej vidno v pohľadoch ROK a MESIAC, kde je doma.
                    const cls = lived ? (hits ? 'dark' : 'lived') : 'empty';
                    // ⚠️ DVE UDALOSTI SÚ STAVY, NIE OKAMIHY (Matej 13. 9. 2026:
                    // „dolná zelená čiarka bude od týždňa, čo sú spolu, na každom
                    // bloku, nie len na jednom — a to isté aj Dogypt"). Jediná
                    // čiarka hovorila „v tomto týždni sa niečo stalo"; súvislá
                    // hovorí „odvtedy to platí", čo je to, čo obe udalosti
                    // znamenajú. Podčiarknutie končí na aktuálnom týždni —
                    // do budúcnosti sa „sme spolu" natiahnuť nedá.
                    const upToNow = wi <= livedWeeks;
                    const mark = (upToNow && sinceWeek !== null && wi >= sinceWeek ? ' mSince' : '')
                      + (upToNow && joinWeek !== null && wi >= joinWeek ? ' mJoin' : '');
                    return (
                      <span
                        key={w}
                        className={`cal-lifecell ${cls}${mark}${wi === livedWeeks ? ' now' : ''}`}
                        onMouseEnter={(ev) => setHover({ wi, x: ev.clientX, y: ev.clientY })}
                        onMouseMove={(ev) => setHover({ wi, x: ev.clientX, y: ev.clientY })}
                        onClick={() => { if (hits && lived) setOpenWeek(wi); }}
                        role={hits && lived ? 'button' : undefined}
                        tabIndex={-1}
                        aria-label={weekLabel(wi)}
                      >
                        {wi === livedWeeks && <i className="cal-nowdot" aria-hidden />}
                      </span>
                    );
                  })}
                </div>
              </Fragment>
            );
          })}
        </div>
        {/* Koniec tabuľky. Vlastný prvok POD mriežkou, nie ::after posledného
            riadku: riadok sedí v druhom stĺpci gridu, takže by čiara začala až
            za číslami rokov a mriežka by končila zoseknutá. */}
        <div className="cal-lifeend" aria-hidden />
      </div>

      {/* ── ZÓNA REKORDOV — prečo mriežka nekončí na dvadsiatke ─────────────
          🔴 SPODOK BLOKU JE ODDELENÝ (Matej 13. 9. 2026: „tú časť treba
          «oddeliť» vizuálne, zväčšiť nadpis… treba pekne rozčleniť sekciu,
          zväčšiť tie nadpisy, lebo sa strácajú"). Nad mriežkou sa hovorí
          o TOMTO psovi, pod ňou o dlhovekosti vôbec — dve témy, ktoré tu
          predtým odlišoval len 9,5 px zlatý mikropopisok. */}
      {!deceased && (
      <div className="cal-records cal-sec">
        {/* ⚠️ NADPIS AJ PODNADPIS SÚ MATEJOVE SLOVÁ (13. 9. 2026) — nie môj
            opis. Predošlé znenie („Vyblednutá časť mriežky nie je predpoveď…")
            vysvetľovalo MRIEŽKU, teda vec nad sebou, a rekordmanov podávalo
            ako poznámku pod čiarou k odhadu dožitia. Nové znenie hovorí o tom,
            čo má človek s dlhovekosťou spoločné: rozhodnutia. */}
        <h4 className="cal-sectitle">{tx('pack.cal.life.recTitle', 'Dlhovekosť psov nie je náhoda')}</h4>
        <p className="cal-secsub">
          {tx('pack.cal.life.recSub',
            'Nižšie nájdeš zopár rekordmanov, ktorí sa dožili takmer 30 rokov. Dlhý a šťastný život stojí hlavne na tvojich každodenných rozhodnutiach.')}
        </p>
        {/* JEDEN RIADOK NA SLAJD (Matej 13. 9. 2026: „rekordmanov daj do jedného
            riadku na slajd"). Trinásť kariet v mriežke zabralo pol obrazovky
            a zo zóny rekordov spravilo hlavnú tému stránky — pritom je to
            poznámka pod čiarou k mriežke nad ňou. Vodorovný pás s prichytávaním
            drží jednu výšku a zároveň hovorí „je toho viac, posuň". */}
        {/* ŠÍPKY PO BOKOCH (Matej 13. 9. 2026: „chýbajú šípky po bokoch, nech
            človek vidí, že je to slider"). Odrezaná karta na okraji je signál
            len pre toho, kto ho pozná; šípka to povie priamo. Posúva sa
            o ŠÍRKU VIDITEĽNEJ ČASTI mínus jedna karta, aby na novom zábere
            ostal kúsok predošlej — inak človek stratí, kde bol. */}
        <div className="cal-recwrap">
          <button type="button" className="cal-recarrow left"
            aria-label={tx('pack.cal.life.recPrev', 'Predchádzajúci')}
            onClick={() => recRef.current?.scrollBy({ left: -recStep(), behavior: 'smooth' })}
          >‹</button>
          <button type="button" className="cal-recarrow right"
            aria-label={tx('pack.cal.life.recNext', 'Ďalší')}
            onClick={() => recRef.current?.scrollBy({ left: recStep(), behavior: 'smooth' })}
          >›</button>
        <div className="cal-recgrid" ref={recRef}>
          {LIFE_RECORDS.map((r) => (
            <div className={`cal-rec${r.verified ? '' : ' unver'}`} key={r.name}>
              {/* 🔴 FOTKA JE ZATIAĽ U VŠETKÝCH PRÁZDNA A JE TO ZÁMER (Matej 13. 9.:
                  „k rekordmanom sa hodia aj fotky!"). Sú to snímky skutočných psov
                  s vlastníkom práv; stiahnuť ich odniekiaľ „lebo tam sú" znamená
                  publikovať cudzí obrázok na komerčnom povrchu. Kruh preto ukáže
                  iniciálu — ten istý vzor, aký má appka na chýbajúci avatar —
                  a karta nevyzerá rozbito. Detail v `LifeRecord.photo`. */}
              <div className="cal-rechead">
                <span className={`cal-recphoto${r.patron && !r.photo ? ' pat' : ''}`} aria-hidden>
                  {r.photo
                    ? <img src={r.photo} alt="" />
                    : r.patron
                      ? <img src={`/patrons/${r.patron}.svg`} alt="" />
                      : r.name.slice(0, 1)}
                </span>
                <span className="cal-recname">
                  <b>{r.name}</b>
                  <u>{r.exactSK || `${num(r.years)} ${tx('pack.cal.life.years', 'rokov')}`}</u>
                </span>
              </div>
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
        {/* ⚠️ PÔVOD FOTKY JE PODMIENKA LICENCIE, NIE ZDVORILOSŤ (Matej: „fotky
            stiahni všetky, a uvedieme, odkiaľ sú"). Pri PD/CC snímke je uvedenie
            autora presne to, čo z použitia robí legálne — riadok teda nesmie
            zmiznúť „kvôli čistote". Skladá sa z tých kariet, ktoré fotku majú;
            keď fotku nemá ani jedna, riadok sa nevykreslí. */}
        {LIFE_RECORDS.some((r) => r.photo && r.photoCredit) && (
          <p className="cal-reccredit">
            {LIFE_RECORDS.filter((r) => r.photo && r.photoCredit).map((r) => r.photoCredit).join(' · ')}
          </p>
        )}
      </div>
      )}

      {/* ── RADY ─────────────────────────────────────────────────────────── */}
      {tips.length > 0 && (
      <div className="cal-records cal-sec">
        <h4 className="cal-sectitle">{tx('pack.cal.life.tipsTitle', 'Čo s tým vieš urobiť')}</h4>
        <p className="cal-secsub">{tx('pack.cal.life.tipsSub',
          'Šesť vecí, ktoré rozhodujú viac než plemeno. Nič z toho nestojí peniaze, všetko stojí pozornosť.')}</p>
        {/* ZABALENÉ DO ROZBAĽOVAČIEK (Matej 13. 9. 2026: „tie rady zabaľ do
            dropdownov, nech tam nie je toľko textu"). Šesť odsekov pod sebou
            zaberalo viac miesta než celá mriežka nad nimi — a mriežka je dôvod,
            prečo sem človek prišiel. Nadpis rady je otázka aj odpoveď zároveň,
            takže zavretý zoznam sa dá prečítať celý za pár sekúnd.
            ⚠️ `<details>`, nie vlastný stav: natívne to vie klávesnicu, čítačku
            aj vyhľadávanie v stránke (Cmd+F nájde text v zavretom bloku).
            🔴 Texty sú stále MOJE — Matej: „musíme ich upraviť a prepísať
            spoločne". Toto kolo mení len obal. */}
        <div className="cal-tipgrid">
          {tips.map((t) => (
            <details className="cal-tip" key={t.id}>
              <summary>
                <em>{t.emoji}</em>
                <b>{t.titleSK}</b>
                <i aria-hidden>▾</i>
              </summary>
              <p>{t.bodySK}</p>
            </details>
          ))}
        </div>

        {/* ── KAM TIETO RADY VEDÚ ────────────────────────────────────────────
            Matej 13. 9. 2026: „odkaz na LONGEVITY PROTOKOL / KURZ (bude
            odkazovať na AINUBISOVU DATABÁZU) Čoskoro…".
            ⚠️ NIE JE TO ODKAZ, kým databáza neexistuje — mŕtve tlačidlo, ktoré
            nikam nevedie, je horšie než žiadne. Je to OZNAM, a preto nemá
            `href` ani kurzor ruky. Keď databáza vznikne, zmení sa `<div>` na
            `<Link>` a pilulka ČOSKORO odíde.
            ⚠️ Povrch je AINUBISOV, nie papyrusový: hovorí ON, a jeho meno sa
            píše `<span>AI</span>NUBIS` s cyan prvými dvomi písmenami (lock
            12. 9. 2026) — nie holým textom z prekladu. */}
        <div className="cal-longev">
          {/* HLAVA (Matej 13. 9. večer: „pri longevity protokol chýba AINUBIS logo").
              Bez nej to bol tmavý pruh, ktorý sa ako jeho povrch dal len tušiť —
              a v mene sú jeho jediné dve písmená v cyane. Kruh je ten istý recept
              ako v medailóne: `faceBg` radiála + `faceRing`. */}
          <span className="cal-longev-face" aria-hidden>
            <img src={ainubisFace} alt="" />
          </span>
          <div className="cal-longev-txt">
            <b>{tx('pack.cal.life.protoTitle', 'Longevity protokol')}</b>
            <p>
              {tx('pack.cal.life.protoBody', 'Celý postup, na ktorom týchto pár rád stojí — výživa, záťaž, pokoj a čo si nechať zmerať. Bude žiť v databáze, ktorú stráži ')}
              <span className="cal-ai"><span>AI</span>NUBIS</span>.
            </p>
          </div>
          <span className="cal-soon">{tx('pack.cal.life.protoSoon', 'Čoskoro')}</span>
        </div>
      </div>
      )}

      {/* ── JEDNA BUBLINA NA VŠETKO, ČO O TÝŽDNI VIEME ────────────────────
          Matej 13. 9. popoludní: „pri prejdení myšou na rôzny blok sa zobrazí
          (roky, mesiace, týždne)". Tým prestal platiť pôvodný stav, keď bublina
          vyskočila LEN nad týždňom so zápisom — dnes ju má každý blok a nesie
          vek psa v tom týždni.
          ⚠️ PRETO SÚ BUBLINY ZLÚČENÉ. Kým sa ukazovala len nad zápisom, dala
          sa vedľa nej postaviť druhá pre pásmo dožitia. Odkedy je nad každým
          blokom, by si obe sadli na to isté miesto a jedna by druhú prekryla.
          Pásmo je teraz posledný riadok tej istej bubliny — vyskočí, keď blok
          leží v rokoch pásma, čo je presne tá „hranica priamo pri blokoch". */}
      {hover && (
        <div className="cal-lifetip" style={{ left: hover.x + 14, top: hover.y + 14 }}>
          <b>{ageText(ageParts(birth, weekStart(birth, hover.wi)))}</b>
          <span>{weekLabel(hover.wi)}</span>
          {hoverEntries.map((e, i) => (
            <span key={i}>{LOG_TYPES[e.kind].emoji} {e.title || tx(LOG_TYPES[e.kind].i18n, LOG_TYPES[e.kind].nameSK)}</span>
          ))}
          {hoverInBand && (
            <span className="wrap dim">
              {bandText}
              {est.basis !== 'default' && ` · ${band.fromBreed
                ? tx('pack.cal.life.srcRefShort', 'zdroj: plemenný klub (AKC / The Kennel Club)')
                : tx('pack.cal.life.srcRefShortW', 'zdroj: UK VetCompass / RVC life tables')}`}
            </span>
          )}
          {hoverInTarget && <span className="wrap tgt">{tgtText}</span>}
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
// ── LEGENDA JE LEN O ZNAČKÁCH, NIE O VÝPLNI BUNIEK (13. 9. 2026 popoludní) ──
// Matej: „vysvetlenie stačí takto: Jeden blok = jeden týždeň života. Riadok =
// jeden rok… tmavé políčko = výlet, v legende bude zelený pásik bez bloku,
// spoločný život a z legendy daj preč pásmo dožitia, zelenú guličku bez bloku…
// a nie vstup do dogyptu ale len v dogypte."
//
// Čo z toho plynie: výplň „prežitý týždeň" a pásmo dožitia z legendy odišli —
// prvé povie veta nad mriežkou, druhé sa ozve samo v bubline. Značky udalostí
// majú swatche HOLÉ, bez podkladového bloku: pásik je pásik, gulička gulička.
//
// ⚠️ TMAVÉ POLÍČKO SA VRÁTILO (13. 9. večer, Matej: „z legendy si vyhodil aj
// tmavé políčko… a to znamená aktivita (výlet, váženie, denník…)"). Vyhodil som
// ho spolu s výplňami, lebo vetu „tmavé políčko = výlet" mala niesť veta nad
// mriežkou — lenže tá veta z jeho zadania vypadla, a hlavne: tmavá NIE JE len
// výlet. Je to KAŽDÝ zápis, ktorý ten týždeň má (výlet, váženie, očkovanie,
// odčervenie a neskôr denník), takže to po prvé nemá byť v jednej vete odbavené
// a po druhé sa to slovom „výlet" nedá pomenovať správne.
// Jeho swatch má blok — je to výplň bunky, nie značka na nej.
function LifeLegend({ tx }: { tx: Tx }) {
  const items: { cls: string; b: string; t: string }[] = [
    { cls: 'dark', b: tx('pack.cal.life.lgDark', 'Aktivita'), t: tx('pack.cal.life.lgDarkSub', 'výlet, váženie, zápis') },
    { cls: 'sincesw', b: tx('pack.cal.life.lgSince', 'Spoločný život'), t: tx('pack.cal.life.lgSinceSub', 'z DOG ID') },
    { cls: 'nowsw', b: tx('pack.cal.life.lgNow', 'Tento týždeň'), t: tx('pack.cal.life.lgNowSub', 'práve tu ste') },
    { cls: 'joinsw', b: tx('pack.cal.life.lgJoin', 'V Dogypte'), t: tx('pack.cal.life.lgJoinSub', 'od dňa heroglyfu') },
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
/* Nadpis vľavo, prepínač pohľadu v PRAVOM HORNOM ROHU bloku (13. 9. 2026).
   Na telefóne sa zalomí pod nadpis a roztiahne na celú šírku — tri slová
   stlačené do rohu 360 px displeja sa nedajú trafiť palcom. */
.cal-head{display:flex;align-items:center;justify-content:space-between;gap:8px 16px;flex-wrap:wrap;margin-bottom:16px}
.cal-ctl{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;margin-bottom:12px}
.cal-layers{display:flex;gap:8px;flex-wrap:wrap}
.cal-lay{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;
  font-family:${FONT_UI};font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
  cursor:pointer;border:1px solid ${T.border};background:${T.tileBg};color:${T.inkWarm};user-select:none}
/* Vypnutá vrstva je TICHÁ PILULKA, nie preškrtnutá: preškrtnutie hovorí „chyba",
   pritom vypnutá vrstva je legitímny stav, ktorý si človek práve vybral. */
.cal-lay.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.cal-lay .cal-dot{width:8px;height:8px;border-radius:2px;background:currentColor;opacity:.75;flex:0 0 auto}
.cal-dogsel{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
/* Meno psa je na OFICIÁLNYCH povrchoch Cinzel Decorative (DOG ID, certifikát,
   WALL), ale filter kalendára oficiálny povrch NIE JE — brand lock zúžený
   2026-08-14: mapa, zoznamy a bežná prevádzka smú mať meno v obyčajnom Cinzeli. */
.cal-dogpill{font-family:${FONT_TITLE};font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  padding:8px 12px;border-radius:999px;border:1px solid ${T.border};background:${T.tileBg};color:${T.inkWarm};cursor:pointer}
.cal-dogpill.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.cal-note{font-family:${FONT_UI};font-size:10px;line-height:1.55;color:${T.inkFaint};margin:0}

/* ── ROK: menovka mesiaca · 31 dní · pás období ─────────────────────────── */
.cal-yr{display:grid;grid-template-columns:76px 1fr 200px;column-gap:8px;row-gap:4px}
.cal-yr-hdnum{display:flex;gap:3px;min-width:0;align-items:flex-end}
.cal-yr-hdnum span{flex:1 1 0;min-width:0;text-align:center;font-family:ui-monospace,Menlo,monospace;font-size:10px;color:${T.inkFaint};visibility:hidden}
.cal-yr-hdnum span.is-tick{visibility:visible;overflow:visible;white-space:nowrap}
.cal-yr-hdrail{font-family:${FONT_TITLE};font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${T.inkFaint};align-self:end;padding-bottom:2px}
.cal-mlbl{display:flex;flex-direction:column;justify-content:center;border-radius:8px;padding:4px 8px;min-width:0}
.cal-mlbl b{font-family:${FONT_TITLE};font-size:10px;letter-spacing:.08em;text-transform:uppercase;line-height:1.15}
.cal-mlbl i{font-style:normal;font-size:10px;letter-spacing:.05em;text-transform:uppercase;opacity:.9;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cal-mlbl.mine{box-shadow:inset 0 0 0 1.5px currentColor}
.cal-yr-cells{display:flex;gap:3px;min-width:0;align-items:center}
.cal-cell{flex:1 1 0;min-width:0;aspect-ratio:1/1;border-radius:2px;position:relative;cursor:pointer}
.cal-cell.void{background:transparent!important;cursor:default;pointer-events:none}
.cal-cell.ringBirth{box-shadow:inset 0 0 0 1.8px ${T.accentGold}}
.cal-cell.ringHuman{box-shadow:inset 0 0 0 1.2px rgba(201,154,63,.6)}
.cal-cell.isPlan{box-shadow:inset 0 0 0 1.2px rgba(42,22,8,.34)}
/* Mesiac je ROH bunky, nie celá bunka — inak prekryje značku zápisu a deň so
   splnom vyzerá ako deň bez zápisu. */
.cal-cell .moonF,.cal-cell .moonN{position:absolute;top:-1px;right:-1px;width:40%;height:40%;border-radius:50%;
  border:1px solid rgba(107,90,52,.75);box-shadow:0 0 0 1px rgba(247,237,214,.85)}
.cal-cell .moonF{background:${T.card}}
.cal-cell .moonN{background:rgba(36,26,9,.62)}
.cal-cell.today{outline:2px solid ${LAPIS.edge};outline-offset:1px}
.cal-rail{grid-column:3;grid-row:2/14;display:grid;grid-template-columns:1fr 1fr 20px;grid-template-rows:repeat(12,1fr);gap:3px;align-self:stretch}
.cal-bar{border-radius:8px;padding:4px;display:flex;align-items:center;gap:4px;font-family:${FONT_UI};font-size:10px;font-weight:600;line-height:1.15;overflow:hidden;min-width:0}
.cal-bar span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.cal-bar em{font-style:normal;font-size:10px;flex:0 0 auto}
.cal-barnat{grid-column:3;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px}

/* ── MESIAC ─────────────────────────────────────────────────────────────── */
.cal-monav{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:12px}
.cal-monav button{border:1.5px solid ${T.border};background:${T.tileBg};border-radius:8px;width:34px;height:30px;font-size:14px;color:${T.inkWarm};cursor:pointer}
.cal-moname{font-family:${FONT_TITLE};font-size:16px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${T.inkStrong}}
.cal-band{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.cal-chip{display:inline-flex;align-items:center;gap:8px;padding:4px 12px;border-radius:999px;font-family:${FONT_UI};
  font-size:10px;font-weight:600;border:1px solid ${T.border};background:${T.tileBg};color:${T.inkWarm}}
.cal-chip small{font-size:10px;opacity:.75;font-weight:500}
.cal-mogrid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal-dow{text-align:center;font-family:${FONT_TITLE};font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:${T.inkFaint};padding-bottom:4px}
/* Bunka mesiaca je NEUTRÁLNA. Sezóna aj okná protokolu sú v pilulkách nad
   mriežkou, takže ich netreba opakovať 31-krát pod sebou — a zápis konečne vidno. */
.cal-mocell{${boxCSS(PACK_BOX.row)};min-height:74px;position:relative;padding:4px;
  display:flex;flex-direction:column;cursor:pointer;overflow:hidden}
.cal-mocell.out{opacity:.25;cursor:default;pointer-events:none}
.cal-mocell.today{border:1.5px solid ${LAPIS.edge};box-shadow:0 0 0 2px rgba(22,48,122,.14)}
.cal-monum{font-family:ui-monospace,Menlo,monospace;font-size:10px;color:${T.inkWarm};line-height:1}
.cal-momk{margin-top:auto;display:flex;gap:4px;flex-wrap:wrap;font-size:16px;line-height:1}
.cal-momk u{font-style:normal;text-decoration:none;font-family:ui-monospace,Menlo,monospace;font-size:10px;color:${T.inkWarm};align-self:center}
.cal-momoon{position:absolute;top:4px;right:4px;width:9px;height:9px;border-radius:50%;border:1.4px solid #6b5a34}

/* ── POPUP DŇA ──────────────────────────────────────────────────────────── */
.cal-popbg{position:fixed;inset:0;background:rgba(20,12,4,.55);display:flex;align-items:center;justify-content:center;padding:16px;z-index:60}
.cal-pop{${boxCSS(PACK_BOX.panel)};padding:16px;max-width:420px;width:100%;
  max-height:86vh;overflow:auto}
.cal-pop h4{font-family:${FONT_TITLE};font-size:14px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin:0 0 4px;color:${T.inkStrong}}
.cal-when{font-family:${FONT_UI};font-size:12px;color:${T.inkWarm};margin-bottom:12px}
.cal-entry{${boxCSS(PACK_BOX.row)};display:flex;gap:8px;align-items:flex-start;padding:8px 12px;margin-bottom:8px}
.cal-ico{font-size:16px;line-height:1.1;flex:0 0 auto}
.cal-entry b{font-family:${FONT_TITLE};font-size:12px;font-weight:700;letter-spacing:.06em;display:block;margin-bottom:2px;color:${T.inkStrong}}
.cal-entry p{font-family:${FONT_UI};font-size:12px;color:${T.inkWarm};margin:0;line-height:1.5}

/* ── LEGENDA ────────────────────────────────────────────────────────────── */
.cal-lgroup{margin-top:16px}
/* Názov SEKCIE vnútri karty = PACK_HEAD.section (Space Grotesk 500 / 10 / .22em) —
   do 13. 9. tu bol Cinzel 9,5 px, teda siedmy tvar nadpisu v appke. */
.cal-lgtitle{${headCSS(PACK_HEAD.section)};color:${T.accentGold};margin-bottom:8px}
.cal-lgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(152px,1fr));gap:8px}
.cal-lg{display:flex;gap:8px;align-items:center}
.cal-lg .cal-sw{width:17px;height:17px;border-radius:2px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:12px}
.cal-lg b{font-family:${FONT_TITLE};font-size:12px;font-weight:700;display:block;line-height:1.2;color:${T.inkStrong}}
.cal-lg span{font-family:${FONT_UI};font-size:10px;color:${T.inkFaint};display:block}

/* Pás období sa pod 860 px NEZMRŠŤUJE, ale ODCHÁDZA: jeho mená potrebujú šírku
   a v pohľade MESIAC sú tie isté okná ako pilulky nad mriežkou, kde je na ne miesto. */
@media(max-width:860px){
  .cal-yr{grid-template-columns:62px 1fr}
  .cal-rail{display:none}
  .cal-yr-hdrail{display:none}
}
@media(max-width:700px){
  .cal-mocell{min-height:0;aspect-ratio:1/1}
  .cal-momk{font-size:12px}
  .cal-mogrid{gap:4px}
  /* Prepínač pohľadu na celú šírku — tri rovnaké diely, palcom trafiteľné. */
  .cal-viewsw{width:100%}
  .cal-viewsw .pf-toggle__opt{flex:1 1 0;padding-left:0;padding-right:0}
}
/* ── ŽIVOT: 30 rokov × 52 týždňov ───────────────────────────────────────── */
.cal-life{margin-top:2px}
/* Úvodná veta — Matejov text pod nadpisom bloku. Šírka je obmedzená: riadok
   cez celých 1100 px sa nečíta, oko stratí návrat na začiatok. */
.cal-intro{font-family:${FONT_UI};font-size:12px;line-height:1.6;color:${T.inkWarm};
  max-width:62ch;margin:0 0 16px}
/* ĽAVÁ POLOVICA = ČÍSLA POD SEBOU, PRAVÁ = LEGENDA (13. 9. 2026).
   Pravý stĺpec je širší: legenda má štyri položky s dvoma riadkami textu,
   dlaždice majú jedno číslo. Pri rovnakých dieloch sa legenda lámala na štyri
   riadky, kým vedľa nej stál poloprázdny stĺpec. */
.cal-lifetop{display:grid;grid-template-columns:minmax(0,0.85fr) minmax(0,1.15fr);
  gap:12px 16px;align-items:start;margin-bottom:12px}
.cal-lifehead{display:flex;flex-direction:column;gap:8px;margin-bottom:0}
.cal-lifestat{${boxCSS(PACK_BOX.row)};min-width:0;padding:8px 12px}
.cal-lifestat b{display:block;font-family:${FONT_TITLE};font-size:20px;font-weight:700;line-height:1.05;color:${T.inkStrong}}
.cal-lifestat b i{font-style:normal;font-size:12px;opacity:.6;margin-right:4px}
.cal-lifestat{position:relative}
.cal-lifestat span{display:block;font-family:${FONT_UI};font-size:10px;letter-spacing:.1em;
  text-transform:uppercase;color:${T.inkFaint};margin-top:4px}
/* Prevod veľkého čísla na ľudský vek — tichý riadok pod popiskom, nie druhé
   číslo: dlaždica má jednu hlavnú hodnotu a toto je jej preklad. */
.cal-lifestat u{display:block;font-family:${FONT_UI};font-size:10px;text-decoration:none;
  color:${T.inkWarm};margin-top:4px;line-height:1.35}
/* ✎ vedie do DOG ID, needituje tu — preto je tichá a malá. */
.cal-statedit{position:absolute;top:6px;right:8px;font-size:12px;line-height:1;color:${T.cardEdge};
  text-decoration:none;padding:4px;border-radius:8px}
.cal-statedit:hover{color:${T.inkStrong};background:rgba(201,154,63,.16)}
.cal-lifesrc{margin-bottom:12px}
/* Legenda stojí v pravom stĺpci, takže sa skladá na DVA stĺpce po dvoch —
   pôvodné auto-fit ju v polovičnej šírke natiahlo na štyri riadky. */
.cal-lifetop .cal-lgroup{margin-top:0}
.cal-lifetop .cal-lgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
/* Veta o psovi, ktorý odišiel. Cinzel a pokoj — nie štatistika, nie tučné. */
.cal-bestlife{font-family:${FONT_TITLE};font-size:16px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:${T.accentGold};text-align:center;margin:2px 0 16px}

/* Mriežka nesmie tlačiť stránku do vodorovného rolovania — 52 buniek sa vojde
   do šírky vždy, lebo bunka je zlomok riadku, nie pevné číslo. */
/* ⚠️ Mriežka má po stranách 10 px vzduchu ZÁMERNE: hrany pásma dožitia z nej
   o pol bunky trčia (.cal-medline), a bez rezervy by ich overflow:hidden
   vpravo odrezal a vľavo by naliezli na číslo roka. */
.cal-lifewrap{overflow:hidden;padding:0 12px;margin:0 -12px}
.cal-lifegrid{display:grid;grid-template-columns:22px 1fr;row-gap:2px;column-gap:12px;align-items:center}
.cal-lifeyr{font-family:ui-monospace,Menlo,monospace;font-size:10px;color:${T.inkFaint};text-align:right;line-height:1}
.cal-liferow{display:flex;gap:2px;min-width:0;padding-bottom:1px}
/* Vyblednutá zóna 20–30 — história, nie predpoveď. */
.cal-lifeyr.faded{opacity:.4}
.cal-liferow.faded{opacity:.42}
/* ── PÁSMO DOŽITIA = RÁMIK OKOLO ČÍSEL ROKOV (13. 9. 2026) ────────────────
   🔴 Z MRIEŽKY VON (Matej: „tú hranicu/pásmo dožitia daj preč a dávajme ho za
   okraj blokov = daj do rámika čísla, ktorých sa pásmo týka"). Dve zlaté hrany
   ležali priamo na prežitých týždňoch — predpoveď prekreslená cez život psa.
   Rámik stojí v ľavom stĺpci, teda MIMO mriežky, a hovorí to isté.
   Skladá sa z troch tried, aby to bol JEDEN box cez viac riadkov, nie štyri
   samostatné rámčeky: bočnice má každý riadok pásma, hornú hranu prvý,
   spodnú posledný.
   ⚠️ ČÍSLO MUSÍ VYPLNIŤ CELÝ RIADOK (align-self:stretch), inak je vysoké
   len ako písmo (8 px) a rámik sa medzi rokmi rozpadne na štyri visiace
   zátvorky.
   🔴 RÁMIK KRESLÍ ::before, NIE SAMOTNÉ ČÍSLO (Matej 13. 9.: „nepáči sa mi,
   že z ľavej strany je vyššie než z pravej"). Prvá verzia zošívala 2 px
   medzeru medzi riadkami záporným marginom, lenže ten prvok naozaj POSUNIE —
   orámované číslo sedelo o 1 px vyššie než jeho riadok buniek, teda ľavá
   strana bola oproti pravej posunutá hore. Odmerané: číslo 11 malo top
   1672,23 px, jeho riadok 1673,23 px. Pseudo-prvok sa smie roztiahnuť cez
   medzeru (top:-1px; bottom:-1px) bez toho, aby s číslom pohol. */
.cal-liferow{position:relative}
.cal-lifeyr.inband{color:${T.accentGold};opacity:1;position:relative;
  align-self:stretch;display:flex;align-items:center;justify-content:flex-end}
/* ⚠️ BEZ z-index:-1 A BEZ VÝPLNE. Prvá verzia mala jemný zlatý tint a pseudo-prvok
   poslala pod obsah — a tam zmizol úplne: najbližší stacking context nie je
   papyrusová karta, takže sa vrstva schovala za jej pozadie a ostalo len zlaté
   písmo bez rámika. Samotné čiary smú stáť NAD číslom, lebo ležia na okrajoch. */
.cal-lifeyr.inband::before{content:'';position:absolute;left:-3px;right:-2px;top:-1px;bottom:-1px;
  pointer-events:none;
  box-shadow:inset 1px 0 0 ${T.accentGold},inset -1px 0 0 ${T.accentGold}}
.cal-lifeyr.inband.bandtop::before{top:0;border-radius:2px 2px 0 0;
  box-shadow:inset 1px 0 0 ${T.accentGold},inset -1px 0 0 ${T.accentGold},inset 0 1px 0 ${T.accentGold}}
.cal-lifeyr.inband.bandbot::before{bottom:0;border-radius:0 0 2px 2px;
  box-shadow:inset 1px 0 0 ${T.accentGold},inset -1px 0 0 ${T.accentGold},inset 0 -1px 0 ${T.accentGold}}
.cal-lifeyr.inband.bandtop.bandbot::before{box-shadow:inset 0 0 0 1px ${T.accentGold};border-radius:2px}
/* ── 🎯 CIEĽOVÉ PÁSMO = ZELENÝ RÁMIK HNEĎ POD ZLATÝM (13. 9. 2026) ────────
   Matej: „pridaj 5 rokov rámik… ten bude zelený a bude hovoriť: pridaj až
   extra 5 rokov super starostlivosťou (target – longevity)".
   Zlatý rámik hovorí, čo je PRIEMER; zelený, čo je CIEĽ. Zelená je tá istá,
   akou appka inde značí „splnené" a „tip od svorky" (T.growGreen), takže
   nesie rovnaký význam: toto sa dá dosiahnuť.
   ⚠️ Recept je zhodný so zlatým rámikom vrátane ::before — pozri poznámku
   vyššie o zápornom margine a o z-index:-1. Kto sem pridá tretie pásmo,
   kopíruje TENTO tvar, nie vlastné čísla. */
.cal-lifeyr.intgt{color:${T.growGreen};opacity:1;position:relative;
  align-self:stretch;display:flex;align-items:center;justify-content:flex-end}
.cal-lifeyr.intgt::before{content:'';position:absolute;left:-3px;right:-2px;top:-1px;bottom:-1px;
  pointer-events:none;
  box-shadow:inset 1px 0 0 ${T.growGreen},inset -1px 0 0 ${T.growGreen}}
.cal-lifeyr.intgt.tgttop::before{top:0;border-radius:2px 2px 0 0;
  box-shadow:inset 1px 0 0 ${T.growGreen},inset -1px 0 0 ${T.growGreen},inset 0 1px 0 ${T.growGreen}}
.cal-lifeyr.intgt.tgtbot::before{bottom:0;border-radius:0 0 2px 2px;
  box-shadow:inset 1px 0 0 ${T.growGreen},inset -1px 0 0 ${T.growGreen},inset 0 -1px 0 ${T.growGreen}}
/* Vyblednutá zóna 20+ nesmie zhasnúť cieľ: pri dlhovekom plemene doň zasahuje. */
.cal-lifeyr.intgt.faded,.cal-lifeyr.inband.faded{opacity:.75}
/* Hranica dvadsiatky je PREDEL, nie ďalší riadok mriežky: nad ňou je pes,
   pod ňou je história. Bez nej sa vyblednutá zóna pri prázdnych bunkách
   nedala odlíšiť od zvyšku prázdneho miesta. */
.cal-liferow.zone{position:relative;margin-top:24px}
.cal-liferow.zone::before{content:attr(data-zone);position:absolute;left:0;right:0;top:-20px;
  font-family:${FONT_UI};font-size:10px;letter-spacing:.13em;text-transform:uppercase;
  color:${T.accentGold};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.95}
.cal-liferow.zone::after{content:'';position:absolute;left:0;right:0;top:-7px;height:1px;
  background:linear-gradient(90deg,rgba(201,154,63,.55),rgba(201,154,63,0))}
/* KONIEC TABUĽKY (Matej 13. 9. 2026: „pod 30 riadkom treba urobiť vizuálnu
   čiaru, koniec tabuľky"). Bez nej sa posledný riadok prázdnych buniek stratil
   v papyruse a mriežka nikde nekončila — jednoducho prestala byť. Čiara ide
   cez celú šírku riadku, teda vrátane stĺpca s číslami. */
.cal-lifeend{height:1px;margin:8px 0 0;
  background:linear-gradient(90deg,rgba(201,154,63,.12),rgba(201,154,63,.55) 10%,rgba(201,154,63,.55) 90%,rgba(201,154,63,.12))}
.cal-lifecell{flex:1 1 0;min-width:0;aspect-ratio:1/1;border-radius:2px;background:transparent;
  box-shadow:inset 0 0 0 .5px rgba(122,90,42,.22);cursor:default;position:relative}
/* Prežitý čas = bledá modrá. Je to ten istý lapis, akým appka hovorí „moje" —
   len stiahnutý na tapetu, lebo ubehnutý čas nie je akcia. */
.cal-lifecell.lived{background:rgba(46,95,208,.30);box-shadow:none}
/* Tmavá = boli ste spolu vonku. Plná, neškálovaná — jeden zápis stačí. */
.cal-lifecell.dark{background:#14243F;box-shadow:none;cursor:pointer}
.cal-lifecell.dark:hover{background:${LAPIS.edge};transform:scale(1.55);border-radius:2px;position:relative;z-index:2}
/* BUDÚCI TÝŽDEŇ = NAZNAČENÝ BLOK (Matej 13. 9. popoludní: „bloky tam vráť,
   klasika priesvitné, naznačené"). Nie je to biely štvorec ako predtým, ale
   ani prázdno: tichý obrys bez výplne. Vidno, že mriežka pokračuje, a pritom
   sa to nebije s prežitým časom, ktorý jediný má farbu. */
.cal-lifecell.empty{background:rgba(250,244,236,.34);box-shadow:inset 0 0 0 .5px rgba(122,90,42,.16)}
/* ── AKTUÁLNY TÝŽDEŇ = PULZUJÚCA ZELENÁ BODKA (13. 9. 2026) ────────────────
   Zlatý obrys bunky zanikol medzi hranami pásma aj podčiarknutiami udalostí —
   a hlavne stál na tom istom mieste ako výplň, takže na ňom nebolo čo chytiť
   okom. Bodka je VLASTNÝ prvok nad bunkou: jediná vec v mriežke, ktorá sa hýbe,
   preto oko padne presne na „tu sme teraz".
   ⚠️ Nesmie to byť ::before ani ::after — obe sú obsadené podčiarknutiami
   „odkedy sme spolu" a „odkedy je v Dogypte", a práve aktuálny týždeň ich má
   spravidla obe. */
.cal-lifecell.now{box-shadow:none}
.cal-nowdot{position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;
  border-radius:50%;background:${T.growGreen};z-index:6;pointer-events:none;
  box-shadow:0 0 0 1.5px rgba(250,244,236,.9);animation:calNowPulse 1.9s ease-in-out infinite}
@keyframes calNowPulse{
  0%,100%{transform:scale(1);box-shadow:0 0 0 1.5px rgba(250,244,236,.9),0 0 0 0 rgba(61,122,78,.55)}
  55%{transform:scale(1.25);box-shadow:0 0 0 1.5px rgba(250,244,236,.9),0 0 0 5px rgba(61,122,78,0)}
}
@media(prefers-reduced-motion:reduce){.cal-nowdot{animation:none}}
/* ── DVE UDALOSTI ŽIVOTA = DVE SÚVISLÉ ČIARY POD/NAD MRIEŽKOU ─────────────
   Sú to HRANY bunky, nie výplň — výplň už nesie „prežité" a „boli sme vonku",
   a tretí význam v tom istom mieste by prepísal jeden z nich.
   Zelená = odkedy ste spolu (spodná hrana) · LAPIS = odkedy je v Dogypte (horná).
   ⚠️ Obe naraz na jednej bunke sa nebijú — každá má svoju hranu.
   ⚠️ ČIARA BEŽÍ OD TEJ UDALOSTI ĎALEJ, nie len na jednej bunke (Matej 13. 9. 2026:
   „dolná zelená čiarka bude od týždňa, čo sú spolu, na každom bloku, nie len na
   jednom — a to isté aj Dogypt"). Jedna čiarka hovorila „v tomto týždni sa niečo
   stalo"; súvislá hovorí „odvtedy to platí", čo je presne to, čo obe udalosti
   znamenajú. Preto presah -1.5 px na oboch stranách: medzera medzi bunkami je
   2 px a bez preklenutia by z čiary bola bodkovaná čiara.
   ⚠️ Vstup do Dogyptu bol najprv ZLATÝ (zlato = príslušnosť) a bola to chyba:
   pásmo dožitia má zlaté hrany cez celú šírku, takže zlatý ťah na bunke sa
   čítal ako ich odrobinka. Lapis je navyše presnejší — vstup do svorky je
   ČIN člena, a lapis v brande znamená práve „čo urobím ja". */
/* ⚠️ ČIARA LEŽÍ VNÚTRI BUNKY (bottom/top:0), NIE V MEDZERE POD ŇOU. Kým to bola
   jedna čiarka na jednej bunke, sedela v 2 px medzere medzi riadkami a bolo to
   v poriadku. Len čo beží cez celý riadok a cez desať riadkov pod sebou, tá istá
   medzera je jediné, čo riadky oddeľuje — a mriežka sa zmenila na linajkový
   papier, v ktorom sa stratili tmavé týždne. Vnútri bunky je z toho podčiarknutie
   modrých buniek, teda vlastnosť času, nie mreža cez obrázok. */
.cal-lifecell.mSince{z-index:4}
.cal-lifecell.mSince::after{content:'';position:absolute;left:-1.5px;right:-1.5px;bottom:0;height:1.5px;
  background:${T.growGreen}}
.cal-lifecell.mJoin{z-index:4}
.cal-lifecell.mJoin::before{content:'';position:absolute;left:-1.5px;right:-1.5px;top:0;height:1.5px;
  background:${LAPIS.edge}}
/* ── SWATCH = HOLÁ ZNAČKA, BEZ BLOKU POD ŇOU (13. 9. 2026 popoludní) ──────
   Matej: „v legende bude zelený pásik bez bloku… zelenú guličku bez bloku".
   Modrý štvorček pod značkou hovoril „prežitý týždeň", teda tretiu vec, ktorú
   legenda nevysvetľuje — a pásik sa v ňom čítal ako jeho spodná hrana, nie
   ako samostatná značka. Bez neho je swatch presne to, čo v mriežke vidno. */
.cal-sw.cal-lifecell{aspect-ratio:auto;border-radius:0;flex:0 0 auto;
  background:transparent;box-shadow:none;display:flex;align-items:center;justify-content:center}
/* Aktivita je VÝPLŇ bunky, nie značka na nej — jej swatch má teda blok. */
.cal-sw.cal-lifecell.dark{width:17px;height:17px;border-radius:2px;background:#14243F}
.cal-sw.cal-lifecell.sincesw{height:3px;border-radius:2px;background:${T.growGreen}}
.cal-sw.cal-lifecell.joinsw{height:3px;border-radius:2px;background:${LAPIS.edge}}
.cal-sw.cal-lifecell.nowsw{background:transparent}
.cal-sw.cal-lifecell.nowsw::after{content:'';width:7px;height:7px;border-radius:50%;background:${T.growGreen};
  box-shadow:0 0 0 1.5px rgba(250,244,236,.9);animation:calNowPulse 1.9s ease-in-out infinite}

.cal-lifetip{${boxCSS(PACK_BOX.panel)};position:fixed;z-index:70;pointer-events:none;max-width:250px;padding:8px 12px}
.cal-lifetip b{display:block;font-family:${FONT_TITLE};font-size:10px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:${T.inkStrong};margin-bottom:4px}
.cal-lifetip span{display:block;font-family:${FONT_UI};font-size:12px;color:${T.inkWarm};line-height:1.45;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* Bublina pásma nesie vetu, nie zoznam položiek — orezanie tromi bodkami by
   z vysvetlenia spravilo hádanku. */
.cal-lifetip span.wrap{white-space:normal;overflow:visible;text-overflow:clip}
.cal-lifetip span.dim{color:${T.inkFaint};font-size:10px;margin-top:4px}
/* Cieľ je zelený aj v bubline — tá istá farba ako jeho rámik, inak si človek
   nespojí, ktorý z dvoch rámikov práve číta. */
.cal-lifetip span.tgt{color:${T.growGreen};font-size:10px;margin-top:4px}

/* ── REKORDY a RADY ─────────────────────────────────────────────────────── */
.cal-records{margin-top:16px}
/* ── SPODNÁ ČASŤ BLOKU = VLASTNÉ SEKCIE (13. 9. 2026) ─────────────────────
   Matej: „tú časť treba oddeliť vizuálne, zväčšiť nadpis… zväčšiť tie nadpisy,
   lebo sa strácajú". Nadpis sekcie mal 9,5 px a rovnaký tvar ako popisok
   legendy, takže sa čítal ako menovka, nie ako nová téma.
   Oddelenie nesie zlatá čiara + vzduch, nie rám: ďalší rámik vnútri papyrusovej
   karty by robil kartu v karte. */
.cal-sec{margin-top:24px;padding-top:24px;position:relative}
.cal-sec::before{content:'';position:absolute;left:0;right:0;top:0;height:1px;
  background:linear-gradient(90deg,rgba(201,154,63,.10),rgba(201,154,63,.5) 10%,rgba(201,154,63,.5) 90%,rgba(201,154,63,.10))}
/* Nadpis sekcie v Cinzeli = PACK_TEXT.h2 (20). Matej 13. 9. žiadal ZVÄČŠIŤ, takže
   tichý eyebrow (PACK_HEAD.section) tu nie je na mieste. */
.cal-sectitle{font-family:${FONT_TITLE};font-size:20px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:${T.inkStrong};margin:0 0 8px;line-height:1.25}
.cal-secsub{font-family:${FONT_UI};font-size:12px;line-height:1.6;color:${T.inkWarm};
  max-width:66ch;margin:0 0 12px}
/* ── REKORDMANI = JEDEN RIADOK NA SLAJD (13. 9. 2026) ─────────────────────
   Trinásť kariet v mriežke auto-fill zabralo na PC štyri rady a zo zóny
   rekordov spravilo hlavnú tému stránky. Vodorovný pás drží jednu výšku,
   prichytáva sa po kartách a samotným odrezaním poslednej karty hovorí
   „je toho viac". Karta má PEVNÚ šírku — flex-basis:auto by ju nafúkol
   podľa najdlhšieho názvu plemena. */
/* Obal pásu — drží šípky. Musí byť position:relative, inak sa pripnú na kartu. */
.cal-recwrap{position:relative}
.cal-recarrow{position:absolute;top:calc(50% - 4px);transform:translateY(-50%);z-index:3;
  width:28px;height:28px;border-radius:50%;display:grid;place-items:center;cursor:pointer;
  background:${T.card};border:1px solid ${T.cardEdge};color:${T.inkStrong};
  font-size:16px;line-height:1;padding:0 0 2px;
  box-shadow:0 2px 8px rgba(90,62,20,.22)}
.cal-recarrow:hover{background:#FFFDF6;border-color:${T.accentGold}}
.cal-recarrow.left{left:0}
.cal-recarrow.right{right:0}
/* Šípka NESMIE LEŽAŤ NA TEXTE karty. Pás preto dostane po stranách odsadenie
   presne na jej šírku — v skrolovacom kontajneri sa padding správa ako vzduch
   pred prvou a za poslednou kartou, takže sa nič neoreže a šípka má kam sadnúť.
   Odsadenie sa pridáva len tam, kde šípky sú: na dotykovom displeji by
   zbytočne ujedalo šírku. */
/* ⚠️ K PADDINGU PATRÍ scroll-padding, INAK SI HO SNAP HNEĎ ODROLUJE.
   scroll-snap-align:start zarovnáva kartu na začiatok SNAPPORTU, a ten je
   štandardne padding-box — prehliadač preto pás pri načítaní sám posunul
   o tých 34 px a karta skončila zase pod šípkou. Odmerané: padding sedel
   (34 px), a karta aj tak začínala na nule. */
@media(hover:hover){.cal-recgrid{padding-left:34px;padding-right:34px;
  scroll-padding-left:34px;scroll-padding-right:34px}}
/* Na dotykovom displeji je gesto prirodzené a šípky by len zakrývali karty. */
@media(hover:none){.cal-recarrow{display:none}}
.cal-recgrid{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;
  scroll-snap-type:x proximity;padding-bottom:8px;scrollbar-width:thin;
  scrollbar-color:rgba(201,154,63,.45) transparent;overscroll-behavior-x:contain}
.cal-recgrid::-webkit-scrollbar{height:6px}
.cal-recgrid::-webkit-scrollbar-thumb{background:rgba(201,154,63,.45);border-radius:2px}
.cal-recgrid::-webkit-scrollbar-track{background:transparent}
/* ── KARTA REKORDMANA JE BLEDÁ, NIE PIESKOVÁ (13. 9. 2026) ────────────────
   Matej: „tie bloky so psami daj bledou/bielou, trochu to treba oživiť,
   vyzerá to otrasne." Karty stáli na tokene tileBg, teda takmer na tom istom
   piesku ako papyrus pod nimi — trinásť obdĺžnikov bez hrany. Svetlejšia
   výplň ich zdvihne z podkladu, zlatý rám im dá tvar a tieň hĺbku.
   Nie je to nová farba: #FFFDF6 je papyrusová biela, ktorú appka už
   používa (.pf-field--flat je jej o odtieň tmavší súrodenec). */
/* ⚠️ Výplň NIE JE z matrice (Matejova bledá z 13. 9.); rám, radius a tieň už áno. */
.cal-rec{background:linear-gradient(160deg,#FFFDF6,${T.card});
  border:1px solid ${T.cardEdge};border-radius:${PACK_R.tile}px;padding:12px;
  flex:0 0 232px;scroll-snap-align:start;
  box-shadow:${PACK_SHADOW.lift}}
.cal-rechead{display:flex;align-items:center;gap:8px;margin-bottom:4px}
/* Kruh drží rozmer aj bez fotky — s iniciálou vnútri. Prázdny slot, ktorý
   zmizne, by posunul text a karty by mali každá inú výšku. */
.cal-recphoto{flex:0 0 auto;width:38px;height:38px;border-radius:50%;overflow:hidden;
  display:grid;place-items:center;background:${T.panelGrad};border:1px solid ${T.cardEdge};
  font-family:${FONT_TITLE};font-size:16px;font-weight:700;color:${T.accentGold};
  line-height:1;user-select:none}
.cal-recphoto img{width:100%;height:100%;object-fit:cover;display:block}
/* Silueta plemena nie je fotka — nesmie sa orezávať na kruh, musí sa doň
   zmestiť celá, a dýchať. Zlatý filter ju zladí s rámom (SVG sú čierne). */
.cal-recphoto.pat img{object-fit:contain;padding:4px;
  filter:brightness(0) saturate(100%) invert(62%) sepia(35%) saturate(680%) hue-rotate(1deg) brightness(93%) contrast(88%)}
.cal-recname{min-width:0;display:block}
.cal-rec b{font-family:${FONT_TITLE};font-size:14px;font-weight:700;letter-spacing:.06em;color:${T.inkStrong};
  display:block;line-height:1.2}
.cal-rec u{font-family:${FONT_UI};font-size:12px;font-weight:600;text-decoration:none;color:${T.accentGold};
  display:block;margin-top:2px}
.cal-rec i{display:block;font-style:normal;font-family:${FONT_UI};font-size:10px;letter-spacing:.04em;
  text-transform:uppercase;color:${T.inkFaint};margin:4px 0}
.cal-rec em{display:block;font-style:normal;font-family:${FONT_UI};font-size:10px;line-height:1.4;
  color:${T.alertRed};letter-spacing:.02em}
.cal-rec.unver{opacity:.82}
/* Pôvod fotiek — tichý riadok pod pásom. Je to licenčná podmienka, takže musí
   byť čitateľný, nie schovaný: 9,5 px a inkFaint, rovnako ako ostatné popisky. */
.cal-reccredit{font-family:${FONT_UI};font-size:10px;line-height:1.5;color:${T.inkFaint};
  margin:2px 0 0;letter-spacing:.02em}
/* Rady sú ZAVRETÉ rozbaľovačky — jeden stĺpec, nie mriežka: v dvoch stĺpcoch
   by sa pri otvorení jednej posunula susedná a zoznam by poskakoval. */
.cal-tipgrid{display:flex;flex-direction:column;gap:8px}
.cal-tip{${boxCSS(PACK_BOX.row)}}
.cal-tip>summary{display:flex;align-items:center;gap:12px;padding:12px;cursor:pointer;
  list-style:none;user-select:none}
.cal-tip>summary::-webkit-details-marker{display:none}
.cal-tip em{font-style:normal;font-size:20px;line-height:1.1;flex:0 0 auto;font-family:${EMOJI_FONT}}
.cal-tip b{flex:1 1 auto;min-width:0;font-family:${FONT_TITLE};font-size:12px;font-weight:700;
  letter-spacing:.05em;color:${T.inkStrong};line-height:1.3}
/* Šípka sa otočí — jediný signál, že blok je otvorený, keď je text dlhý
   a jeho koniec už nie je na obrazovke. */
.cal-tip>summary i{flex:0 0 auto;font-style:normal;font-size:12px;color:${T.cardEdge};
  transition:transform .18s ease}
.cal-tip[open]>summary i{transform:rotate(180deg)}
.cal-tip[open]>summary{padding-bottom:4px}
/* Ľavé odsadenie = padding 12 + emoji 20 + gap 12: text sedí pod nadpisom, nie pod ikonkou. */
.cal-tip p{font-family:${FONT_UI};font-size:12px;line-height:1.6;color:${T.inkWarm};
  margin:0;padding:0 12px 12px 44px}

/* ── KAM RADY VEDÚ — AINUBISOV POVRCH, NIE PAPYRUS ────────────────────────
   Longevity protokol bude bývať v jeho databáze, takže hovorí ON. Papyrusová
   dlaždica by tvrdila, že je to ďalšia rada v poradí; tmavý displej hovorí,
   že je to iná vrstva appky. Nie je to odkaz, kým databáza neexistuje — preto
   žiadny hover ani kurzor ruky. */
.cal-longev{margin-top:12px;display:flex;align-items:center;justify-content:space-between;
  gap:12px 16px;flex-wrap:wrap;border-radius:${PACK_R.card}px;padding:12px 16px;
  background:${AINUBIS.surface};border:1px solid ${AINUBIS.edge};
  box-shadow:0 10px 30px rgba(0,0,0,.34),0 0 26px rgba(59,158,255,.10)}
/* Hlava má PEVNÝ kruh a nesmie sa zmršťovať (flex:0 0 auto), inak ju text
   pri úzkom okne stlačí na ovál. */
.cal-longev-face{flex:0 0 auto;width:46px;height:46px;border-radius:50%;
  background:${AINUBIS.faceBg};box-shadow:${AINUBIS.faceRing};
  display:flex;align-items:center;justify-content:center;overflow:hidden}
/* Rozmer drží VÝŠKA — hlava je vyššia než širšia, tak ako v medailóne navu. */
.cal-longev-face img{height:82%;width:auto;display:block}
.cal-longev-txt{min-width:0;flex:1 1 230px}
.cal-longev-txt b{display:block;font-family:${FONT_TITLE};font-size:14px;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;color:${AINUBIS.ink};line-height:1.2}
.cal-longev-txt p{font-family:${FONT_UI};font-size:12px;line-height:1.55;
  color:${AINUBIS.inkDim};margin:4px 0 0}
/* Meno má tvar: AI je cyan a svieti (lock 12. 9. 2026). */
.cal-ai{font-family:${FONT_TITLE};font-weight:700;letter-spacing:.06em;color:${AINUBIS.ink};white-space:nowrap}
.cal-ai > span{color:${AINUBIS.aiInk};text-shadow:${AINUBIS.aiShadow}}
.cal-soon{flex:0 0 auto;font-family:${FONT_UI};font-size:10px;font-weight:600;letter-spacing:.2em;
  text-transform:uppercase;padding:8px 16px;border-radius:999px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.inkFaint}}

/* ── MINI MESIAC v popupe týždňa ────────────────────────────────────────── */
.cal-wkmini{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:16px}
.cal-wkday{${boxCSS(PACK_BOX.row)};aspect-ratio:1/1;
  display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative}
.cal-wkday u{font-family:ui-monospace,Menlo,monospace;font-size:10px;text-decoration:none;color:${T.inkFaint};line-height:1}
.cal-wkday em{font-style:normal;font-size:12px;line-height:1;font-family:${EMOJI_FONT}}
/* Zvýraznený je TÝŽDEŇ, na ktorý sa kliklo — preto plný lapis tint, nie rám:
   rám by sa bil s rámom dnešného dňa v mriežke mesiaca vedľa. */
.cal-wkday.on{background:rgba(46,95,208,.16);border-color:${LAPIS.edge}}
.cal-wkday.has u{color:${T.inkStrong};font-weight:700}

@media(max-width:700px){
  .cal-lifegrid{column-gap:8px;grid-template-columns:16px 1fr}
  .cal-liferow{gap:1px}
  .cal-lifecell{border-radius:1px}
  /* Bunka má na telefóne ~5 px — kliknúť sa na ňu nedá a hover tam neexistuje.
     Mriežka je tam OBRAZ, nie nástroj; detail týždňa je na PC. */
  .cal-lifecell.dark{cursor:default}
  .cal-nowdot{width:4px;height:4px;margin:-2px 0 0 -2px;box-shadow:0 0 0 1px rgba(250,244,236,.9)}
  .cal-lifestat b{font-size:16px}
  /* Karta rekordu sa na telefóne zúži, aby bolo vidieť kúsok tej ďalšej —
     to je jediný signál, že sa pás dá posunúť. */
  .cal-rec{flex:0 0 78%}
  /* Dva stĺpce (čísla | legenda) sú rozdelenie pre PLOCHU. Na 390 px z toho
     vzniknú dva úzke pruhy: popisok dlaždice sa láme na tri riadky a legenda
     na štyri — teda vyššie a horšie čitateľné než pod sebou. */
  .cal-lifetop{grid-template-columns:1fr;gap:12px}
  .cal-lifehead{flex-direction:row;flex-wrap:wrap}
  .cal-lifehead .cal-lifestat{flex:1 1 140px}
  .cal-sectitle{font-size:16px;letter-spacing:.08em}
  .cal-sec{padding-top:16px}
}

`;
