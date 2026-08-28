import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';

/**
 * POPUP PO VYBRATÍ FOTKY — prvá obrazovka, ktorú človek na stene uvidí.
 *
 * Matej 28. 8. 2026: *„po kliknutí na cta by mal vyskočiť náš popup nie
 * systémový… zobrazí sa po načítaní fotky."*
 *
 * 🔴 PREČO AŽ PO, A NIE PRED VÝBEROM SÚBORU. Systémovému dialógu sa vyhnúť
 * nedá — výber súboru z disku otvára vždy operačný systém a prehliadač ho bez
 * gesta človeka ani neotvorí. Popup PRED ním by teda znamenal náš card, ktorý
 * otvorí ten istý systémový dialóg, teda jeden klik navyše presne na mieste,
 * kde ich odbúravame (reťaz štyroch tlačidiel stojí 313 zo 413 ľudí,
 * `plany/ladenie-konverzie.md`). Popup PO ňom nestojí ani jeden klik navyše
 * a je to prvý okamih, keď má človek čo vidieť.
 *
 * 🔴 VÝREZ SEM NEPATRÍ. Predloha, ktorú Matej poslal (21st.dev avatar-uploader),
 * je pekná práve tou vecou, ktorú nechceme — kruhový výrez so zoom posuvníkom.
 * Fotka je diera **−49 %** a výrez sme 28. 8. presunuli až za povahu, tesne pred
 * odhalenie: na vstupe je to práca, ktorú človek robí skôr, než vie, či mu to za
 * to stojí; na konci ju robí niekto, kto má za sebou pätnásť krokov a ide si po
 * odmenu. Z predlohy sa berie TVAR (modál, náhľad, potvrdenie), nie tá funkcia.
 *
 * ⚠️ VANILLA DOM ZÁMERNE. Stena je vanilla (CLAUDE.md, pravidlo 12), guľa je
 * React — rovnaký dôvod, pre ktorý je vanilla aj `dogPortal.ts`. Dve kópie tej
 * istej karty by sa rozišli pri prvej úprave.
 */

export type PhotoConfirmOptions = {
  /** Adresa náhľadu (blob alebo https). */
  photoUrl: string;
  /** Poradové číslo, ktoré človek dostane. `null` = zatiaľ ho nevieme. */
  packNumber?: number | null;
  /** Klik na hlavné CTA. Zavretie si popup spraví sám. */
  onContinue: () => void;
  /** Klik na „vybrať inú" — otvor znova výber súboru. Popup sa zavrie. */
  onPickAnother: () => void;
  /** Zavretie krížikom, Esc alebo klikom mimo. Fotka na dlaždici ostáva. */
  onClose?: () => void;
  /**
   * ⚠️ Texty sú zatiaľ ANGLICKÉ NATVRDO, rovnako ako celá dlaždica portálu
   * (`ADD PHOTO`, `you can change the photo later`, `Yours will be #72`).
   * Je to lab, kde sa znenie ešte hýbe — zaviesť kvôli nemu kľúče do 18 jazykov
   * by znamenalo prekladať text, ktorý sa o deň zmení. Keď sa usadí, ide sem
   * `t()` a texty odtiaľto zmiznú; volajúci ich už dnes vie prebiť.
   */
  copy?: Partial<PhotoConfirmCopy>;
};

export type PhotoConfirmCopy = {
  eyebrow: string;
  lead: string;
  cta: string;
  another: string;
  close: string;
};

const DEFAULT_COPY: PhotoConfirmCopy = {
  eyebrow: 'Yours will be',
  lead: 'Three minutes and your dog is on the wall.',
  cta: 'Continue',
  another: 'Choose another photo',
  close: 'Close',
};

const STYLE_ID = 'photo-confirm-css';

/**
 * ⚠️ ANIMUJE SA VÝHRADNE OPACITY A TRANSFORM — to isté pravidlo ako v portáli.
 * Pod popupom stojí stena s mriežkou fotiek (a na guli sa točí ~1000 dlaždíc);
 * animovaný `box-shadow` alebo `backdrop-filter` cez celú plochu vrátia sekanie,
 * kvôli ktorému sa portál prepisoval.
 */
