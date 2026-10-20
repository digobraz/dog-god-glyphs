import{g as l,r as d,M as h,u as m,j as t}from"./index-B-BQrD2y.js";function f(){const a=l(o=>o.dogName),n=l(o=>o.dogPhotoUrl),i=l(o=>o.extraDogs),s=l(o=>o.mainDogPos);return d.useMemo(()=>{const o=i.map(p=>({id:p.id,name:p.name,photo:p.photoUrl})),r={id:h,name:a,photo:n||null},e=Math.max(0,Math.min(s,o.length));return[...o.slice(0,e),r,...o.slice(e)]},[i,a,n,s])}function k({dogs:a,cur:n,onGo:i,done:s,className:o=""}){const r=m(),e=a[Math.min(n,Math.max(0,a.length-1))];return t.jsxs("div",{className:`fdh-row ${o}`,children:[e!=null&&e.photo?t.jsx("img",{className:"fdh-photo",src:e.photo,alt:(e==null?void 0:e.name)||""}):t.jsx("span",{className:"fdh-photo fdh-photo--empty",children:((e==null?void 0:e.name)||"?").slice(0,1)}),t.jsxs("span",{className:"fdh-name",children:[(e==null?void 0:e.name)||r("heroglyph.flow.yourDogFallback"),s&&t.jsx("i",{className:"fdh-ok",children:"✓"})]}),a.length>1&&t.jsxs("div",{className:"fdh-switch",children:[t.jsx("button",{type:"button",className:"fdh-arrow","aria-label":r("whatNext.prev"),onClick:()=>i((n-1+a.length)%a.length),children:"‹"}),t.jsxs("em",{children:[n+1,"/",a.length]}),t.jsx("button",{type:"button",className:"fdh-arrow","aria-label":r("whatNext.next"),onClick:()=>i((n+1)%a.length),children:"›"})]})]})}const x=`
/* 🔴 FOTKA + MENO STOJA V STREDE BLOKU (Matej 24. 9., piate kolo: *„foto a meno
   psa by som centroval do stredu bloku takto vedľa seba = posuň to doprava aby
   obsah toho riadku bol na strede"*). Dovtedy boli zarovnané doľava a meno
   naťahovalo zvyšok riadka.
   🔑 Prečo MRIEŽKA a nie \`justify-content: center\`: prepínač psov sa musí držať
   pravého kraja, a ten by dvojicu odtlačil doľava — stred by potom platil len
   pri jedinom psovi. Dva prázdne \`1fr\` stĺpce po krajoch sú vždy rovnaké, takže
   dvojica stojí na strede BLOKU, nie na strede zvyšku po prepínači.
   ⚠️ Preto sa prepínač nesmie prepnúť na \`position: absolute\` — pri dlhom mene
   by sa naň meno nasunulo. Mriežka mu miesto vyhradí. */
.fdh-row {
  display: grid; grid-template-columns: 1fr auto auto 1fr;
  align-items: center; gap: 10px; width: 100%;
}
.fdh-row .fdh-photo { grid-column: 2; }
/* Meno nerastie ani nekrčí susedov — šírku si berie podľa textu a pri dlhom mene
   ustúpi písmom (pravidlo nižšie), nie ellipsis. */
.fdh-row .fdh-name { grid-column: 3; justify-self: start; min-width: 0; }
.fdh-row .fdh-switch { grid-column: 4; justify-self: end; flex: 0 0 auto; }
/* Pri dlhom mene ustúpi PÍSMO, nie posledné písmená — ellipsis v mene psa je
   to najhoršie, čo môže na tejto obrazovke stáť. */
/* Nízke okno (Matejovo PC aj iPhone SE): riadok ustúpi ešte o kúsok — je to
   hlavička, nie ovládací prvok, takže sa zmenšuje ako prvý. */
@media (max-height: 820px) {
  .fdh-photo { width: 28px; height: 28px; }
  .fdh-arrow { width: 26px; height: 26px; font-size: 14px; }
}

/* 🔴 26. 9. 2026 ZMENŠENÉ ZNOVA: 32 px / meno 14 px (Matej: *„môžeš zmenšiť
   foto ako aj priestor, kde je meno psa — prvý údaj v bloku — a zosúladiť to
   v každom kroku, je to zbytočne veľké"*). Jedna hodnota pre všetky kroky;
   obrazovky ju už neprepisujú.
   ⚠️ 40 px, nie 48 (Matej 25. 9.: *„kludne zmenši na pc foto konkretneho psa aj
   meno je celkom velke može to pomoct"*). Riadok stojí na štyroch obrazovkách,
   takže každý ušetrený pixel sa počíta štyrikrát — a práve výška bola dôvod,
   prečo obsah na jeho okne nemal okraje. */
.fdh-photo {
  width: 32px; height: 32px; border-radius: 999px; object-fit: cover; flex: none;
  display: grid; place-items: center;
  /* Vlások, nie obruč: fotka má byť FOTKA. Cloisonné rám ostáva Hektorovi, aby
     bolo na prvý pohľad jasné, kto sa pýta a kto je tvoj pes. */
  border: 1.5px solid rgba(179, 130, 45, 0.55);
  box-shadow: 0 1px 3px rgba(60, 40, 10, 0.22);
}
.fdh-photo--empty {
  background: radial-gradient(circle at 50% 35%, #F7ECD2 0%, #E8D5AA 100%);
  font-family: 'Cinzel', serif; font-size: 16px; color: #8a5a14;
}
/* Meno psa = Cinzel Decorative (brand lock: mená psov na oficiálnych povrchoch). */
.fdh-name {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'Cinzel Decorative', 'Cinzel', serif; font-weight: 700;
  font-size: 14px; letter-spacing: 0.04em; line-height: 1.1;
  color: rgba(35, 22, 8, 0.90); text-shadow: 0 1px 0 rgba(255, 252, 240, 0.70);
  text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.fdh-ok { font-style: normal; font-size: 12px; color: #2E5C3B; }

/* ── PREPÍNAČ PSOV ─────────────────────────────────────────────────────────
   Šípky a počítadlo vedľa mena. Meno nesie riadok sám, takže v prepínači už
   druhýkrát nie je — inak stojí to isté slovo dvakrát vedľa seba. */
.fdh-switch { display: flex; align-items: center; justify-content: center; gap: 10px; }
.fdh-switch em {
  font-family: 'Space Grotesk', sans-serif; font-style: normal; font-size: 12px;
  letter-spacing: 0.10em; color: rgba(60, 40, 12, 0.52);
}
.fdh-arrow {
  flex: none; width: 28px; height: 28px; border-radius: 999px; cursor: pointer;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
  border: 1.5px solid rgba(179, 130, 45, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 252, 240, 0.85), 0 1px 2px rgba(60, 40, 10, 0.10);
  font-family: 'Cinzel', serif; font-size: 16px; line-height: 1; color: #8a5a14;
}

/* Rytina pod riadkom = tá istá drážka ako vlysy pri nadpise: tmavá hrana a
   svetlá pod ňou. Jedna šedá linka by bola čiara v tabuľke, nie zásah do plochy. */
.fdh-rule {
  display: block; width: 100%; height: 2px; border-radius: 1px; flex: none;
  background: linear-gradient(180deg,
    rgba(120, 86, 26, 0.34) 0 1px,
    rgba(255, 252, 240, 0.72) 1px 2px);
}
`;export{x as F,k as a,f as u};
