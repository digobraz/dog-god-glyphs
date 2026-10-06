/**
 * VÝZVA „TVÁR TVOJHO PSA" — spoločný vstup do heroflowu s fotkou (6. 10. 2026).
 *
 * Matej 6. 10. 2026 (nákres `plany/nakres-vstup-s-fotkou-2026-10-06`, poloha A):
 * jeden krátky popup nad stmaveným oknom. PRIDAŤ FOTKU → výber → karta
 * `openPhotoConfirm` → `/heroglyph/name`; „Pokračovať bez fotky" → `/heroglyph/name`.
 *
 * Komponent `PhotoInvite` visí raz v `App.tsx` a počúva udalosť `OPEN_PHOTO_INVITE`.
 * Volá ho (1) WE NEED YOU / JOIN US cez `startHeroflow()` a (2) portály fotky
 * (guľa, WALL), ale LEN keď človek výber súboru zruší bez fotky.
 */

export const OPEN_PHOTO_INVITE = 'dogypt:photo-invite';

export function openPhotoInvite(detail: { packNumber?: number | null } = {}): void {
  window.dispatchEvent(new CustomEvent(OPEN_PHOTO_INVITE, { detail }));
}

/** Po zrušení výberu sa výzva ukáže len RAZ za načítanie stránky — nie pri každom kliku. */
let shownAfterCancel = false;

/**
 * Otvor výber súboru a ak človek odíde bez fotky, zavolaj `onCancel`.
 *
 * Zrušenie sa chytá dvoma spôsobmi, lebo ho nepozná každý prehliadač:
 *  1. `cancel` udalosť na inpute (Chrome 113+, Safari 16.4+, Firefox 91+),
 *  2. návrat fokusu na okno a po chvíli stále žiadny súbor (staršie prehliadače).
 * `change` s vybraným súborom zruší oba — po úspešnom výbere výzva nevyskočí.
 */
export function pickFileWithCancel(input: HTMLInputElement, onCancel: () => void): void {
  input.value = '';
  let done = false;
  let timer = 0;
  const cleanup = () => {
    done = true;
    window.clearTimeout(timer);
    input.removeEventListener('change', onChange);
    input.removeEventListener('cancel', onCancelEv);
    window.removeEventListener('focus', onFocus);
  };
  const cancelled = () => { if (done) return; cleanup(); onCancel(); };
  const onChange = () => { if (input.files?.length) cleanup(); };
  const onCancelEv = () => { if (!input.files?.length) cancelled(); };
  const onFocus = () => {
    window.clearTimeout(timer);
    // `change` prichádza po fokuse — dáme mu čas, inak by výber ohlásil ako zrušený.
    timer = window.setTimeout(() => { if (!done && !input.files?.length) cancelled(); }, 1000);
  };
  input.addEventListener('change', onChange);
  input.addEventListener('cancel', onCancelEv);
  window.addEventListener('focus', onFocus);
  input.click();
}

/** Zrušenie výberu na PORTÁLI: ukáže výzvu, ale iba prvýkrát. */
export function inviteAfterCancel(packNumber?: number | null): void {
  if (shownAfterCancel) return;
  shownAfterCancel = true;
  openPhotoInvite({ packNumber });
}
