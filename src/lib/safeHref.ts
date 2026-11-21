// ADRESA Z DB SMIE DO `href` / `window.open` LEN AKO http(s) (bezpečnostná previerka 21. 11. 2026).
// React `javascript:` v `href` nezastaví (len varuje) a odkaz, ktorý si člen uloží do príbehu či profilu,
// by po kliknutí iného člena bežal v JEHO prihlásení. Čokoľvek iné než http(s) = prázdny reťazec.
export function safeHref(u: string | null | undefined): string {
  if (!u) return '';
  try {
    const url = new URL(u, window.location.origin);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch {
    return '';
  }
}
