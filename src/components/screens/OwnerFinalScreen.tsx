import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import dogyptLogo from '@/assets/dogypt-logo.png';
import hekthorImg from '@/assets/hekthor.png';

export function OwnerFinalScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);

  return (
    <div className="papyrus-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-12 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-5 py-4">
          {/* Heroglyph frame with border-breaking label */}
          <motion.div
            className="w-full relative mt-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Border-breaking label */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 px-3" style={{ backgroundColor: 'hsl(36 33% 91%)' }}>
              <span className="text-xs md:text-sm font-bold tracking-widest text-primary whitespace-nowrap" style={{ fontFamily: "'Cinzel', serif" }}>
                {dogName || 'YOUR DOG'}'S HEROGLYPH
              </span>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <HeroglyphFrame showOwner className="text-foreground" />
            </div>
          </motion.div>

          {/* Hekthor message block */}
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-5 flex items-center gap-5"
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
                onClick={() => navigate('/breed')}
                className="w-fit rounded-full bg-primary text-primary-foreground hover:bg-primary/80 gap-2 h-10 px-5 text-sm"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                LET'S GO <ArrowRight className="h-4 w-4" />
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
