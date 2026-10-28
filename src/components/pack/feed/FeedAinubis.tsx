// AINUBIS VO FEEDE = HOVORCA (Matej 26. 10. 2026: *„dajme že citáty pridáva ainubis, nie dogypt, ainubis je
// hovorca — okrem citátov bude zdieľať aj zaujímavé príbehy… mám k nim aj animované videá"*).
//
// VŠETKO V JEHO TMAVOM ŠATE (nákres `plany/nakres-feed-2026-10-26.html` bloky 1, 2, 6, 7): hlavička aj pás pod
// obrazom sú AI-PALUBA (`AI_GLASS`), akcie sú tá istá pilulka ako v DOGSCROLLe (`.zv-acts` zo `SCROLL_CSS`) —
// labka cyan, ☆ zlatá. Zvitok samotný NIE JE tu: je to `ScrollCard` zo `ScrollParts.tsx` (jeden blok pre
// DOGSCROLL aj feed, Matej: *„je to vlastne to isté, len v inom priečinku"*).
//
// 🔴 NIČ SA NEFALŠUJE: počty pri citáte a príbehu nie sú (labka a ☆ držia len toto zariadenie, kým nebude
// tabuľka značiek mimo `posts` — zoznam migrácií v `plany/prompt-feed2-stavba-2026-10-26.md`). Ankety a oznamy
// s CTA z nákresu tu zatiaľ NIE SÚ — hlasy potrebujú server.
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_AVATAR, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { AINUBIS, AI_GLASS } from '@/components/pack/ainubisSkin';
import { HandPaw, HandStar, HandPlay } from '@/components/pack/HandIcons';
import { pickText, pickPod, fmtSec, type DemoScroll } from '@/components/pack/vault/vaultScrolls';
import ainubisHead from '@/assets/ainubis-head.webp';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

export const FEED_AI_CSS = `
.fai{overflow:hidden;border-radius:${PACK_R.card}px;${AI_GLASS}}
.fai-h{display:flex;align-items:center;gap:${S.sm}px;padding:${S.md}px;}
.fai-av{flex:none;width:${PACK_AVATAR.head}px;height:${PACK_AVATAR.head}px;border-radius:${PACK_R.pill}px;background:${AINUBIS.bgDeep} center/cover no-repeat;
  border:2px solid ${AINUBIS.cyan};box-shadow:${AINUBIS.faceRing};}
.fai-who{min-width:0;flex:1;}
.fai-who b{display:block;font-family:${FONT_UI};font-weight:400;font-size:${TX.body}px;line-height:1.2;letter-spacing:.26em;color:${AINUBIS.ink};}
/* Matej 28. 10. 2026: AINUBIS = sci-fi, Cinzel mu nesedí → Grotesk široko rozstrelený („C“), „AI“ tučne (600 = najťažší načítaný rez). */
.fai-who b .ai{color:${AINUBIS.aiInk};font-weight:600;}
.fai-who small{display:block;margin-top:${S.xs}px;font-size:${TX.label}px;line-height:1.25;color:${AINUBIS.inkDim};}
.fai-b{padding:${S.md}px;display:flex;flex-direction:column;gap:${S.sm}px;}
.fai-b .zv-acts{margin-top:0;}
.fai-b h3{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;line-height:1.3;letter-spacing:.02em;color:${AINUBIS.ink};} /* písmo: nadpis */
.fai-b p{margin:0;font-size:${TX.body}px;line-height:1.5;color:${AINUBIS.inkDim};white-space:pre-line;}
.fai-b p.cut{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.fai-more{align-self:flex-start;background:none;border:0;padding:0;cursor:pointer;font:600 ${TX.label}px/1 ${FONT_UI};color:${AINUBIS.cyan};}
.fai-cta{width:100%;cursor:pointer;border:0;border-radius:${PACK_R.field}px;padding:${S.md}px ${S.lg}px;background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};
  box-shadow:${AINUBIS.ctaShadow};font-family:${FONT_TITLE};font-weight:700;font-size:${TX.label}px;letter-spacing:.14em;text-transform:uppercase;} /* písmo: cta */

/* CITÁT 16:9 — text kreslí appka, obraz je bez písma. Stupeň sa viaže na ŠÍRKU KARTY (cqw), nie na okno. */
.fai-q{position:relative;width:100%;aspect-ratio:16/9;background:${AINUBIS.bgDeep} center/cover no-repeat;container-type:inline-size;}
.fai-q .tx{position:absolute;left:5%;top:0;bottom:0;width:39%;display:flex;flex-direction:column;justify-content:center;gap:${S.sm}px;text-align:center;}
.fai-q q{font-family:${FONT_TITLE};font-weight:700;font-size:clamp(12px,4.4cqw,24px);line-height:1.25;letter-spacing:.02em;quotes:"„" "“";} /* písmo: nadpis */
/* Dlhý citát sa do ľavej polovice nezmestí v plnom stupni — zmenší sa (krátke a úderné sú cieľ, Matej 26. 10.). */
.fai-q.long q{font-size:clamp(10px,3.3cqw,20px);}
.fai-q cite{font:500 clamp(8px,2cqw,12px)/1.3 ${FONT_UI};letter-spacing:.22em;text-transform:uppercase;font-style:normal;}
.fai-q.b q{color:${T.inkStrong};}
.fai-q.b cite{color:${T.inkWarm};}
.fai-q.a::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.72) 0%,rgba(0,0,0,.45) 50%,rgba(0,0,0,0) 80%);}
.fai-q.a .tx{text-align:left;}
.fai-q.a q{color:${T.onDark};}
.fai-q.a cite{color:${AINUBIS.ctaA};}

/* PRÍBEH — animované video zo začiatkov (bez zvuku, slučka), ťuk ho zastaví */
.fai-v{position:relative;width:100%;aspect-ratio:4/5;background:${AINUBIS.bgDeep};}
.fai-v video{display:block;width:100%;height:100%;object-fit:cover;}

/* ODLOŽENÉ ZVITKY */
.fai-sv{display:flex;align-items:center;gap:${S.md}px;padding:${S.sm}px;border-radius:${PACK_R.tile}px;border:1px solid ${AINUBIS.edge};background:${AINUBIS.surface};
  cursor:pointer;width:100%;text-align:left;color:${AINUBIS.ink};font-family:${FONT_UI};}
.fai-sv img{flex:none;width:48px;height:64px;border-radius:${PACK_R.field}px;object-fit:cover;}
.fai-sv b{display:block;font-weight:600;font-size:${TX.body}px;line-height:1.3;}
.fai-sv small{font-size:${TX.label}px;color:${AINUBIS.inkDim};}
`;

