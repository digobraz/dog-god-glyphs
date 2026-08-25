// ── TVAR SPODNÉHO PANELA NAD MAPOU — JEDEN ZDROJ ────────────────────────────────────────
//
// Matej 2026-08-24: „pri označení parkoviska sa vysunie iný dolný panel — tam kde treba
// vybrať platené alebo zadarmo. Musí byť taký istý ako ten panel predtým… treba ustáliť
// ten istý tvar aj veľkosť."
//
// Počas krokov 1–2 sa človek prekliká cez TRI rôzne obsahy toho istého miesta pri spodnej
// hrane: hľadanie miesta (`.trp-dstart`), nástroje kreslenia a otázky o odkazoch
// (`.trp-dbar`) a formulár značky (`.mna-sheet`). Prvé dva žili v `DRAW_BAR_CSS`, tretí
// v `ADD_NOTE_CSS` — a rozišli sa v každej jednej vlastnosti: iná výplň (#050505 vs. #120D07),
// iný rám (zlatý vs. papyrusový), iná výplň vnútri, iný radius a hlavne iná VÝŠKA
// (420 px / 78vh vs. 33vh). Pod prstom to vyzeralo, že sa strieda niekoľko rôznych appiek.
//
// ⚠️ PREČO TO NIE JE LEN ESTETIKA: výška panela určuje, koľko z mapy je vidno. Pevných 33vh
// v krokoch 1–2 je LOCK z 24. 8. („aby sa pri týchto 2 krokoch neustále nemenila tá výška")
// a panel značky ten lock porušoval práve v momente, keď človek pozerá na mapu a hľadá bod,
// ktorý práve položil.
//
// ⚠️ DÔSLEDOK, KTORÝ TREBA POZNAŤ: pri 33vh sa najvyšší stav formulára značky (kliešť
// s potvrdenou chorobou + zapnutý okruh, ~366 px) na nízkom displeji NEZMESTÍ a stred
// panela skroluje. Hlavička (čo píšem) aj CTA (ako to uložím) stoja — skroluje sa len to
// medzi nimi. Je to vedomá výmena: konštantný výrez mapy za skrol v jednom krajnom stave.
import { PACK_THEME as T } from './packTheme';

/** Podiel výšky okna, ktorý smie panel zabrať v krokoch 1–2. Lock z 24. 8. 2026. */
export const DOCK_VH = 0.33;

/** Hranica telefónnej vetvy. ⚠️ To isté číslo ako v `DRAW_BAR_CSS` — jeden breakpoint. */
export const DOCK_MOBILE_MAX = 899;

/** Šírka plávajúceho stĺpca na PC. Zhodná s `.trp-sidebar` / `.trp-addhost`. */
export const DOCK_COL_W = 440;

/**
 * SPOLOČNÁ TRIEDA. Nesie povrch, výplň a výšku; obsah si každý panel rieši sám
 * (dok skroluje celý, formulár značky len svoj stred — hlavička a CTA v ňom stoja).
 */
/**
 * SPOLOČNÁ TRIEDA — POVRCH, VÝPLŇ, VÝŠKA. Nič viac.
 *
 * ⚠️ ZÁMERNE BEZ `position`. Panely doku (`.trp-dstart`, `.trp-dbar`) stoja VNÚTRI `.trp-dock`,
 * ktorý je fixed a nesie ich poradie (čítanie km nad panelom, návrat pod ním); keby si každý
 * z nich pripol vlastné `position:fixed`, dok by sa rozpadol. Formulár značky (`.mna-sheet`)
 * žije sám, takže si pripútanie k hrane nesie po svojom. Spoločné je to, čo Matej vidí —
 * povrch a veľkosť — nie to, ako sa to na obrazovku dostane.
 */
export const MAP_DOCK_CSS = `
.trp-dockpanel{
  box-sizing:border-box;
  padding:18px 16px calc(20px + env(safe-area-inset-bottom,0px));
  background:rgba(18,13,7,0.94);backdrop-filter:blur(12px);
  border-top:1px solid ${T.onDarkBorder};
  box-shadow:0 -14px 40px rgba(0,0,0,0.45);
}
/* PEVNÁ VÝŠKA V KROKOCH 1–2. Výška aj strop naraz: samotná height by pri dlhšom obsahu panel
   pretiahla, samotný max-height by ho nechal skákať zdola. */
@media (max-width:${DOCK_MOBILE_MAX}px){
  .trp-dockpanel{height:${DOCK_VH * 100}vh;max-height:${DOCK_VH * 100}vh;}
}
/* PC — plávajúca karta so zaoblením a plným rámom. Bezpečná zóna telefónu tu nemá čo robiť,
   inak má panel nesúmerne hrubú spodnú výplň. */
@media (min-width:1024px){
  .trp-dockpanel{
    border:1px solid ${T.onDarkBorder};border-radius:16px;
    box-shadow:0 18px 48px rgba(0,0,0,0.50);
    padding-bottom:20px;
  }
}
`;

/**
 * ── REZERVA PRI RÁMOVANÍ MAPY, KEĎ STOJÍ DOK ────────────────────────────────────────────
 *
 * Matej 2026-08-25: „pri slovensku je polovica skryta za dolnym panelom" a o pár minút
 * neskôr „ak z 3–5 kroku kliknem na 1 alebo 2… musí sa zobraziť konkrétna nakreslená trasa,
 * aby človek nemusel toľko zoomovať."
 *
 * Sú to dva rôzne OBSAHY (krajina vs. hotová trasa), ale JEDNA a tá istá rezerva: dole dok,
 * hore bublina AInubisa s bodkami 1–5. Preto býva tu, a nie dvakrát opísaná na dvoch
 * miestach — prvá zmena výšky doku by tie dve kópie rozišla a jedna z nich by začala
 * rámovať pod panel.
 *
 * `panelH` sa podáva zvonku (`notePanelH()`), nie počíta tu: ten výpočet žije v `AddMapNote`
 * spolu s pravidlom, kedy panel vôbec je — a dva výpočty tej istej výšky sú presne to,
 * čomu sa tento súbor venuje.
 */
export function dockFitPadding(panelH: number): {
  paddingTopLeft: [number, number];
  paddingBottomRight: [number, number];
} {
  const phone = typeof window !== 'undefined' && window.innerWidth <= DOCK_MOBILE_MAX;
  // Bublina AInubisa + rad bodiek merajú ~150 px vrátane odstupu od notchu.
  return phone
    ? { paddingTopLeft: [24, 150], paddingBottomRight: [24, panelH + 24] }
    : { paddingTopLeft: [DOCK_COL_W + 60, 130], paddingBottomRight: [90, 140] };
}
