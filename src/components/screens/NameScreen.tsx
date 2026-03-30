import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo.png';
import hekthorImg from '@/assets/hekthor.png';

export function NameScreen() {
  const navigate = useNavigate();
  const setDogName = useDogyptStore((s) => s.setDogName);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setDogName(input.trim().toUpperCase());
    navigate('/photo');
  };

  return (
    <div className="papyrus-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-12 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-6 flex flex-col items-center gap-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
            <p className="text-foreground text-center text-xl md:text-2xl leading-relaxed whitespace-pre-line" style={{ fontFamily: "'Cinzel', serif" }}>
              {"Hi, I'm HEKTHOR.\nWhat's your dog's name?"}
            </p>
          </motion.div>

          <motion.div
            className="w-full rounded-2xl border border-border/40 p-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border/30">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Type your dog's name..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base md:text-lg"
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
            <p className="text-xs text-muted-foreground text-center mt-2 tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
              Thanks, man. Your dog will answer any further questions.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
