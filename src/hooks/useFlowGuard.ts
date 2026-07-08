import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';

// Route guard — chráni flow screeny pred deep-linkom / refresh uprostred flow.
// Store nepersistuje buyer dáta (partialize len selectedTier+selectedAmount),
// takže refresh uprostred flow vyprázdni store a screen by sa vykreslil rozbitý.
// Vzor pozri v PaymentScreen.tsx (~riadky 48-55).
export function useFlowGuard(): boolean {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);

  useEffect(() => {
    if (!dogName) {
      navigate('/heroglyph', { replace: true });
    }
  }, [dogName, navigate]);

  return !!dogName;
}
