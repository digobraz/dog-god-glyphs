// KROK SPÄŤ = KROK PRED (Matej 26. 10. 2026: *„ak kliknem vo feede na výlet a potom sa vrátim, prídem na /map
// = zle … krok späť musí ísť na krok pred"*). Tlačidlo späť na celej obrazovke sa vracia tam, odkiaľ človek
// prišiel; pevná adresa je len NÁHRADA, keď predošlý krok v appke nie je (otvorené z odkazu, mailu, notifikácie).
//
// `history.state.idx` je index React Routera v rámci appky — 0 = prvá obrazovka tejto návštevy.
// ⚠️ NIE `history.length > 1`: to počíta aj stránky PRED appkou (Google, mail) a `navigate(-1)` by z appky odišiel.
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function canStepBack(): boolean {
  if (typeof window === 'undefined') return false;
  const idx = (window.history.state as { idx?: number } | null)?.idx;
  return typeof idx === 'number' && idx > 0;
}

/** `back()` → predošlý krok, inak `fallback`. */
export function useStepBack(fallback: string): () => void {
  const navigate = useNavigate();
  return useCallback(() => {
    if (canStepBack()) navigate(-1);
    else navigate(fallback);
  }, [navigate, fallback]);
}
