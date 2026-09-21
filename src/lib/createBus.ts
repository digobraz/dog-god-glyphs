// ════════════════════════════════════════════════════════════════════════════
// createBus — ako sa voľba z panela `+` dostane k obrazovke, ktorá ju vie vykonať.
//
// Zadanie: `plany/zadanie-pack-plus-lista-DALSIA-SESSION.md` §3 KROK 4.
// Lock:    `plany/locky/architektura-pack.md` §1.1.1 — jeden pridávací panel, viac vchodov.
//
// PREČO EXISTUJE. Panel `+` žije v LIŠTE, teda v shelli — a lištu si mountujú štyri povrchy.
// Mapové objekty (výlet, rýchly odkaz, podujatie) ale vykonáva `PackMap`, ktorý je raz
// RODIČ lišty (`/pack/map`) a inokedy nie je namountovaný vôbec (`/pack`, `/pack/dogs`).
// Prop cez štyri povrchy by piaty raz zabudol podať; context nad celým `/pack` by sa
// zakladal kvôli jednému tlačidlu. Je to tá istá úvaha, pre ktorú vznikol `ainubisBus`.
//
// 🔴 ČAKAJÚCA VOĽBA JE JADRO VECI, NIE OPTIMALIZÁCIA. Keď človek stojí na DOMOVE a klikne
//    VÝLET, appka musí NAJPRV prejsť na mapu a AŽ POTOM voľbu odovzdať — inak ju prijme
//    nikto. `emit` preto voľbu podrží, kým sa odberateľ neprihlási, a odovzdá mu ju hneď
//    po prihlásení.
//
// ⚠️ DRŽÍ SA PRÁVE JEDNA. Druhý klik prepíše prvý — človek chcel to, na čo klikol naposledy.
//    Fronta by po návrate na mapu otvorila dva formuláre za sebou.
// ⚠️ ČAKAJÚCA VOĽBA MÁ ŽIVOTNOSŤ. Keď navigácia zlyhá alebo si to človek rozmyslí a ide
//    inam, nesmie mu formulár vyskočiť o pol hodiny pri ďalšom otvorení mapy.
// ════════════════════════════════════════════════════════════════════════════
import type { CreateId } from '@/components/pack/createRegistry';

/** Voľba z panela, prepísaná do tvaru, ktorému rozumie `PackMap`. */
export type CreateIntent =
  | { id: Extract<CreateId, 'trip'> }
  | { id: Extract<CreateId, 'note'>; group: string }
  | { id: Extract<CreateId, 'event'>; origin: 'own' | 'tip' };

/** Ako dlho smie voľba čakať na odberateľa. Prechod na mapu trvá stovky ms, nie minúty. */
const PENDING_MS = 10_000;

let pending: { intent: CreateIntent; at: number } | null = null;
const subs = new Set<(i: CreateIntent) => void>();

/** Panel `+` odovzdáva voľbu. Keď odberateľ ešte nie je, voľba počká. */
export function emitCreate(intent: CreateIntent): void {
  if (subs.size > 0) {
    subs.forEach((fn) => fn(intent));
    return;
  }
  pending = { intent, at: Date.now() };
}

/**
 * Obrazovka sa prihlási na vykonávanie volieb. Vracia funkciu na odhlásenie.
 *
 * ⚠️ Čakajúca voľba sa doručuje v `queueMicrotask`, nie synchrónne v efekte — inak by
 *    odberateľ volal `setState` počas vlastného mountu a React by to zahodil.
 */
export function onCreate(fn: (i: CreateIntent) => void): () => void {
  subs.add(fn);
  if (pending) {
    const p = pending;
    pending = null;
    if (Date.now() - p.at <= PENDING_MS) queueMicrotask(() => fn(p.intent));
  }
  return () => { subs.delete(fn); };
}
