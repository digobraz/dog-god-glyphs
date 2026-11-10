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
};

/** Cesta k samolepke typu bodu, alebo null, keď má ostať emoji. */
export const stickerSrc = (t: string): string | null =>
  MAP_STICKERS_ON && STICKER_FILE[t] ? `/map-marks/${STICKER_FILE[t]}.webp` : null;

export const stickerImg = (src: string, extra = ''): string =>
  `<img class="mk-sticker${extra}" src="${src}" alt="" draggable="false">`;
