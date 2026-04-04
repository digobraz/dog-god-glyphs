import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { getChineseZodiac } from '@/lib/zodiac';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';

import ariesSvg from '@/assets/zodiac/ZODIAC-ARIES.svg';
import taurusSvg from '@/assets/zodiac/ZODIAC-TAURUS.svg';
import geminiSvg from '@/assets/zodiac/ZODIAC-GEMINI.svg';
import cancerSvg from '@/assets/zodiac/ZODIAC-CANCER.svg';
import leoSvg from '@/assets/zodiac/ZODIAC-LEO.svg';
import virgoSvg from '@/assets/zodiac/ZODIAC-VIRGO.svg';
import libraSvg from '@/assets/zodiac/ZODIAC-LIBRA.svg';
import sagittariusSvg from '@/assets/zodiac/ZODIAC-SAGITTARIUS.svg';
import capricornSvg from '@/assets/zodiac/ZODIAC-CAPRICORN.svg';
import aquariusSvg from '@/assets/zodiac/ZODIAC-AQUARIUS.svg';
import scorpioSvg from '@/assets/zodiac/ZODIAC-SCORPIO.svg';
import piscesSvg from '@/assets/zodiac/ZODIAC-PISCES.svg';

import chineseSnakeSvg from '@/assets/chinese/CHINESE_SIGN-SNAKE.svg';
import chineseDogSvg from '@/assets/chinese/CHINESE_SIGN-DOG.svg';
import chineseTigerSvg from '@/assets/chinese/CHINESE_SIGN-TIGER.svg';
import chineseHornSvg from '@/assets/chinese/CHINESE_SIGN-HORN.svg';
import chineseDragonSvg from '@/assets/chinese/CHINESE_SIGN-DRAGON.svg';
import chineseRoasterSvg from '@/assets/chinese/CHINESE_SIGN-ROASTER.svg';
import chinesePigSvg from '@/assets/chinese/CHINESE_SIGN-PIG.svg';
import chineseHorseSvg from '@/assets/chinese/CHINESE_SIGN-HORSE.svg';
import chineseRatSvg from '@/assets/chinese/CHINESE_SIGN-RAT.svg';
import chineseRabbitSvg from '@/assets/chinese/CHINESE_SIGN-RABBIT.svg';
import chineseApeSvg from '@/assets/chinese/CHINESE_SIGN-APE.svg';
import chineseGoatSvg from '@/assets/chinese/CHINESE_SIGN-GOAT.svg';

const westernSigns = [
  { name: 'Aries', img: ariesSvg },
  { name: 'Taurus', img: taurusSvg },
  { name: 'Gemini', img: geminiSvg },
  { name: 'Cancer', img: cancerSvg },
  { name: 'Leo', img: leoSvg },
  { name: 'Virgo', img: virgoSvg },
  { name: 'Libra', img: libraSvg },
  { name: 'Scorpio', img: scorpioSvg },
  { name: 'Sagittarius', img: sagittariusSvg },
  { name: 'Capricorn', img: capricornSvg },
  { name: 'Aquarius', img: aquariusSvg },
  { name: 'Pisces', img: piscesSvg },
];

const chineseAnimalImages: Record<string, string> = {
  Monkey: chineseApeSvg,
  Rooster: chineseRoasterSvg,
  Dog: chineseDogSvg,
  Pig: chinesePigSvg,
  Rat: chineseRatSvg,
  Ox: chineseHornSvg,
  Tiger: chineseTigerSvg,
  Rabbit: chineseRabbitSvg,
  Dragon: chineseDragonSvg,
  Snake: chineseSnakeSvg,
  Horse: chineseHorseSvg,
  Goat: chineseGoatSvg,
};

