import { Component, type ReactNode } from 'react';

// App-wide safety net: if any route throws at render (or a lazy chunk fails
// past its retry), show a light, friendly reload screen instead of leaving the
// user on a blank dark page (the app-shell background showing through an
// unmounted tree).

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('[app] render error caught by ErrorBoundary', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: '#F5F8FC',
          color: '#0F172A',
          textAlign: 'center',
          padding: 24,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 44 }} aria-hidden="true">⚠️</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Something went wrong</h1>
        <p style={{ color: '#475569', margin: 0 }}>Please reload the page to continue.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 26px',
            borderRadius: 9999,
            border: 'none',
            background: '#F97316',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </div>
    );
  }
}
