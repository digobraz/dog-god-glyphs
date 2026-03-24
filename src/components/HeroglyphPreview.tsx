import { useDogyptStore } from '@/store/dogyptStore';
import { wizardSteps } from '@/lib/wizardSteps';
import { motion } from 'framer-motion';

interface Props {
  animate?: boolean;
  compact?: boolean;
}

export function HeroglyphPreview({ animate = false, compact = false }: Props) {
  const { dogName, selections } = useDogyptStore();

  const getEmoji = (key: string) => {
    const val = selections[key];
    if (!val) return null;
    const step = wizardSteps.find(s => s.key === key);
    if (!step?.options) {
      // For input/date derived values, the value IS the emoji
      return val;
    }
    const opt = step.options.find(o => o.value === val);
    return opt?.emoji || val;
  };

  const dogTraitKeys = ['sex', 'furColor', 'destiny', 'bloodline'];
  const ownerKeys = ['ownerSex', 'ownerInitial', 'westernZodiac', 'chineseZodiac', 'dogOrder'];
  const bottomKeys = ['trait1', 'trait2'];

  const Slot = ({ k, rotate, delay }: { k: string; rotate?: boolean; delay?: number }) => {
    const emoji = getEmoji(k);
    const content = emoji ? (
      <span className={`text-2xl ${compact ? 'text-xl' : ''} ${rotate ? 'inline-block rotate-90' : ''}`}>
        {emoji}
      </span>
    ) : (
      <span className="w-8 h-8 border-2 border-dashed border-muted-foreground/30 rounded inline-block" />
    );

    if (animate && emoji) {
      return (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay || 0, duration: 0.4, type: 'spring' }}
        >
          {content}
        </motion.span>
      );
    }
    return content;
  };

  const patronEmoji = getEmoji('patron');

  return (
    <div className={`flex flex-col items-center gap-3 ${compact ? 'gap-2' : ''}`}>
      {dogName && (
        <h3 className={`font-bold tracking-widest uppercase text-primary ${compact ? 'text-lg' : 'text-2xl'}`}
          style={{ fontFamily: 'Cinzel, serif', textShadow: animate ? '0 0 20px hsl(var(--gold) / 0.6)' : 'none' }}>
          {dogName}
        </h3>
      )}

      <div className={`cartouche-outer p-4 ${compact ? 'p-3' : 'p-6'} flex flex-col items-center gap-3`}>
        {/* Top row - dog traits */}
        <div className="flex items-center gap-4">
          {dogTraitKeys.map((k, i) => (
            <Slot key={k} k={k} delay={animate ? 0.5 + i * 0.25 : 0} />
          ))}
        </div>

        {/* Middle - patron + inner cartouche */}
        <div className="flex flex-col items-center gap-2">
          {patronEmoji ? (
            <motion.span
              className="text-4xl"
              initial={animate ? { scale: 0 } : undefined}
              animate={animate ? { scale: 1 } : undefined}
              transition={animate ? { delay: 1.5, type: 'spring' } : undefined}
            >
              {patronEmoji}
            </motion.span>
          ) : (
            <span className="w-12 h-12 border-2 border-dashed border-muted-foreground/30 rounded-full inline-flex items-center justify-center text-xs text-muted-foreground">🐕</span>
          )}

          <div className="cartouche-inner px-4 py-2 flex items-center gap-3">
            {ownerKeys.map((k, i) => (
              <Slot key={k} k={k} rotate={k === 'ownerInitial'} delay={animate ? 1.8 + i * 0.2 : 0} />
            ))}
          </div>
        </div>

        {/* Bottom row - traits */}
        <div className="flex items-center gap-4">
          {bottomKeys.map((k, i) => (
            <Slot key={k} k={k} delay={animate ? 2.8 + i * 0.25 : 0} />
          ))}
        </div>
      </div>
    </div>
  );
}
