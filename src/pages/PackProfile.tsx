import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera, Eye, EyeOff, Loader2, LogOut, BellOff, KeyRound, X } from 'lucide-react';
import { BrandIcon } from '@/components/pack/BrandIcon';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PackNetwork } from '@/components/pack/PackNetwork';
import { usePackUser, type PackDogFull } from '@/hooks/usePackUser';
import { PACK_THEME } from '@/components/pack/packTheme';
import { uploadExtraPhoto } from '@/services/cloudinaryService';
import { useToast } from '@/hooks/use-toast';
import {
  useProfile,
  saveHuman,
  saveDogAttrs,
  deriveDefaultDogAttrs,
  emptyDogCard,
  type DogCard,
  type HumanProfile,
  type TaxonomyOption,
  type RelationshipStatus,
  type PersonalityTag,
  type CentralProfile,
  type DogTemperamentTag,
  type DogTrailTag,
  RELATIONSHIP_OPTIONS,
  NATIONALITY_OPTIONS,
  DIET_OPTIONS,
  SMOKE_OPTIONS,
  WORK_OPTIONS,
  PERSONALITY_OPTIONS,
  MAX_PERSONALITY,
  HIDEABLE_IDENTITY_FIELDS,
  isHidden,
  humanProfileCompletion,
  type ProfileFieldKey,
} from '@/components/pack/profile/packProfile';
import { DogGalleryAccordion, type DogGalleryEntry } from '@/components/pack/profile/DogGallery';

const T = PACK_THEME;

// ── PAPYRUS PRIMITÍVY (lock 2026-07-26) ──────────────────────────────────────
// Matej: „dizajn bledých blokov sme si lockli na základe toho aký je v /entry"
// + „je to všetko moc na sebe — oddeliť okrajmi vizuálne ale aj rozdeliť
// logicky". Preto profil UŽ NIE JE jedna karta s dvoma stĺpcami (ten layout
// vyrábal prázdny pravý stĺpec, ktorý Matej zamietol 25.7.), ale stack
// samostatných papyrusových kariet s medzerami — každá = jedna téma.
function PapyrusCard({
  children,
  id,
  pad = 26,
}: {
  children: React.ReactNode;
  id?: string;
  pad?: number;
}) {
  return (
    <section
      id={id}
      style={{
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16,
        boxShadow: T.cardShadow,
        padding: pad,
        scrollMarginTop: 90,
      }}
    >
      {children}
    </section>
  );
}

/** Zlatá deliaca čiara vyblednutá do strán (`.religion-rule` z /entry). */
function GoldRule({ width = 54, my = 12 }: { width?: number | string; my?: number }) {
  return (
    <div
      aria-hidden
      style={{ width, height: 2, margin: `${my}px 0`, background: T.rule, border: 'none' }}
    />
  );
}

