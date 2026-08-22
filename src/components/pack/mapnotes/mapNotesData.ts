// ZÁPISY DO MAPY — dátová vrstva nad Supabase.
// Migrácia: `vystupy/supabase/migrations/20260820_map_notes.sql`
// Zadanie:  `plany/zadanie-zapisy-do-mapy-2026-08-20.md`
//
// Matej 2026-08-20: „cieľom je aby každý človek vedel písať po mape a dal tak
// vedieť ostatným." Vlna A = parkovisko; typ je stĺpec, takže ďalšie druhy
// značiek nepotrebujú ani novú tabuľku, ani nový súbor.
//
// Vzor prevzatý 1:1 z `trip/tripCommentsData.ts`: zápis NIE JE optimistický —
// insert/vote/delete čaká na odpoveď DB a až potom sa prejaví v UI. Keď RLS
// zápis odmietne (odhlásený, neplatiaci, DEV_NOAUTH), komponent dostane throw
// a musí sa tváriť, že sa nič neodoslalo. Ticho „uložené" pri parkovisku je
// horšie než chyba — človek by sa spoľahol na informáciu, ktorá nikde nie je.
//
// Typy tabuliek/RPC nie sú v generovanom `types.ts` (migrácia čaká na aplikáciu)
// — rovnaký dôvod pre `supabase as any` ako v `packMessaging.ts`.
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** Druhy zápisov — hodnoty stĺpca `kind`, teda aj CHECK v migrácii. */
export const NOTE_KINDS = ['parking', 'hazard', 'note', 'water', 'viewpoint', 'wildlife', 'ticks', 'viper', 'bear', 'sheepdog', 'noentry', 'ladders', 'algae'] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];

// ── PALETA: TRI SKUPINY, NIE SEDEM TLAČIDIEL (Matej 2026-08-20) ─────────────
// „dajme len 3, dalšie doplníme neskor (parkovisko, upozornenie -zver, kliešte,
// ine, komentar)". Skupina NIE JE nový stĺpec — je to zoskupenie hodnôt `kind`,
// ktoré človek pri zakladaní vidí ako jednu voľbu:
//
//   PARKOVISKO   → parking
//   UPOZORNENIE  → wildlife (zver) · ticks (kliešte) · hazard (iné)
//   KOMENTÁR     → note
//
// `water` a `viewpoint` v palete NIE SÚ zámerne: pramene a výhľady už na mape
// kreslí OSM vrstva (`components/geo/PoiLayer.tsx`), takže ručné pridávanie by
// vyrábalo druhú sadu tých istých bodov. V číselníku ostávajú kvôli datasetovým
// bodom (`customPoi`) a starším zápisom.
export const NOTE_GROUPS = ['parking', 'warning', 'comment'] as const;
export type NoteGroup = (typeof NOTE_GROUPS)[number];

// ── ROZPAD UPOZORNENIA NA KONKRÉTNE HROZBY (Matej 2026-08-21) ───────────────
// „nebezpečenstvo/upozornenie = ikonka trojuholníka a následne bude rozpad na
// konkrétne hrozby — kliešte / zver / vretenica / medveď / a iné nebezpečenstvo
// bude opäť trojuholník". Poradie je jeho, prvý je predvolený.
//
// 🔴 KAŽDÝ NOVÝ PODTYP = MIGRÁCIA. `kind` je CHECK enum v Postgrese, takže
// pridanie hodnoty len sem znamená, že DB zápis odmietne a človek uvidí chybu
// až pri odosielaní. Vzor: `vystupy/supabase/migrations/20260821_map_notes_kinds.sql`.
// ── ROZŠÍRENIE 22. 8.: +4 HROZBY, ZVYŠOK OSTÁVA POD „INÉ" ───────────────────
// Matej: „pridajme tam ešte ovčiarske psy, zákaz vstupu, rebríky, sinice …
// ostatné necháme na iné a podla toho ak sa bude od ludi nieco opakovat doplníme".
//
// Toto je zámerne NEúplný zoznam. Vlk, diviak, otrávená návnada ani uzávera
// vlastný druh nedostali — kým sa nepreukáže, že ich ľudia naozaj píšu, bol by
// každý z nich len ďalšia prázdna položka vo výbere. „Iné nebezpečenstvo" je
// preto zberná nádoba S ÚČELOM: z jej textov sa číta, čo si vlastný druh zaslúži.
/** Podtypy skupiny. Prvý je predvolený. */
export const GROUP_KINDS: Record<NoteGroup, NoteKind[]> = {
  parking: ['parking'],
  warning: ['ticks', 'wildlife', 'viper', 'bear', 'sheepdog', 'ladders', 'algae', 'noentry', 'hazard'],
  comment: ['note'],
};

