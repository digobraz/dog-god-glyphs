import{j as e}from"./index-B-BQrD2y.js";const c=.72,f=.022;function d({text:r,from:o,bold:i}){let t=0;return e.jsx(e.Fragment,{children:r.split(/( )/).map((a,n)=>a===" "?(t+=1,e.jsx("span",{style:{display:"inline-block",width:"0.3em"}},n)):e.jsx("span",{style:{whiteSpace:"nowrap",display:"inline-block"},children:Array.from(a).map((s,l)=>{const m=t++;return e.jsx("span",{className:`hf-letter${i?" font-bold text-amber-300":""}`,style:{animationDelay:`${(o+m*f).toFixed(3)}s`},children:s},l)})},n))})}const h=`
        @keyframes hf-medin {
          from { opacity: 0; transform: rotate(-190deg) scale(.55); }
          to   { opacity: 1; transform: rotate(0deg) scale(1); }
        }
        .hf-medin { animation: hf-medin ${c}s cubic-bezier(.2,.8,.3,1.05) both; }
        @keyframes hf-letter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hf-letter {
          display: inline-block;
          animation: hf-letter .24s ease-out both;
        }
        /* Kto si vypol pohyb, dostane text a medailón rovno — nie prázdnu
           obrazovku, kým dobehne animácia, ktorá sa nehrá. */
        @media (prefers-reduced-motion: reduce) {
          .hf-medin, .hf-letter { animation: none; opacity: 1; transform: none; }
        }
`;export{h as F,f as L,c as R,d as a};
