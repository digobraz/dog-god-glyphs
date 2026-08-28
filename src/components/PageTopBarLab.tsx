// ════════════════════════════════════════════════════════════════════════════
// WALL LAB — PAPYRUSOVÁ HORNÁ LIŠTA (DEV ONLY, iba pre *-lab stránky)
// ────────────────────────────────────────────────────────────────────────────
// 1:1 kópia `PageTopBar.tsx` (LOCKED 2026-05-26). Lock sa TÝMTO NEPORUŠUJE —
// originál ostáva nedotknutý, toto je oddelené pieskovisko svetlého režimu.
// Rovnaká geometria (mobile pt 15px, silueta h-10 / full h-12), mení sa len to,
// čo musí: nav je papyrusový (`PageNavLab`) a logo vedie na `/wall-lab`.
// Logá sú zlaté na priehľadnom (#C9A247) → na papyruse držia, netreba variant.
// ════════════════════════════════════════════════════════════════════════════
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import dogyptLogoMobile from '@/assets/dogypt-logo-mobile.png';
import { useT } from '@/i18n/LanguageContext';
import { PageNavLab } from './PageNavLab';
import LanguagePicker from './LanguagePicker';

interface PageTopBarLabProps {
  /**
   * Vision / About / Codex layout: logo + PageNav.
   * Row on mobile (logo + hamburger), column on desktop (logo above nav).
   * When false (default): plain centered logo, used by heroglyph flow screens.
   */
  withNav?: boolean;
  /** Show back-arrow on left. Heroglyph flow screens pass step-specific handler. */
  onBack?: () => void;
  /** Aria label for back button. */
  backAriaLabel?: string;
}

/**
 * DOGYPT canonical top-bar.
 * Mobile pt = 15px (LOCKED 2026-05-26). Mobile logo = silueta h-10
 * (dogypt-logo-mobile.png, bez DOG YPT cartouche); desktop = full logo h-12.
 * Every new page that needs a top logo MUST use this component.
 */
export function PageTopBarLab({
  withNav = false,
  onBack,
  backAriaLabel,
}: PageTopBarLabProps) {
  const t = useT();
  const backLabel = backAriaLabel ?? t('nav.aria.back');
  const logo = (
    <>
      <img
        src={dogyptLogoMobile}
        alt="DOGYPT"
        className="h-10 object-contain md:hidden"
      />
      <img
        src={dogyptLogo}
        alt="DOGYPT"
        className="hidden md:block md:h-12 object-contain"
      />
    </>
  );

  if (withNav) {
    return (
      <div
        className="flex-shrink-0 relative flex flex-col items-center justify-center gap-1 md:gap-0 px-5 md:px-0 pb-1 md:pb-2 pt-[15px] md:pt-[25px]"
        style={{ zIndex: 2 }}
      >
        <Link to="/wall-lab" aria-label="WALL" className="flex-shrink-0 md:mb-1">
          {logo}
        </Link>
        <PageNavLab />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 flex items-center justify-center relative pt-[15px] pb-2 px-4 md:pt-[25px]">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label={backLabel}
          className="absolute left-4 top-[15px] p-2 text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      {logo}

      {/* Language picker — top-right (mirrors the back-arrow), off the edge. Whole flow
          inherits it (every flow screen uses this plain PageTopBar). */}
      <div className="absolute right-5 top-[12px] md:top-[20px]">
        <LanguagePicker variant="flow" />
      </div>
    </div>
  );
}
