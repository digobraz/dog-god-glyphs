import { X } from 'lucide-react';
import { useDogyptStore } from '@/store/dogyptStore';

export function CustomCharacterBadge() {
  const customCharacter = useDogyptStore((s) => s.customCharacter);
  const setCustomCharacter = useDogyptStore((s) => s.setCustomCharacter);

  if (!customCharacter) return null;

  return (
    <div className="flex justify-center mt-2">
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-purple-400 bg-purple-400/10"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        <span className="text-[10px] font-bold tracking-wider uppercase text-purple-400">
          Custom Character
        </span>
        <button
          onClick={() => setCustomCharacter(false)}
          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-purple-400/20 transition-colors"
          aria-label="Remove custom character"
        >
          <X className="h-3 w-3 text-purple-400" />
        </button>
      </div>
    </div>
  );
}
