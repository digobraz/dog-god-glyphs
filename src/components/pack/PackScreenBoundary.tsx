import { Component, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useT, useLang } from '@/i18n/LanguageContext';
import { FONT_TITLE, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_THEME as T } from './packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from './navGoldSkin';

/**
 * Poistka JEDNEJ obrazovky /pack (audit 23. 11. 2026): pád renderu v obsahu nezhodí celý strom,
 * takže spodná lišta a hlavička ostanú. Globálny ErrorBoundary v App.tsx ostáva ako druhá sieť.
 * Reset pri zmene cesty (`resetKey`), tlačidlo „Načítať znova“ = reset a pri opakovaní reload.
 */

type Props = { children: ReactNode; resetKey: string };
type State = { chyba: boolean; pokusy: number };

const FALLBACK: Record<string, { title: string; reload: string }> = {
  sk: { title: 'Táto obrazovka sa nenačítala.', reload: 'Načítať znova' },
  cs: { title: 'Tato obrazovka se nenačetla.', reload: 'Načíst znovu' },
  en: { title: 'This screen failed to load.', reload: 'Reload' },
};

function Chyba({ onReload }: { onReload: () => void }) {
  const t = useT();
  const { lang } = useLang();
  const f = FALLBACK[lang] ?? FALLBACK.en;
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  return (
    <div role="alert" style={{ padding: PACK_SPACE.lg }}>
      <div style={{ ...PACK_BOX.card, padding: PACK_SPACE.xl, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: PACK_SPACE.lg, textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_TITLE /* písmo: nadpis */, fontWeight: 700, fontSize: PACK_TEXT.lead, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.ink }}>
          {tx('pack.screenError.title', f.title)}
        </div>
        <button
          type="button"
          onClick={onReload}
          style={{
            background: LAPIS.grad, color: LAPIS.ink, border: 'none', borderRadius: PACK_R.field,
            padding: `${PACK_SPACE.md}px ${PACK_SPACE.xl}px`, fontFamily: FONT_TITLE /* písmo: cta */, fontWeight: 700,
            fontSize: PACK_TEXT.label, letterSpacing: '0.22em', textTransform: 'uppercase', boxShadow: LAPIS_BTN_SHADOW, cursor: 'pointer',
          }}
        >
          {tx('pack.screenError.reload', f.reload)}
        </button>
      </div>
    </div>
  );
}

class Hranica extends Component<Props, State> {
  state: State = { chyba: false, pokusy: 0 };
  static getDerivedStateFromError(): Partial<State> { return { chyba: true }; }
  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.chyba) this.setState({ chyba: false, pokusy: 0 });
  }
  private znova = () => {
    // Prvý pokus: len prekresli; ak padne znova (napr. starý chunk po deployi), obnov stránku.
    if (this.state.pokusy >= 1) { window.location.reload(); return; }
    this.setState((s) => ({ chyba: false, pokusy: s.pokusy + 1 }));
  };
  render() {
    return this.state.chyba ? <Chyba onReload={this.znova} /> : this.props.children;
  }
}

export function PackScreenBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <Hranica resetKey={pathname}>{children}</Hranica>;
}
