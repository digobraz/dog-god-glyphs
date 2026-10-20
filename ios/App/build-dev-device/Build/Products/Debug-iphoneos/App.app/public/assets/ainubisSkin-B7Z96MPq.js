const t="#5BE0F0",a="91,224,240",p="#3B9EFF",r="59,158,255",n="#071019",o="#03070C",i="#F5C73D",d="#E69E1A",x="230,158,26",b="245,199,61",$={cyan:t,cyanRGB:a,glow:p,glowRGB:r,bg:n,bgDeep:o,surfaceBase:`linear-gradient(180deg, ${n} 0%, ${o} 100%)`,surface:`radial-gradient(120% 80% at 50% -10%, rgba(${r},0.16) 0%, rgba(${r},0) 60%),linear-gradient(180deg, ${n} 0%, ${o} 100%)`,raised:`linear-gradient(180deg, rgba(${a},0.07) 0%, rgba(${a},0.03) 100%)`,edge:`rgba(${a},0.30)`,edgeStrong:`rgba(${a},0.55)`,glowEdge:`rgba(${r},0.30)`,glowTint:`rgba(${r},0.08)`,ink:"#E6FAFF",inkDim:"rgba(207,243,250,0.82)",inkFaint:"rgba(207,243,250,0.55)",danger:"#FF8A7A",ok:"#7FD79A",okEdge:"rgba(127,215,154,0.45)",okTint:"rgba(127,215,154,0.14)",dangerEdge:"rgba(255,138,122,0.45)",dangerTint:"rgba(255,138,122,0.12)",panelShadow:`0 20px 60px rgba(0,0,0,0.70), 0 0 0 1px rgba(${a},0.10), 0 0 40px rgba(${r},0.14)`,ctaGrad:`linear-gradient(135deg,${i} 0%,${d} 100%)`,ctaA:i,ctaB:d,ctaRGB:b,ctaEdge:"rgba(245,199,61,0.35)",ctaTint:"rgba(245,199,61,0.10)",ctaGradHover:"linear-gradient(135deg,#FFD65A 0%,#F0A81E 100%)",ctaInk:"#2a1608",ctaShadow:"0 4px 14px -4px rgba(230,158,26,0.55), inset 0 1px 0 rgba(255,255,255,0.30)",aiInk:t,aiShadow:`0 0 16px rgba(${a},0.75)`,faceBg:"radial-gradient(circle at 35% 28%, #12233a 0%, #01050A 74%)",faceRing:`0 0 0 1.5px rgba(${a},0.45), 0 0 16px rgba(${r},0.38)`},c="linear-gradient(180deg,#0A1622 0%,#04080E 100%)",A=`
  border:1px solid transparent;
  background:
    radial-gradient(85% 34% at 50% -4%,rgba(var(--ai-w,${a}),0.30) 0%,transparent 72%) padding-box,
    linear-gradient(180deg,rgba(${a},0.06) 0%,rgba(${a},0.02) 55%,rgba(${a},0) 100%) padding-box,
    ${c} padding-box,
    linear-gradient(180deg,rgba(var(--ai-w,${a}),0.85) 0%,rgba(${a},0.14) 42%,rgba(${a},0.05) 100%) border-box;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.10),
    0 18px 40px -22px rgba(0,0,0,0.90),
    0 0 50px -18px rgba(var(--ai-w,${a}),0.85);
`,h=`
  border:0;color:#04121A;font-weight:500;
  background:linear-gradient(135deg,${t} 0%,${p} 140%);
  box-shadow:0 10px 26px -14px rgba(${a},0.65), inset 0 1px 0 rgba(255,255,255,0.35);
`,l="box-shadow:24px 0 60px -40px rgba(0,0,0,0.90);",e=`var(--ai-w,${a})`,B={edge:`rgba(${e},0.45)`,ring:`0 0 0 1px rgba(${e},0.45),0 0 24px rgba(${e},0.16)`,float:`0 0 24px rgba(${e},0.14),0 8px 16px ${n}`},w=`
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.10),
    0 0 0 1px rgba(${a},0.35), 0 0 28px -10px rgba(${a},0.55);
`,_=`
  background:linear-gradient(160deg,rgba(${a},0.30),rgba(${r},0.10));
  box-shadow:inset -1px 0 0 rgba(255,255,255,0.10), inset 1px 0 0 rgba(0,0,0,0.35);
`,u=`
  position:relative;padding-left:16px;border:0;background:transparent;
`,k=`
  content:'';position:absolute;left:0;top:2px;bottom:2px;width:2px;border-radius:999px;
  background:linear-gradient(180deg,${t},rgba(${a},0.05));
  box-shadow:0 0 12px rgba(${a},0.60);
`,I=`
  background:linear-gradient(180deg,${i},rgba(${b},0.05));
  box-shadow:0 0 12px rgba(${b},0.45);
`,E=`
@keyframes aiBreathe{
  0%,100%{box-shadow:inset 0 1px 0 rgba(255,255,255,0.10),0 18px 40px -22px rgba(0,0,0,0.90),
    0 0 44px -20px rgba(var(--ai-w,${a}),0.58);}
  50%{box-shadow:inset 0 1px 0 rgba(255,255,255,0.14),0 18px 40px -22px rgba(0,0,0,0.90),
    0 0 58px -12px rgba(var(--ai-w,${a}),0.92);}
}
.ai-breathe{animation:aiBreathe 6s ease-in-out infinite;}
@media (prefers-reduced-motion:reduce){.ai-breathe{animation:none;}}

/* Tá istá vec na jeho TVÁRI — tam, kde karta patrí človeku a dýchať nemá čo.
   Prstenec okolo hlavy, nie kus obsahu. Toto je „centrála, ktorá dýcha": jeden
   bod na obrazovke, ktorý sa hýbe, a nič iné. */
@keyframes aiBreatheFace{
  0%,100%{box-shadow:0 0 0 1.5px rgba(${a},0.40), 0 0 12px rgba(${r},0.28);}
  50%{box-shadow:0 0 0 1.5px rgba(${a},0.60), 0 0 20px rgba(${r},0.50);}
}
.ai-breathe-face{animation:aiBreatheFace 6s ease-in-out infinite;}
@media (prefers-reduced-motion:reduce){.ai-breathe-face{animation:none;}}
`,s={problems:"232,126,142",training:"255,190,140",prevention:"61,184,98",understanding:"0,120,240",dogsPath:"193,104,253",anatomy:"134,148,255",nutrition:"186,224,116"},F=g=>g&&s[g]?{"--ai-w":s[g]}:{},R={untouched:r,untouchedHi:a,seen:x,read:"92,190,120"};export{$ as A,R as B,s as W,A as a,E as b,h as c,k as d,w as e,B as f,u as g,I as h,_ as i,F as j,l as k};