// Pod-blok VNÚTRI papyrusovej karty — `.crit-tile` z /entry (zlatá výplň 6 %,
// zlatý okraj 35 %, radius 10). Matej 2026-07-26: „je to všetko moc na sebe —
// oddeliť okrajmi vizuálne ale aj rozdeliť logicky." Každý pod-blok = jedna
// otázka, ktorú profil kladie, takže okraj nie je dekorácia, ale hranica témy.
function SubBlock({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div
      style={{
        background: T.tileBg,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: '11px 13px 13px',
      }}
    >
      <div className="flex items-baseline justify-between" style={{ gap: 10, marginBottom: 9 }}>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 9,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: T.inkDim,
          }}
        >
          {label}
        </span>
        {hint && (
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 10.5,
              color: T.inkFaint,
              textAlign: 'right',
            }}
          >
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/** Malý eyebrow nadpis sekcie — Space Grotesk, zlatý, wide tracking. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.26em',
        textTransform: 'uppercase',
        color: T.cardEdge,
      }}
    >
      {children}
    </span>
  );
}

// Stav vyplnenia profilu — zlatý bar v hlavičke sekcie. Pri 100 % sa mení na
// potvrdenie, inak menuje PRVÉ chýbajúce pole (konkrétna výzva > „doplň profil").
function ProfileProgress({
  pct,
  filled,
  total,
  missing,
}: {
  pct: number;
  filled: number;
  total: number;
  missing: { labelEN: string }[];
}) {
  const done = pct === 100;
  return (
    <div style={{ minWidth: 0, flex: '1 1 220px', maxWidth: 340 }}>
      <div className="flex items-baseline justify-between" style={{ gap: 10, marginBottom: 6 }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12,
            color: T.inkWarm,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {done ? 'Your scroll is complete.' : `Next: add your ${missing[0]?.labelEN.toLowerCase()}`}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            color: done ? T.growGreen : T.cardEdge,
            flexShrink: 0,
          }}
        >
          {filled}/{total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Profile completion"
        style={{
          height: 6,
          borderRadius: 999,
          background: 'rgba(201,154,63,0.16)',
          border: `1px solid ${T.hairline}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 999,
            background: done
              ? T.growGreen
              : 'linear-gradient(90deg, #E6B450 0%, #C99A3F 100%)',
            transition: 'width 420ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>
    </div>
  );
}

export default function PackProfile() {
  const [session, setSession] = useState<Session | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [nameDirty, setNameDirty] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pwValue, setPwValue] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwDone, setPwDone] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { dogs, loading: dogsLoading } = usePackUser(session?.user?.id ?? null);
  // Central profile (bio/basics/pills) — read here for BLOK 1 (identity+bio card);
  // ProfileEditor below reads its own copy for BLOK 2 (merged pills card). Same
  // localStorage-backed store, kept in sync via useProfile()'s listener.
  const { profile } = useProfile();
  const human = profile?.human;
  const patchHuman = (p: Partial<HumanProfile>) => { saveHuman(p); };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      const meta = (data.session?.user.user_metadata ?? {}) as Record<string, string | undefined>;
      // DEV-ONLY: NOAUTH guest nemá session, takže avatar aj meno by boli prázdne
      // a stránka by sa v deve nedala vizuálne posúdiť (Matej 2026-07-26: „nech
      // vidíme preview"). Nikdy sa nedostane na produkciu (import.meta.env.DEV).
      // NECOMMITOVAŤ — revert pred pushom, spolu s dev seedom v usePackUser.ts.
      // Pozor: NIE `&& !data.session` — v deve často JE session (testovací účet)
      // s prázdnym full_name/avatar_url, takže fallback by sa nikdy nechytil a
      // avatar by ostal prázdny krúžok s iniciálou z e-mailu. Zrkadlí to
      // usePackUser.ts, ktorý psov preseeduje pri DEV_NOAUTH bez ohľadu na session.
      const devNoAuth = import.meta.env.DEV && import.meta.env.VITE_PACK_NOAUTH === '1';
      setAvatarUrl(meta.avatar_url || meta.avatar || (devNoAuth ? '/images/about-matej.png' : null));
      setFullName(meta.full_name || meta.name || (devNoAuth ? 'Matej Stacho' : ''));
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-open file picker when ?edit=avatar
  useEffect(() => {
    if (searchParams.get('edit') === 'avatar') {
      const t = setTimeout(() => fileInputRef.current?.click(), 200);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  // Welcome deep-link (?welcome=1) invites password setup → auto-open the modal.
  useEffect(() => {
    if (searchParams.get('welcome') === '1') setPwModalOpen(true);
  }, [searchParams]);

  // #my-gods deep-link (avatar menu "My Pack" → /pack/profile#my-gods) — client-side nav does NOT
  // auto-scroll to a hash like a full page load does, so scroll it into view manually once dogs
  // are on screen (dogsLoading gate avoids scrolling to a still-empty section).
  useEffect(() => {
    if (location.hash !== '#my-gods' || dogsLoading) return;
    const t = setTimeout(() => {
      document.getElementById('my-gods')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(t);
  }, [location.hash, dogsLoading]);

  const email = session?.user?.email ?? '—';

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !session?.user) return;
    setUploading(true);
    try {
      const result = await uploadExtraPhoto(file, `avatars/${session.user.id}`, 1);
      const { error: upErr } = await supabase.auth.updateUser({
        data: { avatar_url: result.secureUrl },
      });
      if (upErr) throw new Error(upErr.message);
      setAvatarUrl(result.secureUrl);
      toast({ title: 'Photo updated' });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!nameDirty || nameSaving) return;
    setNameSaving(true);
    try {
      const { error: upErr } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() || null },
      });
      if (upErr) throw new Error(upErr.message);
      setNameDirty(false);
      toast({ title: 'Name updated' });
    } catch (err) {
      toast({
        title: 'Could not save',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setNameSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch {
      setSigningOut(false);
    }
  };

  // Email "Open My Profile" deep-links here with ?welcome=1 to invite password setup.
  const fromWelcome = searchParams.get('welcome') === '1';

  const handleSetPassword = async () => {
    setPwError('');
    if (pwValue.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    if (pwValue !== pwConfirm) { setPwError('Passwords do not match.'); return; }
    setPwSaving(true);
    try {
      const { error: upErr } = await supabase.auth.updateUser({ password: pwValue });
      if (upErr) throw new Error(upErr.message);
      setPwDone(true);
      setPwValue('');
      setPwConfirm('');
      setPwModalOpen(false);
      toast({ title: 'Password set', description: 'You can now log in with email + password.' });
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Could not set password.');
    } finally {
      setPwSaving(false);
    }
  };

  const initial = (fullName?.[0] || email?.[0] || 'D').toUpperCase();
  const hasAvatar = !!avatarUrl;

  // Stav vyplnenia — avatar a meno žijú v user_metadata, nie v HumanProfile,
  // preto idú do `extra` (bez nich by profil nikdy nedosiahol 100 %).
  const completion = humanProfileCompletion(human, [
    { key: 'avatar', labelEN: 'Photo', done: hasAvatar },
    { key: 'name', labelEN: 'Name', done: !!fullName.trim() },
  ]);

  return (
    <PackLayout wide>
      <div className="flex flex-col gap-5">
        {/* Back to Home — bottom nav is hidden on LIVE, so profile needs its own way back */}
        <Link
          to="/pack"
          className="inline-flex items-center gap-2"
          style={{
            fontFamily: "'Cinzel', serif",
            letterSpacing: '0.22em',
            fontSize: 11,
            textTransform: 'uppercase',
            color: T.inkDim,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft className="h-3 w-3" />
          Pack
        </Link>
        {/* ── SEKCIA 1 — WHO YOU ARE (človek) ─────────────────────────────
            Vlastná papyrusová karta. Veľký nadpis tu ZÁMERNE nie je — hlavný
            hrdina profilu je pes („OH, MY DOG!" nižšie), človek je eyebrow.
            Zrkadlí brand princíp: majiteľ je vnútri rámiku psa, nie naopak. */}
        <PapyrusCard>
          <div className="flex flex-wrap items-end justify-between" style={{ gap: 16 }}>
            <Eyebrow>Who you are</Eyebrow>
            <ProfileProgress
              pct={completion.pct}
              filled={completion.filled}
              total={completion.total}
              missing={completion.missing}
            />
          </div>
          <GoldRule width="100%" my={16} />
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar */}
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploading}
              aria-label="Change avatar"
              className="relative shrink-0 group self-center sm:self-auto"
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                border: hasAvatar ? `1px solid ${T.hairline}` : `2px dashed ${T.border}`,
                background: hasAvatar
                  ? 'transparent'
                  : 'linear-gradient(135deg, #F0E3C4 0%, #F5EDD8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: uploading ? 'progress' : 'pointer',
                padding: 0,
              }}
            >
              {hasAvatar ? (
                <img
                  src={avatarUrl!}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 32,
                    fontWeight: 700,
                    color: T.inkDim,
                  }}
                >
                  {initial}
                </span>
              )}
              <span
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(10,10,10,0.55)', color: T.card, borderRadius: '50%' }}
              >
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />

            {/* Name + nickname + display-as toggle — avatar click already shows a
                camera affordance on hover, so no "add a photo" caption is needed.
                Name auto-saves on blur (no Save button). Name/Nickname sit side by
                side in a 2-col grid on ALL breakpoints incl. mobile, compact inputs
                (per zadanie-profil-shrink-2026-07-24 — was full-width stacked). */}
            <div className="min-w-0 flex-1 w-full">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: 9,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: T.inkDim,
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setNameDirty(true);
                    }}
                    onBlur={() => { handleSaveName(); }}
                    placeholder="Your name"
                    style={{
                      width: '100%',
                      background: T.bg,
                      border: `1px solid ${T.hairline}`,
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: T.ink,
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: 9,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: T.inkDim,
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Nickname
                  </label>
                  <AutoSaveTextInput
                    value={human?.nickname ?? ''}
                    onSave={(v) => patchHuman({ nickname: v || undefined })}
                    placeholder="Pack calls you"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2.5 flex-wrap">
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: T.inkDim }}>
                  Show as:
                </span>
                <DisplayAsToggle
                  value={human?.displayAs ?? 'name'}
                  onChange={(v) => patchHuman({ displayAs: v })}
                />
              </div>
            </div>
          </div>

          {/* identity pills — ONE row: gender (read-only) · age · status
              (relationship, single pill dropdown) · nationality (flag+abbr
              dropdown, default SVK) · city. Languages removed from UI (field
              kept in data, just not shown). Folds in what used to be "The
              basics" section (zadanie-profil-konsolidacia-2026-07-24); order +
              status/nationality collapsed to single dropdowns per
              zadanie-profil-shrink-2026-07-24. */}
          {/* Dva pod-bloky s okrajmi namiesto dvoch riadkov pills nalepených na
              seba. ZÁKLAD je povinná časť identity, LIFESTYLE je dobrovoľná —
              preto sú to dve témy, nie jeden zlepenec. Zarovnanie je zľava, nie
              na stred: vycentrované pills plávali v prázdnej šírke karty. */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 10, marginTop: 18 }}>
          <SubBlock label="The basics">
            <div className="flex flex-wrap items-center gap-1.5">
              <HideWrap hidden={isHidden(profile, 'age')}>
                <MiniChipInput
                  emoji="🎂"
                  type="number"
                  value={human?.age}
                  placeholder="Age"
                  width={32}
                  onSave={(v) => patchHuman({ age: v === '' ? undefined : Number(v) })}
                />
              </HideWrap>
              <MiniChip>
                <span aria-hidden>🐶</span>
                <span style={{ color: dogs.length ? T.inkDim : T.inkFaint }}>
                  {dogs.length} {dogs.length === 1 ? 'dog' : 'dogs'}
                </span>
              </MiniChip>
              {/* Národnosť oko NEMÁ — vždy viditeľná (Matej 2026-07-25). */}
              <NationalitySelect
                value={human?.nationality ?? 'SK'}
                onChange={(v) => patchHuman({ nationality: v })}
              />
              <HideWrap hidden={isHidden(profile, 'region')}>
                <MiniChipInput
                  emoji="📍"
                  value={human?.region ?? ''}
                  placeholder="City"
                  width={76}
                  onSave={(v) => patchHuman({ region: v || undefined })}
                />
              </HideWrap>
              {/* Jedno oko na celý riadok — dropdown s výberom, čo skryť (Matej
                  2026-07-25: „nie oko pri každej"). Druhý riadok oko nemá: je
                  dobrovoľný, kto ho nechce ukázať, nevyplní ho. */}
              <IdentityVisibilityEye profile={profile} patchHuman={patchHuman} />
            </div>
          </SubBlock>
          <SubBlock label="Lifestyle" hint="Optional">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusSelect
                value={human?.relationship}
                onChange={(v) => patchHuman({ relationship: v })}
              />
              <LifestyleSelect
                emoji="🚬"
                placeholder="Smoke"
                options={SMOKE_OPTIONS}
                value={human?.smoke}
                onChange={(v) => patchHuman({ smoke: v })}
              />
              <LifestyleSelect
                emoji="🥗"
                placeholder="Diet"
                options={DIET_OPTIONS}
                value={human?.diet}
                onChange={(v) => patchHuman({ diet: v })}
              />
              <LifestyleSelect
                emoji="💼"
                placeholder="Work"
                options={WORK_OPTIONS}
                value={human?.work}
                onChange={(v) => patchHuman({ work: v })}
              />
            </div>
          </SubBlock>
          </div>

          {/* Bio — ONE textarea (dog-voice), moved under the pills row (was in
              the RIGHT column) per zadanie-profil-layout-swap-2026-07-24. The
              separate "About me" textarea was folded away — dog-voice bio is
              the hero copy (zadanie-profil-koncentrat-2026-07-24 ČASŤ B.1).
              Dostalo zlatú deliacu čiaru + väčší odstup: je to hook profilu,
              nie tretí riadok formulára. */}
          <GoldRule width="100%" my={18} />
          <div>
            {/* BIO heading — one bold, oversized line. It's the funny/unique hook
                of the profile, so it should pop (Matej 2026-07-24). */}
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, lineHeight: 1.2, color: T.inkStrong, marginBottom: 10 }}>
              BIO: What my dog would probably say about me
            </div>
            <WordLimitTextarea
              value={human?.dogVoiceBio ?? ''}
              onSave={(v) => patchHuman({ dogVoiceBio: v })}
              placeholder="My human wakes up at 6 just to walk me. Slightly obsessed. Would recommend. — 🐾"
              rows={2}
            />
          </div>

        </PapyrusCard>

        {/* ── SEKCIA 2 — OH, MY DOG! (psy) ─────────────────────────────────
            Dostala vlastnú kartu v plnej šírke. Predtým sedela v pravom stĺpci
            zlúčenej karty, čo vyrábalo ~400 px prázdna pod dvoma nízkymi boxmi
            (Matej 25.7.: „obsahovo sa mi to páči ale vizuálne nie"). Plná šírka
            ten prázdny stĺpec ruší úplne a fotky psov majú kam dýchať. */}
        <PapyrusCard id="my-gods">
          <MyGodsContent dogs={dogs} loading={dogsLoading} profile={profile} />
        </PapyrusCard>

        {/* ── SEKCIA 3 — WHAT YOU'RE LIKE (osobnosť) ───────────────────────
            20 pills / 5 skupín / spoločný max-10 (zadanie-profil-koncentrat-
            2026-07-24 ČASŤ B.2). Vlastná karta, lebo je to najvyšší blok
            stránky — natlačený pod bio pôsobil ako pokračovanie formulára. */}
        <PapyrusCard>
          <Eyebrow>What you’re like</Eyebrow>
          <GoldRule width="100%" my={14} />
          <PersonalityConcentrate human={human} patchHuman={patchHuman} />
        </PapyrusCard>

        {/* Bones + your network — split two-column block */}
        <PackNetwork />

        {/* Password block presunutý do Account info bloku → modal (pwModalOpen) */}

        {/* Account info (read-only) */}
        <PapyrusCard pad={22}>
          <Eyebrow>Account</Eyebrow>
          <GoldRule width="100%" my={12} />
          {/* F1 icon audit (2026-07-25): lucide Mail → brand envelope.svg. Na tej istej stránke
              už brandová obálka bežala (PackNotifications), takže tu boli DVE rôzne obálky. */}
          <Field icon={<BrandIcon name="envelope" size={16} tint="dim" />} label="Email">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: T.ink }}>
              {email}
            </span>
          </Field>
          <Field icon={<KeyRound className="h-4 w-4" />} label="Password">
            <button
              type="button"
              onClick={() => setPwModalOpen(true)}
              style={{
                background: 'none',
                border: `1px solid ${T.hairline}`,
                borderRadius: 8,
                padding: '6px 14px',
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: T.inkDim,
                cursor: 'pointer',
              }}
            >
              Set / Change
            </button>
          </Field>
          <Field icon={<BrandIcon name="globe" size={16} tint="gold" />} label="Language">
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: T.ink }}>
                English
              </span>
              <Badge label="Locked v0" />
            </div>
          </Field>
          <Field icon={<BellOff className="h-4 w-4" />} label="Notifications">
            <Badge label="Coming soon" />
          </Field>
          <Field icon={<LogOut className="h-4 w-4" />} label="Sign out" last>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                background: 'none',
                border: `1px solid ${T.hairline}`,
                borderRadius: 8,
                padding: '6px 14px',
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: T.inkDim,
                cursor: signingOut ? 'default' : 'pointer',
                opacity: signingOut ? 0.5 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {signingOut && <Loader2 className="h-3 w-3 animate-spin" />}
              Sign out
            </button>
          </Field>
        </PapyrusCard>

        <div style={{ height: 24 }} />
      </div>

      {/* Password modal — set/change credentials (otvára sa z Account info riadku alebo ?welcome=1) */}
      {pwModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 60, background: 'rgba(20,16,8,0.55)', backdropFilter: 'blur(4px)', padding: 20 }}
          onClick={() => setPwModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              background: T.panelGrad,
              border: `1.5px solid ${T.cardEdge}`,
              borderRadius: 14,
              padding: 24,
              boxShadow: T.panelShadow,
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: T.inkDim }}>
                Password
              </span>
              <button
                type="button"
                onClick={() => setPwModalOpen(false)}
                aria-label="Close"
                className="inline-flex items-center justify-center"
                style={{ width: 30, height: 30, borderRadius: 999, background: 'rgba(31,26,14,0.06)', border: 'none', cursor: 'pointer', color: T.inkDim }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: T.inkDim, margin: '0 0 16px' }}>
              {fromWelcome
                ? 'Finish your account — set a password to log in any time without the email link.'
                : 'Set or change your password for email + password login.'}
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="password"
                autoComplete="new-password"
                value={pwValue}
                onChange={(e) => { setPwValue(e.target.value); setPwDone(false); }}
                placeholder="New password (min 8 characters)"
                style={{ width: '100%', background: T.bg, border: `1px solid ${T.hairline}`, borderRadius: 10, padding: '12px 14px', color: T.ink, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, outline: 'none' }}
              />
              <input
                type="password"
                autoComplete="new-password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                placeholder="Confirm password"
                style={{ width: '100%', background: T.bg, border: `1px solid ${T.hairline}`, borderRadius: 10, padding: '12px 14px', color: T.ink, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, outline: 'none' }}
              />
              {pwError && (
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: '#A04040' }}>{pwError}</span>
              )}
              <button
                type="button"
                onClick={handleSetPassword}
                disabled={pwSaving || pwValue.length === 0}
                className="inline-flex items-center justify-center gap-2"
                style={{ background: T.ink, color: T.card, border: 'none', padding: '12px 16px', borderRadius: 10, fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', opacity: (pwSaving || pwValue.length === 0) ? 0.6 : 1 }}
              >
                {pwSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Set password
              </button>
            </div>
          </div>
        </div>
      )}

    </PackLayout>
  );
}

