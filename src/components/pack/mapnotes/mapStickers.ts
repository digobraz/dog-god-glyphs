// MAPOVÉ SAMOLEPKY — vlastné značky namiesto emoji (Matej 8. 11. 2026, `plany/locky/brand.md` §RÁD IKONIEK).
// Príroda a turistika = ostrovček, miesta a služby = lapis a zlato, vždy dvojitý lem.
// Zatiaľ len appka (APP_NEW). Na web pre členov pôjde až na Matejovo slovo.
import { APP_NEW } from '@/lib/packFlags';

export const MAP_STICKERS_ON = APP_NEW;

const STICKER_FILE: Record<string, string> = {
  spring: 'pramen',
  viewpoint: 'vyhliadka',
  shelter: 'pristresok',
  bench: 'lavicka',
  saddle: 'sedlo',
  waterfall: 'vodopad',
  cave: 'jaskyna',
  tower: 'veza',
  firepit: 'ohnisko',
  cliff: 'skala',
  sleep_hut: 'utulna',
  sleep_camp: 'kemp',
  sleep_bivak: 'bivak',
  castle: 'hrad',
  trip_target: 'cil',
  trip_flag: 'vylet',
  // Druh vodnej plochy, určuje ho waterPlaces.ts.
  water_jazero: 'jazero',
  water_priehrada: 'priehrada',
  water_rybnik: 'rybnik',
  wish_target: 'tripwish',
  // Zápisy svorky (Matej 10. 11. 2026: „upozornenia sú v starej grafike - vretenice... oprav!"). Výstraha =
  // červený kruh s kresbou, výbery z továrne (`mapa-*`).
  note_ticks: 'kliest',
  note_ticks_sick: 'kliest-nakazeny',
  note_wildlife: 'zver',
  note_viper: 'had',
  note_bear: 'medved',
  note_sheepdog: 'ovciarsky',
  note_ladders: 'rebriky',
  note_algae: 'sinice',
  note_noentry: 'zakaz',
  note_hazard: 'nebezpecenstvo',
  note_poison: 'otrava',   // mäso s lebkou v ráme výstrah (Matej 21. 11. 2026: „asi tá lebka“)
  note_abuse: 'sos',   // týranie = slovné SOS ako signál stroskotancov (Matej 21. 11. 2026), žiara v circleMark.ts
  note_note: 'komentar',
  note_parking: 'parking',
  note_cablecar: 'lanovka',
  note_water: 'pramen',
  note_viewpoint: 'vyhliadka',
  note_unique: 'unikat',   // UNIKÁT = diamant (Matej 22. 11. 2026, 23. 11.: „diamant bude vyslovene nejaký unikát, nie tip“)
};

// PARKOVISKO (Matej 23. 11. 2026, 3. kolo): VŽDY modrý blok. Zdarma = biele P, platené = žlté P na modrom.
// „Vhodné na kemping" = červený karavan cez pravý dolný roh P (nákres `plany/nakresy/parkovisko-camping-2026-11-23`).
// Žltý blok, zelená nula, minca a malé karavany sú ZAMIETNUTÉ — nevracať.
const PARKING_PAID_FILE = 'parking-platene';
const CARAVAN_FILE = 'karavan';

/** Samolepka parkoviska podľa ceny. `null` (cena neznáma, staré zápisy) = modré P ako zdarma. */
export const parkingStickerSrc = (paid: boolean | null | undefined): string | null =>
  MAP_STICKERS_ON ? `/map-marks/${paid ? PARKING_PAID_FILE : 'parking'}.webp` : null;

export const caravanStickerSrc = (): string => `/map-marks/${CARAVAN_FILE}.webp`;

/** Parkovisko ako jedna značka: P (+ karavan, keď je vhodné na kemping). Rovnaký obal ako `stickerImg`. */
export const parkingStickerHtml = (paid: boolean | null | undefined, overnight: boolean, extra = '', px?: number): string => {
  const src = parkingStickerSrc(paid);
  if (!src) return '';
  if (!overnight) return stickerImg(src, extra, px);
  return `<span class="mk-sticker mk-park${extra}"${px ? ` style="width:${px}px;height:${px}px"` : ''}>` +
    `<img class="mk-park-p" src="${src}" alt="" draggable="false">` +
    `<img class="mk-park-van" src="${caravanStickerSrc()}" alt="" draggable="false"></span>`;
};

/** Cesta k samolepke typu bodu, alebo null, keď má ostať emoji. */
export const stickerSrc = (t: string): string | null =>
  MAP_STICKERS_ON && STICKER_FILE[t] ? `/map-marks/${STICKER_FILE[t]}.webp` : null;

/** `px` = veľkosť podľa zoomu (Matej 10. 11. 2026, nákres `plany/nakresy/mapa-zoom-2026-11-10`); bez neho platí CSS `STICKER_PX`. */
export const stickerImg = (src: string, extra = '', px?: number): string =>
  `<img class="mk-sticker${extra}" src="${src}" alt="" draggable="false"${px ? ` style="width:${px}px;height:${px}px"` : ''}>`;

/** Bod zo sveta (prameň, útulňa…) podľa zoomu: hlavná mapa ich ukazuje od z15, článok výletu od z13. */
/** Samolepka zápisu svorky pre zoznamy, bubliny a karty — tá istá ako na mape (kliešť s chorobou má vlastnú). */
export const noteStickerSrc = (kind: string, disease?: unknown, paid?: boolean | null): string | null =>
  kind === 'parking' && paid ? parkingStickerSrc(true) : stickerSrc(kind === 'ticks' && disease ? 'note_ticks_sick' : `note_${kind}`);

/** Zápis svorky na mape: o kus väčší než bod zo sveta, lebo za ním stojí človek. */
export const NOTE_STICKER_PX = 40;

export const poiStickerPx = (z: number): number => (z >= 17 ? 52 : z >= 16 ? 46 : z >= 15 ? 40 : 36);
