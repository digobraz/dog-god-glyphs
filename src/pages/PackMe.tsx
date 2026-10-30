// PROFIL JA — v7 SATELIT (nákres `plany/nakres-profil-satelit-2026-10-22.html`, Matej 22. 10.
// 2026: *„s fotkou a štýlom rozkliku som spokojný"* → text doladený v tej istej noci → *„sprav to na dev"*).
//
// `/pack/profile` = MÔJ PROFIL (kôš 1 — lišta vždy). Texty sa píšu na samostatnej
// obrazovke UPRAVIŤ (`/pack/profile/edit` = editor `PackProfile.tsx`) — aj pilulky a bio psa.
// 🔴 V profile NIE JE `+` na TEXTY (Matej 22. 10.: *„všetko sa bude upravovať v edit profile okne"*).
//    JEDINÁ výnimka je `+` na fotke = nová STORY (Matej 23. 10.: *„plusko pri otvorenom profile
//    s možnosťou pridať stories aj cez to pri /profile nie pri edit"*) — novší pokyn, platí len pre story.
//
// 23. 10. pribudlo: STORIES (prstenec žiari, kým žije story; ťuk na fotku = prehrávač) · karty PRÍBEHY
// a ALBUMY čítajú `posts` so štítkami `moment` / `album`. Titulka (album + striedanie po dni) a fotka
// psa sa menia v UPRAVIŤ PROFIL (Matej 23. 10.: *„fotku psa som myslel v edit profile nie v profile"*).
//
// Poradie (nákres): TITULKA (meno, DEVOTION, PÚTNIK) · fotka majiteľa so SATELITOM psov
// (ťuk = šuplík psov; ťuk na fotku psa alebo šípku zavrie; ťuk na heroglyf = meno + bio +
// pilulky psa z DOG ID) · 5 ČÍSEL · TLAČIDLÁ · PAWTNER · BIO (3 riadky + more) · PILULKY
// (pás pretŕča vpravo, ťahá sa prstom — žiadne šípky ani automatický pohyb) · KARTY · MRIEŽKA.
//
// 🔴 ČO ZATIAĽ NEMÁ ZDROJ, NESIE ČERVENÚ POMLČKU (Matej 21. 10.). Sledovanie, stories,
//    albumy a uložené prídu so session FEED — karta ostáva, obsah je prázdny stav.
//    Pomlčka nie je nula: nula by tvrdila, že ťa nikto nesleduje.
import { pilgrimAuthorName } from '@/lib/pilgrimName';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { usePackUser, type PackDogFull } from '@/hooks/usePackUser';
import { usePilgrimStats, usePublishPilgrimLevel, usePublishProfileStats } from '@/components/pack/usePilgrimStats';
import { useProfile, customPills, roleLabels, humanPills } from '@/components/pack/profile/packProfile';
import { useScrollState, useLiked, useSaved } from '@/components/pack/vault/vaultScrolls';
import { VAULT_WORLDS } from '@/components/pack/vault/worlds';
import { devotionLevel, DEVOTION_TODAY_ON } from '@/lib/devotion';
import { HERO_TRAILS, type HeroTrail } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { readLocalTrails, readWalkedIds, visibleLocalTrails, tripPath } from '@/components/pack/tripShared';
import { PILL_CSS } from '@/components/pack/packTheme';
import { TEST_BUILD } from '@/lib/env';
import { STORIES_ON, ALBUMS_ON } from '@/lib/packFlags';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { BonesSheet } from '@/components/pack/BonesSheet';
import { TripShareSheet, type TripShareData } from '@/components/pack/trip/TripShareSheet';
import { dogShareLink } from '@/lib/useShareCard';
import { sizedUrl } from '@/services/cloudinaryService';
import { ME_CSS, ME_FLAT_CSS, MeCover, MeOwn, MeRank, MeDogRow, MeFlag } from '@/components/pack/profile/meHead';
import { RANK_BADGE_ON, useServantYears } from '@/components/pack/profile/rankBadge';
import { StoryViewer } from '@/components/pack/profile/StoryViewer';
import { PostViewer } from '@/components/pack/profile/PostViewer';
import { DevotionToday } from '@/components/pack/profile/DevotionToday';
import { DevotionSheet } from '@/components/pack/profile/DevotionSheet';
import { levelProgress } from '@/lib/tripPoints';
import { fetchMyPosts, onPostsChanged, openCompose, coverOfDay, isMoment, isAlbum, isLive, isTripStory, type MePost } from '@/components/pack/profile/mePosts';
import { useToast } from '@/hooks/use-toast';
import { useT, useLang } from '@/i18n/LanguageContext';
import { countryLabel } from '@/lib/countryOptions';
import { useBeside } from '@/components/pack/profile/profileMates';
import { MateHome } from '@/components/pack/profile/MateHome';
import { FollowListPopup, useFollow, type FollowKind } from '@/components/pack/profile/follow';

