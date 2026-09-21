// ════════════════════════════════════════════════════════════════════════════
// KALENDÁR `/pack/dogs` — LOGIKA (dátumy, sezóny, fázy mesiaca, protokol).
// Bez JSX, bez React, bez i18n — texty sem chodia len ako SK fallback.
// ⚠️ NEPREMENÚVAJ na `packCalendar.ts`: disk na macOS nerozlišuje veľké písmená,
//    takže import './packCalendar' by kolidoval s `PackCalendar.tsx` (TS1261).
// Nákres a rozhodnutia: plany/nakres-kalendar-dogs-2026-09-12.html
//
// JEDNO PRAVIDLO CELÉHO MODULU (Matej 12. 9. 2026): **KALENDÁR KRESLÍ LEN TO,
// ČO MÁ DEŇ.** Žiadne „približne", žiadny tlmený pás cez mesiac, žiadna pilulka
// s otáznikom. Výlet s presnosťou „niekedy v septembri" tu NIE JE — ostáva
// v tripliste. Matej: „ak človek nechce dať dátum, tak sa mu to nezapíše. Smola."
// Dôsledok, ktorý je vedomá voľba: kalendár je v deň spustenia takmer prázdny
// a naplní sa až tým, čo príde potom. Radšej prázdny a pravdivý.
//
// DRUHÉ PRAVIDLO: **bunka nesie JEDEN DEŇ.** Všetko, čo TRVÁ — sezóna, okno
// protokolu, kliešťová sezóna — stojí v páse období vpravo a MÁ TAM MENO.
// Prvá verzia nákresu mala v 9 px bunke päť vrstiev a Matej ju musel lúštiť
// („je veľmi chaotický a neprehľadný… tie čiarky dolu je vždy nejaká kúra").
// Značka, ktorú treba lúštiť, nie je značka.
// ════════════════════════════════════════════════════════════════════════════

import type { ElementKey } from '@/components/pack/natureQuiz';

// ── KALENDÁRNA ARITMETIKA ───────────────────────────────────────────────────
// Rok je PARAMETER, nie konštanta: nákres mal `var YEAR = 2026` a v appke by to
// bola tichá bomba na Nový rok. `dim` preto berie rok a prestupný február sedí.
export const dim = (year: number, m: number): number => new Date(year, m, 0).getDate();

/** Poradie dňa v roku (1–365/366). */
export function doy(year: number, m: number, d: number): number {
  let t = 0;
  for (let i = 1; i < m; i++) t += dim(year, i);
  return t + d;
}

export interface CalDate { m: number; d: number }
export const dateKey = (m: number, d: number): string => `${m}-${d}`;

