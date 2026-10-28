// PRÍSPEVOK ČLENA VO FEEDE — FEED 2 (nákres blok 5). Uloženie sa riadi odpoveďou pri pridaní
// (Matej 26. 10. 2026: *„triplist ukladá výlety ktoré už v dogypte sú, tripwish sú len rýchle označenia napr.
// z príspevku, ktorý je len fotka výletu bez vytvoreného výletu"*):
//   · štítok `nature` (fotka z výletu / z prírody) ⇒ 🎯 TRIPWISH — `addWishPin` na miesto príspevku
//   · inak ⇒ ☆ do Uložených v profile — `post_marks` (kind `save`)
// Labka = `post_marks` (kind `like`), ten istý stav ako v `PostViewer`. Komentáre otvorí `PostViewer`.
//
// ⚠️ Dnes tu sú LEN MOJE príspevky: cudzí autor potrebuje RPC s menom a fotkou (zoznam migrácií).
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { linkify } from '@/components/ainubis/ainubisLinkify';
import { FollowChip, FOLLOW_CHIP_CSS } from '@/components/pack/profile/follow';
import { useLang, useT } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, PACK_AVATAR } from '@/components/pack/packTheme';
import { HandPaw, HandStar } from '@/components/pack/HandIcons';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { toggleMark } from '@/components/pack/story/storyData';
import { fetchPostSocial, isNature, type MePost, type PostSocial } from '@/components/pack/profile/mePosts';
import { addWishPin } from '@/components/pack/mapnotes/wishData';
import { createEmoji } from '@/components/pack/addtrip/AddTripEntry';
import { sizedUrl } from '@/services/cloudinaryService';
import { agoLabel, useSwipe } from './feedData';
import { PostMenu } from '@/components/pack/profile/PostMenu';
import { deletePost } from '@/components/pack/profile/mePosts';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

export const FEED_POST_CSS = `
${FOLLOW_CHIP_CSS}
.pfp-link{color:inherit;text-decoration:underline;word-break:break-all;}
.pfp{overflow:hidden;}
.pfp-head{display:flex;align-items:center;gap:${S.sm}px;padding:${S.md}px;}
.pfp-head .pk-medallion{width:${PACK_AVATAR.head}px;height:${PACK_AVATAR.head}px;font:600 ${TX.body}px/1 ${FONT_UI};color:${T.inkWarm};}
.pfp-who{min-width:0;flex:1;}
.pfp-who b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.body}px;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: meno */
.pfp-who small{font-size:${TX.label}px;color:${T.inkWarm};}
.pfp-ph{position:relative;width:100%;background:${T.tileBg};cursor:pointer;touch-action:pan-y;overscroll-behavior-x:contain;}
.pfp-ph img{display:block;width:100%;height:100%;object-fit:cover;}
.pfp-place{position:absolute;left:${S.sm}px;bottom:${S.sm}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;background:rgba(0,0,0,.55);
  color:${T.onDark};font:600 ${TX.micro}px/1.2 ${FONT_UI};display:inline-flex;align-items:center;gap:${S.xs}px;}
.pfp-cnt{position:absolute;right:${S.sm}px;top:${S.sm}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;background:rgba(0,0,0,.45);
  color:${T.onDark};font:600 ${TX.micro}px/1 ${FONT_UI};}
.pfp-acts{display:flex;align-items:center;gap:${S.lg}px;padding:${S.md}px ${S.md}px 0;}
.pfp-acts button{background:none;border:0;padding:0;cursor:pointer;color:${T.inkStrong};display:inline-flex;align-items:center;gap:${S.xs}px;
  font:600 ${TX.label}px/1 ${FONT_UI};transition:transform .12s ease;}
.pfp-acts button:active{transform:scale(.85);}
.pfp-acts .sp{flex:1;}
.pfp-acts .wish{font-size:${TX.h2}px;line-height:1;opacity:.55;}
.pfp-acts .wish.on{opacity:1;}
.pfp-acts .save.on{color:${T.accentGold};}
.pfp-tx{margin:0;padding:${S.sm}px ${S.md}px 0;font-size:${TX.body}px;line-height:1.45;color:${T.inkStrong};white-space:pre-line;}
.pfp-tx b{font-weight:600;margin-right:${S.xs}px;}
.pfp-cm{display:block;background:none;border:0;cursor:pointer;padding:${S.xs}px ${S.md}px ${S.md}px;font:500 ${TX.label}px/1.3 ${FONT_UI};color:${T.inkWarm};}
`;

