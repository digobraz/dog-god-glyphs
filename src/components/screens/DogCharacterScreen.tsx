import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT } from '@/i18n/LanguageContext';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { PageTopBar } from '@/components/PageTopBar';
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

// Slideshow data — purely informational, does NOT affect selection
const slides = [
  { value: 'guardian', img: guardianSvg, descKey: 'heroglyph.flow.dogCharacter.slide.guardian.desc' },
  { value: 'player', img: playerSvg, descKey: 'heroglyph.flow.dogCharacter.slide.player.desc' },
  { value: 'energizer', img: energizerSvg, descKey: 'heroglyph.flow.dogCharacter.slide.energizer.desc' },
  { value: 'maverick', img: maverickSvg, descKey: 'heroglyph.flow.dogCharacter.slide.maverick.desc' },
  { value: 'waterlover', img: waterloverSvg, descKey: 'heroglyph.flow.dogCharacter.slide.waterlover.desc' },
  { value: 'gourmet', img: gourmetSvg, descKey: 'heroglyph.flow.dogCharacter.slide.gourmet.desc' },
  { value: 'lover', img: loverSvg, descKey: 'heroglyph.flow.dogCharacter.slide.lover.desc' },
  { value: 'chiller', img: chillerSvg, descKey: 'heroglyph.flow.dogCharacter.slide.chiller.desc' },
];

// Map trait value → labelKey (reuse existing trait keys)
const traitLabelKey: Record<string, string> = Object.fromEntries(
  characters.map((c) => [c.value, c.labelKey])
);

export function DogCharacterScreen() {
  const navigate = useNavigate();
  const t = useT();
  const dogName = useDogyptStore((s) => s.dogName);
  const displayName = dogName || t('heroglyph.flow.yourDogFallback');
  const setSelection = useDogyptStore((s) => s.setSelection);
  const [selected, setSelected] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Swipe support for the slideshow
  const touchStartX = useRef<number | null>(null);

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

  const goSlide = (dir: 1 | -1) => {
    setSlideDir(dir);
    setSlideIndex((i) => (i + dir + slides.length) % slides.length);
  };

  const currentSlide = slides[slideIndex];

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <PageTopBar />

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
            {/* 2. BLOCK - Hekthor question (gradient) — back side = slideshow */}
            <motion.div
              className="w-full rounded-2xl relative overflow-hidden"
              style={{ background: 'var(--brand-gradient)', minHeight: '160px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {/* Info toggle button */}
              <button
                className="absolute top-3 right-3 z-20 flex items-center justify-center"
                style={{ width: 44, height: 44 }}
                aria-label={t('heroglyph.flow.dogCharacter.infoAria')}
                onClick={() => setShowInfo((p) => !p)}
              >
                <span
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors"
                  style={showInfo
                    ? { borderColor: 'hsl(35 60% 30% / 0.5)' }
                    : { borderColor: 'rgba(255,255,255,0.4)' }}
                >
                  {showInfo
                    ? <X className="h-4 w-4" style={{ color: 'hsl(35 60% 25%)' }} />
                    : <Info className="h-4 w-4 text-white/80" />}
                </span>
              </button>

              {/* ── Hekthor header row ── */}
              <div className="px-5 py-3 md:py-4 flex items-center gap-5">
                <img src={hekthorImg} alt="HEKTHOR" className="w-20 h-20 md:w-24 md:h-24 object-contain flex-shrink-0" />
                <div className="flex flex-col gap-1.5 pr-8">
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

              {/* Info overlay — back side = slideshow */}
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    className="absolute inset-0 z-10 rounded-2xl overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{ backgroundColor: 'hsl(var(--papyrus))' }}
                    onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                    onTouchEnd={(e) => {
                      if (touchStartX.current === null) return;
                      const dx = e.changedTouches[0].clientX - touchStartX.current;
                      if (Math.abs(dx) > 40) goSlide(dx < 0 ? 1 : -1);
                      touchStartX.current = null;
                    }}
                  >
                    {/* Watermark SVG — gold-tinted, tuned for papyrus */}
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={`wm-${slideIndex}`}
                        src={currentSlide.img}
                        alt=""
                        aria-hidden="true"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] object-contain pointer-events-none select-none"
                        style={{
                          opacity: 0.13,
                          filter: 'brightness(0) sepia(1) saturate(4) hue-rotate(5deg)',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.13 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      />
                    </AnimatePresence>

                    {/* Slide content */}
                    <AnimatePresence mode="wait" custom={slideDir}>
                      <motion.div
                        key={`slide-${slideIndex}`}
                        custom={slideDir}
                        variants={{
                          enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
                          center: { x: 0, opacity: 1 },
                          exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="relative z-10 px-5 pt-10 pb-10"
                      >
                        <p
                          className="text-base md:text-lg font-bold uppercase tracking-[0.15em] mb-1"
                          style={{ fontFamily: "'Cinzel', serif", color: 'hsl(35 65% 20%)' }}
                        >
                          {t(`heroglyph.flow.dogCharacter.slide.${currentSlide.value}.title`)}
                        </p>
                        <p
                          className="text-xs md:text-sm leading-relaxed"
                          style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--foreground) / 0.75)' }}
                        >
                          {t(currentSlide.descKey)}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Pagination counter — tap to advance */}
                    <button
                      onClick={() => goSlide(1)}
                      aria-label={t('heroglyph.flow.dogCharacter.slideAriaLabel')}
                      className="absolute right-3 bottom-2 z-20"
                    >
                      <span
                        className="text-sm font-bold tracking-[0.1em]"
                        style={{ fontFamily: "'Cinzel', serif", color: 'hsl(35 65% 22%)' }}
                      >
                        {slideIndex + 1}/{slides.length}
                      </span>
                    </button>
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