// My Gods — psia galéria ako accordion editor (zbalené foto·meno·heroglyf# → rozbalené BIO+tagy,
// zadanie-profil-read-dog-2026-07-25 §2). Inner obsah (bez karty), sedí v pravej časti zlúčeného
// Identity bloku. Detail (zdravie/dokumenty/PDF) ostáva na `/pack/dogs/:id` (PackDogDetail) —
// accordion tu rieši len BIO+tagy, needuplikuje zvyšok toho panelu.
function MyGodsContent({ dogs, loading, profile }: { dogs: PackDogFull[]; loading: boolean; profile: CentralProfile | null }) {
  const entries: DogGalleryEntry[] = dogs.map((d) => ({
    id: d.id,
    name: d.dog_name || 'Unnamed',
    photoUrl: d.cloudinary_main_url,
    packNumber: d.pack_number,
    attrs: profile?.dogs[d.id] ?? deriveDefaultDogAttrs(d.id),
    heroglyph: {
      gender: d.selections?.dogGender,
      colour: d.selections?.dogColour,
      bloodline: d.selections?.dogBloodline,
    },
  }));

  // Psia karta — patch merge do existujúcej karty (accordion posiela vždy len
  // zmenené pole; `compat` prichádza už zlúčený z DogGallery).
  const saveCard = (dogId: string, patch: Partial<DogCard>) => {
    const current = profile?.dogs[dogId] ?? deriveDefaultDogAttrs(dogId);
    saveDogAttrs(dogId, { card: { ...(current.card ?? emptyDogCard()), ...patch } });
  };

  const toggleTag = (dogId: string, group: 'temperament' | 'trail', tag: string) => {
    const current = profile?.dogs[dogId] ?? deriveDefaultDogAttrs(dogId);
    if (group === 'temperament') {
      const list = current.tags.temperament;
      const next: DogTemperamentTag[] = list.includes(tag as DogTemperamentTag)
        ? list.filter((v) => v !== tag)
        : [...list, tag as DogTemperamentTag];
      saveDogAttrs(dogId, { tags: { ...current.tags, temperament: next } });
    } else {
      const list = current.tags.trail;
      const next: DogTrailTag[] = list.includes(tag as DogTrailTag)
        ? list.filter((v) => v !== tag)
        : [...list, tag as DogTrailTag];
      saveDogAttrs(dogId, { tags: { ...current.tags, trail: next } });
    }
  };

  return (
    <>
      {/* Nadpis sekcie — Matej 2026-07-26: „namiesto názvu my gods daj vacsím
          nadpis OH, MY DOG!". Bol to 10px Cinzel eyebrow, teda vizuálne label
          formulára; teraz je to hlavný nadpis stránky (pes > majiteľ). */}
      <div className="flex items-start justify-between" style={{ gap: 16, marginBottom: 4 }}>
        <div style={{ minWidth: 0 }}>
          <div className="flex items-center gap-2.5" style={{ marginBottom: 2 }}>
            <BrandIcon name="heartpaw" size={17} tint="gold" />
            <Eyebrow>Your pantheon</Eyebrow>
          </div>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              fontSize: 'clamp(1.75rem, 5.5vw, 2.6rem)',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              lineHeight: 1.05,
              color: T.inkStrong,
              margin: 0,
            }}
          >
            Oh, my dog!
          </h2>
        </div>
        {!loading && dogs.length > 0 && (
          <span
            className="inline-flex items-center justify-center shrink-0"
            style={{
              minWidth: 30,
              height: 30,
              padding: '0 9px',
              borderRadius: 999,
              background: T.tileBg,
              border: `1px solid ${T.border}`,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              color: T.cardEdge,
            }}
          >
            {dogs.length}
          </span>
        )}
      </div>
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13.5,
          lineHeight: 1.5,
          color: T.inkWarm,
          margin: '0 0 2px',
        }}
      >
        {loading
          ? ' '
          : dogs.length === 0
            ? 'No god yet. Every Dogyptian starts with one.'
            : dogs.length === 1
              ? 'The one who chose you. Tell the pack who they are.'
              : 'The ones who chose you. Tell the pack who they are.'}
      </p>
      <GoldRule width="100%" my={14} />

      {loading ? (
        <div className="flex items-center gap-2 py-2" style={{ color: T.inkFaint }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>Loading your gods…</span>
        </div>
      ) : (
        <DogGalleryAccordion
          dogs={entries}
          editable
          layout="tiles"
          onSaveBio={(dogId, bio) => saveDogAttrs(dogId, { bio: bio.slice(0, 200) })}
          onToggleTag={toggleTag}
          onSaveCard={saveCard}
          addSlot={
            /* „Add a god" má tvar dlaždice, ale ZÁMERNE nižšiu váhu než pes —
               dashed okraj, bez fotky, bez cartouche pásu. Boh a „pridaj boha"
               nesmú vyzerať rovnako dôležito. */
            <Link
              to="/entry"
              className="flex flex-col items-center justify-center"
              style={{
                aspectRatio: '1 / 1',
                gap: 8,
                textDecoration: 'none',
                border: `1.5px dashed ${T.border}`,
                borderRadius: 12,
                background: 'rgba(201,154,63,0.04)',
              }}
            >
              <span
                className="inline-flex items-center justify-center shrink-0"
                style={{ width: 42, height: 42, borderRadius: '50%', border: `1.5px dashed ${T.border}`, color: T.inkFaint, fontSize: 22, lineHeight: 1 }}
              >
                +
              </span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.inkFaint, textAlign: 'center', padding: '0 6px' }}>
                Add a god
              </span>
            </Link>
          }
        />
      )}
    </>
  );
}

