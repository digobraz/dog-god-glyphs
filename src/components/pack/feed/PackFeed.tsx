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
// 🔁 KOLO 4 (Matej 26. 10. neskoro, test v appke):
//   · príspevky PLOCHO cez celú šírku, nie v blokoch (`.pkf-it`, na mobile od okraja po okraj)
//   · SNIFFER na ZAČIATKU aj na konci · nadpis výletov už nie je pod prechodom hlavičky (`padding-top`)
//   · VŠETKY zvitky (108) a všetky výlety, dávkovo pri scrollovaní (`PAGE` + strážca na konci zoznamu)
//   · lupa = HĽADANIE VO FEEDE (`/pack?hladaj=`), nie Sniffer · témy = dlaždice s ikonou, filtrujú aj výlety a zvitky
//   · značky a TRIPWISH z mapy vo feede nie sú (`FeedMapCard.tsx`) · návrat z výletu/Sniffera na to isté miesto feedu
// 🔴 PRÁZDNE JE PRÁZDNE. Chýbajúce dáta sa nenahrádzajú vymyslenými osobami ani číslami — čo potrebuje server
//    (cudzí autori, lajky výletov a citátov, komentáre výletu, ankety), je v `feedData.ts` a v zozname migrácií.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent as RMouseEvent } from 'react';
import { useNavigate, useNavigationType, useSearchParams } from 'react-router-dom';
import { canStepBack } from '@/lib/stepBack';
import { HandSearch } from '@/components/pack/HandIcons';
import { useLang, useT } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { usePackUser } from '@/hooks/usePackUser';
import { useProfile } from '@/components/pack/profile/packProfile';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, PACK_COL_PAD, FONT_TITLE, FONT_UI, PILL_CSS, MEDALLION_CSS, PAPER_BG } from '@/components/pack/packTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { LAPIS, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { ScrollCard, SCROLL_CSS, SCROLL_CARD_CSS, scrollUI } from '@/components/pack/vault/ScrollParts';
import { useDemoScrolls, useSaved, pickText, type DemoScroll } from '@/components/pack/vault/vaultScrolls';
import { VAULT_WORLDS } from '@/components/pack/vault/worlds';
import { PostViewer } from '@/components/pack/profile/PostViewer';
import { fetchMyPosts, onPostsChanged, isMoment, isAlbum, isTripStory, type MePost } from '@/components/pack/profile/mePosts';
import { readFavIds, tripText } from '@/components/pack/tripShared';
import { persistFav } from '@/lib/packStore';
import { feedQuoteForDay, feedQuoteText } from '@/data/feedQuotes';
import { firstWord, tripTitle, useFeedTrips, type FeedTrip, useFeedMarks, useFeedPosts, useFeedPostDogs, useTripAuthors, fetchFeedPost, type FeedPost } from './feedData';
import { FeedTripCard, FEED_TRIP_CSS } from './FeedTripCard';
import { FeedPostCard, FEED_POST_CSS } from './FeedPostCard';
import { AiHead, AiQuote, AiSaved, AiStory, FEED_AI_CSS } from './FeedAinubis';
import { SnifferStrip, TripStrip, FEED_TOP_CSS } from './FeedTop';
import { QuoteComments } from './QuoteComments';
import { fetchQuoteComments } from '@/components/pack/trip/tripCommentsData';
import { FeedMapCard, FEED_MAP_CSS, useMapAdds, type MapAdd } from './FeedMapCard';
import { postTopics } from './postTags';
import { FeedTopics, FEED_TOPICS_CSS } from './FeedTopics';
import { useBlockedOwners } from '@/components/pack/profile/moderation';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

/** Výjavy citátov (šablóna B, 16:9, ľavá polovica voľný papyrus) — `public/feed/citaty/c1–c30.webp`. */
const SCENES = 30;
/** Dávka príspevkov: prvá obrazovka + každé ďalšie dobratie pri scrollovaní (108 zvitkov naraz by zahltilo mobil). */
const PAGE = 12;
/** Kde bol človek vo feede — návrat z výletu/Sniffera ho vráti na to isté miesto (krok späť = krok pred). */
const POS_KEY = 'pkf-pos-v1';

/** Témy → svety VAULTu: zvitky patria do feedu pod témou, ktorej sa týkajú (Znalosti = všetky). */
const TOPIC_WORLDS: Record<string, string[] | 'all'> = {
  't:health': ['anatomy', 'nutrition', 'prevention'],
  't:train': ['training', 'problems'],
  't:learn': 'all',
};

