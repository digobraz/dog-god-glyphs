// MOMENT = jeden vstup pre každú udalosť, ktorú appka oceňuje. Volá ho udalosť (výlet, zápis dňa, SNIFFER…)
// v okamihu, keď sa moment ukáže. Rieši tri veci, ktoré dovtedy mal každý reveal po svojom alebo vôbec:
//   1. haptika podľa veľkosti momentu (register) · 2. gong pri obrade · 3. meranie `pack_moment`
// Meranie bolo v hárku na opravu („nemeria sa ťuk na push, zápis dňa, séria, lajk ani návrat do appky —
// bez toho nezistíme, či čokoľvek z tohto hárku funguje“). Vzhľad momentu kreslí komponent udalosti
// alebo spoločný `MomentHost` (components/pack/moment), nie táto funkcia.
import { trackPack } from '@/lib/packAnalytics';
import { MOMENTY, maZvuk, type MomentId } from './register';
import { haptika, gong, type Uder } from './haptika';

export { MOMENTY, maZvuk } from './register';
export type { MomentId, MomentVelkost } from './register';
export { haptika, gong, haptikaZapnuta, zvukZapnuty, nastavHaptiku, nastavZvuk } from './haptika';

/** Prvý úder podľa veľkosti: iskra ťukne, pečať dopadne, odhalenie ohlási úspech, obrad udrie naplno. */
const PRVY: Record<string, Uder> = { iskra: 'tuk', pecat: 'dopad', odhalenie: 'uspech', obrad: 'tazky' };

/** Moment sa práve ukázal. `props` idú do merania (napr. level, počet dní) — žiadne mená ani texty. */
export function moment(id: MomentId, props?: Record<string, string | number | boolean>): void {
  const def = MOMENTY[id];
  haptika(PRVY[def.velkost]);
  if (maZvuk(id)) gong();
  trackPack('pack_moment', { moment: id, velkost: def.velkost, ...props });
}

/** Ďalší úder v tom istom momente (číslica sa vyrazila, pečať dopadla). Bez merania. */
export const uder = (u: Uder = 'tuk') => haptika(u);
