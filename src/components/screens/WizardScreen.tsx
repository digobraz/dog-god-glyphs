import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDogyptStore } from '@/store/dogyptStore';
import { wizardSteps, toRoman } from '@/lib/wizardSteps';
import { getChineseZodiac, getWesternZodiac } from '@/lib/zodiac';
import { HeroglyphPreview } from '@/components/HeroglyphPreview';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function WizardScreen() {
  const { currentStep, setStep, selections, setSelection } = useDogyptStore();
  const stepIndex = currentStep - 2; // steps 2-13 map to wizardSteps 0-11
  const step = wizardSteps[stepIndex];
  const isMobile = useIsMobile();
  const [yearInput, setYearInput] = useState('');
  const [date, setDate] = useState<Date>();
  const [direction, setDirection] = useState(1);

  const progress = ((stepIndex + 1) / wizardSteps.length) * 100;

  const advance = useCallback((delay = 800) => {
    setTimeout(() => {
      setDirection(1);
      if (stepIndex < wizardSteps.length - 1) {
        setStep(currentStep + 1);
      } else {
        setStep(14); // reveal
      }
    }, delay);
  }, [currentStep, stepIndex, setStep]);

  const handleSelect = (value: string) => {
    setSelection(step.key, value);
    advance();
  };

  const handleYearSubmit = () => {
    const year = parseInt(yearInput);
    if (year > 1900 && year < 2030) {
      const zodiac = getChineseZodiac(year);
      setSelection('chineseZodiac', zodiac.emoji);
      advance(400);
    }
  };

  const handleDateSelect = (d: Date | undefined) => {
    if (d) {
      setDate(d);
      const zodiac = getWesternZodiac(d.getMonth() + 1, d.getDate());
      setSelection('westernZodiac', zodiac.emoji);
      advance(400);
    }
  };

  const disabledTrait2 = step.key === 'trait2' ? selections['trait1'] : null;

  const renderOptions = () => {
    if (step.type === 'input') {
      return (
        <div className="flex flex-col items-center gap-4">
          <input
            value={yearInput}
            onChange={e => setYearInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={e => e.key === 'Enter' && handleYearSubmit()}
            placeholder="e.g. 1990"
            className="w-48 bg-transparent border-b-4 border-primary text-center text-2xl font-bold py-3 outline-none"
            autoFocus
          />
          <Button onClick={handleYearSubmit} disabled={yearInput.length !== 4}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold">
            CALCULATE →
          </Button>
        </div>
      );
    }

    if (step.type === 'date') {
      return (
        <div className="flex flex-col items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-64 justify-center text-lg py-6 border-2 border-primary rounded-full", !date && "text-muted-foreground")}>
                {date ? format(date, 'MMMM d') : 'Pick your birthday'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar mode="single" selected={date} onSelect={handleDateSelect}
                className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    const isGrid = step.type === 'grid';
    return (
      <div className={`${isGrid ? 'grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2' : 'flex flex-wrap justify-center gap-3'} max-w-2xl`}>
        {step.options?.map(opt => {
          const isSelected = selections[step.key] === opt.value;
          const isDisabled = disabledTrait2 === opt.value;

          return (
            <motion.button
              key={opt.value}
              onClick={() => !isDisabled && handleSelect(opt.value)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.05 } : undefined}
              whileTap={!isDisabled ? { scale: 0.95 } : undefined}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                isGrid ? 'p-2 text-sm' : 'min-w-[120px] p-4',
                isSelected ? 'gold-glow border-primary bg-primary/10' : 'border-muted hover:border-primary/50',
                isDisabled && 'opacity-30 cursor-not-allowed'
              )}
            >
              <span className={isGrid ? 'text-xl' : 'text-3xl'}>{opt.emoji}</span>
              <span className="text-xs font-medium tracking-wide uppercase">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>
    );
  };

  const preview = (
    <div className="p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
        Live Preview
      </p>
      <HeroglyphPreview compact />
    </div>
  );

  return (
    <div className="papyrus-bg min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="p-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs tracking-widest text-muted-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
              STEP {toRoman(stepIndex + 1)} OF XII
            </span>
            {stepIndex > 0 && (
              <button onClick={() => { setDirection(-1); setStep(currentStep - 1); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                ← BACK
              </button>
            )}
          </div>
          <div className="cartouche overflow-hidden h-3 !p-0 !rounded-full bg-secondary">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 pb-32 lg:pb-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.key}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center gap-6"
            >
              <h2 className="text-xl md:text-2xl font-bold tracking-widest text-center" style={{ fontFamily: 'Cinzel, serif' }}>
                {step.title}
              </h2>
              {step.subtitle && (
                <p className="text-muted-foreground text-center">{step.subtitle}</p>
              )}
              {renderOptions()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop sidebar preview */}
        {!isMobile && (
          <div className="w-80 border-l border-primary/20 bg-card/50 flex items-center justify-center">
            {preview}
          </div>
        )}

        {/* Mobile bottom drawer */}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <button className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-bold tracking-wider shadow-lg"
                style={{ fontFamily: 'Cinzel, serif', boxShadow: '0 0 20px hsl(var(--gold) / 0.4)' }}>
                VIEW HEROGLYPH ↑
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="papyrus-bg rounded-t-3xl max-h-[70vh]">
              {preview}
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
}