/** Hľadanie bez diakritiky a veľkosti písmen („vylet" nájde „Výlet"). */
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const CSS = `
${PILL_CSS}
${MEDALLION_CSS}
${FEED_TRIP_CSS}
${FEED_POST_CSS}
${FEED_AI_CSS}
${FEED_TOP_CSS}
${FEED_MAP_CSS}
${FEED_TOPICS_CSS}
/* MOBIL: PLOCHÝ papyrus bez tapety (Matej 24. 10.: „layout bez toho čierneho pozadia ako je aj na ig").
   PC (od 768): tapeta a príspevky v blokoch ostávajú (Matej 26. 10., kolo 5: „na pc by som vrátil ten štýl pozadie
   a obsah na bloku… len na jednom pozadí to nevyzerá dobre"). */
@media (max-width:767px){
  body.pkf-on .pk-paper{background-color:${PAPER_BG};}
  body.pkf-on .pk-paper::before,body.pkf-on .pk-paper::after{display:none;}
}
.pkf{color:${T.inkStrong};}
.pkf.srch{min-height:100dvh;}
/* padding-top: prvý nadpis nesmie začínať v prechode sticky hlavičky (Matej 26. 10.: „nie je to dobre vidieť"). */
.pkf-col{max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:${S.lg}px;padding:${S.lg}px 0 ${S.xl}px;}
.pkf-top{display:flex;flex-direction:column;gap:${S.lg}px;}

/* HĽADANIE VO FEEDE (lupa v hlavičke) */
.pkf-sb{display:flex;align-items:center;gap:${S.sm}px;padding:${S.sm}px ${S.md}px;border-radius:${PACK_R.field}px;border:1.5px solid ${LAPIS.edge};background:${T.card};}
.pkf-sb input{flex:1;min-width:0;border:0;outline:0;background:none;font:500 ${TX.lead}px/1.3 ${FONT_UI};color:${T.inkStrong};}
.pkf-sb button{flex:none;background:none;border:0;padding:${S.xs}px;cursor:pointer;font:600 ${TX.label}px/1 ${FONT_UI};color:${LAPIS.edge};}
.pkf-sinfo{margin:-${S.sm}px 0 0;font-size:${TX.label}px;color:${T.inkWarm};}

/* PRÍSPEVOK CEZ CELÚ ŠÍRKU — bez rámu bloku; papyrusové delí vlasová čiara, AINUBIS nesie vlastný tmavý pás. */
.pkf-list{display:flex;flex-direction:column;gap:${S.lg}px;}
.pkf-it.pap{border-top:1px solid ${T.hairline};}
/* PC (od 768): tapeta + CELÝ STRED NA JEDNOM BLOKU (Matej 26. 10., kolo 6: „obsah čo je v strede bude na bloku
   a ten blok bude nad pozadím… nie že obsah bude plávať nad pozadím"). Príspevky vnútri ostávajú ploché. */
@media (min-width:768px){
  body.pkf-on .pk-paper.pk-plain::before,body.pkf-on .pk-paper.pk-plain::after{display:block;}
  .pkf .pkf-col{max-width:608px;padding:${S.xl}px;background:${T.cardGrad};border:1.5px solid ${T.cardEdge};border-radius:${PACK_R.card}px;box-shadow:${T.cardShadow};}
  .pkf-col .pfs-strip{margin:0 -${S.xl}px;}
  .pkf-col .pkf-tags{margin-left:-${S.xl}px;margin-right:-${S.xl}px;}
  .pkf-col .pkf-tags,.pkf-col .pfs-strip{padding-left:${S.xl}px;padding-right:${S.xl}px;scroll-padding-inline:${S.xl}px;}
}
@media (max-width:639px){
  .pkf-it{margin:0 -${PACK_COL_PAD.mobile}px;}
  .pkf-it .fai,.pkf-it .akv-zv{border-radius:0;border-left-width:0;border-right-width:0;}
}
/* ZVITOK vo feede: hlavička AINUBISA ako pri príspevkoch; hlavné CTA „vypočuť“ = PLNÝ cyan (výber AINUBISA),
   „prečítať“ ostáva sekundárne obrysové (Matej 28. 10.). */
.pkf .akv-zv > .fai-h{padding:0;}
.pkf .zv-ctas{flex-direction:column;}
.pkf .zv-ctas .akv-zvsec{order:-1;background:${AINUBIS.cyan};border-color:${AINUBIS.cyan};color:${AINUBIS.bgDeep};font-weight:600;}
.pkf .zv-ctas .akv-zvsec:hover{border-color:${AINUBIS.ink};}
.pkf-more{height:1px;}
.pkf-none{padding:${S.xl}px ${S.lg}px;text-align:center;font-size:${TX.label}px;color:${T.inkWarm};}
.pkf-end{padding:${S.xl}px ${S.lg}px;text-align:center;font-size:${TX.label}px;color:${T.inkWarm};}
.pkf-end img{margin:0 auto;}
.pkf-end b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;line-height:1.3;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};margin:${S.sm}px 0 ${S.xs}px;} /* písmo: nadpis */
`;