function Field({
  icon,
  label,
  children,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-3.5"
      style={{
        borderBottom: last ? 'none' : `1px solid ${T.hairline}`,
      }}
    >
      <div className="flex items-center gap-3" style={{ color: T.inkDim }}>
        {icon}
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 10,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Badge({ label, danger }: { label: string; danger?: boolean }) {
  return (
    <span
      style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 9,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: danger ? '#A04040' : T.inkDim,
        border: `1px solid ${danger ? 'rgba(160,64,64,0.3)' : T.hairline}`,
        padding: '5px 10px',
        borderRadius: 999,
      }}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Koncentrát osobnosti + lifestyle — BLOK 2 rozpustený do BLOK 1 (ľavý
// stĺpec, pod bio) — zadanie-profil-koncentrat-2026-07-24. Nahrádza starý
// samostatný <ProfileEditor/> ("Topics & style" karta, Topics/vibe/off-the-
// leash/person-type/smoking/alcohol/looking-for pill groups + per-field
// visibility toggle). Read/write stále cez useProfile()/saveHuman() —
// žiadny priamy localStorage.
// ─────────────────────────────────────────────────────────────────────────

const MAX_WORDS = 150;
function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

// LANGUAGE_OPTIONS removed from BLOK 1 UI (zadanie-profil-blok1-rework-2026-07-24
// — `human.languages` data field stays, just no longer rendered here).

// Small sub-heading above a field/group.
function SubFieldLabel({ label }: { label: string }) {
  return (
    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: T.inkDim, display: 'block', marginBottom: 8 }}>
      {label}
    </span>
  );
}

// Reusable pill — selected = gold fill (T.accentGold) + dark text, unselected =
// T.bg + hairline border + inkDim text. Emoji prefix (font-native, per
// zadanie-profil-kompakt-emoji-2026-07-24) replaces the old <BrandIcon>; falls
// back to no prefix when an option has neither (never invents one). `disabled`
// = at MAX_PERSONALITY and not yet selected — dimmed, click is a no-op.
function ProfilePill<V extends string>({
  option,
  selected,
  disabled,
  onClick,
}: {
  option: TaxonomyOption<V>;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className="inline-flex items-center gap-1"
      style={{
        background: selected ? T.accentGold : T.bg,
        border: `1px solid ${selected ? T.accentGold : T.hairline}`,
        borderRadius: 999,
        padding: '3px 9px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11,
        fontWeight: selected ? 600 : 500,
        color: selected ? '#1F1A0E' : T.inkDim,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {option.emoji ? <span aria-hidden>{option.emoji}</span> : null}
      {option.labelEN}
    </button>
  );
}

// Koncentrát osobnosti — 20 pills / 5 groups (Vibe/Active/Creative/Taste/
// Dogs), ONE shared max-10 limit + "{n}/10" counter (zadanie-profil-
// koncentrat-2026-07-24 ČASŤ B.2). Selected pills stay clickable (unselect
// always allowed); unselected pills disable once the cap is hit.
function PersonalityConcentrate({
  human,
  patchHuman,
}: {
  human: HumanProfile | undefined;
  patchHuman: (p: Partial<HumanProfile>) => void;
}) {
  const selected = human?.personality ?? [];
  const custom = human?.customPersonality;
  const total = selected.length + (custom ? 1 : 0);
  const atMax = total >= MAX_PERSONALITY;
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const toggle = (v: PersonalityTag) => {
    if (selected.includes(v)) {
      patchHuman({ personality: selected.filter((x) => x !== v) });
    } else if (!atMax) {
      patchHuman({ personality: [...selected, v] });
    }
  };

  const saveCustom = () => {
    const t = draft.trim().slice(0, 24);
    patchHuman({ customPersonality: t || undefined });
    setDraft('');
    setAdding(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: T.inkDim }}>
          Personality
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: atMax ? T.accentGold : T.inkFaint }}>
          {total}/{MAX_PERSONALITY}
        </span>
      </div>
      {/* Flat pool — no group sub-headings, tighter gaps (Matej 2026-07-24:
          „daj preč nadpisy … tie pils sú veľké a roztiahnuté"). Last: ONE
          user-written custom pill („pridať vlastný pill, len 1x"). */}
      <div className="flex flex-wrap gap-1.5">
        {PERSONALITY_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <ProfilePill
              key={opt.value}
              option={opt}
              selected={isSelected}
              disabled={!isSelected && atMax}
              onClick={() => toggle(opt.value)}
            />
          );
        })}

        {/* Custom pill — set = gold chip with ✕ to remove; unset = "+ Add your
            own" (only when there's room). One only. */}
        {custom ? (
          <button
            type="button"
            onClick={() => patchHuman({ customPersonality: undefined })}
            className="inline-flex items-center gap-1"
            style={{
              background: T.accentGold,
              border: `1px solid ${T.accentGold}`,
              borderRadius: 999,
              padding: '3px 9px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: '#1F1A0E',
              cursor: 'pointer',
            }}
          >
            <span aria-hidden>✏️</span>
            {custom}
            <span aria-hidden style={{ opacity: 0.7 }}>✕</span>
          </button>
        ) : adding ? (
          <input
            autoFocus
            value={draft}
            maxLength={24}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveCustom}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); saveCustom(); }
              if (e.key === 'Escape') { setDraft(''); setAdding(false); }
            }}
            placeholder="Your own…"
            style={{
              background: T.bg,
              border: `1px dashed ${T.border}`,
              borderRadius: 999,
              padding: '3px 10px',
              width: 120,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11,
              color: T.ink,
              outline: 'none',
            }}
          />
        ) : !atMax ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1"
            style={{
              background: 'transparent',
              border: `1px dashed ${T.border}`,
              borderRadius: 999,
              padding: '3px 9px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11,
              fontWeight: 500,
              color: T.inkFaint,
              cursor: 'pointer',
            }}
          >
            ＋ Add your own
          </button>
        ) : null}
      </div>
    </div>
  );
}

