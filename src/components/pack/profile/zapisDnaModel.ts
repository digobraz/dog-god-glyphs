// ZÁPIS DŇA v4 — dlaždice a čítanie dní so zápisom (31. 10. 2026).
// Zadanie `plany/zadanie-zapis-dna-v4-2026-10-31.md`, nákres `plany/nakresy/dennik-2026-10-30/tpl3.html` (pole `G`).
//
// Jedno miesto pre okno ZÁPISU (`ZapisDna.tsx`) aj pre kalendár DENNÍKA (✓ + emoji dňa), aby sa emoji
// dlaždice a emoji v kalendári nemohli rozísť. Každý ťuk = riadok `devotion_events` (`grant-devotion`, kind 'claim').
import { supabase } from '@/integrations/supabase/client';

export type TileGroup = 'rutina' | 'den' | 'zdravie' | 'dalsie';
/** `weight` → dog_events health.weightKg · `trip` → existujúci tok Zapíš výlet · `milestone` → dog_events diary.milestone. */
export type TileSpecial = 'weight' | 'trip' | 'milestone';

export interface ZTile {
  /** Druh v `devotion_events.kind` (alebo meno špeciálnej dlaždice). */
  id: string;
  emoji: string;
  /** i18n `pack.zd.t.<id>` + EN fallback. */
  name: string;
  group: TileGroup;
  /** Počítadlová dlaždica: koľkokrát za deň sa smie ťuknúť. */
  multi?: number;
  /** Pod-voľby (`meta.sub`): kód ide na server, text je i18n `pack.zd.s.<kód>`. */
  subs?: Array<[code: string, label: string]>;
  special?: TileSpecial;
}

export const ZTILES: readonly ZTile[] = [
  { id: 'walk_short', emoji: '🐾', name: 'Short walk',  group: 'rutina', multi: 3 },
  { id: 'walk',       emoji: '🚶', name: 'Walk',        group: 'rutina' },
  { id: 'presence',   emoji: '⏳', name: 'Time together', group: 'rutina' },
  { id: 'feeding',    emoji: '🍖', name: 'Feeding',     group: 'rutina' },

  { id: 'play',     emoji: '🎾', name: 'Play',        group: 'den' },
  { id: 'training', emoji: '🏅', name: 'Training',    group: 'den' },
  { id: 'sniff',    emoji: '👃', name: 'New friend',  group: 'den', multi: 9 },
  { id: 'swim',     emoji: '🏊', name: 'Swimming',    group: 'den' },
  { id: 'hare',     emoji: '🐇', name: 'Rabbit',      group: 'den' },
  { id: 'lazy',     emoji: '😴', name: 'Lazy day',    group: 'den' },
  { id: 'mischief', emoji: '😈', name: 'Mischief',    group: 'den',
    subs: [['stole', 'stole something'], ['chewed', 'chewed'], ['ran', 'ran off'], ['carpet', 'carpet']] },
  { id: 'poop',     emoji: '💩', name: 'Poop event',  group: 'den',
    subs: [['diarrhoea', 'diarrhoea'], ['ate', 'ate something'], ['rain', 'in the rain'], ['record', 'a record']] },

  { id: 'vet',    emoji: '💉', name: 'Vet',       group: 'zdravie',
    subs: [['visit', 'visit'], ['vaccine', 'vaccination'], ['check', 'check-up'], ['course', 'treatment']] },
  { id: 'tick',   emoji: '🕷️', name: 'Tick',      group: 'zdravie', multi: 9 },
  { id: 'spa',    emoji: '✂️', name: 'Salon & spa', group: 'zdravie' },
  { id: 'weight', emoji: '⚖️', name: 'Weight',    group: 'zdravie', special: 'weight' },

  { id: 'trip',      emoji: '⛰️', name: 'Trip',       group: 'dalsie', special: 'trip' },
  { id: 'abroad',    emoji: '🌍', name: 'Abroad',     group: 'dalsie' },
  { id: 'contest',   emoji: '🏆', name: 'Contest',    group: 'dalsie' },
  { id: 'milestone', emoji: '⭐', name: 'Milestone',  group: 'dalsie', special: 'milestone' },
  { id: 'away',      emoji: '🏠', name: 'Day without me', group: 'dalsie' },
];

export const KIND_EMOJI: Readonly<Record<string, string>> = Object.fromEntries(ZTILES.map((t) => [t.id, t.emoji]));

/** Druhy, ktoré robia deň „zapísaným" v kalendári. Krmenie sa pripisuje aj samo (cron), preto ráta len ručné (`meta.manual`). */
export const ZAPIS_KINDS: readonly string[] = ZTILES.filter((t) => !t.special).map((t) => t.id);

export interface ZapisDay { day: string; kinds: string[] }

type Q = { range: (a: number, b: number) => PromiseLike<{ data: unknown[] | null; error: unknown }> };

/** Dni (YYYY-MM-DD, bratislavský deň zo `meta.day`) so zápisom + druhy, ktoré v ten deň padli. Bez účtu = []. */
export async function loadZapisDays(): Promise<ZapisDay[]> {
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user?.id;
  if (!uid) return [];
  const db = supabase as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const rows: Array<{ kind: string; meta: { day?: string; manual?: boolean; diet?: string } | null }> = [];
  for (let from = 0; ; from += 1000) {
    const q: Q = db.from('devotion_events').select('kind, meta').eq('user_id', uid).in('kind', [...ZAPIS_KINDS]).order('id');
    const { data, error } = await q.range(from, from + 999);
    if (error) throw error;
    rows.push(...((data ?? []) as typeof rows));
    if (!data || data.length < 1000) break;
  }
  const byDay = new Map<string, Set<string>>();
  for (const r of rows) {
    const day = r.meta?.day;
    if (!day) continue;
    if (r.kind === 'feeding' && !r.meta?.manual) continue;   // automatické krmenie (cron) nie je zápis človeka
    (byDay.get(day) ?? byDay.set(day, new Set()).get(day)!).add(r.kind);
  }
  return [...byDay].map(([day, k]) => ({ day, kinds: [...k] }));
}
