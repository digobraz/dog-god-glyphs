// PRVÁ POMOC — tvar karty. Jazyk = celý súbor (aidSk · aidEn · aidCs), obrázky sú vo všetkých troch rovnaké.
// Stavba podľa klikacieho nákresu plany/nakresy/prva-pomoc-2026-11-16 (Matej 17. 11. 2026: kroky = variant A, zoznam).
export type AidGroup = 'A' | 'B' | 'C' | 'D';

export type AidCard = {
  id: string;
  group: AidGroup;
  /** Krátky názov na dlaždici rozcestníka. */
  tile: string;
  title: string;
  sub?: string;
  img: string;
  imgCap: string;
  /** Voľné fotky (PD/CC) pod kresbou; `znak` = štítok JEDOVATÁ / NEŠKODNÁ. */
  fotky?: { src: string; cap: string; znak?: 'zle' | 'ok' }[];
  porovnanie?: { img: string; h: string; l: string; r: string; t: string };
  dalsi?: { img: string; h: string; t?: string }[];
  vet?: { h: string; pre?: string; items: string[]; post?: string };
  spoznas?: string[];
  lead?: string[];
  kroky?: string[];
  /** Odškrtávací zoznam bez poradia (lekárnička). */
  zoznam?: string[];
  posledne?: { img: string; h: string; t: string };
  fakty?: { h: string; t: string }[];
  extra?: { h: string; t?: string; items?: string[]; pills?: boolean; after?: string; warn?: boolean }[];
  nikdy?: string[];
  bezSignalu?: string;
};

/** Odkaz z textu na inú kartu: výraz v texte → id karty. */
export type AidLinks = [RegExp, string][];