// PROFIL BEZ KARTY (TEST_BUILD, Matej 25. 10. 2026): obsah na celú šírku. Hladký papyrus pod ním
// zapína PackLayout (`PLAIN_ROUTES`).
const FLAT = TEST_BUILD;

const TOTAL_SCROLLS = VAULT_WORLDS.reduce((s, w) => s + w.scrolls, 0);

// Staré odkazy mierili do editora (kotvy a parametre) — pošleme ich tam, kam patria,
// inak by `?welcome=1` po platbe pristálo na nesprávnej obrazovke.
// `#network` (BONES a línia) od 23. 10. 2026 NEJDE do editora — otvorí tu šuplík MISIA.
const EDITOR_HASHES = ['#pawmates'];
const EDITOR_PARAMS = ['welcome', 'edit'];

// KARTY nad mriežkou (Matej 22. 10.: prvá = všetko, potom príbehy, albumy, výlety; súkromné
// SAVED + DENNÍK sú pod jednou kartou so zámkom, aby sa na mobile zmestilo päť ikon).
// SAVED = polica „uložené" v JA (lock architektura-pack §1.3 a §4.2 🔖).
type Tab = 'all' | 'stories' | 'albums' | 'trips' | 'private';
type Private = 'saved' | 'diary';

/** Prehrávač pustený z profilu — story, album alebo príspevok (album a príspevok = prehliadka fotiek). */
type Viewing = { items: MePost[]; start: number; del?: boolean };
/** Album alebo príspevok rozložený na snímky prehrávača (každá fotka = jedna snímka, text na prvej). */
/** NÁHĽAD „NOVÁČIK" (Matej 23. 10.: *„prepni moje konto tak ako keby začínam od začiatku… nováčik"*).
 *  🔴 Nemení účet ani DB — len to, čo profil KRESLÍ, a len mimo dogypt.com (náhľad workers.dev, lokál).
 *  Zapne `?ako=novacik`, vypne `?ako=ja`; pamätá si to prehliadač, kým sa nevypne. */
const NOVICE_KEY = 'dg-preview-novice';
function useNovicePreview(search: string): [boolean, () => void] {
  const allowed = typeof window !== 'undefined' && !/(^|\.)dogypt\.com$/.test(window.location.hostname);
  const [on, setOn] = useState(() => {
    if (!allowed) return false;
    try { return localStorage.getItem(NOVICE_KEY) === '1'; } catch { return false; }
  });
  useEffect(() => {
    if (!allowed) return;
    const ako = new URLSearchParams(search).get('ako');
    if (ako !== 'novacik' && ako !== 'ja') return;
    const next = ako === 'novacik';
    setOn(next);
    try { if (next) localStorage.setItem(NOVICE_KEY, '1'); else localStorage.removeItem(NOVICE_KEY); } catch { /* bez úložiska len na túto návštevu */ }
  }, [search, allowed]);
  const off = () => { setOn(false); try { localStorage.removeItem(NOVICE_KEY); } catch { /* nič */ } };
  return [on, off];
}


