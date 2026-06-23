import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2, LogOut, Mail, BellOff, Check, KeyRound, X } from 'lucide-react';
import { BrandIcon } from '@/components/pack/BrandIcon';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PackNetwork } from '@/components/pack/PackNetwork';
import { DevotionPanel } from '@/components/pack/DevotionPanel';
import { usePackUser, type PackDogFull } from '@/hooks/usePackUser';
import { PACK_THEME } from '@/components/pack/packTheme';
import { uploadExtraPhoto } from '@/services/cloudinaryService';
import { useToast } from '@/hooks/use-toast';

const T = PACK_THEME;

export default function PackProfile() {
  const [session, setSession] = useState<Session | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [devotion, setDevotion] = useState(100);
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
  const { toast } = useToast();
  const { dogs, loading: dogsLoading } = usePackUser(session?.user?.id ?? null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      const meta = (data.session?.user.user_metadata ?? {}) as Record<string, string | undefined>;
      setAvatarUrl(meta.avatar_url || meta.avatar || null);
      setDevotion(Number(meta.devotion) || 100);
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
                width: 104,
                height: 104,
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
                    fontSize: 38,
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

            {/* Name + actions */}
            <div className="min-w-0 flex-1 w-full">
              <label
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 10,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  color: T.inkDim,
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                Your Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setNameDirty(true);
                }}
                placeholder="How should we call you?"
                style={{
                  width: '100%',
                  background: T.bg,
                  border: `1px solid ${T.hairline}`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  color: T.ink,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 13,
                    color: T.inkDim,
                  }}
                >
                  {hasAvatar ? 'Tap your photo to change it.' : 'Add a photo of yourself.'}
                </span>
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={!nameDirty || nameSaving}
                  className="inline-flex items-center gap-2 shrink-0"
                  style={{
                    background: nameDirty ? T.ink : 'transparent',
                    color: nameDirty ? T.card : T.inkFaint,
                    border: nameDirty ? 'none' : `1px solid ${T.hairline}`,
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontFamily: "'Cinzel', serif",
                    fontSize: 11,
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    cursor: nameDirty ? 'pointer' : 'default',
                    opacity: nameSaving ? 0.6 : 1,
                  }}
                >
                  {nameSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* level — pod foto+meno, v ľavej (majiteľ) časti */}
          <div style={{ borderTop: `1px solid ${T.hairline}`, marginTop: 18, paddingTop: 18 }}>
            <DevotionPanel devotion={devotion} />
          </div>
          </div>

          {/* ── RIGHT — My Gods (psy) ── */}
          <div className="profile-gods-right" style={{ borderTop: `1px solid ${T.hairline}`, paddingTop: 18 }}>
            <MyGodsContent dogs={dogs} loading={dogsLoading} />
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

// My Gods — riadok psov používateľa (+ „Add a god"). Inner obsah (bez karty),
// sedí v pravej časti zlúčeného Identity bloku.
function MyGodsContent({ dogs, loading }: { dogs: PackDogFull[]; loading: boolean }) {
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
        <div className="flex flex-wrap items-start gap-5">
          {dogs.map((d) => (
            <Link
              key={d.id}
              to={`/pack/dogs/${d.id}`}
              className="flex flex-col items-center gap-2 group"
              style={{ textDecoration: 'none', width: 84 }}
            >
              <span
                className="inline-flex items-center justify-center overflow-hidden"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: T.bg,
                  border: `2px solid ${T.accentGold}`,
                  boxShadow: '0 0 0 1px rgba(201,154,63,0.35), 0 6px 18px rgba(201,154,63,0.22)',
                }}
              >
                {d.cloudinary_main_url ? (
                  <img src={d.cloudinary_main_url} alt={d.dog_name ?? 'Dog'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: T.inkDim }}>
                    {(d.dog_name?.[0] || '?').toUpperCase()}
                  </span>
                )}
              </span>
              <span
                className="truncate w-full text-center"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, fontWeight: 600, color: T.ink }}
              >
                {d.dog_name || 'Unnamed'}
              </span>
            </Link>
          ))}

          {/* Add a god — priestor pre ďalších psov */}
          <Link
            to="/heroglyph"
            className="flex flex-col items-center gap-2"
            style={{ textDecoration: 'none', width: 84 }}
          >
            <span
              className="inline-flex items-center justify-center"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'transparent',
                border: `2px dashed ${T.border}`,
                color: T.inkFaint,
                fontSize: 30,
                lineHeight: 1,
              }}
            >
              +
            </span>
            <span
              className="w-full text-center"
              style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.inkFaint }}
            >
              Add a god
            </span>
          </Link>
        </div>
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
