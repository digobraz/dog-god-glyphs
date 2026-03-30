import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { getChineseZodiac } from '@/lib/zodiac';
import dogyptLogo from '@/assets/dogypt-logo.png';
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
  { name: 'Aries', dates: 'Mar 21 – Apr 19', img: ariesSvg },
  { name: 'Taurus', dates: 'Apr 20 – May 20', img: taurusSvg },
  { name: 'Gemini', dates: 'May 21 – Jun 20', img: geminiSvg },
  { name: 'Cancer', dates: 'Jun 21 – Jul 22', img: cancerSvg },
  { name: 'Leo', dates: 'Jul 23 – Aug 22', img: leoSvg },
  { name: 'Virgo', dates: 'Aug 23 – Sep 22', img: virgoSvg },
  { name: 'Libra', dates: 'Sep 23 – Oct 22', img: libraSvg },
  { name: 'Scorpio', dates: 'Oct 23 – Nov 21', img: scorpioSvg },
  { name: 'Sagittarius', dates: 'Nov 22 – Dec 21', img: sagittariusSvg },
  { name: 'Capricorn', dates: 'Dec 22 – Jan 19', img: capricornSvg },
  { name: 'Aquarius', dates: 'Jan 20 – Feb 18', img: aquariusSvg },
  { name: 'Pisces', dates: 'Feb 19 – Mar 20', img: piscesSvg },
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

export function OwnerZodiacScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);

  // Western zodiac state
  const [zodiacSearch, setZodiacSearch] = useState('');
  const [selectedZodiac, setSelectedZodiac] = useState<typeof westernSigns[0] | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Chinese zodiac state
  const [yearInput, setYearInput] = useState('');
  const [chineseResult, setChineseResult] = useState<{ name: string; emoji: string } | null>(null);

  const filteredSigns = westernSigns.filter((s) =>
    s.name.toLowerCase().includes(zodiacSearch.toLowerCase())
  );
  const showDropdown = zodiacSearch.length > 0 && !selectedZodiac;

  const handleSelectZodiac = (sign: typeof westernSigns[0]) => {
    setSelectedZodiac(sign);
    setZodiacSearch(sign.name);
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
    // navigate to next step
  };

  return (
    <div className="papyrus-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-12 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-6 py-4">
          {/* Question block */}
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-6 flex flex-col items-center gap-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
            <p className="text-foreground text-center text-xl md:text-2xl leading-relaxed" style={{ fontFamily: "'Cinzel', serif" }}>
              What do the stars say about your master?
            </p>
          </motion.div>

          {/* 1. Western Zodiac */}
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-4 flex flex-col gap-3"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground text-center" style={{ fontFamily: "'Cinzel', serif" }}>
              Zodiac Sign
            </p>

            <div className="flex items-center gap-3">
              {/* Search input */}
              <div className="flex-1 relative">
                <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border/30">
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <input
                    ref={searchRef}
                    value={zodiacSearch}
                    onChange={(e) => { setZodiacSearch(e.target.value); setSelectedZodiac(null); }}
                    placeholder="Search zodiac sign..."
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  {zodiacSearch && (
                    <button onClick={() => { setZodiacSearch(''); setSelectedZodiac(null); }} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {showDropdown && filteredSigns.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/40 rounded-xl max-h-48 overflow-y-auto z-10 shadow-lg p-2">
                    <div className="flex flex-col gap-1">
                      {filteredSigns.map((sign) => (
                        <button
                          key={sign.name}
                          onClick={() => handleSelectZodiac(sign)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors text-left"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          <img src={sign.img} alt={sign.name} className="h-6 w-6 object-contain" />
                          <span className="text-sm font-medium">{sign.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{sign.dates}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Symbol preview box */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-border/60 bg-card/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {selectedZodiac ? (
                  <motion.div
                    key={selectedZodiac.name}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img src={selectedZodiac.img} alt={selectedZodiac.name} className="h-10 md:h-12 object-contain" />
                  </motion.div>
                ) : (
                  <span className="text-muted-foreground/30 text-2xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
                    ?
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* 2. Chinese Zodiac */}
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-4 flex flex-col gap-3"
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
                  placeholder="Year of birth (e.g. 1990)"
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  inputMode="numeric"
                />
              </div>

              {/* Symbol preview box */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-border/60 bg-card/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {chineseResult ? (
                  <motion.div
                    key={chineseResult.name}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    {chineseAnimalImages[chineseResult.name] ? (
                      <img src={chineseAnimalImages[chineseResult.name]} alt={chineseResult.name} className="h-10 md:h-12 object-contain" />
                    ) : (
                      <span className="text-2xl">{chineseResult.emoji}</span>
                    )}
                  </motion.div>
                ) : (
                  <span className="text-muted-foreground/30 text-2xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
                    ?
                  </span>
                )}
              </div>
            </div>

            {chineseResult && (
              <p className="text-xs text-muted-foreground text-center" style={{ fontFamily: "'Cinzel', serif" }}>
                Year of the {chineseResult.name} {chineseResult.emoji}
              </p>
            )}
          </motion.div>

          {/* Continue button */}
          {canContinue && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
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
