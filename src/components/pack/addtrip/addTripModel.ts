// ADD TRIP — dátový model (vlna 1, plany/zadanie-addtrip-flow-2026-07-27.md §3).
// Jedna entita, dva stavy (planned/walked) namiesto dvoch nezávislých foriem ako dnes v
// PackMap.tsx. `approval` je napísaný v cieľovom tvare pre vlnu 2 (Supabase schvaľovacia
// fronta), ale vo vlne 1 sa nič neschvaľuje na serveri — len sa model SPRÁVA správne
// (draft/pending badge), perzistencia ostáva localStorage (`trp-local-trails`, tripShared.tsx).
import type { LatLngTuple } from 'leaflet';
import type { Companion } from '@/components/pack/packCommunityUI';
import { CATEGORY_BY_ID, primaryCategoryOf } from '@/components/pack/tripCategories';

export type TripState = 'planned' | 'walked';
export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'needs_fix' | 'rejected';
export type GeometryKind = 'route' | 'point' | 'area';
/**
 * DOPRAVA NA VÝLET (2026-08-26). Jedna voľba z troch — poradie je poradím na obrazovke.
 * ⚠️ BOLO ICH ŠESŤ (bicykel, pešo, dodávka) a Matej ich v ten istý deň zmazal: „stačia
 * 3 možnosti auto vlak a bus". Zmysel voľby je zorganizovať spoločný odchod, nie opísať
 * cestu — kto ide pešo alebo na bicykli, nikoho nevezie a nikto sa k nemu nepridáva.
 * Emoji ani preklady tu nie sú: model nesie kľúč, jazyk rieši i18n (`pack.addTrip.plan.travel.*`)
 * a obrázok formulár. Rovnaká konvencia ako pri aktivitách.
 */
export type TravelMode = 'car' | 'train' | 'bus';

/**
 * Uložený tvar dopravy. Žije na `PartnerEvent.travel` a v stĺpci `trip_events.travel` (jsonb).
 * `mode` je zámerne `string`, nie `TravelMode`: v DB môže ležať hodnota zapísaná staršou
 * verziou appky (kedysi tam boli aj bicykel/pešo/dodávka) a zúžený typ by pri čítaní klamal.
 * Čítač si preto emoji aj názov berie cez `TRAVEL_EMOJI[mode]` / slovník s fallbackom.
 */
export type TravelInfo = { mode?: string; from?: string; pickup?: boolean; seats?: number };

/**
 * DOPRAVA NA VÝLET (Matej 2026-08-26) — posledný krok plánu.
 * Býva na DVOCH povrchoch (formulár aj karta plánu), preto stojí v modeli, nie v jednom z nich.
 * Poradie je poradím na obrazovke: najprv to, čím sa ide najčastejšie.
 * ⚠️ EMOJI, nie hand-drawn set. Je to tá istá výnimka, akú drží rad aktivít vyššie —
 * kit nemá vlak, autobus ani dodávku, a pol radu v jednom jazyku a pol v druhom je horšie
 * než celý rad v emoji. Sada je Emoji 1.0 (to isté kritérium, kvôli ktorému padol 🪜).
 * ⚠️ Preklad si berie komponent cez `pack.addTrip.plan.travel.<id>` — `label` tu NIE JE,
 * lebo by sa rozišiel so slovníkom v deň, keď sa slovník zmení.
 */
export const TRAVEL_MODES: Array<{ id: TravelMode; emoji: string }> = [
  { id: 'car', emoji: '🚗' },
  { id: 'train', emoji: '🚆' },
  { id: 'bus', emoji: '🚌' },
];
/** Emoji podľa kľúča — karta plánu má len uložený reťazec, nie celý riadok dlaždíc. */
export const TRAVEL_EMOJI: Record<string, string> = Object.fromEntries(TRAVEL_MODES.map((m) => [m.id, m.emoji]));


