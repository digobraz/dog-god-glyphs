// ── SPRIEVODCA PO PRVOM ULOŽENOM VÝLETE (Matej 2026-08-25) ───────────────────────────────
//
// „ak už človek po reveali klikne na späť na mapu, vráti sa na mapu a vtedy ainubis vyskočí,
//  že kde to nájde… tu ainubis povie cestu: tripy nájdeš vo svojom profile, šípka na fotku
//  vľavo hore v headeri. Ostatné je tmavé, do textu napíše že tu nájdeš svoje výlety aj
//  celkové štatistiky, a keď klikne, otvorí sa mu TRIPSTATS."
//
// ⚠️ NAHRÁDZA TEXTOVÝ BLOK, NEPRIDÁVA SA K NEMU. `pack.reveal.coach*` v `TripReveal` POVEDAL,
// kde to je („Výlet sa uložil do Mojich výletov"), ale neukázal to — a veta o mieste, ktoré
// človek nevidí, je to isté ako žiadna veta.
//
// ⚠️ NEPRIDÁVA SA AKCIA. `.trp-midentity` je tlačidlo, ktoré UŽ dnes vedie na
// `/pack/map/triplist?tab=stats`, teda na TRIPSTATS. Sprievodca teda len ukazuje cestu, ktorá
// existuje — človek sa naučí gesto, ktorým pôjde aj nabudúce. Preto sa naň dá kliknúť priamo
// cez dieru v tmavej ploche, nie cez náhradné tlačidlo v bubline.
//
// ⚠️ PRSTENEC JE CYAN, NIE ZLATÝ. Zlatá na tejto obrazovke znamená „tu klikni ty"; keď na
// niečo ukazuje AInubis, hovorí jeho paletou (viď AinubisWidget.css / AinubisGuide).
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ainubisFace from '@/assets/ainubis-head.png';
import { FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';

/** Vzduch okolo zvýrazneného prvku, aby ho prstenec neorezal. */
const PAD = 8;

export function MapCoach({ targetSel, onDone }: { targetSel: string; onDone: () => void }) {
  const t = useT();
  const [box, setBox] = useState<DOMRect | null>(null);

  // ⚠️ MERIA SA AŽ PO VYKRESLENÍ A ZNOVA PRI ZMENE OKNA. Hlavička mapy mení šírku s oknom
  // (pilulky sa preskladajú), takže diera zapamätaná raz by po otočení telefónu sedela vedľa.
  useEffect(() => {
    const measure = () => {
      const el = document.querySelector(targetSel);
      setBox(el ? el.getBoundingClientRect() : null);
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, [targetSel]);

  // Cieľ sa nenašiel (iná šírka, iná vetva navigácie) — radšej nič než tmavá plocha s dierou
  // v prázdnom rohu. Sprievodca sa v tom prípade preskočí, tok pokračuje.
  useEffect(() => { if (box === null) onDone(); }, [box, onDone]);
  if (!box) return null;

  const top = Math.max(4, box.top - PAD);
  const left = Math.max(4, box.left - PAD);
  const w = box.width + PAD * 2;
  const h = box.height + PAD * 2;
  // Bublina ide POD zvýraznený prvok, keď je hore (a naopak) — nikdy ho neprekryje.
  const below = top < window.innerHeight / 2;

  return createPortal(
    <div className="mcoach" role="dialog" aria-modal="true" onClick={onDone}>
      <style>{MAP_COACH_CSS}</style>
      {/* Diera v tme je box-shadow, nie štyri obdĺžniky okolo — pri zmene rozmerov sa
          nemá čo rozísť. `pointer-events:none` na nej: ťuk do diery patrí prvku pod ňou. */}
      <div className="mcoach-hole" style={{ top, left, width: w, height: h }} />
      <div
        className="mcoach-bubble"
        style={below ? { top: top + h + 14 } : { bottom: window.innerHeight - top + 14 }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={`mcoach-arrow${below ? ' up' : ' down'}`} style={{ left: Math.min(Math.max(left + w / 2, 28), window.innerWidth - 28) }} aria-hidden="true" />
        <img className="mcoach-face" src={ainubisFace} alt="" aria-hidden="true" />
        <div className="mcoach-txt">
          <b>{t('pack.mapCoach.title')}</b>
          <p>{t('pack.mapCoach.body')}</p>
        </div>
        <button type="button" className="mcoach-ok" onClick={onDone}>{t('pack.mapCoach.ok')}</button>
      </div>
    </div>,
    document.body,
  );
}

export const MAP_COACH_CSS = `
.mcoach{position:fixed;inset:0;z-index:1500;}
.mcoach-hole{position:fixed;border-radius:14px;pointer-events:none;box-shadow:0 0 0 9999px rgba(2,5,9,0.86),0 0 0 2px #5BE0F0,0 0 26px rgba(59,158,255,0.55);animation:mcoach-ring 2.2s ease-in-out infinite;}
@keyframes mcoach-ring{
  0%,100%{box-shadow:0 0 0 9999px rgba(2,5,9,0.86),0 0 0 2px rgba(91,224,240,0.65),0 0 20px rgba(59,158,255,0.40);}
  50%{box-shadow:0 0 0 9999px rgba(2,5,9,0.86),0 0 0 3px #5BE0F0,0 0 34px rgba(59,158,255,0.75);}
}
.mcoach-bubble{position:fixed;left:12px;right:12px;display:flex;align-items:flex-start;gap:11px;padding:13px 13px 15px;border-radius:15px;background:radial-gradient(120% 160% at 50% -40%,rgba(59,158,255,0.20) 0%,rgba(59,158,255,0) 62%),linear-gradient(180deg,#071019 0%,#03070C 100%);border:1.5px solid rgba(91,224,240,0.55);box-shadow:0 0 0 3px rgba(59,158,255,0.20),0 0 30px rgba(59,158,255,0.42),0 14px 40px rgba(0,0,0,0.7);flex-wrap:wrap;}
.mcoach-arrow{position:fixed;width:0;height:0;margin-left:-9px;border-left:9px solid transparent;border-right:9px solid transparent;}
.mcoach-arrow.up{margin-top:-9px;border-bottom:9px solid rgba(91,224,240,0.75);}
.mcoach-arrow.down{margin-top:0;border-top:9px solid rgba(91,224,240,0.75);}
.mcoach-face{flex:0 0 auto;width:46px;height:46px;object-fit:contain;border-radius:50%;background:radial-gradient(circle at 35% 28%,#12233a 0%,#01050A 74%);box-shadow:0 0 0 1.5px rgba(91,224,240,0.45),0 0 16px rgba(59,158,255,0.38);}
.mcoach-txt{flex:1 1 180px;min-width:0;}
.mcoach-txt b{display:block;font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.04em;color:#E6FAFF;margin-bottom:3px;}
.mcoach-txt p{margin:0;font-family:${FONT_UI};font-size:12.5px;line-height:1.45;color:rgba(207,243,250,0.82);}
.mcoach-ok{flex:0 0 auto;margin-left:auto;padding:9px 16px;border-radius:8px;background:rgba(59,158,255,0.10);border:1px solid rgba(91,224,240,0.40);color:#E6FAFF;font-family:${FONT_UI};font-weight:600;font-size:11.5px;letter-spacing:.05em;cursor:pointer;}
.mcoach-ok:hover{background:rgba(59,158,255,0.20);}
@media (prefers-reduced-motion: reduce){ .mcoach-hole{animation:none;} }
`;
