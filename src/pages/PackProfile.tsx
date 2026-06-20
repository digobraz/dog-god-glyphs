import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Loader2, LogOut, Mail, BellOff, ShieldOff, Check } from 'lucide-react';
import { BrandIcon } from '@/components/pack/BrandIcon';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PackNetwork } from '@/components/pack/PackNetwork';
import { DevotionPanel } from '@/components/pack/DevotionPanel';
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

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
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
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

          {/* Devotion — level, progress, browseable badges */}
          <div style={{ borderTop: `1px solid ${T.hairline}`, marginTop: 22, paddingTop: 22 }}>
            <DevotionPanel devotion={devotion} />
          </div>
        </section>

        {/* Bones + your network — split two-column block */}
        <PackNetwork />

        {/* Password — set/change for email + password login (moved off /welcome) */}
        <section
          style={{
            background: T.card,
            border: `1px solid ${fromWelcome && !pwDone ? 'rgba(201,154,63,0.55)' : T.hairline}`,
            borderRadius: 20,
            padding: 22,
            boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
          }}
        >
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
            Password
          </label>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: T.inkDim, margin: '0 0 16px' }}>
            {fromWelcome
              ? 'Finish your account — set a password to log in any time without the email link.'
              : 'Set or change your password for email + password login.'}
          </p>
          <div className="flex flex-col gap-3" style={{ maxWidth: 360 }}>
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
              className="inline-flex items-center gap-2 self-start"
              style={{ background: T.ink, color: T.card, border: 'none', padding: '11px 16px', borderRadius: 10, fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', opacity: (pwSaving || pwValue.length === 0) ? 0.6 : 1 }}
            >
              {pwSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : pwDone ? <Check className="h-3 w-3" /> : null}
              {pwDone ? 'Saved' : 'Set password'}
            </button>
          </div>
        </section>

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
          <Field icon={<LogOut className="h-4 w-4" />} label="Sign out">
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
          <Field icon={<ShieldOff className="h-4 w-4" />} label="Delete account" last>
            <Badge label="Coming soon" danger />
          </Field>
        </section>

        <div style={{ height: 24 }} />
      </div>
    </PackLayout>
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
