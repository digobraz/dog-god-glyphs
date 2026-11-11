// Text od člena v jazyku appky + „Zobraziť originál“ (Matej 11. 11. 2026, vzor `gods/DogMessage.tsx`).
// Render-prop, lebo každý povrch skladá text inak (meno pred textom, odkazy cez `linkify`):
//   <UgcText kind="review" id={r.id} text={r.body}>{(s, toggle) => <p>{linkify(s)}{toggle}</p>}</UgcText>
// `toggle` je null, kým text nie je preložený — povrch bez prekladu vyzerá presne ako doteraz.
import { useState, type ReactNode } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { useUgcTr, type UgcKind } from '@/lib/ugcTr';
import { FONT_UI, PACK_TEXT, PACK_SPACE } from '@/components/pack/packTheme';

export function UgcText({ kind, id, text, mine, children }: {
  kind: UgcKind; id: string | null | undefined; text: string | null | undefined; mine?: boolean;
  children: (text: string, toggle: ReactNode) => ReactNode;
}) {
  const t = useT();
  const tr = useUgcTr(kind, id, text, mine);
  const [orig, setOrig] = useState(false);
  const toggle = tr.translated ? (
    <button
      type="button"
      className="ugc-tg"
      onClick={(e) => { e.stopPropagation(); setOrig((o) => !o); }}
    >
      {t(orig ? 'wall.msg.showTr' : 'wall.msg.showOrig')}
    </button>
  ) : null;
  return <>{children(tr.translated && !orig ? tr.text : (text ?? ''), toggle)}</>;
}

/** Tichý odkaz pod textom — farbu berie z textu nad ním (papyrus aj tmavý povrch). */
export const UGC_TEXT_CSS = `
.ugc-tg{display:block;margin:${PACK_SPACE.xs}px 0 0;padding:0;border:0;background:none;cursor:pointer;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;line-height:1.4;font-style:normal;
  color:inherit;opacity:.62;text-decoration:underline;text-underline-offset:2px;text-align:left;}
.ugc-tg:hover{opacity:.9;}
`;
