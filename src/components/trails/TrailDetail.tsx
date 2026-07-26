import { useEffect, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { PACK_THEME } from '@/components/pack/packTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { useToast } from '@/hooks/use-toast';
import type { Trail, TrailPlace, TrailRating } from './types';

const T = PACK_THEME;

function metersToKm(m: number | null): string | null {
  if (m == null) return null;
  return (m / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 });
}

function Star({ filled, size = 16 }: { filled: boolean; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', width: size, height: size }}>
      <BrandIcon name="star" size={size} tint={filled ? 'gold' : 'dim'} />
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={String(n)} style={{ lineHeight: 0 }}>
          <Star filled={n <= value} size={22} />
        </button>
      ))}
    </div>
  );
}

interface TrailDetailProps {
  trail: Trail | null;
  place: TrailPlace | null;
  onClose: () => void;
}

export function TrailDetail({ trail, place, onClose }: TrailDetailProps) {
  const t = useT();
  const { toast } = useToast();
  const [ratings, setRatings] = useState<TrailRating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [myStars, setMyStars] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!trail) { setRatings([]); return; }
    let mounted = true;
    setLoadingRatings(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('trail_ratings')
      .select('*')
      .eq('trail_id', trail.id)
      .order('created_at', { ascending: false })
      .then(({ data }: { data: TrailRating[] | null }) => {
        if (!mounted) return;
        setRatings(data ?? []);
        setLoadingRatings(false);
      });
    return () => { mounted = false; };
  }, [trail]);

  if (!trail && !place) return null;

  const avgStars = ratings.length
    ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
    : 0;

  async function submitRating() {
    if (!trail || !userId || myStars < 1) return;
    setSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('trail_ratings')
        .upsert(
          { trail_id: trail.id, user_id: userId, stars: myStars, comment: myComment.trim() || null },
          { onConflict: 'trail_id,user_id' },
        );
      if (error) throw error;
      toast({ description: t('pack.trails.ratingSaved') });
      setMyComment('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('trail_ratings')
        .select('*')
        .eq('trail_id', trail.id)
        .order('created_at', { ascending: false });
      setRatings((data as TrailRating[] | null) ?? []);
    } catch {
      toast({ description: t('pack.trails.ratingError'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  const panelStyle: React.CSSProperties = {
    background: T.panelGrad,
    color: T.ink,
    borderRadius: 14,
    border: `1.5px solid ${T.cardEdge}`,
    boxShadow: T.panelShadow,
    padding: 20,
    position: 'relative',
  };

  return (
    <div style={panelStyle}>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('pack.trails.close')}
        style={{ position: 'absolute', top: 14, right: 14, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, color: T.inkDim }}
      >
        ✕
      </button>

      {trail && (
        <>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, letterSpacing: '0.02em', color: T.ink, paddingRight: 24 }}>
            {trail.name}
          </h2>
          {trail.region && (
            <div style={{ fontSize: 11, color: T.inkDim, marginTop: 2 }}>{trail.region}</div>
          )}
          {trail.description && (
            <p style={{ fontSize: 13, color: T.inkDim, marginTop: 10, lineHeight: 1.5 }}>{trail.description}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-4">
            {trail.difficulty && (
              <div style={{ fontSize: 11, color: T.ink }}>
                <span style={{ color: T.inkFaint }}>{t('pack.trails.difficultyLabel')}: </span>
                <strong>{t(`pack.trails.difficulty.${trail.difficulty}`)}</strong>
              </div>
            )}
            {trail.distance_m != null && (
              <div style={{ fontSize: 11, color: T.ink }}>
                <span style={{ color: T.inkFaint }}>{t('pack.trails.distanceLabel')}: </span>
                <strong>{metersToKm(trail.distance_m)} km</strong>
              </div>
            )}
            {trail.ascent_m != null && (
              <div style={{ fontSize: 11, color: T.ink }}>
                <span style={{ color: T.inkFaint }}>{t('pack.trails.ascentLabel')}: </span>
                <strong>{trail.ascent_m} m</strong>
              </div>
            )}
          </div>

          {trail.activities?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {trail.activities.map((a) => (
                <span key={a} style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: T.ink, background: T.tileBg, border: `1px solid ${T.border}`, borderRadius: 999, padding: '4px 10px',
                }}>
                  {t(`pack.trails.activity.${a}`)}
                </span>
              ))}
            </div>
          )}

          {/* Ratings */}
          <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${T.hairline}` }}>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => <Star key={n} filled={n <= Math.round(avgStars)} />)}
              </div>
              <span style={{ fontSize: 12, color: T.inkDim }}>
                {ratings.length > 0
                  ? t('pack.trails.ratingsCount', { avg: avgStars.toFixed(1), count: String(ratings.length) })
                  : t('pack.trails.noRatingsYet')}
              </span>
            </div>

            {!loadingRatings && ratings.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                {ratings.filter((r) => r.comment).map((r) => (
                  <div key={r.id} style={{ fontSize: 12, color: T.inkDim, background: T.tileBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: '8px 10px' }}>
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((n) => <Star key={n} filled={n <= r.stars} size={12} />)}
                    </div>
                    {r.comment}
                  </div>
                ))}
              </div>
            )}

            {/* Add rating */}
            <div className="mt-4">
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 6 }}>
                {t('pack.trails.rateThisTrail')}
              </div>
              <StarPicker value={myStars} onChange={setMyStars} />
              <textarea
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                placeholder={t('pack.trails.commentPlaceholder')}
                rows={2}
                style={{
                  width: '100%', marginTop: 8, fontSize: 13, color: T.ink, background: T.cardSoft,
                  border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 10px', resize: 'vertical',
                }}
              />
              <button
                type="button"
                onClick={submitRating}
                disabled={myStars < 1 || submitting}
                style={{
                  marginTop: 8, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: T.ink, background: T.accentGold, borderRadius: 999,
                  padding: '9px 18px', opacity: myStars < 1 || submitting ? 0.5 : 1,
                }}
              >
                {submitting ? t('pack.trails.saving') : t('pack.trails.submitRating')}
              </button>
            </div>
          </div>
        </>
      )}

      {place && !trail && (
        <>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, letterSpacing: '0.02em', color: T.ink, paddingRight: 24 }}>
            {place.name}
          </h2>
          {place.place_type && (
            <div style={{ fontSize: 11, color: T.inkDim, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t(`pack.trails.placeType.${place.place_type}`)}
            </div>
          )}
          {place.description && (
            <p style={{ fontSize: 13, color: T.inkDim, marginTop: 10, lineHeight: 1.5 }}>{place.description}</p>
          )}
        </>
      )}
    </div>
  );
}
