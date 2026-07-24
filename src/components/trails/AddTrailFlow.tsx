import { useMemo, useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import { useT } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { PACK_THEME } from '@/components/pack/packTheme';
import { useToast } from '@/hooks/use-toast';
import { TrailsMap } from './TrailsMap';
import { ACTIVITIES, DIFFICULTIES, PLACE_TYPES, REGIONS, type TrailActivity, type TrailDifficulty } from './types';

const T = PACK_THEME;

// Haversine — súčet vzdialeností medzi klikmi (F1: žiadny GraphHopper, len
// lineárny súčet segmentov medzi bodmi, ktoré člen položil).
function haversineM(a: LatLngTuple, b: LatLngTuple): number {
  const R = 6371000;
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function totalDistance(points: LatLngTuple[]): number {
  let sum = 0;
  for (let i = 1; i < points.length; i++) sum += haversineM(points[i - 1], points[i]);
  return Math.round(sum);
}

type Mode = 'trail' | 'place';

interface AddTrailFlowProps {
  onClose: () => void;
  onAdded: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', fontSize: 13, color: T.ink, background: T.cardSoft,
  border: `1px solid ${T.border}`, borderRadius: 8, padding: '9px 11px',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: T.inkFaint, marginBottom: 6, display: 'block',
};

function chipStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
    textTransform: 'uppercase', padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
    color: active ? T.ink : T.inkDim,
    background: active ? T.accentGold : T.cardSoft,
    border: `1px solid ${active ? T.accentGold : T.border}`,
  };
}

export function AddTrailFlow({ onClose, onAdded }: AddTrailFlowProps) {
  const t = useT();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>('trail');
  const [points, setPoints] = useState<LatLngTuple[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<TrailDifficulty | ''>('');
  const [activities, setActivities] = useState<TrailActivity[]>([]);
  const [region, setRegion] = useState('');
  const [placeType, setPlaceType] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const distanceM = useMemo(() => (mode === 'trail' ? totalDistance(points) : 0), [mode, points]);

  function handleMapClick(lat: number, lng: number) {
    if (mode === 'place') {
      setPoints([[lat, lng]]);
    } else {
      setPoints((p) => [...p, [lat, lng]]);
    }
  }

  function undoLast() {
    setPoints((p) => p.slice(0, -1));
  }

  function clearPoints() {
    setPoints([]);
  }

  function toggleActivity(a: TrailActivity) {
    setActivities((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));
  }

  function switchMode(next: Mode) {
    setMode(next);
    setPoints([]);
  }

  const canSubmit = mode === 'trail'
    ? name.trim().length > 0 && points.length >= 2
    : name.trim().length > 0 && points.length === 1;

  async function submit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('no session');

      if (mode === 'trail') {
        const path = {
          type: 'LineString' as const,
          coordinates: points.map(([lat, lng]) => [lng, lat]),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('trails').insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          difficulty: difficulty || null,
          distance_m: distanceM,
          activities,
          region: region || null,
          path,
          status: 'pending',
        });
        if (error) throw error;
      } else {
        const [lat, lng] = points[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('trail_places').insert({
          user_id: user.id,
          name: name.trim(),
          place_type: placeType || null,
          lat,
          lng,
          description: description.trim() || null,
          status: 'pending',
        });
        if (error) throw error;
      }

      toast({ description: t('pack.trails.addedPendingToast') });
      onAdded();
      onClose();
    } catch {
      toast({ description: t('pack.trails.addError'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: T.card, color: T.ink, borderRadius: 8, border: `1px solid ${T.border}`, padding: 20 }}>
      <div className="flex items-start justify-between">
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, letterSpacing: '0.02em' }}>
          {t('pack.trails.addFlow.title')}
        </h2>
        <button type="button" onClick={onClose} aria-label={t('pack.trails.close')} style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, color: T.inkDim }}>
          ✕
        </button>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button type="button" style={chipStyle(mode === 'trail')} onClick={() => switchMode('trail')}>
          {t('pack.trails.addFlow.modeTrail')}
        </button>
        <button type="button" style={chipStyle(mode === 'place')} onClick={() => switchMode('place')}>
          {t('pack.trails.addFlow.modePlace')}
        </button>
      </div>

      <p style={{ fontSize: 12, color: T.inkDim, marginTop: 10 }}>
        {mode === 'trail' ? t('pack.trails.addFlow.helpTrail') : t('pack.trails.addFlow.helpPlace')}
      </p>

      <div className="mt-3">
        <TrailsMap trails={[]} places={[]} draftPoints={points} onMapClick={handleMapClick} height={300} />
      </div>

      <div className="flex items-center gap-3 mt-2">
        <span style={{ fontSize: 11, color: T.inkFaint }}>
          {mode === 'trail'
            ? t('pack.trails.addFlow.pointsCount', { count: String(points.length) })
            : points.length > 0 ? t('pack.trails.addFlow.pointPlaced') : t('pack.trails.addFlow.pointNotPlaced')}
        </span>
        {mode === 'trail' && points.length > 0 && (
          <span style={{ fontSize: 11, color: T.inkFaint }}>
            {(distanceM / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })} km
          </span>
        )}
        {points.length > 0 && (
          <>
            <button type="button" onClick={undoLast} style={{ fontSize: 11, textDecoration: 'underline', color: T.inkDim }}>
              {t('pack.trails.addFlow.undo')}
            </button>
            <button type="button" onClick={clearPoints} style={{ fontSize: 11, textDecoration: 'underline', color: T.inkDim }}>
              {t('pack.trails.addFlow.clear')}
            </button>
          </>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div>
          <label style={labelStyle}>{t('pack.trails.addFlow.name')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} maxLength={80} />
        </div>
        <div>
          <label style={labelStyle}>{t('pack.trails.addFlow.description')}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} maxLength={600} />
        </div>

        {mode === 'trail' && (
          <>
            <div className="flex flex-wrap gap-4">
              <div style={{ flex: '1 1 160px' }}>
                <label style={labelStyle}>{t('pack.trails.addFlow.region')}</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)} style={inputStyle}>
                  <option value="">{t('pack.trails.filters.allRegions')}</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <label style={labelStyle}>{t('pack.trails.difficultyLabel')}</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as TrailDifficulty | '')} style={inputStyle}>
                  <option value="">—</option>
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{t(`pack.trails.difficulty.${d}`)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('pack.trails.addFlow.activities')}</label>
              <div className="flex flex-wrap gap-2">
                {ACTIVITIES.map((a) => (
                  <button key={a} type="button" style={chipStyle(activities.includes(a))} onClick={() => toggleActivity(a)}>
                    {t(`pack.trails.activity.${a}`)}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === 'place' && (
          <div>
            <label style={labelStyle}>{t('pack.trails.addFlow.placeType')}</label>
            <select value={placeType} onChange={(e) => setPlaceType(e.target.value)} style={inputStyle}>
              <option value="">—</option>
              {PLACE_TYPES.map((p) => <option key={p} value={p}>{t(`pack.trails.placeType.${p}`)}</option>)}
            </select>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit || submitting}
        style={{
          marginTop: 20, width: '100%', fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: T.ink, background: T.accentGold,
          borderRadius: 999, padding: '12px 20px', opacity: !canSubmit || submitting ? 0.5 : 1,
        }}
      >
        {submitting ? t('pack.trails.saving') : t('pack.trails.addFlow.submit')}
      </button>
    </div>
  );
}
