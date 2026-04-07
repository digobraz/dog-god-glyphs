import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const slides = [
  {
    tag: '12 000 BC | AIN MALLAHA',
    title: 'It all started with a gentle touch...',
    body: 'In the ancient ruins of Ain Mallaha, archaeologists found a 12,000-year-old skeleton — a human hand resting on a puppy. The first proof of unconditional love.',
    full: 'This discovery in modern-day Israel remains one of the most significant archaeological findings about the human-canine bond. A young person was buried with their hand carefully placed on a small puppy, suggesting a deep emotional connection that transcended mere utility. This wasn\'t a working animal — this was a beloved companion, marking the dawn of an eternal partnership.',
  },
  {
    tag: '3000 BC | ANCIENT EGYPT',
    title: 'When dogs became gods.',
    body: 'The Egyptians didn\'t just love dogs — they worshipped them. Anubis, the jackal-headed god, guarded the gates of the afterlife.',
    full: 'In ancient Egypt, dogs held a sacred status unlike anywhere else in the ancient world. The god Anubis, depicted with a jackal head, was the guardian of the dead and the guide of souls. When a family dog died, the entire household would shave their eyebrows in mourning. Dogs were mummified with the same care as pharaohs, ensuring their journey to the afterlife alongside their beloved humans.',
  },
  {
    tag: '500 AD | MEDIEVAL EUROPE',
    title: 'Loyal knights on four legs.',
    body: 'Medieval lords engraved their dogs into family crests. Loyalty wasn\'t just a human virtue — it was learned from dogs.',
    full: 'Throughout medieval Europe, dogs became symbols of fidelity and noble character. Knights included greyhounds and other breeds in their heraldic coats of arms as symbols of loyalty and courage. The famous story of Gelert, the faithful hound of Welsh prince Llewelyn, became a legend that echoed through centuries — a tale of ultimate loyalty and tragic misunderstanding that still moves hearts today.',
  },
  {
    tag: '1500 AD | RENAISSANCE',
    title: 'Immortalized in masterpieces.',
    body: 'From Velázquez to Titian, the greatest artists painted dogs not as accessories, but as souls with stories.',
    full: 'The Renaissance brought a revolution in how dogs were depicted in art. No longer mere background elements, dogs became central figures in masterpieces. Velázquez painted them with the same dignity as royals. Titian gave them expressive eyes that seemed to hold ancient wisdom. These artists understood what science would later confirm — dogs possess emotional depth that rivals our own.',
  },
  {
    tag: '1800s | THE AGE OF EXPLORATION',
    title: 'Companions to the unknown.',
    body: 'Every great explorer had a dog by their side. From Arctic expeditions to uncharted territories, dogs led the way.',
    full: 'The 19th century saw dogs become indispensable partners in humanity\'s greatest adventures. Sled dogs carried explorers across the frozen Arctic. Hounds accompanied settlers into the American frontier. In every expedition journal, you\'ll find entries about faithful dogs who provided warmth, warning, and unwavering companionship in the most hostile environments on Earth.',
  },
  {
    tag: '1900s | WORLD AT WAR',
    title: 'Heroes without medals.',
    body: 'In the darkest hours of humanity, dogs served as medics, messengers, and morale. They saved thousands of lives.',
    full: 'During both World Wars, dogs performed extraordinary acts of bravery. Sergeant Stubby, a stray Boston Terrier, became the most decorated war dog in American history, saving his regiment from mustard gas attacks and capturing a German spy. Thousands of dogs served as Red Cross medics, locating wounded soldiers on battlefields. They asked for nothing in return — only the chance to help.',
  },
  {
    tag: 'THROUGH THE AGES',
    title: 'They never gave up on us.',
    body: 'Through plagues, wars, and disasters — dogs stayed. When the world fell apart, they held it together.',
    full: 'Throughout every crisis in human history, dogs have remained our steadfast companions. During the Great Plague, when humans fled from each other in terror, dogs stayed loyal. In natural disasters, they\'ve been found guarding their families for days without food or water. This unwavering devotion spans millennia and transcends every culture, every border, every conflict.',
  },
  {
    tag: '1957 | BEYOND THE SKY',
    title: 'The first earthling in space was a dog.',
    body: 'Laika, a stray from Moscow\'s streets, became the first living being to orbit Earth. A small dog took one giant leap for all of us.',
    full: 'On November 3, 1957, a small mixed-breed dog named Laika was launched into orbit aboard Sputnik 2, becoming the first earthling to journey into space. Found as a stray on the streets of Moscow, she was chosen for her calm temperament and resilience. Though she never returned, her sacrifice paved the way for human spaceflight and stands as a testament to the extraordinary role dogs have played in advancing human civilization.',
  },
  {
    tag: '2026 | THE PRESENT',
    title: 'Now it\'s our turn.',
    body: '500 million dogs need help. The bond that started 12,000 years ago demands action. DOGYPT is the answer.',
    full: 'Today, over 500 million dogs live as strays worldwide. Millions are abandoned, abused, or forgotten. Yet the bond between humans and dogs has never been stronger — dog adoption rates are rising, veterinary science is advancing, and a global community of dog lovers is forming. DOGYPT was born from this moment — a movement to honor every dog with a unique HEROGLYPH and to channel the power of the world\'s largest dog-loving community into real change.',
  },
];