function ScrollableStrip({
  children,
  scrollRef,
}: {
  children: React.ReactNode;
  scrollRef: React.RefObject<HTMLDivElement>;
}) {
  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const atStart = el.scrollLeft <= 4;

    if (dir === 'right' && atEnd) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (dir === 'left' && atStart) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => scroll('left')}
        className="flex-shrink-0 w-7 h-7 rounded-full border border-border/40 bg-card/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div
        ref={scrollRef}
        className="flex-1 flex gap-2 overflow-x-auto py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll('right')}
        className="flex-shrink-0 w-7 h-7 rounded-full border border-border/40 bg-card/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function OwnerZodiacScreen() {
  const navigate = useNavigate();
  const setSelection = useDogyptStore((s) => s.setSelection);

  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null);
  const [yearInput, setYearInput] = useState('');
  const [chineseResult, setChineseResult] = useState<{ name: string; emoji: string } | null>(null);

  const westernScrollRef = useRef<HTMLDivElement>(null);

  const handleSelectZodiac = (sign: typeof westernSigns[0]) => {
    setSelectedZodiac(sign.name);
    setSelection('ownerZodiac', sign.name);
  };

  const handleYearChange = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 4);
    setYearInput(clean);
    if (clean.length === 4) {
      const year = parseInt(clean);
      if (year > 1900 && year < 2030) {
        const zodiac = getChineseZodiac(year);
        setChineseResult(zodiac);
        setSelection('ownerChineseZodiac', zodiac.name);
      } else {
        setChineseResult(null);
      }
    } else {
      setChineseResult(null);
    }
  };

  const canContinue = !!selectedZodiac && !!chineseResult;

  const handleContinue = () => {
    if (!canContinue) return;
    navigate('/owner-final');
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-6 pb-3">
        <img src={dogyptLogo} alt="DOGYPT" className="h-16 md:h-20 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-5 py-4">
          {/* Question block */}
          <motion.div
            className="w-full rounded-2xl p-6 flex flex-col items-center gap-4" style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
            <p className="text-white text-center text-xl md:text-2xl leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
              What do the stars say about you?
            </p>
          </motion.div>

          {/* Both zodiacs side by side */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Western Zodiac */}
            <motion.div
              className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4 flex flex-col gap-3"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground text-center" style={{ fontFamily: "'Cinzel', serif" }}>
                Zodiac Sign
              </p>

              <ScrollableStrip scrollRef={westernScrollRef}>
                {westernSigns.map((sign) => (
                  <button
                    key={sign.name}
                    onClick={() => handleSelectZodiac(sign)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-14 ${
                      selectedZodiac === sign.name
                        ? 'bg-primary/20 border-2 border-primary ring-1 ring-primary/30 scale-105'
                        : 'border border-border/30 hover:bg-card/80 hover:border-border/60'
                    }`}
                  >
                    <img src={sign.img} alt={sign.name} className="h-8 w-8 object-contain" />
                    <span className="text-[8px] text-muted-foreground leading-none truncate w-full text-center" style={{ fontFamily: "'Cinzel', serif" }}>
                      {sign.name}
                    </span>
                  </button>
                ))}
              </ScrollableStrip>
            </motion.div>

            {/* 2. Chinese Zodiac */}
            <motion.div
              className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4 flex flex-col gap-3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground text-center" style={{ fontFamily: "'Cinzel', serif" }}>
                Chinese Zodiac
              </p>

              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border/30">
                  <input
                    value={yearInput}
                    onChange={(e) => handleYearChange(e.target.value)}
                    placeholder="Year of birth"
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    inputMode="numeric"
                  />
                </div>

                <div className="w-14 h-14 rounded-xl border-2 border-border/60 bg-card/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {chineseResult ? (
                    <motion.div
                      key={chineseResult.name}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {chineseAnimalImages[chineseResult.name] ? (
                        <img src={chineseAnimalImages[chineseResult.name]} alt={chineseResult.name} className="h-10 object-contain" />
                      ) : (
                        <span className="text-2xl">{chineseResult.emoji}</span>
                      )}
                    </motion.div>
                  ) : (
                    <span className="text-muted-foreground/30 text-2xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>?</span>
                  )}
                </div>
              </div>

              {chineseResult && (
                <p className="text-xs text-muted-foreground text-center" style={{ fontFamily: "'Cinzel', serif" }}>
                  Year of the {chineseResult.name}
                </p>
              )}
            </motion.div>
          </div>

          {/* Continue button */}
          {canContinue && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
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

          {/* Back button */}
          <button
            onClick={() => navigate('/owner-gender')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </div>
    </div>
  );
}
