import { useEffect, useState } from 'react';
import { forgetPushToken } from '@/lib/appPush';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/i18n/LanguageContext';
import { useLang } from '@/i18n/LanguageContext';
import { PACK_THEME, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, VEIL_CSS, FONT_TITLE, FONT_UI } from './packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from './navGoldSkin';
import { BackButton } from './BackButton';

// ZMAZANIE ÚČTU — Apple 5.1.1(v) a GDPR čl. 17 (Matej 13. 10. 2026, voľba B).
// Žiadosť → 30 dní na rozmyslenie → `purge-accounts` zmaže prihlásenie a osobné údaje.
// OSTÁVA pes, heroglyf, poradové číslo a faktúra (migrácia 20261028_account_deletion.sql).
// Dve časti:
//   · `DeleteAccountButton` — riadok v nastaveniach + potvrdenie napísaním DELETE,
//   · `AccountDeletionGate` — kto sa počas lehoty prihlási, uvidí dátum a môže zmazanie zrušiť.

const T = PACK_THEME;
const SLOVO = 'DELETE';

function useTx() {
  const t = useT();
  return (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
}

function useDatum() {
  const { lang } = useLang();
  return (iso: string) => new Date(iso).toLocaleDateString(lang === 'sk' ? 'sk-SK' : lang === 'cs' ? 'cs-CZ' : 'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' });
}

const btnSecondary: React.CSSProperties = {
  background: 'none',
  border: `1px solid ${T.border}`,
  borderRadius: PACK_R.field,
  padding: `${PACK_SPACE.sm}px ${PACK_SPACE.lg}px`,
  fontFamily: FONT_UI,
  fontSize: PACK_TEXT.micro,
  letterSpacing: '0.26em',
  textTransform: 'uppercase',
  color: T.inkDim,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: PACK_SPACE.sm,
};

const btnLapis = (off: boolean): React.CSSProperties => ({
  width: '100%',
  background: LAPIS.grad,
  color: LAPIS.ink,
  border: 'none',
  borderRadius: PACK_R.field,
  padding: `${PACK_SPACE.md}px ${PACK_SPACE.lg}px`,
  fontFamily: FONT_TITLE,
  fontWeight: 700,
  fontSize: PACK_TEXT.label,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  boxShadow: LAPIS_BTN_SHADOW,
  cursor: off ? 'default' : 'pointer',
  opacity: off ? 0.5 : 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: PACK_SPACE.sm,
});

const textBody: React.CSSProperties = { fontFamily: FONT_UI, fontSize: PACK_TEXT.body, color: T.inkDim, margin: 0, lineHeight: 1.5 };

function Okno({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="pk-veil pk-veil--modal" onClick={onClose}>
      <style>{VEIL_CSS}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ ...PACK_BOX.panel, width: '100%', maxWidth: 420, padding: PACK_SPACE.xl, display: 'flex', flexDirection: 'column', gap: PACK_SPACE.lg }}
      >
        {children}
      </div>
    </div>
  );
}

