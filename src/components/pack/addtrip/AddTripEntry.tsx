// ADD — vstupný popup (vlna 1 reštruktúra, plany/zadanie-eventy-2026-08-06.md §2).
// Dve úrovne: 1) TRIP / EVENT (Matejov feedback 2026-08-06: SERVICE dlaždica bola disabled a pri
// troch dlaždiciach jej flex-wrap dal celú šírku popupu — vizuálne najväčší prvok bol mŕtvy. Von
// z renderu, i18n kľúče `pack.addTrip.entry.kind.service.*` a `Kind`/`KINDS` tvar OSTÁVAJÚ —
// SERVICE sa vráti vo vlne 2, len sa nevykresľuje). 2) pre TRIP „WE'VE BEEN THERE" (log) vs
// „WE'RE HEADING OUT" (plán); pre EVENT „OUR OWN EVENT" vs „FROM A LINK" — rovnaký vzor druhej
// úrovne, obe rovnako veľké a klikateľné, s tlačidlom späť.
// ŠAT (od 22. 9. 2026): PAPYRUS v zlatom odliatku, vysunutý nad spodnú lištu v jej šírke —
// na každej obrazovke rovnako (Matej: „na každej obrazovke musí byť bledý štýl"). Do 22. 9.
// tu stálo čierne pk-glass a bledým ho robilo len prebitie na mape.
import { trackPack } from '@/lib/packAnalytics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { PLATE_TILE_R, goldFrameCSS, LAPIS } from '@/components/pack/navGoldSkin';
import { useT } from '@/i18n/LanguageContext';
import { NotePalette, NOTE_PALETTE_CSS } from '@/components/pack/mapnotes/NotePalette';
import { NOTE_GROUPS, type NoteGroup } from '@/components/pack/mapnotes/mapNotesData';
import { GROUP_EMOJI, EVENT_EMOJI, FONT_EMOJI } from '@/components/pack/mapnotes/markEmoji';
import { TRIP_CATEGORIES } from '@/components/pack/tripCategories';
import { EVENT_KINDS, EVENT_KIND_LABEL_KEYS, type EventKind } from '@/components/pack/events/eventModel';
import type { TripState } from './addTripModel';
import {
  panelFor, isReady, isSoon, type CreateId, type CreateObject, type CreatePlace,
} from '@/components/pack/createRegistry';
import { POINTS } from '@/lib/tripPoints';
import { EVENTS_LIVE, WISHES_LIVE } from '@/lib/packFlags';
import { BackIcon, backCircleCSS, backHoverCSS } from '@/components/pack/BackButton';
import { RightGate } from '@/components/pack/RightGate';
import type { PawmateRight } from '@/lib/pawmateRights';


// §2: kontrakt komponentu rozšírený nad rámec TRIP-only. `kind: 'event'` teraz emituje reálnu
// voľbu (druhá úroveň EVENT_BLOCKS) — volajúci (PackMap.tsx) ju napája na `AddEvent` formulár
// (components/pack/events/AddEvent.tsx, krok 3 zadania).
export type AddChoice =
  | { kind: 'trip'; state: TripState }
  | { kind: 'event'; origin: 'own' | 'tip' }
  // PRIANIE (24. 9. 2026) — panel sa zavrie a na odkrytej mape vedie AINUBIS (§2 zadania).
  | { kind: 'wish' }
  // ODKAZ (2026-08-20) — tretia dlaždica. Nevracia hotový zápis, ale ZVOLENÚ SKUPINU:
  // po nej sa popup zavrie a človek ukazuje miesto na odkrytej mape. Poradie
  // „najprv čo, potom kde" je zámer — človek prichádza s úmyslom, nie s bodom.
  | { kind: 'note'; group: NoteGroup };

export type AddTripEntryProps = {
  onPick: (choice: AddChoice) => void;
  onClose: () => void;
  /**
   * Miesto chrbtice, z ktorého sa panel otvoril (lock `architektura-pack.md` §1.1.1).
   *
   * BEZ NEHO je to presne dnešný panel s tromi dlaždicami — taký, aký ho otvárajú vchody
   * v mape (bočný panel, prázdny stav podujatí, „pridať ďalší" po zápise). To NIE JE
   * pozostatok: lock hovorí „jeden pridávací panel, VIAC VCHODOV", a vchod z mapy o miesto
   * nemusí prosiť, keď na ňom stojí.
   *
   * S NÍM sa dlaždice berú z registra (`createRegistry.ts`) — hotové + ohlásené, v poradí
   * registra. Na DOMOVE je to celý repertoár zoskupený podľa miesta, inde výrez.
   */
  place: CreatePlace;
  /**
   * Objekt, ktorý NEVYKONÁVA mapa (denník, fotka, rozhovor s AINUBISOM…). Panel ho
   * nespracúva sám — odovzdá ho lište, ktorá vie, kde človek stojí.
   * ⚠️ Povinné, keď je `place`. Bez neho by dlaždica mlčky nič neurobila.
   */
  onCreate?: (o: CreateObject) => void;
};

type Kind = 'trip' | 'wish' | 'event' | 'note' | 'service';