// Compact lifestyle dropdown — same rounded-pill select chrome as
// Nationality/Status above (ČASŤ B.3). Generic over any TaxonomyOption union.
function LifestyleSelect<V extends string>({
  emoji,
  placeholder,
  options,
  value,
  onChange,
}: {
  emoji: string;
  placeholder: string;
  options: TaxonomyOption<V>[];
  value: V | undefined;
  onChange: (v: V | undefined) => void;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? (e.target.value as V) : undefined)}
      style={{
        background: T.bg,
        border: `1px solid ${T.hairline}`,
        borderRadius: 999,
        padding: '4px 8px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11,
        color: value ? T.ink : T.inkFaint,
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      <option value="">{emoji} {placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.emoji ? `${opt.emoji} ` : ''}{opt.labelEN}</option>
      ))}
    </select>
  );
}

// ≤150-word textarea with a live counter — blocks further growth once over
// the limit (spec: „nad limit blokuj ďalší vstup"). Auto-saves on blur.
function WordLimitTextarea({
  value,
  onSave,
  placeholder,
  rows = 4,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  const count = countWords(local);
  const over = count > MAX_WORDS;

  return (
    // IG-style: counter overlaid inside the textarea's bottom-right corner
    // (per Matej — no separate line below, consolidates space).
    <div style={{ position: 'relative' }}>
      <textarea
        value={local}
        onChange={(e) => {
          const next = e.target.value;
          if (countWords(next) > MAX_WORDS && next.length > local.length) return;
          setLocal(next);
        }}
        onBlur={() => { if (local !== value) onSave(local); }}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          background: T.bg,
          border: `1px solid ${T.hairline}`,
          borderRadius: 10,
          padding: '8px 12px 22px',
          minHeight: 48,
          color: T.ink,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13,
          lineHeight: 1.4,
          outline: 'none',
          resize: 'vertical',
        }}
      />
      <span
        style={{
          position: 'absolute',
          right: 10,
          bottom: 8,
          pointerEvents: 'none',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: over ? '#A04040' : T.inkFaint,
        }}
      >
        {count}/{MAX_WORDS}
      </span>
    </div>
  );
}

