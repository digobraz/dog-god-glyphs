// ── ATRIBÚCIA MAPY — JEDEN KUS PRE VŠETKY MAPY ──────────────────────────────────────────
//
// ⚠️ NIE JE TO KOZMETIKA, JE TO PODMIENKA LICENCIE. Dlaždice sú Mapy.com (Seznam.cz) a ich
// API ich smie vykresľovať len s viditeľným logom a textom „© Seznam.cz a.s."; POI vrstva je
// OpenStreetMap (ODbL) a chce svoju vetu. Preto je to komponent a nie odpísaný `<div>`: kto
// pridá mapu, pridá aj atribúciu, a keď sa raz zmení znenie alebo zdroj, mení sa JEDNO miesto.
//
// Čo to spôsobilo (premerané 17. 9. 2026 headless, 390×844 a 1440×900, prihlásený účet):
//  · `/pack/map` atribúciu MALA, ale na telefóne ju zakrýval spodný nav — nav stál
//    y 760–828, atribúcia y 817–835 a nav má vyšší z-index. Vidno z nej bolo „…p" a „a.s.".
//    To isté robil mierke (`.leaflet-control-scale`, x 12–94, y 816–832). Na PC (1440) je nav
//    centrovaný pill a nekoliduje — preto sa zdvíha LEN mobilná vetva.
//  · `/pack/map/:country/:slug` (článok výletu) atribúciu dlaždíc nemal VÔBEC:
//    `attributionControl={false}` a žiadna vlastná. POI vetu áno, Mapy.com nie.
//
// 🔴 **DVE ATRIBÚCIE SÚ JEDEN STĹPEC, NIE DVA PRVKY V TOM ISTOM ROHU.** Do 17. 9. stáli
// nezávisle a držala ich od seba ručná konštanta `bottom: 34` na POI — komentár pri nej
// priamo hovorí, že bez nej si „sadli NA SEBA a čitateľná nebola ani jedna". Každá zmena
// výšky ktorejkoľvek z nich to číslo tichó rozbíja. Preto ich teraz skladá `.trp-attrstack`
// a zdvíhajú sa spolu.
//
// ⚠️ `attributionControl={false}` na `<MapContainer>` ostáva ZÁMERNE — Leafletov vlastný
// control je tmavý pás cez spodnú hranu a do papyrusového šatu nesadá. Vypnúť ho smieš len
// spolu s TÝMTO komponentom, nie namiesto neho.
//
// ⚠️ NIE JE TO BLOK z katalógu `PACK_BLOCKS` a nový tvar nezakladá. Je to ÚDAJ na mape —
// tá istá deliaca čiara ako pri značke na mape (lock 14. 9.: „nie je nábytok, je to údaj").
// Rozmery si napriek tomu berie zo stupníc, lebo dôvod na výnimku nemá.
import type { CSSProperties } from 'react';
import { PoiAttribution } from '@/components/geo/PoiLayer';
import { DOCK_VH } from './mapDockShape';
import { PACK_R, PACK_SPACE, PACK_TEXT } from './packTheme';

/** Povrch a poloha v rámci mapy. Rodič musí byť pozicovaný (`.trp-mapfull`, `.pta-mapwrap`). */
export const MAP_ATTR_CSS = `
.trp-attrstack{position:absolute;right:${PACK_SPACE.md}px;bottom:${PACK_SPACE.md}px;z-index:800;
  display:flex;flex-direction:column;align-items:flex-end;gap:${PACK_SPACE.xs}px;pointer-events:none;}
.trp-attrstack > *{pointer-events:auto;}
.trp-attr{display:flex;align-items:center;gap:${PACK_SPACE.xs}px;
  background:rgba(255,255,255,0.85);border-radius:${PACK_R.field}px;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;font-size:${PACK_TEXT.micro}px;color:#333;}
.trp-attr a{display:block;line-height:0;}
`;

