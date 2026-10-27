// TÉMY FEEDU — výber témy nad príspevkami (FEED 2 krok 5, štítky `postTags.ts`).
//
// Matej 26. 10. 2026, kolo 5 → 6: z troch návrhov (kruhy · obrazové dlaždice · lepiaca lišta) *„kruhy sú super — ale
// musíme ich urobiť krajšie, práve im môžme urobiť príbehové okraje žlto-modré a do vnútra použiť iné ikonky"*.
// Okrúhle TLAČIDLO, nie MEDAILÓN (lock pack-dizajn-system: medailón je len fotka a identita).
// Prstenec = zlato → lapis ako príbeh na IG; vybraná téma = hrubší lapisový prstenec + lapisový tint vnútri.
// Ikonky naklikal Matej z hand-drawn sady (nákres `plany/nakres-feed-2026-10-26/temy-ikony/`, okraj A), labka NIE —
// *„tú používame furt a je aj na obrazovke"*.
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_UI, PAPER_BG } from '@/components/pack/packTheme';
import type { CSSProperties } from 'react';
import { POST_TAGS } from './postTags';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

/** Príbehový prstenec = BRANDOVÝ modro-zlatý gradient z `index.css` (heroflow, HeroCard), nie vlastný mix
 *  (lekcia 13. 10.: „myslel som gradient, ktorý používame v apke… nie že si vymyslíš"). */
//  Matej chce „žlto-modré" ⇒ zapísaná alternatíva brandu „A · čistá diagonála" (`index.css`, pri `--brand-gradient`):
//  Egyptská modrá → zlatá bez čiernej. Plný `--brand-gradient` (cez čiernu) je v nákrese ako druhá možnosť.
const STORY_RING = 'linear-gradient(135deg, #1034A6 0%, #C99A3F 100%)';

/** Zrnitosť pieskovca — šum ako data URI (žiadny ďalší súbor na stiahnutie). */
const STONE_GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0"/></filter><rect width="120" height="120" filter="url(#n)"/></svg>')}")`;

export const FEED_TOPICS_CSS = `
.pkf-th{margin:0 0 ${S.sm}px;font:500 ${TX.micro}px/1.2 ${FONT_UI};letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${T.inkWarm};}
.pkf-tags{display:flex;gap:${S.sm}px;overflow-x:auto;scrollbar-width:none;margin:-${S.md}px -${S.lg}px;padding:${S.xl}px ${S.lg}px;
  scroll-snap-type:x proximity;scroll-padding-inline:${S.lg}px;}
.pkf-tags::-webkit-scrollbar{display:none;}
.pkt-a{flex:none;width:80px;display:flex;flex-direction:column;align-items:center;gap:${S.sm}px;padding:0;border:0;background:none;cursor:pointer;
  scroll-snap-align:start;color:${T.inkStrong};font:600 ${TX.micro}px/1.25 ${FONT_UI};text-align:center;}
.pkt-a .pkt-ring{display:block;width:72px;height:72px;border-radius:${PACK_R.pill}px;padding:${S.xs}px;background:${STORY_RING};
  transition:transform .25s ease,box-shadow .3s ease,background .3s ease;}
.pkt-a .pkt-ring i{position:relative;display:block;width:100%;height:100%;box-sizing:border-box;border-radius:${PACK_R.pill}px;border:2px solid ${PAPER_BG};overflow:hidden;
  /* zahĺbenie = tmavší okraj hore, svetlý dole (prechod, nie tieň: je to reliéf kameňa, nie výška bloku) */
  background:radial-gradient(circle at 50% 62%,transparent 58%,rgba(60,38,10,.38) 100%),${STONE_GRAIN},
    radial-gradient(circle at 32% 28%,#F6ECD6 0%,#E4D2AE 55%,#CDB487 100%);background-size:cover,120px,cover;}
.pkt-g{position:absolute;inset:0;margin:auto;width:34px;height:34px;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat;}
.pkt-g.hi{background:rgba(255,248,232,.85);transform:translateY(1.2px);}
.pkt-g.lo{background:rgba(30,18,4,.75);transform:translateY(-.8px);}
.pkt-g.base{background:linear-gradient(180deg,#3A2A16,#5E4626);}
.pkt-g.pig{background:linear-gradient(180deg,color-mix(in srgb,var(--pg) 70%,#000),var(--pg));opacity:0;}
.pkt-a:active .pkt-ring{transform:scale(.92);}
.pkt-a.on .pkt-ring{background:var(--pg);transform:scale(1.08);
  box-shadow:0 0 0 2px ${PAPER_BG},0 0 0 5px var(--pg),0 0 18px 6px color-mix(in srgb,var(--pg) 55%,transparent);animation:pkt-halo 1.1s ease-out;}
.pkt-a.on .pkt-g.pig{opacity:1;animation:pkt-pour .7s cubic-bezier(.3,.7,.3,1) both;}
.pkt-a.on b{color:var(--pg);}
.pkt-a b{font-weight:600;min-height:2.5em;transition:color .3s;}
@keyframes pkt-pour{from{clip-path:inset(100% 0 0 0);}to{clip-path:inset(0 0 0 0);}}
@keyframes pkt-halo{0%{box-shadow:0 0 0 2px ${PAPER_BG},0 0 0 5px var(--pg),0 0 0 0 color-mix(in srgb,var(--pg) 80%,transparent);}
  50%{box-shadow:0 0 0 2px ${PAPER_BG},0 0 0 5px var(--pg),0 0 24px 8px color-mix(in srgb,var(--pg) 60%,transparent);}}
@media (prefers-reduced-motion:reduce){.pkt-a.on .pkt-ring,.pkt-a.on .pkt-g.pig{animation:none;}}
`;

/** „Všetko" = Horovo oko (Matej naklikal 26. 10. 2026; labka nie — „tú používame furt"). */
const ALL = { tag: '', i18n: 'pack.feed.tag.all', fallback: 'All', icon: 'eye', color: '#A3782B' };

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
          <button key={d.icon + d.tag} type="button" className={`pkt-a${isOn(d.tag) ? ' on' : ''}`} aria-pressed={isOn(d.tag)} onClick={() => pick(d.tag)}
            style={{ '--ic': `url('/icons/pack/${d.icon}.svg')`, '--pg': d.color } as CSSProperties}>
            <span className="pkt-ring"><i><s className="pkt-g hi" /><s className="pkt-g lo" /><s className="pkt-g base" /><s className="pkt-g pig" /></i></span><b>{tx(d.i18n, d.fallback)}</b>
          </button>
        ))}
      </div>
    </section>
  );
}
