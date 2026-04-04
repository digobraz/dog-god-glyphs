import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Send, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';

export function NameScreen() {
  const navigate = useNavigate();
  const setDogName = useDogyptStore((s) => s.setDogName);
  const [input, setInput] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setDogName(input.trim().toUpperCase());
    navigate('/photo');
  };

  const toggleFlip = () => setIsFlipped((prev) => !prev);

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-6 pb-3">
        <img src={dogyptLogo} alt="DOGYPT" className="h-16 md:h-20 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">

          {/* Flip card container */}
          <div
            className="w-full"
            style={{ perspective: '1200px' }}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
            onClick={toggleFlip}
          >
            <motion.div
              className="relative w-full"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              {/* FRONT */}
              <div
                className="w-full rounded-2xl p-6 flex flex-col items-center gap-4 relative"
                style={{
                  background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))',
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* Info icon */}
                <button
                  className="absolute top-3 right-3 flex items-center justify-center"
                  style={{ width: 44, height: 44 }}
                  aria-label="Info about Hekthor"
                  onClick={(e) => { e.stopPropagation(); toggleFlip(); }}
                >
                  <span className="w-7 h-7 rounded-full border-2 border-white/60 flex items-center justify-center">
                    <Info className="h-4 w-4 text-white/80" />
                  </span>
                </button>

                <img src={hekthorImg} alt="HEKTHOR" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
                <p className="text-white text-center text-xl md:text-2xl leading-relaxed whitespace-pre-line drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                  Hi, I'm <span className="font-bold" style={{ color: '#C49B42' }}>HEKTHOR</span>.{'\n'}What's your dog's name?
                </p>
              </div>

              {/* BACK */}
              <div
                className="w-full rounded-2xl p-6 absolute top-0 left-0 overflow-y-auto"
                style={{
                  background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                {/* Image/GIF placeholder */}
                <div className="w-full h-40 rounded-xl bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center mb-5">
                  <span className="text-white/50 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>Image / GIF</span>
                </div>

                <h3 className="text-white text-center text-xl md:text-2xl font-bold mb-4" style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}>
                  WHO IS HEKTHOR?
                </h3>

                <div className="text-white/90 text-sm md:text-base leading-relaxed space-y-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <p><b className="text-white">STATS:</b></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Born: 2016</li>
                    <li>Adopted: 2017</li>
                    <li>Location: Slovakia, EU</li>
                  </ul>

                  <p>
                    <b className="text-white">STORY:</b><br />
                    Hekthor is the founding hero and the soul of DOGYPT. Rescued from a shelter, his loyalty inspired a global movement to honor dogs as gods. His mission is to forge a unique HEROGLYPH for every dog on Earth, uniting the world's largest community of dog lovers to help millions of dogs in need.
                  </p>
                </div>
              </div>
            </motion.div>
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
