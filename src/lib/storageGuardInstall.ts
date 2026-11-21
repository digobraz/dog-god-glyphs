// Prvý import v `main.tsx`: stráž localStorage musí stáť skôr, než ktorýkoľvek modul pri načítaní zapíše.
// Odôvodnenie v `storageGuard.ts`.
import { installStorageGuard, storageHousekeeping } from './storageGuard';

installStorageGuard();
if (typeof window !== 'undefined') window.setTimeout(() => { void storageHousekeeping(); }, 4000);
