import { useDogyptStore, type ExtraDog } from '@/store/dogyptStore';
import { readDevSeed, type DevSeed } from './devSeed';

// ═══════════════════════════════════════════════════════════════════════════
// SEED DO STORE — PRED PRVÝM RENDEROM (23. 9. 2026)
//
// 🔴 PREČO TENTO SÚBOR A NIE EFEKT V KOMPONENTE. Prvý pokus nalieval seed v
//    `useEffect` (`DevSeedBoot`) a obrazovka mena zostala PRÁZDNA, hoci store
//    meno mal: `NameScreen` si robí `useState(initialName)` zo store a ten
//    initializer beží RAZ, pri prvom renderi. Seed prišiel o kúsok neskôr,
//    takže pole ostalo na prázdnej hodnote a vyzeralo to ako chyba obrazovky.
//    Tá istá pasca čaká na každú obrazovku flow — skoro všetky si kopírujú
//    store do lokálneho stavu (dátum, krajina, „žije?").
//
//    Preto sa seed vkladá tu, v tele modulu, ktorý `main.tsx` importuje
//    STATICKY — teda skôr, než vôbec vznikne React root.
//
// ⚠️ V PRODUKCII JE TENTO SÚBOR PRÁZDNY. Telo visí na `import.meta.env.DEV`,
//    čo Vite pri builde nahradí `false` a celú vetvu odstráni.
// ═══════════════════════════════════════════════════════════════════════════

/** Naleje seed do store. Volá sa raz, pred renderom. */
export function applyDevSeedToStore(seed: DevSeed): void {
  const s = useDogyptStore.getState();
  if (seed.dogName) s.setDogName(seed.dogName);
  if (seed.email) s.setEmail(seed.email);
  if (seed.photoUrl) s.setDogPhotoUrl(seed.photoUrl);
  s.setLifeStatus(seed.lifeStatus);
  s.setDeathDate(seed.lifeStatus === 'deceased' ? '2024-03-17' : null);

  // Narodenie a krajina patria k menu — v REÁLNEJ ceste ich prvý pes má z bloku
  // ZÁKLAD. Bez nich ho obrazovka psov ukáže s „???" a vyzerá to ako chyba
  // multipsa, hoci je to len chudobný seed.
  s.setSelection('birthdayDay', '12');
  s.setSelection('birthdayMonth', '08');
  s.setSelection('birthdayYear', '2018');
  s.setSelection('country', 'SK');

  // Ďalší psi: prvý má vyplnené (Matej 23. 9.: „pri multipsovi prvý pes svieti
  // na zeleno" — údaje má z obrazovky s menom), zvyšok je prázdny riadok.
  const extra: ExtraDog[] = Array.from({ length: seed.extraDogs }, (_, i) => ({
    name: i === 0 ? 'ALBA' : '',
    lifeStatus: 'alive',
    deathDate: null,
    birthday: i === 0 ? '2019-06-04' : '',
    country: null,
  }));
  s.setExtraDogs(extra);
}

if (import.meta.env.DEV) {
  const seed = readDevSeed();
  if (seed) applyDevSeedToStore(seed);
}
