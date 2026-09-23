import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { FLOW_FIRST_STEP } from '@/lib/flowMode';

// Route guard — chráni flow screeny pred deep-linkom / refresh uprostred flow.
// Store nepersistuje buyer dáta (partialize len selectedTier+selectedAmount),
// takže refresh uprostred flow vyprázdni store a screen by sa vykreslil rozbitý.
// Vzor pozri v PaymentScreen.tsx (~riadky 48-55).
//
// ⚠️ NEVOLAJ HO NA PRVOM KROKU FLOW. Guard stojí na `dogName`, a od 28. 8. 2026 je
// prvým krokom fotka — teda obrazovka, ktorá beží ešte PRED menom. PhotoScreen ho
// preto zámerne nemá; keby ho mal, každý príchod by skončil presmerovaním na
// /heroglyph a flow by sa nedal ani začať.
// `enabled: false` guard vypne (obrazovka je v danom režime PRVÝM krokom, takže
// meno ešte nemôže existovať). Hook sa musí volať vždy — vypína sa parametrom,
// nie podmieneným volaním.
export function useFlowGuard(enabled = true): boolean {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);

  useEffect(() => {
    if (enabled && !dogName) {
      navigate(FLOW_FIRST_STEP, { replace: true });
    }
  }, [enabled, dogName, navigate]);

  return enabled ? !!dogName : true;
}
