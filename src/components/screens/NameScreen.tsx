import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Send, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';

export function NameScreen() {
  const navigate = useNavigate();
  const setDogName = useDogyptStore((s) => s.setDogName);
  const [input, setInput] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setDogName(input.trim().toUpperCase());
    navigate('/photo');
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-6 pb-3">
        <img src={dogyptLogo} alt="DOGYPT" className="h-16 md:h-20 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">

          {/* Speech bubble */}
          <div
            className="w-full rounded-2xl relative overflow-hidden"
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
            <div className="p-6 flex flex-col items-center gap-4">
              <img src={hekthorImg} alt="HEKTHOR" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
              <p className="text-white text-center text-xl md:text-2xl leading-relaxed whitespace-pre-line drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                Hi, I'm <span className="font-bold text-amber-300">HEKTHOR</span>.{'\n'}What's your dog's name?
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
                    <div className="flex gap-3 md:gap-4 flex-1 min-h-0">
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
                      <div className="flex-1 flex flex-col gap-1.5 md:gap-2 min-w-0 min-h-0 overflow-hidden">
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

                        {/* Stats – stacked on mobile, row on desktop */}
                        <div className="flex flex-col md:flex-row md:gap-4 gap-1.5 pt-2 flex-shrink-0">
                          <div className="flex items-center gap-1.5 md:flex-col md:text-center">
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>Born:</p>
                            <p className="text-foreground text-sm font-semibold">2016</p>
                          </div>
                          <div className="flex items-center gap-1.5 md:flex-col md:text-center">
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>Adopted:</p>
                            <p className="text-foreground text-sm font-semibold">2017</p>
                          </div>
                          <div className="flex items-center gap-1.5 md:flex-col md:text-center">
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>Location:</p>
                            <p className="text-foreground text-sm font-semibold">SK, EU</p>
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
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border/30">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Type your dog's name..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base md:text-lg uppercase"
                style={{ fontFamily: "'Inter', sans-serif" }}
                autoFocus
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                size="icon"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/80 h-9 w-9 flex-shrink-0 disabled:opacity-30"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
