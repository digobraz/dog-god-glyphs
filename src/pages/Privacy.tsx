import LegalPage from "@/components/legal/LegalPage";

// 13 sekcií — texty žijú v i18n slovníkoch (privacy.sN.title / privacy.sN.body).
// Právne záväzná je EN verzia (legal.langNote).
// 12–13 (viditeľnosť v packu / správy a nahlásenia) pribudli 2026-08-04 pre /pack —
// pripojené na koniec zámerne, prečíslovanie by znamenalo prepísať 18 slovníkov.
// Šat (5. 10. 2026): spoločný `LegalPage` — papyrus, PageTopBar, karta z matrice.
// 14 (AINUBIS a údaje člena) pribudla 2026-10-11 — EN/SK/CS; ostatné jazyky padajú na EN.
// 15 (kontakty v SOS pláne) pribudla 2026-11-05 — EN/SK/CS, ukáže sa až so zapnutím SOS.
// 16 (appka) a 17 (zmazanie účtu) pribudli 2026-11-06 pre App Store a Google Play — EN/SK/CS.
// Kotvy: Support URL = /privacy#contact, zmazanie účtu (Google Data Safety) = /privacy#delete-account.
const SECTION_COUNT = 17;
// 15 (kontakty v SOS) je od 6. 11. 2026 viditeľná vždy — SOS ide do appky v obchodoch.
const SKIP: number[] = [];
const IDS = { 11: 'contact', 17: 'delete-account' };

export default function Privacy() {
  return <LegalPage kind="privacy" count={SECTION_COUNT} skip={SKIP} ids={IDS} />;
}
