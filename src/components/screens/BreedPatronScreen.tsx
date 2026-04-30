import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, X, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import hekthorImg from '@/assets/hekthor.png';
import patronBreeds from '@/data/patronBreeds.json';

type BreedEntry = { n: number; en: string };
type BreedsByCategory = Record<string, BreedEntry[]>;
const data = patronBreeds as BreedsByCategory;

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

// Build flat searchable list with category info
const ALL_BREEDS: { name: string; category: string }[] = [];
for (const cat of Object.keys(data)) {
  for (const b of data[cat]) ALL_BREEDS.push({ name: b.en, category: cat });
}
ALL_BREEDS.sort((a, b) => a.name.localeCompare(b.name));

const svgsFor = (cat: string): string[] => {
  const n = SVG_COUNTS[cat] ?? 0;
  return Array.from({ length: n }, (_, i) => `${cat}-${String(i + 1).padStart(2, '0')}.svg`);
};

const patronUrl = (svg: string) => `/patrons/${svg}`;

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
  placeholder = 'Search breed...',
  trailing,
}: BreedPickerProps) {
  const matches = useMemo(() => {
    if (search.trim().length < 2 || selectedBreed) return [];
    const q = search.toLowerCase();
    return ALL_BREEDS.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 6);
  }, [search, selectedBreed]);

  const svgs = svgsFor(activeCategory);

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
      {/* Search row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div
            className="flex items-center gap-2 rounded-full px-4 h-11 bg-card border border-border/40"
          >
            <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          {selectedBreed ? (
            <div className="flex-1 flex items-center">
              <span
                  className="rounded-full px-3 py-1 text-sm flex items-center gap-1.5 bg-primary/20 text-foreground"
                  style={{ fontFamily: "'Cinzel', serif" }}
              >
                {selectedBreed}
                  <button onClick={onClearBreed} className="text-foreground/60 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </span>
            </div>
          ) : (
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                style={{ fontFamily: "'Inter', sans-serif" }}
            />
          )}
          {!selectedBreed && search && (
              <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
          </div>
          {matches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 border border-border/40 rounded-xl overflow-hidden z-50 shadow-xl bg-card">
              {matches.map((m) => (
                <button
                  key={`${m.category}-${m.name}`}
                  onClick={() => onSelectBreed(m.name, m.category)}
                  className="w-full flex items-center justify-between px-3 py-2 transition-colors border-b border-border/20 last:border-0 hover:bg-primary/10 text-foreground"
                >
                  <span className="text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {m.name}
                  </span>
                  <img
                    src={patronUrl(`${m.category}-01.svg`)}
                    alt=""
                    className="h-6 w-6 object-contain opacity-90"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        {trailing}
      </div>

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
              {cat.id} {cat.name}
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
                  ? 'border-[hsl(270_60%_45%)] bg-[hsl(270_60%_45%/0.18)] scale-105 z-10'
                  : 'border-border/60 hover:border-primary/50 bg-card/50'
              }`}
              style={
                isSel
                  ? {
                      boxShadow:
                        '0 0 0 2px hsl(270 60% 45% / 0.25), 0 0 18px 4px hsl(270 70% 50% / 0.35), 0 0 40px 12px hsl(270 70% 55% / 0.18), 0 0 70px 24px hsl(270 70% 55% / 0.08), inset 0 0 10px hsl(270 70% 50% / 0.18)',
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
    setSvg1(`${cat}-01.svg`);
  };
  const handleClearBreed1 = () => { setBreed1(''); setSearch1(''); setSvg1(''); };

  const handleSelectBreed2 = (name: string, cat: string) => {
    setBreed2(name);
    setSearch2(name);
    setCat2(cat);
    setSvg2(`${cat}-01.svg`);
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
    navigate('/ranking');
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-center relative pt-3 pb-2 px-4">
        <button
          onClick={() => navigate('/photo')}
          className="absolute left-4 top-3 p-2 text-foreground/60 hover:text-foreground transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <img src={dogyptLogo} alt="DOGYPT" className="h-8 md:h-12 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3 overflow-hidden">
        <div className="w-full max-w-xl flex-1 flex flex-col gap-3 md:gap-4 justify-center min-h-0 overflow-hidden">
          {/* Block 1 — exact duplicate from PhotoScreen */}
          <motion.div
            className="w-full rounded-2xl flex-shrink overflow-hidden"
            style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="px-4 py-5 md:p-6 flex flex-col items-center gap-3 md:gap-4">
              <img src={hekthorImg} alt="HEKTHOR" className="w-48 h-48 md:w-64 md:h-64 object-contain" />
              <p
                className="text-white text-center text-lg md:text-2xl leading-snug drop-shadow-sm"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                A <span className="font-bold text-amber-300">FACE</span> OF A GOD
              </p>
              <p
                className="text-white/70 text-sm text-center"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Upload a clear photo of {dogName || 'your dog'} — it will be sealed into their Heroglyph forever.
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
                placeholder="Search breed..."
              />

              {/* Continue button — appears after a silhouette is chosen */}
              {canContinue && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Button
                    onClick={handleContinue}
                    className="w-full rounded-full gap-2 h-11 font-bold tracking-wider hover:scale-105 transition-transform"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                      color: '#000',
                      boxShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)',
                    }}
                  >
                    Continue
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}