// Tenká event vrstva pre otváranie messaging overlayu (Inbox/Thread) odkiaľkoľvek v appke
// (PackNotifications dropdown, trip detail panel v PackPortal.tsx, …) bez prop-drillingu cez
// PackPortal (1900+ riadkov) alebo PackLayout. Design: plany/zadanie-profil-messaging-2026-07-23.md
// §10 Fable amendment — "openThread(convId) sa volá cez TEN ISTÝ event emitter z packMessaging.ts".
//
// packMessaging.ts.subscribe() je ale "dátový" emitter — no-arg callback pre zmenu dát (nová
// správa, unread count). Otvorenie overlayu potrebuje NIESŤ payload (ktoré vlákno / inbox), takže
// je to samostatný UI-intent kanál, POSTAVENÝ na rovnakom pub/sub vzore (Set<Listener>, žiadny
// globálny store) — nie duplikát, len druhý kanál pre iný typ udalosti.
export type MessagingOpenEvent =
  | { mode: 'inbox' }
  | { mode: 'thread'; convId: string };

type Listener = (ev: MessagingOpenEvent) => void;
const listeners = new Set<Listener>();

export function emitOpenThread(convId: string): void {
  listeners.forEach((l) => l({ mode: 'thread', convId }));
}

export function emitOpenInbox(): void {
  listeners.forEach((l) => l({ mode: 'inbox' }));
}

export function onOpenMessaging(cb: Listener): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}
