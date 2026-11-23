// ČO STAVIAME — diely (balík 4, 23. 11. 2026): plán ako príspevok vo feede, pripomienka vo feede, hlavička detailu,
// riadok zoznamu. Dáta a pravidlá → `viziaData.ts`. Autor všetkých plánov je AINUBIS (hovorca, lock FEED 26. 10.).
import { useEffect, useState } from 'react';
import { useLang, useT } from '@/i18n/LanguageContext';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LikeMark, CommentMark, SysIcon } from '@/components/pack/SysIcon';
import { toggleMark } from '@/components/pack/story/storyData';
import { fetchPostSocial, type PostSocial } from '@/components/pack/profile/mePosts';
import { agoLabel } from '@/components/pack/feed/feedData';
import { AiHead } from '@/components/pack/feed/FeedAinubis';
import { intlLocale } from '@/i18n/bcp47';
import ainubisHead from '@/assets/ainubis-head.webp';
import { APP_NEW } from '@/lib/packFlags';
import { AI_LOGO } from '@/components/pack/ainubis/3d/zaklad';
import { VIZIA_ICON, type ViziaRow } from './viziaData';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

/** Avatar AINUBISA (tá istá kresba ako v hlavičke jeho príspevkov). */
export const AI_AVATAR = APP_NEW ? AI_LOGO : ainubisHead;

export const VIZIA_CSS = `
.vz-pill{font:600 ${TX.label}px/1.2 ${FONT_UI};letter-spacing:.02em;padding:${S.xs}px ${S.md}px;}
.vz-ico{display:block;flex:none;width:56px;height:56px;object-fit:contain;}
.vz-ico.lg{width:96px;height:96px;}
/* PLÁN VO FEEDE — príspevok AINUBISA na papyruse: hlavička ako pri členovi, telo = ikonka + názov + text. */
.vz-who b{display:block;font-family:${FONT_UI};font-weight:400;font-size:${TX.body}px;line-height:1.2;letter-spacing:.26em;color:${T.inkStrong};}
.vz-who b .ai{font-weight:600;}
.vz-body{display:flex;gap:${S.md}px;align-items:flex-start;padding:0 ${S.md}px;cursor:pointer;}
.vz-body .tx{min-width:0;flex:1;display:flex;flex-direction:column;gap:${S.sm}px;align-items:flex-start;}
.vz-body h3{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;line-height:1.25;letter-spacing:.02em;color:${T.inkStrong};overflow-wrap:anywhere;} /* písmo: nadpis */
.vz-body p{margin:0;font-size:${TX.body}px;line-height:1.45;color:${T.inkStrong};display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.vz-newrow{display:flex;gap:${S.md}px;align-items:center;}
.vz-pills{display:flex;flex-wrap:wrap;gap:${S.xs}px;}
/* HLAVIČKA DETAILU (miesto fotiek v PostViewer) */
.vz-lead{display:flex;flex-direction:column;align-items:center;gap:${S.sm}px;padding:${S.lg}px ${S.lg}px ${S.sm}px;text-align:center;background:${T.tileBg};}
.vz-lead h2{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.h2}px;line-height:1.2;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: nadpis */
.vz-lead .vz-pills{justify-content:center;}
.vz-dogma{margin:${S.xs}px 0 0;padding:${S.sm}px ${S.md}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.cardEdge};background:${T.card};font-size:${TX.label}px;line-height:1.4;color:${T.inkWarm};text-align:left;}
.vz-dogma b{display:block;font-size:${TX.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};margin-bottom:${S.xs}px;}
/* RIADOK ZOZNAMU „ČO STAVIAME“ */
.vz-row{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:${S.md}px;width:100%;padding:${S.sm}px ${S.md}px ${S.sm}px ${S.sm}px;
  background:${T.tileBg};border:1px solid ${T.border};border-radius:${PACK_R.tile}px;color:${T.inkStrong};font-family:${FONT_UI};}
.vz-row:focus-visible{outline:2px solid ${T.accentGold};outline-offset:2px;}
.vz-row .nm{min-width:0;flex:1;display:flex;flex-direction:column;gap:${S.xs}px;align-items:flex-start;}
.vz-row .nm b{font-family:${FONT_TITLE};font-weight:700;font-size:${TX.body}px;line-height:1.25;letter-spacing:.02em;overflow-wrap:anywhere;} /* písmo: nadpis */
.vz-cnt{flex:none;display:flex;align-items:center;gap:${S.md}px;font:600 ${TX.label}px/1 ${FONT_UI};}
.vz-cnt span{display:inline-flex;align-items:center;gap:${S.xs}px;}
`;

/** Text plánu v jazyku appky; kým preklad chýba, ide anglický originál z DB (`posts.body`). */
export function useViziaText(r: ViziaRow) {
  const t = useT();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  const { lang } = useLang();
  return {
    name: tx(`pack.vizia.${r.id}.name`, r.id),
    text: tx(`pack.vizia.${r.id}.text`, r.body),
    dogma: tx(`pack.vizia.${r.id}.dogma`, ''),
    stage: tx(`pack.vizia.stage.${r.stage}`, ['', 'Dreaming', 'Preparing', 'Building'][r.stage]),
    at: tx('pack.vizia.at', 'at {n} dogs').replace('{n}', r.milestone.toLocaleString(intlLocale(lang))),
    tx,
  };
}

/** Stav + míľnik ako dve štítkové pilulky (neklikateľné). */
export function ViziaPills({ r }: { r: ViziaRow }) {
  const x = useViziaText(r);
  return (
    <span className="vz-pills">
      <span className="pk-pill vz-pill">{x.stage}</span>
      <span className="pk-pill vz-pill">{x.at}</span>
    </span>
  );
}

