// K3 · ZDEDENÝ PROFIL PAWMATA (26. 10. 2026) — nákres `plany/nakresy/pawmate-rola-2026-10-26/index.html` §2.
// Model A (Matej 26. 10.): pawmate NEMÁ samostatný profil — na `/pack/profile` vidí PAWTNEROV profil. Veľká fotka
// a meno sú pawtnerove, pawmate stojí malý vedľa (podpis DUO). Hodnosti pawtnera sú vyblednuté — nie sú jeho.
// Pod hlavou pruh „Si pawmate…", vlastné tlačidlá MOJA FOTKA A BIO (editor, kde mení len O MNE) a POZVI
// (kartu pawtnerovho psa — BONES idú pawtnerovi). Príspevky = pawtnerove verejné (RLS `posts_read`
// pustí pawmata, `is_paid_member()` ho ráta cez `dog_humans`).
// Čo smie PRIDÁVAŤ, nastavuje pawtner v MOJA SVORKA (Matej 26. 10.: *„veď keď bude mať odo mňa povolenie,
// môže pridávať"*) — bez práva len prezerá, návrhy na schválenie NEEXISTUJÚ (K5 zrušené).
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PackDogFull } from '@/hooks/usePackUser';
import { useT, useLang } from '@/i18n/LanguageContext';
import { countryLabel } from '@/lib/countryOptions';
import { levelProgress } from '@/lib/tripPoints';
import { sizedUrl } from '@/services/cloudinaryService';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { PACK_BOX, PACK_SPACE, PACK_TEXT, PACK_THEME, FONT_UI } from '@/components/pack/packTheme';
import { customPills, roleLabels, humanPills } from './packProfile';
import { fetchMemberProfiles, memberAvatarUrl, memberDisplayName, type MemberProfile } from './memberProfile';
import { fetchMyPosts, coverOfDay, isMoment, isAlbum, isTripStory, type MePost } from './mePosts';
import { MeCover, MeOwn, MeRank, MeDogRow, MeFlag } from './meHead';
import { PostViewer } from './PostViewer';

/** Vyblednuté hodnosti pawtnera — vidí ich, ale nie sú jej (nákres §2). */
export const MATE_HOME_CSS = `
.me-zdedeny .me-lv, .me-zdedeny .rk-row { opacity: .55; }
`;

