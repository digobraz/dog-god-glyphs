// ─────────────────────────────────────────────────────────────────────────────
// ODHAD ČASU VÝLETU — SAC / DIN 33466 (Matej 2026-08-25: „pridaj tam aj čas… musí tam byť
// súčis s klesaním/stúpaním").
//
// ⚠️ ČÍSLO JE ODHAD A MUSÍ SA TAK TVÁRIŤ. Appka nevie, koľko ste stáli pri potoku a ako často
// pes obchádzal stopy. Preto sa píše „~2 h 10 m", nie „2:10" — dvojbodka vyzerá ako údaj
// z hodiniek. Matej 25. 8.: „reálny čas psíčkara sa strieľa ťažko, preto by som dal štandard
// a časom si každý vie upraviť podľa seba."
//
// VZOREC = SAC / DIN 33466, teda to, na čom stojí značenie v Alpách aj Outdooractive:
//   vodorovná zložka  = km / 4
//   zvislá zložka     = stúpanie / 300 + klesanie / 500
//   spolu             = VÄČŠIA + polovica menšej
//
// ⚠️ TO „+ POLOVICA MENŠEJ" JE JADRO, NIE ZAOKRÚHĽOVANIE. Naivné sčítanie oboch zložiek
// predpokladá, že stúpanie sa deje NAVYŠE ku chôdzi — lenže kým stúpaš, zároveň prejdeš
// kilometre. Naismith (km/5 + stúpanie/600), ktorý tu bol do 25. 8., sčítaval naplno
// a navyše **klesanie ignoroval úplne**: rovnaká trasa hore aj dole mu vyšla rovnako.
//
// ⚠️ PREČO NIE STRAVA GAP (tempo podľa sklonu úsek po úseku): GAP je prepočet NAMERANÉHO
// tempa, nie odhad dopredu, a potrebuje istý výškový profil. Ten pri kreslení istý nie je —
// výšky sa doťahujú po dávkach.
//
// 🔴 SAC RÁTA ČISTÝ POHYB. Psí výlet stojí — pri stope, pri vode, pri každom druhom psovi.
// Kalibračný bod od Mateja zatiaľ nie je, takže tu stojí norma. Keď dodá reálny čas známeho
// výletu, mení sa `PACE_KMH` a nič iné.
// ─────────────────────────────────────────────────────────────────────────────

/** Vodorovné tempo (km/h). SAC norma = 4. */
export const PACE_KMH = 4;
/** Stúpanie za hodinu (m). SAC norma = 300. */
export const ASCENT_M_PER_H = 300;
/** Klesanie za hodinu (m). SAC norma = 500 — dole sa ide rýchlejšie, ale nie zadarmo. */
export const DESCENT_M_PER_H = 500;

/**
 * Odhad v MINÚTACH, alebo null keď sa nedá povedať nič poctivé.
 *
 * Chýbajúce prevýšenie NIE JE dôvod nevrátiť nič — vodorovná zložka je známa a je to väčšina
 * času; po dotiahnutí výšok sa číslo samo posunie nahor.
 */
export function estimateTripMinutes(km: number, ascentM: number | null, descentM: number | null): number | null {
  if (!Number.isFinite(km) || km <= 0) return null;
  const flat = km / PACE_KMH;
  const up = ascentM && ascentM > 0 ? ascentM / ASCENT_M_PER_H : 0;
  const down = descentM && descentM > 0 ? descentM / DESCENT_M_PER_H : 0;
  const vert = up + down;
  const total = Math.max(flat, vert) + Math.min(flat, vert) / 2;
  return Math.round(total * 60);
}

/**
 * „~2 h 10 min" / „~45 min". Vlnovka je súčasť hodnoty, nie ozdoba. Zaokrúhľuje sa na 5 minút —
 * presnosť na minútu by pri odhade klamala.
 *
 * ⚠️ MINÚTY SÚ „min", NIE „m" (Matej 2026-08-26: „daj skratku min nie len m"). V pilulke
 * čítania stojí čas hneď vedľa prevýšenia — „↑ 120 m · ~10 m" boli dva rôzne údaje v tej
 * istej skratke a druhý z nich sa dal prečítať ako ďalšie metre. „m" ostáva vyhradené
 * metrom; hodiny sú naďalej „h", tie sa s ničím nebijú.
 */
export function formatTripTime(minutes: number | null | undefined): string | null {
  if (minutes === null || minutes === undefined || minutes <= 0) return null;
  const r = Math.max(5, Math.round(minutes / 5) * 5);
  const h = Math.floor(r / 60);
  const m = r % 60;
  return h > 0 ? (m ? `~${h} h ${m} min` : `~${h} h`) : `~${m} min`;
}