// Mini pill chip — wraps gender (read-only) / age / region into a compact,
// single-line row instead of the old label-then-full-width-input stack
// (zadanie-profil-kompakt-emoji-2026-07-24).
// Skryté pole ostáva vo VLASTNOM profile plne editovateľné — len stlmené a s
// preškrtnutým okom, aby si na prvý pohľad videl, čo pack nevidí. Skrývanie sa
// deje až pri čítaní cudzím okom (PublicProfile), nie tu.
function HideWrap({ hidden, children }: { hidden: boolean; children: React.ReactNode }) {
  if (!hidden) return <>{children}</>;
  return (
    <span
      className="relative inline-flex items-center"
      title="Hidden from the pack — only you see this"
      style={{ opacity: 0.45 }}
    >
      {children}
      <EyeOff className="h-3 w-3" style={{ color: T.inkFaint, marginLeft: 3 }} />
    </span>
  );
}

// D3 — jedno oko na identity riadok. Klik otvorí zoznam skrývateľných polí
// (vek · národnosť · mesto). Zapisuje do human.visibility: 'private' = skryté,
// vymazanie kľúča = späť na default. Počet psov v zozname nie je zámerne.
function IdentityVisibilityEye({
  profile,
  patchHuman,
}: {
  profile: CentralProfile | null;
  patchHuman: (p: Partial<HumanProfile>) => void;
}) {
  const [open, setOpen] = useState(false);
  const hiddenKeys = HIDEABLE_IDENTITY_FIELDS.filter((f) => isHidden(profile, f.key));
  const anyHidden = hiddenKeys.length > 0;

  const toggle = (key: ProfileFieldKey) => {
    const current = { ...(profile?.human.visibility ?? {}) };
    if (current[key] === 'private') delete current[key];
    else current[key] = 'private';
    patchHuman({ visibility: current });
  };

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Who sees these details"
        aria-expanded={open}
        className="inline-flex items-center gap-1"
        style={{
          background: anyHidden ? 'rgba(201,154,63,0.10)' : T.bg,
          border: `1px solid ${anyHidden ? 'rgba(201,154,63,0.45)' : T.hairline}`,
          borderRadius: 999,
          padding: '4px 8px',
          color: anyHidden ? T.accentGold : T.inkFaint,
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        {anyHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {anyHidden && (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
            {hiddenKeys.length}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop — klik mimo zatvára. Native <select>-y v riadku by inak
              ostali pod otvoreným panelom nedostupné. */}
          <span
            className="fixed inset-0"
            style={{ zIndex: 40 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="absolute"
            style={{
              zIndex: 41,
              top: 'calc(100% + 6px)',
              right: 0,
              minWidth: 208,
              background: T.card,
              border: `1px solid ${T.hairline}`,
              borderRadius: 12,
              boxShadow: '0 14px 34px -12px rgba(20,8,40,0.35)',
              padding: 10,
              textAlign: 'left',
            }}
          >
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 9,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: T.inkFaint,
                display: 'block',
                marginBottom: 8,
              }}
            >
              Hide from the pack
            </span>
            {HIDEABLE_IDENTITY_FIELDS.map((f) => {
              const off = isHidden(profile, f.key);
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggle(f.key)}
                  className="flex items-center gap-2 w-full"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px 4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12.5,
                    color: off ? T.inkFaint : T.ink,
                  }}
                >
                  <span aria-hidden>{f.emoji}</span>
                  <span className="flex-1" style={{ textDecoration: off ? 'line-through' : 'none' }}>
                    {f.labelEN}
                  </span>
                  {off ? (
                    <EyeOff className="h-3.5 w-3.5" style={{ color: T.accentGold }} />
                  ) : (
                    <Eye className="h-3.5 w-3.5" style={{ color: T.inkFaint }} />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </span>
  );
}

function MiniChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1"
      style={{
        background: T.bg,
        border: `1px solid ${T.hairline}`,
        borderRadius: 999,
        padding: '4px 8px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11,
        color: T.ink,
      }}
    >
      {children}
    </span>
  );
}

// Editable variant — emoji prefix + borderless inline input inside a MiniChip.
function MiniChipInput({
  emoji,
  type = 'text',
  value,
  placeholder,
  width,
  onSave,
}: {
  emoji: string;
  type?: 'text' | 'number';
  value: string | number | undefined;
  placeholder?: string;
  width: number;
  onSave: (v: string) => void;
}) {
  const initial = value == null ? '' : String(value);
  const [local, setLocal] = useState(initial);
  useEffect(() => setLocal(initial), [initial]);
  return (
    <MiniChip>
      <span aria-hidden>{emoji}</span>
      <input
        type={type}
        min={type === 'number' ? 13 : undefined}
        max={type === 'number' ? 120 : undefined}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => { if (local !== initial) onSave(local); }}
        placeholder={placeholder}
        style={{
          width,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: 0,
          color: T.ink,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 11,
        }}
      />
    </MiniChip>
  );
}

// Nationality — flag + short-code pill dropdown (e.g. "🇸🇰 SVK", not the full
// country name — zadanie-profil-shrink-2026-07-24, was full labelEN). Native
// <select>, default 'SK'.
function NationalitySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: T.bg,
        border: `1px solid ${T.hairline}`,
        borderRadius: 999,
        padding: '4px 6px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11,
        color: T.ink,
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      {NATIONALITY_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.emoji} {opt.abbr ?? opt.labelEN}</option>
      ))}
    </select>
  );
}

