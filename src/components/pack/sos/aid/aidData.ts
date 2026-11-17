// PRVÁ POMOC — výber jazyka obsahu. SK · EN · CS majú vlastný súbor, ostatné jazyky appky padajú na EN
// (ako `sosTexts.ts`). Obsah je v balíku appky, takže v natívnej appke funguje aj bez signálu.
import type { AidCard, AidGroup, AidLinks } from './aidTypes';
import { AID_SK, AID_LINKS_SK } from './aidSk';
import { AID_EN, AID_LINKS_EN } from './aidEn';
import { AID_CS, AID_LINKS_CS } from './aidCs';

export type { AidCard, AidGroup, AidLinks };

const BY_LANG: Record<string, { cards: AidCard[]; links: AidLinks }> = {
  sk: { cards: AID_SK, links: AID_LINKS_SK },
  en: { cards: AID_EN, links: AID_LINKS_EN },
  cs: { cards: AID_CS, links: AID_LINKS_CS },
};

export function aidContent(lang: string): { cards: AidCard[]; links: AidLinks } {
  return BY_LANG[lang] ?? BY_LANG.en;
}

export const AID_GROUPS: AidGroup[] = ['A', 'B', 'C', 'D'];

/** Ikonka dlaždice: univerzálny obväz z továrne (Matej 17. 11. 2026: „nie všade nové, skôr univerzál“),
 *  vlastnú dostali len karty, ktorých kresba v továrni už je. */
export const AID_ICON: Record<string, string> = { had: 'had', kliest: 'den-tick', poriadok: 'zdravie' };
export const AID_ICON_DEFAULT = 'sos-pomoc';
