import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, KeyRound, BellOff, LogOut, Loader2, X, Check } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { supabase } from '@/integrations/supabase/client';
import { PACK_THEME } from './packTheme';
import { useToast } from '@/hooks/use-toast';

const T = PACK_THEME;

// Account / settings — email, password (modal), language, notifications, sign out.
// Zdieľané: spodok homepage (/pack, LIVE) aj frozen profil (DEV_FULL).
export function PackSettings() {
  const [email, setEmail] = useState('—');
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwValue, setPwValue] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwDone, setPwDone] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? '—');
    });
  }, []);

  // Welcome deep-link (?welcome=1) invites password setup → auto-open the modal.
  const fromWelcome = searchParams.get('welcome') === '1';
  useEffect(() => {
    if (fromWelcome) setPwModalOpen(true);
  }, [fromWelcome]);

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

  return (
    <section
      id="pack-settings"
      style={{
        background: T.card,
        border: `1px solid ${fromWelcome && !pwDone ? 'rgba(201,154,63,0.55)' : T.hairline}`,
        borderRadius: 20,
        padding: 22,
        boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
      }}
    >
      <div
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 10,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: T.inkDim,
          marginBottom: 6,
        }}
      >
        Account
      </div>

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
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: T.ink }}>English</span>
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

      {/* Password modal */}
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
                {pwSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : pwDone ? <Check className="h-3 w-3" /> : null}
                Set password
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({ icon, label, children, last }: { icon: React.ReactNode; label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-3.5"
      style={{ borderBottom: last ? 'none' : `1px solid ${T.hairline}` }}
    >
      <div className="flex items-center gap-3" style={{ color: T.inkDim }}>
        {icon}
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span
      style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 9,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: T.inkDim,
        border: `1px solid ${T.hairline}`,
        padding: '5px 10px',
        borderRadius: 999,
      }}
    >
      {label}
    </span>
  );
}
