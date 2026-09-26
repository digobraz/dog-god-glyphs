// SNIFFER — balíček, swipe a zhody (krok 4). Server: `supabase/migrations/20260928_sniffer_deck.sql`.
// Zadanie: plany/zadanie-sniffer-stavba-2026-09-26.md §2.1, §2.6.
//
// 🔴 KTO KOHO VIDÍ ROZHODUJE LEN SERVER (`sniffer_pair_ok`). Klient nedostane kartu, ktorú
//    nemá vidieť, a nič tu nefiltruje „pre istotu" — druhá definícia by sa rozišla.
// 🔴 ADRESA ČLOVEKA = `member` (poradové číslo jeho prvého psa), nikdy `user_id`.
// 💬 Správa pripnutá k ÁNO odíde až pri zhode (Matej 25. 9.) — drží ju server pri swipe.
import { supabase } from '@/integrations/supabase/client';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { walkedCountries } from '@/components/pack/packCommunity';
import type { HumanProfile } from '@/components/pack/profile/packProfile';

// RPC SNIFFERa nie sú v generovanom `types.ts` — rovnaký únik ako `buddyGate.ts`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface SnifferDog {
  name: string | null;
  photo: string | null;
  /** Hotový heroglyf zo steny (`dogs.heroglyph_png_url`) — nie render zo `selections`. */
  heroglyph: string | null;
  /** Bio psa (`dog_profiles.attrs.bio`). */
  bio?: string | null;
  /** Fotky psa z denníka (`dog_events.value.photo`) — samostatné úložisko fotiek psa nie je. */
  album?: string[];
  temperament: string[];
  fitness: string | null;
  compat: string | null;
}

/** Info o človeku v celom profile. Orientácia príde len so súhlasom (`orientationPublic`). */
export interface SnifferInfo {
  gender?: string; nationality?: string; languages?: string[]; smoke?: string;
  diet?: string; work?: string; relationship?: string; orientation?: string;
}

export type SnifferHeading = NonNullable<HumanProfile['heading']>;

export interface SnifferCardData {
  member: number;
  name: string;
  age: number | null;
  region: string | null;
  /** Krajina (pin, inak národnosť), ISO2 malými. */
  country?: string;
  /** Vzdialenosť v PÁSME, nie na km (A3, audit-sniffer-2026-09-26, Matej: „ok" — opakovaný
   *  presun pinu už netrilateruje bydlisko na km). `distance_km` zo staršieho tvaru je preč —
   *  grepnuté 26. 9.: `SnifferCard.tsx`/`SnifferSearch.tsx` naň už neukazujú. `null` = pin nemá. */
  distanceBand?: SnifferDistanceBand | null;
  info?: SnifferInfo;
  /** PÚTNIK level (zapisuje ho majiteľov klient) · DEVOTION body (100 + ledger). */
  pilgrimLevel?: number | null;
  devotion?: number | null;
  /** TRIPWISH — živé priania (`wish_pins.place_name`). */
  wishes?: string[];
  /** Môj rajón — `W` Západ · `C` Stred · `E` Východ. */
  areas?: Array<'W' | 'C' | 'E'>;
  /** Passport — kam sa chystá. */
  heading?: SnifferHeading | null;
  /** BIO psím hlasom (`dogVoiceBio`), staré `bio` len ako záloha — rozhoduje server. */
  bio: string | null;
  interests: string[];
  /** AKÝ SI — vybrané chipy z `/pack/profile` (+ vlastná vec). Server kolo 6 (`20261001`). */
  personality?: string[];
  customPersonality?: string | null;
  /** Znamenie majiteľa z heroglyfu (malý rámik). */
  zodiac?: { western?: string; chinese?: string };
  intents: string[];
  photos: string[];
  dogs: SnifferDog[];
  /** Prejdené výlety (slug) — km a krajiny sa rátajú z katalógu trás. */
  trips: string[];
}

export interface SnifferMatch {
  card: SnifferCardData;
  matchedAt: string;
  conv: string | null;
}

/** A3 (audit-sniffer-2026-09-26): server posiela vzdialenosť v pásme. */
export type SnifferDistanceBand = '0-5' | '5-10' | '10-25' | '25-50' | '50+';

/** Surový riadok z RPC pred mapovaním — server posiela hadí zápis `distance_band`. */
type RawSnifferCard = Omit<SnifferCardData, 'distanceBand'> & { distance_band?: SnifferDistanceBand | null };

/** Jedno miesto, ktoré premení hadí zápis servera na tvar karty. Zvyšné polia idú cez —
 *  RPC ich už posiela v tvare, ktorý `SnifferCardData` očakáva. */
function mapCard(raw: RawSnifferCard): SnifferCardData {
  const { distance_band, ...rest } = raw;
  return { ...(rest as SnifferCardData), distanceBand: distance_band ?? null };
}

/** Výsledok HĽADAŤ nesie kurzor na ďalšiu stránku — pole zostáva poľom (`Array.isArray`, `.map`,
 *  priradenie do `SnifferCardData[]` prejde bez zmeny), kurzor je len navyše vlastnosť, aby
 *  existujúci volajúci (`SnifferSearch.tsx`) nemusel meniť tvar skôr, než na stránkovanie prejde. */
