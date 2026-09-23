// ═══════════════════════════════════════════════════════════════════════════
// HEROFLOW — KTORÝ VSTUP BEŽÍ (23. 9. 2026)
//
// Jedno miesto, ktoré rozhoduje, či beží NOVÝ vstup (fotka → meno → ďalší psi →
// e-mail → prečo heroglyf → … → výrez) alebo pôvodný. Pýta sa ho router
// (`App.tsx`) aj obrazovky, ktoré sa správajú inak podľa toho, koľká sú v rade.
//
// 🔴 `import.meta.env.DEV` JE TU ZÁMERNE A NESMIE SA ODSTRÁNIŤ BEZ MULTI-MÓDU.
//    `npm run go-live` vyváža CELÝ `main`, nie vybraný commit — 1. 9. 2026 sa
//    takto nový vstup neplánovane odviezol na ostrý web v cudzom deploy commite
//    a 15 dní tam stál nepreverený. A `dogyptStore.ts` pri `extraDogs` varuje:
//    bez multi-módu „si niekto naklikal troch psov, zaplatil raz a dostal jeden
//    heroglyf" — cena je dnes natvrdo €11 a Stripe dostáva `quantity: 1`.
//
// Starý vstup v deve: `VITE_HEROFLOW_NEW=0 npm run dev`.
// ═══════════════════════════════════════════════════════════════════════════
export const NEW_HEROFLOW =
  import.meta.env.DEV && import.meta.env.VITE_HEROFLOW_NEW !== "0";

// Prvý krok flow — líši sa podľa režimu a guard naň presmeruje pri deep-linku.
export const FLOW_FIRST_STEP = NEW_HEROFLOW ? "/heroglyph/photo" : "/heroglyph/name";
