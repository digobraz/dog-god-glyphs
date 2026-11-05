// NÚDZOVÁ KARTIČKA (Matej 5. 11. 2026, nákres plany/nakresy/karticka-2026-11-05): jedna kresba pre náhľad v appke, zdieľanie aj tlač A4.
// Všetko je v `cqw`, takže rozmer určuje rodič: 342 px v telefóne, 85,6 mm na papieri.
// Predná: nadpis, prosba, fotka a meno psa, text drží pri hornom okraji. Zadná: kontakty, adresa, poznámka; vpravo bledý pás s heroglyfom.
// Kartička je tlačovina v rozmere platobnej karty, preto mimo stupníc PACK_TEXT a PACK_R (tie platia pre obrazovku).
import { useLayoutEffect, useRef, type CSSProperties, type PointerEventHandler } from 'react';
import { FONT_TITLE, FONT_UI, PACK_THEME as T } from '@/components/pack/packTheme';
import { VerticalHeroglyphFrame } from '@/components/VerticalHeroglyphFrame';
import type { CardTexts } from './cardTexts';

export type CardPhoto = { src: string | null; x: number; y: number; zoom: number };
export type CardContact = { name: string; phone: string };
export type CardData = { contacts: CardContact[]; addr: string; note: string };
export type CardGlyph = { selections: Record<string, string>; ownerName: string; patronSvg: string };

// Zvislý heroglyf: výrez rámika z kresby 2480 × 3504 (x 788, y 365, 903 × 2774, zmerané getBBox), mierka podľa výšky 51 cqw.
const GLYPH_H = 51;
const GLYPH_K = GLYPH_H / 2774;

export const CARD_CSS = `
.ec{container-type:inline-size;position:relative;width:100%;aspect-ratio:85.6/54;}
.ec-f{position:absolute;inset:0;overflow:hidden;background:linear-gradient(160deg,${T.sosRed},${T.sosRedDark});border:.5cqw solid ${T.accentGold};border-radius:3.5cqw;color:#FFFFFF;font-family:${FONT_UI};}
.ec--flat .ec-f{border-radius:0;}
.ec-ph{position:absolute;right:0;top:0;width:60cqw;height:100%;overflow:hidden;touch-action:none;-webkit-mask-image:linear-gradient(90deg,transparent 0,black 40%);mask-image:linear-gradient(90deg,transparent 0,black 40%);}
.ec-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;user-select:none;-webkit-user-drag:none;}
.ec-lft{position:absolute;left:6.4cqw;width:46cqw;top:3.2cqw;display:flex;flex-direction:column;gap:2cqw;pointer-events:none;}
.ec-rtl .ec-lft{text-align:right;}
.ec-hu{margin:0;padding-top:.32em;font-family:${FONT_TITLE};font-weight:700;line-height:1.04;letter-spacing:.02em;text-transform:uppercase;text-shadow:0 .4cqw 0 ${T.sosRedDark},0 .7cqw .5cqw ${T.inkStrong},0 1cqw 3.4cqw ${T.inkStrong};} /* písmo: nadpis */
.ec-ask{margin:0;font:500 3.2cqw/1.3 ${FONT_UI};padding-right:3cqw;text-shadow:0 .2cqw .8cqw ${T.sosRedDark};}
.ec-name{position:absolute;right:2.6cqw;bottom:2.2cqw;max-width:40cqw;text-align:right;font:700 6cqw/1.05 'Cinzel Decorative',${FONT_TITLE};overflow-wrap:anywhere;text-shadow:0 .4cqw 2cqw ${T.inkStrong};pointer-events:none;} /* písmo: meno */
.ec-bl{position:absolute;left:3.2cqw;right:23.4cqw;top:2.6cqw;bottom:2.4cqw;display:flex;flex-direction:column;gap:1.5cqw;overflow:hidden;}
.ec-rtl .ec-bl{text-align:right;}
.ec-bt{flex:none;font:700 4.6cqw/1.12 ${FONT_TITLE};letter-spacing:.02em;text-transform:uppercase;text-shadow:0 .3cqw .8cqw ${T.inkStrong};} /* písmo: nadpis */
.ec-cs{flex:none;display:flex;flex-direction:column;gap:1cqw;}
.ec-cn{display:block;font:500 2.8cqw/1.2 ${FONT_UI};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
.ec-pp{display:block;font:600 5.6cqw/1.12 ${FONT_UI};white-space:nowrap;overflow:hidden;direction:ltr;unicode-bidi:isolate;}
.ec-rtl .ec-pp{text-align:right;}
.ec-n1 .ec-pp{font-size:6.8cqw;}.ec-n1 .ec-cn{font-size:3.2cqw;}
.ec-n3{gap:.5cqw;}.ec-n3 .ec-pp{font-size:4.2cqw;}.ec-n3 .ec-cn{font-size:2.4cqw;}
.ec-sec{flex:none;border-top:.25cqw solid ${T.accentGold};padding-top:1cqw;}
.ec-lb{display:block;font:500 2.2cqw/1.25 ${FONT_UI};letter-spacing:.14em;text-transform:uppercase;opacity:.85;}
.ec-ad{display:block;font:600 3.2cqw/1.2 ${FONT_UI};overflow-wrap:anywhere;}
.ec-no{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;font:500 2.9cqw/1.28 ${FONT_UI};overflow-wrap:anywhere;}
.ec-gl{position:absolute;right:0;top:0;bottom:0;width:20.6cqw;padding:2.2cqw 0 1.8cqw;background:${T.cardGrad};border-left:.5cqw solid ${T.accentGold};display:flex;flex-direction:column;align-items:center;justify-content:space-between;color:#000000;box-sizing:border-box;}
.ec-gv{position:relative;flex:none;overflow:hidden;height:${GLYPH_H}cqw;width:${903 * GLYPH_K}cqw;filter:brightness(0);}
.ec-gv svg{position:absolute;display:block;left:${-788 * GLYPH_K}cqw;top:${-365 * GLYPH_K}cqw;max-width:none;width:${2480 * GLYPH_K}cqw!important;height:${3504 * GLYPH_K}cqw!important;}
.ec-web{flex:none;font:600 2.5cqw/1 ${FONT_UI};letter-spacing:.02em;}
`;

