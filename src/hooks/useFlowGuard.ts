import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';

// Route guard — chráni flow screeny pred deep-linkom / refresh uprostred flow.
// Store nepersistuje buyer dáta (partialize len selectedTier+selectedAmount),
// takže refresh uprostred flow vyprázdni store a screen by sa vykreslil rozbitý.
// Vzor pozri v PaymentScreen.tsx (~riadky 48-55).
//
// ⚠️ NEVOLAJ HO NA PRVOM KROKU FLOW. Guard stojí na `dogName`, a od 28. 8. 2026 je
// prvým krokom fotka — teda obrazovka, ktorá beží ešte PRED menom. PhotoScreen ho
// preto zámerne nemá; keby ho mal, každý príchod by skončil presmerovaním na
// /heroglyph a flow by sa nedal ani začať.
export function useFlowGuard(): boolean {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);

  useEffect(() => {
    if (!dogName) {
      navigate('/heroglyph/photo', { replace: true });
    }
  }, [dogName, navigate]);

  return !!dogName;
}