/** Riadok v nastaveniach: tlačidlo + potvrdzovacie okno. */
export function DeleteAccountButton() {
  const tx = useTx();
  const datum = useDatum();
  const [open, setOpen] = useState(false);
  const [slovo, setSlovo] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const potvrd = async () => {
    if (busy || slovo.trim().toUpperCase() !== SLOVO) return;
    setBusy(true);
    setErr('');
    try {
      const { data, error } = await supabase.rpc('request_account_deletion' as never);
      if (error) throw error;
      const kedy = datum(String(data));
      try { sessionStorage.setItem('dogypt-deleted-on', kedy); } catch { /* súkromné okno */ }
      // Odhlásiť zo VŠETKÝCH zariadení — účet sa „zamkne“, návrat je len novým prihlásením.
      await forgetPushToken();
      await supabase.auth.signOut({ scope: 'global' });
      window.location.assign('/login?deleted=1');
    } catch {
      setErr(tx('pack.settings.deleteErr', 'Something went wrong. Try again in a moment.'));
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className="pf-tap" onClick={() => setOpen(true)} style={btnSecondary}>
        {tx('pack.settings.delete', 'Delete account')}
      </button>
      {open && (
        <Okno onClose={() => !busy && setOpen(false)}>
          <div className="flex items-center" style={{ gap: PACK_SPACE.md }}>
            <BackButton tone="pale" onClick={() => !busy && setOpen(false)} label={tx('pack.settings.close', 'Close')} />
            <span style={{ fontFamily: FONT_UI, fontSize: PACK_TEXT.micro, letterSpacing: '0.26em', textTransform: 'uppercase', color: T.inkDim }}>
              {tx('pack.settings.delete', 'Delete account')}
            </span>
          </div>
          <p style={textBody}>{tx('pack.settings.deleteGone', 'We will delete your login, e-mail, profile, messages and AINUBIS conversations.')}</p>
          <p style={textBody}>{tx('pack.settings.deleteStays2', 'Your dog stays on the wall with its heroglyph and number, and so do the entries about the dog (DOG ID answers, diary, will) — without your name. The invoice stays too — the law requires it.')}</p>
          <p style={{ ...textBody, color: T.ink }}>{tx('pack.settings.deleteGrace', 'You have 30 days to change your mind: just sign in again. After that it cannot be undone.')}</p>
          <label style={{ display: 'flex', flexDirection: 'column', gap: PACK_SPACE.sm }}>
            <span style={{ fontFamily: FONT_UI, fontSize: PACK_TEXT.label, color: T.inkDim }}>
              {tx('pack.settings.deleteType', 'Type DELETE to confirm')}
            </span>
            <input
              value={slovo}
              onChange={(e) => setSlovo(e.target.value)}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="pf-field pf-field--flat"
              style={{ width: '100%', borderRadius: PACK_R.field, padding: `${PACK_SPACE.md}px ${PACK_SPACE.lg}px`, color: T.ink, fontFamily: FONT_UI, fontSize: PACK_TEXT.body, outline: 'none' }}
            />
          </label>
          {err && <span style={{ fontFamily: FONT_UI, fontSize: PACK_TEXT.label, color: '#B25640' }}>{err}</span>}
          <button type="button" onClick={potvrd} disabled={busy || slovo.trim().toUpperCase() !== SLOVO}
            style={btnLapis(busy || slovo.trim().toUpperCase() !== SLOVO)}>
            {tx('pack.settings.deleteConfirm', 'Delete in 30 days')}
          </button>
        </Okno>
      )}
    </>
  );
}

/** Kto sa prihlási počas 30-dňovej lehoty, uvidí dátum a môže zmazanie zrušiť. */
export function AccountDeletionGate() {
  const tx = useTx();
  const datum = useDatum();
  const [kedy, setKedy] = useState<string | null>(null);
  // Zánik po odchode pawmata (K4c) sa zrušiť nedá — DB to odmietne, tak tlačidlo ani neukážeme.
  const [pawmate, setPawmate] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let zrusene = false;
    const over = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { if (!zrusene) setKedy(null); return; }
      const { data: rows } = await supabase
        .from('account_deletions' as never)
        .select('purge_after, reason')
        .is('cancelled_at', null)
        .is('purged_at', null)
        .limit(1);
      const r = (rows as { purge_after: string; reason: string | null }[] | null)?.[0];
      if (!zrusene) { setKedy(r?.purge_after ?? null); setPawmate(r?.reason === 'pawmate'); }
    };
    void over();
    const { data: sub } = supabase.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_IN' || ev === 'SIGNED_OUT') void over(); });
    return () => { zrusene = true; sub.subscription.unsubscribe(); };
  }, []);

  if (!kedy) return null;

  const zrus = async () => {
    setBusy(true);
    const { error } = await supabase.rpc('cancel_account_deletion' as never);
    if (!error) setKedy(null);
    setBusy(false);
  };
  const odhlas = async () => {
    setBusy(true);
    await forgetPushToken();
    await supabase.auth.signOut();
    window.location.assign('/login');
  };

  return (
    <Okno>
      <span style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: PACK_TEXT.h2, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.ink }}>
        {tx('pack.deletion.title', 'Your account is being deleted')}
      </span>
      <p style={textBody}>
        {tx('pack.deletion.when', 'It will be deleted on {date}.').replace('{date}', datum(kedy))}
      </p>
      {!pawmate && <>
        <p style={textBody}>{tx('pack.deletion.stay', 'Want to stay? Cancel the deletion and everything stays as it was.')}</p>
        <button type="button" onClick={zrus} disabled={busy} style={btnLapis(busy)}>
          {tx('pack.deletion.cancel', 'Keep my account')}
        </button>
      </>}
      <button type="button" onClick={odhlas} disabled={busy} style={{ ...btnSecondary, justifyContent: 'center' }}>
        {tx('pack.settings.signOut', 'Sign out')}
      </button>
    </Okno>
  );
}