const CSS = `
.pfc-back {
  position: fixed; inset: 0; z-index: 9000;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  background: rgba(10, 7, 3, 0.72);
  opacity: 0;
  transition: opacity .18s ease-out;
}
.pfc-back.is-in { opacity: 1; }

/* Papyrusový panel — úroveň 4 matrice PACK_BOX (panel/modal): panelGrad,
   1.5px zlatý rám, radius 14, panelShadow. Hodnoty sa NEOPISUJÚ, berú sa
   z tokenov (packTheme.ts) — inak sa pri prvej zmene rozídu.
   ⚠️ Bez spätných apostrofov: toto je CSS vnútri template literalu, kde by
   ktorýkoľvek z nich literal ukončil (CLAUDE.md, pasca HUB_CSS). */
.pfc-card {
  position: relative;
  width: min(360px, 100%);
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
  display: flex; flex-direction: column; align-items: center;
  gap: 14px;
  padding: 22px 22px 20px;
  background: ${T.panelGrad};
  border: 1.5px solid ${T.cardEdge};
  border-radius: 14px;
  box-shadow: ${T.panelShadow};
  transform: scale(.965);
  transition: transform .18s ease-out;
}
.pfc-back.is-in .pfc-card { transform: scale(1); }

.pfc-x {
  position: absolute; top: 8px; right: 8px;
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border: 0; background: none; cursor: pointer;
  color: ${T.inkWarm}; opacity: .6;
  border-radius: 999px;
  transition: opacity .15s ease-out;
}
.pfc-x:hover { opacity: 1; }
.pfc-x svg { width: 15px; height: 15px; }

/* Náhľad má TVAR DLAŽDICE, z ktorej vyskočil — zaoblený štvorec, nie kruh.
   Kruh by sľuboval výrez do kruhu, ktorý tu zámerne nie je. Zaoblenie 24 %
   je tá istá hodnota ako --ph-r v dogPortal.ts. */
.pfc-shot {
  width: min(58vw, 232px); aspect-ratio: 1 / 1;
  border-radius: 24%;
  overflow: hidden;
  border: 1.5px solid ${T.cardEdge};
  box-shadow: 0 6px 20px rgba(0,0,0,.28);
  background: #1a140c;
}
.pfc-shot img { width: 100%; height: 100%; object-fit: cover; display: block; }

.pfc-num { display: flex; flex-direction: column; align-items: center; gap: 1px; }
/* Eyebrow presne podľa bledého locku: Space Grotesk 500, .26em, veľké písmená,
   farba cardEdge. */
.pfc-eyebrow {
  font-family: ${FONT_UI}; font-weight: 500; font-size: 10px;
  letter-spacing: .26em; text-transform: uppercase; color: ${T.cardEdge};
}
.pfc-n {
  font-family: ${FONT_TITLE}; font-weight: 700;
  font-size: clamp(30px, 11vw, 40px); line-height: 1;
  color: ${T.inkStrong};
}
.pfc-lead {
  font-family: ${FONT_UI}; font-size: 12.5px; line-height: 1.5;
  color: ${T.inkWarm}; text-align: center; max-width: 260px;
  margin: -4px 0 0;
}

/* HLAVNÉ CTA = LAPIS, ale GEOMETRIU si berie od .btn-gold (radius 8, nie pilulka).
   Zmena farby nie je povolenie na iný tvar. Zlaté písmo na modrom nie je ozdoba —
   lapis + zlato je pôvodná egyptská dvojica. */
.pfc-go {
  width: 100%;
  padding: 12px 18px;
  border: 1px solid ${LAPIS.edge};
  border-radius: 8px;
  background: ${LAPIS.grad};
  color: ${LAPIS.ink};
  box-shadow: ${LAPIS_BTN_SHADOW};
  font-family: ${FONT_TITLE}; font-weight: 700; font-size: 14px;
  letter-spacing: .12em; text-transform: uppercase;
  cursor: pointer;
  transition: transform .12s ease-out, background .15s ease-out;
}
.pfc-go:hover { background: ${LAPIS.gradHover}; }
.pfc-go:active { transform: translateY(1px); }
.pfc-go:focus-visible { outline: 2px solid ${LAPIS.edge}; outline-offset: 2px; }

/* Druhá akcia je TICHÁ. Dve plné plochy vedľa seba znamenajú, že obrazovka
   nevedie nikam — plná farebná výplň patrí jedinému hlavnému CTA. */
.pfc-alt {
  border: 0; background: none; cursor: pointer;
  font-family: ${FONT_UI}; font-size: 11.5px; color: ${T.inkWarm};
  text-decoration: underline; text-underline-offset: 3px;
  opacity: .8; margin-top: -4px;
}
.pfc-alt:hover { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .pfc-back, .pfc-card { transition: none; }
  .pfc-card { transform: none; }
}
`;