export function MateHome({ dogs, me, onInvite, flat }: {
  /** Psy, ku ktorým má pawmate prístup — všetky patria pawtnerovi. */
  dogs: PackDogFull[];
  /** Pawmate sám — malý kruh vedľa pawtnera. */
  me: { photo: string | null; initial: string; name: string };
  onInvite?: () => void;
  flat: boolean;
}) {
  const t = useT();
  const { lang } = useLang();
  const navigate = useNavigate();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };

  // Pawtner = majiteľ psa s najnižším číslom (číslo človeka = jeho najnižšie psie číslo, CLAUDE.md §Identita).
  const owned = dogs.filter((d) => d.user_id && d.pack_number != null).sort((a, b) => (a.pack_number ?? 0) - (b.pack_number ?? 0));
  const ownerUid = owned[0]?.user_id ?? null;
  const ownerNumber = owned[0]?.pack_number ?? null;
  const ownerDogs = dogs.filter((d) => d.user_id === ownerUid);

  const [member, setMember] = useState<MemberProfile | null | undefined>(undefined);
  const [posts, setPosts] = useState<MePost[] | null>(null);
  const [open, setOpen] = useState(false);
  const [rank, setRank] = useState<'pt' | null>(null);
  const [reading, setReading] = useState<MePost | null>(null);

  useEffect(() => {
    if (ownerNumber == null) { setMember(null); return; }
    let alive = true;
    fetchMemberProfiles([ownerNumber]).then((m) => { if (alive) setMember(m.get(ownerNumber) ?? null); }).catch(() => { if (alive) setMember(null); });
    return () => { alive = false; };
  }, [ownerNumber]);

  useEffect(() => {
    if (!ownerUid) { setPosts([]); return; }
    let alive = true;
    // Pawtnerove príspevky — server vydá len verejné (súkromné ostávajú jeho).
    fetchMyPosts(ownerUid).then((rows) => { if (alive) setPosts(rows.filter((p) => p.visibility === 'public')); }).catch(() => { if (alive) setPosts([]); });
    return () => { alive = false; };
  }, [ownerUid]);

  const human = member?.human;
  const ownerName = (member && memberDisplayName(member)) || ownerDogs[0]?.owner_name?.trim() || 'Pawtner';
  const ownerAvatar = member ? memberAvatarUrl(member) : null;
  const firstDog = ownerDogs.find((d) => d.pack_number != null) ?? ownerDogs[0] ?? null;
  const coverSrc = coverOfDay(human) || human?.buddyPhoto || firstDog?.cloudinary_main_url || null;
  const nationality = human?.nationality ?? 'SK';
  const st = human?.stats;
  const pilgrimLevel = human?.pilgrim?.level ?? 1;
  const pilgrimPanel = st?.points != null
    ? { level: levelProgress(st.points), count: st.trips ?? 0, km: st.km, countries: st.countries ?? 0 }
    : null;
  const fmt = (n: number) => n.toLocaleString(lang === 'sk' ? 'sk-SK' : 'en-US');
  const num = (n: number | undefined, suffix = '') => <b>{n == null ? '·' : `${fmt(n)}${suffix}`}</b>;
  const dash = <b className="na" aria-label={tx('pack.me.notYet', 'not yet')}>—</b>;
  const bio = human ? (human.dogVoiceBio?.trim() || human.bio?.trim() || '') : '';
  const pills = human ? humanPills(human.personality, customPills(human), t) : [];
  // Zablokovaný pawtner (tri bodky v detaile príspevku) = jeho príspevky sa tu nekreslia.
  const grid = (posts ?? []).filter((p) => !isMoment(p) && p.photos.length > 0);
  const first = ownerName;

  return (
    <>
      <style>{MATE_HOME_CSS}</style>
      <section className={`me-card me-zdedeny${flat ? ' me-flat' : ''}${open ? ' open' : ''} with-mate`}>
        <MeCover
          cover={coverSrc}
          coverY={human?.coverY}
          name={ownerName}
          devLabel=""
          devLevel={0}
          pilgrimLabel={String(pilgrimLevel)}
          pilgrimLevel={pilgrimLevel}
          pilgrimPct={st?.pilgrimPct ?? 0}
          servantYears={st?.servantYears ?? null}
          servantLabel={tx('pack.ladder.servant', 'Servant')}
          pilgrimRankLabel={tx('pack.map.rankPilgrim', 'Pilgrim')}
          right={<MeFlag code={nationality} label={countryLabel(nationality, lang) || nationality} />}
          onPilgrim={pilgrimPanel ? () => setRank((r) => (r === 'pt' ? null : 'pt')) : undefined}
          rank={rank}
        />

        <div className="me-under">
          <MeOwn
            photo={ownerAvatar}
            initial={(ownerName[0] || 'D').toUpperCase()}
            dogs={ownerDogs}
            open={open}
            onToggle={() => setOpen((o) => !o)}
            onPhoto={() => {}}
            photoLabel={ownerName}
            story="none"
            mate={{ photo: me.photo, initial: me.initial, label: me.name, onClick: () => navigate('/pack/profile/edit') }}
            toggleLabel={open ? tx('pack.me.closeDogs', 'Hide dogs') : tx('pack.me.openDogs', 'Show dogs')}
          />

          <div className="me-drawer" aria-hidden={!open}>
            {ownerDogs.map((d) => (
              <MeDogRow key={d.id} dog={d} attrs={member?.dogs.find((x) => x.dogId === d.id)?.attrs} onClose={() => setOpen(false)} onDogId={() => navigate(`/pack/dogs/${d.id}`)} tx={tx} />
            ))}
          </div>
          <div className="me-gap" />
          {rank === 'pt' && pilgrimPanel && (
            <MeRank kind="pt" devotion={0} pilgrim={pilgrimPanel} onClose={() => setRank(null)} tx={tx} />
          )}

          {/* SI PAWMATE — jeden pruh, aby nikto nemyslel, že sa pozerá na vlastný profil. */}
          <div style={{ ...PACK_BOX.subblock, display: 'flex', alignItems: 'center', gap: PACK_SPACE.md, padding: `${PACK_SPACE.md}px ${PACK_SPACE.lg}px`, margin: `0 0 ${PACK_SPACE.lg}px` }}>
            <BrandIcon name="eye" size={20} tint="dark" />
            <p style={{ margin: 0, fontFamily: FONT_UI, fontSize: PACK_TEXT.label, lineHeight: 1.45, color: PACK_THEME.inkDim }}>
              {tx('pack.mate.banner', "You're a pawmate. This is your pawtner's profile ({name}) — what you may add, they set in My pack.").split('{name}').join(first)}
            </p>
          </div>

          <div className="me-stats">
            <button type="button">{dash}<span>{tx('pack.me.followers', 'followers')}</span></button>
            <button type="button">{dash}<span>{tx('pack.me.following', 'following')}</span></button>
            <button type="button">{num(st?.brought)}<span>{tx('pack.me.brought', 'brought in')}</span></button>
            <button type="button">{num(st?.km)}<span>km</span></button>
            <button type="button">{num(st?.study, ' %')}<span>{tx('pack.me.studying', 'studying')}</span></button>
          </div>

          <div className="me-btns">
            <button type="button" className="me-cta" onClick={() => navigate('/pack/profile/edit')}>{tx('pack.mate.myPhotoBio', 'My photo & bio')}</button>
            {onInvite && <button type="button" className="me-out" onClick={onInvite}>{tx('pack.me.invite', 'Invite')}</button>}
          </div>

          {flat ? (
            <div className="me-role me-role--label">
              <span>{roleLabels(false, human, tx).join(' · ')}</span>
              <i aria-hidden />
            </div>
          ) : (
            <div className="me-role">{roleLabels(false, human, tx).map((r) => <span key={r} className="pk-pill">{r}</span>)}</div>
          )}

          <div className={`me-bio full${bio ? '' : ' empty'}`}>
            <p>{bio || tx('pack.publicProfile.noBio', 'No bio yet.')}</p>
          </div>

          {pills.length > 0 && (
            <div className="me-strip">
              {pills.map((p) => <span key={p.k} className="pk-pill">{p.emoji && <i>{p.emoji}</i>}{p.label}</span>)}
            </div>
          )}

          {grid.length > 0 ? (
            <div className="me-grid">
              {grid.map((p) => (
                <button key={p.id} type="button" onClick={() => setReading(p)}>
                  <img src={sizedUrl(p.photos[0], 320)} alt="" loading="lazy" />
                  {isTripStory(p) && <span className="me-tag">{tx('pack.me.tagTrip', 'Trip')}</span>}
                  {isAlbum(p) && <span className="me-tag">{tx('pack.me.tagAlbum', 'Album')}</span>}
                  {!isAlbum(p) && p.photos.length > 1 && <span className="me-tag">{p.photos.length}</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="me-empty">{posts == null ? '·' : tx('pack.mate.postsEmpty', 'No posts in your pack yet.')}</div>
          )}
        </div>
      </section>
      {reading && (
        <PostViewer post={reading} name={ownerName} avatar={ownerAvatar} dogs={ownerDogs} mine={false} lang={lang} onClose={() => setReading(null)} />
      )}
    </>
  );
}
