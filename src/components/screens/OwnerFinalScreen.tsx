import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';

export function OwnerFinalScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-6 pb-3">
        <img src={dogyptLogo} alt="DOGYPT" className="h-16 md:h-20 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-5 py-4">
          {/* Heroglyph frame with title inside */}
          <motion.div
            className="w-full relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-2xl border-2 border-border papyrus-bg p-4">
              <h2
                className="text-center text-sm md:text-base font-bold tracking-[0.2em] uppercase text-primary mb-3"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {dogName || 'YOUR DOG'}'S HEROGLYPH
              </h2>
              <HeroglyphFrame showOwner className="text-foreground" />
            </div>
          </motion.div>

          {/* Hekthor message block */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-5 flex items-center gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-20 h-20 md:w-24 md:h-24 object-contain flex-shrink-0" />
            <div className="flex flex-col gap-3">
              <p className="text-foreground text-sm md:text-base leading-relaxed" style={{ fontFamily: "'Cinzel', serif" }}>
                HEY MAN, that little frame — that is you! Now let's fill{' '}
                <span className="font-bold text-primary">{dogName || 'YOUR DOG'}</span>'s story together.
              </p>
              <Button
                onClick={() => navigate('/dog-gender')}
                className="w-full rounded-full gap-2 h-12 px-6 text-base font-bold tracking-wider hover:scale-105 transition-transform"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                  color: '#000',
                  boxShadow: '0 0 30px hsl(var(--gold) / 0.4), 0 4px 15px rgba(0,0,0,0.3)',
                }}
              >
                LET'S GO <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
          {/* Back button */}
          <button
            onClick={() => navigate('/owner-zodiac')}
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
