// SNIFFER — ODHALENIE ZHODY.
// Kolo 7 (Matej 26. 9.): „skúsme najprv prekresliť taký ten obrázok a potom urobíme videjko, ako sa
// priblížia k sebe a vyletia srdiečka a tie dve fotky sa spoja (bez tých nosov atď)" → obrázok B2 bez
// obojku (`plany/nakres-zhoda-obrazok-2026-09-26`) ako ÚVODNÝ ZÁBER (variant A). Choreografia:
//   0,0 s  obrázok (pes čuchá psa, srdiečka) — jemný nájazd, o 2 s zmizne
//   1,8 s  dve fotky priletia z bokov · 2,4 s dotknú sa → vyletia srdiečka
//   2,8 s  fotky zapadnú do seba (prekryv ~1/3, obe tváre celé) · krátky pulz spolu
//   3,1 s  „Zavetrili ste sa!" · 3,4 s mená · 3,7 s tlačidlá
// Nosy, obrysové srdce a výbuch kresieb z loga (kolo 5) ZRUŠENÉ. Ťuk na scénu = prehrať znova.
// Kto má vypnuté pohyby, vidí rovno konečný stav (spojené fotky).
import { useState, type ReactNode } from 'react';
import { withTransform } from '@/services/cloudinaryService';
import { PACK_THEME as T, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { SNIFFER_HEART } from './SnifferLogo';

const HEART = 'M50 88 C20 66 4 50 4 32 C4 16 15 6 28 6 C38 6 46 12 50 20 C54 12 62 6 72 6 C85 6 96 16 96 32 C96 50 80 66 50 88Z';
const pic = (u?: string | null) => withTransform(u, 'c_fill,g_auto,w_240,h_240,f_auto,q_auto');
/** Srdiečka: uhol letu, oneskorenie, veľkosť, farba (koral loga + ružová z obrázka). */
const HEARTS: Array<[number, number, number, string]> = [
  [-60, 0, 18, SNIFFER_HEART], [-30, 0.06, 14, '#E58A9B'], [-8, 0.02, 22, SNIFFER_HEART], [14, 0.1, 16, '#E58A9B'],
  [36, 0.04, 20, SNIFFER_HEART], [62, 0.12, 14, '#E58A9B'], [0, 0.16, 12, '#E58A9B'],
];

const CSS = `
.mr{display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.md}px;text-align:center;width:100%;max-width:360px;}
.mr-duo{position:relative;width:282px;height:188px;cursor:pointer;outline:none;-webkit-user-select:none;user-select:none;}
/* Ťah prstom/myšou po scéne nesmie obrázky OZNAČIŤ (modrý výber, nájdené 26. 9. pri nahrávke swipu). */
.mr-duo img{-webkit-user-drag:none;pointer-events:none;}
/* 1 · ÚVODNÝ ZÁBER — obrázok zmizne, keď priletia fotky. */
.mr-art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:${PACK_R.tile}px;opacity:0;animation:mrArt 2.1s ease both;}
/* 2 · FOTKY — dotknú sa a zapadnú do seba asi do tretiny. Polovičné kruhy (prvý pokus 26. 9.)
   rozťali tváre napoly, preto prekryv: obe tváre ostanú celé, pulzujú spolu ako jeden celok. */
.mr-pair{position:absolute;left:50%;top:50%;width:104px;height:104px;margin:-52px 0 0 -52px;animation:mrPulse .45s ease 2.8s both;}
.mr-pair .pL,.mr-pair .pR{position:absolute;inset:0;width:100%;height:100%;border-radius:${PACK_R.pill}px;border:3px solid ${LAPIS.ink};
  object-fit:cover;display:block;background:${T.pageBg};opacity:0;}
.mr-pair .pL{animation:mrJoinL 1s cubic-bezier(.5,0,.3,1) 1.8s both;}
.mr-pair .pR{animation:mrJoinR 1s cubic-bezier(.5,0,.3,1) 1.8s both;}
/* 3 · SRDIEČKA — vyletia z miesta dotyku. */
.mr-hearts{position:absolute;left:50%;top:50%;}
.mr-hearts svg{position:absolute;width:var(--s);height:var(--s);margin:calc(var(--s) / -2);opacity:0;overflow:visible;
  animation:mrHeart 1.3s cubic-bezier(.2,.8,.3,1) calc(2.4s + var(--d)) forwards;}
.mr h2{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;letter-spacing:.14em;text-transform:uppercase;color:${LAPIS.ink};
  opacity:0;animation:mrPop .5s cubic-bezier(.3,1.6,.5,1) 3.1s forwards;}
.mr p{margin:0;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.onDark};opacity:0;animation:mrRv .5s ease 3.4s forwards;}
.mr-acts{width:100%;display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.sm}px;opacity:0;animation:mrRv .5s ease 3.7s forwards;}
@keyframes mrArt{0%{opacity:0;transform:scale(.96)}12%{opacity:1;transform:scale(1)}78%{opacity:1;transform:scale(1.04)}100%{opacity:0;transform:scale(1.07)}}
@keyframes mrJoinL{0%{opacity:0;transform:translateX(-96px) scale(.8)}25%{opacity:1}
  60%{opacity:1;transform:translateX(-52px) scale(1)}100%{opacity:1;transform:translateX(-34px) scale(1)}}
@keyframes mrJoinR{0%{opacity:0;transform:translateX(96px) scale(.8)}25%{opacity:1}
  60%{opacity:1;transform:translateX(52px) scale(1)}100%{opacity:1;transform:translateX(34px) scale(1)}}
@keyframes mrPulse{0%{transform:scale(1)}45%{transform:scale(1.1)}100%{transform:scale(1)}}
@keyframes mrHeart{0%{opacity:0;transform:rotate(var(--a)) translateY(0) rotate(calc(-1*var(--a))) scale(.3)}20%{opacity:1}
  100%{opacity:0;transform:rotate(var(--a)) translateY(-110px) rotate(calc(-1*var(--a))) scale(1)}}
@keyframes mrPop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
@keyframes mrRv{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){
  .mr *,.mr-duo *{animation:none !important;}
  .mr h2,.mr p,.mr-acts,.mr-pair .pL,.mr-pair .pR{opacity:1;}
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
        <img className="mr-art" src="/images/sniffer/match.jpg" alt="" />
        <span className="mr-pair">
          {me ? <img className="pL" src={pic(me)} alt="" /> : <span className="pL" />}
          {them ? <img className="pR" src={pic(them)} alt="" /> : <span className="pR" />}
        </span>
        <span className="mr-hearts" aria-hidden>
          {HEARTS.map(([a, d, s, c], n) => (
            <svg key={n} viewBox="0 0 100 100" style={{
              ['--a' as string]: `${a}deg`, ['--d' as string]: `${d}s`, ['--s' as string]: `${s}px`,
            }}><path d={HEART} fill={c} /></svg>
          ))}
        </span>
      </div>
      <h2>{title}</h2>
      <p>{names}</p>
      <div className="mr-acts">{children}</div>
    </div>
  );
}