// ── CHIPY ZANIKLI 21. 9. 2026 (Matej: „žiadne vysvetlovačky") ───────────────────────────────
// Do 21. 9. niesla každá dlaždica bežiaci rad chipov („🐾 Hike · 💪 Activity · 👀 Visit…"),
// ktorý si Matej 27. 8. sám vypýtal: *„mohli by sme pridať chipy s emoji čo všetko človek
// môže pridať… aby bolo hneď jasné, čo človek môže pridať."* Večer 21. 9. to prebil:
// *„ten popup pri + musí byť priamy, krátky, stručný, bez scrollu, nerozťahuj to tak!
// emoji a vedľa text, žiadne vysvetlovačky."*
//
// ⚠️ OBA POKYNY SÚ JEHO A NOVŠÍ PLATÍ — ale dôvod toho staršieho nezanikol: človek sa
//    o kempe či kliešťoch dozvie až o obrazovku ďalej. Keby sa chipy mali vrátiť, patria
//    na DRUHÚ úroveň (tam, kde sa aj tak vyberá typ), nie do rozcestníka.
// ⚠️ Zdroje taxonómie (`tripCategories.ts`, `eventModel.ts`, `mapNotesData.ts`) sa tým
//    NEMENIA — chipy si ich len ťahali.

// Prvá úroveň — dve dlaždice (Matej 2026-08-06: SERVICE preč z renderu, viď hlavičkový
// komentár). `Kind`/`disabled` tvar ostáva nezmenený pre vlnu 2 — SERVICE sa vtedy len pridá
// späť do tohto poľa, nič iné sa v komponente meniť nemusí.
// `right` = ktoré z ôsmich práv (§5) tá cesta potrebuje. Výlet stojí na DVOCH:
// formulár zapisuje prejdenú trasu (`trips.log`) a vie v ňom pribudnúť aj nová
// nakreslená (`trips.draw`) — stačí mať jedno z nich.
// ⚠️ PODUJATIE nemá vlastné zaškrtávatko a je to zámer: je to pozvanie ĽUDÍ
// v mene svorky, teda tá istá vec, čo `social` (správy a žiadosti). Deviate
// právo by muselo prejsť všetkými tromi miestami zoznamu (§5b).
type KindDef = { kind: Kind; emoji: string; titleKey: string; textKey: string; disabled?: boolean; points?: number; right?: PawmateRight | PawmateRight[] };

const KINDS: KindDef[] = [
  // ⚠️ BODY PATRIA SEM, NIE NA TLAČIDLO PRIDAŤ (Matej 2026-08-23: „má pridanie konkrétnu taxu?").
  // Tlačidlo otvára tri rôzne veci a každá je inak drahá — číslo na ňom by teda klamalo pri
  // dvoch z troch. Hodnoty sú z `lib/tripPoints.ts`; pri výlete je to ZÁKLAD, reálny výlet
  // býva vyšší (km, prevýšenie, nové pohorie).
  // 24. 8. 2026 dostali číslo aj zvyšné dve dlaždice (Matej: „pridanie odkazu je vždy bodované,
  // buď samostatne alebo v rámci pridania výletu"). Dlaždica ukazuje cenu ZA KUS — stropy
  // (9 v rámci výletu, 5 samostatných za deň) sa na ňu nepíšu, lebo v okamihu voľby ešte
  // nikto nevie, koľko značiek človek zapíše. Povie sa to až vtedy, keď na strop naozaj narazí.
  // 🥾 → 🐾 (matrica 24. 8. 2026): topánka je AKTIVITA „Hiking" o obrazovku ďalej. Dlaždica
  // VÝLET zastrešuje aj korčule, paddleboard a hrad — labka je jediné, čo platí na všetky.
  { kind: 'trip', emoji: '🐾', titleKey: 'pack.addTrip.entry.kind.trip.title', textKey: 'pack.addTrip.entry.kind.trip.text', points: POINTS.add, right: ['trips.log', 'trips.draw'] },
  // PRIANIE (24. 9. 2026) — bez bodov na dlaždici: body (+10 PÚTNIK) prídu až za SPLNENÉ
  // prianie s LOGom (§2.1 zadania), nie za pripnutie. Právo `social`: pin s „hľadám parťáka"
  // hovorí navonok, rovnako ako podujatie.
  { kind: 'wish', emoji: '🍑', titleKey: 'pack.addTrip.entry.kind.wish.title', textKey: 'pack.addTrip.entry.kind.wish.text', right: 'social' },
  { kind: 'event', emoji: '📣', titleKey: 'pack.addTrip.entry.kind.event.title', textKey: 'pack.addTrip.entry.kind.event.text', points: POINTS.event, right: 'social' },
  { kind: 'note', emoji: '💬', titleKey: 'pack.addTrip.entry.kind.note.title', textKey: 'pack.addTrip.entry.kind.note.text', points: POINTS.note, right: 'map.notes' },
];