export default function PackMe() {
  const t = useT();
  const { lang } = useLang();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { session, devotion: realDevotion, bones: realBones, avatarUrl, avatarInitial } = usePackIdentity();
  const [novice, noviceOff] = useNovicePreview(location.search);
  const devotion = novice ? 0 : realDevotion;
  const bones = novice ? 0 : realBones;
  const [aboutDev, setAboutDev] = useState(false);
  // `?dnes=1` = ťuk na večernú pripomienku → panel dennej aktivity (DEVOTION, 23. 10. 2026).
  const [todayOpen, setTodayOpen] = useState(() => DEVOTION_TODAY_ON && new URLSearchParams(location.search).get('dnes') === '1');
  // Položka „Zapíš dnešok" v paneli `+` vedie sem s `?dnes=1` aj vtedy, keď človek na profile UŽ STOJÍ —
  // `location.key` sa mení pri každej navigácii, preto sa panel otvorí aj druhýkrát.
  useEffect(() => {
    if (DEVOTION_TODAY_ON && new URLSearchParams(location.search).get('dnes') === '1') setTodayOpen(true);
  }, [location.key, location.search]);
  const uid = session?.user?.id ?? null;
  const { dogs } = usePackUser(uid);
  // PAWMATE = vidí psov, ale žiadny nie je jeho (Matej 26. 10. 2026, test „Lenka"). Meno ani hodnosti
  // si od majiteľa psa nepožičiava — dovtedy niesol meno z objednávky a roky služby jeho psa.
  const ownDogs = dogs.filter((d) => !d.user_id || d.user_id === uid);
  const isMate = dogs.length > 0 && ownDogs.length === 0;
  const servantYears = useServantYears(ownDogs, RANK_BADGE_ON);
  const { profile } = useProfile();
  const human = profile?.human;
  const meta = (session?.user?.user_metadata ?? {}) as Record<string, string | undefined>;

  const [tab, setTab] = useState<Tab>('all');
  const [priv, setPriv] = useState<Private>('saved');
  const [posts, setPosts] = useState<MePost[] | null>(null);
  const [viewing, setViewing] = useState<Viewing | null>(null);
  const [reading, setReading] = useState<MePost | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [brought, setBrought] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [bonesOpen, setBonesOpen] = useState(location.hash === '#network');
  const [shareOpen, setShareOpen] = useState(false);
  // Odkaz `#network` zvonku (homepage, pozvánka zakladateľa) aj keď už profil stojí.
  useEffect(() => { if (location.hash === '#network') setBonesOpen(true); }, [location.hash]);
  const closeBones = () => {
    setBonesOpen(false);
    if (location.hash === '#network') navigate('/pack/profile', { replace: true });
  };
  const [bioFull, setBioFull] = useState(false);
  const [bioLong, setBioLong] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);

  // ── Meno navonok — tá istá voľba „Zobraziť ako", akú vidia ostatní (`memberDisplayName`).
  const orderName = ownDogs.map((d) => d.owner_name?.trim()).find(Boolean) ?? '';
  const fullName = (meta.full_name || meta.name || orderName || '').trim();
  const shownName = (() => {
    if (human?.displayAs === 'nickname' && human.nickname?.trim()) return human.nickname.trim();
    if (human?.displayAs === 'packName' && human.packName?.trim()) return human.packName.trim();
    return fullName || session?.user?.email?.split('@')[0] || '';
  })();

  // ── Čísla. Každé z miesta, kde už žije — žiadny druhý výpočet.
  const realPilgrim = usePilgrimStats(session?.user?.email ?? '', pilgrimAuthorName(session?.user?.email, meta));
  const pilgrim = novice ? { ...realPilgrim, level: levelProgress(0), count: 0, km: 0, countries: 0, countryCodes: [] as string[] } : realPilgrim;
  const zstate = useScrollState();
  const readScrolls = novice ? 0 : Object.values(zstate).filter((v) => v === 2).length;
  // prvý prečítaný zvitok nesmie ukázať 0 % — to isté pravidlo ako hlavička AINUBISA
  const studyPct = readScrolls ? Math.max(1, Math.round((readScrolls / Math.max(1, TOTAL_SCROLLS)) * 100)) : 0;
  // ČÍSLA PROFILU pre ostatných — cudzí profil ich ukáže 1:1 (25. 10. 2026). Nováčikov náhľad nič nezverejní.
  usePublishPilgrimLevel(novice || !realPilgrim.ready ? null : pilgrim.level.level);
  usePublishProfileStats(novice || brought == null || !realPilgrim.ready ? null : {
    km: pilgrim.km, pilgrimPct: pilgrim.level.pct, brought, study: studyPct, servantYears,
    points: pilgrim.level.points, trips: pilgrim.count, countries: pilgrim.countries,
  });
  const dev = devotionLevel(devotion);
  const [rank, setRank] = useState<'dev' | 'pt' | 'study' | null>(null);
  // SLEDOVANIE — moje počty a zoznamy (Matej 26. 10. 2026: „po kliknutí na číslo sa otvorí zoznam").
  const fol = useFollow(null);
  const [followList, setFollowList] = useState<FollowKind | null>(null);
  const liked = useLiked();
  const saved = useSaved();

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    const load = () => fetchMyPosts(uid).then((rows) => { if (alive) { setPosts(rows); setNow(Date.now()); } }).catch(() => { if (alive) setPosts([]); });
    load();
    const off = onPostsChanged(load);
    supabase.rpc('get_my_network').then(({ data, error }) => {
      if (!alive || error) return; // chyba ≠ „priviedol 0" — bez čísla sa nič nezverejní (audit 26. 10.)
      const n = (data as { level1_count?: number } | null)?.level1_count;
      setBrought(typeof n === 'number' ? n : 0);
    });
    return () => { alive = false; off(); };
  }, [uid]);

  // ── Moje výlety — tá istá množina, z ktorej ráta km PÚTNIK (jedno číslo, jeden zoznam).
  const myTrips = useMemo(() => {
    const all: HeroTrail[] = [...visibleLocalTrails(readLocalTrails()), ...HERO_JOURNEYS, ...HERO_TRAILS];
    const walked = readWalkedIds();
    return all.filter((tr) => walked.has(tr.id));
  }, []);

  const bio = human?.dogVoiceBio?.trim() || human?.bio?.trim() || '';
  // „more" len vtedy, keď text naozaj presiahne 3 riadky.
  useLayoutEffect(() => {
    const el = bioRef.current;
    if (el && !bioFull) setBioLong(el.scrollHeight > el.clientHeight + 1);
  }, [bio, bioFull]);

  const firstDog = dogs.find((d) => d.pack_number != null) ?? dogs[0] ?? null;
  const myNumber = ownDogs.map((d) => d.pack_number).filter((n): n is number => n != null).sort((a, b) => a - b)[0] ?? null;

  // VEDĽA MOJEJ FOTKY (26. 10. 2026) — pawmate pri majiteľovi, majiteľ pri pawmatovi (`useBeside`).
  const beside = useBeside({ uid: novice ? null : uid, isMate, showMates: human?.showMates, myNumber });
  const fmt = (n: number) => n.toLocaleString(lang === 'sk' ? 'sk-SK' : 'en-US');

  // Staré odkazy do editora — presmerovať skôr, než sa čokoľvek vykreslí.
  const params = new URLSearchParams(location.search);
  if (EDITOR_HASHES.includes(location.hash) || EDITOR_PARAMS.some((p) => params.has(p))) {
    return <Navigate to={`/pack/profile/edit${location.search}${location.hash}`} replace />;
  }


  // POZVI = okno ZDIEĽAJ KARTU PSA — ten istý mechanizmus ako zdieľanie výletu (IG príbeh / FB,
  // čistá fotka psa alebo vlastná, meno + heroglyf, odkaz sa skopíruje na nálepku). Matej 23. 10. 2026. To isté okno
  // otvára ZDIEĽAJ ODKAZ v šuplíku BONES — karta ZDIEĽAJ KARTU z DOMOVA tým odišla.
  const shareData: TripShareData | null = firstDog?.pack_number ? {
    name: firstDog.dog_name ?? 'Dogyptian',
    url: dogShareLink(firstDog.pack_number, 'story', firstDog.dog_name),
    // ČISTÁ fotka psa — nie hotová karta (tá má v sebe heroglyf, meno aj web; Matej 23. 10.)
    photos: firstDog.cloudinary_main_url ? [firstDog.cloudinary_main_url] : [],
    country: firstDog.country ?? undefined,
    glyph: firstDog.heroglyph_png_url ?? undefined,
    decorative: true,
    badge: t('pack.dogShare.badge', { n: String(firstDog.pack_number) }),
    chips: [],
  } : null;
  const invite = () => { if (shareData) setShareOpen(true); };

  // K3 · PAWMATE vidí PAWTNEROV profil, nie vlastný (model A, Matej 26. 10. 2026) — `MateHome.tsx`.
  // POZVI zdieľa kartu pawtnerovho psa (`firstDog` je jeho), BONES teda idú pawtnerovi.
  if (isMate && !novice) {
    return (
      <PackLayout>
        <style>{PILL_CSS}</style>
        <style>{ME_CSS}</style>
        {FLAT && <style>{ME_FLAT_CSS}</style>}
        <MateHome dogs={dogs} me={{ photo: avatarUrl, initial: avatarInitial, name: shownName, uid }} onInvite={shareData ? invite : undefined} flat={FLAT} />
        {shareOpen && shareData && <TripShareSheet kind="dog" data={shareData} onClose={() => setShareOpen(false)} />}
      </PackLayout>
    );
  }

  // Titulka = vlastná (UPRAVIŤ PROFIL), inak fotka človeka so psom (SNIFFER), inak hlavná fotka prvého psa; bez fotky ostane čierna.
  // Pri striedaní po dni (album titulky) vyberá dnešnú `coverOfDay`.
  const coverSrc = coverOfDay(human) || human?.buddyPhoto || firstDog?.cloudinary_main_url || null;

  // ── STORIES: živé (24 h) od najstaršej, ako ich človek pridával; archív = všetky.
  const moments = (posts ?? []).filter(isMoment);
  const live = moments.filter((p) => isLive(p, now)).reverse();
  const albums = (posts ?? []).filter(isAlbum);
  const grid = (posts ?? []).filter((p) => !isMoment(p) && p.photos.length > 0);
  const openPost = (p: MePost) => {
    const trip = isTripStory(p) ? p.attach.trip_slug : undefined;
    if (trip) { navigate(`/pack/map/${trip}`); return; }
    // Príspevok = detail ako na IG (`PostViewer`), nie prehrávač stories (25. 10. 2026).
    setReading(p);
  };

  const pills = humanPills(human?.personality, customPills(human), t);

  const TABS: Array<[Tab, string, string]> = [
    ['all', 'layers', tx('pack.me.tabAll', 'All')],
    ...(STORIES_ON ? [['stories', 'play', tx('pack.me.stories', 'Stories')] as [Tab, string, string]] : []),
    ...(ALBUMS_ON ? [['albums', 'frame', tx('pack.me.tabAlbums', 'Albums')] as [Tab, string, string]] : []),
    ['trips', 'map', tx('pack.me.tabTrips', 'Trips')],
    ['private', 'lock', tx('pack.me.tabPrivate', 'Only me')],
  ];

  return (
    <PackLayout>
      <style>{PILL_CSS}</style>
      <style>{ME_CSS}</style>
      {FLAT && <style>{ME_FLAT_CSS}</style>}
      {novice && (
        <button type="button" className="pk-pill pk-pill--tap" onClick={noviceOff}
          style={{ display: 'flex', margin: '0 auto 8px', fontSize: 12 }}>
          {tx('pack.me.novicePreview', 'Preview: a brand-new member · back to my account')}
        </button>
      )}
      <section className={`me-card${FLAT ? ' me-flat' : ''}${open ? ' open' : ''}${beside ? ' with-mate' : ''}`}>
        {/* TITULKA — BONES · meno · DEVOTION · PÚTNIK (spoločná s UPRAVIŤ PROFIL, `meHead.tsx`). */}
        <MeCover
          withName={beside?.label ?? null}
          cover={coverSrc}
          coverY={human?.coverY}
          name={shownName}
          devLabel={tx(`pack.ladder.${dev.key}`, dev.name)}
          devLevel={dev.index}
          pilgrimLabel={String(pilgrim.level.level)}
          pilgrimLevel={pilgrim.level.level}
          pilgrimPct={pilgrim.level.pct}
          servantYears={novice ? null : servantYears}
          servantLabel={tx('pack.ladder.servant', 'Servant')}
          pilgrimRankLabel={tx('pack.map.rankPilgrim', 'Pilgrim')}
          bones={fmt(bones)}
          right={<MeFlag code={human?.nationality ?? 'SK'} label={countryLabel(human?.nationality ?? 'SK', lang)} />}
          onBones={() => setBonesOpen(true)}
          onDev={() => setRank((r) => (r === 'dev' ? null : 'dev'))}
          onPilgrim={() => setRank((r) => (r === 'pt' ? null : 'pt'))}
          rank={rank}
          noRanks={isMate}
        />

        <div className="me-under">
          {/* FOTKA MAJITEĽA + SATELIT PSOV — ťuk na satelit otvorí šuplík, šípka ho zavrie. */}
          <MeOwn
            photo={avatarUrl}
            initial={avatarInitial}
            dogs={dogs}
            open={open}
            onToggle={() => setOpen((o) => !o)}
            // Ťuk na fotku: žije story → prehrávač, inak rovno nová story (ako IG). Profilovka sa
            // mení v UPRAVIŤ PROFIL.
            // Príbehy vypnuté (`STORIES_ON`, 25. 10.): ťuk na fotku = výmena fotky, bez „+".
            onPhoto={() => (!STORIES_ON ? navigate('/pack/profile/edit?edit=avatar')
              : live.length ? setViewing({ items: live, start: 0, del: true }) : openCompose('moment'))}
            photoLabel={!STORIES_ON ? tx('pack.profile.changeAvatarAria', 'Change avatar')
              : live.length ? tx('pack.me.stories', 'Stories') : tx('pack.compose.newStory', 'New story')}
            story={STORIES_ON && live.length ? 'live' : 'none'}
            onAdd={STORIES_ON ? () => openCompose('moment') : undefined}
            addLabel={tx('pack.compose.newStory', 'New story')}
            mate={beside ? { ...beside, onClick: beside.to ? () => navigate(beside.to as string) : undefined } : null}
            toggleLabel={open ? tx('pack.me.closeDogs', 'Hide dogs') : tx('pack.me.openDogs', 'Show dogs')}
          />

          <div className="me-drawer" aria-hidden={!open}>
            {dogs.map((d) => (
              <MeDogRow key={d.id} dog={d} attrs={profile?.dogs?.[d.id]} onClose={() => setOpen(false)} onDogId={() => navigate(`/pack/dogs/${d.id}`)} tx={tx} />
            ))}
          </div>
          <div className="me-gap" />
          {rank && (
            <MeRank kind={rank} devotion={devotion} pilgrim={pilgrim} tx={tx}
              servantYears={novice ? null : servantYears}
              home={human?.nationality ?? 'SK'}
              blank={novice}
              abroad={pilgrim.countryCodes.filter((c) => c !== (human?.nationality ?? 'SK').toLowerCase()).length}
              onDogId={dogs[0] ? () => navigate(`/pack/dogs/${dogs[0].id}`) : undefined}
              study={{ read: readScrolls, total: TOTAL_SCROLLS, pct: studyPct, liked: liked.length, saved: saved.length }}
              onStats={() => navigate('/pack/map/triplist?tab=stats')}
              onVault={() => navigate('/pack/ainubis/knowledge')}
              onAbout={() => setAboutDev(true)} onClose={() => setRank(null)} />
          )}

          {followList && (
            <FollowListPopup
              packNumber={null}
              kind={followList}
              title={followList === 'followers' ? tx('pack.me.followers', 'followers') : tx('pack.me.following', 'following')}
              empty={tx('pack.follow.empty', 'Nobody yet.')}
              onClose={() => setFollowList(null)}
            />
          )}
          {/* 5 ČÍSEL — hneď pod fotkou, bez čiar (Matej 22. 10.). */}
          <div className="me-stats">
            <button type="button" onClick={() => setFollowList('followers')}>
              <b>{fmt(fol.info?.followers ?? 0)}</b><span>{tx('pack.me.followers', 'followers')}</span>
            </button>
            <button type="button" onClick={() => setFollowList('following')}>
              <b>{fmt(fol.info?.following ?? 0)}</b><span>{tx('pack.me.following', 'following')}</span>
            </button>
            <button type="button" onClick={() => setBonesOpen(true)}>
              <b>{brought == null ? '·' : fmt(novice ? 0 : brought)}</b>
              <span>{tx('pack.me.brought', 'brought in')}</span>
            </button>
            {/* KM = výlety na karte AJ blok pútnika hore (Matej 23. 10.: „ako keby pill pútnik“). */}
            <button type="button" data-rank-toggle onClick={() => { setTab('trips'); setRank('pt'); }}>
              <b>{fmt(pilgrim.km)}</b>
              <span>km</span>
            </button>
            {/* ŠTÚDIUM = blok hore so základnými číslami AINUBISA + odkaz do VAULTu (Matej 23. 10.). */}
            <button type="button" data-rank-toggle onClick={() => setRank((r) => (r === 'study' ? null : 'study'))}>
              <b>{studyPct} %</b>
              <span>{tx('pack.me.studying', 'studying')}</span>
            </button>
          </div>

          <div className="me-btns">
            <button type="button" className="me-cta" onClick={() => navigate('/pack/profile/edit')}>{tx('pack.me.editProfile', 'Edit profile')}</button>
            {/* „Ako ma vidia" zrušené (Matej 23. 10.: „ako ma vidia je teda hlúposť") — na jeho mieste
                POZVI: zdieľa kartu psa, z ktorej rastie číslo „brought in". */}
            <button type="button" className="me-out" onClick={invite}>{tx('pack.me.invite', 'Invite')}</button>
          </div>

          {/* ROLA = NADPIS NAD BIO, nie pilulka (TEST_BUILD, Matej 25. 10.: *„pill pawtner sa mi nepáči, lebo je taký
              istý ako dolné pillsy povahy"* → z troch návrhov *„ja by som dal P3"*). Štítok + zlatá linka. */}
          {FLAT ? (
            <div className="me-role me-role--label">
              <span>{roleLabels(!!isMate, human, tx).join(' · ')}</span>
              <i aria-hidden />
            </div>
          ) : (
            <div className="me-role">{roleLabels(!!isMate, human, tx).map((r) => <span key={r} className="pk-pill">{r}</span>)}</div>
          )}

          <div className={`me-bio${bioFull ? ' full' : ''}${bio ? '' : ' empty'}`}>
            <p ref={bioRef}>
              {bio || tx('pack.me.bioEmpty', 'What would your dog say about you? Write it in Edit.')}
              {/* Bez podpisu psa — bio sú slová majiteľa (Matej 25. 10.: „daj to preč, to sú moje slová“). */}
            </p>
            {(bioLong || bioFull) && (
              <button type="button" className="me-more" onClick={() => setBioFull((f) => !f)}>
                {bioFull ? tx('pack.me.less', 'less') : tx('pack.me.more', 'more')}
              </button>
            )}
          </div>

          {pills.length > 0 && (
            <div className="me-strip">
              {pills.map((p) => <span key={p.k} className="pk-pill">{p.emoji && <i>{p.emoji}</i>}{p.label}</span>)}
            </div>
          )}

          {/* KARTY — VŠETKO · PRÍBEHY · ALBUMY · VÝLETY · 🔒 (uložené + denník, len ja). */}
          <div className="me-tabs" role="tablist">
            {TABS.map(([k, icon, label]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
                <BrandIcon name={icon} size={20} tint="dark" />
                {label}
              </button>
            ))}
          </div>

          {tab === 'all' && (
            grid.length > 0 ? (
              <div className="me-grid">
                {grid.map((p) => (
                  <button key={p.id} type="button" onClick={() => openPost(p)}>
                    <img src={sizedUrl(p.photos[0], 320)} alt="" loading="lazy" />
                    {isTripStory(p) && <span className="me-tag">{tx('pack.me.tagTrip', 'Trip')}</span>}
                    {isAlbum(p) && <span className="me-tag">{tx('pack.me.tagAlbum', 'Album')}</span>}
                    {!isAlbum(p) && p.photos.length > 1 && <span className="me-tag">{p.photos.length}</span>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="me-empty">{posts == null ? '·' : tx('pack.me.postsEmpty2', 'No posts yet. Tap + below to share the first one.')}</div>
            )
          )}
          {/* PRÍBEHY = archív stories (len ja) — aj tie po 24 h, ako na IG. Ťuk = prehrávač od tej snímky. */}
          {tab === 'stories' && (
            moments.length > 0 ? (
              <div className="me-grid me-grid--story">
                {moments.map((p, k) => (
                  <button key={p.id} type="button" onClick={() => setViewing({ items: [...moments].reverse(), start: moments.length - 1 - k, del: true })}>
                    <img src={sizedUrl(p.photos[0], 320)} alt="" loading="lazy" />
                    {isLive(p, now) && <span className="me-tag">24 h</span>}
                    <span className="cap">{new Date(p.createdAt).toLocaleDateString(lang === 'sk' ? 'sk-SK' : 'en-GB', { day: 'numeric', month: 'short' })}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="me-empty">
                {posts == null ? '·' : tx('pack.me.storiesEmpty2', 'No stories yet. Tap + on your photo.')}
              </div>
            )
          )}
          {tab === 'albums' && (
            albums.length > 0 ? (
              <div className="me-grid">
                {albums.map((p) => (
                  <button key={p.id} type="button" onClick={() => openPost(p)}>
                    <img src={sizedUrl(p.photos[0], 320)} alt="" loading="lazy" />
                    <span className="me-tag">{p.photos.length}</span>
                    <span className="cap">{p.attach.title || tx('pack.me.tagAlbum', 'Album')}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="me-empty">
                {posts == null ? '·' : tx('pack.me.albumsEmpty2', 'No albums yet. Tap + below and choose Album.')}
              </div>
            )
          )}
          {tab === 'trips' && (
            myTrips.length > 0 ? (
              <div className="me-grid">
                {myTrips.map((tr) => (
                  <button key={tr.id} type="button" onClick={() => navigate(tripPath(tr))}>
                    {tr.photos?.[0] && <img src={sizedUrl(tr.photos[0], 320)} alt="" loading="lazy" />}
                    <span className="cap">{lang !== 'sk' && tr.nameEN ? tr.nameEN : tr.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="me-empty">{tx('pack.me.tripsEmpty', 'No walked trips yet.')}</div>
            )
          )}
          {tab === 'private' && (
            <>
              <div className="me-sub">
                {(['saved', 'diary'] as Private[]).map((k) => (
                  <button key={k} type="button" className={`pk-pill pk-pill--tap${priv === k ? ' on' : ''}`} onClick={() => setPriv(k)}>
                    {k === 'saved' ? tx('pack.me.saved', 'Saved') : tx('pack.me.diary', 'Diary')}
                  </button>
                ))}
              </div>
              <div className="me-empty">
                {priv === 'saved' ? tx('pack.me.savedEmpty', 'What you save will wait here. Only you can see it.') : tx('pack.me.diaryEmpty', 'Your diary arrives with the FEED. Only you can see it.')}
              </div>
            </>
          )}
        </div>
      </section>
      {aboutDev && <DevotionSheet devotion={devotion} onClose={() => setAboutDev(false)} />}
      {todayOpen && <DevotionToday onClose={() => setTodayOpen(false)} />}
      {reading && (
        <PostViewer post={reading} name={shownName} avatar={avatarUrl} dogs={dogs} mine lang={lang} onClose={() => setReading(null)} />
      )}
      {viewing && (
        <StoryViewer items={viewing.items} start={viewing.start} name={shownName} avatar={avatarUrl} dogs={dogs}
          mine={!!viewing.del} lang={lang} onClose={() => setViewing(null)} />
      )}
      {bonesOpen && <BonesSheet bones={bones} avatarUrl={avatarUrl} initial={avatarInitial} onClose={closeBones} onShare={shareData ? invite : undefined} shareLink={shareData?.url} />}
      {shareOpen && shareData && <TripShareSheet kind="dog" data={shareData} onClose={() => setShareOpen(false)} />}
    </PackLayout>
  );
}
