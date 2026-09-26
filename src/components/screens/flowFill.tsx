import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PAGE_AIR } from '@/components/pack/packTheme';

// ════════════════════════════════════════════════════════════════════════════
// HRANICA — koľko z obrazovky obsah naozaj zaberá (25. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 25. 9. 2026: *„máme veľké rezervy na priestor… mali by sme mať každú
// obrazovku cca rovnako vyplnenú, tak kde je málo pridať a tam kde je veľa si
// dávať pozor… do nákresu/labu by sme mohli mať aj tento údaj na obrazovkách
// HRANICA max hore dole a jednotlivé stránky, aby sme to vedeli namodelovať
// a stránky boli podobné."*
//
// 🔑 ČO SA MERIA. `PAGE_AIR` (lock 24. 9.) hovorí, koľko vzduchu má byť od
//    okraja — ale NIKTO nemeral, koľko z miesta MEDZI tými okrajmi obsah
//    zaberie. Práve to je „rovnako vyplnená obrazovka":
//
//        MIESTO  = výška javiska − vzduch hore − vzduch dole   (to je HRANICA)
//        VÝPLŇ % = výška obsahu / MIESTO
//
//    100 % = obsah sedí presne na hranici. Nad 100 % sa roluje (a to je na kroku
//    vstupu nález, nie vlastnosť). Pod ~70 % je obrazovka poloprázdna vedľa
//    susedov a Matej to vidí — presne to spustilo túto prácu.
//
// 🔴 MERIA SA ŽIVÝ DOM, NEOPISUJE SA ČÍSLO. Rozpočty výšky v hlavičkách
//    obrazoviek (`ESSENCE_CSS`, `PATRON_CSS`, `CHARACTER_CSS`) sú ručné súčty —
//    a ručný súčet o kóde zostarne ticho. Toto je merač; keď sa rozídu, pravdu
//    má on. → pamäť `feedback_rucny_zoznam_v_locku_zostarne_ticho`
//
// 🔒 DEV-ONLY. Visí v `App.tsx` za tou istou podmienkou ako `DevSeedBoot`.
//    Do produkčného buildu sa nedostane ani prekresliť, ani poslať správu.
// ════════════════════════════════════════════════════════════════════════════

/** Kľúč prepínača. Rám a dielňa sú dva dokumenty na tom istom origin, takže si
 *  ho podávajú cez `localStorage` — rovnako ako cookie lištu v ráme. */
export const HRANICA_KEY = 'dogypt-hranica';
/** Meno správy do rodičovského okna (dielňa). */
export const FILL_MSG = 'dogypt-flow-fill';

export type FlowFill = {
  path: string;
  /** Výška javiska (`.hf-stage`) — teda okno mínus horná lišta. */
  javisko: number;
  /** Vzduch od okraja, ako ho práve drží `PAGE_AIR`. */
  vzduch: number;
  /** Miesto medzi hranicami = javisko − 2× vzduch. */
  miesto: number;
  /** Výška všetkého, čo na javisku stojí. */
  obsah: number;
  /** obsah / miesto v percentách. */
  vyplnPct: number;
  /** O koľko px sa roluje (0 = zmestí sa). */
  pretecie: number;
  sirka: number;
};

/** Zmeria javisko kroku. `null`, keď na stránke žiadne nie je (mimo vstupu). */
function measure(path: string): FlowFill | null {
  const st = document.querySelector<HTMLElement>('.hf-stage');
  if (!st) return null;
  const cs = getComputedStyle(st);
  const air = parseFloat(cs.paddingTop) || 0;
  const miesto = Math.round(st.clientHeight - air - (parseFloat(cs.paddingBottom) || 0));
  // Súčet detí, nie `scrollHeight`: ten je orezaný výškou javiska, keď sa obsah
  // zmestí, takže by výplň nikdy neklesla pod 100 %.
  const obsah = Math.round([...st.children]
    .reduce((a, el) => a + el.getBoundingClientRect().height, 0));
  return {
    path,
    javisko: st.clientHeight,
    vzduch: air,
    miesto,
    obsah,
    vyplnPct: miesto > 0 ? Math.round((obsah / miesto) * 100) : 0,
    pretecie: Math.max(0, st.scrollHeight - st.clientHeight),
    sirka: window.innerWidth,
  };
}

/**
 * Merač. Renderuje sa vždy (kvôli správam do dielne), kreslí len keď je HRANICA
 * zapnutá. Meria po každom prekreslení rozmerov — `ResizeObserver` na javisku
 * aj na jeho prvom dieťati, lebo obsah rastie zvnútra (voľba pribudne, popis sa
 * zalomí) a rozmer javiska sa pritom nemení.
 */
