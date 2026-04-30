import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Info, X, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import hekthorImg from '@/assets/hekthor.png';
import { SegmentedDateInput } from '@/components/SegmentedDateInput';

export function NameScreen() {
  const navigate = useNavigate();
  const setDogName = useDogyptStore((s) => s.setDogName);
  const storedDogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const selections = useDogyptStore((s) => s.selections);

  const initialName = storedDogName || '';
  const today = new Date();
  const currentYear = today.getFullYear();
  const minYear = currentYear - 25;
  const maxYear = currentYear;

  const [input, setInput] = useState(initialName);
  const [day, setDay] = useState<string>(selections.birthdayDay || '');
  const [month, setMonth] = useState<string>(selections.birthdayMonth || '');
  const [year, setYear] = useState<string>(selections.birthdayYear || '');
  const [showInfo, setShowInfo] = useState(false);

  const trimmed = input.trim();
  const nameValid = trimmed.length >= 1 && trimmed.length <= 30;

  const dateValid = (() => {
    if (day.length !== 2 || month.length !== 2 || year.length !== 4) return false;
    const d = parseInt(day), m = parseInt(month), y = parseInt(year);
    if (m < 1 || m > 12) return false;
    if (y < minYear || y > maxYear) return false;
    const dim = new Date(y, m, 0).getDate();
    if (d < 1 || d > dim) return false;
    const dt = new Date(y, m - 1, d);
    return dt <= today;
  })();

  const canContinue = nameValid && dateValid;

  const handleSend = () => {
    if (!canContinue) return;
    setDogName(trimmed.toUpperCase());
    setSelection('birthdayDay', day);
    setSelection('birthdayMonth', month);
    setSelection('birthdayYear', year);
    navigate('/photo');
  };

  const handleDateChange = (d: string, m: string, y: string) => {
    setDay(d);
    setMonth(m);
    setYear(y);
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-3 pb-2 md:pt-5">
        <img src={dogyptLogo} alt="DOGYPT" className="h-8 md:h-12 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0">

          {/* Speech bubble */}
          <div
            className="w-full rounded-2xl relative overflow-hidden flex-shrink"
            style={{
              background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))',
            }}
          >
            {/* Info toggle button */}
            <button
              className="absolute top-3 right-3 z-20 flex items-center justify-center"
              style={{ width: 44, height: 44 }}
              aria-label="Info about Hekthor"
              onClick={() => setShowInfo((p) => !p)}
            >
              <span className="w-7 h-7 rounded-full border-2 border-foreground/40 flex items-center justify-center transition-colors hover:border-foreground/70">
                {showInfo
                  ? <X className="h-4 w-4 text-foreground/70" />
                  : <Info className="h-4 w-4 text-white/80" />}
              </span>
            </button>

            {/* Default front content */}
            <div className="px-4 py-3 md:p-5 flex flex-col items-center gap-2 md:gap-3">
              <img src={hekthorImg} alt="HEKTHOR" className="w-32 h-32 md:w-52 md:h-52 object-contain" />
              <p className="text-white text-center text-base md:text-xl leading-snug drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                Hi, I'm <span className="font-bold text-amber-300">HEKTHOR</span>. What's your dog's name?
              </p>
            </div>

            {/* Info overlay – papyrus light bg */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  className="absolute inset-0 z-10 flex flex-col rounded-2xl overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  style={{ backgroundColor: 'hsl(var(--papyrus))' }}
                >
                  {/* Content – equal padding all around, pt accounts for X button */}
                  <div className="relative z-10 p-4 pt-12 pb-4 md:p-5 md:pt-14 md:pb-5 flex-1 flex flex-col min-h-0">
                    {/* Two-column layout */}
                    <div className="flex gap-3 md:gap-4 flex-1 min-h-0 items-stretch overflow-hidden">
                      {/* Left column – video */}
                      <div className="w-[38%] md:w-[35%] flex-shrink-0 rounded-2xl overflow-hidden">
                        <video
                          src="/videos/WHO_IS_HEKTHOR.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      </div>

                      {/* Right column */}
                      <div className="flex-1 flex flex-col gap-1.5 md:gap-3 min-w-0 min-h-0 overflow-hidden md:justify-center">
                        <h3
                          className="text-base md:text-xl font-bold leading-tight"
                          style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}
                        >
                          WHO IS<br className="md:hidden" /> HEKTHOR?
                        </h3>

                        <p
                          className="text-foreground/80 text-[10px] md:text-sm leading-relaxed"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          Hekthor is the founding hero and the soul of DOGYPT. Rescued from a shelter, his loyalty inspired a global movement to honor dogs as gods. His mission is to forge a unique HEROGLYPH for every dog on Earth, uniting the world's largest community of dog lovers to help millions of dogs in need.
                        </p>

                        {/* Stats – stacked on mobile, decorative table on desktop */}
                        <div className="flex flex-col md:flex-row md:gap-0 gap-1.5 pt-2 flex-shrink-0">
                          {/* Mobile: simple stacked */}
                          <div className="flex flex-col gap-1.5 md:hidden">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>Born:</p>
                              <p className="text-foreground text-sm font-semibold">2016</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>Adopted:</p>
                              <p className="text-foreground text-sm font-semibold">2017</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>Location:</p>
                              <p className="text-foreground text-sm font-semibold">Slovakia, EU</p>
                            </div>
                          </div>

                          {/* Desktop: decorative open-table style */}
                          <div className="hidden md:flex md:gap-0 w-full rounded-lg border-2" style={{ borderColor: 'hsl(var(--gold-dark) / 0.35)' }}>
                            <div className="flex-1 flex flex-col items-center py-2.5">
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>Born</p>
                              <p className="text-foreground text-sm font-semibold">2016</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center py-2.5 border-l-2 border-r-2" style={{ borderColor: 'hsl(var(--gold-dark) / 0.35)' }}>
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>Adopted</p>
                              <p className="text-foreground text-sm font-semibold">2017</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center py-2.5">
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>Location</p>
                              <p className="text-foreground text-sm font-semibold">Slovakia, EU</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex-shrink-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="flex flex-col gap-2 md:gap-3">
            <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border/30">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase().slice(0, 30))}
                onKeyDown={(e) => { if (e.key === 'Enter' && canContinue) handleSend(); }}
                placeholder="Type your dog's name..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base md:text-lg uppercase"
                style={{ fontFamily: "'Inter', sans-serif" }}
                autoFocus
                maxLength={30}
              />
            </div>

            {/* Birthday — segmented numeric date input */}
            <SegmentedDateInput
              day={day}
              month={month}
              year={year}
              minYear={minYear}
              maxYear={maxYear}
              onChange={handleDateChange}
            />

            <Button
              onClick={handleSend}
              disabled={!canContinue}
              className="w-full rounded-full gap-2 h-10 md:h-11 font-bold tracking-wider hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                color: '#000',
                boxShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <PawPrint className="h-4 w-4" />
              Continue
            </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
