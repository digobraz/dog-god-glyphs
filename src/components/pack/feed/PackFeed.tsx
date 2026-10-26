// FEED 2 — DOMOV `/pack` (26. 10. 2026, len za TEST_BUILD — `pages/Pack.tsx`).
//
// Nákres `plany/nakres-feed-2026-10-26.html` v4 (Matej 26. 10.: *„je to ok"*). Oproti FEED 1.0 (24. 10.):
//   · príbehy (rad kruhov) a štítky PREČ
//   · hlavička sticky (PackLayout `pk-plain`), lupa vedľa AINUBISA — rieši `pages/Pack.tsx`
//   · pás pod hlavičkou: AINUBIS doska → Sniffer „Kto hľadá parťáka" → Najnovšie výlety (`FeedTop.tsx`)
//   · AINUBIS = HOVORCA: citát dňa, príbeh, odložené zvitky — všetko v jeho tmavom šate (`FeedAinubis.tsx`)
//   · zvitok = TEN ISTÝ blok ako v DOGSCROLLe (`ScrollCard` zo `ScrollParts.tsx`), nie kópia
//   · výlet = karta ako na /map (`FeedTripCard.tsx`), uloženie = TRIPLIST
//   · príspevok člena (`FeedPostCard.tsx`) — uloženie podľa otázky pri pridaní: 🎯 TRIPWISH alebo ☆
// Poradie (nákres blok 9): citát → výlet → zvitok → člen → výlet → AINUBIS → zvitok → … zvyšok striedavo.
//
// ŠÍRKA: stĺpec 560 px aj na PC — feed je mediálny stĺpec ako na Instagrame (fotka 4:5 na 832 px by bola
// vyššia než okno) a 560 schválil Matej v nákrese 24. 10. (obrazovka 5). Užší než PACK_COL_INNER úmyselne.
//
// 🔴 PRÁZDNE JE PRÁZDNE. Chýbajúce dáta sa nenahrádzajú vymyslenými osobami ani číslami — čo potrebuje server
//    (cudzí autori, lajky výletov a citátov, komentáre výletu, ankety), je v `feedData.ts` a v zozname migrácií.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang, useT } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { usePackUser } from '@/hooks/usePackUser';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, PILL_CSS, MEDALLION_CSS, PAPER_BG } from '@/components/pack/packTheme';
import { LAPIS, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { ScrollCard, SCROLL_CSS, SCROLL_CARD_CSS } from '@/components/pack/vault/ScrollParts';
import { useDemoScrolls, useSaved, pickText, type DemoScroll } from '@/components/pack/vault/vaultScrolls';
import { VAULT_WORLDS } from '@/components/pack/vault/worlds';
import { PostViewer } from '@/components/pack/profile/PostViewer';
import { fetchMyPosts, onPostsChanged, isMoment, isAlbum, isTripStory, type MePost } from '@/components/pack/profile/mePosts';
import { readFavIds } from '@/components/pack/tripShared';
import { persistFav } from '@/lib/packStore';
import { feedQuoteForDay, feedQuoteText } from '@/data/feedQuotes';
import { firstWord, useFeedTrips, useLocalLikes } from './feedData';
import { FeedTripCard, FEED_TRIP_CSS } from './FeedTripCard';
import { FeedPostCard, FEED_POST_CSS } from './FeedPostCard';
import { AiQuote, AiSaved, AiStory, FEED_AI_CSS } from './FeedAinubis';
import { SnifferStrip, TripStrip, FEED_TOP_CSS } from './FeedTop';
import { FeedMapCard, FEED_MAP_CSS, useMapAdds, type MapAdd } from './FeedMapCard';
import { POST_TAGS, postTopics } from './postTags';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

/** Výjavy citátov (šablóna B, 16:9, ľavá polovica voľný papyrus) — `public/feed/citaty/c1–c30.webp`. */
const SCENES = 30;

const CSS = `
${PILL_CSS}
${MEDALLION_CSS}
${FEED_TRIP_CSS}
${FEED_POST_CSS}
${FEED_AI_CSS}
${FEED_TOP_CSS}
${FEED_MAP_CSS}
/* Feed je PLOCHÝ papyrus bez tapety (Matej 24. 10.: „layout bez toho čierneho pozadia ako je aj na ig"). */
body.pkf-on .pk-paper{background-color:${PAPER_BG};}
body.pkf-on .pk-paper::before,body.pkf-on .pk-paper::after{display:none;}
.pkf{color:${T.inkStrong};}
.pkf-col{max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:${S.lg}px;padding-bottom:${S.xl}px;}
.pkf-top{display:flex;flex-direction:column;gap:${S.lg}px;padding-bottom:${S.lg}px;border-bottom:1px solid ${T.hairline};}
.pkf-tags{display:flex;gap:${S.sm}px;overflow-x:auto;scrollbar-width:none;margin:0 -${S.lg}px;padding:0 ${S.lg}px ${S.xs}px;}
.pkf-tags::-webkit-scrollbar{display:none;}
.pkf-tag{flex:none;display:inline-flex;align-items:center;gap:${S.xs}px;padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;border:1.5px solid ${T.border};
  background:${T.card};color:${T.inkStrong};font-family:${FONT_UI};font-weight:500;font-size:${TX.label}px;white-space:nowrap;}
.pkf-tag.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
.pkf-none{padding:${S.xl}px ${S.lg}px;text-align:center;font-size:${TX.label}px;color:${T.inkWarm};}
.pkf-end{padding:${S.xl}px ${S.lg}px;text-align:center;font-size:${TX.label}px;color:${T.inkWarm};}
.pkf-end img{margin:0 auto;}
.pkf-end b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;line-height:1.3;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};margin:${S.sm}px 0 ${S.xs}px;} /* písmo: nadpis */
`;

type Item =
  | { k: 'quote' }
  | { k: 'trip'; i: number }
  | { k: 'scroll'; z: DemoScroll }
  | { k: 'post'; p: MePost }
  | { k: 'map'; a: MapAdd }
  | { k: 'story' }
  | { k: 'saved' };

export function PackFeed() {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { lang } = useLang();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, avatarUrl } = usePackIdentity();
  const uid = session?.user?.id ?? null;
  const { dogs } = usePackUser(uid);

  const [myPosts, setMyPosts] = useState<MePost[]>([]);
  const [topic, setTopic] = useState<string | null>(null);
  const [reading, setReading] = useState<MePost | null>(null);
  const [favs, setFavs] = useState<Set<string>>(() => readFavIds());
  const likes = useLocalLikes();
  const trips = useFeedTrips(12);
  const mapAdds = useMapAdds(6);
  const scrolls = useDemoScrolls();
  const savedIds = useSaved();

  // Plochý papyrus: tapeta PackLayoutu sa pre túto stránku vypne (CSS vyššie).
  useEffect(() => {
    document.body.classList.add('pkf-on');
    return () => document.body.classList.remove('pkf-on');
  }, []);

  // Moje príspevky (cudzie potrebujú RPC s autorom — zoznam migrácií).
  useEffect(() => {
    if (!uid) return;
    let alive = true;
    const load = () => fetchMyPosts(uid).then((rows) => { if (alive) setMyPosts(rows); }).catch(() => { if (alive) setMyPosts([]); });
    void load();
    const off = onPostsChanged(load);
    return () => { alive = false; off(); };
  }, [uid]);
  // FILTER TÉM (krok 5): pilulka vyberie len príspevky s daným štítkom `t:*` — ostatné bloky feedu sa skryjú.
  const tagged = useMemo(
    () => (topic ? myPosts.filter((p) => !isMoment(p) && !isAlbum(p) && !isTripStory(p) && p.visibility === 'public' && postTopics(p).includes(topic)) : []),
    [myPosts, topic],
  );
  const posts = useMemo(
    () => myPosts.filter((p) => !isMoment(p) && !isAlbum(p) && !isTripStory(p) && p.visibility === 'public' && p.photos.length > 0).slice(0, 6),
    [myPosts],
  );

  const { quote, bg: photoBg, day } = useMemo(() => feedQuoteForDay(), []);
  const quoteText = feedQuoteText(quote, lang);
  // Citát dňa striedavo A (fotka) / B (výjav) po dni — oba tvary sú v nákrese odklepnuté.
  const variant: 'a' | 'b' = day % 2 ? 'a' : 'b';
  const quoteBg = variant === 'b' ? `/feed/citaty/c${(day % SCENES) + 1}.webp` : photoBg;

  // Zvitky dňa: dva, rotujú po dni; odložené (☆) idú do vlastnej karty, nie medzi nové.
  const names = useMemo(() => VAULT_WORLDS.map((w) => tx(`pack.ainubis.world.${w.key}`, w.en)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]);
  const worldName = (key: string) => names[VAULT_WORLDS.findIndex((w) => w.key === key)];
  const dayScrolls = useMemo(() => {
    const ok = scrolls.filter((z) => z.img && pickText(z, lang)?.t && !savedIds.includes(z.id));
    if (!ok.length) return [];
    return [ok[day % ok.length], ok[(day + 7) % ok.length]].filter((z, i, a) => a.indexOf(z) === i);
  }, [scrolls, lang, day, savedIds]);
  const savedScrolls = useMemo(() => savedIds.map((id) => scrolls.find((z) => z.id === id)).filter((z): z is DemoScroll => !!z), [savedIds, scrolls]);

  const ownName = firstWord((dogs[0]?.owner_name || '').trim()) || tx('pack.feed.you', 'You');
  const youImg = avatarUrl || dogs[0]?.cloudinary_main_url || null;

  const toggleFav = (id: string) => {
    const next = new Set(favs);
    const on = !next.has(id);
    if (on) next.add(id); else next.delete(id);
    persistFav(next);
    setFavs(next);
    toast({ title: on ? tx('pack.feed.toast.listed', 'Added to your TRIPLIST') : tx('pack.feed.toast.unlisted', 'Removed from TRIPLIST') });
  };
  const openScroll = (id: string, focus?: 'pod' | 'src' | 'talk') =>
    navigate(`/pack/ainubis/zvitok/${id}`, { state: { back: '/pack', focus } });

  // Poradie z nákresu (blok 9); čo chýba, sa preskočí, zvyšok výletov a príspevkov ide striedavo na koniec.
  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    const tq = trips.map((_, i) => i);
    const pq = [...posts];
    const sq = [...dayScrolls];
    if (savedScrolls.length) out.push({ k: 'saved' });
    out.push({ k: 'quote' });
    const mq = [...mapAdds];
    const pattern: Array<'trip' | 'scroll' | 'post' | 'story' | 'map'> = ['trip', 'scroll', 'post', 'map', 'trip', 'story', 'scroll', 'map', 'map'];
    for (const k of pattern) {
      if (k === 'trip' && tq.length) out.push({ k: 'trip', i: tq.shift() as number });
      else if (k === 'scroll' && sq.length) out.push({ k: 'scroll', z: sq.shift() as DemoScroll });
      else if (k === 'post' && pq.length) out.push({ k: 'post', p: pq.shift() as MePost });
      else if (k === 'map' && mq.length) out.push({ k: 'map', a: mq.shift() as MapAdd });
      else if (k === 'story') out.push({ k: 'story' });
    }
    while (tq.length || pq.length) {
      if (tq.length) out.push({ k: 'trip', i: tq.shift() as number });
      if (pq.length) out.push({ k: 'post', p: pq.shift() as MePost });
    }
    return out;
  }, [trips, posts, dayScrolls, savedScrolls.length, mapAdds]);

  const aiLabels = { like: tx('pack.feed.act.like', 'Like'), save: tx('pack.feed.act.save', 'Save'), more: tx('pack.feed.more', 'more') };

  const render = (it: Item, n: number) => {
    switch (it.k) {
      case 'quote':
        return (
          <AiQuote key="quote" text={quoteText} author={quote.author} bg={quoteBg} variant={variant}
            sub={tx('pack.feed.quote.title', 'Quote of the day')} labels={aiLabels}
            // TODO backend: labka a ☆ citátu = len toto zariadenie (citát nie je riadok `posts`).
            liked={likes.has(`quote:${quote.id}`)} onLike={() => likes.toggle(`quote:${quote.id}`)}
            saved={likes.has(`quote-save:${quote.id}`)} onSave={() => likes.toggle(`quote-save:${quote.id}`)} />
        );
      case 'trip': {
        const ft = trips[it.i];
        return (
          <FeedTripCard key={`t:${ft.trail.id}`} ft={ft} youImg={youImg}
            liked={likes.has(`trip:${ft.trail.id}`)} onLike={() => likes.toggle(`trip:${ft.trail.id}`)}
            listed={favs.has(ft.trail.id)} onList={() => toggleFav(ft.trail.id)} />
        );
      }
      case 'scroll':
        return <ScrollCard key={`z:${it.z.id}`} z={it.z} lang={lang} worldName={worldName(it.z.world)} onOpen={openScroll} onShare={() => {}} />;
      case 'post':
        return <FeedPostCard key={`p:${it.p.id}`} post={it.p} name={ownName} avatar={youImg} onOpen={setReading} />;
      case 'map':
        return (
          <FeedMapCard key={it.a.id} add={it.a} liked={likes.has(`map:${it.a.id}`)} onLike={() => likes.toggle(`map:${it.a.id}`)} />
        );
      case 'story':
        return (
          <AiStory key="story" src="/videos/WHO_IS_HEKTHOR.mp4" poster="/videos/WHO_IS_HEKTHOR.webp"
            title={`${t('heroglyph.flow.name.whoTitle')} ${t('heroglyph.flow.name.whoTitleName')}`}
            body={t('heroglyph.flow.name.whoBody')} sub={tx('pack.feed.story.label', 'Story')} labels={aiLabels}
            liked={likes.has('story:hekthor')} onLike={() => likes.toggle('story:hekthor')}
            saved={likes.has('story-save:hekthor')} onSave={() => likes.toggle('story-save:hekthor')} />
        );
      case 'saved':
        return <AiSaved key={`saved:${n}`} list={savedScrolls} lang={lang} onOpen={(id) => openScroll(id)} />;
    }
  };

  return (
    <div className="pkf">
      <style>{SCROLL_CSS}{SCROLL_CARD_CSS}{CSS}</style>
      <div className="pkf-col">
        {/* ── PÁS POD HLAVIČKOU: Sniffer → Najnovšie výlety. Doska AINUBISa odišla do upozornení
            (chvost v hlavičke, `AinubisOznam.tsx`) — Matej 26. 10.: „ten prvý oznam ainubisa je ok
            ALE schovaj ho do upozornenia". ── */}
        <div className="pkf-top">
          <SnifferStrip />
          <TripStrip trips={trips.slice(0, 8)} />
        </div>

        {/* FILTER TÉM — tie isté pilulky ako pri pridávaní príspevku (`postTags.ts`). */}
        <div className="pkf-tags" role="group" aria-label={tx('pack.feed.tag.filter', 'Topics')}>
          {POST_TAGS.map((d) => (
            <button key={d.tag} type="button" className={`pkf-tag${topic === d.tag ? ' on' : ''}`} aria-pressed={topic === d.tag}
              onClick={() => setTopic((c) => (c === d.tag ? null : d.tag))}>
              <BrandIcon name={d.icon} size={16} tint="dark" />{tx(d.i18n, d.fallback)}
            </button>
          ))}
        </div>

        {topic
          ? (tagged.length
            ? tagged.map((p) => <FeedPostCard key={`p:${p.id}`} post={p} name={ownName} avatar={youImg} onOpen={setReading} />)
            : <p className="pkf-none">{tx('pack.feed.tag.empty', 'No posts with this topic yet.')}</p>)
          : items.map(render)}

        {!topic && <div className="pkf-end">
          <BrandIcon name="paw" size={32} tint="gold" />
          <b>{tx('pack.feed.end.title', 'You have seen it all')}</b>
          {tx('pack.feed.end.sub', 'A new quote tomorrow.')}
        </div>}
      </div>

      {reading && (
        <PostViewer post={reading} name={ownName} avatar={youImg} dogs={dogs} mine lang={lang} onClose={() => setReading(null)} />
      )}
    </div>
  );
}
