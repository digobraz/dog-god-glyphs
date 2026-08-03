/**
 * /admin — read-only v0 (issue #10), redesigned "Mission Control".
 *
 * Iba na čítanie. Žiadne edit/delete/mutácie. Prístup gated na admin e-mail
 * cez existujúcu Supabase magic-link session + RLS policy "Admin read all"
 * (gated na auth.jwt()->>'email'); bez admin e-mailu Postgres aj tak nevráti
 * cudzie riadky, takže UI gate je len UX vrstva nad DB-level ochranou.
 *
 * Taby: Orders · Dogs · Photos · Council · Vision · Bugs.
 */
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AinubisPanel from '@/components/admin/AinubisPanel';
import iconDogLover from '@/assets/icons/council-doglover.svg';
import iconDeveloper from '@/assets/icons/council-developer.svg';
import iconDogPro from '@/assets/icons/council-dogpro.svg';
import iconCreator from '@/assets/icons/council-creator.svg';
import iconMedia from '@/assets/icons/council-media.svg';
import iconInvestor from '@/assets/icons/council-investor.svg';
import iconCommunity from '@/assets/icons/council-community.svg';
import iconBusiness from '@/assets/icons/council-business.svg';

// Admin e-maily — kto sa smie prihlásiť. Drží sa to v synchronizácii s RLS
// policy "Admin read all" v Supabase (gated na rovnaký e-mail). Pridať admina
// = doplniť sem AJ do policy.
const ADMIN_EMAILS = ['hekthorsk@gmail.com'];

type AuthState = 'loading' | 'anon' | 'denied' | 'ok';

interface Dog {
  id: string;
  user_id: string | null;
  created_at: string;
  dog_name: string | null;
  owner_name: string | null;
  email: string | null;
  amount: number | null;
  country: string | null;
  payment_status: string | null;
  stripe_session_id: string | null;
  cloudinary_main_url: string | null;
  cloudinary_extras: string[] | null;
  heroglyph_code: string | null;
  breed: string | null;
  birth_year: number | null;
  grid_message: string | null;
  is_tester: boolean | null;
  referred_by_code: string | null;
  pdf_cert_url: string | null;
}
interface Contact {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  role: string | null;
  message: string | null;
}
interface PackMember {
  id: string;
  created_at: string;
  dog_name: string | null;
  email: string | null;
  pack_number: number | null;
}
interface VisionVote {
  user_id: string;
  vision_key: string;
  vote: string;
  voted_at: string;
}

const VISION_LABELS: Record<string, string> = {
  dogyptland: 'Dogyptland', longevity: 'Longevity', shelters: 'Shelters',
  map: 'Living Map', collar: 'Heroglyph Collar', firstaid: 'First Aid',
};

// Exportované — AinubisPanel (nový tab AINUBIS) sa drží rovnakého dizajnového
// jazyka namiesto vymýšľania vlastného.
export const GOLD = '#C99A3F';
export const GOLD_LIGHT = '#F5C73D';
const GOAL = 1_000_000;
const SEAL = '/images/peciat-dogypt.png';
export const CINZEL = "'Cinzel', serif";
export const GROTESK = "'Space Grotesk', sans-serif";
const PAPYRUS = 'linear-gradient(165deg,#FFFBF2 0%,#F4E8CC 52%,#E7D8B8 100%)';
export const INK = '#1F1A0E';

// Nahlásenie obsahu alebo člena (#54). Riešenie beží mimo appky (mail + rozhovor),
// tu je len fronta a označenie „vybavené" — zmazať obsah cudzieho člena z admin
// tabuľky by bola iná featura a iné rozhodnutie.
interface PackReport {
  id: string;
  created_at: string;
  target_kind: string;
  target_ref: string;
  target_user_id: string | null;
  reporter_id: string;
  reason: string;
  note: string | null;
  status: string;
  handled_at: string | null;
}

type Tab = 'orders' | 'dogs' | 'photos' | 'emails' | 'bugs' | 'vision' | 'reports' | 'ainubis';

