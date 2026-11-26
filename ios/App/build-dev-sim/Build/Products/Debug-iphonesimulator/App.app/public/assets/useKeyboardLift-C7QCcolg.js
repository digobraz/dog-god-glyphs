import{r as i}from"./index-DriUOdZL.js";import{m as n,k as d}from"./keyboardInset-BtDUCG-L.js";function p(){i.useEffect(()=>{const e=window.visualViewport;if(!e)return;const r=document.documentElement;let s="";const t=()=>{const a=d(),o=`${a}px`;o!==s&&(s=o,r.style.setProperty("--dia-kb",o),n(a>0))};return t(),e.addEventListener("resize",t),e.addEventListener("scroll",t),()=>{e.removeEventListener("resize",t),e.removeEventListener("scroll",t),r.style.removeProperty("--dia-kb"),n(!1)}},[])}const v=(e,r)=>`
@media (max-width:767px){
  .ppu-root.pk-veil:has(.${e}){padding-bottom:var(--dia-kb,0px)}
  .${e}{max-height:calc(${r} - var(--dia-kb,0px))}
}
`;export{v as k,p as u};
