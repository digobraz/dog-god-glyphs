import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { PACK_R, BRAND_GOLD_BTN } from '@/components/pack/packTheme';
import { HandArrowLeft } from '@/components/pack/HandIcons';

// ════════════════════════════════════════════════════════════════════════════
// VODOROVNÝ RAD SO ŠÍPKAMI — SPOLOČNÝ PRVOK VSTUPU (25. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// 🔑 PRESUNUTÉ, NIE NAPÍSANÉ ZNOVA. Komponent aj šat vznikli 24. 9. 2026 vnútri
//    `PatronScreen.tsx` (kategórie a siluety patrónov). Keď o deň neskôr dostala
//    ten istý rad aj POVAHA (`CharacterScreen.tsx`), boli dve cesty: opísať ho,
//    alebo ho vybrať sem. Opísaný rad by mal dve merania, dve šípky a dva
//    materiály — presne ten rozchod, ktorý si v tomto projekte vyžiadal
//    `PACK_BOX` aj `goldFrameCSS`.
// ⚠️ TRIEDY SA PREMENOVALI `pt-*` → `hf-*`, lebo prvok už nepatrí jednej
//    obrazovke. Geometria radu (šírka dlaždice, rozstup) ostáva v obrazovke —
//    tá je vec obsahu, nie ovládača.
// ════════════════════════════════════════════════════════════════════════════

/**
 * Rad, ktorý sa nezmestí. Šípky sú tu preto, že **myš vodorovný rad neodroluje**
 * — koliesko ide zvislo a na trackpade to vie len časť ľudí. Zjavia sa len na tej
 * strane, kde obsah naozaj pokračuje, takže zároveň hovoria „je tam ešte niečo".
 *
 * ⚠️ Šípka je brandová KRESBA (`HandArrowLeft`), pravá je tá istá otočená o 180°.
 *    Znaky `‹ ›` ani lucide `Chevron*` sem nesmú — stráž `check:ikony` ich počíta
 *    ako ikonku mimo brandu a základňa smie len klesať.
 * ⚠️ Meranie je udalostné (`scroll` + `ResizeObserver`) a navyše sa opakuje pri
 *    zmene `measureKey`: prepnutie kategórie zmení `scrollWidth`, ale nie rozmer
 *    samotného radu, takže `ResizeObserver` by o tom nevedel.
 */
export function Scroller({
  children, rowClass, measureKey, centerSel,
}: {
  children: React.ReactNode;
  rowClass: string;
  measureKey: string;
  /** CSS selektor prvku, ktorý sa má vycentrovať (vybraná kategória / silueta). */
  centerSel: string;
}) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      setCanL(el.scrollLeft > 2);
      setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    };
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', measure); ro.disconnect(); };
  }, []);

  // Vybraný prvok na stred — inak po predvyplnení plemenom sedí silueta mimo
  // záberu a vyzerá to, že sa nevybralo nič.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      setCanL(el.scrollLeft > 2);
      setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
      const on = el.querySelector<HTMLElement>(centerSel);
      if (!on) return;
      const target = on.offsetLeft - el.clientWidth / 2 + on.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(id);
  }, [measureKey, centerSel]);

  const by = (d: number) => ref.current?.scrollBy({ left: d, behavior: 'smooth' });

  return (
    <div className="hf-scroll">
      {canL && (
        <button type="button" className="hf-snav l" aria-label={t('whatNext.prev')} onClick={() => by(-190)}>
          <HandArrowLeft size={14} solid />
        </button>
      )}
      {canR && (
        <button type="button" className="hf-snav r" aria-label={t('whatNext.next')} onClick={() => by(190)}>
          <HandArrowLeft size={14} solid style={{ transform: 'rotate(180deg)' }} />
        </button>
      )}
      <div ref={ref} className={`hf-srow ${rowClass}`}>{children}</div>
    </div>
  );
}

/**
 * Šat radu. Vkladá ho obrazovka, ktorá `Scroller` používa — rovnako ako
 * `FLOW_CARVE_CSS`, aby si ho mohla vziať aj obrazovka mimo bledého šatu.
 */
