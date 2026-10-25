// DOBROVOĽNÝ DAR — sumy, poplatok a mesačná prevádzka (24. 10. 2026).
// Nákres plany/nakres-milodar-2026-10-24.html · stránka /carry ZMAZANÁ 24. 10. (Matej: blok v /profile) · server `prispevok` (+ `_shared/prispevok.ts`).
// Poplatok Stripe berie z tej istej `pokladnica.json` (zo `sluzby.js`) ako pokladnica — jedno číslo, nie dve.
import DATA from '@/data/pokladnica.json';

export const GIFT_TIERS = [
  { eur: 3, key: 'bite' },
  { eur: 5, key: 'portion' },
  { eur: 8, key: 'sack' },
  { eur: 12, key: 'pantry' },
] as const;
export const GIFT_DEFAULT = 5;
/** Rovnaké hranice ako server (`GIFT_MIN`/`GIFT_MAX`) — pod 3 € by Stripe zobral priveľa. */
export const GIFT_MIN = 3;
export const GIFT_MAX = 500;
/** Stripe Billing pri predplatnom (~0,7 % z obratu) — mimo `sluzby.js`, lebo platí len pre mesačný dar. */
export const BILLING_PCT = 0.7;
export const CARD_NON_EU = { pct: 3.25, fix: 0.25 };

type Sluzba = { id: string; nazov: string; mena: 'EUR' | 'USD'; cena?: number; obd?: string; platby?: { d: string; cena: number }[]; poplatok?: { pct: number; fix: number } };
const D = DATA as { kurzUsd: number; sluzby: Sluzba[] };
const STRIPE = D.sluzby.find((s) => s.poplatok)?.poplatok ?? { pct: 1.5, fix: 0.25 };
export const CARD_EU = STRIPE;

const r2 = (n: number) => Math.round(n * 100) / 100;
/** Koľko z daru zoberie Stripe (karta z EÚ). */
export const giftFee = (eur: number, monthly: boolean) =>
  r2((eur * STRIPE.pct) / 100 + STRIPE.fix + (monthly ? (eur * BILLING_PCT) / 100 : 0));

/** Bežný mesiac prevádzky: mesačné služby + ročné / 12 + posledná platba služieb platených podľa spotreby.
 *  Jednorazové (`raz`) a poplatok Stripe sa nerátajú — nie sú to stále náklady. */
export function prevadzkaMesacne() {
  const eur = (s: Sluzba, x: number) => (s.mena === 'USD' ? x * D.kurzUsd : x);
  const mesacne: { id: string; nazov: string; eur: number }[] = [];
  const rocne: { id: string; nazov: string; eur: number }[] = [];
  for (const s of D.sluzby) {
    if (s.cena && s.obd === 'mes') mesacne.push({ id: s.id, nazov: s.nazov, eur: eur(s, s.cena) });
    else if (s.cena && s.obd === 'rok') rocne.push({ id: s.id, nazov: s.nazov, eur: eur(s, s.cena) / 12 });
    else if (s.platby?.length) {
      // Dobíjaný kredit (Kie.ai): priemer = súčet platieb / mesiace od prvej po dnešok vrátane, NIE posledná platba
      // ako mesačná (Matej 25. 10. 2026 — Kie platený v marci a októbri, nie každý mesiac).
      const [y, m] = s.platby[0].d.split('-').map(Number);
      const now = new Date();
      const months = Math.max(1, (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m) + 1);
      const sum = s.platby.reduce((a, q) => a + q.cena, 0);
      mesacne.push({ id: s.id, nazov: s.nazov, eur: eur(s, sum / months) });
    }
  }
  mesacne.sort((a, b) => b.eur - a.eur);
  const spolu = [...mesacne, ...rocne].reduce((a, q) => a + q.eur, 0);
  return { mesacne, rocne: rocne.reduce((a, q) => a + q.eur, 0), rocneNazvy: rocne.map((q) => q.nazov), spolu };
}
