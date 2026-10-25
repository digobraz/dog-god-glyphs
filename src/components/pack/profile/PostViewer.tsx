// DETAIL PRÍSPEVKU (25. 10. 2026) — príspevok ako na IG. Matej: *„chcel som pridať príspevok, ktorý je taký
// istý ako na IG"* — dovtedy sa otváral v prehliadači STORIES (5 s na snímku, sám ubehol), takže vyzeral ako
// miznúca story. Tu nič nebeží samo: hlavička, fotky švihom do strany (bodky), text pod nimi.
// Gramatika = príspevok vo FEEDe (`feed/PackFeed.tsx`, `.pkf-post`: fotka od kraja po kraj); kôš 3,
// zavrieť = bledá šípka vľavo hore (lock: krížik v /pack neexistuje).
// 🆕 25. 10. večer, Matej nad snímkou IG: *„hore meno, dátum, lokalita, dole lajky, koment, počet lajkov a popis"*
//    → ❤️ a 💬 s počtom (`post_social`), 🔖 vpravo, popis, komentáre (`post_comments`), pole na komentár.
// 🆕 25. 10. noc: *„chcem, aby sa dali rozkliknúť ľudia, čo lajkujú, ako na IG"* → „Páči sa to …" otvorí šuplík
//    ľudí (`list_post_likers`), ťuk = ich profil · *„pri príspevku bude táto mapa ako posledný obrázok aj s pinom
//    a možnosťou klikom dostať sa do mapy cz"* → posledná snímka = mapa s bodom (`attach.place` s lat/lon).
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapyTiles } from '@/lib/env';
import { BackButton } from '@/components/pack/BackButton';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_AVATAR, FONT_TITLE, FONT_UI, PAPER_BG, PF_FIELD_CSS, VEIL_CSS } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { sizedUrl } from '@/services/cloudinaryService';
import { deletePost, fetchPostSocial, fetchComments, addComment, deleteComment, fetchLikers, mapyPointUrl, type PostLiker, type MePost, type PostSocial, type PostComment } from '@/components/pack/profile/mePosts';
import { toggleMark } from '@/components/pack/story/storyData';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { HandHeart, HandStar, HandTrash } from '@/components/pack/HandIcons';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { useSheetSwipe } from '@/components/pack/useSheetSwipe';
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
.pv-who .pl{display:block;font-size:${TX.label}px;color:${T.inkStrong};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pv-acts{display:flex;align-items:center;gap:${S.lg}px;padding:${S.md}px ${S.lg}px 0;}
.pv-acts button{display:inline-flex;align-items:center;gap:${S.xs}px;background:none;border:0;padding:0;cursor:pointer;color:${T.inkStrong};
  font-family:${FONT_UI};font-weight:600;font-size:${TX.body}px;transition:transform .12s ease;}
.pv-acts button:active{transform:scale(.88);}
.pv-acts button.on.like{color:${T.alertRed};}
.pv-acts button.on.save{color:${T.accentGold};}
.pv-acts .sp{flex:1;}
.pv-cm{list-style:none;margin:0;padding:${S.sm}px ${S.lg}px 0;display:flex;flex-direction:column;gap:${S.sm}px;}
.pv-cm li{display:flex;align-items:flex-start;gap:${S.sm}px;font-size:${TX.body}px;line-height:1.4;}
.pv-cm .av{flex:none;width:28px;height:28px;border-radius:${PACK_R.pill}px;object-fit:cover;background:${T.tileBg};display:grid;place-items:center;font-size:${TX.label}px;font-weight:600;color:${T.inkWarm};}
.pv-cm p{flex:1;min-width:0;margin:0;white-space:pre-wrap;word-break:break-word;}
.pv-cm p b{font-weight:600;margin-right:${S.xs}px;}
.pv-cm p small{display:block;font-size:${TX.micro}px;color:${T.inkWarm};}
.pv-cm .rm{flex:none;background:none;border:0;padding:${S.xs}px;cursor:pointer;color:${T.inkWarm};}
.pv-add{display:flex;gap:${S.sm}px;align-items:center;padding:${S.md}px ${S.lg}px 0;}
.pv-add .pf-field{flex:1;min-width:0;}
.pv-send{flex:none;width:40px;height:40px;border-radius:${PACK_R.pill}px;border:0;display:grid;place-items:center;cursor:pointer;background:${LAPIS.grad};}
.pv-send:disabled{opacity:.4;cursor:default;}
.pv-media{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;background:${T.tileBg};}
.pv-media::-webkit-scrollbar{display:none;}
.pv-map{position:relative;flex:0 0 100%;width:100%;aspect-ratio:4/5;scroll-snap-align:center;border:0;padding:0;cursor:pointer;background:${T.tileBg};}
.pv-map .lf{position:absolute;inset:0;pointer-events:none;}
.pv-map .go{position:absolute;left:50%;bottom:${S.lg}px;transform:translateX(-50%);z-index:500;white-space:nowrap;padding:${S.sm}px ${S.lg}px;border-radius:${PACK_R.field}px;
  background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};font-family:${FONT_UI};font-weight:600;font-size:${TX.label}px;letter-spacing:.14em;text-transform:uppercase;}
