// SNIFFER — animované logo (25. 9. 2026).
// Matej: „locknime zatiaľ 1 a 2" (hárok v Canve) — 1 = nos a okolo neho farebné kresby,
// 2 = nos v obrátenom srdci („srdce naopak je vlastne zadok"). Animácia ich spája do jedného
// príbehu: „najprv zobrazenie nosa, točiace sa ikony… a následne sa to srdce zväčší a schová
// sa do neho nos" + „nos zavonia ešte raz". Záverečný obraz = logo 2.
//
// 🎨 HRAVÉ FARBY SÚ ZÁMER, NIE ODCHÝLKA (Matej: „aj farby by som použil nech je to hravé").
//    SNIFFER má — ako AINUBIS — vlastnú malú paletu; žije TU a nikde inde sa nepoužíva.
//    Kresby sú Matejom vybrané kusy z kitu (`vstupy/vizualna-identita/Icons hand drawn/`),
//    kópie v `public/icons/sniffer/`. Farbí ich CSS maska, SVG sa nemenia.
// ⚠️ Logo na mieru ešte nie je — nos je dočasne z kitu. Keď príde vektor, mení sa len `nose.svg`.
import { useState } from 'react';

const ICONS: Array<{ file: string; color: string }> = [
  { file: 'smile', color: '#E86FB0' },     // ružový smajlík (hore)
  { file: 'trees', color: '#3E8E5A' },     // zelené stromy
  { file: 'sun', color: '#F08A3C' },       // oranžové slnko
  { file: 'heart', color: '#E8493F' },     // červené srdce
  { file: 'ball', color: '#72B83A' },      // loptička
  { file: 'mountains', color: '#2F5DB8' }, // modré hory
  { file: 'apple', color: '#A33A32' },     // jablko
  { file: 'map', color: '#7D7466' },       // mapa s lupou
];
/** Srdce loga 2 — koralová z Matejovho návrhu. */
export const SNIFFER_HEART = '#E8493F';
const INK = '#1F1A0E';

const CSS = `
@property --snl-r { syntax:'<length>'; inherits:false; initial-value:0px; }
.snl{position:relative;width:var(--snl-size);height:var(--snl-size);margin:0 auto;cursor:pointer;
  -webkit-tap-highlight-color:transparent;}
.snl > *{position:absolute;left:50%;top:50%;}
.snl-mask{display:block;-webkit-mask:var(--snl-src) center/contain no-repeat;mask:var(--snl-src) center/contain no-repeat;}
/* SRDCE — obrátené (hrot hore), vyrastie až po splynutí kresieb */
.snl-heart{width:92%;height:92%;margin:-46% 0 0 -46%;transform:scale(0) rotate(0deg);transform-origin:50% 60%;
  animation:snl-heart .7s cubic-bezier(.3,1.6,.5,1) 3.9s forwards, snl-wag .9s ease-in-out 4.7s 1 forwards;}
.snl-heart svg{width:100%;height:100%;display:block;}
/* KRESBY — prstenec, ktorý sa roztočí a stiahne do nosa */
.snl-ring{width:0;height:0;animation:snl-spin 3.4s cubic-bezier(.45,0,.55,1) .5s forwards;}
.snl-ico{position:absolute;left:0;top:0;width:calc(var(--snl-size) * .15);height:calc(var(--snl-size) * .15);background:var(--snl-c);opacity:0;
  --snl-r:calc(var(--snl-size) * .3);
  transform:translate(-50%,-50%) rotate(var(--snl-a)) translateY(calc(-1 * var(--snl-r))) rotate(calc(-1 * var(--snl-a)));
  animation:snl-ico-in .5s ease-out calc(.3s + var(--snl-i) * .06s) forwards, snl-merge .7s cubic-bezier(.6,0,.9,.4) 3.2s forwards;}
/* NOS — začuchá na začiatku, na konci sedí v srdci a zavonia ešte raz */
.snl-nose{width:44%;height:44%;margin:-22% 0 0 -22%;background:${INK};transform:scale(0);
  animation:snl-nose-in .45s cubic-bezier(.3,1.5,.5,1) forwards, snl-sniff .5s ease-in-out .6s 2,
    snl-nose-sit .6s ease-in-out 3.9s forwards, snl-sniff2 .5s ease-in-out 5.8s 2;}
@keyframes snl-nose-in{to{transform:scale(1);}}
@keyframes snl-sniff{50%{transform:scale(1.08,.94);}}
@keyframes snl-nose-sit{from{transform:scale(1);}to{transform:scale(.86) translateY(-4%);}}
@keyframes snl-sniff2{0%,100%{transform:scale(.86) translateY(-4%);}50%{transform:scale(.93,.8) translateY(-4%);}}
@keyframes snl-ico-in{from{opacity:0;--snl-r:calc(var(--snl-size) * .18);}to{opacity:1;--snl-r:calc(var(--snl-size) * .4);}}
@keyframes snl-spin{to{transform:rotate(540deg);}}
@keyframes snl-merge{from{opacity:1;--snl-r:calc(var(--snl-size) * .4);}to{opacity:0;--snl-r:0px;}}
@keyframes snl-heart{to{transform:scale(1);}}
@keyframes snl-wag{0%,100%{transform:scale(1) rotate(0deg);}25%{transform:scale(1) rotate(-7deg);}75%{transform:scale(1) rotate(7deg);}}
@media (prefers-reduced-motion: reduce){
  .snl *{animation:none!important;}
  .snl-heart{transform:scale(1);} .snl-nose{transform:scale(.86) translateY(-4%);} .snl-ico{opacity:0;}
}
`;

/** Obrátené srdce v štvorci 100×100 — hrot hore, dva laloky dole. */
const HEART_PATH = 'M50 10 C20 32 4 48 4 66 C4 82 15 92 28 92 C38 92 46 86 50 78 C54 86 62 92 72 92 C85 92 96 82 96 66 C96 48 80 32 50 10Z';

/** Animované logo. Ťuknutím sa prehrá znova. */
export function SnifferLogo({ size = 200 }: { size?: number }) {
  const [run, setRun] = useState(0);
  return (
    <>
      <style>{CSS}</style>
      <div key={run} className="snl" style={{ ['--snl-size' as string]: `${size}px` }}
        onClick={() => setRun((n) => n + 1)} role="img" aria-label="SNIFFER">
        <span className="snl-heart" aria-hidden>
          <svg viewBox="0 0 100 100"><path d={HEART_PATH} fill={SNIFFER_HEART} /></svg>
        </span>
        <span className="snl-ring" aria-hidden>
          {ICONS.map((ic, i) => (
            <span key={ic.file} className="snl-ico snl-mask" style={{
              ['--snl-src' as string]: `url(/icons/sniffer/${ic.file}.svg)`,
              ['--snl-c' as string]: ic.color,
              ['--snl-a' as string]: `${(360 / ICONS.length) * i}deg`,
              ['--snl-i' as string]: i,
            }} />
          ))}
        </span>
        <span className="snl-nose snl-mask" style={{ ['--snl-src' as string]: 'url(/icons/sniffer/nose.svg)' }} aria-hidden />
      </div>
    </>
  );
}
