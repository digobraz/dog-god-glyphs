// EMOJI ZNAČIEK — JEDINÝ ZDROJ PRAVDY.
// Zadanie: `plany/zadanie-mapa-emoji-vlna-DALSIA-SESSION.md` §1.3
// Výber:   `plany/mapa-emoji-vyber-2026-08-21.json` (Matej 21. 8. 2026)
//
// ── PREČO EMOJI A NIE HAND-DRAWN IKONKY ─────────────────────────────────────
// Matej 2026-08-21: „POI z OMS by som celkom zmenil — nahradil tiež za emoji bez
// názvu… Na mape musíme zobrazovať len emoji". Spor s ikonkovým lockom v CLAUDE.md
// bol podaný ako flag a Matej ho prebil — mapa je funkčný povrch, kde sa značka
// číta na 20 px a bez učenia. `noteIcons.ts` (hand-drawn `d` cesty) NEMIZNE,
// ostáva knižnicou kresieb pre ostatné povrchy.
//
// ── CHIPY SEM NEPATRIA ──────────────────────────────────────────────────────
// `ACT_EMOJI` a `TAG_EMOJI` v `PackMap.tsx` ostávajú, kde sú. Sú to filtre
// a nahadzovanie, nie mapové značky — iný povrch, iná životnosť.
import type { TrailPoiType } from '@/data/trailPoi.generated';
import type { NoteGroup, NoteKind } from './mapNotesData';

/**
 * Emoji sa NESMIE nechať na `font-family` okolia. Na macOS by ho zdedený Cinzel
 * ešte prekreslil systémovým fallbackom, ale na Windows/Androide vie sadnúť
 * čiernobiely textový variant — a z 🦌 sa stane obdĺžnik.
 */
export const FONT_EMOJI =
  "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','Twemoji Mozilla',sans-serif";

/**
 * Značky, ktoré na mapu píše svorka.
 *
 * ⚠️ `parking` sa kreslí ako HOLÉ 🅿️ — a je to zároveň Matejov lock z 20. 8.
 * („biele P v modrom štvorci"), lebo presne tak 🅿️ na každej platforme vyzerá.
 * Nakreslený štvorec zanikol 21. 8. („iba emoji").
 *
 * ⚠️ Hrozby (`ticks`…`hazard`) sa od 22. 8. NEKRESLIA holé — idú do bieleho kruhu
 * s červeným lemom, dôvod je rozpísaný pri `threatEmoji()` nižšie. Emoji tu ostáva
 * to isté, mení sa len to, čo je okolo neho.
 */
export const MARK_EMOJI: Record<NoteKind, string> = {
  parking: '🅿️',
  ticks: '🕷️',
  wildlife: '🦌',
  viper: '🐍',
  bear: '🐻',
  // Rozšírenie 22. 8. — Matej: „pridajme tam ešte ovčiarske psy, zákaz vstupu,
  // rebríky, sinice". 🐑 nesie ovčiarske psy zámerne cez STÁDO, nie cez 🐕:
  // pes bez oviec by na mape čítal ako „tu chodia psy", čo je pravý opak výstrahy
  // — a 🐶 už v tejto sade drží radu.
  // ⛓️ namiesto 🪜 (Matej 2026-08-22: „nech to máme spoľahlivé"). 🪜 je Emoji 13.0
  // z roku 2020 a na starších telefónoch vypadne ako prázdny obdĺžnik — značka,
  // ktorú vidno len na novom prístroji, je horšia než značka, ktorá kreslí reťaz
  // namiesto rebríka. Na tie úseky aj tak vedú obe: istenie je buď rebrík, alebo reťaz.
  sheepdog: '🐑',
  ladders: '⛓️',
  algae: '🦠',
  noentry: '🚫',
  hazard: '⚠️',
  note: '🐶',
  // datasetové body z `heroTrails.generated.ts` (customPoi) — v palete nie sú
  water: '💧',
  viewpoint: '👁️',
};

