import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Top-level render-error safety net (P1 2026-07 perf/hardening pass).
 *
 * Wraps <Routes> in App.tsx — without this, ANY uncaught render throw (e.g. a
 * missing translation shape, a bad prop) whitescreens the whole app. Texts are
 * hardcoded EN (no i18n dependency), since the i18n context itself could be
 * the thing that threw.
 */

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] uncaught render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '24px',
            textAlign: 'center',
            zIndex: 9999,
          }}
        >
          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              color: '#C99A3F',
              fontSize: '24px',
              margin: 0,
            }}
          >
            Something went wrong.
          </h1>
          <button
            onClick={() => window.location.reload()}
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              color: '#000',
              background: 'linear-gradient(135deg, #F5C73D, #E69E1A)',
              border: '1px solid rgba(250, 244, 236, 0.30)',
              borderRadius: '8px',
              padding: '12px 28px',
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
