import LegalPage from "@/components/legal/LegalPage";
import { SOS_ON } from "@/lib/env";

// 13 sekcií — texty žijú v i18n slovníkoch (privacy.sN.title / privacy.sN.body).
// Právne záväzná je EN verzia (legal.langNote).
// 12–13 (viditeľnosť v packu / správy a nahlásenia) pribudli 2026-08-04 pre /pack —
// pripojené na koniec zámerne, prečíslovanie by znamenalo prepísať 18 slovníkov.
// Šat (5. 10. 2026): spoločný `LegalPage` — papyrus, PageTopBar, karta z matrice.
// 14 (AINUBIS a údaje člena) pribudla 2026-10-11 — EN/SK/CS; ostatné jazyky padajú na EN.
// 15 (kontakty v SOS pláne) pribudla 2026-11-05 — EN/SK/CS, ukáže sa až so zapnutím SOS.
const SECTION_COUNT = SOS_ON ? 15 : 14;

export default function Privacy() {
  return <LegalPage kind="privacy" count={SECTION_COUNT} />;
}