.pv-likers{display:flex;align-items:center;gap:${S.sm}px;margin:${S.sm}px ${S.lg}px 0;padding:0;background:none;border:0;cursor:pointer;color:${T.inkStrong};
  font-family:${FONT_UI};font-size:${TX.body}px;text-align:left;}
.pv-likers .fc{display:flex;}
.pv-likers .fc img,.pv-likers .fc i{width:22px;height:22px;border-radius:${PACK_R.pill}px;object-fit:cover;border:2px solid ${PAPER_BG};margin-left:-${S.sm}px;background:${T.tileBg};display:block;}
.pv-likers .fc i{display:grid;place-items:center;font-style:normal;font-size:${TX.micro}px;font-weight:600;color:${T.inkWarm};}
.pv-likers .fc > :first-child{margin-left:0;}
.pv-likers b{font-weight:600;}
.pv-who .pl{cursor:pointer;background:none;border:0;padding:0;text-align:left;font-family:${FONT_UI};}
.pv-ls.pk-veil{z-index:1350;align-items:flex-end;padding:0;}
.pv-ls .sh{width:100%;max-height:80dvh;display:flex;flex-direction:column;background:${T.cardGrad};border-top:1.5px solid ${T.cardEdge};
  border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;box-shadow:${T.panelShadow};animation:pv-up .32s cubic-bezier(.2,.8,.2,1) both;}
.pv-ls .grab{flex:none;width:44px;height:4px;border-radius:${PACK_R.pill}px;background:${T.hairline};margin:${S.sm}px auto 0;}
.pv-ls .hd{flex:none;display:flex;align-items:center;gap:${S.md}px;padding:${S.sm}px ${S.lg}px ${S.md}px;}
.pv-ls .hd h2{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.14em;text-transform:uppercase;} /* písmo: nadpis */
.pv-ls ul{list-style:none;margin:0;padding:0 ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.xl}px);overflow-y:auto;}
.pv-ls li button{display:flex;align-items:center;gap:${S.md}px;width:100%;padding:${S.sm}px 0;background:none;border:0;cursor:pointer;color:${T.inkStrong};
  font-family:${FONT_UI};font-size:${TX.body}px;font-weight:600;text-align:left;}