const WARNING_KINDS = new Set<NoteKind>(GROUP_KINDS.warning);

/** Do ktorej skupiny druh patrí (aj pre staré zápisy a datasetové body). */
export function groupOf(kind: NoteKind): NoteGroup {
  if (kind === 'parking') return 'parking';
  if (WARNING_KINDS.has(kind)) return 'warning';
  return 'comment';
}

/**
 * Text je povinný len tam, kde bez neho značka nič nehovorí (Matej 2026-08-20:
 * na otázku „povinný text všade, alebo len pri komentári a upozornení?" → „ok").
 * Pri parkovisku ikonka aj tak povie všetko podstatné a povinné pole je len
 * prekážka medzi človekom a zápisom.
 */
export const bodyRequired = (kind: NoteKind): boolean => groupOf(kind) !== 'parking';

// ── POLOMER: PRAVIDLO JE VLASTNOSŤ SKUPINY, NIE NÁLADA FORMULÁRA ────────────
// Matej 2026-08-21: „všetky [hrozby] budú mať polomer nastaviteľný najmenej vždy
// 500 m, kruh bude červený… pridanie parkoviska je zrejmé = iba bod a správa môže
// byť bod alebo okruh." — 22. 8. zúžené na „rebríky budú body ostatné bod/oblasť".
//
// Prečo je 500 m SPODNÁ hranica a nie default: nebezpečenstvo BÝVA rozptýlené.
// Kliešte nekončia na súradnici a medveď sa medzitým pohol — keď teda človek okruh
// zapne, nesmie ho nakresliť menší, než na aký má informáciu. Či ho zapne, mu appka
// od 22. 8. nediktuje (viď `KIND_RADIUS` nižšie).
//
// Parkovisko naopak bod BYŤ MUSÍ: rampa je tam, kde je, a 500 m kruh okolo nej
// nehovorí nič. Komentár je jediný, kde to nevie rozhodnúť pravidlo — „tu je pekný
// výhľad" je bod, „celý tento úsek je rozbahnený" je okruh — preto voľba.
//
// ⚠️ Toto je len POHODLIE. Tvrdé pravidlo drží `add_map_note()` v DB (dorovná
// polomer aj keď príde iný klient) — viď migráciu.
export type RadiusMode = 'none' | 'required' | 'optional';
export interface RadiusRule {
  mode: RadiusMode;
  min: number;
  max: number;
  step: number;
  /** predvolený polomer, keď je okruh zapnutý */
  def: number;
}

export const RADIUS_RULES: Record<NoteGroup, RadiusRule> = {
  parking: { mode: 'none', min: 0, max: 0, step: 0, def: 0 },
  warning: { mode: 'optional', min: 500, max: 5000, step: 100, def: 500 },
  comment: { mode: 'optional', min: 200, max: 5000, step: 100, def: 500 },
};

