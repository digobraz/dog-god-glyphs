// ── POPUP — JEDEN tvar okna nad obrazovkou v `/pack` (Matej 26. 10. 2026) ─────────────────────
// *„dajme lepší popup… ten čo sa dá stiahnuť dolu, ale zároveň scrollovať po celej šírke"* ·
// *„nazvime si to popup = na tej obrazovke nemusí byť šípka späť, dostane nás preč stiahnutie
//  alebo kliknutie vedľa"*. Meno v katalógu `PACK_BLOCKS` = POPUP.
//
// Tvar: na mobile šuplík zdola cez CELÚ šírku s úchytom, od 768 px okno v strede (lock
// architektura-pack §1.1.1, ten istý zlom ako BonesSheet). Obsah roluje vo vnútri, okno nikdy
// nepresiahne 88 % výšky — preto nezájde pod spodnú lištu ako starý modal odznaku.
//
// 🔴 ŠÍPKA SPÄŤ v popupe NIE JE. Von = stiahnuť za úchyt/hlavičku (`useSheetSwipe`), ťuk na závoj,
//    Esc. Šípka späť patrí OBRAZOVKE (PackTopRow), nie oknu nad ňou.
// ⚠️ z-index 65 = nad spodnou lištou (50) a AINUBIS launcherom (60) — ako BonesSheet.
// ⚠️ Portál do body: rodič s `backdrop-filter` (.pk-glass) by inak ukotvil `position:fixed`
//    o seba, nie o okno.
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useSheetSwipe } from '@/components/pack/useSheetSwipe';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, VEIL_CSS } from '@/components/pack/packTheme';
import { MODAL_MAX_H } from '@/components/pack/packTheme';

const T = PACK_THEME;
const S = PACK_SPACE;

export const PACK_POPUP_CSS = `
.ppu-root.pk-veil.ppu-root--over{z-index:1300;}
.ppu-root.pk-veil{z-index:65;align-items:flex-end;padding:0;animation:ppu-fade .3s ease both;}
.ppu-sheet{position:relative;width:100%;max-height:${MODAL_MAX_H};display:flex;flex-direction:column;background:${T.cardGrad};color:${T.inkStrong};
  border-top:2px solid ${T.cardEdge};border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;box-shadow:${T.panelShadow};
  font-family:${FONT_UI};animation:ppu-up .38s cubic-bezier(.2,.8,.2,1) both;}
.ppu-top{flex:none;display:flex;flex-direction:column;cursor:grab;}
.ppu-grab{flex:none;width:44px;height:4px;border-radius:${PACK_R.pill}px;background:${T.hairline};margin:${S.sm}px auto ${S.sm}px;}
.ppu-head{padding:0 ${S.lg}px ${S.md}px;}
.ppu-head h2{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;letter-spacing:.14em;color:${T.inkStrong};text-align:center;} /* písmo: nadpis */
.ppu-body{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:0 ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.xl}px);}
@media (min-width:768px){
  .ppu-root.pk-veil{align-items:center;padding:${S.xl}px;}
  .ppu-sheet{width:640px;max-height:86dvh;border:2px solid ${T.cardEdge};border-radius:${PACK_R.card}px;}
  .ppu-top{cursor:default;}
  .ppu-grab{visibility:hidden;}
  .ppu-body{padding:0 ${S.xl}px ${S.xl}px;}
}
@keyframes ppu-up{from{transform:translateY(100%);}to{transform:none;}}
@keyframes ppu-fade{from{opacity:0;}to{opacity:1;}}
@media (prefers-reduced-motion:reduce){.ppu-sheet,.ppu-root.pk-veil{animation:none;}}
`;

export function PackPopup({ title, label, onClose, children, className, over }: {
  /** Nadpis v hlavičke (Cinzel). Bez neho ostane len úchyt. */
  title?: ReactNode;
  /** Meno okna pre čítačku, keď `title` nie je text. */
  label?: string;
  onClose: () => void;
  children: ReactNode;
  /** Trieda na `.ppu-sheet` — obsah si ňou ladí vlastné rozloženie. */
  className?: string;
  /** Popup nad PRACOVNÝM PANELOM, nie len nad lištou — zapisovanie výletu má dok na 1200
   *  (`.trp-dock`), takže formulár miesta otvorený počas kreslenia trasy sa so 65 vložil POD
   *  neho a nedal sa vyplniť (Matej 31. 10. 2026). 1300 = nad dokom, pod „Zahodiť výlet" (1400). */
  over?: boolean;
}) {
  const sw = useSheetSwipe(onClose);
  // Stránka pod popupom sa nesmie rolovať (iPhone by „ťahal" celé okno) + Esc zavrie.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return createPortal(
    <div
      className={`ppu-root pk-veil pk-veil--modal${over ? ' ppu-root--over' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={label ?? (typeof title === 'string' ? title : undefined)}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{VEIL_CSS}</style>
      <style>{PACK_POPUP_CSS}</style>
      <div className={`ppu-sheet${className ? ` ${className}` : ''}`} style={sw.sheetStyle}>
        <div className="ppu-top" {...sw.handle}>
          <span className="ppu-grab" aria-hidden />
          {title && <div className="ppu-head"><h2>{title}</h2></div>}
        </div>
        <div className="ppu-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
