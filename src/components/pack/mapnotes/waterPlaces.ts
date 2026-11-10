// VODNÉ PLOCHY NA MAPE — druh a krátky názov (Matej 10. 11. 2026, `plany/nakresy/vodne-plochy-2026-11-10`).
// Kreslí ich len appka, spolu so samolepkami. Do 10. 11. rozhodovalo pole `waves`, ktoré mal jediný výlet,
// takže kačku rybníka dostala každá voda vrátane Zugersee.
import { MAP_STICKERS_ON } from './mapStickers';

export type WaterKind = 'jazero' | 'horske' | 'priehrada' | 'rybnik';
export type WaterPlace = { kind: WaterKind; name: string; at?: [number, number] };

// Len to, čo sa z názvu výletu odvodiť nedá. Nový výlet ide cez kindFromName a shortName.
const PLACES: Record<string, Partial<WaterPlace>> = {
  'liptovska-mara': { kind: 'priehrada' },
  kralova: { kind: 'priehrada' },
  slnava: { kind: 'priehrada' },
  'palcmanska-masa': { kind: 'priehrada' },
  'chtelnica-priehrada-male-karpaty': { name: 'Priehrada Chtelnica' },
  'local-1792067318523-0': { name: 'Rybník Bohunice' },
  // Švajčiarske túry: trasa ostáva trasou, len značka sedí na jazere, nie na parkovisku.
  // Súradnice z OSM (Nominatim), Fälensee = chata Bollenwees na brehu.
  'local-1791195300552-7467': { kind: 'horske', name: 'Oeschinensee', at: [46.4985, 7.7268] },
  seealpsee: { kind: 'horske', name: 'Seealpsee', at: [47.2683, 9.4008] },
  'local-1791717315327-13795': { kind: 'horske', name: 'Fälensee', at: [47.2543, 9.4255] },
  'local-1794157996029-12385': { kind: 'horske', name: 'Lungerersee', at: [46.7982, 8.1594] },
  'local-1791482895259-0': { kind: 'horske', name: 'Melchsee', at: [46.7704, 8.272] },
};

const kindFromName = (name: string): WaterKind =>
  /rybn|pond/i.test(name) ? 'rybnik' : /priehrad|nádrž|reservoir|\bdam\b/i.test(name) ? 'priehrada' : 'jazero';

// Nadpis článku ostáva v článku, na mape stojí meno miesta: „Zugersee – deň na paddleboarde…" ⇒ „Zugersee".
export const shortName = (name: string): string =>
  name.split(/\s[–—-]\s|:\s/)[0].replace(/\p{Extended_Pictographic}|️/gu, '').trim() || name;

/** Vodná značka výletu, alebo null, keď výlet na mape vodou nie je (a na webe vždy). */
export const waterPlaceOf = (tr: { id: string; name: string }, isWater: boolean): WaterPlace | null => {
  if (!MAP_STICKERS_ON) return null;
  const place = PLACES[tr.id];
  if (!place?.kind && !isWater) return null;
  return { kind: place?.kind ?? kindFromName(tr.name), name: place?.name ?? shortName(tr.name), at: place?.at };
};
