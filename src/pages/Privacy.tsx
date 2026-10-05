import LegalPage from "@/components/legal/LegalPage";

// 13 sekcií — texty žijú v i18n slovníkoch (privacy.sN.title / privacy.sN.body).
// Právne záväzná je EN verzia (legal.langNote).
// 12–13 (viditeľnosť v packu / správy a nahlásenia) pribudli 2026-08-04 pre /pack —
// pripojené na koniec zámerne, prečíslovanie by znamenalo prepísať 18 slovníkov.
// Šat (5. 10. 2026): spoločný `LegalPage` — papyrus, PageTopBar, karta z matrice.
const SECTION_COUNT = 13;

export default function Privacy() {
  return <LegalPage kind="privacy" count={SECTION_COUNT} />;
}
