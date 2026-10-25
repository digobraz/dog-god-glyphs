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
import { PACK_THEME, PACK_SPACE, PACK_TEXT, PF_FIELD_CSS, PILL_CSS, FONT_UI } from '@/components/pack/packTheme';
import type { PackDogFull } from '@/hooks/usePackUser';
import { customPills, profileRoles, humanPills } from '@/components/pack/profile/packProfile';
import { fetchMemberProfiles, memberAvatarUrl, memberDisplayName, type MemberProfile } from '@/components/pack/profile/memberProfile';
import { coverOfDay } from '@/components/pack/profile/mePosts';
import { ME_CSS, ME_FLAT_CSS, MeCover, MeOwn, MeRank, MeDogRow, MeFlag } from '@/components/pack/profile/meHead';
import { levelProgress } from '@/lib/tripPoints';
import { emitOpenThread } from '@/components/pack/messaging/openBridge';
import { TEST_BUILD } from '@/lib/env';
import { useToast } from '@/hooks/use-toast';

const T = PACK_THEME;
const FLAT = TEST_BUILD;

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

  const bio = member ? (member.human.dogVoiceBio?.trim() || member.human.bio?.trim() || '') : '';
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
  if (isSelf) return <Navigate to="/pack/profile" replace />;

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
  const human = member.human;
  const displayName = memberDisplayName(member) || 'A Dogyptian';
  const avatar = memberAvatarUrl(member);
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
  const dash = <b className="na" aria-label={tx('pack.me.notYet', 'not yet')}>—</b>;
  const soonFeed = (what: string) => soon(what, tx('pack.me.soonFeed', 'Arrives with the FEED.'));
  // `MeOwn` kreslí psov z `PackDogFull` — potrebuje len id, fotku a meno.
  const ownDogs = member.dogs.map((d) => ({ id: d.dogId, cloudinary_main_url: d.photo, dog_name: d.name, pack_number: d.packNumber, heroglyph_png_url: d.heroglyphUrl }) as unknown as PackDogFull);
  const soon = (title: string, description: string) => toast({ title, description });
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

      <section className={`me-card${FLAT ? ' me-flat' : ''}${open ? ' open' : ''}`}>
        <MeCover
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
          right={<MeFlag code={nationality} label={nationalityLabel || nationality}
            here={human.here} hereLabel={human.here ? countryLabel(human.here, lang) : undefined} />}
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
            <button type="button" onClick={() => soonFeed(tx('pack.me.followers', 'followers'))}>{dash}<span>{tx('pack.me.followers', 'followers')}</span></button>
            <button type="button" onClick={() => soonFeed(tx('pack.me.following', 'following'))}>{dash}<span>{tx('pack.me.following', 'following')}</span></button>
            <button type="button">{num(st?.brought)}<span>{tx('pack.me.brought', 'brought in')}</span></button>
            <button type="button">{num(st?.km)}<span>km</span></button>
            <button type="button">{num(st?.study, ' %')}<span>{tx('pack.me.studying', 'studying')}</span></button>
          </div>

          <div className="me-btns">
            <button type="button" className="me-cta" onClick={() => soon(tx('pack.publicProfile.follow', 'Follow'), tx('pack.me.soonFeed', 'Arrives with the FEED.'))}>
              {tx('pack.publicProfile.follow', 'Follow')}
            </button>
            <button type="button" className="me-out" onClick={writeTo} disabled={dmBusy || member.memberNumber == null}>
              {tx('pack.publicProfile.message', 'Message')}
            </button>
          </div>

          {FLAT ? (
            <div className="me-role me-role--label">
              <span>{profileRoles(human).map((r) => tx(`pack.role.${r}`, r)).join(' · ')}</span>
              <i aria-hidden />
            </div>
          ) : (
            <div className="me-role">{profileRoles(human).map((r) => <span key={r} className="pk-pill">{tx(`pack.role.${r}`, r)}</span>)}</div>
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