export function FeedPostCard({ post, name, avatar, onOpen, authorN = null, mine = true }: {
  post: MePost; name: string; avatar: string | null; onOpen: (p: MePost) => void;
  /** Cudzí autor (až bude feed vedieť): jeho číslo majiteľa + `mine={false}` — tri bodky ponúknu nahlásiť/zablokovať. */
  authorN?: number | null; mine?: boolean;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { lang } = useLang();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [soc, setSoc] = useState<PostSocial>({ likes: 0, comments: 0, liked: false, saved: false, saves: 0 });
  const [ratio, setRatio] = useState<number | null>(null);
  const [wished, setWished] = useState(false);
  const [idx, setIdx] = useState(0);
  const np = post.photos.length;
  const swipe = useSwipe(np, (d) => setIdx((i) => (i + d + np) % np));
  useEffect(() => { void fetchPostSocial(post.id).then(setSoc).catch(() => {}); }, [post.id]);

  const nature = isNature(post);
  const place = post.attach.place;
  const aspect = ratio ? Math.min(Math.max(ratio, 4 / 5), 2) : 4 / 5;

  // Optimisticky — akcia nesmie čakať na server (ten istý vzor ako PostViewer).
  const mark = async (kind: 'like' | 'save') => {
    const on = kind === 'like' ? !soc.liked : !soc.saved;
    setSoc((s) => (kind === 'like' ? { ...s, liked: on, likes: s.likes + (on ? 1 : -1) } : { ...s, saved: on, saves: Math.max(0, s.saves + (on ? 1 : -1)) }));
    const got = await toggleMark(post.id, kind, on);
    if (got !== on) setSoc((s) => (kind === 'like' ? { ...s, liked: got, likes: s.likes + (got ? 1 : -1) } : { ...s, saved: got, saves: Math.max(0, s.saves + (got ? 1 : -1)) }));
  };
  const wish = async () => {
    if (wished) return;
    if (place?.lat == null || place?.lon == null) {
      toast({ title: tx('pack.feed.wish.noPlace', 'This post has no place on the map yet.') });
      return;
    }
    try {
      await addWishPin({ lat: place.lat, lon: place.lon, placeName: place.name || '', placeKind: 'point', tripKind: 'short', when: 'year', seeking: false, note: null });
      setWished(true);
      toast({ title: tx('pack.wish.guide.donePost', 'Saved. You’ll find it on the Map in your profile, under TRIPWISH.') });
    } catch {
      toast({ title: tx('pack.profile.toastUnknownError', 'Unknown error'), variant: 'destructive' });
    }
  };

  return (
    <article className="pfp">
      <div className="pfp-head">
        <span className="pk-medallion">{avatar ? <img src={sizedUrl(avatar, 80)} alt="" /> : name.charAt(0).toUpperCase()}</span>
        <div className="pfp-who">
          <b>{name}</b>
          <small>{[place?.name, agoLabel(Date.parse(post.createdAt), lang)].filter(Boolean).join(' · ')}</small>
        </div>
        {!mine && authorN != null && <FollowChip n={authorN} />}
        <PostMenu postId={post.id} authorN={authorN} authorName={name} mine={mine} onDelete={() => deletePost(post.id)} />
      </div>
      {post.photos[0] && (
        <div className="pfp-ph" style={{ aspectRatio: String(aspect) }} onClick={() => { if (!swipe.moved()) onOpen(post); }} {...swipe.handlers}>
          <img src={sizedUrl(post.photos[idx] ?? post.photos[0], 1080)} alt="" loading="lazy" decoding="async"
            onLoad={(e) => { const im = e.currentTarget; if (im.naturalHeight) setRatio(im.naturalWidth / im.naturalHeight); }} />
          {post.photos.length > 1 && <span className="pfp-cnt">{idx + 1}/{post.photos.length}</span>}
          {nature && place?.name && <span className="pfp-place"><BrandIcon name="locate" size={12} tint="white" />{place.name}</span>}
        </div>
      )}
      <div className="pfp-acts">
        <button type="button" onClick={() => mark('like')} aria-pressed={soc.liked} aria-label={tx('pack.feed.act.like', 'Like')}>
          <HandPaw size={24} on={soc.liked} />{soc.likes > 0 && soc.likes}
        </button>
        <button type="button" onClick={() => onOpen(post)} aria-label={tx('pack.post.comment', 'Comment')}>
          <BrandIcon name="chat" size={24} tint="dark" />{soc.comments > 0 && soc.comments}
        </button>
        <span className="sp" />
        {nature ? (
          <button type="button" className={`wish${wished ? ' on' : ''}`} onClick={wish} aria-label="TRIPWISH" title="TRIPWISH">
            {createEmoji('wish')}
          </button>
        ) : (
          <button type="button" className={`save${soc.saved ? ' on' : ''}`} onClick={() => mark('save')} aria-pressed={soc.saved} aria-label={tx('pack.feed.act.save', 'Save')}>
            <HandStar size={24} filled={soc.saved} />{soc.saves > 0 && soc.saves}
          </button>
        )}
      </div>
      {post.body && <p className="pfp-tx" onClick={(e) => e.stopPropagation()}><b>{name}</b>{linkify(post.body, (path) => navigate(path), 'pfp-link')}</p>}
      {soc.comments > 0
        ? <button type="button" className="pfp-cm" onClick={() => onOpen(post)}>{tx('pack.feed.comments', 'View {n} comments').replace('{n}', String(soc.comments))}</button>
        : <div style={{ height: S.md }} />}
    </article>
  );
}
