// AINUBIS PANEL — hlásenia, bezpečnosť a OZNAMY APPKY majú jeho hlas a jeho šat.
//
// Brand lock (plany/locky/brand.md, sekcia AINUBIS):
//   · Matej 1. 9. 2026: „Report ako aj iné nahlásenia či otázky o bezpečnosti má na starosti
//     AInubis = tento panel bude ainubis brand."
//   · Matej 21. 9. 2026 (rozšírenie na oznamy): „nedohodli sme sa, že takéto info systémové,
//     ale aj oznamy budú ainubis style? nebolo by to lepšie?" → „sprav".
//
// JEDEN ZDROJ. CSS sa sem PRESUNULO z messaging/Thread.tsx (panel hlásenia vo vlákne, pôvodný
// precedens) — triedy `msg-mod*` ostali, aby sa Thread nemusel prepisovať. Nahlásenie
// komentára aj výletu (TripComments.tsx) a ponuka „Mám záujem" (memorialTrips.tsx) berú
// odteraz ten istý panel, nie vlastnú papyrusovú kópiu.
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { FONT_TITLE, FONT_UI, GOLD_BTN } from '@/components/pack/packTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import ainubisFace from '@/assets/ainubis-head.png';

const A = AINUBIS;

export const AINUBIS_SHEET_CSS = `
.msg-modsheet{position:fixed;inset:0;z-index:1400;background:rgba(2,6,11,0.74);display:flex;align-items:flex-end;justify-content:center;}
.msg-modpanel{width:100%;max-width:460px;background:${A.surface};border:1px solid ${A.edgeStrong};border-bottom:0;border-radius:16px 16px 0 0;box-shadow:${A.panelShadow};padding:16px 16px calc(env(safe-area-inset-bottom,0px) + 16px);box-sizing:border-box;}
@media(min-width:600px){
  .msg-modsheet{align-items:center;padding:24px;}
  /* V strede okna panel stojí celý, teda má aj spodnú hranu a všetky štyri rohy oblé. */
  .msg-modpanel{border-bottom:1px solid ${A.edgeStrong};border-radius:16px;padding:16px;max-height:calc(100dvh - 48px);overflow-y:auto;}
}
/* Hlava a meno hovoria, KTO to rieši — bez nich je to len tmavý panel bez majiteľa. */
.msg-modwho{display:flex;align-items:center;gap:11px;margin-bottom:13px;}
.msg-modface{flex:0 0 auto;width:38px;height:38px;object-fit:contain;border-radius:50%;background:${A.faceBg};box-shadow:${A.faceRing};}
.msg-modwho b{font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${A.ink};}
.msg-modtitle{font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:${A.ink};}
.msg-modsub{font-family:${FONT_UI};font-size:12px;line-height:1.55;color:${A.inkDim};margin-top:6px;}
.msg-modrow{display:flex;flex-direction:column;gap:8px;margin-top:16px;}
/* Voľba dôvodu: vybraný svieti CYAN, nie lapisom — na jeho povrchu je lapis neviditeľný
   (tmavá modrá na tmavej modrej) a zároveň by to bol hlas appky v jeho paneli. */
.msg-modbtn{width:100%;text-align:left;font-family:${FONT_UI};font-size:13px;padding:12px 14px;border-radius:10px;background:${A.raised};border:1px solid ${A.edge};color:${A.inkDim};cursor:pointer;transition:border-color .15s,background .15s,color .15s;}
.msg-modbtn:hover{border-color:${A.edgeStrong};color:${A.ink};}
.msg-modbtn.on{border-color:${A.cyan};color:${A.ink};background:rgba(91,224,240,0.14);box-shadow:inset 0 0 0 1px rgba(91,224,240,0.45);}
.msg-modbtn--danger{color:${A.danger};}
.msg-modbtn--danger:hover{border-color:${A.danger};color:${A.danger};background:rgba(255,138,122,0.10);}
.msg-modnote{width:100%;box-sizing:border-box;margin-top:10px;min-height:74px;background:rgba(2,8,14,0.55);border:1px solid ${A.edge};border-radius:10px;padding:11px 13px;color:${A.ink};font-family:${FONT_UI};font-size:13px;outline:0;resize:vertical;}
.msg-modnote::placeholder{color:${A.inkFaint};}
.msg-modnote:focus{border-color:${A.cyan};box-shadow:0 0 0 3px rgba(91,224,240,0.20);}
.msg-modsend{width:100%;margin-top:12px;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:8px;background:${A.ctaGrad};color:${A.ctaInk};border:1px solid ${GOLD_BTN.edge};box-shadow:${A.ctaShadow};cursor:pointer;}
.msg-modsend:hover:not(:disabled){background:${A.ctaGradHover};}
.msg-modsend:disabled{background:rgba(91,224,240,0.10);color:${A.inkFaint};border-color:${A.edge};box-shadow:none;cursor:default;}
.msg-modcancel{width:100%;margin-top:8px;background:none;border:0;color:${A.inkFaint};font-family:${FONT_UI};font-size:12.5px;padding:9px;cursor:pointer;}
.msg-modcancel:hover{color:${A.ink};}
`;

/** Hlava + meno — KTO to rieši. `AI` v mene je cyan (lock 12. 9.: meno má tvar). */
export function AinubisWho() {
  return (
    <div className="msg-modwho">
      <img className="msg-modface" src={ainubisFace} alt="" aria-hidden="true" />
      <b><span style={{ color: A.aiInk, textShadow: A.aiShadow }}>AI</span>NUBIS</b>
    </div>
  );
}

/**
 * Panel AINUBISA nad obrazovkou (dole na mobile, v strede na PC — rozhoduje CSS).
 * Portál do <body>: v článku výletu by ho inak prekryla bočná lišta (`.pta-acts`).
 */
export function AinubisSheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return createPortal((
    <>
      <style>{AINUBIS_SHEET_CSS}</style>
      <div className="msg-modsheet" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="msg-modpanel">
          <AinubisWho />
          {children}
        </div>
      </div>
    </>
  ), document.body);
}

/** Malá bublina AINUBISA priamo v mieste (nie panel nad obrazovkou) — napr. pod pilulkou. */
export const AINUBIS_BUBBLE_CSS = `
.ain-bubble{display:flex;gap:10px;align-items:flex-start;background:${A.surface};border:1px solid ${A.edgeStrong};border-radius:12px;box-shadow:${A.panelShadow};padding:12px;color:${A.inkDim};font-family:${FONT_UI};font-size:12px;line-height:1.5;}
.ain-bubble img{flex:0 0 auto;width:32px;height:32px;object-fit:contain;border-radius:50%;background:${A.faceBg};box-shadow:${A.faceRing};}
.ain-bubble b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${A.ink};margin-bottom:4px;}
.ain-bubble .ain-cta{margin-top:12px;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:8px 16px;border-radius:8px;background:${A.ctaGrad};color:${A.ctaInk};border:1px solid ${GOLD_BTN.edge};box-shadow:${A.ctaShadow};cursor:pointer;}
.ain-bubble .ain-cta:disabled{opacity:.6;cursor:default;}
`;

export function AinubisBubble({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  return (
    <div className={`ain-bubble${className ? ` ${className}` : ''}`} role={role}>
      <style>{AINUBIS_BUBBLE_CSS}</style>
      <img src={ainubisFace} alt="" aria-hidden="true" />
      <div>
        <b><span style={{ color: A.aiInk, textShadow: A.aiShadow }}>AI</span>NUBIS</b>
        {children}
      </div>
    </div>
  );
}
