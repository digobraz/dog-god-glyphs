import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import dogyptLogoMobile from '@/assets/dogypt-logo-mobile.png';
import { useT } from '@/i18n/LanguageContext';
import { PageNav } from './PageNav';

interface PageTopBarProps {
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
export function PageTopBar({
  withNav = false,
  onBack,
  backAriaLabel,
}: PageTopBarProps) {
  const t = useT();
  const backLabel = backAriaLabel ?? t('nav.aria.back');
  // Jednotné stmavenie headeru — Egyptian-modré, fade do obsahu. Je súčasťou KOMPONENTU
  // (nie page-level scrim), takže každý header vyzerá rovnako nezávisle od page transformov
  // (Vision/Religion/About vrátane absolútneho crawl-hero + všetky flow screens).
  // Solid od vrchu (nepresvitavý), ostrá tmavomodrá z flow brand gradientu (#1034A6 → tmavá),
  // fade až v spodnej časti. Matej: „od vrchu musí byť solid + viac modrej ako vo flow gradiente."
  const headerScrim =
    'linear-gradient(to bottom, #0b1838 0%, #0b1838 60%, rgba(11,24,56,0) 100%)';
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
        className="flex-shrink-0 relative flex flex-col items-center justify-center gap-1 md:gap-0 px-5 md:px-0 pb-2 md:pb-3 pt-[15px] md:pt-[34px]"
        style={{ zIndex: 2, background: headerScrim }}
      >
        <Link to="/grid" aria-label="WALL" className="flex-shrink-0 md:mb-1">
          {logo}
        </Link>
        <PageNav />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 flex items-center justify-center relative pt-[15px] pb-3 px-4 md:pt-5" style={{ background: headerScrim }}>
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
    </div>
  );
}
