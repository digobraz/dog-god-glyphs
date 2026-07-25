import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2, LogOut, Mail, BellOff, KeyRound, X } from 'lucide-react';
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
} from '@/components/pack/profile/packProfile';
import { DogGalleryAccordion, type DogGalleryEntry } from '@/components/pack/profile/DogGallery';

const T = PACK_THEME;

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
      setAvatarUrl(meta.avatar_url || meta.avatar || null);
      setFullName(meta.full_name || meta.name || '');
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
        {/* Identity — avatar + name merged */}
        <section
          style={{
            background: T.card,
            border: `1px solid ${T.hairline}`,
            borderRadius: 20,
            padding: 26,
            boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
          }}
        >
          {/* Zlúčené: LEFT = majiteľ (foto + meno + level) · RIGHT = My Gods (psy) */}
          <style>{`@media (min-width:768px){.profile-gods-right{border-top:none !important;padding-top:0 !important;border-left:1px solid ${T.hairline};padding-left:2rem;}}`}</style>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* ── LEFT — majiteľ ── */}
          <div>
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
          <div style={{ borderTop: `1px solid ${T.hairline}`, marginTop: 16, paddingTop: 16 }}>
            {/* Row 1: age · dogs · nationality · region.  Row 2: status +
                lifestyle (smoke/diet/work) — all optional, moved up next to age
                per Matej 2026-07-24 (was a separate block below the pills). */}
            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-1.5">
              <MiniChipInput
                emoji="🎂"
                type="number"
                value={human?.age}
                placeholder="Age"
                width={32}
                onSave={(v) => patchHuman({ age: v === '' ? undefined : Number(v) })}
              />
              <MiniChip>
                <span aria-hidden>🐶</span>
                <span style={{ color: dogs.length ? T.inkDim : T.inkFaint }}>
                  {dogs.length} {dogs.length === 1 ? 'dog' : 'dogs'}
                </span>
              </MiniChip>
              <NationalitySelect
                value={human?.nationality ?? 'SK'}
                onChange={(v) => patchHuman({ nationality: v })}
              />
              <MiniChipInput
                emoji="📍"
                value={human?.region ?? ''}
                placeholder="City"
                width={76}
                onSave={(v) => patchHuman({ region: v || undefined })}
              />
            </div>
            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-1.5" style={{ marginTop: 8 }}>
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
          </div>

          {/* Bio — ONE textarea (dog-voice), moved under the pills row (was in
              the RIGHT column) per zadanie-profil-layout-swap-2026-07-24. The
              separate "About me" textarea was folded away — dog-voice bio is
              the hero copy (zadanie-profil-koncentrat-2026-07-24 ČASŤ B.1). */}
          <div style={{ marginTop: 16 }}>
            {/* BIO heading — one bold, oversized line. It's the funny/unique hook
                of the profile, so it should pop (Matej 2026-07-24). */}
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, lineHeight: 1.2, color: T.ink, marginBottom: 10 }}>
              BIO: What my dog would probably say about me
            </div>
            <WordLimitTextarea
              value={human?.dogVoiceBio ?? ''}
              onSave={(v) => patchHuman({ dogVoiceBio: v })}
              placeholder="My human wakes up at 6 just to walk me. Slightly obsessed. Would recommend. — 🐾"
              rows={2}
            />
          </div>

          {/* Personality concentrate — 20 pills / 5 groups / shared max-10
              (zadanie-profil-koncentrat-2026-07-24 ČASŤ B.2). Replaces the old
              Topics/Vibe/Off-the-leash/Person-type pill groups. */}
          <div style={{ marginTop: 16 }}>
            <PersonalityConcentrate human={human} patchHuman={patchHuman} />
          </div>
          </div>

          {/* ── RIGHT — My Gods (psy) → Stats & Badges ── */}
          <div id="my-gods" className="profile-gods-right flex flex-col gap-5" style={{ borderTop: `1px solid ${T.hairline}`, paddingTop: 18, scrollMarginTop: 90 }}>
            <MyGodsContent dogs={dogs} loading={dogsLoading} profile={profile} />
          </div>
          </div>
        </section>

        {/* Bones + your network — split two-column block */}
        <PackNetwork />

        {/* Password block presunutý do Account info bloku → modal (pwModalOpen) */}

        {/* Account info (read-only) */}
        <section
          style={{
            background: T.card,
            border: `1px solid ${T.hairline}`,
            borderRadius: 20,
            padding: 22,
            boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
          }}
        >
          <Field icon={<Mail className="h-4 w-4" />} label="Email">
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
        </section>

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
              background: T.card,
              border: `1px solid ${T.hairline}`,
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 40px 90px -30px rgba(0,0,0,0.6)',
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

  // "Add a god" slot drží krok so škálou riadkov v DogGalleryAccordion (3+ psy = kompakt).
  const addBig = dogs.length < 3;

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
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-2.5" style={{ color: T.inkDim }}>
          <BrandIcon name="heartpaw" size={16} tint="gold" />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase' }}>
            My Gods
          </span>
        </div>
        {!loading && dogs.length > 0 && (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.inkFaint }}>
            {dogs.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-2" style={{ color: T.inkFaint }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>Loading your gods…</span>
        </div>
      ) : (
        <DogGalleryAccordion
          dogs={entries}
          editable
          onSaveBio={(dogId, bio) => saveDogAttrs(dogId, { bio: bio.slice(0, 200) })}
          onToggleTag={toggleTag}
          onSaveCard={saveCard}
          addSlot={
            <Link
              to="/entry"
              className="flex items-center"
              style={{ gap: addBig ? 16 : 12, padding: addBig ? '13px 14px' : '9px 12px', textDecoration: 'none', border: `1px dashed ${T.border}`, borderRadius: 14 }}
            >
              <span
                className="inline-flex items-center justify-center shrink-0"
                style={{ width: addBig ? 64 : 44, height: addBig ? 64 : 44, borderRadius: '50%', border: `2px dashed ${T.border}`, color: T.inkFaint, fontSize: addBig ? 26 : 20, lineHeight: 1 }}
              >
                +
              </span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: addBig ? 11 : 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.inkFaint }}>
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


