import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';

import watcherSvg from '@/assets/character/CHARACTER-WATCHER.svg';
import playfulSvg from '@/assets/character/CHARACTER-PLAYFUL.svg';
import hyperactiveSvg from '@/assets/character/CHARACTER-HYPERACTIVE.svg';
import pirateSvg from '@/assets/character/CHARACTER-PIRATE.svg';
import waterloverSvg from '@/assets/character/CHARACTER-WATERLOVER.svg';
import gourmetSvg from '@/assets/character/CHARACTER-GOURMET.svg';
import loverSvg from '@/assets/character/CHARACTER-LOVER.svg';
import chillmanSvg from '@/assets/character/CHARACTER-CHILLMAN.svg';

const characters = [
  { value: 'watcher', label: 'Watcher', img: watcherSvg },
  { value: 'playful', label: 'Playful', img: playfulSvg },
  { value: 'hyperactive', label: 'Hyperactive', img: hyperactiveSvg },
  { value: 'pirate', label: 'Pirate', img: pirateSvg },
  { value: 'waterlover', label: 'Water Lover', img: waterloverSvg },
  { value: 'gourmet', label: 'Gourmet', img: gourmetSvg },
  { value: 'lover', label: 'Lover', img: loverSvg },
  { value: 'chillman', label: 'Chillman', img: chillmanSvg },
];

export function DogCharacterScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (value: string) => {
    setSelected((prev) => {
      let next: string[];
      if (prev.includes(value)) {
        next = prev.filter((v) => v !== value);
      } else if (prev.length < 2) {
        next = [...prev, value];
      } else {
        // Replace the second selection
        next = [prev[0], value];
      }

      if (next.length === 2) {
        setSelection('dogCharacter1', next[0]);
        setSelection('dogCharacter2', next[1]);
        setTimeout(() => navigate('/heroglyph-reveal'), 600);
      }

      return next;
    });
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-6 pb-3">
        <img src={dogyptLogo} alt="DOGYPT" className="h-16 md:h-20 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-5 py-4">
          {/* 1. BLOCK - Heroglyph preview with pulsing right slots */}
          <motion.div
            className="w-full relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-2xl border-2 border-border papyrus-bg px-6 pt-6 pb-6">
              <h2
                className="text-center text-base md:text-lg font-bold tracking-[0.2em] uppercase text-primary mb-3"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {dogName || 'YOUR DOG'}'S HEROGLYPH
              </h2>
              <div className="px-2">
                <HeroglyphFrame showOwner className="text-foreground" pulseSlot="dogCharacter" />
              </div>
            </div>
          </motion.div>

          {/* 2. BLOCK - Hekthor question */}
          <motion.div
            className="w-full rounded-2xl p-5 flex items-center gap-5"
            style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-20 h-20 md:w-24 md:h-24 object-contain flex-shrink-0" />
            <div className="text-white drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
              <p className="text-base md:text-lg leading-relaxed">
                What's your dog's <span className="font-bold text-amber-300">personality</span> like?
              </p>
              <p className="text-xs md:text-sm text-amber-200/80 mt-1">Choose two options.</p>
            </div>
          </motion.div>

          {/* 3. BLOCK - 8 character options, pick 2 */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4 md:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <div className="grid grid-cols-4 gap-3">
              {characters.map((char) => {
                const isSelected = selected.includes(char.value);
                const selectionIndex = selected.indexOf(char.value);
                return (
                  <button
                    key={char.value}
                    onClick={() => handleSelect(char.value)}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border/60 hover:border-primary/50'
                    }`}
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {selectionIndex + 1}
                      </div>
                    )}
                    <img src={char.img} alt={char.label} className="h-12 md:h-16 object-contain" />
                    <span className="text-[9px] md:text-[10px] font-bold tracking-wider uppercase text-foreground">
                      {char.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3" style={{ fontFamily: "'Cinzel', serif" }}>
              {selected.length}/2 selected
            </p>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/dog-shape')}
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