// ── EMOJI PANELA — JEDNO MIESTO ─────────────────────────────────────────────────────────────
// 🔴 PANEL HOVORÍ EMOJI (Matej 21. 9. 2026: „namiesto emoji sú brand ikonky… emoji a vedľa
//    text"). Register (`createRegistry.ts`) ich ZÁMERNE nenesie: leží mimo schválených emoji
//    povrchov, takže by ich stráž `check:ikony` zarátala ako nový nález — a dve miesta na
//    jednu ikonku sa raz rozídu. Tento priečinok v tom zozname JE.
//
// 🔴 SADU VYBRAL MATEJ 22. 9. 2026 V NÁKRESE `plany/nakres-emoji-vyber-2026-09-22.html`
//    (celá ponuka 1 249 voľných emoji, hľadanie + skupiny Unicode; výber
//    `plany/emoji-vyber.json`). Osem zmien z desiatich je zapracovaných:
//      📝→🖼️ PRÍSPEVOK · 📄→📕 ČLÁNOK · 📓→✍️ DENNÍK · 🗣→🤖 ROZHOVOR ·
//      💡→📥 MOZOG · 📌→❓ NÁSTENKA · ✉️→💌 SPRÁVA · 👥→👪 SKUPINA
//    Všetky sú voľné a hlboko pod prahom (najvyššie 🤖 Emoji 1.0).
// 🔴 POSLEDNÉ DVE DORIEŠENÉ 22. 9. 2026 (druhé kolo):
//      · `service` **🏥** — Matejov prvý výber 💒 sa v Unicode volá *wedding* a kreslí sa
//        ako svadobná kaplnka so srdcom; pri veterine by to čítalo ako svadba. Po flagu:
//        *„aha tak dajme nemocnicu 🏬"*. 🏬 je ale *department store* — obchodný dom, a 🏥
//        v mojom zozname náhrad vôbec nebolo, takže si vzal najbližšiu budovu. **Platí
//        SLOVO, nie znak** → 🏥 (*hospital*, Emoji 0.6, voľné).
//      · `event` **ostáva 📣** — Matej dal na výber *„nechaj alebo daj 🎪"*, lenže 🎪 je
//        OBSADENÉ: `MAPA · expo` = veľtrh, teda jeden z ôsmich TYPOV podujatia. Dlaždica
//        so zhodným emoji ako jej vlastný podtyp je tvrdá kolízia. Ponúkol som ho omylom.
//        Pôvodný výber 📅 padol skôr: 🗓️ (spiral calendar) už nesie „Denník" v kalendári
//        a čip „note" v denníku — dva rôzne kódy, ktoré oko na 20 px nerozlíši.
// ⚠️ Register (`createRegistry.ts`) emoji ZÁMERNE nenesie: leží mimo schválených emoji
//    povrchov, takže by ich stráž `check:ikony` zarátala ako nový nález — a dve miesta na
//    jednu ikonku sa raz rozídu. Tento priečinok v tom zozname JE.
// 🔴 TENTO SLOVNÍK MERIA STRÁŽ VEKU: `node scripts/gen-znacky-data.mjs --overit` (sada
//    `panel3`). Do 22. 9. z panela videla len tri dlaždice mapy, ostatných desať nie.
// ⚠️ 🖼️ PRÍSPEVOK uvoľnilo 📝, ktoré kolidovalo s čipom „poznámka" v denníku.
const EMOJI: Record<CreateId, string> = {
  trip: '🐾', wish: '🍑', note: '💬', event: '📣', service: '🏥', article: '📕',
  diary: '✍️', photo: '📷',
  post: '🖼️',
  chat: '🤖', brain: '📥', board: '❓',
  dm: '💌', group: '👪',
};

/** Dlaždica podľa id objektu v registri. Mapové objekty kreslí panel, zvyšok register. */
const KIND_BY_ID: Partial<Record<string, KindDef>> = Object.fromEntries(KINDS.map((k) => [k.kind, k]));

// ── TEXTY PANELA ────────────────────────────────────────────────────────────────────────────
// ⚠️ DOČASNÉ ZNENIE, nie kánon — EN názvy si v zadaní §6 vyhradil Matej. Fallback je tu preto,
//    aby chýbajúci preklad nevyhodil na obrazovku holý kľúč, nie preto, že je schválený.
//    Kľúče `pack.create.title.*` a `pack.create.place.*` sú v `en.ts`/`sk.ts`.
// ⚠️ `place`, nie `group`: `pack.create.group.title` UŽ PATRÍ objektu „skupinový čet"
//    v registri. Dva významy pod jedným prefixom sa raz pomýlia.
const PLACE_TITLE: Record<CreatePlace, string> = {
  DOMOV: 'What are you adding?',
  VON: 'Add to the map',
  JA: 'Write it down for your dog',
  AINUBIS: 'Add to what you know',
  // GLOBÁL nie je miesto chrbtice a panel ho nikdy nedostane (lock §1.1) — tvar `Record`
  // ho napriek tomu pýta a prázdny reťazec by bol tichý prázdny nadpis.
  GLOBAL: 'Add',
};

/**
 * Štítok „čoskoro" S TERMÍNOM (lock §1.1.1: panel nesmie mať jedinú položku a dopĺňa sa
 * OHLÁSENÝM, nie vymysleným).
 *
 * ⚠️ Mesiac sa NEPREKLADÁ na názov. `11/2026` je zrozumiteľné v osemnástich jazykoch
 *    a nepotrebuje osemnásť tvarov skloňovaného mesiaca; slovo „čoskoro" preklad má.
 */
