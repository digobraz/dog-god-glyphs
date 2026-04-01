import { motion } from 'framer-motion';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';

export function VisionScreen() {
  const setStep = useDogyptStore(s => s.setStep);

  return (
    <div className="dark-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        className="flex flex-col items-center gap-8 max-w-2xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
          WELCOME TO DOGYPT
        </h2>

        {/* Video placeholder */}
        <div className="w-full aspect-video bg-muted/50 rounded-2xl border-2 border-primary/30 flex items-center justify-center">
          <span className="text-5xl">▶️</span>
        </div>

        <div className="flex flex-col gap-4 text-lg">
          <p>🌍 <strong>Global Community</strong> — Join dog lovers worldwide</p>
          <p>❤️ <strong>Help Dogs in Need</strong> — Every HEROGLYPH supports rescue missions</p>
          <p>🏛️ <strong>Eternal Legacy</strong> — Your dog's spirit, immortalized</p>
        </div>

        <Button
          onClick={() => setStep(16)}
          className="px-8 py-5 text-lg font-bold tracking-wider bg-primary text-primary-foreground hover:bg-primary/80 rounded-full"
          style={{ fontFamily: 'Cinzel, serif', boxShadow: '0 0 30px hsl(var(--gold) / 0.4)' }}
        >
          CLAIM YOUR HEROGLYPH →
        </Button>
      </motion.div>
    </div>
  );
}
