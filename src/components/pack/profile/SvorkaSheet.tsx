// ŠUPLÍK SVORKA — ťuk na „Ukáž svorku" v UPRAVIŤ PROFIL (23. 10. 2026).
// Matej: *„niekde by mal byť popup po rozkliknutí vizualizácia svorky ako máme v homepage"*.
//
// Obsah = TEN ISTÝ `HeroCard` ako blok JA + SVORKA na homepage `/pack` — druhá kresba svorky
// nevzniká; čo sa zmení tam, uvidí sa aj tu. Tvar šuplíka = `BonesSheet` (mobil zdola s úchytom,
// od 768 px okno v strede, zavrie šípka / závoj / Esc, nikoho neodnesie preč — lock §4.2).
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HeroCard, type HeroDog } from '@/components/pack/HeroCard';
import { BackButton } from '@/components/pack/BackButton';
import { PACK_THEME, PACK_HEAD, PACK_R, PACK_SPACE, FONT_UI, VEIL_CSS } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const S = PACK_SPACE;

const CSS = `
.sv-root.pk-veil{z-index:65;align-items:flex-end;padding:0;animation:sv-fade .3s ease both;}
.sv-sheet{position:relative;width:100%;max-height:88dvh;display:flex;flex-direction:column;background:${T.cardGrad};color:${T.inkStrong};
  border-top:1.5px solid ${T.cardEdge};border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;box-shadow:${T.panelShadow};
  font-family:${FONT_UI};animation:sv-up .38s cubic-bezier(.2,.8,.2,1) both;}
.sv-grab{flex:none;width:44px;height:4px;border-radius:${PACK_R.pill}px;background:${T.hairline};margin:${S.sm}px auto 0;}
.sv-head{flex:none;display:flex;align-items:center;gap:${S.md}px;padding:${S.sm}px ${S.lg}px ${S.md}px;}
.sv-head b{color:${T.inkDim};}
.sv-body{overflow-y:auto;overscroll-behavior:contain;padding:0 ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.xl}px);}
@media (min-width:768px){
  .sv-root.pk-veil{align-items:center;padding:${S.xl}px;}
  .sv-sheet{width:640px;max-height:86dvh;border:1.5px solid ${T.cardEdge};border-radius:${PACK_R.card}px;}
  .sv-grab{display:none;}
  .sv-head{padding-top:${S.lg}px;}
  .sv-body{padding:0 ${S.xl}px ${S.xl}px;}
}
@keyframes sv-up{from{transform:translateY(100%);}to{transform:none;}}
@keyframes sv-fade{from{opacity:0;}to{opacity:1;}}
@media (prefers-reduced-motion:reduce){.sv-sheet,.sv-root.pk-veil{animation:none;}}
`;

export function SvorkaSheet({ name, email, avatarUrl, devotion, bones, dogs, packName, onClose }: {
  name: string;
  email: string;
  avatarUrl: string | null;
  devotion: number;
  bones: number;
  dogs: HeroDog[];
  packName: string | null;
  onClose: () => void;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  // Stránka pod šuplíkom sa nesmie rolovať + Esc zavrie (ten istý recept ako BonesSheet).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const title = tx('pack.edit.secPack', 'Pack');
  return createPortal(
    <div
      className="sv-root pk-veil pk-veil--modal"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{VEIL_CSS}</style>
      <style>{CSS}</style>
      <div className="sv-sheet">
        <span className="sv-grab" aria-hidden />
        <div className="sv-head">
          <BackButton tone="pale" onClick={onClose} label={tx('pack.network.close', 'Close')} />
          <b style={{ ...PACK_HEAD.section }}>{title}</b>
        </div>
        <div className="sv-body">
          <HeroCard name={name} email={email} avatarUrl={avatarUrl} devotion={devotion} bones={bones} dogs={dogs} packName={packName} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