function soonLabel(soon: string | undefined, tx: (k: string, f: string) => string): string {
  const word = tx('pack.create.soon', 'Soon');
  if (!soon) return word;
  const [y, m] = soon.split('-');
  /* Len termín — riadok je stlmený, „čoskoro" hovorí sám. Panel má od 22. 9. šírku
     lišty (~310 px na PC) a „ČOSKORO · 11/2026" v ňom zalamoval názov do troch riadkov. */
  return `${Number(m)}/${y}`;
}

// Druhá úroveň pre TRIP — texty prevzaté 1:1 z pôvodných BLOCKS (needituje sa, len sa
// presúva sem, §2.2).
// ⚠️ NERENDERUJE SA od 22. 8. 2026 (rez C) — ostáva ako doklad, čo tu stálo, a ako
// zdroj i18n kľúčov, ktoré sa ešte používajú inde. Voľbu nahradil dátum vo formulári.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TRIP_BLOCKS: Array<{ state: TripState; emoji: string; titleKey: string; textKey: string }> = [
  { state: 'planned', emoji: '🗓️', titleKey: 'pack.addTrip.entry.planned.title', textKey: 'pack.addTrip.entry.planned.text' },
  { state: 'walked', emoji: '✅', titleKey: 'pack.addTrip.entry.walked.title', textKey: 'pack.addTrip.entry.walked.text' },
];

// Druhá úroveň pre EVENT (§2.2 + Matejov feedback 2026-08-06) — rovnaký vzor ako TRIP_BLOCKS.
const EVENT_BLOCKS: Array<{ origin: 'own' | 'tip'; emoji: string; titleKey: string; textKey: string }> = [
  // 🎃 (Matej 21. 9. 2026) — 📝 tu kolidovalo s denníkom v kalendári.
  { origin: 'own', emoji: '🎃', titleKey: 'pack.addTrip.entry.event.own.title', textKey: 'pack.addTrip.entry.event.own.text' },
  { origin: 'tip', emoji: '🔗', titleKey: 'pack.addTrip.entry.event.tip.title', textKey: 'pack.addTrip.entry.event.tip.text' },
];

