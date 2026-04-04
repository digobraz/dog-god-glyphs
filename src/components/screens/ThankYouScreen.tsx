import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import thankYouHero from '@/assets/thank-you-hero.png';

export function ThankYouScreen() {
  const navigate = useNavigate();
  const { reset } = useDogyptStore();

  const handleReturn = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* Logo */}
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-14 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pb-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col gap-4">

          {/* BLOCK 1 – Gradient hero */}
          <motion.div
            className="w-full rounded-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="p-5 flex flex-col items-center gap-3 text-center">
              <img
                src={thankYouHero}
                alt="Thank you"
                className="w-44 h-44 md:w-52 md:h-52 object-contain"
              />

              <p
                className="text-white text-sm md:text-base leading-relaxed"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Your Heroglyph is more than a beautiful symbol—it's a statement that{' '}
                <span className="font-bold text-amber-300">every dog deserves love</span>{' '}
                and a better life. Be proud of the footprint you've left today!
              </p>

              <p
                className="text-lg md:text-xl font-bold tracking-widest text-amber-300 mt-1"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                MATEJ & HEKTHOR
              </p>
            </div>
          </motion.div>

          {/* BLOCK 2 – Next Steps */}
          <motion.div
            className="w-full rounded-2xl papyrus-bg p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3
              className="text-center text-lg font-bold tracking-[0.15em] uppercase mb-4"
              style={{
                fontFamily: "'Cinzel', serif",
                color: 'hsl(var(--heading-on-light))',
              }}
            >
              NEXT STEPS
            </h3>

            <div className="flex flex-col gap-3">
              {[
                {
                  emoji: '🗣️',
                  title: 'Tell your pack',
                  desc: 'Share our mission with friends.',
                },
                {
                  emoji: '📲',
                  title: 'Share your Heroglyph',
                  desc: 'Show the world your unique bond!',
                },
                {
                  emoji: '🌍',
                  title: 'Follow us',
                  desc: 'See exactly how you help dogs in need.',
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl px-3 py-2"
                  style={{ backgroundColor: 'hsl(var(--papyrus-light))' }}
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{step.emoji}</span>
                  <div>
                    <p
                      className="font-bold text-sm tracking-wide"
                      style={{ color: 'hsl(var(--heading-on-light))' }}
                    >
                      {i + 1}. {step.title}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'hsl(var(--heading-on-light) / 0.7)' }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleReturn}
              className="mt-4 w-full py-3.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all hover:scale-105 border-2 border-white/30"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
                color: '#000',
                boxShadow: '0 0 40px hsl(var(--gold) / 0.4)',
              }}
            >
              FINISH
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
