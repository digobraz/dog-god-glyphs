import type { StoreApi } from 'zustand';
import type { DogyptState } from '@/store/dogyptStore';

// ═══════════════════════════════════════════════════════════════════════════
// KONCEPT VSTUPU PRE OBNOVENIE STRÁNKY (6. 10. 2026, audit /onepage 🟠2)
//
// Reload (alebo zahodená karta na iPhone Safari po návrate z kamery/galérie)
// uprostred heroglyph vstupu vyprázdnil store a guard poslal človeka na prázdne
// MENO — stratil meno, dátum, fotku aj ďalších psov.
//
// ⚠️ PREČO `sessionStorage` A NIE `persist` V STORE. `persist` (localStorage) sa
//    z `dogyptStore.ts` zámerne vyhodil (v4): stale foto a meno unikali medzi
//    kupcami na zdieľanom zariadení. `sessionStorage` žije len v jednej karte a
//    zanikne s ňou — leak medzi kupcami to neotvára. Navyše má koncept TTL.
// ⚠️ Obnovuje sa SYNCHRÓNNE pri vzniku storu (pred prvým renderom), takže
//    `useFlowGuard` vidí `dogName` hneď a nikam nepresmeruje; obrazovky si
//    store kopírujú do lokálneho stavu pri prvom renderi (viď devSeedApply.ts).
// ⚠️ `blob:` adresy po reloade neexistujú — zahadzujú sa; ostáva https URL z
//    Cloudinary `tmp/` (fotka sa nahráva hneď pri výbere).
// 🔴 Vymazanie: `clearFlowDraft()` volá uvítacia obrazovka po platbe a krok
//    zápisu hosťa. Po ňom sa už nič nepíše, kým človek nezačne nového psa
//    (`reset()` zmení `sessionId`).
// ═══════════════════════════════════════════════════════════════════════════

const KEY = 'dogypt-flow-draft';
const TTL_MS = 6 * 60 * 60 * 1000;

const FIELDS = [
  'sessionId', 'dogName', 'ownerName', 'currentStep', 'selections', 'email',
  'dogPhotoUrl', 'cloudinaryPublicId', 'cloudinaryExtraPublicIds',
  'patronCategory', 'patronSvg', 'breed', 'isMix', 'patronCategory2', 'patronSvg2',
  'certCropData', 'gridCropData', 'extraPhotos', 'gdprConsent', 'draftId',
  'lifeStatus', 'deathDate', 'extraDogs', 'mainDogPos', 'dogOrderStart', 'dogEssence',
] as const;

const isBlob = (u: unknown) => typeof u === 'string' && u.startsWith('blob:');

function snapshot(s: DogyptState): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  for (const k of FIELDS) o[k] = (s as any)[k];
  if (isBlob(o.dogPhotoUrl)) o.dogPhotoUrl = '';
  o.extraPhotos = (s.extraPhotos || []).filter((u) => !isBlob(u));
  o.extraDogs = (s.extraDogs || []).map((d) => ({ ...d, photoUrl: isBlob(d.photoUrl) ? null : d.photoUrl }));
  return o;
}

let sealed = false;
let lastSession = '';

/** Zmaže koncept a zastaví zápis, kým človek nezačne nového psa. */
export function clearFlowDraft(): void {
  sealed = true;
  try { sessionStorage.removeItem(KEY); } catch { /* súkromný režim */ }
}

/** Obnoví koncept do storu (ak ho karta má) a začne ho priebežne zapisovať. */
export function startFlowDraft(store: StoreApi<DogyptState>): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(KEY);
    const d = raw ? JSON.parse(raw) : null;
    if (d && d.v === 1 && Date.now() - d.ts < TTL_MS && (d.data?.dogName || d.data?.dogPhotoUrl) && !store.getState().dogName && !store.getState().dogPhotoUrl) {
      const patch: Record<string, unknown> = {};
      for (const k of FIELDS) if (k in d.data) patch[k] = d.data[k];
      store.setState(patch as Partial<DogyptState>);
    } else if (d) {
      sessionStorage.removeItem(KEY);
    }
  } catch { try { sessionStorage.removeItem(KEY); } catch { /* nič */ } }

  lastSession = store.getState().sessionId;
  let timer: number | undefined;
  store.subscribe((s) => {
    // Nový pes po uzavretom koncepte = `reset()` (iné `sessionId`). ⚠️ Nie „meno od nuly":
    // uvítacia obrazovka po platbe dolieva meno zo servera do prázdneho storu a koncept by ožil.
    if (s.sessionId !== lastSession) sealed = false;
    lastSession = s.sessionId;
    if (sealed) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (sealed) return;
      try {
        const cur = store.getState();
        const snap = snapshot(cur);
        if (!cur.dogName && !snap.dogPhotoUrl) { sessionStorage.removeItem(KEY); return; }
        sessionStorage.setItem(KEY, JSON.stringify({ v: 1, ts: Date.now(), data: snap }));
      } catch { /* plné úložisko / súkromný režim — koncept je bonus, nie nutnosť */ }
    }, 150);
  });
}
