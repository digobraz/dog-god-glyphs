// SNIFFER — animované logo (25. 9. 2026).
// Matej: „locknime zatiaľ 1 a 2" (hárok v Canve) — 1 = nos a okolo neho farebné kresby,
// 2 = nos v obrátenom srdci („srdce naopak je vlastne zadok"). Animácia ich spája do jedného
// príbehu a končí PRESNE znakom z loga (`public/icons/sniffer/sniffer-znak.svg`).
//
// ⏱ ČASOVANIE (Matej 25. 9., 3. kolo: „nestoja nehybne! nástup bez čuchania, len jeden pulz —
//    potom obkolesenie pomalé a zaseknutie sa na sekundu, v podobe, akú som ti poslal"):
//    0,1 s nos jedným pulzom · 0,8–3,2 s kresby pomaly obehnú (všetky naraz, rovnomerne) ·
//    3,2–4,4 s STOJA NEHYBNE v Matejovom rozložení · 4,4 s sa stiahnu do nosa · 5,0 s srdce
//    narastie, nos si sadne · 5,8 s polovice srdca sa striedavo zatrasú · 7,2 s nos zavonia.
//
// 📐 KONEČNÁ POLOHA NOSA = GEOMETRIA ZNAKU („v závere ten nos nie je dobre v srdci, treba to dať
//    podľa horného nákresu"). Srdce leží v štvorci 92 % so stredom v strede; v jeho súradniciach
//    100×100 sedí nos v obdĺžniku 52×48 na (24, 28) — tak ako v `sniffer-znak.svg`. Preto nos
//    konči 47,8 % × 44,2 % so stredom na 51,8 % výšky.
//
// 🎨 HRAVÉ FARBY SÚ ZÁMER (Matej: „aj farby by som použil, nech je to hravé"), paleta žije len tu.
//    Kresby sú Matejom vybrané kusy z kitu, kópie v `public/icons/sniffer/`, farbí ich CSS maska.
import { useEffect, useState } from 'react';

export const ICONS: Array<{ file: string; color: string }> = [
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
export const SNIFFER_LOGO_DONE_MS = 5700;
/** Celá animácia vrátane posledného začuchania. */
export const SNIFFER_LOGO_END_MS = 8000;
const INK = '#1F1A0E';

const CSS = `
@property --snl-t { syntax:'<angle>'; inherits:false; initial-value:0deg; }
@property --snl-r { syntax:'<length>'; inherits:false; initial-value:0px; }
.snl{position:relative;width:var(--snl-size);height:var(--snl-size);margin:0 auto;cursor:pointer;
  -webkit-tap-highlight-color:transparent;}
.snl > *{position:absolute;left:50%;top:50%;}
.snl-mask{display:block;-webkit-mask:var(--snl-src) center/contain no-repeat;mask:var(--snl-src) center/contain no-repeat;}
/* SRDCE = ZADOK (Matej: „srdce musí vyznieť ako zadok — jedna a druhá pola sa zatrasú").
   Dve polovice, každá sa trasie sama a o chvíľu neskôr než druhá. */
.snl-heart{width:92%;height:92%;margin:-46% 0 0 -46%;transform:scale(0);transform-origin:50% 60%;
  animation:snl-heart .7s cubic-bezier(.3,1.5,.5,1) 5s forwards;}
.snl-heart svg{width:100%;height:100%;display:block;overflow:visible;}
.snl-cheek{transform-box:fill-box;transform-origin:50% 20%;}
.snl-cheek--l{animation:snl-jig .42s ease-in-out 5.8s 3;}
.snl-cheek--r{animation:snl-jig .42s ease-in-out 5.95s 3;}
@keyframes snl-jig{0%,100%{transform:none;}30%{transform:translateY(2.5%) scale(1.03,.95);}65%{transform:translateY(-1.5%) scale(.98,1.04);}}
.snl-ring{width:0;height:0;}
/* KRESBY — presne rozloženie z Matejovho obrázka: smajlík hore, v smere hodín stromy, slnko,
   srdce, loptička, hory, jablko, mapa. Obehnú VŠETKY NARAZ rovnomerne (linear) a ZASEKNÚ sa
   — plynulé dobrzďovanie vyzeralo, že sa ešte hýbu („nestoja nehybne!"). Stoja 1,2 s. */
.snl-ico{position:absolute;left:0;top:0;width:calc(var(--snl-size) * .13);height:calc(var(--snl-size) * .13);background:var(--snl-c);opacity:0;
  --snl-r:calc(var(--snl-size) * .31);--snl-t:-150deg;
  transform:translate(-50%,-50%) rotate(calc(var(--snl-a) + var(--snl-t))) translateY(calc(-1 * var(--snl-r))) rotate(calc(-1 * (var(--snl-a) + var(--snl-t))));
  animation:snl-fade .5s ease-out calc(.8s + var(--snl-i) * .1s) forwards, snl-orbit 2.4s linear .8s forwards,
    snl-merge .7s cubic-bezier(.6,0,.9,.4) 4.4s forwards;}
/* Nos: JEDEN pulz pri nástupe (bez čuchania), na konci si sadne do polohy znaku. */
.snl-nose{width:44%;height:44%;margin:-22% 0 0 -22%;background:${INK};transform:scale(0);
  animation:snl-nose-in .6s cubic-bezier(.3,1.6,.5,1) .1s forwards, snl-nose-sit .7s ease-in-out 5s forwards,
    snl-sniff2 .55s ease-in-out 7.2s 1;}
@keyframes snl-nose-in{0%{transform:scale(0);}60%{transform:scale(.92);}100%{transform:scale(.82);}}
@keyframes snl-nose-sit{from{transform:scale(.82);}to{transform:translateY(4.2%) scale(1.086,1.004);}}
@keyframes snl-sniff2{0%,100%{transform:translateY(4.2%) scale(1.086,1.004);}50%{transform:translateY(4.2%) scale(1.14,.95);}}
@keyframes snl-fade{to{opacity:1;}}
@keyframes snl-orbit{from{--snl-t:-150deg;}to{--snl-t:0deg;}}
@keyframes snl-merge{from{opacity:1;--snl-r:calc(var(--snl-size) * .31);--snl-t:0deg;}to{opacity:0;--snl-r:0px;--snl-t:0deg;}}
@keyframes snl-heart{to{transform:scale(1);}}
@media (prefers-reduced-motion: reduce){
  .snl *{animation:none!important;}
  .snl-heart{transform:scale(1);} .snl-nose{transform:translateY(4.2%) scale(1.086,1.004);} .snl-ico{opacity:0;}
}
`;

/** Obrátené srdce (to isté ako v znaku) rozdelené na dve polovice, aby sa každá trásla sama. */
// Polovice sa v strede prekrývajú o 1 jednotku — bez toho presvitá stredom svetlý šev.
const CHEEK_L = 'M51 10.7 L50 10 C20 32 4 48 4 66 C4 82 15 92 28 92 C38 92 46 86 50 78 L51 79.6 Z';
const CHEEK_R = 'M49 10.7 L50 10 C80 32 96 48 96 66 C96 82 85 92 72 92 C62 92 54 86 50 78 L49 79.6 Z';

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
          <svg viewBox="0 0 100 100">
            <path className="snl-cheek snl-cheek--l" d={CHEEK_L} fill={SNIFFER_HEART} />
            <path className="snl-cheek snl-cheek--r" d={CHEEK_R} fill={SNIFFER_HEART} />
          </svg>
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
