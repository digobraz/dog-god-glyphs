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
import { PACK_THEME as T } from '@/components/pack/packTheme';
import type { EventKind } from '../events/eventModel';
import type { NoteGroup, NoteKind } from './mapNotesData';
import type { SleepKind } from '@/components/geo/sleepSpots';

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
  ticks: '🩸',
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

/**
 * SPACIE MIESTA — tretia vrstva mapy (kánon `zadanie-aktivity-taxonomia.md` §12 a §14.1).
 *
 * Matej 2026-08-27: „nocľah a kempovanie by malo vidieť stále, v tom je ten vtip…
 * dal by som to do mapy ako body na úroveň kreslených hikov, pretože budú mať svoj
 * vlastný zoznam."
 *
 * ✅ VYBRAL MATEJ 27. 8. 2026 v matrici značiek (`npm run emoji-matrica`, sekcia
 * „Spacie miesta"). Prevzal 🛏️ útulňu, ⛺ kemp a 🌙 divoké miesto z návrhu §14.1,
 * bivak a chatu prepísal. Zápis do state.json: `sleep::bivak`, `sleep::lodge`.
 * ⚠️ `sleep::lodge` v state.json OSTÁVA ako Matejov historický výber, ale druh `lodge`
 *    27. 8. zanikol (splynul s `hut`) — matrica ho teda už neponúka.
 *
 * · 🛁 CHATA S OBSLUHOU nesie vaňu, nie budovu — a je to presnejšie než čokoľvek
 *   domčekové. Rozdiel oproti útulni nie je v tvare strechy, ale v tom, že je tam
 *   obsluha, teplá voda a platí sa. To je to, čo si chodec potrebuje prečítať.
 * · 🛖 BIVAK je zhodný s `POI_EMOJI.shelter` a nie je to kolízia: obe veci SÚ chatrč
 *   so strechou a na jednej ploche sa nestretnú (článok výletu kreslí `TRAIL_POI`,
 *   hlavná mapa dlaždice). Rozdiel, na ktorom záleží, drží zoznam a popisok.
 *
 * ⚠️ 🛖 je Emoji 13.0 (2020) — na starých telefónoch môže vypadnúť ako prázdny
 * obdĺžnik, presne ako 🪜, ktorý 22. 8. z toho dôvodu padol. Matrica to pri výbere
 * hlási oranžovou bodkou a Matej ho zvolil s týmto vedomím; nie je to prehliadnutie.
 * Zvyšok sady je Emoji 1.0.
 *
 * ⚠️ `bivak` NIE JE to isté ČO `POI_EMOJI.shelter`, hoci nesie tú istú značku.
 * Prístrešok je strecha bez spania; bivak je `shelter_type=basic_hut`, teda ten,
 * v ktorom sa prespať dá. Podrobne v `sleepSpots.ts`.
 */
export const SLEEP_EMOJI: Record<SleepKind, string> = {
  hut: '🛏️',    // útulňa AJ chata — budova, v ktorej spíš vnútri (od 27. 8. spojené)
  camp: '⛺',             // kemp — oficiálne táborisko, väčšinou za peniaze
  bivak: '🛖',           // bivak — strecha a lavica, prespíš núdzovo
  wild: '🌙',            // divoké miesto — lúka, les, breh; v OSM neexistuje
};

/** Emoji bodu v dlaždici (`sleep_hut`…). Poistka pre starý uložený typ vracia útulňu —
 *  prázdna značka na mape je horšia než mierne nepresná. */
export function sleepEmoji(t: string): string {
  const k = t.startsWith('sleep_') ? t.slice(6) : t;
  return (SLEEP_EMOJI as Record<string, string>)[k] ?? SLEEP_EMOJI.hut;
}

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

// ── UDALOSTI = EMOJI V KRUHU S MODRÝM LEMOM (Matej 2026-08-22) ──────────────
// „ružový pin… musíme to nahradiť takisto emoji v krúžku s modrým lemom.
//  a emoji — terč 🎯 = event cieľ výletu"
//
// Zanikli tým DVE kvapky, ktoré na mape stáli vedľa seba bez legendy (tú Matej
// zrušil 3. 8.): ružová `.trp-planmarker-dot` (cieľ plánovaného výletu) a zlatá
// `.trp-eventmarker-dot` (podujatie). Obe hovorili to isté — „tu sa niekto s
// niekým stretne" — dvoma tvarmi, ktoré sa nedali odvodiť.
//
// Kruh a MODRÝ lem = skupina „stretnutie", emoji vnútri = podtyp. To je presne
// to isté delenie ako pri hrozbách, len iná farba lemu ⇒ mapa má jeden jazyk:
//   červený lem = daj si pozor · zelený lem = toto ťa poteší · modrý = tu sa ide
//
// ⚠️ Modrá nie je nová farba. `NotePalette` ju 22. 8. zamietol PRE TIPY práve
// preto, že „tou istou modrou appka značí «ideš s niekým»" — tu teda konečne
// stojí tam, kam podľa toho zdôvodnenia patrí.
/** Lem kruhu udalosti = `T.brandBlueLite`, tá istá modrá ako parkovacia bodka.
 *  Ťahá sa zo `packTheme`, NIE opísaná ako literál — pravidlo z `PointsPill.tsx`
 *  znie „nevymýšľaj druhú modrú", a opísaný `#2E5FD0` by presne tou druhou modrou
 *  ticho stal v deň, keď sa téma zmení. */
export const EVENT_RIM = T.brandBlueLite;

