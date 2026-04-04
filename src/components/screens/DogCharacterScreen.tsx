import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Info, X, Sparkles, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { CustomCharacterBadge } from '@/components/CustomCharacterBadge';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import hekthorImg from '@/assets/hekthor.png';

import watcherSvg from '@/assets/character/CHARACTER-WATCHER.svg';
import playfulSvg from '@/assets/character/CHARACTER-PLAYFUL.svg';
import hyperactiveSvg from '@/assets/character/CHARACTER-HYPERACTIVE.svg';
import pirateSvg from '@/assets/character/CHARACTER-PIRATE.svg';
import waterloverSvg from '@/assets/character/CHARACTER-WATERLOVER.svg';
import gourmetSvg from '@/assets/character/CHARACTER-GOURMET.svg';
import loverSvg from '@/assets/character/CHARACTER-LOVER.svg';
import chillmanSvg from '@/assets/character/CHARACTER-CHILLMAN.svg';

const characters = [
  { value: 'watcher', label: 'Watcher', img: watcherSvg, isCustom: false },
  { value: 'playful', label: 'Playful', img: playfulSvg, isCustom: false },
  { value: 'hyperactive', label: 'Hyperactive', img: hyperactiveSvg, isCustom: false },
  { value: 'pirate', label: 'Pirate', img: pirateSvg, isCustom: false },
  { value: 'custom', label: 'Custom', img: null, isCustom: true },
  { value: 'waterlover', label: 'Water Lover', img: waterloverSvg, isCustom: false },
  { value: 'gourmet', label: 'Gourmet', img: gourmetSvg, isCustom: false },
  { value: 'lover', label: 'Lover', img: loverSvg, isCustom: false },
  { value: 'chillman', label: 'Chillman', img: chillmanSvg, isCustom: false },
];

const tripleCharacters = [...characters, ...characters, ...characters];