// DVOJVRSTVOVÝ MODEL TRASY (Matej 2026-07-29, feedback_kotvy_vs_odvodena_geometria):
// `path` = KOTVY, presne to čo človek naklikal — undo maže odtiaľto, editor ich ťahá.
// `snapPath` = ODVODENÁ stopa, kotvy poprepájané snapnutou geometriou (bod každých ~8 m).
// Zliať ich do jedného poľa sa už raz stalo (batch snap 2026-07-27) a znemožnilo to editovanie
// trás — Matej ich pred launchom prechádza jednu po druhej, takže kotvy musia prežiť.
//
// PRAVIDLO PRE VŠETKY VRSTVY: čo sa ZOBRAZUJE a z čoho sa POČÍTA (km, prevýšenie, KČT značky)
// = `snapPath ?? path`. Čo sa EDITUJE = `path`. Nikdy naopak.
export type TripGeometry =
  | {
      kind: 'route';
      path: LatLngTuple[];        // kotvy (naklikané body)
      snapPath?: LatLngTuple[];   // odvodená stopa; undefined = snap nikdy nebežal
      snapped: boolean;           // aspoň jeden úsek reálne sadol na chodník
      hideStartM?: number;
      /**
       * CIEĽ TRASY (Matej 2026-08-23) — index do `path`, nie samostatná súradnica.
       * Súradnica navyše by sa pri „späť o bod" rozišla s trasou a ukazovala by cieľ tam,
       * kde už žiadna kotva nie je. Kreslí sa `TRIP_TARGET_EMOJI` (markEmoji.ts).
       */
      targetIdx?: number;
      /**
       * Ako sa človek vracal, keď označil cieľ. `continue` = kreslí ďalej ·
       * `loop` = okruh inou cestou (lišta ponúkne uzavretie pri štarte) ·
       * `mirror` = tá istá trasa naspäť (kotvy sú už zrkadlené, viď `mirroredFrom`).
       */
      returnMode?: 'continue' | 'loop' | 'mirror';
      /**
       * Počet kotiev PRED zrkadlením. „Späť o bod" po zdvojení musí vrátiť CELÉ zdvojenie —
       * inak ostane pol trasy tam a pol späť a človek to nemá ako opraviť inak než zmazaním.
       */
      mirroredFrom?: number;
      /**
       * NAJMENŠÍ MOŽNÝ ZÁPIS (Matej 2026-08-23): dva body — štart a cieľ — bez trasy medzi nimi.
       * Nesnapuje sa (snap by vymyslel cestu, kadiaľ človek nešiel) a NEPOČÍTA sa z toho km:
       * vzdušná čiara nie je dĺžka výletu a tvrdiť ju by pokazilo aj rebríček kilometrov.
       */
      minimal?: boolean;
    }
  | { kind: 'point'; center: LatLngTuple }
  | { kind: 'area'; center: LatLngTuple; radiusM: number };

// Geometria, z ktorej sa počíta a ktorá sa kreslí (nie tá, ktorá sa edituje).
export function displayPath(g: TripGeometry): LatLngTuple[] {
  return g.kind === 'route' ? (g.snapPath ?? g.path) : [];
}

// ── „Hide the first 300 m" (§5.4) ───────────────────────────────────────────────────────
// Chráni domácu adresu autora. Km a prevýšenie sa počítajú z CELEJ trasy — oreže sa výhradne
// to, čo vidia ostatní. Autor vidí svoju trasu celú, preto `viewerIsAuthor`.
//
// Bez tejto funkcie by orezanie robil každý povrch po svojom a jeden zabudnutý (share karta,
// PDF, mapa v detaile) by adresu vyzradil — preto je to jedno miesto, nie podmienka v UI.
export function publicPath(g: TripGeometry, viewerIsAuthor = false): LatLngTuple[] {
  const full = displayPath(g);
  if (g.kind !== 'route' || viewerIsAuthor) return full;
  const hide = g.hideStartM ?? 0;
  if (hide <= 0 || full.length < 2) return full;

  let acc = 0;
  for (let i = 1; i < full.length; i++) {
    acc += havM(full[i - 1], full[i]);
    if (acc >= hide) return full.slice(i);
  }
  // trasa je kratšia než skrývaná časť — radšej ukáž posledný bod než prezraď štart
  return full.slice(-1);
}