/** `yyyy-mm-dd` (aj s časom) → deň v danom roku, alebo null keď je to iný rok. */
export function parseDayInYear(iso: string | null | undefined, year: number): CalDate | null {
  if (!iso || typeof iso !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  if (Number(m[1]) !== year) return null;
  const mo = Number(m[2]);
  const da = Number(m[3]);
  if (mo < 1 || mo > 12 || da < 1 || da > dim(year, mo)) return null;
  return { m: mo, d: da };
}

// ── SEZÓNY ──────────────────────────────────────────────────────────────────
// Dátumy sú TIE ISTÉ ako na papierovom protokole 1.0 — papier a appka musia
// hovoriť to isté, inak je jedno z nich zlé.
//
// NÁLEZ, KTORÝ SA TÝM OPRAVIL: protokol mal štyri sezóny a medzi LETOM (do 21. 7.)
// a JESEŇOU (od 8. 8.) osemnásťdňovú NEPOMENOVANÚ medzeru. To je presne neskoré
// leto = element ZEM, ktorý appka v kvíze už má. Kalendár tú dieru zaplnil a
// protokol sa tým dotiahol zo 4 na 5 sezón — bez vymýšľania.
//
// `key` je zhodný s `ElementKey` z natureQuiz.ts (fire/earth/metal/water/wood).
// Nie je to náhoda a nesmie sa to rozísť: práve tá zhoda dáva kvízu dôsledok,
// ktorý je vidieť celý rok.
export interface Season {
  key: ElementKey;
  /** Fallback názov sezóny (SK) — i18n kľúč `pack.cal.season.<key>`. */
  nameSK: string;
  /** Fallback názov elementu (SK) — i18n kľúč `pack.nature.el.<key>`. */
  elementSK: string;
  /** Skratka do menovky mesiaca (tam je miesto na ~7 znakov). */
  shortSK: string;
  from: CalDate;
  to: CalDate;
  /** Pastel pozadia mriežky. */
  bg: string;
  /** Inkoust menovky mesiaca — tmavý odtieň tej istej farby. */
  ink: string;
}

export const SEASONS: Season[] = [
  { key: 'water', nameSK: 'ZIMA', elementSK: 'Voda', shortSK: 'zima', from: { m: 11, d: 7 }, to: { m: 2, d: 3 }, bg: '#D6E6EF', ink: '#2C5870' },
  { key: 'wood', nameSK: 'JAR', elementSK: 'Drevo', shortSK: 'jar', from: { m: 2, d: 4 }, to: { m: 5, d: 5 }, bg: '#DCE9CE', ink: '#4A6B2F' },
  { key: 'fire', nameSK: 'LETO', elementSK: 'Oheň', shortSK: 'leto', from: { m: 5, d: 6 }, to: { m: 7, d: 21 }, bg: '#F6D8D6', ink: '#8E3A32' },
  { key: 'earth', nameSK: 'NESKORÉ LETO', elementSK: 'Zem', shortSK: 'n. leto', from: { m: 7, d: 22 }, to: { m: 8, d: 7 }, bg: '#F1E4C4', ink: '#7A5A2A' },
  { key: 'metal', nameSK: 'JESEŇ', elementSK: 'Kov', shortSK: 'jeseň', from: { m: 8, d: 8 }, to: { m: 11, d: 6 }, bg: '#E2E2E4', ink: '#55565C' },
];

export function seasonOf(year: number, m: number, d: number): Season {
  const n = doy(year, m, d);
  for (const s of SEASONS) {
    const a = doy(year, s.from.m, s.from.d);
    const b = doy(year, s.to.m, s.to.d);
    // ZIMA prechádza Novým rokom, takže jej interval je obrátený — bez tejto
    // vetvy by 1. januára nesedela žiadna sezóna.
    if (a <= b ? n >= a && n <= b : n >= a || n <= b) return s;
  }
  return SEASONS[0];
}

/**
 * Všetky sezóny, ktoré do mesiaca zasahujú, aj s počtom dní.
 * ⚠️ Prevažujúca sezóna SAMA NESTAČÍ: NESKORÉ LETO trvá 17 dní a nie je
 * väčšinové v žiadnom mesiaci — pes s elementom ZEM by prstenec „jeho sezóna"
 * nedostal nikdy.
 */
export function seasonsInMonth(year: number, m: number): { season: Season; days: number }[] {
  const seen = new Map<ElementKey, { season: Season; days: number }>();
  const out: { season: Season; days: number }[] = [];
  for (let d = 1; d <= dim(year, m); d++) {
    const s = seasonOf(year, m, d);
    let hit = seen.get(s.key);
    if (!hit) { hit = { season: s, days: 0 }; seen.set(s.key, hit); out.push(hit); }
    hit.days += 1;
  }
  return out;
}

/** Farbu menovky mesiaca nesie PREVAŽUJÚCA sezóna, aby stĺpec ostal pokojný. */
export function seasonOfMonth(year: number, m: number): Season {
  let best = SEASONS[0];
  let bn = -1;
  for (const o of seasonsInMonth(year, m)) if (o.days > bn) { bn = o.days; best = o.season; }
  return best;
}

// ── MESIAC NA OBLOHE ────────────────────────────────────────────────────────
// Nákres počítal fázu zo STREDNEJ synodickej periódy a sám si k tomu napísal
// „skutočný spln kolíše o ±0,5 dňa; v appke ber presnejší výpočet". Presne to je
// tu: Meeus, Astronomical Algorithms, kap. 49 — hlavné členy rovnice stredu.
// Stredná perioda sa mýli až o ±14 h, čo značku posunie o CELÝ DEŇ; s týmito
// členmi je chyba v desiatkach minút a deň sedí.
const SYNODIC = 29.530588861;

const rad = (deg: number): number => (deg * Math.PI) / 180;

/** Juliánsky deň pre 0h UT daného dátumu (Meeus 7.1, gregoriánsky kalendár). */
function julianDay(y: number, m: number, d: number): number {
  let yy = y;
  let mm = m;
  if (mm <= 2) { yy -= 1; mm += 12; }
  const a = Math.floor(yy / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + d + b - 1524.5;
}

/**
 * Juliánsky dátum fázy. `k` celé = NOV, `k + 0.5` = SPLN.
 * (`k = 0` je nov 6. 1. 2000; k rastie o 1 za lunáciu.)
 */
function phaseJDE(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  let jde = 2451550.09766 + SYNODIC * k + 0.00015437 * T2 - 0.000000150 * T3;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;                       // excentricita Zeme
  const M = rad(2.5534 + 29.10535670 * k - 0.0000014 * T2);          // stredná anomália Slnka
  const Mp = rad(201.5643 + 385.81693528 * k + 0.0107582 * T2);      // stredná anomália Mesiaca
  const F = rad(160.7108 + 390.67050284 * k - 0.0016118 * T2);       // argument šírky
  const isFull = Math.abs(k - Math.round(k)) > 0.25;
  // Sedem najväčších členov. Ďalšie sú pod 1 minútu a na určenie DŇA nemajú vplyv.
  const c1 = isFull ? -0.40614 : -0.40720;
  const c3 = isFull ? 0.01614 : 0.01608;
  const c4 = isFull ? 0.01043 : 0.01039;
  const c5 = isFull ? 0.00734 : 0.00739;
  const c6 = isFull ? -0.00515 : -0.00514;
  jde += c1 * Math.sin(Mp)
    + (isFull ? 0.17302 : 0.17241) * E * Math.sin(M)
    + c3 * Math.sin(2 * Mp)
    + c4 * Math.sin(2 * F)
    + c5 * E * Math.sin(Mp - M)
    + c6 * E * Math.sin(Mp + M)
    + 0.00208 * E * E * Math.sin(2 * M);
  return jde;
}

export type MoonPhase = 'new' | 'full';

/**
 * Dni splnu a novu v danom roku. Vracia mapu `"m-d" → fáza`, lebo mriežka sa
 * pýta „čo je dnes", nie „kedy bol ďalší spln" — a takto sa celý rok počíta raz.
 */
export function moonDaysOfYear(year: number): Map<string, MoonPhase> {
  const out = new Map<string, MoonPhase>();
  // k pre začiatok roka; berieme so rezervou ±2 lunácie, aby okraje roka sedeli.
  const kStart = Math.floor((year - 2000) * 12.3685) - 2;
  const jdJan1 = julianDay(year, 1, 1);
  const jdNextJan1 = julianDay(year + 1, 1, 1);
  for (let i = 0; i < 18; i++) {
    for (const half of [0, 0.5]) {
      const jde = phaseJDE(kStart + i + half);
      if (jde < jdJan1 || jde >= jdNextJan1) continue;
      // JDE je v Terrestrial Time pre 0h; +0.5 posunie na kalendárny deň.
      const day = Math.floor(jde + 0.5);
      const date = new Date(Date.UTC(2000, 0, 1) + (day - julianDay(2000, 1, 1) - 0.5) * 86_400_000);
      out.set(dateKey(date.getUTCMonth() + 1, date.getUTCDate()), half === 0 ? 'new' : 'full');
    }
  }
  return out;
}

// ── PROTOKOL: okná, nie dni ─────────────────────────────────────────────────
// `group` nesie SKUPINU (čo podáš / čo zmeriaš), nie vlastnú farbu — sedem okien
// = sedem farieb bol presne dôvod, prečo sa pás nedal prečítať.
//
// ⚠️ Toto je ODPORÚČANIE z protokolu 1.0, nie termín používateľa. Je to rovnaké
// pre všetkých (preto konštanta, nie tabuľka) a `dogOnly` drží jedinú výnimku:
// kĺbová kúra staršieho psa je jeho, nie svorková.
export type ProtGroup = 'give' | 'lab';

export interface ProtWindow {
  nameSK: string;
  /** i18n kľúč `pack.cal.prot.<id>`. */
  id: string;
  emoji: string;
  group: ProtGroup;
  from: CalDate;
  to: CalDate;
  /** `null` = celá svorka. Inak sa okno kreslí len pri tomto psovi. */
  dogOnly?: 'senior' | null;
}

export const PROTOCOL: ProtWindow[] = [
  { id: 'dewormSpring', nameSK: 'Odčervenie', emoji: '💊', group: 'give', from: { m: 3, d: 1 }, to: { m: 3, d: 31 } },
  { id: 'coproSpring', nameSK: 'Koprológia', emoji: '🔬', group: 'lab', from: { m: 3, d: 1 }, to: { m: 3, d: 31 } },
  { id: 'biochem', nameSK: 'Biochémia', emoji: '🔬', group: 'lab', from: { m: 5, d: 1 }, to: { m: 7, d: 31 } },
  { id: 'dewormAugust', nameSK: 'Odčervenie', emoji: '💊', group: 'give', from: { m: 8, d: 1 }, to: { m: 8, d: 31 } },
  { id: 'coproAutumn', nameSK: 'Koprológia', emoji: '🔬', group: 'lab', from: { m: 9, d: 1 }, to: { m: 10, d: 31 } },
  { id: 'immune', nameSK: 'Imunitná kúra', emoji: '🌿', group: 'give', from: { m: 9, d: 1 }, to: { m: 10, d: 15 } },
  { id: 'joints', nameSK: 'Kĺbová kúra', emoji: '🌿', group: 'give', from: { m: 11, d: 1 }, to: { m: 12, d: 31 }, dogOnly: 'senior' },
];

/** Kliešťová sezóna — apríl až október. Nepíše to nikto, počíta sa to. */
export const TICKS = { id: 'ticks', nameSK: 'Kliešťová sezóna', emoji: '🩸', fromMonth: 4, toMonth: 10 } as const;

export const protWindowColor = (w: ProtWindow, C: typeof CAL_RGB): string => (w.group === 'lab' ? C.vet : C.give);

/**
 * Okná viditeľné pri danom výbere. Filter psa je SÚČASŤ výberu, nie nadstavba
 * volajúceho — inak si každé miesto filtruje po svojom a psie okno vyskočí pri
 * cudzom psovi (v nákrese sa to stalo v chipoch mesiaca).
 */
export function visibleProtocol(seniorSelected: boolean): ProtWindow[] {
  return PROTOCOL.filter((w) => !w.dogOnly || seniorSelected);
}

export function protocolOn(year: number, m: number, d: number, seniorSelected: boolean): ProtWindow[] {
  const n = doy(year, m, d);
  return visibleProtocol(seniorSelected).filter(
    (w) => n >= doy(year, w.from.m, w.from.d) && n <= doy(year, w.to.m, w.to.d),
  );
}

export const ticksInMonth = (m: number): boolean => m >= TICKS.fromMonth && m <= TICKS.toMonth;

export const protWholeMonth = (year: number, w: ProtWindow, m: number): boolean =>
  doy(year, w.from.m, w.from.d) <= doy(year, m, 1) && doy(year, w.to.m, w.to.d) >= doy(year, m, dim(year, m));

/**
 * Rozdelenie okien do dvoch dráh pásu období. Okno, ktoré sa s ničím
 * neprekrýva, ide do prvej.
 */
export function protocolLanes(seniorSelected: boolean): { w: ProtWindow; lane: number; m1: number; m2: number }[] {
  const ws = visibleProtocol(seniorSelected)
    .map((w) => ({ w, lane: 0, m1: w.from.m, m2: w.to.m }))
    .sort((a, b) => a.m1 - b.m1 || a.m2 - b.m2);
  const lanes: typeof ws[] = [[], []];
  for (const item of ws) {
    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      if (lanes[i].every((o) => item.m1 > o.m2 || item.m2 < o.m1)) {
        item.lane = i; lanes[i].push(item); placed = true; break;
      }
    }
    if (!placed) { item.lane = lanes.length - 1; lanes[lanes.length - 1].push(item); }
  }
  return ws;
}

// ── FARBA: šesť významov namiesto pätnástich ────────────────────────────────
// ⚠️ Modrá je zámerne na dvoch miestach (veterinár + laboratórne okno) — je to
// tá istá téma: ZDRAVIE. Nie je to kolízia, je to jazyk.
// ⚠️ Fialová sa nepoužila vôbec: v brande drží VÝLETY (`PACK_THEME.tripPurple`)
// a druhý význam by ju rozpustil.
export const CAL_RGB = {
  /** zelená — bol si vonku (hustota zápisov) */
  log: '61,122,78',
  /** modrá — zdravie: zápis u veterinára aj okno odberov */
  vet: '16,52,166',
  /** jantárová — čo sa podáva (odčervenie, kúry) */
  give: '224,138,46',
  /** zlatá — identita (prstenec narodenín, nikdy výplň) */
  gold: '201,154,63',
  /** červená — príroda varuje (kliešte) */
  nat: '142,42,32',
} as const;

export const calRGBA = (k: keyof typeof CAL_RGB, a: number): string => `rgba(${CAL_RGB[k]},${a})`;

/** hex → rgba, aby sa pastel sezóny dal stlmiť bez druhého tokenu. */
export function hexRGBA(hex: string, a: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// ── ZÁPISY ──────────────────────────────────────────────────────────────────
// `group` rozhoduje o farbe bunky v ROKU, `emoji` o značke v MESIACI a v popupe.
//
// PRECHÁDZKA ZRUŠENÁ (Matej 12. 9. 2026): appka nemá miesto, kde sa zapisuje —
// bol by to riadok legendy bez zdroja. A stála vedľa VÝLETU ako jeho tretí
// odtieň. Jednotka je výlet, lebo jedine ten má v appke dátum.
//
// Emoji sú **Emoji 1.0 (2015)** — to isté kritérium, podľa ktorého v mapovej sade
// padol rebrík 🪜: značka, ktorú vidno len na novom telefóne, nie je značka.
// Kde to šlo, berie sa tá istá značka, akú už appka používa na mape
// (`mapnotes/markEmoji.ts`), aby sa jeden pojem nekreslil dvoma spôsobmi.
export type LogKind = 'trip' | 'vet' | 'deworm' | 'note' | 'alone' | 'weigh' | 'milestone' | 'plan';
export type LogGroup = 'log' | 'vet' | 'plan';

export interface LogType {
  emoji: string;
  group: LogGroup;
  nameSK: string;
  /** i18n kľúč `pack.cal.type.<kind>`. */
  i18n: string;
}

export const LOG_TYPES: Record<LogKind, LogType> = {
  // ⛰️ už NIE JE zhodné s `POI_EMOJI.cliff` — tá dostala 🗻 (Matej 21. 9. 2026),
  // lebo bralo z OSM a výlet psa nie je tá istá vec. Výletu ⛰️ ostalo.
  trip: { emoji: '⛰️', group: 'log', nameSK: 'Výlet', i18n: 'pack.cal.type.trip' },
  // 💉 kryje odber, vakcínu aj odčervenie u lekára. 🩺 je Emoji 12.0 (2019) = mimo sady.
  vet: { emoji: '💉', group: 'vet', nameSK: 'Veterinár', i18n: 'pack.cal.type.vet' },
  deworm: { emoji: '💊', group: 'vet', nameSK: 'Odčervenie', i18n: 'pack.cal.type.deworm' },
  // 🗓️ (Matej 21. 9. 2026). Bolo 📝 („písanie, nie čítanie; 📖 je ústava"), lenže
  // ten istý znak niesol aj „naše vlastné podujatie" v paneli `+`.
  // ⚠️ DVOJIČKA: čip `DIARY_CHIPS.note` v `diary/diaryModel.ts` zapisuje PRÁVE
  //    do tohto riadku. Keď sa mení jeden, musí sa meniť aj druhý — inak človek
  //    klikne jedno emoji a v kalendári mu pribudne iné.
  note: { emoji: '🗓️', group: 'log', nameSK: 'Denník', i18n: 'pack.cal.type.note' },
  alone: { emoji: '🏠', group: 'log', nameSK: 'Deň bez seba', i18n: 'pack.cal.type.alone' },
  // ⭐ MÍĽNIK (21. 9. 2026, KROK 5 — denník dostal pisateľa `components/pack/diary/`).
  // Prvé plávanie, gotcha day, prvý raz sám doma. Od poznámky sa líši váhou, nie obsahom:
  // poznámka je deň, míľnik je vec, na ktorú sa o rok spomína.
  // ⚠️ Emoji 1.0 a v appke voľné: 🏆 je výstava, 🎖️ tréning, 🎂 narodeniny, 🎈 ľudský rok.
  // 🟡 PREDBEŽNÉ — Matej 21. 9.: „tie emoji chcem vedieť aj zmeniť… najprv to musím
  //    vidieť v kontexte celej stránky."
  milestone: { emoji: '⭐', group: 'log', nameSK: 'Míľnik', i18n: 'pack.cal.type.milestone' },
  weigh: { emoji: '⚖️', group: 'log', nameSK: 'Váženie', i18n: 'pack.cal.type.weigh' },
  // 📍 zhodné s `TRIP_TARGET_EMOJI` na mape — plánovaný výlet je tá istá vec.
  plan: { emoji: '📍', group: 'plan', nameSK: 'Plán', i18n: 'pack.cal.type.plan' },
};

export interface CalEntry {
  kind: LogKind;
  /** Rok zápisu. Pohľad ROK si ním filtruje, pohľad ŽIVOT z neho ráta týždeň. */
  y: number;
  m: number;
  d: number;
  /** Nadpis riadku v popupe — názov výletu, hodnota váhy, titulok zápisu. */
  title: string;
  /** Druhý riadok. Prázdny = nekreslí sa. */
  text?: string;
  /** `null` = celá svorka (spoločný výlet). Inak id psa. */
  dogId: string | null;
  /** Odkaz, keď zápis niekam vedie (výlet → článok). */
  href?: string;
  /**
   * Fotka priložená k zápisu denníka (`dog_events.value.photo`).
   * ⚠️ Je tu preto, aby zápis mal ČITATEĽA. Bez nej sa fotka dá nahrať a už ju nikto
   *    neuvidí — a to je presne ten polovičný tvar, pre ktorý bol kalendár rok čítací.
   *    Kreslí ju POPUP DŇA, nie bunka: v mriežke 372 dní by z nej bol šum.
   */
  photo?: string;
}

/**
 * Výplň bunky v ROKU. Rok odpovedá na „mám rytmus?", nie na „čo to bolo" —
 * preto JEDNA zelená škála a jediná výnimka: veterinár. To je druhá otázka roka.
 * (Sedem farieb typov v mriežke roka bolo v prvom nákrese a nedalo sa to čítať.)
 */
export function cellFill(entries: CalEntry[]): string | null {
  let vet = false;
  let n = 0;
  for (const e of entries) {
    const g = LOG_TYPES[e.kind].group;
    if (g === 'vet') vet = true;
    else if (g === 'log') n += 1;
  }
  if (vet) return calRGBA('vet', 0.72);
  if (n >= 3) return calRGBA('log', 0.92);
  if (n === 2) return calRGBA('log', 0.66);
  if (n === 1) return calRGBA('log', 0.42);
  return null;
}

// ── NARODENINY A ĽUDSKÉ ROKY ────────────────────────────────────────────────
// Nezapisujú sa, počítajú sa z DOG ID. Preto nie sú `CalEntry` a nemajú emoji
// v mriežke roka — nesú PRSTENEC (zlatá = identita, nikdy výplň).
export interface CalDog {
  id: string;
  name: string;
  birth: CalDate | null;
  element: ElementKey | null;
  /** Vek v celých rokoch — do popupu („Hekthor má 9"). */
  years: number | null;
  senior: boolean;
}

export const birthdaysOn = (dogs: CalDog[], m: number, d: number): CalDog[] =>
  dogs.filter((g) => g.birth && g.birth.m === m && g.birth.d === d);

/**
 * Ľudské roky — 6 medzidátumov (rok ÷ 7).
 * ⚠️ Kreslia sa až po VÝBERE psa: tá istá úvaha ako pri zvýraznení sezóny —
 * dvaja psi = dvanásť prstencov naprieč rokom a značka prestane niečo znamenať.
 * Narodeniny ostávajú vždy, tie sú dve.
 */
export function humanYearsOn(year: number, dogs: CalDog[], m: number, d: number, soloSelected: boolean): CalDog[] {
  if (!soloSelected) return [];
  const n = doy(year, m, d);
  const len = doy(year, 12, 31);
  const out: CalDog[] = [];
  for (const g of dogs) {
    if (!g.birth) continue;
    const b = doy(year, g.birth.m, g.birth.d);
    for (let i = 1; i < 7; i++) {
      if (((b + Math.round((i * len) / 7) - 1) % len) + 1 === n) { out.push(g); break; }
    }
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// ŽIVOTNÁ MRIEŽKA — týždne celého života psa (pohľad ŽIVOT, 13. 9. 2026).
//
// ⚠️ PREČO TU PRIBUDOL PLNÝ DÁTUM: `parseDayInYear()` zahodí všetko, čo nie je
// v aktuálnom roku — pre kalendár roka je to správne, pre životnú os je to
// smrteľné. Preto `parseFullDay()`: ten istý parser, ktorý rok NEZAHADZUJE,
// ale vracia. Pohľad ROK si svoj rok odfiltruje sám.
// ════════════════════════════════════════════════════════════════════════════

export interface FullDate { y: number; m: number; d: number }

export function parseFullDay(iso: string | null | undefined): FullDate | null {
  if (!iso || typeof iso !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const da = Number(m[3]);
  if (y < 1900 || y > 2200) return null;
  if (mo < 1 || mo > 12 || da < 1 || da > dim(y, mo)) return null;
  return { y, m: mo, d: da };
}

/** Mriežka drží 30 rokov. 20+ je ZÓNA REKORDOV — pozri `LIFE_ACTIVE_YEARS`. */
export const LIFE_YEARS = 30;
/** Do 20 rokov je mriežka „živá". Nad ňou je história, nie predpoveď. */
export const LIFE_ACTIVE_YEARS = 20;
/** 52 týždňov v riadku — ostatok roka (1,25 dňa) sa do mriežky nevojde a to je v poriadku. */
export const WEEKS_PER_YEAR = 52;
export const LIFE_WEEKS = LIFE_YEARS * WEEKS_PER_YEAR;

/**
 * 🎯 CIEĽOVÉ PÁSMO — koľko rokov navyše si dať za cieľ. Matej 13. 9. 2026:
 * „pridaj 5 rokov rámik… ten bude zelený a bude hovoriť: pridaj až extra
 * 5 rokov super starostlivosťou (target – longevity)… hrubý odhad toho, čo
 * dokáže holistický prístup k životnému štýlu psa."
 *
 * ⚠️ JE TO CIEĽ, NIE ÚDAJ — a v texte to musí byť počuť („až", „cieľ"), inak
 * appka tvrdí niečo, čo nikto nezmeral. Jediné TVRDÉ číslo, ktoré k tomu
 * existuje, je Purina Life Span Study (Kealy a kol., JAVMA 2002): 48 labradorov
 * v dvojiciach, jeden z páru o 25 % menej krmiva celý život ⇒ medián dožitia
 * **13,0 vs 11,2 roka, teda +1,8 roka (+15 %)** len tým, že pes ostal štíhly.
 * To je JEDEN faktor z mnohých; päť rokov je horná hranica toho, čo by dal
 * súčet všetkých (štíhlosť, pohyb, chrup, spánok, menej chémie) — nie priemer
 * a nie sľub. Zdroj drž v popiske, nech sa dá overiť.
 */
export const TARGET_EXTRA_YEARS = 5;

/**
 * Index týždňa od narodenia. Rovnaký vzorec pre psa aj pre zápis, inak by
 * zápis sadol o týždeň vedľa.
 *
 * ⚠️ Rok mriežky má 52 týždňov = 364 dní, teda o 1,25 dňa menej než skutočný.
 * Po 20 rokoch je posun ~25 dní — na mriežke, kde bunka JE týždeň, je to menej
 * než štyri bunky a nikto to nevidí. Presné riadky by si vyžiadali nerovnaké
 * dĺžky riadkov a mriežka by prestala byť mriežkou. Je to vedomý kompromis,
 * ten istý, aký robí každá „life in weeks" tabuľka.
 */
export function weekIndex(birth: Date, day: Date): number {
  return Math.floor((day.getTime() - birth.getTime()) / (7 * 86_400_000));
}

/**
 * Vek v ROKOCH, MESIACOCH a TÝŽDŇOCH k danému dňu (Matej 13. 9. 2026: „pri
 * prejdení myšou na rôzny blok sa zobrazí roky, mesiace, týždne").
 *
 * ⚠️ Ráta sa KALENDÁRNE, nie delením dní. „10 rokov 4 mesiace" musí sedieť
 * s tým, čo človek vidí na kalendári — pri delení priemernou dĺžkou mesiaca
 * (30,44 dňa) sa to po desiatich rokoch rozíde o niekoľko dní a v deň narodenín
 * by mriežka tvrdila „9 rokov 11 mesiacov".
 */
export function ageParts(birth: Date, at: Date): { y: number; m: number; w: number } {
  let y = at.getFullYear() - birth.getFullYear();
  let m = at.getMonth() - birth.getMonth();
  let d = at.getDate() - birth.getDate();
  if (d < 0) { m -= 1; d += dim(at.getFullYear(), at.getMonth() === 0 ? 12 : at.getMonth()); }
  if (m < 0) { y -= 1; m += 12; }
  return { y: Math.max(0, y), m: Math.max(0, m), w: Math.max(0, Math.floor(d / 7)) };
}

/** Prvý deň daného týždňa života (na popisok „24. 3. – 30. 3. 2019"). */
export function weekStart(birth: Date, wi: number): Date {
  return new Date(birth.getTime() + wi * 7 * 86_400_000);
}

// ── REKORDMANI — prečo mriežka pokračuje za 20 rokov ────────────────────────
// Nie je to výzdoba: zóna 20–30 je jediné miesto, kde sa dá ukázať, že strop
// nie je tam, kde ho vidí štatistika.
//
// 🔴 `verified` NIE JE OZDOBA, JE TO PODMIENKA ZÁPISU. Psov nad 20 rokov je
// doložených cez dvadsať, ale zhruba polovica stojí na tvrdení majiteľa. Kto
// sem pridáva ďalšieho, musí vedieť povedať, do ktorej polovice patrí — inak
// z rekordov vznikne zbierka historiek.
//
// ⚠️ BOBI (31 r., Portugalsko) TU ZÁMERNE NIE JE. Guinness mu titul
// **22. 2. 2024 odobral**: dôkaz o veku stál na zápise v portugalskej štátnej
// databáze SIAC z roku 2022, a SIAC pri psoch narodených pred rokom 2008
// doklad o veku nepožadoval — stačilo vyhlásenie majiteľa. Nie je to obvinenie
// z podvodu, je to „nedá sa to doložiť". Titul sa vrátil Blueymu.
export interface LifeRecord {
  name: string;
  years: number;
  /** Do popisku: „29 rokov 160 dní". Prázdne = známe sú len roky. */
  exactSK: string;
  breedSK: string;
  fromTo: string;
  countrySK: string;
  /** true = doložené a uznané · false = tvrdenie, ktoré nikto nepotvrdil. */
  verified: boolean;
  /**
   * FOTKA REKORDMANA. Matej 13. 9. 2026: „fotky stiahni všetky, a uvedieme,
   * odkiaľ sú."
   *
   * 🔴 VYPLNENÁ JE JEDNA Z TRINÁSTICH a nie je to lenivosť — VIAC ICH VOĽNÝCH
   * NIE JE. Prehľadané Wikimedia Commons aj Wikipédia (13× dopyt, september
   * 2026): jediná voľná snímka niektorého z týchto psov je `File:Dog Bluey.jpg`
   * (public domain, 1920-te roky). Články o Blueym, Pusukem, Spikeovi a Bobim
   * síce existujú, ale **bez jedinej fotky**; Maggie, Bramble, Adjutant, Taffy
   * a TobyKeith článok nemajú vôbec. Zvyšok žije len ako tlačová alebo
   * Guinnessova snímka, teda cudzie autorské právo na komerčnej stránke —
   * a to je vec fotografa, nie majiteľa psa (GDPR s tým nesúvisí).
   *
   * Kto sem bude dopĺňať ďalšiu: musí mať PD alebo CC licenciu a MUSÍ vyplniť
   * `photoCredit`, inak sa poruší práve tá podmienka, ktorá licenciu platnou
   * robí. Kruh bez fotky nevyzerá rozbito — ukáže iniciálu, ten istý vzor,
   * aký má appka na chýbajúci avatar.
   */
  photo?: string;
  /** Povinná dvojička `photo`: autor / zdroj / licencia do riadku pod pásom. */
  photoCredit?: string;
  /**
   * NÁHRADA ZA FOTKU — hand-drawn silueta plemena z nášho vlastného setu
   * (`public/patrons/<kat>-<nn>.svg`, 81 kusov, kľúč `patron` v `breeds.json`).
   * Matej 13. 9. 2026: *„tie bloky so psami daj bledou/bielou, trochu to treba
   * oživiť, vyzerá to otrasne."* Holá iniciála bola presne to „otrasne" —
   * kruh s písmenkom nehovorí o psovi nič. Silueta je NAŠA (brand lock
   * hand-drawn setu), nič nestojí a povie plemeno bez slova.
   * ⚠️ Nechaj prázdne, keď plemeno nepoznáme (Butch) alebo keď preň silueta
   * neexistuje (welšský ovčiak) — dokresliť cudziu je horšie než iniciála.
   */
  patron?: string;
}

export const LIFE_RECORDS: LifeRecord[] = [
  { name: 'Bluey', years: 29.4, exactSK: '29 rokov 160 dní', breedSK: 'Austrálsky honácky pes',
    fromTo: '1910 – 1939', countrySK: 'Austrália', verified: true,
    photo: '/images/records/bluey.jpg',
    photoCredit: 'Bluey: neznámy autor, 20. roky 20. st. · public domain · Wikimedia Commons' },
  { name: 'Lazare', years: 30.4, exactSK: '30 rokov 161 dní', breedSK: 'Papillon',
    fromTo: '1995 – 2026', countrySK: 'Francúzsko', verified: false, patron: '03-02' },
  { name: 'Maggie', years: 30, exactSK: '', breedSK: 'Austrálsky kelpie',
    fromTo: '1986 – 2016', countrySK: 'Austrália', verified: false, patron: '09-05' },
  { name: 'Max', years: 29.8, exactSK: '29 rokov 282 dní', breedSK: 'Kríženec beagla a jazvečíka',
    fromTo: '1983 – 2013', countrySK: 'USA', verified: false, patron: '05-06' },
  { name: 'Bella', years: 29, exactSK: '', breedSK: 'Kríženec labradora',
    fromTo: '1979 – 2008', countrySK: 'Veľká Británia', verified: true, patron: '08-01' },
  { name: 'Butch', years: 28, exactSK: '', breedSK: 'Plemeno sa neuvádza',
    fromTo: '1975 – 2003', countrySK: 'USA', verified: true },
  { name: 'Taffy', years: 27.6, exactSK: '27 rokov 211 dní', breedSK: 'Welšský ovčiak',
    fromTo: '1975 – 2003', countrySK: 'Veľká Británia', verified: true },
  { name: 'Adjutant', years: 27.3, exactSK: '27 rokov 98 dní', breedSK: 'Labradorský retríver',
    fromTo: '1936 – 1963', countrySK: 'Veľká Británia', verified: true, patron: '08-01' },
  { name: 'Pusuke', years: 26.7, exactSK: '26 rokov 8 mesiacov', breedSK: 'Kríženec šiba inu',
    fromTo: '1985 – 2011', countrySK: 'Japonsko', verified: true, patron: '01-05' },
  { name: 'Spike', years: 26.8, exactSK: '26 rokov 286 dní', breedSK: 'Kríženec čivavy',
    fromTo: 'od 1999', countrySK: 'USA', verified: true, patron: '03-01' },
  { name: 'Bramble', years: 25, exactSK: '', breedSK: 'Border kólia',
    fromTo: '1978 – 2003', countrySK: 'Veľká Británia', verified: false, patron: '09-01' },
  { name: 'TobyKeith', years: 23.3, exactSK: '23 rokov 112 dní', breedSK: 'Čivava',
    fromTo: '2001 – 2024', countrySK: 'USA', verified: true, patron: '03-01' },
  { name: 'Pebbles', years: 22.5, exactSK: '22 rokov 189 dní', breedSK: 'Toy foxteriér',
    fromTo: '2000 – 2022', countrySK: 'USA', verified: true, patron: '03-04' },
];

// ── RADY, AKO PREDĹŽIŤ ŽIVOT ────────────────────────────────────────────────
// 🔴 TOTO JE MATEJOV TEXT A ČAKÁ NA PREPIS. Zadanie znelo „rady ako život ešte
// predĺžiť (bez chémie, narkózy, granule...) budu tam tipy vychádzajúce
// z psieho profilu". Vymyslieť za neho 15 rokov výživy a tréningu sa nedá,
// takže sem sadlo LEN to, čo appka už niekde hovorí sama.
//
// ⚠️ ZÚŽENÉ 13. 9. 2026 (Matej: „dáme preč o tom že je kalendár prázdny aj že
// priemer už prekonal — budú tu len longevity odporúčania"). Odišli tri rady,
// ktoré neboli rady, ale komentár k stavu kalendára: `noWeight` („nemáš ani
// jedno váženie"), `fewTrips` („mriežka je skoro celá svetlá") a `overMedian`
// („priemer už prekonal"). Hovorili o appke, nie o psovi — a mriežka nad nimi
// to isté ukazuje bez slov.
//
// **ŠESŤ STÁLYCH BLOKOV** (Matej: „pridaj aby bolo 6 blokov, že vyhýbať sa
// chémii, stresu…"): štíhlosť · pohyb · jedlo · chémia · stres · protokol.
// Siedmy (kĺby) sa pridá len seniorovi — je to jediná rada viazaná na vek,
// nie na stav zápisov.
//
// `when` rozhoduje, komu sa rada ukáže.
export interface LifeTip {
  id: string;
  titleSK: string;
  bodySK: string;
  emoji: string;
  when: 'always' | 'senior';
}

export const LIFE_TIPS: LifeTip[] = [
  {
    id: 'weight', emoji: '⚖️', when: 'always',
    titleSK: 'Štíhlosť je jediné, čo je dokázané',
    bodySK: 'Zo všetkého, čo sa dá so psom urobiť, má na dĺžku života najtvrdší doklad jedna vec: '
      + 'nenechať ho pribrať. Rozdiel medzi štíhlym a mierne obéznym psom sú roky, nie mesiace. '
      + 'Rebrá musia byť nahmatateľné bez tlaku.',
  },
  {
    id: 'move', emoji: '🥾', when: 'always',
    titleSK: 'Pohyb v teréne, nie kolečko okolo bloku',
    bodySK: 'Nerovný povrch drží kĺby, svaly aj hlavu. Každý výlet, ktorý si zapíšeš, '
      + 'je na tejto mriežke tmavý týždeň — a tmavých týždňov je to jediné, čo vieš ovplyvniť.',
  },
  {
    id: 'food', emoji: '🍖', when: 'always',
    titleSK: 'Jedlo, ktoré pes pozná ako jedlo',
    bodySK: 'Čím menej krokov medzi surovinou a miskou, tým menej vecí sa cestou pokazí. '
      + 'Granule nie sú hriech, ale nie sú ani strava — sú skratka.',
  },
  {
    id: 'chem', emoji: '🧪', when: 'always',
    titleSK: 'Chémia len vtedy, keď ju naozaj treba',
    bodySK: 'Celoročné antiparazitiká, narkóza pre pohodlie a antibiotiká „pre istotu" sú rozhodnutia, '
      + 'nie rutina. Pýtaj sa pri každom jednom: čo sa stane, ak to nedám? '
      + 'Kde je odpoveď „nič", tam to nedávaj.',
  },
  {
    id: 'stress', emoji: '🌙', when: 'always',
    titleSK: 'Pokoj sa počíta rovnako ako pohyb',
    bodySK: 'Pes, ktorý je stále v strehu, spaľuje telo zvnútra. Spánok bez vyrušovania, '
      + 'predvídateľný deň a ticho po záťaži nie sú lenivosť — sú to hodiny, '
      + 'v ktorých sa telo opravuje.',
  },
  {
    id: 'protocol', emoji: '🌿', when: 'always',
    titleSK: 'Protokol namiesto panického behu k vete',
    bodySK: 'Odčervenie, koprológia a biochémia majú v kalendári svoje okná. '
      + 'Pes, ktorému sa dvakrát ročne pozrieš do krvi, sa nelieči — predchádza.',
  },
  {
    id: 'joints', emoji: '🦴', when: 'senior',
    titleSK: 'Kĺby sa riešia PRED tým, než začnú bolieť',
    bodySK: 'Tvoj pes je v seniorskom pásme. Kĺbová kúra má v kalendári okno od novembra — '
      + 'nie preto, že kríva, ale preto, aby nezačal.',
  },
];
