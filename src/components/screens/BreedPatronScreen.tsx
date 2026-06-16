import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';
import { PageTopBar } from '@/components/PageTopBar';
import hekthorImg from '@/assets/hekthor.png';
import breedsData from '@/data/breeds.json';
import { useT } from '@/i18n/LanguageContext';

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
// Same iOS-safe pattern as NameScreen: always-mounted modal portaled to body,
// input focused synchronously on tap (so the keyboard opens), card kept above
// the keyboard via visualViewport. Live matches render INSIDE the card so the
// keyboard never covers them. See feedback_ios_input_modal_pattern.
interface BreedSearchModalProps {
  open: boolean;
  search: string;
  matches: { name: string; category: string; patron: string }[];
  title: string;
  placeholder: string;
  enHint: string;
  closeLabel: string;
  rootRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  onSearchChange: (v: string) => void;
  onClear: () => void;
  onSelect: (name: string, cat: string) => void;
  onClose: () => void;
}

function BreedSearchModal({
  open, search, matches, title, placeholder, enHint, closeLabel,
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
                <span>{m.name}</span>
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

interface BreedPickerProps {
  search: string;
  setSearch: (v: string) => void;
  selectedBreed: string;
  onSelectBreed: (name: string, cat: string) => void;
  onClearBreed: () => void;
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  selectedSvg: string;
  onSelectSvg: (svg: string) => void;
  placeholder?: string;
  trailing?: React.ReactNode;
}

function BreedPicker({
  search, setSearch, selectedBreed, onSelectBreed, onClearBreed,
  activeCategory, setActiveCategory, selectedSvg, onSelectSvg,
  placeholder,
  trailing,
}: BreedPickerProps) {
  const t = useT();
  const matches = useMemo(() => {
    if (search.trim().length < 2 || selectedBreed) return [];
    const q = search.toLowerCase();
    return ALL_BREEDS.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 6);
  }, [search, selectedBreed]);

  const svgs = svgsFor(activeCategory);

  // Search modal (iOS keyboard-safe) — same pattern as NameScreen
  const [modalOpen, setModalOpen] = useState(false);
  const modalRootRef = useRef<HTMLDivElement>(null);
  const breedInputRef = useRef<HTMLInputElement>(null);
  const openModal = () => {
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
  };

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Center the active category tab whenever it changes
  useEffect(() => {
    const container = tabsContainerRef.current;
    const btn = tabRefs.current[activeCategory];
    if (!container || !btn) return;
    const target =
      btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [activeCategory]);

  return (
    <div className="flex flex-col gap-3">
      {/* Search field — tap opens a keyboard-safe modal (input + live matches),
          a decent blue glow slowly orbits the frame to invite the tap. */}
      <div className="flex items-center gap-2">
        <div className={`breed-field-wrap flex-1${selectedBreed ? ' is-filled' : ''}`}>
          <button
            type="button"
            className="breed-field-btn flex items-center gap-2 w-full rounded-xl px-4 h-11 bg-card"
            onClick={openModal}
          >
            <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            {selectedBreed ? (
              <span
                className="rounded-full px-3 py-1 text-sm flex items-center gap-1.5 bg-primary/20 text-foreground"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {selectedBreed}
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
                {placeholder ?? t('heroglyph.flow.breed.searchPlaceholder')}
              </span>
            )}
          </button>
        </div>
        {trailing}
      </div>

      <BreedSearchModal
        open={modalOpen}
        search={search}
        matches={matches}
        title={placeholder ?? t('heroglyph.flow.breed.searchPlaceholder')}
        placeholder={placeholder ?? t('heroglyph.flow.breed.searchPlaceholder')}
        enHint={t('heroglyph.flow.breed.enHint')}
        closeLabel={t('nav.aria.close')}
        rootRef={modalRootRef}
        inputRef={breedInputRef}
        onSearchChange={handleSearchChange}
        onClear={onClearBreed}
        onSelect={handlePick}
        onClose={closeModal}
      />

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
        /* Filled = no animation, static "selected" highlight (like flow options) */
        .breed-field-wrap.is-filled::before { animation: none; opacity: 0; }
        .breed-field-wrap.is-filled { box-shadow: 0 0 0 2px hsl(224 60% 45% / 0.45), 0 0 14px hsl(224 60% 45% / 0.22); }
        .breed-field-wrap.is-filled .breed-field-btn { border-color: hsl(224 60% 45%); background: hsl(224 60% 45% / 0.10); }
      `}</style>

      {/* Tabs */}
      <div
        ref={tabsContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {CATEGORIES.map((cat) => {
          const active = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              ref={(el) => { tabRefs.current[cat.id] = el; }}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 pb-1.5 text-[13px] tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                active
                  ? 'font-bold text-foreground border-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {cat.id} {t(`heroglyph.flow.breed.cat.${cat.id}`)}
            </button>
          );
        })}
      </div>

      {/* Silhouette row */}
      <div className="flex gap-3 overflow-x-auto overflow-y-visible scrollbar-hide py-5 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
        {svgs.map((svg) => {
          const isSel = svg === selectedSvg;
          return (
            <button
              key={svg}
              onClick={() => onSelectSvg(svg)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center transition-all border-2 ${
                isSel
                  ? 'border-[hsl(224_60%_45%)] bg-[hsl(224_60%_45%/0.18)] scale-105 z-10'
                  : 'border-border/60 hover:border-primary/50 bg-card/50'
              }`}
              style={
                isSel
                  ? {
                      boxShadow:
                        '0 0 0 2px hsl(224 60% 45% / 0.5), inset 0 0 12px hsl(224 70% 50% / 0.2)',
                    }
                  : undefined
              }
            >
              <img src={patronUrl(svg)} alt="" className="w-14 h-14 object-contain" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

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

  const isMix = false;

  // First picker
  const [search1, setSearch1] = useState('');
  const [breed1, setBreed1] = useState('');
  const [cat1, setCat1] = useState('01');
  const [svg1, setSvg1] = useState('');

  // Second picker (mix)
  const [search2, setSearch2] = useState('');
  const [breed2, setBreed2] = useState('');
  const [cat2, setCat2] = useState('01');
  const [svg2, setSvg2] = useState('');

  const handleSelectBreed1 = (name: string, cat: string) => {
    setBreed1(name);
    setSearch1(name);
    setCat1(cat);
    setSvg1(breedToPatron[`${cat}|${name}`] ?? `${cat}-01.svg`);
  };
  const handleClearBreed1 = () => { setBreed1(''); setSearch1(''); setSvg1(''); };

  const handleSelectBreed2 = (name: string, cat: string) => {
    setBreed2(name);
    setSearch2(name);
    setCat2(cat);
    setSvg2(breedToPatron[`${cat}|${name}`] ?? `${cat}-01.svg`);
  };
  const handleClearBreed2 = () => { setBreed2(''); setSearch2(''); setSvg2(''); };

  const canContinue = isMix ? (!!svg1 && !!svg2) : !!svg1;

  const handleContinue = () => {
    if (!canContinue) return;
    setIsMixStore(isMix);
    setPatronCategory(cat1);
    setPatronSvg(svg1);
    setBreed(breed1 || (isMix ? 'Mix' : ''));
    setSelection('breed', breed1 || (isMix ? 'Mix' : ''));
    setSelection('breedType', isMix ? 'mix' : 'purebred');
    if (isMix) {
      setPatronCategory2(cat2);
      setPatronSvg2(svg2);
    } else {
      setPatronCategory2('');
      setPatronSvg2('');
    }
    navigate('/heroglyph/ranking');
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <PageTopBar onBack={() => navigate('/heroglyph/photo')} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3 overflow-hidden">
        <div className="w-full max-w-xl flex-1 flex flex-col gap-3 md:gap-4 justify-center min-h-0 overflow-hidden">
          {/* Block 1 — exact duplicate from PhotoScreen */}
          <motion.div
            className="w-full rounded-2xl flex-shrink overflow-hidden"
            style={{ background: 'var(--brand-gradient)' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="px-4 py-5 md:p-6 flex flex-col items-center gap-3 md:gap-4">
              <img src={hekthorImg} alt="HEKTHOR" className="w-36 h-36 md:w-56 md:h-56 object-contain" />
              <p
                className="text-white text-center text-lg md:text-2xl leading-snug drop-shadow-sm"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {t('heroglyph.flow.breed.question')}
              </p>
            </div>
          </motion.div>

          {/* Block 2/3/4 — Gradient card with picker(s) */}
          <div className="flex-shrink-0 flex flex-col gap-4">
            <motion.div
              className="w-full rounded-2xl p-3 md:p-4 papyrus-bg border-2 border-border/40 shadow-sm flex flex-col gap-3 flex-shrink-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BreedPicker
                search={search1}
                setSearch={setSearch1}
                selectedBreed={breed1}
                onSelectBreed={handleSelectBreed1}
                onClearBreed={handleClearBreed1}
                activeCategory={cat1}
                setActiveCategory={setCat1}
                selectedSvg={svg1}
                onSelectSvg={setSvg1}
                placeholder={t('heroglyph.flow.breed.searchPlaceholder')}
              />

              {/* Continue button — always visible (faded/disabled until valid), for
                  consistency with NameScreen. */}
              <Button
                onClick={handleContinue}
                disabled={!canContinue}
                className="w-full rounded-xl gap-2 h-11 font-bold tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                  color: '#000',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
                }}
              >
                {t('heroglyph.flow.breed.continue')}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}