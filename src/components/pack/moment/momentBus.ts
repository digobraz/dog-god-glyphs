// ZBERNICA MOMENTOV — `ukazMoment()` a `iskra()` volá udalosť, `MomentHost` (namontovaný raz v PackLayout) kreslí.
// Samostatný súbor, aby MomentHost.tsx exportoval len komponent (fast refresh).
import { moment, type MomentId } from '@/lib/momenty';
import { MOMENTY_ON } from '@/lib/env';

export interface MomentData {
  id: MomentId;
  /** Medaila, odznak alebo level (cesta k obrázku). Pečať ho nemá, nesie `cislo`. */
  obrazok?: string;
  /** Veľké číslo na pečati alebo v obrade (deň v rade, poradové číslo, roky). */
  cislo?: string | number;
  /** Ikonka udalosti na pečati (nálepka v rohu) — tá istá, ktorou sa úloha spúšťa (zápis dňa = `/icons/sys/pridaj-den.webp`). */
  ikona?: string;
  /** Malý text na pečati pod číslom („DEŇ V RADE“). */
  pecatText?: string;
  /** Stuha pod medailou („UČEŇ 4“, „STUPEŇ II“). */
  stuha?: string;
  eyebrow?: string;
  /** Nadpis — jedno slovo smie byť zlaté cez `<em>` (zlaté = len jedno slovo, Matej 6. 11.). */
  nadpis: string;
  podnadpis?: string;
  /** Celok, ku ktorému číslo smeruje („1 000 000“) — číslo psa sa ukazuje ako postup k severke, nie samo. */
  zCelku?: string;
  /** Medaila je lapisová (level, hodnosť), inak zlatá. */
  lapis?: boolean;
  /** Po zatvorení. */
  hotovo?: () => void;
}

export type Listener = (m: MomentData) => void;
export const listeners = new Set<Listener>();
export const fronta: MomentData[] = [];

/** Ukáž moment. Kým hostiteľ nie je namontovaný, počká vo fronte; dva momenty naraz idú po sebe. */
export function ukazMoment(m: MomentData): void {
  if (!listeners.size) { fronta.push(m); return; }
  listeners.forEach((l) => l(m));
}

/** ISKRA: prvok pod prstom pukne a vyšle krúžok. */
export function iskra(el: Element | null | undefined, id: MomentId): void {
  moment(id);
  if (!(el instanceof HTMLElement)) return;
  el.classList.remove('pk-iskra'); void el.offsetWidth; el.classList.add('pk-iskra');
  window.setTimeout(() => el.classList.remove('pk-iskra'), 600);
}


// Testovací kanál: moment sa dá vyvolať z konzoly (`dogyptMoment({ id: 'ucen', nadpis: 'Nový <em>level</em>' })`).
if (MOMENTY_ON && typeof window !== 'undefined') (window as unknown as { dogyptMoment: typeof ukazMoment }).dogyptMoment = ukazMoment;