const AiName = () => <><span className="ai">AI</span>NUBIS</>;

/** Hlavička detailu: ikonka namiesto fotky, názov, stav, DOGMA. Text a komentáre nesie `PostViewer` pod ňou. */
export function ViziaLead({ r }: { r: ViziaRow }) {
  const x = useViziaText(r);
  return (
    <div className="vz-lead">
      <img className="vz-ico lg" src={VIZIA_ICON[r.id]} alt="" draggable={false} />
      <h2>{x.name}</h2>
      <ViziaPills r={r} />
      {x.dogma && <p className="vz-dogma"><b>{x.tx('pack.vizia.dogma', 'DOGMA')}</b>{x.dogma}</p>}
    </div>
  );
}

/** Počty ❤️ a 💬 v riadku zoznamu (hodnoty z `list_vizia_posts`, obnovia sa po návrate z detailu). */
export function ViziaRowButton({ r, onOpen }: { r: ViziaRow; onOpen: () => void }) {
  const x = useViziaText(r);
  return (
    <button type="button" className="vz-row" onClick={onOpen}>
      <img className="vz-ico" src={VIZIA_ICON[r.id]} alt="" draggable={false} loading="lazy" />
      <span className="nm"><b>{x.name}</b><span className="pk-pill vz-pill">{x.stage}</span></span>
      <span className="vz-cnt">
        <span><LikeMark on={r.liked} n={r.likes} />{r.likes}</span>
        <span><CommentMark n={r.comments} />{r.comments}</span>
      </span>
    </button>
  );
}

/** PLÁN AKO PRÍSPEVOK VO FEEDE. Rovnaká kostra ako `FeedPostCard` (hlavička, akcie), telo je ikonka + text plánu. */
export function FeedViziaCard({ r, onOpen }: { r: ViziaRow; onOpen: () => void }) {
  const t = useT();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  const { lang } = useLang();
  const x = useViziaText(r);
  const [soc, setSoc] = useState<PostSocial>({ likes: r.likes, comments: r.comments, liked: r.liked, saved: false, saves: 0 });
  useEffect(() => { void fetchPostSocial(r.postId).then(setSoc).catch(() => {}); }, [r.postId]);
  const like = async () => {
    const on = !soc.liked;
    setSoc((s) => ({ ...s, liked: on, likes: Math.max(0, s.likes + (on ? 1 : -1)) }));
    const got = await toggleMark(r.postId, 'like', on);
    if (got !== on) setSoc((s) => ({ ...s, liked: got, likes: Math.max(0, s.likes + (got ? 1 : -1)) }));
  };
  return (
    <article className="pfp">
      <div className="pfp-head">
        <span className="pk-medallion"><img src={AI_AVATAR} alt="" /></span>
        <div className="pfp-who vz-who">
          <b><AiName /></b>
          <small>{[tx('pack.vizia.title', 'What we are building'), agoLabel(Date.parse(r.createdAt), lang)].filter(Boolean).join(' · ')}</small>
        </div>
      </div>
      <div className="vz-body" onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}>
        <img className="vz-ico lg" src={VIZIA_ICON[r.id]} alt="" draggable={false} loading="lazy" />
        <div className="tx">
          <h3>{x.name}</h3>
          <ViziaPills r={r} />
          <p>{x.text}</p>
        </div>
      </div>
      <div className="pfp-acts">
        <button type="button" className={soc.likes > 0 || soc.liked ? undefined : 'fd'} onClick={like} aria-pressed={soc.liked} aria-label={tx('pack.feed.act.like', 'Like')}>
          <LikeMark on={soc.liked} n={soc.likes} />{soc.likes > 0 && soc.likes}
        </button>
        <button type="button" className={soc.comments > 0 ? undefined : 'fd'} onClick={onOpen} aria-label={tx('pack.post.comment', 'Comment')}>
          <CommentMark n={soc.comments} />{soc.comments > 0 && soc.comments}
        </button>
      </div>
      {soc.comments > 0
        ? <button type="button" className="pfp-cm" onClick={onOpen}>{tx('pack.feed.comments', 'View {n} comments').replace('{n}', String(soc.comments))}</button>
        : <div style={{ height: S.md }} />}
    </article>
  );
}

/** PRIPOMIENKA VO FEEDE (voľba b): nový alebo zmenený plán, kým si človek neotvorí „Čo staviame“. Tmavý šat AINUBISA. */
export function FeedViziaNew({ r, changed, onOpenAll, onHide }: { r: ViziaRow; changed: boolean; onOpenAll: () => void; onHide: () => void }) {
  const x = useViziaText(r);
  return (
    <article className="fai">
      <button type="button" className="fai-x" onClick={onHide} aria-label={x.tx('pack.vizia.feed.hide', 'Hide')}><SysIcon name="krizik" size={24} /></button>
      <AiHead sub={changed ? x.tx('pack.vizia.feed.changed', 'Plan updated') : x.tx('pack.vizia.feed.new', 'New plan')} />
      <div className="fai-b">
        <div className="vz-newrow">
          <img className="vz-ico" src={VIZIA_ICON[r.id]} alt="" draggable={false} />
          <h3>{x.name}</h3>
        </div>
        <p className="cut">{x.text}</p>
        <button type="button" className="fai-cta" onClick={onOpenAll}>{x.tx('pack.vizia.feed.all', 'All plans')}</button>
      </div>
    </article>
  );
}
