// SPACIE MIESTA — druhy. JEDINÝ ZDROJ zoznamu druhov a ich poradia.
//
// Kánon: `plany/zadanie-aktivity-taxonomia.md` §12 a §14.1
// Dáta:  `plany/compute-sleep-spots.py` → `plany/sleep-spots.json` → `public/poi/v1/`
//
// ── PREČO TRETIA VRSTVA, A NIE ZNAČKA SVORKY ───────────────────────────────
// Matej 2026-08-27: „nocľah a kempovanie by malo vidieť stále, v tom je ten vtip… nebude
// to naviazané na ten výlet, ale ak niekto ide ten výlet, vie si to odsledovať a inšpirovať
// sa… dal by som to do mapy ako body na úroveň kreslených hikov, pretože budú mať svoj
// vlastný zoznam."
//
// Tvrdenie „tu sa dá prespať" platí o MIESTE, nie o výlete. Preto to nie je `map_notes`
// (odkaz viazaný na miesto, ale významom na okoloidúcu trasu) ani bod trasy, ale vlastná
// entita s vlastným zoznamom.
//
// 🔴 `bivak` NIE JE to isté ako typ `shelter` v `TRAIL_POI`. `amenity=shelter` je strecha
// a lavica — prístrešok, v ktorom sa NESPÍ. Sem ide len jeho podmnožina
// `shelter_type=basic_hut`. Zliať ich by znamenalo poslať človeka spať pod altánok.
//
// ⚠️ `wild` (divoké miesto — lúka, les, breh) v OSM NEEXISTUJE a nikdy existovať nebude.
// Z dlaždíc teda nepríde ani jeden taký bod a je to zámer, nie chýbajúce dáta: rastie len
// z ľudí a je to práve ten druh, kvôli ktorému vrstva vzniká („stanovali sme tu… super
// miesto na stanovanie"). Emoji aj popisok má pripravené, aby ho zakladanie vlastných
// spacích miest našlo hotový.
// ⚠️ `lodge` (chata s obsluhou, 🛁) ZANIKOL 27. 8. 2026 a splynul s `hut`. Rozbilo sa to
// na prvom bode, ktorý si Matej otvoril: „Útulňa Ďurková pod Chabencom" je v OSM `alpine_hut`,
// takže z útulne bola chata s vaňou. Matej: „ja soom myslel že to su myslene hotely".
// Z pohľadu chodca je útulňa aj chata TO ISTÉ — budova, v ktorej spíš vnútri; či sa platí
// a či varia, nesú CHIPY (`fee`, `meals`), lebo platená útulňa aj neplatená chata existujú.
// 🛁 sa tým uvoľnilo pre HOTELY — tie ale nie sú spacie miesto pre chodca, patria do SLUŽIEB.
// 🔴 `bivak` sa NEZLIEVA: strecha bez dverí, spíš vonku vo svojom — opačný koniec, nie sused.
export const SLEEP_KINDS = ['hut', 'camp', 'bivak', 'wild'] as const;
export type SleepKind = (typeof SLEEP_KINDS)[number];

/** Typ bodu v dlaždici. Prefix `sleep_` je zámerný — dlaždice raz ponesú aj pramene a
 *  lavičky, a `camp` samo osebe by sa s nimi v jednom priestore mien pobilo. */
export type SleepPoiType = `sleep_${SleepKind}`;

export const sleepType = (k: SleepKind): SleepPoiType => `sleep_${k}`;

/**
 * 🔴 DRUH `wild` SA NESMIE VYKRESLIŤ BEZ TEJTO VETY (Matej 27. 8. 2026).
 * `tx('pack.sleep.wildWarning')` — *„Nie je to oficiálne táborisko. V národnom parku je voľné
 * táborenie zakázané — zodpovednosť je na tebe."*
 *
 * Dôvod je právny, nie estetický: chip „Oficiálne povolené" v sade ostáva, takže jeho
 * CHÝBANIE pri divokom mieste by sa dalo prečítať ako „tak asi hej". Veta to ticho
 * dopovedá. Kto pridá nový povrch, ktorý ukazuje spacie miesto, ju musí vziať so sebou.
 */
export const SLEEP_WILD_WARNING_KEY = 'pack.sleep.wildWarning';

/** i18n kľúč popisku druhu (`sk.ts` + `en.ts`). */
export const sleepLabelKey = (k: SleepKind): string => `pack.sleep.${k}`;
