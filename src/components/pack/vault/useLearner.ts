// UČEŇ — štúdium vo VAULTe ako level (6. 11. 2026). JEDEN výpočet pre každý vlastný povrch
// (profil, úprava profilu, hlavička AINUBISA, Moje štúdium) — číslo sa nikde nepočíta druhýkrát.
//
// ULOŽENIE = `human.learner` { level, pct, at } v `pack_profiles` (tá istá cesta ako PÚTNIK
// `human.pilgrim`). Level NIKDY NEKLESÁ: DB drží najvyšší dosiahnutý a výpočet ho berie ako dno.
// Zápis ide len NAHOR (alebo keď sa v tom istom leveli pohne postup) a až keď je postup
// načítaný z DB — inak by prázdny štart prepísal postup nulou.
// Cudzí profil a SNIFFER čítajú `human.learner` priamo, tento hook nevolajú.
import { useEffect } from 'react';
import { saveHuman, useProfile } from '@/components/pack/profile/packProfile';
import { learnerProgress } from '@/components/pack/profile/rankBadge';
import { useReadsReady, useScrollState } from './vaultScrolls';
import { VAULT_WORLDS } from './worlds';

/** Menovateľ = PLÁN VAULTu (súčet `worlds.ts`), nie dnes zverejnené zvitky — ten istý ako % v AINUBISovi. */
export const VAULT_TOTAL = VAULT_WORLDS.reduce((s, w) => s + w.scrolls, 0);

/** `blank` = náhľad nováčika (nič nezverejní a ukáže nulu). */
export function useLearner(blank = false) {
  const { profile } = useProfile();
  const ready = useReadsReady();
  const zstate = useScrollState();
  const read = blank ? 0 : Object.values(zstate).filter((v) => v === 2).length;
  const saved = profile?.human?.learner;
  const floor = blank ? 0 : saved?.level ?? 0;
  const l = learnerProgress(read, VAULT_TOTAL, floor);
  const pct = Math.round(l.pct);
  useEffect(() => {
    if (blank || !profile || !ready || l.level === 0) return;
    if (saved && (saved.level > l.level || (saved.level === l.level && saved.pct === pct))) return;
    const h = setTimeout(() => { void saveHuman({ learner: { level: l.level, pct, at: new Date().toISOString() } }); }, 4000);
    return () => clearTimeout(h);
  }, [blank, profile, ready, l.level, pct, saved]);
  return { read, total: VAULT_TOTAL, floor, level: l.level, pct: l.pct, share: l.share, ready };
}
