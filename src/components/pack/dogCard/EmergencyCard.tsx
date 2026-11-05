// NÚDZOVÁ KARTIČKA (Matej 5. 11. 2026): jedna kresba pre náhľad v appke aj pre tlač A4.
// Všetko je v `cqw`, takže rozmer určuje rodič: 342 px v telefóne, 85,6 mm na papieri.
// Fotka je ÚDAJ psa, nie ikonka: drží ľavú tretinu karty na plnú výšku a dá sa posunúť aj priblížiť.
// Kartička je tlačovina v rozmere platobnej karty, preto mimo stupníc PACK_TEXT a PACK_R (tie platia pre obrazovku).
import type { CSSProperties, PointerEventHandler } from 'react';
import { FONT_TITLE, FONT_UI, PACK_THEME as T } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import logo from '@/assets/app/logo-2026.svg';

export type CardPhoto = { src: string | null; x: number; y: number; zoom: number };
export type CardData = {
  contact: string; phone: string; addr: string; needs: string; vet: string; breed: string; age: string;
};
export type CardTexts = {
  frontTitle: string; ask: string; contact: string; phone: string;
  backTitle: string; breed: string; age: string; addr: string; needs: string; vet: string;
};

export const CARD_CSS = `
.ec{container-type:inline-size;position:relative;width:100%;aspect-ratio:85.6/54;}
.ec-f{position:absolute;inset:0;display:flex;overflow:hidden;background:${T.cardGrad};border:.5cqw solid ${T.accentGold};border-radius:3.5cqw;color:${T.inkStrong};font-family:${FONT_UI};}
.ec--flat .ec-f{border-radius:0;}
.ec-ph{position:relative;flex:none;width:40cqw;overflow:hidden;background:${T.tileBg};border-right:.5cqw solid ${T.accentGold};touch-action:none;}
.ec-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;user-select:none;-webkit-user-drag:none;}
.ec-veil{position:absolute;left:0;right:0;bottom:0;padding:9cqw 2.4cqw 2cqw;background:linear-gradient(180deg,rgba(24,14,4,0) 0%,rgba(24,14,4,.82) 100%);color:#FBF5E6;pointer-events:none;}
.ec-name{display:block;font:700 5.2cqw/1.08 'Cinzel Decorative',${FONT_TITLE};overflow-wrap:anywhere;} /* písmo: meno */
.ec-num{position:absolute;left:2cqw;top:2cqw;display:flex;align-items:center;height:5.6cqw;padding:0 1.8cqw;border-radius:999px;background:${LAPIS.grad};border:.25cqw solid ${T.accentGold};color:${LAPIS.ink};font:600 2.9cqw/1 ${FONT_UI};pointer-events:none;}
.ec-main{flex:1;min-width:0;display:flex;flex-direction:column;}
.ec-band{flex:none;display:flex;align-items:center;gap:2cqw;padding:1.9cqw 2.6cqw;background:linear-gradient(180deg,${T.sosRed},${T.sosRedDark});color:#FFFFFF;border-bottom:.5cqw solid ${T.accentGold};}
.ec-band strong{font:700 4.5cqw/1.12 ${FONT_TITLE};letter-spacing:.02em;text-transform:uppercase;text-wrap:balance;} /* písmo: nadpis */
.ec-body{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:1.7cqw;padding:1.6cqw 2.8cqw;}
.ec-ask{font:500 3cqw/1.28 ${FONT_UI};color:${T.inkDim};}
.ec-fl{min-width:0;}
.ec-fl span{display:block;font:500 2.2cqw/1.25 ${FONT_UI};letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};}
.ec-fl b{display:block;min-height:4.4cqw;padding-bottom:.5cqw;border-bottom:.25cqw solid ${T.accentGold};font:600 3.5cqw/1.25 ${FONT_UI};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
.ec-fl.is-big b{min-height:5.6cqw;font-size:4.5cqw;}
.ec-fl.is-wrap b{white-space:normal;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow-wrap:anywhere;}
.ec-fl.is-tel b{color:${LAPIS.edge};}
.ec-foot{flex:none;display:flex;align-items:center;justify-content:flex-end;padding:0 2.8cqw 1.5cqw;}
.ec-foot img{height:6.4cqw;width:auto;display:block;}
/* zadná strana */
.ec-f--back{flex-direction:column;}
.ec-sil{position:absolute;right:2cqw;bottom:1cqw;width:30cqw;opacity:.13;pointer-events:none;}
.ec-b2{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:1.5cqw;padding:1.6cqw 3.2cqw 2cqw;}
.ec-two{display:flex;gap:2.6cqw;}
.ec-two>*{flex:1;min-width:0;}
.ec-dog{margin-left:auto;font:700 4.6cqw/1 'Cinzel Decorative',${FONT_TITLE};max-width:40cqw;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;} /* písmo: meno */
`;

