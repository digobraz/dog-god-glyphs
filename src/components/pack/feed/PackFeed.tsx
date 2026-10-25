// FEED 1.0 — ZÁKLAD na DOMOVE `/pack` (24. 10. 2026, len za TEST_BUILD — `pages/Pack.tsx`).
//
// Matej: *„postav to zatiaľ do appky, lepšie než nič… budeme to ladiť postupne, ale potrebujeme mať aspoň
// nejaký základný feed"* · nákres `plany/nakres-feed-2026-10-24.html` (obrazovka 1 · Feed a 3 · Kotúč +) ·
// odpovede 24. 10.: *„viacmenej to vyzerá dobre"*, hore vľavo AINUBIS, kotúč + = Príspevok·Story·Zapíš výlet·Do denníka.
//
// SKLADÁ SA Z HOTOVÝCH DIELOV, NOVÝ TVAR SA NEZAKLADÁ (lock `pack-dizajn-system` §katalóg):
//   · rad príbehov = MEDAILÓN (`PACK_AVATAR`) s prstencom lapis + zlato, AINUBIS cyan
//   · štítky = PILULKA `.pk-pill`, výber = priesvitný tint lapisu (`pickTintCSS`)
//   · príspevok = fotka od kraja po kraj + riadok autora + štvorica akcií (lock architektura-pack §4.2)
//   · výlet = fialový pás pod fotkou (`T.tripPurple`, fialová = výlety), AINUBIS zvitok = AI-PALUBA (`AI_GLASS`)
//
// ŠÍRKA: na mobile celá šírka okna (stĺpec sa vytiahne cez `padding` PackLayoutu záporným okrajom), na PC
// stĺpec 560 px ako v nákrese. Je to ÚMYSELNE UŽŠIE než `PACK_COL_INNER` (832): feed je mediálny stĺpec ako na
// Instagrame — fotka 4:5 na 832 px by bola vyššia než okno — a 560 schválil Matej v nákrese (obrazovka 5).
// Hlavička (AINUBIS vľavo, chvost a obálka vpravo) ostáva `PackTopRow` z PackLayoutu a nezdvojuje sa.
//
// 🔴 PRÁZDNE JE PRÁZDNE. Chýbajúce dáta sa nenahrádzajú vymyslenými osobami ani číslami — viď `feedData.ts`
//    (zoznam toho, čo potrebuje server).
import { useEffect, useMemo, useState } from 'react';
import { STORIES_ON } from '@/lib/packFlags';
import { useNavigate } from 'react-router-dom';
import { useLang, useT } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { useToast } from '@/hooks/use-toast';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { usePackUser } from '@/hooks/usePackUser';
import {
  PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_AVATAR, PACK_VEIL, FONT_TITLE, FONT_UI, PILL_CSS, PAPER_BG,
} from '@/components/pack/packTheme';
import { LAPIS, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { AINUBIS, AI_GLASS } from '@/components/pack/ainubisSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { HandHeart, HandStar, HandPlus, HandShare } from '@/components/pack/HandIcons';
import { StoryViewer } from '@/components/pack/profile/StoryViewer';
import { fetchMyPosts, onPostsChanged, openCompose, isMoment, isLive, type MePost } from '@/components/pack/profile/mePosts';
import {
  useDemoScrolls, useLiked, useSaved, toggleLiked, toggleSaved, pickText, type DemoScroll,
} from '@/components/pack/vault/vaultScrolls';
import { tripPath, readFavIds } from '@/components/pack/tripShared';
import { ensureMyTrip } from '@/components/pack/triplist/triplist';
import { persistFav } from '@/lib/packStore';
import { sizedUrl } from '@/services/cloudinaryService';
import { feedQuoteForDay, feedQuoteText } from '@/data/feedQuotes';
import ainubisHead from '@/assets/ainubis-head.webp';
import logo2026 from '@/assets/app/logo-2026.svg';
import { agoLabel, firstWord, shareOut, tripTitle, useFeedTrips, useLocalLikes, type FeedTrip } from './feedData';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

type Room = 'foryou' | 'trips' | 'scrolls';

const CSS = `
${PILL_CSS}
/* Feed je PLOCHÝ papyrus bez tapety (Matej 24. 10.: „layout bez toho čierneho pozadia ako je aj na ig, celá
   šírka"). Tapetu kreslí PackLayout cez .pk-paper::before/::after — pre túto stránku sa vypne. */
body.pkf-on .pk-paper{background-color:${PAPER_BG};}
body.pkf-on .pk-paper::before,body.pkf-on .pk-paper::after{display:none;}

/* Okraj od okraja: PackLayout dáva stĺpcu padding ${S.lg}px (mobil) / ${S.xl}px (od 640) — feed ho zruší. */
.pkf{margin:0 -${S.lg}px;font-family:${FONT_UI};color:${T.inkStrong};}
@media (min-width:640px){.pkf{margin:0 -${S.xl}px;}}
.pkf-col{max-width:560px;margin:0 auto;}

/* RAD PRÍBEHOV */
.pkf-stories{display:flex;gap:${S.md}px;padding:${S.md}px ${S.lg}px ${S.sm}px;overflow-x:auto;scrollbar-width:none;}
.pkf-stories::-webkit-scrollbar{display:none;}
.pkf-st{flex:0 0 auto;width:${PACK_AVATAR.lg + S.xs}px;text-align:center;background:none;border:0;padding:0;cursor:pointer;color:inherit;font:inherit;}
.pkf-ring{position:relative;width:${PACK_AVATAR.lg + S.xs}px;height:${PACK_AVATAR.lg + S.xs}px;border-radius:${PACK_R.pill}px;padding:${S.xs}px;
  background:conic-gradient(from 200deg,${LAPIS.edge},${T.cardEdge},${LAPIS.edge});}
.pkf-ring.ai{background:${AINUBIS.cyan};box-shadow:${AINUBIS.faceRing};}
.pkf-ring.plain{background:${T.hairline};}
.pkf-ring.none{background:none;}
.pkf-ring > .im{width:100%;height:100%;border-radius:${PACK_R.pill}px;border:3px solid ${PAPER_BG};background:${T.tileBg} center/cover;
  display:grid;place-items:center;overflow:hidden;font:600 ${TX.lead}px/1 ${FONT_UI};color:${T.inkWarm};}
.pkf-ring.ai > .im{background-color:${AINUBIS.bgDeep};}
.pkf-plus{position:absolute;right:-2px;bottom:-2px;width:24px;height:24px;border-radius:${PACK_R.pill}px;background:${LAPIS.grad};
  border:2px solid ${PAPER_BG};display:grid;place-items:center;color:${LAPIS.ink};cursor:pointer;padding:0;}
.pkf-n{display:block;margin-top:${S.xs}px;font-weight:500;font-size:${TX.micro}px;line-height:1.2;color:${T.inkStrong};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pkf-n .ai{color:${AINUBIS.aiInk};}

/* ŠTÍTKY — výber = priesvitný tint lapisu (nie plná farba: plná je len jediné CTA) */
.pkf-rooms{display:flex;gap:${S.sm}px;padding:${S.xs}px ${S.lg}px ${S.md}px;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid ${T.hairline};}
.pkf-rooms::-webkit-scrollbar{display:none;}
.pk-pill.pkf-chip{font:600 ${TX.label}px/1 ${FONT_UI};letter-spacing:.02em;padding:${S.sm}px ${S.md}px;cursor:pointer;}
.pk-pill.pkf-chip.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}

/* PRÍSPEVOK — od kraja po kraj */
.pkf-post{border-bottom:1px solid ${T.hairline};padding-bottom:${S.md}px;}
.pkf-ph{display:flex;align-items:center;gap:${S.sm}px;padding:${S.md}px ${S.lg}px;}
.pkf-av{flex:0 0 auto;width:${PACK_AVATAR.sm}px;height:${PACK_AVATAR.sm}px;border-radius:${PACK_R.pill}px;background:${T.tileBg} center/cover no-repeat;
  display:grid;place-items:center;overflow:hidden;font:600 ${TX.body}px/1 ${FONT_UI};color:${T.inkWarm};}
.pkf-av.logo{border:1px solid ${T.cardEdge};background-size:80%;background-color:${PAPER_BG};}
.pkf-av.ai{border:2px solid ${AINUBIS.cyan};background-color:${AINUBIS.bgDeep};}
.pkf-who{flex:1;min-width:0;}
.pkf-who b{display:block;font:700 ${TX.body}px/1.2 ${FONT_TITLE};letter-spacing:.02em;color:${T.inkStrong};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pkf-who b .ai{color:${AINUBIS.aiInk};}
.pkf-who small{font-size:${TX.label}px;color:${T.inkWarm};}
.pkf-media{position:relative;width:100%;aspect-ratio:4/5;background:${T.tileBg} center/cover no-repeat;}
.pkf-media.sq{aspect-ratio:1/1;}

/* CITÁT DŇA — fotka bez textu, text kreslí appka (Cinzel) */
.pkf-quote{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:${S.xl}px;background:${PACK_VEIL.photo};}
.pkf-quote q{font:700 ${TX.h2}px/1.35 ${FONT_TITLE};color:${T.onDark};quotes:"„" "“";letter-spacing:.02em;}
.pkf-quote cite{margin-top:${S.sm}px;font:500 ${TX.label}px/1 ${FONT_UI};letter-spacing:.22em;text-transform:uppercase;color:${LAPIS.ink};font-style:normal;}
@media (min-width:480px){.pkf-quote q{font-size:${TX.h1}px;}}

/* VÝLET — fialový pás pod fotkou (fialová = výlety) */
.pkf-trip{display:flex;align-items:center;gap:${S.md}px;padding:${S.md}px ${S.lg}px;background:${T.tripPurple};color:${T.onDark};}
.pkf-trip .tt{flex:1;min-width:0;}
.pkf-trip b{display:block;font:700 ${TX.body}px/1.25 ${FONT_TITLE};letter-spacing:.02em;}
.pkf-trip small{display:block;margin-top:${S.xs}px;font-size:${TX.label}px;opacity:.9;}
.pkf-trip button{flex:0 0 auto;cursor:pointer;background:transparent;color:${T.onDark};border:1px solid ${T.onDarkBorder};border-radius:${PACK_R.field}px;
  padding:${S.sm}px ${S.md}px;font:600 ${TX.label}px/1 ${FONT_UI};letter-spacing:.14em;text-transform:uppercase;}

/* AINUBIS — zvitok dňa (AI-PALUBA) */
.pkf-ai{margin:0 ${S.lg}px;padding:${S.lg}px;border-radius:${PACK_R.card}px;${AI_GLASS}}
.pkf-ai img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;border-radius:${PACK_R.tile}px;}
.pkf-ai h3{margin:${S.md}px 0 ${S.sm}px;font:700 ${TX.h2}px/1.3 ${FONT_TITLE};letter-spacing:.02em;color:${AINUBIS.ink};}
.pkf-ai p{margin:0 0 ${S.md}px;font-size:${TX.body}px;line-height:1.45;color:${AINUBIS.inkDim};}
.pkf-ai .row{display:flex;align-items:center;justify-content:space-between;gap:${S.md}px;font-size:${TX.label}px;color:${AINUBIS.inkFaint};}
.pkf-ai .go{cursor:pointer;border:0;border-radius:${PACK_R.field}px;padding:${S.sm}px ${S.lg}px;background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};
  box-shadow:${AINUBIS.ctaShadow};font:700 ${TX.label}px/1 ${FONT_TITLE};letter-spacing:.14em;text-transform:uppercase;}

/* ŠTVORICA AKCIÍ ❤️ 🔖 ➕ ↗ (lock architektura-pack §4.2) */
.pkf-acts{display:flex;align-items:center;gap:${S.xl}px;padding:${S.md}px ${S.lg}px 0;}
.pkf-acts button{background:none;border:0;padding:0;cursor:pointer;color:${T.inkStrong};display:grid;place-items:center;transition:transform .12s ease;}
.pkf-acts button:active{transform:scale(.85);}
.pkf-acts button.on.like{color:${T.alertRed};}
.pkf-acts button.on.save{color:${T.accentGold};}

.pkf-empty{padding:${S.xxl}px ${S.lg}px;text-align:center;font-size:${TX.body}px;color:${T.inkWarm};}
.pkf-end{padding:${S.xxl}px ${S.lg}px;text-align:center;font-size:${TX.label}px;color:${T.inkWarm};}
.pkf-end img{margin:0 auto;}
.pkf-end b{display:block;font:700 ${TX.lead}px/1.3 ${FONT_TITLE};letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};margin:${S.sm}px 0 ${S.xs}px;}
`;

function Actions({ liked, saved, onLike, onSave, onUse, onShare, labels }: {
  liked: boolean; saved: boolean;
  onLike: () => void; onSave: () => void; onUse?: () => void; onShare: () => void;
  labels: { like: string; save: string; use: string; share: string };
}) {
  return (
    <div className="pkf-acts">
      <button type="button" className={`like${liked ? ' on' : ''}`} onClick={onLike} aria-pressed={liked} aria-label={labels.like}><HandHeart size={24} on={liked} /></button>
      <button type="button" className={`save${saved ? ' on' : ''}`} onClick={onSave} aria-pressed={saved} aria-label={labels.save}><HandStar size={24} filled={saved} /></button>
      {onUse && <button type="button" onClick={onUse} aria-label={labels.use}><HandPlus size={24} /></button>}
      <button type="button" onClick={onShare} aria-label={labels.share}><HandShare size={24} /></button>
    </div>
  );
}

export function PackFeed() {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { lang } = useLang();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, avatarUrl, avatarInitial } = usePackIdentity();
  const uid = session?.user?.id ?? null;
  const { dogs } = usePackUser(uid);

  const [room, setRoom] = useState<Room>('foryou');
  const [myPosts, setMyPosts] = useState<MePost[]>([]);
  const [viewing, setViewing] = useState<MePost[] | null>(null);
  const [favs, setFavs] = useState<Set<string>>(() => readFavIds());
  const likes = useLocalLikes();
  const trips = useFeedTrips();
  const scrolls = useDemoScrolls();
  const scrollLiked = useLiked();
  const scrollSaved = useSaved();

  // Plochý papyrus: tapeta PackLayoutu sa pre túto stránku vypne (CSS vyššie).
  useEffect(() => {
    document.body.classList.add('pkf-on');
    return () => document.body.classList.remove('pkf-on');
  }, []);

  // Moje živé stories (24 h) — ťuk na „Ty" ich prehrá, `+` otvorí tvorbu.
  useEffect(() => {
    if (!uid) return;
    let alive = true;
    const load = () => fetchMyPosts(uid).then((rows) => { if (alive) setMyPosts(rows); }).catch(() => { if (alive) setMyPosts([]); });
    void load();
    const off = onPostsChanged(load);
    return () => { alive = false; off(); };
  }, [uid]);
  const myLive = useMemo(() => myPosts.filter((p) => isMoment(p) && isLive(p)).reverse(), [myPosts]);

  const { quote, bg, day } = useMemo(() => feedQuoteForDay(), []);
  const quoteText = feedQuoteText(quote, lang);

  // Zvitok dňa: z tých, čo majú obraz a text v jazyku appky; rotuje po dni.
  const scroll: DemoScroll | null = useMemo(() => {
    const ok = scrolls.filter((z) => z.img && pickText(z, lang)?.t);
    return ok.length ? ok[day % ok.length] : null;
  }, [scrolls, lang, day]);

  // Autori výletov = kruhy v rade príbehov (bez mňa — ja mám svoj). Nie sú to stories, preto hairline prstenec.
  const authors = useMemo(() => {
    const seen = new Set<string>();
    const out: FeedTrip[] = [];
    for (const tr of trips) {
      const key = tr.author.toLowerCase();
      if (tr.mine || !tr.author || seen.has(key)) continue;
      seen.add(key); out.push(tr);
    }
    return out;
  }, [trips]);

  const labels = {
    like: tx('pack.feed.act.like', 'Like'),
    save: tx('pack.feed.act.save', 'Save'),
    use: tx('pack.feed.act.use', 'Add to my trips'),
    share: tx('pack.feed.act.share', 'Share'),
  };
  const say = (title: string) => toast({ title });
  const doShare = async (data: { title: string; text?: string; url: string }) => {
    if ((await shareOut(data)) === 'copied') say(tx('pack.feed.toast.copied', 'Link copied'));
  };

  const ownName = firstWord((dogs[0]?.owner_name || '').trim()) || tx('pack.feed.you', 'You');
  const youImg = avatarUrl || dogs[0]?.cloudinary_main_url || null;

  const toggleFav = (id: string) => {
    const next = new Set(favs);
    const on = !next.has(id);
    if (on) next.add(id); else next.delete(id);
    persistFav(next);
    setFavs(next);
    say(on ? tx('pack.feed.toast.saved', 'Saved') : tx('pack.feed.toast.unsaved', 'Removed from saved'));
  };

  const fmtKm = (km: string) => {
    const n = Number(km);
    return n > 0 ? n.toLocaleString(intlLocale(lang), { maximumFractionDigits: 1 }) : '';
  };

  const showQuote = room === 'foryou';
  const showScroll = (room === 'foryou' || room === 'scrolls') && !!scroll;
  const showTrips = room === 'foryou' || room === 'trips';
  const firstTrips = trips.slice(0, 1);
  const restTrips = trips.slice(1);

  const tripCard = (ft: FeedTrip) => {
    const tr = ft.trail;
    const km = fmtKm(tr.km);
    const meta = [km && `${km} km`, tr.ascentM ? `+${tr.ascentM} m` : ''].filter(Boolean).join(' · ');
    const when = agoLabel(ft.at, lang);
    return (
      <article key={tr.id} className="pkf-post">
        <div className="pkf-ph">
          <div className="pkf-av" style={ft.mine && youImg ? { backgroundImage: `url(${sizedUrl(youImg, 80)})` } : undefined}>
            {!(ft.mine && youImg) && (ft.author || '?').charAt(0).toUpperCase()}
          </div>
          <div className="pkf-who">
            <b>{ft.author || tx('pack.feed.member', 'Member')}</b>
            <small>{[tr.region, when].filter(Boolean).join(' · ')}</small>
          </div>
        </div>
        <div className="pkf-media" role="img" aria-label={tripTitle(tr, lang)}
          style={{ backgroundImage: `url(${sizedUrl(tr.photos[0], 1080)})`, backgroundPosition: `50% ${tr.coverY ?? 50}%` }} />
        <div className="pkf-trip">
          <div className="tt">
            <b>{tripTitle(tr, lang)}</b>
            {meta && <small>{meta}</small>}
          </div>
          <button type="button" onClick={() => navigate(tripPath(tr))}>{tx('pack.feed.trip.detail', 'Detail')}</button>
        </div>
        <Actions
          labels={labels}
          // TODO backend: ❤️ výletu = len toto zariadenie (`post_marks` kľúčuje `posts.id`, výlet nie je príspevok).
          liked={likes.has(`trip:${tr.id}`)} onLike={() => likes.toggle(`trip:${tr.id}`)}
          // 🔖 výlet → triplist (lock §4.2): `trip_fav` s write-through do DB, ten istý zoznam ako ★ v článku.
          saved={favs.has(tr.id)} onSave={() => toggleFav(tr.id)}
          // ➕ použiť → do mojich výletov (`ensureMyTrip`, bez dátumu) — ostávam na mieste, len hláška.
          onUse={() => say(ensureMyTrip(tr.id)
            ? tx('pack.feed.toast.planned', 'Added to your trips')
            : tx('pack.feed.toast.planned2', 'Already in your trips'))}
          onShare={() => doShare({ title: tripTitle(tr, lang), url: `${window.location.origin}${tripPath(tr)}` })}
        />
      </article>
    );
  };

  const empty = (room === 'trips' && trips.length === 0) || (room === 'scrolls' && !scroll);

  return (
    <div className="pkf">
      <style>{CSS}</style>
      <div className="pkf-col">
        {/* ── RAD PRÍBEHOV: Ty · AINUBIS · autori najnovších výletov ── */}
        <div className="pkf-stories">
          {STORIES_ON && <button type="button" className="pkf-st"
            onClick={() => (myLive.length ? setViewing(myLive) : openCompose('moment'))}
            aria-label={tx('pack.me.stories', 'Stories')}>
            <span className={`pkf-ring${myLive.length ? '' : ' none'}`} style={{ display: 'block' }}>
              <span className="im" style={youImg ? { backgroundImage: `url(${sizedUrl(youImg, 160)})`, display: 'block' } : undefined}>
                {!youImg && avatarInitial}
              </span>
              <span className="pkf-plus" role="button" aria-label={tx('pack.create.story.title', 'Story')}
                onClick={(e) => { e.stopPropagation(); openCompose('moment'); }}><HandPlus size={12} /></span>
            </span>
            <span className="pkf-n">{tx('pack.feed.you', 'You')}</span>
          </button>}
          <button type="button" className="pkf-st" onClick={() => navigate('/pack/ainubis')}>
            <span className="pkf-ring ai" style={{ display: 'block' }}>
              <span className="im" style={{ backgroundImage: `url(${ainubisHead})`, display: 'block' }} />
            </span>
            <span className="pkf-n"><span className="ai">AI</span>NUBIS</span>
          </button>
          {authors.map((ft) => (
            <button key={ft.author} type="button" className="pkf-st" onClick={() => navigate(tripPath(ft.trail))}>
              <span className="pkf-ring plain" style={{ display: 'block' }}>
                <span className="im" style={{ backgroundImage: `url(${sizedUrl(ft.trail.photos[0], 160)})`, display: 'block' }} />
              </span>
              <span className="pkf-n">{firstWord(ft.author)}</span>
            </button>
          ))}
        </div>

        {/* ── ŠTÍTKY (nový feed = nový štítok, nie tab — lock §4.3) ── */}
        <div className="pkf-rooms" role="tablist">
          {([
            ['foryou', tx('pack.feed.tag.foryou', 'For you')],
            ['trips', tx('pack.feed.tag.trips', 'Trips')],
            ['scrolls', tx('pack.feed.tag.scrolls', 'Scrolls')],
          ] as Array<[Room, string]>).map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={room === k}
              className={`pk-pill pk-pill--tap pkf-chip${room === k ? ' on' : ''}`} onClick={() => setRoom(k)}>{label}</button>
          ))}
        </div>

        {/* ── CITÁT DŇA ── */}
        {showQuote && (
          <article className="pkf-post">
            <div className="pkf-ph">
              <div className="pkf-av logo" style={{ backgroundImage: `url(${logo2026})` }} />
              <div className="pkf-who"><b>DOGYPT</b><small>{tx('pack.feed.quote.title', 'Quote of the day')}</small></div>
            </div>
            <div className="pkf-media" style={{ backgroundImage: `url(${bg})` }}>
              <div className="pkf-quote">
                <q>{quoteText}</q>
                {quote.author && <cite>{quote.author}</cite>}
              </div>
            </div>
            <Actions
              labels={labels}
              // TODO backend: ❤️ a 🔖 citátu = len toto zariadenie (citát nie je riadok `posts`).
              liked={likes.has(`quote:${quote.id}`)} onLike={() => likes.toggle(`quote:${quote.id}`)}
              saved={likes.has(`quote-save:${quote.id}`)} onSave={() => likes.toggle(`quote-save:${quote.id}`)}
              onShare={() => doShare({
                title: 'DOGYPT',
                text: `„${quoteText}“${quote.author ? ` — ${quote.author}` : ''}`,
                url: window.location.origin,
              })}
            />
          </article>
        )}

        {/* ── VÝLETY (najnovší hneď po citáte, zvitok za ním, zvyšok pod ním) ── */}
        {showTrips && firstTrips.map(tripCard)}

        {/* ── AINUBIS — ZVITOK DŇA ── */}
        {showScroll && scroll && (() => {
          const tt = pickText(scroll, lang);
          const open = () => navigate(`/pack/ainubis/zvitok/${scroll.id}`, { state: { back: '/pack' } });
          return (
            <article className="pkf-post" style={{ paddingBottom: S.lg }}>
              <div className="pkf-ph">
                <div className="pkf-av ai" style={{ backgroundImage: `url(${ainubisHead})` }} />
                <div className="pkf-who">
                  <b><span className="ai">AI</span>NUBIS</b>
                  <small>{tx('pack.feed.scroll.label', 'Scroll of the day')}{tt.min ? ` · ${tt.min} min` : ''}</small>
                </div>
              </div>
              <div className="pkf-ai">
                <img src={scroll.img} alt="" loading="lazy" />
                <h3>{tt.t}</h3>
                {tt.v && <p>{tt.v}</p>}
                <div className="row"><span /><button type="button" className="go" onClick={open}>{tx('pack.feed.scroll.read', 'Read')}</button></div>
              </div>
              <Actions
                labels={labels}
                // ❤️ a 🔖 zvitku = `vault_reads` (ten istý stav ako vo VAULTE), nie lokálne.
                liked={scrollLiked.includes(scroll.id)} onLike={() => toggleLiked(scroll.id)}
                saved={scrollSaved.includes(scroll.id)} onSave={() => toggleSaved(scroll.id)}
                onShare={() => doShare({ title: tt.t, text: tt.v, url: `${window.location.origin}/pack/ainubis/zvitok/${scroll.id}` })}
              />
            </article>
          );
        })()}

        {showTrips && restTrips.map(tripCard)}

        {empty && (
          <div className="pkf-empty">
            {room === 'trips' ? tx('pack.feed.empty.trips', 'No trips from the pack yet.') : tx('pack.feed.empty.scrolls', 'No scrolls yet.')}
          </div>
        )}

        <div className="pkf-end">
          <BrandIcon name="paw" size={32} tint="gold" />
          <b>{tx('pack.feed.end.title', 'You have seen it all')}</b>
          {tx('pack.feed.end.sub', 'A new quote tomorrow.')}
        </div>
      </div>

      {viewing && (
        <StoryViewer items={viewing} start={0} name={ownName} avatar={youImg} dogs={dogs} mine lang={lang} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}
