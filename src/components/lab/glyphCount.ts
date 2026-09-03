/**
 * KOĽKO RÔZNYCH HEROGLYFOV SA DÁ NAKRESLIŤ — dopočítané, nie napísané.
 *
 * Obraz o unikátnosti na `/onepage` stojí na tomto čísle. Také číslo je VÝPOČET,
 * nie copy: keby tu bolo zapísané natvrdo, po pridaní jediného patróna alebo
 * povahovej vlastnosti by stránka ticho klamala a nikto by si toho nevšimol.
 * Preto sa každý činiteľ číta zo ZDROJA, ktorý ten slot naozaj napĺňa — z tých
 * istých adresárov a z toho istého `breeds.json`, z ktorých kreslí
 * `HeroglyphFrame`.
 *
 * 🔴 KÁNON JE `reference_dogypt_heroglyf_kombinacny_priestor` (spočítaný
 * 31. 8. 2026 pri copy kole na `/heroglyph/why`) — DVANÁSŤ slotov, nie desať.
 * Prvá verzia tohto modulu (1. 9. 2026) vynechala „koľký pes je to u teba" a
 * povahovú dvojicu rátala ako neusporiadanú kombináciu; vyšlo z toho
 * 511 100 928, teda **stonásobne menej**. Kto sem siahne, nech najprv prečíta
 * tú pamäť — pri tomto čísle je ľahké si dosadiť vlastný predpoklad.
 *
 * ⚠️ `eager: false` je zámer: z globu sa berú LEN KĽÚČE (názvy súborov), takže
 * do bundlu nepribudne ani jeden bajt obrázka. Eager glob by ich vtiahol všetky.
 */
import breedsData from '@/data/breeds.json';

/** Počet súborov v adresári; `prefix` zúži na jednu rodinu v spoločnom priečinku. */
const files = (glob: Record<string, unknown>, prefix?: string) =>
  Object.keys(glob).filter((p) => !prefix || (p.split('/').pop() || '').startsWith(prefix)).length;

// ── VEĽKÝ RÁMIK (pes) ──────────────────────────────────────────────────────
const DOG_GENDER = files(import.meta.glob('@/assets/gender/*.svg'), 'GENDER-');
const COLOUR = files(import.meta.glob('@/assets/colour/*.svg'));
const FATE = files(import.meta.glob('@/assets/fate/*.svg'));
const BLOODLINE = files(import.meta.glob('@/assets/bloodline/*.svg'));
const CHARACTER = files(import.meta.glob('@/assets/character/*.svg'));

// ── MALÝ RÁMIK (majiteľ) ───────────────────────────────────────────────────
const OWNER_GENDER = files(import.meta.glob('@/assets/gender/*.svg'), 'OWNER_GENDER-');
const CHINESE = files(import.meta.glob('@/assets/chinese/*.svg'));
const ZODIAC = files(import.meta.glob('@/assets/zodiac/*.svg'));
const LETTER = files(import.meta.glob('@/assets/letters/*.svg'));

/**
 * 🔴 DVANÁSTY SLOT — „KOĽKÝ PES JE TO U TEBA" (1–50).
 * NIE JE to globálne poradové číslo psa (to „#43" zo steny a z kartičky) —
 * `RankingScreen` sa pýta *„Koľký pes je {dogName}?"*, tlačidlá dávajú 1–10
 * a vlastné číslo prijme 11–50. Je to teda údaj o MAJITEĽOVI.
 * Práve preto sa o heroglyfe NESMIE povedať „druhý taký nemôže vzniknúť":
 * keby v ňom globálne číslo bolo, zhoda by bola vylúčená konštrukciou. Nie je.
 */
const RANKING = 50;

/**
 * Silueta. 🔴 NERÁTA SA Z `public/patrons/` (tam ich leží 82) ale z počtu
 * RÔZNYCH patrónov dosiahnuteľných cez plemeno — tak sa silueta v toku
 * prideľuje (`BreedPatronScreen` ponúka plemená, nie patrónov). Súbor, ktorý
 * nemá plemeno, by číslo nafúkol o kombinácie, ku ktorým sa nikto nedostane.
 * Je to spodná hranica, a tá je tu správna strana omylu.
 */
const PATRON = new Set((breedsData as { breeds: { patron: string }[] }).breeds.map((b) => b.patron)).size;

/**
 * Povaha: DVE RÔZNE vlastnosti v DVOCH RÔZNYCH slotoch rámu.
 * `DogCharacterScreen.handleSelect` nedovolí tú istú vybrať dvakrát
 * (`prev.includes(value)` ju odoberie), a `HeroglyphFrame` kreslí
 * `dogCharacter1` a `dogCharacter2` na iné miesta ⇒ na poradí ZÁLEŽÍ.
 * Je to teda variácia bez opakovania: n × (n−1), nie n² a nie C(n,2).
 */
const CHARACTER_PAIRS = CHARACTER * (CHARACTER - 1);

/** Súčin všetkých dvanástich slotov. */
export const GLYPH_COMBINATIONS =
  DOG_GENDER * COLOUR * FATE * BLOODLINE * PATRON * CHARACTER_PAIRS *
  OWNER_GENDER * CHINESE * ZODIAC * LETTER * RANKING;

/** Rozpis pre ladenie — v UI sa nepoužíva, ale bez neho sa číslo nedá overiť. */
export const GLYPH_SLOTS = {
  DOG_GENDER, COLOUR, FATE, BLOODLINE, PATRON, CHARACTER, CHARACTER_PAIRS,
  OWNER_GENDER, CHINESE, ZODIAC, LETTER, RANKING,
} as const;
