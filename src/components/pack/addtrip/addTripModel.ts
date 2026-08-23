// ADD TRIP — dátový model (vlna 1, plany/zadanie-addtrip-flow-2026-07-27.md §3).
// Jedna entita, dva stavy (planned/walked) namiesto dvoch nezávislých foriem ako dnes v
// PackMap.tsx. `approval` je napísaný v cieľovom tvare pre vlnu 2 (Supabase schvaľovacia
// fronta), ale vo vlne 1 sa nič neschvaľuje na serveri — len sa model SPRÁVA správne
// (draft/pending badge), perzistencia ostáva localStorage (`trp-local-trails`, tripShared.tsx).
import type { LatLngTuple } from 'leaflet';
import type { Companion } from '@/components/pack/packCommunityUI';

export type TripState = 'planned' | 'walked';
export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'needs_fix' | 'rejected';
export type GeometryKind = 'route' | 'point' | 'area';

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
  // VIDITEĽNOSŤ (issue #42) — LEN pre `planned`. Rozhoduje sa TU, pri zakladaní, nie skryté
  // v nastaveniach: `'private'` (default, konzervatívne) = nikto cudzí trip nevidí ani nemôže
  // požiadať o pridanie; `'open'` = "Looking for pack" inzerát, presne ako doterajší
  // WishlistIntentPopup partner-flow (PackMap.tsx `choosePartner`). Bez tohto poľa PackMap
  // (`submitAddTripDraft`) doteraz KAŽDÝ naplánovaný výlet automaticky publikoval ako
  // `status:'looking', openness:'open'` + verejný `trip_events` inzerát — člen o tom nevedel
  // a nič si nevyberal.
  visibility?: 'private' | 'open';
  // pack
  crew: Companion[];              // CompanionPicker, existujúci typ (packCommunityUI.tsx)
  // len walked
  km?: number; ascentM?: number; elev?: number[];
  diff?: 'Easy' | 'Moderate' | 'Hard' | 'Odyssey';
  crowd?: string; surface?: string[]; tags?: string[];
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

// ── Geometria podľa aktivity (§5 tabuľka) ───────────────────────────────────────────────
// Kľúče = id z TRIP_ACTIVITIES (PackMap.tsx ~190): hiking/journey/picnic/overnight/
// skating/paddleboard. 'skating' a 'paddleboard' sú UI-id aktivít (nezamieňať s dátovým
// tr.acts poľom, kde je 'hike'/'skating'/'paddleboard' — mapovanie je ACT_DATA_ID v Portale).
// Pri PLÁNE je default vždy najvoľnejšia povolená geometria (§5: „nikto nekreslí presnú
// trasu na výlet o mesiac") — to je `default` nižšie, nezávisle od módu plán/log.
export const ACTIVITY_GEOMETRY: Record<string, { default: GeometryKind; allowed: GeometryKind[] }> = {
  hiking: { default: 'route', allowed: ['route', 'area'] },
  // 🔴 LEN 'route' (Matej 2026-08-22: „pri magistrále - logovaní nemože byť oblasť musí mať
  // vždy ROUTE"). Predtým tu bolo aj 'area' — a keďže PLÁN si berie najvoľnejšiu povolenú
  // geometriu (`defaultKindFor(_,'plan')`, looseFirst = area→point→route), plánovaná magistrála
  // ZAČÍNALA ako kruh na mape. Jediná povolená hodnota zároveň schová prepínač druhu
  // (`allowed.length > 1` v GeometryPicker.tsx:363) — nie je z čoho vyberať.
  journey: { default: 'route', allowed: ['route'] },
  picnic: { default: 'area', allowed: ['area', 'point'] },
  overnight: { default: 'area', allowed: ['area', 'point'] },
  skating: { default: 'route', allowed: ['route', 'area'] },
  // 'point' pridaný 2026-07-29 pri migrácii tripov bez trasy. 6 vodných plôch (Buková,
  // Liptovská Mara, Kráľová, Sĺňava, Orešianska, Palcmanská Maša) má v datasete presne
  // jednu kotvu — teda bod. Bez 'point' by tabuľka tvrdila, že taká geometria je nelegálna,
  // hoci ju appka reálne zobrazuje. Prepis na `explore` by ich „opravil" za cenu zmazania
  // acts (paddleboard/skating/picnic) — čo je jediná vecná informácia, ktorú o nich máme.
  paddleboard: { default: 'area', allowed: ['area', 'route', 'point'] },
  // EXPLORE 🧭 / Prieskum — siedmy pill (Matej zadal 2026-07-27, názov + geometriu odklepol
  // 2026-07-29). Miesta BEZ trasy: „napríklad plavecký hrad, kaštiel v budmericiach, park
  // v jaslovských bohuniciach... = tieto miesta nemusia mať route".
  // 🔴 ZÁMERNE BEZ 'route' — Matej vybral „len Bod + Okruh". Kto chce trasu, prepne aktivitu.
  // Dôvod existencie: 20 zo 77 tripov (26 %) dnes nemá použiteľnú trasu (14× prázdny `path`,
  // 6× jediný bod — Buková, Liptovská Mara, Kráľová, Sĺňava, Orešianska, Palcmanská Maša).
  // Tá kategória teda reálne existuje už dnes, len sa tvári ako pokazená trasa.
  // MIGRÁCIA 2026-07-29: na `explore` prešlo len tých 14 prázdnych (`acts: ['explore']`
  // v trails-nahadzovac-state.json). Vodných 6 ostalo pri paddleboard — viď komentár vyššie.
  explore: { default: 'point', allowed: ['point', 'area'] },
};

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
export const APPROVAL_REQUIRED: Array<keyof AddTripDraft> = ['diff', 'surface', 'tags', 'paws', 'photos'];

const HIKE_LIKE = new Set(['hiking', 'journey']);

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

  const approveFields = draft.state === 'walked'
    ? APPROVAL_REQUIRED.filter((f) => ((f === 'diff' || f === 'surface') ? HIKE_LIKE.has(draft.activity) : true))
    : [];
  const toApprove = approveFields
    .filter((f) => !isFilled(draft, f))
    .map((f) => FIELD_LABEL[f] ?? String(f));

  return { toSubmit, toApprove };
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
export function clearAddDraft(): void {
  try { addStore.removeItem(ADD_DRAFT_KEY); } catch { /* non-fatal */ }
}
