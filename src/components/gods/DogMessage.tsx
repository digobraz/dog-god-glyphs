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
  return (
    <p className={className}>
      {translated && !orig ? tr : text}
      {translated && toggle && (
        <button
          type="button"
          className="dm-toggle"
          onClick={(e) => { e.stopPropagation(); setOrig((o) => !o); }}
        >
          {t(orig ? 'wall.msg.showTr' : 'wall.msg.showOrig')}
        </button>
      )}
    </p>
  );
}

/** Štýl prepínača — tichý odkaz pod textom, farbu berie z textu odkazu. */
export const DOG_MESSAGE_CSS = `
  .dm-toggle {
    display: block; margin: 4px auto 0; padding: 0; border: 0; background: none;
    font: 500 12px/1.4 'Space Grotesk', sans-serif; font-style: normal;
    color: inherit; opacity: .6; text-decoration: underline; text-underline-offset: 2px; cursor: pointer;
  }
  .dm-toggle:hover { opacity: .9; }
`;
