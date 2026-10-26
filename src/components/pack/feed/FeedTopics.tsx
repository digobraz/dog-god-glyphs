// TÉMY FEEDU — výber témy nad príspevkami (FEED 2 krok 5, štítky `postTags.ts`).
//
// Matej 26. 10. 2026, kolo 5: *„tie témy sú už lepšie, ale ešte viac by som ich zvýraznil — daj mi návrhy"*.
// Tri návrhy vedľa dnešných dlaždíc, prepínané `?temy=a|b|c` (len na porovnanie snímok; bez parametra = dnes):
//   · A KRUHY — okrúhle tlačidlá so zlatým prstencom ako zvýraznené príbehy na IG, výber = lapisový prstenec
//     (okrúhle TLAČIDLO, nie MEDAILÓN — lock pack-dizajn-system: medailón je len fotka a identita)
//   · B OBRAZOVÉ DLAŽDICE — každá téma má obraz zo skutočného obsahu (výlet, zvitok, výjav citátu) a počet kusov
//   · C LEPIACA LIŠTA — väčšie pilulky, ktoré pri scrollovaní ostanú prilepené pod hlavičkou
// Po Matejovom výbere ostane jeden tvar a zvyšok sa zmaže.
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, PACK_TOPROW, FONT_UI, PAPER_BG, BRAND_GOLD_BTN } from '@/components/pack/packTheme';
import { LAPIS, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { sizedUrl } from '@/services/cloudinaryService';
import { POST_TAGS } from './postTags';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

export type TopicVariant = 'dnes' | 'a' | 'b' | 'c';
export const topicVariant = (v: string | null): TopicVariant => (v === 'a' || v === 'b' || v === 'c' ? v : 'dnes');

export const FEED_TOPICS_CSS = `
.pkf-th{margin:0 0 ${S.sm}px;font:500 ${TX.micro}px/1.2 ${FONT_UI};letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${T.inkWarm};}
.pkf-tags{display:flex;gap:${S.sm}px;overflow-x:auto;scrollbar-width:none;margin:0 -${S.lg}px;padding:0 ${S.lg}px ${S.xs}px;scroll-snap-type:x proximity;}
.pkf-tags::-webkit-scrollbar{display:none;}

/* DNES — dlaždica s ikonou */
.pkf-tag{flex:none;width:88px;display:flex;flex-direction:column;align-items:center;gap:${S.sm}px;padding:${S.md}px ${S.xs}px ${S.sm}px;cursor:pointer;
  border-radius:${PACK_R.tile}px;border:1.5px solid ${T.border};background:${T.card};color:${T.inkStrong};scroll-snap-align:start;
  font-family:${FONT_UI};font-weight:500;font-size:${TX.micro}px;line-height:1.25;text-align:center;transition:transform .12s ease;}
.pkf-tag:active{transform:scale(.94);}
.pkf-tag .ic{width:48px;height:48px;border-radius:${PACK_R.pill}px;display:grid;place-items:center;background:${PAPER_BG};border:1px solid ${T.hairline};}
.pkf-tag span:last-child{min-height:2.5em;display:flex;align-items:center;}
.pkf-tag.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
.pkf-tag.on .ic{border-color:${LAPIS.edge};}

/* A — KRUHY */
.pkt-a{flex:none;width:80px;margin-top:${S.xs}px;display:flex;flex-direction:column;align-items:center;gap:${S.sm}px;padding:0;border:0;background:none;cursor:pointer;
  scroll-snap-align:start;color:${T.inkStrong};font:600 ${TX.micro}px/1.25 ${FONT_UI};text-align:center;}
.pkt-a .pkt-ring{display:block;width:72px;height:72px;border-radius:${PACK_R.pill}px;padding:${S.xs}px;background:${BRAND_GOLD_BTN.grad};transition:transform .12s ease;}
.pkt-a .pkt-ring i{display:grid;place-items:center;width:100%;height:100%;border-radius:${PACK_R.pill}px;background:${PAPER_BG};}
.pkt-a:active .pkt-ring{transform:scale(.92);}
.pkt-a.on .pkt-ring{background:${LAPIS.grad};}
/* Výber: prstenec lapis, vnútro ostáva papyrus s jemným lapisovým tintom (priesvitný tint by odhalil plný prstenec pod sebou). */
.pkt-a.on .pkt-ring i{background:linear-gradient(rgba(22,48,122,.14),rgba(22,48,122,.14)),${PAPER_BG};}
.pkt-a.on b{color:${LAPIS.edge};}
.pkt-a b{font-weight:600;min-height:2.5em;}

/* B — OBRAZOVÉ DLAŽDICE */
.pkt-b{position:relative;flex:none;width:128px;height:168px;overflow:hidden;cursor:pointer;scroll-snap-align:start;padding:0;text-align:left;
  border-radius:${PACK_R.tile}px;border:1.5px solid ${T.cardEdge};background:${T.tileBg} center/cover no-repeat;transition:transform .12s ease;}
.pkt-b:active{transform:scale(.95);}
.pkt-b::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05) 30%,rgba(0,0,0,.78) 100%);}
.pkt-b .ic{position:absolute;left:${S.sm}px;top:${S.sm}px;z-index:1;width:32px;height:32px;border-radius:${PACK_R.pill}px;display:grid;place-items:center;
  background:rgba(0,0,0,.45);}
.pkt-b .n{position:absolute;right:${S.sm}px;top:${S.sm}px;z-index:1;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;background:rgba(0,0,0,.45);
  color:${T.onDark};font:600 ${TX.micro}px/1 ${FONT_UI};}
.pkt-b b{position:absolute;left:${S.sm}px;right:${S.sm}px;bottom:${S.sm}px;z-index:1;color:${T.onDark};font:600 ${TX.body}px/1.25 ${FONT_UI};}
.pkt-b.on{border-color:${LAPIS.edge};outline:3px solid ${LAPIS.edge};outline-offset:-1px;}

/* C — LEPIACA LIŠTA */
.pkt-cbar{position:sticky;z-index:20;top:calc(env(safe-area-inset-top, 0px) + ${PACK_TOPROW.content}px);margin:0 -${S.lg}px;padding:${S.sm}px 0;
  background:${PAPER_BG};border-bottom:1px solid ${T.hairline};}
.pkt-cbar .pkf-tags{margin:0;}
.pkt-c{flex:none;display:inline-flex;align-items:center;gap:${S.sm}px;padding:${S.sm}px ${S.lg}px ${S.sm}px ${S.md}px;cursor:pointer;scroll-snap-align:start;
  border-radius:${PACK_R.pill}px;border:1.5px solid ${T.cardEdge};background:${T.cardGrad};color:${T.inkStrong};box-shadow:${T.cardShadow};
  font:600 ${TX.body}px/1 ${FONT_UI};white-space:nowrap;transition:transform .12s ease;}
.pkt-c:active{transform:scale(.95);}
.pkt-c.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}box-shadow:none;}
`;

/** Obraz a počet kusov témy pre návrh B — zo skutočného obsahu; čo obraz nemá, dostane výjav citátu. */
export interface TopicLook { img: string | null; n: number }

const ALL = { tag: '', i18n: 'pack.feed.tag.all', fallback: 'All', icon: 'paw' };

export function FeedTopics({ variant, topic, onTopic, looks }: {
  variant: TopicVariant;
  topic: string | null;
  onTopic: (t: string | null) => void;
  looks: Record<string, TopicLook>;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const list = [ALL, ...POST_TAGS];
  const isOn = (tag: string) => (tag ? topic === tag : topic === null);
  const pick = (tag: string) => onTopic(tag ? (topic === tag ? null : tag) : null);
  const label = (d: typeof ALL) => tx(d.i18n, d.fallback);
  const aria = tx('pack.feed.tag.filter', 'Topics');
  const head = <h2 className="pkf-th">{aria}</h2>;

  if (variant === 'a') return (
    <section>{head}
      <div className="pkf-tags" role="group" aria-label={aria}>
        {list.map((d) => (
          <button key={d.icon + d.tag} type="button" className={`pkt-a${isOn(d.tag) ? ' on' : ''}`} aria-pressed={isOn(d.tag)} onClick={() => pick(d.tag)}>
            <span className="pkt-ring"><i><BrandIcon name={d.icon} size={32} tint="dark" /></i></span><b>{label(d)}</b>
          </button>
        ))}
      </div>
    </section>
  );
  if (variant === 'b') return (
    <section>{head}
      <div className="pkf-tags" role="group" aria-label={aria}>
        {list.map((d) => {
          const lk = looks[d.tag || 'all'];
          const src = lk?.img ? (lk.img.startsWith('/') ? lk.img : sizedUrl(lk.img, 320)) : null;
          return (
            <button key={d.icon + d.tag} type="button" className={`pkt-b${isOn(d.tag) ? ' on' : ''}`} aria-pressed={isOn(d.tag)} onClick={() => pick(d.tag)}
              style={src ? { backgroundImage: `url(${src})` } : undefined}>
              <span className="ic"><BrandIcon name={d.icon} size={20} tint="white" /></span>
              {!!lk?.n && <span className="n">{lk.n}</span>}
              <b>{label(d)}</b>
            </button>
          );
        })}
      </div>
    </section>
  );
  if (variant === 'c') return (
    <div className="pkt-cbar">
      <div className="pkf-tags" role="group" aria-label={aria}>
        {list.map((d) => (
          <button key={d.icon + d.tag} type="button" className={`pkt-c${isOn(d.tag) ? ' on' : ''}`} aria-pressed={isOn(d.tag)} onClick={() => pick(d.tag)}>
            <BrandIcon name={d.icon} size={20} tint="dark" />{label(d)}
          </button>
        ))}
      </div>
    </div>
  );
  return (
    <section>{head}
      <div className="pkf-tags" role="group" aria-label={aria}>
        {list.map((d) => (
          <button key={d.icon + d.tag} type="button" className={`pkf-tag${isOn(d.tag) ? ' on' : ''}`} aria-pressed={isOn(d.tag)} onClick={() => pick(d.tag)}>
            <span className="ic"><BrandIcon name={d.icon} size={28} tint="dark" /></span><span>{label(d)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
