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

// RPC SNIFFERa nie sú v generovanom `types.ts` — rovnaký únik ako `buddyGate.ts`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface SnifferDog {
  name: string | null;
  photo: string | null;
  /** Hotový heroglyf zo steny (`dogs.heroglyph_png_url`) — nie render zo `selections`. */
  heroglyph: string | null;
  temperament: string[];
  fitness: string | null;
  compat: string | null;
}

export interface SnifferCardData {
  member: number;
  name: string;
  age: number | null;
  region: string | null;
  bio: string | null;
  interests: string[];
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

export async function loadDeck(limit = 20): Promise<SnifferCardData[]> {
  const { data, error } = await db.rpc('assnif_deck', { p_limit: limit });
  if (error) throw error;
  return (data ?? []) as SnifferCardData[];
}

export async function swipe(member: number, verdict: 'like' | 'pass', message?: string): Promise<{ match: boolean; conv: string | null }> {
  const { data, error } = await db.rpc('assnif_swipe', { p_member: member, p_verdict: verdict, p_message: message ?? null });
  if (error) throw error;
  return data as { match: boolean; conv: string | null };
}

export async function loadMatches(): Promise<SnifferMatch[]> {
  const { data, error } = await db.rpc('assnif_matches');
  if (error) throw error;
  return ((data ?? []) as Array<{ card: SnifferCardData; matched_at: string; conv: string | null }>)
    .map((r) => ({ card: r.card, matchedAt: r.matched_at, conv: r.conv }));
}

/** Moja karta presne tak, ako ju dostanú ostatní (`assnif_my_card` = tá istá `sniffer_card`). */
export async function loadMyCard(): Promise<SnifferCardData | null> {
  const { data, error } = await db.rpc('assnif_my_card');
  if (error) throw error;
  return (data ?? null) as SnifferCardData | null;
}

export async function unmatch(member: number): Promise<void> {
  const { error } = await db.rpc('assnif_unmatch', { p_member: member });
  if (error) throw error;
}

/** PÚTNIK cudzieho človeka z jeho prejdených výletov. Tá istá množina a to isté pravidlo
 *  pre km a krajiny ako `usePilgrimStats` — len bez lokálnych (neschválených) výletov,
 *  ktoré žijú v prehliadači toho druhého.
 *  ⚠️ LEVEL tu NIE JE: ráta sa aj z bodov za odkazy, podujatia a hodnotenia, ktoré server
 *  o cudzom človeku nevydáva. Level z polovice vstupov by sa rozišiel s jeho hlavičkou mapy. */
let trailIndex: Map<string, HeroTrail> | null = null;
export function pilgrimFromTrips(slugs: string[]): { count: number; km: number; countries: number } {
  if (!trailIndex) trailIndex = new Map([...HERO_JOURNEYS, ...HERO_TRAILS].map((tr) => [tr.id, tr]));
  const idx = trailIndex;
  const walked = slugs.map((s) => idx.get(s)).filter((tr): tr is HeroTrail => !!tr);
  const km = walked.reduce((s, tr) => s + (parseFloat(String(tr.km ?? '').replace(',', '.')) || 0), 0);
  return { count: walked.length, km: Math.round(km), countries: walkedCountries(walked) };
}
