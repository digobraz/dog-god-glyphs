// DETAIL PRÍSPEVKU (25. 10. 2026) — príspevok ako na IG. Matej: *„chcel som pridať príspevok, ktorý je taký
// istý ako na IG"* — dovtedy sa otváral v prehliadači STORIES (5 s na snímku, sám ubehol), takže vyzeral ako
// miznúca story. Tu nič nebeží samo: hlavička, fotky švihom do strany (bodky), text pod nimi.
// Gramatika = príspevok vo FEEDe (`feed/PackFeed.tsx`, `.pkf-post`: fotka od kraja po kraj); kôš 3,
// zavrieť = bledá šípka vľavo hore (lock: krížik v /pack neexistuje).
// Akcie ❤️ 🔖 ↗ sem prídu s FEEDom pre cudzích — vlastný príspevok má len ZMAZAŤ.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BackButton } from '@/components/pack/BackButton';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_AVATAR, FONT_TITLE, FONT_UI, PAPER_BG } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { sizedUrl } from '@/services/cloudinaryService';
import { deletePost, type MePost } from '@/components/pack/profile/mePosts';
import type { PackDogFull } from '@/hooks/usePackUser';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

const CSS = `
.pv-root{position:fixed;inset:0;z-index:1300;background:${PAPER_BG};overflow-y:auto;animation:pv-in .2s ease both;font-family:${FONT_UI};color:${T.inkStrong};}
.pv-col{max-width:560px;margin:0 auto;padding-bottom:calc(env(safe-area-inset-bottom,0px) + ${S.xl}px);}
.pv-top{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:${S.sm}px;background:${PAPER_BG};
  padding:calc(env(safe-area-inset-top,0px) + ${S.sm}px) ${S.lg}px ${S.sm}px;border-bottom:1px solid ${T.hairline};}
.pv-av{flex:0 0 auto;width:${PACK_AVATAR.sm}px;height:${PACK_AVATAR.sm}px;border-radius:${PACK_R.pill}px;object-fit:cover;}
.pv-who{flex:1;min-width:0;}
.pv-who b{display:block;font:700 ${TX.body}px/1.2 ${FONT_TITLE};letter-spacing:.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;} /* písmo: meno */
.pv-who small{font-size:${TX.label}px;color:${T.inkWarm};}
.pv-media{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;background:${T.tileBg};}
.pv-media::-webkit-scrollbar{display:none;}
.pv-media img{flex:0 0 100%;width:100%;aspect-ratio:4/5;object-fit:cover;scroll-snap-align:center;display:block;user-select:none;-webkit-user-drag:none;}
.pv-dots{display:flex;justify-content:center;gap:${S.xs}px;padding:${S.sm}px 0 0;}
.pv-dots i{width:6px;height:6px;border-radius:${PACK_R.pill}px;background:${T.hairline};}
.pv-dots i.on{background:${LAPIS.edge};}
.pv-body{margin:0;padding:${S.md}px ${S.lg}px 0;font-size:${TX.body}px;line-height:1.45;white-space:pre-wrap;word-break:break-word;}
.pv-body b{font-weight:600;margin-right:${S.xs}px;}
.pv-dogs{display:flex;flex-wrap:wrap;gap:${S.sm}px;padding:${S.md}px ${S.lg}px 0;}
.pv-dog{display:inline-flex;align-items:center;gap:${S.xs}px;padding:${S.xs}px ${S.sm}px ${S.xs}px ${S.xs}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${T.hairline};font-size:${TX.label}px;}
.pv-dog img{width:22px;height:22px;border-radius:${PACK_R.pill}px;object-fit:cover;}
.pv-del{display:block;margin:${S.xl}px auto 0;border:1px solid ${T.hairline};background:none;color:${T.inkWarm};border-radius:${PACK_R.pill}px;cursor:pointer;
  padding:${S.sm}px ${S.lg}px;font-family:${FONT_UI};font-size:${TX.label}px;}
.pv-del.sure{background:${LAPIS.grad};border-color:${LAPIS.deep};color:${LAPIS.ink};}
@keyframes pv-in{from{opacity:0;}to{opacity:1;}}
@media (prefers-reduced-motion:reduce){.pv-root{animation:none;}}
`;

export function PostViewer({ post, name, avatar, dogs, mine, lang, onClose }: {
  post: MePost;
  name: string;
  avatar: string | null;
  dogs: PackDogFull[];
  mine: boolean;
  lang: string;
  onClose: () => void;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [at, setAt] = useState(0);
  const [sure, setSure] = useState(false);
  const media = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevO = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prevO; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const onScroll = () => {
    const el = media.current;
    if (el) setAt(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
  };

  const remove = async () => {
    if (!sure) { setSure(true); return; }
    try { await deletePost(post.id); onClose(); } catch { setSure(false); }
  };

  const tagged = dogs.filter((d) => post.attach.dogs?.includes(d.id));
  const date = new Date(post.createdAt).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });

  return createPortal(
    <div className="pv-root" role="dialog" aria-modal="true" aria-label={tx('pack.me.post', 'Post')}>
      <style>{CSS}</style>
      <div className="pv-col">
        <div className="pv-top">
          <BackButton tone="pale" onClick={onClose} label={tx('pack.network.close', 'Close')} />
          {avatar && <img className="pv-av" src={sizedUrl(avatar, 80)} alt="" />}
          <span className="pv-who"><b>{name}</b><small>{date}</small></span>
        </div>
        <div className="pv-media" ref={media} onScroll={onScroll}>
          {post.photos.map((u) => <img key={u} src={sizedUrl(u, 1080)} alt="" draggable={false} />)}
        </div>
        {post.photos.length > 1 && (
          <div className="pv-dots" aria-hidden>{post.photos.map((u, k) => <i key={u} className={k === at ? 'on' : ''} />)}</div>
        )}
        {post.body && <p className="pv-body"><b>{name}</b>{post.body}</p>}
        {tagged.length > 0 && (
          <div className="pv-dogs">
            {tagged.map((d) => (
              <span key={d.id} className="pv-dog">
                {d.cloudinary_main_url && <img src={sizedUrl(d.cloudinary_main_url, 60)} alt="" />}{d.dog_name}
              </span>
            ))}
          </div>
        )}
        {mine && (
          <button type="button" className={`pv-del${sure ? ' sure' : ''}`} onClick={remove}>
            {sure ? tx('pack.story.deleteSure', 'Tap again to delete') : tx('pack.story.delete', 'Delete')}
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