export type SnifferCardPage = SnifferCardData[] & { cursor?: string | null };

export async function loadDeck(limit = 20): Promise<SnifferCardData[]> {
  const { data, error } = await db.rpc('assnif_deck', { p_limit: limit });
  if (error) throw error;
  return ((data ?? []) as RawSnifferCard[]).map(mapCard);
}

export async function swipe(member: number, verdict: 'like' | 'pass', message?: string): Promise<{ match: boolean; conv: string | null }> {
  const { data, error } = await db.rpc('assnif_swipe', { p_member: member, p_verdict: verdict, p_message: message ?? null });
  if (error) throw error;
  return data as { match: boolean; conv: string | null };
}

export async function loadMatches(): Promise<SnifferMatch[]> {
  const { data, error } = await db.rpc('assnif_matches');
  if (error) throw error;
  return ((data ?? []) as Array<{ card: RawSnifferCard; matched_at: string; conv: string | null }>)
    .map((r) => ({ card: mapCard(r.card), matchedAt: r.matched_at, conv: r.conv }));
}

/** E2 (audit-sniffer-2026-09-26): predvolený strop stránky — nahradzuje starý pevný 40/80. */
const SEARCH_PAGE = 40;

/** HĽADAŤ — mriežka nad tou istou podmienkou ako balíček (`assnif_search`). Server (kontrakt
 *  potvrdený 26. 9. 2026, migrácia `20261002_sniffer_audit.sql`): KAŽDÝ riadok nesie vlastný
 *  `_cursor`; ďalšia strana posiela `after` = `_cursor` POSLEDNÉHO riadku predošlej strany. */
export async function searchPeople(
  country: string, areas: string[], intent: string | null, after?: string | null, limit = SEARCH_PAGE,
): Promise<SnifferCardPage> {
  const { data, error } = await db.rpc('assnif_search', {
    p_country: country, p_areas: areas, p_intent: intent, p_limit: limit, p_after: after ?? null,
  });
  if (error) throw error;
  const rows = (data ?? []) as Array<RawSnifferCard & { _cursor?: string | null }>;
  const page = rows.map(({ _cursor, ...raw }) => mapCard(raw as RawSnifferCard)) as SnifferCardPage;
  page.cursor = rows.length ? (rows[rows.length - 1]._cursor ?? null) : null;
  return page;
}

/** ĽUDIA V OKOLÍ — „všetkých vidíme" (`assnif_nearby` / `sniffer_nearby_ok`). */
export async function loadNearby(intent: string | null): Promise<SnifferCardData[]> {
  const { data, error } = await db.rpc('assnif_nearby', { p_intent: intent });
  if (error) throw error;
  return ((data ?? []) as RawSnifferCard[]).map(mapCard);
}

/** Moja karta presne tak, ako ju dostanú ostatní (`assnif_my_card` = tá istá `sniffer_card`). */
export async function loadMyCard(): Promise<SnifferCardData | null> {
  const { data, error } = await db.rpc('assnif_my_card');
  if (error) throw error;
  return data ? mapCard(data as RawSnifferCard) : null;
}

export async function unmatch(member: number): Promise<void> {
  const { error } = await db.rpc('assnif_unmatch', { p_member: member });
  if (error) throw error;
}

/** PÚTNIK cudzieho človeka z jeho prejdených výletov. Tá istá množina a to isté pravidlo
 *  pre km a krajiny ako `usePilgrimStats` — len bez lokálnych (neschválených) výletov,
 *  ktoré žijú v prehliadači toho druhého.
 *  LEVEL tu NIE JE — nesie ho karta (`pilgrimLevel`), zapísaný majiteľovým klientom
 *  z tej istej `profileLevelFor` ako jeho hlavička mapy (kolo 2). */
let trailIndex: Map<string, HeroTrail> | null = null;
export function pilgrimFromTrips(slugs: string[]): { count: number; km: number; countries: number } {
  if (!trailIndex) trailIndex = new Map([...HERO_JOURNEYS, ...HERO_TRAILS].map((tr) => [tr.id, tr]));
  const idx = trailIndex;
  const walked = slugs.map((s) => idx.get(s)).filter((tr): tr is HeroTrail => !!tr);
  const km = walked.reduce((s, tr) => s + (parseFloat(String(tr.km ?? '').replace(',', '.')) || 0), 0);
  return { count: walked.length, km: Math.round(km), countries: walkedCountries(walked) };
}

/** TRIPLIST v celom profile — mená prejdených výletov z katalógu, v poradí zo servera. */
export function tripNames(slugs: string[]): string[] {
  if (!trailIndex) trailIndex = new Map([...HERO_JOURNEYS, ...HERO_TRAILS].map((tr) => [tr.id, tr]));
  const idx = trailIndex;
  return slugs.map((s) => idx.get(s)?.name).filter((n): n is string => !!n);
}
