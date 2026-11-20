// ÚRADY A POMOC pre „Nahlásiť nebezpečenstvo“ (20. 11. 2026). BEZ IMPORTOV — `deploy-edge.sh` z tohto súboru
// generuje `functions/_shared/danger-authorities.gen.ts`, odkiaľ `danger-send` berie e-mail úradu
// (klient posiela len `code`, nikdy adresu).
// Zdroj: plany/tyranie-nahlasenie-research-2026-11-20.md §1.3, 1.4, 2.1, 2.3 (čítané 20. 11. 2026).
// Zelená linka MŽP a staré čísla Slobody zvierat sem NEPATRIA (research 1.4).

export type DangerAuthorityKind = 'rvps' | 'svps' | 'enviro' | 'ngo' | 'cz_svs' | 'cz_ngo';

export interface DangerAuthority {
  /** napr. 'SK-RVPS-TN', 'SK-SVPS', 'SK-ENVIRO-TN', 'SK-LINKA', 'CZ-SVS' */
  code: string;
  kind: DangerAuthorityKind;
  country: 'SK' | 'CZ';
  name: string;
  phone: string | null;
  protectionPhone?: string | null;
  email: string | null;
  healthEmail?: string | null;
  /** okresy, ktoré správa pokrýva (rgeocode názov bez „okres“) */
  districts?: string[];
  web?: string | null;
}

export const DANGER_AUTHORITIES: DangerAuthority[] = [
  // balík A doplní všetkých 40 RVPS + ŠVPS + enviropolíciu + mimovládky + CZ
];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^okres\s+/, '').trim();

/** Okres z rgeocode → RVPS (Bratislava I–V → BA, Košice I–IV → KE). Nezhoda = null (UI ponúkne výber zo 40). */
export function rvpsForDistrict(name: string | null | undefined): DangerAuthority | null {
  if (!name) return null;
  const n = norm(name).replace(/\s+[ivx]+$/, '');
  return DANGER_AUTHORITIES.find((a) => a.kind === 'rvps' && (a.districts ?? []).some((d) => norm(d) === n)) ?? null;
}

export const authorityByCode = (code: string) => DANGER_AUTHORITIES.find((a) => a.code === code) ?? null;
