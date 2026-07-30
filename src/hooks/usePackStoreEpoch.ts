// usePackStoreEpoch — „prečítaj si to znova" signál pre /pack povrchy (issue #32).
//
// Čítačky stavu výletov (`readWalkedIds`, `readVotes`, `readTriplist`…) sú zámerne
// SYNCHRÓNNE a bežia v useState/useMemo inicializátoroch — vďaka tomu si prepis na
// Supabase nevyžiadal refaktor pol /packu. Cena je jedna: keď hydratácia dobehne
// (o pár stoviek ms po mounte), komponenty držia ešte predhydratačný stav.
//
// Tento hook vráti číslo, ktoré sa po hydratácii zvýši. Použitie = dependency:
//   const epoch = usePackStoreEpoch();
//   useEffect(() => { setWalkedIds(readWalkedIds()); }, [epoch]);
import { useEffect, useState } from 'react';
import { isPackStoreHydrated, onPackStoreHydrated } from '@/lib/packStore';

export function usePackStoreEpoch(): number {
  const [epoch, setEpoch] = useState(() => (isPackStoreHydrated() ? 1 : 0));
  useEffect(() => onPackStoreHydrated(() => setEpoch((e) => e + 1)), []);
  return epoch;
}
