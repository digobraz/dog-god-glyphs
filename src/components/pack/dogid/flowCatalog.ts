// KVÍZY DOG ID V APPKE (nákres + Matejove úpravy, 2. 11. 2026). Web drží starý kvíz, kým Matej nepovie.
// Obrazovky sú generované (flowData.generated.ts), tu je len to, čo sa z nich odvodzuje.
import { FLOW_SCREENS } from './flowData.generated';
import type { FlowScreen } from './flowTypes';

export { FLOW_SCREENS };
export const flowScreens = (flow: FlowScreen['flow']) => FLOW_SCREENS.filter((s) => s.flow === flow);
export const screenById = (id: string) => FLOW_SCREENS.find((s) => s.id === id);

/** Pole, kam obrazovka zapisuje hlavnú odpoveď. Osobnosť a Rovnováha majú vlastný priestor `q.*`. */
export const fieldOf = (s: FlowScreen) => s.field ?? `q.${s.id}`;
export const noteField = (s: FlowScreen) => `note.${s.id}`;

/** Všetky polia obrazovky, aj tie vo vysúvaní. Podľa nich sa predvypĺňa a hľadá `?field=`. */
export function screenFields(s: FlowScreen): string[] {
  const out = new Set<string>();
  if (s.opts) out.add(fieldOf(s));
  if (s.field) out.add(s.field);
  for (const f of s.fields ?? []) out.add(f.field);
  for (const r of s.rows ?? []) { out.add(r.field); if (r.noteField) out.add(r.noteField); }
  for (const o of s.opts ?? []) {
    if (o.reveal?.field) out.add(o.reveal.field);
    if (o.reveal?.chipsField) out.add(o.reveal.chipsField);
    if (o.reveal?.dateField) out.add(o.reveal.dateField);
    if (o.sub) out.add(o.sub.field);
  }
  if (s.opts?.some((o) => o.other)) out.add(`other.${s.id}`);
  if (s.kind !== 'intro' && s.kind !== 'result' && s.kind !== 'modules' && s.kind !== 'will') out.add(noteField(s));
  return [...out];
}

/** Polia, ktoré vypovedajú, či je obrazovka vyplnená. Poznámka a vysúvanie sa nerátajú. */
export function primaryFields(s: FlowScreen): string[] {
  if (s.rows) return s.rows.map((r) => r.field);
  if (s.fields) return s.fields.map((f) => f.field);
  return [fieldOf(s)];
}

export const isMultiKind = (s: FlowScreen) => s.kind === 'chips' || s.kind === 'pick2';

export interface FlowExtraStep { field: string; rowI18n: string; kind: 'single' | 'chips' | 'date' | 'text' | 'number'; screen: FlowScreen; labels?: Record<string, string> }

/** Polia, ktoré starý katalóg nepozná: vysúvané doplnenia, nové otázky, poznámky. Aby ich DOG ID vedelo ukázať. */
export function flowExtraSteps(known: Set<string>): FlowExtraStep[] {
  const out: FlowExtraStep[] = [];
  const push = (x: FlowExtraStep) => { if (!known.has(x.field) && !out.some((o) => o.field === x.field)) out.push(x); };
  for (const s of FLOW_SCREENS) {
    if (s.flow !== 'base') continue;
    const labels = s.opts ? Object.fromEntries(s.opts.map((o) => [o.v, o.t])) : undefined;
    if (s.opts && s.field) push({ field: s.field, rowI18n: s.t, kind: s.kind === 'chips' ? 'chips' : 'single', screen: s, labels });
    for (const f of s.fields ?? []) push({ field: f.field, rowI18n: f.l, kind: f.type === 'date' ? 'date' : 'text', screen: s });
    for (const r of s.rows ?? []) {
      push({ field: r.field, rowI18n: r.l, kind: 'single', screen: s, labels: Object.fromEntries(r.vals.map((v) => [v.v, v.t])) });
      if (r.noteField) push({ field: r.noteField, rowI18n: r.l, kind: 'text', screen: s });
    }
    for (const o of s.opts ?? []) {
      if (o.reveal?.field) push({ field: o.reveal.field, rowI18n: s.t, kind: 'text', screen: s });
      if (o.reveal?.chipsField && o.reveal.chips) push({ field: o.reveal.chipsField, rowI18n: s.t, kind: 'chips', screen: s, labels: Object.fromEntries(o.reveal.chips.map((c) => [c.v, c.t])) });
      if (o.sub) push({ field: o.sub.field, rowI18n: s.t, kind: 'single', screen: s, labels: Object.fromEntries(o.sub.opts.map((x) => [x.v, x.t])) });
    }
    push({ field: noteField(s), rowI18n: s.t, kind: 'text', screen: s });
  }
  return out;
}

/** Hodnota legacy poľa → hodnota otázky v appke. Uložené dáta sa neprepisujú. */
export function normalizeValue(field: string, v: unknown): unknown {
  if (field === 'basics.origin' && v === 'bad_conditions') return 'street';
  return v;
}
