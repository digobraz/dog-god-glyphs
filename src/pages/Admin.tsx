/**
 * /admin — read-only v0 (issue #10).
 *
 * Iba na čítanie. Žiadne edit/delete/mutácie. Prístup gated na admin e-mail
 * cez existujúcu Supabase magic-link session + RLS policy "Admin read all"
 * (gated na auth.jwt()->>'email'); bez admin e-mailu Postgres aj tak nevráti
 * cudzie riadky, takže UI gate je len UX vrstva nad DB-level ochranou.
 *
 * Taby: Orders · Dogs · Photos · Emails · Bugs.
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Admin e-maily — kto sa smie prihlásiť. Drží sa to v synchronizácii s RLS
// policy "Admin read all" v Supabase (gated na rovnaký e-mail). Pridať admina
// = doplniť sem AJ do policy.
const ADMIN_EMAILS = ['hekthorsk@gmail.com'];

type AuthState = 'loading' | 'anon' | 'denied' | 'ok';

interface Dog {
  id: string;
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

const GOLD = '#C99A3F';
type Tab = 'orders' | 'dogs' | 'photos' | 'emails' | 'bugs';

// amount je integer v centoch (Stripe). null = tester / nezaplatené.
const fmtAmount = (a: number | null) =>
  a == null ? '—' : `€${(a / 100).toFixed(2)}`;
const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleString('sk-SK', { dateStyle: 'short', timeStyle: 'short' }) : '—';
const short = (s: string | null, n = 14) =>
  !s ? '—' : s.length > n ? s.slice(0, n) + '…' : s;

export default function Admin() {
  const [auth, setAuth] = useState<AuthState>('loading');
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('orders');

  // login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSent, setLoginSent] = useState(false);
  const [loginErr, setLoginErr] = useState('');

  // data
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [packMembers, setPackMembers] = useState<PackMember[]>([]);
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
      const [d, c, p] = await Promise.all([
        supabase.from('dogs').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('pack_members').select('*').order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;
      const err = d.error || c.error || p.error;
      if (err) setDataErr(err.message);
      setDogs((d.data as Dog[]) ?? []);
      setContacts((c.data as Contact[]) ?? []);
      setPackMembers((p.data as PackMember[]) ?? []);
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
    <div style={{ minHeight: '100vh', background: '#000', color: 'rgba(250,244,236,0.92)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 18px 80px' }}>
        <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 22 }}>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: GOLD, fontSize: 24, letterSpacing: '0.04em', margin: 0 }}>
            DOGYPT · ADMIN
          </h1>
          {auth === 'ok' && (
            <button onClick={logout}
              style={{ background: 'none', border: `1px solid ${GOLD}55`, color: GOLD, borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>
              {sessionEmail} · log out
            </button>
          )}
        </header>
        {children}
      </div>
    </div>
  );

  if (auth === 'loading') return shell(<p style={{ opacity: 0.6 }}>Loading…</p>);

  if (auth === 'denied') return shell(
    <div style={{ marginTop: 40 }}>
      <p style={{ color: '#e0a3a3', fontSize: 15 }}>Access denied.</p>
      <p style={{ opacity: 0.6, fontSize: 13, marginTop: 6 }}>
        Logged in as <b>{sessionEmail}</b> — not an admin account.
      </p>
      <button onClick={logout} style={{ marginTop: 14, background: GOLD, border: 'none', color: '#000', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>
        Log out
      </button>
    </div>
  );

  if (auth === 'anon') return shell(
    <div style={{ marginTop: 40, maxWidth: 380 }}>
      <p style={{ opacity: 0.78, fontSize: 14, marginBottom: 14 }}>Admin sign-in — magic link.</p>
      {loginSent ? (
        <p style={{ color: GOLD, fontSize: 14 }}>Check <b>{loginEmail}</b> — a sign-in link is on its way. Open it on this device.</p>
      ) : (
        <>
          <input
            type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="admin@email" autoComplete="email"
            onKeyDown={(e) => e.key === 'Enter' && sendMagicLink()}
            style={{ width: '100%', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 12px', fontSize: 16 }}
          />
          <button onClick={sendMagicLink}
            style={{ marginTop: 10, background: GOLD, border: 'none', color: '#000', borderRadius: 6, padding: '10px 16px', fontWeight: 600, cursor: 'pointer' }}>
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
  const stats: [string, number | string][] = [
    ['Dogs', dogs.length],
    ['Paid', paid.length],
    ['Testers', testers.length],
    ['Pack', packMembers.length],
    ['Emails', contacts.length],
  ];
  const tabs: [Tab, string][] = [
    ['orders', 'Orders'], ['dogs', 'Dogs'], ['photos', 'Photos'], ['emails', 'Emails'], ['bugs', 'Bugs'],
  ];

  return shell(
    <>
      {/* stats */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {stats.map(([label, n]) => (
          <div key={label} style={{ background: '#0e0e0e', border: '1px solid #222', borderRadius: 8, padding: '10px 16px', minWidth: 86 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: GOLD }}>{n}</div>
            <div style={{ fontSize: 11, opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #222', marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '8px 14px', fontSize: 13,
              color: tab === id ? GOLD : 'rgba(250,244,236,0.55)',
              borderBottom: tab === id ? `2px solid ${GOLD}` : '2px solid transparent', marginBottom: -1, fontWeight: tab === id ? 600 : 400,
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
            d.country ?? '—', d.is_tester ? '✓' : '', d.referred_by_code ?? '—', short(d.stripe_session_id, 12),
          ])}
        />
      )}

      {!loadingData && tab === 'dogs' && (
        <DataTable
          cols={['Date', 'Dog', 'Breed', 'Year', 'Heroglyph code', 'Country', 'Grid message', 'Cert PDF']}
          rows={dogs.map((d) => [
            fmtDate(d.created_at), d.dog_name ?? '—', d.breed ?? '—', d.birth_year ?? '—',
            <code key="h" style={{ fontSize: 11, color: GOLD }}>{d.heroglyph_code ?? '—'}</code>,
            d.country ?? '—', short(d.grid_message, 30),
            d.pdf_cert_url ? <a key="p" href={d.pdf_cert_url} target="_blank" rel="noreferrer" style={{ color: GOLD }}>PDF</a> : '—',
          ])}
        />
      )}

      {!loadingData && tab === 'photos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {dogs.filter((d) => d.cloudinary_main_url).map((d) => (
            <a key={d.id} href={d.cloudinary_main_url!} target="_blank" rel="noreferrer"
              style={{ display: 'block', border: '1px solid #222', borderRadius: 8, overflow: 'hidden', background: '#0e0e0e' }}>
              <img src={d.cloudinary_main_url!} alt={d.dog_name ?? ''} loading="lazy"
                style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '6px 8px', fontSize: 12 }}>
                {d.dog_name ?? '—'}
                {d.cloudinary_extras?.length ? <span style={{ opacity: 0.5 }}> +{d.cloudinary_extras.length}</span> : null}
              </div>
            </a>
          ))}
          {dogs.filter((d) => d.cloudinary_main_url).length === 0 && <p style={{ opacity: 0.6 }}>No photos yet.</p>}
        </div>
      )}

      {!loadingData && tab === 'emails' && (
        <DataTable
          cols={['Date', 'Name', 'Email', 'Role', 'Message']}
          rows={contacts.map((c) => [
            fmtDate(c.created_at), c.name ?? '—', c.email ?? '—', c.role ?? '—', short(c.message, 60),
          ])}
          empty="No council / contact submissions yet."
        />
      )}

      {!loadingData && tab === 'bugs' && (
        <div style={{ opacity: 0.6, fontSize: 14, lineHeight: 1.6, maxWidth: 520 }}>
          <p>No bug-tracking table in Supabase yet.</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>
            Bug reports currently arrive by e-mail / manually. When a <code>bug_reports</code> table
            is added, this tab will render it read-only like the others.
          </p>
        </div>
      )}
    </>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────
function Pill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 999,
      background: ok ? 'rgba(90,214,140,0.14)' : 'rgba(224,163,163,0.14)',
      color: ok ? '#5ad68c' : '#e0a3a3',
    }}>{children}</span>
  );
}

function DataTable({ cols, rows, empty }: { cols: string[]; rows: React.ReactNode[][]; empty?: string }) {
  if (rows.length === 0) return <p style={{ opacity: 0.6 }}>{empty ?? 'No rows.'}</p>;
  return (
    <div style={{ overflowX: 'auto', border: '1px solid #1c1c1c', borderRadius: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} style={{ textAlign: 'left', padding: '10px 12px', background: '#0e0e0e', color: 'rgba(250,244,236,0.5)',
                fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', borderBottom: '1px solid #222' }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #161616' }}>
              {r.map((cell, j) => (
                <td key={j} style={{ padding: '9px 12px', whiteSpace: 'nowrap', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
