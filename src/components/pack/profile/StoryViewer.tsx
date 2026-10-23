// PREHRÁVAČ STORIES (23. 10. 2026) — gramatika IG, náš šat (lock architektura-pack §6:
// „rozloženie sa nekopíruje, gramatika áno"). Pásiky hore, ťuk vľavo = späť, vpravo = ďalej,
// podržanie = pauza, 5 s na snímku. Kôš 3: bez lišty, späť = šípka.
// Majiteľ vidí pri snímke ZMAZAŤ — nič iné sa zo story nedá meniť (upravuje sa nová story).
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BackButton } from '@/components/pack/BackButton';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { sizedUrl } from '@/services/cloudinaryService';
import { deletePost, type MePost } from '@/components/pack/profile/mePosts';
import type { PackDogFull } from '@/hooks/usePackUser';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;
const FRAME_MS = 5000;

const CSS = `
.sv-root{position:fixed;inset:0;z-index:1300;background:${T.pageBg};display:flex;align-items:center;justify-content:center;animation:sv-in .22s ease both;}
.sv-stage{position:relative;width:100%;height:100%;max-width:min(100vw, calc(100dvh * 9 / 16));overflow:hidden;background:${T.pageBg};}
.sv-stage > img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;user-select:none;-webkit-user-drag:none;}
.sv-top{position:absolute;left:0;right:0;top:0;z-index:2;padding:calc(env(safe-area-inset-top,0px) + ${S.sm}px) ${S.md}px ${S.xl}px;
  background:linear-gradient(180deg,rgba(0,0,0,.55),transparent);}
.sv-bars{display:flex;gap:${S.xs}px;}
.sv-bars span{flex:1;height:3px;border-radius:${PACK_R.pill}px;background:rgba(255,255,255,.35);overflow:hidden;}
.sv-bars i{display:block;height:100%;background:#fff;width:0;}
.sv-who{display:flex;align-items:center;gap:${S.sm}px;margin-top:${S.md}px;color:#fff;font-family:${FONT_UI};font-size:${TX.label}px;}
.sv-who .av{flex:none;width:32px;height:32px;border-radius:${PACK_R.pill}px;object-fit:cover;border:1.5px solid ${T.cardEdge};}
.sv-who b{font-family:${FONT_TITLE};font-weight:700;letter-spacing:.14em;text-transform:uppercase;}
.sv-who small{opacity:.72;}
.sv-who .sp{flex:1;}
.sv-tap{position:absolute;top:0;bottom:0;z-index:1;width:50%;border:0;background:none;padding:0;cursor:pointer;}
.sv-tap.l{left:0;} .sv-tap.r{right:0;}
.sv-txt{position:absolute;left:${S.lg}px;right:${S.lg}px;bottom:calc(env(safe-area-inset-bottom,0px) + 88px);z-index:2;margin:0;text-align:center;pointer-events:none;
  font-family:${FONT_UI};font-weight:600;font-size:${TX.h2}px;line-height:1.3;color:#fff;text-shadow:0 1px 12px rgba(0,0,0,.7);white-space:pre-wrap;word-break:break-word;}
.sv-foot{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;align-items:center;gap:${S.sm}px;flex-wrap:wrap;
  padding:${S.xl}px ${S.md}px calc(env(safe-area-inset-bottom,0px) + ${S.md}px);background:linear-gradient(0deg,rgba(0,0,0,.55),transparent);}
.sv-dog{display:inline-flex;align-items:center;gap:${S.xs}px;padding:${S.xs}px ${S.sm}px ${S.xs}px ${S.xs}px;border-radius:${PACK_R.pill}px;
  background:rgba(0,0,0,.45);border:1px solid ${T.onDarkBorder};color:#fff;font-family:${FONT_UI};font-size:${TX.label}px;}
.sv-dog img{width:22px;height:22px;border-radius:${PACK_R.pill}px;object-fit:cover;}
.sv-del{margin-left:auto;border:1px solid ${T.onDarkBorder};background:rgba(0,0,0,.45);color:#fff;border-radius:${PACK_R.pill}px;cursor:pointer;
  padding:${S.xs}px ${S.md}px;font-family:${FONT_UI};font-size:${TX.label}px;}
.sv-del.sure{background:${LAPIS.grad};border-color:${LAPIS.deep};color:${LAPIS.ink};}
@keyframes sv-in{from{opacity:0;transform:scale(.98);}to{opacity:1;transform:none;}}
@media (prefers-reduced-motion:reduce){.sv-root{animation:none;}}
`;

