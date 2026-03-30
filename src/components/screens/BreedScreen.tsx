import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, X, Plus, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo.png';
import hekthorImg from '@/assets/hekthor.png';
import { fciBreeds } from '@/lib/fciBreeds';

type Mode = 'choose' | 'purebred' | 'mix';

export function BreedScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);

  const [mode, setMode] = useState<Mode>('choose');
  const [search, setSearch] = useState('');
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null);
  const [mixBreeds, setMixBreeds] = useState<string[]>([]);
  const [mixSearch, setMixSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = fciBreeds.filter((b) =>
    b.toLowerCase().includes((mode === 'mix' ? mixSearch : search).toLowerCase())
  );

  const showDropdown = mode === 'purebred' ? search.length > 0 && !selectedBreed : mixSearch.length > 0;

  const handleSelectPurebred = (breed: string) => {
    setSelectedBreed(breed);
    setSearch(breed);
  };

  const handleAddMix = (breed: string) => {
    if (mixBreeds.length < 4 && !mixBreeds.includes(breed)) {
      setMixBreeds((prev) => [...prev, breed]);
    }
    setMixSearch('');
  };

  const handleRemoveMix = (breed: string) => {
    setMixBreeds((prev) => prev.filter((b) => b !== breed));
  };

  const handleContinue = () => {
    if (mode === 'purebred' && selectedBreed) {
      setSelection('breed', selectedBreed);
      setSelection('breedType', 'purebred');
    } else if (mode === 'mix' && mixBreeds.length >= 2) {
      setSelection('breed', mixBreeds.join(', '));
      setSelection('breedType', 'mix');
    }
    navigate('/birthday-dog');
  };

  const canContinue = mode === 'purebred' ? !!selectedBreed : mode === 'mix' ? mixBreeds.length >= 2 : false;

  useEffect(() => {
    if (mode === 'purebred' || mode === 'mix') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mode]);

  return (
    <div className="papyrus-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-center relative pt-4 pb-2 px-4">
        <button onClick={() => navigate('/photo')} className="absolute left-4 top-4 p-2 text-foreground/60 hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-12 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">
          {/* HEKTHOR question */}
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-6 flex flex-col items-center gap-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
            <p className="text-foreground text-center text-xl md:text-2xl leading-relaxed" style={{ fontFamily: "'Cinzel', serif" }}>
              {dogName || 'FRIEND'}, WHO ARE YOU?
            </p>
          </motion.div>

          {/* Answer block */}
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-4 flex flex-col gap-3"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              {mode === 'choose' && (
                <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                  <Button
                    onClick={() => setMode('purebred')}
                    variant="outline"
                    className="w-full rounded-full border-primary text-foreground hover:bg-primary hover:text-primary-foreground h-12 text-base"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    One Breed
                  </Button>
                  <Button
                    onClick={() => setMode('mix')}
                    variant="outline"
                    className="w-full rounded-full border-primary text-foreground hover:bg-primary hover:text-primary-foreground h-12 text-base"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Mix
                  </Button>
                </motion.div>
              )}

              {mode === 'purebred' && (
                <motion.div key="purebred" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                  <button onClick={() => { setMode('choose'); setSearch(''); setSelectedBreed(null); }} className="self-start text-muted-foreground text-sm flex items-center gap-1 hover:text-foreground transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <ArrowLeft className="h-3 w-3" /> Back
                  </button>
                  <div className="relative">
                    <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border/30">
                      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <input
                        ref={inputRef}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setSelectedBreed(null); }}
                        placeholder="Search breed..."
                        className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                      {search && (
                        <button onClick={() => { setSearch(''); setSelectedBreed(null); }} className="text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {showDropdown && filtered.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/40 rounded-xl max-h-48 overflow-y-auto z-10 shadow-lg p-2">
                        <div className="flex flex-wrap gap-1.5">
                          {filtered.slice(0, 30).map((breed) => (
                            <button
                              key={breed}
                              onClick={() => handleSelectPurebred(breed)}
                              className="px-3 py-1.5 rounded-full border border-border/40 text-foreground hover:bg-primary/20 transition-colors text-xs"
                              style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                              {breed}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedBreed && (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <span className="bg-primary/20 text-foreground rounded-full px-4 py-1.5 text-sm font-medium" style={{ fontFamily: "'Cinzel', serif" }}>
                        {selectedBreed}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {mode === 'mix' && (
                <motion.div key="mix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                  <button onClick={() => { setMode('choose'); setMixSearch(''); setMixBreeds([]); }} className="self-start text-muted-foreground text-sm flex items-center gap-1 hover:text-foreground transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <ArrowLeft className="h-3 w-3" /> Back
                  </button>
                  <p className="text-muted-foreground text-xs text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Select 2–4 breeds
                  </p>
                  {/* Selected mix breeds */}
                  {mixBreeds.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {mixBreeds.map((breed) => (
                        <span key={breed} className="bg-primary/20 text-foreground rounded-full px-3 py-1 text-sm flex items-center gap-1.5" style={{ fontFamily: "'Cinzel', serif" }}>
                          {breed}
                          <button onClick={() => handleRemoveMix(breed)} className="text-foreground/60 hover:text-foreground">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Search for mix */}
                  {mixBreeds.length < 4 && (
                    <div className="relative">
                      <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border/30">
                        <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <input
                          ref={inputRef}
                          value={mixSearch}
                          onChange={(e) => setMixSearch(e.target.value)}
                          placeholder={mixBreeds.length === 0 ? "Search first breed..." : "Add another breed..."}
                          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        />
                        {mixSearch && (
                          <button onClick={() => setMixSearch('')} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {showDropdown && filtered.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/40 rounded-xl max-h-48 overflow-y-auto z-10 shadow-lg p-2">
                          <div className="flex flex-wrap gap-1.5">
                            {filtered.filter((b) => !mixBreeds.includes(b)).slice(0, 30).map((breed) => (
                              <button
                                key={breed}
                                onClick={() => handleAddMix(breed)}
                                className="px-3 py-1.5 rounded-full border border-border/40 text-foreground hover:bg-primary/20 transition-colors text-xs"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                              >
                                {breed}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Continue button */}
            {canContinue && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Button
                  onClick={handleContinue}
                  className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/80 gap-2 h-11"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  <Send className="h-4 w-4" />
                  Continue
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
