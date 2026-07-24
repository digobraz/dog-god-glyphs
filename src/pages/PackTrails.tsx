import { useEffect, useMemo, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PACK_THEME } from '@/components/pack/packTheme';
import { TrailsMap } from '@/components/trails/TrailsMap';
import { TrailFilters, EMPTY_FILTERS, type TrailFiltersState } from '@/components/trails/TrailFilters';
import { TrailDetail } from '@/components/trails/TrailDetail';
import { AddTrailFlow } from '@/components/trails/AddTrailFlow';
import type { Trail, TrailPlace } from '@/components/trails/types';

const T = PACK_THEME;

// SEED FALLBACK — odstrániť po naplnení DB. Zobrazí sa len ak approved trasy
// z DB sú prázdne (prvý pohľad na /pack/trails predtým, než niečo schválime).
const SEED_TRAIL: Trail = {
  id: 'seed-hektor-path',
  created_at: new Date().toISOString(),
  user_id: null,
  name: "Hektor's Path",
  description: 'A first waymark through Malá Fatra — the seed of the DOGYPT trail map.',
  difficulty: 'moderate',
  distance_m: 4200,
  ascent_m: 380,
  activities: ['forest', 'water'],
  region: 'Žilinský',
  path: {
    type: 'LineString',
    coordinates: [
      [19.045, 49.198],
      [19.052, 49.203],
      [19.061, 49.209],
      [19.070, 49.214],
      [19.079, 49.219],
    ],
  },
  cover_url: null,
  status: 'approved',
};

export default function PackTrails() {
  const t = useT();
  const [trails, setTrails] = useState<Trail[]>([]);
  const [places, setPlaces] = useState<TrailPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TrailFiltersState>(EMPTY_FILTERS);
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<TrailPlace | null>(null);
  const [showAddFlow, setShowAddFlow] = useState(false);

  async function loadData() {
    setLoading(true);
    // RLS zúži na approved + vlastné pending (trails_read_public / places_read_public).
    const [{ data: trailRows }, { data: placeRows }] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from('trails').select('*').order('created_at', { ascending: false }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from('trail_places').select('*').order('created_at', { ascending: false }),
    ]);
    setTrails((trailRows as Trail[] | null) ?? []);
    setPlaces((placeRows as TrailPlace[] | null) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const approvedTrails = trails.filter((tr) => tr.status === 'approved');
  // SEED FALLBACK — odstrániť po naplnení DB.
  const displayTrails = !loading && approvedTrails.length === 0 ? [SEED_TRAIL, ...trails] : trails;

  const filteredTrails = useMemo(() => {
    return displayTrails.filter((tr) => {
      if (filters.region && tr.region !== filters.region) return false;
      if (filters.difficulty && tr.difficulty !== filters.difficulty) return false;
      if (filters.activities.length > 0 && !filters.activities.every((a) => tr.activities?.includes(a))) return false;
      return true;
    });
  }, [displayTrails, filters]);

  function handleSelectTrail(trail: Trail) {
    setSelectedTrail(trail);
    setSelectedPlace(null);
  }
  function handleSelectPlace(place: TrailPlace) {
    setSelectedPlace(place);
    setSelectedTrail(null);
  }
  function closeDetail() {
    setSelectedTrail(null);
    setSelectedPlace(null);
  }

  return (
    <PackLayout title={t('pack.trails.title')} subtitle={t('pack.trails.subtitle')} wide>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TrailFilters value={filters} onChange={setFilters} />
          <button
            type="button"
            onClick={() => setShowAddFlow(true)}
            style={{
              fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: T.ink, background: T.accentGold, borderRadius: 999,
              padding: '10px 18px', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            {t('pack.trails.addTip')}
          </button>
        </div>

        <TrailsMap
          trails={filteredTrails}
          places={places}
          selectedTrailId={selectedTrail?.id ?? null}
          selectedPlaceId={selectedPlace?.id ?? null}
          onSelectTrail={handleSelectTrail}
          onSelectPlace={handleSelectPlace}
          height={460}
        />

        {(selectedTrail || selectedPlace) && (
          <TrailDetail trail={selectedTrail} place={selectedPlace} onClose={closeDetail} />
        )}

        {showAddFlow && (
          <AddTrailFlow onClose={() => setShowAddFlow(false)} onAdded={() => void loadData()} />
        )}
      </div>
    </PackLayout>
  );
}
