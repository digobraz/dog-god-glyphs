import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT } from '@/i18n/LanguageContext';
import { getChineseZodiac } from '@/lib/zodiac';
import { WheelYearPicker } from '@/components/WheelDatePicker';
import { PageTopBar } from '@/components/PageTopBar';
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

const DEFAULT_YEAR = 1990;

export function OwnerZodiacScreen() {
  const navigate = useNavigate();
  const t = useT();
  const setSelection = useDogyptStore((s) => s.setSelection);
  const savedZodiac = useDogyptStore((s) => s.selections.ownerZodiac);
  const savedChinese = useDogyptStore((s) => s.selections.ownerChineseZodiac);

  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(savedZodiac || null);
  const [yearValue, setYearValue] = useState(DEFAULT_YEAR);
  const [yearTouched, setYearTouched] = useState(!!savedChinese);
  const [chineseResult, setChineseResult] = useState<{ name: string; emoji: string } | null>(
    savedChinese ? getChineseZodiac(DEFAULT_YEAR) : null
  );

  const westernScrollRef = useRef<HTMLDivElement>(null);

  const handleSelectZodiac = (sign: typeof westernSigns[0]) => {
    setSelectedZodiac(sign.name);
    setSelection('ownerZodiac', sign.name);
  };

  const handleYearChange = (year: number) => {
    setYearValue(year);
    setYearTouched(true);
    const zodiac = getChineseZodiac(year);
    setChineseResult(zodiac);
    setSelection('ownerChineseZodiac', zodiac.name);
  };

  const canContinue = !!selectedZodiac && yearTouched;

  const handleContinue = () => {
    if (!canContinue) return;
    navigate('/heroglyph/owner-final');
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <PageTopBar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-5 py-4">
          {/* Question block */}
          <motion.div
            className="w-full rounded-2xl p-6 flex flex-col items-center gap-4" style={{ background: 'var(--brand-gradient)' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-36 h-36 md:w-56 md:h-56 object-contain" />
            <p className="text-white text-center text-base md:text-2xl leading-relaxed drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
              {t('heroglyph.flow.ownerZodiac.question')}
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
                {t('heroglyph.flow.ownerZodiac.westernLabel')}
              </p>

              <ScrollableStrip scrollRef={westernScrollRef}>
                {westernSigns.map((sign) => (
                  <button
                    key={sign.name}
                    onClick={(e) => { handleSelectZodiac(sign); e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-14 border-2 ${
                      selectedZodiac === sign.name
                        ? 'is-selected-purple scale-105'
                        : 'border-border/30 hover:bg-card/80 hover:border-border/60'
                    }`}
                  >
                    <img src={sign.img} alt={t(`heroglyph.flow.ownerZodiac.sign.${sign.name}`)} className="h-8 w-8 object-contain" />
                    <span className="text-[8px] text-muted-foreground leading-none truncate w-full text-center" style={{ fontFamily: "'Cinzel', serif" }}>
                      {t(`heroglyph.flow.ownerZodiac.sign.${sign.name}`)}
                    </span>
                  </button>
                ))}
              </ScrollableStrip>
            </motion.div>

            {/* 2. Chinese Zodiac */}
            <motion.div
              className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4 flex flex-col gap-3 overflow-hidden"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground text-center" style={{ fontFamily: "'Cinzel', serif" }}>
                {t('heroglyph.flow.ownerZodiac.chineseLabel')}
              </p>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <WheelYearPicker year={yearValue} minYear={1930} maxYear={new Date().getFullYear()} onChange={handleYearChange} />
                </div>

                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center overflow-hidden ${chineseResult ? 'is-selected-purple' : 'border-border/60 bg-card/50'}`}>
                    {chineseResult ? (
                      <motion.img
                        key={chineseResult.name}
                        src={chineseAnimalImages[chineseResult.name]}
                        alt={t(`heroglyph.flow.ownerZodiac.animal.${chineseResult.name}`)}
                        className="h-10 object-contain"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    ) : (
                      <span className="text-muted-foreground/30 text-2xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>?</span>
                    )}
                  </div>
                  <span className="text-[8px] text-muted-foreground leading-none truncate w-14 text-center" style={{ fontFamily: "'Cinzel', serif" }}>
                    {chineseResult ? t(`heroglyph.flow.ownerZodiac.animal.${chineseResult.name}`) : ''}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Continue button */}
          {canContinue && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              <Button
                onClick={handleContinue}
                className="w-full rounded-xl h-11 font-bold tracking-wider hover:scale-[1.02] transition-transform"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                  color: '#000',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
                }}
              >
                {t('heroglyph.flow.ownerZodiac.continue')}
              </Button>
            </motion.div>
          )}

          {/* Back button */}
          <button
            onClick={() => navigate('/heroglyph/owner-info')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-4 w-4" /> {t('heroglyph.flow.ownerZodiac.back')}
          </button>
        </div>
      </div>
    </div>
  );
}
