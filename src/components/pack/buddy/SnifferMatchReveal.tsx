// SNIFFER — ODHALENIE ZHODY.
// Kolo 7 (Matej 26. 9.): „skúsme najprv prekresliť taký ten obrázok a potom urobíme videjko, ako sa
// priblížia k sebe a vyletia srdiečka a tie dve fotky sa spoja (bez tých nosov atď)" + po prvej verzii:
// „myslel som, že rozanimuješ ten obrázok… aby sa tí psy k sebe priblížili a až potom odtiaľ vyleteli
// srdiečka, animácia cez objekty". Obrázok B2 bez obojku (`plany/nakres-zhoda-obrazok-2026-09-26`) je preto
// rozložený na VRSTVY (`public/images/sniffer/zhoda/`: pozadie, ľavý pes, čierny pes, 5 srdiečok).
//   0,0 s  papier · psy stoja od seba · 0,2–1,3 s idú k sebe
//   1,4 s  čierny dvakrát začuchá · 1,7 s spomedzi nich vyletia srdiečka
//   3,0 s  scéna zmizne → priletia dve fotky · 3,6 s dotknú sa · 4,0 s zapadnú do seba (prekryv ~1/3)
//   4,3 s  „Zavetrili ste sa!" · 4,6 s mená · 4,9 s tlačidlá
// Ťuk na scénu = prehrať znova. Kto má vypnuté pohyby, vidí rovno konečný stav (spojené fotky).
import { useState, type ReactNode } from 'react';
import { withTransform } from '@/services/cloudinaryService';
import { PACK_THEME as T, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';

const pic = (u?: string | null) => withTransform(u, 'c_fill,g_auto,w_240,h_240,f_auto,q_auto');
const Z = '/images/sniffer/zhoda/';
/** Srdiečka zo scény: kresba 1–5, vodorovný posun (px), oneskorenie (s), šírka (px). */
const HEARTS: Array<[number, number, number, number]> = [
  [1, 4, 0, 22], [2, 30, 0.18, 26], [3, 14, 0.36, 18], [4, 42, 0.54, 20], [5, 22, 0.72, 16],
];

const CSS = `
.mr{display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.md}px;text-align:center;width:100%;max-width:360px;}
.mr-duo{position:relative;width:282px;height:188px;cursor:pointer;outline:none;-webkit-user-select:none;user-select:none;}
/* Ťah prstom/myšou po scéne nesmie obrázky OZNAČIŤ (modrý výber, nájdené 26. 9. pri nahrávke swipu). */
.mr-duo img{-webkit-user-drag:none;pointer-events:none;}

/* 1 · SCÉNA Z VRSTIEV — psy vchádzajú zo strán (orezané rámom), stretnú sa, srdiečka, scéna zmizne. */
.mr-scene{position:absolute;inset:0;border-radius:${PACK_R.tile}px;overflow:hidden;opacity:0;animation:mrScene 3.3s ease both;}
.mr-scene > img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.mr-scene .dL{animation:mrDogL 1.1s cubic-bezier(.3,.7,.3,1) .2s both;}
/* Čuchanie = zväčšenie od PRAVÉHO okraja: nos ide vpred, okraj vrstvy ostane v ráme (posun by odkryl pás). */
.mr-scene .dR{transform-origin:100% 70%;animation:mrDogR 1.1s cubic-bezier(.3,.7,.3,1) .2s both, mrSniff .5s ease-in-out 1.4s 2;}
/* Srdiečka vyletia nad hlavou čierneho, vpravo od chvosta (ako na predlohe) — cez chvost boli neprehľadné. */
.mr-scene .ht{position:absolute;left:47%;top:34%;width:var(--w);height:auto;right:auto;bottom:auto;margin-left:calc(var(--w) / -2);opacity:0;
  animation:mrHt 1.4s ease-out calc(1.7s + var(--d)) forwards;}

/* 2 · FOTKY — dotknú sa a zapadnú do seba asi do tretiny (obe tváre ostanú celé), pulzujú spolu. */
.mr-pair{position:absolute;left:50%;top:50%;width:104px;height:104px;margin:-52px 0 0 -52px;animation:mrPulse .45s ease 4s both;}
.mr-pair .pL,.mr-pair .pR{position:absolute;inset:0;width:100%;height:100%;border-radius:${PACK_R.pill}px;border:3px solid ${LAPIS.ink};
  object-fit:cover;display:block;background:${T.pageBg};opacity:0;}
.mr-pair .pL{animation:mrJoinL 1s cubic-bezier(.5,0,.3,1) 3s both;}
.mr-pair .pR{animation:mrJoinR 1s cubic-bezier(.5,0,.3,1) 3s both;}

.mr h2{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;letter-spacing:.14em;text-transform:uppercase;color:${LAPIS.ink};
  opacity:0;animation:mrPop .5s cubic-bezier(.3,1.6,.5,1) 4.3s forwards;}
.mr p{margin:0;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.onDark};opacity:0;animation:mrRv .5s ease 4.6s forwards;}
/* B11 (audit-sniffer-2026-09-26): tlačidlá boli takmer 5 s neviditeľné, ale klikateľné.
   `pointer-events` je nespojitá vlastnosť — dva tesné kroky tesne pred koncom animácie
   spôsobia, že sa prepne až vtedy, keď je blok naozaj vidno, nie skôr. */
.mr-acts{width:100%;display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.sm}px;opacity:0;pointer-events:none;
  animation:mrActs .5s ease 4.9s forwards;}

@keyframes mrScene{0%{opacity:0}6%{opacity:1}88%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.05)}}
@keyframes mrDogL{from{transform:translateX(-34%)}to{transform:none}}
@keyframes mrDogR{from{transform:translateX(34%)}to{transform:none}}
@keyframes mrSniff{0%,100%{transform:none}50%{transform:scale(1.035)}}
@keyframes mrHt{0%{opacity:0;transform:translate(0,10px) scale(.3)}18%{opacity:1;transform:translate(calc(var(--x) * .3),-12px) scale(1)}
  60%{opacity:1;transform:translate(var(--x),-40px) scale(1) rotate(-8deg)}100%{opacity:0;transform:translate(calc(var(--x) * 1.2),-70px) scale(.9) rotate(6deg)}}
@keyframes mrJoinL{0%{opacity:0;transform:translateX(-96px) scale(.8)}25%{opacity:1}
  60%{opacity:1;transform:translateX(-52px) scale(1)}100%{opacity:1;transform:translateX(-34px) scale(1)}}
@keyframes mrJoinR{0%{opacity:0;transform:translateX(96px) scale(.8)}25%{opacity:1}
  60%{opacity:1;transform:translateX(52px) scale(1)}100%{opacity:1;transform:translateX(34px) scale(1)}}
@keyframes mrPulse{0%{transform:scale(1)}45%{transform:scale(1.1)}100%{transform:scale(1)}}
@keyframes mrPop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
@keyframes mrRv{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes mrActs{from{opacity:0;transform:translateY(8px)}99%{pointer-events:none}100%{opacity:1;transform:none;pointer-events:auto}}
@media (prefers-reduced-motion: reduce){
  .mr *,.mr-duo *{animation:none !important;}
  .mr h2,.mr p,.mr-acts,.mr-pair .pL,.mr-pair .pR{opacity:1;}
  .mr-acts{pointer-events:auto;}
  .mr-pair .pL{transform:translateX(-34px);}
  .mr-pair .pR{transform:translateX(34px);}
}
`;

export function SnifferMatchReveal({ me, them, title, names, children }: {
  me: string | null;
  them: string | null;
  title: string;
  names: string;
  /** Tlačidlá (Napísať · Sniffovať ďalej) — vstupujú ako posledné. */
  children: ReactNode;
}) {
  const [run, setRun] = useState(0);
  return (
    <div className="mr" key={run}>
      <style>{CSS}</style>
      <div className="mr-duo" onClick={() => setRun((n) => n + 1)} role="img" aria-label={title}>
        <span className="mr-scene" aria-hidden>
          <img src={`${Z}bg.webp`} alt="" />
          <img className="dR" src={`${Z}dog-right.webp`} alt="" />
          <img className="dL" src={`${Z}dog-left.webp`} alt="" />
          {HEARTS.map(([n, x, d, w]) => (
            <img key={n} className="ht" src={`${Z}heart-${n}.webp`} alt=""
              style={{ ['--x' as string]: `${x}px`, ['--d' as string]: `${d}s`, ['--w' as string]: `${w}px` }} />
          ))}
        </span>
        <span className="mr-pair">
          {me ? <img className="pL" src={pic(me)} alt="" /> : <span className="pL" />}
          {them ? <img className="pR" src={pic(them)} alt="" /> : <span className="pR" />}
        </span>
      </div>
      <h2>{title}</h2>
      <p>{names}</p>
      <div className="mr-acts">{children}</div>
    </div>
  );
}
