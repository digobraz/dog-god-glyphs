import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';
import { PageTopBar } from '@/components/PageTopBar';
import hekthorImg from '@/assets/hekthor.png';
import breedsData from '@/data/breeds.json';
import { useT, useLang } from '@/i18n/LanguageContext';
import { localizeBreed } from '@/lib/breedDisplay';

type Breed = { id: number; en: string; sk: string; patron: string; group: string };
type BreedsFile = { version: string; breeds: Breed[] };
const BREEDS = (breedsData as BreedsFile).breeds;

const CATEGORIES: { id: string; name: string }[] = [
  { id: '01', name: 'Furballs' },
  { id: '02', name: 'Wooligans' },
  { id: '03', name: 'Antennas' },
  { id: '04', name: 'Speedsters' },
  { id: '05', name: 'Schnozzers' },
  { id: '06', name: 'Aristocrats' },
  { id: '07', name: 'Smushfaces' },
  { id: '08', name: 'Splashers' },
  { id: '09', name: 'Wolflikes' },
  { id: '10', name: 'Giants' },
];

const SVG_COUNTS: Record<string, number> = {
  '01': 9, '02': 11, '03': 7, '04': 8, '05': 7,
  '06': 8, '07': 10, '08': 6, '09': 6, '10': 9,
};

// Flat searchable list — name → group + canonical patron silhouette
const ALL_BREEDS: { name: string; category: string; patron: string }[] = BREEDS
  .map((b) => ({ name: b.en, category: b.group, patron: `${b.patron}.svg` }))
  .sort((a, b) => a.name.localeCompare(b.name));

const breedToPatron: Record<string, string> = Object.fromEntries(
  ALL_BREEDS.map((b) => [`${b.category}|${b.name}`, b.patron])
);

const svgsFor = (cat: string): string[] => {
  const n = SVG_COUNTS[cat] ?? 0;
  return Array.from({ length: n }, (_, i) => `${cat}-${String(i + 1).padStart(2, '0')}.svg`);
};

const patronUrl = (svg: string) => `/patrons/${svg}`;

// ── Breed search modal ───────────────────────────────────────────────────────
// iOS-safe pattern: always-mounted portal, input focused synchronously on tap,
// card kept above keyboard via visualViewport. See feedback_ios_input_modal_pattern.
interface BreedSearchModalProps {
  open: boolean;
  search: string;
  matches: { name: string; category: string; patron: string }[];
  title: string;
  placeholder: string;
  enHint: string;
  closeLabel: string;
  lang: string;
  rootRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  onSearchChange: (v: string) => void;
  onClear: () => void;
  onSelect: (name: string, cat: string) => void;
  onClose: () => void;
}