// ── VÝNIMKY SÚ VLASTNOSŤOU DRUHU, NIE SKUPINY (Matej 2026-08-22) ────────────
// „rebríky budú body ostatné bod/oblasť".
//
// Rebrík je jediná hrozba, ktorá NIE JE rozptýlená: je priskrutkovaný do skaly
// a o 50 m ďalej naozaj nie je. Okruh okolo neho by tvrdil niečo, čo nie je pravda.
//
// ⚠️ TÝMTO PADOL POVINNÝ POLOMER UPOZORNENÍ z 21. 8. („všetky budú mať polomer
// nastaviteľný najmenej vždy 500 m"). Zostala z neho SPODNÁ HRANICA: keď si
// človek okruh zapne, menší než 500 m mu appka nedovolí. Kedy ho zapne, je
// odteraz jeho rozhodnutie — „zákaz vstupu" je bod ako rampa, „medveď" nie je.
const KIND_RADIUS: Partial<Record<NoteKind, RadiusRule>> = {
  ladders: { mode: 'none', min: 0, max: 0, step: 0, def: 0 },
};

export const radiusRule = (kind: NoteKind): RadiusRule =>
  KIND_RADIUS[kind] ?? RADIUS_RULES[groupOf(kind)];

/** Polomer, s ktorým sa zakladá nový zápis. `null` = bod, teda predvolene BOD. */
export const defaultRadius = (kind: NoteKind): number | null => {
  const r = radiusRule(kind);
  return r.mode === 'required' ? r.def : null;
};

// ── KLIEŠŤ MÁ DVA STUPNE (Matej 2026-08-22) ────────────────────────────────
// „kliešť oranžový lem a červený pri potvrdenej chorobe = bude tam možnosť
// prepnúť že výskyt, potvrdené ochorenie z klieťa a dropdown."
//
// Toto NIE JE nový druh hrozby, ale SILA toho istého zápisu. Dva druhy kliešťa
// by na mape vyzerali ako dve rôzne zvieratá; jeden zápis s dôkazom navyše
// hovorí presne to, čo sa stalo.
//
// 🔴 Toxoplazmóza do zoznamu NEPATRÍ, hoci padla v zadaní — prenáša sa mačacím
// trusom a surovým mäsom, nie kliešťom. Tu sú len tie, ktoré pes naozaj dostane
// z kliešťa (kliešťová encefalitída je prevažne ľudská, preto tiež nie je).
export const TICK_DISEASES = ['babesiosis', 'anaplasmosis', 'borreliosis', 'ehrlichiosis'] as const;
export type TickDisease = (typeof TICK_DISEASES)[number];

export interface MapNote {
  id: string;
  kind: NoteKind;
  /** len pri `ticks`: potvrdená choroba psa. `null` = hlásený iba výskyt kliešťov. */
  disease: TickDisease | null;
  lat: number;
  lon: number;
  /** null = bod, číslo = oblasť s polomerom v metroch */
  radiusM: number | null;
  body: string;
  /** VÝNIMKA, nie väzba — „patrí sem" pri zápise z otvoreného článku výletu */
  pinnedSlug: string | null;
  /** len pri kind='parking': true = spoplatnené, false = zdarma, null = nevie sa */
  paid: boolean | null;
  createdAt: string;
  isMine: boolean;
  authorFirst: string | null;
  /** fotka PSA autora (`dogs.cloudinary_main_url`) — pes je tvárou člena všade v /pack */
  authorPhoto: string | null;
  packNumber: number | null;
  validVotes: number;
  staleVotes: number;
  /** môj hlas: true = PLATÍ, false = UŽ NEPLATÍ, null = nehlasoval som */
  myVote: boolean | null;
  /** ⚠️ INÁ OTÁZKA NEŽ HLAS: „pomohlo mi to", nie „ešte to platí" — na `isStale` nemá vplyv */
  likes: number;
  myLike: boolean;
  /** odvodené serverom (2× „už neplatí“ ⇒ true), alebo ručný override Mateja */
  isStale: boolean;
}

interface NoteRow {
  id: string;
  kind: NoteKind;
  disease: TickDisease | null;
  lat: number;
  lon: number;
  radius_m: number | null;
  body: string;
  pinned_slug: string | null;
  paid: boolean | null;
  created_at: string;
  is_mine: boolean;
  author_first: string | null;
  author_photo: string | null;
  pack_number: number | null;
  valid_votes: number;
  stale_votes: number;
  my_vote: boolean | null;
  likes: number | null;
  my_like: boolean | null;
  is_stale: boolean;
}

