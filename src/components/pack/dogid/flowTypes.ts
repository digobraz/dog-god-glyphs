// Tvar obrazoviek kvízov DOG ID (nákres + Matejove úpravy, 2. 11. 2026). Všetky texty sú i18n kľúče.
export type FlowKey = 'base' | 'nature' | 'balance' | 'will' | 'modules';

export interface FlowReveal { ph?: string; field?: string; chips?: { v: string; t: string }[]; chipsField?: string; dateField?: string }
export interface FlowOpt {
  v: string; t: string; e?: string; d?: string; none?: boolean; other?: boolean;
  score?: string[]; warn?: string; warnT?: string; reveal?: FlowReveal;
  sub?: { field: string; opts: { v: string; t: string; warn?: string; warnT?: string }[] };
}
export interface FlowField { field: string; l: string; ph?: string; type?: string; area?: boolean }
export interface FlowRow { field: string; l: string; e?: string; noteField?: string; vals: { v: string; t: string }[] }
export interface FlowScreen {
  id: string; flow: FlowKey; kind: string; t: string; s?: string; sec?: string; secE?: string; art?: string;
  add?: boolean; max?: number; noteOpen?: boolean; notePh?: string; tip?: string[]; tipT?: string; field?: string;
  opts?: FlowOpt[]; fields?: FlowField[]; big?: boolean; rows?: FlowRow[]; colored?: boolean;
  photos?: Record<string, string>; labels?: Record<string, string>; sug?: string[]; attr?: string; badgesTitle?: string;
  cta?: string; cta2?: string; mods?: { key: string; t: string; d: string; ic: string; bg: string }[]; soon?: { t: string; ic: string };
}