.pv-ls li i{display:grid;place-items:center;font-style:normal;font-weight:600;color:${T.inkWarm};}
.pv-ls li img,.pv-ls li i{flex:none;width:${PACK_AVATAR.sm}px;height:${PACK_AVATAR.sm}px;border-radius:${PACK_R.pill}px;object-fit:cover;background:${T.tileBg};}
.pv-ls li small{font-weight:400;color:${T.inkWarm};margin-left:auto;}
@keyframes pv-up{from{transform:translateY(100%);}to{transform:none;}}
@media (min-width:768px){ .pv-ls.pk-veil{align-items:center;} .pv-ls .sh{width:480px;border:1.5px solid ${T.cardEdge};border-radius:${PACK_R.card}px;} }
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
  const { session } = usePackIdentity();
  const uid = session?.user?.id ?? null;
  const [soc, setSoc] = useState<PostSocial>({ likes: 0, comments: 0, liked: false, saved: false });
  const [cms, setCms] = useState<PostComment[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [likers, setLikers] = useState<PostLiker[]>([]);
  const [likersOpen, setLikersOpen] = useState(false);
  const navigate = useNavigate();

  const reload = useCallback(() => {
    fetchPostSocial(post.id).then(setSoc);
    fetchComments(post.id).then(setCms);
    fetchLikers(post.id).then(setLikers);
  }, [post.id]);
  useEffect(() => { reload(); }, [reload]);

  // ❤️ / 🔖 optimisticky — akcia nesmie čakať na server (ako kronika výletu).
  const mark = async (kind: 'like' | 'save') => {
    const on = kind === 'like' ? !soc.liked : !soc.saved;
    setSoc((s) => kind === 'like' ? { ...s, liked: on, likes: s.likes + (on ? 1 : -1) } : { ...s, saved: on });
    const got = await toggleMark(post.id, kind, on);
    if (got !== on) reload();
  };
  const send = async () => {
    if (!uid || !draft.trim() || sending) return;
    setSending(true);
    try { await addComment(post.id, uid, draft); setDraft(''); reload(); } catch { /* ostane v poli */ }
    setSending(false);
  };
  const dropComment = async (id: string) => {
    setCms((c) => c.filter((x) => x.id !== id));
    try { await deleteComment(id); } catch { /* vráti ho reload */ }
    reload();
  };

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
  const place = post.attach.place;
  const pin = place?.lat != null && place?.lon != null ? { lat: place.lat, lon: place.lon } : null;
  const slides = post.photos.length + (pin ? 1 : 0);
  const openMapy = () => { if (pin) window.open(mapyPointUrl(pin.lat, pin.lon), '_blank', 'noopener'); };
  const others = likers.filter((l) => !l.mine);
  const lead = others[0] ?? likers[0];

  return createPortal(
    <div className="pv-root" role="dialog" aria-modal="true" aria-label={tx('pack.me.post', 'Post')}>
      <style>{PF_FIELD_CSS}</style>
      <style>{CSS}</style>
      <div className="pv-col">
        <div className="pv-top">
          <BackButton tone="pale" onClick={onClose} label={tx('pack.network.close', 'Close')} />
          {avatar && <img className="pv-av" src={sizedUrl(avatar, 80)} alt="" />}
          <span className="pv-who">
            <b>{name}</b><small>{date}</small>
            {place?.name && (pin
              ? <button type="button" className="pl" onClick={openMapy}>{place.name}</button>
              : <span className="pl">{place.name}</span>)}
          </span>
        </div>
        <div className="pv-media" ref={media} onScroll={onScroll}>
          {post.photos.map((u) => <img key={u} src={sizedUrl(u, 1080)} alt="" draggable={false} />)}
          {pin && <MapSlide lat={pin.lat} lon={pin.lon} label={tx('pack.post.openMapy', 'Open in Mapy.cz')} onOpen={openMapy} />}
        </div>
        {slides > 1 && (
          <div className="pv-dots" aria-hidden>{Array.from({ length: slides }, (_, k) => <i key={k} className={k === at ? 'on' : ''} />)}</div>
        )}
        <div className="pv-acts">
          <button type="button" className={`like${soc.liked ? ' on' : ''}`} onClick={() => mark('like')} aria-pressed={soc.liked} aria-label={tx('pack.post.like', 'Like')}>
            <HandHeart size={24} on={soc.liked} />{soc.likes > 0 && soc.likes}
          </button>
          <button type="button" onClick={() => input.current?.focus()} aria-label={tx('pack.post.comment', 'Comment')}>
            <BrandIcon name="chat" size={24} tint="dark" />{soc.comments > 0 && soc.comments}
          </button>
          <span className="sp" />
          <button type="button" className={`save${soc.saved ? ' on' : ''}`} onClick={() => mark('save')} aria-pressed={soc.saved} aria-label={tx('pack.post.save', 'Save')}>
            <HandStar size={24} filled={soc.saved} />
          </button>
        </div>
        {likers.length > 0 && lead && (
          <button type="button" className="pv-likers" onClick={() => setLikersOpen(true)}>
            <span className="fc">{likers.slice(0, 3).map((l, k) => (l.photo ? <img key={k} src={sizedUrl(l.photo, 60)} alt="" /> : <i key={k}>{(l.name || '#')[0]}</i>))}</span>
            <span>{likers.length === 1
              ? <>{tx('pack.post.likedBy', 'Liked by')} <b>{lead.mine ? tx('pack.post.you', 'you') : lead.name || `#${lead.ownerN ?? ''}`}</b></>
              : <>{tx('pack.post.likedBy', 'Liked by')} <b>{lead.name || `#${lead.ownerN ?? ''}`}</b> {tx('pack.post.andOthers', 'and others')} ({likers.length - 1})</>}
            </span>
          </button>
        )}
        {post.body && <p className="pv-body"><b>{name}</b>{post.body}</p>}
        {cms.length > 0 && (
          <ul className="pv-cm">
            {cms.map((c) => (
              <li key={c.id}>
                {c.photo ? <img className="av" src={sizedUrl(c.photo, 60)} alt="" /> : <span className="av">{(c.name || '#')[0]}</span>}
                <p><b>{c.name || (c.ownerN ? `#${c.ownerN}` : '')}</b>{c.body}
                  <small>{new Date(c.createdAt).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}</small></p>
                {c.canDelete && (
                  <button type="button" className="rm" onClick={() => dropComment(c.id)} aria-label={tx('pack.story.delete', 'Delete')}><HandTrash size={14} /></button>
                )}
              </li>
            ))}
          </ul>
        )}
        {uid && (
          <div className="pv-add">
            <input ref={input} className="pf-field" value={draft} maxLength={1000} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              placeholder={tx('pack.post.addComment', 'Add a comment…')} aria-label={tx('pack.post.addComment', 'Add a comment…')} />
            <button type="button" className="pv-send" disabled={!draft.trim() || sending} onClick={send} aria-label={tx('pack.post.send', 'Send')}>
              <BrandIcon name="send" size={18} tint="white" />
            </button>
          </div>
        )}
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
      {likersOpen && (
        <LikersSheet list={likers} title={tx('pack.post.likes', 'Likes')} you={tx('pack.post.you', 'you')} close={tx('pack.network.close', 'Close')}
          onClose={() => setLikersOpen(false)}
          onPick={(n) => { setLikersOpen(false); onClose(); navigate(`/pack/u/${n}`); }} />
      )}
    </div>,
    document.body,
  );
}

