import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo.png';
import hekthorImg from '@/assets/hekthor.png';

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const currentYear = new Date().getFullYear();

export function BirthdayDogScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const isValid = () => {
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);
    if (!d || !m || !y) return false;
    if (d < 1 || d > 31) return false;
    if (m < 1 || m > 12) return false;
    if (y < 1980 || y > currentYear) return false;
    return true;
  };

  const handleContinue = () => {
    if (!isValid()) return;
    setSelection('birthdayDay', day);
    setSelection('birthdayMonth', month);
    setSelection('birthdayYear', year);
    // navigate to next step
  };

  return (
    <div className="papyrus-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-12 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">
          {/* Question block */}
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-6 flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ background: 'hsl(var(--card) / 0.6)', backdropFilter: 'blur(8px)' }}
          >
            <img src={hekthorImg} alt="Hekthor" className="h-16 w-16 rounded-full border-2 border-primary object-cover" />
            <p className="text-center text-base md:text-lg" style={{ fontFamily: "'Cinzel', serif" }}>
              <span className="text-primary font-bold">{dogName || 'BUDDY'}</span>
              {' '}When do you celebrate your birthday?
            </p>
          </motion.div>

          {/* Date input block */}
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ background: 'hsl(var(--card) / 0.6)', backdropFilter: 'blur(8px)' }}
          >
            <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-center">
              {/* Day */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "'Cinzel', serif" }}>
                  Day
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={day}
                  onChange={e => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="DD"
                  className="w-full h-16 bg-transparent border-2 border-border/60 rounded-xl text-center text-2xl font-bold outline-none focus:border-primary transition-colors"
                  style={{ fontFamily: "'Cinzel', serif" }}
                />
              </div>

              {/* Month */}
              <div className="flex flex-col items-center gap-2 flex-[2]">
                <label className="text-xs uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "'Cinzel', serif" }}>
                  Month
                </label>
                <select
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="w-full h-16 bg-transparent border-2 border-border/60 rounded-xl text-center text-lg font-bold outline-none focus:border-primary transition-colors appearance-none cursor-pointer px-4"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  <option value="" disabled>Month</option>
                  {months.map((m, i) => (
                    <option key={m} value={String(i + 1)}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "'Cinzel', serif" }}>
                  Year
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={year}
                  onChange={e => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="YYYY"
                  className="w-full h-16 bg-transparent border-2 border-border/60 rounded-xl text-center text-2xl font-bold outline-none focus:border-primary transition-colors"
                  style={{ fontFamily: "'Cinzel', serif" }}
                />
              </div>
            </div>

            {/* Continue */}
            {isValid() && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
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

          {/* Back button */}
          <button
            onClick={() => navigate('/breed')}
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
