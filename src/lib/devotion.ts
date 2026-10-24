// ============================================================================
// Devotion ladder — shared between HeroCard (/pack) and StickyDevotionBar
// (dog profile). Single source of truth for level math.
//
// Canonical 22-tier ladder from the devotion sim (devotion-sim/zivot-v-dogypte.html).
// Path 1 of 3 (Devotion). Thresholds 1–20 are sim canon; Pharaoh (★) and Demigod
// (☼) are symbolic in the sim — kept at 1M / 2M so the level math has numbers.
// ============================================================================
import { IS_APP } from '@/lib/isApp';
// `key` = stabilný i18n kľúč (`pack.ladder.<key>`). `name` = EN fallback / kánon.
// Komponenty rendrujú `t('pack.ladder.' + lv.key)` — názov sa prekladá, prahy nie.
export const DEVOTION_LEVELS = [
  { key: 'novice',   name: 'Novice', at: 0 },          // new member starts here
  { key: 'wanderer', name: 'Wanderer', at: 200 },
  { key: 'follower', name: 'Follower', at: 400 },   // 500 → 400 (23. 10. 2026): stupeň po 1. týždni
  { key: 'believer', name: 'Believer', at: 1000 },
  { key: 'servant',  name: 'Servant', at: 2000 },
  { key: 'aspirant', name: 'Aspirant', at: 3500 },
  { key: 'mentor',   name: 'Mentor', at: 6000 },
  { key: 'steward',  name: 'Steward', at: 10000 },
  { key: 'shepherd', name: 'Shepherd', at: 16000 },
  { key: 'sentinel', name: 'Sentinel', at: 25000 },
  { key: 'elder',    name: 'Elder', at: 38000 },
  { key: 'sage',     name: 'Sage', at: 55000 },
  { key: 'cleric',   name: 'Cleric', at: 80000 },
  { key: 'mystic',   name: 'Mystic', at: 120000 },
  { key: 'priest',   name: 'Priest', at: 160000 },
  { key: 'paladin',  name: 'Paladin', at: 200000 },
  { key: 'magus',    name: 'Magus', at: 260000 },
  { key: 'prophet',  name: 'Prophet', at: 340000 },
  { key: 'nomarch',  name: 'Nomarch', at: 480000 },
  { key: 'vizier',   name: 'Vizier', at: 700000 },
  { key: 'pharaoh',  name: 'Pharaoh', at: 1000000 },   // ★ founder tier
  { key: 'demigod',  name: 'Demigod', at: 2000000 },   // ☼ poloboh — top of the path
] as const;

export interface DevotionLevel {
  index: number;
  key: string;
  name: string;
  next: { key: string; name: string; at: number } | null;
  pct: number;
  toNext: number;
}

export function devotionLevel(d: number): DevotionLevel {
  let i = 0;
  for (let k = 0; k < DEVOTION_LEVELS.length; k++) {
    if (d >= DEVOTION_LEVELS[k].at) i = k;
  }
  const cur = DEVOTION_LEVELS[i];
  const next = DEVOTION_LEVELS[i + 1] ?? null;
  const span = next ? next.at - cur.at : 0;
  const pct = next && span > 0 && isFinite(span)
    ? Math.max(0, Math.min(100, ((d - cur.at) / span) * 100))
    : 100;
  const toNext = next && isFinite(next.at) ? Math.max(0, next.at - d) : 0;
  return { index: i + 1, key: cur.key, name: cur.name, next, pct, toNext };
}

// ============================================================================
// ZA ČO SA DOSTÁVA ☥ — finálne hodnoty Matej 23. 10. 2026 (plany/zadanie-devotion-finalizacia-2026-10-24.md §6,
// kalkulačka `node scripts/devotion-kalk.mjs`).
// 🔴 ZRKADLO servera: body pripisuje `grant-devotion` (DAILY/ONCE), krst trigger a krmenie
//    pg_cron (migrácia 20261101_devotion_v2.sql). Tu sú len na ZOBRAZENIE — zmena hodnoty
//    = zmena na serveri AJ tu, inak panel sľúbi iné číslo, než sa pripíše.
// Body sa rátajú NA ŽIVÉHO PSA (Matej: „na živých psov… nie na mŕtvych").
// ============================================================================
export const DEVOTION_START = 100;