function StoryModal({ idx, onClose }: { idx: number; onClose: () => void }) {
  const slide = slides[idx];
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <motion.div
        className="relative z-10 max-w-xl w-full rounded-2xl p-8 max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(196,155,66,0.3)' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
        <span className="text-xs tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}>
          {slide.tag}
        </span>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
          {slide.title}
        </h3>
        <p className="text-white/70 text-base leading-relaxed">{slide.full}</p>
      </motion.div>
    </motion.div>
  );
}

function StoryCard({ slide, index, onReadStory }: { slide: typeof slides[0]; index: number; onReadStory: () => void }) {
  const isLast = index === slides.length - 1;

  return (
    <div className="flex-shrink-0 w-screen h-screen relative flex flex-col md:flex-row">
      <div className="relative w-full md:w-[60%] h-[40vh] md:h-full">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 40% 50%, rgba(163,120,43,0.12) 0%, rgba(0,0,0,0.97) 70%)`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
          <span className="text-[20vw] font-black" style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}>
            {index + 1}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black md:hidden" />
      </div>

      <div className="relative w-full md:w-[40%] h-[60vh] md:h-full bg-black flex items-center">
        <div className="relative z-10 p-8 md:p-12 lg:p-16 w-full">
          <span
            className="text-xs md:text-sm tracking-[0.2em] uppercase mb-4 block"
            style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}
          >
            {slide.tag}
          </span>
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {slide.title}
          </h2>
          <p className="text-white/60 text-sm md:text-base mb-8 leading-relaxed">
            {slide.body}
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onReadStory}
              className="px-6 py-2.5 rounded-full text-sm font-semibold tracking-wider border transition-colors hover:bg-white/10"
              style={{ fontFamily: "'Cinzel', serif", color: '#C49B42', borderColor: '#C49B42' }}
            >
              Read Story
            </button>
            {isLast && (
              <a
                href="#vision"
                className="px-6 py-2.5 rounded-full text-sm font-semibold tracking-wider border-2 border-white/30 transition-transform hover:scale-105"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
                  color: '#000',
                  boxShadow: '0 0 30px hsl(39 80% 50% / 0.3)',
                }}
              >
                Vision
              </a>
            )}
          </div>

          <div className="absolute bottom-6 right-8 text-white/20 text-xs" style={{ fontFamily: "'Cinzel', serif" }}>
            {index + 1} / {slides.length}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StorySection() {
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['0vw', `-${(slides.length - 1) * 100}vw`]);

  return (
    <>
      <section
        id="story"
        ref={containerRef}
        className="relative bg-black"
        style={{ height: `${slides.length * 100}vh` }}
      >
        {/* Snap page targets for scroll hijacking */}
        {slides.map((_, i) => (
          <div key={`snap-${i}`} className="h-screen" data-snap-page />
        ))}
        {/* Sticky visual layer pulled back to top via negative margin */}
        <div
          className="sticky top-0 h-screen w-full overflow-hidden"
          style={{ marginTop: `-${slides.length * 100}vh` }}
        >
          <motion.div className="flex h-full" style={{ x }}>
            {slides.map((slide, i) => (
              <StoryCard key={i} slide={slide} index={i} onReadStory={() => setModalIdx(i)} />
            ))}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {modalIdx !== null && <StoryModal idx={modalIdx} onClose={() => setModalIdx(null)} />}
      </AnimatePresence>
    </>
  );
}
