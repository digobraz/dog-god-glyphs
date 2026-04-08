import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const slides = [
  {
    tag: '~12,000 YEARS AGO · NORTHERN ISRAEL',
    title: 'It all started with a gentle touch...',
    video: 'https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590313/STORY-1_quhcaj.mp4',
    videoPosition: '-150px 100px',
    videoPositionTablet: '-300px 100px',
    videoPositionMobile: '-150px 90px',
    full: 'In 1978, archaeologists in northern Israel opened a 12,000-year-old grave. Inside lay a woman on her side, one hand resting gently on a puppy. No tools. No weapons. Just two souls, side by side. This is the oldest known evidence of the human-dog bond — proof that long before we built cities or invented writing, we already knew who our best friend was.',
  },
  {
    tag: 'ANCIENT GREECE · HOMER\'S ODYSSEY',
    title: 'That forged a mythical loyalty',
    video: 'https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590315/STORY-2_hwu17c.mp4',
    videoPosition: 'calc(50% - 150px) calc(50% + 50px)',
    videoPositionTablet: 'calc(50% - 150px) calc(50% + 50px)',
    videoPositionMobile: 'calc(50% - 100px) calc(50% + 50px)',
    full: 'In Homer\'s Odyssey, the hero Odysseus returns home after twenty years of war, disguised as a beggar. His own wife doesn\'t recognize him. But his old dog Argos — neglected, lying on a dung heap — lifts his ears, wags his tail one last time, and dies. Twenty years of waiting for a single moment. It\'s fiction. But 2,800 years later, it still makes people cry. That tells you everything about dogs.',
  },
  {
    tag: '13TH CENTURY · FRANCE',
    title: 'Endured the gravest injustice',
    video: 'https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590314/STORY-3_jtaog8.mp4',
    full: 'A greyhound named Guinefort killed a venomous snake to protect his master\'s baby. The knight came home, saw blood everywhere, and killed the dog without looking twice. Then he found his child — alive, unharmed, the snake dead beside the crib. Local villagers were so heartbroken they declared Guinefort a saint. The Catholic Church tried to shut it down for centuries. They never could.',
  },
  {
    tag: '1793 · PARIS, FRANCE',
    title: 'Brought hope into the darkness',
    video: 'https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590313/STORY-4_rlxoko.mp4',
    videoPositionMobile: '50% calc(50% + 20px)',
    full: 'During the French Revolution, future empress Joséphine sat in a prison cell awaiting the guillotine. The only visitor the guards allowed was her pug, Fortuné. What they didn\'t know: hidden under his collar were secret messages between Joséphine and the outside world. A tiny pug outsmarted the Reign of Terror. Joséphine survived — and never forgot who saved her.',
  },
  {
    tag: '19TH CENTURY · SWISS ALPS',
    title: 'Melted the ice through selfless sacrifice',
    video: 'https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590313/STORY-5_cwmuoh.mp4',
    videoPosition: '50% calc(50% + 50px)',
    videoPositionTablet: '50% calc(50% + 50px)',
    videoPositionMobile: '50% calc(50% + 50px)',
    full: 'Barry, a Saint Bernard at a monastery high in the Alps, saved over 40 people buried in avalanches during his lifetime. He\'d find them under the snow, lie on their bodies for warmth, and lick their frozen faces until they woke up. When he died in 1814, they preserved his body. You can still visit him today at the Natural History Museum in Bern.',
  },
  {
    tag: '1928 · NEW YORK CITY',
    title: 'Became our very senses',
    video: 'https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590314/STORY-6_q53uew.mp4',
    videoPosition: '50% calc(50% + 100px)',
    videoPositionTablet: '50% calc(50% + 100px)',
    videoPositionMobile: '50% calc(50% + 100px)',
    full: 'Morris Frank lost both eyes in two separate accidents before he turned seventeen. In 1928, he traveled to Switzerland and came back with Buddy — a German Shepherd and America\'s first guide dog. When reporters doubted a dog could lead a blind man, Morris had Buddy walk him across one of the busiest streets in Manhattan. His telegram to the trainer read just one word: "Success." That crossing launched the guide dog movement worldwide.',
  },
  {
    tag: '1925 · NOME, ALASKA',
    title: 'Pushed beyond physical limits',
    video: 'https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590315/STORY-7_k4tdjs.mp4',
    videoPosition: '50% calc(50% + 100px)',
    videoPositionTablet: '50% calc(50% + 100px)',
    videoPositionMobile: '50% calc(50% + 100px)',
    full: 'Children in Nome, Alaska were dying of diphtheria. The only antitoxin was 1,000 km away. Twenty dog sled teams ran a desperate relay through –40°C blizzards. Balto became famous for finishing the last leg. But Togo — a 12-year-old husky — covered the longest and deadliest stretch: 264 miles across cracking sea ice in whiteout conditions. He was the real hero. Most people just never learned his name.',
  },
  {
    tag: '1957 · EARTH ORBIT',
    title: 'And propelled humanity to the stars',
    video: 'https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590314/STORY-8_b2vhcn.mp4',
    full: 'Laika was a stray from the streets of Moscow. In 1957, Soviet scientists strapped her into a tiny capsule and launched her into orbit. She became the first living creature in space. There was no plan to bring her back. Her heartbeat, transmitted from above the Earth, proved life could survive the journey — and opened the door to human spaceflight. We owe the stars to a homeless dog.',
  },
  {
    tag: '2017 → TODAY',
    title: '...so we could build a world where dog is god.',
    video: 'https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590313/STORY-9_ajc1mz.mp4',
    videoPosition: '50% calc(50% + 50px)',
    videoPositionTablet: '50% calc(50% + 50px)',
    videoPositionMobile: '50% calc(50% + 50px)',
    full: 'In 2017, a shelter dog named Hektor found his way to a new home — and sparked a question that wouldn\'t go away: after 12,000 years of loyalty, sacrifice, and love, what have we truly given back? DOGYPT was born from the answer. Your dog isn\'t just a pet. They carry the same spirit as every hero in this timeline. It\'s time we honored that. Welcome to the place where DOG is GOD.',
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
        <button onClick={onClose} className="absolute top-4 right-4 text-[#FAF4EC]/50 hover:text-[#FAF4EC] transition-colors">
          <X className="h-5 w-5" />
        </button>
        <span className="text-xs tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: "'Cinzel', serif", color: '#FAF4EC' }}>
          {slide.tag}
        </span>
        <h3 className="text-2xl md:text-3xl font-bold text-[#C49B42] mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
          {slide.title}
        </h3>
        <p className="text-[#FAF4EC]/70 text-base leading-relaxed">{slide.full}</p>
      </motion.div>
    </motion.div>
  );
}