// 🚧 PANEL „DNEŠOK" + PRIPOMIENKY AINUBISA — LEN NA DEV, kým DEVOTION nejde na LIVE (Matej 23. 10. 2026:
//    profil von teraz, DEVOTION skryť). Na LIVE chýba `devotion_today()` aj `grant-devotion` v2 — tlačidlá
//    by nič neurobili. DEVOTION session to prepne na `true` až po LIVE migrácii + edge + cron
//    (`plany/zadanie-devotion-finalizacia-2026-10-24.md` §LIVE).
// ✅ 23. 10. 2026 noc: LIVE migrácia v2 + spätne + edge + cron NASADENÉ → panel ide na LIVE.
// ⛔ 24. 10. 2026 STIAHNUTÉ (Matej: *„ešte to live nedajme, pôjde to von až s appkou… kým nepovieme,
//    že je to ok, stiahni to“*). Hodnoty a farmenie sa ešte simulujú. `false` = panel Dnešok, položka
//    v paneli +, nastavenie pripomienok preč a každý vidí DEVOTION zamrznutú na DEVOTION_START
//    (vlastný profil aj karta v Sniffri). Kniha `devotion_events` sa nemaže, len sa neukazuje.
// ✅ V APPKE OSTÁVA (Matej 24. 10.: *„samozrejme v appke to nechaj, tam to budeme testovať… bavíme sa
//    o tom, čo vidia členovia“*). Appku majú dnes len testeri (TestFlight).
// 🔴 PRED VYDANÍM APPKY DO OBCHODU: buď DEVOTION schválená, alebo sem `false` — inak ju uvidia členovia.
export const DEVOTION_TODAY_ON: boolean = IS_APP;

export const DEVOTION_DAILY = {
  walk_short: { points: 2, perDay: 3 },   // krátke venčenie < 20 min — povinnosť, nie skutok
  walk:       { points: 10, perDay: 1 },  // prechádzka 20–120 min
  presence:   { points: 10, perDay: 1 },  // modlitba prítomnosti — 10 min so psom (Matej 23. 10.: „kľudne 10")
  deed:       { points: 0, perDay: 3 },   // „Iné" — kronika / dobrý skutok, NA ČLOVEKA (DEVOTION_DEED)
} as const;
export type DevotionDailyKind = keyof typeof DEVOTION_DAILY;

/** „Iné": kronika hneď, dobrý skutok až po schválení AINUBISom (najviac 1× za deň). */
export const DEVOTION_DEED = { chronicle: 10, good_deed: 30 } as const;

/** Celodenný výlet — LEN cez „Zapíš výlet" (záznam = dôkaz), za každého živého psa, ktorý išiel.
 *  Pripisuje DB trigger na `dog_trips`, nie ťuknutie. Matej 23. 10.: *„výlet teda dajme len za ten, čo zapíše"*. */
export const DEVOTION_TRIP = 50;

/** Strop denného ťukania + krmenia na človeka. Dobrý skutok, výlet, krst a DOG ID idú MIMO. */
export const DEVOTION_DAY_CAP = 150;

/** Séria — míľniky dní po sebe (raz za každú sériu). */
export const DEVOTION_STREAK = { 7: 50, 30: 200, 100: 500, 365: 1000 } as const;

export const DEVOTION_ONCE = {
  baptism: 50,      // krst heroglyfom — za každého zaplateného psa (aj spätne)
  dogid_full: 30,   // DOG ID na 100 % — raz za psa
  scroll_read: 20,  // prečítaný zvitok VAULTU — raz za zvitok, najviac 3 za deň
} as const;

/** Krmenie — pripisuje sa SAMO každý deň podľa stravy psa (`dogs.diet`). */
export const DEVOTION_FEED = { kibble: 3, barf: 10 } as const;   // Matej 23. 10.: granule 3 · BARF 10
