import { Component, type ErrorInfo, type ReactNode } from 'react';
import { SosNoSignal } from '@/components/SosNoSignal';

/**
 * Top-level render-error safety net (P1 2026-07 perf/hardening pass).
 *
 * Wraps <Routes> in App.tsx — without this, ANY uncaught render throw (e.g. a
 * missing translation shape, a bad prop) whitescreens the whole app. Texts are
 * hardcoded (no i18n dependency), since the i18n context itself could be
 * the thing that threw.
 *
 * Šat (Matej 20. 11. 2026: „čierna stránka s reloadom je ešte starý brand prvok“):
 * papyrus + lapisové CTA (na bledom podklade je hlavné CTA LAPIS), nie čierna so zlatým tlačidlom.
 * Hodnoty sú opísané z `PACK_THEME` a `LAPIS` zámerne — poistka nesmie ťahať moduly, ktoré mohli spadnúť.
 */

type Props = { children: ReactNode };
type State = { hasError: boolean; error: unknown };

/** SOS cesta (`/pack/sos/…`) a zlyhané stiahnutie kódu / sieť: namiesto „Niečo sa pokazilo“ ide obrazovka „Si bez signálu“ s 112. */
const isSosPath = () => typeof window !== 'undefined' && /^\/pack\/sos(\/|$)/.test(window.location.pathname);
const isLoadFailure = (e: unknown) =>
  (typeof navigator !== 'undefined' && navigator.onLine === false)
  || /dynamically imported module|Importing a module script failed|Failed to fetch|ChunkLoadError|Load failed|Loading (CSS )?chunk/i.test(String((e as { message?: string } | null)?.message ?? e));

const TEXT: Record<string, { title: string; reload: string; back: string }> = {
  sk: { title: 'Niečo sa pokazilo.', reload: 'Načítať znova', back: 'Späť' },
  cs: { title: 'Něco se pokazilo.', reload: 'Načíst znovu', back: 'Zpět' },
  en: { title: 'Something went wrong.', reload: 'Reload', back: 'Back' },
};

function pickText() {
  let l = '';
  try { l = localStorage.getItem('dogypt_lang') || ''; } catch { /* bez úložiska ide jazyk prehliadača */ }
  if (!l && typeof document !== 'undefined') l = document.documentElement.lang || '';
  if (!l && typeof navigator !== 'undefined') l = navigator.language || '';
  return TEXT[l.slice(0, 2).toLowerCase()] ?? TEXT.en;
}

const BTN = {
  fontFamily: "'Cinzel', serif",
  fontWeight: 700,
  fontSize: '16px',
  borderRadius: '8px',
  padding: '0 24px',
  height: '48px',
  cursor: 'pointer',
} as const;

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  /** Z obrazovky „Si bez signálu“ do už stiahnutej časti SOS: SPA prechod bez načítania stránky (offline by sa nenačítala). */
  private goSos = (path: string) => {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    this.setState({ hasError: false, error: null });
  };

  // Šípka späť z obrazovky „Si bez signálu“: stav chyby sa zruší, inak by stránka ostala zaseknutá aj po návrate na funkčnú cestu.
  private onPop = () => { if (this.state.hasError) this.setState({ hasError: false, error: null }); };
  componentDidMount() { window.addEventListener('popstate', this.onPop); }
  componentWillUnmount() { window.removeEventListener('popstate', this.onPop); }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] uncaught render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (isSosPath() && isLoadFailure(this.state.error)) return <SosNoSignal onGo={this.goSos} />;
      const t = pickText();
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(180deg, #F2E5C7, #E5D5B3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '16px',
            textAlign: 'center',
            zIndex: 9999,
          }}
        >
          <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: '#2a1608', fontSize: '24px', margin: 0 }}>{/* písmo: nadpis */}
            {t.title}
          </h1>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => { if (window.history.length > 1) window.history.back(); else window.location.assign('/pack'); setTimeout(() => window.location.reload(), 150); }}
              style={{ ...BTN, color: '#2a1608', background: 'transparent', border: '1px solid rgba(42,22,8,.35)' }}
            >{/* písmo: cta */}
              {t.back}
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{ ...BTN, color: '#EFD79A', background: 'linear-gradient(180deg,#16307A,#0A1A4A)', border: '1px solid #0A1A4A' }}
            >{/* písmo: cta */}
              {t.reload}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
