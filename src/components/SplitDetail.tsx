import { useT } from '@/i18n/LanguageContext';
import type { TransparencySplitItem } from '@/lib/transparency';

/**
 * Text po rozkliku podielu z `TRANSPARENCY_SPLIT` — jeden pre pokladňu, popup Členstvo,
 * pokladnicu v /pack aj /magnet. Podiel bez `parts` = jeho poznámka. Podiel s `parts`
 * (Rozvoj komunity €8) = úvodná veta + vnútorný rozpad 5 + 3, každý so svojou poznámkou
 * (Matej 18. 10. 2026: *„iba pri rozkliku"*). Písmo a farbu textu dedí od rodiča.
 */
export function SplitDetail({ item }: { item: TransparencySplitItem }) {
  const t = useT();
  if (!item.parts.length) return <>{t(item.noteKey)}</>;
  return (
    <span className="split-detail">
      <style>{CSS}</style>
      <span className="split-detail-lead">{t(item.noteKey)}</span>
      {item.parts.map((p) => (
        <span key={p.labelKey} className="split-detail-part" style={{ ['--c' as string]: p.color }}>
          <span className="split-detail-h">€{p.share} · {t(p.labelKey)}</span>
          <span>{t(p.noteKey)}</span>
        </span>
      ))}
    </span>
  );
}

const CSS = `
.split-detail{display:flex;flex-direction:column;gap:8px;}
.split-detail-part{display:flex;flex-direction:column;gap:4px;padding-left:8px;border-left:3px solid var(--c);}
/* Hlavička podielu: písmo rodiča, nie jeho b/strong (popup Členstvo má .mi-money b = veľký Cinzel). */
.split-detail .split-detail-part .split-detail-h{font:inherit;font-weight:600;letter-spacing:normal;text-transform:none;color:var(--c);}
`;