const AiName = () => <><span className="ai">AI</span>NUBIS</>;

/** Hlavička AINUBISA (avatar + meno) — rovnaká pre všetky jeho príspevky vo feede, vrátane zvitku. */
export function AiHead({ sub }: { sub: string }) {
  return (
    <div className="fai-h">
      <span className="fai-av" style={{ backgroundImage: `url(${ainubisHead})` }} aria-hidden />
      <div className="fai-who"><b><AiName /></b><small>{sub}</small></div>
    </div>
  );
}

/** Hlavička + telo v šate AINUBISA. `media` ide od kraja po kraj medzi hlavičkou a pásom. */
function AiPost({ sub, media, children }: { sub: string; media?: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="fai">
      <AiHead sub={sub} />
      {media}
      <div className="fai-b">{children}</div>
    </article>
  );
}

/** Labka · komentár · ☆ v pilulke DOGSCROLLu, každá s počtom (`feed_social`, Matej 27. 10.:
 *  *„počet pri labkách, komentoch aj uloženiach"*). */
function AiActs({ liked, saved, onLike, onSave, labels, onComment, comments = 0, likes = 0, saves = 0 }: {
  liked: boolean; saved: boolean; onLike: () => void; onSave: () => void; labels: { like: string; save: string; comment?: string };
  /** Komentáre — zatiaľ len pod citátom. Poradie vždy labka · komentár · ☆ (lock architektura-pack §4.2). */
  onComment?: () => void; comments?: number; likes?: number; saves?: number;
}) {
  return (
    <div className="zv-acts">
      <button type="button" data-k="like" className={`zv-act${liked ? ' is-on' : ''}`} onClick={onLike} aria-pressed={liked} aria-label={labels.like}>
        <HandPaw size={20} on={liked} />
        <span className="zv-n">{likes}</span>
      </button>
      {onComment && (
        <button type="button" data-k="talk" className={`zv-act${comments > 0 ? ' is-on' : ''}`} onClick={onComment} aria-label={labels.comment}>
          <i className="zv-ic" aria-hidden style={{ WebkitMaskImage: `url(/icons/pack/${comments > 0 ? 'chat-right-full' : 'chat'}.svg)`, maskImage: `url(/icons/pack/${comments > 0 ? 'chat-right-full' : 'chat'}.svg)` }} />
          <span className="zv-n">{comments}</span>
        </button>
      )}
      <button type="button" data-k="save" className={`zv-act${saved ? ' is-on' : ''}`} onClick={onSave} aria-pressed={saved} aria-label={labels.save}>
        <HandStar size={20} filled={saved} />
        <span className="zv-n">{saves}</span>
      </button>
    </div>
  );
}

