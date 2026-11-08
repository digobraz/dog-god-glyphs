// MAPOVÉ SAMOLEPKY — vlastné značky namiesto emoji (Matej 8. 11. 2026, `plany/locky/brand.md` §RÁD IKONIEK).
// Príroda a turistika = ostrovček, miesta a služby = lapis a zlato, vždy dvojitý lem.
// Zatiaľ len testovací kanál. Na web pre členov pôjde až na Matejovo slovo.
import { TEST_BUILD } from '@/lib/env';

export const MAP_STICKERS_ON = TEST_BUILD;

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
};

/** Cesta k samolepke typu bodu, alebo null, keď má ostať emoji. */
export const stickerSrc = (t: string): string | null =>
  MAP_STICKERS_ON && STICKER_FILE[t] ? `/map-marks/${STICKER_FILE[t]}.webp` : null;

export const stickerImg = (src: string, extra = ''): string =>
  `<img class="mk-sticker${extra}" src="${src}" alt="" draggable="false">`;
