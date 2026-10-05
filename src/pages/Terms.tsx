import LegalPage from "@/components/legal/LegalPage";

// 14 sekcií — texty žijú v i18n slovníkoch (terms.sN.title / terms.sN.body).
// Právne záväzná je EN verzia (legal.langNote).
// 12–14 (obsah / správy / moderácia) pribudli 2026-08-04 pre /pack — pripojené na koniec
// zámerne, prečíslovanie by znamenalo prepísať názvy vo všetkých 18 slovníkoch.
// Šat (5. 10. 2026): spoločný `LegalPage` — papyrus, PageTopBar, karta z matrice.
const SECTION_COUNT = 14;

export default function Terms() {
  return <LegalPage kind="terms" count={SECTION_COUNT} />;
}
