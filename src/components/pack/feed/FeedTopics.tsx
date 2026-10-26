// TÉMY FEEDU — výber témy nad príspevkami (FEED 2 krok 5, štítky `postTags.ts`).
//
// Matej 26. 10. 2026, kolo 5 → 6: z troch návrhov (kruhy · obrazové dlaždice · lepiaca lišta) *„kruhy sú super — ale
// musíme ich urobiť krajšie, práve im môžme urobiť príbehové okraje žlto-modré a do vnútra použiť iné ikonky"*.
// Okrúhle TLAČIDLO, nie MEDAILÓN (lock pack-dizajn-system: medailón je len fotka a identita).
// Prstenec = zlato → lapis ako príbeh na IG; vybraná téma = hrubší lapisový prstenec + lapisový tint vnútri.
// Ikonky vyberá Matej z hand-drawn sady (nákres `plany/nakres-feed-2026-10-26/temy-ikony/`), labka NIE —
// *„tú používame furt a je aj na obrazovke"*.
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_UI, PAPER_BG } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { POST_TAGS } from './postTags';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

/** Príbehový prstenec = BRANDOVÝ modro-zlatý gradient z `index.css` (heroflow, HeroCard), nie vlastný mix
 *  (lekcia 13. 10.: „myslel som gradient, ktorý používame v apke… nie že si vymyslíš"). */
//  Matej chce „žlto-modré" ⇒ zapísaná alternatíva brandu „A · čistá diagonála" (`index.css`, pri `--brand-gradient`):
//  Egyptská modrá → zlatá bez čiernej. Plný `--brand-gradient` (cez čiernu) je v nákrese ako druhá možnosť.
const STORY_RING = 'linear-gradient(135deg, #1034A6 0%, #C99A3F 100%)';

export const FEED_TOPICS_CSS = `
.pkf-th{margin:0 0 ${S.sm}px;font:500 ${TX.micro}px/1.2 ${FONT_UI};letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${T.inkWarm};}
.pkf-tags{display:flex;gap:${S.sm}px;overflow-x:auto;scrollbar-width:none;margin:0 -${S.lg}px;padding:${S.xs}px ${S.lg}px;
  scroll-snap-type:x proximity;scroll-padding-inline:${S.lg}px;}
.pkf-tags::-webkit-scrollbar{display:none;}
.pkt-a{flex:none;width:80px;display:flex;flex-direction:column;align-items:center;gap:${S.sm}px;padding:0;border:0;background:none;cursor:pointer;
  scroll-snap-align:start;color:${T.inkStrong};font:600 ${TX.micro}px/1.25 ${FONT_UI};text-align:center;}
.pkt-a .pkt-ring{display:block;width:72px;height:72px;border-radius:${PACK_R.pill}px;padding:${S.xs}px;background:${STORY_RING};transition:transform .12s ease;}
.pkt-a .pkt-ring i{display:grid;place-items:center;width:100%;height:100%;border-radius:${PACK_R.pill}px;background:${PAPER_BG};border:2px solid ${PAPER_BG};}
.pkt-a:active .pkt-ring{transform:scale(.92);}
.pkt-a.on .pkt-ring{background:${LAPIS.grad};box-shadow:0 0 0 2px ${PAPER_BG},0 0 0 4px ${LAPIS.edge};}
/* Výber: vnútro ostáva papyrus s jemným lapisovým tintom (priesvitný tint by odhalil plný prstenec pod sebou). */
.pkt-a.on .pkt-ring i{background:linear-gradient(rgba(22,48,122,.14),rgba(22,48,122,.14)),${PAPER_BG};}
.pkt-a.on b{color:${LAPIS.edge};}
.pkt-a b{font-weight:600;min-height:2.5em;}
`;

/** „Všetko" — ikonku vyberie Matej (labka nie). Dovtedy slnko-hviezda, ktorú feed inde nepoužíva. */
const ALL = { tag: '', i18n: 'pack.feed.tag.all', fallback: 'All', icon: 'star-six' };

export function FeedTopics({ topic, onTopic }: { topic: string | null; onTopic: (t: string | null) => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const isOn = (tag: string) => (tag ? topic === tag : topic === null);
  const pick = (tag: string) => onTopic(tag ? (topic === tag ? null : tag) : null);
  const aria = tx('pack.feed.tag.filter', 'Topics');
  return (
    <section>
      <h2 className="pkf-th">{aria}</h2>
      <div className="pkf-tags" role="group" aria-label={aria}>
        {[ALL, ...POST_TAGS].map((d) => (
          <button key={d.icon + d.tag} type="button" className={`pkt-a${isOn(d.tag) ? ' on' : ''}`} aria-pressed={isOn(d.tag)} onClick={() => pick(d.tag)}>
            <span className="pkt-ring"><i><BrandIcon name={d.icon} size={32} tint="dark" /></i></span><b>{tx(d.i18n, d.fallback)}</b>
          </button>
        ))}
      </div>
    </section>
  );
}