const photoStyle = (p: CardPhoto): CSSProperties => ({
  objectPosition: `${p.x}% ${p.y}%`,
  transform: `scale(${p.zoom})`,
  transformOrigin: `${p.x}% ${p.y}%`,
});

// Dlhý údaj (telefón, potreby) ide na dva riadky a zmenšuje písmo podľa dĺžky. Čo sa ani tak nezmestí, ukáže stránka
// hláškou pred stiahnutím (meria sa, či `<b>` pretiekol), takže nič sa neskráti ticho elipsou.
const wrapSize = (len: number, tiers: [number, number][], min: number) => tiers.find(([max]) => len <= max)?.[1] ?? min;
const Fl = ({ label, value, big, tel, wrap }: { label: string; value: string; big?: boolean; tel?: boolean; wrap?: 'tel' | 'needs' }) => {
  const size = wrap === 'tel' ? wrapSize(value.length, [[16, 4.5], [24, 3.6]], 3)
    : wrap === 'needs' ? wrapSize(value.length, [[40, 3.5], [70, 2.9]], 2.4) : undefined;
  return (
    <div className={`ec-fl${big ? ' is-big' : ''}${tel ? ' is-tel' : ''}${wrap ? ' is-wrap' : ''}`}>
      <span>{label}</span><b style={size ? { fontSize: `${size}cqw` } : undefined}>{value || ' '}</b>
    </div>
  );
};

export function CardFront({ dogName, number, photo, data, tx, flat, photoHandlers }: {
  dogName: string; number: string; photo: CardPhoto; data: CardData; tx: CardTexts; flat?: boolean;
  photoHandlers?: { onPointerDown: PointerEventHandler; onPointerMove: PointerEventHandler; onPointerUp: PointerEventHandler; onPointerCancel: PointerEventHandler };
}) {
  return (
    <div className={`ec${flat ? ' ec--flat' : ''}`}>
      <div className="ec-f">
        <div className="ec-ph" {...photoHandlers}>
          {photo.src && <img src={photo.src} alt="" draggable={false} style={photoStyle(photo)} />}
          {number && <span className="ec-num">{number}</span>}
          <span className="ec-veil"><span className="ec-name">{dogName}</span></span>
        </div>
        <div className="ec-main">
          <div className="ec-band">
            <BrandIcon name="house-heart" size={0} tint="white" style={{ width: '6.6cqw', height: '6.6cqw', flex: 'none' }} />
            <strong>{tx.frontTitle}</strong>
          </div>
          <div className="ec-body">
            <div className="ec-ask">{tx.ask}</div>
            <Fl label={tx.contact} value={data.contact} big />
            <Fl label={tx.phone} value={data.phone} big tel wrap="tel" />
          </div>
          <div className="ec-foot"><img src={logo} alt="DOGYPT" /></div>
        </div>
      </div>
    </div>
  );
}

export function CardBack({ dogName, patron, data, tx, flat }: {
  dogName: string; patron: string | null; data: CardData; tx: CardTexts; flat?: boolean;
}) {
  return (
    <div className={`ec${flat ? ' ec--flat' : ''}`}>
      <div className="ec-f ec-f--back">
        <div className="ec-band">
          <BrandIcon name="paw-solid" size={0} tint="white" style={{ width: '5.6cqw', height: '5.6cqw', flex: 'none' }} />
          <strong>{tx.backTitle}</strong>
          <span className="ec-dog">{dogName}</span>
        </div>
        <div className="ec-b2">
          {patron && <img className="ec-sil" src={patron} alt="" />}
          <div className="ec-two">
            <Fl label={tx.breed} value={data.breed} />
            <Fl label={tx.age} value={data.age} />
          </div>
          <Fl label={tx.addr} value={data.addr} />
          <Fl label={tx.needs} value={data.needs} wrap="needs" />
          <Fl label={tx.vet} value={data.vet} />
        </div>
      </div>
    </div>
  );
}
