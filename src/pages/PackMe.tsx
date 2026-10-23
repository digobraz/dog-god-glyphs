// PROFIL JA — v7 SATELIT (nákres `plany/nakres-profil-satelit-2026-10-22.html`, Matej 22. 10.
// 2026: *„s fotkou a štýlom rozkliku som spokojný"* → text doladený v tej istej noci → *„sprav to na dev"*).
//
// `/pack/profile` = MÔJ PROFIL (kôš 1 — lišta vždy). Texty sa píšu na samostatnej
// obrazovke UPRAVIŤ (`/pack/profile/edit` = editor `PackProfile.tsx`) — aj pilulky a bio psa.
// 🔴 V profile NIE JE žiadne `+` (Matej: *„všetko sa bude upravovať v edit profile okne"*).
//
// Poradie (nákres): TITULKA (meno, DEVOTION, PÚTNIK) · fotka majiteľa so SATELITOM psov
// (ťuk = šuplík psov; ťuk na fotku psa alebo šípku zavrie; ťuk na heroglyf = meno + bio +
// pilulky psa z DOG ID) · 5 ČÍSEL · TLAČIDLÁ · PAWTNER · BIO (3 riadky + more) · PILULKY
// (pás pretŕča vpravo, ťahá sa prstom — žiadne šípky ani automatický pohyb) · KARTY · MRIEŽKA.
//
// 🔴 ČO ZATIAĽ NEMÁ ZDROJ, NESIE ČERVENÚ POMLČKU (Matej 21. 10.). Sledovanie, stories,
//    albumy a uložené prídu so session FEED — karta ostáva, obsah je prázdny stav.
//    Pomlčka nie je nula: nula by tvrdila, že ťa nikto nesleduje.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { usePackUser, type PackDogFull } from '@/hooks/usePackUser';
import { usePilgrimStats } from '@/components/pack/usePilgrimStats';
import { useProfile, customPills, profileRoles, PERSONALITY_OPTIONS, type DogProfileAttrs } from '@/components/pack/profile/packProfile';
import { useScrollState, useLiked, useSaved } from '@/components/pack/vault/vaultScrolls';
import { VAULT_WORLDS } from '@/components/pack/vault/worlds';
import { devotionLevel } from '@/lib/devotion';
import { HERO_TRAILS, type HeroTrail } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { readLocalTrails, readWalkedIds, visibleLocalTrails, tripPath } from '@/components/pack/tripShared';
import { PILL_CSS } from '@/components/pack/packTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { BonesSheet } from '@/components/pack/BonesSheet';
import { sizedUrl } from '@/services/cloudinaryService';
import { ME_CSS, MeCover, MeOwn, MeRank } from '@/components/pack/profile/meHead';
import { shareDog } from '@/lib/useShareCard';
import { useToast } from '@/hooks/use-toast';
import { useT, useLang } from '@/i18n/LanguageContext';

const TOTAL_SCROLLS = VAULT_WORLDS.reduce((s, w) => s + w.scrolls, 0);
// `posts` nie je v generovaných typoch (tak isto `storyData.ts`).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

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
type PostTile = { id: string; photo: string; trip: string | null };

/** Pilulky človeka = jeho POVAHA z editora (emoji + meno) + jedna vlastná. */
function humanPills(personality: string[] | undefined, custom: string[], t: (k: string) => string) {
  const out = (personality ?? []).flatMap((v) => {
    const o = PERSONALITY_OPTIONS.find((x) => x.value === v);
    if (!o) return [];
    const key = `pack.profile.personality.${v}`;
    const label = t(key) === key ? o.labelEN : t(key);
    return [{ k: v, emoji: o.emoji ?? '', label }];
  });
  custom.forEach((c, i) => out.push({ k: `custom${i}`, emoji: '', label: c }));
  return out;
}

