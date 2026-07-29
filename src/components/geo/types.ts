// DOGYPT Trails F1 — shared types. Mirrors `trails` / `trail_places` /
// `trail_ratings` tables (not in generated Supabase types → callers cast
// `(supabase as any)`, same pattern as `dogs`).

export type TrailDifficulty = 'easy' | 'moderate' | 'hard' | 'extreme';

export type TrailActivity = 'water' | 'meadow' | 'forest' | 'ladders' | 'ford';

export type TrailPlaceType = 'water' | 'cafe' | 'vet' | 'park' | 'shelter';

export type TrailStatus = 'pending' | 'approved' | 'rejected';

export interface TrailGeoPath {
  type: 'LineString';
  coordinates: [number, number][]; // GeoJSON order: [lng, lat]
}

export interface Trail {
  id: string;
  created_at: string;
  user_id: string | null;
  name: string;
  description: string | null;
  difficulty: TrailDifficulty | null;
  distance_m: number | null;
  ascent_m: number | null;
  activities: TrailActivity[];
  region: string | null;
  path: TrailGeoPath;
  cover_url: string | null;
  status: TrailStatus;
}

export interface TrailPlace {
  id: string;
  created_at: string;
  user_id: string | null;
  name: string;
  place_type: TrailPlaceType | string | null;
  lat: number;
  lng: number;
  description: string | null;
  status: TrailStatus;
}

export interface TrailRating {
  id: string;
  created_at: string;
  trail_id: string;
  user_id: string;
  stars: number;
  comment: string | null;
}

export const DIFFICULTIES: TrailDifficulty[] = ['easy', 'moderate', 'hard', 'extreme'];
export const ACTIVITIES: TrailActivity[] = ['water', 'meadow', 'forest', 'ladders', 'ford'];
export const PLACE_TYPES: TrailPlaceType[] = ['water', 'cafe', 'vet', 'park', 'shelter'];

export const REGIONS = [
  'Bratislavský',
  'Trnavský',
  'Trenčiansky',
  'Nitriansky',
  'Žilinský',
  'Banskobystrický',
  'Prešovský',
  'Košický',
];
