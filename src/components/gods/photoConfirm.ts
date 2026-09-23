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
 * 🔴 VÝREZ JE TU — A JE TO OBRAT Z 23. 9. 2026. Do toho dňa tu stálo, že výrez
 * sem nepatrí (fotka je diera −49 %, výrez je práca navyše presne tam, kde ich
 * odbúravame) a robil sa až za povahou, tesne pred odhalením. Matej to otočil:
 * *„čo ak človek pošle fotku na šírku a nebude ju vedieť posunúť? a odide
 * radšej nach… tu tú možnosť má"* · *„a nie vyrez po zaplateni je blbosť"*.
 *
 * ⚠️ PADLA LEN POVINNOSŤ, NIE DÔVOD. Výrez je **ponuka**: kto naň nesiahne,
 * dostane automatický (Cloudinary `g_auto`, ktorý pozná psa — dnešné `c_fill`
 * je BEZ gravitácie, teda holý stred). Preto je posuvník pod fotkou tichý a
 * karta nepýta ani jeden klik navyše.
 *
 * 🔴 ŤAHAŤ SA MUSÍ DAŤ AJ PRI 1× PRIBLÍŽENÍ. Stará mechanika (`photoCrop.tsx`,
 * `CropArea`) drží posun v medziach `(zoom−1)×50`, takže pri 1× je fotka
 * primrznutá — a to je PRESNE ten prípad, ktorého sa Matej pýtal: ležatá fotka
 * vsadená do štvorca má presah po stranách, ale posunúť sa nedá. Príčina je
 * v modeli: tam sa hýbe PRVKOM s `object-fit: cover`, takže časti obrazu mimo
 * štvorca sú nedostupné za akéhokoľvek zoomu. Tu sa hýbe OBRAZOM v jeho
 * prirodzenom pomere a medza sa ráta z jeho skutočných rozmerov.
 *
 * ⚠️ VANILLA DOM ZÁMERNE. Stena je vanilla (CLAUDE.md, pravidlo 12), guľa je
 * React — rovnaký dôvod, pre ktorý je vanilla aj `dogPortal.ts`. Dve kópie tej
 * istej karty by sa rozišli pri prvej úprave.
 */

/** Štvorcový výrez v pixeloch pôvodného obrázka. */
export type PhotoCropRect = { sx: number; sy: number; size: number };

export type PhotoConfirmOptions = {
  /** Adresa náhľadu (blob alebo https). */
  photoUrl: string;
  /** Poradové číslo, ktoré človek dostane. `null` = zatiaľ ho nevieme. */
  packNumber?: number | null;
  /**
   * Klik na hlavné CTA. Zavretie si popup spraví sám.
   *
   * `crop` je `null`, keď sa človek fotky NEDOTKOL — vtedy platí automatický
   * výrez a volajúci nemá čo orezávať. Inak je to obdĺžnik v pixeloch
   * PÔVODNÉHO obrázka, pripravený pre `cropToSquare` aj pre Cloudinary
   * `c_crop`.
   */
  onContinue: (crop: PhotoCropRect | null) => void;
  /** Klik na „vybrať inú" — otvor znova výber súboru. Popup sa zavrie. */
  onPickAnother: () => void;
  /**
   * Odchod z karty: Esc alebo klik mimo. Fotka na dlaždici ostáva.
   *
   * ⚠️ KRÍŽIK KARTA NEMÁ (Matej 28. 8. 2026: *„nedávajme tie krížiky na bloky"*).
   * Von sa ide klikom mimo alebo Esc — na mobile klikom mimo, tam Esc nie je.
   *
   * 🚩 SEM PRÍDE ODCHODOVÝ POPUP (Matej 28. 8., znenie sa vymyslí neskôr):
   * *„pri kliknutí vedľa stránka pošle popup ako posielajú eshopy pri odchode…
   * niečo v zmysle «chápem že máš toho veľa, ale nechcem aby si zabudol, skús to
   * keď budeš mať viac času, zanechaj nám email :)»"*.
   * Je to druhá záchranná sieť k tomu, čo už funguje: e-mail sa dnes pýtame až
   * na treťom kroku flow (/heroglyph/email), takže kto odíde TU, nezanechá nič —
   * a fotku už pritom dal. Ku dnešku sa preto len meria, koľkí odchádzajú
   * (`*_photo_confirm_dismissed`), aby sa vedelo, či sa to oplatí stavať.
   */
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
  /** Poznámka pod CTA. O platbe tu ani slovo (Matej 23. 9. 2026). */
  later: string;
  /** Popis posuvníka pre čítačku — na obrazovke nie je, výrez je tichá ponuka. */
  zoom: string;
};

