// SNIFFER — animované logo (25. 9. 2026).
// Matej: „locknime zatiaľ 1 a 2" (hárok v Canve) — 1 = nos a okolo neho farebné kresby,
// 2 = nos v obrátenom srdci („srdce naopak je vlastne zadok"). Animácia ich spája do jedného
// príbehu a končí PRESNE znakom z loga (`public/icons/sniffer/sniffer-znak.svg`).
//
// ⏱ ČASOVANIE (Matej 25. 9. po prvej verzii: „moc rýchla, spomaľ ju, najprv bude vidno len
//    nos, potom spomaľ tie ikonky okolo — musia byť vidno 1–2 sekundy, až potom sa stiahnu"):
//    0,0 s nos sa objaví · 0,8 s dvakrát začuchá · 2,0 s kresby nabiehajú jedna po druhej
//    a pomaly sa točia · ~3,4–5,2 s sú všetky vidno · 5,2 s sa stiahnu do nosa ·
//    6,0 s narastie srdce a nos si sadne do jeho polohy v logu · 6,8 s srdce zavrtí ·
//    7,8 s nos zavonia ešte raz. `SNIFFER_LOGO_DONE_MS` = keď je znak hotový (text za ním).
//
// 📐 KONEČNÁ POLOHA NOSA = GEOMETRIA ZNAKU („v závere ten nos nie je dobre v srdci, treba to dať
//    podľa horného nákresu"). Srdce leží v štvorci 92 % so stredom v strede; v jeho súradniciach
//    100×100 sedí nos v obdĺžniku 52×48 na (24, 28) — tak ako v `sniffer-znak.svg`. Preto nos
//    konči 47,8 % × 44,2 % so stredom na 51,8 % výšky.
//
// 🎨 HRAVÉ FARBY SÚ ZÁMER (Matej: „aj farby by som použil, nech je to hravé"), paleta žije len tu.
//    Kresby sú Matejom vybrané kusy z kitu, kópie v `public/icons/sniffer/`, farbí ich CSS maska.
import { useEffect, useState } from 'react';

const ICONS: Array<{ file: string; color: string }> = [
  { file: 'smile', color: '#E86FB0' },
  { file: 'trees', color: '#3E8E5A' },
  { file: 'sun', color: '#F08A3C' },
  { file: 'heart', color: '#E8493F' },
  { file: 'ball', color: '#72B83A' },
  { file: 'mountains', color: '#2F5DB8' },
  { file: 'apple', color: '#A33A32' },
  { file: 'map', color: '#7D7466' },
];
/** Srdce loga — koralová z Matejovho návrhu. */
export const SNIFFER_HEART = '#E8493F';
/** Znak je hotový (srdce stojí, nos sedí) — odtiaľ smie nabehnúť nápis a veta. */
export const SNIFFER_LOGO_DONE_MS = 6700;
/** Celá animácia vrátane posledného začuchania. */
export const SNIFFER_LOGO_END_MS = 8800;
const INK = '#1F1A0E';

const CSS = `
@property --snl-r { syntax:'<length>'; inherits:false; initial-value:0px; }
.snl{position:relative;width:var(--snl-size);height:var(--snl-size);margin:0 auto;cursor:pointer;
  -webkit-tap-highlight-color:transparent;}
.snl > *{position:absolute;left:50%;top:50%;}
.snl-mask{display:block;-webkit-mask:var(--snl-src) center/contain no-repeat;mask:var(--snl-src) center/contain no-repeat;}
.snl-heart{width:92%;height:92%;margin:-46% 0 0 -46%;transform:scale(0) rotate(0deg);transform-origin:50% 60%;
  animation:snl-heart .8s cubic-bezier(.3,1.5,.5,1) 5.9s forwards, snl-wag 1s ease-in-out 6.8s 1 forwards;}
.snl-heart svg{width:100%;height:100%;display:block;}
.snl-ring{width:0;height:0;animation:snl-spin 3.6s cubic-bezier(.4,0,.6,1) 2s forwards;}
.snl-ico{position:absolute;left:0;top:0;width:calc(var(--snl-size) * .15);height:calc(var(--snl-size) * .15);background:var(--snl-c);opacity:0;
  --snl-r:calc(var(--snl-size) * .3);
  transform:translate(-50%,-50%) rotate(var(--snl-a)) translateY(calc(-1 * var(--snl-r))) rotate(calc(-1 * var(--snl-a)));
  animation:snl-ico-in .7s ease-out calc(2s + var(--snl-i) * .18s) forwards, snl-merge .8s cubic-bezier(.6,0,.9,.4) 5.2s forwards;}
/* Nos: začína 44 % v strede, končí v polohe znaku (47,8 % × 44,2 %, stred na 51,8 %). */
.snl-nose{width:44%;height:44%;margin:-22% 0 0 -22%;background:${INK};transform:scale(0);
  animation:snl-nose-in .6s cubic-bezier(.3,1.5,.5,1) .2s forwards, snl-sniff .55s ease-in-out .9s 2,
    snl-nose-sit .8s ease-in-out 5.9s forwards, snl-sniff2 .55s ease-in-out 7.8s 2;}
@keyframes snl-nose-in{from{transform:scale(0);}to{transform:scale(1);}}
@keyframes snl-sniff{50%{transform:scale(1.08,.94);}}
@keyframes snl-nose-sit{from{transform:scale(1);}to{transform:translateY(4.2%) scale(1.086,1.004);}}
@keyframes snl-sniff2{0%,100%{transform:translateY(4.2%) scale(1.086,1.004);}50%{transform:translateY(4.2%) scale(1.14,.95);}}
@keyframes snl-ico-in{from{opacity:0;--snl-r:calc(var(--snl-size) * .2);}to{opacity:1;--snl-r:calc(var(--snl-size) * .4);}}
@keyframes snl-spin{to{transform:rotate(240deg);}}
@keyframes snl-merge{from{opacity:1;--snl-r:calc(var(--snl-size) * .4);}to{opacity:0;--snl-r:0px;}}
@keyframes snl-heart{to{transform:scale(1);}}
@keyframes snl-wag{0%,100%{transform:scale(1) rotate(0deg);}25%{transform:scale(1) rotate(-7deg);}75%{transform:scale(1) rotate(7deg);}}
@media (prefers-reduced-motion: reduce){
  .snl *{animation:none!important;}
  .snl-heart{transform:scale(1);} .snl-nose{transform:translateY(4.2%) scale(1.086,1.004);} .snl-ico{opacity:0;}
}
`;

/** Obrátené srdce v štvorci 100×100 — hrot hore, dva laloky dole (to isté ako v znaku). */
const HEART_PATH = 'M50 10 C20 32 4 48 4 66 C4 82 15 92 28 92 C38 92 46 86 50 78 C54 86 62 92 72 92 C85 92 96 82 96 66 C96 48 80 32 50 10Z';

/** Animované logo. Ťuknutím sa prehrá znova; `onDone` zavolá, keď je znak hotový. */
export function SnifferLogo({ size = 200, onDone }: { size?: number; onDone?: () => void }) {
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!onDone) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const id = window.setTimeout(onDone, reduce ? 0 : SNIFFER_LOGO_DONE_MS);
    return () => window.clearTimeout(id);
  }, [run, onDone]);
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