function BreedSearchModal({
  open, search, matches, title, placeholder, enHint, closeLabel, lang,
  rootRef, inputRef, onSearchChange, onClear, onSelect, onClose,
}: BreedSearchModalProps) {
  const [vp, setVp] = useState<{ top: number; height: number }>({ top: 0, height: 0 });
  useEffect(() => {
    const v = window.visualViewport;
    const update = () => {
      if (v) setVp({ top: v.offsetTop, height: v.height });
      else setVp({ top: 0, height: window.innerHeight });
    };
    update();
    v?.addEventListener('resize', update);
    v?.addEventListener('scroll', update);
    return () => {
      v?.removeEventListener('resize', update);
      v?.removeEventListener('scroll', update);
    };
  }, []);

  return createPortal(
    <div
      ref={rootRef}
      className={`breed-modal-root ${open ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      style={{ top: vp.top, height: vp.height || undefined, paddingTop: vp.height ? Math.round(vp.height * 0.07) : undefined }}
    >
      <div className="breed-modal-backdrop" onClick={onClose} />
      <div className="breed-modal-card">
        <button type="button" className="breed-modal-close" aria-label={closeLabel} onClick={onClose}>✕</button>
        <p className="breed-modal-title">{title}</p>
        <div className="breed-modal-search">
          <Search className="h-4 w-4 flex-shrink-0" style={{ color: 'rgba(0,0,0,0.45)' }} />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="words"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            className="breed-modal-input"
          />
          {search && (
            <button type="button" onClick={onClear} aria-label={closeLabel} style={{ color: 'rgba(0,0,0,0.4)' }}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {enHint && <p className="breed-modal-hint">{enHint}</p>}
        {matches.length > 0 && (
          <div className="breed-modal-matches">
            {matches.map((m) => (
              <button
                key={`${m.category}-${m.name}`}
                type="button"
                className="breed-modal-match"
                onClick={() => onSelect(m.name, m.category)}
              >
                <span>{localizeBreed(m.name, lang)}</span>
                <img src={patronUrl(m.patron)} alt="" className="h-6 w-6 object-contain opacity-90" />
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .breed-modal-root {
          position: fixed; left: 0; right: 0; z-index: 2100;
          display: flex; flex-direction: column; align-items: center;
          padding-left: 16px; padding-right: 16px;
          opacity: 0; pointer-events: none; transition: opacity 160ms ease;
        }
        .breed-modal-root.is-open { opacity: 1; pointer-events: auto; }
        .breed-modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.78);
          -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
        }
        .breed-modal-card {
          position: relative; z-index: 1; width: 100%; max-width: 520px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid rgba(201,154,63,0.55); border-radius: 16px;
          padding: 22px 16px 16px; box-shadow: 0 20px 64px rgba(0,0,0,0.65);
          display: flex; flex-direction: column; gap: 12px;
          transform: translateY(8px) scale(0.97); transition: transform 220ms cubic-bezier(0.2,0.8,0.3,1.1);
        }
        .breed-modal-root.is-open .breed-modal-card { transform: translateY(0) scale(1); }
        .breed-modal-close {
          position: absolute; top: 12px; right: 14px; background: none; border: none;
          cursor: pointer; font-size: 14px; color: rgba(0,0,0,0.4); line-height: 1; padding: 4px;
        }
        .breed-modal-title {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 1rem;
          text-align: center; color: hsl(var(--gold-dark)); margin: 0; padding: 0 20px;
        }
        .breed-modal-search {
          display: flex; align-items: center; gap: 8px;
          background: #FFFDF7; border-radius: 12px; padding: 12px 14px;
          border: 2px solid rgba(47,107,255,0.45);
          box-shadow: 0 0 12px rgba(47,107,255,0.28);
        }
        .breed-modal-input {
          flex: 1; background: transparent; outline: none; border: none;
          color: #1a1208; font-size: 16px; font-family: 'Space Grotesk', sans-serif;
        }
        .breed-modal-input::placeholder { color: rgba(0,0,0,0.35); }
        .breed-modal-hint {
          margin: -2px 2px 0; font-family: 'Space Grotesk', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.5); text-align: center;
        }
        .breed-modal-matches {
          display: flex; flex-direction: column;
          border: 1px solid rgba(201,154,63,0.4); border-radius: 12px; overflow: hidden;
          max-height: 46vh; overflow-y: auto;
        }
        .breed-modal-match {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 14px; background: rgba(255,255,255,0.4);
          border: none; border-bottom: 1px solid rgba(201,154,63,0.2); cursor: pointer;
          font-family: 'Space Grotesk', sans-serif; font-size: 15px; color: #1a1208;
          text-align: left;
        }
        .breed-modal-match:last-child { border-bottom: none; }
        .breed-modal-match:active { background: rgba(201,154,63,0.18); }
      `}</style>
    </div>,
    document.body,
  );
}

// ── BreedSearchField ─────────────────────────────────────────────────────────
// Search field only — no category tabs, no silhouette row.
// Used in step 1 (breed choice). Follows the same mobile/desktop pattern as
// the original BreedPicker search section.
interface BreedSearchFieldProps {
  search: string;
  setSearch: (v: string) => void;
  selectedBreed: string;
  onSelectBreed: (name: string, cat: string) => void;
  onClearBreed: () => void;
  placeholder?: string;
  disabled?: boolean;
}