const DEFAULT_COPY: PhotoConfirmCopy = {
  eyebrow: 'Yours will be',
  lead: 'Three minutes and your dog is on the wall.',
  cta: 'Continue',
  another: 'Choose another photo',
  later: 'You can change the photo later.',
  zoom: 'Zoom',
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

/* Náhľad má TVAR DLAŽDICE, z ktorej vyskočil — zaoblený štvorec, nie kruh.
   Kruh by sľuboval výrez do kruhu, ktorý tu zámerne nie je. Zaoblenie 24 %
   je tá istá hodnota ako --ph-r v dogPortal.ts. */
.pfc-shot {
  position: relative;
  width: min(58vw, 232px); aspect-ratio: 1 / 1;
  border-radius: 24%;
  overflow: hidden;
  touch-action: none;
  border: 1.5px solid ${T.cardEdge};
  box-shadow: 0 6px 20px rgba(0,0,0,.28);
  background: #1a140c;
}
/* Obraz sa hýbe v SVOJOM pomere strán, nie ako štvorcový prvok s cover —
   len tak sa dá pri 1× dostať k ľavému okraju ležatej fotky. Kratšia strana
   sedí na ráme (to je cover pri 1×), dlhšia presahuje a presah sa dá ťahať. */
.pfc-shot img {
  position: absolute; left: 50%; top: 50%;
  transform-origin: center;
  display: block; max-width: none;
  user-select: none; -webkit-user-drag: none;
  cursor: grab;
}
.pfc-shot.is-drag img { cursor: grabbing; }
.pfc-shot::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.08);
}

/* Posuvník je TICHÝ — výrez je ponuka, nie úkon. Preto žiadny nadpis nad ním
   a farba len na úchyte, ktorý je „moja voľba" (lapis). */
.pfc-zoom {
  width: min(58vw, 232px);
  display: flex; align-items: center; gap: 8px;
  margin-top: -4px;
}
.pfc-zoom input {
  flex: 1; height: 3px; -webkit-appearance: none; appearance: none;
  background: ${T.cardEdge}; border-radius: 999px; outline: none; cursor: pointer;
}
.pfc-zoom input::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 16px; height: 16px; border-radius: 50%;
  background: ${LAPIS.grad}; border: 1px solid ${LAPIS.edge};
  box-shadow: 0 1px 4px rgba(0,0,0,.35); cursor: pointer;
}
.pfc-zoom input::-moz-range-thumb {
  width: 16px; height: 16px; border-radius: 50%;
  background: ${LAPIS.edge}; border: 1px solid ${LAPIS.edge}; cursor: pointer;
}
.pfc-zoom i {
  font-style: normal; font-family: ${FONT_UI}; font-size: 11px;
  color: ${T.inkWarm}; opacity: .7; flex: none;
}

/* Poznámka pod CTA (Matej 23. 9.): o platbe tu ani slovo. */
.pfc-later {
  font-family: ${FONT_UI}; font-size: 11px; color: ${T.inkWarm};
  opacity: .75; margin: -6px 0 0; text-align: center;
}

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

/**
 * ŤAHANIE A PRIBLÍŽENIE NAD FOTKOU.
 *
 * Model: obraz má SVOJ pomer strán, kratšia strana sedí na ráme (pri 1× je to
 * presne `cover`), stred obrazu je v strede rámu a posun je v pixeloch rámu.
 * Medza posunu sa ráta zo skutočného presahu, takže ležatú fotku možno ťahať
 * aj pri 1× — to je celý dôvod, prečo sa tu nepoužíva `CropArea`.
 *
 * Vracia `result()`: štvorec v pixeloch pôvodného obrázka, alebo `null`, keď sa
 * človek fotky nedotkol (vtedy platí automatický výrez).
 */
