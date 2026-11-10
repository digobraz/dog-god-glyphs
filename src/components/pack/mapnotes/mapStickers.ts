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
  note_note: 'komentar',
  note_parking: 'parking',
  note_cablecar: 'lanovka',
  note_water: 'pramen',
  note_viewpoint: 'vyhliadka',
};

/** Cesta k samolepke typu bodu, alebo null, keď má ostať emoji. */
export const stickerSrc = (t: string): string | null =>
  MAP_STICKERS_ON && STICKER_FILE[t] ? `/map-marks/${STICKER_FILE[t]}.webp` : null;

/** `px` = veľkosť podľa zoomu (Matej 10. 11. 2026, nákres `plany/nakresy/mapa-zoom-2026-11-10`); bez neho platí CSS `STICKER_PX`. */
export const stickerImg = (src: string, extra = '', px?: number): string =>
  `<img class="mk-sticker${extra}" src="${src}" alt="" draggable="false"${px ? ` style="width:${px}px;height:${px}px"` : ''}>`;

/** Bod zo sveta (prameň, útulňa…) podľa zoomu: hlavná mapa ich ukazuje od z15, článok výletu od z13. */
/** Samolepka zápisu svorky pre zoznamy, bubliny a karty — tá istá ako na mape (kliešť s chorobou má vlastnú). */
export const noteStickerSrc = (kind: string, disease?: unknown): string | null =>
  stickerSrc(kind === 'ticks' && disease ? 'note_ticks_sick' : `note_${kind}`);

/** Zápis svorky na mape: o kus väčší než bod zo sveta, lebo za ním stojí človek. */
export const NOTE_STICKER_PX = 40;

export const poiStickerPx = (z: number): number => (z >= 17 ? 52 : z >= 16 ? 46 : z >= 15 ? 40 : 36);