function fromRow(r: NoteRow): MapNote {
  return {
    id: r.id,
    kind: r.kind,
    // `?? null` NIE JE ozdoba — kým migrácia nie je na LIVE, RPC ten stĺpec
    // nevráti vôbec a značka by čítala `undefined` ako „choroba je".
    disease: r.disease ?? null,
    lat: r.lat,
    lon: r.lon,
    radiusM: r.radius_m,
    body: r.body,
    pinnedSlug: r.pinned_slug,
    paid: r.paid,
    createdAt: r.created_at,
    isMine: r.is_mine,
    authorFirst: r.author_first,
    // `?? null` NIE JE ozdoba — kým migrácia lajkov nie je na LIVE, RPC tie stĺpce
    // nevráti vôbec a bublina by čítala `undefined`.
    authorPhoto: r.author_photo ?? null,
    packNumber: r.pack_number,
    validVotes: r.valid_votes ?? 0,
    staleVotes: r.stale_votes ?? 0,
    myVote: r.my_vote ?? null,
    likes: r.likes ?? 0,
    myLike: !!r.my_like,
    isStale: !!r.is_stale,
  };
}

/**
 * Načíta VŠETKY zápisy naraz — nie per-výlet.
 *
 * Je to zámer, nie lenivosť: väzba zápisu na výlet je geometrická a počíta sa
 * v prehliadači (`notesForTrail()` v `mapNotesGeo.ts`), takže server nemá ako
 * vedieť, ktoré zápisy k výletu patria. Mapa ich navyše potrebuje všetky naraz
 * na vykreslenie vrstvy, takže per-výlet dotaz by znamenal dve rôzne cesty
 * k tým istým dátam.
 */
export async function fetchMapNotes(): Promise<MapNote[]> {
  const { data, error } = await db.rpc('list_map_notes');
  if (error) throw error;
  return ((data ?? []) as NoteRow[]).map(fromRow);
}

export interface NewMapNote {
  kind: NoteKind;
  /** len pri `ticks`; `null`/vynechané = iba hlásený výskyt */
  disease?: TickDisease | null;
  lat: number;
  lon: number;
  body: string;
  radiusM?: number | null;
  paid?: boolean | null;
  /** vyplní sa len pri zápise z otvoreného článku výletu */
  pinnedSlug?: string | null;
}

/** Vráti id nového zápisu. Throwne pri RLS odmietnutí aj pri dennom strope. */
export async function addMapNote(n: NewMapNote): Promise<string> {
  const { data, error } = await db.rpc('add_map_note', {
    p_kind: n.kind,
    p_disease: n.disease ?? null,
    p_lat: n.lat,
    p_lon: n.lon,
    p_body: n.body,
    p_radius_m: n.radiusM ?? null,
    p_paid: n.paid ?? null,
    p_pinned_slug: n.pinnedSlug ?? null,
  });
  if (error) throw error;
  return data as string;
}

/** `valid = null` hlas stiahne. Na vlastný zápis hlasovať nejde (DB to odmietne). */
export async function voteMapNote(noteId: string, valid: boolean | null): Promise<void> {
  const { error } = await db.rpc('vote_map_note', { p_note_id: noteId, p_valid: valid });
  if (error) throw error;
}

/**
 * Lajk = „pomohlo mi to". Vedome NIE JE to isté, čo hlas PLATÍ — nemá vplyv na
 * zošednutie zápisu (dôvod je rozpísaný v migrácii `20260821_map_notes_likes.sql`).
 * Na vlastný zápis lajk ide, na rozdiel od hlasu.
 */
export async function likeMapNote(noteId: string, on: boolean): Promise<void> {
  const { error } = await db.rpc('like_map_note', { p_note_id: noteId, p_on: on });
  if (error) throw error;
}

export async function deleteMapNote(noteId: string): Promise<void> {
  const { error } = await db.rpc('delete_map_note', { p_note_id: noteId });
  if (error) throw error;
}