/**
 * ROZCESTNÍK SKUPINY — paleta „+" (Matej 2026-08-21: „tu to oprav na emoji a psa
 * nedávaj do kruhu… iba emoji (trojuholník vymeň)").
 *
 * Dlaždica NIE JE výsledná značka, je to voľba: preto upozornenie nesie ⚠️
 * a nie konkrétnu hrozbu — keby tam bolo 🕷️, sľubovalo by kliešte človeku,
 * ktorý ide nahlásiť medveďa. ⚠️ je zároveň presne tá „ikonka trojuholníka",
 * ktorú si Matej pýtal, len natívne namiesto nakresleného tvaru.
 */
export const GROUP_EMOJI: Record<NoteGroup, string> = {
  parking: '🅿️',
  warning: '⚠️',
  comment: '🐶',
};

/**
 * OSM body v článku výletu. Na CELKOVEJ mape sa NEKRESLIA (Matej 2026-08-21:
 * „emoji POI len v blogu") — vrstva žije už len v `PackTripArticle`.
 *
 * 👁️ je zámerná dvojička s tagom „View" vo filtri: POI žije v článku, chip vo
 * filtri, na jednej ploche sa nestretnú.
 */
export const POI_EMOJI: Record<TrailPoiType, string> = {
  spring: '💧',
  viewpoint: '👁️',
  shelter: '🛖',
  bench: '🪑',
  // Rozšírenie 21. 8. — Matej: „na mapycz je ich viac ako napr sedlá prístrešky,
  // skaly, vodopády". `cliff` nesie SKALNÝ BOD (`natural=rock`), nie hranu zrázu —
  // dôvod je rozpísaný pri WAY_TAG_TYPES v `plany/compute-trail-poi.py`.
  saddle: '🚩',
  waterfall: '💦',
  cave: '🦇',
  tower: '🗼',
  firepit: '🏕️',
  cliff: '⛰️',
};

// ── UPOZORNENIE = EMOJI V BIELOM KRUHU S ČERVENÝM LEMOM ─────────────────────
// Matej 2026-08-22, k mapke výskytu vretenice (biely kruh vo farebnom špendlíku):
// „emoji vretenice daj do bieleho kruhu s červeným lemom".
//
// Nahradilo to dvojicu ⚠️ + malá hrozba z 21. 8. Dôvod, prečo dvojica padla, je
// vecný a nie estetický: pri rozpade na VIAC hrozieb sa z nej stáva rad takmer
// zhodných značiek, kde oko chytí len opakované ⚠️ a podtyp musí lúštiť z 13 px
// emoji vedľa. Kruh nesie skupinu tvarom a farbou lemu, vnútro nesie podtyp
// v plnej veľkosti — to isté rozdelenie významu, len čitateľné.
//
// ⚠️ Áno, je to podložka, teda návrat k tomu, čo 21. 8. zaniklo („holé emoji,
// žiadna podložka"). Je to Matejovo rozhodnutie s vlastnou vizuálnou predlohou,
// nie skĺznutie späť — a platí LEN na upozornenia. 🅿️ a 🐶 ostávajú holé.

/**
 * Emoji konkrétnej hrozby — to, čo sa vykreslí VNÚTRI kruhu.
 *
 * „Iné nebezpečenstvo" nemá čo spresniť, takže vnútri kruhu stojí samotné ⚠️.
 *
 * ⚠️ Zdroj pre OBA povrchy — mapovú značku (`MapNotesLayer`) aj riadok zoznamu
 * v článku (`MapNotesSection`). Dva zoznamy `if`-ov by sa časom rozišli a značka
 * na mape by hovorila niečo iné než tá istá vec v článku pod ňou.
 */
export function threatEmoji(kind: NoteKind): string {
  return MARK_EMOJI[kind] ?? MARK_EMOJI.hazard;
}
