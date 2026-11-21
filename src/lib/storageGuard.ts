// ── STRÁŽ LOCALSTORAGE (21. 11. 2026, Matej: „toto sa nesmie už nikdy nikomu stať“) ─────────────
// Príbeh: v iPhone sa zaplnilo localStorage (~5 MB na celú appku) kópiami zo servera — hlavne
// fotkami psov pre offline SOS kartičku (900 px ako data URL). Zápis výletu potom padol a fotky
// k výletu „Banka“ sa stratili. Appka má vyše 100 miest, ktoré do localStorage píšu, a každé si
// chybu „plné“ ošetrovalo po svojom (väčšinou ticho bez uloženia).
//
// Tri vrstvy, aby sa to nestalo NIKDE, nielen pri výlete:
//  1. PREVENCIA — fotky a iné veľké dáta idú do IndexedDB (`bigStore.ts`), nie sem. Stráž v builde
//     `npm run check:ulozisko` nepustí nový súbor, ktorý dáva data URL do localStorage.
//  2. ZÁCHRANA PRI ZÁPISE — `installStorageGuard()` obalí `localStorage.setItem`: keď hodí „plné“,
//     zahodia sa kópie, ktoré si appka vie stiahnuť znova (od najmenej potrebnej), a zápis sa
//     zopakuje. Platí pre KAŽDÝ zápis v appke, aj pre ten, ktorý pribudne zajtra.
//  3. ÚDRŽBA PRI ŠTARTE — `storageHousekeeping()` presťahuje staré fotky do IndexedDB a keď je
//     localStorage nad prahom, upratá kópie vopred, skôr než niečo padne.
// Rozpracované veci (koncept výletu, fronta synchronizácie, prihlásenie) sa NIKDY nemažú.
// Každé zaplnenie aj veľký zápis sa hlási do PostHogu (`storage_full`, `storage_high`,
// `storage_big_write`) — vieme, čo plní telefóny, bez toho, aby nám to niekto musel povedať.
import { track } from '@/lib/analytics';
import { bigSet } from '@/lib/bigStore';

/** Kópie zo servera, ktoré sa smú zahodiť — v poradí od najmenej potrebnej. */
const REFETCHABLE: ((k: string) => boolean)[] = [
  (k) => k === 'vault-list-v1',
  (k) => k === 'feed-posts-v1' || k === 'feed-nearby-v1',
  (k) => k.startsWith('dogypt.ecard.photo.'), // staré miesto fotiek kartičky (od 21. 11. v IndexedDB)
  (k) => k.startsWith('dogypt.ecard.cache.'),
];
export const STORAGE_REPORT_KEY = 'trp-storage-report';
/** Nad týmto počtom znakov upracme vopred (kvóta WebKitu je ~5 M znakov na celý pôvod). */
const HIGH_CHARS = 3_000_000;
/** Jedna hodnota nad týmto počtom znakov je skoro iste fotka — patrí do `bigStore`. */
const BIG_WRITE_CHARS = 200_000;

let guardInstalled = false;
let origSet: ((this: Storage, key: string, value: string) => void) | null = null;
const rawSet = (s: Storage, k: string, v: string) => (origSet ?? Storage.prototype.setItem).call(s, k, v);

function isQuota(e: unknown): boolean {
  const err = e as { name?: string; code?: number } | null;
  return !!err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED' || err.code === 22 || err.code === 1014);
}

function sizes(s: Storage): { rows: [string, number][]; total: number } {
  const rows: [string, number][] = [];
  for (let i = 0; i < s.length; i++) {
    const k = s.key(i);
    if (k) rows.push([k, k.length + (s.getItem(k) ?? '').length]);
  }
  rows.sort((a, b) => b[1] - a[1]);
  return { rows, total: rows.reduce((n, r) => n + r[1], 0) };
}

/** Zmeria, čo úložisko plní (stav PRED upratovaním), pošle do PostHogu a vráti záznam na uloženie. */
function report(s: Storage, event: 'storage_full' | 'storage_high'): string {
  try {
    const { rows, total } = sizes(s);
    const top = rows.slice(0, 10).map(([k, n]) => `${k}:${Math.round(n / 1024)}k`);
    track(event, { totalK: Math.round(total / 1024), top: top.join(' ') });
    return JSON.stringify({ at: new Date().toISOString(), event, totalK: Math.round(total / 1024), top });
  } catch { return ''; /* hlásenie je len pomôcka */ }
}
/** Záznam sa ukladá až PO upratovaní — inak by naň nebolo miesto. */
function keepReport(s: Storage, rec: string): void {
  if (rec) { try { rawSet(s, STORAGE_REPORT_KEY, rec); } catch { /* */ } }
}