/** Riadok psa v šuplíku. Bio a povaha sú tie isté polia ako v DOG ID (`profile.dogs[id]`). */
function DogRow({ dog, attrs, onClose, onDogId, tx }: {
  dog: PackDogFull;
  attrs: DogProfileAttrs | undefined;
  onClose: () => void;
  onDogId: () => void;
  tx: (key: string, fallback: string) => string;
}) {
  const [flip, setFlip] = useState(false);
  const name = dog.dog_name ?? '';
  const num = dog.pack_number != null ? <span className="me-no">#{dog.pack_number}</span> : null;
  const bio = attrs?.bio?.trim();
  const tags = attrs?.tags?.temperament ?? [];
  return (
    <div className={`me-drow${flip ? ' flip' : ''}`}>
      <button type="button" className="me-dp" onClick={onClose} aria-label={tx('pack.me.closeDogs', 'Hide dogs')}>
        {dog.cloudinary_main_url && <img src={sizedUrl(dog.cloudinary_main_url, 200)} alt="" />}
        {num}
      </button>
      <button type="button" className="me-hg" onClick={() => setFlip((f) => !f)} aria-expanded={flip} aria-label={name}>
        <span className="fa">
          {dog.heroglyph_png_url ? <img src={dog.heroglyph_png_url} alt="" /> : <span className="empty">{name}</span>}
        </span>
        <span className="ba"><b>{name}</b>{num}</span>
      </button>
      <div className="me-dinfo">
          {bio ? <p>{bio}</p> : (
            <p className="none" onClick={onDogId}>{tx('pack.me.dogBioEmpty', 'No bio yet. Write it in DOG ID.')}</p>
          )}
          {tags.length > 0 && (
            <div className="me-strip">
              {tags.map((g) => <span key={g} className="pk-pill">{tx(`pack.dogTag.${g}`, g)}</span>)}
            </div>
          )}
          {/* Môj pes → úprava v DOG ID (Matej 23. 10.: „možnosť upraviť a klikom sa preniesť do /dogs"). */}
          <button type="button" className="me-dedit" onClick={onDogId}>
            <BrandIcon name="pencil" size={12} tint="violet" />
            {tx('pack.me.editDog', 'Edit DOG ID')}
          </button>
      </div>
    </div>
  );
}

