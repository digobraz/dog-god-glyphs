// EMOJI V KRUHU — JEDINÁ GEOMETRIA PRE VŠETKY KRUHOVÉ ZNAČKY NA MAPE.
//
// ── PREČO TENTO SÚBOR VZNIKOL (2026-08-22) ──────────────────────────────────
// Kruh sa 22. 8. narodil pri hrozbách (biely kruh + červený lem), o pár hodín
// dostal druhý odtieň pri tipoch (zelený lem) a teraz tretí pri udalostiach
// (modrý lem, Matej: „musíme to nahradiť takisto emoji v krúžku s modrým lemom").
// Tretia kópia tých istých 28 px, 2.5 px lemu a 16 px emoji v treťom súbore je
// presne ten stav, po ktorom sa značky rozídu pri prvej zmene — a značka udalosti
// navyše nežije v `MapNotesLayer`, ale v `PackMap.tsx`, čiže mimo dosahu
// `MAP_NOTES_CSS`. Preto sú rozmery aj staviteľ TU a volajú ich obaja.
//
// ⚠️ Farbu lemu tento súbor NEPOZNÁ a poznať nemá — nesie ju volajúci:
// `noteTint()` pri zápisoch svorky, `EVENT_RIM` pri udalostiach. Jeden zdroj
// tvaru, viac zdrojov významu. Keby sem pribudla tabuľka farieb, stal by sa
// z toho druhý `NotePalette`.
//
// ⚠️ Triedy majú prefix `mk-`, nie `mn-` — `mn-` patrí vrstve zápisov a značka
// udalosti do nej nepatrí. Kto injektne CSS, ten ho aj potrebuje; dvakrát
// vložený rovnaký `<style>` nič nepokazí (CSS je idempotentné).
import { FONT_EMOJI } from './markEmoji';

/** Priemer kruhu v px. Hrozba, tip aj udalosť ho majú ZHODNÝ zámerne — dve veľkosti
 *  kruhu by na mape čítali ako dve dôležitosti, a to je vzťah, ktorý tu neplatí. */
export const CIRCLE_PX = 28;
/** Emoji vnútri je menšie než pri holej značke (20 px) — kruh mu zobral lem aj vnútorný okraj. */
export const CIRCLE_EMOJI_PX = 16;
const RIM_PX = 2.5;

/** Priemer kruhu bodu ZO SVETA (OSM) — menší než naše značky (2026-08-27).
 *
 *  ⚠️ Doteraz mali všetky kruhy priemer ZHODNÝ a bol to zámer: „dve veľkosti kruhu by na
 *  mape čítali ako dve dôležitosti, a to je vzťah, ktorý tu neplatí." Medzi hrozbou, tipom
 *  a udalosťou naozaj neplatí — všetky tri napísal člen svorky. Medzi značkou svorky a
 *  bodom z OpenStreetMap ale platí: naše značky majú ostať dominantné, lebo prameňov a
 *  lavičiek budú desaťtisíce. Pôvodné pravidlo teda nepadlo, len sa ukázala hranica, po
 *  ktorú platilo. */
export const WORLD_CIRCLE_PX = 24;
const WORLD_EMOJI_PX = 14;
const WORLD_RIM_PX = 2;

/**
 * Značka „emoji v bielom kruhu" ako HTML string pre `L.divIcon`.
 *
 * Kruh je súmerný ⇒ jeho stred sedí na súradnici bez dopočtu posunu (centrovanie
 * robí `transform: translate(-50%,-50%)` v CSS, nie `iconAnchor`).
 *
 * @param emoji  čo stojí vnútri — nesie PODTYP (druh hrozby, druh podujatia)
 * @param rim    farba lemu — nesie SKUPINU (červená výstraha · zelená tip · modrá udalosť)
 * @param extra  doplnkové triedy (napr. ` mk-circle--hot`), vždy s medzerou na začiatku
 */
export function circleMarkHtml(emoji: string, rim: string, extra = ''): string {
  return `<div class="mk-circle${extra}" style="border-color:${rim}"><i>${emoji}</i></div>`;
}

/**
 * CSS kruhovej značky. Injektuje ho KAŽDÝ povrch, ktorý `circleMarkHtml()` volá —
 * `MapNotesLayer` cez `MAP_NOTES_CSS`, `PackMap` cez svoj blok.
 *
 * ⚠️ Toto je JS template literal — spätný apostrof v komentári ho ukončí a stránka
 * spadne na „... is not a function". TypeScript ani build to nechytia.
 */
export const CIRCLE_MARK_CSS = `
/* Obal L.divIcon — Leaflet mu inak dá biele pozadie a rám. Kruh sa centruje
   CSS transformom, takže iconSize/iconAnchor sa NEUVÁDZAJÚ (rovnaký kontrakt
   ako mn-wrap vo vrstve zápisov). */
.mk-wrap{background:none;border:0;}
.mk-circle{position:relative;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .12s ease,box-shadow .12s ease;width:${CIRCLE_PX}px;height:${CIRCLE_PX}px;border-radius:999px;background:#FFFFFF;border:${RIM_PX}px solid #000;box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,0.45),0 0 0 1px rgba(0,0,0,0.10);}
.mk-circle:hover{transform:translate(-50%,-50%) scale(1.12);}
/* <i> je len nosič, nie kurzíva. Emoji MUSÍ mať vlastný font stack: zdedený Cinzel
   by na Windows sadol na čiernobiely textový variant a z 🎯 by ostal obdĺžnik. */
.mk-circle i{font-style:normal;font-family:${FONT_EMOJI};font-size:${CIRCLE_EMOJI_PX}px;line-height:1;-webkit-user-select:none;user-select:none;}
/* VYBRANÁ značka — dvojica so zvýraznenou kartou v paneli. Prstenec vo farbe lemu
   sa dedí z currentColor? NIE — lem je inline, takže prstenec je neutrálne tmavý
   a funguje pod červeným, zeleným aj modrým lemom rovnako. */
.mk-circle--hot{box-shadow:0 0 0 3px rgba(0,0,0,0.35),0 2px 10px rgba(0,0,0,0.6);}
/* BOD ZO SVETA (OSM) — ten istý kruh, o kúsok menší a s tenším lemom. Je to VARIANT,
   nie druhá značka: keby si PoiLayer postavil vlastný kruh, rozišli by sa pri prvej
   zmene presne tak, ako sa 22. 8. rozchádzali hrozba, tip a udalosť. Farbu lemu (hnedú)
   nesie volajúci cez WORLD_RIM, rovnako ako pri všetkých ostatných kruhoch. */
.mk-circle--world{width:${WORLD_CIRCLE_PX}px;height:${WORLD_CIRCLE_PX}px;border-width:${WORLD_RIM_PX}px;box-shadow:0 1px 2px rgba(0,0,0,0.40),0 0 0 1px rgba(0,0,0,0.08);}
.mk-circle--world i{font-size:${WORLD_EMOJI_PX}px;}
`;