type Item =
  | { k: 'quote' }
  | { k: 'trip'; i: number }
  | { k: 'scroll'; z: DemoScroll }
  | { k: 'post'; p: PostIt }
  | { k: 'map'; a: MapAdd }
  | { k: 'story' }
  | { k: 'saved' };

/** Príspevok vo feede: môj (bez `who`) alebo cudzí s tvárou autora zo servera. */
type PostIt = { p: MePost; who?: FeedPost };

/** Kľúč v `feed_marks` pre položku feedu (príspevok má vlastné `post_marks`, zvitok svoje uloženie). */
function keyTarget(it: Item, quoteId: number, trips: Array<{ trail: { id: string } }>): string {
  switch (it.k) {
    case 'quote': return `quote:${quoteId}`;
    case 'trip': return `trip:${trips[it.i].trail.id}`;
    case 'map': return `map:${it.a.id}`;
    case 'story': return 'story:hekthor';
    default: return '';
  }
}

/** Zo zásobníkov striedavo podľa vzoru, kým niečo zostáva — nič sa nezahodí. */
function weave(q: { trip: number[]; scroll: DemoScroll[]; post: PostIt[]; map: MapAdd[] }, story: boolean, thin = false): Item[] {
  const out: Item[] = [];
  const cycle: Array<'trip' | 'scroll' | 'post' | 'map' | 'story'> = ['trip', 'scroll', 'post', 'scroll', 'map', 'trip', 'scroll', 'story'];
  let told = !story;
  while (q.trip.length || q.scroll.length || q.post.length || q.map.length) {
    for (const k of cycle) {
      if (k === 'trip' && q.trip.length) out.push({ k: 'trip', i: q.trip.shift() as number });
      else if (k === 'scroll' && q.scroll.length) out.push({ k: 'scroll', z: q.scroll.shift() as DemoScroll });
      else if (k === 'post' && q.post.length) out.push({ k: 'post', p: q.post.shift() as PostIt });
      else if (k === 'map' && q.map.length) out.push({ k: 'map', a: q.map.shift() as MapAdd });
      else if (k === 'story' && !told) { out.push({ k: 'story' }); told = true; }
    }
  }
  // DVA ZVITKY HNEĎ ZA SEBOU NIE (Matej 28. 10.): keď by sa stretli, najbližšia neskoršia položka, ktorá zvitok nie je,
  // sa vytiahne dopredu. Ak už žiadna iná nezostala (zvitkov je viac než ostatných), susedstvo sa neodvráti.
  for (let i = 1; i < out.length; i++) {
    if (out[i].k !== 'scroll' || out[i - 1].k !== 'scroll') continue;
    const j = out.findIndex((it, x) => x > i && it.k !== 'scroll');
    if (j < 0) break;
    [out[i], out[j]] = [out[j], out[i]];
  }
  // ZVITKY NIE STENA (Matej 28. 10.): na hlavnom feede najviac 1 zvitok na 3 iné položky; zvitky navyše sa nezobrazia
  // (ostávajú vo VAULTe). Hľadanie a filter témy sa neriedia — tam človek zvitky hľadá sám.
  if (thin) {
    let gap = 3;
    return out.filter((it) => {
      if (it.k !== 'scroll') { gap++; return true; }
      if (gap < 3) return false;
      gap = 0;
      return true;
    });
  }
  return out;
}

