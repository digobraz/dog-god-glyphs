// HAPTIKA A ZVUK MOMENTOV (voľba „haptika = a“ z hárku Zážitok appky, 15. 11. 2026):
// haptika všade, zvuk len pri obrade, obe sa dajú vypnúť.
//
// iPhone `navigator.vibrate` nepozná — dovtedy nevibrovalo v appke NIČ (audit 14. 11.). Natívne ide cez
// `@capacitor/haptics`, ktorý sa načíta až v appke (na webe by bol mŕtvy kód v prvom balíku).
// ⚠️ Plugin je NATÍVNA zmena: telefón ho má až s novým buildom (`scripts/appka/test.sh --testflight`).
//    Starší build plugin nenájde → padne do `vibrate`, na iPhone teda ticho. Žiadna chyba.
//
// Zvuk je syntetizovaný (WebAudio), nie súbor: jeden gong na obrad, žiadne načítanie, žiadna licencia.
import { IS_APP } from '@/lib/isApp';

/** Úder haptiky: ťuk (ľahký) · dopad (stredný) · ťažký · úspech (notifikácia). */
export type Uder = 'tuk' | 'dopad' | 'tazky' | 'uspech';

const KLUC_HAPTIKA = 'dogypt.momenty.haptika';
const KLUC_ZVUK = 'dogypt.momenty.zvuk';

const citaj = (k: string) => { try { return localStorage.getItem(k) !== '0'; } catch { return true; } };
const pis = (k: string, on: boolean) => { try { localStorage.setItem(k, on ? '1' : '0'); } catch { /* súkromné okno */ } };

export const haptikaZapnuta = () => citaj(KLUC_HAPTIKA);
export const zvukZapnuty = () => citaj(KLUC_ZVUK);
export const nastavHaptiku = (on: boolean) => pis(KLUC_HAPTIKA, on);
export const nastavZvuk = (on: boolean) => pis(KLUC_ZVUK, on);

type HapticsMod = typeof import('@capacitor/haptics');
let mod: Promise<HapticsMod | null> | null = null;
const nacitaj = () => (mod ??= IS_APP ? import('@capacitor/haptics').catch(() => null) : Promise.resolve(null));

const VIBRATE: Record<Uder, number | number[]> = { tuk: 8, dopad: 15, tazky: 28, uspech: [12, 60, 18] };

export function haptika(uder: Uder = 'tuk'): void {
  if (!haptikaZapnuta()) return;
  void nacitaj().then((h) => {
    try {
      if (h) {
        const { Haptics, ImpactStyle, NotificationType } = h;
        if (uder === 'uspech') return Haptics.notification({ type: NotificationType.Success });
        return Haptics.impact({ style: uder === 'tuk' ? ImpactStyle.Light : uder === 'dopad' ? ImpactStyle.Medium : ImpactStyle.Heavy });
      }
      navigator.vibrate?.(VIBRATE[uder]);
    } catch { /* bez haptiky sa nič nedeje */ }
  });
}

let ctx: AudioContext | null = null;

/** Gong obradu: dva tóny s dlhým dozvukom, ~2,5 s. Hrá len keď je zvuk zapnutý. */
export function gong(): void {
  if (!zvukZapnuty()) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    void ctx.resume?.();
    const t = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t);
    master.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    master.connect(ctx.destination);
    // Základ + nesúzvučný alikvot = kov, nie píšťalka.
    for (const [f, g] of [[196, 1], [523, 0.35], [787, 0.18]] as const) {
      const o = ctx.createOscillator(); const gn = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(f, t);
      gn.gain.setValueAtTime(g, t);
      o.connect(gn); gn.connect(master);
      o.start(t); o.stop(t + 2.7);
    }
  } catch { /* bez zvuku sa nič nedeje */ }
}