export function AddTripEntry({ onPick, onClose, place, onCreate }: AddTripEntryProps) {
  const t = useT();
  // Názvy položiek panela sú v zadaní §6 ponechané MATEJOVI, takže register nesie kľúč
  // AJ dočasný text. `tx` je ten istý zvyk ako v `RightGate`/`DogPassport`: chýbajúci
  // preklad nesmie vyhodiť na obrazovku holý kľúč (CLAUDE.md, názvoslovie).
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };
  const [step, setStep] = useState<'kind' | 'trip' | 'event' | 'note'>('kind');
  const groups = useMemo(() => panelFor(place), [place]);

  // ── ŠUPLÍK NA MOBILE: ÚCHYT HORE, ŤAHANÍM NADOL SA ZAVRIE (Matej 21. 9. 2026) ─────────
  // „na mobiloch by to mohlo byť drop down ktorý by mal hore možnosť ho stiahnuť dolu
  //  ako to býva v niektorých apkách."
  // ⚠️ Panel sa počas ťahania posúva `transform`-om, nie zmenou výšky — výška by pri
  //    každom prste prepočítala layout celého zoznamu.
  // ⚠️ PRAH JE 96 px ALEBO RÝCHLY ŠVIH (nad 0,6 px/ms). Bez rýchlosti musí človek ťahať
  //    cez pol obrazovky; bez prahu by ho zavrelo aj mimovoľné zachvenie prsta.
  // ⚠️ `setPointerCapture` je nutnosť: prst odíde z úchytu skôr, než skončí ťah, a bez
  //    zachytenia prestane šuplík dostávať `pointermove` uprostred gesta.
  const [drag, setDrag] = useState(0);
  const dragRef = useRef<{ y: number; t: number } | null>(null);
  const onGrabDown = (e: React.PointerEvent) => {
    dragRef.current = { y: e.clientY, t: e.timeStamp };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onGrabMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setDrag(Math.max(0, e.clientY - dragRef.current.y));
  };
  const onGrabUp = (e: React.PointerEvent) => {
    const start = dragRef.current;
    dragRef.current = null;
    if (!start) return;
    const dy = e.clientY - start.y;
    const dt = Math.max(1, e.timeStamp - start.t);
    if (dy > 96 || dy / dt > 0.6) { onClose(); return; }
    setDrag(0);
  };

  // Bez krížika je Escape jediná cesta von pre toho, kto neťuká myšou vedľa panela.
  // Poslucháč visí na dokumente, nie na paneli — ten nemá fókus, kým človek na niečo neklikne.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  /**
   * JEDEN RIADOK PONUKY — emoji vľavo, názov vedľa, nič ďalšie.
   *
   * 🔴 TVAR JE MATEJOVO ZADANIE Z 21. 9. 2026 večer: *„ten popup pri + musí byť priamy,
   *    krátky, stručný, bez scrollu, nerozťahuj to tak! emoji a vedľa text, žiadne
   *    vysvetlovačky."* Prebíja to dlaždicovú podobu, ktorá tu stála od 26. 8. (veľký glyf,
   *    podnadpis, bežiaci rad chipov) — tá bola tiež jeho, ale staršia.
   *
   * ⚠️ PODNADPIS SA NEVRACIA. Vysvetlenie („bol som · alebo plánujem") patrí do obrazovky,
   *    ktorá sa po kliku otvorí, nie do rozcestníka. Rozcestník má byť prečítateľný jedným
   *    pohľadom a vojsť sa bez scrollu — to je celý jeho účel.
   * ⚠️ PILULKA BODOV OSTÁVA. Nie je to vysvetlivka, je to cena za kus a Matej si ju sám
   *    vypýtal 24. 8. (*„pri kliknutí na pridať je tam +20… chýba BODOV"*). Drží sa vpravo,
   *    takže riadok nepredlžuje.
   */
  const kindTile = (k: KindDef) => (
    /* Zápisy z tohto rázcestia patria MNE (`user_id`), nie psovi — km sú moje (R2).
       Preto gate bez `dogId`: stačí, že mi to právo dal aspoň jeden majiteľ. */
    <RightGate key={k.kind} right={k.right ?? 'trips.log'}>
      <button
        type="button"
        className="att-entry-row"
        onClick={() => {
          // ⏳ DRUHÁ ÚROVEŇ PRE VÝLET ZANIKLA (Matej 22. 8.). Bola to otázka „prešli ste to,
          // alebo sa chystáte?", na ktorú odpoveď leží o pár polí nižšie — v dátume.
          // Meranie (v1-posthog): tu sa začína zápis výletu; pár k nemu je
          // `pack_trip_add_done` v `PackMap`.
          if (k.kind === 'trip') { trackPack('pack_trip_add_start'); onPick({ kind: 'trip', state: 'walked' }); }
          if (k.kind === 'wish') onPick({ kind: 'wish' });
          if (k.kind === 'event') setStep('event');
          if (k.kind === 'note') setStep('note');
        }}
      >
        <span className="att-entry-emoji" aria-hidden="true">{EMOJI[k.kind as CreateId]}</span>
        <span className="att-entry-title">{t(k.titleKey)}</span>
        {/* JEDNOTKA MUSÍ BYŤ PRI ČÍSLE a SKLOŇUJE SA (Matej 24. 8.): dlaždice nesú 20 / 10 / 3,
            teda dva slovenské tvary naraz. */}
        {/* PODUJATIE dáva body až PO USKUTOČNENÍ (Matej 24. 9. 2026) — „+10 bodov" pri
            založení by sľubovalo niečo, čo za založenie nepríde. */}
        {!!k.points && (
          <span className="att-entry-pts">
            {k.kind === 'event'
              ? t('pack.addTrip.entry.eventPts', { n: k.points })
              : <>+{t(`pack.points.unit.${k.points === 1 ? 'one' : k.points < 5 ? 'few' : 'many'}`, { n: k.points })}</>}
          </span>
        )}
      </button>
    </RightGate>
  );

  /**
   * Riadok objektu z registra — denník, fotka, rozhovor, znalosť, nástenka, príspevok.
   * Ten istý tvar ako vyššie; líši sa len tým, že text aj stav berie z registra.
   *
   * ⚠️ Ohlásené („čoskoro") sa vykreslí, ale neklikne — lock §1.1.1: panel nesmie mať
   *    jedinú položku a dopĺňa sa OHLÁSENÝM, nie vymysleným.
   */
  const objectTile = (o: CreateObject) => {
    const ready = isReady(o);
    return (
      <button
        key={o.id}
        type="button"
        className={`att-entry-row${ready ? '' : ' att-entry-row--soon'}`}
        disabled={!ready}
        aria-disabled={!ready}
        onClick={() => { if (ready) onCreate?.(o); }}
      >
        <span className="att-entry-emoji" aria-hidden="true">{EMOJI[o.id]}</span>
        <span className="att-entry-title">{tx(o.labelKey, o.labelFallback)}</span>
        {isSoon(o) && <span className="att-entry-soon">{soonLabel(o.soon, tx)}</span>}
      </button>
    );
  };

  return (
    <div
      className="att-entry-backdrop"
      onClick={onClose}
      role="button"
      tabIndex={-1}
      aria-label={t('pack.addTrip.entry.closeAriaLabel')}
    >
      <style>{ENTRY_CSS}</style>
      <div
        className="att-entry-panel"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={drag ? { transform: `translate(-50%, ${drag}px)`, transition: 'none', animation: 'none' } : undefined}
      >
        {/* ÚCHYT — na mobile je to jediná vec nad zoznamom a dá sa ním šuplík stiahnuť dolu.
            Na PC ho CSS skryje: tam je panel v strede okna a zatvára sa klikom vedľa. */}
        <span
          className="att-entry-grab"
          aria-hidden
          onPointerDown={onGrabDown}
          onPointerMove={onGrabMove}
          onPointerUp={onGrabUp}
          onPointerCancel={onGrabUp}
        />
        {/* ⚠️ KRÍŽIK ZANIKOL (Matej 2026-08-26: „odstráň krížik… stačí len klik vedľa").
            Zatvára sa klikom na podklad (`att-entry-backdrop` vyššie) a klávesou Escape —
            popup nemá žiadny nevratný účinok, takže východ nepotrebuje vlastný ovládací
            prvok. Padol tým aj celý spor z 5. 8. o tom, ako ďaleko má krížik stáť od rámu.
            Kľúč `pack.addTrip.entry.closeAriaLabel` ostáva — nesie ho podklad. */}

        {/* ── JEDEN NÁVRAT PRE OBE ÚROVNE (Matej 2026-09-13) ────────────────────────────
            „cta prekrývajú zadnú šípku (šípky nemáme)" — šípku /pack MÁ a je locknutá
            (`BackButton.tsx`, LOCKED 2026-09-01, na Matejovu požiadavku „mali by sme ju
            ujednotiť aj veľkostne všade"). Volá ju osem povrchov; tento popup bol deviaty
            a jediný, ktorý ju NEPOUŽIL — druhú úroveň vracal TEXTOVÝ ODKAZ „‹ Späť na výber"
            absolútne prilepený vľavo hore, kým vedľa v tom istom priestore stál locknutý
            kruh na zatvorenie. Dva jazyky pre to isté gesto na jednej obrazovke, a odkaz
            si navyše ako absolútny prvok nerezervoval výšku, takže ho dlaždice prekryli.
            ⚠️ JE TO JEDEN PRVOK, nie dva vedľa seba. Na obrazovke je vždy práve jeden
            zmysel: na kroku „čo pridávam" vedie VON, na druhej úrovni NA VÝBER. Dva
            elementy s rovnakou polohou sa raz rozišli (jeden kruh, jeden text) a druhý
            raz by si prekryli klikaciu plochu.
            ⚠️ Von z prvej úrovne je viditeľný LEN v celoobrazovkovej podobe — plávajúci
            blok sa zatvára klikom vedľa (lock 26. 8.: „odstráň krížik… stačí len klik
            vedľa"). Rozhoduje CSS (`--close` v PALE_ADD_CSS, PackMap.tsx), nie meranie
            šírky v JS. Návrat z druhej úrovne je viditeľný vždy — klik vedľa by z nej
            neviedol o krok späť, ale zahodil celý popup.
            ⚠️ Nie je to návrat krížika: lock hovorí o ZATVORENÍ plávajúceho bloku, toto je
            návrat v toku a ten má v pridávaní vlastný tvar od 1. 9. */}
        <button
          type="button"
          className={`att-entry-nav${step === 'kind' ? ' att-entry-nav--close' : ''}`}
          onClick={() => (step === 'kind' ? onClose() : setStep('kind'))}
          aria-label={t(step === 'kind' ? 'pack.addTrip.entry.closeAriaLabel' : 'pack.addTrip.entry.backAriaLabel')}
        >
          <BackIcon />
        </button>
        {step === 'kind' && (
          <div className="att-entry-reg" role="group" aria-label={tx(`pack.create.title.${place}`, PLACE_TITLE[place])}>
            {/* NADPIS ANI ŠTÍTKY SKUPÍN UŽ NIE SÚ (Matej 22. 9.: „nadpis daj preč, budú tam
                len tlačidlá… nie pridať k vedomostiam a pod."). Veta hore žije ďalej ako
                aria-label; skupiny na DOMOVE oddeľuje len medzera. */}
            {groups.map((g) => (
              <div className="att-entry-grp" key={g.group ?? '_'}>
                {/* Hlavička skupiny je LEN na DOMOVE (inde je `group` null) — nadpis nad
                    jedinou skupinou, v ktorej človek práve stojí, nehovorí nič. */}
                <div className="att-entry-list">
                  {/* 🔒 Dlaždica PODUJATIE je za `EVENTS_LIVE` (15. 9. 2026): na LIVE pre podujatia
                      neexistuje ani schéma a formulár píše len do localStorage, takže by človek
                      zakladal podujatie, ktoré nikto nikdy neuvidí. Odôvodnenie v `lib/packFlags.ts`.
                      Od 22. 9. sa neskrýva, ale kreslí ako „čoskoro" (nižšie).
                      Filtruje sa TU, nie v registri — register je zoznam toho, čo v appke VZNIKÁ,
                      a podujatia vzniknú; toto je príznak prostredia, nie stav objektu. */}
                  {g.items.map((o) => {
                    /* 🔒 → ČOSKORO (Matej 22. 9. 2026: „tu chýba podujatia, tu nie je, ale
                       v ľavom paneli je na zámku = nedáva to zmysel"). Do vtedy sa dlaždica
                       SKRÝVALA, kým záložka EVENTS v ľavom paneli mapy svietila so zámkom —
                       jedna vec, dve odpovede. Teraz rovnaký riadok ako SLUŽBA: vidno ho,
                       neklikne sa. Dôvod zámku ostáva v `lib/packFlags.ts`. */
                    // PRIANIE rovnako (26. 9. 2026): migrácie bežia len na DEV.
                    if ((o.id === 'event' && !EVENTS_LIVE) || (o.id === 'wish' && !WISHES_LIVE)) {
                      return (
                        <button key={o.id} type="button" className="att-entry-row att-entry-row--soon" disabled aria-disabled>
                          <span className="att-entry-emoji" aria-hidden="true">{o.id === 'wish' ? EMOJI.wish : EMOJI.event}</span>
                          <span className="att-entry-title">{tx(o.labelKey, o.labelFallback)}</span>
                          <span className="att-entry-soon">{soonLabel(undefined, tx)}</span>
                        </button>
                      );
                    }
                    const k = KIND_BY_ID[o.id];
                    // Mapový objekt kreslí panel sám a vie o ňom viac než register: emoji,
                    // body za zápis, potrebné právo aj chipy taxonómie. Register mu to
                    // ZÁMERNE neopisuje (`icon: { kind: 'panel' }`) — dve miesta na jednu
                    // ikonku sa raz rozídu.
                    return k ? kindTile(k) : objectTile(o);
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* `step === 'trip'` sa už nenastavuje — viď komentár pri kliku na dlaždicu VÝLET. */}
        {step === 'note' && (
          <div className="att-entry-note">
            <p className="att-entry-lead">{t('pack.mapNotes.palette.lead')}</p>
            <NotePalette onPick={(group) => onPick({ kind: 'note', group })} />
          </div>
        )}
        {step === 'event' && (
          /* Druhá úroveň má TEN ISTÝ tvar ako prvá — riadok emoji + názov. Podnadpis
             („koná sa v termíne" / „z odkazu") odišiel spolu s ostatnými vysvetlivkami. */
          <div className="att-entry-list">
            {EVENT_BLOCKS.map((b) => (
              <button key={b.origin} type="button" className="att-entry-row" onClick={() => onPick({ kind: 'event', origin: b.origin })}>
                <span className="att-entry-emoji" aria-hidden="true">{b.emoji}</span>
                <span className="att-entry-title">{t(b.titleKey)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ENTRY_CSS = `
/* ══ PANEL + = PAPYRUS VYSUNUTÝ ZO SPODNEJ LIŠTY (Matej 22. 9. 2026) ════════════════════
   „popup pri + na každej obrazovke musí byť bledý štýl a musí sa vysunúť zo spodného navu
    v jeho šírke."
   ⛔ Do 22. 9. bol panel v strede okna (PC) alebo šuplík cez celú šírku (mobil) a bledý
      bol LEN na mape — PackMap ho prebíjal s predponou .trp-root, inde svietilo čierne sklo.
      Šat aj poloha sú odteraz TU a nikde inde.
   · ŠÍRKA = šírka baru lišty (--pack-nav-half × 2, publikuje PackLayout), PC aj mobil.
   · POLOHA = tesne nad barom: odstup baru od spodku + jeho výška + výčnelok kotúča „+“
     (--pack-medal-rise) + medzera. Vysúva sa zdola, akoby vyšiel z lišty.
   · ŠAT = zlatý odliatok goldFrameCSS() — TEN ISTÝ zdroj ako bar lišty, takže panel
     a lišta sú jeden materiál. Riadky = PODBLOK na papyruse (cardGrad + cardEdge).
   🔴 Z-INDEX 1300: na mape má pilulka ZOZNAM 900 a peek bublina 1200 (21. 9. 2026). */
.att-entry-backdrop{position:fixed;inset:0;z-index:1300;background:rgba(24,14,4,0.45);}
/* ⚠️ goldFrameCSS() STOJÍ PRVÝ — nesie position:relative a za position:fixed by ho prebil. */
.att-entry-panel{${goldFrameCSS()}
  position:fixed;left:50%;transform:translateX(-50%);
  --att-gap:calc(var(--pack-nav-bottom, 12px) + var(--pack-nav-h, 64px) + var(--pack-medal-rise, 0px) + 12px);
  bottom:var(--att-gap);
  width:min(calc(2 * var(--pack-nav-half, 260px)), calc(100vw - 16px));
  max-height:calc(100% - var(--att-gap) - 16px);
  overflow-y:auto;overscroll-behavior:contain;padding:48px 12px 12px;
  animation:att-entry-rise .22s cubic-bezier(.2,.8,.2,1);transition:transform .18s ease;}
@keyframes att-entry-rise{from{opacity:0;transform:translate(-50%,32px);}to{opacity:1;transform:translate(-50%,0);}}
@media (prefers-reduced-motion:reduce){.att-entry-panel{animation:none;}}

/* ── ÚCHYT — len na mobile (ťahom nadol sa panel zavrie). */
.att-entry-grab{display:none;}

/* ── SKUPINY (bez nadpisu a štítkov od 22. 9.) ─────────────────────────────────────────────────────────────
   Jeden krátky riadok, čo sa tu pridáva. Štítok skupiny je LEN na DOMOVE. */
.att-entry-grp + .att-entry-grp{margin-top:12px;}
/* Na prvej úrovni nad tlačidlami nie je nič — úchyt (mobil) alebo rovno prvé tlačidlo. */

/* ── RIADOK PONUKY: EMOJI + NÁZOV, NIČ VIAC (Matej 21. 9. 2026) ──────────────────────
   „priamy, krátky, stručný, bez scrollu… emoji a vedľa text, žiadne vysvetlovačky."
   ⚠️ VÝŠKA RIADKU JE ROZPOČET, NIE VKUS: na DOMOVE je desať položiek a tri hlavičky
   skupín a má sa to vojsť BEZ SCROLLU. Pri 8/4 sa vojde, pixel navyše vyhodí poslednú
   položku pod hranu. */
.att-entry-list{display:flex;flex-direction:column;gap:4px;}
.att-entry-row{position:relative;display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:${T.cardGrad};border:1px solid ${T.cardEdge};border-radius:${PLATE_TILE_R}px;padding:8px 12px;cursor:pointer;transition:border-color .15s ease,background .15s ease;}
.att-entry-row:hover,.att-entry-row:focus-visible{border-color:${T.inkWarm};outline:none;}
.att-entry-row--soon{opacity:.45;cursor:default;}
.att-entry-row--soon:hover,.att-entry-row--soon:focus-visible{border-color:${T.cardEdge};}
/* Emoji má vlastný font-family, inak naň sadne zdedený Cinzel a na Windows sa z 🅿️ stane
   obdĺžnik. Pevná šírka drží názvy pod sebou v jednej zvislej osi. */
.att-entry-emoji{flex:0 0 auto;width:28px;font-family:${FONT_EMOJI};font-size:22px;line-height:1;text-align:center;}
.att-entry-title{flex:1 1 auto;min-width:0;font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:${T.inkStrong};
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
/* ⚠️ NÁZOV JE VŽDY NA JEDEN RIADOK (Matej 22. 9.: „nezalamuj texty… musia byť vždy na jeden
   riadok"). Panel má šírku lišty (~310 px na PC), preto termín „čoskoro" nestojí vedľa
   názvu, ale ako ŠTÍTOK NA HORNEJ HRANE riadku — šírku názvu nezje. Tri tečky sú len
   poistka pre budúci dlhší preklad, nie plán. */
/* BODY V LAPISOVEJ PILULKE (Matej 26. 8.: „body budú v modrom pilse") — odmena je „moje". */
.att-entry-pts{flex:0 0 auto;padding:3px 8px;border-radius:999px;background:${LAPIS.grad};border:1px solid ${LAPIS.deep};font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;color:${LAPIS.ink};}
.att-entry-soon{position:absolute;top:-7px;right:12px;padding:0 6px;border-radius:999px;border:1px solid ${T.cardEdge};background:#FBF5E6;font-family:${FONT_UI};font-weight:600;font-size:10px;line-height:14px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;color:${T.inkWarm};}
/* Štítok presahuje hornú hranu — medzera nad riadkom so štítkom, aby nesadol na suseda. */
.att-entry-row--soon{margin-top:4px;}

/* ── NÁVRAT V TOKU ───────────────────────────────────────────────────────────────────
   backCircleCSS nesie priemer, lem aj farby (BackButton.tsx, LOCKED 2026-09-01).
   ⚠️ Na PRVEJ úrovni je skrytý: von sa ide klikom vedľa alebo Escape (lock 26. 8.). */
.att-entry-nav{position:absolute;top:12px;left:50%;transform:translateX(-50%);${backCircleCSS('pale')}}
.att-entry-nav:hover{${backHoverCSS('pale')}}
.att-entry-nav--close{display:none;}
/* Na prvej úrovni návrat nie je, horná výplň pre neho by bola prázdny pás. */
.att-entry-panel:has(.att-entry-nav--close){padding-top:16px;}

.att-entry-note{padding-top:4px;}
.att-entry-lead{margin:0 0 12px;font-family:${FONT_UI};font-size:12px;line-height:1.5;color:${T.inkWarm};}

/* ── MOBIL: ÚCHYT NAD ZOZNAMOM (Matej 21. 9. 2026) ────────────────────────────────────
   „drop down, ktorý by mal hore možnosť ho stiahnuť dolu". Poloha a šírka sú tie isté
   ako na PC — bar lišty je na telefóne takmer cez celé okno, panel s ním.
   ⚠️ env(safe-area-inset-bottom) tu netreba: panel stojí NAD lištou, nie na hrane okna. */
@media (max-width:640px){
  .att-entry-panel,.att-entry-panel:has(.att-entry-nav--close){padding:4px 12px 12px;}
  .att-entry-grab{display:block;width:100%;padding:8px 0 8px;background:none;border:0;cursor:grab;touch-action:none;}
  .att-entry-grab::before{content:'';display:block;width:44px;height:4px;margin:0 auto;border-radius:999px;background:rgba(179,130,45,0.26);}
  .att-entry-grab:active{cursor:grabbing;}
  /* Návrat sa na mobile nevznáša nad obsahom — stojí v riadku pod úchytom. */
  .att-entry-nav{position:static;transform:none;margin:0 0 8px;}
}
`;
