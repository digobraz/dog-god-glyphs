// ── SKLAD NA VEĽKÉ DÁTA (21. 11. 2026, Matej: „toto sa nesmie už nikdy nikomu stať“) ─────────
// localStorage má v iPhone ~5 MB na celú appku a keď sa zaplní, padá KAŽDÝ zápis — aj výlet,
// aj prihlásenie. Fotky (base64 data URL) sa preto ukladajú SEM, do IndexedDB, ktorá má stovky MB.
// Pravidlo: čo má viac ako pár kB (fotka, obrázok, veľká kópia zo servera), nepatrí do localStorage.
// Stráž `npm run check:ulozisko` hlási súbor, ktorý dáva data URL do localStorage.
//
// Všetko je best-effort a asynchrónne. Keď IndexedDB nie je (súkromné okno), drží sa hodnota
// aspoň v pamäti do zavretia appky — nikdy nehodí chybu volajúcemu.

const DB = 'dogypt-big';
const STORE = 'kv';
const mem = new Map<string, unknown>();

let dbP: Promise<IDBDatabase | null> | null = null;
function db(): Promise<IDBDatabase | null> {
  if (dbP) return dbP;
  dbP = new Promise((res) => {
    try {
      const rq = indexedDB.open(DB, 1);
      rq.onupgradeneeded = () => { rq.result.createObjectStore(STORE); };
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => res(null);
      rq.onblocked = () => res(null);
    } catch { res(null); }
  });
  return dbP;
}

export async function bigGet<T>(key: string): Promise<T | null> {
  if (mem.has(key)) return mem.get(key) as T;
  const d = await db();
  if (!d) return null;
  return new Promise((res) => {
    try {
      const rq = d.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      rq.onsuccess = () => res((rq.result ?? null) as T | null);
      rq.onerror = () => res(null);
    } catch { res(null); }
  });
}

/** `true` = leží v IndexedDB (prežije zabitie appky); `false` = len v pamäti. */
export async function bigSet(key: string, val: unknown): Promise<boolean> {
  mem.set(key, val);
  const d = await db();
  if (!d) return false;
  return new Promise((res) => {
    try {
      const tx = d.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(val, key);
      tx.oncomplete = () => { mem.delete(key); res(true); };
      tx.onerror = () => res(false);
      tx.onabort = () => res(false);
    } catch { res(false); }
  });
}

export async function bigDel(key: string): Promise<void> {
  mem.delete(key);
  const d = await db();
  if (!d) return;
  await new Promise<void>((res) => {
    try {
      const tx = d.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    } catch { res(); }
  });
}

/** Zmaže všetko, čo začína `prefix` (odhlásenie, zmazanie účtu). */
export async function bigDelPrefix(prefix: string): Promise<void> {
  [...mem.keys()].filter((k) => k.startsWith(prefix)).forEach((k) => mem.delete(k));
  const d = await db();
  if (!d) return;
  await new Promise<void>((res) => {
    try {
      const tx = d.transaction(STORE, 'readwrite');
      // Kľúče s prefixom tvoria súvislý rozsah: [prefix, prefix + '￿').
      tx.objectStore(STORE).delete(IDBKeyRange.bound(prefix, prefix + '￿'));
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    } catch { res(); }
  });
}