/**
 * ZDVIH NAD SPODNÝ NAV — len pre mapu cez celú obrazovku (`/pack/map`).
 *
 * ⚠️ ČÍSLO SA NEPÍŠE, PREBERÁ SA OD NAVU. Odsadenie je doslovná kópia rovnice z
 * `PackLayout.tsx` (`bottom: calc(env(safe-area-inset-bottom) + 16px)`; cookie lišta od 22. 9. prekrýva, neposúva)
 * plus jeho nameraná výška `--pack-nav-h` (ResizeObserver v `PackBottomNav`) a 10 px medzery.
 * Natvrdo zapísaných „94 px" by prežilo presne do najbližšej zmeny pillu — to je tá istá
 * pasca, akú už raz vyriešil `--trp-mheader-h` pri ovládačoch vpravo hore.
 *
 * ⚠️ Keď nav nie je (LIVE build bez `DEV_FULL`, routy mimo `/pack`), premenná neexistuje
 * a fallback `0px` vráti atribúciu na pôvodné miesto. Preto fallback, nie pevná hodnota.
 *
 * 🔴 NAD NAVOM TO NESTAČÍ. Spodok mobilnej mapy je obsadený DVAKRÁT: nad navom stojí ešte rad
 * ZOZNAM/PRIDAŤ (`.trp-mactions`, premerané 17. 9. na 360/390/430 px: rad y 702–749, nav
 * y 760–828). Prvý pokus atribúciu zdvihol z pod navu presne naň. Druhý stupeň sa preto viaže
 * na `--trp-mactions-h` — vzdialenosť od spodku okna po VRCH radu, ktorú publikuje `PackMap.tsx`.
 * Trieda `has-map-actions` hovorí, či ten rad vôbec je; pri kreslení mizne a atribúcia klesá späť.
 *
 * ⚠️ TRETÍ STUPEŇ JE SPRIEVODCA PRIDÁVANIA. `body.trp-draw-lock` schová nav aj rad akcií, ale
 * zdola príde dok (`.trp-dock`, z-index 1200, výška `DOCK_VH` = 33vh, lock z 24. 8.) — a to je
 * presne ten stav, v ktorom človek POZERÁ na mapu a hľadá bod. Výška sa preto berie z `DOCK_VH`,
 * nie z prepísaných 33. V celoobrazovkových krokoch sprievodcu (výber druhu, zápis) mapu nevidno
 * vôbec, takže zdvih tam nikomu neprekáža.
 *
 * @param maxWidth hranica mobilnej vetvy volajúceho (`MOBILE_BP` v `PackMap.tsx`)
 */
export const mapAttrLiftCSS = (maxWidth: number) => `
@media (max-width:${maxWidth}px){
  .trp-attrstack,.leaflet-control-scale{
    bottom:calc(env(safe-area-inset-bottom, 0px) + 16px + var(--pack-nav-h, 0px) + 10px);}
  body.has-map-actions .trp-attrstack,body.has-map-actions .leaflet-control-scale{
    bottom:calc(var(--trp-mactions-h, 149px) + 10px);}
  body.trp-draw-lock .trp-attrstack,body.trp-draw-lock .leaflet-control-scale{
    bottom:calc(${DOCK_VH * 100}vh + 10px);}
}
`;

/**
 * Logo Mapy.com + „© Seznam.cz a.s.", voliteľne nad tým veta OSM.
 *
 * @param poi   vykreslí aj riadok POI — patrí tam všade, kde beží `<PoiLayer />`
 * @param style posun celého stĺpca (článok ho dvíha nad panel značky podľa jeho NAMERANEJ výšky)
 */
export function MapAttribution({ poi = false, style }: { poi?: boolean; style?: CSSProperties }) {
  return (
    <div className="trp-attrstack" style={style}>
      {/* `position:'static'` zruší jeho vlastné pripnutie do rohu — polohu nesie stĺpec.
          Vzhľad (tmavá pilulka) ostáva jeho, sú to dva zdroje a majú vyzerať ako dva riadky. */}
      {poi && <PoiAttribution style={{ position: 'static' }} />}
      <div className="trp-attr">
        <a href="https://mapy.com" target="_blank" rel="noopener noreferrer">
          <img src="https://api.mapy.com/img/api/logo.svg" alt="Mapy.com" style={{ height: 13, display: 'block' }} />
        </a>
        <span>© Seznam.cz a.s.</span>
      </div>
    </div>
  );
}
