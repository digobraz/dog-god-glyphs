import { DEVOTION_TODAY_ON } from '@/lib/devotion';
import { readHuman, patchHuman, notifOff, devotionTimes } from '@/lib/humanPrefs';
import { useEffect, useState } from 'react';
import { forgetPushToken } from '@/lib/appPush';
import { BackButton } from './BackButton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
// `Loader2`, `Check` ostávajú lucide — systémové ovládače (spinner, potvrdiť). Zavrieť je od 27. 9. 2026 šípka späť.
import { HandExit, HandKey, HandTrash } from './HandIcons';
import { DeleteAccountButton } from './AccountDeletion';
import { BrandIcon } from './BrandIcon';
import { supabase } from '@/integrations/supabase/client';
import { PACK_THEME, FONT_TITLE, FONT_UI, PILL_CSS, PF_FIELD_CSS } from './packTheme';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/i18n/LanguageContext';
import LanguagePicker from '@/components/LanguagePicker';
import { HandCheck } from '@/components/pack/HandIcons';

const T = PACK_THEME;

// Odkazový „tlačidlový" tvar riadkov Podmienky / Súkromie / Kontakt — ten istý rám ako ODHLÁSIŤ SA nižšie.
const LINK_BTN: React.CSSProperties = {
  background: 'none', border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 16px', fontFamily: FONT_UI,
  fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: T.inkDim, cursor: 'pointer',
};

// Account / settings — email, password (modal), language, notifications, sign out.
// Zdieľané: spodok homepage (/pack, LIVE) aj frozen profil (DEV_FULL).
/** `bare` = bez vlastnej karty a nadpisu — v UPRAVIŤ PROFIL sedí v podbloku ÚČET (23. 10. 2026),
 *  karta v karte by bola dvojitý rám. */