export function FlowFillProbe() {
  const { pathname } = useLocation();
  const [fill, setFill] = useState<FlowFill | null>(null);
  const [on, setOn] = useState(() => {
    try { return localStorage.getItem(HRANICA_KEY) === '1'; } catch { return false; }
  });

  // Prepínač je v dielni, kreslí sa v ráme — `storage` udalosť chodí medzi
  // dokumentmi toho istého origin, takže rám nemusí nič pollovať.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === HRANICA_KEY) setOn(e.newValue === '1');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    // Mimo dielne a s vypnutou HRANICOU nemá kto výsledok čítať — meranie by
    // len vynucovalo reflow pri každej zmene javiska (26. 9. 2026).
    if (!on && window.parent === window) return;
    // 🔴 ČASOVAČ, NIE `requestAnimationFrame`. Dielňa meria kroky v SKRYTOM ráme
    //    (mimo záberu) a prehliadač v takom ráme rAF netiká — premerané 25. 9.:
    //    z šiestich krokov sa ozval JEDEN, zvyšok vypadol na časový limit fronty
    //    a tabuľka ostala prázdna. Merač, ktorý sa nedá spustiť mimo obrazovky,
    //    je na hromadné meranie nepoužiteľný.
    let t: ReturnType<typeof setTimeout> | undefined;
    const send = () => {
      const m = measure(pathname);
      setFill(m);
      // Dielňa počúva aj vtedy, keď HRANICA nie je zapnutá — tabuľka výplne
      // meria všetky kroky naraz a kresliť pri tom netreba.
      if (m && window.parent !== window) window.parent.postMessage({ type: FILL_MSG, fill: m }, '*');
    };
    const read = () => {
      clearTimeout(t);
      t = setTimeout(send, 0);
    };
    read();
    // Druhé meranie po dokreslení: písmo a obrázky dobehnú neskôr a obsah po
    // nich narastie. Bez neho hlási krok s fotkou menej, než naozaj zaberá.
    const late = setTimeout(send, 450);
    const st = document.querySelector<HTMLElement>('.hf-stage');
    const ro = new ResizeObserver(read);
    if (st) {
      ro.observe(st);
      if (st.firstElementChild) ro.observe(st.firstElementChild);
    }
    window.addEventListener('resize', read);
    // Obsah sa mení aj bez zmeny rozmeru javiska (iná otázka, iný popis).
    const mo = new MutationObserver(read);
    if (st) mo.observe(st, { childList: true, subtree: true });
    return () => {
      clearTimeout(t);
      clearTimeout(late);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', read);
    };
  }, [pathname, on]);

  if (!on || !fill) return null;

  const tesne = fill.pretecie > 0;
  const prazdno = fill.vyplnPct < 78;
  const farba = tesne ? '#B25640' : prazdno ? '#B3822D' : '#3D7A4E';

  return (
    <>
      <style>{HRANICA_CSS}</style>
      {/* Dve čiary = HRANICA. Nie je to okraj prvku, je to dno vzduchu
          (`PAGE_AIR`): pod ňu obsah nesmie, nad ňu nemá dôvod nesiahnuť. */}
      <span className="hr-line" style={{ top: fill.javisko === 0 ? 0 : undefined }} aria-hidden>
        <i style={{ top: `calc(100% - ${fill.javisko - fill.vzduch}px)` }} />
        <i style={{ top: `calc(100% - ${fill.vzduch}px)` }} />
      </span>
      <span className="hr-badge" style={{ borderColor: farba, color: farba }} aria-hidden>
        <b>{fill.vyplnPct} %</b>
        <em>
          obsah {fill.obsah} / miesto {fill.miesto} · vzduch {fill.vzduch}
          {tesne ? ` · PRETEKÁ o ${fill.pretecie}` : ''}
        </em>
      </span>
    </>
  );
}

/* Vrstva nad obrazovkou — nič neblokuje (`pointer-events: none`), inak by sa
   na nej ladený krok prestal dať klikať. */
const HRANICA_CSS = `
.hr-line {
  position: fixed; left: 0; right: 0; bottom: 0; top: 0;
  z-index: 3000; pointer-events: none;
}
.hr-line i {
  position: absolute; left: 0; right: 0; height: 0;
  border-top: 1px dashed rgba(178, 86, 64, 0.75);
}
/* ⚠️ VĽAVO DOLE, nie vpravo: vpravo dole sedí chip „Dev nav" a štítok sa pod
   ním stratil (merané 25. 9. v dielni). */
.hr-badge {
  position: fixed; left: 8px; bottom: 8px; z-index: 3001; pointer-events: none;
  display: flex; flex-direction: column; gap: 1px;
  padding: 5px 9px; border-radius: 8px;
  background: rgba(255, 253, 247, 0.94); border: 1.5px solid;
  font-family: 'Space Grotesk', sans-serif; text-align: left;
  box-shadow: 0 4px 12px rgba(60, 40, 10, 0.22);
}
.hr-badge b { font-size: 14px; font-weight: 700; line-height: 1; }
.hr-badge em {
  font-style: normal; font-size: 10px; line-height: 1.3;
  color: rgba(60, 40, 12, 0.62);
}
`;

/**
 * Aké pásmo výplne je „rovnako vyplnená obrazovka".
 *
 * Merané 25. 9. 2026 na celom novom vstupe PO zrovnaní: na PC 89–100 %, na
 * iPhone SE 87–100 %, a **nikde nič nepreteká**. Ráno toho dňa pretekali štyri
 * zostavy (svorka 107 % na PC a 111 % na SE, podstata 112 %, e-mail 101 %).
 *
 * 🔑 **100 % nie je chyba, je to cieľ** — obsah sedí presne na hranici. Chyba je
 *    až `pretecie > 0`, teda keď sa krok vstupu roluje.
 * ⚠️ Spodná hranica je úsudok, nie meranie: pod 85 % je obrazovka vedľa susedov
 *    viditeľne poloprázdna. Presne to Matej 25. 9. na POVAHE (82 %) aj videl.
 */
export const FILL_BAND = { min: 85, max: 100 } as const;

/** Vzduch od okraja — ten istý zdroj, aký drží javisko. Dielňa ho ukazuje ako
 *  HRANICU, takže ho nesmie mať opísaný. */
export const FILL_AIR = PAGE_AIR;