export function DogCharacterScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const customCharacter = useDogyptStore((s) => s.customCharacter);
  const setCustomCharacter = useDogyptStore((s) => s.setCustomCharacter);
  const [selected, setSelected] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDescription, setCustomDescription] = useState('');
  const [customPhoto, setCustomPhoto] = useState<File | null>(null);
  const [customPhotoPreview, setCustomPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const oneThird = el.scrollWidth / 3;
    if (el.scrollLeft <= 10) {
      el.scrollLeft += oneThird;
    } else if (el.scrollLeft >= oneThird * 2 - 10) {
      el.scrollLeft -= oneThird;
    }
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 240;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const handleSelect = (value: string) => {
    setSelected((prev) => {
      let next: string[];
      if (prev.includes(value)) {
        next = prev.filter((v) => v !== value);
      } else if (prev.length < 2) {
        next = [...prev, value];
      } else {
        next = [...prev.slice(1), value];
      }

      if (next.length === 2) {
        setSelection('dogCharacter1', next[0]);
        setSelection('dogCharacter2', next[1]);
        setTimeout(() => navigate('/heroglyph-reveal'), 600);
      }

      return next;
    });
  };

  const handleCustomClick = () => {
    if (customCharacter) {
      setCustomCharacter(false);
      setCustomDescription('');
      setCustomPhoto(null);
      setCustomPhotoPreview(null);
    } else {
      setShowCustomModal(true);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCustomPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleConfirmCustom = () => {
    setCustomCharacter(true);
    setShowCustomModal(false);
  };

  const handleCancelCustom = () => {
    setShowCustomModal(false);
    setCustomDescription('');
    setCustomPhoto(null);
    setCustomPhotoPreview(null);
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-6 pb-3">
        <img src={dogyptLogo} alt="DOGYPT" className="h-16 md:h-20 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-5 py-4">
          {/* 1. BLOCK - Heroglyph preview */}
          <motion.div
            className="w-full relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-2xl border-2 border-border papyrus-bg px-6 pt-6 pb-6">
              <h2
                className="text-center text-base md:text-lg font-bold tracking-[0.2em] uppercase text-primary mb-3"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {dogName || 'YOUR DOG'}'S HEROGLYPH
              </h2>
              <div className="px-2">
                <HeroglyphFrame showOwner className="text-foreground" pulseSlot="dogCharacter" />
              </div>
              <CustomCharacterBadge />
            </div>
          </motion.div>

          {/* Wrapper for blocks 2+3 — modal overlays this */}
          <div className="w-full relative">
            {/* 2. BLOCK - Hekthor question */}
            <motion.div
              className="w-full rounded-2xl relative overflow-hidden min-h-[180px]"
              style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <button
                className="absolute top-3 right-3 z-20 flex items-center justify-center"
                style={{ width: 44, height: 44 }}
                aria-label="Info about Character"
                onClick={() => setShowInfo((p) => !p)}
              >
                <span className="w-7 h-7 rounded-full border-2 border-foreground/40 flex items-center justify-center transition-colors hover:border-foreground/70">
                  {showInfo
                    ? <X className="h-4 w-4 text-foreground/70" />
                    : <Info className="h-4 w-4 text-white/80" />}
                </span>
              </button>

              <div className="p-6 md:p-8 flex items-center gap-5 min-h-[180px]">
                <img src={hekthorImg} alt="HEKTHOR" className="w-20 h-20 md:w-24 md:h-24 object-contain flex-shrink-0" />
                <div className="flex flex-col gap-2 pr-8">
                  <h3
                    className="text-base md:text-lg font-bold tracking-[0.2em] uppercase text-amber-300 pb-1.5 border-b border-white/20 drop-shadow-sm"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    The Character
                  </h3>
                  <p className="text-white text-base md:text-lg leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                    What's your dog's <span className="font-bold text-amber-300">personality</span> like?
                  </p>
                  <p className="text-xs md:text-sm text-amber-200/80" style={{ fontFamily: "'Cinzel', serif" }}>
                    Choose two options.
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{ backgroundColor: 'hsl(var(--papyrus))' }}
                  >
                    <div className="p-6 pt-12 md:pt-6 text-center max-w-sm">
                      <h4
                        className="text-sm md:text-base font-bold uppercase tracking-[0.15em] text-primary mb-3"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        Want something unique?
                      </h4>
                      <p
                        className="text-foreground/70 text-xs md:text-sm leading-relaxed"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        You can order a custom hand-drawn symbol made exclusively for your dog's specific quirk or toy as a premium paid feature. For now, pick the two that work for you!
                      </p>
                      <p
                        className="text-purple-400 text-xs md:text-sm leading-relaxed italic mt-2"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        This money goes directly to helping dogs in need!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 3. BLOCK - Horizontal slider */}
            <motion.div
              className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4 mt-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <div className="relative">
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center hover:bg-primary/10 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex gap-3 overflow-x-auto scrollbar-hide px-6 py-2 snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {tripleCharacters.map((char, idx) => {
                    if (char.isCustom) {
                      return (
                        <button
                          key={`${char.value}-${idx}`}
                          onClick={handleCustomClick}
                          className={`flex-shrink-0 relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all snap-start ${
                            customCharacter
                              ? 'border-purple-400 bg-purple-400/15 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                              : 'border-purple-400/50 hover:border-purple-400 hover:bg-purple-400/5'
                          }`}
                          style={{ fontFamily: "'Cinzel', serif", width: '100px' }}
                        >
                          <Sparkles className="h-10 w-10 text-purple-400" />
                          <span className="text-[9px] md:text-[10px] font-bold tracking-wider uppercase text-purple-400">
                            Custom
                          </span>
                          <span className="text-[11px] md:text-xs font-bold text-purple-300">
                            + 66$
                          </span>
                        </button>
                      );
                    }
                    const isSelected = selected.includes(char.value);
                    const selectionIndex = selected.indexOf(char.value);
                    return (
                      <button
                        key={`${char.value}-${idx}`}
                        onClick={() => handleSelect(char.value)}
                        className={`flex-shrink-0 relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all snap-start ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border/60 hover:border-primary/50'
                        }`}
                        style={{ fontFamily: "'Cinzel', serif", width: '100px' }}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {selectionIndex + 1}
                          </div>
                        )}
                        <img src={char.img!} alt={char.label} className="h-14 md:h-16 object-contain" />
                        <span className="text-[9px] md:text-[10px] font-bold tracking-wider uppercase whitespace-nowrap">
                          {char.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center hover:bg-primary/10 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-3" style={{ fontFamily: "'Cinzel', serif" }}>
                {selected.length}/2 selected
              </p>
            </motion.div>

            {/* Custom Character Modal — overlays blocks 2+3 */}
            <AnimatePresence>
              {showCustomModal && (
                <motion.div
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl overflow-hidden border-2 border-purple-400/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ backgroundColor: 'hsl(var(--papyrus))' }}
                >
                  <button
                    onClick={handleCancelCustom}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/10 transition-colors z-10"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>

                  <div className="w-full px-5 py-4 flex flex-col gap-3 max-w-md">
                    <div className="flex items-center gap-2 justify-center">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                      <h3
                        className="text-base font-bold tracking-[0.15em] uppercase text-purple-400"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        Custom Character
                      </h3>
                    </div>

                    <p
                      className="text-foreground/70 text-xs text-center leading-relaxed"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Let us craft a one-of-a-kind Character symbol for your dog, designed and sent for your review within 24 hours.
                    </p>

                    <textarea
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="e.g. She always carries a tiny teddy bear everywhere..."
                      className="w-full rounded-xl border-2 border-border/60 bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-purple-400 focus:outline-none resize-none transition-colors"
                      rows={3}
                      maxLength={300}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />

                    <div className="flex flex-col items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />

                      {customPhotoPreview ? (
                        <div className="relative w-full">
                          <img
                            src={customPhotoPreview}
                            alt="Custom character reference"
                            className="w-full h-24 object-cover rounded-xl border-2 border-purple-400/30"
                          />
                          <button
                            onClick={() => { setCustomPhoto(null); setCustomPhotoPreview(null); }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full rounded-xl border-2 border-dashed border-purple-400/40 py-3 flex flex-col items-center gap-1 hover:border-purple-400 hover:bg-purple-400/5 transition-colors"
                        >
                          <Image className="h-5 w-5 text-purple-400/60" />
                          <span className="text-[10px] font-bold tracking-wider uppercase text-purple-400/60" style={{ fontFamily: "'Cinzel', serif" }}>
                            Add Photo (optional)
                          </span>
                        </button>
                      )}
                    </div>

                    <p className="text-center text-purple-300 text-xs font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
                      + $66 premium feature
                    </p>

                    <button
                      onClick={handleConfirmCustom}
                      className="w-full rounded-full py-2.5 text-sm font-bold tracking-wider uppercase transition-all hover:scale-105"
                      style={{
                        fontFamily: "'Cinzel', serif",
                        background: 'linear-gradient(135deg, hsl(270 60% 50%), hsl(270 40% 35%))',
                        color: '#fff',
                        boxShadow: '0 0 20px rgba(168,85,247,0.3)',
                      }}
                    >
                      Confirm Custom Character
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Back button */}
          <button
            onClick={() => navigate('/dog-shape')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pb-6"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </div>
    </div>
  );
}
