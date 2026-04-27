import React, { useState, useMemo } from 'react';
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

  return (
    <div className="flex flex-col gap-3">
      {/* Search row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div
            className="flex items-center gap-2 rounded-full px-4 h-11"
            style={{
              background: 'rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.4)',
            }}
          >
            <Search className="h-4 w-4 flex-shrink-0" style={{ color: '#000' }} />
          {selectedBreed ? (
            <div className="flex-1 flex items-center">
              <span
                  className="rounded-full px-3 py-1 text-sm flex items-center gap-1.5"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: 'rgba(0,0,0,0.85)',
                    color: '#FAF4EC',
                  }}
              >
                {selectedBreed}
                  <button onClick={onClearBreed} style={{ color: '#FAF4EC' }} className="opacity-80 hover:opacity-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            </div>
          ) : (
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: '#1a1a1a',
                }}
            />
          )}
          {!selectedBreed && search && (
              <button onClick={() => setSearch('')} style={{ color: '#000' }} className="opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          )}
          </div>
          {matches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 border rounded-xl overflow-hidden z-50 shadow-xl"
              style={{ background: 'hsl(var(--papyrus-light))', borderColor: 'rgba(0,0,0,0.3)' }}
            >
              {matches.map((m) => (
                <button
                  key={`${m.category}-${m.name}`}
                  onClick={() => onSelectBreed(m.name, m.category)}
                  className="w-full flex items-center justify-between px-3 py-2 transition-colors border-b last:border-0 hover:bg-black/5"
                  style={{ borderColor: 'rgba(0,0,0,0.15)', color: '#1a1a1a' }}
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
      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat) => {
          const active = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 pb-1.5 text-[13px] tracking-wider whitespace-nowrap transition-colors ${
                active ? 'font-bold' : ''
              }`}
              style={{
                fontFamily: "'Cinzel', serif",
                color: active ? '#000' : 'rgba(0,0,0,0.45)',
                borderBottom: active ? '2px solid #000' : '2px solid transparent',
              }}
            >
              {cat.id} {cat.name}
            </button>
          );
        })}
      </div>

      {/* Silhouette row */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none' }}>
        {svgs.map((svg) => {
          const isSel = svg === selectedSvg;
          return (
            <button
              key={svg}
              onClick={() => onSelectSvg(svg)}
              className="flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center transition-all"
              style={{
                backgroundColor: 'hsl(var(--papyrus-light))',
                border: isSel ? '2px solid #000' : '2px solid rgba(0,0,0,0.2)',
                boxShadow: isSel ? '0 0 0 2px rgba(0,0,0,0.08)' : 'none',
              }}
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

  const [isMix, setIsMix] = useState(false);

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
    navigate('/birthday-dog');
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-center relative pt-4 pb-2 px-4">
        <button
          onClick={() => navigate('/photo')}
          className="absolute left-4 top-4 p-2 text-foreground/60 hover:text-foreground transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <img src={dogyptLogo} alt="DOGYPT" className="h-8 md:h-12 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 overflow-hidden">
        <div className="w-full max-w-xl flex-1 flex flex-col gap-3 py-2 overflow-hidden">
          {/* Block 1 — Hektor question (matches PhotoScreen design) */}
          <motion.div
            className="w-full rounded-2xl p-6 flex flex-col items-center gap-4 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
            <p
              className="text-white text-center text-xl md:text-2xl leading-relaxed whitespace-pre-line drop-shadow-sm"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              TELL ME, WHAT <span className="font-bold text-amber-300">BREED</span>
              {'\n'}IS <span className="font-bold">{dogName || 'YOUR HERO'}</span>?
            </p>
          </motion.div>

          {/* Block 2/3/4 — Gradient card with picker(s) */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
            <motion.div
              className="mx-auto w-[92%] rounded-2xl p-4 md:p-5"
              style={{
                background: 'linear-gradient(135deg, hsl(270 40% 25%) 0%, hsl(45 80% 45%) 100%)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              }}
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
                trailing={
                  <button
                    onClick={() => setIsMix((p) => !p)}
                    className="rounded-full px-4 h-11 text-xs tracking-wider transition-colors flex-shrink-0"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      background: isMix ? '#c9922a' : 'rgba(0,0,0,0.4)',
                      color: isMix ? '#000' : '#FAF4EC',
                      border: '1px solid #c9922a',
                    }}
                  >
                    {isMix ? '✕ Mix' : '+ Mix'}
                  </button>
                }
              />
            </motion.div>

            <AnimatePresence>
              {isMix && (
                <motion.div
                  key="mix2"
                  className="mx-auto w-[92%] rounded-2xl p-4 md:p-5"
                  style={{
                    background: 'linear-gradient(135deg, hsl(270 40% 25%) 0%, hsl(45 80% 45%) 100%)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <BreedPicker
                    search={search2}
                    setSearch={setSearch2}
                    selectedBreed={breed2}
                    onSelectBreed={handleSelectBreed2}
                    onClearBreed={handleClearBreed2}
                    activeCategory={cat2}
                    setActiveCategory={setCat2}
                    selectedSvg={svg2}
                    onSelectSvg={setSvg2}
                    placeholder="Search second breed..."
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Continue */}
          <div className="flex-shrink-0 pb-3 pt-1">
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full rounded-full gap-2 h-12 font-bold tracking-wider transition-transform disabled:opacity-40"
              style={{
                fontFamily: "'Cinzel', serif",
                background: canContinue
                  ? 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))'
                  : 'hsl(var(--muted))',
                color: canContinue ? '#000' : undefined,
                boxShadow: canContinue
                  ? '0 0 30px hsl(var(--gold) / 0.4), 0 4px 16px rgba(0,0,0,0.3)'
                  : 'none',
              }}
            >
              <PawPrint className="h-4 w-4" />
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}