export function AiQuote({ text, author, bg, variant, sub, liked, saved, onLike, onSave, labels, onComment, comments, likes, saves }: {
  text: string; author: string; bg: string; variant: 'a' | 'b'; sub: string;
  liked: boolean; saved: boolean; onLike: () => void; onSave: () => void; labels: { like: string; save: string; comment?: string };
  onComment?: () => void; comments?: number; likes?: number; saves?: number;
}) {
  return (
    <AiPost sub={sub} media={(
      <div className={`fai-q ${variant}${text.length > 60 ? ' long' : ''}`} style={{ backgroundImage: `url(${bg})` }}>
        <div className="tx">
          <q>{text}</q>
          {author && <cite>{author}</cite>}
        </div>
      </div>
    )}>
      <AiActs liked={liked} saved={saved} onLike={onLike} onSave={onSave} labels={labels} onComment={onComment} comments={comments} likes={likes} saves={saves} />
    </AiPost>
  );
}

export function AiStory({ src, poster, title, body, sub, liked, saved, onLike, onSave, labels, likes, saves }: {
  src: string; poster: string; title: string; body: string; sub: string;
  liked: boolean; saved: boolean; onLike: () => void; onSave: () => void; labels: { like: string; save: string; more: string };
  likes?: number; saves?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  // Hrá len keď je na obrazovke — slučka mimo okna by pálila batériu.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) void v.play().catch(() => {}); else v.pause(); }, { threshold: 0.5 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <AiPost sub={sub} media={(
      <div className="fai-v">
        <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata"
          onClick={(e) => { const v = e.currentTarget; if (v.paused) void v.play(); else v.pause(); }} />
      </div>
    )}>
      <h3>{title}</h3>
      <p className={open ? '' : 'cut'}>{body}</p>
      {!open && body.length > 140 && <button type="button" className="fai-more" onClick={() => setOpen(true)}>{labels.more}</button>}
      <AiActs liked={liked} saved={saved} onLike={onLike} onSave={onSave} labels={labels} likes={likes} saves={saves} />
    </AiPost>
  );
}

/** Odložené zvitky (☆ v DOGSCROLLe) — skutočný zoznam z `vault_reads`, nie pripomienka zo servera. */
export function AiSaved({ list, lang, onOpen }: { list: DemoScroll[]; lang: string; onOpen: (id: string) => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  if (!list.length) return null;
  const head = tx('pack.feed.saved.head', 'You put aside {n} scrolls. Got five minutes now?').replace('{n}', String(list.length));
  return (
    <AiPost sub={tx('pack.feed.saved.sub', 'For later')}>
      <p style={{ color: AINUBIS.ink }}>{head}</p>
      {list.slice(0, 3).map((z) => {
        const x = pickText(z, lang);
        const pod = pickPod(z, lang);
        return (
          <button key={z.id} type="button" className="fai-sv" onClick={() => onOpen(z.id)}>
            {z.img && <img src={z.img} alt="" loading="lazy" />}
            <span>
              <b>{x.t}</b>
              <small>{x.min ? `${x.min} min` : ''}{x.min && pod ? ' · ' : ''}{pod && <><HandPlay size={10} /> {fmtSec(pod.sec)}</>}</small>
            </span>
          </button>
        );
      })}
      <button type="button" className="fai-cta" onClick={() => onOpen(list[0].id)}>{tx('pack.feed.scroll.read', 'Read')}</button>
    </AiPost>
  );
}