export function PackFeed() {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { lang } = useLang();
  const navigate = useNavigate();
  const navType = useNavigationType();
  const [params, setParams] = useSearchParams();
  const { toast } = useToast();
  const { session, avatarUrl } = usePackIdentity();
  const uid = session?.user?.id ?? null;
  const { dogs } = usePackUser(uid);

  const [myPosts, setMyPosts] = useState<MePost[]>([]);
  const [topic, setTopic] = useState<string | null>(null);
  const [reading, setReading] = useState<PostIt | null>(null);
  const [favs, setFavs] = useState<Set<string>>(() => readFavIds());
  const marks = useFeedMarks();
  const feedTrips = useFeedTrips(999);
  const mapAdds = useMapAdds(6);
  const scrolls = useDemoScrolls();
  const savedIds = useSaved();

  // HĽADANIE žije v adrese (`?hladaj=`), takže späť ho zavrie a odkaz na výsledok sa vráti presne sem.
  const searching = params.has('hladaj');
  const query = (params.get('hladaj') || '').trim();
  const searchRef = useRef<HTMLInputElement>(null);
  // KATALÓG VÝLETOV PRE HĽADANIE: `useFeedTrips` vracia len schválené členské výlety s fotkou (kurátorovaný
  // dataset — napr. „Súľovské skaly“ — v ňom nie je), preto sa pri hľadaní dotiahne celý katalóg (lazy chunk).
  // Doplnené karty nemajú autora ani čas ⇒ „Hekthor & Matej“ ako inde v appke (`authorOf`).
  const [catalog, setCatalog] = useState<FeedTrip[]>([]);
  useEffect(() => {
    if (!searching || catalog.length) return;
    let alive = true;
    void import('@/data/heroTrails.generated').then(({ HERO_TRAILS }) => {
      if (alive) setCatalog(HERO_TRAILS.filter((tr) => !tr.id.startsWith('plan-') && !tr.id.startsWith('ovr-') && (tr.photos?.length ?? 0) > 0)
        .map((trail) => ({ trail, at: 0, mine: false, author: (trail.author || '').trim() || 'Hekthor & Matej' })));
    }).catch(() => {});
    return () => { alive = false; };
  }, [searching, catalog.length]);
  const trips = useMemo(() => {
    if (!searching || !catalog.length) return feedTrips;
    const have = new Set(feedTrips.map((f) => f.trail.id));
    return [...feedTrips, ...catalog.filter((f) => !have.has(f.trail.id))];
  }, [feedTrips, catalog, searching]);
  useEffect(() => { if (searching) searchRef.current?.focus(); }, [searching]);
  const setQuery = (v: string) => setParams({ hladaj: v }, { replace: true });
  const closeSearch = () => { if (canStepBack()) navigate(-1); else setParams({}, { replace: true }); };
  // Hľadanie sa zavrie aj ťukom MIMO lištu a výsledky (prázdne miesto pod nimi) a klávesom Esc — Matej 30. 10.:
  // „malo by sa to dať zavrieť aj inak než len kliknúť na zavrieť“.
  // Okná nad feedom (komentáre, otvorený príspevok) sú súrodenci `.pkf-col` — ťuk v nich hľadanie nezavrie.
  const closeOnOutside = (e: RMouseEvent<HTMLDivElement>) => {
    if (!searching) return;
    const el = e.target as HTMLElement;
    if (el !== e.currentTarget && (!el.closest('.pkf-col') || el.closest('.pkf-sb, .pkf-it'))) return;
    closeSearch();
  };
  useEffect(() => {
    if (!searching) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searching]);

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
  // CUDZIE verejné príspevky (server, 26. 10.) + moje; zablokovaných vynechá server, klient ešte skryje tých,
  // ktorých človek zablokoval práve teraz (zoznam z `useBlockedOwners` sa obnoví bez nového načítania feedu).
  const { rows: otherPosts, loadMore: loadMorePosts, done: postsDone } = useFeedPosts(!!uid);
  const blocked = useBlockedOwners();
  // Môj príspevok v KARANTÉNE (`hiddenAt`, server ho schová pred ostatnými) autor stále vidí — so štítkom „Čaká na kontrolu".
  // Súkromný (voľba „Only me") ostáva skrytý, ten `hiddenAt` nemá.
  const publicPosts = useMemo<PostIt[]>(() => [
    ...myPosts.filter((p) => !isMoment(p) && !isAlbum(p) && !isTripStory(p) && (p.visibility === 'public' || !!p.hiddenAt)).map((p) => ({ p })),
    ...otherPosts.filter((w) => w.ownerN == null || !blocked.has(w.ownerN)).map((w) => ({ p: w.post, who: w })),
  ].sort((a, b) => Date.parse(b.p.createdAt) - Date.parse(a.p.createdAt)), [myPosts, otherPosts, blocked]);

  // Mená psov k cudzím príspevkom — len keď sa hľadá (jedno volanie na dávku).
  const postDogs = useFeedPostDogs(publicPosts.filter((x) => x.who).map((x) => x.p.id), searching && query.length >= 2);

  const { quote, bg: photoBg, day } = useMemo(() => feedQuoteForDay(), []);
  const quoteText = feedQuoteText(quote, lang);
  // Komentáre pod citátom: vlákno patrí DŇU (citáty rotujú po 16 dňoch), kľúč `<id>-<deň>`.
  const quoteKey = `${quote.id}-${day}`;
  const [quoteCm, setQuoteCm] = useState(0);
  // Otvorené vlákno = jeho kľúč. Dnešný citát otvára `quoteKey`; upozornenie „AINUBIS ti odpísal" (27. 10.)
  // príde cez `?cm=<kľúč>` a môže patriť aj staršiemu dňu — vlákno sa otvorí aj tak.
  const [cmKey, setCmKey] = useState<string | null>(null);
  const cmParam = params.get('cm');
  // `&c=<id>` = komentár, na ktorý má vlákno / príspevok odrolovať (upozornenie „odpovedal na tvoj komentár").
  const [focusC, setFocusC] = useState<string | null>(null);
  useEffect(() => {
    if (!cmParam) return;
    setCmKey(cmParam);
    setFocusC(params.get('c'));
    const next = new URLSearchParams(params); next.delete('cm'); next.delete('c');
    setParams(next, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cmParam]);
  // `?post=<id>` (upozornenie na lajk/komentár) otvorí príspevok ako vrstvu nad feedom, tak ako ťuk na kartu.
  // Zatvorenie vrstvy = späť na feed (parameter sa z adresy hneď zmaže, žiadny extra krok v histórii).
  const postParam = params.get('post');
  useEffect(() => {
    if (!postParam || !uid) return;
    const c = params.get('c');
    const next = new URLSearchParams(params); next.delete('post'); next.delete('c');
    setParams(next, { replace: true });
    // Bez „on“ strážcu: parameter sa zmaže hneď, takže cleanup efektu by odpoveď zahodil skôr, než príde.
    void fetchFeedPost(postParam).then((r) => {
      if (!r) { toast({ title: tx('pack.feed.postGone', 'That post is no longer available') }); return; }
      setFocusC(c);
      setReading(r.mine ? { p: r.post } : { p: r.post, who: r });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postParam, uid]);
  useEffect(() => {
    let on = true;
    fetchQuoteComments(quoteKey).then((r) => { if (on) setQuoteCm(r.length); }).catch(() => {});
    return () => { on = false; };
  }, [quoteKey]);
  // Citát dňa striedavo A (fotka) / B (výjav) po dni — oba tvary sú v nákrese odklepnuté.
  const variant: 'a' | 'b' = day % 2 ? 'a' : 'b';
  const quoteBg = variant === 'b' ? `/feed/citaty/c${(day % SCENES) + 1}.webp` : photoBg;

  const names = useMemo(() => VAULT_WORLDS.map((w) => tx(`pack.ainubis.world.${w.key}`, w.en)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]);
  const worldName = (key: string) => names[VAULT_WORLDS.findIndex((w) => w.key === key)];
  // VŠETKY ZVITKY (Matej 26. 10.: „nevidím žiadne zvitky na feede a pritom ich máme 108… musia tam byť všetky").
  // Poradie sa každý deň posunie, aby feed nezačínal stále tým istým zvitkom.
  const allScrolls = useMemo(() => {
    const ok = scrolls.filter((z) => z.img && pickText(z, lang)?.t);
    if (!ok.length) return [];
    const k = (day * 7) % ok.length;
    return [...ok.slice(k), ...ok.slice(0, k)];
  }, [scrolls, lang, day]);
  const savedScrolls = useMemo(() => savedIds.map((id) => scrolls.find((z) => z.id === id)).filter((z): z is DemoScroll => !!z), [savedIds, scrolls]);

  // Meno navonok = to isté ako `shownName` na /pack/me (voľba „Zobraziť ako", potom meno z účtu / objednávky).
  const { profile } = useProfile();
  const human = profile?.human;
  const meta = (session?.user?.user_metadata ?? {}) as Record<string, string | undefined>;
  const orderName = dogs.filter((d) => !d.user_id || d.user_id === uid).map((d) => d.owner_name?.trim()).find(Boolean) ?? '';
  const ownName = (() => {
    if (human?.displayAs === 'nickname' && human.nickname?.trim()) return human.nickname.trim();
    if (human?.displayAs === 'packName' && human.packName?.trim()) return human.packName.trim();
    return (meta.full_name || meta.name || orderName || '').trim() || session?.user?.email?.split('@')[0] || '';
  })() || tx('pack.feed.you', 'You');
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

  const items: Item[] = useMemo(() => {
    const tripIdx = trips.map((_, i) => i);
    // HĽADANIE: výlety (názov, miesto, popis), zvitky (názov, podtitul, svet), moje príspevky (text, miesto).
    if (searching) {
      if (query.length < 2) return [];
      const q = fold(query);
      const hit = (...xs: Array<string | undefined | null>) => xs.some((x) => x && fold(x).includes(q));
      return weave({
        trip: tripIdx.filter((i) => { const tr = trips[i].trail; return hit(tripTitle(tr, lang), tr.name, tr.region, tripText(tr, 'desc', lang), trips[i].author); }),
        scroll: allScrolls.filter((z) => { const x = pickText(z, lang); return hit(x?.t, x?.v, x?.d, worldName(z.world)); }),
        // Text, miesto, MENO AUTORA a mená PSOV (označení + psi autora; môj príspevok = moje psy).
        post: publicPosts.filter(({ p, who }) => hit(p.body, p.attach.place?.name, who ? who.name : ownName, ...(who ? postDogs.get(p.id) ?? [] : dogs.map((d) => d.dog_name)))),
        map: [],
      }, false);
    }
    // TÉMA: príspevky so štítkom + výlety (Výlety a príroda) + zvitky svetov, ktoré k téme patria.
    if (topic) {
      const worlds = TOPIC_WORLDS[topic];
      return weave({
        trip: topic === 't:trip' ? tripIdx : [],
        scroll: worlds ? allScrolls.filter((z) => worlds === 'all' || worlds.includes(z.world)) : [],
        post: publicPosts.filter(({ p }) => postTopics(p).includes(topic)),
        map: [],
      }, false);
    }
    const out: Item[] = [];
    if (savedScrolls.length) out.push({ k: 'saved' });
    out.push({ k: 'quote' });
    const saved = new Set(savedIds);
    return out.concat(weave({
      trip: tripIdx,
      scroll: allScrolls.filter((z) => !saved.has(z.id)),
      post: publicPosts,
      map: [...mapAdds],
    }, true, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trips, publicPosts, allScrolls, savedScrolls.length, savedIds, mapAdds, topic, searching, query, lang, postDogs, ownName, dogs]);

  // DÁVKY: najprv PAGE kusov, ďalšie, keď sa strážca na konci zoznamu priblíži k oknu.
  const [shown, setShown] = useState(PAGE);
  const filterKey = `${topic}|${searching}|${query}`;
  const lastKey = useRef(filterKey);
  useEffect(() => {
    if (lastKey.current === filterKey) return;
    lastKey.current = filterKey;
    setShown(PAGE);
  }, [filterKey]);
  const moreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = moreRef.current;
    if (!el || (shown >= items.length && postsDone)) return;
    // Pri konci zoznamu sa dobratie ďalších príspevkov zo servera (`p_before`) — stráž stojí, kým nie je `postsDone`.
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      if (shown < items.length) setShown((n) => n + PAGE); else loadMorePosts();
    }, { rootMargin: '1200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [shown, items.length, postsDone, loadMorePosts]);

  // NÁVRAT NA TO ISTÉ MIESTO: pri odchode sa zapíše pozícia a počet dávok; pri „späť" (POP) sa obnoví,
  // keď je zoznam dosť dlhý. Nový vstup cez nav (PUSH) začína hore.
  const restore = useRef<{ y: number; shown: number } | null>(null);
  useLayoutEffect(() => {
    if (navType !== 'POP' || searching) return;
    try {
      const v = JSON.parse(sessionStorage.getItem(POS_KEY) || 'null') as { y: number; shown: number } | null;
      if (v && v.y > 0) { restore.current = v; setShown((n) => Math.max(n, v.shown)); }
    } catch { /* súkromné okno */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Výlety a zvitky dobiehajú zo siete — skočí sa, až keď je stránka dosť vysoká (najdlhšie 6 s, potom sa vzdá).
  useEffect(() => {
    const r = restore.current;
    if (!r) return;
    const t0 = Date.now();
    const id = window.setInterval(() => {
      const tall = document.documentElement.scrollHeight >= r.y + window.innerHeight;
      if (tall || Date.now() - t0 > 6000) { window.scrollTo(0, r.y); restore.current = null; window.clearInterval(id); }
    }, 80);
    return () => window.clearInterval(id);
  }, [items.length, shown]);
  useEffect(() => {
    if (searching) return;
    let raf = 0;
    const save = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Pri odchode sa adresa zmení skôr, než feed zmizne — stránka sa medzitým zrazí na 0 a prepísala by pozíciu.
        if (window.location.pathname.replace(/\/$/, '') !== '/pack') return;
        try { sessionStorage.setItem(POS_KEY, JSON.stringify({ y: window.scrollY, shown: shownRef.current })); } catch { /* nič */ }
      });
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => { window.removeEventListener('scroll', save); cancelAnimationFrame(raf); };
  }, [searching]);
  const shownRef = useRef(shown);
  shownRef.current = shown;

  // LABKY A POČTY ZO SERVERA — len pre to, čo je naozaj vykreslené (dávka po PAGE), jedným volaním.
  const visible = items.slice(0, shown);
  const targetKey = visible.map((it) => keyTarget(it, quote.id, trips)).filter(Boolean).join('|');
  useEffect(() => {
    if (targetKey) marks.want(targetKey.split('|'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey]);
  const tripAuthors = useTripAuthors(useMemo(
    () => visible.flatMap((it) => (it.k === 'trip' && !trips[it.i].mine ? [trips[it.i].trail.id] : [])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetKey],
  ));
  // Výlet zablokovaného autora sa nezobrazí (server filtruje príspevky; výlety žijú v klientskom úložisku, takže filter je tu).
  const rendered = visible.filter((it) => {
    if (it.k !== 'trip') return true;
    const n = tripAuthors.get(trips[it.i].trail.id)?.ownerN;
    return n == null || !blocked.has(n);
  });
  const [tripCmOpen, setTripCmOpen] = useState<string | null>(null);
  const [tripCm, setTripCm] = useState<Record<string, number>>({});

  const aiLabels = { like: tx('pack.feed.act.like', 'Like'), comment: tx('pack.feed.act.comment', 'Comments'), save: tx('pack.feed.act.save', 'Save'), more: tx('pack.feed.more', 'more') };

  const render = (it: Item) => {
    switch (it.k) {
      case 'quote':
        return (
          <AiQuote text={quoteText} author={quote.author} bg={quoteBg} variant={variant}
            sub={tx('pack.feed.quote.title', 'Quote of the day')} labels={aiLabels}
            liked={marks.get(`quote:${quote.id}`).liked} onLike={() => marks.toggle(`quote:${quote.id}`, 'like')}
            saved={marks.get(`quote:${quote.id}`).saved} onSave={() => marks.toggle(`quote:${quote.id}`, 'save')}
            likes={marks.get(`quote:${quote.id}`).likes} saves={marks.get(`quote:${quote.id}`).saves}
            onComment={() => setCmKey(quoteKey)} comments={quoteCm} />
        );
      case 'trip': {
        const ft = trips[it.i];
        const ts = marks.get(`trip:${ft.trail.id}`);
        // TRIPLIST drží `favs` (moje ťuknutie hneď), server dal počet aj môj stav v okamihu dopytu.
        const lists = Math.max(0, ts.saves - (ts.saved ? 1 : 0)) + (favs.has(ft.trail.id) ? 1 : 0);
        return (
          <FeedTripCard ft={ft} youImg={youImg} authorImg={tripAuthors.get(ft.trail.id)?.photo ?? null} authorN={tripAuthors.get(ft.trail.id)?.ownerN ?? null} authorName={tripAuthors.get(ft.trail.id)?.name ?? null}
            liked={marks.get(`trip:${ft.trail.id}`).liked} onLike={() => marks.toggle(`trip:${ft.trail.id}`, 'like')} likes={ts.likes}
            comments={tripCm[ft.trail.id] ?? marks.get(`trip:${ft.trail.id}`).comments} onComment={() => setTripCmOpen(ft.trail.id)}
            listed={favs.has(ft.trail.id)} onList={() => toggleFav(ft.trail.id)} lists={lists} />
        );
      }
      case 'scroll':
        return <ScrollCard z={it.z} lang={lang} worldName={worldName(it.z.world)} onOpen={openScroll} onShare={() => {}}
          head={<AiHead sub={scrollUI(lang).scroll} />} />;
      case 'post':
        return it.p.who
          ? <FeedPostCard post={it.p.p} name={it.p.who.name || tx('pack.feed.member', 'Member')} avatar={it.p.who.avatar}
              authorN={it.p.who.ownerN} mine={false} onOpen={() => setReading(it.p)} />
          : <FeedPostCard post={it.p.p} name={ownName} avatar={youImg} onOpen={() => setReading(it.p)} pending={!!it.p.p.hiddenAt} />;
      case 'map':
        return <FeedMapCard add={it.a} liked={marks.get(`map:${it.a.id}`).liked} likes={marks.get(`map:${it.a.id}`).likes} onLike={() => marks.toggle(`map:${it.a.id}`, 'like')} />;
      case 'story':
        return (
          <AiStory src="/videos/WHO_IS_HEKTHOR.mp4" poster="/videos/WHO_IS_HEKTHOR.webp"
            title={`${t('heroglyph.flow.name.whoTitle')} ${t('heroglyph.flow.name.whoTitleName')}`}
            body={t('heroglyph.flow.name.whoBody')} sub={tx('pack.feed.story.label', 'Story')} labels={aiLabels}
            liked={marks.get('story:hekthor').liked} onLike={() => marks.toggle('story:hekthor', 'like')}
            saved={marks.get('story:hekthor').saved} onSave={() => marks.toggle('story:hekthor', 'save')}
            likes={marks.get('story:hekthor').likes} saves={marks.get('story:hekthor').saves} />
        );
      case 'saved':
        return <AiSaved list={savedScrolls} lang={lang} onOpen={(id) => openScroll(id)} />;
    }
  };
  const keyOf = (it: Item, n: number) =>
    it.k === 'trip' ? `t:${trips[it.i].trail.id}` : it.k === 'scroll' ? `z:${it.z.id}` : it.k === 'post' ? `p:${it.p.p.id}` : it.k === 'map' ? it.a.id : `${it.k}:${n}`;
  // Papyrusové príspevky delí čiara; AINUBIS (citát, zvitok, príbeh, odložené) má vlastný tmavý pás.
  const isPaper = (it: Item) => it.k === 'trip' || it.k === 'post' || it.k === 'map';

  return (
    <div className={`pkf${searching ? ' srch' : ''}`} onClick={closeOnOutside}>
      <style>{SCROLL_CSS}{SCROLL_CARD_CSS}{CSS}</style>
      <div className="pkf-col">
        {searching ? (<>
          <div className="pkf-sb" role="search">
            <HandSearch size={20} />
            <input ref={searchRef} type="search" value={params.get('hladaj') || ''} onChange={(e) => setQuery(e.target.value)}
              placeholder={tx('pack.feed.search.ph', 'Search trips, scrolls, posts…')} aria-label={tx('pack.feed.search.ph', 'Search')} enterKeyHint="search" />
            <button type="button" onClick={closeSearch}>{tx('pack.feed.search.close', 'Close search')}</button>
          </div>
          <p className="pkf-sinfo">{query.length < 2
            ? tx('pack.feed.search.hint', 'Searches trips, AINUBIS scrolls and posts.')
            : tx('pack.feed.search.count', 'Found: {n}').replace('{n}', String(items.length))}</p>
        </>) : (<>
          {/* SNIFFER ÚPLNE NA ZAČIATKU (Matej 26. 10., kolo 4) — a ešte raz na konci feedu. */}
          <SnifferStrip />
          <div className="pkf-top">
            <TripStrip trips={trips.slice(0, 8)} />
          </div>
          {/* TÉMY — tie isté štítky ako pri pridávaní príspevku (`postTags.ts`), kruhy s príbehovým prstencom (kolo 6). */}
          <FeedTopics topic={topic} onTopic={setTopic} />
        </>)}

        <div className="pkf-list">
          {rendered.map((it, n) => (
            <div key={keyOf(it, n)} className={`pkf-it${isPaper(it) ? ' pap' : ''}`}>{render(it)}</div>
          ))}
        </div>
        {(shown < items.length || !postsDone) && <div ref={moreRef} className="pkf-more" aria-hidden />}
        {!items.length && (searching ? query.length >= 2 : !!topic) && (
          <p className="pkf-none">{searching ? tx('pack.feed.search.none', 'Nothing found. Try another word.') : tx('pack.feed.tag.empty', 'No posts with this topic yet.')}</p>
        )}

        {!searching && shown >= items.length && postsDone && <>
          {/* SNIFFER aj na konci, pred „videl si všetko". */}
          <SnifferStrip />
          {!topic && <div className="pkf-end">
            <BrandIcon name="paw" size={32} tint="gold" />
            <b>{tx('pack.feed.end.title', 'You have seen it all')}</b>
            {tx('pack.feed.end.sub', 'A new quote tomorrow.')}
          </div>}
        </>}
      </div>

      {cmKey && <QuoteComments quoteKey={cmKey} focusId={focusC} onClose={() => { setCmKey(null); setFocusC(null); }} onCount={(n) => { if (cmKey === quoteKey) setQuoteCm(n); }} />}

      {tripCmOpen && <QuoteComments tripId={tripCmOpen} onClose={() => setTripCmOpen(null)}
        onCount={(n) => setTripCm((m) => (m[tripCmOpen] === n ? m : { ...m, [tripCmOpen]: n }))} />}

      {reading && (reading.who
        ? <PostViewer post={reading.p} name={reading.who.name || tx('pack.feed.member', 'Member')} avatar={reading.who.avatar}
            dogs={[]} mine={false} authorN={reading.who.ownerN} lang={lang} focusComment={focusC} onClose={() => { setReading(null); setFocusC(null); }} />
        : <PostViewer post={reading.p} name={ownName} avatar={youImg} dogs={dogs} mine lang={lang} focusComment={focusC} onClose={() => { setReading(null); setFocusC(null); }} />
      )}
    </div>
  );
}
