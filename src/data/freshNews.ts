// ── FRESH NEWS — NAŠE OZNAMY V BEŽIACOM PÁSE PANELA CHVOSTA (21. 10. 2026) ──────────
// Matej: „pilulky… neustále rotovať v loope ako pri hlavných správach… fresh news, kde aj my
// môžeme dať oznamy… na čom sa práve pracuje / novinky… klik bude viesť na príspevok na feed
// … DOGYPT konto hlavné, aby som tam nevystupoval s mojím menom… môže to byť AINUBIS konto".
//
// Dnes je to zoznam v kóde, lebo feed ešte neexistuje. Keď vznikne, oznam = príspevok
// AINUBIS konta a pás si ich bude brať odtiaľ (`href` = odkaz na príspevok).
// 🔴 Oznam píše/schvaľuje Matej — nevymýšľa sa. Prázdny zoznam = pás nesie len štatistiky.
// `until` = posledný deň, kedy sa oznam ukazuje (YYYY-MM-DD), potom zmizne sám.

export type FreshNews = {
  id: string;
  text: { en: string; sk?: string; cs?: string };
  href?: string;
  until?: string;
};

export const FRESH_NEWS: FreshNews[] = [];
