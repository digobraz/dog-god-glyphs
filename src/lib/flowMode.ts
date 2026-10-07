// ═══════════════════════════════════════════════════════════════════════════
// HEROFLOW — KTORÝ VSTUP BEŽÍ (23. 9. 2026)
//
// Jedno miesto, ktoré rozhoduje, či beží NOVÝ vstup (fotka → meno → ďalší psi →
// e-mail → prečo heroglyf → … → výrez) alebo pôvodný. Pýta sa ho router
// (`App.tsx`) aj obrazovky, ktoré sa správajú inak podľa toho, koľká sú v rade.
//
// ✅ FLIP 7. 10. 2026: nový vstup beží aj v produkcii. Brána `import.meta.env.DEV`
//    tu stála do FLIPu, lebo `go-live` vyváža celý `main` a bez multi-módu by
//    „si niekto naklikal troch psov, zaplatil raz a dostal jeden heroglyf".
//    Multi-mód je hotový: pokladňa platí per pes (`dogs[]` v `create-checkout`).
//
// Starý vstup (len na porovnanie): `VITE_HEROFLOW_NEW=0 npm run dev`.
// ═══════════════════════════════════════════════════════════════════════════
export const NEW_HEROFLOW = import.meta.env.VITE_HEROFLOW_NEW !== "0";

// Prvý krok flow — líši sa podľa režimu a guard naň presmeruje pri deep-linku.
// 🔴 26. 9. 2026: v novom vstupe tu stála `/heroglyph/photo` — STARÁ tmavá
//    obrazovka fotky, ktorú nový vstup nepoužíva (fotka je popup nad stenou).
//    Refresh uprostred vstupu tak hodil človeka do starého šatu a jej POKRAČOVAŤ
//    skočilo rovno na `/heroglyph/breed` cez svorku, e-mail aj podstatu.
//    Prvá VLASTNÁ routa nového vstupu je meno.
export const FLOW_FIRST_STEP = "/heroglyph/name";
