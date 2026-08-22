// ADD EVENT — dátový model (krok 3, plany/zadanie-eventy-2026-08-06.md §3, §4).
// Tvar sedí na `event_series`/`event_editions` z `vystupy/supabase/migrations/20260806_events.sql`,
// ale tá migrácia ešte NIE JE nasadená na žiadnu DB (§9 krok 2 je hotový, krok 3 = tento formulár) —
// preto tu žiadny Supabase zápis, len localStorage. Write-through vzor + defenzívne try/catch
// s fallbackom na sessionStorage je 1:1 skopírovaný z `readAddDraft`/`writeAddDraft` v
// `../addtrip/addTripModel.ts` (rovnaká pasca: private mode / plná kvóta nesmie potichu stratiť
// rozpísaný event).
import type { LatLngTuple } from 'leaflet';

// Poradie = poradie pillov vo formulári (zhluknuté podľa príbuznosti, nie abecedne).
// `workshop` doplnil Matej 6.8.2026; `meetup`/`adoption`/`camp` pribudli s ním — zraz bez
// prechádzky nie je `social_walk`, adopčný deň útulku nie je `charity` (nič sa nevyberá,
// hľadá sa domov) a viacdňový tábor nie je `training`. Musí sedieť na CHECK constraint
// v `vystupy/supabase/migrations/20260806_events.sql`.
export type EventKind = 'race' | 'show' | 'training' | 'workshop' | 'lecture'
  | 'social_walk' | 'meetup' | 'charity' | 'adoption' | 'camp' | 'expo';
export type EventOrigin = 'own' | 'tip';

export const EVENT_KINDS: EventKind[] = ['race', 'show', 'training', 'workshop', 'lecture', 'social_walk', 'meetup', 'charity', 'adoption', 'camp', 'expo'];

// ── i18n KĽÚČE TYPOV — JEDEN ZDROJ (oprava 2026-08-22) ─────────────────────────────────────
// Túto tabuľku mali OPÍSANÚ dva súbory (AddEvent.tsx, EventCard.tsx) a obe kópie zamrzli na
// SIEDMICH typoch z 6. 8. ráno. Keď v ten istý deň pribudli `workshop`, `meetup`, `adoption`
// a `camp`, preklady sa do `sk.ts`/`en.ts` doplnili — ale nikto sa na ne nepýtal:
//   · vo FORMULÁRI dostal `t(undefined)` → štyri PRÁZDNE pilulky, ktoré sa dali stlačiť
//   · na KARTE padol fallback na `t(draft.kind)` → holé anglické „workshop" aj v slovenčine
// Typ `Record<EventKind, string>` je tu tá poistka, ktorá to už nedovolí: ďalší typ v
// `EventKind` neprejde prekladačom, kým nedostane kľúč.
export const EVENT_KIND_LABEL_KEYS: Record<EventKind, string> = {
  race: 'pack.addEvent.kind.race',
  show: 'pack.addEvent.kind.show',
  training: 'pack.addEvent.kind.training',
  workshop: 'pack.addEvent.kind.workshop',
  lecture: 'pack.addEvent.kind.lecture',
  social_walk: 'pack.addEvent.kind.social_walk',
  meetup: 'pack.addEvent.kind.meetup',
  charity: 'pack.addEvent.kind.charity',
  adoption: 'pack.addEvent.kind.adoption',
  camp: 'pack.addEvent.kind.camp',
  expo: 'pack.addEvent.kind.expo',
};

