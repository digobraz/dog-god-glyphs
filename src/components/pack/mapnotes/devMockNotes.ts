// ============================================================================
// DEV-ONLY zápisy do mapy pre beh bez prihlásenia (`VITE_PACK_NOAUTH=1`).
//
// Značky svorky nejdú cez tabuľku, ale cez RPC (`add_map_note`, `list_map_notes`),
// a tie majú EXECUTE len pre `authenticated`. Bez session teda anon kľúč dostane
// `42501 permission denied for function add_map_note` — v UI sa to prejaví ako
// „Neuložilo sa, skús to znova". Vyzerá to ako výpadok siete, ale je to chýbajúce
// prihlásenie (Matej 2026-08-23, test kroku 2 na telefóne: parkovisko sa nedalo
// uložiť a sprievodca výletu sa tým zastavil).
//
// Rovnaký dôvod aj rovnaký vzor ako `lib/devMockDogs.ts`: test na TELEFÓNE nemá
// dôvod pýtať heslo. Zápisy žijú v `localStorage` tohto zariadenia — nie sú to
// dáta, sú to rekvizity pre jednu skúšku flow.
//
// ⚠️ Do produkčného buildu sa to nedostane: `import.meta.env.DEV` je vo `vite build`
//    `false` ⇒ `DEV_NOAUTH` je natvrdo `false` a všetky vetvy nižšie sa odstránia.
// ============================================================================
import { DEV_NOAUTH } from '@/lib/devMockDogs';
import type { MapNote, NewMapNote } from './mapNotesData';

export { DEV_NOAUTH };

const KEY = 'dogypt.dev.mapnotes.v1';

function read(): MapNote[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MapNote[]) : [];
  } catch {
    return [];
  }
}

function write(list: MapNote[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // plné úložisko — v deve je to nezaujímavé, zápis sa proste nezachová
  }
}

export function devListNotes(): MapNote[] {
  return read();
}

export function devAddNote(n: NewMapNote): string {
  // `Date.now()` stačí — je to kľúč jednej relácie na jednom telefóne, nie identifikátor
  // v databáze, kde by dva zápisy v tej istej milisekunde boli reálne riziko.
  const id = `dev-note-${Date.now()}`;
  const note: MapNote = {
    id,
    kind: n.kind,
    disease: n.disease ?? null,
    lat: n.lat,
    lon: n.lon,
    radiusM: n.radiusM ?? null,
    body: n.body,
    pinnedSlug: n.pinnedSlug ?? null,
    paid: n.paid ?? null,
    createdAt: new Date().toISOString(),
    // `isMine: true` zámerne — v deve je autorom ten, kto skúša, takže vidí aj mazanie
    // vlastného zápisu. Bez toho by sa krok 2 dal vyskúšať len jedným smerom.
    isMine: true,
    authorFirst: 'Matej',
    authorPhoto: null,
    packNumber: 1,
    validVotes: 0,
    staleVotes: 0,
    myVote: null,
    likes: 0,
    myLike: false,
    isStale: false,
  };
  write([...read(), note]);
  return id;
}

export function devRemoveNote(id: string) {
  write(read().filter((n) => n.id !== id));
}

export function devVoteNote(id: string, valid: boolean | null) {
  write(read().map((n) => (n.id === id ? { ...n, myVote: valid } : n)));
}

export function devLikeNote(id: string, on: boolean) {
  write(read().map((n) => (n.id === id ? { ...n, myLike: on, likes: Math.max(0, n.likes + (on ? 1 : -1)) } : n)));
}
