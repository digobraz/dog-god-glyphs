// PROFIL JA — v6 (nákres `plany/nakres-profil-2026-10-21.html`, schválený 21. 10. 2026:
// *„páči sa mi to naše — postav to vo fresh session"*).
//
// `/pack/profile` = MÔJ PROFIL (kôš 1 — lišta vždy). Texty sa píšu na samostatnej
// obrazovke UPRAVIŤ (`/pack/profile/edit` = editor `PackProfile.tsx`), tu sú len kliky a čísla.
//
// 🔴 ČO ZATIAĽ NEMÁ ZDROJ, NESIE ČERVENÚ POMLČKU (Matej 21. 10.: *„daj mriežku … ale zatial
//    tam daj pomlčky, červenou priprav to tak ako sme sa dohodli a vo feed session to len
//    prehlbime"*). Sledovanie, stories a reels neexistujú (žiadna tabuľka) — prídu so session
//    FEED. Pomlčka nie je nula: nula by tvrdila, že ťa nikto nesleduje.
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { usePackUser, type PackDogFull } from '@/hooks/usePackUser';
import { usePilgrimStats } from '@/components/pack/usePilgrimStats';
import { useProfile } from '@/components/pack/profile/packProfile';
import { useScrollState } from '@/components/pack/vault/vaultScrolls';
import { VAULT_WORLDS } from '@/components/pack/vault/worlds';
import { devotionLevel } from '@/lib/devotion';
import { HERO_TRAILS, type HeroTrail } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { readLocalTrails, readWalkedIds, visibleLocalTrails, tripPath } from '@/components/pack/tripShared';
import { PACK_THEME, PACK_R, PACK_SHADOW, PACK_SPACE, PACK_TEXT, PILL_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { sizedUrl } from '@/services/cloudinaryService';
import { shareDog } from '@/lib/useShareCard';
import { useToast } from '@/hooks/use-toast';
import { useT, useLang } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;
const DOG_FONT = "'Cinzel Decorative', 'Cinzel', serif";
const TOTAL_SCROLLS = VAULT_WORLDS.reduce((s, w) => s + w.scrolls, 0);
// `posts` nie je v generovaných typoch (tak isto `storyData.ts`).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// Staré odkazy mierili do editora (kotvy a parametre) — pošleme ich tam, kam patria,
// inak by `#network` z homepage alebo `?welcome=1` po platbe pristáli na nesprávnej obrazovke.
const EDITOR_HASHES = ['#network', '#pawmates'];
const EDITOR_PARAMS = ['welcome', 'edit'];

type Tab = 'posts' | 'reels' | 'trips';
type PostTile = { id: string; photo: string; trip: string | null };

const ME_CSS = `
.me-card{ overflow:hidden; border-radius:${PACK_R.card}px; border:1.5px solid ${T.cardEdge}; background:${T.cardGrad}; box-shadow:${T.cardShadow}; }
.me-top{ display:grid; grid-template-columns:36px 1fr auto; gap:${S.sm}px; align-items:center;
  padding:${S.sm}px ${S.md}px; background:#050505 url('/images/bg-dark.webp') center/cover; color:${LAPIS.ink};
  border-bottom:1px solid ${T.cardEdge}; }
.me-top .t{ white-space:nowrap; overflow:hidden; text-align:center;
  font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.body}px; letter-spacing:.14em; text-transform:uppercase; }
.me-top .r{ display:flex; gap:${S.sm}px; align-items:center; }
.me-ic{ width:36px; height:36px; border-radius:${PACK_R.pill}px; border:1px solid ${T.cardEdge}; display:grid; place-items:center;
  background:rgba(0,0,0,0.30); cursor:pointer; padding:0; }
.me-ic:hover{ background:rgba(201,154,63,0.16); }
.me-bones{ font-family:${FONT_UI}; font-size:${TX.label}px; font-weight:600; padding:${S.xs}px ${S.md}px; }
.me-ig{ display:grid; grid-template-columns:104px 1fr; gap:${S.lg}px; align-items:center; padding:${S.xl}px ${S.lg}px ${S.md}px; }
.me-st{ position:relative; width:104px; height:104px; border-radius:${PACK_R.pill}px; padding:4px; background:${T.hairline}; }
.me-st.has{ background:linear-gradient(135deg,${LAPIS.edge} 0%,${LAPIS.edge} 30%,${T.cardEdge} 75%,#E8C77A 100%); }
.me-st button.ph{ display:block; width:100%; height:100%; padding:0; border:0; border-radius:${PACK_R.pill}px; overflow:hidden; cursor:pointer; background:${T.tileBg}; }
.me-st img{ width:100%; height:100%; object-fit:cover; display:block; border-radius:${PACK_R.pill}px; border:3px solid ${T.card}; }
.me-st .ini{ display:grid; place-items:center; width:100%; height:100%; font-family:${FONT_TITLE}; font-size:${TX.h1}px; color:${T.inkWarm}; border-radius:${PACK_R.pill}px; border:3px solid ${T.card}; }
.me-plus{ position:absolute; right:0; bottom:0; width:32px; height:32px; border-radius:${PACK_R.pill}px; border:3px solid ${T.card};
  background:${LAPIS.grad}; color:${LAPIS.ink}; display:grid; place-items:center; font:600 ${TX.h2}px/1 ${FONT_UI}; cursor:pointer; padding:0; }
.me-g{ display:grid; grid-template-columns:repeat(3,1fr); row-gap:${S.sm}px; text-align:center; }
.me-g .sep{ grid-column:1/-1; height:1px; background:${T.hairline}; }
.me-g button{ background:none; border:0; padding:0; cursor:pointer; color:inherit; }
.me-g b{ display:block; font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.lead}px; color:${T.inkStrong}; line-height:1.2; white-space:nowrap; }
.me-g b.na{ color:${T.alertRed}; }
.me-g span{ font-family:${FONT_UI}; font-size:${TX.micro}px; color:${T.inkWarm}; }
.me-who{ padding:0 ${S.lg}px ${S.lg}px; }
.me-nm{ display:flex; align-items:center; gap:${S.sm}px; flex-wrap:wrap; }
.me-nm h1{ margin:0; font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.h2}px; color:${T.inkStrong}; letter-spacing:.02em; }
.me-nm .pk-pill{ font-family:${FONT_TITLE}; font-size:${TX.micro}px; font-weight:700; letter-spacing:.22em; text-transform:uppercase; padding:${S.xs}px ${S.md}px; }
.me-pl{ display:flex; gap:${S.sm}px; flex-wrap:wrap; margin:${S.sm}px 0; }
.me-pl .pk-pill{ font-family:${FONT_TITLE}; font-size:${TX.micro}px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; padding:${S.xs}px ${S.md}px; }
.me-green{ background:${T.growGreen}; border-color:${T.growGreen}; color:#FFF6E3; }
.me-green.pk-pill--tap:hover{ box-shadow:${PACK_SHADOW.lift}; border-color:${T.growGreen}; }
.me-bio{ margin:0; font-family:${FONT_UI}; font-size:${TX.body}px; line-height:1.5; color:${T.ink}; }
.me-bio .sig{ color:${T.inkWarm}; font-size:${TX.label}px; white-space:nowrap; }
.me-bio .sig b{ font-family:${DOG_FONT}; font-weight:700; }
.me-bio.empty{ color:${T.inkFaint}; font-style:italic; }
.me-hl{ display:flex; gap:${S.lg}px; overflow-x:auto; padding:${S.md}px 0 ${S.lg}px; scrollbar-width:none; }
.me-hl::-webkit-scrollbar{ display:none; }
.me-hl button{ flex:0 0 auto; width:64px; background:none; border:0; padding:0; cursor:pointer; text-align:center; color:${T.inkStrong}; }
.me-hl .r{ width:64px; height:64px; border-radius:${PACK_R.pill}px; padding:4px; background:conic-gradient(${T.cardEdge},#E8C77A,${T.cardEdge}); margin:0 0 ${S.xs}px; }
.me-hl .r img{ width:56px; height:56px; border-radius:${PACK_R.pill}px; object-fit:cover; display:block; border:2px solid ${T.card}; }
.me-hl .add{ width:64px; height:64px; border-radius:${PACK_R.pill}px; border:1.5px dashed ${LAPIS.edge}; display:grid; place-items:center;
  color:${LAPIS.edge}; font:500 ${TX.h2}px/1 ${FONT_UI}; margin:0 0 ${S.xs}px; }
.me-hl .n{ display:block; font-size:${TX.micro}px; overflow:hidden; white-space:nowrap; }
.me-hl .n.dog{ font-family:${DOG_FONT}; font-weight:700; }
.me-hl .n.ui{ font-family:${FONT_UI}; }
.me-btns{ display:grid; grid-template-columns:1fr 1fr; gap:${S.sm}px; }
.me-btns button{ font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.label}px; letter-spacing:.14em; text-transform:uppercase;
  padding:${S.md}px ${S.xs}px; border-radius:${PACK_R.field}px; cursor:pointer; }
.me-cta{ background:${LAPIS.grad}; color:${LAPIS.ink}; border:1px solid ${LAPIS.deep}; box-shadow:${LAPIS_BTN_SHADOW}; }
.me-cta:hover{ background:${LAPIS.gradHover}; }
.me-out{ background:transparent; color:${LAPIS.edge}; border:1.5px solid ${LAPIS.edge}; }
.me-out:hover{ background:${LAPIS.fill}; }
.me-body{ padding:0 ${S.lg}px ${S.lg}px; }
.me-tabs{ display:flex; justify-content:space-around; border-bottom:1px solid ${T.hairline}; margin:0 0 ${S.xs}px; }
.me-tabs button{ background:none; border:0; border-bottom:2px solid transparent; cursor:pointer; padding:${S.md}px ${S.xs}px;
  font-family:${FONT_UI}; font-size:${TX.micro}px; font-weight:500; letter-spacing:.22em; text-transform:uppercase; color:${T.inkWarm}; }
.me-tabs button.on{ border-bottom-color:${T.cardEdge}; color:${T.inkStrong}; font-weight:600; }
.me-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:4px; }
.me-grid button{ position:relative; aspect-ratio:1; padding:0; border:0; overflow:hidden; border-radius:2px; background:${T.tileBg}; cursor:pointer; }
.me-grid img{ width:100%; height:100%; object-fit:cover; display:block; }
.me-tag{ position:absolute; left:4px; bottom:4px; font-family:${FONT_UI}; font-size:${TX.micro}px; letter-spacing:.14em; background:${LAPIS.grad}; color:${LAPIS.ink}; padding:0 ${S.sm}px; border-radius:${PACK_R.pill}px; }
.me-trips{ display:grid; gap:${S.sm}px; padding-top:${S.sm}px; }
.me-trip{ display:grid; grid-template-columns:72px 1fr; gap:${S.md}px; align-items:center; padding:${S.sm}px; text-align:left; cursor:pointer;
  border:1px solid ${T.tripPurple}; border-radius:${PACK_R.tile}px; background:${T.tileBg}; }
.me-trip .ph{ width:72px; height:72px; border-radius:${PACK_R.field}px; overflow:hidden; background:${T.tileBg}; }
.me-trip .ph img{ width:100%; height:100%; object-fit:cover; display:block; }
.me-trip b{ display:block; font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.body}px; color:${T.inkStrong}; }
.me-trip span{ font-family:${FONT_UI}; font-size:${TX.label}px; color:${T.inkWarm}; }
.me-empty{ padding:${S.xl}px ${S.lg}px; text-align:center; font-family:${FONT_UI}; font-size:${TX.body}px; color:${T.inkWarm}; }
.me-veil{ position:fixed; inset:0; z-index:80; background:rgba(5,5,5,0.55); display:flex; align-items:flex-end; justify-content:center; }
.me-sheet{ width:100%; max-width:480px; border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0; border:1.5px solid ${T.cardEdge}; border-bottom:0;
  background:${T.cardGrad}; box-shadow:${T.cardShadow}; padding:${S.sm}px ${S.lg}px calc(env(safe-area-inset-bottom, 0px) + ${S.xl}px); }
.me-sheet .grab{ width:40px; height:4px; border-radius:${PACK_R.pill}px; background:${T.hairline}; margin:0 auto ${S.lg}px; }
.me-sheet .top{ display:grid; grid-template-columns:80px 1fr; gap:${S.lg}px; align-items:center; }
.me-sheet .top img{ width:80px; height:80px; border-radius:${PACK_R.pill}px; object-fit:cover; border:3px solid ${T.cardEdge}; }
.me-sheet .dn{ font-family:${DOG_FONT}; font-weight:700; font-size:${TX.h2}px; color:${T.inkStrong}; }
.me-sheet .num{ display:inline-block; margin-top:${S.xs}px; background:${LAPIS.grad}; color:${LAPIS.ink}; font-family:${FONT_UI}; font-size:${TX.label}px; font-weight:600; padding:0 ${S.sm}px; border-radius:${PACK_R.pill}px; }
.me-sheet .hg{ display:block; width:100%; max-height:120px; object-fit:contain; margin:${S.lg}px 0; border-radius:${PACK_R.tile}px; border:1px solid ${T.hairline}; background:${T.card}; }
@media (min-width:768px){ .me-ig{ grid-template-columns:136px 1fr; } .me-st{ width:136px; height:136px; } }
`;

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

  const [tab, setTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<PostTile[] | null>(null);
  const [postCount, setPostCount] = useState<number | null>(null);
  const [brought, setBrought] = useState<number | null>(null);
  const [dogOpen, setDogOpen] = useState<PackDogFull | null>(null);

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

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    db.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', uid)
      .then(({ count }: { count: number | null }) => { if (alive) setPostCount(count ?? 0); });
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

  const firstDog = dogs.find((d) => d.pack_number != null) ?? dogs[0] ?? null;
  // Číslo majiteľa = najnižšie číslo jeho psov (CLAUDE.md §Identita).
  const myNumber = dogs.map((d) => d.pack_number).filter((n): n is number => n != null).sort((a, b) => a - b)[0] ?? null;
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
  const bio = human?.dogVoiceBio?.trim();
  const photo = avatarUrl ? sizedUrl(avatarUrl, 320) : null;

  return (
    <PackLayout>
      <style>{PILL_CSS}</style>
      <style>{ME_CSS}</style>
      <section className="me-card">
        {/* TMAVÝ PÁS — chrám len ako pás; ↗ pozvi · meno · BONES · nastavenia (len môj profil). */}
        <div className="me-top">
          <button type="button" className="me-ic" onClick={invite} aria-label={tx('pack.me.invite', 'Invite')}>
            <BrandIcon name="send" size={16} tint="gold" />
          </button>
          <span className="t">{shownName}</span>
          <span className="r">
            <button
              type="button"
              className="pk-pill pk-pill--gold pk-pill--tap me-bones"
              onClick={() => navigate('/pack/profile/edit#network')}
              aria-label={`${bones} BONES`}
            >
              <BrandIcon name="bone" size={16} tint="dark" />
              {fmt(bones)}
            </button>
            <button type="button" className="me-ic" onClick={() => navigate('/pack/profile/edit')} aria-label={tx('pack.me.settings', 'Settings')}>
              <BrandIcon name="sliders" size={16} tint="gold" />
            </button>
          </span>
        </div>

        {/* FOTKA + MRIEŽKA 3×2. Bez story = bezfarebný kruh + lapisový plus (v6 blok 3). */}
        <div className="me-ig">
          <div className="me-st">
            <button type="button" className="ph" onClick={() => navigate('/pack/profile/edit?edit=avatar')} aria-label={tx('pack.me.changePhoto', 'Change photo')}>
              {photo ? <img src={photo} alt="" /> : <span className="ini">{avatarInitial}</span>}
            </button>
            <button type="button" className="me-plus" onClick={() => soon(tx('pack.me.stories', 'Stories'))} aria-label={tx('pack.me.newStory', 'New story')}>+</button>
          </div>
          <div className="me-g">
            <button type="button" onClick={() => setTab('posts')}>
              <b>{postCount == null ? '·' : fmt(postCount)}</b>
              <span>{tx('pack.me.posts', 'posts')}</span>
            </button>
            <button type="button" onClick={() => soon(tx('pack.me.followers', 'followers'))}>
              {dash}<span>{tx('pack.me.followers', 'followers')}</span>
            </button>
            <button type="button" onClick={() => soon(tx('pack.me.following', 'following'))}>
              {dash}<span>{tx('pack.me.following', 'following')}</span>
            </button>
            <div className="sep" />
            <button type="button" onClick={() => navigate('/pack/profile/edit#network')}>
              <b>{brought == null ? '·' : fmt(brought)}</b>
              <span>{tx('pack.me.brought', 'brought in')}</span>
            </button>
            <button type="button" onClick={() => setTab('trips')}>
              <b>{fmt(pilgrim.km)} km</b>
              <span>{tx('pack.me.walked', 'walked')}</span>
            </button>
            <button type="button" onClick={() => navigate('/pack/ainubis')}>
              <b>{studyPct} %</b>
              <span>{tx('pack.me.studying', 'studying')}</span>
            </button>
          </div>
        </div>

        {/* MENO + ÚLOHA · DEVOTION · PÚTNIK · BIO · VÝBERY · TLAČIDLÁ */}
        <div className="me-who">
          <div className="me-nm">
            <h1>{shownName}</h1>
            <span className="pk-pill">Pawtner</span>
          </div>
          <div className="me-pl">
            <span className="pk-pill pk-pill--gold">
              <BrandIcon name="ankh" size={16} tint="dark" />
              {tx(`pack.ladder.${dev.key}`, dev.name)} · {dev.index}
            </span>
            <button type="button" className="pk-pill pk-pill--tap me-green" onClick={() => navigate('/pack/map')} aria-label={tx('pack.map.rankPilgrim', 'Pilgrim')}>
              <BrandIcon name="walk" size={16} tint="white" />
              {pilgrim.level.level}
            </button>
          </div>
          {bio ? (
            <p className="me-bio">
              {bio}{' '}
              {firstDog?.dog_name && <span className="sig">— <b>{firstDog.dog_name}</b></span>}
            </p>
          ) : (
            <p className="me-bio empty">{tx('pack.me.bioEmpty', 'What would your dog say about you? Write it in Edit.')}</p>
          )}
          <div className="me-hl">
            {dogs.map((d) => (
              <button key={d.id} type="button" onClick={() => setDogOpen(d)}>
                <div className="r">{d.cloudinary_main_url && <img src={sizedUrl(d.cloudinary_main_url, 160)} alt="" />}</div>
                <span className="n dog">{d.dog_name}</span>
              </button>
            ))}
            <button type="button" onClick={() => soon(tx('pack.me.highlights', 'Highlights'))}>
              <div className="add">+</div>
              <span className="n ui">{tx('pack.me.newHighlight', 'New')}</span>
            </button>
          </div>
          <div className="me-btns">
            <button type="button" className="me-cta" onClick={() => navigate('/pack/profile/edit')}>{tx('pack.me.edit', 'Edit')}</button>
            <button type="button" className="me-out" onClick={() => myNumber != null && navigate(`/pack/u/${myNumber}`)}>{tx('pack.me.asOthers', 'As others see me')}</button>
          </div>
        </div>

        {/* TABY — PRÍSPEVKY · REELS · VÝLETY (zvitky tab nemajú, stačí ŠTUDENT %). */}
        <div className="me-body">
          <div className="me-tabs" role="tablist">
            {(['posts', 'reels', 'trips'] as Tab[]).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
                {k === 'posts' ? tx('pack.me.tabPosts', 'Posts') : k === 'reels' ? tx('pack.me.tabReels', 'Reels') : tx('pack.me.tabTrips', 'Trips')}
              </button>
            ))}
          </div>
          {tab === 'posts' && (
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
          {tab === 'reels' && <div className="me-empty">{tx('pack.me.reelsEmpty', 'Reels arrive with the FEED.')}</div>}
          {tab === 'trips' && (
            myTrips.length > 0 ? (
              <div className="me-trips">
                {myTrips.map((tr) => (
                  <button key={tr.id} type="button" className="me-trip" onClick={() => navigate(tripPath(tr))}>
                    <div className="ph">{tr.photos?.[0] && <img src={sizedUrl(tr.photos[0], 200)} alt="" loading="lazy" />}</div>
                    <div>
                      <b>{lang !== 'sk' && tr.nameEN ? tr.nameEN : tr.name}</b>
                      <span>{tr.km} km</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="me-empty">{tx('pack.me.tripsEmpty', 'No walked trips yet.')}</div>
            )
          )}
        </div>
      </section>

      {/* KARTA PSA — ťuk na psa vo výberoch (v6: DOG ID + heroglyf, príbehy až tlačidlom). */}
      {dogOpen && (
        <div className="me-veil" onClick={() => setDogOpen(null)}>
          <div className="me-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="grab" />
            <div className="top">
              {dogOpen.cloudinary_main_url ? <img src={sizedUrl(dogOpen.cloudinary_main_url, 240)} alt="" /> : <span />}
              <div>
                <div className="dn">{dogOpen.dog_name}</div>
                {dogOpen.pack_number != null && <span className="num">#{dogOpen.pack_number}</span>}
              </div>
            </div>
            {dogOpen.heroglyph_png_url && <img className="hg" src={dogOpen.heroglyph_png_url} alt="" />}
            <div className="me-btns" style={dogOpen.heroglyph_png_url ? undefined : { marginTop: S.lg }}>
              <button type="button" className="me-out" onClick={() => soon(tx('pack.me.stories', 'Stories'))}>{tx('pack.me.stories', 'Stories')}</button>
              <button type="button" className="me-cta" onClick={() => navigate(`/pack/dogs/${dogOpen.id}`)}>DOG ID</button>
            </div>
          </div>
        </div>
      )}
    </PackLayout>
  );
}
