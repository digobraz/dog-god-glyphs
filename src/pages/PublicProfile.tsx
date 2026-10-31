// Read-profil majiteľa — /pack/u/:id (zadanie-profil-read-dog-2026-07-25 §3). JEDEN profil =
// MAJITEĽ (klik na psa aj človeka vedie sem, žiadny samostatný psí profil).
//
// 2026-08-26 — CUDZÍ ČLEN SA UŽ OTVORÍ. Do vtedy tu bol graceful fallback („profil ešte nie je
// verejný"), lebo `CentralProfile` žil v localStorage a o cudzom človeku nemala appka čo ukázať.
// Migrácia `20260826_pack_profiles.sql` to presunula do DB a stránka to číta cez
// `get_member_profiles()`. Fallback ostáva pre číslo, ktoré nič nevráti.
//
// `:id` má DVA tvary a je to zámerné:
//   • ČÍSLO (`/pack/u/12`) = poradové číslo — jediná adresa člena, ktorú appka o cudzom človeku
//     drží. `user_id` cudzieho človeka nevydáva žiadna funkcia a tento súbor ten zámok neruší.
//   • UUID = ja sám. Ostáva kvôli starým odkazom (`EventsView` posiela `memberId`) a kvôli tomu,
//     že vlastný profil sa číta z `useProfile()`, nie cez RPC.
// 2026-08-03 (Matej: „začíname so všetkým do nuly"): fiktívny MOCK_MEMBER_POOL vetva odstránená.
//
// D3 visibility: owner hlavička tu ukazuje len bazálne identity polia (avatar/meno/nickname/
// nationalita/pack#/badges) — ŽIADNE z nich nemá tier v ProfileFieldKey/DEFAULT_VISIBILITY, takže
// sú vždy viditeľné (rovnaké ako v TripProfileCard-e). Zámerne NEreuseujeme TripProfileCard 1:1:
// ten renderuje `trip`-tier pilulky (personality/smoke/languages) bez ohľadu na vzťah k viewerovi —
// správne pre jeho pôvodný kontext (embed NA tripe, kde je viewer trip-connected), ale nesprávne
// pre všeobecný verejný read-profil, kde viewer nemusí mať s majiteľom žiadny vzťah. Preto tu
// žiadne `trip`-tier polia nerenderujeme vôbec (viď report — spĺňa „skry trip-tier" bez potreby
// shared-trip výpočtu). Psí BIO + tagy = vždy verejné (fixné pravidlo, nie cez getTier()).
import { sizedUrl } from '@/services/cloudinaryService';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { useT, useLang } from '@/i18n/LanguageContext';
import { countryLabel } from '@/lib/countryOptions';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PACK_THEME, PACK_SPACE, PACK_TEXT, PF_FIELD_CSS, PILL_CSS, FONT_UI, PACK_TOPROW } from '@/components/pack/packTheme';
import type { PackDogFull } from '@/hooks/usePackUser';
import { customPills, roleLabels, humanPills } from '@/components/pack/profile/packProfile';
import { fetchMemberProfiles, memberAvatarUrl, memberDisplayName, type MemberProfile } from '@/components/pack/profile/memberProfile';
import { coverOfDay } from '@/components/pack/profile/mePosts';
import { ME_CSS, ME_FLAT_CSS, MeCover, MeOwn, MeRank, MeDogRow, MeFlag } from '@/components/pack/profile/meHead';
import { levelProgress } from '@/lib/tripPoints';
import { emitOpenThread } from '@/components/pack/messaging/openBridge';
import { APP_NEW } from '@/lib/packFlags';
import { IS_APP } from '@/lib/isApp';
import { useToast } from '@/hooks/use-toast';
import { useProfileMates } from '@/components/pack/profile/profileMates';
import { PostMenu } from '@/components/pack/profile/PostMenu';
import { FollowListPopup, useFollow, type FollowKind } from '@/components/pack/profile/follow';

const T = PACK_THEME;
const FLAT = APP_NEW;