function StoryCard({ slide, index, onReadStory }: { slide: typeof slides[0]; index: number; onReadStory: () => void }) {
  const isLast = index === slides.length - 1;
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsTablet(w >= 768 && w < 1024);
      setIsMobile(w < 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const videoPos = isMobile && slide.videoPositionMobile
    ? slide.videoPositionMobile
    : isTablet && slide.videoPositionTablet
      ? slide.videoPositionTablet
      : slide.videoPosition;

  const mobileFullHeight = isMobile && slide.videoPositionMobile;

  return (
    <div className="flex-shrink-0 w-screen h-screen relative flex flex-col md:flex-row">
      <div className={`relative w-full md:w-[60%] ${isMobile ? 'h-[75vh]' : ''} md:h-full`}>
        {slide.video && (
          <>
            <video
              src={slide.video}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={videoPos ? { objectPosition: videoPos } : undefined}
            />
            <div className="absolute inset-0 bg-black/25" />
          </>
        )}
        <div
          className="absolute inset-0"
            style={{
            background: isMobile
              ? 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.58) 100%)'
              : 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 12%, transparent 30%, transparent 70%, rgba(0,0,0,0.4) 88%, rgba(0,0,0,0.97) 100%), linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 15%, transparent 40%)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
          <span className="text-[20vw] font-black" style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}>
            {index + 1}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-b from-transparent to-black md:hidden z-[1]" />
      </div>

      <div className={`absolute bottom-0 left-0 right-0 z-[2] md:relative md:w-[40%] md:h-full md:bg-black flex ${isMobile ? 'items-start' : 'items-center'} bg-transparent`} style={isMobile ? { bottom: '100px' } : undefined}>
        <div className={`relative z-10 ${isMobile ? 'px-6 py-3' : 'p-8'} md:p-12 lg:p-16 w-full`}>
          <span
            className={`text-xs md:text-sm tracking-[0.2em] uppercase ${isMobile ? 'mb-2' : 'mb-6'} block`}
            style={{ fontFamily: "'Cinzel', serif", color: '#FAF4EC' }}
          >
            {slide.tag}
          </span>
          <h2
            className={`${isMobile ? 'text-2xl mb-4' : 'text-3xl mb-10'} md:text-4xl lg:text-5xl font-bold text-[#C49B42] leading-tight`}
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {slide.title}
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onReadStory}
              className="px-6 py-2.5 rounded-sm text-sm font-semibold tracking-wider border transition-colors hover:bg-[#FAF4EC]/10"
              style={{ fontFamily: "'Cinzel', serif", color: '#FAF4EC', borderColor: '#FAF4EC' }}
            >
              Read Story
            </button>
            {isLast && (
              <a
                href="#vision"
                className="px-6 py-2.5 rounded-sm text-sm font-semibold tracking-wider border-2 border-[#FAF4EC]/30 transition-transform hover:scale-105"
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

          <div className="absolute bottom-6 right-8 text-[#FAF4EC]/20 text-xs" style={{ fontFamily: "'Cinzel', serif" }}>
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

  // Expose modal state globally so LandingPage scroll handler can close it
  useEffect(() => {
    (window as any).__storyModalClose = () => {
      if (modalIdx !== null) {
        setModalIdx(null);
        return true; // was open
      }
      return false;
    };
    return () => { delete (window as any).__storyModalClose; };
  }, [modalIdx]);

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
        {slides.map((_, i) => (
          <div key={`snap-${i}`} className="h-screen" data-snap-page />
        ))}
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