export const FLOW_SCROLL_CSS = `
/* ── VODOROVNÉ RADY ───────────────────────────────────────────────────────
   Rad roluje, šípky visia nad ním. Vodorovná lišta rolovania je skrytá zámerne:
   na papyrusovej doske je to šedý pás cez celú šírku a rad pod ním prestane byť
   rad — „pokračuje to" hovoria šípky. */
.hf-scroll { position: relative; width: 100%; }
.hf-srow {
  display: flex; align-items: center; gap: 8px; width: 100%;
  overflow-x: auto; scrollbar-width: none;
  /* Miesto na tieň dlaždice, lem výberu a na jej stlačenie pri ťuknutí.
     3 px nestačilo — POVAHE sa orezal lem vybranej dlaždice (Matej 26. 9.). */
  padding: 6px 4px; margin: -6px -4px;
}
.hf-srow::-webkit-scrollbar { display: none; }
/* 🟨 ŠÍPKA JE PLNÁ BRANDOVÁ ZLATÁ (Matej 24. 9.: *„šípky sú moc na kraji a možno by
   som ich dal zlaté alebo inej farby, lebo splývajú"*). Papyrusová šípka na
   papyrusovej doske je papyrus na papyruse — presne to splývanie.
   🔑 A je to POLOHA V LOCKU, nie výnimka: brand lock hovorí *„ZLATO = konštrukcia
      a poloha"* (rám, nav, aktívna pilulka) a *„LAPIS = moja voľba a akcia"*.
      Posun radu je nábytok — nič si ním nevyberám, len sa presúvam. Zlatá je preto
      jediná správna odpoveď a zároveň odlíši šípku od všetkého, čo sa NA rade vyberá.
   ⚠️ Recept sa neopisuje: \`BRAND_GOLD_BTN\` (rampa #C99A3F→#A3782B, rám #8C6014,
      TMAVÝ inkoust). Svetlá zlato-oranžová \`GOLD_BTN\` sem NEPATRÍ — je svetlejšia
      než papyrus a patrí AINUBISOVI. */
.hf-snav {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 2;
  width: 26px; height: 26px; border-radius: ${PACK_R.pill}px; cursor: pointer;
  display: grid; place-items: center;
  /* 🔴 ŠÍPKA JE BLEDÁ A PLNÁ, KRUH OSTÁVA ZLATÝ (Matej 24. 9. 2026: *„tie šípky daj
     bledé a kruh nechaj zlatý, najlepšie ak by si ich vyplnil bledou farbou, nie len
     obrys ako sú teraz"*). Kresba z kitu je OBRYS — plnú siluetu robí poloha
     \`solid\` na \`HandArrowLeft\`, nie iná kresba.
     ⚠️ Brand lock píše, že KRÉMOVÝ inkoust na brandovej zlatej padá pod 3:1 (jas
        zlatej ~0,36). Platí to a Matej to rozhodol s tým vedome — plná silueta je
        však oveľa čitateľnejšia než obrys a kontrast dvíha tmavá spodná hrana
        (\`drop-shadow\`), tá istá rytina „svetlo zhora", akú nesie celý vstup. */
  color: #FDF7E7;
  background: ${BRAND_GOLD_BTN.grad};
  border: 1px solid ${BRAND_GOLD_BTN.edge};
  box-shadow: ${BRAND_GOLD_BTN.glow};
}
.hf-snav:hover { background: ${BRAND_GOLD_BTN.gradHover}; box-shadow: ${BRAND_GOLD_BTN.glowHover}; }
/* Tmavá hrana pod bledou šípkou — nie ozdoba, ale to, čo ju na zlate udrží čitateľnú. */
.hf-snav svg { filter: drop-shadow(0 1px 0 rgba(72, 44, 4, 0.55)); }
/* ⚠️ −8, NIE −18 (Matej 24. 9.: *„šípky sú moc na kraji"*). Pri −18 sedeli celé vo
   výplni dosky, teda tesne pri rytej obrube, a čítali sa ako ozdoba rámu. Pri −8
   stoja NAD radom ako ovládač, ktorý k nemu patrí — presah 18 px je cena za to a
   padne vždy na okrajovú dlaždicu, ktorá je aj tak odrezaná scrollom.
   ⚠️ Fade pod šípkou by musel trafiť odtieň mramorovanej dosky — a tú žiadna plná
      farba netrafí (ten istý dôvod, prečo koliesko rokov dostalo masku namiesto
      prekryvu). */
.hf-snav.l { left: -8px; }
.hf-snav.r { right: -8px; }
/* 🔴 NA DOTYKOVOM ZARIADENÍ ŠÍPKY NIE SÚ. Existujú kvôli MYŠI (koliesko ide
   zvislo, vodorovný rad sa ňou posunúť nedá); prst rad odroluje sám a na 390 px
   by šípky sedeli na prvej a poslednej dlaždici. Že rad pokračuje, hovorí na
   telefóne polovičná dlaždica na okraji — to je jeho vlastná reč. */
@media (pointer: coarse) { .hf-snav { display: none; } }
/* Na krátkom okne ustupuje rezerva na tieň — dlaždica ostáva. */
@media (max-height: 700px) { .hf-srow { padding: 2px; margin: -2px; } }
`;
