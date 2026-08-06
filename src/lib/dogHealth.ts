// ============================================================================
// Health status psa — kľúče + farby. Zdieľané medzi profilom psa (PackDogDetail,
// kde sa status nastavuje) a svorkou na `/pack` (PackTree, kde sa len zobrazuje).
//
// PackDogDetail je ~4000 riadkov a lazy-loaded — import čohokoľvek z NEHO by
// vtiahol celý ten chunk do homepage bundlu. Preto samostatný modul.
// ============================================================================

export type HealthKey = 'healthy' | 'injury' | 'gastro' | 'allergy' | 'other';

export const HEALTH_KEYS: HealthKey[] = ['healthy', 'injury', 'gastro', 'allergy', 'other'];

export const HEALTH_COLORS: Record<HealthKey, string> = {
  healthy: '#22A35E',
  injury: '#E0892B',
  gastro: '#C2683B',
  allergy: '#B5573E',
  other: '#7A6A52',
};

/** i18n kľúč labelu — `pack.dog.healthHealthy`, `pack.dog.healthInjury`, … */
export const healthLabelKey = (k: HealthKey): string =>
  `pack.dog.health${k.charAt(0).toUpperCase()}${k.slice(1)}`;

/** DB hodnota → platný kľúč. Prázdne/neznáme = 'healthy' (default stavu v profile). */
export function healthKeyOf(raw: string | null | undefined): HealthKey {
  return HEALTH_KEYS.includes(raw as HealthKey) ? (raw as HealthKey) : 'healthy';
}