function BreedSearchField({
  search, setSearch, selectedBreed, onSelectBreed, onClearBreed,
  placeholder, disabled,
}: BreedSearchFieldProps) {
  const t = useT();
  const { lang } = useLang();
  const matches = useMemo(() => {
    if (disabled || search.trim().length < 2 || selectedBreed) return [];
    const q = search.toLowerCase();
    // Match EN-canonical name OR its localized label, so a SK user typing
    // "pudel" finds "Toy Poodle" (shown as "Toy pudel"). Storage stays EN.
    return ALL_BREEDS.filter((b) =>
      b.name.toLowerCase().includes(q) ||
      localizeBreed(b.name, lang).toLowerCase().includes(q)
    ).slice(0, 6);
  }, [search, selectedBreed, disabled, lang]);

  const isMobile = useMemo(() => window.matchMedia('(pointer: coarse)').matches, []);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search modal (iOS keyboard-safe)
  const [modalOpen, setModalOpen] = useState(false);
  const modalRootRef = useRef<HTMLDivElement>(null);
  const breedInputRef = useRef<HTMLInputElement>(null);

  const openModal = () => {
    if (disabled) return;
    modalRootRef.current?.classList.add('is-open');
    breedInputRef.current?.focus();
    setModalOpen(true);
  };
  const closeModal = () => {
    breedInputRef.current?.blur();
    setModalOpen(false);
  };
  const handleSearchChange = (v: string) => {
    if (selectedBreed) onClearBreed();
    setSearch(v);
  };
  const handlePick = (name: string, cat: string) => {
    onSelectBreed(name, cat);
    closeModal();
    setDesktopDropdownOpen(false);
    setSearch('');
  };

  useEffect(() => {
    if (!desktopDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        !dropdownRef.current?.contains(e.target as Node) &&
        !desktopInputRef.current?.contains(e.target as Node)
      ) {
        setDesktopDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [desktopDropdownOpen]);

  const placeholderText = placeholder ?? t('heroglyph.flow.breed.one.placeholder');

  return (
    <div
      className="flex flex-col gap-2"
      style={{
        position: 'relative',
        zIndex: desktopDropdownOpen ? 60 : undefined,
        ...(disabled ? { opacity: 0.4, pointerEvents: 'none' } : {}),
      }}
    >
      <div
        className={`breed-field-wrap${selectedBreed ? ' is-filled' : ''}`}
        style={{ position: 'relative' }}
      >
        {isMobile ? (
          <button
            type="button"
            className="breed-field-btn flex items-center gap-2 w-full rounded-xl px-4 h-11 bg-card"
            onClick={openModal}
            disabled={disabled}
          >
            <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            {selectedBreed ? (
              <span
                className="rounded-full px-3 py-1 text-sm flex items-center gap-1.5 bg-primary/20 text-foreground"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {localizeBreed(selectedBreed, lang)}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); onClearBreed(); }}
                  className="text-foreground/60 hover:text-foreground inline-flex"
                >
                  <X className="h-3 w-3" />
                </span>
              </span>
            ) : (
              <span
                className="flex-1 text-left text-base md:text-sm text-muted-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {placeholderText}
              </span>
            )}
          </button>
        ) : selectedBreed ? (
          <div className="breed-field-btn flex items-center gap-2 w-full rounded-xl px-4 h-11 bg-card">
            <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span
              className="rounded-full px-3 py-1 text-sm flex items-center gap-1.5 bg-primary/20 text-foreground"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {localizeBreed(selectedBreed, lang)}
              <span
                role="button"
                tabIndex={0}
                onClick={() => { onClearBreed(); desktopInputRef.current?.focus(); }}
                className="text-foreground/60 hover:text-foreground inline-flex"
              >
                <X className="h-3 w-3" />
              </span>
            </span>
          </div>
        ) : (
          <>
            <div
              className="breed-field-btn flex items-center gap-2 w-full rounded-xl px-4 h-11 bg-card"
              style={{ padding: 0 }}
            >
              <div className="flex items-center gap-2 w-full h-full px-4">
                <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <input
                  ref={desktopInputRef}
                  value={search}
                  onChange={(e) => {
                    handleSearchChange(e.target.value);
                    setDesktopDropdownOpen(true);
                  }}
                  onFocus={() => { if (matches.length > 0) setDesktopDropdownOpen(true); }}
                  placeholder={placeholderText}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={disabled}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                />
              </div>
            </div>
            {desktopDropdownOpen && matches.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute left-0 right-0 z-50 rounded-xl border border-border/40 bg-card shadow-lg overflow-hidden"
                style={{ top: '100%', marginTop: 4 }}
              >
                {matches.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    onMouseDown={(e) => { e.preventDefault(); handlePick(b.name, b.category); }}
                  >
                    <span>{localizeBreed(b.name, lang)}</span>
                    <img src={patronUrl(b.patron)} alt="" className="h-6 w-6 object-contain opacity-90" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {isMobile && (
        <BreedSearchModal
          open={modalOpen}
          search={search}
          matches={matches}
          title={placeholderText}
          placeholder={placeholderText}
          enHint={t('heroglyph.flow.breed.enHint')}
          closeLabel={t('nav.aria.close')}
          lang={lang}
          rootRef={modalRootRef}
          inputRef={breedInputRef}
          onSearchChange={handleSearchChange}
          onClear={onClearBreed}
          onSelect={handlePick}
          onClose={closeModal}
        />
      )}

      <style>{`
        @property --breed-glow-ang { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        .breed-field-wrap { position: relative; border-radius: 0.75rem; box-shadow: 0 0 10px rgba(47,107,255,0.14); }
        .breed-field-btn { position: relative; z-index: 1; border: 2px solid rgba(47,107,255,0.30); cursor: text; }
        .breed-field-wrap::before {
          content: ''; position: absolute; inset: -2px; border-radius: 14px; z-index: 0;
          pointer-events: none; padding: 2px;
          background: conic-gradient(from var(--breed-glow-ang),
            transparent 0deg, transparent 250deg,
            rgba(47,107,255,0.85) 312deg, rgba(156,196,255,0.95) 334deg,
            rgba(47,107,255,0.85) 352deg, transparent 360deg);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          filter: blur(1px);
          animation: breedGlowSpin 3.8s linear infinite;
        }
        @keyframes breedGlowSpin { to { --breed-glow-ang: 360deg; } }
        @media (prefers-reduced-motion: reduce) { .breed-field-wrap::before { animation: none; } }
        .breed-field-wrap.is-filled::before { animation: none; opacity: 0; }
        .breed-field-wrap.is-filled { box-shadow: 0 0 0 2px hsl(224 60% 45% / 0.45), 0 0 14px hsl(224 60% 45% / 0.22); }
        .breed-field-wrap.is-filled .breed-field-btn { border-color: hsl(224 60% 45%); background: hsl(224 60% 45% / 0.10); }
      `}</style>
    </div>
  );
}

// ── PatronPicker ─────────────────────────────────────────────────────────────
// Category tabs (pill style, blue selected) + silhouette row (chevron nav).
// No search field. Scroll-centering + chevron visibility tracking added.
interface PatronPickerProps {
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  selectedSvg: string;
  onSelectSvg: (svg: string) => void;
}

function PatronPicker({ activeCategory, setActiveCategory, selectedSvg, onSelectSvg }: PatronPickerProps) {
  const t = useT();
  const svgs = svgsFor(activeCategory);

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const svgRowRef = useRef<HTMLDivElement>(null);
  const svgRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Chevron visibility — silhouette row
  const [svgCanScrollLeft, setSvgCanScrollLeft] = useState(false);
  const [svgCanScrollRight, setSvgCanScrollRight] = useState(true);

  // Chevron visibility — category tab row
  const [tabsCanScrollLeft, setTabsCanScrollLeft] = useState(false);
  const [tabsCanScrollRight, setTabsCanScrollRight] = useState(true);

  // Center the active category tab whenever it changes
  useEffect(() => {
    const container = tabsContainerRef.current;
    const btn = tabRefs.current[activeCategory];
    if (!container || !btn) return;
    const target = btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [activeCategory]);

  // Center the selected silhouette in the row
  useEffect(() => {
    if (!selectedSvg) return;
    const container = svgRowRef.current;
    const btn = svgRefs.current[selectedSvg];
    if (!container || !btn) return;
    const target = btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [selectedSvg, activeCategory]);

  // Track silhouette row scroll to show/hide chevrons
  useEffect(() => {
    const el = svgRowRef.current;
    if (!el) return;
    const update = () => {
      setSvgCanScrollLeft(el.scrollLeft > 2);
      setSvgCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    return () => el.removeEventListener('scroll', update);
  }, []); // svgRowRef.current is stable after mount

  // Re-check silhouette chevron state when category changes (scrollWidth and content change)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = svgRowRef.current;
      if (!el) return;
      setSvgCanScrollLeft(el.scrollLeft > 2);
      setSvgCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    });
    return () => cancelAnimationFrame(id);
  }, [activeCategory]);

  // Track tab row scroll to show/hide tab chevrons
  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const update = () => {
      setTabsCanScrollLeft(el.scrollLeft > 2);
      setTabsCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    return () => el.removeEventListener('scroll', update);
  }, []); // tabsContainerRef.current is stable after mount

  return (
    <div className="flex flex-col gap-3">

      {/* Category tabs — pill chips with chevron nav + fade edges */}
      <div className="relative">
        {/* Left fade (under chevron) */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-[5]"
          style={{ background: 'linear-gradient(to right, hsl(var(--papyrus)), transparent)' }}
        />
        {/* Right fade (under chevron) */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-[5]"
          style={{ background: 'linear-gradient(to left, hsl(var(--papyrus)), transparent)' }}
        />
        {/* Left chevron — shown when scrolled past start */}
        {tabsCanScrollLeft && (
          <button
            type="button"
            aria-label="Scroll tabs left"
            onClick={() => tabsContainerRef.current?.scrollBy({ left: -150, behavior: 'smooth' })}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: 'hsl(var(--papyrus))',
              border: '1.5px solid rgba(201,154,63,0.4)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5 text-foreground" />
          </button>
        )}
        {/* Right chevron — shown when more tabs exist to the right */}
        {tabsCanScrollRight && (
          <button
            type="button"
            aria-label="Scroll tabs right"
            onClick={() => tabsContainerRef.current?.scrollBy({ left: 150, behavior: 'smooth' })}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: 'hsl(var(--papyrus))',
              border: '1.5px solid rgba(201,154,63,0.4)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            <ChevronRight className="h-3.5 w-3.5 text-foreground" />
          </button>
        )}
        <div
          ref={tabsContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-1 pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {CATEGORIES.map((cat) => {
            const active = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                ref={(el) => { tabRefs.current[cat.id] = el; }}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full border-2 text-sm whitespace-nowrap transition-all ${
                  active
                    ? 'border-[hsl(224_60%_45%)] bg-[hsl(224_60%_45%/0.18)] text-foreground font-bold'
                    : 'border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {cat.id} {t(`heroglyph.flow.breed.cat.${cat.id}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Silhouette row with left/right chevron navigation */}
      <div className="relative -mx-2">
        {/* Left chevron — shown when scrolled right of start */}
        {svgCanScrollLeft && (
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => svgRowRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: 'hsl(var(--papyrus))',
              border: '1.5px solid rgba(201,154,63,0.4)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
        )}
        {/* Right chevron — shown when more silhouettes exist to the right */}
        {svgCanScrollRight && (
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => svgRowRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: 'hsl(var(--papyrus))',
              border: '1.5px solid rgba(201,154,63,0.4)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        )}
        {/* Scrollable silhouette row */}
        <div
          ref={svgRowRef}
          className="flex gap-3 overflow-x-auto overflow-y-visible scrollbar-hide py-5 px-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {svgs.map((svg) => {
            const isSel = svg === selectedSvg;
            return (
              <button
                key={svg}
                ref={(el) => { svgRefs.current[svg] = el; }}
                onClick={() => onSelectSvg(svg)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center transition-all border-2 ${
                  isSel
                    ? 'border-[hsl(224_60%_45%)] bg-[hsl(224_60%_45%/0.18)] scale-105 z-10'
                    : 'border-border/60 hover:border-primary/50 bg-card/50'
                }`}
                style={
                  isSel
                    ? { boxShadow: '0 0 0 2px hsl(224 60% 45% / 0.5), inset 0 0 12px hsl(224 70% 50% / 0.2)' }
                    : undefined
                }
              >
                <img src={patronUrl(svg)} alt="" className="w-14 h-14 object-contain" />
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ── Slide variants (same as PhotoScreen) ────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

// ── Dots (same pattern as PhotoScreen) ──────────────────────────────────────
function Dots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full transition-colors"
          style={{
            backgroundColor: i === current ? 'hsl(var(--gold))' : 'transparent',
            border: '1.5px solid hsl(var(--gold))',
          }}
        />
      ))}
    </div>
  );
}

// ── Back / Next button pair (same pattern as PhotoScreen) ───────────────────
function BackNextButtons({
  onBack,
  onNext,
  nextDisabled,
  backLabel = 'BACK',
  nextLabel = 'NEXT',
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  backLabel?: string;
  nextLabel?: string;
}) {
  const common =
    'flex-1 rounded-xl h-10 font-bold tracking-wider transition-transform disabled:opacity-40 disabled:hover:scale-100 text-xs';
  return (
    <div className="flex gap-2 w-full">
      <Button
        onClick={onBack}
        className={`${common} hover:scale-105 border-2`}
        style={{
          fontFamily: "'Cinzel', serif",
          background: 'transparent',
          borderColor: 'hsl(var(--gold) / 0.5)',
          color: 'hsl(var(--gold))',
        }}
      >
        {backLabel}
      </Button>
      <Button
        onClick={onNext}
        disabled={nextDisabled}
        className={`${common} hover:scale-105`}
        style={{
          fontFamily: "'Cinzel', serif",
          background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
          color: '#000',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
        }}
      >
        {nextLabel}
      </Button>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function BreedPatronScreen() {
  const navigate = useNavigate();
  const t = useT();
  const dogName = useDogyptStore((s) => s.dogName);
  const setBreed = useDogyptStore((s) => s.setBreed);
  const setIsMixStore = useDogyptStore((s) => s.setIsMix);
  const setPatronCategory = useDogyptStore((s) => s.setPatronCategory);
  const setPatronSvg = useDogyptStore((s) => s.setPatronSvg);
  const setPatronCategory2 = useDogyptStore((s) => s.setPatronCategory2);
  const setPatronSvg2 = useDogyptStore((s) => s.setPatronSvg2);
  const setSelection = useDogyptStore((s) => s.setSelection);

  // Navigation sub-state
  const [sub, setSub] = useState(0);
  const [dir, setDir] = useState(1);

  // Step 1 — breed type + search
  const [choice, setChoice] = useState<'one' | 'mix' | null>(null);
  const [breed1, setBreed1] = useState('');
  const [cat1, setCat1] = useState('');
  const [search1, setSearch1] = useState('');
  const [breed2, setBreed2] = useState('');
  const [search2, setSearch2] = useState('');
  const [dontKnow, setDontKnow] = useState(false);

  // Step 2 — patron silhouette
  const [selectedCat, setSelectedCat] = useState('01');
  const [selectedSvg, setSelectedSvg] = useState('');

  const heroName = dogName?.trim() || t('heroglyph.flow.breed.fallbackHero');

  // Gate for step 1 → step 2
  const canNext =
    choice === 'one' ? !!breed1 :
    choice === 'mix' ? ((!!breed1 && !!breed2) || dontKnow) :
    false;

  const handleNext = () => {
    if (!canNext) return;
    // Pre-fill step 2 with breed1's canonical patron (if known)
    if (!dontKnow && breed1 && cat1) {
      const patron = breedToPatron[`${cat1}|${breed1}`];
      setSelectedCat(cat1);
      setSelectedSvg(patron ?? `${cat1}-01.svg`);
    } else {
      // I don't know / no breed selected → open cat 01, no pre-selection
      setSelectedCat('01');
      setSelectedSvg('');
    }
    setDir(1);
    setSub(1);
  };

  const handleBack = () => {
    setDir(-1);
    setSub(0);
  };

  const handleContinue = () => {
    if (!selectedSvg) return;
    const isMix = choice === 'mix';
    setIsMixStore(isMix);
    setPatronCategory(selectedCat);
    setPatronSvg(selectedSvg);
    setBreed(isMix ? 'Mixed' : (breed1 || ''));
    setSelection('breed', isMix ? 'Mixed' : (breed1 || ''));
    setSelection('breedType', isMix ? 'mix' : 'purebred');
    if (isMix) {
      setSelection('mixBreed1', breed1 || '');
      setSelection('mixBreed2', breed2 || '');
    }
    setPatronCategory2(''); // dormant — keep empty
    setPatronSvg2('');      // dormant — keep empty
    navigate('/heroglyph/ranking');
  };

  // Render title with gold-highlighted dog name (same pattern as existing breed question)
  const renderGoldName = (tmpl: string): React.ReactNode => {
    if (!tmpl.includes('{name}')) return tmpl;
    const [before, after = ''] = tmpl.split('{name}');
    return (
      <>
        {before}
        <span className="font-bold text-amber-300">{heroName}</span>
        {after}
      </>
    );
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <PageTopBar
        onBack={() => sub === 0 ? navigate('/heroglyph/photo') : handleBack()}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3 overflow-hidden">
        <div className="w-full max-w-xl flex-1 flex flex-col gap-3 md:gap-4 justify-center min-h-0 overflow-hidden">

          <AnimatePresence mode="wait" custom={dir}>

            {/* ── STEP 1: Breed type + search ────────────────────────────── */}
            {sub === 0 && (
              <motion.div
                key="breed-step1"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex flex-col gap-3 md:gap-4 w-full"
              >
                {/* Hektor block */}
                <div
                  className="w-full rounded-2xl flex-shrink overflow-hidden"
                  style={{ background: 'var(--brand-gradient)' }}
                >
                  <div className="px-4 py-3 md:py-4 flex flex-col items-center gap-2 md:gap-3">
                    <img
                      src={hekthorImg}
                      alt="HEKTHOR"
                      className="w-24 h-24 md:w-40 md:h-40 object-contain"
                    />
                    <p
                      className="text-white text-center text-lg md:text-2xl leading-snug drop-shadow-sm"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {renderGoldName(t('heroglyph.flow.breed.q1.title'))}
                    </p>
                    <p
                      className="text-white/85 text-center text-sm md:text-base leading-snug -mt-1 md:-mt-2 max-w-md"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {t('heroglyph.flow.breed.q1.subtitle')}
                    </p>
                  </div>
                </div>

                {/* Progress dots */}
                <Dots total={2} current={0} />

                {/* Papyrus card */}
                <div className="w-full rounded-2xl p-3 md:p-4 papyrus-bg border-2 border-border/40 shadow-sm flex flex-col gap-3">

                  {/* Choice: One breed / Mix breed — same card style as DogBloodlineScreen */}
                  <div className="flex gap-4 w-full">
                    {(['one', 'mix'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setChoice(c);
                          // Switching to "one" → clear mix-only state
                          if (c === 'one') {
                            setDontKnow(false);
                            setBreed2('');
                            setSearch2('');
                          }
                        }}
                        className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
                          choice === c ? 'is-selected-purple' : 'border-border/60 hover:border-primary/50'
                        }`}
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        <span className="text-sm md:text-base font-bold tracking-wider uppercase">
                          {c === 'one'
                            ? t('heroglyph.flow.breed.type.one')
                            : t('heroglyph.flow.breed.type.mix')}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* One-breed search */}
                  {choice === 'one' && (
                    <BreedSearchField
                      search={search1}
                      setSearch={setSearch1}
                      selectedBreed={breed1}
                      onSelectBreed={(name, cat) => {
                        setBreed1(name);
                        setSearch1(name);
                        setCat1(cat);
                      }}
                      onClearBreed={() => {
                        setBreed1('');
                        setSearch1('');
                        setCat1('');
                      }}
                      placeholder={t('heroglyph.flow.breed.one.placeholder')}
                    />
                  )}

                  {/* Mix-breed: two search fields (side-by-side on md+) + "I don't know" */}
                  {choice === 'mix' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                        <div className="flex-1 min-w-0">
                          <BreedSearchField
                            search={search1}
                            setSearch={setSearch1}
                            selectedBreed={breed1}
                            onSelectBreed={(name, cat) => {
                              setBreed1(name);
                              setSearch1(name);
                              setCat1(cat);
                            }}
                            onClearBreed={() => {
                              setBreed1('');
                              setSearch1('');
                              setCat1('');
                            }}
                            placeholder={t('heroglyph.flow.breed.mix.placeholder1')}
                            disabled={dontKnow}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <BreedSearchField
                            search={search2}
                            setSearch={setSearch2}
                            selectedBreed={breed2}
                            onSelectBreed={(name) => {
                              setBreed2(name);
                              setSearch2(name);
                            }}
                            onClearBreed={() => {
                              setBreed2('');
                              setSearch2('');
                            }}
                            placeholder={t('heroglyph.flow.breed.mix.placeholder2')}
                            disabled={dontKnow}
                          />
                        </div>
                      </div>
                      <label
                        className="flex items-center gap-2 cursor-pointer select-none"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        <input
                          type="checkbox"
                          checked={dontKnow}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setDontKnow(checked);
                            if (checked) {
                              setBreed1(''); setSearch1(''); setCat1('');
                              setBreed2(''); setSearch2('');
                            }
                          }}
                          className="w-4 h-4 rounded accent-[hsl(224_60%_45%)]"
                        />
                        <span
                          className="text-foreground"
                          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}
                        >
                          {t('heroglyph.flow.breed.mix.dontKnow')}
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Next button (gold) */}
                  <Button
                    onClick={handleNext}
                    disabled={!canNext}
                    className="w-full rounded-xl gap-2 h-11 font-bold tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                      color: '#000',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
                    }}
                  >
                    {t('heroglyph.flow.photo.next')}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Patron silhouette picker ────────────────────────── */}
            {sub === 1 && (
              <motion.div
                key="breed-step2"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex flex-col gap-3 md:gap-4 w-full"
              >
                {/* Hektor block (smaller — same size as PhotoScreen step 2) */}
                <div
                  className="w-full rounded-2xl flex-shrink overflow-hidden"
                  style={{ background: 'var(--brand-gradient)' }}
                >
                  <div className="px-4 py-3 md:py-4 flex flex-col items-center gap-2">
                    <img
                      src={hekthorImg}
                      alt="HEKTHOR"
                      className="w-20 h-20 md:w-28 md:h-28 object-contain"
                    />
                    <p
                      className="text-white text-center text-lg md:text-2xl leading-snug drop-shadow-sm"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {renderGoldName(t('heroglyph.flow.breed.question'))}
                    </p>
                    <p
                      className="text-white/85 text-center text-sm md:text-base leading-snug -mt-1 max-w-md"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {t('heroglyph.flow.breed.patron.subtitle', { name: heroName })}
                    </p>
                  </div>
                </div>

                {/* Progress dots */}
                <Dots total={2} current={1} />

                {/* Papyrus card with patron picker */}
                <div className="w-full rounded-2xl p-3 md:p-4 papyrus-bg border-2 border-border/40 shadow-sm flex flex-col gap-3">
                  <PatronPicker
                    activeCategory={selectedCat}
                    setActiveCategory={setSelectedCat}
                    selectedSvg={selectedSvg}
                    onSelectSvg={setSelectedSvg}
                  />

                  <BackNextButtons
                    onBack={handleBack}
                    onNext={handleContinue}
                    nextDisabled={!selectedSvg}
                    backLabel={t('heroglyph.flow.photo.back')}
                    nextLabel={t('heroglyph.flow.breed.continue')}
                  />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