function mountCrop(shot: HTMLElement, range: HTMLInputElement) {
  const img = shot.querySelector('img')!;
  let zoom = 1;
  let x = 0;
  let y = 0;
  let touched = false;
  /** Strana rámu v CSS pixeloch a rozmery obrazu pri zoome 1. */
  let frame = 0;
  let baseW = 0;
  let baseH = 0;

  const measure = () => {
    frame = shot.getBoundingClientRect().width;
    const nw = img.naturalWidth || 1;
    const nh = img.naturalHeight || 1;
    // Kratšia strana na rám: to je `cover` bez toho, aby sa orezal PRVOK.
    const k = Math.max(frame / nw, frame / nh);
    baseW = nw * k;
    baseH = nh * k;
    img.style.width = `${baseW}px`;
    img.style.height = `${baseH}px`;
    apply();
  };

  /** Posun sa nesmie odlepiť od okraja — medza je skutočný presah, nie vzorec. */
  const limit = () => ({
    mx: Math.max(0, (baseW * zoom - frame) / 2),
    my: Math.max(0, (baseH * zoom - frame) / 2),
  });

  const apply = () => {
    const { mx, my } = limit();
    x = Math.min(mx, Math.max(-mx, x));
    y = Math.min(my, Math.max(-my, y));
    img.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${zoom})`;
  };

  if (img.complete && img.naturalWidth) measure();
  img.addEventListener('load', measure);
  // Rám je v `min(58vw, 232px)` — pri otočení telefónu sa jeho šírka mení a
  // s ňou aj medze posunu. Bez premerania by fotka zostala odlepená od okraja.
  const ro = new ResizeObserver(measure);
  ro.observe(shot);

  let id: number | null = null;
  let sx = 0;
  let sy = 0;
  shot.addEventListener('pointerdown', (e) => {
    id = e.pointerId;
    sx = e.clientX - x;
    sy = e.clientY - y;
    shot.classList.add('is-drag');
    shot.setPointerCapture(e.pointerId);
  });
  shot.addEventListener('pointermove', (e) => {
    if (id !== e.pointerId) return;
    x = e.clientX - sx;
    y = e.clientY - sy;
    // Za dotyk sa ráta až POHYB. Samotný klik do fotky nesmie zrušiť
    // automatický výrez — inak by ho vypol aj ten, kto len mieril na CTA.
    touched = true;
    apply();
  });
  const end = (e: PointerEvent) => {
    if (id !== e.pointerId) return;
    id = null;
    shot.classList.remove('is-drag');
  };
  shot.addEventListener('pointerup', end);
  shot.addEventListener('pointercancel', end);

  range.addEventListener('input', () => {
    zoom = Number(range.value) / 100;
    touched = true;
    apply();
  });

  return {
    destroy: () => ro.disconnect(),
    result: (): PhotoCropRect | null => {
      if (!touched) return null;
      const nw = img.naturalWidth || 1;
      const nh = img.naturalHeight || 1;
      // Späť z CSS pixelov na pixely originálu. Mierka je pre obe osi rovnaká
      // (obraz sa neskresľuje), takže stačí jedno číslo.
      const px = 1 / ((baseW / nw) * zoom);
      const size = frame * px;
      return {
        sx: Math.max(0, Math.min(nw - size, (nw - size) / 2 - x * px)),
        sy: Math.max(0, Math.min(nh - size, (nh - size) / 2 - y * px)),
        size: Math.max(1, Math.min(size, Math.min(nw, nh))),
      };
    },
  };
}

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
    <span class="pfc-shot"><img src="${opts.photoUrl}" alt=""></span>
    <span class="pfc-zoom"><i>−</i><input type="range" min="100" max="300" value="100" aria-label="${copy.zoom}"><i>+</i></span>
    ${num}
    <p class="pfc-lead">${copy.lead}</p>
    <button type="button" class="pfc-go">${copy.cta}</button>
    <p class="pfc-later">${copy.later}</p>
    <button type="button" class="pfc-alt">${copy.another}</button>
  `;
  back.appendChild(card);

  const crop = mountCrop(
    card.querySelector<HTMLElement>('.pfc-shot')!,
    card.querySelector<HTMLInputElement>('.pfc-zoom input')!,
  );

  let closed = false;
  const close = (fire = true) => {
    if (closed) return;
    closed = true;
    crop.destroy();
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
  card.querySelector<HTMLButtonElement>('.pfc-alt')?.addEventListener('click', () => {
    close(false);
    opts.onPickAnother();
  });
  const go = card.querySelector<HTMLButtonElement>('.pfc-go');
  go?.addEventListener('click', () => {
    close(false);
    // Kto sa fotky nedotkol, dostane automatický výrez — volajúcemu to povie
    // `null`, nie obdĺžnik celého obrázka. Rozdiel je podstatný: `g_auto`
    // nájde psa, stredový výrez ho pri ležatej fotke odreže.
    opts.onContinue(crop.result());
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
