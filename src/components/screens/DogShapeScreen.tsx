import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';

// Imports sorted by breed size (smallest → largest)
import chiuauaSvg from '@/assets/shapes/SIZE-CHIUAUA_1.svg';
import yorkSvg from '@/assets/shapes/SIZE-YORK_2.svg';
import bichonSvg from '@/assets/shapes/SIZE-BICHON_3.svg';
import dachshundSvg from '@/assets/shapes/SIZE-DACHSHUND_4.svg';
import frenchieSvg from '@/assets/shapes/SIZE-FRENCHIE_5.svg';
import jRusellSvg from '@/assets/shapes/SIZE-J.RUSELL_6.svg';
import beagleSvg from '@/assets/shapes/SIZE-BEAGLE_7.svg';
import cokerSvg from '@/assets/shapes/SIZE-COKER_8.svg';
import borderSvg from '@/assets/shapes/SIZE-BORDER_9.svg';
import stafordSvg from '@/assets/shapes/SIZE-STAFORD_10.svg';
import houndSvg from '@/assets/shapes/SIZE-HOUND_11.svg';
import otterhoundSvg from '@/assets/shapes/SIZE-OTTERHOUND_12.svg';
import schnauzerSvg from '@/assets/shapes/SIZE-SCHNAUZER_13.svg';
import bloodhoundSvg from '@/assets/shapes/SIZE-BLOODHOUND_14.svg';
import setterSvg from '@/assets/shapes/SIZE-SETTER_15.svg';
import greyhoundSvg from '@/assets/shapes/SIZE_16-GREYHOUND.svg';
import labradorSvg from '@/assets/shapes/SIZE_17-LABRADOR.svg';
import germanSvg from '@/assets/shapes/SIZE_18-GERMAN.svg';
import poodleSvg from '@/assets/shapes/SIZE_19-POODLE.svg';
import boxerSvg from '@/assets/shapes/SIZE_20-BOXER.svg';
import barbetSvg from '@/assets/shapes/SIZE_21-BARBET.svg';
import malamuteSvg from '@/assets/shapes/SIZE_22-MALAMUTE.svg';
import greatDaneSvg from '@/assets/shapes/SIZE_23-GREAT_DANE.svg';
import chuvachSvg from '@/assets/shapes/SIZE_24-CHUVACH.svg';
import assianSvg from '@/assets/shapes/SIZE_25-ASSIAN.svg';
import bullSvg from '@/assets/shapes/SIZE_26-BULL_3.svg';
import rottweilerSvg from '@/assets/shapes/SIZE_-_ROTTWEILER.svg';
import dobermannSvg from '@/assets/shapes/SIZE_-_DOBERMANN.svg';
import malteseSvg from '@/assets/shapes/SIZE_-_MALTESE.svg';
import samoyedSvg from '@/assets/shapes/SIZE018_-_SAMOYED.svg';

// Sorted by real breed size (smallest → largest)
const shapes = [
  { value: 'chiuaua', label: 'Chihuahua', img: chiuauaSvg },
  { value: 'maltese', label: 'Maltese', img: malteseSvg },
  { value: 'york', label: 'York', img: yorkSvg },
  { value: 'bichon', label: 'Bichon', img: bichonSvg },
  { value: 'dachshund', label: 'Dachshund', img: dachshundSvg },
  { value: 'frenchie', label: 'Frenchie', img: frenchieSvg },
  { value: 'j_rusell', label: 'J. Rusell', img: jRusellSvg },
  { value: 'beagle', label: 'Beagle', img: beagleSvg },
  { value: 'bull', label: 'Bull', img: bullSvg },
  { value: 'coker', label: 'Coker', img: cokerSvg },
  { value: 'schnauzer', label: 'Schnauzer', img: schnauzerSvg },
  { value: 'border', label: 'Border', img: borderSvg },
  { value: 'staford', label: 'Staford', img: stafordSvg },
  { value: 'poodle', label: 'Poodle', img: poodleSvg },
  { value: 'hound', label: 'Hound', img: houndSvg },
  { value: 'otterhound', label: 'Otterhound', img: otterhoundSvg },
  { value: 'bloodhound', label: 'Bloodhound', img: bloodhoundSvg },
  { value: 'setter', label: 'Setter', img: setterSvg },
  { value: 'greyhound', label: 'Greyhound', img: greyhoundSvg },
  { value: 'samoyed', label: 'Samoyed', img: samoyedSvg },
  { value: 'labrador', label: 'Labrador', img: labradorSvg },
  { value: 'german', label: 'German', img: germanSvg },
  { value: 'boxer', label: 'Boxer', img: boxerSvg },
  { value: 'barbet', label: 'Barbet', img: barbetSvg },
  { value: 'dobermann', label: 'Dobermann', img: dobermannSvg },
  { value: 'rottweiler', label: 'Rottweiler', img: rottweilerSvg },
  { value: 'malamute', label: 'Malamute', img: malamuteSvg },
  { value: 'great_dane', label: 'Great Dane', img: greatDaneSvg },
  { value: 'chuvach', label: 'Chuvach', img: chuvachSvg },
  { value: 'assian', label: 'Assian', img: assianSvg },
];

export function DogShapeScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const [selected, setSelected] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = (shape: string) => {
    setSelected(shape);
    setSelection('dogShape', shape);
    setTimeout(() => navigate('/dog-character'), 500);
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-12 md:h-14 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-5 py-4">
          {/* 1. BLOCK - Heroglyph preview */}
          <motion.div
            className="w-full relative mt-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 px-3" style={{ backgroundColor: 'hsl(36 33% 91%)' }}>
              <span className="text-xs md:text-sm font-bold tracking-widest text-primary whitespace-nowrap" style={{ fontFamily: "'Cinzel', serif" }}>
                {dogName || 'YOUR DOG'}'S HEROGLYPH
              </span>
            </div>
            <div className="rounded-2xl border-2 border-border papyrus-bg p-4">
              <HeroglyphFrame showOwner className="text-foreground" pulseSlot="dogShape" />
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
              <p className="text-base md:text-lg font-bold text-amber-300 mb-1">CHOOSE A PATRON</p>
              <p className="text-sm md:text-base leading-relaxed">
                What does that dog look like?
                <span className="block text-xs text-white/70 mt-1">(Choose according to the most similar body shape instead of according to the exact breed)</span>
              </p>
            </div>
          </motion.div>

          {/* 3. BLOCK - Horizontal slider */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            {/* Size labels */}
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
                XS
              </span>
              <div className="flex-1 mx-3 h-px bg-gradient-to-r from-muted-foreground/30 via-muted-foreground/10 to-muted-foreground/30" />
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
                XL
              </span>
            </div>

            {/* Slider with arrows */}
            <div className="relative">
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide px-6 py-2 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {shapes.map((shape) => (
                  <button
                    key={shape.value}
                    onClick={() => handleSelect(shape.value)}
                    className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all snap-start ${
                      selected === shape.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border/60 hover:border-primary/50'
                    }`}
                    style={{ fontFamily: "'Cinzel', serif", width: '100px' }}
                  >
                    <img src={shape.img} alt={shape.label} className="h-16 md:h-20 w-full object-contain" />
                    <span className="text-[9px] md:text-[10px] font-bold tracking-wider uppercase whitespace-nowrap">{shape.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/dog-bloodline')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pb-6"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </div>
    </div>
  );
}
