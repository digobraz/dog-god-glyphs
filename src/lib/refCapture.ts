// ─────────────────────────────────────────────────────────────────────────
// Affiliate referral capture. A visitor arriving via dogypt.com/?ref=<code>
// gets the code stored locally (FIRST-TOUCH: the first link that brought them
// wins). It's read again at checkout (PaymentScreen) and sent to create-checkout
// so the referrer earns BONES when the purchase completes.
//
// DOGPAGE CANON (Matej 12.8.2026): náborovým nástrojom je STRÁNKA PSA, nie holý
// affiliate odkaz — každý člen má psa, a stránka s fotkou a menom presvedčí viac
// než kód. Uložená hodnota má preto DVA tvary a oba sú v poriadku:
//   · `MENO-XXXX` — affiliate kód (z `?ref=` na hociktorej stránke)
//   · `123`       — PACK ČÍSLO psa (návšteva jeho stránky zvonku); backend si ho
//                   preloží na majiteľov affiliate účet (`resolve_ref_code`).
// Pamäť je ZÁMERNE bez expirácie a first-touch — Matej: „navždy… to je pointa".
// Kto priviedol človeka prvý, drží si ho; kto neprivedie nikoho, nič nestráca,
// nákup pripadne DOGYPTU (organika → founder).
//
// ⚠️ PACK ČÍSLO sa uloží LEN cez CTA na stránke psa, nikdy nie samotnou návštevou
// ani z `?ref=` v URL — dôvod je rozpísaný pri `captureDogPageRef` nižšie.
// ─────────────────────────────────────────────────────────────────────────

const REF_KEY = 'dogypt_ref';

/** Store a ?ref=<code> on first touch only (never overwrite an earlier one).
 *
 *  ⚠️ ČISTO NUMERICKÝ `?ref` sa tu ZÁMERNE IGNORUJE. Je to pack číslo psa zo
 *  zdieľaného odkazu (`dogShareLink`) a od 12.8.2026 platí prísne pravidlo: samotné
 *  otvorenie psej stránky NIE JE nábor, lebo ľudia tam chodia čítať odkaz majiteľa.
 *  Pack číslo zapíše až vedomý klik na CTA (`DogShare.tsx` → `captureDogPageRef`).
 *  Affiliate kódy (`MENO-XXXX`) sa ukladajú ďalej hneď pri príchode — tie sú
 *  adresná pozvánka konkrétneho človeka, nie vedľajší produkt čítania. */
export function captureRefFromSearch(search: string): void {
  try {
    const code = new URLSearchParams(search).get('ref');
    if (!code) return;
    const clean = code.trim().slice(0, 40);
    if (!clean) return;
    if (/^[0-9]+$/.test(clean)) return;        // pack číslo → len cez CTA
    if (localStorage.getItem(REF_KEY)) return; // first-touch wins
    localStorage.setItem(REF_KEY, clean);
  } catch {
    /* private mode / no storage — ignore */
  }
}

/** Zapíše majiteľa psa ako odporúčateľa. Volá sa VÝHRADNE z CTA „Pridaj sa" na
 *  stránke psa — nikdy nie pri načítaní stránky.
 *
 *  ⚠️ HISTÓRIA, aby sa to nevrátilo (Matej 12.8.2026):
 *  1. Pôvodne stačila akákoľvek návšteva `/dog/:slug` → aj klikanie po WALLe
 *     vyrábalo odporúčateľov a prvý náhodne otvorený pes si návštevníka
 *     privlastnil natrvalo (pamäť je bez expirácie).
 *  2. Prvá oprava to zúžila na „príchod zvonku". Padla na tom, že *„ľudia si len
 *     čítajú odkazy majiteľov"* — správa majiteľa je OBSAH, na ktorý sa chodí zo
 *     zvedavosti; kto ju príde prečítať z Facebooku, nebol naverbovaný.
 *  3. Teraz platí prísne pravidlo: kredit vzniká iba vedomým krokom do flow.
 *     Kto ho neurobí, nepatrí nikomu — nákup pripadne DOGYPTU (organika → founder).
 *
 *  Ukladá sa PACK ČÍSLO; backend (`resolve_ref_code`) si ho preloží na affiliate
 *  účet majiteľa. First-touch platí aj tu: skorší odporúčateľ sa neprepisuje. */
export function captureDogPageRef(pack: number): void {
  try {
    if (!Number.isFinite(pack) || pack <= 0) return;
    if (localStorage.getItem(REF_KEY)) return; // first-touch wins
    localStorage.setItem(REF_KEY, String(pack));
  } catch {
    /* private mode / no storage — ignore */
  }
}

/** Read the stored referral code (or null) — used by the checkout payload. */
export function getStoredRef(): string | null {
  try {
    const v = localStorage.getItem(REF_KEY);
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}
