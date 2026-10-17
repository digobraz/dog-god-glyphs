// Odkaz majiteľa v jazyku stránky + prepínač na originál (Matej 18. 10. 2026).
// Preložený text je cudzí osobný odkaz — prepínač nechá prečítať presne to, čo človek napísal.
import { useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { useDogMessage } from '@/lib/dogMessages';

/** `toggle={false}` = len preložený text (bublinka na guli má orezaný počet riadkov, prepínač by sa do nej nezmestil). */
export function DogMessage({ n, text, className, toggle = true }: { n: number | null | undefined; text: string; className?: string; toggle?: boolean }) {
  const t = useT();
  const { text: tr, translated } = useDogMessage(n, text);
  const [orig, setOrig] = useState(false);
  if (!text) return null;
  // Prepínač stojí ZA odsekom, nie v ňom — odsek býva orezaný na N riadkov
  // (`-webkit-line-clamp`) a tlačidlo vnútri by orez schoval.
  return (
    <>
      <p className={className}>{translated && !orig ? tr : text}</p>
      {translated && toggle && (
        <button
          type="button"
          className="dm-toggle"
          onClick={(e) => { e.stopPropagation(); setOrig((o) => !o); }}
        >
          {t(orig ? 'wall.msg.showTr' : 'wall.msg.showOrig')}
        </button>
      )}
    </>
  );
}

/** Štýl prepínača — tichý odkaz pod textom, atrament ako stavový riadok karty (.pp-status). */
export const DOG_MESSAGE_CSS = `
  .dm-toggle {
    display: block; margin: 4px auto 0; padding: 0; border: 0; background: none;
    font: 500 12px/1.4 'Space Grotesk', sans-serif; font-style: normal;
    color: rgba(42,22,8,0.62); text-decoration: underline; text-underline-offset: 2px; cursor: pointer;
  }
  .dm-toggle:hover { color: rgba(42,22,8,0.9); }
`;
