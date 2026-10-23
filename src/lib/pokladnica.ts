// POKLADNICA — príjem vs. náklady po mesiacoch (Matej 23. 10. 2026, nákres `plany/nakres-pokladnica-2026-10-23.html`).
// Pravidlá nákladov = `src/data/pokladnica.json`, ktorý generuje `scripts/gen-pokladnica.mjs` zo `sluzby.js`
// (dashboard → Náklady). Príjem po mesiacoch = `get-dashboard-stats.revenue_by_month`.
// Mesiace sa rátajú k DNEŠKU — účet (aj hodiny práce) rastie sám, generátor treba len pri zmene služby.
// 🔴 ZRKADLO: rovnaké pravidlá počíta DOGYPTLAND (`scripts/svet/dogyptland.html`, `pokladnicaMesiace`).
//    Zmena pravidla = zmena na oboch miestach, inak appka a DOGYPTLAND ukážu iný súčet.
import DATA from '@/data/pokladnica.json';

type Sluzba = {
  id: string; nazov: string; mena: 'EUR' | 'USD';
  cena?: number; obd?: string; od?: string;
  platby?: { d: string; cena: number }[];
  poplatok?: { pct: number; fix: number };
};
/** `eur` = všetky platby (z nich poplatok Stripe) · `rozvoj` = podiel Rozvoja komunity — JEDINÝ príjem v pokladnici rozvoja. */
export type PrijemMesiac = { m: string; eur: number; n: number; rozvoj?: number };
export type Polozka = { id: string; nazov: string; eur: number };
export type Mesiac = { m: string; prijem: number; naklady: number; polozky: Polozka[] };

const D = DATA as { kurzUsd: number; praca: { od: string; hodinMesacne: number; sadzba: number }; sluzby: Sluzba[] };

const idx = (m: string) => { const [y, mo] = m.split('-').map(Number); return y * 12 + (mo - 1); };
const mStr = (i: number) => `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`;

export function pokladnica(prijmy: PrijemMesiac[], dnes = new Date()) {
  const teraz = dnes.getFullYear() * 12 + dnes.getMonth();
  const start = Math.min(idx(D.praca.od), ...D.sluzby.filter((s) => s.od).map((s) => idx(s.od!)));
  const eur = (s: Sluzba, x: number) => (s.mena === 'USD' ? x * D.kurzUsd : x);
  const mesiace: Mesiac[] = [];
  for (let i = start; i <= teraz; i++) {
    const m = mStr(i);
    const p = prijmy.find((r) => r.m === m);
    const polozky: Polozka[] = [];
    for (const s of D.sluzby) {
      let x = 0;
      if (s.od && s.cena) {
        const k = i - idx(s.od);
        if (k >= 0 && (s.obd === 'mes' || (s.obd === 'rok' && k % 12 === 0) || (s.obd === 'raz' && k === 0))) x += eur(s, s.cena);
      }
      for (const pl of s.platby ?? []) if (pl.d === m) x += eur(s, pl.cena);
      if (s.poplatok && p) x += p.n * s.poplatok.fix + (p.eur * s.poplatok.pct) / 100;
      if (x > 0) polozky.push({ id: s.id, nazov: s.nazov, eur: x });
    }
    polozky.sort((a, b) => b.eur - a.eur);
    mesiace.push({ m, prijem: p?.rozvoj ?? 0, naklady: polozky.reduce((a, q) => a + q.eur, 0), polozky });
  }
  const hodiny = Math.max(0, teraz - idx(D.praca.od) + 1) * D.praca.hodinMesacne;
  return {
    mesiace: mesiace.reverse(),
    prijem: mesiace.reduce((a, q) => a + q.prijem, 0),
    naklady: mesiace.reduce((a, q) => a + q.naklady, 0),
    praca: { hodiny, sadzba: D.praca.sadzba, eur: hodiny * D.praca.sadzba, mesacne: D.praca.hodinMesacne },
  };
}

/** Zostatok šuplíka Rozvoj komunity = jeho podiel z heroglyfov (5 + 3) mínus náklady, nikdy pod nulu. */
export const rozvojZostatok = (dev: number, affiliate: number, naklady: number) => Math.max(0, dev + affiliate - naklady);
