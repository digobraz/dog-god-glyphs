import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME } from '@/components/pack/packTheme';
import { ACTIVITIES, DIFFICULTIES, REGIONS, type TrailActivity, type TrailDifficulty } from './types';

const T = PACK_THEME;

export interface TrailFiltersState {
  region: string; // '' = all
  difficulty: TrailDifficulty | ''; // '' = all
  activities: TrailActivity[];
}

export const EMPTY_FILTERS: TrailFiltersState = { region: '', difficulty: '', activities: [] };

function chipStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: "'Cinzel', serif",
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '7px 13px',
    borderRadius: 999,
    cursor: 'pointer',
    color: active ? T.ink : T.onDark,
    background: active ? T.accentGold : 'rgba(245,240,228,0.08)',
    border: `1px solid ${active ? T.accentGold : T.onDarkBorder}`,
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  };
}

interface TrailFiltersProps {
  value: TrailFiltersState;
  onChange: (next: TrailFiltersState) => void;
}

export function TrailFilters({ value, onChange }: TrailFiltersProps) {
  const t = useT();

  function toggleActivity(a: TrailActivity) {
    const has = value.activities.includes(a);
    onChange({
      ...value,
      activities: has ? value.activities.filter((x) => x !== a) : [...value.activities, a],
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Región + náročnosť — jeden riadok na desktope, wrap na mobile */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={value.region}
          onChange={(e) => onChange({ ...value, region: e.target.value })}
          style={{
            fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: T.onDark, background: 'rgba(245,240,228,0.08)',
            border: `1px solid ${T.onDarkBorder}`, borderRadius: 8, padding: '9px 12px',
          }}
        >
          <option value="">{t('pack.trails.filters.allRegions')}</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" style={chipStyle(value.difficulty === '')} onClick={() => onChange({ ...value, difficulty: '' })}>
            {t('pack.trails.filters.allDifficulties')}
          </button>
          {DIFFICULTIES.map((d) => (
            <button key={d} type="button" style={chipStyle(value.difficulty === d)} onClick={() => onChange({ ...value, difficulty: value.difficulty === d ? '' : d })}>
              {t(`pack.trails.difficulty.${d}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Aktivity — multi-select */}
      <div className="flex flex-wrap items-center gap-2">
        {ACTIVITIES.map((a) => (
          <button key={a} type="button" style={chipStyle(value.activities.includes(a))} onClick={() => toggleActivity(a)}>
            {t(`pack.trails.activity.${a}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