export default function PackMe() {
  const t = useT();
  const { lang } = useLang();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { session, devotion, bones, avatarUrl, avatarInitial } = usePackIdentity();
  const uid = session?.user?.id ?? null;
  const { dogs } = usePackUser(uid);
  const { profile } = useProfile();
  const human = profile?.human;
  const meta = (session?.user?.user_metadata ?? {}) as Record<string, string | undefined>;

  const [tab, setTab] = useState<Tab>('all');
  const [priv, setPriv] = useState<Private>('saved');
  const [posts, setPosts] = useState<PostTile[] | null>(null);
  const [brought, setBrought] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [bonesOpen, setBonesOpen] = useState(location.hash === '#network');
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
  const orderName = dogs.map((d) => d.owner_name?.trim()).find(Boolean) ?? '';
  const fullName = (meta.full_name || meta.name || orderName || '').trim();
  const shownName = (() => {
    if (human?.displayAs === 'nickname' && human.nickname?.trim()) return human.nickname.trim();
    if (human?.displayAs === 'packName' && human.packName?.trim()) return human.packName.trim();
    return fullName || session?.user?.email?.split('@')[0] || '';
  })();

  // ── Čísla. Každé z miesta, kde už žije — žiadny druhý výpočet.
  const pilgrim = usePilgrimStats(session?.user?.email ?? '', fullName.split(' ')[0] ?? '');
  const zstate = useScrollState();
  const readScrolls = Object.values(zstate).filter((v) => v === 2).length;
  // prvý prečítaný zvitok nesmie ukázať 0 % — to isté pravidlo ako hlavička AINUBISA
  const studyPct = readScrolls ? Math.max(1, Math.round((readScrolls / Math.max(1, TOTAL_SCROLLS)) * 100)) : 0;
  const dev = devotionLevel(devotion);
  const [rank, setRank] = useState<'dev' | 'pt' | 'study' | null>(null);
  const liked = useLiked();
  const saved = useSaved();

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    db.from('posts').select('id, photos, attach').eq('author_id', uid)
      .order('created_at', { ascending: false }).limit(60)
      .then(({ data }: { data: unknown }) => {
        if (!alive) return;
        const rows = (data ?? []) as Array<{ id: string; photos: unknown; attach: Record<string, unknown> | null }>;
        setPosts(rows.flatMap((r) => {
          const photo = Array.isArray(r.photos) ? r.photos.find((p): p is string => typeof p === 'string') : undefined;
          if (!photo) return [];
          const slug = typeof r.attach?.trip_slug === 'string' ? r.attach.trip_slug : null;
          return [{ id: r.id, photo, trip: slug }];
        }));
      });
    supabase.rpc('get_my_network').then(({ data }) => {
      if (!alive) return;
      const n = (data as { level1_count?: number } | null)?.level1_count;
      setBrought(typeof n === 'number' ? n : 0);
    });
    return () => { alive = false; };
  }, [uid]);

  // ── Moje výlety — tá istá množina, z ktorej ráta km PÚTNIK (jedno číslo, jeden zoznam).
  const myTrips = useMemo(() => {
    const all: HeroTrail[] = [...visibleLocalTrails(readLocalTrails()), ...HERO_JOURNEYS, ...HERO_TRAILS];
    const walked = readWalkedIds();
    return all.filter((tr) => walked.has(tr.id));
  }, []);

  const bio = human?.dogVoiceBio?.trim() || human?.bio?.trim() || '';
  const sigDog = human?.dogVoiceBio?.trim() ? dogs[0]?.dog_name : null;
  // „more" len vtedy, keď text naozaj presiahne 3 riadky.
  useLayoutEffect(() => {
    const el = bioRef.current;
    if (el && !bioFull) setBioLong(el.scrollHeight > el.clientHeight + 1);
  }, [bio, bioFull]);

  const firstDog = dogs.find((d) => d.pack_number != null) ?? dogs[0] ?? null;
  const fmt = (n: number) => n.toLocaleString(lang === 'sk' ? 'sk-SK' : 'en-US');

  // Staré odkazy do editora — presmerovať skôr, než sa čokoľvek vykreslí.
  const params = new URLSearchParams(location.search);
  if (EDITOR_HASHES.includes(location.hash) || EDITOR_PARAMS.some((p) => params.has(p))) {
    return <Navigate to={`/pack/profile/edit${location.search}${location.hash}`} replace />;
  }

  const soon = (what: string) => toast({ title: what, description: tx('pack.me.soonFeed', 'Arrives with the FEED.') });

  const invite = async () => {
    if (!firstDog?.pack_number) return;
    const name = firstDog.dog_name ?? '';
    try {
      const r = await shareDog({
        pack: firstDog.pack_number,
        dogName: name,
        imageUrl: firstDog.cloudinary_main_url ?? '',
        shareText: t('share.dogVoice', { dog: name.toUpperCase() }),
      });
      if (r === 'copied') toast({ title: t('sharecard.linkCopied') });
    } catch {
      toast({ title: t('sharecard.failed') });
    }
  };

  const dash = <b className="na" aria-label={tx('pack.me.notYet', 'not yet')}>—</b>;
  // Titulka = vlastná (UPRAVIŤ PROFIL), inak fotka človeka so psom (SNIFFER), inak hlavná fotka prvého psa; bez fotky ostane čierna.
  const coverSrc = human?.coverPhoto || human?.buddyPhoto || firstDog?.cloudinary_main_url || null;
  const pills = humanPills(human?.personality, customPills(human), t);

  const TABS: Array<[Tab, string, string]> = [
    ['all', 'layers', tx('pack.me.tabAll', 'All')],
    ['stories', 'play', tx('pack.me.stories', 'Stories')],
    ['albums', 'frame', tx('pack.me.tabAlbums', 'Albums')],
    ['trips', 'map', tx('pack.me.tabTrips', 'Trips')],
    ['private', 'lock', tx('pack.me.tabPrivate', 'Only me')],
  ];

  return (
    <PackLayout>
      <style>{PILL_CSS}</style>
      <style>{ME_CSS}</style>
      <section className={`me-card${open ? ' open' : ''}`}>
        {/* TITULKA — BONES · meno · DEVOTION · PÚTNIK (spoločná s UPRAVIŤ PROFIL, `meHead.tsx`). */}
        <MeCover
          cover={coverSrc}
          coverY={human?.coverY}
          name={shownName}
          devLabel={`${tx(`pack.ladder.${dev.key}`, dev.name)} ${dev.index}`}
          pilgrimLabel={`${tx('pack.map.rankPilgrim', 'Pilgrim')} ${pilgrim.level.level}`}
          pilgrimLevel={pilgrim.level.level}
          bones={fmt(bones)}
          onBones={() => setBonesOpen(true)}
          onDev={() => setRank((r) => (r === 'dev' ? null : 'dev'))}
          onPilgrim={() => setRank((r) => (r === 'pt' ? null : 'pt'))}
          rank={rank}
        />

        <div className="me-under">
          {/* FOTKA MAJITEĽA + SATELIT PSOV — ťuk na satelit otvorí šuplík, šípka ho zavrie. */}
          <MeOwn
            photo={avatarUrl}
            initial={avatarInitial}
            dogs={dogs}
            open={open}
            onToggle={() => setOpen((o) => !o)}
            onPhoto={() => navigate('/pack/profile/edit?edit=avatar')}
            photoLabel={tx('pack.me.changePhoto', 'Change photo')}
            toggleLabel={open ? tx('pack.me.closeDogs', 'Hide dogs') : tx('pack.me.openDogs', 'Show dogs')}
          />

          <div className="me-drawer" aria-hidden={!open}>
            {dogs.map((d) => (
              <DogRow key={d.id} dog={d} attrs={profile?.dogs?.[d.id]} onClose={() => setOpen(false)} onDogId={() => navigate(`/pack/dogs/${d.id}`)} tx={tx} />
            ))}
          </div>
          <div className="me-gap" />
          {rank && (
            <MeRank kind={rank} devotion={devotion} pilgrim={pilgrim} tx={tx}
              study={{ read: readScrolls, total: TOTAL_SCROLLS, pct: studyPct, liked: liked.length, saved: saved.length }}
              onStats={() => navigate('/pack/map/triplist?tab=stats')}
              onVault={() => navigate('/pack/ainubis/knowledge')} />
          )}

          {/* 5 ČÍSEL — hneď pod fotkou, bez čiar (Matej 22. 10.). */}
          <div className="me-stats">
            <button type="button" onClick={() => soon(tx('pack.me.followers', 'followers'))}>
              {dash}<span>{tx('pack.me.followers', 'followers')}</span>
            </button>
            <button type="button" onClick={() => soon(tx('pack.me.following', 'following'))}>
              {dash}<span>{tx('pack.me.following', 'following')}</span>
            </button>
            <button type="button" onClick={() => setBonesOpen(true)}>
              <b>{brought == null ? '·' : fmt(brought)}</b>
              <span>{tx('pack.me.brought', 'brought in')}</span>
            </button>
            {/* KM = výlety na karte AJ blok pútnika hore (Matej 23. 10.: „ako keby pill pútnik“). */}
            <button type="button" onClick={() => { setTab('trips'); setRank('pt'); }}>
              <b>{fmt(pilgrim.km)}</b>
              <span>km</span>
            </button>
            {/* ŠTÚDIUM = blok hore so základnými číslami AINUBISA + odkaz do VAULTu (Matej 23. 10.). */}
            <button type="button" onClick={() => setRank((r) => (r === 'study' ? null : 'study'))}>
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

          <div className="me-role">{profileRoles(human).map((r) => <span key={r} className="pk-pill">{tx(`pack.role.${r}`, r)}</span>)}</div>

          <div className={`me-bio${bioFull ? ' full' : ''}${bio ? '' : ' empty'}`}>
            <p ref={bioRef}>
              {bio || tx('pack.me.bioEmpty', 'What would your dog say about you? Write it in Edit.')}
              {bio && sigDog && <> <span className="sig">— <b>{sigDog}</b></span></>}
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
            posts && posts.length > 0 ? (
              <div className="me-grid">
                {posts.map((p) => (
                  <button key={p.id} type="button" onClick={() => p.trip && navigate(`/pack/map/${p.trip}`)}>
                    <img src={sizedUrl(p.photo, 320)} alt="" loading="lazy" />
                    {p.trip && <span className="me-tag">{tx('pack.me.tagTrip', 'Trip')}</span>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="me-empty">{posts == null ? '·' : tx('pack.me.postsEmpty', 'No posts yet. Your trip stories will show up here.')}</div>
            )
          )}
          {tab === 'stories' && <div className="me-empty">{tx('pack.me.storiesEmpty', 'Stories arrive with the FEED.')}</div>}
          {tab === 'albums' && <div className="me-empty">{tx('pack.me.albumsEmpty', 'Albums arrive with the FEED.')}</div>}
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
      {bonesOpen && <BonesSheet bones={bones} avatarUrl={avatarUrl} initial={avatarInitial} onClose={closeBones} />}
    </PackLayout>
  );
}