// Jeden ročník (event_editions riadok) + denormalizovaný `title`/`kind`/`country` zo série —
// vo vlne 1 nemá zmysel držať dve tabuľky v localStorage, kým DB neexistuje (§9 krok 2→3).
export type AddEventDraft = {
  id: string;
  origin: EventOrigin;
  title: string;
  kind: EventKind;
  startsAt: string;              // datetime-local 'YYYY-MM-DDTHH:mm'
  endsAt: string;                 // default = startsAt (§ zadania „Formulár podujatia")
  venueName: string;
  center?: LatLngTuple;           // [lat, lng] — undefined kým človek nevyberie miesto
  country: string;                 // ISO2, odvodené z `center` (lib/countryGeo.ts trailCountry) — needituje sa ručne
  // origin:'own' — vlastný text; origin:'tip' — krátky VLASTNÝ súhrn, nikdy prevzatý (§4.3)
  description?: string;
  photoUrl?: string;              // len origin:'own', voliteľné — NIKDY re-upload cudzej fotky
  sourceUrl?: string;             // len origin:'tip', POVINNÉ — kanonický odkaz na originál
  organizerCredit?: string;       // len origin:'tip', voliteľné — meno organizátora, nie autor u nás
  authorName: string;
  createdAt: number;
  updatedAt: number;
};

// ── Povinné polia (spoločné pre own/tip) + origin:'tip' navyše žiada sourceUrl ─────────────
// Vracia FIELD ID-čka (nie preložené labely — tie si skladá volajúci cez t(), model o i18n nevie).
export function missingEventFields(draft: AddEventDraft): string[] {
  const missing: string[] = [];
  if (!draft.title.trim()) missing.push('title');
  if (!draft.kind) missing.push('kind');
  if (!draft.startsAt) missing.push('startsAt');
  if (!draft.venueName.trim() || !draft.center) missing.push('location');
  if (draft.origin === 'tip' && !draft.sourceUrl?.trim()) missing.push('sourceUrl');
  return missing;
}

// ── Uložené eventy (§ zadania „Úložisko") — kľúč `trp-events-own-v1`, rovnaký obranný vzor
// ako addStore v addTripModel.ts: localStorage s probe, fallback sessionStorage pri zlyhaní
// (private mode / quota). Nepridáva sa do PACK_KEYS (lib/packStore.ts) — DB sync príde až po
// nasadení migrácie (§9 krok 2→ďalšie), tento súbor sa vtedy needituje, len sa vedľa napojí sync.
const eventStore: Storage = (() => {
  try { const k = '__trp_events_probe'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; }
  catch { return sessionStorage; }
})();
const EVENTS_KEY = 'trp-events-own-v1';

export function readLocalEvents(): AddEventDraft[] {
  try {
    const raw = eventStore.getItem(EVENTS_KEY);
    return raw ? (JSON.parse(raw) as AddEventDraft[]) : [];
  } catch { return []; }
}

export function writeLocalEvents(events: AddEventDraft[]): boolean {
  try { eventStore.setItem(EVENTS_KEY, JSON.stringify(events)); return true; }
  catch { return false; /* private mode / quota — volajúci nech to ošetrí */ }
}

// ── Nadchádzajúce / archív (krok 5, plany/zadanie-eventy-2026-08-06.md §9 krok 5 + §4.5) —
// ČISTÝ filter/zoradenie, nikdy delete (archív = "ends_at < now()", riadok ostáva). `nowMs` je
// parameter (nie Date.now() tu vnútri) — volajúci (PackMap.tsx) zdieľa to isté "now" s ostatnými
// komunitnými zoznamami na stránke (`nowMs`, fixné pri mounte, viď komentár tam). ─────────────
const eventStartMs = (ev: AddEventDraft): number => {
  const t = new Date(ev.startsAt).getTime();
  return Number.isFinite(t) ? t : 0;
};
const eventEndMs = (ev: AddEventDraft): number => {
  const t = new Date(ev.endsAt || ev.startsAt).getTime();
  return Number.isFinite(t) ? t : eventStartMs(ev);
};

/** default zoznam — najbližší termín hore. */
export function upcomingEvents(events: AddEventDraft[], nowMs: number): AddEventDraft[] {
  return events.filter((ev) => eventEndMs(ev) >= nowMs).sort((a, b) => eventStartMs(a) - eventStartMs(b));
}

/** archív — naposledy konané hore. */
export function archivedEvents(events: AddEventDraft[], nowMs: number): AddEventDraft[] {
  return events.filter((ev) => eventEndMs(ev) < nowMs).sort((a, b) => eventStartMs(b) - eventStartMs(a));
}
