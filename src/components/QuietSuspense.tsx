import { Component, Suspense, type ReactNode } from 'react';

/**
 * `Suspense` s NULOVÝM fallbackom a tichou poistkou pre globálne lazy prvky (toastery, súhlas, AINUBIS, výzvy).
 * Bez siete (SOS bez signálu, 21. 11. 2026) zlyhané stiahnutie ich kódu vyhodilo chybu nad `ErrorBoundary` obrazoviek
 * a celá appka zmizla (čierna plocha). Prvok, ktorý sa nenačíta, sa jednoducho neukáže; zvyšok stránky žije ďalej.
 */
class Quiet extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.warn('[QuietSuspense] globálny prvok sa nenačítal:', error); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function QuietSuspense({ children }: { children: ReactNode }) {
  return <Quiet><Suspense fallback={null}>{children}</Suspense></Quiet>;
}
