import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT } from '@/i18n/LanguageContext';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import hekthorImg from '@/assets/hekthor.png';

import guardianSvg from '@/assets/character/CHARACTER-GUARDIAN.svg';
import playerSvg from '@/assets/character/CHARACTER-PLAYER.svg';
import energizerSvg from '@/assets/character/CHARACTER-ENERGIZER.svg';
import maverickSvg from '@/assets/character/CHARACTER-MAVERICK.svg';
import waterloverSvg from '@/assets/character/CHARACTER-WATERLOVER.svg';
import gourmetSvg from '@/assets/character/CHARACTER-GOURMET.svg';
import loverSvg from '@/assets/character/CHARACTER-LOVER.svg';
import chillerSvg from '@/assets/character/CHARACTER-CHILLER.svg';

// value === asset basename (lowercase) so HeroglyphFrame's glob map keys match.
// labelKey → i18n; resolved via t() at render.
const characters = [
  { value: 'guardian', labelKey: 'heroglyph.flow.dogCharacter.trait.guardian', img: guardianSvg, isCustom: false },
  { value: 'player', labelKey: 'heroglyph.flow.dogCharacter.trait.player', img: playerSvg, isCustom: false },
  { value: 'energizer', labelKey: 'heroglyph.flow.dogCharacter.trait.energizer', img: energizerSvg, isCustom: false },
  { value: 'maverick', labelKey: 'heroglyph.flow.dogCharacter.trait.maverick', img: maverickSvg, isCustom: false },
  { value: 'waterlover', labelKey: 'heroglyph.flow.dogCharacter.trait.waterlover', img: waterloverSvg, isCustom: false },
  { value: 'gourmet', labelKey: 'heroglyph.flow.dogCharacter.trait.gourmet', img: gourmetSvg, isCustom: false },
  { value: 'lover', labelKey: 'heroglyph.flow.dogCharacter.trait.lover', img: loverSvg, isCustom: false },
  { value: 'chiller', labelKey: 'heroglyph.flow.dogCharacter.trait.chiller', img: chillerSvg, isCustom: false },
];

const tripleCharacters = [...characters, ...characters, ...characters];

export function DogCharacterScreen() {
  const navigate = useNavigate();
  const t = useT();
  const dogName = useDogyptStore((s) => s.dogName);
  const displayName = dogName || t('heroglyph.flow.yourDogFallback');
  const setSelection = useDogyptStore((s) => s.setSelection);
  const [selected, setSelected] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
        setTimeout(() => navigate('/heroglyph/reveal'), 600);
      }

      return next;
    });
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-[15px] pb-3 md:pt-6">
        <img src={dogyptLogo} alt="DOGYPT" className="h-9 md:h-12 object-contain" />
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
                {t('heroglyph.flow.dogHeroglyphTitle', { dogName: displayName })}
              </h2>
              <div className="px-2">
                <HeroglyphFrame showOwner className="text-foreground" pulseSlot="dogCharacter" />
              </div>
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
                aria-label={t('heroglyph.flow.dogCharacter.infoAria')}
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
                    {t('heroglyph.flow.dogCharacter.title')}
                  </h3>
                  <p className="text-white text-base md:text-lg leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                    {t('heroglyph.flow.dogCharacter.questionPrefix')}<span className="font-bold text-amber-300">{t('heroglyph.flow.dogCharacter.questionWord')}</span>{t('heroglyph.flow.dogCharacter.questionSuffix')}
                  </p>
                  <p className="text-xs md:text-sm text-amber-200/80" style={{ fontFamily: "'Cinzel', serif" }}>
                    {t('heroglyph.flow.dogCharacter.chooseTwo')}
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
                        {t('heroglyph.flow.dogCharacter.infoTitle')}
                      </h4>
                      <p
                        className="text-foreground/70 text-xs md:text-sm leading-relaxed"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {t('heroglyph.flow.dogCharacter.infoBody')}
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
                    const isSelected = selected.includes(char.value);
                    const selectionIndex = selected.indexOf(char.value);
                    return (
                      <button
                        key={`${char.value}-${idx}`}
                        onClick={() => handleSelect(char.value)}
                        className={`flex-shrink-0 relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all snap-start ${
                          isSelected
                            ? 'is-selected-purple'
                            : 'border-border/60 hover:border-primary/50'
                        }`}
                        style={{ fontFamily: "'Cinzel', serif", width: '100px' }}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {selectionIndex + 1}
                          </div>
                        )}
                        <img src={char.img!} alt={t(char.labelKey)} className="h-14 md:h-16 object-contain" />
                        <span className="text-[9px] md:text-[10px] font-bold tracking-wider uppercase whitespace-nowrap">
                          {t(char.labelKey)}
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
                {t('heroglyph.flow.dogCharacter.selectedCount', { count: selected.length })}
              </p>
            </motion.div>
          </div>

          {/* Back button */}
          <button
            onClick={() => navigate('/heroglyph/dog-bloodline')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pb-6"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-4 w-4" /> {t('heroglyph.flow.dogCharacter.back')}
          </button>
        </div>
      </div>
    </div>
  );
}