// ── LEM SVETA — ZEMITÁ HNEDÁ (Matej 2026-08-27) ─────────────────────────────
// Matej: „dajme ich do bielych krúžkov nech sú lepšie vidno… s tmavozeleným okrajom
// (to by sme mohli aplikovať na všetky emoji na mape týkajúce sa prírody - pramene
// lavičky skaly)". Kruh áno, zelená nie — a nebola to estetika:
//
// 🔴 TMAVOZELENÁ UŽ NA MAPE JE. `GROUP_TINT.comment` = `T.growGreen` (#3D7A4E) nesie
// TIP OD SVORKY. Rozhodujúci argument je PREVAHA POČTU: tipov je zopár, prírodných
// bodov 738 spacích miest + 11 956 prameňov + 34 677 lavičiek. Zelená by v hlave
// človeka prestala znamenať „tip" a začala znamenať „príroda" — tip by zanikol vo
// vlastnej farbe. Matej si po tomto vysvetlení vybral zemitú hnedú.
//
// 🔑 PRAVIDLO, KTORÉ TÝM VZNIKLO: lem nesie KTO TO NAPÍSAL, nie čo to je.
//    farebný lem (červená/zelená/modrá/zlatá) = SVORKA — toto niekto z nás videl
//    hnedý lem                                = SVET  — toto je bod z OpenStreetMap
// Preto sa hnedá NESMIE použiť na zápis svorky a farby svorky na bod zo sveta.
// Až útulňu niekto PREVEZME (pridá fotku a popis), zmena lemu povie bez slova, že
// prešla zo sveta k nám.
/** Lem kruhu bodu zo sveta (OSM) — zemitá hnedá. Vlastná farba, nie odtieň z brandu:
 *  brand nemá zem a najbližší `T.cardEdge` (#C99A3F) je zlatá, ktorou appka značí
 *  KOMENTÁR svorky — presne tá zámena, ktorej sa toto pravidlo vyhýba. */
export const WORLD_RIM = '#4A3826';

/**
 * CIEĽ PLÁNOVANÉHO VÝLETU — Matejov výber. Bývalá ružová kvapka.
 *
 * 📍 od 24. 8. 2026 (matrica značiek). Terč 🎯 padol preto, že sa mal zároveň stať
 * ikonkou tlačidla „Označ cieľ trasy" v kreslení — tá istá značka by tak naraz
 * hovorila „sem klikni" aj „tu to je". Špendlík je navyše jediný tvar, ktorý sa
 * na mape číta ako miesto bez toho, aby si ho človek musel vysvetliť.
 */
export const TRIP_TARGET_EMOJI = '📍';

/**
 * PODUJATIE — emoji podľa TYPU (Matej 2026-08-22: „každý typ vlastné").
 *
 * ⚠️ Emoji 1.0 (2015) = pravidlo sady, teda bezpečné aj na starých telefónoch.
 * Je to to isté kritérium, kvôli ktorému 22. 8. padol rebrík 🪜 (Emoji 13.0, 2020)
 * v prospech reťaze ⛓️ — značka, ktorú vidno len na novom prístroji, nie je značka.
 *
 * ── ZRUŠENÉ TYPY 24. 8. 2026 (matrica značiek) ──────────────────────────────
 * `workshop` 🛠️, `meetup` 🤝 a `adoption` 🏠 vypadli na Matejov pokyn — workshop
 * a prednáška sú pre psíčkara to isté podujatie, zraz bez programu je spoločná
 * prechádzka a adopčný deň si útulok aj tak vypíše ako charitu. Jedenásť pilulek
 * vo formulári bolo viac deliacich čiar než rozdielov.
 * ⚠️ `eventEmoji()` a `EventCard` majú fallback, takže starý localStorage záznam
 * s týmto typom nespadne — dostane 🎪 a holý anglický názov.
 *
 * Prečo tieto:
 * · 🏁 preteky — cieľová vlajka, nie 🏃 (ten by čítal ako „tu sa behá")
 * · 🏆 výstava — jediná disciplína v sade, kde sa naozaj súťaží o umiestnenie
 * · 🎖️ tréning — odznak za zvládnutý výcvik; 🐕‍🦺 je ZWJ sekvencia a na starších
 *      systémoch sa rozpadne na psa + oranžovú vestu vedľa seba, 🎾 zase čítalo
 *      ako hra, nie ako práca
 * · 🎓 prednáška — sedí sa a počúva
 * · 🐕 spoločná prechádzka — celý pes; 🐶 (hlava) je v tejto sade obsadené
 *      komentárom svorky, ale ten stojí v ZELENOM kruhu, takže sa nepomýlia
 * · ❤️ charita — nie 🎗️ (stužka je v Európe čítaná ako konkrétna choroba)
 * · 🏕️ tábor — viacdňové; ⛺ je obsadené aktivitou „overnight" v chipoch mapy
 * · 🎪 veľtrh — veľká hala plná stánkov
 */
export const EVENT_EMOJI: Record<EventKind, string> = {
  race: '🏁',
  show: '🏆',
  training: '🎖️',
  lecture: '🎓',
  social_walk: '🐕',
  charity: '❤️',
  camp: '🏕️',
  expo: '🎪',
};

/** Emoji podujatia s poistkou — neznámy typ (starý uložený záznam) dostane 🎪,
 *  nikdy prázdny kruh. Rovnaký vzor ako `threatEmoji()` vyššie. */
export function eventEmoji(kind: EventKind): string {
  return EVENT_EMOJI[kind] ?? EVENT_EMOJI.expo;
}