function ensureCss() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = CSS;
  document.head.appendChild(s);
}

const X_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" '
  + 'stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

export type PhotoConfirmHandle = { close: () => void };

/** Otvor kartu potvrdenia. Vracia rúčku, ktorou sa dá zavrieť zvonku. */
export function openPhotoConfirm(opts: PhotoConfirmOptions): PhotoConfirmHandle {
  ensureCss();
  const copy = { ...DEFAULT_COPY, ...(opts.copy || {}) };

  const back = document.createElement('div');
  back.className = 'pfc-back';
  back.setAttribute('role', 'dialog');
  back.setAttribute('aria-modal', 'true');

  const card = document.createElement('div');
  card.className = 'pfc-card';

  const num = opts.packNumber != null
    ? `<span class="pfc-num">
         <span class="pfc-eyebrow">${copy.eyebrow}</span>
         <span class="pfc-n">#${opts.packNumber}</span>
       </span>`
    : '';

  card.innerHTML = `
    <button type="button" class="pfc-x" aria-label="${copy.close}">${X_SVG}</button>
    <span class="pfc-shot"><img src="${opts.photoUrl}" alt=""></span>
    ${num}
    <p class="pfc-lead">${copy.lead}</p>
    <button type="button" class="pfc-go">${copy.cta}</button>
    <button type="button" class="pfc-alt">${copy.another}</button>
  `;
  back.appendChild(card);

  let closed = false;
  const close = (fire = true) => {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey);
    back.classList.remove('is-in');
    // Karta sa odstraňuje až po dobehnutí prechodu — inak zmizne skokom.
    // `transitionend` sám nestačí: pri `prefers-reduced-motion` prechod nie je
    // a udalosť by neprišla, takže by popup ostal v DOM-e navždy.
    window.setTimeout(() => back.remove(), 200);
    if (fire) opts.onClose?.();
  };
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };

  back.addEventListener('click', (e) => { if (e.target === back) close(); });
  card.querySelector<HTMLButtonElement>('.pfc-x')?.addEventListener('click', () => close());
  card.querySelector<HTMLButtonElement>('.pfc-alt')?.addEventListener('click', () => {
    close(false);
    opts.onPickAnother();
  });
  const go = card.querySelector<HTMLButtonElement>('.pfc-go');
  go?.addEventListener('click', () => {
    close(false);
    opts.onContinue();
  });
  document.addEventListener('keydown', onKey);

  document.body.appendChild(back);
  // Dva snímky, nie jeden: prvý pripne prvok, druhý až spustí prechod. Pri
  // jednom `requestAnimationFrame` prehliadač obe triedy stihne v tom istom
  // výpočte štýlu a karta naskočí bez animácie.
  requestAnimationFrame(() => requestAnimationFrame(() => back.classList.add('is-in')));
  go?.focus({ preventScroll: true });

  return { close: () => close() };
}
