// DLHÉ PODRŽANIE (Matej 9. 11. 2026): obrázok ani ikonka sa nesmie skopírovať ani otvoriť, kopírovať sa dá len text.
// Len pod `APP_NEW`, volá sa zo `zapniPapyrus3d`. iPhone rieši `-webkit-touch-callout`, Android a myš udalosť `contextmenu`.
const CIEL = 'img,svg,video,canvas,picture,a,button,[role="button"]';
const PISANIE = 'input,textarea,select,[contenteditable="true"]';

export const BEZ_KOPIROVANIA_CSS = `
html.papyrus3d :is(img,svg,video,canvas,picture){-webkit-touch-callout:none;-webkit-user-drag:none;-webkit-user-select:none;user-select:none;}
html.papyrus3d :is(a,button,[role="button"],label,nav){-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;}
html.papyrus3d :is(input,textarea,[contenteditable="true"]){-webkit-touch-callout:default;-webkit-user-select:text;user-select:text;}
`;

export function zapniBezKopirovania() {
  document.addEventListener('contextmenu', (e) => {
    const el = e.target as Element | null;
    if (el?.closest?.(CIEL) && !el.closest(PISANIE)) e.preventDefault();
  }, true);
  document.addEventListener('dragstart', (e) => {
    if ((e.target as Element | null)?.closest?.('img,a')) e.preventDefault();
  }, true);
}