/** `after` = ďalšie riadky pod ODHLÁSIŤ SA v tom istom tvare (UPRAVIŤ PROFIL: PODPORA, 23. 10. 2026). */
export function PackSettings({ bare = false, after }: { bare?: boolean; after?: React.ReactNode } = {}) {
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
  /* Fallback pre kľúče, ktoré v niektorej mutácii ešte nie sú — `t()` vracia pri
     chýbajúcom preklade SAMOTNÝ KĽÚČ, čo by na obrazovke svietilo ako
     „pack.settings.skin". Zavedený vzor naprieč /pack. */
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? '—');
    });
  }, []);

  // ── NOTIFIKÁCIE (Matej 16. 9. 2026: „zapnúť vypnúť — budú zapnuté") ────────
  // Príznak žije v `pack_profiles.human.notifications_enabled` — v tom istom jsonb
  // ako meno svorky, žiadne nové miesto na údaje o človeku (lock Identita).
  // ⚠️ VÝCHODISKO JE ZAPNUTÉ a `null` (nikdy nenastavené) tiež znamená zapnuté,
  //    preto `!== false` a nie `=== true`. Tú istú vetu hovorí aj server
  //    (`notifications_enabled()` v 20260916_notify_optout.sql) — keby sa
  //    rozišli, prepínač by ukazoval iné než pošta naozaj robí.
  const [notifOn, setNotifOn] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);
  useEffect(() => {
    let zrusene = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id;
      if (!uid || zrusene) return;
      const { data: row } = await supabase
        .from('pack_profiles' as never)
        .select('human')
        .eq('user_id', uid)
        .maybeSingle();
      const human = ((row as { human?: Record<string, unknown> } | null)?.human ?? {});
      if (!zrusene) setNotifOn(human.notifications_enabled !== false);
    })();
    return () => { zrusene = true; };
  }, []);

  const prepniNotifikacie = async (next: boolean) => {
    if (notifSaving) return;
    const predtym = notifOn;
    setNotifOn(next);              // optimisticky — prepínač nesmie „zamrznúť" na sieti
    setNotifSaving(true);
    try {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id;
      if (!uid) throw new Error('no session');
      // Zapisuje sa CELÝ `human` s jednou zmenenou vlastnosťou — upsert samotného
      // objektu by prepísal meno svorky a prezývku.
      const { data: row } = await supabase
        .from('pack_profiles' as never)
        .select('human')
        .eq('user_id', uid)
        .maybeSingle();
      const human = { ...((row as { human?: Record<string, unknown> } | null)?.human ?? {}), notifications_enabled: next };
      const { error } = await supabase
        .from('pack_profiles' as never)
        .upsert({ user_id: uid, human } as never, { onConflict: 'user_id' });
      if (error) throw error;
    } catch {
      setNotifOn(predtym);         // vrátiť späť: tichý neúspech by klamal o stave pošty
      toast({ title: tx('pack.settings.notifErr', 'Could not save'), description: tx('pack.settings.notifErrDesc', 'Try again in a moment.') });
    } finally {
      setNotifSaving(false);
    }
  };

  // Večerná pripomienka — čas a vypnutie v `pack_profiles.human` (lib/humanPrefs.ts).
  const [remOn, setRemOn] = useState(true);
  const [remTime, setRemTime] = useState<[string, string]>(['15:00', '19:00']);
  useEffect(() => {
    void readHuman().then(({ human }) => {
      setRemOn(!notifOff(human).includes('devotion_evening'));
      setRemTime(devotionTimes(human));
    });
  }, []);
  const ulozPripomienku = async (on: boolean, time: [string, string]) => {
    const predtym = { on: remOn, time: remTime };
    setRemOn(on); setRemTime(time);
    try {
      const { human } = await readHuman();
      const off = notifOff(human).filter((x) => x !== 'devotion_evening');
      await patchHuman({ devotion_times: time, notif_off: on ? off : [...off, 'devotion_evening'] });
    } catch {
      setRemOn(predtym.on); setRemTime(predtym.time);
      toast({ title: tx('pack.settings.notifErr', 'Could not save'), description: tx('pack.settings.notifErrDesc', 'Try again in a moment.') });
    }
  };

  // Upozornenia AINUBISa (31. 10. 2026) — druh `notif_ainubis` v `human.notif_off`; logiku pushu robí agent F,
  // tu je len prepínač. Predvolene zapnuté (kľúč v `notif_off` = vypnuté).
  const [ainOn, setAinOn] = useState(true);
  useEffect(() => {
    void readHuman().then(({ human }) => setAinOn(!notifOff(human).includes('notif_ainubis')));
  }, []);
  const ulozAinubis = async (on: boolean) => {
    const predtym = ainOn;
    setAinOn(on);
    try {
      const { human } = await readHuman();
      const off = notifOff(human).filter((x) => x !== 'notif_ainubis');
      await patchHuman({ notif_off: on ? off : [...off, 'notif_ainubis'] });
    } catch {
      setAinOn(predtym);
      toast({ title: tx('pack.settings.notifErr', 'Could not save'), description: tx('pack.settings.notifErrDesc', 'Try again in a moment.') });
    }
  };

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
      await forgetPushToken();
      await supabase.auth.signOut();
      navigate('/login');
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <section
      id="pack-settings"
      style={bare ? undefined : {
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
      {/* Prepínač šatu stojí na `.pf-toggle` — jeho recept žije v `PF_FIELD_CSS`. */}
      <style>{PF_FIELD_CSS}</style>
      {!bare && <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 10,
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          color: T.inkDim,
          marginBottom: 6,
        }}
      >
        {t('pack.settings.account')}
      </div>}

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
            padding: '8px 16px',
            fontFamily: FONT_UI,
            fontSize: 10,
            letterSpacing: '0.26em',
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
      {/* ŠAT Tmavý/Papyrus (11. 9. 2026) tu bol prepínač, ktorý nič nerobil (audit appky 30. 10. 2026, E9) — skrytý.
          `usePackSkin`/`setPackSkin` ostávajú v `packSkin.ts`; vráti sa spolu s tmavým šatom. */}
      {/* Riadok „Upozornenia" bol 13. 8. 2026 zmazaný ako „UŽ ČOSKORO" (audit D2,
          Matej: „Preč, kým to nefunguje"). 16. 9. 2026 sa VRÁTIL, lebo už funguje:
          príznak číta odosielač (`pending_message_notifications()`), nie len obrazovka.
          Tvar prepínača je ten istý `.pf-toggle` ako šat vyššie — nie tretí vlastný. */}
      {/* Ikonka je `chat`, nie `envelope`: obálku už nesie riadok E-MAIL o kúsok vyššie
          a dve rovnaké ikonky v jednom paneli hovoria, že ide o to isté. Notifikácie
          sú dnes výhradne o SPRÁVACH vo svorke. Zvonček v hand-drawn kite nie je. */}
      <Field icon={<BrandIcon name="chat" size={16} tint="gold" />} label={t('pack.settings.notifications')}>
        <div className="pf-toggle">
          {([
            { key: true, label: tx('pack.settings.notifOn', 'On') },
            { key: false, label: tx('pack.settings.notifOff', 'Off') },
          ]).map((opt) => (
            <button
              key={String(opt.key)}
              type="button"
              onClick={() => prepniNotifikacie(opt.key)}
              aria-pressed={notifOn === opt.key}
              disabled={notifSaving}
              className={`pf-toggle__opt${notifOn === opt.key ? ' is-on' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>
      {/* VEČERNÁ PRIPOMIENKA ODDANOSTI (23. 10. 2026) — prvý druh s vlastným prepínačom z registra
          `lib/notifRegister.ts`. Žije v `human.notif_off` + `human.devotion_times` (2× denne); ten istý
          prepínač je aj v paneli „Dnešok". Pod hlavným vypínačom: keď je pošta vypnutá, nechodí nič. */}
      {notifOn && DEVOTION_TODAY_ON && (
        <Field icon={<BrandIcon name="sun" size={16} tint="gold" />} label={tx('pack.dvtoday.reminder', 'Evening reminder')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {[0, 1].map((i) => (
              <input key={i} type="time" step={900} value={remTime[i]} disabled={!remOn} className="pf-field"
                aria-label={tx('pack.dvtoday.remWhen', 'Every day at')}
                style={{ width: 'auto', opacity: remOn ? 1 : 0.4 }}
                onChange={(e) => {
                  if (!/^\d{2}:\d{2}$/.test(e.target.value)) return;
                  const next: [string, string] = [remTime[0], remTime[1]]; next[i] = e.target.value; void ulozPripomienku(remOn, next);
                }} />
            ))}
            <div className="pf-toggle">
              {([
                { key: true, label: tx('pack.settings.notifOn', 'On') },
                { key: false, label: tx('pack.settings.notifOff', 'Off') },
              ]).map((opt) => (
                <button key={String(opt.key)} type="button" onClick={() => void ulozPripomienku(opt.key, remTime)}
                  aria-pressed={remOn === opt.key} className={`pf-toggle__opt${remOn === opt.key ? ' is-on' : ''}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </Field>
      )}
      {notifOn && (
        <Field icon={<BrandIcon name="ankh" size={16} tint="gold" />} label={tx('pack.settings.notifAinubis', 'AINUBIS notifications')}>
          <div className="pf-toggle">
            {([
              { key: true, label: tx('pack.settings.notifOn', 'On') },
              { key: false, label: tx('pack.settings.notifOff', 'Off') },
            ]).map((opt) => (
              <button key={String(opt.key)} type="button" onClick={() => void ulozAinubis(opt.key)}
                aria-pressed={ainOn === opt.key} className={`pf-toggle__opt${ainOn === opt.key ? ' is-on' : ''}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </Field>
      )}
      {/* PRÁVNE + KONTAKT (Apple 5.1.1, 31. 10. 2026): /terms a /privacy ostávajú v appke (APP_PATHS), mailto otvorí poštu. */}
      <Field icon={<BrandIcon name="document" size={16} tint="gold" />} label={tx('pack.settings.terms', 'Terms')}>
        <button type="button" className="pf-tap" onClick={() => navigate('/terms')} style={LINK_BTN}>{tx('pack.settings.open', 'Open')}</button>
      </Field>
      <Field icon={<BrandIcon name="lock" size={16} tint="gold" />} label={tx('pack.settings.privacy', 'Privacy')}>
        <button type="button" className="pf-tap" onClick={() => navigate('/privacy')} style={LINK_BTN}>{tx('pack.settings.open', 'Open')}</button>
      </Field>
      <Field icon={<BrandIcon name="envelope" size={16} tint="gold" />} label={tx('pack.settings.contact', 'Contact')}>
        <a href="mailto:woof@dogypt.com" style={{ ...LINK_BTN, textDecoration: 'none', display: 'inline-block' }}>woof@dogypt.com</a>
      </Field>
      <Field icon={<HandTrash size={16} />} label={tx('pack.settings.deleteRow', 'Deletion')}>
        {/* Zmazanie účtu — Apple 5.1.1(v), GDPR (13. 10. 2026). 30 dní na rozmyslenie, pes ostáva. */}
        <DeleteAccountButton />
      </Field>
      <Field icon={<HandExit size={16} />} label={t('pack.settings.signOut')} last={!after}>
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
            padding: '8px 16px',
            fontFamily: FONT_UI,
            fontSize: 10,
            letterSpacing: '0.26em',
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
      {after}

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
            <div className="flex items-center" style={{ gap: 12, marginBottom: 6 }}>
              {/* × → šípka späť vľavo (Matej 27. 9. 2026: „dávajme všade len šípky, nie krížiky"). */}
              <BackButton tone="pale" onClick={() => setPwModalOpen(false)} label={t('pack.settings.close')} />
              <span style={{ fontFamily: FONT_TITLE, fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: T.inkDim }}>
                {t('pack.settings.password')}
              </span>
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
                style={{ width: '100%', borderRadius: 8, padding: '12px 16px', color: T.ink, fontFamily: FONT_UI, fontSize: 14, outline: 'none' }}
              />
              <input
                type="password"
                autoComplete="new-password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                placeholder={t('pack.settings.pwConfirmPlaceholder')}
                className="pf-field pf-field--flat"
                style={{ width: '100%', borderRadius: 8, padding: '12px 16px', color: T.ink, fontFamily: FONT_UI, fontSize: 14, outline: 'none' }}
              />
              {pwError && (
                <span style={{ fontFamily: FONT_UI, fontSize: 12, color: '#A04040' }}>{pwError}</span>
              )}
              <button
                type="button"
                onClick={handleSetPassword}
                disabled={pwSaving || pwValue.length === 0}
                className="inline-flex items-center justify-center gap-2"
                style={{ background: T.ink, color: T.card, border: 'none', padding: '12px 16px', borderRadius: 10, fontFamily: FONT_TITLE, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', opacity: (pwSaving || pwValue.length === 0) ? 0.6 : 1 }}
              >
                {pwSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : pwDone ? <HandCheck size={12} /> : null}
                {t('pack.settings.pwSubmit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function Field({ icon, label, children, last }: { icon: React.ReactNode; label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-3.5"
      style={{ borderBottom: last ? 'none' : `1px solid ${T.hairline}` }}
    >
      <div className="flex items-center gap-3" style={{ color: T.inkDim }}>
        {icon}
        <span style={{ fontFamily: FONT_UI, fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