/** „pred 3 h" — relatívny čas v jazyku appky, bez knižnice. */
function ago(iso: string, lang: string): string {
  const min = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60000));
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto', style: 'short' });
  if (min < 60) return rtf.format(-min, 'minute');
  const h = Math.round(min / 60);
  if (h < 48) return rtf.format(-h, 'hour');
  return rtf.format(-Math.round(h / 24), 'day');
}

export function StoryViewer({ items, start = 0, name, avatar, dogs, mine, lang, onClose }: {
  items: MePost[];
  start?: number;
  name: string;
  avatar: string | null;
  dogs: PackDogFull[];
  mine: boolean;
  lang: string;
  onClose: () => void;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [list, setList] = useState(items);
  const [i, setI] = useState(Math.min(start, items.length - 1));
  const [paused, setPaused] = useState(false);
  const [sure, setSure] = useState(false);
  const barRef = useRef<HTMLElement | null>(null);
  const t0 = useRef(0);
  const spent = useRef(0);

  const next = useCallback(() => {
    setSure(false);
    setI((k) => { if (k + 1 >= list.length) { onClose(); return k; } return k + 1; });
  }, [list.length, onClose]);
  const prev = () => { setSure(false); setI((k) => Math.max(0, k - 1)); };

  // Čas snímky: rAF kreslí pásik a po 5 s posunie ďalej. Pauza si pamätá, koľko už ubehlo.
  useEffect(() => { spent.current = 0; }, [i]);
  useEffect(() => {
    if (paused || sure) { spent.current += performance.now() - t0.current; return; }
    t0.current = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (spent.current + now - t0.current) / FRAME_MS);
      if (barRef.current) barRef.current.style.width = `${p * 100}%`;
      if (p >= 1) { next(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [i, paused, sure, next]);

  useEffect(() => {
    const prevO = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prevO; window.removeEventListener('keydown', onKey); };
  }, [onClose, next]);

  const cur = list[i];
  if (!cur) return null;
  const tagged = dogs.filter((d) => cur.attach.dogs?.includes(d.id));

  const remove = async () => {
    if (!sure) { setSure(true); return; }
    try {
      await deletePost(cur.id);
      const rest = list.filter((p) => p.id !== cur.id);
      if (!rest.length) { onClose(); return; }
      setList(rest);
      setI((k) => Math.min(k, rest.length - 1));
      setSure(false);
    } catch { setSure(false); }
  };

  const hold = { onPointerDown: () => setPaused(true), onPointerUp: () => setPaused(false), onPointerLeave: () => setPaused(false) };

  return createPortal(
    <div className="sv-root" role="dialog" aria-modal="true" aria-label={tx('pack.me.stories', 'Stories')}>
      <style>{CSS}</style>
      <div className="sv-stage">
        <img key={cur.id} src={sizedUrl(cur.photos[0], 1080)} alt="" draggable={false} />
        <button type="button" className="sv-tap l" aria-label={tx('pack.story.prev', 'Previous')} onClick={prev} {...hold} />
        <button type="button" className="sv-tap r" aria-label={tx('pack.story.next', 'Next')} onClick={next} {...hold} />
        <div className="sv-top">
          <div className="sv-bars">
            {list.map((p, k) => (
              <span key={p.id}><i ref={k === i ? (el) => { barRef.current = el; } : undefined} style={k < i ? { width: '100%' } : undefined} /></span>
            ))}
          </div>
          <div className="sv-who">
            {avatar && <img className="av" src={sizedUrl(avatar, 80)} alt="" />}
            <b>{name}</b>
            <small>{ago(cur.createdAt, lang)}</small>
            <span className="sp" />
            <BackButton tone="scrim" onClick={onClose} label={tx('pack.network.close', 'Close')} />
          </div>
        </div>
        {cur.body && <p className="sv-txt">{cur.body}</p>}
        {(tagged.length > 0 || mine) && (
          <div className="sv-foot">
            {tagged.map((d) => (
              <span key={d.id} className="sv-dog">
                {d.cloudinary_main_url && <img src={sizedUrl(d.cloudinary_main_url, 60)} alt="" />}{d.dog_name}
              </span>
            ))}
            {mine && (
              <button type="button" className={`sv-del${sure ? ' sure' : ''}`} onClick={remove}>
                {sure ? tx('pack.story.deleteSure', 'Tap again to delete') : tx('pack.story.delete', 'Delete')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