/** Posledná snímka príspevku: mapa s bodom. Ťuk = Mapy.cz (ten istý odkaz ako pri výletoch). */
function MapSlide({ lat, lon, label, onOpen }: { lat: number; lon: number; label: string; onOpen: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false,
      doubleClickZoom: false, touchZoom: false, boxZoom: false, keyboard: false }).setView([lat, lon], 14);
    L.tileLayer(mapyTiles('outdoor'), { maxZoom: 19 }).addTo(map);
    L.circleMarker([lat, lon], { radius: 10, color: T.brandBlue, weight: 3, fillColor: T.card, fillOpacity: 1 }).addTo(map);
    return () => { map.remove(); };
  }, [lat, lon]);
  return (
    <button type="button" className="pv-map" onClick={onOpen} aria-label={label}>
      <div className="lf" ref={el} />
      <span className="go">{label}</span>
    </button>
  );
}

function LikersSheet({ list, title, you, close, onClose, onPick }: {
  list: PostLiker[]; title: string; you: string; close: string;
  onClose: () => void; onPick: (ownerN: number) => void;
}) {
  const sw = useSheetSwipe(onClose);
  return (
    <div className="pv-ls pk-veil pk-veil--modal" role="dialog" aria-modal="true" aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{VEIL_CSS}</style>
      <div className="sh" style={sw.sheetStyle}>
        <span className="grab" aria-hidden {...sw.handle} />
        <div className="hd" {...sw.handle}>
          <BackButton tone="pale" onClick={onClose} label={close} />
          <h2>{title}</h2>
        </div>
        <ul>
          {list.map((l, k) => (
            <li key={k}>
              <button type="button" disabled={l.mine || l.ownerN == null} onClick={() => l.ownerN != null && onPick(l.ownerN)}>
                {l.photo ? <img src={sizedUrl(l.photo, 80)} alt="" /> : <i>{(l.name || '#')[0]}</i>}
                {l.name || (l.ownerN != null ? `#${l.ownerN}` : '')}
                {l.mine && <small>{you}</small>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