// role id → council ikona (mapovanie podľa CouncilSection prihlášky)
const ROLE_ICONS: Record<string, string> = {
  'dog-lover': iconDogLover,
  developer: iconDeveloper,
  'dog-pro': iconDogPro,
  creator: iconCreator,
  media: iconMedia,
  investor: iconInvestor,
  community: iconCommunity,
  business: iconBusiness,
};
const ROLE_LABELS: Record<string, string> = {
  'dog-lover': 'Dog lover',
  developer: 'Developer',
  'dog-pro': 'Dog pro',
  creator: 'Creator',
  media: 'Media',
  investor: 'Investor',
  community: 'Community',
  business: 'Business',
};

// dogs.amount je už v EURÁCH (stripe-webhook delí amount_total/100 pri zápise). null = tester / nezaplatené.
const fmtAmount = (a: number | null) =>
  a == null ? '—' : `€${a.toFixed(2)}`;
export const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleString('sk-SK', { dateStyle: 'short', timeStyle: 'short' }) : '—';
export const short = (s: string | null, n = 14) =>
  !s ? '—' : s.length > n ? s.slice(0, n) + '…' : s;

export const MONO = "'Space Grotesk', ui-monospace, monospace";

export default function Admin() {
  const [auth, setAuth] = useState<AuthState>('loading');
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('orders');
  // Deep link `/admin?ainubis=<conversation_id>` — edge fn ho posiela do konzília
  // aj na Telegram, takže musí otvoriť tab AINUBIS rovno na danom vlákne.
  const [searchParams] = useSearchParams();
  const ainubisDeepLinkId = searchParams.get('ainubis');
  useEffect(() => {
    if (ainubisDeepLinkId) setTab('ainubis');
  }, [ainubisDeepLinkId]);

  // login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSent, setLoginSent] = useState(false);
  const [loginErr, setLoginErr] = useState('');

  // data
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [packMembers, setPackMembers] = useState<PackMember[]>([]);
  const [visionVotes, setVisionVotes] = useState<VisionVote[]>([]);
  const [reports, setReports] = useState<PackReport[]>([]);
  const [dataErr, setDataErr] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  const resolveSession = useCallback((email: string | null | undefined) => {
    const e = (email ?? '').toLowerCase();
    setSessionEmail(email ?? null);
    if (!e) return setAuth('anon');
    setAuth(ADMIN_EMAILS.includes(e) ? 'ok' : 'denied');
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) resolveSession(data.session?.user?.email);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!cancelled) resolveSession(session?.user?.email);
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, [resolveSession]);

  useEffect(() => {
    if (auth !== 'ok') return;
    let cancelled = false;
    setLoadingData(true);
    setDataErr('');
    (async () => {
      const [d, c, p, v, r] = await Promise.all([
        supabase.from('dogs').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('pack_members').select('*').order('created_at', { ascending: false }),
        supabase.from('vision_votes').select('*').order('voted_at', { ascending: false }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generované typy poznajú
        // len `pack_members`, celý /pack ide cez `as any` (viď packStore.ts)
        (supabase as any).from('pack_reports').select('*').order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;
      const err = d.error || c.error || p.error || v.error;
      if (err) setDataErr(err.message);
      setDogs((d.data as Dog[]) ?? []);
      setContacts((c.data as Contact[]) ?? []);
      setPackMembers((p.data as PackMember[]) ?? []);
      setVisionVotes((v.data as VisionVote[]) ?? []);
      // Nahlásenia sa načítavajú zvlášť a ticho: keď migrácia ešte nie je na tomto
      // projekte, nesmie to zhodiť celý admin (ostatné tabuľky s tým nemajú nič spoločné).
      setReports((r.data as PackReport[]) ?? []);
      setLoadingData(false);
    })();
    return () => { cancelled = true; };
  }, [auth]);

  const sendMagicLink = async () => {
    setLoginErr('');
    const email = loginEmail.trim().toLowerCase();
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    if (error) setLoginErr(error.message);
    else setLoginSent(true);
  };

  const logout = async () => { await supabase.auth.signOut(); resolveSession(null); };

  // ── shell ────────────────────────────────────────────────────────────────
  const shell = (children: React.ReactNode) => (
    <div style={{ minHeight: '100vh', background: '#000', color: 'rgba(250,244,236,0.92)', fontFamily: GROTESK }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 18px 80px' }}>
        <header style={{ marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img src={SEAL} alt="DOGYPT seal" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(201,154,63,0.35))' }} />
              <div>
                <h1 style={{ fontFamily: CINZEL, fontWeight: 700, color: GOLD, fontSize: 26, letterSpacing: '0.05em', margin: 0, lineHeight: 1 }}>
                  DOGYPT
                </h1>
                <div style={{ fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', opacity: 0.5, marginTop: 4 }}>
                  Mission Control
                </div>
              </div>
            </div>
            {auth === 'ok' && (
              <button onClick={logout}
                style={{ background: 'none', border: `1px solid ${GOLD}66`, color: GOLD, borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: GROTESK, letterSpacing: '0.02em' }}>
                {sessionEmail} · log out
              </button>
            )}
          </div>
          <div style={{ height: 2, marginTop: 18, borderRadius: 2, background: 'var(--brand-gradient)', opacity: 0.85 }} />
        </header>
        {children}
      </div>
    </div>
  );

  if (auth === 'loading') return shell(
    <p style={{ opacity: 0.6, fontSize: 14, letterSpacing: '0.06em' }}>Loading…</p>
  );

  if (auth === 'denied') return shell(
    <div style={{ marginTop: 48, maxWidth: 420 }}>
      <h2 style={{ fontFamily: CINZEL, color: '#e0a3a3', fontSize: 20, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
        Access denied
      </h2>
      <p style={{ opacity: 0.6, fontSize: 13, marginTop: 10 }}>
        Logged in as <b style={{ color: GOLD }}>{sessionEmail}</b> — not an admin account.
      </p>
      <button onClick={logout} style={brandBtn}>Log out</button>
    </div>
  );

  if (auth === 'anon') return shell(
    <div style={{ marginTop: 56, maxWidth: 400 }}>
      <h2 style={{ fontFamily: CINZEL, color: GOLD, fontSize: 22, letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
        Admin sign-in
      </h2>
      <p style={{ opacity: 0.62, fontSize: 13, marginTop: 8, marginBottom: 18 }}>
        Magic link — sent to your inbox.
      </p>
      {loginSent ? (
        <div style={{ background: 'rgba(201,154,63,0.08)', border: `1px solid ${GOLD}44`, borderRadius: 10, padding: '16px 18px' }}>
          <p style={{ color: GOLD, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            Check <b>{loginEmail}</b> — a sign-in link is on its way. Open it on this device.
          </p>
        </div>
      ) : (
        <>
          <input
            type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="admin@email" autoComplete="email"
            onKeyDown={(e) => e.key === 'Enter' && sendMagicLink()}
            style={{ width: '100%', background: '#0e0e0e', border: '1px solid rgba(201,154,63,0.3)', color: '#fff', borderRadius: 10, padding: '12px 14px', fontSize: 16, fontFamily: GROTESK, boxSizing: 'border-box' }}
          />
          <button onClick={sendMagicLink} style={{ ...brandBtn, marginTop: 12, width: '100%' }}>
            Send magic link
          </button>
          {loginErr && <p style={{ color: '#e0a3a3', fontSize: 12, marginTop: 8 }}>{loginErr}</p>}
        </>
      )}
    </div>
  );

  // ── authorized ─────────────────────────────────────────────────────────────
  const paid = dogs.filter((d) => d.payment_status === 'paid' && !d.is_tester);
  const testers = dogs.filter((d) => d.is_tester);
  const progressPct = Math.min(100, (paid.length / GOAL) * 100);

  const kpis: { label: string; value: number }[] = [
    { label: 'Dogyptians', value: paid.length },
    { label: 'Council', value: contacts.length },
    { label: 'Pack', value: packMembers.length },
    { label: 'Testers', value: testers.length },
  ];

  // Nevybavené nahlásenia patria do očí hneď, nie až po kliknutí na tab.
  const openReports = reports.filter((r) => r.status === 'new').length;

  const markReportHandled = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- viď načítanie vyššie
    const { error } = await (supabase as any).from('pack_reports')
      .update({ status: 'handled', handled_at: new Date().toISOString() }).eq('id', id);
    if (error) { setDataErr(error.message); return; }
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'handled', handled_at: new Date().toISOString() } : r)));
  };

  const tabs: [Tab, string][] = [
    ['orders', 'Orders'], ['dogs', 'Dogs'], ['photos', 'Photos'], ['emails', 'Council'], ['vision', 'Vision'], ['bugs', 'Bugs'],
    ['reports', openReports > 0 ? `Reports (${openReports})` : 'Reports'], ['ainubis', 'Ainubis'],
  ];

  // user_id → owner label (from dogs) for the vision-votes list.
  const ownerByUser = new Map<string, string>();
  dogs.forEach((d) => { if (d.user_id) ownerByUser.set(d.user_id, d.owner_name || d.email || d.dog_name || ''); });
  const visionTally = Object.keys(VISION_LABELS).map((k) => {
    const want = visionVotes.filter((v) => v.vision_key === k && v.vote === 'want').length;
    const no = visionVotes.filter((v) => v.vision_key === k && v.vote === 'no').length;
    return { k, want, no };
  });

  return shell(
    <>
      {/* KPI hero */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
        {kpis.map((k) => (
          <div key={k.label} style={kpiCard}>
            <div style={kpiValue}>{k.value.toLocaleString('en-US')}</div>
            <div style={kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Progress toward 1,000,000 */}
      <div style={{ ...kpiCard, width: '100%', boxSizing: 'border-box', marginBottom: 24, display: 'block' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={kpiLabel}>Toward 1,000,000 Dogyptians</div>
          <div style={{ fontFamily: GROTESK, fontSize: 13, color: 'rgba(250,244,236,0.6)' }}>
            <span style={{ color: GOLD_LIGHT, fontWeight: 600 }}>{paid.length.toLocaleString('en-US')}</span>
            {' / '}{GOAL.toLocaleString('en-US')}
            <span style={{ marginLeft: 10, color: GOLD }}>{progressPct.toFixed(progressPct < 1 ? 4 : 2)}%</span>
          </div>
        </div>
        <div style={{ marginTop: 12, height: 10, borderRadius: 999, background: 'rgba(250,244,236,0.06)', overflow: 'hidden', border: '1px solid rgba(201,154,63,0.18)' }}>
          <div style={{ height: '100%', width: `${Math.max(progressPct, 0.6)}%`, borderRadius: 999, background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`, boxShadow: '0 0 12px rgba(245,199,61,0.5)' }} />
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(201,154,63,0.18)', marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '9px 16px', fontSize: 13,
              fontFamily: CINZEL, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: tab === id ? GOLD : 'rgba(250,244,236,0.5)',
              borderBottom: tab === id ? `2px solid ${GOLD}` : '2px solid transparent', marginBottom: -1, fontWeight: tab === id ? 700 : 500,
            }}>
            {label}
          </button>
        ))}
      </div>

      {dataErr && <p style={{ color: '#e0a3a3', fontSize: 13, marginBottom: 12 }}>DB error: {dataErr}</p>}
      {loadingData && <p style={{ opacity: 0.6 }}>Loading data…</p>}

      {!loadingData && tab === 'orders' && (
        <DataTable
          cols={['Date', 'Dog', 'Owner', 'Email', 'Amount', 'Status', 'Country', 'Tester', 'Ref', 'Stripe']}
          rows={dogs.map((d) => [
            fmtDate(d.created_at), d.dog_name ?? '—', d.owner_name ?? '—', d.email ?? '—',
            fmtAmount(d.amount),
            <Pill key="s" ok={d.payment_status === 'paid'}>{d.payment_status ?? '—'}</Pill>,
            d.country ?? '—', d.is_tester ? '✓' : '',
            <span key="r" style={{ fontFamily: MONO }}>{d.referred_by_code ?? '—'}</span>,
            <span key="st" style={{ fontFamily: MONO, opacity: 0.7 }}>{short(d.stripe_session_id, 12)}</span>,
          ])}
        />
      )}

      {!loadingData && tab === 'dogs' && (
        <DataTable
          cols={['Date', 'Dog', 'Breed', 'Year', 'Heroglyph code', 'Country', 'Grid message', 'Cert PDF']}
          rows={dogs.map((d) => [
            fmtDate(d.created_at), d.dog_name ?? '—', d.breed ?? '—', d.birth_year ?? '—',
            <code key="h" style={{ fontSize: 11, color: GOLD, fontFamily: MONO }}>{d.heroglyph_code ?? '—'}</code>,
            d.country ?? '—', short(d.grid_message, 30),
            d.pdf_cert_url ? <a key="p" href={d.pdf_cert_url} target="_blank" rel="noreferrer" style={{ color: GOLD }}>PDF</a> : '—',
          ])}
        />
      )}

      {!loadingData && tab === 'photos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {dogs.filter((d) => d.cloudinary_main_url).map((d) => (
            <a key={d.id} href={d.cloudinary_main_url!} target="_blank" rel="noreferrer"
              style={{ display: 'block', border: '1px solid rgba(201,154,63,0.2)', borderRadius: 10, overflow: 'hidden', background: '#0e0e0e' }}>
              <img src={d.cloudinary_main_url!} alt={d.dog_name ?? ''} loading="lazy"
                style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '7px 9px', fontSize: 12 }}>
                {d.dog_name ?? '—'}
                {d.cloudinary_extras?.length ? <span style={{ opacity: 0.5 }}> +{d.cloudinary_extras.length}</span> : null}
              </div>
            </a>
          ))}
          {dogs.filter((d) => d.cloudinary_main_url).length === 0 && <p style={{ opacity: 0.6 }}>No photos yet.</p>}
        </div>
      )}

      {!loadingData && tab === 'emails' && (
        contacts.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No council applications yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {contacts.map((c) => {
              const roleKey = (c.role ?? '').toLowerCase();
              const icon = ROLE_ICONS[roleKey];
              const roleLabel = ROLE_LABELS[roleKey] ?? c.role ?? '—';
              return (
                <div key={c.id} style={councilCard}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {icon && (
                      <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 10, background: 'rgba(31,26,14,0.06)', border: `1px solid ${INK}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={icon} alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} />
                      </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontFamily: CINZEL, fontWeight: 700, color: INK, fontSize: 16, lineHeight: 1.2 }}>
                        {c.name ?? '—'}
                      </div>
                      {c.email ? (
                        <a href={`mailto:${c.email}`} style={{ color: '#8a6d1f', fontSize: 13, textDecoration: 'underline', wordBreak: 'break-all' }}>
                          {c.email}
                        </a>
                      ) : (
                        <span style={{ color: INK, opacity: 0.5, fontSize: 13 }}>—</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    <span style={councilBadge}>{roleLabel}</span>
                    <span style={{ color: INK, opacity: 0.45, fontSize: 12 }}>{fmtDate(c.created_at)}</span>
                  </div>
                  <p style={{ color: INK, opacity: 0.82, fontSize: 13, lineHeight: 1.55, marginTop: 12, marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                    {c.message?.trim() ? c.message : '—'}
                  </p>
                </div>
              );
            })}
          </div>
        )
      )}

      {!loadingData && tab === 'vision' && (
        <>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {visionTally.map(({ k, want, no }) => (
              <div key={k} style={{ background: '#0e0e0e', border: '1px solid rgba(201,154,63,0.2)', borderRadius: 10, padding: '12px 16px', minWidth: 130 }}>
                <div style={{ fontFamily: CINZEL, fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{VISION_LABELS[k]}</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>
                  <span style={{ color: '#7ED99B' }}>♥ {want}</span>
                  <span style={{ opacity: 0.4 }}> · </span>
                  <span style={{ color: '#e0a3a3' }}>✕ {no}</span>
                </div>
              </div>
            ))}
          </div>
          <DataTable
            cols={['Date', 'Voter', 'Project', 'Vote']}
            rows={visionVotes.map((v) => [
              fmtDate(v.voted_at),
              ownerByUser.get(v.user_id) || short(v.user_id, 10),
              VISION_LABELS[v.vision_key] ?? v.vision_key,
              <Pill key="v" ok={v.vote === 'want'}>{v.vote}</Pill>,
            ])}
            empty="No vision votes yet."
          />
        </>
      )}

      {!loadingData && tab === 'bugs' && (
        <div style={{ opacity: 0.6, fontSize: 14, lineHeight: 1.6, maxWidth: 520 }}>
          <p>No bug-tracking table in Supabase yet.</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>
            Bug reports currently arrive by e-mail / manually. When a <code style={{ fontFamily: MONO, color: GOLD }}>bug_reports</code> table
            is added, this tab will render it read-only like the others.
          </p>
        </div>
      )}

      {!loadingData && tab === 'reports' && (
        <>
          <div style={{ opacity: 0.6, fontSize: 13, lineHeight: 1.6, maxWidth: 620, marginBottom: 16 }}>
            Every report also arrives by e-mail. Handling happens outside the app — this is the queue,
            so nothing gets lost when a mail does. Blocking is the member's own tool and works
            instantly, without you.
          </div>
          <DataTable
            cols={['Date', 'What', 'Reason', 'Reported by', 'Target', 'Note', 'Status', '']}
            rows={reports.map((r) => [
              fmtDate(r.created_at),
              r.target_kind,
              r.reason.replace(/_/g, ' '),
              ownerByUser.get(r.reporter_id) || short(r.reporter_id, 10),
              r.target_user_id ? (ownerByUser.get(r.target_user_id) || short(r.target_user_id, 10)) : short(r.target_ref, 12),
              r.note ?? '—',
              <Pill key="s" ok={r.status === 'handled'}>{r.status}</Pill>,
              r.status === 'new' ? (
                <button
                  key="a"
                  onClick={() => void markReportHandled(r.id)}
                  style={{
                    background: 'none', border: `1px solid ${GOLD}`, color: GOLD, borderRadius: 6,
                    padding: '5px 11px', fontSize: 12, cursor: 'pointer', fontFamily: GROTESK, whiteSpace: 'nowrap',
                  }}
                >Mark handled</button>
              ) : '',
            ])}
            empty="No reports. Good."
          />
        </>
      )}

      {/* AINUBIS má vlastný live datasource (edge fn ainubis-ops) — nezávisí od
          loadingData (to je pre dogs/contacts/pack/vision). */}
      {tab === 'ainubis' && <AinubisPanel initialConversationId={ainubisDeepLinkId} />}
    </>
  );
}

// ── shared inline style objects ───────────────────────────────────────────────
export const brandBtn: React.CSSProperties = {
  background: 'var(--brand-gradient, linear-gradient(135deg,#F5C73D,#E69E1A))',
  border: '1px solid rgba(250,244,236,0.30)',
  color: '#000',
  borderRadius: 8,
  padding: '10px 18px',
  fontWeight: 700,
  fontFamily: CINZEL,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontSize: 13,
  cursor: 'pointer',
};

const kpiCard: React.CSSProperties = {
  flex: '1 1 160px',
  minWidth: 150,
  background: 'linear-gradient(165deg, #131210 0%, #0b0b0a 100%)',
  border: '1px solid rgba(201,154,63,0.28)',
  borderRadius: 14,
  padding: '18px 20px',
  boxShadow: '0 0 24px rgba(201,154,63,0.06) inset',
};

const kpiValue: React.CSSProperties = {
  fontFamily: CINZEL,
  fontWeight: 700,
  fontSize: 40,
  lineHeight: 1.05,
  background: `linear-gradient(180deg, ${GOLD_LIGHT}, ${GOLD})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const kpiLabel: React.CSSProperties = {
  fontSize: 11,
  opacity: 0.55,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  marginTop: 8,
  fontFamily: GROTESK,
};

const councilCard: React.CSSProperties = {
  background: PAPYRUS,
  borderRadius: 14,
  padding: '18px 18px 16px',
  border: '1px solid rgba(201,154,63,0.4)',
  boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
};

const councilBadge: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  padding: '3px 10px',
  borderRadius: 999,
  background: 'rgba(31,26,14,0.08)',
  border: `1px solid ${INK}33`,
  color: INK,
  fontFamily: GROTESK,
  letterSpacing: '0.02em',
};

// ── helpers ──────────────────────────────────────────────────────────────────
function Pill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 600,
      background: ok ? 'rgba(90,214,140,0.14)' : 'rgba(224,163,163,0.14)',
      color: ok ? '#5ad68c' : '#e0a3a3',
    }}>{children}</span>
  );
}

function DataTable({ cols, rows, empty }: { cols: string[]; rows: React.ReactNode[][]; empty?: string }) {
  if (rows.length === 0) return <p style={{ opacity: 0.6 }}>{empty ?? 'No rows.'}</p>;
  return (
    <div style={{ overflowX: 'auto', border: '1px solid rgba(201,154,63,0.2)', borderRadius: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} style={{ textAlign: 'left', padding: '11px 13px', background: '#0e0e0e', color: GOLD,
                fontFamily: CINZEL, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(201,154,63,0.25)' }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #161616', background: i % 2 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
              {r.map((cell, j) => (
                <td key={j} style={{ padding: '10px 13px', whiteSpace: 'nowrap', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