const photoStyle = (p: CardPhoto): CSSProperties => ({
  objectPosition: `${p.x}% ${p.y}%`,
  transform: `scale(${p.zoom})`,
  transformOrigin: `${p.x}% ${p.y}%`,
});

/** Nadpis je taký veľký, aký sa do 34 cqw výšky zmestí; ráta sa v `cqw`, takže nezávisí od šírky kartičky. Ráta sa znova po načítaní písma. */
function useFitTitle(text: string) {
  const ref = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    const fit = () => {
      const h = ref.current;
      if (!h) return;
      h.style.height = '34cqw';
      for (let z = 15; z >= 4; z -= 0.25) {
        h.style.fontSize = `${z}cqw`;
        if (h.scrollWidth <= h.clientWidth && h.scrollHeight <= h.clientHeight) break;
      }
      h.style.height = '';
    };
    fit();
    let alive = true;
    document.fonts?.ready.then(() => { if (alive) fit(); });
    return () => { alive = false; };
  }, [text]);
  return ref;
}

// Dlhé meno psa sa zmenší podľa dĺžky. Čo sa ani tak nezmestí, pomenuje stránka pred tlačou.
const nameSize = (len: number) => (len <= 10 ? 6 : len <= 18 ? 4.4 : 3.4);

export function CardFront({ dogName, photo, tx, rtl, flat, photoHandlers }: {
  dogName: string; photo: CardPhoto; tx: CardTexts; rtl?: boolean; flat?: boolean;
  photoHandlers?: { onPointerDown: PointerEventHandler; onPointerMove: PointerEventHandler; onPointerUp: PointerEventHandler; onPointerCancel: PointerEventHandler };
}) {
  const title = useFitTitle(tx.title);
  return (
    <div className={`ec${flat ? ' ec--flat' : ''}${rtl ? ' ec-rtl' : ''}`} dir={rtl ? 'rtl' : 'ltr'}>
      <div className="ec-f">
        <div className="ec-ph" {...photoHandlers}>
          {photo.src && <img src={photo.src} alt="" draggable={false} style={photoStyle(photo)} />}
        </div>
        <div className="ec-lft">
          <h4 className="ec-hu" ref={title}>{tx.title}</h4>
          <p className="ec-ask">{tx.ask}</p>
        </div>
        <span className="ec-name" dir="ltr" style={{ fontSize: `${nameSize(dogName.length)}cqw` }}>{dogName}</span>
      </div>
    </div>
  );
}

export function CardBack({ data, glyph, tx, rtl, flat }: {
  data: CardData; glyph: CardGlyph | null; tx: CardTexts; rtl?: boolean; flat?: boolean;
}) {
  const filled = data.contacts.filter((c) => c.name.trim() || c.phone.trim());
  return (
    <div className={`ec${flat ? ' ec--flat' : ''}${rtl ? ' ec-rtl' : ''}`} dir={rtl ? 'rtl' : 'ltr'}>
      <div className="ec-f">
        <div className="ec-bl" data-check={tx.note}>
          <span className="ec-bt">{tx.backTitle}</span>
          <div className={`ec-cs ec-n${Math.max(1, filled.length)}`}>
            {filled.map((c, i) => (
              <div key={i}>
                <span className="ec-cn">{c.name}</span>
                <span className="ec-pp" data-check={c.name || c.phone}>{c.phone}</span>
              </div>
            ))}
          </div>
          {data.addr.trim() && <div className="ec-sec"><span className="ec-lb">{tx.addr}</span><span className="ec-ad">{data.addr}</span></div>}
          {data.note.trim() && <div className="ec-sec"><span className="ec-lb">{tx.note}</span><span className="ec-no" data-check={tx.note}>{data.note}</span></div>}
        </div>
        <div className="ec-gl" dir="ltr">
          <div className="ec-gv">{glyph && <VerticalHeroglyphFrame data={glyph} />}</div>
          <span className="ec-web">dogypt.com</span>
        </div>
      </div>
    </div>
  );
}
