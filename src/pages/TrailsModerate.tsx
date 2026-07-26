import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PACK_THEME } from '@/components/pack/packTheme';
import { useToast } from '@/hooks/use-toast';
import type { Trail, TrailPlace } from '@/components/trails/types';

const T = PACK_THEME;

// Mirrors the SQL admin allowlist (public.is_trails_admin() in the trails
// migration) — keep both lists in sync if Matej's admin emails ever change.
const ADMIN_EMAILS = ['biznismantt@gmail.com', 'dogypt@gmail.com'];

const rowStyle: React.CSSProperties = {
  background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
  boxShadow: T.cardShadow,
  padding: '14px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
};

const btnStyle = (bg: string): React.CSSProperties => ({
  fontFamily: "'Cinzel', serif", fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: T.ink, background: bg, borderRadius: 999, padding: '7px 14px', flexShrink: 0,
});

export default function TrailsModerate() {
  const t = useT();
  const { toast } = useToast();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [pendingTrails, setPendingTrails] = useState<Trail[]>([]);
  const [pendingPlaces, setPendingPlaces] = useState<TrailPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setAllowed(ADMIN_EMAILS.includes(session?.user?.email ?? ''));
    });
    return () => { mounted = false; };
  }, []);

  async function loadPending() {
    setLoading(true);
    const [{ data: trailRows }, { data: placeRows }] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from('trails').select('*').eq('status', 'pending').order('created_at', { ascending: true }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from('trail_places').select('*').eq('status', 'pending').order('created_at', { ascending: true }),
    ]);
    setPendingTrails((trailRows as Trail[] | null) ?? []);
    setPendingPlaces((placeRows as TrailPlace[] | null) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (allowed === true) void loadPending();
  }, [allowed]);

  async function setTrailStatus(id: string, status: 'approved' | 'rejected') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('trails').update({ status }).eq('id', id);
    if (error) { toast({ description: t('pack.trails.moderate.error'), variant: 'destructive' }); return; }
    setPendingTrails((cur) => cur.filter((tr) => tr.id !== id));
  }

  async function setPlaceStatus(id: string, status: 'approved' | 'rejected') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('trail_places').update({ status }).eq('id', id);
    if (error) { toast({ description: t('pack.trails.moderate.error'), variant: 'destructive' }); return; }
    setPendingPlaces((cur) => cur.filter((p) => p.id !== id));
  }

  if (allowed === false) return <Navigate to="/pack/trails" replace />;

  return (
    <PackLayout title={t('pack.trails.moderate.title')} wide>
      {allowed === null || loading ? (
        <div style={{ color: T.onDarkDim, fontSize: 12, textAlign: 'center', padding: 40 }}>
          {t('pack.layout.loading')}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <section>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.onDark, marginBottom: 12 }}>
              {t('pack.trails.moderate.trailsHeading')} ({pendingTrails.length})
            </h2>
            <div className="flex flex-col gap-3">
              {pendingTrails.length === 0 && (
                <div style={{ color: T.onDarkDim, fontSize: 12 }}>{t('pack.trails.moderate.empty')}</div>
              )}
              {pendingTrails.map((tr) => (
                <div key={tr.id} style={rowStyle}>
                  <div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: T.ink }}>{tr.name}</div>
                    <div style={{ fontSize: 11, color: T.inkDim, marginTop: 2 }}>
                      {tr.region ?? '—'} · {tr.difficulty ?? '—'} · {tr.path?.coordinates?.length ?? 0} pts
                    </div>
                    {tr.description && <div style={{ fontSize: 12, color: T.inkDim, marginTop: 4 }}>{tr.description}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" style={btnStyle(T.accentGold)} onClick={() => setTrailStatus(tr.id, 'approved')}>
                      {t('pack.trails.moderate.approve')}
                    </button>
                    <button type="button" style={btnStyle(T.alertRedSoft)} onClick={() => setTrailStatus(tr.id, 'rejected')}>
                      {t('pack.trails.moderate.reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.onDark, marginBottom: 12 }}>
              {t('pack.trails.moderate.placesHeading')} ({pendingPlaces.length})
            </h2>
            <div className="flex flex-col gap-3">
              {pendingPlaces.length === 0 && (
                <div style={{ color: T.onDarkDim, fontSize: 12 }}>{t('pack.trails.moderate.empty')}</div>
              )}
              {pendingPlaces.map((p) => (
                <div key={p.id} style={rowStyle}>
                  <div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: T.ink }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: T.inkDim, marginTop: 2 }}>{p.place_type ?? '—'}</div>
                    {p.description && <div style={{ fontSize: 12, color: T.inkDim, marginTop: 4 }}>{p.description}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" style={btnStyle(T.accentGold)} onClick={() => setPlaceStatus(p.id, 'approved')}>
                      {t('pack.trails.moderate.approve')}
                    </button>
                    <button type="button" style={btnStyle(T.alertRedSoft)} onClick={() => setPlaceStatus(p.id, 'rejected')}>
                      {t('pack.trails.moderate.reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </PackLayout>
  );
}