export default function PublicProfile() {
  const t = useT();
  const { lang } = useLang();
  const { id } = useParams<{ id: string }>();

  // Session — potrebujeme vedieť KTO sa pozerá (isSelf porovnáva session.user.id s :id).
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setSessionChecked(true);
    });
    return () => { mounted = false; };
  }, []);

  // Šípka späť v hornom rade (audit 27. 9.) — dovtedy tu bol tmavý odkaz „‹ PACK“ na tmavom
  // podklade, iný tvar než na každej inej obrazovke. Cudzí profil sa otvára z partie výletu
  // alebo podujatia, takže späť = tam, odkiaľ človek prišiel; priamy odkaz spadne na /pack.
  const navigate = useNavigate();
  const goBack = () => { if (window.history.state?.idx > 0) navigate(-1); else navigate('/pack'); };

  const isSelf = sessionChecked && !!session?.user && session.user.id === id;
  const { toast } = useToast();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const bioRef = useRef<HTMLParagraphElement>(null);
  const [bioFull, setBioFull] = useState(false);
  const [bioLong, setBioLong] = useState(false);
  const [open, setOpen] = useState(false);
  const [rank, setRank] = useState<'pt' | null>(null);
  const [dmBusy, setDmBusy] = useState(false);

  // Cudzí člen — adresovaný poradovým číslom. `undefined` = ešte sa načítava,
  // `null` = také číslo nič nevrátilo. Rozdiel je dôležitý: bez neho by stránka
  // v prvom okamihu tvrdila „taký člen nie je" a až potom sa opravila.
  const askedNumber = id && /^\d+$/.test(id) ? Number(id) : null;
  const [member, setMember] = useState<MemberProfile | null | undefined>(undefined);
  useEffect(() => {
    if (!sessionChecked || isSelf || askedNumber == null) { setMember(null); return; }
    let alive = true;
    setMember(undefined);
    fetchMemberProfiles([askedNumber]).then((m) => { if (alive) setMember(m.get(askedNumber) ?? null); });
    return () => { alive = false; };
  }, [sessionChecked, isSelf, askedNumber]);

  // Moje vlastné číslo (`/pack/u/<číslo môjho psa>`) → môj profil, nie cudzí s NAPÍSAŤ sebe (audit 26. 10.).
  // Vlastné psy číta RLS, takže stačí opýtať sa, či pes s týmto číslom je môj.
  const [mineNumber, setMineNumber] = useState(false);
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid || askedNumber == null) { setMineNumber(false); return; }
    let alive = true;
    supabase.from('dogs').select('id').eq('user_id', uid).eq('pack_number', askedNumber).limit(1)
      .then(({ data }) => { if (alive) setMineNumber(!!data?.length); });
    return () => { alive = false; };
  }, [session?.user?.id, askedNumber]);

  // Karta pawmata (`/pack/u/:n/mate/:uid`) zrušená 26. 10. 2026 (model A) — premenná `mateId` zmazaná 31. 10. 2026.
  // V natívnej appke je pawmate skrytý celý: pri majiteľovi sa vedľa fotky nekreslí.
  const shownMates = useProfileMates(IS_APP ? null : member?.memberNumber ?? null);
  // SLEDOVANIE — len majiteľ (pawmate nemá číslo). Bez čísla sa nepýta: `null` by znamenalo „ja".
  const followNumber = member?.memberNumber ?? null;
  const fol = useFollow(followNumber, followNumber != null);
  const [followList, setFollowList] = useState<FollowKind | null>(null);

  const bioHuman = member?.human;
  const bio = bioHuman ? (bioHuman.dogVoiceBio?.trim() || bioHuman.bio?.trim() || '') : '';
  // „more" len vtedy, keď text naozaj presiahne 3 riadky (ten istý recept ako môj profil).
  useLayoutEffect(() => {
    const el = bioRef.current;
    if (el && !bioFull) setBioLong(el.scrollHeight > el.clientHeight + 1);
  }, [bio, bioFull]);

  if (!sessionChecked) {
    return (
      <PackLayout>
        <div className="flex items-center justify-center py-16" style={{ color: T.inkDim }}>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span style={{ fontFamily: FONT_UI, fontWeight: 500, letterSpacing: '0.22em', fontSize: PACK_TEXT.micro, textTransform: 'uppercase' }}>
            {t('pack.dog.loading')}
          </span>
        </div>
      </PackLayout>
    );
  }

  // Ja sám (staré odkazy s UUID) → môj profil. Dve podoby vlastného profilu by sa rozišli.
  if (isSelf || mineNumber) return <Navigate to="/pack/profile" replace />;

  // Cudzí člen sa ešte načítava — ticho, nie fallback. Fallback by na okamih tvrdil,
  // že taký človek neexistuje, a potom sa sám opravil.
  if (member === undefined) {
    return (
      <PackLayout>
        <div className="flex items-center justify-center py-16" style={{ color: T.inkDim }}>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span style={{ fontFamily: FONT_UI, fontWeight: 500, letterSpacing: '0.22em', fontSize: PACK_TEXT.micro, textTransform: 'uppercase' }}>
            {t('pack.dog.loading')}
          </span>
        </div>
      </PackLayout>
    );
  }

  // ── Fallback — číslo, ktoré nič nevrátilo (neexistuje / neplatiaci / nie je členom).
  // Odpoveď je zámerne rovnaká pre všetky tri prípady, ako v `get_trip_party()`. ──
  if (!member) {
    return (
      <PackLayout onBack={goBack} backLabel={t('pack.publicProfile.backToPack')}>
        <div
          className="flex flex-col items-center text-center gap-3"
          style={{
            background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
            boxShadow: T.cardShadow,
            padding: '48px 24px', marginTop: 16,
          }}
        >
          {/* GUMENÉ KÁČATKO z ručného kitu (Matej 3. 10. 2026, bod 7B: najprv emoji 🐾, potom labka,
              potom *„niečo iné než packu, napr. káčatko, niečo funny čo sme ešte nepoužili"*).
              Zdroj: kit `bird-hand-drawn-animal-toy` → `/icons/pack/duck.svg`. */}
          <span aria-hidden style={{
            width: 48, height: 48, background: T.cardEdge,
            WebkitMaskImage: 'url(/icons/pack/duck.svg)', maskImage: 'url(/icons/pack/duck.svg)',
            WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskSize: 'contain', maskSize: 'contain',
            WebkitMaskPosition: 'center', maskPosition: 'center',
          }} />
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: T.inkDim, maxWidth: 340 }}>
            {t('pack.publicProfile.notPublic')}
          </p>
          <Link
            to="/pack"
            style={{
              marginTop: 8, fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: LAPIS.ink, background: LAPIS.grad, boxShadow: LAPIS_BTN_SHADOW,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44,
              padding: '0 24px', border: 'none', borderRadius: 8, textDecoration: 'none',
            }}
          >
            {t('pack.publicProfile.backToPack')}
          </Link>
        </div>
      </PackLayout>
    );
  }

  // ── CUDZÍ PROFIL = MÔJ PROFIL OČAMI INÝCH (25. 10. 2026) ───────────────────────────────────
  // Matej: *„cudzí profil by mal mať to isté viditeľné, teda obidva ranky aj 5 stĺpcov a po kliku na psa
  // heroglyf a jeho bio, veď tak to má Instagram"*. Hlava, šuplík psov aj čísla sú TIE ISTÉ komponenty
  // ako `/pack/profile` (`meHead.tsx`). Čísla zverejňuje majiteľova appka (`human.pilgrim`, `human.stats`,
  // `usePublishProfileStats`) — kým profil neotvorí v novej verzii, svieti „·“.
  //  • Namiesto UPRAVIŤ + POZVI: SLEDOVAŤ + NAPÍSAŤ. Sledovanie príde s FEEDom (zatiaľ povie kedy);
  //    NAPÍSAŤ otvorí rozhovor cez `start_member_dm` (migrácia 20261025_member_dm.sql).
  //  • DEVOTION cudzieho človeka appka nemá → v starom šate sa jeho pilulka nekreslí (prázdny `devLabel`).
  // Súkromné polia odstráni už server (`get_member_profiles`), preto tu žiadne `getTier()`.
  // Na karte PAWMATA je hlavnou osobou on; majiteľ #n stojí vedľa neho (ťuk = jeho profil) a psy sú majiteľove.
  const human = member.human;
  const ownerName = memberDisplayName(member) || 'A Dogyptian';
  const displayName = ownerName;
  const avatar = memberAvatarUrl(member);
  const beside = shownMates[0]
      ? { photo: shownMates[0].avatarUrl, initial: (shownMates[0].name?.[0] || 'P').toUpperCase(), label: shownMates[0].name || 'Pawmate' }
      : null;
  const firstDog = member.dogs.find((d) => d.packNumber != null) ?? member.dogs[0] ?? null;
  const coverSrc = coverOfDay(human) || human.buddyPhoto || firstDog?.photo || null;
  const nationality = human.nationality ?? 'SK';
  const nationalityLabel = countryLabel(nationality, lang);
  const pills = humanPills(human.personality, customPills(human), t);
  const st = human.stats;
  const pilgrimLevel = human.pilgrim?.level ?? 1;
  // PÚTNIK do panela: body → level a postup tou istou funkciou ako môj profil. Bez zverejnených bodov
  // (člen ešte neotvoril profil v novej appke) panel nie je — ťuk by ukázal vymyslené nuly.
  const pilgrimPanel = st?.points != null
    ? { level: levelProgress(st.points), count: st.trips ?? 0, km: st.km, countries: st.countries ?? 0 }
    : null;
  const fmt = (n: number) => n.toLocaleString(lang === 'sk' ? 'sk-SK' : 'en-US');
  const num = (n: number | undefined, suffix = '') => <b>{n == null ? '·' : `${fmt(n)}${suffix}`}</b>;
  // `MeOwn` kreslí psov z `PackDogFull` — potrebuje len id, fotku a meno.
  const ownDogs = member.dogs.map((d) => ({ id: d.dogId, cloudinary_main_url: d.photo, dog_name: d.name, pack_number: d.packNumber, heroglyph_png_url: d.heroglyphUrl }) as unknown as PackDogFull);
  // NAPÍSAŤ = rozhovor s človekom (Matej 25. 10.: *„áno, môže sa písať každému“*). Server nájde majiteľa
  // podľa čísla psa — cudzí `user_id` appka ani teraz nemá. Existujúci rozhovor sa len otvorí.
  const writeTo = async () => {
    if (dmBusy || member.memberNumber == null) return;
    setDmBusy(true);
    try {
      // dynamický import — packMessaging ťahá pri načítaní celý katalóg trás (ako PartyMemberCard)
      const m = await import('@/components/pack/messaging/packMessaging');
      const convId = await m.startMemberDM(member.memberNumber);
      if (convId) emitOpenThread(convId);
      else toast({ title: tx('pack.publicProfile.msgFail', "Couldn't open the conversation. Try again in a moment.") });
    } catch {
      toast({ title: tx('pack.publicProfile.msgFail', "Couldn't open the conversation. Try again in a moment.") });
    } finally {
      setDmBusy(false);
    }
  };


  return (
    <PackLayout onBack={goBack} backLabel={t('pack.publicProfile.backToPack')}>
      <style>{PILL_CSS}</style>
      <style>{ME_CSS}</style>
      {FLAT && <style>{ME_FLAT_CSS}</style>}

      <section className={`me-card${FLAT ? ' me-flat' : ''}${open ? ' open' : ''}${beside ? ' with-mate' : ''}`}>
        {/* App Store 1.2 (26. 10. 2026): nahlásiť / zablokovať člena — tri bodky vpravo hore, ako pri príspevku. */}
        {!isSelf && (
          // FLAT (31. 10.): obálka začína pod lepkavým horným radom — vpravo hore by ··· prekryl zvonček
          // (smoke 390 px: neklikateľné). Sedí preto vľavo hore na obálke, pod radom; vpravo je vlajka.
          <div style={FLAT
            ? { position: 'absolute', top: PACK_TOPROW.content + PACK_SPACE.sm, left: PACK_SPACE.sm, zIndex: 5 }
            : { position: 'absolute', top: PACK_SPACE.sm, right: PACK_SPACE.sm, zIndex: 5 }}>
            <PostMenu tone="onCover" authorN={member.memberNumber ?? null} authorName={ownerName} />
          </div>
        )}
        <MeCover
          withName={beside?.label ?? null}
          noRanks={false}
          foreign={!isSelf}
          cover={coverSrc}
          coverY={human.coverY}
          name={displayName}
          devLabel=""
          devLevel={0}
          pilgrimLabel={String(pilgrimLevel)}
          pilgrimLevel={pilgrimLevel}
          pilgrimPct={st?.pilgrimPct ?? 0}
          servantYears={st?.servantYears ?? null}
          servantLabel={tx('pack.ladder.servant', 'Servant')}
          pilgrimRankLabel={tx('pack.map.rankPilgrim', 'Pilgrim')}
          right={<MeFlag code={nationality} label={nationalityLabel || nationality} />}
          // Ťuk len na PÚTNIKA (Matej 25. 10.: *„po kliknutí na tieto levely sa nič neukáže na cudzom profile, možno
          // iba pútnik — level, body, výlety, km a krajiny“*). SLUŽOBNÍK na cudzom profile nereaguje.
          onPilgrim={pilgrimPanel ? () => setRank((r) => (r === 'pt' ? null : 'pt')) : undefined}
          rank={rank}
        />

        <div className="me-under">
          <MeOwn
            photo={avatar}
            initial={(displayName[0] || 'D').toUpperCase()}
            dogs={ownDogs}
            open={open}
            onToggle={() => setOpen((o) => !o)}
            onPhoto={() => {}}
            photoLabel={displayName}
            story="none"
            mate={beside}
            toggleLabel={open ? tx('pack.me.closeDogs', 'Hide dogs') : tx('pack.me.openDogs', 'Show dogs')}
          />

          <div className="me-drawer" aria-hidden={!open}>
            {member.dogs.map((d, k) => (
              <MeDogRow key={d.dogId} dog={ownDogs[k]} attrs={d.attrs} onClose={() => setOpen(false)} tx={tx} />
            ))}
          </div>
          <div className="me-gap" />
          {rank === 'pt' && pilgrimPanel && (
            <MeRank kind="pt" devotion={0} pilgrim={pilgrimPanel} onClose={() => setRank(null)} tx={tx} />
          )}

          {/* 5 ČÍSEL — tie isté ako na mojom profile, zverejnené majiteľom (`human.stats`). */}
          <div className="me-stats">
            {/* SLEDOVANIE (Matej 26. 10. 2026: „presne ako IG … po kliknutí na číslo sa otvorí zoznam"). */}
            <button type="button" onClick={() => setFollowList('followers')}>{num(fol.info?.followers ?? 0)}<span>{tx('pack.me.followers', 'followers')}</span></button>
            <button type="button" onClick={() => setFollowList('following')}>{num(fol.info?.following ?? 0)}<span>{tx('pack.publicProfile.followingThem', 'following')}</span></button>
            <button type="button">{num(st?.brought)}<span>{tx('pack.me.brought', 'brought in')}</span></button>
            <button type="button">{num(st?.km)}<span>km</span></button>
            <button type="button">{num(st?.study, ' %')}<span>{tx('pack.me.studying', 'studying')}</span></button>
          </div>

          {/* SLEDOVAŤ + NAPÍSAŤ ako na IG (Matej 26. 10. 2026: „postavme nech to funguje a vieme sa sledovať").
              Plné lapis je vždy JEDNO: kým ho nesledujem, je to SLEDOVAŤ; potom SLEDUJEŠ zostane
              obrysom (ťuk = prestať) a hlavnou akciou sa stane NAPÍSAŤ.
              Pawmate nemá číslo — nesleduje sa a nepíše sa mu, oboje len majiteľovi. */}
          <div className="me-btns">
            <button type="button" className={fol.info?.iFollow ? 'me-out' : 'me-cta'} onClick={fol.toggle}
              disabled={!fol.info || fol.busy || member.memberNumber == null} aria-pressed={!!fol.info?.iFollow}>
              {fol.info?.iFollow ? `✓ ${tx('pack.publicProfile.followingBtn', 'Following')}` : tx('pack.publicProfile.follow', 'Follow')}
            </button>
            <button type="button" className={fol.info?.iFollow ? 'me-cta' : 'me-out'} onClick={writeTo} disabled={dmBusy || member.memberNumber == null}>
              {tx('pack.publicProfile.message', 'Message')}
            </button>
          </div>
          {followList && member.memberNumber != null && (
            <FollowListPopup
              packNumber={member.memberNumber}
              kind={followList}
              title={followList === 'followers' ? tx('pack.me.followers', 'followers') : tx('pack.publicProfile.followingThem', 'following')}
              empty={tx('pack.follow.empty', 'Nobody yet.')}
              onClose={() => setFollowList(null)}
            />
          )}

          {FLAT ? (
            <div className="me-role me-role--label">
              <span>{roleLabels(false, human, tx).join(' · ')}</span>
              <i aria-hidden />
            </div>
          ) : (
            <div className="me-role">{roleLabels(false, human, tx).map((r) => <span key={r} className="pk-pill">{r}</span>)}</div>
          )}

          <div className={`me-bio${bioFull ? ' full' : ''}${bio ? '' : ' empty'}`}>
            <p ref={bioRef}>
              {bio || tx('pack.publicProfile.noBio', 'No bio yet.')}
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
        </div>
      </section>

      <div style={{ height: PACK_SPACE.xl }} />
    </PackLayout>
  );
}
