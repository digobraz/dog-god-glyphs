// ADD EVENT — dátový model formulára (krok 3, plany/zadanie-eventy-2026-08-06.md §3, §4).
// Tvar sedí na `event_series`/`event_editions` (`20260806_events.sql` + `20260925_events_v2.sql`).
// Zápis do DB robí `eventStore.ts` (vlna 2, 25. 9. 2026) — tento súbor je len tvar a pravidlá
// formulára, o úložisku nevie.
import type { LatLngTuple } from 'leaflet';

// Poradie = poradie pillov vo formulári (zhluknuté podľa príbuznosti, nie abecedne).
// `camp` pribudol 6.8.2026 — viacdňový tábor nie je `training`. Musí sedieť na CHECK
// constraint v `vystupy/supabase/migrations/20260806_events.sql`.
//
// ── OSMIČKA, NIE JEDENÁSTKA (Matej 24. 8. 2026, matrica značiek) ────────────────────────
// Von išli `workshop`, `meetup` a `adoption`. Nie preto, že by sa nekonali, ale preto, že
// človek, ktorý ich zapisuje, si medzi nimi a susedom nevyberie: workshop vs. prednáška,
// zraz vs. spoločná prechádzka, adopčný deň vs. charita. Jedenásť pilulek vo formulári
// bolo viac deliacich čiar než rozdielov — a typ, ktorý sa vyberá hodom mincou, dataset
// neupratuje, ale špiní.
// ⚠️ V čase zúženia migrácia nebola nasadená na žiadnej DB, takže sa nič nemigrovalo.
// `eventEmoji()` má fallback 🎪 a `EventCard` padne na `?? item.kind`.
export type EventKind = 'race' | 'show' | 'training' | 'lecture'
  | 'social_walk' | 'charity' | 'camp' | 'expo';
export type EventOrigin = 'own' | 'tip';

export const EVENT_KINDS: EventKind[] = ['race', 'show', 'training', 'lecture', 'social_walk', 'charity', 'camp', 'expo'];

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
  lecture: 'pack.addEvent.kind.lecture',
  social_walk: 'pack.addEvent.kind.social_walk',
  charity: 'pack.addEvent.kind.charity',
  camp: 'pack.addEvent.kind.camp',
  expo: 'pack.addEvent.kind.expo',
};

// Jeden ročník (event_editions riadok) + denormalizovaný `title`/`kind`/`country` zo série —
// formulár pracuje s jedným objektom, na sériu a ročník ho rozloží až `save_event` v DB.
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

// ── PORADIE DÁTUMOV (2026-09-13) ───────────────────────────────────────────────────────
// `missingEventFields` hovorí o CHÝBAJÚCICH poliach, takže zle usporiadaný rozsah doň
// nepatrí — bolo by z toho „chýba: Koniec" nad vyplneným poľom. Je to samostatná chyba
// a samostatná veta.
// ⚠️ Odfotené 13. 9.: koniec 9. 10. pri začiatku 10. 10. sa uložil bez slova a karta ho
// vypísala ako „10. 10. – 9. 10.". Formulár má na konci aj `min={startsAt}`, ale natívny
// `min` drží len klikanie v kalendári — vpísaný alebo vložený text ním neprejde, takže
// kontrola musí byť aj tu.
// Reťazce sú `datetime-local` ('YYYY-MM-DDTHH:mm'), teda sa dajú porovnať ako TEXT:
// formát je zľava doprava od najväčšej jednotky a má pevnú šírku. `new Date()` by tu
// priniesol časové zóny, ktoré na porovnanie dvoch hodnôt z toho istého poľa netreba.
export function endsBeforeStarts(draft: AddEventDraft): boolean {
  if (!draft.startsAt || !draft.endsAt) return false;
  return draft.endsAt < draft.startsAt;
}

// ── ODKAZ BEZ SCHÉMY (2026-09-13) ──────────────────────────────────────────────────────
// Odfotené 13. 9.: `dogypt.com/podujatie` sa uložilo tak, ako ho človek napísal, a keďže
// `EventCard` z neho robí `<a href>`, prehliadač to vyhodnotil RELATÍVNE — klik otvoril
// nové okno na `/pack/dogypt.com/podujatie`, teda vo vlastnej appke na neexistujúcej
// route. Odznak pritom napísal „Z dogypt.com/podujatie", takže to vyzeralo funkčne.
// Ľudia `https://` nepíšu, preto sa dopĺňa, nie vyžaduje.
// ⚠️ Doplní sa len tam, kde schéma CHÝBA. Iná schéma než http(s) sa ZAHODÍ (audit 24. 9.):
// `javascript:` v odkaze by sa na karte spustil každému, kto naň ťukne. Server to odmieta
// tiež (`save_event` → `bad_url`), toto je len prvá brána.
export function normalizeSourceUrl(raw: string): string {
  const v = raw.trim();
  if (!v) return v;
  if (/^https?:\/\//i.test(v)) return v;
  return /^[a-z][a-z0-9+.-]*:/i.test(v) ? '' : `https://${v}`;
}

// ── ÚLOŽISKO JE OD 25. 9. 2026 DATABÁZA ──────────────────────────────────────────────────────
// Tu do 24. 9. žili `readLocalEvents`/`writeLocalEvents` (kľúč `trp-events-own-v1`) a filtre
// nadchádzajúce/archív. Podujatie tak videl len ten, kto ho napísal. Čítanie aj zápis sú
// odteraz v `eventStore.ts` nad RPC a archív filtruje DB (`list_event_editions(p_archive)`).
// Starý kľúč `eventStore` pri prvom načítaní zmaže — koncepty sa nemigrujú (§5.1 zadania).