/** Zahodí ďalšiu skupinu kópií od `from`; vráti index ďalšej, `-1` = už nie je čo zahodiť. */
function dropNext(s: Storage, from: number): number {
  for (let g = from; g < REFETCHABLE.length; g++) {
    const keys: string[] = [];
    for (let i = 0; i < s.length; i++) { const k = s.key(i); if (k && REFETCHABLE[g](k)) keys.push(k); }
    if (!keys.length) continue;
    keys.forEach((k) => { try { s.removeItem(k); } catch { /* */ } });
    return g + 1;
  }
  return -1;
}

/**
 * Spustí `write`; keď padne na plnom úložisku, upratuje kópie a skúša znova. Bez nainštalovanej
 * stráže (testy) robí to isté sama. `true` = zapísané.
 */
export function withStorageRoom(write: () => void, s: Storage = localStorage): boolean {
  // So strážou už `setItem` upratal a zopakoval sám — keď aj tak padol, viac sa nedá.
  try { write(); return true; } catch (e) { if (guardInstalled || !isQuota(e)) return false; }
  const rec = report(s, 'storage_full');
  let g = 0;
  while ((g = dropNext(s, g)) !== -1) {
    try { write(); keepReport(s, rec); return true; } catch { /* ešte stále plné */ }
  }
  return false;
}

const bigWarned = new Set<string>();

/** Obalí `localStorage.setItem` (raz, pri štarte appky v `main.tsx`). */
export function installStorageGuard(): void {
  if (guardInstalled || typeof Storage === 'undefined') return;
  let ls: Storage;
  try { ls = window.localStorage; } catch { return; }
  origSet = Storage.prototype.setItem;
  const orig = origSet;
  Storage.prototype.setItem = function guardedSetItem(this: Storage, key: string, value: string) {
    if (this !== ls) return orig.call(this, key, value);
    const v = String(value);
    if (v.length > BIG_WRITE_CHARS && !bigWarned.has(key)) {
      bigWarned.add(key);
      if (import.meta.env.DEV) console.warn(`[úložisko] ${key} má ${Math.round(v.length / 1024)} kB — veľké dáta patria do bigStore (IndexedDB), nie do localStorage`);
      try { track('storage_big_write', { key, k: Math.round(v.length / 1024) }); } catch { /* */ }
    }
    try { return orig.call(this, key, v); } catch (e) {
      if (!isQuota(e)) throw e;
      const rec = report(this, 'storage_full');
      let g = 0;
      while ((g = dropNext(this, g)) !== -1) {
        try { orig.call(this, key, v); keepReport(this, rec); return; } catch { /* ešte stále plné */ }
      }
      throw e; // naozaj plné rozpracovanou prácou — volajúci to ošetrí ako doteraz
    }
  };
  guardInstalled = true;
}

/** Pri štarte appky, v pokoji: presťahuje fotky kartičiek do IndexedDB a upratá, keď je plno. */
export async function storageHousekeeping(): Promise<void> {
  let ls: Storage;
  try { ls = window.localStorage; } catch { return; }
  try {
    const photoKeys: string[] = [];
    for (let i = 0; i < ls.length; i++) { const k = ls.key(i); if (k?.startsWith('dogypt.ecard.photo.')) photoKeys.push(k); }
    for (const k of photoKeys) {
      const raw = ls.getItem(k);
      if (raw) { try { await bigSet(k, JSON.parse(raw)); } catch { /* poškodené: zahodiť */ } }
      ls.removeItem(k);
    }
    // Koncepty SOS kartičky s vlastnou fotkou (data URL) — fotka do IndexedDB, v koncepte ostane `big: true`.
    const draftKeys: string[] = [];
    for (let i = 0; i < ls.length; i++) { const k = ls.key(i); if (k?.startsWith('dogypt.ecard.') && !/^dogypt\.ecard\.(cache|photo|sos|last)\./.test(k)) draftKeys.push(k); }
    for (const k of draftKeys) {
      try {
        const d = JSON.parse(ls.getItem(k) ?? 'null') as { photo?: { src?: string; big?: boolean } } | null;
        const src = d?.photo?.src;
        if (!src?.startsWith('data:')) continue;
        if (!(await bigSet(`${k}.src`, src))) continue; // bez IndexedDB ostane, kde je
        delete d!.photo!.src; d!.photo!.big = true;
        rawSet(ls, k, JSON.stringify(d));
      } catch { /* cudzí tvar: nechať */ }
    }
    if (sizes(ls).total > HIGH_CHARS) {
      const rec = report(ls, 'storage_high');
      let g = 0;
      while (sizes(ls).total > HIGH_CHARS && (g = dropNext(ls, g)) !== -1) { /* upratuje po skupinách */ }
      keepReport(ls, rec);
    }
  } catch { /* údržba nesmie zhodiť štart */ }
}