// Status (relationship) — ONE pill dropdown instead of separate Single/Taken
// pills (zadanie-profil-shrink-2026-07-24). Empty value = placeholder/clear.
function StatusSelect({
  value,
  onChange,
}: {
  value: RelationshipStatus | undefined;
  onChange: (v: RelationshipStatus | undefined) => void;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? (e.target.value as RelationshipStatus) : undefined)}
      style={{
        background: T.bg,
        border: `1px solid ${T.hairline}`,
        borderRadius: 999,
        padding: '4px 8px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11,
        color: value ? T.ink : T.inkFaint,
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      <option value="">Status</option>
      {RELATIONSHIP_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.emoji} {opt.labelEN}</option>
      ))}
    </select>
  );
}

// Full-width text input with the same on-blur autosave pattern as WordLimitTextarea
// / MiniChipInput — used for Nickname. Compact sizing (zadanie-profil-shrink-2026-07-24)
// matches the Name input it now sits next to.
function AutoSaveTextInput({
  value,
  onSave,
  placeholder,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <input
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => { if (local !== value) onSave(local); }}
      placeholder={placeholder}
      style={{
        width: '100%',
        background: T.bg,
        border: `1px solid ${T.hairline}`,
        borderRadius: 8,
        padding: '8px 12px',
        color: T.ink,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 13,
        outline: 'none',
      }}
    />
  );
}

// "Show as: Name / Nickname" — 2-option segment, same visual language as
// VisibilityToggle (dark-fill selected pill inside a hairline pill track).
function DisplayAsToggle({
  value,
  onChange,
}: {
  value: 'name' | 'nickname';
  onChange: (v: 'name' | 'nickname') => void;
}) {
  const opts: Array<{ key: 'name' | 'nickname'; label: string }> = [
    { key: 'name', label: 'Name' },
    { key: 'nickname', label: 'Nickname' },
  ];
  return (
    <div className="inline-flex items-center" style={{ border: `1px solid ${T.hairline}`, borderRadius: 999, padding: 2, gap: 2 }}>
      {opts.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          style={{
            background: value === opt.key ? T.ink : 'transparent',
            color: value === opt.key ? T.card : T.inkFaint,
            border: 'none',
            borderRadius: 999,
            padding: '4px 11px',
            fontFamily: "'Cinzel', serif",
            fontSize: 9,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}


