// ── DOHĽAD V APPKE (23. 11. 2026) ───────────────────────────────────────────────
// Matej: „budeme sledovať každého pre bezpečnosť apky ... vo vnútri apky musíme mať kontrolu".
// Zapisuje sa LEN v natívnej appke (IS_APP), každému prihlásenému — nezávisí od cookie lišty
// (oprávnený záujem, zásady ochrany údajov). Web ostáva na PostHogu podľa súhlasu.
//
// Čo sa zapisuje: otvorenie appky, obrazovka (cesta bez query) a ťuk = NÁZOV tlačidla.
// Čo NIE: miesto prsta, text z polí, obsah príspevkov (odkaz nesie cestu, nie text).
// Dávkovo (á 30 s, pri odchode do pozadia) cez RPC `log_app_events` — žiadny zápis na ťuk.
// Tabuľku číta len /admin (záložka Members), migrácia 20270111_clenovia_dohlad.sql.

import { supabase } from '@/integrations/supabase/client';
import { IS_APP, APP_PLATFORM } from '@/lib/isApp';

type Ev = { kind: 'open' | 'screen' | 'tap'; screen?: string; action?: string; at: string };

const FLUSH_MS = 30_000;
const MAX_QUEUE = 200;
let queue: Ev[] = [];
let started = false;
let signedIn = false;
let version: string | null = null;
let lastScreen = '';

const screenNow = () => window.location.pathname.slice(0, 120);

function push(e: Omit<Ev, 'at'>) {
  if (!signedIn) return;
  queue.push({ ...e, at: new Date().toISOString() });
  if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);
}

function device(): string {
  const ua = navigator.userAgent;
  const android = ua.match(/Android [\d.]+; ([^;)]+?)(?: Build|\))/);
  if (android) return android[1].trim().slice(0, 60);
  const ios = ua.match(/\((iPhone|iPad|iPod)[^)]*OS ([\d_]+)/);
  if (ios) return `${ios[1]} · iOS ${ios[2].replace(/_/g, '.')}`;
  return APP_PLATFORM;
}

async function appVersion(): Promise<string | null> {
  try {
    const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
    const cur = await CapacitorUpdater.current();
    const b = cur.bundle?.version;
    return b && b !== 'builtin' ? `${cur.native}+${b}` : cur.native;
  } catch { return null; }
}

async function flush() {
  if (!queue.length || !signedIn) return;
  const batch = queue;
  queue = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RPC nie je v generovaných typoch
    await (supabase as any).rpc('log_app_events', {
      p_events: batch, p_platform: APP_PLATFORM, p_version: version, p_device: device(),
    });
  } catch { /* dohľad nesmie appke nič rozbiť; dávka prepadne */ }
}

function onScreen() {
  const s = screenNow();
  if (s === lastScreen) return;
  lastScreen = s;
  push({ kind: 'screen', screen: s });
}

/** Názov tlačidla, nikdy text, ktorý človek napísal. */
function tapLabel(el: HTMLElement): string {
  const named = el.dataset.ev || el.getAttribute('aria-label') || el.getAttribute('title');
  if (named) return named.trim().slice(0, 60);
  if (el.tagName === 'A') {
    const href = el.getAttribute('href') || '';
    return href.startsWith('/') ? `→ ${href.split('?')[0]}`.slice(0, 60) : 'odkaz';
  }
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
  // dlhý text = skôr obsah (karta príspevku) než popis tlačidla
  return text && text.length <= 40 ? text : el.tagName.toLowerCase();
}

function onTap(e: Event) {
  const t = e.target as HTMLElement | null;
  if (!t || t.closest('input, textarea, select, [contenteditable="true"]')) return;
  const el = t.closest<HTMLElement>('button, a, [role="button"], [role="tab"], [role="menuitem"], [data-ev]');
  if (!el) return;
  push({ kind: 'tap', screen: screenNow(), action: tapLabel(el) });
}

/** Na štarte (main.tsx). Na webe nič. */
export function startAppActivity() {
  if (!IS_APP || started) return;
  started = true;
  void appVersion().then((v) => { version = v; });

  supabase.auth.onAuthStateChange((event, session) => {
    const was = signedIn;
    signedIn = !!session?.user;
    if (signedIn && !was) {
      push({ kind: 'open', screen: screenNow() });
      lastScreen = '';
      onScreen();
    }
    if (!signedIn) queue = [];
    if (event === 'SIGNED_OUT') lastScreen = '';
  });

  // obrazovky: router appky ide cez history API
  for (const m of ['pushState', 'replaceState'] as const) {
    const orig = history[m].bind(history);
    history[m] = ((...args: Parameters<History['pushState']>) => {
      const r = orig(...args);
      queueMicrotask(onScreen);
      return r;
    }) as History['pushState'];
  }
  window.addEventListener('popstate', onScreen);
  document.addEventListener('click', onTap, { capture: true, passive: true });

  window.setInterval(() => { void flush(); }, FLUSH_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush();
    else if (signedIn) push({ kind: 'open', screen: screenNow() });
  });
}
