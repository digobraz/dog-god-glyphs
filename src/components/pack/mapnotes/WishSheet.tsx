// ============================================================================
// PRIANIE — AINUBISov BLOK S BLEDÝM BLOKOM (Matej 24. 9. 2026 večer)
//
// „tá úvodná otázka po + musí byť v strede obrazovky a pozadie musí ísť do tmava, všetko
//  ostatné stmavne, zostane len flow na prianie… celý ten panel musí byť pekný súrodý
//  ohraničený v bloku… dal by som bledý blok vo vnútri ainubisovho bloku s otázkami a pod
//  ním dizajn na bledom bloku"
//
// ⚠️ ZÁVOJ V STREDE OBRAZOVKY BOL PRVÝ POKUS A MATEJ HO VRÁTIL (v ten istý večer):
//   „toto nie je dobre… možno pri tom zmizne z obrazovky všetko ako pri klasickom písaní
//   tripu?" + „prvý krok nemusí byť tmavá obrazovka a dropdown… otvára sa za blokom".
//   Prianie JE miesto — mapa pod závojom ho skryla. Odteraz: zámok obrazovky ako pri zápise
//   výletu (`body.trp-draw-lock` v PackMap), mapa celá, blok stojí HORE bez závoja.
//   Ponuka miest (`PlaceSearch`, portál z-index 1300) musí ležať NAD blokom — preto blok
//   drží z-index sprievodcu výletu (1202), nie modálu (1400).
//
// Dve vrstvy z katalógu `PACK_BLOCKS`, nič nové:
//   AI-PALUBA   jeho tmavý blok: tvár + veta, ktorá sa PÍŠE (ten istý efekt ako `AinubisGuide`)
//   PODBLOK     `PACK_BOX.subblock` — bledý papyrus, na ňom ovládanie. Na bledom je akcia
//               LAPIS (brand: rozhoduje podklad pod prvkom), nie jeho zlato-oranžová.
//
// Prvý tvar (24. 9.) bol `AinubisGuide` — pás nad mapou, pod ním holé chipy priamo na mape.
// Funkčne sedel, vizuálne nie: nebol to blok, len veci položené na cestách.
// Zdieľa ho pridanie prania (`AddWish`) aj otázky jeho života (`WishAsk`).
// ============================================================================
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import ainubisFace from '@/assets/ainubis-head.png';
import {
  PACK_THEME as T, PACK_BOX, PACK_R, PACK_SPACE, FONT_UI,
} from '@/components/pack/packTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { HandExit } from '@/components/pack/HandIcons';

/** ms na znak — tá istá rýchlosť ako `AinubisGuide`. */
const CHAR_MS = 22;

export function WishSheet({ text, onClose, closeLabel, children }: {
  /** veta AINUBISA; pri zmene sa prepíše nanovo */
  text: string;
  onClose: () => void;
  closeLabel: string;
  /** obsah bledého bloku */
  children: ReactNode;
}) {
  const [shown, setShown] = useState('');
  const [typing, setTyping] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearInterval(timer.current);
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!text || reduce) { setShown(text); setTyping(false); return; }
    setShown(''); setTyping(true);
    let i = 0;
    timer.current = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) { window.clearInterval(timer.current); setTyping(false); }
    }, CHAR_MS);
    return () => window.clearInterval(timer.current);
  }, [text]);

  // Esc zavrie — tok je modálny, iný východ z klávesnice nemá.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal((
    <>
      <style>{WISH_SHEET_CSS}</style>
      <div className="ws-wrap" role="dialog" aria-modal="false">
        <div className="ws-deck">
          <div className="ws-head">
            <img className="ws-face" src={ainubisFace} alt="" aria-hidden="true" />
            <p className="ws-text" aria-live="polite">
              <span aria-hidden="true">{shown}</span>
              {typing && <i className="ws-caret" aria-hidden="true" />}
              <span className="ws-sr">{text}</span>
            </p>
            <button type="button" className="ws-x" onClick={onClose} aria-label={closeLabel} title={closeLabel}>
              <HandExit size={17} />
            </button>
          </div>
          <div className="ws-pale" style={{ ...PACK_BOX.subblock }}>
            {children}
          </div>
        </div>
      </div>
    </>
  ), document.body);
}

// ⚠️ JS template literal — spätný apostrof v komentári by ho ukončil (check:css).
const WISH_SHEET_CSS = `
/* Pás cez celé okno (nie left:50% + translate — pasca z locku navu), ťuky prepúšťa len mimo bloku. */
.ws-wrap{position:fixed;left:0;right:0;top:0;z-index:1202;padding:calc(${PACK_SPACE.lg}px + env(safe-area-inset-top,0px)) ${PACK_SPACE.lg}px 0;pointer-events:none;display:flex;justify-content:center;}
.ws-deck{pointer-events:auto;position:relative;width:100%;max-width:520px;max-height:calc(100dvh - ${PACK_SPACE.xxl}px);overflow-y:auto;box-sizing:border-box;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.lg}px;border-radius:${PACK_R.card}px;background:${AINUBIS.surface};border:1px solid ${AINUBIS.edgeStrong};box-shadow:${AINUBIS.panelShadow};}
.ws-head{display:flex;align-items:center;gap:${PACK_SPACE.md}px;}
.ws-face{flex:0 0 auto;width:48px;height:48px;object-fit:contain;border-radius:${PACK_R.pill}px;background:${AINUBIS.faceBg};box-shadow:${AINUBIS.faceRing};}
.ws-text{flex:1 1 auto;min-width:0;margin:0;font-family:${FONT_UI};font-size:16px;font-weight:500;line-height:1.4;color:${AINUBIS.ink};}
.ws-caret{display:inline-block;width:2px;height:1em;margin-left:2px;vertical-align:-2px;background:${AINUBIS.cyan};animation:ws-blink .9s steps(1,end) infinite;}
@keyframes ws-blink{0%,49%{opacity:1;}50%,100%{opacity:0;}}
.ws-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
.ws-x{flex:0 0 auto;align-self:flex-start;width:32px;height:32px;display:flex;align-items:center;justify-content:center;padding:0;border:0;background:transparent;color:${AINUBIS.inkDim};cursor:pointer;}
.ws-x:hover{color:${AINUBIS.cyan};}
.ws-x svg{display:block;}
.ws-pale{padding:${PACK_SPACE.lg}px;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;color:${T.inkStrong};}
@media (prefers-reduced-motion: reduce){ .ws-caret{animation:none;} }
`;
