// SNIFFER — ODHALENIE ZHODY (zadanie-sniffer-stavba §2.6 D, nákres obrazovka D).
// Matej 25. 9.: „druhú animáciu pri MATCHI, nie tú z úvodu". Choreografia je z nákresu
// (`plany/nakres-sniffer/nakres.css`, `.duo` a `.rv2`) — časy a dráhy sú prenesené, nie nové:
//   0,0 s  dve fotky priletia z bokov
//   0,8 s  nosy sa 2× oňuchajú
//   1,8 s  vybuchnú kresby z loga (tie isté, čo obiehajú v úvode — `ICONS` zo SnifferLogo)
//   1,9 s  srdce obtiahne oboch
//   2,5 s  „Zavetrili ste sa!" · 2,8 s mená · 3,1 s tlačidlá
// Ťuk na scénu = prehrať znova. Kto má vypnuté pohyby, vidí rovno konečný stav.
import { useState, type ReactNode } from 'react';
import { withTransform } from '@/services/cloudinaryService';
import { PACK_THEME as T, PACK_R, PACK_SPACE, PACK_TEXT, PACK_SHADOW, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { ICONS, SNIFFER_HEART } from './SnifferLogo';

const HEART = 'M50 10 C20 32 4 48 4 66 C4 82 15 92 28 92 C38 92 46 86 50 78 C54 86 62 92 72 92 C85 92 96 82 96 66 C96 48 80 32 50 10Z';
const pic = (u?: string | null) => withTransform(u, 'c_fill,g_auto,w_240,h_240,f_auto,q_auto');

const CSS = `
.mr{display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.md}px;text-align:center;width:100%;max-width:360px;}
.mr-duo{position:relative;width:220px;height:170px;cursor:pointer;outline:none;}

.mr-duo .pL,.mr-duo .pR{position:absolute;top:35px;width:96px;height:96px;border-radius:${PACK_R.pill}px;border:3px solid ${LAPIS.ink};
  object-fit:cover;display:block;box-shadow:${PACK_SHADOW.panel};background:${T.pageBg};}
.mr-duo .pL{left:14px;animation:mrInL .7s cubic-bezier(.2,.9,.3,1.2) both;}
.mr-duo .pR{right:14px;animation:mrInR .7s cubic-bezier(.2,.9,.3,1.2) both;}
.mr-duo .nL,.mr-duo .nR{position:absolute;top:70px;width:26px;height:24px;background:${LAPIS.ink};opacity:0;
  -webkit-mask:url(/icons/pack/nose.svg) center/contain no-repeat;mask:url(/icons/pack/nose.svg) center/contain no-repeat;}
.mr-duo .nL{left:88px;animation:mrSnif .5s ease-in-out .8s 2 both;}
.mr-duo .nR{right:88px;transform:scaleX(-1);animation:mrSnifR .5s ease-in-out .8s 2 both;}
.mr-duo .mr-ring{position:absolute;inset:-18px -10px;opacity:0;animation:mrRing .7s ease-out 1.9s forwards;pointer-events:none;}
.mr-duo .mr-ring svg{width:100%;height:100%;overflow:visible;}
.mr-duo .burst{position:absolute;left:50%;top:82px;}
.mr-duo .bu{position:absolute;width:22px;height:22px;margin:-11px;opacity:0;animation:mrBu 1s cubic-bezier(.2,.8,.3,1) calc(1.8s + var(--d)) forwards;
  background:var(--c);-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat;}
.mr h2{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;letter-spacing:.14em;text-transform:uppercase;color:${LAPIS.ink};
  opacity:0;animation:mrPop .5s cubic-bezier(.3,1.6,.5,1) 2.5s forwards;}
.mr p{margin:0;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.onDark};opacity:0;animation:mrRv .5s ease 2.8s forwards;}
.mr-acts{width:100%;display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.sm}px;opacity:0;animation:mrRv .5s ease 3.1s forwards;}
@keyframes mrInL{from{transform:translateX(-160px) rotate(-20deg);opacity:0}to{transform:none;opacity:1}}
@keyframes mrInR{from{transform:translateX(160px) rotate(20deg);opacity:0}to{transform:none;opacity:1}}
@keyframes mrSnif{0%{opacity:1;transform:translateX(0)}50%{opacity:1;transform:translateX(6px)}100%{opacity:1;transform:translateX(0)}}
@keyframes mrSnifR{0%{opacity:1;transform:scaleX(-1) translateX(0)}50%{opacity:1;transform:scaleX(-1) translateX(6px)}100%{opacity:1;transform:scaleX(-1) translateX(0)}}
@keyframes mrRing{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
@keyframes mrBu{0%{opacity:0;transform:rotate(var(--a)) translateY(0) rotate(calc(-1*var(--a))) scale(.3)}30%{opacity:1}100%{opacity:0;transform:rotate(var(--a)) translateY(-120px) rotate(calc(-1*var(--a))) scale(1)}}
@keyframes mrPop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
@keyframes mrRv{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){
  .mr *,.mr-duo *{animation:none !important;}
  .mr h2,.mr p,.mr-acts,.mr-duo .mr-ring,.mr-duo .nL,.mr-duo .nR{opacity:1;}
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
        <span className="mr-ring" aria-hidden>
          <svg viewBox="0 0 100 100"><path d={HEART} fill="none" stroke={SNIFFER_HEART} strokeWidth={3} /></svg>
        </span>
        {me ? <img className="pL" src={pic(me)} alt="" /> : <span className="pL" />}
        {them ? <img className="pR" src={pic(them)} alt="" /> : <span className="pR" />}
        <span className="nL" aria-hidden />
        <span className="nR" aria-hidden />
        <span className="burst" aria-hidden>
          {ICONS.map((ic, n) => (
            <span key={ic.file} className="bu" style={{
              ['--a' as string]: `${n * (360 / ICONS.length)}deg`,
              ['--d' as string]: `${(n * 0.04).toFixed(2)}s`,
              ['--c' as string]: ic.color,
              ['--m' as string]: `url(/icons/sniffer/${ic.file}.svg)`,
            }} />
          ))}
        </span>
      </div>
      <h2>{title}</h2>
      <p>{names}</p>
      <div className="mr-acts">{children}</div>
    </div>
  );
}