// lokálna haversine — addTripGeo.ts je 1:1 port Python skriptu a drží kalibráciu; model si
// odtiaľ neťahá závislosť kvôli jednému výpočtu vzdialenosti.
function havM(a: LatLngTuple, b: LatLngTuple): number {
  const R = 6371000;
  const p1 = (a[0] * Math.PI) / 180;
  const p2 = (b[0] * Math.PI) / 180;
  const dp = ((b[0] - a[0]) * Math.PI) / 180;
  const dl = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export type AddTripDraft = {
  id: string;
  state: TripState;
  approval: ApprovalStatus;
  // spoločné
  name: string;
  activity: string;              // TRIP_ACTIVITIES id (PackMap.tsx ~190)
  geometry: TripGeometry;
  country: string;                // ISO2 — auto z geometrie, manuálny override možný
  region?: 'W' | 'C' | 'E';      // LEN pre SK; inak undefined
  mountains?: string;             // pohorie — AUTO po schválení, NIKDY sa nezadáva ručne
  // dátum
  dateKind: 'exact' | 'month' | 'flexible';
  date?: string;                  // 'YYYY-MM-DD' | 'YYYY-MM' | undefined pri flexible
  // MULTIDAY (Matej 2026-07-29: „date zmizol multiday!") — regresia z prestavby: starý flow mal
  // toggle „+ multi-day" + End date a práve tá dvojica odomykala aktivitu `journey`
  // (PackMap pred prestavbou: `isMultiDay = addMultiTrip && addDateEnd > addDate`,
  // `journeyOk = isMultiDay && drawKm >= 50`). Bez toho sa viacdňový výlet nedá zadať vôbec.
  dateEnd?: string;               // 'YYYY-MM-DD' — koniec viacdňového tripu
  /**
   * 🔴 JEDINÝ ZDROJ VIACDŇOVOSTI (Matej 2026-08-27, krok 1 sprievodcu).
   * Do 27. 8. sa odvodzovala z `dateEnd > date` — teda z poľa, ktoré človek vypĺňa AŽ
   * v 3. kroku. Nocľahy z 2. kroku tak viseli na príznaku, ktorý sa mohol o dve obrazovky
   * ďalej sám vypnúť (stačilo zadať rovnaký dátum) a zmizli by bez slova.
   * Odteraz sa appka pýta rovno v 1. kroku a dátum príznak UŽ NEPREPÍNA — len ho plní.
   * ⚠️ Prepnutie späť na jednodňovú musí zahodiť `dateEnd` aj nocľahy (viď AddTripLog).
   */
  multiDay?: boolean;
  // VIDITEĽNOSŤ (issue #42) — LEN pre `planned`. Rozhoduje sa TU, pri zakladaní, nie skryté
  // v nastaveniach: `'private'` (default, konzervatívne) = nikto cudzí trip nevidí ani nemôže
  // požiadať o pridanie; `'open'` = "Looking for pack" inzerát, presne ako doterajší
  // WishlistIntentPopup partner-flow (PackMap.tsx `choosePartner`). Bez tohto poľa PackMap
  // (`submitAddTripDraft`) doteraz KAŽDÝ naplánovaný výlet automaticky publikoval ako
  // `status:'looking', openness:'open'` + verejný `trip_events` inzerát — člen o tom nevedel
  // a nič si nevyberal.
  visibility?: 'private' | 'open';
  /**
   * ── AKO SA NA VÝLET IDE (Matej 2026-08-26) — LEN PLÁN ────────────────────────────────
   *
   * „doprava na miesto… ako idem na výlet (autom, vlakom…) a odkiaľ idem, ľudia sa môžu
   *  vyzdvihnúť po ceste."
   *
   * Na zápise prejdeného výletu to nemá zmysel — je to informácia PRE TÝCH, ktorí sa ešte
   * len rozhodujú, či sa pridajú. Preto sa pýta v poslednom kroku plánu, vedľa dátumu, a do
   * draftu ide len keď `state === 'planned'` A človek nejde sám.
   *
   * 🔴 NEUKLADÁ SA K VÝLETU, ALE K INZERÁTU (Matej 2026-08-26: „doprava sa nikde inde
   * nezapisuje, je to len organizačná pomôcka eventripu, nejde to nikde do štatistík,
   * ukladá sa len to, čo definuje samotný trip").
   * Preto `HeroTrail` pole `travel` NEMÁ — nesie ho `PartnerEvent` (packCommunity.ts).
   * Rozdiel je vecný: trasa Záruby je tá istá o rok, ale „ideme vlakom z Bratislavy"
   * platí pre JEDEN spoločný odchod. Keby to sedelo na výlete, po prejdení by tam ostalo
   * viselo ako údaj o trase.
   *
   * ⚠️ SPÔSOB JE JEDEN, NIE MNOŽINA (Matejova voľba 26. 8. — z dvoch ponúknutých tvarov).
   * Kombinácia „vlakom a odtiaľ pešo" sa teda povie v detailoch plánu, nie tu.
   * ⚠️ ODKIAĽ je VOĽNÝ TEXT, nie bod na mape (tá istá voľba). Dôsledok, s ktorým treba
   * rátať: appka z toho nikdy nevypočíta, komu kto leží po ceste — „po ceste" ostáva
   * dohodou dvoch ľudí v správe, nie funkciou. Keby sa to raz malo počítať, pole musí
   * dostať súradnicu a to je iná zmena, nie doplnenie.
   */
  travelMode?: TravelMode;
  travelFrom?: string;
  /** „Viem niekoho vyzdvihnúť po ceste" — má význam len pri `visibility === 'open'`. */
  pickup?: boolean;
  /** Koľko miest ostáva voľných. Bez `pickup` sa neukladá. */
  pickupSeats?: number;
  // pack
  crew: Companion[];              // CompanionPicker, existujúci typ (packCommunityUI.tsx)
  // len walked
  km?: number; ascentM?: number; elev?: number[];
  /**
   * Odhad času v minútach (SAC — `lib/tripTime.ts`). Ukladá sa PRI ZÁPISE, neráta sa pri
   * zobrazení: karta výletu nemá prevýšenie ani klesanie, a keby sa raz zmenilo tempo, všetky
   * staré výlety by ticho zmenili čas — hoci ich nikto neprešiel znova.
   */
  minutes?: number;
  diff?: 'Easy' | 'Moderate' | 'Hard' | 'Odyssey';
  crowd?: string; surface?: string[]; tags?: string[];
  /**
   * ── CHIPY KROKU 4 — „ČO SME TAM ROBILI" (2026-08-31) ────────────────────────────────────
   *
   * Id z `TripCategory.chips` (`tripCategories.ts`). Sem ich píše FORMULÁR; pri ukladaní sa
   * vlievajú do `HeroTrail.acts` SPOLU s kategóriou (§2.3 zadania) — jedno pole, jeden
   * mechanizmus, filter ich číta rovnako. Druhé pole na uloženom výlete sa nezakladá: údaj
   * odvoditeľný z iného po prvej úprave klame.
   * ⚠️ Smú tu byť aj chipy CUDZEJ kategórie — druhý, zbalený rad kroku 4 je presne na to, aby
   * túra smela niesť piknik bez toho, aby sa piknik ponúkal tam, kde nedáva zmysel.
   */
  chips?: string[];
  hazards?: string[];             // vrátane custom (§7 — text sa zobrazí, nefiltruje kým ho Matej neschváli)
  paws?: number;                  // 1–5, bez polovičných
  photos?: string[];
  // TITULNÁ FOTKA (Matej 2026-07-29) — ktorá fotka reprezentuje trip v náhľadoch/kartách.
  // `coverY` = zvislé ťažisko výrezu v % (0 = horný okraj, 100 = dolný), ide priamo do
  // `background-position` / `object-position`. Náhľady sú 16:9, ale fotky bývajú na výšku —
  // bez posunu výrezu sa z portrétu ukáže krk psa namiesto hlavy.
  coverIndex?: number;            // index do `photos`; undefined = prvá
  coverY?: number;                // 0–100 %, default 50
  note?: string;                  // krátky text o výlete
  /**
   * KROK SPRIEVODCU, na ktorom sa práve stojí (1–5, viď AddTripLog). Ukladá sa spolu s draftom:
   * bez neho obnovený výlet spadne späť na krok 1 a človek kreslí trasu, ktorú už má.
   */
  step?: number;
  // meta
  authorName: string;
  createdAt: number;
  updatedAt: number;
  sourceGpx?: { app: string; originalName: string };
};

// ── Geometria podľa KATEGÓRIE (§5 tabuľka, prepísané 2026-08-27) ────────────────────────
// Tabuľka sa presťahovala do `components/pack/tripCategories.ts` — je to tá istá vec ako
// zoznam kategórií a dve kópie by sa rozišli pri prvej zmene. Tu ostáva len pohľad na ňu,
// aby volajúci nemuseli meniť import.
// ⚠️ VIACDŇOVÁ (odysea) má vlastný riadok a NIE JE tu vidieť — pýtaj si ju cez
// `geometryForCategory(id, multiDay)`, ktorá pri viacdňovej HIKE povolí LEN trasu.
// Pri PLÁNE je default vždy najvoľnejšia povolená geometria (§5: „nikto nekreslí presnú
// trasu na výlet o mesiac") — to rieši `defaultKindFor(_, 'plan')` v GeometryPicker.
export const ACTIVITY_GEOMETRY: Record<string, { default: GeometryKind; allowed: GeometryKind[] }> =
  Object.fromEntries(Object.values(CATEGORY_BY_ID).map((c) => [c.id, c.geometry]));

// ── Povinné polia (§4.2 pre plán, §4.3 pre log) ─────────────────────────────────────────
// SUBMIT_REQUIRED = pustí trip von (draft/pending podľa toho, či prejde aj APPROVAL_REQUIRED).
// APPROVAL_REQUIRED platí LEN pre walked (§4.3: „Povinné na SCHVÁLENIE") — plán sa neschvaľuje.
export const SUBMIT_REQUIRED: Record<TripState, Array<keyof AddTripDraft>> = {
  planned: ['name', 'activity', 'geometry', 'dateKind'],
  walked: ['name', 'geometry', 'date', 'activity'],
};
// diff/surface (terrain) sú v tabuľke §4.3 riadok 4 označené „(len hiking/journey)" —
// missingFields() to zohľadňuje, HIKE_LIKE nižšie.
// ⚠️ `hazards` tu bolo do 23. 8. 2026. Nebezpečenstvo sa od kroku 2 sprievodcu ZAPICHUJE NA MAPU
// (tabuľka `map_notes`), takže formulár ho už neplní — a podmienka na pole, ktoré sa nedá vyplniť,
// by každý výlet natrvalo držala v stave `draft`. Chip bez polohy bol aj tak horší údaj: svorke
// nepovie KDE. Historické hodnoty v `trip_votes.hazards` sa tým nemažú.
/**
 * ⚠️ FOTKA VYPADLA Z POVINNÝCH (Matej 2026-08-25) ────────────────────────────────────────
 *
 * „povinné nebudú asi len fotky, inak by mal vedieť všetko… aj náročnosť atď to je iba jeden
 *  klik, reálny bloker vie byť iba foto, ktoré má akurát v inom mobile (bolo to dávno)."
 *
 * Je to jediné pole, ktoré človek nevie doplniť ROZHODNUTÍM — všetko ostatné je klik alebo
 * vec, ktorú z výletu vie. Fotka závisí od toho, kde práve leží; pri výlete spred rokov
 * nemusí existovať vôbec. Podmieňovať ňou zverejnenie znamená, že staré výlety sa nezapíšu.
 * Zvyšok ostáva povinný ZÁMERNE — bez neho stráca šablóna výletu zmysel (Matejov argument
 * z tej istej správy).
 */
export const APPROVAL_REQUIRED: Array<keyof AddTripDraft> = ['diff', 'surface', 'crowd', 'tags', 'paws'];

// NÁROČNOSŤ MÁ LEN HIKE (Matej 2026-08-31: „chill nebude mať náročnosť a nedal by som ani
// na sport ani na explore"; do 31. 8. ju mal aj SPORT). Do 27. 8. to bola množina
// `HIKE_LIKE` so štyrmi zápismi tej istej
// aktivity ('hiking' z formulára, 'hike'/'journey' z dát) — dnes to nesie príznak
// `hasDifficulty` pri kategórii, teda na jednom mieste a spolu s ňou.
// ⚠️ Pravidlo musí platiť na oboch stranách zápisu rovnako, inak by uložený výlet vyšiel
// neúplný práve vtedy, keď formulár tvrdil opak — preto obe funkcie nižšie čítajú to isté.
export const needsDifficulty = (category: string): boolean =>
  CATEGORY_BY_ID[category]?.hasDifficulty ?? false;

/**
 * NÁZVY CHÝBAJÚCICH POLÍ SÚ i18n KĽÚČE, NIE HOTOVÝ TEXT (2026-08-23).
 *
 * Do teraz to boli anglické slová napísané v modeli natvrdo, takže pod slovenským formulárom
 * svietilo „Chýba: name, date". Model nemá jazyk — preklad patrí tam, kde je `t()`, teda do
 * komponentu. Volajúci si hodnoty prežene cez `t()` (viď `AddTripLog`), a keď kľúč chýba,
 * padne to na anglický slovník samo.
 *
 * ⚠️ `dateKind` aj `date` mieria na ten istý kľúč zámerne: pre človeka je to jedno pole.
 */
const FIELD_LABEL: Partial<Record<keyof AddTripDraft, string>> = {
  name: 'pack.addTrip.field.name',
  activity: 'pack.addTrip.field.activity',
  geometry: 'pack.addTrip.field.geometry',
  dateKind: 'pack.addTrip.field.date',
  date: 'pack.addTrip.field.date',
  diff: 'pack.addTrip.field.diff',
  surface: 'pack.addTrip.field.surface',
  crowd: 'pack.addTrip.field.crowd',
  hazards: 'pack.addTrip.field.hazards',
  tags: 'pack.addTrip.field.tags',
  paws: 'pack.addTrip.field.paws',
  photos: 'pack.addTrip.field.photos',
};

function hasGeometry(g: TripGeometry): boolean {
  if (g.kind === 'route') return g.path.length >= 2;
  if (g.kind === 'point') return !!g.center;
  if (g.kind === 'area') return !!g.center && g.radiusM > 0;
  return false;
}

// dátum je vyplnený, keď je flexible (nepotrebuje hodnotu) alebo keď `date` má hodnotu —
// pokrýva aj log-flow toggle „Don't remember" (§4.3 riadok 2), ktorý na modeli zodpovedá
// dateKind: 'flexible' rovnako ako v pláne.
function isFilled(draft: AddTripDraft, field: keyof AddTripDraft): boolean {
  switch (field) {
    case 'name': return draft.name.trim().length > 0;
    case 'activity': return draft.activity.trim().length > 0;
    case 'geometry': return hasGeometry(draft.geometry);
    case 'dateKind': return draft.dateKind === 'flexible' || !!draft.date;
    case 'date': return draft.dateKind === 'flexible' || !!draft.date;
    case 'diff': return !!draft.diff;
    case 'surface': return !!draft.surface && draft.surface.length > 0;
    case 'hazards': return !!draft.hazards && draft.hazards.length > 0;
    // Ruch pribudol medzi povinné 25. 8. (Matej: „ruch povinne ano") — je to jeden klik
    // a pre toho, kto ide na výlet s reaktívnym psom, je to jeden z najdôležitejších údajov.
    case 'crowd': return !!draft.crowd;
    case 'tags': return !!draft.tags && draft.tags.length > 0;
    case 'paws': return !!draft.paws && draft.paws >= 1;
    case 'photos': return !!draft.photos && draft.photos.length > 0;
    default: return true;
  }
}

// Vráti chýbajúce polia rozdelené na „bráni odoslaniu" (toSubmit) a „bráni schváleniu"
// (toApprove — len walked). Trip s neprázdnym toSubmit sa NESMIE pustiť von vôbec (§4.3:
// „Von sa nikdy nepustí nič neúplné"); s prázdnym toSubmit, ale neprázdnym toApprove ide von
// ako `approval: 'draft'` + badge „Finish this" (zoznam z toApprove).
export function missingFields(draft: AddTripDraft): { toSubmit: string[]; toApprove: string[] } {
  const toSubmit = SUBMIT_REQUIRED[draft.state]
    .filter((f) => !isFilled(draft, f))
    .map((f) => FIELD_LABEL[f] ?? String(f));

  const toApprove = draft.state === 'walked'
    ? missingToApprove({
        hikeLike: needsDifficulty(draft.activity),
        diff: draft.diff, surface: draft.surface, crowd: draft.crowd,
        tags: draft.tags, paws: draft.paws,
      })
    : [];

  return { toSubmit, toApprove };
}

// ─────────────────────────────────────────────────────────────────────────────────────────
// ÚPLNOSŤ SA NEUKLADÁ — ODVODZUJE SA (2026-08-25)
//
// `AddTripDraft.approval` ('draft' vs 'pending') sa počítal pri odoslaní a zahodil pri zápise:
// `HeroTrail` také pole nemá a `submitAddTripDraft` ho neprepisoval. Namiesto dopísania stĺpca
// sa úplnosť ODVODZUJE zo záznamu, lebo je v ňom celá — všetkých päť povinných polí
// (APPROVAL_REQUIRED) `HeroTrail` nesie: `diff`, `surface`, `crowd`, `tags`, `stars`.
//
// Uložený príznak by po prvom doplnení KLAMAL: dopĺňanie mení práve tie polia, z ktorých sa
// počíta, takže by sa musel prepísať na každej ceste, ktorá výlet upraví (formulár, hydratácia
// z `pack_trips`, admin) — a tá, na ktorú sa zabudne, by držala hotový výlet navždy v konceptoch.
// Odvodenie sa opraví samo v momente, keď človek pole vyplní.
//
// ⚠️ Platí LEN pre členmi nahodené PREJDENÉ výlety. Plán (`plan-*`) povinné polia nemá vôbec
// (neschvaľuje sa) a generovaný katalóg ich má všetky — overené 25. 8. na všetkých 72 trasách:
// `diff` chýba presne siedmim a všetky sú nepešie (paddleboard/skating/explore), teda presne
// tam, kde ho ani formulár nepýta. Scoping drží `tripDraftMissing()` v tripShared.tsx, nie táto
// funkcia — tá je čistá kontrola polí.
// ─────────────────────────────────────────────────────────────────────────────────────────
type CompletenessInput = {
  hikeLike: boolean;
  diff?: string;
  surface?: string[];
  crowd?: string;
  tags?: string[];
  paws?: number;
};

function missingToApprove(x: CompletenessInput): string[] {
  const has = (f: keyof AddTripDraft): boolean => {
    switch (f) {
      case 'diff': return !x.hikeLike || !!x.diff;
      case 'surface': return !x.hikeLike || (!!x.surface && x.surface.length > 0);
      case 'crowd': return !!x.crowd;
      case 'tags': return !!x.tags && x.tags.length > 0;
      case 'paws': return !!x.paws && x.paws >= 1;
      default: return true;
    }
  };
  return APPROVAL_REQUIRED.filter((f) => !has(f)).map((f) => FIELD_LABEL[f] ?? String(f));
}

/**
 * Čo výletu chýba do zverejnenia — i18n kľúče, rovnaké ako `missingFields().toApprove`.
 * Prázdne pole = hotový. Vstupom je ULOŽENÝ záznam, nie formulár.
 */
export function missingOnTrail(trail: {
  acts?: string[]; diff?: string; surface?: string[]; crowd?: string; tags?: string[]; stars?: number;
}): string[] {
  return missingToApprove({
    // Identita výletu, nie ktorýkoľvek jeho tag: túra s piknikom je HIKE a náročnosť
    // teda pýta; piknik pri jazere je CHILL a nepýta ju vôbec.
    hikeLike: needsDifficulty(primaryCategoryOf(trail.acts)),
    diff: trail.diff,
    surface: trail.surface,
    crowd: trail.crowd,
    tags: trail.tags,
    paws: trail.stars,
  });
}

// ── Autosave rozpracovaného tripu (§11) ─────────────────────────────────────────────────
// Rovnaký try/catch + probe vzor ako readLocalTrails/writeLocalTrails v tripShared.tsx —
// localStorage s fallbackom na sessionStorage (private mode / quota), writeAddDraft vracia
// boolean nech vieme rozlíšiť tichú stratu (quota) od úspechu, rovnako ako writeLocalTrails.
const addStore: Storage = (() => {
  try { const k = '__trp_add_probe'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; }
  catch { return sessionStorage; }
})();
const ADD_DRAFT_KEY = 'trp-addtrip-draft';

export function readAddDraft(): AddTripDraft | null {
  try {
    const raw = addStore.getItem(ADD_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as AddTripDraft) : null;
  } catch { return null; }
}
export function writeAddDraft(draft: AddTripDraft): boolean {
  try { addStore.setItem(ADD_DRAFT_KEY, JSON.stringify(draft)); return true; }
  catch { return false; /* private mode / quota — volajúci nech to ošetrí */ }
}
/**
 * ZNAČKY ZAPICHNUTÉ POČAS TOHTO PRIDÁVANIA — vlastný kľúč, nie súčasť draftu.
 *
 * Matej 2026-08-23: „v 4. kroku píše že som neoznačil nebezpečenstvo ani tip ale označil som".
 *
 * Zoznam žil ako `tripNotes` v stave `PackMap` s poznámkou „pamäť jednej obrazovky". Lenže
 * formulár obrazovku PREŽIJE: `readAddDraft()` ho po reloade obnoví aj s číslom kroku, takže
 * človek pokračuje v kroku 4 — a zhrnutie, ktoré reload nezažilo, tvrdí, že neoznačil nič.
 * Na telefóne stačí prepnutie záložky a iOS stránku zahodí; pri vývoji to spraví každý hot
 * reload. Zhrnutie je pritom JEDINÉ miesto, kde sa dá skontrolovať, či sa značky podarili —
 * takže klame práve tam, kde má ubezpečovať.
 *
 * Prečo nie do `AddTripDraft`: väzba značky na výlet sa zámerne NEUKLADÁ (odvodzuje sa zo
 * súradnice, viď `mapNotesGeo.ts`) a draft ide do `onSubmit`, teda do dát výletu. Toto je stav
 * SPRIEVODCU, nie vlastnosť výletu — vlastný kľúč to drží oddelené.
 */
const TRIP_NOTES_KEY = 'trp-addtrip-notes';

/**
 * ⚠️ NESIE AJ `id`, NIE LEN DRUH (2026-08-24). Matej chce vedieť značku z chipu v zhrnutí
 * ZMAZAŤ („po kliknutí by sa mal zobraziť krížik a opätovným by sa mali dať vymazať"), a bez
 * identifikátora sa nedá povedať KTORÚ — dve parkoviská na trase sú dva zápisy s tým istým
 * druhom. Kým bol zoznam len poľom druhov, chip vedel jedine oznamovať.
 */
export type TripNoteRef = { id: string; kind: string };

export function readTripNotes(): TripNoteRef[] {
  try {
    const raw = addStore.getItem(TRIP_NOTES_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : null;
    if (!Array.isArray(arr)) return [];
    // Staršie rozrobené pridávanie má v úložisku holé reťazce (druhy). Prežije ďalej, len sa
    // z jeho chipov nedá mazať — zahodiť rozpracovaný zoznam kvôli zmene formátu by bola
    // horšia strata než chýbajúce tlačidlo.
    return arr.flatMap((x): TripNoteRef[] => {
      if (typeof x === 'string') return [{ id: '', kind: x }];
      if (x && typeof x === 'object' && typeof (x as TripNoteRef).kind === 'string') {
        const r = x as TripNoteRef;
        return [{ id: typeof r.id === 'string' ? r.id : '', kind: r.kind }];
      }
      return [];
    });
  } catch { return []; }
}

export function writeTripNotes(notes: TripNoteRef[]): void {
  try { addStore.setItem(TRIP_NOTES_KEY, JSON.stringify(notes)); } catch { /* non-fatal */ }
}

export function clearTripNotes(): void {
  try { addStore.removeItem(TRIP_NOTES_KEY); } catch { /* non-fatal */ }
}

/**
 * ── ZNAČKY PATRIA ROZROBENÉMU VÝLETU; BEZ NEHO SÚ SMETIE (Matej 25. 8. 2026) ─────────────
 *
 * „začal som s pridaním nového výletu a už som mal označené parkovisko aj upozornenia a +3
 *  body pritom som nič neoznačil a nejde to ani zmazať."
 *
 * `TRIP_NOTES_KEY` je v úložisku ZÁMERNE — má prežiť reload, inak zhrnutie v kroku 4 tvrdí,
 * že človek neoznačil nič (to bola oprava z 23. 8.). Lenže prežíva aj to, čo prežiť nemá:
 * keď sa pridávanie skončí inak než cez `closeAdd()` — človek zavrie záložku, iOS zahodí
 * stránku na pozadí, alebo pri návrate odmietne obnovu — zoznam v úložisku ostane a NAČÍTA
 * SA DO ĎALŠIEHO VÝLETU. Ten potom začína s cudzími značkami a s bodmi za ne.
 *
 * Zmazať sa nedali z dvoch strán naraz: v kroku 4 je zoznam zámerne len na čítanie
 * (zhrnutie sa needituje) a staršie zápisy sú holé reťazce bez `id`, teda sa nedá povedať,
 * ktorú značku na mape má ísť appka zmazať.
 *
 * SPRÁVNA VÄZBA JE NA DRAFT. Rozrobený výlet žije v `readAddDraft()`; kým existuje, značky
 * k nemu patria a musia sa obnoviť s ním. Keď draft neexistuje, niet čo obnovovať —
 * a čokoľvek v tomto kľúči je zvyšok po minulom pokuse. Preto sa nielen ignoruje, ale
 * rovno UPRACE: inak by ležal ďalej a čakal na ďalší reload.
 */
export function readTripNotesForSession(): TripNoteRef[] {
  if (readAddDraft()) return readTripNotes();
  clearTripNotes();
  return [];
}

export function clearAddDraft(): void {
  try { addStore.removeItem(ADD_DRAFT_KEY); } catch { /* non-fatal */ }
}
