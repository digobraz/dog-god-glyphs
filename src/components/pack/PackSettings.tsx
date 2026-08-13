import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, X, Check } from 'lucide-react';
// `Loader2`, `X`, `Check` ostávajú lucide — systémové ovládače (spinner, zavrieť, potvrdiť).
import { HandExit, HandKey } from './HandIcons';
import { BrandIcon } from './BrandIcon';
import { supabase } from '@/integrations/supabase/client';
import { PACK_THEME, FONT_TITLE, FONT_UI, PILL_CSS } from './packTheme';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/i18n/LanguageContext';
import LanguagePicker from '@/components/LanguagePicker';

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
  const t = useT();

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
    if (pwValue.length < 8) { setPwError(t('pack.settings.errPwShort')); return; }
    if (pwValue !== pwConfirm) { setPwError(t('pack.settings.errPwMismatch')); return; }
    setPwSaving(true);
    try {
      const { error: upErr } = await supabase.auth.updateUser({ password: pwValue });
      if (upErr) throw new Error(upErr.message);
      setPwDone(true);
      setPwValue('');
      setPwConfirm('');
      setPwModalOpen(false);
      toast({ title: t('pack.settings.toastTitle'), description: t('pack.settings.toastDesc') });
    } catch (err) {
      setPwError(err instanceof Error ? err.message : t('pack.settings.errPwGeneric'));
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
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16,
        padding: 22,
        // fromWelcome && !pwDone = „nastav si heslo" upozornenie → širší zlatý ring
        // NAD lockovaným cardShadow (predtým to bol silnejší 1px border, ten už lock
        // zjednotil na 1.5px cardEdge, takže signál nesie ring).
        boxShadow: fromWelcome && !pwDone
          ? `${T.cardShadow}, 0 0 0 8px rgba(201,154,63,0.20)`
          : T.cardShadow,
      }}
    >
      <style>{PILL_CSS}</style>
      <div
        style={{
          fontFamily: FONT_TITLE,
          fontSize: 10,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: T.inkDim,
          marginBottom: 6,
        }}
      >
        {t('pack.settings.account')}
      </div>

      <Field icon={<BrandIcon name="envelope" size={16} tint="dim" />} label={t('pack.settings.email')}>
        <span style={{ fontFamily: FONT_UI, fontSize: 14, color: T.ink }}>
          {email}
        </span>
      </Field>
      <Field icon={<HandKey size={16} />} label={t('pack.settings.password')}>
        <button
          type="button"
          className="pf-tap"
          onClick={() => setPwModalOpen(true)}
          style={{
            background: 'none',
            // Sekundárne tlačidlo = zlatý rám matrice, nie šedý hairline. Hairline je
            // pre deliace čiary; na ohraničenie prvku pôsobí ako nedokončený návrh.
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: '6px 14px',
            fontFamily: FONT_TITLE,
            fontSize: 10,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: T.inkDim,
            cursor: 'pointer',
          }}
        >
          {t('pack.settings.setChange')}
        </button>
      </Field>
      <Field icon={<BrandIcon name="globe" size={16} tint="gold" />} label={t('pack.settings.language')}>
        <LanguagePicker variant="settings" />
      </Field>
      {/* Riadok „Upozornenia · UŽ ČOSKORO" zmazaný 13. 8. 2026 (audit D2, Matej:
          „Preč, kým to nefunguje"). Vráti sa aj s `Badge`, keď notifikácie reálne pôjdu —
          kľúče `pack.settings.notifications` / `comingSoon` sú v locale nechané. */}
      <Field icon={<HandExit size={16} />} label={t('pack.settings.signOut')} last>
        <button
          type="button"
          className="pf-tap"
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            background: 'none',
            // Sekundárne tlačidlo = zlatý rám matrice, nie šedý hairline. Hairline je
            // pre deliace čiary; na ohraničenie prvku pôsobí ako nedokončený návrh.
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: '6px 14px',
            fontFamily: FONT_TITLE,
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
          {t('pack.settings.signOut')}
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
              background: T.panelGrad,
              border: `1.5px solid ${T.cardEdge}`,
              borderRadius: 14,
              padding: 24,
              boxShadow: T.panelShadow,
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span style={{ fontFamily: FONT_TITLE, fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: T.inkDim }}>
                {t('pack.settings.password')}
              </span>
              <button
                type="button"
                onClick={() => setPwModalOpen(false)}
                aria-label={t('pack.settings.close')}
                className="inline-flex items-center justify-center"
                style={{ width: 30, height: 30, borderRadius: 999, background: T.tileBg, border: 'none', cursor: 'pointer', color: T.inkDim }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p style={{ fontFamily: FONT_UI, fontSize: 13, color: T.inkDim, margin: '0 0 16px' }}>
              {fromWelcome
                ? t('pack.settings.pwDescWelcome')
                : t('pack.settings.pwDesc')}
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="password"
                autoComplete="new-password"
                value={pwValue}
                onChange={(e) => { setPwValue(e.target.value); setPwDone(false); }}
                placeholder={t('pack.settings.pwNewPlaceholder')}
                /* Úroveň 4 MATRICE — to isté pole ako všade inde v /packu. Do 13. 8. tu
                   bol ručne písaný štýl (`T.bg` výplň, hairline rám, radius 10), takže
                   jediné dve textové polia v settings vyzerali inak než celý zvyšok appky. */
                className="pf-field pf-field--flat"
                style={{ width: '100%', borderRadius: 8, padding: '12px 14px', color: T.ink, fontFamily: FONT_UI, fontSize: 14, outline: 'none' }}
              />
              <input
                type="password"
                autoComplete="new-password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                placeholder={t('pack.settings.pwConfirmPlaceholder')}
                className="pf-field pf-field--flat"
                style={{ width: '100%', borderRadius: 8, padding: '12px 14px', color: T.ink, fontFamily: FONT_UI, fontSize: 14, outline: 'none' }}
              />
              {pwError && (
                <span style={{ fontFamily: FONT_UI, fontSize: 12, color: '#A04040' }}>{pwError}</span>
              )}
              <button
                type="button"
                onClick={handleSetPassword}
                disabled={pwSaving || pwValue.length === 0}
                className="inline-flex items-center justify-center gap-2"
                style={{ background: T.ink, color: T.card, border: 'none', padding: '12px 16px', borderRadius: 10, fontFamily: FONT_TITLE, fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', opacity: (pwSaving || pwValue.length === 0) ? 0.6 : 1 }}
              >
                {pwSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : pwDone ? <Check className="h-3 w-3" /> : null}
                {t('pack.settings.pwSubmit')}
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
        <span style={{ fontFamily: FONT_TITLE, fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

